import express from 'express'
import cors from 'cors'

// Datos en memoria: la actividad pide una API mínima, sin base de datos.
// Se reinician cada vez que el servidor arranca.
function tareasIniciales() {
  return [
    { id: 1, titulo: 'Instalar Node.js y el CLI de Ionic', completada: true },
    { id: 2, titulo: 'Crear la clase Producto en Kotlin', completada: true },
    { id: 3, titulo: 'Probar la API con Thunder Client', completada: false },
    { id: 4, titulo: 'Consumir la API con fetch', completada: false },
    { id: 5, titulo: 'Subir la entrega al fork', completada: false },
  ]
}

// Valida el cuerpo del POST. Devuelve { campo: mensaje } (vacío si es válido).
function validarTarea(body) {
  const errores = {}
  const { titulo, completada } = body ?? {}

  if (typeof titulo !== 'string' || titulo.trim().length < 3) {
    errores.titulo = 'El título es obligatorio (mínimo 3 caracteres).'
  } else if (titulo.trim().length > 100) {
    errores.titulo = 'El título no puede tener más de 100 caracteres.'
  }
  if (completada !== undefined && typeof completada !== 'boolean') {
    errores.completada = 'completada debe ser true o false.'
  }
  return errores
}

export function createApp() {
  const tareas = tareasIniciales()
  let siguienteId = tareas.length + 1

  const app = express()
  app.use(cors())
  app.use(express.json())

  // GET /tareas → lista completa
  app.get('/tareas', (_req, res) => {
    res.json(tareas)
  })

  // GET /tareas/:id → una tarea (útil para la pantalla de detalle de la semana 9)
  app.get('/tareas/:id', (req, res) => {
    const tarea = tareas.find((t) => t.id === Number(req.params.id))
    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada.' })
    }
    res.json(tarea)
  })

  // POST /tareas → crea una tarea nueva
  app.post('/tareas', (req, res) => {
    const errores = validarTarea(req.body)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores })
    }
    const tarea = {
      id: siguienteId++,
      titulo: req.body.titulo.trim(),
      completada: req.body.completada ?? false,
    }
    tareas.push(tarea)
    res.status(201).location(`/tareas/${tarea.id}`).json(tarea)
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
