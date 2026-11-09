import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'

import { createApp } from '../src/app.js'
import { createToken } from '../src/token.js'

const SECRET = 'test-secret'
let server
let baseUrl

before(async () => {
  server = createApp({ jwtSecret: SECRET, tokenTtlSeconds: 60 }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://localhost:${server.address().port}`
})

after(() => server.close())

const login = (email, password) =>
  fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

test('POST /api/auth/login con credenciales válidas devuelve un token', async () => {
  const res = await login('cliente@manicita.co', 'Manicita123')
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(typeof body.token, 'string')
  assert.equal(body.token.split('.').length, 3)
  assert.equal(body.user.email, 'cliente@manicita.co')
  assert.equal(body.user.passwordHash, undefined)
})

test('POST /api/auth/login con contraseña incorrecta → 401 INVALID_CREDENTIALS', async () => {
  const res = await login('cliente@manicita.co', 'otra')
  assert.equal(res.status, 401)
  assert.equal((await res.json()).code, 'INVALID_CREDENTIALS')
})

test('GET /api/salons sin token → 401 TOKEN_MISSING', async () => {
  const res = await fetch(`${baseUrl}/api/salons`)
  assert.equal(res.status, 401)
  assert.equal((await res.json()).code, 'TOKEN_MISSING')
})

test('GET /api/salons con token alterado → 401 TOKEN_INVALID', async () => {
  const { token } = await (await login('cliente@manicita.co', 'Manicita123')).json()
  const res = await fetch(`${baseUrl}/api/salons`, { headers: { Authorization: `Bearer ${token}x` } })
  assert.equal(res.status, 401)
  assert.equal((await res.json()).code, 'TOKEN_INVALID')
})

test('GET /api/salons con token expirado → 401 TOKEN_EXPIRED', async () => {
  const expired = createToken({ sub: 1 }, SECRET, -10)
  const res = await fetch(`${baseUrl}/api/salons`, { headers: { Authorization: `Bearer ${expired}` } })
  assert.equal(res.status, 401)
  assert.equal((await res.json()).code, 'TOKEN_EXPIRED')
})

test('GET /api/salons con token y coordenadas → ordenados por distancia', async () => {
  const { token } = await (await login('cliente@manicita.co', 'Manicita123')).json()
  const res = await fetch(`${baseUrl}/api/salons?lat=2.9273&lng=-75.2819`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.equal(res.status, 200)
  const salons = await res.json()
  assert.ok(salons.length > 0)
  assert.equal(salons[0].name, 'Uñas Bonitas Centro')
  for (let i = 1; i < salons.length; i++) {
    assert.ok(salons[i - 1].distanceKm <= salons[i].distanceKm)
  }
})

test('GET /api/salons con coordenadas inválidas → 400', async () => {
  const { token } = await (await login('cliente@manicita.co', 'Manicita123')).json()
  const res = await fetch(`${baseUrl}/api/salons?lat=500&lng=-75`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(res.status, 400)
})
