class_name Objetivos
extends RefCounted
# EMPEZAR Y OBJETIVOS (dentro de la partida): primeros pasos guiados, deseos, ánimo, historia (con Historia) y avisos en cola.
# Textos y cifras en data/objetivos.json; aquí la lógica. En main.gd solo hay ganchos «# --- objetivos ---».
#
# GANCHO PARA LOS DEMÁS BLOQUES: avisar de un hecho
#     Objetivos.hecho("clave", {datos})          (estática; si no hay partida, no hace nada)
# y, si se quiere escuchar, la señal `main.objetivos.suceso(clave, datos)`. Claves que se entienden hoy:
#   "casa"                         entró en su piso (lo detecta Objetivos solo)
#   "accion"   {ac, obj, tipo}     terminó una acción de un mueble o cliente (lo manda cola.gd)
#   "dormir"   {min}               se despertó tras dormir `min` minutos (lo manda cola.gd)
#   "super"                        entró en el súper (lo detecta Objetivos solo)
#   "compra"   {donde, gasto}      compró (hoy: baja el dinero estando en el súper; COMPRAS puede mandarlo)
#   "nevera"   {llena: bool}       la nevera está llena (COMPRAS)
#   "hablar"   {id, nombre}        habló con alguien del barrio (VECINOS; hoy: charlar o un chiste en el bar)
#   "amistad"  {id, nombre}        hizo amistad (VECINOS; hoy: tres charlas cuentan como una amistad)
#   "trabajo"  {que}               buscó o consiguió trabajo (TRABAJO; hoy: el interruptor del bar)
#   "mueble"                       puso un mueble nuevo en casa (lo detecta Objetivos solo)
#   "fin_mes"  {dinero, deuda}     cerró el mes (DINERO; hoy: cada 30 días con el dinero que haya)
#   "deseo"    {id}                cumple a mano el deseo `id` si está activo
# Para contar algo en el diario: Historia.contar(texto, icono).
# Para poner algo en el Menú: main.guardado.seccion_menu("gente" | "trabajo" | "dinero" | id nuevo, texto, callable).

signal suceso(clave: String, datos: Dictionary)

static var _yo: Objetivos = null

var main: Node
var T: Dictionary
var historia: Historia
# ---- estado guardado ----
var nombre := ""
var nombre_propio := false
var pasos := {}                 # id -> true
var pasos_saltados := false
var pasos_fin := false
var deseos: Array = []          # [{"id", "desde" (min), "base" (dinero), "n" (progreso)}]
var recientes := {}             # id -> minuto en que se cumplió o caducó (no vuelve a salir en 2 días)
var alegria := 0.0
var cumplidos := {}             # "día" -> deseos cumplidos ese día
var total := 0
var ultimo_dia := -1
var ultimo_resumen := -1
var prox_deseo := 0.0
var casa_vista := false
var charlas := 0
var fin_mes_propio := true
var animo_ayer := -1.0
# ---- estado del momento ----
var animo := 60.0
var en_casa := false
var en_super := false
var super_t := 0.0
var dinero_super := 0.0
var trabaja_prev := false
var muebles_n := -1
var poll_t := 0.0
var cola_avisos: Array = []
var listo := false
# ---- interfaz ----
var tarjeta: PanelContainer
var tarjeta_cab: Label
var tarjeta_txt: Label
var tarjeta_sub: Label
var chip: Button
var panel: PanelContainer
var panel_titulo: Label
var panel_cont: VBoxContainer
var panel_scroll: ScrollContainer
var panel_cerrar: Button
var modo := ""                  # "", "objetivos", "historia", "resumen"
var _sig_tarjeta := ""

func _init(m: Node) -> void:
	main = m
	_yo = self
	T = Datos.cargar("objetivos")
	Inicio.T = T
	historia = Historia.new(m, int(T.get("historia", {}).get("dias", 14)))
	m.guardado.registrar("inicio", 1, func(): return {"nombre": nombre, "propio": nombre_propio}, _aplicar_inicio)
	m.guardado.registrar("objetivos", 1, _guardar, _aplicar)
	m.guardado.registrar("historia", 1, historia.guardar, historia.aplicar)

# =============== textos ===============
func tx(sec: String, k: String, h := {}) -> String:
	var v = T.get(sec, {}).get(k, k)
	var s := str(v)
	for c in h:
		s = s.replace("{%s}" % c, str(h[c]))
	return Inicio.genero(s, main.modelo_pj)

func _def_paso(id: String) -> Dictionary:
	for p in T["pasos"]["lista"]:
		if p["id"] == id:
			return p
	return {}

func _def_deseo(id: String) -> Dictionary:
	for d in T["deseos"]["lista"]:
		if d["id"] == id:
			return d
	return {}

func _contar(clave: String, h := {}) -> void:
	var x = T["historia"].get(clave, null)
	if x is Array and x.size() >= 2:
		var s := str(x[1])
		for c in h:
			s = s.replace("{%s}" % c, str(h[c]))
		historia.apuntar(Inicio.genero(s, main.modelo_pj), str(x[0]))

# =============== hechos ===============
static func hecho(clave: String, datos := {}) -> void:
	if _yo != null and is_instance_valid(_yo.main):
		_yo._hecho(clave, datos)

