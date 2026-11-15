class_name ElegirPersonaje
extends Control
# Pantalla de elegir con quién se juega (Figura.JUGABLES): el personaje girando en 3D, flechas, nombre y «Jugar».
# Sale al empezar partida nueva (main._ready la espera) y desde Menú → «Cambiar personaje» (con «Cancelar»).
# Se monta entera en código; funciona con el árbol en pausa. Los personajes sin glb se saltan (Figura.jugables_disponibles).

signal elegido(modelo: String)
signal cancelado

const GIRO_VEL := 0.6            # rad/s del giro solo
const PAUSA_GIRO := 2.5          # s sin girar solo tras arrastrar con el dedo

var base := {}
var lista: Array = []
var i := 0
var cambiar := false
var fuente: Font

var vista: SubViewport
var giro: Node3D
var persona: Node3D
var lbl_nombre: Label
var lbl_info: Label
var btn_jugar: Button
var _quieto := 0.0

func _init(base_: Dictionary, actual: String, fuente_: Font = null, cambiar_ := false) -> void:
	base = base_
	cambiar = cambiar_
	fuente = fuente_
	lista = Figura.jugables_disponibles()
	for k in lista.size():
		if lista[k]["modelo"] == actual:
			i = k
	process_mode = Node.PROCESS_MODE_ALWAYS
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP

func _ready() -> void:
	var th := Theme.new()
	if fuente != null:
		th.default_font = fuente
	th.default_font_size = 18
	theme = th
	_montar_3d()
	_montar_ui()
	_poner()

# =============== 3D ===============
func _montar_3d() -> void:
	var cont := SubViewportContainer.new()
	cont.stretch = true
	cont.set_anchors_preset(Control.PRESET_FULL_RECT)
	cont.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(cont)
	vista = SubViewport.new()
	vista.own_world_3d = true
	vista.msaa_3d = Viewport.MSAA_DISABLED
	cont.add_child(vista)
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.93, 0.85, 0.74)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.85, 0.85, 0.9)
	env.ambient_light_energy = 0.8
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_exposure = 0.8
	var we := WorldEnvironment.new()
	we.environment = env
	vista.add_child(we)
	var luz := DirectionalLight3D.new()
	luz.rotation_degrees = Vector3(-40, 30, 0)
	luz.light_energy = 1.3
	luz.shadow_enabled = true
	vista.add_child(luz)
	var cam := Camera3D.new()
	cam.fov = 34.0
	cam.position = Vector3(0, 0.95, 5.0)   # pies por encima del panel de abajo, cabeza bajo el título
	cam.rotation_degrees.x = -2.3
	vista.add_child(cam)
	# peana
	var peana := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = 0.6
	cm.bottom_radius = 0.64
	cm.height = 0.08
	cm.radial_segments = 40
	peana.mesh = cm
	peana.position.y = -0.04
	var mp := StandardMaterial3D.new()
	mp.albedo_color = Color(0.98, 0.95, 0.9)
	mp.roughness = 0.8
	peana.material_override = mp
	vista.add_child(peana)
	giro = Node3D.new()
	vista.add_child(giro)

func _poner() -> void:
	var j: Dictionary = lista[i]
	var modelo := str(j["modelo"])
	if persona != null:
		persona.queue_free()
		persona = null
	persona = Figura.persona(Figura.aspecto_jugador(base, modelo))
	persona.rotation.y = PI        # la persona mira a -Z; la cámara está en +Z
	giro.add_child(persona)
	if persona.has_method("anim"):
		persona.anim("parado")
	giro.rotation.y = 0.0
	_quieto = 0.6
	var edad := int(Figura.aspecto_jugador(base, modelo)["edad"])
	lbl_nombre.text = Figura.nombre_de(modelo, base)
	lbl_info.text = "%d años  ·  %d de %d" % [edad, i + 1, lista.size()]

func _process(dt: float) -> void:
	if _quieto > 0.0:
		_quieto -= dt
	elif giro != null:
		giro.rotation.y += GIRO_VEL * dt

