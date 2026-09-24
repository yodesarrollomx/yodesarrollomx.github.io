# Amalaya · plan de acción UX v2

Acordado con Alejandro el 24-sep-2026. Board: `yodesarrollo/amalaya-board`,
en vivo en `yodesarrollo.github.io/amalaya-board`. Este archivo es la fuente
del `/goal`: cada fase termina con su criterio de «listo» comprobable.

## Meta

Amalaya queda con entrada con Google sin fricción, accesos por persona desde
un engrane ⚙️, un mapa que nace en 2D y se levanta en 3D por capas, fichas,
finanzas y reporte más claros, peticiones con detalle antes/después, un
mini MOAC propio, ayuda por pantalla, y La Chinche con revisión diaria. Todo
probado en el simulador antes de publicar, sin romper lo que ya funciona.

## Decisiones tomadas

- **Amalaya se queda separado.** No se muda a `yodesarrollomx`. Tiene su
  propio acceso, su propia pila de chinches y su propio MOAC. Lo único
  compartido es la **revisión diaria**, que corre las dos cosas en la misma
  corrida (YOD OS y Amalaya) sin mezclarlas.
- **Nada hardcodeado ni público:** datos, historial, versiones y renders viven
  en el Sheet «AMALAYA - Control» y en Drive. El repo solo lleva la careta.
- **El servidor valida todo** (Apps Script). El front solo esconde.
- **Lo que se pidió «discreto»** se hace chico, al margen, sin robar pantalla.

## Reglas de trabajo

1. Una rama por fase y un PR por fase; se publica a `main` solo con el visto
   bueno de Alejandro.
2. Antes de cada PR: `npm run pruebas`, `npm run build` y el simulador
   (`herramientas/simulador`, board `amalaya`) con capturas de antes y después.
3. Cambios al Apps Script: se entregan como archivo completo y se re-despliegan
   con «Nueva versión» (la URL `/exec` no cambia). Nunca se prueba con POST
   contra el `/exec` real.
4. Toda columna nueva del Sheet se agrega al final de su pestaña en `TABS`
   (el Code.gs la crea en caliente).

---

## Fase 0 · Preparación (sin cambios visibles)

- Abrir una sesión de trabajo con `yodesarrollo/amalaya-board` como repo
  principal (la sesión actual no puede escribir ahí).
- Pasar el simulador y su board `amalaya` al repo de Amalaya
  (`herramientas/simulador/`) y agregar `npm run simular`.
- Hacer que el simulador pinte el mapa aunque no haya internet (mosaicos de
  prueba locales) para poder revisar la Fase 2.
- Archivar el repo viejo `alexpueblag/amalaya-board` (confunde).

**Listo cuando:** `npm run simular` deja 10+ capturas, incluido el mapa.

## Fase 1 · Entrada y accesos

**Portada**
- Quitar «Ver el proyecto» (la demostración) de la portada. `data.json`
  sigue existiendo solo para el simulador y las pruebas.
- Corregir el renglón «Distrito de música y ciudad · Hermosillo».
- Tres formas de entrar, en este orden: **Continuar con Google**, **mandarme
  mi liga por correo**, y «tengo un código» chiquito abajo.
- «Peticiones a la ciudad» se queda público.

**Google (propio de Amalaya, sin el Portero)**
- Botón de Google Identity Services en la portada.
- Acción nueva `google` en Code.gs: valida el `id_token` con
  `oauth2.googleapis.com/tokeninfo`, exige `aud` = client_id y
  `email_verified`, busca el correo en `Usuarios` con `activo = si` y entrega
  una sesión (misma forma que la liga). Nunca crea usuarios solo.
- El `client_id` vive en `Config` (clave `google_client_id`) y lo entrega
  `ping`. Es público por diseño; no va en el código.

**Engrane ⚙️ (dar accesos como en YOD OS)**
- Solo admin ve el ⚙️ en el encabezado. Abre el panel de accesos (lo que hoy
  es «Equipo») como ventana lateral.
- Alta por correo, rol, activo/inactivo, liga y código, con:
  texto en cada botón, confirmación antes de apagar a alguien, último acceso
  y cambio de rol desde la tarjeta.
- Rol nuevo **máster** (editor + congelar versiones del reporte). Roles
  quedan: admin, máster, editor, visor, inversionista.
- Columna nueva `ultimo_acceso` en `Usuarios`; la escribe el servidor en
  `login`/`google`.

**Listo cuando:** en el simulador se entra con Google falso, con liga y con
código; el ⚙️ solo aparece para admin; apagar a alguien pide confirmación.

**Lo que tiene que hacer Alejandro:** crear (o reutilizar) el client_id de
Google con el origen `https://yodesarrollo.github.io` autorizado, pegarlo en
`Config`, y re-desplegar el Apps Script.

## Fase 2 · Mapa

- **Nace en 2D:** vista cenital del polígono sobre satélite.
- **Entrada animada por capas** (una sola vez al cargar, ~4 s, se puede saltar
  tocando): satélite → lámina de colores de los espacios (aparece con un
  fundido) → rutas trazándose → puntos del recorrido.
- **Vuelo de dron:** al terminar las capas, la cámara se inclina y gira hacia
  el 3D.
- **3D solo en los edificios del proyecto:** los espacios del Sheet como
  volúmenes; la ciudad queda plana.
- **Indicador de avance sobre cada volumen:** 5 rayitas (idea, negociación,
  proyecto, obra, operando), llenas hasta su estado. Se ven desde la vista
  general.
- **Lista y buscador de espacios** en un costado (en teléfono, hoja de abajo).
- **Guía de primera vez:** 3 globos (girar, acercar, tocar un espacio); no
  vuelve a salir.
