import { stubApi } from '../support/api.js'

describe('Account Sign-up, Recovery and Role Selection', () => {
  beforeEach(stubApi)

  function fillSignUp(email) {
    cy.get('#first-name').type('New')
    cy.get('#last-name').type('Member')
    cy.get('#phone').type('0812345678')
    cy.get('#register-email').type(email)
    cy.get('#register-password').type('Password123!')
    cy.get('#confirm-password').type('Password123!')
  }

  it('AUTH-002 creates an account and opens sign-in with the email filled in', () => {
    cy.visit('/register')
    fillSignUp('new.member@example.test')
    cy.contains('button', 'Create account').click()

    cy.url().should('include', '/login')
    cy.get('.app-toast').should('contain.text', 'Account created')
    cy.getByTestId('email').should('have.value', 'new.member@example.test')
  })

  it('AUTH-003 shows field and API errors on the sign-up form', () => {
    cy.visit('/register')
    cy.get('#register-email').type('new.member@example.test')
    cy.get('#register-password').type('Password123!')
    cy.get('#confirm-password').type('Different123!').blur()
    cy.contains('Passwords do not match.').should('be.visible')

    cy.reload()
    fillSignUp('taken@example.test')
    cy.contains('button', 'Create account').click()
    cy.get('.form-status').should('have.text', 'That email address cannot be registered.')
    cy.url().should('include', '/register')
  })

  it('AUTH-004 requests a password reset link', () => {
    cy.visit('/forgot-password')
    cy.get('#recovery-email').type('not-an-email')
    cy.get('.forgot-form button[type="submit"]').click()
    cy.contains('Please enter a valid email address.').should('be.visible')

    cy.get('#recovery-email').clear().type('demo@example.test')
    cy.get('.forgot-form button[type="submit"]').click()
    cy.get('.request-status').should('have.text', 'If that email is registered, a reset link has been sent.')
  })

  it('AUTH-005 resets the password from a valid link and rejects an expired one', () => {
    cy.visit('/reset-password?token=expired-token')
    cy.get('#new-password').type('NewPassword123!')
    cy.get('#confirm-new-password').type('NewPassword123!')
    cy.get('form button[type="submit"]').click()
    cy.get('.form-status').should('have.text', 'This password reset link is invalid or has expired.')

    cy.visit('/reset-password?token=valid-token')
    cy.get('#new-password').type('NewPassword123!')
    cy.get('#confirm-new-password').type('NewPassword123!')
    cy.get('form button[type="submit"]').click()
    cy.url().should('include', '/login')
    cy.get('.app-toast').should('contain.text', 'Password reset successfully')
  })

  it('AUTH-006 asks a multi-role account to choose a role and opens the matching console', () => {
    cy.visit('/login')
    cy.getByTestId('email').type('multi@example.test')
    cy.getByTestId('password').type('test-password-123')
    cy.getByTestId('login-submit').click()

    cy.url().should('include', '/select-role')
    cy.get('.role-option').should('have.length', 2)
    cy.contains('.role-option', 'Administrator').click()

    cy.url().should('include', '/admin/dashboard')
    cy.get('.app-toast').should('contain.text', 'Administrator mode selected')
  })
})
