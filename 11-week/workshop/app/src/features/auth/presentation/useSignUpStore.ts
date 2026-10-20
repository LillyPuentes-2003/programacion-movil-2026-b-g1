import { create } from 'zustand'

import type { SessionUser } from '@core/domain/Session'
import { useSessionStore } from '@core/session/useSessionStore'

import type { AuthRepository, SignUpInput } from '../domain/AuthRepository'
import type { SessionStorage } from '../domain/SessionStorage'
import { signUp } from '../domain/signUp'
import { toAuthFailure, type AuthFailure } from './authFailure'

// SignUpState (auth.md): idle → submitting → success o error. Igual que en login, el formulario
// vive en la pantalla para que un error de la API nunca borre lo escrito.
type SignUpStatus = 'idle' | 'submitting' | 'success' | 'error'

interface SignUpStoreState {
  status: SignUpStatus
  failure?: AuthFailure
  submit: (
    repository: AuthRepository,
    storage: SessionStorage,
    input: SignUpInput,
  ) => Promise<SessionUser | null>
  reset: () => void
}

export const useSignUpStore = create<SignUpStoreState>((set) => ({
  status: 'idle',
  failure: undefined,
  submit: async (repository, storage, input) => {
    set({ status: 'submitting', failure: undefined })
    try {
      const user = await signUp(repository, storage, input)
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
