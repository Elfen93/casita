class_name Maniqui
extends RefCounted
# Cargador: usa el cuerpo de verdad (res://arte/humano/humano.tscn) si existe y, si no, el maniquí de pega.

const RUTA_HUMANO := "res://arte/humano/humano.tscn"
const PEGA := preload("res://crear/maniqui_pega.gd")

static func es_de_pega() -> bool:
	return not ResourceLoader.exists(RUTA_HUMANO)

# Catálogo del cuerpo que se vaya a usar (método estático de la clase correspondiente).
static func catalogo() -> Dictionary:
	if es_de_pega():
		return PEGA.catalogo()
	var inst = load(RUTA_HUMANO).instantiate()
	var c: Dictionary = inst.get_script().catalogo()
	inst.free()
	return c

static func crear() -> Node3D:
	if es_de_pega():
		return PEGA.new()
	return load(RUTA_HUMANO).instantiate()
