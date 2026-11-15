class_name Inicio
extends RefCounted
# EMPEZAR: lo que pasa antes de montar el mundo (main._ready lo espera con `await Inicio.new(main).correr()`).
#   - Con partida guardada: portada con «Continuar» y «Partida nueva» (esta pide confirmación y borra la partida).
#   - Partida nueva: pantalla de elegir personaje (ElegirPersonaje, scripts/elegir.gd) y después la situación de partida:
#     nombre (editable), la llegada al barrio contada en dos frases y, si el bloque de TRABAJO existe, su elección de
#     trabajo inicial (`Trabajo.ofertas_inicio`, ver más abajo). Botón «Empezar».
# Devuelve {"modelo", "nueva", "nombre", "trabajo", "atajo"}.
#
# Pruebas (window.casita_cmd): la primera orden que llega con una de estas pantallas abiertas toma el camino corto
# (portada -> Continuar; elegir -> Kate; situación -> se salta, sin cambiar el dinero) y queda en main.cmd_pendiente,
# que main ejecuta cuando el mundo está listo. Así t/g2a_vivir y las demás siguen arrancando sin pasos extra.
#
# Trabajo inicial: `Trabajo.ofertas_inicio(main, modelo)` (scripts/trabajo.gd) da el puesto inicial de data/trabajo.json
# (camarera de mediodía en el Bar Manolo) y algunas ofertas de la semana a las que se puede optar; más «Sin trabajo, a buscar».
# La elegida vuelve en "trabajo" (id o "") y, con el mundo montado, Objetivos.empezar llama a main.trabajo.elegir_inicial(id).
# Dinero: objetivos.inicio.dinero (480 €) es lo que queda en la cuenta con la fianza y el primer mes de alquiler ya pagados.

signal _paso(valor)

# «Cambiar personaje» recarga la escena con la partida ya guardada: esa vez no sale la portada
static var saltar_portada := false
static var T: Dictionary = {}       # data/objetivos.json

var m: Node
var capa: CanvasLayer
var atajo := false
var _defecto := Callable()          # lo que hace la pantalla abierta si llega una orden de prueba

func _init(main_: Node) -> void:
	m = main_
	if T.is_empty():
		T = Datos.cargar("objetivos")

func correr() -> Dictionary:
	var modelo := Guardado.modelo_guardado()
	var nueva := modelo == ""
	var res := {"modelo": modelo, "nueva": nueva, "nombre": "", "trabajo": "", "atajo": false}
	var portada := not nueva and not saltar_portada
	saltar_portada = false
	if not portada and not nueva:
		return res
	m.set_process(false)
	m.set_process_input(false)
	capa = CanvasLayer.new()
	capa.layer = 20
	m.add_child(capa)
	_puente_prueba()
	if portada:
		var r = await _portada(modelo)
		if r == "nueva":
			Guardado._quitar(Guardado.CLAVE)
			nueva = true
	if nueva:
		var el := ElegirPersonaje.new(m.personas.get("personaje_base", {}), Figura.MODELO_DEFECTO, m.fuente)
		capa.add_child(el)
		_defecto = func(): el.elegido.emit(Figura.MODELO_DEFECTO)
		modelo = await el.elegido
		el.queue_free()
		if not atajo:
			var sit: Dictionary = await _situacion(modelo)
			res["nombre"] = sit["nombre"]
			res["trabajo"] = sit["trabajo"]
	capa.queue_free()
	m.set_process(true)
	m.set_process_input(true)
	res["modelo"] = modelo
	res["nueva"] = nueva
	res["atajo"] = atajo
	return res

func _puente_prueba() -> void:
	if not OS.has_feature("web"):
		return
	m.js_cb = JavaScriptBridge.create_callback(func(args: Array):
		if m.cmd_pendiente.is_empty():
			m.cmd_pendiente = args.duplicate()
			atajo = true
			if _defecto.is_valid():
				_defecto.call_deferred())
	JavaScriptBridge.get_interface("window").casita_cmd = m.js_cb

