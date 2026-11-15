#!/usr/bin/env python3
"""Rehace godot/fonts/emoji.ttf: Noto Emoji 2.001 (OFL) recortado a los emojis que usan data/*.json y godot/**/*.gd,
fijado al peso 400 (sin datos de variación: pesa menos). Hay que volver a pasarlo cuando un dato o un script use un emoji nuevo.
Origen: la Noto Emoji variable que trae Blender (bpy) en el sistema, o la que se pase como argumento.
Uso: python3 scripts/godot_emoji.py [NotoEmoji-VariableFont_wght.(ttf|woff2)]"""
import glob, os, sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'godot', 'fonts', 'emoji.ttf')
def origen():
    if len(sys.argv) > 1:
        return sys.argv[1]
    for p in glob.glob('/usr/local/lib/python3*/dist-packages/bpy/*/datafiles/fonts/NotoEmoji-VariableFont_wght.woff2') + \
             glob.glob('/usr/share/fonts/**/NotoEmoji*.ttf', recursive=True):
        return p
    sys.exit('No encuentro Noto Emoji: pásala como argumento.')
def main():
    src = TTFont(origen())
    cmap = src.getBestCmap()
    txt = ''
    for p in glob.glob(os.path.join(RAIZ, 'data', '*.json')) + glob.glob(os.path.join(RAIZ, 'godot', '**', '*.gd'), recursive=True):
        txt += open(p, encoding='utf-8').read()
    # solo lo que no es texto corriente: el resto lo pinta la fuente normal de Godot
    usados = sorted(set(ord(c) for c in txt if ord(c) >= 0x2000 and (ord(c) in cmap or ord(c) in (0x200D, 0xFE0F, 0x20E3))))
    src.flavor = None
    op = subset.Options()
    op.layout_features = ['*']
    op.name_IDs = ['*']
    op.notdef_outline = True
    s = subset.Subsetter(op)
    s.populate(unicodes=usados)
    s.subset(src)
    if 'fvar' in src:
        src = instancer.instantiateVariableFont(src, {'wght': 400})
    src.save(DESTINO)
    print('emoji.ttf: %d caracteres, %d KB' % (len(usados), os.path.getsize(DESTINO) // 1024))
if __name__ == '__main__':
    main()
