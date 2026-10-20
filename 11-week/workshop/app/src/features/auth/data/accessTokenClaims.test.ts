import { readAccessTokenClaims } from './accessTokenClaims'

// Arma un JWT de prueba (la firma no se verifica en la app, así que da igual cuál sea).
function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => {
    const bytes = new TextEncoder().encode(JSON.stringify(value))
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.firma`
}

describe('readAccessTokenClaims', () => {
  it('readAccessTokenClaims_whenTokenFollowsContract_returnsUserAndExpiryInMs', () => {
    const claims = readAccessTokenClaims(
      jwt({ sub: 'usr_1', name: 'Ana Gómez', role: 'client', iat: 1, exp: 1_800_000_000 }),
    )

    expect(claims).toEqual({
      user: { id: 'usr_1', name: 'Ana Gómez', role: 'client' },
      expiresAt: 1_800_000_000_000,
    })
  })

  it('readAccessTokenClaims_whenRoleIsUnknown_returnsNull', () => {
    expect(readAccessTokenClaims(jwt({ sub: 'usr_1', name: 'Ana', role: 'admin', exp: 1 }))).toBeNull()
  })

  it('readAccessTokenClaims_whenExpIsMissing_returnsNull', () => {
    expect(readAccessTokenClaims(jwt({ sub: 'usr_1', name: 'Ana', role: 'client' }))).toBeNull()
  })

  it.each([['no-es-un-jwt'], ['a.b'], ['a.@@@.c']])('readAccessTokenClaims_when_%s_returnsNull', (token) => {
    expect(readAccessTokenClaims(token)).toBeNull()
  })
})
