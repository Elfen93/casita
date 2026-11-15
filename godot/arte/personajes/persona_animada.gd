extends Node3D
class_name PersonaAnimada
## Persona con animaciones de Mixamo horneadas en Blender (arte/herramientas/blender/mixamo_retarget.py).
## Misma API que Persona: la usa Actor sin saber qué modelo es. Origen en el suelo; el frente mira a -Z.
## Los .glb viven en arte/mixamo/, que NO está en el repositorio (licencia de Mixamo): si faltan, Figura usa otra persona.

const MODELOS := {
	"remy": {"glb": "res://arte/mixamo/remy.glb", "meta": "res://arte/mixamo/remy.json", "altura": 1.80},
}
## las de siempre (las que entiende también la persona de repuesto); el resto sale del catálogo (Animaciones)
const ANIMS_DISPONIBLES := ["parado", "andar", "correr", "sentado", "usar", "beber", "hablar", "dormir"]
const BLEND := 0.25                   # segundos de mezcla entre animaciones
const PIN_DESP := 0.6                 # las de pie que apartan la cadera más que esto se clavan en el sitio (sitios estrechos)
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
var _pedida := ""                    # lo que pidió Actor (la de verdad, aunque se vea la de reserva)
var _post := "de_pie"                # postura de la que se ve
var _acabada := false
var _fin := ""                       # la última de una vez que acabó
var _esperando := {}                 # grupos pedidos que aún no han llegado
var _sk: Skeleton3D
var _sk_persona := Transform3D.IDENTITY
var _pos_obj := Vector3.ZERO         # dónde va el cuerpo (se llega con suavidad, como la mezcla de animaciones)
var _clavar := false
var _cadera0 := Vector3.ZERO
static var _i_cadera := {}           # Animation -> pista de posición de la cadera
## a qué vuelve una de pie de una vez al acabar (Actor la cambia: anciano, borracho…)
var reposo_de_pie := "parado"
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
	"josh": 1.79, "chad": 1.77, "alex": 1.77, "david": 1.76, "lewis": 1.77, "pete": 1.78,
	"elizabeth": 1.68, "michelle": 1.64, "jackie": 1.62, "suzie": 1.65, "amy": 1.45,
}
const PJ_META := "res://arte/mixamo/pj/personajes.json"
static var _pj_meta := {}
static var _lib: AnimationLibrary
static var _cadera_lib := 0.0

## Animaciones horneadas (arte/herramientas/hornear_anims.gd, lo llama scripts/godot_export.sh): una AnimationLibrary
## por grupo de data/animaciones.json en arte/mixamo/anim/<grupo>.res, sin malla ni texturas, lista para cualquier
## esqueleto de Mixamo. «base» (lo de siempre: andar, sentado, dormir…) va en index.pck; el resto de grupos (dia, social,
## baile, musica, trabajo, gimnasio, boxeo, policia, agua, mayores_ninos) en play3d/anim/<grupo>.pck, que Paquetes baja
## la primera vez que alguien pide una de sus animaciones (mientras, la más parecida de base: Animaciones.reserva).
## Sin hornear (editor), se sacan al vuelo de arte/mixamo/anims/<grupo>.glb (base: de remy.glb si falta anims/base.glb).
const ANIM_BASE := "res://arte/mixamo/anim/base.res"
const ANIM_RES := "res://arte/mixamo/anim/%s.res"
const ANIMS_GLB := "res://arte/mixamo/anims/%s.glb"
static var _libs := {}                # grupo -> AnimationLibrary ya cargada
static var _combos: AnimationLibrary  # «x+y» montadas al vuelo (piernas de x, brazos de y), compartidas

static func _ruta(m: String) -> String:
	return MODELOS[m]["glb"] if MODELOS.has(m) else "res://arte/mixamo/pj/%s.glb" % m

## nombre del paquete web que trae el modelo (Paquetes): «pj/<nombre>», también Remy
static func paquete(m: String) -> String:
	return "pj/" + m

