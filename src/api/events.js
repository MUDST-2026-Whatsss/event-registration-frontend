import { api } from './client.js'

export const eventsApi = {
  listAdmin: () => api.get('/api/v1/admin/events'),
  create: (data) => api.post('/api/v1/admin/events', data),
  submitReview: (id) => api.post(`/api/v1/admin/events/${id}/submit`),
  cancel: (id) => api.post(`/api/v1/admin/events/${id}/cancel`),
  stats: () => api.get('/api/v1/admin/stats'),
  users: () => api.get('/api/v1/admin/users'),
  listReviews: () => api.get('/api/v1/admin/event-reviews'),
  approveReview: (reviewId, version) => api.post(`/api/v1/admin/event-reviews/${reviewId}/approve`, { version, comment: '' }),
  rejectReview: (reviewId, version) => api.post(`/api/v1/admin/event-reviews/${reviewId}/reject`, { version, comment: '' }),
}
