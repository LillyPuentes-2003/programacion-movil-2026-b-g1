import { IonApp, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'

import { AppProviders } from '@core/di/AppProviders'
import type { Container } from '@core/di/container'
import { RootNavigator } from '@core/routing/RootNavigator'
import { AuthRepositoryImpl } from '@features/auth/data/AuthRepositoryImpl'
import { AUTH_REPOSITORY_KEY, SESSION_STORAGE_KEY } from '@features/auth/data/authProviders'
import { SecureSessionStorage } from '@features/auth/data/SecureSessionStorage'
import { LoginScreen } from '@features/auth/presentation/LoginScreen'
import { SessionRestorer } from '@features/auth/presentation/SessionRestorer'
import { SignUpScreen } from '@features/auth/presentation/SignUpScreen'
import { PantallaCarga } from '@shared/components/PantallaCarga'
import { CatalogRepositoryImpl } from '@features/catalog/data/CatalogRepositoryImpl'
import { CATALOG_REPOSITORY_KEY } from '@features/catalog/data/catalogRepositoryProvider'
import { CatalogScreen } from '@features/catalog/presentation/CatalogScreen'
import { ServiceDetailScreen } from '@features/catalog/presentation/ServiceDetailScreen'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Ionic Dark Mode */
import '@ionic/react/css/palettes/dark.system.css'

/* Theme variables */
import '@core/theme/variables.css'
import '@core/theme/tokens.css'

setupIonicReact()

// Composition root real (ADR-008): core/di solo define el contrato del contenedor, aquí es
// donde se registran las implementaciones concretas de cada feature.
const container: Container = {
  [AUTH_REPOSITORY_KEY]: new AuthRepositoryImpl(),
  [SESSION_STORAGE_KEY]: new SecureSessionStorage(),
  [CATALOG_REPOSITORY_KEY]: new CatalogRepositoryImpl(),
}

function App() {
  return (
    <IonApp>
      <AppProviders container={container}>
        <SessionRestorer />
        <IonReactRouter>
          <RootNavigator
            loading={<PantallaCarga />}
            login={<LoginScreen />}
            signUp={<SignUpScreen />}
            catalog={<CatalogScreen />}
            serviceDetail={<ServiceDetailScreen />}
          />
        </IonReactRouter>
      </AppProviders>
    </IonApp>
  )
}

export default App
