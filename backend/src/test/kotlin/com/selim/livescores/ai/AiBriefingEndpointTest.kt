package com.selim.livescores.ai

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.selim.livescores.domain.Competition
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.Scores
import com.selim.livescores.domain.Team
import com.selim.livescores.service.MatchService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders

class AiBriefingEndpointTest {
    private val ai = mock(AiInsightsService::class.java)
    private val matches = mock(MatchService::class.java)
    private val mvc = MockMvcBuilders.standaloneSetup(AiController(ai, matches))
        .setMessageConverters(MappingJackson2HttpMessageConverter(jacksonObjectMapper())).build()

    private fun fixture() = MatchState(
        id = 42, status = "IN PLAY", time = "82", scores = Scores("2-2"),
        home = Team(name = "Paris SG"), away = Team(name = "Lyon"),
        competition = Competition(id = 61, name = "Ligue 1", country = "France")
    )

    @Test
    fun `briefing returns structured factual highlights without running the model`() {
        `when`(matches.getBoardMatches()).thenReturn(listOf(fixture()))
        mvc.perform(get("/api/ai/briefing").param("focus", "live"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.liveCount").value(1))
            .andExpect(jsonPath("$.highlights[0].id").value(42))
            .andExpect(jsonPath("$.highlights[0].competition").value("Ligue 1"))
            .andExpect(jsonPath("$.highlights[0].home").value("Paris SG"))
            .andExpect(jsonPath("$.highlights[0].phase").value("live"))
            .andExpect(jsonPath("$.highlights[0].label").value("Tout reste à jouer"))
        verifyNoInteractions(ai)
    }

    @Test
    fun `upcoming filter never substitutes a live match and unknown focus uses overview`() {
        `when`(matches.getBoardMatches()).thenReturn(listOf(fixture()))
        mvc.perform(get("/api/ai/briefing").param("focus", "upcoming"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.highlights").isEmpty)
        mvc.perform(get("/api/ai/briefing").param("focus", "invalid"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.highlights[0].home").value("Paris SG"))
        verifyNoInteractions(ai)
    }
}
