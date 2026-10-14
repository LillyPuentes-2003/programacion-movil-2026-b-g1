// Funciones fetch para consumir la API de tareas.
// Sirven igual en el navegador y en Node 18+ (fetch viene incluido).

export const API_URL = 'http://localhost:3000'

// Error propio para que quien llame sepa qué pasó y qué mostrar.
export class ApiError extends Error {
  constructor(mensaje, status, errores = {}) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status // 0 = no hubo respuesta (API apagada, sin internet)
    this.errores = errores // errores por campo que devuelve el POST con 400
  }
}

// Hace la petición y traduce cada tipo de fallo a un ApiError.
async function pedir(ruta, opciones = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    })
  } catch {
    // fetch solo lanza cuando no hay respuesta del servidor
    throw new ApiError('No se pudo conectar con la API. ¿Está encendida en el puerto 3000?', 0)
  }

  // Si la respuesta no es JSON, body queda en null en vez de romper
  const body = await res.json().catch(() => null)

  // fetch NO lanza con 400 o 500: hay que revisar res.ok a mano
  if (!res.ok) {
    throw new ApiError(body?.mensaje ?? `Error ${res.status} del servidor.`, res.status, body?.errores)
  }
  return body
}

/** GET /tareas → arreglo de tareas */
export function listarTareas() {
  return pedir('/tareas')
}

/** POST /tareas → la tarea creada (con su id) */
export function crearTarea(titulo, completada = false) {
  return pedir('/tareas', {
    method: 'POST',
    body: JSON.stringify({ titulo, completada }),
  })
}
