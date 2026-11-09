import { scryptSync, timingSafeEqual } from 'node:crypto'
import express from 'express'
import cors from 'cors'

import { createToken, TokenError, verifyToken } from './token.js'

// Contraseñas guardadas como hash scrypt (nunca en texto plano).
function hashPassword(password, salt) {
  return scryptSync(password, salt, 32).toString('hex')
}

// Datos en memoria: se reinician cada vez que el servidor arranca.
function seedUsers() {
  return [
    {
      id: 1,
      name: 'Cliente Demo',
      email: 'cliente@manicita.co',
      salt: 'manicita-salt-1',
      passwordHash: hashPassword('Manicita123', 'manicita-salt-1'),
    },
  ]
}

// Salones de manicura en Neiva (coordenadas aproximadas).
function seedSalons() {
  return [
    { id: 1, name: 'Uñas Bonitas Centro', address: 'Cra. 5 # 8-20, Centro', lat: 2.9273, lng: -75.2819 },
    { id: 2, name: 'Nail Studio Altico', address: 'Cl. 21 # 6-35, Altico', lat: 2.9389, lng: -75.2862 },
    { id: 3, name: 'ManiSpa Quirinal', address: 'Cl. 10 # 12-44, Quirinal', lat: 2.9321, lng: -75.2745 },
    { id: 4, name: 'Glam Nails Cándido', address: 'Av. 26 # 16-10, Cándido', lat: 2.9465, lng: -75.2901 },
    { id: 5, name: 'Esmalte & Estilo Sur', address: 'Cl. 64 Sur # 18-02, Timanco', lat: 2.8968, lng: -75.2932 },
  ]
}

// Distancia en km entre dos coordenadas (fórmula de Haversine).
export function distanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function parseCoordinate(value, min, max) {
  if (value === undefined) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

export function createApp({
  jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-cambiar-en-produccion',
  tokenTtlSeconds = Number(process.env.TOKEN_TTL_SECONDS) || 900,
} = {}) {
  const users = seedUsers()
  const salons = seedSalons()

  const app = express()
  app.use(cors())
  app.use(express.json())

  // Middleware: exige "Authorization: Bearer <token>". Si falta, es inválido o
  // expiró responde 401 con un código estable para que la app sepa qué pasó.
  function requireAuth(req, res, next) {
    const header = req.get('Authorization') ?? ''
    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
      res.set('WWW-Authenticate', 'Bearer')
      return res.status(401).json({ code: 'TOKEN_MISSING', message: 'Debes iniciar sesión.' })
    }
    try {
      req.user = verifyToken(token, jwtSecret)
      next()
    } catch (err) {
      if (err instanceof TokenError) {
        res.set('WWW-Authenticate', `Bearer error="invalid_token"`)
        return res.status(401).json({ code: err.code, message: err.message })
      }
      next(err)
    }
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // POST /api/auth/login → { token, expiresIn, user }
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {}
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Correo y contraseña son obligatorios.' })
    }
    const user = users.find((u) => u.email === email.trim().toLowerCase())
    const valid =
      user &&
      timingSafeEqual(Buffer.from(hashPassword(password, user.salt), 'hex'), Buffer.from(user.passwordHash, 'hex'))
    if (!valid) {
      return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos.' })
    }
    const token = createToken({ sub: user.id, name: user.name }, jwtSecret, tokenTtlSeconds)
    res.json({ token, expiresIn: tokenTtlSeconds, user: { id: user.id, name: user.name, email: user.email } })
  })

  // GET /api/salons?lat=&lng= (PROTEGIDA) → salones; si llegan coordenadas,
  // incluye distanceKm y los ordena del más cercano al más lejano.
  app.get('/api/salons', requireAuth, (req, res) => {
    const lat = parseCoordinate(req.query.lat, -90, 90)
    const lng = parseCoordinate(req.query.lng, -180, 180)
    if (lat === null || lng === null || (lat === undefined) !== (lng === undefined)) {
      return res
        .status(400)
        .json({ code: 'VALIDATION_ERROR', message: 'lat y lng deben enviarse juntos y ser coordenadas válidas.' })
    }
    if (lat === undefined) {
      return res.json(salons)
    }
    const withDistance = salons
      .map((s) => ({ ...s, distanceKm: Math.round(distanceKm({ lat, lng }, s) * 10) / 10 }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
    res.json(withDistance)
  })

  // Rutas inexistentes
  app.use((_req, res) => {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Ruta no encontrada.' })
  })

  // JSON mal formado u otros errores: siempre responder JSON, nunca HTML
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'El cuerpo de la petición no es un JSON válido.' })
    }
    console.error(err)
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Error interno del servidor.' })
  })

  return app
}
