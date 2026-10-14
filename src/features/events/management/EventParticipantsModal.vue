<script setup>
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

defineProps({
  open: { type: Boolean, default: false },
  event: { type: Object, default: null },
  isFreeEvent: { type: Function, required: true },
})

defineEmits(['close'])
</script>

<template>
<Transition name="modal">

  <div
    v-if="open && event"
    class="modal-backdrop"
    @click.self="$emit('close')"
  >

    <div class="participants-modal">

      <div class="modal-header">

        <div>

          <span class="modal-eyebrow">
            Event Participants
          </span>

          <h2>
            {{ event.name }}
          </h2>

          <p>
            Showing
            {{ event.registrations }}
            registered participants
          </p>

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


      <div class="participant-table-wrapper">

        <table class="participant-table">

          <thead>

            <tr>

              <th>
                USER NAME
              </th>

              <th>
                EMAIL
              </th>

              <th>
                TEL.
              </th>

              <th>
                PAYMENT STATUS
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="
                participant in event.participants
              "
              :key="participant.id"
            >

              <td>
                {{ participant.name }}
              </td>

              <td>
                {{ participant.email }}
              </td>

              <td>
                {{ participant.tel }}
              </td>

              <td>

                <span
                  v-if="isFreeEvent(event)"
                  class="payment-status free"
                >
                  No Payment Required
                </span>

                <span
                  v-else
                  class="payment-status"
                  :class="
                    participant.payment.toLowerCase()
                  "
                >
                  {{ participant.payment }}
                </span>

              </td>

            </tr>


            <tr
              v-if="
                event.participants.length === 0
              "
            >

              <td
                colspan="4"
                class="participant-empty"
              >
                No participant data available.
              </td>

            </tr>

          </tbody>

        </table>

      </div>


      <div class="modal-footer">

        <span>
          Page 1 of 2
        </span>

        <div class="pagination">

          <button class="page-btn">

            <Icon
              name="chevron-left"
              :size="13"
            />

          </button>

          <button class="page-btn active">
            1
          </button>

          <button class="page-btn">
            2
          </button>

          <button class="page-btn">

            <Icon
              name="chevron-right"
              :size="13"
            />

          </button>

        </div>

      </div>

    </div>

  </div>

</Transition>
</template>

<style scoped>

/* =========================================================
   PARTICIPANTS MODAL
========================================================= */

.participants-modal {
  width: min(820px, 100%);

  overflow: hidden;

  border: 1px solid var(--console-border);

  border-radius: 12px;

  background: #fff;

  box-shadow:
    0 22px 60px rgba(15, 23, 42, 0.18);
}

.participant-table-wrapper {
  max-height: 360px;

  overflow: auto;
  min-width: 0;
  max-width: 100%;
}

.participant-table {
  width: 100%;

  border-collapse: collapse;
}

.participant-table th {
  height: 39px;

  padding: 0 14px;

  color: #8b99ae;

  background: #fafbfc;

  font-size: var(--console-fs-2xs);

  text-align: left;
}

.participant-table td {
  height: 54px;

  padding: 0 14px;

  border-top: 1px solid var(--console-border-soft);

  color: var(--console-text);

  font-size: var(--console-fs-2xs);
}

.payment-status {
  display: inline-flex;

  padding: 5px 8px;

  border-radius: 6px;

  font-size: var(--console-fs-2xs);

  font-weight: 600;
}

.payment-status.paid {
  color: #27ae68;

  background: #e9f9f1;
}

.payment-status.pending {
  color: #eea328;

  background: #fff5df;
}

.payment-status.free {
  color: #68778d;

  background: #f0f3f7;
}

.participant-empty {
  height: 130px !important;

  color: var(--console-text-muted) !important;

  text-align: center;
}


/* =========================================================
   ADMINS MODAL
========================================================= */

.admins-modal {
  width: min(560px, 100%);

  overflow: hidden;

  border: 1px solid var(--console-border);

  border-radius: 12px;

  background: #fff;

  box-shadow:
    0 22px 60px rgba(15, 23, 42, 0.18);
}

.admins-content {
  max-height: 460px;

  overflow-y: auto;

  padding: 18px 20px;
}

.section-title {
  margin-bottom: 9px;

  color: var(--console-text);

  font-size: var(--console-fs-2xs);

  font-weight: 700;
}

.admin-description {
  margin: -2px 0 10px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}

.assigned-admins {
  display: flex;

  flex-direction: column;

  gap: 7px;
}

.assigned-admin {
  min-height: 50px;

  padding: 7px 9px;

  display: flex;
  align-items: center;

  gap: 9px;

  border: 1px solid var(--console-border);

  border-radius: 8px;
}

.assigned-admin img,
.admin-option img {
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  object-fit: cover;

  border-radius: 50%;
}

.admin-info {
  flex: 1;

  display: flex;

  flex-direction: column;

  gap: 2px;
}

.admin-info strong {
  color: var(--console-text);

  font-size: var(--console-fs-xs);
}

.admin-info span {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}

.no-admins {
  padding: 13px;

  border: 1px dashed var(--console-border);

  border-radius: 7px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);

  text-align: center;
}

.section-divider {
  height: 1px;

  margin: 18px 0;

  background: var(--console-border-soft);
}


/* =========================================================
   ADMIN OPTIONS
========================================================= */

.admin-options {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 7px;
}

.admin-option {
  min-height: 48px;

  padding: 7px 9px;

  display: flex;
  align-items: center;

  gap: 8px;

  border: 1px solid var(--console-border);

  border-radius: 8px;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.admin-option:hover,
.admin-option.selected {
  border-color: var(--console-primary);

  background: var(--console-primary-soft);
}

.admin-option input {
  width: 13px;
  height: 13px;

  accent-color: var(--console-primary);

  cursor: pointer;
}

.admin-option-info {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;
}

.admin-option-info strong {
  overflow: hidden;

  color: var(--console-text);

  font-size: var(--console-fs-2xs);

  white-space: nowrap;

  text-overflow: ellipsis;
}

.admin-option-info small {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}

.actions-footer {
  justify-content: flex-end;

  gap: 8px;
}

@media (max-width: 700px) {
  .participant-table {
    min-width: 680px;
  }
}

@media (max-width: 520px) {
  .admin-options {
    grid-template-columns: 1fr;
  }

  .actions-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .actions-footer .console-btn {
    justify-content: center;
    width: 100%;
  }
}

</style>
