#!/usr/bin/env python3
"""Generador del cuerpo humano moldeable de Casita (GD-10a).

Uso:  python3 generar_humano.py CARPETA_CLON_MAKEHUMAN [--salida godot/arte/humano]

CARPETA_CLON_MAKEHUMAN es la raíz del clon de github.com/makehumancommunity/makehuman
(se usa makehuman/data/{3dobjs,targets,rigs}). Requiere numpy, scipy y Pillow.

Produce en la carpeta de salida:
  humano.glb          cuerpo + ojos + ropa + pelo, con blend shapes (morph targets, dispersos)
  catalogo.json       lo que existe (formas, ropas, pelos...) para humano.gd
  pieles/*.jpg        texturas de piel 1024 px (generadas, ver FUENTES.md)
  ojo.png             textura del ojo (generada)

Todo es determinista: sin azar sin semilla.
Unidades: MakeHuman usa decímetros; se escala a metros (neutro = 1,70 m), pies en y=0,
la persona mira a -Z (se gira 180° sobre Y respecto a MakeHuman).
"""
import json, os, sys, struct, math
import numpy as np

# ------------------------------------------------------------------ lectura de datos
class Datos:
    def __init__(self, raiz):
        self.d = os.path.join(raiz, "makehuman", "data")
        self._t = {}
        self._leer_obj()

    def _leer_obj(self):
        v, vt, caras, grupo, g = [], [], [], [], None
        for l in open(os.path.join(self.d, "3dobjs", "base.obj")):
            p = l.split()
            if not p:
                continue
            if p[0] == "v":
                v.append([float(x) for x in p[1:4]])
            elif p[0] == "vt":
                vt.append([float(p[1]), float(p[2])])
            elif p[0] == "g":
                g = p[1]
            elif p[0] == "f":
                c = [tuple(int(a) - 1 for a in t.split("/")[:2]) for t in p[1:]]
                caras.append(c)
                grupo.append(g)
        self.v = np.array(v, np.float64)
        self.vt = np.array(vt, np.float64)
        self.caras = caras
        self.grupo = grupo

    def target(self, ruta):
        """Devuelve un array denso (n_vertices_base, 3) de desplazamientos (dm)."""
        if ruta not in self._t:
            a = np.zeros((len(self.v), 3))
            f = os.path.join(self.d, "targets", ruta + ".target")
            for l in open(f):
                if l.startswith("#") or not l.strip():
                    continue
                p = l.split()
                if len(p) >= 4:
                    a[int(p[0])] = [float(p[1]), float(p[2]), float(p[3])]
            self._t[ruta] = a
        return self._t[ruta]

    def pesos(self):
        j = json.load(open(os.path.join(self.d, "rigs", "default_weights.mhw")))
        return j["weights"]


# ------------------------------------------------------------------ macro-targets de MakeHuman
def _lin(x, a, b):
    return max(0.0, min(1.0, (x - a) / (b - a)))

def pesos_macro(g, e, mu, pe, al):
    """Pesos de los macro-targets como en MakeHuman (todos los parámetros en 0..1; 0,5 = medio)."""
    G = {"female": 1 - g, "male": g}
    old = _lin(e, 0.5, 1.0)
    baby = max(0.0, 1 - e / 0.1875)
    if e < 0.1875:
        child = e / 0.1875
    elif e < 0.5:
        child = 1 - (e - 0.1875) / 0.3125
    else:
        child = 0.0
    if e < 0.1875:
        young = 0.0
    elif e < 0.5:
        young = (e - 0.1875) / 0.3125
    else:
        young = 1 - old
    E = {"baby": baby, "child": child, "young": young, "old": old}
    def tri(x, lo, me, hi):
        return {lo: max(0.0, 1 - 2 * x), me: 1 - abs(2 * x - 1), hi: max(0.0, 2 * x - 1)}
    M = tri(mu, "minmuscle", "averagemuscle", "maxmuscle")
    P = tri(pe, "minweight", "averageweight", "maxweight")
    H = {"minheight": max(0.0, 1 - 2 * al), "maxheight": max(0.0, 2 * al - 1)}
    return G, E, M, P, H

def macro_delta(D, g=0.5, e=0.5, mu=0.5, pe=0.5, al=0.5):
    G, E, M, P, H = pesos_macro(g, e, mu, pe, al)
    acc = np.zeros((len(D.v), 3))
    razas = {"african": 1 / 3, "asian": 1 / 3, "caucasian": 1 / 3}
    for gn, gw in G.items():
        for en, ew in E.items():
            if gw * ew <= 0:
                continue
            for rn, rw in razas.items():
                acc += gw * ew * rw * D.target("macrodetails/%s-%s-%s" % (rn, gn, en))
            for mn, mw in M.items():
                for pn, pw in P.items():
                    w = gw * ew * mw * pw
                    if w <= 0:
                        continue
                    acc += w * D.target("macrodetails/universal-%s-%s-%s-%s" % (gn, en, mn, pn))
                    for hn, hw in H.items():
                        if hw > 0:
                            acc += w * hw * D.target("macrodetails/height/%s-%s-%s-%s-%s" % (gn, en, mn, pn, hn))
    return acc


