import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import EventsView from '../EventsView.vue'
import HomeView from '../HomeView.vue'

const mocks = vi.hoisted(() => ({ events: [], loadEvents: vi.fn(async () => {}) }))
vi.mock('../../public.js', async (importOriginal) => ({
  ...await importOriginal(),
  usePublicEvents: () => ({ events: ref(mocks.events), loading: ref(false), error: ref(''), loadEvents: mocks.loadEvents }),
}))

let wrapper
afterEach(() => wrapper?.unmount())

async function render(path = '/events', component = EventsView, events) {
  const future = new Date(Date.now() + 86400000).toISOString()
  mocks.events = events ?? [
    { id: 'closed', slug: 'closed', title: 'Closed registration event', status: 'closed', startAt: future },
    { id: 'open', slug: 'open', title: 'Open registration event', status: 'open', startAt: future },
    { id: 'upcoming', slug: 'upcoming', title: 'Upcoming registration event', status: 'upcoming', startAt: future },
  ]
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] })
  await router.push(path)
  await router.isReady()
  wrapper = mount(component, { global: { plugins: [router], stubs: {
    PublicHeader: true, AppFooter: true,
    EventCard: { props: ['event'], template: '<div class="test-event-card">{{ event.title }}</div>' },
  } } })
  await flushPromises()
  return router
}

describe('event discovery filters', () => {
  it('reflects the URL group in the dropdown instead of claiming to show all events', async () => {
    await render('/events?group=open')
    expect(wrapper.get('select').element.value).toBe('open')
    expect(wrapper.findAll('.test-event-card').map(card => card.text())).toEqual(['Open registration event'])
  })

  it('choosing All removes the group restriction and includes registration-closed events', async () => {
    const router = await render('/events?group=open')
    await wrapper.get('select').setValue('all')
    await flushPromises()
    expect(router.currentRoute.value.query.group).toBeUndefined()
    expect(wrapper.findAll('.test-event-card')).toHaveLength(3)
    expect(wrapper.get('h1').text()).toBe('Our Events')
    expect(wrapper.text()).toContain('Registration Closed / Past Events')
  })

  it('can switch directly from Open to Closed and follows subsequent route changes', async () => {
    const router = await render('/events?group=open&q=registration')
    await wrapper.get('select').setValue('closed')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ group: 'closed', q: 'registration' })
    expect(wrapper.findAll('.test-event-card').map(card => card.text())).toEqual(['Closed registration event'])
    await router.push('/events?group=upcoming')
    await flushPromises()
    expect(wrapper.get('select').element.value).toBe('upcoming')
    expect(wrapper.findAll('.test-event-card').map(card => card.text())).toEqual(['Upcoming registration event'])
  })

  it('shows the selected group even when it has no events, without falling back to all', async () => {
    await render('/events?group=closed', EventsView, [{ id: 'open', status: 'open', title: 'Open event' }])
    expect(wrapper.get('select').element.value).toBe('closed')
    expect(wrapper.findAll('.test-event-card')).toHaveLength(0)
    expect(wrapper.text()).toContain('No matching events')
  })

  it('only promotes a future event with registration open and available seats', async () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    await render('/', HomeView, [
      { id: 'closed', slug: 'closed', title: 'Closed event', startAt: future, status: 'closed' },
      { id: 'full', slug: 'full', title: 'Full event', startAt: future, status: 'open', full: true },
      { id: 'expired', slug: 'expired', title: 'Expired cached event', startAt: future, status: 'open', registrationEndAt: '2020-01-01T00:00:00Z' },
      { id: 'open', slug: 'open', title: 'Available event', startAt: future, status: 'open' },
    ])
    expect(wrapper.get('.countdown').attributes('href')).toBe('/events/open')
    expect(wrapper.get('.countdown__event').text()).toBe('Available event')
  })

  it('hides the promotional banner when no event is available to register', async () => {
    await render('/', HomeView, [{ id: 'closed', status: 'closed', startAt: new Date(Date.now() + 86400000).toISOString() }])
    expect(wrapper.find('.countdown').exists()).toBe(false)
  })
})
