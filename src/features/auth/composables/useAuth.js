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

const isAuthenticated = ref(false)
const currentRole = ref(null)
const authUser = ref(null)
const isInitializing = ref(false)
const isInitialized = ref(false)
let initializationRequest = null
let refreshRequest = null

const currentUser = computed(() => {
  if (!authUser.value) return null
  return {
    ...authUser.value,
    title: ROLE_TITLE[currentRole.value] ?? 'User',
    avatar: '',
  }
})

function normalizeRole(user) {
  const candidates = [user?.role, ...(user?.roles ?? [])]
  if (candidates.includes('SUPER_ADMIN')) return SUPER_ADMIN_ROLE
  if (candidates.includes('ADMIN')) return ADMIN_ROLE
  return candidates.includes('USER') ? USER_ROLE : null
}

function applyUser(user) {
  authUser.value = user
  currentRole.value = normalizeRole(user)
  isAuthenticated.value = Boolean(user && currentRole.value)
}

function clearUser() {
  authUser.value = null
  currentRole.value = null
  isAuthenticated.value = false
}

async function refreshSession() {
  if (refreshRequest) return refreshRequest

  refreshRequest = (async () => {
    const payload = await apiRequest('/auth/refresh', { method: 'POST' })
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

async function requestWithSession(path, options) {
  try {
    return await apiRequest(path, options)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    try {
      await refreshSession()
    } catch (refreshError) {
      clearUser()
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
    await requestWithSession('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
    clearUser()
    resetCsrfToken()
    isInitialized.value = true
    return true
  }

  async function updateCurrentUser(values) {
    const user = await requestWithSession('/auth/me', {
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
    isInitializing: readonly(isInitializing),
    isInitialized: readonly(isInitialized),
    login,
    register,
    logout,
    changePassword,
    updateCurrentUser,
    initializeAuth,
    syncAuth: initializeAuth,
  }
}
