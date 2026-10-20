import type { Service, ServiceType } from '@core/domain/Service'

interface ServiceDtoBase {
  id: string
  name: string
  type: string
  priceCop: number
  durationMinutes: number
  imageUrl?: string
  professional: { id: string; name: string }
  business: { id: string; name: string; address: string }
}

export type ServiceListItemDto = ServiceDtoBase

export interface ServiceDetailDto extends ServiceDtoBase {
  description: string
  isPublished: boolean
}

const KNOWN_TYPES: ServiceType[] = [
  'traditional',
  'semi_permanent',
  'acrylic',
  'removal',
  'nail_art',
  'other',
]

function toServiceType(type: string): ServiceType {
  return (KNOWN_TYPES as string[]).includes(type) ? (type as ServiceType) : 'other'
}

// catalog-list-services.md: un servicio con duración que no es múltiplo de 15 se descarta y
// se registra el dato inválido, no se adivina ni se redondea.
function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes > 0 && minutes % 15 === 0
}

export function mapServiceListItem(dto: ServiceListItemDto): Service | null {
  if (!isValidDuration(dto.durationMinutes)) {
    console.warn(`Servicio ${dto.id} descartado: duración inválida (${dto.durationMinutes})`)
    return null
  }

  return {
    id: dto.id,
    name: dto.name,
    type: toServiceType(dto.type),
    priceCop: dto.priceCop,
    durationMinutes: dto.durationMinutes,
    imageUrl: dto.imageUrl,
    professional: dto.professional,
    business: dto.business,
  }
}

export function mapServiceDetail(dto: ServiceDetailDto): Service | null {
  const base = mapServiceListItem(dto)
  if (!base) return null

  return {
    ...base,
    description: dto.description,
    isPublished: dto.isPublished,
  }
}
