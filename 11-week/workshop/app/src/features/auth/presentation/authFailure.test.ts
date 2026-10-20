import {
  ConflictError,
  NetworkError,
  ServerError,
  UnauthorizedError,
  ValidationFailedError,
} from '@core/network/errors'

import { toAuthFailure } from './authFailure'

const problem = (status: number, code: string, detail: string, errors?: Record<string, string[]>) => ({
  title: 't',
  status,
  code,
  detail,
  errors,
})

describe('toAuthFailure', () => {
  it('toAuthFailure_whenInvalidCredentials_returnsCredentialsWithApiDetail', () => {
    const error = new UnauthorizedError('401', problem(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.'))

    expect(toAuthFailure(error)).toEqual({ kind: 'credentials', message: 'Correo o contraseña incorrectos.' })
  })

  it('toAuthFailure_whenEmailTaken_returnsEmailTaken', () => {
    const error = new ConflictError('409', problem(409, 'EMAIL_TAKEN', 'Ese correo ya tiene una cuenta. Inicia sesión.'))

    expect(toAuthFailure(error).kind).toBe('emailTaken')
  })

  it('toAuthFailure_whenValidationFailed_keepsFirstMessagePerField', () => {
    const error = new ValidationFailedError(
      '422',
      problem(422, 'VALIDATION_FAILED', 'Hay campos inválidos', {
        phone: ['Debe tener 10 dígitos', 'otro'],
        email: ['Formato de correo inválido'],
      }),
    )

    expect(toAuthFailure(error)).toEqual({
      kind: 'fields',
      fieldErrors: { phone: 'Debe tener 10 dígitos', email: 'Formato de correo inválido' },
    })
  })

  it.each([
    ['NetworkError', new NetworkError('sin red')],
    ['ServerError', new ServerError('500', 500)],
  ])('toAuthFailure_when%s_returnsNetwork', (_name, error) => {
    expect(toAuthFailure(error)).toEqual({ kind: 'network' })
  })

  it('toAuthFailure_whenUnauthorizedWithOtherCode_isNotTreatedAsCredentials', () => {
    const error = new UnauthorizedError('401', problem(401, 'SESSION_EXPIRED', 'La sesión expiró.'))

    expect(toAuthFailure(error)).toEqual({ kind: 'unexpected', message: 'La sesión expiró.' })
  })
})
