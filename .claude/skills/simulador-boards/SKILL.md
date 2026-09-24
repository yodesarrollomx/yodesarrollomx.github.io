---
name: simulador-boards
description: Ver, recorrer y capturar un board de Yo Desarrollo (Amalaya, YOD OS y los tableros de tableros.yodesarrollo.mx) sin la página en vivo, con un Apps Script falso. Usar cuando haya que revisar, auditar o enseñar cómo se ve un board, o cuando la página en vivo no se pueda abrir desde la sesión (github.io bloqueado).
---

# Simulador de boards

El código vive en `herramientas/simulador/` de este repo. Lee su README
antes de correrlo.

1. `cd herramientas/simulador && npm install` (una vez).
2. Clona el repo del board y consigue su sitio publicado:
   - Amalaya: `git clone https://github.com/yodesarrollo/amalaya-board`, luego `npm ci && npm run build` → carpeta `dist/`.
   - YOD OS: `git clone https://github.com/yodesarrollomx/yod-portal` → la raíz del repo.
3. `node simular.mjs <board> <carpeta-del-sitio>` → capturas en `capturas/<board>/`.
4. Mira las capturas con la herramienta Read y lee la bitácora que imprime.

Reglas:
- Los datos de `boards/*/datos.mjs` son inventados. Nunca copies ahí datos
  reales de un Sheet: el repo es público.
- Si un board no tiene carpeta en `boards/`, copia `boards/yod-os/`, córrelo
  una vez para ver qué acciones pide la página y escribe su `servidor()`.
- Los mapas de internet y Street View no cargan en el simulador; dilo al
  enseñar capturas del mapa.
