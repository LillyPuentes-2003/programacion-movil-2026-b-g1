import type { ReactNode } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { IonRouterOutlet } from '@ionic/react'

import { routes } from './routes'

export interface PublicStackScreens {
  login: ReactNode
  signUp: ReactNode
  catalog: ReactNode
  serviceDetail: ReactNode
}

// Catálogo y auth, sin sesión (navigation.md): el catálogo se explora sin cuenta, es el gancho
// del producto. Las pantallas llegan por props para que core/ no importe features/
// (project-structure.md) — App.tsx es quien decide qué pantalla va en cada ruta.
export function PublicStack({ login, signUp, catalog, serviceDetail }: PublicStackScreens) {
  return (
    <IonRouterOutlet>
      <Route path={routes.login.path} element={login} />
      <Route path={routes.signUp.path} element={signUp} />
      <Route path={routes.catalog.path} element={catalog} />
      <Route path={routes.serviceDetail.path} element={serviceDetail} />
      <Route path="/" element={<Navigate to={routes.catalog.path} replace />} />
    </IonRouterOutlet>
  )
}
