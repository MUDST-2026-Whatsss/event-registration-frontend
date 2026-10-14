<script setup>
import { CalendarDays } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  title: { type: String, default: 'Event' },
  category: { type: String, default: 'Event' },
  compact: { type: Boolean, default: false },
})
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
const hasImage = computed(() => Boolean(props.src?.trim()) && !failed.value)
const tone = computed(() => {
  const category = props.category.toLowerCase()
  if (category.includes('community')) return 'community'
  if (category.includes('design')) return 'design'
  return 'technology'
})
</script>

<template>
  <div class="event-cover" :class="[{ 'event-cover--placeholder': !hasImage, 'event-cover--compact': compact }, `event-cover--${tone}`]">
    <img v-if="hasImage" :key="src" :src="src" :alt="title" @error="failed = true" />
    <div v-else class="event-cover__placeholder" role="img" :aria-label="`No cover image for ${title}`">
      <span class="event-cover__icon" aria-hidden="true"><CalendarDays :size="compact ? 19 : 34" :stroke-width="1.5" /></span>
      <span v-if="!compact" class="event-cover__category" aria-hidden="true">{{ category || 'Event' }}</span>
    </div>
  </div>
</template>

<style scoped>
.event-cover { position: relative; display: block; width: 100%; height: 100%; min-width: 0; overflow: hidden; isolation: isolate; }
.event-cover > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.event-cover--placeholder { --cover-accent: #5d63bf; --cover-start: #eff0ff; --cover-end: #dce6f6; background: linear-gradient(135deg, var(--cover-start), var(--cover-end)); }
.event-cover--community { --cover-accent: #4a8072; --cover-start: #eff8f3; --cover-end: #dcece6; }
.event-cover--design { --cover-accent: #946586; --cover-start: #faf1f7; --cover-end: #eadff3; }
.event-cover__placeholder { position: relative; display: flex; width: 100%; height: 100%; min-height: inherit; align-items: center; justify-content: center; flex-direction: column; gap: 12px; color: var(--cover-accent); }
.event-cover__placeholder::before, .event-cover__placeholder::after { content: ''; position: absolute; z-index: -1; width: 180px; height: 180px; border: 1px solid currentColor; border-radius: 50%; opacity: .11; }
.event-cover__placeholder::before { top: -100px; right: -35px; }
.event-cover__placeholder::after { bottom: -110px; left: -50px; width: 240px; height: 240px; }
.event-cover__icon { display: grid; width: 68px; height: 68px; place-items: center; background: rgb(255 255 255 / 65%); border: 1px solid rgb(255 255 255 / 85%); border-radius: 20px; box-shadow: 0 6px 20px rgb(40 55 90 / 5%); }
.event-cover__category { max-width: 85%; overflow: hidden; font-size: 11px; font-weight: 600; letter-spacing: .09em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.event-cover--compact .event-cover__icon { width: 100%; height: 100%; border: 0; border-radius: inherit; background: transparent; box-shadow: none; }
.event-cover--compact .event-cover__placeholder::before, .event-cover--compact .event-cover__placeholder::after { display: none; }
</style>
