<script setup>
import { RouterView } from 'vue-router'
import AppToast from './components/AppToast.vue'
import { useToast } from './composables/useToast.js'

const { toast, dismissToast } = useToast()
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
