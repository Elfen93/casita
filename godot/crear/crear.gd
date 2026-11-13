extends Node3D
# GD-10b: pantalla del creador de personaje (prototipo, página propia: ...index.html?crear).
# Todos los controles salen de Maniqui.catalogo(): no se da nada por supuesto (más o menos formas, grupos, capas...).

const CLAVE := "casita3d_personaje"
const ARCHIVO := "user://personaje.json"
const FRAC_PANEL := 0.52          # el panel ocupa de aquí hasta abajo
const ALTO_BARRA := 112.0
const FOV := 35.0
const COL_PELO := [
	["Negro", Color(0.07, 0.055, 0.05)], ["Castaño oscuro", Color(0.2, 0.12, 0.07)], ["Castaño", Color(0.36, 0.22, 0.12)],
	["Castaño claro", Color(0.52, 0.36, 0.2)], ["Rubio", Color(0.8, 0.65, 0.34)], ["Pelirrojo", Color(0.62, 0.27, 0.12)],
	["Gris", Color(0.58, 0.58, 0.6)], ["Blanco", Color(0.9, 0.9, 0.9)]]
const COL_ROPA := [
	["Original", Color(1, 1, 1)], ["Negro", Color(0.1, 0.1, 0.12)], ["Gris", Color(0.5, 0.52, 0.56)],
	["Rojo", Color(0.78, 0.2, 0.2)], ["Mostaza", Color(0.86, 0.65, 0.18)], ["Verde", Color(0.24, 0.55, 0.34)],
	["Azul marino", Color(0.14, 0.2, 0.42)], ["Azul claro", Color(0.45, 0.68, 0.88)], ["Morado", Color(0.5, 0.3, 0.64)],
	["Rosa", Color(0.9, 0.55, 0.68)]]
const C_FONDO := Color(0.1, 0.12, 0.17, 0.97)
const C_BOTON := Color(0.3, 0.36, 0.5)
const C_PULSADO := Color(0.42, 0.5, 0.68)
const C_SEL := Color(0.9, 0.62, 0.25)

# --- cuerpo y escena ---
var cat: Dictionary
var cuerpo: Node3D
var giro_nodo: Node3D
var cam: Camera3D
var vista := "cuerpo"             # "cuerpo" | "cara"
var zoom := 1.0                   # pellizco, 0,5..1,6 (multiplica la distancia)
var v_ty := 0.85
var v_vis := 2.0
var v_ya := false
# --- estado reflejado (el cuerpo solo tiene set_*) ---
var est := {}
var deshacer: Array = []
var pendiente = null              # copia de est tomada al empezar a arrastrar un deslizador
var nombre := "Ana"
var capas: Array = []
# --- interfaz ---
var ui: Control
var barra: PanelContainer
var panel: PanelContainer
var ed_nombre: LineEdit
var b_deshacer: Button
var pestanas: Array = []          # [{"id","txt","btn","pag"}]
var pest_act := ""
var ctl := {}                     # nombre -> Control (para las órdenes de prueba)
var marcables: Array = []         # [{"b": Button, "f": Callable}]
var deslizadores := {}            # id de forma -> Desliz
var lbl_aviso: Label
var aviso_t := 0.0
var lbl_fps: Label
var fps_t: Array = []
var fps_txt_t := 0.0
# --- dedo en la escena ---
var dedos := {}                   # índice -> posición (solo los que empezaron en la escena)
var pinza_ini := 0.0
var zoom_ini := 1.0
var js_cb

# ====================================================== deslizador táctil
class Desliz extends Control:
	signal empieza
	signal cambiado(v: float)
	var vmin := -1.0
	var vmax := 1.0
	var vdef := 0.0
	var valor := 0.0
	var nombre := ""
	var arrastrando := false
	var scroll: ScrollContainer

	func _init() -> void:
		custom_minimum_size = Vector2(0, 62)
		mouse_filter = Control.MOUSE_FILTER_STOP

	func _frac(v: float) -> float:
		return 0.0 if vmax <= vmin else clampf((v - vmin) / (vmax - vmin), 0.0, 1.0)

	func _draw() -> void:
		var f := ThemeDB.fallback_font
		draw_string(f, Vector2(4, 20), nombre, HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color(0.92, 0.94, 1.0))
		draw_string(f, Vector2(0, 20), "%+.2f" % valor if vmin < 0.0 else "%.2f" % valor, HORIZONTAL_ALIGNMENT_RIGHT, size.x - 4.0, 14, Color(0.7, 0.76, 0.9))
		var x0 := 16.0
		var x1 := size.x - 16.0
		var y := 43.0
		draw_rect(Rect2(x0, y - 4, x1 - x0, 8), Color(0.2, 0.24, 0.34), true)
		var xd := lerpf(x0, x1, _frac(vdef))
		var xv := lerpf(x0, x1, _frac(valor))
		draw_rect(Rect2(minf(xd, xv), y - 4, absf(xv - xd), 8), Color(0.9, 0.62, 0.25, 0.9), true)
		draw_rect(Rect2(xd - 1, y - 9, 2, 18), Color(0.7, 0.76, 0.9, 0.6), true)
		draw_circle(Vector2(xv, y), 15.0 if arrastrando else 13.0, Color(0.96, 0.96, 1.0))
		draw_circle(Vector2(xv, y), 8.0, Color(0.9, 0.62, 0.25) if arrastrando else C_BOTON)

	func poner(v: float) -> void:
		valor = clampf(v, vmin, vmax)
		queue_redraw()

	func _a_valor(x: float) -> float:
		var t := clampf((x - 16.0) / maxf(1.0, size.x - 32.0), 0.0, 1.0)
		return lerpf(vmin, vmax, t)

	func _gui_input(e: InputEvent) -> void:
		if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
			if e.pressed:
				arrastrando = true
				if scroll != null:
					scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
				empieza.emit()
				_mover(e.position.x)
			else:
				_soltar()
			accept_event()
		elif e is InputEventMouseMotion and arrastrando:
			_mover(e.position.x)
			accept_event()

	func _mover(x: float) -> void:
		poner(_a_valor(x))
		cambiado.emit(valor)

	func _soltar() -> void:
		arrastrando = false
		if scroll != null:
			scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
		queue_redraw()

