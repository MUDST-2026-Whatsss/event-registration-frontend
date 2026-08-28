<script setup>
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'

defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <PageTopbar :title="title">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <div class="sa-body">
    <div class="sa-card sa-coming-soon">
      <span class="sa-coming-soon-icon"><Icon name="layers" :size="22" /></span>
      <h1>{{ title }}</h1>
      <p>This section is being built by another part of the team. Check back soon.</p>
    </div>
  </div>
</template>

<style scoped>
.sa-coming-soon {
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.sa-coming-soon-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--sa-primary-soft);
  color: var(--sa-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.sa-coming-soon h1 {
  font-size: 17px;
  margin: 0;
}

.sa-coming-soon p {
  font-size: 13.5px;
  color: var(--sa-text-secondary);
  margin: 0;
  max-width: 360px;
}
</style>
