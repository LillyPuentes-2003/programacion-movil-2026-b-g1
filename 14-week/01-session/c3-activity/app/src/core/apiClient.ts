// Cliente HTTP único de la app. Responsabilidades:
//  1. Añadir "Authorization: Bearer <token>" a las peticiones protegidas.
//  2. Traducir cualquier fallo a un ApiError con un "kind" que la UI sabe mostrar.
//  3. Avisar a la sesión cuando la API responde 401 en una ruta protegida.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type ApiErrorKind =
  | 'offline' // el dispositivo no tiene red
  | 'network' // hay red, pero el servidor no respondió (apagado, URL mala, CORS)
  | 'timeout' // el servidor tardó más de lo permitido
  | 'unauthorized' // 401 en una ruta protegida: token ausente, inválido o expirado
  | 'http' // cualquier otra respuesta 4xx/5xx

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status = 0,
    /** Código estable que envía la API, p. ej. TOKEN_EXPIRED o INVALID_CREDENTIALS */
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiClientConfig {
  getToken: () => string | null
  onUnauthorized: (error: ApiError) => void
}

let config: ApiClientConfig = { getToken: () => null, onUnauthorized: () => {} }

/** La sesión registra aquí de dónde sale el token y qué hacer ante un 401. */
export function configureApiClient(next: ApiClientConfig) {
  config = next
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  /** true = ruta protegida: envía el token y trata el 401 como sesión expirada */
  auth?: boolean
  timeoutMs?: number
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, timeoutMs = 10_000 } = options

  // Sin red no tiene sentido intentar: se responde de inmediato con un mensaje claro.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError('offline', 'Sin conexión a internet. Revisa tu red e inténtalo de nuevo.')
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = config.getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ApiError('timeout', 'El servidor tardó demasiado en responder. Inténtalo de nuevo.')
    }
    // fetch solo lanza cuando no hubo respuesta: servidor apagado, URL equivocada, CORS…
    throw new ApiError('network', 'No se pudo conectar con el servidor. Verifica que la API esté encendida.')
  } finally {
    clearTimeout(timer)
  }

  const data = await res.json().catch(() => null)

  if (res.status === 401 && auth) {
    const error = new ApiError(
      'unauthorized',
      data?.message ?? 'Tu sesión expiró. Inicia sesión de nuevo.',
      401,
      data?.code
    )
    config.onUnauthorized(error)
    throw error
  }

  if (!res.ok) {
    throw new ApiError('http', data?.message ?? `Error ${res.status} del servidor.`, res.status, data?.code)
  }

  return data as T
}
