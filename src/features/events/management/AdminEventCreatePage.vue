<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ConsoleIcon as Icon, PageTopbar, UserMenu } from '@/features/console-shell/public.js'
import { ApiError } from '@/shared/lib/apiClient.js'
import { useToast } from '@/shared/composables/useToast.js'
import {
  createAdminEvent,
  createEventChangeRequest,
  deleteEventImage,
  getAdminEvent,
  listEventChangeRequests,
  listEventCategories,
  submitAdminEvent,
  updateAdminEvent,
  uploadEventImage,
} from '../api/adminEventsApi.js'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const routeEventId = computed(() => route.params.eventId || null)
const eventId = ref(routeEventId.value)
const version = ref(0)
const status = ref('DRAFT')
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const pageError = ref('')
const fieldErrors = ref({})
const imageInput = ref(null)
const imageObjectKey = ref('')
const imageUrl = ref('')
const newlyUploadedImage = ref(false)
const showAdminTip = ref(true)
const changeReason = ref('')
const changeRequests = ref([])

const form = ref({
  title: '', description: '', category: '', locationType: 'ONSITE', location: '', onlineUrl: '',
  date: '', startTime: '', endTime: '', maxParticipants: '', registrationStart: '', deadline: '',
  pricingType: 'free', price: '', currency: 'THB', allowCancel: false, showSeats: true,
  rules: '', contactEmail: '', eligibility: '',
})

const effectivePrice = computed(() =>
  form.value.pricingType === 'free' ? 0 : Number(form.value.price || 0))
const pageTitle = computed(() => eventId.value ? 'Edit Event' : 'Create New Event')
const pendingChangeRequest = computed(() =>
  changeRequests.value.find((request) => request.status === 'PENDING'))
const isPublished = computed(() => status.value === 'PUBLISHED')
const canEdit = computed(() =>
  ['DRAFT', 'REJECTED'].includes(status.value)
  || (isPublished.value && !pendingChangeRequest.value))

function selectPricing(type) {
  form.value.pricingType = type
  if (type === 'free') form.value.price = ''
}

function toInstant(value) {
  return value ? new Date(value).toISOString() : null
}

function eventInstant(time) {
  return form.value.date && time ? toInstant(`${form.value.date}T${time}`) : null
}

function buildPayload() {
  return {
    title: form.value.title.trim(),
    summary: form.value.description.trim().slice(0, 500) || null,
    description: form.value.description.trim() || null,
    eventCategoryId: form.value.category,
    eventType: form.value.pricingType === 'free' ? 'FREE' : 'PAID',
    price: effectivePrice.value,
    currency: form.value.currency,
    refundPolicy: form.value.pricingType === 'paid' ? form.value.rules.trim() || null : null,
    locationType: form.value.locationType,
    locationName: ['ONSITE', 'HYBRID'].includes(form.value.locationType) ? form.value.location.trim() || null : null,
    address: null,
    onlineUrl: ['ONLINE', 'HYBRID'].includes(form.value.locationType) ? form.value.onlineUrl.trim() || null : null,
    imageObjectKey: imageObjectKey.value || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok',
    startAt: eventInstant(form.value.startTime),
    endAt: eventInstant(form.value.endTime),
    registrationStartAt: toInstant(form.value.registrationStart),
    registrationEndAt: toInstant(form.value.deadline),
    cancellationDeadlineAt: form.value.allowCancel ? toInstant(form.value.deadline) : null,
    maximumParticipants: Number(form.value.maxParticipants),
    rules: form.value.rules.trim() || null,
    contactEmail: form.value.contactEmail.trim() || null,
    eligibility: form.value.eligibility.trim() || null,
    allowCancellation: form.value.allowCancel,
    showRemainingSeats: form.value.showSeats,
  }
}

function applyError(error) {
  fieldErrors.value = error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {}
  pageError.value = error instanceof Error ? error.message : 'Unable to save the event.'
}

