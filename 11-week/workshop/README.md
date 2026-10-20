# Taller semana 11 - UX/UI en pantallas avanzadas

Taller individual sobre la app de mi equipo, ManiCita (Beauty Salon): reserva de citas de manicure
con catálogo de servicios, detalle del servicio, registro e inicio de sesión.

La carpeta `app/` es una copia sin cambios de `beauty-salon-app` en el commit `d304375`
(Ionic React 9 + Capacitor). Todo lo que cambia después de ese commit es trabajo del taller.

<!-- CONFIG-START -->
- FULL_NAME: Lilly Signey Puentes Rincón
- GITHUB_USER: LillyPuentes-2003
- TEAM: ManiCita (Beauty Salon) - Lilly Puentes, Lizeth Lorena Caicedo Mora
- DOCS_REPO: https://github.com/code-corhuila/beauty-salon-docs
- CODE_REPO: https://github.com/code-corhuila/beauty-salon-app
- BASELINE: team app, beauty-salon-app commit d3043758e6d28b03ff259f548f7d434839deb313
- REFLECTION_DOC: https://docs.google.com/document/d/1gwYMi6PDj1Q1EU0J_ZzHYoCiPtfbcvP-58-qGfjacyE/edit
- MY_SCREENS: Catálogo de servicios (/services), Detalle del servicio (/service/:serviceId), Inicio de sesión (/login)
<!-- CONFIG-END -->

## Cómo correr la app

```bash
cd 11-week/workshop/app
npm install
npm run dev
```

Sin la API corriendo el catálogo muestra el estado de error con el botón Reintentar.
Para ver datos reales se levanta `beauty-salon-infra` y se usa
`VITE_API_BASE_URL=http://localhost:3000/v1`.

## Entregables

| Checkpoint | Archivo |
|---|---|
| CP1 | `docs/01-ux-audit.md` |
| CP2 | `docs/02-design-tokens.md` |
| CP3 | `docs/03-states.md` |
| CP4 | `docs/04-a11y-responsive.md` |
