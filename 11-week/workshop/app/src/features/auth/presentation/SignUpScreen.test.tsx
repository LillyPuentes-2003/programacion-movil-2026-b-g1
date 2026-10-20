import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConflictError } from '@core/network/errors'
import { useSessionStore } from '@core/session/useSessionStore'

import { FakeAuthRepository, FakeSessionStorage, sessionFor } from '../testing/fakes'
import { renderAuthScreen } from '../testing/renderAuthScreen'
import { SignUpScreen } from './SignUpScreen'

async function fillClientFields() {
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ana Gómez')
  await userEvent.type(screen.getByLabelText('Celular'), '3001112233')
  await userEvent.type(screen.getByLabelText('Correo'), 'ANA@correo.com')
  await userEvent.type(screen.getByLabelText('Contraseña'), 'Secreta123')
}

describe('SignUpScreen', () => {
  beforeEach(() => {
    useSessionStore.getState().setAnonymous()
  })

  it('SignUpScreen_roleSelector_isAnnouncedAsAGroupOfOptions', () => {
    renderAuthScreen(<SignUpScreen />, '/register', {
      repository: new FakeAuthRepository(async () => sessionFor('client')),
      storage: new FakeSessionStorage(),
    })

    expect(screen.getByRole('radiogroup', { name: '¿Cómo vas a usar ManiCita?' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /Crear cuenta/ })).toBeDisabled()
  })

  it('SignUpScreen_whenSwitchingRole_showsSalonFieldsWithoutLosingWhatWasTyped', async () => {
    renderAuthScreen(<SignUpScreen />, '/register', {
      repository: new FakeAuthRepository(async () => sessionFor('client')),
      storage: new FakeSessionStorage(),
    })

    await userEvent.click(screen.getByRole('radio', { name: /Quiero agendar/ }))
    await fillClientFields()
    expect(screen.queryByLabelText('Nombre del salón')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: /Ofrezco servicios/ }))

    expect(screen.getByRole('radio', { name: /Ofrezco servicios/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Nombre del salón')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana Gómez')
    expect(screen.getByLabelText('Celular')).toHaveValue('3001112233')
  })

  it('SignUpScreen_whenPhoneIsShortOnBlur_showsTheRuleUnderTheField', async () => {
    renderAuthScreen(<SignUpScreen />, '/register', {
      repository: new FakeAuthRepository(async () => sessionFor('client')),
      storage: new FakeSessionStorage(),
    })

    await userEvent.click(screen.getByRole('radio', { name: /Quiero agendar/ }))
    await userEvent.type(screen.getByLabelText('Celular'), '30011')
    await userEvent.tab()

    expect(await screen.findByRole('alert')).toHaveTextContent('El celular debe tener 10 dígitos')
  })

  it('SignUpScreen_whenEmailTaken_showsMessageUnderEmailWithLinkToLogin', async () => {
    const repository = new FakeAuthRepository(() =>
      Promise.reject(
        new ConflictError('409', {
          title: 'Correo registrado',
          status: 409,
          detail: 'Ese correo ya tiene una cuenta. Inicia sesión.',
          code: 'EMAIL_TAKEN',
        }),
      ),
    )
    renderAuthScreen(<SignUpScreen />, '/register', { repository, storage: new FakeSessionStorage() })

    await userEvent.click(screen.getByRole('radio', { name: /Quiero agendar/ }))
    await fillClientFields()
    await userEvent.click(screen.getByRole('button', { name: /Crear cuenta/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese correo ya tiene una cuenta. Inicia sesión.')
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: 'Iniciar sesión con ese correo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana Gómez')
  })

  it('SignUpScreen_whenBusinessRegisters_sendsSalonFieldsAndOpensSession', async () => {
    const repository = new FakeAuthRepository(async () => sessionFor('business'))
    renderAuthScreen(<SignUpScreen />, '/register', { repository, storage: new FakeSessionStorage() })

    await userEvent.click(screen.getByRole('radio', { name: /Ofrezco servicios/ }))
    await fillClientFields()
    await userEvent.type(screen.getByLabelText('Nombre del salón'), 'Nails Neiva')
    await userEvent.type(screen.getByLabelText('Dirección del salón'), 'Calle 8 # 5-32')
    await userEvent.click(screen.getByRole('button', { name: /Crear cuenta/ }))

    expect(await screen.findByText('destino-navegado')).toBeInTheDocument()
    expect(repository.registerCalls[0]).toMatchObject({ role: 'business', salonName: 'Nails Neiva' })
    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated', user: { role: 'business' } })
  })
})
