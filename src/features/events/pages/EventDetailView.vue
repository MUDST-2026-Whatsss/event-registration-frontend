<script setup>
import { CalendarClock, CalendarDays, LockKeyhole, MapPin, RefreshCw, ShieldCheck } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/shared/ui/AppFooter.vue'
import PublicHeader from '@/app/components/PublicHeader.vue'
import { useAuth } from '@/features/auth/public.js'
import { useRegistrations } from '@/features/registrations/public.js'
import { canRegisterForEvent, usePublicEvents } from '../public.js'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const { isRegistered } = useRegistrations()
const { loadEvent } = usePublicEvents()
const event = ref(null)
const loading = ref(true)
const error = ref('')
const registered = computed(() => Boolean(event.value) && isAuthenticated.value && isRegistered(event.value.id))
const registrationOpen = computed(() => canRegisterForEvent(event.value))
const backTarget = computed(() => {
  const origin = typeof route.query.from === 'string' ? route.query.from : ''
  if (origin === '/' || origin.startsWith('/my-registrations') || /^\/events(?:\?|$)/.test(origin)) return origin
  return '/events'
})
const backLabel = computed(() => {
  if (backTarget.value === '/') return 'Back to Home'
  if (backTarget.value.startsWith('/my-registrations')) return 'Back to My Registrations'
  return 'Back to Events'
})
const registrationMessage = computed(() => {
  if (event.value.status === 'upcoming') return 'Registration has not opened yet. Please check back soon.'
  if (event.value.status === 'closed') return 'Registration is closed for this event.'
  if (!isAuthenticated.value) return 'Please log in or sign up before registering for this event.'
  if (registered.value) return 'You are registered for this event.'
  return 'Reserve your place before registration closes.'
})
const registrationButtonLabel = computed(() => {
  if (event.value.status === 'upcoming') return 'Coming Soon'
  if (event.value.status === 'closed') return 'Registration Closed'
  if (!isAuthenticated.value) return 'Log In / Sign Up'
  return registered.value ? 'Registered' : 'Register Now'
})

function formatPrice(price) {
  if (!price) return 'Free'
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: event.value?.currency || 'THB' }).format(price)
}

function handleRegistration() {
  if (!registrationOpen.value || registered.value) return
  const registrationTarget = { path: `/events/${event.value.id}/register`, query: { from: backTarget.value } }

  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: router.resolve(registrationTarget).fullPath } })
    return
  }

  router.push(registrationTarget)
}

async function fetchEvent(slug) {
  loading.value = true
  error.value = ''
  event.value = null
  try {
    event.value = await loadEvent(slug)
  } catch (cause) {
    error.value = cause?.status === 404
      ? 'This event is unavailable or has not been published.'
      : (cause?.message || 'Unable to load this event. Please try again.')
  } finally {
    loading.value = false
  }
}

watch(() => String(route.params.slug || ''), fetchEvent, { immediate: true })
</script>

