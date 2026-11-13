extends Node3D
## Muestra GD-10a: enseña el humano moldeable y saca una captura.
## xvfb-run godot --path godot res://arte/humano/muestra_humano.tscn -- foto=/ruta.png [vista=cuerpo|busto|perfil|espalda]
##   [peso=0.8 musculo=-1 ...(cualquier id de forma)] [piel=oscura] [pelo=corto:#3a2412]
##   [ropa=arriba:camiseta:#c0392b,abajo:vaqueros:#2c4a7a] [expr=sonrisa:1,enfado:0.5]
##   [aspecto=/ruta.json]  (un aspecto)   [hoja=/ruta.json] (lista de aspectos, en fila)   [ancho=900 alto=1200]
var camara: Camera3D

func _aspecto_de_args(ua: PackedStringArray) -> Dictionary:
	var cat := Humano.catalogo()
	var ids := []
	for f in cat["formas"]:
		ids.append(f["id"])
	var a := {"formas": {}, "ropa": {}, "expresiones": {}}
	for s in ua:
		if not "=" in s:
			continue
		var k := s.get_slice("=", 0)
		var v := s.substr(k.length() + 1)
		if ids.has(k):
			a["formas"][k] = float(v)
		elif k == "piel":
			a["piel"] = v
		elif k == "pelo":
			a["pelo"] = {"id": v.get_slice(":", 0), "color": v.get_slice(":", 1) if ":" in v else "#40291a"}
		elif k == "ropa":
			for it in v.split(","):
				var p := it.split(":")
				a["ropa"][p[0]] = {"id": p[1], "color": p[2] if p.size() > 2 else "#808080"}
		elif k == "expr":
			for it in v.split(","):
				a["expresiones"][it.get_slice(":", 0)] = float(it.get_slice(":", 1)) if ":" in it else 1.0
		elif k == "aspecto":
			a = JSON.parse_string(FileAccess.get_file_as_string(v))
	return a

func _ready() -> void:
	var ua := OS.get_cmdline_user_args()
	var ruta := ""
	var vista := "cuerpo"
	var hoja := ""
	var ancho := 700
	var alto := 1000
	for s in ua:
		if s.begins_with("foto="): ruta = s.substr(5)
		if s.begins_with("vista="): vista = s.substr(6)
		if s.begins_with("hoja="): hoja = s.substr(5)
		if s.begins_with("ancho="): ancho = int(s.substr(6))
		if s.begins_with("alto="): alto = int(s.substr(5))
	get_window().size = Vector2i(ancho, alto)
	get_viewport().size = Vector2i(ancho, alto)
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.62, 0.68, 0.72)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.75, 0.78, 0.85)
	env.ambient_light_energy = 0.7
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sol := DirectionalLight3D.new()
	sol.rotation_degrees = Vector3(-35, 25, 0)
	sol.light_energy = 1.1
	add_child(sol)
	var luz2 := DirectionalLight3D.new()
	luz2.rotation_degrees = Vector3(-20, 160, 0)
	luz2.light_energy = 0.35
	add_child(luz2)
	var lista: Array = []
	if hoja != "":
		lista = JSON.parse_string(FileAccess.get_file_as_string(hoja))
	else:
		lista = [_aspecto_de_args(ua)]
	var n := lista.size()
	var hs := []
	for i in n:
		var h: Humano = load("res://arte/humano/humano.tscn").instantiate()
		add_child(h)
		h.aplicar(lista[i])
		h.position.x = (i - (n - 1) / 2.0) * (0.45 if vista == "cara" else 1.15)
		if vista == "perfil": h.rotation_degrees.y = 90
		if vista == "espalda": h.rotation_degrees.y = 180
		hs.append(h)
	camara = Camera3D.new()
	add_child(camara)
	if (vista == "busto" or vista == "cara") and n > 1:
		# varias personas: cámara de cara que abarca la fila
		var hh2: float = hs[0].altura()
		var zz := 0.42 * (1.0 + n * 0.5)
		camara.fov = 30
		camara.look_at_from_position(Vector3(0, hh2 - 0.12, -zz), Vector3(0, hh2 - 0.12, 0))
	elif vista == "busto" or vista == "cara":
		var hh: float = hs[0].altura()
		var z := 0.85 if vista == "busto" else 0.55
		var y := hh - (0.27 if vista == "busto" else 0.09)
		camara.position = Vector3(0, y, -z)
		camara.fov = 32
		camara.look_at_from_position(Vector3(0, y, -z), Vector3(0, y, 0))
		camara.rotation_degrees.y = 180 if false else camara.rotation_degrees.y
		# mirando desde -Z hacia +Z no: la persona mira a -Z, así que la cámara va en -Z mirando a +Z
	else:
		var ancho_total := maxf(1.6, 1.15 * n + 0.3)
		var dist := ancho_total / (2.0 * tan(deg_to_rad(15.0)) * (float(ancho) / alto))
		dist = maxf(dist, 1.9 / (2.0 * tan(deg_to_rad(15.0))))
		camara.fov = 30
		camara.look_at_from_position(Vector3(0, 0.88, -dist), Vector3(0, 0.88, 0))
	camara.current = true
	if ruta != "":
		await get_tree().create_timer(2.0).timeout
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(ruta)
		get_tree().quit()
