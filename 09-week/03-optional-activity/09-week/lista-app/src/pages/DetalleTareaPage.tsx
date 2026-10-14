import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { ApiError, obtenerTarea, TAREAS_LOCALES, type Tarea } from '../api/tareasApi'

// Segunda página: recibe el id por la URL (/tareas/:id).
export default function DetalleTareaPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [tarea, setTarea] = useState<Tarea | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerTarea(id)
      .then(setTarea)
      .catch((e: ApiError) => {
        // Sin API, se busca en la lista local
        const local = e.status === 0 ? TAREAS_LOCALES.find((t) => t.id === Number(id)) : undefined
        if (local) setTarea(local)
        else setError(e.status === 404 ? 'Esta tarea no existe.' : e.message)
      })
  }, [id])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tareas" text="Volver" />
          </IonButtons>
          <IonTitle>Detalle</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}
        {!tarea && !error && (
          <div className="ion-text-center">
            <IonSpinner />
          </div>
        )}
        {tarea && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Tarea #{tarea.id}</IonCardSubtitle>
              <IonCardTitle>{tarea.titulo}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonChip color={tarea.completada ? 'success' : 'warning'}>
                {tarea.completada ? 'Completada' : 'Pendiente'}
              </IonChip>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  )
}
