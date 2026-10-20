import type { SessionUser } from '@core/domain/Session'

import type { AuthRepository, SignUpInput } from './AuthRepository'
import type { SessionStorage } from './SessionStorage'

// Registra y deja la sesión abierta (E-01 responde con una `Session`). Los campos del salón se
// mandan solo si el rol es negocio: si la persona los llenó y luego cambió a clienta, no viajan.
export async function signUp(
  repository: AuthRepository,
  storage: SessionStorage,
  input: SignUpInput,
): Promise<SessionUser> {
  const base = {
    role: input.role,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    password: input.password,
  }

  const session = await repository.register(
    input.role === 'business'
      ? { ...base, salonName: input.salonName?.trim(), address: input.address?.trim() }
      : base,
  )
  await storage.saveTokens(session.accessToken, session.refreshToken)
  return session.user
}
