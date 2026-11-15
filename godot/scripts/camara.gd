class_name Camara
extends Node
# CÁMARA LIBRE «como en Los Sims». main.gd crea el pivote (Node3D en el suelo, lo que se mira) y la Camera3D, y le pasa
# aquí el manejo: giro de 360° alrededor del pivote, inclinación de casi a ras del suelo a casi cenital, zoom de la cara
# de la persona a toda la manzana, desplazamiento libre por el barrio y volver a seguir a la jugadora.
#   Dedo:   uno arrastra (desplaza) · dos pellizcan (zoom) y giran (rotar) · dos a la vez arriba/abajo (inclinar).
#           Un toque sigue siendo un toque (main distingue toque de arrastre con mov_total: menos de 10-14 px no mueve).
#   Ratón:  botón derecho o central arrastrando gira/inclina (derecho sin arrastrar: andar ahí, como antes) · rueda: zoom ·
#           izquierdo arrastrando, o central + Mayús, desplaza.
#   Teclado (opcional): WASD desplaza, Q/E giran, R/F inclinan, +/- zoom, Espacio o C vuelve a la jugadora.
# El objetivo de zoom es main.dist (lo cambian también el interior, la partida guardada y las pruebas); el giro y la
# inclinación son de aquí. Todo se suaviza (interpolado) y se coloca después del _process de main (process_priority).
# El pivote lo mueve main cuando sigue a la jugadora (main.seguir); al desplazar, la cámara se queda libre (cam_libre).
# Dentro de un interior las paredes que dan a la cámara se aplastan (Interior.orientar); fuera, si la cámara cayera dentro
# de un edificio, se acerca hasta quedar delante de él. Nunca baja del suelo (la inclinación mínima es positiva).

const DIST_MIN := 0.8           # de cerca: la cara llena media pantalla
const DIST_MAX := 520.0         # de lejos: la manzana y el barrio
const INCL_MIN := 0.035         # ~2° sobre el horizonte (a ras del suelo, sin atravesarlo)
const INCL_MAX := 1.536         # ~88° (casi cenital; a 90° la cámara no sabría hacia dónde es «arriba»)
const GIRO_INICIAL := -0.4189   # -24°
const INCL_INICIAL := 0.9076    # 52°
const SUAVE := 12.0             # rapidez del suavizado (1/s)
const BORDE := 60.0             # cuánto puede salirse el pivote de lo que cubre la rejilla (m)

var jg                          # main
var giro := GIRO_INICIAL        # objetivo (rad, alrededor de Y)
var incl := INCL_INICIAL        # objetivo (rad sobre el horizonte)
var giro_v := GIRO_INICIAL      # lo que se ve (suavizado)
var incl_v := INCL_INICIAL
var dist_v := 18.0
var _prev := {}                 # toques del fotograma anterior (índice -> posición)
var _btn := 0                   # botón de ratón que arrastra la cámara (derecho/central), 0 = ninguno
var _btn_mov := 0.0
var _btn_desplaza := false
var dist_real := 18.0           # distancia tras recortar contra edificios (para pruebas)

func _init(jg_) -> void:
	jg = jg_
	name = "CamaraLibre"
	process_priority = 100      # después de main._process (que mueve el pivote al seguir a la jugadora)
	dist_v = float(jg.dist)

func libre() -> void:
	if not jg.cam_libre or jg.seguir:
		jg.cam_libre = true
		jg.seguir = false
		jg._texto_camara()

## vuelve a seguir a la jugadora
func centrar() -> void:
	jg.cam_libre = false
	jg.seguir = true
	jg._texto_camara()

## sin suavizado: salta a los objetivos (al cargar partida, en las pruebas)
func saltar() -> void:
	jg.dist = clampf(float(jg.dist), DIST_MIN, DIST_MAX)
	incl = clampf(incl, INCL_MIN, INCL_MAX)
	giro_v = giro
	incl_v = incl
	dist_v = float(jg.dist)
	colocar()

