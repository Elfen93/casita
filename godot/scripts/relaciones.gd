class_name Relaciones
extends RefCounted
# VECINOS Y RELACIONES (bloque «vecinos»). Conocer a la gente del censo y tratar con ella en la calle, en el bar y en tu casa.
# Toda la lógica vive aquí y la interfaz en gente_ui.gd; main.gd solo tiene ganchos «# --- vecinos ---».
#
# - Tocar a un vecino abre su ficha con lo que sabes y un menú (data/gente3d.json → opciones, más las de su oficio o el lugar
#   de data/trato.json). Al elegir, la jugadora anda hasta la persona, la persona se para, se miran, cada una hace su
#   animación (data/animaciones.json → gestos) con un bocadillo y al acabar sale una tarjeta con lo que ha pasado.
# - Relación por persona: amistad (rel) y romance (amor, chispa), lo que sabes (oficio, trabajo, casa, carácter, ideas)
#   y lo que te han contado de otras personas (cotilleo). Romance solo entre adultos; nunca con menores.
# - Pestaña «Gente» (Menú): conocidos, dónde están a esta hora, «Ir a verla», «Llamar» e «Invitar a casa».
# - Los vecinos te buscan: saludan al cruzaros y, a veces, uno viene a pedirte un favor (data/trato.json → favores).
# - Rendimiento: nada recorre el censo por fotograma; los saludos miran solo a los conocidos, una vez por segundo.

var jg
var G: Dictionary = {}           # data/gente3d.json
var DATA := {}                   # archivo -> contenido, para las referencias «@archivo.sección.clave»
var ui: GenteUI
var censo := {}                  # id -> vecino del censo (los 263)
var por_vid := {}                # id -> x de main.vecinos (los que andan por La Ribera)

# ---- estado que se guarda ----
var per := {}                    # id -> {rel, amor, chispa, fallos, no_amor, sabe:{}, cd:{}, desde}
var cotis := {}                  # id -> {"h": [frases sabidas], "l": [lazos sabidos]} (lo que te han contado de alguien)
var favores := {}                # id -> {"te": favores que te debe, "ult": día del último}
var visita := {}                 # visita a tu casa: {vid, min, est, ...}
var plan_favor := {}             # {vid, id, h, dia}: hoy alguien vendrá a pedirte algo
var dia_plan := -1

# ---- estado de la sesión ----
var enc := {}                    # encuentro en curso (la jugadora va a hablar con alguien)
var saludos: Array = []          # [{x, t}] vecinos parados saludando
var llamada := {}                # llamada en curso
var ir_a := ""                   # «Ir a verla»: al llegar se abre su ficha
var favor_ir := {}               # favor de ir a su casa: la jugadora va andando a su portal
var busca := {}                  # vecino que viene a buscarte para pedirte un favor
var _lento := 0.0
var _ult_saludo := -100.0
var _reloj := 0.0

func _init(j) -> void:
	jg = j
	G = Datos.cargar("gente3d")
	for n in ["interacciones", "trato", "textos_mods_hz", "animaciones", "ideologias", "gente3d"]:
		DATA[n] = Datos.cargar(n) if n != "gente3d" else G
	for v in jg.personas.get("vecinos", []):
		censo[str(v["id"])] = v
	for x in jg.vecinos:
		por_vid[str(x["v"]["id"])] = x
	jg.guardado.registrar("relaciones", 1, _guardar, _aplicar)

func crear_ui(capa: Control) -> void:
	ui = GenteUI.new(self)
	ui.crear(capa)

# =============== textos ===============
## «@archivo.sección.clave» -> el valor de ese dato (texto, lista…); cualquier otra cosa, tal cual
func R(v):
	if v is String and v.begins_with("@"):
		var p: PackedStringArray = v.substr(1).split(".")
		var x = DATA.get(p[0], {})
		for i in range(1, p.size()):
			if x is Dictionary and x.has(p[i]):
				x = x[p[i]]
			else:
				return ""
		return x
	return v

## texto con huecos: {n} nombre de la jugadora, {o} su terminación, y los de vars ({v}, {vo}, {p}, {pO}…)
func hue(s, vars := {}) -> String:
	var t := str(R(s))
	for k in vars:
		t = t.replace("{%s}" % k, str(vars[k]))
	return t.replace("{n}", jg.nombre_pj).replace("{o}", _suf_j())

## un elemento al azar si es una lista (resuelve referencias dentro); el texto, si no
func pick(v, vars := {}) -> String:
	var r = R(v)
	if r is Array:
		if r.is_empty():
			return ""
		return pick(r[randi() % r.size()], vars)
	return hue(r, vars)

## [título, línea] de una lista de pares (o de un par)
func par(v, vars := {}) -> Array:
	var r = R(v)
	if r is Array and not r.is_empty() and r[0] is Array:
		r = r[randi() % r.size()]
	if r is Array and r.size() >= 2:
		return [hue(r[0], vars), pick(r[1], vars)]
	return [hue(r, vars), ""]

func txt(clave: String, vars := {}) -> String:
	var p := clave.split(".")
	var x = G
	for k in p:
		if x is Dictionary and x.has(k):
			x = x[k]
		else:
			return clave
	return pick(x, vars)

# =============== quién es quién ===============
func _jug() -> Dictionary:
	return Figura.jugable(jg.modelo_pj)

func _suf_j() -> String:
	return "a" if str(_jug().get("genero", "f")) == "f" else "o"

func _edad_j() -> int:
	return int(_jug().get("edad", 27))

static func suf(v: Dictionary) -> String:
	var g := str(v.get("g", "f"))
	return "o" if g == "m" else ("e" if g == "x" else "a")

static func gi(v: Dictionary) -> int:
	return 1 if str(v.get("g", "f")) == "m" else 0

func vars_de(v: Dictionary) -> Dictionary:
	return {"v": v["n"], "p": v["n"], "vo": suf(v), "pO": suf(v)}

func menor(v: Dictionary, e := 18) -> bool:
	return int(v.get("edad", 30)) < e

func dia() -> int:
	return int(jg.minutos / 1440.0)

func oficio(v: Dictionary) -> String:
	var o = v.get("oficio", null)
	if o is Array and o.size() > 0:
		var s := str(o[mini(gi(v), o.size() - 1)])
		return s.substr(0, 1).to_upper() + s.substr(1)
	var e = v.get("estudia", null)
	if e != null:
		return str(R("@interacciones.vecinos_ficha.estudia." + str(e)))
	return ""

func puesto(v: Dictionary) -> String:
	var t = v.get("trabajo", null)
	if t is Dictionary and t.get("puesto", null) is Array:
		return str(t["puesto"][mini(gi(v), t["puesto"].size() - 1)])
	return ""

func casa_de(v: Dictionary) -> String:
	var H: Dictionary = jg.personas.get("hogares", {}).get(str(v.get("hogar", "")), {})
	var E: Dictionary = jg.personas.get("edificios", {}).get(str(H.get("edificio", "")), {})
	if E.is_empty():
		return ""
	return str(E.get("n", "")) + ((" · " + str(H["puerta"])) if H.get("puerta", "") != "" else "")

func sitio(id: String) -> String:
	if jg.edificios.has(id):
		return str(jg.edificios[id]["n"])
	return str(jg.lugares.get("lugares", {}).get(id, {}).get("n", id))

func _hm(h: float) -> String:
	h = fposmod(h, 24.0)
	return "%d:%02d" % [int(h), int(round((h - floor(h)) * 60.0)) % 60]

func trabajando(v: Dictionary, lug: String, h := -1.0, d := -1) -> bool:
	var t = v.get("trabajo", null)
	if not (t is Dictionary) or (lug != "*" and str(t.get("lugar", "")) != lug):
		return false
	if h < 0.0:
		h = jg._hora_dec()
	if d < 0:
		d = jg._dia_sem()
	var th: Array = t.get("h", [0, 0])
	var a := float(th[0])
	var b := float(th[1])
	if b > 24.0 and h < b - 24.0:
		return jg._tiene(t.get("dias", []), (d + 6) % 7)
	return h >= a and h < b and jg._tiene(t.get("dias", []), d)

## libre a la hora h del día d (sin trabajo ni clase)
func libre(v: Dictionary, h: float, d: int) -> bool:
	if trabajando(v, "*", h, d):
		return false
	var es = v.get("estudia", null)
	if d < 5 and es in ["cole", "instituto", "fp", "uni"] and h >= 8.5 and h < 15.0:
		return false
	return true

func caracter(vid: String) -> String:
	var ks: Array = G.get("caracter", {}).keys()
	ks.sort()
	return str(ks[absi(hash(vid + "car")) % ks.size()]) if not ks.is_empty() else "abierta"

func animo(x: Dictionary) -> String:
	var v: Dictionary = x["v"]
	var h: float = jg._hora_dec()
	if trabajando(v, str(x.get("meta", ""))):
		return "liada"
	if h >= 23.0 or h < 7.0:
		return "cansada"
	var r := float(absi(hash("%s|%d" % [v["id"], dia()])) % 100) / 100.0
	return "torcida" if r < 0.18 else ("contenta" if r > 0.72 else "normal")

func _mod(x: Dictionary) -> float:
	var vid := str(x["v"]["id"])
	return float(G["caracter"].get(caracter(vid), {}).get("p", 0.0)) + float(G["animo"].get(animo(x), {}).get("p", 0.0))

# =============== relación ===============
func P(vid: String) -> Dictionary:
	return per.get(vid, {})

func conocida(vid: String) -> bool:
	return per.has(vid)

func _nueva(vid: String, rel: float) -> Dictionary:
	per[vid] = {"rel": rel, "amor": 0.0, "chispa": 0, "fallos": 0, "no_amor": -1, "sabe": {"oficio": true}, "cd": {}, "desde": dia()}
	return per[vid]

func fase(vid: String) -> String:
	if not per.has(vid):
		return "nadie"
	var p: Dictionary = per[vid]
	var U: Dictionary = G["umbrales"]
	if float(p.get("amor", 0)) >= 40.0 and int(p.get("chispa", 0)) >= 3:
		return "cita"
	if int(p.get("chispa", 0)) >= 1:
		return "tonteo"
	var r := float(p.get("rel", 0))
	return "intima" if r >= float(U["intima"]) else ("amiga" if r >= float(U["amiga"]) else "conocida")

