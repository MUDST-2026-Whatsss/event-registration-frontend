<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <header class="sa-topbar">
    <span class="sa-topbar-title">{{ title }}</span>
    <div class="sa-topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.sa-topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
