<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import { listAuditLogs } from './auditApi.js'

const search = ref('')
const targetType = ref('')
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const logs = ref([])
const loading = ref(false)
const errorMessage = ref('')
let searchTimer

function initials(value) {
  return (value || 'System').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function actionLabel(action) {
  return action.toLowerCase().replaceAll('_', ' ')
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listAuditLogs({ query: search.value.trim(), targetType: targetType.value, page: page.value, size: 20 })
    logs.value = result.content
    totalPages.value = result.totalPages
    totalElements.value = result.totalElements
  } catch (error) {
    errorMessage.value = error.message
  } finally { loading.value = false }
}

watch(search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => { page.value = 0; load() }, 300)
})
watch(targetType, () => { page.value = 0; load() })
watch(page, load)
onBeforeUnmount(() => window.clearTimeout(searchTimer))
onMounted(load)
</script>

<template>
  <div class="console-body">
    <div v-if="errorMessage" class="page-alert">{{ errorMessage }}</div>
    <div class="console-page-heading heading"><h1>Audit Logs</h1><p>{{ totalElements.toLocaleString() }} immutable administrative records from the database.</p></div>

    <div class="console-card">
      <div class="console-card-header audit-header">
        <div><h2>Activity History</h2><p>Newest actions appear first.</p></div>
        <div class="filters">
          <div class="console-search"><Icon name="search" :size="15" /><input v-model="search" class="console-input" placeholder="Search action, actor or target" /></div>
          <select v-model="targetType" class="console-select type-filter">
            <option value="">All targets</option><option value="EVENT">Events</option><option value="USER">Users</option><option value="ROLE">Roles</option>
          </select>
        </div>
      </div>

      <ul class="audit-list">
        <li v-for="log in logs" :key="log.auditLogId" class="audit-item">
          <span class="actor-initials">{{ initials(log.actor?.displayName) }}</span>
          <div class="audit-text">
            <p><strong>{{ log.actor?.displayName || 'System' }}</strong> {{ actionLabel(log.action) }}<strong v-if="log.targetLabel"> {{ log.targetLabel }}</strong></p>
            <span>{{ log.actor?.email || 'System process' }} · {{ formatDate(log.createdAt) }}</span>
          </div>
          <div class="audit-tags">
            <span class="console-pill console-pill-blue">{{ log.targetType }}</span>
            <span class="console-pill" :class="log.outcome === 'SUCCESS' ? 'console-pill-green' : 'console-pill-red'">{{ log.outcome }}</span>
          </div>
        </li>
        <li v-if="loading" class="empty">Loading audit logs...</li>
        <li v-else-if="!logs.length" class="empty">No audit records match the current filters.</li>
      </ul>
    </div>

    <div class="console-pagination">
      <span>Page {{ totalPages ? page + 1 : 0 }} of {{ totalPages }} · {{ totalElements.toLocaleString() }} records</span>
      <div class="console-pagination-controls">
        <button class="console-page-num" :disabled="page === 0 || loading" @click="page--"><Icon name="chevron-left" :size="15" /></button>
        <button class="console-page-num active">{{ totalPages ? page + 1 : 0 }}</button>
        <button class="console-page-num" :disabled="page + 1 >= totalPages || loading" @click="page++"><Icon name="chevron-right" :size="15" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading { margin-bottom: 20px; }
.audit-header { gap: 14px; flex-wrap: wrap; }
.audit-header h2 { margin-bottom: 2px; }
.audit-header p { margin: 0; color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.console-search input { width: 260px; }
.type-filter { width: auto; min-width: 140px; }
.audit-list { list-style: none; margin: 0; padding: 0; }
.audit-item { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 13px; padding: 15px 22px; border-bottom: 1px solid var(--console-border-soft); }
.audit-item:last-child { border-bottom: none; }
.actor-initials { width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #eef2ff; color: #4f46e5; font-weight: 750; font-size: 12px; }
.audit-text { min-width: 0; }
.audit-text p { margin: 0 0 4px; color: var(--console-text); overflow-wrap: anywhere; }
.audit-text span { color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.audit-tags { display: flex; gap: 6px; align-items: center; }
.empty { padding: 34px; text-align: center; color: var(--console-text-muted); }
.page-alert { margin-bottom: 16px; border: 1px solid #fecaca; border-radius: var(--console-radius); padding: 12px 14px; background: #fef2f2; color: #b91c1c; }
@media (max-width: 700px) {
  .filters, .console-search, .console-search input, .type-filter { width: 100%; }
  .audit-item { grid-template-columns: 38px minmax(0, 1fr); padding-inline: 16px; align-items: start; }
  .audit-tags { grid-column: 2; }
}
</style>