func _hecho(clave: String, d: Dictionary) -> void:
	suceso.emit(clave, d)
	match clave:
		"casa":
			_paso("casa")
			if not casa_vista:
				casa_vista = true
				_contar("casa")
		"accion":
			_accion(d)
		"dormir":
			var mins := float(d.get("min", 0.0))
			_paso("dormir")
			if mins >= 120.0:
				_contar("dormir", {"h": int(round(mins / 60.0))})
			else:
				_contar("siesta")
			if mins >= float(_def_deseo("dormir8").get("meta", 480)):
				_cumplir_regla("dormir")
			if mins >= 240.0 and not bool(main.estado_casa.get("platos_sucios", false)):
				_cumplir_regla("platos")
			_despertar()
		"super":
			_paso("super")
			_contar("super")
		"compra":
			_paso("super")
			if float(d.get("gasto", 0.0)) > 0.0:
				_contar("compra", {"g": Inicio.eur(float(d["gasto"]))})
			if str(d.get("donde", "super")) == "super":
				_cumplir_regla("compra")
		"nevera":
			if bool(d.get("llena", false)):
				_cumplir_regla("compra")
		"hablar":
			_paso("hablar")
			charlas += 1
			var meta := int(_def_deseo("amistad").get("meta", 3))
			for x in deseos:
				if x["id"] == "amistad":
					x["n"] = charlas - int(x.get("base", 0))
					if int(x["n"]) >= meta:
						_cumplir_regla("amistad")
					break
		"amistad":
			_paso("hablar")
			_cumplir_regla("amistad")
		"trabajo":
			_paso("trabajo")
		"mueble":
			_contar("mueble")
			_cumplir_regla("mueble")
		"fin_mes":
			if str(d.get("fuente", "")) != "objetivos":
				fin_mes_propio = false
			var dn := float(d.get("dinero", main.dinero))
			_contar("fin_mes", {"d": Inicio.eur(dn)})
			if float(d.get("deuda", maxf(0.0, -dn))) <= 0.0:
				_cumplir_regla("fin_mes")
		"deseo":
			for x in deseos:
				if x["id"] == str(d.get("id", "")):
					_cumplir(x)
					break

func _accion(d: Dictionary) -> void:
	var ac: Dictionary = d.get("ac", {})
	var id := str(ac.get("id", "")).split(":")[0]
	var tipo := str(d.get("tipo", ac.get("tipo", "")))
	var o = d.get("obj", null)
	var con := ""
	if o != null and is_instance_valid(o) and str(o.tipo) == "cliente" and o.cli is Dictionary and not o.cli.is_empty():
		con = str(o.cli["x"]["v"]["n"])
	var frase = T["historia"]["acciones"].get(id, null)
	if frase is Array:
		historia.apuntar(Inicio.genero(str(frase[1]).replace("{p}", con), main.modelo_pj), str(frase[0]))
	if tipo == "comer" or id == "picar":
		_paso("comer")
		var h := fposmod(main.minutos, 1440.0) / 60.0
		if tipo == "comer" and (h >= 19.0 or h < 2.0):
			_cumplir_regla("cena")
	if id == "charlar" or id == "chiste":
		_hecho("hablar", {"nombre": con})
	if id == "servir":
		_paso("trabajo")
	_cumplir_regla("accion:" + id)

# =============== pasos guiados ===============
func pasos_activos() -> bool:
	return not pasos_saltados and not pasos_fin

func _paso(id: String) -> void:
	if pasos.has(id) or _def_paso(id).is_empty():
		return
	pasos[id] = true
	if pasos_saltados or pasos_fin:
		return
	main._aviso("📋 " + tx("pasos", "hecho", {"t": _def_paso(id)["t"]}))
	if pasos.size() >= T["pasos"]["lista"].size():
		pasos_fin = true
		main._aviso(tx("pasos", "fin"))
		prox_deseo = minf(prox_deseo, main.minutos + 30.0)
	_pintar_tarjeta()

func siguiente_paso() -> Dictionary:
	for p in T["pasos"]["lista"]:
		if not pasos.has(p["id"]):
			return p
	return {}

func saltar_pasos() -> void:
	pasos_saltados = true
	main._aviso(tx("pasos", "saltados"))
	_pintar_tarjeta()
	if modo == "objetivos":
		abrir("objetivos")

# =============== deseos ===============
func _max_deseos() -> int:
	return int(T["deseos"]["max_con_pasos"]) if pasos_activos() else int(T["deseos"]["max"])

func con_trabajo() -> bool:
	if bool(main.trabaja_bar):
		return true
	var scr_t := Inicio.clase("Trabajo")
	if Inicio.tiene(scr_t, "con_trabajo"):
		return bool(scr_t.call("con_trabajo", main))
	return false

