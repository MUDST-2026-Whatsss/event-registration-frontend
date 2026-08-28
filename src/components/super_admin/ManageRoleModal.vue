<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  currentRole: { type: String, default: '' },
  roles: {
    type: Array,
    default: () => ['User', 'Admin', 'Super Admin', 'Disabled'],
  },
})

const emit = defineEmits(['close', 'save'])

const selected = ref(props.currentRole || props.roles[0])

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) selected.value = props.currentRole || props.roles[0]
  },
)

function save() {
  emit('save', selected.value)
}
</script>

<template>
  <div v-if="open" class="sa-modal-overlay" @click.self="emit('close')">
    <div class="sa-modal">
      <div class="sa-modal-header">Manage Role</div>
      <div class="sa-modal-body">
        <select v-model="selected" class="sa-select">
          <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
        <button type="button" class="sa-btn sa-btn-primary" style="justify-content: center" @click="save">
          Save
        </button>
      </div>
    </div>
  </div>
</template>
