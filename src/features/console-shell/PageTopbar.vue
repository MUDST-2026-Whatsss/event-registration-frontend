<script setup>
import { inject } from 'vue'
import Icon from './ConsoleIcon.vue'


defineProps({
  title: { type: String, default: '' },
})

const navigation = inject('consoleNavigation', null)
</script>

<template>
  <header class="console-topbar">
    <div class="console-topbar-lead">
      <button
        v-if="navigation?.isDrawer.value"
        type="button"
        class="console-menu-btn"
        aria-label="Open navigation"
        @click="navigation.toggle"
      >
        <Icon name="menu" :size="19" />
      </button>
      <slot name="lead">
        <span class="console-topbar-title">{{ title }}</span>
      </slot>
    </div>

    <div class="console-topbar-mid">
      <slot name="search" />
    </div>

    <div class="console-topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.console-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
}

.console-topbar-lead {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 0;
}

.console-menu-btn {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  color: var(--console-text-secondary);
  background: #fff;
  border: 1px solid var(--console-border);
  border-radius: var(--console-radius-sm);
  cursor: pointer;
}

.console-menu-btn:hover {
  color: var(--console-text);
  background: var(--console-gray-bg);
}

.console-topbar-mid {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 24px;
}

.console-topbar-mid:empty {
  padding: 0;
}

.console-topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .console-topbar-lead {
    max-width: 46vw;
  }

  .console-topbar-title,
  .console-topbar-lead :deep(.crumb-current) {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
