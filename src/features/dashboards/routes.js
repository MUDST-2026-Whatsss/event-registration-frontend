export const adminDashboardRoutes = [
  {
    path: 'dashboard',
    name: 'admin-dashboard',
    component: () => import('./AdminDashboardPage.vue'),
    meta: {
      heading: 'Dashboard',
      ownTopbar: true,
      title: 'Admin Dashboard | Eventsss',
    },
  },
]

export const superAdminDashboardRoutes = [
  {
    path: 'dashboard',
    name: 'sa-dashboard',
    component: () => import('./SuperAdminDashboardPage.vue'),
    meta: { heading: 'Dashboard' },
  },
]
