import { useDI } from '@core/di/DIContext'

import type { AuthRepository } from '../domain/AuthRepository'
import type { SessionStorage } from '../domain/SessionStorage'

// Cómo la presentación de auth obtiene sus dependencias: App.tsx las registra con estas claves al
// construir el contenedor de DI (composition root, ADR-008).
export const AUTH_REPOSITORY_KEY = 'authRepository'
export const SESSION_STORAGE_KEY = 'sessionStorage'

export function useAuthRepository(): AuthRepository {
  const repository = useDI()[AUTH_REPOSITORY_KEY] as AuthRepository | undefined
  if (!repository) {
    throw new Error('AuthRepository no está registrado en el contenedor de DI')
  }
  return repository
}

export function useSessionStorage(): SessionStorage {
  const storage = useDI()[SESSION_STORAGE_KEY] as SessionStorage | undefined
  if (!storage) {
    throw new Error('SessionStorage no está registrado en el contenedor de DI')
  }
  return storage
}
