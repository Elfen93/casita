class_name Actor
# Cualquiera que anda: el jugador o un vecino. Ruta en metros (Vector2 x,z), postura, bebida en la mano, barra de progreso.
var nodo: Node3D
var cuerpo: Node3D
var ruta: Array = []
var anda := false
var fase := 0.0
var vel := Escala.VEL_ANDAR
var ult_paso := 0.0
var postura := "de_pie"
var mano := ""            # "cana", "cafe", "coctel:mojito"…
var carga := false        # lleva algo en brazos (la compra, un pedido): anda con andar_cargando  # --- compras ---
var mano_n: Node3D
var etq_mano: Label3D
var barra_n: Node3D
var barra_fill: MeshInstance3D
var pedido_etq: Label3D
var estado_etq: Label3D
var alto_cab := 1.9
var persona = null   # Persona (arte libre, con esqueleto) o null si aún no se ha montado
var holder: Node3D   # la persona cuelga de aquí, girada PI: la persona mira a -Z y el actor mira a +Z
var asp := {}
var esq_on := false  # persona montada, visible y animándose; si no, solo la cápsula barata (cuerpo)
var alt_asiento := 0.5
var sombra_on := false
var _anim_k := ""
var _ritmo := 1.0         # speed_scale que se le dio a la persona por última vez
var _paso := 0.0          # metros que pidió avanzar el último mover() (velocidad real = _paso / delta del frame)
var _zancadas := {}       # "andar"/"correr" -> m/s que avanza el pie de ESTA persona con la animación a velocidad 1

func esqueleto_activo() -> bool:
	return persona != null and esq_on

# LOD: on = persona con esqueleto (cerca y a la vista); off = cápsula barata, la persona se oculta y su AnimationPlayer se para
func set_lod(on: bool, sombra := false) -> void:
	if on and asp.is_empty():
		on = false
	if on:
		var nueva := persona == null
		if persona == null:
			persona = Figura.persona(asp)
			holder = Node3D.new()
			holder.rotation.y = PI
			nodo.add_child(holder)
			holder.add_child(persona)
			alto_cab = persona.altura + 0.25
			_anim_k = ""
			_zancadas = {}
			if Figura.esperando(persona) != "":
				Paquetes.pedir(Figura.esperando(persona), _llego)
		if not esq_on:
			esq_on = true
			persona.visible = true
			persona.process_mode = Node.PROCESS_MODE_INHERIT
			cuerpo.visible = false
			_anim_k = ""
		if sombra != sombra_on or nueva:
			sombra_on = sombra
			for m in persona.cuerpo.find_children("*", "MeshInstance3D", true, false):
				(m as MeshInstance3D).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if sombra else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		anim_tick()
	elif esq_on:
		esq_on = false
		persona.visible = false
		persona.process_mode = Node.PROCESS_MODE_DISABLED
		cuerpo.visible = true

# llegó el paquete del personaje (web): fuera la persona de repuesto, se monta la de verdad si se estaba viendo
func _llego(_nombre: String) -> void:
	if persona == null or not is_instance_valid(persona) or Figura.esperando(persona) == "":
		return
	var on := esq_on
	var sombra := sombra_on
	holder.queue_free()
	holder = null
	persona = null
	esq_on = false
	if on:
		set_lod(true, sombra)

