import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { ApiError, citasApi, formatearFecha, type Cita } from '../api/citasApi'

export default function DetalleCitaPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [cita, setCita] = useState<Cita | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const cargar = useCallback(() => {
    setError(null)
    setCita(null)
    citasApi
      .obtener(id)
      .then(setCita)
      .catch((e) => setError(e instanceof ApiError ? e : new ApiError('Ocurrió un error inesperado.', -1)))
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/citas" text="Citas" />
          </IonButtons>
          <IonTitle>Detalle de la cita</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {!cita && !error && (
          <div className="ion-text-center">
            <IonSpinner />
          </div>
        )}

        {error && (
          <IonCard color="light">
            <IonCardContent>
              <IonText color="danger">
                <p>{error.status === 404 ? 'Esta cita no existe.' : error.message}</p>
              </IonText>
              {/* Solo tiene sentido reintentar si fue un problema de red */}
              {error.status === 0 && (
                <IonButton size="small" onClick={cargar}>
                  Reintentar
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {cita && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Cita #{cita.id}</IonCardSubtitle>
              <IonCardTitle>{cita.cliente}</IonCardTitle>
            </IonCardHeader>
            <IonList lines="full">
              <IonItem>
                <IonLabel>Servicio</IonLabel>
                <IonText slot="end">{cita.servicio}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Fecha</IonLabel>
                <IonText slot="end">{formatearFecha(cita.fecha)}</IonText>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>Hora</IonLabel>
                <IonText slot="end">{cita.hora}</IonText>
              </IonItem>
            </IonList>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  )
}
