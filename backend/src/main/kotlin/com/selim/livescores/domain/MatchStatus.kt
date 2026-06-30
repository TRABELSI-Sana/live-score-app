package com.selim.livescores.domain

object MatchStatus {
    const val NOT_STARTED = "NOT STARTED"
    const val IN_PLAY = "IN PLAY"
    const val ADDED_TIME = "ADDED TIME"
    const val HALF_TIME_BREAK = "HALF TIME BREAK"
    const val FINISHED = "FINISHED"
    const val UNKNOWN = "UNKNOWN"

    private val LIVE = setOf(IN_PLAY, ADDED_TIME, HALF_TIME_BREAK, "HALF TIME")
    private val FINISHED_ALIASES = setOf(FINISHED, "FT", "AFTER EXTRA TIME", "AET", "PENALTIES", "PEN", "CANC", "ABD", "AWD", "WO")
    private val NOT_STARTED_ALIASES = setOf("NS", "TBD", "PST", "NOTSTARTED")
    private val API_FOOTBALL_LIVE = setOf("1H", "2H", "ET", "LIVE")
    private val API_FOOTBALL_BREAK = setOf("HT", "BT")
    private val API_FOOTBALL_ADDED = setOf("P", "SUSP", "INT")
    private val API_FOOTBALL_FINISHED = setOf("FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO")

    fun normalize(status: String?): String {
        val normalized = status
            ?.trim()
            ?.uppercase()
            ?.replace('_', ' ')
            ?.replace('-', ' ')
            ?.replace(Regex("\\s+"), " ")
            ?: return UNKNOWN

        return when {
            normalized in NOT_STARTED_ALIASES -> NOT_STARTED
            normalized in API_FOOTBALL_LIVE -> IN_PLAY
            normalized in API_FOOTBALL_BREAK -> HALF_TIME_BREAK
            normalized in API_FOOTBALL_ADDED -> ADDED_TIME
            normalized in API_FOOTBALL_FINISHED -> FINISHED
            normalized in LIVE -> when (normalized) {
                "HALF TIME" -> HALF_TIME_BREAK
                else -> normalized
            }
            normalized in FINISHED_ALIASES -> FINISHED
            else -> normalized
        }
    }

    fun isLive(status: String?): Boolean = normalize(status) in LIVE
    fun isFinished(status: String?): Boolean = normalize(status) == FINISHED
}
