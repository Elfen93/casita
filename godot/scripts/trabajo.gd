class_name Trabajo
extends RefCounted
# Bloque TRABAJO Y DINERO (1/2): tener un trabajo, ir a la jornada, faltas y retrasos, nómina, despido, paro y ofertas.
# Datos: data/trabajo.json (puestos del barrio, jornada, faltas, nómina, paro), data/profesiones.json (sueldos y escalas),
# data/gobiernos.json (impuestos, en fiscal.gd), data/estudios.json (requisitos de estudios).
# En main.gd solo hay ganchos «# --- trabajo ---». La cuenta (alquiler, facturas, movimientos) vive en cuenta.gd.
#
# API para otros bloques (p. ej. la pantalla de partida nueva):
#   jg.trabajo.ofertas() -> Array[Dictionary]   {id, titulo, e, empresa, lugar_n, barrio_n, fuera, viaje, horario, bruto_mes,
#                                                neto_mes, contrato, d, motivo}  (motivo == "" si se puede optar)
#   jg.trabajo.aceptar(id, empieza := -1) -> bool  entra a trabajar sin entrevista (empieza: día absoluto; -1 = hoy)
#   jg.trabajo.puesto_id, jg.trabajo.estudios (id de data/estudios.json -> niveles), jg.trabajo.en_barra()
#
# La jornada: a la hora de salir (inicio - viaje - 25 min) la persona sale andando sola si no está haciendo nada; si no, una
# ficha se lo recuerda. Al llegar a la puerta (o a la boca de metro si el trabajo es en otro barrio) entra y la jornada pasa
# con un salto con velo (como dormir); al acabar, una tarjeta con lo que ha pasado. En el bar no hay salto: se trabaja de
# verdad (bar.gd: atender a la clientela) y la tarjeta sale al acabar el turno.

var jg
var T: Dictionary          # data/trabajo.json
var J: Dictionary          # T.jornada
var SECT: Dictionary       # profesiones.sectores
var PROB: Dictionary       # profesiones.prob_contrato
var HAB_N := {}            # id de habilidad -> nombre
var EDU: Dictionary        # estudios.json
var vec := {}              # vecinos del censo por id (nombres de jefas y compañeras)
var DIAS_MES := 28

# ---- estado (se guarda en la sección «trabajo») ----
var puesto_id := ""
var nivel := 0
var desde := 0             # día de alta
var jornadas := 0
var incid: Array = []      # [{d, k: "retraso"|"grave"|"falta", min}]
var avisos := 0            # 0 nada · 1 aviso verbal · 2 por escrito
var desc_min := 0.0        # minutos de retraso o fuera del puesto a descontar en la próxima nómina
var desc_dias := 0         # faltas a descontar
var pagado_mes := -1       # último mes con nómina pagada
var hoy := {}              # {d, fichada, llegada, tarde, hecha, avisada, fuera}
var parada := {}           # {desde, causa, inscrita, tipo, resto, cobrados, c1, c2, ult_cobro}
var cotizados := 540       # días cotizados que cuentan para el paro
var brutos: Array = []     # brutos de las últimas nóminas (base reguladora)
var entrevistas := {}      # puesto -> día del último «no»
var estudios := "eso"
var ult_nomina := {}

# ---- de la sesión ----
var yendo := {}            # {tipo: trabajo|entrevista|sepe, puesto}
var ult_min := -1.0
var forzado := false       # puente de pruebas «trabaja»: de turno en el bar a cualquier hora
var forzar_entrevista := -1
var bar_n := 0
var bar_caja := 0.0
var bar_prop := 0.0
var _tasas_antes := {}
var _nec_antes := {}
var _velo_antes := false
var _sancion_pend := false
# ---- interfaz ----
var hoja: Dictionary = {}
var abierta := false
var confirmar_dejar := false
var b_menu_t: Button
var b_menu_d: Button
var metro_pos := Vector2.ZERO

var _modelo := ""          # solo en la consulta de la pantalla de partida nueva (ofertas_inicio): el personaje elegido

func _init(m, modelo_inicio := "") -> void:
	jg = m
	_modelo = modelo_inicio
	T = Datos.cargar("trabajo")
	J = T.get("jornada", {})
	DIAS_MES = int(T.get("calendario", {}).get("dias_mes", 28))
	var PR := Datos.cargar("profesiones")
	SECT = PR.get("sectores", {})
	PROB = PR.get("prob_contrato", {})
	for h in PR.get("habilidades", []):
		HAB_N[str(h[0])] = str(h[2])
	EDU = Datos.cargar("estudios")
	Fiscal.cargar(Datos.cargar("gobiernos"))
	for v in jg.personas.get("vecinos", []):
		vec[str(v["id"])] = v
	cotizados = int(T.get("paro", {}).get("cotizado_inicial", 540))
	estudios = str(T.get("estudios_inicial", "eso"))
	if _modelo != "":
		return      # consulta sin mundo (pantalla de partida nueva): ni puesto, ni metro, ni guardado
	var ed := edad()
	if ed >= int(T.get("edad_min", 16)) and ed < 67:
		aceptar(str(T.get("puesto_inicial", "")), 0)
	_metro()
	jg.guardado.registrar("trabajo", 2, _guardar, _aplicar)

# =============== quién y qué ===============
func fem() -> bool:
	return str(Figura.jugable(_modelo if _modelo != "" else jg.modelo_pj).get("genero", "f")) == "f"

func edad() -> int:
	return int(Figura.jugable(_modelo if _modelo != "" else jg.modelo_pj).get("edad", 27))

# =============== partida nueva (lo usa inicio.gd, antes de que exista el mundo) ===============
## lo que se puede elegir en la situación de partida: el puesto inicial (camarera en el Bar Manolo) y hasta `n` ofertas de
## esta semana a las que se puede optar. [{id, n, e, d}] (n: puesto · empresa; d: horario y sueldo neto)
static func ofertas_inicio(main, modelo: String, n := 3) -> Array:
	var t := Trabajo.new(main, modelo)
	var ids: Array = []
	var ini := str(t.T.get("puesto_inicial", ""))
	if t.edad() < int(t.T.get("edad_min", 16)) or t.edad() >= 67:
		return []
	if not t.puesto(ini).is_empty():
		ids.append(ini)
	for o in t.ofertas():
		if ids.size() > n:
			break
		if o["motivo"] == "" and not ids.has(o["id"]):
			ids.append(o["id"])
	var r: Array = []
	for id in ids:
		var P := t.puesto(id)
		r.append({"id": id, "e": str(P.get("e", "")), "n": "%s · %s" % [t.titulo(id), str(P.get("empresa", ""))],
			"d": "%s, %s-%s · %s netos al mes" % [t.dias_txt(P["dias"]), main._hhmm(float(P["h"][0])), main._hhmm(fposmod(float(P["h"][1]), 24.0)), Inicio.eur(t.neto_mes(id))]})
	return r

## lo elegido en la situación de partida, con el mundo montado: id de puesto o "" (sin trabajo, a buscar)
func elegir_inicial(id: String) -> void:
	if id == puesto_id:
		return
	if id != "" and aceptar(id, dia()):
		return
	puesto_id = ""
	nivel = 0
	hoy = {}
	parada = {"desde": dia(), "causa": "baja", "inscrita": false}   # dejó el trabajo de antes para mudarse: sin paro

func con_trabajo() -> bool:
	return puesto_id != ""

## avisa a Objetivos (hecho «trabajo» {que, …}) y lo cuenta en la historia del día
func _avisar(que: String, texto: String, icono := "", datos := {}) -> void:
	var d := {"que": que}
	d.merge(datos)
	Objetivos.hecho("trabajo", d)
	if texto != "":
		Historia.contar(texto, icono)

func puesto(id := "") -> Dictionary:
	return T.get("puestos", {}).get(id if id != "" else puesto_id, {})

func titulo(id := "", niv := -1) -> String:
	var P := puesto(id)
	if P.is_empty():
		return ""
	var nv := niv if niv >= 0 else (nivel if (id == "" or id == puesto_id) else int(P.get("nivel", 0)))
	if nv != int(P.get("nivel", 0)):
		var L: Array = SECT.get(str(P["sector"]), {}).get("levels", [])
		if nv < L.size():
			return str(L[nv]["t"])
	return str(P["t"][0 if fem() else 1])

func _nombre_vec(id: String) -> String:
	if not vec.has(id):
		return ""
	return str(vec[id]["n"]).split(" ")[0]

func jefa(id := "") -> String:
	var P := puesto(id)
	var n := _nombre_vec(str(P.get("jefa", "")))
	if n != "":
		return n
	var g: Array = T.get("jefa_generica", ["la encargada", "el encargado"])
	return str(g[0])

