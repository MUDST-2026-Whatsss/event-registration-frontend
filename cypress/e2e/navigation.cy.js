describe('Navigation and Discovery', () => {
  it('loads the homepage with title and hero section', () => {
    cy.visit('/')

    cy.title().should('match', /Eventsss/i)
    cy.get('h1#home-title').should('have.text', 'Find Your Next Great Experience')
    cy.contains('nav a', 'Events').should('be.visible')
    cy.contains('.public-header a', 'Login').should('be.visible')
  })

  it('navigates to events page and lists available events', () => {
    cy.visit('/')
    cy.contains('nav a', 'Events').click()

    cy.url().should('include', '/events')
    cy.get('.event-card').should('have.length.greaterThan', 0)
  })

  it('can search and filter events', () => {
    cy.visit('/events')

    cy.get('input[placeholder="What kind of event are you looking for?"]').type('Global Tech Summit')
    cy.get('.event-card').should('contain.text', 'Global Tech Summit 2026')
  })

  it('navigates to event details page from event card', () => {
    cy.visit('/events')

    cy.get('.event-card').contains('Global Tech Summit 2026').click()

    cy.url().should('include', '/events/1')
    cy.get('h1').should('contain.text', 'Global Tech Summit 2026')
    cy.get('.detail-tabs').should('be.visible')
  })
})
