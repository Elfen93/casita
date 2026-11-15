class_name Compras
extends RefCounted
# COMPRAS Y COMIDA: despensa con fechas (nevera y armario), el súper del barrio con cesta y total, volver a casa con
# la compra en brazos y guardarla, cocinar recetas que gastan ingredientes y dejan sobras, picar, tirar lo caducado,
# comida a domicilio con un rider que llega andando, menú del día en el bar y un indicador de nutrición.
# Datos: data/comida.json (productos, recetas, precios) y data/interiores.json (acciones de nevera, cocina, barra, sillas).
# En main.gd solo hay ganchos «# --- compras ---»; en cola.gd y acciones.gd, unas líneas marcadas igual.
static var D: Dictionary = {}

var jg
var despensa: Array = []     # lotes {p, n, cad}: p = producto o "sobras:<receta|fuera>"; n = usos que quedan; cad = último día bueno (-1: no caduca)
var bolsa: Array = []        # lo comprado camino de casa (mismos lotes)
var nut := 60.0              # nutrición 0-100 (media móvil de lo que se come cada día, como el juego web)
var hoy := {}                # franja (des/com/cen) -> calidad de lo que se ha comido
var ult_dia := 0
var aviso_cad := -1          # día en que ya se avisó de lo caducado
var pedido := {}             # comida a domicilio en camino: {llega, est (espera·anda·puerta·vuelve), puerta_t, recoger}
var rider: Actor = null
var rider_ini := Vector2.ZERO
var guardando := false       # ya se ha puesto en la cola «Guardar la compra»
var bolsa_n: MeshInstance3D  # la bolsa que se ve en brazos

# ---- interfaz del súper ----
var panel: PanelContainer
var lbl_cab: Label
var lbl_cesta: Label
var fila_secs: HFlowContainer
var lista: VBoxContainer
var b_pagar: Button
var b_comer: Button
var b_secs := {}
var sec := "pan"
var cesta := {}              # producto -> paquetes
# ---- panel de información (qué hay, recetas): con desplazamiento, para no estirar la ficha de main ----
var panel_info: PanelContainer
var info_tit: Label
var info_txt: Label
var info_scroll: ScrollContainer
var info_super: Button

func _init(j) -> void:
	jg = j
	D = Datos.cargar("comida")
	if not jg.hab.has("cocina"):
		jg.hab["cocina"] = 0.0      # habilidad nueva: se guarda con las demás (sección «habilidades»)
	nut = float(D.get("nutricion", {}).get("inicial", 60))
	ult_dia = dia()
	for par in D.get("inicial", []):
		_añadir(despensa, str(par[0]), int(par[1]))
	jg.guardado.registrar("comida", 1, _guardar, _aplicar)

# =============== utilidades ===============
func dia() -> int:
	return int(jg.minutos / 1440.0)

static func prod(p: String) -> Dictionary:
	return D.get("productos", {}).get(p, {})

static func receta(r: String) -> Dictionary:
	return D.get("recetas", {}).get(r, {})

## nombre corto en minúscula: «Huevos (docena)» -> «huevos»
static func corto(p: String) -> String:
	return str(prod(p).get("n", p)).split(" (")[0].to_lower()

## nombre de lo que se lleva en la mano: «plato:lentejas» -> «Lentejas estofadas»
static func nombre_plato(v: String) -> String:
	var k := v.split(":")[1] if v.contains(":") else v
	if receta(k).has("n"):
		return str(receta(k)["n"]).to_lower()
	return str(D.get("fuera", {}).get(k, {}).get("n", "plato de comida"))

func _nombre_lote(l: Dictionary) -> String:
	var p := str(l["p"])
	if p.begins_with("sobras:"):
		return "Sobras: %s" % nombre_plato(p)
	return str(prod(p).get("n", p))

func _icono_lote(l: Dictionary) -> String:
	var p := str(l["p"])
	if p.begins_with("sobras:"):
		var k := p.split(":")[1]
		return str(receta(k).get("e", D.get("fuera", {}).get(k, {}).get("e", "🍱")))
	return str(prod(p).get("e", "•"))

func _caducado(l: Dictionary) -> bool:
	return int(l["cad"]) >= 0 and dia() > int(l["cad"])

# paquetes del súper -> lote en la lista dada
func _añadir(dest: Array, p: String, paquetes: int) -> void:
	var pr := prod(p)
	if pr.is_empty() or paquetes <= 0:
		return
	var dd = pr.get("dias", null)
	dest.append({"p": p, "n": int(pr.get("usos", 1)) * paquetes, "cad": dia() + int(dd) if dd != null else -1})

func cantidad(p: String) -> int:
	var t := 0
	for l in despensa:
		if l["p"] == p and not _caducado(l):
			t += int(l["n"])
	return t

# gasta k usos de p, lo que caduca antes primero
func _consumir(p: String, k: int) -> void:
	var ls: Array = []
	for l in despensa:
		if l["p"] == p and not _caducado(l):
			ls.append(l)
	ls.sort_custom(func(a, b): return (int(a["cad"]) if int(a["cad"]) >= 0 else 99999) < (int(b["cad"]) if int(b["cad"]) >= 0 else 99999))
	for l in ls:
		if k <= 0:
			break
		var q := mini(k, int(l["n"]))
		l["n"] = int(l["n"]) - q
		k -= q
	despensa = despensa.filter(func(l): return int(l["n"]) > 0)

