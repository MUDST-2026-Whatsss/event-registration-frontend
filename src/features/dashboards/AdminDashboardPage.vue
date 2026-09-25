<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAdminEventStats, listAdminEvents } from '@/features/events/api/adminEventsApi.js'
import StatusBadge from '@/features/events/management/StatusBadge.vue'
import { ConsoleIcon as Icon, PageTopbar, UserMenu } from '@/features/console-shell/public.js'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const search = ref('')
const stats = ref({
  total: 0,
  draft: 0,
  pendingReview: 0,
  published: 0,
  rejected: 0,
  cancelled: 0,
})
const recentEvents = ref([])

const metrics = computed(() => [
  { label: 'Draft', value: stats.value.draft },
  { label: 'Pending Review', value: stats.value.pendingReview, tone: 'warning' },
  { label: 'Published', value: stats.value.published, tone: 'success' },
  { label: 'Rejected', value: stats.value.rejected, tone: 'danger' },
])

const filteredEvents = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return recentEvents.value
  return recentEvents.value.filter((event) =>
    `${event.title} ${event.locationName || ''} ${event.status}`.toLowerCase().includes(query),
  )
})

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [eventStats, eventPage] = await Promise.all([
      getAdminEventStats(),
      listAdminEvents({ page: 0, size: 6 }),
    ])
    stats.value = eventStats
    recentEvents.value = eventPage.content || []
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load the dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <PageTopbar title="Dashboard">
    <template #search>
      <div class="console-search dash-search">
        <Icon name="search" :size="15" />
        <input
          v-model="search"
          class="console-input"
          type="search"
          placeholder="Search recent events…"
          aria-label="Search recent events"
        />
      </div>
    </template>
    <template #actions><UserMenu /></template>
  </PageTopbar>

  <main class="console-body dash">
    <p v-if="errorMessage" class="alert" role="alert">{{ errorMessage }}</p>

    <section class="hero">
      <div class="hero-head">
        <div>
          <span class="hero-label">Managed Events</span>
          <div class="hero-value">{{ stats.total.toLocaleString() }}</div>
          <p class="hero-note">Only events assigned to your administrator account are included.</p>
        </div>
        <div class="hero-actions">
          <button class="console-btn console-btn-primary" type="button" @click="router.push('/admin/create-event')">
            <Icon name="plus" :size="15" />Create Event
          </button>
          <button class="console-btn console-btn-outline" type="button" @click="router.push('/admin/all-events')">
            View All Events
          </button>
        </div>
      </div>

      <div class="hero-metrics">
        <div v-for="metric in metrics" :key="metric.label" class="hero-metric">
          <span>{{ metric.label }}</span>
          <strong :class="metric.tone">{{ metric.value.toLocaleString() }}</strong>
        </div>
      </div>
    </section>

    <section class="console-card recent-card">
      <header class="console-card-header dashboard-card-header">
        <div>
          <h2>Recently Updated Events</h2>
          <p>Live data from the event administration API.</p>
        </div>
        <button class="console-btn console-btn-outline" type="button" :disabled="loading" @click="loadDashboard">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </header>

      <div class="console-table-scroll">
        <table class="console-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Registrations</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in filteredEvents" :key="event.eventId">
              <td>
                <div class="event-cell">
                  <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.title" />
                  <span v-else class="event-fallback"><Icon name="image" :size="20" aria-hidden="true" /></span>
                  <div>
                    <strong>{{ event.title }}</strong>
                    <small>{{ event.locationName || (event.locationType === 'ONLINE' ? 'Online' : '—') }}</small>
                  </div>
                </div>
              </td>
              <td>{{ formatDate(event.startAt) }}</td>
              <td>{{ event.registrationCount }} / {{ event.maximumParticipants }}</td>
              <td><StatusBadge :status="event.status" /></td>
              <td>
                <button
                  class="link-button"
                  type="button"
                  @click="router.push(`/admin/events/${event.eventId}/edit`)"
                >
                  {{ event.status === 'PUBLISHED' ? 'Request changes' : 'Open' }}
                </button>
              </td>
            </tr>
            <tr v-if="!loading && !filteredEvents.length">
              <td colspan="5" class="empty">No events found.</td>
            </tr>
            <tr v-if="loading && !recentEvents.length">
              <td colspan="5" class="empty">Loading events…</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dash { display: flex; flex-direction: column; gap: 20px; width: 100%; }
.dash-search { width: 100%; max-width: 420px; }
.dash-search input { width: 100%; }
.alert {
  margin: 0;
  padding: 12px 14px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
}
.hero {
  padding: 24px 26px;
  background: var(--gradient-page);
  border: 1px solid var(--console-border-soft);
  border-radius: var(--console-radius-lg);
  box-shadow: var(--console-shadow);
}
.hero-head { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.hero-label, .hero-note, .hero-metric span { color: var(--console-text-secondary); }
.hero-label, .hero-note, .hero-metric span { font-size: var(--console-fs-sm); }
.hero-note { margin: 4px 0 0; }
.hero-value {
  margin-top: 4px;
  color: var(--console-text);
  font-size: var(--console-fs-display);
  font-weight: 700;
}
.hero-actions { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.hero-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}
.hero-metric { display: flex; flex-direction: column; gap: 6px; }
.hero-metric strong { color: var(--console-text); font-size: var(--console-fs-xl); }
.hero-metric strong.warning { color: var(--console-warning); }
.hero-metric strong.success { color: #15803d; }
.hero-metric strong.danger { color: #dc2626; }
.recent-card { overflow: hidden; }
.dashboard-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.dashboard-card-header h2 { margin: 0; color: var(--console-text); font-size: var(--console-fs-lg); }
.dashboard-card-header p { margin: 4px 0 0; color: var(--console-text-secondary); font-size: var(--console-fs-sm); }
.event-cell { display: flex; align-items: center; gap: 12px; min-width: 220px; }
.event-cell img, .event-fallback {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 8px;
  object-fit: cover;
}
.event-fallback { display: grid; place-items: center; background: var(--console-gray-bg); }
.event-cell strong, .event-cell small { display: block; }
.event-cell small { margin-top: 3px; color: var(--console-text-muted); }
.link-button { color: var(--console-primary); background: none; border: 0; cursor: pointer; font-weight: 600; }
.empty { padding: 36px 20px; color: var(--console-text-muted); text-align: center; }

@media (max-width: 768px) {
  .hero-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hero-actions, .hero-actions button { width: 100%; }
  .dashboard-card-header { align-items: stretch; flex-direction: column; }
}

@media (max-width: 480px) {
  .hero { padding: 20px; }
  .hero-metrics { grid-template-columns: 1fr; }
}
</style>
