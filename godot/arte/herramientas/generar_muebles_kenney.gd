extends SceneTree
## GD-8c: sustituye muebles de casa por modelos de Kenney Furniture Kit 2.0 (CC0). Reescribe las escenas con el MISMO nombre
## y actualiza tam/usos en muebles/INDICE.json. Uso: godot --headless --path godot -s res://arte/herramientas/generar_muebles_kenney.gd
## Escala real (1 u = 1 m), origen en el suelo y centro de la huella, frente -Z. Los glb de Kenney miran a +Z: se giran 180 grados.

const M := "res://arte/muebles/"
const K := "res://arte/muebles/modelos/kenney_hogar/"
var indice := {}
var mats := {}

# paleta común (casa con cama/sofá/silla de KayKit: maderas cálidas, blanco roto, grises)
const BLANCO := Color("e8e5de")
const BLANCO2 := Color("e2dfd8")
const GRIS_CL := Color("b7bcc0")
const GRIS := Color("8e959b")
const GRIS_OSC := Color("3b3f44")
const MADERA := Color("b07a48")
const MADERA_OSC := Color("8a5a35")
const ENCIMERA := Color("6b7075")
const CRISTAL := Color("1c2430")

func mat(c: Color, rug := 0.7, met := 0.0) -> StandardMaterial3D:
	var k := "%s_%s_%s" % [c.to_html(), rug, met]
	if not mats.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = rug
		m.metallic = met
		mats[k] = m
	return mats[k]

func _aabb(n: Node, t := Transform3D.IDENTITY) -> AABB:
	var res := AABB()
	var primero := true
	var tt := t
	if n is Node3D:
		tt = t * (n as Node3D).transform
	if n is MeshInstance3D and (n as MeshInstance3D).mesh != null:
		res = tt * (n as MeshInstance3D).get_aabb()
		primero = false
	for h in n.get_children():
		var b := _aabb(h, tt)
		if b.size == Vector3.ZERO: continue
		res = b if primero else res.merge(b)
		primero = false
	return res

func _recolor(n: Node, col: Dictionary) -> void:
	if n is MeshInstance3D and (n as MeshInstance3D).mesh != null:
		var mi := n as MeshInstance3D
		for i in mi.mesh.get_surface_count():
			var m := mi.mesh.surface_get_material(i)
			var nombre := m.resource_name if m != null else "_defaultMat"
			if col.has(nombre):
				var c: Array = col[nombre]
				mi.set_surface_override_material(i, mat(c[0], c[1] if c.size() > 1 else 0.7, c[2] if c.size() > 2 else 0.0))
	for h in n.get_children():
		_recolor(h, col)

var origen := "/tmp/gd8c/k/Models/GLTF format/"   # carpeta del zip descomprimido (parámetro glb=...)

func _cargar(glb: String) -> Node3D:
	# lee el .glb directamente (sin importarlo) y guarda cada malla como .res propio en modelos/kenney_hogar/ (las escenas
	# referencian esos .res: así se pueden cambiar los materiales por escena sin duplicar mallas en los .tscn)
	var doc := GLTFDocument.new()
	var st := GLTFState.new()
	var err := doc.append_from_file(origen + glb + ".glb", st)
	if err != OK:
		push_error("no puedo leer " + glb)
	var n: Node3D = doc.generate_scene(st)
	var i := 0
	var pila: Array = [n]
	while not pila.is_empty():
		var x: Node = pila.pop_back()
		if x is MeshInstance3D and (x as MeshInstance3D).mesh != null:
			var ruta := "%s%s_%d.res" % [K, glb, i]
			ResourceSaver.save((x as MeshInstance3D).mesh, ruta, ResourceSaver.FLAG_COMPRESS)
			(x as MeshInstance3D).mesh = ResourceLoader.load(ruta, "", ResourceLoader.CACHE_MODE_IGNORE)
			i += 1
		pila.append_array(x.get_children())
	return n

func _propios(n: Node, raiz: Node) -> void:
	# como «hijos editables»: los nodos del glb pasan a ser del root para que se guarden los materiales cambiados
	for h in n.get_children():
		h.owner = raiz
		_propios(h, raiz)

func pieza(raiz: Node3D, glb: String, dims: Vector3, col := {}, pos := Vector3.ZERO, nombre := "Modelo", giro := PI) -> Node3D:
	# dims: tamaño final por eje (0 = proporcional al primero dado). pos: posición del centro de la huella (suelo) dentro de raiz.
	var n: Node3D = _cargar(glb)
	var bb := _aabb(n)
	var e := Vector3.ZERO
	var ref := 1.0
	for i in 3:
		if dims[i] > 0:
			e[i] = dims[i] / bb.size[i]
			if ref == 1.0: ref = e[i]
	for i in 3:
		if e[i] == 0.0: e[i] = ref
	var c := bb.get_center()
	var b := Basis(Vector3.UP, giro) * Basis.from_scale(e)
	var off := b * Vector3(c.x, bb.position.y, c.z)
	n.transform = Transform3D(b, pos - off)
	n.name = nombre
	raiz.add_child(n)
	n.owner = raiz
	_recolor(n, col)
	_propios(n, raiz)
	return n

