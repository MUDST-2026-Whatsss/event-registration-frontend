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
