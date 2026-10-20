# beauty-salon-app — App móvil (ManiCita)

**Equipo:** Lilly Puentes & Lizeth Lorena Caicedo Mora
**Asignatura:** Programación Móvil [G1] — 2026-B · CORHUILA

App móvil de agendamiento de citas de manicure: Ionic React + TypeScript sobre Capacitor,
**solo Android** en esta entrega (ver
[ADR-005](https://github.com/code-corhuila/beauty-salon-docs/blob/main/01-architecture/decisions/records/ADR-005-mobile-stack-ionic-capacitor.md)).

## Los cuatro repositorios

| Repositorio | Responsable de |
|-------------|----------------|
| [`beauty-salon-docs`](https://github.com/code-corhuila/beauty-salon-docs) | La especificación: modelo de datos, contrato de API, decisiones |
| [`beauty-salon-infra`](https://github.com/code-corhuila/beauty-salon-infra) | Contenedores, red, volúmenes y variables del conjunto |
| [`beauty-salon-api`](https://github.com/code-corhuila/beauty-salon-api) | Reglas de negocio, la API y el esquema vía migraciones |
| **`beauty-salon-app`** (este) | La interfaz móvil y sus casos de uso. **Solo habla con la API** |

La app nunca se conecta a la base de datos ni lleva credenciales dentro: todo pasa por la API
(`Authorization: Bearer <token>`). Ver
[ADR-011](https://github.com/code-corhuila/beauty-salon-docs/blob/main/01-architecture/decisions/records/ADR-011-cuatro-repositorios.md).

## Estado

- **Fase 0** (scaffold): estructura `core/`, cliente axios, SQLite + Drizzle, secure storage, DI y
  rutas — hecha.
- **Fase 1** (catálogo): dominio, datos (red primero con caché SQLite), stores, pantallas de
  catálogo y detalle, i18n (es-CO / en) — hecha.
- Pendiente: login, agendamiento, Mis citas y el lado del negocio. Plan en
  [`plan-implementacion-login-catalogo.md`](https://github.com/code-corhuila/beauty-salon-docs/blob/main/01-architecture/plan-implementacion-login-catalogo.md).

## Cómo correr localmente

Orden de arranque: **infra → api → app**. Primero levanta la API siguiendo el README de
[`beauty-salon-infra`](https://github.com/code-corhuila/beauty-salon-infra); luego:

```
npm install
copy .env.example .env      # VITE_API_BASE_URL apunta a la API (por omisión http://localhost:3000/v1)
npm run dev                 # sirve en el navegador (Vite)
```

| Variable | Qué hace |
|----------|----------|
| `VITE_API_BASE_URL` | URL base de la API, con el prefijo `/v1` |

Para correr en emulador o dispositivo Android se necesita Android Studio + SDK (no incluidos en
este repo): `npx cap sync android` y luego `npx cap open android`.

> **Nota conocida:** el fallback de SQLite en el navegador (`jeep-sqlite`) necesita
> `public/assets/sql-wasm.wasm` (ya incluido) y `sql.js` fijado en `1.11.0`. Una versión distinta
> produce `LinkError: function import requires a callable`.

## Historia

Este código vivió hasta el 2026-09-25 en la carpeta `frontend/` del monorepo temporal
`beauty-salon` (ADR-010). La historia de commits previa está en ese repositorio
(`beauty-salon-api`).

## License

MIT — ver [LICENSE](LICENSE).
