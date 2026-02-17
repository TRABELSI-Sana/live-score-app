package com.selim.livescores.service

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class RedisJsonCacheService(
    private val redis: StringRedisTemplate
) {
    fun getOrLoad(cacheKey: String, ttl: Duration, loader: () -> String): String {
        val cached = redis.opsForValue().get(cacheKey)
        if (!cached.isNullOrBlank()) return cached

        val payload = loader()
        redis.opsForValue().set(cacheKey, payload, ttl)
        return payload
    }

    fun evict(cacheKey: String) {
        redis.delete(cacheKey)
    }
}
