<script setup>
import { ArrowRight, CalendarDays, Check, Clock3, Mail, MapPin, Phone, QrCode, UserRound, X } from '@lucide/vue'
import QRCode from 'qrcode'
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import PublicHeader from '../components/PublicHeader.vue'
import { useRegistrations } from '../composables/useRegistrations.js'
import { canRegisterForEvent, eventGroups } from '../data/events.js'

const PROFILE_KEY = 'eventsss_mock_profile'
const route = useRoute()
const router = useRouter()
const { register } = useRegistrations()
const allEvents = eventGroups.flatMap((group) => group.events)
const event = computed(() => allEvents.find((item) => item.id === Number(route.params.id)) ?? allEvents[0])
const paymentModal = ref(null)
const paymentOpen = ref(false)
const paymentState = ref('idle')
const qrDataUrl = ref('')
const qrError = ref(false)
const timers = []
let paymentRunId = 0
const detailTarget = computed(() => ({
  path: `/events/${event.value.id}`,
  query: typeof route.query.from === 'string' ? { from: route.query.from } : {},
}))

let storedProfile = {}
try { storedProfile = JSON.parse(window.localStorage.getItem(PROFILE_KEY)) ?? {} } catch { storedProfile = {} }

const form = reactive({
  fullName: `${storedProfile.firstName ?? 'Demo'} ${storedProfile.lastName ?? 'User'}`.trim(),
  phone: storedProfile.phone ?? '081-234-5678',
  email: storedProfile.email ?? 'demo@eventsss.com',
  consent: false,
})

function formatPrice(price) {
  return price ? `฿${price.toLocaleString('th-TH')}` : 'Free'
}

function clearPaymentTimers() {
  while (timers.length) window.clearTimeout(timers.pop())
}

function finishPayment(runId) {
  if (runId !== paymentRunId) return
  const transactionId = `TXN-${Date.now().toString().slice(-10)}`

  register(event.value.id, {
    attendee: {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
    },
    amount: event.value.price ?? 0,
    paymentMethod: 'PromptPay',
    paymentStatus: 'paid',
    transactionId,
    paidAt: new Date().toISOString(),
  })
  paymentState.value = 'success'

  timers.push(window.setTimeout(() => {
    router.replace({
      name: 'registration-success',
      params: { id: event.value.id },
      query: { transaction: transactionId },
    })
  }, 1200))
}

async function confirmRegistration() {
  if (!canRegisterForEvent(event.value)) {
    router.replace(`/events/${event.value.id}`)
    return
  }

  clearPaymentTimers()
  const runId = ++paymentRunId
  paymentOpen.value = true
  paymentState.value = 'generating'
  qrDataUrl.value = ''
  qrError.value = false
  await nextTick()
  paymentModal.value?.focus()

  try {
    qrDataUrl.value = await QRCode.toDataURL(JSON.stringify({
      type: 'eventsss-promptpay',
      eventId: event.value.id,
      amount: event.value.price ?? 0,
      reference: `PAY-${event.value.id}-${Date.now()}`,
    }), {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#183B67', light: '#FFFFFF' },
    })
  } catch {
    qrError.value = true
  }

  if (runId !== paymentRunId) return
  paymentState.value = 'ready'
  timers.push(window.setTimeout(() => {
    if (runId !== paymentRunId) return
    paymentState.value = 'checking'
    timers.push(window.setTimeout(() => finishPayment(runId), 2500))
  }, 3500))
}

function closePaymentModal() {
  if (!['generating', 'ready'].includes(paymentState.value)) return
  paymentRunId += 1
  clearPaymentTimers()
  paymentOpen.value = false
  paymentState.value = 'idle'
  qrDataUrl.value = ''
  qrError.value = false
}

onBeforeUnmount(clearPaymentTimers)
</script>

