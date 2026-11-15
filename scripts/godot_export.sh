#!/usr/bin/env bash
# Datos -> exportar el proyecto de Godot a la web (sin hilos) en play3d/ (raíz del repo).
# Uso: scripts/godot_export.sh        (GODOT=/ruta/al/binario para cambiar el Godot)
#
# play3d/index.pck lleva solo lo imprescindible; cada personaje de Mixamo va en play3d/pj/<nombre>.pck y cada grupo de
# animaciones (si hay más que las de siempre) en play3d/anim/<grupo>.pck: el juego los baja cuando hacen falta
# (scripts/paquetes.gd). El índice de lo que hay va dentro de index.pck (godot/arte/mixamo/paquetes.json).
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
GODOT="${GODOT:-/home/claude/godot-bin/4.3/Godot_v4.3-stable_linux.x86_64}"
PQ="python3 $RAIZ/scripts/godot_paquetes.py"
filtro() { grep -v "mesh_get_surface_count\|Parameter \"m\" is null\|savepack: step\|Storing File" || true; }
python3 "$RAIZ/scripts/godot_datos.py"
rm -rf "$RAIZ/play3d" && mkdir -p "$RAIZ/play3d"
cd "$RAIZ/godot"
"$GODOT" --headless --path . --import >/dev/null 2>&1 || true
# texturas de Mixamo con pérdida (WebP): ~10 veces menos que sin pérdida, igual de cerca (ver README)
if [ "$($PQ texturas)" != "0" ]; then "$GODOT" --headless --path . --import >/dev/null 2>&1 || true; fi
# animaciones horneadas por grupo (arte/mixamo/anims/<grupo>.glb -> arte/mixamo/anim/<grupo>.res): base va en index.pck,
# el resto en play3d/anim/<grupo>.pck, que el juego baja cuando alguien usa una de sus animaciones
timeout 300 "$GODOT" --headless --path . -s res://arte/herramientas/hornear_anims.gd 2>&1 | grep "hornear_anims" || true

# los presets se retocan para cada paquete: se deja export_presets.cfg como estaba al acabar
cp export_presets.cfg /tmp/casita_export_presets.cfg
trap 'cp /tmp/casita_export_presets.cfg "$RAIZ/godot/export_presets.cfg"' EXIT

# un paquete por personaje (y por grupo de animaciones)
$PQ lista | while read -r NOMBRE RECURSO; do
	mkdir -p "$RAIZ/play3d/$(dirname "$NOMBRE")"
	$PQ preset "Web paquete" export_files "PackedStringArray(\"$RECURSO\")"
	"$GODOT" --headless --path . --export-pack "Web paquete" "../play3d/$NOMBRE.pck" </dev/null 2>&1 | filtro
done
$PQ indice

# el juego: sin los paquetes que van aparte
$PQ excluir_web
"$GODOT" --headless --path . --export-release Web ../play3d/index.html 2>&1 | filtro
# el creador de personaje, en su propia página (play3d/crear/): lleva el cuerpo moldeable, que pesa, y no el arte del juego
mkdir -p "$RAIZ/play3d/crear"
"$GODOT" --headless --path . --export-release "Web crear" ../play3d/crear/index.html 2>&1 | filtro
cd "$RAIZ"
ls -l play3d play3d/crear
du -sh play3d/pj 2>/dev/null || true
