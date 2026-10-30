import { stubApi, login } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

const eventId = '20000000-0000-0000-0000-000000000001'
const rosterKey = `eventsss.private.checkIn.roster.${eventId}`

function queueOneScan(retryStatus, retryCode) {
  cy.clock(Date.now(), ['setInterval', 'clearInterval'])
  cy.intercept('POST', '**/admin/events/*/check-in').as('synced')
  cy.intercept({ method: 'POST', url: '**/admin/events/*/check-in', times: 1 }, req => {
    req.alias = 'retryFailed'
    req.reply({ statusCode: retryStatus, body: { code: retryCode, message: 'Check-in cannot complete yet.' } })
  })
  cy.visit(`/admin/events/${eventId}/participants`)
  cy.window().should(win => {
    expect(JSON.parse(win.localStorage.getItem(rosterKey))).to.have.length(2)
  })
  cy.window().then(win => win.dispatchEvent(new win.Event('offline')))
  cy.get('#check-in-number').type('REG-ATTEND0001')
  cy.contains('button', 'Check in').click()
  cy.getByTestId('offline-status').should('contain.text', '1 check-in waiting to sync')
  cy.window().then(win => win.dispatchEvent(new win.Event('online')))
  cy.wait('@retryFailed').its('response.statusCode').should('eq', retryStatus)
}

describe('offline_check_in', () => {
  beforeEach(() => { stubApi(); login('admin@example.test') })

  scenario('offline_check_in_retry', function offline_check_in_retry() {
    queueOneScan(503, 'INTERNAL_ERROR')
    cy.getByTestId('offline-failed').should('not.exist')
    cy.getByTestId('offline-status').should('contain.text', '1 check-in waiting to sync')
    cy.tick(30_000)
    cy.wait('@synced').then(({ request, response }) => {
      expect(request.body.checkedInAt).to.match(/^\d{4}-\d{2}-\d{2}T/)
      expect(response.statusCode).to.eq(200)
    })
    cy.getByTestId('offline-status').should('not.exist')
    cy.contains('.participant-table tr', 'Alice Attendee').should('contain.text', 'Checked in')
  })

  scenario('offline_check_in_rejected', function offline_check_in_rejected() {
    queueOneScan(409, 'REGISTRATION_NOT_CHECKABLE')
    cy.getByTestId('offline-failed').should('contain.text', 'Alice Attendee')
      .and('contain.text', 'Check-in cannot complete yet.')
    cy.getByTestId('offline-status').should('not.contain.text', '1 check-in waiting to sync')
    cy.getByTestId('offline-failed').contains('button', 'Dismiss').click()
    cy.getByTestId('offline-status').should('not.exist')
    cy.tick(30_000)
    cy.get('@synced.all').should('have.length', 0)
    cy.contains('.participant-table tr', 'Alice Attendee').should('contain.text', 'Confirmed')
  })
})
