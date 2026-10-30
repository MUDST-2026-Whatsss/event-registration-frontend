import { describe, expect, it } from 'vitest'
import { registrationNumberFromQr } from '../checkInQr.js'

describe('registrationNumberFromQr', () => {
  it('reads the registration number from a ticket QR payload', () => {
    const payload = JSON.stringify({ type: 'eventsss-check-in', registrationId: 'REG-ABCDEF2345', eventId: 'meetup' })
    expect(registrationNumberFromQr(payload)).toBe('REG-ABCDEF2345')
  })

  it('accepts a bare registration number in any case', () => {
    expect(registrationNumberFromQr(' reg-abcdef2345 ')).toBe('REG-ABCDEF2345')
  })

  it('ignores QR codes that are not tickets', () => {
    expect(registrationNumberFromQr('https://example.com')).toBeNull()
    expect(registrationNumberFromQr(JSON.stringify({ type: 'eventsss-promptpay', reference: 'PAY-1' }))).toBeNull()
    expect(registrationNumberFromQr('')).toBeNull()
  })
})
