package com.selim.livescores.repository.redis

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class LiveMatchesStore(
    private val redis: StringRedisTemplate
) {
    private val key = "matches:live"

    fun replaceAll(matchKeys: List<String>, ttl: Duration = Duration.ofMinutes(5)) {
        redis.executePipelined { connection ->
            connection.keyCommands().del(key.toByteArray())
            if (matchKeys.isNotEmpty()) {
                connection.setCommands().sAdd(
                    key.toByteArray(),
                    *matchKeys.map { it.toByteArray() }.toTypedArray()
                )
                connection.keyCommands().expire(key.toByteArray(), ttl.seconds)
            }
            null
        }
    }

    fun getAll(): Set<String> = redis.opsForSet().members(key) ?: emptySet()
}
