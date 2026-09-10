<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'

const router = useRouter()

// Admins
const availableAdmins = [
  { id: 1, name: 'Sarah Jenkins', role: 'Event Admin', avatar: 'https://i.pravatar.cc/100?img=47' },
  { id: 2, name: 'Elena Rossi', role: 'Event Admin', avatar: 'https://i.pravatar.cc/100?img=32' },
  { id: 3, name: 'Tom Hayes', role: 'Event Admin', avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 4, name: 'Mei Lin', role: 'Event Admin', avatar: 'https://i.pravatar.cc/100?img=44' },
]
const getAdmin = id => availableAdmins.find(admin => admin.id === id)

// Events
const events = ref([
  {
    id: 1, name: 'Global Tech Innovators Summit 2024', venue: 'Convention Center, Hall A',
    date: 'Nov 15, 2024', time: '09:00 AM - 05:00 PM', registrations: 450, capacity: 500,
    status: 'Published', category: 'Seminar',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=160&q=80',
    admins: [getAdmin(1), getAdmin(2)],
    participants: [
      { id: 1, name: 'aunyamanee keawching', email: 'aunyama@gmail.com', tel: '095-870-4545', payment: 'Paid' },
      { id: 2, name: 'borbeer sudlhorr', email: 'test@gmail.com', tel: '095-453-4355', payment: 'Paid' },
      { id: 3, name: 'somsak jaidee', email: 'test888@gmail.com', tel: '095-453-4355', payment: 'Pending' },
      { id: 4, name: 'sompong jaidee', email: 'test888@gmail.com', tel: '095-453-4355', payment: 'Paid' },
      { id: 5, name: 'sudjai fongsri', email: 'sudjai@gmail.com', tel: '095-123-4567', payment: 'Pending' },
    ],
  },
  {
    id: 2, name: 'Urban Beats Outdoor Festival', venue: 'Central Park West',
    date: 'Dec 02, 2024', time: '04:00 PM - 11:00 PM', registrations: 320, capacity: 800,
    status: 'Pending', category: 'Music',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=160&q=80',
    admins: [getAdmin(3)],
    participants: [
      { id: 1, name: 'john smith', email: 'john@gmail.com', tel: '095-111-2222', payment: 'Paid' },
      { id: 2, name: 'maria lee', email: 'maria@gmail.com', tel: '095-222-3333', payment: 'Pending' },
    ],
  },
  {
    id: 3, name: 'Advanced UI Design Workshop', venue: 'Creative Hub Room 4',
    date: 'Nov 28, 2024', time: '10:00 AM - 04:00 PM', registrations: 75, capacity: 100,
    status: 'Rejected', category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=160&q=80',
    admins: [getAdmin(4)], participants: [],
  },
  {
    id: 4, name: 'Internal Marketing Strategy Day', venue: 'HQ Main Boardroom',
    date: 'TBD', time: 'Unset', registrations: 0, capacity: 0,
    status: 'Draft', category: 'Others', image: null,
    admins: [getAdmin(1)], participants: [],
  },
  {
    id: 5, name: 'Digital Future Conference 2025', venue: 'Innovation Center',
    date: 'Jan 18, 2025', time: '09:00 AM - 06:00 PM', registrations: 620, capacity: 700,
    status: 'Published', category: 'Seminar',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=160&q=80',
    admins: [getAdmin(3)], participants: [],
  },
])

// Filter
const searchQuery = ref('')
const activeTab = ref('All')
const showFilters = ref(false)
const selectedCategories = ref([])
const tabs = ['All', 'Draft', 'Published', 'Pending', 'Rejected']
const categories = ['Workshop', 'Seminar', 'Music', 'Camp', 'Others']
const currentPage = ref(1)

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return events.value.filter(event => {
    const matchesStatus = activeTab.value === 'All' || event.status === activeTab.value
    const matchesCategory = !selectedCategories.value.length || selectedCategories.value.includes(event.category)
    const matchesSearch =
      !query ||
      [event.name, event.venue, event.category].some(text => text.toLowerCase().includes(query)) ||
      event.admins.some(admin => admin.name.toLowerCase().includes(query))
    return matchesStatus && matchesCategory && matchesSearch
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEvents.value.length / 10)))

