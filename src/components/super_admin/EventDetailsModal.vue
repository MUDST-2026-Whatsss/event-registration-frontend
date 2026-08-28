<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  event: { type: Object, default: null },
})

const emit = defineEmits(['close', 'approve', 'reject'])
</script>

<template>
  <div v-if="event" class="sa-modal-overlay" @click.self="emit('close')">
    <div class="sa-modal sa-details-modal">
      <div class="sa-details-header">
        <div class="sa-event-cell">
          <span class="sa-event-icon">{{ event.icon }}</span>
          <div>
            <div class="sa-details-title">{{ event.name }}</div>
            <div class="sa-muted-sm">{{ event.category }}</div>
          </div>
        </div>
        <button type="button" class="sa-icon-btn" @click="emit('close')">
          <Icon name="x" :size="15" />
        </button>
      </div>

      <div class="sa-details-body">
        <div class="sa-details-row">
          <span class="sa-field-label">Organizer</span>
          <div class="sa-event-cell">
            <img :src="event.organizerAvatar" :alt="event.organizer" class="sa-avatar" style="width: 30px; height: 30px" />
            <div>
              <div style="font-weight: 600">{{ event.organizer }}</div>
              <div class="sa-muted-sm">{{ event.organizerRole }}</div>
            </div>
          </div>
        </div>

        <div class="sa-details-grid">
          <div>
            <span class="sa-field-label">Date</span>
            <div>{{ event.date }}</div>
          </div>
          <div>
            <span class="sa-field-label">Location</span>
            <div>{{ event.location }}</div>
          </div>
        </div>

        <div>
          <span class="sa-field-label">Participants</span>
          <div class="sa-progress">
            <div class="sa-progress-bar" :style="{ width: (event.participants / event.max) * 100 + '%' }" />
          </div>
          <div class="sa-muted-sm">{{ event.participants.toLocaleString() }} / {{ event.max.toLocaleString() }} registered</div>
        </div>

        <div class="sa-details-grid">
          <div>
            <span class="sa-field-label">Priority</span>
            <span class="sa-pill" :class="event.priority === 'high' ? 'sa-pill-amber' : 'sa-pill-blue'">
              {{ event.priority === 'high' ? 'High Priority' : 'Standard' }}
            </span>
          </div>
          <div>
            <span class="sa-field-label">Status</span>
            <span
              class="sa-pill"
              :class="{
                'sa-pill-amber': event.status === 'Pending Review',
                'sa-pill-green': event.status === 'Approved',
                'sa-pill-red': event.status === 'Rejected',
              }"
              >{{ event.status.toUpperCase() }}</span
            >
          </div>
        </div>
      </div>

      <div class="sa-details-footer">
        <button type="button" class="sa-btn sa-btn-outline" style="flex: 1; justify-content: center" @click="emit('close')">
          Close
        </button>
        <button
          type="button"
          class="sa-btn sa-btn-outline"
          style="flex: 1; justify-content: center; color: var(--sa-danger); border-color: #fbcaca"
          :disabled="event.status !== 'Pending Review'"
          @click="emit('reject', event)"
        >
          Reject
        </button>
        <button
          type="button"
          class="sa-btn sa-btn-primary"
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
.sa-details-modal {
  max-width: 440px;
  text-align: left;
}

.sa-details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sa-border-soft);
}

.sa-details-title {
  font-weight: 700;
  font-size: 15px;
}

.sa-event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-event-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--sa-primary-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.sa-muted-sm {
  font-size: 12px;
  color: var(--sa-text-muted);
  margin-top: 2px;
}

.sa-details-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 13.5px;
}

.sa-details-row .sa-field-label {
  margin-bottom: 6px;
}

.sa-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sa-details-grid .sa-field-label {
  margin-bottom: 6px;
}

.sa-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--sa-gray-bg);
  overflow: hidden;
  margin: 4px 0;
}

.sa-progress-bar {
  height: 100%;
  background: var(--sa-primary);
  border-radius: 999px;
}

.sa-details-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--sa-border-soft);
}
</style>
