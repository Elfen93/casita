class_name Humano
extends Node3D
## Cuerpo humano moldeable (GD-10a). Origen en los pies, mira a -Z, 1,70 m en neutro.
## Los datos salen de humano.glb (generado por arte/herramientas/generar_humano.py).
## Cada deslizador "x" de -1..1 usa dos blend shapes: "x+" y "x-" (los de rango 0..1 solo "x+").

const MODELO := preload("res://arte/humano/humano.glb")
const CATALOGO := preload("res://arte/humano/catalogo.json")
const ALTURA_NEUTRA := 1.70

static func catalogo() -> Dictionary:
	var d: Dictionary = CATALOGO.data
	return d.duplicate(true)

var _modelo: Node3D
var _piezas := {}          # nombre de nodo -> MeshInstance3D
var _formas := {}          # id -> valor
var _expr := {}            # id -> valor
var _piel := "media"
var _pelo := {"id": "", "color": Color(0.25, 0.16, 0.1)}
var _ropa := {}            # capa -> {"id","color"}
var _mats := {}
var _dh := {}              # nombre de forma -> variación de altura (m) por unidad
var _listo := false
var _esq: Skeleton3D
var _reproductor: AnimationPlayer
var _cat: Dictionary
var _sucio := false
var _anim_actual := ""
var _mezcla := 0.2
const PANTALONES := ["vaqueros", "chandal"]

func _ready() -> void:
	_montar()

func _montar() -> void:
	if _listo:
		return
	_listo = true
	_modelo = MODELO.instantiate()
	add_child(_modelo)
	for n in _buscar(_modelo):
		_piezas[n.name] = n
	_cat = catalogo()
	_dh = _cat.get("dh", {})
	_esq = _nodo_tipo(_modelo, "Skeleton3D") as Skeleton3D
	_reproductor = _nodo_tipo(_modelo, "AnimationPlayer") as AnimationPlayer
	if _reproductor != null:
		for a in _reproductor.get_animation_list():
			_reproductor.get_animation(a).loop_mode = Animation.LOOP_LINEAR
	var cuerpo := _piezas["Cuerpo"] as MeshInstance3D
	var mp := StandardMaterial3D.new()
	mp.vertex_color_use_as_albedo = true
	mp.roughness = 0.72
	_mats["piel"] = mp
	cuerpo.material_override = mp
	for k in _piezas:
		if k.begins_with("Cuerpo"):
			(_piezas[k] as MeshInstance3D).material_override = mp
	for o in ["Ojo_izq", "Ojo_der"]:
		var mo := StandardMaterial3D.new()
		mo.albedo_texture = load("res://arte/humano/ojo.png")
		mo.roughness = 0.2
		(_piezas[o] as MeshInstance3D).material_override = mo
	var mb := StandardMaterial3D.new()
	mb.albedo_color = Color(0.82, 0.82, 0.86)
	mb.roughness = 0.9
	_mats["base"] = mb
	for k in _piezas:
		var p := _piezas[k] as MeshInstance3D
		if k.begins_with("ropa_") or k.begins_with("pelo_"):
			p.visible = false
			var m := StandardMaterial3D.new()
			m.roughness = 0.9
			m.cull_mode = BaseMaterial3D.CULL_DISABLED
			p.material_override = m
	if _piezas.has("ropa_base"):
		(_piezas["ropa_base"] as MeshInstance3D).visible = true
		(_piezas["ropa_base"] as MeshInstance3D).material_override = mb
	set_piel(_piel)
	_marcar()
	if _reproductor != null:
		anim("parado")

func _nodo_tipo(n: Node, tipo: String) -> Node:
	for c in n.get_children():
		if c.get_class() == tipo:
			return c
		var r := _nodo_tipo(c, tipo)
		if r != null:
			return r
	return null

# El esqueleto sigue al cuerpo: cabezas de hueso = neutras + suma de deltas de cada forma activa.
func _marcar() -> void:
	if not _sucio:
		_sucio = true
		_sincronizar.call_deferred()

func _sincronizar() -> void:
	_sucio = false
	if _esq == null:
		return
	var nombres: Array = _cat["huesos"]
	var base: Array = _cat["huesos_pos"]
	var padres: Array = _cat["huesos_padre"]
	var dj: Dictionary = _cat["dj"]
	var pos := []
	for i in nombres.size():
		var b: Array = base[i]
		pos.append(Vector3(b[0], b[1], b[2]))
	for f in _formas:
		var v: float = _formas[f]
		for signo in ["+", "-"]:
			var w := maxf(v, 0.0) if signo == "+" else maxf(-v, 0.0)
			if w == 0.0 or not dj.has(f + signo):
				continue
			var d: Dictionary = dj[f + signo]
			for i in nombres.size():
				if d.has(nombres[i]):
					var a: Array = d[nombres[i]]
					pos[i] += w * Vector3(a[0], a[1], a[2])
	for i in nombres.size():
		var bi := _esq.find_bone(nombres[i])
		if bi < 0:
			continue
		var loc: Vector3 = pos[i]
		if padres[i] != null:
			loc -= pos[nombres.find(padres[i])]
		_esq.set_bone_rest(bi, Transform3D(Basis(), loc))
		_esq.set_bone_pose_position(bi, loc)
	var piel := _esq.create_skin_from_rest_transforms()
	for k in _piezas:
		(_piezas[k] as MeshInstance3D).skin = piel
	_actualizar_partes()

