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
      </div>
      <div class="role-modal-footer">
        <button type="button" class="console-btn console-btn-ghost" :disabled="saving" @click="emit('close')">
          Cancel
        </button>
        <button class="console-btn console-btn-primary" :disabled="saving || !selectedPermissions.length" @click="submit">
          {{ saving ? 'Saving...' : 'Save role' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-modal {
  display: flex;
  width: min(680px, calc(100vw - 32px));
  max-width: 680px;
  max-height: calc(100dvh - 40px);
  flex-direction: column;
}
.role-modal .console-modal-header { flex: 0 0 auto; }
.role-modal .console-modal-body { min-height: 0; overflow-y: auto; }
.description { min-height: 74px; resize: vertical; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.permission-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.permission-option { display: flex; gap: 8px; align-items: flex-start; padding: 9px; border: 1px solid var(--console-border); border-radius: var(--console-radius-sm); }
.permission-option input { margin-top: 3px; }
.permission-option span { display: grid; gap: 2px; min-width: 0; }
.permission-option strong { font-size: var(--console-fs-xs); overflow-wrap: anywhere; }
.permission-option small { color: var(--console-text-muted); }
.role-modal-footer {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px 20px;
  border-top: 1px solid var(--console-border-soft);
  background: #fff;
}
@media (max-width: 620px) {
  .role-modal { max-height: calc(100dvh - 24px); }
  .form-row, .permission-list { grid-template-columns: 1fr; }
}
</style>
