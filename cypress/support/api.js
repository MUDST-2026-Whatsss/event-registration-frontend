import { stubAdministration } from './administration.js'

// Every API request is intercepted: these browser tests never write to the shared backend.
export function stubApi() {
  let user = null
  const registrations = []
  const now = Date.now()
  const iso = (offset) => new Date(now + offset).toISOString()
  const free = {
    eventId: '20000000-0000-0000-0000-000000000001', slug: 'cloud-security-meetup',
    title: 'Cloud Security Community Meetup', summary: 'Community workshop', description: 'Community workshop',
    category: { eventCategoryId: '10000000-0000-0000-0000-000000000001', code: 'TECHNOLOGY', nameEn: 'Technology' },
    eventType: 'FREE', price: 0, currency: 'THB', imageUrl: null,
    timezone: 'Asia/Bangkok', locationType: 'ONSITE', locationName: 'Bangkok Hall',
    startAt: iso(604800000), endAt: iso(608400000), registrationStartAt: iso(-86400000), registrationEndAt: iso(518400000),
    maximumParticipants: 10, remainingSeats: 10, full: false, allowCancellation: true, showRemainingSeats: true,
    status: 'PUBLISHED', version: 0, registrationCount: 0, updatedAt: iso(0),
  }
  const paid = { ...free, eventId: '20000000-0000-0000-0000-000000000002', slug: 'global-tech-summit-2026', title: 'Global Tech Summit 2026', eventType: 'PAID', price: 99 }
  const events = [free, paid]
  cy.intercept('**/api/v1/**', (req) => {
    const path = new URL(req.url).pathname.replace('/api/v1', '')
    const reply = (body, statusCode = 200) => req.reply({ statusCode, body, headers: { 'content-type': 'application/json' } })
    if (path === '/auth/csrf') return reply({ token: 'test-csrf' })
    if (path === '/auth/me' || path === '/auth/refresh') return user
      ? reply(path === '/auth/me' ? user : { user }) : reply({ code: 'UNAUTHENTICATED', message: 'Please sign in.' }, 401)
    if (path === '/auth/login') {
      if (req.body.email.startsWith('wrong')) return reply({ code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' }, 401)
      const role = req.body.email === 'super@example.test' ? 'SUPER_ADMIN' : req.body.email === 'admin@example.test' ? 'ADMIN' : 'USER'
      user = { userId: '30000000-0000-0000-0000-000000000001', email: req.body.email, name: 'Demo User', firstName: 'Demo', lastName: 'User', phoneNumber: '0912345678',
        role, roles: [role], permissions: ['EVENT_CREATE', 'EVENT_UPDATE', 'REGISTRATION_CREATE_SELF', 'REGISTRATION_READ_SELF', 'REGISTRATION_CANCEL_SELF'] }
      // A multi-role account has no active role until it is chosen on the role selection page.
      if (req.body.email === 'multi@example.test') Object.assign(user, { role: null, roles: ['USER', 'ADMIN'], roleNames: { USER: 'Participant', ADMIN: 'Administrator' } })
      return reply({ user })
    }
    if (path === '/auth/select-role') { user = { ...user, role: req.body.role }; return reply({ user }) }
    if (path === '/auth/register') {
      if (req.body.email === 'taken@example.test') return reply({ code: 'EMAIL_ALREADY_REGISTERED', message: 'That email address cannot be registered.' }, 409)
      return reply({ message: 'Account created.' }, 201)
    }
    if (path === '/auth/forgot-password') return reply({ message: 'If that email is registered, a reset link has been sent.' })
    if (path === '/auth/reset-password') {
      if (req.body.token !== 'valid-token') return reply({ code: 'INVALID_PASSWORD_RESET_TOKEN', message: 'This password reset link is invalid or has expired.' }, 400)
      return reply({ message: 'Password reset successfully. Sign in with your new password.' })
    }
    if (path === '/auth/logout') { user = null; return reply({}) }
    if (path === '/events') return reply(events.filter(event => event.status === 'PUBLISHED'))
    if (req.method === 'GET' && path.startsWith('/events/')) return reply(events.find(e => path === `/events/${e.slug}`) || {}, events.some(e => path === `/events/${e.slug}`) ? 200 : 404)
    if (path === '/registrations' && req.method === 'GET') return reply(registrations)
    if (req.method === 'POST' && path.endsWith('/cancel')) {
      const registration = registrations.find(item => path === `/registrations/${item.registrationId}/cancel`)
      if (!registration) return reply({ code: 'REGISTRATION_NOT_FOUND' }, 404)
      registration.status = 'CANCELLED_BY_USER'
      registration.cancellable = false
      return reply(registration)
    }
    if (path === '/invitations') return reply([])
    if (path === '/event-categories') return reply([free.category])
    if (path === '/admin/events/stats') return reply({ total: 2, published: 2, draft: 0, pendingReview: 0, rejected: 0, cancelled: 0, completed: 0, categories: [{ ...free.category, total: 2, published: 2, draft: 0, pendingReview: 0, rejected: 0, cancelled: 0, completed: 0 }] })
    if (path === '/admin/registrations/recent') return reply({ content: [], totalElements: 0 })
    if (path === '/admin/events') return reply({ content: events, totalElements: 2 })
    if (req.method === 'POST' && /^\/events\/[^/]+\/registrations$/.test(path)) {
      if (!user) return reply({ code: 'UNAUTHENTICATED' }, 401)
      if (!req.body.consentAccepted) return reply({ code: 'VALIDATION_FAILED' }, 400)
      const event = events.find(e => path === `/events/${e.eventId}/registrations`)
      if (!event) return reply({ code: 'EVENT_NOT_FOUND' }, 404)
      let registration = registrations.find(r => r.event.eventId === event.eventId)
      if (!registration) {
        registration = { registrationId: '40000000-0000-0000-0000-00000000000' + (registrations.length + 1), registrationNumber: 'REG-TEST00000' + (registrations.length + 1),
          status: event.eventType === 'PAID' ? 'PENDING_PAYMENT' : 'CONFIRMED', attendeeName: req.body.attendeeName, attendeeEmail: user.email,
          registeredAt: iso(0), confirmedAt: event.eventType === 'PAID' ? null : iso(0), cancellable: true, event }
        registrations.push(registration)
      }
      return reply(registration, 201)
    }
    if (req.method === 'POST' && path.endsWith('/mock-payment/confirm')) {
      const registration = registrations.find(r => path === `/registrations/${r.registrationId}/mock-payment/confirm`)
      if (!registration) return reply({ code: 'REGISTRATION_NOT_FOUND' }, 404)
      registration.status = 'CONFIRMED'
      registration.confirmedAt = iso(0)
      return reply(registration)
    }
    return reply({ code: 'UNMOCKED_TEST_ENDPOINT', message: `${req.method} ${path}` }, 501)
  }).as('api')
  stubAdministration(events, free.category, iso)
}

export function login(email = 'demo@example.test') {
  cy.visit('/login')
  cy.getByTestId('email').type(email)
  cy.getByTestId('password').type('test-password-123')
  cy.getByTestId('login-submit').click()
  cy.url().should('not.include', '/login')
}
