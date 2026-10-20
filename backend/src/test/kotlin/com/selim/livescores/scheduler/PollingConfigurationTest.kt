package com.selim.livescores.scheduler

import com.fasterxml.jackson.databind.ObjectMapper
import com.selim.livescores.provider.livescore.LiveScoreApiClient
import com.selim.livescores.service.MatchService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.springframework.boot.test.context.runner.ApplicationContextRunner
import org.springframework.data.redis.core.StringRedisTemplate

class PollingConfigurationTest {
    private val contextRunner = ApplicationContextRunner()
        .withBean(LiveScoreApiClient::class.java, { mock(LiveScoreApiClient::class.java) })
        .withBean(ObjectMapper::class.java, { ObjectMapper() })
        .withBean(MatchService::class.java, { mock(MatchService::class.java) })
        .withBean(StringRedisTemplate::class.java, { mock(StringRedisTemplate::class.java) })
        .withUserConfiguration(FixturesPoller::class.java, LiveScorePoller::class.java, StartupSeeder::class.java)

    @Test
    fun `polling remains enabled by default`() {
        contextRunner.run { context ->
            assertThat(context).hasSingleBean(FixturesPoller::class.java)
            assertThat(context).hasSingleBean(LiveScorePoller::class.java)
            assertThat(context).hasSingleBean(StartupSeeder::class.java)
        }
    }

    @Test
    fun `preview disables provider polling and scheduled Redis reset`() {
        contextRunner.withPropertyValues("app.polling.enabled=false").run { context ->
            assertThat(context).doesNotHaveBean(FixturesPoller::class.java)
            assertThat(context).doesNotHaveBean(LiveScorePoller::class.java)
            assertThat(context).doesNotHaveBean(StartupSeeder::class.java)
        }
    }
}
