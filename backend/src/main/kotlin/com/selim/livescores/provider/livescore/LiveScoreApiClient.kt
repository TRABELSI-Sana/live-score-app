package com.selim.livescores.provider.livescore

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.domain.Competition
import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.domain.Scores
import com.selim.livescores.domain.Team
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

@Component
class LiveScoreApiClient(
    @Value("\${sofascore.base-url:https://api.sofascore.com}") private val baseUrl: String,
    @Value("\${sofascore.tournaments:}") private val tournaments: String,
    @Value("\${sofascore.standings-mapping:}") private val standingsMapping: String,
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
    @Value("\${livescore.quota-per-day:14500}") private val quotaPerDay: Long
) {

    // SofaScore endpoints utilisés:
    // - /api/v1/sport/football/scheduled-events/{yyyy-MM-dd}
    // - /api/v1/sport/football/events/live
    // - /api/v1/event/{eventId}/incidents
    // - /api/v1/tournament/{tournamentId}/season/{seasonId}/standings/total
    private val client = RestClient.builder()
        .baseUrl(baseUrl)
        .build()

    fun getFixturesToday(competitionId: Int): List<MatchState> {
        if (!tryConsumeQuota()) throw QuotaExceededException()

        val uri = "/api/v1/sport/football/scheduled-events/${LocalDate.now(ZoneId.of("UTC"))}"
        val response = client.get().uri(uri).retrieve().body(String::class.java)
            ?.let { objectMapper.readValue(it, SofaScheduledEventsResponse::class.java) }
            ?: return emptyList()

        return response.events
            .asSequence()
            .filter { it.tournament?.id == competitionId.toLong() }
            .map { toMatchState(it, forceNotStarted = true) }
            .toList()
    }

    fun getLiveMatches(): List<MatchState> {
        if (!tryConsumeQuota()) throw QuotaExceededException()

        val uri = "/api/v1/sport/football/events/live"
        val response = client.get().uri(uri).retrieve().body(String::class.java)
            ?.let { objectMapper.readValue(it, SofaLiveEventsResponse::class.java) }
            ?: return emptyList()

        return response.events
            .asSequence()
            .filter { eventBelongsToConfiguredCompetitions(it) }
            .map { toMatchState(it) }
            .toList()
    }

    fun getMatchEvents(matchId: Long): List<MatchEvent> {
        if (!tryConsumeQuota()) throw QuotaExceededException()

        val uri = "/api/v1/event/$matchId/incidents"
        val response = client.get().uri(uri).retrieve().body(String::class.java)
            ?.let { objectMapper.readValue(it, SofaIncidentsResponse::class.java) }
            ?: return emptyList()

        return response.incidents
            .asSequence()
            .mapNotNull { toMatchEvent(matchId, it) }
            .toList()
    }

    fun getCompetitionTableJson(competitionId: Int): String {
        val seasonId = standingsSeasonFor(competitionId)
            ?: throw IllegalArgumentException("Missing sofascore season mapping for competitionId=$competitionId")

        val uri = "/api/v1/tournament/$competitionId/season/$seasonId/standings/total"
        if (!tryConsumeQuota()) throw QuotaExceededException()
        return client.get().uri(uri).retrieve().body(String::class.java)!!
    }

    fun competitionIdsList(): List<Int> =
        configuredCompetitionIds().mapNotNull { it.toIntOrNull() }

    private fun configuredCompetitionIds(): Set<String> {
        val fromTournaments = tournaments
            .split(",")
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .toSet()

        if (fromTournaments.isNotEmpty()) return fromTournaments

        return standingsMapping
            .split(",")
            .map { it.trim() }
            .mapNotNull { entry -> entry.substringBefore(':', missingDelimiterValue = "").takeIf { it.isNotBlank() } }
            .toSet()
    }

    private fun standingsSeasonFor(competitionId: Int): Long? =
        standingsMapping
            .split(",")
            .map { it.trim() }
            .mapNotNull { entry ->
                val tournamentId = entry.substringBefore(':').trim().toIntOrNull() ?: return@mapNotNull null
                val seasonId = entry.substringAfter(':', "").trim().toLongOrNull() ?: return@mapNotNull null
                tournamentId to seasonId
            }
            .firstOrNull { it.first == competitionId }
            ?.second

    private fun eventBelongsToConfiguredCompetitions(event: SofaEvent): Boolean {
        val configured = configuredCompetitionIds()
        if (configured.isEmpty()) return true
        val tournamentId = event.tournament?.id?.toString() ?: return false
        return tournamentId in configured
    }

    private fun toMatchState(event: SofaEvent, forceNotStarted: Boolean = false): MatchState {
        val statusType = event.status?.type.orEmpty()
        val statusDescription = event.status?.description.orEmpty()

        val mappedStatus = if (forceNotStarted) MatchStatus.NOT_STARTED else mapStatus(statusType, statusDescription)

        val homeScore = event.homeScore?.current ?: 0
        val awayScore = event.awayScore?.current ?: 0
        val startTimestamp = event.startTimestamp ?: 0L

        return MatchState(
            id = event.id,
            fixtureId = event.id,
            fixtureDate = epochToDate(startTimestamp),
            scheduled = epochToHHmm(startTimestamp),
            status = mappedStatus,
            time = mapTimeLabel(statusType, event),
            competition = Competition(
                id = event.tournament?.id,
                name = event.tournament?.name,
                country = event.tournament?.category?.name
            ),
            home = Team(
                id = event.homeTeam?.id,
                name = event.homeTeam?.name,
                logo = null
            ),
            away = Team(
                id = event.awayTeam?.id,
                name = event.awayTeam?.name,
                logo = null
            ),
            scores = Scores(score = "$homeScore - $awayScore")
        )
    }

    private fun toMatchEvent(matchId: Long, incident: SofaIncident): MatchEvent? {
        val incidentType = incident.incidentType?.trim().orEmpty()
        if (incidentType.isBlank()) return null

        val eventCode = when (incidentType.lowercase()) {
            "goal" -> "GOAL"
            "card" -> when (incident.incidentClass?.lowercase()) {
                "yellow" -> "YELLOW_CARD"
                "red" -> "RED_CARD"
                else -> "CARD"
            }
            "period" -> return null
            "substitution" -> "SUBSTITUTION"
            else -> incidentType.uppercase()
        }

        val minute = incident.time
        val added = incident.addedTime ?: 0
        val minuteText = when {
            minute == null || minute < 0 -> null
            added > 0 -> "$minute+$added"
            else -> minute.toString()
        }

        return MatchEvent(
            id = incident.id?.toString(),
            event = eventCode,
            time = minuteText,
            player = incident.player?.name,
            homeAway = if (incident.isHome == true) "h" else "a",
            matchId = matchId.toString()
        )
    }

    private fun mapStatus(statusType: String, description: String): String = when (statusType.lowercase()) {
        "notstarted" -> MatchStatus.NOT_STARTED
        "inprogress" -> MatchStatus.IN_PLAY
        "finished", "afterpenalties", "afterextratime" -> MatchStatus.FINISHED
        "halftime" -> MatchStatus.HALF_TIME_BREAK
        else -> MatchStatus.normalize(description)
    }

    private fun mapTimeLabel(statusType: String, event: SofaEvent): String? {
        if (statusType.equals("finished", ignoreCase = true)) return "FT"

        val periodStart = event.time?.currentPeriodStartTimestamp
        if (periodStart != null && periodStart > 0) {
            val now = Instant.now().epochSecond
            if (now >= periodStart) {
                val elapsed = ((now - periodStart) / 60).toInt().coerceAtLeast(0)
                return "$elapsed'"
            }
        }

        val played = event.time?.played
        if (played != null && played >= 0) return "$played'"

        return null
    }

    private fun epochToHHmm(epochSeconds: Long): String? {
        if (epochSeconds <= 0) return null
        return Instant.ofEpochSecond(epochSeconds)
            .atZone(ZoneId.systemDefault())
            .toLocalTime()
            .toString()
            .take(5)
    }

    private fun epochToDate(epochSeconds: Long): String? {
        if (epochSeconds <= 0) return null
        return Instant.ofEpochSecond(epochSeconds)
            .atZone(ZoneId.systemDefault())
            .toLocalDate()
            .toString()
    }

    private fun tryConsumeQuota(): Boolean {
        val key = quotaKeyUtc()

        val current = redisTemplate.opsForValue().get(key)?.toLongOrNull() ?: 0L
        if (current >= quotaPerDay) return false

        val next = redisTemplate.opsForValue().increment(key) ?: (current + 1)
        if (next == 1L) {
            redisTemplate.expire(key, java.time.Duration.ofDays(2))
        }
        return next <= quotaPerDay
    }

    private fun quotaKeyUtc() = "livescore:quota:${LocalDate.now(ZoneId.of("UTC"))}"

    class QuotaExceededException : RuntimeException("LiveScore daily quota exceeded")
}

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaScheduledEventsResponse(
    val events: List<SofaEvent> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaLiveEventsResponse(
    val events: List<SofaEvent> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaIncidentsResponse(
    val incidents: List<SofaIncident> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaEvent(
    val id: Long? = null,
    val startTimestamp: Long? = null,
    val status: SofaStatus? = null,
    val tournament: SofaTournament? = null,
    val homeTeam: SofaTeam? = null,
    val awayTeam: SofaTeam? = null,
    val homeScore: SofaScore? = null,
    val awayScore: SofaScore? = null,
    val time: SofaTime? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaStatus(
    val type: String? = null,
    val description: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaTournament(
    val id: Long? = null,
    val name: String? = null,
    val category: SofaCategory? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaCategory(
    val name: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaTeam(
    val id: Long? = null,
    val name: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaScore(
    val current: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaTime(
    val currentPeriodStartTimestamp: Long? = null,
    val played: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaIncident(
    val id: Long? = null,
    val incidentType: String? = null,
    val incidentClass: String? = null,
    val isHome: Boolean? = null,
    val time: Int? = null,
    val addedTime: Int? = null,
    val player: SofaPlayer? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class SofaPlayer(
    val name: String? = null
)
