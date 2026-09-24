# Amalaya · plan de mejoras UX v2

Acordado con Alejandro el 24-sep-2026 a partir de la revisión de 5 mejoras por
sección. Repo del board: `yodesarrollo/amalaya-board` (en vivo en
`yodesarrollo.github.io/amalaya-board`). Solo entra aquí lo que se aprobó.

Reglas que no cambian: el Sheet es la única fuente de verdad, nada de datos
reales ni cosas hardcodeadas en el repo público, y el servidor valida todo.

## Decisión previa: mudar Amalaya a `yodesarrollomx`

Dos cosas de este plan dependen de que Amalaya viva en el mismo origen que
YOD OS (`yodesarrollomx.github.io`):

- **Entrar con Google como en YOD OS.** La sesión del Portero
  (`pyod_clave_v1`) vive en el `localStorage` de ese origen. Desde
  `yodesarrollo.github.io` no se comparte y habría que entrar dos veces.
- **La Chinche.** Guarda en IndexedDB por origen. En otro origen, las
  chinches de Amalaya quedarían en una pila aparte de la de YOD OS.

Además quedaría bajo `tableros.yodesarrollo.mx` como los demás. Pendiente
de confirmar.

## Fase 1 · Acceso

- Quitar la demostración de la portada.
- Entrada con Google y liga por correo usando el **Portero de YOD OS**
  (`potenciales-yod/portero.js`), sin pasos de más.
- Dar accesos igual que en YOD OS: Amalaya como un tablero más en la hoja
  ACCESOS y en `accesos.html` (código de tablero nuevo, p. ej. `AM`). El
  Apps Script de Amalaya valida el token con el canje del Portero.
- Corregir el renglón «Distrito de música y ciudad · Hermosillo» que se parte.
- No: sesiones por aparato. No: entrar siempre al último tablero.

## Fase 2 · Mapa

- **Nace en 2D** (satélite) y al cargar hace un **vuelo tipo dron** que
  inclina la cámara hacia el 3D.
- **Carga por capas, animada:** satélite → lámina de colores de los
  espacios → rutas y sus puntos del recorrido.
- **Solo los edificios del proyecto** en 3D; el resto de la ciudad plano.
- **Indicador de avance** sobre cada volumen: puntos o rayitas sencillas
  (idea → negociación → proyecto → obra → operando).
- Lista o buscador de espacios.
- Guía de la primera vez (girar, acercar, tocar un espacio).
- No: deshacer al mover.

## Fase 3 · Ficha del espacio

- Resumen arriba (m² construidos, utilidad, estado).
- «Siguiente paso» del termómetro, discreto.
- Historial de cambios guardado en el Sheet o Drive (pestaña nueva), nada
  en el repo.
- Botones anterior / siguiente espacio.
- En el 360 de cada punto: slider antes / después sobre **la misma foto**,
  con el render encima, cuando exista el diseño.

## Fase 4 · Finanzas (todas «discretas»)

- Sugerir nombres de factores al escribir una fórmula (se prueba).
- Tarjetas cerradas por defecto (se prueba).
- Comparar dos escenarios lado a lado.
- Supuesto visible en cada línea.
- Prueba «¿y si…?» (±% en ocupación y precios).

## Fase 5 · Reporte

- Sección «Supuestos y fuentes».
- Versiones congeladas con fecha; solo editores máster (permiso por
  definir).
- Índice arriba.
- Valor por acción desglosado **por espacio**: qué parte de la acción
  representa cada uno.
- Vista previa antes del PDF, discreta.

## Fase 6 · Peticiones a la ciudad

- Lista agrupada por ruta, sin barra de avance por ahora.
- Ventana de detalle por petición: foto, render antes / después.
- **Mini MOAC**: control de acciones y responsables del equipo (acción,
  responsable, fecha, estado), en una pestaña nueva del Sheet.
- No: compartir la liga pública. No: exportar.

## Fase 7 · Equipo

- Texto en los botones de ícono, confirmación antes de apagar a alguien,
  último acceso, cambio de rol desde la tarjeta.
- Si la Fase 1 pasa los accesos al Portero, esta pantalla se replantea.
  **Se planea completo antes de construir** (lo pidió Alejandro).

## Fase 8 · Ayuda y revisión

- Ayuda según la pantalla.
- El Bato solo como mascota simple y opcional.
- GIFs cortos de cómo hacer las cosas.
- **La Chinche** (`yod-portal/chinche.js`) cargada en Amalaya.
- El **Vigía diario** de YOD OS (`yod-portal/.github/workflows/vigia-diario.yml`)
  revisa también Amalaya en la misma corrida: salud de la página, del
  `/exec` (solo `ping`) y las pruebas del repo.

## Por confirmar

1. ¿Se muda Amalaya a `yodesarrollomx`?
2. ¿Qué es la «sala» donde se definen los editores máster?
3. ¿MOAC = matriz de acciones, responsables y compromisos? ¿Qué columnas?

## Cómo se prueba cada fase

Con el simulador (`herramientas/simulador`, board `amalaya`): capturas de
antes y después de cada pantalla, sin tocar el Sheet real.
