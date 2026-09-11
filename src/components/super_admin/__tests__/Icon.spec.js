import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from '../Icon.vue'

describe('Icon', () => {
  it('renders an svg at the default size', () => {
    const wrapper = mount(Icon, { props: { name: 'check' } })
    const svg = wrapper.find('svg')

    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('18')
    expect(svg.attributes('height')).toBe('18')
  })

  it('applies a custom size', () => {
    const wrapper = mount(Icon, { props: { name: 'check', size: 32 } })

    expect(wrapper.find('svg').attributes('width')).toBe('32')
    expect(wrapper.find('svg').attributes('height')).toBe('32')
  })

  it('renders known icons with actual svg content', () => {
    const wrapper = mount(Icon, { props: { name: 'search' } })

    expect(wrapper.find('svg').element.innerHTML.trim().length).toBeGreaterThan(0)
  })

  it('renders an empty svg for an unknown icon name', () => {
    const wrapper = mount(Icon, { props: { name: 'not-a-real-icon' } })

    expect(wrapper.find('svg').element.innerHTML.trim()).toBe('')
  })
})
