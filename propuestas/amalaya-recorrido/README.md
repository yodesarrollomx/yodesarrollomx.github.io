# Recorrido visual · Zona Núcleo Amalaya (Plaza Hidalgo, Hermosillo)

Visor sin menús ni textos: solo foto de Street View y mapa. Recorre **128 puntos** en orden por las 10 zonas (Z01–Z10).

**Ver:** `/propuestas/amalaya-recorrido/` · solo mapa: `?modo=mapa` · un punto: `?p=P010` · velocidad: `?seg=5` · sin avance automático: `?auto=0`
**Teclas:** → siguiente · ← anterior · Espacio play/pausa · M mapa completo ↔ recorrido. Clic en un punto del mapa salta a él.

## Datos para armar el 3D (`datos/`)
- `puntos.csv` — id, zona, tipo (centro/esquina/lado), lng, lat, rumbo y liga directa a Street View en Google Maps.
- `puntos.geojson` — contornos de zonas + puntos (WGS84), para QGIS/Blender/etc.
- `recorrido.json` — zonas con color, orden del recorrido y puntos.

Cada zona tiene 4 rumbos desde el centro (N/E/S/O), sus esquinas y el punto medio de cada lado, mirando hacia el centro. Los contornos son la **hipótesis de maqueta** de `amalaya-board/src/territorio.js`, no un levantamiento.

## Límites (importante)
- Las fotos de Street View **son de Google**: se muestran embebidas, no se guardan aquí (sus términos prohíben descargarlas y republicarlas). Google mueve cada punto a la toma más cercana, y puede haber puntos sin cobertura.
- Para fotos que sí se puedan descargar y usar en fotogrametría hace falta tomarlas en sitio o usar imágenes abiertas (Mapillary/KartaView); no había cobertura accesible desde este entorno.
- El recorte que oculta el cuadro de Google se ajusta con el `width/height/bottom` del `iframe` en `index.html`.