func fase_txt(vid: String) -> String:
	var f: Array = G["fases"].get(fase(vid), ["", ""])
	return str(f[gi(censo.get(vid, {}))])

func _hecho_hoy(vid: String, k: String) -> bool:
	return int(P(vid).get("cd", {}).get(k, -1)) == dia()

func _marcar(vid: String, k: String) -> void:
	per[vid]["cd"][k] = dia()

func _snap(vid: String) -> Dictionary:
	var p := P(vid)
	return {"rel": float(p.get("rel", 0)), "amor": float(p.get("amor", 0)), "fase": fase(vid)}

## efectos: rel y amor ([mín, máx] o número), necesidades, te (favor que te debe). Devuelve las etiquetas de la tarjeta.
func fx(vid: String, f: Dictionary) -> Array:
	var tags: Array = []
	var p := P(vid)
	var mul := float(G["caracter"].get(caracter(vid), {}).get("rel", 1.0))
	for k in ["rel", "amor"]:
		if f.has(k) and not p.is_empty():
			var r = f[k]
			var d: float = randf_range(float(r[0]), float(r[1])) if r is Array else float(r)
			if k == "rel" and d > 0.0:
				d *= mul
			p[k] = clampf(float(p.get(k, 0)) + d, 0.0, 100.0)
	var nombres = R(G["ficha"]["fx"])
	for k in ["social", "diversion", "hambre", "energia"]:
		if f.has(k) and jg.nec.has(k):
			var d2 := float(f[k])
			jg.nec[k] = clampf(jg.nec[k] + d2, 0.0, 100.0)
			tags.append("%s %s%d" % [str(nombres.get(k, k)) if nombres is Dictionary else k, "+" if d2 > 0 else "−", absi(int(round(d2)))])
	if f.has("te"):
		var fv: Dictionary = favores.get(vid, {"te": 0, "ult": -1})
		fv["te"] = int(fv.get("te", 0)) + int(f["te"])
		favores[vid] = fv
		tags.append(hue(G["ficha"]["te_debe_una"]) if int(fv["te"]) == 1 else hue(G["ficha"]["te_debe_n"], {"n": fv["te"]}))
	return tags

# =============== romance ===============
func orientacion(vid: String) -> String:
	var O: Array = DATA["trato"].get("romance", {}).get("orientacion", [])
	var r := float(absi(hash(vid + "ori")) % 10000) / 10000.0
	var acc := 0.0
	var t := "hetero"
	for o in O:
		acc += float(o[1])
		if r < acc:
			t = str(o[0])
			break
	var v: Dictionary = censo.get(vid, {})
	if t == "nadie":
		return "nadie"
	if t == "ambos" or str(v.get("g", "f")) == "x":
		return "ambos"
	var f := str(v.get("g", "f")) == "f"
	if t == "hetero":
		return "hombres" if f else "mujeres"
	return "mujeres" if f else "hombres"

func pareja_de(v: Dictionary) -> String:
	for l in v.get("lazos", []):
		if str(l[1]) == "pareja" and censo.has(str(l[0])):
			return str(censo[str(l[0])]["n"])
	return ""

## ¿cabe el romance? "" si sí; si no, el motivo
func motivo_romance(v: Dictionary) -> String:
	var Rm: Dictionary = DATA["trato"].get("romance", {})
	var vs := vars_de(v)
	if menor(v, int(Rm.get("edad_min", 18))) or _edad_j() < 18:
		return hue(G["ficha"]["menor"])
	var pa := pareja_de(v)
	if pa != "":
		return hue(G["ficha"]["pareja"], {"quien": pa})
	if absi(int(v["edad"]) - _edad_j()) > int(Rm.get("dif_edad", 15)):
		return hue(G["ficha"]["no_interesa"], vs)
	var o := orientacion(str(v["id"]))
	var g := str(_jug().get("genero", "f"))
	if o == "nadie" or (o == "mujeres" and g != "f") or (o == "hombres" and g == "f"):
		return hue(G["ficha"]["no_interesa"], vs)
	return ""

# =============== opciones del menú ===============
## [{id, e, n}] lo que se puede hacer ahora con esta persona
func opciones(x: Dictionary) -> Array:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var out: Array = []
	if menor(v, 12):
		return out
	var con := conocida(vid)
	var rel := float(P(vid).get("rel", 0))
	for o in G["opciones"]:
		if bool(o.get("conocer", false)) != (not con):
			continue
		if con and menor(v) and not bool(o.get("menor", false)):
			continue
		if bool(o.get("adultos", false)) and (menor(v) or _edad_j() < 18):
			continue
		if rel < float(o.get("rel", 0)):
			continue
		if str(o["id"]) == "ligar":
			if pareja_de(v) != "" or int(P(vid).get("no_amor", -1)) > dia():
				continue
		out.append({"id": str(o["id"]), "e": str(o["e"]), "n": _etq(o)})
	if con and not menor(v):
		for a in acciones_trato(x).slice(0, 2):
			out.append({"id": "t:%s:%s" % [a["origen"], a["id"]], "e": str(a.get("e", "")), "n": str(a["n"])})
	if visita.get("vid", "") == vid and visita.get("est", "") == "dentro":
		out.append({"id": "comer", "e": "", "n": hue(G["visita"]["comer"]) + ("" if hay_comida() else " — " + hue(G["visita"]["sin_comida"])), "off": not hay_comida()})
		out.append({"id": "irse", "e": "🚪", "n": hue(G["visita"]["echar"])})
	return out

func _etq(o: Dictionary) -> String:
	var n := hue(o["n"])
	var e := str(o.get("e", ""))
	# las de los datos ya traen su icono («💬 Charlar un rato»); las demás, se le pone
	if e != "" and not n.begins_with(e):
		n = e + " " + n
	return n

## acciones de data/trato.json por su oficio (si está en su puesto) o por el lugar donde está. Solo las que este juego ya sabe
## cumplir: efectos de relación y necesidades, y condiciones que se pueden mirar aquí.
const TR_FX_OK := ["rel", "social", "diversion", "hambre", "energia", "chisme"]
func acciones_trato(x: Dictionary) -> Array:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var lug := str(x.get("meta", ""))
	if lug == "" or lug == str(x.get("edif", "")) or x.get("visita", false):
		return []
	var T: Dictionary = DATA["trato"]
	var L: Array = []
	var origen := "lugar"
	var pu := ""
	var t = v.get("trabajo", null)
	if t is Dictionary and t.get("puesto", null) is Array:
		pu = str(t["puesto"][0])
	if trabajando(v, lug) and T.get("oficios", {}).has(pu):
		L = T["oficios"][pu].get("acciones", [])
		origen = "oficio"
	else:
		L = T.get("lugares", {}).get(lug, {}).get("acciones", [])
	var out: Array = []
	var rel := float(P(vid).get("rel", 0))
	for a in L:
		if rel < float(a.get("rel", 0)) or _hecho_hoy(vid, "t:" + str(a["id"])):
			continue
		var ok := true
		for k in a.get("fx", {}):
			if not (k in TR_FX_OK):
				ok = false
		for rq in a.get("req", []):
			if not _req(str(rq), v):
				ok = false
		if ok:
			var b: Dictionary = a.duplicate()
			b["origen"] = origen
			out.append(b)
	return out

func _req(rq: String, v: Dictionary) -> bool:
	match rq:
		"trabajo_dentro":
			var t = v.get("trabajo", null)
			return t is Dictionary and str(t.get("lugar", "fuera")) != "fuera"
		"ella_hijos":
			return cria(v) != {}
		"bloque":
			var H: Dictionary = jg.personas.get("hogares", {}).get(str(v.get("hogar", "")), {})
			return str(jg.personas.get("edificios", {}).get(str(H.get("edificio", "")), {}).get("tipo", "")) == "bloque"
	return false

func cria(v: Dictionary) -> Dictionary:
	for l in v.get("lazos", []):
		if str(l[1]) in ["hija", "hijo"] and censo.has(str(l[0])) and int(censo[str(l[0])]["edad"]) < 12:
			return censo[str(l[0])]
	return {}

func _op_def(id: String) -> Dictionary:
	for o in G["opciones"]:
		if str(o["id"]) == id:
			return o
	return {}

# =============== el encuentro: andar hasta ella, mirarse, hablar, tarjeta ===============
func empezar(x: Dictionary, op: String) -> void:
	var c: Actor = x["cam"]
	if not c.nodo.visible:
		jg._aviso(hue(G["ficha"]["cancelada"]))
		return
	if not llamada.is_empty():
		return
	if op == "irse":
		jg._cerrar_ficha()
		_visita_fin(true)
		return
	if op == "comer":
		jg._cerrar_ficha()
		_comer_juntas(x)
		return
	_cancelar_enc()
	jg._cerrar_ficha()
	ui.card.visible = false
	_ocupar(x)
	enc = {"x": x, "op": op, "est": "ir", "t": 0.0, "rep": 0}
	var j: Actor = jg.jugador
	if j.pos2().distance_to(c.pos2()) <= 1.7:
		jg.cola.vaciar()
		j.ruta = []
		_enc_hablar()
	else:
		_ir_enc(c)

func _ir_enc(c: Actor) -> void:
	var j: Actor = jg.jugador
	jg._ir_a_punto(_cerca(c.pos2(), j.pos2()))
	enc["fin"] = j.ruta[-1] if not j.ruta.is_empty() else j.pos2()

func _cerca(de: Vector2, desde: Vector2) -> Vector2:
	var d := desde - de
	if d.length() < 0.01:
		d = Vector2(0, 1)
	return de + d.normalized() * 1.1

## la persona deja lo que hace (la ruta queda en pausa) y no la mueve el horario mientras tanto
func _ocupar(x: Dictionary) -> void:
	x["ocupado"] = true
	var c: Actor = x["cam"]
	if not c.ruta.is_empty():
		x["ruta_pausa"] = c.ruta[-1]
		c.ruta = []

