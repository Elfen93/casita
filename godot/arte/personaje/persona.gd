extends Node3D
class_name Persona
## Persona de 1,7 m (adulto) con API estable. El modelo (Quaternius, CC0) queda escondido detrás de esta API.
##
##   var p = preload("res://arte/personaje/persona.tscn").instantiate()
##   add_child(p)
##   p.set_aspecto({"genero":"f","edad":34,"piel":2,"pelo":"castano","ropa":{"variante":2,"arriba":Color("c0504d")},"semilla":7})
##   p.anim("andar"); p.mirar_a(Vector3(3,0,2)); p.set_nombre("Marisa")
##
## Origen en el suelo (entre los pies); el frente de la persona mira hacia -Z.

const ALTURA_ADULTO := 1.70
const CUERPOS_H := ["Male_Casual", "Male_Shirt", "Male_LongSleeve", "Male_Suit"]
const CUERPOS_M := ["Female_Casual", "Female_TankTop", "Female_Dress", "Female_Alternative"]
const PIELES := [Color("f1c9a5"), Color("e0ac84"), Color("c68d62"), Color("a56a43"), Color("7a4a2c"), Color("4f301d")]
const PELOS := {
	"negro": Color("1c1714"), "castano": Color("4a3020"), "rubio": Color("c9a45c"),
	"pelirrojo": Color("9a4a22"), "canoso": Color("b9b6b2"), "blanco": Color("e6e3de"),
}
const ANIMS_DISPONIBLES := ["parado", "andar", "correr", "sentado", "usar", "beber", "hablar", "dormir"]
## Nombre en castellano -> animación real del paquete. Las marcadas (*) son poses propias, no del paquete.
const MAPA_ANIM := {
	"parado": "Idle", "andar": "Walk", "correr": "Run", "sentado": "Sitting",
	"usar": "*usar", "beber": "*beber", "hablar": "*hablar", "dormir": "Idle",
}

var cuerpo: Node3D
var esqueleto: Skeleton3D
var reproductor: AnimationPlayer
var rotulo: Label3D
var aspecto := {}
var altura := ALTURA_ADULTO
var _escala_base := 1.0
var _anim_actual := ""
var _clave_anim := ""
var _hueso_cabeza := -1
var _mirar_objetivo = null

func _ready() -> void:
	if cuerpo == null:
		set_aspecto(aspecto)

