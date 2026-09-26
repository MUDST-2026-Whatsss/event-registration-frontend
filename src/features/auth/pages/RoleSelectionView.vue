<script setup>
import { computed, ref } from 'vue'
import { CalendarCog, ShieldCheck, UserRound } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import {
  ADMIN_ROLE,
  SUPER_ADMIN_ROLE,
  USER_ROLE,
  useAuth,
} from '../composables/useAuth.js'
import { ApiError } from '@/shared/lib/apiClient.js'
import { useToast } from '@/shared/composables/useToast.js'

const router = useRouter()
const route = useRoute()
const { availableRoles, currentRole, logout, selectRole } = useAuth()
const { showToast } = useToast()
const selecting = ref('')
const errorMessage = ref('')

const ROLE_DETAILS = Object.freeze({
  [USER_ROLE]: {
    title: 'Participant',
    description: 'Browse events and manage your own registrations.',
    icon: UserRound,
    home: '/',
  },
  [ADMIN_ROLE]: {
    title: 'Event Admin',
    description: 'Create events and manage the events assigned to you.',
    icon: CalendarCog,
    home: '/admin/dashboard',
  },
  [SUPER_ADMIN_ROLE]: {
    title: 'Super Admin',
    description: 'Review events and manage platform access and governance.',
    icon: ShieldCheck,
    home: '/super-admin/dashboard',
  },
})

const options = computed(() => availableRoles.value.map((role) => ({
  role,
  ...(ROLE_DETAILS[role] ?? {
    title: role.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description: 'Continue with the permissions assigned to this role.',
    icon: ShieldCheck,
    home: '/',
  }),
})))

function safeDestination(role) {
  const requested = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  const allowed = role === SUPER_ADMIN_ROLE
    ? requested.startsWith('/super-admin')
    : role === ADMIN_ROLE
      ? requested.startsWith('/admin')
      : requested !== '' && !requested.startsWith('/admin') && !requested.startsWith('/super-admin')
  return allowed ? requested : (ROLE_DETAILS[role]?.home ?? '/')
}

async function choose(role) {
  errorMessage.value = ''
  selecting.value = role
  try {
    const activeRole = await selectRole(role)
    showToast({
      variant: 'success',
      title: `${options.value.find((option) => option.role === activeRole)?.title ?? 'Role'} mode selected`,
      message: 'Your permissions now match the selected role.',
    })
    await router.replace(safeDestination(activeRole))
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'Unable to switch role. Please try again.'
  } finally {
    selecting.value = ''
  }
}

async function signOut() {
  await logout()
  await router.replace('/login')
}
</script>

<template>
  <AuthLayout
    title="Choose how to continue"
    subtitle="Only the permissions for the selected role will be active."
    variant="role-selection"
  >
    <div class="role-options">
      <button
        v-for="option in options"
        :key="option.role"
        type="button"
        class="role-option"
        :class="{ 'role-option--active': currentRole === option.role }"
        :disabled="Boolean(selecting)"
        @click="choose(option.role)"
      >
        <span class="role-option__icon"><component :is="option.icon" :size="24" /></span>
        <span class="role-option__copy">
          <strong>{{ option.title }}</strong>
          <small>{{ option.description }}</small>
        </span>
        <span class="role-option__action">
          {{ selecting === option.role ? 'Opening…' : currentRole === option.role ? 'Current' : 'Continue' }}
        </span>
      </button>
    </div>

    <p v-if="errorMessage" class="role-error" role="alert">{{ errorMessage }}</p>
    <button type="button" class="sign-out-link" @click="signOut">Sign in with another account</button>
  </AuthLayout>
</template>

<style scoped>
.role-options { display: grid; gap: 12px; }
.role-option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  width: 100%;
  padding: 17px;
  align-items: center;
  text-align: left;
  color: #414351;
  background: #fff;
  border: 1px solid #dfe4ef;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}
.role-option:hover:not(:disabled), .role-option--active {
  border-color: #7668f5;
  box-shadow: 0 8px 20px rgb(91 78 235 / 12%);
  transform: translateY(-1px);
}
.role-option:disabled { cursor: wait; opacity: .7; }
.role-option__icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  color: #5b4eeb;
  background: #f0efff;
  border-radius: 10px;
}
.role-option__copy { display: grid; gap: 4px; }
.role-option__copy strong { font-size: .98rem; }
.role-option__copy small { color: #8993aa; line-height: 1.45; }
.role-option__action { color: #5b4eeb; font-size: .78rem; font-weight: 700; }
.role-error { margin: 14px 0 0; color: #c62828; font-size: .82rem; text-align: center; }
.sign-out-link {
  margin: 20px auto 0;
  color: #6f7890;
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-size: .8rem;
  text-decoration: underline;
}
@media (max-width: 560px) {
  .role-option { grid-template-columns: auto minmax(0, 1fr); }
  .role-option__action { grid-column: 2; }
}
</style>