func _soltar(x: Dictionary) -> void:
	var c: Actor = x["cam"]
	c.act_anim = ""
	_bocadillo(c, "")
	if x.get("visita", false):
		return
	x["ocupado"] = false
	if x.has("ruta_pausa"):
		jg.pend_rutas.append([x, x["ruta_pausa"]])
		x.erase("ruta_pausa")

func _cancelar_enc() -> void:
	if enc.is_empty():
		return
	var x: Dictionary = enc["x"]
	jg.jugador.act_anim = ""
	_bocadillo(jg.jugador, "")
	_soltar(x)
	enc = {}

func _tick_enc(dt: float) -> void:
	var x: Dictionary = enc["x"]
	var c: Actor = x["cam"]
	var j: Actor = jg.jugador
	enc["t"] = float(enc["t"]) + dt
	if not c.nodo.visible:
		_cancelar_enc()
		jg._aviso(hue(G["ficha"]["cancelada"]))
		return
	if enc["est"] == "ir":
		if not j.ruta.is_empty() or j.anda:
			# otra orden de andar (o de la cola) cancela el encuentro
			if (not j.ruta.is_empty() and (j.ruta[-1] as Vector2).distance_to(enc.get("fin", j.ruta[-1])) > 0.6) or float(enc["t"]) > 150.0:
				_cancelar_enc()
			return
		if jg.cola.total() > 0:
			_cancelar_enc()
			return
		var d := j.pos2().distance_to(c.pos2())
		if d <= 2.4:
			_enc_hablar()
		elif int(enc["rep"]) < 2:
			enc["rep"] = int(enc["rep"]) + 1
			_ir_enc(c)
		else:
			_cancelar_enc()
			jg._aviso(hue(G["ficha"]["lejos"]))
		return
	# hablando: el bocadillo de la otra persona sale a mitad; al acabar, la tarjeta
	if not enc.get("resp_ok", false) and float(enc["t"]) >= float(enc["seg"]) * 0.42:
		enc["resp_ok"] = true
		_bocadillo(c, str(enc["resp"]))
	if float(enc["t"]) >= float(enc["seg"]):
		var r: Dictionary = enc["res"]
		j.act_anim = ""
		_bocadillo(j, "")
		_soltar(x)
		enc = {}
		if not r.is_empty():
			ui.tarjeta(str(r.get("e", "")), str(r["titulo"]), str(r["linea"]), r.get("ok", null), str(x["v"]["id"]), r["antes"], r.get("tags", []))

func _enc_hablar() -> void:
	var x: Dictionary = enc["x"]
	var c: Actor = x["cam"]
	var j: Actor = jg.jugador
	var op := str(enc["op"])
	jg.marca.visible = false
	j.mirar(c.pos2() - j.pos2())
	if c.postura == "de_pie":
		c.mirar(j.pos2() - c.pos2())
	var od := _op_def(op)
	var quien := str(R(od.get("quien", "hablar")))
	var otra := str(R(od.get("otra", "hablar")))
	var seg := float(od.get("seg", 3.6))
	var res := resolver(x, op)
	var bk: String = str(res.get("bk", op))
	var B: Dictionary = G["bocadillos"].get(bk, G["bocadillos"]["charlar"])
	var vs := vars_de(x["v"])
	var ok = res.get("ok", true)
	var resp := pick(B.get("ok" if ok != false else "ko", B.get("ok", [])), vs)
	if res.has("resp"):
		resp = str(res["resp"])
	j.act_anim = quien
	c.act_anim = otra if ok != false or op != "chiste" else "asentir_corto"
	_bocadillo(j, pick(B.get("dice", []), vs))
	enc["est"] = "hacer"
	enc["t"] = 0.0
	enc["seg"] = seg
	enc["res"] = res
	enc["resp"] = resp

## el bocadillo encima de la cabeza ("" lo quita)
func _bocadillo(a: Actor, t: String) -> void:
	var l: Label3D = a.nodo.get_meta("bocadillo") if a.nodo.has_meta("bocadillo") else null
	if t == "":
		if l != null:
			l.visible = false
		return
	if l == null:
		l = jg.etiqueta("", Vector3.ZERO, 32, Color(1, 0.9, 0.5), 380.0)
		l.reparent(a.nodo, false)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.pixel_size = 0.006
		l.render_priority = 12          # por encima de los nombres
		l.outline_render_priority = 11
		l.outline_size = 18
		a.nodo.set_meta("bocadillo", l)
	l.position = Vector3(0, a.alto_cab + 1.1, 0)
	l.pixel_size = clampf(float(jg.dist) * 0.0006, 0.005, 0.02)   # crece con la distancia, como los nombres
	l.text = "💬 " + t
	l.visible = true

# =============== lo que pasa con cada opción ===============
## aplica el resultado y devuelve {ok, e, titulo, linea, tags, antes, bk (bocadillos), resp}
func resolver(x: Dictionary, op: String) -> Dictionary:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var vs := vars_de(v)
	var E: Dictionary = G["efectos"]
	var antes := _snap(vid)
	var r := {"ok": true, "antes": antes, "e": "", "tags": []}
	var m := _mod(x)
	match op:
		"presentarse":
			if conocida(vid):
				return {}
			var ok := randf() < clampf(0.42 + m + _afinidad_ideas(v) * 0.12, 0.15, 0.92)
			_nueva(vid, 0.0)
			antes = _snap(vid)
			r["antes"] = antes
			r["tags"] = fx(vid, E["presentarse"]["ok" if ok else "ko"])
			var pr := par("@interacciones.vecinos_ficha." + ("bien" if ok else "saludo"), vs)
			r.merge({"e": "🤝" if ok else "👋", "titulo": pr[0], "linea": pr[1]}, true)
			if not ok:
				r["ok"] = null
			r["bk"] = "presentarse"
		"charlar", "visita_charlar":
			if _hecho_hoy(vid, "charlar"):
				r["tags"] = fx(vid, E["charlar"]["otra_vez"])
				r.merge({"ok": null, "e": "💬", "titulo": vs["v"], "linea": hue(G["resultados"]["charla_hoy"])}, true)
			else:
				_marcar(vid, "charlar")
				var ok := randf() < clampf(0.78 + m, 0.3, 0.97)
				var efx: Dictionary = E["visita_charlar" if visita.get("vid", "") == vid else "charlar"]["ok"] if ok else E["charlar"]["ko"]
				r["tags"] = fx(vid, efx)
				var pr := par("@interacciones.vecinos_ficha.charla", vs) if ok else par(G["resultados"]["charla_ko"], vs)
				r.merge({"e": "💬", "titulo": pr[0], "linea": pr[1] + _sube(vid, antes)}, true)
				if not ok:
					r["ok"] = null
				_descubre_caracter(vid)
			r["bk"] = "charlar"
		"chiste":
			if _hecho_hoy(vid, "chiste"):
				r["tags"] = fx(vid, E["chiste"]["otra_vez"])
				r.merge({"ok": false, "e": "😐", "titulo": vs["v"], "linea": hue(G["ficha"]["chiste_repetido"])}, true)
			else:
				_marcar(vid, "chiste")
				var car: Dictionary = G["caracter"].get(caracter(vid), {})
				var q := randf() * 4.0 + float(car.get("chiste", 0.0)) + float(G["animo"].get(animo(x), {}).get("p", 0.0)) * 5.0 + (0.5 if float(P(vid)["rel"]) > 40.0 else 0.0)
				var ok := q > 2.3
				r["tags"] = fx(vid, E["chiste"]["ok" if ok else "ko"])
				var pr := par(G["resultados"]["chiste_ok" if ok else "chiste_ko"], vs)
				r.merge({"ok": ok, "e": "😂" if ok else "😐", "titulo": pr[0], "linea": pr[1] + _sube(vid, antes)}, true)
				_descubre_caracter(vid)
		"vida":
			r.merge(_vida(x, antes), true)
		"cotillear":
			r.merge(_cotillear(x), true)
		"politica":
			r.merge(_politica(x), true)
		"ligar":
			r.merge(_ligar(x), true)
		"abrazar":
			var fa: Dictionary = E["abrazar"]["ok"].duplicate()
			if int(P(vid).get("chispa", 0)) < 1:
				fa.erase("amor")      # un abrazo de amiga no es romance
			r["tags"] = fx(vid, fa)
			var pr := par(G["resultados"]["abrazo"], vs)
			r.merge({"e": "🫂", "titulo": pr[0], "linea": pr[1]}, true)
		"discutir":
			r["tags"] = fx(vid, E["discutir"]["ok"])
			var pr := par(G["resultados"]["discusion"], vs)
			var tema := pick(G["resultados"]["temas"])
			r.merge({"ok": false, "e": "😠", "titulo": pr[0], "linea": hue(pr[1], {"p": vs["v"], "x": tema})}, true)
		_:
			if op.begins_with("t:"):
				r.merge(_accion_trato(x, op), true)
			else:
				return {}
	P(vid)["ult"] = dia()
	P(vid)["saludo"] = dia()     # ya os habéis visto hoy: no hace falta pararse a saludar
	r["antes"] = antes
	return r

## +1 cuando se sube de umbral: ya conoces su historia, ya sabes con quién se trata
func _sube(vid: String, antes: Dictionary) -> String:
	var U: Dictionary = G["umbrales"]
	var r0 := float(antes.get("rel", 0))
	var r1 := float(P(vid).get("rel", 0))
	if r0 < float(U["historia"]) and r1 >= float(U["historia"]):
		return " " + hue(G["resultados"]["sube_historia"])
	if r0 < float(U["lazos"]) and r1 >= float(U["lazos"]):
		return " " + hue(G["resultados"]["sube_lazos"])
	return ""

func _descubre_caracter(vid: String) -> void:
	if float(P(vid).get("rel", 0)) >= float(G["umbrales"]["caracter"]):
		P(vid)["sabe"]["caracter"] = true

