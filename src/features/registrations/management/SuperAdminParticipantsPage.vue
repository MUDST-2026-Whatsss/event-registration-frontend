<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

const route = useRoute()
const router = useRouter()

/* =========================================================
   EVENT
========================================================= */

const storedEvent = localStorage.getItem('selectedEvent')

const event = ref(
  storedEvent
    ? JSON.parse(storedEvent)
    : {
        id: Number(route.params.id),
        name: 'Global Tech Innovators Summit 2024',
        participants: [],
      }
)

const participants = computed(
  () => event.value.participants || []
)

const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(participants.value.length / 10)))

/* =========================================================
   ACTIONS
========================================================= */

const goBack = () => {
  router.push({
    name: 'sa-all-events',
  })
}

const deleteParticipant = id => {
  event.value.participants =
    event.value.participants.filter(
      participant => participant.id !== id
    )

  localStorage.setItem(
    'selectedEvent',
    JSON.stringify(event.value)
  )
}
</script>

<template>

  <main class="console-body participants-body">

    <!-- HEADING -->
    <section class="console-heading-row page-heading">

      <div class="console-page-heading">

        <div class="breadcrumb">

          <button
            class="breadcrumb-link"
            @click="goBack"
          >
            All Events
          </button>

          <Icon
            name="chevron-right"
            :size="11"
          />

          <span>
            Participants
          </span>

        </div>

        <h1>
          {{ event.name }}
        </h1>

        <p>
          Manage and view all participants registered for this event.
        </p>

      </div>

    </section>


    <!-- PARTICIPANTS -->
    <section class="console-card participants-card">

      <!-- HEADER -->
      <div class="participants-header">
        Showing {{ participants.length }} users
      </div>


      <!-- TABLE -->
      <div class="table-wrapper">

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

              <th>
                ACTIONS
              </th>

            </tr>
          </thead>


          <tbody>

            <!-- USERS -->
            <tr
              v-for="participant in participants"
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
                  class="payment-status"
                  :class="
                    participant.payment.toLowerCase()
                  "
                >

                  <span class="status-dot" />

                  {{
                    participant.payment === 'Paid'
                      ? 'Finished'
                      : participant.payment
                  }}

                </span>

              </td>

              <td>

                <div class="event-actions">

                  <!-- EDIT -->
                  <button
                    class="icon-action"
                    title="Edit participant"
                  >
                    <Icon
                      name="edit"
                      :size="15"
                    />
                  </button>

                  <!-- DELETE -->
                  <button
                    class="icon-action danger"
                    title="Delete participant"
                    @click="
                      deleteParticipant(
                        participant.id
                      )
                    "
                  >
                    <Icon
                      name="trash"
                      :size="15"
                    />
                  </button>

                </div>

              </td>

            </tr>


            <!-- EMPTY -->
            <tr v-if="!participants.length">

              <td
                colspan="5"
                class="empty-cell"
              >

                <div class="empty-state">

                  <Icon
                    name="users"
                    :size="22"
                  />

                  <strong>
                    No participants found
                  </strong>

                  <span>
                    There are no registered participants.
                  </span>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>


    </section>

    <!-- FOOTER -->
    <div class="console-pagination">
      <span>Showing 1 to {{ participants.length }} of {{ participants.length }} users</span>
      <div class="console-pagination-controls">
        <button type="button" class="console-icon-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <Icon name="chevron-left" :size="15" />
        </button>
        <button type="button" class="console-page-num active">{{ currentPage }}</button>
        <button type="button" class="console-icon-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          <Icon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>

  </main>
</template>


<style scoped>

.participants-body {
  padding-bottom: 30px;
}

.page-heading {
  margin-bottom: 15px;
}

/* =========================================================
   BREADCRUMB
========================================================= */

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
}

.breadcrumb-link {
  padding: 0;
  border: none;
  color: var(--console-primary);
  background: transparent;
  font-size: var(--console-fs-2xs);
  cursor: pointer;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.console-page-heading h1 {
  margin: 0;
}

.console-page-heading p {
  margin-top: 5px;
}

/* =========================================================
   CARD
========================================================= */

.participants-card {
  overflow: hidden;
}

/* =========================================================
   HEADER
========================================================= */

.participants-header {
  min-height: 53px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--console-border-soft);
  color: var(--console-text-secondary);
  font-size: var(--console-fs-xs);
}

/* =========================================================
   TABLE
========================================================= */

.table-wrapper {
  overflow-x: auto;
  min-width: 0;
  max-width: 100%;
}

.participant-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.participant-table th {
  height: 43px;
  padding: 0 18px;
  color: #8b99ae;
  background: #fafbfc;
  font-size: var(--console-fs-2xs);
  font-weight: 600;
  text-align: left;
}

.participant-table td {
  height: 70px;
  padding: 10px 18px;
  border-top: 1px solid var(--console-border-soft);
  color: var(--console-text);
  font-size: var(--console-fs-2xs);
  vertical-align: middle;
}

.participant-table th:nth-child(1),
.participant-table td:nth-child(1) {
  width: 29%;
}

.participant-table th:nth-child(2),
.participant-table td:nth-child(2) {
  width: 20%;
}

.participant-table th:nth-child(3),
.participant-table td:nth-child(3) {
  width: 14%;
}

.participant-table th:nth-child(4),
.participant-table td:nth-child(4) {
  width: 22%;
}

.participant-table th:nth-child(5),
.participant-table td:nth-child(5) {
  width: 15%;
}

/* =========================================================
   PAYMENT
========================================================= */

.payment-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: var(--console-fs-2xs);
  font-weight: 600;
}

.payment-status .status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.payment-status.paid {
  color: #27ae68;
  background: #e9f9f1;
}

.payment-status.paid .status-dot {
  background: #27ae68;
}

.payment-status.pending {
  color: #eea328;
  background: #fff5df;
}

.payment-status.pending .status-dot {
  background: #eea328;
}

/* =========================================================
   ACTIONS
========================================================= */

.event-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.icon-action {
  width: 27px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  color: #8090a7;
  background: transparent;
  cursor: pointer;
}

.icon-action:hover {
  color: var(--console-primary);
  background: var(--console-primary-soft);
}

.icon-action.danger:hover {
  color: var(--console-danger);
  background: #fff0f0;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-cell {
  height: 250px !important;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--console-text-muted);
}

.empty-state strong {
  color: var(--console-text);
  font-size: var(--console-fs-xs);
}

.empty-state span {
  font-size: var(--console-fs-xs);
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 700px) {
  .participant-table {
    min-width: 750px;
  }
}
</style>
