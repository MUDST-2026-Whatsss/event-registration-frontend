import { describe, expect, it, vi } from 'vitest'
import { useRegistrations } from '../useRegistrations.js'

const mocks = vi.hoisted(() => ({ listMyRegistrations: vi.fn() }))
vi.mock('../../api/registrationsApi.js', () => ({ ...mocks }))
vi.mock('@/features/events/public.js', () => ({ mapPublicEvent: (event) => event }))

describe('useRegistrations', () => {
  it('shows a no-show as missed rather than cancelled', async () => {
    mocks.listMyRegistrations.mockResolvedValue(['CONFIRMED', 'PENDING_PAYMENT', 'NO_SHOW', 'CANCELLED_BY_USER']
      .map((status, index) => ({ registrationId: `r${index}`, status, event: { slug: `event-${index}` } })))

    const statuses = (await useRegistrations().loadRegistrations(true)).map((item) => item.status)

    expect(statuses).toEqual(['registered', 'pending payment', 'missed', 'cancelled'])
  })
})
