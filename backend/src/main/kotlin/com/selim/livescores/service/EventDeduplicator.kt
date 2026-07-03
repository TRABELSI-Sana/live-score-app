package com.selim.livescores.service

import com.selim.livescores.domain.MatchEvent
import java.time.Instant

class EventDeduplicator(private val matchKey: String) {
    fun merge(current: List<MatchEvent>, incoming: List<MatchEvent>, keepLast: Int): List<MatchEvent> {
        if (incoming.isEmpty()) return current

        // Merge current + new, de-dupe with enrichment updates
        val mergedMap = LinkedHashMap<String, MatchEvent>()
        (current + incoming).forEach { e ->
            val (baseKey, noPlayerKey, candidateKey) = keysFor(e)
            // If we already have an older "no player" placeholder, let the richer event overwrite it.
            // Also check the base key (without side) to handle side-missing duplicates.
            val k = when {
                candidateKey != noPlayerKey && mergedMap.containsKey(noPlayerKey) -> noPlayerKey
                candidateKey != baseKey && mergedMap.containsKey(baseKey) -> baseKey
                else -> candidateKey
            }

            val existing = mergedMap[k]
            if (existing == null || isBetter(e, existing)) {
                mergedMap[k] = e
            }
        }

        val ordered = mergedMap.values
            .sortedWith(
                compareBy<MatchEvent>(
                    { TimeParser.parseMinute(it.minute, it.time) ?: Int.MAX_VALUE },
                    { sortTs(it) }
                )
            )

        // Always keep scorers: goals must not be trimmed away when we cap the event list.
        val goals = ordered.filter { normEventType(it.event) == "GOAL" }
        val others = ordered.filterNot { normEventType(it.event) == "GOAL" }

        val kept = if (goals.size >= keepLast) {
            goals.takeLast(keepLast)
        } else {
            val remaining = keepLast - goals.size
            goals + others.takeLast(remaining)
        }

        return kept.sortedWith(
            compareBy<MatchEvent>(
                { TimeParser.parseMinute(it.minute, it.time) ?: Int.MAX_VALUE },
                { sortTs(it) }
            )
        )
    }

    private fun normSide(s: String?): String {
        val v = (s ?: "").trim().lowercase()
        return when {
            v.startsWith("h") -> "h"   // h, home, host...
            v.startsWith("a") -> "a"   // a, away, guest...
            else -> v
        }
    }

    private fun normEventType(s: String?): String = (s ?: "").trim().uppercase()

    private fun dedupMinuteKey(e: MatchEvent): Int {
        val minuteKey = TimeParser.parseMinute(e.minute, e.time) ?: -1
        val type = normEventType(e.event)

        // For goals/cards, providers often fluctuate by +/- 1 minute. We bucket by 2-minute windows.
        // Example: 2' and 3' => same bucket, 67' and 67' => same bucket.
        if (type == "GOAL" || type == "YELLOWCARD" || type == "REDCARD") {
            val baseMinute = if (minuteKey >= 0) (minuteKey / 100) else -1
            return if (baseMinute >= 0) (baseMinute / 2) else -1
        }

        // Default: keep exact ordering key (includes added time as 4502, 9003, ...)
        return minuteKey
    }

    private fun normPlayerKey(player: String?): String {
        val raw = (player ?: "").trim()
        if (raw.isEmpty()) return ""
        val noAccents = java.text.Normalizer
            .normalize(raw, java.text.Normalizer.Form.NFD)
            .replace(Regex("\\p{Mn}+"), "")
        // Use surname (last meaningful word, >1 char) for dedup — handles "B. Embolo" vs "Breel Embolo"
        val words = noAccents.lowercase()
            .replace(Regex("[^a-z\\s]"), "")
            .split(Regex("\\s+"))
            .filter { it.length > 1 }
        // If no meaningful word found (single initial like "A"), treat as no-player for dedup
        return words.lastOrNull() ?: ""
    }

    private fun normTimeKey(time: String?): String = TimeParser.normalize(time)

    /**
     * Stable identity for de-dup.
     *
     * Returns Triple(baseKey, noPlayerKey, candidateKey):
     * - baseKey: type + minuteKey only (no side, no player) — catches side-missing duplicates
     * - noPlayerKey: type + minuteKey + side — catches player-missing duplicates
     * - candidateKey: type + minuteKey + side + player — full identity
     *
     * When merging, we check noPlayerKey and baseKey first so that a richer
     * event replaces a poorer placeholder.
     */
    private fun keysFor(e: MatchEvent): Triple<String, String, String> {
        val minuteKey = dedupMinuteKey(e)
        val type = normEventType(e.event)
        val side = normSide(e.homeAway)

        val baseKey = "$matchKey|$type|m:$minuteKey"
        val sidePart = if (side == "h" || side == "a") "|s:$side" else ""
        val noPlayerKey = "$baseKey$sidePart"

        val p = normPlayerKey(e.player)
        val candidateKey = if (p.isNotEmpty()) "$noPlayerKey|p:$p" else noPlayerKey
        return Triple(baseKey, noPlayerKey, candidateKey)
    }

    private fun isBetter(newE: MatchEvent, oldE: MatchEvent): Boolean {
        val newPlayer = (newE.player ?: "").trim()
        val oldPlayer = (oldE.player ?: "").trim()

        val newHasPlayer = newPlayer.isNotEmpty()
        val oldHasPlayer = oldPlayer.isNotEmpty()

        // Prefer enriched events with a player name
        if (newHasPlayer && !oldHasPlayer) return true
        if (!newHasPlayer && oldHasPlayer) return false

        // If both have a player, prefer the more informative one (often full name > initials)
        if (newHasPlayer && oldHasPlayer && newPlayer.length != oldPlayer.length) {
            return newPlayer.length > oldPlayer.length
        }

        // Prefer enriched events with a known side (home/away)
        val newSide = normSide(newE.homeAway)
        val oldSide = normSide(oldE.homeAway)
        val newHasSide = newSide == "h" || newSide == "a"
        val oldHasSide = oldSide == "h" || oldSide == "a"
        if (newHasSide && !oldHasSide) return true
        if (!newHasSide && oldHasSide) return false

        // Prefer enriched events with a usable time string
        val newHasTime = normTimeKey(newE.time).isNotEmpty()
        val oldHasTime = normTimeKey(oldE.time).isNotEmpty()
        if (newHasTime && !oldHasTime) return true
        if (!newHasTime && oldHasTime) return false

        // Otherwise keep the existing one to avoid churn on identical events.
        return false
    }

    private fun sortTs(e: MatchEvent): Instant = e.ts ?: Instant.EPOCH
}
