import type { Session, SessionUser } from '@core/domain/Session'

import type { AuthRepository, Credentials, SignUpInput, TokenPair } from '../domain/AuthRepository'
import type { SessionStorage, StoredSession } from '../domain/SessionStorage'

// Objetos falsos escritos a mano para las pruebas (ADR-008, ADR-013): implementan las interfaces
// del dominio, sin interceptar módulos.
export function sessionFor(role: Session['user']['role'], name = 'Ana Gómez'): Session {
  return {
    accessToken: `access-${role}`,
    refreshToken: `refresh-${role}`,
    user: { id: 'usr_1', name, role },
  }
}

export class FakeAuthRepository implements AuthRepository {
  loginCalls: Credentials[] = []
  registerCalls: SignUpInput[] = []
  refreshCalls: string[] = []

  constructor(
    private readonly outcome: () => Promise<Session>,
    private readonly refreshOutcome: () => Promise<TokenPair> = () =>
      Promise.reject(new Error('refresh no configurado en esta prueba')),
  ) {}

  login(credentials: Credentials): Promise<Session> {
    this.loginCalls.push(credentials)
    return this.outcome()
  }

  register(input: SignUpInput): Promise<Session> {
    this.registerCalls.push(input)
    return this.outcome()
  }

  refresh(refreshToken: string): Promise<TokenPair> {
    this.refreshCalls.push(refreshToken)
    return this.refreshOutcome()
  }
}

// Guarda en memoria. `profiles` dice qué perfil y vencimiento "lleva dentro" cada accessToken, que
// es lo que la implementación real lee del JWT.
export class FakeSessionStorage implements SessionStorage {
  saved: { accessToken: string; refreshToken: string }[] = []
  cleared = 0
  private current: { accessToken: string; refreshToken: string } | null

  constructor(
    initial: { accessToken: string; refreshToken: string } | null = null,
    private readonly profiles: Record<string, { user: SessionUser; expiresAt: number }> = {},
  ) {
    this.current = initial
  }

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.saved.push({ accessToken, refreshToken })
    this.current = { accessToken, refreshToken }
  }

  async readSession(): Promise<StoredSession | null> {
    if (!this.current) return null
    const profile = this.profiles[this.current.accessToken]
    if (!profile) return null
    return {
      user: profile.user,
      accessTokenExpiresAt: profile.expiresAt,
      refreshToken: this.current.refreshToken,
    }
  }

  async clearTokens(): Promise<void> {
    this.cleared += 1
    this.current = null
  }

  get stored() {
    return this.current
  }
}
