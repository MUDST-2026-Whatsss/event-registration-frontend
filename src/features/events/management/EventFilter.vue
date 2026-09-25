<script setup>
defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const tabs = [
  ['', 'All'],
  ['DRAFT', 'Draft'],
  ['PUBLISHED', 'Published'],
  ['PENDING_REVIEW', 'Pending'],
  ['REJECTED', 'Rejected'],
  ['CANCELLED', 'Cancelled'],
]
</script>

<template>
  <div class="filter-box">
    <div class="tabs">
      <button
        v-for="([value, label]) in tabs"
        :key="label"
        type="button"
        :class="{ active: modelValue === value }"
        @click="emit('update:modelValue', value)"
      >{{ label }}</button>
    </div>
  </div>
</template>

<style scoped>
.filter-box {
  background: white;
  border: 1px solid #e7edf5;
  border-radius: 16px 16px 0 0;
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
}
.tabs {
  display: flex;
  gap: 10px;
}
.tabs button,
.filter-btn {
  border: 1px solid #dbe3ef;
  background: #fff;
  padding: 8px 16px;
  border-radius: 10px;
}
.active {
  background: #eff6ff;
  color: #2563eb;
}

@media (max-width: 600px) {
  .filter-box {
    overflow-x: auto;
    padding-inline: 16px;
  }

  .tabs {
    flex: 0 0 auto;
  }
}
</style>