# ---------------------------------------------------------------- aspecto
func set_aspecto(a: Dictionary) -> void:
	aspecto = a.duplicate(true)
	var rng := RandomNumberGenerator.new()
	rng.seed = int(a.get("semilla", 1))
	var edad: int = int(a.get("edad", 35))
	var h := _es_hombre(a.get("genero", ""), rng)
	var ropa = a.get("ropa", {})
	var variante := rng.randi() % 4
	var c_arriba = null
	var c_abajo = null
	var c_calzado = null
	if ropa is int:
		variante = ropa
	elif ropa is Color:
		c_arriba = ropa
	elif ropa is Dictionary:
		variante = int(ropa.get("variante", variante))
		c_arriba = ropa.get("arriba", null)
		c_abajo = ropa.get("abajo", null)
		c_calzado = ropa.get("calzado", null)
	variante = posmod(variante, 4)
	var nombre_cuerpo: String = (CUERPOS_H if h else CUERPOS_M)[variante]
	if c_arriba == null: c_arriba = _color_ropa(rng)
	if c_abajo == null: c_abajo = [Color("2f3b52"), Color("3b3b40"), Color("5a4a3a"), Color("4a5a6a"), Color("23262b")][rng.randi() % 5]
	if c_calzado == null: c_calzado = [Color("2a211c"), Color("e8e8e4"), Color("3a3a3a")][rng.randi() % 3]
	var piel: Color = _resolver_color(a.get("piel", null), PIELES, rng.randi() % PIELES.size())
	var pelo_a = a.get("pelo", null)
	if pelo_a == null:
		pelo_a = "canoso" if edad >= 62 else ["negro", "castano", "castano", "rubio", "pelirrojo", "negro"][rng.randi() % 6]
	var pelo: Color = _resolver_pelo(pelo_a)
	# modelo
	if cuerpo != null:
		cuerpo.queue_free()
		cuerpo = null
	if reproductor != null:
		reproductor.queue_free()
	cuerpo = (load("res://arte/personaje/cuerpos/%s.scn" % nombre_cuerpo) as PackedScene).instantiate()
	cuerpo.name = "Cuerpo"
	add_child(cuerpo)
	esqueleto = cuerpo.get_node("HumanArmature/Skeleton3D")
	_hueso_cabeza = esqueleto.find_bone("Head")
	for m in cuerpo.find_children("*", "MeshInstance3D", true, false):
		var mi: MeshInstance3D = m
		for i in mi.mesh.get_surface_count():
			var mat: StandardMaterial3D = mi.mesh.surface_get_material(i).duplicate()
			match mat.resource_name:
				"Skin": mat.albedo_color = piel
				"Hair", "HairBase", "Hair2", "Eyebrows": mat.albedo_color = pelo
				"Shirt", "Shirt2", "Dress", "Jacket", "LightJacket": mat.albedo_color = c_arriba
				"Pants": mat.albedo_color = c_abajo
				"Shoes", "Socks": mat.albedo_color = c_calzado
			mat.roughness = 0.9
			mi.set_surface_override_material(i, mat)
	# tamaño: se mide la cabeza del esqueleto para que el adulto mida 1,70 m
	var cm := _medir_altura_modelo()
	var f_edad := _factor_edad(edad)
	_escala_base = ALTURA_ADULTO / maxf(cm, 0.01)
	var variacion := 1.0 + (rng.randf() - 0.5) * 0.08
	if edad >= 14:
		variacion *= 1.0 if h else 0.96
	altura = ALTURA_ADULTO * f_edad * variacion
	cuerpo.scale = Vector3.ONE * (_escala_base * f_edad * variacion)
	cuerpo.rotation.y = PI  # el modelo mira a +Z; la persona debe mirar a -Z
	if edad < 14:  # criatura: cabeza algo mayor en proporción
		var k := 1.0 + (14 - edad) * 0.025
		esqueleto.set_bone_pose_scale(_hueso_cabeza, Vector3.ONE * k)
	else:
		esqueleto.set_bone_pose_scale(_hueso_cabeza, Vector3.ONE)
	# animaciones
	reproductor = AnimationPlayer.new()
	reproductor.name = "Reproductor"
	add_child(reproductor)
	reproductor.root_node = reproductor.get_path_to(cuerpo)
	var lib: AnimationLibrary = (load("res://arte/personaje/anims.res") as AnimationLibrary).duplicate(true)
	for nom in ["Idle", "Walk", "Run", "Sitting"]:
		lib.get_animation(nom).loop_mode = Animation.LOOP_LINEAR
	lib.get_animation("Death").loop_mode = Animation.LOOP_NONE
	_crear_poses_propias(lib)
	reproductor.add_animation_library("", lib)
	if a.has("nombre"):
		set_nombre(str(a["nombre"]))
	elif rotulo != null:
		rotulo.position.y = altura + 0.25
	_anim_actual = ""
	_clave_anim = ""
	anim("parado")

func _es_hombre(g, rng: RandomNumberGenerator) -> bool:
	var s := str(g).to_lower()
	if s in ["h", "m", "hombre", "varon", "varón", "masculino", "male"]: return true
	if s in ["f", "mujer", "femenino", "female"]: return false
	return rng.randf() < 0.5

func _factor_edad(edad: int) -> float:
	if edad >= 16: return 1.0 - (0.03 if edad >= 70 else 0.0)
	# 2 años 0,50 -> 15 años ~0,96 (aprox. curva de crecimiento)
	return clampf(0.50 + (edad - 2) * 0.034, 0.45, 0.98)

func _color_ropa(rng: RandomNumberGenerator) -> Color:
	var paleta := [Color("b8483f"), Color("3f6fa8"), Color("e0c14a"), Color("5b8c5a"), Color("d9d4c7"), Color("8a5aa0"), Color("e08a3c"), Color("49535e"), Color("2f6f6a")]
	return paleta[rng.randi() % paleta.size()]

func _resolver_color(v, paleta: Array, por_defecto: int) -> Color:
	if v is Color: return v
	if v is int: return paleta[posmod(v, paleta.size())]
	if v is float: return paleta[clampi(int(v * (paleta.size() - 1) + 0.5), 0, paleta.size() - 1)]
	if v is String and v.begins_with("#"): return Color(v)
	return paleta[por_defecto]

