import { apiRequest } from '@/shared/lib/apiClient.js'
import { authenticatedApiRequest } from '@/features/auth/public.js'

function queryString(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function listEventCategories() {
  return apiRequest('/event-categories')
}

export function listAdminEvents({ status, query, page = 0, size = 20 } = {}) {
  return authenticatedApiRequest(`/admin/events${queryString({ status, query, page, size, sort: 'updatedAt,desc' })}`)
}

export function getAdminEvent(eventId) {
  return authenticatedApiRequest(`/admin/events/${eventId}`)
}

export function getAdminEventStats() {
  return authenticatedApiRequest('/admin/events/stats')
}

export function createAdminEvent(payload) {
  return authenticatedApiRequest('/admin/events', { method: 'POST', body: payload })
}

export function updateAdminEvent(eventId, version, payload) {
  return authenticatedApiRequest(`/admin/events/${eventId}${queryString({ version })}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function submitAdminEvent(eventId, version) {
  return authenticatedApiRequest(`/admin/events/${eventId}/submit${queryString({ version })}`, { method: 'POST' })
}

export function withdrawAdminEvent(eventId, version) {
  return authenticatedApiRequest(`/admin/events/${eventId}/withdraw${queryString({ version })}`, { method: 'POST' })
}

export function cancelAdminEvent(eventId, version, reason) {
  return authenticatedApiRequest(`/admin/events/${eventId}/cancel`, {
    method: 'POST',
    body: { version, reason },
  })
}

export function listEventChangeRequests(eventId) {
  return authenticatedApiRequest(`/admin/events/${eventId}/change-requests`)
}

export function createEventChangeRequest(eventId, version, reason, event) {
  return authenticatedApiRequest(`/admin/events/${eventId}/change-requests${queryString({ version })}`, {
    method: 'POST',
    body: { reason, event },
  })
}

export function uploadEventImage(file) {
  const body = new FormData()
  body.append('file', file)
  return authenticatedApiRequest('/event-images', { method: 'POST', body })
}

export function deleteEventImage(objectKey) {
  const [, ownerId, fileName] = objectKey.split('/')
  return authenticatedApiRequest(`/event-images/${ownerId}/${fileName}`, { method: 'DELETE' })
}
