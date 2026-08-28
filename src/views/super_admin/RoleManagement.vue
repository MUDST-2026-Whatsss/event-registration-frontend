<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'
import ManageRoleModal from '../../components/super_admin/ManageRoleModal.vue'

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
  <PageTopbar title="Role Management">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <div class="sa-body">
    <div class="sa-heading-row">
      <div class="sa-page-heading">
        <h1>Role Management</h1>
        <p>Manage system roles, permissions and account status.</p>
      </div>
      <button type="button" class="sa-btn sa-btn-primary" @click="router.push('/super-admin/role-management/new')">
        Create New Role
      </button>
    </div>

    <div class="sa-card">
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
              <th>Role Name</th>
              <th>Role Status</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.name">
              <td style="font-weight: 700">{{ role.name }}</td>
              <td>
                <span class="sa-status" :class="role.status === 'Active' ? 'on' : 'off'">
                  <span class="dot" />
                  {{ role.status }}
                </span>
              </td>
              <td>
                <div style="display: flex; justify-content: flex-end; gap: 8px">
                  <button type="button" class="sa-btn sa-btn-outline sa-btn-sm" @click="openManage(role)">
                    Manage Role
                  </button>
                  <button
                    type="button"
                    class="sa-icon-btn"
                    :title="role.status === 'Active' ? 'Disable role' : 'Enable role'"
                    @click="toggleRoleStatus(role)"
                  >
                    <Icon :name="role.status === 'Active' ? 'user-x' : 'user-check'" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredRoles.length">
              <td colspan="3" style="text-align: center; color: var(--sa-text-muted); padding: 32px">
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