# ====================================================== arranque
func _ready() -> void:
	cat = Maniqui.catalogo()
	_escena()
	cuerpo = Maniqui.crear()
	giro_nodo.add_child(cuerpo)
	_estado_inicial()
	_interfaz()
	_cargar()
	_aplicar_est()
	_refrescar()
	if OS.has_feature("web"):
		js_cb = JavaScriptBridge.create_callback(_cmd_js)
		JavaScriptBridge.get_interface("window").casita_crear = js_cb
	print("Creador listo (%s): %d formas" % ["maniquí de pega" if Maniqui.es_de_pega() else "humano", cat.get("formas", []).size()])

func _estado_inicial() -> void:
	est = {"formas": {}, "piel": "", "pelo": {"id": "", "color": COL_PELO[2][1]}, "ropa": {}, "gesto": "", "ojos": "", "cejas": ""}
	if _hay_ojos():
		est["ojos"] = str(cat["ojos"][0]["id"])
	if _hay_cejas():
		var cj: Array = cat["cejas"]
		est["cejas"] = str(cj[1 if cj.size() > 1 else 0]["id"])
	for f in cat.get("formas", []):
		est["formas"][str(f["id"])] = float(f.get("def", 0.0))
	var pieles: Array = cat.get("pieles", [])
	if not pieles.is_empty():
		est["piel"] = str(pieles[0]["id"])
		for p in pieles:
			if str(p["id"]) == "media":
				est["piel"] = "media"
	for p in cat.get("pelos", []):
		if str(p["id"]) != "":
			est["pelo"]["id"] = str(p["id"])
			break
	capas = []
	for r in cat.get("ropas", []):
		var c := str(r.get("capa", ""))
		if not capas.has(c):
			capas.append(c)
	var k := 0
	for c in capas:
		var col: Color = COL_ROPA[0][1]    # «Original»: la textura de la prenda tal cual
		var primera := ""
		for r in cat["ropas"]:
			if str(r.get("capa", "")) == c:
				primera = str(r["id"])
				break
		# vestido por defecto: lo normal (arriba, abajo, pies); «entero» y desconocidas, vacías
		est["ropa"][c] = {"id": primera if ["arriba", "abajo", "pies"].has(c) else "", "color": col}
		k += 1

func _hay_ojos() -> bool:
	return cat.get("ojos", []) is Array and not cat.get("ojos", []).is_empty() and cuerpo != null and cuerpo.has_method("set_ojos")

func _hay_cejas() -> bool:
	return cat.get("cejas", []) is Array and not cat.get("cejas", []).is_empty() and cuerpo != null and cuerpo.has_method("set_cejas")

func _ids(clave: String) -> Array:
	var r: Array = []
	for x in cat.get(clave, []):
		r.append(str(x["id"]))
	return r

# lo que venga de un guardado: ids que ya no existen se sustituyen por algo válido
func _sanear() -> void:
	var pieles := _ids("pieles")
	if not pieles.is_empty() and not pieles.has(str(est["piel"])):
		est["piel"] = "media" if pieles.has("media") else pieles[0]
	if not _ids("pelos").has(str(est["pelo"]["id"])):
		est["pelo"]["id"] = ""
	for c in capas:
		var ids: Array = []
		for r in cat["ropas"]:
			if str(r.get("capa", "")) == c:
				ids.append(str(r["id"]))
		var id := str(est["ropa"][c]["id"])
		if id != "" and not ids.has(id):
			est["ropa"][c]["id"] = ids[0] if ["arriba", "abajo", "pies"].has(c) else ""
	if _hay_ojos() and not _ids("ojos").has(str(est["ojos"])):
		est["ojos"] = _ids("ojos")[0]
	if _hay_cejas() and not _ids("cejas").has(str(est["cejas"])):
		est["cejas"] = _ids("cejas")[0]
	if str(est["gesto"]) != "" and not _ids("expresiones").has(str(est["gesto"])):
		est["gesto"] = ""
	_vestir_bien()

func _aplicar_est() -> void:
	_vestir_bien()
	for id in est["formas"]:
		cuerpo.set_forma(id, float(est["formas"][id]))
	cuerpo.set_piel(str(est["piel"]))
	cuerpo.set_pelo(str(est["pelo"]["id"]), est["pelo"]["color"])
	for c in est["ropa"]:
		cuerpo.set_ropa(c, str(est["ropa"][c]["id"]), est["ropa"][c]["color"])
	for c in ["arriba", "abajo", "pies", "entero"]:
		if not est["ropa"].has(c):
			cuerpo.set_ropa(c, "", Color.WHITE)    # una capa que el catálogo no trae no se pinta
	if _hay_ojos():
		cuerpo.set_ojos(str(est["ojos"]))
	if _hay_cejas():
		cuerpo.set_cejas(str(est["cejas"]))
	for e in cat.get("expresiones", []):
		cuerpo.set_expresion(str(e["id"]), 1.0 if str(e["id"]) == str(est["gesto"]) else 0.0)

