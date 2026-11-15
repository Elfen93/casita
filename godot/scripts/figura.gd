class_name Figura
# ÚNICO PUNTO donde se crea la figura del personaje y de los vecinos.
# crear() devuelve {"nodo": raíz, "cuerpo": versión barata (cápsula de una malla) que bota al andar, "asp": aspecto,
# "esc": escala de la barata}. La persona de verdad (esqueleto, arte libre de godot/arte/) se crea con persona(asp)
# y la monta Actor cuando está cerca y a la vista (ver Actor.set_lod): lejos y fuera de pantalla solo existe la cápsula.
const PERSONA := preload("res://arte/personaje/persona.tscn")
static var _mats := {}
static var _malla: CapsuleMesh

static func factor_edad(edad: int) -> float:
	if edad >= 16:
		return 1.0
	return clampf(0.50 + (edad - 2) * 0.034, 0.45, 0.98)

# Aspecto ESTABLE derivado de los datos del vecino: género, edad y una semilla del id.
static func aspecto_de(v: Dictionary) -> Dictionary:
	var hs := absi(hash(str(v["id"])))
	var camisa := Color.from_hsv(float(hs % 360) / 360.0, 0.45, 0.82)
	var asp := {"genero": "f" if str(v.get("g", "m")) == "f" else "h", "edad": int(v.get("edad", 35)),
		"semilla": hs % 100000 + 1, "ropa": {"arriba": camisa}, "camisa": camisa}
	# oficio que se ve en cómo está (Actor): la policía de servicio vigila y patrulla
	if str(v.get("oficio", [""])[0] if v.get("oficio", null) is Array else "").begins_with("policía"):
		asp["policia"] = true
		asp["trabajo"] = v.get("trabajo", null)
	return asp

# Personajes que se pueden llevar: UNA TABLA. Para añadir uno, una línea más (el glb en arte/mixamo/pj/<modelo>.glb;
# si no está, se salta). "nombre": nombre en el juego; "genero" f/h; "edad": la del personaje y su franja de vecino
# (< 16 niño, >= 65 mayor); "semilla": aspecto estable de la persona libre de repuesto (si falta el glb).
# El orden importa: es el de la pantalla de elegir y el reparto estable de los vecinos.
const JUGABLES := [
	{"modelo": "remy", "nombre": "Raúl", "genero": "h", "edad": 30, "semilla": 21},
	{"modelo": "james", "nombre": "Jaime", "genero": "h", "edad": 34, "semilla": 22},
	{"modelo": "leonard", "nombre": "Leo", "genero": "h", "edad": 45, "semilla": 23},
	{"modelo": "brian", "nombre": "Bruno", "genero": "h", "edad": 28, "semilla": 24},
	{"modelo": "adam", "nombre": "Adrián", "genero": "h", "edad": 32, "semilla": 25},
	{"modelo": "joe", "nombre": "Jorge", "genero": "h", "edad": 38, "semilla": 26},
	{"modelo": "louise", "nombre": "Luisa", "genero": "f", "edad": 33, "semilla": 31},
	{"modelo": "megan", "nombre": "Marta", "genero": "f", "edad": 26, "semilla": 32},
	{"modelo": "kate", "nombre": "", "genero": "f", "edad": 27, "semilla": 11},   # la de siempre: nombre de personas.json (Ana)
	{"modelo": "sophie", "nombre": "Sofía", "genero": "f", "edad": 24, "semilla": 33},
	{"modelo": "jody", "nombre": "Julia", "genero": "f", "edad": 30, "semilla": 34},
	{"modelo": "martha", "nombre": "Maribel", "genero": "f", "edad": 48, "semilla": 35},
	{"modelo": "boss", "nombre": "Benito", "genero": "h", "edad": 66, "semilla": 41},
	{"modelo": "granny", "nombre": "Rosario", "genero": "f", "edad": 72, "semilla": 42},
	{"modelo": "timmy", "nombre": "Tomás", "genero": "h", "edad": 12, "semilla": 43},
	# los de la calle (Mixamo, 15 nov 2026)
	{"modelo": "josh", "nombre": "José", "genero": "h", "edad": 27, "semilla": 51},
	{"modelo": "chad", "nombre": "Carlos", "genero": "h", "edad": 29, "semilla": 52},
	{"modelo": "alex", "nombre": "Álex", "genero": "h", "edad": 25, "semilla": 53},
	{"modelo": "david", "nombre": "Dani", "genero": "h", "edad": 36, "semilla": 54},
	{"modelo": "lewis", "nombre": "Luis", "genero": "h", "edad": 31, "semilla": 55},
	{"modelo": "pete", "nombre": "Pedro", "genero": "h", "edad": 40, "semilla": 56},
	{"modelo": "elizabeth", "nombre": "Elisa", "genero": "f", "edad": 35, "semilla": 61},
	{"modelo": "michelle", "nombre": "Miriam", "genero": "f", "edad": 29, "semilla": 62},
	{"modelo": "jackie", "nombre": "Jacinta", "genero": "f", "edad": 31, "semilla": 63},
	{"modelo": "suzie", "nombre": "Susana", "genero": "f", "edad": 23, "semilla": 64},
	{"modelo": "amy", "nombre": "Alba", "genero": "f", "edad": 12, "semilla": 65},   # la niña
]
const MODELO_DEFECTO := "kate"
# el que lleva la jugadora: no sale entre los vecinos
static var modelo_jugador := MODELO_DEFECTO

