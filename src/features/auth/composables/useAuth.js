import { computed, readonly, ref } from 'vue'
import { ApiError, apiRequest, resetCsrfToken } from '@/shared/lib/apiClient.js'

export const USER_ROLE = 'user'
export const SUPER_ADMIN_ROLE = 'super-admin'
export const ADMIN_ROLE = 'admin'

const ROLE_TITLE = Object.freeze({
  [USER_ROLE]: 'Participant',
  [ADMIN_ROLE]: 'Event Admin',
  [SUPER_ADMIN_ROLE]: 'Super Admin',
})

const BACKEND_ROLE = Object.freeze({
  USER: USER_ROLE,
  ADMIN: ADMIN_ROLE,
  SUPER_ADMIN: SUPER_ADMIN_ROLE,
})
const CLIENT_ROLE = Object.freeze({
  [USER_ROLE]: 'USER',
  [ADMIN_ROLE]: 'ADMIN',
  [SUPER_ADMIN_ROLE]: 'SUPER_ADMIN',
})
const ACTIVE_ROLE_KEY = 'eventsss_active_role'

const isAuthenticated = ref(false)
const currentRole = ref(null)
const authUser = ref(null)
const isInitializing = ref(false)
const isInitialized = ref(false)
const sessionExpired = ref(false)
let initializationRequest = null
let refreshRequest = null

const currentUser = computed(() => {
  if (!authUser.value) return null
  return {
    ...authUser.value,
    title: ROLE_TITLE[currentRole.value]
      ?? authUser.value.role?.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
      ?? 'User',
    avatar: '',
  }
})

const availableRoles = computed(() => (authUser.value?.roles ?? []).map(toClientRole))
const requiresRoleSelection = computed(() => (
  isAuthenticated.value && availableRoles.value.length > 1 && !currentRole.value
))

function normalizeRole(user) {
  return user?.role ? toClientRole(user.role) : null
}

function toClientRole(role) {
  return BACKEND_ROLE[role] ?? role.toLowerCase().replaceAll('_', '-')
}

function toBackendRole(role) {
  return CLIENT_ROLE[role] ?? role.toUpperCase().replaceAll('-', '_')
}

function storedRole() {
  try {
    return sessionStorage.getItem(ACTIVE_ROLE_KEY)
  } catch {
    return null
  }
}

function rememberRole(role) {
  try {
    if (role) sessionStorage.setItem(ACTIVE_ROLE_KEY, role)
    else sessionStorage.removeItem(ACTIVE_ROLE_KEY)
  } catch {
    // In-memory authentication still works if storage is unavailable.
  }
}

function applyUser(user) {
  authUser.value = user
  currentRole.value = normalizeRole(user)
  isAuthenticated.value = Boolean(user)
  rememberRole(user?.role ?? null)
  sessionExpired.value = false
}

function clearUser() {
  authUser.value = null
  currentRole.value = null
  isAuthenticated.value = false
  rememberRole(null)
}

async function refreshSession() {
  if (refreshRequest) return refreshRequest

  refreshRequest = (async () => {
    const activeRole = storedRole()
    let payload
    try {
      payload = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: activeRole ? { role: activeRole } : undefined,
      })
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403 || !activeRole) throw error
      rememberRole(null)
      payload = await apiRequest('/auth/refresh', { method: 'POST' })
    }
    applyUser(payload.user)
    resetCsrfToken()
    return payload.user
  })()

  try {
    return await refreshRequest
  } finally {
    refreshRequest = null
  }
}

export async function authenticatedApiRequest(path, options) {
  try {
    return await apiRequest(path, options)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    try {
      await refreshSession()
    } catch (refreshError) {
      clearUser()
      sessionExpired.value = true
      throw refreshError
    }
    return apiRequest(path, options)
  }
}

async function initializeAuth({ force = false } = {}) {
  if (force) {
    isInitialized.value = false
    initializationRequest = null
  }
  if (isInitialized.value) return authUser.value
  if (initializationRequest) return initializationRequest

  isInitializing.value = true
  initializationRequest = (async () => {
    let completed = false
    try {
      applyUser(await apiRequest('/auth/me'))
      completed = true
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error
      try {
        await refreshSession()
        completed = true
      } catch (refreshError) {
        if (!(refreshError instanceof ApiError) || refreshError.status !== 401) throw refreshError
        clearUser()
        completed = true
      }
    } finally {
      isInitialized.value = completed
      isInitializing.value = false
      initializationRequest = null
    }
    return authUser.value
  })()

  return initializationRequest
}

export function useAuth() {
  async function login(email, password) {
    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    })
    applyUser(payload.user)
    resetCsrfToken()
    isInitialized.value = true
    return currentRole.value
  }

  async function selectRole(role) {
    const backendRole = toBackendRole(role)
    const payload = await apiRequest('/auth/select-role', {
      method: 'POST',
      body: { role: backendRole },
    })
    applyUser(payload.user)
    resetCsrfToken()
    return currentRole.value
  }

  async function register(values) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber?.trim() ?? '',
      },
    })
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      clearUser()
      resetCsrfToken()
      isInitialized.value = true
    }
  }

  async function changePassword(currentPassword, newPassword) {
    await authenticatedApiRequest('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
    clearUser()
    resetCsrfToken()
    isInitialized.value = true
    return true
  }

  async function updateCurrentUser(values) {
    const user = await authenticatedApiRequest('/auth/me', {
      method: 'PATCH',
      body: values,
    })
    applyUser(user)
    return user
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    currentRole: readonly(currentRole),
    currentUser,
    availableRoles,
    requiresRoleSelection,
    isInitializing: readonly(isInitializing),
    isInitialized: readonly(isInitialized),
    sessionExpired: readonly(sessionExpired),
    login,
    selectRole,
    register,
    logout,
    changePassword,
    updateCurrentUser,
    initializeAuth,
    syncAuth: initializeAuth,
  }
}
