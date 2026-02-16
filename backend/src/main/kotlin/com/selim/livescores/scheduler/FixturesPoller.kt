package com.selim.livescores.scheduler

import com.selim.livescores.domain.MatchState
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class FixturesPoller(
    private val api: LiveScoreApiClient,
    private val matchService: MatchService,
    private val redisTemplate: StringRedisTemplate

) {
    // les matchs planifiés pour aujourd’hui
    @Scheduled(cron = "0 5 6 * * *") // 06:05 tous les jours
    fun pollFixturesToday() {
        val ids = api.competitionIdsList()

        if (ids.isEmpty()) return

        val plannedStates = mutableListOf<MatchState>()

        ids.forEach { compId ->
            plannedStates += api.getFixturesToday(compId)
        }

        if (plannedStates.isEmpty()) return

        // upsert dans Redis
        plannedStates.forEach { matchService.upsertFromProvider(it) }

        // ajouter au board keys (sans toucher les live keys)
        val newKeys = plannedStates.map { it.matchKey }.filter { it.isNotBlank() }.distinct()
        val boardKeys = (matchService.getBoardMatchKeys() + newKeys).distinct()
        matchService.replaceBoardMatchKeys(boardKeys)

        // push SSE board
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
