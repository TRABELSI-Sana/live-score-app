package com.selim.livescores.ai

import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneOffset
import kotlin.math.abs

data class MatchBriefing(
    val headline: String,
    val description: String,
    val liveCount: Int,
    val upcomingCount: Int,
    val finishedCount: Int,
    val competitionCount: Int,
    val highlights: List<BriefingHighlight>,
    val generatedAt: String
)

data class BriefingHighlight(
    val id: Long?,
    val home: String,
    val away: String,
    val homeLogo: String?,
    val awayLogo: String?,
    val competition: String,
    val country: String?,
    val phase: String,
    val score: String?,
    val minute: String?,
    val kickoff: String?,
    val label: String,
    val reason: String
)

object MatchBriefingBuilder {
    private val unavailable = setOf("PST", "CANC", "ABD", "AWD", "WO", "POSTPONED", "CANCELLED", "SUSP", "INT")
    private val scorePattern = Regex("^(\\d+)\\s*[-:]\\s*(\\d+)$")

    private fun eligible(match: MatchState) =
        match.status?.trim()?.uppercase() !in unavailable &&
            !match.home?.name.isNullOrBlank() && !match.away?.name.isNullOrBlank()

    private fun phase(match: MatchState): String = when {
        MatchStatus.isLive(match.status) -> "live"
        MatchStatus.isFinished(match.status) -> "finished"
        MatchStatus.normalize(match.status) in setOf(MatchStatus.NOT_STARTED, "SCHEDULED", "TIMED") -> "upcoming"
        else -> "unknown"
    }

    private fun score(match: MatchState): Pair<Int, Int>? =
        scorePattern.matchEntire(match.scores?.score?.trim().orEmpty())?.let {
            it.groupValues[1].toIntOrNull()?.let { home ->
                it.groupValues[2].toIntOrNull()?.let { away -> home to away }
            }
        }

    private fun minute(match: MatchState): Int = Regex("\\d+").findAll(match.time.orEmpty())
        .mapNotNull { it.value.toIntOrNull() }.sum().coerceIn(0, 150)

    private fun kickoff(match: MatchState): Instant? {
        val scheduled = match.scheduled?.trim() ?: return null
        return runCatching { Instant.parse(scheduled) }.getOrNull()
            ?: runCatching {
                LocalDate.parse(match.fixtureDate).atTime(LocalTime.parse(scheduled)).toInstant(ZoneOffset.UTC)
            }.getOrNull()
    }

    private fun livePriority(match: MatchState): Int {
        val score = score(match)
        val close = score != null && abs(score.first - score.second) <= 1
        return (if (close) 1000 else 0) + minute(match) * 2
    }

    fun select(matches: List<MatchState>, focus: String = "overview", now: Instant = Instant.now()): List<MatchState> {
        val eligible = matches.filter(::eligible)
        val live = eligible.filter { phase(it) == "live" }.sortedByDescending(::livePriority)
        val upcoming = eligible.filter { phase(it) == "upcoming" }.sortedWith(
            compareBy<MatchState> { kickoff(it)?.isBefore(now) != false }
                .thenBy { kickoff(it) ?: Instant.MAX }
        )
        val finished = eligible.filter { phase(it) == "finished" }.sortedByDescending {
            score(it)?.let { (home, away) -> home + away } ?: -1
        }
        return when (focus) {
            "live" -> live
            "upcoming" -> upcoming
            "finished" -> finished
            else -> (live.take(2) + upcoming.take(1) + finished.take(1) + live + upcoming + finished)
                .distinctBy { Triple(it.fixtureId ?: it.id, it.home?.name, it.away?.name) }
        }
    }

