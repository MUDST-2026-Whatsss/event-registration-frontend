<script setup>
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

defineProps({
  open: { type: Boolean, default: false },
  request: { type: Object, default: null },
})

defineEmits(['close', 'approve', 'reject'])
</script>

<template>
<Transition name="modal">
  <div
    v-if="open && request"
    class="modal-backdrop"
    @click.self="$emit('close')"
  >

    <div class="review-modal">

      <!-- Header -->
      <div class="modal-header">

        <div>
          <span class="modal-eyebrow">
            Change Request
          </span>

          <h2>
            {{ request.eventName }}
          </h2>
        </div>

        <button
          class="modal-close"
          @click="$emit('close')"
        >
          <Icon
            name="x"
            :size="17"
          />
        </button>

      </div>

      <!-- Requester -->
      <div class="modal-requester">

        <img
          :src="request.avatar"
          :alt="request.submittedBy"
          class="modal-avatar"
        />

        <div>
          <strong>
            {{ request.submittedBy }}
          </strong>

          <span>
            {{ request.role }}
            · Submitted {{ request.submitted }}
          </span>
        </div>

      </div>

      <!-- Changes -->
      <div class="changes-section">

        <h3>
          Requested Changes
        </h3>

        <div class="changes-table">

          <div class="change-table-header">
            <span>Field</span>
            <span>Current</span>
            <span>Requested</span>
          </div>

          <div
            v-for="change in request.changes"
            :key="change.field"
            class="change-table-row"
          >
            <strong>
              {{ change.field }}
            </strong>

            <span class="old-value">
              {{ change.oldValue }}
            </span>

            <span class="new-value">
              {{ change.newValue }}
            </span>
          </div>

        </div>

      </div>

      <!-- Actions -->
      <div class="modal-actions">

        <button
          class="console-btn console-btn-secondary"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          class="console-btn reject-btn"
          @click="$emit('reject')"
        >
          <Icon
            name="x"
            :size="14"
          />

          Reject
        </button>

        <button
          class="console-btn console-btn-primary"
          @click="$emit('approve')"
        >
          <Icon
            name="check"
            :size="14"
          />

          Approve Change
        </button>

      </div>

    </div>

  </div>
</Transition>
</template>

<style scoped>
.changes-table {
  overflow: hidden;

  border: 1px solid var(--console-border);

  border-radius: 8px;
}
.change-table-header,
.change-table-row {
  display: grid;

  grid-template-columns:
    1fr
    1fr
    1fr;

  gap: 12px;

  padding: 10px 12px;
}
.change-table-header {
  color: var(--console-text-muted);

  background: var(--console-gray-bg);

  font-size: var(--console-fs-2xs);
  font-weight: 600;
}
.change-table-row {
  display: grid;

  grid-template-columns:
    1fr
    1fr
    1fr;

  gap: 12px;

  padding: 10px 12px;
}
.change-table-row {
  border-top: 1px solid var(--console-border-soft);

  font-size: var(--console-fs-2xs);
}
.change-table-row strong {
  color: var(--console-text);
}
.changes-section {
  padding: 18px 22px;
}
.changes-section h3 {
  margin: 0 0 10px;

  color: var(--console-text);

  font-size: var(--console-fs-xs);
}
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 8px;

  padding: 14px 22px;

  border-top: 1px solid var(--console-border-soft);
}
.modal-avatar {
  width: 34px;
  height: 34px;

  object-fit: cover;

  border-radius: 50%;
}
.modal-requester {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 15px 22px;

  background: #fafbfc;
}
.modal-requester div {
  display: flex;
  flex-direction: column;

  gap: 3px;
}
.modal-requester strong {
  color: var(--console-text);

  font-size: var(--console-fs-2xs);
}
.modal-requester span {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}
.new-value {
  color: var(--console-primary);

  font-weight: 600;
}
.old-value {
  color: var(--console-text-secondary);
}
.reject-btn {
  color: var(--console-danger) !important;

  border: 1px solid #ffd3d3 !important;

  background: #fff !important;
}
.reject-btn:hover {
  background: #fff5f5 !important;
}

.review-modal {
  width: min(650px, 100%);

  overflow: hidden;

  border: 1px solid var(--console-border);

  border-radius: 12px;

  background: #fff;

  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.18);
}

@media (max-width: 600px) {
  .changes-table {
    overflow-x: auto;
  }

  .change-table-header,
  .change-table-row {
    min-width: 520px;
  }

  .changes-section,
  .modal-requester,
  .modal-actions {
    padding-inline: 16px;
  }

  .modal-actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .modal-actions .console-btn {
    justify-content: center;
    width: 100%;
  }
}
</style>
