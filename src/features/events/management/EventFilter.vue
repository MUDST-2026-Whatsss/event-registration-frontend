<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  categoryId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'update:categoryId'])
const tabs = [
  ['', 'All'],
  ['DRAFT', 'Draft'],
  ['PUBLISHED', 'Published'],
  ['PENDING_REVIEW', 'Pending'],
  ['REJECTED', 'Rejected'],
  ['CANCELLED', 'Cancelled'],
  ['COMPLETED', 'Completed'],
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

    <label class="category-filter">
      <span class="sr-only">Event category</span>
      <select
        :value="categoryId"
        aria-label="Filter by event category"
        @change="emit('update:categoryId', $event.target.value)"
      >
        <option value="">All categories</option>
        <option
          v-for="category in categories"
          :key="category.eventCategoryId"
          :value="category.eventCategoryId"
        >
          {{ category.nameEn || category.nameTh }}
        </option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.filter-box {
  background: white;
  border-bottom: 1px solid var(--console-border-soft);
  padding: 11px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.tabs {
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}
.tabs button,
.filter-btn {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 12px;
  color: var(--console-text-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  cursor: pointer;
}
.active {
  color: var(--console-primary) !important;
  background: var(--console-primary-soft) !important;
  border-color: #c7d2fe !important;
}
.tabs button:hover { color: var(--console-text); background: var(--console-gray-bg); }
.tabs button:focus-visible,
.category-filter select:focus-visible { outline: 3px solid rgb(79 70 229 / 22%); outline-offset: 1px; }
.category-filter { flex: 0 0 200px; }
.category-filter select {
  width: 100%;
  min-height: 36px;
  padding: 6px 32px 6px 11px;
  color: var(--console-text-secondary);
  font: inherit;
  font-size: 12px;
  background: #fff;
  border: 1px solid var(--console-border);
  border-radius: 9px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .filter-box {
    align-items: stretch;
    flex-direction: column;
    padding: 11px 14px;
  }

  .category-filter { flex-basis: auto; }
}
</style>
