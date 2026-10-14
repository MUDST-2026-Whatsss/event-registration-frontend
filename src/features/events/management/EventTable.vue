<script setup>
import EventRow from './EventRow.vue'
import { ConsolePagination } from '@/features/console-shell/public.js'



defineProps({
  events: { type: Array, default: () => [] },
  page: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  totalElements: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
})
defineEmits(['page', 'page-size', 'edit', 'cancel', 'withdraw'])
</script>

<template>
  <div class="table">
    <div class="head">
      <span>EVENT DETAILS</span>
      <span>DATE</span>
      <span>REGISTRATIONS</span>
      <span>STATUS</span>
      <span>ACTIONS</span>
    </div>

    <EventRow
      v-for="event in events"
      :key="event.eventId"
      :event="event"
      @edit="$emit('edit', $event)"
      @cancel="$emit('cancel', $event)"
      @withdraw="$emit('withdraw', $event)"
    />

    <div v-if="events.length === 0" class="empty-row">No events found.</div>

    <ConsolePagination
      :page="page"
      :page-size="pageSize"
      :total-elements="totalElements"
      :total-pages="totalPages"
      :loading="loading"
      item-label="events"
      @page="$emit('page', $event)"
      @page-size="$emit('page-size', $event)"
    />
  </div>
</template>

<style scoped>
.table {
  width: 100%;
  overflow-x: auto;
  background: white;
}
.head {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 120px;
  padding: 13px 18px;
  color: var(--console-text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .06em;
  border-bottom: 1px solid #eef2f7;
  min-width: 860px;
}
.table :deep(.console-pagination) { min-width: 860px; padding: 13px 18px; }
.empty-row { padding: 36px 22px; color: #64748b; text-align: center; }
.active {
  background: #2563eb;
  color: white;
}

@media (max-width: 768px) {
  .head,
  .table :deep(.console-pagination) {
    padding-inline: 16px;
  }
}
</style>
