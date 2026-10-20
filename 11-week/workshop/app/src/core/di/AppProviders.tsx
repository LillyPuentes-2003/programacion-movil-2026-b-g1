import { useEffect, type PropsWithChildren } from 'react'

import { initDb } from '../storage/sqlite/client'
import type { Container } from './container'
import { DIContext } from './DIContext'

interface AppProvidersProps extends PropsWithChildren {
  container: Container
}

export function AppProviders({ container, children }: AppProvidersProps) {
  useEffect(() => {
    initDb().catch((error) => {
      console.error('No se pudo inicializar la base de datos local', error)
    })
  }, [])

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>
}
