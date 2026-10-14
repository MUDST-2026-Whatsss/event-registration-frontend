<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  role: { type: Object, default: null },
  permissions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
  deleting: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save', 'delete'])
const form = reactive({ name: '', description: '', scopeType: 'ASSIGNED_EVENTS', status: 'ACTIVE' })
const selectedPermissions = ref([])
const confirmingDelete = ref(false)
const busy = computed(() => props.saving || props.deleting)

watch(() => props.open, (open) => {
  confirmingDelete.value = false
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
      <div v-if="confirmingDelete" class="role-modal-footer delete-confirm">
        <p class="delete-message">
          <strong>Delete role "{{ role?.name }}"?</strong>
          <span v-if="role?.userCount">
            {{ role.userCount.toLocaleString() }} {{ role.userCount === 1 ? 'user has' : 'users have' }} this role.
            It will be removed from them and they will be signed out.
          </span>
          <span>This cannot be undone.</span>
        </p>
        <div class="footer-actions">
          <button type="button" class="console-btn console-btn-ghost" :disabled="deleting" @click="confirmingDelete = false">
            Cancel
          </button>
          <button type="button" class="console-btn btn-danger" :disabled="deleting" @click="emit('delete')">
            {{ deleting ? 'Deleting...' : 'Delete role' }}
          </button>
        </div>
      </div>
      <div v-else class="role-modal-footer">
        <button
          v-if="role && !role.system"
          type="button"
          class="console-btn btn-danger-outline"
          :disabled="busy"
          @click="confirmingDelete = true"
        >
          Delete role
        </button>
        <div class="footer-actions">
          <button type="button" class="console-btn console-btn-ghost" :disabled="busy" @click="emit('close')">
            Cancel
          </button>
          <button class="console-btn console-btn-primary" :disabled="busy || !selectedPermissions.length" @click="submit">
            {{ saving ? 'Saving...' : 'Save role' }}
          </button>
        </div>
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
  align-items: center;
  gap: 10px;
  padding: 14px 20px 20px;
  border-top: 1px solid var(--console-border-soft);
  background: #fff;
}
.footer-actions { display: flex; gap: 10px; margin-left: auto; }
.btn-danger-outline { color: var(--console-danger-text); border: 1px solid #fecaca; background: #fff; }
.btn-danger-outline:hover:not(:disabled) { background: var(--console-danger-bg); }
.btn-danger { color: #fff; background: var(--console-danger); }
.btn-danger:hover:not(:disabled) { background: var(--console-danger-text); }
.delete-confirm { background: #fef2f2; }
.delete-message { display: grid; gap: 2px; margin: 0; color: var(--console-danger-text); font-size: var(--console-fs-sm); }
@media (max-width: 620px) {
  .role-modal { max-height: calc(100dvh - 24px); }
  .form-row, .permission-list { grid-template-columns: 1fr; }
  .delete-confirm { flex-direction: column; align-items: stretch; }
}
</style>
