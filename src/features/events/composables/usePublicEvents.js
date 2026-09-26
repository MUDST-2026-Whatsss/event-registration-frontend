import { readonly, ref } from 'vue'
import { getPublishedEvent, listPublishedEvents } from '../api/publicEventsApi.js'
import { mapPublicEvent } from '../lib/publicEvent.js'

const events = ref([])
const loading = ref(false)
const error = ref('')
const detailCache = new Map()
let listRequest = null

function errorMessage(cause) {
  return cause?.message || 'Unable to load events. Please try again.'
}

export function usePublicEvents() {
  async function loadEvents(force = false) {
    if (!force && events.value.length) return events.value
    if (!force && listRequest) return listRequest

    loading.value = true
    error.value = ''
    listRequest = listPublishedEvents()
      .then((payload) => {
        events.value = (Array.isArray(payload) ? payload : [])
          .map((event) => mapPublicEvent(event))
          .sort((left, right) => new Date(left.startAt) - new Date(right.startAt))
        return events.value
      })
      .catch((cause) => {
        error.value = errorMessage(cause)
        throw cause
      })
      .finally(() => {
        loading.value = false
        listRequest = null
      })

    return listRequest
  }

  async function loadEvent(slug, force = false) {
    if (!force && detailCache.has(slug)) return detailCache.get(slug)

    try {
      const event = mapPublicEvent(await getPublishedEvent(slug))
      detailCache.set(slug, event)
      const index = events.value.findIndex((item) => item.slug === slug)
      if (index >= 0) events.value.splice(index, 1, event)
      return event
    } catch (cause) {
      throw cause
    }
  }

  function findEvent(identifier) {
    return detailCache.get(identifier)
      || events.value.find((event) => event.slug === identifier || event.eventId === identifier)
      || null
  }

  return {
    events: readonly(events),
    loading: readonly(loading),
    error: readonly(error),
    loadEvents,
    loadEvent,
    findEvent,
  }
}
