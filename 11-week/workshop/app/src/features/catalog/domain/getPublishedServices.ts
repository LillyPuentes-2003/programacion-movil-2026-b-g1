import type { ServiceType } from '@core/domain/Service'
import type { CatalogRepository, CatalogQueryResult } from './CatalogRepository'

export function getPublishedServices(
  repository: CatalogRepository,
  type?: ServiceType,
): Promise<CatalogQueryResult> {
  return repository.getPublishedServices(type)
}