## 1 si piensa como tú, -1 si en las antípodas, 0 si no se sabe
func _afinidad_ideas(v: Dictionary) -> float:
	var a = jg.get("ideo")
	if a == null or str(a) == "" or str(a) == "apolitica":
		return 0.0
	var d := _dist(str(a), str(v.get("ideo", "apolitica")))
	return 1.0 if d == 0 else (-1.0 if d == 3 else 0.0)

const IZQ := ["marxista", "anarquista", "socialdemocrata", "ecologista"]
const DER := ["liberal", "libertaria", "conservadora"]
func _dist(a: String, b: String) -> int:
	if a == "" or b == "" or a == "apolitica" or b == "apolitica":
		return -1
	if a == b:
		return 0
	var C: Dictionary = DATA["trato"].get("politica", {}).get("cercanas", {})
	if b in C.get(a, []) or a in C.get(b, []):
		return 1
	if (a in IZQ and b in DER) or (a in DER and b in IZQ):
		return 3
	return 2

func _vida(x: Dictionary, antes: Dictionary) -> Dictionary:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var s: Dictionary = P(vid)["sabe"]
	var vs := vars_de(v)
	var E: Dictionary = G["efectos"]["vida"]
	var V: Dictionary = G["vida"]
	var lineas: Array = []
	if _hecho_hoy(vid, "vida"):
		return {"ok": null, "e": "🏠", "titulo": hue(V["titulo"], vs), "linea": hue(G["ficha"]["ya_hoy"]), "tags": fx(vid, E["otra_vez"])}
	_marcar(vid, "vida")
	if not s.get("trabajo", false):
		s["trabajo"] = true
		lineas.append(trabajo_txt(v))
	elif not s.get("casa", false):
		s["casa"] = true
		lineas.append(hue(V["casa"], {"sitio": casa_de(v)}))
	var tags := fx(vid, E["ok"])
	_descubre_caracter(vid)
	var sube := _sube(vid, antes)
	if lineas.is_empty() and sube == "":
		lineas.append(hue(V["nada"]))
	return {"ok": true, "e": "🏠", "titulo": hue(V["titulo"], vs), "linea": " ".join(lineas) + sube, "tags": tags}

func trabajo_txt(v: Dictionary) -> String:
	var V: Dictionary = G["vida"]
	var t = v.get("trabajo", null)
	if t is Dictionary:
		var th: Array = t.get("h", [0, 0])
		var w := {"puesto": puesto(v), "desde": _hm(float(th[0])), "hasta": _hm(float(th[1]))}
		if str(t.get("lugar", "fuera")) == "fuera":
			return hue(V["trabajo_fuera"], w)
		w["sitio"] = sitio(str(t["lugar"]))
		return hue(V["trabajo"], w)
	if v.get("estudia", null) != null:
		return hue(V["estudia"], {"estudia": oficio(v)})
	return hue(V["situacion"], {"oficio": oficio(v).to_lower()})

func _cotillear(x: Dictionary) -> Dictionary:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var vs := vars_de(v)
	var C: Dictionary = DATA["trato"].get("cotilleo", {})
	var E: Dictionary = G["efectos"]["cotillear"]
	if _hecho_hoy(vid, "cotillear"):
		return {"ok": null, "e": "🗣️", "titulo": vs["v"], "linea": hue(G["ficha"]["ya_hoy"]), "bk": "cotillear"}
	_marcar(vid, "cotillear")
	var it := _chisme(v)
	if it.is_empty():
		var pr := par(C.get("nada", []), vs)
		return {"ok": null, "e": "🗣️", "titulo": pr[0], "linea": pr[1], "tags": fx(vid, E["ko"]), "bk": "cotillear"}
	return {"ok": true, "e": "🗣️", "titulo": hue(pick(C.get("titulo", [])), vs), "linea": str(it["txt"]), "tags": fx(vid, E["ok"]) + [hue(G["ficha"]["dicen"]) + ": " + str(it["x"])], "bk": "cotillear"}

## frases de una historia (como trFrases del juego web)
static func frases(h: String) -> Array:
	var out: Array = []
	var re := RegEx.new()
	re.compile("[^.!?]+[.!?]+[»\"]?")
	for m in re.search_all(h):
		var s := m.get_string().strip_edges()
		if s != "":
			out.append(s)
	return out

## algo real del censo que aún no sabías: de su gente primero, de su edificio después, del resto al final
func _chisme(v: Dictionary) -> Dictionary:
	var LZ: Dictionary = DATA["trato"].get("cotilleo", {}).get("lazo_txt", {})
	var cand: Array = []
	var vistos := {}
	var grupos: Array = [[], [], []]
	for l in v.get("lazos", []):
		grupos[0].append(str(l[0]))
	var mio := _edificio_de(v)
	for id in censo:
		if _edificio_de(censo[id]) == mio:
			grupos[1].append(id)
	grupos[2] = censo.keys()
	for gi_ in 3:
		for id in grupos[gi_]:
			if vistos.has(id) or id == str(v["id"]) or not censo.has(id):
				continue
			vistos[id] = true
			var o: Dictionary = censo[id]
			if menor(o):
				continue
			var rel := float(P(id).get("rel", 0))
			var s: Dictionary = cotis.get(id, {"h": [], "l": []})
			if rel < float(G["umbrales"]["historia"]):
				var fr := frases(str(o.get("historia", "")))
				for i in fr.size():
					if not (i in s["h"]):
						cand.append({"x": id, "k": "h", "i": i, "w": 3 - gi_})
			if rel < float(G["umbrales"]["lazos"]):
				var lz: Array = o.get("lazos", [])
				for i in lz.size():
					var y: Dictionary = censo.get(str(lz[i][0]), {})
					if not y.is_empty() and not menor(y) and LZ.has(str(lz[i][1])) and not (i in s["l"]):
						cand.append({"x": id, "k": "l", "i": i, "w": 3 - gi_})
		if cand.size() >= 4:
			break
	if cand.is_empty():
		return {}
	var tot := 0.0
	for c in cand:
		tot += float(c["w"])
	var r := randf() * tot
	var it: Dictionary = cand[0]
	for c in cand:
		r -= float(c["w"])
		if r <= 0.0:
			it = c
			break
	var xid := str(it["x"])
	var o2: Dictionary = censo[xid]
	var s2: Dictionary = cotis.get(xid, {"h": [], "l": []})
	var C: Dictionary = DATA["trato"]["cotilleo"]
	var t := ""
	if it["k"] == "h":
		s2["h"].append(it["i"])
		t = hue(pick(C["historia"]), {"v": v["n"], "x": o2["n"], "frase": frases(str(o2["historia"]))[int(it["i"])]})
	else:
		s2["l"].append(it["i"])
		var l: Array = o2["lazos"][int(it["i"])]
		var y: Dictionary = censo[str(l[0])]
		t = hue(LZ[str(l[1])][gi(y)], {"x": o2["n"], "y": y["n"]})
	cotis[xid] = s2
	return {"x": o2["n"], "txt": t}

func _edificio_de(v: Dictionary) -> String:
	return str(jg.personas.get("hogares", {}).get(str(v.get("hogar", "")), {}).get("edificio", ""))

func ideo_n(k: String) -> String:
	return str(DATA["ideologias"].get("ideologias", {}).get(k, {}).get("n", k)).to_lower()

func _politica(x: Dictionary) -> Dictionary:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var vs := vars_de(v)
	var Pl: Dictionary = DATA["trato"].get("politica", {})
	if _hecho_hoy(vid, "politica"):
		return {"ok": null, "e": "📢", "titulo": vs["v"], "linea": hue(G["ficha"]["ya_hoy"]), "bk": "politica"}
	_marcar(vid, "politica")
	var a = jg.get("ideo")
	var mia := str(a) if a != null else ""
	var suya := str(v.get("ideo", "apolitica"))
	var d := _dist(mia, suya)
	var key := "media"
	var f := {"rel": 1.5, "social": 3}
	var ok = true
	if suya == "apolitica":
		key = "apolitica" if mia != "apolitica" else "sin_ideas"
		f = {"rel": 1, "social": 3}
		ok = null
	elif d == 0:
		key = "igual"
		f = {"rel": 5, "diversion": 4, "social": 4}
	elif d == 1:
		key = "cerca"
		f = {"rel": 3, "social": 4}
	elif d == 3:
		if randf() < 0.3 + float(P(vid)["rel"]) / 300.0:
			key = "lejos_bien"
			f = {"rel": 2, "social": 3}
		else:
			key = "lejos_mal"
			f = {"rel": -4, "diversion": -4}
			ok = false
	P(vid)["sabe"]["ideo"] = true
	var pr := par(Pl.get(key, []), vs)
	var tags := fx(vid, f)
	tags.append(hue(G["politica"]["ideo"], {"ideo": ideo_n(suya)}))
	return {"ok": ok, "e": "📢", "titulo": pr[0], "linea": pr[1], "tags": tags, "bk": "politica"}

