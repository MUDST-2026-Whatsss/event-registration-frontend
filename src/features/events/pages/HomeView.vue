<script setup>
import { ArrowRight, MapPin, Search } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import halloweenImage from '@/assets/events/halloween.jpg'
import AppFooter from '@/shared/ui/AppFooter.vue'
import EventCard from '../components/EventCard.vue'
import PublicHeader from '@/app/components/PublicHeader.vue'
import { eventGroups } from '../data/events.js'

const router = useRouter()
const searchQuery = ref('')
const locationQuery = ref('')
const now = ref(Date.now())
const countdownTimer = window.setInterval(() => { now.value = Date.now() }, 1000)

const countdown = computed(() => {
  const target = new Date('2026-10-31T09:00:00+07:00').getTime()
  const difference = Math.max(0, target - now.value)
  return [
    { label: 'days', value: Math.floor(difference / 86400000) },
    { label: 'hours', value: Math.floor((difference / 3600000) % 24) },
    { label: 'minutes', value: Math.floor((difference / 60000) % 60) },
    { label: 'seconds', value: Math.floor((difference / 1000) % 60) },
  ]
})

function searchEvents() {
  const query = [searchQuery.value.trim(), locationQuery.value.trim()].filter(Boolean).join(' ')
  router.push({ path: '/events', query: query ? { q: query } : {} })
}

onBeforeUnmount(() => window.clearInterval(countdownTimer))
</script>

<template>
  <div class="home-page">
    <PublicHeader />

    <main>
      <section class="home-hero" aria-labelledby="home-title">
        <div class="home-hero__inner">
          <h1 id="home-title">Find Your Next Great Experience</h1>
          <p>Discover conferences, workshops, and meetups tailored to your professional growth and personal interests.</p>

          <form class="home-search" @submit.prevent="searchEvents">
            <label>
              <Search :size="19" aria-hidden="true" />
              <span class="sr-only">Search events</span>
              <input v-model="searchQuery" type="search" placeholder="What kind of event are you looking for?" />
            </label>
            <label class="home-search__location">
              <MapPin :size="19" aria-hidden="true" />
              <span class="sr-only">Location</span>
              <input v-model="locationQuery" type="search" placeholder="Location" />
            </label>
            <button type="submit">Search Events</button>
          </form>
        </div>
      </section>

      <RouterLink class="countdown" to="/events/7" :style="{ backgroundImage: `url(${halloweenImage})` }">
        <span class="countdown__overlay"></span>
        <span class="countdown__content">
          <strong>Don&rsquo;t Miss Out!</strong>
          <span class="countdown__event">Halloween Event</span>
          <span class="countdown__meta">ICT Floor 1 &bull; 31 October 2026</span>
          <span class="countdown__timer" aria-label="Time remaining until Halloween Event">
            <span v-for="unit in countdown" :key="unit.label"><b>{{ unit.value }}</b><small>{{ unit.label }}</small></span>
          </span>
        </span>
      </RouterLink>

      <div class="home-events">
        <section v-for="group in eventGroups" :key="group.id" class="home-event-group" :aria-labelledby="`home-${group.id}`">
          <div class="home-event-group__heading">
            <h2 :id="`home-${group.id}`">{{ group.title }}</h2>
            <RouterLink :to="{ path: '/events', query: { group: group.id } }">View all <ArrowRight :size="14" /></RouterLink>
          </div>
          <div class="home-event-grid">
            <EventCard v-for="event in group.events" :key="event.id" :event="event" />
          </div>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.home-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; }
.home-page main { flex: 1; }
.home-hero { display: grid; min-height: 420px; place-items: center; background: var(--gradient-page); }
.home-hero__inner { width: min(100% - 32px, 940px); padding-block: 64px; text-align: center; }
.home-hero h1 { margin: 0; font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 600; line-height: 1.2; letter-spacing: 0; }
.home-hero p { max-width: 620px; margin: 18px auto 38px; color: #565a69; font-size: 1.0625rem; }
.home-search { display: grid; max-width: 760px; margin-inline: auto; grid-template-columns: minmax(260px, 1.8fr) minmax(150px, .8fr) auto; gap: 8px; }
.home-search label { display: flex; height: 48px; padding-inline: 14px; align-items: center; gap: 10px; color: var(--neutral-600); background: var(--neutral-0); border: 1px solid #cbd0df; border-radius: 6px; }
.home-search label:focus-within { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.home-search input { width: 100%; min-width: 0; padding: 0; background: transparent; border: 0; outline: 0; font-size: .875rem; }
.home-search button { min-width: 126px; padding-inline: 18px; color: var(--neutral-0); background: #2455db; border-radius: 6px; cursor: pointer; font-size: .875rem; font-weight: 500; }
.home-search button:hover { background: #183fae; }
.countdown { position: relative; display: grid; min-height: 330px; overflow: hidden; place-items: center; color: var(--neutral-0); background-position: center 45%; background-size: cover; text-decoration: none; }
.countdown__overlay { position: absolute; inset: 0; background: rgb(39 27 62 / 76%); }
.countdown__content { position: relative; z-index: 1; display: flex; padding: 42px 16px; align-items: center; flex-direction: column; text-align: center; }
.countdown__content > strong { font-size: clamp(2rem, 5vw, 3rem); font-weight: 600; }
.countdown__event { margin-top: 4px; font-size: 1.75rem; font-weight: 600; }
.countdown__meta { margin-top: 8px; font-size: .8125rem; }
.countdown__timer { display: grid; margin-top: 38px; grid-template-columns: repeat(4, 72px); gap: 16px; }
.countdown__timer > span { display: flex; flex-direction: column; gap: 7px; }
.countdown__timer b { font-size: 1.75rem; font-weight: 500; }
.countdown__timer small { font-size: .8125rem; }
.home-events { width: min(100% - 48px, 1180px); min-height: 820px; margin-inline: auto; padding-block: 40px 120px; }
.home-event-group + .home-event-group { margin-top: 68px; }
.home-event-group__heading { display: flex; margin-bottom: 20px; align-items: center; justify-content: space-between; gap: 16px; }
.home-event-group h2 { margin: 0; font-size: 1.375rem; font-weight: 600; }
.home-event-group__heading a { display: inline-flex; align-items: center; gap: 3px; color: #1850d8; font-size: .8125rem; text-decoration: none; }
.home-event-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
@media (max-width: 900px) { .home-event-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 620px) {
  .home-hero { min-height: 430px; }
  .home-hero__inner { padding-block: 48px; }
  .home-hero h1 { font-size: 2.25rem; }
  .home-search { grid-template-columns: 1fr; }
  .home-search button { height: 48px; }
  .countdown { min-height: 340px; }
  .countdown__content > strong { font-size: 2rem; }
  .countdown__event { font-size: 1.4rem; }
  .countdown__timer { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .countdown__timer b { font-size: 1.4rem; }
  .home-events { width: min(100% - 32px, 1180px); min-height: 0; padding-block: 36px 72px; }
  .home-event-grid { grid-template-columns: 1fr; }
}
</style>
