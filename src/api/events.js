import { api } from './client.js'

export const eventsApi = {
  listAdmin: () => api.get('/api/v1/admin/events'),
  create: (data) => api.post('/api/v1/admin/events', data),
  publish: (id) => api.post(`/api/v1/admin/events/${id}/publish`),
  submitReview: (id) => api.post(`/api/v1/admin/events/${id}/submit`),
  reject: (id) => api.post(`/api/v1/admin/events/${id}/reject`),
  cancel: (id) => api.post(`/api/v1/admin/events/${id}/cancel`),
  stats: () => api.get('/api/v1/admin/stats'),
  users: () => api.get('/api/v1/admin/users'),
}
