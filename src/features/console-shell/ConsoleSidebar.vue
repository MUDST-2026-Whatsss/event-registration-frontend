<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from './ConsoleIcon.vue'
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from '@/features/auth/public.js'

const props = defineProps({
  role: { type: String, default: SUPER_ADMIN_ROLE },
})

const route = useRoute()

const menusByRole = {
  [ADMIN_ROLE]: [
    { label: 'Dashboard', icon: 'globe', to: '/admin/dashboard' },
    { label: 'All Events', icon: 'calendar', to: '/admin/all-events' },
  ],
  [SUPER_ADMIN_ROLE]: [
    { label: 'Dashboard', icon: 'globe', to: '/super-admin/dashboard' },
    { label: 'All Events', icon: 'calendar', to: '/super-admin/all-events' },
    { label: 'Change Requests', icon: 'repeat', to: '/super-admin/change-requests' },
    { label: 'Event Approvals', icon: 'shield', to: '/super-admin/event-approvals' },
    { label: 'User Management', icon: 'user-check', to: '/super-admin/user-management' },
    { label: 'Role Management', icon: 'briefcase', to: '/super-admin/role-management' },
    { label: 'Audit Logs', icon: 'history', to: '/super-admin/audit-logs' },
  ],
}

const items = computed(() => menusByRole[props.role] ?? menusByRole[SUPER_ADMIN_ROLE])

// Keyed by role so the admin and super-admin consoles remember their own choice.
const storageKey = computed(() => `eventsss_${props.role}_sidebar_collapsed`)

const collapsed = ref(false)

/* Below this width the sidebar stops being a column and becomes an
   off-canvas drawer: the layout has no room to reserve for it. */
const DRAWER_QUERY = '(max-width: 1024px)'

const isDrawer = ref(false)
const drawerOpen = ref(false)

let mql = null

function applyDrawerState(matches) {
  isDrawer.value = matches
  // Leaving drawer mode must not strand an open overlay on the desktop layout.
  if (!matches) drawerOpen.value = false
}

onMounted(() => {
  const stored = window.localStorage.getItem(storageKey.value)
  collapsed.value = stored === 'true'

  mql = window.matchMedia(DRAWER_QUERY)
  applyDrawerState(mql.matches)
  // The stored preference is a desktop choice; it must never decide how much
  // of a phone screen the sidebar eats, so drawer mode ignores it entirely.
  mql.addEventListener('change', handleDrawerChange)
})

onUnmounted(() => {
  mql?.removeEventListener('change', handleDrawerChange)
})

function handleDrawerChange(event) {
  applyDrawerState(event.matches)
}

// A drawer that survives navigation would cover the page the user just opened.
watch(
  () => route.path,
  () => {
    drawerOpen.value = false
  },
)

function toggle() {
  if (isDrawer.value) {
    drawerOpen.value = !drawerOpen.value
    return
  }

  collapsed.value = !collapsed.value
  window.localStorage.setItem(storageKey.value, String(collapsed.value))
}

function closeDrawer() {
  drawerOpen.value = false
}

// In drawer mode the panel always shows its full labels — the rail only
// makes sense when the sidebar is a permanent column.
const showLabels = computed(() => isDrawer.value || !collapsed.value)

defineExpose({ toggle, closeDrawer, isDrawer, drawerOpen })

function isActive(to) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div
    v-if="isDrawer && drawerOpen"
    class="console-sidebar-backdrop"
    @click="closeDrawer"
  />

  <aside
    class="console-sidebar"
    :class="{
      collapsed: collapsed && !isDrawer,
      'is-drawer': isDrawer,
      'is-open': drawerOpen,
    }"
  >
    <div class="console-brand">
      <span class="console-brand-mark"><Icon name="layers" :size="16" /></span>
      <span v-if="showLabels" class="console-brand-name">Eventsss</span>
      <button
        type="button"
        class="console-collapse"
        :aria-label="
          isDrawer
            ? 'Close menu'
            : collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
        "
        :title="
          isDrawer
            ? 'Close menu'
            : collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
        "
        @click="toggle"
      >
        <Icon
          :name="isDrawer ? 'x' : collapsed ? 'chevron-right' : 'chevron-left'"
          :size="16"
        />
      </button>
    </div>

    <div v-if="showLabels" class="console-menu-label">Menu</div>

    <nav class="console-nav">
      <RouterLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="console-nav-item"
        :class="{ active: isActive(item.to) }"
        :title="showLabels ? undefined : item.label"
      >
        <Icon :name="item.icon" :size="17" />
        <span v-if="showLabels">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.console-sidebar {
  width: 232px;
  flex-shrink: 0;
  background: var(--console-sidebar-bg);
  border-right: 1px solid var(--console-border);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  transition: width 0.18s ease;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
}

.console-sidebar.collapsed {
  width: 72px;
  padding: 20px 12px;
}

.console-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
}

.console-sidebar.collapsed .console-brand {
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 18px;
}

.console-brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--console-primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.console-brand-name {
  font-size: var(--console-fs-lg);
  font-weight: 700;
  color: var(--console-text);
}

.console-collapse {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--console-radius-sm);
  border: 1px solid var(--console-border);
  background: #fff;
  color: var(--console-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.console-collapse:hover {
  background: var(--console-gray-bg);
  color: var(--console-text);
}

.console-sidebar.collapsed .console-collapse {
  margin-left: 0;
}

.console-menu-label {
  font-size: var(--console-fs-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--console-text-muted);
  padding: 4px 10px 10px;
}

.console-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.console-nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: var(--console-radius-sm);
  color: var(--console-text-secondary);
  text-decoration: none;
  font-size: var(--console-fs-base);
  font-weight: 500;
  border-left: 3px solid transparent;
  margin-left: -3px;
}

.console-sidebar.collapsed .console-nav-item {
  justify-content: center;
  gap: 0;
  padding: 10px 0;
  margin-left: 0;
  border-left: none;
}

.console-nav-item:hover {
  background: var(--console-gray-bg);
  color: var(--console-text);
}

.console-nav-item.active {
  background: var(--console-primary-soft);
  color: var(--console-primary-text);
  font-weight: 700;
  border-left-color: var(--console-primary);
}

.console-sidebar.collapsed .console-nav-item.active {
  border-left-color: transparent;
}

.console-nav-item.active :deep(svg) {
  color: var(--console-primary-text);
}

/* =========================================================
   Drawer mode (<= 1024px)
   The shell is a flex row, so a sidebar in normal flow always
   reserves its width. Below the breakpoint there is no room
   to spare, so it leaves the flow entirely and slides over
   the content instead.
========================================================= */

.console-sidebar.is-drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  width: 264px;
  max-width: 82vw;
  transform: translateX(-100%);
  transition: transform 0.22s ease;
  box-shadow: 0 20px 50px rgb(16 24 40 / 18%);
}

.console-sidebar.is-drawer.is-open {
  transform: none;
}

.console-sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgb(16 18 24 / 45%);
}

@media (prefers-reduced-motion: reduce) {
  .console-sidebar,
  .console-sidebar.is-drawer {
    transition: none;
  }
}
</style>
