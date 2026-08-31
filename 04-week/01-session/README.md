# ManiCita — Planificación del proyecto móvil

**Estudiante:** Lilly Signey Puentes Rincon
**Asignatura:** Programación Móvil [G1] — 2026-B
**Actividad:** Corte 1 · Semana 4 — Planificación del proyecto móvil

**Qué contiene esta carpeta**

| Archivo | Qué es |
| --- | --- |
| `README.md` | Este documento: idea, MVP, flujos, historias, backlog, tipo de app y metodología |
| `bpmn-manicita.html` | Diagramas **BPMN** de los dos procesos del aplicativo (abrir en el navegador) |
| `c4-nivel1-manicita.html` | **Modelo C4 — Nivel 1** (contexto del sistema) |

---

## Project pitch (English)

In Neiva, booking a manicure still happens through WhatsApp messages and Instagram DMs. The client has to ask for the price list, then ask which days are free, and wait hours for an answer, while the manicurist keeps her agenda in a notebook and sometimes books two clients at the same hour. ManiCita is a mobile app with two sides: the manicurist publishes her services with a description, a real price, how long each one takes, which professional performs it and the hours she works, and the client browses that catalog and books an appointment on a slot that is actually free. It is made for women in Neiva between 18 and 45 who get their nails done every month, and for the independent manicurists and small nail salons of the city who need a simple way to show what they offer and when. The MVP covers three things end to end: publishing a service with its availability, browsing and choosing a service, and booking the appointment so that it appears both in the client's list and in the salon's agenda. Payments stay outside the app, because in Neiva this service is still paid in cash or by transfer at the salon, and adding payments to the MVP would delay the only thing that really needs to be proven: that a real appointment can be booked without a single WhatsApp message.

---

## 1. Idea de la app: problema, público y MVP

**Nombre:** ManiCita

### Problema

En Neiva, agendar una cita de manicure se hace por WhatsApp o por mensaje directo de Instagram, y eso genera problemas en los dos lados:

**Del lado de la clienta.** Tiene que escribir para preguntar precios, volver a escribir para preguntar qué días hay libres y esperar la respuesta, que muchas veces llega horas después. No hay un lugar donde comparar quién presta el servicio, cuánto cobra y cuánto se demora. Cuando por fin acuerdan una hora, la cita queda solo en un chat: no hay confirmación formal ni recordatorio.

**Del lado del negocio.** La manicurista lleva la agenda en un cuaderno o en las notas del celular, así que se le cruzan dos clientas a la misma hora, se le olvidan citas y pierde el cupo cuando alguien no llega y no avisó. Además pasa el día contestando los mismos tres mensajes: "¿cuánto vale?", "¿qué días tienes?", "¿a qué horas?".

### Público

ManiCita tiene **dos tipos de usuario**, y los dos son necesarios para que la app funcione:

| Usuario | Quién es | Qué necesita |
| --- | --- | --- |
| **Clienta** | Mujeres de Neiva entre 18 y 45 años que se hacen las uñas una o dos veces al mes y que hoy agendan por WhatsApp | Ver qué hay, cuánto vale y qué horas están libres, y reservar sin tener que escribirle a nadie |
| **Negocio / emprendedora** | Manicuristas independientes que trabajan desde su casa y pequeños salones de la ciudad, con una o varias profesionales | Publicar sus servicios y su horario una sola vez, y que las citas le lleguen ya organizadas |

### Análisis: ¿cuál es realmente el mínimo producto viable?

ManiCita es un **producto de dos lados**: hay quien ofrece el servicio y quien lo consume. Eso cambia por completo cómo se define el MVP, y aquí está la decisión más importante del proyecto:

> **Si solo se construye el lado de la clienta, la app abre con el catálogo vacío y no hay absolutamente nada que agendar.** Por eso la publicación del servicio por parte del negocio no es una función "deseable" que se deja para el final: es parte del mínimo.

El MVP entonces no se define por pantallas bonitas sino por **cerrar un ciclo completo una sola vez**:

