import { Preferences } from '@capacitor/preferences'

import type { User } from '../core/api'

// Guarda la sesión con @capacitor/preferences (SharedPreferences en Android,
// localStorage en web). Se guarda también la fecha de expiración para no
// restaurar un token que ya venció.

const KEY = 'c3-session'

export interface StoredSession {
  token: string
  user: User
  /** Fecha de expiración en milisegundos (Date.now()) */
  expiresAt: number
}

export async function loadSession(): Promise<StoredSession | null> {
  const { value } = await Preferences.get({ key: KEY })
  if (!value) return null
  try {
    const session = JSON.parse(value) as StoredSession
    if (session.expiresAt <= Date.now()) {
      await clearSession()
      return null
    }
    return session
  } catch {
    await clearSession()
    return null
  }
}

export async function saveSession(session: StoredSession) {
  await Preferences.set({ key: KEY, value: JSON.stringify(session) })
}

export async function clearSession() {
  await Preferences.remove({ key: KEY })
}
