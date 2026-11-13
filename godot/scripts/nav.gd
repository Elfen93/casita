class_name Nav
# Rejilla de caminos de 1 m (Escala.CELDA) con AStarGrid2D. Marca sólidos (edificios, muebles, vallas) y da coste a cada suelo.
# Suavizado: tirón de cuerda con comprobación de línea libre y de coste (no atraviesa la calzada si da un rodeo por el paso de cebra).
const T_HIERBA := 0
const T_ACERA := 1
const T_CALZADA := 2
const T_CEBRA := 3
const T_PARQUE := 4
const T_CAMINO := 5
const T_SOLAR := 6
const T_SUELO := 7
const COSTE := {0: 1.0, 1: 1.0, 2: 3.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0}
var grid: AStarGrid2D
var tipos: PackedByteArray
var ancho: int
var alto: int
var org: Vector2

func _init() -> void:
	org = Escala.MUNDO.position
	ancho = int(Escala.MUNDO.size.x / Escala.CELDA)
	alto = int(Escala.MUNDO.size.y / Escala.CELDA)
	tipos = PackedByteArray()
	tipos.resize(ancho * alto)
	grid = AStarGrid2D.new()
	grid.region = Rect2i(0, 0, ancho, alto)
	grid.cell_size = Vector2.ONE
	grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	grid.default_compute_heuristic = AStarGrid2D.HEURISTIC_OCTILE
	grid.default_estimate_heuristic = AStarGrid2D.HEURISTIC_OCTILE
	grid.update()

func celda(p: Vector2) -> Vector2i:
	return Vector2i(clampi(int(floor((p.x - org.x) / Escala.CELDA)), 0, ancho - 1), clampi(int(floor((p.y - org.y) / Escala.CELDA)), 0, alto - 1))

func centro(c: Vector2i) -> Vector2:
	return org + (Vector2(c) + Vector2(0.5, 0.5)) * Escala.CELDA

func _rango(r: Rect2) -> Rect2i:
	var a := celda(r.position + Vector2(0.001, 0.001))
	var b := celda(r.end - Vector2(0.001, 0.001))
	return Rect2i(a, b - a + Vector2i.ONE)

func tipo_rect(r: Rect2, t: int) -> void:
	var q := _rango(r)
	for i in range(q.position.y, q.end.y):
		for j in range(q.position.x, q.end.x):
			tipos[i * ancho + j] = t
			grid.set_point_weight_scale(Vector2i(j, i), COSTE[t])

func tipo_en(p: Vector2) -> int:
	var c := celda(p)
	return tipos[c.y * ancho + c.x]

# recalcula solo las celdas del rectángulo
func solido_rect(r: Rect2, s: bool) -> void:
	var q := _rango(r)
	for i in range(q.position.y, q.end.y):
		for j in range(q.position.x, q.end.x):
			grid.set_point_solid(Vector2i(j, i), s)

func solido(p: Vector2) -> bool:
	return grid.is_point_solid(celda(p))

func libre_cerca(p: Vector2) -> Vector2i:
	var c := celda(p)
	if not grid.is_point_solid(c):
		return c
	# la celda libre más cercana al punto pedido (no la primera del anillo): al señalar un mueble se llega por el lado señalado
	for r in range(1, 14):
		var mejor := c
		var md := 1e18
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var q := c + Vector2i(dx, dy)
				if q.x >= 0 and q.y >= 0 and q.x < ancho and q.y < alto and not grid.is_point_solid(q):
					var d := centro(q).distance_squared_to(p)
					if d < md:
						md = d
						mejor = q
		if md < 1e17:
			return mejor
	return c

func _peso(p: Vector2) -> float:
	return COSTE[tipos[celda(p).y * ancho + celda(p).x]]

func _linea_libre(a: Vector2, b: Vector2) -> bool:
	var d := b - a
	var l := d.length()
	if l < 0.01:
		return true
	var perp := Vector2(-d.y, d.x) / l * 0.2
	var n := int(l / 0.25) + 1
	for i in n + 1:
		var p := a + d * (float(i) / float(n))
		if solido(p) or solido(p + perp) or solido(p - perp):
			return false
	return true

func _coste_linea(a: Vector2, b: Vector2) -> float:
	var l := a.distance_to(b)
	var n := int(l / 1.0) + 1
	var s := 0.0
	for i in n:
		s += _peso(a.lerp(b, (float(i) + 0.5) / float(n)))
	return s * l / float(n)

# camino más corto (con costes) entre dos puntos del mundo, en metros; vacío si no hay
func camino(desde: Vector2, hasta: Vector2) -> Array:
	var a := libre_cerca(desde)
	var b := libre_cerca(hasta)
	var ids: Array = grid.get_id_path(a, b)
	if ids.is_empty():
		return []
	var pts: Array = []
	for c in ids:
		pts.append(centro(c))
	# el último punto es el destino pedido (si es transitable)
	var fin: Vector2 = hasta if not solido(hasta) else pts[-1]
	pts[0] = desde if not solido(desde) else pts[0]
	pts[-1] = fin
	# tirón de cuerda
	var res: Array = [pts[0]]
	var i := 0
	while i < pts.size() - 1:
		var j := i + 1
		var orig := 0.0
		var k := i + 1
		orig = _coste_linea(pts[i], pts[i + 1])
		while k + 1 < pts.size() and k - i < 80:
			var nuevo := _coste_linea(pts[i], pts[k + 1])
			orig += _coste_linea(pts[k], pts[k + 1])
			if nuevo <= orig * 1.12 + 0.01 and _linea_libre(pts[i], pts[k + 1]):
				k += 1
				j = k
			else:
				break
		res.append(pts[j])
		i = j
	return res
