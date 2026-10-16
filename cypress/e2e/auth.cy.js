import { stubApi, login } from '../support/api.js'

describe('Authentication and User Sessions', () => {
  beforeEach(stubApi)

  it('keeps sign-in available after a failed session check and allows login to recover', () => {
    cy.intercept({ method: 'GET', url: '**/api/v1/auth/me', times: 1 }, {
      statusCode: 403,
      body: 'Invalid CORS request',
      headers: { 'content-type': 'text/plain' },
    }).as('failedSession')

    cy.visit('/')
    cy.wait('@failedSession')
    cy.getByTestId('nav-login').should('be.visible').click()
    cy.getByTestId('email').type('demo@example.test')
    cy.getByTestId('password').type('test-password-123')
    cy.getByTestId('login-submit').click()

    cy.getByTestId('logout').should('be.visible')
  })

  it('redirects unauthenticated users trying to access protected routes', () => {
    cy.visit('/profile')

    cy.url().should('include', '/login?redirect=/profile')
    cy.getByTestId('login-form').should('be.visible')
  })

  it('displays error message on invalid login credentials', () => {
    cy.visit('/login')

    cy.getByTestId('email').type('wrong@eventsss.com')
    cy.getByTestId('password').type('wrongpass123')
    cy.getByTestId('login-submit').click()

    cy.getByTestId('login-status').should('be.visible').and('have.text', 'Incorrect email or password.')
  })

  it('successfully logs in with valid user credentials and logs out', () => {
    login()

    // Header updates with user info and Logout button
    cy.getByTestId('logout').should('be.visible').and('have.text', 'Logout')

    // Visit profile
    cy.visit('/profile')
    cy.get('h1').should('have.text', 'Profile')
    cy.get('.profile-identity').should('be.visible')

    // Logout
    cy.getByTestId('logout').click()
    cy.url().should('match', /\/$/)
    cy.contains('.public-header a', 'Login').should('be.visible')

    // Route guard protects profile again
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })
})