<template>
  <div class="registration-page">
    <PublicHeader />
    <main class="registration-shell">
      <div class="registration-breadcrumb"><RouterLink :to="detailTarget">&larr; Back to event details</RouterLink><span>&bull;</span><span>Confirm registration</span></div>

      <div class="registration-heading">
        <p>Registration review</p>
        <h1>Confirm your registration</h1>
        <span>Review the event and attendee information before reserving your place.</span>
      </div>

      <div class="registration-layout">
        <aside class="event-review">
          <img :src="event.image" :alt="event.title" />
          <div class="event-review__body">
            <span>Selected event</span>
            <h2>{{ event.title }}</h2>
            <dl>
              <div><dt><CalendarDays :size="18" /></dt><dd><strong>{{ event.date }}</strong><span>9:00 AM - 5:00 PM</span></dd></div>
              <div><dt><MapPin :size="18" /></dt><dd><strong>{{ event.location }}</strong><span>Mahidol University</span></dd></div>
            </dl>
            <div class="event-review__price"><span>Standard Pass</span><strong>{{ formatPrice(event.price) }}</strong></div>
          </div>
        </aside>

        <form class="registration-form" @submit.prevent="confirmRegistration">
          <div class="registration-form__title"><UserRound :size="22" /><div><h2>Attendee information</h2><p>This information will appear on your registration.</p></div></div>
          <div class="registration-fields">
            <label class="full"><span>Full name</span><div><UserRound :size="17" /><input v-model.trim="form.fullName" autocomplete="name" required /></div></label>
            <label><span>Phone number</span><div><Phone :size="17" /><input v-model.trim="form.phone" type="tel" autocomplete="tel" required /></div></label>
            <label><span>Email</span><div><Mail :size="17" /><input v-model.trim="form.email" type="email" autocomplete="email" required /></div></label>
          </div>
          <label class="registration-consent"><input v-model="form.consent" type="checkbox" required /><span>I confirm that the attendee information is correct and agree to the event terms and privacy policy.</span></label>
          <div class="registration-form__summary"><span>Total</span><strong>{{ formatPrice(event.price) }}</strong></div>
          <button
            class="registration-confirm"
            :class="{ ready: form.consent }"
            type="submit"
            :disabled="paymentOpen || !form.consent"
          >
            <span>{{ form.consent ? 'Confirm registration' : 'Accept the terms to continue' }}</span>
            <Check v-if="form.consent" :size="18" />
            <ArrowRight v-else :size="18" />
          </button>
          <p class="registration-note">The PromptPay QR and payment status will be processed automatically.</p>
        </form>
      </div>
    </main>
    <AppFooter />

    <div v-if="paymentOpen" class="payment-backdrop" @click.self="closePaymentModal">
      <section ref="paymentModal" class="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-title" tabindex="-1">
        <button v-if="paymentState === 'generating' || paymentState === 'ready'" class="payment-dialog__close" type="button" aria-label="Close payment" title="Close" @click="closePaymentModal"><X :size="20" /></button>

        <template v-if="paymentState === 'generating'">
          <div class="payment-progress"><span class="payment-spinner"></span><h2 id="payment-title">Generating payment QR</h2><p>Please wait a moment.</p></div>
        </template>

        <template v-else-if="paymentState === 'ready'">
          <div class="payment-dialog__heading"><span><QrCode :size="23" /></span><div><p>PromptPay</p><h2 id="payment-title">Scan to pay</h2></div></div>
          <div class="payment-qr">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="PromptPay QR code" />
            <p v-else-if="qrError">QR code could not be generated.</p>
          </div>
          <div class="payment-total"><span>Total amount</span><strong>{{ formatPrice(event.price) }}</strong></div>
          <div class="payment-auto"><Clock3 :size="16" /><span>Payment status will be checked automatically.</span></div>
        </template>

        <template v-else-if="paymentState === 'checking'">
          <div class="payment-progress"><span class="payment-spinner"></span><h2 id="payment-title">Checking payment status</h2><p>Verifying transaction information...</p><small>Please do not close this window.</small></div>
        </template>

        <template v-else-if="paymentState === 'success'">
          <div class="payment-progress success"><span><Check :size="34" /></span><h2 id="payment-title">Payment successful</h2><p>Your registration has been confirmed.</p><small>Opening your registration details...</small></div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.registration-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; }
