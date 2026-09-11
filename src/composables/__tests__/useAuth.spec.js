import { beforeEach, describe, expect, it } from 'vitest'
import {
  MOCK_CREDENTIALS,
  SUPER_ADMIN_CREDENTIALS,
  SUPER_ADMIN_ROLE,
  USER_ROLE,
  useAuth,
} from '../useAuth.js'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAuth().logout()
  })

  it('logs in with valid user credentials and sets the user role', () => {
    const { login, isAuthenticated, currentRole } = useAuth()
    const role = login(MOCK_CREDENTIALS.email, MOCK_CREDENTIALS.password)

    expect(role).toBe(USER_ROLE)
    expect(isAuthenticated.value).toBe(true)
    expect(currentRole.value).toBe(USER_ROLE)
  })

  it('logs in with valid super admin credentials and returns the super-admin role', () => {
    const { login } = useAuth()
    const role = login(SUPER_ADMIN_CREDENTIALS.email, SUPER_ADMIN_CREDENTIALS.password)

    expect(role).toBe(SUPER_ADMIN_ROLE)
  })

  it('rejects a wrong password and leaves the session unauthenticated', () => {
    const { login, isAuthenticated } = useAuth()
    const role = login(MOCK_CREDENTIALS.email, 'wrong-password')

    expect(role).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })

  it('normalizes the email (trims whitespace, ignores case)', () => {
    const { login } = useAuth()
    const role = login(`  ${MOCK_CREDENTIALS.email.toUpperCase()}  `, MOCK_CREDENTIALS.password)

    expect(role).toBe(USER_ROLE)
  })

  it('clears authentication state on logout', () => {
    const { login, logout, isAuthenticated, currentRole } = useAuth()
    login(MOCK_CREDENTIALS.email, MOCK_CREDENTIALS.password)

    logout()

    expect(isAuthenticated.value).toBe(false)
    expect(currentRole.value).toBeNull()
  })

  it('verifyPassword matches the mock password by default', () => {
    const { verifyPassword } = useAuth()

    expect(verifyPassword(MOCK_CREDENTIALS.password)).toBe(true)
    expect(verifyPassword('nope')).toBe(false)
  })

  it('changePassword updates the password used by verifyPassword', () => {
    const { changePassword, verifyPassword } = useAuth()

    const ok = changePassword(MOCK_CREDENTIALS.password, 'newpass123')

    expect(ok).toBe(true)
    expect(verifyPassword('newpass123')).toBe(true)
    expect(verifyPassword(MOCK_CREDENTIALS.password)).toBe(false)
  })

  it('changePassword fails when the current password is wrong', () => {
    const { changePassword } = useAuth()

    expect(changePassword('totally-wrong', 'whatever')).toBe(false)
  })
})
