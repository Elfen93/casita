extends Node3D
## Muestra GD-9: tres manzanas con el catálogo de ciudad (centro con bloques y bajos, adosados de Los Pinares, polígono).
## Escritorio: xvfb-run godot --path godot --resolution 900x700 res://arte/muestra_ciudad.tscn -- foto=/ruta.png vista=general|pie|casco|pinares|poligono|pie_casco|pie_pinares|pie_poligono
const PERSONA := preload("res://arte/personaje/persona.tscn")
const ZONAS := {"casco": 0.0, "pinares": 80.0, "poligono": 160.0}
var indice: Dictionary
var camara: Camera3D
var _mats := {}

func _mat(c: Color) -> StandardMaterial3D:
	var k := c.to_html()
	if not _mats.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = 0.95
		_mats[k] = m
	return _mats[k]

func _caja(tam: Vector3, pos: Vector3, c: Color) -> void:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.position = pos
	mi.material_override = _mat(c)
	add_child(mi)

func pieza(id: String, pos: Vector3, giro := 0.0, variante := 0) -> Node3D:
	var d: Dictionary = indice[id]
	var vs: Array = d.get("variantes", [d.escena])
	var n: Node3D = (load(vs[variante % vs.size()]) as PackedScene).instantiate()
	n.position = pos
	n.rotation_degrees.y = giro
	add_child(n)
	return n

func persona(aspecto: Dictionary, pos: Vector3, giro: float) -> void:
	var p = PERSONA.instantiate()
	add_child(p)
	p.set_aspecto(aspecto)
	p.position = pos
	p.rotation_degrees.y = giro
	p.anim("parado")

# fila de edificios a un lado de la calle. lado=+1: sur (z>0, fachada hacia -Z); lado=-1: norte (se gira 180)
func fila(ids: Array, x0: float, z_frente: float, lado: int, hueco := 0.3, v0 := 0) -> void:
	var x := x0
	var i := 0
	for id in ids:
		var d: Dictionary = indice[id]
		var w: float = d.huella[0]
		var f: float = d.huella[1]
		pieza(id, Vector3(x + w / 2.0, 0.0, lado * (z_frente + f / 2.0)), 0.0 if lado > 0 else 180.0, v0 + i)
		x += w + hueco
		i += 1

func calle(x0: float, n: int, cruce_en := -1, cebra_en := -1) -> void:
	for i in n:
		var id := "calle_recta"
		if i == cruce_en: id = "calle_cruce"
		elif i == cebra_en: id = "calle_paso_cebra"
		pieza(id, Vector3(x0 + 3.0 + 6.0 * i, 0, 0))
	# aceras de 3 m a cada lado
	var largo := 6.0 * n
	_caja(Vector3(largo, 0.15, 3.0), Vector3(x0 + largo / 2.0, 0.075, 4.5), Color("8f8c84"))
	_caja(Vector3(largo, 0.15, 3.0), Vector3(x0 + largo / 2.0, 0.075, -4.5), Color("8f8c84"))

func farolas(x0: float, largo: float, sep := 18.0) -> void:
	var x := x0 + 6.0
	while x < x0 + largo - 3.0:
		pieza("farola_curva", Vector3(x, 0.15, 3.3), 0.0)
		pieza("farola_curva", Vector3(x + 9.0, 0.15, -3.3), 180.0)
		x += sep

func coches(x0: float) -> void:
	pieza("coche_berlina", Vector3(x0 + 14, 0.12, 1.5), -90.0, 0)
	pieza("coche_utilitario", Vector3(x0 + 34, 0.12, 1.5), -90.0, 1)
	pieza("coche_suv", Vector3(x0 + 24, 0.12, -1.5), 90.0, 2)
	pieza("coche_taxi", Vector3(x0 + 44, 0.12, -1.5), 90.0, 0)

