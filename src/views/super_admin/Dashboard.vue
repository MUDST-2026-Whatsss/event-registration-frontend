<script setup>
import { computed, ref } from 'vue'
import PageTopbar from '../../components/super_admin/PageTopbar.vue'
import UserMenu from '../../components/super_admin/UserMenu.vue'
import Icon from '../../components/super_admin/Icon.vue'

/* =========================================================
   Dashboard data
========================================================= */

const eventStatuses = [
  {
    label: 'Published',
    count: 842,
    percent: 69.9,
    color: '#5878f2',
  },
  {
    label: 'Pending Approval',
    count: 156,
    percent: 13.0,
    color: '#36b9b5',
  },
  {
    label: 'Draft',
    count: 98,
    percent: 8.1,
    color: '#f5a623',
  },
  {
    label: 'Rejected',
    count: 67,
    percent: 5.6,
    color: '#ef5350',
  },
  {
    label: 'Completed',
    count: 41,
    percent: 3.4,
    color: '#9aa5b5',
  },
]

const recentApprovals = [
  {
    id: 1,
    name: 'Summer Music Festival 2026',
    submittedBy: 'Dana Whitfield',
    time: '2 hours ago',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 2,
    name: 'AI & Future of Work Summit',
    submittedBy: 'Priya Nair',
    time: '5 hours ago',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 3,
    name: 'Indie Game Jam — 48hr Challenge',
    submittedBy: 'Liam O’Connor',
    time: 'Yesterday',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 4,
    name: 'Global Food & Wine Expo 2026',
    submittedBy: 'Elena Rossi',
    time: '2 days ago',
    status: 'Approved',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 5,
    name: 'Startup Pitch Night',
    submittedBy: 'Mei Lin',
    time: '2 days ago',
    status: 'Rejected',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=180&q=80',
  },
]

const changeRequests = [
  {
    label: 'Total Requests',
    value: 28,
    note: '↑ 6 this week',
    type: 'success',
  },
  {
    label: 'Pending Review',
    value: 12,
    note: 'Needs review',
    type: 'warning',
  },
  {
    label: 'Approved',
    value: 10,
    note: 'This week',
    type: 'success',
  },
  {
    label: 'Rejected',
    value: 6,
    note: 'This week',
    type: 'danger',
  },
]

/* =========================================================
   Donut chart
========================================================= */

const hoveredStatus = ref(null)

const chart = {
  cx: 100,
  cy: 100,
  radius: 69,
  strokeWidth: 27,
}

const polarToCartesian = (cx, cy, radius, angle) => {
  const angleInRadians = ((angle - 90) * Math.PI) / 180

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}

const describeArc = (startAngle, endAngle) => {
  const start = polarToCartesian(
    chart.cx,
    chart.cy,
    chart.radius,
    endAngle,
  )

  const end = polarToCartesian(
    chart.cx,
    chart.cy,
    chart.radius,
    startAngle,
  )

  const largeArcFlag =
    endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${start.x} ${start.y}`,
    `A ${chart.radius} ${chart.radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
  ].join(' ')
}

const donutSegments = computed(() => {
  let currentAngle = 0

  return eventStatuses.map((status) => {
    const startAngle = currentAngle
    const endAngle =
      currentAngle + (status.percent / 100) * 360

    currentAngle = endAngle

    return {
      ...status,
      startAngle,
      endAngle,
      path: describeArc(startAngle, endAngle),
    }
  })
})

function showStatus(status) {
  hoveredStatus.value = status
}

function hideStatus() {
  hoveredStatus.value = null
}

/* Slightly enlarge hovered slice */
const getSegmentTransform = (segment) => {
  if (
    !hoveredStatus.value ||
    hoveredStatus.value.label !== segment.label
  ) {
    return 'translate(0 0)'
  }

  const middleAngle =
    (segment.startAngle + segment.endAngle) / 2

  const radians =
    ((middleAngle - 90) * Math.PI) / 180

  const distance = 4

  const x = Math.cos(radians) * distance
  const y = Math.sin(radians) * distance

  return `translate(${x} ${y})`
}
</script>

