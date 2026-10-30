import { stubApi } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

function fill(password = 'NewPassword123!', confirmation = password) {
  cy.getByTestId('new-password').type(password)
  cy.getByTestId('confirm-new-password').type(confirmation)
  cy.getByTestId('reset-password-submit').click()
}
describe('reset_password', () => {
  beforeEach(stubApi)
  
  scenario('reset_password_missing_token', function reset_password_missing_token() {
    cy.intercept('POST', '**/auth/reset-password').as('reset')
    cy.visit('/reset-password')
    fill()
    cy.getByTestId('reset-password-status').should('contain.text', 'invalid or has expired')
    cy.get('@reset.all').should('have.length', 0)
  })
  
  scenario('reset_password_mismatch', function reset_password_mismatch() {
    cy.intercept('POST', '**/auth/reset-password').as('reset')
    cy.visit('/reset-password?token=classroom-token')
    fill('NewPassword123!', 'DifferentPassword123!')
    cy.get('#confirm-new-password-error').should('have.text', 'Passwords do not match.')
    cy.get('@reset.all').should('have.length', 0)
  })
  scenario('reset_password_weak', function reset_password_weak() {
    cy.intercept('POST', '**/auth/reset-password').as('reset')
    cy.visit('/reset-password?token=classroom-token')
    fill('weakpass')
    cy.get('#new-password-error').should('contain.text', 'uppercase')
    cy.get('@reset.all').should('have.length', 0)
  })
})
