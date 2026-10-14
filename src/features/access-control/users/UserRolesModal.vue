<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  currentRoles: { type: Array, default: () => [] },
  roles: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])
const selected = ref([])

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) selected.value = [...props.currentRoles]
  },
)

function save() {
  if (selected.value.length) emit('save', [...selected.value])
}
</script>

<template>
  <div v-if="open" class="console-modal-overlay" @click.self="emit('close')">
    <div class="console-modal">
      <div class="console-modal-header">Manage Roles</div>
      <div class="console-modal-body">
        <p class="role-help">Select one or more active roles for this account.</p>
        <label v-for="role in roles" :key="role.code" class="role-option">
          <input v-model="selected" type="checkbox" :value="role.code" />
          <span>
            <strong>{{ role.name }}</strong>
            <small>{{ role.code }} · {{ role.permissions.length }} permissions</small>
          </span>
        </label>
        <button type="button" class="console-btn console-btn-primary" style="justify-content: center" :disabled="saving || !selected.length" @click="save">
          {{ saving ? 'Saving...' : 'Save roles' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-help { margin: 0; color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.role-option { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid var(--console-border); border-radius: var(--console-radius); cursor: pointer; }
.role-option input { margin-top: 3px; }
.role-option span { display: grid; gap: 3px; }
.role-option small { color: var(--console-text-muted); }
</style>