func compi(id := "") -> String:
	var P := puesto(id)
	var L: Array = []
	for c in P.get("compis", []):
		var n := _nombre_vec(str(c))
		if n != "":
			L.append(n)
	return str(L[randi() % L.size()]) if not L.is_empty() else str(T.get("compi_generico", "una compañera"))

func es_fuera(id := "") -> bool:
	return bool(puesto(id).get("fuera", false))

func trabaja_fuera() -> bool:
	return puesto_id != "" and es_fuera()

func viaje(id := "") -> float:
	return float(puesto(id).get("viaje", 0)) if es_fuera(id) else 0.0

func es_bar(id := "") -> bool:
	return str(puesto(id).get("lugar", "")) == "bar" and jg.bar != null

func lugar_n(id := "") -> String:
	var l := str(puesto(id).get("lugar", ""))
	if jg.edificios.has(l):
		return str(jg.edificios[l]["n"])
	return str(jg.lugares.get("lugares", {}).get(l, {}).get("n", l))

func barrio_n(id := "") -> String:
	var l := str(puesto(id).get("lugar", ""))
	var b := str(jg.lugares.get("lugares", {}).get(l, {}).get("barrio", jg.BARRIO))
	return str(jg.ciudad.get("barrios", {}).get(b, {}).get("n", b))

static func _mayus(s: String) -> String:
	return s.substr(0, 1).to_upper() + s.substr(1) if s != "" else s

func _txt(t: String, extra := {}) -> String:
	var v := {"jefa": jefa(), "compi": compi(), "puesto": titulo(), "lugar": lugar_n(), "empresa": str(puesto().get("empresa", ""))}
	v.merge(extra, true)
	return _mayus(PanelUI.huecos(t, v))

# =============== sueldo ===============
func _mult_estudios(sector: String) -> float:
	var t: Dictionary = EDU.get("sueldo", {}).get(sector, {})
	var m := 1.0
	for lv in t:
		if tiene_estudios(str(lv)):
			m = maxf(m, float(t[lv]))
	return m

## neto por jornada (lo del juego web: profesiones.json -> levels[].pay, con los impuestos de referencia), ajustado a las horas
func neto_jornada(id := "", niv := -1) -> float:
	var P := puesto(id)
	if P.is_empty():
		return 0.0
	var nv := niv if niv >= 0 else (nivel if (id == "" or id == puesto_id) else int(P.get("nivel", 0)))
	var L: Array = SECT.get(str(P["sector"]), {}).get("levels", [])
	var pay := float(P["pay"]) if (P.has("pay") and nv == int(P.get("nivel", 0))) else float(L[mini(nv, L.size() - 1)]["pay"])
	var horas := float(P["h"][1]) - float(P["h"][0])
	return pay * clampf(horas / 8.0, 0.25, 1.0) * _mult_estudios(str(P["sector"]))

## bruto mensual del contrato (12 pagas, prorrateadas): el bruto anual que deja ese neto con los impuestos de 2026
func bruto_mes(id := "", niv := -1) -> float:
	var P := puesto(id)
	if P.is_empty():
		return 0.0
	var neto_anual := neto_jornada(id, niv) * float(P["dias"].size()) * 49.0
	return roundf(Fiscal.bruto_de_neto(neto_anual) / 12.0)

func neto_mes(id := "", niv := -1) -> float:
	var b := bruto_mes(id, niv)
	return float(Fiscal.nomina(b, b)["neto"])

# =============== calendario y turnos ===============
func dia() -> int:
	return int(jg.minutos / 1440.0)

## turno del día absoluto d: {ini, fin} en minutos absolutos, o {} si ese día no se trabaja
func turno(d: int) -> Dictionary:
	if puesto_id == "" or d < desde:
		return {}
	var P := puesto()
	if not jg._tiene(P["dias"], d % 7):
		return {}
	return {"ini": d * 1440.0 + float(P["h"][0]) * 60.0, "fin": d * 1440.0 + float(P["h"][1]) * 60.0}

func _hoy(d: int) -> Dictionary:
	if int(hoy.get("d", -1)) != d:
		hoy = {"d": d, "fichada": false, "llegada": -1.0, "tarde": 0.0, "hecha": false, "avisada": false, "fuera": 0.0}
	return hoy

func en_turno(m := -1.0) -> bool:
	var mm: float = jg.minutos if m < 0.0 else m
	var t := turno(int(mm / 1440.0))
	return not t.is_empty() and mm >= float(t["ini"]) and mm < float(t["fin"])

func _en_bar() -> bool:
	return jg.bar != null and jg.interior != null and jg.interior == jg.bar.it

## ¿está de turno detrás de la barra? (lo leen acciones.gd y bar.gd por main.trabaja_bar)
func en_barra() -> bool:
	if forzado:
		return true
	if not es_bar() or not en_turno():
		return false
	var h := _hoy(dia())
	return bool(h["fichada"]) and not bool(h["hecha"]) and _en_bar()

## ¿se puede entrar a trabajar si se llega a esa hora?
func _puede_entrar(llegada: float) -> bool:
	var d := int(llegada / 1440.0)
	var t := turno(d)
	if t.is_empty():
		return false
	var h := _hoy(d)
	if bool(h["fichada"]) or bool(h["hecha"]):
		return false
	return llegada >= float(t["ini"]) - float(J.get("entrar_desde_min", 90)) and llegada <= float(t["fin"]) - float(J.get("entrar_hasta_min", 30))

# =============== el reloj ===============
func tick() -> void:
	var m: float = jg.minutos
	var velo: bool = jg.velo.visible
	if ult_min < 0.0 or m < ult_min or m - ult_min > 600.0:
		ult_min = m        # salto de reloj (carga, pruebas): no cuenta lo saltado
		_velo_antes = velo
		return
	var dm := m - ult_min
	var d0 := int(ult_min / 1440.0)
	var d1 := int(m / 1440.0)
	for d in range(d0 + 1, d1 + 1):
		if puesto_id != "" and d >= desde:
			cotizados += 1           # cotiza cada día natural de alta
	var hp := float(T.get("calendario", {}).get("hora_pagos", 9)) * 60.0
	for d in range(d0, d1 + 1):
		var tp := d * 1440.0 + hp
		if ult_min < tp and tp <= m:
			_pagos_del_dia(d)
		var t := turno(d)
		if t.is_empty():
			continue
		var salir := float(t["ini"]) - viaje() - float(J.get("salir_antes_min", 25))
		if ult_min < salir and salir <= m:
			_hora_de_salir(d)
		if ult_min < float(t["fin"]) and float(t["fin"]) <= m:
			_fin_turno(d)
		if es_bar() and ult_min < float(t["fin"]) - 15.0 and float(t["fin"]) - 15.0 <= m and bool(_hoy(d)["fichada"]):
			jg._aviso(str(J.get("bar_fin_aviso", "")))
	# en el bar: fichar al estar dentro y contar lo que se está fuera
	if es_bar() and puesto_id != "":
		var hd := _hoy(d1)
		var t2 := turno(d1)
		if not t2.is_empty() and _en_bar() and not bool(hd["fichada"]) and not bool(hd["hecha"]) and _puede_entrar(m):
			_fichar(d1, maxf(m, 0.0), true)
		elif bool(hd["fichada"]) and not bool(hd["hecha"]) and en_turno(m) and not _en_bar() and not velo:
			hd["fuera"] = float(hd["fuera"]) + dm
	# al despertar (o acabar cualquier salto) en mitad del turno sin haber ido: recordatorio
	if _velo_antes and not velo and puesto_id != "":
		var t3 := turno(d1)
		if not t3.is_empty() and _puede_entrar(m) and m >= float(t3["ini"]) - 60.0 and str(yendo.get("tipo", "")) == "":
			_recordatorio(true)
	_velo_antes = velo
	ult_min = m

func _idle() -> bool:
	return jg.cola.total() == 0 and jg.jugador.ruta.is_empty() and not jg.velo.visible and not jg.muebles.activo \
		and not jg.panel_ficha.visible and str(jg.jugador.postura) == "de_pie" and not abierta and not jg.cuenta.abierta

func _hora_de_salir(d: int) -> void:
	var h := _hoy(d)
	if bool(h["fichada"]) or bool(h["hecha"]):
		return
	if es_bar() and _en_bar():
		return
	if _idle():
		jg._aviso(_txt(str(J.get("salir_aviso", "")), {"ini": jg._hhmm(float(puesto()["h"][0]))}))
		ir_al_trabajo()
	else:
		_recordatorio(false)

func _recordatorio(tarde: bool) -> void:
	var ini: String = jg._hhmm(float(puesto()["h"][0]))
	var tx := _txt(str(J.get("tarde_texto" if tarde else "salir_texto", "")), {"ini": ini})
	jg._ficha("📋 " + str(J.get("salir_titulo", "")), tx, [[str(J.get("ir", "Ir a trabajar")), ir_al_trabajo]])

