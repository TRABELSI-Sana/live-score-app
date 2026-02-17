package com.selim.livescores.service

import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.repository.redis.BoardMatchesStore
import com.selim.livescores.repository.redis.LiveMatchesStore
import com.selim.livescores.repository.redis.MatchStateStore
import com.selim.livescores.sse.SseEvents
import com.selim.livescores.sse.SseHub
import com.selim.livescores.sse.SseTopics
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class MatchService(
    private val matchStateStore: MatchStateStore,
    private val liveMatchesStore: LiveMatchesStore,
    private val boardMatchesStore: BoardMatchesStore,
    private val sseHub: SseHub,
    private val standingsService: StandingsService
) {
    companion object {
        private const val KEEP_LAST_EVENTS = 30
    }

    fun getLiveMatches(): List<MatchState> =
        liveMatchesStore.getAll()
            .mapNotNull(matchStateStore::get)
            .sortedBy { it.scheduled.orEmpty() }

    fun getLiveMatchKeys(): List<String> = liveMatchesStore.getAll().toList()

    fun getBoardMatches(): List<MatchState> {
        val today = LocalDate.now().toString()
        return getBoardMatchKeys()
            .mapNotNull(matchStateStore::get)
            .filter { state ->
                state.status != MatchStatus.NOT_STARTED ||
                    state.fixtureDate.isNullOrBlank() ||
                    state.fixtureDate?.trim() == today
            }
            .sortedWith(compareBy({ it.competition?.name.orEmpty() }, { it.scheduled.orEmpty() }))
    }

    fun getBoardMatchKeys(): List<String> = boardMatchesStore.getAll()

    fun replaceBoardMatchKeys(keys: List<String>) {
        boardMatchesStore.replaceAll(keys)
    }

    fun markAsFinished(matchKey: String): MatchState? {
        val current = matchStateStore.get(matchKey) ?: return null
        if (current.status == MatchStatus.FINISHED) return current

        val updated = current.copy(status = MatchStatus.FINISHED, time = "FT")
        matchStateStore.put(updated)
        sseHub.publish(matchKey, SseEvents.STATE, updated)
        return updated
    }

    fun getOrInitState(matchKey: String): MatchState {
        matchStateStore.get(matchKey)?.let { return it }

        return MatchState(
            id = matchKey.removePrefix("ls-").toLongOrNull(),
            scheduled = null,
            status = MatchStatus.UNKNOWN,
            time = null,
            competition = null,
            home = null,
            away = null,
            scores = null,
            lastEvents = emptyList()
        ).also(matchStateStore::put)
    }

    fun upsertFromProvider(providerMatch: MatchState, boardKeysHint: List<String>? = null): MatchState {
        val normalized = normalizeProviderMatch(providerMatch, boardKeysHint)
        val current = matchStateStore.get(normalized.matchKey)

        val merged = normalized.copy(
            lastEvents = when {
                current == null -> providerMatch.lastEvents
                current.lastEvents.isEmpty() && providerMatch.lastEvents.isNotEmpty() -> providerMatch.lastEvents
                else -> current.lastEvents
            }
        )

        if (current?.scores != merged.scores) {
            merged.competition?.id?.let(standingsService::invalidateCompetition)
        }

        matchStateStore.put(merged)
        sseHub.publish(merged.matchKey, SseEvents.STATE, merged)
        return merged
    }

    private fun normalizeProviderMatch(providerMatch: MatchState, boardKeysHint: List<String>? = null): MatchState {
        if (providerMatch.fixtureId != null) return providerMatch.withNormalizedStatus()

        val compId = providerMatch.competition?.id
        val homeId = providerMatch.home?.id
        val awayId = providerMatch.away?.id
        val scheduled = providerMatch.scheduled?.trim()

        if (compId == null || homeId == null || awayId == null || scheduled.isNullOrBlank()) {
            return providerMatch.withNormalizedStatus()
        }

        val existing = (boardKeysHint ?: getBoardMatchKeys())
            .asSequence()
            .mapNotNull(matchStateStore::get)
            .firstOrNull { state ->
                state.fixtureId != null &&
                    state.competition?.id == compId &&
                    state.home?.id == homeId &&
                    state.away?.id == awayId &&
                    state.scheduled?.trim() == scheduled
            }

        return if (existing?.fixtureId != null) {
            providerMatch.copy(
                fixtureId = existing.fixtureId,
                fixtureDate = existing.fixtureDate
            ).withNormalizedStatus()
        } else {
            providerMatch.withNormalizedStatus()
        }
    }

    fun replaceEvents(matchKey: String, events: List<MatchEvent>): MatchState {
        val current = getOrInitState(matchKey)
        if (events.isEmpty()) return current

        val mergedEvents = EventDeduplicator(matchKey).merge(
            current = current.lastEvents,
            incoming = events,
            keepLast = KEEP_LAST_EVENTS
        )
        if (mergedEvents == current.lastEvents) return current

        val updated = current.copy(lastEvents = mergedEvents)
        matchStateStore.put(updated)
        sseHub.publish(matchKey, SseEvents.STATE, updated)
        return updated
    }

    fun replaceLiveMatchKeys(matchKeys: List<String>) {
        liveMatchesStore.replaceAll(matchKeys)
    }

    fun publishLiveBoard() {
        val board = getBoardMatches().ifEmpty(::getLiveMatches)
        sseHub.publish(SseTopics.LIVE_BOARD, SseEvents.LIVE, board)
    }

    private fun MatchState.withNormalizedStatus(): MatchState =
        copy(status = MatchStatus.normalize(status))
}
