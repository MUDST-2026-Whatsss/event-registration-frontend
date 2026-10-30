import QRCode from 'qrcode'

const QR_TYPE = 'eventsss-check-in'

// The ticket QR carries the registration number; the check-in API only needs that number.
export function checkInQrDataUrl(registrationNumber, eventSlug) {
  return QRCode.toDataURL(JSON.stringify({
    type: QR_TYPE,
    registrationId: registrationNumber,
    eventId: eventSlug,
  }), {
    width: 280,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#18181B', light: '#FFFFFF' },
  })
}

// Accepts a ticket QR or a bare REG-... number, so other QR codes are ignored rather than submitted.
export function registrationNumberFromQr(text) {
  const value = String(text ?? '').trim()
  try {
    const payload = JSON.parse(value)
    if (payload?.type === QR_TYPE && typeof payload.registrationId === 'string') return payload.registrationId
  } catch {
    // Not JSON; fall through to the plain number check.
  }
  return /^REG-[A-Z0-9]{6,28}$/i.test(value) ? value.toUpperCase() : null
}
