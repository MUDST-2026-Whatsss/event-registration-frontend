import { authenticatedApiRequest } from '@/features/auth/public.js'

function queryString(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function listEventReviews({ decision, page = 0, size = 20 } = {}) {
  return authenticatedApiRequest(`/admin/event-reviews${queryString({ decision, page, size, sort: 'submittedAt,desc' })}`)
}

export function getEventReview(reviewId) {
  return authenticatedApiRequest(`/admin/event-reviews/${reviewId}`)
}

export function approveEventReview(reviewId, version, comment = '') {
  return authenticatedApiRequest(`/admin/event-reviews/${reviewId}/approve`, {
    method: 'POST', body: { version, comment },
  })
}

export function rejectEventReview(reviewId, version, comment) {
  return authenticatedApiRequest(`/admin/event-reviews/${reviewId}/reject`, {
    method: 'POST', body: { version, comment },
  })
}

export function listChangeRequests({ status, page = 0, size = 20 } = {}) {
  return authenticatedApiRequest(`/admin/change-requests${queryString({ status, page, size, sort: 'createdAt,desc' })}`)
}

export function getChangeRequest(requestId) {
  return authenticatedApiRequest(`/admin/change-requests/${requestId}`)
}

export function approveChangeRequest(requestId, version, comment = '') {
  return authenticatedApiRequest(`/admin/change-requests/${requestId}/approve`, {
    method: 'POST', body: { version, comment },
  })
}

export function rejectChangeRequest(requestId, version, comment) {
  return authenticatedApiRequest(`/admin/change-requests/${requestId}/reject`, {
    method: 'POST', body: { version, comment },
  })
}
