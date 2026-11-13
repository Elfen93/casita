extends Node3D
# Casita 3D · prueba GD-1: La Ribera en 3D leída de data/*.json.
# Todo se construye desde código a partir de los datos (ciudad, lugares, barrio, personas, reglas).

const BARRIO := "ribera"
const MIN_POR_SEG := 1.5          # un día = 16 min reales a 1× (1440 / 960)
const VEL_ANDAR := 9.0            # casillas por segundo (visual)
const VEL_SALTO := 480.0          # minutos de juego por segundo mientras pasa el tiempo (dormir, etc.)
const DIAS := ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const PRECIO_BAR := 6
const PRECIO_SUPER := 12

class Cam:
	var nodo: Node3D
	var cuerpo: Node3D
	var ruta: Array = []
	var anda := false
	var fase := 0.0
	var vel := VEL_ANDAR
	func mover(paso: float) -> bool:
		# true cuando termina el camino
		if ruta.is_empty():
			anda = false
			return false
		var meta: Vector3 = ruta[0]
		var d: Vector3 = meta - nodo.position
		d.y = 0.0
		var l := d.length()
		anda = true
		if l <= paso:
			nodo.position = Vector3(meta.x, nodo.position.y, meta.z)
			ruta.pop_front()
			if ruta.is_empty():
				anda = false
				cuerpo.position.y = 0.0
				cuerpo.rotation.z = 0.0
				return true
			return false
		nodo.position += d / l * paso
		nodo.rotation.y = lerp_angle(nodo.rotation.y, atan2(d.x, d.z), 0.35)
		fase += paso * 2.2
		cuerpo.position.y = absf(sin(fase)) * 0.22
		cuerpo.rotation.z = sin(fase) * 0.06
		return false

# ---- datos ----
var ciudad: Dictionary
var lugares: Dictionary
var barrio_edif: Dictionary
var personas: Dictionary
var reglas: Dictionary
var B: Dictionary           # el barrio
var grafo: Grafo
var edificios := {}         # id -> {id,n,e,rb,h,aabb,puerta,d,abre,etiqueta,propio}
var vecinos: Array = []

# ---- escena ----
var fuente: Font
var camara: Camera3D
var pivote: Node3D
var sol: DirectionalLight3D
var entorno: Environment
var cielo_mat: ProceduralSkyMaterial
var jugador: Cam
var jugador_etq: Label3D
var marca: MeshInstance3D
var dist := 62.0
var inclin := deg_to_rad(55.0)
var guiada := 0.0
var seguir := true
var etiquetas: Array = []   # Label3D de edificios (escala con el zoom)
var ult_dist := -1.0

# ---- estado de juego ----
var minutos := 9.0 * 60.0
var vel_juego := 1
var dinero := 1000
var nec := {"hambre": 85.0, "energia": 80.0, "diversion": 70.0}
var nec_tasa := {"hambre": 0.075, "energia": 0.055, "diversion": 0.06}
var nombre_pj := "Ana"
var dentro := false
var destino := ""
var salto_rest := 0.0
var salto_efecto := Callable()
var vec_acum := 0.0
var fps_t := 0.0
var k_sol := 0.62
var k_amb := 0.42

# ---- UI ----
var ui: Control
var lbl_nombre: Label
var lbl_dinero: Label
var lbl_hora: Label
var btn_v1: Button
var btn_v5: Button
var barras := {}
var panel_arriba: Control
var panel_abajo: Control
var panel_ficha: PanelContainer
var ficha_titulo: Label
var ficha_texto: Label
var ficha_botones: VBoxContainer
var toast: Label
var toast_t := 0.0
var velo: ColorRect
var velo_txt: Label
var js_cb = null

# ---- toques ----
var toques := {}
var toque_ini := {}
var gesto_max := 0
var mov_total := 0.0
var t_ini := 0
var d_pinza := 0.0

func _ready() -> void:
	ciudad = Datos.cargar("ciudad")
	lugares = Datos.cargar("lugares")
	barrio_edif = Datos.cargar("barrio")
	personas = Datos.cargar("personas")
	reglas = Datos.cargar("reglas")
	B = ciudad["barrios"][BARRIO]
	grafo = Grafo.new(B)
	nombre_pj = str(personas.get("personaje_base", {}).get("name", "Ana"))
	for n in reglas.get("necesidades", []):
		if nec_tasa.has(n[0]):
			nec_tasa[n[0]] = float(n[3])
	dinero = int(reglas.get("dificultades", {}).get("normal", {}).get("money", 1000))
	_fuentes()
	_entorno()
	_mundo()
	_jugador()
	_camara()
	_ui()
	_vecinos()
	_actualizar_vecinos(true)
	_hud()
	_sol()
	if OS.has_feature("web"):
		_puente_js()
	print("Casita 3D listo: %d edificios, %d vecinos" % [edificios.size(), vecinos.size()])

# =============== fuentes y entorno ===============
func _fuentes() -> void:
	var emo: FontFile = load("res://fonts/emoji.ttf")
	var fv := FontVariation.new()
	fv.base_font = ThemeDB.fallback_font
	fv.fallbacks = [emo]
	fuente = fv

func _entorno() -> void:
	entorno = Environment.new()
	entorno.background_mode = Environment.BG_SKY
	var sk := Sky.new()
	cielo_mat = ProceduralSkyMaterial.new()
	sk.sky_material = cielo_mat
	entorno.sky = sk
	entorno.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	entorno.ambient_light_energy = 0.9
	entorno.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	entorno.tonemap_exposure = 0.78
	entorno.fog_enabled = false
	entorno.fog_density = 0.0025
	var we := WorldEnvironment.new()
	we.environment = entorno
	add_child(we)
	sol = DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
	sol.directional_shadow_max_distance = 130.0
	sol.shadow_bias = 0.15
	sol.shadow_normal_bias = 2.4
	add_child(sol)

