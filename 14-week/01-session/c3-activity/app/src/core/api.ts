import { apiRequest } from './apiClient'

export interface User {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  token: string
  /** Segundos de vida del token */
  expiresIn: number
  user: User
}

export interface Salon {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  /** Solo viene cuando se envían coordenadas */
  distanceKm?: number
}

export interface Coords {
  lat: number
  lng: number
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } }),
}

export const salonsApi = {
  /** Ruta PROTEGIDA: requiere token. Con coordenadas devuelve los salones ordenados por distancia. */
  list: (coords?: Coords) =>
    apiRequest<Salon[]>(coords ? `/api/salons?lat=${coords.lat}&lng=${coords.lng}` : '/api/salons', {
      auth: true,
    }),
}
