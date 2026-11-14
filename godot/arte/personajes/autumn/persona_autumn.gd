extends Node3D
class_name PersonaAutumn
## La chica hecha en Blender siguiendo la serie de TomCAT (cuerpo, cara y texturas del autor; ropa, pelo, esqueleto y
## expresiones propios). Misma API que Persona (arte/personaje/persona.gd): la usa Actor sin saber qué modelo es.
## Origen en el suelo (entre los pies); el frente mira a -Z.
##
## El modelo trae solo los huesos de deformación de Rigify (DEF-*) y 52 formas de cara (ARKit). No trae animaciones:
## aquí se mueven los huesos apuntándolos (andar, correr, sentarse, usar, beber, hablar, dormir) y la cara con las formas.

const MODELO := preload("res://arte/personajes/autumn/autumn.glb")
const ALTURA := 1.62
const ALTURA_MODELO := 1.533
const ALTO_CADERA := 0.87          # altura de la cadera en el modelo sin escalar
const ANIMS_DISPONIBLES := ["parado", "andar", "correr", "sentado", "usar", "beber", "hablar", "dormir"]

var cuerpo: Node3D
var esqueleto: Skeleton3D
var rotulo: Label3D
var aspecto := {}
var altura := ALTURA
var _malla_cara: MeshInstance3D
var _forma := {}                   # nombre de forma -> índice
var _h := {}                       # nombre de hueso -> índice
var _anim := "parado"
var _brazos := ""
var _vel := 1.0
var _t := 0.0
var _fase := 0.0
var _alto_asiento := 0.45
var _t_parpadeo := 2.0
var _parpadeo := 0.0
var _mezcla := 1.0                 # 0..1: transición suave al cambiar de animación
var _dir_prev := {}                # hueso -> última dirección aplicada (para mezclar)

func _ready() -> void:
	if cuerpo == null:
		set_aspecto(aspecto)

func set_aspecto(a: Dictionary) -> void:
	aspecto = a.duplicate(true)
	if cuerpo == null:
		_montar()
	if a.has("nombre"):
		set_nombre(str(a["nombre"]))

func _montar() -> void:
	cuerpo = MODELO.instantiate()
	cuerpo.name = "Cuerpo"
	add_child(cuerpo)
	cuerpo.scale = Vector3.ONE * (ALTURA / ALTURA_MODELO)
	cuerpo.rotation.y = PI               # el modelo mira a +Z; la persona debe mirar a -Z
	esqueleto = cuerpo.find_children("*", "Skeleton3D", true, false)[0]
	for i in esqueleto.get_bone_count():
		_h[esqueleto.get_bone_name(i)] = i
	for m in cuerpo.find_children("*", "MeshInstance3D", true, false):
		var mi: MeshInstance3D = m
		# las formas mueven párpados y boca más allá de la caja de la malla en reposo; caja fija para que no se recorte
		mi.custom_aabb = AABB(Vector3(-0.8, -0.2, -0.8), Vector3(1.6, 2.2, 1.6))
		if mi.mesh.get_blend_shape_count() > 0:
			_malla_cara = mi
			for i in mi.mesh.get_blend_shape_count():
				_forma[str(mi.mesh.get_blend_shape_name(i))] = i
		for s in mi.mesh.get_surface_count():
			var mat := mi.mesh.surface_get_material(s) as StandardMaterial3D
			if mat == null:
				continue
			match mat.resource_name:
				"pestanas", "cejas", "pelo":
					mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
					mat.alpha_scissor_threshold = 0.32
					mat.cull_mode = BaseMaterial3D.CULL_DISABLED
				"piel":
					mat.roughness = 0.62
				"ojo":
					mat.roughness = 0.12
	_aplicar(1.0)

# ---------------------------------------------------------------- API de Persona
func anim(nombre: String, velocidad := 1.0, brazos := "") -> void:
	if not ANIMS_DISPONIBLES.has(nombre):
		push_warning("PersonaAutumn.anim: animación desconocida '%s'" % nombre)
		nombre = "parado"
	if nombre == _anim and brazos == _brazos and is_equal_approx(velocidad, _vel):
		return
	_anim = nombre
	_brazos = brazos if nombre == "sentado" else ""
	_vel = velocidad
	_mezcla = 0.0
	_colocar()

func set_altura_asiento(h: float) -> void:
	_alto_asiento = h
	_colocar()

func nombre_anim_actual() -> String:
	return _anim

func mirar_a(punto: Vector3) -> void:
	var d := punto - global_position
	d.y = 0
	if d.length() < 0.001: return
	global_rotation.y = atan2(-d.x, -d.z)

func set_nombre(texto: String) -> void:
	if rotulo == null:
		rotulo = Label3D.new()
		rotulo.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		rotulo.no_depth_test = true
		rotulo.pixel_size = 0.006
		rotulo.font_size = 40
		rotulo.outline_size = 12
		rotulo.outline_modulate = Color(0.1, 0.1, 0.12, 0.9)
		rotulo.render_priority = 5
		add_child(rotulo)
	rotulo.text = texto
	rotulo.position = Vector3(0, altura + 0.28, 0)
	rotulo.visible = texto != ""

