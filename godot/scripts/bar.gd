class_name BarCtl
extends RefCounted
# El Bar Manolo vivo: camarero del censo, clientes que entran, piden, se sientan, beben, charlan y se van.
# Todo el tiempo va en minutos de juego (dm). Los vecinos los crea y los mueve main.gd; aquí solo se dirige su conducta dentro.
const MAX_CLIENTES := 8
var jg
var it: Interior
var clientes: Array = []     # {x, a (Actor), obj (Objeto cliente), est, t, pedido, slot, asiento, job}
var personal: Array = []     # {x, a, puesto}
var jobs: Array = []         # trabajos del camarero: {prod, listo, cust_x, cancelado}
var cam_job: Dictionary = {}
var cam_est := "libre"
var cam_t := 0.0
var camarero: Dictionary = {}

func _init(j, interior: Interior) -> void:
	jg = j
	it = interior

func _barra() -> Objeto:
	return it.por_id["barra"]

func _pt(nombre: String) -> Vector2:
	var q: Array = it.def["puntos"][nombre]
	return Vector2(it.puerta.x + float(q[0]), it.puerta.y - float(q[1]))

func exterior() -> Vector2:
	return Vector2(it.puerta.x, it.puerta.y + 2.2)

func camarero_listo() -> Actor:
	if camarero.is_empty():
		return null
	var a: Actor = camarero["a"]
	return a if a.nodo.visible and it.dentro(a.pos2()) else null

# ---- entrada y salida de vecinos del censo ----
func tiene(x: Dictionary) -> bool:
	for c in clientes:
		if c["x"] == x:
			return true
	for p in personal:
		if p["x"] == x:
			return true
	return false

func admitir(x: Dictionary, salto: bool) -> void:
	if tiene(x) or x.get("bar_fuera", false):
		return
	var a: Actor = x["cam"]
	var t = x["v"].get("trabajo", null)
	var es_personal: bool = t != null and t["lugar"] == "bar"
	if es_personal:
		var puesto := str(t["puesto"][0])
		var rec := {"x": x, "a": a, "puesto": puesto}
		personal.append(rec)
		if puesto.begins_with("camare"):
			camarero = rec
		var idx := personal.size() - 1
		var q: Vector2 = _pt("sitio_camarero") if puesto.begins_with("camare") else _pt_personal(idx)
		a.poner(exterior() if not salto else q)
		a.nodo.visible = true
		x["visible"] = true
		a.fijar_ruta(jg.nav.camino(a.pos2(), q), false)
		return
	if clientes.size() >= MAX_CLIENTES:
		var p0 := exterior() + Vector2(float(hash(x["v"]["id"]) % 5 - 2), 0.0)
		a.poner(p0)
		a.nodo.visible = true
		x["visible"] = true
		return
	var o := Objeto.new()
	o.tipo = "cliente"
	o.def = jg.tipos_obj["cliente"]
	o.interior = "bar"
	o.actor = a
	o.id = "cliente_" + str(x["v"]["id"])
	var c := {"x": x, "a": a, "obj": o, "est": "entrando", "t": 0.0, "pedido": "", "slot": -1, "asiento": null, "job": {}}
	o.cli = c
	clientes.append(c)
	a.nodo.visible = true
	x["visible"] = true
	a.poner(exterior() + Vector2(float(hash(x["v"]["id"]) % 3 - 1), 0.5))
	_a_barra(c)

func _pt_personal(i: int) -> Vector2:
	var q: Array = it.def["puntos"]["personal"]
	var k: Array = q[i % q.size()]
	return Vector2(it.puerta.x + float(k[0]), it.puerta.y - float(k[1]))

func quitar(x: Dictionary) -> void:
	for c in clientes.duplicate():
		if c["x"] == x:
			_liberar(c)
			c["a"].poner_postura("de_pie")
			c["a"].poner_mano("", jg)
			_limpiar_etq(c["a"])
			clientes.erase(c)
	for p in personal.duplicate():
		if p["x"] == x:
			personal.erase(p)
			if camarero.get("x", null) == x:
				camarero = {}

