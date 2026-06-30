package com.selim.livescores.provider.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode
import com.selim.livescores.domain.Competition
import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.domain.Scores
import com.selim.livescores.domain.Team

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
        val score = if (goals?.home != null && goals.away != null)
            "${goals.home} - ${goals.away}" else ""

        val date = fixtureData?.date?.take(10)
        return MatchState(
            id = fixtureData?.id,
            fixtureId = fixtureData?.id,
            fixtureDate = date,
            scheduled = fixtureData?.date,
            status = MatchStatus.normalize(fixtureData?.status?.short ?: defaultStatus),
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
    val assist: ApiFootballEventPlayer? = null,
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

        val resolvedPlayer = listOfNotNull(player?.name, assist?.name)
            .asSequence()
            .map { it.trim() }
            .firstOrNull { candidate -> isUsablePlayerName(candidate, minute) }

        return MatchEvent(
            id = listOf(fixtureId.toString(), elapsed?.toString() ?: "", type ?: "", player?.id?.toString() ?: "").joinToString("-"),
            event = eventType,
            time = minute,
            player = resolvedPlayer,
            homeAway = side,
            matchId = fixtureId.toString()
        )
    }

    companion object {
        private val MINUTE_LIKE_REGEX = Regex("^\\d{1,3}(?:\\+\\d{1,2})?$")
    }

    private fun isUsablePlayerName(candidate: String, minute: String?): Boolean {
        if (candidate.isBlank()) return false
        val normalizedCandidate = candidate.replace("'", "").trim()
        if (MINUTE_LIKE_REGEX.matches(normalizedCandidate)) return false

        val normalizedMinute = (minute ?: "").replace("'", "").trim()
        if (normalizedMinute.isNotBlank() && normalizedCandidate == normalizedMinute) return false

        return true
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
