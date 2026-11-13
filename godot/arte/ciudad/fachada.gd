class_name Fachada
extends RefCounted
## Material de fachada procedural (ventanas por plantas, portal, luces nocturnas) para cubos de edificio.
##   var mat = Fachada.material(Vector3(12, 15, 10), Color("d9b98c"))      # tamaño del cubo en metros
##   mesh_instance.material_override = mat
##   Fachada.set_noche(1.0)   # enciende las ventanas de todos los edificios (0 = día)
static var _mats: Array = []
static var _sombreador: Shader

static func material(tam: Vector3, color_muro: Color, alto_planta := 3.0, semilla := 1.0, portal := true, color_tejado := Color("6b4e45")) -> ShaderMaterial:
	if _sombreador == null:
		_sombreador = load("res://arte/ciudad/fachada.gdshader")
	var m := ShaderMaterial.new()
	m.shader = _sombreador
	m.set_shader_parameter("tam", tam)
	m.set_shader_parameter("color_muro", color_muro)
	m.set_shader_parameter("color_tejado", color_tejado)
	m.set_shader_parameter("alto_planta", alto_planta)
	m.set_shader_parameter("semilla", semilla)
	m.set_shader_parameter("planta_baja_portal", 1.0 if portal else 0.0)
	_mats.append(weakref(m))
	return m

static var _noche := 0.0
static func set_noche(v: float) -> void:
	_noche = v
	var vivos := []
	for w in _mats:
		var m = w.get_ref()
		if m != null:
			m.set_shader_parameter("noche", v)
			vivos.append(w)
	_mats = vivos
