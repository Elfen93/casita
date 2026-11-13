class_name Grafo
# Camino por las calles de un barrio. Port de cdGrafo/cdCamino de mods/barrio.js:
# calles rectas (horizontales o verticales), nodos en extremos, cruces y puertas.
var nodos := {}   # clave -> Vector2
var ady := {}     # clave -> Array[[clave, longitud]]
var aristas := [] # [ka, kb, indice_calle]
var calles: Array

static func clave(p: Vector2) -> String:
	return "%s,%s" % [snapped(p.x, 0.1), snapped(p.y, 0.1)]

static func es_hor(c) -> bool:
	return c["a"][1] == c["b"][1]

static func en_calle(c, p: Vector2) -> bool:
	var e := 0.000001
	if es_hor(c):
		return absf(p.y - c["a"][1]) < e and c["a"][0] - e <= p.x and p.x <= c["b"][0] + e
	return absf(p.x - c["a"][0]) < e and c["a"][1] - e <= p.y and p.y <= c["b"][1] + e

func _init(barrio: Dictionary) -> void:
	calles = barrio["calles"]
	var puntos: Array = []
	for c in calles:
		puntos.append(Vector2(c["a"][0], c["a"][1]))
		puntos.append(Vector2(c["b"][0], c["b"][1]))
	for i in calles.size():
		for j in range(i + 1, calles.size()):
			var c = calles[i]
			var e = calles[j]
			if es_hor(c) == es_hor(e):
				continue
			var h = c if es_hor(c) else e
			var v = e if es_hor(c) else c
			var p := Vector2(v["a"][0], h["a"][1])
			if en_calle(h, p) and en_calle(v, p):
				puntos.append(p)
	for q in barrio["puertas"].values():
		puntos.append(Vector2(q[0], q[1]))
	for p in puntos:
		var k := clave(p)
		if not nodos.has(k):
			nodos[k] = Vector2(float(k.split(",")[0]), float(k.split(",")[1]))
			ady[k] = []
	for ci in calles.size():
		var c = calles[ci]
		var ps: Array = []
		for p in nodos.values():
			if en_calle(c, p):
				ps.append(p)
		ps.sort_custom(func(a, b): return a.x + a.y < b.x + b.y)
		for i in range(1, ps.size()):
			var a: Vector2 = ps[i - 1]
			var b: Vector2 = ps[i]
			var l := absf(a.x - b.x) + absf(a.y - b.y)
			ady[clave(a)].append([clave(b), l])
			ady[clave(b)].append([clave(a), l])
			aristas.append([clave(a), clave(b), ci])

# Punto más cercano sobre cualquier calle (para tocar la calle).
func ajustar(p: Vector2) -> Dictionary:
	var mejor := {"d": 1e18}
	for ar in aristas:
		var a: Vector2 = nodos[ar[0]]
		var b: Vector2 = nodos[ar[1]]
		var q := Geometry2D.get_closest_point_to_segment(p, a, b)
		var d := q.distance_to(p)
		if d < mejor["d"]:
			mejor = {"d": d, "p": q, "ka": ar[0], "kb": ar[1]}
	return mejor

# Camino entre dos puntos cualesquiera de las calles: lista de Vector2 (esquinas).
func camino(desde: Vector2, hasta: Vector2) -> Array:
	var s := ajustar(desde)
	var t := ajustar(hasta)
	var g := {}
	for k in ady:
		g[k] = ady[k].duplicate()
	var pos := nodos.duplicate()
	pos["S"] = s["p"]
	pos["T"] = t["p"]
	g["S"] = []
	g["T"] = []
	_unir(g, pos, "S", s)
	_unir(g, pos, "T", t)
	if s["ka"] == t["ka"] and s["kb"] == t["kb"]:
		var l: float = (s["p"] - t["p"]).length()
		g["S"].append(["T", l])
		g["T"].append(["S", l])
	var dist := {"S": 0.0}
	var prev := {}
	var abiertos := ["S"]
	while abiertos.size() > 0:
		var u: String = abiertos[0]
		for k in abiertos:
			if dist[k] < dist[u]:
				u = k
		abiertos.erase(u)
		if u == "T":
			break
		for e in g[u]:
			var nd: float = dist[u] + e[1]
			if nd < dist.get(e[0], 1e18) - 1e-9:
				dist[e[0]] = nd
				prev[e[0]] = u
				if not abiertos.has(e[0]):
					abiertos.append(e[0])
	if not dist.has("T"):
		return []
	var ks := ["T"]
	while ks[0] != "S":
		ks.push_front(prev[ks[0]])
	var pts: Array = []
	for k in ks:
		var p: Vector2 = pos[k]
		if pts.size() > 0 and pts[-1].distance_to(p) < 0.001:
			continue
		if pts.size() > 1 and ((is_equal_approx(pts[-2].x, pts[-1].x) and is_equal_approx(pts[-1].x, p.x)) or (is_equal_approx(pts[-2].y, pts[-1].y) and is_equal_approx(pts[-1].y, p.y))):
			pts[-1] = p
		else:
			pts.append(p)
	return pts

func _unir(g: Dictionary, pos: Dictionary, v: String, aj: Dictionary) -> void:
	for kk in [aj["ka"], aj["kb"]]:
		var l: float = (pos[v] - nodos[kk]).length()
		g[v].append([kk, l])
		g[kk].append([v, l])
