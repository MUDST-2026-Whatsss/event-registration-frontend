<script setup>
import { ref } from 'vue'
import AuthInput from '@/components/AuthInput.vue'
import AuthLayout from '@/components/AuthLayout.vue'

const email = ref('')
const emailError = ref('')
const formStatus = ref('')

const validateEmail = () => {
  const value = email.value.trim()

  if (!value) {
    emailError.value = 'Please enter your email.'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    emailError.value = 'Please enter a valid email address.'
    return false
  }

  emailError.value = ''
  return true
}

const handleSubmit = () => {
  formStatus.value = ''

  if (validateEmail()) {
    formStatus.value = "If an account exists for this email, we'll send a password reset link."
  }
}
</script>

<template>
  <AuthLayout
    variant="forgot-password"
    title="Forgot password"
    subtitle="Enter your email to receive a password reset link"
  >
    <form class="forgot-form" novalidate @submit.prevent="handleSubmit">
      <AuthInput
        id="recovery-email"
        v-model="email"
        size="compact"
        label="Email"
        name="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="Email address"
        :error="emailError"
        @blur="validateEmail"
        @input="emailError = ''"
      />

      <RouterLink class="login-link" to="/login">Back to sign in</RouterLink>

      <button class="submit-button" type="submit">Send reset link</button>
      <p v-if="formStatus" class="request-status" aria-live="polite">{{ formStatus }}</p>
    </form>

    <p class="register-prompt">
      Don't have an account?
      <RouterLink to="/register">Create account</RouterLink>
    </p>
  </AuthLayout>
</template>

<style scoped>
.forgot-form {
  display: grid;
  width: min(100%, 309px);
  align-self: center;
  grid-template-columns: minmax(0, 1fr);
}

.login-link {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  margin-top: 11px;
  padding: 0;
  justify-self: end;
  color: var(--brand-blue-strong);
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
}

.submit-button {
  width: 100%;
  height: 46px;
  margin-top: 12px;
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

.register-prompt {
  margin: 22px 0 0;
  color: #9aa4bd;
  font-size: 0.8125rem;
  text-align: center;
}

.request-status {
  margin: 12px 0 0;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
}

.register-prompt a {
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
