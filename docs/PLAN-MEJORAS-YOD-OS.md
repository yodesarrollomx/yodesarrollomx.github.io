# Plan de mejoras · YOD OS y sus tableros

**Fecha:** 24-sep-2026 · **Alcance revisado:** 17 repos de `yodesarrollomx` (+ `yodesarrollo/amalaya-board`),
sus `CLAUDE.md`, workflows de GitHub Actions, el Portero (`potenciales-yod/portero.js`), la cabina
(`yod-portal/os/*`) y el marco compartido (`os/shell.js`). Cada hallazgo trae archivo y línea para
que quien lo ejecute no tenga que volver a buscarlo.

> **Cómo usar este plan con un loop:** trabajar fase por fase, en orden. Cada punto tiene un ID
> (`F0-1`, `OS-3`…) y un **"Listo cuando"**: esa es la condición de salida. No se pasa de fase
> mientras la anterior tenga puntos abiertos, salvo los marcados 🔑 (requieren un clic de
> Alejandro en Apps Script / Google Cloud / DNS: se dejan escritos y se sigue).

---

## 1 · Diagnóstico: por qué se siente frágil

### 1.1 El bug que reportaste: "Embudo comercial" desde PPP no abre la ventana de 3 pestañas

**Causa confirmada.** Hay dos menús distintos que pintan los mismos tableros:

- En la cabina (`yod-portal/os/app.js:320-336`), un clic en un tablero del embudo se intercepta
  (`esEmbudo()` → `abrirEmbudo()`) y abre la **máscara** con Sala de Edición / Métricas / Plan de Potencial.
- Dentro de un tablero (PPP y los demás envueltos por `os/shell.js`), el menú lateral enlaza
  **directo** al destino: `DEST['SYS-MARKETING'] = …/aurum-board/` (`shell.js:49`, `navItem` en
  `shell.js:148-153`). Llegas a aurum-board "pelón", una sola pantalla, sin la máscara.

Por eso "desde el tablero principal sí funciona y desde PPP no". **Arreglo:** en `shell.js`, que
`SYS-MARKETING` enlace a `OS + '#/embudo/metricas'` (la cabina ya sabe aterrizar en frío en esa
ruta: `app.js:314`). Es el punto **F0-1**.

### 1.2 "Me saca a cada rato" y el login con Google

La sesión **en el servidor ya dura 90 días** (el propio gate lo dice, `portero.js:174`). Lo que te
saca es el **cliente**, por cuatro motivos:

1. **Cada tablero decide por su cuenta si tu sesión murió, y la borra para TODOS.** El token vive
   en `localStorage['pyod_clave_v1']`, compartido por todos los tableros del mismo dominio. Pero:
   - la cabina tolera 3 rechazos seguidos antes de soltarlo (`app.js:548-555`);
   - `portero.js` (PPP y los boards con Portero) lo borra al **segundo** "liga" (`portero.js:268-280`);
   - Real de Miramar solo lo borra al tocar «Salir» (`_pyodCerrar`, `board.js:44`); ante un rechazo solo avisa (corregido al revisar: no es culpable);
   - el shell lo borra al cerrar sesión (`shell.js:206`).
   Un parpadeo del Apps Script (documentado el 9 y 14-sep) en **un** tablero te cierra **todo**.
2. **Tres copias del Portero con reglas distintas.** La URL del Portero está escrita **22 veces**
   en los repos; la lógica de relevo (original → respaldo) está copiada en `app.js:9-15`,
   `shell.js:21-38` y `portero.js:13-36`, con límites distintos (25 s / 75 s / 12 s).
3. **Tres "casas" = tres sesiones.** `alexpueblag.github.io`, `yodesarrollomx.github.io` y (cuando
   exista el DNS) `tableros.yodesarrollo.mx` son orígenes distintos: `localStorage` no se comparte.
   Una liga vieja de WhatsApp te hace entrar "de nuevo". La Sala además guarda su **propia** llave
   (`sala_clave`, `app.js:71`).
4. **El gate todavía ofrece liga mágica y clave de equipo** (`portero.js:138-176, 237-247`;
   `board-aurum/index.html:13`, `board-flujo-yod/index.html:1044`, `yodesarrollo-board/index.html:65`,
   `interiores-aurum/llave-maestra.html:2154`). Tres caminos = tres formas de fallar y más texto
   que leer.

