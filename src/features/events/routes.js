const HomeView = () => import('./pages/HomeView.vue')
const EventsView = () => import('./pages/EventsView.vue')
const EventDetailView = () => import('./pages/EventDetailView.vue')

export const eventRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home | Eventsss' },
  },
  {
    path: '/events',
    name: 'events',
    component: EventsView,
    meta: { title: 'Events | Eventsss' },
  },
  {
    path: '/events/:id',
    name: 'event-detail',
    component: EventDetailView,
    meta: { title: 'Event details | Eventsss' },
  },
]

export const adminEventRoutes = [
  {
    path: 'all-events',
    name: 'admin-all-events',
    component: () => import('./management/AdminEventsPage.vue'),
    meta: {
      heading: 'All Events',
      title: 'All Events | Eventsss',
    },
  },
  {
    path: 'create-event',
    name: 'admin-create-event',
    component: () => import('./management/AdminEventCreatePage.vue'),
    meta: {
      heading: 'Create New Event',
      ownTopbar: true,
      title: 'Create Event | Eventsss',
    },
  },
]

export const superAdminEventRoutes = [
  {
    path: 'all-events',
    name: 'sa-all-events',
    component: () => import('./management/SuperAdminEventsPage.vue'),
    meta: { heading: 'All Events' },
  },
]
