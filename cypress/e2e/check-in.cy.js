import QRCode from 'qrcode'
import { stubApi, login } from '../support/api.js'

// Replaces the camera with a canvas that keeps painting the given QR image, so the real decoder runs.
function fakeCameraShowing(win, qrDataUrl) {
  win.navigator.mediaDevices.getUserMedia = () => new Promise((resolve) => {
    const image = new win.Image()
    image.onload = () => {
      const canvas = win.document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const context = canvas.getContext('2d')
      const paint = () => {
        context.fillStyle = '#fff'
        context.fillRect(0, 0, 400, 400)
        context.drawImage(image, 60, 60, 280, 280)
      }
      paint()
      win.setInterval(paint, 100)
      resolve(canvas.captureStream(10))
    }
    image.src = qrDataUrl
  })
}

describe('Event Check-in', () => {
  beforeEach(stubApi)

  it('admin scans a guest ticket QR code with the camera to check them in', () => {
    const ticket = JSON.stringify({ type: 'eventsss-check-in', registrationId: 'REG-GUESTA0001', eventId: 'cloud-security-meetup' })
    cy.wrap(QRCode.toDataURL(ticket, { width: 280, margin: 2 })).then((qrDataUrl) => {
      login('admin@example.test')
      cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')
      cy.contains('.participant-table tr', 'Gary Guest').should('contain.text', 'Guest')

      cy.window().then((win) => fakeCameraShowing(win, qrDataUrl))
      cy.getByTestId('check-in-scan').click()

      cy.get('.app-toast', { timeout: 10000 }).should('contain.text', 'Gary Guest checked in.')
      cy.get('[aria-labelledby="scanner-title"]').should('not.exist')
      cy.contains('.participant-table tr', 'Gary Guest').should('contain.text', 'Checked in')
    })
  })
  it('admin sees the event analytics and attendance moves after a check-in', () => {
    login('admin@example.test')
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')

    cy.getByTestId('analytics-signups').should('contain.text', '2').and('contain.text', '1 members · 1 guests')
    cy.getByTestId('analytics-drop-offs').should('contain.text', '0')
    // The event has not ended, so attendance shows progress instead of a show rate.
    cy.getByTestId('analytics-attendance').should('contain.text', 'Attendance').and('contain.text', '0 / 2')
      .and('not.contain.text', 'Show rate')
    cy.getByTestId('analytics-daily').find('li').should('have.length', 1)

    cy.get('#check-in-number').type('REG-ATTEND0001')
    cy.contains('button', 'Check in').click()
    cy.getByTestId('analytics-attendance').should('contain.text', '1 / 2')
  })
  it('admin checks in a participant by registration number from the participants page', () => {
    login('admin@example.test')
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')

    cy.get('h1').should('contain.text', 'Cloud Security Community Meetup')
    cy.get('.participant-table').should('contain.text', 'Alice Attendee').and('contain.text', 'Confirmed')

    // Staff may type the number in lower case; the button stays disabled until something is entered.
    cy.contains('button', 'Check in').should('be.disabled')
    cy.get('#check-in-number').type('reg-attend0001')
    cy.contains('button', 'Check in').click()

    cy.get('.app-toast').should('contain.text', 'Alice Attendee checked in.')
    cy.get('.participant-table').should('contain.text', 'Checked in')
    cy.get('#check-in-number').should('have.value', '')
  })

  it('shows the API error when the participant was already checked in or the number is unknown', () => {
    login('admin@example.test')
    cy.visit('/admin/events/20000000-0000-0000-0000-000000000001/participants')

    cy.get('#check-in-number').type('REG-ATTEND0001')
    cy.contains('button', 'Check in').click()
    cy.get('.app-toast').should('contain.text', 'checked in.')

    cy.get('#check-in-number').type('REG-ATTEND0001')
    cy.contains('button', 'Check in').click()
    cy.get('.app-toast').should('contain.text', 'This registration has already been checked in.')

    cy.get('#check-in-number').type('REG-UNKNOWN000')
    cy.contains('button', 'Check in').click()
    cy.get('.app-toast').should('contain.text', 'The requested registration was not found.')
  })
})
