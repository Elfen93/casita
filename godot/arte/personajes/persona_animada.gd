extends Node3D
class_name PersonaAnimada
## Persona con animaciones de Mixamo horneadas en Blender (arte/herramientas/blender/mixamo_retarget.py).
## Misma API que Persona: la usa Actor sin saber qué modelo es. Origen en el suelo; el frente mira a -Z.
## Los .glb viven en arte/mixamo/, que NO está en el repositorio (licencia de Mixamo): si faltan, Figura usa otra persona.

const MODELOS := {
	"remy": {"glb": "res://arte/mixamo/remy.glb", "meta": "res://arte/mixamo/remy.json", "altura": 1.80},
}
const ANIMS_DISPONIBLES := ["parado", "andar", "correr", "sentado", "usar", "beber", "hablar", "dormir"]
const SIN_BUCLE := []
static var _escenas := {}
static var _metas := {}

var modelo := "remy"
var cuerpo: Node3D
var rotulo: Label3D
var aspecto := {}
var altura := 1.75
var _ap: AnimationPlayer
var _meta := {}
var _esc := 1.0
var _anim := ""
var _real := ""
var _alto_asiento := 0.45
var _cara: MeshInstance3D
var _forma := {}
var _t := 0.0
var _t_parpadeo := 2.0
var _parpadeo := 0.0

## Personajes de Mixamo sin animaciones propias (arte/mixamo/pj/<nombre>.glb): usan las de Remy (mismo esqueleto).
## Altura en el juego de cada uno (m); el resto de datos sale de pj/personajes.json.
const PJ := {
	"james": 1.80, "leonard": 1.78, "brian": 1.76, "adam": 1.79, "joe": 1.80, "boss": 1.74,
	"louise": 1.66, "megan": 1.65, "kate": 1.67, "sophie": 1.64, "jody": 1.63, "martha": 1.66, "granny": 1.58, "timmy": 1.45,
}
const PJ_META := "res://arte/mixamo/pj/personajes.json"
static var _pj_meta := {}
static var _lib: AnimationLibrary
static var _cadera_lib := 0.0

static func _ruta(m: String) -> String:
	return MODELOS[m]["glb"] if MODELOS.has(m) else "res://arte/mixamo/pj/%s.glb" % m

static func disponible(m: String) -> bool:
	if MODELOS.has(m):
		return ResourceLoader.exists(MODELOS[m]["glb"])
	return PJ.has(m) and ResourceLoader.exists(_ruta(m)) and disponible("remy")

## animaciones compartidas: las de remy.glb, y la altura de su cadera en reposo (espacio del esqueleto)
static func _libreria() -> AnimationLibrary:
	if _lib == null:
		var r: Node = _cargar("remy").instantiate()
		var ap: AnimationPlayer = r.find_children("*", "AnimationPlayer", true, false)[0]
		# copia sin pistas de posición (salvo la cadera) ni de escala: cada esqueleto conserva el largo de sus huesos
		var orig := ap.get_animation_library("")
		_lib = AnimationLibrary.new()
		for n in orig.get_animation_list():
			var an: Animation = orig.get_animation(n).duplicate(true)
			for i in range(an.get_track_count() - 1, -1, -1):
				var tt := an.track_get_type(i)
				var hueso := str(an.track_get_path(i).get_concatenated_subnames())
				if tt == Animation.TYPE_SCALE_3D or (tt == Animation.TYPE_POSITION_3D and not hueso.ends_with("Hips")):
					an.remove_track(i)
			_lib.add_animation(n, an)
		var sk: Skeleton3D = r.find_children("*", "Skeleton3D", true, false)[0]
		_cadera_lib = _cadera_esq(sk)
		r.free()
	return _lib

static func _cadera_esq(sk: Skeleton3D) -> float:
	for i in sk.get_bone_count():
		if sk.get_bone_name(i).ends_with("Hips"):
			return sk.get_bone_global_rest(i).origin.length()   # el «arriba» del esqueleto no siempre es +Y (Mixamo: -Z)
	return 1.0

static func _leer_json(ruta: String) -> Dictionary:
	var f := FileAccess.open(ruta, FileAccess.READ)
	if f == null:
		return {}
	var d = JSON.parse_string(f.get_as_text())
	return d if d is Dictionary else {}

static func _cargar(m: String) -> PackedScene:
	if not _escenas.has(m):
		_escenas[m] = load(_ruta(m))
		if MODELOS.has(m):
			_metas[m] = _leer_json(MODELOS[m]["meta"])
		else:
			if _pj_meta.is_empty():
				_pj_meta = _leer_json(PJ_META)
			# los datos de asiento son los de Remy, pasados a la cadera de este personaje
			var mr := _leer_json(MODELOS["remy"]["meta"])
			var mp: Dictionary = _pj_meta.get(m, {})
			var k := float(mp.get("cadera", 1.0)) / float(mr.get("cadera_pie", 1.0))
			var meta := {"altura": float(mp.get("altura", 1.75))}
			for c in mr:
				if str(c).begins_with("cadera_"):
					meta[c] = float(mr[c]) * k
			_metas[m] = meta
	return _escenas[m]