# ---------------------------------------------------------------- animación
# Qué animación se ve sale del estado real: andar/correr (con la de anciano, borracho, triste…), sentado (con sentarse y
# levantarse), tumbado, la de la acción en curso (act_anim, la pone Cola/Bar desde data/interiores.json → anim), hablar,
# beber, y en reposo una que va cambiando según el ánimo (necesidades de la jugadora; de los vecinos, su carácter y la
# hora), la edad (≥ 70: anciano) y lo bebido (copas). Nombres y grupos: data/animaciones.json (ver Animaciones).
var act_nivel := 0        # nivel 1-4 de la habilidad que usa la acción (0: no va con habilidad): a nivel bajo, a trompicones
var act_anim := ""        # animación de lo que está haciendo («teclear», «sentado+comer»…); "" = nada especial
var copas := 0.0          # copas con alcohol encima (se van pasando: COPAS_POR_HORA)
var copas_min := 0.0      # minuto del juego de la última
const COPAS_BORRACHO := 3.0
const COPAS_POR_HORA := 0.75
var _idle := ""
var _idle_t := 0.0
var _trans := ""          # sentarse_silla / levantarse_sentado mientras dura
var _silla := Transform3D.IDENTITY   # dónde estaba sentada (para levantarse desde allí)
var _t_ms := 0
var _rutina: Array = []   # entrenamiento en curso (entrenar()): pasos {a, v, t, irr}
var _paso_i := -1
var _paso_t := 0.0
var _irr_t := 0.0
var _rng := RandomNumberGenerator.new()
var _patrulla_t := 0.0
var _patrulla_c := Vector2.INF
var _marcha := ""         # andar / correr / correr_rapido / sprint que se está viendo (para no saltar entre dos)

## minuto del juego (main.minutos); 0 fuera del juego (pruebas)
func _minutos() -> float:
	var esc = nodo.get_tree().current_scene if nodo.is_inside_tree() else null
	return float(esc.get("minutos")) if esc != null and esc.get("minutos") != null else 0.0

## una copa más (caña, cóctel): con COPAS_BORRACHO encima, anda e idle de borracho
func beber_copa() -> void:
	copas = copas_ahora() + 1.0
	copas_min = _minutos()

func copas_ahora() -> float:
	if copas <= 0.0:
		return 0.0
	return maxf(0.0, copas - (_minutos() - copas_min) / 60.0 * COPAS_POR_HORA)

func borracho() -> bool:
	return copas_ahora() >= COPAS_BORRACHO

## Entrenar (boxeo, artes_marciales, gimnasio, baile, musica_guitarra, musica_piano) a un nivel 1-4: rutina de
## Animaciones.rutina (a nivel bajo, mal: ritmo irregular, pausas, tropiezos; a nivel alto, combos seguidos).
## El juego aún no tiene gimnasio ni ring: queda lista para cuando los haya (y la usa la prueba de capturas).
## nivel: el de la habilidad (main.hab) pasado a 1-4 con Actor.nivel_de(). pasos = 0: parar.
func entrenar(disciplina: String, nivel: int, pasos := 16) -> void:
	_rng.seed = hash(str(asp.get("semilla", 0)) + disciplina) + Time.get_ticks_msec()
	_rutina = Animaciones.rutina(disciplina, nivel, _rng, pasos) if pasos > 0 else []
	_paso_i = -1
	_anim_k = ""

## puntos de habilidad (main.hab, 0…) → nivel de animación 1-4
static func nivel_de(puntos: float) -> int:
	return clampi(1 + int(puntos / 3.0), 1, 4)

func _dt() -> float:
	var ahora := Time.get_ticks_msec()
	var dt := 0.0 if _t_ms == 0 else minf(0.5, (ahora - _t_ms) / 1000.0)
	_t_ms = ahora
	return dt

func _es_mixamo() -> bool:
	return persona is PersonaAnimada

func _edad() -> int:
	return int(asp.get("edad", 30))

## ánimo para el reposo: la jugadora, sus necesidades; los vecinos, su carácter (semilla) y la hora
func _animo() -> Dictionary:
	var r := {"cansado": false, "aburrido": false, "triste": false, "contento": false}
	var esc = nodo.get_tree().current_scene if nodo.is_inside_tree() else null
	if esc != null and esc.get("jugador") == self and esc.get("nec") is Dictionary:
		var nec: Dictionary = esc.get("nec")
		var media := 0.0
		for k in nec:
			media += float(nec[k])
		media /= maxf(1.0, nec.size())
		r["cansado"] = float(nec.get("energia", 100.0)) < 30.0
		r["aburrido"] = float(nec.get("diversion", 100.0)) < 30.0
		r["triste"] = media < 35.0 or float(nec.get("social", 100.0)) < 15.0
		r["contento"] = media > 72.0
		return r
	var h := fposmod(_minutos() / 60.0, 24.0)
	var sem := int(asp.get("semilla", 1))
	r["cansado"] = h >= 23.0 or h < 7.0
	match sem % 10:
		0: r["triste"] = true
		1, 2: r["aburrido"] = true
		3, 4, 5: r["contento"] = true
	return r

