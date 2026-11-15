class_name GenteUI
extends RefCounted
# La interfaz del bloque de vecinos (relaciones.gd): la ficha de una persona con su menú, la pestaña «Gente» (desde el
# botón «Menú») y la tarjeta de resultado con las barras de amistad y romance. Pensada para el dedo: botones de 44-48 px.

const COL_AMISTAD := Color(0.48, 0.44, 0.82)
const COL_ROMANCE := Color(0.91, 0.54, 0.66)

var rel: Relaciones
var jg
var btn_gente: Button
var panel: PanelContainer
var lista: VBoxContainer
var scroll: ScrollContainer
var card: PanelContainer
var card_icono: Label
var card_titulo: Label
var card_linea: Label
var card_extra: VBoxContainer
var card_t := 0.0
var _refresco := 0.0

func _init(r: Relaciones) -> void:
	rel = r
	jg = r.jg

static func estilo(col: Color, radio := 12, margen := 10) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = col
	s.set_corner_radius_all(radio)
	s.set_content_margin_all(margen)
	return s

func crear(capa: Control) -> void:
	# sección «Gente» de la rejilla del Menú (guardado.gd)
	btn_gente = jg.guardado.seccion_menu("gente", "Gente", abrir)
	# pestaña Gente
	panel = PanelContainer.new()
	panel.add_theme_stylebox_override("panel", estilo(Color(0.1, 0.11, 0.15, 0.96), 14, 12))
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.offset_left = 10
	panel.offset_right = -10
	panel.offset_top = 96
	panel.offset_bottom = -84
	panel.visible = false
	capa.add_child(panel)
	var vb2 := VBoxContainer.new()
	vb2.add_theme_constant_override("separation", 8)
	panel.add_child(vb2)
	var cab := HBoxContainer.new()
	vb2.add_child(cab)
	var t := Label.new()
	t.text = rel.hue(rel.G["gente"]["titulo"])
	t.add_theme_font_size_override("font_size", 22)
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cab.add_child(t)
	var cerrar_b := Button.new()
	cerrar_b.text = rel.hue(rel.G["gente"]["cerrar"])
	cerrar_b.custom_minimum_size = Vector2(110, 44)
	cerrar_b.pressed.connect(cerrar)
	cab.add_child(cerrar_b)
	scroll = ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vb2.add_child(scroll)
	lista = VBoxContainer.new()
	lista.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lista.add_theme_constant_override("separation", 8)
	scroll.add_child(lista)
	# tarjeta de resultado
	card = PanelContainer.new()
	card.set_anchors_preset(Control.PRESET_TOP_WIDE)
	card.offset_left = 12
	card.offset_right = -12
	card.offset_top = 96
	card.visible = false
	card.mouse_filter = Control.MOUSE_FILTER_STOP
	card.gui_input.connect(func(ev):
		if (ev is InputEventMouseButton and ev.pressed) or (ev is InputEventScreenTouch and ev.pressed):
			card.visible = false)
	capa.add_child(card)
	var cv := VBoxContainer.new()
	cv.add_theme_constant_override("separation", 4)
	cv.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(cv)
	var ch := HBoxContainer.new()
	ch.add_theme_constant_override("separation", 10)
	ch.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cv.add_child(ch)
	card_icono = Label.new()
	card_icono.add_theme_font_size_override("font_size", 30)
	card_icono.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	ch.add_child(card_icono)
	var ct := VBoxContainer.new()
	ct.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ct.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ch.add_child(ct)
	card_titulo = Label.new()
	card_titulo.add_theme_font_size_override("font_size", 18)
	card_titulo.add_theme_color_override("font_color", Color(0.15, 0.12, 0.1))
	card_titulo.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	ct.add_child(card_titulo)
	card_linea = Label.new()
	card_linea.add_theme_font_size_override("font_size", 15)
	card_linea.add_theme_color_override("font_color", Color(0.28, 0.25, 0.22))
	card_linea.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	ct.add_child(card_linea)
	card_extra = VBoxContainer.new()
	card_extra.add_theme_constant_override("separation", 3)
	card_extra.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cv.add_child(card_extra)

