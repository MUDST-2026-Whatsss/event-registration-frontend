export const superAdminAccessControlRoutes = [
  {
    path: 'user-management',
    name: 'sa-user-management',
    component: () => import('./users/SuperAdminUsersPage.vue'),
    meta: { heading: 'User Management' },
  },
  {
    path: 'role-management',
    name: 'sa-role-management',
    component: () => import('./roles/SuperAdminRolesPage.vue'),
    meta: { heading: 'Role Management' },
  },
  {
    path: 'role-management/new',
    name: 'sa-role-management-new',
    component: () => import('./roles/SuperAdminRoleCreatePage.vue'),
    meta: { heading: 'Create New Role' },
  },
]
