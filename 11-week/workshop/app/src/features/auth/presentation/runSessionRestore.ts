import { useSessionStore } from '@core/session/useSessionStore'

import type { AuthRepository } from '../domain/AuthRepository'
import { restoreSession } from '../domain/restoreSession'
import type { SessionStorage } from '../domain/SessionStorage'

// Una sola restauración por arranque de la app. React (StrictMode en desarrollo) puede montar
// SessionRestorer dos veces; dos refrescos con el mismo refreshToken harían que el segundo
// recibiera 401 (la API rota y revoca el usado) y borrara una sesión válida.
let inFlight: Promise<void> | null = null

export function runSessionRestore(repository: AuthRepository, storage: SessionStorage): Promise<void> {
  if (!inFlight) {
    inFlight = restoreSession(repository, storage)
      .then((result) => {
        const session = useSessionStore.getState()
        if (result.status === 'authenticated') session.setAuthenticated(result.user)
        else session.setAnonymous()
      })
      .catch(() => {
        // Si ni siquiera se pudo leer el almacenamiento, se arranca sin sesión en vez de dejar la
        // app atascada en la pantalla de carga.
        useSessionStore.getState().setAnonymous()
      })
  }
  return inFlight
}

// Solo para pruebas: simula un arranque nuevo de la app.
export function resetSessionRestoreForTests() {
  inFlight = null
}