func ir_al_trabajo() -> void:
	if puesto_id == "":
		return
	abrir(false)
	jg.cuenta.abrir(false)
	yendo = {"tipo": "trabajo"}
	jg._ir_a_edificio("metro" if es_fuera() else str(puesto()["lugar"]))

## gancho de main._llegar: true si este bloque se encarga de la llegada
func al_llegar(id: String) -> bool:
	var tipo := str(yendo.get("tipo", ""))
	var m: float = jg.minutos
	if id == "metro":
		var y := yendo
		yendo = {}
		match tipo:
			"trabajo":
				if trabaja_fuera() and _puede_entrar(m + viaje()):
					_empezar_jornada(m)
				else:
					jg._aviso("Ahora no te toca trabajar.")
			"entrevista":
				_hacer_entrevista(str(y.get("puesto", "")))
			"sepe":
				_hacer_sepe()
			_:
				jg._ficha("🏛 " + str(J.get("metro_boca", "Metro")), PanelUI.huecos(str(J.get("metro_d", "")), {"b": jg._eur(float(T.get("dinero", {}).get("billete", 1.5)))}), [])
		return true
	if puesto_id != "" and not es_fuera() and id == str(puesto()["lugar"]) and _puede_entrar(m):
		yendo = {}
		if es_bar():
			# detrás de la barra, junto al grifo (el sitio del camarero es de quien esté de turno con ella)
			var it: Interior = jg.bar.it
			var q := Vector2(it.puerta.x - 4.0, it.puerta.y - 7.9)
			if jg.nav.solido(q):
				q = jg.nav.centro(jg.nav.libre_cerca(q))
			jg._ir_a_punto(q)
		else:
			_empezar_jornada(m)
		return true
	if tipo == "entrevista" and not es_fuera(str(yendo.get("puesto", ""))) and id == str(puesto(str(yendo.get("puesto", ""))).get("lugar", "")):
		var pid := str(yendo["puesto"])
		yendo = {}
		_hacer_entrevista(pid)
		return true
	return false

# =============== la jornada ===============
func _fichar(d: int, llegada: float, inmediato: bool) -> void:
	var h := _hoy(d)
	var t := turno(d)
	h["fichada"] = true
	h["llegada"] = llegada
	var tarde := maxf(0.0, llegada - float(t["ini"]))
	h["tarde"] = tarde
	if es_bar():
		bar_n = 0
		bar_caja = 0.0
		bar_prop = 0.0
	if tarde > float(J.get("retraso_min", 5)):
		var grave := tarde > float(J.get("retraso_grave_min", 60))
		incid.append({"d": d, "k": "grave" if grave else "retraso", "min": int(tarde)})
		desc_min += tarde
		if inmediato:
			jg._aviso("Llegas %d minutos tarde." % int(tarde))
			_sancion()
		else:
			_sancion_pend = true

func _sucesos(P: Dictionary) -> Array:
	var S: Dictionary = J.get("sucesos", {})
	var r: Array = []
	var del_grupo: Array = S.get(str(P.get("grupo", "")), [])
	var comunes: Array = S.get("comun", [])
	if not del_grupo.is_empty() and randf() < 0.75:
		r.append(del_grupo[randi() % del_grupo.size()])
	if (r.is_empty() or randf() < 0.45) and not comunes.is_empty():
		r.append(comunes[randi() % comunes.size()])
	return r

func _empezar_jornada(m: float) -> void:
	var d := int((m + viaje()) / 1440.0)
	var t := turno(d)
	var llegada := m + viaje()
	_fichar(d, llegada, false)
	var P := puesto()
	var suc := _sucesos(P)
	var extra := 0.0
	for s in suc:
		extra += float(s.get("extra_min", 0))
	var dur := maxf(float(t["fin"]), llegada) - m + extra + viaje()
	jg.cola.vaciar()
	jg.dentro = true
	jg.jugador.nodo.visible = false
	_tasas_antes = jg.nec_tasa.duplicate()
	var tz: Dictionary = J.get("tasas", {}).get(str(P.get("grupo", "")), {})
	for k in tz:
		jg.nec_tasa[k] = float(tz[k])
	jg.nec_tasa["vejiga"] = 0.0          # en el curro también hay baño
	_nec_antes = jg.nec.duplicate()
	var txt := "%s · %s…" % [str(J.get("velo_viaje" if es_fuera() else "velo", "Trabajando")), titulo()]
	jg._cerrar_ficha_y_saltar(dur, txt, func(): _fin_jornada(d, suc))

func _efectos_txt() -> String:
	var nom := {"energia": "⚡ Energía", "diversion": "🎉 Diversión", "social": "💬 Social", "hambre": "🍔 Hambre", "higiene": "🧼 Higiene"}
	var r: Array = []
	for k in nom:
		var dlt := roundi(float(jg.nec[k]) - float(_nec_antes.get(k, jg.nec[k])))
		if absi(dlt) >= 3:
			r.append("%s %s%d" % [nom[k], "+" if dlt > 0 else "−", absi(dlt)])
	return " · ".join(r)

func _fin_jornada(d: int, suc: Array) -> void:
	for k in _tasas_antes:
		jg.nec_tasa[k] = _tasas_antes[k]
	jg.nec["vejiga"] = maxf(float(jg.nec["vejiga"]), float(J.get("vejiga_fin", 70)))
	var h := _hoy(d)
	h["hecha"] = true
	jornadas += 1
	var partes: Array = []
	var P := puesto()
	partes.append(_txt(str(J.get("horas", "")), {"ini": jg._hhmm(float(P["h"][0])), "fin": jg._hhmm(float(P["h"][1]))}))
	_partes_tarde(partes, h)
	for s in suc:
		for k in s.get("ef", {}):
			jg.nec[k] = clampf(float(jg.nec[k]) + float(s["ef"][k]), 0.0, 100.0)
		partes.append(_txt(str(s["t"])))
	partes.append("-")
	var ef := _efectos_txt()
	if ef != "":
		partes.append(ef)
	partes.append(_pie())
	jg.cuenta.tarjeta("%s %s" % [str(P.get("e", "")), _txt(str(J.get("titulo", "")))], partes)
	_avisar("jornada", "Jornada de %s en %s%s." % [titulo().to_lower(), lugar_n(), ", con retraso" if float(h.get("tarde", 0.0)) > float(J.get("retraso_min", 5)) else ""], str(P.get("e", "")))
	if _sancion_pend:
		_sancion_pend = false
		_sancion()
	_ascenso()

func _partes_tarde(partes: Array, h: Dictionary) -> void:
	var tarde := float(h.get("tarde", 0.0))
	if tarde > float(J.get("retraso_min", 5)):
		var k := "tarde_grave" if tarde > float(J.get("retraso_grave_min", 60)) else "tarde"
		partes.append(_txt(str(J.get(k, "")), {"min": int(tarde)}))

func _pie() -> String:
	return _txt(str(J.get("pie", "")), {"n": jornadas, "dia": int(T.get("nomina", {}).get("dia", 26))})

## fin de turno: falta si no se ha ido; en el bar, la tarjeta de la jornada
func _fin_turno(d: int) -> void:
	var h := _hoy(d)
	if bool(h["hecha"]):
		return
	if not bool(h["fichada"]):
		h["hecha"] = true
		incid.append({"d": d, "k": "falta", "min": 0})
		desc_dias += 1
		var F: Dictionary = T.get("faltas", {})
		jg.cuenta.tarjeta("📋 " + str(J.get("falta_titulo", "")), [_txt(str(J.get("falta", ""))), PanelUI.huecos(str(F.get("descuento", "")), {"v": jg._eur(_desc_dia())})])
		_avisar("falta", "Faltaste al trabajo. Te lo descuentan de la nómina.", "📋")
		_sancion()
		return
	if not es_bar():
		return    # la tarjeta sale al acabar el salto (_fin_jornada)
	h["hecha"] = true
	jornadas += 1
	var P := puesto()
	var partes: Array = [_txt(str(J.get("horas", "")), {"ini": jg._hhmm(float(P["h"][0])), "fin": jg._hhmm(float(P["h"][1]))})]
	_partes_tarde(partes, h)
	if bar_n > 0:
		var prop := PanelUI.huecos(str(J.get("bar_prop_si", "")), {"v": jg._eur(bar_prop)}) if bar_prop > 0.0 else str(J.get("bar_prop_no", ""))
		partes.append(_txt(str(J.get("bar_servidos", "")), {"n": ("1 consumición" if bar_n == 1 else "%d consumiciones" % bar_n), "caja": jg._eur(bar_caja), "prop": prop}))
	else:
		partes.append(_txt(str(J.get("bar_nada", ""))))
		incid.append({"d": d, "k": "retraso", "min": 0})
	var fuera := float(h.get("fuera", 0.0))
	if fuera >= 10.0:
		partes.append(_txt(str(J.get("bar_fuera", "")), {"min": int(fuera)}))
		desc_min += fuera
		if fuera >= float(J.get("retraso_grave_min", 60)):
			incid.append({"d": d, "k": "grave", "min": int(fuera)})
	var suc := _sucesos(P)
	for s in suc:
		if float(s.get("extra_min", 0)) > 0.0:
			continue      # en el bar la media hora de más se ve: no se cuenta en la tarjeta
		for k in s.get("ef", {}):
			jg.nec[k] = clampf(float(jg.nec[k]) + float(s["ef"][k]), 0.0, 100.0)
		partes.append(_txt(str(s["t"])))
	partes.append("-")
	partes.append(_pie())
	jg.cuenta.tarjeta("%s %s" % [str(P.get("e", "")), _txt(str(J.get("titulo", "")))], partes)
	_avisar("jornada", ("Turno en el bar: %d %s y %s de propina." % [bar_n, "consumición" if bar_n == 1 else "consumiciones", jg._eur(bar_prop)]) if bar_n > 0 else "Turno en el bar sin servir a nadie.", str(P.get("e", "")))
	_sancion()
	_ascenso()

