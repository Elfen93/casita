class_name Cuenta
extends RefCounted
# Bloque TRABAJO Y DINERO (2/2): la cuenta del banco. Movimientos, alquiler y facturas a primeros de mes, deudas y recargos,
# el panel «Dinero» y la cola de tarjetas (avisos de papel en el centro de la pantalla).
#
# TODO LO QUE MUEVE DINERO PASA POR AQUÍ (como bkAdd en el juego web):
#   jg.cuenta.pagar("Súper", 12.5) -> bool      cobra si hay saldo (false y no toca nada si no llega)
#   jg.cuenta.ingresar("Venta de muebles", 75)   suma
#   jg.cuenta.mover("Concepto", ±importe)         sin comprobar saldo (puede dejar la cuenta en negativo)
# El concepto sale en «Movimientos» del panel Dinero; su categoría, de data/trabajo.json -> dinero.categorias.
# Red de seguridad: `main.dinero` tiene un setter que avisa aquí (al_cambiar), así que un `jg.dinero -= x` antiguo también
# queda apuntado, con un concepto deducido (Muebles en el modo muebles, Bar dentro del bar, Súper en el súper, si no «Otros»).
#
# Calendario: el mes de juego son 4 semanas (data/trabajo.json -> calendario.dias_mes = 28), y el día 1 cae en lunes.
# Alquiler el día 1, internet y móvil el 3, luz el 8, agua el 15 (a las 9:00). El primer mes ya está pagado (fianza y mes).

var jg
var D: Dictionary            # data/trabajo.json -> dinero
var DIAS_MES := 28
var HORA := 9
var alquiler := 800.0
var movs: Array = []         # [{d, m, c, i}] d día absoluto, m minuto del día, c concepto, i importe (+ ingreso, - gasto)
var deudas: Array = []       # [{c, i, d, alq}] concepto, importe pendiente, día en que se debió, si es el alquiler
var casero_avisos := 0       # avisos del casero ya dados por el alquiler que se debe
var desahucio_pendiente := false
var ult_min := -1.0
var ctx := ""                # concepto del movimiento en curso
var silencio := true         # al cargar la partida no se apuntan movimientos
# interfaz
var hoja: Dictionary = {}
var abierta := false
var cola_tarjetas: Array = []
var tarjeta_act: PanelContainer = null
var _toque_t := -1000
var _rojo := false
var _velo_frame := -10

func _init(m) -> void:
	jg = m
	var T := Datos.cargar("trabajo")
	D = T.get("dinero", {})
	DIAS_MES = int(T.get("calendario", {}).get("dias_mes", 28))
	HORA = int(T.get("calendario", {}).get("hora_pagos", 9))
	alquiler = alquiler_datos()
	jg.guardado.registrar("cuenta", 1, _guardar, _aplicar)
	_despertar.call_deferred()

## el alquiler mensual del piso (data/trabajo.json -> dinero.vivienda): el semanal del juego web, al mes y redondeado a 5 €
static func alquiler_datos() -> float:
	var V: Dictionary = Datos.cargar("viviendas").get("viviendas", {})
	var sem := float(V.get(str(Datos.cargar("trabajo").get("dinero", {}).get("vivienda", "viejo")), {}).get("rent", 185))
	return roundf(sem * 52.0 / 12.0 / 5.0) * 5.0

func _despertar() -> void:
	silencio = false

# =============== calendario ===============
func dia() -> int:
	return int(jg.minutos / 1440.0)

func mes_de(d: int) -> int:
	return d / DIAS_MES

func dia_mes(d: int) -> int:
	return d % DIAS_MES + 1

## día absoluto del próximo `dm` del mes (hoy incluido si aún no han dado las 9)
func proximo(dm: int) -> int:
	var d := dia()
	var base := mes_de(d) * DIAS_MES + dm - 1
	var pasado := base < d or (base == d and fposmod(jg.minutos, 1440.0) >= HORA * 60.0)
	return base + DIAS_MES if pasado else base

# =============== mover dinero ===============
func mover(concepto: String, importe: float) -> void:
	var antes := ctx
	ctx = concepto
	jg.dinero += importe
	ctx = antes

func pagar(concepto: String, importe: float) -> bool:
	if importe <= 0.0:
		return true
	if jg.dinero + 0.001 < importe:
		return false
	mover(concepto, -importe)
	return true

