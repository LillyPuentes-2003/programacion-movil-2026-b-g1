import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'co.edu.corhuila.manicita.c3',
  appName: 'ManiCita',
  webDir: 'dist',
  // Solo para la práctica: la API local corre en http (sin TLS). En producción se usa https.
  server: { cleartext: true },
  android: { allowMixedContent: true },
}

export default config
