// Lab Week 7: select controls by their purpose instead of presentation classes.
Cypress.Commands.add('getByTestId', (name, options = {}) =>
  cy.get(`[data-test="${name}"]`, options))