# ====================================================== escena 3D
func _escena() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.77, 0.81, 0.88)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.82, 0.85, 0.95)
	env.ambient_light_energy = 0.38   # con pieles y ropa de textura, más luz quema los claros
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-42, 155, 0)   # llega desde delante-derecha, por encima
	key.light_color = Color(1.0, 0.96, 0.9)
	key.light_energy = 0.58
	key.shadow_enabled = true
	key.shadow_blur = 2.0
	add_child(key)
	var fill := DirectionalLight3D.new()
	fill.rotation_degrees = Vector3(-15, 25, 0)   # relleno suave desde el otro lado
	fill.light_color = Color(0.75, 0.84, 1.0)
	fill.light_energy = 0.2
	add_child(fill)
	var suelo := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(30, 30)
	suelo.mesh = pm
	var ms := StandardMaterial3D.new()
	ms.albedo_color = Color(0.7, 0.74, 0.81)
	ms.roughness = 1.0
	suelo.material_override = ms
	add_child(suelo)
	var peana := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = 0.8
	cm.bottom_radius = 0.82
	cm.height = 0.05
	peana.mesh = cm
	var mp := StandardMaterial3D.new()
	mp.albedo_color = Color(0.9, 0.9, 0.93)
	mp.roughness = 0.9
	peana.material_override = mp
	peana.position = Vector3(0, 0.025, 0)
	add_child(peana)
	giro_nodo = Node3D.new()
	giro_nodo.position = Vector3(0, 0.05, 0)
	add_child(giro_nodo)
	cam = Camera3D.new()
	cam.fov = FOV
	cam.near = 0.1
	cam.far = 60.0
	cam.keep_aspect = Camera3D.KEEP_HEIGHT
	cam.rotation_degrees = Vector3(0, 180, 0)    # el cuerpo mira a -Z: la cámara está en -Z y mira a +Z
	add_child(cam)
	cam.make_current()

func _altura() -> float:
	return float(cuerpo.altura()) if cuerpo != null else 1.7

func _region() -> Vector2:
	var h := get_viewport().get_visible_rect().size.y
	return Vector2(ALTO_BARRA + 6.0, h * FRAC_PANEL - 20.0)

func _objetivo() -> Vector2:
	# (altura del punto al que se mira, alto visible en metros) para la vista actual, antes del pellizco
	var alt := _altura()
	var h := get_viewport().get_visible_rect().size.y
	var r := _region()
	var rh := maxf(80.0, r.y - r.x)
	if vista == "cara":
		return Vector2(alt - 0.135, 0.56 * h / rh)    # de la barbilla a la coronilla (con afro o melena) y algo de hombros
	return Vector2(alt * 0.5 + 0.05, (alt + 0.3) * h / rh)

func _camara(dt: float, instante := false) -> void:
	var o := _objetivo()
	var k := 1.0 if (instante or not v_ya) else clampf(dt * 7.0, 0.0, 1.0)
	v_ya = true
	v_ty = lerpf(v_ty, o.x, k)
	v_vis = lerpf(v_vis, o.y, k)
	var vis := v_vis * zoom
	var d := vis / (2.0 * tan(deg_to_rad(FOV) * 0.5))
	var h := get_viewport().get_visible_rect().size.y
	var r := _region()
	var f := (r.x + r.y) * 0.5 / h           # fracción de pantalla donde cae el centro de la región
	cam.position = Vector3(0, v_ty + 0.05 - (0.5 - f) * vis, -d)

func _process(dt: float) -> void:
	_camara(dt)
	var ahora := Time.get_ticks_msec() / 1000.0
	fps_t.append(ahora)
	while fps_t.size() > 0 and ahora - fps_t[0] > 1.0:
		fps_t.pop_front()
	fps_txt_t -= dt
	if fps_txt_t <= 0.0:
		fps_txt_t = 0.5
		lbl_fps.text = "%d fps" % fps_t.size()
	if aviso_t > 0.0:
		aviso_t -= dt
		lbl_aviso.modulate.a = clampf(aviso_t / 0.4, 0.0, 1.0)
		if aviso_t <= 0.0:
			lbl_aviso.visible = false

# ====================================================== dedo sobre la escena
func _en_ui(p: Vector2) -> bool:
	return (barra != null and barra.get_global_rect().has_point(p)) or (panel != null and panel.get_global_rect().has_point(p))

func _input(e: InputEvent) -> void:
	if e is InputEventScreenTouch:
		if e.pressed:
			if _en_ui(e.position):
				return
			get_viewport().gui_release_focus()
			dedos[e.index] = e.position
			if dedos.size() == 2:
				pinza_ini = _dist_dedos()
				zoom_ini = zoom
		else:
			dedos.erase(e.index)
			if dedos.size() == 1:
				pinza_ini = 0.0
	elif e is InputEventScreenDrag:
		if not dedos.has(e.index):
			return
		var antes: Vector2 = dedos[e.index]
		dedos[e.index] = e.position
		if dedos.size() >= 2:
			if pinza_ini > 10.0:
				zoom = clampf(zoom_ini * pinza_ini / maxf(10.0, _dist_dedos()), 0.45, 1.6)
		else:
			giro_nodo.rotation.y += (e.position.x - antes.x) * 0.012

func _dist_dedos() -> float:
	var v: Array = dedos.values()
	return (v[0] as Vector2).distance_to(v[1] as Vector2)

# ====================================================== interfaz
func _estilo_boton(b: Button, col: Color, sel := false) -> void:
	for n in ["normal", "hover", "pressed", "focus"]:
		var e := StyleBoxFlat.new()
		e.bg_color = (C_SEL if sel else col) if n != "pressed" else (C_SEL.lightened(0.15) if sel else C_PULSADO)
		e.set_corner_radius_all(10)
		e.set_content_margin_all(6)
		if sel:
			e.border_color = Color(1, 1, 1, 0.9)
			e.set_border_width_all(2)
		b.add_theme_stylebox_override(n, e)
	b.add_theme_color_override("font_color", Color(0.08, 0.08, 0.1) if sel else Color(1, 1, 1))
	b.add_theme_color_override("font_pressed_color", Color(0.08, 0.08, 0.1) if sel else Color(1, 1, 1))
	b.add_theme_color_override("font_hover_color", Color(0.08, 0.08, 0.1) if sel else Color(1, 1, 1))
	b.add_theme_color_override("font_focus_color", Color(0.08, 0.08, 0.1) if sel else Color(1, 1, 1))

# dentro de una lista que se desplaza, los botones dejan pasar el toque al contenedor: si no, arrastrar empezando
# sobre un botón no mueve la lista (y en el móvil casi todo son botones). Al empezar a desplazar, el botón no se pulsa.
func _dejar_pasar(n: Node) -> void:
	for h in n.get_children():
		if h is BaseButton:
			(h as BaseButton).mouse_filter = Control.MOUSE_FILTER_PASS
		_dejar_pasar(h)

