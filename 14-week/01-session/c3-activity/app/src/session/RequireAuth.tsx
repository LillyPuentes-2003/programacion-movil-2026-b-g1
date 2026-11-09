import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { IonContent, IonPage, IonSpinner } from '@ionic/react'

import { useSession } from './SessionContext'

/** Protege una pantalla: sin sesión redirige a /login recordando a dónde iba. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const location = useLocation()

  if (session.status === 'loading') {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner name="crescent" />
          <p>Restaurando sesión…</p>
        </IonContent>
      </IonPage>
    )
  }

  if (session.status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
