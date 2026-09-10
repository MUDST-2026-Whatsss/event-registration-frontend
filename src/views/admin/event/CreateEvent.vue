<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/admin/Sidebar.vue'
import PageTopbar from '@/components/super_admin/PageTopbar.vue'
import UserMenu from '@/components/super_admin/UserMenu.vue'
import Icon from '@/components/super_admin/Icon.vue'

// Form Data State
const form = ref({
  title: '',
  description: '',
  category: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  maxParticipants: '',
  deadline: '',
  allowCancel: false,
  showSeats: true,
  rules: '',
  contactEmail: '',
  eligibility: ''
})

const newUser = ref('')
const addedUsers = ref([
  'support@event.com'
])

const handleAddUser = () => {
  if (newUser.value.trim() && !addedUsers.value.includes(newUser.value)) {
    addedUsers.value.push(newUser.value)
    newUser.value = ''
  }
}

const handleRemoveUser = (index) => {
  addedUsers.value.splice(index, 1)
}

const submitForm = () => {
  console.log('Submitting Event for Review:', form.value)
  // TODO: Add API integration here
}

const saveDraft = () => {
  console.log('Saving as Draft:', form.value)
  // TODO: Add API integration here
}
</script>

<template>
  <div class="layout">
    <Sidebar />

    <div class="main">
      <PageTopbar>
        <template #lead>
          <nav class="crumbs">
            <RouterLink to="/admin/all-events">All Events</RouterLink>
            <Icon name="chevron-right" :size="14" />
            <span class="crumb-current">Create New Event</span>
          </nav>
        </template>
        <template #search>
          <div class="sa-search topbar-search">
            <Icon name="search" :size="15" />
            <input class="sa-input" type="search" placeholder="Search events…" aria-label="Search" />
          </div>
        </template>
        <template #actions>
          <UserMenu name="Sarah Jenkins" role="Event Director" />
        </template>
      </PageTopbar>

      <section class="content-scroll">
        <div class="form-container">
          
          <div class="stepper">
            <div class="step active">
              <div class="circle">1</div>
              <span class="label">DRAFT</span>
            </div>
            <div class="line"></div>
            <div class="step">
              <div class="circle">2</div>
              <span class="label">PENDING REVIEW</span>
            </div>
            <div class="line"></div>
            <div class="step">
              <div class="circle">3</div>
              <span class="label">PUBLISHED</span>
            </div>
          </div>

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
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                </select>
              </div>
              <div class="form-group">
                <label>LOCATION <span class="required">*</span></label>
                <input type="text" v-model="form.location" placeholder="Venue or Virtual link" />
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div class="upload-actions">
                  <button class="btn-upload">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Upload Image
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
                <label>REGISTRATION DEADLINE <span class="required">*</span></label>
                <input type="date" v-model="form.deadline" />
              </div>
            </div>

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

          <div class="card form-section">
            <div class="section-header">
              <h2>Add Users</h2>
              <p>Add users to events</p>
            </div>

            <div class="add-user-input">
              <input type="email" v-model="newUser" placeholder="support@event.com" @keyup.enter="handleAddUser" />
              <button class="btn-add" @click="handleAddUser">Add</button>
            </div>

            <div class="user-list" v-if="addedUsers.length > 0">
              <div class="user-item" v-for="(user, index) in addedUsers" :key="index">
                <span>{{ user }}</span>
                </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="$router.push('/all-events')">Cancel</button>
            <div class="right-actions">
              <button class="btn-draft" @click="saveDraft">Save as Draft</button>
              <button class="btn-submit" @click="submitForm">Submit for Review</button>
            </div>
          </div>

        </div>
      </section>
    </div>

    <div class="admin-warning">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" class="mr-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      <span>Super Admin approval required for event changes</span>
    </div>
  </div>
</template>

<style scoped>
/* Layout & Basic Setup */
.layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  position: relative;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Topbar — breadcrumb + search, matching the shared PageTopbar */
.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--sa-text-muted);
}
.crumbs a {
  color: var(--sa-text-secondary);
  text-decoration: none;
}
.crumbs a:hover {
  color: var(--sa-primary-text);
}
.crumb-current {
  font-weight: 600;
  color: var(--sa-text);
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
}

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
  font-size: 14px;
}
.step.active .circle {
  background: #2563eb;
  color: #fff;
}
.step .label {
  font-size: 12px;
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
.section-header h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 4px 0; }
.section-header p { font-size: 14px; color: #64748b; margin: 0; }

/* Form Elements */
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  font-size: 12px;
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
select,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
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
}
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
  font-size: 14px;
  cursor: pointer;
  width: fit-content;
}
.btn-upload:hover { background: #f8fafc; }
.hint { font-size: 12px; color: #94a3b8; margin: 0; }
.mr-2 { margin-right: 8px; }

/* Toggles */
.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
.toggle-text h3 { font-size: 14px; font-weight: 500; color: #0f172a; margin: 0 0 4px 0; }
.toggle-text p { font-size: 13px; color: #64748b; margin: 0; }
.divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }

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
  font-size: 14px;
  cursor: pointer;
}
.btn-add:hover { background: #1d4ed8; }
.user-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
.user-item {
  font-size: 14px;
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
  font-size: 14px;
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
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #92400e;
  width: 200px;
  z-index: 10;
}
.admin-warning svg { flex-shrink: 0; }
</style>