## ¿hay este personaje? (en disco, en index.pck o para bajar en la web)
static func disponible(m: String) -> bool:
	if not MODELOS.has(m) and not PJ.has(m):
		return false
	if not (ResourceLoader.exists(_ruta(m)) or Paquetes.existe(paquete(m))):
		return false
	return MODELOS.has(m) or anims_disponibles()

## ¿se puede montar ya? (en la web, si no, hay que pedir su paquete: Figura.persona lo hace)
static func listo(m: String) -> bool:
	return ResourceLoader.exists(_ruta(m))

static func anims_disponibles() -> bool:
	return ResourceLoader.exists(ANIM_BASE) or ResourceLoader.exists(ANIMS_GLB % "base") or ResourceLoader.exists(MODELOS["remy"]["glb"])

## animaciones de base y la altura de la cadera de Remy en reposo (espacio del esqueleto, meta «cadera_reposo»)
static func _libreria() -> AnimationLibrary:
	if _lib == null:
		if ResourceLoader.exists(ANIM_BASE):
			_lib = load(ANIM_BASE)
		else:
			_lib = hornear_grupo("base")
		_cadera_lib = float(_lib.get_meta("cadera_reposo", 1.0))
		_poner_bucles(_lib)
		_libs["base"] = _lib
	return _lib

## paquete web de un grupo de animaciones
static func paquete_anim(g: String) -> String:
	return "anim/" + g

## ¿se puede usar ya este grupo? (horneado en disco o en un paquete ya montado; o su glb, en el editor)
static func grupo_listo(g: String) -> bool:
	return g == "base" or _libs.has(g) or ResourceLoader.exists(ANIM_RES % g) or ResourceLoader.exists(ANIMS_GLB % g)

## la librería del grupo, o null si aún no ha llegado (pedirla con Paquetes.pedir(paquete_anim(g), …))
static func lib_grupo(g: String) -> AnimationLibrary:
	if g == "base" or g == "":
		return _libreria()
	if _libs.has(g):
		return _libs[g]
	var lib: AnimationLibrary = null
	if ResourceLoader.exists(ANIM_RES % g):
		lib = load(ANIM_RES % g)
	elif ResourceLoader.exists(ANIMS_GLB % g):
		lib = hornear_grupo(g)
	if lib != null:
		_poner_bucles(lib)
		_libs[g] = lib
	return lib

## bucle sí/no según el catálogo (las de una vez se quedan en su último fotograma al acabar)
static func _poner_bucles(lib: AnimationLibrary) -> void:
	for n in lib.get_animation_list():
		var an := lib.get_animation(n)
		var b := Animaciones.bucle(str(n)) if Animaciones.existe(str(n)) else true
		an.loop_mode = Animation.LOOP_LINEAR if b else Animation.LOOP_NONE

## las animaciones de un grupo (arte/mixamo/anims/<g>.glb; base sin él: las de remy.glb), listas para cualquier
## esqueleto de Mixamo. null si no está su glb.
static func hornear_grupo(g: String) -> AnimationLibrary:
	var ruta := ANIMS_GLB % g
	if not ResourceLoader.exists(ruta):
		if g != "base" or not ResourceLoader.exists(MODELOS["remy"]["glb"]):
			return null
		ruta = MODELOS["remy"]["glb"]
	var r: Node = load(ruta).instantiate()
	var lib := _copiar_libreria(r)
	r.free()
	if g == "base":
		# carreras de verdad (el «correr» de base es un trote): van en base aunque vengan en otro glb
		for n in Animaciones.EN_BASE:
			var otro := ANIMS_GLB % Animaciones.EN_BASE[n]
			if lib.has_animation(n) or not ResourceLoader.exists(otro):
				continue
			var r2: Node = load(otro).instantiate()
			var l2 := _copiar_libreria(r2)
			r2.free()
			if l2.has_animation(n):
				lib.add_animation(n, l2.get_animation(n))
	_poner_bucles(lib)
	return lib

## las animaciones de remy.glb (lo de antes; hornear_grupo("base") prefiere anims/base.glb, que las trae y alguna más)
static func hornear_libreria() -> AnimationLibrary:
	return hornear_grupo("base")