# ------------------------------------------------------------------ definición de formas
# Cada forma = {"id","n","grupo","min","max","def","pos":[(target,peso)...], "neg":[...]} o "macro".
# Se guardan como blend shapes "<id>+" y "<id>-" (ver humano.gd). Las de rango 0..1 solo llevan "+".
def definir_formas():
    L = lambda *a: list(a)
    f = []
    # macro: se calculan con macro_delta; (dict de parámetros del extremo)
    f.append(dict(id="peso", n="Peso", grupo="cuerpo", min=-1, max=1, macro_pos=dict(pe=1.0), macro_neg=dict(pe=0.0)))
    f.append(dict(id="musculo", n="Músculo", grupo="cuerpo", min=-1, max=1, macro_pos=dict(mu=1.0), macro_neg=dict(mu=0.0)))
    f.append(dict(id="altura", n="Altura", grupo="cuerpo", min=-1, max=1, macro_pos=dict(al=1.0), macro_neg=dict(al=0.0)))
    # edad: -1 ≈ 17 años (mezcla joven-niño), +1 ≈ 70 años (mezcla joven-viejo)
    f.append(dict(id="edad", n="Edad", grupo="cuerpo", min=-1, max=1, macro_pos=dict(e=0.5 + 0.5 * 0.62), macro_neg=dict(e=0.5 - 0.3125 * 0.38)))
    f.append(dict(id="genero", n="Género (femenino ↔ masculino)", grupo="cuerpo", min=-1, max=1, macro_pos=dict(g=1.0), macro_neg=dict(g=0.0)))
    f.append(dict(id="pecho", n="Pecho", grupo="cuerpo", min=-1, max=1,
        pos=L(("breast/female-young-averagemuscle-averageweight-maxcup-averagefirmness", 1.0)),
        neg=L(("breast/female-young-averagemuscle-averageweight-mincup-averagefirmness", 1.0))))
    f.append(dict(id="cintura", n="Cintura", grupo="cuerpo", min=-1, max=1,
        pos=L(("measure/measure-waist-circ-incr", 1.0)), neg=L(("measure/measure-waist-circ-decr", 1.0))))
    f.append(dict(id="cadera", n="Cadera", grupo="cuerpo", min=-1, max=1,
        pos=L(("measure/measure-hips-circ-incr", 1.0)), neg=L(("measure/measure-hips-circ-decr", 1.0))))
    f.append(dict(id="barriga", n="Barriga", grupo="cuerpo", min=-1, max=1,
        pos=L(("stomach/stomach-pregnant-incr", 1.0)), neg=L(("stomach/stomach-pregnant-decr", 1.0))))
    f.append(dict(id="hombros", n="Hombros", grupo="cuerpo", min=-1, max=1,
        pos=L(("measure/measure-shoulder-dist-incr", 1.0)), neg=L(("measure/measure-shoulder-dist-decr", 1.0))))
    f.append(dict(id="piernas_largo", n="Largo de piernas", grupo="cuerpo", min=-1, max=1,
        pos=L(("measure/measure-upperleg-height-incr", 1.0), ("measure/measure-lowerleg-height-incr", 1.0)),
        neg=L(("measure/measure-upperleg-height-decr", 1.0), ("measure/measure-lowerleg-height-decr", 1.0))))
    # cara
    f.append(dict(id="cara_ancho", n="Ancho de cara", grupo="cara", min=-1, max=1,
        pos=L(("head/head-scale-horiz-incr", 1.0), ("cheek/l-cheek-volume-incr", 0.5), ("cheek/r-cheek-volume-incr", 0.5)),
        neg=L(("head/head-scale-horiz-decr", 1.0), ("cheek/l-cheek-volume-decr", 0.5), ("cheek/r-cheek-volume-decr", 0.5))))
    f.append(dict(id="nariz", n="Nariz", grupo="cara", min=-1, max=1,
        pos=L(("nose/nose-volume-incr", 1.0), ("nose/nose-scale-horiz-incr", 0.6)),
        neg=L(("nose/nose-volume-decr", 1.0), ("nose/nose-scale-horiz-decr", 0.6))))
    f.append(dict(id="labios", n="Labios", grupo="cara", min=-1, max=1,
        pos=L(("mouth/mouth-lowerlip-volume-incr", 1.0), ("mouth/mouth-upperlip-volume-incr", 1.0)),
        neg=L(("mouth/mouth-lowerlip-volume-decr", 1.0), ("mouth/mouth-upperlip-volume-decr", 1.0))))
    f.append(dict(id="ojos_tam", n="Tamaño de ojos", grupo="cara", min=-1, max=1,
        pos=L(("eyes/l-eye-scale-incr", 1.0), ("eyes/r-eye-scale-incr", 1.0)),
        neg=L(("eyes/l-eye-scale-decr", 1.0), ("eyes/r-eye-scale-decr", 1.0))))
    f.append(dict(id="mandibula", n="Mandíbula", grupo="cara", min=-1, max=1,
        pos=L(("chin/chin-width-incr", 1.0), ("chin/chin-prominent-incr", 0.7)),
        neg=L(("chin/chin-width-decr", 1.0), ("chin/chin-prominent-decr", 0.7))))
    # expresiones (solo "+", rango 0..1). Combinan unidades de expresión de MakeHuman (raza caucásica).
    u = lambda n, w=1.0: ("expression/units/caucasian/" + n, w)
    ex = []
    ex.append(dict(id="sonrisa", n="Sonrisa", pos=L(u("mouth-elevation", 0.6), u("mouth-corner-puller", 0.8), u("mouth-part-later", 0.3))))
    ex.append(dict(id="enfado", n="Enfado", pos=L(u("eyebrows-left-down"), u("eyebrows-right-down"), u("mouth-compression", 0.7), u("nose-compression", 0.5), u("eye-left-slit", 0.4), u("eye-right-slit", 0.4))))
    ex.append(dict(id="tristeza", n="Tristeza", pos=L(u("eyebrows-left-inner-up"), u("eyebrows-right-inner-up"), u("mouth-depression", 0.8), u("mouth-depression-retraction", 0.4), u("eye-left-closure", 0.25), u("eye-right-closure", 0.25))))
    ex.append(dict(id="sorpresa", n="Sorpresa", pos=L(u("eyebrows-left-up"), u("eyebrows-right-up"), u("eye-left-opened-up", 0.8), u("eye-right-opened-up", 0.8), u("mouth-open", 0.8))))
    ex.append(dict(id="ojos_cerrados", n="Ojos cerrados", pos=L(u("eye-left-closure"), u("eye-right-closure"))))
    return f, ex


