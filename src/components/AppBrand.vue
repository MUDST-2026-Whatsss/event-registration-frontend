<script setup>
import { Layers3 } from '@lucide/vue'
</script>

<template>
  <RouterLink class="brand" to="/" aria-label="Eventsss home">
    <span class="brand__mark" aria-hidden="true">
      <Layers3 :size="18" :stroke-width="2.25" />
    </span>
    <span class="brand__name">Eventsss</span>
  </RouterLink>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--neutral-950);
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  color: var(--neutral-0);
  background: var(--brand-blue-strong);
  border-radius: 8px;
}

.brand__name {
  font-size: 1.0625rem;
  font-weight: 600;
}

</style>