static func jugable(modelo: String) -> Dictionary:
	for j in JUGABLES:
		if j["modelo"] == modelo:
			return j
	return {}

# los jugables con modelo; si no hay NINGUNO (sin arte/mixamo), todos: se ven con la persona libre de repuesto
static func jugables_disponibles() -> Array:
	var ok := JUGABLES.filter(func(j): return PersonaAnimada.disponible(str(j["modelo"])))
	return ok if not ok.is_empty() else JUGABLES.duplicate()

static func nombre_de(modelo: String, base: Dictionary) -> String:
	var n := str(jugable(modelo).get("nombre", ""))
	return n if n != "" else str(base.get("name", "Ana"))

static func aspecto_jugador(base: Dictionary, modelo := MODELO_DEFECTO) -> Dictionary:
	var j := jugable(modelo)
	if j.is_empty():
		j = jugable(MODELO_DEFECTO)
	var camisa := Color.html(str(base.get("shirt", "#ff8a5b")))
	# "modelo": un personaje de Mixamo (arte/mixamo/, fuera del repo); si no está, una Persona del paquete libre
	var asp := {"genero": str(j["genero"]), "edad": int(j.get("edad", base.get("age", 27))), "semilla": int(j.get("semilla", 11)),
		"modelo": str(j["modelo"]), "camisa": camisa,
		"ropa": {"variante": 0, "arriba": camisa, "abajo": Color.html(str(base.get("pants", "#3d405b")))}}
	if j["modelo"] == MODELO_DEFECTO:
		asp["edad"] = int(base.get("age", 27))
		asp["piel"] = 1
		asp["pelo"] = "castano"
	return asp

static func crear(camisa: Color, _piel: Color, esc := 1.0, asp := {}) -> Dictionary:
	var raiz := Node3D.new()
	var cuerpo := Node3D.new()
	raiz.add_child(cuerpo)
	if _malla == null:
		_malla = CapsuleMesh.new()
		_malla.radius = 0.25
		_malla.height = 1.66
		_malla.radial_segments = 8
		_malla.rings = 3
	var mc := MeshInstance3D.new()
	mc.mesh = _malla
	mc.material_override = _mat(camisa)
	mc.position.y = 0.83
	mc.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	cuerpo.add_child(mc)
	cuerpo.scale = Vector3.ONE * esc
	return {"nodo": raiz, "cuerpo": cuerpo, "asp": asp, "esc": esc}

