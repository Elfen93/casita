#!/usr/bin/env bash
# Datos -> exportar el proyecto de Godot a la web (sin hilos) en play3d/ (raíz del repo).
# Uso: scripts/godot_export.sh        (GODOT=/ruta/al/binario para cambiar el Godot)
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
GODOT="${GODOT:-/home/claude/godot-bin/4.3/Godot_v4.3-stable_linux.x86_64}"
python3 "$RAIZ/scripts/godot_datos.py"
rm -rf "$RAIZ/play3d" && mkdir -p "$RAIZ/play3d"
cd "$RAIZ/godot"
"$GODOT" --headless --path . --import >/dev/null 2>&1 || true
"$GODOT" --headless --path . --export-release Web ../play3d/index.html 2>&1 | grep -v "mesh_get_surface_count\|Parameter \"m\" is null" || true
ls -l "$RAIZ/play3d"
