<script setup>
import Icon from './Icon.vue'

defineProps({
  name: { type: String, default: 'Sarah Jenkins' },
  role: { type: String, default: 'Event Director' },
  avatar: { type: String, default: 'https://i.pravatar.cc/72?img=47' },
})
</script>

<template>
  <button type="button" class="sa-user-menu">
    <img :src="avatar" :alt="name" class="sa-avatar" />
    <span class="sa-user-info">
      <span class="sa-user-name">{{ name }}</span>
      <span class="sa-user-role">{{ role }}</span>
    </span>
    <Icon name="chevron-down" :size="15" />
  </button>
</template>

<style scoped>
.sa-user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--sa-text-muted);
  font-family: inherit;
}

.sa-user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.sa-user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--sa-text);
}

.sa-user-role {
  font-size: 11.5px;
  color: var(--sa-text-secondary);
}
</style>
