#!/usr/bin/env python3
"""Rehace godot/fonts/emoji.ttf: Noto Emoji (OFL) recortado a los emojis que usa el juego de Godot.
Junta los que ya tenía la fuente con los que aparecen en godot/data/*.json (los copia scripts/godot_datos.py) y en
godot/scripts/*.gd. Hace falta la fuente completa (variable, .ttf o .woff2; para .woff2, `pip install brotli`).
Uso: python3 scripts/godot_emoji.py [ruta/NotoEmoji-VariableFont_wght.(ttf|woff2)]"""
import os, sys, glob
from fontTools.ttLib import TTFont
from fontTools import subset
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RAIZ, 'godot', 'fonts', 'emoji.ttf')
FUENTES = ['/usr/local/lib/python3.13/dist-packages/bpy/5.3/datafiles/fonts/NotoEmoji-VariableFont_wght.woff2',
           '/usr/share/fonts/truetype/noto/NotoEmoji-Regular.ttf']
def main():
    src = sys.argv[1] if len(sys.argv) > 1 else next((f for f in FUENTES if os.path.exists(f)), None)
    if not src: sys.exit('No encuentro la fuente completa de Noto Emoji: pásala como argumento.')
    full = TTFont(src); cm = full.getBestCmap()
    usados = set(TTFont(DEST).getBestCmap()) if os.path.exists(DEST) else set()
    for f in glob.glob(os.path.join(RAIZ, 'godot', 'data', '*.json')) + glob.glob(os.path.join(RAIZ, 'godot', 'scripts', '*.gd')):
        for ch in open(f, encoding='utf-8').read():
            o = ord(ch)
            if o >= 0x2000 and o in cm: usados.add(o)
    usados |= {0x200d, 0xfe0f} & set(cm)
    op = subset.Options(); op.layout_features = ['*']; op.flavor = None; op.name_IDs = ['*']; op.notdef_outline = True
    s = subset.Subsetter(op); s.populate(unicodes=sorted(usados)); s.subset(full)
    full.flavor = None; full.save(DEST)
    print('emoji.ttf: %d emojis, %d KB' % (len(usados), os.path.getsize(DEST) // 1024))
if __name__ == '__main__': main()