func _policia_de_servicio() -> bool:
	if not asp.get("policia", false):
		return false
	var t = asp.get("trabajo", null)
	if not (t is Dictionary):
		return false
	var m := _minutos()
	var h := fposmod(m / 60.0, 24.0)
	var d := int(floorf(m / 1440.0)) % 7
	var th: Array = t.get("h", [0, 0])
	return h >= float(th[0]) and h < float(th[1]) and (t.get("dias", []) as Array).has(d)

## reposo de pie: una de fondo (según edad, copas, ánimo, oficio) y de vez en cuando algo suelto (bostezar, estirarse…)
func _fondo() -> String:
	return _fondo_y_sueltas()[0]

func _elegir_idle() -> String:
	var fs := _fondo_y_sueltas()
	var fondo: String = fs[0]
	var sueltas: Array = fs[1]
	if persona is PersonaAnimada:
		persona.reposo_de_pie = fondo
	if _idle != "" and _idle == fondo and not sueltas.is_empty() and randf() < 0.45:
		return sueltas[randi() % sueltas.size()]
	return fondo

func _fondo_y_sueltas() -> Array:
	var an := _animo()
	var fondo := "parado"
	var sueltas: Array = []
	if borracho():
		fondo = "borracho_idle"
		sueltas = ["borracho_tropezar"]
	elif _edad() >= 70:
		fondo = "anciano_idle"
		sueltas = ["anciano_dolor_espalda"] + (["bostezar"] if an["cansado"] else [])
	elif _policia_de_servicio():
		fondo = "parado"
		sueltas = ["vigilar_mirar_lejos", "vigilar_mirar_lejos", "saludo_militar", "brazos_cruzados"]
	elif _edad() < 13:
		fondo = "parado"
		sueltas = ["nino_apoyado_pared_musica", "contento", "mirar_movil"]
	else:
		if an["triste"]:
			fondo = "triste"
		elif an["aburrido"]:
			fondo = "aburrido"
		elif an["contento"]:
			fondo = "contento"
		if an["cansado"]:
			sueltas = ["bostezar", "estirar_brazos", "bostezar"]
		else:
			sueltas = ["estirar_cuello", "mirar_movil", "brazos_cruzados", "pensar", "estirar_brazos"]
	return [fondo, sueltas]

func _reposo_de_pie(dt: float) -> String:
	_idle_t -= dt
	var una_vez := _idle != "" and not Animaciones.bucle(_idle)
	if _idle == "" or (una_vez and _es_mixamo() and persona.acabo(_idle)) \
			or (not una_vez and _idle_t <= 0.0) or (una_vez and _idle_t <= -20.0):
		_idle = _elegir_idle()
		_idle_t = randf_range(6.0, 9.0) if Animaciones.bucle(_idle) and _idle != persona.get("reposo_de_pie") else randf_range(9.0, 20.0)
		_anim_k = ""
	return _idle

## sentado sin hacer nada: la niña balancea las piernas; con sueño, repantigado
func _reposo_sentado() -> String:
	if _edad() < 13:
		return "nino_sentado_balanceando_piernas"
	var an := _animo()
	if an["cansado"] or borracho():
		return "sentado_relajado"
	return "sentado"

