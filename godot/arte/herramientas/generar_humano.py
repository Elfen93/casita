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
    # sonrisa con la boca cerrada: comisuras hacia arriba y los ojos que la acompañan. La anterior (elevación del labio
    # + separación) enseñaba los dientes apretados y parecía una mueca.
    ex.append(dict(id="sonrisa", n="Sonrisa", pos=L(u("mouth-corner-puller", 0.62), u("mouth-retraction", 0.12), u("eye-left-slit", 0.25), u("eye-right-slit", 0.25))))
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
        self.sk = None        # pesos densos (N, n_huesos)
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
        self.skins, self.anims, self.malla_nodos = [], [], []

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
        if malla.sk is not None and self.skins:
            jn, wt = reducir_pesos(malla.sk)
            at["JOINTS_0"] = self._acc(jn, "VEC4", 5123, 34962)
            at["WEIGHTS_0"] = self._acc(wt, "VEC4", 5126, 34962)
        prim["indices"] = self._acc(malla.idx.reshape(-1), "SCALAR", 5125, 34963)
        nombres = list(malla.formas.keys())
        prim["targets"] = [{"POSITION": self._sparse(malla.formas[n])} for n in nombres]
        me = {"name": malla.nombre, "primitives": [prim]}
        if nombres:
            me["extras"] = {"targetNames": nombres}
            me["weights"] = [0.0] * len(nombres)
        self.meshes.append(me)
        nd = {"name": malla.nombre, "mesh": len(self.meshes) - 1}
        if self.skins and malla.sk is not None:
            nd["skin"] = 0
        self.nodes.append(nd)
        self.malla_nodos.append(len(self.nodes) - 1)

    def esqueleto(self, nombres, padres, pos):
        ix = {n: i for i, n in enumerate(nombres)}
        for i, (n, p) in enumerate(zip(nombres, padres)):
            loc = pos[i] - (pos[ix[p]] if p is not None else 0)
            self.nodes.append({"name": n, "translation": [float(x) for x in loc]})
        for i, p in enumerate(padres):
            if p is not None:
                self.nodes[ix[p]].setdefault("children", []).append(i)
        ibm = np.zeros((len(nombres), 16), np.float32)
        for i in range(len(nombres)):
            m = np.eye(4); m[:3, 3] = -pos[i]
            ibm[i] = m.T.reshape(-1)
        a = self._acc(ibm, "MAT4", 5126)
        self.skins.append({"name": "Esqueleto", "joints": list(range(len(nombres))), "inverseBindMatrices": a, "skeleton": 0})
        self.joint_ix = ix

    def animacion(self, nombre, tiempos, rots, tras):
        samplers, canales = [], []
        ti = self._acc(np.asarray(tiempos, np.float32).reshape(-1, 1), "SCALAR", 5126, None, True)
        for hueso, q in rots.items():
            o = self._acc(np.asarray(q, np.float32), "VEC4", 5126)
            samplers.append({"input": ti, "output": o, "interpolation": "LINEAR"})
            canales.append({"sampler": len(samplers) - 1, "target": {"node": self.joint_ix[hueso], "path": "rotation"}})
        o = self._acc(np.asarray(tras, np.float32), "VEC3", 5126)
        samplers.append({"input": ti, "output": o, "interpolation": "LINEAR"})
        canales.append({"sampler": len(samplers) - 1, "target": {"node": self.joint_ix["root"], "path": "translation"}})
        self.anims.append({"name": nombre, "samplers": samplers, "channels": canales})

    def guardar(self, ruta):
        j = {"asset": {"version": "2.0", "generator": "generar_humano.py (Casita GD-10a)"},
             "scene": 0, "scenes": [{"nodes": ([0] if self.skins else []) + self.malla_nodos}],
             "nodes": self.nodes, "meshes": self.meshes, "materials": self.mats,
             "accessors": self.accs, "bufferViews": self.views,
             "buffers": [{"byteLength": len(self.bin)}]}
        if self.skins:
            j["skins"] = self.skins
        if self.anims:
            j["animations"] = self.anims
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
    podar(base, 0.008)
    glb.anadir(base, m_ropa)
    resumen["ropa_base"] = (len(base.pos), base.tris)
    for i, n, capa, m in ropas:
        if m.nrm is None:
            m.calcular_normales()
        solo_cuerpo(m)
        podar(m, 0.008)
        glb.anadir(m, m_ropa)
        resumen[m.nombre] = (len(m.pos), m.tris)
    pelos = crear_pelos(cuerpo, W, P, Z)
    m_pelo = glb.material("pelo", (1, 1, 1, 1), 0.5, True)
    for i, n, m, _ in pelos:
        solo_cuerpo(m, True)
        podar(m, 0.005)
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


def prenda(nombre, cuerpo, W, campo, offset, col=None, recortar_suelo=False, suavizar=0, alisar=False):
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
    if alisar:   # tela lisa sobre el pecho: no copia pezones
        w = ((pos[:, 2] < -0.04) & (pos[:, 1] > 1.14) & (pos[:, 1] < 1.40) & (np.abs(pos[:, 0]) < 0.19)).astype(float)
        w = w * 0.8 * (np.abs(pos[:, 0]) < 0.115)
        tt = mapa[tris]
        for _ in range(10):
            acc, cnt = np.zeros_like(pos), np.zeros(len(pos))
            for a_, b_ in ((0, 1), (1, 2), (2, 0)):
                np.add.at(acc, tt[:, a_], pos[tt[:, b_]]); np.add.at(cnt, tt[:, a_], 1)
                np.add.at(acc, tt[:, b_], pos[tt[:, a_]]); np.add.at(cnt, tt[:, b_], 1)
            d_ = acc / np.maximum(cnt, 1)[:, None] - pos
            nn = n2[usados]
            d_ -= nn * np.minimum((d_ * nn).sum(axis=1), 0)[:, None]      # solo hacia fuera: no hunde la tela
            pos = pos + w[:, None] * d_
        pos = pos + n2[usados] * (0.006 * w)[:, None]      # holgura extra donde el pecho crece con la forma
    if recortar_suelo:
        pos[:, 1] = np.maximum(pos[:, 1], 0.0)
    m = Malla(nombre, pos, mapa[tris])
    m.nrm = n2[usados].astype(np.float32)
    if cuerpo.sk is not None:
        m.sk = lerp(cuerpo.sk.astype(np.float64))[usados].astype(np.float32)
    if colv is not None:
        m.col = lerp(colv)[usados]
    if alisar:
        m.calcular_normales()
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


def ligar_sk(cuerpo, pos, k=6):
    from scipy.spatial import cKDTree
    d, i = cKDTree(cuerpo.pos).query(pos, k=k)
    w = 1.0 / (d + 0.01)
    w /= w.sum(axis=1, keepdims=True)
    return np.einsum("nk,nkj->nj", w, cuerpo.sk[i]).astype(np.float32)


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
    m.sk = ligar_sk(cuerpo, pos.astype(np.float32))
    return m


FORMAS_CARA = ("cara_ancho", "nariz", "labios", "ojos_tam", "mandibula")


def solo_cuerpo(m, con_cara=False):
    """Las prendas no necesitan expresiones ni (salvo el pelo) formas de cara: ahorra peso."""
    m.formas = {n: d for n, d in m.formas.items()
                if not n.startswith("x_") and (con_cara or not n.startswith(FORMAS_CARA))}
    return m


