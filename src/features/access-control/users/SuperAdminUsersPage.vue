<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import { useAuth } from '@/features/auth/public.js'
import { useToast } from '@/shared/composables/useToast.js'
import UserRolesModal from './UserRolesModal.vue'
import { getUserStats, listRoles, listUsers, replaceUserRoles, updateUserStatus } from './usersApi.js'

const { currentUser } = useAuth()
const { showToast } = useToast()
const search = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const users = ref([])
const roles = ref([])
const stats = ref({ activeAdministrators: 0, totalUsers: 0, disabledAccounts: 0 })
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const modalOpen = ref(false)
const userBeingManaged = ref(null)
let searchTimer

const roleOptions = computed(() => roles.value.map((role) => ({
  ...role,
  permissions: role.permissions ?? [],
})))
const pageStart = computed(() => totalElements.value ? (page.value * 20) + 1 : 0)
const pageEnd = computed(() => Math.min((page.value + 1) * 20, totalElements.value))

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function readableStatus(status) {
  return status.split('_').map((word) => word[0] + word.slice(1).toLowerCase()).join(' ')
}

function formatLastLogin(value) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Never'
}

async function loadUsers() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listUsers({
      query: search.value.trim(), status: statusFilter.value, role: roleFilter.value,
      page: page.value, size: 20,
    })
    users.value = result.content
    totalPages.value = result.totalPages
    totalElements.value = result.totalElements
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  try {
    const [statsResult, rolesResult] = await Promise.all([getUserStats(), listRoles()])
    stats.value = statsResult
    roles.value = rolesResult
  } catch (error) {
    errorMessage.value = error.message
  }
}

function openManage(user) {
  userBeingManaged.value = user
  modalOpen.value = true
}

async function saveRoles(roleCodes) {
  if (!userBeingManaged.value) return
  saving.value = true
  try {
    await replaceUserRoles(userBeingManaged.value.userId, roleCodes, userBeingManaged.value.version)
    modalOpen.value = false
    showToast({ title: 'User roles updated.', variant: 'success' })
    await Promise.all([loadUsers(), loadSummary()])
  } catch (error) {
    showToast({ title: error.message, variant: 'danger' })
  } finally {
    saving.value = false
  }
}

async function setStatus(user, status) {
  saving.value = true
  try {
    await updateUserStatus(user.userId, status, user.version)
    showToast({
      title: status === 'ACTIVE' ? 'Account enabled.' : 'Account disabled and sessions revoked.',
      variant: 'success',
    })
    await Promise.all([loadUsers(), loadSummary()])
  } catch (error) {
    showToast({ title: error.message, variant: 'danger' })
  } finally {
    saving.value = false
  }
}

watch(search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => { page.value = 0; loadUsers() }, 300)
})
watch([statusFilter, roleFilter], () => { page.value = 0; loadUsers() })
watch(page, loadUsers)
onBeforeUnmount(() => window.clearTimeout(searchTimer))
onMounted(() => Promise.all([loadUsers(), loadSummary()]))
</script>

