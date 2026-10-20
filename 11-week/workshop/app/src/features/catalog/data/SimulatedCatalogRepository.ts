import type { Service, ServiceType } from '@core/domain/Service'
import { NotFoundError } from '@core/network/errors'

import type { CatalogQueryResult, CatalogRepository } from '../domain/CatalogRepository'

export type SimulationMode = 'off' | 'error' | 'empty' | 'demo'

export interface SimulationConfig {
  mode: SimulationMode
  delayMs: number
}

// Lee la simulación de `?simulate=error&delay=3000` en la URL o, si no viene, de
// VITE_SIMULATE y VITE_SIMULATE_DELAY_MS. Solo sirve para ver y probar los estados del catálogo
// (W11 CP3); con mode 'off' y delay 0 se usa el repositorio real sin cambios.
export function readSimulationConfig(search = window.location.search): SimulationConfig {
  const params = new URLSearchParams(search)
  const mode = (params.get('simulate') ?? import.meta.env.VITE_SIMULATE ?? 'off') as SimulationMode
  const delayMs = Number(params.get('delay') ?? import.meta.env.VITE_SIMULATE_DELAY_MS ?? 0)
  return { mode, delayMs: Number.isFinite(delayMs) ? delayMs : 0 }
}

const DEMO_SERVICES: Service[] = [
  {
    id: 'svc_demo_1',
    name: 'Manicure tradicional',
    type: 'traditional',
    priceCop: 25000,
    durationMinutes: 45,
    professional: { id: 'pro_demo_1', name: 'Diana' },
    business: { id: 'biz_demo_1', name: 'Uñas Bonitas Neiva', address: 'Cra. 5 # 10-20, Neiva' },
  },
  {
    id: 'svc_demo_2',
    name: 'Semipermanente con diseño',
    type: 'semi_permanent',
    priceCop: 45000,
    durationMinutes: 60,
    professional: { id: 'pro_demo_1', name: 'Diana' },
    business: { id: 'biz_demo_1', name: 'Uñas Bonitas Neiva', address: 'Cra. 5 # 10-20, Neiva' },
  },
  {
    id: 'svc_demo_3',
    name: 'Uñas acrílicas',
    type: 'acrylic',
    priceCop: 80000,
    durationMinutes: 120,
    professional: { id: 'pro_demo_2', name: 'Camila' },
    business: { id: 'biz_demo_2', name: 'Nail Studio Huila', address: 'Calle 8 # 4-15, Neiva' },
  },
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class SimulatedCatalogRepository implements CatalogRepository {
  constructor(
    private readonly real: CatalogRepository,
    private readonly config: SimulationConfig,
  ) {}

  async getPublishedServices(type?: ServiceType): Promise<CatalogQueryResult> {
    if (this.config.delayMs > 0) await wait(this.config.delayMs)

    switch (this.config.mode) {
      case 'error':
        throw new Error('Falla simulada del catálogo')
      case 'empty':
        return { items: [], isOffline: false }
      case 'demo':
        return { items: DEMO_SERVICES.filter((s) => !type || s.type === type), isOffline: false }
      default:
        return this.real.getPublishedServices(type)
    }
  }

  async getServiceDetail(serviceId: string) {
    if (this.config.delayMs > 0) await wait(this.config.delayMs)

    if (this.config.mode === 'error') throw new Error('Falla simulada del detalle')
    if (this.config.mode === 'demo') {
      const service = DEMO_SERVICES.find((s) => s.id === serviceId)
      if (!service) throw new NotFoundError('404')
      return { service, isOffline: false }
    }
    return this.real.getServiceDetail(serviceId)
  }
}
