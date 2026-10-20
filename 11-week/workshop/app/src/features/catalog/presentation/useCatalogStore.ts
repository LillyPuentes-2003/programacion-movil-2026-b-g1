import { create } from 'zustand'

import type { Service, ServiceType } from '@core/domain/Service'

import type { CatalogRepository } from '../domain/CatalogRepository'
import { getPublishedServices } from '../domain/getPublishedServices'

type CatalogStatus = 'loading' | 'loaded' | 'empty' | 'error'

interface CatalogStoreState {
  status: CatalogStatus
  items: Service[]
  selectedType?: ServiceType
  isOffline: boolean
  errorMessage?: string
  load: (repository: CatalogRepository, type?: ServiceType) => Promise<void>
}

export const useCatalogStore = create<CatalogStoreState>((set) => ({
  status: 'loading',
  items: [],
  selectedType: undefined,
  isOffline: false,
  errorMessage: undefined,
  load: async (repository, type) => {
    // Cambiar el filtro vuelve a loading sin borrar la lista anterior (catalog.md) — se
    // simplifica en esta pasada: si la sig. carga falla, sí se pierde lo que había en pantalla.
    set({ status: 'loading', selectedType: type })
    try {
      const { items, isOffline } = await getPublishedServices(repository, type)
      set({
        status: items.length === 0 ? 'empty' : 'loaded',
        items,
        isOffline,
        errorMessage: undefined,
      })
    } catch (error) {
      set({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
      })
    }
  },
}))
