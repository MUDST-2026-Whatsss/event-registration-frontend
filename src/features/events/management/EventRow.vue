<script setup>
import StatusBadge from './StatusBadge.vue'



defineProps({
  event: Object
})
</script>

<template>
  <div class="row">

    <!-- Event Details -->
    <div class="info">
      <div class="event-image">
        <span>🖼️</span>
      </div>

      <div>
        <h4>{{ event.title }}</h4>
        <p>{{ event.location }}</p>
      </div>
    </div>

    <!-- Date -->
    <div class="date">
      {{ event.date }}
    </div>

    <!-- Registrations -->
    <div class="registration">
      <div>{{ event.registration }}</div>

      <div
        v-if="event.progress > 0"
        class="bar"
      >
        <div
          class="fill"
          :style="{ width: event.progress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Status -->
    <div class="status">
      <StatusBadge :status="event.status" />
    </div>

    <!-- Actions -->
    <div class="actions">
      <button>✏️</button>
      <button>🗑️</button>
    </div>

  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 120px;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  min-width: 860px;
}

.info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.event-image {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info h4 {
  margin: 0 0 5px;
  font-size: var(--console-fs-md);
}

.info p {
  margin: 0;
  color: #64748b;
  font-size: var(--console-fs-base);
}

.date {
  color: #334155;
  font-size: var(--console-fs-md);
}

.registration {
  font-size: var(--console-fs-base);
  color: #475569;
}

.bar {
  width: 120px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 10px;
  margin-top: 6px;
}

.fill {
  height: 100%;
  background: #22c55e;
  border-radius: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: var(--console-fs-lg);
}

@media (max-width: 768px) {
  .row {
    padding-inline: 16px;
  }
}
</style>
