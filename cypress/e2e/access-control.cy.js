import { stubApi, login } from '../support/api.js'

describe('User and role administration', () => {
  beforeEach(stubApi)

  it('ROLE-001 creates a role with permissions and assigns it to a user', () => {
    login('super@example.test')
    cy.visit('/super-admin/role-management')
    cy.getByTestId('role-create').click()
    cy.getByTestId('role-name').type('Class Reviewer')
    cy.getByTestId('role-code').should('have.value', 'CLASS_REVIEWER')
    cy.getByTestId('role-permission').check('EVENT_UPDATE')
    cy.intercept('POST', '**/api/v1/admin/roles').as('createRole')
    cy.getByTestId('role-submit').click()
    cy.wait('@createRole').its('request.body.permissionCodes').should('deep.eq', ['EVENT_UPDATE'])
    cy.getByTestId('role-row').should('contain.text', 'Class Reviewer')
    cy.visit('/super-admin/user-management')
    cy.getByTestId('user-manage-roles').click()
    cy.getByTestId('user-role-option').check('CLASS_REVIEWER')
    cy.intercept('PUT', '**/admin/users/*/roles').as('assignRole')
    cy.getByTestId('user-roles-save').click()
    cy.wait('@assignRole').its('request.body.roleCodes').should('include', 'CLASS_REVIEWER')
    cy.reload()
    cy.getByTestId('user-row').should('contain.text', 'Class Reviewer')
  })

  it('USER-001 disables and enables a participant account', () => {
    login('super@example.test')
    cy.visit('/super-admin/user-management')
    cy.intercept('PATCH', '**/admin/users/*/status').as('status')
    cy.getByTestId('user-disable').click()
    cy.wait('@status').its('request.body.status').should('eq', 'DISABLED')
    cy.reload()
    cy.getByTestId('user-row').should('contain.text', 'Disabled')
    cy.getByTestId('user-enable').click()
    cy.wait('@status').its('request.body.status').should('eq', 'ACTIVE')
    cy.getByTestId('user-row').should('contain.text', 'Active')
  })

  it('ACCESS-001 keeps a participant out of the super-admin console', () => {
    login()
    cy.visit('/super-admin/user-management')
    cy.url().should('not.include', '/super-admin')
    cy.getByTestId('user-manage-roles').should('not.exist')
  })
})
