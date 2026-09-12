<script setup>
import { reactive, ref } from 'vue'
import AuthInput from '../components/AuthInput.vue'
import AuthLayout from '../components/AuthLayout.vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { ApiError } from '@/shared/lib/apiClient.js'

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

const validateRequired = (field, label) => {
  if (!form[field].trim()) {
    errors[field] = `Please enter your ${label}.`
    return false
  }

  errors[field] = ''
  return true
}

const validatePhone = () => {
  const normalizedPhone = form.phone.replace(/[\s-]/g, '')

  if (!normalizedPhone) {
    errors.phone = 'Please enter your phone number.'
    return false
  }

  if (!/^0\d{8,9}$/.test(normalizedPhone)) {
    errors.phone = 'Please enter a valid phone number.'
    return false
  }

  errors.phone = ''
  return true
}

const validateEmail = () => {
  const value = form.email.trim()

  if (!value) {
    errors.email = 'Please enter your email.'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.email = 'Please enter a valid email address.'
    return false
  }

  errors.email = ''
  return true
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'Please enter your password.'
    return false
  }

  if (form.password.length < 8 || !/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'Use 8+ characters with uppercase, lowercase, and a number.'
    return false
  }

  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
    return false
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
    return false
  }

  errors.confirmPassword = ''
  return true
}

const handleSubmit = async () => {
  formStatus.value = ''
  const validationResults = [
    validateRequired('firstName', 'first name'),
    validateRequired('lastName', 'last name'),
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
        phoneNumber: form.phone.replace(/[\s-]/g, ''),
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
        :error="errors.firstName"
        @blur="validateRequired('firstName', 'first name')"
        @input="errors.firstName = ''"
      />

      <AuthInput
        id="last-name"
        v-model="form.lastName"
        label="Last name"
        name="lastName"
        autocomplete="family-name"
        placeholder="Last name"
        :error="errors.lastName"
        @blur="validateRequired('lastName', 'last name')"
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
        placeholder="Phone number"
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
        placeholder="Email"
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
        placeholder="Password"
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
        placeholder="Confirm Password"
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