# =============== tarjeta ===============
## icono, título, línea; ok true (verde) / false (rojo) / null (gris); barras de la persona con lo que han cambiado
func tarjeta(icono: String, titulo: String, linea: String, ok, vid: String, antes: Dictionary, tags: Array, dur := 5.5) -> void:
	var borde := Color(0.55, 0.55, 0.55)
	if ok == true:
		borde = Color(0.3, 0.65, 0.4)
	elif ok == false:
		borde = Color(0.8, 0.32, 0.3)
	var st := estilo(Color(0.98, 0.96, 0.91, 0.98), 14, 12)
	st.border_width_left = 7
	st.border_color = borde
	card.add_theme_stylebox_override("panel", st)
	card_icono.text = icono
	card_titulo.text = titulo
	card_linea.text = linea
	card_linea.visible = linea != ""
	for c in card_extra.get_children():
		c.queue_free()
	if not tags.is_empty():
		# una etiqueta por efecto: verde lo que sube, rojo lo que baja
		var fl := HFlowContainer.new()
		fl.add_theme_constant_override("h_separation", 10)
		fl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		for tg in tags:
			var tl := Label.new()
			tl.text = str(tg)
			tl.add_theme_font_size_override("font_size", 13)
			var neg := str(tg).contains("−")
			tl.add_theme_color_override("font_color", Color(0.72, 0.25, 0.22) if neg else Color(0.2, 0.45, 0.3))
			fl.add_child(tl)
		card_extra.add_child(fl)
	if vid != "" and rel.conocida(vid):
		var p: Dictionary = rel.P(vid)
		card_extra.add_child(barra(rel.hue(rel.G["ficha"]["amistad"]), float(p["rel"]), float(antes.get("rel", p["rel"])), COL_AMISTAD, true))
		var a1 := float(p.get("amor", 0))
		if a1 > 0.0 or float(antes.get("amor", 0)) > 0.0:
			card_extra.add_child(barra(rel.hue(rel.G["ficha"]["romance"]), a1, float(antes.get("amor", a1)), COL_ROMANCE, true))
		var f0 := str(antes.get("fase", ""))
		if f0 != "" and f0 != rel.fase(vid):
			var fl := Label.new()
			var v: Dictionary = rel.censo[vid]
			fl.text = "%s → %s" % [str(rel.G["fases"].get(f0, ["", ""])[Relaciones.gi(v)]), rel.fase_txt(vid)]
			fl.add_theme_font_size_override("font_size", 14)
			fl.add_theme_color_override("font_color", Color(0.35, 0.25, 0.55))
			card_extra.add_child(fl)
	card.visible = true
	card_t = dur
	card.offset_bottom = card.offset_top    # crece hacia abajo lo que pida el texto

func tarjeta_linea(t: String) -> void:
	card_linea.text = t
	card_linea.visible = true

## fila «Amistad ▬▬▬ 42 (+5)»
func barra(nombre: String, v: float, antes: float, col: Color, claro: bool) -> HBoxContainer:
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 8)
	hb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var l := Label.new()
	l.text = nombre
	l.custom_minimum_size = Vector2(86, 0)
	l.add_theme_font_size_override("font_size", 14)
	l.add_theme_color_override("font_color", Color(0.3, 0.27, 0.25) if claro else Color(0.85, 0.87, 0.92))
	hb.add_child(l)
	var pb := ProgressBar.new()
	pb.min_value = 0
	pb.max_value = 100
	pb.value = v
	pb.show_percentage = false
	pb.custom_minimum_size = Vector2(0, 14)
	pb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pb.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	pb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	pb.add_theme_stylebox_override("background", estilo(Color(0.82, 0.8, 0.76) if claro else Color(0.25, 0.28, 0.33), 6, 0))
	pb.add_theme_stylebox_override("fill", estilo(col, 6, 0))
	hb.add_child(pb)
	var n := Label.new()
	var d := int(round(v)) - int(round(antes))
	n.text = "%d%s" % [int(round(v)), (" (%s%d)" % ["+" if d > 0 else "−", absi(d)]) if d != 0 else ""]
	n.custom_minimum_size = Vector2(64, 0)
	n.add_theme_font_size_override("font_size", 14)
	var cn := Color(0.3, 0.27, 0.25) if claro else Color(0.9, 0.9, 0.95)
	if d > 0:
		cn = Color(0.18, 0.55, 0.3) if claro else Color(0.55, 0.9, 0.6)
	elif d < 0:
		cn = Color(0.75, 0.25, 0.22) if claro else Color(1.0, 0.55, 0.5)
	n.add_theme_color_override("font_color", cn)
	hb.add_child(n)
	return hb

