<script setup>
import { computed, onMounted, ref } from 'vue'
import { ConsoleIcon as Icon, ConsolePageHeader } from '@/features/console-shell/public.js'
import { getUserStats } from '@/features/access-control/users/usersApi.js'
import { listChangeRequests, listEventReviews } from '@/features/governance/governanceApi.js'
import {
  listAuditLogs,
  listSessionActivity,
  listSignInActivity,
} from '@/features/governance/audit/auditApi.js'

const userStats = ref({
  activeAdministrators: 0,
  totalUsers: 0,
  disabledAccounts: 0,
})
const pendingReviews = ref([])
const pendingChanges = ref([])
const recentAuditLogs = ref([])
const failedSignIns = ref([])
const pendingReviewCount = ref(0)
const pendingChangeCount = ref(0)
const failedSignInCount = ref(0)
const activeSessionCount = ref(0)
const loading = ref(false)
const errorMessage = ref('')

const totalAttention = computed(() => pendingReviewCount.value + pendingChangeCount.value)

const kpis = computed(() => [
  {
    label: 'Pending Event Approvals',
    value: pendingReviewCount.value,
    note: 'Awaiting final review',
    icon: 'shield-check',
    tone: 'warning',
    to: '/super-admin/event-approvals',
  },
  {
    label: 'Pending Change Requests',
    value: pendingChangeCount.value,
    note: 'Published event updates',
    icon: 'repeat',
    tone: 'primary',
    to: '/super-admin/change-requests',
  },
  {
    label: 'Active Administrators',
    value: userStats.value.activeAdministrators,
    note: userStats.value.totalUsers + ' system users',
    icon: 'user-check',
    tone: 'success',
    to: '/super-admin/user-management',
  },
  {
    label: 'Failed Sign-ins',
    value: failedSignInCount.value,
    note: 'During the last 24 hours',
    icon: 'shield',
    tone: failedSignInCount.value ? 'danger' : 'success',
    to: '/super-admin/audit-logs',
  },
])

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function actionLabel(value = '') {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  const last24Hours = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString()

  try {
    const [
      users,
      reviewPage,
      changePage,
      failedPage,
      sessionPage,
      auditPage,
    ] = await Promise.all([
      getUserStats(),
      listEventReviews({ decision: 'PENDING', page: 0, size: 3 }),
      listChangeRequests({ status: 'PENDING', page: 0, size: 3 }),
      listSignInActivity({ outcome: 'FAILURE', from: last24Hours, page: 0, size: 3 }),
      listSessionActivity({ state: 'ACTIVE', page: 0, size: 1 }),
      listAuditLogs({ page: 0, size: 5 }),
    ])

    userStats.value = users
    pendingReviews.value = reviewPage.content
    pendingChanges.value = changePage.content
    failedSignIns.value = failedPage.content
    recentAuditLogs.value = auditPage.content
    pendingReviewCount.value = reviewPage.totalElements
    pendingChangeCount.value = changePage.totalElements
    failedSignInCount.value = failedPage.totalElements
    activeSessionCount.value = sessionPage.totalElements
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <main class="console-body dashboard-body">
    <ConsolePageHeader
      class="dashboard-header"
      eyebrow="Super admin control center"
      title="Platform Oversight"
      description="Review pending decisions, account security, and administrative activity."
    >
      <template #actions>
        <RouterLink to="/super-admin/event-approvals" class="console-btn console-btn-secondary">
          <Icon name="shield-check" :size="17" />
          Review queue
          <span v-if="totalAttention" class="action-count">{{ totalAttention }}</span>
        </RouterLink>
        <RouterLink to="/super-admin/user-management" class="console-btn console-btn-primary">
          <Icon name="users" :size="17" />
          Manage users
        </RouterLink>
      </template>
    </ConsolePageHeader>

    <p v-if="errorMessage" class="dashboard-alert">{{ errorMessage }}</p>

    <section class="stats-grid" aria-label="Platform governance summary">
      <RouterLink
        v-for="item in kpis"
        :key="item.label"
        :to="item.to"
        class="console-stat dashboard-stat"
      >
        <span class="stat-icon" :class="item.tone">
          <Icon :name="item.icon" :size="18" />
        </span>
        <span class="stat-content">
          <span class="stat-label">{{ item.label }}</span>
          <strong class="stat-value">{{ item.value.toLocaleString() }}</strong>
          <span class="stat-note" :class="item.tone">{{ item.note }}</span>
        </span>
      </RouterLink>
    </section>

    <section class="workspace-grid" :aria-busy="loading">
      <article class="console-card attention-card">
        <div class="console-card-header section-header">
          <div>
            <h2>Requires Attention</h2>
            <p>Decisions currently waiting for a super administrator.</p>
          </div>
          <span class="attention-count">{{ totalAttention.toLocaleString() }}</span>
        </div>

        <div class="queue-grid">
          <section class="queue-group">
            <div class="queue-heading">
              <div>
                <span class="queue-icon warning"><Icon name="shield-check" :size="17" /></span>
                <div>
                  <h3>Event approvals</h3>
                  <p>{{ pendingReviewCount.toLocaleString() }} pending</p>
                </div>
              </div>
              <RouterLink to="/super-admin/event-approvals">Open queue</RouterLink>
            </div>

            <div v-if="pendingReviews.length" class="queue-list">
              <RouterLink
                v-for="review in pendingReviews"
                :key="review.reviewId"
                to="/super-admin/event-approvals"
                class="queue-row"
              >
                <span class="queue-row-icon"><Icon name="calendar" :size="16" /></span>
                <span class="queue-row-copy">
                  <strong>{{ review.event.title }}</strong>
                  <small>{{ review.submittedBy?.email || 'Unknown administrator' }}</small>
                </span>
                <span class="queue-row-meta">
                  <span class="console-pill console-pill-amber">{{ review.priority }}</span>
                  <small>{{ formatDate(review.submittedAt) }}</small>
                </span>
              </RouterLink>
            </div>
            <div v-else class="empty-state">
              <Icon name="circle-check" :size="20" />
              No event approvals are waiting.
            </div>
          </section>

          <section class="queue-group">
            <div class="queue-heading">
              <div>
                <span class="queue-icon primary"><Icon name="repeat" :size="17" /></span>
                <div>
                  <h3>Change requests</h3>
                  <p>{{ pendingChangeCount.toLocaleString() }} pending</p>
                </div>
              </div>
              <RouterLink to="/super-admin/change-requests">Open queue</RouterLink>
            </div>

            <div v-if="pendingChanges.length" class="queue-list">
              <RouterLink
                v-for="request in pendingChanges"
                :key="request.requestId"
                to="/super-admin/change-requests"
                class="queue-row"
              >
                <span class="queue-row-icon"><Icon name="repeat" :size="16" /></span>
                <span class="queue-row-copy">
                  <strong>{{ request.event.title }}</strong>
                  <small>{{ request.requestedBy?.email || 'Unknown administrator' }}</small>
                </span>
                <span class="queue-row-meta">
                  <span class="field-count">{{ request.items.length }} fields</span>
                  <small>{{ formatDate(request.createdAt) }}</small>
                </span>
              </RouterLink>
            </div>
            <div v-else class="empty-state">
              <Icon name="circle-check" :size="20" />
              No change requests are waiting.
            </div>
          </section>
        </div>
      </article>

      <article class="console-card security-card">
        <div class="console-card-header section-header">
          <div>
            <h2>Security &amp; Access</h2>
            <p>Current account and session signals.</p>
          </div>
          <RouterLink to="/super-admin/audit-logs" class="header-link">Audit logs</RouterLink>
        </div>

        <div class="security-summary">
          <div>
            <span>Active sessions</span>
            <strong>{{ activeSessionCount.toLocaleString() }}</strong>
          </div>
          <div>
            <span>Disabled accounts</span>
            <strong :class="{ danger: userStats.disabledAccounts }">
              {{ userStats.disabledAccounts.toLocaleString() }}
            </strong>
          </div>
          <div>
            <span>System users</span>
            <strong>{{ userStats.totalUsers.toLocaleString() }}</strong>
          </div>
        </div>

        <div class="failure-heading">
          <div>
            <h3>Recent failed sign-ins</h3>
            <p>Last 24 hours</p>
          </div>
          <span class="failure-count" :class="{ alert: failedSignInCount }">
            {{ failedSignInCount.toLocaleString() }}
          </span>
        </div>

        <div v-if="failedSignIns.length" class="failure-list">
          <div v-for="attempt in failedSignIns" :key="attempt.loginAttemptId" class="failure-row">
            <span class="failure-icon"><Icon name="user-x" :size="16" /></span>
            <span>
              <strong>{{ attempt.user?.displayName || attempt.user?.email || 'Unknown account' }}</strong>
              <small>{{ attempt.failureReason || 'Authentication failed' }}</small>
            </span>
            <time>{{ formatDate(attempt.attemptedAt) }}</time>
          </div>
        </div>
        <div v-else class="empty-state security-empty">
          <Icon name="shield-check" :size="20" />
          No failed sign-ins in the last 24 hours.
        </div>
      </article>
    </section>

    <section class="console-card activity-card" :aria-busy="loading">
      <div class="console-card-header section-header">
        <div>
          <h2>Recent Administrative Activity</h2>
          <p>Latest governance and access-control changes across the platform.</p>
        </div>
        <RouterLink to="/super-admin/audit-logs" class="header-link">View all activity</RouterLink>
      </div>

      <div v-if="recentAuditLogs.length" class="activity-table-wrap">
        <table class="activity-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Outcome</th>
              <th>Date &amp; time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in recentAuditLogs" :key="log.auditLogId">
              <td>
                <strong>{{ log.actor?.displayName || log.actor?.email || 'System' }}</strong>
                <small>{{ log.actor?.email || 'Automated activity' }}</small>
              </td>
              <td>{{ actionLabel(log.action) }}</td>
              <td>
                <strong>{{ log.targetLabel || '—' }}</strong>
                <small>{{ log.targetType }}</small>
              </td>
              <td>
                <span
                  class="console-pill"
                  :class="log.outcome === 'SUCCESS' ? 'console-pill-green' : 'console-pill-red'"
                >
                  {{ log.outcome }}
                </span>
              </td>
              <td>{{ formatDate(log.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state activity-empty">
        <Icon name="history" :size="20" />
        No administrative activity is available.
      </div>
    </section>
  </main>
</template>

<style scoped>
.dashboard-body {
  padding-bottom: 28px;
}

.dashboard-header {
  margin-bottom: 18px;
}

.dashboard-alert {
  margin: 0 0 16px;
  padding: 13px 15px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--console-danger);
  background: #fff7f7;
  font-size: var(--console-fs-xs);
}

.action-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  background: var(--console-warning);
  font-size: var(--console-fs-2xs);
  font-weight: 750;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.dashboard-stat {
  min-height: 92px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.dashboard-stat:hover {
  transform: translateY(-1px);
  border-color: #cbd5e1;
  box-shadow: var(--console-shadow);
}

.stat-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.stat-icon.primary {
  color: var(--console-primary);
  background: var(--console-primary-soft);
}

.stat-icon.warning {
  color: #d97706;
  background: #fff3df;
}

.stat-icon.success {
  color: var(--console-success);
  background: #e9fbf1;
}

.stat-icon.danger {
  color: var(--console-danger);
  background: #fff0f1;
}

.stat-content {
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "label value"
    "note value";
  align-items: center;
  column-gap: 14px;
  row-gap: 5px;
}

.stat-label {
  grid-area: label;
  color: var(--console-text-secondary);
  font-size: var(--console-fs-xs);
}

.stat-value {
  grid-area: value;
  color: var(--console-text);
  font-size: clamp(1.7rem, 2vw, 2.15rem);
  line-height: 1;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.stat-note {
  grid-area: note;
  color: var(--console-text-muted);
  font-size: var(--console-fs-xs);
}

.stat-note.warning {
  color: var(--console-warning);
}

.stat-note.danger {
  color: var(--console-danger);
}

.stat-note.success {
  color: var(--console-success);
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(340px, 0.7fr);
  gap: 16px;
  align-items: stretch;
}

.attention-card,
.security-card {
  min-width: 0;
  overflow: hidden;
}

.section-header {
  min-height: 64px;
}

.section-header > div:first-child {
  min-width: 0;
}

.section-header h2 {
  margin: 0;
}

.section-header p {
  margin: 4px 0 0;
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
}

.attention-count {
  min-width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #9a6300;
  background: #fff3df;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}

.queue-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.queue-group {
  min-width: 0;
  padding: 16px;
}

.queue-group + .queue-group {
  border-left: 1px solid var(--console-border-soft);
}

.queue-heading,
.queue-heading > div {
  display: flex;
  align-items: center;
}

.queue-heading {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.queue-heading > div {
  min-width: 0;
  gap: 9px;
}

.queue-heading h3,
.failure-heading h3 {
  margin: 0;
  color: var(--console-text);
  font-size: var(--console-fs-sm);
}

.queue-heading p,
.failure-heading p {
  margin: 3px 0 0;
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
}

.queue-heading a,
.header-link {
  flex-shrink: 0;
  color: var(--console-primary);
  font-size: var(--console-fs-2xs);
  font-weight: 650;
  text-decoration: none;
}

.queue-icon,
.queue-row-icon,
.failure-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.queue-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
}

.queue-icon.warning {
  color: #d97706;
  background: #fff3df;
}

.queue-icon.primary {
  color: var(--console-primary);
  background: var(--console-primary-soft);
}

.queue-list {
  border: 1px solid var(--console-border-soft);
  border-radius: 8px;
  overflow: hidden;
}

.queue-row {
  min-height: 62px;
  padding: 9px 10px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--console-border-soft);
}

.queue-row:last-child {
  border-bottom: none;
}

.queue-row:hover {
  background: var(--console-gray-bg);
}

.queue-row-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--console-primary);
  background: var(--console-primary-soft);
}

.queue-row-copy,
.queue-row-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.queue-row-copy {
  gap: 4px;
}

.queue-row-copy strong {
  overflow: hidden;
  color: var(--console-text);
  font-size: var(--console-fs-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-row-copy small,
.queue-row-meta small {
  overflow: hidden;
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-row-meta {
  align-items: flex-end;
  gap: 5px;
  text-align: right;
}

.field-count {
  color: var(--console-primary);
  font-size: var(--console-fs-2xs);
  font-weight: 650;
}

.empty-state {
  min-height: 92px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed var(--console-border);
  border-radius: 8px;
  color: var(--console-success);
  background: #fbfefc;
  font-size: var(--console-fs-xs);
}

.security-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--console-border-soft);
}

.security-summary > div {
  min-width: 0;
  padding: 15px 12px;
  text-align: center;
  border-right: 1px solid var(--console-border-soft);
}

.security-summary > div:last-child {
  border-right: none;
}

.security-summary span {
  display: block;
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
}

.security-summary strong {
  display: block;
  margin-top: 5px;
  color: var(--console-text);
  font-size: var(--console-fs-xl);
  font-variant-numeric: tabular-nums;
}

.security-summary strong.danger {
  color: var(--console-danger);
}

.failure-heading {
  padding: 14px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.failure-count {
  min-width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--console-success);
  background: #e9fbf1;
  font-size: var(--console-fs-xs);
  font-weight: 750;
}

.failure-count.alert {
  color: var(--console-danger);
  background: #fff0f1;
}

.failure-list {
  padding: 0 16px 14px;
}

.failure-row {
  min-height: 52px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  border-top: 1px solid var(--console-border-soft);
}

.failure-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: var(--console-danger);
  background: #fff0f1;
}

.failure-row > span:nth-child(2) {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.failure-row strong {
  overflow: hidden;
  color: var(--console-text);
  font-size: var(--console-fs-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.failure-row small,
.failure-row time {
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
}

.failure-row time {
  text-align: right;
}

.security-empty {
  margin: 0 16px 16px;
  min-height: 84px;
}

.activity-card {
  margin-top: 16px;
  overflow: hidden;
}

.activity-table-wrap {
  overflow-x: auto;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table th,
.activity-table td {
  padding: 11px 16px;
  text-align: left;
  border-bottom: 1px solid var(--console-border-soft);
}

.activity-table th {
  color: var(--console-text-secondary);
  background: var(--console-gray-bg);
  font-size: var(--console-fs-2xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.activity-table td {
  color: var(--console-text-secondary);
  font-size: var(--console-fs-xs);
}

.activity-table tbody tr:last-child td {
  border-bottom: none;
}

.activity-table tbody tr:hover {
  background: #fafbff;
}

.activity-table td:first-child,
.activity-table td:nth-child(3) {
  min-width: 190px;
}

.activity-table td:last-child {
  white-space: nowrap;
}

.activity-table td strong,
.activity-table td small {
  display: block;
}

.activity-table td strong {
  color: var(--console-text);
  font-size: var(--console-fs-xs);
}

.activity-table td small {
  margin-top: 3px;
  color: var(--console-text-muted);
  font-size: var(--console-fs-2xs);
}

.activity-empty {
  margin: 16px;
}

@media (max-width: 1180px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .queue-grid {
    grid-template-columns: 1fr;
  }

  .queue-group + .queue-group {
    border-top: 1px solid var(--console-border-soft);
    border-left: none;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .security-summary {
    grid-template-columns: 1fr;
  }

  .security-summary > div {
    border-right: none;
    border-bottom: 1px solid var(--console-border-soft);
  }

  .security-summary > div:last-child {
    border-bottom: none;
  }

  .queue-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .queue-row-meta {
    grid-column: 2;
    align-items: flex-start;
    text-align: left;
  }

  .failure-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .failure-row time {
    grid-column: 2;
    text-align: left;
  }
}
</style>
