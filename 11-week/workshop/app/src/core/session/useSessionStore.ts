import { create } from 'zustand'

import type { SessionUser } from '../domain/Session'

// SessionState de auth.md: global, vive mientras la app esté abierta. Guarda solo el perfil (nombre
// y rol), nunca los tokens: esos están únicamente en el almacenamiento seguro.
//
// Arranca en `unknown` y no en `anonymous` para que una usuaria ya autenticada no vea un parpadeo
// de login al abrir la app. Quien lo resuelve al arrancar es restoreSession (HU-10), a través de
// SessionRestorer en auth; mientras tanto RootNavigator muestra la pantalla de carga.
type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

interface SessionStoreState {
  status: SessionStatus
  user?: SessionUser
  setAuthenticated: (user: SessionUser) => void
  setAnonymous: () => void
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  status: 'unknown',
  user: undefined,
  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  setAnonymous: () => set({ status: 'anonymous', user: undefined }),
}))
