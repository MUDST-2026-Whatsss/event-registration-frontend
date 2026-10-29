import { stubApi, login } from '../support/api.js'

describe('Administration Console Pages', () => {
  beforeEach(stubApi)

  it('CONSOLE-001 admin opens a published event from All Events and sees its participants', () => {
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

  it('CONSOLE-002 super admin sees the platform oversight dashboard', () => {
    login('super@example.test')
    cy.visit('/super-admin/dashboard')

    cy.get('h1').should('have.text', 'Platform Oversight')
    cy.contains('h2', 'Requires Attention').should('be.visible')
    cy.contains('h2', 'Security & Access').should('be.visible')
    cy.contains('h2', 'Recent Administrative Activity').should('be.visible')
  })

  it('CONSOLE-003 super admin opens participants from All Events', () => {
    login('super@example.test')
    cy.visit('/super-admin/all-events')

    cy.get('h1').should('have.text', 'All Events')
    cy.get('a[title="View participants"]').first().click()

    cy.url().should('include', '/super-admin/all-events/20000000-0000-0000-0000-000000000001/participants')
    cy.get('.participant-table').should('contain.text', 'REG-ATTEND0001')
  })

  it('CONSOLE-004 super admin opens the audit log page', () => {
    login('super@example.test')
    cy.visit('/super-admin/audit-logs')

    cy.get('h1').should('have.text', 'Audit Logs')
  })
})
