<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  ConsoleIcon as Icon,
  PageTopbar,
  UserMenu,
} from '@/features/console-shell/public.js'
import { useToast } from '@/shared/composables/useToast.js'

const router = useRouter()
const { showToast } = useToast()

/* ---------------------------------------------------------------
   Summary (mock — no backend yet)
--------------------------------------------------------------- */
const summary = {
  totalRegistrations: 14208,
  trend: '+12%',
  managedEvents: 48,
  updatedAgo: '12 minutes ago',
  metrics: [
    { label: 'Total Participants', value: '10,850' },
    { label: 'Available Seats', value: '3,358' },
    { label: 'Pending Approval', value: '214', tone: 'warning' },
    { label: 'Avg. Fill Rate', value: '76%' },
  ],
}

/* ---------------------------------------------------------------
   Registrations trend — line chart
--------------------------------------------------------------- */
const trendRanges = {
  'This Year': [820, 960, 900, 1120, 1350, 1180, 1520, 1780, 1650, 1980, 2240, 2350],
  'Last 6 Months': [1520, 1780, 1650, 1980, 2240, 2350],
  'Last 30 Days': [1980, 2080, 2160, 2120, 2260, 2300, 2380, 2350],
}
const selectedRange = ref('This Year')

const CHART_W = 620
const CHART_H = 220
const PAD_X = 14
const PAD_Y = 18

const trendChart = computed(() => {
  const data = trendRanges[selectedRange.value]
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const baseline = CHART_H - PAD_Y

  const points = data.map((value, index) => {
    const x = PAD_X + (index * (CHART_W - PAD_X * 2)) / (data.length - 1)
    const y = baseline - ((value - min) / span) * (CHART_H - PAD_Y * 2)
    return { x, y }
  })

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `M ${PAD_X},${baseline} L ${line.replace(/ /g, ' L ')} L ${CHART_W - PAD_X},${baseline} Z`
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => baseline - t * (CHART_H - PAD_Y * 2))

  const formatTick = (value) =>
    value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `${value}`
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((t) => formatTick(Math.round(min + t * span)))

  return { points, line, area, gridLines, baseline, yTicks }
})

/* ---------------------------------------------------------------
   Event status distribution — donut

   Palette validated with the dataviz skill's checker (categorical,
   light, all-pairs): blue / green / amber / red all pass the
   lightness + normal-vision gates; the CVD warn is covered by the
   secondary encoding here (gaps between arcs + value labels).
--------------------------------------------------------------- */
const statusSegments = [
  { label: 'Upcoming', value: 20, color: '#2a78d6' },
  { label: 'Full', value: 13, color: '#1baf7a' },
  { label: 'Closed', value: 10, color: '#eda100' },
  { label: 'Rejected', value: 5, color: '#e34948' },
]
const DONUT_R = 54
const DONUT_C = 2 * Math.PI * DONUT_R
const DONUT_GAP = 0.04 // slice separation, as a fraction of the circle
const statusTotal = statusSegments.reduce((sum, s) => sum + s.value, 0)
const hoveredStatus = ref(null)

const donutArcs = computed(() => {
  let cursor = 0
  return statusSegments.map((segment) => {
    const fraction = segment.value / statusTotal
    const length = Math.max(DONUT_C * (fraction - DONUT_GAP), 1)
    const arc = {
      ...segment,
      percent: Math.round(fraction * 100),
      dash: `${length.toFixed(2)} ${(DONUT_C - length).toFixed(2)}`,
      offset: (-DONUT_C * cursor).toFixed(2),
    }
    cursor += fraction
    return arc
  })
})

/* ---------------------------------------------------------------
   Category overview
--------------------------------------------------------------- */
const categoryFilters = ['All', 'Upcoming', 'Full']
const selectedCategoryFilter = ref('All')

