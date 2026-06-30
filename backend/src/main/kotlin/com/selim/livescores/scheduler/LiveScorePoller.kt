package com.selim.livescores.scheduler

import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.provider.dto.ApiFootballFixtureEventsResponse
import com.selim.livescores.provider.dto.ApiFootballFixturesResponse
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.Instant
import java.util.concurrent.atomic.AtomicReference

@Component
class LiveScorePoller(
    private val api: LiveScoreApiClient,
    private val objectMapper: ObjectMapper,
    private val matchService: MatchService,
) {

    private val apiDisabledUntil = AtomicReference<Instant?>(null)

    private fun isApiDisabled(now: Instant = Instant.now()): Boolean {
        val until = apiDisabledUntil.get() ?: return false
        return now.isBefore(until)
    }

    private fun disableApiFor(duration: Duration) {
        apiDisabledUntil.set(Instant.now().plus(duration))
    }

    private fun clearApiDisable() {
        apiDisabledUntil.set(null)
    }

    private inline fun <T> guardedApiCall(block: () -> T): T? {
        if (isApiDisabled()) return null
        return try {
            val res = block()
            if (apiDisabledUntil.get() != null) clearApiDisable()
            res
        } catch (_: LiveScoreApiClient.QuotaExceededException) {
            disableApiFor(Duration.ofHours(8))
            null
        } catch (_: org.springframework.web.client.HttpClientErrorException.Unauthorized) {
            disableApiFor(Duration.ofHours(24))
            null
        } catch (_: Exception) {
            disableApiFor(Duration.ofMinutes(5))
            null
        }
    }

    private fun refreshEventsForMatch(state: MatchState) {
        val fixtureId = state.fixtureId ?: state.id ?: return
        val json = guardedApiCall { api.getFixtureEventsJson(fixtureId) } ?: return
        val resp = try {
            objectMapper.readValue(json, ApiFootballFixtureEventsResponse::class.java)
        } catch (_: Exception) {
            return
        }
        if (resp.hasTokenError()) {
            disableApiFor(Duration.ofHours(24))
            return
        }

        val homeId = state.home?.id
        val awayId = state.away?.id
        val mapped = resp.response.map { it.toMatchEvent(fixtureId, homeId, awayId) }
        matchService.replaceEvents(state.matchKey, mapped)
    }

    @Scheduled(fixedDelay = 60_000)
    fun pollLiveMatches() {
        val previousLiveKeys = matchService.getLiveMatchKeys()
        val previousBoardKeys = matchService.getBoardMatchKeys()

        val json = guardedApiCall { api.getLiveMatchesJson() } ?: return
        val resp = try {
            objectMapper.readValue(json, ApiFootballFixturesResponse::class.java)
        } catch (_: Exception) {
            disableApiFor(Duration.ofMinutes(10))
            return
        }

        if (resp.hasTokenError()) {
            disableApiFor(Duration.ofHours(24))
            return
        }

        val allowedCompetitions = api.competitionIdsList().toSet()
        val providerMatches = resp.response
            .asSequence()
            .filter { allowedCompetitions.isEmpty() || (it.league?.id?.toInt() in allowedCompetitions) }
            .map { it.toMatchState() }
            .toList()

        val liveMatches = providerMatches.filter { MatchStatus.isLive(it.status) }
        val finishedMatches = providerMatches.filter { MatchStatus.isFinished(it.status) }

        val newLiveKeys = liveMatches.map { it.matchKey }.distinct()
        val newFinishedKeys = finishedMatches.map { it.matchKey }.distinct()

        if (newLiveKeys.isEmpty() && newFinishedKeys.isEmpty()) {
            previousLiveKeys.forEach {
                val finished = matchService.markAsFinished(it)
                if (finished != null) refreshEventsForMatch(finished)
            }
            matchService.replaceLiveMatchKeys(emptyList())
            matchService.publishLiveBoard()
            return
        }

        liveMatches.forEach {
            val updated = matchService.upsertFromProvider(it, previousBoardKeys)
            refreshEventsForMatch(updated)
        }
        finishedMatches.forEach {
            val updated = matchService.upsertFromProvider(it, previousBoardKeys)
            refreshEventsForMatch(updated)
        }

        matchService.replaceLiveMatchKeys(newLiveKeys)

        val newLiveKeysSet = newLiveKeys.toHashSet()
        val disappearedFromLive = previousLiveKeys.filter { it !in newLiveKeysSet }
        disappearedFromLive.forEach {
            val finished = matchService.markAsFinished(it)
            if (finished != null) refreshEventsForMatch(finished)
        }

        val boardKeys = (newLiveKeys + newFinishedKeys + previousBoardKeys + disappearedFromLive).distinct()
        matchService.replaceBoardMatchKeys(boardKeys)

        matchService.publishLiveBoard()
    }
}