func _sol() -> void:
	var h := fposmod(minutos / 60.0, 24.0)
	var s := sin((h - 6.0) / 12.0 * PI)         # >0 de día
	var dia := clampf(s * 2.2, 0.0, 1.0)
	var elev := lerpf(14.0, 62.0, clampf(s, 0.0, 1.0))
	sol.rotation_degrees = Vector3(-elev, 38.0, 0.0)
	sol.light_energy = lerpf(0.1, k_sol, dia)
	var calido := Color(1.0, 0.95, 0.85).lerp(Color(1.0, 0.62, 0.4), clampf(1.0 - s * 2.5, 0.0, 1.0) * dia)
	sol.light_color = Color(0.45, 0.55, 0.9).lerp(calido, dia)
	entorno.ambient_light_energy = lerpf(0.3, k_amb, dia)
	var cima := Color(0.02, 0.03, 0.09).lerp(Color(0.33, 0.55, 0.86), dia)
	var hor := Color(0.07, 0.09, 0.17).lerp(Color(0.78, 0.87, 0.95), dia)
	cielo_mat.sky_top_color = cima
	cielo_mat.sky_horizon_color = hor
	cielo_mat.ground_horizon_color = hor
	cielo_mat.ground_bottom_color = hor.darkened(0.3)
	entorno.fog_light_color = hor

# =============== el mundo ===============
func _mat(c: Color, rug := 0.9) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = rug
	return m

func _caja(pos: Vector3, tam: Vector3, mat: Material, sombra := true) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.material_override = mat
	mi.position = pos
	if not sombra:
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)
	return mi

func _etiqueta(texto: String, pos: Vector3, tam: int, col: Color, ancho := 0.0) -> Label3D:
	var l := Label3D.new()
	l.text = texto
	l.font = fuente
	l.font_size = tam
	l.pixel_size = 0.02
	l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	l.no_depth_test = true
	l.modulate = col
	l.outline_modulate = Color(0.05, 0.07, 0.1, 0.95)
	l.outline_size = 14
	l.render_priority = 5
	l.outline_render_priority = 4
	if ancho > 0.0:
		l.width = ancho
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.position = pos
	add_child(l)
	return l

func _mundo() -> void:
	# suelo: hierba grande y la losa del barrio
	_caja(Vector3(60, -0.6, 50), Vector3(700, 1.0, 700), _mat(Color(0.36, 0.5, 0.31)), false)
	_caja(Vector3(60, -0.07, 50), Vector3(120, 0.14, 100), _mat(Color(0.56, 0.53, 0.47)), false)
	# calles
	var asf := _mat(Color(0.30, 0.31, 0.34), 1.0)
	var acera := _mat(Color(0.58, 0.56, 0.52))
	for c in B["calles"]:
		var a := Vector2(c["a"][0], c["a"][1])
		var b := Vector2(c["b"][0], c["b"][1])
		var w := float(c["w"])
		var hor := Grafo.es_hor(c)
		var largo := absf(b.x - a.x) + absf(b.y - a.y)
		var centro := (a + b) * 0.5
		var tam_acera := Vector3(largo, 0.12, w + 2.4) if hor else Vector3(w + 2.4, 0.12, largo)
		var tam_calle := Vector3(largo, 0.2, w) if hor else Vector3(w, 0.2, largo)
		_caja(Vector3(centro.x, 0.0, centro.y), tam_acera, acera, false)
		_caja(Vector3(centro.x, 0.0, centro.y), tam_calle, asf, false)
		# línea central discontinua
		var n := int(largo / 6.0)
		var mr := _mat(Color(0.85, 0.82, 0.6))
		for i in n:
			var t := (float(i) + 0.5) / float(n)
			var p := a.lerp(b, t)
			var tam_l := Vector3(2.4, 0.22, 0.2) if hor else Vector3(0.2, 0.22, 2.4)
			_caja(Vector3(p.x, 0.0, p.y), tam_l, mr, false)
		# rótulo de la calle, tendido en el suelo
		var k := maxi(1, int(round(largo / 48.0)))
		for i in k:
			var p2 := a.lerp(b, (float(i) + 0.5) / float(k))
			var l := Label3D.new()
			l.text = str(c["n"])
			l.font = fuente
			l.font_size = 64
			l.pixel_size = 0.03 if w >= 5 else 0.026
			l.modulate = Color(0.95, 0.93, 0.8)
			l.outline_size = 0
			l.shaded = false
			l.double_sided = false
			l.position = Vector3(p2.x, 0.16, p2.y)
			l.rotation_degrees = Vector3(-90, 0 if hor else 90, 0)
			add_child(l)
	# árboles
	var r := RandomNumberGenerator.new()
	r.seed = 7
	for a in B.get("arboles", []):
		_arbol(Vector3(a[0], 0, a[1]), r.randf_range(0.9, 1.3))
	# edificios
	_edificios()

func _arbol(p: Vector3, e: float) -> void:
	var tr := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = 0.28 * e
	cm.bottom_radius = 0.38 * e
	cm.height = 2.2 * e
	cm.radial_segments = 6
	tr.mesh = cm
	tr.material_override = _mat(Color(0.4, 0.29, 0.2))
	tr.position = p + Vector3(0, 1.1 * e, 0)
	add_child(tr)
	var co := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = 1.9 * e
	sm.height = 3.4 * e
	sm.radial_segments = 8
	sm.rings = 5
	co.mesh = sm
	co.material_override = _mat(Color(0.28, 0.5, 0.27).lerp(Color(0.4, 0.55, 0.25), fmod(p.x * 0.13 + p.z * 0.07, 1.0)))
	co.position = p + Vector3(0, 3.4 * e, 0)
	add_child(co)

