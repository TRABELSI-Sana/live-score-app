package com.selim.livescores.repository.redis

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component

@Component
class BoardMatchesStore(
    private val redis: StringRedisTemplate
) {
    companion object {
        private const val KEY = "livescores:board-keys"
    }

    fun getAll(): List<String> =
        redis.opsForList().range(KEY, 0, -1) ?: emptyList()

    fun replaceAll(matchKeys: List<String>) {
        redis.delete(KEY)
        val distinctKeys = matchKeys.filter { it.isNotBlank() }.distinct()
        if (distinctKeys.isNotEmpty()) {
            redis.opsForList().rightPushAll(KEY, distinctKeys)
        }
    }
}
