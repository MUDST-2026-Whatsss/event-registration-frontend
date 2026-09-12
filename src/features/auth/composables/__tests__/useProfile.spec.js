import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const firstUser = {
  userId: '11111111-1111-1111-1111-111111111111',
  email: 'first@example.test',
  firstName: 'First',
  lastName: 'User',
  role: 'USER',
  roles: ['USER'],
}

const secondUser = {
  ...firstUser,
  userId: '22222222-2222-2222-2222-222222222222',
  email: 'second@example.test',
  firstName: 'Second',
}

describe('auth feature profile', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    window.localStorage.clear()
  })

  it('clears profile state on logout and scopes local avatars by user id', async () => {
    fetch
      .mockResolvedValueOnce(apiResponse({ token: 'login-csrf' }))
      .mockResolvedValueOnce(apiResponse({ user: firstUser }))
      .mockResolvedValueOnce(apiResponse({ token: 'logout-csrf' }))
      .mockResolvedValueOnce(apiResponse({ message: 'Signed out.' }))
      .mockResolvedValueOnce(apiResponse({ token: 'second-login-csrf' }))
      .mockResolvedValueOnce(apiResponse({ user: secondUser }))

    const { useAuth } = await import('../useAuth.js')
    const { useProfile } = await import('../useProfile.js')
    const auth = useAuth()
    const profileState = useProfile()

    await auth.login(firstUser.email, 'Password123')
    profileState.setAvatar('data:image/png;base64,first-user')

    expect(window.localStorage.getItem(`eventsss_profile_avatar:${firstUser.userId}`))
      .toBe('data:image/png;base64,first-user')

    await auth.logout()
    expect(profileState.profile).toMatchObject({
      firstName: '',
      email: '',
      avatar: '',
    })

    await auth.login(secondUser.email, 'Password123')
    expect(profileState.profile).toMatchObject({
      firstName: 'Second',
      email: secondUser.email,
      avatar: '',
    })
  })
})