## la alternativa de un ingrediente («fiambre|queso|atun») que hay en cantidad; "" si ninguna
func _alternativa(alts: String, k: int) -> String:
	var mejor := ""
	var mejor_cad := 1 << 30
	for p in alts.split("|"):
		if cantidad(p) < k:
			continue
		var c := 1 << 29
		for l in despensa:
			if l["p"] == p and not _caducado(l) and int(l["cad"]) >= 0:
				c = mini(c, int(l["cad"]))
		if mejor == "" or c < mejor_cad:
			mejor = p
			mejor_cad = c
	return mejor

## lo que falta para una receta («pasta, tomate frito»); "" si está todo
func faltan(r: String) -> String:
	var f: Array = []
	for ing in receta(r).get("ing", []):
		if _alternativa(str(ing[0]), int(ing[1])) == "":
			var alts: Array = str(ing[0]).split("|")
			f.append(corto(alts[0]) + (" (u otra cosa)" if alts.size() > 1 else ""))
	return ", ".join(f)

func nivel_cocina() -> int:
	var n := 0
	var ns: Array = D.get("niveles", [0])
	for i in ns.size():
		if float(jg.hab.get("cocina", 0.0)) >= float(ns[i]):
			n = i
	return n

func _franja() -> String:
	var h: float = jg._hora_dec()
	return "des" if h < 11.0 else ("com" if h < 17.0 else "cen")

func comida_hecha(calidad: float) -> void:
	var f := _franja()
	hoy[f] = maxf(float(hoy.get(f, 0.0)), calidad)

func _picables() -> Array:
	var r: Array = []
	for p in D.get("productos", {}):
		if bool(prod(p).get("picar", false)) and cantidad(p) > 0:
			r.append(p)
	return r

func _hay_caducado() -> bool:
	for l in despensa:
		if _caducado(l):
			return true
	return false

func _sobras_lote() -> Dictionary:
	var mejor: Dictionary = {}
	for l in despensa:
		if str(l["p"]).begins_with("sobras:") and not _caducado(l):
			if mejor.is_empty() or int(l["cad"]) < int(mejor["cad"]):
				mejor = l
	return mejor

## el envoltorio único del dinero de este bloque: cuando exista la función de movimientos (bloque TRABAJO), se cambia aquí
func _pagar(concepto: String, euros: float) -> bool:
	if euros <= 0.0:
		return true
	if jg.dinero < euros:
		return false
	jg.dinero -= euros
	if OS.is_debug_build():
		print("pago: %s %.2f" % [concepto, euros])
	return true

func _t(k: String) -> String:
	var v = D.get("textos", {}).get(k, k)
	if v is Array:
		return str(v[randi() % v.size()])
	return str(v)

# =============== condiciones (acciones.gd) ===============
## motivo para que una acción no se pueda ("" si se puede); null si la condición no es de este bloque
func motivo(rq: String, ac: Dictionary) -> Variant:
	var C: Dictionary = Acciones.D.get("condiciones", {})
	match rq:
		"hay_picar":
			return "" if not _picables().is_empty() else str(C[rq])
		"hay_sobras":
			return "" if not _sobras_lote().is_empty() else str(C[rq])
		"bolsa_mano":
			return "" if jg.jugador.mano == "bolsa" and not bolsa.is_empty() else str(C[rq])
		"hay_caducado":
			return "" if _hay_caducado() else str(C[rq])
		"hay_producto":
			return "" if cantidad(str(ac.get("producto", ""))) > 0 else str(C[rq])
		"ingredientes":
			var f := faltan(str(ac.get("plato_receta", "")))
			return "" if f == "" else "Falta: " + f
		"nivel_cocina":
			return "" if int(receta(str(ac.get("plato_receta", ""))).get("nivel", 0)) <= nivel_cocina() else str(C[rq])
		"dinero_menu":
			return "" if jg.dinero >= _precio_menu() else str(C[rq])
		"hora_menu":
			var M: Dictionary = D.get("menu", {})
			var h: float = jg._hora_dec()
			var ok: bool = h >= float(M["h"][0]) and h < float(M["h"][1]) and int(jg._dia_sem()) in M["dias"].map(func(x): return int(x))
			return "" if ok else str(C[rq])
	return null

## variantes de «Cocinar» (una por receta), ordenadas por nivel y tiempo
static func variantes_cocinar(ac: Dictionary) -> Array:
	var ids: Array = D.get("recetas", {}).keys()
	ids.sort_custom(func(a, b):
		return int(receta(a).get("nivel", 0)) * 1000 + float(receta(a).get("min", 0)) < int(receta(b).get("nivel", 0)) * 1000 + float(receta(b).get("min", 0)))
	var r: Array = []
	for rid in ids:
		var re := receta(rid)
		var v: Dictionary = ac.duplicate(true)
		v["id"] = "%s:%s" % [ac["id"], rid]
		v["n"] = str(re["n"])
		v["e"] = str(re.get("e", ac.get("e", "🍳")))
		v["min"] = float(re.get("min", ac.get("min", 20)))
		v["plato_receta"] = rid
		r.append(v)
	return r

## texto del paso de la receta que va por la fracción f (cola.gd, mientras se cocina)
static func paso_receta(rid: String, f: float) -> String:
	var ps: Array = receta(rid).get("pasos", [])
	if ps.is_empty():
		return "Cocinando…"
	return str(ps[clampi(int(f * ps.size()), 0, ps.size() - 1)])