# =============== textos ===============
static func tx(sec: String, k: String, h := {}) -> String:
	var s := str(T.get(sec, {}).get(k, k))
	for c in h:
		s = s.replace("{%s}" % c, str(h[c]))
	return s

# terminación del género del personaje en los textos ({o}: a/o)
static func genero(txt: String, modelo: String) -> String:
	var g := str(Figura.jugable(modelo).get("genero", "f"))
	return txt.replace("{o}", "a" if g == "f" else "o")

static func eur(x: float) -> String:
	var s := str(int(round(absf(x))))
	var o := ""
	while s.length() > 3:
		o = "." + s.substr(s.length() - 3) + o
		s = s.substr(0, s.length() - 3)
	return ("-" if x < 0.0 else "") + s + o + " €"

# la clase global de otro bloque (Trabajo…), o null si no existe todavía
static func clase(nombre: String) -> Script:
	for c in ProjectSettings.get_global_class_list():
		if str(c.get("class", "")) == nombre:
			return load(str(c["path"]))
	return null

static func tiene(scr: Script, metodo: String) -> bool:
	if scr == null:
		return false
	for f in scr.get_script_method_list():
		if str(f.get("name", "")) == metodo:
			return true
	return false

# =============== portada ===============
# resumen de la partida guardada: nombre, día y hora
static func resumen_guardada(modelo: String, base: Dictionary) -> String:
	var j := JSON.new()
	if j.parse(Guardado._leer(Guardado.CLAVE)) != OK or not (j.data is Dictionary):
		return ""
	var s: Dictionary = j.data.get("secciones", {})
	var nombre := Figura.nombre_de(modelo, base)
	var ini = s.get("inicio", {})
	if ini is Dictionary and str(ini.get("nombre", "")) != "":
		nombre = str(ini["nombre"])
	var mins := 540.0
	var rl = s.get("reloj", {})
	if rl is Dictionary and (rl.get("minutos", null) is float or rl.get("minutos", null) is int):
		mins = float(rl["minutos"])
	var dia := int(mins / 1440.0)
	return tx("portada", "partida", {"nombre": nombre, "dia": m_dias()[dia % 7], "n": dia + 1,
		"hora": "%02d:%02d" % [int(fposmod(mins, 1440.0) / 60.0), int(fposmod(mins, 60.0))]})

static func m_dias() -> Array:
	return ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

func _fondo() -> Control:
	var raiz := Control.new()
	raiz.set_anchors_preset(Control.PRESET_FULL_RECT)
	raiz.mouse_filter = Control.MOUSE_FILTER_STOP
	var th := Theme.new()
	th.default_font = m.fuente
	th.default_font_size = 17
	raiz.theme = th
	var bg := ColorRect.new()
	bg.color = Color(0.93, 0.85, 0.74)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.add_child(bg)
	capa.add_child(raiz)
	return raiz

static func etiqueta(txt: String, fs: int, col: Color, centro := true) -> Label:
	var l := Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", fs)
	l.add_theme_color_override("font_color", col)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	if centro:
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	return l

static func boton(txt: String, f: Callable, alto := 54, fs := 19, c := Color(0.3, 0.36, 0.5)) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(0, alto)
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", fs)
	b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	if f.is_valid():
		b.pressed.connect(f)
	for n in ["normal", "hover", "pressed", "focus", "disabled"]:
		var e := StyleBoxFlat.new()
		e.bg_color = c if n != "pressed" else c.lightened(0.2)
		if n == "disabled":
			e.bg_color = c.darkened(0.35)
		e.set_corner_radius_all(12)
		e.set_content_margin_all(8)
		b.add_theme_stylebox_override(n, e)
	return b

static func panel_oscuro() -> PanelContainer:
	var p := PanelContainer.new()
	var est := StyleBoxFlat.new()
	est.bg_color = Color(0.1, 0.11, 0.15, 0.92)
	est.set_corner_radius_all(18)
	est.set_content_margin_all(16)
	p.add_theme_stylebox_override("panel", est)
	return p

