describe('Authentication and User Sessions', () => {
  it('redirects unauthenticated users trying to access protected routes', () => {
    cy.visit('/profile')

    cy.url().should('include', '/login?redirect=/profile')
    cy.get('.login-form').should('be.visible')
  })

  it('displays error message on invalid login credentials', () => {
    cy.visit('/login')

    cy.get('#email').type('wrong@eventsss.com')
    cy.get('#password').type('wrongpass123')
    cy.get('.submit-button').click()

    cy.get('.form-status').should('be.visible').and('have.text', 'Incorrect email or password.')
  })

  it('successfully logs in with valid user credentials and logs out', () => {
    cy.visit('/login')

    cy.get('#email').type('demo@eventsss.com')
    cy.get('#password').type('password123')
    cy.get('.submit-button').click()

    cy.url().should('not.include', '/login')

    // Header updates with user info and Logout button
    cy.get('.public-header__account').should('be.visible').and('have.text', 'Logout')

    // Visit profile
    cy.visit('/profile')
    cy.get('h1').should('have.text', 'Profile')
    cy.get('.profile-identity').should('be.visible')

    // Logout
    cy.get('.public-header__account').click()
    cy.url().should('match', /\/$/)
    cy.contains('.public-header a', 'Login').should('be.visible')

    // Route guard protects profile again
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })
})
