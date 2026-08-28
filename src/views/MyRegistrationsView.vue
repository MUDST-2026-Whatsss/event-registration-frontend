<script setup>
import { AlertTriangle, CalendarDays, CalendarX2, Eye, MapPin, QrCode, RotateCcw, Search, TicketCheck, X } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import AppFooter from '../components/AppFooter.vue'
import AppToast from '../components/AppToast.vue'
import PublicHeader from '../components/PublicHeader.vue'
import { useRegistrations } from '../composables/useRegistrations.js'
import { eventGroups } from '../data/events.js'

const searchQuery = ref('')
const route = useRoute()
const activeFilter = ref('upcoming')
const { registrations, register, cancel } = useRegistrations()
const pendingCancellation = ref(null)
const cancellationToast = ref(null)
const cancelDialog = ref(null)
const qrDialog = ref(null)
const qrEvent = ref(null)
const qrDataUrl = ref('')
const qrError = ref(false)
const allEvents = eventGroups.flatMap((group) => group.events)
const filters = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
]

const registeredEvents = computed(() => registrations.value.map((registration) => {
  const event = allEvents.find((item) => item.id === registration.eventId)
  return event ? { ...event, registrationStatus: registration.status, registeredAt: registration.registeredAt } : null
}).filter(Boolean))

const visibleEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return registeredEvents.value.filter((event) => {
    const isPast = event.id === 4
    const matchesFilter = activeFilter.value === 'cancelled'
      ? event.registrationStatus === 'cancelled'
      : event.registrationStatus === 'registered' && (activeFilter.value === 'past' ? isPast : !isPast)
    return matchesFilter && (!query || `${event.title} ${event.location}`.toLowerCase().includes(query))
  })
})

async function requestCancellation(event) {
  pendingCancellation.value = event
  await nextTick()
  cancelDialog.value?.focus()
}

function closeCancellation() {
  pendingCancellation.value = null
}

function confirmCancellation() {
  if (!pendingCancellation.value) return
  const event = pendingCancellation.value
  cancel(event.id)
  cancellationToast.value = { id: event.id, title: event.title }
  closeCancellation()
}

function undoCancellation() {
  if (!cancellationToast.value) return
  register(cancellationToast.value.id)
  cancellationToast.value = null
}

function registrationId(event) {
  return `EVT-2026-${String(event.id).padStart(4, '0')}`
}

async function openQrCode(event) {
  qrEvent.value = event
  qrDataUrl.value = ''
  qrError.value = false

  try {
    qrDataUrl.value = await QRCode.toDataURL(JSON.stringify({
      type: 'eventsss-check-in',
      registrationId: registrationId(event),
      eventId: event.id,
    }), {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#18181B', light: '#FFFFFF' },
    })
  } catch {
    qrError.value = true
  }

  await nextTick()
  qrDialog.value?.focus()
}

function closeQrCode() {
  qrEvent.value = null
  qrDataUrl.value = ''
  qrError.value = false
}