func _actualizar_partes() -> void:
	var arriba := _ropa.has("arriba") or _ropa.has("entero")
	var abajo := _ropa.has("abajo") or _ropa.has("entero")
	var pantalon: bool = _ropa.has("abajo") and PANTALONES.has(_ropa["abajo"]["id"])
	var vis := {"torso": not arriba, "brazo": not arriba, "cadera": not (arriba or abajo),
		"muslo": not abajo, "pierna": not pantalon, "pie": not _ropa.has("pies")}
	for k in vis:
		if _piezas.has("Cuerpo_" + k):
			(_piezas["Cuerpo_" + k] as MeshInstance3D).visible = vis[k]

func animaciones() -> Array:
	return _cat.get("animaciones", []).duplicate() if _cat.size() > 0 else catalogo().get("animaciones", []).duplicate()

func anim(id: String, velocidad := 1.0) -> void:
	_montar()
	if _reproductor == null or not _reproductor.has_animation(id):
		return
	_anim_actual = id
	_reproductor.speed_scale = velocidad
	_reproductor.play(id, _mezcla)

func _buscar(n: Node) -> Array:
	var r := []
	for c in n.get_children():
		if c is MeshInstance3D:
			r.append(c)
		r.append_array(_buscar(c))
	return r

func _blend(nombre: String, v: float) -> void:
	for k in _piezas:
		var p := _piezas[k] as MeshInstance3D
		var i := p.find_blend_shape_by_name(nombre)
		if i >= 0:
			p.set_blend_shape_value(i, v)

func set_forma(id: String, v: float) -> void:
	_montar()
	_formas[id] = v
	_blend(id + "+", maxf(v, 0.0))
	_blend(id + "-", maxf(-v, 0.0))
	_marcar()

func set_piel(id: String) -> void:
	_montar()
	_piel = id
	var ruta := "res://arte/humano/pieles/piel_%s.jpg" % id
	if ResourceLoader.exists(ruta):
		(_mats["piel"] as StandardMaterial3D).albedo_texture = load(ruta)

func set_pelo(id: String, color: Color) -> void:
	_montar()
	_pelo = {"id": id, "color": color}
	for k in _piezas:
		if k.begins_with("pelo_"):
			var p := _piezas[k] as MeshInstance3D
			p.visible = (k == "pelo_" + id)
			(p.material_override as StandardMaterial3D).albedo_color = color
			(p.material_override as StandardMaterial3D).roughness = 0.5

func set_ropa(capa: String, id: String, color: Color) -> void:
	_montar()
	if id == "":
		_ropa.erase(capa)
	else:
		_ropa[capa] = {"id": id, "color": color}
	var cat := catalogo()
	# visibilidad: una prenda se ve si está elegida en su capa; "entero" anula arriba y abajo
	var activas := {}
	for c in _ropa:
		activas["ropa_" + _ropa[c]["id"]] = _ropa[c]
	var entero := _ropa.has("entero")
	for k in _piezas:
		if k.begins_with("ropa_") and k != "ropa_base":
			(_piezas[k] as MeshInstance3D).visible = false
	for r in cat["ropas"]:
		var nodo: String = "ropa_" + r.get("malla", r["id"])
		var clave: String = "ropa_" + r["id"]
		if not _piezas.has(nodo) or not activas.has(clave):
			continue
		if entero and (r["capa"] == "arriba" or r["capa"] == "abajo"):
			continue
		var p := _piezas[nodo] as MeshInstance3D
		p.visible = true
		(p.material_override as StandardMaterial3D).albedo_color = activas[clave]["color"]
	_marcar()

func _fin_ropa() -> void:
	_marcar()

func set_expresion(id: String, v: float) -> void:
	_montar()
	_expr[id] = v
	_blend("x_" + id, clampf(v, 0.0, 1.0))

func altura() -> float:
	var h := ALTURA_NEUTRA
	for k in _dh:
		var base: String = k.substr(0, k.length() - 1)
		var s: String = k.substr(k.length() - 1)
		var v: float = _formas.get(base, 0.0)
		var w: float = maxf(v, 0.0) if s == "+" else maxf(-v, 0.0)
		h += w * float(_dh[k])
	return h

func aspecto() -> Dictionary:
	var ropa := {}
	for c in _ropa:
		ropa[c] = {"id": _ropa[c]["id"], "color": (_ropa[c]["color"] as Color).to_html(false)}
	return {
		"formas": _formas.duplicate(),
		"piel": _piel,
		"pelo": {"id": _pelo["id"], "color": (_pelo["color"] as Color).to_html(false)},
		"ropa": ropa,
		"expresiones": _expr.duplicate(),
	}

func aplicar(a: Dictionary) -> void:
	_montar()
	var cat := catalogo()
	var f: Dictionary = a.get("formas", {})
	for s in cat["formas"]:
		set_forma(s["id"], float(f.get(s["id"], s["def"])))
	set_piel(str(a.get("piel", "media")))
	var p: Dictionary = a.get("pelo", {})
	set_pelo(str(p.get("id", "")), Color.html(str(p.get("color", "#40291a"))))
	var capas := {"arriba": true, "abajo": true, "pies": true, "entero": true}
	var r: Dictionary = a.get("ropa", {})
	for c in capas:
		if r.has(c):
			set_ropa(c, str(r[c].get("id", "")), Color.html(str(r[c].get("color", "#808080"))))
		else:
			set_ropa(c, "", Color.WHITE)
	var e: Dictionary = a.get("expresiones", {})
	for x in cat["expresiones"]:
		set_expresion(x["id"], float(e.get(x["id"], 0.0)))