func _registrar(id: String, n: String, e: String, rb: Array, h: float, col: Color, techo: Variant, d: String, abre: Variant, propio: bool, tipo := "cubo") -> void:
	var x0 := float(rb[0])
	var y0 := float(rb[1])
	var x1 := float(rb[2])
	var y1 := float(rb[3])
	var w := x1 - x0
	var f := y1 - y0
	var cx := (x0 + x1) * 0.5
	var cz := (y0 + y1) * 0.5
	var altura := h
	if tipo == "parque":
		_caja(Vector3(cx, 0.1, cz), Vector3(w, 0.3, f), _mat(Color(0.36, 0.62, 0.3)), false)
		var rr := RandomNumberGenerator.new()
		rr.seed = hash(id)
		for i in 9:
			_arbol(Vector3(rr.randf_range(x0 + 2, x1 - 2), 0.2, rr.randf_range(y0 + 2, y1 - 2)), rr.randf_range(0.9, 1.4))
		altura = 0.6
	else:
		_caja(Vector3(cx, altura * 0.5, cz), Vector3(w, altura, f), _mat(col), true)
		if techo is Color:
			if tipo == "casa":
				var mi := MeshInstance3D.new()
				var pm := PrismMesh.new()
				pm.size = Vector3(w + 0.8, 2.6, f + 0.8)
				mi.mesh = pm
				mi.material_override = _mat(techo)
				mi.position = Vector3(cx, altura + 1.3, cz)
				add_child(mi)
				altura += 2.6
			else:
				_caja(Vector3(cx, altura + 0.25, cz), Vector3(w + 0.7, 0.5, f + 0.7), _mat(techo), true)
				altura += 0.5
	var pu := Vector2(0, 0)
	if B["puertas"].has(id):
		var q = B["puertas"][id]
		pu = Vector2(q[0], q[1])
		# puerta dibujada en la fachada que da a la calle
		var cp := Vector2(clampf(pu.x, x0, x1), clampf(pu.y, y0, y1))
		_caja(Vector3(cp.x, 1.1, cp.y), Vector3(1.8, 2.2, 1.8), _mat(Color(0.28, 0.2, 0.15)), true)
	var etq := _etiqueta("%s %s" % [e, n], Vector3(cx, altura + 3.0, cz), 44, Color(1, 1, 0.96), 330.0)
	if propio:
		etq.modulate = Color(1.0, 0.92, 0.5)
	etiquetas.append(etq)
	edificios[id] = {"id": id, "n": n, "e": e, "rb": Rect2(x0, y0, w, f), "h": altura, "puerta": pu, "d": d, "abre": abre,
		"aabb": AABB(Vector3(x0, 0, y0), Vector3(w, altura, f)), "etq": etq}

func _edificios() -> void:
	var L: Dictionary = lugares["lugares"]
	for id in L:
		var v: Dictionary = L[id]
		if v.get("barrio", "") != BARRIO or not v.has("rb"):
			continue
		var es_parque := v.has("park")
		var col := Datos.color(v.get("c", "#cccccc"))
		var techo = Datos.color(v["roof"]) if v.has("roof") else null
		_registrar(id, v["n"], v.get("e", "🏢"), v["rb"], maxf(3.6, float(v.get("h", 24)) * 0.17), col, techo, v.get("d", ""), v.get("abre", null), false, "parque" if es_parque else "cubo")
	var SM: Dictionary = lugares.get("solo_mapa", {})
	for id in SM:
		var v: Dictionary = SM[id]
		if v.get("barrio", "") != BARRIO:
			continue
		_registrar(id, v["n"], v.get("e", "🏢"), v["rb"], maxf(3.0, float(v.get("h", 20)) * 0.17), Datos.color(v.get("c", "#cccccc")), null, v.get("d", ""), v.get("abre", null), false)
	var P: Dictionary = personas["edificios"]
	var BE: Dictionary = barrio_edif["edificios"]
	for id in BE:
		var v: Dictionary = BE[id]
		if v["barrio"] != BARRIO:
			continue
		var info: Dictionary = P[id]
		var casa: bool = info["tipo"] == "casa"
		var techo = Datos.color(v["roof"]) if v.has("roof") else Color(0.5, 0.42, 0.38)
		var alto := float(info["plantas"]) * 2.5 + (0.5 if casa else 0.0)
		_registrar(id, str(v["rotulo"]), "🏠" if casa else "🏢", v["rb"], alto, Datos.color(v["c"]), techo, str(info["d"]), null, false, "casa" if casa else "cubo")
	# casas del jugador (tipo de vivienda «viejo» -> La Ribera)
	var C: Dictionary = B["casa"]
	_registrar("casa", "Tu casa", "🏠", C["casa"], 4.8, Color(0.93, 0.78, 0.55), Color(0.66, 0.3, 0.22), "Tu piso en La Ribera. Aquí duermes.", null, true, "casa")
	for id in ["casaV", "casa2"]:
		var v: Dictionary = L[id]
		_registrar(id, v["n"], v.get("e", "🏠"), C[id], 4.2, Datos.color(v["c"]), Datos.color(v["roof"]), v.get("d", ""), null, false, "casa")

# =============== personajes ===============
func _figura(camisa: Color, piel: Color, esc := 1.0) -> Cam:
	var raiz := Node3D.new()
	var cuerpo := Node3D.new()
	raiz.add_child(cuerpo)
	var mc := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.42
	cap.height = 1.7
	cap.radial_segments = 10
	cap.rings = 4
	mc.mesh = cap
	mc.material_override = _mat(camisa)
	mc.position.y = 0.85
	cuerpo.add_child(mc)
	var mh := MeshInstance3D.new()
	var sp := SphereMesh.new()
	sp.radius = 0.34
	sp.height = 0.68
	sp.radial_segments = 10
	sp.rings = 5
	mh.mesh = sp
	mh.material_override = _mat(piel)
	mh.position.y = 2.0
	cuerpo.add_child(mh)
	raiz.scale = Vector3.ONE * esc
	add_child(raiz)
	var c := Cam.new()
	c.nodo = raiz
	c.cuerpo = cuerpo
	return c