const toggleItem = (list, item) => {
  list.value = list.value.includes(item) ? list.value.filter(x => x !== item) : [...list.value, item]
}

const registrationPercent = event => (event.capacity ? Math.round((event.registrations / event.capacity) * 100) : 0)

// Participants
const openParticipants = event => {
  localStorage.setItem('selectedEvent', JSON.stringify(event))
  router.push({ name: 'sa-event-participants', params: { id: event.id } })
}

// Admins
const selectedEvent = ref(null)
const showAdmins = ref(false)
const selectedAdminIds = ref([])

const openAdmins = event => {
  selectedEvent.value = event
  selectedAdminIds.value = event.admins.map(admin => admin.id)
  showAdmins.value = true
}

const closeAdmins = () => {
  selectedEvent.value = null
  selectedAdminIds.value = []
  showAdmins.value = false
}

const saveAdmins = () => {
  if (!selectedEvent.value) return
  const event = events.value.find(item => item.id === selectedEvent.value.id)
  if (!event) return
  event.admins = availableAdmins.filter(admin => selectedAdminIds.value.includes(admin.id))
  closeAdmins()
  showToast('Event admins updated successfully.')
}

// Delete
const showDeleteModal = ref(false)
const eventToDelete = ref(null)

const openDelete = event => {
  eventToDelete.value = event
  showDeleteModal.value = true
}

const closeDelete = () => {
  eventToDelete.value = null
  showDeleteModal.value = false
}

const confirmDelete = () => {
  if (!eventToDelete.value) return
  const name = eventToDelete.value.name
  events.value = events.value.filter(event => event.id !== eventToDelete.value.id)
  closeDelete()
  showToast(`"${name}" has been deleted.`, 'danger')
}

// Toast
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => { toastMessage.value = '' }, 3000)
}
</script>

