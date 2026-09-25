<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import EventDetailsModal from './EventApprovalDetailsModal.vue'
import { approveEventReview, listEventReviews, rejectEventReview } from '../governanceApi.js'
import { useToast } from '@/shared/composables/useToast.js'

const statusTab = ref('Pending')
const sortOrder = ref('newest')
const filtersOpen = ref(false)
const priorityFilter = ref({ high: true, standard: true })
const selectedEvent = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const reviews = ref([])
const { showToast } = useToast()

const formatDate = (value) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : 'TBD'
const eventLocation = (event) => event.locationName || event.onlineUrl || 'Location not set'
const mapReview = (review) => ({
  id: review.reviewId,
  reviewId: review.reviewId,
  version: review.event.version,
  icon: 'calendar',
  name: review.event.title,
  category: review.event.category?.nameEn || review.event.category?.nameTh || 'Uncategorized',
  organizerAvatar: '',
  organizer: review.submittedBy?.email || 'Unknown',
  organizerRole: 'Event Admin',
  date: formatDate(review.event.startAt),
  dateISO: review.event.startAt,
  location: eventLocation(review.event),
  participants: review.event.registrationCount || 0,
  max: review.event.maximumParticipants || 0,
  status: review.decision === 'PENDING' ? 'Pending Review' : review.decision[0] + review.decision.slice(1).toLowerCase(),
  priority: review.priority.toLowerCase(),
  raw: review,
})

async function loadReviews() {
  loading.value = true
  errorMessage.value = ''
  try {
    const payload = await listEventReviews({
      decision: statusTab.value === 'Pending' ? 'PENDING' : undefined,
      page: currentPage.value,
      size: 10,
    })
    reviews.value = payload.content.map(mapReview)
    totalPages.value = payload.totalPages
    totalElements.value = payload.totalElements
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  let list = reviews.value
  list = list.filter((e) => (e.priority === 'high' ? priorityFilter.value.high : priorityFilter.value.standard))
  list = [...list].sort((a, b) =>
    sortOrder.value === 'newest'
      ? new Date(b.dateISO) - new Date(a.dateISO)
      : new Date(a.dateISO) - new Date(b.dateISO),
  )
  return list
})

async function decide(event, decision, comment = '') {
  try {
    if (decision === 'approve') await approveEventReview(event.reviewId, event.version, comment)
    else await rejectEventReview(event.reviewId, event.version, comment)
    selectedEvent.value = null
    showToast({ title: `Event ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`, variant: 'success' })
    await loadReviews()
  } catch (error) {
    showToast({ title: error.message, variant: 'danger' })
  }
}

function toggleSort() {
  sortOrder.value = sortOrder.value === 'newest' ? 'oldest' : 'newest'
}

watch(statusTab, () => { currentPage.value = 0; loadReviews() })
watch(currentPage, loadReviews)
onMounted(loadReviews)
</script>

