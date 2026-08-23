import { readonly, ref } from 'vue'

const STORAGE_KEY = 'eventsss_mock_authenticated'
const PASSWORD_KEY = 'eventsss_mock_password'

export const MOCK_CREDENTIALS = Object.freeze({
  email: 'demo@eventsss.com',
  password: 'password123',
})

const hasStoredSession = () => (
  window.localStorage.getItem(STORAGE_KEY) === 'true'
  || window.sessionStorage.getItem(STORAGE_KEY) === 'true'
)

const isAuthenticated = ref(hasStoredSession())

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    isAuthenticated.value = event.newValue === 'true'
  }
})

export function useAuth() {
  function verifyPassword(password) {
    const activePassword = window.localStorage.getItem(PASSWORD_KEY) ?? MOCK_CREDENTIALS.password
    return password === activePassword
  }

  function login(email, password) {
    const activePassword = window.localStorage.getItem(PASSWORD_KEY) ?? MOCK_CREDENTIALS.password
    const isValid = email.trim().toLowerCase() === MOCK_CREDENTIALS.email && password === activePassword

    if (isValid) {
      window.localStorage.setItem(STORAGE_KEY, 'true')
      window.sessionStorage.removeItem(STORAGE_KEY)
      isAuthenticated.value = true
    }

    return isValid
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY)
    window.sessionStorage.removeItem(STORAGE_KEY)
    isAuthenticated.value = false
  }

  function changePassword(currentPassword, newPassword) {
    const activePassword = window.localStorage.getItem(PASSWORD_KEY) ?? MOCK_CREDENTIALS.password
    if (currentPassword !== activePassword) return false
    window.localStorage.setItem(PASSWORD_KEY, newPassword)
    return true
  }

  function syncAuth() {
    isAuthenticated.value = hasStoredSession()

    if (isAuthenticated.value && window.localStorage.getItem(STORAGE_KEY) !== 'true') {
      window.localStorage.setItem(STORAGE_KEY, 'true')
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    login,
    logout,
    changePassword,
    verifyPassword,
    syncAuth,
  }
}
