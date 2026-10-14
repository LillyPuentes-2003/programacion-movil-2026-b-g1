// Prueba las funciones fetch contra la API real.
// Uso: con la API encendida (cd api && npm start), ejecutar: node cliente/demo.js
import { listarTareas, crearTarea, ApiError } from './tareasApi.js'

function mostrarError(error) {
  if (error instanceof ApiError) {
    console.log(`  ✗ ${error.message} (status ${error.status})`)
    for (const [campo, msg] of Object.entries(error.errores ?? {})) {
      console.log(`    - ${campo}: ${msg}`)
    }
  } else {
    console.log('  ✗ Error inesperado:', error)
  }
}

console.log('1) Listar tareas')
try {
  const tareas = await listarTareas()
  for (const t of tareas) console.log(`  [${t.completada ? 'x' : ' '}] #${t.id} ${t.titulo}`)
} catch (e) {
  mostrarError(e)
}

console.log('\n2) Crear una tarea válida')
try {
  const nueva = await crearTarea('Escribir el README de la semana 8')
  console.log('  ✓ Creada:', nueva)
} catch (e) {
  mostrarError(e)
}

console.log('\n3) Crear una tarea inválida (título muy corto)')
try {
  await crearTarea('ab')
} catch (e) {
  mostrarError(e)
}

console.log('\n4) Listar otra vez (debe aparecer la nueva)')
try {
  const tareas = await listarTareas()
  console.log(`  ✓ Hay ${tareas.length} tareas; la última es «${tareas.at(-1).titulo}»`)
} catch (e) {
  mostrarError(e)
}
