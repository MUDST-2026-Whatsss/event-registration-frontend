import { stubApi } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

describe('forgot_password', () => {
  beforeEach(() => {
    stubApi()
    cy.visit('/forgot-password')
    cy.getByTestId('forgot-password-form', { timeout: 15000 }).should('be.visible')
  })
  
  scenario('forgot_password_empty', function forgot_password_empty() {
    cy.intercept('POST', '**/auth/forgot-password').as('reset')
    cy.getByTestId('forgot-password-submit').click()
    cy.get('#recovery-email-error').should('have.text', 'Please enter your email.')
    cy.get('@reset.all').should('have.length', 0)
  })
  
  scenario('forgot_password_failed', function forgot_password_failed() {
    cy.intercept('POST', '**/auth/forgot-password', { statusCode: 503, body: { code: 'INTERNAL_ERROR', message: 'Password recovery is unavailable.' } })
    cy.getByTestId('recovery-email').type('student@example.test')
    cy.getByTestId('forgot-password-submit').click()
    cy.getByTestId('forgot-password-error').should('have.text', 'Password recovery is unavailable.')
    cy.getByTestId('forgot-password-submit').should('be.enabled')
  })
})
