<script setup>
import AppBrand from './AppBrand.vue'
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <AppBrand />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  z-index: 10;
  display: flex;
  min-height: 68px;
  align-items: center;
  background: rgb(255 255 255 / 94%);
  border-bottom: 1px solid var(--color-border);
}

.app-header__inner {
  width: 100%;
  padding-inline: 26px;
}

@media (max-width: 520px) {
  .app-header {
    min-height: 58px;
  }

  .app-header__inner {
    padding-inline: 16px;
  }
}

</style>
