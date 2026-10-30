import { scenario } from '../support/scenarios.js'
import { stubApi, login } from '../support/api.js'

describe('Navigation and Discovery', () => {
  beforeEach(stubApi)
  scenario('events_no_results', function events_no_results() {
    cy.visit('/events')
    cy.getByTestId('events-search').type('no-such-classroom-event')
    cy.getByTestId('event-card').should('not.exist')
    cy.contains('No matching events').should('be.visible')
    cy.getByTestId('events-search').clear()
    cy.getByTestId('event-card').should('have.length', 2)
  })
  scenario('events_failed', function events_failed() {
    cy.intercept({ method: 'GET', url: '**/api/v1/events', times: 1 }, {
      statusCode: 503, body: { code: 'INTERNAL_ERROR', message: 'Catalogue is unavailable.' },
    })
    cy.visit('/events')
    cy.contains('Events could not be loaded').should('be.visible')
    cy.contains('button', 'Try again').click()
    cy.getByTestId('event-card').should('have.length', 2)
  })
  scenario('events_not_found', function events_not_found() {
    cy.visit('/events/not-a-published-event')
    cy.contains('h1', 'Event unavailable').should('be.visible')
    cy.getByTestId('event-register').should('not.exist')
  })
  scenario('events_full', function events_full() {
    stubApi({ event: { remainingSeats: 0, full: true } })
    login()
    cy.visit('/events/cloud-security-meetup')
    cy.getByTestId('event-register').should('be.disabled').and('have.text', 'Fully Booked')
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

    

    
  })
})
