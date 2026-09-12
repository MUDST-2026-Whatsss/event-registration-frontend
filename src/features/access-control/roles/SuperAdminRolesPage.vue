<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import ManageRoleModal from '../ManageRoleModal.vue'

const router = useRouter()
const search = ref('')

const roles = ref([
  { name: 'User', status: 'Active' },
  { name: 'Super Admin', status: 'Disabled' },
])

const filteredRoles = computed(() =>
  roles.value.filter((r) => r.name.toLowerCase().includes(search.value.toLowerCase())),
)

const modalOpen = ref(false)
const roleBeingManaged = ref(null)

function openManage(role) {
  roleBeingManaged.value = role
  modalOpen.value = true
}

function saveRole(newStatus) {
  if (roleBeingManaged.value) {
    roleBeingManaged.value.status = newStatus === 'Disabled' ? 'Disabled' : 'Active'
  }
  modalOpen.value = false
}

function toggleRoleStatus(role) {
  role.status = role.status === 'Active' ? 'Disabled' : 'Active'
}
</script>

<template>

  <div class="console-body">
    <div class="console-heading-row">
      <div class="console-page-heading">
        <h1>Role Management</h1>
        <p>Manage system roles, permissions and account status.</p>
      </div>
      <button type="button" class="console-btn console-btn-primary" @click="router.push('/super-admin/role-management/new')">
        Create New Role
      </button>
    </div>

    <div class="console-card">
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
              <th>Role Name</th>
              <th>Role Status</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.name">
              <td style="font-weight: 700">{{ role.name }}</td>
              <td>
                <span class="console-status" :class="role.status === 'Active' ? 'on' : 'off'">
                  <span class="dot" />
                  {{ role.status }}
                </span>
              </td>
              <td>
                <div style="display: flex; justify-content: flex-end; gap: 8px">
                  <button type="button" class="console-btn console-btn-outline console-btn-sm" @click="openManage(role)">
                    Manage Role
                  </button>
                  <button
                    type="button"
                    class="console-icon-btn"
                    :title="role.status === 'Active' ? 'Disable role' : 'Enable role'"
                    @click="toggleRoleStatus(role)"
                  >
                    <Icon :name="role.status === 'Active' ? 'user-x' : 'user-check'" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredRoles.length">
              <td colspan="3" style="text-align: center; color: var(--console-text-muted); padding: 32px">
                No roles match "{{ search }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <ManageRoleModal
    :open="modalOpen"
    :current-role="roleBeingManaged?.status === 'Disabled' ? 'Disabled' : 'Active'"
    :roles="['Active', 'Disabled']"
    @close="modalOpen = false"
    @save="saveRole"
  />
</template>

<style scoped>
.console-table {
  min-width: 520px;
}

@media (max-width: 600px) {
  .console-card-header .console-search {
    width: 100%;
  }
}
</style>
