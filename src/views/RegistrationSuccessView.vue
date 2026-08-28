<script setup>
import { CalendarDays, Check, MapPin, ReceiptText } from '@lucide/vue'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import PublicHeader from '../components/PublicHeader.vue'
import { useRegistrations } from '../composables/useRegistrations.js'
import { eventGroups } from '../data/events.js'

const route = useRoute()
const router = useRouter()
const { registrations } = useRegistrations()
const allEvents = eventGroups.flatMap((group) => group.events)
const event = computed(() => allEvents.find((item) => item.id === Number(route.params.id)))
const registration = computed(() => registrations.value.find((item) => item.eventId === Number(route.params.id)))
const registrationId = computed(() => `EVT-2026-${String(route.params.id).padStart(4, '0')}`)
const transactionId = computed(() => registration.value?.transactionId ?? route.query.transaction ?? 'TXN-PENDING')
const amount = computed(() => registration.value?.amount ?? event.value?.price ?? 0)

onMounted(() => {
  if (!event.value || registration.value?.paymentStatus !== 'paid') {
    router.replace(event.value ? `/events/${event.value.id}` : '/events')
  }
})
</script>

<template>
  <div class="success-page">
    <PublicHeader />
    <main class="success-shell">
      <section v-if="event" class="success-card">
        <div class="success-icon"><Check :size="38" stroke-width="2.5" /></div>
        <p class="success-eyebrow">Payment confirmed</p>
        <h1>Registration successful!</h1>
        <p class="success-lead">Your place has been reserved. A confirmation summary is shown below.</p>

        <div class="success-event">
          <img :src="event.image" :alt="event.title" />
          <div><h2>{{ event.title }}</h2><span><CalendarDays :size="15" />{{ event.date }}</span><span><MapPin :size="15" />{{ event.location }}</span></div>
        </div>

        <dl class="success-details">
          <div><dt>Registration ID</dt><dd>{{ registrationId }}</dd></div>
          <div><dt>Payment status</dt><dd class="paid"><Check :size="14" />Paid</dd></div>
          <div><dt>Payment method</dt><dd>PromptPay</dd></div>
          <div><dt>Amount</dt><dd>฿{{ amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</dd></div>
          <div><dt>Transaction reference</dt><dd>{{ transactionId }}</dd></div>
        </dl>

        <div class="success-notice"><ReceiptText :size="19" /><span><strong>Payment receipt</strong><small>Keep your transaction reference for registration check-in.</small></span></div>

        <div class="success-actions">
          <RouterLink class="primary" to="/my-registrations">View my registrations</RouterLink>
          <RouterLink :to="`/events/${event.id}`">Back to event</RouterLink>
        </div>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.success-page { display: flex; min-height: 100vh; min-height: 100dvh; flex-direction: column; color: #20263a; background: #f7f9fc; }
.success-page main { flex: 1; }
.success-shell { display: grid; width: min(100% - 40px, 680px); margin-inline: auto; padding-block: 58px 80px; place-items: center; }
.success-card { width: 100%; padding: 38px; background: #fff; border: 1px solid var(--neutral-300); border-radius: 12px; box-shadow: 0 18px 50px rgb(24 24 27 / 10%); text-align: center; }
.success-icon { display: grid; width: 76px; height: 76px; margin-inline: auto; place-items: center; color: #176a3f; background: #dff7e9; border-radius: 50%; box-shadow: 0 0 0 10px #f0fbf5; }
.success-eyebrow { margin: 26px 0 3px; color: #176a3f; font-size: .7rem; font-weight: 700; text-transform: uppercase; }
.success-card h1 { margin: 0; font-size: 2rem; }
.success-lead { margin: 8px auto 0; color: var(--neutral-600); font-size: .84rem; }
.success-event { display: grid; margin-top: 27px; padding: 14px; grid-template-columns: 130px 1fr; gap: 15px; background: #f7f8fc; border: 1px solid #e0e3ec; border-radius: 8px; text-align: left; }
.success-event img { width: 100%; height: 100%; min-height: 100px; object-fit: cover; border-radius: 6px; }
.success-event h2 { margin: 2px 0 9px; font-size: 1rem; }
.success-event span { display: flex; margin-top: 5px; align-items: center; gap: 6px; color: var(--neutral-600); font-size: .69rem; }
.success-details { display: grid; margin: 22px 0 0; gap: 0; text-align: left; }
.success-details > div { display: flex; padding: 11px 3px; align-items: center; justify-content: space-between; gap: 18px; border-bottom: 1px solid var(--neutral-200); }
.success-details dt { color: var(--neutral-600); font-size: .74rem; }
.success-details dd { margin: 0; font-size: .76rem; font-weight: 600; text-align: right; }
.success-details .paid { display: inline-flex; align-items: center; gap: 5px; color: #176a3f; }
.success-notice { display: flex; margin-top: 19px; padding: 12px 14px; align-items: flex-start; gap: 9px; color: #854d0e; background: #fff8df; border: 1px solid #f1d587; border-radius: 7px; text-align: left; }
.success-notice span { display: flex; flex-direction: column; }
.success-notice strong { font-size: .72rem; }
.success-notice small { font-size: .66rem; }
.success-actions { display: grid; margin-top: 24px; grid-template-columns: 1fr 1fr; gap: 10px; }
.success-actions a { display: grid; min-height: 44px; padding-inline: 12px; place-items: center; color: #33405f; background: #fff; border: 1px solid #cbd0df; border-radius: 6px; font-size: .76rem; font-weight: 600; text-decoration: none; }
.success-actions a.primary { color: #fff; background: #2455db; border-color: #2455db; }
@media (max-width: 520px) { .success-shell { padding-block: 34px 58px; } .success-card { padding: 30px 18px 22px; } .success-event { grid-template-columns: 1fr; } .success-event img { max-height: 170px; } .success-actions { grid-template-columns: 1fr; } }
</style>
