describe('Admin Experience and Access Control', () => {
  it('redirects unauthenticated user accessing admin dashboard', () => {
    cy.visit('/admin/dashboard')

    cy.url().should('include', '/login?redirect=/admin/dashboard')
    cy.get('.login-form').should('be.visible')
  })

  it('admin logs in successfully and accesses admin dashboard', () => {
    cy.visit('/login')

    cy.get('#email').type('admin@eventsss.com')
    cy.get('#password').type('admin123')
    cy.get('.submit-button').click()

    cy.url().should('include', '/admin/dashboard')
    cy.get('.hero-label').should('have.text', 'Total Registrations')

    cy.contains('button', 'Create Event').should('be.visible').click()
    cy.url().should('include', '/admin/create-event')
  })
})
