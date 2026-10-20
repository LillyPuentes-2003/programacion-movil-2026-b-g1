import type { SessionUser } from '@core/domain/Session'
import { NetworkError, TimeoutError } from '@core/network/errors'

import type { AuthRepository } from './AuthRepository'
import type { SessionStorage } from './SessionStorage'

// Margen para no declarar vigente un token que vence mientras la app termina de abrir.
const EXPIRY_MARGIN_MS = 60_000

export type RestoredSession =
  | { status: 'authenticated'; user: SessionUser }
  | { status: 'anonymous' }

// HU-10: al abrir la app, decide si hay sesión sin pedirle nada a la persona.
//
// - Sin tokens guardados (o ilegibles): anónima.
// - accessToken vigente: autenticada, sin ir a la red.
// - accessToken vencido: se renueva con el refreshToken antes de declarar la sesión.
//   - Si no hay conexión (sin red o timeout): la sesión sigue abierta con el perfil guardado
//     (auth.md: "una sesión ya abierta sigue siendo válida sin red"). Los tokens no se tocan, y el
//     interceptor de HU-11 la renovará en la primera petición que lo necesite.
//   - Cualquier otra respuesta (401 por token vencido, ya usado o revocado, y también un 5xx, como
//     pide auth-refresh.md para no dejar un estado intermedio): se borran los tokens y queda
//     anónima. No es un error para la persona: simplemente tiene que volver a entrar.
export async function restoreSession(
  repository: AuthRepository,
  storage: SessionStorage,
  now: () => number = Date.now,
): Promise<RestoredSession> {
  const stored = await storage.readSession()
  if (!stored) {
    await storage.clearTokens()
    return { status: 'anonymous' }
  }

  if (stored.accessTokenExpiresAt - EXPIRY_MARGIN_MS > now()) {
    return { status: 'authenticated', user: stored.user }
  }

  try {
    const tokens = await repository.refresh(stored.refreshToken)
    await storage.saveTokens(tokens.accessToken, tokens.refreshToken)
    const renewed = await storage.readSession()
    if (!renewed) {
      await storage.clearTokens()
      return { status: 'anonymous' }
    }
    return { status: 'authenticated', user: renewed.user }
  } catch (error) {
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return { status: 'authenticated', user: stored.user }
    }
    await storage.clearTokens()
    return { status: 'anonymous' }
  }
}
