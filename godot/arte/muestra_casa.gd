extends Node3D
## Muestra GD-7: un pisito amueblado (salón, comedor, dormitorio, baño, cocina) con personas para la escala.
## Escritorio: godot --path godot res://arte/muestra_casa.tscn -- foto=/ruta.png [vista=planta|salon|bano|cocina|dorm|comedor|todo]
const PERSONA := preload("res://arte/personaje/persona.tscn")
var _mats := {}
var camara: Camera3D

func _m(c: Color, rug := 0.9) -> StandardMaterial3D:
	var k := c.to_html() + str(rug)
	if not _mats.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = rug
		_mats[k] = m
	return _mats[k]

func _caja(tam: Vector3, pos: Vector3, c: Color) -> void:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.position = pos
	mi.material_override = _m(c)
	add_child(mi)

func poner(tipo: String, pos: Vector3, giro := 0.0, padre: Node = null) -> Node3D:
	var n: Node3D = (load("res://arte/muebles/%s.tscn" % tipo) as PackedScene).instantiate()
	n.position = pos
	n.rotation_degrees.y = giro
	(padre if padre != null else self).add_child(n)
	return n

func persona(aspecto: Dictionary, pos: Vector3, giro: float, anim := "parado", altura_asiento := -1.0) -> Persona:
	var p: Persona = PERSONA.instantiate()
	add_child(p)
	p.set_aspecto(aspecto)
	p.position = pos
	p.rotation_degrees.y = giro
	if altura_asiento > 0:
		p.anim("sentado")
		p.set_altura_asiento(altura_asiento)
	else:
		p.anim(anim)
	return p