func _jugador() -> void:
	jugador = _figura(Color.html(personas["personaje_base"].get("shirt", "#ff8a5b")), Color.html(personas["personaje_base"].get("skin", "#efc39b")), 1.5)
	var p: Vector2 = edificios["casa"]["puerta"]
	jugador.nodo.position = Vector3(p.x, 0, p.y)
	jugador_etq = _etiqueta(nombre_pj, Vector3(0, 3.6, 0), 40, Color(1.0, 0.9, 0.35))
	jugador_etq.reparent(jugador.nodo, false)
	jugador_etq.position = Vector3(0, 2.6, 0)
	jugador_etq.pixel_size = 0.014
	# aro bajo los pies
	var aro := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = 1.1
	cm.bottom_radius = 1.1
	cm.height = 0.05
	aro.mesh = cm
	var m := _mat(Color(1.0, 0.85, 0.2))
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	aro.material_override = m
	aro.position.y = 0.2
	aro.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	jugador.nodo.add_child(aro)
	# marca de destino
	marca = MeshInstance3D.new()
	var cm2 := CylinderMesh.new()
	cm2.top_radius = 0.9
	cm2.bottom_radius = 0.9
	cm2.height = 0.06
	marca.mesh = cm2
	var m2 := _mat(Color(1, 1, 1))
	m2.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m2.albedo_color = Color(1.0, 0.4, 0.3)
	marca.material_override = m2
	marca.visible = false
	marca.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(marca)

# =============== cámara ===============
func _camara() -> void:
	pivote = Node3D.new()
	add_child(pivote)
	camara = Camera3D.new()
	camara.keep_aspect = Camera3D.KEEP_WIDTH
	camara.fov = 46.0
	camara.near = 1.0
	camara.far = 700.0
	pivote.add_child(camara)
	pivote.rotation.y = deg_to_rad(-24.0)
	pivote.position = jugador.nodo.position
	_poner_camara()

func _poner_camara() -> void:
	dist = clampf(dist, 16.0, 150.0)
	camara.position = Vector3(0, sin(inclin) * dist, cos(inclin) * dist)
	camara.look_at(pivote.global_position, Vector3.UP)
	if absf(dist - ult_dist) > 0.5:
		ult_dist = dist
		var ps := clampf(dist * 0.0006, 0.014, 0.05)
		for l in etiquetas:
			l.pixel_size = ps

# =============== UI ===============
func _estilo(col: Color, radio := 10) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = col
	s.set_corner_radius_all(radio)
	s.content_margin_left = 10
	s.content_margin_right = 10
	s.content_margin_top = 6
	s.content_margin_bottom = 6
	return s

func _ui() -> void:
	var capa := CanvasLayer.new()
	add_child(capa)
	ui = Control.new()
	ui.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var th := Theme.new()
	th.default_font = fuente
	th.default_font_size = 16
	ui.theme = th
	capa.add_child(ui)
	# --- barra de arriba ---
	var arriba := PanelContainer.new()
	arriba.add_theme_stylebox_override("panel", _estilo(Color(0.1, 0.14, 0.2, 0.86)))
	arriba.set_anchors_preset(Control.PRESET_TOP_WIDE)
	arriba.offset_left = 8
	arriba.offset_right = -8
	arriba.offset_top = 8
	ui.add_child(arriba)
	panel_arriba = arriba
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 4)
	arriba.add_child(vb)
	var f1 := HBoxContainer.new()
	vb.add_child(f1)
	lbl_nombre = Label.new()
	lbl_nombre.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_nombre.add_theme_font_size_override("font_size", 18)
	f1.add_child(lbl_nombre)
	lbl_dinero = Label.new()
	lbl_dinero.add_theme_font_size_override("font_size", 18)
	lbl_dinero.add_theme_color_override("font_color", Color(0.65, 0.95, 0.6))
	f1.add_child(lbl_dinero)
	var f2 := HBoxContainer.new()
	f2.add_theme_constant_override("separation", 6)
	vb.add_child(f2)
	lbl_hora = Label.new()
	lbl_hora.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_hora.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	f2.add_child(lbl_hora)
	var grupo := ButtonGroup.new()
	btn_v1 = _boton_vel("1×", 1, grupo)
	btn_v5 = _boton_vel("5×", 5, grupo)
	f2.add_child(btn_v1)
	f2.add_child(btn_v5)
	btn_v1.button_pressed = true
	# --- barras de necesidades, abajo ---
	var abajo := PanelContainer.new()
	abajo.add_theme_stylebox_override("panel", _estilo(Color(0.1, 0.14, 0.2, 0.86)))
	abajo.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	abajo.offset_left = 8
	abajo.offset_right = -8
	abajo.offset_bottom = -8
	abajo.offset_top = -74
	ui.add_child(abajo)
	panel_abajo = abajo
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 10)
	abajo.add_child(hb)
	for par in [["hambre", "🍔 Hambre"], ["energia", "⚡ Energía"], ["diversion", "🎉 Diversión"]]:
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hb.add_child(col)
		var l := Label.new()
		l.text = par[1]
		l.add_theme_font_size_override("font_size", 14)
		col.add_child(l)
		var pb := ProgressBar.new()
		pb.min_value = 0
		pb.max_value = 100
		pb.show_percentage = false
		pb.custom_minimum_size = Vector2(0, 14)
		pb.add_theme_stylebox_override("background", _estilo(Color(0.25, 0.28, 0.33), 6))
		col.add_child(pb)
		barras[par[0]] = pb
	# --- ficha / diálogo ---
	panel_ficha = PanelContainer.new()
	panel_ficha.add_theme_stylebox_override("panel", _estilo(Color(0.96, 0.94, 0.88, 0.97), 14))
	panel_ficha.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel_ficha.offset_left = 12
	panel_ficha.offset_right = -12
	panel_ficha.offset_bottom = -84
	panel_ficha.grow_vertical = Control.GROW_DIRECTION_BEGIN
	panel_ficha.visible = false
	ui.add_child(panel_ficha)
	var fv := VBoxContainer.new()
	fv.add_theme_constant_override("separation", 6)
	panel_ficha.add_child(fv)
	ficha_titulo = Label.new()
	ficha_titulo.add_theme_font_size_override("font_size", 22)
	ficha_titulo.add_theme_color_override("font_color", Color(0.15, 0.12, 0.1))
	ficha_titulo.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	fv.add_child(ficha_titulo)
	ficha_texto = Label.new()
	ficha_texto.add_theme_font_size_override("font_size", 16)
	ficha_texto.add_theme_color_override("font_color", Color(0.25, 0.22, 0.2))
	ficha_texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	fv.add_child(ficha_texto)
	ficha_botones = VBoxContainer.new()
	ficha_botones.add_theme_constant_override("separation", 6)
	fv.add_child(ficha_botones)
	# --- aviso y velo ---
	toast = Label.new()
	toast.set_anchors_preset(Control.PRESET_CENTER_TOP)
	toast.offset_top = 112
	toast.offset_left = -190
	toast.offset_right = 190
	toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	toast.add_theme_stylebox_override("normal", _estilo(Color(0, 0, 0, 0.75), 12))
	toast.visible = false
	toast.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(toast)
	velo = ColorRect.new()
	velo.color = Color(0.02, 0.03, 0.08, 0.6)
	velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	velo.visible = false
	ui.add_child(velo)
	velo_txt = Label.new()
	velo_txt.set_anchors_preset(Control.PRESET_CENTER)
	velo_txt.offset_left = -150
	velo_txt.offset_right = 150
	velo_txt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	velo_txt.add_theme_font_size_override("font_size", 26)
	velo.add_child(velo_txt)

