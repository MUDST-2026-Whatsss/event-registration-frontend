import { stubApi, login } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

function fill(next = 'NewPassword123!', confirmation = next) {
  cy.getByTestId('current-password').type('OldPassword123!')
  cy.getByTestId('profile-new-password').type(next)
  cy.getByTestId('confirm-profile-new-password').type(confirmation)
}
describe('change_password', () => {
  beforeEach(() => { stubApi(); login(); cy.visit('/profile'); cy.getByTestId('change-password-open').click() })
  scenario('change_password', function change_password() {
    cy.intercept('POST', '**/auth/change-password').as('change')
    fill()
    cy.getByTestId('change-password-submit').click()
    cy.wait('@change').its('request.body').should('deep.eq', { currentPassword: 'OldPassword123!', newPassword: 'NewPassword123!' })
    cy.location('pathname').should('eq', '/login')
    cy.location('search').should('contain', 'passwordChanged=true')
  })
  scenario('change_password_failed', function change_password_failed() {
    cy.intercept('POST', '**/auth/change-password', { statusCode: 400, body: { code: 'INVALID_CURRENT_PASSWORD', message: 'The current password is incorrect.' } })
    fill()
    cy.getByTestId('change-password-submit').click()
    cy.contains('The current password is incorrect.').should('be.visible')
    cy.get('[role="dialog"]').should('be.visible')
    cy.location('pathname').should('eq', '/profile')
  })
  scenario('change_password_mismatch', function change_password_mismatch() {
    cy.intercept('POST', '**/auth/change-password').as('change')
    fill('NewPassword123!', 'Different123!')
    cy.getByTestId('confirm-profile-new-password').blur()
    cy.contains('Passwords do not match.').should('be.visible')
    cy.getByTestId('change-password-submit').should('be.disabled')
    cy.get('@change.all').should('have.length', 0)
  })
  scenario('change_password_cancel', function change_password_cancel() {
    cy.intercept('POST', '**/auth/change-password').as('change')
    fill()
    cy.getByTestId('change-password-cancel').click()
    cy.get('[role="dialog"]').should('not.exist')
    cy.getByTestId('change-password-open').click()
    cy.getByTestId('current-password').should('have.value', '')
    cy.get('@change.all').should('have.length', 0)
  })
})
