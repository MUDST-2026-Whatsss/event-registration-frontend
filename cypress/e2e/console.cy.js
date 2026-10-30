import { scenario } from '../support/scenarios.js'
import { stubApi, login } from '../support/api.js'

describe('Administration Console Pages', () => {
  beforeEach(stubApi)

  scenario('admin_participants', function admin_participants() {
    login('admin@example.test')
    cy.visit('/admin/all-events')

    cy.get('h1').should('have.text', 'All Events')
    cy.contains('Cloud Security Community Meetup').should('be.visible')
    cy.get('a[title="View participants"]').first().click()

    cy.url().should('include', '/admin/events/20000000-0000-0000-0000-000000000001/participants')
    cy.get('.participant-table').should('contain.text', 'Alice Attendee')
    cy.contains('.breadcrumb-link', 'All Events').click()
    cy.url().should('include', '/admin/all-events')
  })

  scenario('super_admin_dashboard', function super_admin_dashboard() {
    login('super@example.test')
    cy.visit('/super-admin/dashboard')

    cy.get('h1').should('have.text', 'Platform Oversight')
    cy.contains('h2', 'Requires Attention').should('be.visible')
    cy.contains('h2', 'Security & Access').should('be.visible')
    cy.contains('h2', 'Recent Administrative Activity').should('be.visible')
  })

  scenario('super_admin_participants', function super_admin_participants() {
    login('super@example.test')
    cy.visit('/super-admin/all-events')

    cy.get('h1').should('have.text', 'All Events')
    cy.get('a[title="View participants"]').first().click()

    cy.url().should('include', '/super-admin/all-events/20000000-0000-0000-0000-000000000001/participants')
    cy.get('.participant-table').should('contain.text', 'REG-ATTEND0001')
  })

  scenario('audit_logs', function audit_logs() {
    login('super@example.test')
    cy.visit('/super-admin/audit-logs')

    cy.get('h1').should('have.text', 'Audit Logs')
  })
})
