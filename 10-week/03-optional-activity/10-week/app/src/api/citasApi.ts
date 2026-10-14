// Cliente HTTP de la entidad Cita. Usa fetch nativo y traduce
// los fallos a ApiError con un mensaje listo para mostrar.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface Cita {
  id: number
  cliente: string
  servicio: string
  fecha: string // AAAA-MM-DD
  hora: string // HH:MM
}

export type NuevaCita = Omit<Cita, 'id'>

export class ApiError extends Error {
  constructor(
    message: string,
    /** 0 = no hubo respuesta (API apagada, sin internet) */
    public status: number,
    /** Errores por campo que devuelve el POST con 400 / 409 */
    public errores: Record<string, string> = {}
  ) {
    super(message)
  }
}

// Si la API no responde en 8 s, se cancela la petición (red lenta o caída).
const TIEMPO_MAXIMO_MS = 8000

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new ApiError('La API tardó demasiado en responder. Intenta de nuevo.', 0)
    }
    throw new ApiError('Sin conexión con el servidor. Verifica que la API esté encendida.', 0)
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.mensaje ?? `Error ${res.status} del servidor.`, res.status, body?.errores ?? {})
  }
  return body as T
}

export const citasApi = {
  listar: () => pedir<Cita[]>('/api/citas'),
  obtener: (id: string) => pedir<Cita>(`/api/citas/${encodeURIComponent(id)}`),
  crear: (datos: NuevaCita) => pedir<Cita>('/api/citas', { method: 'POST', body: JSON.stringify(datos) }),
  servicios: () => pedir<string[]>('/api/servicios'),
}

// 2026-10-20 → «martes, 20 de octubre»
export const formatearFecha = (fecha: string) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