# ------------------------------------------------------------------ malla
class Malla:
    """Malla con deltas de formas. pos en metros."""
    def __init__(self, nombre, pos, idx, uv=None, col=None):
        self.nombre = nombre
        self.pos = np.asarray(pos, np.float32)
        self.idx = np.asarray(idx, np.uint32).reshape(-1, 3)
        q = np.asarray(pos, np.float64)[self.idx]
        area = np.linalg.norm(np.cross(q[:, 1] - q[:, 0], q[:, 2] - q[:, 0]), axis=1)
        self.idx = self.idx[area > 1e-12]
        self.uv = None if uv is None else np.asarray(uv, np.float32)
        self.col = col
        self.formas = {}      # nombre -> delta (N,3) float32
        self.nrm = None

    def calcular_normales(self, soldar=None):
        """Normales suaves; 'soldar' = array de ids de posición original para fundir las costuras de UV."""
        p = self.pos.astype(np.float64)
        t = self.idx
        fn = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
        n = np.zeros_like(p)
        for k in range(3):
            np.add.at(n, t[:, k], fn)
        if soldar is not None:
            s = np.zeros((soldar.max() + 1, 3))
            np.add.at(s, soldar, n)
            n = s[soldar]
        l = np.linalg.norm(n, axis=1, keepdims=True)
        l[l == 0] = 1
        self.nrm = (n / l).astype(np.float32)

    @property
    def tris(self):
        return len(self.idx)


def construir_cuerpo(D):
    """Cuerpo sin helpers. Devuelve (Malla, vi) donde vi = índice en base.obj de cada vértice."""
    pares, vi, uv, tri = {}, [], [], []
    for cara, gr in zip(D.caras, D.grupo):
        if gr != "body":
            continue
        ids = []
        for (v, t) in cara:
            k = (v, t)
            if k not in pares:
                pares[k] = len(vi)
                vi.append(v)
                uv.append(D.vt[t])
            ids.append(pares[k])
        for a in range(1, len(ids) - 1):
            tri.append((ids[0], ids[a], ids[a + 1]))
    vi = np.array(vi)
    uv = np.array(uv)
    uv[:, 1] = 1 - uv[:, 1]
    return vi, uv, np.array(tri, np.uint32)


class Mundo:
    """Reúne transformación dm->m y neutro."""
    def __init__(self, D):
        self.D = D
        self.vi, self.uv, self.tri = construir_cuerpo(D)
        self.neutro_dm = D.v + macro_delta(D)
        y = self.neutro_dm[self.vi][:, 1]
        self.esc = 1.70 / (y.max() - y.min())
        self.y0 = y.min()

    def a_metros(self, p_dm):
        p = np.asarray(p_dm) * self.esc
        out = np.empty_like(p)
        out[..., 0] = -p[..., 0]
        out[..., 1] = p[..., 1] - self.y0 * self.esc
        out[..., 2] = -p[..., 2]
        return out

    def delta_m(self, d_dm):
        d = np.asarray(d_dm) * self.esc
        out = d.copy()
        out[..., 0] = -d[..., 0]
        out[..., 2] = -d[..., 2]
        return out


# El neutro está a género 0,5, así que los targets de peso/músculo (que dependen del género) actúan a medias:
# se duplican para que el extremo se parezca al de MakeHuman con género definido.
AMPLIFICAR = {"peso": 2.2, "musculo": 2.0}


def calcular_formas(D, W):
    """Devuelve dict nombre -> delta (N_base, 3) en metros, para TODOS los vértices de base.obj."""
    formas, exprs = definir_formas()
    neutro = macro_delta(D)
    sal = {}
    info = {}
    def comb(lista):
        a = np.zeros((len(D.v), 3))
        for t, w in lista:
            if w:
                a += w * D.target(t)
        return a
    for f in formas:
        for signo, clave in (("+", "pos"), ("-", "neg")):
            if "macro_" + clave in f:
                par = dict(g=0.5, e=0.5, mu=0.5, pe=0.5, al=0.5)
                par.update(f["macro_" + clave])
                d = macro_delta(D, **par) - neutro
                d = W.delta_m(d) * AMPLIFICAR.get(f["id"], 1.0)
                # mantener pies en el suelo: mismo ajuste de y para todos los vértices
                p = W.a_metros(D.v + neutro)[W.vi] + d[W.vi]
                d[:, 1] -= p[:, 1].min()
                sal[f["id"] + signo] = d
            else:
                sal[f["id"] + signo] = W.delta_m(comb(f[clave]))
    for e in exprs:
        sal["x_" + e["id"]] = W.delta_m(comb(e["pos"]))
    return formas, exprs, sal


