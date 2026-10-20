import { useDI } from '@core/di/DIContext'

import type { CatalogRepository } from '../domain/CatalogRepository'

// Cómo la presentación de esta feature obtiene su repositorio: App.tsx lo registra con esta
// misma clave al construir el contenedor de DI (composition root, ADR-008).
export const CATALOG_REPOSITORY_KEY = 'catalogRepository'

export function useCatalogRepository(): CatalogRepository {
  const container = useDI()
  const repository = container[CATALOG_REPOSITORY_KEY] as CatalogRepository | undefined
  if (!repository) {
    throw new Error('CatalogRepository no está registrado en el contenedor de DI')
  }
  return repository
}
