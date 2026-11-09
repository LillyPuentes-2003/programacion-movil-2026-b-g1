import { Capacitor, type PermissionState } from '@capacitor/core'
import { Geolocation, type PermissionStatus } from '@capacitor/geolocation'

import type { Coords } from './api'

// Plugin nativo de Capacitor: @capacitor/geolocation.
// Flujo de permisos:
//   1. checkPermissions() → si ya está "denied" no se vuelve a preguntar (Android no
//      mostraría el diálogo); la UI explica cómo activarlo en Ajustes.
//   2. En Android/iOS, si está en "prompt", se llama requestPermissions() → diálogo del sistema.
//      En web requestPermissions() no existe: el navegador pregunta al llamar getCurrentPosition().
//   3. getCurrentPosition() con timeout; sus errores también se traducen a LocationErrorKind.

export type LocationErrorKind = 'denied' | 'unavailable' | 'timeout'

export class LocationError extends Error {
  constructor(public kind: LocationErrorKind, message: string) {
    super(message)
    this.name = 'LocationError'
  }
}

const MESSAGES: Record<LocationErrorKind, string> = {
  denied: 'No diste permiso de ubicación. Puedes activarlo en Ajustes › Aplicaciones › ManiCita › Permisos.',
  unavailable: 'No se pudo obtener tu ubicación. Revisa que el GPS esté encendido.',
  timeout: 'Obtener tu ubicación tardó demasiado. Inténtalo de nuevo al aire libre o cerca de una ventana.',
}

// En Android 12+ el usuario puede conceder solo la ubicación aproximada: también sirve.
const isGranted = (status: PermissionStatus) =>
  status.location === 'granted' || status.coarseLocation === 'granted'

export type LocationPermission = PermissionState | 'unknown'

export async function getPermissionState(): Promise<LocationPermission> {
  try {
    const status = await Geolocation.checkPermissions()
    return isGranted(status) ? 'granted' : status.location
  } catch {
    // Navegadores sin Permissions API: se sabrá al pedir la posición.
    return 'unknown'
  }
}

function toLocationError(err: unknown): LocationError {
  const code = (err as { code?: number | string })?.code
  const message = String((err as { message?: string })?.message ?? '').toLowerCase()
  if (code === 1 || message.includes('denied') || message.includes('permission')) {
    return new LocationError('denied', MESSAGES.denied)
  }
  if (code === 3 || message.includes('timeout')) {
    return new LocationError('timeout', MESSAGES.timeout)
  }
  return new LocationError('unavailable', MESSAGES.unavailable)
}

export async function getCurrentCoords(): Promise<Coords> {
  const state = await getPermissionState()
  if (state === 'denied') throw new LocationError('denied', MESSAGES.denied)

  if (Capacitor.isNativePlatform() && state !== 'granted') {
    const requested = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] })
    if (!isGranted(requested)) throw new LocationError('denied', MESSAGES.denied)
  }

  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 60_000,
    })
    return { lat: position.coords.latitude, lng: position.coords.longitude }
  } catch (err) {
    throw toLocationError(err)
  }
}
