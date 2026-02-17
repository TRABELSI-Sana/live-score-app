package com.selim.livescores.provider.livescore

import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.time.LocalDate
import java.time.Month
import java.time.ZoneId

@Component
class LiveScoreApiClient(
    @Value("\${apifootball.base-url}") private val baseUrl: String,
    @Value("\${apifootball.key}") private val key: String,
    @Value("\${apifootball.competition-ids:}") private val competitionIds: String,
    private val redisTemplate: StringRedisTemplate,
    @Value("\${apifootball.quota-per-day:7500}") private val quotaPerDay: Long
) {

    private val client = RestClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader("x-apisports-key", key)
        .defaultHeader("x-rapidapi-key", key)
        .build()

    fun getLiveMatchesJson(): String {
        if (!tryConsumeQuota()) throw QuotaExceededException()
        return client.get().uri("/fixtures?live=all").retrieve().body(String::class.java)!!
    }

    fun getFixturesByLeagueOnDateJson(competitionId: Int, date: LocalDate): String {
        if (!tryConsumeQuota()) throw QuotaExceededException()
        val season = seasonFromDate(date)
        val uri = "/fixtures?league=$competitionId&season=$season&date=$date"
        return client.get().uri(uri).retrieve().body(String::class.java)!!
    }


    fun getFixtureLineupsJson(fixtureId: Long): String {
        if (!tryConsumeQuota()) throw QuotaExceededException()
        return client.get().uri("/fixtures/lineups?fixture=$fixtureId").retrieve().body(String::class.java)!!
    }

    fun getFixtureEventsJson(fixtureId: Long): String {
        if (!tryConsumeQuota()) throw QuotaExceededException()
        return client.get().uri("/fixtures/events?fixture=$fixtureId").retrieve().body(String::class.java)!!
    }

    fun getCompetitionTableJson(competitionId: Int): String {
        if (!tryConsumeQuota()) throw QuotaExceededException()
        val season = seasonFromDate(LocalDate.now(ZoneId.of("UTC")))
        val uri = "/standings?league=$competitionId&season=$season"
        return client.get().uri(uri).retrieve().body(String::class.java)!!
    }

    fun competitionIdsList(): List<Int> =
        competitionIds
            .split(",")
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .mapNotNull { it.toIntOrNull() }

    fun seasonFromDate(date: LocalDate): Int {
        // Saison Europe classique: démarre en juillet.
        return if (date.month.value >= Month.JULY.value) date.year else date.year - 1
    }

    private fun tryConsumeQuota(): Boolean {
        val key = quotaKeyUtc()

        val current = redisTemplate.opsForValue().get(key)?.toLongOrNull() ?: 0L
        if (current >= quotaPerDay) return false

        val next = redisTemplate.opsForValue().increment(key) ?: (current + 1)
        if (next == 1L) {
            redisTemplate.expire(key, java.time.Duration.ofDays(2))
        }
        return next <= quotaPerDay
    }

    private fun quotaKeyUtc() = "apifootball:quota:${LocalDate.now(ZoneId.of("UTC"))}"

    class QuotaExceededException : RuntimeException("API-Football daily quota exceeded")
}
