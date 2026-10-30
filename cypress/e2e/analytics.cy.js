import { stubApi, login } from '../support/api.js'
import { scenario } from '../support/scenarios.js'

const summary = {
  signups: 6, memberSignups: 4, guestSignups: 2, dropOffs: 2, dropOffRate: 1 / 3,
  cancelledByAdmin: 0, confirmed: 0, checkedIn: 3, noShows: 1, showRate: 0.75, eventEnded: true,
  dailySignups: [{ date: '2026-10-28', count: 2 }, { date: '2026-10-29', count: 4 }],
}

describe('analytics', () => {
  beforeEach(() => { stubApi(); login('admin@example.test') })

  scenario('analytics_show_rate', function analytics_show_rate() {
    cy.intercept('GET', '**/admin/events/*/analytics', summary)
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')
    cy.getByTestId('analytics-signups').should('contain.text', '4 members · 2 guests')
    cy.getByTestId('analytics-drop-offs').should('contain.text', '33.3%')
    cy.getByTestId('analytics-attendance').should('contain.text', 'Show rate').and('contain.text', '75%')
      .and('contain.text', '3 checked in · 1 no-shows')
    cy.getByTestId('analytics-daily').find('li').should('have.length', 2)
    cy.getByTestId('analytics-daily').find('.daily-count').then(items => {
      expect([...items].map(item => item.textContent)).to.deep.eq(['2', '4'])
    })
  })

  scenario('analytics_empty', function analytics_empty() {
    cy.intercept('GET', '**/admin/events/*/analytics', {
      signups: 0, memberSignups: 0, guestSignups: 0, dropOffs: 0, dropOffRate: null,
      cancelledByAdmin: 0, confirmed: 0, checkedIn: 0, noShows: 0, showRate: null,
      eventEnded: true, dailySignups: [],
    })
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')
    cy.getByTestId('analytics-attendance').should('contain.text', '–').and('not.contain.text', 'NaN')
    cy.contains('No signups yet.').should('be.visible')
    cy.getByTestId('analytics-daily').should('not.exist')
  })

  scenario('analytics_failed', function analytics_failed() {
    cy.intercept('GET', '**/admin/events/*/analytics', {
      statusCode: 503, body: { code: 'INTERNAL_ERROR', message: 'Analytics are temporarily unavailable.' },
    })
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')
    cy.contains('Analytics are temporarily unavailable.').should('be.visible')
    cy.get('.participant-table').should('contain.text', 'Alice Attendee')
    cy.get('#check-in-number').should('be.visible')
  })
})
