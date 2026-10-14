import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import EventRegistrationView from '../EventRegistrationView.vue'

const mocks = vi.hoisted(() => ({
  register: vi.fn(), completeMockPayment: vi.fn(), loadRegistrations: vi.fn(), findRegistration: vi.fn(),
  replace: vi.fn(), loadEvent: vi.fn(), qr: vi.fn(),
  event: { id: 'paid-event', eventId: 'event-uuid', title: 'Paid event', price: 99, image: '', date: 'Oct 20', location: 'Hall' },
  canRegister: true,
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { slug: 'paid-event' }, query: {} }), useRouter: () => ({ replace: mocks.replace }) }))
vi.mock('../../composables/useRegistrations.js', () => ({ useRegistrations: () => mocks }))
vi.mock('@/features/events/public.js', () => ({ EventCover: { template: '<div />' }, usePublicEvents: () => ({ findEvent: () => mocks.event, loadEvent: mocks.loadEvent }), canRegisterForEvent: () => mocks.canRegister }))
vi.mock('@/features/auth/public.js', () => ({ useAuth: () => ({ currentUser: ref({ name: 'Test', phoneNumber: '0912345678', email: 'test@example.test' }) }) }))
vi.mock('qrcode', () => ({ default: { toDataURL: mocks.qr } }))

let wrapper
async function start() {
  wrapper = mount(EventRegistrationView, { global: { stubs: { PublicHeader: true, AppFooter: true, RouterLink: true } } })
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