# ---------------------------------------------------------------- entrada (ratón, rueda, teclas, gestos de trackpad)
## main._input la llama primero; true = el evento era de cámara y ya está.
func entrada(ev: InputEvent) -> bool:
	if ev is InputEventMouseButton:
		var mb := ev as InputEventMouseButton
		if mb.device == InputEvent.DEVICE_ID_EMULATION:
			return false
		if mb.pressed and mb.button_index in [MOUSE_BUTTON_WHEEL_UP, MOUSE_BUTTON_WHEEL_DOWN]:
			if jg._en_ui(mb.position):
				return false
			var f := maxf(mb.factor, 1.0) if mb.factor > 0.0 else 1.0
			jg.dist *= pow(0.88 if mb.button_index == MOUSE_BUTTON_WHEEL_UP else 1.0 / 0.88, f)
			jg._poner_camara()
			return true
		if mb.button_index in [MOUSE_BUTTON_RIGHT, MOUSE_BUTTON_MIDDLE]:
			jg.con_raton = true
			if mb.pressed:
				if jg._en_ui(mb.position):
					return true
				_btn = mb.button_index
				_btn_mov = 0.0
				_btn_desplaza = mb.button_index == MOUSE_BUTTON_MIDDLE and mb.shift_pressed
			elif mb.button_index == _btn:
				# botón derecho sin arrastrar: andar adonde se señala (lo de siempre en el ordenador)
				if _btn == MOUSE_BUTTON_RIGHT and _btn_mov < 6.0 and not jg._en_ui(mb.position):
					jg._andar_a_pantalla(mb.position)
				_btn = 0
			return true
		return false
	if ev is InputEventMouseMotion and _btn != 0:
		var mm := ev as InputEventMouseMotion
		_btn_mov += mm.relative.length()
		if _btn_mov < 4.0:
			return true
		if _btn_desplaza or (mm.shift_pressed and _btn == MOUSE_BUTTON_MIDDLE):
			desplazar(mm.relative)
		else:
			giro -= mm.relative.x * 0.008
			incl = clampf(incl + mm.relative.y * 0.006, INCL_MIN, INCL_MAX)
		return true
	if ev is InputEventMagnifyGesture:
		jg.dist /= maxf((ev as InputEventMagnifyGesture).factor, 0.01)
		jg._poner_camara()
		return true
	if ev is InputEventPanGesture:
		var pg := ev as InputEventPanGesture
		jg.dist *= pow(1.06, pg.delta.y)
		giro -= pg.delta.x * 0.03
		jg._poner_camara()
		return true
	if ev is InputEventKey and ev.pressed and not ev.echo and not _escribiendo():
		if (ev as InputEventKey).keycode in [KEY_SPACE, KEY_C]:
			centrar()
			return true
	return false

func _escribiendo() -> bool:
	var f: Control = jg.get_viewport().gui_get_focus_owner()
	return f is LineEdit or f is TextEdit

# ---------------------------------------------------------------- desplazar con el dedo o el ratón
## mueve el pivote para que el suelo siga al dedo (`rel` en píxeles de pantalla)
func desplazar(rel: Vector2) -> void:
	if rel == Vector2.ZERO:
		return
	libre()
	var vp: Vector2 = jg.get_viewport().get_visible_rect().size
	var k := 2.0 * tan(deg_to_rad(jg.camara.fov * 0.5)) * dist_real / maxf(vp.x, 1.0)
	var b: Basis = jg.pivote.global_transform.basis
	# hacia el fondo de la pantalla el suelo se ve escorzado: a ras de suelo un píxel son más metros (con tope)
	var d: Vector3 = (b.x * rel.x + b.z * rel.y / maxf(sin(incl_v), 0.3)) * k
	_mover_pivote(-d)

func _mover_pivote(d: Vector3) -> void:
	var p: Vector3 = jg.pivote.position + Vector3(d.x, 0, d.z)
	var m: Rect2 = Escala.MUNDO.grow(BORDE)
	p.x = clampf(p.x, m.position.x, m.end.x)
	p.z = clampf(p.z, m.position.y, m.end.y)
	jg.pivote.position = p

