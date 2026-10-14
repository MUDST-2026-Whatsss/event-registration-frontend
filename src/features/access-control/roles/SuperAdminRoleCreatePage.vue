<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/composables/useToast.js'
import { createRole, listPermissions } from './rolesApi.js'

const router = useRouter()
const { showToast } = useToast()
const permissions = ref([])
const selectedPermissions = ref([])
const loading = ref(false)
const saving = ref(false)
const codeEdited = ref(false)
const form = reactive({ name: '', code: '', description: '', scopeType: 'ASSIGNED_EVENTS', status: 'ACTIVE' })

const valid = computed(() => form.name.trim() && /^[A-Z][A-Z0-9_]*$/.test(form.code) && selectedPermissions.value.length)

watch(() => form.name, (name) => {
  if (!codeEdited.value) form.code = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
})

async function loadPermissions() {
  loading.value = true
  try { permissions.value = await listPermissions() }
  catch (error) { showToast({ title: error.message, variant: 'danger' }) }
  finally { loading.value = false }
}

async function submit() {
  if (!valid.value) return
  saving.value = true
  try {
    await createRole({ ...form, name: form.name.trim(), permissionCodes: selectedPermissions.value })
    showToast({ title: 'Role created.', variant: 'success' })
    router.push('/super-admin/role-management')
  } catch (error) {
    showToast({ title: error.message, variant: 'danger' })
  } finally { saving.value = false }
}

onMounted(loadPermissions)
</script>

<template>
  <div class="console-body">
    <div class="console-heading-row">
      <div class="console-page-heading"><h1>Create New Role</h1><p>Create a database-backed role and assign explicit permission codes.</p></div>
      <div class="console-heading-actions">
        <button class="console-btn console-btn-ghost" @click="router.push('/super-admin/role-management')">Cancel</button>
        <button class="console-btn console-btn-primary" :disabled="!valid || saving" @click="submit">{{ saving ? 'Creating...' : 'Create Role' }}</button>
      </div>
    </div>

    <div class="role-grid">
      <div class="console-card">
        <div class="console-card-header"><h2>Role Information</h2></div>
        <div class="console-card-body form-stack">
          <div class="form-row">
            <div><label class="console-field-label">Display name *</label><input v-model="form.name" class="console-input" placeholder="e.g. Registration Reviewer" /></div>
            <div><label class="console-field-label">Role code (system identifier) *</label><input v-model="form.code" class="console-input" placeholder="REGISTRATION_REVIEWER" aria-describedby="new-role-code-help" @input="codeEdited = true" /><small id="new-role-code-help" class="field-help">Generated from the name. It cannot be changed after creation.</small></div>
          </div>
          <div><label class="console-field-label">Description</label><textarea v-model="form.description" class="console-input description" placeholder="What this role is responsible for" /></div>
          <div class="form-row">
            <div><label class="console-field-label">Scope *</label><select v-model="form.scopeType" class="console-select"><option value="SELF">Self</option><option value="ASSIGNED_EVENTS">Assigned events</option><option value="GLOBAL">Global</option></select></div>
            <div><label class="console-field-label">Status *</label><select v-model="form.status" class="console-select"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
          </div>
        </div>
      </div>

      <div class="console-card">
        <div class="console-card-header"><div><h2>Permissions</h2><p>{{ selectedPermissions.length }} selected</p></div></div>
        <div class="console-card-body permission-grid">
          <label v-for="permission in permissions" :key="permission.code" class="permission-option">
            <input v-model="selectedPermissions" type="checkbox" :value="permission.code" />
            <span><strong>{{ permission.code }}</strong><small>{{ permission.description }}</small></span>
          </label>
          <p v-if="loading" class="empty">Loading permissions...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-grid, .form-stack { display: grid; gap: 20px; }
.console-card-body { padding: 20px 22px 22px; }
.form-stack { gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.description { min-height: 84px; resize: vertical; }
.field-help { display: block; margin-top: 6px; color: var(--console-text-muted); }
.console-card-header p { margin: 2px 0 0; color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.permission-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.permission-option { display: flex; gap: 9px; align-items: flex-start; padding: 11px; border: 1px solid var(--console-border); border-radius: var(--console-radius-sm); cursor: pointer; }
.permission-option:has(input:checked) { border-color: var(--console-primary); background: var(--console-primary-soft); }
.permission-option input { margin-top: 3px; accent-color: var(--console-primary); }
.permission-option span { display: grid; gap: 3px; min-width: 0; }
.permission-option strong { font-size: var(--console-fs-xs); overflow-wrap: anywhere; }
.permission-option small { color: var(--console-text-muted); }
.empty { color: var(--console-text-muted); }
@media (max-width: 900px) { .permission-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .form-row, .permission-grid { grid-template-columns: 1fr; } }
</style>
