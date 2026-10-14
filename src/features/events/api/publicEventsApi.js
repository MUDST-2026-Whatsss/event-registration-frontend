import { apiRequest } from '@/shared/lib/apiClient.js'

export function listPublishedEvents() {
  return apiRequest('/events')
}

export function getPublishedEvent(slug) {
  return apiRequest(`/events/${encodeURIComponent(slug)}`)
}