<template>
  <div class="detail-page">
    <PublicHeader />
    <main class="detail-shell">
      <div class="detail-breadcrumb"><RouterLink :to="backTarget">&larr; {{ backLabel }}</RouterLink><template v-if="event"><span>&bull;</span><span>{{ event.categoryName }}</span></template></div>

      <div v-if="loading" class="detail-state" aria-live="polite"><RefreshCw :size="30" class="detail-state__spinner" /><h1>Loading event</h1><p>Fetching the latest event information.</p></div>
      <div v-else-if="error" class="detail-state" role="alert"><CalendarClock :size="32" /><h1>Event unavailable</h1><p>{{ error }}</p><button type="button" @click="fetchEvent(String(route.params.slug || ''))">Try again</button></div>
      <div v-else-if="event" class="detail-layout">
        <div class="detail-content">
          <div class="detail-image">
            <img :src="event.image" :alt="event.title" />
            <span>{{ event.categoryName }}</span>
          </div>

          <section class="detail-copy">
            <h2>About This Event</h2>
            <p v-if="event.description">{{ event.description }}</p>
            <p v-else-if="event.summary">{{ event.summary }}</p>
            <p v-else>More information will be announced by the event organizer.</p>
            <div class="detail-highlights">
              <div><CalendarClock :size="20" /><span><strong>Registration period</strong><small>{{ event.registrationStartAt ? new Date(event.registrationStartAt).toLocaleString() : 'To be announced' }} – {{ event.registrationEndAt ? new Date(event.registrationEndAt).toLocaleString() : 'To be announced' }}</small></span></div>
              <div><ShieldCheck :size="20" /><span><strong>Eligibility</strong><small>{{ event.eligibility || 'Open to eligible registered users.' }}</small></span></div>
            </div>
          </section>
          <section v-if="event.rules" class="detail-copy"><h2>Rules &amp; Information</h2><p>{{ event.rules }}</p></section>
        </div>

        <aside class="detail-panel">
          <h1>{{ event.title }}</h1>
          <span class="detail-panel__category">{{ event.categoryName }}</span>
          <dl>
            <div><dt><CalendarDays :size="19" /></dt><dd><strong>{{ event.date }}</strong><span>{{ event.time }}</span></dd></div>
            <div><dt><MapPin :size="19" /></dt><dd><strong>{{ event.location }}</strong><span v-if="event.address">{{ event.address }}</span></dd></div>
          </dl>
          <div v-if="event.status === 'upcoming'" class="registration-state upcoming"><CalendarClock :size="20" /><span><strong>Registration opens soon</strong><small>The opening date will be announced.</small></span></div>
          <div v-else-if="event.status === 'closed'" class="registration-state closed"><LockKeyhole :size="20" /><span><strong>Registration closed</strong><small>This event is no longer accepting registrations.</small></span></div>
          <div v-else class="registration-state open"><CalendarClock :size="20" /><span><strong>Registration is open</strong><small>Reserve your place before registration closes.</small></span></div>
          <div class="detail-price"><span>Standard Pass</span><strong>{{ formatPrice(event.price) }}</strong></div>
          <p>{{ registrationMessage }}</p>
          <button class="detail-register" type="button" :disabled="registered || !registrationOpen" @click="handleRegistration">{{ registrationButtonLabel }}</button>
          <small class="detail-closes">{{ event.status === 'upcoming' ? 'Registration has not opened yet' : event.status === 'closed' ? 'Registration is no longer available' : `Registration closes ${new Date(event.registrationEndAt).toLocaleString()}` }}</small>
          <div v-if="event.contactEmail" class="organizer"><span>@</span><p>Event contact<strong>{{ event.contactEmail }}</strong></p></div>
        </aside>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.detail-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; }
