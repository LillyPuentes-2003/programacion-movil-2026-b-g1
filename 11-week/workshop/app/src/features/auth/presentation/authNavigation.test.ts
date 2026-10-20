import { emailFrom, safeReturnTo } from './authNavigation'

describe('emailFrom', () => {
  it('emailFrom_whenSignUpPassedTheEmail_returnsIt', () => {
    expect(emailFrom({ email: 'ana@correo.com' })).toBe('ana@correo.com')
  })

  it('emailFrom_whenThereIsNoState_returnsEmpty', () => {
    expect(emailFrom(null)).toBe('')
  })
})

describe('safeReturnTo', () => {
  it('safeReturnTo_whenFromIsAnAppRoute_returnsIt', () => {
    expect(safeReturnTo({ from: '/book/svc_128' })).toBe('/book/svc_128')
  })

  it.each([
    ['//otro-sitio.com', { from: '//otro-sitio.com' }],
    ['https://otro-sitio.com', { from: 'https://otro-sitio.com' }],
    ['a number', { from: 42 }],
    ['null state', null],
    ['no from', {}],
  ])('safeReturnTo_when%s_returnsUndefined', (_label, state) => {
    expect(safeReturnTo(state)).toBeUndefined()
  })
})
