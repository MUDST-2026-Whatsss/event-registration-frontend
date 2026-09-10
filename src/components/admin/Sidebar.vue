<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/super_admin/Icon.vue'

const route = useRoute()

const items = [
  { label: 'Dashboard', icon: 'globe', to: '/admin/dashboard' },
  { label: 'All Events', icon: 'calendar', to: '/admin/all-events' },
]

const STORAGE_KEY = 'eventsss_admin_sidebar_collapsed'

// Persisted to localStorage so the choice carries across the admin pages.
const collapsed = ref(false)

onMounted(() => {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === null) {
    collapsed.value = window.innerWidth < 1024
  } else {
    collapsed.value = stored === 'true'
  }
})

function toggle() {
  collapsed.value = !collapsed.value
  window.localStorage.setItem(STORAGE_KEY, String(collapsed.value))
}

function isActive(to) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside class="sa-sidebar" :class="{ collapsed }">
    <div class="sa-brand">
      <span class="sa-brand-mark"><Icon name="layers" :size="16" /></span>
      <span v-if="!collapsed" class="sa-brand-name">Eventsss</span>
      <button
        type="button"
        class="sa-collapse"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggle"
      >
        <Icon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="16" />
      </button>
    </div>

    <div v-if="!collapsed" class="sa-menu-label">Menu</div>

    <nav class="sa-nav">
      <RouterLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="sa-nav-item"
        :class="{ active: isActive(item.to) }"
        :title="collapsed ? item.label : undefined"
      >
        <Icon :name="item.icon" :size="17" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sa-sidebar {
  width: 232px;
  flex-shrink: 0;
  background: var(--sa-sidebar-bg);
  border-right: 1px solid var(--sa-border);
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

.sa-sidebar.collapsed {
  width: 72px;
  padding: 20px 12px;
}

.sa-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
}

.sa-sidebar.collapsed .sa-brand {
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 18px;
}

.sa-brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--sa-primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sa-brand-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--sa-text);
}

.sa-collapse {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--sa-radius-sm);
  border: 1px solid var(--sa-border);
  background: #fff;
  color: var(--sa-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.sa-collapse:hover {
  background: var(--sa-gray-bg);
  color: var(--sa-text);
}

.sa-sidebar.collapsed .sa-collapse {
  margin-left: 0;
}

.sa-menu-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sa-text-muted);
  padding: 4px 10px 10px;
}

.sa-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sa-nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: var(--sa-radius-sm);
  color: var(--sa-text-secondary);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  border-left: 3px solid transparent;
  margin-left: -3px;
}

.sa-sidebar.collapsed .sa-nav-item {
  justify-content: center;
  gap: 0;
  padding: 10px 0;
  margin-left: 0;
  border-left: none;
}

.sa-nav-item:hover {
  background: var(--sa-gray-bg);
  color: var(--sa-text);
}

.sa-nav-item.active {
  background: var(--sa-primary-soft);
  color: var(--sa-primary-text);
  font-weight: 700;
  border-left-color: var(--sa-primary);
}

.sa-sidebar.collapsed .sa-nav-item.active {
  border-left-color: transparent;
}

.sa-nav-item.active :deep(svg) {
  color: var(--sa-primary-text);
}
</style>
