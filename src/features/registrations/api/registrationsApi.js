import { apiRequest } from '@/shared/lib/apiClient.js'
import { authenticatedApiRequest } from '@/features/auth/public.js'

export function listMyInvitations() {
  return authenticatedApiRequest('/invitations')
}

export function registerForEvent(eventId, attendee) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}/registrations`, {
    method: 'POST',
    body: attendee,
  })
}

export function registerAsGuest(eventId, attendee) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}/guest-registrations`, {
    method: 'POST',
    body: attendee,
  })
}

// POST keeps the email out of the URL.
export function findGuestTicket(registrationNumber, email) {
  return apiRequest('/guest-registrations/lookup', {
    method: 'POST',
    body: { registrationNumber, email },
  })
}

export function confirmMockPayment(registrationId) {
  return authenticatedApiRequest(`/registrations/${encodeURIComponent(registrationId)}/mock-payment/confirm`, {
    method: 'POST',
  })
}

export function confirmGuestMockPayment(registrationNumber, email) {
  return apiRequest('/guest-registrations/mock-payment/confirm', {
    method: 'POST',
    body: { registrationNumber, email },
  })
}

export function listMyRegistrations() {
  return apiRequest('/registrations')
}

export function cancelRegistration(registrationId) {
  return apiRequest(`/registrations/${encodeURIComponent(registrationId)}/cancel`, { method: 'POST' })
}

export function listEventRegistrations(eventId, { query = '', page = 0, size = 50 } = {}) {
  const params = new URLSearchParams({ query, page: String(page), size: String(size) })
  return apiRequest(`/admin/events/${encodeURIComponent(eventId)}/registrations?${params}`)
}

export function getEventAnalytics(eventId) {
  return apiRequest(`/admin/events/${encodeURIComponent(eventId)}/analytics`)
}

// scannedAt is sent for offline check-ins synced later; the session may have expired by then.
export function checkInRegistration(eventId, registrationNumber, scannedAt) {
  return authenticatedApiRequest(`/admin/events/${encodeURIComponent(eventId)}/check-in`, {
    method: 'POST',
    body: scannedAt ? { registrationNumber, checkedInAt: scannedAt } : { registrationNumber },
  })
}

/** Every registration of the event, page by page, for the offline check-in list. */
export async function listAllEventRegistrations(eventId) {
  const all = []
  for (let page = 0; ; page += 1) {
    const payload = await listEventRegistrations(eventId, { page, size: 500 })
    all.push(...payload.content)
    if (page + 1 >= payload.totalPages) return all
  }
}

export function listRecentAdminRegistrations({ size = 5 } = {}) {
  const params = new URLSearchParams({ page: '0', size: String(size), sort: 'registeredAt,desc' })
  return apiRequest(`/admin/registrations/recent?${params}`)
}
