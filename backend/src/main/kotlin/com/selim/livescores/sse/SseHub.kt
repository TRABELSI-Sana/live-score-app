package com.selim.livescores.sse

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue

@Component
class SseHub(private val objectMapper: ObjectMapper) {
    companion object {
        private const val SSE_TIMEOUT_MS = 120_000L
    }

    private val emittersByChannel = ConcurrentHashMap<String, ConcurrentLinkedQueue<SseEmitter>>()

    fun subscribe(channel: String): SseEmitter {
        val emitter = SseEmitter(SSE_TIMEOUT_MS)
        emittersByChannel.computeIfAbsent(channel) { ConcurrentLinkedQueue() }.add(emitter)

        fun removeEmitter() {
            val channelEmitters = emittersByChannel[channel] ?: return
            channelEmitters.remove(emitter)
            if (channelEmitters.isEmpty()) {
                emittersByChannel.remove(channel, channelEmitters)
            }
        }

        emitter.onCompletion(::removeEmitter)
        emitter.onTimeout {
            removeEmitter()
            emitter.complete()
        }
        emitter.onError {
            removeEmitter()
            emitter.complete()
        }
        return emitter
    }

    fun publish(channel: String, eventName: String, data: Any) {
        val channelEmitters = emittersByChannel[channel] ?: return
        if (channelEmitters.isEmpty()) return

        val json = objectMapper.writeValueAsString(data)
        val deadEmitters = mutableListOf<SseEmitter>()

        for (emitter in channelEmitters) {
            try {
                emitter.send(
                    SseEmitter.event()
                        .name(eventName)
                        .data(json)
                )
            } catch (_: java.io.IOException) {
                emitter.complete()
                deadEmitters.add(emitter)
            }
        }

        if (deadEmitters.isNotEmpty()) {
            channelEmitters.removeAll(deadEmitters.toSet())
            if (channelEmitters.isEmpty()) {
                emittersByChannel.remove(channel, channelEmitters)
            }
        }
    }
}
