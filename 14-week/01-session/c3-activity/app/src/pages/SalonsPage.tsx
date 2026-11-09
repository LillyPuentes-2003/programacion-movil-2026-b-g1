import { useCallback, useEffect, useState } from 'react'
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import type { RefresherEventDetail } from '@ionic/react'
import { cloudOfflineOutline, locateOutline, logOutOutline, warningOutline } from 'ionicons/icons'

import OfflineBanner from '../components/OfflineBanner'
import { salonsApi, type Coords, type Salon } from '../core/api'
import { ApiError } from '../core/apiClient'
import { getCurrentCoords, getPermissionState, LocationError, type LocationPermission } from '../core/location'
import { useSession } from '../session/SessionContext'

// Los tres estados de la pantalla (carga / datos / error) en un solo tipo:
// así nunca se muestran dos a la vez.
const formatDistance = (km: number) => (km < 0.1 ? 'a menos de 100 m' : `${km} km`)

type DataState =
  | { status: 'loading'; message: string }
  | { status: 'success'; salons: Salon[] }
  | { status: 'error'; offline: boolean; message: string }

export default function SalonsPage() {
  const { session, logout } = useSession()
  const userName = session.status === 'authenticated' ? session.user.name : ''

  const [data, setData] = useState<DataState>({ status: 'loading', message: 'Cargando salones…' })
  const [coords, setCoords] = useState<Coords | null>(null)
  const [permission, setPermission] = useState<LocationPermission>('unknown')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  const loadSalons = useCallback(async (withCoords: Coords | null) => {
    setData({ status: 'loading', message: 'Cargando salones…' })
    try {
      const salons = await salonsApi.list(withCoords ?? undefined)
      setData({ status: 'success', salons })
    } catch (err) {
      // 401: el cliente HTTP ya cerró la sesión y RequireAuth redirige al login.
      if (err instanceof ApiError && err.kind === 'unauthorized') return
      setData({
        status: 'error',
        offline: err instanceof ApiError && err.kind === 'offline',
        message: err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.',
      })
    }
  }, [])

  useEffect(() => {
    void loadSalons(null)
    void getPermissionState().then(setPermission)
  }, [loadSalons])

  const useMyLocation = async () => {
    setLocating(true)
    setLocationError(null)
    try {
      const current = await getCurrentCoords()
      setPermission('granted')
      setCoords(current)
      await loadSalons(current)
    } catch (err) {
      if (err instanceof LocationError) {
        if (err.kind === 'denied') setPermission('denied')
        setLocationError(err.message)
      } else {
        setLocationError('No se pudo obtener tu ubicación.')
      }
    } finally {
      setLocating(false)
    }
  }

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadSalons(coords)
    event.detail.complete()
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Salones cercanos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => void logout()} aria-label="Cerrar sesión">
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <OfflineBanner />
        <p>Hola, {userName}.</p>

        {/* ---------- Plugin GPS + permisos ---------- */}
        {!coords && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Ordenar por cercanía</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {permission === 'denied' ? (
                <div className="permission-denied" role="alert">
                  <p>
                    <IonIcon icon={warningOutline} aria-hidden="true" /> El permiso de ubicación está bloqueado.
                    Actívalo en Ajustes › Aplicaciones › ManiCita › Permisos (o en el candado de la barra del
                    navegador) y vuelve a intentarlo. Mientras tanto ves todos los salones sin ordenar.
                  </p>
                </div>
              ) : (
                <p>
                  Usamos tu ubicación solo en esta pantalla, para calcular qué salones están más cerca. No se guarda.
                </p>
              )}
              {locationError && permission !== 'denied' && (
                <IonText color="danger" role="alert">
                  <p>{locationError}</p>
                </IonText>
              )}
              <IonButton expand="block" onClick={useMyLocation} disabled={locating}>
                {locating ? (
                  <IonSpinner name="dots" aria-label="Obteniendo ubicación" />
                ) : (
                  <>
                    <IonIcon slot="start" icon={locateOutline} />
                    {permission === 'denied' ? 'Ya lo activé, reintentar' : 'Usar mi ubicación'}
                  </>
                )}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {coords && data.status === 'success' && (
          <IonText color="medium">
            <p>Ordenados del más cercano al más lejano según tu ubicación actual.</p>
          </IonText>
        )}

        {/* ---------- Estado: carga ---------- */}
        {data.status === 'loading' && (
          <div className="ion-text-center ion-padding" role="status">
            <IonSpinner name="crescent" />
            <p>{data.message}</p>
          </div>
        )}

        {/* ---------- Estado: error ---------- */}
        {data.status === 'error' && (
          <IonCard color={data.offline ? 'medium' : 'danger'} role="alert">
            <IonCardContent>
              {data.offline && <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />}
              <p>{data.message}</p>
              <IonButton fill="outline" color="light" onClick={() => void loadSalons(coords)}>
                Reintentar
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* ---------- Estado: datos (y vacío) ---------- */}
        {data.status === 'success' && data.salons.length === 0 && (
          <IonText color="medium">
            <p>Todavía no hay salones registrados.</p>
          </IonText>
        )}

        {data.status === 'success' && data.salons.length > 0 && (
          <IonList inset>
            {data.salons.map((salon) => (
              <IonItem key={salon.id}>
                <IonLabel>
                  <h3>{salon.name}</h3>
                  <p>{salon.address}</p>
                </IonLabel>
                {salon.distanceKm !== undefined && <IonNote slot="end">{formatDistance(salon.distanceKm)}</IonNote>}
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  )
}
