const EventRegistrationView = () => import('./pages/EventRegistrationView.vue')
const RegistrationSuccessView = () => import('./pages/RegistrationSuccessView.vue')
const MyRegistrationsView = () => import('./pages/MyRegistrationsView.vue')

export const registrationRoutes = [
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
    path: '/events/:id/registration-success',
    name: 'registration-success',
    component: RegistrationSuccessView,
    meta: {
      title: 'Registration Complete | Eventsss',
      requiresAuth: true,
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
]

export const superAdminRegistrationRoutes = [
  {
    path: 'all-events/:id/participants',
    name: 'sa-event-participants',
    component: () => import('./management/SuperAdminParticipantsPage.vue'),
    meta: { heading: 'All Events' },
  },
]