**Fórmula más simple (sin pedir más seguridad de la necesaria):**

| Pieza | Qué hace |
|---|---|
| **Solo Google, con One Tap automático** | `google.accounts.id.initialize({ auto_select: true, use_fedcm_for_prompt: true })` + `prompt()`. Si ya diste permiso una vez, entra **solo**, sin clic. El botón queda de respaldo. |
| **Sesión deslizante de 30 días (mínimo garantizado 72 h)** | Cada canje exitoso renueva el vencimiento en el servidor. Mientras uses el OS al menos una vez al mes, nunca vuelve a pedir. |
| **Re-login silencioso en vez de candado** | Si el token es rechazado, primero se intenta One Tap silencioso; solo si Google no puede, se muestra el botón. Nunca se borra el token por un solo tropiezo. |
| **Una sola regla para soltar la sesión** | Únicamente la cabina (o un `yod-auth.js` común) puede borrar `pyod_clave_v1`, y solo tras 3 rechazos *explícitos* (`clave/revocado/expirado`), nunca por timeout. |
| **Un solo origen** | Todo apunta a `yodesarrollomx.github.io` hasta que exista `tableros.yodesarrollo.mx`; las casas viejas solo reenvían **pasando el token** (el puente que ya hace la Sala). |

### 1.3 Datos y procesos dobles encontrados

| # | Duplicado | Dónde | Riesgo |
|---|---|---|---|
| D1 | Catálogo de tableros en **6 lugares** | Sheet `Portal`, respaldo en `app.js:40-50`, `shell.js` (`DEST/NAME/ICON/CODES`), `portal-core.js` (`DESTINATIONS`), `access-policy.js` (`SYSTEM_CODES`), `potenciales-yod/accesos.html` (`CODES`) | Renombrar/alta en uno y no en otro = menú distinto según dónde estés |
| D2 | Portero: URL ×22, relevo ×3 | ver 1.2 | Cierres de sesión inconsistentes |
| D3 | Código `TA` = MOAC **y** track Alysa | `docs/BACKENDS-PENDIENTES.md` §1 (versión 47 escrita, sin publicar) 🔑 | Dar MOAC regala Casa Alysa |
| D4 | `FL` e `IV` no están en el vocabulario del Portero | `board-flujo-yod/CLAUDE.md` Pendientes, `potenciales-yod/CLAUDE.md` | Colaboradores con acceso rebotan |
| D5 | ~25 repos espejo en `alexpueblag/*` (mismo nombre que en `yodesarrollomx`) + `yodesarrollo.github.io/plan-potencial` sirviendo la app vieja | lista de repos; `plan-potencial/CLAUDE.md` | Se edita el equivocado; datos viejos en línea |
| D6 | `board-aurum` (MOAC) vs `aurum-board` (Métricas) vs `alexpueblag/board-aurum` | nombres de repo | Confusión constante |
| D7 | 5 respaldos `index.html.bak-*` (~11 000 líneas) publicados | `yod-despacho/` | Ruido y código viejo público |
| D8 | 4 filas "Pago Nex" $35k duplicadas | Sheet de Flujo, pestaña Pagos | Saldo de tesorería mal |
| D9 | Vigilantes de salud repetidos | `aurum-board` (uptime c/30 min + salud c/h + token), `amalaya-board/salud.yml` (c/10 min), `yod-portal/vigia-diario.yml`, `sala-edicion` (sonda, máquinas) | Minutos de Actions y avisos dobles |
| D10 | Páginas huérfanas | `yod-portal/os/embudo-c.html`, `os/embudo-dummy.html` (nadie las enlaza) | Ruido |
| D11 | **No hay un folio de proyecto único.** Despacho lista "15 proyectos", Alquimia tiene su pestaña `PROYECTOS`, Interiores su hoja `Proyectos` con claves, Obra/Flujo usan nombres libres | varios Sheets | Un mismo proyecto se escribe distinto en cada tablero; no se puede cruzar |

### 1.4 Seguridad que no puede esperar (antes de cualquier mejora de UX)

- **`interiores-aurum/datos.json` publica las 13 claves de proyecto y el catálogo** (su `CLAUDE.md`,
  Pendientes). Sacar las claves del archivo y rotarlas 🔑.
