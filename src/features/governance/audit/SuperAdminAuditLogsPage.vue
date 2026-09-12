<script setup>
import { ref, computed } from 'vue'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import { auditLogs } from './auditLogData.js'

const search = ref('')
const filter = ref('All')
const currentPage = ref(1)

const logs = ref([...auditLogs])

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

const tonePill = { green: 'console-pill-green', amber: 'console-pill-amber', red: 'console-pill-red' }
</script>

<template>

  <div class="console-body">
    <div class="console-page-heading" style="margin-bottom: 20px">
      <h1>History Logs</h1>
      <p>Found {{ filtered.length }} revision events found.</p>
    </div>

    <div class="console-card">
      <div class="console-card-header">
        <h2>Revision History</h2>
        <div style="display: flex; gap: 10px">
          <div class="console-search">
            <Icon name="search" :size="15" />
            <input v-model="search" class="console-input" placeholder="Search activity" />
          </div>
          <select v-model="filter" class="console-select" style="width: auto">
            <option>All</option>
            <option>Registration</option>
            <option>Request</option>
            <option>Approval</option>
          </select>
        </div>
      </div>

      <ul class="console-log-list">
        <li v-for="log in filtered" :key="log.id" class="console-log-item">
          <img :src="log.avatar" :alt="log.name" class="console-avatar" />
          <div class="console-log-text">
            <p>
              <strong>{{ log.name }}</strong>
              {{ log.action }}
              <strong>{{ log.target }}</strong>
              <span v-if="log.suffix"> {{ log.suffix }}</span>
            </p>
            <span class="console-log-meta">{{ log.role }} · {{ log.time }}</span>
          </div>
          <span class="console-pill" :class="tonePill[log.tone]">{{ log.tag }}</span>
        </li>
        <li v-if="!filtered.length" class="console-log-empty">No activity matches your filters.</li>
      </ul>
    </div>

    <div class="console-pagination">
      <span>Showing 1 to {{ filtered.length }} of {{ logs.length }} revision events</span>
      <div class="console-pagination-controls">
        <button type="button" class="console-icon-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <Icon name="chevron-left" :size="15" />
        </button>
        <button type="button" class="console-page-num active">{{ currentPage }}</button>
        <button type="button" class="console-icon-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          <Icon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.console-log-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.console-log-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--console-border-soft);
}

.console-log-item:last-child {
  border-bottom: none;
}

.console-log-text {
  flex: 1;
  min-width: 0;
}

.console-log-text p {
  margin: 0 0 3px;
  font-size: var(--console-fs-base);
  color: var(--console-text);
  font-weight: 400;
}

.console-log-meta {
  font-size: var(--console-fs-sm);
  color: var(--console-text-muted);
}

.console-log-empty {
  padding: 32px;
  text-align: center;
  color: var(--console-text-muted);
  font-size: var(--console-fs-base);
}

@media (max-width: 600px) {
  .console-card-header > div {
    display: grid !important;
    width: 100%;
    grid-template-columns: 1fr;
  }

  .console-card-header .console-select {
    width: 100% !important;
  }

  .console-log-item {
    align-items: flex-start;
    padding-inline: 16px;
  }
}

@media (max-width: 420px) {
  .console-log-item {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
  }

  .console-log-item > .console-pill {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
