class_name Acciones
# Catálogo de acciones y condiciones, leído de data/interiores.json. Aquí solo hay la lógica de las condiciones (req)
# y la de aplicar efectos; qué hace cada mueble, cuánto dura y cuánto cuesta está en los datos.
static var D: Dictionary = {}

static func cargar(d: Dictionary) -> void:
	D = d

static func producto(v: String) -> Dictionary:
	return D.get("productos", {}).get(v.split(":")[0], {})

static func icono_mano(v: String) -> String:
	return str(producto(v).get("e", "🥤"))

static func nombre_mano(v: String) -> String:
	if v.begins_with("coctel:"):
		return str(D["recetas"][v.split(":")[1]]["n"])
	return str(producto(v).get("n", v))

static func precio_de(v: String) -> float:
	if v.begins_with("coctel:"):
		return float(D["recetas"][v.split(":")[1]]["precio"])
	return float(producto(v).get("precio", 0.0))

static func coste(ac: Dictionary) -> float:
	if ac.get("tipo", "") == "pedir":
		return float(D["productos"][ac["producto"]]["precio"])
	return float(ac.get("coste", 0.0))

# acciones de un objeto con su disponibilidad: [{ac, ok, motivo}]
static func lista(obj: Objeto, jg) -> Array:
	var res: Array = []
	for ac in obj.def.get("acciones", []):
		var variantes: Array = []
		if ac.get("por_receta", false):
			for rid in D["recetas"]:
				var r: Dictionary = D["recetas"][rid]
				var v: Dictionary = ac.duplicate(true)
				v["id"] = "%s:%s" % [ac["id"], rid]
				v["n"] = "%s «%s»" % [ac["n"], r["n"]]
				v["receta"] = rid
				var mins := 0.0
				for p in r["pasos"]:
					mins += float(p[1])
				v["min"] = mins
				variantes.append(v)
		else:
			variantes.append(ac)
		for v in variantes:
			var mot := ""
			for rq in v.get("req", []):
				mot = motivo(str(rq), obj, v, jg)
				if mot != "":
					break
			if mot == "":
				mot = motivo_agotado(v, jg)
			res.append({"ac": v, "ok": mot == "", "motivo": mot})
	return res

static func motivo(rq: String, obj: Objeto, ac: Dictionary, jg) -> String:
	var ok := true
	match rq:
		"abierto":
			ok = jg._abierto(obj.interior) if jg.edificios.has(obj.interior) else true
		"camarero":
			ok = jg.bar != null and jg.bar.camarero_listo() != null
		"bebida_mano":
			ok = jg.jugador.mano != "" and producto(jg.jugador.mano).has("beber")
		"plato_mano":
			ok = jg.jugador.mano.split(":")[0] == "plato"
		"platos_sucios":
			ok = bool(jg.estado_casa.get("platos_sucios", false))
		"sin_platos_sucios":
			ok = not bool(jg.estado_casa.get("platos_sucios", false))
		"hay_tele":
			ok = jg.interior != null and not jg.interior.de_tipo("tele").is_empty()
		"sin_sitio":
			ok = not hay_sitio(obj, jg)
		"mano_libre":
			ok = jg.jugador.mano == ""
		"trabaja_aqui":
			ok = jg.trabaja_bar
		"cliente_sentado":
			ok = obj.cli.get("est", "") in ["bebiendo", "charlando"]
		"pedido_servible":
			ok = obj.cli.get("pedido", "") != "" and jg.jugador.mano.split(":")[0] == obj.cli.get("pedido", "")
		"dinero":
			ok = jg.dinero >= coste(ac)
		"libre":
			ok = obj.uso_libre() != -1
	return "" if ok else str(D["condiciones"].get(rq, rq))

# ¿queda algún sitio libre donde sentarse a comer (mesa de comedor, silla o sofá) en el interior del mueble?
static func hay_sitio(obj: Objeto, jg) -> bool:
	for it in jg.interiores_v:
		if it.id != obj.interior:
			continue
		for o in it.objetos:
			if o.tipo in ["mesa_comedor", "silla", "sofa"] and o.uso_libre() != -1:
				return true
	return false

# con la energía a 0 solo se puede dormir, sentarse o comer (reglas de data/interiores.json -> necesidades.agotado)
static func motivo_agotado(ac: Dictionary, jg) -> String:
	if float(jg.nec.get("energia", 100.0)) > 0.0:
		return ""
	if ac.get("tipo", "") in ["dormir", "comer"] or ac.get("postura", "") == "sentado":
		return ""
	return str(D["condiciones"].get("agotado", "Estás agotado"))

static func etiqueta(ac: Dictionary) -> String:
	var t := "%s %s" % [ac.get("e", ""), ac["n"]]
	var c := coste(ac)
	if c > 0.0:
		t += " (%s)" % jg_eur(c)
	return t

static func jg_eur(c: float) -> String:
	return ("%.2f" % c).replace(".", ",").replace(",00", "") + " €"

# efectos de necesidades sobre el estado del juego
static func aplicar_estado(est: Dictionary, jg) -> void:
	for k in est:
		jg.estado_casa[k] = est[k]

static func aplicar_efectos(ef: Dictionary, jg) -> void:
	for k in ef:
		if jg.nec.has(k):
			jg.nec[k] = clampf(jg.nec[k] + float(ef[k]), 0.0, 100.0)
