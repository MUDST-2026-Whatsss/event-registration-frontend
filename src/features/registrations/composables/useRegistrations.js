import { readonly, ref } from 'vue'


const STORAGE_KEY = 'eventsss_mock_registrations_v3'
const defaultRegistrations = [
  { eventId: 2, status: 'registered', registeredAt: '2026-08-21' },
]

function readRegistrations() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored) ? stored : defaultRegistrations
  } catch {
    return defaultRegistrations
  }
}

const registrations = ref(readRegistrations())

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations.value))
}

export function useRegistrations() {
  function register(eventId, details = {}) {
    const existing = registrations.value.find((item) => item.eventId === eventId)

    if (existing) {
      existing.status = 'registered'
      existing.registeredAt = new Date().toISOString().slice(0, 10)
      Object.assign(existing, details)
      registrations.value = [...registrations.value]
    } else {
      registrations.value = [...registrations.value, {
        eventId,
        status: 'registered',
        registeredAt: new Date().toISOString().slice(0, 10),
        ...details,
      }]
    }

    persist()
  }

  function cancel(eventId) {
    const existing = registrations.value.find((item) => item.eventId === eventId)
    if (!existing) return
    existing.status = 'cancelled'
    registrations.value = [...registrations.value]
    persist()
  }

  function isRegistered(eventId) {
    return registrations.value.some((item) => item.eventId === eventId && item.status === 'registered')
  }

  return {
    registrations: readonly(registrations),
    register,
    cancel,
    isRegistered,
  }
}
