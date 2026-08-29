<script setup>
import { ArrowRight, ListFilter, Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import heroImage from '../assets/events/hero.jpg'
import AppFooter from '../components/AppFooter.vue'
import EventCard from '../components/EventCard.vue'
import PublicHeader from '../components/PublicHeader.vue'
import { eventGroups } from '../data/events.js'

const route = useRoute()
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedStatus = ref('all')
const selectedGroup = computed(() => {
  const group = typeof route.query.group === 'string' ? route.query.group : ''
  return eventGroups.some((item) => item.id === group) ? group : ''
})
const pageTitle = computed(() => eventGroups.find((group) => group.id === selectedGroup.value)?.title ?? 'Our Events')
const pageSubtitle = computed(() => selectedGroup.value ? `Explore all ${pageTitle.value.toLowerCase()}` : 'All of My Events Now')
const filterOptions = [
  { value: 'all', label: 'All events' }, { value: 'open', label: 'Open' },
  { value: 'almost-full', label: 'Almost full' }, { value: 'upcoming', label: 'Upcoming' },
  { value: 'closed', label: 'Closed' },
]
const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()
  const visibleGroups = selectedGroup.value ? eventGroups.filter((group) => group.id === selectedGroup.value) : eventGroups
  return visibleGroups.map((group) => ({ ...group, events: group.events.filter((event) => {
    const matchesQuery = !query || `${event.title} ${event.location}`.toLocaleLowerCase().includes(query)
    return matchesQuery && (selectedStatus.value === 'all' || event.status === selectedStatus.value)
  }) }))
})
</script>

<template>
  <div class="events-page">
    <PublicHeader />
    <main>
      <section class="hero" :style="{ backgroundImage: `url(${heroImage})` }" aria-labelledby="hero-title">
        <div class="hero__overlay"></div>
        <div class="hero__content"><h1 id="hero-title">{{ pageTitle }}</h1><p>{{ pageSubtitle }}</p></div>
      </section>
      <div id="events" class="events-shell">
        <section class="event-tools" aria-label="Event search and filters">
          <label class="event-tools__search"><span class="sr-only">Search events</span><Search :size="19" /><input v-model="searchQuery" type="search" placeholder="What kind of event are you looking for?" /></label>
          <label class="event-tools__filter"><ListFilter :size="17" /><span class="sr-only">Filter by status</span><select v-model="selectedStatus"><option v-for="option in filterOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
        </section>
        <section v-for="group in filteredGroups" :key="group.id" class="event-group" :aria-labelledby="`${group.id}-title`">
          <div class="event-group__heading">
            <h2 :id="`${group.id}-title`">{{ group.title }}</h2>
            <RouterLink v-if="selectedGroup" to="/events">All events <ArrowRight :size="14" /></RouterLink>
            <RouterLink v-else :to="{ path: '/events', query: { group: group.id } }">View all <ArrowRight :size="14" /></RouterLink>
          </div>
          <div v-if="group.events.length" class="event-grid"><EventCard v-for="event in group.events" :key="event.id" :event="event" /></div>
          <p v-else class="event-group__empty">No events match your search.</p>
        </section>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.events-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; }
.events-page main { flex: 1; }
.hero { position: relative; display: grid; min-height: 300px; overflow: hidden; place-items: center; background-position: center 48%; background-size: cover; }
.hero__overlay { position: absolute; inset: 0; background: rgb(0 69 177 / 78%); }
.hero__content { position: relative; z-index: 1; padding: 24px; color: var(--neutral-0); text-align: center; }
.hero h1 { margin: 0; font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 600; line-height: 1.15; letter-spacing: 0; }
.hero p { margin: 22px 0 0; font-size: 1.125rem; font-weight: 600; }
.events-shell { width: min(100% - 48px, 1180px); min-height: 860px; margin-inline: auto; padding-block: 50px 110px; scroll-margin-top: 76px; }
.event-tools { display: flex; margin-bottom: 26px; gap: 12px; }
.event-tools__search, .event-tools__filter { display: flex; height: 46px; align-items: center; color: var(--neutral-600); background: #fafaff; border: 1px solid #cfd2df; border-radius: 6px; }
.event-tools__search { width: min(100%, 350px); padding-inline: 14px; gap: 10px; }
.event-tools__search:focus-within, .event-tools__filter:focus-within { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.event-tools__search input { width: 100%; min-width: 0; padding: 0; color: var(--neutral-950); background: transparent; border: 0; outline: 0; font-size: .875rem; }
.event-tools__filter { width: 140px; padding-left: 14px; }
.event-tools__filter select { width: 100%; height: 100%; padding: 0 10px 0 8px; color: #4d5263; background: transparent; border: 0; outline: 0; cursor: pointer; font-size: .875rem; }
.event-group + .event-group { margin-top: 68px; }
.event-group__heading { display: flex; margin-bottom: 20px; align-items: center; justify-content: space-between; gap: 16px; }
.event-group__heading h2 { margin: 0; font-size: 1.375rem; font-weight: 600; line-height: 1.3; }
.event-group__heading a { display: inline-flex; align-items: center; gap: 2px; color: #1850d8; font-size: .8125rem; text-decoration: none; }
.event-group__heading a:hover { text-decoration: underline; }
.event-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.event-group__empty { min-height: 120px; margin: 0; padding: 42px 16px; color: var(--neutral-600); background: #fafaff; border: 1px dashed var(--neutral-300); border-radius: 6px; text-align: center; }
@media (max-width: 900px) { .event-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) {
  .hero { min-height: 235px; }
  .hero h1 { font-size: 2.5rem; }
  .events-shell { width: min(100% - 32px, 1180px); min-height: 0; padding-block: 32px 64px; }
  .event-tools { align-items: stretch; flex-direction: column; }
  .event-tools__search, .event-tools__filter { width: 100%; }
  .event-grid { grid-template-columns: 1fr; }
  .event-group + .event-group { margin-top: 48px; }
}
</style>
