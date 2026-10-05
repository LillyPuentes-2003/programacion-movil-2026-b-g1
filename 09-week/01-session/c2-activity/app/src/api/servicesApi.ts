// Cliente HTTP de la entidad Service. Usa fetch nativo y traduce
// los fallos a ApiError con un mensaje listo para mostrar al usuario.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type ServiceType = 'traditional' | 'semi_permanent' | 'acrylic' | 'removal' | 'nail_art'

export interface Service {
  id: number
  name: string
  type: ServiceType
  price: number
  durationMinutes: number
}

export type NewService = Omit<Service, 'id'>

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  traditional: 'Tradicional',
  semi_permanent: 'Semipermanente',
  acrylic: 'Acrílico',
  removal: 'Retiro',
  nail_art: 'Nail art',
}

export class ApiError extends Error {
  constructor(
    message: string,
    /** 0 = no hubo respuesta (error de red / API apagada) */
    public status: number,
    /** Errores por campo que devuelve el POST con 400 */
    public fieldErrors: Record<string, string> = {}
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    // fetch solo lanza cuando no hay respuesta: servidor apagado, sin internet, CORS, etc.
    throw new ApiError('No se pudo conectar con el servidor. Verifica que la API esté encendida.', 0)
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.message ?? `Error ${res.status} del servidor.`, res.status, body?.errors ?? {})
  }
  return body as T
}

export const servicesApi = {
  list: () => request<Service[]>('/api/services'),
  getById: (id: string) => request<Service>(`/api/services/${encodeURIComponent(id)}`),
  create: (data: NewService) =>
    request<Service>('/api/services', { method: 'POST', body: JSON.stringify(data) }),
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
