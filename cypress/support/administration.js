// Isolated browser fixtures. Backend authorization and transactions are covered by Spring tests.
export function stubAdministration(events, category, iso) {
  const reviews = []
  const changes = []
  const permissions = [{ code: 'EVENT_UPDATE', name: 'Update events', module: 'EVENT' }]
  const roles = ['USER', 'ADMIN', 'SUPER_ADMIN'].map((code, index) => ({
    roleId: `role-${index}`, code, name: code, scopeType: 'GLOBAL', status: 'ACTIVE',
    permissions: ['EVENT_UPDATE'], userCount: 1, system: true,
  }))
  const users = [{ userId: 'participant-id', displayName: 'Class Participant', email: 'participant@example.test',
    status: 'ACTIVE', roles: [roles[0]], version: 0, lastLoginAt: null }]
  const page = (content) => ({ content, totalElements: content.length, totalPages: content.length ? 1 : 0, number: 0 })

  cy.intercept('**/api/v1/admin/**', (req) => {
    const url = new URL(req.url)
    const path = url.pathname.replace('/api/v1/admin', '')
    const reply = (body, statusCode = 200) => req.reply({ statusCode, body })
    const event = events.find(item => path.startsWith(`/events/${item.eventId}`))
    if (path === '/events/stats') return reply({ total: events.length, published: 2, draft: 0, pendingReview: reviews.length,
      rejected: 0, cancelled: 0, completed: 0, categories: [{ ...category, total: 2, published: 2 }] })
    if (path === '/registrations/recent' || path.startsWith('/audit-logs')) return reply(page([]))
    if (path === '/events' && req.method === 'GET') return reply(page(events.filter(item =>
      !url.searchParams.get('status') || item.status === url.searchParams.get('status'))))
    if (path === '/events' && req.method === 'POST') {
      const created = { ...events[0], ...req.body, category, eventId: 'created-event', slug: 'class-workshop',
        status: 'DRAFT', version: 0, registrationCount: 0, updatedAt: iso(0) }
      events.push(created)
      return reply(created, 201)
    }
    if (event && path.endsWith('/change-requests')) {
      if (req.method === 'GET') return reply(changes.filter(item => item.event.eventId === event.eventId))
      const change = { requestId: `change-${changes.length}`, event: { ...event }, version: 0, status: 'PENDING',
        createdAt: iso(0), requestedBy: { email: 'admin@example.test' }, reason: req.body.reason,
        items: [{ fieldName: 'title', oldValue: event.title, newValue: req.body.event.title }] }
      changes.push(change)
      return reply(change, 201)
    }
    if (event && path.endsWith('/submit')) {
      event.status = 'PENDING_REVIEW'
      event.version++
      reviews.push({ reviewId: `review-${reviews.length}`, event, priority: 'STANDARD', decision: 'PENDING',
        submittedAt: iso(0), submittedBy: { email: 'admin@example.test' } })
      return reply(event)
    }
    if (event && path === `/events/${event.eventId}`) {
      if (req.method === 'PATCH') Object.assign(event, req.body, { category, version: event.version + 1 })
      return reply(event)
    }
    if (path === '/event-reviews') return reply(page(reviews.filter(item =>
      !url.searchParams.get('decision') || item.decision === url.searchParams.get('decision'))))
    const review = reviews.find(item => path.startsWith(`/event-reviews/${item.reviewId}/`))
    if (review && req.method === 'POST') {
      review.decision = path.endsWith('/approve') ? 'APPROVED' : 'REJECTED'
      review.event.status = review.decision === 'APPROVED' ? 'PUBLISHED' : 'REJECTED'
      review.event.version++
      return reply(review)
    }
    if (path === '/change-requests') return reply(page(changes))
    const change = changes.find(item => path.startsWith(`/change-requests/${item.requestId}/`))
    if (change && req.method === 'POST') {
      change.status = path.endsWith('/approve') ? 'APPROVED' : 'REJECTED'
      if (change.status === 'APPROVED') events.find(item => item.eventId === change.event.eventId).title = change.items[0].newValue
      return reply(change)
    }
    if (path === '/permissions') return reply(permissions)
    if (path === '/roles') {
      if (req.method === 'POST') {
        const role = { ...req.body, roleId: 'custom-role', permissions: req.body.permissionCodes, userCount: 0, system: false }
        roles.push(role)
        return reply(role, 201)
      }
      return reply(roles)
    }
    if (path === '/users/stats') return reply({ totalUsers: users.length, activeAdministrators: 1,
      disabledAccounts: users.filter(item => item.status === 'DISABLED').length })
    if (path === '/users') return reply(page(users))
    const account = users.find(item => path.startsWith(`/users/${item.userId}/`))
    if (account && path.endsWith('/roles') && req.method === 'PUT') {
      account.roles = roles.filter(role => req.body.roleCodes.includes(role.code))
      account.version++
      return reply(account)
    }
    if (account && path.endsWith('/status') && req.method === 'PATCH') {
      account.status = req.body.status
      account.version++
      return reply(account)
    }
    return reply({ code: 'UNMOCKED_TEST_ENDPOINT', message: `${req.method} ${path}` }, 501)
  })
}
