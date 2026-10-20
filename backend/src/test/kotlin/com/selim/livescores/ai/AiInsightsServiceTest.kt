package com.selim.livescores.ai

import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.Scores
import com.selim.livescores.service.MatchService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.chat.messages.AssistantMessage
import org.springframework.ai.chat.model.ChatModel
import org.springframework.ai.chat.model.ChatResponse
import org.springframework.ai.chat.model.Generation
import org.springframework.ai.chat.prompt.Prompt
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class AiInsightsServiceTest {
    private val model = mock(ChatModel::class.java)
    private val matches = mock(MatchService::class.java)
    private var service: AiInsightsService? = null
    private val answer = ChatResponse(listOf(Generation(AssistantMessage("Résumé factuel."))))

    private fun create(timeout: Long = 5, cacheSeconds: Long = 60): AiInsightsService {
        `when`(matches.getBoardMatches()).thenReturn(listOf(MatchState(id = 1, scores = Scores("1-0"))))
        `when`(model.call(any(Prompt::class.java))).thenReturn(answer)
        return AiInsightsService(ChatClient.builder(model).build(), matches, "test", timeout, 1, cacheSeconds)
            .also { service = it }
    }

    @AfterEach
    fun stop() {
        service?.shutdown()
    }

    @Test
    fun `identical requests reuse the successful response`() {
        val ai = create()
        val first = ai.generateInsight(AiInsightRequest())
        assertThat(ai.generateInsight(AiInsightRequest())).isEqualTo(first)
        assertThat(first.status).isEqualTo("ok")
        verify(model, times(1)).call(any(Prompt::class.java))
    }

    @Test
    fun `score or prompt changes invalidate the cached summary`() {
        val ai = create()
        ai.generateInsight(AiInsightRequest())
        `when`(matches.getBoardMatches()).thenReturn(listOf(MatchState(id = 1, scores = Scores("2-0"))))
        ai.generateInsight(AiInsightRequest())
        ai.generateInsight(AiInsightRequest(prompt = "Quels buteurs ?"))
        verify(model, times(3)).call(any(Prompt::class.java))
    }

    @Test
    fun `disabled cache regenerates responses`() {
        val ai = create(cacheSeconds = 0)
        ai.generateInsight(AiInsightRequest())
        ai.generateInsight(AiInsightRequest())
        verify(model, times(2)).call(any(Prompt::class.java))
    }

    @Test
    fun `simultaneous visitors share one generation and unrelated prompts stay busy`() {
        val ai = create()
        val started = CountDownLatch(1)
        val release = CountDownLatch(1)
        val callers = Executors.newFixedThreadPool(2)
        `when`(model.call(any(Prompt::class.java))).thenAnswer {
            started.countDown()
            check(release.await(5, TimeUnit.SECONDS))
            answer
        }
        try {
            val first = callers.submit<AiInsightResponse> { ai.generateInsight(AiInsightRequest()) }
            assertThat(started.await(5, TimeUnit.SECONDS)).isTrue()
            val second = callers.submit<AiInsightResponse> { ai.generateInsight(AiInsightRequest()) }
            assertThat(ai.generateInsight(AiInsightRequest(prompt = "Autre question")).status).isEqualTo("busy")
            release.countDown()
            assertThat(first.get(5, TimeUnit.SECONDS).status).isEqualTo("ok")
            assertThat(second.get(5, TimeUnit.SECONDS).status).isEqualTo("ok")
            verify(model, times(1)).call(any(Prompt::class.java))
        } finally {
            release.countDown()
            callers.shutdownNow()
        }
    }

    @Test
    fun `timeout retains generation slot instead of queueing more work`() {
        val ai = create(timeout = 0)
        val started = CountDownLatch(1)
        val release = CountDownLatch(1)
        `when`(model.call(any(Prompt::class.java))).thenAnswer {
            started.countDown()
            check(release.await(5, TimeUnit.SECONDS))
            answer
        }
        try {
            assertThat(ai.generateInsight(AiInsightRequest()).status).isEqualTo("timeout")
            assertThat(started.await(5, TimeUnit.SECONDS)).isTrue()
            assertThat(ai.generateInsight(AiInsightRequest()).status).isEqualTo("timeout")
            assertThat(ai.generateInsight(AiInsightRequest(prompt = "Autre question")).status).isEqualTo("busy")
            verify(model, times(1)).call(any(Prompt::class.java))
        } finally {
            release.countDown()
        }
    }

    @Test
    fun `generation errors are not cached and release capacity`() {
        val ai = create()
        `when`(model.call(any(Prompt::class.java))).thenThrow(IllegalStateException("offline")).thenReturn(answer)
        assertThat(ai.generateInsight(AiInsightRequest()).status).isEqualTo("error")
        assertThat(ai.generateInsight(AiInsightRequest()).status).isEqualTo("ok")
        verify(model, times(2)).call(any(Prompt::class.java))
    }
}
