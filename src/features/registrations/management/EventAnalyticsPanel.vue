<script setup>
import { computed, onMounted, ref } from 'vue'
import { getEventAnalytics } from '../api/registrationsApi.js'

const props = defineProps({ eventId: { type: String, required: true } })

const analytics = ref(null)
const errorMessage = ref('')

const percent = (rate) => (rate == null ? '–' : `${Math.round(rate * 1000) / 10}%`)

// Before the event ends a show rate would count people who may still arrive, so show progress instead.
const attendance = computed(() => {
  const value = analytics.value
  if (!value) return null
  if (value.eventEnded) {
    return {
      value: percent(value.showRate),
      hint: `${value.checkedIn.toLocaleString()} checked in · ${value.noShows.toLocaleString()} no-shows`,
    }
  }
  const expected = value.checkedIn + value.confirmed
  return {
    value: `${value.checkedIn.toLocaleString()} / ${expected.toLocaleString()}`,
    hint: 'Checked in so far · show rate appears after the event ends',
  }
})

const busiestDay = computed(() => Math.max(1, ...(analytics.value?.dailySignups ?? []).map((day) => day.count)))

function formatDay(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

async function reload() {
  errorMessage.value = ''
  try {
    analytics.value = await getEventAnalytics(props.eventId)
  } catch (cause) {
    errorMessage.value = cause?.message || 'Unable to load analytics.'
  }
}

defineExpose({ reload })
onMounted(reload)
</script>

<template>
  <section class="analytics" aria-label="Event analytics">
    <p v-if="errorMessage" class="analytics-error" role="alert">{{ errorMessage }}</p>

    <template v-else-if="analytics">
      <div class="console-stat-grid analytics-stats">
        <div class="console-stat" data-test="analytics-signups">
          <div class="stat-copy">
            <div class="label">Signups</div>
            <div class="stat-hint">{{ analytics.memberSignups.toLocaleString() }} members · {{ analytics.guestSignups.toLocaleString() }} guests</div>
          </div>
          <div class="value">{{ analytics.signups.toLocaleString() }}</div>
        </div>
        <div class="console-stat" data-test="analytics-drop-offs">
          <div class="stat-copy">
            <div class="label">Drop-offs</div>
            <div class="stat-hint">
              {{ percent(analytics.dropOffRate) }} of signups<template v-if="analytics.cancelledByAdmin"> · {{ analytics.cancelledByAdmin.toLocaleString() }} removed by admin</template>
            </div>
          </div>
          <div class="value">{{ analytics.dropOffs.toLocaleString() }}</div>
        </div>
        <div class="console-stat" data-test="analytics-attendance">
          <div class="stat-copy">
            <div class="label">{{ analytics.eventEnded ? 'Show rate' : 'Attendance' }}</div>
            <div class="stat-hint">{{ attendance.hint }}</div>
          </div>
          <div class="value">{{ attendance.value }}</div>
        </div>
      </div>

      <div class="console-card analytics-daily">
        <h2>Signups per day</h2>
        <p v-if="!analytics.dailySignups.length" class="analytics-empty">No signups yet.</p>
        <ol v-else class="daily-bars" data-test="analytics-daily">
          <li v-for="day in analytics.dailySignups" :key="day.date" :title="`${formatDay(day.date)}: ${day.count} signups`">
            <span class="daily-count">{{ day.count }}</span>
            <span class="daily-track"><span class="daily-bar" :style="{ height: `${(day.count / busiestDay) * 100}%` }" /></span>
            <span class="daily-label">{{ formatDay(day.date) }}</span>
          </li>
        </ol>
      </div>
    </template>
  </section>
</template>

<style scoped>
.analytics { display: grid; gap: 16px; margin-bottom: 16px; }
.analytics-error { margin: 0; color: var(--console-danger); font-size: var(--console-fs-sm); }
.console-stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.console-stat { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.console-stat .label { margin-bottom: 0; }
.console-stat .value { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
.stat-hint { margin-top: 4px; color: var(--console-text-muted); font-size: var(--console-fs-xs); }
.analytics-daily { padding: 18px 20px; }
.analytics-daily h2 { margin: 0 0 12px; font-size: var(--console-fs-md); }
.analytics-empty { margin: 0; color: var(--console-text-muted); font-size: var(--console-fs-sm); }
.daily-bars { display: flex; height: 160px; margin: 0; padding: 0; align-items: stretch; gap: 6px; overflow-x: auto; list-style: none; }
.daily-bars li { display: flex; min-width: 34px; flex: 1 0 34px; flex-direction: column; align-items: center; gap: 4px; }
.daily-track { display: flex; width: 100%; flex: 1; align-items: flex-end; justify-content: center; }
.daily-bar { width: 100%; max-width: 28px; min-height: 2px; background: var(--console-primary); border-radius: 4px 4px 0 0; }
.daily-count { color: var(--console-text-secondary); font-size: var(--console-fs-xs); font-variant-numeric: tabular-nums; }
.daily-label { color: var(--console-text-muted); font-size: var(--console-fs-xs); white-space: nowrap; }
@media (max-width: 900px) { .console-stat-grid { grid-template-columns: 1fr; } }
</style>
