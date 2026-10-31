import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import EventDetailView from '../EventDetailView.vue'

const mocks = vi.hoisted(() => ({ loadEvent: vi.fn(), loadRegistrations: vi.fn(), signedIn: false }))
vi.mock('@/features/auth/public.js', () => ({ useAuth: () => ({ isAuthenticated: ref(mocks.signedIn) }) }))
vi.mock('@/features/registrations/public.js', () => ({
  useRegistrations: () => ({ isRegistered: () => false, loadRegistrations: mocks.loadRegistrations }),
}))
vi.mock('../../public.js', async importOriginal => ({
  ...await importOriginal(),
  usePublicEvents: () => ({ loadEvent: mocks.loadEvent }),
}))

let wrapper
beforeEach(() => {
  vi.clearAllMocks()
  mocks.signedIn = false
  mocks.loadEvent.mockResolvedValue({
    id: 'free-event', title: 'Free event', price: 0, status: 'open', full: false,
    categoryName: 'Design', registrationEndAt: '2099-01-01T00:00:00Z',
  })
})
afterEach(() => wrapper?.unmount())

async function render(from) {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
  ] })
  await router.push({ path: '/events/free-event', query: from ? { from } : {} })
  await router.isReady()
  wrapper = mount(EventDetailView, { global: { plugins: [router], stubs: {
    PublicHeader: true, AppFooter: true, EventCover: true,
  } } })
  await flushPromises()
  return router
}

describe('guest event detail and return navigation', () => {
  it('opens free registration without redirecting a guest to login', async () => {
    const router = await render('/')
    expect(wrapper.get('[data-test="event-register"]').text()).toBe('Register Now')
    expect(wrapper.text()).toContain('Register as a guest')
    await wrapper.get('[data-test="event-register"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/events/free-event/register')
    expect(router.currentRoute.value.query.from).toBe('/')
    expect(mocks.loadRegistrations).not.toHaveBeenCalled()
  })

  it('lets a guest open paid registration and retains the return destination', async () => {
    mocks.loadEvent.mockResolvedValue({ id: 'free-event', price: 99, status: 'open', full: false })
    const router = await render('/events?group=open&q=design')
    expect(wrapper.get('[data-test="event-register"]').text()).toBe('Register Now')
    await wrapper.get('[data-test="event-register"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/events/free-event/register')
    expect(router.currentRoute.value.query.from).toBe('/events?group=open&q=design')
  })

  it.each([
    ['/', '/', 'Back to Home'],
    ['/events?group=open&q=design', '/events?group=open&q=design', 'Back to Events'],
    ['/my-registrations?status=registered', '/my-registrations?status=registered', 'Back to My Registrations'],
    ['https://example.com', '/events', 'Back to Events'],
    ['/my-registrations-untrusted', '/events', 'Back to Events'],
  ])('returns safely to %s', async (from, target, label) => {
    const router = await render(from)
    const link = wrapper.get('[data-test="event-back"]')
    expect(link.text()).toBe('Back')
    expect(link.attributes('aria-label')).toBe(label)
    expect(link.attributes('href')).toBe(target)
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Event navigation')
    await link.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe(target)
  })
})
