import type { Session, UserRole } from '@core/domain/Session'

export interface Credentials {
  email: string
  password: string
}

// Campos de E-01. `salonName` y `address` solo viajan cuando el rol es `business`.
export interface SignUpInput {
  role: UserRole
  name: string
  phone: string
  email: string
  password: string
  salonName?: string
  address?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthRepository {
  login(credentials: Credentials): Promise<Session>
  register(input: SignUpInput): Promise<Session>
  // E-03: rota los dos tokens. El usado queda revocado.
  refresh(refreshToken: string): Promise<TokenPair>
}