static func _copiar_libreria(r: Node) -> AnimationLibrary:
	var ap: AnimationPlayer = r.find_children("*", "AnimationPlayer", true, false)[0]
	# copia sin pistas de posición (salvo la cadera) ni de escala: cada esqueleto conserva el largo de sus huesos
	var orig := ap.get_animation_library("")
	var lib := AnimationLibrary.new()
	for n in orig.get_animation_list():
		var an: Animation = orig.get_animation(n).duplicate(true)
		for i in range(an.get_track_count() - 1, -1, -1):
			var tt := an.track_get_type(i)
			var hueso := str(an.track_get_path(i).get_concatenated_subnames())
			if tt == Animation.TYPE_SCALE_3D or (tt == Animation.TYPE_POSITION_3D and not hueso.ends_with("Hips")):
				an.remove_track(i)
		lib.add_animation(n, an)
	var sk: Skeleton3D = r.find_children("*", "Skeleton3D", true, false)[0]
	lib.set_meta("cadera_reposo", _cadera_esq(sk))
	return lib

## huesos de «brazos y cabeza» para «x+y»: de la segunda vértebra para arriba (la cadera y las piernas, de x)
static func _hueso_de_brazos(hueso: String) -> bool:
	for k in ["Spine1", "Spine2", "Neck", "Head", "Shoulder", "Arm", "Hand"]:
		if hueso.contains(k):
			return true
	return false

## «x+y»: piernas y tronco de x con brazos y cabeza de y. Dura lo que la más larga; la otra se repite (las dos son
## de bucle y en el sitio) o, si es de una vez, se queda en su último fotograma.
static func _combo(x: Animation, y: Animation) -> Animation:
	var largo := maxf(x.length, y.length)
	var an := Animation.new()
	an.length = largo
	an.loop_mode = Animation.LOOP_LINEAR if (x.loop_mode != Animation.LOOP_NONE and y.loop_mode != Animation.LOOP_NONE) else Animation.LOOP_NONE
	for fuente in [x, y]:
		var es_y: bool = fuente == y
		for i in fuente.get_track_count():
			var hueso := str(fuente.track_get_path(i).get_concatenated_subnames())
			if _hueso_de_brazos(hueso) != es_y:
				continue
			var tt: int = fuente.track_get_type(i)
			var j := an.add_track(tt)
			an.track_set_path(j, fuente.track_get_path(i))
			an.track_set_interpolation_type(j, fuente.track_get_interpolation_type(i))
			var vueltas := 1
			if fuente.loop_mode != Animation.LOOP_NONE and fuente.length > 0.0:
				vueltas = ceili(largo / fuente.length - 0.001)
			for v in vueltas:
				for k in fuente.track_get_key_count(i):
					var t: float = fuente.track_get_key_time(i, k) + v * fuente.length
					if t > largo + 0.0001 or (v > 0 and k == 0 and fuente.track_get_key_time(i, k) <= 0.0):
						continue
					an.track_insert_key(j, t, fuente.track_get_key_value(i, k))
	return an

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
			# (y el avance de andar/correr: piernas más largas, pasos más largos; ver zancada())
			for c in mr:
				if str(c).begins_with("cadera_") or str(c).begins_with("avance_"):
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
	# todas las personas, Remy incluido, con las animaciones horneadas (base y, según se pidan, los grupos), con la
	# traslación de la cadera escalada a su tamaño. Remy trae las suyas en el glb: se cambian por las horneadas (son
	# las mismas, y así tiene también las de base que no venían en remy.glb).
	var aps := cuerpo.find_children("*", "AnimationPlayer", true, false)
	if aps.is_empty():
		_ap = AnimationPlayer.new()
		cuerpo.add_child(_ap)
	else:
		_ap = aps[0]
		_ap.stop()
		for l in _ap.get_animation_library_list():
			_ap.remove_animation_library(l)
	_ap.add_animation_library("", _libreria())
	_sk = cuerpo.find_children("*", "Skeleton3D", true, false)[0]
	_sk.motion_scale = _cadera_esq(_sk) / _cadera_lib
	_sk_persona = _a_persona(_sk)
	_ap.animation_finished.connect(_al_acabar)
	# caja de visibilidad: las animaciones salen de la caja de reposo (sentado, tumbado, brazos), así que cada malla lleva
	# una fija que cubre a la persona en cualquier postura. Se da en metros en el espacio de ESTA persona y se pasa al de
	# la malla: entre medias está el «Armature» de Mixamo (escala 0,01 y girado 90°), y la caja hecha a ojo en el
	# espacio de la malla salía de 2 cm y tumbada: la persona desaparecía en cuanto los pies salían de plano.
	var caja := AABB(Vector3(-1.5, -1.2, -1.5), Vector3(3.0, altura + 2.2, 3.0))   # ±1 m en Y: sentado sube/baja el cuerpo
	for mi_ in cuerpo.find_children("*", "MeshInstance3D", true, false):
		var mi: MeshInstance3D = mi_
		mi.custom_aabb = _a_persona(mi).affine_inverse() * caja
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

