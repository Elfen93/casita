class_name Animaciones
## Catálogo de animaciones (data/animaciones.json, ver data/README.md) y las decisiones que salen de él: a qué grupo
## (paquete) pertenece cada una, si se repite, su postura, la de base que la sustituye mientras llega su grupo, qué
## animación usa cada acción de los muebles (data/interiores.json → acciones[].anim) y cada gesto, y las rutinas de
## ejercicio por nivel de habilidad (boxeo, artes marciales, gimnasio, baile, música).
##
## Una «especificación» de animación es un nombre del catálogo o «x+y»: piernas y tronco de x con brazos y cabeza de y
## (PersonaAnimada la monta al vuelo). Las de bucle están en el sitio; las de una vez vuelven al reposo de su postura.

static var _d := {}

static func datos() -> Dictionary:
	if _d.is_empty():
		if FileAccess.file_exists("res://data/animaciones.json"):
			_d = Datos.cargar("animaciones")
		if _d.is_empty():
			_d = {"animaciones": {}}
	return _d

static func info(n: String) -> Dictionary:
	return datos().get("animaciones", {}).get(n, {})

static func existe(n: String) -> bool:
	return datos().get("animaciones", {}).has(n)

## las que van en base (index.pck) aunque el catálogo las ponga en otro grupo: carreras de verdad, que el «correr» de
## base es un trote y en trayectos largos (prisa) iría a ritmo 2 o más
const EN_BASE := {"correr_rapido": "gimnasio", "sprint": "gimnasio"}

## grupo (paquete) de la animación: "base", "dia", "social"…; "" si no está en el catálogo
static func grupo(n: String) -> String:
	if EN_BASE.has(n):
		return "base"
	return str(info(n).get("g", ""))

static func bucle(n: String) -> bool:
	return bool(info(n).get("bucle", true))

## de_pie | sentado | suelo | tumbado | agua
static func postura(n: String) -> String:
	var p := str(info(n.split("+")[0]).get("post", ""))
	if p != "":
		return p
	match n:
		"sentado", "sentado_beber", "sentado_hablar": return "sentado"
		"dormir": return "tumbado"
	return "de_pie"

static func desp(n: String) -> float:
	var v = info(n).get("desp", 0.0)
	return float(v) if v != null else 0.0

static func nivel(n: String) -> int:
	var v = info(n).get("nivel", null)
	return int(v) if v != null else 0

static func es_andar(n: String) -> bool:
	return n == "andar" or n.begins_with("andar_") or n.ends_with("_andar")

## la animación de base (siempre cargada, va en index.pck) más parecida: mientras llega el grupo de la de verdad
static func reserva(spec: String) -> String:
	var p := spec.split("+")
	var n := p[0]
	if grupo(n) == "base":
		return n
	if es_andar(n):
		return "andar"
	if n.begins_with("correr") or n == "sprint" or n == "cinta_correr":
		return "correr"
	match postura(n):
		"sentado":
			return "sentado"
		"tumbado":
			return "dormir"
	if p.size() > 1 or bool(info(n).get("brazos", false)):
		return "usar"
	return "parado"

## para la persona de repuesto (Quaternius), que solo tiene las 8 de siempre
const BASICAS := ["parado", "andar", "correr", "sentado", "usar", "beber", "hablar", "dormir"]
static func basica(spec: String) -> String:
	var n := spec.split("+")[0]
	if n in BASICAS:
		return n
	if n.begins_with("sentado_") and postura(n) == "sentado":
		return "sentado"
	if n.contains("hablar") or n.contains("charlar") or n.contains("discutir"):
		return "hablar"
	return reserva(spec) if reserva(spec) in BASICAS else "parado"

