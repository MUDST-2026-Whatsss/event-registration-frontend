<script setup>
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'
import { dashboardChangeRequests, eventStatuses, recentApprovals } from './dashboardData.js'
import EventsOverviewCard from './EventsOverviewCard.vue'

const changeRequests = dashboardChangeRequests
</script>

<template>

  <main class="console-body dashboard-body">

    <!-- =====================================================
         Heading
    ====================================================== -->

    <section class="console-heading-row dashboard-heading">
      <div class="console-page-heading">
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

      <article class="console-stat dashboard-stat">
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

      <article class="console-stat dashboard-stat">
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

      <article class="console-stat dashboard-stat">
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

      <article class="console-stat dashboard-stat pending-stat">
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

        <EventsOverviewCard :statuses="eventStatuses" />

      </div>

      <!-- ===================================================
           RIGHT COLUMN
      ==================================================== -->

      <div class="dashboard-right">

        <!-- Recent Event Approvals -->
        <article class="console-card approvals-card">

          <div class="console-card-header">
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
                class="console-pill"
                :class="{
                  'console-pill-amber':
                    event.status === 'Pending',

                  'console-pill-green':
                    event.status === 'Approved',

                  'console-pill-red':
                    event.status === 'Rejected',
                }"
              >
                {{ event.status.toUpperCase() }}
              </span>

            </div>

          </div>

        </article>

        <!-- Change Requests -->
        <article class="console-card change-card">

          <div class="console-card-header">
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
  color: var(--console-primary);
  background: var(--console-primary-soft);
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
  color: var(--console-text-secondary);
  font-size: var(--console-fs-xs);
}

.stat-value {
  margin-top: 5px;

  color: var(--console-text);

  font-size: var(--console-fs-2xl);
  line-height: 1;

  font-weight: 700;
}

.stat-note {
  margin-top: 5px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-xs);
}

.stat-note.success {
  color: var(--console-success);
}

.stat-note.warning {
  color: var(--console-warning);
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











/* Tooltip sits on the graph */





/* =========================================================
   Status legend
========================================================= */









/* =========================================================
   Card links
========================================================= */

.card-link {
  min-height: 42px;

  padding: 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-top: 1px solid var(--console-border-soft);

  color: var(--console-primary);

  font-size: var(--console-fs-2xs);

  font-weight: 600;

  text-decoration: none;

  transition:
    background 0.15s ease;
}

.card-link:hover {
  background: var(--console-gray-bg);
}

.view-all {
  padding: 4px 6px;

  border-radius: 5px;

  color: var(--console-primary);

  font-size: var(--console-fs-xs);

  font-weight: 600;

  text-decoration: none;
}

.view-all:hover {
  background: var(--console-primary-soft);
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

  border-bottom: 1px solid var(--console-border-soft);
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

  color: var(--console-text);

  font-size: var(--console-fs-xs);

  line-height: 1.2;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.approval-info span,
.approval-info small {
  color: var(--console-text-secondary);

  font-size: var(--console-fs-2xs);

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

  border: 1px solid var(--console-border);

  border-radius: 7px;
}

.change-label {
  color: var(--console-text-secondary);

  font-size: var(--console-fs-2xs);

  line-height: 1.2;
}

.change-stat strong {
  color: var(--console-text);

  font-size: var(--console-fs-xl);

  line-height: 1;
}

.change-note {
  font-size: var(--console-fs-2xs);

  line-height: 1.2;
}

.change-note.success {
  color: var(--console-success);
}

.change-note.warning {
  color: var(--console-warning);
}

.change-note.danger {
  color: var(--console-danger);
}


/* =========================================================
   Footer
========================================================= */

.dashboard-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 20px 2px 0;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-2xs);
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
