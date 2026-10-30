import { readonly, ref } from 'vue'
import { mapPublicEvent } from '@/features/events/public.js'
import {
  cancelRegistration, confirmMockPayment, findGuestTicket, listMyRegistrations, registerAsGuest, registerForEvent,
} from '../api/registrationsApi.js'

const ACTIVE_STATUSES = ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN']

const registrations = ref([])
let loadRequest = null

// Keeps the shape the pages already use: eventId is the event slug, status is registered/cancelled.
function mapRegistration(registration) {
  return {
    ...registration,
    id: registration.registrationId,
    eventId: registration.event?.slug,
    event: registration.event ? mapPublicEvent(registration.event) : null,
    status: registration.status === 'PENDING_PAYMENT' ? 'pending payment'
      : ACTIVE_STATUSES.includes(registration.status) ? 'registered' : 'cancelled',
    apiStatus: registration.status,
    registeredAt: registration.registeredAt?.slice(0, 10),
  }
}

function upsert(registration) {
  const mapped = mapRegistration(registration)
  const others = registrations.value.filter((item) => item.id !== mapped.id)
  registrations.value = [mapped, ...others]
  return mapped
}

export function useRegistrations() {
  async function loadRegistrations(force = false) {
    if (!force && loadRequest) return loadRequest
    loadRequest = listMyRegistrations()
      .then((payload) => {
        registrations.value = (Array.isArray(payload) ? payload : []).map(mapRegistration)
        return registrations.value
      })
      .finally(() => {
        loadRequest = null
      })
    return loadRequest
  }

  // event is a mapped public event; the API needs its UUID (event.eventId).
  async function register(event, attendee = {}) {
    const payload = await registerForEvent(event.eventId, {
      attendeeName: attendee.fullName || undefined,
      attendeeEmail: attendee.email || undefined,
      attendeePhone: attendee.phone || undefined,
      consentAccepted: true,
    })
    return upsert(payload)
  }

  // Guest tickets belong to no account, so they stay out of the signed-in registration list.
  async function registerGuest(event, attendee) {
    return mapRegistration(await registerAsGuest(event.eventId, {
      attendeeName: attendee.fullName,
      attendeeEmail: attendee.email,
      attendeePhone: attendee.phone || undefined,
      consentAccepted: true,
    }))
  }

  async function lookupGuestTicket(registrationNumber, email) {
    return mapRegistration(await findGuestTicket(registrationNumber, email))
  }

  async function cancel(registrationId) {
    return upsert(await cancelRegistration(registrationId))
  }

  async function completeMockPayment(registrationId) {
    return upsert(await confirmMockPayment(registrationId))
  }

  function findRegistration(slug) {
    return registrations.value.find((item) => item.eventId === slug) || null
  }

  function isRegistered(slug) {
    return findRegistration(slug)?.status === 'registered'
  }

  return {
    registrations: readonly(registrations),
    loadRegistrations,
    register,
    registerGuest,
    lookupGuestTicket,
    completeMockPayment,
    cancel,
    findRegistration,
    isRegistered,
  }
}