<template>
  <PageTopbar title="All Events">
    <template #actions><UserMenu /></template>
  </PageTopbar>

  <main class="sa-body all-events-body">
    <section class="sa-heading-row page-heading">
      <div class="sa-page-heading">
        <h1>All Events</h1>
        <p>Manage and monitor all events and their assigned admins.</p>
      </div>
    </section>

    <section class="search-section">
      <div class="sa-search">
        <Icon name="search" :size="15" />
        <input v-model="searchQuery" class="sa-input" type="text" placeholder="Search events..." />
      </div>
      <span v-if="searchQuery" class="search-count">Showing {{ filteredEvents.length }} events</span>
    </section>

    <Transition name="toast">
      <div v-if="toastMessage" class="toast-message" :class="toastType">
        <Icon :name="toastType === 'success' ? 'circle-check' : 'circle-x'" :size="15" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <section class="sa-card events-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <div class="status-tabs">
            <button
              v-for="tab in tabs" :key="tab" class="status-tab"
              :class="{ active: activeTab === tab }" @click="activeTab = tab"
            >{{ tab }}</button>
          </div>

          <div class="filter-wrapper">
            <button
              class="sa-btn sa-btn-secondary filter-btn"
              :class="{ active: selectedCategories.length > 0 }"
              @click="showFilters = !showFilters"
            >
              <Icon name="filter" :size="13" />
              Filters
              <span v-if="selectedCategories.length" class="filter-count">{{ selectedCategories.length }}</span>
            </button>

            <div v-if="showFilters" class="filter-popover">
              <div class="filter-title">Event Categories</div>
              <p class="filter-description">Select one or more categories.</p>

              <label
                v-for="category in categories" :key="category" class="filter-option"
                :class="{ selected: selectedCategories.includes(category) }"
              >
                <input
                  type="checkbox" :checked="selectedCategories.includes(category)"
                  @change="toggleItem(selectedCategories, category)"
                />
                <span>{{ category }}</span>
              </label>

              <button class="clear-filter" @click="selectedCategories = []">Clear selection</button>
            </div>
          </div>
        </div>

        <div class="toolbar-right">
          <span class="showing-text">Showing {{ filteredEvents.length }} events</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="events-table">
          <thead>
            <tr>
              <th>EVENT DETAILS</th>
              <th>DATE & TIME</th>
              <th>REGISTRATIONS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="event in filteredEvents" :key="event.id">
              <td>
                <div class="event-details">
                  <div class="event-image">
                    <img v-if="event.image" :src="event.image" :alt="event.name" />
                    <Icon v-else name="calendar" :size="17" />
                  </div>
                  <div class="event-info">
                    <strong>{{ event.name }}</strong>
                    <span>{{ event.venue }}</span>
                  </div>
                </div>
              </td>

              <td>
                <div class="date-info">
                  <strong>{{ event.date }}</strong>
                  <span>{{ event.time }}</span>
                </div>
              </td>

              <td>
                <div class="registration-info">
                  <template v-if="event.capacity">
                    <div class="registration-number">
                      <strong>{{ event.registrations }}</strong>
                      <span>/{{ event.capacity }}</span>
                    </div>
                    <div class="registration-percent">{{ registrationPercent(event) }}%</div>
                    <div class="progress-track">
                      <div class="progress-fill" :style="{ width: registrationPercent(event) + '%' }" />
                    </div>
                  </template>
                  <span v-else class="awaiting-text">—</span>
                </div>
              </td>

              <td>
                <span class="event-status" :class="event.status.toLowerCase()">
                  <span class="status-dot" />
                  {{ event.status }}
                </span>
              </td>

              <td>
                <div class="event-actions">
                  <button class="icon-action" title="View participants" @click="openParticipants(event)">
                    <Icon name="users" :size="15" />
                  </button>
                  <button class="icon-action admin-action" title="Manage event admins" @click="openAdmins(event)">
                    <Icon name="shield" :size="15" />
                  </button>
                  <button class="icon-action danger" title="Delete event" @click="openDelete(event)">
                    <Icon name="trash" :size="15" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredEvents.length">
              <td colspan="5" class="empty-cell">
                <div class="empty-state">
                  <Icon name="search" :size="22" />
                  <strong>No events found</strong>
                  <span>Try changing your search or filters.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="sa-pagination">
      <span>Showing 1 to {{ filteredEvents.length }} of {{ events.length }} events</span>
      <div class="sa-pagination-controls">
        <button type="button" class="sa-icon-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <Icon name="chevron-left" :size="15" />
        </button>
        <button type="button" class="sa-page-num active">{{ currentPage }}</button>
        <button type="button" class="sa-icon-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          <Icon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>

    <!-- Admins modal -->
    <Transition name="modal">
      <div v-if="showAdmins && selectedEvent" class="modal-backdrop" @click.self="closeAdmins">
        <div class="admins-modal">
          <div class="modal-header">
            <div>
              <span class="modal-eyebrow">Event Management</span>
              <h2>Manage Event Admins</h2>
              <p>{{ selectedEvent.name }}</p>
            </div>
            <button class="modal-close" @click="closeAdmins"><Icon name="x" :size="17" /></button>
          </div>

          <div class="admins-content">
            <div class="section-title">Assigned Admins</div>
            <div class="assigned-admins">
              <div v-if="!selectedAdminIds.length" class="no-admins">No admins assigned to this event.</div>
              <div v-for="id in selectedAdminIds" :key="id" class="assigned-admin">
                <img :src="getAdmin(id)?.avatar" :alt="getAdmin(id)?.name" />
                <div class="admin-info">
                  <strong>{{ getAdmin(id)?.name }}</strong>
                  <span>{{ getAdmin(id)?.role }}</span>
                </div>
              </div>
            </div>

            <div class="section-divider" />

            <div class="section-title">Manage Event Admins</div>
            <p class="admin-description">Select the admins responsible for this event.</p>

            <div class="admin-options">
              <label
                v-for="admin in availableAdmins" :key="admin.id" class="admin-option"
                :class="{ selected: selectedAdminIds.includes(admin.id) }"
              >
                <input
                  type="checkbox" :checked="selectedAdminIds.includes(admin.id)"
                  @change="toggleItem(selectedAdminIds, admin.id)"
                />
                <img :src="admin.avatar" :alt="admin.name" />
                <span class="admin-option-info">
                  <strong>{{ admin.name }}</strong>
                  <small>{{ admin.role }}</small>
                </span>
              </label>
            </div>
          </div>

          <div class="modal-footer actions-footer">
            <button class="sa-btn sa-btn-secondary" @click="closeAdmins">Cancel</button>
            <button class="sa-btn sa-btn-primary" @click="saveAdmins">Save Changes</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal && eventToDelete" class="modal-backdrop" @click.self="closeDelete">
        <div class="delete-modal">
          <div class="delete-icon"><Icon name="trash" :size="20" /></div>
          <h2>Delete Event?</h2>
          <p>
            Are you sure you want to delete <strong>"{{ eventToDelete.name }}"</strong>?
            This action cannot be undone.
          </p>
          <div class="delete-actions">
            <button class="sa-btn sa-btn-secondary" @click="closeDelete">Cancel</button>
            <button class="sa-btn delete-confirm" @click="confirmDelete">Delete Event</button>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.all-events-body {
  padding-bottom: 30px;
}

