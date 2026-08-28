<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import Icon from './Icon.vue'

const router = useRouter()
const { logout } = useAuth()

defineProps({
  name: { type: String, default: 'Super Admin' },
  role: { type: String, default: 'Super Admin' },
  avatar: { type: String, default: 'https://i.pravatar.cc/72?img=47' },
})

function signOut() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="sa-user-menu">
    <img :src="avatar" :alt="name" class="sa-avatar" />
    <span class="sa-user-info">
      <span class="sa-user-name">{{ name }}</span>
      <span class="sa-user-role">{{ role }}</span>
    </span>
    <button type="button" class="sa-sign-out" title="Sign out" aria-label="Sign out" @click="signOut">
      <Icon name="log-out" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.sa-user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  padding: 4px;
  color: var(--sa-text-muted);
  font-family: inherit;
}

.sa-sign-out {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 2px;
  color: var(--sa-text-secondary);
  background: transparent;
  border: 1px solid var(--sa-border);
  border-radius: var(--sa-radius-sm);
  cursor: pointer;
}

.sa-sign-out:hover {
  color: var(--sa-danger);
  background: var(--sa-danger-bg);
  border-color: #fbcaca;
}

.sa-user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.sa-user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--sa-text);
}

.sa-user-role {
  font-size: 11.5px;
  color: var(--sa-text-secondary);
}
</style>
