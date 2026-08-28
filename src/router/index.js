import { createRouter, createWebHistory } from 'vue-router'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import HomeView from '../views/HomeView.vue'
import EventsView from '../views/EventsView.vue'
import EventDetailView from '../views/EventDetailView.vue'
import EventRegistrationView from '../views/EventRegistrationView.vue'
import LoginView from '../views/LoginView.vue'
import MyRegistrationsView from '../views/MyRegistrationsView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterView from '../views/RegisterView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import { canRegisterForEvent, eventGroups } from '../data/events.js'
import SuperAdminLayout from '../layouts/SuperAdminLayout.vue'

const allEvents = eventGroups.flatMap((group) => group.events)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Home | Eventsss',
      },
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView,
      meta: {
        title: 'Events | Eventsss',
      },
    },
    {
      path: '/events/:id/register',
      name: 'event-registration',
      component: EventRegistrationView,
      meta: {
        title: 'Confirm Registration | Eventsss',
        requiresAuth: true,
      },
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: EventDetailView,
      meta: {
        title: 'Event details | Eventsss',
      },
    },
    {
      path: '/my-registrations',
      name: 'my-registrations',
      component: MyRegistrationsView,
      meta: {
        title: 'My Registrations | Eventsss',
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        title: 'Profile | Eventsss',
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Sign in | Eventsss',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        title: 'Create account | Eventsss',
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: {
        title: 'Forgot password | Eventsss',
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: {
        title: 'Reset password | Eventsss',
      },
    },
    {
      path: '/super-admin',
      component: SuperAdminLayout,
      children: [
        { path: '', redirect: '/super-admin/event-approvals' },
        {
          path: 'dashboard',
          name: 'sa-dashboard',
          component: () => import('../views/super_admin/ComingSoon.vue'),
          props: { title: 'Dashboard' },
        },
        {
          path: 'all-events',
          name: 'sa-all-events',
          component: () => import('../views/super_admin/ComingSoon.vue'),
          props: { title: 'All Events' },
        },
        {
          path: 'change-requests',
          name: 'sa-change-requests',
          component: () => import('../views/super_admin/ComingSoon.vue'),
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
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'event-registration') {
    const event = allEvents.find((item) => item.id === Number(to.params.id))
    if (!canRegisterForEvent(event)) return event ? `/events/${event.id}` : '/events'
  }

  if (!to.meta.requiresAuth) return true

  const storedAuth = window.localStorage.getItem('eventsss_mock_authenticated') === 'true'
    || window.sessionStorage.getItem('eventsss_mock_authenticated') === 'true'

  return storedAuth ? true : { path: '/login', query: { redirect: to.fullPath } }
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'Eventsss | Event Registration Platform'
})

export default router
