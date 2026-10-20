package com.selim.livescores.ai

import com.selim.livescores.domain.Competition
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.Team
import com.selim.livescores.service.MatchService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
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

class AiChatServiceTest {
    private val model = mock(ChatModel::class.java)
    private val matches = mock(MatchService::class.java)
    private val answer = ChatResponse(listOf(Generation(AssistantMessage("Une explication courte et claire."))))
    private val service = AiInsightsService(ChatClient.builder(model).build(), matches, "test", 5, 1)

    init {
        `when`(model.call(any(Prompt::class.java))).thenReturn(answer)
        `when`(matches.getBoardMatches()).thenReturn(emptyList())
    }

    @AfterEach
    fun stop() = service.shutdown()

    @Test
    fun `generalist questions work without match data and include conversation history`() {
        val response = service.chat(AiChatRequest("Et Kubernetes ?", listOf(AiChatMessage("user", "Explique Docker"), AiChatMessage("assistant", "Docker lance des conteneurs."))))
        assertThat(response.status).isEqualTo("ok")
        val captor = ArgumentCaptor.forClass(Prompt::class.java)
        verify(model).call(captor.capture())
        val text = captor.value.instructions.joinToString("\n") { it.text }
        assertThat(text).contains("assistant généraliste", "Explique Docker", "Docker lance des conteneurs.", "Et Kubernetes ?")
    }

    @Test
    fun `Redis failure does not block a generalist answer`() {
        `when`(matches.getBoardMatches()).thenThrow(IllegalStateException("Redis offline"))
        assertThat(service.chat(AiChatRequest("Aide-moi à rédiger un message")).status).isEqualTo("ok")
    }

    @Test
    fun `general questions do not receive unrelated football context`() {
        `when`(matches.getBoardMatches()).thenReturn(listOf(MatchState(id = 1, status = "LIVE", home = Team(name = "Paris Saint-Germain"), away = Team(name = "Lyon"))))
        service.chat(AiChatRequest("Explique Kubernetes"))
        val captor = ArgumentCaptor.forClass(Prompt::class.java)
        verify(model).call(captor.capture())
        assertThat(captor.value.instructions.first().text).doesNotContain("Paris Saint-Germain", "Lyon")
    }

    @Test
    fun `history is bounded and system role supplied by clients is ignored`() {
        val history = listOf(AiChatMessage("user", "old message")) + List(6) { AiChatMessage(if (it == 5) "system" else "assistant", "x".repeat(1200)) }
        service.chat(AiChatRequest("Bonjour", history, "invalid/timezone"))
        val captor = ArgumentCaptor.forClass(Prompt::class.java)
        verify(model).call(captor.capture())
        val instructions = captor.value.instructions
        assertThat(instructions.count { it.javaClass.simpleName == "SystemMessage" }).isEqualTo(1)
        assertThat(instructions.joinToString { it.text }).doesNotContain("old message", "x".repeat(451))
    }

    @Test
    fun `team mentioned in a question selects that fixture and formats local kickoff`() {
        `when`(matches.getBoardMatches()).thenReturn(listOf(MatchState(
            id = 1, status = "NOT STARTED", home = Team(name = "Paris Saint-Germain"), away = Team(name = "Lyon"),
            competition = Competition(name = "Ligue 1"), scheduled = "2026-10-20T17:00:00Z"
        )))
        val response = service.chat(AiChatRequest("À quelle heure joue Paris ?", timeZone = "Europe/Paris"))
        assertThat(response.matchesConsidered).isEqualTo(1)
        val captor = ArgumentCaptor.forClass(Prompt::class.java)
        verify(model).call(captor.capture())
        assertThat(captor.value.instructions.first().text).contains("19:00", "Europe/Paris", "Paris Saint-Germain").doesNotContain("17:00:00Z")
    }

    @Test
    fun `chat and insights share a generation slot`() {
        val started = CountDownLatch(1)
        val release = CountDownLatch(1)
        val caller = Executors.newSingleThreadExecutor()
        `when`(model.call(any(Prompt::class.java))).thenAnswer {
            started.countDown()
            check(release.await(5, TimeUnit.SECONDS))
            answer
        }
        try {
            val pending = caller.submit<AiInsightResponse> { service.chat(AiChatRequest("Bonjour")) }
            assertThat(started.await(5, TimeUnit.SECONDS)).isTrue()
            `when`(matches.getBoardMatches()).thenReturn(listOf(MatchState(id = 2)))
            assertThat(service.generateInsight(AiInsightRequest()).status).isEqualTo("busy")
            assertThat(service.chat(AiChatRequest("Autre question")).status).isEqualTo("busy")
            release.countDown()
            assertThat(pending.get(5, TimeUnit.SECONDS).status).isEqualTo("ok")
            verify(model, times(1)).call(any(Prompt::class.java))
        } finally { release.countDown(); caller.shutdownNow() }
    }

    @Test
    fun `empty messages do not invoke the model`() {
        assertThat(service.chat(AiChatRequest(" ")).status).isEqualTo("empty")
        verify(model, never()).call(any(Prompt::class.java))
    }
}