const categories = [
  { name: 'Summer Music Festival', emoji: '🎵', tone: 'blue', events: '1,200 / 1,500', fill: 80, type: 'Upcoming' },
  { name: 'DevCon Tech Summit', emoji: '💻', tone: 'blue', events: '400 / 400', fill: 100, type: 'Full' },
  { name: 'Art & Design Workshop', emoji: '🎨', tone: 'pink', events: '68 / 120', fill: 57, type: 'Upcoming' },
  { name: 'Marathon & Fitness Day', emoji: '🏃', tone: 'green', events: '312 / 500', fill: 62, type: 'Upcoming' },
  { name: 'Annual Gala Dinner', emoji: '🥂', tone: 'amber', events: '150 / 200', fill: 75, type: 'Upcoming' },
  { name: 'Leadership Bootcamp', emoji: '🎓', tone: 'gray', events: '90 / 90', fill: 100, type: 'Full' },
]

const visibleCategories = computed(() => {
  if (selectedCategoryFilter.value === 'All') return categories
  return categories.filter((category) => category.type === selectedCategoryFilter.value)
})

/* ---------------------------------------------------------------
   User activity feed
--------------------------------------------------------------- */
const activities = [
  { initials: 'DB', name: 'Daniel Brooks', action: 'approved 42 registrations for Summer Music Festival', meta: 'Organizer · 2 min ago', tag: 'Registration' },
  { initials: 'PN', name: 'Priya Nair', action: 'cancel for Art & Design Workshop', meta: 'Moderator · 51 min ago', tag: 'Cancel' },
  { initials: 'TH', name: 'Tom Halvorsen', action: 'marked Marathon & Fitness Day as Full', meta: 'Organizer · 1 hr ago', tag: 'Registration' },
  { initials: 'LF', name: 'Lena Fischer', action: 'exported the attendee list for Annual Gala Dinner', meta: 'Coordinator · 2 hrs ago', tag: 'Registration' },
]
const activitySearch = ref('')

const visibleActivities = computed(() => {
  const query = activitySearch.value.trim().toLowerCase()
  if (!query) return activities
  return activities.filter((item) =>
    `${item.name} ${item.action} ${item.meta}`.toLowerCase().includes(query),
  )
})

/* ---------------------------------------------------------------
   Actions
--------------------------------------------------------------- */
function createEvent() {
  router.push('/admin/create-event')
}

function openAllEvents() {
  router.push('/admin/all-events')
}