# ------------------------------------------------------------------ escritor glb
class GLB:
    def __init__(self):
        self.bin = bytearray()
        self.views, self.accs, self.meshes, self.nodes, self.mats, self.imgs, self.texs = [], [], [], [], [], [], []

    def _view(self, data, target=None):
        while len(self.bin) % 4:
            self.bin.append(0)
        o = len(self.bin)
        self.bin += data
        v = {"buffer": 0, "byteOffset": o, "byteLength": len(data)}
        if target:
            v["target"] = target
        self.views.append(v)
        return len(self.views) - 1

    def _acc(self, arr, tipo, comp, target=None, minmax=False):
        vw = self._view(arr.tobytes(), target)
        a = {"bufferView": vw, "componentType": comp, "count": int(len(arr)), "type": tipo}
        if minmax:
            a["min"] = [float(x) for x in arr.min(axis=0)]
            a["max"] = [float(x) for x in arr.max(axis=0)]
        self.accs.append(a)
        return len(self.accs) - 1

    def _sparse(self, delta):
        nz = np.nonzero(np.abs(delta).max(axis=1) > 1e-6)[0].astype(np.uint32)
        if len(nz) == 0:
            nz = np.array([0], np.uint32)
        if len(nz) > 0.45 * len(delta):      # casi denso: sin índices ocupa menos
            return self._acc(np.ascontiguousarray(delta, np.float32), "VEC3", 5126, None, True)
        iv = self._view(nz.tobytes())
        vv = self._view(np.ascontiguousarray(delta[nz], np.float32).tobytes())
        a = {"componentType": 5126, "count": int(len(delta)), "type": "VEC3",
             "sparse": {"count": int(len(nz)), "indices": {"bufferView": iv, "componentType": 5125},
                        "values": {"bufferView": vv}},
             "min": [float(x) for x in delta.min(axis=0)], "max": [float(x) for x in delta.max(axis=0)]}
        self.accs.append(a)
        return len(self.accs) - 1

    def material(self, nombre, color=(0.8, 0.8, 0.8, 1.0), rug=0.9, doble=False):
        m = {"name": nombre, "pbrMetallicRoughness": {"baseColorFactor": list(color), "metallicFactor": 0.0, "roughnessFactor": rug}}
        if doble:
            m["doubleSided"] = True
        self.mats.append(m)
        return len(self.mats) - 1

    def anadir(self, malla, mat):
        prim = {"attributes": {}, "mode": 4, "material": mat}
        at = prim["attributes"]
        at["POSITION"] = self._acc(malla.pos, "VEC3", 5126, 34962, True)
        at["NORMAL"] = self._acc(malla.nrm, "VEC3", 5126, 34962)
        uv = malla.uv if malla.uv is not None else np.zeros((len(malla.pos), 2), np.float32)
        at["TEXCOORD_0"] = self._acc(uv, "VEC2", 5126, 34962)
        if malla.col is not None:
            at["COLOR_0"] = self._acc(np.asarray(malla.col, np.float32), "VEC4", 5126, 34962)
        prim["indices"] = self._acc(malla.idx.reshape(-1), "SCALAR", 5125, 34963)
        nombres = list(malla.formas.keys())
        prim["targets"] = [{"POSITION": self._sparse(malla.formas[n])} for n in nombres]
        me = {"name": malla.nombre, "primitives": [prim]}
        if nombres:
            me["extras"] = {"targetNames": nombres}
            me["weights"] = [0.0] * len(nombres)
        self.meshes.append(me)
        self.nodes.append({"name": malla.nombre, "mesh": len(self.meshes) - 1})

    def guardar(self, ruta):
        j = {"asset": {"version": "2.0", "generator": "generar_humano.py (Casita GD-10a)"},
             "scene": 0, "scenes": [{"nodes": list(range(len(self.nodes)))}],
             "nodes": self.nodes, "meshes": self.meshes, "materials": self.mats,
             "accessors": self.accs, "bufferViews": self.views,
             "buffers": [{"byteLength": len(self.bin)}]}
        js = json.dumps(j, separators=(",", ":")).encode()
        while len(js) % 4:
            js += b" "
        b = bytes(self.bin)
        while len(b) % 4:
            b += b"\0"
        tot = 12 + 8 + len(js) + 8 + len(b)
        with open(ruta, "wb") as f:
            f.write(struct.pack("<III", 0x46546C67, 2, tot))
            f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
            f.write(struct.pack("<II", len(b), 0x004E4942) + b)


# ------------------------------------------------------------------ piezas auxiliares
def esfera(c, r, n=20):
    """Esfera UV con proyección plana frontal (el iris queda hacia -Z)."""
    pos, uv, idx = [], [], []
    for i in range(n + 1):
        th = math.pi * i / n
        for j in range(n * 2 + 1):
            ph = 2 * math.pi * j / (n * 2)
            x, y, z = math.sin(th) * math.sin(ph), math.cos(th), -math.sin(th) * math.cos(ph)
            pos.append([c[0] + r * x, c[1] + r * y, c[2] + r * z])
            uv.append([0.5 + x * 0.5, 0.5 - y * 0.5])
    w = n * 2 + 1
    for i in range(n):
        for j in range(n * 2):
            a, b, cc, d = i * w + j, i * w + j + 1, (i + 1) * w + j, (i + 1) * w + j + 1
            idx += [(a, cc, b), (b, cc, d)]
    return np.array(pos), np.array(uv), np.array(idx)