func _etiqueta_cumple(tag: String) -> int:
	# 0 = no; >0 = peso. Las de requisito (con_trabajo, dinero_N) devuelven -1 si no se cumplen.
	var n: Dictionary = main.nec
	match tag:
		"siempre":
			return 1
		"con_trabajo":
			return 1 if con_trabajo() else -1
		"energia_baja":
			return 3 if n["energia"] < 45.0 else 0
		"hambre_baja":
			return 3 if n["hambre"] < 50.0 else 0
		"social_bajo":
			return 3 if n["social"] < 50.0 else 0
		"diversion_baja":
			return 3 if n["diversion"] < 50.0 else 0
		"higiene_baja":
			return 3 if n["higiene"] < 50.0 else 0
		"en_casa":
			return 2 if en_casa else 0
		"platos_sucios":
			return 3 if bool(main.estado_casa.get("platos_sucios", false)) else 0
	if tag.begins_with("dinero_"):
		return 1 if float(main.dinero) >= float(tag.substr(7)) else -1
	return 0

func _peso(d: Dictionary) -> int:
	var p := 0
	for t in d.get("si", []):
		var w := _etiqueta_cumple(str(t))
		if w < 0:
			return 0
		p += w
	return p

func _activo(id: String) -> bool:
	for x in deseos:
		if x["id"] == id:
			return true
	return false

func añadir_deseo(id: String, avisar := true) -> bool:
	var d := _def_deseo(id)
	if d.is_empty() or _activo(id):
		return false
	deseos.append({"id": id, "desde": main.minutos, "base": (main.dinero if d.get("regla", "") == "ahorro" else charlas if d.get("regla", "") == "amistad" else 0.0), "n": 0})
	if avisar:
		main._aviso("%s %s" % [d["e"], tx("deseos", "nuevo", {"t": tx_d(d)})])
	_pintar_tarjeta()
	return true

func tx_d(d: Dictionary) -> String:
	return Inicio.genero(str(d["t"]), main.modelo_pj)

func _ofrecer() -> void:
	var cand: Array = []
	var tot := 0
	for d in T["deseos"]["lista"]:
		if _activo(d["id"]):
			continue
		if recientes.has(d["id"]) and main.minutos - float(recientes[d["id"]]) < 2880.0:
			continue
		var w := _peso(d)
		if w > 0:
			cand.append([d["id"], w])
			tot += w
	prox_deseo = main.minutos + float(T["deseos"]["cada_min"])
	if cand.is_empty():
		return
	var r := randi() % tot
	for c in cand:
		r -= int(c[1])
		if r < 0:
			añadir_deseo(str(c[0]))
			return

func _cumplir_regla(regla: String) -> void:
	for x in deseos.duplicate():
		if str(_def_deseo(x["id"]).get("regla", "")) == regla:
			_cumplir(x)

func _cumplir(x: Dictionary) -> void:
	var d := _def_deseo(x["id"])
	deseos.erase(x)
	recientes[x["id"]] = main.minutos
	alegria = minf(float(T["animo"]["max_alegria"]), alegria + float(d.get("r", 5)))
	total += 1
	var k := str(historia.dia_actual())
	cumplidos[k] = int(cumplidos.get(k, 0)) + 1
	historia.apuntar(Inicio.genero(str(d.get("f", d["t"])), main.modelo_pj), str(d["e"]))
	main._aviso("🎉 " + tx("deseos", "cumplido", {"t": tx_d(d)}))
	prox_deseo = minf(prox_deseo, main.minutos + 60.0)
	_animo()
	_pintar_tarjeta()

func _revisar_deseos() -> void:
	for x in deseos.duplicate():
		var d := _def_deseo(x["id"])
		if d.is_empty():
			deseos.erase(x)
			continue
		if d.get("regla", "") == "ahorro":
			x["n"] = maxf(0.0, float(main.dinero) - float(x.get("base", 0.0)))
			if float(x["n"]) >= float(d.get("meta", 300)):
				_cumplir(x)
				continue
		if d.has("dias") and main.minutos - float(x.get("desde", 0.0)) > float(d["dias"]) * 1440.0:
			deseos.erase(x)
			recientes[x["id"]] = main.minutos
			main._aviso(tx("deseos", "caducado", {"t": tx_d(d)}))
			_pintar_tarjeta()

func progreso(x: Dictionary) -> String:
	var d := _def_deseo(x["id"])
	match str(d.get("regla", "")):
		"ahorro":
			return "%s de %s" % [Inicio.eur(float(x.get("n", 0.0))), Inicio.eur(float(d.get("meta", 300)))]
		"amistad":
			return "Charlas: %d de %d" % [int(x.get("n", 0)), int(d.get("meta", 3))]
	if d.has("dias"):
		var queda: float = float(d["dias"]) * 1440.0 - (float(main.minutos) - float(x.get("desde", 0.0)))
		var dd := int(ceil(queda / 1440.0))
		return "Te dura %d día%s más" % [dd, "" if dd == 1 else "s"] if dd > 0 else ""
	return ""

# =============== ánimo ===============
func _animo() -> void:
	var s := 0.0
	var mn := 100.0
	for k in main.nec:
		s += float(main.nec[k])
		mn = minf(mn, float(main.nec[k]))
	var base := 0.6 * s / float(main.nec.size()) + 0.4 * mn
	animo = clampf(base * 0.8 + alegria + 5.0, 0.0, 100.0)

func nivel_animo(v := -1.0) -> String:
	if v < 0.0:
		v = animo
	for n in T["animo"]["niveles"]:
		if v >= float(n[0]):
			return Inicio.genero(str(n[1]), main.modelo_pj)
	return ""

