import { NetworkError, ServerError, UnauthorizedError } from '@core/network/errors'

import { FakeAuthRepository, FakeSessionStorage, sessionFor } from '../testing/fakes'
import { restoreSession } from './restoreSession'

const NOW = Date.parse('2026-10-07T10:00:00-05:00')
const now = () => NOW
const ana = { id: 'usr_1', name: 'Ana Gómez', role: 'client' as const }
const neverLogin = () => Promise.reject(new Error('login no se usa al restaurar'))

const invalidRefresh = () =>
  Promise.reject(
    new UnauthorizedError('401', {
      title: 'Sesión inválida',
      status: 401,
      detail: 'Tu sesión ya no es válida. Inicia sesión de nuevo.',
      code: 'INVALID_REFRESH_TOKEN',
    }),
  )

describe('restoreSession', () => {
  it('restoreSession_whenNothingIsStored_isAnonymous', async () => {
    const storage = new FakeSessionStorage(null)

    const result = await restoreSession(new FakeAuthRepository(neverLogin), storage, now)

    expect(result).toEqual({ status: 'anonymous' })
  })

  it('restoreSession_whenAccessTokenIsValid_isAuthenticatedWithoutCallingTheNetwork', async () => {
    const repository = new FakeAuthRepository(neverLogin)
    const storage = new FakeSessionStorage(
      { accessToken: 'vigente', refreshToken: 'r1' },
      { vigente: { user: ana, expiresAt: NOW + 30 * 60_000 } },
    )

    const result = await restoreSession(repository, storage, now)

    expect(result).toEqual({ status: 'authenticated', user: ana })
    expect(repository.refreshCalls).toEqual([])
  })

  it('restoreSession_whenAccessTokenExpiresWithinAMinute_refreshesFirst', async () => {
    const repository = new FakeAuthRepository(neverLogin, async () => ({
      accessToken: 'nuevo',
      refreshToken: 'r2',
    }))
    const storage = new FakeSessionStorage(
      { accessToken: 'casi-vencido', refreshToken: 'r1' },
      {
        'casi-vencido': { user: ana, expiresAt: NOW + 30_000 },
        nuevo: { user: ana, expiresAt: NOW + 60 * 60_000 },
      },
    )

    await restoreSession(repository, storage, now)

    expect(repository.refreshCalls).toEqual(['r1'])
  })

  it('restoreSession_whenAccessTokenExpired_refreshesSavesBothTokensAndKeepsTheRole', async () => {
    const business = { ...sessionFor('business').user }
    const repository = new FakeAuthRepository(neverLogin, async () => ({
      accessToken: 'nuevo',
      refreshToken: 'r2',
    }))
    const storage = new FakeSessionStorage(
      { accessToken: 'vencido', refreshToken: 'r1' },
      {
        vencido: { user: business, expiresAt: NOW - 1 },
        nuevo: { user: business, expiresAt: NOW + 60 * 60_000 },
      },
    )

    const result = await restoreSession(repository, storage, now)

    expect(result).toEqual({ status: 'authenticated', user: business })
    expect(storage.saved).toEqual([{ accessToken: 'nuevo', refreshToken: 'r2' }])
  })

  it('restoreSession_whenRefreshTokenIsRevoked_clearsTokensAndIsAnonymous', async () => {
    const storage = new FakeSessionStorage(
      { accessToken: 'vencido', refreshToken: 'revocado' },
      { vencido: { user: ana, expiresAt: NOW - 1 } },
    )

    const result = await restoreSession(new FakeAuthRepository(neverLogin, invalidRefresh), storage, now)

    expect(result).toEqual({ status: 'anonymous' })
    expect(storage.stored).toBeNull()
  })

  it('restoreSession_whenServerFailsOnRefresh_clearsTokensLikeA401', async () => {
    const storage = new FakeSessionStorage(
      { accessToken: 'vencido', refreshToken: 'r1' },
      { vencido: { user: ana, expiresAt: NOW - 1 } },
    )

    const result = await restoreSession(
      new FakeAuthRepository(neverLogin, () => Promise.reject(new ServerError('500', 500))),
      storage,
      now,
    )

    expect(result).toEqual({ status: 'anonymous' })
    expect(storage.stored).toBeNull()
  })

  it('restoreSession_whenOfflineWithExpiredToken_keepsTheSessionAndTheTokens', async () => {
    const storage = new FakeSessionStorage(
      { accessToken: 'vencido', refreshToken: 'r1' },
      { vencido: { user: ana, expiresAt: NOW - 1 } },
    )

    const result = await restoreSession(
      new FakeAuthRepository(neverLogin, () => Promise.reject(new NetworkError('sin red'))),
      storage,
      now,
    )

    expect(result).toEqual({ status: 'authenticated', user: ana })
    expect(storage.stored).toEqual({ accessToken: 'vencido', refreshToken: 'r1' })
  })

  it('restoreSession_whenStoredTokenIsUnreadable_clearsItAndIsAnonymous', async () => {
    const storage = new FakeSessionStorage({ accessToken: 'basura', refreshToken: 'r1' }, {})

    const result = await restoreSession(new FakeAuthRepository(neverLogin), storage, now)

    expect(result).toEqual({ status: 'anonymous' })
    expect(storage.cleared).toBe(1)
  })
})
