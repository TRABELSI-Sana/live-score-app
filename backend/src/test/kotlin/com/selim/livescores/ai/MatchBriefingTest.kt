package com.selim.livescores.ai

import com.selim.livescores.domain.Competition
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.Scores
import com.selim.livescores.domain.Team
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.Instant

class MatchBriefingTest {
    private val now = Instant.parse("2026-10-20T12:00:00Z")
    private fun match(id: Long, status: String = "NOT STARTED", score: String? = null, time: String? = null, scheduled: String? = null) = MatchState(
        id = id, status = status, scores = score?.let { Scores(it) }, time = time, scheduled = scheduled,
        home = Team(name = "Domicile $id"), away = Team(name = "Extérieur $id"),
        competition = Competition(id = id, name = "Compétition $id")
    )

    @Test
    fun `late close games take priority while preserving one upcoming fixture`() {
        val fixtures = listOf(
            match(1, "LIVE", "4-0", "85"), match(2, "2H", "1-1", "82"),
            match(3, "1H", "0-1", "23"), match(4, scheduled = "2026-10-20T13:00:00Z")
        )
        assertThat(MatchBriefingBuilder.build(fixtures, now = now).highlights.map { it.id }).containsExactly(2, 3, 4)
    }

    @Test
    fun `upcoming fixtures are chronological and never expose provisional zero scores`() {
        val fixtures = listOf(match(1, score = "0-0", scheduled = "2026-10-20T19:00:00Z"), match(2, scheduled = "2026-10-20T13:00:00Z"))
        val result = MatchBriefingBuilder.build(fixtures, now = now)
        assertThat(result.highlights.map { it.id }).containsExactly(2, 1)
        assertThat(result.highlights).allMatch { it.score == null && it.phase == "upcoming" }
        assertThat(result.upcomingCount).isEqualTo(2)
    }

    @Test
    fun `late game labels use provisional language and include added time`() {
        val item = MatchBriefingBuilder.build(listOf(match(1, "ADDED TIME", "2-2", "90+3")), now = now).highlights.single()
        assertThat(item.label).isEqualTo("Tout reste à jouer")
        assertThat(item.reason).contains("93 minutes").doesNotContain("gagné")
    }

    @Test
    fun `missing scores are not interpreted as goalless draws`() {
        val item = MatchBriefingBuilder.build(listOf(match(1, "LIVE", time = "20")), now = now).highlights.single()
        assertThat(item.score).isNull()
        assertThat(item.reason).contains("pas encore renseigné").doesNotContain("égalité")
    }

    @Test
    fun `postponed cancelled and unnamed fixtures never appear as highlights`() {
        val fixtures = listOf(match(1, "PST"), match(2, "CANC"), match(3, "SUSP"), match(4).copy(home = null))
        val result = MatchBriefingBuilder.build(fixtures, now = now)
        assertThat(result.highlights).isEmpty()
        assertThat(result.finishedCount + result.liveCount + result.upcomingCount).isZero()
    }

    @Test
    fun `each highlight keeps its own competition and teams`() {
        val result = MatchBriefingBuilder.build(listOf(match(1), match(2)), now = now)
        assertThat(result.highlights).allSatisfy {
            assertThat(it.competition).isEqualTo("Compétition ${it.id}")
            assertThat(it.home).isEqualTo("Domicile ${it.id}")
            assertThat(it.away).isEqualTo("Extérieur ${it.id}")
        }
    }

    @Test
    fun `finished highlights prioritize goals and count them accurately`() {
        val result = MatchBriefingBuilder.build(listOf(match(1, "FT", "1-0"), match(2, "FINISHED", "3-2")), now = now)
        assertThat(result.highlights.first().id).isEqualTo(2)
        assertThat(result.highlights.first().reason).startsWith("5 buts")
        assertThat(result.finishedCount).isEqualTo(2)
    }

    @Test
    fun `live focus stays empty instead of showing upcoming matches`() {
        val result = MatchBriefingBuilder.build(listOf(match(1)), "live", now)
        assertThat(result.highlights).isEmpty()
        assertThat(result.description).contains("Aucune rencontre en cours")
    }

    @Test
    fun `dated UTC time and unknown kickoff are handled without invented hours`() {
        val fixtures = listOf(match(1), match(2, scheduled = "13:00").copy(fixtureDate = "2026-10-20"))
        val result = MatchBriefingBuilder.build(fixtures, now = now)
        assertThat(result.highlights.first().kickoff).isEqualTo("2026-10-20T13:00:00Z")
        assertThat(result.highlights.last().kickoff).isNull()
    }

    @Test
    fun `finished focus describes results even when live and upcoming fixtures exist`() {
        val result = MatchBriefingBuilder.build(listOf(match(1, "LIVE", "0-0"), match(2), match(3, "FT", "2-0")), "finished", now)
        assertThat(result.highlights.single().id).isEqualTo(3)
        assertThat(result.description).startsWith("1 rencontre terminée")
    }

    @Test
    fun `competition counts distinguish equal names in different countries`() {
        val fixtures = listOf(match(1), match(2)).mapIndexed { i, m -> m.copy(competition = Competition(name = "Premier League", country = if (i == 0) "England" else "Egypt")) }
        assertThat(MatchBriefingBuilder.build(fixtures, now = now).competitionCount).isEqualTo(2)
    }
}