func guardar(raiz: Node3D, tipo: String, usos = null, extra := {}) -> void:
	var bb := _aabb(raiz)
	var ps := PackedScene.new()
	ps.pack(raiz)
	ResourceSaver.save(ps, M + tipo + ".tscn")
	var d: Dictionary = indice.get(tipo, {"escena": M + tipo + ".tscn", "usos": []})
	d["tam"] = [snappedf(bb.size.x, 0.01), snappedf(bb.size.y, 0.01), snappedf(bb.size.z, 0.01)]
	if usos != null: d["usos"] = usos
	d.merge(extra, true)
	indice[tipo] = d
	print(tipo, " ", bb.size, " y0=", bb.position.y)
	raiz.free()

func nuevo(nombre: String) -> Node3D:
	var r := Node3D.new()
	r.name = nombre
	return r

func uso(nombre: String, pos: Vector3, mira_a := "") -> Dictionary:
	return {"nombre": nombre, "pos": [pos.x, pos.y, pos.z], "persona_mira": mira_a}

func _init() -> void:
	var f0 := FileAccess.open(M + "INDICE.json", FileAccess.READ)
	var js: Dictionary = JSON.parse_string(f0.get_as_text())
	f0.close()
	indice = js["muebles"]
	var solo: PackedStringArray = []
	for a in OS.get_cmdline_user_args():
		if a.begins_with("glb="): origen = a.substr(4)
		if a.begins_with("solo="): solo = a.substr(5).split(",")
	var r: Node3D
	# colores por nombre de material de Kenney
	var porcel := {"carpetWhite": [BLANCO2, 0.3], "metalLight": [BLANCO2, 0.3], "_defaultMat": [BLANCO2, 0.3], "metalDark": [GRIS_CL, 0.35, 0.6], "metal": [GRIS_CL, 0.35, 0.6], "metalMedium": [GRIS_CL, 0.35, 0.6], "glass": [CRISTAL, 0.15]}
	# cocina de piso: cuerpo blanco roto, encimera gris, tiradores y acero gris claro
	var coc := {"wood": [BLANCO, 0.55], "woodDark": [ENCIMERA, 0.5], "metal": [ENCIMERA, 0.45, 0.1], "metalLight": [BLANCO2, 0.4], "metalDark": [GRIS_CL, 0.35, 0.6], "metalMedium": [GRIS_CL, 0.35, 0.6], "carpetWhite": [BLANCO2, 0.4], "_defaultMat": [GRIS_CL, 0.4, 0.5], "glass": [CRISTAL, 0.15]}
	var mad := {"wood": [MADERA, 0.6], "woodDark": [MADERA_OSC, 0.6], "metal": [GRIS_CL, 0.3, 0.7], "metalDark": [GRIS_OSC, 0.4], "plant": [Color("4a8a3c"), 0.8], "glass": [Color("c5dce8"), 0.1]}
	var elec := {"metalDark": [GRIS_OSC, 0.3], "metal": [GRIS_CL, 0.3, 0.5], "metalMedium": [GRIS_OSC, 0.4], "glass": [CRISTAL, 0.12]}
	# --- VÁTER
	if solo.is_empty() or "vater" in solo:
		r = nuevo("Vater")
		pieza(r, "toilet", Vector3(0.40, 0.76, 0.68), porcel)
		guardar(r, "vater", [uso("sentarse", Vector3(0, 0.42, -0.08), "-z")], {"altura_asiento": 0.42})
	# --- LAVABO
	if solo.is_empty() or "lavabo" in solo:
		r = nuevo("Lavabo")
		pieza(r, "bathroomSink", Vector3(0.55, 0.88, 0.46), porcel)
		guardar(r, "lavabo", [uso("lavarse", Vector3(0, 0, -0.5), "+z")], {"altura_borde": 0.85})
	# --- BAÑERA (nueva)
	if solo.is_empty() or "banera" in solo:
		r = nuevo("Banera")
		pieza(r, "bathtub", Vector3(1.55, 0.55, 0.72), porcel)
		guardar(r, "banera", [uso("banarse", Vector3(0, 0.2, 0.0), "-z")], {"altura_borde": 0.55})
	# --- LAVADORA
	if solo.is_empty() or "lavadora" in solo:
		r = nuevo("Lavadora")
		pieza(r, "washer", Vector3(0.60, 0.85, 0.60), porcel)
		guardar(r, "lavadora", [uso("cargar", Vector3(0, 0, -0.7), "+z")])
	# --- TELE sobre mueble bajo
	if solo.is_empty() or "tele" in solo:
		r = nuevo("Tele")
		pieza(r, "cabinetTelevisionDoors", Vector3(1.30, 0.50, 0.42), mad, Vector3.ZERO, "Mueble")
		pieza(r, "televisionModern", Vector3(0.98, 0.66, 0), elec, Vector3(0, 0.50, 0.0), "Tele")
		guardar(r, "tele", null, {"es_pantalla": true})
	# --- COCINA de piso (mismo fondo 0,60, encimera 0,90, mismos colores)
	if solo.is_empty() or "cocina" in solo:
		r = nuevo("Cocina")
		pieza(r, "kitchenStove", Vector3(0.60, 0.90, 0.60), coc)
		guardar(r, "cocina", [uso("cocinar", Vector3(0, 0, -0.65), "+z")], {"altura_encimera": 0.90})
	if solo.is_empty() or "fregadero" in solo:
		r = nuevo("Fregadero")
		pieza(r, "kitchenSink", Vector3(0.60, 0.90, 0.60), coc)
		guardar(r, "fregadero", [uso("fregar", Vector3(0, 0, -0.65), "+z")], {"altura_encimera": 0.90})
	if solo.is_empty() or "nevera" in solo:
		r = nuevo("Nevera")
		pieza(r, "kitchenFridge", Vector3(0.60, 1.80, 0.65), coc)
		guardar(r, "nevera", [uso("abrir", Vector3(0, 0, -0.7), "+z")])
	if solo.is_empty() or "microondas" in solo:
		r = nuevo("Microondas")
		pieza(r, "kitchenMicrowave", Vector3(0.48, 0.28, 0.36), coc)
		guardar(r, "microondas", [], {"sobre": "encimera"})
	# --- MESA DE COMEDOR
	if solo.is_empty() or "mesa_comedor" in solo:
		r = nuevo("MesaComedor")
		pieza(r, "table", Vector3(1.40, 0.75, 0.80), mad)
		guardar(r, "mesa_comedor", null, {"altura_tablero": 0.75})
	# --- ARMARIO / MESILLA / ESTANTERÍA
	if solo.is_empty() or "armario" in solo:
		r = nuevo("Armario")
		pieza(r, "bookcaseClosedDoors", Vector3(0.94, 2.0, 0.59), mad)
		guardar(r, "armario", [uso("abrir", Vector3(0, 0, -0.75), "+z")])
	if solo.is_empty() or "mesilla" in solo:
		r = nuevo("Mesilla")
		pieza(r, "cabinetBedDrawer", Vector3(0.48, 0.50, 0.40), mad)
		guardar(r, "mesilla", [uso("abrir", Vector3(0, 0, -0.55), "+z")])
	if solo.is_empty() or "estanteria" in solo:
		r = nuevo("Estanteria")
		pieza(r, "bookcaseOpen", Vector3(0.90, 1.85, 0.36), mad)
		guardar(r, "estanteria", [uso("coger", Vector3(0, 0, -0.6), "+z")])
	# --- ESCRITORIO con ordenador
	if solo.is_empty() or "escritorio" in solo:
		r = nuevo("Escritorio")
		pieza(r, "desk", Vector3(1.20, 0.75, 0.60), mad)
		pieza(r, "computerScreen", Vector3(0.54, 0.0, 0), elec, Vector3(-0.25, 0.75, 0.12), "Monitor")
		pieza(r, "computerKeyboard", Vector3(0.40, 0.0, 0), elec, Vector3(-0.25, 0.75, -0.12), "Teclado")
		guardar(r, "escritorio", [uso("sentarse_silla", Vector3(0, 0, -0.65), "+z")], {"altura_tablero": 0.75})
	# --- PLANTA / CUBO
	if solo.is_empty() or "planta" in solo:
		r = nuevo("Planta")
		pieza(r, "pottedPlant", Vector3(0, 1.15, 0), mad)
		guardar(r, "planta", null)
	if solo.is_empty() or "cubo_basura" in solo:
		r = nuevo("CuboBasura")
		pieza(r, "trashcan", Vector3(0, 0.50, 0), {"metal": [GRIS_CL, 0.35, 0.5], "metalDark": [GRIS_OSC, 0.4]})
		guardar(r, "cubo_basura", [uso("tirar", Vector3(0, 0, -0.5), "+z")])
	var f := FileAccess.open(M + "INDICE.json", FileAccess.WRITE)
	f.store_string(JSON.stringify({"_nota": js["_nota"], "muebles": indice}, "\t"))
	f.close()
	quit()
