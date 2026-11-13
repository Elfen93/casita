extends SceneTree
## GD-7: muebles de casa. AÑADE entradas a muebles/INDICE.json (carga el existente; no regenera los muebles anteriores).
## Uso: godot --headless --path godot -s res://arte/herramientas/generar_muebles_casa.gd
## Escala real (1 u = 1 m), origen en el suelo, centrado en planta, frente hacia -Z.

var mats := {}
var indice := {}

func mat(c: Color, rugoso := 0.85, metal := 0.0) -> StandardMaterial3D:
	var k := "%s_%s_%s" % [c.to_html(), rugoso, metal]
	if not mats.has(k):
		var m := StandardMaterial3D.new()
		m.albedo_color = c
		m.roughness = rugoso
		m.metallic = metal
		mats[k] = m
	return mats[k]

func caja(raiz: Node3D, tam: Vector3, pos: Vector3, c: Color, nombre := "caja", rugoso := 0.85, metal := 0.0) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.position = pos
	mi.material_override = mat(c, rugoso, metal)
	mi.name = nombre
	raiz.add_child(mi)
	mi.owner = raiz
	return mi

func cil(raiz: Node3D, r: float, h: float, pos: Vector3, c: Color, nombre := "cilindro", seg := 12, rugoso := 0.8, metal := 0.0, r_arriba := -1.0) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = r if r_arriba < 0 else r_arriba
	cm.bottom_radius = r
	cm.height = h
	cm.radial_segments = seg
	cm.rings = 1
	mi.mesh = cm
	mi.position = pos + Vector3(0, h * 0.5, 0)  # pos = centro de la base
	mi.material_override = mat(c, rugoso, metal)
	mi.name = nombre
	raiz.add_child(mi)
	mi.owner = raiz
	return mi

func esfera(raiz: Node3D, r: float, pos: Vector3, c: Color, nombre := "esfera", esc := Vector3.ONE) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = r
	sm.height = r * 2.0
	sm.radial_segments = 7
	sm.rings = 4
	mi.mesh = sm
	mi.position = pos
	mi.scale = esc
	mi.material_override = mat(c, 0.9)
	mi.name = nombre
	raiz.add_child(mi)
	mi.owner = raiz
	return mi

func modelo(raiz: Node3D, ruta: String, esc: Vector3, nombre := "Modelo", girar := true) -> Node3D:
	# instancia un .gltf de KayKit, lo centra en planta, apoya en el suelo y gira 180° (los glTF miran a +Z)
	var n: Node3D = (load(ruta) as PackedScene).instantiate()
	var bb := _aabb(n)
	n.name = nombre
	raiz.add_child(n)
	n.owner = raiz
	n.scale = esc
	var c := bb.get_center()
	var off := Vector3(-c.x * esc.x, -bb.position.y * esc.y, -c.z * esc.z)
	if girar:
		n.rotation.y = PI
		off = Vector3(c.x * esc.x, off.y, c.z * esc.z)
	n.position = off
	return n

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

func guardar(raiz: Node3D, ruta: String, tipo: String, usos: Array, extra := {}) -> void:
	var bb := _aabb(raiz)
	var ps := PackedScene.new()
	ps.pack(raiz)
	ResourceSaver.save(ps, ruta)
	var d := {"escena": ruta, "tam": [snappedf(bb.size.x, 0.01), snappedf(bb.size.y, 0.01), snappedf(bb.size.z, 0.01)], "usos": usos}
	d.merge(extra)
	indice[tipo] = d
	print(tipo, " ", bb.size)
	raiz.free()

func nuevo(nombre: String) -> Node3D:
	var r := Node3D.new()
	r.name = nombre
	return r

func uso(nombre: String, pos: Vector3, mira_a := "") -> Dictionary:
	return {"nombre": nombre, "pos": [pos.x, pos.y, pos.z], "persona_mira": mira_a}


