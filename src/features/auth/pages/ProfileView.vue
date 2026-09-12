<script setup>
import { Camera, Check, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, Trash2, UserRound, X } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '@/shared/ui/AppFooter.vue'
import PublicHeader from '@/app/components/PublicHeader.vue'
import AppToast from '@/shared/ui/AppToast.vue'
import { useAuth } from '../composables/useAuth.js'
import { useProfile } from '../composables/useProfile.js'
import { ApiError } from '@/shared/lib/apiClient.js'

const { profile, updateProfile, setAvatar, removeAvatar } = useProfile()
const saved = ref(false)
const avatarInput = ref(null)
const showPasswords = ref(false)
const securityOpen = ref(false)
const securityDialog = ref(null)
const passwordStatus = ref(null)
const router = useRouter()
const { changePassword } = useAuth()
const passwordApiError = ref('')
const isSavingProfile = ref(false)
const isChangingPassword = ref(false)
const passwordForm = reactive({ current: '', next: '', confirm: '' })
const passwordTouched = reactive({ current: false, next: false, confirm: false })
const passwordSubmitted = ref(false)

const passwordRules = computed(() => ({
  length: passwordForm.next.length >= 8,
  lowercase: /[a-z]/.test(passwordForm.next),
  uppercase: /[A-Z]/.test(passwordForm.next),
  number: /\d/.test(passwordForm.next),
}))

const currentPasswordError = computed(() => {
  if (!passwordTouched.current && !passwordSubmitted.value) return ''
  if (!passwordForm.current) return 'Enter your current password.'
  if (passwordApiError.value) return passwordApiError.value
  return ''
})

const newPasswordError = computed(() => {
  if (!passwordTouched.next && !passwordSubmitted.value) return ''
  if (!passwordForm.next) return 'Enter a new password.'
  if (passwordForm.next === passwordForm.current) return 'New password must be different from the current password.'
  if (!Object.values(passwordRules.value).every(Boolean)) return 'Password does not meet all requirements.'
  return ''
})

const confirmPasswordError = computed(() => {
  if (!passwordTouched.confirm && !passwordSubmitted.value) return ''
  if (!passwordForm.confirm) return 'Confirm your new password.'
  if (passwordForm.confirm !== passwordForm.next) return 'Passwords do not match.'
  return ''
})

const isPasswordFormValid = computed(() => (
  Boolean(passwordForm.current && passwordForm.next && passwordForm.confirm)
  && passwordForm.next !== passwordForm.current
  && Object.values(passwordRules.value).every(Boolean)
  && passwordForm.confirm === passwordForm.next
))

async function saveProfile() {
  isSavingProfile.value = true
  try {
    await updateProfile(profile)
    saved.value = true
    window.setTimeout(() => { saved.value = false }, 2500)
  } catch (error) {
    passwordStatus.value = {
      variant: 'danger',
      title: 'Profile could not be saved',
      message: error instanceof ApiError ? error.message : 'Please try again.',
    }
  } finally {
    isSavingProfile.value = false
  }
}

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
      const sourceX = (image.naturalWidth - sourceSize) / 2
      const sourceY = (image.naturalHeight - sourceSize) / 2
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 320
      canvas.getContext('2d').drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 320, 320)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/webp', 0.82))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to read image'))
    }

    image.src = objectUrl
  })
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    passwordStatus.value = { variant: 'warning', title: 'Photo could not be uploaded', message: 'Use a JPG, PNG, or WebP image under 5 MB.' }
    return
  }

  try {
    setAvatar(await resizeAvatar(file))
    passwordStatus.value = { variant: 'success', title: 'Profile photo updated', message: 'Your new photo now appears in the navigation.' }
  } catch {
    passwordStatus.value = { variant: 'danger', title: 'Photo could not be uploaded', message: 'Please choose another image and try again.' }
  }
}

function handleRemoveAvatar() {
  removeAvatar()
  passwordStatus.value = { variant: 'info', title: 'Profile photo removed', message: 'Your initials will be shown instead.' }
}