func _boton(txt: String, f: Callable, alto := 46.0, tam := 16) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(0, alto)
	b.add_theme_font_size_override("font_size", tam)
	b.focus_mode = Control.FOCUS_NONE
	b.clip_text = true
	b.pressed.connect(f)
	_estilo_boton(b, C_BOTON)
	return b

# botón que se marca cuando f() es verdadera
func _boton_marcable(txt: String, accion: Callable, f: Callable, alto := 48.0) -> Button:
	var b := _boton(txt, accion, alto)
	b.set_meta("sel", false)
	marcables.append({"b": b, "f": f})
	return b

func _chip_color(col: Color, nombre_c: String, accion: Callable, f: Callable, txt := "") -> Button:
	var b := Button.new()
	b.text = txt
	b.add_theme_font_size_override("font_size", 13)
	for k in ["font_color", "font_pressed_color", "font_hover_color", "font_focus_color"]:
		b.add_theme_color_override(k, Color(0.1, 0.1, 0.12))
	b.custom_minimum_size = Vector2(0, 46)
	b.focus_mode = Control.FOCUS_NONE
	b.tooltip_text = nombre_c
	b.pressed.connect(accion)
	b.set_meta("col", col)
	_estilo_chip(b, col, false)
	marcables.append({"b": b, "f": f, "chip": true})
	return b

func _estilo_chip(b: Button, col: Color, sel: bool) -> void:
	for n in ["normal", "hover", "pressed", "focus"]:
		var e := StyleBoxFlat.new()
		e.bg_color = col if n != "pressed" else col.lightened(0.2)
		e.set_corner_radius_all(10)
		e.border_color = Color(1, 1, 1) if sel else Color(1, 1, 1, 0.18)
		e.set_border_width_all(4 if sel else 1)
		b.add_theme_stylebox_override(n, e)

func _etiqueta(txt: String, tam := 15, col := Color(0.75, 0.8, 0.92)) -> Label:
	var l := Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", tam)
	l.add_theme_color_override("font_color", col)
	return l

func _interfaz() -> void:
	var cl := CanvasLayer.new()
	add_child(cl)
	ui = Control.new()
	ui.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cl.add_child(ui)
	# ---- barra de arriba
	barra = PanelContainer.new()
	barra.set_anchors_preset(Control.PRESET_TOP_WIDE)
	barra.offset_left = 8
	barra.offset_right = -8
	barra.offset_top = 8
	barra.offset_bottom = ALTO_BARRA - 4.0
	var sb := StyleBoxFlat.new()
	sb.bg_color = C_FONDO
	sb.set_corner_radius_all(14)
	sb.set_content_margin_all(8)
	barra.add_theme_stylebox_override("panel", sb)
	ui.add_child(barra)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	barra.add_child(vb)
	var f1 := HBoxContainer.new()
	f1.add_theme_constant_override("separation", 8)
	vb.add_child(f1)
	f1.add_child(_etiqueta("Nombre", 15))
	ed_nombre = LineEdit.new()
	ed_nombre.text = nombre
	ed_nombre.max_length = 14
	ed_nombre.placeholder_text = "Nombre"
	ed_nombre.custom_minimum_size = Vector2(0, 42)
	ed_nombre.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ed_nombre.add_theme_font_size_override("font_size", 18)
	var le := StyleBoxFlat.new()
	le.bg_color = Color(0.18, 0.21, 0.3)
	le.set_corner_radius_all(10)
	le.set_content_margin_all(8)
	ed_nombre.add_theme_stylebox_override("normal", le)
	ed_nombre.add_theme_stylebox_override("focus", le)
	ed_nombre.text_changed.connect(func(t: String): nombre = t)
	ed_nombre.text_submitted.connect(func(_t: String): ed_nombre.release_focus())
	f1.add_child(ed_nombre)
	ctl["nombre"] = ed_nombre
	var f2 := HBoxContainer.new()
	f2.add_theme_constant_override("separation", 8)
	vb.add_child(f2)
	var b1 := _boton("Al azar", func(): azar(), 42.0)
	var b2 := _boton("Deshacer", func(): deshacer_ultimo(), 42.0)
	var b3 := _boton("Guardar", func(): guardar(), 42.0)
	for b in [b1, b2, b3]:
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		f2.add_child(b)
	b_deshacer = b2
	ctl["azar"] = b1
	ctl["deshacer"] = b2
	ctl["guardar"] = b3
	# ---- botones de vista (sobre la escena, a la derecha)
	var bv := VBoxContainer.new()
	bv.add_theme_constant_override("separation", 6)
	bv.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	bv.offset_left = -92
	bv.offset_right = -10
	bv.offset_top = ALTO_BARRA + 10.0
	ui.add_child(bv)
	var vc := _boton_marcable("Cuerpo", func(): poner_vista("cuerpo"), func(): return vista == "cuerpo", 42.0)
	var vr := _boton_marcable("Cara", func(): poner_vista("cara"), func(): return vista == "cara", 42.0)
	bv.add_child(vc)
	bv.add_child(vr)
	ctl["vista:cuerpo"] = vc
	ctl["vista:cara"] = vr
	# ---- fps
	lbl_fps = _etiqueta("-- fps", 13, Color(0.2, 0.25, 0.35, 0.85))
	lbl_fps.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	lbl_fps.anchor_top = FRAC_PANEL
	lbl_fps.anchor_bottom = FRAC_PANEL
	lbl_fps.offset_left = 12
	lbl_fps.offset_top = -30
	lbl_fps.offset_bottom = -8
	lbl_fps.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(lbl_fps)
	# ---- aviso
	lbl_aviso = Label.new()
	lbl_aviso.visible = false
	lbl_aviso.set_anchors_preset(Control.PRESET_CENTER_TOP)
	lbl_aviso.anchor_left = 0.0
	lbl_aviso.anchor_right = 1.0
	lbl_aviso.offset_top = ALTO_BARRA + 12.0
	lbl_aviso.offset_left = 100
	lbl_aviso.offset_right = -100
	lbl_aviso.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl_aviso.add_theme_font_size_override("font_size", 16)
	var sa := StyleBoxFlat.new()
	sa.bg_color = Color(0.1, 0.12, 0.17, 0.92)
	sa.set_corner_radius_all(12)
	sa.set_content_margin_all(8)
	lbl_aviso.add_theme_stylebox_override("normal", sa)
	lbl_aviso.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(lbl_aviso)
	# ---- panel de abajo
	panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.anchor_top = FRAC_PANEL
	panel.offset_left = 0
	panel.offset_right = 0
	panel.offset_top = 0
	panel.offset_bottom = 0
	var sp := StyleBoxFlat.new()
	sp.bg_color = Color(0.1, 0.12, 0.17, 1.0)
	sp.corner_radius_top_left = 18
	sp.corner_radius_top_right = 18
	sp.content_margin_left = 10
	sp.content_margin_right = 10
	sp.content_margin_top = 10
	sp.content_margin_bottom = 12
	panel.add_theme_stylebox_override("panel", sp)
	ui.add_child(panel)
	var pv := VBoxContainer.new()
	pv.add_theme_constant_override("separation", 8)
	panel.add_child(pv)
	var fila := HBoxContainer.new()
	fila.add_theme_constant_override("separation", 4)
	pv.add_child(fila)
	var cont := Control.new()
	cont.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cont.clip_contents = true
	pv.add_child(cont)
	# pestañas: un grupo de formas por cada grupo del catálogo, y luego piel, pelo, ropa, gesto
	var grupos: Array = []
	for f in cat.get("formas", []):
		var g := str(f.get("grupo", "cuerpo"))
		if not grupos.has(g):
			grupos.append(g)
	for g in ["cuerpo", "cara"]:
		if not grupos.has(g):
			grupos.insert(0 if g == "cuerpo" else mini(1, grupos.size()), g)
	for g in grupos:
		_pestana(str(g), str(g).capitalize(), _pagina_formas(str(g)), fila, cont)
	_pestana("piel", "Piel", _pagina_piel(), fila, cont)
	_pestana("pelo", "Pelo", _pagina_pelo(), fila, cont)
	_pestana("ropa", "Ropa", _pagina_ropa(), fila, cont)
	_pestana("gesto", "Gesto", _pagina_gesto(), fila, cont)
	poner_pestana(str(pestanas[0]["id"]))