# =============== al terminar una acción (cola.gd) ===============
## null si el tipo no es de este bloque; si no, el texto del aviso ("" sin aviso)
func terminar(ac: Dictionary, o) -> Variant:
	var a: Actor = jg.jugador
	match str(ac.get("tipo", "")):
		"cocinar":
			var rid := str(ac.get("plato_receta", ""))
			var re := receta(rid)
			for ing in re.get("ing", []):
				var p := _alternativa(str(ing[0]), int(ing[1]))
				if p == "":
					return "Te falta %s." % faltan(rid)
				_consumir(p, int(ing[1]))
			a.poner_mano("plato:" + rid, jg)
			var sob := int(re.get("raciones", 1)) - 1
			if sob > 0:
				despensa.append({"p": "sobras:" + rid, "n": sob, "cad": dia() + int(D.get("sobras_dias", 3))})
			jg.hab["cocina"] = float(jg.hab.get("cocina", 0.0)) + float(D.get("habilidad", 0.4)) * (1.0 + 0.5 * int(re.get("nivel", 0)))
			var t := "%s listo." % str(re["n"])
			if sob > 0:
				t += " %d %s a la nevera." % [sob, "ración" if sob == 1 else "raciones"]
			return t
		"menu_bar":
			# el menú sale de la cocina del bar (no hace falta camarero): se paga al recogerlo
			if not _pagar("Menú del día", _precio_menu()):
				return "No te llega el dinero."
			a.poner_mano("menu", jg)
			return "Menú del día: primero, segundo y postre. %s." % Acciones.jg_eur(_precio_menu())
		"sobras":
			var l := _sobras_lote()
			if l.is_empty():
				return "No quedan sobras."
			l["n"] = int(l["n"]) - 1
			despensa = despensa.filter(func(x): return int(x["n"]) > 0)
			a.poner_mano("plato:" + str(l["p"]).split(":")[1], jg)
			return "Sobras calientes: %s." % nombre_plato(str(l["p"]))
		"picar":
			var ps := _picables()
			if ps.is_empty():
				return "No hay nada para picar."
			ps.sort_custom(func(x, y): return _primera_cad(x) < _primera_cad(y))
			_consumir(ps[0], 1)
			comida_hecha(float(D.get("picar", {}).get("calidad", 0.35)))
			return "%s Algo es algo." % str(prod(ps[0]).get("e", ""))
		"guardar_compra":
			var n := 0
			for l in bolsa:
				despensa.append(l)
				n += 1
			bolsa.clear()
			guardando = false
			a.poner_mano("", jg)
			return "%s (%d)" % [_t("guardado"), n]
		"de_nevera":
			var p2 := str(ac.get("producto", ""))
			_consumir(p2, 1)
			if p2 == "cerveza":
				a.beber_copa()
			return str(ac.get("fin", ""))
		"tirar_caducado":
			var k := 0
			var euros := 0.0
			for l in despensa:
				if _caducado(l):
					k += 1
					var pr := prod(str(l["p"]))
					if not pr.is_empty():
						euros += float(pr["precio"]) * float(l["n"]) / maxf(1.0, float(pr.get("usos", 1)))
			despensa = despensa.filter(func(l): return not _caducado(l))
			aviso_cad = dia()
			return _t("tirado").replace("{k}", str(k)).replace("{v}", jg._eur(snappedf(euros, 0.01)))
	return null

func _primera_cad(p: String) -> int:
	var c := 1 << 29
	for l in despensa:
		if l["p"] == p and not _caducado(l) and int(l["cad"]) >= 0:
			c = mini(c, int(l["cad"]))
	return c

## efecto de comer lo que se lleva en la mano (cola.gd, tipo «comer»): cada plato llena lo suyo y cuenta para la nutrición
func al_comer(mano: String, de_pie: bool, o, ef: Dictionary) -> Dictionary:
	var k := mano.split(":")[1] if mano.contains(":") else mano
	var r: Dictionary = ef.duplicate()
	var cal := 0.6
	if mano.begins_with("plato:") and receta(k).has("hambre"):
		var re := receta(k)
		r = {"hambre": float(re["hambre"]) * (0.7 if de_pie else 1.0)}
		if re.has("energia"):
			r["energia"] = float(re["energia"])
		cal = float(re.get("calidad", 0.6))
	elif D.get("fuera", {}).has(k):
		var fu: Dictionary = D["fuera"][k]
		if mano.begins_with("plato:"):
			r = {"hambre": float(fu.get("hambre", 50)) * (0.7 if de_pie else 1.0)}
		cal = float(fu.get("calidad", 0.6))
	comida_hecha(cal)
	if o != null and str(o.interior) == "casa":
		jg.estado_casa["platos_sucios"] = true
	return r

# =============== el menú de un mueble (main._menu_objeto) ===============
## quita del menú lo que no viene a cuento: en la cocina solo las recetas que salen; en la nevera, lo que no se puede
func menu_lista(ob, l: Array) -> Array:
	if ob.tipo == "cocina":
		var r: Array = []
		var bloqueo := ""
		for e in l:
			var es_receta := str(e["ac"].get("id", "")).begins_with("cocinar:")
			if e["ok"] or not es_receta:
				r.append(e)
			elif bloqueo == "" and str(e["motivo"]) == str(Acciones.D.get("condiciones", {}).get("sin_platos_sucios", "")):
				bloqueo = str(e["motivo"])
				var c: Dictionary = e.duplicate(true)
				c["ac"]["n"] = "Cocinar"
				c["ac"]["e"] = "🍳"
				r.append(c)
		return r
	if ob.tipo == "nevera":
		return l.filter(func(e): return e["ok"] or str(e["ac"].get("id", "")) == "picar")
	for e in l:
		if str(e["ac"].get("tipo", "")) == "menu_bar":
			e["ac"] = e["ac"].duplicate()
			e["ac"]["n"] = "%s (%s)" % [e["ac"]["n"], Acciones.jg_eur(_precio_menu())]
	return l