<template>
  <PageTopbar title="Dashboard">
    <template #actions>
      <UserMenu />
    </template>
  </PageTopbar>

  <main class="sa-body dashboard-body">

    <!-- =====================================================
         Heading
    ====================================================== -->

    <section class="sa-heading-row dashboard-heading">
      <div class="sa-page-heading">
        <h1>Dashboard</h1>

        <p>
          Get a quick overview of events, users, and pending requests.
        </p>
      </div>
    </section>

    <!-- =====================================================
         Statistics
    ====================================================== -->

    <section class="stats-grid">

      <article class="sa-stat dashboard-stat">
        <div class="stat-icon blue">
          <Icon name="users" :size="17" />
        </div>

        <div class="stat-content">
          <div class="stat-label">
            Total Users
          </div>

          <div class="stat-value">
            12,840
          </div>

          <div class="stat-note success">
            ↑ +340 this week
          </div>
        </div>
      </article>

      <article class="sa-stat dashboard-stat">
        <div class="stat-icon purple">
          <Icon name="user-check" :size="17" />
        </div>

        <div class="stat-content">
          <div class="stat-label">
            Total Admins
          </div>

          <div class="stat-value">
            18
          </div>

          <div class="stat-note">
            Active across 3 roles
          </div>
        </div>
      </article>

      <article class="sa-stat dashboard-stat">
        <div class="stat-icon teal">
          <Icon name="calendar" :size="17" />
        </div>

        <div class="stat-content">
          <div class="stat-label">
            Total Events
          </div>

          <div class="stat-value">
            1,204
          </div>

          <div class="stat-note">
            Published to date
          </div>
        </div>
      </article>

      <article class="sa-stat dashboard-stat pending-stat">
        <div class="stat-icon orange">
          <Icon name="clock" :size="17" />
        </div>

        <div class="stat-content">
          <div class="stat-label">
            Pending Approvals
          </div>

          <div class="stat-value">
            9
          </div>

          <div class="stat-note warning">
            Needs your attention
          </div>
        </div>
      </article>

    </section>

    <!-- =====================================================
         Main dashboard
         
         LEFT  = Events Overview
         RIGHT = Recent Approvals + Change Requests
    ====================================================== -->

    <section class="dashboard-grid">

      <!-- ===================================================
           LEFT COLUMN
      ==================================================== -->

      <div class="dashboard-left">

        <article class="sa-card overview-card">

          <div class="sa-card-header">
            <h2>Events Overview</h2>
          </div>

          <div class="overview-content">

            <!-- Donut -->
            <div
              class="donut-area"
              @mouseleave="hideStatus"
            >

              <div class="donut-wrapper">

                <svg
                  class="donut-chart"
                  viewBox="0 0 200 200"
                  role="img"
                  aria-label="Events overview chart"
                >

                  <!-- Base ring -->
                  <circle
                    :cx="chart.cx"
                    :cy="chart.cy"
                    :r="chart.radius"
                    fill="none"
                    stroke="#eef1f5"
                    :stroke-width="chart.strokeWidth"
                  />

                  <!-- Actual segments -->
                  <path
                    v-for="segment in donutSegments"
                    :key="segment.label"
                    :d="segment.path"
                    fill="none"
                    :stroke="segment.color"
                    :stroke-width="chart.strokeWidth"
                    stroke-linecap="butt"
                    class="donut-segment"
                    :class="{
                      hovered:
                        hoveredStatus?.label === segment.label,
                    }"
                    :transform="getSegmentTransform(segment)"
                    @mouseenter="showStatus(segment)"
                  />

                </svg>

                <!-- Center -->
                <div class="donut-center">
                  <strong>1,204</strong>
                  <span>Total Events</span>
                </div>

                <!-- Tooltip -->
                <div
                  v-if="hoveredStatus"
                  class="donut-tooltip"
                >
                  <strong>
                    {{ hoveredStatus.label }}
                  </strong>

                  <span>
                    {{ hoveredStatus.count.toLocaleString() }}
                    events
                  </span>

                  <small>
                    {{ hoveredStatus.percent }}% of all events
                  </small>
                </div>

              </div>

            </div>

            <!-- Legend -->
            <div class="status-list">

              <div
                v-for="status in eventStatuses"
                :key="status.label"
                class="status-row"
              >

                <div class="status-name">
                  <span
                    class="status-dot"
                    :style="{
                      backgroundColor: status.color,
                    }"
                  />

                  <span>
                    {{ status.label }}
                  </span>
                </div>

                <strong>
                  {{ status.count.toLocaleString() }}
                </strong>

                <span class="status-percent">
                  {{ status.percent }}%
                </span>

              </div>

            </div>

          </div>

          <RouterLink
            to="/super-admin/all-events"
            class="card-link"
          >
            <span>
              View all events
            </span>

            <Icon
              name="chevron-right"
              :size="14"
            />
          </RouterLink>

        </article>

      </div>

      <!-- ===================================================
           RIGHT COLUMN
      ==================================================== -->

      <div class="dashboard-right">

        <!-- Recent Event Approvals -->
        <article class="sa-card approvals-card">

          <div class="sa-card-header">
            <h2>
              Recent Event Approvals
            </h2>

            <RouterLink
              to="/super-admin/event-approvals"
              class="view-all"
            >
              View all
            </RouterLink>
          </div>

          <div class="approval-list">

            <div
              v-for="event in recentApprovals"
              :key="event.id"
              class="approval-row"
            >

              <img
                :src="event.image"
                :alt="event.name"
                class="event-thumbnail"
              />

              <div class="approval-info">
                <strong>
                  {{ event.name }}
                </strong>

                <span>
                  Submitted by {{ event.submittedBy }}
                </span>

                <small>
                  {{ event.time }}
                </small>
              </div>

              <span
                class="sa-pill"
                :class="{
                  'sa-pill-amber':
                    event.status === 'Pending',

                  'sa-pill-green':
                    event.status === 'Approved',

                  'sa-pill-red':
                    event.status === 'Rejected',
                }"
              >
                {{ event.status.toUpperCase() }}
              </span>

            </div>

          </div>

        </article>

        <!-- Change Requests -->
        <article class="sa-card change-card">

          <div class="sa-card-header">
            <h2>
              Change Requests Overview
            </h2>
          </div>

          <div class="change-stats">

            <div
              v-for="item in changeRequests"
              :key="item.label"
              class="change-stat"
            >

              <span class="change-label">
                {{ item.label }}
              </span>

              <strong>
                {{ item.value }}
              </strong>

              <span
                class="change-note"
                :class="item.type"
              >
                {{ item.note }}
              </span>

            </div>

          </div>

          <RouterLink
            to="/super-admin/change-requests"
            class="card-link"
          >
            <span>
              View all change requests
            </span>

            <Icon
              name="chevron-right"
              :size="14"
            />
          </RouterLink>

        </article>

      </div>

    </section>

  </main>
