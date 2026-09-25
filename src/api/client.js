const BASE = 'http://localhost:8080'

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrf() {
  if (!getCsrfToken()) {
    await fetch(`${BASE}/api/v1/auth/csrf`, { credentials: 'include' })
  }
}

async function request(method, path, body) {
  await ensureCsrf()
  const headers = { 'Content-Type': 'application/json' }
  const csrf = getCsrfToken()
  if (csrf) headers['X-XSRF-TOKEN'] = csrf

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    const error = new Error(err.message ?? 'Request failed')
    error.status = res.status
    error.data = err
    throw error
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get: (path) => request('GET', path, undefined),
  post: (path, body) => request('POST', path, body),
}
