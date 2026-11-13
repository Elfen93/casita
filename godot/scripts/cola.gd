class_name Cola
extends RefCounted
# Cola de acciones del jugador (hasta 6, como Los Sims). Cada acción: ir al punto de uso, colocarse, hacerla con barra
# de progreso y aplicar efectos. Los iconos de la cola los dibuja main.gd; tocar uno lo cancela.
const MAX := 6
var jg
var items: Array = []        # pendientes: {obj, ac}
var act: Dictionary = {}     # la que se está haciendo (vacía si ninguna)
var uso := -1

func _init(j) -> void:
	jg = j

func total() -> int:
	return items.size() + (1 if not act.is_empty() else 0)

func lista_iconos() -> Array:
	var r: Array = []
	if not act.is_empty():
		r.append(act["ac"].get("e", "▶"))
	for it in items:
		r.append(it["ac"].get("e", "▶"))
	return r

func añadir(obj: Objeto, ac: Dictionary) -> bool:
	if total() >= MAX:
		jg._aviso("La cola está llena (6).")
		return false
	items.append({"obj": obj, "ac": ac})
	return true

func cancelar(i: int) -> void:
	if not act.is_empty():
		if i == 0:
			_abortar()
			return
		i -= 1
	if i >= 0 and i < items.size():
		items.remove_at(i)

func vaciar() -> void:
	items.clear()
	if not act.is_empty():
		_abortar()

func _soltar() -> void:
	var o: Objeto = act["obj"]
	if uso >= 0 and o.ocupado.has(uso):
		o.ocupado.erase(uso)
	var a: Actor = jg.jugador
	if a.postura != "de_pie" and act.get("est", "") == "hacer":
		a.poner(o.punto_uso(maxi(uso, 0)) if o.n_usos() > 0 else a.pos2())
	a.poner_postura("de_pie")
	a.progreso(-1.0, jg)
	if a.estado_etq != null:
		a.estado_etq.visible = false

func _abortar() -> void:
	_soltar()
	if jg.bar != null:
		jg.bar.cancelar_job(act.get("job", {}))
	act = {}
	uso = -1
	jg.jugador.ruta = []
	jg.marca.visible = false

func tick(dm: float) -> void:
	var a: Actor = jg.jugador
	if act.is_empty():
		if items.is_empty():
			return
		_empezar()
		if act.is_empty():
			return
	match act["est"]:
		"ir":
			if a.ruta.is_empty():
				_llegar()
		"hacer":
			_hacer(dm)

func _empezar() -> void:
	var it: Dictionary = items.pop_front()
	var o: Objeto = it["obj"]
	var ac: Dictionary = it["ac"]
	# se vuelve a comprobar: pudo cambiar desde que se encoló
	for rq in ac.get("req", []):
		var mot := Acciones.motivo(str(rq), o, ac, jg)
		if mot != "":
			jg._aviso("%s: %s." % [ac["n"], mot])
			return
	var i := o.uso_libre()
	if i < 0:
		jg._aviso("Está ocupado.")
		return
	uso = i
	if o.n_usos() > 0:
		o.ocupado[i] = jg.jugador
	act = {"obj": o, "ac": ac, "est": "ir", "job": {}}
	if o.n_usos() == 0:
		act["est"] = "hacer"
		_preparar_hacer()
		return
	var ruta: Array = jg.nav.camino(jg.jugador.pos2(), o.punto_uso(i))
	if ruta.is_empty():
		jg._aviso("No hay camino.")
		o.ocupado.erase(i)
		act = {}
		return
	jg.jugador.fijar_ruta(ruta)
	jg.marca.visible = true
	var p: Vector2 = o.punto_uso(i)
	jg.marca.position = Vector3(p.x, 0.08, p.y)

func _llegar() -> void:
	jg.marca.visible = false
	var o: Objeto = act["obj"]
	var ac: Dictionary = act["ac"]
	var a: Actor = jg.jugador
	if o.tipo == "cliente":
		a.mirar(o.actor.pos2() - a.pos2())
	elif o.n_usos() > 0:
		# se encara al mueble (o se sienta en él)
		var cara := o.pos - a.pos2()
		if ac.get("postura", "") == "tumbado":
			# en la cama: cabeza al fondo (norte), pies hacia la puerta
			a.poner(o.pos + Vector2(0, 0.8).rotated(-deg_to_rad(o.giro)))
			a.nodo.rotation.y = deg_to_rad(o.giro)
		elif ac.get("postura", "") == "sentado":
			var s := o.asiento_mundo()
			a.poner(Vector2(s.x, s.z))
			a.nodo.rotation.y = deg_to_rad(o.giro)
		else:
			a.mirar(cara)
	a.poner_postura(str(ac.get("postura", "de_pie")), o.alt_asiento())
	act["est"] = "hacer"
	_preparar_hacer()

