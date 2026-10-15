<script setup>
import { Eye, EyeOff, LockKeyhole } from '@lucide/vue'
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact'].includes(value),
  },
  variant: {
    type: String,
    default: 'auth',
    validator: (value) => ['auth', 'profile'].includes(value),
  },
  describedBy: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'input'])
const isVisible = ref(false)

const inputType = computed(() => (isVisible.value ? 'text' : 'password'))
const descriptionIds = computed(() => [
  props.error ? `${props.id}-error` : '',
  props.describedBy,
].filter(Boolean).join(' ') || undefined)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}
</script>

<template>
  <div
    class="password-field"
    :class="[`password-field--${variant}`, `password-field--${size}`]"
  >
    <label :class="{ 'sr-only': variant === 'auth' }" :for="id">{{ label }}</label>
    <div class="password-field__control" :class="{ invalid: error }">
      <LockKeyhole v-if="variant === 'profile'" class="password-field__leading-icon" :size="17" aria-hidden="true" />
      <input
        v-bind="$attrs"
        :data-test="$attrs['data-test'] || id"
        :id="id"
        :value="modelValue"
        :type="inputType"
        :aria-invalid="Boolean(error)"
        :aria-describedby="descriptionIds"
        @input="handleInput"
        @blur="emit('blur', $event)"
      />
      <button
        class="password-field__toggle"
        type="button"
        :aria-label="isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`"
        :aria-pressed="isVisible"
        :title="isVisible ? 'Hide password' : 'Show password'"
        @mousedown.prevent
        @click="isVisible = !isVisible"
      >
        <EyeOff v-if="isVisible" :size="17" aria-hidden="true" />
        <Eye v-else :size="17" aria-hidden="true" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="password-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.password-field {
  position: relative;
  display: grid;
  min-width: 0;
  gap: 4px;
}

.password-field__control {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
}

.password-field input {
  width: 100%;
  min-width: 0;
  outline: none;
}

.password-field__toggle {
  position: absolute;
  right: 7px;
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  color: #667085;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}

.password-field__toggle:hover {
  color: #2455db;
  background: rgb(91 124 250 / 9%);
}

.password-field__toggle:focus-visible {
  color: #2455db;
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.password-field--auth input {
  height: 53px;
  padding: 0 49px 0 15px;
  color: var(--neutral-950);
  background: #e9edff;
  border: 1px solid #c7cee8;
  border-radius: 6px;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.password-field--auth.password-field--compact input {
  height: 46px;
}

.password-field--auth input::placeholder {
  color: #9aa6c2;
  opacity: 1;
}

.password-field--auth input:hover {
  border-color: #aeb7e8;
}

.password-field--auth input:focus {
  background: var(--neutral-0);
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px rgb(91 124 250 / 16%);
}

.password-field--auth .password-field__control.invalid input {
  border-color: var(--semantic-error);
}

.password-field--profile {
  gap: 6px;
}

.password-field--profile > label {
  font-size: .78rem;
  font-weight: 500;
}

.password-field--profile .password-field__control {
  height: 44px;
  padding: 0 46px 0 38px;
  color: var(--neutral-600);
  background: #fafaff;
  border: 1px solid #cbd0df;
  border-radius: 5px;
}

.password-field--profile .password-field__control:focus-within {
  color: #2455db;
  border-color: var(--brand-blue);
  box-shadow: 0 0 0 3px rgb(91 124 250 / 14%);
}

.password-field--profile .password-field__control.invalid {
  color: #b93643;
  border-color: var(--semantic-error);
}

.password-field--profile .password-field__control.invalid:focus-within {
  box-shadow: 0 0 0 3px rgb(243 130 136 / 16%);
}

.password-field--profile .password-field__leading-icon {
  position: absolute;
  left: 12px;
}

.password-field--profile input {
  height: 100%;
  padding: 0;
  color: #20263a;
  background: transparent;
  border: 0;
}

.password-field__error {
  margin: 0 2px;
  color: #ba3f49;
  font-size: .6875rem;
  line-height: 1.35;
}

@media (prefers-reduced-motion: reduce) {
  .password-field--auth input {
    transition: none;
  }
}
</style>
