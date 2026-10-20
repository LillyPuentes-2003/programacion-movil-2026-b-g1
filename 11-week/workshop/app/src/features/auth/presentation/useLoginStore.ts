import { create } from 'zustand'

import type { SessionUser } from '@core/domain/Session'
import { useSessionStore } from '@core/session/useSessionStore'

import type { AuthRepository, Credentials } from '../domain/AuthRepository'
import type { SessionStorage } from '../domain/SessionStorage'
import { signIn } from '../domain/signIn'
import { toAuthFailure, type AuthFailure } from './authFailure'

// LoginState (auth.md): idle → submitting → success o error. Lo escrito vive en la pantalla, no
// aquí, así que un error nunca lo borra.
type LoginStatus = 'idle' | 'submitting' | 'success' | 'error'

interface LoginStoreState {
  status: LoginStatus
  failure?: AuthFailure
  submit: (
    repository: AuthRepository,
    storage: SessionStorage,
    credentials: Credentials,
  ) => Promise<SessionUser | null>
  reset: () => void
}

export const useLoginStore = create<LoginStoreState>((set) => ({
  status: 'idle',
  failure: undefined,
  submit: async (repository, storage, credentials) => {
    set({ status: 'submitting', failure: undefined })
    try {
      const user = await signIn(repository, storage, credentials)
      useSessionStore.getState().setAuthenticated(user)
      set({ status: 'success' })
      return user
    } catch (error) {
      set({ status: 'error', failure: toAuthFailure(error) })
      return null
    }
  },
  reset: () => set({ status: 'idle', failure: undefined }),
}))