static func color_animo(v: float) -> Color:
	if v >= 75.0:
		return Color(0.36, 0.78, 0.45)
	if v >= 55.0:
		return Color(0.62, 0.8, 0.4)
	if v >= 35.0:
		return Color(0.93, 0.76, 0.3)
	if v >= 18.0:
		return Color(0.94, 0.55, 0.3)
	return Color(0.88, 0.3, 0.28)

# =============== días ===============
func _nuevo_dia(antes: int, ahora: int) -> void:
	animo_ayer = animo
	alegria = maxf(0.0, alegria - float(T["animo"]["decae_dia"]) * float(ahora - antes))
	if fin_mes_propio:
		for dd in range(antes + 1, ahora + 1):
			if dd > 0 and dd % 30 == 0:
				_hecho("fin_mes", {"dinero": main.dinero, "deuda": maxf(0.0, -float(main.dinero)), "fuente": "objetivos"})
	for k in cumplidos.keys():
		if int(k) < ahora - 30:
			cumplidos.erase(k)

# al despertar: resumen del día que acabó y, si hay hueco, un deseo nuevo
func _despertar() -> void:
	var hoy := historia.dia_actual()
	if hoy - 1 > ultimo_resumen and hoy >= 1:
		ultimo_resumen = hoy - 1
		if deseos.size() < _max_deseos():
			_ofrecer()
		abrir("resumen")

# =============== empezar ===============
# Con el mundo montado y la partida cargada. ini: lo que devolvió Inicio.correr().
func empezar(ini: Dictionary) -> void:
	if bool(ini.get("nueva", false)):
		var base: Dictionary = main.personas.get("personaje_base", {})
		nombre = str(ini.get("nombre", ""))
		nombre_propio = nombre != "" and nombre != Figura.nombre_de(main.modelo_pj, base)
		if nombre == "":
			nombre = main.nombre_pj
		if not bool(ini.get("atajo", false)):
			main.dinero = float(T["inicio"].get("dinero", main.dinero))
		historia.apuntar(tx("inicio", "historia", {"dinero": Inicio.eur(main.dinero)}), "🧳")
		var trab := str(ini.get("trabajo", ""))
		if trab != "":
			var scr_t := Inicio.clase("Trabajo")
			if Inicio.tiene(scr_t, "elegir_inicial"):
				scr_t.call("elegir_inicial", main, trab)
			_paso("trabajo")
		añadir_deseo("nevera", false)
		main._aviso(tx("inicio", "aviso"))
		prox_deseo = main.minutos + float(T["deseos"]["cada_min"])
	_poner_nombre()
	var hoy := historia.dia_actual()
	if ultimo_dia < 0:
		ultimo_dia = hoy
	if ultimo_resumen < 0:
		ultimo_resumen = hoy - 1
	trabaja_prev = bool(main.trabaja_bar)
	muebles_n = _cuenta_muebles()
	_animo()
	listo = true
	_pintar_tarjeta()

func _poner_nombre() -> void:
	if not nombre_propio or nombre == "":
		nombre = Figura.nombre_de(main.modelo_pj, main.personas.get("personaje_base", {}))
	main.nombre_pj = nombre
	if main.jugador_etq != null:
		main.jugador_etq.text = nombre

func _aplicar_inicio(d: Dictionary) -> void:
	nombre = str(d.get("nombre", nombre))
	nombre_propio = bool(d.get("propio", nombre_propio))
	_poner_nombre()

func _cuenta_muebles() -> int:
	var c = main.edificios.get("casa", {}).get("interior", null)
	if c == null:
		return -1
	return c.por_id.size()

# =============== bucle ===============
func tick(dt: float) -> void:
	_avisos_tick()
	if not listo:
		return
	poll_t += dt
	if poll_t < 0.3:
		return
	poll_t = 0.0
	var hoy := historia.dia_actual()
	if hoy != ultimo_dia:
		if hoy > ultimo_dia:
			_nuevo_dia(ultimo_dia, hoy)
		ultimo_dia = hoy
	# en casa
	var c = main.edificios.get("casa", {}).get("interior", null)
	var ahora_casa: bool = c != null and main.interior == c
	if ahora_casa and not en_casa:
		_hecho("casa", {})
	en_casa = ahora_casa
	# en el súper: el dinero que baja estando allí (o justo al salir: el pago llega al acabar el salto) es una compra
	var s = main.edificios.get("super", null)
	var ahora_super: bool = s != null and main.dentro and main.jugador.pos2().distance_to(s["puerta"]) < 4.0
	if ahora_super and not en_super:
		dinero_super = main.dinero
		_hecho("super", {})
	if ahora_super:
		super_t = 1.5
	elif super_t > 0.0:
		super_t -= 0.3
	en_super = ahora_super
	if (ahora_super or super_t > 0.0) and float(main.dinero) < dinero_super - 0.01:
		_hecho("compra", {"donde": "super", "gasto": dinero_super - float(main.dinero)})
		dinero_super = main.dinero
	elif not ahora_super and super_t <= 0.0:
		dinero_super = main.dinero
	# trabajo provisional del bar
	if bool(main.trabaja_bar) and not trabaja_prev:
		_contar("trabajo_bar")
		_hecho("trabajo", {"que": "bar"})
	trabaja_prev = bool(main.trabaja_bar)
	# muebles nuevos en casa
	var nm := _cuenta_muebles()
	if muebles_n >= 0 and nm > muebles_n:
		_hecho("mueble", {})
	muebles_n = nm
	_revisar_deseos()
	if deseos.size() < _max_deseos() and main.minutos >= prox_deseo and main.salto_rest <= 0.0:
		_ofrecer()
	_animo()
	_pintar_chip()
	_visibilidad()