# ---------------------------------------------------------------- gestos de dedo (main lleva la cuenta de los toques)
func _gestos() -> void:
	var t: Dictionary = jg.toques
	if t.size() == 2 and _prev.size() == 2 and _prev.has(t.keys()[0]) and _prev.has(t.keys()[1]):
		var ks: Array = t.keys()
		var p0: Vector2 = _prev[ks[0]]
		var p1: Vector2 = _prev[ks[1]]
		var q0: Vector2 = t[ks[0]]
		var q1: Vector2 = t[ks[1]]
		var m0 := q0 - p0
		var m1 := q1 - p1
		var dp := p1 - p0
		var dq := q1 - q0
		# los dos dedos a la vez hacia arriba o hacia abajo (casi en vertical y sin abrirse): inclinar
		var vertical := m0.y * m1.y > 0.0 and absf(m0.y) > absf(m0.x) * 1.2 and absf(m1.y) > absf(m1.x) * 1.2 \
			and absf(dq.length() - dp.length()) < 0.6 * (absf(m0.y) + absf(m1.y)) * 0.5
		if vertical:
			# subir los dedos baja la cámara hacia el horizonte (como en los mapas)
			incl = clampf(incl + (m0.y + m1.y) * 0.5 * 0.005, INCL_MIN, INCL_MAX)
		elif dp.length() > 4.0 and dq.length() > 4.0:
			jg.dist *= dp.length() / dq.length()          # pellizcar: zoom
			jg._poner_camara()
			giro += wrapf(dq.angle() - dp.angle(), -PI, PI)   # girar los dedos: el barrio gira con ellos
	elif t.size() == 1 and jg.gesto_max == 1 and jg.mov_total >= 10.0:
		var k: int = t.keys()[0]
		if _prev.has(k):
			desplazar(t[k] - _prev[k])
	_prev = t.duplicate()

func _teclado(dt: float) -> void:
	if _escribiendo() or not jg.is_processing_input():
		return
	var mv := Vector2.ZERO
	if Input.is_key_pressed(KEY_W): mv.y -= 1.0
	if Input.is_key_pressed(KEY_S): mv.y += 1.0
	if Input.is_key_pressed(KEY_A): mv.x -= 1.0
	if Input.is_key_pressed(KEY_D): mv.x += 1.0
	if mv != Vector2.ZERO:
		libre()
		var b: Basis = jg.pivote.global_transform.basis
		_mover_pivote((b.x * mv.x + b.z * mv.y) * maxf(dist_real, 4.0) * 0.9 * dt)
	if Input.is_key_pressed(KEY_Q): giro += 1.8 * dt
	if Input.is_key_pressed(KEY_E): giro -= 1.8 * dt
	if Input.is_key_pressed(KEY_R): incl = clampf(incl + 1.0 * dt, INCL_MIN, INCL_MAX)
	if Input.is_key_pressed(KEY_F): incl = clampf(incl - 1.0 * dt, INCL_MIN, INCL_MAX)
	var z := 0.0
	if Input.is_key_pressed(KEY_EQUAL) or Input.is_key_pressed(KEY_KP_ADD) or Input.is_key_pressed(KEY_PLUS): z -= 1.0
	if Input.is_key_pressed(KEY_MINUS) or Input.is_key_pressed(KEY_KP_SUBTRACT): z += 1.0
	if z != 0.0:
		jg.dist *= exp(z * 1.6 * dt)
		jg._poner_camara()

# ---------------------------------------------------------------- colocar
func _process(dt: float) -> void:
	if jg.camara == null or jg.pivote == null:
		return
	_teclado(dt)
	_gestos()
	jg.dist = clampf(float(jg.dist), DIST_MIN, DIST_MAX)
	incl = clampf(incl, INCL_MIN, INCL_MAX)
	var k := 1.0 - exp(-SUAVE * minf(dt, 0.1))
	giro_v = lerp_angle(giro_v, giro, k)
	incl_v = lerpf(incl_v, incl, k)
	dist_v = exp(lerpf(log(dist_v), log(float(jg.dist)), k))   # el zoom se suaviza en escala logarítmica
	colocar()

