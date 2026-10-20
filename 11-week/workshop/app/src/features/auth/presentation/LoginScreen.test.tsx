import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UnauthorizedError } from '@core/network/errors'
import { useSessionStore } from '@core/session/useSessionStore'

import { FakeAuthRepository, FakeSessionStorage, sessionFor } from '../testing/fakes'
import { renderAuthScreen } from '../testing/renderAuthScreen'
import { LoginScreen } from './LoginScreen'

const invalidCredentials = () =>
  Promise.reject(
    new UnauthorizedError('401', {
      title: 'Credenciales inválidas',
      status: 401,
      detail: 'Correo o contraseña incorrectos.',
      code: 'INVALID_CREDENTIALS',
    }),
  )

describe('LoginScreen', () => {
  beforeEach(() => {
    useSessionStore.getState().setAnonymous()
  })

  it('LoginScreen_whenFieldsAreEmpty_keepsEnterDisabled', async () => {
    renderAuthScreen(<LoginScreen />, '/login', {
      repository: new FakeAuthRepository(async () => sessionFor('client')),
      storage: new FakeSessionStorage(),
    })

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('LoginScreen_whenCredentialsInvalid_showsErrorUnderPasswordAndKeepsWhatWasTyped', async () => {
    renderAuthScreen(<LoginScreen />, '/login', {
      repository: new FakeAuthRepository(invalidCredentials),
      storage: new FakeSessionStorage(),
    })

    await userEvent.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Otra12345')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@correo.com')
    expect(useSessionStore.getState().status).toBe('anonymous')
  })

  it('LoginScreen_whenCredentialsValid_opensSessionAndNavigates', async () => {
    const storage = new FakeSessionStorage()
    renderAuthScreen(<LoginScreen />, '/login', {
      repository: new FakeAuthRepository(async () => sessionFor('client')),
      storage,
    })

    await userEvent.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('destino-navegado')).toBeInTheDocument()
    expect(storage.saved).toHaveLength(1)
    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated', user: { role: 'client' } })
  })

  it('LoginScreen_passwordToggle_announcesItsState', async () => {
    renderAuthScreen(<LoginScreen />, '/login', {
      repository: new FakeAuthRepository(async () => sessionFor('client')),
      storage: new FakeSessionStorage(),
    })

    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)

    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
  })
})