func _preparar_hacer() -> void:
	var ac: Dictionary = act["ac"]
	if ac.get("tipo", "") == "dormir":
		# salto de tiempo con velo (main.gd); al despertar se suelta la cama
		act["est"] = "durmiendo"
		jg.dormir_cama(float(ac["min"]), float(ac.get("energia_min", 0.21)), _fin_dormir)
		return
	act["total"] = maxf(0.2, float(ac.get("min", 1.0)))
	act["resto"] = act["total"]
	if ac.get("tipo", "") == "pedir":
		var o: Objeto = act["obj"]
		act["job"] = jg.bar.pedido_jugador(str(ac["producto"]), o, uso)

func _hacer(dm: float) -> void:
	var ac: Dictionary = act["ac"]
	var a: Actor = jg.jugador
	act["resto"] -= dm
	var f: float = 1.0 - float(act["resto"]) / float(act["total"])
	a.progreso(f, jg)
	if ac.has("receta"):
		var r: Dictionary = Acciones.D["recetas"][ac["receta"]]
		var acum := 0.0
		var txt := ""
		for p in r["pasos"]:
			acum += float(p[1])
			txt = str(p[0])
			if acum >= act["total"] - act["resto"]:
				break
		jg.texto_estado(a, txt)
	elif ac.get("tipo", "") == "pedir":
		jg.texto_estado(a, "Esperando…")
	if act["resto"] > 0.0:
		return
	if ac.get("tipo", "") == "pedir" and not act["job"].get("listo", false):
		act["resto"] = 0.0
		return
	_terminar()

func _fin_dormir() -> void:
	if act.is_empty():
		return
	act["est"] = "hacer"
	_soltar()
	act = {}
	uso = -1

func _terminar() -> void:
	var o: Objeto = act["obj"]
	var ac: Dictionary = act["ac"]
	var a: Actor = jg.jugador
	var t: String = ac.get("tipo", "normal")
	var msg := "%s hecho." % ac["n"]
	var c := Acciones.coste(ac)
	if c > 0.0:
		jg.dinero -= c
	match t:
		"pedir":
			a.poner_mano(str(ac["producto"]), jg)
			msg = "Te sirven %s. %s" % [Acciones.nombre_mano(a.mano), Acciones.jg_eur(c)]
		"tirar":
			a.poner_mano(str(ac["producto"]), jg)
			msg = "Listo: %s en la mano." % Acciones.nombre_mano(a.mano)
		"preparar":
			a.poner_mano("coctel:" + str(ac["receta"]), jg)
			msg = "%s preparado. Coctelería %.1f." % [Acciones.nombre_mano(a.mano), jg.hab["cocteleria"] + float(ac.get("habilidad", {}).get("cocteleria", 0.0))]
		"beber":
			var pr := Acciones.producto(a.mano)
			Acciones.aplicar_efectos(pr.get("beber", {}), jg)
			msg = "Te bebes %s." % Acciones.nombre_mano(a.mano)
			a.poner_mano("", jg)
		"servir":
			var cl: Dictionary = o.cli
			var precio := Acciones.precio_de(a.mano)
			var prop := 0.0
			if randf() < 0.3 + 0.05 * jg.hab["cocteleria"]:
				prop = snappedf(precio * randf_range(0.1, 0.3), 0.1)
			jg.dinero += precio + prop
			msg = "Cobras %s%s." % [Acciones.jg_eur(precio), (" y %s de propina" % Acciones.jg_eur(prop)) if prop > 0.0 else ""]
			jg.bar.servido(cl, a.mano)
			a.poner_mano("", jg)
	for k in ac.get("habilidad", {}):
		jg.hab[k] = jg.hab.get(k, 0.0) + float(ac["habilidad"][k])
	Acciones.aplicar_efectos(ac.get("efectos", {}), jg)
	if ac.has("azar") and randf() < float(ac["azar"]["prob"]):
		jg.dinero += float(ac["azar"]["premio"])
		msg = "¡Premio! +%s." % Acciones.jg_eur(float(ac["azar"]["premio"]))
	elif ac.has("azar"):
		msg = "Nada. Otra vez será."
	jg._aviso(msg)
	_soltar()
	act = {}
	uso = -1
