import type { SignUpInput } from './AuthRepository'

// Las mismas reglas de E-01, revisadas antes de enviar para no gastar un viaje al servidor en un
// error que se ve a simple vista. La API las vuelve a revisar: esto es experiencia, no seguridad.
export type SignUpField = 'name' | 'phone' | 'email' | 'password' | 'salonName' | 'address'

export type SignUpRule = 'required' | 'phoneDigits' | 'emailFormat' | 'passwordLength'

export type SignUpErrors = Partial<Record<SignUpField, SignUpRule>>

const PHONE = /^\d{10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export function validateSignUpField(field: SignUpField, input: SignUpInput): SignUpRule | undefined {
  switch (field) {
    case 'name':
      return input.name.trim() ? undefined : 'required'
    case 'phone':
      if (!input.phone.trim()) return 'required'
      return PHONE.test(input.phone.trim()) ? undefined : 'phoneDigits'
    case 'email':
      if (!input.email.trim()) return 'required'
      return EMAIL.test(input.email.trim()) ? undefined : 'emailFormat'
    case 'password':
      if (!input.password) return 'required'
      return input.password.length >= MIN_PASSWORD ? undefined : 'passwordLength'
    case 'salonName':
      if (input.role !== 'business') return undefined
      return input.salonName?.trim() ? undefined : 'required'
    case 'address':
      if (input.role !== 'business') return undefined
      return input.address?.trim() ? undefined : 'required'
  }
}

const ALL_FIELDS: SignUpField[] = ['name', 'phone', 'email', 'password', 'salonName', 'address']

export function validateSignUp(input: SignUpInput): SignUpErrors {
  const errors: SignUpErrors = {}
  for (const field of ALL_FIELDS) {
    const rule = validateSignUpField(field, input)
    if (rule) errors[field] = rule
  }
  return errors
}
