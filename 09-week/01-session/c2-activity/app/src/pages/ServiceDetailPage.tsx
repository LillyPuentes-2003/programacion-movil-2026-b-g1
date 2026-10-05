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
  IonTitle,
  IonToolbar,
} from '@ionic/react'

import { ApiError, SERVICE_TYPE_LABELS, formatPrice, servicesApi, type Service } from '../api/servicesApi'

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadService = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setService(await servicesApi.getById(id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadService()
  }, [loadService])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/services" text="Volver" />
          </IonButtons>
          <IonTitle>Detalle del servicio</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}

        {!loading && error && (
          <IonCard color="danger">
            <IonCardContent>
              <p>{error}</p>
              <IonButton fill="outline" color="light" onClick={loadService}>
                Reintentar
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {!loading && service && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>{SERVICE_TYPE_LABELS[service.type]}</IonCardSubtitle>
              <IonCardTitle>{service.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="full">
                <IonItem>
                  <IonLabel>Precio</IonLabel>
                  <IonLabel slot="end">{formatPrice(service.price)}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Duración</IonLabel>
                  <IonLabel slot="end">{service.durationMinutes} min</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Código</IonLabel>
                  <IonLabel slot="end">#{service.id}</IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  )
}