const M := "res://arte/muebles/"
const R := "res://arte/muebles/modelos/restaurante/"
const H := "res://arte/muebles/modelos/hogar/"
var madera := Color("8a5a35")
var madera_cl := Color("b07a48")
var madera_osc := Color("4e3322")
var acero := Color("b8bcc2")
var negro := Color("26282b")
var blanco := Color("e6e8ea")
var porcelana := Color("eef0f1")

func ajustar(raiz: Node3D, ruta: String, dims: Vector3, nombre := "Modelo") -> Node3D:
	# como modelo(), pero escalando cada eje a las dimensiones objetivo (0 = proporcional a los demás)
	var n: Node3D = (load(ruta) as PackedScene).instantiate()
	var bb := _aabb(n)
	var e := Vector3(dims.x / bb.size.x if dims.x > 0 else 0.0, dims.y / bb.size.y if dims.y > 0 else 0.0, dims.z / bb.size.z if dims.z > 0 else 0.0)
	var ref := 1.0
	for v in [e.x, e.y, e.z]:
		if v > 0: ref = v; break
	for i in 3:
		if e[i] <= 0: e[i] = ref
	return modelo(raiz, ruta, e, nombre)

func cilz(raiz: Node3D, r: float, largo: float, pos: Vector3, c: Color, nombre := "cilz", seg := 16, rugoso := 0.5, metal := 0.0) -> MeshInstance3D:
	# cilindro con el eje a lo largo de Z; pos = centro
	var mi := cil(raiz, r, largo, Vector3.ZERO, c, nombre, seg, rugoso, metal)
	mi.position = pos
	mi.rotation = Vector3(PI / 2, 0, 0)
	return mi

