<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
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
  type: {
    type: String,
    default: 'text',
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
})

const emit = defineEmits(['update:modelValue', 'blur', 'input'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}
</script>

<template>
  <div class="auth-field" :class="`auth-field--${size}`">
    <label class="sr-only" :for="id">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      :value="modelValue"
      :type="type"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      @input="handleInput"
      @blur="emit('blur', $event)"
    />
    <p v-if="error" :id="`${id}-error`" class="auth-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.auth-field {
  position: relative;
  display: grid;
  min-width: 0;
  gap: 4px;
}

.auth-field input {
  width: 100%;
  height: 53px;
  padding: 0 15px;
  color: var(--neutral-950);
  background: #e9edff;
  border: 1px solid #c7cee8;
  border-radius: 6px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.auth-field--compact input {
  height: 46px;
}

.auth-field input::placeholder {
  color: #9aa6c2;
  opacity: 1;
}

.auth-field input:hover {
  border-color: #aeb7e8;
}

.auth-field input:focus {
  background: var(--neutral-0);
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px rgb(91 124 250 / 16%);
}

.auth-field input[aria-invalid='true'] {
  border-color: var(--semantic-error);
}

.auth-field__error {
  margin: 0 2px;
  color: #ba3f49;
  font-size: 0.6875rem;
  line-height: 1.35;
}

@media (prefers-reduced-motion: reduce) {
  .auth-field input {
    transition: none;
  }
}
</style>
