<template>
  <div class="filter-box">
    <div class="tabs">
      <button class="active">All</button>
      <button>Draft</button>
      <button>Published</button>
      <button>Pending</button>
      <button>Rejected</button>
    </div>

    <button class="filter-btn">Filters</button>
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
