// Shared transport only; domain-specific endpoint functions belong to their feature.
const API_PREFIX = '/api/v1'

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fieldErrors = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

let csrfToken = ''
let csrfRequest = null

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return null

  try {
    return await response.json()
  } catch {
    return null
  }
}

async function loadCsrfToken(force = false) {
  if (force) {
    csrfToken = ''
    csrfRequest = null
  }
  if (csrfToken) return csrfToken
  if (csrfRequest) return csrfRequest

  csrfRequest = fetch(`${API_PREFIX}/auth/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      const payload = await parseResponse(response)
      if (!response.ok || !payload?.token) {
        throw new ApiError(
          payload?.message ?? 'Unable to initialize request security.',
          { status: response.status, code: payload?.code ?? 'CSRF_INITIALIZATION_FAILED' },
        )
      }
      csrfToken = payload.token
      return csrfToken
    })
    .catch((error) => {
      if (error instanceof ApiError) throw error
      throw new ApiError('Unable to connect to the server. Please try again.', { code: 'NETWORK_ERROR' })
    })
    .finally(() => {
      csrfRequest = null
    })

  return csrfRequest
}

export function resetCsrfToken() {
  csrfToken = ''
  csrfRequest = null
}

export async function apiRequest(path, options = {}) {
  const { refreshCsrf = false, ...requestOptions } = options
  const method = (requestOptions.method ?? 'GET').toUpperCase()
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  const headers = new Headers(requestOptions.headers)

  headers.set('Accept', 'application/json')
  if (requestOptions.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (mutating) {
    headers.set('X-XSRF-TOKEN', await loadCsrfToken(refreshCsrf))
  }

  let response
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...requestOptions,
      method,
      headers,
      credentials: 'include',
      body: requestOptions.body === undefined || typeof requestOptions.body === 'string'
        ? requestOptions.body
        : JSON.stringify(requestOptions.body),
    })
  } catch {
    throw new ApiError('Unable to connect to the server. Please try again.', { code: 'NETWORK_ERROR' })
  }

  const payload = await parseResponse(response)

  if (
    response.status === 403
    && mutating
    && !refreshCsrf
    && payload?.code === 'CSRF_TOKEN_INVALID'
  ) {
    return apiRequest(path, { ...options, refreshCsrf: true })
  }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Request failed (${response.status}).`, {
      status: response.status,
      code: payload?.code ?? 'REQUEST_FAILED',
      fieldErrors: payload?.fieldErrors ?? null,
    })
  }

  return payload
}
