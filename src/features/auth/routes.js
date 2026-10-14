const LoginView = () => import('./pages/LoginView.vue')
const RegisterView = () => import('./pages/RegisterView.vue')
const ForgotPasswordView = () => import('./pages/ForgotPasswordView.vue')
const ResetPasswordView = () => import('./pages/ResetPasswordView.vue')
const ProfileView = () => import('./pages/ProfileView.vue')
const RoleSelectionView = () => import('./pages/RoleSelectionView.vue')

export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Sign in | Eventsss', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Create account | Eventsss', guestOnly: true },
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
    path: '/select-role',
    name: 'select-role',
    component: RoleSelectionView,
    meta: {
      title: 'Choose role | Eventsss',
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
]