## marcha según la velocidad de verdad: andar (la de anciano, borracho, triste, contento) o, si va deprisa, trote,
## carrera o sprint (la que deje el ritmo entre ~1 y 1,4: los pies no resbalan ni pedalean)
func _elegir_marcha(v: float) -> String:
	if not _es_mixamo():
		return "correr" if vel >= Escala.VEL_CORRER - 0.1 else "andar"
	var andar := "andar"
	var an := _animo()
	# las de anciano y borracho dan pasos muy cortos: solo si el ritmo queda razonable (ver mover(): van más despacio)
	if _edad() >= 70 and v / _zancada("anciano_andar") <= 2.6:
		return "anciano_andar"
	if borracho() and v / _zancada("borracho_andar") <= 2.0:
		return "borracho_andar"
	if _edad() < 13:
		andar = "andar_contento"
	elif an["triste"]:
		andar = "andar_triste"
	elif an["contento"] and int(asp.get("semilla", 0)) % 2 == 0:
		andar = "andar_contento"
	var corre := vel >= Escala.VEL_CORRER - 0.1
	var marchas: Array = [andar, "correr", "correr_rapido", "sprint"]
	if not corre and v / _zancada(andar) <= 1.6:
		return andar
	# con histéresis: la de ahora sigue mientras su ritmo esté entre 0,8 y 1,55
	if _marcha in marchas and _marcha != andar:
		var rm := v / _zancada(_marcha)
		if rm >= 0.8 and rm <= 1.55:
			return _marcha
	for m in marchas.slice(1):
		if v / _zancada(m) <= 1.4:
			return m
	return "sprint"

func anim_tick() -> void:
	if not esq_on:
		return
	var dt := _dt()
	var n := "parado"
	var br := ""
	var vel_a := 1.0
	var hablando := estado_etq != null and estado_etq.visible and estado_etq.text.begins_with("💬")
	var espera := estado_etq != null and estado_etq.visible and estado_etq.text.begins_with("Esperando")
	var usando := barra_n != null and barra_n.visible
	var bebe := mano != "" and Acciones.producto(mano).has("beber")   # el plato no se lleva como una copa
	var mixamo := _es_mixamo()
	# tumbado: la persona se acuesta centrada en la cama (el actor está en los pies, cabeza hacia -Z), sobre el colchón
	if holder != null:
		if _trans == "levantarse_sentado" and not anda and postura == "de_pie" and nodo.is_inside_tree():
			# se levanta desde la silla (el actor ya está en el punto de uso)
			holder.global_transform = _silla * Transform3D(Basis(Vector3.UP, PI), Vector3.ZERO)
		else:
			var obj := Vector3(0, alt_asiento, -0.8) if postura == "tumbado" else Vector3.ZERO
			holder.rotation = Vector3(0, PI, 0)
			holder.position = holder.position.lerp(obj, 1.0 - exp(-10.0 * dt)) if postura == "de_pie" and holder.position.length() < 1.5 else obj
	if _trans != "" and (anda or (mixamo and persona.acabo(_trans)) or not mixamo):
		_trans = ""
	if postura == "tumbado":
		n = act_anim if act_anim != "" else "dormir"
	elif postura == "sentado":
		if _trans == "sentarse_silla":
			n = _trans
		elif act_anim != "":
			n = Animaciones.sentado_de(act_anim)
		elif bebe:
			n = "sentado"
			br = "beber"
		elif hablando:
			n = "sentado"
			br = "hablar"
		else:
			n = _reposo_sentado()
	elif anda:
		var v := _vel_real()
		n = _elegir_marcha(v)
		if carga and mixamo:  # --- compras --- con la compra en brazos
			n = "cargar_caja_trotar" if vel >= Escala.VEL_CORRER - 0.1 else "andar_cargando"  # --- compras ---
		_marcha = n
		# PIES SIN RESBALAR: la animación va al ritmo de la velocidad REAL del actor (main la multiplica: x0,9 los
		# vecinos, x1,8 a doble velocidad de juego), dividida por lo que avanza su zancada a ritmo 1
		vel_a = clampf(v / _zancada(n), Escala.RITMO_MIN, Escala.RITMO_MAX)
	elif _trans == "levantarse_sentado":
		n = _trans
		vel_a = 1.5
	elif espera or hablando:
		n = act_anim if act_anim != "" else "hablar"
	elif usando:
		n = act_anim if act_anim != "" else ("beber" if bebe else "usar")
		if act_nivel > 0 and act_nivel < 4:
			# poca habilidad: el ritmo va a tirones
			_irr_t -= dt
			if _irr_t <= 0.0:
				var irr: float = [0.35, 0.2, 0.08][act_nivel - 1]
				_irr_t = randf_range(0.5, 1.2)
				_ritmo_irr = randf_range(1.0 - irr, 1.0 + irr * 0.6)
			vel_a = _ritmo_irr
	elif not _rutina.is_empty():
		var pr := _paso_rutina(dt)
		n = pr[0]
		vel_a = pr[1]
	elif act_anim != "":
		n = act_anim
	elif bebe:
		n = "borracho_idle+beber" if borracho() else "beber"
	elif carga and mixamo:  # --- compras ---
		n = "cargar_caja_idle"  # --- compras ---
	else:
		n = _reposo_de_pie(dt)
	if not anda:
		_marcha = ""
		_patrullar(dt)
	# un gesto o una acción de una vez (chiste, pulsar el botón…) mientras dura la acción: se repite tras una pausa
	if mixamo and act_anim != "" and n == act_anim and not Animaciones.bucle(n.split("+")[0]) and persona.acabo(n):
		_rep_t -= dt
		if _rep_t <= 0.0:
			_rep_t = randf_range(1.0, 3.0)
			_anim_k = ""
	# el ánimo cambia (necesidades, copas): el reposo de fondo se vuelve a elegir
	_fondo_t -= dt
	if _fondo_t <= 0.0:
		_fondo_t = 1.5
		var f := _fondo()
		if f != _fondo_ant:
			_fondo_ant = f
			_idle = ""
	if not mixamo:
		n = Animaciones.basica(n)
		if br != "" and n != "sentado":
			br = ""
	var k := "%s/%s" % [n, br]
	if k == _anim_k and absf(vel_a - _ritmo) <= 0.03 * _ritmo:
		return
	_anim_k = k
	_ritmo = vel_a
	if postura == "sentado" or _trans == "levantarse_sentado":
		persona.set_altura_asiento(alt_asiento)
	persona.anim(n, vel_a, br)

