import { useEffect } from 'react'

import { useAuthRepository, useSessionStorage } from '../data/authProviders'
import { runSessionRestore } from './runSessionRestore'

// HU-10: al montar la app saca SessionState de `unknown`. No dibuja nada; mientras tanto el
// navegador raíz muestra la pantalla de carga, nunca el login.
export function SessionRestorer() {
  const repository = useAuthRepository()
  const storage = useSessionStorage()

  useEffect(() => {
    runSessionRestore(repository, storage)
  }, [repository, storage])

  return null
}