## transformación del espacio de un nodo del cuerpo al de esta persona (sin el desplazamiento de _colocar)
func _a_persona(n: Node3D) -> Transform3D:
	var t := Transform3D.IDENTITY
	while n != null and n != cuerpo:
		t = n.transform * t
		n = n.get_parent() as Node3D
	return Transform3D(cuerpo.transform.basis, Vector3.ZERO) * t

# ---------------------------------------------------------------- API de Persona
## nombre: una animación del catálogo (data/animaciones.json) o «x+y» (piernas de x, brazos de y). brazos: lo de antes
## («sentado» + «beber»/«hablar» → sentado_beber/sentado_hablar; con otra cosa, «sentado+<brazos>»).
## Si su grupo aún no ha llegado (web), se pide y mientras va la más parecida de base; al llegar, se cambia sola.
func anim(nombre: String, velocidad := 1.0, brazos := "") -> void:
	var spec := nombre
	if brazos != "":
		spec = nombre + "_" + brazos if Animaciones.existe(nombre + "_" + brazos) else nombre + "+" + brazos
	_anim = nombre
	_pedida = spec
	var clave := _clave(spec, true)
	if clave == "" or not _ap.has_animation(clave):
		clave = _clave(Animaciones.reserva(spec), true)
	if clave == "" or not _ap.has_animation(clave):
		clave = "parado"
	var base := clave.get_file()
	var de_una_vez := _ap.get_animation(clave).loop_mode == Animation.LOOP_NONE
	if clave != _real or (de_una_vez and _acabada):
		_ap.play(clave, BLEND)
		_acabada = false
		if de_una_vez:
			_fin = ""
		# arranca en un punto al azar para que dos personas con la misma animación no se muevan a la par
		if not de_una_vez and not (Animaciones.es_andar(base) or base in ["correr", "correr_rapido", "sprint"]):
			_ap.seek(randf() * _ap.current_animation_length * 0.8, true)
	_real = clave
	_post = Animaciones.postura(base) if not base.contains("+") else Animaciones.postura(base.split("+")[0])
	# velocidad = ritmo de la animación; Actor la ajusta al andar/correr para que los pies no resbalen (ver zancada())
	_ap.speed_scale = velocidad
	_colocar()

## ¿está ya cargada esta animación (o «x+y») en esta persona? (si no, se ve la de reserva)
func anim_lista(spec: String) -> bool:
	var c := _clave(spec, false)
	return c != "" and _ap.has_animation(c)

## la que se ve de verdad (nombre del catálogo o «x+y»; la de reserva mientras llega su grupo)
func anim_real() -> String:
	return _real.get_file()

## la de una vez que se estaba viendo ha acabado (se queda en su último fotograma si es tumbado o en el suelo;
## si no, vuelve sola al reposo de su postura). Actor lo mira para elegir la siguiente.
func acabada() -> bool:
	return _acabada

## ¿acabó ya la de una vez «n»? (sigue diciendo que sí aunque luego haya vuelto sola al reposo)
func acabo(n: String) -> bool:
	return _fin == n