func ingresar(concepto: String, importe: float) -> void:
	if importe > 0.0:
		mover(concepto, importe)

func puede(importe: float) -> bool:
	return jg.dinero + 0.001 >= importe

## lo llama el setter de main.dinero
func al_cambiar(antes: float, despues: float) -> void:
	if silencio:
		return
	var dlt := snappedf(despues - antes, 0.01)
	if absf(dlt) < 0.005:
		return
	var c := ctx if ctx != "" else _deducir(dlt)
	var d := dia()
	var mm := int(fposmod(jg.minutos, 1440.0))
	movs.append({"d": d, "m": mm, "c": c, "i": dlt})
	if movs.size() > 300:
		movs = movs.slice(movs.size() - 300)
	if abierta:
		_rellenar.call_deferred()

func _deducir(dlt: float) -> String:
	if jg.muebles != null and jg.muebles.activo:
		return "Muebles" if dlt < 0.0 else "Venta de muebles"
	if jg.bar != null and jg.interior != null and jg.interior == jg.bar.it:
		return "Bar" if dlt < 0.0 else "Ingreso"
	if (jg.velo.visible or Engine.get_process_frames() - _velo_frame <= 1) and str(jg.velo_txt.text).begins_with("Compr"):
		return "Súper"
	return "Ingreso" if dlt > 0.0 else "Otros gastos"

func categoria(c: String) -> String:
	return str(D.get("categorias", {}).get(c, "ingresos" if c.begins_with("Venta") else "otros"))

func deuda_total() -> float:
	var t := 0.0
	for x in deudas:
		t += float(x["i"])
	return t

# =============== pagos del mes ===============
func tick() -> void:
	var m: float = jg.minutos
	if ult_min < 0.0 or m < ult_min or m - ult_min > 600.0:
		ult_min = m       # salto de reloj (carga, pruebas): no se cobra lo saltado
		return
	var d0 := int(ult_min / 1440.0)
	var d1 := int(m / 1440.0)
	for d in range(d0, d1 + 1):
		var tp := d * 1440.0 + HORA * 60.0
		if ult_min < tp and tp <= m:
			_pagos_del_dia(d)
	ult_min = m
	if jg.velo.visible:
		_velo_frame = Engine.get_process_frames()   # el efecto de un salto (pagar el súper) llega al quitar el velo
	_tarjetas_tick()
	var rojo: bool = deudas.size() > 0 or jg.dinero < 0.0
	if jg.lbl_dinero != null and rojo != _rojo:
		_rojo = rojo
		jg.lbl_dinero.add_theme_color_override("font_color", PanelUI.ROJO if rojo else Color(0.65, 0.95, 0.6))

func _pagos_del_dia(d: int) -> void:
	var dm := dia_mes(d)
	# lo que se debía: se vuelve a pasar cada mañana
	if dm == 1 and d > 0:   # --- objetivos --- se cierra el mes (antes de pasar el alquiler del nuevo)
		Objetivos.hecho("fin_mes", {"dinero": jg.dinero, "deuda": deuda_total()})
	_cobrar_deudas(d)
	if dm == int(D.get("alquiler_dia", 1)) and d > 0:
		_cobrar("Alquiler", alquiler, d, true)
		var ab: Dictionary = D.get("abono", {})
		if jg.trabajo != null and jg.trabajo.trabaja_fuera() and not ab.is_empty():
			_cobrar(str(ab["n"]), float(ab["i"]), d, false)
	for f in D.get("facturas", []):
		if int(f["dia"]) == dm:
			_cobrar(str(f["n"]), _importe_factura(f, d), d, false)
	_casero(d)

func _importe_factura(f: Dictionary, d: int) -> float:
	var v := float(f.get("var", 0))
	if v <= 0.0:
		return float(f["i"])
	var h := float(absi(hash(str(f["id"]) + str(mes_de(d)))) % 1000) / 1000.0
	return roundf(float(f["i"]) + (h * 2.0 - 1.0) * v)

