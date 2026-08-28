<script setup>
import { computed, ref } from 'vue'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'

/* =========================================================
   Change Request Data
========================================================= */

const changeRequests = ref([
  {
    id: 1,
    eventName: 'TechCrunch Disrupt 2026',
    submittedBy: 'Elena Rossi',
    role: 'Event Admin',
    submitted: '4 hours ago',
    changeType: '2 fields changed',
    changeTypeClass: 'blue',
    icon: 'calendar',

    avatar:
      'https://i.pravatar.cc/100?img=47',

    changes: [
      {
        field: 'Event Date',
        oldValue: 'Nov 10, 2026',
        newValue: 'Nov 12, 2026',
      },
      {
        field: 'Venue',
        oldValue: 'Pier 48',
        newValue: 'Moscone Center',
      },
    ],

    status: 'Pending',
  },

  {
    id: 2,
    eventName: 'Global Food & Wine Expo',
    submittedBy: 'Tom Hayes',
    role: 'Event Admin',
    submitted: 'Yesterday',
    changeType: 'Capacity update',
    changeTypeClass: 'teal',
    icon: 'calendar',

    avatar:
      'https://i.pravatar.cc/100?img=12',

    changes: [
      {
        field: 'Event Capacity',
        oldValue: '4,000 attendees',
        newValue: '5,000 attendees',
      },
    ],

    status: 'Pending',
  },
])

/* =========================================================
   Search
========================================================= */

const searchQuery = ref('')

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return changeRequests.value
  }

  return changeRequests.value.filter((request) => {
    return (
      request.eventName.toLowerCase().includes(query) ||
      request.submittedBy.toLowerCase().includes(query) ||
      request.changeType.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    )
  })
})

/* =========================================================
   Review Modal
========================================================= */

const selectedRequest = ref(null)
const showReviewModal = ref(false)

function openReview(request) {
  selectedRequest.value = request
  showReviewModal.value = true
}

function closeReview() {
  showReviewModal.value = false
  selectedRequest.value = null
}

/* =========================================================
   Approve / Reject
========================================================= */

const actionMessage = ref('')
const actionMessageType = ref('success')

function approveRequest() {
  if (!selectedRequest.value) return

  const request = changeRequests.value.find(
    (item) => item.id === selectedRequest.value.id,
  )

  if (!request) return

  request.status = 'Approved'

  actionMessage.value =
    `${request.eventName} change request approved.`

  actionMessageType.value = 'success'

  closeReview()

  setTimeout(() => {
    actionMessage.value = ''
  }, 3000)
}

function rejectRequest() {
  if (!selectedRequest.value) return

  const request = changeRequests.value.find(
    (item) => item.id === selectedRequest.value.id,
  )

  if (!request) return

  request.status = 'Rejected'

  actionMessage.value =
    `${request.eventName} change request rejected.`

  actionMessageType.value = 'danger'

  closeReview()

  setTimeout(() => {
    actionMessage.value = ''
  }, 3000)
}
</script>

