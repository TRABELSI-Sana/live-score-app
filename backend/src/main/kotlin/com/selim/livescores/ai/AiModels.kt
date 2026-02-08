package com.selim.livescores.ai

import java.time.OffsetDateTime

data class AiInsightRequest(
    val prompt: String? = null,
    val maxMatches: Int? = null,
    val competitionIds: List<Long>? = null
)

data class AiInsightResponse(
    val answer: String,
    val status: String,
    val model: String,
    val matchesConsidered: Int,
    val competitions: List<String>,
    val generatedAt: String = OffsetDateTime.now().toString()
)

data class AiSuggestionsResponse(
    val suggestions: List<String>,
    val model: String
)
