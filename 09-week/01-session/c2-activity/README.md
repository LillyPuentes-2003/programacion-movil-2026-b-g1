# Corte 2 — App Ionic React + API (c2-activity)

**Estudiante:** Lilly Puentes (`LillyPuentes-2003`)
**Curso:** Programación Móvil 2026-B · G1 — CORHUILA
**Entidad:** `Service` (servicio de manicura), tomada del proyecto ManiCita.

Mini-proyecto con dos partes:

| Carpeta | Qué es | Tecnología |
| --- | --- | --- |
| [`api/`](api/) | API REST mínima con GET y POST en JSON | Node.js 22 + Express 5 (datos en memoria) |
| [`app/`](app/) | App móvil que lista, crea y muestra el detalle de servicios | Ionic React 9 + React Router 6 + Vite |

## Cómo ejecutar

Se necesitan **dos terminales** (primero la API, luego la app).

```bash
# Terminal 1 — API (http://localhost:3000)
cd api
npm install
npm start
```

```bash
# Terminal 2 — App (http://localhost:5173)
cd app
npm install
npm run dev
```

Abrir `http://localhost:5173` en el navegador (modo móvil con F12 → icono de dispositivo).
Si la API corre en otra dirección (por ejemplo emulador Android → `http://10.0.2.2:3000`), copiar
`app/.env.example` a `app/.env` y cambiar `VITE_API_URL`.

## Endpoints

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| GET | `/api/services` | — | `200` + arreglo de servicios |
| GET | `/api/services/:id` | — | `200` + servicio · `404` si no existe |
| POST | `/api/services` | `{ name, type, price, durationMinutes }` | `201` + servicio creado (header `Location`) · `400` con `errors` por campo |

`type` ∈ `traditional | semi_permanent | acrylic | removal | nail_art` · `price` entero en COP > 0 ·
`durationMinutes` entero entre 15 y 480. Todos los errores responden JSON `{ "message", "errors"? }`.

## Pruebas de la API

Pruebas automáticas con el runner nativo de Node (`node:test` + `fetch`, sin librerías extra):

```bash
cd api
npm test
```

```
ok 1 - GET /api/services devuelve la lista en JSON
ok 2 - POST /api/services crea un servicio (201) y aparece en el GET
ok 3 - GET /api/services/:id devuelve el detalle
ok 4 - GET /api/services/:id inexistente → 404
ok 5 - POST con datos inválidos → 400 con errores por campo
ok 6 - POST con JSON mal formado → 400 en JSON
# pass 6
# fail 0
```

Prueba manual con `curl` (salida real):

```bash
$ curl http://localhost:3000/api/services
[{"id":1,"name":"Manicure tradicional","type":"traditional","price":25000,"durationMinutes":45},{"id":2,"name":"Semipermanente","type":"semi_permanent","price":45000,"durationMinutes":60},{"id":3,"name":"Uñas acrílicas","type":"acrylic","price":80000,"durationMinutes":120}]

$ curl -i -X POST http://localhost:3000/api/services -H "Content-Type: application/json" -d '{"name":"Nail art flores","type":"nail_art","price":35000,"durationMinutes":50}'
HTTP/1.1 201 Created
Location: /api/services/4
{"id":4,"name":"Nail art flores","type":"nail_art","price":35000,"durationMinutes":50}

$ curl -i -X POST http://localhost:3000/api/services -H "Content-Type: application/json" -d '{"name":"ab","type":"gel","price":-5,"durationMinutes":5}'
HTTP/1.1 400 Bad Request
{"message":"Datos inválidos.","errors":{"name":"El nombre es obligatorio (mínimo 3 caracteres).","type":"El tipo debe ser uno de: traditional, semi_permanent, acrylic, removal, nail_art.","price":"El precio debe ser un entero mayor que 0 (COP).","durationMinutes":"La duración debe ser un entero entre 15 y 480 minutos."}}

$ curl -i http://localhost:3000/api/services/999
HTTP/1.1 404 Not Found
{"message":"Servicio no encontrado."}
```

## Qué cubre la app (rúbrica)

- **Listar + crear con `useState`** — `app/src/pages/ServiceListPage.tsx`: la lista, el estado de
  carga, el formulario y sus errores viven en `useState`; el listado se pide con `fetch` al abrir la
  pantalla y el servicio creado se agrega a la lista sin recargar.
- **Manejo de errores de red** — `app/src/api/servicesApi.ts` convierte cualquier fallo en un
  `ApiError`: si `fetch` lanza (API apagada / sin red) muestra *"No se pudo conectar con el servidor"*
  con botón **Reintentar**; si la API responde 400 muestra el error debajo de cada campo; 404 en el
  detalle muestra *"Servicio no encontrado"*.
- **Navegación a detalle** — tocar un servicio navega a `/services/:id`
  (`app/src/pages/ServiceDetailPage.tsx`), que lee el `id` con `useParams`, consulta
  `GET /api/services/:id` y tiene botón **Volver**.

## Architecture

The project follows a simple client–server architecture: an Express REST API owns the data and an
Ionic React app consumes it over HTTP using JSON. The API exposes three endpoints for the `Service`
entity: `GET /api/services` returns the full list, `GET /api/services/:id` returns a single service
or a `404` error, and `POST /api/services` validates the request body and creates a new service,
answering `201 Created` with the new resource or `400 Bad Request` with one error message per
invalid field. Data is kept in an in-memory array, so the API stays minimal and restarts with three
sample services, and the `cors` middleware allows the app, which runs on a different port, to call
it from the browser. On the client side, all HTTP calls go through a small module
(`src/api/servicesApi.ts`) that wraps the native `fetch` function, builds the URL from the
`VITE_API_URL` environment variable, and turns network failures and non-2xx responses into a typed
`ApiError`. The list screen calls `GET /api/services` when it mounts and stores the services,
loading flag and error message with `useState`, while its form sends `POST /api/services` and
appends the created service to the list without reloading the page. When the user taps a service,
React Router navigates to `/services/:id`, and the detail screen reads the id from the URL and
requests `GET /api/services/:id`. Every screen renders a loading spinner, a friendly error message
with a retry button when the server cannot be reached, and the data once it arrives.
