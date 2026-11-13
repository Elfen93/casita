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
var _ojos := "marron"
var _cejas := "cejas2"
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
		# Las blend shapes mueven piezas pequeñas (ojos, cejas, pestañas, dientes) hasta 7 cm y Godot recorta con el AABB
		# de la malla en reposo: de cerca desaparecían ojos y cejas. Caja fija generosa para que nunca se recorten.
		(n as MeshInstance3D).custom_aabb = AABB(Vector3(-1.0, -0.2, -1.0), Vector3(2.0, 2.6, 2.0))
	_cat = catalogo()
	_dh = _cat.get("dh", {})
	_esq = _nodo_tipo(_modelo, "Skeleton3D") as Skeleton3D
	_reproductor = _nodo_tipo(_modelo, "AnimationPlayer") as AnimationPlayer
	if _reproductor != null:
		for a in _reproductor.get_animation_list():
			_reproductor.get_animation(a).loop_mode = Animation.LOOP_LINEAR
	var tx: Dictionary = _cat.get("tex", {})
	var mp := StandardMaterial3D.new()
	mp.roughness = 0.72
	_mats["piel"] = mp
	for k in _piezas:
		var p := _piezas[k] as MeshInstance3D
		if k.begins_with("Cuerpo"):
			p.material_override = mp
		elif k == "Ojos":
			var mo := StandardMaterial3D.new()
			mo.roughness = 0.25
			_mats["ojos"] = mo
			p.material_override = mo
		elif k == "dientes":
			var md := StandardMaterial3D.new()
			md.albedo_texture = load("res://arte/humano/" + tx["dientes"]["t"])
			md.roughness = 0.4
			p.material_override = md
		elif k == "ropa_base_top" or k == "ropa_base_baj":
			var mb := StandardMaterial3D.new()
			mb.albedo_color = Color(0.82, 0.82, 0.86)
			mb.roughness = 0.9
			mb.cull_mode = BaseMaterial3D.CULL_DISABLED
			p.material_override = mb
		elif tx.has(k):
			var m := StandardMaterial3D.new()
			m.albedo_texture = load("res://arte/humano/" + tx[k]["t"])
			m.roughness = 0.85 if k.begins_with("ropa_") else 0.95
			if tx[k]["alfa"]:
				m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
				m.alpha_scissor_threshold = 0.3
				m.metallic_specular = 0.0
			if tx[k]["doble"]:
				m.cull_mode = BaseMaterial3D.CULL_DISABLED
			p.material_override = m
			if k.begins_with("ropa_") or k.begins_with("pelo_"):
				p.visible = false
		if k == "pestanas":
			(p.material_override as StandardMaterial3D).albedo_color = Color(0.08, 0.06, 0.05)
	for k in _piezas:
		if k.begins_with("cejas_"):
			_piezas[k].visible = false
	_estilo()
	set_piel(_piel)
	set_ojos(_ojos)
	set_cejas(_cejas)
	set_expresion("sonrisa", 0.0)
	_marcar()
	if _reproductor != null:
		# la animación se avanza a mano para poder corregir la postura después (ver _process)
		_reproductor.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
		anim("parado")

# --- Aspecto (GD-12): cómo responde cada material a la luz. Todo con StandardMaterial3D, que es lo que mueve el móvil.
func _estilo() -> void:
	for k in _piezas:
		var m := (_piezas[k] as MeshInstance3D).material_override as StandardMaterial3D
		if m == null:
			continue
		if k.begins_with("Cuerpo"):
			# piel: luz envolvente (sin corte duro de sombra), calor en el paso a sombra y un borde de luz suave
			m.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT_WRAP
			m.roughness = 0.58
			m.metallic_specular = 0.28
			m.rim_enabled = true
			m.rim = 0.14
			m.rim_tint = 0.4
			m.backlight_enabled = true
			m.backlight = Color(0.2, 0.07, 0.05)
		elif k == "Ojos":
			# ojo húmedo: el brillo de la luz principal le da vida a la mirada
			m.roughness = 0.06
			m.metallic_specular = 0.85
			m.clearcoat_enabled = true
			m.clearcoat = 1.0
			m.clearcoat_roughness = 0.04
		elif k.begins_with("pelo_"):
			m.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT_WRAP
			m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_DEPTH_PRE_PASS
			m.roughness = 0.5
			m.metallic_specular = 0.22
			m.rim_enabled = true
			m.rim = 0.25
			m.rim_tint = 0.6
		elif k.begins_with("cejas_") or k == "pestanas":
			m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_DEPTH_PRE_PASS
		elif k.begins_with("ropa_"):
			# tela: luz envolvente y un pelín de borde, como la pelusa de un tejido
			m.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT_WRAP
			m.rim_enabled = true
			m.rim = 0.16
			m.rim_tint = 0.85

