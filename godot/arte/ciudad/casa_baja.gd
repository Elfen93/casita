extends Node3D
## Casa baja (1-2 plantas) con tejado a dos aguas. Origen en el suelo, puerta hacia -Z.
@export var plantas := 2
@export var ancho := 8.0
@export var fondo := 9.0
@export var color := Color("e2cfa8")
@export var color_tejas := Color("a8553a")
@export var semilla := 3.0

func _ready() -> void:
	var h := plantas * 2.9
	var muros := MeshInstance3D.new()
	muros.name = "Muros"
	var bm := BoxMesh.new()
	bm.size = Vector3(ancho, h, fondo)
	muros.mesh = bm
	muros.position.y = h * 0.5
	muros.material_override = Fachada.material(Vector3(ancho, h, fondo), color, 2.9, semilla, true, color_tejas)
	add_child(muros)
	# tejado a dos aguas con la cumbrera a lo largo de X (paralela a la calle)
	var tj := MeshInstance3D.new()
	tj.name = "Tejado"
	var pm := PrismMesh.new()
	pm.size = Vector3(fondo + 0.8, 2.2, ancho + 0.8)
	tj.mesh = pm
	tj.rotation.y = PI / 2
	tj.position.y = h + 1.1
	var mt := StandardMaterial3D.new()
	mt.albedo_color = color_tejas
	mt.roughness = 0.9
	tj.material_override = mt
	add_child(tj)
