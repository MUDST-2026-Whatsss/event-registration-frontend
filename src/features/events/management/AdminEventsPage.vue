<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import StatCard from './StatCard.vue'
import EventFilter from './EventFilter.vue'
import EventTable from './EventTable.vue'
import { useToast } from '@/shared/composables/useToast.js'
import {
  cancelAdminEvent,
  getAdminEventStats,
  listAdminEvents,
  withdrawAdminEvent,
} from '../api/adminEventsApi.js'

const router = useRouter()
const { showToast } = useToast()
const events = ref([])
const stats = ref({ total: 0, published: 0, pendingReview: 0, rejected: 0 })
const selectedStatus = ref('')
const search = ref('')
const page = ref(0)
const totalPages = ref(0)
const loading = ref(false)
const errorMessage = ref('')

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
      query: search.value.trim(),
      page: page.value,
    })
    events.value = result.content.map(mapEvent)
    totalPages.value = result.page?.totalPages ?? result.totalPages ?? 0
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load events.'
  } finally {
    loading.value = false
  }
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

function changePage(nextPage) {
  page.value = nextPage
  loadEvents()
}

watch(selectedStatus, () => {
  page.value = 0
  loadEvents()
})

onMounted(reload)
</script>

<template>

  <section class="content">
        <div class="header">
          <div>
            <h1>All Events</h1>
            <p>Manage and track your assigned events and their approval status.</p>
          </div>

          <button type="button" class="create-btn" @click="goToCreate">
            <Icon name="plus" :size="17" aria-hidden="true" />
            Create New Event
          </button>
        </div>

        <div class="search-row">
          <input v-model="search" type="search" placeholder="Search your events…" @keyup.enter="page = 0; loadEvents()" />
          <button type="button" @click="page = 0; loadEvents()">Search</button>
        </div>

        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
        <p v-if="loading" class="loading-message">Loading events…</p>

        <div class="stats">
          <StatCard title="TOTAL EVENTS" :value="stats.total" />
          <StatCard title="PUBLISHED" :value="stats.published" color="green" />
          <StatCard title="PENDING REVIEW" :value="stats.pendingReview" color="orange" />
          <StatCard title="REJECTED" :value="stats.rejected" color="red" />
        </div>

        <EventFilter v-model="selectedStatus" />

        <EventTable
          :events="events"
          :page="page"
          :total-pages="totalPages"
          @page="changePage"
          @edit="editEvent"
          @withdraw="withdrawEvent"
          @cancel="cancelEvent"
        />
  </section>
</template>

<style scoped>
.content {
  width: 100%;
  max-width: var(--console-content-max);
  margin-inline: auto;
  padding: 28px 32px 48px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.header h1 {
  font-size: var(--console-fs-3xl);
  margin-bottom: 6px;
}
.header p {
  color: #64748b;
}
.create-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px 22px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 28px 0;
}
.search-row { display: flex; gap: 10px; margin-top: 24px; }
.search-row input { flex: 1; padding: 12px 14px; border: 1px solid #dbe3ef; border-radius: 10px; }
.search-row button { padding: 10px 18px; color: white; background: #2563eb; border: 0; border-radius: 10px; cursor: pointer; }
.error-message { padding: 12px 14px; color: #991b1b; background: #fef2f2; border-radius: 10px; }
.loading-message { color: #64748b; }

@media (max-width: 1024px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .content {
    padding: 24px 16px 36px;
  }

  .header {
    align-items: stretch;
    flex-direction: column;
  }

  .create-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