func _cobrar(concepto: String, importe: float, d: int, alq: bool) -> void:
	if pagar(concepto, importe):
		jg._aviso("%s: %s" % [concepto, jg._eur(importe)])
		if alq:
			Historia.contar("Pagaste el alquiler: %s." % jg._eur(importe), "🏠")
		return
	Historia.contar(("No llegó para el alquiler: %s." % jg._eur(importe)) if alq else ("Recibo devuelto: %s, %s." % [concepto, jg._eur(importe)]), "⚠")
	if alq:
		deudas.append({"c": concepto, "i": importe, "d": d, "alq": true})
		tarjeta(str(D.get("alquiler_impagado_titulo", "")), [PanelUI.huecos(str(D.get("alquiler_impagado", "")), {"v": jg._eur(importe), "s": jg._eur(jg.dinero), "casero": str(D.get("casero", "el casero"))})])
	else:
		var r := float(D.get("recargo", 0))
		deudas.append({"c": concepto, "i": importe, "d": d, "alq": false})
		if r > 0.0:
			deudas.append({"c": str(D.get("recargo_n", "Recargo")), "i": r, "d": d, "alq": false})
		tarjeta(str(D.get("devuelto_titulo", "")), [PanelUI.huecos(str(D.get("devuelto", "")), {"n": concepto, "v": jg._eur(importe), "r": jg._eur(r)})])

func _cobrar_deudas(_d: int) -> void:
	var quedan: Array = []
	for x in deudas:
		if quedan.is_empty() and pagar(str(x["c"]), float(x["i"])):
			jg._aviso(PanelUI.huecos(str(D.get("pagada_deuda", "")), {"n": x["c"], "v": jg._eur(float(x["i"]))}))
			Historia.contar("Pagaste lo que debías: %s, %s." % [str(x["c"]), jg._eur(float(x["i"]))], "✅")
			continue
		quedan.append(x)
	deudas = quedan
	var debe_alq := false
	for x in deudas:
		if x.get("alq", false):
			debe_alq = true
	if not debe_alq:
		casero_avisos = 0

## mensajes del casero mientras se le debe el alquiler (el desahucio queda apuntado: aún no está en el juego)
func _casero(d: int) -> void:
	var desde := -1
	for x in deudas:
		if x.get("alq", false):
			desde = int(x["d"])
			break
	if desde < 0:
		return
	var av: Array = D.get("casero_avisos", [])
	if casero_avisos < av.size() and d - desde >= int(av[casero_avisos][0]):
		var a: Array = av[casero_avisos]
		casero_avisos += 1
		var partes: Array = [str(a[2])]
		Historia.contar(str(a[1]) + ".", "📨")
		if casero_avisos == av.size():
			desahucio_pendiente = true
			partes.append(str(D.get("desahucio_pendiente", "")))
		tarjeta(str(a[1]), partes)

## los pagos de las próximas 4 semanas: [{d, c, i}] ordenados por día (la nómina y el paro los pone Trabajo)
func proximos_pagos() -> Array:
	var r: Array = []
	var d_alq := proximo(int(D.get("alquiler_dia", 1)))
	r.append({"d": d_alq, "c": "Alquiler", "i": -alquiler})
	var ab: Dictionary = D.get("abono", {})
	if jg.trabajo != null and jg.trabajo.trabaja_fuera() and not ab.is_empty():
		r.append({"d": d_alq, "c": str(ab["n"]), "i": -float(ab["i"])})
	for f in D.get("facturas", []):
		var df := proximo(int(f["dia"]))
		r.append({"d": df, "c": str(f["n"]), "i": -_importe_factura(f, df)})
	if jg.trabajo != null:
		r.append_array(jg.trabajo.proximos_ingresos())
	r.sort_custom(func(a, b): return int(a["d"]) < int(b["d"]))
	return r

# =============== tarjetas (avisos de papel) ===============
## encola una tarjeta; sale cuando no hay velo ni otra tarjeta. `partes`: textos o filas [izq, der, color?]
func tarjeta(titulo: String, partes: Array, boton := "Vale") -> void:
	cola_tarjetas.append([titulo, partes, boton])
	_tarjetas_tick()

func _tarjetas_tick() -> void:
	if tarjeta_act != null or cola_tarjetas.is_empty() or jg.velo.visible or (jg.muebles != null and jg.muebles.activo):
		return
	var t: Array = cola_tarjetas.pop_front()
	tarjeta_act = PanelUI.tarjeta(jg.ui, str(t[0]), t[1], _cerrar_tarjeta, str(t[2]))

