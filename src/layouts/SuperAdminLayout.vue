<script setup>
import Sidebar from '../components/super_admin/Sidebar.vue'
</script>

<template>
  <div class="sa-shell">
    <Sidebar />
    <div class="sa-content">
      <RouterView />
    </div>
  </div>
</template>