.page-heading {
  margin-bottom: 15px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.search-section .sa-search {
  width: 380px;
}

.search-count {
  color: var(--sa-text-muted);
  font-size: 9px;
}

.toast-message {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 9px 12px;
  border: 1px solid var(--sa-border);
  border-radius: 7px;
  background: #fff;
  box-shadow: var(--sa-shadow);
  font-size: 9px;
}

.toast-message.success {
  color: var(--sa-success);
}

.toast-message.danger {
  color: var(--sa-danger);
}

.events-card {
  position: relative;
  overflow: visible;
}

.table-toolbar {
  min-height: 57px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--sa-border-soft);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tabs {
  display: flex;
  align-items: center;
  padding: 3px;
  border: 1px solid var(--sa-border);
  border-radius: 8px;
  background: #f8f9fb;
}

.status-tab {
  padding: 7px 12px;
  border: none;
  border-radius: 6px;
  color: var(--sa-text-secondary);
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.status-tab:hover {
  color: var(--sa-text);
}

.status-tab.active {
  color: var(--sa-text);
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .08);
  font-weight: 600;
}

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
  border-color: var(--sa-primary);
  color: var(--sa-primary);
}

.filter-count {
  min-width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background: var(--sa-primary);
  font-size: 7px;
  font-weight: 700;
}

.filter-popover {
  position: absolute;
  top: 38px;
  left: 0;
  z-index: 50;
  width: 205px;
  padding: 13px;
  border: 1px solid var(--sa-border);
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .12);
}

.filter-title {
  margin-bottom: 3px;
  color: var(--sa-text);
  font-size: 9.5px;
  font-weight: 700;
}

.filter-description {
  margin: 0 0 8px;
  color: var(--sa-text-muted);
  font-size: 7.5px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 6px;
  border-radius: 5px;
  color: var(--sa-text-secondary);
  font-size: 9px;
  cursor: pointer;
}

.filter-option:hover,
.filter-option.selected {
  color: var(--sa-text);
  background: var(--sa-primary-soft);
}

.filter-option input,
.admin-option input {
  width: 13px;
  height: 13px;
  accent-color: var(--sa-primary);
  cursor: pointer;
}

.clear-filter {
  width: 100%;
  margin-top: 7px;
  padding-top: 8px;
  border: none;
  border-top: 1px solid var(--sa-border-soft);
  color: var(--sa-primary);
  background: transparent;
  font-size: 8px;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.events-table th {
  height: 43px;
  padding: 0 18px;
  color: #8b99ae;
  background: #fafbfc;
  font-size: 8.5px;
  font-weight: 600;
  text-align: left;
}

.events-table td {
  height: 78px;
  padding: 10px 18px;
  border-top: 1px solid var(--sa-border-soft);
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
  border: 1px solid var(--sa-border);
  border-radius: 8px;
  color: var(--sa-text-muted);
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
  color: var(--sa-text);
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.event-info span {
  overflow: hidden;
  color: var(--sa-text-muted);
  font-size: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-info strong {
  color: var(--sa-text);
  font-size: 8.5px;
}

.date-info span {
  color: var(--sa-text-secondary);
  font-size: 8px;
}

.registration-info {
  position: relative;
  width: 105px;
}

.registration-number {
  display: flex;
  align-items: baseline;
}

.registration-number strong {
  color: var(--sa-text);
  font-size: 9px;
}

.registration-number span {
  color: var(--sa-text-muted);
  font-size: 8px;
}

.registration-percent {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--sa-text-secondary);
  font-size: 8px;
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
  color: var(--sa-text-muted);
  font-size: 9px;
}

.event-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 8px;
  font-weight: 600;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.event-status.published {
  color: #27ae68;
  background: #e9f9f1;
}

.event-status.published .status-dot {
  background: #27ae68;
}

.event-status.pending {
  color: #eea328;
  background: #fff5df;
}

.event-status.pending .status-dot {
  background: #eea328;
}

.event-status.rejected {
  color: #ed6371;
  background: #fff0f2;
}

.event-status.rejected .status-dot {
  background: #ed6371;
}

.event-status.draft {
  color: #65748b;
  background: #f0f3f7;
}

.event-status.draft .status-dot {
  background: #8b99ae;
}

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
  color: var(--sa-primary);
  background: var(--sa-primary-soft);
}

.icon-action.admin-action:hover {
  color: #64748b;
  background: #eef2f7;
}

.icon-action.danger:hover {
  color: var(--sa-danger);
  background: #fff0f0;
}

.empty-cell {
  height: 250px !important;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--sa-text-muted);
}