## clave en el AnimationPlayer («parado», «dia/contento», «combo/sentado+comer»). Con pedir, pide el grupo que falte.
func _clave(spec: String, pedir: bool) -> String:
	var partes := spec.split("+")
	var claves: Array = []
	for p in partes:
		var g := Animaciones.grupo(p)
		if g == "" or g == "base":
			if not _libreria().has_animation(p):
				return ""
			claves.append(p)
			continue
		var lib := lib_grupo(g) if grupo_listo(g) else null
		if lib == null:
			if pedir and not _esperando.has(g):
				_esperando[g] = true
				Paquetes.pedir(paquete_anim(g), _grupo_llego)
			return ""
		if not lib.has_animation(p):
			return ""
		if not _ap.has_animation_library(g):
			_ap.add_animation_library(g, lib)
		claves.append(g + "/" + p)
	if claves.size() == 1:
		return claves[0]
	if _combos == null:
		_combos = AnimationLibrary.new()
	var nc := "+".join(partes)
	if not _combos.has_animation(nc):
		_combos.add_animation(nc, _combo(_ap.get_animation(claves[0]), _ap.get_animation(claves[1])))
	if not _ap.has_animation_library("combo"):
		_ap.add_animation_library("combo", _combos)
	return "combo/" + nc

func _grupo_llego(paquete: String) -> void:
	_esperando.erase(paquete.get_file())
	if not is_instance_valid(self) or _ap == null:
		return
	var v := _ap.speed_scale
	var antes := _real
	anim(_pedida, v)
	if _real != antes:
		_colocar()

func _al_acabar(clave: StringName) -> void:
	if str(clave) != _real or _ap.get_animation(clave).loop_mode != Animation.LOOP_NONE:
		return
	_acabada = true
	var base := str(clave).get_file()
	_fin = base
	if base.begins_with("sentarse"):
		anim("sentado", 1.0)
	elif base.begins_with("levantarse"):
		anim(reposo_de_pie, 1.0)
	elif _post == "sentado":
		anim("sentado", 1.0)
	elif _post == "de_pie":
		anim(reposo_de_pie, 1.0)
	else:
		return   # tumbado, en el suelo, en el agua: se queda en el último fotograma
	_acabada = true

## m/s que avanza el pie apoyado en «andar»/«correr» con la animación a velocidad 1,0, ya a la escala de ESTA persona
## (altura, edad). Remy (animaciones propias): el dato horneado por exportar_remy.py (avance_<anim> del JSON, en
## unidades del modelo). Los personajes «pj» llevan las animaciones de Remy en SU esqueleto: se mide en la animación
## (Escala.medir_zancada), porque escalar el de Remy por la cadera falla en cuerpos de otras proporciones (Timmy: -9 %).
## Si algo falta: el JSON escalado y, al final, la reserva de Escala.
func zancada(nombre: String) -> float:
	var json := float(_meta.get("avance_" + nombre, 0.0)) * _esc
	var a := json if MODELOS.has(modelo) else 0.0
	var clave := _clave(nombre, false) if _ap != null else ""
	if a <= 0.0 and clave != "" and _ap.has_animation(clave):
		a = Escala.medir_zancada(_sk, _ap.get_animation(clave), self, "mixamo/" + nombre)
	if a <= 0.0:
		a = json
	if a <= 0.0:
		a = float(Escala.ZANCADA_RESERVA.get(nombre, 1.0)) * altura
	return a

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

## la cadera de una animación en el instante t, en el espacio de esta persona (sin el desplazamiento de _colocar)
func _cadera(clave: String, t: float) -> Vector3:
	if not _ap.has_animation(clave):
		return Vector3.ZERO
	var an := _ap.get_animation(clave)
	var i := -1
	if _i_cadera.has(an):
		i = _i_cadera[an]
	else:
		for k in an.get_track_count():
			if an.track_get_type(k) == Animation.TYPE_POSITION_3D and str(an.track_get_path(k).get_concatenated_subnames()).ends_with("Hips"):
				i = k
				break
		_i_cadera[an] = i
	if i < 0:
		return Vector3.ZERO
	return _sk_persona * (an.position_track_interpolate(i, clampf(t, 0.0, an.length)) * _sk.motion_scale)

