extends Node3D
## Escena de muestra del canal de arte libre: calle con dos bloques, farola, banco, árbol y un rincón de bar con 6 personas.
## Web: la URL admite #noche y #cerca (p. ej. index.html#noche,cerca). Toque: mitad izquierda = día/noche, mitad derecha = plano de juego/cercano.

const PERSONA := preload("res://arte/personaje/persona.tscn")
var noche := false
var cerca := false
var acera := false   # toma cercana de la acera (gente hablando y paseando)
var sol: DirectionalLight3D
var entorno: Environment
var cielo: ProceduralSkyMaterial
var farolas: Array = []
var luces_bar: Array = []
var camara: Camera3D
var pivote: Node3D
var caminantes: Array = []   # {p, a, b, v, t}
var _mat_cache := {}

func _ready() -> void:
	var hash_url := ""
	if OS.has_feature("web"):
		hash_url = str(JavaScriptBridge.eval("location.hash"))
	var ua := OS.get_cmdline_user_args()
	noche = hash_url.contains("noche") or "noche" in ua
	cerca = hash_url.contains("cerca") or "cerca" in ua
	acera = hash_url.contains("acera") or "acera" in ua
	_entorno()
	_calle()
	_bar()
	_gente()
	_camara()
	_aplicar_hora()
	for a in ua:   # solo para pruebas en escritorio: --foto=/ruta.png
		if a.begins_with("foto="):
			var ruta: String = a.substr(5)
			await get_tree().create_timer(3.0).timeout
			await RenderingServer.frame_post_draw
			get_viewport().get_texture().get_image().save_png(ruta)
			get_tree().quit()

func _m(c: Color, rug := 0.9) -> StandardMaterial3D:
	var k := c.to_html() + str(rug)
	if not _mat_cache.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = rug
		_mat_cache[k] = m
	return _mat_cache[k]

func _caja(tam: Vector3, pos: Vector3, c: Color, padre: Node = null) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.position = pos
	mi.material_override = _m(c)
	(padre if padre != null else self).add_child(mi)
	return mi

func _entorno() -> void:
	entorno = Environment.new()
	entorno.background_mode = Environment.BG_SKY
	var sk := Sky.new()
	cielo = ProceduralSkyMaterial.new()
	sk.sky_material = cielo
	entorno.sky = sk
	entorno.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	entorno.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	entorno.tonemap_exposure = 0.85
	var we := WorldEnvironment.new()
	we.environment = entorno
	add_child(we)
	sol = DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
	sol.directional_shadow_max_distance = 70.0
	sol.shadow_bias = 0.05
	sol.shadow_normal_bias = 1.2
	sol.rotation_degrees = Vector3(-58, 160, 0)   # sol desde atrás a la derecha: sombras hacia la cámara
	add_child(sol)

func _aplicar_hora() -> void:
	var dia := 0.0 if noche else 1.0
	sol.light_energy = lerpf(0.15, 1.0, dia)
	sol.light_color = Color(0.5, 0.6, 0.95).lerp(Color(1.0, 0.95, 0.85), dia)
	entorno.ambient_light_color = Color(0.36, 0.40, 0.62).lerp(Color(0.80, 0.78, 0.74), dia)
	entorno.ambient_light_energy = lerpf(0.7, 0.8, dia)
	cielo.sky_top_color = Color(0.03, 0.05, 0.14).lerp(Color(0.33, 0.55, 0.86), dia)
	cielo.sky_horizon_color = Color(0.10, 0.12, 0.22).lerp(Color(0.78, 0.87, 0.95), dia)
	cielo.ground_horizon_color = cielo.sky_horizon_color
	cielo.ground_bottom_color = cielo.sky_horizon_color.darkened(0.3)
	Fachada.set_noche(0.0 if not noche else 1.0)
	for l in farolas:
		l.light_energy = 0.0 if not noche else 2.2
	for l in luces_bar:
		l.light_energy = 0.5 if not noche else 1.6

