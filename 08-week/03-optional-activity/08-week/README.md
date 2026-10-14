# Semana 8 · API REST con Express y consumo desde la app

**Autora:** Lilly Puentes · Programación Móvil · CORHUILA 2026-B

API REST con Express para la entidad **tarea** y funciones `fetch` para listarlas y crearlas, con manejo de errores.

## Estructura

```
08-week/
├── README.md
├── api/
│   ├── src/app.js           rutas, validación y manejo de errores
│   ├── src/server.js        arranca en el puerto 3000
│   ├── test/tareas.test.js  5 pruebas automáticas (node:test)
│   └── pruebas.http         peticiones listas para Thunder Client / REST Client
└── cliente/
    ├── tareasApi.js         listarTareas() y crearTarea() con fetch
    └── demo.js              prueba las funciones contra la API real
```

## Cómo ejecutar

```bash
cd api
npm install
npm start          # API en http://localhost:3000
npm test           # 5 pruebas
```

En otra terminal, con la API encendida:

```bash
node cliente/demo.js
```

## Endpoints

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/tareas` | — | `200` con el arreglo de tareas |
| POST | `/tareas` | `{ "titulo": "...", "completada": false }` | `201` con la tarea creada y cabecera `Location` · `400` si los datos no son válidos |
| GET | `/tareas/:id` | — | `200` con la tarea · `404` si no existe (extra, para la semana 9) |

Una tarea tiene la forma `{ "id": 1, "titulo": "Instalar Node.js", "completada": true }`. Los datos se guardan en memoria, así que se reinician al apagar la API.

**Reglas del POST:** `titulo` es obligatorio y tiene entre 3 y 100 caracteres; `completada` es opcional, booleano y por defecto `false`. Si llega un JSON mal formado, la API responde `400` en JSON, nunca una página HTML.

## Pruebas de los endpoints

Las pruebas se hicieron con `curl`. Las mismas peticiones están en `api/pruebas.http` para abrirlas en Thunder Client o REST Client de VS Code.

**GET /tareas**

```bash
curl http://localhost:3000/tareas
```
```json
[{"id":1,"titulo":"Instalar Node.js y el CLI de Ionic","completada":true},
 {"id":2,"titulo":"Crear la clase Producto en Kotlin","completada":true},
 {"id":3,"titulo":"Probar la API con Thunder Client","completada":false},
 {"id":4,"titulo":"Consumir la API con fetch","completada":false},
 {"id":5,"titulo":"Subir la entrega al fork","completada":false}]
```

**POST /tareas (válido)**

```bash
curl -i -X POST http://localhost:3000/tareas -H "Content-Type: application/json" -d "{\"titulo\":\"Probar con curl\"}"
```
```
HTTP/1.1 201 Created
Location: /tareas/6
{"id":6,"titulo":"Probar con curl","completada":false}
```

**POST /tareas (inválido)**

```bash
curl -X POST http://localhost:3000/tareas -H "Content-Type: application/json" -d "{\"titulo\":\"ab\"}"
```
```json
{"mensaje":"Datos inválidos.","errores":{"titulo":"El título es obligatorio (mínimo 3 caracteres)."}}
```

**Pruebas automáticas (`npm test`)**

```
✔ GET /tareas devuelve la lista en JSON
✔ POST /tareas crea una tarea (201) y aparece en el GET
✔ POST /tareas con título corto responde 400 con el error del campo
✔ POST /tareas con JSON mal formado responde 400 en JSON
✔ GET /tareas/:id inexistente responde 404
# pass 5 · fail 0
```

## Funciones fetch con manejo de errores

En `cliente/tareasApi.js`:

- `listarTareas()` hace `GET /tareas`.
- `crearTarea(titulo)` hace `POST /tareas`.

Las dos pasan por la función `pedir()`, que distingue tres tipos de error y los convierte en un `ApiError` con `status` y mensaje:

| Caso | Qué pasa con `fetch` | Cómo se maneja |
|---|---|---|
| API apagada o sin internet | `fetch` lanza una excepción | `try/catch` → `ApiError` con `status 0` y el mensaje «No se pudo conectar con la API…» |
| Respuesta 400 / 404 / 500 | `fetch` **no** lanza; `res.ok` es `false` | Se revisa `res.ok` y se lanza `ApiError` con el `mensaje` y los `errores` por campo que manda la API |
| La respuesta no es JSON | `res.json()` fallaría | `.catch(() => null)` para no romper y usar un mensaje genérico |

**Salida de `node cliente/demo.js` con la API encendida:**

```
1) Listar tareas
  [x] #1 Instalar Node.js y el CLI de Ionic
  [x] #2 Crear la clase Producto en Kotlin
  [ ] #3 Probar la API con Thunder Client
  ...
2) Crear una tarea válida
  ✓ Creada: { id: 7, titulo: 'Escribir el README de la semana 8', completada: false }
3) Crear una tarea inválida (título muy corto)
  ✗ Datos inválidos. (status 400)
    - titulo: El título es obligatorio (mínimo 3 caracteres).
4) Listar otra vez (debe aparecer la nueva)
  ✓ Hay 7 tareas; la última es «Escribir el README de la semana 8»
```

**Con la API apagada:**

```
1) Listar tareas
  ✗ No se pudo conectar con la API. ¿Está encendida en el puerto 3000? (status 0)
```