## botones de más en la nevera y la cocina: ver qué hay, recetas y, si no hay con qué, el súper o pedir a domicilio
func botones_extra(ob, l: Array) -> Array:
	var b: Array = []
	if not ob.tipo in ["nevera", "cocina"] or str(ob.interior) != "casa":
		return b
	var se_puede := false
	for e in l:
		if e["ok"]:
			se_puede = true
	b.append(["📋 Qué hay (%d cosas)" % despensa.size(), func(): ficha_despensa()])
	if ob.tipo == "cocina":
		b.append(["📖 Recetas", func(): ficha_recetas()])
	if not se_puede:
		if ob.tipo == "cocina":
			jg._aviso(_t("sin_comida"))
		b.append(["🛒 Ir al súper", func(): jg._ir_a_edificio("super")])
		b.append(_boton_domicilio())
	return b

func _precio_menu() -> float:
	return float(Acciones.D.get("productos", {}).get("menu", {}).get("precio", 13.5))

func _precio_domicilio() -> float:
	var d: Dictionary = D.get("domicilio", {})
	return float(d.get("pedido", 12.9)) + float(d.get("envio", 2.99))

func _boton_domicilio() -> Array:
	var pr := _precio_domicilio()
	if not pedido.is_empty():
		return ["🛵 Pedido en camino", func(): pass, true]
	return ["🛵 Pedir a domicilio (%s)" % Acciones.jg_eur(pr), func(): pedir_domicilio(), jg.dinero < pr]

func ficha_despensa() -> void:
	var nev: Array = []
	var arm: Array = []
	var ls := despensa.duplicate()
	ls.sort_custom(func(a, b): return _nombre_lote(a) < _nombre_lote(b))
	for l in ls:
		var t := "%s %s ×%d" % [_icono_lote(l), _nombre_lote(l).split(" (")[0], int(l["n"])]
		if _caducado(l):
			t += " · CADUCADO"
		elif int(l["cad"]) >= 0:
			var q := int(l["cad"]) - dia()
			t += " · " + ("caduca hoy" if q == 0 else ("caduca mañana" if q == 1 else "%d días" % q))
		var sitio := "nevera" if str(l["p"]).begins_with("sobras:") else str(prod(str(l["p"])).get("sitio", "nevera"))
		(nev if sitio == "nevera" else arm).append(t)
	var tx := "🧊 Nevera:\n" + ("\n".join(nev) if not nev.is_empty() else "vacía")
	tx += "\n\n🗄️ Armario:\n" + ("\n".join(arm) if not arm.is_empty() else "vacío")
	tx += "\n\n" + texto_nutricion()
	abrir_info("📋 La comida de casa", tx)

func texto_nutricion() -> String:
	var N: Dictionary = D.get("nutricion", {})
	var e := "come bien" if nut >= float(N.get("bien", 70)) else ("tira de lo rápido" if nut >= float(N.get("mal", 45)) else "come mal: cansancio")
	var fr: Array = []
	for f in [["des", "desayuno"], ["com", "comida"], ["cen", "cena"]]:
		fr.append("%s %s" % [f[1], "✅" if hoy.has(f[0]) else "no"])
	return "🍽️ Nutrición %d · %s\nHoy: %s" % [int(round(nut)), e, " · ".join(fr)]

func ficha_recetas() -> void:
	var ids: Array = []
	for v in variantes_cocinar({"id": "cocinar"}):
		ids.append(v["plato_receta"])
	var ls: Array = []
	var nv := nivel_cocina()
	for rid in ids:
		var re := receta(rid)
		var t := "%s %s · %d min · %d rac." % [re.get("e", ""), re["n"], int(re["min"]), int(re.get("raciones", 1))]
		t = t.replace(" · 1 rac.", "")
		if int(re.get("nivel", 0)) > nv:
			t += " · 🔒 nivel %d" % int(re["nivel"])
		else:
			var f := faltan(rid)
			t += " · ✅" if f == "" else " · falta " + f
		ls.append(t)
	abrir_info("📖 Recetas · nivel de cocina %d" % nv, "\n".join(ls))