function handleKeydown(event) {
  if (event.key !== 'Escape') return
  if (qrEvent.value) closeQrCode()
  else if (pendingCancellation.value) closeCancellation()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="registrations-page">
    <PublicHeader />
    <main class="registrations-shell">
      <div class="registrations-heading">
        <div><p>My account</p><h1>My Registrations</h1><span>Manage your upcoming and previous event registrations.</span></div>
        <div class="registrations-summary"><TicketCheck :size="22" /><strong>{{ registeredEvents.filter((item) => item.registrationStatus === 'registered').length }}</strong><span>Active registrations</span></div>
      </div>

      <div class="registrations-toolbar">
        <div class="registration-tabs" role="tablist" aria-label="Registration status">
          <button v-for="filter in filters" :key="filter.value" type="button" :class="{ active: activeFilter === filter.value }" @click="activeFilter = filter.value">{{ filter.label }}</button>
        </div>
        <label class="registrations-search">
          <Search :size="18" aria-hidden="true" />
          <span class="sr-only">Search registrations</span>
          <input v-model="searchQuery" type="search" placeholder="Search your registrations..." />
        </label>
      </div>

      <div v-if="visibleEvents.length" class="registration-list">
        <article v-for="event in visibleEvents" :key="event.id" class="registration-card">
          <img :src="event.image" :alt="event.title" />
          <div class="registration-card__content">
            <span class="registration-card__status" :class="{ cancelled: event.registrationStatus === 'cancelled' }">{{ event.registrationStatus }}</span>
            <h2>{{ event.title }}</h2>
            <p><CalendarDays :size="16" />{{ event.date }}</p>
            <p><MapPin :size="16" />{{ event.location }}</p>
            <small>Registration ID: {{ registrationId(event) }}</small>
          </div>
          <div class="registration-card__actions">
            <RouterLink :to="{ path: `/events/${event.id}`, query: { from: route.fullPath } }"><Eye :size="17" aria-hidden="true" />View</RouterLink>
            <button v-if="event.registrationStatus === 'registered'" class="qr" type="button" @click="openQrCode(event)"><QrCode :size="17" aria-hidden="true" />QR Code</button>
            <button v-if="event.registrationStatus === 'registered' && event.id !== 4" class="cancel" type="button" @click="requestCancellation(event)"><CalendarX2 :size="17" aria-hidden="true" />Cancel</button>
          </div>
        </article>
      </div>

      <div v-else class="registrations-empty">
        <Search :size="28" /><h2>No registrations found</h2><p>There are no events in this category.</p><RouterLink to="/events">Browse events</RouterLink>
      </div>
    </main>
    <AppFooter />

    <div v-if="pendingCancellation" class="cancel-backdrop" @click.self="closeCancellation">
      <section ref="cancelDialog" class="cancel-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title" aria-describedby="cancel-description" tabindex="-1">
        <button class="cancel-dialog__close" type="button" aria-label="Close" title="Close" @click="closeCancellation"><X :size="20" /></button>
        <div class="cancel-dialog__icon"><AlertTriangle :size="27" /></div>
        <h2 id="cancel-title">Cancel this registration?</h2>
        <p id="cancel-description">Your reserved place for <strong>{{ pendingCancellation.title }}</strong> will be released. You can register again later if spots remain.</p>
        <div class="cancel-dialog__event"><CalendarDays :size="18" /><span><strong>{{ pendingCancellation.title }}</strong><small>{{ pendingCancellation.date }}</small></span></div>
        <div class="cancel-dialog__actions">
          <button type="button" autofocus @click="closeCancellation">Keep registration</button>
          <button class="danger" type="button" @click="confirmCancellation">Cancel registration</button>
        </div>
      </section>
    </div>

    <div v-if="qrEvent" class="qr-backdrop" @click.self="closeQrCode">
      <section ref="qrDialog" class="qr-dialog" role="dialog" aria-modal="true" aria-labelledby="qr-title" tabindex="-1">
        <button class="qr-dialog__close" type="button" aria-label="Close QR code" title="Close" @click="closeQrCode"><X :size="20" /></button>
        <div class="qr-dialog__heading"><span><QrCode :size="24" /></span><div><p>Event check-in</p><h2 id="qr-title">Your QR ticket</h2></div></div>
        <div class="qr-dialog__event"><strong>{{ qrEvent.title }}</strong><span><CalendarDays :size="15" />{{ qrEvent.date }}</span><span><MapPin :size="15" />{{ qrEvent.location }}</span></div>
        <div class="qr-dialog__code">
          <img v-if="qrDataUrl" :src="qrDataUrl" :alt="`Check-in QR code for ${qrEvent.title}`" />
          <p v-else-if="qrError">QR code could not be generated.</p>
          <span v-else>Generating QR code...</span>
        </div>
        <div class="qr-dialog__registration"><span>Registration ID</span><strong>{{ registrationId(qrEvent) }}</strong></div>
        <p class="qr-dialog__note">Present this QR code at the event check-in desk.</p>
      </section>
    </div>

    <AppToast v-if="cancellationToast" variant="danger" title="Registration cancelled" :message="cancellationToast.title" @close="cancellationToast = null">
      <template #action><button class="toast-undo" type="button" @click="undoCancellation"><RotateCcw :size="16" />Undo</button></template>
    </AppToast>
  </div>
</template>

<style scoped>
.registrations-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; }
.registrations-page main { flex: 1; }
.registrations-shell { width: min(100% - 48px, 1060px); margin-inline: auto; padding-block: 54px 100px; }
.registrations-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
.registrations-heading p { margin: 0 0 5px; color: #2455db; font-size: .75rem; font-weight: 600; text-transform: uppercase; }
.registrations-heading h1 { margin: 0; font-size: 2.25rem; letter-spacing: 0; }
.registrations-heading > div > span { color: var(--neutral-600); }
.registrations-summary { display: grid; min-width: 220px; padding: 17px 20px; grid-template-columns: 34px 1fr; color: #2455db; background: #f2f4ff; border: 1px solid #d5daf0; border-radius: 6px; }
.registrations-summary strong { font-size: 1.35rem; line-height: 1; }
.registrations-summary span { grid-column: 2; color: var(--neutral-600); font-size: .75rem; }
.registrations-toolbar { display: flex; min-height: 58px; margin: 42px 0 24px; align-items: flex-end; justify-content: space-between; gap: 24px; border-bottom: 1px solid var(--neutral-300); }
.registration-tabs { display: flex; align-self: stretch; align-items: flex-end; gap: 28px; }
.registration-tabs button { padding: 0 2px 11px; color: var(--neutral-600); background: transparent; border-bottom: 3px solid transparent; cursor: pointer; }
.registration-tabs button.active { color: #2455db; border-bottom-color: #2455db; font-weight: 600; }
.registrations-search { display: flex; width: min(100%, 360px); height: 40px; margin-bottom: 9px; padding-inline: 13px; align-items: center; gap: 9px; color: var(--neutral-600); background: #fafaff; border: 1px solid #cfd2df; border-radius: 6px; }
.registrations-search:focus-within { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.registrations-search input { width: 100%; min-width: 0; padding: 0; color: var(--neutral-950); background: transparent; border: 0; outline: 0; font-size: .8125rem; }
.registration-list { display: grid; gap: 16px; }
.registration-card { display: grid; min-height: 180px; overflow: hidden; grid-template-columns: 240px minmax(0, 1fr) 170px; background: var(--neutral-0); border: 1px solid var(--neutral-300); border-radius: 6px; box-shadow: 0 3px 10px rgb(24 24 27 / 8%); }
.registration-card > img { width: 100%; height: 100%; object-fit: cover; }
.registration-card__content { padding: 20px 22px; }
.registration-card__status { display: inline-flex; padding: 3px 8px; color: #176a3f; background: #dff7e9; border-radius: 3px; font-size: .65rem; font-weight: 600; text-transform: uppercase; }
.registration-card__status.cancelled { color: #9a3540; background: #fde3e5; }
.registration-card h2 { margin: 8px 0 9px; font-size: 1.15rem; }
.registration-card p { display: flex; margin: 4px 0; align-items: center; gap: 7px; color: var(--neutral-600); font-size: .78rem; }
.registration-card small { display: block; margin-top: 10px; color: #8a8e99; }
.registration-card__actions { display: flex; padding: 20px; align-items: stretch; justify-content: center; flex-direction: column; gap: 9px; border-left: 1px solid var(--neutral-200); }
.registration-card__actions a, .registration-card__actions button, .registrations-empty a { display: inline-flex; min-height: 39px; padding-inline: 12px; align-items: center; justify-content: center; gap: 6px; border-radius: 5px; font-size: .75rem; font-weight: 500; text-decoration: none; }
.registration-card__actions a, .registrations-empty a { color: var(--neutral-0); background: #2455db; }
.registration-card__actions button { color: #33405f; background: var(--neutral-0); border: 1px solid #cbd0df; cursor: pointer; }
.registration-card__actions button.qr { color: #2455db; border-color: #b9c7f5; }
.registration-card__actions button.cancel { color: #ba3f49; border-color: #efb9bd; }
.registration-card__actions button:hover { background: #f7f8fc; }
.registration-card__actions svg { flex: 0 0 auto; }
.registrations-empty { display: grid; min-height: 300px; padding: 48px 20px; place-items: center; align-content: center; color: var(--neutral-600); background: #fafaff; border: 1px dashed var(--neutral-300); border-radius: 6px; text-align: center; }
.registrations-empty h2 { margin: 12px 0 2px; color: #20263a; }
.registrations-empty p { margin: 0 0 18px; }
.registrations-empty a { min-width: 120px; }
.cancel-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 20px; place-items: center; background: rgb(24 24 27 / 56%); backdrop-filter: blur(5px); }
.cancel-dialog { position: relative; width: min(100%, 460px); padding: 32px; background: var(--neutral-0); border-radius: 8px; box-shadow: 0 26px 70px rgb(24 24 27 / 30%); outline: 0; }
.cancel-dialog__close { position: absolute; top: 14px; right: 14px; display: grid; width: 36px; height: 36px; place-items: center; color: var(--neutral-600); background: transparent; border-radius: 50%; cursor: pointer; }
.cancel-dialog__close:hover { background: #f4f5f8; }
.cancel-dialog__icon { display: grid; width: 52px; height: 52px; place-items: center; color: #b93643; background: #fde7e9; border-radius: 50%; box-shadow: 0 0 0 7px #fff4f5; }
.cancel-dialog h2 { margin: 22px 0 7px; font-size: 1.55rem; letter-spacing: 0; }
.cancel-dialog > p { margin: 0; color: var(--neutral-600); font-size: .85rem; }
.cancel-dialog__event { display: flex; margin-top: 22px; padding: 14px 16px; align-items: center; gap: 10px; color: #526078; background: #f7f8fc; border: 1px solid #e0e2ea; border-radius: 6px; }
.cancel-dialog__event span { display: flex; color: #20263a; flex-direction: column; font-size: .8rem; }
.cancel-dialog__event small { color: var(--neutral-600); }
.cancel-dialog__actions { display: grid; margin-top: 24px; grid-template-columns: 1fr 1fr; gap: 10px; }
.cancel-dialog__actions button { min-height: 44px; color: #33405f; background: var(--neutral-0); border: 1px solid #cbd0df; border-radius: 5px; cursor: pointer; font-size: .76rem; font-weight: 500; }
.cancel-dialog__actions button:hover { background: #f7f8fc; }
.cancel-dialog__actions button.danger { color: var(--neutral-0); background: #c84250; border-color: #c84250; }
.cancel-dialog__actions button.danger:hover { background: #a92e3b; }
.qr-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 20px; place-items: center; background: rgb(24 24 27 / 56%); backdrop-filter: blur(5px); }
.qr-dialog { position: relative; width: min(100%, 440px); padding: 30px; background: var(--neutral-0); border-radius: 8px; box-shadow: 0 26px 70px rgb(24 24 27 / 30%); outline: 0; }
.qr-dialog__close { position: absolute; top: 13px; right: 13px; display: grid; width: 36px; height: 36px; place-items: center; color: var(--neutral-600); background: transparent; border-radius: 50%; cursor: pointer; }
.qr-dialog__close:hover { background: #f4f5f8; }
.qr-dialog__heading { display: flex; padding-right: 32px; align-items: center; gap: 12px; }
.qr-dialog__heading > span { display: grid; width: 48px; height: 48px; flex: 0 0 48px; place-items: center; color: #2455db; background: #eef1ff; border-radius: 50%; }
.qr-dialog__heading p { margin: 0; color: #2455db; font-size: .67rem; font-weight: 600; text-transform: uppercase; }
.qr-dialog__heading h2 { margin: 1px 0 0; font-size: 1.5rem; letter-spacing: 0; }
.qr-dialog__event { display: flex; margin-top: 22px; padding: 14px 16px; flex-direction: column; gap: 5px; background: #f7f8fc; border: 1px solid #e0e2ea; border-radius: 6px; }
.qr-dialog__event > span { display: flex; align-items: center; gap: 6px; color: var(--neutral-600); font-size: .73rem; }
.qr-dialog__code { display: grid; min-height: 252px; margin-top: 18px; place-items: center; color: var(--neutral-600); }
.qr-dialog__code img { display: block; width: min(100%, 252px); aspect-ratio: 1; image-rendering: pixelated; }
.qr-dialog__code p, .qr-dialog__code span { margin: 0; font-size: .78rem; }
.qr-dialog__registration { display: flex; margin-top: 10px; padding: 12px 14px; align-items: center; justify-content: space-between; gap: 16px; background: #f7f8ff; border: 1px solid #dce1f4; border-radius: 5px; }
.qr-dialog__registration span { color: var(--neutral-600); font-size: .72rem; }
.qr-dialog__registration strong { font-size: .8rem; }
.qr-dialog__note { margin: 12px 0 0; color: var(--neutral-600); font-size: .72rem; text-align: center; }
.toast-undo { display: inline-flex; min-height: 34px; padding-inline: 8px; align-items: center; gap: 5px; color: #315bd5; background: transparent; border-radius: 4px; cursor: pointer; font-size: .76rem; font-weight: 600; }
.toast-undo:hover { background: #eef1ff; }
@media (max-width: 760px) { .registrations-heading { align-items: stretch; flex-direction: column; } .registration-summary { min-width: 0; } .registrations-toolbar { padding-top: 14px; align-items: stretch; flex-direction: column; gap: 12px; } .registration-tabs { min-height: 42px; align-self: auto; } .registrations-search { width: 100%; margin-bottom: 12px; } .registration-card { grid-template-columns: 130px minmax(0, 1fr); } .registration-card__actions { grid-column: 1 / -1; flex-direction: row; border-top: 1px solid var(--neutral-200); border-left: 0; } }
@media (max-width: 520px) { .registrations-shell { width: min(100% - 32px, 1060px); padding-block: 36px 64px; } .registrations-heading h1 { font-size: 1.9rem; } .registration-card { grid-template-columns: 1fr; } .registration-card > img { height: 190px; } .registration-card__actions { grid-column: auto; flex-direction: column; } .cancel-dialog, .qr-dialog { padding: 28px 20px 22px; } .cancel-dialog__actions { grid-template-columns: 1fr; } }
</style>
