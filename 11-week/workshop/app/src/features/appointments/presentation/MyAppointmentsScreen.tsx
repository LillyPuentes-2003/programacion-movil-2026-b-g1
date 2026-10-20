import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react'

import { routes } from '@core/routing/routes'
import { EstadoVacio } from '@shared/components/EstadoVacio'

// Pestaña "Mis citas": la lista real llega con HU-16. Mientras tanto la pestaña existe para que la
// navegación quede completa y lleve a iniciar sesión.
export function MyAppointmentsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <h1 className="mc-text-display" style={{ padding: '0 var(--space-lg)', margin: 0 }}>
            {t('misCitas.titulo')}
          </h1>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mc-content-bg">
        <EstadoVacio
          icon="📅"
          title={t('misCitas.sinSesion.titulo')}
          message={t('misCitas.sinSesion.mensaje')}
          actionLabel={t('misCitas.sinSesion.accion')}
          onAction={() => navigate(routes.login.path)}
        />
      </IonContent>
    </IonPage>
  )
}
