"""Lectura de recursos MakeHuman (.mhclo, .obj, .mhmat) y ajuste al cuerpo neutro de generar_humano.py.

Un .mhclo ata cada vértice de la prenda a 3 vértices del cuerpo (pesos) más un desplazamiento escalado por
el tamaño del cuerpo. Como es lineal, el desplazamiento de la prenda con cada forma es la misma combinación
de los desplazamientos del cuerpo (se calcula en `Ajuste.delta`).
"""
import os
import numpy as np


def leer_mhclo(ruta):
    d = {"verts": [], "escala": {}, "borrar": set(), "obj": None, "material": None, "nombre": os.path.basename(ruta)}
    modo = None
    lic = ""
    for l in open(ruta, encoding="utf-8", errors="replace"):
        s = l.strip()
        if s.startswith("#"):
            lic += s + "\n"
            continue
        if not s:
            continue
        p = s.split()
        if p[0] == "verts":
            modo = "v"; continue
        if p[0] == "delete_verts":
            modo = "d"; continue
        if p[0] in ("x_scale", "y_scale", "z_scale"):
            d["escala"][p[0][0]] = (int(p[1]), int(p[2]), float(p[3])); continue
        if p[0] == "obj_file":
            d["obj"] = p[1]; continue
        if p[0] == "material":
            d["material"] = p[1]; continue
        if modo == "v" and len(p) >= 9:
            try:
                d["verts"].append((int(p[0]), int(p[1]), int(p[2]), float(p[3]), float(p[4]), float(p[5]),
                                   float(p[6]), float(p[7]), float(p[8])))
                continue
            except ValueError:
                pass
        if modo == "v":
            if len(p) >= 2 and p[0] in ("material", "vertexboneweights_file", "z_depth", "max_pole", "obj_file", "name", "tag", "license", "author", "description"):
                if p[0] == "material":
                    d["material"] = p[1]
                continue
            if len(p) == 1 and p[0].isdigit():       # vértice atado 1:1 a un vértice del cuerpo
                i = int(p[0])
                d["verts"].append((i, i, i, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0))
                continue
            if len(p) in (2, 3) and p[0][0].isdigit():
                continue
        if modo == "d":
            # "a - b c d - e ..."
            t = s.replace(" - ", "-").split()
            for x in t:
                if "-" in x[1:]:
                    a, b = x.split("-")
                    d["borrar"].update(range(int(a), int(b) + 1))
                else:
                    try:
                        d["borrar"].add(int(x))
                    except ValueError:
                        pass
            continue
        if modo not in ("v",):
            modo = None
    d["licencia"] = lic
    return d


def leer_obj(ruta):
    v, vt, caras = [], [], []
    for l in open(ruta, encoding="utf-8", errors="replace"):
        p = l.split()
        if not p:
            continue
        if p[0] == "v":
            v.append([float(x) for x in p[1:4]])
        elif p[0] == "vt":
            vt.append([float(p[1]), float(p[2])])
        elif p[0] == "f":
            caras.append([tuple(int(a) - 1 if a else -1 for a in (t.split("/") + ["", ""])[:2]) for t in p[1:]])
    return np.array(v), np.array(vt) if vt else np.zeros((1, 2)), caras


def leer_mhmat(ruta):
    d = {}
    for l in open(ruta, encoding="utf-8", errors="replace"):
        s = l.strip()
        if s.startswith("#") or s.startswith("//") or not s:
            continue
        p = s.split(None, 1)
        if len(p) == 2:
            d[p[0]] = p[1].strip()
    return d


class Ajuste:
    """Prenda/pelo/ojos ajustados al cuerpo neutro. base_dm: (N,3) neutro en dm; sal: dict forma -> (N,3) m;
    dn: pesos densos de hueso (N,J); a_metros: función dm->m con el giro de ejes."""
    def __init__(self, ruta_mhclo, base_dm, a_metros):
        self.ruta = ruta_mhclo
        self.c = leer_mhclo(ruta_mhclo)
        carpeta = os.path.dirname(ruta_mhclo)
        self.carpeta = carpeta
        v = np.array([x for x in self.c["verts"]])
        self.i = v[:, 0:3].astype(int)
        self.w = v[:, 3:6]
        off = v[:, 6:9].copy()
        for k, ax in (("x", 0), ("y", 1), ("z", 2)):
            if k in self.c["escala"]:
                a, b, val = self.c["escala"][k]
                sc = abs(base_dm[a][ax] - base_dm[b][ax]) / val
                off[:, ax] *= sc
        p = np.einsum("nk,nkc->nc", self.w, base_dm[self.i]) + off
        self.pos_m = a_metros(p)
        self.obj_v, self.obj_vt, self.obj_f = leer_obj(os.path.join(carpeta, self.c["obj"]))
        mat = self.c["material"]
        self.mat = leer_mhmat(os.path.join(carpeta, mat)) if mat and os.path.exists(os.path.join(carpeta, mat)) else {}

    def delta(self, sal_n):
        """Desplazamiento (n,3) de cada vértice de la prenda para una forma (array denso del cuerpo)."""
        return np.einsum("nk,nkc->nc", self.w, sal_n[self.i])

    def pesos(self, dn):
        return np.einsum("nk,nkj->nj", self.w, dn[self.i])

    def triangulos(self):
        """Pares (v,vt) únicos -> índices; devuelve (vid_prenda, uv, tris)."""
        pares, vid, uv, tri = {}, [], [], []
        for f in self.obj_f:
            ids = []
            for (v, t) in f:
                k = (v, t)
                if k not in pares:
                    pares[k] = len(vid)
                    vid.append(v)
                    uv.append(self.obj_vt[t] if t >= 0 else (0, 0))
                ids.append(pares[k])
            for a in range(1, len(ids) - 1):
                tri.append((ids[0], ids[a], ids[a + 1]))
        uv = np.array(uv)
        uv[:, 1] = 1 - uv[:, 1]
        return np.array(vid), uv, np.array(tri, np.uint32)