## hacia dónde apunta la columna (eje Y de la cadera) en el suelo al empezar, en el espacio de esta persona (radianes)
func _rumbo(clave: String) -> float:
	if not _ap.has_animation(clave):
		return 0.0
	var an := _ap.get_animation(clave)
	for k in an.get_track_count():
		if an.track_get_type(k) == Animation.TYPE_ROTATION_3D and str(an.track_get_path(k).get_concatenated_subnames()).ends_with("Hips"):
			var q: Quaternion = an.rotation_track_interpolate(k, 0.0)
			var d := _sk_persona.basis * (Basis(q) * Vector3.UP)
			return atan2(d.x, d.z)
	return 0.0

## dónde va el cuerpo según la postura de la animación: sentado, la cadera sobre el asiento (las sentadas se encajan
## con «sentado»; sentarse, con su último fotograma; levantarse, con el primero); tumbado, donde «dormir»; de pie, en el
## sitio (las que se apartan mucho, clavadas: ver _process)
func _colocar() -> void:
	if cuerpo == null: return
	var p := Vector3.ZERO
	var base := _real.get_file()
	if _post == "sentado" or base.begins_with("sentado"):
		# la cadera de «sentado» queda a «cadera_sentado» del suelo; el asiento, ~5,8 % de la altura por debajo de la cadera
		var cad := float(_meta.get("cadera_sentado", 0.0))
		var asiento_anim := (cad - 0.058 * float(_meta.get("altura", 1.0))) * _esc
		p.y = _alto_asiento - asiento_anim
		if _real != "sentado":
			var dur := _ap.get_animation(_real).length if _ap.has_animation(_real) else 0.0
			p += _cadera("sentado", 0.0) - _cadera(_real, dur if base.begins_with("sentarse") else 0.0)
	var giro := 0.0
	if _post == "tumbado" and _real != "dormir":
		# cada una tumbada a su manera (de lado, cruzada): se gira para que el cuerpo vaya a lo largo como en «dormir»
		# y se lleva la cadera a donde la tiene «dormir»
		giro = _rumbo("dormir") - _rumbo(_real)
		p = _cadera("dormir", 0.0) - _cadera(_real, 0.0).rotated(Vector3.UP, giro)
	cuerpo.rotation.y = PI + giro
	_pos_obj = p
	_clavar = _post == "de_pie" and Animaciones.desp(base) >= PIN_DESP
	if _clavar:
		_cadera0 = _cadera(_real, 0.0)

func _process(delta: float) -> void:
	if cuerpo != null and _ap != null:
		var obj := _pos_obj
		if _clavar and _ap.current_animation == _real:
			var d := _cadera0 - _cadera(_real, _ap.current_animation_position)
			obj += Vector3(d.x, 0.0, d.z)
			cuerpo.position = Vector3(obj.x, cuerpo.position.lerp(obj, 1.0 - exp(-14.0 * delta)).y, obj.z)
		else:
			cuerpo.position = cuerpo.position.lerp(obj, 1.0 - exp(-14.0 * delta))
	if _cara == null: return
	_t += delta
	var ojos := 0.0
	var base := _real.get_file()
	if base.begins_with("dormir"):
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
	var habla := base.contains("hablar") or base.contains("charlar") or base.contains("discutir") or base == "gritar" or base == "contar_secreto"
	var rie := base.begins_with("reir") or base == "contento" or base == "celebrar"
	var triste := base in ["triste", "llorar", "andar_triste", "rechazado", "anciano_derrotado"]
	var sonrisa := 0.30 if (habla or rie) else (0.0 if (base.begins_with("dormir") or triste) else 0.12)
	_f("mouthSmileLeft", sonrisa)
	_f("mouthSmileRight", sonrisa)
	_f("jawOpen", (0.10 + 0.10 * sin(_t * 9.0) + 0.06 * sin(_t * 5.3)) if habla else (0.25 if rie else 0.0))
	_f("mouthFunnel", (0.10 + 0.10 * sin(_t * 3.7)) if habla else 0.0)

func _f(nombre: String, v: float) -> void:
	if _forma.has(nombre):
		_cara.set_blend_shape_value(_forma[nombre], clampf(v, 0.0, 1.0))