```
El negocio publica su servicio y su horario
        ↓
La clienta lo encuentra en el catálogo
        ↓
La clienta agenda sobre un cupo que existe de verdad
        ↓
La cita aparece en "Mis citas" de la clienta y en la agenda del negocio
```

**La prueba del MVP** es concreta: que una manicurista real de Neiva publique su servicio y que una clienta real agende con ella **sin escribir un solo mensaje de WhatsApp**. Si eso ocurre una vez de punta a punta, el MVP cumplió; si no ocurre, ninguna otra función lo salva.

### MVP — 3 funciones imprescindibles

**1. Publicar el servicio y su disponibilidad** *(lado del negocio)*

El negocio crea un servicio con **nombre, descripción, precio, duración**, escoge **cuál profesional lo atiende** y define su **horario de atención**. Con eso la app calcula sola los cupos agendables. También puede **pausar** un servicio cuando no lo esté prestando, sin borrarlo.

**2. Explorar y elegir el servicio** *(lado de la clienta)*

La clienta ve el catálogo de servicios de manicure de la ciudad (tradicional, semipermanente, acrílicas, retiro, decoración), puede filtrar por tipo, y al abrir uno ve la descripción completa, el precio, cuánto se demora, quién lo atiende y dónde queda.

**3. Agendar la cita sobre un cupo real** *(el ciclo se cierra)*

La clienta escoge fecha y hora **solo entre las que el profesional tiene realmente libres**, confirma, y la cita queda registrada: le aparece a ella con su resumen y le llega al negocio en su agenda.

### Alcance — qué queda fuera del MVP y por qué

| Fuera del MVP | Por qué se recorta |
| --- | --- |
| **Pagos dentro de la app** | En Neiva este servicio se paga en efectivo o por transferencia en el local. Meter una pasarela agrega comisiones, trámites y semanas de desarrollo para resolver algo que hoy no está roto |
| **Chat entre clienta y negocio** | Es justo lo que la app viene a reemplazar. Si se pone un chat, todo vuelve a resolverse por mensajes y el agendamiento nunca se usa |
| **Calificaciones y reseñas** | Sin volumen de usuarios las reseñas están vacías o son de la propia familia: no aportan confianza al inicio |
| **Mapa con salones cercanos** | Requiere permisos de ubicación y datos georreferenciados de todos los negocios. Con mostrar la dirección alcanza para el MVP |
| **Promociones y programa de fidelidad** | Es una función de crecimiento, no de funcionamiento |

---

## 2. Flujos del aplicativo

Los diagramas completos están en **`bpmn-manicita.html`** (dos procesos en notación BPMN). Aquí va la versión en texto.

### 2.1 Flujo del negocio / emprendedora — publicar el servicio

1. Se registra en la app como negocio (nombre del salón, dirección, celular).
2. Registra a **las profesionales** que atienden (puede ser ella sola o su equipo).
3. Crea un **servicio**: nombre y descripción de lo que incluye.
4. Le pone **precio y duración** (la duración es clave: de ahí salen los cupos).
5. **Asigna la profesional** que presta ese servicio.
6. Define el **horario de atención** de esa profesional por día de la semana.
7. La app valida que no falte información, **genera los cupos agendables** dividiendo el horario entre la duración del servicio, y **publica** el servicio en el catálogo.
8. Cuando no vaya a atender, **pausa** el servicio: deja de aparecer en el catálogo, pero las citas ya agendadas se respetan.

### 2.2 Flujo de la clienta — agendar la cita

1. Abre la app y **explora el catálogo**, filtrando por tipo de servicio.
2. Abre el **detalle**: descripción, precio, duración, profesional y dirección.
3. **Elige una fecha**.
4. La app le muestra **solo las horas libres** de esa profesional ese día. Si no hay ninguna, se lo dice y la devuelve a escoger otra fecha.
5. **Selecciona la hora y confirma**. Si en ese momento otra clienta ya tomó ese cupo, la app se lo avisa y le vuelve a mostrar las horas disponibles.
6. La cita queda **registrada en estado Pendiente** y le llega la notificación al negocio.
7. El negocio **confirma** (o rechaza indicando el motivo) y la clienta recibe el aviso.
8. La cita aparece en **"Mis citas"**, desde donde la clienta la puede consultar o cancelar.

