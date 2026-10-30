<script setup>
import { CalendarDays, Check, Mail, MapPin, QrCode, Search, TicketCheck, UserPlus } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import AppFooter from '@/shared/ui/AppFooter.vue'
import PublicHeader from '@/app/components/PublicHeader.vue'
import { useAuth } from '@/features/auth/public.js'
import { useRegistrations } from '../composables/useRegistrations.js'
import { checkInQrDataUrl } from '../lib/checkInQr.js'

const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  PENDING_PAYMENT: 'Pending payment',
}

const router = useRouter()
const { isAuthenticated } = useAuth()
const { lookupGuestTicket } = useRegistrations()
const form = reactive({ registrationNumber: '', email: '' })
const ticket = ref(null)
const justRegistered = ref(false)
const searching = ref(false)
const error = ref('')
const qrDataUrl = ref('')
const qrError = ref(false)

const statusLabel = computed(() => STATUS_LABELS[ticket.value?.apiStatus] || 'Cancelled')
const showQr = computed(() => ['CONFIRMED', 'CHECKED_IN'].includes(ticket.value?.apiStatus))

async function findTicket() {
  if (searching.value) return
  searching.value = true
  error.value = ''
  try {
    ticket.value = await lookupGuestTicket(form.registrationNumber.trim(), form.email.trim())
    router.replace({ hash: '#ticket' })
    qrDataUrl.value = ''
    qrError.value = false
    if (showQr.value) {
      qrDataUrl.value = await checkInQrDataUrl(ticket.value.registrationNumber, ticket.value.eventId)
        .catch(() => { qrError.value = true; return '' })
    }
  } catch (cause) {
    ticket.value = null
    error.value = cause?.status === 404
      ? 'No ticket matches that registration number and email.'
      : cause?.message || 'Unable to find your ticket.'
  } finally {
    searching.value = false
  }
}

function searchAgain() {
  ticket.value = null
  justRegistered.value = false
  form.registrationNumber = ''
}

// A shown ticket marks the URL with #ticket, so the header's plain /tickets link is a real route
// change and brings back the search form.
onBeforeRouteUpdate((to) => {
  if (!to.hash) searchAgain()
})

// A guest arriving straight from registration brings the number and email in history state.
onMounted(() => {
  const { registrationNumber, email, justRegistered: fresh } = window.history.state ?? {}
  if (!registrationNumber || !email) return
  form.registrationNumber = registrationNumber
  form.email = email
  justRegistered.value = Boolean(fresh)
  findTicket()
})
</script>

<template>
  <div class="ticket-page">
    <PublicHeader />
    <main class="ticket-shell">
      <section v-if="ticket" class="ticket-card" data-test="guest-ticket">
        <template v-if="justRegistered">
          <div class="ticket-success"><Check :size="34" stroke-width="2.5" /></div>
          <p class="ticket-eyebrow">Registration confirmed</p>
          <h1>You're registered!</h1>
          <p class="ticket-lead">Keep this registration number. You can find this ticket again with it and your email.</p>
        </template>
        <template v-else>
          <p class="ticket-eyebrow">Guest ticket</p>
          <h1>Your ticket</h1>
        </template>

        <div class="ticket-event">
          <strong>{{ ticket.event?.title }}</strong>
          <span><CalendarDays :size="15" />{{ ticket.event?.date }}</span>
          <span><MapPin :size="15" />{{ ticket.event?.location }}</span>
        </div>

        <div v-if="showQr" class="ticket-qr">
          <img v-if="qrDataUrl" :src="qrDataUrl" :alt="`Check-in QR code for ${ticket.event?.title}`" />
          <p v-else-if="qrError">QR code could not be generated.</p>
          <span v-else>Generating QR code...</span>
        </div>

        <dl class="ticket-details">
          <div><dt>Registration ID</dt><dd data-test="guest-ticket-number">{{ ticket.registrationNumber }}</dd></div>
          <div><dt>Attendee</dt><dd>{{ ticket.attendeeName }}</dd></div>
          <div><dt>Status</dt><dd data-test="guest-ticket-status">{{ statusLabel }}</dd></div>
        </dl>
        <p v-if="showQr" class="ticket-note"><QrCode :size="15" />Present this QR code or the registration ID at the event check-in desk.</p>

        <div v-if="!isAuthenticated" class="ticket-account">
          <UserPlus :size="19" />
          <span><strong>Keep this ticket in your account</strong><small>Create an account with <b>{{ ticket.attendeeEmail }}</b>. Once the email is verified, this registration appears in My Registrations.</small></span>
          <RouterLink to="/register">Create account</RouterLink>
        </div>

        <div class="ticket-actions">
          <button type="button" @click="searchAgain">Find another ticket</button>
          <RouterLink v-if="ticket.eventId" :to="`/events/${ticket.eventId}`">Back to event</RouterLink>
        </div>
      </section>

      <section v-else class="ticket-card lookup">
        <div class="ticket-lookup-icon"><TicketCheck :size="28" /></div>
        <p class="ticket-eyebrow">Registered as a guest?</p>
        <h1>Find my ticket</h1>
        <p class="ticket-lead">Enter the registration ID shown after you registered and the email you used.</p>
        <form class="ticket-form" @submit.prevent="findTicket">
          <label><span>Registration ID</span><div><TicketCheck :size="17" /><input v-model.trim="form.registrationNumber" data-test="guest-lookup-number" placeholder="REG-XXXXXXXXXX" autocomplete="off" required /></div></label>
          <label><span>Email</span><div><Mail :size="17" /><input v-model.trim="form.email" data-test="guest-lookup-email" type="email" autocomplete="email" required /></div></label>
          <p v-if="error" class="ticket-error" role="alert">{{ error }}</p>
          <button data-test="guest-lookup-submit" type="submit" :disabled="searching"><Search :size="17" />{{ searching ? 'Searching...' : 'Find ticket' }}</button>
        </form>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.ticket-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; background: #f7f9fc; }
