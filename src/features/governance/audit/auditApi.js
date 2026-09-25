import { authenticatedApiRequest } from '@/features/auth/public.js'

export function listAuditLogs({ query, targetType, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: 'createdAt,desc' })
  if (query) params.set('query', query)
  if (targetType) params.set('targetType', targetType)
  return authenticatedApiRequest(`/admin/audit-logs?${params.toString()}`)
}