func _ligar(x: Dictionary) -> Dictionary:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var vs := vars_de(v)
	var p: Dictionary = P(vid)
	var Rz: Dictionary = G["resultados"]
	var E: Dictionary = G["efectos"]["ligar"]
	var F: Dictionary = G["ficha"]
	var mot := motivo_romance(v)
	if mot != "":
		return {"ok": null, "e": "🙈", "titulo": vs["v"], "linea": mot, "bk": "ligar", "resp": "…"}
	if _hecho_hoy(vid, "ligar"):
		return {"ok": null, "e": "🙈", "titulo": vs["v"], "linea": hue(F["ya_hoy_ligar"]), "bk": "ligar"}
	var n: Dictionary = jg.nec
	if n["higiene"] <= 30.0 or n["hambre"] <= 25.0 or n["energia"] <= 20.0:
		var motivo := hue(F["huele"]) if n["higiene"] <= 30.0 else (hue(F["hambre"]) if n["hambre"] <= 25.0 else hue(F["agotada"]))
		return {"ok": null, "e": "🙈", "titulo": vs["v"], "linea": hue(F["no_para_ligar"], {"motivo": motivo}), "bk": "ligar", "resp": "…"}
	_marcar(vid, "ligar")
	var chispa_v := float(absi(hash(vid + "s")) % 21 - 10)    # química estable con esta persona
	var ch := 0.42 + (float(p["rel"]) - 30.0) / 150.0 + chispa_v / 100.0 + _mod(x) * 0.5 + (0.12 if int(p["chispa"]) > 0 else 0.0)
	ch = clampf(ch, 0.1, 0.85)
	var antes_fase := fase(vid)
	if randf() < ch:
		p["chispa"] = int(p["chispa"]) + 1
		p["fallos"] = 0
		var tags := fx(vid, E["ok"])
		if fase(vid) == "cita" and antes_fase != "cita":
			var pc := par(Rz["ligar_cita"], vs)
			return {"ok": true, "e": "💘", "titulo": pc[0], "linea": pc[1], "tags": tags, "bk": "ligar"}
		var L: Array = Rz["ligar_ok"]
		return {"ok": true, "e": "💘", "titulo": hue(L[0], vs), "linea": pick(L.slice(1), vs), "tags": tags, "bk": "ligar"}
	p["fallos"] = int(p["fallos"]) + 1
	var f2: Dictionary = E["ko"].duplicate()
	if int(p["fallos"]) > 1:
		f2["rel"] = -4
	var tags2 := fx(vid, f2)
	if int(p["fallos"]) >= 4:
		p["no_amor"] = dia() + 30
		var Ln: Array = Rz["ligar_no"]
		return {"ok": false, "e": "💔", "titulo": hue(Ln[0], vs), "linea": hue(Ln[1], vs), "tags": tags2, "bk": "ligar"}
	var Lk: Array = Rz["ligar_ko"]
	return {"ok": false, "e": "🙈", "titulo": hue(Lk[0], vs), "linea": hue(Lk[1], vs), "tags": tags2, "bk": "ligar"}

func _accion_trato(x: Dictionary, op: String) -> Dictionary:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var vs := vars_de(v)
	var id := op.split(":")[2]
	var a: Dictionary = {}
	for b in acciones_trato(x):
		if str(b["id"]) == id:
			a = b
	if a.is_empty():
		return {"ok": null, "e": "", "titulo": vs["v"], "linea": hue(G["ficha"]["ya_hoy"])}
	_marcar(vid, "t:" + id)
	var pr_ok := 1.0 if a.get("p", null) == null else minf(0.95, float(a["p"]) + (float(P(vid)["rel"]) - float(a.get("rel", 0))) / 300.0)
	var ok := randf() < pr_ok
	var f: Dictionary = (a.get("fx", {}) if ok else a.get("fxko", {"rel": -1})).duplicate()
	var chis := int(f.get("chisme", 0))
	f.erase("chisme")
	var tags := fx(vid, f)
	var pr := par(a["ok"] if ok else a.get("ko", a["ok"]), vs)
	var linea: String = pr[1]
	for i in chis:
		var c := _chisme(v)
		if not c.is_empty():
			linea += " " + str(c["txt"])
	var res := {"e": str(a.get("e", "")), "titulo": pr[0], "linea": linea, "tags": tags, "bk": "charlar"}
	res["ok"] = true
	if not ok:
		res["ok"] = null
	return res

# =============== en el bar: charlar y contar un chiste con un cliente (cola.gd) también cuentan ===============
func gesto_bar(x: Dictionary, ac_id: String) -> void:
	if x.is_empty() or not (ac_id in ["charlar", "chiste"]):
		return
	var v: Dictionary = x["v"]
	if menor(v, 12):
		return
	var vid := str(v["id"])
	var r: Dictionary
	if not conocida(vid):
		r = resolver(x, "presentarse")
	else:
		r = resolver(x, ac_id)
	if not r.is_empty():
		ui.tarjeta(str(r.get("e", "")), str(r["titulo"]), str(r["linea"]), r.get("ok", null), vid, r["antes"], r.get("tags", []))

# =============== la ficha ===============
func ficha(x: Dictionary, solo_mirar := false) -> void:
	ui.ficha(x, solo_mirar)

## líneas de texto de la ficha
func ficha_texto(x: Dictionary, completa: bool) -> String:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var F: Dictionary = G["ficha"]
	var L: Array = []
	var cab := hue(F["edad"], {"e": int(v["edad"])})
	var con := conocida(vid)
	var s: Dictionary = P(vid).get("sabe", {})
	if menor(v, 12):
		L.append(cab)
		L.append(_de_quien(v))
		return "\n".join(L)
	if con and oficio(v) != "":
		cab += " · " + oficio(v)
	L.append(cab)
	var linea2: Array = []
	if con:
		linea2.append(fase_txt(vid))
	if x["cam"].nodo.visible and not completa:
		linea2.append(hue(F["animo"], {"a": str(G["animo"][animo(x)]["n"][gi(v)])}))
	if s.get("caracter", false):
		linea2.append(hue(F["caracter"], {"c": str(G["caracter"][caracter(vid)]["n"][gi(v)])}))
	if not linea2.is_empty():
		L.append(" · ".join(linea2))
	L.append("«%s»" % str(v.get("d", "")))
	if not con:
		L.append(hue(F["no_conoces"]))
		return "\n".join(L)
	var sab: Array = []
	if s.get("trabajo", false) and v.get("trabajo", null) is Dictionary:
		sab.append(trabajo_txt(v))
	if s.get("casa", false):
		sab.append(hue(G["vida"]["casa"], {"sitio": casa_de(v)}))
	if s.get("ideo", false):
		sab.append(hue(G["politica"]["ideo"], {"ideo": ideo_n(str(v.get("ideo", "apolitica")))}) + ".")
	var fv: Dictionary = favores.get(vid, {})
	if int(fv.get("te", 0)) > 0:
		sab.append(hue(F["te_debe_una"]) if int(fv["te"]) == 1 else hue(F["te_debe_n"], {"n": fv["te"]}))
	if not sab.is_empty():
		L.append(" ".join(sab))
	if completa:
		var rel := float(P(vid).get("rel", 0))
		var U: Dictionary = G["umbrales"]
		if rel >= float(U["historia"]) and str(v.get("historia", "")) != "":
			L.append("\n%s: %s" % [hue(F["historia"]), v["historia"]])
		else:
			L.append(hue(F["pista_historia"]))
		if rel >= float(U["lazos"]):
			var lz: Array = []
			for l in v.get("lazos", []):
				var o: Dictionary = censo.get(str(l[0]), {})
				var lb = R("@interacciones.vecinos_ficha.lazo." + str(l[1]))
				if not o.is_empty() and lb is Array:
					lz.append("%s: %s" % [lb[gi(o)], o["n"]])
			if not lz.is_empty():
				L.append("%s: %s" % [hue(F["lazos"]), ", ".join(lz)])
		elif rel >= float(U["historia"]):
			L.append(hue(F["pista_lazos"]))
		var dic := _dicen(v)
		if dic != "":
			L.append("%s: %s" % [hue(F["dicen"]), dic])
	return "\n".join(L)

## lo que te han contado de esta persona (cotilleo) y aún no te ha contado ella
func _dicen(v: Dictionary) -> String:
	var s: Dictionary = cotis.get(str(v["id"]), {})
	if s.is_empty():
		return ""
	var rel := float(P(str(v["id"])).get("rel", 0))
	var out: Array = []
	if rel < float(G["umbrales"]["historia"]):
		var fr := frases(str(v.get("historia", "")))
		for i in s.get("h", []):
			if int(i) < fr.size():
				out.append(fr[int(i)])
	if rel < float(G["umbrales"]["lazos"]):
		var LZ: Dictionary = DATA["trato"]["cotilleo"]["lazo_txt"]
		for i in s.get("l", []):
			var l: Array = v.get("lazos", [])[int(i)] if int(i) < v.get("lazos", []).size() else []
			if l.size() > 1 and censo.has(str(l[0])) and LZ.has(str(l[1])):
				var y: Dictionary = censo[str(l[0])]
				out.append(hue(LZ[str(l[1])][gi(y)], {"x": v["n"], "y": y["n"]}))
	return " ".join(out)

func _de_quien(v: Dictionary) -> String:
	var pad: Array = []
	var abu: Array = []
	for l in v.get("lazos", []):
		var o: Dictionary = censo.get(str(l[0]), {})
		if o.is_empty():
			continue
		if str(l[1]) in ["madre", "padre"]:
			pad.append(o["n"])
		elif str(l[1]) in ["abuela", "abuelo"]:
			abu.append(o["n"])
	if not pad.is_empty():
		return hue(R("@interacciones.vecinos_ficha.hijo_de")[gi(v)], {"quien": " y ".join(pad)})
	if not abu.is_empty():
		return hue(R("@interacciones.vecinos_ficha.nieto_de")[gi(v)], {"quien": " y ".join(abu)})
	return hue("@interacciones.vecinos_ficha.sin_familia")

## dónde está ahora (para la pestaña Gente)
func donde_txt(x: Dictionary) -> String:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var Gt: Dictionary = G["gente"]
	if visita.get("vid", "") == vid:
		if visita.get("est", "") == "dentro":
			return hue(Gt["contigo"])
		return hue(Gt["de_camino"], {"hora": _hm(fposmod(float(visita["min"]), 1440.0) / 60.0)})
	var lug: String = jg._lugar_de(x)
	var t := ""
	if lug == "":
		t = hue(Gt["fuera"])
	elif lug == str(x.get("edif", "")):
		t = hue(Gt["en_casa"], {"sitio": sitio(lug)})
	elif trabajando(v, lug):
		t = hue(Gt["trabajando"], {"sitio": sitio(lug)})
	else:
		t = sitio(lug)
	return hue(Gt["ahora"], {"sitio": t})

# =============== Gente: ir a verla, llamar, invitar ===============
func ir_a_ver(vid: String) -> void:
	var x: Dictionary = por_vid.get(vid, {})
	if x.is_empty():
		return
	var c: Actor = x["cam"]
	if not c.nodo.visible:
		jg._aviso(hue(G["gente"]["no_esta"]))
		return
	ui.cerrar()
	ir_a = vid
	jg._ir_a_punto(_cerca(c.pos2(), jg.jugador.pos2()))