func _cerrar_tarjeta() -> void:
	if tarjeta_act != null:
		tarjeta_act.queue_free()
		tarjeta_act = null
	_tarjetas_tick.call_deferred()

func hay_tarjeta() -> bool:
	return tarjeta_act != null

# =============== panel «Dinero» ===============
func crear_ui(ui: Control) -> void:
	hoja = PanelUI.hoja(ui, func(): abrir(false))
	# tocar el dinero del HUD abre el panel
	jg.lbl_dinero.mouse_filter = Control.MOUSE_FILTER_STOP
	jg.lbl_dinero.gui_input.connect(func(ev: InputEvent):
		# el dedo llega dos veces (toque y ratón emulado): un solo cambio cada 0,4 s
		if (ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT) or (ev is InputEventScreenTouch and ev.pressed):
			if Time.get_ticks_msec() - _toque_t > 400:
				_toque_t = Time.get_ticks_msec()
				abrir(not abierta))

func abrir(v: bool) -> void:
	if v and jg.trabajo != null:
		jg.trabajo.abrir(false)
	if v and jg.objetivos != null and jg.objetivos.modo != "":  # --- objetivos --- una hoja cada vez
		jg.objetivos.cerrar()
	if v and jg.relaciones != null:
		jg.relaciones.ui.cerrar()
	abierta = v
	hoja["raiz"].visible = v
	if v:
		jg._cerrar_ficha()
		_rellenar()
		jg.guardado._abrir_panel(false)

func _rellenar() -> void:
	if not abierta:
		return
	var L: VBoxContainer = hoja["lista"]
	PanelUI.vaciar(L)
	var d := dia()
	hoja["titulo"].text = "💶 Dinero · %s" % str(D.get("banco", "Banco"))
	PanelUI.fila(L, "Saldo", jg._eur(jg.dinero), PanelUI.CLARO, PanelUI.VERDE if jg.dinero >= 0.0 else PanelUI.ROJO, 20)
	if not deudas.is_empty():
		var bx := PanelUI.recuadro(L, Color(0.32, 0.12, 0.12, 1.0))
		PanelUI.seccion(bx, "Debes %s" % jg._eur(deuda_total()), PanelUI.ROJO)
		for x in deudas:
			PanelUI.fila(bx, "%s · desde el día %d" % [x["c"], dia_mes(int(x["d"]))], jg._eur(float(x["i"])), PanelUI.CLARO, PanelUI.ROJO)
		PanelUI.texto(bx, "Se vuelve a cobrar cada mañana a las %d:00 si hay saldo." % HORA, 13, PanelUI.CLARO_SUAVE)
	# este mes
	var ms := mes_de(d)
	var ing := 0.0
	var gas := 0.0
	var por_cat := {}
	var del_mes: Array = []
	for x in movs:
		if mes_de(int(x["d"])) != ms:
			continue
		del_mes.append(x)
		var i := float(x["i"])
		if i > 0.0:
			ing += i
		else:
			gas += -i
			var k := categoria(str(x["c"]))
			por_cat[k] = float(por_cat.get(k, 0.0)) - i
	PanelUI.seccion(L, "Este mes (mes %d, día %d de %d)" % [ms + 1, dia_mes(d), DIAS_MES])
	PanelUI.fila(L, "Ingresos", ("+" if ing > 0.0 else "") + jg._eur(ing), PanelUI.CLARO, PanelUI.VERDE if ing > 0.0 else PanelUI.CLARO)
	PanelUI.fila(L, "Gastos", ("−" if gas > 0.0 else "") + jg._eur(gas), PanelUI.CLARO, PanelUI.ROJO if gas > 0.0 else PanelUI.CLARO)
	var cn: Dictionary = D.get("cat_n", {})
	for k in por_cat:
		PanelUI.fila(L, "   " + str(cn.get(k, k)), jg._eur(float(por_cat[k])), PanelUI.CLARO_SUAVE, PanelUI.CLARO_SUAVE, 14)
	# próximos pagos
	PanelUI.linea(L)
	PanelUI.seccion(L, "Próximos pagos")
	var n := 0
	for p in proximos_pagos():
		if n >= 8:
			break
		n += 1
		var i := float(p["i"])
		var cuando := "hoy" if int(p["d"]) == d else ("mañana" if int(p["d"]) == d + 1 else "día %d" % dia_mes(int(p["d"])))
		PanelUI.fila(L, "%s · %s" % [cuando, p["c"]], ("+" if i > 0.0 else "−") + jg._eur(absf(i)), PanelUI.CLARO, PanelUI.VERDE if i > 0.0 else PanelUI.CLARO)
	# movimientos
	PanelUI.linea(L)
	PanelUI.seccion(L, "Movimientos del mes")
	if del_mes.is_empty():
		PanelUI.texto(L, "Ninguno todavía.", 14, PanelUI.CLARO_SUAVE)
	var k2 := del_mes.size() - 1
	var shown := 0
	while k2 >= 0 and shown < 40:
		var x: Dictionary = del_mes[k2]
		var i := float(x["i"])
		PanelUI.fila(L, "Día %d, %02d:%02d · %s" % [dia_mes(int(x["d"])), int(x["m"]) / 60, int(x["m"]) % 60, x["c"]], ("+" if i > 0.0 else "−") + jg._eur(absf(i)), PanelUI.CLARO, PanelUI.VERDE if i > 0.0 else PanelUI.CLARO, 14)
		k2 -= 1
		shown += 1
	if jg.trabajo != null and not jg.trabajo.ult_nomina.is_empty():
		L.add_child(PanelUI.boton("Ver la última nómina", func(): jg.trabajo.tarjeta_nomina(jg.trabajo.ult_nomina)))