# =============== avisos en cola (no se pisan) ===============
# main._aviso pregunta aquí primero: si hay uno en pantalla, el nuevo espera su turno (y el de pantalla se acorta)
func aviso(t: String) -> bool:
	if main.toast == null:
		return false
	main.toast.move_to_front()
	if main.toast.visible and main.toast_t > 0.0:
		if t == main.toast.text:
			return true
		for x in cola_avisos:
			if x[0] == t:
				return true
		cola_avisos.append([t, Time.get_ticks_msec()])
		while cola_avisos.size() > 5:
			cola_avisos.pop_front()
		main.toast_t = minf(main.toast_t, 1.4)
		return true
	return false

func _avisos_tick() -> void:
	# con un panel abierto el aviso va debajo de él, para no tapar lo que se lee
	if main.toast != null:
		var y := 252.0
		if panel != null and panel.visible:
			var vh: float = main.get_viewport().get_visible_rect().size.y
			y = minf(panel.get_global_rect().end.y + 8.0, vh - 140.0)
		main.toast.offset_top = y
	if cola_avisos.is_empty() or main.toast == null or main.toast.visible:
		return
	# un aviso que lleva esperando más de 6 s ya no viene a cuento («Estás muy cansado» después de dormir)
	while not cola_avisos.is_empty() and Time.get_ticks_msec() - int(cola_avisos[0][1]) > 6000:
		cola_avisos.pop_front()
	if cola_avisos.is_empty():
		return
	main.toast.text = cola_avisos.pop_front()[0]
	main.toast.visible = true
	main.toast.move_to_front()
	main.toast_t = 1.8 if not cola_avisos.is_empty() else 2.6

# =============== interfaz ===============
func crear_ui(ui: Control) -> void:
	# tarjeta discreta abajo a la izquierda: el siguiente paso o lo que te apetece; tocarla abre Objetivos
	tarjeta = PanelContainer.new()
	var est := StyleBoxFlat.new()
	est.bg_color = Color(0.1, 0.14, 0.2, 0.78)
	est.set_corner_radius_all(12)
	est.content_margin_left = 10
	est.content_margin_right = 10
	est.content_margin_top = 6
	est.content_margin_bottom = 7
	tarjeta.add_theme_stylebox_override("panel", est)
	tarjeta.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	tarjeta.offset_left = 8
	tarjeta.offset_right = 8 + 232
	tarjeta.offset_bottom = -84
	tarjeta.offset_top = -84
	tarjeta.grow_vertical = Control.GROW_DIRECTION_BEGIN
	tarjeta.mouse_filter = Control.MOUSE_FILTER_STOP
	tarjeta.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventMouseButton and ev.button_index == MOUSE_BUTTON_LEFT and not ev.pressed:
			abrir("objetivos"))
	ui.add_child(tarjeta)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 1)
	vb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tarjeta.add_child(vb)
	tarjeta_cab = _lbl(12, Color(0.65, 0.72, 0.82))
	tarjeta_txt = _lbl(15, Color(1, 1, 1))
	tarjeta_sub = _lbl(13, Color(0.8, 0.84, 0.9))
	for l in [tarjeta_cab, tarjeta_txt, tarjeta_sub]:
		vb.add_child(l)
	# ánimo: una pastilla de color en la barra de arriba, junto a la hora
	chip = Button.new()
	chip.focus_mode = Control.FOCUS_NONE
	chip.custom_minimum_size = Vector2(0, 34)
	chip.add_theme_font_size_override("font_size", 14)
	chip.add_theme_color_override("font_color", Color(0.1, 0.1, 0.12))
	chip.add_theme_color_override("font_hover_color", Color(0.1, 0.1, 0.12))
	chip.add_theme_color_override("font_pressed_color", Color(0.1, 0.1, 0.12))
	chip.pressed.connect(func(): abrir("objetivos"))
	var f2: Control = main.lbl_hora.get_parent()
	f2.add_child(chip)
	f2.move_child(chip, 1)
	# avisos: por debajo de la columna de botones de la derecha (Cámara, Menú, Muebles) para no quedar tapados
	main.toast.offset_top = 252
	# panel central: Objetivos, Historia y el resumen al despertar
	panel = PanelContainer.new()
	var ep := StyleBoxFlat.new()
	ep.bg_color = Color(0.1, 0.11, 0.15, 0.95)
	ep.set_corner_radius_all(16)
	ep.set_content_margin_all(14)
	panel.add_theme_stylebox_override("panel", ep)
	panel.set_anchors_preset(Control.PRESET_TOP_WIDE)
	panel.offset_left = 12
	panel.offset_right = -12
	panel.offset_top = 100
	panel.offset_bottom = 100
	panel.grow_vertical = Control.GROW_DIRECTION_END
	panel.visible = false
	ui.add_child(panel)
	var pv := VBoxContainer.new()
	pv.add_theme_constant_override("separation", 10)
	panel.add_child(pv)
	var fila := HBoxContainer.new()
	pv.add_child(fila)
	panel_titulo = _lbl(22, Color(1.0, 0.9, 0.35))
	panel_titulo.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fila.add_child(panel_titulo)
	panel_scroll = ScrollContainer.new()
	panel_scroll.custom_minimum_size.y = 200
	panel_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	pv.add_child(panel_scroll)
	panel_cont = VBoxContainer.new()
	panel_cont.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	panel_cont.add_theme_constant_override("separation", 6)
	panel_scroll.add_child(panel_cont)
	panel_cerrar = Inicio.boton("Cerrar", func(): cerrar(), 48, 17)
	panel_cerrar.autowrap_mode = TextServer.AUTOWRAP_OFF
	pv.add_child(panel_cerrar)
	# Menú: Historia y Objetivos (Gente, Trabajo y Dinero son huecos de los otros bloques)
	main.guardado.seccion_menu("historia", tx("menu", "historia"), func(): abrir("historia"))
	main.guardado.seccion_menu("objetivos", tx("menu", "objetivos"), func(): abrir("objetivos"))
	_pintar_chip()

