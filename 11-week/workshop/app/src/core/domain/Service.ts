export type ServiceType =
  | 'traditional'
  | 'semi_permanent'
  | 'acrylic'
  | 'removal'
  | 'nail_art'
  | 'other'

export interface ServiceProfessional {
  id: string
  name: string
}

export interface ServiceBusiness {
  id: string
  name: string
  address: string
}

export interface Service {
  id: string
  name: string
  type: ServiceType
  description?: string
  priceCop: number
  durationMinutes: number
  imageUrl?: string
  isPublished?: boolean
  professional: ServiceProfessional
  business: ServiceBusiness
}