func _pestana(id: String, txt: String, pag: ScrollContainer, fila: HBoxContainer, cont: Control) -> void:
	var b := _boton_marcable(txt, func(): poner_pestana(id), func(): return pest_act == id, 44.0)
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b.add_theme_font_size_override("font_size", 14)
	fila.add_child(b)
	pag.set_anchors_preset(Control.PRESET_FULL_RECT)
	pag.visible = false
	cont.add_child(pag)
	_dejar_pasar(pag)
	pestanas.append({"id": id, "txt": txt, "btn": b, "pag": pag})
	ctl["pestana:" + id] = b

func _scroll() -> ScrollContainer:
	var s := ScrollContainer.new()
	s.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	s.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	s.scroll_deadzone = 12
	var v := VBoxContainer.new()
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	v.add_theme_constant_override("separation", 8)
	s.add_child(v)
	return s

func _vb(s: ScrollContainer) -> VBoxContainer:
	return s.get_child(0) as VBoxContainer

func _vacio(s: ScrollContainer, txt: String) -> void:
	_vb(s).add_child(_etiqueta(txt, 15))

func _rejilla(cols: int) -> GridContainer:
	var g := GridContainer.new()
	g.columns = cols
	g.add_theme_constant_override("h_separation", 6)
	g.add_theme_constant_override("v_separation", 6)
	g.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return g

func _pagina_formas(grupo: String) -> ScrollContainer:
	var s := _scroll()
	var hay := false
	if grupo == "cara":
		hay = _extras_cara(s)
	for f in cat.get("formas", []):
		if str(f.get("grupo", "cuerpo")) != grupo:
			continue
		hay = true
		var id := str(f["id"])
		var d := Desliz.new()
		d.nombre = str(f.get("n", id)).replace(" ↔ ", " / ").replace("↔", "–")
		d.vmin = float(f.get("min", -1.0))
		d.vmax = float(f.get("max", 1.0))
		d.vdef = float(f.get("def", 0.0))
		d.valor = float(est["formas"].get(id, d.vdef))
		d.scroll = s
		d.empieza.connect(func():
			pendiente = est.duplicate(true)
			if grupo == "cara":
				poner_vista("cara"))
		d.cambiado.connect(func(v: float): _cambio_forma(id, v))
		_vb(s).add_child(d)
		deslizadores[id] = d
		ctl["forma:" + id] = d
	if not hay:
		_vacio(s, "No hay ajustes en este grupo.")
	return s

# color de ojos y forma de cejas, encima de los deslizadores (solo si el catálogo y el cuerpo los tienen)
func _extras_cara(s: ScrollContainer) -> bool:
	var v := _vb(s)
	var hay := false
	for par in [["ojos", "Color de ojos", _hay_ojos()], ["cejas", "Cejas", _hay_cejas()]]:
		if not par[2]:
			continue
		hay = true
		var clave: String = par[0]
		v.add_child(_etiqueta(par[1]))
		var g := _rejilla(3)
		v.add_child(g)
		for o in cat[clave]:
			var id := str(o["id"])
			var b := _boton_marcable(str(o.get("n", id)).replace("Cejas ", "").capitalize() if clave == "cejas" else str(o.get("n", id)), func(): _hacer(func(): est[clave] = id), func(): return str(est[clave]) == id, 44.0)
			b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			g.add_child(b)
			ctl["%s:%s" % [clave, id]] = b
	if hay:
		v.add_child(_etiqueta("Rasgos"))
	return hay

