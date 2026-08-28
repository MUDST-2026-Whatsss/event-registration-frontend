<script setup>
import { ref, computed } from 'vue'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'
import EventDetailsModal from '../../components/super_admin/EventDetailsModal.vue'

const statusTab = ref('Pending')
const sortOrder = ref('newest')
const filtersOpen = ref(false)
const priorityFilter = ref({ high: true, standard: true })
const selectedEvent = ref(null)
const currentPage = ref(1)

const events = ref([
  {
    id: 1,
    icon: '🎵',
    name: 'Summer Music Festival 2026',
    category: 'Entertainment & Arts',
    organizerAvatar: 'https://i.pravatar.cc/64?img=5',
    organizer: 'Dana Whitfield',
    organizerRole: 'Event Admin',
    date: 'Aug 14, 2026',
    dateISO: '2026-08-14',
    location: 'Central Park, NYC',
    participants: 6200,
    max: 8000,
    status: 'Pending Review',
    priority: 'high',
  },
  {
    id: 2,
    icon: '⚙️',
    name: 'AI & Future of Work Summit',
    category: 'Technology',
    organizerAvatar: 'https://i.pravatar.cc/64?img=9',
    organizer: 'Priya Nair',
    organizerRole: 'Sr. Coordinator',
    date: 'Sep 03, 2026',
    dateISO: '2026-09-03',
    location: 'Moscone Center, SF',
    participants: 1150,
    max: 2400,
    status: 'Pending Review',
    priority: 'standard',
  },
])

const filtered = computed(() => {
  let list = events.value.filter((e) =>
    statusTab.value === 'Pending' ? e.status === 'Pending Review' : true,
  )
  list = list.filter((e) => (e.priority === 'high' ? priorityFilter.value.high : priorityFilter.value.standard))
  list = [...list].sort((a, b) =>
    sortOrder.value === 'newest'
      ? new Date(b.dateISO) - new Date(a.dateISO)
      : new Date(a.dateISO) - new Date(b.dateISO),
  )
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 10)))

function approve(event) {
  event.status = 'Approved'
}

function reject(event) {
  event.status = 'Rejected'
}

function approveFromModal(event) {
  approve(event)
  selectedEvent.value = null
}

function rejectFromModal(event) {
  reject(event)
  selectedEvent.value = null
}

function toggleSort() {
  sortOrder.value = sortOrder.value === 'newest' ? 'oldest' : 'newest'
}
</script>

