import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, apiRequest, configureApiClient } from './apiClient'

// Prueba unitaria del cliente HTTP: fetch y navigator se reemplazan por dobles,
// así la prueba no necesita la API encendida ni un navegador.

// Devuelve el ApiError con el que falla la promesa (si no falla, la prueba falla).
const failure = (promise: Promise<unknown>) =>
  promise.then(
    () => {
      throw new Error('Se esperaba que la petición fallara')
    },
    (error: ApiError) => error
  )

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('apiRequest', () => {
  const onUnauthorized = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('navigator', { onLine: true })
    configureApiClient({ getToken: () => 'token-de-prueba', onUnauthorized })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    onUnauthorized.mockReset()
  })

  it('envía el token Bearer en una petición protegida y devuelve los datos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, [{ id: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    const data = await apiRequest<{ id: number }[]>('/api/salons', { auth: true })

    expect(data).toEqual([{ id: 1 }])
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer token-de-prueba')
  })

  it('ante un 401 en ruta protegida lanza "unauthorized" y avisa a la sesión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { code: 'TOKEN_EXPIRED', message: 'Expiró' })))

    const error = await failure(apiRequest('/api/salons', { auth: true }))

    expect(error).toBeInstanceOf(ApiError)
    expect(error.kind).toBe('unauthorized')
    expect(error.code).toBe('TOKEN_EXPIRED')
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('un 401 del login (credenciales malas) NO cierra la sesión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { code: 'INVALID_CREDENTIALS' })))

    const error = await failure(apiRequest('/api/auth/login', { method: 'POST', body: {} }))

    expect(error.kind).toBe('http')
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('sin red responde "offline" sin llamar a fetch', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const error = await failure(apiRequest('/api/salons', { auth: true }))

    expect(error.kind).toBe('offline')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('si el servidor no responde lanza "network"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await failure(apiRequest('/api/salons', { auth: true }))

    expect(error.kind).toBe('network')
  })
})
