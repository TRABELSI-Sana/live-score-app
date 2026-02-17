package com.selim.livescores.sse

import org.springframework.stereotype.Component
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

@Component
class SseHub {
    private val emittersByChannel = ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>()

    fun subscribe(channel: String): SseEmitter {
        val emitter = SseEmitter(0L)
        emittersByChannel.computeIfAbsent(channel) { CopyOnWriteArrayList() }.add(emitter)

        fun removeEmitter() {
            val channelEmitters = emittersByChannel[channel] ?: return
            channelEmitters.remove(emitter)
            if (channelEmitters.isEmpty()) {
                emittersByChannel.remove(channel, channelEmitters)
            }
        }

        emitter.onCompletion(::removeEmitter)
        emitter.onTimeout(::removeEmitter)
        emitter.onError { removeEmitter() }
        return emitter
    }

    fun publish(channel: String, eventName: String, data: Any) {
        val channelEmitters = emittersByChannel[channel] ?: return
        val deadEmitters = mutableListOf<SseEmitter>()

        channelEmitters.forEach { emitter ->
            try {
                emitter.send(
                    SseEmitter.event()
                        .name(eventName)
                        .data(data)
                )
            } catch (_: Exception) {
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
