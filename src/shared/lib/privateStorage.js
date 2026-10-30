// Keys under this prefix hold personal data cached on the device, and are removed at sign-out so
// the next person using a shared device cannot read them.
export const PRIVATE_STORAGE_PREFIX = 'eventsss.private.'

export function clearPrivateStorage() {
  try {
    const keys = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith(PRIVATE_STORAGE_PREFIX)) keys.push(key)
    }
    keys.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Storage unavailable: nothing was cached either.
  }
}
