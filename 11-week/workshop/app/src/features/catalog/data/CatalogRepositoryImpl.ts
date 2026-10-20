import { and, eq } from 'drizzle-orm'

import type { Service, ServiceType } from '@core/domain/Service'
import { httpClient } from '@core/network/httpClient'
import { requestProfiles } from '@core/network/requestProfiles'
import { GoneError, NotFoundError } from '@core/network/errors'
import { getDb } from '@core/storage/sqlite/client'
import { businesses, professionals, services } from '@core/storage/sqlite/schema'

import type { CatalogQueryResult, CatalogRepository } from '../domain/CatalogRepository'
import { mapServiceDetail, mapServiceListItem, type ServiceDetailDto, type ServiceListItemDto } from './dto'

interface ListResponseDto {
  items: ServiceListItemDto[]
  page: number
  totalPages: number
}

// Simplificación de esta primera pasada (funcional, sin la bateria de pruebas todavía): se
// intenta red primero y se cae al caché local solo si la red falla, en vez del read-through
// completo (mostrar caché de inmediato + refrescar en segundo plano) que describe catalog.md.
// Tampoco se envuelven las tres tablas en una transacción real todavía.
export class CatalogRepositoryImpl implements CatalogRepository {
  async getPublishedServices(type?: ServiceType): Promise<CatalogQueryResult> {
    try {
      const { data } = await httpClient.get<ListResponseDto>('/services', {
        params: type ? { type } : undefined,
        timeout: requestProfiles.reads.timeout,
      })

      const items = data.items
        .map(mapServiceListItem)
        .filter((service): service is Service => service !== null)

      await this.cacheServices(items)

      return { items, isOffline: false }
    } catch (error) {
      const cached = await this.readCachedServices(type)
      if (cached.length > 0) {
        return { items: cached, isOffline: true }
      }
      throw error
    }
  }

  async getServiceDetail(serviceId: string): Promise<{ service: Service; isOffline: boolean }> {
    try {
      const { data } = await httpClient.get<ServiceDetailDto>(`/services/${serviceId}`, {
        timeout: requestProfiles.reads.timeout,
      })

      const service = mapServiceDetail(data)
      if (!service) {
        throw new Error(`Servicio ${serviceId} tiene datos inválidos`)
      }

      await this.cacheServices([service])
      return { service, isOffline: false }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof GoneError) {
        throw error
      }

      const cached = await this.readCachedService(serviceId)
      if (cached) {
        return { service: cached, isOffline: true }
      }
      throw error
    }
  }

  private async cacheServices(items: Service[]): Promise<void> {
    let db
    try {
      db = getDb()
    } catch {
      return
    }

    const timestamp = Date.now()

    for (const item of items) {
      await db
        .insert(businesses)
        .values({
          id: item.business.id,
          name: item.business.name,
          address: item.business.address,
          createdAt: timestamp,
          updatedAt: timestamp,
          cachedAt: timestamp,
        })
        .onConflictDoUpdate({
          target: businesses.id,
          set: { name: item.business.name, address: item.business.address, updatedAt: timestamp, cachedAt: timestamp },
        })

      await db
        .insert(professionals)
        .values({
          id: item.professional.id,
          name: item.professional.name,
          businessId: item.business.id,
          createdAt: timestamp,
          updatedAt: timestamp,
          cachedAt: timestamp,
        })
        .onConflictDoUpdate({
          target: professionals.id,
          set: { name: item.professional.name, businessId: item.business.id, updatedAt: timestamp, cachedAt: timestamp },
        })

      await db
        .insert(services)
        .values({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description ?? null,
          priceCop: item.priceCop,
          durationMinutes: item.durationMinutes,
          imageUrl: item.imageUrl ?? null,
          isPublished: item.isPublished === false ? 0 : 1,
          businessId: item.business.id,
          professionalId: item.professional.id,
          createdAt: timestamp,
          updatedAt: timestamp,
          cachedAt: timestamp,
        })
        .onConflictDoUpdate({
          target: services.id,
          set: {
            name: item.name,
            type: item.type,
            description: item.description ?? null,
            priceCop: item.priceCop,
            durationMinutes: item.durationMinutes,
            imageUrl: item.imageUrl ?? null,
            isPublished: item.isPublished === false ? 0 : 1,
            updatedAt: timestamp,
            cachedAt: timestamp,
          },
        })
    }
  }

  private async readCachedServices(type?: ServiceType): Promise<Service[]> {
    let db
    try {
      db = getDb()
    } catch {
      return []
    }

    try {
      const rows = await db
        .select({
          id: services.id,
          name: services.name,
          type: services.type,
          priceCop: services.priceCop,
          durationMinutes: services.durationMinutes,
          imageUrl: services.imageUrl,
          professionalId: professionals.id,
          professionalName: professionals.name,
          businessId: businesses.id,
          businessName: businesses.name,
          businessAddress: businesses.address,
        })
        .from(services)
        .innerJoin(professionals, eq(services.professionalId, professionals.id))
        .innerJoin(businesses, eq(services.businessId, businesses.id))
        .where(
          type
            ? and(eq(services.isPublished, 1), eq(services.type, type))
            : eq(services.isPublished, 1),
        )

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type as ServiceType,
        priceCop: row.priceCop,
        durationMinutes: row.durationMinutes,
        imageUrl: row.imageUrl ?? undefined,
        professional: { id: row.professionalId, name: row.professionalName },
        business: { id: row.businessId, name: row.businessName, address: row.businessAddress },
      }))
    } catch {
      return []
    }
  }

  private async readCachedService(serviceId: string): Promise<Service | null> {
    const rows = await this.readCachedServicesById(serviceId)
    return rows[0] ?? null
  }

  private async readCachedServicesById(serviceId: string): Promise<Service[]> {
    let db
    try {
      db = getDb()
    } catch {
      return []
    }

    try {
      const rows = await db
        .select({
          id: services.id,
          name: services.name,
          type: services.type,
          description: services.description,
          priceCop: services.priceCop,
          durationMinutes: services.durationMinutes,
          imageUrl: services.imageUrl,
          isPublished: services.isPublished,
          professionalId: professionals.id,
          professionalName: professionals.name,
          businessId: businesses.id,
          businessName: businesses.name,
          businessAddress: businesses.address,
        })
        .from(services)
        .innerJoin(professionals, eq(services.professionalId, professionals.id))
        .innerJoin(businesses, eq(services.businessId, businesses.id))
        .where(eq(services.id, serviceId))

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type as ServiceType,
        description: row.description ?? undefined,
        priceCop: row.priceCop,
        durationMinutes: row.durationMinutes,
        imageUrl: row.imageUrl ?? undefined,
        isPublished: row.isPublished === 1,
        professional: { id: row.professionalId, name: row.professionalName },
        business: { id: row.businessId, name: row.businessName, address: row.businessAddress },
      }))
    } catch {
      return []
    }
  }
}