def centro_joint(D, W, nombre):
    ids = sorted({v for cara, gr in zip(D.caras, D.grupo) if gr == nombre for v, _ in cara})
    return np.array(ids)


def textura_ojo(ruta):
    from PIL import Image, ImageDraw, ImageFilter
    S = 256
    im = Image.new("RGB", (S, S), (236, 232, 228))
    d = ImageDraw.Draw(im)
    c = S / 2
    def disco(r, col):
        d.ellipse([c - r * S, c - r * S, c + r * S, c + r * S], fill=col)
    disco(0.40, (60, 38, 22))
    disco(0.35, (108, 70, 38))
    disco(0.27, (140, 92, 50))
    disco(0.15, (10, 8, 8))
    d.ellipse([c + 0.06 * S, c - 0.14 * S, c + 0.12 * S, c - 0.08 * S], fill=(250, 250, 250))
    im = im.filter(ImageFilter.GaussianBlur(1.2))
    im.save(ruta)


def mascara_labios_cejas(D, W):
    """Máscaras por vértice de base.obj a partir de los targets de labios y cejas."""
    def umbral(ts, k):
        m = np.zeros(len(D.v))
        for t in ts:
            m = np.maximum(m, np.linalg.norm(D.target(t), axis=1))
        return m > k * m.max()
    lab = umbral(("mouth/mouth-lowerlip-volume-incr", "mouth/mouth-upperlip-volume-incr"), 0.45)
    ce = umbral(("eyebrows/eyebrows-trans-up",), 0.5)
    return lab, ce


def cuerpo_n_z(cuerpo_pos, W, vi):
    """Máscara de vértices de la cara frontal (z < -0.10 aprox.)."""
    return cuerpo_pos[:, 2] < -0.105


def ensamblar(D, W, formas, exprs, sal, g, ropa=None):
    """Cuerpo + ojos (+ piezas extra) en un GLB."""
    vi = W.vi
    P0 = W.a_metros(D.v + W.neutro_dm - 0 * D.v)  # D.v + neutro ya es neutro_dm
    P0 = W.a_metros(W.neutro_dm)
    cuerpo = Malla("Cuerpo", P0[vi], W.tri, W.uv)
    lab, ce = mascara_labios_cejas(D, W)
    col = np.ones((len(vi), 4), np.float32)
    col[lab[vi]] = (0.93, 0.66, 0.64, 1)
    # cejas: banda suave de color oscuro sobre el ojo (los targets de cejas de MakeHuman mueven toda la frente)
    X, Y = np.abs(P0[vi][:, 0]), P0[vi][:, 1]
    frente = cuerpo_n_z(cuerpo_pos=P0[vi], W=W, vi=vi)
    yb = 1.598 + 0.22 * np.clip(X - 0.02, 0, 0.06) - 0.5 * np.clip(X - 0.055, 0, 1) ** 2 * 3
    w = np.exp(-(((Y - yb) / 0.0045) ** 2)) * ((X > 0.018) & (X < 0.075) & frente)
    col[:, :3] *= (1 - 0.68 * w)[:, None]
    cuerpo.col = col
    cuerpo.calcular_normales(soldar=vi)
    for n, d in sal.items():
        cuerpo.formas[n] = d[vi].astype(np.float32)
    return cuerpo, P0


PIELES = [("clara", "Clara", (238, 204, 186)), ("media", "Media", (216, 170, 140)),
          ("morena", "Morena", (176, 124, 92)), ("oscura", "Oscura", (108, 72, 54))]


