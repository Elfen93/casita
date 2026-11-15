class_name Historia
extends RefCounted
# La historia de la partida: lo que ha pasado cada día, en frases cortas («Cocinaste.», «Conociste a Pilar.»).
# Una sola puerta para todos los bloques:
#     Historia.contar("Conociste a Pilar.", "🤝")
# (estática: vale desde cualquier script; si aún no hay partida montada, no hace nada).
# La misma frase dos veces el mismo día no se repite: se cuenta («Fregaste los platos. (2 veces)»).
# Se guarda en la sección «historia» (la registra Objetivos), recortada a los últimos `historia.dias` días.
# El panel «Historia» del Menú y la tarjeta de resumen al despertar los pinta Objetivos (scripts/objetivos.gd).

static var _yo: Historia = null

var main: Node
var dias: Array = []        # [{"d": día, "l": [[minuto del día, icono, texto, veces], …]}, …] del más antiguo al último
var max_dias := 14

func _init(m: Node, max_dias_ := 14) -> void:
	main = m
	max_dias = max_dias_
	_yo = self

static func contar(texto: String, icono := "") -> void:
	if _yo != null and is_instance_valid(_yo.main):
		_yo.apuntar(texto, icono)

func dia_actual() -> int:
	return int(main.minutos / 1440.0)

func apuntar(texto: String, icono := "") -> void:
	texto = texto.strip_edges()
	if texto == "":
		return
	var d := dia_actual()
	if dias.is_empty() or int(dias[-1]["d"]) != d:
		dias.append({"d": d, "l": []})
		while dias.size() > max_dias:
			dias.pop_front()
	var l: Array = dias[-1]["l"]
	for x in l:
		if str(x[2]) == texto:
			x[3] = int(x[3]) + 1
			return
	l.append([int(fposmod(main.minutos, 1440.0)), icono, texto, 1])

func lineas(d: int) -> Array:
	for x in dias:
		if int(x["d"]) == d:
			return x["l"]
	return []

static func texto_linea(x: Array, veces_txt: String) -> String:
	var t := str(x[2])
	if int(x[3]) > 1:
		t += " " + veces_txt.replace("{n}", str(x[3]))
	return t

# =============== guardado ===============
func guardar() -> Dictionary:
	return {"dias": dias.duplicate(true)}

func aplicar(d: Dictionary) -> void:
	var ds = d.get("dias", null)
	if not (ds is Array):
		return
	var ok: Array = []
	for x in ds:
		if not (x is Dictionary) or not (x.get("l", null) is Array):
			continue
		var l: Array = []
		for y in x["l"]:
			if y is Array and y.size() >= 3:
				l.append([int(y[0]), str(y[1]), str(y[2]), int(y[3]) if y.size() > 3 else 1])
		ok.append({"d": int(x.get("d", 0)), "l": l})
	while ok.size() > max_dias:
		ok.pop_front()
	dias = ok
