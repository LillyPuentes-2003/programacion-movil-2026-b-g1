import type { SessionUser } from '@core/domain/Session'

import type { AuthRepository, Credentials } from './AuthRepository'
import type { SessionStorage } from './SessionStorage'

// Abre la sesión: autentica, guarda los tokens y devuelve solo el perfil. Los tokens no salen de
// aquí hacia la UI (authentication.md: ningún repositorio ni pantalla los conoce).
export async function signIn(
  repository: AuthRepository,
  storage: SessionStorage,
  credentials: Credentials,
): Promise<SessionUser> {
  const session = await repository.login({
    email: credentials.email.trim(),
    password: credentials.password,
  })
  await storage.saveTokens(session.accessToken, session.refreshToken)
  return session.user
}