</template>

<style scoped>
/* =========================================================
   Page
========================================================= */

.dashboard-body {
  padding-bottom: 28px;
}

.dashboard-heading {
  margin-bottom: 18px;
}


/* =========================================================
   Statistics
========================================================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 18px;
}

.dashboard-stat {
  min-height: 92px;

  padding: 15px 16px;

  display: flex;
  align-items: flex-start;

  gap: 12px;
}

.stat-icon {
  width: 37px;
  height: 37px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.stat-icon.blue {
  color: var(--sa-primary);
  background: var(--sa-primary-soft);
}

.stat-icon.purple {
  color: #7659d8;
  background: #eeeaff;
}

.stat-icon.teal {
  color: #20aaa6;
  background: #e2f8f6;
}

.stat-icon.orange {
  color: #e9a027;
  background: #fff3df;
}

.stat-content {
  min-width: 0;
}

.stat-label {
  color: var(--sa-text-secondary);
  font-size: 11px;
}

.stat-value {
  margin-top: 5px;

  color: var(--sa-text);

  font-size: 21px;
  line-height: 1;

  font-weight: 700;
}

.stat-note {
  margin-top: 5px;

  color: var(--sa-text-muted);

  font-size: 9.5px;
}

.stat-note.success {
  color: var(--sa-success);
}

.stat-note.warning {
  color: var(--sa-warning);
}

.pending-stat {
  background: #fffdf9;
}


/* =========================================================
   Main dashboard layout
========================================================= */

.dashboard-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1.15fr)
    minmax(390px, 0.85fr);

  gap: 16px;

  align-items: stretch;
}

.dashboard-left {
  min-width: 0;

  display: flex;
}

.dashboard-right {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 16px;
}


/* =========================================================
   Events Overview
========================================================= */

.overview-card {
  width: 100%;

  min-height: 480px;

  overflow: visible;

  display: flex;
  flex-direction: column;
}

.overview-content {
  flex: 1;

  display: grid;

  grid-template-columns:
    minmax(260px, 1.05fr)
    minmax(190px, 0.95fr);

  align-items: center;

  gap: 18px;

  padding: 25px 28px;
}

.donut-area {
  display: flex;

  align-items: center;
  justify-content: center;
}

.donut-wrapper {
  position: relative;

  width: 260px;
  height: 260px;

  display: flex;

  align-items: center;
  justify-content: center;
}

.donut-chart {
  width: 260px;
  height: 260px;

  overflow: visible;
}

.donut-segment {
  cursor: pointer;

  transition:
    stroke-width 0.15s ease,
    filter 0.15s ease,
    transform 0.15s ease;
}

.donut-segment:hover,
.donut-segment.hovered {
  filter: brightness(0.96);

  stroke-width: 31px;
}

.donut-center {
  position: absolute;

  inset: 0;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  pointer-events: none;
}

.donut-center strong {
  color: var(--sa-text);

  font-size: 25px;
  line-height: 1.1;

  font-weight: 700;
}

.donut-center span {
  margin-top: 5px;

  color: var(--sa-text-secondary);

  font-size: 10px;
}

