import type { ReactNode } from 'react'

import { useSessionStore } from '../session/useSessionStore'
import { PublicStack, type PublicStackScreens } from './PublicStack'

interface RootNavigatorProps extends PublicStackScreens {
  // Lo que se muestra mientras SessionState está en `unknown` (HU-10).
  loading: ReactNode
}

// Mientras la sesión está en `unknown` se muestra la pantalla de carga, nunca el login: así una
// usuaria con sesión no ve un parpadeo de login al abrir la app (auth.md). Las guardas por rol
// (ClientTabs/BusinessTabs, navigation.md) llegan con HU-13; hasta entonces, resuelta la sesión,
// siempre se monta el PublicStack.
export function RootNavigator({ loading, ...screens }: RootNavigatorProps) {
  const status = useSessionStore((state) => state.status)

  if (status === 'unknown') return <>{loading}</>
  return <PublicStack {...screens} />
}