func _portada(modelo: String):
	var raiz := _fondo()
	var arriba := VBoxContainer.new()
	arriba.set_anchors_preset(Control.PRESET_TOP_WIDE)
	arriba.offset_top = 120
	arriba.add_theme_constant_override("separation", 2)
	raiz.add_child(arriba)
	arriba.add_child(etiqueta(tx("portada", "titulo"), 52, Color(0.25, 0.17, 0.12)))
	arriba.add_child(etiqueta(tx("portada", "sub"), 20, Color(0.45, 0.36, 0.3)))
	var lema := etiqueta(tx("portada", "lema"), 16, Color(0.5, 0.42, 0.36))
	lema.custom_minimum_size.y = 60
	lema.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	arriba.add_child(lema)
	var abajo := panel_oscuro()
	abajo.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	abajo.grow_vertical = Control.GROW_DIRECTION_BEGIN
	abajo.offset_left = 12
	abajo.offset_right = -12
	abajo.offset_bottom = -18
	raiz.add_child(abajo)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 10)
	abajo.add_child(vb)
	var info := etiqueta(resumen_guardada(modelo, m.personas.get("personaje_base", {})), 16, Color(0.8, 0.83, 0.9))
	vb.add_child(info)
	var aviso := etiqueta(tx("portada", "aviso_nueva"), 16, Color(1.0, 0.85, 0.6))
	vb.add_child(aviso)
	var b_cont := boton(tx("portada", "continuar"), func(): _paso.emit("continuar"), 60, 22, Color(0.3, 0.62, 0.38))
	var b_nueva := boton(tx("portada", "nueva"), Callable(), 48, 17)
	var b_si := boton(tx("portada", "si"), func(): _paso.emit("nueva"), 52, 18, Color(0.7, 0.32, 0.28))
	var b_no := boton(tx("portada", "no"), Callable(), 48, 17)
	var conf := func(si: bool):
		aviso.visible = si
		b_si.visible = si
		b_no.visible = si
		b_cont.visible = not si
		b_nueva.visible = not si
		info.visible = not si
	b_nueva.pressed.connect(conf.bind(true))
	b_no.pressed.connect(conf.bind(false))
	for b in [b_cont, b_nueva, b_si, b_no]:
		vb.add_child(b)
	conf.call(false)
	_defecto = func(): _paso.emit("continuar")
	var r = await _paso
	_defecto = Callable()
	raiz.queue_free()
	return r