func _esc() -> float:
	return ALTURA / ALTURA_MODELO

func _colocar() -> void:
	if cuerpo == null: return
	var e := _esc()
	cuerpo.position = Vector3.ZERO
	cuerpo.rotation = Vector3(0, PI, 0)
	if _anim == "dormir":
		# tumbada boca arriba, cabeza hacia +Z, centrada sobre el origen (pensado para ponerla sobre una cama)
		cuerpo.rotation = Vector3(-PI / 2, PI, 0)
		cuerpo.position = Vector3(0, 0.12 * e, -altura * 0.5)
	elif _anim == "sentado":
		cuerpo.position.y = _alto_asiento + (0.10 - ALTO_CADERA) * e

# ---------------------------------------------------------------- movimiento
func _process(delta: float) -> void:
	if esqueleto == null: return
	_t += delta
	_mezcla = minf(1.0, _mezcla + delta * 5.0)
	var cad := 0.0
	if _anim == "andar": cad = 2.05 * _vel / 1.7
	elif _anim == "correr": cad = 2.75 * _vel / 1.35
	_fase += delta * cad * TAU
	_aplicar(_mezcla)
	_cara(delta)

func _aplicar(k: float) -> void:
	var s := sin(_fase)
	var c := cos(_fase)
	var resp := sin(_t * 1.6) * 0.012
	# valores por defecto: de pie, brazos caídos junto al cuerpo
	var muslo := {"L": Vector3(0.02, -1, 0), "R": Vector3(0.02, -1, 0)}          # x se espeja para el lado izquierdo
	var pierna := {"L": Vector3(0.0, -1, 0.02), "R": Vector3(0.0, -1, 0.02)}
	var pie := {"L": Vector3(0.06, -0.33, -0.94), "R": Vector3(0.06, -0.33, -0.94)}
	var brazo := {"L": Vector3(0.13, -1, 0.02 + resp), "R": Vector3(0.13, -1, 0.02 + resp)}
	var ante := {"L": Vector3(0.06, -1, -0.14), "R": Vector3(0.06, -1, -0.14)}
	var bote := 0.0
	match _anim:
		"andar", "correr":
			var A := 0.46 if _anim == "andar" else 0.62        # amplitud del muslo (rad)
			var K := 0.75 if _anim == "andar" else 1.35        # flexión máxima de rodilla
			var Bz := 0.42 if _anim == "andar" else 0.85       # balanceo del brazo
			var Ec := 0.30 if _anim == "andar" else 1.25       # codo
			for lado in ["L", "R"]:
				var sg := 1.0 if lado == "L" else -1.0
				var a := A * s * sg
				var rod := 0.12 + K * maxf(0.0, c * sg)
				muslo[lado] = Vector3(0.02, -cos(a), -sin(a))
				pierna[lado] = Vector3(0.0, -cos(a - rod), -sin(a - rod))
				var pt := 0.33 + 0.45 * maxf(0.0, -s * sg) * (0.6 if _anim == "andar" else 1.0)   # el pie se estira al empujar atrás
				pie[lado] = Vector3(0.06, -sin(pt), -cos(pt)).rotated(Vector3.RIGHT, -(a - rod) * 0.35)
				var b := -Bz * s * sg
				brazo[lado] = Vector3(0.14, -cos(b), -sin(b))
				var e2 := b + Ec + 0.12 * maxf(0.0, -s * sg)
				ante[lado] = Vector3(0.02, -cos(e2), -sin(e2))
			bote = (absf(c) - 0.6) * (0.022 if _anim == "andar" else 0.045)
		"sentado":
			for lado in ["L", "R"]:
				muslo[lado] = Vector3(0.10, -0.10, -1)
				pierna[lado] = Vector3(0.0, -1, 0.06)
				pie[lado] = Vector3(0.05, -0.30, -0.95)
				brazo[lado] = Vector3(0.14, -0.95, -0.22)
				ante[lado] = Vector3(-0.10, -0.50, -0.86)
		"dormir":
			for lado in ["L", "R"]:
				brazo[lado] = Vector3(0.22, -1, 0.0)
				ante[lado] = Vector3(0.10, -1, -0.10)
	var modo := _anim if _anim in ["usar", "beber", "hablar"] else _brazos
	match modo:
		"beber":
			var ciclo := fmod(_t, 5.0)
			var kk := 0.0   # 0 = vaso a la altura del pecho, 1 = en la boca
			if ciclo > 1.2 and ciclo < 2.0: kk = smoothstep(1.2, 2.0, ciclo)
			elif ciclo >= 2.0 and ciclo <= 3.0: kk = 1.0
			elif ciclo > 3.0 and ciclo < 3.8: kk = 1.0 - smoothstep(3.0, 3.8, ciclo)
			brazo["R"] = Vector3(0.12, -0.80, -0.55).lerp(Vector3(0.15, -0.55, -0.80), kk)
			ante["R"] = Vector3(-0.25, 0.30, -0.92).lerp(Vector3(-0.28, 0.93, -0.25), kk)
		"usar":
			var o := sin(_t * 3.0) * 0.18
			brazo["R"] = Vector3(0.20, -0.70, -0.62); ante["R"] = Vector3(-0.04 + o, -0.22, -0.95)
			brazo["L"] = Vector3(0.20, -0.70, -0.62); ante["L"] = Vector3(-0.04 - o, -0.22, -0.95)
		"hablar":
			var o2 := sin(_t * 2.6) * 0.5
			brazo["R"] = Vector3(0.45, -0.70, -0.55); ante["R"] = Vector3(-0.15 + o2 * 0.5, 0.15 + o2 * 0.3, -0.95)
	if _anim != "dormir" and _anim != "sentado":
		cuerpo.position.y = bote
	# aplicar (primero el hueso padre de cada cadena)
	for lado in ["L", "R"]:
		_dir("DEF-thigh." + lado, "DEF-thigh.%s.001" % lado, muslo[lado], lado, k)
		_dir("DEF-shin." + lado, "DEF-shin.%s.001" % lado, pierna[lado], lado, k)
		_dir("DEF-foot." + lado, "DEF-toe." + lado, pie[lado], lado, k)
		_dir("DEF-upper_arm." + lado, "DEF-upper_arm.%s.001" % lado, brazo[lado], lado, k)
		_dir("DEF-forearm." + lado, "DEF-forearm.%s.001" % lado, ante[lado], lado, k)