# la persona con esqueleto (cara). Origen en el suelo; mira a -Z (el holder de Actor la gira para que mire a +Z)
static func persona(asp: Dictionary) -> Node3D:
	var mod := str(asp.get("modelo", ""))
	if mod == "":
		mod = modelo_mixamo(asp)
	if PersonaAnimada.disponible(mod) and PersonaAnimada.listo(mod):
		_preparar_pistas(mod)
		var pm := PersonaAnimada.new(mod)
		pm.set_aspecto(asp)
		return pm
	var p: Node3D = PERSONA.instantiate()
	p.set_aspecto(asp)   # antes de add_child: el aspecto es estable
	if PersonaAnimada.disponible(mod):
		# web: su paquete aún no ha llegado. Se pide y, mientras, la persona libre de repuesto; quien la monta
		# (Actor, la pantalla de elegir) la cambia al llegar: ver esperando() y Paquetes.pedir(…, al_llegar)
		p.set_meta("espera", PersonaAnimada.paquete(mod))
		Paquetes.pedir(PersonaAnimada.paquete(mod))
	return p

## paquete que espera esta persona de repuesto para cambiarse por la de verdad ("" si ya es la de verdad)
static func esperando(p: Node) -> String:
	return str(p.get_meta("espera", "")) if p != null and is_instance_valid(p) else ""

# Las animaciones compartidas (las de remy.glb) apuntan a «Remy/Skeleton3D», pero los pj/*.glb traen
# «Armature/Skeleton3D»: se quedaban en pose T y llenaban la consola de avisos. Una vez por modelo, antes de
# montarlo, se cambia en la escena guardada en PersonaAnimada el nombre del nodo del esqueleto al de las pistas.
# Solo actúa si la ruta de las pistas no existe en el modelo: si PersonaAnimada reescribe las rutas, no hace nada.
static var _pistas_ok := {}
static func _preparar_pistas(m: String) -> void:
	if _pistas_ok.has(m) or PersonaAnimada.MODELOS.has(m):
		return
	_pistas_ok[m] = true
	var lib := PersonaAnimada._libreria()
	if not lib.has_animation("parado") or lib.get_animation("parado").get_track_count() == 0:
		return
	var ruta := NodePath(lib.get_animation("parado").track_get_path(0).get_concatenated_names())
	var esc: PackedScene = PersonaAnimada._cargar(m)
	var r := esc.instantiate()
	var sks := r.find_children("*", "Skeleton3D", true, false)
	if ruta.get_name_count() == 2 and not r.has_node(ruta) and sks.size() == 1 and sks[0].get_parent().get_parent() == r \
			and not r.has_node(NodePath(ruta.get_name(0))):
		sks[0].get_parent().name = ruta.get_name(0)
		var nueva := PackedScene.new()
		if nueva.pack(r) == OK:
			PersonaAnimada._escenas[m] = nueva
	r.free()

# personaje de Mixamo para un vecino, estable (sale de su semilla), según género y edad (franjas de JUGABLES).
# Nunca el que lleva la jugadora. "" si no hay ninguno que encaje.
static func modelo_mixamo(asp: Dictionary) -> String:
	var edad := int(asp.get("edad", 30))
	var g := "f" if str(asp.get("genero", "h")) == "f" else "h"
	var sem := int(asp.get("semilla", 1))
	var franja := _franja(edad)
	var ok: Array = []
	for j in JUGABLES:
		var m := str(j["modelo"])
		if j["genero"] == g and _franja(int(j["edad"])) == franja and m != modelo_jugador and PersonaAnimada.disponible(m):
			ok.append(m)
	return "" if ok.is_empty() else str(ok[sem % ok.size()])

static func _franja(edad: int) -> int:
	return 0 if edad < 16 else (2 if edad >= 65 else 1)

static func _mat(c: Color) -> StandardMaterial3D:
	var k := c.to_html()
	if not _mats.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = 0.9
		_mats[k] = m
	return _mats[k]