func puede_llamar(vid: String) -> bool:
	var v: Dictionary = censo.get(vid, {})
	return conocida(vid) and not menor(v) and float(P(vid).get("rel", 0)) >= float(G["umbrales"]["llamar"])

func puede_invitar(vid: String) -> bool:
	var v: Dictionary = censo.get(vid, {})
	return conocida(vid) and not menor(v) and float(P(vid).get("rel", 0)) >= float(G["umbrales"]["invitar"]) and por_vid.has(vid)

func llamar(vid: String) -> void:
	var x: Dictionary = por_vid.get(vid, {})
	if x.is_empty() or not puede_llamar(vid):
		return
	var j: Actor = jg.jugador
	if not llamada.is_empty() or not enc.is_empty() or jg.cola.total() > 0 or j.anda or jg.velo.visible:
		jg._aviso(hue(G["llamada"]["ocupada"]))
		return
	ui.cerrar()
	jg._cerrar_ficha()
	var v: Dictionary = x["v"]
	var h: float = jg._hora_dec()
	var pk := 0.85
	var mot := ""
	if h < 9.0 or h >= 23.5:
		pk = 0.35
		mot = hue(G["llamada"]["horas_raras"])
	if float(P(vid)["rel"]) < 40.0:
		pk -= 0.2
		if mot == "":
			mot = hue(G["llamada"]["poca_confianza"])
	if trabajando(v, "*"):
		pk -= 0.3
	if mot == "":
		mot = hue(G["llamada"]["liada"]).replace("liada", "liado" if gi(v) == 1 else "liada")
	llamada = {"x": x, "t": 0.0, "coge": randf() < pk, "mot": mot, "antes": _snap(vid)}
	j.act_anim = "hablar_telefono"
	ui.tarjeta("📱", v["n"], hue(G["llamada"]["llamando"]), null, "", {}, [], 99.0)

func _tick_llamada(dt: float) -> void:
	var x: Dictionary = llamada["x"]
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var vs := vars_de(v)
	llamada["t"] = float(llamada["t"]) + dt
	var t := float(llamada["t"])
	if t < 1.6:
		return
	if not llamada["coge"]:
		jg.jugador.act_anim = ""
		ui.tarjeta("📵", hue(G["llamada"]["no_coge"], vs), str(llamada["mot"]), false, vid, llamada["antes"], [])
		llamada = {}
		return
	if t < 4.6:
		var s := int((t - 1.6) * 23.0)
		ui.tarjeta_linea(hue(G["llamada"]["en_llamada"], {"x": s / 60, "x2": "%02d" % (s % 60)}))
		return
	jg.jugador.act_anim = ""
	var E: Dictionary = G["efectos"]["llamar"]
	var otra := _hecho_hoy(vid, "llamar")
	_marcar(vid, "llamar")
	var tags := fx(vid, E["otra_vez"] if otra else E["ok"])
	P(vid)["ult"] = dia()
	var linea := hue(G["llamada"]["minutos"], {"x": 8 + randi() % 30, "x2": pick(G["llamada"]["temas"])}) if randf() < 0.5 else hue(G["llamada"]["alegra"], vs)
	ui.tarjeta("📞", hue(G["llamada"]["titulo"], vs), linea, true, vid, llamada["antes"], tags)
	llamada = {}

## invitar: viene a tu casa a una hora en que no trabaja (hoy, como tarde a las 22), se sienta y se puede charlar o comer
func invitar(vid: String, en_min := -1.0) -> void:
	var x: Dictionary = por_vid.get(vid, {})
	if x.is_empty() or not puede_invitar(vid):
		return
	var v: Dictionary = x["v"]
	var vs := vars_de(v)
	ui.cerrar()
	jg._cerrar_ficha()
	if not visita.is_empty():
		jg._aviso(hue(G["visita"]["ya_hay"]))
		return
	var h0: float = jg._hora_dec()
	var d: int = jg._dia_sem()
	var hl := -1.0
	if en_min >= 0.0:
		hl = h0 + en_min / 60.0
	else:
		var h := ceilf((h0 + 1.0) * 2.0) / 2.0
		while h <= 22.0:
			if libre(v, h, d) and libre(v, h + 1.5, d):
				hl = h
				break
			h += 0.5
	if hl < 0.0:
		ui.tarjeta("🏠", hue(G["visita"]["no_puede"], vs), hue(G["visita"]["otro_dia"]), false, vid, _snap(vid), [])
		return
	visita = {"vid": vid, "min": floorf(jg.minutos / 1440.0) * 1440.0 + hl * 60.0, "est": "pendiente"}
	ui.tarjeta("🏠", hue(G["visita"]["viene"], vs), hue(G["visita"]["vendra"], {"hora": _hm(hl)}), true, vid, _snap(vid), [])

func _casa_it() -> Interior:
	return jg.edificios.get("casa", {}).get("interior", null)

func en_casa_j() -> bool:
	var it := _casa_it()
	return it != null and jg.interior == it and jg.en_interior

func _tick_visita(_dt: float) -> void:
	var vid := str(visita["vid"])
	var x: Dictionary = por_vid.get(vid, {})
	if x.is_empty():
		visita = {}
		return
	var c: Actor = x["cam"]
	var puerta: Vector2 = jg.edificios["casa"]["puerta"]
	var it := _casa_it()
	match str(visita["est"]):
		"pendiente":
			if jg.minutos < float(visita["min"]):
				return
			if jg.minutos > float(visita["min"]) + 180.0:
				visita = {}     # la partida se cargó muy tarde: ya no viene
				return
			if jg.bar != null and jg.bar.tiene(x):
				jg.bar.quitar(x)
			_ocupar(x)
			x["visita"] = true
			x["ocultar"] = false
			x.erase("ruta_pausa")
			if not c.nodo.visible or c.pos2().distance_to(puerta) > 60.0:
				c.poner(jg.nav.centro(jg.nav.libre_cerca(puerta + Vector2(5.0, 2.0))))   # llega por la acera, a unos pasos
			c.nodo.visible = true
			x["visible"] = true
			c.poner_postura("de_pie")
			c.fijar_ruta(jg._ruta(c.pos2(), puerta), false)
			visita["est"] = "andando"
		"andando":
			if not c.ruta.is_empty():
				return
			if en_casa_j():
				_visita_entrar(x)
			else:
				visita["est"] = "puerta"
				visita["t0"] = jg.minutos
				_bocadillo(c, pick(G["bocadillos"]["visita"]["dice"]))
		"puerta":
			if en_casa_j() or jg.jugador.pos2().distance_to(puerta) < 3.0:
				_bocadillo(c, "")
				_visita_entrar(x)
			elif jg.minutos - float(visita.get("t0", jg.minutos)) > 30.0:
				var b := _snap(vid)
				var tags := fx(vid, {"rel": -3})
				var pr := par(G["visita"]["no_estabas"], vars_de(x["v"]))
				ui.tarjeta("🚪", pr[0], pr[1], false, vid, b, tags)
				_visita_fin(false)
		"entrando":
			if not c.ruta.is_empty():
				return
			var o: Objeto = visita.get("obj", null)
			var i := int(visita.get("uso", 0))
			if o != null:
				var s := o.asiento_mundo(i)
				c.poner(Vector2(s.x, s.z))
				c.nodo.rotation.y = deg_to_rad(o.giro_asiento(i))
				c.poner_postura("sentado", o.alt_asiento())
			visita["est"] = "dentro"
			visita["fin"] = jg.minutos + 150.0
			var pr := par(G["visita"]["llega"], vars_de(x["v"]))
			ui.tarjeta("🚪", pr[0], pr[1], true, vid, _snap(vid), [])
		"dentro":
			if not en_casa_j():
				visita["fuera_t"] = float(visita.get("fuera_t", 0.0)) + _dt_min
				if float(visita["fuera_t"]) > 20.0:
					_visita_fin(false)
				return
			visita["fuera_t"] = 0.0
			if jg.minutos >= float(visita["fin"]) and enc.is_empty():
				_visita_fin(true)
		"saliendo":
			if c.ruta.is_empty():
				x["visita"] = false
				x["ocupado"] = false
				x["meta"] = "__"      # que el horario la vuelva a colocar
				visita = {}

func _visita_entrar(x: Dictionary) -> void:
	var c: Actor = x["cam"]
	var it := _casa_it()
	var o: Objeto = null
	var uso := -1
	if it != null:
		for t in ["sofa", "mesa_comedor", "silla"]:
			for ob in it.de_tipo(t):
				var u: int = ob.uso_libre()
				if u >= 0 and ob.n_usos() > 0:
					o = ob
					uso = u
					break
			if o != null:
				break
	visita["est"] = "entrando"
	if o == null:
		c.fijar_ruta(jg._ruta(c.pos2(), Vector2(it.puerta.x, it.puerta.y - 2.0) if it != null else c.pos2()), false)
		return
	o.ocupado[uso] = c
	visita["obj"] = o
	visita["uso"] = uso
	c.fijar_ruta(jg._ruta(c.pos2(), o.punto_uso(uso)), false)

func _visita_fin(con_tarjeta: bool) -> void:
	if visita.is_empty():
		return
	var vid := str(visita["vid"])
	var x: Dictionary = por_vid.get(vid, {})
	if x.is_empty():
		visita = {}
		return
	var c: Actor = x["cam"]
	var o: Objeto = visita.get("obj", null)
	if o != null:
		o.ocupado.erase(int(visita.get("uso", 0)))
		c.poner(o.punto_uso(int(visita.get("uso", 0))))
	c.poner_postura("de_pie")
	_bocadillo(c, "")
	c.act_anim = ""
	if con_tarjeta:
		var pr := par(G["visita"]["se_va"], vars_de(x["v"]))
		ui.tarjeta("👋", pr[0], pr[1], null, vid, _snap(vid), [])
	var puerta: Vector2 = jg.edificios["casa"]["puerta"]
	c.fijar_ruta(jg._ruta(c.pos2(), puerta + Vector2(0, 3.0)), false)
	visita = {"vid": vid, "est": "saliendo", "min": visita.get("min", 0.0)}