# =============== el súper ===============
func crear_ui(ui: Control) -> void:
	panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel.offset_left = 8
	panel.offset_right = -8
	panel.offset_bottom = -84
	panel.grow_vertical = Control.GROW_DIRECTION_BEGIN
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.1, 0.12, 0.17, 0.95)
	sb.set_corner_radius_all(14)
	sb.set_content_margin_all(10)
	panel.add_theme_stylebox_override("panel", sb)
	panel.visible = false
	ui.add_child(panel)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	panel.add_child(vb)
	var cab := HBoxContainer.new()
	vb.add_child(cab)
	lbl_cab = Label.new()
	lbl_cab.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_cab.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	lbl_cab.add_theme_font_size_override("font_size", 18)
	cab.add_child(lbl_cab)
	var bs := _boton("Salir", func(): salir_super(), 46.0)
	bs.custom_minimum_size = Vector2(96, 46)
	cab.add_child(bs)
	lbl_cesta = Label.new()
	lbl_cesta.add_theme_font_size_override("font_size", 15)
	lbl_cesta.add_theme_color_override("font_color", Color(0.85, 0.9, 1.0))
	lbl_cesta.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vb.add_child(lbl_cesta)
	fila_secs = HFlowContainer.new()
	fila_secs.add_theme_constant_override("h_separation", 6)
	fila_secs.add_theme_constant_override("v_separation", 6)
	vb.add_child(fila_secs)
	for s in D.get("secciones", []):
		var sid := str(s[0])
		var b := _boton(str(s[1]), func(): _elegir_sec(sid), 44.0, 15)
		fila_secs.add_child(b)
		b_secs[sid] = b
	lista = VBoxContainer.new()
	lista.add_theme_constant_override("separation", 4)
	vb.add_child(lista)
	var pie := HBoxContainer.new()
	pie.add_theme_constant_override("separation", 6)
	vb.add_child(pie)
	b_comer = _boton("", func(): comer_en_super(), 50.0, 15)
	b_comer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pie.add_child(b_comer)
	b_pagar = _boton("", func(): pagar(), 50.0, 17)
	b_pagar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_color_boton(b_pagar, Color(0.2, 0.55, 0.3))
	pie.add_child(b_pagar)
	_crear_info(ui)
	bolsa_n = MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(0.34, 0.3, 0.2)
	bolsa_n.mesh = bm
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.78, 0.62, 0.4)
	m.roughness = 1.0
	bolsa_n.material_override = m
	bolsa_n.position = Vector3(0, 1.0, 0.3)
	bolsa_n.visible = false
	jg.jugador.nodo.add_child(bolsa_n)

func _crear_info(ui: Control) -> void:
	panel_info = PanelContainer.new()
	panel_info.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel_info.offset_left = 8
	panel_info.offset_right = -8
	panel_info.offset_bottom = -84
	panel_info.grow_vertical = Control.GROW_DIRECTION_BEGIN
	panel_info.add_theme_stylebox_override("panel", panel.get_theme_stylebox("panel"))
	panel_info.visible = false
	ui.add_child(panel_info)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	panel_info.add_child(vb)
	var cab := HBoxContainer.new()
	vb.add_child(cab)
	info_tit = Label.new()
	info_tit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	info_tit.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	info_tit.add_theme_font_size_override("font_size", 18)
	info_tit.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	cab.add_child(info_tit)
	var bc := _boton("Cerrar", func(): panel_info.visible = false, 46.0)
	bc.custom_minimum_size = Vector2(96, 46)
	cab.add_child(bc)
	info_scroll = ScrollContainer.new()
	info_scroll.custom_minimum_size = Vector2(0, 340)
	info_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vb.add_child(info_scroll)
	info_txt = Label.new()
	info_txt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	info_txt.add_theme_font_size_override("font_size", 15)
	info_txt.add_theme_color_override("font_color", Color(0.9, 0.92, 0.96))
	info_txt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	info_scroll.add_child(info_txt)
	info_super = _boton("🛒 Ir al súper", func():
		panel_info.visible = false
		jg._ir_a_edificio("super"), 48.0)
	vb.add_child(info_super)

func abrir_info(titulo: String, texto: String) -> void:
	jg.panel_ficha.visible = false
	info_tit.text = titulo
	info_txt.text = texto
	info_scroll.scroll_vertical = 0
	panel_info.visible = true

func _boton(txt: String, f: Callable, alto := 48.0, tam := 16) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(0, alto)
	b.add_theme_font_size_override("font_size", tam)
	b.pressed.connect(f)
	_color_boton(b, Color(0.3, 0.36, 0.5))
	return b

func _color_boton(b: Button, c: Color) -> void:
	for n in ["normal", "hover", "pressed", "focus", "disabled"]:
		var e := StyleBoxFlat.new()
		e.bg_color = c.lightened(0.15) if n == "pressed" else (c.darkened(0.45) if n == "disabled" else c)
		e.set_corner_radius_all(10)
		e.set_content_margin_all(6)
		b.add_theme_stylebox_override(n, e)

func en_ui(p: Vector2) -> bool:
	for c in [panel, panel_info]:
		if c != null and c.visible and c.get_global_rect().has_point(p):
			return true
	return false

func abrir_super(_e: Dictionary) -> void:
	jg.dentro = true
	jg.jugador.nodo.visible = false
	jg.panel_ficha.visible = false
	cesta = {}
	panel.visible = true
	_elegir_sec(sec)

func salir_super() -> void:
	panel.visible = false
	jg.dentro = false
	jg.jugador.nodo.visible = true

func _elegir_sec(s: String) -> void:
	sec = s
	for k in b_secs:
		_color_boton(b_secs[k], Color(0.85, 0.55, 0.25) if k == s else Color(0.3, 0.36, 0.5))
	_pintar()

func total() -> float:
	var t := 0.0
	for p in cesta:
		t += float(prod(p)["precio"]) * int(cesta[p])
	return snappedf(t, 0.01)

func _articulos() -> int:
	var n := 0
	for p in cesta:
		n += int(cesta[p])
	return n

