import { describe, expect, it } from 'vitest'
import {
  normalizePhone,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../registerValidation.js'

describe('register validation', () => {
  it('accepts international names and enforces the backend length limit', () => {
    expect(validateName('สมชาย', 'first name')).toBe('')
    expect(validateName("O'Connor", 'last name')).toBe('')
    expect(validateName(' ', 'first name')).toBe('Please enter your first name.')
    expect(validateName('a'.repeat(101), 'first name')).toContain('at most 100')
  })

  it('accepts supported Thai phone formats and rejects malformed values', () => {
    expect(normalizePhone('081-234-5678')).toBe('0812345678')
    expect(validatePhone('081-234-5678')).toBe('')
    expect(validatePhone('02 123 4567')).toBe('')
    expect(validatePhone('0--------')).toContain('valid phone number')
    expect(validatePhone('')).toBe('Please enter your phone number.')
  })

  it('validates email and password using the backend limits', () => {
    expect(validateEmail('person@example.com')).toBe('')
    expect(validateEmail('person@')).toContain('valid email')
    expect(validateEmail(`${'a'.repeat(310)}@example.com`)).toContain('at most 320')

    expect(validatePassword('StrongPass1')).toBe('')
    expect(validatePassword('weakpass')).toContain('uppercase')
    expect(validatePassword(`Aa1${'x'.repeat(126)}`)).toContain('at most 128')
  })

  it('requires password confirmation to match exactly', () => {
    expect(validateConfirmPassword('StrongPass1', 'StrongPass1')).toBe('')
    expect(validateConfirmPassword('StrongPass2', 'StrongPass1')).toBe('Passwords do not match.')
  })
})
