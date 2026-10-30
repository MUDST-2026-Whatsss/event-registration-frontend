import { scenario } from '../support/scenarios.js'
import { stubApi, login as signIn } from '../support/api.js'

describe('Authentication and User Sessions', () => {
  beforeEach(stubApi)

  scenario('login_session_recovery', function login_session_recovery() {
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

  scenario('login_required', function login_required() {
    cy.visit('/profile')

    cy.url().should('include', '/login?redirect=/profile')
    cy.getByTestId('login-form').should('be.visible')
  })

  scenario('login_failed', function login_failed() {
    cy.visit('/login')

    cy.getByTestId('email').type('wrong@eventsss.com')
    cy.getByTestId('password').type('wrongpass123')
    cy.getByTestId('login-submit').click()

    cy.getByTestId('login-status').should('be.visible').and('have.text', 'Incorrect email or password.')
  })

  scenario('login', function login() {
    signIn()

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
