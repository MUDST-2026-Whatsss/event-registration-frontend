import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { useLiveSeats } from '../useLiveSeats.js'

class FakeSocket {
  static instances = []
  constructor(url) {
    this.url = url
    this.sent = []
    FakeSocket.instances.push(this)
  }
  send(data) { this.sent.push(JSON.parse(data)) }
  close() { this.closed = true }
  open() { this.onopen?.() }
  receive(data) { this.onmessage?.({ data: JSON.stringify(data) }) }
  drop(code = 1006) { this.onclose?.({ code }) }
}

function start(eventId) {
  const updates = []
  const scope = effectScope()
  scope.run(() => useLiveSeats(eventId, (update) => updates.push(update)))
  return { updates, scope }
}

describe('useLiveSeats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    FakeSocket.instances = []
    vi.stubGlobal('WebSocket', FakeSocket)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('subscribes to the event and passes its seat updates on', () => {
    const { updates } = start(ref('event-1'))
    const socket = FakeSocket.instances[0]
    expect(socket.url).toMatch(/^ws:\/\/.+\/api\/v1\/ws\/seats$/)

    socket.open()
    socket.receive({ eventId: 'event-1', remainingSeats: 4, full: false })
    socket.receive({ eventId: 'another-event', remainingSeats: 0, full: true })
    socket.receive('not json at all')

    expect(socket.sent).toEqual([{ subscribe: 'event-1' }])
    expect(updates).toEqual([{ eventId: 'event-1', remainingSeats: 4, full: false }])
  })

  it('reconnects with a growing delay after the connection drops', () => {
    start(ref('event-1'))
    FakeSocket.instances[0].drop()

    vi.advanceTimersByTime(999)
    expect(FakeSocket.instances).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(FakeSocket.instances).toHaveLength(2)

    FakeSocket.instances[1].drop()
    vi.advanceTimersByTime(1999)
    expect(FakeSocket.instances).toHaveLength(2)
    vi.advanceTimersByTime(1)
    expect(FakeSocket.instances).toHaveLength(3)
  })

  it('does not retry when the server rejects the event', () => {
    start(ref('unknown-event'))
    FakeSocket.instances[0].drop(1008)

    vi.advanceTimersByTime(60_000)
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('switches events and closes the socket when the page goes away', async () => {
    const eventId = ref('event-1')
    const { scope } = start(eventId)

    eventId.value = 'event-2'
    await Promise.resolve()
    expect(FakeSocket.instances[0].closed).toBe(true)
    FakeSocket.instances[1].open()
    expect(FakeSocket.instances[1].sent).toEqual([{ subscribe: 'event-2' }])

    scope.stop()
    expect(FakeSocket.instances[1].closed).toBe(true)
    vi.advanceTimersByTime(60_000)
    expect(FakeSocket.instances).toHaveLength(2)
  })
})