### 2.3 Reglas de negocio que sostienen los dos flujos

Estas reglas son las que evitan que la app repita los errores del cuaderno:

- **Los cupos no se crean a mano, se calculan.** `horario de atención ÷ duración del servicio = cupos del día`. Así la manicurista configura una sola vez y no vuelve a tocarlo.
- **Una profesional no puede tener dos citas a la misma hora.** La validación se hace sobre la profesional, no sobre el salón: un salón con tres manicuristas puede atender tres clientas simultáneas.
- **El cupo se valida dos veces**: al mostrar las horas y otra vez al confirmar. Entre esos dos momentos otra clienta pudo reservar.
- **Estados de la cita:** `Pendiente → Confirmada → Atendida`, con las salidas `Cancelada` y `No asistió`. Tener estados y no solo "existe/no existe" es lo que después permite medir cuántas clientas no llegan.
- **Cancelar libera el cupo** y lo devuelve al catálogo, hasta 2 horas antes de la cita.
- **Pausar un servicio no borra las citas ya agendadas.**

---

## 3. Historias de usuario y backlog priorizado

### Historias de usuario

**H1 — Crear y publicar un servicio** · *Imprescindible*

Como **manicurista**, quiero crear un servicio con su nombre, descripción, precio y duración, para que las clientas sepan exactamente qué ofrezco y cuánto cuesta sin tener que preguntarme.

Criterios de aceptación:

- Dado que lleno nombre, descripción, precio y duración en minutos, cuando guardo, entonces el servicio queda creado y aparece en mi lista de servicios.
- Dado que dejo el precio o la duración vacíos, cuando intento guardar, entonces la app no guarda y me señala los campos que faltan.
- Dado que ya tengo un servicio creado, entonces lo puedo editar o pausar, y al pausarlo deja de aparecer en el catálogo pero mis citas ya agendadas se mantienen.

**H2 — Asignar profesional y definir el horario de atención** · *Imprescindible*

Como **manicurista**, quiero indicar quién atiende cada servicio y en qué horario, para que las clientas solo puedan agendar en horas en las que realmente estamos.

Criterios de aceptación:

- Dado que registro una profesional y la asigno a un servicio, entonces ese servicio queda ligado a ella y a su horario.
- Dado que defino el horario de atención por día de la semana (por ejemplo, lunes a viernes de 8:00 a 18:00), entonces la app genera los cupos dividiendo ese rango entre la duración del servicio.
- Dado que un día no atiendo, cuando lo marco como no disponible, entonces ese día no ofrece ningún cupo a las clientas.

**H3 — Explorar el catálogo y ver el detalle del servicio** · *Imprescindible*

Como **clienta**, quiero ver los servicios de manicure disponibles con su precio, duración y quién los atiende, para elegir cuál quiero antes de agendar.

Criterios de aceptación:

- Dado que abro la app, entonces veo la lista de servicios publicados con nombre, precio en pesos, duración y el nombre del negocio.
- Dado que filtro por tipo de servicio (por ejemplo, semipermanente), entonces la lista muestra únicamente los servicios de ese tipo.
- Dado que selecciono un servicio, entonces veo su descripción completa, la profesional que lo atiende, la dirección y el botón "Agendar cita".

**H4 — Agendar una cita** · *Imprescindible*

Como **clienta**, quiero escoger fecha y hora entre las que están libres, para dejar mi cita reservada sin escribirle a nadie.

Criterios de aceptación:

- Dado que elijo un servicio y una fecha, entonces la app muestra únicamente las horas libres de esa profesional ese día.
- Dado que ese día no tiene ninguna hora libre, entonces la app me lo indica y me deja escoger otra fecha, en vez de mostrar una lista vacía.
- Dado que selecciono una hora y confirmo, entonces la cita queda en estado Pendiente y veo un resumen con servicio, profesional, fecha, hora, dirección y precio.
- Dado que otra clienta tomó ese cupo mientras yo decidía, cuando confirmo, entonces la app me avisa que ya no está disponible y me devuelve a la lista de horas actualizada.