- `CFG.SITE_BASE` del Portero sigue en `alexpueblag.github.io` (`potenciales-yod/CLAUDE.md`) 🔑.

---

## 2 · El eje de Project Manager: un código para todo

Propuesta de **Registro Maestro de Proyectos** (una pestaña nueva `PROYECTOS` en el Sheet
"YOD OS · Control Maestro", la única fuente):

```
Folio      YOD-<AÑO>-<NNN>        ej. YOD-2026-014
Nombre     "Real de Miramar"       (el que se ve)
Tipo       DES (desarrollo) · ARQ (Aurum) · INT (interiores) · OBR (obra) · COM (comercial)
Etapa      Potencial → Plan → Trámite → Diseño → Obra → Venta → Cierre
Dueño      correo del responsable
Tableros   RM, OB, FL, IN…          (qué tableros lo muestran)
Sheet      id del Sheet Maestro del proyecto
```

Reglas:
1. **Ningún tablero crea proyectos**; todos leen el folio de aquí (selectores de Despacho, Flujo,
   Obra, Interiores, Alquimia).
2. **Toda fila operativa lleva folio** (tarea en MOAC `A-151` → `YOD-2026-014/A-151`; pago en Flujo;
   avance en Obra). Así se detectan duplicados por folio + fecha + monto.
3. **Ciclo de vida visible:** un proyecto nace como lead en PPP/Plan de Potencial, y al convertirse
   se le asigna folio; desde ahí aparece en los demás tableros según su etapa. El tablero cenital
   (`tablero.html`) muestra el conteo por etapa.
4. Una **prueba nocturna** (Action) cruza los Sheets y reporta: filas sin folio, folios inexistentes,
   duplicados (misma clave, mismo día, mismo monto).

---

## 3 · Cinco mejoras por tablero

Formato: **ID · Qué · Por qué · Listo cuando**.

### 3.1 YOD OS · la cabina (`yod-portal/os/`)
- **OS-1 · Barra de "dónde estoy"** (migas: YOD OS › Embudo › Métricas) igual en cabina y shell. *Hoy la cabina y el shell marcan "activo" distinto (`app.js:297-303`).* **Listo:** captura en cabina y en PPP con las mismas migas.
- **OS-2 · ⌘K que busca proyectos por folio**, no solo tableros. **Listo:** teclear `014` o "Miramar" lleva a su ficha.
- **OS-3 · Estado honesto de la conexión en una sola pastilla** (verde / "Google lento, reintentando" / "sin acceso"), sin textos técnicos. Unificar `frasePendiente()` para todo el OS. **Listo:** misma pastilla en cabina y shell.
- **OS-4 · Inicio por rol**: Dirección ve Pulso + decisiones; Sayri ve Sala + pendientes; colaborador ve solo sus tableros. **Listo:** tres cuentas de prueba, tres inicios distintos.
- **OS-5 · Notificación de "hay algo nuevo"** (punto en el menú) cuando un tablero cambió desde tu última visita. **Listo:** el punto aparece y se apaga al entrar.

### 3.2 El marco compartido (`os/shell.js`) y el menú dentro de cada tablero
- **SH-1 · Embudo desde cualquier tablero abre la máscara** (F0-1). **Listo:** desde PPP, clic en "Embudo comercial" → cabina con las 3 pestañas.
- **SH-2 · Menú generado desde UN manifiesto** (`os/catalogo.js`) que leen `app.js`, `shell.js`, `portal-core.js` y `access-policy.js`. **Listo:** `verify-os.cjs` falla si alguien vuelve a escribir un `DEST` a mano.
- **SH-3 · Todo enlace interno abre en la misma pestaña** y conserva el `#` de regreso. **Listo:** ninguna pestaña nueva salvo el sitio público.
- **SH-4 · Arreglar SHELL-10** (encabezado pegajoso bajo la topbar) y el conflicto de temas claro/oscuro (Despacho tuvo que blindarse, `yod-despacho/AUDITORIA.md`). **Listo:** capturas iPhone + escritorio en 3 tableros.
- **SH-5 · El shell nunca borra la sesión**: solo pide a la cabina que la valide. **Listo:** `grep removeItem.*pyod_clave` solo aparece en `yod-auth.js`.