func _pagina_piel() -> ScrollContainer:
	var s := _scroll()
	var v := _vb(s)
	var base: Array = []
	var mayor: Array = []
	for p in cat.get("pieles", []):
		(mayor if str(p["id"]).ends_with("_mayor") else base).append(p)
	if base.is_empty() and mayor.is_empty():
		_vacio(s, "No hay pieles disponibles.")
		return s
	for grupo in [base, mayor]:
		if grupo.is_empty():
			continue
		if grupo == mayor and not base.is_empty():
			v.add_child(_etiqueta("Piel de persona mayor"))
		var g := _rejilla(4)
		v.add_child(g)
		for p in grupo:
			var id := str(p["id"])
			var txt := str(p.get("n", id)).replace(" (mayor)", "").replace("(mayor)", "")
			var b := _boton_marcable(txt, func(): _hacer(func(): est["piel"] = id), func(): return str(est["piel"]) == id)
			b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			b.add_theme_font_size_override("font_size", 14)
			g.add_child(b)
			ctl["piel:" + id] = b
	return s

func _pagina_pelo() -> ScrollContainer:
	var s := _scroll()
	var v := _vb(s)
	v.add_child(_etiqueta("Peinado"))
	var g := _rejilla(2)
	v.add_child(g)
	for p in cat.get("pelos", []):
		var id := str(p["id"])
		var b := _boton_marcable(str(p.get("n", id)), func(): _hacer(func(): est["pelo"]["id"] = id), func(): return str(est["pelo"]["id"]) == id)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		g.add_child(b)
		ctl["pelo:" + id] = b
	v.add_child(_etiqueta("Color"))
	var gc := _rejilla(4)
	v.add_child(gc)
	for i in COL_PELO.size():
		var col: Color = COL_PELO[i][1]
		var ch := _chip_color(col, str(COL_PELO[i][0]), func(): _hacer(func(): est["pelo"]["color"] = col), func(): return (est["pelo"]["color"] as Color).is_equal_approx(col))
		ch.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		gc.add_child(ch)
		ctl["pelo_color:%d" % i] = ch
	return s

func _pagina_ropa() -> ScrollContainer:
	var s := _scroll()
	var v := _vb(s)
	if capas.is_empty():
		_vacio(s, "No hay ropa disponible.")
	for c in capas:
		var capa: String = c
		v.add_child(_etiqueta(capa.capitalize(), 16, Color(0.95, 0.8, 0.5)))
		var g := _rejilla(2)
		v.add_child(g)
		# arriba y abajo siempre llevan algo (o un «entero» que las sustituye): la ropa interior no es un conjunto
		if not ["arriba", "abajo"].has(capa):
			var bn := _boton_marcable("Ninguna", func(): _hacer(func(): _poner_ropa(capa, "")), func(): return str(est["ropa"][capa]["id"]) == "")
			bn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			g.add_child(bn)
			ctl["ropa:%s:" % capa] = bn
		for r in cat["ropas"]:
			if str(r.get("capa", "")) != capa:
				continue
			var id := str(r["id"])
			var b := _boton_marcable(str(r.get("n", id)), func(): _hacer(func(): _poner_ropa(capa, id)), func(): return str(est["ropa"][capa]["id"]) == id)
			b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			g.add_child(b)
			ctl["ropa:%s:%s" % [capa, id]] = b
		var gc := _rejilla(5)
		v.add_child(gc)
		for i in COL_ROPA.size():
			var col: Color = COL_ROPA[i][1]
			var ch := _chip_color(col, str(COL_ROPA[i][0]), func(): _hacer(func(): est["ropa"][capa]["color"] = col), func(): return (est["ropa"][capa]["color"] as Color).is_equal_approx(col), "Original" if i == 0 else "")
			ch.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			gc.add_child(ch)
			ctl["ropa_color:%s:%d" % [capa, i]] = ch
	return s

# una prenda de arriba o de abajo quita el «entero» (vestido), y al revés
func _poner_ropa(capa: String, id: String) -> void:
	est["ropa"][capa]["id"] = id
	if id != "" and ["arriba", "abajo"].has(capa) and est["ropa"].has("entero"):
		est["ropa"]["entero"]["id"] = ""
	_vestir_bien()

func _primera_ropa(capa: String) -> String:
	for r in cat.get("ropas", []):
		if str(r.get("capa", "")) == capa:
			return str(r["id"])
	return ""

# nunca en ropa interior: con «entero» puesto no hay arriba ni abajo; sin él, las dos capas llevan algo
func _vestir_bien() -> void:
	var r: Dictionary = est["ropa"]
	var entero := r.has("entero") and str(r["entero"]["id"]) != ""
	for c in ["arriba", "abajo"]:
		if not r.has(c):
			continue
		if entero:
			r[c]["id"] = ""
		elif str(r[c]["id"]) == "":
			r[c]["id"] = _primera_ropa(c)

func _pagina_gesto() -> ScrollContainer:
	var s := _scroll()
	var g := _rejilla(2)
	_vb(s).add_child(g)
	for e in cat.get("expresiones", []):
		var id := str(e["id"])
		var b := _boton_marcable(str(e.get("n", id)), func(): _hacer(func(): est["gesto"] = "" if str(est["gesto"]) == id else id), func(): return str(est["gesto"]) == id)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		g.add_child(b)
		ctl["gesto:" + id] = b
	if cat.get("expresiones", []).is_empty():
		_vacio(s, "No hay gestos disponibles.")
	else:
		_vb(s).add_child(_etiqueta("Toca un gesto para ponerlo; tócalo otra vez para quitarlo.", 13))
	return s

# ====================================================== acciones
func poner_pestana(id: String) -> void:
	var ok := false
	for p in pestanas:
		if str(p["id"]) == id:
			ok = true
	if not ok:
		return
	pest_act = id
	if id == "cuerpo" or id == "cara":
		vista = id
		zoom = 1.0
	for p in pestanas:
		(p["pag"] as ScrollContainer).visible = str(p["id"]) == id
	_refrescar()