func _dir(hueso: String, hijo: String, d: Vector3, lado: String, k: float) -> void:
	# direcciones en el sistema de la persona: +X su derecha, +Y arriba, -Z delante. En el lado izquierdo se espeja X.
	if lado == "L": d.x = -d.x
	d = d.normalized()
	if k < 1.0 and _dir_prev.has(hueso):
		d = (_dir_prev[hueso] as Vector3).slerp(d, k).normalized()
	if k >= 1.0:
		_dir_prev[hueso] = d
	_apuntar(hueso, hijo, d)

func _base_esq() -> Basis:
	# orientación del esqueleto respecto a la persona (sin transformaciones globales: vale también fuera del árbol)
	# el cuerpo cuenta siempre como «de pie» (girado PI), aunque esté tumbado: las direcciones son las del cuerpo
	var b := Basis.IDENTITY
	var n: Node3D = esqueleto
	while n != null and n != cuerpo:
		b = n.transform.basis.orthonormalized() * b
		n = n.get_parent() as Node3D
	return Basis(Vector3.UP, PI) * b

func _apuntar(nombre: String, hijo: String, dir_persona: Vector3) -> void:
	if not _h.has(nombre) or not _h.has(hijo): return
	var i: int = _h[nombre]
	var j: int = _h[hijo]
	var d_esq := (_base_esq().inverse() * dir_persona).normalized()
	var rest_g := esqueleto.get_bone_global_rest(i)
	var dir_rest := (rest_g.basis * esqueleto.get_bone_rest(j).origin.normalized()).normalized()
	var q := Quaternion(dir_rest, d_esq)
	var nuevo := Basis(q) * rest_g.basis.orthonormalized()
	var par := esqueleto.get_bone_global_pose(esqueleto.get_bone_parent(i)).basis.orthonormalized()
	esqueleto.set_bone_pose_rotation(i, (par.inverse() * nuevo).get_rotation_quaternion())

# ---------------------------------------------------------------- cara (formas de ARKit)
func _f(nombre: String, v: float) -> void:
	if _malla_cara != null and _forma.has(nombre):
		_malla_cara.set_blend_shape_value(_forma[nombre], clampf(v, 0.0, 1.0))

func _cara(delta: float) -> void:
	if _malla_cara == null: return
	var ojos := 0.0
	if _anim == "dormir":
		ojos = 1.0
	else:
		_t_parpadeo -= delta
		if _t_parpadeo <= 0.0:
			_t_parpadeo = randf_range(2.4, 5.5)
			_parpadeo = 0.16
		if _parpadeo > 0.0:
			_parpadeo -= delta
			ojos = sin(clampf(1.0 - _parpadeo / 0.16, 0.0, 1.0) * PI)
	_f("eyeBlinkLeft", ojos)
	_f("eyeBlinkRight", ojos)
	var habla := _anim == "hablar" or _brazos == "hablar"
	var sonrisa := 0.30 if habla else (0.0 if _anim == "dormir" else 0.12)
	_f("mouthSmileLeft", sonrisa)
	_f("mouthSmileRight", sonrisa)
	_f("jawOpen", (0.10 + 0.10 * sin(_t * 9.0) + 0.06 * sin(_t * 5.3)) if habla else 0.0)
	_f("mouthFunnel", (0.10 + 0.10 * sin(_t * 3.7)) if habla else 0.0)
	_f("browInnerUp", 0.15 if habla else 0.0)
