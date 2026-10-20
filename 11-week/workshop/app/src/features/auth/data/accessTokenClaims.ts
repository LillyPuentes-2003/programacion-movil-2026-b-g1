import type { SessionUser, UserRole } from '@core/domain/Session'

export interface AccessTokenClaims {
  user: SessionUser
  expiresAt: number
}

const ROLES: UserRole[] = ['client', 'business']

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
  // Los nombres traen tildes ("Gómez"): el payload es UTF-8, no Latin-1.
  return new TextDecoder().decode(bytes)
}

// Lee `sub`, `name`, `role` y `exp` del accessToken (api-contract §1.2). **No verifica la firma**:
// la app no tiene el secreto ni lo necesita. Esto solo decide qué pantalla mostrar; la API vuelve
// a verificar el token y el rol en cada petición. Un token con otra forma devuelve null.
export function readAccessTokenClaims(token: string): AccessTokenClaims | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>
    const { sub, name, role, exp } = payload
    if (typeof sub !== 'string' || !sub) return null
    if (typeof name !== 'string') return null
    if (typeof role !== 'string' || !(ROLES as string[]).includes(role)) return null
    if (typeof exp !== 'number') return null

    return { user: { id: sub, name, role: role as UserRole }, expiresAt: exp * 1000 }
  } catch {
    return null
  }
}
