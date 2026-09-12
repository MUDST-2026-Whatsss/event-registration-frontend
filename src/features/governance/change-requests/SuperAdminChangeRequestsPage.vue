<script setup>
import { computed, ref } from 'vue'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import { changeRequests as changeRequestSeed } from './changeRequestData.js'
import ChangeRequestReviewModal from './ChangeRequestReviewModal.vue'

/* =========================================================
   Change Request Data
========================================================= */

const changeRequests = ref([...changeRequestSeed])

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

  <main class="console-body change-requests-body">

    <!-- =====================================================
         Page Heading
    ====================================================== -->

    <section class="console-heading-row page-heading">
      <div class="console-page-heading">
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

      <div class="console-search">
        <Icon
          name="search"
          :size="15"
        />

        <input
          v-model="searchQuery"
          class="console-input"
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
        class="console-card request-card"
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
            class="console-btn"
            :class="
              request.status === 'Pending'
                ? 'console-btn-primary'
                : 'console-btn-secondary'
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

    <ChangeRequestReviewModal
      :open="showReviewModal"
      :request="selectedRequest"
      @close="closeReview"
      @approve="approveRequest"
      @reject="rejectRequest"
    />

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

.page-search-row .console-search {
  width: 310px;
}

.search-result-count {
  color: var(--console-text-muted);
  font-size: var(--console-fs-xs);
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

  border: 1px solid var(--console-border);
  border-radius: 7px;

  background: #fff;

  box-shadow: var(--console-shadow);

  font-size: var(--console-fs-xs);
}

.action-message.success {
  color: var(--console-success);
}

.action-message.danger {
  color: var(--console-danger);
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
  box-shadow: var(--console-shadow);
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
  color: var(--console-primary);
  background: var(--console-primary-soft);
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

  color: var(--console-text);

  font-size: var(--console-fs-base);
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

  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}

.request-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-separator {
  color: var(--console-border);
}

.change-type.blue {
  color: var(--console-primary);
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
  color: var(--console-text);

  font-size: var(--console-fs-xs);
}

.requester-info span {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
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

  border-left: 1px solid var(--console-border-soft);
}

.request-action .console-btn {
  min-width: 121px;
}

.request-action .console-btn:disabled {
  cursor: default;

  opacity: 0.65;
}


/* =========================================================
   Status
========================================================= */

.status-badge {
  padding: 3px 7px;

  border-radius: 5px;

  font-size: var(--console-fs-2xs);
  font-weight: 700;
}

.status-badge.approved {
  color: var(--console-success);
  background: #eaf8f0;
}

.status-badge.rejected {
  color: var(--console-danger);
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

  border: 1px dashed var(--console-border);

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

  color: var(--console-text-muted);

  border-radius: 10px;

  background: var(--console-gray-bg);
}

.empty-state h3 {
  margin: 0;

  color: var(--console-text);

  font-size: var(--console-fs-sm);
}

.empty-state p {
  max-width: 300px;

  margin: 6px 0 0;

  color: var(--console-text-muted);

  font-size: var(--console-fs-xs);
  line-height: 1.5;
}


/* =========================================================
   Modal
========================================================= */




/* =========================================================
   Modal header
========================================================= */







/* =========================================================
   Modal requester
========================================================= */







/* =========================================================
   Changes
========================================================= */











/* =========================================================
   Modal actions
========================================================= */





/* =========================================================
   Footer
========================================================= */

.change-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px 2px 0;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-2xs);
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

  .page-search-row .console-search {
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

    border-top: 1px solid var(--console-border-soft);
  }

  .request-action .console-btn {
    width: 100%;
  }

  .modal-actions {
    flex-wrap: wrap;
  }
}
</style>
