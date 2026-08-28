<script setup>
import Sidebar from '@/components/admin/Sidebar.vue'
import PageTopbar from '@/components/super_admin/PageTopbar.vue'

import StatCard from '@/components/admin/StatCard.vue'
import EventFilter from '@/components/admin/EventFilter.vue'
import EventTable from '@/components/admin/EventTable.vue'

import { eventGroups } from '@/data/events'
</script>

<template>
  <div class="layout">
    <Sidebar />

    <div class="main">


      <PageTopbar title="All Events">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

      <section class="content">
        <div class="header">
          <div>
            <h1>All Events</h1>
            <p>Manage and track your assigned events and their approval status.</p>
          </div>

          <button class="create-btn">+ Create New Event</button>
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
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f7f9fc;
}
.main {
  flex: 1;
}
.content {
  padding: 32px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header h1 {
  font-size: 36px;
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
</style>