<template>
  <div class="console-body">
    <div v-if="errorMessage" class="console-alert console-alert-danger">{{ errorMessage }}</div>

    <div class="console-stat-grid">
      <div class="console-stat">
        <div class="label">Active Administrators</div>
        <div class="value">{{ stats.activeAdministrators.toLocaleString() }}</div>
      </div>
      <div class="console-stat">
        <div class="label">System Users</div>
        <div class="value">{{ stats.totalUsers.toLocaleString() }}</div>
      </div>
      <div class="console-stat">
        <div class="label">Disabled Accounts</div>
        <div class="value danger">{{ stats.disabledAccounts.toLocaleString() }}</div>
      </div>
    </div>

    <div class="console-card users-card">
      <div class="console-card-header users-header">
        <div>
          <h2>System Accounts</h2>
          <p class="console-muted-sm">{{ totalElements.toLocaleString() }} accounts from the authentication database</p>
        </div>
        <div class="filters">
          <div class="console-search">
            <Icon name="search" :size="15" />
            <input v-model="search" class="console-input" placeholder="Search email..." />
          </div>
          <select v-model="roleFilter" class="console-select filter-select" aria-label="Filter by role">
            <option value="">All roles</option>
            <option v-for="role in roles" :key="role.code" :value="role.code">{{ role.name }}</option>
          </select>
          <select v-model="statusFilter" class="console-select filter-select" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending verification</option>
            <option value="INVITED">Invited</option>
          </select>
        </div>
      </div>

      <div class="console-table-scroll">
        <table class="console-table">
          <thead>
            <tr>
              <th>User</th>
              <th>System Roles</th>
              <th>Account Status</th>
              <th>Last Login</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId">
              <td>
                <div class="console-event-cell">
                  <span class="user-initials">{{ initials(user.displayName) }}</span>
                  <div>
                    <div class="user-name">{{ user.displayName }}</div>
                    <div class="console-muted-sm">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="pill-list">
                  <span v-for="role in user.roles" :key="role.code" class="console-pill console-pill-blue">{{ role.name }}</span>
                  <span v-if="!user.roles.length" class="console-muted-sm">No role</span>
                </div>
              </td>
              <td>
                <span class="console-status" :class="user.status === 'ACTIVE' ? 'on' : 'off'">
                  <span class="dot" />{{ readableStatus(user.status) }}
                </span>
              </td>
              <td><span class="last-login">{{ formatLastLogin(user.lastLoginAt) }}</span></td>
              <td>
                <div class="actions">
                  <button type="button" class="console-btn console-btn-outline console-btn-sm" :disabled="saving" @click="openManage(user)">Manage Roles</button>
                  <button
                    v-if="user.status === 'ACTIVE'"
                    type="button"
                    class="console-btn console-btn-outline console-btn-sm danger-action"
                    :disabled="saving || user.userId === currentUser?.userId"
                    :title="user.userId === currentUser?.userId ? 'You cannot disable your own account' : 'Disable account'"
                    @click="setStatus(user, 'DISABLED')"
                  >Disable</button>
                  <button v-else type="button" class="console-btn console-btn-primary console-btn-sm" :disabled="saving" @click="setStatus(user, 'ACTIVE')">Enable</button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !users.length"><td colspan="5" class="empty-state">No users match the current filters.</td></tr>
            <tr v-if="loading"><td colspan="5" class="empty-state">Loading users...</td></tr>
          </tbody>
        </table>
      </div>

      <div class="console-pagination">
        <span>Showing {{ pageStart }}–{{ pageEnd }} of {{ totalElements.toLocaleString() }} users</span>
        <div class="console-pagination-controls">
          <button class="console-page-num" :disabled="page === 0 || loading" @click="page--"><Icon name="chevron-left" :size="14" /></button>
          <button class="console-page-num active">{{ totalPages ? page + 1 : 0 }}</button>
          <button class="console-page-num" :disabled="page + 1 >= totalPages || loading" @click="page++"><Icon name="chevron-right" :size="14" /></button>
        </div>
      </div>
    </div>
  </div>

  <UserRolesModal
    :open="modalOpen"
    :current-roles="userBeingManaged?.roles.map((role) => role.code) ?? []"
    :roles="roleOptions"
    :saving="saving"
    @close="modalOpen = false"
    @save="saveRoles"
  />
</template>

<style scoped>
.console-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.users-card { margin-top: 20px; }
.users-header { gap: 16px; flex-wrap: wrap; }
.users-header h2 { margin-bottom: 3px; }
.filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-select { width: auto; min-width: 145px; }
.console-table { min-width: 920px; }
.console-event-cell, .pill-list, .actions { display: flex; align-items: center; gap: 8px; }
.pill-list { flex-wrap: wrap; }
.actions { justify-content: flex-end; }
.user-name { font-weight: 700; }
.user-initials { width: 38px; height: 38px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: #eef2ff; color: #4f46e5; font-weight: 750; font-size: 13px; }
.console-muted-sm { font-size: var(--console-fs-sm); color: var(--console-text-muted); margin-top: 2px; }
.empty-state { text-align: center; color: var(--console-text-muted); padding: 32px; }
.last-login { color: var(--console-text-secondary); white-space: nowrap; font-size: var(--console-fs-sm); }
.users-card .console-pagination { padding: 14px 22px; border-top: 1px solid var(--console-border-soft); }
.users-card .console-pagination-controls { gap: 6px; }
.console-alert { margin-bottom: 16px; border: 1px solid #fecaca; border-radius: var(--console-radius); padding: 12px 14px; background: #fef2f2; color: #b91c1c; }
.danger-action { color: #b91c1c; border-color: #fecaca; }
@media (max-width: 720px) {
  .console-stat-grid { grid-template-columns: 1fr; }
  .filters, .console-search, .filter-select { width: 100%; }
}
</style>