<template>
  <PageTopbar title="Change Requests">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <main class="sa-body change-requests-body">

    <!-- =====================================================
         Page Heading
    ====================================================== -->

    <section class="sa-heading-row page-heading">
      <div class="sa-page-heading">
        <h1>Published Event Changes</h1>

        <p>
          Review requests to update already published event information.
        </p>
      </div>
    </section>

    <!-- =====================================================
         Search
         
         Search intentionally lives inside the page,
         NOT inside the top navigation.
    ====================================================== -->

    <div class="page-search-row">

      <div class="sa-search">
        <Icon
          name="search"
          :size="15"
        />

        <input
          v-model="searchQuery"
          class="sa-input"
          type="text"
          placeholder="Search requests..."
        />
      </div>

      <span
        v-if="searchQuery"
        class="search-result-count"
      >
        {{ filteredRequests.length }}
        {{ filteredRequests.length === 1 ? 'request' : 'requests' }}
      </span>

    </div>

    <!-- =====================================================
         Feedback
    ====================================================== -->

    <Transition name="toast">
      <div
        v-if="actionMessage"
        class="action-message"
        :class="actionMessageType"
      >
        <Icon
          :name="
            actionMessageType === 'success'
              ? 'circle-check'
              : 'circle-x'
          "
          :size="16"
        />

        <span>
          {{ actionMessage }}
        </span>
      </div>
    </Transition>

    <!-- =====================================================
         Request List
    ====================================================== -->

    <section class="request-list">

      <article
        v-for="request in filteredRequests"
        :key="request.id"
        class="sa-card request-card"
      >

        <!-- Left icon -->
        <div
          class="request-icon"
          :class="request.changeTypeClass"
        >
          <Icon
            :name="request.icon"
            :size="20"
          />
        </div>

        <!-- Main information -->
        <div class="request-main">

          <div class="request-title-row">

            <h2>
              {{ request.eventName }}
            </h2>

            <span
              v-if="request.status !== 'Pending'"
              class="status-badge"
              :class="request.status.toLowerCase()"
            >
              {{ request.status }}
            </span>

          </div>

          <div class="request-meta">

            <span>
              <Icon
                name="history"
                :size="12"
              />

              Submitted {{ request.submitted }}
            </span>

            <span class="meta-separator">
              •
            </span>

            <span
              class="change-type"
              :class="request.changeTypeClass"
            >
              <Icon
                name="circle-check"
                :size="11"
              />

              {{ request.changeType }}
            </span>

          </div>

        </div>

        <!-- Requester -->
        <div class="requester">

          <div class="requester-info">
            <strong>
              {{ request.submittedBy }}
            </strong>

            <span>
              {{ request.role }}
            </span>
          </div>

          <img
            :src="request.avatar"
            :alt="request.submittedBy"
            class="requester-avatar"
          />

        </div>

        <!-- Action -->
        <div class="request-action">

          <button
            class="sa-btn"
            :class="
              request.status === 'Pending'
                ? 'sa-btn-primary'
                : 'sa-btn-secondary'
            "
            :disabled="request.status !== 'Pending'"
            @click="openReview(request)"
          >
            {{
              request.status === 'Pending'
                ? 'Review Change'
                : 'Reviewed'
            }}
          </button>

        </div>

      </article>

      <!-- ===================================================
           Empty state
      ==================================================== -->

      <div
        v-if="filteredRequests.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <Icon
            name="search"
            :size="22"
          />
        </div>

        <h3>No change requests found</h3>

        <p>
          Try searching with a different event name,
          requester, or change type.
        </p>
      </div>

    </section>

    <!-- =====================================================
         Review Modal
    ====================================================== -->

    <Transition name="modal">
      <div
        v-if="showReviewModal && selectedRequest"
        class="modal-backdrop"
        @click.self="closeReview"
      >

        <div class="review-modal">

          <!-- Header -->
          <div class="modal-header">

            <div>
              <span class="modal-eyebrow">
                Change Request
              </span>

              <h2>
                {{ selectedRequest.eventName }}
              </h2>
            </div>

            <button
              class="modal-close"
              @click="closeReview"
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
              :src="selectedRequest.avatar"
              :alt="selectedRequest.submittedBy"
              class="modal-avatar"
            />

            <div>
              <strong>
                {{ selectedRequest.submittedBy }}
              </strong>

              <span>
                {{ selectedRequest.role }}
                · Submitted {{ selectedRequest.submitted }}
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
                v-for="change in selectedRequest.changes"
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
              class="sa-btn sa-btn-secondary"
              @click="closeReview"
            >
              Cancel
            </button>

            <button
              class="sa-btn reject-btn"
              @click="rejectRequest"
            >
              <Icon
                name="x"
                :size="14"
              />

              Reject
            </button>

            <button
              class="sa-btn sa-btn-primary"
              @click="approveRequest"
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

  </main>
</template>

