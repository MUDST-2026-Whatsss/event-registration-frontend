import { authenticatedApiRequest } from '@/features/auth/public.js'

function withQuery(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function listUsers({ query, status, role, page = 0, size = 20 } = {}) {
  return authenticatedApiRequest(`/admin/users${withQuery({
    query, status, role, page, size, sort: 'createdAt,desc',
  })}`)
}

export function getUserStats() {
  return authenticatedApiRequest('/admin/users/stats')
}

export function listRoles() {
  return authenticatedApiRequest('/admin/roles')
}

export function updateUserStatus(userId, status, version) {
  return authenticatedApiRequest(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: { status, version },
  })
}

export function replaceUserRoles(userId, roleCodes, version) {
  return authenticatedApiRequest(`/admin/users/${userId}/roles`, {
    method: 'PUT',
    body: { roleCodes, version },
  })
}
