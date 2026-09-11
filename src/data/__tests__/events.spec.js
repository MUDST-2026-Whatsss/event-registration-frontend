import { describe, expect, it } from 'vitest'
import { canRegisterForEvent } from '../events.js'

describe('canRegisterForEvent', () => {
  it('allows registration for an open event', () => {
    expect(canRegisterForEvent({ status: 'open' })).toBe(true)
  })

  it('allows registration for an almost-full event', () => {
    expect(canRegisterForEvent({ status: 'almost-full' })).toBe(true)
  })

  it('blocks registration for a closed event', () => {
    expect(canRegisterForEvent({ status: 'closed' })).toBe(false)
  })

  it('blocks registration for an upcoming event', () => {
    expect(canRegisterForEvent({ status: 'upcoming' })).toBe(false)
  })

  it('returns false when given null or undefined', () => {
    expect(canRegisterForEvent(null)).toBe(false)
    expect(canRegisterForEvent(undefined)).toBe(false)
  })
})
