import { stubApi, login } from '../support/api.js'

const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10)

function signInAsReviewer() {
  cy.visit('/')
  cy.getByTestId('logout').click()
  cy.getByTestId('nav-login').should('be.visible')
  login('super@example.test')
}

function submitEvent() {
  login('admin@example.test')
  cy.intercept('GET', '**/event-categories').as('categories')
  cy.visit('/admin/create-event')
  cy.wait('@categories')
  cy.getByTestId('event-title').should('be.enabled').type('Class workshop')
  cy.getByTestId('event-save-draft').click()
  cy.url().should('include', '/admin/events/created-event/edit')
  cy.reload()
  cy.getByTestId('event-title').should('have.value', 'Class workshop')
  cy.getByTestId('event-category').select('10000000-0000-0000-0000-000000000001')
  cy.getByTestId('event-location').type('University room 101')
  cy.getByTestId('event-date').type(day(7))
  cy.getByTestId('event-startTime').type('10:00')
  cy.getByTestId('event-endTime').type('12:00')
  cy.getByTestId('event-maxParticipants').type('30')
  cy.getByTestId('event-registrationStart').type(`${day(-1)}T09:00`)
  cy.getByTestId('event-deadline').type(`${day(6)}T18:00`)
  cy.intercept('POST', '**/admin/events/*/submit?*').as('submit')
  cy.getByTestId('event-submit').click()
  cy.wait('@submit').its('response.statusCode').should('eq', 200)
  cy.getByTestId('admin-event-row').contains('Class workshop').parents('[data-test="admin-event-row"]').should('contain.text', 'Pending')
}

function requestTitleChange() {
  login('admin@example.test')
  cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/edit')
  cy.getByTestId('event-title').should('have.value', 'Cloud Security Community Meetup').and('be.enabled')
  cy.getByTestId('event-title').clear()
  cy.getByTestId('event-title').type('Updated community workshop')
  cy.getByTestId('event-change-reason').type('The class agreed on a clearer title.')
  cy.intercept('POST', '**/admin/events/*/change-requests?*').as('change')
  cy.getByTestId('event-submit-change').click()
  cy.wait('@change').its('request.body.reason').should('eq', 'The class agreed on a clearer title.')
  cy.visit('/events')
  cy.getByTestId('event-card').should('contain.text', 'Cloud Security Community Meetup')
  cy.getByTestId('event-card').should('not.contain.text', 'Updated community workshop')
  signInAsReviewer()
  cy.visit('/super-admin/change-requests')
  cy.getByTestId('change-review').click()
}

describe('Event governance', () => {
  beforeEach(stubApi)

  it('EVENT-001 saves a draft, submits it, approves it and publishes it in the catalogue', () => {
    submitEvent()
    signInAsReviewer()
    cy.visit('/super-admin/event-approvals')
    cy.intercept('POST', '**/event-reviews/*/approve').as('approve')
    cy.getByTestId('review-approve').click()
    cy.wait('@approve').its('request.body.version').should('eq', 2)
    cy.visit('/events')
    cy.getByTestId('event-card').should('contain.text', 'Class workshop')
  })

  it('CHANGE-001 keeps published data until a change request is approved', () => {
    requestTitleChange()
    cy.getByTestId('change-comment').type('Approved for the class.')
    cy.intercept('POST', '**/change-requests/*/approve').as('approveChange')
    cy.getByTestId('change-approve').click()
    cy.wait('@approveChange').its('request.body.comment').should('eq', 'Approved for the class.')
    cy.visit('/events')
    cy.getByTestId('event-card').should('contain.text', 'Updated community workshop')
  })

  it('CHANGE-002 requires a rejection reason and preserves the published event', () => {
    requestTitleChange()
    cy.getByTestId('change-reject').should('be.disabled')
    cy.getByTestId('change-comment').type('Please keep the agreed title.')
    cy.intercept('POST', '**/change-requests/*/reject').as('rejectChange')
    cy.getByTestId('change-reject').click()
    cy.wait('@rejectChange').its('request.body.comment').should('eq', 'Please keep the agreed title.')
    cy.getByTestId('change-request').should('contain.text', 'Rejected')
    cy.visit('/events')
    cy.getByTestId('event-card').should('contain.text', 'Cloud Security Community Meetup')
    cy.getByTestId('event-card').should('not.contain.text', 'Updated community workshop')
  })

  it('EVENT-002 retains an unsaved draft when the API reports a version conflict', () => {
    login('admin@example.test')
    cy.visit('/admin/create-event')
    cy.getByTestId('event-title').should('be.enabled').type('Unsaved workshop')
    cy.intercept('POST', '**/api/v1/admin/events', {
      statusCode: 409, body: { code: 'CONFLICT', message: 'The event was changed. Reload and try again.' },
    }).as('conflict')
    cy.getByTestId('event-save-draft').click()
    cy.wait('@conflict')
    cy.contains('The event was changed. Reload and try again.').should('be.visible')
    cy.getByTestId('event-title').should('have.value', 'Unsaved workshop')
    cy.url().should('include', '/admin/create-event')
  })
})