# =============== situación de partida ===============
func _situacion(modelo: String):
	var base: Dictionary = m.personas.get("personaje_base", {})
	var nombre := Figura.nombre_de(modelo, base)
	var edad := int(Figura.aspecto_jugador(base, modelo).get("edad", 27))
	var trabajo := ""
	var raiz := _fondo()
	var scroll := ScrollContainer.new()
	scroll.set_anchors_preset(Control.PRESET_FULL_RECT)
	scroll.offset_left = 18
	scroll.offset_right = -18
	scroll.offset_top = 40
	scroll.offset_bottom = -104
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	raiz.add_child(scroll)
	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	vb.add_theme_constant_override("separation", 10)
	scroll.add_child(vb)
	vb.add_child(etiqueta(tx("inicio", "titulo"), 30, Color(0.25, 0.17, 0.12)))
	# nombre
	var fila := HBoxContainer.new()
	fila.add_theme_constant_override("separation", 8)
	vb.add_child(fila)
	var ln := etiqueta(tx("inicio", "nombre"), 17, Color(0.35, 0.27, 0.22), false)
	ln.autowrap_mode = TextServer.AUTOWRAP_OFF
	ln.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	fila.add_child(ln)
	var ed := LineEdit.new()
	ed.text = nombre
	ed.max_length = 14
	ed.custom_minimum_size = Vector2(0, 48)
	ed.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ed.add_theme_font_size_override("font_size", 22)
	ed.add_theme_color_override("font_color", Color(0.2, 0.14, 0.1))
	var le := StyleBoxFlat.new()
	le.bg_color = Color(1, 0.98, 0.94)
	le.set_corner_radius_all(10)
	le.set_content_margin_all(8)
	le.border_color = Color(0.75, 0.6, 0.45)
	le.set_border_width_all(2)
	ed.add_theme_stylebox_override("normal", le)
	ed.add_theme_stylebox_override("focus", le)
	ed.text_submitted.connect(func(_t): ed.release_focus())
	fila.add_child(ed)
	if OS.has_feature("web"):
		# en el móvil el teclado no sale con el LineEdit de Godot: el del navegador sí
		var bc := boton(tx("inicio", "cambiar_nombre"), func():
			var r = JavaScriptBridge.eval("window.prompt(%s,%s)" % [JSON.stringify(tx("inicio", "pedir_nombre")), JSON.stringify(ed.text)])
			if r != null and str(r).strip_edges() != "":
				ed.text = str(r).strip_edges().substr(0, 14), 48, 16)
		bc.custom_minimum_size.x = 96
		fila.add_child(bc)
	var historia := etiqueta("", 16, Color(0.25, 0.2, 0.17), false)
	vb.add_child(historia)
	var pinta := func():
		historia.text = genero(tx("inicio", "texto", {"nombre": ed.text.strip_edges() if ed.text.strip_edges() != "" else nombre,
			"edad": edad, "dinero": eur(float(T["inicio"].get("dinero", 480)))}), modelo) + "\n\n" + tx("inicio", "casa", {"alquiler": eur(Cuenta.alquiler_datos())})
	ed.text_changed.connect(func(_t): pinta.call())
	pinta.call()
	# trabajo: el puesto inicial y ofertas de la semana (scripts/trabajo.gd)
	var ofertas: Array = Trabajo.ofertas_inicio(m, modelo, 2)
	if not ofertas.is_empty():
		trabajo = str(ofertas[0]["id"])
	if ofertas.is_empty():
		vb.add_child(etiqueta(tx("inicio", "sin_trabajo"), 18, Color(0.45, 0.25, 0.18), false))
	else:
		vb.add_child(etiqueta(tx("inicio", "elige_trabajo"), 16, Color(0.35, 0.27, 0.22), false))
		var g := ButtonGroup.new()
		var opciones: Array = ofertas.duplicate()
		opciones.append({"id": "", "n": tx("inicio", "boton_sin_trabajo")})
		for of in opciones:
			if not (of is Dictionary):
				continue
			var txt := "%s %s" % [str(of.get("e", "")), str(of.get("n", of.get("id", "")))]
			if str(of.get("d", "")) != "":
				txt += "\n" + str(of["d"])
			var id := str(of.get("id", ""))
			var b := boton(txt.strip_edges(), func(): trabajo = id, 52, 15)
			b.toggle_mode = true
			b.button_group = g
			b.alignment = HORIZONTAL_ALIGNMENT_LEFT
			var sel := StyleBoxFlat.new()
			sel.bg_color = Color(0.3, 0.62, 0.38)
			sel.set_corner_radius_all(12)
			sel.set_content_margin_all(8)
			b.add_theme_stylebox_override("pressed", sel)
			b.button_pressed = id == trabajo
			vb.add_child(b)
	var abajo := panel_oscuro()
	abajo.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	abajo.grow_vertical = Control.GROW_DIRECTION_BEGIN
	abajo.offset_left = 12
	abajo.offset_right = -12
	abajo.offset_bottom = -18
	raiz.add_child(abajo)
	abajo.add_child(boton(tx("inicio", "boton"), func(): _paso.emit("empezar"), 58, 22, Color(0.3, 0.62, 0.38)))
	_defecto = func(): _paso.emit("empezar")
	await _paso
	_defecto = Callable()
	var n := ed.text.strip_edges()
	raiz.queue_free()
	return {"nombre": n if n != "" else nombre, "trabajo": trabajo}
