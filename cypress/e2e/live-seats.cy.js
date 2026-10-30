import { scenario } from '../support/scenarios.js'
import { stubApi } from '../support/api.js'

const SEAT_SOCKET = '/api/v1/ws/seats'

// Cypress cannot intercept WebSockets, so the page gets a stand-in socket the test drives itself.
// The Vite dev client opens its own socket too, so tests pick the seat socket by URL.
function fakeSeatSocket(win) {
  win.fakeSockets = []
  win.WebSocket = class {
    constructor(url) {
      this.url = url
      this.sent = []
      win.fakeSockets.push(this)
      setTimeout(() => this.onopen?.(), 0)
    }
    send(data) { this.sent.push(JSON.parse(data)) }
    close() {}
    push(update) { this.onmessage?.({ data: JSON.stringify(update) }) }
  }
}

const seatSocket = (win) => win.fakeSockets.find((socket) => socket.url.endsWith(SEAT_SOCKET))

describe('Live remaining seats', () => {
  beforeEach(stubApi)

  scenario('live_seats', function live_seats() {
    const eventId = '20000000-0000-0000-0000-000000000001'
    cy.visit('/events/cloud-security-meetup', { onBeforeLoad: fakeSeatSocket })
    cy.contains('10 of 10 spots left')

    cy.window().should((win) => expect(seatSocket(win)?.sent).to.deep.equal([{ subscribe: eventId }]))
    cy.window().then((win) => seatSocket(win).push({ eventId, remainingSeats: 3, full: false }))
    cy.contains('3 of 10 spots left')

    cy.window().then((win) => seatSocket(win).push({ eventId, remainingSeats: 0, full: true }))
    cy.contains('Fully booked')
    cy.getByTestId('event-register').should('be.disabled').and('contain.text', 'Fully Booked')
    cy.window().then(win => seatSocket(win).push({ eventId, remainingSeats: 1, full: false }))
    cy.contains('1 of 10 spots left').should('be.visible')
    cy.getByTestId('event-register').should('be.enabled')
  })

  scenario('live_seats_hidden', function live_seats_hidden() {
    const eventId = '20000000-0000-0000-0000-000000000001'
    cy.visit('/events/cloud-security-meetup', { onBeforeLoad: fakeSeatSocket })
    cy.contains('10 of 10 spots left').should('be.visible')
    cy.window().should(win => expect(seatSocket(win)?.sent).to.deep.eq([{ subscribe: eventId }]))
    cy.window().then(win => seatSocket(win).push({ eventId: 'another-event', remainingSeats: 0, full: true }))
    cy.contains('10 of 10 spots left').should('be.visible')
    cy.getByTestId('event-register').should('be.enabled')
    cy.window().then(win => seatSocket(win).push({ eventId, full: false }))
    cy.contains('10 of 10 spots left').should('not.exist')
    cy.contains('Registration open').should('be.visible')
    cy.getByTestId('event-register').should('be.enabled')
  })
})
