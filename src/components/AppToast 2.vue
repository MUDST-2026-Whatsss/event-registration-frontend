<script setup>
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from '@lucide/vue'
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'danger', 'warning', 'info'].includes(value),
  },
})

defineEmits(['close'])

const icon = computed(() => ({
  success: CircleCheck,
  danger: CircleAlert,
  warning: TriangleAlert,
  info: Info,
})[props.variant])
</script>

<template>
  <aside class="app-toast" :class="`app-toast--${variant}`" role="status" aria-live="polite">
    <span class="app-toast__accent" aria-hidden="true"></span>
    <span class="app-toast__icon" aria-hidden="true"><component :is="icon" :size="20" /></span>
    <span class="app-toast__content"><strong>{{ title }}</strong><small v-if="message">{{ message }}</small></span>
    <span class="app-toast__action"><slot name="action"></slot></span>
    <button class="app-toast__close" type="button" aria-label="Dismiss notification" title="Dismiss" @click="$emit('close')"><X :size="18" /></button>
  </aside>
</template>

<style scoped>
.app-toast { position: fixed; z-index: 110; right: 24px; bottom: 24px; display: grid; width: min(calc(100% - 32px), 430px); min-height: 78px; overflow: hidden; padding: 14px 12px 14px 18px; align-items: center; grid-template-columns: 34px minmax(0, 1fr) auto 34px; gap: 10px; color: #20263a; background: var(--neutral-0); border: 1px solid #dedfe5; border-radius: 7px; box-shadow: 0 18px 44px rgb(24 24 27 / 20%); }
.app-toast__accent { position: absolute; inset: 0 auto 0 0; width: 5px; background: var(--toast-color); }
.app-toast__icon { display: grid; width: 34px; height: 34px; place-items: center; color: var(--toast-color); background: var(--toast-soft); border-radius: 50%; }
.app-toast__content { display: flex; min-width: 0; flex-direction: column; }
.app-toast__content strong { font-size: .82rem; }
.app-toast__content small { overflow: hidden; color: var(--neutral-600); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }
.app-toast__action { display: flex; align-items: center; }
.app-toast__close { display: grid; width: 34px; height: 34px; place-items: center; color: var(--neutral-600); background: transparent; border-radius: 50%; cursor: pointer; }
.app-toast__close:hover { background: #f3f4f7; }
.app-toast--success { --toast-color: #27885a; --toast-soft: #e3f6ec; }
.app-toast--danger { --toast-color: #c84250; --toast-soft: #fde7e9; }
.app-toast--warning { --toast-color: #b67512; --toast-soft: #fff2d8; }
.app-toast--info { --toast-color: #315bd5; --toast-soft: #e8edff; }
@media (max-width: 520px) { .app-toast { right: 16px; bottom: 16px; grid-template-columns: 34px minmax(0, 1fr) auto 30px; } }
</style>
