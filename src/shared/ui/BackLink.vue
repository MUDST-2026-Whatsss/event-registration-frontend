<script setup>
import { ArrowLeft } from '@lucide/vue'

defineProps({
  to: { type: [String, Object], required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <RouterLink :to="to" :aria-label="label" class="back-link">
    <ArrowLeft :size="17" aria-hidden="true" />
    <span>Back</span>
  </RouterLink>
</template>

<style scoped>
.back-link { display: inline-flex; min-height: 42px; padding: 9px 13px; align-items: center; gap: 8px; flex-shrink: 0; color: #33405c; background: #fff; border: 1px solid #dce1eb; border-radius: 8px; font-size: .8125rem; font-weight: 500; line-height: 1.4; text-decoration: none; transition: background 160ms ease, border-color 160ms ease, color 160ms ease; }
.back-link:hover { color: #174bd1; background: #f0f4ff; border-color: #bacaf5; }
.back-link:focus-visible { outline: 3px solid #8faaf4; outline-offset: 3px; }
.back-link svg { flex-shrink: 0; }
</style>
