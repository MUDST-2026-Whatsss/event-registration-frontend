<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ConsoleIcon as Icon, ConsolePagination } from '@/features/console-shell/public.js'
import { getAdminEvent } from '@/features/events/api/adminEventsApi.js'
import { useToast } from '@/shared/composables/useToast.js'
import { checkInRegistration, listAllEventRegistrations, listEventRegistrations } from '../api/registrationsApi.js'
import { useOfflineCheckIn } from '../composables/useOfflineCheckIn.js'
import CheckInScanner from './CheckInScanner.vue'
import EventAnalyticsPanel from './EventAnalyticsPanel.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const event = ref({ id: route.params.id, name: 'Loading...' })
const participants = ref([])
const errorMessage = ref('')
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const checkInNumber = ref('')
const checkingIn = ref(false)
const scannerOpen = ref(false)
const analyticsPanel = ref(null)

const offline = useOfflineCheckIn(String(route.params.id), {
  checkIn: checkInRegistration,
  onSynced: (count) => {
    showToast({ title: `${count} offline check-in${count === 1 ? '' : 's'} synced.`, variant: 'success' })
    refreshAfterCheckIn()
  },
})

const OFFLINE_MESSAGES = {
  queued: (name) => ({ title: `${name} checked in offline.`, message: 'It will sync when the connection is back.', variant: 'warning' }),
  duplicate: (name) => ({ title: `${name} was already scanned offline.`, message: 'Waiting to sync.', variant: 'warning' }),
  already: (name) => ({ title: `${name} is already checked in.`, variant: 'danger' }),
  'not-checkable': (name) => ({ title: `${name} cannot be checked in.`, message: 'The registration is pending payment or cancelled.', variant: 'danger' }),
  unknown: () => ({ title: 'Registration not found in the saved participant list.', variant: 'danger' }),
  'no-roster': () => ({ title: 'No participant list saved on this device.', message: 'Open this page once while online before checking in offline.', variant: 'danger' }),
}

const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  PENDING_PAYMENT: 'Pending',
  CHECKED_IN: 'Checked in',
  CANCELLED_BY_USER: 'Cancelled',
  CANCELLED_BY_ADMIN: 'Cancelled',
  CANCELLED_EVENT: 'Cancelled',
  PAYMENT_EXPIRED: 'Expired',
  NO_SHOW: 'No-show',
}

function mapParticipant(registration) {
  return {
    id: registration.registrationId,
    registrationNumber: registration.registrationNumber,
    name: registration.attendeeName,
    email: registration.attendeeEmail,
    tel: registration.attendeePhone || '-',
    payment: offline.isPending(registration.registrationNumber)
      ? 'Pending sync'
      : STATUS_LABELS[registration.status] || registration.status,
    guest: Boolean(registration.registeredAsGuest),
  }
}

async function loadParticipants() {
  errorMessage.value = ''
  try {
    const payload = await listEventRegistrations(route.params.id, {
      page: currentPage.value, size: pageSize.value,
    })
    participants.value = payload.content.map(mapParticipant)
    totalPages.value = payload.totalPages
    totalElements.value = payload.totalElements
  } catch (cause) {
    errorMessage.value = cause?.code === 'NETWORK_ERROR' && offline.hasRoster.value
      ? 'You are offline. Check-ins are saved on this device and sync when the connection is back.'
      : cause?.message || 'Unable to load participants.'
  }
}

// Saved while online so check-in keeps working if the connection drops later.
function saveRosterForOffline() {
  listAllEventRegistrations(route.params.id).then(offline.saveRoster).catch(() => {})
}

function refreshAfterCheckIn() {
  saveRosterForOffline()
  return Promise.all([loadParticipants(), analyticsPanel.value?.reload()])
}

function checkInWithoutConnection(registrationNumber) {
  const result = offline.checkInOffline(registrationNumber)
  showToast(OFFLINE_MESSAGES[result.status](result.name))
  if (result.status === 'queued') {
    checkInNumber.value = ''
    participants.value = participants.value.map((row) => (row.registrationNumber === registrationNumber.toUpperCase()
      ? { ...row, payment: 'Pending sync' } : row))
  }
}

// Staff scan the participant's QR code or type the registration number shown under it.
function checkInScanned(registrationNumber) {
  scannerOpen.value = false
  checkInNumber.value = registrationNumber
  submitCheckIn()
}

