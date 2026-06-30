package com.selim.livescores.scheduler

import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.provider.dto.ApiFootballFixturesResponse
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.util.concurrent.atomic.AtomicReference

@Component
class FixturesPoller(
    private val api: LiveScoreApiClient,
    private val objectMapper: ObjectMapper,
    private val matchService: MatchService,
    private val redisTemplate: StringRedisTemplate
) {
    private val logger = LoggerFactory.getLogger(FixturesPoller::class.java)
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
            val response = block()
            if (apiDisabledUntil.get() != null) clearApiDisable()
            response
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

    @Scheduled(cron = "0 5 6 * * *")
    @Scheduled(fixedDelayString = "\${apifootball.fixtures-refresh-ms:900000}")
    fun pollFixturesToday() {
        val ids = api.competitionIdsList()
        if (ids.isEmpty()) return

        val today = LocalDate.now()
        val plannedStates = mutableListOf<com.selim.livescores.domain.MatchState>()

        ids.forEach { compId ->
            val json = guardedApiCall { api.getFixturesByLeagueOnDateJson(compId, today) } ?: return@forEach
            val resp = try {
                objectMapper.readValue(json, ApiFootballFixturesResponse::class.java)
            } catch (_: Exception) {
                return@forEach
            }
            if (resp.hasTokenError()) return@forEach

            resp.response.forEach { wrapper ->
                val mapped = wrapper.toMatchState(defaultStatus = MatchStatus.NOT_STARTED)
                val normalizedStatus = MatchStatus.normalize(mapped.status)
                val score = if (normalizedStatus == MatchStatus.NOT_STARTED) "" else mapped.scores?.score.orEmpty()

                plannedStates += mapped.copy(
                    status = normalizedStatus,
                    time = if (normalizedStatus == MatchStatus.NOT_STARTED) null else mapped.time,
                    scores = mapped.scores?.copy(score = score),
                    lastEvents = emptyList()
                )
            }
        }

        if (plannedStates.isEmpty()) return

        plannedStates.forEach { matchService.upsertFromProvider(it) }

        val newKeys = plannedStates.map { it.matchKey }.filter { it.isNotBlank() }.distinct()
        val boardKeys = (matchService.getBoardMatchKeys() + newKeys).distinct()
        matchService.replaceBoardMatchKeys(boardKeys)

        matchService.publishLiveBoard()
    }

    @Scheduled(cron = "0 0 3 * * *")
    fun reset() {
        redisTemplate.execute { connection ->
            connection.serverCommands().flushDb()
            null
        }
        logger.info("Redis flushed at 03:00 (daily reset)")
    }
}
