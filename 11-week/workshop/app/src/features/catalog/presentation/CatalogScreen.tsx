import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
  type RefresherEventDetail,
} from '@ionic/react'

import type { ServiceType } from '@core/domain/Service'
import { routes } from '@core/routing/routes'
import { EstadoVacio } from '@shared/components/EstadoVacio'
import { TarjetaServicio } from '@shared/components/TarjetaServicio'
import { TarjetaServicioSkeleton } from '@shared/components/TarjetaServicioSkeleton'

import { useCatalogRepository } from '../data/catalogRepositoryProvider'
import { useCatalogStore } from './useCatalogStore'

const FILTER_TYPES: ServiceType[] = [
  'traditional',
  'semi_permanent',
  'acrylic',
  'removal',
  'nail_art',
]

export function CatalogScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const repository = useCatalogRepository()
  const { status, items, selectedType, isOffline, load } = useCatalogStore()

  useEffect(() => {
    load(repository)
    // Solo al montar: cambiar de filtro dispara su propia carga desde el chip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilterPress(type: ServiceType | undefined) {
    load(repository, type)
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    load(repository, selectedType).finally(() => event.detail.complete())
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="mc-text-display" style={{ padding: '0 var(--space-lg)' }}>
            {t('catalogo.titulo')}
          </div>
        </IonToolbar>
        <div className="mc-chip-row">
          <button
            className="mc-chip"
            aria-pressed={!selectedType}
            onClick={() => handleFilterPress(undefined)}
          >
            Todos
          </button>
          {FILTER_TYPES.map((type) => (
            <button
              key={type}
              className="mc-chip"
              aria-pressed={selectedType === type}
              onClick={() => handleFilterPress(type)}
            >
              {t(`catalogo.filtro.${type}`)}
            </button>
          ))}
        </div>
      </IonHeader>
      <IonContent className="mc-content-bg">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isOffline && status === 'loaded' && (
          <div className="mc-banner">{t('catalogo.offline', { fecha: '' })}</div>
        )}

        {status === 'loading' && (
          <div style={{ paddingTop: 'var(--space-sm)' }}>
            <TarjetaServicioSkeleton />
            <TarjetaServicioSkeleton />
            <TarjetaServicioSkeleton />
          </div>
        )}

        {status === 'loaded' && (
          <div style={{ paddingTop: 'var(--space-sm)' }}>
            {items.map((service) => (
              <TarjetaServicio
                key={service.id}
                name={service.name}
                priceCop={service.priceCop}
                durationMinutes={service.durationMinutes}
                salonName={service.business.name}
                imageUrl={service.imageUrl}
                onPress={() => navigate(routes.serviceDetail.build(service.id))}
              />
            ))}
          </div>
        )}

        {status === 'empty' && selectedType && (
          <EstadoVacio
            icon="🤷"
            title={t('catalogo.vacioFiltro.titulo')}
            message={t('catalogo.vacioFiltro.mensaje')}
            actionLabel={t('catalogo.vacioFiltro.accion')}
            onAction={() => load(repository, undefined)}
          />
        )}

        {status === 'empty' && !selectedType && (
          <EstadoVacio
            icon="🔎"
            title={t('catalogo.vacio.titulo')}
            message={t('catalogo.vacio.mensaje')}
            actionLabel={typeof navigator.share === 'function' ? t('catalogo.vacio.accion') : undefined}
            onAction={
              typeof navigator.share === 'function'
                ? () => navigator.share({ title: 'ManiCita', url: window.location.origin })
                : undefined
            }
          />
        )}

        {status === 'error' && (
          <EstadoVacio
            icon="⚠️"
            title={t('catalogo.error.titulo')}
            message={t('catalogo.error.mensaje')}
            actionLabel={t('catalogo.error.reintentar')}
            onAction={() => load(repository, selectedType)}
          />
        )}
      </IonContent>
    </IonPage>
  )
}
