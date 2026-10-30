import { stubApi, login } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

describe('profile', () => {
  beforeEach(() => { stubApi(); login(); cy.visit('/profile') })

  scenario('profile', function profile() {
    cy.getByTestId('profile-first-name').should('have.value', 'Demo')
    cy.getByTestId('profile-email').should('have.value', 'demo@example.test').and('be.disabled')
    cy.getByTestId('profile-phone').should('have.value', '0912345678')
  })

  scenario('profile_update', function profile_update() {
    cy.intercept('PATCH', '**/auth/me').as('save')
    cy.getByTestId('profile-first-name').clear().type('Updated')
    cy.getByTestId('profile-last-name').clear().type('Student')
    cy.getByTestId('profile-phone').clear().type('0811112222')
    cy.getByTestId('profile-save').click()
    cy.wait('@save').its('request.body').should('deep.eq', { firstName: 'Updated', lastName: 'Student', phoneNumber: '0811112222' })
    cy.contains('Profile saved').should('be.visible')
    cy.reload()
    cy.getByTestId('profile-first-name').should('have.value', 'Updated')
    cy.getByTestId('profile-phone').should('have.value', '0811112222')
  })

  scenario('profile_update_failed', function profile_update_failed() {
    cy.intercept('PATCH', '**/auth/me', { statusCode: 400, body: { code: 'VALIDATION_FAILED', message: 'The phone number is invalid.' } })
    cy.getByTestId('profile-phone').clear().type('wrong')
    cy.getByTestId('profile-save').click()
    cy.contains('Profile could not be saved').should('be.visible')
    cy.contains('The phone number is invalid.').should('be.visible')
    cy.getByTestId('profile-save').should('be.enabled')
    cy.reload()
    cy.getByTestId('profile-phone').should('have.value', '0912345678')
  })

  scenario('profile_avatar_invalid', function profile_avatar_invalid() {
    cy.getByTestId('profile-avatar-file').selectFile({ contents: Cypress.Buffer.from('not an image'), fileName: 'notes.txt', mimeType: 'text/plain' }, { force: true })
    cy.contains('Photo could not be uploaded').should('be.visible')
    cy.getByTestId('profile-avatar-remove').should('not.exist')
  })
})