## lo que hace el bar cuando la jugadora sirve (gancho en cola.gd): el precio va a la caja, la propina a ella
func servido(precio: float, prop: float) -> void:
	bar_n += 1
	bar_caja += precio
	bar_prop += prop

# =============== faltas y sanciones ===============
func puntos() -> float:
	var F: Dictionary = T.get("faltas", {})
	var desde_d := dia() - int(F.get("ventana_dias", 28))
	var p := 0.0
	var r := 0
	for x in incid:
		if int(x["d"]) <= desde_d:
			continue
		if x["k"] == "retraso":
			r += 1
		else:
			p += 1.0
	return p + float(r / int(F.get("retrasos_por_punto", 3)))

func _sancion() -> void:
	if puesto_id == "":
		return
	var F: Dictionary = T.get("faltas", {})
	var p := puntos()
	if p >= float(F.get("despido_puntos", 3)):
		jg.cuenta.tarjeta("📋 " + str(F.get("despido_titulo", "")), [_txt(str(F.get("despido", "")))])
		_avisar("despido", "Te despidieron de %s." % str(puesto().get("empresa", "")), "📋")
		_despedir("despido")
	elif p >= 2.0 and avisos < 2:
		avisos = 2
		jg.cuenta.tarjeta("📋 " + _txt(str(F.get("escrito_titulo", ""))), [_txt(str(F.get("escrito", "")))])
		_avisar("aviso", "Amonestación por escrito en el trabajo.", "📋")
	elif p >= 1.0 and avisos < 1:
		avisos = 1
		jg.cuenta.tarjeta("📋 " + _txt(str(F.get("aviso_titulo", ""))), [_txt(str(F.get("aviso", "")))])
		_avisar("aviso", "Te llamaron la atención en el trabajo.", "📋")

func _desc_dia() -> float:
	return bruto_mes() / (float(puesto()["dias"].size()) * 52.0 / 12.0)

func _descuentos() -> float:
	var P := puesto()
	var horas := float(P["h"][1]) - float(P["h"][0])
	var por_min := bruto_mes() / (horas * float(P["dias"].size()) * 52.0 / 12.0) / 60.0
	return snappedf(float(desc_dias) * _desc_dia() + desc_min * por_min, 0.01)

# =============== nómina, finiquito y despido ===============
func _pagos_del_dia(d: int) -> void:
	var dm := d % DIAS_MES + 1
	if puesto_id != "" and dm == int(T.get("nomina", {}).get("dia", 26)):
		_nomina(d)
	if bool(parada.get("inscrita", false)) and dm == int(T.get("paro", {}).get("dia_pago", 10)):
		_pagar_paro(d)

func _nomina(d: int, finiquito := false) -> Dictionary:
	var ms := d / DIAS_MES
	if pagado_mes == ms:
		return {}
	var ini_mes := ms * DIAS_MES
	var alta := maxi(desde, ini_mes)
	var dias_alta := (d - alta + 1) if finiquito else (ini_mes + DIAS_MES - alta)
	if dias_alta <= 0:
		return {}
	var base := bruto_mes()
	var bruto_pr := base * float(dias_alta) / float(DIAS_MES)
	var desc := minf(_descuentos(), bruto_pr)
	var n := Fiscal.nomina(base, bruto_pr - desc)
	n.merge({"mes": ms + 1, "base": base, "dias": dias_alta, "pr": snappedf(bruto_pr, 0.01), "desc": desc, "puesto": titulo(), "empresa": str(puesto().get("empresa", "")), "fin": finiquito,
		"valor": snappedf(float(n["coste"]) * float(T.get("nomina", {}).get("valor_por_coste", 2.4)), 1.0)})
	jg.cuenta.ingresar("Finiquito" if finiquito else "Nómina", float(n["neto"]))
	brutos.append(float(n["bruto"]) * float(DIAS_MES) / float(dias_alta))
	if brutos.size() > 6:
		brutos = brutos.slice(brutos.size() - 6)
	desc_min = 0.0
	desc_dias = 0
	pagado_mes = ms
	ult_nomina = n
	tarjeta_nomina(n)
	_avisar("nomina", "Cobraste %s: %s." % ["el finiquito" if finiquito else "la nómina", jg._eur(float(n["neto"]))], "💶", {"neto": float(n["neto"])})
	return n

static func _pct(x: float) -> String:
	return ("%.1f %%" % (x * 100.0)).replace(".", ",")

func tarjeta_nomina(n: Dictionary) -> void:
	var N: Dictionary = T.get("nomina", {})
	var V := PanelUI.VERDE_OSC
	var R := PanelUI.ROJO_OSC
	var partes: Array = [PanelUI.huecos(str(N.get("empresa", "")), {"empresa": n["empresa"], "puesto": n["puesto"]})]
	partes.append([str(N.get("base", "")), jg._eur(float(n["base"]))])
	if int(n["dias"]) < DIAS_MES:
		partes.append([PanelUI.huecos(str(N.get("prorrata", "")), {"d": n["dias"], "t": DIAS_MES}), jg._eur(float(n["pr"]))])
	if float(n["desc"]) > 0.0:
		partes.append([str(N.get("descuentos", "")), "−" + jg._eur(float(n["desc"])), R])
	partes.append("-")
	partes.append([str(N.get("bruto", "")), jg._eur(float(n["bruto"]))])
	partes.append([PanelUI.huecos(str(N.get("ss", "")), {"p": _pct(float(n["ssr"]))}), "−" + jg._eur(float(n["ss"])), R])
	partes.append([PanelUI.huecos(str(N.get("irpf", "")), {"p": _pct(float(n["ret"]))}), ("−" + jg._eur(float(n["irpf"]))) if float(n["irpf"]) > 0.0 else jg._eur(0.0), R if float(n["irpf"]) > 0.0 else PanelUI.TINTA])
	partes.append("-")
	partes.append([str(N.get("neto", "")), jg._eur(float(n["neto"])), V, 18])
	partes.append(PanelUI.huecos(str(N.get("empresa_ss", "")), {"v": jg._eur(float(n["emp"])), "c": jg._eur(float(n["coste"]))}))
	partes.append(PanelUI.huecos(str(N.get("valor", "")), {"v": jg._eur(float(n["valor"]))}))
	if bool(n.get("fin", false)):
		partes.append(str(N.get("finiquito", "")))
	if n.has("ascenso"):
		partes.append(str(n["ascenso"]))
	var tit := str(N.get("finiquito_titulo", "Finiquito")) if bool(n.get("fin", false)) else PanelUI.huecos(str(N.get("titulo", "")), {"mes": n["mes"]})
	jg.cuenta.tarjeta("📑 " + tit, partes)

func _ascenso() -> void:
	var P := puesto()
	if P.is_empty() or not bool(P.get("asciende", true)):
		return
	var L: Array = SECT.get(str(P["sector"]), {}).get("levels", [])
	if nivel + 1 >= L.size():
		return
	var req: Dictionary = L[nivel + 1].get("req", {})
	for k in req:
		if k == "shifts":
			if jornadas < int(req[k]):
				return
		elif float(jg.hab.get(k, 0.0)) < float(req[k]):
			return
	nivel += 1
	jg.cuenta.tarjeta("🎉 " + titulo(), [PanelUI.huecos(str(T.get("nomina", {}).get("ascenso", "")), {"puesto": titulo().to_lower()}),
		"Bruto al mes: %s · neto: unos %s." % [jg._eur(bruto_mes()), jg._eur(neto_mes())]])

