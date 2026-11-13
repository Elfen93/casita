class_name Guardado
extends RefCounted
# GD-6: guardar y cargar la partida. Toda la lógica vive aquí; main.gd solo tiene ganchos «# --- guardado ---».
#
# Formato (texto JSON): {"v":1, "t":<marca de tiempo>, "secciones":{ "nombre":{"v":1, ...campos...}, ... }}
# Cada sistema registra su sección con `registrar(nombre, version, fn_guardar, fn_aplicar)`:
#   fn_guardar() -> Dictionary      (los campos; `v` lo añade Guardado)
#   fn_aplicar(d: Dictionary)       (debe leer con d.get(campo, valor_actual): lo que falte se queda como está)
# Sección desconocida al cargar -> se ignora; sección o campo ausente -> valor por defecto.

const CLAVE := "casita3d_partida"
const CLAVE_ROTA := "casita3d_partida_rota"
const ARCHIVO := "user://partida.json"
const ARCHIVO_ROTO := "user://partida_rota.json"
const VERSION := 1
const CADA_SEG := 120.0          # autoguardado, en segundos reales

# En web los escuchas del navegador se registran una sola vez aunque se recargue la escena.
static var _destino: Guardado = null
static var _escuchas_listos := false
static var _cb_oculta
static var _cb_cierre

var main: Node
var secciones := {}              # nombre -> {"v", "guardar", "aplicar"}
var reloj_s := 0.0
var estaba_en_salto := false
var bloqueado := false           # mientras se reinicia la partida no se guarda nada
var recuperada_aviso := ""
var btn_menu: Button
var panel: PanelContainer
var btn_guardar: Button
var btn_nueva: Button
var btn_sicero: Button
var btn_no: Button
var btn_cerrar: Button

func _init(m: Node) -> void:
	main = m
	_destino = self
	_registrar_basicas()

# =============== secciones ===============
func registrar(nombre: String, version: int, fn_guardar: Callable, fn_aplicar: Callable) -> void:
	secciones[nombre] = {"v": version, "guardar": fn_guardar, "aplicar": fn_aplicar}

func _registrar_basicas() -> void:
	registrar("reloj", 1, func(): return {"minutos": main.minutos, "vel": main.vel_juego},
		func(d: Dictionary):
			main.minutos = _num(d, "minutos", main.minutos)
			main.vel_juego = clampi(int(_num(d, "vel", main.vel_juego)), 1, 5))
	registrar("cartera", 1, func(): return {"dinero": main.dinero},
		func(d: Dictionary): main.dinero = _num(d, "dinero", main.dinero))
	registrar("necesidades", 1, func(): return main.nec.duplicate(),
		func(d: Dictionary):
			for k in main.nec:
				main.nec[k] = clampf(_num(d, k, main.nec[k]), 0.0, 100.0))
	registrar("habilidades", 1, func(): return main.hab.duplicate(),
		func(d: Dictionary):
			for k in main.hab:
				main.hab[k] = _num(d, k, main.hab[k]))
	registrar("trabajo", 1, func(): return {"bar": main.trabaja_bar},
		func(d: Dictionary): main.trabaja_bar = bool(d.get("bar", main.trabaja_bar)))
	# banderas de la vida en casa (platos sin fregar…): solo valores sí/no
	registrar("vida_casa", 1, func(): return main.estado_casa.duplicate(),
		func(d: Dictionary):
			for k in d:
				if d[k] is bool:
					main.estado_casa[str(k)] = d[k])
	registrar("jugador", 1, _guardar_jugador, _aplicar_jugador)
	registrar("camara", 1, _guardar_camara, _aplicar_camara)

func _num(d: Dictionary, k: String, defecto: float) -> float:
	var x = d.get(k, null)
	if (x is float or x is int) and is_finite(float(x)):
		return float(x)
	return defecto

func _guardar_jugador() -> Dictionary:
	# escondido dentro de un edificio sin interior no hay posición que guardar: se vuelve a la puerta de casa.
	# En un interior andable (tu piso, el bar) sí: se vuelve a aparecer dentro.
	if main.dentro:
		return {}
	var p: Vector3 = main.jugador.nodo.position
	return {"x": snappedf(p.x, 0.01), "z": snappedf(p.z, 0.01)}