async function persistDraft() {
  const saved = eventId.value
    ? await updateAdminEvent(eventId.value, version.value, buildPayload())
    : await createAdminEvent(buildPayload())
  eventId.value = saved.eventId
  version.value = saved.version
  status.value = saved.status
  newlyUploadedImage.value = false
  return saved
}

async function saveDraft() {
  saving.value = true
  pageError.value = ''
  fieldErrors.value = {}
  try {
    await persistDraft()
    showToast({ variant: 'success', title: 'Draft saved', message: 'Your event draft is stored securely.' })
    await router.replace(`/admin/events/${eventId.value}/edit`)
  } catch (error) {
    applyError(error)
  } finally {
    saving.value = false
  }
}

async function submitForm() {
  saving.value = true
  pageError.value = ''
  fieldErrors.value = {}
  try {
    await persistDraft()
    const submitted = await submitAdminEvent(eventId.value, version.value)
    version.value = submitted.version
    status.value = submitted.status
    showToast({ variant: 'success', title: 'Submitted for review', message: 'A super admin can now review this event.' })
    await router.push('/admin/all-events')
  } catch (error) {
    applyError(error)
  } finally {
    saving.value = false
  }
}

async function submitChangeRequest() {
  if (!changeReason.value.trim()) {
    pageError.value = 'Please explain why this published event needs to change.'
    return
  }
  saving.value = true
  pageError.value = ''
  fieldErrors.value = {}
  try {
    const created = await createEventChangeRequest(
      eventId.value,
      version.value,
      changeReason.value.trim(),
      buildPayload(),
    )
    changeRequests.value.unshift(created)
    newlyUploadedImage.value = false
    showToast({
      variant: 'success',
      title: 'Change request submitted',
      message: 'The published event remains unchanged until a super admin approves the request.',
    })
    await router.push('/admin/all-events')
  } catch (error) {
    applyError(error)
  } finally {
    saving.value = false
  }
}

async function handleImage(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  uploading.value = true
  pageError.value = ''
  try {
    if (newlyUploadedImage.value && imageObjectKey.value) await deleteEventImage(imageObjectKey.value)
    const uploaded = await uploadEventImage(file)
    imageObjectKey.value = uploaded.objectKey
    imageUrl.value = uploaded.imageUrl
    newlyUploadedImage.value = true
  } catch (error) {
    applyError(error)
  } finally {
    uploading.value = false
  }
}

async function removeImage() {
  if (newlyUploadedImage.value && imageObjectKey.value) {
    try {
      await deleteEventImage(imageObjectKey.value)
    } catch (error) {
      applyError(error)
      return
    }
  }
  imageObjectKey.value = ''
  imageUrl.value = ''
  newlyUploadedImage.value = false
}

function localDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function applyEvent(event) {
  eventId.value = event.eventId
  version.value = event.version
  status.value = event.status
  imageObjectKey.value = event.imageObjectKey || ''
  imageUrl.value = event.imageUrl || ''
  const start = localDateTime(event.startAt)
  const end = localDateTime(event.endAt)
  Object.assign(form.value, {
    title: event.title || '', description: event.description || '',
    category: event.category?.eventCategoryId || '', locationType: event.locationType || 'ONSITE',
    location: event.locationName || '', onlineUrl: event.onlineUrl || '', date: start.slice(0, 10),
    startTime: start.slice(11, 16), endTime: end.slice(11, 16),
    maxParticipants: event.maximumParticipants, registrationStart: localDateTime(event.registrationStartAt),
    deadline: localDateTime(event.registrationEndAt), pricingType: event.eventType === 'PAID' ? 'paid' : 'free',
    price: event.eventType === 'PAID' ? event.price : '', currency: event.currency || 'THB',
    allowCancel: event.allowCancellation, showSeats: event.showRemainingSeats, rules: event.rules || '',
    contactEmail: event.contactEmail || '', eligibility: event.eligibility || '',
  })
}

