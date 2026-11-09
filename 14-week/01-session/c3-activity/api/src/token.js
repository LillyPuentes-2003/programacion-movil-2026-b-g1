import { createHmac, timingSafeEqual } from 'node:crypto'

// Token de acceso tipo JWT (HS256) firmado con node:crypto, sin librerías extra.
// Formato: base64url(header).base64url(payload).base64url(firma)

const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')

function sign(data, secret) {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function createToken(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const body = encode({ ...payload, iat: now, exp: now + ttlSeconds })
  return `${header}.${body}.${sign(`${header}.${body}`, secret)}`
}

// Clase de error con un código estable que la app puede leer.
export class TokenError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

// Devuelve el payload si el token es válido; si no, lanza TokenError.
export function verifyToken(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new TokenError('TOKEN_INVALID', 'El token no tiene un formato válido.')
  }
  const [header, body, signature] = parts
  const expected = Buffer.from(sign(`${header}.${body}`, secret))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new TokenError('TOKEN_INVALID', 'La firma del token no es válida.')
  }

  let payload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    throw new TokenError('TOKEN_INVALID', 'El token no tiene un formato válido.')
  }
  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new TokenError('TOKEN_EXPIRED', 'La sesión expiró. Inicia sesión de nuevo.')
  }
  return payload
}
