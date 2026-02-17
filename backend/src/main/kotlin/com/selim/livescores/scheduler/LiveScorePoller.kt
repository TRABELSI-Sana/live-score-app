package com.selim.livescores.scheduler

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.domain.Competition
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
            previousLiveKeys.forEach { matchService.markAsFinished(it) }
            matchService.replaceLiveMatchKeys(emptyList())
            matchService.publishLiveBoard()
            return
        }

        liveMatches.forEach { matchService.upsertFromProvider(it, previousBoardKeys) }
        finishedMatches.forEach { matchService.upsertFromProvider(it, previousBoardKeys) }

        matchService.replaceLiveMatchKeys(newLiveKeys)

        val disappearedFromLive = previousLiveKeys.filter { it !in newLiveKeys.toSet() }
        disappearedFromLive.forEach { matchService.markAsFinished(it) }

        val boardKeys = (newLiveKeys + newFinishedKeys + previousBoardKeys + disappearedFromLive).distinct()
        matchService.replaceBoardMatchKeys(boardKeys)

        matchService.publishLiveBoard()
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixturesResponse(
    val response: List<ApiFootballFixtureWrapper> = emptyList()
)

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

fun mapApiStatus(short: String?): String {
    return when ((short ?: "").trim().uppercase()) {
        "NS", "TBD" -> MatchStatus.NOT_STARTED
        "1H", "2H", "ET", "LIVE" -> MatchStatus.IN_PLAY
        "HT", "BT" -> MatchStatus.HALF_TIME_BREAK
        "P", "SUSP", "INT" -> MatchStatus.ADDED_TIME
        "FT", "AET", "PEN" -> MatchStatus.FINISHED
        else -> MatchStatus.normalize(short)
    }
}