<style scoped>
/* =========================================================
   Page
========================================================= */

.change-requests-body {
  padding-bottom: 28px;
}

.page-heading {
  margin-bottom: 15px;
}


/* =========================================================
   Search
========================================================= */

.page-search-row {
  display: flex;
  align-items: center;
  gap: 10px;

  margin-bottom: 16px;
}

.page-search-row .sa-search {
  width: 310px;
}

.search-result-count {
  color: var(--sa-text-muted);
  font-size: 9px;
}


/* =========================================================
   Toast
========================================================= */

.action-message {
  display: flex;
  align-items: center;
  gap: 8px;

  width: fit-content;

  margin-bottom: 14px;
  padding: 9px 12px;

  border: 1px solid var(--sa-border);
  border-radius: 7px;

  background: #fff;

  box-shadow: var(--sa-shadow);

  font-size: 9.5px;
}

.action-message.success {
  color: var(--sa-success);
}

.action-message.danger {
  color: var(--sa-danger);
}


/* =========================================================
   Request List
========================================================= */

.request-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.request-card {
  min-height: 82px;

  padding: 18px 20px;

  display: grid;

  grid-template-columns:
    52px
    minmax(230px, 1fr)
    150px
    auto;

  align-items: center;

  gap: 14px;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.request-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--sa-shadow);
}


/* =========================================================
   Request icon
========================================================= */

.request-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.request-icon.blue {
  color: var(--sa-primary);
  background: var(--sa-primary-soft);
}

.request-icon.teal {
  color: #20aaa6;
  background: #e3f8f6;
}


/* =========================================================
   Request information
========================================================= */

.request-main {
  min-width: 0;
}

.request-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-title-row h2 {
  margin: 0;

  overflow: hidden;

  color: var(--sa-text);

  font-size: 13px;
  line-height: 1.2;

  font-weight: 700;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.request-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 5px;

  margin-top: 7px;

  color: var(--sa-text-muted);

  font-size: 8.5px;
}

.request-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-separator {
  color: var(--sa-border);
}

.change-type.blue {
  color: var(--sa-primary);
}

.change-type.teal {
  color: #20aaa6;
}


/* =========================================================
   Requester
========================================================= */

.requester {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 9px;
}

.requester-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  gap: 3px;
}

.requester-info strong {
  color: var(--sa-text);

  font-size: 9.5px;
}

.requester-info span {
  color: var(--sa-text-muted);

  font-size: 8px;
}

.requester-avatar {
  width: 36px;
  height: 36px;

  object-fit: cover;

  border-radius: 50%;
}


/* =========================================================
   Action
========================================================= */

.request-action {
  padding-left: 4px;

  border-left: 1px solid var(--sa-border-soft);
}

.request-action .sa-btn {
  min-width: 121px;
}

.request-action .sa-btn:disabled {
  cursor: default;

  opacity: 0.65;
}


/* =========================================================
   Status
========================================================= */

.status-badge {
  padding: 3px 7px;

  border-radius: 5px;

  font-size: 7.5px;
  font-weight: 700;
}

.status-badge.approved {
  color: var(--sa-success);
  background: #eaf8f0;
}

.status-badge.rejected {
  color: var(--sa-danger);
  background: #fff0f0;
}


/* =========================================================
   Empty state
========================================================= */

.empty-state {
  min-height: 220px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px dashed var(--sa-border);

  border-radius: 10px;

  background: #fff;

  text-align: center;
}

.empty-icon {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  color: var(--sa-text-muted);

  border-radius: 10px;

  background: var(--sa-gray-bg);
}

.empty-state h3 {
  margin: 0;

  color: var(--sa-text);

  font-size: 12px;
}

.empty-state p {
  max-width: 300px;

  margin: 6px 0 0;

  color: var(--sa-text-muted);

  font-size: 9px;
  line-height: 1.5;
}


/* =========================================================
   Modal
========================================================= */

