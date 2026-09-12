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
  <div v-if="open" class="console-modal-overlay" @click.self="emit('close')">
    <div class="console-modal">
      <div class="console-modal-header">Manage Role</div>
      <div class="console-modal-body">
        <select v-model="selected" class="console-select">
          <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
        <button type="button" class="console-btn console-btn-primary" style="justify-content: center" @click="save">
          Save
        </button>
      </div>
    </div>
  </div>
</template>
