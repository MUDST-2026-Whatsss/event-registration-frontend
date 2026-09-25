<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from '@/shared/composables/useToast.js'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import EventAdminsModal from './EventAdminsModal.vue'
import {
  listAdminEvents, listEventAdmins, listEventAdminCandidates,
  replaceEventAdmins,
} from '@/features/events/api/adminEventsApi.js'

const events = ref([])
const availableAdmins = ref([])
const searchQuery = ref('')
const activeTab = ref('All')
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const { showToast } = useToast()

const showFilters = ref(false)
const selectedCategories = ref([])
const tabs = ['All', 'Draft', 'Published', 'Pending', 'Rejected', 'Cancelled']
const categories = computed(() => [...new Set(events.value.map((event) => event.category).filter(Boolean))])

const statusMap = {
  Draft: 'DRAFT', Published: 'PUBLISHED', Pending: 'PENDING_REVIEW',
  Rejected: 'REJECTED', Cancelled: 'CANCELLED',
}
const statusLabel = (status) => ({
  DRAFT: 'Draft', PUBLISHED: 'Published', PENDING_REVIEW: 'Pending',
  REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
}[status] || status)
const formatDate = (value) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : 'TBD'
const formatTime = (start, end) => start && end
  ? `${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  : 'Unset'
const mapEvent = (event) => ({
  id: event.eventId, name: event.title, venue: event.locationName || event.onlineUrl || 'Location not set',
  date: formatDate(event.startAt), time: formatTime(event.startAt, event.endAt),
  registrations: event.registrationCount, capacity: event.maximumParticipants,
  status: statusLabel(event.status), category: event.category?.nameEn || event.category?.nameTh || 'Uncategorized',
  image: event.imageUrl, admins: [], raw: event,
})

const filteredEvents = computed(() => events.value.filter((event) =>
  selectedCategories.value.length === 0 || selectedCategories.value.includes(event.category)))

async function loadEvents() {
  loading.value = true
  errorMessage.value = ''
  try {
    const payload = await listAdminEvents({
      status: statusMap[activeTab.value], query: searchQuery.value.trim(), page: page.value, size: 10,
    })
    events.value = payload.content.map(mapEvent)
    totalPages.value = payload.totalPages
    totalElements.value = payload.totalElements
  } catch (error) { errorMessage.value = error.message }
  finally { loading.value = false }
}

function selectTab(tab) { activeTab.value = tab; page.value = 0 }
function toggleFilters() { showFilters.value = !showFilters.value }
function toggleCategory(category) {
  selectedCategories.value = selectedCategories.value.includes(category)
    ? selectedCategories.value.filter((item) => item !== category)
    : [...selectedCategories.value, category]
}
function clearFilters() { selectedCategories.value = [] }

const selectedEvent = ref(null)
const showAdmins = ref(false)
const selectedAdminIds = ref([])
const protectedOwnerIds = ref([])

async function openAdmins(event) {
  selectedEvent.value = event
  try {
    const [candidates, assignments] = await Promise.all([
      listEventAdminCandidates(), listEventAdmins(event.id),
    ])
    const assignmentById = new Map(assignments.map((item) => [item.userId, item]))
    protectedOwnerIds.value = assignments.filter((item) => item.owner).map((item) => item.userId)
    selectedAdminIds.value = assignments.map((item) => item.userId)
    availableAdmins.value = [...new Map([
      ...candidates.map((item) => [item.userId, { id: item.userId, name: item.email, role: 'Event Admin', avatar: '' }]),
      ...assignments.map((item) => [item.userId, {
        id: item.userId, name: item.email, role: item.owner ? 'Event Owner' : 'Event Admin', avatar: '',
        owner: item.owner || assignmentById.get(item.userId)?.owner,
      }]),
    ]).values()]
    showAdmins.value = true
  } catch (error) { showToast({ title: error.message, variant: 'danger' }) }
}
function closeAdmins() { showAdmins.value = false; selectedEvent.value = null; selectedAdminIds.value = []; protectedOwnerIds.value = [] }
function toggleAdmin(adminId) {
  if (protectedOwnerIds.value.includes(adminId)) return
  selectedAdminIds.value = selectedAdminIds.value.includes(adminId)
    ? selectedAdminIds.value.filter((id) => id !== adminId) : [...selectedAdminIds.value, adminId]
}
async function saveAdmins() {
  if (!selectedEvent.value) return
  try {
    await replaceEventAdmins(selectedEvent.value.id,
      selectedAdminIds.value.filter((id) => !protectedOwnerIds.value.includes(id)))
    closeAdmins()
    showToast({ title: 'Event admins updated successfully.', variant: 'success' })
  } catch (error) { showToast({ title: error.message, variant: 'danger' }) }
}

function registrationPercent(event) {
  return event.capacity ? Math.round((event.registrations / event.capacity) * 100) : 0
}

let searchTimer
watch(searchQuery, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 0; loadEvents() }, 300) })
watch(activeTab, loadEvents)
watch(page, loadEvents)
onMounted(loadEvents)
</script>


<template>



  <main class="console-body all-events-body">

    <!-- =====================================================
         Heading
    ====================================================== -->

    <section class="console-heading-row page-heading">

      <div class="console-page-heading">

        <h1>All Events</h1>

        <p>
          Manage and monitor all events and their assigned admins.
        </p>

      </div>

    </section>


    <!-- =====================================================
         Search
    ====================================================== -->

    <section class="search-section">

      <div class="console-search">

        <Icon
          name="search"
          :size="15"
        />

        <input
          v-model="searchQuery"
          class="console-input"
          type="text"
          placeholder="Search events..."
        />

      </div>

      <span
        v-if="searchQuery"
        class="search-count"
      >
        Showing {{ filteredEvents.length }} of {{ totalElements }} events
      </span>

    </section>




    <!-- =====================================================
         Events Table Card
    ====================================================== -->

    <section class="console-card events-card">


      <!-- ===================================================
           Toolbar
      ==================================================== -->

      <div class="table-toolbar">

        <div class="toolbar-left">

          <!-- Status Tabs -->

          <div class="status-tabs">

            <button
              v-for="tab in tabs"
              :key="tab"
              class="status-tab"
              :class="{
                active: activeTab === tab,
              }"
              @click="selectTab(tab)"
            >
              {{ tab }}
            </button>

          </div>


          <!-- Category Filter -->

          <div class="filter-wrapper">

            <button
              class="console-btn console-btn-secondary filter-btn"
              :class="{
                active:
                  selectedCategories.length > 0,
              }"
              @click="toggleFilters"
            >

              <Icon
                name="filter"
                :size="13"
              />

              Filters

              <span
                v-if="selectedCategories.length > 0"
                class="filter-count"
              >
                {{ selectedCategories.length }}
              </span>

            </button>


            <!-- Filter Popover -->

            <div
              v-if="showFilters"
              class="filter-popover"
            >

              <div class="filter-title">
                Event Categories
              </div>

              <p class="filter-description">
                Select one or more categories.
              </p>


              <label
                v-for="category in categories"
                :key="category"
                class="filter-option"
                :class="{
                  selected:
                    selectedCategories.includes(category),
                }"
              >

                <input
                  type="checkbox"
                  :checked="
                    selectedCategories.includes(category)
                  "
                  @change="
                    toggleCategory(category)
                  "
                />

                <span>
                  {{ category }}
                </span>

              </label>


              <button
                class="clear-filter"
                @click="clearFilters"
              >
                Clear selection
              </button>

            </div>

          </div>

        </div>


        <div class="toolbar-right">

          <span class="showing-text">
            Showing {{ filteredEvents.length }} of {{ totalElements }} events
          </span>

        </div>

      </div>


      <!-- ===================================================
           Table
      ==================================================== -->

      <div class="table-wrapper">

        <table class="events-table">

          <thead>

            <tr>

              <th class="event-column">
                EVENT DETAILS
              </th>

              <th>
                DATE & TIME
              </th>

              <th>
                REGISTRATIONS
              </th>

              <th>
                STATUS
              </th>

              <th class="actions-column">
                ACTIONS
              </th>

            </tr>

          </thead>


          <tbody>

            <tr v-if="errorMessage"><td colspan="5" class="empty-cell">{{ errorMessage }}</td></tr>
            <tr v-else-if="loading"><td colspan="5" class="empty-cell">Loading events...</td></tr>

            <tr
              v-for="event in filteredEvents"
              :key="event.id"
            >

              <!-- Event -->

              <td>

                <div class="event-details">

                  <div class="event-image">

                    <img
                      v-if="event.image"
                      :src="event.image"
                      :alt="event.name"
                    />

                    <Icon
                      v-else
                      name="calendar"
                      :size="17"
                    />

                  </div>


                  <div class="event-info">

                    <strong>
                      {{ event.name }}
                    </strong>

                    <span>
                      {{ event.venue }}
                    </span>

                  </div>

                </div>

              </td>


              <!-- Date -->

              <td>

                <div class="date-info">

                  <strong>
                    {{ event.date }}
                  </strong>

                  <span>
                    {{ event.time }}
                  </span>

                </div>

              </td>


              <!-- Registrations -->

              <td>

                <div class="registration-info">

                  <div
                    v-if="event.capacity"
                    class="registration-number"
                  >

                    <strong>
                      {{ event.registrations }}
                    </strong>

                    <span>
                      /{{ event.capacity }}
                    </span>

                  </div>


                  <div
                    v-if="event.capacity"
                    class="registration-percent"
                  >
                    {{ registrationPercent(event) }}%
                  </div>


                  <div
                    v-if="event.capacity"
                    class="progress-track"
                  >

                    <div
                      class="progress-fill"
                      :style="{
                        width:
                          registrationPercent(event) + '%',
                      }"
                    />

                  </div>


                  <span
                    v-else
                    class="awaiting-text"
                  >
                    —
                  </span>

                </div>

              </td>


              <!-- Status -->

              <td>

                <span
                  class="event-status"
                  :class="
                    event.status.toLowerCase()
                  "
                >

                  <span class="status-dot" />

                  {{ event.status }}

                </span>

              </td>


              <!-- Actions -->

              <td>

                <div class="event-actions">


                  <!-- Manage Admins -->

                  <button
                    class="icon-action admin-action"
                    title="Manage event admins"
                    @click="openAdmins(event)"
                  >

                    <Icon
                      name="shield"
                      :size="15"
                    />

                  </button>

                </div>

              </td>

            </tr>


            <!-- Empty -->

            <tr
              v-if="filteredEvents.length === 0"
            >

              <td
                colspan="5"
                class="empty-cell"
              >

                <div class="empty-state">

                  <Icon
                    name="search"
                    :size="22"
                  />

                  <strong>
                    No events found
                  </strong>

                  <span>
                    Try changing your search or filters.
                  </span>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>


      <!-- Pagination -->

      <div class="console-pagination table-footer">

        <span>
          Page {{ totalPages ? page + 1 : 0 }} of {{ totalPages }}
        </span>

        <div class="console-pagination-controls">

          <button class="console-page-num" :disabled="page === 0" @click="page--">

            <Icon
              name="chevron-left"
              :size="14"
            />

          </button>

          <button class="console-page-num active">{{ page + 1 }}</button>

          <button class="console-page-num" :disabled="page + 1 >= totalPages" @click="page++">

            <Icon
              name="chevron-right"
              :size="14"
            />

          </button>

        </div>

      </div>

    </section>


    <!-- =====================================================
         MANAGE ADMINS MODAL
    ====================================================== -->

    <EventAdminsModal
      :open="showAdmins"
      :event="selectedEvent"
      :admins="availableAdmins"
      :selected-ids="selectedAdminIds"
      @close="closeAdmins"
      @save="saveAdmins"
      @toggle="toggleAdmin"
    />


  </main>

</template>


<style scoped>

/* =========================================================
   PAGE
========================================================= */

.all-events-body {
  padding-bottom: 30px;
}

.page-heading {
  margin-bottom: 15px;
}


/* =========================================================
   SEARCH
========================================================= */

.search-section {
  display: flex;
  align-items: center;

  gap: 10px;

  margin-bottom: 16px;
}

.search-section .console-search {
  width: 380px;
}

.search-count {
  color: var(--console-text-muted);

  font-size: var(--console-fs-xs);
}


/* =========================================================
   TOAST
========================================================= */





/* =========================================================
   TABLE CARD
========================================================= */

.events-card {
  position: relative;

  overflow: visible;
}


/* =========================================================
   TOOLBAR
========================================================= */

.table-toolbar {
  min-height: 57px;

  padding: 10px 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid var(--console-border-soft);
}

.toolbar-left {
  display: flex;
  align-items: center;

  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;

  gap: 10px;
}


/* =========================================================
   STATUS TABS
========================================================= */

.status-tabs {
  display: flex;
  align-items: center;

  padding: 3px;

  border: 1px solid var(--console-border);

  border-radius: 8px;

  background: #f8f9fb;
}

.status-tab {
  padding: 7px 12px;

  border: none;
  border-radius: 6px;

  color: var(--console-text-secondary);

  background: transparent;

  font-size: var(--console-fs-xs);

  cursor: pointer;

  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.status-tab:hover {
  color: var(--console-text);
}

.status-tab.active {
  color: var(--console-text);

  background: #fff;

  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.08);

  font-weight: 600;
}


/* =========================================================
   FILTER
========================================================= */

.filter-wrapper {
  position: relative;
}

.filter-btn {
  min-height: 30px;

  padding: 6px 10px;

  display: flex;
  align-items: center;

  gap: 5px;
}

.filter-btn.active {
  border-color: var(--console-primary);

  color: var(--console-primary);
}

.filter-count {
  min-width: 15px;
  height: 15px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #fff;

  background: var(--console-primary);

  font-size: var(--console-fs-2xs);
  font-weight: 700;
}

.filter-popover {
  position: absolute;

  top: 38px;
  left: 0;

  z-index: 50;

  width: 205px;

  padding: 13px;

  border: 1px solid var(--console-border);

  border-radius: 9px;

  background: #fff;

  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.12);
}

.filter-title {
  margin-bottom: 3px;

  color: var(--console-text);

  font-size: var(--console-fs-xs);
  font-weight: 700;
}

.filter-description {
  margin: 0 0 8px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-sm);
}

.filter-option {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 7px 6px;

  border-radius: 5px;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-xs);

  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.filter-option:hover,
.filter-option.selected {
  color: var(--console-text);

  background: var(--console-primary-soft);
}

.filter-option input {
  width: 13px;
  height: 13px;

  accent-color: var(--console-primary);

  cursor: pointer;
}

.clear-filter {
  width: 100%;

  margin-top: 7px;

  padding-top: 8px;

  border: none;

  border-top: 1px solid var(--console-border-soft);

  color: var(--console-primary);

  background: transparent;

  font-size: var(--console-fs-sm);

  cursor: pointer;
}

.clear-filter:hover {
  text-decoration: underline;
}

.showing-text {
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

.events-table {
  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;
}

.events-table th {
  height: 43px;

  padding: 0 18px;

  color: var(--console-label);

  background: #fafbfc;

  font-size: var(--console-fs-xs);
  font-weight: 700;

  text-align: left;

  letter-spacing: 0.04em;

  text-transform: uppercase;
}

.events-table td {
  height: 78px;

  padding: 10px 18px;

  border-top: 1px solid var(--console-border-soft);

  vertical-align: middle;
}

.events-table th:nth-child(1),
.events-table td:nth-child(1) {
  width: 31%;
}

.events-table th:nth-child(2),
.events-table td:nth-child(2) {
  width: 16%;
}

.events-table th:nth-child(3),
.events-table td:nth-child(3) {
  width: 17%;
}

.events-table th:nth-child(4),
.events-table td:nth-child(4) {
  width: 14%;
}

.events-table th:nth-child(5),
.events-table td:nth-child(5) {
  width: 12%;
}


/* =========================================================
   EVENT DETAILS
========================================================= */

.event-details {
  display: flex;
  align-items: center;

  gap: 11px;
}

.event-image {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  border: 1px solid var(--console-border);

  border-radius: 8px;

  color: var(--console-text-muted);

  background: #f8fafc;
}

.event-image img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.event-info {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 4px;
}

.event-info strong {
  overflow: hidden;

  color: var(--console-text);

  font-size: var(--console-fs-base);

  line-height: var(--lh-tight);

  white-space: nowrap;

  text-overflow: ellipsis;
}

.event-info span {
  overflow: hidden;

  color: var(--console-text-muted);

  font-size: var(--console-fs-sm);

  white-space: nowrap;

  text-overflow: ellipsis;
}


/* =========================================================
   DATE
========================================================= */

.date-info {
  display: flex;
  flex-direction: column;

  gap: 4px;
}

.date-info strong {
  color: var(--console-text);

  font-size: var(--console-fs-base);
}

.date-info span {
  color: var(--console-text-secondary);

  font-size: var(--console-fs-sm);

  line-height: var(--lh-snug);
}


/* =========================================================
   REGISTRATION
========================================================= */

.registration-info {
  position: relative;

  width: 105px;
}

.registration-number {
  display: flex;
  align-items: baseline;
}

.registration-number strong {
  color: var(--console-text);

  font-size: var(--console-fs-base);
}

.registration-number span {
  color: var(--console-text-muted);

  font-size: var(--console-fs-sm);
}

.registration-percent {
  position: absolute;

  right: 0;
  top: 0;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-sm);
}

.progress-track {
  width: 100%;
  height: 5px;

  margin-top: 6px;

  overflow: hidden;

  border-radius: 99px;

  background: #edf1f5;
}

.progress-fill {
  height: 100%;

  border-radius: inherit;

  background: #56c88a;
}

.awaiting-text {
  color: var(--console-text-muted);

  font-size: var(--console-fs-xs);
}


/* =========================================================
   STATUS
========================================================= */

.event-status {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  padding: 4px 10px;

  border-radius: var(--radius-pill);

  font-size: var(--console-fs-xs);

  font-weight: 700;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;
}

.event-status.published {
  color: var(--console-success-text);

  background: var(--console-success-bg);
}

.event-status.published .status-dot {
  background: var(--console-success);
}

.event-status.pending {
  color: var(--console-warning-text);

  background: var(--console-warning-bg);
}

.event-status.pending .status-dot {
  background: var(--console-warning);
}

.event-status.rejected {
  color: var(--console-danger-text);

  background: var(--console-danger-bg);
}

.event-status.rejected .status-dot {
  background: var(--console-danger);
}

.event-status.draft {
  color: var(--console-text-secondary);

  background: var(--console-gray-bg);
}

.event-status.draft .status-dot {
  background: var(--console-text-muted);
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

  color: #8090a7;

  background: transparent;

  border-radius: 6px;

  cursor: pointer;

  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.icon-action:hover {
  color: var(--console-primary);

  background: var(--console-primary-soft);
}

.icon-action.admin-action:hover {
  color: #64748b;

  background: #eef2f7;
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

  font-size: var(--console-fs-md);
}

.empty-state span {
  font-size: var(--console-fs-base);
}


/* =========================================================
   TABLE FOOTER
========================================================= */

/* Layout and control styling come from .console-pagination in theme.css;
   only the footer's own padding is page-specific. */
.table-footer {
  padding: 14px 18px;

  border-top: 1px solid var(--console-border-soft);
}


/* =========================================================
   MODAL BACKDROP
========================================================= */



/* =========================================================
   MODAL HEADER
========================================================= */








/* =========================================================
   PARTICIPANTS MODAL
========================================================= */












/* =========================================================
   ADMINS MODAL
========================================================= */














/* =========================================================
   ADMIN OPTIONS
========================================================= */










/* =========================================================
   DELETE MODAL
========================================================= */

.delete-modal {
  width: min(390px, 100%);

  padding: 25px;

  border-radius: 12px;

  background: #fff;

  box-shadow:
    0 22px 60px rgba(15, 23, 42, 0.18);

  text-align: center;
}

.delete-icon {
  width: 43px;
  height: 43px;

  margin: 0 auto 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: var(--console-danger);

  background: #fff0f0;
}

.delete-modal h2 {
  margin: 0;

  color: var(--console-text);

  font-size: var(--console-fs-md);
}

.delete-modal p {
  margin: 8px 0 20px;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-xs);

  line-height: 1.6;
}

.delete-modal p strong {
  color: var(--console-text);
}

.delete-actions {
  display: flex;

  justify-content: center;

  gap: 8px;
}

.delete-confirm {
  border: 1px solid var(--console-danger) !important;

  color: #fff !important;

  background: var(--console-danger) !important;
}

.delete-confirm:hover {
  opacity: 0.9;
}


/* =========================================================
   TRANSITIONS
========================================================= */




.modal-enter-active > div,
.modal-leave-active > div {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}


.modal-enter-from > div,
.modal-leave-to > div {
  opacity: 0;

  transform: translateY(8px);
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .events-table {
    min-width: 900px;
  }

  .search-section .console-search {
    width: 100%;
  }

  .search-section {
    flex-direction: column;

    align-items: stretch;
  }

}

@media (max-width: 700px) {

  .table-toolbar {
    align-items: flex-start;

    flex-direction: column;

    gap: 10px;
  }

  .toolbar-left {
    width: 100%;

    overflow-x: auto;
  }

  .status-tabs {
    flex-shrink: 0;
  }

  .toolbar-right {
    width: 100%;
  }

  .admin-options {
    grid-template-columns: 1fr;
  }

}

</style>
