# Simulador de boards

Corre un board de Yo Desarrollo **en local**, con un **Apps Script falso** que
contesta con datos inventados, y toma una captura de cada pantalla. Sirve
para revisar o auditar un board sin abrir la página en vivo y sin tocar
ningún Sheet real.

## Cómo se usa

```bash
cd herramientas/simulador
npm install                 # playwright + three (una sola vez)

# 1. Consigue el sitio del board (lo que GitHub Pages publica)
git clone https://github.com/yodesarrollo/amalaya-board /tmp/amalaya-board
(cd /tmp/amalaya-board && npm ci && npm run build)   # boards con Vite → dist/

# 2. Corre el simulador
node simular.mjs amalaya /tmp/amalaya-board/dist
# → capturas/amalaya/*.png y una bitácora de lo que pidió la página
```

Para un board estático, como `yod-portal`, la carpeta del sitio es la raíz
del repo: `node simular.mjs yod-os /tmp/yod-portal`.

## Qué hay en cada board

`boards/<nombre>/board.mjs` exporta tres cosas:

| Qué | Para qué |
|---|---|
| `base` | la ruta donde vive en Pages, por ejemplo `/amalaya-board/` |
| `servidor(accion, cuerpo)` | el Apps Script falso: recibe la acción y devuelve el JSON |
| `guion({ pagina, foto, clic, base })` | el recorrido: qué botones picar y qué capturar |
| `locales` (opcional) | scripts de otro repo servidos desde disco, p. ej. `portero.js` |
| `antes` (opcional) | lo que corre en el navegador antes de la página (una sesión guardada) |

| Board | Estado |
|---|---|
| `amalaya` | Completo. Imita todas las acciones de `apps-script/Code.gs` y entra como admin con el código `SIMULADOR`. |
| `moac` | Operación semanal y su MOAC (`yodesarrollomx/board-aurum`, `dist/` tras `npm run build`). Portero falso como admin; necesita `portero.js` de `potenciales-yod` (variable `PORTERO_JS`). |
| `yod-os` | Solo registra lo que pide la página (hoy: `GET read`). Falta escribir sus datos falsos. |

Para agregar un board, copia `boards/yod-os/`, córrelo una vez y lee la
bitácora: dice qué acciones pidió la página. Luego escribe `servidor()` con
esa forma.

## Límites

- Los **mapas de internet** (OpenFreeMap, satélite de Esri) y **Street View**
  no cargan: el simulador los corta y lo anota. El mapa 3D de Amalaya se
  queda en «Levantando la maqueta…».
- **three.js** sí funciona: se sirve desde `node_modules` en vez del CDN, así
  que el recorrido 360° y el modelo 3D de la esquina se ven.
- Subir o ver archivos de Drive no se simula.
- Los datos de `boards/*/datos.mjs` son **inventados**. Nunca se meten datos
  reales aquí: este repo es público.
