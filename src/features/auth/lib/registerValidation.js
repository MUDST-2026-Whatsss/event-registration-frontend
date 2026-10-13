export const REGISTER_LIMITS = Object.freeze({
  name: 100,
  phone: 32,
  email: 320,
  password: 128,
})

export const normalizePhone = (value = '') => value.replace(/[\s-]/g, '')

export function validateName(value, label) {
  const trimmedValue = value.trim()

  if (!trimmedValue) return `Please enter your ${label}.`
  if (trimmedValue.length > REGISTER_LIMITS.name) {
    return `${label[0].toUpperCase()}${label.slice(1)} must be at most ${REGISTER_LIMITS.name} characters.`
  }

  return ''
}

export function validatePhone(value) {
  const normalizedPhone = normalizePhone(value)

  if (!normalizedPhone) return 'Please enter your phone number.'
  if (!/^0\d{8,9}$/.test(normalizedPhone)) {
    return 'Enter a valid phone number, for example 081-234-5678.'
  }

  return ''
}

export function validateEmail(value) {
  const trimmedValue = value.trim()

  if (!trimmedValue) return 'Please enter your email.'
  if (trimmedValue.length > REGISTER_LIMITS.email) {
    return `Email must be at most ${REGISTER_LIMITS.email} characters.`
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return 'Please enter a valid email address.'
  }

  return ''
}

export function validatePassword(value) {
  if (!value) return 'Please enter your password.'
  if (value.length > REGISTER_LIMITS.password) {
    return `Password must be at most ${REGISTER_LIMITS.password} characters.`
  }
  if (value.length < 8 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    return 'Use 8+ characters with uppercase, lowercase, and a number.'
  }

  return ''
}

export function validateConfirmPassword(value, password) {
  if (!value) return 'Please confirm your password.'
  if (value !== password) return 'Passwords do not match.'
  return ''
}
