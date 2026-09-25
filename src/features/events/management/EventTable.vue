<script setup>
import EventRow from './EventRow.vue'



defineProps({
  events: { type: Array, default: () => [] },
  page: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
})
defineEmits(['page', 'edit', 'cancel', 'withdraw'])
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

    <div class="pagination">
      <span>Page {{ totalPages ? page + 1 : 0 }} of {{ totalPages }}</span>

      <div class="pages">
        <button type="button" :disabled="page === 0" @click="$emit('page', page - 1)">Previous</button>
        <button type="button" :disabled="page + 1 >= totalPages" @click="$emit('page', page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table {
  width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid #e7edf5;
  border-top: none;
  border-radius: 0 0 18px 18px;
}
.head {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 120px;
  padding: 18px 22px;
  font-size: var(--console-fs-sm);
  color: #64748b;
  border-bottom: 1px solid #eef2f7;
  min-width: 860px;
}
.pagination {
  display: flex;
  justify-content: space-between;
  padding: 18px 22px;
  min-width: 860px;
}
.pages {
  display: flex;
  gap: 10px;
}
.empty-row { padding: 36px 22px; color: #64748b; text-align: center; }
.active {
  background: #2563eb;
  color: white;
}

@media (max-width: 768px) {
  .head,
  .pagination {
    padding-inline: 16px;
  }
}
</style>
