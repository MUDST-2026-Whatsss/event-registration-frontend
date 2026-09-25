import { authenticatedApiRequest } from '@/features/auth/public.js'

export function listRoles() {
  return authenticatedApiRequest('/admin/roles')
}

export function listPermissions() {
  return authenticatedApiRequest('/admin/permissions')
}

export function createRole(values) {
  return authenticatedApiRequest('/admin/roles', { method: 'POST', body: values })
}

export function updateRole(roleId, values) {
  return authenticatedApiRequest(`/admin/roles/${roleId}`, { method: 'PATCH', body: values })
}

export function replaceRolePermissions(roleId, permissionCodes) {
  return authenticatedApiRequest(`/admin/roles/${roleId}/permissions`, {
    method: 'PUT', body: { permissionCodes },
  })
}
