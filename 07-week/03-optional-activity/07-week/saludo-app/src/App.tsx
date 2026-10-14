import { IonApp, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, setupIonicReact } from '@ionic/react'
import Saludo from './components/Saludo'

/* CSS base de Ionic */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'

setupIonicReact()

export default function App() {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Semana 7 · Saludo</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {/* El mismo componente, usado dos veces con props distintas */}
          <Saludo nombre="Lilly" rol="Estudiante de Programación Móvil" />
          <Saludo nombre="Lizeth" />
        </IonContent>
      </IonPage>
    </IonApp>
  )
}