### 3.3 Acceso · Portero y `accesos.html` (`potenciales-yod`)
- **AC-1 · Solo Google con One Tap automático**; quitar liga mágica y clave de equipo de todos los gates. **Listo:** ningún texto "liga mágica"/"clave" en los repos del OS.
- **AC-2 · Sesión deslizante 30 días** (renovación en cada canje) 🔑 en el Code.gs del Portero. **Listo:** entrar, esperar 72 h sin usarlo, volver y seguir dentro.
- **AC-3 · `yod-auth.js` único** (una URL de Portero, un relevo, una regla de expiración) cargado por todos. **Listo:** la URL del Portero aparece en 1 archivo, no 22.
- **AC-4 · Publicar la versión 47** (`TA`/`AL`/`TM`/`TC`, `boards` vacío = sin acceso) y dar de alta `FL`, `IV` 🔑. **Listo:** prueba de humo de `CODIGOS-BOARDS.md` pasa con un colaborador de solo `FL`.
- **AC-5 · Matriz de accesos que muestra el resultado**: al marcar un código se ve "esta persona verá: PPP, Flujo…", y un botón "ver como esta persona". **Listo:** captura de la matriz con la vista previa.

### 3.4 Tablero cenital (`yod-portal/tablero.html`)
- **TC-1 · Conteo por etapa usando el folio** (Potencial→Cierre). **Listo:** los números cuadran con el Registro Maestro.
- **TC-2 · Carga progresiva**: hoy llama a 9 Apps Script; pintar cada hexágono conforme llega, con "—" solo si no hay permiso. **Listo:** primer dato visible < 3 s con caché.
- **TC-3 · TABLERO-48: legible en iPhone** (modo lista bajo 480 px). **Listo:** captura iPhone.
- **TC-4 · Cada hexágono lleva al tablero filtrado por ese proyecto** (`?folio=`). **Listo:** clic en Miramar → Real de Miramar abierto en su ficha.
- **TC-5 · Fecha de "actualizado hace…" por fuente**. **Listo:** cada tarjeta dice su antigüedad.

### 3.5 Embudo comercial (máscara: Sala de Edición · Métricas `aurum-board` · Plan de Potencial)
- **EM-1 · La Sala entra al catálogo con código propio** (`SE`) en vez de colgarse de `MK` (`yod-portal/CLAUDE.md`, "Por confirmar"). **Listo:** Sayri con `SE` sin `MK` ve la Sala y no las Métricas.
- **EM-2 · Una sola llave**: eliminar `sala_clave` separada; la Sala acepta el token del Portero directo. **Listo:** `LLAVES_SALA` desaparece de `app.js`.
- **EM-3 · Métricas con el embudo completo en una vista**: alcance → leads (Plan de Potencial) → citas → cierres, con folio del lead. **Listo:** un lead de prueba se sigue de punta a punta.
- **EM-4 · Encender la CAPI de Meta** (`plan-potencial` `.gs:72-73`) 🔑 para no contar leads dobles. **Listo:** eventos `Lead` deduplicados por `event_id`.
- **EM-5 · Consolidar los 10 workflows de la Sala** en 3 (producción, puente de chinches, salud) y un tablero de "máquinas" legible. **Listo:** `ls .github/workflows` ≤ 4 y el mismo resultado diario.

### 3.6 PPP · Potenciales (`potenciales-yod`)
- **PP-1 · Una sola navegación entre las 6 calculadoras** (macrolotes, mixto, residencial, unifamiliar, patrimonial) con pestañas, no páginas sueltas. **Listo:** se cambia de modelo sin perder el terreno capturado.
- **PP-2 · Guardar el cálculo con folio** y mandarlo al Registro al convertirse. **Listo:** "Convertir a proyecto" crea `YOD-2026-NNN`.
- **PP-3 · Extraer la lógica común** (portada, supuestos, tabla de resultados) de los 6 HTML de 1 000-2 000 líneas a un `motor.js`. **Listo:** cada página < 400 líneas.
- **PP-4 · Comparador de escenarios** lado a lado. **Listo:** dos modelos del mismo terreno en una tabla.
- **PP-5 · Mover `SITE_BASE` a la casa nueva** 🔑. **Listo:** liga de respaldo apunta a yodesarrollomx.

