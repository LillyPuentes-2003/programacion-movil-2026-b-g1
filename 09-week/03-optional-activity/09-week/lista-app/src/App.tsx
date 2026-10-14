import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'

import ListaTareasPage from './pages/ListaTareasPage'
import DetalleTareaPage from './pages/DetalleTareaPage'

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
          <Route path="/tareas" element={<ListaTareasPage />} />
          <Route path="/tareas/:id" element={<DetalleTareaPage />} />
          <Route path="/" element={<Navigate to="/tareas" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}