.ticket-page main { flex: 1; }
.ticket-shell { display: grid; width: min(100% - 40px, 560px); margin-inline: auto; padding-block: 50px 80px; place-items: center; }
.ticket-card { width: 100%; padding: 34px; background: #fff; border: 1px solid var(--neutral-300); border-radius: 12px; box-shadow: 0 18px 50px rgb(24 24 27 / 10%); text-align: center; }
.ticket-success, .ticket-lookup-icon { display: grid; width: 70px; height: 70px; margin: 0 auto 22px; place-items: center; color: #176a3f; background: #dff7e9; border-radius: 50%; box-shadow: 0 0 0 9px #f0fbf5; }
.ticket-lookup-icon { color: #2455db; background: #e8eefc; box-shadow: 0 0 0 9px #f3f6fe; }
.ticket-eyebrow { margin: 0 0 3px; color: #2455db; font-size: .7rem; font-weight: 700; text-transform: uppercase; }
.ticket-card h1 { margin: 0; font-size: 1.9rem; }
.ticket-lead { margin: 8px auto 0; color: var(--neutral-600); font-size: .82rem; }
.ticket-event { display: flex; margin-top: 22px; padding: 14px; flex-direction: column; gap: 5px; background: #f7f8fc; border: 1px solid #e0e3ec; border-radius: 8px; text-align: left; }
.ticket-event span { display: flex; align-items: center; gap: 6px; color: var(--neutral-600); font-size: .72rem; }
.ticket-qr { display: grid; width: 240px; min-height: 240px; margin: 20px auto 0; padding: 8px; place-items: center; border: 2px solid #d9deeb; border-radius: 9px; }
.ticket-qr img { width: 100%; display: block; image-rendering: pixelated; }
.ticket-qr p, .ticket-qr span { color: var(--neutral-600); font-size: .76rem; }
.ticket-details { display: grid; margin: 18px 0 0; text-align: left; }
.ticket-details > div { display: flex; padding: 10px 3px; align-items: center; justify-content: space-between; gap: 18px; border-bottom: 1px solid var(--neutral-200); }
.ticket-details dt { color: var(--neutral-600); font-size: .74rem; }
.ticket-details dd { margin: 0; font-size: .78rem; font-weight: 600; text-align: right; overflow-wrap: anywhere; }
.ticket-note { display: flex; margin: 12px 0 0; align-items: center; justify-content: center; gap: 6px; color: var(--neutral-600); font-size: .7rem; }
.ticket-account { display: grid; margin-top: 18px; padding: 12px 14px; grid-template-columns: auto 1fr; gap: 4px 10px; color: #1e3a8a; background: #eef3ff; border: 1px solid #c9d6fb; border-radius: 7px; text-align: left; }
.ticket-account span { display: flex; flex-direction: column; gap: 2px; }
.ticket-account strong { font-size: .76rem; }
.ticket-account small { font-size: .7rem; }
.ticket-account a { grid-column: 2; justify-self: start; color: #2455db; font-size: .74rem; font-weight: 600; }
.ticket-actions { display: grid; margin-top: 22px; grid-template-columns: 1fr 1fr; gap: 10px; }
.ticket-actions > * { display: grid; min-height: 44px; padding-inline: 12px; place-items: center; color: #33405f; background: #fff; border: 1px solid #cbd0df; border-radius: 6px; cursor: pointer; font: inherit; font-size: .76rem; font-weight: 600; text-decoration: none; }
.ticket-actions > :only-child { grid-column: 1 / -1; }
.ticket-form { display: grid; margin-top: 24px; gap: 14px; text-align: left; }
.ticket-form label { display: grid; gap: 6px; }
.ticket-form label > span { font-size: .78rem; font-weight: 500; }
.ticket-form label > div { display: flex; height: 46px; padding-inline: 12px; align-items: center; gap: 9px; color: var(--neutral-600); background: #fafaff; border: 1px solid #cbd0df; border-radius: 5px; }
.ticket-form label > div:focus-within { color: #2455db; border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.ticket-form input { width: 100%; min-width: 0; padding: 0; color: #20263a; background: transparent; border: 0; outline: 0; }
.ticket-form button { display: flex; height: 46px; align-items: center; justify-content: center; gap: 8px; color: #fff; background: #2455db; border: 0; border-radius: 6px; cursor: pointer; font: inherit; font-weight: 600; }
.ticket-form button:disabled { opacity: .7; cursor: progress; }
.ticket-error { margin: 0; color: #b42318; font-size: .8rem; }
@media (max-width: 520px) { .ticket-shell { width: min(100% - 32px, 560px); padding-block: 30px 56px; } .ticket-card { padding: 28px 18px 22px; } .ticket-actions { grid-template-columns: 1fr; } }
</style>