### 3.7 El Despacho (`yod-despacho`)
- **DP-1 · Borrar los 5 `.bak`** (git ya guarda la historia). **Listo:** `ls` sin `.bak`.
- **DP-2 · Selector de proyecto desde el Registro Maestro** (hoy salen 15 del tablero vivo). **Listo:** mismos folios que el resto.
- **DP-3 · Detector de duplicados al "Ponerlo en el tablero"**: si hay una tarjeta parecida (mismo proyecto, texto similar, abierta), preguntar. **Listo:** crear la misma tarea dos veces avisa.
- **DP-4 · Firma con deshacer de 10 s** en vez de confirmación bloqueante. **Listo:** firmar y deshacer sin escribir en el Sheet.
- **DP-5 · Vista "mi semana"** por dueño con días de retraso ordenados. **Listo:** filtro por dueño persistente.

### 3.8 MOAC · Operación semanal (`board-aurum`)
- **MO-1 · Renombrar repos para que no se confundan** (`board-aurum` → `moac-board`, dejando cascarón que reenvía). **Listo:** la liga vieja sigue sirviendo.
- **MO-2 · Actualizar el README** (dice `alexpueblag` y "sync cada 10-15 min" desde la Mac). **Listo:** README describe el flujo real.
- **MO-3 · Tareas con folio + dueño obligatorio**. **Listo:** no se guarda una tarea sin ambos.
- **MO-4 · Vista Kanban por estado** además de la lista semanal. **Listo:** arrastrar cambia el estado en el Sheet.
- **MO-5 · Resumen de la semana** (cerradas / atrasadas / nuevas) arriba. **Listo:** tres números al abrir.

### 3.9 Flujo · Tesorería (`board-flujo-yod`)
- **FL-1 · Limpiar los 4 "Pago Nex" duplicados** 🔑 y agregar validación de duplicado (folio+fecha+monto). **Listo:** saldo cuadra y un pago doble es rechazado.
- **FL-2 · Presupuesto por bolsa capturado** (hoy en 0, el semáforo no sirve). **Listo:** tarjeta Dinero encendida.
- **FL-3 · Credencial de servicio para YodBot** (no depender de que Alejandro abra el board). **Listo:** el sync de WhatsApp escribe sin sesión humana.
- **FL-4 · Proyección a 8 semanas** con compromisos conocidos. **Listo:** gráfica de saldo proyectado.
- **FL-5 · Conciliación**: marcar cada movimiento como conciliado con el banco. **Listo:** % conciliado visible.

### 3.10 AURUM · Interiores / Llave Maestra (`interiores-aurum`)
- **IN-1 · Sacar las 13 claves de `datos.json` y rotarlas** 🔑 (crítico). **Listo:** `curl datos.json` sin `key`.
- **IN-2 · Actualizar `SECURITY-DEPLOY.md` e `instrucciones-llave-maestra.md`** al modelo por rol. **Listo:** sin menciones a `WRITE_SECRET`.
- **IN-3 · Proyecto = folio del Registro** (no clave propia). **Listo:** Residencia Navarro Muñoz con `YOD-…`.
- **IN-4 · Galería de propuesta → aprobación del cliente** con historial. **Listo:** fila en `Historial` al aprobar.
- **IN-5 · Partir `llave-maestra.html` (2 158 líneas)** en vista + datos. **Listo:** archivo principal < 800 líneas.

### 3.11 Real de Miramar (`real-miramar-board`)
- **RM-1 · Dejar de borrar la sesión global** (`board.js:44`) → usar `yod-auth.js`. **Listo:** un error del GAS no te saca del OS.
- **RM-2 · Trámites con fecha compromiso y semáforo** alimentando al Gantt de Alquimia (una sola fuente). **Listo:** mismo trámite, misma fecha en ambos.
- **RM-3 · Segunda capa `fin` con Google** (rol), no clave aparte. **Listo:** sin prompt de clave financiera.
- **RM-4 · "Puertas" siguientes en el hub** (ya iniciado 15-sep) con dueño y fecha. **Listo:** cada puerta tiene responsable.
- **RM-5 · Documentos del trámite ligados a Drive** desde la ficha. **Listo:** clic abre la carpeta.