/* Tooltip sits on the graph */
.donut-tooltip {
  position: absolute;

  top: -12px;
  left: 50%;

  z-index: 10;

  transform: translateX(-50%);

  min-width: 135px;

  padding: 9px 12px;

  display: flex;
  flex-direction: column;
  align-items: center;

  border: 1px solid var(--sa-border);

  border-radius: 8px;

  background: #fff;

  box-shadow: var(--sa-shadow);

  pointer-events: none;

  white-space: nowrap;
}

.donut-tooltip strong {
  color: var(--sa-text);

  font-size: 10px;
}

.donut-tooltip span {
  margin-top: 2px;

  color: var(--sa-text-secondary);

  font-size: 9px;
}

.donut-tooltip small {
  margin-top: 2px;

  color: var(--sa-text-muted);

  font-size: 8px;
}


/* =========================================================
   Status legend
========================================================= */

.status-list {
  display: flex;
  flex-direction: column;

  gap: 16px;
}

.status-row {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    55px
    45px;

  align-items: center;

  gap: 8px;

  padding: 7px 8px;

  border-radius: 7px;

  transition:
    background 0.15s ease;
}

.status-row:hover {
  background: var(--sa-gray-bg);
}

.status-name {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 8px;

  color: var(--sa-text-secondary);

  font-size: 11px;
}

.status-dot {
  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;
}

.status-row strong {
  color: var(--sa-text-secondary);

  text-align: right;

  font-size: 10.5px;

  font-weight: 600;
}

.status-percent {
  color: var(--sa-text-muted);

  text-align: right;

  font-size: 10px;
}


/* =========================================================
   Card links
========================================================= */

.card-link {
  min-height: 42px;

  padding: 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-top: 1px solid var(--sa-border-soft);

  color: var(--sa-primary);

  font-size: 10px;

  font-weight: 600;

  text-decoration: none;

  transition:
    background 0.15s ease;
}

.card-link:hover {
  background: var(--sa-gray-bg);
}

.view-all {
  padding: 4px 6px;

  border-radius: 5px;

  color: var(--sa-primary);

  font-size: 9.5px;

  font-weight: 600;

  text-decoration: none;
}

.view-all:hover {
  background: var(--sa-primary-soft);
}


/* =========================================================
   Recent Event Approvals
========================================================= */

.approvals-card {
  min-height: 0;

  flex: 1;

  overflow: hidden;
}

.approval-list {
  display: flex;
  flex-direction: column;

  padding: 5px 0;
}

.approval-row {
  min-height: 65px;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 8px 16px;

  border-bottom: 1px solid var(--sa-border-soft);
}

.approval-row:last-child {
  border-bottom: none;
}

.event-thumbnail {
  width: 46px;
  height: 42px;

  flex-shrink: 0;

  object-fit: cover;

  border-radius: 7px;
}

.approval-info {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 3px;
}

.approval-info strong {
  overflow: hidden;

  color: var(--sa-text);

  font-size: 9.5px;

  line-height: 1.2;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.approval-info span,
.approval-info small {
  color: var(--sa-text-secondary);

  font-size: 8.5px;

  line-height: 1.2;
}


/* =========================================================
   Change Requests
========================================================= */

.change-card {
  overflow: hidden;
}

.change-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 8px;

  padding: 14px 16px 16px;
}

.change-stat {
  min-width: 0;

  padding: 11px 9px;

  display: flex;
  flex-direction: column;

  gap: 5px;

  border: 1px solid var(--sa-border);

  border-radius: 7px;
}

.change-label {
  color: var(--sa-text-secondary);

  font-size: 8.5px;

  line-height: 1.2;
}

.change-stat strong {
  color: var(--sa-text);

  font-size: 18px;

  line-height: 1;
}

.change-note {
  font-size: 8px;

  line-height: 1.2;
}

.change-note.success {
  color: var(--sa-success);
}

.change-note.warning {
  color: var(--sa-warning);
}

.change-note.danger {
  color: var(--sa-danger);
}


/* =========================================================
   Footer
========================================================= */

.dashboard-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 20px 2px 0;

  color: var(--sa-text-secondary);

  font-size: 8.5px;
}


/* =========================================================
   Responsive
========================================================= */

@media (max-width: 1050px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .overview-card {
    min-height: auto;
  }

  .dashboard-right {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr);
  }

  .approvals-card {
    flex: initial;
  }
}

@media (max-width: 800px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .overview-content {
    grid-template-columns: 1fr;
  }

  .dashboard-right {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .donut-wrapper,
  .donut-chart {
    width: 220px;
    height: 220px;
  }

  .change-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .dashboard-footer {
    flex-direction: column;

    align-items: flex-start;

    gap: 6px;
  }
}
</style>