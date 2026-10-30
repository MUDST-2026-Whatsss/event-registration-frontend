import { stubApi } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

function fill(values = {}) {
  const fields = { 'first-name': 'Somchai', 'last-name': 'Student', phone: '081-234-5678',
    'register-email': 'student@example.test', 'register-password': 'Password123!', 'confirm-password': 'Password123!', ...values }
  for (const [field, value] of Object.entries(fields)) cy.getByTestId(field).clear().type(value)
}

describe('register', () => {
  beforeEach(() => { stubApi(); cy.visit('/register') })

  

  scenario('register_empty', function register_empty() {
    cy.intercept('POST', '**/auth/register').as('create')
    cy.getByTestId('register-submit').click()
    for (const field of ['first-name', 'last-name', 'phone', 'register-email', 'register-password', 'confirm-password']) {
      cy.get(`[id="${field}-error"]`).should('be.visible')
    }
    cy.get('@create.all').should('have.length', 0)
  })

  scenario('register_invalid_phone', function register_invalid_phone() {
    cy.intercept('POST', '**/auth/register').as('create')
    fill({ phone: '0--------' })
    cy.getByTestId('register-submit').click()
    cy.get('#phone-error').should('contain.text', 'valid phone')
    cy.get('@create.all').should('have.length', 0)
  })

  scenario('register_weak_password', function register_weak_password() {
    cy.intercept('POST', '**/auth/register').as('create')
    fill({ 'register-password': 'weakpass', 'confirm-password': 'weakpass' })
    cy.getByTestId('register-submit').click()
    cy.get('#register-password-error').should('be.visible')
    cy.get('@create.all').should('have.length', 0)
  })

  

  

  scenario('register_field_error', function register_field_error() {
    cy.intercept('POST', '**/auth/register', { statusCode: 400, body: {
      code: 'VALIDATION_FAILED', message: 'The submitted data is invalid.', fieldErrors: { phoneNumber: 'Unsupported phone number.' },
    } })
    fill()
    cy.getByTestId('register-submit').click()
    cy.get('#phone-error').should('have.text', 'Unsupported phone number.')
    cy.getByTestId('register-email').should('have.value', 'student@example.test')
  })
})
