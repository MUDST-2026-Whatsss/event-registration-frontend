<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ConsoleIcon as Icon, ConsolePageHeader } from '@/features/console-shell/public.js'
import EventFilter from './EventFilter.vue'
import EventTable from './EventTable.vue'
import { useToast } from '@/shared/composables/useToast.js'
import {
  cancelAdminEvent,
  getAdminEventStats,
  listAdminEvents,
  listEventCategories,
  withdrawAdminEvent,
} from '../api/adminEventsApi.js'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const events = ref([])
const categories = ref([])
const stats = ref({ total: 0, published: 0, pendingReview: 0, rejected: 0 })
const selectedStatus = ref(typeof route.query.status === 'string' ? route.query.status : '')
const selectedCategoryId = ref(typeof route.query.categoryId === 'string' ? route.query.categoryId : '')
const search = ref(typeof route.query.query === 'string' ? route.query.query : '')
const page = ref(Math.max(0, Number.parseInt(route.query.page, 10) || 0))
const pageSize = ref([10, 20, 50].includes(Number(route.query.size)) ? Number(route.query.size) : 10)
const totalPages = ref(0)
const totalElements = ref(0)
const loading = ref(false)
const errorMessage = ref('')

const summaryMetrics = computed(() => [
  { label: 'Total events', value: stats.value.total, icon: 'calendar', status: '', tone: 'primary' },
  { label: 'Published', value: stats.value.published, icon: 'circle-check', status: 'PUBLISHED', tone: 'success' },
  { label: 'Pending review', value: stats.value.pendingReview, icon: 'clock', status: 'PENDING_REVIEW', tone: 'warning' },
  { label: 'Rejected', value: stats.value.rejected, icon: 'circle-x', status: 'REJECTED', tone: 'danger' },
])

function mapEvent(event) {
  const total = event.maximumParticipants || 0
  const registered = event.registrationCount || 0
  return {
    ...event,
    location: event.locationName || (event.locationType === 'ONLINE' ? 'Online' : '—'),
    registration: `${registered} / ${total}`,
    progress: total ? Math.round((registered / total) * 100) : 0,
  }
}

async function loadEvents() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listAdminEvents({
      status: selectedStatus.value,
      eventCategoryId: selectedCategoryId.value,
      query: search.value.trim(),
      page: page.value,
      size: pageSize.value,
    })
    events.value = result.content.map(mapEvent)
    totalPages.value = result.page?.totalPages ?? result.totalPages ?? 0
    totalElements.value = result.page?.totalElements ?? result.totalElements ?? 0
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load events.'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await listEventCategories()
    if (selectedCategoryId.value && !categories.value.some(
      (category) => category.eventCategoryId === selectedCategoryId.value,
    )) {
      selectedCategoryId.value = ''
    }
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load event categories.'
  }
}

function syncRoute() {
  const query = {}
  if (selectedStatus.value) query.status = selectedStatus.value
  if (selectedCategoryId.value) query.categoryId = selectedCategoryId.value
  if (search.value.trim()) query.query = search.value.trim()
  if (page.value > 0) query.page = String(page.value)
  if (pageSize.value !== 10) query.size = String(pageSize.value)
  return router.replace({ name: 'admin-all-events', query })
}

async function applySearch() {
  page.value = 0
  await syncRoute()
  await loadEvents()
}

async function loadStats() {
  try {
    stats.value = await getAdminEventStats()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load event statistics.'
  }
}

async function reload() {
  await Promise.all([loadEvents(), loadStats()])
}

function goToCreate() {
  router.push('/admin/create-event')
}

function selectSummary(status) {
  selectedStatus.value = status
}

function editEvent(event) {
  router.push(`/admin/events/${event.eventId}/edit`)
}

async function withdrawEvent(event) {
  if (!window.confirm(`Withdraw “${event.title}” from review?`)) return
  try {
    await withdrawAdminEvent(event.eventId, event.version)
    showToast({ variant: 'success', title: 'Review withdrawn', message: 'The event is a draft again.' })
    await reload()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to withdraw the event.'
  }
}

async function cancelEvent(event) {
  const reason = window.prompt(`Why are you cancelling “${event.title}”?`)
  if (!reason?.trim()) return
  try {
    await cancelAdminEvent(event.eventId, event.version, reason.trim())
    showToast({ variant: 'success', title: 'Event cancelled', message: 'The event history was retained.' })
    await reload()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to cancel the event.'
  }
}

async function changePage(nextPage) {
  page.value = nextPage
  await syncRoute()
  await loadEvents()
}

async function changePageSize(nextSize) {
  pageSize.value = nextSize
  page.value = 0
  await syncRoute()
  await loadEvents()
}

watch([selectedStatus, selectedCategoryId], async () => {
  page.value = 0
  await syncRoute()
  await loadEvents()
})

