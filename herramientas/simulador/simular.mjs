#!/usr/bin/env node
// ============================================================
// Simulador de boards de Yo Desarrollo.
//
// Corre la página de un board EN LOCAL y pone un servidor falso en
// lugar del Apps Script de Google. Sirve para ver y capturar todas
// las pantallas sin la página en vivo y sin tocar ningún Sheet real.
//
//   node simular.mjs <board> <carpeta-del-sitio> [carpeta-capturas]
//
//   <board>             nombre de una carpeta en boards/ (ej. amalaya)
//   <carpeta-del-sitio> lo que GitHub Pages publica: el dist/ de un
//                       board con Vite (npm run build) o la raíz de un
//                       board estático (yod-portal)
//
// Cada board trae en boards/<board>/board.mjs:
//   base      ruta donde vive en Pages (ej. '/amalaya-board/')
//   servidor  función (accion, cuerpo, req) → JSON; el Apps Script falso
//   guion     función async ({ pagina, foto, clic, base }) que recorre
//             las pantallas y toma capturas
// ============================================================

import http from 'node:http'
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const AQUI = dirname(fileURLToPath(import.meta.url))
const [nombre, sitio, salida = join(AQUI, 'capturas', nombre || '')] = process.argv.slice(2)
if (!nombre || !sitio) {
  console.error('Uso: node simular.mjs <board> <carpeta-del-sitio> [carpeta-capturas]')
  process.exit(1)
}
const board = await import(join(AQUI, 'boards', nombre, 'board.mjs'))
const RAIZ = resolve(sitio)
mkdirSync(salida, { recursive: true })

// --- servidor estático que imita a GitHub Pages ----------------------
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
}
const web = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (ruta.startsWith(board.base)) ruta = '/' + ruta.slice(board.base.length)
  let archivo = join(RAIZ, ruta)
  if (existsSync(archivo) && statSync(archivo).isDirectory()) archivo = join(archivo, 'index.html')
  if (!existsSync(archivo)) { res.writeHead(404); return res.end('no existe: ' + ruta) }
  res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream' })
  res.end(readFileSync(archivo))
})
await new Promise((r) => web.listen(0, r))
const BASE = `http://localhost:${web.address().port}${board.base}`

// --- navegador ---------------------------------------------------------
const navegador = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  .catch(() => chromium.launch())
const ctx = await navegador.newContext({ viewport: { width: 1360, height: 860 } })
const bitacora = []

// El Apps Script falso: toda llamada a script.google.com la contesta board.servidor.
await ctx.route(/script\.google(usercontent)?\.com/, async (ruta) => {
  const req = ruta.request()
  const url = new URL(req.url())
  let cuerpo = {}
  try { cuerpo = JSON.parse(req.postData() || '{}') } catch { cuerpo = { crudo: req.postData() } }
  for (const [k, v] of url.searchParams) if (!(k in cuerpo)) cuerpo[k] = v
  const accion = cuerpo.action || cuerpo.accion || ''
  const respuesta = await board.servidor(accion, cuerpo, req)
  bitacora.push(`servidor ← ${req.method()} ${accion || '(sin acción)'}`)
  await ruta.fulfill({
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(respuesta ?? { ok: false, error: 'acción sin simular: ' + accion }),
  })
})

// three.js desde npm en vez del CDN (el recorrido 360 y el modelo 3D lo piden).
const THREE = join(AQUI, 'node_modules', 'three', 'build', 'three.min.js')
if (existsSync(THREE)) {
  await ctx.route(/cdnjs\.cloudflare\.com\/.*three/, (r) =>
    r.fulfill({ contentType: 'text/javascript', body: readFileSync(THREE) }))
}
// Lo que vive en internet (mapas, fuentes, Street View) se corta rápido para
// que la página no se quede esperando; el simulador avisa en la bitácora.
await ctx.route(/fonts\.(googleapis|gstatic)\.com|openfreemap|arcgisonline|maps\.google|www\.google\.com/, (r) => {
  bitacora.push('cortado (internet): ' + new URL(r.request().url()).host)
  return r.abort()
})

const pagina = await ctx.newPage()
pagina.on('pageerror', (e) => bitacora.push('ERROR en la página: ' + e.message))
const foto = async (archivo, espera = 1800) => {
  await pagina.waitForTimeout(espera)
  await pagina.screenshot({ path: join(salida, archivo + '.png') })
  bitacora.push('captura: ' + archivo)
}
const clic = async (selector) => {
  try { await pagina.locator(selector).first().click({ timeout: 4000 }); return true } catch {
    bitacora.push('no encontré: ' + selector); return false
  }
}

try {
  await board.guion({ pagina, foto, clic, base: BASE })
} finally {
  console.log([...new Set(bitacora)].join('\n'))
  console.log('\nCapturas en: ' + salida)
  await navegador.close()
  web.close()
}
