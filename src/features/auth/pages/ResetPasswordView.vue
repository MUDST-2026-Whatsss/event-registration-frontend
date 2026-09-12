<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthInput from '../components/AuthInput.vue'
import AuthLayout from '../components/AuthLayout.vue'

const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const formStatus = ref('')

const errors = reactive({
  password: '',
  confirmPassword: '',
})

const validatePassword = () => {
  if (!password.value) {
    errors.password = 'Please enter a new password.'
    return false
  }

  if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    return false
  }

  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Please confirm your new password.'
    return false
  }

  if (confirmPassword.value !== password.value) {
    errors.confirmPassword = 'Passwords do not match.'
    return false
  }

  errors.confirmPassword = ''
  return true
}

const handleSubmit = () => {
  formStatus.value = ''
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()

  if (!isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  if (!route.query.token) {
    formStatus.value = 'This password reset link is invalid or has expired.'
    return
  }

  formStatus.value = 'Your new password has been validated.'
}
</script>

<template>
  <AuthLayout
    variant="reset-password"
    title="Set a new password"
    subtitle="Create a new password for your account"
  >
    <form class="reset-form" novalidate @submit.prevent="handleSubmit">
      <AuthInput
        id="new-password"
        v-model="password"
        size="compact"
        label="New password"
        name="password"
        type="password"
        autocomplete="new-password"
        placeholder="New password"
        :error="errors.password"
        @blur="validatePassword"
        @input="errors.password = ''"
      />

      <AuthInput
        id="confirm-new-password"
        v-model="confirmPassword"
        size="compact"
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Confirm new password"
        :error="errors.confirmPassword"
        @blur="validateConfirmPassword"
        @input="errors.confirmPassword = ''"
      />

      <button class="submit-button" type="submit">Reset password</button>
      <p v-if="formStatus" class="form-status" aria-live="polite">{{ formStatus }}</p>
    </form>

    <p class="login-prompt">
      Remembered your password?
      <RouterLink to="/login">Sign in</RouterLink>
    </p>
  </AuthLayout>
</template>

<style scoped>
.reset-form {
  display: grid;
  width: min(100%, 309px);
  align-self: center;
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

.form-status {
  margin: -2px 0 0;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
}

.login-prompt {
  margin: 28px 0 0;
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