# ------------------------------------------------------------------ calle
func _calle() -> void:
	_caja(Vector3(80, 0.2, 50), Vector3(0, -0.1, 6), Color("5a5b60"))                 # asfalto
	_caja(Vector3(80, 0.16, 5.0), Vector3(0, 0.0, -1.5), Color("c9c4b8"))             # acera (z -4 .. 1)
	_caja(Vector3(80, 0.2, 0.2), Vector3(0, 0.0, 1.1), Color("a8a49a"))               # bordillo
	for i in range(-10, 10):                                                           # línea discontinua
		_caja(Vector3(2.0, 0.02, 0.15), Vector3(i * 4.0, 0.01, 7.0), Color("e8e4d4"))
	# dos bloques de pisos con la fachada nueva
	var bloque := preload("res://arte/ciudad/bloque_pisos.tscn")
	var b1 := bloque.instantiate()
	b1.plantas = 5; b1.ancho = 13.0; b1.fondo = 12.0; b1.color = Color("d6b48a"); b1.semilla = 2.0
	b1.position = Vector3(-12.5, 0, -10.0)
	add_child(b1)
	var b2 := bloque.instantiate()
	b2.plantas = 4; b2.ancho = 12.0; b2.fondo = 12.0; b2.color = Color("c4cdb8"); b2.semilla = 5.0
	b2.position = Vector3(-0.5, 0, -10.0)
	add_child(b2)
	# casa baja a la derecha de la calle
	var cb := preload("res://arte/ciudad/casa_baja.tscn").instantiate()
	cb.position = Vector3(26.0, 0, -10.0)
	cb.ancho = 8.0; cb.fondo = 12.0
	add_child(cb)
	# farola, banco, árbol, papelera, coche
	var f := preload("res://arte/ciudad/objetos/farola.tscn").instantiate()
	f.position = Vector3(-3.0, 0.08, 0.6)
	f.rotation.y = PI / 2
	add_child(f)
	farolas.append(f.get_node("Luz"))
	var banco := preload("res://arte/ciudad/objetos/banco_parque.tscn").instantiate()
	banco.position = Vector3(-6.2, 0.08, -3.0)
	banco.rotation.y = PI   # mira a la calle (+Z)
	add_child(banco)
	var arbol := preload("res://arte/ciudad/objetos/arbol.tscn").instantiate()
	arbol.position = Vector3(-8.5, 0.08, 0.2)
	add_child(arbol)
	var pap := preload("res://arte/ciudad/objetos/papelera.tscn").instantiate()
	pap.position = Vector3(-4.6, 0.08, 0.5)
	add_child(pap)
	var coche = load("res://arte/muebles/modelos/ciudad/car_sedan.gltf").instantiate()
	coche.scale = Vector3.ONE * 4.6
	coche.position = Vector3(8.0, 0.0, 4.6)
	coche.rotation.y = PI / 2
	add_child(coche)
	var coche2 = load("res://arte/muebles/modelos/ciudad/car_hatchback.gltf").instantiate()
	coche2.scale = Vector3.ONE * 4.6
	coche2.position = Vector3(-13.0, 0.0, 4.6)
	coche2.rotation.y = -PI / 2
	add_child(coche2)

