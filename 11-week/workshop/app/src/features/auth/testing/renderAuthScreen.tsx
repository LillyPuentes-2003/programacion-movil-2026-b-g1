import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import '../../../locales/i18n'
import { DIContext } from '@core/di/DIContext'

import { AUTH_REPOSITORY_KEY, SESSION_STORAGE_KEY } from '../data/authProviders'
import type { AuthRepository } from '../domain/AuthRepository'
import type { SessionStorage } from '../domain/SessionStorage'

// Monta una pantalla de auth con sus dependencias falsas y una ruta de destino que muestra a dónde
// navegó al terminar.
export function renderAuthScreen(
  screen: ReactElement,
  path: string,
  deps: { repository: AuthRepository; storage: SessionStorage },
) {
  return render(
    <DIContext.Provider value={{ [AUTH_REPOSITORY_KEY]: deps.repository, [SESSION_STORAGE_KEY]: deps.storage }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={screen} />
          <Route path="*" element={<p>destino-navegado</p>} />
        </Routes>
      </MemoryRouter>
    </DIContext.Provider>,
  )
}