**H5 — Ver y cancelar mis citas** · *Deseable*

Como **clienta**, quiero ver mis citas agendadas y poder cancelarlas, para llevar control de lo que reservé y avisar a tiempo si no puedo ir.

Criterios de aceptación:

- Dado que entro a "Mis citas", entonces veo mis citas próximas ordenadas de la más cercana a la más lejana, y aparte el historial de las ya pasadas.
- Dado que cancelo una cita, entonces la app pide confirmación y, al aceptar, el cupo vuelve a quedar disponible para otras clientas.
- Dado que faltan menos de 2 horas para la cita, cuando intento cancelar, entonces la app indica que ya no se puede cancelar por ese medio.

**H6 — Gestionar la agenda del día** · *Deseable*

Como **manicurista**, quiero ver mis citas del día y marcar qué pasó con cada una, para reemplazar el cuaderno y saber cuántas clientas no llegan.

Criterios de aceptación:

- Dado que entro a "Mi agenda", entonces veo las citas del día ordenadas por hora, con el nombre de la clienta, el servicio y su estado.
- Dado que una cita está Pendiente, entonces la puedo Confirmar o Rechazar indicando el motivo, y la clienta recibe el aviso.
- Dado que la cita ya pasó, entonces la puedo marcar como Atendida o como No asistió.

### Backlog priorizado

| Orden | Historia | Lado | Prioridad | Sprint |
| --- | --- | --- | --- | --- |
| 1 | H1 — Crear y publicar un servicio | Negocio | Imprescindible | Sprint 1 |
| 2 | H2 — Asignar profesional y definir horario | Negocio | Imprescindible | Sprint 1 |
| 3 | H3 — Explorar catálogo y ver detalle | Clienta | Imprescindible | Sprint 2 |
| 4 | H4 — Agendar una cita | Clienta | Imprescindible | Sprint 2 |
| 5 | H5 — Ver y cancelar mis citas | Clienta | Deseable | Sprint 3 |
| 6 | H6 — Gestionar la agenda del día | Negocio | Deseable | Sprint 3 |

### Justificación del orden

- **Sprint 1 — la oferta (H1 y H2).** Se arranca por el lado del negocio porque es el que llena la app. Sin servicios publicados y sin horarios definidos no existe nada que mostrarle a una clienta, así que cualquier pantalla de catálogo construida antes se estaría probando con datos inventados. Al final de este sprint hay algo real que mostrarle a una manicurista de Neiva y pedirle que cargue sus servicios.
- **Sprint 2 — la demanda y la transacción (H3 y H4).** Aquí se cierra el ciclo completo y **el MVP queda funcionando de punta a punta**: la clienta encuentra el servicio y agenda sobre un cupo verdadero. H4 va después de H3 porque no se puede agendar un servicio que todavía no se puede ver. Con el Sprint 2 terminado, la app ya reemplaza al WhatsApp.
- **Sprint 3 — la gestión (H5 y H6).** Son las historias que hacen que la app se use *todos los días* y no una sola vez: la clienta administra lo que reservó y la manicurista deja definitivamente el cuaderno. Son valiosas, pero el MVP funciona sin ellas —tras agendar, la clienta ya recibió su resumen y el negocio ya recibió la notificación—, así que son las primeras candidatas a recortar si el tiempo se acaba.

---

## 4. Tipo de app y metodología

### Tipo de app: híbrida

Elijo desarrollar ManiCita como una **app híbrida**.