func _init() -> void:
	var f0 := FileAccess.open(M + "INDICE.json", FileAccess.READ)
	var js: Dictionary = JSON.parse_string(f0.get_as_text())
	f0.close()
	indice = js["muebles"]
	var r: Node3D
	# ------------------------------------------------------------ VÁTER (taza + cisterna al fondo, +Z)
	r = nuevo("Vater")
	cil(r, 0.10, 0.30, Vector3(0, 0, 0.0), porcelana, "Pie", 12, 0.3, 0.0, 0.14)
	var taza := cil(r, 0.20, 0.17, Vector3(0, 0.25, -0.02), porcelana, "Taza", 16, 0.3, 0.0, 0.17)
	taza.scale = Vector3(1, 1, 1.25)
	var asiento := cil(r, 0.20, 0.03, Vector3(0, 0.40, -0.02), Color("d9dcde"), "Asiento", 16, 0.35)
	asiento.scale = Vector3(1, 1, 1.25)
	var agujero := cil(r, 0.13, 0.005, Vector3(0, 0.432, -0.04), Color("8d969c"), "Hueco", 14, 0.5)
	agujero.scale = Vector3(1, 1, 1.3)
	caja(r, Vector3(0.38, 0.40, 0.17), Vector3(0, 0.55, 0.22), porcelana, "Cisterna", 0.3)
	caja(r, Vector3(0.40, 0.03, 0.19), Vector3(0, 0.765, 0.22), Color("dfe2e4"), "TapaCisterna", 0.3)
	cil(r, 0.02, 0.02, Vector3(0.12, 0.78, 0.22), acero, "Pulsador", 8, 0.3, 0.8)
	guardar(r, M + "vater.tscn", "vater", [uso("sentarse", Vector3(0, 0.42, -0.03), "-z")], {"altura_asiento": 0.42})
	# ------------------------------------------------------------ LAVABO (con pie)
	r = nuevo("Lavabo")
	cil(r, 0.07, 0.72, Vector3(0, 0, 0.1), porcelana, "Pie", 10, 0.3, 0.0, 0.05)
	caja(r, Vector3(0.58, 0.12, 0.46), Vector3(0, 0.79, 0.0), porcelana, "Pila", 0.3)
	caja(r, Vector3(0.48, 0.006, 0.34), Vector3(0, 0.853, -0.01), Color("a9b4bb"), "Seno", 0.4)
	caja(r, Vector3(0.58, 0.14, 0.03), Vector3(0, 0.92, 0.225), porcelana, "Trasera", 0.3)
	cil(r, 0.015, 0.10, Vector3(0, 0.85, 0.17), acero, "GrifoBase", 8, 0.25, 0.9)
	caja(r, Vector3(0.025, 0.025, 0.12), Vector3(0, 0.945, 0.12), acero, "GrifoPico", 0.25, 0.9)
	caja(r, Vector3(0.10, 0.02, 0.02), Vector3(0, 0.96, 0.17), acero, "GrifoMando", 0.25, 0.9)
	guardar(r, M + "lavabo.tscn", "lavabo", [uso("lavarse", Vector3(0, 0, -0.5), "+z")], {"altura_borde": 0.85})
	# ------------------------------------------------------------ MESA DE COMEDOR 1,4 x 0,8 x 0,75
	r = nuevo("MesaComedor")
	caja(r, Vector3(1.40, 0.04, 0.80), Vector3(0, 0.73, 0), madera_cl, "Tablero", 0.5)
	caja(r, Vector3(1.30, 0.07, 0.70), Vector3(0, 0.675, 0), madera_osc, "Faldon")
	for sx in [-1, 1]:
		for sz in [-1, 1]:
			caja(r, Vector3(0.06, 0.67, 0.06), Vector3(sx * 0.63, 0.335, sz * 0.33), madera_osc, "Pata_%d_%d" % [sx, sz])
	guardar(r, M + "mesa_comedor.tscn", "mesa_comedor", [
		uso("silla_0", Vector3(-0.35, 0, -0.60), "+z"), uso("silla_1", Vector3(0.35, 0, -0.60), "+z"),
		uso("silla_2", Vector3(-0.35, 0, 0.60), "-z"), uso("silla_3", Vector3(0.35, 0, 0.60), "-z")], {"altura_tablero": 0.75})
	# ------------------------------------------------------------ TELE sobre mueble bajo
	r = nuevo("Tele")
	caja(r, Vector3(1.40, 0.45, 0.40), Vector3(0, 0.225, 0), Color("5a3a26"), "Mueble", 0.6)
	caja(r, Vector3(1.36, 0.02, 0.38), Vector3(0, 0.46, 0), Color("a8693b"), "Encimera", 0.5)
	caja(r, Vector3(0.62, 0.30, 0.01), Vector3(-0.35, 0.22, -0.205), Color("3d2a1c"), "PuertaIzq")
	caja(r, Vector3(0.62, 0.30, 0.01), Vector3(0.35, 0.22, -0.205), Color("3d2a1c"), "PuertaDer")
	caja(r, Vector3(0.24, 0.02, 0.16), Vector3(0, 0.48, 0.0), negro, "Peana")
	caja(r, Vector3(0.05, 0.06, 0.04), Vector3(0, 0.52, 0.0), negro, "Cuello")
	caja(r, Vector3(1.10, 0.64, 0.05), Vector3(0, 0.84, 0.0), negro, "Marco", 0.3)
	caja(r, Vector3(1.05, 0.59, 0.01), Vector3(0, 0.84, -0.027), Color("141c2a"), "Pantalla", 0.15)
	guardar(r, M + "tele.tscn", "tele", [], {"es_pantalla": true, "nota_uso": "sin uso propio: se mira desde el sofá (la pantalla da a -Z)"})
	# ------------------------------------------------------------ ARMARIO 1,2 x 0,6 x 2,0
	r = nuevo("Armario")
	caja(r, Vector3(1.20, 1.96, 0.58), Vector3(0, 1.0, 0), madera, "Cuerpo")
	caja(r, Vector3(1.24, 0.04, 0.60), Vector3(0, 1.98, 0), madera_osc, "Cornisa")
	caja(r, Vector3(1.16, 0.04, 0.56), Vector3(0, 0.02, 0.0), madera_osc, "Zocalo")
	caja(r, Vector3(0.58, 1.84, 0.02), Vector3(-0.30, 1.0, -0.295), Color("a06b40"), "PuertaIzq")
	caja(r, Vector3(0.58, 1.84, 0.02), Vector3(0.30, 1.0, -0.295), Color("a06b40"), "PuertaDer")
	caja(r, Vector3(0.025, 0.28, 0.03), Vector3(-0.04, 1.0, -0.32), acero, "TiradorIzq", 0.3, 0.8)
	caja(r, Vector3(0.025, 0.28, 0.03), Vector3(0.04, 1.0, -0.32), acero, "TiradorDer", 0.3, 0.8)
	guardar(r, M + "armario.tscn", "armario", [uso("abrir", Vector3(0, 0, -0.75), "+z")], {})
	# ------------------------------------------------------------ MESILLA 0,45 x 0,40 x 0,50
	r = nuevo("Mesilla")
	caja(r, Vector3(0.45, 0.46, 0.40), Vector3(0, 0.25, 0), madera, "Cuerpo")
	caja(r, Vector3(0.48, 0.03, 0.43), Vector3(0, 0.485, 0), madera_cl, "Tablero", 0.5)
	caja(r, Vector3(0.37, 0.16, 0.02), Vector3(0, 0.34, -0.205), Color("a06b40"), "Cajon1")
	caja(r, Vector3(0.37, 0.16, 0.02), Vector3(0, 0.15, -0.205), Color("a06b40"), "Cajon2")
	caja(r, Vector3(0.10, 0.015, 0.02), Vector3(0, 0.34, -0.225), acero, "Pomo1", 0.3, 0.8)
	caja(r, Vector3(0.10, 0.015, 0.02), Vector3(0, 0.15, -0.225), acero, "Pomo2", 0.3, 0.8)
	for sx in [-1, 1]:
		for sz in [-1, 1]:
			caja(r, Vector3(0.04, 0.03, 0.04), Vector3(sx * 0.19, 0.015, sz * 0.16), madera_osc, "Pata_%d_%d" % [sx, sz])
	guardar(r, M + "mesilla.tscn", "mesilla", [uso("abrir", Vector3(0, 0, -0.55), "+z")], {})
	# ------------------------------------------------------------ LÁMPARA DE PIE (KayKit lamp_standing)
	r = nuevo("LamparaPie")
	ajustar(r, H + "lamp_standing.gltf", Vector3(0, 1.6, 0))
	guardar(r, M + "lampara_pie.tscn", "lampara_pie", [], {})
	# ------------------------------------------------------------ ESTANTERÍA (KayKit shelf_A_big)
	r = nuevo("Estanteria")
	caja(r, Vector3(0.03, 1.90, 0.32), Vector3(-0.485, 0.95, 0), madera, "LateralIzq")
	caja(r, Vector3(0.03, 1.90, 0.32), Vector3(0.485, 0.95, 0), madera, "LateralDer")
	caja(r, Vector3(0.94, 1.84, 0.015), Vector3(0, 0.95, 0.165), madera_osc, "Fondo")
	var libros := [Color("a03a30"), Color("2f5d8a"), Color("d8b24a"), Color("3f7a4a"), Color("e0d8c8"), Color("6a3a7a"), Color("c9702f")]
	var kk := 0
	for fila in 6:
		var y := 0.04 + fila * 0.36
		caja(r, Vector3(0.94, 0.03, 0.31), Vector3(0, y, 0), madera, "Balda%d" % fila)
		if fila == 5: continue
		var x := -0.42
		var j := 0
		while x < 0.40:
			var ancho := 0.035 + float((kk * 3) % 4) * 0.012
			var alto := 0.22 + float((kk * 5) % 5) * 0.025
			if fila == 2 and j > 5: break   # hueco libre en una balda
			caja(r, Vector3(ancho, alto, 0.22), Vector3(x + ancho * 0.5, y + 0.015 + alto * 0.5, 0.0), libros[(kk * 2 + fila) % libros.size()], "Libro%d_%d" % [fila, j], 0.9)
			x += ancho + 0.004
			j += 1
			kk += 1
	caja(r, Vector3(1.0, 0.03, 0.34), Vector3(0, 1.915, 0), madera_osc, "Techo")
	guardar(r, M + "estanteria.tscn", "estanteria", [uso("coger", Vector3(0, 0, -0.6), "+z")], {})
	# ------------------------------------------------------------ FREGADERO (KayKit kitchencounter_sink, módulo de cocina)
	r = nuevo("Fregadero")
	ajustar(r, R + "kitchencounter_sink.gltf", Vector3(0.9, 0.92, 0.63))
	guardar(r, M + "fregadero.tscn", "fregadero", [uso("fregar", Vector3(0, 0, -0.65), "+z")], {"altura_encimera": 0.92})
	# ------------------------------------------------------------ LAVADORA 0,6 x 0,6 x 0,85
	r = nuevo("Lavadora")
	caja(r, Vector3(0.60, 0.85, 0.60), Vector3(0, 0.425, 0), blanco, "Cuerpo", 0.35, 0.1)
	caja(r, Vector3(0.58, 0.10, 0.02), Vector3(0, 0.78, -0.305), Color("c9ced2"), "Panel", 0.4)
	cil(r, 0.025, 0.03, Vector3(-0.2, 0, 0), Color("4a90c8"), "Mando", 10).rotation = Vector3(PI / 2, 0, 0)
	r.get_node("Mando").position = Vector3(-0.2, 0.78, -0.325)
	caja(r, Vector3(0.12, 0.03, 0.01), Vector3(0.15, 0.78, -0.31), Color("1a1c2a"), "Visor", 0.2)
	cilz(r, 0.22, 0.02, Vector3(0, 0.40, -0.305), Color("9aa0a6"), "Aro", 20, 0.3, 0.8)
	cilz(r, 0.18, 0.03, Vector3(0, 0.40, -0.31), Color("2a3a4a"), "Cristal", 20, 0.15)
	guardar(r, M + "lavadora.tscn", "lavadora", [uso("cargar", Vector3(0, 0, -0.7), "+z")], {})
	# ================================================== SI DA TIEMPO
	r = nuevo("Sillon")
	ajustar(r, H + "armchair.gltf", Vector3(0.85, 0.85, 0.85))
	guardar(r, M + "sillon.tscn", "sillon", [uso("sentarse", Vector3(0, 0.40, 0.0), "-z")], {"altura_asiento": 0.40})
	r = nuevo("MesaBaja")
	ajustar(r, H + "table_low.gltf", Vector3(1.0, 0.42, 0.55))
	guardar(r, M + "mesa_baja.tscn", "mesa_baja", [], {"altura_tablero": 0.42})
	r = nuevo("Alfombra")
	ajustar(r, H + "rug_rectangle_A.gltf", Vector3(2.0, 0.02, 1.4))
	guardar(r, M + "alfombra.tscn", "alfombra", [], {"solido": false})
	r = nuevo("LamparaMesa")
	ajustar(r, H + "lamp_table.gltf", Vector3(0, 0.38, 0))
	guardar(r, M + "lampara_mesa.tscn", "lampara_mesa", [], {"sobre": "mesilla"})
	r = nuevo("Escritorio")
	caja(r, Vector3(1.20, 0.04, 0.60), Vector3(0, 0.74, 0), madera_cl, "Tablero", 0.5)
	caja(r, Vector3(0.04, 0.72, 0.56), Vector3(-0.57, 0.36, 0), madera_osc, "LateralIzq")
	caja(r, Vector3(0.04, 0.72, 0.56), Vector3(0.57, 0.36, 0), madera_osc, "LateralDer")
	caja(r, Vector3(1.10, 0.30, 0.02), Vector3(0, 0.55, 0.27), madera_osc, "Trasera")
	caja(r, Vector3(0.52, 0.30, 0.04), Vector3(-0.28, 0.99, 0.12), negro, "Monitor", 0.3)
	caja(r, Vector3(0.48, 0.26, 0.01), Vector3(-0.28, 0.99, 0.095), Color("2a4a72"), "Pantalla", 0.15)
	caja(r, Vector3(0.06, 0.12, 0.05), Vector3(-0.28, 0.82, 0.12), negro, "Pie")
	caja(r, Vector3(0.40, 0.015, 0.14), Vector3(-0.28, 0.76, -0.12), Color("3a3d42"), "Teclado")
	caja(r, Vector3(0.20, 0.42, 0.40), Vector3(0.35, 0.97, 0.05), Color("2d2f33"), "Torre", 0.4)
	cil(r, 0.012, 0.01, Vector3(0.35, 1.10, -0.16), Color("4ac46a"), "Led", 6)
	guardar(r, M + "escritorio.tscn", "escritorio", [uso("sentarse_silla", Vector3(0, 0, -0.65), "+z")], {"altura_tablero": 0.76, "con": "ordenador"})
	r = nuevo("Planta")
	cil(r, 0.17, 0.30, Vector3(0, 0, 0), Color("b0623f"), "Maceta", 12, 0.8, 0.0, 0.12)
	cil(r, 0.17, 0.02, Vector3(0, 0.30, 0), Color("5a3a26"), "Tierra", 12)
	cil(r, 0.012, 0.50, Vector3(0, 0.32, 0), Color("3f7a34"), "Tallo", 6)
	var verdes := [Color("3f8a3a"), Color("4d9a44"), Color("357a34")]
	for i in 7:
		var a := i * 2.4
		var h := 0.55 + (i % 3) * 0.2
		var hoja := esfera(r, 0.12, Vector3(cos(a) * 0.16, h, sin(a) * 0.16), verdes[i % 3], "Hoja%d" % i, Vector3(1.2, 0.5, 1.2))
		hoja.rotation = Vector3(sin(a) * 0.5, 0, -cos(a) * 0.5)
	esfera(r, 0.20, Vector3(0, 0.95, 0), verdes[1], "Copa", Vector3(1, 0.9, 1))
	guardar(r, M + "planta.tscn", "planta", [], {})
	r = nuevo("Espejo")
	caja(r, Vector3(0.55, 1.65, 0.04), Vector3(0, 0.88, 0), madera_osc, "Marco")
	caja(r, Vector3(0.47, 1.57, 0.01), Vector3(0, 0.88, -0.022), Color("c5dce8"), "Luna", 0.1, 0.0)
	caja(r, Vector3(0.06, 0.05, 0.30), Vector3(-0.2, 0.025, 0.12), madera_osc, "PieIzq")
	caja(r, Vector3(0.06, 0.05, 0.30), Vector3(0.2, 0.025, 0.12), madera_osc, "PieDer")
	guardar(r, M + "espejo.tscn", "espejo", [uso("mirarse", Vector3(0, 0, -0.6), "+z")], {})
	r = nuevo("CuboBasura")
	cil(r, 0.15, 0.40, Vector3(0, 0, 0), Color("c9ced2"), "Cuerpo", 14, 0.35, 0.5, 0.13)
	cil(r, 0.14, 0.03, Vector3(0, 0.40, 0), Color("55585d"), "Tapa", 14, 0.4)
	cil(r, 0.025, 0.03, Vector3(0, 0.43, 0), negro, "Asa", 6)
	caja(r, Vector3(0.10, 0.02, 0.06), Vector3(0, 0.02, -0.16), negro, "Pedal")
	guardar(r, M + "cubo_basura.tscn", "cubo_basura", [uso("tirar", Vector3(0, 0, -0.5), "+z")], {})
	# ------------------------------------------------------------ INDICE
	var f := FileAccess.open(M + "INDICE.json", FileAccess.WRITE)
	f.store_string(JSON.stringify({"_nota": js["_nota"], "muebles": indice}, "\t"))
	f.close()
	quit()