# =============== ficha de una persona ===============
func ficha(x: Dictionary, solo_mirar := false) -> void:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	card.visible = false    # la ficha manda: la tarjeta de antes se quita
	jg._ficha("🧍 %s" % v["n"], rel.ficha_texto(x, solo_mirar), [])
	var extra := VBoxContainer.new()
	extra.add_theme_constant_override("separation", 6)
	if rel.conocida(vid):
		var p: Dictionary = rel.P(vid)
		extra.add_child(barra(rel.hue(rel.G["ficha"]["amistad"]), float(p["rel"]), float(p["rel"]), COL_AMISTAD, true))
		if float(p.get("amor", 0)) > 0.0:
			extra.add_child(barra(rel.hue(rel.G["ficha"]["romance"]), float(p["amor"]), float(p["amor"]), COL_ROMANCE, true))
	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 6)
	grid.add_theme_constant_override("v_separation", 6)
	if solo_mirar:
		for b in botones_gente(vid):
			grid.add_child(b)
	else:
		for o in rel.opciones(x):
			var bt := _boton_op(str(o["n"]))
			var op := str(o["id"])
			bt.disabled = bool(o.get("off", false))
			bt.pressed.connect(func(): rel.empezar(x, op))
			grid.add_child(bt)
	if grid.get_child_count() > 0:
		extra.add_child(grid)
	jg.ficha_botones.add_child(extra)
	jg.ficha_botones.move_child(extra, 0)

func _boton_op(t: String) -> Button:
	var bt := Button.new()
	bt.text = t
	bt.custom_minimum_size = Vector2(170, 48)    # con ancho fijo el texto parte bien en dos líneas
	bt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bt.add_theme_font_size_override("font_size", 14)
	bt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bt.clip_text = false
	return bt

## la ficha de un favor que te piden en persona
func ficha_favor(x: Dictionary, id: String, vars: Dictionary) -> void:
	var f: Dictionary = rel.DATA["trato"]["favores"][id]
	var tx := "%s · %s\n\n«%s»" % [rel.hue(rel.G["favores"]["titulo"]), rel.hue(f.get("corto", ""), vars), rel.pick(f.get("msg", []), vars)]
	card.visible = false
	jg._ficha("%s %s" % [str(f.get("e", "🙏")), x["v"]["n"]], tx, [])
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	var si := _boton_op(rel.hue(f["si"][0], vars) if f.has("si") else rel.hue(rel.G["favores"]["si"]))
	si.pressed.connect(func(): rel.responder_favor(x, id, true))
	vb.add_child(si)
	var no := _boton_op(rel.hue(f["no"][0], vars) if f.has("no") else rel.hue(rel.G["favores"]["no"]))
	no.pressed.connect(func(): rel.responder_favor(x, id, false))
	vb.add_child(no)
	jg.ficha_botones.add_child(vb)
	jg.ficha_botones.move_child(vb, 0)

# =============== pestaña Gente ===============
func abrir() -> void:
	jg._cerrar_ficha()
	jg.trabajo.abrir(false)   # una hoja cada vez
	jg.cuenta.abrir(false)
	if jg.objetivos.modo != "":
		jg.objetivos.cerrar()
	panel.visible = true
	refrescar()

func cerrar() -> void:
	panel.visible = false

func botones_gente(vid: String) -> Array:
	var Gt: Dictionary = rel.G["gente"]
	var v: Dictionary = rel.censo[vid]
	var out: Array = []
	var b1 := _boton_op(str(Gt["ir"][Relaciones.gi(v)]))
	b1.pressed.connect(func(): rel.ir_a_ver(vid))
	out.append(b1)
	if rel.puede_llamar(vid):
		var b2 := _boton_op(rel.hue(Gt["llamar"]))
		b2.pressed.connect(func(): rel.llamar(vid))
		out.append(b2)
	if rel.puede_invitar(vid):
		var b3 := _boton_op(rel.hue(Gt["invitar"]))
		b3.disabled = not rel.visita.is_empty()
		b3.pressed.connect(func(): rel.invitar(vid))
		out.append(b3)
	return out

