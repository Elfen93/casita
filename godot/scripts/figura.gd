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
	return {"genero": "f" if str(v.get("g", "m")) == "f" else "h", "edad": int(v.get("edad", 35)),
		"semilla": hs % 100000 + 1, "ropa": {"arriba": camisa}, "camisa": camisa}

static func aspecto_jugador(base: Dictionary) -> Dictionary:
	var camisa := Color.html(str(base.get("shirt", "#ff8a5b")))
	return {"genero": "f", "edad": int(base.get("age", 27)), "piel": 1, "pelo": "castano", "semilla": 11,
		"ropa": {"variante": 0, "arriba": camisa, "abajo": Color.html(str(base.get("pants", "#3d405b")))}, "camisa": camisa}

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
	var p: Node3D = PERSONA.instantiate()
	p.set_aspecto(asp)   # antes de add_child: el aspecto es estable
	return p

static func _mat(c: Color) -> StandardMaterial3D:
	var k := c.to_html()
	if not _mats.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = 0.9
		_mats[k] = m
	return _mats[k]
