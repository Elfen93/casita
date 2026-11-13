class_name Calle
extends RefCounted
# Mobiliario urbano del arte libre (godot/arte/ciudad/objetos): árboles, bancos, farolas y papeleras, agrupados con MultiMesh
# (un dibujo por pieza de cada modelo, sea cual sea el número de copias). Las farolas se encienden de noche: bombilla emisiva
# en todas y, como mucho, LUCES_MAX OmniLight reales colocadas en las más cercanas a la cámara.
const ESCENAS := {
	"arbol": "res://arte/ciudad/objetos/arbol.tscn",
	"banco": "res://arte/ciudad/objetos/banco_parque.tscn",
	"farola": "res://arte/ciudad/objetos/farola.tscn",
	"papelera": "res://arte/ciudad/objetos/papelera.tscn",
}
const LUCES_MAX := 7
var jg
var xfs := {"arbol": [], "banco": [], "farola": [], "papelera": []}
var farolas: Array = []      # Vector3 de cada farola
var luces: Array = []
var bombilla: StandardMaterial3D
var _ult := Vector3(1e9, 0, 0)

func _init(j) -> void:
	jg = j

func poner(tipo: String, pos: Vector3, giro := 0.0, esc := 1.0) -> void:
	var b := Basis(Vector3.UP, giro).scaled(Vector3.ONE * esc)
	xfs[tipo].append(Transform3D(b, pos))
	if tipo == "farola":
		farolas.append(pos)

static func _rel(n: Node3D, raiz: Node) -> Transform3D:
	var t := Transform3D.IDENTITY
	var x: Node = n
	while x != null and x != raiz:
		t = (x as Node3D).transform * t
		x = x.get_parent()
	return t

func construir() -> void:
	bombilla = StandardMaterial3D.new()
	bombilla.albedo_color = Color(1, 0.95, 0.8)
	bombilla.emission_enabled = true
	bombilla.emission = Color(1.0, 0.8, 0.45)
	bombilla.emission_energy_multiplier = 0.0
	for tipo in xfs:
		var lista: Array = xfs[tipo]
		if lista.is_empty():
			continue
		var raiz: Node3D = (load(ESCENAS[tipo]) as PackedScene).instantiate()
		for m in raiz.find_children("*", "MeshInstance3D", true, false):
			var mi: MeshInstance3D = m
			var pt := _rel(mi, raiz)
			_multi(mi.mesh, mi.material_override, lista, pt, tipo == "arbol" or tipo == "farola")
		raiz.free()
	if not farolas.is_empty():
		var sp := SphereMesh.new()
		sp.radius = 0.3
		sp.height = 0.6
		sp.radial_segments = 6
		sp.rings = 3
		var lst: Array = []
		for p in farolas:
			lst.append(Transform3D(Basis.IDENTITY, p))
		_multi(sp, bombilla, lst, Transform3D(Basis.IDENTITY, Vector3(0, 4.25, 0)), false)
		for i in LUCES_MAX:
			var l := OmniLight3D.new()
			l.light_color = Color(1.0, 0.82, 0.55)
			l.omni_range = 11.0
			l.light_energy = 0.0
			l.visible = false
			jg.add_child(l)
			luces.append(l)

func _multi(mesh: Mesh, mat: Material, lista: Array, parte: Transform3D, sombra: bool) -> void:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = mesh
	mm.instance_count = lista.size()
	for i in lista.size():
		mm.set_instance_transform(i, (lista[i] as Transform3D) * parte)
	var inst := MultiMeshInstance3D.new()
	inst.multimesh = mm
	if mat != null:
		inst.material_override = mat
	inst.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if sombra else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	jg.add_child(inst)

# de noche: bombillas encendidas y las LUCES_MAX farolas más cercanas a la cámara con luz de verdad
func noche(n: float, cam: Vector3) -> void:
	if bombilla == null:
		return
	var enc := clampf(n * 2.0 - 0.7, 0.0, 1.0)
	bombilla.emission_energy_multiplier = enc * 3.0
	if enc <= 0.0:
		for l in luces:
			l.visible = false
		_ult = Vector3(1e9, 0, 0)
		return
	if cam.distance_to(_ult) < 4.0 and luces[0].visible:
		for l in luces:
			l.light_energy = enc * 1.6
		return
	_ult = cam
	var orden: Array = []
	for p in farolas:
		orden.append([p.distance_squared_to(cam), p])
	orden.sort_custom(func(a, b): return a[0] < b[0])
	for i in luces.size():
		var l: OmniLight3D = luces[i]
		if i < orden.size() and orden[i][0] < 90.0 * 90.0:
			l.position = orden[i][1] + Vector3(0, 4.1, 0)
			l.light_energy = enc * 1.6
			l.visible = true
		else:
			l.visible = false