## se acaba el trabajo: «despido» (da paro) o «baja» (voluntaria: no da paro)
func _despedir(causa: String) -> void:
	if puesto_id == "":
		return
	_nomina(dia(), true)
	puesto_id = ""
	nivel = 0
	incid = []
	avisos = 0
	desc_min = 0.0
	desc_dias = 0
	hoy = {}
	forzado = false
	parada = {"desde": dia(), "causa": causa, "inscrita": false}

func dejar() -> void:
	confirmar_dejar = false
	_avisar("baja", "Dejaste el trabajo en %s." % str(puesto().get("empresa", "")), "🚪")
	_despedir("baja")
	_rellenar()

## entrar a trabajar en un puesto (sin entrevista). empieza: día absoluto (-1 = hoy)
func aceptar(id: String, empieza := -1) -> bool:
	if puesto(id).is_empty() or edad() < int(T.get("edad_min", 16)):
		return false
	if puesto_id != "" and puesto_id != id and jornadas > 0:
		_nomina(dia(), true)
	puesto_id = id
	nivel = int(puesto(id).get("nivel", 0))
	desde = empieza if empieza >= 0 else dia()
	jornadas = 0
	incid = []
	avisos = 0
	desc_min = 0.0
	desc_dias = 0
	hoy = {}
	parada = {}
	pagado_mes = -1
	return true

# =============== ofertas y entrevista ===============
func tiene_estudios(lv: String) -> bool:
	var N: Dictionary = EDU.get("niveles", {})
	if lv == estudios:
		return true
	if not N.has(lv) or not N.has(estudios):
		return false
	if lv == "fpm":
		return estudios in ["fps", "grado", "master"]
	if lv == "fps":
		return false
	return int(N[estudios]["o"]) > int(N[lv]["o"])

func _req_estudios(id: String) -> Array:
	var P := puesto(id)
	if P.has("estudios"):
		return P["estudios"]
	return EDU.get("requisitos", {}).get(str(P["sector"]), [])

## por qué no se puede optar ("" si se puede)
func motivo(id: String) -> String:
	var P := puesto(id)
	if edad() < int(T.get("edad_min", 16)):
		return "Hay que tener %d años." % int(T.get("edad_min", 16))
	var req := _req_estudios(id)
	if not req.is_empty():
		var ok := false
		for r in req:
			if tiene_estudios(str(r)):
				ok = true
		if not ok:
			var ns: Array = []
			for r in req:
				ns.append(str(EDU.get("niveles", {}).get(r, {}).get("n", r)))
			return "Piden %s." % " o ".join(ns)
	var L: Array = SECT.get(str(P["sector"]), {}).get("levels", [])
	var lv: Dictionary = L[mini(int(P.get("nivel", 0)), L.size() - 1)]
	for k in lv.get("req", {}):
		if k != "shifts" and float(jg.hab.get(k, 0.0)) < float(lv["req"][k]):
			return "Piden %s %d." % [str(HAB_N.get(k, k)), int(lv["req"][k])]
	if entrevistas.has(id) and dia() - int(entrevistas[id]) < int(T.get("entrevista", {}).get("reintento_dias", 7)):
		var n := dia() - int(entrevistas[id])
		return "Te dijeron que no %s." % ("hoy" if n == 0 else ("ayer" if n == 1 else "hace %d días" % n))
	return ""

func dias_txt(dias: Array) -> String:
	var N := ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
	var seguidos := true
	for i in range(1, dias.size()):
		if int(dias[i]) != int(dias[i - 1]) + 1:
			seguidos = false
	if seguidos and dias.size() >= 3:
		return "De %s a %s" % [N[int(dias[0])], N[int(dias[-1])]]
	var ns: Array = []
	for x in dias:
		ns.append(N[int(x)])
	return _mayus(", ".join(ns.slice(0, ns.size() - 1)) + " y " + str(ns[-1]) if ns.size() > 1 else str(ns[0]))

func horario(id := "") -> String:
	var P := puesto(id)
	return "%s, de %s a %s" % [dias_txt(P["dias"]), jg._hhmm(float(P["h"][0])), jg._hhmm(fposmod(float(P["h"][1]), 24.0))]

func _oferta(id: String) -> Dictionary:
	var P := puesto(id)
	return {"id": id, "titulo": titulo(id), "e": str(P.get("e", "")), "empresa": str(P.get("empresa", "")), "lugar_n": lugar_n(id), "barrio_n": barrio_n(id),
		"fuera": es_fuera(id), "viaje": viaje(id), "horario": horario(id), "bruto_mes": bruto_mes(id), "neto_mes": neto_mes(id),
		"contrato": str(P.get("contrato", "")), "d": str(P.get("d", "")), "motivo": motivo(id)}

## las ofertas de esta semana (cambian cada lunes); sin el puesto que ya se tiene
func ofertas() -> Array:
	var O: Dictionary = T.get("ofertas", {})
	var sem := dia() / 7
	var ids: Array = []
	for id in T.get("puestos", {}):
		if id != puesto_id:
			ids.append(str(id))
	ids.sort_custom(func(a, b): return absi(hash(a + str(sem))) < absi(hash(b + str(sem))))
	ids = ids.slice(0, clampi(int(O.get("por_semana", 6)), int(O.get("minimas", 4)), ids.size()))
	var r: Array = []
	for id in ids:
		r.append(_oferta(id))
	r.sort_custom(func(a, b): return (a["motivo"] == "") and (b["motivo"] != ""))
	return r

func _en_horario(h: Array, dias: Array, margen_fin := 1.0) -> bool:
	var hh: float = jg._hora_dec()
	return jg._tiene(dias, jg._dia_sem()) and hh >= float(h[0]) and hh < float(h[1]) - margen_fin

func ir_entrevista(id: String) -> void:
	var E: Dictionary = T.get("entrevista", {})
	var mt := motivo(id)
	if mt != "":
		jg._aviso(mt)
		return
	if not _en_horario(E.get("h", [9, 14]), E.get("dias", [0, 1, 2, 3, 4]), 0.75):
		jg._aviso("Las entrevistas son de lunes a viernes, de %s a %s." % [jg._hhmm(float(E["h"][0])), jg._hhmm(float(E["h"][1]))])
		return
	if es_fuera(id) and not _billete():
		return
	abrir(false)
	yendo = {"tipo": "entrevista", "puesto": id}
	jg._ir_a_edificio("metro" if es_fuera(id) else str(puesto(id)["lugar"]))

func _billete() -> bool:
	if trabaja_fuera():
		return true     # con abono
	var b := float(T.get("dinero", {}).get("billete", 1.5)) * 2.0
	if not jg.cuenta.pagar("Billete de metro", b):
		jg._aviso("No te llega ni para el metro (%s)." % jg._eur(b))
		return false
	return true

func _hacer_entrevista(id: String) -> void:
	if puesto(id).is_empty():
		return
	var E: Dictionary = T.get("entrevista", {})
	var dur := float(E.get("min", 45)) + 2.0 * viaje(id)
	jg.cola.vaciar()
	jg.dentro = true
	jg.jugador.nodo.visible = false
	var hig := float(jg.nec["higiene"])
	var ene := float(jg.nec["energia"])
	jg._cerrar_ficha_y_saltar(dur, "Entrevista · %s…" % titulo(id), func(): _resultado_entrevista(id, hig, ene))

func _resultado_entrevista(id: String, hig: float, ene: float) -> void:
	var E: Dictionary = T.get("entrevista", {})
	var P := puesto(id)
	var p := float(E.get("base", 0.35)) + float(PROB.get(str(P["sector"]), 0.2)) * float(E.get("por_contrato", 0.9))
	var notas: Array = []
	var req := _req_estudios(id)
	if not req.is_empty() or estudios != "eso":
		p += float(E.get("estudios_extra", 0.05)) if (req.is_empty() and estudios != "eso") else 0.0
	if hig < 30.0:
		p += float(E.get("higiene_baja", -0.15))
		notas.append(str(E.get("higiene", "")))
	if ene < 25.0:
		p += float(E.get("energia_baja", -0.1))
		notas.append(str(E.get("energia", "")))
	if str(P.get("grupo", "")) == "bar" and float(jg.hab.get("cocteleria", 0.0)) >= 1.0:
		p += 0.1
	p = clampf(p, 0.05, 0.92)
	var ok := randf() < p if forzar_entrevista < 0 else forzar_entrevista == 1
	var Q: Dictionary = E.get("preguntas", {})
	var preg := str(Q.get("mayor", "")) if edad() >= 45 else str(Q.get("f" if fem() else "h", ""))
	var partes: Array = [str(P.get("empresa", "")) + ((" · " + lugar_n(id)) if lugar_n(id) != str(P.get("empresa", "")) else ""), preg + " " + str(Q.get("comun", ""))]
	partes.append_array(notas)
	partes.append("-")
	var tit := "Entrevista · %s" % titulo(id)
	if ok:
		var si: Array = E.get("si", [""])
		partes.append(str(si[randi() % si.size()]))
		var antes := puesto_id
		_avisar("entrevista", "Entrevista en %s: te cogieron." % str(P.get("empresa", "")), "🤝", {"ok": true, "id": id})
		aceptar(id, dia() + 1)
		if antes != "":
			partes.append("Dejas el trabajo de antes: es una baja voluntaria.")
		partes.append("%s. %s." % [horario(id), str(P.get("contrato", ""))])
		partes.append("Bruto al mes: %s · neto: unos %s." % [jg._eur(bruto_mes()), jg._eur(neto_mes())])
		jg.cuenta.tarjeta("🤝 " + tit, partes, "¡Bien!")
	else:
		var no: Array = E.get("no", [""])
		partes.append(str(no[randi() % no.size()]))
		entrevistas[id] = dia()
		jg.cuenta.tarjeta("📋 " + tit, partes)
		_avisar("entrevista", "Entrevista en %s: no hubo suerte." % str(P.get("empresa", "")), "📋", {"ok": false, "id": id})

