package com.selim.livescores.scheduler

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ApiFootballMappingTest {

    private val mapper = jacksonObjectMapper()

    @Test
    fun `should parse fixtures payload and map to match state`() {
        val payload = """
            {
              "get": "fixtures",
              "errors": [],
              "results": 1,
              "response": [
                {
                  "fixture": {
                    "id": 12345,
                    "date": "2026-02-17T19:00:00+00:00",
                    "status": { "short": "1H", "elapsed": 34 }
                  },
                  "league": { "id": 39, "name": "Premier League", "country": "England" },
                  "teams": {
                    "home": { "id": 33, "name": "Man United", "logo": "h.png" },
                    "away": { "id": 40, "name": "Liverpool", "logo": "a.png" }
                  },
                  "goals": { "home": 1, "away": 0 }
                }
              ]
            }
        """.trimIndent()

        val resp = mapper.readValue(payload, ApiFootballFixturesResponse::class.java)
        val state = resp.response.first().toMatchState()

        assertEquals("IN PLAY", state.status)
        assertEquals("1 - 0", state.scores?.score)
        assertEquals(39, state.competition?.id)
        assertEquals("2026-02-17", state.fixtureDate)
    }

    @Test
    fun `should detect token error`() {
        val payload = """
            {
              "errors": {
                "token": "Missing application key"
              },
              "response": []
            }
        """.trimIndent()

        val resp = mapper.readValue(payload, ApiFootballFixturesResponse::class.java)
        assertTrue(resp.hasTokenError())
    }

    @Test
    fun `should map short statuses to internal statuses`() {
        assertEquals("NOT STARTED", mapApiStatus("NS"))
        assertEquals("IN PLAY", mapApiStatus("2H"))
        assertEquals("HALF TIME BREAK", mapApiStatus("HT"))
        assertEquals("FINISHED", mapApiStatus("PEN"))
        assertEquals("FINISHED", mapApiStatus("CANC"))
    }

    @Test
    fun `should ignore minute placeholder as player name`() {
        val event = ApiFootballFixtureEvent(
            time = ApiFootballEventTime(elapsed = 56),
            player = ApiFootballEventPlayer(name = "56"),
            type = "Goal"
        )

        val mapped = event.toMatchEvent(fixtureId = 123L, homeTeamId = null, awayTeamId = null)

        assertEquals(null, mapped.player)
    }

    @Test
    fun `should keep real player names`() {
        val event = ApiFootballFixtureEvent(
            time = ApiFootballEventTime(elapsed = 56),
            player = ApiFootballEventPlayer(name = "Mbappé"),
            type = "Goal"
        )

        val mapped = event.toMatchEvent(fixtureId = 123L, homeTeamId = null, awayTeamId = null)

        assertEquals("Mbappé", mapped.player)
    }
}
