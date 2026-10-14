<script setup>
import { reactive, ref } from 'vue'
import AuthInput from '../components/AuthInput.vue'
import AuthLayout from '../components/AuthLayout.vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { ApiError } from '@/shared/lib/apiClient.js'
import {
  REGISTER_LIMITS,
  normalizePhone,
  validateConfirmPassword as getConfirmPasswordError,
  validateEmail as getEmailError,
  validateName,
  validatePassword as getPasswordError,
  validatePhone as getPhoneError,
} from '../lib/registerValidation.js'

const router = useRouter()
const { register } = useAuth()

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const formStatus = ref('')
const isSubmitting = ref(false)

const validateNameField = (field, label) => {
  errors[field] = validateName(form[field], label)
  return !errors[field]
}

const validatePhone = () => {
  errors.phone = getPhoneError(form.phone)
  return !errors.phone
}

const validateEmail = () => {
  errors.email = getEmailError(form.email)
  return !errors.email
}

const validatePassword = () => {
  errors.password = getPasswordError(form.password)
  return !errors.password
}

const validateConfirmPassword = () => {
  errors.confirmPassword = getConfirmPasswordError(form.confirmPassword, form.password)
  return !errors.confirmPassword
}

const handleSubmit = async () => {
  formStatus.value = ''
  const validationResults = [
    validateNameField('firstName', 'first name'),
    validateNameField('lastName', 'last name'),
    validatePhone(),
    validateEmail(),
    validatePassword(),
    validateConfirmPassword(),
  ]

  if (validationResults.every(Boolean)) {
    isSubmitting.value = true
    try {
      await register({
        ...form,
        phoneNumber: normalizePhone(form.phone),
      })
      await router.push({ path: '/login', query: { registered: 'true', email: form.email.trim() } })
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors ?? {}).forEach(([field, message]) => {
          const frontendField = field === 'phoneNumber' ? 'phone' : field
          if (frontendField in errors) errors[frontendField] = message
        })
        formStatus.value = error.message
      } else {
        formStatus.value = 'Unable to create your account. Please try again.'
      }
    } finally {
      isSubmitting.value = false
    }
  }
}
</script>

<template>
  <AuthLayout
    variant="register"
    title="Create account"
    subtitle="Create an account to register for events"
  >
    <form class="register-form" novalidate @submit.prevent="handleSubmit">
      <AuthInput
        id="first-name"
        v-model="form.firstName"
        label="First name"
        name="firstName"
        autocomplete="given-name"
        placeholder="First name"
        :maxlength="REGISTER_LIMITS.name"
        :error="errors.firstName"
        @blur="validateNameField('firstName', 'first name')"
        @input="errors.firstName = ''"
      />

      <AuthInput
        id="last-name"
        v-model="form.lastName"
        label="Last name"
        name="lastName"
        autocomplete="family-name"
        placeholder="Last name"
        :maxlength="REGISTER_LIMITS.name"
        :error="errors.lastName"
        @blur="validateNameField('lastName', 'last name')"
        @input="errors.lastName = ''"
      />

      <AuthInput
        id="phone"
        v-model="form.phone"
        label="Phone number"
        name="phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="e.g. 081-234-5678"
        :maxlength="REGISTER_LIMITS.phone"
        :error="errors.phone"
        @blur="validatePhone"
        @input="errors.phone = ''"
      />

      <AuthInput
        id="register-email"
        v-model="form.email"
        label="Email"
        name="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="name@example.com"
        :maxlength="REGISTER_LIMITS.email"
        :error="errors.email"
        @blur="validateEmail"
        @input="errors.email = ''"
      />

      <AuthInput
        id="register-password"
        v-model="form.password"
        label="Password"
        name="password"
        type="password"
        autocomplete="new-password"
        placeholder="8–128 characters"
        :maxlength="REGISTER_LIMITS.password"
        :error="errors.password"
        @blur="validatePassword"
        @input="errors.password = ''"
      />

      <AuthInput
        id="confirm-password"
        v-model="form.confirmPassword"
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Re-enter your password"
        :maxlength="REGISTER_LIMITS.password"
        :error="errors.confirmPassword"
        @blur="validateConfirmPassword"
        @input="errors.confirmPassword = ''"
      />

      <button class="submit-button" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Creating account…' : 'Create account' }}</button>
      <p v-if="formStatus" class="form-status" role="alert">{{ formStatus }}</p>
    </form>

    <p class="login-prompt">
      Already have an account?
      <RouterLink to="/login">Sign in</RouterLink>
    </p>
  </AuthLayout>
</template>

<style scoped>
.register-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 15px;
}

.submit-button {
  width: 100%;
  height: 46px;
  margin-top: 8px;
  color: var(--neutral-0);
  background: var(--gradient-brand);
  border-radius: 6px;
  box-shadow: 0 8px 18px rgb(177 151 252 / 24%);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: box-shadow 160ms ease, transform 160ms ease;
}

.submit-button:hover {
  box-shadow: 0 10px 22px rgb(177 151 252 / 34%);
  transform: translateY(-1px);
}

.submit-button:active {
  box-shadow: 0 5px 12px rgb(177 151 252 / 24%);
  transform: translateY(0);
}

.submit-button:disabled { cursor: wait; opacity: 0.7; transform: none; }
.form-status { margin: 0; color: #ba3f49; font-size: .75rem; text-align: center; }

.login-prompt {
  margin: 37px 0 0;
  color: #9aa4bd;
  font-size: 0.8125rem;
  text-align: center;
}

.login-prompt a {
  margin-left: 6px;
  color: var(--brand-blue-strong);
  font-weight: 600;
  text-decoration: none;
}

@media (prefers-reduced-motion: reduce) {
  .submit-button {
    transition: none;
  }
}
</style>
