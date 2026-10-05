import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'

import ServiceListPage from './pages/ServiceListPage'
import ServiceDetailPage from './pages/ServiceDetailPage'

/* CSS base de Ionic */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

setupIonicReact()

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/services" element={<ServiceListPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/" element={<Navigate to="/services" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}
