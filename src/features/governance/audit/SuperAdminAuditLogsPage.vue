<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ConsoleIcon as Icon, ConsolePageHeader, ConsolePagination } from '@/features/console-shell/public.js'
import {
  exportAuditLogs,
  exportSessionActivity,
  exportSignInActivity,
  listAuditLogs,
  listSessionActivity,
  listSignInActivity,
} from './auditApi.js'

const activeTab = ref('administrative')
const search = ref('')
const typeFilter = ref('')
const fromDate = ref('')
const toDate = ref('')
const page = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const logs = ref([])
const loading = ref(false)
const exporting = ref(false)
const errorMessage = ref('')
let searchTimer
let requestSequence = 0

const tabs = [
  { value: 'administrative', label: 'Administrative activity' },
  { value: 'sign-ins', label: 'Sign-in activity' },
  { value: 'sessions', label: 'Session activity' },
]

const filterLabel = computed(() => ({ administrative: 'Target', 'sign-ins': 'Outcome', sessions: 'State' })[activeTab.value])
const filterOptions = computed(() => ({
  administrative: [['', 'All targets'], ['EVENT', 'Events'], ['USER', 'Users'], ['ROLE', 'Roles']],
  'sign-ins': [['', 'All outcomes'], ['SUCCESS', 'Success'], ['FAILURE', 'Failure']],
  sessions: [
    ['', 'All states'], ['ACTIVE', 'Active'], ['EXPIRED', 'Expired'], ['LOGOUT', 'Logged out'],
    ['PASSWORD_CHANGED', 'Password changed'], ['REPLACED_BY_LOGIN', 'Replaced by login'],
    ['REUSE_DETECTED', 'Reuse detected'], ['ROTATED', 'Rotated'], ['ROLES_CHANGED', 'Roles changed'],
  ],
})[activeTab.value])
const searchPlaceholder = computed(() => activeTab.value === 'administrative'
  ? 'Search name, email, action, or target'
  : 'Search name, email, device, or reason')
const summaryTitle = computed(() => ({
  administrative: 'Administrative history',
  'sign-ins': 'Sign-in history',
  sessions: 'Session history',
})[activeTab.value])

const dateError = computed(() => (
  fromDate.value && toDate.value && fromDate.value > toDate.value
    ? 'Start date must be before or equal to end date.'
    : ''
))

function actionLabel(action = '') {
  return action.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function startOfDay(value) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : ''
}

function endOfDayExclusive(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  date.setDate(date.getDate() + 1)
  return date.toISOString()
}

function currentFilters() {
  const filters = {
    query: search.value.trim(),
    from: startOfDay(fromDate.value),
    to: endOfDayExclusive(toDate.value),
  }
  if (activeTab.value === 'administrative') filters.targetType = typeFilter.value
  if (activeTab.value === 'sign-ins') filters.outcome = typeFilter.value
  if (activeTab.value === 'sessions') filters.state = typeFilter.value
  return filters
}

async function load() {
  if (dateError.value) return
  const sequence = ++requestSequence
  const requestedTab = activeTab.value
  const requestedPage = page.value
  loading.value = true
  errorMessage.value = ''
  try {
    const request = requestedTab === 'administrative'
      ? listAuditLogs
      : requestedTab === 'sign-ins' ? listSignInActivity : listSessionActivity
    const result = await request({ ...currentFilters(), page: requestedPage, size: pageSize.value })
    if (sequence !== requestSequence || requestedTab !== activeTab.value) return
    logs.value = result.content
    totalPages.value = result.totalPages
    totalElements.value = result.totalElements
  } catch (error) {
    if (sequence !== requestSequence) return
    errorMessage.value = error.message
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

async function downloadExcel() {
  if (dateError.value) return
  exporting.value = true
  errorMessage.value = ''
  try {
    const exporter = activeTab.value === 'administrative'
      ? exportAuditLogs
      : activeTab.value === 'sign-ins' ? exportSignInActivity : exportSessionActivity
    const file = await exporter(currentFilters())
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeTab.value}-activity-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    exporting.value = false
  }
}

function clearFilters() {
  search.value = ''
  typeFilter.value = ''
  fromDate.value = ''
  toDate.value = ''
}

function deviceLabel(userAgent) {
  if (!userAgent) return 'Unknown device'
  if (userAgent.includes('Postman')) return 'Postman'
  if (userAgent.includes('Edg/')) return 'Microsoft Edge'
  if (userAgent.includes('Chrome/')) return 'Chrome'
  if (userAgent.includes('Safari/')) return 'Safari'
  if (userAgent.includes('curl/')) return 'curl'
  return userAgent.length > 38 ? `${userAgent.slice(0, 38)}…` : userAgent
}

function switchTab(tab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  search.value = ''
  typeFilter.value = ''
  page.value = 0
  logs.value = []
  totalPages.value = 0
  totalElements.value = 0
  load()
}

watch(search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    page.value = 0
    load()
  }, 300)
})
watch([typeFilter, fromDate, toDate], () => {
  page.value = 0
  load()
})
watch([page, pageSize], load)
onBeforeUnmount(() => window.clearTimeout(searchTimer))
onMounted(load)
</script>

