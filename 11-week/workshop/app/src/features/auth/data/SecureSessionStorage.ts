import { secureStorage } from '@core/storage/secureStorage'

import type { SessionStorage, StoredSession } from '../domain/SessionStorage'
import { readAccessTokenClaims } from './accessTokenClaims'

// Los tokens van solo al Keystore de Android vía el plugin de secure storage (authentication.md),
// nunca a SQLite ni a @capacitor/preferences. Nada de aquí escribe un token en la consola.
export class SecureSessionStorage implements SessionStorage {
  saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    return secureStorage.setTokens(accessToken, refreshToken)
  }

  async readSession(): Promise<StoredSession | null> {
    const [accessToken, refreshToken] = await Promise.all([
      secureStorage.getAccessToken(),
      secureStorage.getRefreshToken(),
    ])
    if (!accessToken || !refreshToken) return null

    const claims = readAccessTokenClaims(accessToken)
    if (!claims) return null

    return { user: claims.user, accessTokenExpiresAt: claims.expiresAt, refreshToken }
  }

  clearTokens(): Promise<void> {
    return secureStorage.clearTokens()
  }
}
