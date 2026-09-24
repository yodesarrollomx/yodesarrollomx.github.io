// YOD OS (repo yodesarrollomx/yod-portal). Todavía SIN datos simulados:
// este archivo solo registra qué le pide la página al Apps Script, para
// escribir después un servidor falso con la forma correcta.
export const base = '/yod-portal/'
export function servidor(accion, cuerpo) {
  return { ok: false, error: '(simulador) acción sin datos todavía: ' + accion }
}
export async function guion({ pagina, foto, base }) {
  await pagina.goto(base); await foto('01-portal')
  await pagina.goto(base + 'os/'); await foto('02-os', 3000)
}
