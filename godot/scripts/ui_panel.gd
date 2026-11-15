class_name PanelUI
extends RefCounted
# Bloque TRABAJO Y DINERO · piezas de interfaz para el móvil: la hoja de abajo (paneles «Trabajo» y «Dinero») y la tarjeta
# del centro (jornada, nómina, entrevista, avisos). Mismo estilo que el Menú y el modo Muebles: azul noche, esquinas de 14,
# botones de 46-50 px. Las tarjetas son de papel (como la ficha de los sitios).

const OSCURO := Color(0.1, 0.12, 0.17, 0.99)
const PAPEL := Color(0.96, 0.94, 0.88, 0.98)
const TINTA := Color(0.16, 0.13, 0.11)
const TINTA_SUAVE := Color(0.36, 0.32, 0.28)
const CLARO := Color(0.93, 0.93, 0.9)
const CLARO_SUAVE := Color(0.7, 0.73, 0.78)
const VERDE := Color(0.45, 0.85, 0.5)
const VERDE_OSC := Color(0.13, 0.45, 0.22)
const ROJO := Color(0.95, 0.45, 0.4)
const ROJO_OSC := Color(0.65, 0.15, 0.12)
const AMBAR := Color(0.98, 0.8, 0.35)

static func _caja(col: Color, margen := 12) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = col
	s.set_corner_radius_all(14)
	s.set_content_margin_all(margen)
	return s

static func boton(txt: String, f: Callable, alto := 46.0, tam := 16, desactivado := false) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(0, alto)
	b.add_theme_font_size_override("font_size", tam)
	b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	b.pressed.connect(f)
	b.disabled = desactivado
	for n in ["normal", "hover", "pressed", "focus", "disabled"]:
		var e := StyleBoxFlat.new()
		e.bg_color = Color(0.3, 0.36, 0.5) if n != "pressed" else Color(0.42, 0.5, 0.68)
		if n == "disabled":
			e.bg_color = Color(0.3, 0.32, 0.36, 0.7)
		e.set_corner_radius_all(10)
		e.set_content_margin_all(6)
		b.add_theme_stylebox_override(n, e)
	b.add_theme_color_override("font_disabled_color", Color(0.72, 0.72, 0.72))
	return b

## hoja de abajo: título, botón «Cerrar» y una lista con desplazamiento. Devuelve {raiz, titulo, lista, scroll}
static func hoja(ui: Control, cerrar: Callable) -> Dictionary:
	var p := PanelContainer.new()
	p.anchor_left = 0.0
	p.anchor_right = 1.0
	p.anchor_top = 0.27
	p.anchor_bottom = 1.0
	p.offset_left = 8
	p.offset_right = -8
	p.offset_top = 0
	p.offset_bottom = -84
	p.add_theme_stylebox_override("panel", _caja(OSCURO, 10))
	p.visible = false
	ui.add_child(p)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 8)
	p.add_child(vb)
	var cab := HBoxContainer.new()
	vb.add_child(cab)
	var t := Label.new()
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	t.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	t.add_theme_font_size_override("font_size", 20)
	t.add_theme_color_override("font_color", CLARO)
	t.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	cab.add_child(t)
	var bc := boton("Cerrar", cerrar, 46.0, 16)
	bc.custom_minimum_size = Vector2(96, 46)
	cab.add_child(bc)
	var sc := ScrollContainer.new()
	sc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vb.add_child(sc)
	var lista := VBoxContainer.new()
	lista.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lista.add_theme_constant_override("separation", 6)
	sc.add_child(lista)
	return {"raiz": p, "titulo": t, "lista": lista, "scroll": sc, "cerrar": bc}

static func vaciar(c: Control) -> void:
	for h in c.get_children():
		c.remove_child(h)
		h.queue_free()

static func texto(padre: Control, t: String, tam := 15, col := CLARO) -> Label:
	var l := Label.new()
	l.text = t
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.add_theme_font_size_override("font_size", tam)
	l.add_theme_color_override("font_color", col)
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	padre.add_child(l)
	return l

static func seccion(padre: Control, t: String, col := AMBAR) -> Label:
	var l := texto(padre, t, 17, col)
	return l

## fila «concepto ........ importe»
static func fila(padre: Control, izq: String, der: String, col_izq := CLARO, col_der := CLARO, tam := 15) -> HBoxContainer:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	padre.add_child(h)
	var a := Label.new()
	a.text = izq
	a.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	a.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	a.add_theme_font_size_override("font_size", tam)
	a.add_theme_color_override("font_color", col_izq)
	h.add_child(a)
	var b := Label.new()
	b.text = der
	b.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	b.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	b.add_theme_font_size_override("font_size", tam)
	b.add_theme_color_override("font_color", col_der)
	h.add_child(b)
	return h

## un recuadro dentro de la hoja (una oferta, un bloque de datos)
static func recuadro(padre: Control, col := Color(0.17, 0.2, 0.27, 1.0)) -> VBoxContainer:
	var p := PanelContainer.new()
	var s := _caja(col, 10)
	s.set_corner_radius_all(10)
	p.add_theme_stylebox_override("panel", s)
	padre.add_child(p)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 4)
	p.add_child(vb)
	return vb

static func linea(padre: Control) -> void:
	var r := ColorRect.new()
	r.color = Color(1, 1, 1, 0.12)
	r.custom_minimum_size = Vector2(0, 1)
	padre.add_child(r)

## tarjeta de papel en el centro. `filas`: [[izq, der, color_der?], ...] o textos sueltos (String). Devuelve la raíz.
static func tarjeta(ui: Control, titulo: String, partes: Array, al_cerrar: Callable, boton_txt := "Vale") -> PanelContainer:
	var p := PanelContainer.new()
	p.set_anchors_preset(Control.PRESET_CENTER)
	p.offset_left = -192
	p.offset_right = 192
	p.offset_top = -40
	p.offset_bottom = 40
	p.grow_vertical = Control.GROW_DIRECTION_BOTH
	p.add_theme_stylebox_override("panel", _caja(PAPEL, 16))
	ui.add_child(p)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	p.add_child(vb)
	var t := texto(vb, titulo, 21, TINTA)
	t.add_theme_constant_override("line_spacing", 0)
	for x in partes:
		if x is String:
			if x == "-":
				var r := ColorRect.new()
				r.color = Color(0, 0, 0, 0.15)
				r.custom_minimum_size = Vector2(0, 1)
				vb.add_child(r)
			else:
				texto(vb, x, 15, TINTA_SUAVE)
		elif x is Array:
			var col: Color = x[2] if x.size() > 2 else TINTA
			var tam: int = x[3] if x.size() > 3 else 15
			fila(vb, str(x[0]), str(x[1]), TINTA, col, tam)
	var b := boton(boton_txt, al_cerrar, 48.0, 17)
	vb.add_child(b)
	return p

## rellena {clave} en un texto de los datos
static func huecos(t: String, v: Dictionary) -> String:
	for k in v:
		t = t.replace("{" + str(k) + "}", str(v[k]))
	return t
