import { computed, onScopeDispose, ref } from 'vue'
import { PRIVATE_STORAGE_PREFIX } from '@/shared/lib/privateStorage.js'

const CHECKABLE = ['CONFIRMED', 'NO_SHOW']
const RETRY_INTERVAL_MS = 30_000
// The participant list is cleared at sign-out; the queue is not, or unsynced check-ins would be lost.
const rosterKey = (eventId) => `${PRIVATE_STORAGE_PREFIX}checkIn.roster.${eventId}`
const queueKey = (eventId) => `eventsss.checkIn.queue.${eventId}`

// Storage can be full, disabled or private; the page still works, the data just lives in memory.
function readJson(key, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key))
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Keep going with the in-memory copy.
  }
}

const normalize = (registrationNumber) => registrationNumber.trim().toUpperCase()

/**
 * Lets staff keep checking people in while the internet is down.
 *
 * The participant list is saved on the device while online. Offline, a scan is matched against it
 * and queued with the time it happened; the queue survives a page reload and is sent once the
 * device is back online, and retried every 30 seconds while any are waiting, because the browser can
 * report "online" on a network that cannot reach the server yet. Rejected items stay in the queue
 * with their error until staff dismiss them.
 *
 * checkIn(eventId, registrationNumber, scannedAt) sends one check-in to the server.
 */
export function useOfflineCheckIn(eventId, { checkIn, onSynced = () => {} }) {
  const roster = ref(readJson(rosterKey(eventId), []))
  const queue = ref(readJson(queueKey(eventId), []))
  const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const syncing = ref(false)

  const pending = computed(() => queue.value.filter((item) => !item.error))
  const failed = computed(() => queue.value.filter((item) => item.error))
  const hasRoster = computed(() => roster.value.length > 0)

  function saveQueue() {
    writeJson(queueKey(eventId), queue.value)
  }

  function saveRoster(registrations) {
    roster.value = registrations.map((registration) => ({
      registrationNumber: registration.registrationNumber,
      name: registration.attendeeName,
      status: registration.status,
    }))
    writeJson(rosterKey(eventId), roster.value)
  }

  function isPending(registrationNumber) {
    return pending.value.some((item) => item.registrationNumber === registrationNumber)
  }

  /** Returns { status, name? } with status queued | duplicate | already | not-checkable | unknown | no-roster. */
  function checkInOffline(registrationNumber) {
    const number = normalize(registrationNumber)
    if (!hasRoster.value) return { status: 'no-roster' }
    const attendee = roster.value.find((item) => item.registrationNumber === number)
    if (!attendee) return { status: 'unknown' }
    if (queue.value.some((item) => item.registrationNumber === number)) return { status: 'duplicate', name: attendee.name }
    if (attendee.status === 'CHECKED_IN') return { status: 'already', name: attendee.name }
    if (!CHECKABLE.includes(attendee.status)) return { status: 'not-checkable', name: attendee.name }

    queue.value = [...queue.value, { registrationNumber: number, name: attendee.name, scannedAt: new Date().toISOString() }]
    saveQueue()
    return { status: 'queued', name: attendee.name }
  }

  async function sync() {
    if (syncing.value || !pending.value.length) return
    syncing.value = true
    let synced = 0
    try {
      for (const item of pending.value) {
        try {
          await checkIn(eventId, item.registrationNumber, item.scannedAt)
          queue.value = queue.value.filter((queued) => queued !== item)
          synced += 1
        } catch (error) {
          // Still offline, or signed out: keep the rest queued and try again later.
          if (error?.code === 'NETWORK_ERROR' || error?.status === 401) break
          if (error?.code === 'ALREADY_CHECKED_IN') {
            // Another device got there first; the person is checked in either way.
            queue.value = queue.value.filter((queued) => queued !== item)
            synced += 1
          } else {
            queue.value = queue.value.map((queued) => (queued === item
              ? { ...queued, error: error?.message || 'Check-in was rejected.' }
              : queued))
          }
        }
        saveQueue()
      }
    } finally {
      syncing.value = false
    }
    if (synced) onSynced(synced)
  }

  function dismiss(registrationNumber) {
    queue.value = queue.value.filter((item) => !(item.error && item.registrationNumber === registrationNumber))
    saveQueue()
  }

  const goOnline = () => {
    online.value = true
    sync()
  }
  const goOffline = () => {
    online.value = false
  }
  window.addEventListener('online', goOnline)
  window.addEventListener('offline', goOffline)
  const retryTimer = window.setInterval(() => {
    if (online.value) sync()
  }, RETRY_INTERVAL_MS)
  onScopeDispose(() => {
    window.removeEventListener('online', goOnline)
    window.removeEventListener('offline', goOffline)
    window.clearInterval(retryTimer)
  })

  return { online, syncing, pending, failed, hasRoster, saveRoster, isPending, checkInOffline, sync, dismiss }
}
