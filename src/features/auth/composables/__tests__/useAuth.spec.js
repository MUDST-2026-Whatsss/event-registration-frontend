import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const user = {
  userId: 'c5d5b682-2eb4-48d7-b766-b7fd4e021a54',
  email: 'user@example.test',
  firstName: 'Demo',
  lastName: 'User',
  name: 'Demo User',
  phoneNumber: '0812345678',
  role: 'USER',
  roles: ['USER'],
  permissions: [],
  status: 'ACTIVE',
}

describe('auth feature API session', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('logs in through CSRF-protected API and maps the backend role', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(apiResponse({ user }))

    const { USER_ROLE, useAuth } = await import('../useAuth.js')
    const auth = useAuth()
    const role = await auth.login('  USER@EXAMPLE.TEST ', 'Password123')

    expect(role).toBe(USER_ROLE)
    expect(auth.isAuthenticated.value).toBe(true)
    expect(auth.currentUser.value.email).toBe(user.email)
    expect(fetch).toHaveBeenNthCalledWith(1, '/api/v1/auth/csrf', expect.objectContaining({ credentials: 'include' }))
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/v1/auth/login', expect.objectContaining({
      credentials: 'include',
      body: JSON.stringify({ email: user.email, password: 'Password123' }),
    }))
  })

  it('restores an existing access-cookie session from /me', async () => {
    fetch.mockResolvedValueOnce(apiResponse(user))
    const { useAuth } = await import('../useAuth.js')
    const auth = useAuth()

    await auth.initializeAuth()

    expect(auth.isAuthenticated.value).toBe(true)
    expect(auth.currentUser.value.name).toBe('Demo User')
  })

  it('uses the refresh cookie when the access cookie has expired', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ code: 'UNAUTHENTICATED', message: 'Authentication is required.' }, 401))
      .mockResolvedValueOnce(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(apiResponse({ user: { ...user, role: 'ADMIN', roles: ['ADMIN'] } }))

    const { ADMIN_ROLE, useAuth } = await import('../useAuth.js')
    const auth = useAuth()
    await auth.initializeAuth()

    expect(auth.currentRole.value).toBe(ADMIN_ROLE)
    expect(auth.isAuthenticated.value).toBe(true)
  })

  it('stays signed out when neither access nor refresh session is valid', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ code: 'UNAUTHENTICATED' }, 401))
      .mockResolvedValueOnce(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(apiResponse({ code: 'INVALID_REFRESH_TOKEN', message: 'The session is no longer valid.' }, 401))

    const { useAuth } = await import('../useAuth.js')
    const auth = useAuth()
    await auth.initializeAuth()

    expect(auth.isAuthenticated.value).toBe(false)
    expect(auth.currentRole.value).toBeNull()
  })

  it('surfaces the backend login error without storing credentials', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(apiResponse({ code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' }, 401))

    const { useAuth } = await import('../useAuth.js')
    const auth = useAuth()

    await expect(auth.login(user.email, 'Wrong123')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
    })
    expect(auth.isAuthenticated.value).toBe(false)
  })

  it('fetches a rotated CSRF token before logout and clears the user state', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'login-csrf' }))
      .mockResolvedValueOnce(apiResponse({ user }))
      .mockResolvedValueOnce(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'logout-csrf' }))
      .mockResolvedValueOnce(apiResponse({ message: 'Signed out.' }))

    const { useAuth } = await import('../useAuth.js')
    const auth = useAuth()
    await auth.login(user.email, 'Password123')
    await auth.logout()

    expect(fetch).toHaveBeenCalledTimes(4)
    expect(auth.isAuthenticated.value).toBe(false)
    expect(auth.currentUser.value).toBeNull()
  })

  it('shares one refresh-token rotation across concurrent expired requests', async () => {
    let protectedRequestCount = 0
    let refreshRequestCount = 0
    let resolveRefresh
    const pendingRefresh = new Promise((resolve) => {
      resolveRefresh = resolve
    })

    fetch.mockImplementation((url, options = {}) => {
      if (url.endsWith('/auth/csrf')) {
        return Promise.resolve(apiResponse({ headerName: 'X-XSRF-TOKEN', token: 'csrf-token' }))
      }
      if (url.endsWith('/auth/refresh')) {
        refreshRequestCount += 1
        return pendingRefresh
      }
      if (url.endsWith('/auth/me') && options.method === 'PATCH') {
        protectedRequestCount += 1
        if (protectedRequestCount <= 2) {
          return Promise.resolve(apiResponse({ code: 'UNAUTHENTICATED' }, 401))
        }
        return Promise.resolve(apiResponse(user))
      }
      throw new Error(`Unexpected request: ${url}`)
    })

    const { useAuth } = await import('../useAuth.js')
    const auth = useAuth()
    const firstUpdate = auth.updateCurrentUser({ firstName: 'First' })
    const secondUpdate = auth.updateCurrentUser({ firstName: 'Second' })

    await vi.waitFor(() => expect(refreshRequestCount).toBe(1))
    resolveRefresh(apiResponse({ user }))
    await Promise.all([firstUpdate, secondUpdate])

    expect(refreshRequestCount).toBe(1)
    expect(protectedRequestCount).toBe(4)
    expect(auth.isAuthenticated.value).toBe(true)
  })
})
