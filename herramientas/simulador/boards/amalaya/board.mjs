// Amalaya (repo yodesarrollo/amalaya-board). El Apps Script real está en
// apps-script/Code.gs de ese repo; esto imita sus acciones con datos inventados.
import { datos } from './datos.mjs'

export const base = '/amalaya-board/'

// Código que acepta el portero falso. Entra como admin.
export const CODIGO = 'SIMULADOR'

const db = structuredClone(datos)
let v = 1
const prefijo = { Espacios: 'E-', Factores: 'F-', Finanzas_Lineas: 'L-', Rutas: 'R-', Paradas: 'P-', Tareas: 'T-', Conocimientos: 'C-', Archivos: 'A-', Escenarios: 'ESC-', Usuarios: 'U-' }
const llave = (fila) => fila.id ?? fila.clave

export function servidor(accion, b) {
  if (accion === 'ping') return { ok: true, servicio: 'amalaya-board (simulado)' }
  if (accion === 'peticiones') return { ok: true, rutas: db.Rutas, paradas: db.Paradas }
  if (accion === 'ligaPorCorreo') return { ok: true, mensaje: '(simulado) Si tu correo está registrado, tu liga va en camino.' }
  if (b.codigo !== CODIGO) return { ok: false, error: 'El código no es válido. Revísalo o pide uno nuevo.' }
  switch (accion) {
    case 'login': return { ok: true, rol: 'admin', nombre: 'Alejandro Puebla' }
    case 'getAll': return { ok: true, v, datos: db, rol: 'admin' }
    case 'guardar': {
      const fila = db[b.tab]?.find((x) => llave(x) === b.key)
      if (!fila) return { ok: false, error: 'No se encontró la fila.' }
      Object.assign(fila, b.patch); return { ok: true, key: b.key, v: ++v }
    }
    case 'crear': {
      const fila = { id: prefijo[b.tab] + String(db[b.tab].length + 1).padStart(3, '0'), ...b.fila }
      db[b.tab].push(fila); return { ok: true, fila, v: ++v }
    }
    case 'borrar': db[b.tab] = db[b.tab].filter((x) => llave(x) !== b.key); return { ok: true, v: ++v }
    case 'nuevoCodigo': return { ok: true, codigo: 'SIM-NUEVO1', v: ++v }
    case 'generarLiga': return { ok: true, liga: 'https://yodesarrollo.github.io/amalaya-board/?t=SIMULADOR', v: ++v }
    case 'revocarLiga': case 'respaldoAhora': case 'instalarRespaldo': return { ok: true, v }
    case 'subirArchivo': case 'verArchivo': return { ok: false, error: '(simulado) Los archivos de Drive no existen en el simulador.' }
    default: return { ok: false, error: 'Acción no reconocida: ' + accion }
  }
}

export async function guion({ pagina, foto, clic, base }) {
  await pagina.goto(base); await foto('01-portada')
  await clic('text=Peticiones a la ciudad'); await foto('02-peticiones-publicas')
  await pagina.goto(base); await pagina.waitForTimeout(1200)
  await clic('text=Tengo código de acceso'); await pagina.waitForTimeout(400)
  await pagina.locator('input[type=password], input[autocomplete=off]').first().fill(CODIGO)
  await clic('button[type=submit]'); await foto('03-mapa', 4000)
  await clic('button:has-text("Rutas")'); await foto('04-mapa-rutas')
  for (const [seccion, archivo] of [['Finanzas', '05-finanzas'], ['Reporte', '06-reporte'], ['Equipo', '07-equipo'], ['Ayuda', '08-ayuda']]) {
    await clic(`nav button:has-text("${seccion}")`); await foto(archivo)
    if (seccion === 'Finanzas') { await clic('text=¿qué significa?'); await foto('05b-que-significa'); await clic('text=Entendido') }
  }
  await pagina.goto(base + 'recorrido/'); await foto('09-recorrido-360', 4000)
  await pagina.goto(base + 'modelo/serdan-garmendia.html'); await foto('10-modelo-esquina', 5000)
}
