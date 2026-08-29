<script setup>
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register', 'forgot-password', 'reset-password'].includes(value),
  },
})
</script>

<template>
  <div class="auth-shell">
    <AppHeader />

    <main class="auth-main">
      <section
        class="auth-panel"
        :class="`auth-panel--${variant}`"
        aria-labelledby="auth-title"
      >
        <div class="auth-panel__heading">
          <h1 id="auth-title">{{ title }}</h1>
          <p>{{ subtitle }}</p>
        </div>

        <slot />
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.auth-shell {
  display: grid;
  min-height: 100vh;
  min-height: 100dvh;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.auth-main {
  display: grid;
  padding: 36px 20px;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  background: var(--gradient-page);
}

.auth-panel {
  display: flex;
  width: 100%;
  max-width: 425px;
  padding: 31px 30px 30px;
  flex-direction: column;
  background: var(--neutral-0);
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 8px;
  box-shadow: var(--shadow-panel);
}

.auth-panel--login {
  min-height: 438px;
}

.auth-panel--register {
  min-height: 676px;
}

.auth-panel--forgot-password {
  min-height: 344px;
}

.auth-panel--reset-password {
  min-height: 410px;
}

.auth-panel__heading {
  margin-bottom: 27px;
  text-align: center;
}

.auth-panel--forgot-password .auth-panel__heading {
  margin-bottom: 30px;
}

.auth-panel__heading h1 {
  margin: 0;
  color: #414351;
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.3;
}

.auth-panel__heading p {
  margin: 5px 0 0;
  color: #9aa4bd;
  font-size: 0.875rem;
  font-weight: 400;
}

@media (max-width: 520px) {
  .auth-main {
    min-height: 0;
    padding: 28px 14px;
  }

  .auth-panel {
    min-height: 0;
    padding: 30px 22px;
  }

  .auth-panel__heading h1 {
    font-size: 1.625rem;
  }
}
</style>
