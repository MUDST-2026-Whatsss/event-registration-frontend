import { scenario } from '../support/scenarios.js'
import { stubApi, login as signIn } from '../support/api.js'

describe('Authentication and User Sessions', () => {
  beforeEach(stubApi)

  scenario('login_empty', function login_empty() {
    cy.intercept('POST', '**/auth/login').as('submit')
    cy.visit('/login')
    cy.getByTestId('login-submit').click()
    cy.get('#email-error').should('have.text', 'Please enter your email.')
    cy.get('#password-error').should('have.text', 'Please enter your password.')
    cy.get('@submit.all').should('have.length', 0)
  })

  scenario('login_invalid_email', function login_invalid_email() {
    cy.intercept('POST', '**/auth/login').as('submit')
    cy.visit('/login')
    cy.getByTestId('email').type('not-an-email')
    cy.getByTestId('password').type('Password123!')
    cy.getByTestId('login-submit').click()
    cy.get('#email-error').should('contain.text', 'valid email')
    cy.get('@submit.all').should('have.length', 0)
  })

  scenario('login_short_password', function login_short_password() {
    cy.intercept('POST', '**/auth/login').as('submit')
    cy.visit('/login')
    cy.getByTestId('email').type('demo@example.test')
    cy.getByTestId('password').type('short')
    cy.getByTestId('login-submit').click()
    cy.get('#password-error').should('contain.text', 'at least 8')
    cy.get('@submit.all').should('have.length', 0)
  })

  scenario('login_locked', function login_locked() {
    cy.intercept('POST', '**/auth/login', { statusCode: 423, body: { code: 'ACCOUNT_LOCKED', message: 'Too many failed attempts. Try again later.' } })
    cy.visit('/login')
    cy.getByTestId('email').type('demo@example.test')
    cy.getByTestId('password').type('Password123!')
    cy.getByTestId('login-submit').click()
    cy.getByTestId('login-status').should('contain.text', 'Too many failed attempts')
    cy.getByTestId('login-submit').should('be.enabled')
    cy.location('pathname').should('eq', '/login')
  })

  scenario('login_server_error', function login_server_error() {
    cy.intercept({ method: 'POST', url: '**/auth/login', times: 1 }, {
      statusCode: 503, body: { code: 'INTERNAL_ERROR', message: 'Sign in is temporarily unavailable.' },
    }).as('unavailable')
    cy.visit('/login')
    cy.getByTestId('email').type('demo@example.test')
    cy.getByTestId('password').type('Password123!')
    cy.getByTestId('login-submit').click()
    cy.wait('@unavailable')
    cy.getByTestId('login-status').should('contain.text', 'temporarily unavailable')
    cy.getByTestId('email').should('have.value', 'demo@example.test')
    cy.getByTestId('login-submit').should('be.enabled').click()
    cy.getByTestId('logout').should('be.visible')
  })

  scenario('login_redirect', function login_redirect() {
    cy.visit('/login?redirect=/profile')
    cy.getByTestId('email').type('demo@example.test')
    cy.getByTestId('password').type('Password123!')
    cy.getByTestId('login-submit').click()
    cy.location('pathname').should('eq', '/profile')
  })

  scenario('login_role_redirect', function login_role_redirect() {
    cy.visit('/login?redirect=/super-admin/user-management')
    cy.getByTestId('email').type('admin@example.test')
    cy.getByTestId('password').type('Password123!')
    cy.getByTestId('login-submit').click()
    cy.location('pathname').should('eq', '/admin/dashboard')
  })

  

  

  

  
})