<template>
  <PageTopbar title="Event Approvals">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <div class="sa-body">
    <div class="sa-heading-row">
      <div class="sa-page-heading">
        <h1>Review Queue</h1>
        <p>Found {{ filtered.length }} events awaiting your final approval.</p>
      </div>
      <div class="sa-segmented">
        <button type="button" :class="{ active: statusTab === 'Pending' }" @click="statusTab = 'Pending'">
          Pending
        </button>
        <button type="button" :class="{ active: statusTab === 'All' }" @click="statusTab = 'All'">
          All Status
        </button>
      </div>
    </div>

    <div class="sa-card">
      <div class="sa-card-header">
        <div style="display: flex; gap: 10px">
          <div class="sa-filters-wrap">
            <button type="button" class="sa-btn sa-btn-outline sa-btn-sm" @click="filtersOpen = !filtersOpen">
              <Icon name="filter" :size="14" /> Filters
            </button>
            <div v-if="filtersOpen" class="sa-filters-popover">
              <span class="sa-field-label">Priority</span>
              <label class="sa-filter-check">
                <input v-model="priorityFilter.high" type="checkbox" />
                High Priority
              </label>
              <label class="sa-filter-check">
                <input v-model="priorityFilter.standard" type="checkbox" />
                Standard
              </label>
              <button type="button" class="sa-btn sa-btn-primary sa-btn-sm" style="justify-content: center; margin-top: 6px" @click="filtersOpen = false">
                Done
              </button>
            </div>
          </div>
          <button type="button" class="sa-btn sa-btn-outline sa-btn-sm" @click="toggleSort">
            <Icon name="arrow-up-down" :size="14" /> {{ sortOrder === 'newest' ? 'Newest First' : 'Oldest First' }}
          </button>
        </div>
        <div class="sa-legend">
          <span><i class="dot amber" /> High Priority</span>
          <span><i class="dot blue" /> Standard</span>
        </div>
      </div>

      <div class="sa-table-scroll">
        <table class="sa-table">
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
                <div class="sa-event-cell">
                  <span class="sa-event-icon">{{ event.icon }}</span>
                  <div>
                    <div style="font-weight: 700">{{ event.name }}</div>
                    <div class="sa-muted-sm">{{ event.category }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="sa-event-cell">
                  <img :src="event.organizerAvatar" :alt="event.organizer" class="sa-avatar" style="width: 30px; height: 30px" />
                  <div>
                    <div style="font-weight: 600">{{ event.organizer }}</div>
                    <div class="sa-muted-sm">{{ event.organizerRole }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-weight: 600">{{ event.date }}</div>
                <div class="sa-muted-sm">{{ event.location }}</div>
              </td>
              <td style="min-width: 140px">
                <div class="sa-progress">
                  <div class="sa-progress-bar" :style="{ width: (event.participants / event.max) * 100 + '%' }" />
                </div>
                <div class="sa-muted-sm">{{ event.max.toLocaleString() }} max</div>
              </td>
              <td>
                <span
                  class="sa-pill"
                  :class="{
                    'sa-pill-amber': event.status === 'Pending Review',
                    'sa-pill-green': event.status === 'Approved',
                    'sa-pill-red': event.status === 'Rejected',
                  }"
                  >{{ event.status.toUpperCase() }}</span
                >
              </td>
              <td>
                <div style="display: flex; justify-content: flex-end; gap: 8px">
                  <button type="button" class="sa-btn sa-btn-outline sa-btn-sm" @click="selectedEvent = event">
                    View Details
                  </button>
                  <button
                    type="button"
                    class="sa-icon-btn success"
                    :disabled="event.status !== 'Pending Review'"
                    @click="approve(event)"
                  >
                    <Icon name="check" :size="15" />
                  </button>
                  <button
                    type="button"
                    class="sa-icon-btn reject"
                    :disabled="event.status !== 'Pending Review'"
                    @click="reject(event)"
                  >
                    <Icon name="x" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" style="text-align: center; color: var(--sa-text-muted); padding: 32px">
                No events to review.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="sa-pagination">
      <span>Showing 1 to {{ filtered.length }} of {{ filtered.length }} pending events</span>
      <div class="sa-pagination-controls">
        <button type="button" class="sa-icon-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <Icon name="chevron-left" :size="15" />
        </button>
        <button type="button" class="sa-page-num active">{{ currentPage }}</button>
        <button type="button" class="sa-icon-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          <Icon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>
  </div>

  <EventDetailsModal
    :event="selectedEvent"
    @close="selectedEvent = null"
    @approve="approveFromModal"
    @reject="rejectFromModal"
  />
</template>

<style scoped>
.sa-legend {
  display: flex;
  gap: 16px;
  font-size: 12.5px;
  color: var(--sa-text-secondary);
  font-weight: 600;
}

.sa-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sa-legend .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.sa-legend .dot.amber {
  background: var(--sa-warning);
}

.sa-legend .dot.blue {
  background: var(--sa-info);
}

.sa-event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-event-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--sa-primary-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.sa-muted-sm {
  font-size: 12px;
  color: var(--sa-text-muted);
  margin-top: 2px;
}

.sa-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--sa-gray-bg);
  overflow: hidden;
  margin-bottom: 4px;
}

.sa-progress-bar {
  height: 100%;
  background: var(--sa-primary);
  border-radius: 999px;
}

.sa-filters-wrap {
  position: relative;
}

.sa-filters-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #fff;
  border: 1px solid var(--sa-border);
  border-radius: var(--sa-radius);
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.14);
  padding: 14px;
  width: 200px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sa-filter-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sa-text);
  cursor: pointer;
}

.sa-filter-check input {
  accent-color: var(--sa-primary);
}
</style>
