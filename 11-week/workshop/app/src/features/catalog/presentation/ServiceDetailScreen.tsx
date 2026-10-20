import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonSkeletonText,
  IonToolbar,
  useIonToast,
} from '@ionic/react'

import { routes } from '@core/routing/routes'
import { useSessionStore } from '@core/session/useSessionStore'

import { BotonPrimario } from '@shared/components/BotonPrimario'
import { EstadoVacio } from '@shared/components/EstadoVacio'

import { useCatalogRepository } from '../data/catalogRepositoryProvider'
import { useServiceDetailStore } from './useServiceDetailStore'

export function ServiceDetailScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { serviceId } = useParams<{ serviceId: string }>()
  const repository = useCatalogRepository()
  const { status, service, isOffline, load } = useServiceDetailStore()
  const sessionStatus = useSessionStore((state) => state.status)
  const [presentToast] = useIonToast()

  useEffect(() => {
    if (!serviceId) return
    load(repository, serviceId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  async function handleCopyAddress(address: string) {
    await navigator.clipboard.writeText(address)
    presentToast({ message: t('servicio.detalle.direccionCopiada'), duration: 1500, position: 'top' })
  }

  // Sin sesión se pide iniciarla y luego se vuelve a este mismo detalle (W11 CP7). La pantalla
  // de agendar llega con HU-15; mientras tanto se avisa en vez de abrir una ruta vacía.
  function handleBook(serviceId: string) {
    if (sessionStatus !== 'authenticated') {
      navigate(routes.login.path, { state: { from: routes.serviceDetail.build(serviceId) } })
      return
    }
    presentToast({ message: t('servicio.detalle.agendarPronto'), duration: 2500, position: 'top' })
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={routes.catalog.path} text="" aria-label="Volver al catálogo" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mc-content-bg">
        {status === 'loading' && (
          <div style={{ padding: 'var(--space-lg)' }}>
            <IonSkeletonText animated style={{ height: '168px', borderRadius: 'var(--radius-md)' }} />
            <IonSkeletonText animated style={{ width: '70%', height: '1.4rem' }} />
            <IonSkeletonText animated style={{ width: '40%' }} />
          </div>
        )}

        {status === 'loaded' && service && (
          <>
            <div
              style={{
                height: 168,
                background: 'var(--color-brand-soft)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {service.imageUrl && (
                <img
                  src={service.imageUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            <div style={{ padding: 'var(--space-lg)' }}>
              <h1 className="mc-text-title" style={{ margin: '0 0 6px' }}>
                {service.name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  marginBottom: 'var(--space-md)',
                }}
              >
                <span style={{ font: '700 1.375rem/1.2 var(--ion-font-family)', color: 'var(--color-brand)' }}>
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                  }).format(service.priceCop)}
                </span>
                <span className="mc-text-caption">{service.durationMinutes} minutos</span>
              </div>
              {service.description && <p className="mc-text-body">{service.description}</p>}
            </div>

            <div className="mc-rowline">
              <span className="mc-text-caption">Atiende</span>
              <span className="mc-text-body">{service.professional.name}</span>
            </div>
            <div className="mc-rowline">
              <span className="mc-text-caption">Salón</span>
              <span className="mc-text-body">{service.business.name}</span>
            </div>
            <div className="mc-rowline">
              <span className="mc-text-caption">Dirección</span>
              <button
                className="mc-text-body"
                style={{ background: 'none', border: 0, padding: 0, minHeight: 'var(--touch-target)', color: 'var(--color-brand)' }}
                aria-label={`Copiar dirección: ${service.business.address}`}
                onClick={() => handleCopyAddress(service.business.address)}
              >
                {service.business.address}
              </button>
            </div>

            {isOffline && (
              <div className="mc-banner">{t('catalogo.offline', { fecha: '' })}</div>
            )}
          </>
        )}

        {status === 'notFound' && (
          <EstadoVacio
            icon="🔍"
            title={t('servicio.detalle.tituloNoEncontrado')}
            message={t('servicio.detalle.mensajeNoEncontrado')}
            actionLabel={t('servicio.detalle.accionVolver')}
            onAction={() => navigate(routes.catalog.path)}
          />
        )}

        {status === 'gone' && (
          <EstadoVacio
            icon="🚫"
            title={t('servicio.detalle.tituloNoDisponible')}
            message={t('servicio.detalle.mensajeNoDisponible')}
            actionLabel={t('servicio.detalle.accionVolver')}
            onAction={() => navigate(routes.catalog.path)}
          />
        )}

        {status === 'error' && (
          <EstadoVacio
            icon="⚠️"
            title={t('servicio.detalle.tituloError')}
            message={t('servicio.detalle.mensajeError')}
            actionLabel={t('servicio.detalle.reintentar')}
            onAction={() => serviceId && load(repository, serviceId)}
          />
        )}
      </IonContent>
      {status === 'loaded' && service && (
        <IonFooter className="ion-no-border" style={{ padding: 'var(--space-md) var(--space-lg) var(--space-lg)' }}>
          <BotonPrimario
            label={t('servicio.detalle.agendar')}
            onPress={() => handleBook(service.id)}
            isDisabled={isOffline}
            disabledReason={isOffline ? t('servicio.detalle.sinConexionAgendar') : undefined}
          />
        </IonFooter>
      )}
    </IonPage>
  )
}
