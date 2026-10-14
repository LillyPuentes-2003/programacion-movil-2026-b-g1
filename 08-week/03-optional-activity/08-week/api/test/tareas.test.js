import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

// Levanta la API en un puerto libre y la prueba con fetch real (sin librerías extra).
let server
let baseUrl

before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://localhost:${server.address().port}`
})

after(() => server.close())

const post = (body) =>
  fetch(`${baseUrl}/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

test('GET /tareas devuelve la lista en JSON', async () => {
  const res = await fetch(`${baseUrl}/tareas`)
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type'), /application\/json/)
  const body = await res.json()
  assert.ok(Array.isArray(body))
  assert.equal(body.length, 5)
})

test('POST /tareas crea una tarea (201) y aparece en el GET', async () => {
  const res = await post({ titulo: 'Repasar React Router' })
  assert.equal(res.status, 201)
  const creada = await res.json()
  assert.deepEqual(creada, { id: 6, titulo: 'Repasar React Router', completada: false })
  assert.equal(res.headers.get('location'), '/tareas/6')

  const lista = await (await fetch(`${baseUrl}/tareas`)).json()
  assert.equal(lista.length, 6)
})

test('POST /tareas con título corto responde 400 con el error del campo', async () => {
  const res = await post({ titulo: 'ab', completada: 'si' })
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.ok(body.errores.titulo)
  assert.ok(body.errores.completada)
})

test('POST /tareas con JSON mal formado responde 400 en JSON', async () => {
  const res = await post('{ esto no es json')
  assert.equal(res.status, 400)
  assert.match(res.headers.get('content-type'), /application\/json/)
})

test('GET /tareas/:id inexistente responde 404', async () => {
  const res = await fetch(`${baseUrl}/tareas/999`)
  assert.equal(res.status, 404)
})
