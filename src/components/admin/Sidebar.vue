<script setup>
import { useRoute } from 'vue-router'
import Icon from '@/components/super_admin/Icon.vue'

const route = useRoute()

const items = [
  { label: 'Dashboard', icon: 'globe', to: '/admin/dashboard' },
  { label: 'All Events', icon: 'calendar', to: '/admin/all-events' },
]

function isActive(to) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside class="sa-sidebar">
    <div class="sa-brand">
      <span class="sa-brand-mark"><Icon name="layers" :size="16" /></span>
      <span class="sa-brand-name">Eventsss</span>
    </div>

    <div class="sa-menu-label">Menu</div>

    <nav class="sa-nav">
      <RouterLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="sa-nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <Icon :name="item.icon" :size="17" />
        <span>{{ item.label }}</span>
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
}

.sa-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
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

.sa-nav-item.active :deep(svg) {
  color: var(--sa-primary-text);
}
</style>
