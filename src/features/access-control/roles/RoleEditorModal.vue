<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  role: { type: Object, default: null },
  permissions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save'])
const form = reactive({ name: '', description: '', scopeType: 'ASSIGNED_EVENTS', status: 'ACTIVE' })
const selectedPermissions = ref([])

watch(() => props.open, (open) => {
  if (!open || !props.role) return
  form.name = props.role.name
  form.description = props.role.description ?? ''
  form.scopeType = props.role.scopeType
  form.status = props.role.status
  selectedPermissions.value = [...props.role.permissions]
})

function submit() {
  if (!form.name.trim() || !selectedPermissions.value.length) return
  emit('save', { ...form, name: form.name.trim(), permissionCodes: [...selectedPermissions.value] })
}
</script>

<template>
  <div v-if="open" class="console-modal-overlay" @click.self="emit('close')">
    <div class="console-modal role-modal">
      <div class="console-modal-header">Manage {{ role?.name }}</div>
      <div class="console-modal-body">
        <label class="console-field-label">Role code</label>
        <input class="console-input" :value="role?.code" disabled />
        <label class="console-field-label">Display name</label>
        <input v-model="form.name" class="console-input" />
        <label class="console-field-label">Description</label>
        <textarea v-model="form.description" class="console-input description" />
        <div class="form-row">
          <div>
            <label class="console-field-label">Scope</label>
            <select v-model="form.scopeType" class="console-select">
              <option value="SELF">Self</option>
              <option value="ASSIGNED_EVENTS">Assigned events</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>
          <div>
            <label class="console-field-label">Status</label>
            <select v-model="form.status" class="console-select" :disabled="role?.system">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <label class="console-field-label">Permissions</label>
        <div class="permission-list">
          <label v-for="permission in permissions" :key="permission.code" class="permission-option">
            <input v-model="selectedPermissions" type="checkbox" :value="permission.code" />
            <span><strong>{{ permission.code }}</strong><small>{{ permission.description }}</small></span>
          </label>
        </div>
        <button class="console-btn console-btn-primary" :disabled="saving || !selectedPermissions.length" @click="submit">
          {{ saving ? 'Saving...' : 'Save role' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-modal { width: min(680px, calc(100vw - 32px)); }
.description { min-height: 74px; resize: vertical; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.permission-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 260px; overflow-y: auto; }
.permission-option { display: flex; gap: 8px; align-items: flex-start; padding: 9px; border: 1px solid var(--console-border); border-radius: var(--console-radius-sm); }
.permission-option input { margin-top: 3px; }
.permission-option span { display: grid; gap: 2px; min-width: 0; }
.permission-option strong { font-size: var(--console-fs-xs); overflow-wrap: anywhere; }
.permission-option small { color: var(--console-text-muted); }
@media (max-width: 620px) { .form-row, .permission-list { grid-template-columns: 1fr; } }
</style>
