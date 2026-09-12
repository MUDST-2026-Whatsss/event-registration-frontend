<script setup>
import EventRow from './EventRow.vue'



defineProps({
  events: Array
})
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
      :key="event.id"
      :event="event"
    />

    <div class="pagination">
      <span>Page 1 of 2</span>

      <div class="pages">
        <button class="active">1</button>
        <button>2</button>
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
