import { apiRequest } from '@/shared/lib/apiClient.js'

export function registerForEvent(eventId, attendee) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}/registrations`, {
    method: 'POST',
    body: attendee,
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

export function listRecentAdminRegistrations({ size = 5 } = {}) {
  const params = new URLSearchParams({ page: '0', size: String(size), sort: 'registeredAt,desc' })
  return apiRequest(`/admin/registrations/recent?${params}`)
}
