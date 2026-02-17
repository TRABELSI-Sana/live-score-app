package com.selim.livescores.scheduler

import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class FixturesPoller(
    private val api: LiveScoreApiClient,
    private val objectMapper: ObjectMapper,
    private val matchService: MatchService,
    private val redisTemplate: StringRedisTemplate

) {
    @Scheduled(cron = "0 5 6 * * *")
    @Scheduled(fixedDelayString = "\${apifootball.fixtures-refresh-ms:900000}")
    fun pollFixturesToday() {
        val ids = api.competitionIdsList()
        if (ids.isEmpty()) return

        val today = LocalDate.now()
        val plannedStates = mutableListOf<com.selim.livescores.domain.MatchState>()

        ids.forEach { compId ->
            val json = api.getFixturesByLeagueOnDateJson(compId, today)
            val resp = objectMapper.readValue(json, ApiFootballFixturesResponse::class.java)
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
        println("🧹 Redis flushed at 03:00")
    }
}
