#!/usr/bin/env python3
"""Copia los datos que lee el juego de Godot: data/*.json -> godot/data/.
Solo los archivos que usa hoy la prueba 3D (el resto del contenido sigue en data/ para el juego web).
Uso: python3 scripts/godot_datos.py"""
import json, os, shutil, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN, DESTINO = os.path.join(RAIZ, 'data'), os.path.join(RAIZ, 'godot', 'data')
USADOS = ['ciudad', 'lugares', 'barrio', 'personas', 'reglas', 'interiores']
def main():
    os.makedirs(DESTINO, exist_ok=True)
    for f in os.listdir(DESTINO):
        if f.endswith('.json') and f[:-5] not in USADOS: os.remove(os.path.join(DESTINO, f))
    tot = 0
    for n in USADOS:
        o = os.path.join(ORIGEN, n + '.json')
        json.load(open(o, encoding='utf-8'))  # que sea JSON válido
        shutil.copyfile(o, os.path.join(DESTINO, n + '.json')); tot += os.path.getsize(o)
    print('godot_datos: %d archivos, %d KB -> godot/data/' % (len(USADOS), tot // 1024))
if __name__ == '__main__': sys.exit(main())