.detail-page main { flex: 1; }
.detail-shell { width: min(100% - 48px, 1180px); margin-inline: auto; padding-block: 34px 78px; }
.detail-breadcrumb { display: flex; margin-bottom: 24px; align-items: center; gap: 9px; color: var(--neutral-600); font-size: .8125rem; }
.detail-breadcrumb a { color: #28314a; text-decoration: none; }
.detail-layout { display: grid; grid-template-columns: minmax(0, 2.1fr) minmax(300px, 1fr); gap: 28px; align-items: start; }
.detail-state { display: grid; min-height: 460px; padding: 42px 20px; place-items: center; align-content: center; gap: 8px; color: var(--neutral-600); background: #fafaff; border: 1px dashed var(--neutral-300); border-radius: 8px; text-align: center; }
.detail-state h1, .detail-state p { margin: 0; }
.detail-state h1 { color: #20263a; font-size: 1.45rem; }
.detail-state button { margin-top: 8px; padding: 10px 18px; color: #fff; background: #2455db; border-radius: 6px; cursor: pointer; }
.detail-state__spinner { animation: detail-spin .9s linear infinite; }
@keyframes detail-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .detail-state__spinner { animation-duration: 1.8s; } }
.detail-image { position: relative; overflow: hidden; aspect-ratio: 1.95; background: var(--brand-soft); border-radius: 8px; }
.detail-image img { width: 100%; height: 100%; display: block; object-fit: cover; }
.detail-image > span { position: absolute; top: 16px; left: 16px; padding: 5px 11px; color: #2455db; background: var(--neutral-0); border-radius: 4px; font-size: .6875rem; font-weight: 600; text-transform: uppercase; }
.detail-tabs { display: flex; margin-top: 20px; gap: 28px; border-bottom: 1px solid var(--neutral-300); }
.detail-tabs button { padding: 0 0 10px; color: #4d5263; background: transparent; border-bottom: 3px solid transparent; cursor: pointer; text-transform: capitalize; }
.detail-tabs button.active { color: #174bd1; border-bottom-color: #174bd1; font-weight: 600; }
.detail-copy { padding-top: 22px; }
.detail-copy h2 { margin: 0 0 14px; font-size: 1.25rem; }
.detail-copy p { margin: 0 0 14px; color: #565a69; font-size: .9rem; }
.detail-highlights { display: grid; margin-top: 22px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.detail-highlights > div { display: flex; min-height: 74px; padding: 14px; gap: 10px; color: #2455db; background: #f2f4ff; border: 1px solid #cad2f5; border-radius: 6px; }
.detail-highlights span { display: flex; color: #20263a; flex-direction: column; }
.detail-highlights strong { font-size: .8125rem; }
.detail-highlights small { margin-top: 3px; color: var(--neutral-600); font-size: .7rem; }
.detail-panel { padding: 28px 24px; border: 1px solid var(--neutral-300); border-radius: 8px; box-shadow: 0 3px 10px rgb(24 24 27 / 10%); }
.detail-panel h1 { margin: 0 0 8px; font-size: 1.85rem; line-height: 1.12; letter-spacing: 0; }
.detail-panel__category { display: inline-block; padding: 4px 8px; color: #174bd1; background: #e8edff; border-radius: 3px; font-size: .65rem; font-weight: 600; text-transform: uppercase; }
.detail-panel dl { display: grid; margin: 24px 0; gap: 17px; }
.detail-panel dl > div { display: grid; grid-template-columns: 22px 1fr; gap: 8px; }
.detail-panel dt { color: #4d5263; }
.detail-panel dd { display: flex; margin: 0; flex-direction: column; font-size: .78rem; }
.detail-panel dd span { color: var(--neutral-600); }
.detail-panel dd a { margin-top: 4px; color: #174bd1; font-weight: 500; text-decoration: none; }
.availability { padding-block: 18px; border-block: 1px solid var(--neutral-300); }
.availability > span { display: flex; justify-content: space-between; font-size: .73rem; }
.availability > div { height: 7px; margin-block: 8px; overflow: hidden; background: var(--neutral-200); border-radius: 4px; }
.availability i { display: block; height: 100%; background: #2455db; }
.availability small { color: #c92839; }
.registration-state { display: flex; margin-top: 18px; padding: 14px; align-items: flex-start; gap: 10px; border-block: 1px solid var(--neutral-300); }
.registration-state > svg { flex: 0 0 auto; }
.registration-state span { display: flex; flex-direction: column; }
.registration-state strong { font-size: .78rem; }
.registration-state small { margin-top: 2px; color: var(--neutral-600); font-size: .7rem; }
.registration-state.upcoming { color: #7c5707; background: #fff9e8; }
.registration-state.closed { color: #8c3540; background: #fff3f4; }
.registration-state.open { color: #176a3f; background: #f0fbf5; }
.detail-price { display: flex; margin-top: 20px; justify-content: space-between; }
.detail-price strong { font-size: 1.25rem; }
.detail-panel > p { color: var(--neutral-600); font-size: .74rem; }
.detail-register { display: grid; width: 100%; height: 44px; place-items: center; color: var(--neutral-0); background: #1454d8; border-radius: 6px; cursor: pointer; font-size: .8125rem; text-decoration: none; }
.detail-register:disabled { color: #686d79; background: #e8e9ed; cursor: not-allowed; }
.detail-closes { display: block; margin-top: 13px; color: var(--neutral-600); text-align: center; }
.organizer { display: flex; margin-top: 20px; padding-top: 18px; align-items: center; gap: 10px; border-top: 1px solid var(--neutral-300); }
.organizer > span { display: grid; width: 38px; height: 38px; place-items: center; color: #2455db; background: #e8edff; border-radius: 50%; font-weight: 600; }
.organizer p { display: flex; margin: 0; color: var(--neutral-600); flex-direction: column; font-size: .7rem; }
.organizer strong { color: #20263a; font-size: .8rem; }
@media (max-width: 800px) { .detail-layout { grid-template-columns: 1fr; } .detail-panel { grid-row: 1; } }
@media (max-width: 560px) { .detail-shell { width: min(100% - 32px, 1180px); padding-block: 24px 56px; } .detail-image { aspect-ratio: 1.35; } .detail-panel { padding: 22px 18px; } .detail-panel h1 { font-size: 1.65rem; } .detail-highlights { grid-template-columns: 1fr; } }
</style>
