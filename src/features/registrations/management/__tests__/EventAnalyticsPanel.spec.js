import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventAnalyticsPanel from '../EventAnalyticsPanel.vue'

const mocks = vi.hoisted(() => ({ getEventAnalytics: vi.fn() }))
vi.mock('../../api/registrationsApi.js', () => mocks)

const base = {
  signups: 6, memberSignups: 4, guestSignups: 2, dropOffs: 2, dropOffRate: 2 / 6, cancelledByAdmin: 1,
  confirmed: 1, checkedIn: 2, noShows: 0, showRate: null, eventEnded: false,
  dailySignups: [{ date: '2026-10-20', count: 2 }, { date: '2026-10-21', count: 4 }],
}

async function mountPanel() {
  const wrapper = mount(EventAnalyticsPanel, { props: { eventId: 'event-uuid' } })
  await flushPromises()
  return wrapper
}

describe('EventAnalyticsPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows signups, drop-offs and attendance progress before the event ends', async () => {
    mocks.getEventAnalytics.mockResolvedValue(base)
    const wrapper = await mountPanel()

    expect(mocks.getEventAnalytics).toHaveBeenCalledWith('event-uuid')
    expect(wrapper.get('[data-test="analytics-signups"]').text()).toContain('4 members · 2 guests')
    expect(wrapper.get('[data-test="analytics-drop-offs"]').text()).toContain('33.3% of signups')
    expect(wrapper.get('[data-test="analytics-drop-offs"]').text()).toContain('1 removed by admin')
    const attendance = wrapper.get('[data-test="analytics-attendance"]').text()
    expect(attendance).toContain('2 / 3')
    expect(attendance).not.toContain('Show rate')
    const bars = wrapper.findAll('.daily-bar')
    expect(bars).toHaveLength(2)
    expect(bars[1].attributes('style')).toContain('height: 100%')
  })

  it('shows the show rate once the event has ended', async () => {
    mocks.getEventAnalytics.mockResolvedValue({ ...base, confirmed: 0, noShows: 1, showRate: 2 / 3, eventEnded: true })
    const wrapper = await mountPanel()

    const attendance = wrapper.get('[data-test="analytics-attendance"]').text()
    expect(attendance).toContain('Show rate')
    expect(attendance).toContain('66.7%')
    expect(attendance).toContain('1 no-shows')
  })

  it('reports a failure instead of empty numbers', async () => {
    mocks.getEventAnalytics.mockRejectedValue(new Error('The requested event was not found.'))
    const wrapper = await mountPanel()

    expect(wrapper.get('[role="alert"]').text()).toContain('The requested event was not found.')
    expect(wrapper.find('[data-test="analytics-signups"]').exists()).toBe(false)
  })
})
