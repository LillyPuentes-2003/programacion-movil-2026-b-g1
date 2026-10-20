import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  GoneError,
  NetworkError,
  NotFoundError,
  PayloadTooLargeError,
  type Problem,
  RateLimitedError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
  UnexpectedResponseError,
  ValidationFailedError,
} from './errors'
import { requestProfiles } from './requestProfiles'

const RETRY_DELAYS_MS = [300, 900]

interface RetryableConfig extends InternalAxiosRequestConfig {
  __retryCount?: number
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: requestProfiles.reads.timeout,
})

httpClient.interceptors.request.use((config) => {
  config.headers.set('X-Request-Id', crypto.randomUUID())
  return config
})

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTransient(error: AxiosError) {
  return !error.response || error.response.status >= 500
}

function toDomainError(error: AxiosError): Error {
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? new TimeoutError(error.message)
      : new NetworkError(error.message)
  }

  const { status, data } = error.response
  const problem = toProblem(data)

  switch (status) {
    case 400:
      return new BadRequestError(error.message, problem)
    case 401:
      return new UnauthorizedError(error.message, problem)
    case 403:
      return new ForbiddenError(error.message, problem)
    case 404:
      return new NotFoundError(error.message, problem)
    case 409:
      return new ConflictError(error.message, problem)
    case 410:
      return new GoneError(error.message, problem)
    case 413:
      return new PayloadTooLargeError(error.message, problem)
    case 422:
      return new ValidationFailedError(error.message, problem)
    case 429:
      return new RateLimitedError(error.message, problem)
    default:
      return status >= 500
        ? new ServerError(error.message, status, problem)
        : new UnexpectedResponseError(error.message, problem)
  }
}

// Un cuerpo que no trae la forma del contrato (p. ej. un proxy que responde HTML) no se inventa:
// el error se clasifica solo por su status, con `code` y `detail` vacíos.
function toProblem(data: unknown): Problem | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const candidate = data as Partial<Problem>
  if (typeof candidate.code !== 'string' || typeof candidate.detail !== 'string') return undefined
  return candidate as Problem
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined

    // Solo se reintentan lecturas (GET): reintentar POST/PATCH puede duplicar una escritura.
    // El refresco transparente de sesión ante un 401 se agrega en la Fase 2 (auth), aquí todavía
    // no existe AuthRepository/SessionStorage con quien coordinarlo.
    if (config && config.method?.toLowerCase() === 'get' && isTransient(error)) {
      config.__retryCount = config.__retryCount ?? 0
      if (config.__retryCount < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[config.__retryCount]
        config.__retryCount += 1
        await wait(delay)
        return httpClient(config)
      }
    }

    return Promise.reject(toDomainError(error))
  },
)
