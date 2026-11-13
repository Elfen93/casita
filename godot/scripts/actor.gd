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

func _init(f: Dictionary) -> void:
	nodo = f["nodo"]
	cuerpo = f["cuerpo"]

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

func poner_postura(p: String) -> void:
	postura = p
	match p:
		"sentado":
			cuerpo.position.y = -0.42
			cuerpo.scale = Vector3(1, 0.78, 1)
		_:
			cuerpo.position.y = 0.0
			cuerpo.scale = Vector3.ONE
	nodo.visible = p != "oculto"

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
