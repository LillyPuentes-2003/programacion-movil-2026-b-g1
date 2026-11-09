import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import SalonsPage from './pages/SalonsPage'
import RequireAuth from './session/RequireAuth'
import { SessionProvider } from './session/SessionContext'

/* CSS base de Ionic */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import './theme.css'

setupIonicReact()

// Navegación: /login (pública) → /salons (protegida). Cualquier otra ruta va a /salons,
// y si no hay sesión RequireAuth redirige a /login.
export default function App() {
  return (
    <IonApp>
      <SessionProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/salons"
              element={
                <RequireAuth>
                  <SalonsPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/salons" replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </SessionProvider>
    </IonApp>
  )
}