## comer juntas: hace falta comida en casa. Gancho para COMPRAS: si main tiene comida_para_invitar() -> bool y
## gastar_comida_invitar(), se usan; si no, vale el plato que la jugadora lleve en la mano (cocina).
func hay_comida() -> bool:
	if jg.has_method("comida_para_invitar"):
		return bool(jg.comida_para_invitar())
	return jg.jugador.mano == "plato"

func _gastar_comida() -> void:
	if jg.has_method("gastar_comida_invitar"):
		jg.gastar_comida_invitar()
	else:
		jg.jugador.poner_mano("", jg)

func _comer_juntas(x: Dictionary) -> void:
	if not hay_comida():
		jg._aviso(hue(G["visita"]["sin_comida"]))
		return
	var vid := str(x["v"]["id"])
	_gastar_comida()
	var c: Actor = x["cam"]
	c.act_anim = "comer"
	var b := _snap(vid)
	jg._cerrar_ficha_y_saltar(40.0, hue(G["visita"]["comiendo"]), func():
		c.act_anim = ""
		var tags := fx(vid, G["efectos"]["comer"]["ok"])
		jg.estado_casa["platos_sucios"] = true
		var pr := par(G["visita"]["comida"], vars_de(x["v"]))
		print("rel_comer: ok")
		ui.tarjeta("🍲", pr[0], pr[1], true, vid, b, tags))

# =============== los vecinos te buscan ===============
func _saludos() -> void:
	var j: Actor = jg.jugador
	if not enc.is_empty() or jg.velo.visible or jg.dentro or _reloj - _ult_saludo < 12.0:
		return
	var U := float(G["umbrales"]["saludar"])
	for vid in per:
		if float(per[vid].get("rel", 0)) < U or int(per[vid].get("saludo", -1)) == dia():
			continue
		var x: Dictionary = por_vid.get(vid, {})
		if x.is_empty() or x.get("ocupado", false):
			continue
		var c: Actor = x["cam"]
		if not c.nodo.visible or c.postura != "de_pie" or c.pos2().distance_to(j.pos2()) > 6.5:
			continue
		if jg.bar != null and jg.bar.tiene(x):
			continue
		per[vid]["saludo"] = dia()
		_ult_saludo = _reloj
		_ocupar(x)
		c.mirar(j.pos2() - c.pos2())
		c.act_anim = "saludar"
		_bocadillo(c, pick(G["bocadillos"]["saludo"]["dice"]))
		if not j.anda and jg.cola.total() == 0 and llamada.is_empty():
			j.mirar(c.pos2() - j.pos2())
			j.act_anim = "saludar"
		fx(vid, G["efectos"]["saludo"]["ok"])
		saludos.append({"x": x, "t": 0.0})
		jg._aviso("👋 " + par(G["resultados"]["saludo"], vars_de(x["v"]))[0])
		return

func _tick_saludos(dt: float) -> void:
	for s in saludos.duplicate():
		s["t"] = float(s["t"]) + dt
		if float(s["t"]) > 2.4:
			saludos.erase(s)
			_soltar(s["x"])
			if jg.jugador.act_anim == "saludar":
				jg.jugador.act_anim = ""

## una vez al día puede que alguien de confianza venga a pedirte un favor sencillo (data/trato.json → favores, los «pide»)
func _planear_favor() -> void:
	dia_plan = dia()
	plan_favor = {}
	if randf() > float(G["favores"].get("prob_dia", 0.5)):
		return
	var cand: Array = []
	for vid in per:
		var x: Dictionary = por_vid.get(vid, {})
		var v: Dictionary = censo.get(vid, {})
		if x.is_empty() or menor(v) or float(per[vid].get("rel", 0)) < float(G["umbrales"]["favor"]):
			continue
		if int(favores.get(vid, {}).get("ult", -99)) > dia() - 6:
			continue
		for id in G["favores"]["pide"]:
			var f: Dictionary = DATA["trato"].get("favores", {}).get(id, {})
			if f.is_empty() or float(per[vid]["rel"]) < float(f.get("rel", 0)):
				continue
			var ok := true
			for rq in f.get("req", []):
				if not _req(str(rq), v):
					ok = false
			if ok:
				cand.append([vid, id])
	if cand.is_empty():
		return
	var c: Array = cand[randi() % cand.size()]
	plan_favor = {"vid": c[0], "id": c[1], "h": randf_range(10.0, 20.0), "dia": dia()}

func _tick_favor() -> void:
	if plan_favor.is_empty() or not busca.is_empty():
		return
	if int(plan_favor.get("dia", -1)) != dia():
		plan_favor = {}
		return
	var h: float = jg._hora_dec()
	if h < float(plan_favor["h"]):
		return
	var x: Dictionary = por_vid.get(str(plan_favor["vid"]), {})
	var listo: bool = not x.is_empty() and x["cam"].nodo.visible and not x.get("ocupado", false) and not jg.en_interior and not jg.dentro \
		and enc.is_empty() and visita.get("vid", "") != str(plan_favor["vid"]) and not jg.velo.visible and x["cam"].pos2().distance_to(jg.jugador.pos2()) < 90.0
	if not listo:
		plan_favor["h"] = float(plan_favor["h"]) + 0.5
		if float(plan_favor["h"]) > 21.0:
			plan_favor = {}
		return
	if jg.bar != null and jg.bar.tiene(x):
		jg.bar.quitar(x)
	_ocupar(x)
	x["visita"] = true      # la ruta la llevo yo
	busca = {"x": x, "id": str(plan_favor["id"]), "t": 0.0, "rt": 0.0}
	favores[str(plan_favor["vid"])] = favores.get(str(plan_favor["vid"]), {"te": 0})
	favores[str(plan_favor["vid"])]["ult"] = dia()
	plan_favor = {}

func _tick_busca(dt: float) -> void:
	var x: Dictionary = busca["x"]
	var c: Actor = x["cam"]
	var j: Actor = jg.jugador
	busca["t"] = float(busca["t"]) + dt
	if busca.get("est", "") == "pide":
		if not jg.panel_ficha.visible:
			_busca_fin()
		return
	if float(busca["t"]) > 60.0 or jg.en_interior or jg.dentro or not c.nodo.visible:
		_busca_fin()
		return
	if c.pos2().distance_to(j.pos2()) <= 1.9:
		c.ruta = []
		c.mirar(j.pos2() - c.pos2())
		if not j.anda:
			j.mirar(c.pos2() - j.pos2())
		busca["est"] = "pide"
		_bocadillo(c, pick(G["bocadillos"]["favor"]["dice"]))
		ui.ficha_favor(x, str(busca["id"]), _favor_vars(x["v"], str(busca["id"])))
		return
	busca["rt"] = float(busca["rt"]) - dt
	if float(busca["rt"]) <= 0.0:
		busca["rt"] = 1.5
		c.fijar_ruta(jg._ruta(c.pos2(), _cerca(j.pos2(), c.pos2())), true)

func _busca_fin() -> void:
	if busca.is_empty():
		return
	var x: Dictionary = busca["x"]
	if per.has(str(x["v"]["id"])):
		per[str(x["v"]["id"])]["saludo"] = dia()     # ya os habéis visto hoy
	x["visita"] = false
	_soltar(x)
	busca = {}

func _favor_vars(v: Dictionary, id: String) -> Dictionary:
	var vs := vars_de(v)
	if id == "cuidar":
		var k := cria(v)
		vs["k"] = k.get("n", "")
	if id == "firmar":
		var mio := _edificio_de(v)
		var L: Array = []
		for oid in censo:
			if oid != str(v["id"]) and _edificio_de(censo[oid]) == mio and not menor(censo[oid]):
				L.append(censo[oid]["n"])
		vs["x"] = L[absi(hash(str(v["id"]) + "f")) % L.size()] if not L.is_empty() else "una vecina del bloque"
	return vs

## respuesta al favor: «ya» se cumple ahí mismo; «visita», andando hasta su portal y pasando allí el rato
func responder_favor(x: Dictionary, id: String, si: bool) -> void:
	var v: Dictionary = x["v"]
	var vid := str(v["id"])
	var f: Dictionary = DATA["trato"]["favores"][id]
	var vs := _favor_vars(v, id)
	jg._cerrar_ficha()
	_busca_fin()
	if per.has(vid):
		per[vid]["saludo"] = dia()
	var b := _snap(vid)
	if not si:
		var pr := par(f["rechazo"], vs)
		ui.tarjeta("🤷", pr[0], pr[1], null, vid, b, fx(vid, f.get("fxno", {})))
		return
	if str(f.get("modo", "ya")) == "ya":
		_cumplir(vid, id, b)
		return
	var edif := str(x.get("edif", ""))
	if not jg.edificios.has(edif):
		_cumplir(vid, id, b)
		return
	favor_ir = {"vid": vid, "id": id, "b": b, "t": 0.0}
	jg._ir_a_punto(jg.edificios[edif]["puerta"])
	jg._aviso(hue(G["favores"]["yendo"], vs))

func _cumplir(vid: String, id: String, b: Dictionary) -> void:
	var f: Dictionary = DATA["trato"]["favores"][id]
	var vs := _favor_vars(censo[vid], id)
	var tags := fx(vid, f.get("fx", {}))
	var pr := par(f["ok"], vs)
	ui.tarjeta(str(f.get("e", "🙏")), pr[0], pr[1], true, vid, b, tags)

func _tick_favor_ir(dt: float) -> void:
	var j: Actor = jg.jugador
	favor_ir["t"] = float(favor_ir["t"]) + dt
	if not j.ruta.is_empty() or j.anda:
		if float(favor_ir["t"]) > 90.0:
			favor_ir = {}
		return
	var vid := str(favor_ir["vid"])
	var x: Dictionary = por_vid.get(vid, {})
	var id := str(favor_ir["id"])
	var b: Dictionary = favor_ir["b"]
	favor_ir = {}
	if x.is_empty() or j.pos2().distance_to(jg.edificios[str(x["edif"])]["puerta"]) > 4.0:
		return
	var dm := float(G["favores"]["visita_min"].get(id, 120))
	jg._cerrar_ficha_y_saltar(dm, hue(G["favores"]["yendo"], vars_de(x["v"])).replace("…", ""), func(): _cumplir(vid, id, b))

