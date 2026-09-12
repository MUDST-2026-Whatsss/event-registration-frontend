<script setup>
import { useRouter } from 'vue-router'


import StatCard from './StatCard.vue'
import EventFilter from './EventFilter.vue'
import EventTable from './EventTable.vue'


import { eventGroups } from '@/features/events/public.js'

const router = useRouter()

const statusByEventStatus = {
  open: 'Published',
  'almost-full': 'Published',
  closed: 'Published',
  upcoming: 'Pending',
}

const events = eventGroups.flatMap((group) =>
  group.events.map((event) => {
    const filled = event.filledSpots ?? 0
    const total = event.totalSpots ?? 0
    return {
      ...event,
      status: statusByEventStatus[event.status] ?? 'Draft',
      registration: total ? `${filled} / ${total}` : '—',
      progress: total ? Math.round((filled / total) * 100) : 0,
    }
  }),
)

function goToCreate() {
  router.push('/admin/create-event')
}
</script>

<template>

  <section class="content">
        <div class="header">
          <div>
            <h1>All Events</h1>
            <p>Manage and track your assigned events and their approval status.</p>
          </div>

          <button class="create-btn" @click="goToCreate">+ Create New Event</button>
        </div>

        <div class="stats">
          <StatCard title="TOTAL EVENTS" value="12" />
          <StatCard title="PUBLISHED" value="8" color="green" />
          <StatCard title="PENDING REVIEW" value="3" color="orange" />
          <StatCard title="REJECTED" value="1" color="red" />
        </div>

        <EventFilter />

        <EventTable :events="events" />
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
