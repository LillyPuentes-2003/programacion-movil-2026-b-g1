import { useEffect, useState } from 'react'

// Estado de la conexión para avisar *antes* de que la persona llene un formulario que no se va a
// poder enviar (login.md, registro.md). Usa los eventos del WebView; no reemplaza el manejo del
// NetworkError cuando la petición falla de verdad.
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
