<script setup>
import { onMounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppToast from '@/shared/ui/AppToast.vue'
import { useAuth } from '@/features/auth/public.js'
import { useToast } from '@/shared/composables/useToast.js'

const { toast, dismissToast } = useToast()
const route = useRoute()
const router = useRouter()
const { initializeAuth, sessionExpired } = useAuth()

watch(sessionExpired, (expired) => {
  if (!expired || !route.meta.requiresAuth) return
  router.replace({
    path: '/login',
    query: { redirect: route.fullPath, reason: 'session-expired' },
  })
})

onMounted(() => {
  initializeAuth().catch(() => {
    // Public pages must remain usable while the API is unavailable. Protected
    // routes await the same single initialization request in the route guard.
  })
})
</script>

<template>
  <RouterView />
  <Transition name="toast">
    <AppToast v-if="toast" :title="toast.title" :message="toast.message" :variant="toast.variant" @close="dismissToast" />
  </Transition>
</template>

<style>
.toast-enter-active, .toast-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
@media (prefers-reduced-motion: reduce) { .toast-enter-active, .toast-leave-active { transition: none; } }
</style>
