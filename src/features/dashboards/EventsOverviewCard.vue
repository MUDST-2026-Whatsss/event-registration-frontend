<script setup>
import { computed, ref } from 'vue'
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

const props = defineProps({
  statuses: { type: Array, default: () => [] },
})

const eventStatuses = computed(() => props.statuses)

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

  return eventStatuses.value.map((status) => {
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
<article class="console-card overview-card">

  <div class="console-card-header">
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
</template>

<style scoped>
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
.status-list {
  display: flex;
  flex-direction: column;

  gap: 16px;
}
.status-dot {
  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;
}
.status-name {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 8px;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-xs);
}
.status-percent {
  color: var(--console-text-muted);

  text-align: right;

  font-size: var(--console-fs-2xs);
}

/* Stack the donut above the legend once two columns no longer fit. */
@media (max-width: 700px) {
  .overview-content {
    grid-template-columns: minmax(0, 1fr);
    padding: 20px 16px;
  }

  .donut-wrapper,
  .donut-chart {
    width: min(100%, 240px);
    height: auto;
    aspect-ratio: 1;
  }
}

.overview-card {
  width: 100%;

  min-height: 480px;

  overflow: visible;

  display: flex;
  flex-direction: column;
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
  color: var(--console-text);

  font-size: var(--console-fs-3xl);
  line-height: 1.1;

  font-weight: 700;
}
.donut-center span {
  margin-top: 5px;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-2xs);
}
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

  border: 1px solid var(--console-border);

  border-radius: 8px;

  background: #fff;

  box-shadow: var(--console-shadow);

  pointer-events: none;

  white-space: nowrap;
}
.donut-tooltip strong {
  color: var(--console-text);

  font-size: var(--console-fs-2xs);
}
.donut-tooltip span {
  margin-top: 2px;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-xs);
}
.donut-tooltip small {
  margin-top: 2px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
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
  color: var(--console-text);

  font-size: var(--console-fs-3xl);
  line-height: 1.1;

  font-weight: 700;
}
.donut-center span {
  margin-top: 5px;

  color: var(--console-text-secondary);

  font-size: var(--console-fs-2xs);
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
  background: var(--console-gray-bg);
}
.status-row strong {
  color: var(--console-text-secondary);

  text-align: right;

  font-size: var(--console-fs-xs);

  font-weight: 600;
}
</style>