func _aplicar_jugador(d: Dictionary) -> void:
	if not (d.has("x") and d.has("z")):
		return
	var p := Vector2(_num(d, "x", 0.0), _num(d, "z", 0.0))
	if main.nav != null:
		if not main.nav.grid.region.has_point(main.nav.celda(p)):
			return
		if main.nav.solido(p):
			# guardado sentado o tumbado sobre un mueble: de pie en el hueco libre más cercano
			p = main.nav.centro(main.nav.libre_cerca(p))
	main.jugador.poner(p)
	main.jugador.ruta = []
	main.pivote.position = main.jugador.nodo.position

func _guardar_camara() -> Dictionary:
	var d := {"libre": main.cam_libre}
	if not main.en_interior:
		d["dist"] = snappedf(main.dist, 0.1)
	return d

func _aplicar_camara(d: Dictionary) -> void:
	main.cam_libre = bool(d.get("libre", main.cam_libre))
	main.seguir = not main.cam_libre
	if d.has("dist") and not main.en_interior:
		main.dist = _num(d, "dist", main.dist)
	main._texto_camara()
	main._poner_camara()

# =============== texto de la partida ===============
func a_texto() -> String:
	var s := {}
	for n in secciones:
		var d: Dictionary = secciones[n]["guardar"].call()
		d["v"] = secciones[n]["v"]
		s[n] = d
	return JSON.stringify({"v": VERSION, "t": Time.get_unix_time_from_system(), "secciones": s})

# Devuelve "ok", "vacia" o "rota"
func desde_texto(txt: String) -> String:
	if txt.strip_edges() == "":
		return "vacia"
	var j := JSON.new()
	if j.parse(txt) != OK or not (j.data is Dictionary):
		return "rota"
	var raiz: Dictionary = j.data
	var ss = raiz.get("secciones", null)
	if not (ss is Dictionary):
		return "rota"
	for n in ss:
		if not secciones.has(n) or not (ss[n] is Dictionary):
			continue
		secciones[n]["aplicar"].call(ss[n])
	return "ok"

# =============== almacenamiento ===============
func _web() -> bool:
	return OS.has_feature("web")

func _leer(clave: String) -> String:
	if _web():
		var r = JavaScriptBridge.eval("window.localStorage.getItem(%s)" % JSON.stringify(clave))
		return "" if r == null else str(r)
	var ruta := ARCHIVO if clave == CLAVE else ARCHIVO_ROTO
	if not FileAccess.file_exists(ruta):
		return ""
	return FileAccess.get_file_as_string(ruta)

func _escribir(clave: String, txt: String) -> void:
	if _web():
		JavaScriptBridge.eval("try{window.localStorage.setItem(%s,%s)}catch(e){}" % [JSON.stringify(clave), JSON.stringify(txt)])
		return
	var f := FileAccess.open(ARCHIVO if clave == CLAVE else ARCHIVO_ROTO, FileAccess.WRITE)
	if f != null:
		f.store_string(txt)

func _quitar(clave: String) -> void:
	if _web():
		JavaScriptBridge.eval("window.localStorage.removeItem(%s)" % JSON.stringify(clave))
	else:
		var ruta := ARCHIVO if clave == CLAVE else ARCHIVO_ROTO
		if FileAccess.file_exists(ruta):
			DirAccess.remove_absolute(ruta)

# =============== operaciones ===============
func _en_salto() -> bool:
	return main.salto_rest > 0.0 or main.velo.visible

func guardar() -> bool:
	if bloqueado or not is_instance_valid(main) or _en_salto():
		return false
	_escribir(CLAVE, a_texto())
	reloj_s = 0.0
	return true

func cargar() -> String:
	var txt := _leer(CLAVE)
	var r := desde_texto(txt)
	if r == "rota":
		_escribir(CLAVE_ROTA, txt)
		_quitar(CLAVE)
		return r
	if r == "ok":
		main._actualizar_vecinos(true)
		main._hud()
		main._sol()
	return r

func cargar_inicio() -> String:
	var r := cargar()
	if r == "ok":
		var dia := int(main.minutos / 1440.0)
		main._aviso("Partida recuperada · %s, día %d" % [main.DIAS[dia % 7], dia + 1])
	return r

