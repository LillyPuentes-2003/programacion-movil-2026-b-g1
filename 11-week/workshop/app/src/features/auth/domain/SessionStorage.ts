import type { SessionUser } from '@core/domain/Session'

// La sesión tal como quedó guardada en el dispositivo. El perfil sale del `accessToken` (api-contract
// §1.2 permite leer `name` y `role` para decidir qué mostrar); el dominio no sabe que es un JWT.
export interface StoredSession {
  user: SessionUser
  // Instante (ms) en que vence el accessToken, según su `exp`.
  accessTokenExpiresAt: number
  refreshToken: string
}

// Dónde quedan los tokens de la sesión abierta. La implementación usa el almacenamiento seguro de
// Capacitor (authentication.md); el dominio solo sabe que se guardan, se leen y se borran.
export interface SessionStorage {
  saveTokens(accessToken: string, refreshToken: string): Promise<void>
  // null si no hay tokens guardados o si lo guardado no se puede leer.
  readSession(): Promise<StoredSession | null>
  clearTokens(): Promise<void>
}
