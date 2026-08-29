import { readonly, ref } from 'vue'

const STORAGE_KEY = 'eventsss_mock_authenticated'
const PASSWORD_KEY = 'eventsss_mock_password'
const ROLE_KEY = 'eventsss_mock_role'

export const USER_ROLE = 'user'
export const SUPER_ADMIN_ROLE = 'super-admin'

export const MOCK_CREDENTIALS = Object.freeze({
  email: 'demo@eventsss.com',
  password: 'password123',
})

export const SUPER_ADMIN_CREDENTIALS = Object.freeze({
  email: 'superadmin@eventsss.com',
  password: 'admin123',
})

const hasStoredSession = () => (
  window.localStorage.getItem(STORAGE_KEY) === 'true'
  || window.sessionStorage.getItem(STORAGE_KEY) === 'true'
)

const isAuthenticated = ref(hasStoredSession())
const currentRole = ref(isAuthenticated.value ? window.localStorage.getItem(ROLE_KEY) ?? USER_ROLE : null)

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    isAuthenticated.value = event.newValue === 'true'
    currentRole.value = isAuthenticated.value ? window.localStorage.getItem(ROLE_KEY) ?? USER_ROLE : null
  }

  if (event.key === ROLE_KEY) {
    currentRole.value = event.newValue
  }
})

export function useAuth() {
  function verifyPassword(password) {
    const activePassword = window.localStorage.getItem(PASSWORD_KEY) ?? MOCK_CREDENTIALS.password
    return password === activePassword
  }

  function login(email, password) {
    const activePassword = window.localStorage.getItem(PASSWORD_KEY) ?? MOCK_CREDENTIALS.password
    const normalizedEmail = email.trim().toLowerCase()
    let role = null

    if (normalizedEmail === MOCK_CREDENTIALS.email && password === activePassword) {
      role = USER_ROLE
    } else if (
      normalizedEmail === SUPER_ADMIN_CREDENTIALS.email
      && password === SUPER_ADMIN_CREDENTIALS.password
    ) {
      role = SUPER_ADMIN_ROLE
    }

    if (role) {
      window.localStorage.setItem(STORAGE_KEY, 'true')
      window.localStorage.setItem(ROLE_KEY, role)
      window.sessionStorage.removeItem(STORAGE_KEY)
      isAuthenticated.value = true
      currentRole.value = role
    }

    return role
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(ROLE_KEY)
    window.sessionStorage.removeItem(STORAGE_KEY)
    isAuthenticated.value = false
    currentRole.value = null
  }

  function changePassword(currentPassword, newPassword) {
    const activePassword = window.localStorage.getItem(PASSWORD_KEY) ?? MOCK_CREDENTIALS.password
    if (currentPassword !== activePassword) return false
    window.localStorage.setItem(PASSWORD_KEY, newPassword)
    return true
  }

  function syncAuth() {
    isAuthenticated.value = hasStoredSession()
    currentRole.value = isAuthenticated.value ? window.localStorage.getItem(ROLE_KEY) ?? USER_ROLE : null

    if (isAuthenticated.value && window.localStorage.getItem(STORAGE_KEY) !== 'true') {
      window.localStorage.setItem(STORAGE_KEY, 'true')
      window.localStorage.setItem(ROLE_KEY, currentRole.value)
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    currentRole: readonly(currentRole),
    login,
    logout,
    changePassword,
    verifyPassword,
    syncAuth,
  }
}