def podar(m, umbral=0.0015):
    """Quita las blend shapes cuyo desplazamiento máximo en esta pieza es invisible (< 1,5 mm): Godot las guarda densas."""
    m.formas = {n: d for n, d in m.formas.items() if np.abs(d).max() >= umbral or (n.startswith("pecho") and np.abs(d).max() > 0.0015)}
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
        ropas.append((i, n, capa, prenda("ropa_" + i, cuerpo, W, campo, off, recortar_suelo=rs, suavizar=su, alisar=(capa in ("arriba", "entero")))))
    def torso(hem, manga, c_extra=0.0):
        return np.where(brazo, manga - sd, np.minimum(y - hem, cuello + c_extra))
    pantalon = lambda cin: np.where(brazo | cabeza, -1.0, np.minimum(cin - y, y - 0.115))
    # top de tirantes: sisa vertical, escote redondo (más bajo por delante), borde inferior recto
    escote = (1.405 - 0.085 * np.clip(1 - (ax / 0.085) ** 2, 0, 1) * (1 - suave(z, -0.06, -0.01))) - y
    top = np.where(brazo | cabeza, -1.0, np.minimum(np.minimum(y - 1.05, 0.142 - ax), escote))
    briefs = np.where(brazo | cabeza, -1.0, np.minimum(0.95 - y, y - 0.64))
    base = prenda("ropa_base", cuerpo, W, np.maximum(top, briefs), 0.0035, alisar=True)
    add("camiseta", "Camiseta", "arriba", torso(0.86, 0.17), 0.008)
    add("sudadera", "Sudadera", "arriba", torso(0.84, 0.46, 0.03), 0.012)
    add("vaqueros", "Vaqueros", "abajo", pantalon(1.02), 0.009)
    ropas.append(("zapatillas", "Zapatillas", "pies", unir("ropa_zapatillas", zapato("zi", cuerpo, P, pie, -1), zapato("zd", cuerpo, P, pie, 1))))
    cuerpo_v = prenda("ropa_vestido", cuerpo, W, np.where(brazo, 0.17 - sd, np.minimum(y - 0.99, cuello)), 0.008, alisar=True)
    f = falda("falda_v", cuerpo, P, 1.0, 0.50, vuelo=0.10, valido=~(brazo | cabeza))
    ropas.append(("vestido", "Vestido", "entero", unir("ropa_vestido", cuerpo_v, f)))
    ropas.append(("falda", "Falda", "abajo", falda("ropa_falda", cuerpo, P, 1.02, 0.50, vuelo=0.08, valido=~(brazo | cabeza))))
    return ropas, base


def unir(nombre, a, b):
    m = Malla(nombre, np.concatenate([a.pos, b.pos]), np.concatenate([a.idx, b.idx + len(a.pos)]))
    m.nrm = np.concatenate([a.nrm, b.nrm])
    if a.sk is not None:
        m.sk = np.concatenate([a.sk, b.sk])
    for n in a.formas:
        m.formas[n] = np.concatenate([a.formas[n], b.formas[n]])
    return m



# ------------------------------------------------------------------ esqueleto simplificado (nombres de la Universal Animation Library)
# (nombre, padre, hueso MakeHuman del que sale la cabeza, huesos MakeHuman cuyos pesos se acumulan)
def _lr(n, p, mh, grupos):
    return [(n + "_l", p + ("_l" if p.endswith(("clavicle", "upperarm", "lowerarm", "thigh", "calf", "foot")) else ""), mh + ".L", [g + ".L" for g in grupos]),
            (n + "_r", p + ("_r" if p.endswith(("clavicle", "upperarm", "lowerarm", "thigh", "calf", "foot")) else ""), mh + ".R", [g + ".R" for g in grupos])]

CARA = ["jaw", "levator05", "levator06", "oculi01", "orbicularis03", "orbicularis04", "oris03", "oris07", "risorius03", "special05"]
def definir_esqueleto():
    h = []
    h.append(("root", None, None, []))
    h.append(("pelvis", "root", "spine05", ["root", "pelvis.L", "pelvis.R", "spine05"]))
    h.append(("spine_01", "pelvis", "spine04", ["spine04"]))
    h.append(("spine_02", "spine_01", "spine02", ["spine03", "spine02", "breast.L", "breast.R"]))
    h.append(("spine_03", "spine_02", "spine01", ["spine01"]))
    h.append(("neck_01", "spine_03", "neck01", ["neck01", "neck02", "neck03"]))
    h.append(("Head", "neck_01", "head", ["head", "jaw", "eye.L", "eye.R", "special04", "oris01", "oris05", "tongue00", "tongue01", "tongue02", "tongue03", "tongue04"]
              + [c + s for c in ("levator05", "levator06", "oculi01", "orbicularis03", "orbicularis04", "oris03", "oris07", "risorius03", "special05", "tongue05", "tongue06", "tongue07") for s in (".L", ".R")]))
    for lado in ("L", "R"):
        sf = "_" + lado.lower()
        h.append(("clavicle" + sf, "spine_03", "clavicle." + lado, ["clavicle." + lado, "shoulder01." + lado]))
        h.append(("upperarm" + sf, "clavicle" + sf, "upperarm01." + lado, ["upperarm01." + lado, "upperarm02." + lado]))
        h.append(("lowerarm" + sf, "upperarm" + sf, "lowerarm01." + lado, ["lowerarm01." + lado, "lowerarm02." + lado]))
        h.append(("hand" + sf, "lowerarm" + sf, "wrist." + lado, ["wrist." + lado] + ["metacarpal%d.%s" % (i, lado) for i in range(1, 5)]
                  + ["finger%d-%d.%s" % (a, b, lado) for a in range(1, 6) for b in range(1, 4)]))
        h.append(("thigh" + sf, "pelvis", "upperleg01." + lado, ["upperleg01." + lado, "upperleg02." + lado]))
        h.append(("calf" + sf, "thigh" + sf, "lowerleg01." + lado, ["lowerleg01." + lado, "lowerleg02." + lado]))
        h.append(("foot" + sf, "calf" + sf, "foot." + lado, ["foot." + lado]))
        h.append(("ball" + sf, "foot" + sf, "toe1-1." + lado, ["toe%d-%d.%s" % (a, b, lado) for a in range(1, 6) for b in range(1, 4)]))
    # orden en profundidad (el mismo que usa Godot al importar el esqueleto: los índices de hueso de la malla deben coincidir)
    hijos = {}
    for e in h:
        hijos.setdefault(e[1], []).append(e)
    orden = []
    def rec(e):
        orden.append(e)
        for c in hijos.get(e[0], []):
            rec(c)
    rec(h[0])
    return orden


def calcular_esqueleto(D, W, nombres_h):
    """Posiciones de huesos (m, neutro) y pesos densos por vértice base (N_base, n_huesos)."""
    sk = json.load(open(os.path.join(D.d, "rigs", "default.mhskel")))
    Pn = W.a_metros(W.neutro_dm)
    pos = []
    jpos = {}
    for n, par, mh, grupos in nombres_h:
        if mh is None:
            pos.append(np.zeros(3)); continue
        jn = sk["bones"][mh]["head"]
        ids = sk["joints"][jn]
        pos.append(Pn[ids].mean(axis=0))
        jpos[n] = ids
    pos = np.array(pos)
    pos[0] = [0, 0, 0]
    # pesos
    wmh = D.pesos()
    idx = {n: i for i, (n, _, _, _) in enumerate(nombres_h)}
    mapa = {}
    for n, par, mh, grupos in nombres_h:
        for g in grupos:
            mapa[g] = idx[n]
    dense = np.zeros((len(D.v), len(nombres_h)))
    for b, l in wmh.items():
        if b not in mapa:
            raise SystemExit("hueso sin asignar: " + b)
        for v, w in l:
            dense[v, mapa[b]] += w
    tot = dense.sum(axis=1)
    return pos, dense, tot, jpos


