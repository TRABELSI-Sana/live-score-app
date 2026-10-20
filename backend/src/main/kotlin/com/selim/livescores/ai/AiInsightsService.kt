package com.selim.livescores.ai

import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.service.MatchService
import jakarta.annotation.PreDestroy
import org.springframework.ai.chat.client.ChatClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.concurrent.ExecutionException
import java.util.concurrent.Executors
import java.util.concurrent.Semaphore
import java.util.concurrent.Future
import java.util.concurrent.TimeoutException
import java.util.concurrent.TimeUnit

@Service
class AiInsightsService(
    private val chatClient: ChatClient,
    private val matchService: MatchService,
    @Value("\${spring.ai.ollama.chat.options.model:qwen2.5:3b}")
    private val model: String,
    @Value("\${app.ai.timeout-seconds:25}")
    private val timeoutSeconds: Long,
    @Value("\${app.ai.max-concurrent-requests:1}")
    maxConcurrentRequests: Int,
    @Value("\${app.ai.cache-seconds:60}")
    private val cacheSeconds: Long = 60
) {
    private val aiCallExecutor = Executors.newFixedThreadPool(2)
    private val aiSlots = Semaphore(maxConcurrentRequests.coerceIn(1, 10))

    private data class InsightKey(val model: String, val prompt: String, val context: String)
    private data class CachedInsight(val response: AiInsightResponse, val expiresAt: Long)
    private val cacheLock = Any()
    private val cache = LinkedHashMap<InsightKey, CachedInsight>()
    private val inFlight = mutableMapOf<InsightKey, Future<AiInsightResponse>>()

    @PreDestroy
    fun shutdown() {
        aiCallExecutor.shutdownNow()
    }

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
        val prompt = request.prompt?.trim()?.take(600)?.takeIf { it.isNotEmpty() }
            ?: "Fais un résumé des matchs et des tendances du jour."

        val key = InsightKey(model, prompt, context)
        fun response(answer: String, status: String) = AiInsightResponse(
            answer = answer,
            status = status,
            model = model,
            matchesConsidered = selected.size,
            competitions = competitions
        )

        val future = synchronized(cacheLock) {
            val now = System.nanoTime()
            cache.entries.removeIf { it.value.expiresAt <= now }
            cache[key]?.let { return it.response }
            inFlight[key] ?: run {
                if (!aiSlots.tryAcquire()) {
                    return response("Le module IA est occupé. Réessayez dans quelques secondes.", "busy")
                }
                val task = aiCallExecutor.submit<AiInsightResponse> {
                    try {
                        val answer = chatClient.prompt()
                            .system(systemPrompt())
                            .user("Contexte LiveFoot:\n$context\n\nDemande: $prompt")
                            .call()
                            .content()
                            ?.trim()
                            ?.takeIf { it.isNotEmpty() }
                        if (answer == null) {
                            response("Réponse IA indisponible pour le moment.", "error")
                        } else {
                            val result = response(answer, "ok")
                            synchronized(cacheLock) {
                                if (cacheSeconds > 0) {
                                    cache[key] = CachedInsight(result, System.nanoTime() + TimeUnit.SECONDS.toNanos(cacheSeconds))
                                    while (cache.size > 64) cache.remove(cache.keys.first())
                                }
                            }
                            result
                        }
                    } finally {
                        synchronized(cacheLock) {
                            inFlight.remove(key)
                            aiSlots.release()
                        }
                    }
                }
                inFlight[key] = task
                task
            }
        }

        return try {
            future.get(timeoutSeconds, TimeUnit.SECONDS)
        } catch (_: TimeoutException) {
            // The shared generation retains its slot until it actually finishes.
            // A browser timeout must not queue another expensive Ollama request.
            response("Le module IA est lent ou indisponible. Réessayez plus tard.", "timeout")
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
            response("La génération IA a été interrompue. Réessayez dans un instant.", "interrupted")
        } catch (_: ExecutionException) {
            response("Le module IA est momentanément indisponible. Réessayez plus tard.", "error")
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
        Réponds uniquement en français, en 3 points maximum et 60 mots maximum.
        N'invente aucun résultat, horaire, événement ou motif de report.
        LIVE, 1H, 2H et HT indiquent un match en cours : parle de score provisoire, jamais de victoire acquise.
        NOT_STARTED, NS et TIMED indiquent un match à venir. Seuls FINISHED, FT, AET et PEN indiquent un match terminé.
        Si les données sont insuffisantes, dis-le brièvement.
        """.trimIndent()
}
