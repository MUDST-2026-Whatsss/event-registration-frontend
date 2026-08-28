<script setup>
defineProps({
  title: String
})
</script>

<template>
  <header class="topbar">
    <h3>{{ title }}</h3>

    <div class="search">
      <input placeholder="Search my events..." />
    </div>

    <div class="profile">
     <div class="avatar">SJ</div>
      <div>
        <strong>Sarah Jenkins</strong>
        <p>Event Director</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 76px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 180px 1fr 220px;
  align-items: center;
  padding: 0 24px;
}
.search input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
}
.profile {
  display: flex;
  align-items: center;
  gap: 12px;
}
.profile p {
  font-size: 13px;
  color: #64748b;
}
</style>