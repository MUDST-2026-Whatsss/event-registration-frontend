import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsolePagination from '../ConsolePagination.vue'

describe('ConsolePagination', () => {
  it('shows the current range and emits page changes', async () => {
    const wrapper = mount(ConsolePagination, {
      props: { page: 0, pageSize: 10, totalElements: 17, totalPages: 2, itemLabel: 'users' },
    })

    expect(wrapper.text()).toContain('Showing 1–10 of 17 users')

    await wrapper.get('[aria-label="Next page"]').trigger('click')
    expect(wrapper.emitted('page')).toEqual([[1]])
  })

  it('emits the selected page size as a number', async () => {
    const wrapper = mount(ConsolePagination, {
      props: { page: 1, pageSize: 10, totalElements: 17, totalPages: 2 },
    })

    await wrapper.get('[aria-label="Rows per page"]').setValue('20')
    expect(wrapper.emitted('page-size')).toEqual([[20]])
  })
})