## paso de la rutina de entrenamiento: [animación, ritmo]. Las de una vez, hasta que acaban; las de bucle, sus segundos.
## A nivel bajo el ritmo baila cada poco (irr).
func _paso_rutina(dt: float) -> Array:
	_paso_t -= dt
	var p: Dictionary = _rutina[_paso_i] if _paso_i >= 0 else {}
	var hecho := _paso_i < 0
	if not hecho:
		var a := str(p["a"])
		if Animaciones.bucle(a):
			hecho = _paso_t <= 0.0
		else:
			hecho = (_es_mixamo() and persona.acabo(a)) or _paso_t < -6.0
	if hecho:
		_paso_i = (_paso_i + 1) % _rutina.size()
		p = _rutina[_paso_i]
		_paso_t = float(p["t"])
		_irr_t = 0.0
		_anim_k = ""
		if _es_mixamo() and not Animaciones.bucle(str(p["a"])):
			persona.anim(str(p["a"]), float(p["v"]))   # que empiece de cero aunque sea la misma de antes
	var v := float(p["v"])
	var irr := float(p.get("irr", 0.0))
	if irr > 0.0:
		_irr_t -= dt
		if _irr_t <= 0.0:
			_irr_t = randf_range(0.4, 1.1)
			_ritmo_irr = randf_range(1.0 - irr, 1.0 + irr * 0.6)
		v *= _ritmo_irr
	return [str(p["a"]), v]
var _ritmo_irr := 1.0
var _rep_t := 0.0
var _fondo_t := 0.0
var _fondo_ant := ""

