package com.selim.livescores.domain

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class MatchStatusTest {

    @Test
    fun `normalizes provider aliases`() {
        assertEquals(MatchStatus.FINISHED, MatchStatus.normalize("ft"))
        assertEquals(MatchStatus.FINISHED, MatchStatus.normalize("AET"))
        assertEquals(MatchStatus.HALF_TIME_BREAK, MatchStatus.normalize("half-time"))
    }

    @Test
    fun `live and finished checks use normalized status`() {
        assertTrue(MatchStatus.isLive("HALF TIME"))
        assertTrue(MatchStatus.isFinished("penalties"))
        assertFalse(MatchStatus.isLive("FT"))
    }
}
