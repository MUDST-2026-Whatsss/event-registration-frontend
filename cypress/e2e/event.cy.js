import { stubApi, login } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

describe('event management', () => {
  beforeEach(() => { stubApi(); login('admin@example.test') })

  

  scenario('event_draft_empty', function event_draft_empty() {
    cy.intercept('POST', '**/api/v1/admin/events').as('save')
    cy.visit('/admin/create-event')
    cy.getByTestId('event-save-draft').should('be.enabled').click()
    cy.contains('A draft needs an event title.').should('be.visible')
    cy.get('@save.all').should('have.length', 0)
    cy.location('pathname').should('eq', '/admin/create-event')
  })

  scenario('event_submit_incomplete', function event_submit_incomplete() {
    cy.intercept('POST', '**/api/v1/admin/events*').as('save')
    cy.visit('/admin/create-event')
    cy.getByTestId('event-title').should('be.enabled').type('Incomplete event')
    cy.getByTestId('event-submit').click()
    cy.contains('Complete the required details before submitting for review.').should('be.visible')
    cy.contains('Choose an event category.').should('be.visible')
    cy.contains('Enter a participant limit of at least 1.').should('be.visible')
    cy.get('@save.all').should('have.length', 0)
    cy.getByTestId('event-title').should('have.value', 'Incomplete event')
  })

  scenario('event_draft_failed', function event_draft_failed() {
    cy.intercept('POST', '**/api/v1/admin/events', {
      statusCode: 503, body: { code: 'INTERNAL_ERROR', message: 'Draft service is unavailable.' },
    }).as('save')
    cy.visit('/admin/create-event')
    cy.getByTestId('event-title').should('be.enabled').type('Keep this draft')
    cy.getByTestId('event-save-draft').click()
    cy.wait('@save')
    cy.contains('Draft service is unavailable.').should('be.visible')
    cy.getByTestId('event-title').should('have.value', 'Keep this draft')
    cy.getByTestId('event-save-draft').should('be.enabled')
    cy.location('pathname').should('eq', '/admin/create-event')
  })

  scenario('event_change_missing_reason', function event_change_missing_reason() {
    cy.intercept('POST', '**/admin/events/*/change-requests?*').as('change')
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/edit')
    cy.getByTestId('event-title').should('be.enabled').clear().type('Unexplained change')
    cy.getByTestId('event-submit-change').click()
    cy.contains('Please explain why this published event needs to change.').should('be.visible')
    cy.get('@change.all').should('have.length', 0)
    cy.reload()
    cy.getByTestId('event-title').should('have.value', 'Cloud Security Community Meetup')
  })
})
