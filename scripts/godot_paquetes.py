#!/usr/bin/env python3
"""Ayudante de scripts/godot_export.sh para la web ligera (carga diferida del arte de Mixamo; ver godot/README.md).
  texturas            ajusta los .import de godot/arte/mixamo/ (fuera del repo: los crea Godot al importar):
                      texturas con pérdida (WebP) y las de Remy a 512 px como mucho. Dice cuántos cambió.
  lista               paquetes que van aparte: «pj/<nombre> res://…glb» y «anim/<grupo> res://…res», uno por línea
  preset NOMBRE CLAVE VALOR   pone CLAVE=VALOR en el preset NOMBRE de godot/export_presets.cfg
  excluir_web         añade al preset «Web» los archivos de los paquetes que van aparte (los que no van en index.pck)
  indice              escribe godot/arte/mixamo/paquetes.json con lo exportado en play3d/pj/ y play3d/anim/
"""
import os, re, sys, json, glob
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = os.path.join(RAIZ, 'godot')
MIX = os.path.join(G, 'arte', 'mixamo')
PRESETS = os.path.join(G, 'export_presets.cfg')
# personajes que van DENTRO de index.pck (se ven al empezar sin esperar): la de siempre (Figura.MODELO_DEFECTO)
EMBEBIDOS = ['kate']
# las animaciones compartidas van siempre en index.pck; el resto de grupos (anim/<grupo>.res), aparte
ANIM_EMBEBIDAS = ['base']
TEX = {'compress/mode': '1', 'compress/lossy_quality': '0.8'}
TEX_REMY = {'process/size_limit': '512'}

def _poner(txt, cambios):
    for k, v in cambios.items():
        txt, n = re.subn(r'^%s=.*$' % re.escape(k), '%s=%s' % (k, v), txt, flags=re.M)
        if n == 0:
            txt = txt.rstrip('\n') + '\n%s=%s\n' % (k, v)
    return txt

def texturas():
    n = 0
    for f in glob.glob(os.path.join(MIX, '**', '*.webp.import'), recursive=True):
        t = open(f).read()
        c = dict(TEX)
        if os.path.basename(f).startswith('remy_'):
            c.update(TEX_REMY)
        t2 = _poner(t, c)
        if t2 != t:
            open(f, 'w').write(t2); n += 1
    print(n)

def paquetes():
    """[(nombre, recurso)] de lo que va aparte"""
    r = []
    if os.path.exists(os.path.join(MIX, 'remy.glb')):
        r.append(('pj/remy', 'res://arte/mixamo/remy.glb'))
    for f in sorted(glob.glob(os.path.join(MIX, 'pj', '*.glb'))):
        m = os.path.basename(f)[:-4]
        if m not in EMBEBIDOS:
            r.append(('pj/' + m, 'res://arte/mixamo/pj/%s.glb' % m))
    for f in sorted(glob.glob(os.path.join(MIX, 'anim', '*.res'))):
        g = os.path.basename(f)[:-4]
        if g not in ANIM_EMBEBIDAS:
            r.append(('anim/' + g, 'res://arte/mixamo/anim/%s.res' % g))
    return r

def _presets_set(nombre, clave, valor):
    t = open(PRESETS).read()
    partes = re.split(r'(?m)^(?=\[preset\.\d+\]\s*$)', t)
    for i, p in enumerate(partes):
        if re.search(r'^name="%s"\s*$' % re.escape(nombre), p, re.M):
            partes[i] = _poner(p, {clave: valor}) if clave in p else p.replace('\n\n', '\n%s=%s\n\n' % (clave, valor), 1)
            open(PRESETS, 'w').write(''.join(partes))
            return
    sys.exit('no hay preset %s' % nombre)

def _presets_get(nombre, clave):
    t = open(PRESETS).read()
    for p in re.split(r'(?m)^(?=\[preset\.\d+\]\s*$)', t):
        if re.search(r'^name="%s"\s*$' % re.escape(nombre), p, re.M):
            m = re.search(r'^%s="(.*)"\s*$' % re.escape(clave), p, re.M)
            return m.group(1) if m else ''
    return ''

def excluir_web():
    ex = [e for e in _presets_get('Web', 'exclude_filter').split(',') if e]
    for nombre, rec in paquetes():
        base = rec.replace('res://', '')[:-4]          # arte/mixamo/pj/adam
        ex += [base + '.glb', base + '_*'] if nombre.startswith('pj/') else [base + '.res']
    if any(n == 'pj/remy' for n, _ in paquetes()):
        ex.append('arte/mixamo/remy_*')                 # texturas de Remy (remy.json se queda)
    # los glb de animaciones por grupo solo sirven para hornear anim/<grupo>.res (lo que va en los paquetes)
    ex.append('arte/mixamo/anims/*')
    _presets_set('Web', 'exclude_filter', '"%s"' % ','.join(ex))

def indice():
    d = {}
    for nombre, rec in paquetes():
        f = os.path.join(RAIZ, 'play3d', nombre + '.pck')
        if os.path.exists(f):
            d[nombre] = {'recurso': rec, 'bytes': os.path.getsize(f)}
    json.dump(d, open(os.path.join(MIX, 'paquetes.json'), 'w'), indent=1, ensure_ascii=False)
    print('godot_paquetes: %d paquetes aparte, %d KB' % (len(d), sum(v['bytes'] for v in d.values()) // 1024))

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    if a[0] == 'texturas': texturas()
    elif a[0] == 'lista':
        for n, r in paquetes(): print(n, r)
    elif a[0] == 'preset': _presets_set(a[1], a[2], a[3])
    elif a[0] == 'excluir_web': excluir_web()
    elif a[0] == 'indice': indice()
    else: sys.exit(__doc__)