## versión sentada de una animación de pie (gesto de alguien sentado en la barra, en el sofá…)
static func sentado_de(spec: String) -> String:
	if postura(spec) != "de_pie":
		return spec
	var n := spec.split("+")[-1]
	match n:
		"reir": return "reir_sentado"
		"hablar", "hablar_contento", "charlar_de_pie", "discutir", "discutir_enfadado", "contar_secreto": return "sentado_hablar"
		"beber": return "sentado_beber"
	if bool(info(n).get("brazos", false)) or n in ["asentir_corto", "negar_no", "pensar", "comer", "llorar"]:
		return "sentado+" + n
	return "sentado_hablar"

## animación de una acción de mueble: el campo "anim" de la acción (data/interiores.json). Puede ser una
## especificación ("teclear", "sentado+comer"), «objeto.actividad» de animaciones.json → actividades, o «gesto:<id>»
## (lo que hace quien empieza el gesto; la otra persona, gesto_otra()).
static func de_accion(ac: Dictionary) -> String:
	var a := str(ac.get("anim", ""))
	if a == "":
		return ""
	if a.begins_with("gesto:"):
		return str(datos().get("gestos", {}).get(a.substr(6), {}).get("quien", "hablar"))
	if a.contains(".") and not a.contains("+"):
		var p := a.split(".")
		return str(datos().get("actividades", {}).get(p[0], {}).get(p[1], ""))
	return a

## lo que hace la otra persona de un gesto social (acción con "anim": "gesto:<id>"); "" si no es un gesto
static func gesto_otra(ac: Dictionary) -> String:
	var a := str(ac.get("anim", ""))
	if not a.begins_with("gesto:"):
		return ""
	return str(datos().get("gestos", {}).get(a.substr(6), {}).get("otra", "hablar"))

# ---------------------------------------------------------------- habilidad: rutinas de ejercicio por nivel
## Disciplinas con nivel 1 (torpe) … 4 (experta). boxeo y artes marciales salen del campo «nivel» del catálogo; gimnasio,
## baile y música no lo traen y van por esta tabla (lo nuevo de cada nivel se suma a lo de los anteriores).
const DISCIPLINAS := {
	"boxeo": {"reposo": ["calentamiento_boxeo", "boxeo_guardia", "boxeo_guardia_saltando", "boxeo_guardia"],
		"bucles": ["saco_boxeo", "pera_boxeo"], "fallo": ["recibir_golpe_cara", "boxeo_derrota"]},
	"artes_marciales": {"reposo": ["artes_marciales_guardia", "artes_marciales_guardia", "artes_marciales_guardia", "artes_marciales_guardia"],
		"bucles": ["capoeira_combo"], "fallo": ["recibir_golpe_cara", "ko_higado"]},
	"gimnasio": {"reposo": ["gimnasio_idle", "gimnasio_idle", "gimnasio_idle", "gimnasio_idle"],
		"por_nivel": [["calentar_estirar", "sentadillas", "jumping_jacks"], ["pesas_biceps", "abdominales", "flexiones"],
			["kettlebell", "burpee", "pesas_elevaciones", "cinta_correr"], ["levantar_pesa_olimpica", "sprint"]],
		"fallo": ["trotar_tropezar", "agotado_tumbado"]},
	"baile": {"reposo": ["parado", "bailar_sencillo", "contento", "contento"],
		"por_nivel": [["bailar_sencillo", "bailar_pollito", "bailar_ymca"], ["bailar_twist", "bailar_rumba"],
			["bailar_salsa", "bailar_shuffle", "bailar_running_man"], ["bailar_hiphop", "bailar_swing"]],
		"fallo": ["trotar_tropezar"]},
	"musica_guitarra": {"reposo": ["parado", "parado", "parado", "parado"], "por_nivel": [["tocar_guitarra"], [], [], []], "fallo": []},
	"musica_piano": {"reposo": ["sentado", "sentado", "sentado", "sentado"], "por_nivel": [["tocar_piano"], [], [], ["tocar_piano_largo"]], "fallo": []},
}

