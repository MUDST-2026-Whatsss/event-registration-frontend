<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'

const router = useRouter()

const roleName = ref('')
const systemRole = ref('Admin')
const department = ref('All Current & Future Events')
const accountStatus = ref('Active')

const permissions = ref([
  { key: 'all-event', label: 'All Event', checked: true },
  { key: 'event-registration', label: 'Event Registration', checked: true },
  { key: 'my-registration', label: 'My Registration', checked: true },
  { key: 'create-event', label: 'Create Event', checked: false },
  { key: 'event-approvals', label: 'Event Approvals', checked: true },
  { key: 'change-request', label: 'Change Request', checked: true },
  { key: 'dashboard', label: 'Dashboard', checked: true },
  { key: 'role-management', label: 'Role Management', checked: false },
  { key: 'user-management', label: 'User Management', checked: false },
])

function togglePermission(item) {
  item.checked = !item.checked
}

function cancel() {
  router.push('/super-admin/role-management')
}

function createRole() {
  // Wire up to the backend once the roles API is available.
  router.push('/super-admin/role-management')
}
</script>

<template>
  <PageTopbar title="Create New Role">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <div class="sa-body">
    <div class="sa-heading-row">
      <div class="sa-page-heading">
        <h1>Create New Role</h1>
        <p>Define role information, permissions and account status.</p>
      </div>
      <div class="sa-heading-actions">
        <button type="button" class="sa-btn sa-btn-ghost" @click="cancel">Cancel</button>
        <button type="button" class="sa-btn sa-btn-primary" :disabled="!roleName" @click="createRole">
          Create Role
        </button>
      </div>
    </div>

    <div class="sa-create-role-grid">
      <div class="sa-create-role-main">
        <div class="sa-card">
          <div class="sa-card-header"><h2>Role Information</h2></div>
          <div class="sa-card-body">
            <label class="sa-field-label" for="role-name">Role Name *</label>
            <input
              id="role-name"
              v-model="roleName"
              class="sa-input"
              placeholder="e.g. Super Admin downgrade"
            />
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-header"><h2>Role &amp; Permission</h2></div>
          <div class="sa-card-body">
            <div class="sa-form-row">
              <div>
                <label class="sa-field-label" for="system-role">System Role *</label>
                <select id="system-role" v-model="systemRole" class="sa-select">
                  <option>Admin</option>
                  <option>User</option>
                  <option>Super Admin</option>
                </select>
              </div>
              <div>
                <label class="sa-field-label" for="department">Department</label>
                <input id="department" v-model="department" class="sa-input" />
              </div>
            </div>

            <label class="sa-field-label" style="margin-top: 18px">Permissions Summary</label>
            <div class="sa-permission-grid">
              <button
                v-for="perm in permissions"
                :key="perm.key"
                type="button"
                class="sa-permission-chip"
                :class="{ checked: perm.checked }"
                @click="togglePermission(perm)"
              >
                <span>{{ perm.label }}</span>
                <span class="sa-permission-box">
                  <Icon v-if="perm.checked" name="check" :size="12" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="sa-create-role-side">
        <div class="sa-card">
          <div class="sa-card-body">
            <label class="sa-field-label">Account Status</label>
            <label class="sa-radio-card" :class="{ selected: accountStatus === 'Active' }">
              <input v-model="accountStatus" type="radio" value="Active" name="status" />
              Active
            </label>
            <label class="sa-radio-card" :class="{ selected: accountStatus === 'Disabled' }">
              <input v-model="accountStatus" type="radio" value="Disabled" name="status" />
              Disabled
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sa-create-role-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .sa-create-role-grid {
    grid-template-columns: 1fr;
  }
}

.sa-create-role-main,
.sa-create-role-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sa-card-body {
  padding: 20px 22px 22px;
}

.sa-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 560px) {
  .sa-form-row {
    grid-template-columns: 1fr;
  }
}

.sa-permission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 560px) {
  .sa-permission-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sa-permission-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border-radius: var(--sa-radius-sm);
  border: 1px solid var(--sa-border);
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--sa-text-secondary);
  cursor: pointer;
  text-align: left;
}

.sa-permission-chip.checked {
  border-color: var(--sa-primary);
  background: var(--sa-primary-soft);
  color: var(--sa-text);
}

.sa-permission-box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--sa-border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.sa-permission-chip.checked .sa-permission-box {
  background: var(--sa-primary);
  border-color: var(--sa-primary);
}

.sa-radio-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--sa-radius-sm);
  border: 1px solid var(--sa-border);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--sa-text-secondary);
  cursor: pointer;
  margin-top: 8px;
}

.sa-radio-card input {
  accent-color: var(--sa-primary);
}

.sa-radio-card.selected {
  border-color: #bcf0cf;
  background: var(--sa-success-bg);
  color: #15803d;
}
</style>
