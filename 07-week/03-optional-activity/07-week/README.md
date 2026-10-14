# Semana 7 · Kotlin básico y un componente Ionic

**Autora:** Lilly Puentes · Programación Móvil · CORHUILA 2026-B

## 1. Clase `Producto` en Kotlin

Archivo: [`kotlin/Producto.kt`](kotlin/Producto.kt)

- `nombre` y `precio` son `val`: solo lectura, no se pueden cambiar después de crear el objeto.
- **Validación** en el bloque `init` con `require`: el precio debe ser `>= 0` y el nombre no puede estar vacío. Si no se cumple, lanza `IllegalArgumentException`.
- **Null-safety:** `descripcion` es `String?` (puede ser `null`). Se usa con `?.` (llamada segura) y `?:` (operador Elvis, valor por defecto).
- `Producto.crearOrNull(...)` es una versión que, en vez de lanzar una excepción, devuelve `null` cuando los datos no son válidos.

**Cómo ejecutarlo:** pegar el archivo en https://play.kotlinlang.org y pulsar *Run*, o con el compilador:

```bash
kotlinc kotlin/Producto.kt -include-runtime -d producto.jar
java -jar producto.jar
```

**Salida:**

```
Esmalte semipermanente — $25,000 — Color rojo cereza
Lima de uñas — $3,500 — sin descripción
Largo de la descripción de la lima: 0
No se creó el producto: El precio debe ser mayor o igual a 0 (llegó -500.0)
Sin nombre → null
Sin precio → null
Válido → Acetona — $8,000 — sin descripción
```

## 2. Componente `Saludo` en Ionic React

Archivo: [`saludo-app/src/components/Saludo.tsx`](saludo-app/src/components/Saludo.tsx)

- Recibe por **props** el `nombre` (obligatorio) y el `rol` (opcional).
- Muestra el nombre dentro de un `IonCard` y un `IonButton`.
- El botón alterna entre «¡Hola, …!» y «¡Hasta luego, …!» usando `useState`.
- En `App.tsx` se usa dos veces con props distintas, para mostrar que es reutilizable.

```bash
cd saludo-app
npm install
npm run dev     # http://localhost:5173
```

![Componente Saludo](saludo-app/capturas/saludo.png)

## 3. Dos diferencias entre Kotlin y TypeScript

| | Kotlin | TypeScript |
|---|---|---|
| **1. Nulos** | La null-safety la exige el compilador. Un `String` nunca puede ser `null`; para permitirlo hay que escribir `String?`, y el compilador no deja usarlo sin `?.`, `?:` o una comprobación. | Con `strict` activo, `null` y `undefined` también se marcan (`string \| null`), pero es una opción de configuración. Además existen dos «vacíos» distintos (`null` y `undefined`), y con `any` o `!` se puede saltar la comprobación. |
| **2. Tipos en tiempo de ejecución** | Los tipos existen al ejecutar: Kotlin compila a bytecode de la JVM (o a nativo) y una clase sigue siendo esa clase. `is Producto` funciona y un cast incorrecto lanza `ClassCastException`. | Los tipos se **borran** al compilar a JavaScript: solo sirven en el editor y al compilar. Una `interface` no existe al ejecutar, así que no se puede preguntar «¿esto es un `Producto`?». Hay que validar a mano los datos que llegan de una API. |

Otras diferencias que se notan en el código: Kotlin distingue `val` (inmutable) y `var`, mientras que TS usa `const` y `let`. Además, en Kotlin el constructor va en la misma línea de la clase (`class Producto(nombre: String, precio: Double)`).

## Estructura

```
07-week/
├── README.md
├── kotlin/Producto.kt
└── saludo-app/            Vite + Ionic React
    ├── capturas/saludo.png
    └── src/
        ├── App.tsx
        └── components/Saludo.tsx
```