- Respeta `prefers-reduced-motion` (sin vuelo, directo al final).

**Listo cuando:** el video del simulador muestra la secuencia completa y el
indicador de cada espacio coincide con su `estado_desarrollo` del Sheet.

## Fase 3 · Ficha del espacio y 360

- Resumen arriba: m² construidos, utilidad anual, estado.
- «Siguiente paso» del termómetro, una línea discreta con su botón.
- **Historial:** pestaña nueva `Historial` en el Sheet
  (`fecha, usuario, tab, llave, campo, antes, despues`), la escribe el
  servidor en cada `guardar/crear/borrar`. En la ficha se ven los últimos 20.
- Botones anterior / siguiente espacio.
- **360 antes/después sobre la misma foto:** cada punto del recorrido acepta
  un render guardado en Drive (`Archivos`, tipo `render360`, ligado al id del
  punto). El slider revela el render encima de la foto real. Mientras no
  exista, el slider se ve apagado con «Render en camino».

**Listo cuando:** en el simulador un cambio deja su renglón en `Historial` y
un punto con render de prueba muestra el slider funcionando.

## Fase 4 · Finanzas (todo discreto)

- Autocompletar nombres de factores al escribir una fórmula.
- Tarjetas cerradas por defecto (nombre + utilidad); se abren al tocar.
- Comparar dos escenarios lado a lado.
- Supuesto visible bajo cada línea; marca suave si falta.
- «¿Y si…?»: un control chico ±% en ocupación y precios que no guarda nada.

**Listo cuando:** las pruebas del motor siguen pasando y el simulador muestra
autocompletar, comparación y el «¿y si…?».

## Fase 5 · Reporte

- Índice arriba.
- Valor por acción **desglosado por espacio**: qué parte de cada acción
  representa cada espacio (barra apilada + tabla).
- Sección «Supuestos y fuentes» al final.
- **Versiones congeladas:** solo máster/admin. Congelar guarda un JSON con
  fecha en Drive (`AMALAYA/Reportes`) y una fila en la pestaña nueva
  `Versiones`. El inversionista ve la última congelada si existe.
- Vista previa antes del PDF, discreta.

**Listo cuando:** congelar desde el simulador crea la versión y un editor
normal no ve el botón.

## Fase 6 · Peticiones y mini MOAC

**Peticiones a la ciudad**
- Lista agrupada por ruta, sin barra de avance.
- Ventana de detalle por petición: texto, estado, foto actual y render
  antes/después con slider. El recorrido 360 se queda como está.

**Mini MOAC de Amalaya** (el mismo modelo del MOAC de Operación semanal,
propio de Amalaya y más simple)
- Pestañas nuevas en el Sheet: `Metas`, `Objetivos`
  (`meta, texto, responsable, fecha, estado`) y las **acciones** son las
  `Tareas` de siempre con una columna nueva `objetivo_id`.
- Sección nueva «Plan de acción» (editor+): metas → objetivos → acciones con
  responsable, fecha y semáforo; contador «acciones sin objetivo» (la regla
  D.2 del MOAC: toda acción cierra un objetivo).
- Las acciones pueden ligarse a un espacio o a una petición.

**Listo cuando:** en el simulador se crea una meta, un objetivo y una acción
ligada a una petición, y el contador llega a 0.

## Fase 7 · Ayuda, La Chinche y revisión diaria

**Ayuda**
- Un «?» por sección que explica solo esa pantalla.
- GIFs cortos (grabados con el simulador): mover un espacio, trazar una ruta,
  escribir una fórmula.
- El Bato como mascota simple y opcional; si estorba, se quita.

**La Chinche en Amalaya (pila propia)**
- Copia adaptada de `yod-portal/chinche.js` con su propia base
  (`amalayaChinche`), quien clava sale de la sesión de Amalaya.
- «Mandar a Claude» abre un issue en `yodesarrollo/amalaya-board` con
  etiqueta `chinche`.

**Revisión diaria que corre las dos cosas**
- La rutina «Revisor de chinches YOD» (07:30) revisa también los issues
  `chinche` de `yodesarrollo/amalaya-board`, en un bloque aparte.
- El «Vigía diario» de YOD OS agrega un bloque Amalaya: la página responde
  200, el `/exec` contesta el `GET` de salud y `npm run pruebas` pasa.

**Listo cuando:** una chinche de prueba en Amalaya se vuelve issue, la rutina
la toma en su corrida de las 07:30 y el vigía reporta Amalaya en su tabla.

**Lo que tiene que hacer Alejandro:** instalar la app de Claude en la cuenta
`yodesarrollo` de GitHub y agregar ese repo a la sesión de la rutina.

---

## Orden y calendario sugerido

| Día | Fase |
|---|---|
| 1 | Fase 0 · Fase 1 (portada y Google) |
| 2 | Fase 1 (engrane ⚙️ y roles) |
| 3–4 | Fase 2 · Mapa |
| 5 | Fase 3 · Ficha, historial y 360 |
| 6 | Fase 4 · Finanzas |
| 7 | Fase 5 · Reporte |
| 8–9 | Fase 6 · Peticiones y mini MOAC |
| 10 | Fase 7 · Ayuda, Chinche y revisión |

Cada día termina con un PR y capturas del simulador para aprobar.

## Riesgos

- **Mapa sin internet en el simulador:** si los mosaicos de prueba no bastan,
  la Fase 2 se revisa en vivo con Alejandro en Chrome.
- **Apps Script:** varias fases lo tocan; se entrega un solo Code.gs
  acumulado por fase para no desplegar versiones a medias.
- **Cuota de Google:** el historial escribe en cada cambio; si pesa, se agrupa.
