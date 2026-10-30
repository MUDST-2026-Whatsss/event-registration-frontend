import { scenario } from '../support/scenarios.js'
import { stubApi, login } from '../support/api.js'

describe('Admin Experience and Access Control', () => {
  beforeEach(stubApi)
  scenario('admin_login_required', function admin_login_required() {
    cy.visit('/admin/dashboard')

    cy.url().should('include', '/login?redirect=/admin/dashboard')
    cy.getByTestId('login-form').should('be.visible')
  })

  scenario('admin_dashboard', function admin_dashboard() {
    login('admin@example.test')

    cy.url().should('include', '/admin/dashboard')
    cy.contains('h2', 'Events by category').should('be.visible')

    cy.contains('button', 'Create event').should('be.visible').click()
    cy.url().should('include', '/admin/create-event')
  })
})