func _pintar() -> void:
	lbl_cab.text = "🛒 Súper del barrio · %s" % jg._eur(jg.dinero)
	var n := _articulos()
	lbl_cesta.text = ("Cesta: %d %s · %s" % [n, "artículo" if n == 1 else "artículos", jg._eur(total())]) if n > 0 else "Cesta vacía. Toca + para echar algo."
	for c in lista.get_children():
		c.queue_free()
	for p in D.get("productos", {}):
		var pr := prod(p)
		if str(pr.get("sec", "")) != sec:
			continue
		var fila := HBoxContainer.new()
		fila.add_theme_constant_override("separation", 6)
		lista.add_child(fila)
		var l := Label.new()
		var casa := cantidad(p)
		l.text = "%s %s\n%s%s" % [pr["e"], pr["n"], Acciones.jg_eur(float(pr["precio"])), (" · en casa %d" % casa) if casa > 0 else ""]
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		l.add_theme_font_size_override("font_size", 14)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		fila.add_child(l)
		var pp := str(p)
		var bm := _boton("−", func(): _cambiar(pp, -1), 46.0, 22)
		bm.custom_minimum_size = Vector2(52, 46)
		bm.disabled = int(cesta.get(p, 0)) == 0
		fila.add_child(bm)
		var k := Label.new()
		k.text = str(int(cesta.get(p, 0)))
		k.custom_minimum_size = Vector2(26, 0)
		k.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		k.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		k.add_theme_font_size_override("font_size", 18)
		fila.add_child(k)
		var bp := _boton("+", func(): _cambiar(pp, 1), 46.0, 22)
		bp.custom_minimum_size = Vector2(52, 46)
		bp.disabled = int(cesta.get(p, 0)) >= 9 or total() + float(pr["precio"]) > jg.dinero
		fila.add_child(bp)
	var S: Dictionary = D.get("super", {})
	var pc := float(S.get("comer_precio", 6.5))
	b_comer.text = "🥪 Comer aquí (%s)" % Acciones.jg_eur(pc)
	b_comer.disabled = jg.dinero < pc
	var t := total()
	b_pagar.text = "Pagar %s" % jg._eur(t) if t > 0.0 else "Pagar"
	b_pagar.disabled = t <= 0.0 or t > jg.dinero

func _cambiar(p: String, d: int) -> void:
	var k := clampi(int(cesta.get(p, 0)) + d, 0, 9)
	if k == 0:
		cesta.erase(p)
	else:
		cesta[p] = k
	_pintar()

func pagar() -> void:
	var t := total()
	if t <= 0.0:
		jg._aviso("La cesta está vacía.")
		return
	if not _pagar("Compra en el súper", t):
		jg._aviso("No te llega el dinero.")
		return
	for p in cesta:
		_añadir(bolsa, p, int(cesta[p]))
	var S: Dictionary = D.get("super", {})
	var mins := minf(float(S.get("min_max", 35)), float(S.get("min_base", 8)) + float(S.get("min_por_articulo", 1.5)) * _articulos())
	cesta = {}
	panel.visible = false
	guardando = false
	jg._cerrar_ficha_y_saltar(mins, "Comprando…", func():
		jg.jugador.poner_mano("bolsa", jg)
		jg._aviso(_t("pagado").replace("{v}", jg._eur(t)))
		jg._ir_a_edificio("casa"))

func comer_en_super() -> void:
	var S: Dictionary = D.get("super", {})
	if not _pagar("Comer en el súper", float(S.get("comer_precio", 6.5))):
		jg._aviso("No te llega el dinero.")
		return
	panel.visible = false
	var fu: Dictionary = D.get("fuera", {}).get("super", {})
	jg._cerrar_ficha_y_saltar(float(S.get("comer_min", 30)), "Comiendo en un banco…", func():
		jg.nec["hambre"] = minf(100.0, jg.nec["hambre"] + float(fu.get("hambre", 45)))
		comida_hecha(float(fu.get("calidad", 0.5)))
		jg._aviso("Bocadillo y fruta en un banco. Hambre arriba."))

# =============== comida a domicilio ===============
func pedir_domicilio() -> void:
	if not pedido.is_empty():
		jg._aviso("Ya hay un pedido en camino.")
		return
	var pr := _precio_domicilio()
	if not _pagar("Comida a domicilio", pr):
		jg._aviso("No te llega el dinero.")
		return
	var d: Dictionary = D.get("domicilio", {})
	pedido = {"llega": jg.minutos + float(d.get("espera_min", 40)), "est": "espera"}
	jg._cerrar_ficha()
	jg._aviso(_t("pedido").replace("{v}", Acciones.jg_eur(pr)).replace("{m}", str(int(d.get("espera_min", 40)))))

func _casa_it() -> Interior:
	return jg.edificios.get("casa", {}).get("interior", null)

func _punto_fuera() -> Vector2:
	var it := _casa_it()
	return Vector2(it.puerta.x, it.puerta.y + 1.3) if it != null else jg.edificios["casa"]["puerta"]

func _punto_dentro() -> Vector2:
	var it := _casa_it()
	return Vector2(it.puerta.x, it.puerta.y - 1.0) if it != null else jg.edificios["casa"]["puerta"]