func _boton_vel(t: String, v: int, g: ButtonGroup) -> Button:
	var b := Button.new()
	b.text = t
	b.toggle_mode = true
	b.button_group = g
	b.custom_minimum_size = Vector2(56, 34)
	b.pressed.connect(func(): vel_juego = v)
	return b

func _hud() -> void:
	lbl_nombre.text = nombre_pj
	lbl_dinero.text = _eur(dinero)
	var dia := int(minutos / 1440.0)
	var h := int(fposmod(minutos, 1440.0) / 60.0)
	var m := int(fposmod(minutos, 60.0))
	lbl_hora.text = "%s · día %d · %02d:%02d" % [DIAS[dia % 7], dia + 1, h, m]
	for k in barras:
		var v: float = nec[k]
		var pb: ProgressBar = barras[k]
		pb.value = v
		var col := Color(0.4, 0.8, 0.45) if v > 40.0 else (Color(0.95, 0.75, 0.25) if v > 20.0 else Color(0.9, 0.3, 0.28))
		pb.add_theme_stylebox_override("fill", _estilo(col, 6))

func _eur(x: int) -> String:
	var s := str(absi(x))
	var o := ""
	while s.length() > 3:
		o = "." + s.substr(s.length() - 3) + o
		s = s.substr(0, s.length() - 3)
	return ("-" if x < 0 else "") + s + o + " €"

func _aviso(t: String) -> void:
	toast.text = t
	toast.visible = true
	toast_t = 2.6

func _ficha(titulo: String, texto: String, botones: Array) -> void:
	ficha_titulo.text = titulo
	ficha_texto.text = texto
	ficha_texto.visible = texto != ""
	for c in ficha_botones.get_children():
		c.queue_free()
	for b in botones:
		var bt := Button.new()
		bt.text = b[0]
		bt.custom_minimum_size = Vector2(0, 46)
		bt.add_theme_font_size_override("font_size", 18)
		bt.pressed.connect(b[1])
		ficha_botones.add_child(bt)
	var cerrar := Button.new()
	cerrar.text = "Cerrar"
	cerrar.custom_minimum_size = Vector2(0, 42)
	cerrar.pressed.connect(_cerrar_ficha)
	ficha_botones.add_child(cerrar)
	panel_ficha.offset_top = panel_ficha.offset_bottom
	panel_ficha.visible = true

func _cerrar_ficha() -> void:
	panel_ficha.visible = false
	if dentro:
		dentro = false
		jugador.nodo.visible = true

# =============== reloj y necesidades ===============
func _avanzar(dm: float) -> void:
	minutos += dm
	for k in nec:
		nec[k] = clampf(nec[k] - nec_tasa[k] * dm, 0.0, 100.0)
	vec_acum += dm
	if vec_acum >= 5.0:
		vec_acum = 0.0
		_actualizar_vecinos(salto_rest > 0.0)

func _tiene(arr: Array, d: int) -> bool:
	for x in arr:
		if int(x) == d:
			return true
	return false

func _hora_dec() -> float:
	return fposmod(minutos, 1440.0) / 60.0

func _dia_sem() -> int:
	return int(minutos / 1440.0) % 7

func _abierto(id: String) -> bool:
	var ab = edificios[id]["abre"]
	if ab == null:
		return true
	var h := _hora_dec()
	var d := _dia_sem()
	for t in ab:
		var dias: Array = t[2]
		if h >= float(t[0]) and h < float(t[1]) and _tiene(dias, d):
			return true
		if float(t[1]) > 24.0 and h + 24.0 < float(t[1]) and _tiene(dias, (d + 6) % 7):
			return true
	return false

func _horario_hoy(id: String) -> String:
	var ab = edificios[id]["abre"]
	if ab == null:
		return ""
	var d := _dia_sem()
	var partes: Array = []
	for t in ab:
		if _tiene(t[2], d):
			partes.append("%s a %s" % [_hhmm(float(t[0])), _hhmm(fposmod(float(t[1]), 24.0))])
	return "Hoy abre de " + " y de ".join(partes) + "." if partes.size() > 0 else "Hoy está cerrado."