# =============== bucle ===============
var _dt_min := 0.0
var _min_ant := -1.0
func tick(dt: float) -> void:
	_reloj += dt
	_dt_min = 0.0 if _min_ant < 0.0 else maxf(0.0, jg.minutos - _min_ant)
	_min_ant = jg.minutos
	if not enc.is_empty():
		_tick_enc(dt)
	if not saludos.is_empty():
		_tick_saludos(dt)
	if not llamada.is_empty():
		_tick_llamada(dt)
	if not visita.is_empty():
		_tick_visita(dt)
	if not busca.is_empty():
		_tick_busca(dt)
	if not favor_ir.is_empty():
		_tick_favor_ir(dt)
	if ir_a != "" and jg.jugador.ruta.is_empty() and not jg.jugador.anda:
		var x: Dictionary = por_vid.get(ir_a, {})
		ir_a = ""
		if not x.is_empty() and x["cam"].nodo.visible and x["cam"].pos2().distance_to(jg.jugador.pos2()) < 4.0:
			ficha(x)
	# la ruta que el horario le dé a quien está ocupada queda en pausa
	_lento += dt
	if _lento >= 1.0:
		_lento = 0.0
		for vid in per:
			var x: Dictionary = por_vid.get(vid, {})
			if not x.is_empty() and x.get("ocupado", false) and not x.get("visita", false) and not x["cam"].ruta.is_empty():
				x["ruta_pausa"] = x["cam"].ruta[-1]
				x["cam"].ruta = []
		if dia_plan != dia():
			_planear_favor()
		_tick_favor()
		_saludos()
	ui.tick(dt)

func en_ui(p: Vector2) -> bool:
	return ui != null and ui.en_ui(p)

# =============== guardado (sección «relaciones») ===============
func _guardar() -> Dictionary:
	var vis := {}
	if visita.get("est", "") == "pendiente":
		vis = {"vid": visita["vid"], "min": visita["min"], "est": "pendiente"}
	return {"per": per.duplicate(true), "cotis": cotis.duplicate(true), "favores": favores.duplicate(true), "visita": vis,
		"plan_favor": plan_favor.duplicate(), "dia_plan": dia_plan}

func _aplicar(d: Dictionary) -> void:
	var pd = d.get("per", {})
	if pd is Dictionary:
		per = {}
		for vid in pd:
			var q = pd[vid]
			if not (q is Dictionary) or not censo.has(str(vid)):
				continue
			var p := {"rel": clampf(float(q.get("rel", 0)), 0, 100), "amor": clampf(float(q.get("amor", 0)), 0, 100),
				"chispa": int(q.get("chispa", 0)), "fallos": int(q.get("fallos", 0)), "no_amor": int(q.get("no_amor", -1)),
				"sabe": q.get("sabe", {}) if q.get("sabe", {}) is Dictionary else {}, "cd": {}, "desde": int(q.get("desde", 0)),
				"ult": int(q.get("ult", 0)), "saludo": int(q.get("saludo", -1))}
			var cd = q.get("cd", {})
			if cd is Dictionary:
				for k in cd:
					p["cd"][str(k)] = int(cd[k])
			if menor(censo[str(vid)]):
				p["amor"] = 0.0
				p["chispa"] = 0
			per[str(vid)] = p
	var cs = d.get("cotis", {})
	if cs is Dictionary:
		cotis = {}
		for vid in cs:
			if censo.has(str(vid)) and cs[vid] is Dictionary:
				var h: Array = []
				var l: Array = []
				for i in cs[vid].get("h", []):
					h.append(int(i))
				for i in cs[vid].get("l", []):
					l.append(int(i))
				cotis[str(vid)] = {"h": h, "l": l}
	var fv = d.get("favores", {})
	if fv is Dictionary:
		favores = {}
		for vid in fv:
			if fv[vid] is Dictionary:
				favores[str(vid)] = {"te": int(fv[vid].get("te", 0)), "ult": int(fv[vid].get("ult", -99))}
	var vi = d.get("visita", {})
	visita = {}
	if vi is Dictionary and vi.get("est", "") == "pendiente" and por_vid.has(str(vi.get("vid", ""))):
		visita = {"vid": str(vi["vid"]), "min": float(vi.get("min", 0)), "est": "pendiente"}
	var pf = d.get("plan_favor", {})
	plan_favor = {}
	if pf is Dictionary and pf.has("vid") and por_vid.has(str(pf["vid"])):
		plan_favor = {"vid": str(pf["vid"]), "id": str(pf.get("id", "")), "h": float(pf.get("h", 12)), "dia": int(pf.get("dia", -1))}
	dia_plan = int(d.get("dia_plan", dia_plan))

# =============== puente de pruebas (casita_cmd) ===============
func cmd(c: String, args: Array) -> bool:
	var a = args[1] if args.size() > 1 else null
	match c:
		"rel_vis":
			var t: Array = []
			for i in jg.vecinos.size():
				var x: Dictionary = jg.vecinos[i]
				if x["cam"].nodo.visible:
					var q: Vector2 = x["cam"].pos2()
					t.append("%d:%s:%d:%s:%d:%d:%d" % [i, x["v"]["id"], int(q.distance_to(jg.jugador.pos2())), x.get("meta", ""), int(q.x), int(q.y), int(x["v"]["edad"])])
			print("rel_vis: ", " ".join(t))
		"rel_estado":
			var t2 := {}
			for vid in per:
				t2[vid] = {"rel": snappedf(float(per[vid]["rel"]), 0.1), "amor": snappedf(float(per[vid]["amor"]), 0.1), "fase": fase(vid), "sabe": per[vid]["sabe"]}
			var vpos := ""
			if por_vid.has(visita.get("vid", "")):
				var cv: Actor = por_vid[visita["vid"]]["cam"]
				vpos = "%d,%d r%d %s" % [int(cv.pos2().x), int(cv.pos2().y), cv.ruta.size(), cv.postura]
			print("rel_estado: ", JSON.stringify({"per": t2, "visita": {"vid": visita.get("vid", ""), "est": visita.get("est", ""), "pos": vpos}, "enc": enc.get("est", ""),
				"busca": busca.get("est", "ir") if not busca.is_empty() else "", "plan": plan_favor, "cotis": cotis.size(), "social": snappedf(jg.nec["social"], 0.1)}))
		"rel_op":
			var x: Dictionary = jg.vecinos[int(a)]
			var ops: Array = []
			for o in opciones(x):
				ops.append(o["id"])
			print("rel_op: %s opciones=%s" % [str(args[2]), ",".join(ops)])
			if str(args[2]) in ops:
				empezar(x, str(args[2]))
		"rel_set":
			var x2: Dictionary = jg.vecinos[int(a)]
			var vid2 := str(x2["v"]["id"])
			if not conocida(vid2):
				_nueva(vid2, 0.0)
			per[vid2]["rel"] = float(args[2])
			if args.size() > 3:
				per[vid2]["amor"] = float(args[3])
			print("rel_set: %s %s" % [vid2, str(per[vid2]["rel"])])
		"rel_ficha":
			ficha(jg.vecinos[int(a)], args.size() > 2 and bool(args[2]))
		"gente":
			ui.abrir()
		"gente_ui":
			print("gente_ui: ", ui.rects())
		"rel_ir":
			ir_a_ver(str(jg.vecinos[int(a)]["v"]["id"]))
		"rel_llamar":
			llamar(str(jg.vecinos[int(a)]["v"]["id"]))
		"rel_invitar":
			invitar(str(jg.vecinos[int(a)]["v"]["id"]), float(args[2]) if args.size() > 2 else -1.0)
		"rel_favor":
			var x3: Dictionary = jg.vecinos[int(a)]
			plan_favor = {"vid": str(x3["v"]["id"]), "id": str(args[2]), "h": 0.0, "dia": dia()}
			dia_plan = dia()
			_tick_favor()
			print("rel_favor: %s" % ("viene" if not busca.is_empty() else "no"))
		"rel_saludo":
			_ult_saludo = -100.0
			_saludos()
			print("rel_saludo: %d" % saludos.size())
		"rel_cerca":
			# la jugadora, a dos pasos de esa persona (en una celda libre)
			var c5: Actor = jg.vecinos[int(a)]["cam"]
			var q5: Vector2 = c5.pos2() + Vector2(float(args[2]) if args.size() > 2 else 0.0, float(args[3]) if args.size() > 3 else 2.2)
			var pc: Vector2 = jg.nav.centro(jg.nav.libre_cerca(q5))
			jg.jugador.poner(pc)
			jg.jugador.ruta = []
			jg.pivote.position = jg.jugador.nodo.position
			print("rel_cerca: %d,%d" % [int(pc.x), int(pc.y)])
		"rel_resp":
			# responder al favor que te están pidiendo (1 sí, 0 no)
			if not busca.is_empty():
				responder_favor(busca["x"], str(busca["id"]), int(a) == 1)
			print("rel_resp: ", a)
		"menu_rect":
			# centro en pantalla de un botón del panel «Menú» por su texto (las pruebas no dependen del orden)
			var out := "-"
			if jg.guardado.panel != null:
				for b in jg.guardado.panel.get_child(0).get_children():
					if b is Button and b.is_visible_in_tree() and str(b.text).begins_with(str(a)):
						var r: Rect2 = b.get_global_rect()
						out = "%d,%d" % [int(r.get_center().x), int(r.get_center().y)]
			print("menu_rect: ", out)
		"rel_pant":
			var x4: Dictionary = jg.vecinos[int(a)]
			var sp: Vector2 = jg.camara.unproject_position(x4["cam"].nodo.global_position + Vector3(0, 0.9, 0))
			print("rel_pant: %d,%d" % [int(sp.x), int(sp.y)])
		_:
			return false
	return true
