// MOAC · Operación semanal (repo yodesarrollomx/board-aurum). Datos inventados.
// Dos Apps Script: el de tareas (getAll/update/create…) y el del libro MOAC
// (acciones que empiezan con "moac"). El Portero (potenciales-yod) valida la
// sesión con GET ?recurso=canje; aquí contesta como admin.
export const base = '/board-aurum/'
const PORTERO = process.env.PORTERO_JS || '/tmp/potenciales-yod/portero.js'
export const locales = [[/potenciales-yod\/portero\.js/, PORTERO]]
export function antes() {
  try { localStorage.setItem('pyod_clave_v1', 'sySIMULADOR000000000000') } catch (e) {}
}

const hoy = new Date(); const f = (d) => { const x = new Date(hoy); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10) }
const T = (id, proyecto, responsable, actividad, estado, dias, prioridad) => ({ id, mes: 'Septiembre', anio: '2026', empresa: 'YoDesarrollo', proyecto, responsable, semana: '', actividad, entregable: '', fecha: f(dias), estado, observaciones: '', prioridad, archivada: false, fechaTerminado: '', color: '', historial: '', subtareas: '', comentarios: '', borrada: false, links: [] })
const tareas = [
  T('t1', 'Amalaya', 'Alejandro', 'Pedir precios por m² a propietarios', 'En proceso', 3, 'Alta'),
  T('t2', 'Amalaya', 'Luis', 'Trazar rutas de la primera fase', 'Pendiente', 6, 'Media'),
  T('t3', 'Amalaya', 'Sayri', 'Constituir la SAPI serie A/B', 'En standby', 20, 'Alta'),
  T('t4', 'Real Miramar', 'Alejandro', 'Reporte semanal a aportadores', 'Terminado', -1, 'Media'),
  T('t5', 'Casa Alysa', 'Sayri', 'Promesa de pago firmada', 'Pendiente', 2, 'Alta'),
]
const moac = {
  metas: [{ meta_id: 'M1', texto: 'Amalaya con viabilidad lista para inversionistas' }],
  objetivos: [
    { objetivo_id: 'O1', meta_id: 'M1', texto: 'Precios de suelo de todos los paquetes', estado: 'Abierto', fecha: f(10), responsable: 'Alejandro' },
    { objetivo_id: 'O2', meta_id: 'M1', texto: 'Estructura legal SAPI', estado: 'Abierto', fecha: f(-2), responsable: 'Sayri' },
  ],
  tareas: { t1: { objetivo_id: 'O1', meta_id: 'M1' }, t3: { objetivo_id: 'O2', meta_id: 'M1' } },
}
export function servidor(accion, b) {
  if (b.recurso === 'canje' || b.recurso === 'meta') return { ok: true, token: b.t, rol: 'admin', boards: '*', nombre: 'Alejandro Puebla', correo: 'admin@ejemplo.mx' }
  if (b.recurso) return { ok: true }
  switch (accion) {
    case 'getAll': return { ok: true, tasks: tareas }
    case 'moac': return { ok: true, ...moac }
    case 'ping': case 'checkkey': return { ok: true }
    default: return { ok: true }
  }
}
export async function guion({ pagina, foto, clic, base }) {
  await pagina.goto(base); await foto('01-operacion', 5000)
  await pagina.mouse.wheel(0, 900); await foto('02-moac', 1500)
}
