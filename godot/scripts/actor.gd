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

# la animación sale del estado real: andar/correr, sentado (con brazos al beber o hablar), usar (barra de progreso), beber, hablar
func anim_tick() -> void:
	if not esq_on:
		return
	var n := "parado"
	var br := ""
	var vel_a := 1.0
	var hablando := estado_etq != null and estado_etq.visible and estado_etq.text.begins_with("💬")
	var espera := estado_etq != null and estado_etq.visible and estado_etq.text.begins_with("Esperando")
	var usando := barra_n != null and barra_n.visible
	var bebe := mano != "" and Acciones.producto(mano).has("beber")   # el plato no se lleva como una copa
	# tumbado: la persona se acuesta centrada en la cama (el actor está en los pies, cabeza hacia -Z), sobre el colchón
	if holder != null:
		holder.position = Vector3(0, alt_asiento, -0.8) if postura == "tumbado" else Vector3.ZERO
	if postura == "tumbado":
		n = "dormir"
	elif postura == "sentado":
		n = "sentado"
		if bebe:
			br = "beber"
		elif hablando:
			br = "hablar"
	elif anda:
		if vel >= Escala.VEL_CORRER - 0.1:
			n = "correr"
			vel_a = 1.35
		else:
			n = "andar"
			vel_a = 1.7
	elif espera or hablando:
		n = "hablar"
	elif usando:
		n = "beber" if bebe else "usar"
	elif bebe:
		n = "beber"
	var k := "%s/%s" % [n, br]
	if k == _anim_k:
		return
	_anim_k = k
	if n == "sentado":
		persona.set_altura_asiento(alt_asiento)
	persona.anim(n, vel_a, br)

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
func mover(paso: float) -> bool:
	ult_paso = 0.0
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
