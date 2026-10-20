import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'

// Los tokens van solo aquí (Keystore de Android vía capacitor-secure-storage-plugin), nunca a
// SQLite ni a @capacitor/preferences: ver authentication.md.
const ACCESS_TOKEN_KEY = 'auth.accessToken'
const REFRESH_TOKEN_KEY = 'auth.refreshToken'

async function get(key: string): Promise<string | null> {
  try {
    const { value } = await SecureStoragePlugin.get({ key })
    return value
  } catch {
    return null
  }
}

async function set(key: string, value: string): Promise<void> {
  await SecureStoragePlugin.set({ key, value })
}

async function remove(key: string): Promise<void> {
  try {
    await SecureStoragePlugin.remove({ key })
  } catch {
    // ya no existía, no pasa nada
  }
}

export const secureStorage = {
  getAccessToken: () => get(ACCESS_TOKEN_KEY),
  getRefreshToken: () => get(REFRESH_TOKEN_KEY),
  setTokens: async (accessToken: string, refreshToken: string) => {
    await set(ACCESS_TOKEN_KEY, accessToken)
    await set(REFRESH_TOKEN_KEY, refreshToken)
  },
  clearTokens: async () => {
    await remove(ACCESS_TOKEN_KEY)
    await remove(REFRESH_TOKEN_KEY)
  },
}