### 3.12 Codesarrolladores / Inversión (`yodesarrollo-board`) y Codesarrollos (track)
- **IV-1 · Dar de alta `IV` en el Portero** (quitar el `&board=IV` fijo) 🔑. **Listo:** usuario con solo `IV` entra.
- **IV-2 · Cada inversionista ve solo sus proyectos** por folio. **Listo:** dos cuentas, dos carpetas.
- **IV-3 · Unificar con `Co-desarrolladores-Yod`**: hoy ese portal usa **contraseña propia** (`src/App.jsx:1238`); pasarlo a Google. **Listo:** sin campo "Tu contraseña".
- **IV-4 · Track de codesarrollos con folio y etapa** (hoy `TC`/`CO` y tracks sueltos Alysa/María). **Listo:** los tracks salen del Registro.
- **IV-5 · Exportar la carpeta a PDF** desde el tablero. **Listo:** un PDF por proyecto.

### 3.13 Obra en vivo (`yod-portal/obra.html`)
- **OB-1 · Poner `?v=` a `os/access-policy.js`** (hoy se carga sin versión). **Listo:** alineado con `os/index.html`.
- **OB-2 · Avance con foto obligatoria** en CAPTURA. **Listo:** no se propone avance sin foto.
- **OB-3 · Cola de "por verificar/autorizar"** con días esperando. **Listo:** contador visible a VERIFICA/AUTORIZA.
- **OB-4 · Obra ↔ Flujo**: un pago autorizado genera el egreso en Flujo con el mismo folio (sin captura doble). **Listo:** un solo registro, dos vistas.
- **OB-5 · Captura offline en celular** (la obra no siempre tiene señal). **Listo:** capturar en modo avión y sincronizar después.

### 3.14 La Chinche 📌 y la automatización (`chinche.js`, Actions, rutinas)
- **CH-1 · Un solo camino**: la chinche crea el issue directo (hoy: botón por repo en la web + puente de la Sala cada hora). **Listo:** una chinche = un issue en < 5 min.
- **CH-2 · La chinche adjunta automático** URL, tablero, folio y usuario. **Listo:** issue con esos 4 campos.
- **CH-3 · Consolidar vigilantes** (D9) en un solo `vigia` en `yod-portal` que revise todos los tableros y avise una vez. **Listo:** un reporte diario, sin avisos dobles.
- **CH-4 · Panel "máquinas"** en la cabina: último run de cada Action y rutina, en verde/rojo. **Listo:** se ve sin entrar a GitHub.
- **CH-5 · Archivar espejos `alexpueblag/*`** (D5) dejándolos como cascarón o archivados. **Listo:** ningún espejo con código vivo distinto.

### 3.15 Fuera del menú (Alquimia Urbana, CroKiss, Amalaya, Pintarrón)
- **FX-1 · Decidir si entran al OS**: si sí, código + fila en Portal; si no, sacarlos de las ligas internas.
- **FX-2 · Alquimia usa el Registro Maestro** y una sola clave (su "opción B").
- **FX-3 · CroKiss `SITE_BASE`** y triggers de mantenimiento 🔑.
- **FX-4 · Amalaya**: bajar `salud.yml` de cada 10 min a cada hora.
- **FX-5 · Pintarrón**: sin commits desde 27-ago → archivar o integrar a MOAC.

---

## 4 · Fases

| Fase | Nombre | Puntos | Por qué este orden |
|---|---|---|---|
| **F0** | Apagar incendios (1-2 días) | SH-1 (bug del embudo), RM-1, SH-5, OB-1, DP-1, D10, IN-1 🔑 | Bugs visibles y seguridad crítica |
| **F1** | Acceso sin fricción (3-5 días) | AC-1, AC-3, AC-2 🔑, EM-2, AC-4 🔑, IV-1 🔑, IV-3 | Es la queja nº 1: entrar y quedarse dentro |
| **F2** | Una sola fuente de verdad (1 semana) | SH-2, D1, Registro Maestro (§2), EM-1, MO-1/MO-2, CH-5, FL-1 | Sin esto cada mejora vuelve a duplicarse |
| **F3** | Folio en todos los tableros (1-2 semanas) | PP-2, DP-2, MO-3, IN-3, IV-2, IV-4, OB-4, TC-1, TC-4, prueba nocturna de duplicados, DP-3 | El eje de Project Manager |
| **F4** | UX por tablero (continuo) | El resto de §3, en el orden: OS, Embudo, Despacho, Flujo, Obra, PPP, demás | Mejoras visibles una vez que la base aguanta |
| **F5** | Automatización limpia | EM-5, CH-1..CH-4, FX-* | Menos máquinas, más confiables |

