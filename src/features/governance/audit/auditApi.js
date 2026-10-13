import { authenticatedApiRequest } from '@/features/auth/public.js'

function auditParams({ query, targetType, from, to } = {}) {
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (targetType) params.set('targetType', targetType)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return params
}

export function listAuditLogs({ query, targetType, from, to, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: 'createdAt,desc' })
  auditParams({ query, targetType, from, to }).forEach((value, key) => params.set(key, value))
  return authenticatedApiRequest(`/admin/audit-logs?${params.toString()}`)
}

export function exportAuditLogs(filters = {}) {
  const params = auditParams(filters)
  return authenticatedApiRequest(`/admin/audit-logs/export?${params.toString()}`, { responseType: 'blob' })
}

export function listSignInActivity({ query, outcome, from, to, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  auditParams({ query, from, to }).forEach((value, key) => params.set(key, value))
  if (outcome) params.set('outcome', outcome)
  return authenticatedApiRequest(`/admin/audit-logs/sign-ins?${params.toString()}`)
}

export function exportSignInActivity({ query, outcome, from, to } = {}) {
  const params = auditParams({ query, from, to })
  if (outcome) params.set('outcome', outcome)
  return authenticatedApiRequest(`/admin/audit-logs/sign-ins/export?${params.toString()}`, { responseType: 'blob' })
}

export function listSessionActivity({ query, state, from, to, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  auditParams({ query, from, to }).forEach((value, key) => params.set(key, value))
  if (state) params.set('state', state)
  return authenticatedApiRequest(`/admin/audit-logs/sessions?${params.toString()}`)
}

export function exportSessionActivity({ query, state, from, to } = {}) {
  const params = auditParams({ query, from, to })
  if (state) params.set('state', state)
  return authenticatedApiRequest(`/admin/audit-logs/sessions/export?${params.toString()}`, { responseType: 'blob' })
}