- Las clientas de Neiva usan tanto Android como iPhone, y con un solo desarrollo cubro los dos sistemas. Siendo un proyecto de una sola persona en un semestre, mantener dos códigos nativos por separado no es realista.
- La app tiene **dos perfiles de usuario** (clienta y negocio) sobre la misma base. Lo híbrido permite reutilizar componentes, navegación y llamadas al servidor entre los dos perfiles, en vez de duplicar todo cuatro veces (dos perfiles × dos sistemas operativos).
- Lo que hace la app son listas, formularios, un selector de horarios y pantallas de detalle. No hay procesamiento pesado ni gráficos exigentes, así que la pérdida de rendimiento típica de lo híbrido no se alcanza a notar.
- Lo único del dispositivo que necesito son las **notificaciones push** para avisar de las citas, y eso está resuelto en cualquier framework híbrido.
- Descarto la app **nativa** por el costo de mantener dos versiones, y descarto la **web** porque necesito notificaciones y el acceso rápido desde el ícono del celular, que es como la clienta vuelve a la app cada mes.

### Metodología: Scrum

Elijo **Scrum** como metodología.

- El trabajo ya quedó organizado en historias priorizadas y repartidas en tres sprints, que es exactamente la forma de trabajar de Scrum.
- Al terminar el **Sprint 1** ya hay algo que se le puede poner en las manos a una manicurista real y ver si logra publicar sus servicios sola. Esa validación temprana es la que decide si el resto del plan sirve, y en cascada llegaría al final del semestre, cuando ya no hay tiempo de corregir.
- Hay **dos tipos de usuario con necesidades distintas**, y es muy probable que al validar aparezcan reglas que hoy no conozco: manejo de abonos, clientas que no llegan, servicios que se demoran más de lo previsto. Scrum permite ajustar el backlog al cierre de cada sprint sin romper el plan.
- Descarto **cascada** justamente por eso: exige los requisitos cerrados desde el inicio, y aquí van a cambiar en cuanto hable con las primeras usuarias.

---

## 5. Modelo de datos mínimo

Las entidades que se necesitan para sostener el MVP:

| Entidad | Atributos principales | Relación |
| --- | --- | --- |
| **Negocio** | id, nombre, dirección, celular | Tiene muchas Profesionales y muchos Servicios |
| **Profesional** | id, nombre, negocio_id | Pertenece a un Negocio; tiene un Horario |
| **Servicio** | id, nombre, descripción, precio, duración_min, estado (publicado/pausado), profesional_id | Lo presta una Profesional |
| **Horario** | id, profesional_id, día_semana, hora_inicio, hora_fin | Define los cupos generados |
| **Clienta** | id, nombre, celular | Tiene muchas Citas |
| **Cita** | id, clienta_id, servicio_id, profesional_id, fecha, hora, estado | Une los dos lados de la app |

La regla que evita el doble agendamiento vive aquí: **no pueden existir dos Citas con el mismo `profesional_id`, `fecha` y `hora` en estado Pendiente o Confirmada.**

---

## 6. Arquitectura — Modelo C4, Nivel 1

El diagrama de contexto está en **`c4-nivel1-manicita.html`**. En resumen: ManiCita es un sistema usado por dos personas (la **clienta** y la **manicurista**) y se apoya en dos sistemas externos, un **servicio de notificaciones push** para avisar de las citas y un **servicio de mapas** para mostrar la ubicación del salón. No aparece pasarela de pagos porque los pagos quedaron fuera del alcance.

---

## 7. Recomendaciones

1. **Construir primero el lado del negocio.** Es la recomendación más importante y la menos intuitiva: la app se ve más bonita empezando por el catálogo, pero un catálogo sin servicios publicados no se puede ni probar.
2. **No meter pagos en el MVP.** Agrega comisiones, trámites y semanas de desarrollo para resolver algo que hoy no está roto.
3. **Calcular los cupos, no pedirlos.** Que la manicurista configure su horario una sola vez y la app haga la división. Si toca crear los cupos a mano todos los días, deja de usar la app en una semana.
4. **Validar el cupo dos veces** (al mostrarlo y al confirmar). Sin eso, la app reproduce el mismo problema del cuaderno: dos clientas a la misma hora.
5. **Guardar estados de la cita, no solo la cita.** `No asistió` parece un detalle, pero es el dato que después le sirve al negocio para saber cuánto pierde.
6. **Conseguir una manicurista aliada desde el Sprint 1.** Un usuario real probando cada entrega vale más que cualquier suposición del backlog.
