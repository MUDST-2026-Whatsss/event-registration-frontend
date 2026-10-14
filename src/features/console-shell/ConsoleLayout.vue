<script setup>
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import ConsoleSidebar from './ConsoleSidebar.vue'
import Icon from './ConsoleIcon.vue'
import { SUPER_ADMIN_ROLE } from '@/features/auth/public.js'

defineProps({
  role: { type: String, default: SUPER_ADMIN_ROLE },
})

const route = useRoute()

// Below 1024px the sidebar becomes an overlay drawer. Pages built with
// ConsolePageHeader own their menu trigger; older pages receive a compact
// floating trigger without bringing back the duplicated desktop topbar.
const sidebar = ref(null)
const inDrawerMode = computed(() => sidebar.value?.isDrawer ?? false)
const showStandaloneMenu = computed(() => inDrawerMode.value && !route.meta.ownTopbar)

provide('consoleNavigation', {
  isDrawer: inDrawerMode,
  toggle: () => sidebar.value?.toggle(),
})
</script>

<template>
  <div class="console-shell">
    <ConsoleSidebar
      ref="sidebar"
      :role="role"
    />

    <div class="console-content">
      <button
        v-if="showStandaloneMenu"
        type="button"
        class="console-shell-menu"
        aria-label="Open navigation"
        @click="sidebar?.toggle()"
      >
        <Icon name="menu" :size="19" />
      </button>

      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.console-shell-menu {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 40;
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--console-primary);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 8px 22px rgba(32, 27, 112, 0.24);
  cursor: pointer;
}
</style>
