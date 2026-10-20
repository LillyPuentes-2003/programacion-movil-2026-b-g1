// axios solo expone un timeout total, no timeouts separados de conexión y de respuesta como
// describe api-networking.md; se usa el timeout de respuesta (el más largo de los dos) por perfil.
export const requestProfiles = {
  reads: { timeout: 10_000 },
  availability: { timeout: 8_000 },
  writes: { timeout: 15_000 },
} as const

export type RequestProfile = keyof typeof requestProfiles