func _init(m := "remy") -> void:
	modelo = m

func set_aspecto(a: Dictionary) -> void:
	aspecto = a.duplicate(true)
	if cuerpo == null:
		_montar()
	if a.has("nombre"):
		set_nombre(str(a["nombre"]))

func _montar() -> void:
	cuerpo = _cargar(modelo).instantiate()
	cuerpo.name = "Cuerpo"
	add_child(cuerpo)
	_meta = _metas.get(modelo, {})
	altura = float(MODELOS[modelo]["altura"]) if MODELOS.has(modelo) else float(PJ.get(modelo, 1.75))
	if aspecto.has("edad") and int(aspecto["edad"]) < 16:
		altura *= Figura.factor_edad(int(aspecto["edad"]))
	_esc = altura / float(_meta.get("altura", altura))
	cuerpo.scale = Vector3.ONE * _esc
	cuerpo.rotation.y = PI          # los modelos miran a +Z; la persona mira a -Z
	var aps := cuerpo.find_children("*", "AnimationPlayer", true, false)
	if aps.is_empty():
		# personaje sin animaciones: las de Remy, con la traslación de la cadera escalada a su tamaño
		_ap = AnimationPlayer.new()
		cuerpo.add_child(_ap)
		_ap.add_animation_library("", _libreria())
		var sk: Skeleton3D = cuerpo.find_children("*", "Skeleton3D", true, false)[0]
		sk.motion_scale = _cadera_esq(sk) / _cadera_lib
	else:
		_ap = aps[0]
	for n in _ap.get_animation_list():
		var an := _ap.get_animation(n)
		an.loop_mode = Animation.LOOP_NONE if SIN_BUCLE.has(n) else Animation.LOOP_LINEAR
	for mi_ in cuerpo.find_children("*", "MeshInstance3D", true, false):
		var mi: MeshInstance3D = mi_
		mi.custom_aabb = AABB(Vector3(-1, -0.2, -1) / _esc, Vector3(2, 2.4, 2) / _esc)   # las animaciones salen de la caja de reposo
		if mi.mesh.get_blend_shape_count() > 0 and _cara == null:
			_cara = mi
			for i in mi.mesh.get_blend_shape_count():
				_forma[str(mi.mesh.get_blend_shape_name(i))] = i
		for s in mi.mesh.get_surface_count():
			var mat := mi.mesh.surface_get_material(s) as StandardMaterial3D
			if mat == null:
				continue
			var nm := mat.resource_name.to_lower()
			if nm.contains("pestan") or nm.contains("ceja") or nm.contains("pelo") or nm.contains("hair") or nm.contains("lash"):
				mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
				mat.alpha_scissor_threshold = 0.32
				mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	anim("parado")

# ---------------------------------------------------------------- API de Persona
func anim(nombre: String, velocidad := 1.0, brazos := "") -> void:
	if not ANIMS_DISPONIBLES.has(nombre):
		nombre = "parado"
	var real := nombre
	if nombre == "sentado" and brazos in ["beber", "hablar"]:
		real = "sentado_" + brazos
	_anim = nombre
	if real != _real and _ap.has_animation(real):
		_ap.play(real, 0.25)
		# arranca en un punto al azar para que dos personas con la misma animación no se muevan a la par
		if real != "andar" and real != "correr":
			_ap.seek(randf() * _ap.current_animation_length * 0.8, true)
	_real = real
	_ap.speed_scale = 1.0
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

func _colocar() -> void:
	if cuerpo == null: return
	cuerpo.position = Vector3.ZERO
	if _real.begins_with("sentado"):
		# la cadera de la animación queda a «cadera_<anim>» del suelo; el asiento, ~5,8 % de la altura por debajo de la cadera
		var cad := float(_meta.get("cadera_" + _real, _meta.get("cadera_sentado", 0.0)))
		var asiento_anim := (cad - 0.058 * float(_meta.get("altura", 1.0))) * _esc
		cuerpo.position.y = _alto_asiento - asiento_anim

# ---------------------------------------------------------------- cara (solo si el modelo trae formas)
func _process(delta: float) -> void:
	if _cara == null: return
	_t += delta
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
	var habla := _real.ends_with("hablar")
	var sonrisa := 0.30 if habla else (0.0 if _anim == "dormir" else 0.12)
	_f("mouthSmileLeft", sonrisa)
	_f("mouthSmileRight", sonrisa)
	_f("jawOpen", (0.10 + 0.10 * sin(_t * 9.0) + 0.06 * sin(_t * 5.3)) if habla else 0.0)
	_f("mouthFunnel", (0.10 + 0.10 * sin(_t * 3.7)) if habla else 0.0)

func _f(nombre: String, v: float) -> void:
	if _forma.has(nombre):
		_cara.set_blend_shape_value(_forma[nombre], clampf(v, 0.0, 1.0))