func poner_vista(v: String) -> void:
	vista = v if v == "cara" else "cuerpo"
	zoom = 1.0
	if vista == "cara" and absf(wrapf(giro_nodo.rotation.y, -PI, PI)) > 0.9:
		giro_nodo.rotation.y = 0.0   # la cara se moldea de frente
	_refrescar()

# toda modificación discreta pasa por aquí: guarda para deshacer, cambia el estado, lo aplica al cuerpo
func _hacer(f: Callable) -> void:
	deshacer.append(est.duplicate(true))
	if deshacer.size() > 60:
		deshacer.pop_front()
	f.call()
	_aplicar_est()
	_refrescar()

func _cambio_forma(id: String, v: float) -> void:
	if pendiente != null:
		deshacer.append(pendiente)
		pendiente = null
		if deshacer.size() > 60:
			deshacer.pop_front()
	est["formas"][id] = v
	cuerpo.set_forma(id, v)

func deshacer_ultimo() -> void:
	if deshacer.is_empty():
		_aviso("Nada que deshacer")
		return
	est = deshacer.pop_back()
	_aplicar_est()
	_refrescar()

func _azar_f() -> float:
	return randf() + randf() - 1.0     # triangular en -1..1: casi siempre cerca del centro

func azar() -> void:
	_hacer(func():
		var F: Dictionary = est["formas"]
		for f in cat.get("formas", []):
			var mn := float(f.get("min", -1.0))
			var mx := float(f.get("max", 1.0))
			var d := float(f.get("def", 0.0))
			F[str(f["id"])] = clampf(d + _azar_f() * 0.35 * (mx - mn) * 0.5, mn, mx)
		# género claramente a un lado u otro (nunca andrógino) y pecho acorde
		var g := 0.0
		if F.has("genero"):
			g = (1.0 if randf() < 0.5 else -1.0) * randf_range(0.65, 0.95)
			F["genero"] = g
		if F.has("pecho"):
			F["pecho"] = clampf((-g if F.has("genero") else _azar_f()) * 0.5 + _azar_f() * 0.25, -0.8, 0.8) if g < 0.0 else clampf(-0.2 + _azar_f() * 0.3, -0.8, 0.3)
		if F.has("edad"):
			F["edad"] = clampf(_azar_f() * 1.1 - 0.05 + (0.35 if randf() < 0.25 else 0.0), -0.8, 1.0)
		if F.has("peso"):
			F["peso"] = clampf(_azar_f() * 0.8, -0.8, 0.8)
		var edad: float = float(F.get("edad", 0.0))
		var mayor_es := edad > 0.45
		var pieles := _ids("pieles")
		if not pieles.is_empty():
			var base: Array = []
			for p in pieles:
				if not p.ends_with("_mayor"):
					base.append(p)
			var pid: String = base[randi() % base.size()] if not base.is_empty() else pieles[randi() % pieles.size()]
			if mayor_es and pieles.has(pid + "_mayor"):
				pid += "_mayor"
			est["piel"] = pid
		var pelos: Array = []
		for p in _ids("pelos"):
			if p != "":
				pelos.append(p)
		est["pelo"]["id"] = pelos[randi() % pelos.size()] if (not pelos.is_empty() and randf() > 0.06) else ""
		var ci := randi() % 6
		if mayor_es and randf() < 0.55:
			ci = 6 + randi() % 2          # gris o blanco
		est["pelo"]["color"] = COL_PELO[ci][1]
		var hombre := g > 0.0
		for c in capas:
			var opc: Array = []
			for id in _ids_capa(c):
				if hombre and (id == "falda" or id == "blusa") and _ids_capa(c).size() > 1:
					continue
				opc.append(id)
			var vestir: bool = ["arriba", "abajo", "pies"].has(c) or randf() < 0.25
			est["ropa"][c]["id"] = opc[randi() % opc.size()] if (vestir and not opc.is_empty()) else ""
			est["ropa"][c]["color"] = COL_ROPA[0][1] if randf() < 0.7 else COL_ROPA[1 + randi() % (COL_ROPA.size() - 1)][1]
		var exp: Array = cat.get("expresiones", [])
		est["gesto"] = str(exp[randi() % exp.size()]["id"]) if (not exp.is_empty() and randf() < 0.2) else ""
		if _hay_ojos():
			est["ojos"] = _ids("ojos")[randi() % _ids("ojos").size()]
		if _hay_cejas():
			est["cejas"] = _ids("cejas")[randi() % _ids("cejas").size()])

func _ids_capa(capa: String) -> Array:
	var r: Array = []
	for x in cat.get("ropas", []):
		if str(x.get("capa", "")) == capa:
			r.append(str(x["id"]))
	return r

func _aviso(txt: String) -> void:
	lbl_aviso.text = txt
	lbl_aviso.visible = true
	lbl_aviso.modulate.a = 1.0
	aviso_t = 1.8

# pone al día lo que se ve: marcas de botones, valores de deslizadores, pestañas
func _refrescar() -> void:
	for m in marcables:
		var b: Button = m["b"]
		var sel: bool = m["f"].call()
		if b.has_meta("pintado") and b.get_meta("sel") == sel:
			continue
		b.set_meta("sel", sel)
		b.set_meta("pintado", true)
		if m.get("chip", false):
			_estilo_chip(b, b.get_meta("col"), sel)
		else:
			_estilo_boton(b, C_BOTON, sel)
	for id in deslizadores:
		var d: Desliz = deslizadores[id]
		if not d.arrastrando:
			d.poner(float(est["formas"].get(id, d.vdef)))
	if b_deshacer != null:
		b_deshacer.modulate.a = 1.0 if not deshacer.is_empty() else 0.55

