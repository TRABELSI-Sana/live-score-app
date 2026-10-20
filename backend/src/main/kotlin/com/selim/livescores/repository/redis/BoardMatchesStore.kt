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
        val distinctKeys = matchKeys.filter { it.isNotBlank() }.distinct()
        redis.executePipelined { connection ->
            connection.keyCommands().del(KEY.toByteArray())
            if (distinctKeys.isNotEmpty()) {
                connection.listCommands().rPush(
                    KEY.toByteArray(),
                    *distinctKeys.map { it.toByteArray() }.toTypedArray()
                )
            }
            null
        }
    }
}
