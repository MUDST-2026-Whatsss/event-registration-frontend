import fallbackImage from '@/assets/events/hero.jpg'

const dateFormatterCache = new Map()

function formatter(timeZone, options) {
  const key = `${timeZone}:${JSON.stringify(options)}`
  if (!dateFormatterCache.has(key)) {
    dateFormatterCache.set(key, new Intl.DateTimeFormat('en-US', { ...options, timeZone }))
  }
  return dateFormatterCache.get(key)
}

function validDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

function formatDateRange(startValue, endValue, timeZone) {
  const start = validDate(startValue)
  const end = validDate(endValue)
  if (!start) return 'Date to be announced'

  const dateFormat = formatter(timeZone, { month: 'short', day: 'numeric', year: 'numeric' })
  if (!end || start.toDateString() === end.toDateString()) return dateFormat.format(start)

  return `${dateFormat.format(start)} – ${dateFormat.format(end)}`
}

function formatTimeRange(startValue, endValue, timeZone) {
  const start = validDate(startValue)
  const end = validDate(endValue)
  if (!start) return ''

  const timeFormat = formatter(timeZone, { hour: 'numeric', minute: '2-digit' })
  return end ? `${timeFormat.format(start)} – ${timeFormat.format(end)}` : timeFormat.format(start)
}

function registrationStatus(event, now = Date.now()) {
  const registrationStart = validDate(event.registrationStartAt)?.getTime()
  const registrationEnd = validDate(event.registrationEndAt)?.getTime()
  const eventEnd = validDate(event.endAt)?.getTime()

  if ((eventEnd && eventEnd < now) || (registrationEnd && registrationEnd < now)) return 'closed'
  if (registrationStart && registrationStart > now) return 'upcoming'
  return 'open'
}

function locationLabel(event) {
  if (event.locationType === 'ONLINE') return 'Online event'
  if (event.locationType === 'HYBRID') return event.locationName ? `${event.locationName} · Online` : 'Hybrid event'
  return event.locationName || 'Location to be announced'
}

export function mapPublicEvent(event, now = Date.now()) {
  const timezone = event.timezone || 'Asia/Bangkok'
  const status = registrationStatus(event, now)

  return {
    ...event,
    id: event.slug,
    eventId: event.eventId,
    image: event.imageUrl || fallbackImage,
    price: Number(event.price || 0),
    categoryName: event.category?.nameEn || event.category?.nameTh || 'Event',
    date: formatDateRange(event.startAt, event.endAt, timezone),
    time: formatTimeRange(event.startAt, event.endAt, timezone),
    location: locationLabel(event),
    status,
    badge: status === 'open' ? 'Open' : status === 'upcoming' ? 'Upcoming' : 'Closed',
    capacity: status === 'open' ? 'Registration open' : status === 'upcoming' ? 'Registration opens soon' : 'Registration closed',
  }
}

export function groupPublicEvents(events, { includeClosed = true } = {}) {
  const groups = [
    { id: 'open', title: 'Open for Registration', statuses: ['open'] },
    { id: 'upcoming', title: 'Upcoming Events', statuses: ['upcoming'] },
  ]
  if (includeClosed) groups.push({ id: 'closed', title: 'Past & Closed Events', statuses: ['closed'] })

  return groups
    .map((group) => ({
      id: group.id,
      title: group.title,
      events: events.filter((event) => group.statuses.includes(event.status)),
    }))
    .filter((group) => group.events.length > 0)
}

export function canRegisterForEvent(event) {
  return event?.status === 'open'
}
