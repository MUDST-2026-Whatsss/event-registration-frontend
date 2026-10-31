const EventRegistrationView = () => import('./pages/EventRegistrationView.vue')
const RegistrationSuccessView = () => import('./pages/RegistrationSuccessView.vue')
const MyRegistrationsView = () => import('./pages/MyRegistrationsView.vue')
const GuestTicketView = () => import('./pages/GuestTicketView.vue')

export const registrationRoutes = [
  {
    // Public: guests and members share the form and optional mock payment process.
    path: '/events/:slug/register',
    name: 'event-registration',
    component: EventRegistrationView,
    meta: {
      title: 'Confirm Registration | Eventsss',
    },
  },
  {
    path: '/tickets',
    name: 'guest-ticket',
    component: GuestTicketView,
    meta: {
      title: 'Find My Ticket | Eventsss',
    },
  },
  {
    path: '/events/:slug/registration-success',
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

export const adminRegistrationRoutes = [
  {
    path: 'events/:id/participants',
    name: 'admin-event-participants',
    component: () => import('./management/SuperAdminParticipantsPage.vue'),
    meta: { heading: 'All Events' },
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
