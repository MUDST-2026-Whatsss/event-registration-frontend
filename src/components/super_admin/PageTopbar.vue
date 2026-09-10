<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <header class="sa-topbar">
    <div class="sa-topbar-lead">
      <slot name="lead">
        <span class="sa-topbar-title">{{ title }}</span>
      </slot>
    </div>

    <div class="sa-topbar-mid">
      <slot name="search" />
    </div>

    <div class="sa-topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.sa-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
}

.sa-topbar-lead {
  flex-shrink: 0;
  min-width: 0;
}

.sa-topbar-mid {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 24px;
}

.sa-topbar-mid:empty {
  padding: 0;
}

.sa-topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
</style>
