import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import EventRegistrationView from '../EventRegistrationView.vue'

const mocks = vi.hoisted(() => ({
  register: vi.fn(), registerGuest: vi.fn(), completeMockPayment: vi.fn(), completeGuestMockPayment: vi.fn(), loadRegistrations: vi.fn(), findRegistration: vi.fn(),
  replace: vi.fn(), loadEvent: vi.fn(), qr: vi.fn(), signedIn: true,
  event: { id: 'paid-event', eventId: 'event-uuid', title: 'Paid event', price: 99, image: '', date: 'Oct 20', location: 'Hall' },
  canRegister: true,
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { slug: 'paid-event' }, query: {} }), useRouter: () => ({ replace: mocks.replace }) }))
vi.mock('../../composables/useRegistrations.js', () => ({ useRegistrations: () => mocks }))
vi.mock('@/features/events/public.js', () => ({ EventCover: { template: '<div />' }, usePublicEvents: () => ({ findEvent: () => mocks.event, loadEvent: mocks.loadEvent }), canRegisterForEvent: () => mocks.canRegister }))
vi.mock('@/features/auth/public.js', () => ({
  useAuth: () => ({
    currentUser: ref(mocks.signedIn ? { name: 'Test', phoneNumber: '0912345678', email: 'test@example.test' } : null),
    isAuthenticated: ref(mocks.signedIn),
    initializeAuth: () => Promise.resolve(),
  }),
}))
vi.mock('qrcode', () => ({ default: { toDataURL: mocks.qr } }))

let wrapper
async function start() {
  wrapper = mount(EventRegistrationView, { global: { stubs: { PublicHeader: true, AppFooter: true, RouterLink: RouterLinkStub } } })
  await flushPromises()
  await wrapper.get('input[type="checkbox"]').setValue(true)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('paid registration process', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.event.price = 99
    mocks.canRegister = true
    mocks.signedIn = true
    mocks.findRegistration.mockReturnValue(null)
    mocks.loadEvent.mockResolvedValue(undefined)
    mocks.loadRegistrations.mockResolvedValue([])
    mocks.qr.mockResolvedValue('data:image/png;base64,test')
    mocks.register.mockResolvedValue({ id: 'saved-id', apiStatus: 'PENDING_PAYMENT' })
    mocks.completeMockPayment.mockResolvedValue({ id: 'saved-id', apiStatus: 'CONFIRMED', registrationNumber: 'REG-123' })
  })
  afterEach(() => { wrapper?.unmount(); vi.useRealTimers() })

  it('keeps the QR process and confirms the saved registration before success', async () => {
    await start()
    expect(wrapper.get('[role="dialog"]').text()).toContain('Scan to pay')
    expect(mocks.register).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(6000)
    await flushPromises()
    expect(mocks.completeMockPayment).toHaveBeenCalledWith('saved-id')
    expect(wrapper.text()).toContain('Your registration has been confirmed.')
    await vi.advanceTimersByTimeAsync(1200)
    expect(mocks.replace).toHaveBeenCalledWith(expect.objectContaining({ name: 'registration-success', query: { transaction: 'MOCK-REG-123' } }))
  })

  it('does not show success or navigate when confirmation fails', async () => {
    mocks.completeMockPayment.mockRejectedValue(new Error('Unable to save confirmation'))
    await start()
    await vi.advanceTimersByTimeAsync(7200)
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to save confirmation')
    expect(mocks.replace).not.toHaveBeenCalled()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('closing the QR before processing does not register or confirm', async () => {
    await start()
    await wrapper.get('[aria-label="Close payment"]').trigger('click')
    await vi.advanceTimersByTimeAsync(7200)
    expect(mocks.register).not.toHaveBeenCalled()
    expect(mocks.completeMockPayment).not.toHaveBeenCalled()
  })

  it('resumes a pending last seat even when the public event is full', async () => {
    mocks.canRegister = false
    mocks.findRegistration.mockReturnValue({ apiStatus: 'PENDING_PAYMENT' })
    await start()
    await vi.advanceTimersByTimeAsync(6000)
    await flushPromises()
    expect(mocks.completeMockPayment).toHaveBeenCalledWith('saved-id')
  })

  it('free events still register directly without the payment process', async () => {
    mocks.event.price = 0
    mocks.register.mockResolvedValue({ id: 'free-id', apiStatus: 'CONFIRMED' })
    await start()
    expect(mocks.register).toHaveBeenCalledTimes(1)
    expect(mocks.completeMockPayment).not.toHaveBeenCalled()
    expect(mocks.qr).not.toHaveBeenCalled()
    expect(mocks.replace).toHaveBeenCalledWith({ name: 'registration-success', params: { slug: 'paid-event' } })
  })
})