.modal-backdrop {
  position: fixed;

  inset: 0;

  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(15, 23, 42, 0.35);
}

.review-modal {
  width: min(650px, 100%);

  overflow: hidden;

  border: 1px solid var(--sa-border);

  border-radius: 12px;

  background: #fff;

  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.18);
}


/* =========================================================
   Modal header
========================================================= */

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  padding: 20px 22px;

  border-bottom: 1px solid var(--sa-border-soft);
}

.modal-eyebrow {
  color: var(--sa-primary);

  font-size: 8px;

  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.modal-header h2 {
  margin: 5px 0 0;

  color: var(--sa-text);

  font-size: 16px;
}

.modal-close {
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--sa-border);

  border-radius: 7px;

  color: var(--sa-text-secondary);

  background: #fff;

  cursor: pointer;
}

.modal-close:hover {
  background: var(--sa-gray-bg);
}


/* =========================================================
   Modal requester
========================================================= */

.modal-requester {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 15px 22px;

  background: #fafbfc;
}

.modal-avatar {
  width: 34px;
  height: 34px;

  object-fit: cover;

  border-radius: 50%;
}

.modal-requester div {
  display: flex;
  flex-direction: column;

  gap: 3px;
}

.modal-requester strong {
  color: var(--sa-text);

  font-size: 10px;
}

.modal-requester span {
  color: var(--sa-text-muted);

  font-size: 8.5px;
}


/* =========================================================
   Changes
========================================================= */

.changes-section {
  padding: 18px 22px;
}

.changes-section h3 {
  margin: 0 0 10px;

  color: var(--sa-text);

  font-size: 11px;
}

.changes-table {
  overflow: hidden;

  border: 1px solid var(--sa-border);

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
  color: var(--sa-text-muted);

  background: var(--sa-gray-bg);

  font-size: 8px;
  font-weight: 600;
}

.change-table-row {
  border-top: 1px solid var(--sa-border-soft);

  font-size: 8.5px;
}

.change-table-row strong {
  color: var(--sa-text);
}

.old-value {
  color: var(--sa-text-secondary);
}

.new-value {
  color: var(--sa-primary);

  font-weight: 600;
}


/* =========================================================
   Modal actions
========================================================= */

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 8px;

  padding: 14px 22px;

  border-top: 1px solid var(--sa-border-soft);
}

.reject-btn {
  color: var(--sa-danger) !important;

  border: 1px solid #ffd3d3 !important;

  background: #fff !important;
}

.reject-btn:hover {
  background: #fff5f5 !important;
}


/* =========================================================
   Footer
========================================================= */

.change-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px 2px 0;

  color: var(--sa-text-secondary);

  font-size: 8.5px;
}


/* =========================================================
   Transitions
========================================================= */

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-active .review-modal,
.modal-leave-active .review-modal {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .review-modal,
.modal-leave-to .review-modal {
  opacity: 0;
  transform: translateY(8px);
}


/* =========================================================
   Responsive
========================================================= */

@media (max-width: 1000px) {
  .request-card {
    grid-template-columns:
      48px
      minmax(200px, 1fr)
      130px
      auto;
  }

  .requester-info {
    display: none;
  }
}

@media (max-width: 760px) {
  .request-card {
    grid-template-columns:
      48px
      minmax(0, 1fr)
      auto;
  }

  .requester {
    display: none;
  }

  .request-action {
    border-left: none;
  }

  .page-search-row .sa-search {
    width: 100%;
  }

  .change-table-header,
  .change-table-row {
    grid-template-columns:
      1fr
      1fr
      1fr;
  }
}

@media (max-width: 520px) {
  .request-card {
    grid-template-columns: 42px 1fr;
  }

  .request-action {
    grid-column: 1 / -1;

    padding: 10px 0 0;

    border-top: 1px solid var(--sa-border-soft);
  }

  .request-action .sa-btn {
    width: 100%;
  }

  .modal-actions {
    flex-wrap: wrap;
  }
}
</style>