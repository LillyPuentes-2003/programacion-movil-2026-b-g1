import type { Session, UserRole } from '@core/domain/Session'

import type { TokenPair } from '../domain/AuthRepository'

export interface SessionDto {
  accessToken: string
  refreshToken: string
  user: { id: string; name: string; role: string }
}

export interface TokenPairDto {
  accessToken: string
  refreshToken: string
}

const ROLES: UserRole[] = ['client', 'business']

function isRole(role: string): role is UserRole {
  return (ROLES as string[]).includes(role)
}

// api-networking.md: un payload inesperado falla ruidosamente, no se adivina. Una sesión sin tokens
// o con un rol desconocido dejaría a la persona dentro de la app sin saber de qué lado está.
export function mapSession(dto: SessionDto): Session {
  if (!dto?.accessToken || !dto.refreshToken || !dto.user?.id || !isRole(dto.user.role)) {
    throw new Error('La API respondió una sesión con forma inesperada')
  }

  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    user: { id: dto.user.id, name: dto.user.name, role: dto.user.role },
  }
}

// E-03 responde solo los dos tokens nuevos. Si falta alguno, no se guarda nada a medias.
export function mapTokenPair(dto: TokenPairDto): TokenPair {
  if (!dto?.accessToken || !dto.refreshToken) {
    throw new Error('La API respondió un refresco sin los dos tokens')
  }
  return { accessToken: dto.accessToken, refreshToken: dto.refreshToken }
}