func _resolver_pelo(v) -> Color:
	if v is Color: return v
	if v is String:
		if PELOS.has(v): return PELOS[v]
		if v.begins_with("#"): return Color(v)
	if v is int: return PELOS.values()[posmod(v, PELOS.size())]
	return PELOS["castano"]

func _medir_altura_modelo() -> float:
	# altura de la cabeza respecto a los pies en la pose de reposo, en unidades del cuerpo (sin escalar)
	var fin := esqueleto.find_bone("Head_end")
	var pose := esqueleto.get_bone_global_rest(fin)
	var base := esqueleto.get_bone_global_rest(esqueleto.find_bone("Foot.L"))
	var s: Transform3D = cuerpo.get_node("HumanArmature").transform
	var punto: Vector3 = s * (esqueleto.transform * pose.origin)
	var pie: Vector3 = s * (esqueleto.transform * base.origin)
	return (punto.y - minf(pie.y, 0.0)) * 1.04  # +4 %: la cabeza acaba algo por encima del hueso

# ---------------------------------------------------------------- animación
func anim(nombre: String, velocidad := 1.0, brazos := "") -> void:
	## brazos: "" | "beber" | "usar" | "hablar" -> solo con "sentado": sentado con los brazos haciendo eso.
	if reproductor == null: return
	if not MAPA_ANIM.has(nombre):
		push_warning("Persona.anim: animación desconocida '%s'" % nombre)
		nombre = "parado"
	var real: String = MAPA_ANIM[nombre]
	if real.begins_with("*"): real = real.substr(1)
	if nombre == "sentado" and brazos != "":
		real = "Sitting_brazos"
	var clave := nombre + "/" + brazos
	if clave == _clave_anim and reproductor.is_playing() and velocidad == reproductor.speed_scale:
		return
	_clave_anim = clave
	_anim_actual = nombre
	reproductor.speed_scale = velocidad
	reproductor.play(real, 0.2)
	_modo = nombre if nombre in ["usar", "beber", "hablar"] else (brazos if nombre == "sentado" else "")
	_t = 0.0
	cuerpo.position = Vector3.ZERO
	if nombre == "dormir":
		# tumbado boca arriba, cabeza hacia +Z, centrado sobre el origen (pensado para ponerlo sobre una cama)
		cuerpo.rotation = Vector3(-PI / 2, PI, 0)
		cuerpo.position = Vector3(0, 0.14 * _escala_vis(), -altura * 0.5)
	else:
		cuerpo.rotation = Vector3(0, PI, 0)
	if nombre == "sentado":
		cuerpo.position.y = _alto_asiento - 0.45 * _escala_vis()

func _escala_vis() -> float:
	return altura / ALTURA_ADULTO

## Altura (m, desde el suelo del origen) del asiento donde se sienta. Silla/sofá ~0,45; taburete de barra ~0,65.
var _alto_asiento := 0.45
func set_altura_asiento(h: float) -> void:
	_alto_asiento = h
	if _anim_actual == "sentado": cuerpo.position.y = h - 0.45 * _escala_vis()

func nombre_anim_actual() -> String:
	return _anim_actual

func mirar_a(punto: Vector3) -> void:
	# gira la persona sobre Y para que su frente (-Z) apunte al punto (en coordenadas globales)
	var d := punto - global_position
	d.y = 0
	if d.length() < 0.001: return
	global_rotation.y = atan2(-d.x, -d.z)

func set_nombre(texto: String) -> void:
	if rotulo == null:
		rotulo = Label3D.new()
		rotulo.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		rotulo.no_depth_test = true
		rotulo.fixed_size = false
		rotulo.pixel_size = 0.006
		rotulo.font_size = 40
		rotulo.outline_size = 12
		rotulo.modulate = Color(1, 1, 1)
		rotulo.outline_modulate = Color(0.1, 0.1, 0.12, 0.9)
		rotulo.render_priority = 5
		add_child(rotulo)
	rotulo.text = texto
	rotulo.position = Vector3(0, altura + 0.28, 0)
	rotulo.visible = texto != ""

# ---------------------------------------------------------------- poses propias (usar / beber / hablar)
## El paquete no trae estas animaciones. Son «Idle» sin las pistas de los brazos; los brazos se
## colocan cada fotograma apuntando hueso a hueso (_apuntar), con una oscilación sencilla.
const BRAZOS := ["UpperArm.L", "UpperArm.R", "LowerArm.L", "LowerArm.R"]
var _modo := ""
var _t := 0.0

