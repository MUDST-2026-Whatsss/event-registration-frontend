<script setup>
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

const props = defineProps({
  event: { type: Object, default: null },
})

const emit = defineEmits(['close', 'approve', 'reject'])
</script>

<template>
  <div v-if="event" class="console-modal-overlay" @click.self="emit('close')">
    <div class="console-modal console-details-modal">
      <div class="console-details-header">
        <div class="console-event-cell">
          <span class="console-event-icon">{{ event.icon }}</span>
          <div>
            <div class="console-details-title">{{ event.name }}</div>
            <div class="console-muted-sm">{{ event.category }}</div>
          </div>
        </div>
        <button type="button" class="console-icon-btn" @click="emit('close')">
          <Icon name="x" :size="15" />
        </button>
      </div>

      <div class="console-details-body">
        <div class="console-details-row">
          <span class="console-field-label">Organizer</span>
          <div class="console-event-cell">
            <img :src="event.organizerAvatar" :alt="event.organizer" class="console-avatar" style="width: 30px; height: 30px" />
            <div>
              <div style="font-weight: 600">{{ event.organizer }}</div>
              <div class="console-muted-sm">{{ event.organizerRole }}</div>
            </div>
          </div>
        </div>

        <div class="console-details-grid">
          <div>
            <span class="console-field-label">Date</span>
            <div>{{ event.date }}</div>
          </div>
          <div>
            <span class="console-field-label">Location</span>
            <div>{{ event.location }}</div>
          </div>
        </div>

        <div>
          <span class="console-field-label">Participants</span>
          <div class="console-progress">
            <div class="console-progress-bar" :style="{ width: (event.participants / event.max) * 100 + '%' }" />
          </div>
          <div class="console-muted-sm">{{ event.participants.toLocaleString() }} / {{ event.max.toLocaleString() }} registered</div>
        </div>

        <div class="console-details-grid">
          <div>
            <span class="console-field-label">Priority</span>
            <span class="console-pill" :class="event.priority === 'high' ? 'console-pill-amber' : 'console-pill-blue'">
              {{ event.priority === 'high' ? 'High Priority' : 'Standard' }}
            </span>
          </div>
          <div>
            <span class="console-field-label">Status</span>
            <span
              class="console-pill"
              :class="{
                'console-pill-amber': event.status === 'Pending Review',
                'console-pill-green': event.status === 'Approved',
                'console-pill-red': event.status === 'Rejected',
              }"
              >{{ event.status.toUpperCase() }}</span
            >
          </div>
        </div>
      </div>

      <div class="console-details-footer">
        <button type="button" class="console-btn console-btn-outline" style="flex: 1; justify-content: center" @click="emit('close')">
          Close
        </button>
        <button
          type="button"
          class="console-btn console-btn-outline"
          style="flex: 1; justify-content: center; color: var(--console-danger); border-color: #fbcaca"
          :disabled="event.status !== 'Pending Review'"
          @click="emit('reject', event)"
        >
          Reject
        </button>
        <button
          type="button"
          class="console-btn console-btn-primary"
          style="flex: 1; justify-content: center"
          :disabled="event.status !== 'Pending Review'"
          @click="emit('approve', event)"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.console-details-modal {
  max-width: 440px;
  text-align: left;
}

.console-details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--console-border-soft);
}

.console-details-title {
  font-weight: 700;
  font-size: var(--console-fs-md);
}

.console-event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-event-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--console-primary-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--console-fs-lg);
  flex-shrink: 0;
}

.console-muted-sm {
  font-size: var(--console-fs-sm);
  color: var(--console-text-muted);
  margin-top: 2px;
}

.console-details-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: var(--console-fs-base);
}

.console-details-row .console-field-label {
  margin-bottom: 6px;
}

.console-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.console-details-grid .console-field-label {
  margin-bottom: 6px;
}

.console-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--console-gray-bg);
  overflow: hidden;
  margin: 4px 0;
}

.console-progress-bar {
  height: 100%;
  background: var(--console-primary);
  border-radius: 999px;
}

.console-details-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--console-border-soft);
}

@media (max-width: 480px) {
  .console-details-grid {
    grid-template-columns: 1fr;
  }

  .console-details-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .console-details-footer .console-btn {
    justify-content: center;
    width: 100%;
  }
}
</style>