# ------------------------------------------------------------------ bar (sin paredes: corte para ver el interior)
func _bar() -> void:
	var o := Vector3(12.5, 0, -4.0)  # centro del rincón
	_caja(Vector3(11, 0.18, 8.4), o + Vector3(0, 0.0, -1.0), Color("a77b4f"))            # suelo de madera (z -5.2 .. 3.2)
	_caja(Vector3(11, 3.0, 0.3), o + Vector3(0, 1.5, -5.3), Color("d8cdb8"))             # pared del fondo
	_caja(Vector3(0.3, 3.0, 8.4), o + Vector3(5.6, 1.5, -1.0), Color("cfc4ae"))          # pared lateral
	_caja(Vector3(11, 0.9, 0.2), o + Vector3(0, 0.55, 3.3), Color("6d4a35"))              # murete bajo en el frente
	var barra = load("res://arte/muebles/barra.tscn")
	for i in 5:
		var b = barra.instantiate()
		b.position = o + Vector3(-2.6 + i * 1.0, 0.09, -3.0)
		b.rotation.y = PI                       # cliente hacia +Z (cámara)
		add_child(b)
	var estante = load("res://arte/muebles/estante_botellas.tscn")
	for i in 3:
		var e = estante.instantiate()
		e.position = o + Vector3(-2.0 + i * 1.0, 0.09, -4.9)
		e.rotation.y = PI
		add_child(e)
	var cafe = load("res://arte/muebles/cafetera.tscn").instantiate()
	cafe.position = o + Vector3(-1.6, 1.12, -3.0)
	cafe.rotation.y = PI
	add_child(cafe)
	var grifo = load("res://arte/muebles/grifo_cerveza.tscn").instantiate()
	grifo.position = o + Vector3(0.0, 1.12, -3.1)
	grifo.rotation.y = PI
	add_child(grifo)
	var coct = load("res://arte/muebles/coctelera.tscn").instantiate()
	coct.position = o + Vector3(1.0, 1.12, -3.0)
	add_child(coct)
	var tab = load("res://arte/muebles/taburete.tscn")
	for i in 3:
		var t = tab.instantiate()
		t.position = o + Vector3(-2.0 + i * 1.4, 0.09, -1.9)
		add_child(t)
	var mesa = load("res://arte/muebles/mesa_bar.tscn").instantiate()
	mesa.position = o + Vector3(2.8, 0.09, 0.2)
	add_child(mesa)
	var silla = load("res://arte/muebles/silla.tscn")
	var s1 = silla.instantiate()
	s1.position = o + Vector3(2.8, 0.09, 0.2 + 0.78)
	add_child(s1)               # mira a -Z, hacia la mesa
	var s2 = silla.instantiate()
	s2.position = o + Vector3(2.8, 0.09, 0.2 - 0.78)
	s2.rotation.y = PI
	add_child(s2)
	var tp = load("res://arte/muebles/tragaperras.tscn").instantiate()
	tp.position = o + Vector3(4.9, 0.09, -2.4)
	tp.rotation.y = PI / 2 + PI   # frente hacia -X... gira para mirar al interior
	tp.rotation.y = -PI / 2
	add_child(tp)
	for p in [Vector3(-1.5, 2.6, -1.0), Vector3(2.5, 2.6, 0.0)]:
		var l := OmniLight3D.new()
		l.light_color = Color("ffd9a8")
		l.omni_range = 7.0
		l.position = o + p
		add_child(l)
		luces_bar.append(l)

# ------------------------------------------------------------------ gente
func _persona(asp: Dictionary, pos: Vector3, nombre: String) -> Persona:
	var p: Persona = PERSONA.instantiate()
	add_child(p)
	p.position = pos
	p.set_aspecto(asp)
	p.set_nombre(nombre)
	return p

