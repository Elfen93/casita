extends Node3D
class_name PersonaAnimada
## Persona con animaciones de Mixamo horneadas en Blender (arte/herramientas/blender/mixamo_retarget.py).
## Misma API que Persona: la usa Actor sin saber qué modelo es. Origen en el suelo; el frente mira a -Z.
## Los .glb viven en arte/mixamo/, que NO está en el repositorio (licencia de Mixamo): si faltan, Figura usa otra persona.

const MODELOS := {
	"autumn": {"glb": "res://arte/mixamo/autumn_mixamo.glb", "meta": "res://arte/mixamo/autumn_mixamo.json", "altura": 1.62},
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

static func disponible(m: String) -> bool:
	return MODELOS.has(m) and ResourceLoader.exists(MODELOS[m]["glb"])

static func _cargar(m: String) -> PackedScene:
	if not _escenas.has(m):
		_escenas[m] = load(MODELOS[m]["glb"])
		var meta := {}
		var f := FileAccess.open(MODELOS[m]["meta"], FileAccess.READ)
		if f != null:
			meta = JSON.parse_string(f.get_as_text())
		_metas[m] = meta if meta is Dictionary else {}
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
	altura = float(MODELOS[modelo]["altura"])
	if aspecto.has("edad") and int(aspecto["edad"]) < 16:
		altura *= Figura.factor_edad(int(aspecto["edad"]))
	_esc = altura / float(_meta.get("altura", altura))
	cuerpo.scale = Vector3.ONE * _esc
	cuerpo.rotation.y = PI          # los modelos miran a +Z; la persona mira a -Z
	_ap = cuerpo.find_children("*", "AnimationPlayer", true, false)[0]
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