func _lbl(fs: int, col: Color) -> Label:
	var l := Label.new()
	l.add_theme_font_size_override("font_size", fs)
	l.add_theme_color_override("font_color", col)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l

var _chip_col := Color(0, 0, 0, 0)
func _pintar_chip() -> void:
	if chip == null:
		return
	var t := nivel_animo()
	if chip.text != t:
		chip.text = t
	if color_animo(animo) == _chip_col:
		return
	_chip_col = color_animo(animo)
	var e := StyleBoxFlat.new()
	e.bg_color = color_animo(animo)
	e.set_corner_radius_all(17)
	e.content_margin_left = 10
	e.content_margin_right = 10
	for n in ["normal", "hover", "pressed", "focus"]:
		chip.add_theme_stylebox_override(n, e)

func _pintar_tarjeta() -> void:
	if tarjeta == null:
		return
	var cab := ""
	var txt := ""
	var sub := ""
	if pasos_activos():
		var p := siguiente_paso()
		if not p.is_empty():
			cab = "%s · %d/%d" % [tx("pasos", "titulo").to_upper(), pasos.size(), T["pasos"]["lista"].size()]
			txt = "%s %s" % [p["e"], Inicio.genero(str(p["t"]), main.modelo_pj)]
			sub = Inicio.genero(str(p["f"]), main.modelo_pj)
	if txt == "" and not deseos.is_empty():
		cab = tx("deseos", "titulo").to_upper()
		var ls: Array = []
		for x in deseos:
			var d := _def_deseo(x["id"])
			if not d.is_empty():
				ls.append("%s %s" % [d["e"], tx_d(d)])
		txt = "\n".join(ls)
	var firma := cab + "|" + txt + "|" + sub
	if firma == _sig_tarjeta:
		return
	_sig_tarjeta = firma
	tarjeta_cab.text = cab
	tarjeta_txt.text = txt
	tarjeta_sub.text = sub
	tarjeta_sub.visible = sub != ""
	tarjeta.offset_top = tarjeta.offset_bottom   # que encoja al cambiar el texto
	_visibilidad()

func _visibilidad() -> void:
	if tarjeta == null:
		return
	if panel.visible and main.guardado.panel != null and main.guardado.panel.visible:
		cerrar()
		return
	var tapa: bool = main.panel_ficha.visible or main.velo.visible or panel.visible \
		or (main.muebles != null and main.muebles.activo) or (main.guardado.panel != null and main.guardado.panel.visible)
	tarjeta.visible = listo and tarjeta_txt.text != "" and not tapa

func cerrar() -> void:
	panel.visible = false
	modo = ""
	_visibilidad()

func abrir(que: String) -> void:
	if main.guardado.panel != null:
		main.guardado.panel.visible = false
	modo = que
	for c in panel_cont.get_children():
		c.queue_free()
	panel_cerrar.text = "Cerrar"
	match que:
		"objetivos":
			_contenido_objetivos()
		"historia":
			_contenido_historia()
		"resumen":
			_contenido_resumen()
	panel_scroll.scroll_vertical = 0
	panel.visible = true
	_visibilidad()
	_ajustar_alto()

# el panel mide lo que su contenido, como mucho hasta encima de las barras de abajo
func _ajustar_alto() -> void:
	await main.get_tree().process_frame
	if not panel.visible:
		return
	var vh: float = main.get_viewport().get_visible_rect().size.y
	var maxh := vh - panel.offset_top - 90.0 - 28.0 - 40.0 - 48.0 - 20.0
	panel_scroll.custom_minimum_size.y = clampf(panel_cont.get_combined_minimum_size().y, 40.0, maxf(120.0, maxh))
	panel.offset_bottom = panel.offset_top

func _seccion(t: String) -> void:
	var l := _lbl(13, Color(0.6, 0.68, 0.8))
	l.text = t.to_upper()
	panel_cont.add_child(l)

func _linea(t: String, fs := 16, col := Color(0.92, 0.94, 1.0)) -> Label:
	var l := _lbl(fs, col)
	l.text = t
	panel_cont.add_child(l)
	return l