func _gente() -> void:
	var o := Vector3(12.5, 0, -4.0)
	# 1. camina por la acera de un lado a otro
	var c1 := _persona({"genero": "f", "edad": 34, "piel": 1, "pelo": "negro", "ropa": {"variante": 0, "arriba": Color("d9a441")}, "semilla": 11}, Vector3(-12, 0.08, -0.4), "Marisa")
	c1.anim("andar")
	caminantes.append({"p": c1, "a": Vector3(-12, 0.08, -0.4), "b": Vector3(4, 0.08, -0.4), "v": 1.35, "t": 0.0, "v_anim": 1.0})
	# 2. criatura: corre por la acera en sentido contrario
	var c2 := _persona({"genero": "m", "edad": 7, "piel": 2, "pelo": "castano", "ropa": {"variante": 2, "arriba": Color("3f8f6a")}, "semilla": 4}, Vector3(3, 0.08, -2.2), "Nico")
	c2.anim("correr", 0.9)
	caminantes.append({"p": c2, "a": Vector3(3, 0.08, -2.2), "b": Vector3(-5, 0.08, -2.2), "v": 2.2, "t": 0.0, "v_anim": 0.9})
	# 3. sentada en el bar, bebiendo (silla s1, mira a -Z hacia la mesa)
	var c3 := _persona({"genero": "m", "edad": 52, "piel": 0, "pelo": "canoso", "ropa": {"variante": 1, "arriba": Color("8a3f4a")}, "semilla": 5}, o + Vector3(2.8, 0.09, 0.2 + 0.74), "Pilar")
	c3.anim("sentado", 1.0, "beber")
	c3.set_altura_asiento(0.43)
	c3.position.y = 0.09
	# 4. tras la barra, usando la cafetera (mira a +Z, hacia los clientes)
	var c4 := _persona({"genero": "h", "edad": 41, "piel": 3, "pelo": "negro", "ropa": {"variante": 3, "arriba": Color("e8e6df"), "abajo": Color("26282b")}, "semilla": 8}, o + Vector3(-1.6, 0.09, -3.95), "Manolo")
	c4.anim("usar")
	c4.mirar_a(c4.global_position + Vector3(0, 0, 1))
	# 5 y 6. dos hablando en la acera, uno frente al otro
	var p5 := Vector3(-1.0, 0.08, -1.6)
	var c5 := _persona({"genero": "h", "edad": 68, "piel": 1, "pelo": "blanco", "ropa": {"variante": 2, "arriba": Color("4a6a8a")}, "semilla": 21}, p5, "Paco")
	var c6 := _persona({"genero": "f", "edad": 27, "piel": 4, "pelo": "castano", "ropa": {"variante": 1, "arriba": Color("c8503f")}, "semilla": 6}, p5 + Vector3(1.2, 0, 0), "Aisha")
	c5.anim("hablar")
	c6.anim("hablar", 0.8)
	c5.mirar_a(c6.global_position)
	c6.mirar_a(c5.global_position)

func _process(dt: float) -> void:
	for c in caminantes:
		c["t"] += dt * c["v"]
		var largo: float = (c["b"] - c["a"]).length()
		var u: float = fmod(c["t"], largo * 2.0)
		var yendo := u < largo
		var d: float = u if yendo else largo * 2.0 - u
		var pos: Vector3 = (c["a"] as Vector3).lerp(c["b"], d / largo)
		var p: Persona = c["p"]
		p.position = pos
		var destino: Vector3 = c["b"] if yendo else c["a"]
		p.mirar_a(destino)

# ------------------------------------------------------------------ cámara
func _camara() -> void:
	pivote = Node3D.new()
	add_child(pivote)
	camara = Camera3D.new()
	camara.keep_aspect = Camera3D.KEEP_WIDTH
	camara.fov = 46.0
	camara.near = 1.0
	camara.far = 400.0
	pivote.add_child(camara)
	_poner_camara()

func _poner_camara() -> void:
	# misma óptica que el juego: KEEP_WIDTH, fov 46, inclinación 55°. «juego» = distancia 30; «cerca» = distancia 11.
	var dist := 11.5 if cerca else 28.0
	if acera: dist = 9.0
	var inclin := deg_to_rad(55.0)
	pivote.position = Vector3(14.0, 0.9, -4.0) if cerca else Vector3(6.0, 0.0, -1.0)
	if acera: pivote.position = Vector3(-1.5, 0.8, -1.2)
	pivote.rotation.y = deg_to_rad(-14.0) if not cerca else deg_to_rad(-8.0)
	camara.position = Vector3(0, sin(inclin) * dist, cos(inclin) * dist)
	camara.look_at(pivote.global_position, Vector3.UP)

func _input(ev: InputEvent) -> void:
	if ev is InputEventScreenTouch and ev.pressed:
		var w := get_viewport().get_visible_rect().size.x
		if ev.position.x < w * 0.5:
			noche = not noche
			_aplicar_hora()
		else:
			cerca = not cerca
			_poner_camara()
	elif ev is InputEventMouseButton and ev.pressed and not OS.has_feature("web"):
		var w2 := get_viewport().get_visible_rect().size.x
		if ev.position.x < w2 * 0.5:
			noche = not noche
			_aplicar_hora()
		else:
			cerca = not cerca
			_poner_camara()