## Luces de retrato para enseñar a una persona (creador, muestras): principal cálida, relleno frío y contraluz.
static func luces_retrato(padre: Node3D) -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.74, 0.78, 0.84)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.8, 0.84, 0.95)
	env.ambient_light_energy = 0.42
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_white = 1.6
	var we := WorldEnvironment.new()
	we.environment = env
	padre.add_child(we)
	var datos := [
		[Vector3(-30, 24, 0), Color(1.0, 0.96, 0.9), 0.6, false],    # principal: delante, a un lado y por encima
		[Vector3(-8, -55, 0), Color(0.72, 0.82, 1.0), 0.2, false],    # relleno: del otro lado, baja y fría
		[Vector3(-30, 200, 0), Color(0.95, 0.97, 1.0), 0.5, false],  # contraluz: detrás, recorta la silueta y el pelo
	]
	for d in datos:
		var l := DirectionalLight3D.new()
		l.rotation_degrees = d[0]
		l.light_color = d[1]
		l.light_energy = d[2]
		l.shadow_enabled = d[3]
		l.shadow_blur = 2.5
		padre.add_child(l)

# Postura: las animaciones vienen de otro esqueleto y dejan las piernas muy abiertas y los brazos separados al estar
# de pie. Tras avanzar la animación se cierran un poco (giro alrededor del eje de avance, en espacio del esqueleto).
const POSTURA := {"parado": 1.0, "hablar": 1.0, "andar": 0.35, "correr": 0.0, "sentado": 0.0}
var cierre_piernas := 6.0   # grados
var cierre_brazos := 5.0

# «parado» no usa la animación capturada (sacaba pecho y echaba los hombros atrás): es una pose propia,
# construida desde la pose de reposo, con respiración y un leve balanceo.
var pose := {"brazo_abajo": 37.0, "brazo_delante": 3.0, "codo": -14.0, "pierna": 3.0, "cabeza": 2.0, "hombro": 2.0}   # grados; el codo en negativo estira (la pose de reposo ya lo trae doblado)
var _t := 0.0

func _process(dt: float) -> void:
	if _reproductor == null or _esq == null:
		return
	_t += dt
	if _anim_actual == "parado":
		_pose_parado()
		return
	_reproductor.advance(dt)
	var k: float = POSTURA.get(_anim_actual, 0.0)
	if k <= 0.0:
		return
	_girar_z("thigh_l", deg_to_rad(cierre_piernas) * k)
	_girar_z("thigh_r", -deg_to_rad(cierre_piernas) * k)
	_girar_z("foot_l", -deg_to_rad(cierre_piernas) * k)
	_girar_z("foot_r", deg_to_rad(cierre_piernas) * k)
	_girar_z("upperarm_l", deg_to_rad(cierre_brazos) * k)
	_girar_z("upperarm_r", -deg_to_rad(cierre_brazos) * k)

func _pose_parado() -> void:
	_esq.reset_bone_poses()
	var resp := sin(_t * TAU / 4.2)          # respiración
	var bal := sin(_t * TAU / 9.0)           # peso de un pie a otro, muy poco
	var X := Vector3(1, 0, 0)
	var Z := Vector3(0, 0, 1)
	_girar("pelvis", Z, deg_to_rad(0.6 * bal))
	_girar("spine_02", X, deg_to_rad(0.5 * resp))
	_girar("spine_03", X, deg_to_rad(0.6 * resp))
	_girar("Head", X, deg_to_rad(pose["cabeza"] - 0.4 * resp))
	for lado in [["_l", 1.0], ["_r", -1.0]]:
		var s: String = lado[0]
		var sg: float = lado[1]
		_girar("clavicle" + s, X, deg_to_rad(pose["hombro"]))                      # hombros sueltos, algo hacia delante
		_girar("clavicle" + s, Z, sg * deg_to_rad(0.5 * resp))
		_girar("upperarm" + s, Z, sg * deg_to_rad(pose["brazo_abajo"]))            # brazos caídos junto al cuerpo
		_girar("upperarm" + s, X, deg_to_rad(pose["brazo_delante"]))
		_girar("lowerarm" + s, X, deg_to_rad(pose["codo"]))                        # codo apenas doblado
		_girar("thigh" + s, Z, sg * deg_to_rad(pose["pierna"]))
		_girar("foot" + s, Z, -sg * deg_to_rad(pose["pierna"]))