onMounted(async () => {
  await loadCategories()
  await syncRoute()
  await reload()
})
</script>

<template>
  <main class="content">
    <ConsolePageHeader
      eyebrow="Event administration"
      title="All Events"
      description="Manage and track your assigned events and their approval status."
    >
      <template #actions>
        <button type="button" class="console-btn console-btn-primary" @click="goToCreate">
          <Icon name="plus" :size="16" aria-hidden="true" />
          Create event
        </button>
      </template>
    </ConsolePageHeader>

    <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

    <section class="summary-strip" aria-label="Event summary">
      <button
        v-for="metric in summaryMetrics"
        :key="metric.label"
        type="button"
        class="summary-item"
        :class="[{ active: selectedStatus === metric.status }, metric.tone]"
        @click="selectSummary(metric.status)"
      >
        <span class="summary-icon"><Icon :name="metric.icon" :size="18" aria-hidden="true" /></span>
        <span>
          <small>{{ metric.label }}</small>
          <strong>{{ metric.value.toLocaleString() }}</strong>
        </span>
      </button>
    </section>

    <section class="event-workspace">
      <form class="search-toolbar" role="search" @submit.prevent="applySearch">
        <label class="search-field">
          <span class="sr-only">Search your events</span>
          <Icon name="search" :size="17" aria-hidden="true" />
          <input v-model="search" type="search" placeholder="Search by event title or location…" />
        </label>
        <button class="search-button" type="submit">Search</button>
        <span class="loading-status" aria-live="polite">{{ loading ? 'Updating results…' : '' }}</span>
      </form>

      <EventFilter
        v-model="selectedStatus"
        v-model:category-id="selectedCategoryId"
        :categories="categories"
      />

      <EventTable
        :events="events"
        :page="page"
        :page-size="pageSize"
        :total-elements="totalElements"
        :total-pages="totalPages"
        :loading="loading"
        @page="changePage"
        @page-size="changePageSize"
        @edit="editEvent"
        @withdraw="withdrawEvent"
        @cancel="cancelEvent"
      />
    </section>
  </main>
</template>

<style scoped>
.content {
  width: 100%;
  max-width: var(--console-content-max);
  margin-inline: auto;
  padding: 28px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.summary-item {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  color: var(--console-text);
  text-align: left;
  background: #fff;
  border: 1px solid var(--console-border-soft);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}
.summary-item:hover,
.summary-item.active { border-color: #c7d2fe; box-shadow: 0 7px 18px rgb(79 70 229 / 8%); transform: translateY(-1px); }
.summary-item:focus-visible,
.search-button:focus-visible { outline: 3px solid rgb(79 70 229 / 22%); outline-offset: 2px; }
.summary-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: #4f46e5;
  background: #eef2ff;
  border-radius: 10px;
}
.summary-item.success .summary-icon { color: #15803d; background: #ecfdf3; }
.summary-item.warning .summary-icon { color: #c2410c; background: #fff7ed; }
.summary-item.danger .summary-icon { color: #dc2626; background: #fef2f2; }
.summary-item > span:last-child { min-width: 0; flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.summary-item small { overflow: hidden; color: var(--console-text-secondary); font-size: 11px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.summary-item strong { flex-shrink: 0; font-size: 20px; line-height: 1; text-align: right; font-variant-numeric: tabular-nums; }
.event-workspace {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--console-border-soft);
  border-radius: 16px;
  box-shadow: 0 3px 12px rgb(15 23 42 / 3%);
}
.search-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--console-border-soft);
}
.search-field {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  color: var(--console-text-muted);
  background: var(--console-gray-bg);
  border: 1px solid transparent;
  border-radius: 10px;
}
.search-field:focus-within { color: var(--console-primary); background: #fff; border-color: #a5b4fc; }
.search-field input {
  width: 100%;
  min-height: 39px;
  padding: 0;
  color: var(--console-text);
  font: inherit;
  background: transparent;
  border: 0;
  outline: 0;
}
.search-button {
  min-height: 39px;
  padding: 0 16px;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  background: var(--console-primary);
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}
.loading-status { min-width: 92px; color: var(--console-text-muted); font-size: 11px; }
.error-message { padding: 12px 14px; color: #991b1b; background: #fef2f2; border-radius: 10px; }
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

@media (max-width: 1024px) {
  .summary-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .content {
    padding: 24px 16px 36px;
  }

  .search-toolbar { align-items: stretch; flex-wrap: wrap; padding: 12px 14px; }
  .search-field { flex-basis: calc(100% - 90px); }
  .loading-status { width: 100%; min-width: 0; }
}

@media (max-width: 480px) {
  .summary-strip { grid-template-columns: 1fr; }
  .search-field { flex-basis: 100%; }
  .search-button { width: 100%; }
}
</style>
