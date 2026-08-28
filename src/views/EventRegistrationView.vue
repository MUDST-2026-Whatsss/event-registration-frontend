<script setup>
import { ArrowRight, CalendarDays, Check, Mail, MapPin, Phone, UserRound, X } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import PublicHeader from '../components/PublicHeader.vue'
import { useRegistrations } from '../composables/useRegistrations.js'
import { canRegisterForEvent, eventGroups } from '../data/events.js'

const PROFILE_KEY = 'eventsss_mock_profile'
const route = useRoute()
const router = useRouter()
const { register } = useRegistrations()
const dialog = ref(null)
const successOpen = ref(false)
const allEvents = eventGroups.flatMap((group) => group.events)
const event = computed(() => allEvents.find((item) => item.id === Number(route.params.id)) ?? allEvents[0])
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

const registrationId = computed(() => `EVT-2026-${String(event.value.id).padStart(4, '0')}`)

async function confirmRegistration() {
  if (!canRegisterForEvent(event.value)) {
    router.replace(`/events/${event.value.id}`)
    return
  }
  register(event.value.id)
  successOpen.value = true
  await nextTick()
  dialog.value?.focus()
}

function closeSuccess() {
  successOpen.value = false
  router.push(detailTarget.value)
}

function handleKeydown(event) {
  if (event.key === 'Escape' && successOpen.value) closeSuccess()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
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
            <div class="event-review__price"><span>Standard Pass</span><strong>Free</strong></div>
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
          <div class="registration-form__summary"><span>Total</span><strong>Free</strong></div>
          <button class="registration-confirm" type="submit"><span>Confirm registration</span><ArrowRight :size="18" /></button>
          <p class="registration-note">No payment is required for this event.</p>
        </form>
      </div>
    </main>
    <AppFooter />

    <div v-if="successOpen" class="success-backdrop" role="presentation">
      <section ref="dialog" class="success-dialog" role="dialog" aria-modal="true" aria-labelledby="success-title" tabindex="-1">
        <button class="success-dialog__close" type="button" aria-label="Close" title="Close" @click="closeSuccess"><X :size="20" /></button>
        <div class="success-dialog__icon"><Check :size="30" stroke-width="2.5" /></div>
        <p class="success-dialog__eyebrow">Registration complete</p>
        <h2 id="success-title">You&rsquo;re registered!</h2>
        <p>Your place for <strong>{{ event.title }}</strong> has been reserved successfully.</p>
        <div class="success-dialog__ticket">
          <span>Registration ID</span><strong>{{ registrationId }}</strong>
          <span>Attendee</span><strong>{{ form.fullName }}</strong>
        </div>
        <div class="success-dialog__actions">
          <RouterLink to="/my-registrations">View my registrations</RouterLink>
          <button type="button" @click="closeSuccess">Back to event</button>
        </div>
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
.registration-confirm { display: flex; width: 100%; height: 48px; margin-top: 20px; align-items: center; justify-content: center; gap: 8px; color: var(--neutral-0); background: var(--gradient-brand); border-radius: 6px; box-shadow: 0 8px 18px rgb(177 151 252 / 25%); cursor: pointer; font-weight: 500; }
.registration-confirm:hover { box-shadow: 0 11px 22px rgb(177 151 252 / 34%); transform: translateY(-1px); }
.registration-note { margin: 10px 0 0; color: #8a8e99; font-size: .7rem; text-align: center; }
.success-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 20px; place-items: center; background: rgb(24 24 27 / 56%); backdrop-filter: blur(5px); }
.success-dialog { position: relative; width: min(100%, 470px); padding: 36px; background: var(--neutral-0); border: 1px solid rgb(255 255 255 / 70%); border-radius: 8px; box-shadow: 0 26px 70px rgb(24 24 27 / 28%); outline: 0; text-align: center; }
.success-dialog__close { position: absolute; top: 14px; right: 14px; display: grid; width: 36px; height: 36px; place-items: center; color: var(--neutral-600); background: transparent; border-radius: 50%; cursor: pointer; }
.success-dialog__close:hover { background: #f4f5f8; }
.success-dialog__icon { display: grid; width: 64px; height: 64px; margin-inline: auto; place-items: center; color: #176a3f; background: #dff7e9; border-radius: 50%; box-shadow: 0 0 0 8px #f0fbf5; }
.success-dialog__eyebrow { margin: 22px 0 3px !important; color: #176a3f !important; font-size: .7rem !important; font-weight: 600; text-transform: uppercase; }
.success-dialog h2 { margin: 0; font-size: 1.8rem; }
.success-dialog > p { margin: 9px auto 0; color: var(--neutral-600); font-size: .86rem; }
.success-dialog__ticket { display: grid; margin-top: 24px; padding: 16px 18px; grid-template-columns: 1fr auto; gap: 8px 16px; background: #f7f8ff; border: 1px solid #dce1f4; border-radius: 6px; text-align: left; }
.success-dialog__ticket span { color: var(--neutral-600); font-size: .74rem; }
.success-dialog__ticket strong { color: #20263a; font-size: .78rem; text-align: right; }
.success-dialog__actions { display: grid; margin-top: 24px; grid-template-columns: 1fr 1fr; gap: 10px; }
.success-dialog__actions a, .success-dialog__actions button { display: grid; min-height: 44px; padding-inline: 12px; place-items: center; border-radius: 5px; cursor: pointer; font-size: .76rem; font-weight: 500; text-decoration: none; }
.success-dialog__actions a { color: var(--neutral-0); background: #2455db; }
.success-dialog__actions button { color: #33405f; background: var(--neutral-0); border: 1px solid #cbd0df; }
@media (max-width: 760px) { .registration-layout { grid-template-columns: 1fr; } .event-review { display: grid; grid-template-columns: 190px 1fr; } .event-review img { height: 100%; aspect-ratio: auto; } }
@media (max-width: 540px) { .registration-shell { width: min(100% - 32px, 1080px); padding-block: 26px 60px; } .registration-heading h1 { font-size: 1.8rem; } .event-review { display: block; } .event-review img { height: auto; aspect-ratio: 1.7; } .registration-form { padding: 22px 18px; } .registration-fields { grid-template-columns: 1fr; } .registration-fields label.full { grid-column: auto; } .success-dialog { padding: 32px 20px 24px; } .success-dialog__actions { grid-template-columns: 1fr; } }
</style>