func _ready() -> void:
	var f := FileAccess.open("res://arte/ciudad/INDICE.json", FileAccess.READ)
	indice = JSON.parse_string(f.get_as_text())["piezas"]
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("a9c0d2")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.82, 0.80, 0.76)
	env.ambient_light_energy = 0.5
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_exposure = 0.95
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sol := DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.directional_shadow_max_distance = 400
	sol.rotation_degrees = Vector3(-50, 25, 0)
	sol.light_energy = 0.5
	add_child(sol)
	_caja(Vector3(300, 0.2, 150), Vector3(110, -0.1, 0), Color("8c8676"))
	# --- El Casco: bloques con bajos, calle corta con paso de cebra y cruce
	var a := ZONAS.casco
	calle(a, 10, 9, 4)
	farolas(a, 60.0)
	fila(["bloque_c", "bloque_a", "bloque_f", "bloque_d", "bloque_e_ancho"], a + 1.0, 6.0, 1, 0.2, 0)
	fila(["bloque_h", "bloque_g", "bloque_b", "bloque_i"], a + 1.0, 6.0, -1, 0.2, 1)
	coches(a)
	persona({"genero": "f", "edad": 34, "piel": 2, "pelo": "castano", "semilla": 7, "ropa": 2}, Vector3(a + 12.0, 0.15, 5.0), 180.0)
	persona({"genero": "h", "edad": 52, "piel": 1, "pelo": "canoso", "semilla": 3}, Vector3(a + 15.5, 0.15, 4.2), 90.0)
	persona({"genero": "f", "edad": 24, "piel": 3, "pelo": "negro", "semilla": 11}, Vector3(a + 26.5, 0.15, -4.5), -90.0)
	# --- Los Pinares: adosados y chalets con jardín delantero
	var b := ZONAS.pinares
	calle(b, 10)
	farolas(b, 60.0)
	fila(["casa_h", "casa_i", "casa_a", "casa_c", "casa_j"], b + 1.0, 10.0, 1, 0.8, 0)
	fila(["casa_p", "casa_q", "casa_o", "casa_g"], b + 1.0, 10.0, -1, 0.8, 1)
	for x in range(0, 60, 9):
		pieza("valla_pared", Vector3(b + 4.0 + x, 0.0, 9.0), 0.0, 0)
	coches(b)
	persona({"genero": "h", "edad": 41, "piel": 2, "pelo": "negro", "semilla": 5}, Vector3(b + 10.0, 0.15, 5.0), 180.0)
	persona({"genero": "f", "edad": 9, "piel": 2, "pelo": "rubio", "semilla": 2}, Vector3(b + 11.0, 0.15, 5.4), 180.0)
	# --- Polígono: naves con patio delantero
	var c := ZONAS.poligono
	calle(c, 10)
	farolas(c, 60.0, 24.0)
	fila(["nave_h", "nave_s", "nave_g", "nave_oficinas_a"], c + 1.0, 10.0, 1, 1.5, 0)
	fila(["nave_i", "nave_p", "nave_e", "silo_deposito"], c + 1.0, 10.0, -1, 1.5, 1)
	pieza("camion", Vector3(c + 20, 0.12, 1.5), -90.0, 0)
	pieza("furgoneta_reparto", Vector3(c + 38, 0.12, -1.5), 90.0, 1)
	pieza("coche_berlina", Vector3(c + 48, 0.12, 1.5), -90.0, 2)
	pieza("contenedor_maritimo", Vector3(c + 57, 0.0, 9.0), 0.0, 0)
	pieza("contenedor_maritimo", Vector3(c + 57, 0.0, 12.0), 0.0, 1)
	persona({"genero": "h", "edad": 36, "piel": 2, "pelo": "negro", "semilla": 8, "ropa": 3}, Vector3(c + 14.0, 0.15, 5.0), 180.0)
	# señales en las esquinas
	pieza("semaforo", Vector3(a + 54.5, 0.15, 3.3), 180.0)
	pieza("senal_stop", Vector3(a + 3.0, 0.15, -3.3), 0.0)
	_camara()
	var vista := "general"
	var ruta := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("foto="): ruta = arg.substr(5)
		if arg.begins_with("vista="): vista = arg.substr(6)
	_vista(vista)
	if ruta != "":
		await get_tree().create_timer(2.5).timeout
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(ruta)
		get_tree().quit()

func _camara() -> void:
	camara = Camera3D.new()
	camara.fov = 45
	camara.far = 600
	add_child(camara)
	camara.current = true

func _mira(desde: Vector3, a: Vector3) -> void:
	camara.position = desde
	camara.look_at(a, Vector3.UP)

func _vista(v: String) -> void:
	var a_x := 0.0
	match v:
		"general": _mira(Vector3(110, 120, -150), Vector3(110, 0, 5))
		"casco": _mira(Vector3(-22, 26, -26), Vector3(34, 2, 4))
		"pinares": _mira(Vector3(70, 22, -22), Vector3(120, 2, 6))
		"poligono": _mira(Vector3(138, 26, -26), Vector3(194, 2, 4))
		"pie", "pie_casco": _mira(Vector3(4, 1.7, 4.8), Vector3(34, 3.5, 7))
		"pie_pinares": _mira(Vector3(84, 1.7, 4.8), Vector3(114, 2.5, 8))
		"pie_poligono": _mira(Vector3(164, 1.7, 4.8), Vector3(194, 2.5, 8))
		"pie_vertical": _mira(Vector3(a_x + 2.0, 1.7, 4.6), Vector3(a_x + 30.0, 2.6, 5.6))
