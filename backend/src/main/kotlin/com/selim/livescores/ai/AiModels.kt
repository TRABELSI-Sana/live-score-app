package com.selim.livescores.ai

import java.time.OffsetDateTime

data class AiInsightRequest(
    val prompt: String? = null,
    val maxMatches: Int? = null,
    val competitionIds: List<Long>? = null,
    val focus: String? = null
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

data class AiChatMessage(
    @field:jakarta.validation.constraints.Pattern(regexp = "user|assistant")
    val role: String,
    @field:jakarta.validation.constraints.NotBlank
    @field:jakarta.validation.constraints.Size(max = 1200)
    val content: String
)

data class AiChatRequest(
    @field:jakarta.validation.constraints.NotBlank
    @field:jakarta.validation.constraints.Size(max = 1000)
    val message: String,
    @field:jakarta.validation.Valid
    @field:jakarta.validation.constraints.Size(max = 6)
    val history: List<AiChatMessage> = emptyList(),
    @field:jakarta.validation.constraints.Size(max = 80)
    val timeZone: String = "UTC"
)
