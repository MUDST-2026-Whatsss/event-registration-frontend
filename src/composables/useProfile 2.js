import { reactive } from 'vue'

const PROFILE_KEY = 'eventsss_mock_profile'
const defaults = {
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@eventsss.com',
  phone: '081-234-5678',
  role: 'User',
  avatar: '',
}

function readProfile() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PROFILE_KEY)) ?? {}
    const normalizedRole = {
      user: 'User',
      admin: 'Admin',
      'super admin': 'Super Admin',
    }[String(stored.role ?? '').toLowerCase()] ?? defaults.role

    return {
      firstName: stored.firstName ?? defaults.firstName,
      lastName: stored.lastName ?? defaults.lastName,
      email: stored.email ?? defaults.email,
      phone: stored.phone ?? defaults.phone,
      role: normalizedRole,
      avatar: stored.avatar ?? defaults.avatar,
    }
  } catch {
    return { ...defaults }
  }
}

const profile = reactive(readProfile())

function persist() {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function useProfile() {
  function updateProfile(values) {
    Object.assign(profile, values)
    persist()
  }

  function setAvatar(dataUrl) {
    profile.avatar = dataUrl
    persist()
  }

  function removeAvatar() {
    profile.avatar = ''
    persist()
  }

  return { profile, updateProfile, setAvatar, removeAvatar }
}
