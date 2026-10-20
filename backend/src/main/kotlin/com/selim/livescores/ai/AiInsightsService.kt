package com.selim.livescores.ai

import com.selim.livescores.domain.MatchEvent
import com.selim.livescores.domain.MatchState
import com.selim.livescores.domain.MatchStatus
import com.selim.livescores.service.MatchService
import jakarta.annotation.PreDestroy
import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.chat.messages.AssistantMessage
import org.springframework.ai.chat.messages.UserMessage
import org.springframework.ai.chat.messages.Message
import org.springframework.ai.ollama.api.OllamaChatOptions
import java.text.Normalizer
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
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
        val scoped = MatchBriefingBuilder.select(filtered, request.focus ?: "overview")
        val selected = (if (request.focus in setOf("live", "upcoming", "finished")) scoped else (scoped + filtered).distinct()).take(maxMatches)
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

        if (selected.isEmpty()) return response("Aucune rencontre disponible dans cette sélection pour le moment.", "empty")

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

    fun chat(request: AiChatRequest): AiInsightResponse {
        val question = request.message.trim().take(1000)
        if (question.isEmpty()) return AiInsightResponse("Écrivez un message pour commencer.", "empty", model, 0, emptyList())
        val matches = runCatching { matchService.getBoardMatches() }.getOrDefault(emptyList())
        val contextQuery = normalizeText(request.history.takeLast(2).filter { it.role == "user" }.joinToString(" ") { it.content } + " " + question)
        val relevant = matches.filter { match ->
            listOfNotNull(match.home?.name, match.away?.name, match.competition?.name).any { name ->
                normalizeText(name).split(" ").any { it.length >= 4 && contextQuery.contains(it) }
            }
        }
        val footballWords = setOf("match", "matchs", "matches", "football", "foot", "score", "scores", "buteur", "buteurs", "championnat", "ligue", "league", "psg")
        val useFootball = relevant.isNotEmpty() || contextQuery.split(" ").any { it in footballWords }
        val selected = if (useFootball) MatchBriefingBuilder.select(relevant.ifEmpty { matches }).take(4) else emptyList()
        val briefing = MatchBriefingBuilder.build(matches)
        val zone = runCatching { ZoneId.of(request.timeZone) }.getOrDefault(ZoneId.of("UTC"))
        val timeFormat = DateTimeFormatter.ofPattern("HH:mm z").withZone(zone)
        val context = selected.joinToString("\n") { match ->
            val kickoff = runCatching { timeFormat.format(Instant.parse(match.scheduled)) }.getOrDefault("horaire non renseigné")
            "${matchSummary(match).substringBefore(" | coup d’envoi")} | ${match.lastEvents.firstOrNull()?.let(::formatEvent) ?: "aucun événement renseigné"} | coup d’envoi local $kickoff"
        }.ifBlank { "Aucune donnée de match disponible." }
        val snapshot = if (useFootball) "Programme : ${briefing.liveCount} en cours, ${briefing.upcomingCount} à venir, ${briefing.finishedCount} terminés. Sélection de ${selected.size} rencontres, pas le programme complet :\n$context"
            else "Question générale : réponds au sujet demandé sans ajouter de commentaires sur les matchs."
        val history: List<Message> = request.history.takeLast(4).mapNotNull {
            val content = it.content.take(450)
            when (it.role) {
                "user" -> UserMessage(content)
                "assistant" -> AssistantMessage(content)
                else -> null
            }
        }
        fun response(answer: String, status: String) = AiInsightResponse(
            answer, status, model, selected.size, selected.mapNotNull { it.competition?.name }.distinct()
        )
        if (!aiSlots.tryAcquire()) return response("L’assistant est occupé. Réessayez dans quelques secondes.", "busy")
        val future = aiCallExecutor.submit<String?> {
            try {
                chatClient.prompt()
                    .system(
                        """
                        Tu es un assistant généraliste serviable. Réponds en français, sauf si une autre langue est demandée.
                        Aide à expliquer, écrire, coder ou discuter. Réponds directement en 120 mots maximum ; développe seulement sur demande.
                        Tu ne navigues pas sur Internet et tu n’exécutes pas de commandes. Ne prétends jamais avoir effectué une action externe.
                        Pour une question sur les matchs LiveFoot, utilise uniquement les données ci-dessous. Les scores en cours sont provisoires.
                        Ne donne aucun favori ou pronostic sans données. Pour les autres sujets, utilise tes connaissances et indique tes incertitudes.
                        Les horaires du contexte sont dans le fuseau ${zone.id}. Ignore les dates historiques sans rapport avec la question.
                        $snapshot
                        """.trimIndent()
                    )
                    .messages(history)
                    .user(question)
                    .options(OllamaChatOptions.builder().numPredict(240).temperature(0.2).build())
                    .call().content()
            } finally {
                aiSlots.release()
            }
        }
        return try {
            val answer = future.get(timeoutSeconds, TimeUnit.SECONDS)?.trim()?.takeIf { it.isNotEmpty() }
            if (answer == null) response("L’assistant n’a pas pu répondre. Réessayez.", "error") else response(answer, "ok")
        } catch (_: TimeoutException) {
            response("La réponse prend trop de temps. Réessayez dans un instant.", "timeout")
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
            response("La demande a été interrompue. Vous pouvez réessayer.", "interrupted")
        } catch (_: ExecutionException) {
            response("L’assistant est momentanément indisponible. Réessayez.", "error")
        }
    }

    private fun normalizeText(value: String): String = Normalizer.normalize(value.lowercase(), Normalizer.Form.NFD)
        .replace(Regex("\\p{M}"), "").replace(Regex("[^a-z0-9]+"), " ").trim()

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
        val normalized = MatchStatus.normalize(match.status)
        val upcoming = normalized in setOf(MatchStatus.NOT_STARTED, "SCHEDULED", "TIMED")
        val score = if (upcoming) "non commencé" else match.scores?.score ?: "non renseigné"
        val status = when {
            MatchStatus.isLive(match.status) -> "EN COURS, score provisoire"
            MatchStatus.isFinished(match.status) -> "TERMINÉ"
            upcoming -> "À VENIR"
            else -> match.status ?: "INCONNU"
        }
        val time = match.time?.takeIf { it.isNotBlank() } ?: "--"
        val lastEvent = match.lastEvents.firstOrNull()
        val eventSummary = lastEvent?.let { formatEvent(it) } ?: "aucun événement récent"
        val kickoff = match.scheduled ?: "non renseigné"
        return "$competition | $home vs $away | score $score | statut $status ($time) | coup d’envoi $kickoff | $eventSummary"
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
        Explique ce qui mérite l’attention dans les rencontres sélectionnées : score serré, fin de match, prochain coup d’envoi.
        Ne récite pas le programme et ne regroupe jamais les équipes de plusieurs lignes.
        Sans statistiques de forme ou de classement, ne prétends pas connaître les favoris, enjeux ou chances de victoire.
        Reste factuel et base-toi uniquement sur le contexte fourni.
        Réponds uniquement en français, en 3 points maximum et 60 mots maximum.
        N'invente aucun résultat, horaire, événement ou motif de report.
        IN PLAY, ADDED TIME, HALF TIME BREAK, LIVE, 1H, 2H et HT indiquent un match en cours : parle de score provisoire, jamais de victoire acquise.
        NOT STARTED, NOT_STARTED, NS et TIMED indiquent un match à venir. Seuls FINISHED, FT, AET et PEN indiquent un match terminé.
        Si les données sont insuffisantes, dis-le brièvement.
        """.trimIndent()
}