function exportReport() {
  const rows = [
    ['Category', 'Registrations', 'Fill Rate'],
    ...categories.map((category) => [category.name, category.events.replace(/,/g, ''), `${category.fill}%`]),
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'registrations-report.csv'
  link.click()
  URL.revokeObjectURL(url)

  showToast({
    variant: 'success',
    title: 'Report exported',
    message: 'A CSV summary has been downloaded.',
  })
}
</script>

<template>
  <PageTopbar title="Dashboard">
        <template #search>
          <div class="console-search dash-search">
            <Icon name="search" :size="15" />
            <input class="console-input" type="search" placeholder="Search events, registrants..." aria-label="Search" />
          </div>
        </template>
        <template #actions>
          <UserMenu />
        </template>
      </PageTopbar>

      <main class="console-body dash">
        <!-- Hero summary -->
        <section class="hero">
          <div class="hero-head">
            <div>
              <span class="hero-label">Total Registrations</span>
              <div class="hero-value">
                {{ summary.totalRegistrations.toLocaleString() }}
                <span class="hero-trend">
                  <Icon name="arrow-up-down" :size="12" />{{ summary.trend }}
                </span>
              </div>
              <p class="hero-note">
                Across {{ summary.managedEvents }} managed events · last updated {{ summary.updatedAgo }}
              </p>
            </div>

            <div class="hero-actions">
              <button type="button" class="console-btn console-btn-primary" @click="createEvent">
                <Icon name="plus" :size="15" />Create Event
              </button>
              <button type="button" class="console-btn console-btn-outline" @click="exportReport">
                <Icon name="arrow-up-down" :size="15" />Export Report
              </button>
            </div>
          </div>

          <div class="hero-metrics">
            <div v-for="metric in summary.metrics" :key="metric.label" class="hero-metric">
              <span class="hero-metric-label">{{ metric.label }}</span>
              <strong :class="{ warning: metric.tone === 'warning' }">{{ metric.value }}</strong>
            </div>
          </div>
        </section>

        <!-- Charts -->
        <section class="chart-row">
          <article class="console-card panel">
            <header class="panel-head">
              <div>
                <h2>Registrations Trend</h2>
                <p>Track registration activity over time</p>
              </div>
              <select v-model="selectedRange" class="console-select range-select">
                <option v-for="range in Object.keys(trendRanges)" :key="range" :value="range">
                  {{ range }}
                </option>
              </select>
            </header>

            <div class="trend-wrap">
              <ul class="trend-y">
                <li v-for="tick in trendChart.yTicks" :key="tick">{{ tick }}</li>
              </ul>
              <svg class="trend-chart" :viewBox="`0 0 ${CHART_W} ${CHART_H}`" preserveAspectRatio="none" role="img" aria-label="Registrations trend line chart">
                <line
                  v-for="(y, index) in trendChart.gridLines"
                  :key="index"
                  :x1="PAD_X" :x2="CHART_W - PAD_X" :y1="y" :y2="y"
                  class="trend-grid"
                />
                <path :d="trendChart.area" class="trend-area" />
                <polyline :points="trendChart.line" class="trend-line" vector-effect="non-scaling-stroke" />
              </svg>
            </div>
          </article>

          <article class="console-card panel">
            <header class="panel-head">
              <div>
                <h2>Event Status Distribution</h2>
                <p>By current lifecycle stage</p>
              </div>
            </header>

            <div class="donut-wrap">
              <div class="donut-figure">
                <svg class="donut" viewBox="0 0 140 140" role="img" aria-label="Event status distribution donut chart">
                  <g transform="rotate(-90 70 70)">
                    <circle cx="70" cy="70" :r="DONUT_R" class="donut-track" />
                    <circle
                      v-for="arc in donutArcs"
                      :key="arc.label"
                      cx="70" cy="70" :r="DONUT_R"
                      class="donut-arc"
                      :class="{ dimmed: hoveredStatus && hoveredStatus !== arc.label }"
                      :stroke="arc.color"
                      :stroke-dasharray="arc.dash"
                      :stroke-dashoffset="arc.offset"
                      @mouseenter="hoveredStatus = arc.label"
                      @mouseleave="hoveredStatus = null"
                    />
                  </g>
                </svg>
                <div class="donut-center">
                  <strong>{{ (hoveredStatus ? donutArcs.find((a) => a.label === hoveredStatus).value : summary.managedEvents) }}</strong>
                  <span>{{ hoveredStatus || 'Total events' }}</span>
                </div>
              </div>

              <ul class="donut-legend">
                <li
                  v-for="arc in donutArcs"
                  :key="arc.label"
                  :class="{ dimmed: hoveredStatus && hoveredStatus !== arc.label }"
                  @mouseenter="hoveredStatus = arc.label"
                  @mouseleave="hoveredStatus = null"
                >
                  <span class="dot" :style="{ background: arc.color }" />
                  <span class="legend-label">{{ arc.label }} Events</span>
                  <span class="legend-value">{{ arc.value }} · {{ arc.percent }}%</span>
                </li>
              </ul>
            </div>
          </article>
        </section>

        <!-- Category overview -->
        <section class="console-card block">
          <header class="panel-head">
            <div>
              <h2>Category Overview</h2>
              <p>{{ summary.managedEvents }} events across all categories</p>
            </div>
            <div class="console-segmented">
              <button
                v-for="filter in categoryFilters"
                :key="filter"
                type="button"
                :class="{ active: selectedCategoryFilter === filter }"
                @click="selectedCategoryFilter = filter"
              >
                {{ filter }}
              </button>
            </div>
          </header>

          <div class="console-table-scroll">
            <table class="console-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Number of Events</th>
                  <th>Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="category in visibleCategories"
                  :key="category.name"
                  class="clickable"
                  @click="openAllEvents"
                >
                  <td>
                    <span class="cat-name">
                      <span class="cat-icon" :class="category.tone">{{ category.emoji }}</span>
                      {{ category.name }}
                    </span>
                  </td>
                  <td>{{ category.events }}</td>
                  <td>
                    <span class="fill-cell">
                      <span class="fill-bar"><span :style="{ width: `${category.fill}%` }" /></span>
                      {{ category.fill }}%
                    </span>
                  </td>
                </tr>
                <tr v-if="!visibleCategories.length">
                  <td colspan="3" class="empty-row">No categories in this view.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- User activity -->
        <section class="console-card block">
          <header class="panel-head">
            <div>
              <h2>User Activity</h2>
            </div>
            <div class="console-search">
              <Icon name="search" :size="15" />
              <input v-model="activitySearch" class="console-input" type="search" placeholder="Search activity" aria-label="Search activity" />
            </div>
          </header>

          <ul class="activity-list">
            <li
              v-for="item in visibleActivities"
              :key="item.name + item.action"
              class="activity-row clickable"
              @click="openAllEvents"
            >
              <span class="activity-avatar">{{ item.initials }}</span>
              <div class="activity-body">
                <p><strong>{{ item.name }}</strong> {{ item.action }}</p>
                <span class="activity-meta">{{ item.meta }}</span>
              </div>
              <span class="console-pill" :class="item.tag === 'Cancel' ? 'console-pill-red' : 'console-pill-green'">
                {{ item.tag }}
              </span>
            </li>
            <li v-if="!visibleActivities.length" class="activity-empty">No activity matches your search.</li>
          </ul>
        </section>
      </main>
</template>

<style scoped>
.dash {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.dash-search {
  width: 100%;
  max-width: 420px;
}

.dash-search input {
  width: 100%;
}

/* Hero -------------------------------------------------------- */
.hero {
  background: var(--gradient-page);
  border: 1px solid var(--console-border-soft);
  border-radius: var(--console-radius-lg);
  padding: 24px 26px;
  box-shadow: var(--console-shadow);
}

.hero-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-label {
  font-size: var(--console-fs-sm);
  color: var(--console-text-secondary);
}

.hero-value {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--console-fs-display);
  font-weight: 700;
  line-height: 1.1;
  margin: 4px 0 6px;
  color: var(--console-text);
}

.hero-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--console-fs-sm);
  font-weight: 700;
  color: #15803d;
  background: var(--console-success-bg);
  padding: 3px 8px;
  border-radius: 999px;
}

