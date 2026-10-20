import { useTranslation } from 'react-i18next'
import { IonContent, IonPage, IonSpinner } from '@ionic/react'

// Lo que se ve mientras la app decide si hay sesión (auth.md: SessionState en `unknown`). Existe
// para que una usuaria con sesión nunca vea un parpadeo del login al abrir la app.
export function PantallaCarga() {
  const { t } = useTranslation()

  return (
    <IonPage>
      <IonContent className="mc-content-bg">
        <div className="mc-splash" role="status" aria-live="polite">
          <span className="mc-text-display mc-splash-brand">ManiCita</span>
          <IonSpinner name="crescent" aria-hidden="true" />
          <span className="mc-visually-hidden">{t('app.cargando')}</span>
        </div>
      </IonContent>
    </IonPage>
  )
}
