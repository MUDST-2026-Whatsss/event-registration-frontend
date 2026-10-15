import { stubApi, login } from '../support/api.js'

describe('Event Registration Flow', () => {
  beforeEach(stubApi)
  it('REG-003 shows a QR ticket, cancels a registration and keeps the cancellation after reload', () => {
    login()
    cy.visit('/events/cloud-security-meetup/register')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').click()
    cy.contains('a', 'View my registrations').click()
    cy.getByTestId('registration-qr').click()
    cy.get('[role="dialog"] img').should('have.attr', 'src').and('match', /^data:image\/png/)
    cy.get('[aria-label="Close QR code"]').click()
    cy.getByTestId('registration-cancel').click()
    cy.getByTestId('cancellation-keep').click()
    cy.getByTestId('registration-status').should('have.text', 'registered')
    cy.getByTestId('registration-cancel').click()
    cy.intercept('POST', '**/registrations/*/cancel').as('cancel')
    cy.getByTestId('cancellation-confirm').click()
    cy.wait('@cancel').its('response.body.status').should('eq', 'CANCELLED_BY_USER')
    cy.reload()
    cy.contains('button', 'Cancelled').click()
    cy.getByTestId('registration-status').should('have.text', 'cancelled')
    cy.getByTestId('registration-qr').should('not.exist')
  })
  it('completes free event registration and reflects in user registrations', () => {
    // 1. Authenticate user
    login()

    // 2. Navigate using the published API event slug, not a legacy mock ID.
    cy.visit('/events/cloud-security-meetup')
    cy.get('h1').should('contain.text', 'Cloud Security Community Meetup')

    cy.getByTestId('event-register')
      .should('be.visible')
      .and('have.text', 'Register Now')
      .click()

    // 3. Confirm details on registration confirmation page
    cy.url().should('include', '/events/cloud-security-meetup/register')
    cy.get('h1').should('contain.text', 'Confirm your registration')

    cy.getByTestId('registration-consent').check()

    // 4. Submit registration
    cy.getByTestId('registration-confirm').click()

    // 5. Success screen verification
    cy.url().should('include', '/events/cloud-security-meetup/registration-success')
    cy.get('h1').should('have.text', 'Registration successful!')
    cy.get('.success-details').should('contain.text', 'REG-TEST000001')

    // 6. Navigate to My Registrations and confirm event is listed
    cy.contains('a', 'View my registrations').click()
    cy.url().should('include', '/my-registrations')
    cy.getByTestId('registration-card').should('contain.text', 'Cloud Security Community Meetup')
  })

  it('finishes the paid QR process and loads the confirmed record from the API', () => {
    login()
    cy.intercept('POST', '**/mock-payment/confirm').as('paymentConfirm')
    cy.visit('/events/global-tech-summit-2026/register')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').click()
    cy.contains('[role="dialog"]', 'Scan to pay').should('be.visible')
    cy.wait('@paymentConfirm', { timeout: 15000 }).its('response.body.status').should('eq', 'CONFIRMED')
    cy.url().should('include', '/registration-success')
    cy.get('.success-details').should('contain.text', 'REG-TEST000001')
    cy.contains('a', 'View my registrations').click()
    cy.getByTestId('registration-card').should('contain.text', 'Global Tech Summit 2026')
    cy.getByTestId('registration-status').should('have.text', 'registered')
  })
})