func _hueco(h := 6) -> void:
	var c := Control.new()
	c.custom_minimum_size = Vector2(0, h)
	panel_cont.add_child(c)

func _contenido_objetivos() -> void:
	panel_titulo.text = tx("menu", "objetivos")
	_seccion(tx("animo", "titulo"))
	var fila := HBoxContainer.new()
	fila.add_theme_constant_override("separation", 10)
	panel_cont.add_child(fila)
	var l := _lbl(18, color_animo(animo))
	l.text = nivel_animo()
	l.autowrap_mode = TextServer.AUTOWRAP_OFF
	fila.add_child(l)
	var pb := ProgressBar.new()
	pb.min_value = 0
	pb.max_value = 100
	pb.value = animo
	pb.show_percentage = false
	pb.custom_minimum_size = Vector2(0, 14)
	pb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pb.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(0.25, 0.28, 0.33)
	bg.set_corner_radius_all(6)
	var fg := StyleBoxFlat.new()
	fg.bg_color = color_animo(animo)
	fg.set_corner_radius_all(6)
	pb.add_theme_stylebox_override("background", bg)
	pb.add_theme_stylebox_override("fill", fg)
	fila.add_child(pb)
	_linea(tx("animo", "explica"), 13, Color(0.7, 0.74, 0.82))
	_hueco()
	_seccion(tx("deseos", "titulo"))
	if deseos.is_empty():
		_linea(tx("deseos", "ninguno"), 15, Color(0.75, 0.78, 0.85))
	for x in deseos:
		var d := _def_deseo(x["id"])
		if d.is_empty():
			continue
		_linea("%s %s" % [d["e"], tx_d(d)], 17)
		var pr := progreso(x)
		if pr != "":
			_linea("     " + pr, 13, Color(0.7, 0.74, 0.82))
	if total > 0:
		_linea("Cumplidos hasta hoy: %d" % total, 13, Color(0.7, 0.74, 0.82))
	_hueco()
	_seccion(tx("pasos", "titulo") + " · %d/%d" % [pasos.size(), T["pasos"]["lista"].size()])
	for p in T["pasos"]["lista"]:
		var h := HBoxContainer.new()
		h.add_theme_constant_override("separation", 10)
		panel_cont.add_child(h)
		var caja := Panel.new()
		caja.custom_minimum_size = Vector2(20, 20)
		caja.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var ec := StyleBoxFlat.new()
		ec.set_corner_radius_all(5)
		var hecho_ := pasos.has(p["id"])
		ec.bg_color = Color(0.36, 0.78, 0.45) if hecho_ else Color(0, 0, 0, 0)
		ec.border_color = Color(0.36, 0.78, 0.45) if hecho_ else Color(0.6, 0.65, 0.75)
		ec.set_border_width_all(2)
		caja.add_theme_stylebox_override("panel", ec)
		h.add_child(caja)
		var lt := _lbl(16, Color(0.6, 0.64, 0.7) if hecho_ else Color(0.95, 0.96, 1.0))
		lt.text = "%s %s" % [p["e"], Inicio.genero(str(p["t"]), main.modelo_pj)]
		lt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		h.add_child(lt)
	if pasos_activos():
		var b := Inicio.boton(tx("pasos", "saltar"), saltar_pasos, 44, 15, Color(0.28, 0.3, 0.38))
		panel_cont.add_child(b)
	elif pasos_fin:
		_linea(tx("pasos", "fin"), 13, Color(0.7, 0.74, 0.82))

func _nombre_dia(d: int) -> String:
	return "%s, día %d" % [main.DIAS[d % 7], d + 1]

func _contenido_historia() -> void:
	panel_titulo.text = tx("historia", "titulo")
	if historia.dias.is_empty():
		_linea(tx("historia", "vacio"), 15, Color(0.75, 0.78, 0.85))
		return
	for i in range(historia.dias.size() - 1, -1, -1):
		var x: Dictionary = historia.dias[i]
		_seccion(_nombre_dia(int(x["d"])))
		for y in x["l"]:
			_linea("%02d:%02d  %s %s" % [int(y[0]) / 60, int(y[0]) % 60, y[1], Historia.texto_linea(y, tx("historia", "veces"))], 15)
		_hueco(4)

func _contenido_resumen() -> void:
	var ayer := historia.dia_actual() - 1
	panel_titulo.text = tx("historia", "resumen", {"dia": main.DIAS[posmod(ayer, 7)].to_lower()})
	var ls := historia.lineas(ayer)
	if ls.is_empty():
		_linea(tx("historia", "dia_vacio"), 16, Color(0.75, 0.78, 0.85))
	var n := 0
	for y in ls:
		if n >= 6:
			_linea(tx("historia", "mas_1" if ls.size() == 7 else "mas", {"n": ls.size() - 6}), 14, Color(0.7, 0.74, 0.82))
			break
		_linea("%s %s" % [y[1], Historia.texto_linea(y, tx("historia", "veces"))], 16)
		n += 1
	_hueco()
	var c := int(cumplidos.get(str(ayer), 0))
	if c > 0:
		_linea(tx("historia", "resumen_deseos", {"n": c}), 15, Color(1.0, 0.85, 0.5))
	if animo_ayer >= 0.0:
		_linea(tx("historia", "resumen_animo", {"a": nivel_animo(animo_ayer)}), 15, color_animo(animo_ayer))
	if not deseos.is_empty():
		var d := _def_deseo(deseos[-1]["id"])
		if not d.is_empty():
			_linea(tx("historia", "resumen_hoy", {"t": "%s %s" % [d["e"], tx_d(d)]}), 15, Color(0.85, 0.9, 1.0))
	panel_cerrar.text = tx("historia", "boton_resumen")

