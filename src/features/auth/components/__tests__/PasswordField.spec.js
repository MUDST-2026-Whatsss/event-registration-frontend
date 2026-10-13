import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PasswordField from '../PasswordField.vue'

describe('PasswordField', () => {
  it('shows and hides each password field independently', async () => {
    const wrapper = mount({
      components: { PasswordField },
      template: `
        <div>
          <PasswordField id="password-one" label="Password" model-value="secret-one" />
          <PasswordField id="password-two" label="Confirm password" model-value="secret-two" />
        </div>
      `,
    })

    const inputs = wrapper.findAll('input')
    const toggles = wrapper.findAll('button')

    expect(inputs[0].attributes('type')).toBe('password')
    expect(inputs[1].attributes('type')).toBe('password')

    await toggles[0].trigger('click')

    expect(inputs[0].attributes('type')).toBe('text')
    expect(inputs[1].attributes('type')).toBe('password')
    expect(toggles[0].attributes('aria-pressed')).toBe('true')
  })
})
