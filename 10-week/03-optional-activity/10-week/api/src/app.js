import express from 'express'
import cors from 'cors'

// Servicios que se pueden agendar (catálogo fijo de ManiCita).
export const SERVICIOS = ['Manicure tradicional', 'Semipermanente', 'Uñas acrílicas', 'Retiro', 'Nail art']

// Datos en memoria: se reinician cada vez que el servidor arranca.
function citasIniciales() {
  return [
    { id: 1, cliente: 'Laura Gómez', servicio: 'Semipermanente', fecha: '2026-10-20', hora: '09:00' },
    { id: 2, cliente: 'Camila Rojas', servicio: 'Uñas acrílicas', fecha: '2026-10-20', hora: '11:30' },
    { id: 3, cliente: 'Valentina Ortiz', servicio: 'Nail art', fecha: '2026-10-21', hora: '15:00' },
  ]
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

function esFechaReal(texto) {
  if (!FECHA.test(texto)) return false
  const d = new Date(`${texto}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(texto)
}

// Valida el cuerpo del POST. Devuelve { campo: mensaje } (vacío si es válido).
function validarCita(body) {
  const errores = {}
  const { cliente, servicio, fecha, hora } = body ?? {}

  if (typeof cliente !== 'string' || cliente.trim().length < 3) {
    errores.cliente = 'El nombre de la clienta es obligatorio (mínimo 3 caracteres).'
  }
  if (!SERVICIOS.includes(servicio)) {
    errores.servicio = `El servicio debe ser uno de: ${SERVICIOS.join(', ')}.`
  }
  if (typeof fecha !== 'string' || !esFechaReal(fecha)) {
    errores.fecha = 'La fecha debe tener el formato AAAA-MM-DD.'
  }
  if (typeof hora !== 'string' || !HORA.test(hora)) {
    errores.hora = 'La hora debe tener el formato HH:MM.'
  } else if (hora < '08:00' || hora > '18:00') {
    errores.hora = 'El salón atiende de 08:00 a 18:00.'
  }
  return errores
}

export function createApp() {
  const citas = citasIniciales()
  let siguienteId = citas.length + 1

  const app = express()
  app.use(cors())
  app.use(express.json())

  // GET /api/servicios → opciones para el formulario
  app.get('/api/servicios', (_req, res) => {
    res.json(SERVICIOS)
  })

  // GET /api/citas → lista ordenada por fecha y hora
  app.get('/api/citas', (_req, res) => {
    const ordenadas = [...citas].sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))
    res.json(ordenadas)
  })

  // GET /api/citas/:id → detalle
  app.get('/api/citas/:id', (req, res) => {
    const cita = citas.find((c) => c.id === Number(req.params.id))
    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' })
    }
    res.json(cita)
  })

  // POST /api/citas → crea una cita
  app.post('/api/citas', (req, res) => {
    const errores = validarCita(req.body)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores })
    }
    const { cliente, servicio, fecha, hora } = req.body
    const ocupada = citas.some((c) => c.fecha === fecha && c.hora === hora)
    if (ocupada) {
      return res.status(409).json({ mensaje: 'Ya hay una cita a esa hora.', errores: { hora: 'Horario ocupado.' } })
    }
    const cita = { id: siguienteId++, cliente: cliente.trim(), servicio, fecha, hora }
    citas.push(cita)
    res.status(201).location(`/api/citas/${cita.id}`).json(cita)
  })

  // Rutas inexistentes
  app.use((_req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada.' })
  })

  // JSON mal formado u otros errores: siempre responder JSON, nunca HTML
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' })
    }
    console.error(err)
    res.status(500).json({ mensaje: 'Error interno del servidor.' })
  })

  return app
}
