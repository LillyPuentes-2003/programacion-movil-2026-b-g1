import type { UserRole } from '@core/domain/Session'
import { routes } from '@core/routing/routes'

// La "ruta pretendida" (navigation.md): quien manda a login guarda en `location.state.from` a dónde
// iba la persona, y login y registro se la pasan entre sí para volver ahí al autenticarse.
export interface AuthLocationState {
  from?: string
  // Correo ya escrito en registro cuando la API respondió EMAIL_TAKEN: login lo trae lleno.
  email?: string
}

export function emailFrom(state: unknown): string {
  const email = (state as AuthLocationState | null)?.email
  return typeof email === 'string' ? email : ''
}

// Solo rutas internas de la app: un `from` como "//otro-sitio.com" o "https://…" se ignora.
export function safeReturnTo(state: unknown): string | undefined {
  const from = (state as AuthLocationState | null)?.from
  if (typeof from !== 'string') return undefined
  if (!from.startsWith('/') || from.startsWith('//')) return undefined
  return from
}

// El inicio de cada rol. El del negocio será `/business/services` cuando exista su pantalla
// (HU-14); mientras tanto, las dos cuentas aterrizan en el catálogo.
export function homeFor(role: UserRole): string {
  switch (role) {
    case 'client':
      return routes.catalog.path
    case 'business':
      return routes.catalog.path
  }
}
