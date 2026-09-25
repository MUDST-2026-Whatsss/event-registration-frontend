import { readonly, ref } from 'vue'
import { api } from '@/api/client.js'

const STORAGE_KEY = 'eventsss_mock_authenticated'
const ROLE_KEY = 'eventsss_mock_role'

export const USER_ROLE = 'user'
export const SUPER_ADMIN_ROLE = 'super-admin'
export const ADMIN_ROLE = 'admin'

function mapRole(backendRole) {
  if (backendRole === 'SUPER_ADMIN') return SUPER_ADMIN_ROLE
  if (backendRole === 'ADMIN') return ADMIN_ROLE
  return USER_ROLE
}

const isAuthenticated = ref(
  window.localStorage.getItem(STORAGE_KEY) === 'true'
)
const currentRole = ref(
  isAuthenticated.value ? (window.localStorage.getItem(ROLE_KEY) ?? USER_ROLE) : null
)

function setSession(role) {
  window.localStorage.setItem(STORAGE_KEY, 'true')
  window.localStorage.setItem(ROLE_KEY, role)
  isAuthenticated.value = true
  currentRole.value = role
}

function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(ROLE_KEY)
  isAuthenticated.value = false
  currentRole.value = null
}

export function useAuth() {
  async function login(email, password) {
    const data = await api.post('/api/v1/auth/login', { email, password })
    const role = mapRole(data.user.role)
    setSession(role)
    return role
  }

  async function logout() {
    await api.post('/api/v1/auth/logout').catch(() => {})
    clearSession()
  }

  async function register(payload) {
    return api.post('/api/v1/auth/register', payload)
  }

  function syncAuth() {
    isAuthenticated.value =
      window.localStorage.getItem(STORAGE_KEY) === 'true' ||
      window.sessionStorage.getItem(STORAGE_KEY) === 'true'
    currentRole.value = isAuthenticated.value
      ? window.localStorage.getItem(ROLE_KEY) ?? USER_ROLE
      : null
  }

  function verifyPassword() { return false }
  function changePassword() { return false }

  return {
    isAuthenticated: readonly(isAuthenticated),
    currentRole: readonly(currentRole),
    login,
    logout,
    register,
    syncAuth,
    verifyPassword,
    changePassword,
  }
}
