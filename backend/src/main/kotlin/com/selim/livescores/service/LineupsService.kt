package com.selim.livescores.service

import com.selim.livescores.provider.livescore.LiveScoreApiClient
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class LineupsService(
    private val apiClient: LiveScoreApiClient,
    private val redisJsonCacheService: RedisJsonCacheService
) {
    fun getFixtureLineupsJson(fixtureId: Long): String {
        val cacheKey = cacheKey(fixtureId)
        return redisJsonCacheService.getOrLoad(cacheKey, Duration.ofMinutes(3)) {
            apiClient.getFixtureLineupsJson(fixtureId)
        }
    }

    private fun cacheKey(fixtureId: Long) = "apifootball:lineups:$fixtureId"
}
