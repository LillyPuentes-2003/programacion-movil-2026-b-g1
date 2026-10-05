import express from 'express'
import cors from 'cors'

// Tipos de servicio permitidos (mismos valores que ManiCita, ADR-012).
export const SERVICE_TYPES = ['traditional', 'semi_permanent', 'acrylic', 'removal', 'nail_art']

// Datos en memoria: la actividad pide una API mínima, sin base de datos.
// Se reinician cada vez que el servidor arranca.
function seedServices() {
  return [
    { id: 1, name: 'Manicure tradicional', type: 'traditional', price: 25000, durationMinutes: 45 },
    { id: 2, name: 'Semipermanente', type: 'semi_permanent', price: 45000, durationMinutes: 60 },
    { id: 3, name: 'Uñas acrílicas', type: 'acrylic', price: 80000, durationMinutes: 120 },
  ]
}

// Valida el cuerpo del POST. Devuelve un objeto { campo: mensaje } (vacío si es válido).
function validateService(body) {
  const errors = {}
  const { name, type, price, durationMinutes } = body ?? {}

  if (typeof name !== 'string' || name.trim().length < 3) {
    errors.name = 'El nombre es obligatorio (mínimo 3 caracteres).'
  }
  if (!SERVICE_TYPES.includes(type)) {
    errors.type = `El tipo debe ser uno de: ${SERVICE_TYPES.join(', ')}.`
  }
  if (!Number.isInteger(price) || price <= 0) {
    errors.price = 'El precio debe ser un entero mayor que 0 (COP).'
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
    errors.durationMinutes = 'La duración debe ser un entero entre 15 y 480 minutos.'
  }
  return errors
}

export function createApp() {
  const services = seedServices()
  let nextId = services.length + 1

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // GET /api/services → lista completa
  app.get('/api/services', (_req, res) => {
    res.json(services)
  })

  // GET /api/services/:id → un servicio (lo usa la pantalla de detalle)
  app.get('/api/services/:id', (req, res) => {
    const service = services.find((s) => s.id === Number(req.params.id))
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado.' })
    }
    res.json(service)
  })

  // POST /api/services → crea un servicio nuevo
  app.post('/api/services', (req, res) => {
    const errors = validateService(req.body)
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Datos inválidos.', errors })
    }
    const { name, type, price, durationMinutes } = req.body
    const service = { id: nextId++, name: name.trim(), type, price, durationMinutes }
    services.push(service)
    res.status(201).location(`/api/services/${service.id}`).json(service)
  })

  // Rutas inexistentes
  app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada.' })
  })

  // JSON mal formado u otros errores: siempre responder JSON, nunca HTML
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' })
    }
    console.error(err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  })

  return app
}