func _hhmm(h: float) -> String:
	return "%d:%02d" % [int(h), int(round((h - floor(h)) * 60.0))]

# =============== andar ===============
func _ruta(desde: Vector3, hasta: Vector2) -> Array:
	var pts := grafo.camino(Vector2(desde.x, desde.z), hasta)
	var r: Array = []
	for p in pts:
		r.append(Vector3(p.x, 0, p.y))
	return r

func _ir_a_edificio(id: String) -> void:
	_cerrar_ficha()
	destino = id
	var ruta := _ruta(jugador.nodo.position, edificios[id]["puerta"])
	if ruta.is_empty():
		_aviso("No hay camino.")
		return
	jugador.ruta = ruta
	seguir = true
	marca.visible = true
	var p: Vector2 = edificios[id]["puerta"]
	marca.position = Vector3(p.x, 0.22, p.y)
	if ruta.size() == 1 and (ruta[0] as Vector3).distance_to(jugador.nodo.position) < 0.05:
		jugador.ruta = []
		_llegar()

func _ir_a_punto(p: Vector2) -> void:
	_cerrar_ficha()
	destino = ""
	var aj := grafo.ajustar(p)
	if aj["d"] > 12.0:
		return
	var ruta := _ruta(jugador.nodo.position, aj["p"])
	if ruta.is_empty():
		return
	jugador.ruta = ruta
	seguir = true
	marca.visible = true
	marca.position = Vector3(aj["p"].x, 0.22, aj["p"].y)

func _llegar() -> void:
	marca.visible = false
	if destino == "":
		return
	var id := destino
	destino = ""
	var e: Dictionary = edificios[id]
	if id == "casa":
		dentro = true
		jugador.nodo.visible = false
		_ficha("🏠 Tu casa", "Tu piso de La Ribera. Hay una cama y una nevera casi vacía.", [
			["🛏️ Dormir 8 horas", func(): _accion_dormir(480.0)],
			["😴 Echar una siesta (1 h)", func(): _accion_dormir(60.0)]])
		return
	if e["abre"] != null and not _abierto(id):
		_aviso("%s está cerrado. %s" % [e["n"], _horario_hoy(id)])
		_ficha("%s %s" % [e["e"], e["n"]], "Cerrado ahora. %s" % _horario_hoy(id), [])
		return
	if id == "bar":
		dentro = true
		jugador.nodo.visible = false
		_ficha("🍺 %s" % e["n"], "%s\nUna caña y una tapa: %s, y una hora y media." % [e["d"], _eur(PRECIO_BAR)], [
			["🍻 Tomar algo (%s)" % _eur(PRECIO_BAR), _accion_bar]])
		return
	if id == "super":
		dentro = true
		jugador.nodo.visible = false
		_ficha("🛒 %s" % e["n"], "%s\nCompras algo de comer y lo despachas en un banco: %s, media hora." % [e["d"], _eur(PRECIO_SUPER)], [
			["🥖 Comprar y comer (%s)" % _eur(PRECIO_SUPER), _accion_super]])
		return
	var tx: String = e["d"]
	var hr := _horario_hoy(id)
	if hr != "":
		tx += "\n" + hr
	_ficha("%s %s" % [e["e"], e["n"]], tx, [])

func _accion_bar() -> void:
	if dinero < PRECIO_BAR:
		_aviso("No te llega el dinero.")
		return
	# efecto leído de data/lugares.json: salida «amigos» (diversión y social por minuto) × 90 min
	var tasa: Dictionary = lugares["salidas_necesidades"].get(lugares["lugares"]["bar"]["outs"][0], {"diversion": 0.28, "hambre": 0.08})
	var dm := 90.0
	_cerrar_ficha_y_saltar(dm, "Tomando algo en %s…" % edificios["bar"]["n"], func():
		dinero -= PRECIO_BAR
		nec["diversion"] = minf(100.0, nec["diversion"] + float(tasa.get("diversion", 0.28)) * dm)
		nec["hambre"] = minf(100.0, nec["hambre"] + float(tasa.get("hambre", 0.08)) * dm)
		_aviso("Una caña, una tapa y buena charla. Diversión arriba."))

func _accion_super() -> void:
	if dinero < PRECIO_SUPER:
		_aviso("No te llega el dinero.")
		return
	_cerrar_ficha_y_saltar(30.0, "Comprando y comiendo…", func():
		dinero -= PRECIO_SUPER
		nec["hambre"] = minf(100.0, nec["hambre"] + 45.0)
		_aviso("Has comido algo. Hambre arriba."))

func _accion_dormir(dm: float) -> void:
	_cerrar_ficha_y_saltar(dm, "Durmiendo…" if dm > 100.0 else "Siesta…", func():
		nec["energia"] = minf(100.0, nec["energia"] + 0.21 * dm)
		_aviso("Has dormido. Energía arriba."))

func _cerrar_ficha_y_saltar(dm: float, txt: String, efecto: Callable) -> void:
	panel_ficha.visible = false
	salto_rest = dm
	salto_efecto = efecto
	velo_txt.text = txt
	velo.visible = true

