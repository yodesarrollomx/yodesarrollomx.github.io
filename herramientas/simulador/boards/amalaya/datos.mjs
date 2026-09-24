// Datos SIMULADOS con el programa de áreas de Amalaya (WhatsApp de Luis 29-ago
// + presentación del Foro). Nada de esto viene del Sheet real.
const E=(id,nombre,tipo,estado,m2,x,y,w,h,desc)=>({id,nombre,tipo,estado_desarrollo:estado,descripcion:desc,m2:String(m2),pos_x:String(x),pos_y:String(y),ancho:String(w),alto:String(h),notas:''})
const F=(id,e,et,tc,v,min,max,paso,u,orden)=>({id,espacio_id:e,etiqueta:et,tipo_control:tc,valor:String(v),min:String(min),max:String(max),paso:String(paso),unidad:u,ligado_a:'',orden:String(orden)})
const L=(id,e,c,t,m,s,esc='')=>({id,espacio_id:e,escenario_id:esc,concepto:c,tipo:t,monto_anual:m,supuesto:s})
export const datos={
 Config:[
  ['nombre_proyecto','Amalaya (simulador)'],['resumen_proyecto','Distrito de música y ciudad en el centro de Hermosillo. Datos simulados para el visor.'],
  ['valor_m2_venue','28000'],['valor_m2_comercial','30000'],['valor_m2_mixto','32000'],['valor_m2_estacionamiento','12000'],
  ['costo_m2_venue','22000'],['costo_m2_comercial','16000'],['costo_m2_mixto','17000'],['costo_m2_estacionamiento','9000'],
  ['gastos_generales','15000000'],['acciones_emitidas','100000'],['multiplo_operativo','6'],['multiplo_regalias','4'],
  ['split_distrito','30'],['split_artista','50'],['split_compositor','20']].map(([clave,valor])=>({clave,valor,notas:'simulado'})),
 Usuarios:[
  {id:'U-001',nombre:'Alejandro Puebla',correo:'admin@ejemplo.mx',rol:'admin',codigo_enmascarado:'••••SIM1',activo:'si',tiene_liga:'si'},
  {id:'U-002',nombre:'Luis Puebla',correo:'luis@ejemplo.mx',rol:'editor',codigo_enmascarado:'••••SIM2',activo:'si',tiene_liga:'no'},
  {id:'U-003',nombre:'Inversionista de prueba',correo:'',rol:'inversionista',codigo_enmascarado:'••••SIM3',activo:'si',tiene_liga:'no'}],
 Espacios:[
  E('E-001','Foro Amalaya','venue','proyecto',2500,44,40,16,14,'Foro de 1,428 personas de pie / 952 en butacas.'),
  E('E-002','Área comercial','comercial','idea',2000,62,30,14,12,'Comercio al aire libre, 3-4 pisos.'),
  E('E-003','Uso mixto','mixto','idea',2500,26,34,14,12,'Vivienda, oficinas y estudios.'),
  E('E-004','Estacionamiento 1','estacionamiento','negociacion',3000,30,62,14,12,'4 niveles, 300 cajones.'),
  E('E-005','Estacionamiento 2','estacionamiento','idea',4000,62,60,16,13,'4 niveles, 400 cajones.')],
 Factores:[
  F('F-001','E-001','Eventos al año','slider',110,40,200,5,'eventos',1),F('F-002','E-001','Aforo','numero',1428,500,2000,10,'personas',2),
  F('F-003','E-001','Ocupación','slider',65,30,95,5,'%',3),F('F-004','E-001','Boleto','numero',550,200,1500,50,'$',4),
  F('F-005','E-002','COS','slider',75,40,90,5,'%',1),F('F-006','E-002','Pisos','slider',3,1,5,1,'pisos',2),F('F-007','E-002','Renta m2 mes','numero',350,150,700,10,'$/m²',3),
  F('F-008','E-003','COS','slider',75,40,90,5,'%',1),F('F-009','E-003','Pisos','slider',4,1,6,1,'pisos',2),
  F('F-010','E-004','Pisos','slider',4,1,6,1,'pisos',1),F('F-011','E-004','Cajones','slider',300,100,500,10,'cajones',2),F('F-012','E-004','Tarifa dia','numero',70,20,200,5,'$',3),
  F('F-013','E-005','Pisos','slider',4,1,6,1,'pisos',1),F('F-014','E-005','Cajones','slider',400,100,600,10,'cajones',2),F('F-015','E-005','Tarifa dia','numero',70,20,200,5,'$',3)],
 Finanzas_Lineas:[
  L('L-001','E-001','Taquilla','ingreso','=eventos_al_año * aforo * ocupación / 100 * boleto','boleto promedio simulado'),
  L('L-002','E-001','Regalías de grabaciones','ingreso','2400000','estudio del foro'),
  L('L-003','E-001','Operación del foro','costo','=eventos_al_año * 95000','costo por evento simulado'),
  L('L-004','E-002','Rentas de locales','ingreso','=2000 * cos / 100 * pisos * renta_m2_mes * 12','ocupación 100%'),
  L('L-005','E-002','Mantenimiento','costo','1800000','simulado'),
  L('L-006','E-004','Estacionamiento','ingreso','=cajones * tarifa_dia * 365',''),
  L('L-007','E-004','Operación','costo','2500000',''),
  L('L-008','E-005','Estacionamiento','ingreso','=cajones * tarifa_dia * 365',''),
  L('L-009','E-005','Operación','costo','3000000','')],
 Escenarios:[],
 Rutas:[{id:'R-001',nombre:'Guerrero peatonal (1ª fase)',color:'#2E7D32',homenaje_a:'Carin León',artista_mural:'Por definir',puntos:JSON.stringify({v:2,puntos:[[50,92],[50,70],[52,48],[54,20],[56,6]],grosor:8,opacidad:.9}),orden:'1'},
        {id:'R-002',nombre:'Ruta Serdán',color:'#1565C0',homenaje_a:'Ortiz Tirado',artista_mural:'Por definir',puntos:JSON.stringify({v:2,puntos:[[8,24],[30,26],[52,28],[80,30],[96,31]],grosor:7,opacidad:.9}),orden:'2'}],
 Paradas:[{id:'P-001',ruta_id:'R-001',nombre:'Guerrero y Serdán',foto_actual_id:'',foto_vision_id:'',elementos:JSON.stringify([{texto:'Banquetas amplias',estado:'gestionado'},{texto:'Arbolado',estado:'pendiente'},{texto:'Alumbrado',estado:'logrado'}]),notas:'',orden:'1',pos_x:'54',pos_y:'28'},
          {id:'P-002',ruta_id:'R-002',nombre:'Serdán y Garmendia',foto_actual_id:'',foto_vision_id:'',elementos:JSON.stringify([{texto:'Bocinas con música',estado:'pendiente'},{texto:'Murales',estado:'gestionado'}]),notas:'',orden:'1',pos_x:'30',pos_y:'26'}],
 Tareas:[{id:'T-001',espacio_id:'E-001',texto:'Pedir precios por m² a propietarios',responsable:'Alejandro',fecha:'2026-09-30',hecho:'no'}],
 Conocimientos:[{id:'C-001',espacio_id:'E-001',texto:'Trámite INAH-02-002 modalidad A',estado:'nos falta',fuente:'presentación'}],
 Archivos:[{id:'A-001',espacio_id:'E-001',tipo:'cara',nombre:'Carin León',file_id:'local:carin-leon.jpg',privado:'no',fecha:'2026-09-01'}]
}
