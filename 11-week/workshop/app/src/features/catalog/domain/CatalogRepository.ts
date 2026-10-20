import type { Service, ServiceType } from '@core/domain/Service'

export interface CatalogQueryResult {
  items: Service[]
  isOffline: boolean
}

export interface CatalogRepository {
  getPublishedServices(type?: ServiceType): Promise<CatalogQueryResult>
  getServiceDetail(servicioId: string): Promise<{ service: Service; isOffline: boolean }>
}
