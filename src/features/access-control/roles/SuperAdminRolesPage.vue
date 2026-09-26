<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import { useAuth } from '@/features/auth/public.js'
import { useToast } from '@/shared/composables/useToast.js'
import RoleEditorModal from './RoleEditorModal.vue'
import { listPermissions, listRoles, replaceRolePermissions, updateRole } from './rolesApi.js'

const router = useRouter()
const { showToast } = useToast()
const { syncAuth } = useAuth()
const search = ref('')
const roles = ref([])
const permissions = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const modalOpen = ref(false)
const roleBeingManaged = ref(null)

const filteredRoles = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return roles.value
  return roles.value.filter((role) => role.name.toLowerCase().includes(query))
})

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [roleResult, permissionResult] = await Promise.all([listRoles(), listPermissions()])
    roles.value = roleResult
    permissions.value = permissionResult
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

function openManage(role) {
  roleBeingManaged.value = role
  modalOpen.value = true
}

async function saveRole(values) {
  saving.value = true
  try {
    await updateRole(roleBeingManaged.value.roleId, {
      name: values.name,
      description: values.description,
      scopeType: values.scopeType,
      status: values.status,
    })
    const previousPermissions = [...roleBeingManaged.value.permissions].sort()
    const nextPermissions = [...values.permissionCodes].sort()
    if (previousPermissions.join('\u0000') !== nextPermissions.join('\u0000')) {
      await replaceRolePermissions(roleBeingManaged.value.roleId, values.permissionCodes)
    }
    await syncAuth({ force: true })
    modalOpen.value = false
    showToast({ title: 'Role updated.', variant: 'success' })
    await load()
  } catch (error) {
    showToast({ title: error.message, variant: 'danger' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="console-body">
    <div v-if="errorMessage" class="page-alert">{{ errorMessage }}</div>
    <div class="console-heading-row">
      <div class="console-page-heading">
        <h1>Role Management</h1>
        <p>Roles and permissions currently stored in the authentication database.</p>
      </div>
      <button type="button" class="console-btn console-btn-primary" @click="router.push('/super-admin/role-management/new')">Create New Role</button>
    </div>

    <div class="console-card">
      <div class="console-card-header role-header">
        <div><h2>System Roles</h2><p>{{ roles.length }} roles configured</p></div>
        <div class="console-search"><Icon name="search" :size="15" /><input v-model="search" class="console-input" placeholder="Search roles..." /></div>
      </div>
      <div class="console-table-scroll">
        <table class="console-table">
          <thead><tr><th>Role</th><th>Scope</th><th>Permissions</th><th>Assigned Users</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.roleId">
              <td><div class="role-name"><strong>{{ role.name }}</strong><span v-if="role.system"><small>System role</small></span></div></td>
              <td>{{ role.scopeType.replaceAll('_', ' ') }}</td>
              <td><span class="permission-count">{{ role.permissions.length }}</span> permissions</td>
              <td>{{ role.userCount.toLocaleString() }}</td>
              <td><span class="console-status" :class="role.status === 'ACTIVE' ? 'on' : 'off'"><span class="dot" />{{ role.status === 'ACTIVE' ? 'Active' : 'Inactive' }}</span></td>
              <td><div class="actions"><button class="console-btn console-btn-outline console-btn-sm" @click="openManage(role)">Manage Role</button></div></td>
            </tr>
            <tr v-if="loading"><td colspan="6" class="empty">Loading roles...</td></tr>
            <tr v-else-if="!filteredRoles.length"><td colspan="6" class="empty">No roles match "{{ search }}".</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <RoleEditorModal :open="modalOpen" :role="roleBeingManaged" :permissions="permissions" :saving="saving" @close="modalOpen = false" @save="saveRole" />
</template>

<style scoped>
.console-table { min-width: 880px; }
.role-header { flex-wrap: wrap; gap: 12px; }
.role-header h2 { margin-bottom: 2px; }
.role-header p { margin: 0; color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.role-name { display: grid; gap: 4px; }
.role-name > span { color: var(--console-text-muted); font-size: var(--console-fs-xs); }
.role-name small { padding: 2px 6px; border-radius: 999px; background: var(--console-gray-bg); }
.permission-count { font-weight: 750; color: var(--console-primary-text); }
.actions { display: flex; justify-content: flex-end; }
.empty { text-align: center; color: var(--console-text-muted); padding: 32px; }
.page-alert { margin-bottom: 16px; border: 1px solid #fecaca; border-radius: var(--console-radius); padding: 12px 14px; background: #fef2f2; color: #b91c1c; }
@media (max-width: 600px) { .console-card-header .console-search { width: 100%; } }
</style>