<template>

  <div class="console-body">
    <div class="console-heading-row">
      <div class="console-page-heading">
        <h1>Review Queue</h1>
        <p>Found {{ totalElements }} events awaiting your final approval.</p>
      </div>
      <div class="console-segmented">
        <button type="button" :class="{ active: statusTab === 'Pending' }" @click="statusTab = 'Pending'">
          Pending
        </button>
        <button type="button" :class="{ active: statusTab === 'All' }" @click="statusTab = 'All'">
          All Status
        </button>
      </div>
    </div>

    <div class="console-card">
      <div class="console-card-header">
        <div style="display: flex; gap: 10px">
          <div class="console-filters-wrap">
            <button type="button" class="console-btn console-btn-outline console-btn-sm" @click="filtersOpen = !filtersOpen">
              <Icon name="filter" :size="14" /> Filters
            </button>
            <div v-if="filtersOpen" class="console-filters-popover">
              <span class="console-field-label">Priority</span>
              <label class="console-filter-check">
                <input v-model="priorityFilter.high" type="checkbox" />
                High Priority
              </label>
              <label class="console-filter-check">
                <input v-model="priorityFilter.standard" type="checkbox" />
                Standard
              </label>
              <button type="button" class="console-btn console-btn-primary console-btn-sm" style="justify-content: center; margin-top: 6px" @click="filtersOpen = false">
                Done
              </button>
            </div>
          </div>
          <button type="button" class="console-btn console-btn-outline console-btn-sm" @click="toggleSort">
            <Icon name="arrow-up-down" :size="14" /> {{ sortOrder === 'newest' ? 'Newest First' : 'Oldest First' }}
          </button>
        </div>
        <div class="console-legend">
          <span><i class="dot amber" /> High Priority</span>
          <span><i class="dot blue" /> Standard</span>
        </div>
      </div>

      <div class="console-table-scroll">
        <table class="console-table">
          <thead>
            <tr>
              <th>Event &amp; Category</th>
              <th>Admin / Organizer</th>
              <th>Date &amp; Location</th>
              <th>Participants</th>
              <th>Status</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in filtered" :key="event.id">
              <td>
                <div class="console-event-cell">
                  <span class="console-event-icon"><Icon :name="event.icon" :size="18" aria-hidden="true" /></span>
                  <div>
                    <div style="font-weight: 700">{{ event.name }}</div>
                    <div class="console-muted-sm">{{ event.category }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="console-event-cell">
                  <img :src="event.organizerAvatar" :alt="event.organizer" class="console-avatar" style="width: 30px; height: 30px" />
                  <div>
                    <div style="font-weight: 600">{{ event.organizer }}</div>
                    <div class="console-muted-sm">{{ event.organizerRole }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-weight: 600">{{ event.date }}</div>
                <div class="console-muted-sm">{{ event.location }}</div>
              </td>
              <td style="min-width: 140px">
                <div class="console-progress">
                  <div class="console-progress-bar" :style="{ width: (event.participants / event.max) * 100 + '%' }" />
                </div>
                <div class="console-muted-sm">{{ event.max.toLocaleString() }} max</div>
              </td>
              <td>
                <span
                  class="console-pill"
                  :class="{
                    'console-pill-amber': event.status === 'Pending Review',
                    'console-pill-green': event.status === 'Approved',
                    'console-pill-red': event.status === 'Rejected',
                  }"
                  >{{ event.status.toUpperCase() }}</span
                >
              </td>
              <td>
                <div style="display: flex; justify-content: flex-end; gap: 8px">
                  <button type="button" class="console-btn console-btn-outline console-btn-sm" @click="selectedEvent = event">
                    View Details
                  </button>
                  <button
                    type="button"
                    class="console-icon-btn success"
                    :disabled="event.status !== 'Pending Review'"
                  @click="decide(event, 'approve')"
                  >
                    <Icon name="check" :size="15" />
                  </button>
                  <button
                    type="button"
                    class="console-icon-btn reject"
                    :disabled="event.status !== 'Pending Review'"
                    @click="selectedEvent = event"
                  >
                    <Icon name="x" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="loading"><td colspan="6" style="text-align:center;padding:32px">Loading reviews...</td></tr>
            <tr v-else-if="!filtered.length">
              <td colspan="6" style="text-align: center; color: var(--console-text-muted); padding: 32px">
                No events to review.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="console-pagination">
      <span>Showing {{ filtered.length }} of {{ totalElements }} events</span>
      <div class="console-pagination-controls">
        <button type="button" class="console-icon-btn" :disabled="currentPage <= 0" @click="currentPage--">
          <Icon name="chevron-left" :size="15" />
        </button>
        <button type="button" class="console-page-num active">{{ currentPage + 1 }}</button>
        <button type="button" class="console-icon-btn" :disabled="currentPage + 1 >= totalPages" @click="currentPage++">
          <Icon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>
  </div>

  <EventDetailsModal
    :event="selectedEvent"
    @close="selectedEvent = null"
    @approve="(event, comment) => decide(event, 'approve', comment)"
    @reject="(event, comment) => decide(event, 'reject', comment)"
  />
</template>

<style scoped>
.console-legend {
  display: flex;
  gap: 16px;
  font-size: var(--console-fs-sm);
  color: var(--console-text-secondary);
  font-weight: 600;
}

.console-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.console-legend .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.console-legend .dot.amber {
  background: var(--console-warning);
}

.console-legend .dot.blue {
  background: var(--console-info);
}

.console-event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-event-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--console-primary-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--console-fs-lg);
  flex-shrink: 0;
}

.console-muted-sm {
  font-size: var(--console-fs-sm);
  color: var(--console-text-muted);
  margin-top: 2px;
}

.console-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--console-gray-bg);
  overflow: hidden;
  margin-bottom: 4px;
}

.console-progress-bar {
  height: 100%;
  background: var(--console-primary);
  border-radius: 999px;
}

.console-filters-wrap {
  position: relative;
}

.console-filters-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #fff;
  border: 1px solid var(--console-border);
  border-radius: var(--console-radius);
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.14);
  padding: 14px;
  width: 200px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.console-filter-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--console-fs-base);
  font-weight: 500;
  color: var(--console-text);
  cursor: pointer;
}

.console-filter-check input {
  accent-color: var(--console-primary);
}

.console-table {
  min-width: 980px;
}

@media (max-width: 768px) {
  .console-legend {
    width: 100%;
    flex-wrap: wrap;
  }

  .console-card-header > div:first-child {
    display: flex;
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