# arrastrar con el dedo gira el personaje
func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion and (ev.button_mask & MOUSE_BUTTON_MASK_LEFT):
		giro.rotation.y += ev.relative.x * 0.012
		_quieto = PAUSA_GIRO
		accept_event()

func _unhandled_input(ev: InputEvent) -> void:
	if not is_visible_in_tree():
		return
	if ev.is_action_pressed("ui_left"):
		pasar(-1)
	elif ev.is_action_pressed("ui_right"):
		pasar(1)
	elif ev.is_action_pressed("ui_accept"):
		_jugar()
	elif ev.is_action_pressed("ui_cancel") and cambiar:
		cancelado.emit()
	else:
		return
	get_viewport().set_input_as_handled()

func pasar(d: int) -> void:
	i = posmod(i + d, lista.size())
	_poner()

func _jugar() -> void:
	elegido.emit(str(lista[i]["modelo"]))

# =============== interfaz ===============
func _montar_ui() -> void:
	var arriba := VBoxContainer.new()
	arriba.set_anchors_preset(Control.PRESET_TOP_WIDE)
	arriba.offset_top = 34
	arriba.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(arriba)
	var t := Label.new()
	t.text = "¿Con quién juegas?"
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	t.add_theme_font_size_override("font_size", 28)
	t.add_theme_color_override("font_color", Color(0.25, 0.17, 0.12))
	arriba.add_child(t)
	var st := Label.new()
	st.text = "Desliza para girar"
	st.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	st.add_theme_font_size_override("font_size", 15)
	st.add_theme_color_override("font_color", Color(0.45, 0.36, 0.3))
	arriba.add_child(st)

	var abajo := PanelContainer.new()
	abajo.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	abajo.grow_vertical = Control.GROW_DIRECTION_BEGIN
	abajo.offset_left = 12
	abajo.offset_right = -12
	abajo.offset_bottom = -18
	var est := StyleBoxFlat.new()
	est.bg_color = Color(0.1, 0.11, 0.15, 0.9)
	est.set_corner_radius_all(18)
	est.set_content_margin_all(14)
	abajo.add_theme_stylebox_override("panel", est)
	add_child(abajo)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 10)
	abajo.add_child(vb)
	var fila := HBoxContainer.new()
	fila.add_theme_constant_override("separation", 10)
	vb.add_child(fila)
	fila.add_child(_boton("‹", func(): pasar(-1), Vector2(64, 64), 40))
	var nb := VBoxContainer.new()
	nb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	nb.alignment = BoxContainer.ALIGNMENT_CENTER
	nb.add_theme_constant_override("separation", 0)
	fila.add_child(nb)
	lbl_nombre = Label.new()
	lbl_nombre.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl_nombre.add_theme_font_size_override("font_size", 30)
	lbl_nombre.add_theme_color_override("font_color", Color(1.0, 0.9, 0.35))
	nb.add_child(lbl_nombre)
	lbl_info = Label.new()
	lbl_info.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl_info.add_theme_font_size_override("font_size", 14)
	lbl_info.add_theme_color_override("font_color", Color(0.75, 0.78, 0.85))
	nb.add_child(lbl_info)
	fila.add_child(_boton("›", func(): pasar(1), Vector2(64, 64), 40))
	btn_jugar = _boton("Elegir" if cambiar else "Jugar", _jugar, Vector2(0, 58), 22, Color(0.3, 0.62, 0.38))
	vb.add_child(btn_jugar)
	if cambiar:
		vb.add_child(_boton("Cancelar", func(): cancelado.emit(), Vector2(0, 46), 17))

func _boton(txt: String, f: Callable, tam: Vector2, fs: int, c := Color(0.3, 0.36, 0.5)) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = tam
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", fs)
	b.pressed.connect(f)
	for n in ["normal", "hover", "pressed", "focus"]:
		var e := StyleBoxFlat.new()
		e.bg_color = c if n != "pressed" else c.lightened(0.2)
		e.set_corner_radius_all(12)
		b.add_theme_stylebox_override(n, e)
	return b
