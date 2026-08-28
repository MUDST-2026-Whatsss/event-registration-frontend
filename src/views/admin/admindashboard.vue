<script setup>
import { ref } from 'vue'

const activeMenu = ref('Dashboard')
const categories = [
  ['Summer Music Festival', '1,200 / 1,500', '80%', 'music'],
  ['DevCon Tech Summit', '400 / 400', '100%', 'tech'],
  ['Art & Design Workshop', '68 / 120', '57%', 'art'],
  ['Marathon & Fitness Day', '312 / 500', '62%', 'fitness'],
  ['Annual Gala Dinner', '150 / 200', '75%', 'gala'],
  ['Leadership Bootcamp', '90 / 90', '100%', 'leadership'],
]
const activities = [
  ['DB', 'Daniel Brooks approved 42 registrations for Summer Music Festival', 'Organizer · 2 min ago', 'Registration'],
  ['PN', 'Priya Nair cancel for Art & Design Workshop', 'Moderator · 51 min ago', 'Cancel'],
  ['TH', 'Tom Halvorsen marked Marathon & Fitness Day as Full', 'Organizer · 1 hr ago', 'Registration'],
  ['LF', 'Lena Fischer exported the attendee list for Annual Gala Dinner', 'Coordinator · 2 hrs ago', 'Registration'],
]
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">≋</span><strong>Eventsss</strong></div>
      <small>MENU</small>
      <button v-for="item in ['Dashboard', 'All Events']" :key="item" class="nav-item" :class="{ active: activeMenu === item }" @click="activeMenu = item">
        <span>{{ item === 'Dashboard' ? '▦' : '▣' }}</span>{{ item }}
      </button>
    </aside>
    <main class="main-content">
      <header class="topbar"><span>Dashboard</span><div class="search">⌕　Search events, registrants...</div><div class="profile"><span class="avatar">SJ</span><b>Sarah Jenkins</b><small>Event Director</small>⌄</div></header>
      <section class="content">
        <div class="hero-card"><div><span>Total Registrations</span><h1>14,208 <em>↗ +12%</em></h1><p>Across 48 managed events · last updated 12 minutes ago</p></div><div class="hero-actions"><button class="primary">＋ Create Event</button><button>⇥ Export Report</button></div><div class="metrics"><div><span>Total Participants</span><b>10,850</b></div><div><span>Available Seats</span><b>3,358</b></div><div><span>Pending Approval</span><b class="warning">214</b></div><div><span>Avg. Fill Rate</span><b>76%</b></div></div></div>
        <div class="chart-row"><section class="panel trend"><h3>Registrations Trend</h3><p>Track registration activity over time</p><div class="chart"><i v-for="n in 12" :key="n" :style="{ height: `${35 + n * 5 + (n % 3) * 8}px` }"></i></div></section><section class="panel status"><h3>Event Status Distribution</h3><p>By current lifecycle stage</p><div class="donut"><strong>48<small>Events</small></strong></div><div class="legend">● Upcoming Events　<span>● Full Events</span><br>● Closed Events　 <b>● Rejected Events</b></div></section></div>
        <section class="panel category"><div class="section-title"><div><h3>Category Overview</h3><p>48 events across all categories</p></div><div><button class="pill selected">All⌄</button><button class="pill">Upcoming</button><button class="pill">Full</button></div></div><div class="table-head"><span>CATEGORY</span><span>NUMBER OF EVENTS</span><span>FILL RATE</span></div><div v-for="row in categories" :key="row[0]" class="category-row"><span><i :class="row[3]">✦</i>{{ row[0] }}</span><span>{{ row[1] }}</span><span><progress :value="parseInt(row[2])" max="100"></progress>{{ row[2] }}</span></div></section>
        <section class="panel activity"><div class="section-title"><h3>User Activity</h3><div class="search small">⌕　Search activity　　All⌄</div></div><div v-for="item in activities" :key="item[1]" class="activity-row"><span class="avatar">{{ item[0] }}</span><div><b>{{ item[1] }}</b><small>{{ item[2] }}</small></div><label :class="{ cancel: item[3] === 'Cancel' }">{{ item[3] }}</label></div></section>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
