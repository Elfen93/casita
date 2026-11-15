class_name Escala
# REGLA DE ESCALA (un solo sitio). 1 unidad de Godot = 1 metro; el personaje mide 1,7 m.
# Las coordenadas de data/ciudad.json (y de lugares.json) se multiplican por M_UNIDAD:
# 1 casilla del dato = 6 m según el encargo = 3 m por unidad de coordenada del dato (el dato trae 120x100 unidades por barrio): La Ribera mide 360x300 m.
const M_UNIDAD := 3.0
const ALTURA_PJ := 1.7
const CALLE := 8.0            # ancho de calzada
const ACERA := 3.0            # ancho de cada acera
const CELDA := 1.0            # rejilla de caminos (m)
const VEL_ANDAR := 3.5        # m/s visual, paso vivo
const VEL_CORRER := 7.0       # el doble si el destino queda lejos
const CORRER_DESDE := 60.0    # m de trayecto a partir de los que se corre
# EL RELOJ AL ANDAR: el trayecto cobra lo que costaría en el juego web, no lo que dure verlo:
# 10 m por unidad (0,119 min de juego por unidad del dato; cruzar los 120 de punta a punta = 14 min de juego)
# 10 m por unidad del dato a 84 m/min = 0,119 min de juego por unidad.
const MIN_POR_UNIDAD := 0.119
const MUNDO := Rect2(-8, -8, 384, 324)   # lo que cubre la rejilla (m)

static func m(v: float) -> float:
	return v * M_UNIDAD

static func v2(a: Array) -> Vector2:
	return Vector2(float(a[0]) * M_UNIDAD, float(a[1]) * M_UNIDAD)

static func rect(rb: Array) -> Rect2:
	return Rect2(float(rb[0]) * M_UNIDAD, float(rb[1]) * M_UNIDAD, float(rb[2] - rb[0]) * M_UNIDAD, float(rb[3] - rb[1]) * M_UNIDAD)

# minutos de juego que cuesta recorrer `metros` andando por la calle
static func min_de_metros(metros: float) -> float:
	return metros / M_UNIDAD * MIN_POR_UNIDAD

# ---------------------------------------------------------------- ZANCADA (que los pies no resbalen)
# «Avance» de una animación de andar/correr = metros por segundo que recorre el pie apoyado (hacia atrás, respecto al
# cuerpo) con la animación a velocidad 1,0. Si el actor se mueve a v m/s, la animación tiene que ir a v / avance:
# así el pie que pisa se queda quieto en el suelo. El avance depende del tamaño del personaje (piernas más cortas,
# pasos más cortos), por eso se guarda relativo y se multiplica por la escala de cada persona.
# Valores de reserva (si no hay dato ni se puede medir), en ALTURAS del personaje por segundo:
#   andar ≈ 0,78 alturas/s (1,4 m/s para 1,80 m), correr ≈ 2,1 alturas/s (3,8 m/s para 1,80 m): lo típico de Mixamo.
const ZANCADA_RESERVA := {"andar": 0.78, "correr": 2.1}
const RITMO_MIN := 0.4        # topes de speed_scale: fuera de esto algo va mal (dato raro); mejor que resbale un poco
const RITMO_MAX := 5.0        # (a doble velocidad de juego el actor va 1,8 veces más rápido)
static var _zancadas := {}    # caché de medidas: clave -> avance por unidad de escala de la cadena de nodos