func _ready() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("9fb6c8")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.82, 0.80, 0.76)
	env.ambient_light_energy = 0.55
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_exposure = 0.9
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sol := DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.rotation_degrees = Vector3(-55, -25, 0)
	sol.light_energy = 0.45
	add_child(sol)
	# suelos por estancia y muro del fondo
	_caja(Vector3(8.0, 0.1, 4.0), Vector3(-2.0, -0.05, 1.0), Color("a8895e"))    # salón (x -6..2, z -1..3)  -> parquet
	_caja(Vector3(4.0, 0.1, 4.0), Vector3(4.0, -0.05, 1.0), Color("b8ac98"))     # comedor
	_caja(Vector3(5.0, 0.1, 4.0), Vector3(-3.5, -0.05, 5.0), Color("a8895e"))    # dormitorio (x -6..-1, z 3..7)
	_caja(Vector3(3.0, 0.1, 4.0), Vector3(0.5, -0.05, 5.0), Color("7fa3af"))     # baño (x -1..2)
	_caja(Vector3(4.0, 0.1, 4.0), Vector3(4.0, -0.05, 5.0), Color("bfb288"))     # cocina (x 2..6)
	_caja(Vector3(12.0, 2.6, 0.15), Vector3(0, 1.3, 7.07), Color("efe9dd"))       # muro del fondo
	_caja(Vector3(0.15, 2.6, 8.0), Vector3(-6.07, 1.3, 3.0), Color("efe9dd"))     # muro izquierdo
	_caja(Vector3(0.1, 2.6, 4.0), Vector3(-1.0, 1.3, 5.0), Color("e4ddcf"))      # tabique dormitorio|baño
	_caja(Vector3(0.1, 2.6, 4.0), Vector3(2.0, 1.3, 5.0), Color("e4ddcf"))       # tabique baño|cocina
	# ---- dormitorio (frente -Z: todo mira a la cámara)
	poner("cama", Vector3(-3.5, 0, 6.0))
	poner("mesilla", Vector3(-2.55, 0, 6.7))
	poner("lampara_mesa", Vector3(-2.55, 0.5, 6.7))
	poner("mesilla", Vector3(-4.5, 0, 6.7))
	poner("armario", Vector3(-1.65, 0, 6.65))
	poner("espejo", Vector3(-5.7, 0, 6.0), 0.0)
	poner("alfombra", Vector3(-3.5, 0, 4.2)).scale = Vector3(0.8, 1, 0.8)
	var pa := poner("planta", Vector3(-5.6, 0, 3.4))
	# ---- baño
	poner("vater", Vector3(-0.2, 0, 6.5))
	poner("lavabo", Vector3(0.8, 0, 6.7))
	poner("lavadora", Vector3(1.6, 0, 6.65))
	poner("cubo_basura", Vector3(-0.5, 0, 5.2))
	poner("ducha", Vector3(-0.4, 0, 3.6), 0.0)
	# ---- cocina
	poner("nevera", Vector3(2.45, 0, 6.65))
	poner("fregadero", Vector3(3.3, 0, 6.7))
	poner("cocina", Vector3(4.05, 0, 6.7))
	poner("estanteria", Vector3(5.4, 0, 6.8))
	poner("estanteria", Vector3(-5.2, 0, 3.6), -90.0)
	# ---- comedor
	var mesa := poner("mesa_comedor", Vector3(4.0, 0, 1.0))
	var sillas := [Vector3(-0.35, 0, -0.6), Vector3(0.35, 0, -0.6), Vector3(-0.35, 0, 0.6), Vector3(0.35, 0, 0.6)]
	for i in 4:
		poner("silla", sillas[i], 180.0 if i < 2 else 0.0, mesa)
	poner("escritorio", Vector3(5.2, 0, -0.4), 0.0)
	poner("silla", Vector3(5.2, 0, -1.05), 180.0)
	poner("planta", Vector3(2.4, 0, -0.4))
	# ---- salón (sofá a la izquierda mirando +X, tele a la derecha mirando -X)
	poner("alfombra", Vector3(-2.6, 0, 1.0), 90.0)
	var sofa := poner("sofa", Vector3(-4.8, 0, 1.0), -90.0)
	poner("mesa_baja", Vector3(-3.3, 0, 1.0), 90.0)
	poner("tele", Vector3(-0.8, 0, 1.0), 90.0)
	poner("sillon", Vector3(-2.6, 0, -0.5), 0.0)
	poner("sillon", Vector3(-2.6, 0, 2.5), 180.0)
	poner("lampara_pie", Vector3(-5.6, 0, 2.4))
	# ---- personas (1,70 m) para la escala
	persona({"genero": "f", "edad": 34, "piel": 2, "pelo": "castano", "semilla": 7}, Vector3(-3.5, 0, 4.8), 0.0)
	persona({"genero": "h", "edad": 40, "piel": 1, "pelo": "negro", "semilla": 3}, Vector3(-4.7, 0, 1.5), -90.0, "parado", 0.40)
	persona({"genero": "f", "edad": 30, "piel": 3, "pelo": "rubio", "semilla": 11}, Vector3(3.65, 0, 1.6), 0.0, "parado", 0.43)
	persona({"genero": "h", "edad": 28, "piel": 2, "pelo": "negro", "semilla": 5}, Vector3(0.8, 0, 6.2), 180.0)
	persona({"genero": "f", "edad": 45, "piel": 1, "pelo": "canoso", "semilla": 9}, Vector3(-0.2, 0, 6.5), 0.0, "parado", 0.42)
	if "sin" in OS.get_cmdline_user_args():
		for h in get_children():
			if h is Persona: h.visible = false
	_camara()
	var ua := OS.get_cmdline_user_args()
	var vista := "todo"
	var ruta := ""
	for a in ua:
		if a.begins_with("foto="): ruta = a.substr(5)
		if a.begins_with("vista="): vista = a.substr(6)
	_vista(vista)
	if ruta != "":
		await get_tree().create_timer(2.5).timeout
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(ruta)
		get_tree().quit()

func _camara() -> void:
	camara = Camera3D.new()
	camara.fov = 45
	add_child(camara)
	camara.current = true

func _mira(desde: Vector3, a: Vector3) -> void:
	camara.position = desde
	camara.look_at(a, Vector3.UP)

func _vista(v: String) -> void:
	match v:
		"planta": _mira(Vector3(0, 17, 0.5), Vector3(0, 0, 2.99))
		"salon": _mira(Vector3(-2.2, 3.4, -4.6), Vector3(-3.0, 0.6, 1.0))
		"bano": _mira(Vector3(0.9, 2.3, 2.6), Vector3(0.6, 0.8, 6.4))
		"cocina": _mira(Vector3(3.8, 2.6, 2.2), Vector3(3.8, 0.9, 6.5))
		"dorm": _mira(Vector3(-3.0, 3.2, 1.6), Vector3(-3.4, 0.7, 6.2))
		"comedor": _mira(Vector3(4.0, 3.2, -3.4), Vector3(4.0, 0.6, 1.0))
		_: _mira(Vector3(-0.5, 10.5, -7.5), Vector3(-0.2, 0.0, 3.2))
