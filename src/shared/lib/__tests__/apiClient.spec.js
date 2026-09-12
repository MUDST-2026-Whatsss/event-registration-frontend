import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

describe('shared apiClient CSRF handling', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not retry a real authorization failure', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ token: 'csrf-token' }))
      .mockResolvedValueOnce(apiResponse({
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to perform this action.',
      }, 403))

    const { apiRequest } = await import('../apiClient.js')

    await expect(apiRequest('/admin/events', { method: 'POST', body: {} }))
      .rejects.toMatchObject({
        status: 403,
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to perform this action.',
      })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('rotates the CSRF token once when the backend marks it invalid', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ token: 'expired-csrf' }))
      .mockResolvedValueOnce(apiResponse({ code: 'CSRF_TOKEN_INVALID' }, 403))
      .mockResolvedValueOnce(apiResponse({ token: 'fresh-csrf' }))
      .mockResolvedValueOnce(apiResponse({ id: 'event-1' }, 201))

    const { apiRequest } = await import('../apiClient.js')
    const result = await apiRequest('/events', { method: 'POST', body: { name: 'Event' } })

    expect(result).toEqual({ id: 'event-1' })
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(fetch.mock.calls[1][1].headers.get('X-XSRF-TOKEN')).toBe('expired-csrf')
    expect(fetch.mock.calls[3][1].headers.get('X-XSRF-TOKEN')).toBe('fresh-csrf')
  })
})
