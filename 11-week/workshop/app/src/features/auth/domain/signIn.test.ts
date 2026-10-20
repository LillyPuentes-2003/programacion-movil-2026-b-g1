import { UnauthorizedError } from '@core/network/errors'

import { FakeAuthRepository, FakeSessionStorage, sessionFor } from '../testing/fakes'
import { signIn } from './signIn'

describe('signIn', () => {
  it('signIn_whenCredentialsValid_savesTokensAndReturnsOnlyTheUser', async () => {
    const repository = new FakeAuthRepository(async () => sessionFor('client'))
    const storage = new FakeSessionStorage()

    const user = await signIn(repository, storage, { email: 'ana@correo.com', password: 'Secreta123' })

    expect(user).toEqual({ id: 'usr_1', name: 'Ana Gómez', role: 'client' })
    expect(storage.saved).toEqual([{ accessToken: 'access-client', refreshToken: 'refresh-client' }])
  })

  it('signIn_whenEmailHasSpaces_sendsItTrimmed', async () => {
    const repository = new FakeAuthRepository(async () => sessionFor('client'))

    await signIn(repository, new FakeSessionStorage(), { email: '  ana@correo.com ', password: 'x' })

    expect(repository.loginCalls[0].email).toBe('ana@correo.com')
  })

  it('signIn_whenCredentialsInvalid_rejectsAndSavesNothing', async () => {
    const repository = new FakeAuthRepository(async () => {
      throw new UnauthorizedError('401', {
        title: 'Credenciales inválidas',
        status: 401,
        detail: 'Correo o contraseña incorrectos.',
        code: 'INVALID_CREDENTIALS',
      })
    })
    const storage = new FakeSessionStorage()

    await expect(
      signIn(repository, storage, { email: 'ana@correo.com', password: 'Otra12345' }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
    expect(storage.saved).toEqual([])
  })
})
