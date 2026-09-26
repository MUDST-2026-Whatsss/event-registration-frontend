import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/features/auth/public.js'
import { authRoutes } from '@/features/auth/routes.js'
import { eventRoutes } from '@/features/events/routes.js'
import { registrationRoutes } from '@/features/registrations/routes.js'
import { consoleRoutes } from './consoleRoutes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...eventRoutes,
    ...registrationRoutes,
    ...authRoutes,
    ...consoleRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Navigation only — the API remains responsible for authorizing every request.
router.beforeEach(async (to) => {
  const { isAuthenticated, currentRole, availableRoles, initializeAuth } = useAuth()

  if (!to.meta.requiresAuth) return true

  const signInRedirect = {
    path: '/login',
    query: { redirect: to.fullPath },
  }

  try {
    await initializeAuth()
  } catch {
    return signInRedirect
  }

  if (!isAuthenticated.value) return signInRedirect

  if (to.name === 'select-role') return true

  if (!currentRole.value && availableRoles.value.length > 1) {
    return { path: '/select-role', query: { redirect: to.fullPath } }
  }

  const requiredRole = to.meta.requiredRole
  if (requiredRole && currentRole.value !== requiredRole) {
    if (availableRoles.value.includes(requiredRole)) {
      return { path: '/select-role', query: { redirect: to.fullPath } }
    }
    return currentRole.value === 'super-admin'
      ? '/super-admin/dashboard'
      : currentRole.value === 'admin'
        ? '/admin/dashboard'
        : '/'
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'Eventsss | Event Registration Platform'
})

export default router
