import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from '@/features/auth/public.js'
import { ConsoleLayout } from '@/features/console-shell/public.js'
import {
  adminDashboardRoutes,
  superAdminDashboardRoutes,
} from '@/features/dashboards/routes.js'
import {
  adminEventRoutes,
  superAdminEventRoutes,
} from '@/features/events/routes.js'
import { superAdminRegistrationRoutes } from '@/features/registrations/routes.js'
import { superAdminGovernanceRoutes } from '@/features/governance/routes.js'
import { superAdminAccessControlRoutes } from '@/features/access-control/routes.js'

export const consoleRoutes = [
  {
    path: '/admin',
    component: ConsoleLayout,
    props: { role: ADMIN_ROLE },
    meta: {
      requiresAuth: true,
      requiredRole: ADMIN_ROLE,
    },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      ...adminDashboardRoutes,
      ...adminEventRoutes,
    ],
  },
  {
    path: '/super-admin',
    component: ConsoleLayout,
    props: { role: SUPER_ADMIN_ROLE },
    meta: {
      requiresAuth: true,
      requiredRole: SUPER_ADMIN_ROLE,
    },
    children: [
      { path: '', redirect: '/super-admin/dashboard' },
      ...superAdminDashboardRoutes,
      ...superAdminEventRoutes,
      ...superAdminRegistrationRoutes,
      ...superAdminGovernanceRoutes,
      ...superAdminAccessControlRoutes,
    ],
  },
]
