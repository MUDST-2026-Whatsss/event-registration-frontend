import { reactive, watch } from 'vue'
import { useAuth } from './useAuth.js'

// Profile fields come from auth; only the temporary local avatar is browser-owned.

const AVATAR_KEY_PREFIX = 'eventsss_profile_avatar:'
const EMPTY_PROFILE = Object.freeze({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  avatar: '',
})
const profile = reactive({ ...EMPTY_PROFILE })
let activeAvatarKey = null

function getStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

function resetProfile() {
  activeAvatarKey = null
  Object.assign(profile, EMPTY_PROFILE)
}

function roleLabel(role) {
  return {
    user: 'User',
    admin: 'Admin',
    'super-admin': 'Super Admin',
  }[role] ?? ''
}

export function useProfile() {
  const { currentUser, currentRole, updateCurrentUser } = useAuth()

  watch(currentUser, (user) => {
    if (!user?.userId) {
      resetProfile()
      return
    }

    activeAvatarKey = `${AVATAR_KEY_PREFIX}${user.userId}`
    Object.assign(profile, {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phoneNumber ?? '',
      role: roleLabel(currentRole.value),
      avatar: getStorage()?.getItem(activeAvatarKey) ?? '',
    })
  }, { immediate: true })

  async function updateProfile(values) {
    return updateCurrentUser({
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phone,
    })
  }

  function setAvatar(dataUrl) {
    if (!activeAvatarKey) return
    profile.avatar = dataUrl
    getStorage()?.setItem(activeAvatarKey, dataUrl)
  }

  function removeAvatar() {
    profile.avatar = ''
    if (activeAvatarKey) getStorage()?.removeItem(activeAvatarKey)
  }

  return { profile, updateProfile, setAvatar, removeAvatar }
}
