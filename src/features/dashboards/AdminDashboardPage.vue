<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/features/auth/public.js'
import { getAdminEventStats } from '@/features/events/api/adminEventsApi.js'
import { listRecentAdminRegistrations } from '@/features/registrations/api/registrationsApi.js'
import { ConsoleIcon as Icon, ConsolePageHeader } from '@/features/console-shell/public.js'
import EventsOverviewCard from './EventsOverviewCard.vue'

const router = useRouter()
const { currentUser } = useAuth()
const loading = ref(false)
const errorMessage = ref('')
const recentRegistrations = ref([])
const stats = ref({
  total: 0,
  draft: 0,
  pendingReview: 0,
  published: 0,
  rejected: 0,
  cancelled: 0,
  completed: 0,
  categories: [],
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const firstName = computed(() => (
  currentUser.value?.firstName
  || currentUser.value?.name?.trim().split(/\s+/)[0]
  || 'Admin'
))

const metrics = computed(() => [
  {
    label: 'Total events', value: stats.value.total, note: 'All assigned events', icon: 'calendar', tone: 'primary',
  },
  {
    label: 'Published', value: stats.value.published, note: 'Visible to attendees', icon: 'circle-check', tone: 'success', status: 'PUBLISHED',
  },
  {
    label: 'Pending review', value: stats.value.pendingReview, note: 'Waiting for approval', icon: 'clock', tone: 'warning', status: 'PENDING_REVIEW',
  },
  {
    label: 'Draft', value: stats.value.draft, note: 'Still being prepared', icon: 'pencil', tone: 'neutral', status: 'DRAFT',
  },
])

const eventStatuses = computed(() => {
  const total = stats.value.total || 0
  const items = [
    { label: 'Published', count: stats.value.published, color: '#22c55e' },
    { label: 'Draft', count: stats.value.draft, color: '#818cf8' },
    { label: 'Pending review', count: stats.value.pendingReview, color: '#f59e0b' },
    { label: 'Rejected', count: stats.value.rejected, color: '#ef4444' },
    { label: 'Cancelled', count: stats.value.cancelled, color: '#94a3b8' },
    { label: 'Completed', count: stats.value.completed, color: '#38bdf8' },
  ]

  return items.map((item) => ({
    ...item,
    percent: total ? Math.round((item.count / total) * 100) : 0,
  }))
})

const categoryStats = computed(() => stats.value.categories || [])

const categoryStatusDefinitions = [
  { key: 'published', label: 'Published', color: '#22c55e' },
  { key: 'draft', label: 'Draft', color: '#818cf8' },
  { key: 'pendingReview', label: 'Pending review', color: '#f59e0b' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' },
  { key: 'cancelled', label: 'Cancelled', color: '#94a3b8' },
  { key: 'completed', label: 'Completed', color: '#38bdf8' },
]

function categoryName(category) {
  return category.nameEn || category.nameTh || 'Uncategorized'
}

function categoryStatuses(category) {
  const total = Number(category.total) || 0
  return categoryStatusDefinitions
    .map((status) => ({
      ...status,
      count: Number(category[status.key]) || 0,
      percent: total ? ((Number(category[status.key]) || 0) / total) * 100 : 0,
    }))
    .filter((status) => status.count > 0)
}

function openEvents(status) {
  router.push({ name: 'admin-all-events', query: status ? { status } : undefined })
}

function openCategory(categoryId) {
  router.push({ name: 'admin-all-events', query: { categoryId } })
}

const registrationDateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatRegisteredAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : registrationDateFormatter.format(date)
}

function participantInitials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
}

function registrationStatusLabel(status) {
  return String(status || 'Unknown')
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function registrationStatusClass(status) {
  if (status === 'CONFIRMED' || status === 'CHECKED_IN') return 'console-pill-green'
  if (status === 'CANCELLED_BY_USER' || status === 'CANCELLED_EVENT') return 'console-pill-red'
  return 'console-pill-blue'
}

function openRegistration(registration) {
  router.push({
    name: 'admin-event-participants',
    params: { id: registration.eventId },
  })
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [statsPayload, registrationsPayload] = await Promise.all([
      getAdminEventStats(),
      listRecentAdminRegistrations({ size: 5 }),
    ])
    stats.value = statsPayload
    recentRegistrations.value = registrationsPayload.content || []
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load the dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <main class="console-body admin-dashboard">
    <ConsolePageHeader
      eyebrow="Admin workspace"
      :title="`${greeting}, ${firstName}`"
      description="A compact overview of your assigned events and what needs attention."
    >
      <template #actions>
        <button class="console-btn console-btn-primary" type="button" @click="router.push('/admin/create-event')">
          <Icon name="plus" :size="15" aria-hidden="true" />
          Create event
        </button>
        <button class="console-btn console-btn-outline" type="button" @click="openEvents()">
          View all events
        </button>
      </template>
    </ConsolePageHeader>

    <p v-if="errorMessage" class="alert" role="alert">{{ errorMessage }}</p>

    <section class="metric-grid" aria-label="Event totals">
      <button
        v-for="metric in metrics"
        :key="metric.label"
        class="metric-card"
        type="button"
        @click="openEvents(metric.status)"
      >
        <span class="metric-icon" :class="metric.tone">
          <Icon :name="metric.icon" :size="20" aria-hidden="true" />
        </span>
        <span class="metric-copy">
          <span class="metric-label">{{ metric.label }}</span>
          <strong>{{ metric.value.toLocaleString() }}</strong>
          <small>{{ metric.note }}</small>
        </span>
        <Icon class="metric-arrow" name="chevron-right" :size="16" aria-hidden="true" />
      </button>
    </section>

    <div class="dashboard-layout">
      <section class="console-card category-card">
        <header class="console-card-header dashboard-card-header">
          <div>
            <span class="section-kicker">Portfolio</span>
            <h2>Events by category</h2>
            <p>Choose a category to open its filtered event list.</p>
          </div>
          <button class="refresh-button" type="button" :disabled="loading" @click="loadDashboard">
            <Icon name="repeat" :size="15" aria-hidden="true" />
            {{ loading ? 'Refreshing…' : 'Refresh' }}
          </button>
        </header>

        <div v-if="categoryStats.length" class="category-grid">
          <button
            v-for="category in categoryStats"
            :key="category.eventCategoryId || 'uncategorized'"
            class="category-item"
            type="button"
            :disabled="!category.eventCategoryId"
            :title="category.eventCategoryId ? undefined : 'Assign a category when editing these drafts.'"
            @click="openCategory(category.eventCategoryId)"
          >
            <span class="category-heading">
              <span class="category-icon"><Icon name="layers" :size="18" aria-hidden="true" /></span>
              <span class="category-title">
                <strong>{{ categoryName(category) }}</strong>
                <small>{{ category.total.toLocaleString() }} events</small>
              </span>
              <Icon name="chevron-right" :size="16" aria-hidden="true" />
            </span>
            <span class="category-progress" aria-hidden="true">
              <span
                v-for="status in categoryStatuses(category)"
                :key="status.key"
                :style="{ width: `${status.percent}%`, background: status.color }"
              />
            </span>
            <span class="category-breakdown">
              <span v-for="status in categoryStatuses(category)" :key="status.key">
                <i :style="{ background: status.color }" aria-hidden="true" />
                <b>{{ status.count.toLocaleString() }}</b> {{ status.label }}
              </span>
            </span>
          </button>
        </div>
        <p v-else-if="loading" class="empty">Loading categories…</p>
        <p v-else class="empty">No event categories found for this account.</p>
      </section>

      <aside class="dashboard-side" aria-label="Event status overview">
        <EventsOverviewCard compact :statuses="eventStatuses" :total="stats.total" to="/admin/all-events" />
      </aside>
    </div>

    <section class="console-card recent-card">
      <header class="console-card-header dashboard-card-header">
        <div>
          <span class="section-kicker">Activity</span>
          <h2>Recent registrations</h2>
          <p>Latest participants across your assigned events.</p>
        </div>
      </header>

      <div v-if="recentRegistrations.length" class="recent-list">
        <button
          v-for="registration in recentRegistrations"
          :key="registration.registrationId"
          class="recent-row"
          type="button"
          @click="openRegistration(registration)"
        >
          <span class="participant-cell">
            <span class="participant-avatar">{{ participantInitials(registration.attendeeName) }}</span>
            <span class="participant-copy">
              <strong>{{ registration.attendeeName }}</strong>
              <small>{{ registration.attendeeEmail }}</small>
            </span>
          </span>
          <span class="recent-detail">
            <small>Event</small>
            <strong>{{ registration.eventTitle }}</strong>
          </span>
          <span class="recent-detail recent-time">
            <small>Registered</small>
            <span>{{ formatRegisteredAt(registration.registeredAt) }}</span>
          </span>
          <span class="console-pill" :class="registrationStatusClass(registration.status)">
            {{ registrationStatusLabel(registration.status) }}
          </span>
          <Icon class="recent-arrow" name="chevron-right" :size="16" aria-hidden="true" />
        </button>
      </div>
      <p v-else-if="loading" class="empty">Loading recent registrations…</p>
      <p v-else class="empty">No registrations have been received yet.</p>
    </section>
  </main>
</template>

<style scoped>
.admin-dashboard { width: 100%; display: flex; flex-direction: column; gap: 18px; }
.alert {
  margin: 0; padding: 12px 14px; color: #991b1b; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 10px;
}
.dashboard-layout {
  display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(300px, .75fr);
  align-items: stretch; gap: 18px;
}
.dashboard-side { min-width: 0; display: flex; }
.dashboard-side :deep(.overview-card) { width: 100%; height: 100%; }
.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.metric-card {
  min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start; gap: 11px; padding: 17px; color: var(--console-text); text-align: left;
  background: #fff; border: 1px solid var(--console-border-soft); border-radius: 14px;
  box-shadow: 0 3px 12px rgb(15 23 42 / 4%); cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}
.metric-card:hover { border-color: #c7d2fe; box-shadow: 0 10px 24px rgb(79 70 229 / 9%); transform: translateY(-2px); }
.metric-card:focus-visible,
.category-item:focus-visible,
.refresh-button:focus-visible { outline: 3px solid rgb(79 70 229 / 22%); outline-offset: 2px; }
.metric-icon {
  width: 38px; height: 38px; display: grid; place-items: center;
  color: #4f46e5; background: #eef2ff; border-radius: 11px;
}
.metric-icon.success { color: #15803d; background: #ecfdf3; }
.metric-icon.warning { color: #c2410c; background: #fff7ed; }
.metric-icon.neutral { color: #475569; background: #f1f5f9; }
.metric-copy {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: "label value" "note value";
  align-items: center;
  column-gap: 12px;
  row-gap: 7px;
}
.metric-label { grid-area: label; color: var(--console-text-secondary); font-size: 12px; font-weight: 600; }
.metric-copy strong { grid-area: value; font-size: 25px; line-height: 1; text-align: right; font-variant-numeric: tabular-nums; }
.metric-copy small { grid-area: note; overflow: hidden; color: var(--console-text-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.metric-arrow { margin-top: 2px; color: #cbd5e1; }
.category-card { height: 100%; overflow: hidden; }
.dashboard-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.section-kicker { color: var(--console-primary); font-size: 10px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.dashboard-card-header h2 { margin: 3px 0 0; color: var(--console-text); font-size: var(--console-fs-lg); }
.dashboard-card-header p { margin: 4px 0 0; color: var(--console-text-secondary); font-size: var(--console-fs-sm); }
.refresh-button {
  display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px;
  color: var(--console-text-secondary); font: inherit; font-size: 12px; font-weight: 600;
  background: #fff; border: 1px solid var(--console-border-soft); border-radius: 9px; cursor: pointer;
}
.refresh-button:hover:not(:disabled) { color: var(--console-primary); border-color: #c7d2fe; }
.refresh-button:disabled { cursor: wait; opacity: .65; }
.category-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 16px; }
.category-item {
  min-width: 0; padding: 15px; color: var(--console-text); text-align: left;
  background: #fff; border: 1px solid var(--console-border-soft); border-radius: 12px; cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.category-item:hover { background: #fafaff; border-color: #c7d2fe; }
.category-heading { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.category-icon { width: 34px; height: 34px; display: grid; place-items: center; color: var(--console-primary); background: #eef2ff; border-radius: 9px; }
.category-title { min-width: 0; display: flex; flex-direction: column; }
.category-title strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.category-title small { margin-top: 2px; color: var(--console-text-muted); font-size: 11px; }
.category-progress { height: 4px; display: flex; margin-top: 14px; overflow: hidden; background: #eef2f7; border-radius: 999px; }
.category-progress > span { height: 100%; display: block; }
.category-progress > span:first-child { border-radius: 999px 0 0 999px; }
.category-progress > span:last-child { border-radius: 0 999px 999px 0; }
.category-progress > span:only-child { border-radius: 999px; }
.category-breakdown { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 10px; color: var(--console-text-muted); font-size: 11px; }
.category-breakdown > span { display: inline-flex; align-items: center; gap: 4px; }
.category-breakdown i { width: 6px; height: 6px; flex: 0 0 6px; border-radius: 50%; }
.category-breakdown b { color: var(--console-text); }
.empty { padding: 34px 20px; color: var(--console-text-muted); text-align: center; }
.recent-card { overflow: hidden; }
.recent-list { display: flex; flex-direction: column; }
.recent-row {
  min-width: 0; display: grid;
  grid-template-columns: minmax(220px, 1.35fr) minmax(180px, 1fr) minmax(150px, .75fr) auto auto;
  align-items: center; gap: 18px; padding: 14px 18px; color: var(--console-text); text-align: left;
  background: #fff; border: 0; border-top: 1px solid var(--console-border-soft); cursor: pointer;
  transition: background .15s ease;
}
.recent-row:hover { background: #fafaff; }
.recent-row:focus-visible { position: relative; outline: 3px solid rgb(79 70 229 / 22%); outline-offset: -3px; }
.participant-cell { min-width: 0; display: flex; align-items: center; gap: 11px; }
.participant-avatar {
  width: 36px; height: 36px; flex: 0 0 36px; display: grid; place-items: center;
  color: var(--console-primary); font-size: 11px; font-weight: 700; background: #eef2ff; border-radius: 10px;
}
.participant-copy, .recent-detail { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.participant-copy strong, .recent-detail strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.participant-copy small, .recent-detail small { overflow: hidden; color: var(--console-text-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.recent-time > span { color: var(--console-text-secondary); font-size: 12px; white-space: nowrap; }
.recent-arrow { color: #cbd5e1; }

@media (min-width: 1321px) {
  .dashboard-side :deep(.overview-card.compact .overview-content) {
    grid-template-columns: minmax(145px, .85fr) minmax(165px, 1fr);
    gap: 6px;
    padding: 18px 14px;
  }
  .dashboard-side :deep(.overview-card.compact .donut-wrapper),
  .dashboard-side :deep(.overview-card.compact .donut-chart) {
    width: 160px;
    height: 160px;
  }
}

@media (max-width: 1320px) {
  .dashboard-layout { grid-template-columns: minmax(0, 1.45fr) minmax(280px, .75fr); }
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 980px) {
  .dashboard-layout { grid-template-columns: minmax(0, 1fr); }
  .recent-row { grid-template-columns: minmax(200px, 1.2fr) minmax(170px, 1fr) auto auto; }
  .recent-time { display: none; }
}
@media (max-width: 680px) {
  .metric-grid, .category-grid { grid-template-columns: minmax(0, 1fr); }
  .dashboard-card-header { align-items: stretch; flex-direction: column; }
  .refresh-button { align-self: flex-start; }
  .recent-row { grid-template-columns: minmax(0, 1fr) auto; gap: 10px; }
  .recent-detail, .recent-row > .console-pill { display: none; }
}
</style>
