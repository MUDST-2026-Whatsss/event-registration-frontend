<script setup>
defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusClass = {
  Published: 'published',
  Pending: 'pending',
  Rejected: 'rejected',
  Draft: 'draft'
}
</script>

<template>
  <span
    class="badge"
    :class="statusClass[status]"
  >
    {{ status }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.published {
  color: #16a34a;
  background: #ecfdf5;
}

.pending {
  color: #ea580c;
  background: #fff7ed;
}

.rejected {
  color: #dc2626;
  background: #fef2f2;
}

.draft {
  color: #64748b;
  background: #f1f5f9;
}
</style>