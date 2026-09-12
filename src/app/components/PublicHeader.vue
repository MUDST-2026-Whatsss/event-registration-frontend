<script setup>
import { Menu, UserRound, X } from '@lucide/vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBrand from '@/shared/ui/AppBrand.vue'
import { useAuth, useProfile } from '@/features/auth/public.js'
import { useToast } from '@/shared/composables/useToast.js'

const menuOpen = ref(false)
const route = useRoute()
const router = useRouter()
const { isAuthenticated, logout } = useAuth()
const { profile } = useProfile()
const { showToast } = useToast()
async function handleLogout() {
  let signedOutOnServer = true
  try {
    await logout()
  } catch {
    signedOutOnServer = false
  }
  menuOpen.value = false
  await router.push('/')
  showToast({
    variant: signedOutOnServer ? 'info' : 'warning',
    title: signedOutOnServer ? 'Signed out' : 'Connection interrupted',
    message: signedOutOnServer
      ? 'See you again at Eventsss.'
      : 'This browser was cleared, but the server could not be reached.',
  })
}
</script>

<template>
  <header class="public-header">
    <div class="public-header__inner">
      <AppBrand />
      <button class="public-header__menu-button" type="button" :aria-expanded="menuOpen" aria-controls="public-navigation" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
        <X v-if="menuOpen" :size="22" /><Menu v-else :size="22" />
      </button>
      <div id="public-navigation" class="public-header__navigation" :class="{ 'is-open': menuOpen }">
        <nav aria-label="Main navigation">
          <RouterLink to="/" @click="menuOpen = false">Home</RouterLink>
          <RouterLink to="/events" :class="{ active: route.path.startsWith('/events') }" @click="menuOpen = false">Events</RouterLink>
          <RouterLink v-if="isAuthenticated" to="/my-registrations" @click="menuOpen = false">My Registrations</RouterLink>
        </nav>
        <div class="public-header__actions">
          <template v-if="!isAuthenticated">
            <RouterLink class="public-header__login" to="/login">Login</RouterLink>
            <RouterLink class="public-header__register" to="/register">Register</RouterLink>
          </template>
          <template v-else>
            <RouterLink class="public-header__profile" to="/profile" aria-label="Profile" title="Profile" @click="menuOpen = false"><img v-if="profile.avatar" :src="profile.avatar" alt="" /><UserRound v-else :size="18" /><span>{{ profile.firstName }}</span></RouterLink>
            <button class="public-header__account" type="button" @click="handleLogout">Logout</button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.public-header { position: relative; z-index: 20; height: 64px; background: var(--neutral-0); border-bottom: 1px solid var(--color-border); }
.public-header__inner { display: flex; width: min(100% - 48px, 1180px); height: 100%; margin-inline: auto; align-items: center; }
.public-header__navigation { display: flex; min-width: 0; flex: 1; align-items: center; justify-content: flex-end; gap: clamp(24px, 4vw, 56px); }
.public-header nav, .public-header__actions { display: flex; align-items: center; }
.public-header nav { gap: 30px; }
.public-header nav a, .public-header__login { padding-block: 21px 18px; color: #4d5263; border-bottom: 3px solid transparent; font-size: .875rem; text-decoration: none; }
.public-header nav a:hover, .public-header nav a.router-link-exact-active, .public-header nav a.active, .public-header__login:hover { color: #2455db; border-bottom-color: var(--brand-blue); }
.public-header__actions { gap: 12px; }
.public-header__register, .public-header__account { display: inline-flex; height: 38px; padding-inline: 17px; align-items: center; justify-content: center; color: var(--neutral-0); background: #2455db; border-radius: 6px; font-size: .8125rem; font-weight: 500; text-decoration: none; }
.public-header__profile { display: inline-flex; max-width: 130px; height: 38px; padding-inline: 9px; align-items: center; gap: 7px; color: #33405f; background: #f4f5fc; border: 1px solid var(--color-border); border-radius: 6px; text-decoration: none; }
.public-header__profile img { width: 24px; height: 24px; flex: 0 0 24px; object-fit: cover; border-radius: 50%; }
.public-header__profile span { overflow: hidden; font-size: .78rem; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.public-header__profile:hover, .public-header__profile.router-link-active { color: #2455db; border-color: var(--brand-blue); }
.public-header__register:hover, .public-header__account:hover { background: #183fae; }
.public-header__menu-button { display: none; width: 40px; height: 40px; margin-left: auto; align-items: center; justify-content: center; color: var(--neutral-950); background: transparent; cursor: pointer; }
@media (max-width: 900px) {
  .public-header__inner { width: min(100% - 32px, 1180px); }
  .public-header__menu-button { display: inline-flex; }
  .public-header__navigation { position: absolute; top: 64px; left: 0; display: none; width: 100%; padding: 18px 24px 24px; align-items: stretch; background: var(--neutral-0); border-bottom: 1px solid var(--color-border); box-shadow: 0 12px 28px rgb(24 24 27 / 10%); }
  .public-header__navigation.is-open { display: block; }
  .public-header nav, .public-header__actions { flex-direction: column; align-items: stretch; gap: 8px; }
  .public-header nav a, .public-header__login { padding: 10px 4px; border: 0; }
  .public-header__register, .public-header__account, .public-header__profile { width: 100%; max-width: none; justify-content: center; }
}
</style>