.hero-note {
  margin: 0;
  font-size: var(--console-fs-sm);
  color: var(--console-text-secondary);
}

.hero-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 30px;
}

.hero-metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-metric-label {
  font-size: var(--console-fs-sm);
  color: var(--console-text-secondary);
}

.hero-metric strong {
  font-size: var(--console-fs-xl);
  font-weight: 700;
  color: var(--console-text);
}

.hero-metric strong.warning {
  color: var(--console-warning);
}

/* Panels / charts ------------------------------------------- */
.chart-row {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 20px;
}

.panel {
  padding: 20px 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

/* Full-width cards have no inner padding of their own — their table / list
   rows carry it — so the header row needs to be inset to match. */
.block > .panel-head {
  padding: 20px 22px 0;
}

.panel-head h2 {
  font-size: var(--console-fs-md);
  font-weight: 700;
  margin: 0;
  color: var(--console-text);
}

.panel-head p {
  margin: 3px 0 0;
  font-size: var(--console-fs-sm);
  color: var(--console-text-secondary);
}

.range-select {
  width: auto;
  padding: 7px 10px;
  font-size: var(--console-fs-sm);
}

.trend-wrap {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.trend-y {
  list-style: none;
  margin: 0;
  padding: 2px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: var(--console-fs-xs);
  color: var(--console-text-muted);
  text-align: right;
  min-width: 26px;
}

.trend-chart {
  flex: 1;
  min-width: 0;
  height: 200px;
  display: block;
}

.trend-grid {
  stroke: var(--console-border-soft);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.trend-area {
  fill: color-mix(in srgb, var(--brand-blue) 14%, transparent);
}

.trend-line {
  fill: none;
  stroke: var(--brand-blue);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.donut-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-top: 4px;
}

.donut-figure {
  position: relative;
  width: 172px;
  height: 172px;
  filter: drop-shadow(0 8px 16px rgba(16, 24, 40, 0.1));
}

.donut {
  width: 100%;
  height: 100%;
  display: block;
}

.donut-track {
  fill: none;
  stroke: var(--console-border-soft);
  stroke-width: 12;
}

.donut-arc {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  cursor: pointer;
  transition: opacity 0.15s ease, stroke-width 0.15s ease;
}

.donut-arc:hover {
  stroke-width: 15;
}

.donut-arc.dimmed {
  opacity: 0.25;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
}

.donut-center strong {
  font-size: var(--console-fs-3xl);
  font-weight: 700;
  line-height: 1;
  color: var(--console-text);
}

.donut-center span {
  font-size: var(--console-fs-xs);
  color: var(--console-text-secondary);
  text-transform: capitalize;
}

.donut-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
}

.donut-legend li {
  display: grid;
  grid-template-columns: 9px 1fr;
  align-items: center;
  column-gap: 8px;
  row-gap: 1px;
  font-size: var(--console-fs-sm);
  transition: opacity 0.15s ease;
  cursor: pointer;
}

.donut-legend li.dimmed {
  opacity: 0.4;
}

.donut-legend .dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  color: var(--console-text-secondary);
}

.legend-value {
  grid-column: 2;
  font-weight: 700;
  color: var(--console-text);
}

/* Category table ------------------------------------------- */
.cat-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--console-text);
}

