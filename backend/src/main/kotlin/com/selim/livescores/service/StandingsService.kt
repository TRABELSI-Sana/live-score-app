package com.selim.livescores.service

import com.selim.livescores.provider.livescore.LiveScoreApiClient
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class StandingsService(
    private val liveScoreApiClient: LiveScoreApiClient,
    private val redisJsonCacheService: RedisJsonCacheService
) {
    fun getCompetitionTableJson(competitionId: Int): String {
        val cacheKey = cacheKey(competitionId)
        return redisJsonCacheService.getOrLoad(cacheKey, Duration.ofMinutes(5)) {
            liveScoreApiClient.getCompetitionTableJson(competitionId)
        }
    }

    fun invalidateCompetition(competitionId: Long) {
        redisJsonCacheService.evict(cacheKey(competitionId.toString()))
    }

    private fun cacheKey(competitionId: Int) = cacheKey(competitionId.toString())

    private fun cacheKey(competitionId: String) = "apifootball:standings:$competitionId"
}
