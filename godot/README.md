# Casita 3D · prueba de Godot (GD-1)

La Ribera en 3D, leída de `data/*.json`, para compararla en el móvil con el juego web. Godot 4.3, renderizador **Compatibility** (WebGL2), vertical, táctil, exportación web **sin hilos** (GitHub Pages no manda las cabeceras de aislamiento que piden los hilos).

## Qué hay
- `project.godot`, `export_presets.cfg` (preset «Web», sin hilos, salida `../play3d/index.html`).
- `scripts/main.gd` (mundo, personaje, cámara, reloj, necesidades, interacciones, vecinos, interfaz), `scripts/grafo.gd` (camino por calles, port de `cdGrafo`/`cdCamino` de `mods/barrio.js`), `scripts/datos.gd` (lector de JSON).
- `fonts/emoji.ttf`: Noto Emoji (OFL) recortado a los emojis que usan los datos (~120 KB). El texto normal usa la fuente por defecto de Godot.
- `data/` NO se versiona: lo genera `scripts/godot_datos.py` copiando `ciudad`, `lugares`, `barrio`, `personas` y `reglas` de `data/`.

## Instalar (una vez)
```
mkdir -p /home/claude/godot-bin/4.3 && cd /home/claude/godot-bin/4.3
curl -L -O https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip && unzip Godot_v4.3-stable_linux.x86_64.zip
curl -L -O https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_export_templates.tpz   # 1 GB
mkdir -p ~/.local/share/godot/export_templates/4.3.stable
unzip -j Godot_v4.3-stable_export_templates.tpz templates/web_nothreads_release.zip templates/web_nothreads_debug.zip templates/version.txt -d ~/.local/share/godot/export_templates/4.3.stable
rm Godot_v4.3-stable_export_templates.tpz
```
Con otro binario: `GODOT=/ruta/godot scripts/godot_export.sh`.

## Exportar
```
scripts/godot_export.sh          # datos -> import -> exporta a play3d/ (index.html, .js, .wasm, .pck…)
```
Publicar = hacer commit de `play3d/` (cuando se decida): `https://elfen93.github.io/casita/play3d/`. Los `.wasm` pesan ~35 MB sin comprimir.

## Probar en local
```
python3 -m http.server 8731          # desde la raíz del repo
# abrir http://127.0.0.1:8731/play3d/index.html (móvil en la misma red: http://IP-del-PC:8731/play3d/index.html)
python3 t/cdpshot.py "http://127.0.0.1:8731/play3d/index.html" 25 /tmp/x.png 420,860   # captura con Chrome sin pantalla
```
En la web, `window.casita_cmd('ir','bar')`, `('hora',22)`, `('vel',5)`, `('zoom',30)`, `('vecino',3)`, `('boton',0)`, `('estado')` sirven para probar sin tocar.

## Controles
Un dedo arrastra la cámara, dos dedos hacen zoom (rueda del ratón en el ordenador). Tocar una calle o un edificio: el personaje va andando; en el bar, el súper y casa aparece el menú. Tocar a un vecino: su ficha. 1× / 5× cambian la velocidad (un día = 16 min a 1×).

## Qué sale de los datos y qué no
De `data/`: calles, puertas, huellas (`rb`), colores, nombres, descripciones y horarios de apertura, casa del jugador (vivienda «viejo» → La Ribera), censo del barrio y sus horarios, tasas de necesidades (`reglas.json`), efecto del bar (`salidas_necesidades.amigos`). Provisional en el código: precios (bar 6 €, súper 12 €), efecto del súper y del sueño, alturas de los cubos.
