import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'

import CitasPage from './pages/CitasPage'
import DetalleCitaPage from './pages/DetalleCitaPage'

/* CSS base de Ionic */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/text-alignment.css'

setupIonicReact()

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/citas" element={<CitasPage />} />
          <Route path="/citas/:id" element={<DetalleCitaPage />} />
          <Route path="/" element={<Navigate to="/citas" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}