<template>
  <main class="console-body audit-page">
    <ConsolePageHeader
      eyebrow="Security & compliance"
      title="Audit Logs"
      description="Review administrative, sign-in, and session security activity."
    >
      <template #actions>
        <button class="console-btn console-btn-primary" type="button" :disabled="exporting || Boolean(dateError)" @click="downloadExcel">
          <Icon name="download" :size="17" />
          {{ exporting ? 'Exporting…' : 'Export Excel' }}
        </button>
      </template>
    </ConsolePageHeader>

    <p v-if="errorMessage" class="page-alert">{{ errorMessage }}</p>

    <nav class="activity-tabs" aria-label="Audit activity type">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section class="console-card audit-workspace">
      <div class="filter-bar">
        <label class="search-field">
          <span class="sr-only">Search audit logs</span>
          <span class="console-search">
            <Icon name="search" :size="16" />
            <input v-model="search" class="console-input" :placeholder="searchPlaceholder" />
          </span>
        </label>

        <label class="filter-field">
          <span>{{ filterLabel }}</span>
          <select v-model="typeFilter" class="console-select">
            <option v-for="option in filterOptions" :key="option[0]" :value="option[0]">{{ option[1] }}</option>
          </select>
        </label>

        <label class="filter-field">
          <span>From</span>
          <input v-model="fromDate" class="console-input date-input" type="date" :max="toDate || undefined" />
        </label>

        <label class="filter-field">
          <span>To</span>
          <input v-model="toDate" class="console-input date-input" type="date" :min="fromDate || undefined" />
        </label>

        <button class="console-btn console-btn-secondary clear-button" type="button" @click="clearFilters">Clear</button>
      </div>
      <p v-if="dateError" class="filter-error">{{ dateError }}</p>

      <div class="table-summary">
        <div>
          <h2>{{ summaryTitle }}</h2>
          <p>{{ totalElements.toLocaleString() }} records · newest first</p>
        </div>
      </div>

      <div class="audit-table-wrap" :aria-busy="loading">
        <table v-if="activeTab === 'administrative'" class="audit-table">
          <thead>
            <tr>
              <th>Date &amp; time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Type</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="index in 8" :key="`administrative-skeleton-${index}`" class="skeleton-row">
                <td v-for="cell in 6" :key="cell"><span class="skeleton-bar" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="log in logs" :key="log.auditLogId">
                <td data-label="Date & time" class="date-cell">{{ formatDate(log.createdAt) }}</td>
                <td data-label="Actor">
                  <strong>{{ log.actor?.displayName || 'System' }}</strong>
                  <span>{{ log.actor?.email || 'System process' }}</span>
                </td>
                <td data-label="Action" class="action-cell">{{ actionLabel(log.action) }}</td>
                <td data-label="Target"><strong>{{ log.targetLabel || '—' }}</strong></td>
                <td data-label="Type"><span class="console-pill console-pill-blue">{{ log.targetType }}</span></td>
                <td data-label="Outcome">
                  <span class="console-pill" :class="log.outcome === 'SUCCESS' ? 'console-pill-green' : 'console-pill-red'">{{ log.outcome }}</span>
                </td>
              </tr>
              <tr v-if="!logs.length"><td class="empty" colspan="6">No audit records match the current filters.</td></tr>
            </template>
          </tbody>
        </table>

        <table v-else-if="activeTab === 'sign-ins'" class="audit-table security-table">
          <thead>
            <tr>
              <th>Date &amp; time</th>
              <th>User</th>
              <th>Outcome</th>
              <th>Reason</th>
              <th>IP address</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="index in 8" :key="`sign-in-skeleton-${index}`" class="skeleton-row">
                <td v-for="cell in 6" :key="cell"><span class="skeleton-bar" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="log in logs" :key="log.loginAttemptId">
                <td data-label="Date & time" class="date-cell">{{ formatDate(log.attemptedAt) }}</td>
                <td data-label="User">
                  <strong>{{ log.user?.displayName || 'Unknown account' }}</strong>
                  <span>{{ log.user?.email || 'Identifier is securely hashed' }}</span>
                </td>
                <td data-label="Outcome">
                  <span class="console-pill" :class="log.outcome === 'SUCCESS' ? 'console-pill-green' : 'console-pill-red'">{{ log.outcome }}</span>
                </td>
                <td data-label="Reason">{{ log.failureReason ? actionLabel(log.failureReason) : '—' }}</td>
                <td data-label="IP address" class="mono-cell">{{ log.ipAddress || '—' }}</td>
                <td data-label="Device" :title="log.userAgent || ''">{{ deviceLabel(log.userAgent) }}</td>
              </tr>
              <tr v-if="!logs.length"><td class="empty" colspan="6">No sign-in records match the current filters.</td></tr>
            </template>
          </tbody>
        </table>

        <table v-else class="audit-table security-table">
          <thead>
            <tr>
              <th>Activity time</th>
              <th>User</th>
              <th>State</th>
              <th>IP address</th>
              <th>Device</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="index in 8" :key="`session-skeleton-${index}`" class="skeleton-row">
                <td v-for="cell in 6" :key="cell"><span class="skeleton-bar" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="log in logs" :key="log.sessionId">
                <td data-label="Activity time" class="date-cell">{{ formatDate(log.activityAt) }}</td>
                <td data-label="User">
                  <strong>{{ log.user?.displayName || 'Unknown user' }}</strong>
                  <span>{{ log.user?.email || 'Deleted or unavailable account' }}</span>
                </td>
                <td data-label="State">
                  <span class="console-pill" :class="log.state === 'ACTIVE' ? 'console-pill-green' : log.state === 'REUSE_DETECTED' ? 'console-pill-red' : 'console-pill-blue'">{{ actionLabel(log.state) }}</span>
                </td>
                <td data-label="IP address" class="mono-cell">{{ log.ipAddress || '—' }}</td>
                <td data-label="Device" :title="log.userAgent || ''">{{ deviceLabel(log.userAgent) }}</td>
                <td data-label="Expires" class="date-cell">{{ formatDate(log.expiresAt) }}</td>
              </tr>
              <tr v-if="!logs.length"><td class="empty" colspan="6">No session records match the current filters.</td></tr>
            </template>
          </tbody>
        </table>
      </div>
      <ConsolePagination
        :page="page"
        :page-size="pageSize"
        :total-elements="totalElements"
        :total-pages="totalPages"
        :loading="loading"
        item-label="records"
        @page="page = $event"
        @page-size="pageSize = $event; page = 0"
      />
    </section>
  </main>
