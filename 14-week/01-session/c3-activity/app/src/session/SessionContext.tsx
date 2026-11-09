import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { authApi, type User } from '../core/api'
import { configureApiClient } from '../core/apiClient'
import { clearSession, loadSession, saveSession, type StoredSession } from './tokenStorage'

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous'; reason?: 'expired' | 'logout' }
  | { status: 'authenticated'; user: User }

interface SessionContextValue {
  session: SessionState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ status: 'loading' })
  // El token vive en un ref para que el cliente HTTP siempre lea el valor actual.
  const tokenRef = useRef<string | null>(null)

  const endSession = useCallback(async (reason: 'expired' | 'logout') => {
    tokenRef.current = null
    await clearSession()
    setSession({ status: 'anonymous', reason })
  }, [])

  // Conecta el cliente HTTP con la sesión: de aquí saca el token y, ante un 401,
  // cierra la sesión para que RequireAuth lleve al usuario al login.
  useEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        void endSession('expired')
      },
    })
  }, [endSession])

  // Restaurar la sesión guardada al abrir la app.
  useEffect(() => {
    loadSession()
      .then((stored) => {
        if (stored) {
          tokenRef.current = stored.token
          setSession({ status: 'authenticated', user: stored.user })
        } else {
          setSession({ status: 'anonymous' })
        }
      })
      .catch(() => setSession({ status: 'anonymous' }))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, expiresIn, user } = await authApi.login(email, password)
    const stored: StoredSession = { token, user, expiresAt: Date.now() + expiresIn * 1000 }
    await saveSession(stored)
    tokenRef.current = token
    setSession({ status: 'authenticated', user })
  }, [])

  const logout = useCallback(() => endSession('logout'), [endSession])

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return ctx
}
