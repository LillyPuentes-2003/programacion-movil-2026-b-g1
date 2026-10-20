// La sesión la leen varias features (auth la abre; booking, appointments y business la necesitan
// para sus guardas), así que el tipo vive en core/domain, igual que Service (project-structure.md).
export type UserRole = 'client' | 'business'

export interface SessionUser {
  id: string
  name: string
  role: UserRole
}

// Forma `Session` del contrato (api-contract.md, E-01 y E-02).
export interface Session {
  accessToken: string
  refreshToken: string
  user: SessionUser
}
