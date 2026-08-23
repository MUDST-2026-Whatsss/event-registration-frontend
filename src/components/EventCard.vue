<script setup>
import { CalendarDays, MapPin, Users } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({ event: { type: Object, required: true } })
const route = useRoute()
const detailTarget = computed(() => ({
  path: `/events/${props.event.id}`,
  query: { from: route.fullPath },
}))
</script>

<template>
  <RouterLink class="event-card" :to="detailTarget">
    <div class="event-card__media">
      <img :src="event.image" :alt="event.title" />
      <span class="event-card__badge" :class="`event-card__badge--${event.status}`">{{ event.badge }}</span>
    </div>
    <div class="event-card__body">
      <h3>{{ event.title }}</h3>
      <dl>
        <div><dt><CalendarDays :size="15" /><span class="sr-only">Date</span></dt><dd>{{ event.date }}</dd></div>
        <div><dt><MapPin :size="15" /><span class="sr-only">Location</span></dt><dd>{{ event.location }}</dd></div>
        <div :class="{ 'event-card__urgent': event.status === 'almost-full' }"><dt><Users :size="15" /><span class="sr-only">Availability</span></dt><dd>{{ event.capacity }}</dd></div>
      </dl>
    </div>
  </RouterLink>
</template>

<style scoped>
.event-card { display: block; min-width: 0; overflow: hidden; color: inherit; background: var(--color-surface); border: 1px solid var(--neutral-300); border-radius: 6px; box-shadow: 0 3px 8px rgb(24 24 27 / 12%); text-decoration: none; transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
.event-card:hover { border-color: var(--brand-blue); box-shadow: 0 7px 18px rgb(24 24 27 / 15%); transform: translateY(-2px); }
.event-card__media { position: relative; aspect-ratio: 1.55; overflow: hidden; background: var(--brand-soft); }
.event-card__media img { width: 100%; height: 100%; display: block; object-fit: cover; }
.event-card__badge { position: absolute; top: 10px; right: 10px; padding: 3px 8px; color: var(--neutral-950); background: var(--neutral-0); border-radius: 3px; font-size: .6875rem; font-weight: 600; line-height: 1.2; text-transform: uppercase; }
.event-card__badge--open { color: #176a3f; background: #dff7e9; }
.event-card__badge--almost-full { color: #744700; background: #fff0c7; }
.event-card__badge--upcoming { color: #2440a8; background: #dfe6ff; }
.event-card__body { padding: 12px 13px 15px; }
.event-card h3 { min-height: 48px; margin: 0 0 8px; color: #20263a; font-size: 1rem; font-weight: 600; line-height: 1.5; }
.event-card dl, .event-card dd { margin: 0; }
.event-card dl { display: grid; gap: 5px; }
.event-card dl > div { display: grid; min-width: 0; grid-template-columns: 17px minmax(0, 1fr); gap: 5px; color: var(--neutral-600); font-size: .75rem; }
.event-card dt { display: flex; padding-top: 1px; }
.event-card dd { overflow-wrap: anywhere; }
.event-card__urgent, .event-card__urgent dt { color: #c92839 !important; }
</style>