# =============== vecinos ===============
func _vecinos() -> void:
	var BE: Dictionary = barrio_edif["edificios"]
	var H: Dictionary = personas["hogares"]
	var del_barrio: Array = []
	var por_id := {}
	for v in personas["vecinos"]:
		por_id[v["id"]] = v
	for hid in H:
		var h: Dictionary = H[hid]
		if not BE.has(h.get("edificio", "")) or BE[h["edificio"]]["barrio"] != BARRIO:
			continue
		for mid in h.get("miembros", []):
			var v: Dictionary = por_id[mid]
			del_barrio.append({"v": v, "edif": h["edificio"]})
	# primero quien trabaja o estudia en un sitio del barrio (se les ve ir y venir), luego el resto
	var con_curro: Array = []
	var resto: Array = []
	for x in del_barrio:
		var t = x["v"].get("trabajo", null)
		if (t != null and B["puertas"].has(t["lugar"])) or (x["v"].get("estudia", null) == "cole"):
			con_curro.append(x)
		else:
			resto.append(x)
	var elegidos: Array = []
	var paso := maxi(1, con_curro.size() / 14)
	var i := 0
	while i < con_curro.size() and elegidos.size() < 14:
		elegidos.append(con_curro[i])
		i += paso
	var j := 0
	var paso2 := maxi(1, resto.size() / 10)
	while j < resto.size() and elegidos.size() < 24:
		elegidos.append(resto[j])
		j += paso2
	for x in elegidos:
		var v: Dictionary = x["v"]
		var hs := hash(v["id"])
		var camisa := Color.from_hsv(float(hs % 360) / 360.0, 0.45, 0.82)
		var tonos := [Color("#f1c9a5"), Color("#d9a577"), Color("#b07a52"), Color("#8a5a3b")]
		var piel: Color = tonos[(hs >> 3) % 4]
		var esc := 0.95 if int(v["edad"]) < 14 else 1.25
		var c := _figura(camisa, piel, esc)
		var et := _etiqueta(str(v["n"]), Vector3(0, 3.0, 0), 34, Color(1, 1, 1))
		et.reparent(c.nodo, false)
		et.position = Vector3(0, 3.0, 0)
		et.pixel_size = 0.017
		et.visible = true
		c.vel = VEL_ANDAR * 0.55
		vecinos.append({"v": v, "edif": x["edif"], "cam": c, "meta": "", "visible": false})

func _lugar_de(x: Dictionary) -> String:
	# dónde está esta persona ahora: id de un edificio del barrio, o "" si está fuera del barrio
	var v: Dictionary = x["v"]
	var h := _hora_dec()
	var d := _dia_sem()
	var t = v.get("trabajo", null)
	if t != null and t["lugar"] == "fuera":
		var th: Array = t["h"]
		if h >= float(th[0]) and h < float(th[1]) and _tiene(t["dias"], d):
			return ""
	var es = v.get("estudia", null)
	if d < 5 and es != null:
		if es == "cole" and h >= 9.0 and h < 14.0:
			return "colegio" if v.get("centro", "") == "colegio" else ("" if v.get("centro", "") != "" else "colegio")
		if es == "instituto" and h >= 8.5 and h < 14.5:
			return ""
	for t2 in v.get("donde", []):
		var dias: Array = t2[3]
		var hasta := float(t2[2])
		if (h >= float(t2[1]) and h < hasta and _tiene(dias, d)) or (hasta > 24.0 and h + 24.0 < hasta and _tiene(dias, (d + 6) % 7)):
			return t2[0] if B["puertas"].has(t2[0]) else ""
	return x["edif"]

func _actualizar_vecinos(salto: bool) -> void:
	for x in vecinos:
		var lug := _lugar_de(x)
		var c: Cam = x["cam"]
		if lug == x["meta"] and x["visible"] == (lug != ""):
			continue
		x["meta"] = lug
		if lug == "":
			c.nodo.visible = false
			c.ruta = []
			x["visible"] = false
			continue
		var p: Vector2 = edificios[lug]["puerta"] if edificios.has(lug) else Vector2(B["puertas"][lug][0], B["puertas"][lug][1])
		# varios en la misma puerta: se reparten un poco
		var off := Vector3(float(hash(x["v"]["id"]) % 7 - 3) * 0.5, 0, float(hash(x["v"]["id"] + "z") % 5 - 2) * 0.5)
		if not x["visible"] or salto:
			c.nodo.position = Vector3(p.x, 0, p.y) + off
			c.nodo.visible = true
			c.ruta = []
			x["visible"] = true
		else:
			c.ruta = _ruta(c.nodo.position, p)
			if c.ruta.size() > 0:
				c.ruta[-1] = Vector3(p.x, 0, p.y) + off

# =============== entrada táctil ===============
func _en_ui(p: Vector2) -> bool:
	for c in [panel_arriba, panel_abajo, panel_ficha]:
		if c.visible and c.get_global_rect().has_point(p):
			return true
	return velo.visible

func _input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.pressed:
		if ev.button_index == MOUSE_BUTTON_WHEEL_UP:
			dist *= 0.9
			_poner_camara()
		elif ev.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			dist *= 1.1
			_poner_camara()
	elif ev is InputEventScreenTouch:
		if ev.pressed:
			if _en_ui(ev.position) and toques.is_empty():
				return
			if toques.is_empty():
				mov_total = 0.0
				gesto_max = 0
				t_ini = Time.get_ticks_msec()
			toques[ev.index] = ev.position
			toque_ini[ev.index] = ev.position
			gesto_max = maxi(gesto_max, toques.size())
			d_pinza = 0.0
		else:
			if not toques.has(ev.index):
				return
			var era_tap := gesto_max == 1 and mov_total < 14.0 and Time.get_ticks_msec() - t_ini < 1500
			toques.erase(ev.index)
			d_pinza = 0.0
			if toques.is_empty() and era_tap:
				_tap(ev.position)
			if toques.is_empty():
				gesto_max = 0
	elif ev is InputEventScreenDrag:
		if not toques.has(ev.index):
			return
		toques[ev.index] = ev.position
		mov_total += ev.relative.length()
		if toques.size() >= 2:
			var ks: Array = toques.keys()
			var d: float = (toques[ks[0]] - toques[ks[1]]).length()
			if d_pinza > 0.0 and d > 4.0:
				dist *= d_pinza / d
				_poner_camara()
			d_pinza = d
			seguir = false
		elif toques.size() == 1 and mov_total >= 10.0:
			seguir = false
			var vp := get_viewport().get_visible_rect().size
			var k := 2.0 * tan(deg_to_rad(camara.fov * 0.5)) * dist / vp.x
			var b := pivote.global_transform.basis
			pivote.position -= (b.x * ev.relative.x + b.z * ev.relative.y / sin(inclin)) * k
			pivote.position.x = clampf(pivote.position.x, -10.0, 130.0)
			pivote.position.z = clampf(pivote.position.z, -10.0, 110.0)

