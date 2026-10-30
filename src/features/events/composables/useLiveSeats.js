import { onScopeDispose, watch } from 'vue'

const MAX_RETRY_DELAY_MS = 30_000

function socketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/v1/ws/seats`
}

/**
 * Calls onUpdate({ eventId, remainingSeats, full }) whenever the server reports a new seat count for
 * the watched event. A dropped socket reconnects after 1s, 2s, 4s... up to 30s; if the socket never
 * connects the page simply keeps the count it loaded.
 */
export function useLiveSeats(eventId, onUpdate) {
  let socket = null
  let retryTimer = null
  let retryDelay = 1000
  let stopped = false

  function close() {
    window.clearTimeout(retryTimer)
    retryTimer = null
    if (socket) {
      socket.onclose = null
      socket.close()
      socket = null
    }
  }

  function connect(id) {
    if (stopped || !id || typeof WebSocket === 'undefined') return
    socket = new WebSocket(socketUrl())
    socket.onopen = () => {
      retryDelay = 1000
      socket.send(JSON.stringify({ subscribe: id }))
    }
    socket.onmessage = (message) => {
      try {
        const update = JSON.parse(message.data)
        if (update?.eventId === id) onUpdate(update)
      } catch {
        // Ignore anything that is not a seat update.
      }
    }
    socket.onclose = (closeEvent) => {
      socket = null
      // 1008 means the server does not know this event; retrying would only repeat that.
      if (stopped || closeEvent.code === 1008) return
      retryTimer = window.setTimeout(() => connect(id), retryDelay)
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS)
    }
  }

  watch(eventId, (id) => {
    close()
    retryDelay = 1000
    connect(id)
  }, { immediate: true })

  onScopeDispose(() => {
    stopped = true
    close()
  })
}
