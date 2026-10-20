import { FakeAuthRepository, FakeSessionStorage, sessionFor } from '../testing/fakes'
import type { SignUpInput } from './AuthRepository'
import { signUp } from './signUp'

const filledForm: SignUpInput = {
  role: 'client',
  name: ' Ana Gómez ',
  phone: '3001112233',
  email: 'ana@correo.com',
  password: 'Secreta123',
  salonName: 'Nails Neiva',
  address: 'Calle 8 # 5-32',
}

describe('signUp', () => {
  it('signUp_whenRoleIsClient_doesNotSendSalonFieldsEvenIfFilled', async () => {
    const repository = new FakeAuthRepository(async () => sessionFor('client'))

    await signUp(repository, new FakeSessionStorage(), filledForm)

    expect(repository.registerCalls[0]).toEqual({
      role: 'client',
      name: 'Ana Gómez',
      phone: '3001112233',
      email: 'ana@correo.com',
      password: 'Secreta123',
    })
  })

  it('signUp_whenRoleIsBusiness_sendsSalonNameAndAddress', async () => {
    const repository = new FakeAuthRepository(async () => sessionFor('business'))

    await signUp(repository, new FakeSessionStorage(), { ...filledForm, role: 'business' })

    expect(repository.registerCalls[0]).toMatchObject({
      role: 'business',
      salonName: 'Nails Neiva',
      address: 'Calle 8 # 5-32',
    })
  })

  it('signUp_whenRegistered_savesTokensAndReturnsTheUser', async () => {
    const storage = new FakeSessionStorage()

    const user = await signUp(
      new FakeAuthRepository(async () => sessionFor('business', 'Marcela')),
      storage,
      { ...filledForm, role: 'business' },
    )

    expect(user.role).toBe('business')
    expect(storage.saved).toEqual([{ accessToken: 'access-business', refreshToken: 'refresh-business' }])
  })
})
