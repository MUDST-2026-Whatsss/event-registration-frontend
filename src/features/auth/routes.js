const LoginView = () => import('./pages/LoginView.vue')
const RegisterView = () => import('./pages/RegisterView.vue')
const ForgotPasswordView = () => import('./pages/ForgotPasswordView.vue')
const ResetPasswordView = () => import('./pages/ResetPasswordView.vue')
const ProfileView = () => import('./pages/ProfileView.vue')

export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Sign in | Eventsss' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Create account | Eventsss' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { title: 'Forgot password | Eventsss' },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: { title: 'Reset password | Eventsss' },
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
]