func borrar() -> void:
	_quitar(CLAVE)

func partida_nueva() -> void:
	bloqueado = true
	borrar()
	main.get_tree().reload_current_scene()

# =============== bucle y órdenes de prueba ===============
func tick(dt: float) -> void:
	var salto := _en_salto()
	if estaba_en_salto and not salto:
		guardar()
	estaba_en_salto = salto
	reloj_s += dt
	if reloj_s >= CADA_SEG:
		if not guardar():
			reloj_s = CADA_SEG - 5.0

func cmd(c: String, _a) -> bool:
	match c:
		"guardar":
			print("guardar: %s" % str(guardar()))
		"cargar":
			print("cargar: %s" % cargar_inicio())
		"borrar_partida":
			borrar()
			print("borrar_partida: hecho")
		_:
			return false
	return true

# =============== escuchas del navegador ===============
func escuchas_web() -> void:
	if not _web() or _escuchas_listos:
		return
	_escuchas_listos = true
	_cb_oculta = JavaScriptBridge.create_callback(func(_args): _guardar_destino())
	_cb_cierre = JavaScriptBridge.create_callback(func(_args): _guardar_destino())
	JavaScriptBridge.get_interface("document").addEventListener("visibilitychange", _cb_oculta)
	JavaScriptBridge.get_interface("window").addEventListener("pagehide", _cb_cierre)

static func _guardar_destino() -> void:
	if _destino != null:
		_destino.guardar()

# =============== interfaz ===============
func crear_ui(ui: Control) -> void:
	btn_menu = Button.new()
	btn_menu.text = "Menú"
	btn_menu.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	btn_menu.offset_right = -8
	btn_menu.offset_left = -176
	btn_menu.offset_top = 142
	btn_menu.offset_bottom = 188
	btn_menu.add_theme_font_size_override("font_size", 16)
	btn_menu.pressed.connect(func(): _abrir_panel(true))
	ui.add_child(btn_menu)
	panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -150
	panel.offset_right = 150
	panel.offset_top = 0
	panel.offset_bottom = 0
	panel.grow_vertical = Control.GROW_DIRECTION_BOTH
	var est := StyleBoxFlat.new()
	est.bg_color = Color(0.1, 0.11, 0.15, 0.96)
	est.set_corner_radius_all(14)
	est.set_content_margin_all(14)
	panel.add_theme_stylebox_override("panel", est)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 10)
	panel.add_child(vb)
	var t := Label.new()
	t.text = "Menú"
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	t.add_theme_font_size_override("font_size", 20)
	vb.add_child(t)
	btn_guardar = _boton(vb, "Guardar ahora", func():
		if guardar():
			main._aviso("Partida guardada")
			_abrir_panel(false)
		else:
			main._aviso("Ahora no se puede guardar"))
	btn_nueva = _boton(vb, "Partida nueva", func(): _confirmacion(true))
	btn_sicero = _boton(vb, "Sí, empezar de cero", partida_nueva)
	btn_no = _boton(vb, "No, volver", func(): _confirmacion(false))
	btn_cerrar = _boton(vb, "Cerrar", func(): _abrir_panel(false))
	panel.visible = false
	ui.add_child(panel)
	_confirmacion(false)

func _boton(vb: VBoxContainer, txt: String, f: Callable) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(0, 50)
	b.add_theme_font_size_override("font_size", 17)
	b.pressed.connect(f)
	for n in ["normal", "hover", "pressed", "focus"]:
		var e := StyleBoxFlat.new()
		e.bg_color = Color(0.3, 0.36, 0.5) if n != "pressed" else Color(0.42, 0.5, 0.68)
		e.set_corner_radius_all(10)
		b.add_theme_stylebox_override(n, e)
	vb.add_child(b)
	return b

func _confirmacion(si: bool) -> void:
	btn_guardar.visible = not si
	btn_nueva.visible = not si
	btn_cerrar.visible = not si
	btn_sicero.visible = si
	btn_no.visible = si

func _abrir_panel(v: bool) -> void:
	_confirmacion(false)
	panel.visible = v

func en_ui(p: Vector2) -> bool:
	return (btn_menu != null and btn_menu.get_global_rect().has_point(p)) or (panel != null and panel.visible and panel.get_global_rect().has_point(p))
