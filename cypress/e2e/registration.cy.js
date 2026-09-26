describe('Event Registration Flow', () => {
  it('completes free event registration and reflects in user registrations', () => {
    // 1. Authenticate user
    cy.visit('/login')
    cy.get('#email').type('demo@eventsss.com')
    cy.get('#password').type('password123')
    cy.get('.submit-button').click()
    cy.url().should('not.include', '/login')

    // 2. Navigate to an open event (Event 9: Cloud Security Community Meetup)
    cy.visit('/events/9')
    cy.get('h1').should('contain.text', 'Cloud Security Community Meetup')

    cy.get('button.detail-register')
      .should('be.visible')
      .and('have.text', 'Register Now')
      .click()

    // 3. Confirm details on registration confirmation page
    cy.url().should('include', '/events/9/register')
    cy.get('h1').should('contain.text', 'Confirm your registration')

    cy.get('.registration-consent input[type="checkbox"]').check()

    // 4. Submit registration
    cy.get('button.registration-confirm').click()

    // 5. Success screen verification
    cy.url().should('include', '/events/9/registration-success')
    cy.get('h1').should('have.text', 'Registration successful!')
    cy.get('.success-details').should('contain.text', 'EVT-2026-0009')

    // 6. Navigate to My Registrations and confirm event is listed
    cy.contains('a', 'View my registrations').click()
    cy.url().should('include', '/my-registrations')
    cy.get('.registration-card').should('contain.text', 'Cloud Security Community Meetup')
  })
})
