import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EventCover from '../EventCover.vue'

describe('event cover', () => {
  it('renders an accessible placeholder without requesting an empty image', () => {
    const wrapper = mount(EventCover, { props: { title: 'Community day', category: 'Community' } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('No cover image for Community day')
    expect(wrapper.text()).toBe('Community')
    expect(wrapper.classes()).toContain('event-cover--community')
  })

  it('keeps the real event image and its alt text', () => {
    const wrapper = mount(EventCover, { props: { src: '/cover.jpg', title: 'Event title' } })
    expect(wrapper.get('img').attributes()).toMatchObject({ src: '/cover.jpg', alt: 'Event title' })
    expect(wrapper.find('.event-cover__placeholder').exists()).toBe(false)
  })

  it('replaces a broken image and recovers when the source changes', async () => {
    const wrapper = mount(EventCover, { props: { src: '/broken.jpg', title: 'Design day', category: 'Design' } })
    await wrapper.get('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="img"]').isVisible()).toBe(true)
    await wrapper.setProps({ src: '/new-cover.jpg' })
    expect(wrapper.get('img').attributes('src')).toBe('/new-cover.jpg')
    await wrapper.setProps({ src: '' })
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('keeps small table thumbnails free of clipped text', () => {
    const wrapper = mount(EventCover, { props: { compact: true, title: 'Event title' } })
    expect(wrapper.classes()).toContain('event-cover--compact')
    expect(wrapper.find('.event-cover__category').exists()).toBe(false)
  })
})
