class_name Interior
extends RefCounted
# Un interior con paredes, suelo, techo y muebles, construido desde data/interiores.json -> interiores[id].
# Corte tipo casa de muñecas: al estar dentro se oculta el techo y se aplastan las paredes de delante (sur y oeste).
var id := ""
var def: Dictionary = {}
var rect := Rect2()          # suelo útil, en metros del mundo
var puerta := Vector2.ZERO   # centro de la puerta, sobre la línea de la fachada
var raiz: Node3D
var techo: Node3D
var frente: Node3D
var objetos: Array = []
var por_id := {}
var alto := 3.0
var cortado := false

static func _caja(padre: Node3D, c: Vector3, s: Vector3, col: Color) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = s
	mi.mesh = bm
	var m := StandardMaterial3D.new()
	m.albedo_color = col
	m.roughness = 0.9
	mi.material_override = m
	mi.position = c
	padre.add_child(mi)
	return mi

static func construir(jg, id_: String, def_: Dictionary, tipos: Dictionary, parcela: Rect2) -> Interior:
	var it := Interior.new()
	it.id = id_
	it.def = def_
	var w := float(def_["tam"][0])
	var d := float(def_["tam"][1])
	it.alto = float(def_.get("alto", 3.0))
	var dx := roundf(parcela.get_center().x)
	var fz := roundf(parcela.end.y)          # fachada: la parte de la parcela junto a la calle
	it.rect = Rect2(dx - w * 0.5, fz - d, w, d)
	it.puerta = Vector2(dx, fz)
	var r := it.rect
	var h := it.alto
	var pared := Datos.color(def_.get("pared", "#d9a066"))
	var suelo := Datos.color(def_.get("suelo", "#b58a5a"))
	var raiz_ := Node3D.new()
	it.raiz = raiz_
	jg.add_child(raiz_)
	_caja(raiz_, Vector3(r.get_center().x, 0.05, r.get_center().y), Vector3(w, 0.1, d), suelo)
	var t := 0.3
	var nav: Nav = jg.nav
	nav.tipo_rect(r, Nav.T_SUELO)
	# norte y este (siempre altas)
	_caja(raiz_, Vector3(r.get_center().x, h * 0.5, r.position.y - t * 0.5), Vector3(w + 2 * t, h, t), pared)
	_caja(raiz_, Vector3(r.end.x + t * 0.5, h * 0.5, r.get_center().y), Vector3(t, h, d), pared)
	nav.solido_rect(Rect2(r.position.x - t, r.position.y - t, w + 2 * t, t), true)
	nav.solido_rect(Rect2(r.end.x, r.position.y, t, d), true)
	# sur y oeste (las de delante: se aplastan al entrar)
	var fr := Node3D.new()
	raiz_.add_child(fr)
	it.frente = fr
	_caja(fr, Vector3(r.position.x - t * 0.5, h * 0.5, r.get_center().y), Vector3(t, h, d), pared)
	nav.solido_rect(Rect2(r.position.x - t, r.position.y, t, d), true)
	var izq := (dx - 1.0) - (r.position.x - t)
	var der := (r.end.x + t) - (dx + 1.0)
	_caja(fr, Vector3(r.position.x - t + izq * 0.5, h * 0.5, fz + t * 0.5), Vector3(izq, h, t), pared)
	_caja(fr, Vector3(dx + 1.0 + der * 0.5, h * 0.5, fz + t * 0.5), Vector3(der, h, t), pared)
	_caja(fr, Vector3(dx, h - 0.4, fz + t * 0.5), Vector3(2.0, 0.8, t), pared.darkened(0.15))
	nav.solido_rect(Rect2(r.position.x - t, fz, izq, t), true)
	nav.solido_rect(Rect2(dx + 1.0, fz, der, t), true)
	_caja(raiz_, Vector3(dx, 1.05, fz + t * 0.5), Vector3(1.8, 2.1, 0.06), Color(0.28, 0.2, 0.15)).visible = false
	# techo
	it.techo = Node3D.new()
	raiz_.add_child(it.techo)
	_caja(it.techo, Vector3(r.get_center().x, h + 0.15, r.get_center().y), Vector3(w + 2 * t + 0.4, 0.3, d + 2 * t + 0.4), pared.darkened(0.3))
	# muebles
	for m in def_["muebles"]:
		it.añadir_mueble(jg, m, tipos)
	return it

func añadir_mueble(jg, m: Dictionary, tipos: Dictionary) -> void:
	var td: Dictionary = tipos[m["tipo"]]
	var o := Objeto.new()
	o.id = m["id"]
	o.tipo = m["tipo"]
	o.def = td
	o.interior = id
	o.giro = float(m.get("giro", 0))
	o.pos = Vector2(puerta.x + float(m["pos"][0]), puerta.y - float(m["pos"][1]))
	o.huella = Vector2(float(td["huella"][0]), float(td["huella"][1]))
	var n3 := Node3D.new()
	n3.position = Vector3(o.pos.x, 0, o.pos.y)
	n3.rotation.y = deg_to_rad(o.giro)
	raiz.add_child(n3)
	o.nodo = n3
	var ymax := 0.5
	for p in td["partes"]:
		var s: Array = p["s"]
		var c: Array = p["p"]
		var col := Datos.color(p["c"])
		if p["t"] == "cil":
			var mi := MeshInstance3D.new()
			var cm := CylinderMesh.new()
			cm.top_radius = float(s[0]) * 0.5
			cm.bottom_radius = float(s[0]) * 0.5
			cm.height = float(s[1])
			cm.radial_segments = 10
			cm.rings = 1
			mi.mesh = cm
			var mt := StandardMaterial3D.new()
			mt.albedo_color = col
			mi.material_override = mt
			mi.position = Vector3(c[0], c[1], c[2])
			n3.add_child(mi)
		else:
			_caja(n3, Vector3(c[0], c[1], c[2]), Vector3(s[0], s[1], s[2]), col)
		ymax = maxf(ymax, float(c[1]) + float(s[1]) * 0.5)
	o.alto = ymax
	if td.get("solido", false):
		var g := absi(int(round(o.giro))) % 180 == 90
		var hx := o.huella.y if g else o.huella.x
		var hz := o.huella.x if g else o.huella.y
		jg.nav.solido_rect(Rect2(o.pos.x - hx * 0.5, o.pos.y - hz * 0.5, hx, hz), true)
	objetos.append(o)
	por_id[o.id] = o

func dentro(p: Vector2) -> bool:
	return rect.grow(0.2).has_point(p)

func cortar(on: bool) -> void:
	if on == cortado:
		return
	cortado = on
	techo.visible = not on
	frente.scale.y = 0.1 if on else 1.0

func de_tipo(t: String) -> Array:
	var r: Array = []
	for o in objetos:
		if o.tipo == t:
			r.append(o)
	return r
