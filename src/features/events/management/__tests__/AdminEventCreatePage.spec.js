import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminEventCreatePage from '../AdminEventCreatePage.vue'
import { createAdminEvent, findEventInvitee, listEventCategories, submitAdminEvent } from '../../api/adminEventsApi.js'

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn(), push: vi.fn() },
  showToast: vi.fn(),
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: {} }), useRouter: () => mocks.router }))
vi.mock('@/shared/composables/useToast.js', () => ({ useToast: () => ({ showToast: mocks.showToast }) }))
vi.mock('../../api/adminEventsApi.js', async (importOriginal) => ({
  ...await importOriginal(),
  createAdminEvent: vi.fn(),
  findEventInvitee: vi.fn(),
  listEventCategories: vi.fn(),
  submitAdminEvent: vi.fn(),
}))

async function render() {
  const wrapper = mount(AdminEventCreatePage, {
    global: { stubs: { RouterLink: true, PageTopbar: true, ConsoleIcon: true } },
  })
  await flushPromises()
  return wrapper
}

describe('event draft form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listEventCategories.mockResolvedValue([])
    createAdminEvent.mockResolvedValue({ eventId: 'draft-id', version: 0, status: 'DRAFT' })
  })

  it('saves a title-only draft without fabricating dates, category, or capacity', async () => {
    const wrapper = await render()
    await wrapper.get('input[placeholder="e.g. Annual Tech Leadership Summit"]').setValue('Draft event')
    await wrapper.get('.btn-draft').trigger('click')
    await flushPromises()
    expect(createAdminEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Draft event', eventCategoryId: null, startAt: null, endAt: null,
      registrationEndAt: null, maximumParticipants: null,
    }))
    expect(mocks.router.replace).toHaveBeenCalledWith('/admin/events/draft-id/edit')
  })

  it('explains required review fields and does not submit an incomplete event', async () => {
    const wrapper = await render()
    await wrapper.get('input[placeholder="e.g. Annual Tech Leadership Summit"]').setValue('Draft event')
    await wrapper.get('.btn-submit').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Complete the required details')
    expect(createAdminEvent).not.toHaveBeenCalled()
    expect(submitAdminEvent).not.toHaveBeenCalled()
  })

  it('saves selected invitees with the draft without registering them', async () => {
    findEventInvitee.mockResolvedValue({ userId: 'invited-user', email: 'attendee@example.com' })
    const wrapper = await render()
    await wrapper.get('#invitee-email').setValue('attendee@example.com')
    await wrapper.get('.invitee-input-row button').trigger('click')
    await flushPromises()
    expect(wrapper.get('.invitee-list').text()).toContain('attendee@example.com')
    await wrapper.get('input[placeholder="e.g. Annual Tech Leadership Summit"]').setValue('Invited event')
    await wrapper.get('.btn-draft').trigger('click')
    await flushPromises()
    expect(createAdminEvent).toHaveBeenCalledWith(expect.objectContaining({ invitedUserIds: ['invited-user'] }))
    expect(submitAdminEvent).not.toHaveBeenCalled()
  })
})
