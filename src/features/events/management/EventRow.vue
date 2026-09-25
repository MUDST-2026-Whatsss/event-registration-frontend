<script setup>
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import StatusBadge from './StatusBadge.vue'



defineProps({
  event: Object
})
defineEmits(['edit', 'cancel', 'withdraw'])
</script>

<template>
  <div class="row">

    <!-- Event Details -->
    <div class="info">
      <div class="event-image">
        <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.title" />
        <Icon v-else name="image" :size="22" aria-hidden="true" />
      </div>

      <div>
        <h4>{{ event.title }}</h4>
        <p>{{ event.location }}</p>
      </div>
    </div>

    <!-- Date -->
    <div class="date">
      {{ new Date(event.startAt).toLocaleString() }}
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
      <button
        v-if="['DRAFT', 'REJECTED', 'PUBLISHED'].includes(event.status)"
        type="button"
        :title="event.status === 'PUBLISHED' ? 'Request event changes' : 'Edit event'"
        :aria-label="event.status === 'PUBLISHED' ? 'Request event changes' : 'Edit event'"
        @click="$emit('edit', event)"
      ><Icon name="pencil" :size="17" /></button>
      <button
        v-if="event.status === 'PENDING_REVIEW'"
        type="button"
        title="Withdraw review"
        aria-label="Withdraw review"
        @click="$emit('withdraw', event)"
      ><Icon name="undo" :size="17" /></button>
      <button
        v-if="!['CANCELLED', 'COMPLETED'].includes(event.status)"
        type="button"
        title="Cancel event"
        aria-label="Cancel event"
        @click="$emit('cancel', event)"
      ><Icon name="x" :size="17" /></button>
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
.event-image img { width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }

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
  display: inline-grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: var(--console-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease;
}
.actions button:hover { color: var(--console-primary); background: var(--console-primary-soft); border-color: var(--console-border); }

@media (max-width: 768px) {
  .row {
    padding-inline: 16px;
  }
}
</style>
