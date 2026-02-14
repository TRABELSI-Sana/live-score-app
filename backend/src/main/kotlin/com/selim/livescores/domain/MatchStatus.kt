package com.selim.livescores.domain

object MatchStatus {
    const val NOT_STARTED = "NOT STARTED"
    const val IN_PLAY = "IN PLAY"
    const val ADDED_TIME = "ADDED TIME"
    const val HALF_TIME_BREAK = "HALF TIME BREAK"
    const val FINISHED = "FINISHED"
    const val UNKNOWN = "UNKNOWN"

    private val LIVE = setOf(IN_PLAY, ADDED_TIME, HALF_TIME_BREAK, "HALF TIME")
    private val FINISHED_ALIASES = setOf(FINISHED, "FT", "AFTER EXTRA TIME", "AET", "PENALTIES", "PEN")

    fun normalize(status: String?): String {
        val normalized = status
            ?.trim()
            ?.uppercase()
            ?.replace('_', ' ')
            ?.replace('-', ' ')
            ?.replace(Regex("\\s+"), " ")
            ?: return UNKNOWN

        return when {
            normalized in LIVE -> when (normalized) {
                "HALF TIME" -> HALF_TIME_BREAK
                else -> normalized
            }
            normalized in FINISHED_ALIASES -> FINISHED
            normalized == "NOTSTARTED" -> NOT_STARTED
            else -> normalized
        }
    }

    fun isLive(status: String?): Boolean = normalize(status) in LIVE
    fun isFinished(status: String?): Boolean = normalize(status) == FINISHED
}