func en_ui(p: Vector2) -> bool:
	for c in [tarjeta, panel]:
		if c != null and c.visible and c.get_global_rect().has_point(p):
			return true
	return false

# =============== guardado ===============
func _guardar() -> Dictionary:
	return {"pasos": pasos.keys(), "saltados": pasos_saltados, "fin": pasos_fin, "deseos": deseos.duplicate(true),
		"recientes": recientes.duplicate(), "alegria": snappedf(alegria, 0.01), "cumplidos": cumplidos.duplicate(), "total": total,
		"ultimo_dia": ultimo_dia, "ultimo_resumen": ultimo_resumen, "prox_deseo": prox_deseo, "casa_vista": casa_vista,
		"charlas": charlas, "fin_mes_propio": fin_mes_propio, "animo_ayer": animo_ayer}

func _aplicar(d: Dictionary) -> void:
	var ps = d.get("pasos", null)
	if ps is Array:
		pasos = {}
		for p in ps:
			if not _def_paso(str(p)).is_empty():
				pasos[str(p)] = true
	pasos_saltados = bool(d.get("saltados", pasos_saltados))
	pasos_fin = bool(d.get("fin", pasos_fin))
	var ds = d.get("deseos", null)
	if ds is Array:
		deseos = []
		for x in ds:
			if x is Dictionary and not _def_deseo(str(x.get("id", ""))).is_empty():
				deseos.append({"id": str(x["id"]), "desde": float(x.get("desde", main.minutos)), "base": float(x.get("base", 0.0)), "n": float(x.get("n", 0))})
	if d.get("recientes", null) is Dictionary:
		recientes = d["recientes"].duplicate()
	if d.get("cumplidos", null) is Dictionary:
		cumplidos = d["cumplidos"].duplicate()
	alegria = float(d.get("alegria", alegria))
	total = int(d.get("total", total))
	ultimo_dia = int(d.get("ultimo_dia", ultimo_dia))
	ultimo_resumen = int(d.get("ultimo_resumen", ultimo_resumen))
	prox_deseo = float(d.get("prox_deseo", prox_deseo))
	casa_vista = bool(d.get("casa_vista", casa_vista))
	charlas = int(d.get("charlas", charlas))
	fin_mes_propio = bool(d.get("fin_mes_propio", fin_mes_propio))
	animo_ayer = float(d.get("animo_ayer", animo_ayer))
	_sig_tarjeta = ""
	_pintar_tarjeta()

# =============== órdenes de prueba (casita_cmd) ===============
func cmd(c: String, args: Array) -> bool:
	var a = args[1] if args.size() > 1 else null
	match c:
		"obj_estado":
			var ds: Array = []
			for x in deseos:
				ds.append(x["id"])
			print("obj_estado: " + JSON.stringify({"nombre": main.nombre_pj, "dinero": main.dinero, "pasos": pasos.keys(), "saltados": pasos_saltados,
				"fin": pasos_fin, "deseos": ds, "total": total, "animo": snappedf(animo, 0.1), "nivel": nivel_animo(), "alegria": alegria,
				"hoy": historia.lineas(historia.dia_actual()).size(), "dias": historia.dias.size(), "modo": modo,
				"tarjeta": tarjeta.visible, "cola_avisos": cola_avisos.size(), "historia": historia.lineas(historia.dia_actual())}))
		"obj_hecho":
			var d := {}
			if args.size() > 2:
				var j = JSON.parse_string(str(args[2]))
				if j is Dictionary:
					d = j
			_hecho(str(a), d)
		"obj_abrir":
			abrir(str(a))
		"obj_cerrar":
			cerrar()
		"obj_saltar":
			saltar_pasos()
		"obj_deseo":
			print("obj_deseo: %s" % str(añadir_deseo(str(a))))
		"obj_contar":
			Historia.contar(str(a), str(args[2]) if args.size() > 2 else "")
		"obj_ui":
			var r := {}
			for par in [["tarjeta", tarjeta], ["chip", chip], ["panel", panel], ["cerrar", panel_cerrar], ["menu", main.guardado.btn_menu]]:
				var ctl: Control = par[1]
				if ctl != null and ctl.is_visible_in_tree():
					var g := ctl.get_global_rect()
					r[par[0]] = [int(g.position.x), int(g.position.y), int(g.size.x), int(g.size.y)]
			for id in main.guardado.secciones_menu:
				var b: Button = main.guardado.secciones_menu[id]
				if b.is_visible_in_tree():
					var g2 := b.get_global_rect()
					r["menu:" + id] = [int(g2.position.x), int(g2.position.y), int(g2.size.x), int(g2.size.y)]
			print("obj_ui: " + JSON.stringify(r))
		_:
			return false
	return true