.registration-page main { flex: 1; }
.registration-shell { width: min(100% - 48px, 1080px); margin-inline: auto; padding-block: 34px 84px; }
.registration-breadcrumb { display: flex; align-items: center; gap: 9px; color: var(--neutral-600); font-size: .8rem; }
.registration-breadcrumb a { color: #28314a; text-decoration: none; }
.registration-heading { margin-top: 32px; }
.registration-heading p { margin: 0 0 5px; color: #2455db; font-size: .72rem; font-weight: 600; text-transform: uppercase; }
.registration-heading h1 { margin: 0; font-size: 2.2rem; letter-spacing: 0; }
.registration-heading span { color: var(--neutral-600); }
.registration-layout { display: grid; margin-top: 28px; grid-template-columns: minmax(280px, .85fr) minmax(0, 1.35fr); gap: 24px; align-items: start; }
.event-review, .registration-form { overflow: hidden; background: var(--neutral-0); border: 1px solid var(--neutral-300); border-radius: 8px; box-shadow: 0 8px 24px rgb(24 24 27 / 8%); }
.event-review img { width: 100%; aspect-ratio: 1.7; display: block; object-fit: cover; }
.event-review__body { padding: 24px; }
.event-review__body > span { color: #2455db; font-size: .68rem; font-weight: 600; text-transform: uppercase; }
.event-review h2 { margin: 6px 0 20px; font-size: 1.35rem; line-height: 1.25; }
.event-review dl { display: grid; margin: 0; gap: 16px; }
.event-review dl > div { display: grid; grid-template-columns: 23px 1fr; gap: 8px; }
.event-review dt { color: #526078; }
.event-review dd { display: flex; margin: 0; flex-direction: column; font-size: .78rem; }
.event-review dd span { color: var(--neutral-600); }
.event-review__price { display: flex; margin-top: 22px; padding-top: 18px; align-items: center; justify-content: space-between; border-top: 1px solid var(--neutral-200); }
.event-review__price strong { font-size: 1.2rem; }
.registration-form { padding: 28px; background: linear-gradient(135deg, #fff 40%, #fff6fb); }
.registration-form__title { display: flex; padding-bottom: 20px; align-items: flex-start; gap: 11px; color: #2455db; border-bottom: 1px solid var(--neutral-200); }
.registration-form__title h2 { margin: 0; color: #20263a; font-size: 1.25rem; }
.registration-form__title p { margin: 2px 0 0; color: var(--neutral-600); font-size: .78rem; }
.registration-fields { display: grid; padding-block: 24px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.registration-fields label { display: grid; gap: 6px; }
.registration-fields label.full { grid-column: 1 / -1; }
.registration-fields label > span { font-size: .78rem; font-weight: 500; }
.registration-fields label > div { display: flex; height: 46px; padding-inline: 12px; align-items: center; gap: 9px; color: var(--neutral-600); background: #fafaff; border: 1px solid #cbd0df; border-radius: 5px; }
.registration-fields label > div:focus-within { color: #2455db; border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgb(91 124 250 / 14%); }
.registration-fields input { width: 100%; min-width: 0; padding: 0; color: #20263a; background: transparent; border: 0; outline: 0; }
.registration-consent { display: grid; grid-template-columns: 18px 1fr; gap: 9px; color: var(--neutral-600); cursor: pointer; font-size: .75rem; }
.registration-consent input { width: 17px; height: 17px; margin: 1px 0 0; accent-color: #2455db; }
.registration-form__summary { display: flex; margin-top: 22px; padding-block: 17px; align-items: center; justify-content: space-between; border-block: 1px solid var(--neutral-200); }
.registration-form__summary strong { font-size: 1.15rem; }
.registration-confirm { display: flex; width: 100%; height: 48px; margin-top: 20px; align-items: center; justify-content: center; gap: 8px; color: #9297a5; background: #e5e7ec; border: 1px solid #d9dce4; border-radius: 6px; box-shadow: none; cursor: not-allowed; font-weight: 500; transition: color 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
.registration-confirm.ready { color: var(--neutral-0); background: var(--gradient-brand); border-color: transparent; box-shadow: 0 8px 18px rgb(177 151 252 / 25%); cursor: pointer; }
.registration-confirm.ready:hover { box-shadow: 0 11px 22px rgb(177 151 252 / 34%); transform: translateY(-1px); }
.registration-confirm.ready:active { transform: translateY(0); }
.registration-confirm:disabled { transform: none; }
.registration-note { margin: 10px 0 0; color: #8a8e99; font-size: .7rem; text-align: center; }
.payment-backdrop { position: fixed; z-index: 120; inset: 0; display: grid; padding: 20px; place-items: center; background: rgb(24 24 27 / 60%); backdrop-filter: blur(6px); }
.payment-dialog { position: relative; width: min(100%, 430px); min-height: 510px; padding: 28px; background: #fff; border: 1px solid rgb(255 255 255 / 70%); border-radius: 12px; box-shadow: 0 28px 80px rgb(24 24 27 / 32%); outline: 0; }
.payment-dialog__close { position: absolute; z-index: 1; top: 13px; right: 13px; display: grid; width: 36px; height: 36px; place-items: center; color: var(--neutral-600); background: transparent; border-radius: 50%; cursor: pointer; }
.payment-dialog__close:hover { background: #f2f4f8; }
.payment-dialog__heading { display: flex; padding-right: 38px; align-items: center; gap: 11px; }
.payment-dialog__heading > span { display: grid; width: 46px; height: 46px; place-items: center; color: #fff; background: #183b67; border-radius: 9px; }
.payment-dialog__heading p { margin: 0; color: #2455db; font-size: .67rem; font-weight: 700; text-transform: uppercase; }
.payment-dialog__heading h2 { margin: 1px 0 0; font-size: 1.45rem; }
.payment-qr { display: grid; width: 270px; min-height: 270px; margin: 18px auto 0; padding: 10px; place-items: center; background: #fff; border: 2px solid #d9deeb; border-radius: 9px; }
.payment-qr img { width: 100%; display: block; image-rendering: pixelated; }
.payment-qr p { color: #8c3540; font-size: .76rem; text-align: center; }
.payment-total { display: flex; margin-top: 17px; align-items: center; justify-content: center; gap: 12px; }
.payment-total span { color: var(--neutral-600); font-size: .76rem; }
.payment-total strong { font-size: 1.35rem; }
.payment-auto { display: flex; margin-top: 10px; align-items: center; justify-content: center; gap: 6px; color: var(--neutral-600); font-size: .7rem; }
.payment-progress { display: flex; min-height: 450px; align-items: center; justify-content: center; flex-direction: column; text-align: center; }
.payment-progress h2 { margin: 20px 0 5px; font-size: 1.45rem; }
.payment-progress p { margin: 0; color: var(--neutral-600); font-size: .82rem; }
.payment-progress small { margin-top: 7px; color: #8a8e99; font-size: .7rem; }
.payment-spinner { width: 56px; height: 56px; border: 5px solid #e4e8f5; border-top-color: #2455db; border-radius: 50%; animation: payment-spin .85s linear infinite; }
.payment-progress.success > span { display: grid; width: 70px; height: 70px; place-items: center; color: #176a3f; background: #dff7e9; border-radius: 50%; box-shadow: 0 0 0 9px #f0fbf5; }
@keyframes payment-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .payment-spinner { animation-duration: 1.8s; } }
@media (max-width: 760px) { .registration-layout { grid-template-columns: 1fr; } .event-review { display: grid; grid-template-columns: 190px 1fr; } .event-review img { height: 100%; aspect-ratio: auto; } }
@media (max-width: 540px) { .registration-shell { width: min(100% - 32px, 1080px); padding-block: 26px 60px; } .registration-heading h1 { font-size: 1.8rem; } .event-review { display: block; } .event-review img { height: auto; aspect-ratio: 1.7; } .registration-form { padding: 22px 18px; } .registration-fields { grid-template-columns: 1fr; } .registration-fields label.full { grid-column: auto; } .payment-dialog { min-height: 470px; padding: 22px 18px; } .payment-qr { width: min(100%, 250px); min-height: 250px; } }
</style>