func _limpiar_etq(a: Actor) -> void:
	if a.pedido_etq != null:
		a.pedido_etq.visible = false
	if a.estado_etq != null:
		a.estado_etq.visible = false
	a.progreso(-1.0, jg)

func _liberar(c: Dictionary) -> void:
	if c["slot"] >= 0:
		_barra().ocupado.erase(c["slot"])
		c["slot"] = -1
	if c["asiento"] != null:
		var s: Objeto = c["asiento"]
		s.ocupado.erase(0)
		c["asiento"] = null

# ---- trabajos del camarero ----
func pedido_jugador(prod: String, obj: Objeto, slot: int) -> Dictionary:
	var j := {"prod": prod, "listo": false, "cust": obj.punto_uso(slot).x, "cancelado": false}
	jobs.append(j)
	return j

func cancelar_job(j: Dictionary) -> void:
	if not j.is_empty():
		j["cancelado"] = true

func servido(cl: Dictionary, mano: String) -> void:
	cl["pedido"] = ""
	cl["mano"] = mano
	var a: Actor = cl["a"]
	a.poner_mano(mano, jg)
	if a.pedido_etq != null:
		a.pedido_etq.visible = false
	cl["est"] = "a_asiento"

# ---- clientes ----
func _a_barra(c: Dictionary) -> void:
	var b := _barra()
	var i := b.uso_libre()
	if i < 0:
		i = 0
	c["slot"] = i
	b.ocupado[i] = c["a"]
	var a: Actor = c["a"]
	a.fijar_ruta(jg.nav.camino(a.pos2(), b.punto_uso(i)), false)
	c["est"] = "a_barra"

func _quiere(c: Dictionary) -> String:
	var h := hash(str(c["x"]["v"]["id"]) + str(int(jg.minutos / 120.0)))
	var r := h % 10
	return "cana" if r < 6 else ("cafe" if r < 8 else "coctel")

func _llegado(a: Actor) -> bool:
	return a.ruta.is_empty() and not a.anda

func tick(dm: float) -> void:
	_tick_camarero(dm)
	for c in clientes.duplicate():
		_tick_cliente(c, dm)
	# el personal que no es camarero se queda en su sitio
	for p in personal:
		var a: Actor = p["a"]
		if a.ruta.is_empty() and a.postura == "de_pie" and a.nodo.visible:
			pass

func _tick_cliente(c: Dictionary, dm: float) -> void:
	var a: Actor = c["a"]
	match c["est"]:
		"a_barra":
			if _llegado(a):
				a.mirar(Vector2(0, -1))
				c["est"] = "pidiendo"
				c["t"] = 0.0
				c["pedido"] = _quiere(c)
				if a.pedido_etq == null:
					a.pedido_etq = jg.etiqueta("", Vector3(0, 2.6, 0), 40, Color.WHITE)
					a.pedido_etq.reparent(a.nodo, false)
					a.pedido_etq.position = Vector3(0, 2.6, 0)
					a.pedido_etq.pixel_size = 0.008
				a.pedido_etq.text = "%s" % Acciones.D["productos"][c["pedido"]]["e"]
				a.pedido_etq.visible = true
				if not jg.trabaja_bar and camarero_listo() != null:
					c["job"] = {"prod": c["pedido"], "listo": false, "cust": a.pos2().x, "cancelado": false}
					jobs.append(c["job"])
		"pidiendo":
			c["t"] += dm
			if c["job"].get("listo", false):
				servido(c, c["pedido"])
			elif not jg.trabaja_bar and c["job"].is_empty() and camarero_listo() != null:
				c["job"] = {"prod": c["pedido"], "listo": false, "cust": a.pos2().x, "cancelado": false}
				jobs.append(c["job"])
			elif c["t"] > 60.0:
				_irse(c)
		"a_asiento":
			if c["asiento"] == null:
				var s := _asiento_libre()
				if s == null:
					c["est"] = "bebiendo"   # de pie, con la bebida
					c["t"] = 20.0
					return
				c["asiento"] = s
				s.ocupado[0] = a
				_liberar_slot(c)
				a.fijar_ruta(jg.nav.camino(a.pos2(), s.punto_uso(0)), false)
			elif _llegado(a):
				var s: Objeto = c["asiento"]
				var p := s.asiento_mundo()
				a.poner(Vector2(p.x, p.z))
				a.nodo.rotation.y = deg_to_rad(s.giro)
				a.poner_postura("sentado")
				c["est"] = "bebiendo"
				c["t"] = 25.0 + float(hash(str(c["x"]["v"]["id"])) % 15)
		"bebiendo":
			c["t"] -= dm
			if c["t"] <= 0.0:
				a.poner_mano("", jg)
				c["est"] = "charlando"
				c["t"] = 14.0 + float(hash(str(c["x"]["v"]["id"]) + "c") % 10)
				if a.estado_etq == null:
					a.estado_etq = jg.etiqueta("💬", Vector3(0, 2.6, 0), 40, Color.WHITE)
					a.estado_etq.reparent(a.nodo, false)
					a.estado_etq.position = Vector3(0, 2.6, 0)
					a.estado_etq.pixel_size = 0.008
				a.estado_etq.text = "💬"
				a.estado_etq.visible = true
		"charlando":
			c["t"] -= dm
			if c["t"] <= 0.0:
				_irse(c)
		"saliendo":
			if _llegado(a):
				a.nodo.visible = false
				c["x"]["visible"] = false
				c["x"]["bar_fuera"] = true
				quitar(c["x"])

