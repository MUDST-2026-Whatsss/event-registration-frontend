<script setup>


defineProps({
  title: String,
  value: String,
  color: {
    default: 'black'
  }
})
</script>

<template>
  <div class="card">
    <p>{{ title }}</p>
    <h2 :class="color">{{ value }}</h2>
  </div>
</template>

<style scoped>
.card {
     width: 100%;
  min-height: 93px;
  box-sizing: border-box;

  background: white;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #e7edf5;
}
.card p {
  font-size: var(--console-fs-sm);
  color: #64748b;
}
.card h2 {
  font-size: var(--console-fs-3xl);
  margin-top: 8px;
}
.green {
  color: #16a34a;
}
.orange {
  color: #ea580c;
}
.red {
  color: #dc2626;
}
</style>
