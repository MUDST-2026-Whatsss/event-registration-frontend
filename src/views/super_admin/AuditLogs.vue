<script setup>
import { ref, computed } from 'vue'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'

const search = ref('')
const filter = ref('All')
const currentPage = ref(1)

const logs = ref([
  {
    id: 1,
    avatar: 'https://i.pravatar.cc/64?img=32',
    name: 'Daniel Brooks',
    role: 'Organizer',
    action: 'approved 42 registrations for',
    target: 'Summer Music Festival',
    time: '2 min ago',
    tag: 'Registration',
    tone: 'green',
  },
  {
    id: 2,
    avatar: 'https://i.pravatar.cc/64?img=48',
    name: 'Megan Okafor',
    role: 'Coordinator',
    action: 'submitted a change request for',
    target: 'DevCon Tech Summit',
    time: '18 min ago',
    tag: 'Request',
    tone: 'amber',
  },
  {
    id: 3,
    avatar: 'https://i.pravatar.cc/64?img=25',
    name: 'Priya Nair',
    role: 'Moderator',
    action: 'rejected a late registration for',
    target: 'Art & Design Workshop',
    time: '51 min ago',
    tag: 'Approval',
    tone: 'red',
  },
  {
    id: 4,
    avatar: 'https://i.pravatar.cc/64?img=13',
    name: 'Tom Halvorsen',
    role: 'Organizer',
    action: 'marked',
    target: 'Marathon & Fitness Day',
    suffix: 'as Full',
    time: '1 hr ago',
    tag: 'Registration',
    tone: 'green',
  },
  {
    id: 5,
    avatar: 'https://i.pravatar.cc/64?img=45',
    name: 'Lena Fischer',
    role: 'Coordinator',
    action: 'exported the attendee list for',
    target: 'Annual Gala Dinner',
    time: '2 hrs ago',
    tag: 'Registration',
    tone: 'green',
  },
])

const filtered = computed(() =>
  logs.value.filter((log) => {
    const matchesFilter = filter.value === 'All' || log.tag === filter.value
    const q = search.value.toLowerCase()
    const matchesSearch =
      !q ||
      log.name.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  }),
)

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 10)))

const tonePill = { green: 'sa-pill-green', amber: 'sa-pill-amber', red: 'sa-pill-red' }
</script>

<template>
  <PageTopbar title="Audit Logs">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <div class="sa-body">
    <div class="sa-page-heading" style="margin-bottom: 20px">
      <h1>History Logs</h1>
      <p>Found {{ filtered.length }} revision events found.</p>
    </div>

    <div class="sa-card">
      <div class="sa-card-header">
        <h2>Revision History</h2>
        <div style="display: flex; gap: 10px">
          <div class="sa-search">
            <Icon name="search" :size="15" />
            <input v-model="search" class="sa-input" placeholder="Search activity" />
          </div>
          <select v-model="filter" class="sa-select" style="width: auto">
            <option>All</option>
            <option>Registration</option>
            <option>Request</option>
            <option>Approval</option>
          </select>
        </div>
      </div>

      <ul class="sa-log-list">
        <li v-for="log in filtered" :key="log.id" class="sa-log-item">
          <img :src="log.avatar" :alt="log.name" class="sa-avatar" />
          <div class="sa-log-text">
            <p>
              <strong>{{ log.name }}</strong>
              {{ log.action }}
              <strong>{{ log.target }}</strong>
              <span v-if="log.suffix"> {{ log.suffix }}</span>
            </p>
            <span class="sa-log-meta">{{ log.role }} · {{ log.time }}</span>
          </div>
          <span class="sa-pill" :class="tonePill[log.tone]">{{ log.tag }}</span>
        </li>
        <li v-if="!filtered.length" class="sa-log-empty">No activity matches your filters.</li>
      </ul>
    </div>

    <div class="sa-pagination">
      <span>Showing 1 to {{ filtered.length }} of {{ logs.length }} revision events</span>
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
</template>

<style scoped>
.sa-log-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sa-log-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--sa-border-soft);
}

.sa-log-item:last-child {
  border-bottom: none;
}

.sa-log-text {
  flex: 1;
  min-width: 0;
}

.sa-log-text p {
  margin: 0 0 3px;
  font-size: 13.5px;
  color: var(--sa-text);
  font-weight: 400;
}

.sa-log-meta {
  font-size: 12px;
  color: var(--sa-text-muted);
}

.sa-log-empty {
  padding: 32px;
  text-align: center;
  color: var(--sa-text-muted);
  font-size: 13.5px;
}
</style>
