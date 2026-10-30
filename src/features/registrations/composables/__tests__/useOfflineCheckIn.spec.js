import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { clearPrivateStorage } from '@/shared/lib/privateStorage.js'
import { useOfflineCheckIn } from '../useOfflineCheckIn.js'

const EVENT = 'event-1'
const roster = [
  { registrationNumber: 'REG-ALICE00001', attendeeName: 'Alice', status: 'CONFIRMED' },
  { registrationNumber: 'REG-BOB0000001', attendeeName: 'Bob', status: 'CONFIRMED' },
  { registrationNumber: 'REG-CAROL00001', attendeeName: 'Carol', status: 'CANCELLED_BY_USER' },
  { registrationNumber: 'REG-DAVE000001', attendeeName: 'Dave', status: 'CHECKED_IN' },
]
const apiError = (code, message = code) => Object.assign(new Error(message), { code })

let scope
function start(checkIn = vi.fn().mockResolvedValue({}), onSynced = vi.fn()) {
  scope = effectScope()
  return { offline: scope.run(() => useOfflineCheckIn(EVENT, { checkIn, onSynced })), checkIn, onSynced }
}

describe('useOfflineCheckIn', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => scope?.stop())

  it('needs the participant list saved before it can check anyone in offline', () => {
    const { offline } = start()
    expect(offline.checkInOffline('REG-ALICE00001').status).toBe('no-roster')
  })

  it('queues known attendees with the scan time and refuses the rest', () => {
    const { offline } = start()
    offline.saveRoster(roster)

    expect(offline.checkInOffline(' reg-alice00001 ')).toEqual({ status: 'queued', name: 'Alice' })
    expect(offline.checkInOffline('REG-ALICE00001').status).toBe('duplicate')
    expect(offline.checkInOffline('REG-CAROL00001').status).toBe('not-checkable')
    expect(offline.checkInOffline('REG-DAVE000001').status).toBe('already')
    expect(offline.checkInOffline('REG-NOBODY0001').status).toBe('unknown')
    expect(offline.pending.value).toHaveLength(1)
    expect(offline.pending.value[0].scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(offline.isPending('REG-ALICE00001')).toBe(true)
  })

  it('keeps the list and the queue through a page reload', () => {
    start().offline.saveRoster(roster)
    scope.stop()
    const first = start().offline
    first.checkInOffline('REG-ALICE00001')
    scope.stop()

    const { offline } = start()
    expect(offline.hasRoster.value).toBe(true)
    expect(offline.pending.value.map((item) => item.registrationNumber)).toEqual(['REG-ALICE00001'])
  })

  it('syncs when the connection returns, counting another device\'s check-in as done', async () => {
    const checkIn = vi.fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(apiError('ALREADY_CHECKED_IN'))
    const { offline, onSynced } = start(checkIn)
    offline.saveRoster(roster)
    offline.checkInOffline('REG-ALICE00001')
    offline.checkInOffline('REG-BOB0000001')
    const scannedAt = offline.pending.value[0].scannedAt

    window.dispatchEvent(new Event('online'))
    await vi.waitFor(() => expect(onSynced).toHaveBeenCalledWith(2))

    expect(checkIn).toHaveBeenCalledWith(EVENT, 'REG-ALICE00001', scannedAt)
    expect(offline.pending.value).toHaveLength(0)
    expect(offline.online.value).toBe(true)
  })

  it('stops while still offline and keeps rejected check-ins for staff to handle', async () => {
    const checkIn = vi.fn()
      .mockRejectedValueOnce(apiError('REGISTRATION_NOT_CHECKABLE', 'This registration cannot be checked in.'))
      .mockRejectedValueOnce(apiError('NETWORK_ERROR'))
    const { offline, onSynced } = start(checkIn)
    offline.saveRoster(roster)
    offline.checkInOffline('REG-ALICE00001')
    offline.checkInOffline('REG-BOB0000001')

    await offline.sync()

    expect(onSynced).not.toHaveBeenCalled()
    expect(offline.failed.value).toEqual([expect.objectContaining({
      registrationNumber: 'REG-ALICE00001', error: 'This registration cannot be checked in.',
    })])
    expect(offline.pending.value.map((item) => item.registrationNumber)).toEqual(['REG-BOB0000001'])

    offline.dismiss('REG-ALICE00001')
    expect(offline.failed.value).toHaveLength(0)
  })

  it('retries every 30 seconds while check-ins are waiting, even without an "online" event', async () => {
    vi.useFakeTimers()
    try {
      const checkIn = vi.fn()
        .mockRejectedValueOnce(apiError('NETWORK_ERROR'))
        .mockResolvedValueOnce({})
      const { offline, onSynced } = start(checkIn)
      offline.saveRoster(roster)
      offline.checkInOffline('REG-ALICE00001')

      await vi.advanceTimersByTimeAsync(30_000)
      expect(checkIn).toHaveBeenCalledTimes(1)
      expect(offline.pending.value).toHaveLength(1)

      await vi.advanceTimersByTimeAsync(30_000)
      expect(checkIn).toHaveBeenCalledTimes(2)
      expect(onSynced).toHaveBeenCalledWith(1)
      expect(offline.pending.value).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps check-ins queued when the session has expired instead of marking them rejected', async () => {
    const { offline } = start(vi.fn().mockRejectedValue(Object.assign(apiError('UNAUTHENTICATED'), { status: 401 })))
    offline.saveRoster(roster)
    offline.checkInOffline('REG-ALICE00001')

    await offline.sync()

    expect(offline.failed.value).toHaveLength(0)
    expect(offline.pending.value).toHaveLength(1)
  })

  it('loses the saved participant list at sign-out but keeps unsynced check-ins', () => {
    const { offline } = start()
    offline.saveRoster(roster)
    offline.checkInOffline('REG-ALICE00001')
    scope.stop()

    clearPrivateStorage()

    const after = start().offline
    expect(after.hasRoster.value).toBe(false)
    expect(after.pending.value.map((item) => item.registrationNumber)).toEqual(['REG-ALICE00001'])
  })
})
