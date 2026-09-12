import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const user = {
  userId: 'c5d5b682-2eb4-48d7-b766-b7fd4e021a54',
  email: 'user@example.test',
  role: 'USER',
  roles: ['USER'],
}

describe('application router authentication guard', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    window.history.replaceState({}, '', '/')
  })

  it('does not block a public route on auth API initialization', async () => {
    const { default: router } = await import('../index.js')

    await router.push('/events')

    expect(router.currentRoute.value.name).toBe('events')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('redirects an unauthenticated protected route to login', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ code: 'UNAUTHENTICATED' }, 401))
      .mockResolvedValueOnce(apiResponse({ token: 'csrf-token' }))
      .mockResolvedValueOnce(apiResponse({ code: 'INVALID_REFRESH_TOKEN' }, 401))

    const { default: router } = await import('../index.js')
    await router.push('/profile')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/profile')
  })

  it('lets the API-backed registration page decide event eligibility', async () => {
    fetch.mockResolvedValueOnce(apiResponse(user))

    const { default: router } = await import('../index.js')
    await router.push('/events/server-event-id/register')

    expect(router.currentRoute.value.name).toBe('event-registration')
    expect(router.currentRoute.value.params.id).toBe('server-event-id')
  })
})