def generar_pieles(carpeta):
    from PIL import Image, ImageFilter
    os.makedirs(carpeta, exist_ok=True)
    rng = np.random.default_rng(10)
    S = 1024
    grueso = rng.normal(size=(S // 64, S // 64))
    medio = rng.normal(size=(S // 8, S // 8))
    fino = rng.normal(size=(S, S))
    def esc(a):
        return np.asarray(Image.fromarray(a.astype(np.float32), "F").resize((S, S), Image.BICUBIC))
    ruido = 0.012 * esc(grueso) + 0.008 * esc(medio) + 0.006 * fino
    for pid, _, c in PIELES:
        base = np.array(c, np.float32)
        img = base[None, None, :] * (1 + ruido[..., None])
        img[..., 1] *= 1 - 0.01 * esc(grueso)
        img[..., 0] *= 1 + 0.015 * esc(grueso)
        Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(carpeta, "piel_%s.jpg" % pid), quality=82)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    raiz = sys.argv[1]
    salida = "godot/arte/humano"
    if "--salida" in sys.argv:
        salida = sys.argv[sys.argv.index("--salida") + 1]
    os.makedirs(salida, exist_ok=True)
    D = Datos(raiz)
    W = Mundo(D)
    formas, exprs, sal = calcular_formas(D, W)
    cuerpo, P0 = ensamblar(D, W, formas, exprs, sal, None)
    glb = GLB()
    m_piel = glb.material("piel", (1, 1, 1, 1), 0.7)
    glb.anadir(cuerpo, m_piel)
    resumen = {"Cuerpo": (len(cuerpo.pos), cuerpo.tris)}
    # ojos
    m_ojo = glb.material("ojo", (1, 1, 1, 1), 0.25)
    for lado, jn in (("izq", "joint-l-eye"), ("der", "joint-r-eye")):
        ids = centro_joint(D, W, jn)
        c = P0[ids].mean(axis=0)
        p, uv, idx = esfera(c, 0.0118)
        o = Malla("Ojo_" + lado, p, idx, uv)
        o.calcular_normales()
        for n, d in sal.items():
            if n.startswith("x_"):
                continue
            o.formas[n] = np.repeat(d[ids].mean(axis=0, keepdims=True), len(p), axis=0).astype(np.float32)
        glb.anadir(o, m_ojo)
        resumen["Ojo_" + lado] = (len(p), o.tris)
    Z = clasificar(D, W, P0)
    P = cuerpo.pos
    ropas, base = crear_ropas(cuerpo, W, P, Z)
    m_ropa = glb.material("ropa", (0.7, 0.7, 0.7, 1), 0.9, True)
    solo_cuerpo(base)
    glb.anadir(base, m_ropa)
    resumen["ropa_base"] = (len(base.pos), base.tris)
    for i, n, capa, m in ropas:
        if m.nrm is None:
            m.calcular_normales()
        solo_cuerpo(m)
        glb.anadir(m, m_ropa)
        resumen[m.nombre] = (len(m.pos), m.tris)
    pelos = crear_pelos(cuerpo, W, P, Z)
    m_pelo = glb.material("pelo", (1, 1, 1, 1), 0.5, True)
    for i, n, m, _ in pelos:
        solo_cuerpo(m, True)
        glb.anadir(m, m_pelo)
        resumen[m.nombre] = (len(m.pos), m.tris)
    glb.guardar(os.path.join(salida, "humano.glb"))
    textura_ojo(os.path.join(salida, "ojo.png"))
    generar_pieles(os.path.join(salida, "pieles"))
    cat = {"formas": [{"id": f["id"], "n": f["n"], "grupo": f["grupo"], "min": f["min"], "max": f["max"], "def": 0.0} for f in formas],
           "pieles": [{"id": a, "n": b} for a, b, _ in PIELES],
           "expresiones": [{"id": e["id"], "n": e["n"]} for e in exprs],
           "dh": {n: round(float(d[W.vi][np.argmax(P0[W.vi][:, 1]), 1]), 4) for n, d in sal.items() if not n.startswith("x_")},
           "pelos": [{"id": "", "n": "Sin pelo"}] + [{"id": i, "n": n} for i, n, _, _ in pelos],
           "ropas": [{"id": i, "n": n, "capa": c} for i, n, c, _ in ropas]}
    json.dump(cat, open(os.path.join(salida, "catalogo.json"), "w"), ensure_ascii=False, indent=1)
    print("pieza  vértices  triángulos")
    for k, (a, b) in resumen.items():
        print(k, a, b)
    print("esc", W.esc, "formas", len(sal), "glb KB", os.path.getsize(os.path.join(salida, "humano.glb")) // 1024)



# ------------------------------------------------------------------ ropa y pelo generados desde la malla
# El repositorio de MakeHuman no trae ropa ni pelo CC0 (viven en makehuman-assets, inaccesible), así que
# las prendas son «carcasas»: caras del propio cuerpo desplazadas por la normal, con los mismos deltas.
ARMA = ("upperarm", "lowerarm", "wrist", "metacarpal", "finger", "shoulder", "clavicle")
CABEZA = ("head", "jaw", "eye", "oculi", "levator", "orbicularis", "oris", "risorius", "special", "tongue", "neck")
PIERNA = ("upperleg", "lowerleg", "foot", "toe")


def clasificar(D, W, P0):
    """Zona por vértice de cuerpo: dict de máscaras booleanas."""
    mejor = np.zeros(len(D.v))
    hueso = np.array([""] * len(D.v), dtype=object)
    for b, l in D.pesos().items():
        for i, x in l:
            if x > mejor[i]:
                mejor[i] = x
                hueso[i] = b
    hb = hueso[W.vi]
    emp = lambda pref: np.array([h.startswith(pref) for h in hb])
    z = {}
    z["brazo1"] = emp(("upperarm01", "shoulder", "clavicle"))
    z["brazo2"] = emp("upperarm02")
    z["antebrazo"] = emp("lowerarm")
    z["mano"] = emp(("wrist", "metacarpal", "finger"))
    z["cabeza"] = emp(CABEZA)
    z["pierna"] = emp(PIERNA)
    z["pie"] = emp(("foot", "toe"))
    z["tronco"] = ~(z["brazo1"] | z["brazo2"] | z["antebrazo"] | z["mano"] | z["cabeza"] | z["pierna"])
    z["hueso"] = hb
    return z


def prenda(nombre, cuerpo, W, campo, offset, col=None, recortar_suelo=False, suavizar=0):
    """Carcasa del cuerpo: parte de la malla donde campo > 0 (se recorta por el cero, borde limpio),
    desplazada 'offset' metros por la normal. 'campo' puede ser bool o float por vértice del cuerpo."""
    f = np.asarray(campo)
    f = np.where(f, 1.0, -1.0) if f.dtype == bool else f.astype(np.float64)
    N = len(cuerpo.pos)
    off = np.broadcast_to(np.asarray(offset, np.float64), (N,))
    P = cuerpo.pos.astype(np.float64)
    nr = cuerpo.nrm.astype(np.float64)
    forms = {n: d.astype(np.float64) for n, d in cuerpo.formas.items()}
    colv = None if col is None else np.asarray(col, np.float64)
    nuevos = {}           # (a,b) -> índice del vértice creado
    extra = []            # (a, b, t)
    def cruce(a, b):
        k = (a, b) if a < b else (b, a)
        if k not in nuevos:
            t = f[k[0]] / (f[k[0]] - f[k[1]])
            nuevos[k] = N + len(extra)
            extra.append((k[0], k[1], t))
        return nuevos[k]
    tris = []
    for t in W.tri:
        d = f[t] > 0
        n = d.sum()
        if n == 3:
            tris.append(tuple(t))
        elif n == 2:
            i = [k for k in range(3) if not d[k]][0]
            a, b, c = t[i], t[(i + 1) % 3], t[(i + 2) % 3]
            ab, ca = cruce(a, b), cruce(c, a)
            tris += [(ab, b, c), (ab, c, ca)]
        elif n == 1:
            i = [k for k in range(3) if d[k]][0]
            a, b, c = t[i], t[(i + 1) % 3], t[(i + 2) % 3]
            tris.append((a, cruce(a, b), cruce(c, a)))
    ea = np.array([e[0] for e in extra], int)
    eb = np.array([e[1] for e in extra], int)
    et = np.array([e[2] for e in extra])[:, None] if extra else np.zeros((0, 1))
    lerp = lambda A: np.concatenate([A, A[ea] * (1 - et) + A[eb] * et]) if extra else A
    P2, n2, o2 = lerp(P), lerp(nr), lerp(off[:, None])[:, 0]
    n2 = n2 / np.maximum(np.linalg.norm(n2, axis=1, keepdims=True), 1e-9)
    tris = np.array(tris, np.int64)
    usados = np.unique(tris)
    mapa = -np.ones(len(P2), np.int64)
    mapa[usados] = np.arange(len(usados))
    pos = P2[usados] + n2[usados] * o2[usados, None]
    for _ in range(suavizar):      # difumina detalles (p. ej. dedos de los pies en las zapatillas)
        acc, cnt = np.zeros_like(pos), np.zeros(len(pos))
        tt = mapa[tris]
        for a_, b_ in ((0, 1), (1, 2), (2, 0)):
            np.add.at(acc, tt[:, a_], pos[tt[:, b_]]); np.add.at(cnt, tt[:, a_], 1)
            np.add.at(acc, tt[:, b_], pos[tt[:, a_]]); np.add.at(cnt, tt[:, b_], 1)
        pos = 0.5 * pos + 0.5 * acc / np.maximum(cnt, 1)[:, None]
    if recortar_suelo:
        pos[:, 1] = np.maximum(pos[:, 1], 0.0)
    m = Malla(nombre, pos, mapa[tris])
    m.nrm = n2[usados].astype(np.float32)
    if colv is not None:
        m.col = lerp(colv)[usados]
    for n, d in forms.items():
        m.formas[n] = lerp(d)[usados].astype(np.float32)
    return m


def ligar_idw(cuerpo, pos, k=6):
    """Deltas de formas para geometría suelta (falda, moño): media ponderada de los k vértices más próximos."""
    from scipy.spatial import cKDTree
    d, i = cKDTree(cuerpo.pos).query(pos, k=k)
    w = 1.0 / (d + 0.01)
    w /= w.sum(axis=1, keepdims=True)
    out = {}
    for n, dl in cuerpo.formas.items():
        out[n] = np.einsum("nk,nkc->nc", w, dl[i]).astype(np.float32)
    return out


def falda(nombre, cuerpo, P, y_cintura, y_bajo, vuelo=0.0, anillos=9, seg=36, valido=None):
    pos, tri = [], []
    for a in range(anillos + 1):
        t = a / anillos
        y = y_cintura + (y_bajo - y_cintura) * t
        banda = (np.abs(P[:, 1] - y) < 0.03) & (P[:, 1] > 0.1) & valido
        q = P[banda]
        rx = np.abs(q[:, 0]).max() + 0.018 + vuelo * t
        zc = (q[:, 2].max() + q[:, 2].min()) / 2
        rz = (q[:, 2].max() - q[:, 2].min()) / 2 + 0.018 + vuelo * t * 0.8
        for s_ in range(seg):
            ph = 2 * math.pi * s_ / seg
            pos.append([rx * math.sin(ph), y, zc + rz * math.cos(ph)])
    for a in range(anillos):
        for s_ in range(seg):
            i0, i1 = a * seg + s_, a * seg + (s_ + 1) % seg
            j0, j1 = (a + 1) * seg + s_, (a + 1) * seg + (s_ + 1) % seg
            tri += [(i0, i1, j0), (i1, j1, j0)]
    pos = np.array(pos)
    m = Malla(nombre, pos, np.array(tri))
    m.calcular_normales()
    m.formas = ligar_idw(cuerpo, pos.astype(np.float32))
    return m


FORMAS_CARA = ("cara_ancho", "nariz", "labios", "ojos_tam", "mandibula")


def solo_cuerpo(m, con_cara=False):
    """Las prendas no necesitan expresiones ni (salvo el pelo) formas de cara: ahorra peso."""
    m.formas = {n: d for n, d in m.formas.items()
                if not n.startswith("x_") and (con_cara or not n.startswith(FORMAS_CARA))}
    return m


def suave(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def crear_pelos(cuerpo, W, P, Z):
    """Peinados como carcasas sobre cabeza/cuello/espalda. Devuelve [(id, nombre visible, Malla, None)]."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    ax = np.abs(x)
    relz = z + 0.055
    oreja = (ax > 0.074) & (relz > -0.045) & (relz < 0.03) & (y > 1.50) & (y < 1.65)
    # línea de nacimiento del pelo (altura mínima de la gorra)
    ymin = 1.635 - 0.06 * suave(ax, 0.04, 0.085) - 0.12 * suave(relz, -0.045, 0.06)
    cab = Z["cabeza"] & (y > 1.50)
    gorra = np.where(cab & ~oreja, np.minimum(y - ymin, 0.02) + 0.003, -1.0)
    def varcol():
        v = 0.86 + 0.14 * np.sin(x * 420 + z * 90) * np.cos(y * 130)
        return np.stack([v, v, v, np.ones_like(v)], axis=1)
    res = []
    res.append(("corto", "Corto", prenda("pelo_corto", cuerpo, W, gorra, np.full(len(x), 0.011), varcol()), None))
    atras = (Z["cabeza"] | Z["tronco"]) & (relz > 0.03) & ~oreja
    # media melena: cortina trasera hasta los hombros
    c1 = np.where(atras, np.minimum(1.57 - y, y - 1.37), -1.0)
    c1 = np.minimum(c1, 0.115 - ax)
    camp = np.maximum(gorra, c1)
    off = np.where(gorra > 0, 0.012, 0.0) + np.where(c1 > 0, 0.020 + 0.012 * suave(relz, 0.03, 0.08), 0.0)
    off = np.where(gorra > 0, np.maximum(off, 0.012), off)
    res.append(("media", "Media melena", prenda("pelo_media", cuerpo, W, camp, off, varcol()), None))
    c2 = np.where(atras, np.minimum(1.57 - y, y - 1.12), -1.0)
    c2 = np.minimum(c2, 0.125 - ax - 0.03 * suave(1.45 - y, 0, 0.3))
    camp = np.maximum(gorra, c2)
    off = np.where(gorra > 0, 0.012, 0.0) + np.where(c2 > 0, 0.022 + 0.012 * suave(relz, 0.03, 0.08), 0.0)
    off = np.where(gorra > 0, np.maximum(off, 0.012), off)
    res.append(("largo", "Largo", prenda("pelo_largo", cuerpo, W, camp, off, varcol()), None))
    return res


def crear_ropas(cuerpo, W, P, Z):
    """Prendas. Devuelve [(id, nombre, capa, Malla)] y la ropa base (Malla)."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    ax = np.abs(x)
    brazo = Z["brazo1"] | Z["brazo2"] | Z["antebrazo"]
    mano = Z["mano"]
    cabeza = Z["cabeza"]
    pie = Z["pie"]
    # distancia a lo largo del brazo desde el hombro (brazo en A: dirección ≈ (0.55, -0.83))
    sd = (ax - 0.12) * 0.55 + (1.42 - y) * 0.83
    brazo = brazo | mano
    # escote: baja por delante
    cc = 1.425 - 0.04 * (1 - suave(z, -0.08, -0.01))
    cuello = cc + 1.0 * ax - y
    cuello = np.where(cabeza & (y > 1.5), -1, cuello)
    ropas = []
    def add(i, n, capa, campo, off, rs=False, su=0):
        ropas.append((i, n, capa, prenda("ropa_" + i, cuerpo, W, campo, off, recortar_suelo=rs, suavizar=su)))
    def torso(hem, manga, c_extra=0.0):
        return np.where(brazo, manga - sd, np.minimum(y - hem, cuello + c_extra))
    pantalon = lambda cin: np.where(brazo | cabeza, -1.0, np.minimum(cin - y, y - 0.115))
    top = np.where(brazo | cabeza, -1.0, np.minimum(np.minimum(y - 1.05, 1.40 - y), cuello + 0.0))
    briefs = np.where(brazo | cabeza, -1.0, np.minimum(0.95 - y, y - 0.64))
    base = prenda("ropa_base", cuerpo, W, np.maximum(top, briefs), 0.0035)
    add("camiseta", "Camiseta", "arriba", torso(0.86, 0.17), 0.008)
    add("sudadera", "Sudadera", "arriba", torso(0.84, 0.46, 0.03), 0.012)
    add("vaqueros", "Vaqueros", "abajo", pantalon(1.02), 0.009)
    add("chandal", "Pantalón de chándal", "abajo", pantalon(1.04), 0.010)
    add("zapatillas", "Zapatillas", "pies", np.where(pie, 0.105 - y, -1.0), 0.013, rs=True, su=8)
    cuerpo_v = prenda("ropa_vestido", cuerpo, W, np.where(brazo, 0.17 - sd, np.minimum(y - 0.99, cuello)), 0.008)
    f = falda("falda_v", cuerpo, P, 1.0, 0.50, vuelo=0.10, valido=~(brazo | cabeza))
    ropas.append(("vestido", "Vestido", "entero", unir("ropa_vestido", cuerpo_v, f)))
    ropas.append(("falda", "Falda", "abajo", falda("ropa_falda", cuerpo, P, 1.02, 0.50, vuelo=0.08, valido=~(brazo | cabeza))))
    return ropas, base


def unir(nombre, a, b):
    m = Malla(nombre, np.concatenate([a.pos, b.pos]), np.concatenate([a.idx, b.idx + len(a.pos)]))
    m.nrm = np.concatenate([a.nrm, b.nrm])
    for n in a.formas:
        m.formas[n] = np.concatenate([a.formas[n], b.formas[n]])
    return m


if __name__ == "__main__":
    main()
