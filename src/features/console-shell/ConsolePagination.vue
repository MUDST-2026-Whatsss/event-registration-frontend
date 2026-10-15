<script setup>
import { computed } from 'vue'
import ConsoleIcon from './ConsoleIcon.vue'

const props = defineProps({
  page: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  totalElements: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  itemLabel: { type: String, default: 'items' },
  loading: { type: Boolean, default: false },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50] },
})

const emit = defineEmits(['page', 'page-size'])

const rangeStart = computed(() => props.totalElements ? (props.page * props.pageSize) + 1 : 0)
const rangeEnd = computed(() => Math.min((props.page + 1) * props.pageSize, props.totalElements))

const visiblePages = computed(() => {
  if (props.totalPages <= 5) return Array.from({ length: props.totalPages }, (_, index) => index)

  const pages = new Set([0, props.totalPages - 1, props.page - 1, props.page, props.page + 1])
  const ordered = [...pages].filter(page => page >= 0 && page < props.totalPages).sort((a, b) => a - b)
  const result = []
  ordered.forEach((page, index) => {
    if (index && page - ordered[index - 1] > 1) result.push(`gap-${page}`)
    result.push(page)
  })
  return result
})

function changeSize(event) {
  emit('page-size', Number(event.target.value))
}
</script>

<template>
  <div class="console-pagination pagination-shell">
    <span>
      Showing {{ rangeStart.toLocaleString() }}–{{ rangeEnd.toLocaleString() }}
      of {{ totalElements.toLocaleString() }} {{ itemLabel }}
    </span>

    <div class="pagination-actions">
      <label class="page-size-control">
        <span>Rows per page</span>
        <select
          class="console-select"
          :value="pageSize"
          :disabled="loading"
          aria-label="Rows per page"
          @change="changeSize"
        >
          <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <div class="console-pagination-controls">
        <button
          type="button"
          class="console-page-num"
          :disabled="page <= 0 || loading"
          aria-label="Previous page"
          @click="emit('page', page - 1)"
        >
          <ConsoleIcon name="chevron-left" :size="14" />
        </button>

        <template v-for="pageItem in visiblePages" :key="pageItem">
          <span v-if="typeof pageItem === 'string'" class="page-gap">…</span>
          <button
            v-else
            type="button"
            class="console-page-num"
            :class="{ active: pageItem === page }"
            :aria-current="pageItem === page ? 'page' : undefined"
            :disabled="loading"
            @click="emit('page', pageItem)"
          >
            {{ pageItem + 1 }}
          </button>
        </template>

        <button
          type="button"
          class="console-page-num"
          :disabled="page + 1 >= totalPages || loading"
          aria-label="Next page"
          @click="emit('page', page + 1)"
        >
          <ConsoleIcon name="chevron-right" :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination-shell { gap: 18px; }
.pagination-actions, .page-size-control { display: flex; align-items: center; gap: 10px; }
.page-size-control { color: var(--console-text-muted); font-size: var(--console-fs-sm); white-space: nowrap; }
.page-size-control .console-select {
  width: 76px; min-height: 34px; padding: 6px 30px 6px 12px; cursor: pointer;
  appearance: none;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center;
}
.page-gap { min-width: 20px; text-align: center; color: var(--console-text-muted); }

@media (max-width: 720px) {
  .pagination-shell { align-items: flex-start; flex-direction: column; }
  .pagination-actions { width: 100%; justify-content: space-between; flex-wrap: wrap; }
}
</style>