onMounted(async () => {
  loading.value = true
  try {
    categories.value = await listEventCategories()
    if (routeEventId.value) {
      applyEvent(await getAdminEvent(routeEventId.value))
      changeRequests.value = await listEventChangeRequests(routeEventId.value)
    }
    if (!form.value.registrationStart) form.value.registrationStart = localDateTime(new Date().toISOString())
  } catch (error) {
    applyError(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <PageTopbar>
        <template #lead>
          <nav class="crumbs">
            <RouterLink to="/admin/all-events">All Events</RouterLink>
            <Icon name="chevron-right" :size="14" />
            <span class="crumb-current">{{ pageTitle }}</span>
          </nav>
        </template>
        <template #search>
          <div class="console-search topbar-search">
            <Icon name="search" :size="15" />
            <input class="console-input" type="search" placeholder="Search events…" aria-label="Search" />
          </div>
        </template>
        <template #actions>
          <UserMenu />
        </template>
      </PageTopbar>

      <section class="content-scroll">
        <div class="form-container">
          <div v-if="pageError" class="form-alert" role="alert">
            <strong>{{ pageError }}</strong>
            <ul v-if="Object.keys(fieldErrors).length">
              <li v-for="(message, field) in fieldErrors" :key="field">{{ field }}: {{ message }}</li>
            </ul>
          </div>
          <p v-if="loading" class="loading-message">Loading event data…</p>
          
          <div class="stepper">
            <div class="step" :class="{ active: ['DRAFT', 'REJECTED'].includes(status) }">
              <div class="circle">1</div>
              <span class="label">DRAFT</span>
            </div>
            <div class="line"></div>
            <div class="step" :class="{ active: status === 'PENDING_REVIEW' }">
              <div class="circle">2</div>
              <span class="label">PENDING REVIEW</span>
            </div>
            <div class="line"></div>
            <div class="step" :class="{ active: status === 'PUBLISHED' }">
              <div class="circle">3</div>
              <span class="label">PUBLISHED</span>
            </div>
          </div>

          <div v-if="pendingChangeRequest" class="change-notice">
            A change request is pending review. The published event remains unchanged until it is approved.
          </div>

          <fieldset class="form-fields" :disabled="!canEdit || loading || saving">
          <div class="card form-section">
            <div class="section-header">
              <h2>Basic Information</h2>
              <p>Standard event details and branding</p>
            </div>

            <div class="form-group">
              <label>EVENT TITLE <span class="required">*</span></label>
              <input type="text" v-model="form.title" placeholder="e.g. Annual Tech Leadership Summit" />
            </div>

            <div class="form-group">
              <label>DESCRIPTION <span class="required">*</span></label>
              <textarea v-model="form.description" placeholder="Detailed information about the event..." rows="4"></textarea>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>CATEGORY <span class="required">*</span></label>
                <select v-model="form.category">
                  <option value="" disabled>Select category</option>
                  <option
                    v-for="category in categories"
                    :key="category.eventCategoryId"
                    :value="category.eventCategoryId"
                  >
                    {{ category.nameEn || category.nameTh }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>LOCATION TYPE <span class="required">*</span></label>
                <select v-model="form.locationType">
                  <option value="ONSITE">On site</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div v-if="form.locationType !== 'ONLINE'" class="form-group">
                <label>VENUE <span class="required">*</span></label>
                <input type="text" v-model="form.location" placeholder="Venue name" />
              </div>
              <div v-if="form.locationType !== 'ONSITE'" class="form-group">
                <label>ONLINE URL <span class="required">*</span></label>
                <input type="url" v-model="form.onlineUrl" placeholder="https://…" />
              </div>
            </div>

            <div class="grid-3">
              <div class="form-group">
                <label>EVENT DATE <span class="required">*</span></label>
                <input type="date" v-model="form.date" />
              </div>
              <div class="form-group">
                <label>START TIME <span class="required">*</span></label>
                <input type="time" v-model="form.startTime" />
              </div>
              <div class="form-group">
                <label>END TIME <span class="required">*</span></label>
                <input type="time" v-model="form.endTime" />
              </div>
            </div>

            <div class="form-group">
              <label>EVENT IMAGE</label>
              <div class="image-upload-box">
                <div class="image-placeholder">
                  <img v-if="imageUrl" :src="imageUrl" alt="Event cover preview" class="image-preview" />
                  <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div class="upload-actions">
                  <input
                    ref="imageInput"
                    class="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleImage"
                  />
                  <button type="button" class="btn-upload" :disabled="uploading || !canEdit" @click="imageInput?.click()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    {{ uploading ? 'Uploading…' : imageUrl ? 'Replace image' : 'Upload image' }}
                  </button>
                  <button
                    v-if="imageUrl"
                    type="button"
                    class="btn-remove-image"
                    :disabled="uploading || !canEdit"
                    @click="removeImage"
                  >
                    <Icon name="trash" :size="16" aria-hidden="true" />
                    Remove image
                  </button>
                  <p class="hint">Recommended: 1200x630px, Max size 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card form-section">
            <div class="section-header">
              <h2>Capacity and Registration</h2>
              <p>Control attendee limits and timelines</p>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>MAX PARTICIPANTS <span class="required">*</span></label>
                <input type="number" v-model="form.maxParticipants" placeholder="e.g. 500" />
              </div>
              <div class="form-group">
                <label>REGISTRATION START <span class="required">*</span></label>
                <input type="datetime-local" v-model="form.registrationStart" />
              </div>
              <div class="form-group">
                <label>REGISTRATION DEADLINE <span class="required">*</span></label>
                <input type="datetime-local" v-model="form.deadline" />
              </div>
            </div>

            <hr class="divider" />

            <!-- ราคา: ฟรีคือ 0 — ไม่มีสถานะ "ไม่ระบุราคา" -->
            <div class="form-group">
              <label>PRICING <span class="required">*</span></label>
              <div class="pricing-choice">
                <button
                  type="button"
                  class="pricing-option"
                  :class="{ active: form.pricingType === 'free' }"
                  @click="selectPricing('free')"
                >
                  Free
                </button>
                <button
                  type="button"
                  class="pricing-option"
                  :class="{ active: form.pricingType === 'paid' }"
                  @click="selectPricing('paid')"
                >
                  Paid
                </button>
              </div>
            </div>

            <div
              v-if="form.pricingType === 'paid'"
              class="grid-2"
            >
              <div class="form-group">
                <label>TICKET PRICE <span class="required">*</span></label>
                <div class="price-input">
                  <span class="price-currency">{{ form.currency }}</span>
                  <input
                    v-model="form.price"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 499"
                  >
                </div>
                <small class="field-hint">ผู้เข้าร่วมจะชำระผ่าน PromptPay QR</small>
              </div>
            </div>

            <p
              v-else
              class="field-hint pricing-hint"
            >
              ผู้เข้าร่วมลงทะเบียนได้ทันทีโดยไม่ต้องชำระเงิน (บันทึกเป็นราคา 0)
            </p>

            <div class="toggle-group">
              <div class="toggle-text">
                <h3>Allow registration cancellation</h3>
                <p>Users can cancel their registration before the deadline</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="form.allowCancel">
                <span class="slider round"></span>
              </label>
            </div>

            <hr class="divider" />

            <div class="toggle-group">
              <div class="toggle-text">
                <h3>Show remaining seats</h3>
                <p>Display current availability on the public event page</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="form.showSeats">
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <div class="card form-section">
            <div class="section-header">
              <h2>Rules & Logistics</h2>
              <p>Important requirements and contact info</p>
            </div>

            <div class="form-group">
              <label>EVENT RULES <span class="required">*</span></label>
              <textarea v-model="form.rules" placeholder="Policies, refund info, behavior guidelines..." rows="3"></textarea>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>CONTACT EMAIL</label>
                <input type="email" v-model="form.contactEmail" placeholder="support@event.com" />
              </div>
              <div class="form-group">
                <label>ELIGIBILITY</label>
                <input type="text" v-model="form.eligibility" placeholder="e.g. Registered students only" />
              </div>
            </div>
          </div>

          <div v-if="isPublished" class="card form-section">
            <div class="section-header">
              <h2>Reason for change</h2>
              <p>Published event changes require Super Admin approval.</p>
            </div>
            <div class="form-group">
              <label>CHANGE REASON <span class="required">*</span></label>
              <textarea v-model="changeReason" rows="3" placeholder="Explain what changed and why..."></textarea>
            </div>
          </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="router.push('/admin/all-events')">Cancel</button>
            <div class="right-actions">
              <button v-if="!isPublished" type="button" class="btn-draft" :disabled="saving || loading || !canEdit" @click="saveDraft">
                {{ saving ? 'Saving…' : 'Save as Draft' }}
              </button>
              <button v-if="!isPublished" type="button" class="btn-submit" :disabled="saving || loading || !canEdit" @click="submitForm">
                Submit for Review
              </button>
              <button v-else type="button" class="btn-submit" :disabled="saving || loading || !canEdit" @click="submitChangeRequest">
                {{ saving ? 'Submitting…' : 'Submit Change Request' }}
              </button>
            </div>
          </div>

        </div>
      </section>

  <aside v-if="showAdminTip" class="admin-warning" role="note" aria-label="Approval reminder">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" class="mr-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    <span>Super Admin approval required for event changes</span>
    <button type="button" aria-label="Dismiss approval reminder" @click="showAdminTip = false">
      <Icon name="x" :size="15" aria-hidden="true" />
    </button>
  </aside>
</template>

<style scoped>
/* Topbar — breadcrumb + search, matching the shared PageTopbar */
.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--console-fs-md);
  color: var(--console-text-muted);
}
.crumbs a {
  color: var(--console-text-secondary);
  text-decoration: none;
}
.crumbs a:hover {
  color: var(--console-primary-text);
}
.crumb-current {
  font-weight: 600;
  color: var(--console-text);
}

.topbar-search {
  width: 100%;
  max-width: 420px;
}
.topbar-search input {
  width: 100%;
}

/* Content Area */
.content-scroll {
  flex: 1;
  padding: 32px;
}
.form-container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
}
.form-alert {
  padding: 14px 18px;
  margin-bottom: 18px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
}
.form-alert ul { margin: 8px 0 0; padding-left: 20px; }
.loading-message { color: var(--console-text-muted); }
.change-notice {
  padding: 14px 18px;
  margin-bottom: 18px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
}
.form-fields { min-width: 0; margin: 0; padding: 0; border: 0; }
.form-fields:disabled { opacity: .75; }

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 24px 48px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.step .circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--console-fs-md);
}
.step.active .circle {
  background: #2563eb;
  color: #fff;
}
.step .label {
  font-size: var(--console-fs-sm);
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.5px;
}
.step.active .label {
  color: #2563eb;
}
.line {
  flex: 1;
  height: 2px;
  background: #f1f5f9;
  margin: 0 16px;
  position: relative;
  top: -12px;
}