def reducir_pesos(dense):
    """Top-4 por vértice, normalizado -> (joints uint16 (N,4), weights float32 (N,4))."""
    o = np.argsort(-dense, axis=1)[:, :4]
    w = np.take_along_axis(dense, o, axis=1)
    sm = w.sum(axis=1, keepdims=True)
    sm[sm == 0] = 1
    return o.astype(np.uint16), (w / sm).astype(np.float32)


# ------------------------------------------------------------------ zapato (puntera lisa, suela con grosor)
def zapato(nombre, cuerpo, P, pie, lado):
    sel = pie & (P[:, 1] < 0.115) & (np.sign(P[:, 0]) == lado)
    q = P[sel]
    z0, z1 = q[:, 2].min(), q[:, 2].max()
    zs = np.linspace(z0, z1, 15)
    xc, wx, yt = [], [], []
    for z in zs:
        b = q[np.abs(q[:, 2] - z) < 0.014]
        if len(b) == 0:
            b = q[np.argsort(np.abs(q[:, 2] - z))[:6]]
        xc.append((b[:, 0].min() + b[:, 0].max()) / 2)
        wx.append((b[:, 0].max() - b[:, 0].min()) / 2 + 0.010)
        yt.append(min(b[:, 1].max() + 0.012, 0.100))
    xc, wx, yt = map(np.array, (xc, wx, yt))
    rings = []
    # puntera (z negativa) y talón: anillos de cierre
    extra_f = [(-0.030, 0.55), (-0.018, 0.82), (-0.008, 0.95)]
    extra_b = [(0.008, 0.9), (0.017, 0.6), (0.022, 0.0)]
    # cierre de puntera: z menor del pie, escala decreciente
    seq = [(zs[0] + dz, sc, 0) for dz, sc in [(-0.034, 0.0), (-0.030, 0.5), (-0.018, 0.82), (-0.007, 0.96)]]
    seq += [(z, 1.0, i) for i, z in enumerate(zs)]
    seq += [(zs[-1] + dz, sc, len(zs) - 1) for dz, sc in [(0.007, 0.94), (0.015, 0.7), (0.020, 0.0)]]
    n_arc = 11
    pos = []
    for z, sc, i in seq:
        th = np.linspace(0, math.pi, n_arc)
        h = yt[i] * (1.0 if sc > 0 else 0.5)
        for t in th:
            yy = h * (math.sin(t) ** 0.55) * (sc ** 0.5 if sc < 1 else 1)
            bx = xc[i] + wx[i] * math.cos(t) * sc
            if yy < 0.022:
                bx = xc[i] + (bx - xc[i]) * 1.07      # reborde de la suela
            pos.append([bx, yy, z])
    pos = np.array(pos)
    tri = []
    for r in range(len(seq) - 1):
        for k in range(n_arc):
            a, b = r * n_arc + k, r * n_arc + (k + 1) % n_arc
            c, d = (r + 1) * n_arc + k, (r + 1) * n_arc + (k + 1) % n_arc
            tri += [(a, b, c), (b, d, c)]
    m = Malla(nombre, pos, np.array(tri))
    m.calcular_normales()
    # normales hacia fuera
    cen = pos.mean(axis=0)
    # (se orientan por centro de cada sección)
    m.formas = ligar_idw(cuerpo, pos.astype(np.float32))
    m.sk = ligar_sk(cuerpo, pos.astype(np.float32))
    return m



# ------------------------------------------------------------------ animaciones: Universal Animation Library -> esqueleto propio
def leer_glb(ruta):
    f = open(ruta, "rb").read()
    lj = struct.unpack("<I", f[12:16])[0]
    j = json.loads(f[20:20 + lj])
    off = 20 + lj + 8
    return j, f[off:]


def _acc(j, b, i):
    a = j["accessors"][i]
    v = j["bufferViews"][a["bufferView"]]
    nc = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    dt = {5126: np.float32, 5123: np.uint16, 5121: np.uint8}[a["componentType"]]
    o = v.get("byteOffset", 0) + a.get("byteOffset", 0)
    return np.frombuffer(b, dt, a["count"] * nc, o).reshape(a["count"], nc).astype(np.float64)


def qmul(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1*x2 + x1*w2 + y1*z2 - z1*y2, w1*y2 - x1*z2 + y1*w2 + z1*x2,
                     w1*z2 + x1*y2 - y1*x2 + z1*w2, w1*w2 - x1*x2 - y1*y2 - z1*z2])

def qinv(a):
    return np.array([-a[0], -a[1], -a[2], a[3]])

def qrot(q, v):
    return qmul(qmul(q, np.array([v[0], v[1], v[2], 0.0])), qinv(q))[:3]

def qarco(a, b):
    """Rotación mínima que lleva a en b (vectores)."""
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    c = np.cross(a, b); d = float(np.dot(a, b))
    if d < -0.999999:
        ax = np.cross(a, [1, 0, 0])
        if np.linalg.norm(ax) < 1e-6:
            ax = np.cross(a, [0, 1, 0])
        ax /= np.linalg.norm(ax)
        return np.array([ax[0], ax[1], ax[2], 0.0])
    q = np.array([c[0], c[1], c[2], 1 + d])
    return q / np.linalg.norm(q)

def qslerp(a, b, t):
    d = float(np.dot(a, b))
    if d < 0:
        b = -b; d = -d
    if d > 0.9995:
        r = a + t * (b - a)
        return r / np.linalg.norm(r)
    th = math.acos(d)
    return (math.sin((1 - t) * th) * a + math.sin(t * th) * b) / math.sin(th)

