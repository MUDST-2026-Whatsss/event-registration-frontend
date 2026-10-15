import { stubApi } from '../support/api.js'

describe('Navigation and Discovery', () => {
  beforeEach(stubApi)
  it('loads the homepage with title and hero section', () => {
    cy.visit('/')

    cy.title().should('match', /Eventsss/i)
    cy.get('h1#home-title').should('have.text', 'Find Your Next Great Experience')
    cy.contains('nav a', 'Events').should('be.visible')
    cy.contains('.public-header a', 'Login').should('be.visible')
  })

  it('navigates to events page and lists available events', () => {
    cy.visit('/')
    cy.contains('nav a', 'Events').click()

    cy.url().should('include', '/events')
    cy.getByTestId('event-card').should('have.length.greaterThan', 0)
  })

  it('can search and filter events', () => {
    cy.visit('/events')

    cy.getByTestId('events-search').type('Global Tech Summit')
    cy.getByTestId('event-card').should('contain.text', 'Global Tech Summit 2026')
  })

  it('navigates to event details page from event card', () => {
    cy.visit('/events')

    cy.getByTestId('event-card').contains('Global Tech Summit 2026').click()

    cy.url().should('include', '/events/global-tech-summit-2026')
    cy.get('h1').should('contain.text', 'Global Tech Summit 2026')
    cy.contains('h2', 'About This Event').should('be.visible')
  })

  it('shows a placeholder when the event has no cover image', () => {
    cy.visit('/events')
    cy.getByTestId('event-card').first().find('.event-cover__placeholder').should('be.visible')
    cy.getByTestId('event-card').first().find('img').should('not.exist')
  })

  describe('registration status discovery', () => {
    beforeEach(() => {
      const iso = offset => new Date(Date.now() + offset).toISOString()
      const event = { eventId: 'discovery-open', slug: 'discovery-open', title: 'Available event',
        startAt: iso(86400000), endAt: iso(90000000), registrationStartAt: iso(-86400000), registrationEndAt: iso(43200000),
        locationType: 'ONLINE', price: 0, maximumParticipants: 10, remainingSeats: 10, full: false }
      cy.intercept('GET', '**/api/v1/events', [
        { ...event, eventId: 'discovery-closed', slug: 'discovery-closed', title: 'Closed registration event', registrationEndAt: iso(-3600000) },
        event,
      ])
    })

    it('shows closed registrations after switching from Open to All, including after reload', () => {
      cy.visit('/events?group=open')
      cy.getByTestId('events-filter').should('have.value', 'open')
      cy.getByTestId('event-card').should('have.length', 1).and('contain.text', 'Available event')
      cy.getByTestId('events-filter').select('all')
      cy.location('search').should('not.include', 'group=open')
      cy.getByTestId('event-card').should('have.length', 2)
      cy.getByTestId('event-card').should('contain.text', 'Closed registration event')
      cy.reload()
      cy.getByTestId('events-filter').should('have.value', 'all')
      cy.getByTestId('event-card').should('have.length', 2)
      cy.go('back')
      cy.getByTestId('events-filter').should('have.value', 'open')
      cy.getByTestId('event-card').should('have.length', 1)
    })

    it('does not promote a future event whose registration has closed', () => {
      cy.visit('/')
      cy.get('.countdown__event').should('have.text', 'Available event')
      cy.get('.countdown').should('have.attr', 'href', '/events/discovery-open')
    })
  })
})
