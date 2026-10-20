import type { Service } from '@core/domain/Service'
import type { CatalogRepository } from './CatalogRepository'

export function getServiceDetail(
  repository: CatalogRepository,
  servicioId: string,
): Promise<{ service: Service; isOffline: boolean }> {
  return repository.getServiceDetail(servicioId)
}
