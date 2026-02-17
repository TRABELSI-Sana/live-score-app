package com.selim.livescores.scheduler

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.domain.Competition
import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.domain.Scores
import com.selim.livescores.domain.Team
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.Instant

@Component
class LiveScorePoller(
    private val api: LiveScoreApiClient,
    private val objectMapper: ObjectMapper,
    private val matchService: MatchService,
) {

    @Volatile private var apiDisabledUntil: Instant? = null

    private fun isApiDisabled(now: Instant = Instant.now()): Boolean {
        val until = apiDisabledUntil ?: return false
        return now.isBefore(until)
    }

    private fun disableApiFor(duration: Duration) {
        apiDisabledUntil = Instant.now().plus(duration)
    }

    private fun clearApiDisable() {
        apiDisabledUntil = null
    }

    private inline fun <T> guardedApiCall(block: () -> T): T? {
        if (isApiDisabled()) return null
        return try {
            val res = block()
            if (apiDisabledUntil != null) clearApiDisable()
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

        liveMatches.forEach { matchService.upsertFromProvider(it, previousBoardKeys) }
        finishedMatches.forEach {
            val updated = matchService.upsertFromProvider(it, previousBoardKeys)
            refreshEventsForMatch(updated)
        }

        matchService.replaceLiveMatchKeys(newLiveKeys)

        val disappearedFromLive = previousLiveKeys.filter { it !in newLiveKeys.toSet() }
        disappearedFromLive.forEach {
            val finished = matchService.markAsFinished(it)
            if (finished != null) refreshEventsForMatch(finished)
        }

        val boardKeys = (newLiveKeys + newFinishedKeys + previousBoardKeys + disappearedFromLive).distinct()
        matchService.replaceBoardMatchKeys(boardKeys)

        matchService.publishLiveBoard()
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixturesResponse(
    val response: List<ApiFootballFixtureWrapper> = emptyList(),
    val errors: JsonNode? = null,
    val results: Int? = null
) {
    fun hasTokenError(): Boolean = errors?.path("token")?.isMissingNode == false
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixtureWrapper(
    val fixture: ApiFootballFixture? = null,
    val league: ApiFootballLeague? = null,
    val teams: ApiFootballTeams? = null,
    val goals: ApiFootballGoals? = null
) {
    fun toMatchState(defaultStatus: String? = null): MatchState {
        val fixtureData = fixture
        val score = listOf(goals?.home, goals?.away).all { it != null }
            .let { hasBoth -> if (hasBoth) "${goals?.home} - ${goals?.away}" else "" }

        val date = fixtureData?.date?.take(10)
        return MatchState(
            id = fixtureData?.id,
            fixtureId = fixtureData?.id,
            fixtureDate = date,
            scheduled = fixtureData?.date,
            status = mapApiStatus(fixtureData?.status?.short ?: defaultStatus),
            time = fixtureData?.status?.elapsed?.toString(),
            competition = Competition(
                id = league?.id,
                name = league?.name,
                country = league?.country
            ),
            home = Team(teams?.home?.id, teams?.home?.name, teams?.home?.logo),
            away = Team(teams?.away?.id, teams?.away?.name, teams?.away?.logo),
            scores = Scores(score = score),
            lastEvents = emptyList()
        )
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixture(
    val id: Long? = null,
    val date: String? = null,
    val status: ApiFootballFixtureStatus? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixtureStatus(
    val short: String? = null,
    val elapsed: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballLeague(
    val id: Long? = null,
    val name: String? = null,
    val country: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballTeams(
    val home: ApiFootballTeam? = null,
    val away: ApiFootballTeam? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballTeam(
    val id: Long? = null,
    val name: String? = null,
    val logo: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballGoals(
    val home: Int? = null,
    val away: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixtureEventsResponse(
    val response: List<ApiFootballFixtureEvent> = emptyList(),
    val errors: JsonNode? = null
) {
    fun hasTokenError(): Boolean = errors?.path("token")?.isMissingNode == false
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixtureEvent(
    val time: ApiFootballEventTime? = null,
    val team: ApiFootballEventTeam? = null,
    val player: ApiFootballEventPlayer? = null,
    val type: String? = null,
    val detail: String? = null,
) {
    fun toMatchEvent(fixtureId: Long, homeTeamId: Long?, awayTeamId: Long?): MatchEvent {
        val elapsed = time?.elapsed
        val extra = time?.extra
        val minute = when {
            elapsed == null -> null
            extra == null || extra <= 0 -> elapsed.toString()
            else -> "$elapsed+$extra"
        }

        val side = when (team?.id) {
            homeTeamId -> "h"
            awayTeamId -> "a"
            else -> null
        }

        val eventType = (detail ?: type ?: "EVENT").trim().replace(' ', '_').uppercase()

        return MatchEvent(
            id = listOf(fixtureId.toString(), elapsed?.toString() ?: "", type ?: "", player?.id?.toString() ?: "").joinToString("-"),
            event = eventType,
            time = minute,
            player = player?.name,
            homeAway = side,
            matchId = fixtureId.toString()
        )
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballEventTime(
    val elapsed: Int? = null,
    val extra: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballEventTeam(
    val id: Long? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballEventPlayer(
    val id: Long? = null,
    val name: String? = null
)

fun mapApiStatus(short: String?): String {
    return when ((short ?: "").trim().uppercase()) {
        "NS", "TBD", "PST" -> MatchStatus.NOT_STARTED
        "1H", "2H", "ET", "LIVE" -> MatchStatus.IN_PLAY
        "HT", "BT" -> MatchStatus.HALF_TIME_BREAK
        "P", "SUSP", "INT" -> MatchStatus.ADDED_TIME
        "FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO" -> MatchStatus.FINISHED
        else -> MatchStatus.normalize(short)
    }
}
