<script setup>
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import ConsoleSidebar from './ConsoleSidebar.vue'
import PageTopbar from './PageTopbar.vue'
import UserMenu from './UserMenu.vue'
import { SUPER_ADMIN_ROLE } from '@/features/auth/public.js'

defineProps({
  role: { type: String, default: SUPER_ADMIN_ROLE },
})

const route = useRoute()

// Pages declare their heading through route meta. A page that needs its own
// topbar (breadcrumbs, a search field) sets meta.ownTopbar and renders one.
const pageTitle = computed(() => route.meta.heading ?? '')
const showTopbar = computed(() => !route.meta.ownTopbar)

// Below 1024px the sidebar becomes an overlay drawer that only the topbar
// can open, so the shell owns the trigger and the sidebar reports back
// whether it is currently in drawer mode.
const sidebar = ref(null)
const inDrawerMode = computed(() => sidebar.value?.isDrawer ?? false)

provide('consoleNavigation', {
  isDrawer: inDrawerMode,
  toggle: () => sidebar.value?.toggle(),
})
</script>

<template>
  <div class="console-shell">
    <ConsoleSidebar
      ref="sidebar"
      :role="role"
    />

    <div class="console-content">
      <PageTopbar v-if="showTopbar" :title="pageTitle">
        <template #actions>
          <UserMenu />
        </template>
      </PageTopbar>

      <RouterView />
    </div>
  </div>
</template>