:global(body){background:#f7f9fc;font-family:Inter,"Segoe UI",sans-serif;color:#13213d}.admin-shell{display:flex;min-height:100vh}.sidebar{width:158px;background:#fff;border-right:1px solid #e7ebf2;padding:20px 10px}.brand{display:flex;align-items:center;gap:8px;padding:0 13px 35px;font-size:12px}.brand-mark{background:#2358dd;color:#fff;border-radius:6px;padding:3px 7px;font-size:18px}.sidebar small{display:block;color:#8b96aa;font-size:8px;padding:0 13px 10px}.nav-item{width:100%;text-align:left;background:none;padding:9px 13px;border-radius:8px;color:#65728a;font-size:10px}.nav-item span{margin-right:10px}.nav-item.active{background:#edf3ff;color:#2158d7}.main-content{flex:1}.topbar{height:58px;background:#fff;border-bottom:1px solid #e7ebf2;display:flex;align-items:center;gap:20px;padding:0 24px;font-size:10px}.search{border:1px solid #e4e9f1;border-radius:7px;color:#a2adbd;padding:7px 12px;flex:1;max-width:395px}.profile{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:9px}.profile small{color:#9aa5b6}.avatar{display:inline-grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#dbe5ff;color:#315bd0;font-size:9px}.content{max-width:1060px;margin:auto;padding:20px 24px}.hero-card{position:relative;background:linear-gradient(110deg,#ebe7ff,#fff0f6);padding:23px 25px;border-radius:15px;box-shadow:0 8px 18px #adb4c633}.hero-card span,.panel p,.metrics span{color:#78859a;font-size:9px}.hero-card h1{font-size:42px;line-height:1;margin:6px 0}.hero-card em{font-size:10px;background:#c9f1df;color:#38bb83;padding:4px 7px;border-radius:4px;vertical-align:middle;font-style:normal}.hero-card p{margin:0;font-size:9px;color:#8290a2}.hero-actions{position:absolute;right:25px;top:74px}.hero-actions button,.pill{background:#fff;border:1px solid #dce2ed;border-radius:7px;padding:7px 12px;color:#52617b;font-size:9px;margin-left:6px}.hero-actions .primary{background:#2459d8;color:#fff}.metrics{display:flex;justify-content:space-between;margin-top:38px}.metrics div{display:flex;flex-direction:column;gap:5px}.metrics b{font-size:15px}.warning{color:#eea72c}.chart-row{display:grid;grid-template-columns:1.7fr 1fr;gap:18px;margin-top:20px}.panel{background:#fff;border:1px solid #e3e8f0;border-radius:15px;padding:18px 20px}.panel h3{font-size:11px;margin:0}.panel p{margin:3px 0}.trend{height:250px}.chart{height:165px;display:flex;align-items:end;gap:10px;padding:10px 20px;border-bottom:1px solid #dfe5ef;background:repeating-linear-gradient(to bottom,transparent,transparent 40px,#edf1f6 41px)}.chart i{flex:1;background:linear-gradient(#5e7ffd,#dce5ff);border-radius:8px 8px 0 0}.status{text-align:left}.donut{width:125px;height:125px;border-radius:50%;background:conic-gradient(#5d7df1 0 42%,#50c88a 42% 67%,#f4ac43 67% 87%,#fa8088 87%);margin:22px auto 8px;display:grid;place-items:center}.donut:after{content:"";position:absolute;width:78px;height:78px;background:#fff;border-radius:50%}.donut strong{z-index:1;font-size:11px;text-align:center}.donut small{display:block;color:#8793a4;font-size:8px;font-weight:400}.legend{font-size:8px;color:#5d7df1}.legend span{color:#50c88a}.legend b{color:#fa8088}.category,.activity{margin-top:20px}.section-title{display:flex;justify-content:space-between;align-items:center}.table-head,.category-row{display:grid;grid-template-columns:1.8fr 1fr 1fr;align-items:center}.table-head{color:#8793a4;font-size:8px;border-bottom:1px solid #e8edf4;padding:17px 0 9px}.category-row{font-size:9px;padding:9px 0;border-bottom:1px solid #f0f2f6}.category-row>span:first-child{display:flex;align-items:center;gap:8px}.category-row i{padding:5px;border-radius:7px;background:#dce8ff;color:#3668e7;font-style:normal}.category-row i.art{background:#ffe6f1;color:#e856a4}.category-row i.fitness{background:#d6f7f1;color:#0da991}.category-row i.gala{background:#fff0c9;color:#ecaa27}.category-row i.leadership{background:#edf1f6;color:#64738d}progress{width:29px;height:5px;margin-right:10px;accent-color:#5d7df1}.pill{padding:5px 9px}.pill.selected{color:#2459d8;background:#edf3ff}.activity-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f6;font-size:9px}.activity-row div{flex:1}.activity-row small{display:block;color:#9aa5b6;font-size:8px}.activity-row label{background:#d9f8e9;color:#36b879;padding:4px 8px;border-radius:5px;font-size:8px}.activity-row label.cancel{background:#ffe2e5;color:#ed7781}@media(max-width:800px){.sidebar{width:120px}.content{padding:14px}.hero-actions{position:static;margin-top:15px}.chart-row{grid-template-columns:1fr}.metrics{gap:12px;flex-wrap:wrap}.metrics div{min-width:120px}}
.sidebar,.topbar{display:none}.admin-shell{display:block;min-height:0}.main-content{width:100%}.content{max-width:none;padding:14px 36px 28px}
</style>
