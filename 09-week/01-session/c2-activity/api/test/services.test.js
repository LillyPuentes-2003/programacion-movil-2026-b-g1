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
  fetch(`${baseUrl}/api/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

test('GET /api/services devuelve la lista en JSON', async () => {
  const res = await fetch(`${baseUrl}/api/services`)
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type'), /application\/json/)
  const body = await res.json()
  assert.ok(Array.isArray(body))
  assert.equal(body.length, 3)
})

test('POST /api/services crea un servicio (201) y aparece en el GET', async () => {
  const res = await post({ name: 'Nail art flores', type: 'nail_art', price: 35000, durationMinutes: 50 })
  assert.equal(res.status, 201)
  const created = await res.json()
  assert.equal(created.id, 4)
  assert.equal(created.name, 'Nail art flores')
  assert.equal(res.headers.get('location'), '/api/services/4')

  const list = await (await fetch(`${baseUrl}/api/services`)).json()
  assert.ok(list.some((s) => s.id === 4))
})

test('GET /api/services/:id devuelve el detalle', async () => {
  const res = await fetch(`${baseUrl}/api/services/1`)
  assert.equal(res.status, 200)
  assert.equal((await res.json()).name, 'Manicure tradicional')
})

test('GET /api/services/:id inexistente → 404', async () => {
  const res = await fetch(`${baseUrl}/api/services/999`)
  assert.equal(res.status, 404)
  assert.ok((await res.json()).message)
})

test('POST con datos inválidos → 400 con errores por campo', async () => {
  const res = await post({ name: 'ab', type: 'gel', price: -5, durationMinutes: 5 })
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.deepEqual(Object.keys(body.errors).sort(), ['durationMinutes', 'name', 'price', 'type'])
})

test('POST con JSON mal formado → 400 en JSON', async () => {
  const res = await post('{ esto no es json')
  assert.equal(res.status, 400)
  assert.match(res.headers.get('content-type'), /application\/json/)
})
