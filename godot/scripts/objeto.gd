class_name Objeto
extends RefCounted
# Un mueble (o un cliente) con sus puntos de uso. Sus acciones salen de data/interiores.json -> tipos[tipo].acciones.
var id := ""
var tipo := ""
var def: Dictionary = {}
var interior := ""
var pos := Vector2.ZERO     # metros del mundo (x,z)
var giro := 0.0             # grados; 0 = el frente (+Z local) mira al sur (a la puerta del bar)
var nodo: Node3D
var alto := 1.0
var huella := Vector2(1, 1)
var ocupado := {}           # índice de uso -> Actor
var actor: Actor = null     # solo en tipo "cliente"
var cli: Dictionary = {}    # estado del cliente (bar.gd)

func local_a_mundo(l: Vector2) -> Vector2:
	var v := Basis(Vector3.UP, deg_to_rad(giro)) * Vector3(l.x, 0, l.y)
	return pos + Vector2(v.x, v.z)

func n_usos() -> int:
	return (def.get("uso", []) as Array).size()

func punto_uso(i: int) -> Vector2:
	if tipo == "cliente" and actor != null:
		return actor.pos2() + Vector2(0.9, 0.9)
	var u: Array = def["uso"][i]
	return local_a_mundo(Vector2(float(u[0]), float(u[1])))

func uso_libre() -> int:
	if tipo == "cliente":
		return 0
	var n := n_usos()
	if n == 0:
		return 0
	for i in n:
		if not ocupado.has(i) or ocupado[i] == null:
			return i
	return -1

func asiento_mundo() -> Vector3:
	var a: Array = def.get("asiento", [0, 0.5, 0])
	var v := Basis(Vector3.UP, deg_to_rad(giro)) * Vector3(float(a[0]), 0, float(a[2]))
	return Vector3(pos.x + v.x, float(a[1]), pos.y + v.z)

func aabb() -> AABB:
	var c := pos if actor == null else actor.pos2()
	var w := maxf(huella.x, huella.y) + 0.3
	return AABB(Vector3(c.x - w * 0.5, 0.0, c.y - w * 0.5), Vector3(w, alto, w))

func alt_asiento() -> float:
	var m = def.get("modelo", null)
	if m != null and m.has("asiento"):
		return float(m["asiento"])
	return float(def.get("asiento", [0, 0.5, 0])[1])
