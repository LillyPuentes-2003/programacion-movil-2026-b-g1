// Forma única de los errores de la API: application/problem+json (api-contract.md §2).
// `detail` es el texto para la persona; `code` es lo único con lo que la app decide. Nunca se
// comparan textos de `detail` en el código: se reescriben sin aviso.
export interface Problem {
  title: string
  status: number
  detail: string
  code: string
  errors?: Record<string, string[]>
}

export abstract class ApiError extends Error {
  abstract readonly kind: string
  // `code` estable del contrato (SLOT_TAKEN, EMAIL_TAKEN...). Vacío en errores sin respuesta.
  readonly code: string
  // Texto para mostrar a la persona, tal como lo manda la API. Vacío si no hubo respuesta.
  readonly detail: string

  constructor(message: string, problem?: Problem) {
    super(message)
    this.code = problem?.code ?? ''
    this.detail = problem?.detail ?? ''
  }
}

export class NetworkError extends ApiError {
  readonly kind = 'NetworkError'
}

export class TimeoutError extends ApiError {
  readonly kind = 'TimeoutError'
}

export class ServerError extends ApiError {
  readonly kind = 'ServerError'
  constructor(message: string, readonly status: number, problem?: Problem) {
    super(message, problem)
  }
}

export class BadRequestError extends ApiError {
  readonly kind = 'BadRequestError'
}

export class UnauthorizedError extends ApiError {
  readonly kind = 'UnauthorizedError'
}

export class ForbiddenError extends ApiError {
  readonly kind = 'ForbiddenError'
}

export class NotFoundError extends ApiError {
  readonly kind = 'NotFoundError'
}

export class GoneError extends ApiError {
  readonly kind = 'GoneError'
}

export class ConflictError extends ApiError {
  readonly kind = 'ConflictError'
}

export class PayloadTooLargeError extends ApiError {
  readonly kind = 'PayloadTooLargeError'
}

export class ValidationFailedError extends ApiError {
  readonly kind = 'ValidationFailedError'
  readonly fieldErrors: Record<string, string[]>

  constructor(message: string, problem?: Problem) {
    super(message, problem)
    this.fieldErrors = problem?.errors ?? {}
  }
}

export class RateLimitedError extends ApiError {
  readonly kind = 'RateLimitedError'
}

export class UnexpectedResponseError extends ApiError {
  readonly kind = 'UnexpectedResponseError'
}
