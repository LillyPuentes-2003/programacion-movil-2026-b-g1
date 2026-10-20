import type { Session } from '@core/domain/Session'
import { httpClient } from '@core/network/httpClient'
import { requestProfiles } from '@core/network/requestProfiles'

import type { AuthRepository, Credentials, SignUpInput, TokenPair } from '../domain/AuthRepository'
import { mapSession, mapTokenPair, type SessionDto, type TokenPairDto } from './dto'

// E-01 y E-02. Son POST: el interceptor de core/network no los reintenta (un registro repetido
// respondería EMAIL_TAKEN), y los errores llegan ya traducidos a errores de dominio con su `code`.
export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: Credentials): Promise<Session> {
    const { data } = await httpClient.post<SessionDto>('/auth/login', credentials, {
      timeout: requestProfiles.writes.timeout,
    })
    return mapSession(data)
  }

  async register(input: SignUpInput): Promise<Session> {
    const { data } = await httpClient.post<SessionDto>('/auth/register', input, {
      timeout: requestProfiles.writes.timeout,
    })
    return mapSession(data)
  }

  // E-03. Con el perfil de lecturas: al abrir la app la persona está esperando frente a la pantalla
  // de carga, y un refresco que tarda 15 s se siente como una app colgada.
  async refresh(refreshToken: string): Promise<TokenPair> {
    const { data } = await httpClient.post<TokenPairDto>(
      '/auth/refresh',
      { refreshToken },
      { timeout: requestProfiles.reads.timeout },
    )
    return mapTokenPair(data)
  }
}
