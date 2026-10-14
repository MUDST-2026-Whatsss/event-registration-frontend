import { stubApi, login } from '../support/api.js'

describe('Event Registration Flow', () => {
  beforeEach(stubApi)
  it('completes free event registration and reflects in user registrations', () => {
    // 1. Authenticate user
    login()

    // 2. Navigate using the published API event slug, not a legacy mock ID.
    cy.visit('/events/cloud-security-meetup')
    cy.get('h1').should('contain.text', 'Cloud Security Community Meetup')

    cy.get('button.detail-register')
      .should('be.visible')
      .and('have.text', 'Register Now')
      .click()

    // 3. Confirm details on registration confirmation page
    cy.url().should('include', '/events/cloud-security-meetup/register')
    cy.get('h1').should('contain.text', 'Confirm your registration')

    cy.get('.registration-consent input[type="checkbox"]').check()

    // 4. Submit registration
    cy.get('button.registration-confirm').click()

    // 5. Success screen verification
    cy.url().should('include', '/events/cloud-security-meetup/registration-success')
    cy.get('h1').should('have.text', 'Registration successful!')
    cy.get('.success-details').should('contain.text', 'REG-TEST000001')

    // 6. Navigate to My Registrations and confirm event is listed
    cy.contains('a', 'View my registrations').click()
    cy.url().should('include', '/my-registrations')
    cy.get('.registration-card').should('contain.text', 'Cloud Security Community Meetup')
  })

  it('finishes the paid QR process and loads the confirmed record from the API', () => {
    login()
    cy.intercept('POST', '**/mock-payment/confirm').as('paymentConfirm')
    cy.visit('/events/global-tech-summit-2026/register')
    cy.get('.registration-consent input').check()
    cy.get('.registration-confirm').click()
    cy.contains('[role="dialog"]', 'Scan to pay').should('be.visible')
    cy.wait('@paymentConfirm', { timeout: 15000 }).its('response.body.status').should('eq', 'CONFIRMED')
    cy.url().should('include', '/registration-success')
    cy.get('.success-details').should('contain.text', 'REG-TEST000001')
    cy.contains('a', 'View my registrations').click()
    cy.get('.registration-card').should('contain.text', 'Global Tech Summit 2026')
    cy.get('.registration-card__status').should('have.text', 'registered')
  })
})
