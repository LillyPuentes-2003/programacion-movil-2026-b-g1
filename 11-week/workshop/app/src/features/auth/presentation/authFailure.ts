import {
  ApiError,
  ConflictError,
  NetworkError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
  ValidationFailedError,
} from '@core/network/errors'

// Cómo se muestra cada falla de login y registro (login.md, registro.md). Se decide por `code`, nunca
// por el texto (api-networking.md); el texto que se muestra es el `detail` de la API, que ya viene
// en español y dice qué hacer.
export type AuthFailure =
  // Bajo el campo de contraseña, no como pantalla de error.
  | { kind: 'credentials'; message: string }
  // Bajo el correo, con enlace a iniciar sesión.
  | { kind: 'emailTaken'; message: string }
  // Cada mensaje bajo su campo.
  | { kind: 'fields'; fieldErrors: Record<string, string> }
  // Banner con reintentar: no es culpa de la persona.
  | { kind: 'network' }
  | { kind: 'unexpected'; message: string }

export function toAuthFailure(error: unknown): AuthFailure {
  if (error instanceof UnauthorizedError && error.code === 'INVALID_CREDENTIALS') {
    return { kind: 'credentials', message: error.detail }
  }
  if (error instanceof ConflictError && error.code === 'EMAIL_TAKEN') {
    return { kind: 'emailTaken', message: error.detail }
  }
  if (error instanceof ValidationFailedError) {
    const fieldErrors: Record<string, string> = {}
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      if (messages[0]) fieldErrors[field] = messages[0]
    }
    return { kind: 'fields', fieldErrors }
  }
  if (error instanceof NetworkError || error instanceof TimeoutError || error instanceof ServerError) {
    return { kind: 'network' }
  }
  if (error instanceof ApiError) {
    return { kind: 'unexpected', message: error.detail }
  }
  return { kind: 'unexpected', message: '' }
}