## policía de servicio: de vez en cuando da una vuelta corta andando por su calle (con el navegador del juego)
func _patrullar(dt: float) -> void:
	if not _policia_de_servicio() or not ruta.is_empty() or postura != "de_pie" or not nodo.visible:
		_patrulla_c = Vector2.INF if not _policia_de_servicio() else _patrulla_c
		return
	if _patrulla_c == Vector2.INF:
		_patrulla_c = pos2()
		_patrulla_t = randf_range(12.0, 25.0)
	_patrulla_t -= dt
	if _patrulla_t > 0.0:
		return
	_patrulla_t = randf_range(20.0, 40.0)
	var esc = nodo.get_tree().current_scene if nodo.is_inside_tree() else null
	if esc == null or esc.get("nav") == null:
		return
	var meta := _patrulla_c + Vector2(randf_range(-6.0, 6.0), randf_range(-3.0, 3.0))
	var r: Array = esc.get("nav").camino(pos2(), meta)
	if not r.is_empty():
		fijar_ruta(r, false)

# m/s a los que se ha movido el actor en este frame (anim_tick va justo después de mover() en el mismo frame)
func _vel_real() -> float:
	var dt := nodo.get_process_delta_time() if nodo.is_inside_tree() else 0.0
	return _paso / dt if dt > 0.0 and _paso > 0.0 else vel

# avance del pie apoyado (m/s a ritmo 1) de la animación `n` en esta persona, ya con su altura. Se calcula una vez.
# PersonaAnimada (Mixamo) lo da con zancada(); a la Persona de Quaternius se le mide su animación con Escala.medir_zancada.
func _zancada(n: String) -> float:
	if _zancadas.has(n):
		return _zancadas[n]
	var z := 0.0
	if persona is PersonaAnimada and not persona.anim_lista(n):
		# su grupo aún no ha llegado: se ve la de reserva (andar/correr); no se guarda
		return persona.zancada(Animaciones.reserva(n))
	if persona.has_method("zancada"):
		z = persona.zancada(n)
	else:
		var mapa: Dictionary = persona.get_script().get_script_constant_map().get("MAPA_ANIM", {})
		var real := str(mapa.get(n, n))
		var aps: Array = persona.find_children("*", "AnimationPlayer", true, false)
		var sks: Array = persona.find_children("*", "Skeleton3D", true, false)
		if not aps.is_empty() and not sks.is_empty() and (aps[0] as AnimationPlayer).has_animation(real):
			z = Escala.medir_zancada(sks[0], (aps[0] as AnimationPlayer).get_animation(real), persona, "persona/" + real)
	if z <= 0.0:
		z = float(Escala.ZANCADA_RESERVA.get(n, 1.0)) * float(persona.altura)
	_zancadas[n] = z
	return z

func _init(f: Dictionary) -> void:
	nodo = f["nodo"]
	cuerpo = f["cuerpo"]
	asp = f.get("asp", {})

func fijar_ruta(pts: Array, correr_ok := true) -> void:
	ruta = []
	var largo := 0.0
	var ant := Vector2(nodo.position.x, nodo.position.z)
	for p in pts:
		ruta.append(p)
		largo += ant.distance_to(p)
		ant = p
	vel = Escala.VEL_CORRER if (correr_ok and largo > Escala.CORRER_DESDE) else Escala.VEL_ANDAR

func pos2() -> Vector2:
	return Vector2(nodo.position.x, nodo.position.z)

func poner(p: Vector2) -> void:
	nodo.position = Vector3(p.x, nodo.position.y, p.y)

func mirar(dir: Vector2) -> void:
	if dir.length() > 0.001:
		nodo.rotation.y = atan2(dir.x, dir.y)

# true cuando termina el camino
## los mayores (≥ 70) y quien va borracho andan más despacio (su animación da pasos cortos: así no pedalean)
func _factor_marcha() -> float:
	if _edad() >= 70:
		return 0.4
	if copas > 0.0 and borracho():
		return 0.6
	return 1.0

