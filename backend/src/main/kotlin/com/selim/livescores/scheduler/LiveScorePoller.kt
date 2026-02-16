package com.selim.livescores.scheduler

import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.repository.redis.EventDedupStore
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

import java.time.Duration
import java.time.Instant
import java.util.concurrent.atomic.AtomicInteger

/**
 * Polls SofaScore and updates Redis + pushes SSE.
 *
 * Strategy (starter plan 14,500 req/day):
 * - live matches every 60s
 * - events for live matches every 90s
 */
@Component
class LiveScorePoller(
    private val api: LiveScoreApiClient,
    private val matchService: MatchService,
    private val dedup: EventDedupStore,
) {

    private val eventsCursor = AtomicInteger(0)

    @Volatile private var apiDisabledUntil: Instant? = null
    @Volatile private var apiDisabledReason: String? = null

    private fun isApiDisabled(now: Instant = Instant.now()): Boolean {
        val until = apiDisabledUntil ?: return false
        return now.isBefore(until)
    }

    private fun disableApiFor(duration: Duration, reason: String) {
        apiDisabledUntil = Instant.now().plus(duration)
        apiDisabledReason = reason
    }

    private fun clearApiDisable() {
        apiDisabledUntil = null
        apiDisabledReason = null
    }

    private inline fun <T> guardedApiCall(block: () -> T): T? {
        if (isApiDisabled()) return null
        return try {
            val res = block()
            // If we succeed after a previous disable, clear it.
            if (apiDisabledUntil != null) clearApiDisable()
            res
        } catch (e: LiveScoreApiClient.QuotaExceededException) {
            // When the provider says quota exceeded, stop hitting it for a while.
            disableApiFor(Duration.ofHours(6), "quota_exceeded")
            null
        } catch (e: org.springframework.web.client.HttpClientErrorException.Unauthorized) {
            // Bad key/secret or access not enabled. Pause long to avoid hammering.
            disableApiFor(Duration.ofHours(24), "unauthorized")
            null
        } catch (e: Exception) {
            // Network / parsing / transient errors: short pause.
            disableApiFor(Duration.ofMinutes(5), "transient_error")
            null
        }
    }

    private fun stableEventKey(matchKey: String, e: MatchEvent): String =
        listOf(matchKey, e.time, e.event, e.homeAway)
            .joinToString(separator = "|") { keyPart(it) }

    private fun keyPart(value: String?): String = (value ?: "").trim().lowercase()

    private fun hasSameEventInState(state: MatchState, matchKey: String, stableId: String): Boolean =
        state.lastEvents.any { stableEventKey(matchKey, it) == stableId }

    private fun isUpgrade(state: MatchState, matchKey: String, stableId: String, incoming: MatchEvent): Boolean =
        state.lastEvents.any {
            stableEventKey(matchKey, it) == stableId &&
                it.player.isNullOrBlank() &&
                !incoming.player.isNullOrBlank()
        }

    private fun shouldAcceptEvent(
        state: MatchState,
        matchKey: String,
        stableId: String,
        incoming: MatchEvent,
        isNewByDedup: Boolean
    ): Boolean {
        val hasSame = hasSameEventInState(state, matchKey, stableId)
        val isUpgrade = isUpgrade(state, matchKey, stableId, incoming)
        return isNewByDedup || !hasSame || isUpgrade
    }

    private fun <T> List<T>.chunkFromCursor(max: Int): List<T> {
        if (this.isEmpty()) return emptyList()
        if (max <= 0) return emptyList()
        val start = (eventsCursor.getAndIncrement() % this.size).coerceAtLeast(0)
        val end = (start + max).coerceAtMost(this.size)
        return if (start < end) this.subList(start, end) else this.take(max)
    }

    private fun refreshFinishedEvents(state: MatchState) {
        val providerId = state.id ?: return
        val events = guardedApiCall { api.getMatchEvents(providerId) } ?: return
        val filtered = events.filter { !it.event.isNullOrBlank() && it.event != "." }
        matchService.replaceEvents(state.matchKey, filtered)
    }

    @Scheduled(fixedDelay = 60_000)
    fun pollLiveMatches() {
        val previousLiveKeys = matchService.getLiveMatchKeys()
        val previousBoardKeys = matchService.getBoardMatchKeys()

        val providerMatches = guardedApiCall { api.getLiveMatches() }
            ?.map { matchService.normalizeForKeys(it, previousBoardKeys) }
            ?: return

        // Live = à poller (events), Finished = à afficher sans polling
        val liveMatches = providerMatches.filter { MatchStatus.isLive(it.status) }
        val finishedMatches = providerMatches.filter { MatchStatus.isFinished(it.status) }

        fun String?.ok() = !this.isNullOrBlank()

        val newLiveKeys = liveMatches.map { it.matchKey }.filter { it.ok() }.distinct()
        val newFinishedKeys = finishedMatches.map { it.matchKey }.filter { it.ok() }.distinct()

        // Si aucun match renvoyé du provider => on freeze les anciens live (FT) mais on garde le board
        if (newLiveKeys.isEmpty() && newFinishedKeys.isEmpty()) {
            previousLiveKeys.forEach { matchService.markAsFinished(it) }
            matchService.replaceLiveMatchKeys(emptyList())
            // ne pas vider le board : on garde l’existant
            matchService.publishLiveBoard()
            return
        }

        // Upsert les live + finished (important: score final + status)
        liveMatches.forEach { matchService.upsertFromProvider(it, previousBoardKeys) }
        finishedMatches.forEach { match ->
            val updated = matchService.upsertFromProvider(match, previousBoardKeys)
            // Always refresh final events for finished matches to avoid stale scorers/cards from older live snapshots.
            refreshFinishedEvents(updated)
        }

        // Mettre à jour les live keys (pour pollEvents)
        matchService.replaceLiveMatchKeys(newLiveKeys)

        // Si un match était live avant mais n’est plus live maintenant => freeze FT
        val disappearedFromLive = previousLiveKeys.filter { it !in newLiveKeys.toSet() }
        disappearedFromLive.forEach {
            val updated = matchService.markAsFinished(it)
            if (updated != null) {
                refreshFinishedEvents(updated)
            }
        }

        // Normaliser ceux explicitement FINISHED (au cas où)
        newFinishedKeys.forEach { matchService.markAsFinished(it) }

        // Construire board keys: live + finished + anciens board + nouveaux finis
        val boardKeys = (newLiveKeys + newFinishedKeys + previousBoardKeys + disappearedFromLive).distinct()
        matchService.replaceBoardMatchKeys(boardKeys)

        matchService.publishLiveBoard()
    }

    @Scheduled(fixedDelay = 60_000)
    fun pollEvents() {
        val liveMatches = matchService.getLiveMatches()
            .filter { MatchStatus.isLive(it.status) }

        if (liveMatches.isEmpty()) return
        if (isApiDisabled()) return

        // ✅ Optimization: do not poll events for ALL live matches every tick.
        // Pick a rotating slice to reduce requests and smooth quota usage.
        // Target: every live match gets polled about every ~5 minutes (cap to avoid spikes).
        val maxPerTick = ((liveMatches.size + 4) / 5).coerceIn(8, 20)
        val toPoll = liveMatches.chunkFromCursor(max = minOf(liveMatches.size, maxPerTick))

        var anyUpdate = false

        toPoll.forEach { state ->
            val providerId = state.id ?: return@forEach

            val providerEvents = guardedApiCall { api.getMatchEvents(providerId) } ?: return@forEach

            val matchKey = state.matchKey
            val newEvents = mutableListOf<MatchEvent>()

            providerEvents
                .filter { !it.event.isNullOrBlank() && it.event != "." }
                .forEach { e ->
                    // Provider `id` is not stable between polls; use a composite stable key.
                    // Important: do NOT include player name in the stable key, because provider may first send "" then later send the real name.
                    val stableId = stableEventKey(matchKey, e)

                    // 🔧 Prod fix: our Redis dedup store can get out of sync with the match state (different TTLs / restarts),
                    // and it also blocks "enrichment" updates (player empty -> player name later).
                    // Allow the event through if:
                    //  - it's new according to dedup OR
                    //  - the current state doesn't contain this event yet (dedup desync) OR
                    //  - the current state has the same event but with blank player, and the provider now sends a player name (upgrade).
                    val isNewByDedup = dedup.isNew(matchKey, stableId)

                    if (!shouldAcceptEvent(state, matchKey, stableId, e, isNewByDedup)) return@forEach

                    newEvents.add(e)
                }

            if (newEvents.isNotEmpty()) {
                matchService.appendEvents(matchKey, newEvents)
                anyUpdate = true
            }
        }

        if (anyUpdate) {
            matchService.publishLiveBoard()
        }
    }

}