# =============== paro ===============
func ir_sepe() -> void:
	var Pa: Dictionary = T.get("paro", {})
	if not _en_horario(Pa.get("sepe_h", [9, 14]), Pa.get("sepe_dias", [0, 1, 2, 3, 4]), 1.0):
		jg._aviso(str(Pa.get("sepe_cerrado", "")))
		return
	if not _billete():
		return
	abrir(false)
	yendo = {"tipo": "sepe"}
	jg._ir_a_edificio("metro")

func _hacer_sepe() -> void:
	var Pa: Dictionary = T.get("paro", {})
	var dur := float(Pa.get("sepe_min", 120)) + 2.0 * float(Pa.get("sepe_viaje", 15))
	jg.cola.vaciar()
	jg.dentro = true
	jg.jugador.nodo.visible = false
	jg._cerrar_ficha_y_saltar(dur, str(Pa.get("sepe_velo", "Oficina de empleo")) + "…", _resultado_sepe)

func _cuantia(br: float, pct: float) -> float:
	var Pa: Dictionary = T.get("paro", {})
	return roundf(clampf(br * pct, float(Pa.get("min", 560)), float(Pa.get("max", 1225))))

func _resultado_sepe() -> void:
	var Pa: Dictionary = T.get("paro", {})
	var qs: Array = Pa.get("quien", ["Casilda"])
	var quien := str(qs[randi() % qs.size()])
	var partes: Array = [PanelUI.huecos(str(Pa.get("sepe_cola", "")), {"quien": quien})]
	if puesto_id != "":
		partes.append(PanelUI.huecos(str(Pa.get("trabajando", "")), {"quien": quien}))
	elif bool(parada.get("inscrita", false)):
		partes.append(PanelUI.huecos(str(Pa.get("ya", "")), {"dia": int(Pa.get("dia_pago", 10))}))
	elif str(parada.get("causa", "")) == "baja":
		parada["inscrita"] = true
		parada["tipo"] = "nada"
		parada["resto"] = 0
		partes.append(str(Pa.get("baja", "")))
	else:
		if parada.is_empty():
			parada = {"desde": dia(), "causa": "", "inscrita": false}
		var cot := cotizados
		parada["inscrita"] = true
		parada["ult_cobro"] = dia()
		parada["cobrados"] = 0
		if cot >= int(Pa.get("contributiva_min_dias", 360)):
			var dias := mini(int(Pa.get("max_dias", 720)), (cot / 180) * int(Pa.get("dias_por_180", 60)))
			var br := 0.0
			for b in brutos:
				br += float(b)
			br = br / float(brutos.size()) if not brutos.is_empty() else float(Pa.get("base_inicial", 1350))
			var pcts: Array = Pa.get("pct", [[180, 0.7], [100000, 0.6]])
			parada.merge({"tipo": "contributiva", "resto": dias, "c1": _cuantia(br, float(pcts[0][1])), "c2": _cuantia(br, float(pcts[-1][1]))}, true)
			partes.append(PanelUI.huecos(str(Pa.get("contributiva", "")), {"cot": cot, "dias": dias, "c1": jg._eur(float(parada["c1"])), "c2": jg._eur(float(parada["c2"]))}))
			cotizados = 0
		elif cot >= int(Pa.get("subsidio_min_dias", 90)):
			var meses := 3
			for x in Pa.get("subsidio_meses", []):
				if cot < int(x[0]):
					meses = int(x[1])
					break
			var c := float(Pa.get("subsidio", 570))
			parada.merge({"tipo": "subsidio", "resto": meses * 30, "c1": c, "c2": c}, true)
			partes.append(PanelUI.huecos(str(Pa.get("subsidio_txt", "")), {"c": jg._eur(c), "m": meses}))
			cotizados = 0
		else:
			parada.merge({"tipo": "nada", "resto": 0}, true)
			partes.append(PanelUI.huecos(str(Pa.get("nada", "")), {"cot": cot}))
	jg.cuenta.tarjeta("🏛 " + str(Pa.get("sepe_titulo", "")), partes)
	_avisar("sepe", "Fuiste a la oficina de empleo.", "🏛")

func _pagar_paro(d: int) -> void:
	var Pa: Dictionary = T.get("paro", {})
	var resto := int(parada.get("resto", 0))
	var dias := mini(d - int(parada.get("ult_cobro", d)), resto)
	if dias <= 0:
		return
	var cob := int(parada.get("cobrados", 0))
	var c := float(parada.get("c1", 0)) if cob < 180 else float(parada.get("c2", 0))
	var imp := snappedf(c * float(dias) / float(DIAS_MES), 0.01)
	jg.cuenta.ingresar(str(Pa.get("pago_sub" if parada.get("tipo", "") == "subsidio" else "pago", "Paro")), imp)
	parada["resto"] = resto - dias
	parada["cobrados"] = cob + dias
	parada["ult_cobro"] = d
	jg._aviso("%s: %s" % [str(Pa.get("pago", "")), jg._eur(imp)])
	Historia.contar("Cobraste el paro: %s." % jg._eur(imp), "🏛")
	if int(parada["resto"]) <= 0:
		jg.cuenta.tarjeta("🏛 " + str(Pa.get("sepe", "")), [str(Pa.get("fin", ""))])

## para «Próximos pagos» del panel Dinero
func proximos_ingresos() -> Array:
	var r: Array = []
	if puesto_id != "":
		var dn: int = jg.cuenta.proximo(int(T.get("nomina", {}).get("dia", 26)))
		if dn / DIAS_MES != pagado_mes:
			r.append({"d": dn, "c": "Nómina (aprox.)", "i": neto_mes()})
	if bool(parada.get("inscrita", false)) and int(parada.get("resto", 0)) > 0:
		var dp: int = jg.cuenta.proximo(int(T.get("paro", {}).get("dia_pago", 10)))
		r.append({"d": dp, "c": "Paro", "i": float(parada.get("c1", 0)) * minf(1.0, float(dp - int(parada.get("ult_cobro", dp))) / float(DIAS_MES))})
	return r

