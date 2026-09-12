<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/features/auth/public.js'
import Icon from './ConsoleIcon.vue'

const router = useRouter()
const { logout, currentUser } = useAuth()

// The signed-in user drives the menu; props stay as escape hatches only.
const props = defineProps({
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  avatar: { type: String, default: '' },
})

const displayName = computed(() => props.name || currentUser.value?.name || 'Signed out')
const displayRole = computed(() => props.role || currentUser.value?.title || '')
const displayAvatar = computed(() => props.avatar || currentUser.value?.avatar || '')

async function signOut() {
  try {
    await logout()
  } catch {
    // logout() always clears the in-memory session in its finally block.
  }
  await router.push('/login')
}
</script>

<template>
  <div class="console-user-menu">
    <img v-if="displayAvatar" :src="displayAvatar" :alt="displayName" class="console-avatar" />
    <span class="console-user-info">
      <span class="console-user-name">{{ displayName }}</span>
      <span v-if="displayRole" class="console-user-role">{{ displayRole }}</span>
    </span>
    <button type="button" class="console-sign-out" title="Sign out" aria-label="Sign out" @click="signOut">
      <Icon name="log-out" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.console-user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  padding: 4px;
  color: var(--console-text-muted);
  font-family: inherit;
}

.console-sign-out {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 2px;
  color: var(--console-text-secondary);
  background: transparent;
  border: 1px solid var(--console-border);
  border-radius: var(--console-radius-sm);
  cursor: pointer;
}

.console-sign-out:hover {
  color: var(--console-danger);
  background: var(--console-danger-bg);
  border-color: #fbcaca;
}

.console-user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.console-user-name {
  font-size: var(--console-fs-base);
  font-weight: 700;
  color: var(--console-text);
}

.console-user-role {
  font-size: var(--console-fs-xs);
  color: var(--console-text-secondary);
}
</style>
