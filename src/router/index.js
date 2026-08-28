import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SuperAdminLayout from '../layouts/SuperAdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/super-admin',
      component: SuperAdminLayout,
      children: [
        { path: '', redirect: '/super-admin/dashboard' },
        {
          path: 'dashboard',
          name: 'sa-dashboard',
          component: () => import('../views/super_admin/Dashboard.vue'),
          props: { title: 'Dashboard' },
        },
        {
          path: 'all-events',
          name: 'sa-all-events',
          component: () => import('../views/super_admin/AllEvents.vue'),
          props: { title: 'All Events' },
        },
        {
          path: 'change-requests',
          name: 'sa-change-requests',
          component: () => import('../views/super_admin/ChangeRequests.vue'),
          props: { title: 'Change Requests' },
        },
        {
          path: 'event-approvals',
          name: 'sa-event-approvals',
          component: () => import('../views/super_admin/EventApprovals.vue'),
        },
        {
          path: 'user-management',
          name: 'sa-user-management',
          component: () => import('../views/super_admin/UserManagement.vue'),
        },
        {
          path: 'role-management',
          name: 'sa-role-management',
          component: () => import('../views/super_admin/RoleManagement.vue'),
        },
        {
          path: 'role-management/new',
          name: 'sa-role-management-new',
          component: () => import('../views/super_admin/RoleManagementCreate.vue'),
        },
        {
          path: 'audit-logs',
          name: 'sa-audit-logs',
          component: () => import('../views/super_admin/AuditLogs.vue'),
        },
      ],
    },
  ],
})

export default router
