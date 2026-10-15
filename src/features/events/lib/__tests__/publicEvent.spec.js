import { describe, expect, it } from 'vitest'
import { canRegisterForEvent, groupPublicEvents, mapPublicEvent } from '../publicEvent.js'

const baseEvent = {
  eventId: 'b3b4f30c-e9a8-40fd-a9fa-1b2574412570',
  slug: 'api-event',
  title: 'API Event',
  category: { nameEn: 'Technology' },
  eventType: 'FREE',
  price: 0,
  currency: 'THB',
  locationType: 'ONSITE',
  locationName: 'Bangkok Hall',
  timezone: 'Asia/Bangkok',
  startAt: '2026-12-20T02:00:00Z',
  endAt: '2026-12-20T10:00:00Z',
  registrationStartAt: '2026-09-01T00:00:00Z',
  registrationEndAt: '2026-12-19T00:00:00Z',
}

describe('public event model', () => {
  it('maps the API contract into the card model', () => {
    const event = mapPublicEvent(baseEvent, new Date('2026-09-26T00:00:00Z').getTime())

    expect(event.id).toBe('api-event')
    expect(event.status).toBe('open')
    expect(event.location).toBe('Bangkok Hall')
    expect(event.categoryName).toBe('Technology')
    expect(event.image).toBe('')
    expect(canRegisterForEvent(event)).toBe(true)
  })

  it('marks events as upcoming before registration opens', () => {
    const event = mapPublicEvent(
      { ...baseEvent, registrationStartAt: '2026-10-01T00:00:00Z' },
      new Date('2026-09-26T00:00:00Z').getTime(),
    )

    expect(event.status).toBe('upcoming')
    expect(canRegisterForEvent(event)).toBe(false)
  })

  it('shows remaining seats from the API', () => {
    const event = mapPublicEvent(
      { ...baseEvent, maximumParticipants: 50, remainingSeats: 12, full: false },
      new Date('2026-09-26T00:00:00Z').getTime(),
    )

    expect(event.capacity).toBe('12 of 50 spots left')
    expect(canRegisterForEvent(event)).toBe(true)
  })

  it('blocks registration when the event is full', () => {
    const event = mapPublicEvent(
      { ...baseEvent, maximumParticipants: 50, remainingSeats: 0, full: true },
      new Date('2026-09-26T00:00:00Z').getTime(),
    )

    expect(event.badge).toBe('Full')
    expect(event.capacity).toBe('Fully booked')
    expect(canRegisterForEvent(event)).toBe(false)
  })

  it('groups events by their registration lifecycle', () => {
    const grouped = groupPublicEvents([
      { id: 'one', status: 'open' },
      { id: 'two', status: 'upcoming' },
      { id: 'three', status: 'closed' },
    ])

    expect(grouped.map((group) => group.id)).toEqual(['open', 'upcoming', 'closed'])
  })

  it('includes the empty Upcoming group only when requested', () => {
    const events = [{ id: 'one', status: 'open' }]
    expect(groupPublicEvents(events).map(group => group.id)).toEqual(['open'])
    const groups = groupPublicEvents(events, { includeEmptyUpcoming: true })
    expect(groups.map(group => group.id)).toEqual(['open', 'upcoming'])
    expect(groups[1].events).toEqual([])
  })
})
