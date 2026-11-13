extends Node3D
## Bloque de pisos apilable: `plantas` plantas de `alto_planta` m. Origen en el suelo, portal hacia -Z.
##   var b = preload("res://arte/ciudad/bloque_pisos.tscn").instantiate()
##   b.plantas = 5; b.ancho = 12; b.fondo = 10; b.color = Color("d9b98c"); add_child(b)
@export var plantas := 5
@export var ancho := 12.0
@export var fondo := 10.0
@export var alto_planta := 3.0
@export var color := Color("d9b98c")
@export var semilla := 1.0
@export var portal := true
var malla: MeshInstance3D

func _ready() -> void:
	reconstruir()

func reconstruir() -> void:
	if malla == null:
		malla = MeshInstance3D.new()
		malla.name = "Fachada"
		add_child(malla)
	var h := plantas * alto_planta
	var bm := BoxMesh.new()
	bm.size = Vector3(ancho, h, fondo)
	malla.mesh = bm
	malla.position = Vector3(0, h * 0.5, 0)
	malla.material_override = Fachada.material(Vector3(ancho, h, fondo), color, alto_planta, semilla, portal)
	malla.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
