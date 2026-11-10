package com.selim.livescores.provider

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.selim.livescores.domain.MatchState
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.scheduler.FixturesPoller
import com.selim.livescores.service.MatchService
import com.sun.net.httpserver.HttpServer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.core.ValueOperations
import java.net.InetSocketAddress
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.time.LocalDate
import java.time.ZoneId
import java.util.Properties

class InternationalFixturesTest {
    @Test
    fun `calendar includes national competitions across seasons and preserves club filtering`() {
        val queries = mutableListOf<Map<String, String>>()
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/fixtures") { exchange ->
            queries += exchange.requestURI.rawQuery.split("&").associate {
                val parts = it.split("=", limit = 2)
                parts[0] to URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
            }
            val fixtures = listOf(5 to 2024, 10 to 2026, 36 to 2025, 39 to 2026, 9999 to 2026)
                .joinToString(",") { (league, season) ->
                    """{"fixture":{"id":$league,"date":"2026-11-10T20:00:00+01:00","status":{"short":"NS"}},"league":{"id":$league,"season":$season}}"""
                }
            val body = """{"errors":[],"response":[$fixtures]}""".toByteArray()
            exchange.responseHeaders.add("Content-Type", "application/json")
            exchange.sendResponseHeaders(200, body.size.toLong())
            exchange.responseBody.use { it.write(body) }
        }
        server.start()
        try {
            val redis = mock(StringRedisTemplate::class.java)
            @Suppress("UNCHECKED_CAST")
            val values = mock(ValueOperations::class.java) as ValueOperations<String, String>
            `when`(redis.opsForValue()).thenReturn(values)
            `when`(values.increment(anyString())).thenReturn(2L)
            val properties = Properties().apply {
                InternationalFixturesTest::class.java.getResourceAsStream("/application.properties")!!.use { load(it) }
            }
            val api = LiveScoreApiClient("http://127.0.0.1:${server.address.port}", "test-key",
                properties.getProperty("apifootball.competition-ids"), redis, 7500)
            val matches = mock(MatchService::class.java)
            `when`(matches.getBoardMatchKeys()).thenReturn(emptyList())
            val before = LocalDate.now(ZoneId.of("Europe/Paris"))
            FixturesPoller(api, jacksonObjectMapper(), matches).pollFixturesToday()

            assertThat(queries).hasSize(3)
            assertThat(queries.map { it["date"] }).containsExactly(
                before.toString(), before.plusDays(1).toString(), before.plusDays(2).toString())
            assertThat(queries.all { it["timezone"] == "Europe/Paris" && it.keys == setOf("date", "timezone") }).isTrue()
            val states = mockingDetails(matches).invocations
                .filter { it.method.name == "upsertFromProvider" }
                .map { it.arguments[0] as MatchState }
            assertThat(states.map { it.competition?.id }).contains(5L, 10L, 36L, 39L).doesNotContain(9999L)
            verify(values, times(3)).increment(anyString())
            verify(matches).publishLiveBoard()
        } finally {
            server.stop(0)
        }
    }

    @Test
    fun `development and production track the same international competitions`() {
        val configurations = listOf("/application.properties", "/application-prod.properties").map { name ->
            Properties().apply { InternationalFixturesTest::class.java.getResourceAsStream(name)!!.use { load(it) } }
                .getProperty("apifootball.competition-ids").split(",").map(String::toInt).toSet()
        }
        assertThat(configurations[0]).isEqualTo(configurations[1])
        assertThat(configurations[0]).contains(1, 4, 5, 10, 29, 30, 31, 32, 33, 34, 36, 39)
    }
}
