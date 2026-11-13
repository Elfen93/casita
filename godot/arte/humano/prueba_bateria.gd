extends SceneTree
## Batería: 30 aspectos al azar con aplicar() y con llamadas sueltas en orden aleatorio; comprueba que ojos, cejas, pestañas y dientes
## están visibles, con material y con caja de recorte fija. godot --headless --path godot -s res://arte/humano/prueba_bateria.gd
var fallos := 0

func _comprobar(h: Humano, etiqueta: String) -> void:
	var cat := Humano.catalogo()
	var cej: String = h.aspecto()["cejas"]
	for k in ["Ojos", "pestanas", "dientes", "cejas_" + cej]:
		if not h._piezas.has(k):
			print("FALLO ", etiqueta, " falta ", k); fallos += 1; continue
		var p := h._piezas[k] as MeshInstance3D
		if not p.is_visible_in_tree():
			print("FALLO ", etiqueta, " invisible ", k); fallos += 1
		if p.material_override == null:
			print("FALLO ", etiqueta, " sin material ", k); fallos += 1
		if p.custom_aabb.size.y < 1.0:
			print("FALLO ", etiqueta, " sin custom_aabb ", k); fallos += 1
	var vis := 0
	for k in h._piezas:
		if k.begins_with("cejas_") and h._piezas[k].visible: vis += 1
	if vis != 1:
		print("FALLO ", etiqueta, " cejas visibles ", vis); fallos += 1
	var mo := (h._piezas["Ojos"] as MeshInstance3D).material_override as StandardMaterial3D
	if mo.albedo_texture == null:
		print("FALLO ", etiqueta, " ojos sin textura"); fallos += 1
	var pelo: String = h.aspecto()["pelo"]["id"]
	if pelo != "":
		var pp := h._piezas["pelo_" + pelo] as MeshInstance3D
		if not pp.visible:
			print("FALLO ", etiqueta, " pelo invisible ", pelo); fallos += 1
	var nvis := 0
	for k in h._piezas:
		if k.begins_with("pelo_") and h._piezas[k].visible: nvis += 1
	if nvis != (0 if pelo == "" else 1):
		print("FALLO ", etiqueta, " pelos visibles ", nvis); fallos += 1

func _init() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 12345
	var cat := Humano.catalogo()
	var h: Humano = load("res://arte/humano/humano.tscn").instantiate()
	root.add_child(h)
	await process_frame
	for i in 30:
		var a := {"formas": {}, "ropa": {}, "expresiones": {}}
		for f in cat["formas"]:
			a["formas"][f["id"]] = rng.randf_range(-1, 1) if rng.randf() < 0.7 else 0.0
		a["piel"] = cat["pieles"][rng.randi() % cat["pieles"].size()]["id"]
		var pe: Array = cat["pelos"]
		a["pelo"] = {"id": pe[rng.randi() % pe.size()]["id"], "color": Color(rng.randf(), rng.randf(), rng.randf()).to_html(false)}
		var cp := {}
		for r in cat["ropas"]:
			if rng.randf() < 0.5:
				cp[r["capa"]] = {"id": r["id"], "color": "#ffffff"}
		a["ropa"] = cp
		a["ojos"] = cat["ojos"][rng.randi() % cat["ojos"].size()]["id"]
		a["cejas"] = cat["cejas"][rng.randi() % cat["cejas"].size()]["id"]
		h.aplicar(a)
		_comprobar(h, "aplicar#%d" % i)
		# llamadas sueltas en orden aleatorio, sobre otro humano nuevo cada 5
		var h2: Humano = load("res://arte/humano/humano.tscn").instantiate()
		root.add_child(h2)
		var ops := ["formas", "piel", "pelo", "ropa", "ojos", "cejas"]
		for j in range(ops.size() - 1, 0, -1):
			var k := rng.randi() % (j + 1)
			var t = ops[j]; ops[j] = ops[k]; ops[k] = t
		for o in ops:
			match o:
				"formas":
					for f in a["formas"]:
						h2.set_forma(f, a["formas"][f])
				"piel": h2.set_piel(a["piel"])
				"pelo": h2.set_pelo(a["pelo"]["id"], Color.html(a["pelo"]["color"]))
				"ropa":
					for c in a["ropa"]:
						h2.set_ropa(c, a["ropa"][c]["id"], Color.WHITE)
				"ojos": h2.set_ojos(a["ojos"])
				"cejas": h2.set_cejas(a["cejas"])
		await process_frame
		_comprobar(h2, "sueltas#%d(%s)" % [i, ",".join(ops)])
		h2.queue_free()
	print("BATERIA fallos=", fallos)
	quit()
