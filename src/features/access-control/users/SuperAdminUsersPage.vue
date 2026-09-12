<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import ManageRoleModal from '../ManageRoleModal.vue'
import { consoleAdminUsers, governanceLog } from './userData.js'

const router = useRouter()
const search = ref('')

const admins = ref([...consoleAdminUsers])

const filtered = computed(() =>
  admins.value.filter((a) => a.name.toLowerCase().includes(search.value.toLowerCase())),
)

const stats = computed(() => ({
  activeAdmins: admins.value.filter((a) => a.role === 'Admin' && a.status === 'Active').length + 17,
  systemUsers: 12840,
  disabled: admins.value.filter((a) => a.status === 'Disabled').length,
}))

const modalOpen = ref(false)
const userBeingManaged = ref(null)

function openManage(user) {
  userBeingManaged.value = user
  modalOpen.value = true
}

function saveRole(newRole) {
  if (userBeingManaged.value) userBeingManaged.value.role = newRole
  modalOpen.value = false
}

function enableAccount(user) {
  user.status = 'Active'
}

function disableAccount(user) {
  user.status = 'Disabled'
}

</script>

<template>

  <div class="console-body">
    <div class="console-stat-grid">
      <div class="console-stat">
        <div class="label">Total Active Admins</div>
        <div class="value">{{ stats.activeAdmins }}</div>
      </div>
      <div class="console-stat">
        <div class="label">System Users</div>
        <div class="value">{{ stats.systemUsers.toLocaleString() }}</div>
      </div>
      <div class="console-stat">
        <div class="label">Disabled Accounts</div>
        <div class="value danger">{{ stats.disabled }}</div>
      </div>
    </div>

    <div class="console-card" style="margin-top: 20px">
      <div class="console-card-header">
        <h2>Administrative Accounts</h2>
        <div class="console-search">
          <Icon name="search" :size="15" />
          <input v-model="search" class="console-input" placeholder="Search Admins..." />
        </div>
      </div>

      <div class="console-table-scroll">
        <table class="console-table">
          <thead>
            <tr>
              <th>Full Name &amp; ID</th>
              <th>System Role</th>
              <th>Permissions</th>
              <th>Account Status</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filtered" :key="user.id">
              <td>
                <div class="console-event-cell">
                  <img :src="user.avatar" :alt="user.name" class="console-avatar" />
                  <div>
                    <div style="font-weight: 700">{{ user.name }}</div>
                    <div class="console-muted-sm">#{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="console-pill" :class="user.role === 'Admin' ? 'console-pill-blue' : 'console-pill-gray'">
                  {{ user.role.toUpperCase() }}
                </span>
              </td>
              <td>
                <div v-if="user.permissions.length" style="display: flex; gap: 6px; flex-wrap: wrap">
                  <span v-for="p in user.permissions" :key="p" class="console-pill console-pill-outline">{{ p }}</span>
                </div>
                <span v-else class="console-muted-sm">---</span>
              </td>
              <td>
                <span class="console-status" :class="user.status === 'Active' ? 'on' : 'off'">
                  <span class="dot" />
                  {{ user.status }}
                </span>
              </td>
              <td>
                <div style="display: flex; justify-content: flex-end; gap: 8px">
                  <template v-if="user.status === 'Active'">
                    <button type="button" class="console-btn console-btn-outline console-btn-sm" @click="openManage(user)">
                      Manage Role
                    </button>
                    <button type="button" class="console-icon-btn" title="Disable account" @click="disableAccount(user)">
                      <Icon name="user-x" :size="15" />
                    </button>
                  </template>
                  <button v-else type="button" class="console-btn console-btn-primary console-btn-sm" @click="enableAccount(user)">
                    Enable Account
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="5" style="text-align: center; color: var(--console-text-muted); padding: 32px">
                No admins match "{{ search }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="console-governance-card">
      <div class="console-governance-header">
        <div>
          <h2>System Governance Audit Log</h2>
          <p>Live monitoring of all administrative actions.</p>
        </div>
        <button type="button" class="console-btn console-btn-outline console-btn-sm dark" @click="router.push('/super-admin/audit-logs')">
          View Full Logs
        </button>
      </div>
      <ul class="console-governance-list">
        <li v-for="item in governanceLog" :key="item.id">
          <span class="console-governance-icon" :class="item.tone">
            <Icon :name="item.icon" :size="14" />
          </span>
          <div>
            <p>{{ item.text }}</p>
            <span class="console-governance-meta">{{ item.meta }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <ManageRoleModal
    :open="modalOpen"
    :current-role="userBeingManaged?.role"
    @close="modalOpen = false"
    @save="saveRole"
  />
</template>

<style scoped>
.console-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.console-table {
  min-width: 840px;
}

@media (max-width: 720px) {
  .console-stat-grid {
    grid-template-columns: 1fr;
  }
}

.console-event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-muted-sm {
  font-size: var(--console-fs-sm);
  color: var(--console-text-muted);
  margin-top: 2px;
}

.console-governance-card {
  margin-top: 20px;
  background: #14161f;
  border-radius: var(--console-radius-lg);
  padding: 22px;
  color: #fff;
}

.console-governance-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.console-governance-header h2 {
  margin: 0 0 4px;
  font-size: var(--console-fs-md);
}

.console-governance-header p {
  margin: 0;
  font-size: var(--console-fs-sm);
  color: #9aa1b4;
}

.console-btn-outline.dark {
  background: #ffffff;
  border-color: transparent;
}

.console-governance-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.console-governance-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #1c1f2b;
  border-radius: var(--console-radius);
  padding: 12px 14px;
}

.console-governance-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.console-governance-icon.green {
  background: rgba(22, 163, 74, 0.2);
  color: #4ade80;
}

.console-governance-icon.amber {
  background: rgba(217, 119, 6, 0.2);
  color: #fbbf24;
}

.console-governance-list p {
  margin: 0 0 2px;
  font-size: var(--console-fs-base);
  line-height: 1.4;
}

.console-governance-meta {
  font-size: var(--console-fs-xs);
  color: #8b93a7;
}
</style>
