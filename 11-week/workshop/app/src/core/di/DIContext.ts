import { createContext, useContext } from 'react'

import type { Container } from './container'

export const DIContext = createContext<Container | null>(null)

export function useDI(): Container {
  const container = useContext(DIContext)
  if (!container) {
    throw new Error('useDI() debe usarse dentro de <AppProviders>')
  }
  return container
}
