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

export function checkInRegistration(eventId, registrationNumber) {
  return apiRequest(`/admin/events/${encodeURIComponent(eventId)}/check-in`, {
    method: 'POST',
    body: { registrationNumber },
  })
}

export function listRecentAdminRegistrations({ size = 5 } = {}) {
  const params = new URLSearchParams({ page: '0', size: String(size), sort: 'registeredAt,desc' })
  return apiRequest(`/admin/registrations/recent?${params}`)
}
