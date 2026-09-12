<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

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

  <div class="console-body">
    <div class="console-heading-row">
      <div class="console-page-heading">
        <h1>Create New Role</h1>
        <p>Define role information, permissions and account status.</p>
      </div>
      <div class="console-heading-actions">
        <button type="button" class="console-btn console-btn-ghost" @click="cancel">Cancel</button>
        <button type="button" class="console-btn console-btn-primary" :disabled="!roleName" @click="createRole">
          Create Role
        </button>
      </div>
    </div>

    <div class="console-create-role-grid">
      <div class="console-create-role-main">
        <div class="console-card">
          <div class="console-card-header"><h2>Role Information</h2></div>
          <div class="console-card-body">
            <label class="console-field-label" for="role-name">Role Name *</label>
            <input
              id="role-name"
              v-model="roleName"
              class="console-input"
              placeholder="e.g. Super Admin downgrade"
            />
          </div>
        </div>

        <div class="console-card">
          <div class="console-card-header"><h2>Role &amp; Permission</h2></div>
          <div class="console-card-body">
            <div class="console-form-row">
              <div>
                <label class="console-field-label" for="system-role">System Role *</label>
                <select id="system-role" v-model="systemRole" class="console-select">
                  <option>Admin</option>
                  <option>User</option>
                  <option>Super Admin</option>
                </select>
              </div>
              <div>
                <label class="console-field-label" for="department">Department</label>
                <input id="department" v-model="department" class="console-input" />
              </div>
            </div>

            <label class="console-field-label" style="margin-top: 18px">Permissions Summary</label>
            <div class="console-permission-grid">
              <button
                v-for="perm in permissions"
                :key="perm.key"
                type="button"
                class="console-permission-chip"
                :class="{ checked: perm.checked }"
                @click="togglePermission(perm)"
              >
                <span>{{ perm.label }}</span>
                <span class="console-permission-box">
                  <Icon v-if="perm.checked" name="check" :size="12" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="console-create-role-side">
        <div class="console-card">
          <div class="console-card-body">
            <label class="console-field-label">Account Status</label>
            <label class="console-radio-card" :class="{ selected: accountStatus === 'Active' }">
              <input v-model="accountStatus" type="radio" value="Active" name="status" />
              Active
            </label>
            <label class="console-radio-card" :class="{ selected: accountStatus === 'Disabled' }">
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
.console-create-role-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .console-create-role-grid {
    grid-template-columns: 1fr;
  }
}

.console-create-role-main,
.console-create-role-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.console-card-body {
  padding: 20px 22px 22px;
}

.console-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 560px) {
  .console-form-row {
    grid-template-columns: 1fr;
  }
}

.console-permission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 560px) {
  .console-permission-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.console-permission-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border-radius: var(--console-radius-sm);
  border: 1px solid var(--console-border);
  background: #fff;
  font-family: inherit;
  font-size: var(--console-fs-base);
  font-weight: 600;
  color: var(--console-text-secondary);
  cursor: pointer;
  text-align: left;
}

.console-permission-chip.checked {
  border-color: var(--console-primary);
  background: var(--console-primary-soft);
  color: var(--console-text);
}

.console-permission-box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--console-border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.console-permission-chip.checked .console-permission-box {
  background: var(--console-primary);
  border-color: var(--console-primary);
}

.console-radio-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--console-radius-sm);
  border: 1px solid var(--console-border);
  font-size: var(--console-fs-base);
  font-weight: 600;
  color: var(--console-text-secondary);
  cursor: pointer;
  margin-top: 8px;
}

.console-radio-card input {
  accent-color: var(--console-primary);
}

.console-radio-card.selected {
  border-color: #bcf0cf;
  background: var(--console-success-bg);
  color: #15803d;
}
</style>