func _tap(p: Vector2) -> void:
	if panel_ficha.visible and not dentro:
		_cerrar_ficha()
		return
	if dentro or velo.visible:
		return
	# vecino más cercano al dedo
	var mejor := 44.0
	var quien: Dictionary = {}
	for x in vecinos:
		var c: Cam = x["cam"]
		if not c.nodo.visible:
			continue
		var sp := camara.unproject_position(c.nodo.global_position + Vector3(0, 1.4, 0))
		var d := sp.distance_to(p)
		if d < mejor:
			mejor = d
			quien = x
	if not quien.is_empty():
		_ficha_vecino(quien)
		return
	var o := camara.project_ray_origin(p)
	var n := camara.project_ray_normal(p)
	var mejor_t := 1e18
	var hit := ""
	for id in edificios:
		var ab: AABB = edificios[id]["aabb"]
		if edificios[id]["h"] <= 1.0:
			continue
		var r = ab.intersects_ray(o, n)
		if r != null:
			var t: float = o.distance_to(r)
			if t < mejor_t:
				mejor_t = t
				hit = id
	if hit != "":
		_ir_a_edificio(hit)
		return
	var g = Plane(Vector3.UP, 0.0).intersects_ray(o, n)
	if g != null:
		var q := Vector3(g)
		# parques y otros suelos: se puede ir al más cercano
		for id in ["parque"]:
			if edificios.has(id) and (edificios[id]["rb"] as Rect2).grow(1.0).has_point(Vector2(q.x, q.z)):
				_ir_a_edificio(id)
				return
		_ir_a_punto(Vector2(q.x, q.z))

func _ficha_vecino(x: Dictionary) -> void:
	var v: Dictionary = x["v"]
	var of: Array = v.get("oficio", [])
	var oficio := ""
	if of.size() == 2:
		oficio = of[0] if v.get("g", "x") == "f" else of[1]
	elif v.get("estudia", null) != null:
		oficio = "estudia"
	var cab := "%d años" % int(v["edad"])
	if oficio != "":
		cab += " · " + oficio
	_ficha("🧍 %s" % v["n"], "%s\n\n«%s»" % [cab, v["d"]], [])

# =============== bucle ===============
func _process(dt: float) -> void:
	var rapido := salto_rest > 0.0
	if rapido:
		var paso := minf(salto_rest, VEL_SALTO * dt)
		_avanzar(paso)
		salto_rest -= paso
		if salto_rest <= 0.0:
			salto_rest = 0.0
			velo.visible = false
			dentro = false
			jugador.nodo.visible = true
			_actualizar_vecinos(true)
			var f := salto_efecto
			salto_efecto = Callable()
			if f.is_valid():
				f.call()
	else:
		_avanzar(MIN_POR_SEG * vel_juego * dt)
	# andar
	var mult := 1.0 if vel_juego == 1 else 1.8
	jugador.vel = VEL_ANDAR * mult
	if jugador.mover(jugador.vel * dt):
		_llegar()
	for x in vecinos:
		var c: Cam = x["cam"]
		if c.nodo.visible:
			c.mover(VEL_ANDAR * 0.55 * mult * dt)
	# cámara
	if seguir:
		pivote.position = pivote.position.lerp(jugador.nodo.position, 1.0 - exp(-5.0 * dt))
	# interfaz y luz
	guiada += dt
	if guiada > 0.25:
		guiada = 0.0
		_hud()
		_sol()
	if toast.visible:
		toast_t -= dt
		if toast_t <= 0.0:
			toast.visible = false
	if marca.visible:
		marca.rotation.y += dt * 2.0
		marca.scale = Vector3.ONE * (1.0 + 0.15 * sin(Time.get_ticks_msec() * 0.008))
	fps_t += dt
	if fps_t >= 5.0:
		fps_t = 0.0
		print("fps:%d" % Engine.get_frames_per_second())

# =============== puente para pruebas (solo web) ===============
func _puente_js() -> void:
	js_cb = JavaScriptBridge.create_callback(_cmd_js)
	var w = JavaScriptBridge.get_interface("window")
	w.casita_cmd = js_cb

func _cmd_js(args: Array) -> void:
	var c := str(args[0])
	var a = args[1] if args.size() > 1 else null
	match c:
		"ir":
			_ir_a_edificio(str(a))
		"hora":
			minutos = floorf(minutos / 1440.0) * 1440.0 + float(a) * 60.0
			_actualizar_vecinos(true)
		"dia":
			minutos = float(a) * 1440.0 + fposmod(minutos, 1440.0)
			_actualizar_vecinos(true)
		"vel":
			vel_juego = int(a)
		"zoom":
			dist = float(a)
			_poner_camara()
		"boton":
			var bs := ficha_botones.get_children()
			var i := int(a)
			if i < bs.size():
				(bs[i] as Button).pressed.emit()
		"vecino":
			var i := int(a)
			if i < vecinos.size():
				_ficha_vecino(vecinos[i])
		"luz":
			k_sol = float(a)
			k_amb = float(args[2])
			entorno.tonemap_exposure = float(args[3])
			_sol()
		"estado":
			print("estado: min=%d dinero=%d nec=%s jug=%s dentro=%s ruta=%d" % [minutos, dinero, str(nec), str(jugador.nodo.position), str(dentro), jugador.ruta.size()])
		"vecinos":
			var vis := 0
			for x in vecinos:
				if x["cam"].nodo.visible:
					vis += 1
			print("vecinos visibles: %d de %d" % [vis, vecinos.size()])
