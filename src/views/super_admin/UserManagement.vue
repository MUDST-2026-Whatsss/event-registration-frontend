<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'
import ManageRoleModal from '../../components/super_admin/ManageRoleModal.vue'

const router = useRouter()
const search = ref('')

const admins = ref([
  {
    id: 'ADM-0042',
    avatar: 'https://i.pravatar.cc/72?img=47',
    name: 'Sarah Jenkins',
    role: 'Admin',
    permissions: ['Events: All', 'Reg: Full'],
    status: 'Active',
  },
  {
    id: 'ADM-0056',
    avatar: 'https://i.pravatar.cc/72?img=68',
    name: "Liam O'Connor",
    role: 'User',
    permissions: [],
    status: 'Disabled',
  },
])

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

const governanceLog = [
  {
    id: 1,
    icon: 'circle-check',
    tone: 'green',
    text: 'Marcus Webb (Super Admin) approved event "Summer Music Festival"',
    meta: 'Today, 2:42 PM · Action ID: #AUD-99218',
  },
  {
    id: 2,
    icon: 'shield',
    tone: 'amber',
    text: 'System updated role permissions for Admin',
    meta: 'Today, 11:05 AM · Action ID: #AUD-99215',
  },
]
</script>

<template>
  <PageTopbar title="User Management">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <div class="sa-body">
    <div class="sa-stat-grid">
      <div class="sa-stat">
        <div class="label">Total Active Admins</div>
        <div class="value">{{ stats.activeAdmins }}</div>
      </div>
      <div class="sa-stat">
        <div class="label">System Users</div>
        <div class="value">{{ stats.systemUsers.toLocaleString() }}</div>
      </div>
      <div class="sa-stat">
        <div class="label">Disabled Accounts</div>
        <div class="value danger">{{ stats.disabled }}</div>
      </div>
    </div>

    <div class="sa-card" style="margin-top: 20px">
      <div class="sa-card-header">
        <h2>Administrative Accounts</h2>
        <div class="sa-search">
          <Icon name="search" :size="15" />
          <input v-model="search" class="sa-input" placeholder="Search Admins..." />
        </div>
      </div>

      <div class="sa-table-scroll">
        <table class="sa-table">
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
                <div class="sa-event-cell">
                  <img :src="user.avatar" :alt="user.name" class="sa-avatar" />
                  <div>
                    <div style="font-weight: 700">{{ user.name }}</div>
                    <div class="sa-muted-sm">#{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="sa-pill" :class="user.role === 'Admin' ? 'sa-pill-blue' : 'sa-pill-gray'">
                  {{ user.role.toUpperCase() }}
                </span>
              </td>
              <td>
                <div v-if="user.permissions.length" style="display: flex; gap: 6px; flex-wrap: wrap">
                  <span v-for="p in user.permissions" :key="p" class="sa-pill sa-pill-outline">{{ p }}</span>
                </div>
                <span v-else class="sa-muted-sm">---</span>
              </td>
              <td>
                <span class="sa-status" :class="user.status === 'Active' ? 'on' : 'off'">
                  <span class="dot" />
                  {{ user.status }}
                </span>
              </td>
              <td>
                <div style="display: flex; justify-content: flex-end; gap: 8px">
                  <template v-if="user.status === 'Active'">
                    <button type="button" class="sa-btn sa-btn-outline sa-btn-sm" @click="openManage(user)">
                      Manage Role
                    </button>
                    <button type="button" class="sa-icon-btn" title="Disable account" @click="disableAccount(user)">
                      <Icon name="user-x" :size="15" />
                    </button>
                  </template>
                  <button v-else type="button" class="sa-btn sa-btn-primary sa-btn-sm" @click="enableAccount(user)">
                    Enable Account
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="5" style="text-align: center; color: var(--sa-text-muted); padding: 32px">
                No admins match "{{ search }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="sa-governance-card">
      <div class="sa-governance-header">
        <div>
          <h2>System Governance Audit Log</h2>
          <p>Live monitoring of all administrative actions.</p>
        </div>
        <button type="button" class="sa-btn sa-btn-outline sa-btn-sm dark" @click="router.push('/super-admin/audit-logs')">
          View Full Logs
        </button>
      </div>
      <ul class="sa-governance-list">
        <li v-for="item in governanceLog" :key="item.id">
          <span class="sa-governance-icon" :class="item.tone">
            <Icon :name="item.icon" :size="14" />
          </span>
          <div>
            <p>{{ item.text }}</p>
            <span class="sa-governance-meta">{{ item.meta }}</span>
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
.sa-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 720px) {
  .sa-stat-grid {
    grid-template-columns: 1fr;
  }
}

.sa-event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-muted-sm {
  font-size: 12px;
  color: var(--sa-text-muted);
  margin-top: 2px;
}

.sa-governance-card {
  margin-top: 20px;
  background: #14161f;
  border-radius: var(--sa-radius-lg);
  padding: 22px;
  color: #fff;
}

.sa-governance-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.sa-governance-header h2 {
  margin: 0 0 4px;
  font-size: 15px;
}

.sa-governance-header p {
  margin: 0;
  font-size: 12.5px;
  color: #9aa1b4;
}

.sa-btn-outline.dark {
  background: #ffffff;
  border-color: transparent;
}

.sa-governance-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sa-governance-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #1c1f2b;
  border-radius: var(--sa-radius);
  padding: 12px 14px;
}

.sa-governance-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.sa-governance-icon.green {
  background: rgba(22, 163, 74, 0.2);
  color: #4ade80;
}

.sa-governance-icon.amber {
  background: rgba(217, 119, 6, 0.2);
  color: #fbbf24;
}

.sa-governance-list p {
  margin: 0 0 2px;
  font-size: 13px;
  line-height: 1.4;
}

.sa-governance-meta {
  font-size: 11.5px;
  color: #8b93a7;
}
</style>
