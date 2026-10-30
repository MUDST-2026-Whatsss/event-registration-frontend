import { scenario } from '../support/scenarios.js'
import { stubApi, login } from '../support/api.js'

describe('Event Registration Flow', () => {
  beforeEach(stubApi)
  scenario('guest_registration_back', function guest_registration_back() {
    cy.visit('/events/cloud-security-meetup?from=%2Fevents%3Fgroup%3Dopen')
    cy.getByTestId('event-register').should('have.text', 'Register Now')
    cy.screenshot('guest-event-detail-back', { capture: 'viewport' })
    cy.getByTestId('event-back').should('have.attr', 'href', '/events?group=open').click()
    cy.location('search').should('eq', '?group=open')
    cy.visit('/events/cloud-security-meetup?from=%2Fevents%3Fgroup%3Dopen')
    cy.getByTestId('event-register').should('have.text', 'Register Now').click()
    cy.getByTestId('guest-notice').should('be.visible')
    cy.getByTestId('registration-back').should('have.text', 'Back')
    cy.get('input[autocomplete="name"]').should('have.attr', 'placeholder', 'Enter your full name')
    cy.get('input[type="tel"]').should('have.attr', 'placeholder', 'e.g. 0812345678')
    cy.get('input[type="email"]').should('have.attr', 'placeholder', 'you@example.com')
    cy.screenshot('guest-registration-placeholders', { capture: 'fullPage' })
    cy.getByTestId('registration-back').click()
    cy.location('pathname').should('eq', '/events/cloud-security-meetup')
    cy.location('search').should('include', 'from=')
    cy.getByTestId('event-register').click()
    cy.get('input[autocomplete="name"]').type('Gina Guest')
    cy.get('input[type="tel"]').type('0812345678')
    cy.get('input[type="email"]').type('gina@example.test')
    cy.getByTestId('registration-consent').check()
    cy.intercept('POST', '**/guest-registrations').as('guestRegistration')
    cy.getByTestId('registration-confirm').click()
    cy.wait('@guestRegistration').its('response.body.status').should('eq', 'CONFIRMED')
    cy.location('pathname').should('eq', '/tickets')
    cy.contains('REG-GUEST00001').should('be.visible')
    cy.get('.ticket-qr img').should('have.attr', 'src').and('match', /^data:image\/png/)
  })
  scenario('registration_cancel', function registration_cancel() {
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
  scenario('registration', function registration() {
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

  scenario('registration_payment', function registration_payment() {
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

  scenario('registration_consent_required', function registration_consent_required() {
    login()
    cy.intercept('POST', '**/events/*/registrations').as('register')
    cy.visit('/events/cloud-security-meetup/register')
    cy.getByTestId('registration-confirm').should('be.disabled')
    cy.get('@register.all').should('have.length', 0)
  })

  scenario('registration_full', function registration_full() {
    login()
    cy.intercept('POST', '**/events/*/registrations', { statusCode: 409, body: { code: 'EVENT_FULL', message: 'This event has no remaining seats.' } }).as('full')
    cy.visit('/events/cloud-security-meetup/register')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').click()
    cy.wait('@full')
    cy.contains('This event has no remaining seats.').should('be.visible')
    cy.location('pathname').should('not.include', 'registration-success')
    cy.getByTestId('registration-confirm').should('be.enabled')
  })

  scenario('registration_payment_failed', function registration_payment_failed() {
    login()
    cy.intercept('POST', '**/mock-payment/confirm', { statusCode: 503, body: { code: 'INTERNAL_ERROR', message: 'Mock confirmation failed.' } }).as('paymentFailed')
    cy.visit('/events/global-tech-summit-2026/register')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').click()
    cy.wait('@paymentFailed', { timeout: 15000 })
    cy.contains('Mock confirmation failed.').should('be.visible')
    cy.location('pathname').should('not.include', 'registration-success')
    cy.get('[role="dialog"]').should('not.exist')
  })

})
