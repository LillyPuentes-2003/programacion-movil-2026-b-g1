import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'

interface PlaceholderScreenProps {
  title: string
}

// Pantalla en blanco temporal: prueba que el routing de la Fase 0 navega correctamente. Cada una
// se reemplaza por la pantalla real de su feature en la fase que le corresponde.
export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{title}</IonContent>
    </IonPage>
  )
}