.empty-state strong {
  color: var(--sa-text);
  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}

.modal-footer {
  min-height: 53px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--sa-border-soft);
  color: var(--sa-text-secondary);
  font-size: 8.5px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, .38);
}

.modal-header {
  min-height: 75px;
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--sa-border-soft);
}

.modal-eyebrow {
  color: var(--sa-primary);
  font-size: 7.5px;
  font-weight: 700;
  text-transform: uppercase;
}

.modal-header h2 {
  margin: 4px 0 0;
  color: var(--sa-text);
  font-size: 15px;
}

.modal-header p {
  margin: 4px 0 0;
  color: var(--sa-text-muted);
  font-size: 8.5px;
}

.modal-close {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sa-border);
  border-radius: 6px;
  color: var(--sa-text-secondary);
  background: #fff;
  cursor: pointer;
}

.admins-modal {
  width: min(560px, 100%);
  overflow: hidden;
  border: 1px solid var(--sa-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 22px 60px rgba(15, 23, 42, .18);
}

.admins-content {
  max-height: 460px;
  overflow-y: auto;
  padding: 18px 20px;
}

.section-title {
  margin-bottom: 9px;
  color: var(--sa-text);
  font-size: 10px;
  font-weight: 700;
}

.admin-description {
  margin: -2px 0 10px;
  color: var(--sa-text-muted);
  font-size: 8px;
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
  border: 1px solid var(--sa-border);
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
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-info strong {
  color: var(--sa-text);
  font-size: 9px;
}

.admin-info span {
  color: var(--sa-text-muted);
  font-size: 7.5px;
}

.no-admins {
  padding: 13px;
  border: 1px dashed var(--sa-border);
  border-radius: 7px;
  color: var(--sa-text-muted);
  font-size: 8.5px;
  text-align: center;
}

.section-divider {
  height: 1px;
  margin: 18px 0;
  background: var(--sa-border-soft);
}

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
  border: 1px solid var(--sa-border);
  border-radius: 8px;
  cursor: pointer;
}

.admin-option:hover,
.admin-option.selected {
  border-color: var(--sa-primary);
  background: var(--sa-primary-soft);
}

.admin-option-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-option-info strong {
  overflow: hidden;
  color: var(--sa-text);
  font-size: 8.5px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.admin-option-info small {
  color: var(--sa-text-muted);
  font-size: 7.5px;
}

.actions-footer {
  justify-content: flex-end;
  gap: 8px;
}

.delete-modal {
  width: min(390px, 100%);
  padding: 25px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 22px 60px rgba(15, 23, 42, .18);
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
  color: var(--sa-danger);
  background: #fff0f0;
}

.delete-modal h2 {
  margin: 0;
  color: var(--sa-text);
  font-size: 15px;
}

.delete-modal p {
  margin: 8px 0 20px;
  color: var(--sa-text-secondary);
  font-size: 9px;
  line-height: 1.6;
}

.delete-modal p strong {
  color: var(--sa-text);
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.delete-confirm {
  border: 1px solid var(--sa-danger) !important;
  color: #fff !important;
  background: var(--sa-danger) !important;
}

.delete-confirm:hover {
  opacity: .9;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity .18s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: opacity .18s ease, transform .18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 900px) {

  .events-table {
    min-width: 900px;
  }

  .search-section .sa-search {
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