func _crear_rider() -> bool:
	var meta := _punto_fuera()
	var ruta: Array = []
	for off in [Vector2(-22, 3), Vector2(22, 3), Vector2(0, 20), Vector2(-15, 15), Vector2(15, 15)]:   # llega desde la esquina
		ruta = jg.nav.camino(meta + off, meta)
		if not ruta.is_empty():
			rider_ini = meta + off
			break
	if ruta.is_empty():
		return false
	var asp := Figura.aspecto_de(D.get("domicilio", {}).get("rider", {"id": "rider", "g": "m", "edad": 24}))
	var cam := Color(0.2, 0.62, 0.55)
	asp["camisa"] = cam
	asp["ropa"] = {"arriba": cam}
	rider = Actor.new(Figura.crear(cam, Color.WHITE, 1.0, asp))
	jg.add_child(rider.nodo)
	rider.poner(rider_ini)
	rider.fijar_ruta(ruta, false)
	rider.carga = true
	rider.poner_mano("bolsa", jg)
	var et: Label3D = jg.etiqueta("🛵 Reparto", Vector3(0, 2.1, 0), 34, Color(1, 1, 1))
	et.reparent(rider.nodo, false)
	et.position = Vector3(0, 2.1, 0)
	et.pixel_size = 0.0055
	rider.set_lod(true, false)
	return true

func _tick_pedido(dt: float) -> void:
	if pedido.is_empty():
		return
	var d: Dictionary = D.get("domicilio", {})
	var mult := 1.0 if jg.vel_juego == 1 else 1.8
	match str(pedido["est"]):
		"espera":
			if jg.minutos >= float(pedido["llega"]):
				if _crear_rider():
					pedido["est"] = "anda"
				else:
					_dejar_en_puerta()
		"anda":
			if rider.mover(Escala.VEL_ANDAR * mult * dt):
				pedido["est"] = "puerta"
				pedido["puerta_t"] = jg.minutos
				rider.mirar(_punto_dentro() - rider.pos2())
				jg._aviso(_t("pedido_llega"))
				var it := _casa_it()
				if it != null and jg.interior == it and jg.cola.total() == 0 and jg.salto_rest <= 0.0:
					jg._ir_a_punto(_punto_dentro())
		"puerta":
			if jg.jugador.pos2().distance_to(_punto_dentro()) < 1.3 and not jg.jugador.anda:
				if jg.jugador.mano == "":
					jg.jugador.poner_mano("plato:domicilio", jg)
				else:
					despensa.append({"p": "sobras:domicilio", "n": 1, "cad": dia() + 1})
				jg._aviso(_t("pedido_recogido"))
				_rider_se_va()
			elif jg.minutos - float(pedido.get("puerta_t", jg.minutos)) > float(d.get("espera_puerta_min", 15)):
				_dejar_en_puerta()
		"vuelve":
			if rider == null or rider.mover(Escala.VEL_ANDAR * mult * dt):
				if rider != null:
					rider.nodo.queue_free()
				rider = null
				pedido = {}
	if rider != null:
		rider.anim_tick()

func _rider_se_va() -> void:
	if rider == null:
		pedido = {}
		return
	rider.carga = false
	rider.poner_mano("", jg)
	rider.fijar_ruta(jg.nav.camino(rider.pos2(), rider_ini), false)
	pedido["est"] = "vuelve"

func _dejar_en_puerta() -> void:
	despensa.append({"p": "sobras:domicilio", "n": 1, "cad": dia() + 1})
	jg._aviso(_t("pedido_puerta"))
	_rider_se_va()

# =============== cada fotograma ===============
func tick(dt: float) -> void:
	var a: Actor = jg.jugador
	var lleva := a.mano == "bolsa"
	if a.carga != lleva:
		a.carga = lleva
	bolsa_n.visible = lleva and a.postura == "de_pie"
	# la compra se guarda sola al entrar en casa: va andando a la nevera
	var it := _casa_it()
	if lleva and not guardando and it != null and jg.interior == it and jg.cola.total() == 0 and not a.anda and jg.salto_rest <= 0.0:
		var nev: Array = it.de_tipo("nevera")
		guardando = true
		if nev.is_empty():
			terminar({"tipo": "guardar_compra"}, null)
			jg._aviso("Sin nevera: lo dejas todo en la encimera.")
		else:
			for ac in nev[0].def.get("acciones", []):
				if ac["id"] == "guardar_compra":
					jg.cola.añadir(nev[0], ac)
	if guardando and jg.interior != it:
		guardando = false     # si se canceló, se vuelve a intentar al entrar otra vez (o desde la nevera)
	if panel_info.visible and jg.panel_ficha.visible:
		panel_info.visible = false     # se ha abierto otro menú
	_tick_pedido(dt)
	# cambio de día: nutrición del día y aviso de lo caducado
	var d := dia()
	if d != ult_dia:
		for i in mini(d - ult_dia, 7):
			_cerrar_dia()
		ult_dia = d
	if aviso_cad != d and jg.salto_rest <= 0.0 and _hay_caducado():
		aviso_cad = d
		jg._aviso(_t("caducado"))

func _cerrar_dia() -> void:
	var N: Dictionary = D.get("nutricion", {})
	var n := hoy.size()
	var media := 0.0
	for k in hoy:
		media += float(hoy[k])
	media = media / n if n > 0 else 0.0
	var f: float = [0.0, 0.6, 0.9, 1.0][mini(n, 3)]
	var puntos := minf(100.0, media * 100.0 * f)
	var antes := nut
	var w := float(N.get("peso_dia", 0.15))
	nut = nut * (1.0 - w) + puntos * w
	hoy = {}
	if nut < float(N.get("mal", 45)):
		jg.nec["energia"] = maxf(0.0, jg.nec["energia"] + float(N.get("energia_mal", -4)))
		if antes >= float(N.get("mal", 45)):
			jg._aviso(_t("nut_mal"))
	elif nut >= float(N.get("bien", 70)):
		jg.nec["energia"] = minf(100.0, jg.nec["energia"] + float(N.get("energia_bien", 2)))
		if antes < float(N.get("bien", 70)):
			jg._aviso(_t("nut_bien"))