func refrescar() -> void:
	for c in lista.get_children():
		c.queue_free()
	var ids: Array = rel.per.keys()
	ids.sort_custom(func(a, b): return float(rel.per[a]["rel"]) + float(rel.per[a].get("amor", 0)) > float(rel.per[b]["rel"]) + float(rel.per[b].get("amor", 0)))
	if ids.is_empty():
		var l := Label.new()
		l.text = rel.hue(rel.G["gente"]["vacia"])
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.add_theme_font_size_override("font_size", 16)
		lista.add_child(l)
		return
	for vid in ids:
		var x: Dictionary = rel.por_vid.get(vid, {})
		if x.is_empty():
			continue
		lista.add_child(_fila(x))

func _fila(x: Dictionary) -> PanelContainer:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var p: Dictionary = rel.P(vid)
	var pc := PanelContainer.new()
	pc.add_theme_stylebox_override("panel", estilo(Color(0.18, 0.2, 0.26), 10, 10))
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 4)
	pc.add_child(vb)
	var h1 := HBoxContainer.new()
	vb.add_child(h1)
	var n := Label.new()
	n.text = str(v["n"])
	n.add_theme_font_size_override("font_size", 19)
	n.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h1.add_child(n)
	var f := Label.new()
	f.text = rel.fase_txt(vid)
	f.add_theme_font_size_override("font_size", 14)
	f.add_theme_color_override("font_color", Color(0.75, 0.72, 0.95))
	h1.add_child(f)
	var sub := Label.new()
	var cab: String = rel.hue(rel.G["ficha"]["edad"], {"e": int(v["edad"])})
	if rel.oficio(v) != "":
		cab += " · " + rel.oficio(v)
	sub.text = cab + "\n" + rel.donde_txt(x)
	sub.add_theme_font_size_override("font_size", 14)
	sub.add_theme_color_override("font_color", Color(0.78, 0.8, 0.86))
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vb.add_child(sub)
	vb.add_child(barra(rel.hue(rel.G["ficha"]["amistad"]), float(p["rel"]), float(p["rel"]), COL_AMISTAD, false))
	if float(p.get("amor", 0)) > 0.0:
		vb.add_child(barra(rel.hue(rel.G["ficha"]["romance"]), float(p["amor"]), float(p["amor"]), COL_ROMANCE, false))
	var hb := GridContainer.new()
	hb.columns = 2
	hb.add_theme_constant_override("h_separation", 6)
	hb.add_theme_constant_override("v_separation", 6)
	vb.add_child(hb)
	for b in botones_gente(vid):
		hb.add_child(b)
	var bf := _boton_op(rel.hue(rel.G["gente"]["ficha"]))
	bf.pressed.connect(func():
		cerrar()
		rel.ficha(x, true))
	hb.add_child(bf)
	return pc

# =============== bucle y toques ===============
func tick(dt: float) -> void:
	if card.visible:
		card_t -= dt
		if card_t <= 0.0:
			card.visible = false
	if panel.visible:
		_refresco += dt
		if _refresco > 3.0:
			_refresco = 0.0
			var sv := scroll.scroll_vertical
			refrescar()
			scroll.set_deferred("scroll_vertical", sv)

func en_ui(p: Vector2) -> bool:
	return (panel.visible and panel.get_global_rect().has_point(p)) or (card.visible and card.get_global_rect().has_point(p))

func _rc(c: Control) -> String:
	if c == null or not c.is_visible_in_tree():
		return "-"
	var r := c.get_global_rect()
	return "%d,%d,%d,%d" % [int(r.position.x), int(r.position.y), int(r.size.x), int(r.size.y)]

func rects() -> String:
	var t: Array = ["panel=" + _rc(panel), "card=" + _rc(card), "gente_btn=" + _rc(btn_gente), "ficha=" + _rc(jg.panel_ficha)]
	var i := 0
	for b in jg.ficha_botones.get_children():
		if b is Button:
			t.append("fb%d=%s" % [i, _rc(b)])
		i += 1
	return " ".join(t)