describe('guest registration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.signedIn = false
    mocks.canRegister = true
    mocks.event.price = 0
    mocks.loadEvent.mockResolvedValue(undefined)
    mocks.qr.mockResolvedValue('data:image/png;base64,test')
    mocks.registerGuest.mockResolvedValue({ registrationNumber: 'REG-GUEST00001', apiStatus: 'CONFIRMED' })
    mocks.completeGuestMockPayment.mockResolvedValue({ registrationNumber: 'REG-GUEST00001', attendeeEmail: 'gina@example.test', apiStatus: 'CONFIRMED' })
  })
  afterEach(() => { wrapper?.unmount(); vi.useRealTimers() })

  async function submitPaidGuest() {
    mocks.event.price = 99
    mocks.registerGuest.mockResolvedValue({ registrationNumber: 'REG-GUEST00001', attendeeEmail: 'gina@example.test', apiStatus: 'PENDING_PAYMENT' })
    wrapper = mount(EventRegistrationView, { global: { stubs: { PublicHeader: true, AppFooter: true, RouterLink: RouterLinkStub } } })
    await flushPromises()
    await wrapper.get('input[autocomplete="name"]').setValue('Gina Guest')
    await wrapper.get('input[type="tel"]').setValue('0812345678')
    await wrapper.get('input[type="email"]').setValue('gina@example.test')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
  }

  it('registers a guest for a free event and opens the ticket without putting the email in the URL', async () => {
    wrapper = mount(EventRegistrationView, { global: { stubs: { PublicHeader: true, AppFooter: true, RouterLink: RouterLinkStub } } })
    await flushPromises()
    expect(wrapper.find('[data-test="guest-notice"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="registration-back"]').text()).toBe('Back')
    expect(wrapper.get('input[autocomplete="name"]').attributes('placeholder')).toBe('Enter your full name')
    expect(wrapper.get('input[type="tel"]').attributes('placeholder')).toBe('e.g. 0812345678')
    expect(wrapper.get('input[type="email"]').attributes('placeholder')).toBe('you@example.com')
    expect(mocks.loadRegistrations).not.toHaveBeenCalled()

    await wrapper.get('input[autocomplete="name"]').setValue('Gina Guest')
    await wrapper.get('input[type="tel"]').setValue('0812345678')
    await wrapper.get('input[type="email"]').setValue('gina@example.test')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.registerGuest).toHaveBeenCalledWith(mocks.event, { fullName: 'Gina Guest', phone: '0812345678', email: 'gina@example.test' })
    expect(mocks.register).not.toHaveBeenCalled()
    expect(mocks.replace).toHaveBeenCalledWith({
      name: 'guest-ticket',
      state: { registrationNumber: 'REG-GUEST00001', email: 'gina@example.test', justRegistered: true },
    })
  })

  it('shows the same payment QR for a guest and opens the persisted confirmed ticket', async () => {
    await submitPaidGuest()
    expect(wrapper.get('[role="dialog"]').text()).toContain('Scan to pay')
    expect(mocks.registerGuest).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(6000)
    await flushPromises()
    expect(mocks.registerGuest).toHaveBeenCalledTimes(1)
    expect(mocks.completeGuestMockPayment).toHaveBeenCalledWith('REG-GUEST00001', 'gina@example.test')
    expect(mocks.register).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1200)
    expect(mocks.replace).toHaveBeenCalledWith({ name: 'guest-ticket', state: {
      registrationNumber: 'REG-GUEST00001', email: 'gina@example.test', justRegistered: true,
    } })
  })

  it('keeps a failed guest confirmation pending and retries the same reserved last seat', async () => {
    mocks.completeGuestMockPayment.mockRejectedValueOnce(new Error('Confirmation failed'))
    await submitPaidGuest()
    await vi.advanceTimersByTimeAsync(7200)
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Confirmation failed')
    expect(mocks.replace).not.toHaveBeenCalled()
    mocks.canRegister = false
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(7200)
    await flushPromises()
    expect(mocks.registerGuest).toHaveBeenCalledTimes(1)
    expect(mocks.completeGuestMockPayment).toHaveBeenCalledTimes(2)
    expect(mocks.replace).toHaveBeenCalledWith(expect.objectContaining({ name: 'guest-ticket' }))
  })

  it('closing the guest QR before processing does not reserve a seat', async () => {
    await submitPaidGuest()
    await wrapper.get('[aria-label="Close payment"]').trigger('click')
    await vi.advanceTimersByTimeAsync(7200)
    expect(mocks.registerGuest).not.toHaveBeenCalled()
    expect(mocks.completeGuestMockPayment).not.toHaveBeenCalled()
  })
})
