import { scenario } from '../support/scenarios.js'
import { stubApi, login } from '../support/api.js'

describe('User and role administration', () => {
  beforeEach(stubApi)
  scenario('access_admin_denied', function access_admin_denied() {
    login()
    cy.visit('/admin/create-event')
    cy.location('pathname').should('not.include', '/admin')
    cy.getByTestId('event-save-draft').should('not.exist')
  })
  scenario('access_reviewer_denied', function access_reviewer_denied() {
    login('admin@example.test')
    cy.visit('/super-admin/event-approvals')
    cy.location('pathname').should('not.include', '/super-admin')
    cy.getByTestId('review-approve').should('not.exist')
  })

  

  

  
})
