import { stubApi } from '../support/api.js'

describe('Guest Registration', () => {
  beforeEach(stubApi)

  it('a guest registers for a free event without an account and gets a QR ticket', () => {
    cy.visit('/events/cloud-security-meetup')
    cy.getByTestId('event-register').should('have.text', 'Register Now').click()

    cy.url().should('include', '/events/cloud-security-meetup/register')
    cy.getByTestId('guest-notice').should('contain.text', 'Registering as a guest')
    cy.get('input[autocomplete="name"]').type('Gina Guest')
    cy.get('input[type="tel"]').type('0812345678')
    cy.get('input[type="email"]').type('gina@example.test')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').click()

    // The ticket page loads the ticket from history state; the email never appears in the URL.
    cy.location('pathname').should('eq', '/tickets')
    cy.location('search').should('eq', '')
    cy.contains('h1', "You're registered!")
    cy.getByTestId('guest-ticket-number').should('have.text', 'REG-GUEST00001')
    cy.getByTestId('guest-ticket').find('img').should('have.attr', 'src').and('match', /^data:image\/png/)
    cy.getByTestId('guest-ticket').should('contain.text', 'Create an account with gina@example.test')
  })

  it('finds a guest ticket again only with the matching email', () => {
    cy.visit('/events/cloud-security-meetup/register')
    cy.get('input[autocomplete="name"]').type('Lou Lookup')
    cy.get('input[type="tel"]').type('0812345678')
    cy.get('input[type="email"]').type('lou@example.test')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').click()
    cy.getByTestId('guest-ticket-number').should('have.text', 'REG-GUEST00001')

    // The header link leads back to the search form, which keeps the email just used.
    cy.getByTestId('nav-find-ticket').click()
    cy.getByTestId('guest-lookup-email').should('have.value', 'lou@example.test')
    cy.getByTestId('guest-lookup-number').type('reg-guest00001')
    cy.getByTestId('guest-lookup-email').clear().type('someone-else@example.test')
    cy.getByTestId('guest-lookup-submit').click()
    cy.get('[role="alert"]').should('contain.text', 'No ticket matches')

    cy.getByTestId('guest-lookup-email').clear().type('LOU@example.test')
    cy.getByTestId('guest-lookup-submit').click()
    cy.contains('h1', 'Your ticket')
    cy.getByTestId('guest-ticket-status').should('have.text', 'Confirmed')
  })

  it('still sends guests to sign in for paid events', () => {
    cy.visit('/events/global-tech-summit-2026')
    cy.getByTestId('event-register').should('have.text', 'Log In / Sign Up').click()
    cy.url().should('include', '/login')

    cy.visit('/events/global-tech-summit-2026/register')
    cy.getByTestId('guest-paid-notice').should('contain.text', 'An account is required for paid events')
    cy.getByTestId('registration-consent').check()
    cy.getByTestId('registration-confirm').should('be.disabled')
  })
})