## altura del punto que se mira: el pecho de lejos; de cerca, la cara (si se sigue a la persona)
func _alto_mirada(d: float) -> float:
	var cara := 1.55
	var a = jg.jugador
	if a != null and a.persona != null:
		cara = float(a.persona.altura) * 0.93
	if a != null:
		if a.postura == "sentado":
			cara *= 0.72
		elif a.postura == "tumbado":
			cara = a.alt_asiento + 0.25
	var cerca := 1.0 - smoothstep(1.5, 7.0, d)
	return lerpf(0.9, cara, cerca)

func colocar() -> void:
	var piv: Node3D = jg.pivote
	var cam: Camera3D = jg.camara
	piv.rotation = Vector3(0, giro_v, 0)
	var alto := _alto_mirada(dist_v)
	var mira := piv.global_position + Vector3(0, alto, 0)
	var off := Vector3(0, sin(incl_v), cos(incl_v))          # de la mirada a la cámara, en el espacio del pivote
	var dir: Vector3 = piv.global_transform.basis * off
	dist_real = _recortar(mira, dir, dist_v)
	cam.position = Vector3(0, alto, 0) + off * dist_real
	cam.look_at(mira, Vector3.UP)
	cam.near = clampf(dist_real * 0.04, 0.05, 0.3)
	jg.inclin = incl_v
	if jg.jugador_etq != null:
		jg.jugador_etq.visible = dist_real > 2.5   # de cerca el nombre taparía la cara
	if jg.interior != null and jg.en_interior:
		jg.interior.orientar(Vector2(dir.x, dir.z))

## si la cámara quedara dentro de un edificio (girando a ras de suelo), se acerca hasta delante de su fachada
func _recortar(mira: Vector3, dir: Vector3, d: float) -> float:
	var c := mira + dir * d
	for id in jg.edificios:
		var e: Dictionary = jg.edificios[id]
		if float(e["h"]) <= 1.0 or not e.has("aabb"):
			continue
		if jg.interior != null and e.get("interior", null) == jg.interior:
			continue    # tu piso: sus paredes se aplastan (Interior.orientar)
		var ab: AABB = (e["aabb"] as AABB).grow(0.3)
		if not ab.has_point(c) or ab.has_point(mira):
			continue
		var r = ab.intersects_segment(mira, c)
		if r != null:
			d = minf(d, mira.distance_to(r) - 0.2)
	return maxf(d, DIST_MIN * 0.5)

# ---------------------------------------------------------------- guardar y pruebas
func guardar() -> Dictionary:
	var d := {"giro": snappedf(rad_to_deg(giro), 0.1), "incl": snappedf(rad_to_deg(incl), 0.1)}
	if jg.cam_libre:
		d["x"] = snappedf(jg.pivote.position.x, 0.1)
		d["z"] = snappedf(jg.pivote.position.z, 0.1)
	return d

func aplicar(d: Dictionary) -> void:
	if d.has("giro") and (d["giro"] is float or d["giro"] is int):
		giro = deg_to_rad(float(d["giro"]))
	if d.has("incl") and (d["incl"] is float or d["incl"] is int):
		incl = clampf(deg_to_rad(float(d["incl"])), INCL_MIN, INCL_MAX)
	if jg.cam_libre and (d.get("x") is float or d.get("x") is int) and (d.get("z") is float or d.get("z") is int):
		jg.pivote.position = Vector3(float(d["x"]), 0, float(d["z"]))
		_mover_pivote(Vector3.ZERO)
	saltar()

## órdenes de prueba (window.casita_cmd): «vista» giro_grados incl_grados dist — salta sin suavizar; «centrar»
func cmd(c: String, args: Array) -> bool:
	match c:
		"vista":
			if args.size() > 1 and args[1] != null:
				giro = deg_to_rad(float(args[1]))
			if args.size() > 2 and args[2] != null:
				incl = deg_to_rad(float(args[2]))
			if args.size() > 3 and args[3] != null:
				jg.dist = float(args[3])
				jg._poner_camara()
			saltar()
			print("vista: giro=%.1f incl=%.1f dist=%.2f real=%.2f cam=%s" % [rad_to_deg(giro), rad_to_deg(incl), float(jg.dist), dist_real, str(jg.camara.global_position)])
			return true
		"centrar":
			centrar()
			return true
	return false
