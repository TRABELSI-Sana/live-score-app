package com.selim.livescores.ai

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.Executors

@RestController
@RequestMapping("/api/ai")
class AiController(
    private val aiInsightsService: AiInsightsService
) {
    private val aiStreamExecutor = Executors.newFixedThreadPool(4)

    @GetMapping("/suggestions")
    fun suggestions(): AiSuggestionsResponse = aiInsightsService.suggestions()

    @PostMapping("/insights")
    fun insights(@RequestBody request: AiInsightRequest): AiInsightResponse =
        aiInsightsService.generateInsight(request)

    @GetMapping("/insights/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun insightsStream(
        @RequestParam(required = false) prompt: String?,
        @RequestParam(required = false) maxMatches: Int?,
        @RequestParam(required = false) competitionIds: List<Long>?
    ): SseEmitter {
        val emitter = SseEmitter(30_000L)
        val request = AiInsightRequest(
            prompt = prompt,
            maxMatches = maxMatches,
            competitionIds = competitionIds
        )

        aiStreamExecutor.submit {
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("status")
                        .data("processing")
                )

                val response = aiInsightsService.generateInsight(request)

                emitter.send(
                    SseEmitter.event()
                        .name("insight")
                        .data(response)
                )
                emitter.complete()
            } catch (ex: Exception) {
                try {
                    emitter.send(
                        SseEmitter.event()
                            .name("error")
                            .data("Le résumé IA est momentanément indisponible.")
                    )
                } catch (_: Exception) {
                    // ignore secondary send errors
                }
                emitter.completeWithError(ex)
            }
        }

        return emitter
    }
}
