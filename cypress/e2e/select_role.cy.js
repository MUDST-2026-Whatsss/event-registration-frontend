import { stubApi, login } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

describe('select_role', () => {
  beforeEach(() => { stubApi(); login('multi@example.test'); cy.location('pathname').should('eq', '/select-role') })
  
  scenario('select_role_failed', function select_role_failed() {
    cy.intercept('POST', '**/auth/select-role', { statusCode: 403, body: { code: 'ACCESS_DENIED', message: 'This role is no longer assigned.' } })
    cy.getByTestId('select-role-admin').click()
    cy.getByTestId('select-role-error').should('have.text', 'This role is no longer assigned.')
    cy.location('pathname').should('eq', '/select-role')
    cy.getByTestId('select-role-admin').should('be.enabled')
  })
  scenario('select_role_logout', function select_role_logout() {
    cy.getByTestId('select-role-logout').click()
    cy.location('pathname').should('eq', '/login')
    cy.visit('/admin/dashboard')
    cy.location('pathname').should('eq', '/login')
  })
})