func en_ui(p: Vector2) -> bool:
	if tarjeta_act != null:
		return true    # la tarjeta es modal: hasta pulsar «Vale» no se anda
	return abierta and hoja["raiz"].get_global_rect().has_point(p)

# =============== guardado ===============
func _guardar() -> Dictionary:
	return {"movs": movs.slice(maxi(0, movs.size() - 150)), "deudas": deudas, "ult_min": ult_min, "casero": casero_avisos, "desahucio": desahucio_pendiente}

func _aplicar(d: Dictionary) -> void:
	silencio = true
	_despertar.call_deferred()
	if d.get("movs", null) is Array:
		movs = []
		for x in d["movs"]:
			if x is Dictionary and x.has("c") and x.has("i"):
				movs.append({"d": int(x.get("d", 0)), "m": int(x.get("m", 0)), "c": str(x["c"]), "i": float(x["i"])})
	if d.get("deudas", null) is Array:
		deudas = []
		for x in d["deudas"]:
			if x is Dictionary and x.has("c") and x.has("i"):
				deudas.append({"c": str(x["c"]), "i": float(x["i"]), "d": int(x.get("d", 0)), "alq": bool(x.get("alq", false))})
	casero_avisos = int(d.get("casero", casero_avisos))
	desahucio_pendiente = bool(d.get("desahucio", desahucio_pendiente))
	ult_min = -1.0     # se vuelve a enganchar al reloj cargado en el siguiente tick

# =============== órdenes de prueba (casita_cmd) ===============
func cmd(c: String, a: Array) -> bool:
	match c:
		"cuenta":
			var t := []
			for x in movs.slice(maxi(0, movs.size() - 12)):
				t.append("%d:%s:%s" % [int(x["d"]), x["c"], str(x["i"])])
			print("cuenta: saldo=%s deuda=%s deudas=%d casero=%d desahucio=%s alquiler=%s movs=%s" % [str(jg.dinero), str(deuda_total()), deudas.size(), casero_avisos, str(desahucio_pendiente), str(alquiler), str(t)])
		"pagos":
			var t2 := []
			for p in proximos_pagos():
				t2.append("%d:%s:%s" % [int(p["d"]), p["c"], str(p["i"])])
			print("pagos: %s" % str(t2))
		"panel_dinero":
			abrir(true)
			print("panel_dinero: %s" % str(abierta))
		"tarjeta":
			print("tarjeta: %s cola=%d" % [("si:" + str((tarjeta_act.get_child(0).get_child(0) as Label).text)) if tarjeta_act != null else "no", cola_tarjetas.size()])
		"vale":
			_cerrar_tarjeta()
			print("vale: ok")
		"pagar_prueba":
			print("pagar_prueba: %s" % str(pagar(str(a[1]), float(a[2]))))
		_:
			return false
	return true