def qmat(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                     [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                     [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])


class Fuente:
    """Esqueleto de la UAL con FK."""
    def __init__(self, ruta):
        self.j, self.b = leer_glb(ruta)
        j = self.j
        self.nodos = j["nodes"]
        self.padre = {}
        for i, n in enumerate(self.nodos):
            for c in n.get("children", []):
                self.padre[c] = i
        self.idx = {n["name"]: i for i, n in enumerate(self.nodos)}
        self.rest = [(np.array(n.get("translation", [0, 0, 0]), float), np.array(n.get("rotation", [0, 0, 0, 1]), float)) for n in self.nodos]

    def mundo(self, locales, nombres):
        cache = {}
        def g(i):
            if i in cache:
                return cache[i]
            t, q = locales[i]
            if i in self.padre:
                pt, pq = g(self.padre[i])
                r = (pt + qrot(pq, t), qmul(pq, q))
            else:
                r = (t, q)
            cache[i] = r
            return r
        return {n: g(self.idx[n]) for n in nombres}

    def animacion(self, nombre):
        a = [x for x in self.j["animations"] if x["name"] == nombre][0]
        canales = {}
        dur = 0
        for c in a["channels"]:
            sm = a["samplers"][c["sampler"]]
            t = _acc(self.j, self.b, sm["input"])[:, 0]
            v = _acc(self.j, self.b, sm["output"])
            canales[(c["target"]["node"], c["target"]["path"])] = (t, v)
            dur = max(dur, t[-1])
        return canales, dur

    def muestrear(self, canales, t):
        loc = [list(r) for r in self.rest]
        for (ni, path), (ts, vs) in canales.items():
            if path == "scale":
                continue
            k = np.searchsorted(ts, t, side="right") - 1
            if k >= len(ts) - 1:
                v = vs[-1]
            elif k < 0:
                v = vs[0]
            else:
                u = (t - ts[k]) / (ts[k + 1] - ts[k])
                v = qslerp(vs[k], vs[k + 1], u) if path == "rotation" else vs[k] * (1 - u) + vs[k + 1] * u
            loc[ni][0 if path == "translation" else 1] = v
        return loc


def retargetear(fuente, anim, nombres, padres, pos_mias, fps=30):
    """Devuelve (tiempos, {hueso: (N,4) rot locales}, traslación del root (N,3)) en mi esqueleto."""
    Ry = np.array([0.0, 1.0, 0.0, 0.0])          # 180° sobre Y (la UAL mira a +Z, el humano a -Z)
    huesos = [n for n in nombres if n != "root"]
    rest_w = fuente.mundo(fuente.rest, huesos)
    # hijo principal de cada hueso (para la dirección de reposo)
    hijo = {}
    for n, p in zip(nombres, padres):
        if p is not None and p != "root" and p not in hijo:
            hijo[p] = n
    # preferir la cadena principal: spine_xx->siguiente, clavicle->upperarm, etc.
    pref = {"pelvis": "spine_01", "spine_03": "neck_01", "neck_01": "Head"}
    hijo.update(pref)
    ix = {n: i for i, n in enumerate(nombres)}
    A = {}
    for n in huesos:
        h = hijo.get(n)
        if h is None:
            continue
        dt = pos_mias[ix[h]] - pos_mias[ix[n]]
        ds_pos = rest_w[h][0] - rest_w[n][0]
        ds = qrot(Ry, ds_pos)
        A[n] = qarco(dt, ds)
    for n in huesos:                       # hojas: usan la A del padre
        if n not in A:
            p = padres[ix[n]]
            A[n] = A.get(p, np.array([0, 0, 0, 1.0]))
    canales, dur = fuente.animacion(anim)
    N = int(math.ceil(dur * fps)) + 1
    tiempos = np.arange(N) / fps
    rots = {n: np.zeros((N, 4)) for n in huesos}
    tras = np.zeros((N, 3))
    for k, t in enumerate(tiempos):
        loc = fuente.muestrear(canales, min(t, dur))
        w = fuente.mundo(loc, huesos)
        Pt = {}
        for n in huesos:                    # padres antes que hijos (orden de definición)
            R = qmul(w[n][1], qinv(rest_w[n][1]))
            Rp = qmul(qmul(Ry, R), qinv(Ry))
            Pt[n] = qmul(Rp, A[n])
            p = padres[ix[n]]
            pq = Pt.get(p, np.array([0, 0, 0, 1.0]))
            q = qmul(qinv(pq), Pt[n])
            if k > 0 and np.dot(q, rots[n][k - 1]) < 0:
                q = -q
            rots[n][k] = q / np.linalg.norm(q)
        d = w["pelvis"][0] - rest_w["pelvis"][0]
        tras[k] = qrot(Ry, d)
    return tiempos, rots, tras



def dividir_cuerpo(cuerpo, W, P, Z):
    """Reparte los triángulos del cuerpo en partes que se pueden ocultar cuando la ropa las tapa entera."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    ax = np.abs(x)
    brazo = Z["brazo1"] | Z["brazo2"] | Z["antebrazo"]
    mano, cabeza, pie = Z["mano"], Z["cabeza"], Z["pie"]
    noarm = ~(brazo | mano | cabeza)
    sd = (ax - 0.12) * 0.55 + (1.42 - y) * 0.83
    cc = 1.425 - 0.04 * (1 - suave(z, -0.08, -0.01))
    cuello = cc + ax - y
    preds = {
        "torso": noarm & (y >= 0.99) & (cuello > 0.015) & (ax < 0.2),
        "cadera": noarm & (y >= 0.87) & (y < 0.99),
        "muslo": noarm & (y >= 0.57) & (y < 0.87),
        "pierna": noarm & (y >= 0.13) & (y < 0.57),
        "brazo": (Z["brazo1"] | Z["brazo2"]) & (sd < 0.15),
        "pie": pie & (y < 0.10),
        "extrem": ~(cabeza | (y > 1.43)),      # manos, antebrazos y lo que sobre: sin formas de cara
    }
    restante = np.ones(len(W.tri), bool)
    partes = {}
    for nom, m in preds.items():
        ok = restante & m[W.tri].all(axis=1)
        restante &= ~ok
        partes[nom] = ok
    partes["resto"] = restante
    out = {}
    for nom, ok in partes.items():
        t = W.tri[ok]
        us = np.unique(t)
        mapa = -np.ones(len(P), np.int64)
        mapa[us] = np.arange(len(us))
        m = Malla("Cuerpo" if nom == "resto" else "Cuerpo_" + nom, cuerpo.pos[us], mapa[t], cuerpo.uv[us] if cuerpo.uv is not None else None)
        m.nrm = cuerpo.nrm[us]
        m.col = cuerpo.col[us]
        m.sk = cuerpo.sk[us]
        m.formas = {n: d[us] for n, d in cuerpo.formas.items()}
        out[nom] = m
    return out


ANIMS = [("parado", "Idle_Loop"), ("andar", "Walk_Loop"), ("sentado", "Sitting_Idle_Loop"),
         ("correr", "Jog_Fwd_Loop"), ("hablar", "Idle_Talking_Loop")]


def main2():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    raiz = sys.argv[1]
    salida = "godot/arte/humano"
    if "--salida" in sys.argv:
        salida = sys.argv[sys.argv.index("--salida") + 1]
    ual = "/tmp/gd10a/ual/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb"
    if "--ual" in sys.argv:
        ual = sys.argv[sys.argv.index("--ual") + 1]
    os.makedirs(salida, exist_ok=True)
    D = Datos(raiz)
    W = Mundo(D)
    formas, exprs, sal = calcular_formas(D, W)
    cuerpo, P0 = ensamblar(D, W, formas, exprs, sal, None)
    # esqueleto
    H = definir_esqueleto()
    nombres = [h[0] for h in H]
    padres = [h[1] for h in H]
    pos_h, dense, tot, jids = calcular_esqueleto(D, W, H)
    dn = dense / np.maximum(tot, 1e-9)[:, None]
    cuerpo.sk = dn[W.vi].astype(np.float32)
    glb = GLB()
    glb.esqueleto(nombres, padres, pos_h)
    m_piel = glb.material("piel", (1, 1, 1, 1), 0.7)
    Z = clasificar(D, W, P0)
    P = cuerpo.pos
    partes = dividir_cuerpo(cuerpo, W, P, Z)
    resumen = {}
    for k, m in partes.items():
        if k != "resto":
            solo_cuerpo(m)
        podar(m, 0.005)
        glb.anadir(m, m_piel)
        resumen[m.nombre] = (len(m.pos), m.tris)
    m_ojo = glb.material("ojo", (1, 1, 1, 1), 0.25)
    ih = nombres.index("Head")
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
        o.sk = np.zeros((len(p), len(nombres)), np.float32); o.sk[:, ih] = 1
        podar(o)
        glb.anadir(o, m_ojo)
        resumen["Ojo_" + lado] = (len(p), o.tris)
    ropas, base = crear_ropas(cuerpo, W, P, Z)
    m_ropa = glb.material("ropa", (0.7, 0.7, 0.7, 1), 0.9, True)
    solo_cuerpo(base)
    podar(base, 0.008)
    glb.anadir(base, m_ropa)
    resumen["ropa_base"] = (len(base.pos), base.tris)
    for i, n, capa, m in ropas:
        if m.nrm is None:
            m.calcular_normales()
        solo_cuerpo(m)
        podar(m, 0.008)
        glb.anadir(m, m_ropa)
        resumen[m.nombre] = (len(m.pos), m.tris)
    pelos = crear_pelos(cuerpo, W, P, Z)
    m_pelo = glb.material("pelo", (1, 1, 1, 1), 0.5, True)
    for i, n, m, _ in pelos:
        solo_cuerpo(m, True)
        podar(m, 0.005)
        glb.anadir(m, m_pelo)
        resumen[m.nombre] = (len(m.pos), m.tris)
    # animaciones
    anims_ok = []
    if os.path.exists(ual):
        F = Fuente(ual)
        sc = pos_h[nombres.index("pelvis")][1] / F.mundo(F.rest, ["pelvis"])["pelvis"][0][1]
        for ident, nom in ANIMS:
            t, r, tr = retargetear(F, nom, nombres, padres, pos_h)
            glb.animacion(ident, t, {k: v for k, v in r.items()}, tr * sc)
            anims_ok.append(ident)
    glb.guardar(os.path.join(salida, "humano.glb"))
    textura_ojo(os.path.join(salida, "ojo.png"))
    generar_pieles(os.path.join(salida, "pieles"))
    # variación de cada hueso (cabeza del hueso) con cada forma, para que el esqueleto siga al cuerpo
    dj = {}
    for n, d in sal.items():
        if n.startswith("x_"):
            continue
        v = {}
        for i, (hn, par, mh, gr) in enumerate(H):
            if mh is None:
                continue
            ids = jids[hn]
            v[hn] = [round(float(x), 5) for x in d[ids].mean(axis=0)]
        dj[n] = v
    cat = {"formas": [{"id": f["id"], "n": f["n"], "grupo": f["grupo"], "min": f["min"], "max": f["max"], "def": 0.0} for f in formas],
           "pieles": [{"id": a, "n": b} for a, b, _ in PIELES],
           "expresiones": [{"id": e["id"], "n": e["n"]} for e in exprs],
           "dh": {n: round(float(d[W.vi][np.argmax(P0[W.vi][:, 1]), 1]), 4) for n, d in sal.items() if not n.startswith("x_")},
           "pelos": [{"id": "", "n": "Sin pelo"}] + [{"id": i, "n": n} for i, n, _, _ in pelos],
           "ropas": [{"id": i, "n": n, "capa": c} for i, n, c, _ in ropas]
           + [{"id": "chandal", "n": "Pantalón de chándal", "capa": "abajo", "malla": "vaqueros"}],
           "animaciones": anims_ok,
           "huesos": nombres, "huesos_pos": [[round(float(x), 5) for x in p] for p in pos_h], "huesos_padre": padres,
           "dj": dj}
    json.dump(cat, open(os.path.join(salida, "catalogo.json"), "w"), ensure_ascii=False)
    print("pieza  vértices  triángulos")
    tot_t = 0
    for k, (a, b) in resumen.items():
        print(k, a, b)
    print("cuerpo tris", sum(b for k, (a, b) in resumen.items() if k.startswith("Cuerpo")))
    print("esc", W.esc, "formas", len(sal), "glb KB", os.path.getsize(os.path.join(salida, "humano.glb")) // 1024)



# =================================================================== v3: recursos reales de MakeHuman
import humano_assets as ha
from PIL import Image

ASSETS = "/home/claude/mh_assets"
SYS = "makehuman_system_assets_cc0"

# (id, nombre, capa, carpeta, corte, y_corte, textura)   corte: None | "arriba" | "abajo"
ROPAS3 = [
    ("camiseta", "Camiseta", "arriba", "shirts01_cc0/clothes/elvs_crude_t-shirt_male", None, 0, None),
    ("sudadera", "Jersey de punto", "arriba", "shirts01_cc0/clothes/toigo_fisherman_sweater", None, 0, None),
    ("blusa", "Blusa", "arriba", "shirts01_cc0/clothes/toigo_basic_tucked_t-shirt", None, 0, None),
    ("vaqueros", "Vaqueros", "abajo", SYS + "/clothes/male_casualsuit02", "abajo", 1.25, None),
    ("chandal", "Pantalón de chándal", "abajo", SYS + "/clothes/female_sportsuit01", "abajo", 1.25, None),
    ("falda", "Falda", "abajo", "dress01_cc0/clothes/toigo_halter_dress_knee_length", "abajo", 1.0, None),
    ("vestido", "Vestido", "entero", "dress01_cc0/clothes/toigo_halter_dress_knee_length", None, 0, None),
    ("zapatillas", "Zapatillas", "pies", SYS + "/clothes/shoes05", None, 0, None),
    ("zapatos", "Zapatos", "pies", SYS + "/clothes/shoes01", None, 0, None),
    ("botines", "Botines", "pies", "shoes01_cc0/clothes/toigo_ankle_boots_female", None, 0, None),
]
PELOS3 = [("corto", "Corto", "short02"), ("corto2", "Corto con tupé", "short04"), ("media", "Media melena", "bob01"),
          ("largo", "Largo", "long01"), ("coleta", "Coleta", "ponytail01"), ("afro", "Afro", "afro01")]
OJOS3 = [("marron", "Marrón", "brown"), ("verde", "Verde", "green"), ("azul", "Azul", "blue")]
CEJAS3 = [("cejas1", "Cejas finas", "eyebrow001"), ("cejas2", "Cejas medias", "eyebrow004"), ("cejas3", "Cejas pobladas", "eyebrow007")]
# piel: id -> (carpeta jóvenes/mayores mujer, hombre)
PIELES3 = [
    ("clara", "Clara", "young_caucasian_female", "young_caucasian_male"),
    ("media", "Media", "young_asian_female", "young_asian_male"),
    ("morena", "Morena", "SK1/toigo_light_skin_female_bronze", "SK2/toigo_light_skin_male_bronze"),
    ("oscura", "Oscura", "young_african_female", "young_african_male"),
    ("clara_mayor", "Clara (mayor)", "old_caucasian_female", "old_caucasian_male"),
    ("media_mayor", "Media (mayor)", "middleage_asian_female", "middleage_asian_male"),
    ("morena_mayor", "Morena (mayor)", "old_asian_female", "old_asian_male"),
    ("oscura_mayor", "Oscura (mayor)", "old_african_female", "old_african_male"),
]


def _png(carpeta):
    import glob
    fs = [f for f in glob.glob(carpeta + "/*") if f.lower().endswith((".png", ".jpg")) and not any(k in os.path.basename(f).lower() for k in ("normal", "_ao", "norm", "spec", "bump", "rough", "nor.", "_n."))]
    return fs


def textura_piel(carpeta_rel, destino, tam=1024, q=74):
    if carpeta_rel.startswith("SK1/"):
        d = os.path.join(ASSETS, "skins01_cc0/skins", carpeta_rel[4:])
    elif carpeta_rel.startswith("SK2/"):
        d = os.path.join(ASSETS, "skins02_cc0/skins", carpeta_rel[4:])
    else:
        d = os.path.join(ASSETS, SYS, "skins", carpeta_rel)
    fs = _png(d)
    fs.sort(key=lambda f: -os.path.getsize(f))
    im = Image.open(fs[0]).convert("RGB").resize((tam, tam), Image.LANCZOS)
    # Estilo (GD-12): se quita el grano de foto (poros, manchas) y queda la forma grande (labios, ojeras, rubor).
    # Una piel fotográfica sobre una malla sencilla da cara de maniquí; una piel limpia se lee como personaje.
    from PIL import ImageFilter, ImageEnhance
    suave = im.filter(ImageFilter.GaussianBlur(tam / 205.0))
    im = ImageEnhance.Color(Image.blend(im, suave, 0.72)).enhance(1.06)
    im.save(destino, quality=q)
    return fs[0]


def tex_a(ruta, destino, tam=512, gris=False, alfa=False, q=80):
    im = Image.open(ruta)
    im = im.convert("RGBA" if alfa else "RGB")
    if im.size[0] > tam:
        im = im.resize((tam, tam), Image.LANCZOS)
    if gris:
        a = np.array(im).astype(np.float32)
        lum = (0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2])
        msk = a[..., 3] > 128 if alfa else np.ones(lum.shape, bool)
        m = lum[msk].mean() if msk.any() else 128
        lum = np.clip(lum / max(m, 1) * 0.62 * 255 / 255 * 1.0, 0, 255) if False else np.clip(lum / max(m, 1) * 150, 0, 255)
        out = np.stack([lum, lum, lum] + ([a[..., 3]] if alfa else []), axis=-1).astype(np.uint8)
        im = Image.fromarray(out, "RGBA" if alfa else "RGB")
    if destino.endswith(".webp"):
        im.save(destino, quality=q, method=4)
    else:
        im.convert("RGB").save(destino, quality=q)


def pieza_desde(nombre, A, sal, dn, formas_ok, y_filtro=None, extra_off=0.0, solo_uv_de_abajo=None):
    """Malla desde un Ajuste. y_filtro: función(tris centroides y)->bool para cortar. Devuelve (Malla, vid_base_usados)."""
    vid, uv, tri = A.triangulos()
    pos = A.pos_m[vid]
    if y_filtro is not None:
        cy = pos[:, 1][tri].mean(axis=1)
        ok = y_filtro(cy)
        if solo_uv_de_abajo is not None:
            # Un «suit» lleva camiseta y pantalón en mallas sueltas dentro del mismo objeto. Cortar solo por altura deja
            # un trozo de camiseta pegado a la cintura (la franja azul sobre los vaqueros). Se quedan las piezas
            # conexas (soldando vértices por posición) que tienen alguna cara por debajo de solo_uv_de_abajo metros.
            clave = {}
            rep_v = np.empty(len(pos), np.int64)
            for i, p in enumerate(np.round(pos * 5000).astype(np.int64)):
                rep_v[i] = clave.setdefault((p[0], p[1], p[2]), i)
            padre = np.arange(len(pos))
            def raiz(x):
                while padre[x] != x:
                    padre[x] = padre[padre[x]]
                    x = padre[x]
                return x
            for a_, b_, c_ in rep_v[tri]:
                ra, rb, rc = raiz(a_), raiz(b_), raiz(c_)
                padre[rb] = ra
                padre[rc] = ra
            comp = np.array([raiz(v) for v in rep_v[tri[:, 0]]])
            buenas = set(comp[cy < solo_uv_de_abajo].tolist())
            ok = np.isin(comp, list(buenas))
        tri = tri[ok]
        usados = np.unique(tri)
        mapa = -np.ones(len(vid), np.int64)
        mapa[usados] = np.arange(len(usados))
        vid, uv, pos, tri = vid[usados], uv[usados], pos[usados], mapa[tri]
    m = Malla(nombre, pos, tri, uv)
    m.calcular_normales(soldar=vid)
    if extra_off:
        m.pos = (m.pos + m.nrm * extra_off).astype(np.float32)
    m.sk = A.pesos(dn)[vid].astype(np.float32)
    s = m.sk.sum(axis=1, keepdims=True); s[s == 0] = 1
    m.sk = m.sk / s
    for n, d in sal.items():
        if n in formas_ok:
            m.formas[n] = A.delta(d)[vid].astype(np.float32)
    return m, vid



def particionar_cuerpo(cuerpo, W, P, borrados):
    """Reparte los triángulos del cuerpo por el conjunto de prendas que los borran (delete_verts del .mhclo)."""
    vi = W.vi
    claves = list(borrados.keys())
    sig_v = np.zeros(len(vi), np.int64)
    for k, nodo in enumerate(claves):
        sig_v |= np.isin(vi, np.fromiter(borrados[nodo], int)).astype(np.int64) << k
    t = W.tri
    sig = np.bitwise_or.reduce(sig_v[t], axis=1)
    cy = P[:, 1][t].mean(axis=1)
    grupos = {}
    for sg in np.unique(sig):
        ok = sig == sg
        if sg == 0:
            grupos[("cabeza", 0)] = ok & (cy > 1.43)
            grupos[("extrem", 0)] = ok & (cy <= 1.43)
        else:
            grupos[("g", int(sg))] = ok
    partes, ocultas = {}, {}
    for (tipo, sg), ok in grupos.items():
        if not ok.any():
            continue
        tt = W.tri[ok]
        us = np.unique(tt)
        mapa = -np.ones(len(P), np.int64)
        mapa[us] = np.arange(len(us))
        nom = {"cabeza": "Cuerpo", "extrem": "Cuerpo_extrem"}.get(tipo, "Cuerpo_g%d" % sg)
        m = Malla(nom, cuerpo.pos[us], mapa[tt], cuerpo.uv[us])
        m.nrm = cuerpo.nrm[us]; m.col = cuerpo.col[us]; m.sk = cuerpo.sk[us]
        m.formas = {n: d[us] for n, d in cuerpo.formas.items()}
        partes[nom] = m
        if tipo == "g":
            ocultas[nom] = [claves[k] for k in range(len(claves)) if (sg >> k) & 1]
    return partes, ocultas


def main3():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    raiz = sys.argv[1]
    salida = "godot/arte/humano"
    if "--salida" in sys.argv:
        salida = sys.argv[sys.argv.index("--salida") + 1]
    global ASSETS
    if "--assets" in sys.argv:
        ASSETS = sys.argv[sys.argv.index("--assets") + 1]
    ual = "/tmp/gd10a/ual/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb"
    if "--ual" in sys.argv:
        ual = sys.argv[sys.argv.index("--ual") + 1]
    solo = None
    if "--solo" in sys.argv:
        solo = sys.argv[sys.argv.index("--solo") + 1].split(",")
    tex_dir = os.path.join(salida, "tex")
    os.makedirs(tex_dir, exist_ok=True)
    D = Datos(raiz)
    W = Mundo(D)
    formas, exprs, sal = calcular_formas(D, W)
    cuerpo, P0 = ensamblar(D, W, formas, exprs, sal, None)
    H = definir_esqueleto()
    nombres = [h[0] for h in H]
    padres = [h[1] for h in H]
    pos_h, dense, tot, jids = calcular_esqueleto(D, W, H)
    dn = dense / np.maximum(tot, 1e-9)[:, None]
    cuerpo.sk = dn[W.vi].astype(np.float32)
    glb = GLB()
    glb.esqueleto(nombres, padres, pos_h)
    m_piel = glb.material("piel", (1, 1, 1, 1), 0.7)
    m_ropa = glb.material("ropa", (0.7, 0.7, 0.7, 1), 0.9, True)
    m_ojo = glb.material("ojo", (1, 1, 1, 1), 0.25)
    m_pelo = glb.material("pelo", (1, 1, 1, 1), 0.5, True)
    Z = clasificar(D, W, P0)
    P = cuerpo.pos
    Pbase = W.a_metros(W.neutro_dm)
    todas = [f["id"] + sg for f in formas for sg in ("+", "-")] + ["x_" + e["id"] for e in exprs]
    cuerpo_f = [n for n in todas if not n.startswith("x_") and not n.startswith(FORMAS_CARA)]
    resumen = {}
    tex = {}
    borrados = {}
    items = []          # (nombre, malla, material)
    cat_ropas = []
    # ---- ropa real
    srcs_tex = {}
    for (rid, nom, capa, carpeta, corte, yc, _) in ROPAS3:
        if solo and rid not in solo:
            continue
        import glob
        f = glob.glob(os.path.join(ASSETS, carpeta, "*.mhclo"))[0]
        A = ha.Ajuste(f, W.neutro_dm, W.a_metros)
        flt = None
        if corte == "arriba":
            flt = lambda cy, yc=yc: cy >= yc
        elif corte == "abajo":
            flt = lambda cy, yc=yc: cy < yc
        m, vid = pieza_desde("ropa_" + rid, A, sal, dn, cuerpo_f, flt, {"sudadera": 0.009, "blusa": 0.004}.get(rid, 0.0),
                             solo_uv_de_abajo=0.8 if rid in ("vaqueros", "chandal") else None)
        if rid in ("vaqueros", "chandal"):
            yc = float(m.pos[:, 1].max())   # la cintura de verdad de la prenda
            print("cintura", rid, round(yc, 3))
        if corte == "abajo":
            # la cintura se mete 2 cm hacia dentro: queda debajo del bajo de la camiseta y no asoma en dientes de sierra
            w = suave(m.pos[:, 1], yc - 0.09, yc - 0.01)[:, None]
            m.pos = (m.pos - m.nrm * {"vaqueros": 0.05, "chandal": 0.02}.get(rid, 0.022) * w).astype(np.float32)
        if rid in ("falda", "vestido"):
            # una falda no se parte en dos piernas al sentarse: el 65 % del peso de las piernas pasa a la pelvis
            piernas = [nombres.index(b) for b in ("thigh_l", "calf_l", "foot_l", "ball_l", "thigh_r", "calf_r", "foot_r", "ball_r")]
            L = m.sk[:, piernas].sum(axis=1)
            m.sk[:, piernas] *= 0.35
            m.sk[:, nombres.index("pelvis")] += 0.65 * L
        # recorte de la lista de borrado por altura cuando la prenda se parte
        bor = set(A.c["borrar"])
        if corte == "arriba":
            bor = {v for v in bor if Pbase[v, 1] >= yc - 0.04}
        elif corte == "abajo":
            bor = {v for v in bor if Pbase[v, 1] < yc + 0.02}
        borrados["ropa_" + rid] = bor
        podar(m, {"vestido": 0.02, "falda": 0.02, "sudadera": 0.012}.get(rid, 0.015))
        items.append(("ropa_" + rid, m, m_ropa))
        cat_ropas.append({"id": rid, "n": nom, "capa": capa})
        dt = A.mat.get("diffuseTexture")
        if dt:
            src = os.path.join(A.carpeta, dt)
            dst = "tex/ropa_%s.jpg" % rid
            tex_a(src, os.path.join(salida, dst), 512)
            tex["ropa_" + rid] = {"t": dst, "alfa": False, "doble": A.mat.get("backfaceCull", "True") == "False"}
        resumen["ropa_" + rid] = (len(m.pos), m.tris)
        if os.environ.get("DBGY"): print(rid, "y", m.pos[:,1].min(), m.pos[:,1].max())
    # ---- pelos
    cat_pelos = [{"id": "", "n": "Sin pelo"}]
    for (pid, nom, carp) in PELOS3:
        if solo and "pelo" not in solo:
            continue
        f = os.path.join(ASSETS, SYS, "hair", carp, carp + ".mhclo")
        A = ha.Ajuste(f, W.neutro_dm, W.a_metros)
        m, vid = pieza_desde("pelo_" + pid, A, sal, dn, [n for n in todas if not n.startswith("x_")])
        podar(m, 0.012)
        items.append(("pelo_" + pid, m, m_pelo))
        cat_pelos.append({"id": pid, "n": nom})
        dt = A.mat.get("diffuseTexture")
        dst = "tex/pelo_%s.webp" % pid
        tex_a(os.path.join(A.carpeta, dt), os.path.join(salida, dst), 1024, gris=True, alfa=True, q=85)
        tex["pelo_" + pid] = {"t": dst, "alfa": True, "doble": True}
        resumen["pelo_" + pid] = (len(m.pos), m.tris)
    # ---- cara: ojos, cejas, pestañas, dientes
    if not solo or "cara" in solo:
        A = ha.Ajuste(os.path.join(ASSETS, SYS, "eyes/low-poly/low-poly.mhclo"), W.neutro_dm, W.a_metros)
        m, vid = pieza_desde("Ojos", A, sal, dn, todas)
        podar(m, 0.002)
        items.append(("Ojos", m, m_ojo))
        if os.environ.get("DBGE"):
            for gg in (0, 0.5, 1.0):
                pe = m.pos + gg * m.formas.get("genero+", 0)
                ps = cuerpo.pos + gg * cuerpo.formas.get("genero+", 0)
                c = pe[pe[:, 0] > 0].mean(axis=0)
                sel = (np.abs(ps[:, 1] - c[1]) < 0.012) & (np.abs(np.abs(ps[:, 0]) - abs(c[0])) < 0.012)
                print("DBGE g", gg, "ojo c", c, "zmin ojo", pe[:, 2].min(), "zmax ojo", pe[:, 2].max(), "piel z min", ps[sel, 2].min(), "n", sel.sum(), "esfera r", np.abs(pe - c).max(axis=0))
        resumen["Ojos"] = (len(m.pos), m.tris)
        cat_ojos = []
        for oid, nom, col in OJOS3:
            dst = "tex/ojo_%s.jpg" % oid
            tex_a(os.path.join(ASSETS, SYS, "eyes/materials/%s_eye.png" % col), os.path.join(salida, dst), 256, q=90)
            if oid == "marron":
                # el iris «brown» de MakeHuman es rojo oscuro: se lleva a marrón (tono +18°, menos saturación)
                from PIL import Image
                im = Image.open(os.path.join(salida, dst)).convert("HSV")
                h_, s_, v_ = [np.asarray(c).astype(np.float32) for c in im.split()]
                iris = s_ > 90
                h_[iris] = np.clip(h_[iris] + 13, 0, 255)
                s_[iris] = s_[iris] * 0.78
                v_[iris] = np.clip(v_[iris] * 1.12, 0, 255)
                im2 = Image.merge("HSV", [Image.fromarray(c.astype(np.uint8)) for c in (h_, s_, v_)]).convert("RGB")
                im2.save(os.path.join(salida, dst), quality=90)
            cat_ojos.append({"id": oid, "n": nom, "t": dst})
        cat_cejas = []
        for cid, nom, carp in CEJAS3:
            A = ha.Ajuste(os.path.join(ASSETS, SYS, "eyebrows", carp, carp + ".mhclo"), W.neutro_dm, W.a_metros)
            m, vid = pieza_desde("cejas_" + cid, A, sal, dn, todas)
            podar(m, 0.002)
            items.append(("cejas_" + cid, m, m_pelo))
            dst = "tex/cejas_%s.webp" % cid
            tex_a(os.path.join(A.carpeta, A.mat["diffuseTexture"]), os.path.join(salida, dst), 256, gris=True, alfa=True)
            tex["cejas_" + cid] = {"t": dst, "alfa": True, "doble": True}
            cat_cejas.append({"id": cid, "n": nom})
            resumen["cejas_" + cid] = (len(m.pos), m.tris)
        A = ha.Ajuste(os.path.join(ASSETS, SYS, "eyelashes/eyelashes02/eyelashes02.mhclo"), W.neutro_dm, W.a_metros)
        m, vid = pieza_desde("pestanas", A, sal, dn, todas)
        podar(m, 0.002)
        items.append(("pestanas", m, m_pelo))
        dst = "tex/pestanas.webp"
        tex_a(os.path.join(A.carpeta, A.mat["diffuseTexture"]), os.path.join(salida, dst), 256, gris=True, alfa=True)
        tex["pestanas"] = {"t": dst, "alfa": True, "doble": True}
        resumen["pestanas"] = (len(m.pos), m.tris)
        A = ha.Ajuste(os.path.join(ASSETS, SYS, "teeth/teeth_base/teeth_base.mhclo"), W.neutro_dm, W.a_metros)
        m, vid = pieza_desde("dientes", A, sal, dn, todas)
        podar(m, 0.004)
        items.append(("dientes", m, m_ojo))
        dst = "tex/dientes.jpg"
        tex_a(os.path.join(A.carpeta, A.mat["diffuseTexture"]), os.path.join(salida, dst), 256)
        tex["dientes"] = {"t": dst, "alfa": False, "doble": False}
        resumen["dientes"] = (len(m.pos), m.tris)
    else:
        cat_ojos, cat_cejas = [], []
    # ---- pieles
    cat_pieles = []
    for pid, nom, fh, fm in PIELES3:
        textura_piel(fh, os.path.join(salida, "tex", "piel_%s_f.jpg" % pid))
        textura_piel(fm, os.path.join(salida, "tex", "piel_%s_m.jpg" % pid))
        cat_pieles.append({"id": pid, "n": nom})
    # ---- cuerpo en partes ocultables
    partes, ocultas = particionar_cuerpo(cuerpo, W, P, borrados)
    for k, m in partes.items():
        if k != "Cuerpo":
            solo_cuerpo(m)
        podar(m, 0.004)
        glb.anadir(m, m_piel)
        resumen[m.nombre] = (len(m.pos), m.tris)
    # ---- ropa base (ropa interior propia, debajo de todo)
    ropas_old, base = crear_ropas(cuerpo, W, P, Z)
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    ax = np.abs(x)
    brazo = Z["brazo1"] | Z["brazo2"] | Z["antebrazo"] | Z["mano"]
    cabeza = Z["cabeza"]
    cc = 1.425 - 0.04 * (1 - suave(z, -0.08, -0.01))
    escote = (1.405 - 0.085 * np.clip(1 - (ax / 0.085) ** 2, 0, 1) * (1 - suave(z, -0.06, -0.01))) - y
    top = np.where(brazo | cabeza, -1.0, np.minimum(np.minimum(y - 1.05, 0.142 - ax), escote))
    briefs = np.where(brazo | cabeza, -1.0, np.minimum(0.95 - y, y - 0.64))
    b_top = prenda("ropa_base_top", cuerpo, W, top, 0.0035, alisar=True)
    b_baj = prenda("ropa_base_baj", cuerpo, W, briefs, 0.0035)
    for b in (b_top, b_baj):
        solo_cuerpo(b); podar(b, 0.008)
        glb.anadir(b, m_ropa)
        resumen[b.nombre] = (len(b.pos), b.tris)
    for nodo, m, mat in items:
        glb.anadir(m, mat)
    # ---- animaciones
    anims_ok = []
    if os.path.exists(ual):
        F = Fuente(ual)
        sc = pos_h[nombres.index("pelvis")][1] / F.mundo(F.rest, ["pelvis"])["pelvis"][0][1]
        for ident, nom in ANIMS:
            t, r, tr = retargetear(F, nom, nombres, padres, pos_h)
            glb.animacion(ident, t, r, tr * sc)
            anims_ok.append(ident)
    glb.guardar(os.path.join(salida, "humano.glb"))
    dj = {}
    for n, d in sal.items():
        if n.startswith("x_"):
            continue
        dj[n] = {hn: [round(float(x), 5) for x in d[jids[hn]].mean(axis=0)] for (hn, par, mh, gr) in H if mh is not None}
    cat = {"formas": [{"id": f["id"], "n": f["n"], "grupo": f["grupo"], "min": f["min"], "max": f["max"], "def": 0.0} for f in formas],
           "pieles": cat_pieles,
           "expresiones": [{"id": e["id"], "n": e["n"]} for e in exprs],
           "dh": {n: round(float(d[W.vi][np.argmax(P0[W.vi][:, 1]), 1]), 4) for n, d in sal.items() if not n.startswith("x_")},
           "pelos": cat_pelos, "ropas": cat_ropas, "ojos": cat_ojos, "cejas": cat_cejas,
           "tex": tex, "ocultas": ocultas,
           "animaciones": anims_ok,
           "huesos": nombres, "huesos_pos": [[round(float(x), 5) for x in p] for p in pos_h], "huesos_padre": padres,
           "dj": dj}
    json.dump(cat, open(os.path.join(salida, "catalogo.json"), "w"), ensure_ascii=False)
    if os.environ.get("DBGF"):
        tot = 0
        for it in items + [(0, m, 0) for m in partes.values()] + [(0, b_top, 0), (0, b_baj, 0)]:
            m = it[1]
            c = len(m.pos) * len(m.formas)
            tot += c
            print("FORMAS", m.nombre, len(m.pos), len(m.formas), c, sorted(m.formas) if m.nombre in ("Ojos","pestanas","dientes") else "")
        print("TOTAL vert*formas", tot)
    print("pieza vértices triángulos")
    for k, (a, b) in resumen.items():
        print(k, a, b)
    print("cuerpo tris", sum(b for k, (a, b) in resumen.items() if k.startswith("Cuerpo")))
    print("glb KB", os.path.getsize(os.path.join(salida, "humano.glb")) // 1024, "partes", len(partes))


if __name__ == "__main__":
    main3()