func mover(paso: float) -> bool:
	if not ruta.is_empty():
		paso *= _factor_marcha()
	ult_paso = 0.0
	_paso = paso
	if ruta.is_empty():
		anda = false
		return false
	var meta: Vector2 = ruta[0]
	var d: Vector2 = meta - pos2()
	var l := d.length()
	anda = true
	if l <= paso:
		ult_paso = l
		poner(meta)
		ruta.pop_front()
		if ruta.is_empty():
			anda = false
			cuerpo.position.y = 0.0
			cuerpo.rotation.z = 0.0
			return true
		return false
	ult_paso = paso
	nodo.position += Vector3(d.x, 0, d.y) / l * paso
	nodo.rotation.y = lerp_angle(nodo.rotation.y, atan2(d.x, d.y), 0.35)
	fase += paso * 2.6
	cuerpo.position.y = absf(sin(fase)) * 0.07
	cuerpo.rotation.z = sin(fase) * 0.05
	return false

func poner_postura(p: String, alt := 0.5) -> void:
	if p == "sentado" and postura != "sentado":
		_silla = nodo.global_transform if nodo.is_inside_tree() else nodo.transform
		_trans = "sentarse_silla" if esq_on and _es_mixamo() else ""
	elif p == "de_pie" and postura == "sentado":
		_trans = "levantarse_sentado" if esq_on and _es_mixamo() and nodo.visible else ""
	elif p != "de_pie":
		_trans = ""
	if p != postura:
		_idle = ""
		if p != "de_pie":
			_rutina = []
	postura = p
	alt_asiento = alt
	_anim_k = ""
	match p:
		"sentado":
			cuerpo.position.y = -0.42
			cuerpo.scale = Vector3(1, 0.78, 1)
		"tumbado":
			# boca arriba sobre el colchón (alt): los pies en el origen del actor y la cabeza hacia -Z
			cuerpo.position.y = alt + 0.18
			cuerpo.scale = Vector3.ONE
		_:
			cuerpo.position.y = 0.0
			cuerpo.scale = Vector3.ONE
	cuerpo.rotation.x = -PI * 0.5 if p == "tumbado" else 0.0
	nodo.visible = p != "oculto"
	var aro := nodo.get_node_or_null("Aro")   # el aro amarillo del jugador no se queda a los pies de la cama
	if aro != null:
		aro.visible = p != "tumbado"

# bebida en la mano (icono sobre el hombro)
func poner_mano(v: String, jg) -> void:
	mano = v
	if etq_mano == null:
		etq_mano = jg.etiqueta("", Vector3(0.35, 1.25, 0), 30, Color.WHITE)
		etq_mano.reparent(nodo, false)
		etq_mano.position = Vector3(0.35, 1.25, 0)
		etq_mano.pixel_size = 0.0075
	etq_mano.text = Acciones.icono_mano(v)
	etq_mano.visible = v != ""

func progreso(f: float, jg) -> void:
	if barra_n == null:
		barra_n = Node3D.new()
		nodo.add_child(barra_n)
		barra_n.position = Vector3(0, alto_cab + 0.45, 0)
		var q := QuadMesh.new()
		q.size = Vector2(1.0, 0.14)
		var fondo := MeshInstance3D.new()
		fondo.mesh = q
		fondo.material_override = jg.mat_barra(Color(0.05, 0.06, 0.1, 0.85), 1)
		barra_n.add_child(fondo)
		barra_fill = MeshInstance3D.new()
		barra_fill.mesh = QuadMesh.new()
		barra_fill.material_override = jg.mat_barra(Color(0.4, 0.9, 0.45, 1.0), 2)
		barra_n.add_child(barra_fill)
	barra_n.visible = f >= 0.0
	if f >= 0.0:
		f = clampf(f, 0.01, 1.0)
		var q2: QuadMesh = barra_fill.mesh
		q2.size = Vector2(0.94 * f, 0.09)
		q2.center_offset = Vector3(-0.47 + 0.47 * f, 0, 0)
