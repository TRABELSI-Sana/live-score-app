package com.selim.livescores.ai

import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.service.MatchService
import org.springframework.ai.chat.client.ChatClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.concurrent.Executors
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit

@Service
class AiInsightsService(
    private val chatClient: ChatClient,
    private val matchService: MatchService,
    @Value("\${spring.ai.ollama.chat.options.model:mistral}")
    private val model: String,
    @Value("\${app.ai.timeout-seconds:8}")
    private val timeoutSeconds: Long,
    @Value("\${app.ai.max-concurrent-requests:1}")
    maxConcurrentRequests: Int
) {
    private val aiCallExecutor = Executors.newCachedThreadPool()
    private val aiSlots = Semaphore(maxConcurrentRequests.coerceAtLeast(1))

    fun suggestions(): AiSuggestionsResponse = AiSuggestionsResponse(
        suggestions = listOf(
            "Résume les matchs les plus serrés du moment.",
            "Quels sont les matchs à surveiller dans la prochaine heure ?",
            "Donne-moi les faits marquants et les buteurs.",
            "Analyse rapide des compétitions les plus actives aujourd'hui."
        ),
        model = model
    )

    fun generateInsight(request: AiInsightRequest): AiInsightResponse {
        val matches = matchService.getBoardMatches()
        val filtered = filterMatches(matches, request.competitionIds)
        val maxMatches = request.maxMatches?.coerceIn(1, 25) ?: 12
        val selected = filtered.take(maxMatches)
        val context = buildContext(selected)
        val competitions = selected.mapNotNull { it.competition?.name?.trim() }.distinct()
        val prompt = request.prompt?.trim()?.takeIf { it.isNotEmpty() }
            ?: "Fais un résumé des matchs et des tendances du jour."

        if (!aiSlots.tryAcquire()) {
            return AiInsightResponse(
                answer = "Le module IA est occupé. Réessayez dans quelques secondes.",
                status = "busy",
                model = model,
                matchesConsidered = selected.size,
                competitions = competitions
            )
        }

        var future: java.util.concurrent.Future<String?>? = null

        return try {
            future = aiCallExecutor.submit<String?> {
                chatClient.prompt()
                    .system(systemPrompt())
                    .user(
                        """
                        Contexte LiveFoot:
                        $context

                        Demande: $prompt
                        """.trimIndent()
                    )
                    .call()
                    .content()
            }

            val response = future.get(timeoutSeconds, TimeUnit.SECONDS)

            AiInsightResponse(
                answer = response ?: "Réponse IA indisponible pour le moment.",
                status = "ok",
                model = model,
                matchesConsidered = selected.size,
                competitions = competitions
            )
        } catch (_: Exception) {
            future?.cancel(true)
            AiInsightResponse(
                answer = "Le module IA est lent ou indisponible. Réessayez plus tard.",
                status = "timeout",
                model = model,
                matchesConsidered = selected.size,
                competitions = competitions
            )
        } finally {
            aiSlots.release()
        }
    }

    private fun filterMatches(matches: List<MatchState>, competitionIds: List<Long>?): List<MatchState> {
        if (competitionIds.isNullOrEmpty()) return matches
        val set = competitionIds.toSet()
        return matches.filter { match -> match.competition?.id?.let { set.contains(it) } == true }
    }

    private fun buildContext(matches: List<MatchState>): String {
        if (matches.isEmpty()) {
            return "Aucun match disponible pour le moment."
        }
        return matches.joinToString("\n") { match -> "- ${matchSummary(match)}" }
    }

    private fun matchSummary(match: MatchState): String {
        val competition = match.competition?.name ?: "Compétition"
        val home = match.home?.name ?: "Équipe A"
        val away = match.away?.name ?: "Équipe B"
        val score = match.scores?.score ?: "0-0"
        val status = match.status ?: "INCONNU"
        val time = match.time?.takeIf { it.isNotBlank() } ?: "--"
        val lastEvent = match.lastEvents.firstOrNull()
        val eventSummary = lastEvent?.let { formatEvent(it) } ?: "aucun événement récent"
        return "$competition | $home vs $away | score $score | statut $status ($time) | $eventSummary"
    }

    private fun formatEvent(event: MatchEvent): String {
        val minute = event.time?.trim()?.takeIf { it.isNotEmpty() }?.let { "$it'" } ?: "--'"
        val player = event.player?.trim()?.takeIf { it.isNotEmpty() }
        val side = when (event.homeAway?.trim()?.lowercase()) {
            "h", "home", "dom" -> "domicile"
            "a", "away", "ext" -> "extérieur"
            else -> null
        }
        val type = event.event?.trim()?.takeIf { it.isNotEmpty() } ?: "événement"
        val actor = listOfNotNull(player, side).joinToString(" - ").ifBlank { "inconnu" }
        return "$type à $minute ($actor)"
    }

    private fun systemPrompt(): String =
        """
        Tu es l'analyste IA de LiveFoot.
        Fournis un résumé clair des matchs du jour et des points à surveiller.
        Reste factuel et base-toi uniquement sur le contexte fourni.
        Réponds en français, sous forme de listes courtes.
        Si les données sont insuffisantes, dis-le et propose 2 questions de suivi.
        """.trimIndent()
}
