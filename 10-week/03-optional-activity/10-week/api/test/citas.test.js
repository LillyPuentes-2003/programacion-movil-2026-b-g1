import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

// Levanta la API en un puerto libre y la prueba con fetch real.
let server
let baseUrl

before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://localhost:${server.address().port}`
})

after(() => server.close())

const post = (body) =>
  fetch(`${baseUrl}/api/citas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

const valida = { cliente: 'Sofía Díaz', servicio: 'Retiro', fecha: '2026-10-22', hora: '10:00' }

test('GET /api/citas devuelve la lista en JSON', async () => {
  const res = await fetch(`${baseUrl}/api/citas`)
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.length, 3)
})

test('POST /api/citas crea una cita (201) y aparece en el GET', async () => {
  const res = await post(valida)
  assert.equal(res.status, 201)
  const creada = await res.json()
  assert.equal(creada.id, 4)
  assert.equal(res.headers.get('location'), '/api/citas/4')

  const lista = await (await fetch(`${baseUrl}/api/citas`)).json()
  assert.ok(lista.some((c) => c.id === 4))
})

test('GET /api/citas/:id devuelve el detalle y 404 si no existe', async () => {
  assert.equal((await fetch(`${baseUrl}/api/citas/1`)).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/citas/999`)).status, 404)
})

test('POST con datos inválidos → 400 con errores por campo', async () => {
  const res = await post({ cliente: 'A', servicio: 'Pedicure', fecha: '2026-02-30', hora: '20:00' })
  assert.equal(res.status, 400)
  const { errores } = await res.json()
  assert.deepEqual(Object.keys(errores).sort(), ['cliente', 'fecha', 'hora', 'servicio'])
})

test('POST en un horario ocupado → 409', async () => {
  const res = await post({ ...valida, cliente: 'Otra clienta' })
  assert.equal(res.status, 409)
})

test('POST con JSON mal formado → 400 en JSON', async () => {
  const res = await post('{ no es json')
  assert.equal(res.status, 400)
  assert.match(res.headers.get('content-type'), /application\/json/)
})
