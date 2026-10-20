import type { SignUpInput } from './AuthRepository'
import { validateSignUp, validateSignUpField } from './validateSignUp'

const validClient: SignUpInput = {
  role: 'client',
  name: 'Ana Gómez',
  phone: '3001112233',
  email: 'ana@correo.com',
  password: 'Secreta123',
}

describe('validateSignUp', () => {
  it('validateSignUp_whenClientFormIsComplete_returnsNoErrors', () => {
    expect(validateSignUp(validClient)).toEqual({})
  })

  it('validateSignUp_whenClientLeavesSalonFieldsEmpty_doesNotRequireThem', () => {
    expect(validateSignUp({ ...validClient, salonName: '', address: '' })).toEqual({})
  })

  it('validateSignUp_whenBusinessLeavesSalonFieldsEmpty_requiresBoth', () => {
    expect(validateSignUp({ ...validClient, role: 'business' })).toEqual({
      salonName: 'required',
      address: 'required',
    })
  })

  it('validateSignUp_whenEverythingIsEmpty_reportsEveryClientField', () => {
    expect(validateSignUp({ role: 'client', name: ' ', phone: '', email: '', password: '' })).toEqual({
      name: 'required',
      phone: 'required',
      email: 'required',
      password: 'required',
    })
  })

  it.each([
    ['300111223', 'phoneDigits'],
    ['30011122334', 'phoneDigits'],
    ['300 111 2233', 'phoneDigits'],
    ['3001112233', undefined],
  ])('validateSignUpField_phone_%s_returns_%s', (phone, expected) => {
    expect(validateSignUpField('phone', { ...validClient, phone })).toBe(expected)
  })

  it.each([
    ['ana', 'emailFormat'],
    ['ana@correo', 'emailFormat'],
    ['ana@correo.com', undefined],
  ])('validateSignUpField_email_%s_returns_%s', (email, expected) => {
    expect(validateSignUpField('email', { ...validClient, email })).toBe(expected)
  })

  it('validateSignUpField_whenPasswordHasSevenCharacters_returnsPasswordLength', () => {
    expect(validateSignUpField('password', { ...validClient, password: '1234567' })).toBe('passwordLength')
    expect(validateSignUpField('password', { ...validClient, password: '12345678' })).toBeUndefined()
  })
})