# ====================================================== guardar y cargar
func _est_json() -> Dictionary:
	var r := {}
	for c in est["ropa"]:
		r[c] = {"id": est["ropa"][c]["id"], "color": (est["ropa"][c]["color"] as Color).to_html(false)}
	return {"formas": est["formas"].duplicate(), "piel": est["piel"],
		"pelo": {"id": est["pelo"]["id"], "color": (est["pelo"]["color"] as Color).to_html(false)}, "ropa": r, "gesto": est["gesto"], "ojos": est["ojos"], "cejas": est["cejas"]}

func _est_de_json(d: Dictionary) -> void:
	var f = d.get("formas", {})
	if f is Dictionary:
		for id in est["formas"]:
			if f.has(id) and (f[id] is float or f[id] is int):
				est["formas"][id] = float(f[id])
	if d.has("piel"):
		est["piel"] = str(d["piel"])
	var p = d.get("pelo", {})
	if p is Dictionary:
		est["pelo"]["id"] = str(p.get("id", est["pelo"]["id"]))
		est["pelo"]["color"] = Color.html(str(p.get("color", est["pelo"]["color"].to_html(false))))
	var r = d.get("ropa", {})
	if r is Dictionary:
		for c in est["ropa"]:
			if r.get(c, null) is Dictionary:
				est["ropa"][c]["id"] = str(r[c].get("id", ""))
				est["ropa"][c]["color"] = Color.html(str(r[c].get("color", est["ropa"][c]["color"].to_html(false))))
	est["gesto"] = str(d.get("gesto", ""))
	est["ojos"] = str(d.get("ojos", est["ojos"]))
	est["cejas"] = str(d.get("cejas", est["cejas"]))
	_sanear()

func _texto_guardado() -> String:
	return JSON.stringify({"v": 1, "nombre": nombre, "aspecto": cuerpo.aspecto(), "ui": _est_json()})

func guardar() -> void:
	var txt := _texto_guardado()
	if OS.has_feature("web"):
		JavaScriptBridge.eval("try{window.localStorage.setItem(%s,%s)}catch(e){}" % [JSON.stringify(CLAVE), JSON.stringify(txt)])
	else:
		var f := FileAccess.open(ARCHIVO, FileAccess.WRITE)
		if f != null:
			f.store_string(txt)
	_aviso("Personaje guardado")

func _cargar() -> void:
	var txt := ""
	if OS.has_feature("web"):
		var r = JavaScriptBridge.eval("window.localStorage.getItem(%s)" % JSON.stringify(CLAVE))
		txt = "" if r == null else str(r)
	elif FileAccess.file_exists(ARCHIVO):
		txt = FileAccess.get_file_as_string(ARCHIVO)
	if txt == "":
		return
	var d = JSON.parse_string(txt)
	if not (d is Dictionary):
		return
	nombre = str(d.get("nombre", nombre)).substr(0, 14)
	ed_nombre.text = nombre
	if d.get("ui", null) is Dictionary:
		_est_de_json(d["ui"])
	if d.get("aspecto", null) is Dictionary:
		cuerpo.aplicar(d["aspecto"])
	_sanear()
	_aplicar_est()    # lo último que manda es el estado ya saneado

# ====================================================== órdenes de prueba
func _rect_txt(c: Control) -> String:
	var r := c.get_global_rect()
	return "%d,%d,%d,%d" % [r.position.x, r.position.y, r.size.x, r.size.y]

func _cmd_js(args: Array) -> void:
	var c := str(args[0])
	var a1 = args[1] if args.size() > 1 else null
	var a2 = args[2] if args.size() > 2 else null
	match c:
		"forma":
			var id := str(a1)
			if est["formas"].has(id):
				_hacer(func(): est["formas"][id] = float(a2))
		"piel":
			_hacer(func(): est["piel"] = str(a1))
		"pelo":
			_hacer(func():
				est["pelo"]["id"] = str(a1)
				if a2 != null:
					est["pelo"]["color"] = COL_PELO[clampi(int(a2), 0, COL_PELO.size() - 1)][1])
		"ropa":
			var capa := str(a1)
			if est["ropa"].has(capa):
				_hacer(func():
					est["ropa"][capa]["id"] = str(a2) if a2 != null else ""
					if args.size() > 3:
						est["ropa"][capa]["color"] = COL_ROPA[clampi(int(args[3]), 0, COL_ROPA.size() - 1)][1])
		"ojos":
			_hacer(func(): est["ojos"] = str(a1))
		"cejas":
			_hacer(func(): est["cejas"] = str(a1))
		"gesto":
			_hacer(func(): est["gesto"] = "" if str(est["gesto"]) == str(a1) else str(a1))
		"azar":
			azar()
		"deshacer":
			deshacer_ultimo()
		"guardar":
			guardar()
		"estado":
			print("estado: " + JSON.stringify({"nombre": nombre, "vista": vista, "pestana": pest_act, "giro": snappedf(giro_nodo.rotation.y, 0.001), "zoom": snappedf(zoom, 0.01), "aspecto": cuerpo.aspecto()}))
		"pestana":
			poner_pestana(str(a1))
		"vista":
			poner_vista(str(a1))
		"fps":
			print("fps: %d" % fps_t.size())
		"controles":
			var n := 0
			for k in ctl:
				if k.begins_with("forma:"):
					n += 1
			print("controles: formas=%d pestanas=%d catalogo=%d de_pega=%s" % [n, pestanas.size(), cat.get("formas", []).size(), str(Maniqui.es_de_pega())])
		"rect":
			var k := str(a1)
			if ctl.has(k):
				print("rect: %s %s" % [k, _rect_txt(ctl[k])])
			elif k == "escena":
				var r := _region()
				print("rect: escena 0,%d,%d,%d" % [r.x, get_viewport().get_visible_rect().size.x, r.y - r.x])
			elif k == "panel":
				print("rect: panel " + _rect_txt(panel))
			else:
				print("rect: no existe " + k)
		"scroll":
			for p in pestanas:
				if str(p["id"]) == pest_act:
					print("scroll: %d" % int((p["pag"] as ScrollContainer).scroll_vertical))
