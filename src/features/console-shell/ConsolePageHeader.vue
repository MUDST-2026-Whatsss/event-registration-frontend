<script setup>
import { inject } from 'vue'
import Icon from './ConsoleIcon.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})

const navigation = inject('consoleNavigation', null)
</script>

<template>
  <header class="console-page-header">
    <div class="console-page-header__lead">
      <button
        v-if="navigation?.isDrawer.value"
        type="button"
        class="console-page-header__menu"
        aria-label="Open navigation"
        @click="navigation.toggle"
      >
        <Icon name="menu" :size="19" />
      </button>

      <div>
        <p v-if="eyebrow" class="console-page-header__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="description" class="console-page-header__description">{{ description }}</p>
      </div>
    </div>

    <div class="console-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.console-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.console-page-header__lead { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.console-page-header__eyebrow {
  margin: 0 0 5px;
  color: var(--console-primary);
  font-size: var(--console-fs-xs);
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.console-page-header h1 {
  margin: 0;
  color: var(--console-text);
  font-size: clamp(1.55rem, 2vw, 2rem);
  line-height: 1.15;
}
.console-page-header__description {
  margin: 7px 0 0;
  color: var(--console-text-secondary);
  font-size: var(--console-fs-base);
}
.console-page-header__actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.console-page-header__menu {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  color: var(--console-text-secondary);
  background: #fff;
  border: 1px solid var(--console-border);
  border-radius: 10px;
  cursor: pointer;
}
@media (max-width: 680px) {
  .console-page-header { align-items: stretch; flex-direction: column; }
  .console-page-header__actions, .console-page-header__actions :deep(.console-btn) { width: 100%; }
  .console-page-header__actions :deep(.console-btn) { justify-content: center; }
}
</style>