.cat-icon {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: var(--console-fs-md);
  background: var(--console-primary-soft);
}

.cat-icon.pink { background: #ffe6f1; }
.cat-icon.green { background: #d8f5ea; }
.cat-icon.amber { background: #fdf0d3; }
.cat-icon.gray { background: var(--console-gray-bg); }

.fill-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--console-fs-base);
  color: var(--console-text-secondary);
}

.fill-bar {
  width: 90px;
  height: 6px;
  border-radius: 999px;
  background: var(--console-border-soft);
  overflow: hidden;
}

.fill-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--brand-blue);
}

.clickable {
  cursor: pointer;
}

.console-table tbody tr.clickable:hover td {
  background: var(--console-gray-bg);
}

.empty-row {
  color: var(--console-text-muted);
  text-align: center;
}

/* Activity feed ------------------------------------------- */
.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--console-border-soft);
}

.activity-row:last-child {
  border-bottom: none;
}

.activity-row:hover {
  background: var(--console-gray-bg);
}

.activity-avatar {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--console-primary-soft);
  color: var(--console-primary-text);
  font-size: var(--console-fs-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.activity-body {
  flex: 1;
  min-width: 0;
}

.activity-body p {
  margin: 0;
  font-size: var(--console-fs-base);
  color: var(--console-text);
}

.activity-meta {
  font-size: var(--console-fs-xs);
  color: var(--console-text-muted);
}

.activity-empty {
  padding: 18px 22px;
  font-size: var(--console-fs-base);
  color: var(--console-text-muted);
}

/* Responsive --------------------------------------------- */
@media (max-width: 900px) {
  .chart-row {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .dash-search input {
    width: 150px;
  }
}
</style>
