// Mismas funciones fetch de la semana 8, ahora en TypeScript.
// Si la API no está encendida, la pantalla usa la lista local de respaldo.

export const API_URL = 'http://localhost:3000'

export interface Tarea {
  id: number
  titulo: string
  completada: boolean
}

export class ApiError extends Error {
  /** status 0 = no hubo respuesta (API apagada o sin internet) */
  constructor(message: string, public status: number) {
    super(message)
  }
}

async function pedir<T>(ruta: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${ruta}`)
  } catch {
    throw new ApiError('No se pudo conectar con la API de la semana 8.', 0)
  }
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.mensaje ?? `Error ${res.status} del servidor.`, res.status)
  }
  return body as T
}

export const listarTareas = () => pedir<Tarea[]>('/tareas')
export const obtenerTarea = (id: string) => pedir<Tarea>(`/tareas/${encodeURIComponent(id)}`)

// Respaldo: 5 elementos para que la lista funcione aunque la API esté apagada.
export const TAREAS_LOCALES: Tarea[] = [
  { id: 1, titulo: 'Instalar Node.js y el CLI de Ionic', completada: true },
  { id: 2, titulo: 'Crear la clase Producto en Kotlin', completada: true },
  { id: 3, titulo: 'Probar la API con Thunder Client', completada: false },
  { id: 4, titulo: 'Consumir la API con fetch', completada: false },
  { id: 5, titulo: 'Subir la entrega al fork', completada: false },
]