# =============== la boca de metro (para los trabajos de otros barrios) ===============
func _metro() -> void:
	var lin: Array = jg.ciudad.get("enlaces", {}).get("lineas", [])
	var p := Vector2(60.0, 50.0)
	for l in lin:
		for q in l.get("paradas", []):
			if str(q.get("b", "")) == jg.BARRIO and str(l.get("modo", "")) == "metro":
				p = Vector2(float(q["p"][0]), float(q["p"][1]))
	# en la acera de arriba de la calle (la parada del dato está en el eje de la calzada)
	var c := Escala.v2([p.x, p.y])
	var pos := Vector2(c.x + 0.5, c.y - 8.0)
	var paso := Vector2(pos.x, pos.y + 2.2)
	if jg.nav != null and jg.nav.solido(paso):
		paso = jg.nav.centro(jg.nav.libre_cerca(paso))
	metro_pos = paso
	var raiz := Node3D.new()
	jg.add_child(raiz)
	var poste := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = 0.06
	cm.bottom_radius = 0.06
	cm.height = 3.0
	poste.mesh = cm
	poste.material_override = jg._mat(Color(0.25, 0.27, 0.3))
	poste.position = Vector3(pos.x, 1.5, pos.y)
	raiz.add_child(poste)
	var rombo := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(0.75, 0.75, 0.08)
	rombo.mesh = bm
	rombo.material_override = jg._mat(Color(0.78, 0.12, 0.12), 0.5)
	rombo.position = Vector3(pos.x, 3.0, pos.y)
	rombo.rotation.z = PI * 0.25
	raiz.add_child(rombo)
	var m := Label3D.new()
	m.text = "M"
	m.font_size = 64
	m.pixel_size = 0.008
	m.modulate = Color.WHITE
	m.outline_size = 0
	m.position = Vector3(pos.x, 3.0, pos.y + 0.05)
	m.double_sided = true
	raiz.add_child(m)
	# barandilla de la escalera
	for dx in [-0.9, 0.9]:
		var b := MeshInstance3D.new()
		var bb := BoxMesh.new()
		bb.size = Vector3(0.08, 0.9, 2.2)
		b.mesh = bb
		b.material_override = jg._mat(Color(0.3, 0.45, 0.35))
		b.position = Vector3(pos.x + dx, 0.45, pos.y - 1.6)
		raiz.add_child(b)
	var hueco := MeshInstance3D.new()
	var hm := BoxMesh.new()
	hm.size = Vector3(1.7, 0.04, 2.2)
	hueco.mesh = hm
	hueco.material_override = jg._mat(Color(0.12, 0.12, 0.14))
	hueco.position = Vector3(pos.x, 0.03, pos.y - 1.6)
	raiz.add_child(hueco)
	if jg.nav != null:
		jg.nav.solido_rect(Rect2(pos.x - 0.95, pos.y - 2.7, 1.9, 2.2), true)
	var n := str(J.get("metro_boca", "Metro"))
	var etq: Label3D = jg.etiqueta(n, Vector3(pos.x, 4.2, pos.y), 40, Color(1, 0.95, 0.9), 260.0)
	etq.set_meta("sec", true)
	jg.etiquetas.append(etq)
	jg.edificios["metro"] = {"id": "metro", "n": n, "e": "M", "rb": Rect2(pos.x - 1.0, pos.y - 2.7, 2.0, 3.0), "h": 3.4, "puerta": paso,
		"d": "", "abre": null, "aabb": AABB(Vector3(pos.x - 1.0, 0, pos.y - 2.7), Vector3(2.0, 3.4, 3.0)), "etq": etq}

# =============== panel «Trabajo» y botones del Menú ===============
func crear_ui(ui: Control) -> void:
	hoja = PanelUI.hoja(ui, func(): abrir(false))
	# secciones «Trabajo» y «Dinero» de la rejilla del Menú (guardado.gd)
	b_menu_t = jg.guardado.seccion_menu("trabajo", "Trabajo", func(): abrir(true))
	b_menu_d = jg.guardado.seccion_menu("dinero", "Dinero", func(): jg.cuenta.abrir(true))

func abrir(v: bool) -> void:
	if v:
		jg.cuenta.abrir(false)
		jg.guardado._abrir_panel(false)
		jg._cerrar_ficha()
		confirmar_dejar = false
		if jg.objetivos != null and jg.objetivos.modo != "":   # una hoja cada vez
			jg.objetivos.cerrar()
		if jg.relaciones != null:
			jg.relaciones.ui.cerrar()
	abierta = v
	hoja["raiz"].visible = v
	if v:
		_rellenar()
		if puesto_id == "":
			Objetivos.hecho("trabajo", {"que": "ofertas"})   # mirar las ofertas ya es buscar trabajo

func _estado_hoy() -> String:
	var d := dia()
	var t := turno(d)
	var m: float = jg.minutos
	if t.is_empty():
		var sig := d + 1
		while sig < d + 8 and turno(sig).is_empty():
			sig += 1
		var N := ["el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado", "el domingo"]
		return "Hoy libras. Vuelves %s." % ("mañana" if sig == d + 1 else N[sig % 7])
	var h := _hoy(d)
	var ini: String = jg._hhmm(float(puesto()["h"][0]))
	var fin: String = jg._hhmm(float(puesto()["h"][1]))
	if bool(h["hecha"]):
		return "Hoy ya has trabajado (de %s a %s)." % [ini, fin]
	if bool(h["fichada"]):
		return "Estás de turno hasta las %s." % fin
	if m < float(t["ini"]):
		var falta := int(float(t["ini"]) - m)
		return "Hoy entras a las %s (dentro de %d h %02d min)." % [ini, falta / 60, falta % 60]
	return "Vas tarde: el turno empezó a las %s." % ini

func _rellenar() -> void:
	if not abierta:
		return
	var L: VBoxContainer = hoja["lista"]
	PanelUI.vaciar(L)
	hoja["titulo"].text = "📋 Trabajo"
	if edad() < int(T.get("edad_min", 16)):
		PanelUI.texto(L, "Con %d años toca estudiar. El trabajo, más adelante." % edad())
		return
	if confirmar_dejar:
		PanelUI.seccion(L, "¿Dejar el trabajo?")
		PanelUI.texto(L, "Si te vas tú, es una baja voluntaria: no hay paro. Te pagan lo trabajado este mes (finiquito).")
		L.add_child(PanelUI.boton("Sí, lo dejo", dejar))
		L.add_child(PanelUI.boton("No, me quedo", func():
			confirmar_dejar = false
			_rellenar()))
		return
	if puesto_id != "":
		var bx := PanelUI.recuadro(L)
		var P := puesto()
		PanelUI.seccion(bx, "%s %s" % [str(P.get("e", "")), titulo()])
		PanelUI.texto(bx, "%s%s%s" % [str(P.get("empresa", "")), (" · " + lugar_n()) if lugar_n() != str(P.get("empresa", "")) else "", (" (%s, %d min en metro)" % [barrio_n(), int(viaje())]) if es_fuera() else ""], 14, PanelUI.CLARO_SUAVE)
		PanelUI.texto(bx, horario() + ".", 14)
		PanelUI.texto(bx, "Contrato: %s." % str(P.get("contrato", "")), 14)
		PanelUI.fila(bx, "Bruto al mes", jg._eur(bruto_mes()), PanelUI.CLARO, PanelUI.CLARO, 14)
		PanelUI.fila(bx, "Neto (lo que llega)", jg._eur(neto_mes()), PanelUI.CLARO, PanelUI.VERDE, 14)
		PanelUI.texto(L, _estado_hoy(), 16, PanelUI.AMBAR)
		var fa := 0
		var re := 0
		var v0 := dia() - int(T.get("faltas", {}).get("ventana_dias", 28))
		for x in incid:
			if int(x["d"]) > v0:
				if x["k"] == "falta":
					fa += 1
				else:
					re += 1
		PanelUI.fila(L, "Jornadas trabajadas", str(jornadas))
		PanelUI.fila(L, "Últimas 4 semanas", "%d falta%s · %d retraso%s" % [fa, "" if fa == 1 else "s", re, "" if re == 1 else "s"], PanelUI.CLARO, PanelUI.ROJO if fa + re > 0 else PanelUI.CLARO)
		if avisos > 0:
			PanelUI.fila(L, "Amonestaciones", "aviso" if avisos == 1 else "por escrito", PanelUI.CLARO, PanelUI.ROJO)
		var d := dia()
		if _puede_entrar(jg.minutos + viaje()) or (not turno(d).is_empty() and _puede_entrar(float(turno(d)["ini"]))):
			L.add_child(PanelUI.boton("Ir a trabajar ahora", ir_al_trabajo))
		if not ult_nomina.is_empty():
			L.add_child(PanelUI.boton("Ver la última nómina", func(): tarjeta_nomina(ult_nomina)))
	else:
		var bx2 := PanelUI.recuadro(L, Color(0.25, 0.18, 0.14, 1.0))
		PanelUI.seccion(bx2, "Sin trabajo" + ((" desde el día %d" % (int(parada["desde"]) % DIAS_MES + 1)) if parada.has("desde") else ""))
		if bool(parada.get("inscrita", false)):
			if int(parada.get("resto", 0)) > 0:
				var c := float(parada.get("c1", 0)) if int(parada.get("cobrados", 0)) < 180 else float(parada.get("c2", 0))
				PanelUI.fila(bx2, "Paro" if parada.get("tipo", "") == "contributiva" else "Subsidio", "%s al mes" % jg._eur(c), PanelUI.CLARO, PanelUI.VERDE)
				PanelUI.fila(bx2, "Días que quedan", str(int(parada["resto"])))
			else:
				PanelUI.texto(bx2, "No te corresponde paro. Inscrita en la oficina de empleo como demandante." if fem() else "No te corresponde paro. Inscrito en la oficina de empleo como demandante.", 14)
		else:
			PanelUI.texto(bx2, "No te has inscrito en la oficina de empleo. Sin inscribirte no hay paro, aunque te toque.", 14)
			var Pa: Dictionary = T.get("paro", {})
			bx2.add_child(PanelUI.boton("Ir a la oficina de empleo (%s, en metro)" % str(Pa.get("sepe_barrio", "")), ir_sepe))
		PanelUI.fila(bx2, "Días cotizados", str(cotizados), PanelUI.CLARO_SUAVE, PanelUI.CLARO_SUAVE, 14)
	var en := str(EDU.get("niveles", {}).get(estudios, {}).get("n", estudios))
	var habs: Array = []
	for k in jg.hab:
		if float(jg.hab[k]) >= 0.1:
			habs.append("%s %.1f" % [str(HAB_N.get(k, str(k).capitalize())), float(jg.hab[k])])
	PanelUI.texto(L, "Estudios: %s%s" % [en, (" · " + ", ".join(habs)) if not habs.is_empty() else ""], 14, PanelUI.CLARO_SUAVE)
	# ofertas
	PanelUI.linea(L)
	PanelUI.seccion(L, str(T.get("ofertas", {}).get("titulo_semana", "Ofertas")))
	var E: Dictionary = T.get("entrevista", {})
	PanelUI.texto(L, "Entrevistas de lunes a viernes, de %s a %s. Se va a la empresa." % [jg._hhmm(float(E["h"][0])), jg._hhmm(float(E["h"][1]))], 13, PanelUI.CLARO_SUAVE)
	for o in ofertas():
		var b := PanelUI.recuadro(L)
		PanelUI.seccion(b, "%s %s" % [o["e"], o["titulo"]], PanelUI.CLARO)
		PanelUI.texto(b, "%s%s%s" % [o["empresa"], (" · " + o["lugar_n"]) if o["lugar_n"] != o["empresa"] else "", (" (%s, %d min en metro)" % [o["barrio_n"], int(o["viaje"])]) if o["fuera"] else " (aquí, en La Ribera)"], 14, PanelUI.CLARO_SUAVE)
		PanelUI.texto(b, "%s. %s." % [o["horario"], o["contrato"]], 14)
		PanelUI.fila(b, "%s brutos" % jg._eur(float(o["bruto_mes"])), "%s netos al mes" % jg._eur(float(o["neto_mes"])), PanelUI.CLARO_SUAVE, PanelUI.VERDE, 14)
		PanelUI.texto(b, str(o["d"]), 13, PanelUI.CLARO_SUAVE)
		var oid := str(o["id"])
		if o["motivo"] == "":
			b.add_child(PanelUI.boton("Ir a la entrevista", func(): ir_entrevista(oid), 44.0, 15))
		else:
			PanelUI.texto(b, str(o["motivo"]), 14, PanelUI.ROJO)
	if puesto_id != "":
		PanelUI.linea(L)
		L.add_child(PanelUI.boton("Dejar el trabajo", func():
			confirmar_dejar = true
			_rellenar(), 44.0, 15))