## animaciones que se pueden usar a ese nivel (de esa disciplina): las de nivel <= n
static func de_nivel(disciplina: String, n: int) -> Array:
	var d: Dictionary = DISCIPLINAS.get(disciplina, {})
	var r: Array = []
	if d.has("por_nivel"):
		for i in clampi(n, 1, 4):
			r.append_array(d["por_nivel"][i])
		return r
	var prefijo := "boxeo_" if disciplina == "boxeo" else "patada_"
	for k in datos().get("animaciones", {}):
		var nv := nivel(k)
		if nv > 0 and nv <= n and str(k).begins_with(prefijo) and not bucle(k):
			r.append(k)
	return r

## Rutina de entrenamiento: lista de pasos {a: animación, v: ritmo, t: segundos (los de bucle; los de una vez, hasta
## acabar)}. A nivel bajo se hace «mal»: ritmo irregular, pausas en la guardia, golpes sueltos y de vez en cuando un
## tropiezo, un golpe recibido o quedarse sin aire. A nivel alto, combos seguidos, sin pausas, ritmo constante.
## La usa Actor.entrenar(); el juego aún no tiene gimnasio ni ring (ver godot/README.md, «Animaciones en el juego»).
static func rutina(disciplina: String, n: int, rng: RandomNumberGenerator, pasos := 12) -> Array:
	n = clampi(n, 1, 4)
	var d: Dictionary = DISCIPLINAS.get(disciplina, {})
	if d.is_empty():
		return []
	var golpes := de_nivel(disciplina, n)
	var reposo: String = d["reposo"][n - 1]
	var r: Array = []
	var irregular: float = [0.35, 0.2, 0.08, 0.0][n - 1]       # cuánto baila el ritmo
	var p_pausa: float = [0.45, 0.25, 0.1, 0.0][n - 1]
	var p_fallo: float = [0.22, 0.1, 0.03, 0.0][n - 1]
	var combo: int = [1, 2, 3, 4][n - 1]                      # golpes seguidos antes de volver a la guardia
	while r.size() < pasos:
		if golpes.is_empty():
			break
		if d.has("por_nivel"):
			# gimnasio, baile, música: series en bucle de una animación; a nivel bajo, series cortas y lentas
			var a: String = golpes[rng.randi() % golpes.size()]
			if n >= 3 and golpes.size() > 2:
				a = golpes[golpes.size() - 1 - rng.randi() % mini(3, golpes.size())]   # lo más difícil que sabe
			r.append({"a": a, "v": 1.0 - irregular * 0.5 + rng.randf() * irregular, "t": [5.0, 7.0, 9.0, 12.0][n - 1], "irr": irregular})
		else:
			var hechos := 0
			while hechos < combo:
				var g: String = golpes[rng.randi() % golpes.size()]
				if n >= 3:
					var altos := golpes.filter(func(x): return nivel(x) >= n - 1)
					if not altos.is_empty() and rng.randf() < 0.7:
						g = altos[rng.randi() % altos.size()]
				r.append({"a": g, "v": (1.0 if irregular == 0.0 else 1.0 - irregular * 0.5 + rng.randf() * irregular), "t": 0.0, "irr": irregular})
				hechos += 1
			if n == 4 and rng.randf() < 0.5 and not d.get("bucles", []).is_empty():
				r.append({"a": d["bucles"][rng.randi() % d["bucles"].size()], "v": 1.0, "t": 5.0, "irr": 0.0})
		if rng.randf() < p_fallo and not d.get("fallo", []).is_empty():
			r.append({"a": d["fallo"][rng.randi() % d["fallo"].size()], "v": 1.0, "t": 0.0, "irr": 0.0})
		if rng.randf() < p_pausa:
			r.append({"a": reposo, "v": 1.0, "t": rng.randf_range(1.2, 2.8), "irr": 0.0})
		elif n < 4 and not d.has("por_nivel"):
			r.append({"a": reposo, "v": 1.0, "t": [1.6, 1.0, 0.6, 0.0][n - 1], "irr": 0.0})
	return r