async function savePassword() {
  passwordSubmitted.value = true
  passwordApiError.value = ''
  if (!isPasswordFormValid.value) return

  isChangingPassword.value = true
  try {
    await changePassword(passwordForm.current, passwordForm.next)
  } catch (error) {
    passwordApiError.value = error instanceof ApiError ? error.message : 'Unable to update password.'
    isChangingPassword.value = false
    return
  }

  passwordForm.current = ''
  passwordForm.next = ''
  passwordForm.confirm = ''
  passwordSubmitted.value = false
  Object.keys(passwordTouched).forEach((key) => { passwordTouched[key] = false })
  securityOpen.value = false
  showPasswords.value = false
  isChangingPassword.value = false
  await router.push('/login')
}

async function openSecurity() {
  securityOpen.value = true
  await nextTick()
  securityDialog.value?.focus()
}

function closeSecurity() {
  securityOpen.value = false
  showPasswords.value = false
  passwordForm.current = ''
  passwordForm.next = ''
  passwordForm.confirm = ''
  passwordSubmitted.value = false
  passwordApiError.value = ''
  Object.keys(passwordTouched).forEach((key) => { passwordTouched[key] = false })
}

function handleKeydown(event) {
  if (event.key === 'Escape' && securityOpen.value) closeSecurity()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="profile-page">
    <PublicHeader />
    <main class="profile-shell">
      <div class="profile-heading"><p>My account</p><h1>Profile</h1><span>Manage your personal information.</span></div>
      <div class="profile-layout">
        <div class="profile-sidebar">
          <aside class="profile-summary">
            <div class="profile-avatar">
              <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" />
              <span v-else>{{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}</span>
              <button type="button" aria-label="Change profile photo" title="Change profile photo" @click="avatarInput.click()"><Camera :size="16" /></button>
              <input ref="avatarInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" @change="handleAvatarChange" />
            </div>
            <div class="profile-identity"><h2>{{ profile.firstName }} {{ profile.lastName }}</h2><span>{{ profile.role }}</span></div>
            <button v-if="profile.avatar" class="profile-remove-photo" type="button" @click="handleRemoveAvatar"><Trash2 :size="14" />Remove photo</button>
            <dl><div><dt><Mail :size="16" /></dt><dd>{{ profile.email }}</dd></div><div><dt><Phone :size="16" /></dt><dd>{{ profile.phone }}</dd></div></dl>
            <RouterLink to="/my-registrations">View my registrations</RouterLink>
          </aside>
          <section class="security-summary">
            <div class="security-summary__icon"><ShieldCheck :size="21" /></div>
            <div><h2>Security</h2><p>Keep your account protected with a strong password.</p></div>
            <button type="button" @click="openSecurity">Change password</button>
          </section>
        </div>

        <form class="profile-form personal-form" @submit.prevent="saveProfile">
          <div class="profile-form__title"><UserRound :size="21" /><div><h2>Personal information</h2><p>Update the information associated with your account.</p></div></div>
          <div class="profile-form__grid">
            <label><span>First name</span><input v-model.trim="profile.firstName" required /></label>
            <label><span>Last name</span><input v-model.trim="profile.lastName" required /></label>
            <label class="full"><span>Email</span><input v-model.trim="profile.email" type="email" disabled aria-describedby="email-edit-help" /><small id="email-edit-help">Contact support to change your sign-in email.</small></label>
            <label class="full"><span>Phone number</span><input v-model.trim="profile.phone" type="tel" /></label>
          </div>
          <div class="profile-form__footer"><p v-if="saved"><Check :size="16" />Profile saved</p><button type="submit" :disabled="isSavingProfile">{{ isSavingProfile ? 'Saving…' : 'Save changes' }}</button></div>
        </form>
      </div>
    </main>
    <AppFooter />
    <AppToast v-if="passwordStatus" v-bind="passwordStatus" @close="passwordStatus = null" />

    <div v-if="securityOpen" class="security-backdrop" @click.self="closeSecurity">
      <form ref="securityDialog" class="security-dialog" role="dialog" aria-modal="true" aria-labelledby="security-title" tabindex="-1" @submit.prevent="savePassword">
        <button class="security-dialog__close" type="button" aria-label="Close" title="Close" @click="closeSecurity"><X :size="20" /></button>
        <div class="security-dialog__heading"><span><ShieldCheck :size="23" /></span><div><h2 id="security-title">Change password</h2><p>Choose a password with at least 8 characters.</p></div></div>
        <div class="security-fields">
          <label><span>Current password</span><div :class="{ invalid: currentPasswordError }"><LockKeyhole :size="17" /><input v-model="passwordForm.current" :type="showPasswords ? 'text' : 'password'" autocomplete="current-password" :aria-invalid="Boolean(currentPasswordError)" aria-describedby="current-password-error" @blur="passwordTouched.current = true" @input="passwordApiError = ''" /></div><small v-if="currentPasswordError" id="current-password-error" class="security-error">{{ currentPasswordError }}</small></label>
          <label><span>New password</span><div :class="{ invalid: newPasswordError }"><LockKeyhole :size="17" /><input v-model="passwordForm.next" :type="showPasswords ? 'text' : 'password'" autocomplete="new-password" :aria-invalid="Boolean(newPasswordError)" aria-describedby="new-password-error password-requirements" @blur="passwordTouched.next = true" /></div><small v-if="newPasswordError" id="new-password-error" class="security-error">{{ newPasswordError }}</small><ul id="password-requirements" class="password-requirements"><li :class="{ passed: passwordRules.length }"><Check :size="13" />8+ characters</li><li :class="{ passed: passwordRules.lowercase && passwordRules.uppercase }"><Check :size="13" />Upper &amp; lowercase</li><li :class="{ passed: passwordRules.number }"><Check :size="13" />One number</li></ul></label>
          <label><span>Confirm new password</span><div :class="{ invalid: confirmPasswordError }"><LockKeyhole :size="17" /><input v-model="passwordForm.confirm" :type="showPasswords ? 'text' : 'password'" autocomplete="new-password" :aria-invalid="Boolean(confirmPasswordError)" aria-describedby="confirm-password-error" @blur="passwordTouched.confirm = true" /></div><small v-if="confirmPasswordError" id="confirm-password-error" class="security-error">{{ confirmPasswordError }}</small></label>
        </div>
        <button class="password-visibility" type="button" :title="showPasswords ? 'Hide passwords' : 'Show passwords'" @click="showPasswords = !showPasswords"><EyeOff v-if="showPasswords" :size="17" /><Eye v-else :size="17" />{{ showPasswords ? 'Hide passwords' : 'Show passwords' }}</button>
        <div class="security-dialog__actions"><button type="button" @click="closeSecurity">Cancel</button><button class="primary" type="submit" :disabled="!isPasswordFormValid || isChangingPassword">{{ isChangingPassword ? 'Updating…' : 'Update password' }}</button></div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; }
.profile-page main { flex: 1; }
.profile-shell { width: min(100% - 48px, 1000px); margin-inline: auto; padding-block: 38px 60px; }
.profile-heading p { margin: 0 0 5px; color: #2455db; font-size: .75rem; font-weight: 600; text-transform: uppercase; }
.profile-heading h1 { margin: 0; font-size: 2.25rem; letter-spacing: 0; }
.profile-heading span { color: var(--neutral-600); }
.profile-layout { display: grid; margin-top: 28px; grid-template-columns: 280px minmax(0, 1fr); gap: 24px; align-items: stretch; }
.profile-sidebar { display: grid; height: 100%; grid-template-rows: auto 1fr; gap: 18px; }
.profile-summary, .profile-form { background: var(--neutral-0); border: 1px solid var(--neutral-300); border-radius: 6px; box-shadow: 0 3px 10px rgb(24 24 27 / 8%); }
.profile-summary { padding: 22px 20px; text-align: center; }
.profile-avatar { position: relative; display: grid; width: 66px; height: 66px; margin-inline: auto; place-items: center; color: #2455db; background: #e8edff; border-radius: 50%; font-size: 1.3rem; font-weight: 600; }
.profile-avatar > img { width: 100%; height: 100%; object-fit: cover; border: 2px solid var(--neutral-0); border-radius: 50%; box-shadow: 0 0 0 1px #cbd3ef; }
.profile-avatar > button { position: absolute; right: -5px; bottom: -2px; display: grid; width: 29px; height: 29px; place-items: center; color: var(--neutral-0); background: #2455db; border: 2px solid var(--neutral-0); border-radius: 50%; box-shadow: 0 2px 7px rgb(24 24 27 / 22%); cursor: pointer; }
.profile-avatar > button:hover { background: #183fae; }
.profile-identity { display: flex; margin: 11px 0 14px; align-items: center; justify-content: center; gap: 7px; }
.profile-summary h2 { margin: 0; font-size: 1.1rem; }
.profile-identity > span { display: inline-flex; padding: 2px 7px; color: #315bd5; background: #e8edff; border-radius: 3px; font-size: .62rem; font-weight: 600; line-height: 1.5; text-transform: uppercase; }
.profile-remove-photo { display: inline-flex; min-height: 26px; margin: -8px auto 8px; padding-inline: 6px; align-items: center; gap: 4px; color: #9a3540; background: transparent; cursor: pointer; font-size: .68rem; }
.profile-summary dl { display: grid; padding-block: 13px; gap: 8px; border-block: 1px solid var(--neutral-200); text-align: left; }
.profile-summary dl > div { display: grid; min-width: 0; grid-template-columns: 20px 1fr; gap: 7px; color: var(--neutral-600); font-size: .78rem; }
.profile-summary dt { color: #2455db; }
.profile-summary dd { margin: 0; overflow-wrap: anywhere; }
.profile-summary a { display: grid; height: 36px; margin-top: 14px; place-items: center; color: #2455db; border: 1px solid #b9c6f5; border-radius: 5px; font-size: .75rem; font-weight: 500; text-decoration: none; }
.profile-form { padding: 28px; }
.profile-form__title { display: flex; padding-bottom: 20px; align-items: flex-start; gap: 11px; color: #2455db; border-bottom: 1px solid var(--neutral-200); }
.profile-form__title h2 { margin: 0; color: #20263a; font-size: 1.15rem; }
.profile-form__title p { margin: 2px 0 0; color: var(--neutral-600); font-size: .78rem; }
.profile-form__grid { display: grid; padding-block: 24px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.profile-form label { display: grid; gap: 6px; }
.profile-form label.full { grid-column: 1 / -1; }
.profile-form label span { font-size: .78rem; font-weight: 500; }
.profile-form input, .profile-form select { width: 100%; height: 44px; padding-inline: 12px; color: #20263a; background: #fafaff; border: 1px solid #cbd0df; border-radius: 5px; outline: 0; }
.profile-form input:focus, .profile-form select:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.profile-form__footer { display: flex; padding-top: 20px; align-items: center; justify-content: flex-end; gap: 16px; border-top: 1px solid var(--neutral-200); }
.profile-form__footer p { display: inline-flex; margin: 0 auto 0 0; align-items: center; gap: 5px; color: #176a3f; font-size: .78rem; }
.profile-form__footer button { height: 42px; padding-inline: 20px; color: var(--neutral-0); background: #2455db; border-radius: 5px; cursor: pointer; font-weight: 500; }
.security-summary { display: grid; min-height: 0; padding: 18px; grid-template-columns: 38px 1fr; grid-template-rows: auto 1fr; gap: 5px 10px; background: var(--neutral-0); border: 1px solid var(--neutral-300); border-radius: 6px; box-shadow: 0 3px 10px rgb(24 24 27 / 8%); }
.security-summary__icon { display: grid; width: 38px; height: 38px; grid-row: 1 / span 2; place-items: center; color: #2455db; background: #e8edff; border-radius: 50%; }
.security-summary h2 { margin: 0; font-size: 1rem; }
.security-summary p { margin: 1px 0 0; color: var(--neutral-600); font-size: .7rem; }
.security-summary > button { height: 36px; margin-top: 12px; align-self: end; grid-column: 1 / -1; color: #2455db; background: var(--neutral-0); border: 1px solid #b9c6f5; border-radius: 5px; cursor: pointer; font-size: .75rem; font-weight: 500; }
.personal-form { height: 100%; }
.security-summary > button:hover { background: #f2f4ff; }
.security-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 20px; place-items: center; background: rgb(24 24 27 / 56%); backdrop-filter: blur(5px); }
.security-dialog { position: relative; width: min(100%, 480px); padding: 30px; background: var(--neutral-0); border-radius: 8px; box-shadow: 0 26px 70px rgb(24 24 27 / 30%); outline: 0; }
.security-dialog__close { position: absolute; top: 14px; right: 14px; display: grid; width: 36px; height: 36px; place-items: center; color: var(--neutral-600); background: transparent; border-radius: 50%; cursor: pointer; }
.security-dialog__close:hover { background: #f4f5f8; }
.security-dialog__heading { display: flex; padding-right: 34px; align-items: center; gap: 12px; }
.security-dialog__heading > span { display: grid; width: 46px; height: 46px; flex: 0 0 46px; place-items: center; color: #2455db; background: #e8edff; border-radius: 50%; }
.security-dialog__heading h2 { margin: 0; font-size: 1.4rem; letter-spacing: 0; }
.security-dialog__heading p { margin: 2px 0 0; color: var(--neutral-600); font-size: .76rem; }
.security-fields { display: grid; padding-block: 24px 16px; gap: 14px; }
.security-fields label { display: grid; gap: 6px; }
.security-fields label > span { font-size: .78rem; font-weight: 500; }
.security-fields label > div { display: flex; height: 44px; padding-inline: 12px; align-items: center; gap: 9px; color: var(--neutral-600); background: #fafaff; border: 1px solid #cbd0df; border-radius: 5px; }
.security-fields label > div:focus-within { color: #2455db; border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.security-fields label > div.invalid { color: #b93643; border-color: var(--semantic-error); }
.security-fields label > div.invalid:focus-within { box-shadow: 0 0 0 3px rgb(243 130 136 / 16%); }
.security-fields input { width: 100%; min-width: 0; padding: 0; color: #20263a; background: transparent; border: 0; outline: 0; }
.security-fields small { color: var(--neutral-600); font-size: .68rem; }
.security-fields small.security-error { color: #b93643; }
.password-requirements { display: flex; margin: 2px 0 0; padding: 0; flex-wrap: wrap; gap: 6px 12px; list-style: none; }
.password-requirements li { display: inline-flex; align-items: center; gap: 3px; color: #8a8e99; font-size: .66rem; }
.password-requirements li.passed { color: #27885a; }
.password-visibility { display: inline-flex; height: 32px; padding-inline: 7px; align-items: center; gap: 6px; color: #526078; background: transparent; border-radius: 4px; cursor: pointer; font-size: .75rem; }
.password-visibility:hover { color: #2455db; background: #f2f4ff; }
.security-dialog__actions { display: grid; margin-top: 18px; padding-top: 18px; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid var(--neutral-200); }
.security-dialog__actions button { min-height: 43px; color: #33405f; background: var(--neutral-0); border: 1px solid #cbd0df; border-radius: 5px; cursor: pointer; font-size: .76rem; font-weight: 500; }
.security-dialog__actions button.primary { color: var(--neutral-0); background: #2455db; border-color: #2455db; }
.security-dialog__actions button.primary:disabled { color: #8b94a8; background: #e6e8ef; border-color: #e6e8ef; cursor: not-allowed; }
@media (max-width: 720px) { .profile-layout { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .profile-shell { width: min(100% - 32px, 1000px); padding-block: 36px 64px; } .profile-heading h1 { font-size: 1.9rem; } .profile-form { padding: 22px 18px; } .profile-form__grid { grid-template-columns: 1fr; } .profile-form label.full { grid-column: auto; } .security-dialog { padding: 26px 20px 20px; } .security-dialog__actions { grid-template-columns: 1fr; } }
</style>
