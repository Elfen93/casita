class_name Datos
# Lee los .json de res://data/ (copiados de data/ por scripts/godot_datos.py).
static func cargar(nombre: String) -> Dictionary:
	var f := FileAccess.open("res://data/%s.json" % nombre, FileAccess.READ)
	if f == null:
		push_error("No se encuentra data/%s.json" % nombre)
		return {}
	var d = JSON.parse_string(f.get_as_text())
	return d if d is Dictionary else {}

static func color(s, por_defecto := Color(0.8, 0.8, 0.8)) -> Color:
	if s is String and s.begins_with("#"):
		return Color.html(s)
	return por_defecto