func _crear_poses_propias(lib: AnimationLibrary) -> void:
	for nom in ["usar", "beber", "hablar"]:
		var a: Animation = lib.get_animation("Idle").duplicate(true)
		a.loop_mode = Animation.LOOP_LINEAR
		for h in BRAZOS:
			var k := a.find_track(NodePath("HumanArmature/Skeleton3D:" + h), Animation.TYPE_ROTATION_3D)
			if k >= 0: a.remove_track(k)
		lib.add_animation(nom, a)
	var sb: Animation = lib.get_animation("Sitting").duplicate(true)
	sb.loop_mode = Animation.LOOP_LINEAR
	for h in BRAZOS:
		var k2 := sb.find_track(NodePath("HumanArmature/Skeleton3D:" + h), Animation.TYPE_ROTATION_3D)
		if k2 >= 0: sb.remove_track(k2)
	lib.add_animation("Sitting_brazos", sb)

func _process(delta: float) -> void:
	if _modo == "" or esqueleto == null: return
	_t += delta
	match _modo:
		"beber": _pose_beber()
		"usar": _pose_usar()
		"hablar": _pose_hablar()

func _brazo(lado: String, arriba: Vector3, abajo: Vector3) -> void:
	# direcciones en el sistema de la persona: +X su derecha, +Y arriba, -Z delante. Para el lado izquierdo se espeja X.
	var sx := 1.0 if lado == "R" else -1.0
	arriba = Vector3(arriba.x * sx, arriba.y, arriba.z)
	abajo = Vector3(abajo.x * sx, abajo.y, abajo.z)
	_apuntar("UpperArm." + lado, "LowerArm." + lado, arriba)
	_apuntar("LowerArm." + lado, "Palm." + lado, abajo)

func _pose_beber() -> void:
	var ciclo := fmod(_t, 5.0)
	var k := 0.0  # 0 = vaso a la altura del pecho, 1 = en la boca
	if ciclo > 1.2 and ciclo < 2.0: k = smoothstep(1.2, 2.0, ciclo)
	elif ciclo >= 2.0 and ciclo <= 3.0: k = 1.0
	elif ciclo > 3.0 and ciclo < 3.8: k = 1.0 - smoothstep(3.0, 3.8, ciclo)
	var u := Vector3(0.12, -0.80, -0.55).lerp(Vector3(0.15, -0.55, -0.80), k)
	var l := Vector3(-0.25, 0.30, -0.92).lerp(Vector3(-0.28, 0.93, -0.25), k)
	_brazo("R", u, l)
	_brazo("L", Vector3(-0.10, -1, -0.05), Vector3(0, -1, -0.15))

func _pose_usar() -> void:
	var o := sin(_t * 3.0) * 0.18
	_brazo("R", Vector3(0.15, -0.65, -0.70), Vector3(-0.20 + o, -0.25, -0.95))
	_brazo("L", Vector3(0.15, -0.65, -0.70), Vector3(-0.20 - o, -0.25, -0.95))

func _pose_hablar() -> void:
	var o := sin(_t * 2.6) * 0.5
	_brazo("R", Vector3(0.45, -0.70, -0.55), Vector3(-0.15 + o * 0.5, 0.15 + o * 0.3, -0.95))
	_brazo("L", Vector3(-0.10, -1, -0.05), Vector3(0, -1, -0.15))

func _apuntar(nombre: String, hijo: String, dir_persona: Vector3) -> void:
	var i := esqueleto.find_bone(nombre)
	var j := esqueleto.find_bone(hijo)
	var d_glob := global_transform.basis.orthonormalized() * dir_persona.normalized()
	var d_esq := (esqueleto.global_transform.basis.orthonormalized().inverse() * d_glob).normalized()
	var rest_g := esqueleto.get_bone_global_rest(i)
	var dir_rest := (rest_g.basis * esqueleto.get_bone_rest(j).origin.normalized()).normalized()
	var q := Quaternion(dir_rest, d_esq)
	var nuevo := Basis(q) * rest_g.basis.orthonormalized()
	var par := esqueleto.get_bone_global_pose(esqueleto.get_bone_parent(i)).basis.orthonormalized()
	esqueleto.set_bone_pose_rotation(i, (par.inverse() * nuevo).get_rotation_quaternion())