### Reglas para quien ejecute el loop
1. Leer el `CLAUDE.md` del repo antes de tocarlo; respetar sus reglas INVIOLABLES (bump de `?v=`, tres tablas de códigos iguales, nunca "Nueva implementación" en Apps Script, nada de datos reales en repos públicos, no hacer POST a los `/exec` para probar).
2. Correr `node verify-os.cjs` y `node verify-portal.cjs` en `yod-portal` antes de cada push.
3. Lo marcado 🔑 se deja **escrito** (código listo + instrucciones de clic en `docs/BACKENDS-PENDIENTES.md`) y se continúa con lo siguiente.
4. Cada punto cerrado se marca aquí con fecha y commit: `- [x] SH-1 · 2026-09-25 · yod-portal@abc1234`.

---

## 5 · Tablero de avance

- [x] F0 · 2026-09-24 · ramas `claude/funny-ritchie-aouldq` en cada repo
  - [x] SH-1 Embudo desde cualquier tablero abre la máscara · yod-portal@98179cc
  - [x] OB-1 access-policy con `?v=0.1.2` en obra y tablero · yod-portal@98179cc
  - [x] D10 fuera embudo-c/dummy · yod-portal@98179cc
  - [x] SH-5 el shell solo suelta la sesión con «Salir» (verificado, sin cambio)
  - [x] RM-1 Miramar ya no borraba la sesión; se corrigió la liga del aviso · real-miramar-board@0345c8d
  - [x] DP-1 fuera los 5 .bak · yod-despacho@8a363ce
  - [x] IN-1 claves fuera del datos.json · interiores-aurum@e5ada26 — 🔑 falta rotarlas
  - [x] AC-1 Google con One Tap automático; clave de equipo retirada; correo solo plan B · potenciales-yod@3586880
  - [x] Portero: 3 rechazos seguidos antes de soltar la sesión (igual que la cabina) · potenciales-yod@3586880
  - [ ] 🔑 AC-2 sesión deslizante 30 días — código e instrucciones en yod-portal/docs/BACKENDS-PENDIENTES.md §5
- [~] F1 · Acceso
  - [x] AC-1 (ver F0)
  - [x] Tercera tabla de códigos con prueba automática: `verify-accesos.cjs` + paso en `verificar.yml` · yod-portal@(rama)
  - [x] Matriz de Accesos sin el código retirado `MZ` · potenciales-yod@(rama)
  - [ ] 🔑 AC-2 sesión deslizante (Code.gs del Portero) — BACKENDS-PENDIENTES §5
  - [ ] 🔑 AC-4 Portero versión 47 + alta de `FL`/`IV` — BACKENDS-PENDIENTES §1
  - [ ] 🔑 EM-2 / IV-1 / IV-3 — cambios en los Apps Script de la Sala, Inversión y Co-desarrolladores
  - [ ] AC-3 `yod-auth.js` único — conviene hacerlo DESPUÉS de fusionar F0 (toca 20+ archivos en 10 repos)
- [~] F2 · Una sola fuente de verdad
  - [x] MO-2 README de MOAC al día · board-aurum@(rama)
  - [ ] 🔑 Registro Maestro de Proyectos: crear la pestaña `PROYECTOS` en el Control Maestro con las columnas de §2
  - [ ] 🔑 FL-1 borrar los 4 "Pago Nex" duplicados en el Sheet de Flujo
  - [ ] Decisión tuya: MO-1 renombrar repos y CH-5 archivar espejos `alexpueblag/*` (no se deshacen fácil)
  - [ ] Decisión tuya: EM-1 código propio para la Sala (`SE`) o se queda colgada de `MK`
- [ ] F3 · Folio en todos los tableros — espera al Registro Maestro (F2 🔑)
  - [x] DP-3 aviso de tarjeta duplicada al soltar un pendiente · yod-despacho@(rama) — adelantado porque no depende del folio
- [~] F4 · UX por tablero
  - [x] OS-2 (parcial) el buscador del marco encuentra por código · yod-portal@5184f74
  - [ ] Resto de §3.x — después de fusionar F0-F2
- [~] F5 · Automatización
  - [x] FX-4 guardián de Amalaya cada hora (antes cada 10 min) · amalaya-board@(rama)
  - [ ] Decisión tuya: FX-1 / FX-5 (qué tableros de fuera entran al OS; archivar Pintarrón)