func _liberar_slot(c: Dictionary) -> void:
	if c["slot"] >= 0:
		_barra().ocupado.erase(c["slot"])
		c["slot"] = -1

func _irse(c: Dictionary) -> void:
	var a: Actor = c["a"]
	if c["asiento"] != null:
		var s: Objeto = c["asiento"]
		a.poner(s.punto_uso(0))
	_liberar(c)
	a.poner_postura("de_pie")
	a.poner_mano("", jg)
	_limpiar_etq(a)
	a.fijar_ruta(jg.nav.camino(a.pos2(), exterior()), false)
	c["est"] = "saliendo"

func _asiento_libre() -> Objeto:
	for o in it.objetos:
		if (o.tipo == "taburete" or o.tipo == "silla") and o.uso_libre() != -1:
			return o
	return null

# ---- camarero ----
func _tick_camarero(dm: float) -> void:
	if camarero.is_empty():
		return
	var a: Actor = camarero["a"]
	if not a.nodo.visible:
		return
	match cam_est:
		"libre":
			# trabajos pendientes (los cancelados se tiran)
			while not jobs.is_empty() and jobs[0].get("cancelado", false):
				jobs.pop_front()
			if not jobs.is_empty() and it.dentro(a.pos2()):
				cam_job = jobs.pop_front()
				var s: Objeto = it.por_id[Acciones.D["productos"][cam_job["prod"]]["sitio"]]
				a.fijar_ruta(jg.nav.camino(a.pos2(), s.punto_uso(0)), false)
				cam_est = "ir_disp"
		"ir_disp":
			if _llegado(a):
				a.mirar(Vector2(0, -1))
				cam_est = "prep"
				cam_t = float(Acciones.D["productos"][cam_job["prod"]]["min_prep"])
				cam_job["total"] = cam_t
		"prep":
			cam_t -= dm
			a.progreso(1.0 - cam_t / maxf(0.1, float(cam_job["total"])), jg)
			if cam_t <= 0.0:
				a.progreso(-1.0, jg)
				var b := _barra()
				a.fijar_ruta(jg.nav.camino(a.pos2(), Vector2(clampf(cam_job["cust"], b.pos.x - 3.0, b.pos.x + 3.0), b.pos.y - 1.1)), false)
				cam_est = "ir_serv"
		"ir_serv":
			if _llegado(a):
				a.mirar(Vector2(0, 1))
				cam_job["listo"] = true
				cam_job = {}
				cam_est = "volver"
				a.fijar_ruta(jg.nav.camino(a.pos2(), _pt("sitio_camarero")), false)
		"volver":
			if _llegado(a):
				cam_est = "libre"
