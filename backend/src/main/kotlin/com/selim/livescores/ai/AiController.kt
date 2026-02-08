package com.selim.livescores.ai

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/ai")
class AiController(
    private val aiInsightsService: AiInsightsService
) {
    @GetMapping("/suggestions")
    fun suggestions(): AiSuggestionsResponse = aiInsightsService.suggestions()

    @PostMapping("/insights")
    fun insights(@RequestBody request: AiInsightRequest): AiInsightResponse =
        aiInsightsService.generateInsight(request)
}
