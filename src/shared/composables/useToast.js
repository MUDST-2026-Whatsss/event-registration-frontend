import { readonly, ref } from 'vue'

// Cross-feature notification state for the single application shell.
const toast = ref(null)
let dismissTimer

export function useToast() {
  function dismissToast() {
    window.clearTimeout(dismissTimer)
    toast.value = null
  }

  function showToast({ title, message = '', variant = 'info', duration = 4000 }) {
    window.clearTimeout(dismissTimer)
    toast.value = { title, message, variant }

    if (duration > 0) {
      dismissTimer = window.setTimeout(dismissToast, duration)
    }
  }

  return {
    toast: readonly(toast),
    showToast,
    dismissToast,
  }
}