    fun build(matches: List<MatchState>, focus: String = "overview", now: Instant = Instant.now()): MatchBriefing {
        val available = matches.filter(::eligible)
        val liveCount = available.count { phase(it) == "live" }
        val upcomingCount = available.count { phase(it) == "upcoming" }
        val finishedCount = available.count { phase(it) == "finished" }
        val competitions = available.filter { phase(it) != "unknown" }
            .map { it.competition?.id?.toString() ?: "${it.competition?.name}|${it.competition?.country}" }.distinct().size
        val highlights = select(available, focus, now).take(3).map(::highlight)
        val headline = when {
            focus == "live" && highlights.isEmpty() -> "Le direct fait une pause."
            focus == "upcoming" && highlights.isEmpty() -> "Le programme est bouclé."
            focus == "live" || (focus == "overview" && liveCount > 0) -> "Les matchs à garder à l’œil."
            focus == "upcoming" || (focus == "overview" && upcomingCount > 0) -> "Vos prochains rendez-vous."
            finishedCount > 0 -> "Les scores à retenir."
            else -> "La suite se prépare."
        }
        val description = when {
            focus == "live" && liveCount == 0 -> "Aucune rencontre en cours. Retrouvez les prochains coups d’envoi dans l’onglet À venir."
            focus == "upcoming" && upcomingCount == 0 -> "Aucun prochain coup d’envoi disponible pour le moment."
            liveCount > 0 && focus in setOf("overview", "live") -> "$liveCount ${if (liveCount == 1) "match en cours" else "matchs en cours"}. Priorité aux scores serrés et aux fins de rencontre."
            upcomingCount > 0 && focus in setOf("overview", "upcoming") -> "$upcomingCount ${if (upcomingCount == 1) "rencontre à venir" else "rencontres à venir"}. Voici les prochains coups d’envoi du programme."
            finishedCount > 0 -> "$finishedCount ${if (finishedCount == 1) "rencontre terminée" else "rencontres terminées"}. Retour sur les matchs les plus riches en buts."
            else -> "Le briefing apparaîtra dès que les rencontres seront disponibles."
        }
        return MatchBriefing(headline, description, liveCount, upcomingCount, finishedCount, competitions, highlights, now.toString())
    }

    private fun highlight(match: MatchState): BriefingHighlight {
        val phase = phase(match)
        val score = score(match)
        val gap = score?.let { abs(it.first - it.second) }
        val minute = minute(match)
        val label = when {
            phase == "upcoming" -> "Prochain coup d’envoi"
            phase == "finished" -> "Le résultat"
            gap == 0 && minute >= 75 -> "Tout reste à jouer"
            gap == 0 -> "Match indécis"
            gap == 1 -> "Un but peut tout changer"
            else -> "En direct"
        }
        val reason = when {
            phase == "upcoming" -> "Le score et les événements seront disponibles dès le début de la rencontre."
            phase == "finished" && score != null -> {
                val goals = score.first + score.second
                if (goals == 0) "Les deux équipes se quittent sans but." else "$goals ${if (goals == 1) "but inscrit" else "buts inscrits"} au terme de cette rencontre."
            }
            phase == "finished" -> "La rencontre est terminée."
            gap == 0 && minute > 0 -> "Toujours à égalité après $minute minutes de jeu."
            gap == 0 -> "Les deux équipes sont à égalité."
            gap == 1 -> "Un seul but sépare les deux équipes. Le score reste provisoire."
            gap != null -> "$gap buts d’écart. La rencontre est toujours en cours."
            else -> "La rencontre est en cours ; le score n’est pas encore renseigné."
        }
        return BriefingHighlight(
            id = match.fixtureId ?: match.id,
            home = match.home!!.name!!,
            away = match.away!!.name!!,
            homeLogo = match.home.logo,
            awayLogo = match.away.logo,
            competition = match.competition?.name ?: "Compétition",
            country = match.competition?.country,
            phase = phase,
            score = if (phase != "upcoming") score?.let { "${it.first} – ${it.second}" } else null,
            minute = match.time?.takeIf { it.isNotBlank() },
            kickoff = kickoff(match)?.toString(),
            label = label,
            reason = reason
        )
    }
}
