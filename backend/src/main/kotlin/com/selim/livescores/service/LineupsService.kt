package com.selim.livescores.service

import com.selim.livescores.provider.livescore.LiveScoreApiClient
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class LineupsService(
    private val apiClient: LiveScoreApiClient,
    private val redis: StringRedisTemplate
) {
    fun getFixtureLineupsJson(fixtureId: Long): String {
        val cacheKey = cacheKey(fixtureId)
        val cached = redis.opsForValue().get(cacheKey)
        if (!cached.isNullOrBlank()) return cached

        val payload = apiClient.getFixtureLineupsJson(fixtureId)
        redis.opsForValue().set(cacheKey, payload, Duration.ofMinutes(3))
        return payload
    }

    private fun cacheKey(fixtureId: Long) = "apifootball:lineups:$fixtureId"
}