/* Cards & Sections */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}
.section-header { margin-bottom: 24px; }
.section-header h2 { font-size: var(--console-fs-xl); font-weight: 600; color: #0f172a; margin: 0 0 4px 0; }
.section-header p { font-size: var(--console-fs-md); color: #64748b; margin: 0; }

/* Form Elements */
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  font-size: var(--console-fs-sm);
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.required { color: #ef4444; }

input[type="text"],
input[type="email"],
input[type="number"],
input[type="date"],
input[type="time"],
input[type="url"],
input[type="datetime-local"],
select,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: var(--console-fs-md);
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
input:focus, select:focus, textarea:focus { border-color: #2563eb; }
textarea { resize: vertical; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

/* Image Upload Box */
.image-upload-box {
  display: flex;
  gap: 24px;
  align-items: center;
}
.image-placeholder {
  width: 120px;
  height: 120px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.image-preview { width: 100%; height: 100%; object-fit: cover; }
.upload-actions { display: flex; flex-direction: column; gap: 12px; }
.btn-upload {
  display: inline-flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: var(--console-fs-md);
  cursor: pointer;
  width: fit-content;
}
.btn-upload:hover { background: #f8fafc; }
.btn-remove-image {
  display: inline-flex;
  width: fit-content;
  min-height: 42px;
  padding: 0 16px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #b91c1c;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.btn-remove-image:hover {
  background: #fef2f2;
  border-color: #f87171;
  box-shadow: 0 2px 8px rgb(220 38 38 / 10%);
}
.btn-upload:disabled,
.btn-remove-image:disabled,
.btn-draft:disabled,
.btn-submit:disabled { opacity: .55; cursor: not-allowed; }
.hint { font-size: var(--console-fs-sm); color: #94a3b8; margin: 0; }
.mr-2 { margin-right: 8px; }

/* Toggles */
.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
.toggle-text h3 { font-size: var(--console-fs-md); font-weight: 500; color: #0f172a; margin: 0 0 4px 0; }
.toggle-text p { font-size: var(--console-fs-base); color: #64748b; margin: 0; }
.divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }

/* Pricing: free vs paid */
.pricing-choice {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--console-radius-sm);
  background: var(--console-gray-bg);
}

.pricing-option {
  padding: 7px 20px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--console-text-secondary);
  font-family: inherit;
  font-size: var(--console-fs-base);
  font-weight: 600;
  cursor: pointer;
}

.pricing-option.active {
  background: #fff;
  color: var(--console-primary);
  box-shadow: var(--console-shadow);
}

.price-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-currency {
  flex-shrink: 0;
  padding: 0 10px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--console-border);
  border-radius: var(--console-radius-sm);
  background: var(--console-gray-bg);
  color: var(--console-text-secondary);
  font-size: var(--console-fs-sm);
  font-weight: 600;
}

.field-hint {
  display: block;
  margin-top: 6px;
  color: var(--console-text-muted);
  font-size: var(--console-fs-sm);
}

.pricing-hint {
  margin: 10px 0 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider { background-color: #2563eb; }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

/* Add Users Input */
.add-user-input {
  position: relative;
  display: flex;
}
.add-user-input input { padding-right: 80px; }
.btn-add {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  font-weight: 500;
  font-size: var(--console-fs-md);
  cursor: pointer;
}
.btn-add:hover { background: #1d4ed8; }
.user-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
.user-item {
  font-size: var(--console-fs-md);
  color: #0f172a;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

/* Footer Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 40px 0;
}
.right-actions { display: flex; gap: 12px; }
.btn-cancel {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 500;
  font-size: var(--console-fs-md);
  cursor: pointer;
}
.btn-draft {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}
.btn-submit {
  background: #2563eb;
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}
.btn-draft:hover { background: #f8fafc; }
.btn-submit:hover { background: #1d4ed8; }

/* Admin Warning */
.admin-warning {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--console-fs-base);
  color: #92400e;
  width: min(280px, calc(100vw - 48px));
  box-shadow: 0 12px 28px rgba(146, 64, 14, 0.16);
  z-index: 40;
}
.admin-warning svg { flex-shrink: 0; }
.admin-warning button {
  align-self: flex-start;
  margin: -5px -7px 0 auto;
  padding: 2px 6px;
  color: #92400e;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.admin-warning button:hover { background: rgba(217, 119, 6, 0.12); }

@media (max-width: 768px) {
  .content-scroll {
    padding: 24px 16px 36px;
  }

  .stepper {
    padding: 20px 18px;
  }

  .step .label {
    font-size: var(--console-fs-2xs);
    text-align: center;
  }

  .line {
    margin-inline: 8px;
  }

  .card {
    padding: 24px 20px;
  }

  .grid-3 {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 560px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .image-upload-box {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-actions,
  .right-actions {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .form-actions button,
  .right-actions button {
    justify-content: center;
    width: 100%;
  }

  .admin-warning {
    right: 12px;
    bottom: 12px;
    width: min(280px, calc(100vw - 24px));
  }
}
</style>