async function submitCheckIn() {
  const registrationNumber = checkInNumber.value.trim()
  if (!registrationNumber || checkingIn.value) return
  if (!offline.online.value) {
    checkInWithoutConnection(registrationNumber)
    return
  }
  checkingIn.value = true
  try {
    const registration = await checkInRegistration(route.params.id, registrationNumber)
    showToast({ title: `${registration.attendeeName} checked in.`, variant: 'success' })
    checkInNumber.value = ''
    await refreshAfterCheckIn()
  } catch (error) {
    // The browser may still think it is online while requests fail.
    if (error?.code === 'NETWORK_ERROR') checkInWithoutConnection(registrationNumber)
    else showToast({ title: error.message, variant: 'danger' })
  } finally {
    checkingIn.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  loadParticipants()
}

function changePageSize(size) {
  pageSize.value = size
  currentPage.value = 0
  loadParticipants()
}

// The same page is used by admins and super admins
const goBack = () => {
  router.push({
    name: route.name === 'admin-event-participants' ? 'admin-all-events' : 'sa-all-events',
  })
}

onMounted(async () => {
  getAdminEvent(route.params.id)
    .then((payload) => { event.value = { id: payload.eventId, name: payload.title } })
    .catch(() => { event.value = { id: route.params.id, name: 'Event' } })
  await loadParticipants()
  saveRosterForOffline()
  if (offline.online.value) offline.sync()
})
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


    <EventAnalyticsPanel ref="analyticsPanel" :event-id="String(route.params.id)" />

    <!-- CHECK-IN -->
    <section class="console-card check-in-card">
      <form class="check-in-form" @submit.prevent="submitCheckIn">
        <div class="check-in-field">
          <label class="console-field-label" for="check-in-number">Check in by registration number</label>
          <input
            id="check-in-number"
            v-model="checkInNumber"
            class="console-input"
            placeholder="REG-XXXXXXXXXX"
            autocomplete="off"
          />
        </div>
        <button
          class="console-btn console-btn-primary"
          type="submit"
          :disabled="!checkInNumber.trim() || checkingIn"
        >
          {{ checkingIn ? 'Checking in...' : 'Check in' }}
        </button>
        <button
          class="console-btn console-btn-outline"
          type="button"
          data-test="check-in-scan"
          :disabled="checkingIn"
          @click="scannerOpen = true"
        >
          Scan QR
        </button>
      </form>
    </section>

    <section
      v-if="!offline.online.value || offline.pending.value.length || offline.failed.value.length"
      class="console-card offline-card"
      :class="{ 'is-offline': !offline.online.value }"
      data-test="offline-status"
      aria-live="polite"
    >
      <strong>
        {{ !offline.online.value ? 'Offline' : offline.syncing.value ? 'Syncing check-ins...' : 'Back online' }}
      </strong>
      <span v-if="offline.pending.value.length">
        {{ offline.pending.value.length }} check-in{{ offline.pending.value.length === 1 ? '' : 's' }} waiting to sync
      </span>
      <span v-if="offline.online.value && offline.pending.value.length && !offline.syncing.value">Retrying automatically every 30 seconds.</span>
      <span v-else-if="!offline.online.value && !offline.pending.value.length">Check-ins are saved on this device and sync when the connection is back.</span>
      <ul v-if="offline.failed.value.length" class="offline-failed" data-test="offline-failed">
        <li v-for="item in offline.failed.value" :key="item.registrationNumber">
          <span><b>{{ item.name }}</b> ({{ item.registrationNumber }}) could not be synced: {{ item.error }}</span>
          <button class="console-btn console-btn-outline" type="button" @click="offline.dismiss(item.registrationNumber)">Dismiss</button>
        </li>
      </ul>
    </section>

    <CheckInScanner v-if="scannerOpen" @detected="checkInScanned" @close="scannerOpen = false" />


    <!-- PARTICIPANTS -->
    <section class="console-card participants-card">

      <!-- HEADER -->
      <div class="participants-header">
        {{ totalElements.toLocaleString() }} registered users
      </div>

      <p v-if="errorMessage" class="participants-error" role="alert">{{ errorMessage }}</p>


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
                STATUS
              </th>

              <th>
                REGISTRATION NO.
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
                <span v-if="participant.guest" class="guest-tag">Guest</span>
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

                {{ participant.registrationNumber }}

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
    <ConsolePagination
      :page="currentPage"
      :page-size="pageSize"
      :total-elements="totalElements"
      :total-pages="totalPages"
      item-label="users"
      @page="changePage"
      @page-size="changePageSize"
    />

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
   CHECK-IN
========================================================= */

.check-in-card {
  margin-bottom: 15px;
  padding: 16px 18px;
}

.check-in-form {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.check-in-field {
  flex: 1;
  max-width: 360px;
}

.offline-card {
  display: grid;
  gap: 6px;
  margin-bottom: 15px;
  padding: 14px 18px;
  border-color: var(--console-success);
  background: var(--console-success-bg);
  color: var(--console-success-text);
  font-size: var(--console-fs-sm);
}

.offline-card.is-offline {
  border-color: var(--console-warning);
  background: var(--console-warning-bg);
  color: var(--console-warning-text);
}

.offline-failed {
  display: grid;
  gap: 8px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

.offline-failed li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--console-danger-text);
}

.guest-tag {
  margin-left: 6px;
  padding: 1px 7px;
  color: #1e3a8a;
  background: #eef3ff;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 600;
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

.payment-status.checked {
  color: #27ae68;
  background: #e9f9f1;
}

.payment-status.checked .status-dot {
  background: #27ae68;
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
.participants-error { margin: 0 0 12px; color: #b42318; font-size: .85rem; }
</style>