# =============== guardado (sección «comida») ===============
func _guardar() -> Dictionary:
	var pd := {}
	if not pedido.is_empty() and str(pedido["est"]) != "vuelve":
		# un pedido que ya estaba en la puerta vuelve a salir al cargar (el rider no se guarda)
		pd = {"llega": float(pedido["llega"]) if str(pedido["est"]) == "espera" else float(jg.minutos)}
	return {"despensa": despensa.duplicate(true), "bolsa": bolsa.duplicate(true), "nut": nut, "hoy": hoy.duplicate(),
		"ult_dia": ult_dia, "pedido": pd}

func _lotes(x) -> Array:
	var r: Array = []
	if not x is Array:
		return r
	for l in x:
		if not l is Dictionary:
			continue
		var p := str(l.get("p", ""))
		var ok := not prod(p).is_empty()
		if p.begins_with("sobras:"):
			var k := p.split(":")[1]
			ok = receta(k).has("n") or D.get("fuera", {}).has(k)
		var n = l.get("n", 0)
		var c = l.get("cad", -1)
		if ok and (n is float or n is int) and int(n) > 0 and (c is float or c is int):
			r.append({"p": p, "n": int(n), "cad": int(c)})
	return r

func _aplicar(d: Dictionary) -> void:
	if d.has("despensa"):
		despensa = _lotes(d["despensa"])
	bolsa = _lotes(d.get("bolsa", []))
	var x = d.get("nut", nut)
	if (x is float or x is int) and is_finite(float(x)):
		nut = clampf(float(x), 0.0, 100.0)
	var h = d.get("hoy", {})
	hoy = {}
	if h is Dictionary:
		for k in h:
			if str(k) in ["des", "com", "cen"] and (h[k] is float or h[k] is int):
				hoy[str(k)] = float(h[k])
	var u = d.get("ult_dia", dia())
	ult_dia = int(u) if (u is float or u is int) else dia()
	var pd = d.get("pedido", {})
	pedido = {}
	if pd is Dictionary and pd.has("llega") and (pd["llega"] is float or pd["llega"] is int):
		pedido = {"llega": maxf(float(pd["llega"]), jg.minutos + 2.0), "est": "espera"}
	if not bolsa.is_empty():
		jg.jugador.poner_mano("bolsa", jg)

# =============== puente de pruebas ===============
func cmd(c: String, args: Array) -> bool:
	var a = args[1] if args.size() > 1 else null
	match c:
		"super":
			abrir_super(jg.edificios["super"])
		"cesta":
			_cambiar(str(a), int(args[2]) if args.size() > 2 else 1)
		"seccion":
			_elegir_sec(str(a))
		"pagar":
			pagar()
		"salir_super":
			salir_super()
		"comer_super":
			comer_en_super()
		"domicilio":
			pedir_domicilio()
		"despensa_dar":
			_añadir(despensa, str(a), int(args[2]) if args.size() > 2 else 1)
		"despensa_vaciar":
			despensa.clear()
		"a_puerta":
			# pruebas: pone a la jugadora en la puerta de un edificio (la máquina de pruebas va a 2 fps)
			jg.jugador.poner(jg.edificios[str(a)]["puerta"])
			jg.jugador.ruta = []
			jg.pivote.position = jg.jugador.nodo.position
		"hab_cocina":
			jg.hab["cocina"] = float(a)
		"menu_obj":
			# abre el menú de un mueble como al tocarlo e imprime sus botones
			var ob = jg._objeto_por_id(str(a))
			if ob != null:
				jg._menu_objeto(ob, {})
			var bs: Array = []
			for b in jg.ficha_botones.get_children():
				if not b.is_queued_for_deletion() and b.visible:
					bs.append(("[x]" if b.disabled else "") + b.text)
			print("menu_obj: " + " | ".join(bs))
		"recetas":
			ficha_recetas()
		"ver_despensa":
			ficha_despensa()
		"comida":
			var t: Array = []
			for l in despensa:
				t.append("%s:%d:%d" % [l["p"], int(l["n"]), int(l["cad"])])
			print("comida: dia=%d nut=%.1f hoy=%s cocina=%.1f bolsa=%d pedido=%s mano=%s carga=%s despensa=%s" % [dia(), nut, str(hoy), float(jg.hab.get("cocina", 0.0)), bolsa.size(), str(pedido.get("est", "-")), jg.jugador.mano, str(jg.jugador.carga), " ".join(t)])
		"super_ui":
			# rectángulos de botones del súper (pruebas con el dedo)
			var r: Array = []
			if panel.visible:
				r.append("n=%d" % _articulos())
				r.append("pagar=%s" % _rect(b_pagar))
				r.append("comer=%s" % _rect(b_comer))
				for k in b_secs:
					r.append("sec:%s=%s" % [k, _rect(b_secs[k])])
				for f in lista.get_children():
					if f.is_queued_for_deletion():
						continue
					var bs: Array = f.get_children().filter(func(x): return x is Button)
					if bs.size() == 2:
						r.append("mas:%d=%s" % [f.get_index(), _rect(bs[1])])
			print("super_ui: " + " ".join(r))
		_:
			return false
	return true

func _rect(b: Control) -> String:
	var g := b.get_global_rect()
	return "%d,%d,%d,%d" % [int(g.position.x), int(g.position.y), int(g.size.x), int(g.size.y)]
