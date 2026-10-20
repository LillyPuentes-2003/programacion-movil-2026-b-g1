import type { ReactNode } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { calendarOutline, personCircleOutline, storefrontOutline } from 'ionicons/icons'

import { routes } from './routes'

export interface PublicStackScreens {
  login: ReactNode
  signUp: ReactNode
  catalog: ReactNode
  serviceDetail: ReactNode
  myAppointments: ReactNode
}

// Pestañas abajo para las 3 secciones (W11 CP2): Servicios, Mis citas y Cuenta. El detalle del
// servicio se apila dentro de Servicios. Las pantallas llegan por props para que core/ no importe
// features/ (project-structure.md).
export function PublicStack({ login, signUp, catalog, serviceDetail, myAppointments }: PublicStackScreens) {
  const { t } = useTranslation()

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path={routes.login.path} element={login} />
        <Route path={routes.signUp.path} element={signUp} />
        <Route path={routes.catalog.path} element={catalog} />
        <Route path={routes.serviceDetail.path} element={serviceDetail} />
        <Route path={routes.myAppointments.path} element={myAppointments} />
        <Route path="/" element={<Navigate to={routes.catalog.path} replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="services" href={routes.catalog.path} aria-label={t('tabs.servicios')}>
          <IonIcon icon={storefrontOutline} aria-hidden="true" />
          <IonLabel>{t('tabs.servicios')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="my-appointments" href={routes.myAppointments.path} aria-label={t('tabs.citas')}>
          <IonIcon icon={calendarOutline} aria-hidden="true" />
          <IonLabel>{t('tabs.citas')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="account" href={routes.login.path} aria-label={t('tabs.cuenta')}>
          <IonIcon icon={personCircleOutline} aria-hidden="true" />
          <IonLabel>{t('tabs.cuenta')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