## m/s del pie apoyado de `an` (a velocidad 1,0) en el espacio de `raiz` (la persona: origen en el suelo, +Y arriba).
## Se mide en la propia animación: cinemática directa de los huesos de los pies, sin reproducirla (< 1 ms, y se
## guarda en caché). 0.0 si no se puede.
## `clave` distingue animaciones de igual forma en esqueletos distintos (la caché se comparte entre personas).
static func medir_zancada(sk: Skeleton3D, an: Animation, raiz: Node, clave: String) -> float:
	if sk == null or an == null or an.length <= 0.0:
		return 0.0
	# cadena de transformaciones del esqueleto hasta la persona (incluye la escala de cada una: altura, edad…)
	var cadena := Transform3D.IDENTITY
	var n: Node = sk
	while n != null and n != raiz:
		if n is Node3D:
			cadena = (n as Node3D).transform * cadena
		n = n.get_parent()
	var esc := cadena.basis.get_scale().x
	if esc <= 0.0:
		return 0.0
	var pies := _huesos_pies(sk)
	if pies.is_empty():
		return 0.0
	# la clave incluye el largo de la pierna en reposo: dos esqueletos con los mismos huesos pero otras proporciones no se mezclan
	var pierna := sk.get_bone_global_rest(pies[0]).origin.length()
	var k := "%s|%d|%.4f|%d|%.4f|%.4f" % [clave, sk.get_bone_count(), an.length, an.get_track_count(), sk.motion_scale, pierna]
	if _zancadas.has(k):
		return float(_zancadas[k]) * esc
	# pistas por hueso
	var pistas := {}   # hueso -> {"p": idx, "r": idx, "s": idx}
	for i in an.get_track_count():
		var b := sk.find_bone(str(an.track_get_path(i).get_concatenated_subnames()))
		if b < 0:
			continue
		var d: Dictionary = pistas.get(b, {})
		match an.track_get_type(i):
			Animation.TYPE_POSITION_3D: d["p"] = i
			Animation.TYPE_ROTATION_3D: d["r"] = i
			Animation.TYPE_SCALE_3D: d["s"] = i
		pistas[b] = d
	# muestreo del ciclo: posición de cada pie (en el espacio de la persona) en N+1 instantes
	const N := 96
	var dt := an.length / N
	var tray := []   # por pie: Array de Vector3
	for p in pies:
		tray.append([])
	for j in N + 1:
		var t := minf(j * dt, an.length)
		var glob := {}
		for pi_ in pies.size():
			tray[pi_].append(cadena * _global_hueso(sk, an, pistas, pies[pi_], t, glob).origin)
	# mientras un pie pisa (cerca de su punto más bajo) recorre hacia atrás lo mismo que debe avanzar el actor:
	# avance = recorrido en planta del pie en esos tramos / tiempo que dura. Con la media del tramo entero el
	# deslizamiento total es nulo aunque la animación no lleve el pie a velocidad constante (la carrera de Quaternius).
	var dist := 0.0
	var tiempo := 0.0
	for tr in tray:
		var ymin := INF
		var ymax := -INF
		for q in tr:
			ymin = minf(ymin, q.y)
			ymax = maxf(ymax, q.y)
		var umbral := ymin + 0.1 * (ymax - ymin)
		var ini := -1
		for j in N + 2:
			var abajo: bool = j <= N and tr[j].y <= umbral
			if abajo and ini < 0:
				ini = j
			elif not abajo and ini >= 0:
				if j - 1 > ini:
					var d: Vector3 = tr[j - 1] - tr[ini]
					dist += Vector2(d.x, d.z).length()
					tiempo += (j - 1 - ini) * dt
				ini = -1
	if tiempo <= 0.0:
		return 0.0
	var med := dist / tiempo
	if not is_finite(med) or med <= 0.0:
		return 0.0
	_zancadas[k] = med / esc
	return med

## índices de los huesos de los pies (Mixamo: «…LeftFoot»; Quaternius: «Foot.L»)
static func _huesos_pies(sk: Skeleton3D) -> Array:
	var izq := -1
	var der := -1
	for i in sk.get_bone_count():
		var nm := sk.get_bone_name(i).to_lower()
		if nm.ends_with("leftfoot") or nm in ["foot.l", "foot_l", "l_foot"]:
			izq = i
		elif nm.ends_with("rightfoot") or nm in ["foot.r", "foot_r", "r_foot"]:
			der = i
	return [izq, der] if izq >= 0 and der >= 0 else []

## pose global (espacio del esqueleto) del hueso `b` en el instante t de la animación; sin pista, el reposo.
## Las pistas de posición se multiplican por motion_scale, como hace el AnimationPlayer (personajes que usan las
## animaciones de otro con otra altura de cadera).
static func _global_hueso(sk: Skeleton3D, an: Animation, pistas: Dictionary, b: int, t: float, glob: Dictionary) -> Transform3D:
	if glob.has(b):
		return glob[b]
	var reposo := sk.get_bone_rest(b)
	var pos := reposo.origin
	var rot := reposo.basis.get_rotation_quaternion()
	var es := reposo.basis.get_scale()
	var d: Dictionary = pistas.get(b, {})
	if d.has("p"):
		pos = an.position_track_interpolate(d["p"], t) * sk.motion_scale
	if d.has("r"):
		rot = an.rotation_track_interpolate(d["r"], t)
	if d.has("s"):
		es = an.scale_track_interpolate(d["s"], t)
	var local := Transform3D(Basis(rot) * Basis.from_scale(es), pos)
	var padre := sk.get_bone_parent(b)
	var g := local if padre < 0 else _global_hueso(sk, an, pistas, padre, t, glob) * local
	glob[b] = g
	return g
