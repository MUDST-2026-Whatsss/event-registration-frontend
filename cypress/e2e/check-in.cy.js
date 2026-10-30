import { stubApi, login } from '../support/api.js'

describe('Event Check-in', () => {
  beforeEach(stubApi)
  it('admin checks in a participant by registration number from the participants page', () => {
    login('admin@example.test')
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')

    cy.get('h1').should('contain.text', 'Cloud Security Community Meetup')
    cy.get('.participant-table').should('contain.text', 'Alice Attendee').and('contain.text', 'Confirmed')

    // Staff may type the number in lower case; the button stays disabled until something is entered.
    cy.contains('button', 'Check in').should('be.disabled')
    cy.get('#check-in-number').type('reg-attend0001')
    cy.contains('button', 'Check in').click()

    cy.get('.app-toast').should('contain.text', 'Alice Attendee checked in.')
    cy.get('.participant-table').should('contain.text', 'Checked in')
    cy.get('#check-in-number').should('have.value', '')
  })

  it('shows the API error when the participant was already checked in or the number is unknown', () => {
    login('admin@example.test')
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')

    cy.get('#check-in-number').type('REG-ATTEND0001')
    cy.contains('button', 'Check in').click()
    cy.get('.app-toast').should('contain.text', 'checked in.')

    cy.get('#check-in-number').type('REG-ATTEND0001')
    cy.contains('button', 'Check in').click()
    cy.get('.app-toast').should('contain.text', 'This registration has already been checked in.')

    cy.get('#check-in-number').type('REG-UNKNOWN000')
    cy.contains('button', 'Check in').click()
    cy.get('.app-toast').should('contain.text', 'The requested registration was not found.')
  })
})
