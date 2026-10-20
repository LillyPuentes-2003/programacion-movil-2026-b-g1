# CP2 - Patrón de navegación y tokens de diseño

## Patrón de navegación: pestañas abajo + pila para el detalle

ManiCita tiene tres secciones principales para la clienta:

| Pestaña | Ruta | Qué hace la usuaria ahí |
|---|---|---|
| Servicios | `/services` | Explorar el catálogo y filtrar por tipo de manicure. Es lo que más se usa y se puede hacer sin cuenta |
| Mis citas | `/my-appointments` | Ver sus citas próximas y pasadas (HU-16, todavía sin datos: por ahora invita a iniciar sesión) |
| Cuenta | `/login` | Iniciar sesión o crear cuenta (`/register`) |

Por qué pestañas y no menú lateral:

- Son 3 secciones, dentro del rango de 3 a 5 donde las pestañas funcionan bien.
- La acción más frecuente (ver servicios y volver a mirar otro) tiene que estar a un toque y con el pulgar.
  Un menú lateral escondería "Cuenta" detrás de un ícono, que es justo el problema del hallazgo 1 de la auditoría.
- El detalle del servicio (`/service/:serviceId`) no es una sección sino un paso dentro de Servicios,
  por eso se abre como pila encima del catálogo, con botón de volver.

Implementación: `app/src/core/routing/PublicStack.tsx` (IonTabs + IonTabBar con `aria-label` en cada botón)
y `app/src/features/appointments/presentation/MyAppointmentsScreen.tsx`.

## Tokens

Definidos una sola vez en `app/src/core/theme/tokens.css`; `variables.css` conecta el color de marca
con los colores de Ionic (`--ion-color-primary`) para que IonTabBar, IonRefresher y los toasts usen el mismo rosa.

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-brand` (primario) | `#a8456b` | `#e8a0bc` | Botones, precio, pestaña activa |
| `--color-on-brand` (nuevo) | `#ffffff` | `#1f1a1d` | Texto encima de un botón de marca |
| `--color-brand-soft` (secundario) | `#f7e8ee` | `#3a2630` | Chip seleccionado, fondo de imagen |
| `--color-success` | `#2f6b4f` | `#7fbf9e` | Cita confirmada |
| `--color-error` | `#a32b2b` | `#f09a9a` | Errores de campo y de carga |
| `--color-background` | `#fbf7f8` | `#0f0c0e` | Fondo de pantalla |
| `--color-surface` | `#ffffff` | `#1a1518` | Tarjetas y campos |
| `--color-text-primary` | `#1f1a1d` | `#f5eff2` | Texto principal |
| `--color-text-secondary` | `#6b5f65` | `#b7a9af` | Duración, salón, ayudas |

### Tipografía (en `rem`, para que crezca con el tamaño de letra del sistema)

| Token | Valor | Antes | Uso |
|---|---|---|---|
| `--font-size-display` | `1.75rem` | 28px | Título "Servicios" |
| `--font-size-title` | `1.25rem` | 20px | Nombre del servicio, título de estado vacío |
| `--font-size-body` | `1rem` | 16px | Texto normal y campos |
| `--font-size-label` | `0.875rem` | 14px | Nombre en la tarjeta, botones |
| `--font-size-caption` | `0.75rem` | 12px | Duración, salón, banners |

### Espacios

`--space-xs` 4px, `--space-sm` 8px, `--space-md` 12px, `--space-lg` 16px, `--space-xl` 24px, `--space-xxl` 32px
(ya existían; se mantienen). Nuevo: `--touch-target: 44px` para chips y botones pequeños.

## Contraste de cada par texto / fondo

Calculado con la fórmula de WCAG 2.1 (la misma que usa el verificador de WebAIM, https://webaim.org/resources/contrastchecker/).
Mínimo exigido: 4.5 a 1 para texto normal.

| Texto | Fondo | Modo | Relación | ¿Cumple? |
|---|---|---|---|---|
| `#1f1a1d` texto principal | `#fbf7f8` fondo | Claro | 16.15 : 1 | Sí |
| `#6b5f65` texto secundario | `#ffffff` tarjeta | Claro | 6.09 : 1 | Sí |
| `#ffffff` on-brand | `#a8456b` botón | Claro | 5.63 : 1 | Sí |
| `#a8456b` precio | `#ffffff` tarjeta | Claro | 5.63 : 1 | Sí |
| `#a8456b` chip activo | `#f7e8ee` chip | Claro | 4.76 : 1 | Sí |
| `#a32b2b` error | `#ffffff` | Claro | 7.15 : 1 | Sí |
| `#2f6b4f` éxito | `#ffffff` | Claro | 6.29 : 1 | Sí |
| `#f5eff2` texto principal | `#0f0c0e` fondo | Oscuro | 17.15 : 1 | Sí |
| `#b7a9af` texto secundario | `#1a1518` tarjeta | Oscuro | 7.99 : 1 | Sí |
| `#ffffff` texto del botón (antes) | `#e8a0bc` botón | Oscuro | **2.06 : 1** | **No** |
| `#1f1a1d` on-brand (después) | `#e8a0bc` botón | Oscuro | 8.32 : 1 | Sí |
| `#e8a0bc` precio | `#1a1518` tarjeta | Oscuro | 8.75 : 1 | Sí |
| `#e8a0bc` chip activo | `#3a2630` chip | Oscuro | 6.79 : 1 | Sí |
| `#f09a9a` error | `#1a1518` | Oscuro | 8.41 : 1 | Sí |
| `#7fbf9e` éxito | `#1a1518` | Oscuro | 8.46 : 1 | Sí |

El único par que fallaba es el botón en modo oscuro (hallazgo 12 de la auditoría); se arregla con `--color-on-brand`.