</template>

<style scoped>
.audit-page { display: grid; gap: 18px; }
.activity-tabs { display: inline-flex; justify-self: start; gap: 5px; padding: 5px; border: 1px solid var(--console-border); border-radius: 12px; background: #fff; }
.activity-tabs button { border: 0; border-radius: 8px; padding: 9px 14px; background: transparent; color: var(--console-text-secondary); font: inherit; font-size: var(--console-fs-sm); font-weight: 650; cursor: pointer; }
.activity-tabs button:hover { color: var(--console-primary); background: var(--console-primary-soft); }
.activity-tabs button.active { color: #fff; background: var(--console-primary); box-shadow: 0 4px 10px rgb(79 70 229 / 16%); }
.audit-workspace { overflow: hidden; }
.filter-bar { display: grid; grid-template-columns: minmax(260px, 1fr) 150px 160px 160px auto; align-items: end; gap: 10px; padding: 18px 20px; border-bottom: 1px solid var(--console-border-soft); }
.search-field, .filter-field { min-width: 0; }
.search-field .console-search, .search-field input { width: 100%; }
.filter-field { display: grid; gap: 6px; }
.filter-field > span { color: var(--console-text-secondary); font-size: var(--console-fs-xs); font-weight: 650; }
.filter-field .console-select, .date-input { width: 100%; }
.clear-button { min-height: 42px; }
.filter-error { margin: 0; padding: 0 20px 14px; color: var(--console-danger); font-size: var(--console-fs-xs); }
.table-summary { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; }
.table-summary h2 { margin: 0 0 3px; font-size: var(--console-fs-lg); }
.table-summary p { margin: 0; color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.audit-table-wrap { height: clamp(420px, calc(100vh - 430px), 720px); overflow: auto; }
.audit-workspace :deep(.console-pagination) { padding: 14px 20px; border-top: 1px solid var(--console-border-soft); }
.audit-table { width: 100%; border-collapse: collapse; text-align: left; }
.audit-table th { position: sticky; z-index: 1; top: 0; padding: 11px 18px; color: var(--console-text-secondary); background: var(--console-gray-bg); border-block: 1px solid var(--console-border-soft); font-size: var(--console-fs-2xs); letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; }
.audit-table td { padding: 13px 18px; color: var(--console-text); border-bottom: 1px solid var(--console-border-soft); font-size: var(--console-fs-sm); vertical-align: middle; }
.audit-table tbody tr:last-child td { border-bottom: 0; }
.audit-table tbody tr:hover:not(:has(.empty)) { background: #fafbff; }
.audit-table td strong { display: block; font-size: var(--console-fs-sm); }
.audit-table td span:not(.console-pill) { display: block; margin-top: 3px; color: var(--console-text-muted); font-size: var(--console-fs-xs); }
.date-cell { color: var(--console-text-secondary) !important; white-space: nowrap; }
.action-cell { text-transform: capitalize; }
.mono-cell { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: nowrap; }
.skeleton-row { pointer-events: none; }
.skeleton-row td { height: 61px; }
.skeleton-bar { display: block !important; width: min(100%, 150px); height: 12px; margin: 0 !important; border-radius: 999px; background: linear-gradient(90deg, #eef0f5 25%, #f8f9fc 50%, #eef0f5 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.2s ease-in-out infinite; }
.skeleton-row td:nth-child(2) .skeleton-bar { width: min(100%, 180px); }
.skeleton-row td:nth-child(5) .skeleton-bar,
.skeleton-row td:nth-child(6) .skeleton-bar { width: min(100%, 90px); }
.empty { padding: 40px !important; text-align: center; color: var(--console-text-muted) !important; }
.page-alert { margin: 0; border: 1px solid #fecaca; border-radius: var(--console-radius); padding: 12px 14px; background: #fef2f2; color: #b91c1c; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes skeleton-shimmer { to { background-position: -200% 0; } }

@media (max-width: 1120px) {
  .filter-bar { grid-template-columns: minmax(260px, 1fr) 150px 160px 160px; }
  .clear-button { grid-column: 4; }
}
@media (max-width: 780px) {
  .activity-tabs { display: grid; width: 100%; grid-template-columns: 1fr; }
  .filter-bar { grid-template-columns: 1fr 1fr; }
  .search-field { grid-column: 1 / -1; }
  .clear-button { grid-column: auto; }
  .audit-table-wrap { height: auto; min-height: 420px; overflow-x: auto; }
  .audit-table th { position: static; }
  .audit-table thead { display: none; }
  .audit-table, .audit-table tbody, .audit-table tr, .audit-table td { display: block; width: 100%; }
  .audit-table tr { padding: 12px 16px; border-bottom: 1px solid var(--console-border-soft); }
  .audit-table td { display: grid; grid-template-columns: 105px minmax(0, 1fr); gap: 10px; padding: 6px 0; border: 0; }
  .audit-table td::before { content: attr(data-label); color: var(--console-text-muted); font-size: var(--console-fs-xs); font-weight: 650; }
  .audit-table .empty { display: block; }
  .audit-table .empty::before { content: none; }
}
@media (max-width: 520px) {
  .filter-bar { grid-template-columns: 1fr; }
  .search-field { grid-column: auto; }
}
</style>
