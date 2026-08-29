<script setup>
import { reactive, ref } from 'vue'
import { LogIn } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import AuthInput from '@/components/AuthInput.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import { SUPER_ADMIN_ROLE, useAuth } from '@/composables/useAuth.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()
const { showToast } = useToast()
const email = ref('')
const password = ref('')
const formStatus = ref('')

const errors = reactive({
  email: '',
  password: '',
})

const validateEmail = () => {
  const value = email.value.trim()

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
  if (!password.value) {
    errors.password = 'Please enter your password.'
    return false
  }

  if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    return false
  }

  errors.password = ''
  return true
}

const handleSubmit = () => {
  formStatus.value = ''
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (isEmailValid && isPasswordValid) {
    const authenticatedRole = login(email.value, password.value)

    if (authenticatedRole) {
      const defaultRoute = authenticatedRole === SUPER_ADMIN_ROLE ? '/super-admin' : '/'
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : defaultRoute
      showToast({
        variant: 'success',
        title: 'Signed in successfully',
        message: 'Welcome back to Eventsss.',
      })
      router.push(redirect)
      return
    }

    formStatus.value = 'Incorrect email or password.'
  }
}
</script>

<template>
  <AuthLayout title="Sign in" subtitle="Welcome back to Eventsss">
    <form class="login-form" novalidate @submit.prevent="handleSubmit">
      <AuthInput
        id="email"
        v-model="email"
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
        id="password"
        v-model="password"
        label="Password"
        name="password"
        type="password"
        autocomplete="current-password"
        placeholder="Password"
        :error="errors.password"
        @blur="validatePassword"
        @input="errors.password = ''"
      />

      <RouterLink class="text-action" to="/forgot-password">
        Forgot password?
      </RouterLink>

      <button class="submit-button" type="submit">
        <span>Sign in</span>
        <LogIn :size="17" :stroke-width="2.25" aria-hidden="true" />
      </button>

      <p v-if="formStatus" class="form-status" role="alert">{{ formStatus }}</p>
    </form>

    <p class="register-prompt">
      Don't have an account?
      <RouterLink to="/register">Create account</RouterLink>
    </p>
  </AuthLayout>
</template>

<style scoped>
.login-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 15px;
}

.text-action {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  margin-top: -2px;
  padding: 0;
  justify-self: end;
  color: var(--brand-blue-strong);
  background: transparent;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
}

.submit-button {
  display: inline-flex;
  width: 100%;
  height: 46px;
  margin-top: 8px;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  margin: 0;
  color: #ba3f49;
  font-size: 0.75rem;
  text-align: center;
}

.register-prompt {
  margin: 37px 0 0;
  color: #9aa4bd;
  font-size: 0.8125rem;
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