func en_ui(p: Vector2) -> bool:
	return abierta and hoja["raiz"].get_global_rect().has_point(p)

# =============== guardado ===============
func _guardar() -> Dictionary:
	return {"puesto": puesto_id, "nivel": nivel, "desde": desde, "jornadas": jornadas, "incid": incid, "avisos": avisos,
		"desc_min": desc_min, "desc_dias": desc_dias, "pagado_mes": pagado_mes, "hoy": hoy, "parada": parada, "cotizados": cotizados,
		"brutos": brutos, "entrevistas": entrevistas, "estudios": estudios, "ult_nomina": ult_nomina}

static func _n(d: Dictionary, k: String, defecto: float) -> float:
	var x = d.get(k, null)
	return float(x) if (x is float or x is int) and is_finite(float(x)) else defecto

func _aplicar(d: Dictionary) -> void:
	ult_min = -1.0
	if not d.has("puesto"):
		return      # partida de antes del trabajo (sección v1 {"bar": …}): se queda el puesto inicial
	var pid := str(d.get("puesto", ""))
	puesto_id = pid if (pid == "" or not puesto(pid).is_empty()) else puesto_id
	nivel = int(_n(d, "nivel", nivel))
	desde = int(_n(d, "desde", desde))
	jornadas = int(_n(d, "jornadas", jornadas))
	avisos = int(_n(d, "avisos", avisos))
	desc_min = _n(d, "desc_min", desc_min)
	desc_dias = int(_n(d, "desc_dias", desc_dias))
	pagado_mes = int(_n(d, "pagado_mes", pagado_mes))
	cotizados = int(_n(d, "cotizados", cotizados))
	if d.get("incid", null) is Array:
		incid = []
		for x in d["incid"]:
			if x is Dictionary and x.has("d") and x.has("k"):
				incid.append({"d": int(x["d"]), "k": str(x["k"]), "min": int(x.get("min", 0))})
	if d.get("hoy", null) is Dictionary:
		var h: Dictionary = d["hoy"]
		hoy = {}
		if h.has("d"):
			hoy = {"d": int(h["d"]), "fichada": bool(h.get("fichada", false)), "llegada": float(h.get("llegada", -1)), "tarde": float(h.get("tarde", 0)),
				"hecha": bool(h.get("hecha", false)), "avisada": bool(h.get("avisada", false)), "fuera": float(h.get("fuera", 0))}
	if d.get("parada", null) is Dictionary:
		parada = d["parada"]
	if d.get("brutos", null) is Array:
		brutos = []
		for b in d["brutos"]:
			if b is float or b is int:
				brutos.append(float(b))
	if d.get("entrevistas", null) is Dictionary:
		entrevistas = d["entrevistas"]
	if d.get("estudios", null) is String and EDU.get("niveles", {}).has(d["estudios"]):
		estudios = d["estudios"]
	if d.get("ult_nomina", null) is Dictionary:
		ult_nomina = d["ult_nomina"]

# =============== órdenes de prueba (casita_cmd) ===============
func cmd(c: String, a: Array) -> bool:
	match c:
		"trabaja":
			# compatibilidad con las pruebas de GD-2: de turno en el bar a cualquier hora
			forzado = bool(a[1]) if a.size() > 1 else true
			if forzado and puesto_id != "bar_camarera":
				aceptar("bar_camarera")
			jg._hud()
		"trabajo":
			print("trabajo: puesto=%s nivel=%d desde=%d jornadas=%d puntos=%.2f avisos=%d desc_min=%.0f desc_dias=%d incid=%d hoy=%s parada=%s cot=%d estudios=%s en_barra=%s yendo=%s bruto=%s neto=%s panel=%s dinero_panel=%s bar_n=%d" % [puesto_id, nivel, desde, jornadas, puntos(), avisos, desc_min, desc_dias, incid.size(), JSON.stringify(hoy), JSON.stringify(parada), cotizados, estudios, str(en_barra()), JSON.stringify(yendo), str(bruto_mes()), str(neto_mes()), str(abierta), str(jg.cuenta.abierta), bar_n])
		"aceptar":
			print("aceptar: %s" % str(aceptar(str(a[1]), int(a[2]) if a.size() > 2 else -1)))
		"ofertas":
			var t := []
			for o in ofertas():
				t.append("%s|%s|%s|%s" % [o["id"], str(o["bruto_mes"]), str(o["neto_mes"]), o["motivo"]])
			print("ofertas: %s" % " ; ".join(t))
		"sueldos":
			var t2 := []
			for id in T.get("puestos", {}):
				var b := bruto_mes(id)
				var n := Fiscal.nomina(b, b)
				t2.append("%s bruto=%s ss=%s irpf=%s neto=%s ret=%.3f" % [id, str(b), str(n["ss"]), str(n["irpf"]), str(n["neto"]), float(n["ret"])])
			print("sueldos: %s" % " ; ".join(t2))
		"ir_trabajo":
			ir_al_trabajo()
			print("ir_trabajo: %s" % JSON.stringify(yendo))
		"entrevista":
			forzar_entrevista = int(a[2]) if a.size() > 2 else -1
			ir_entrevista(str(a[1]))
			print("entrevista: %s" % JSON.stringify(yendo))
		"sepe":
			ir_sepe()
			print("sepe: %s" % JSON.stringify(yendo))
		"nomina":
			var n2 := _nomina(dia())
			print("nomina: %s" % JSON.stringify(n2))
		"despedir":
			_despedir(str(a[1]) if a.size() > 1 else "despido")
			print("despedir: %s" % JSON.stringify(parada))
		"cotizados":
			cotizados = int(a[1])
			print("cotizados: %d" % cotizados)
		"panel_trabajo":
			abrir(true)
			print("panel_trabajo: %s" % str(abierta))
		"metro":
			print("metro: %s" % str(metro_pos))
		"menu_rect":
			if a.size() > 1:
				return false     # con texto: el botón del Menú que empiece así (relaciones.gd)
			var r1: Rect2 = b_menu_t.get_global_rect()
			var r2: Rect2 = b_menu_d.get_global_rect()
			print("menu_rect: t=%d,%d d=%d,%d" % [int(r1.get_center().x), int(r1.get_center().y), int(r2.get_center().x), int(r2.get_center().y)])
		_:
			return false
	return true