# gira un hueso alrededor de un eje del esqueleto (no del hueso), sobre la pose que tenga en ese momento
func _girar(hueso: String, eje: Vector3, ang: float) -> void:
	var i := _esq.find_bone(hueso)
	if i < 0:
		return
	var g := _esq.get_bone_global_pose(i)
	var p := _esq.get_bone_parent(i)
	var gp := _esq.get_bone_global_pose(p).basis if p >= 0 else Basis()
	# el eje llega en el espacio de la persona (X a su lado, Y arriba, Z delante-detrás) y se pasa al del esqueleto
	var e := ((_esq.global_transform.basis.inverse() * global_transform.basis).orthonormalized() * eje).normalized()
	_esq.set_bone_pose_rotation(i, (gp.inverse() * (Basis(e, ang) * g.basis)).get_rotation_quaternion())
	_esq.force_update_bone_child_transform(i)   # que los hijos vean ya el giro (si no, leen su pose global antigua)

func _girar_z(hueso: String, ang: float) -> void:
	var i := _esq.find_bone(hueso)
	if i < 0:
		return
	var g := _esq.get_bone_global_pose(i)
	var p := _esq.get_bone_parent(i)
	var gp := _esq.get_bone_global_pose(p).basis if p >= 0 else Basis()
	var nb := Basis(Vector3(0, 0, 1), ang) * g.basis
	_esq.set_bone_pose_rotation(i, (gp.inverse() * nb).get_rotation_quaternion())

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
	var puestas := {}
	for k in _piezas:
		if k.begins_with("ropa_") and k != "ropa_base_top" and k != "ropa_base_baj" and _piezas[k].visible:
			puestas[k] = true
	var oc: Dictionary = _cat.get("ocultas", {})
	for k in oc:
		if not _piezas.has(k):
			continue
		var v := true
		for g in oc[k]:
			if puestas.has(g):
				v = false
				break
		(_piezas[k] as MeshInstance3D).visible = v
	if _piezas.has("ropa_base_top"):
		(_piezas["ropa_base_top"] as MeshInstance3D).visible = not arriba
	if _piezas.has("ropa_base_baj"):
		(_piezas["ropa_base_baj"] as MeshInstance3D).visible = not abajo

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
	var antes := float(_formas.get("genero", 0.0)) > 0.0
	_formas[id] = v
	if id == "genero" and (v > 0.0) != antes:
		set_piel(_piel)
	_blend(id + "+", maxf(v, 0.0))
	_blend(id + "-", maxf(-v, 0.0))
	_marcar()

func set_piel(id: String) -> void:
	_montar()
	_piel = id
	var g := "m" if float(_formas.get("genero", 0.0)) > 0.0 else "f"
	var ruta := "res://arte/humano/tex/piel_%s_%s.jpg" % [id, g]
	if ResourceLoader.exists(ruta):
		(_mats["piel"] as StandardMaterial3D).albedo_texture = load(ruta)

func set_ojos(id: String) -> void:
	_montar()
	_ojos = id
	for o in _cat.get("ojos", []):
		if o["id"] == id and _mats.has("ojos"):
			(_mats["ojos"] as StandardMaterial3D).albedo_texture = load("res://arte/humano/" + o["t"])

func set_cejas(id: String) -> void:
	_montar()
	_cejas = id
	for k in _piezas:
		if k.begins_with("cejas_"):
			_piezas[k].visible = (k == "cejas_" + id)
	_color_cejas()

func _color_cejas() -> void:
	var c: Color = _pelo["color"] if _pelo["id"] != "" else Color(0.3, 0.2, 0.14)
	c = c.darkened(0.25)
	for k in _piezas:
		if k.begins_with("cejas_"):
			(_piezas[k].material_override as StandardMaterial3D).albedo_color = c

func set_pelo(id: String, color: Color) -> void:
	_montar()
	_pelo = {"id": id, "color": color}
	_color_cejas()
	for k in _piezas:
		if k.begins_with("pelo_"):
			var p := _piezas[k] as MeshInstance3D
			p.visible = (k == "pelo_" + id)
			(p.material_override as StandardMaterial3D).albedo_color = color

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
		if k.begins_with("ropa_") and k != "ropa_base_top" and k != "ropa_base_baj":
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
	var w := clampf(v, 0.0, 1.0)
	if id == "sonrisa":
		w = 0.2 + 0.8 * w   # una cara neutra de MakeHuman sale seria: algo de sonrisa de reposo (es de boca cerrada)
	_blend("x_" + id, w)

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
		"ojos": _ojos,
		"cejas": _cejas,
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
	set_ojos(str(a.get("ojos", "marron")))
	set_cejas(str(a.get("cejas", "cejas2")))
	var e: Dictionary = a.get("expresiones", {})
	for x in cat["expresiones"]:
		set_expresion(x["id"], float(e.get(x["id"], 0.0)))
