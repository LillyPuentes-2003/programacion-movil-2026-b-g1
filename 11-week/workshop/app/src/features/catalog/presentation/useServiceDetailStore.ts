import { create } from 'zustand'

import type { Service } from '@core/domain/Service'
import { GoneError, NotFoundError } from '@core/network/errors'

import type { CatalogRepository } from '../domain/CatalogRepository'
import { getServiceDetail } from '../domain/getServiceDetail'

type ServiceDetailStatus = 'loading' | 'loaded' | 'empty' | 'error'

interface ServiceDetailStoreState {
  status: ServiceDetailStatus
  service: Service | null
  isOffline: boolean
  errorMessage?: string
  load: (repository: CatalogRepository, servicioId: string) => Promise<void>
}

export const useServiceDetailStore = create<ServiceDetailStoreState>((set) => ({
  status: 'loading',
  service: null,
  isOffline: false,
  errorMessage: undefined,
  load: async (repository, servicioId) => {
    set({ status: 'loading' })
    try {
      const { service, isOffline } = await getServiceDetail(repository, servicioId)
      set({ status: 'loaded', service, isOffline, errorMessage: undefined })
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof GoneError) {
        set({ status: 'empty', service: null })
      } else {
        set({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
        })
      }
    }
  },
}))
