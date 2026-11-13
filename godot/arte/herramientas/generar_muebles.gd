extends SceneTree
## Genera godot/arte/muebles/*.tscn (+ INDICE.json) y godot/arte/ciudad/objetos/*.tscn.
## Uso (desde una copia del proyecto con res://arte): godot --headless --path . -s res://arte/herramientas/generar_muebles.gd
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
const C := "res://arte/muebles/modelos/ciudad/"
var madera := Color("8a5a35")
var madera_osc := Color("4e3322")
var acero := Color("b8bcc2")
var negro := Color("26282b")

func _init() -> void:
	DirAccess.make_dir_recursive_absolute("res://arte/muebles/")
	DirAccess.make_dir_recursive_absolute("res://arte/ciudad/objetos/")
	# ------------------------------------------------------------ BARRA (módulo 1 m)
	var r := nuevo("Barra")
	caja(r, Vector3(1.0, 1.0, 0.50), Vector3(0, 0.50, 0.12), Color("5a3a26"), "Cuerpo")
	caja(r, Vector3(1.0, 0.05, 0.72), Vector3(0, 1.075, 0.0), Color("a8693b"), "Tablero", 0.5)
	caja(r, Vector3(0.9, 0.62, 0.02), Vector3(0, 0.55, -0.14), Color("3d6b5a"), "Panel")  # panel frontal verde
	caja(r, Vector3(1.0, 0.08, 0.03), Vector3(0, 0.08, -0.15), Color("2b2018"), "Zocalo")
	cil(r, 0.025, 0.98, Vector3(0, 0, 0), acero, "Reposapies", 8, 0.4, 0.8).rotation = Vector3(0, 0, PI / 2)
	r.get_node("Reposapies").position = Vector3(0, 0.2, -0.26)
	(r.get_node("Reposapies") as MeshInstance3D).mesh.height = 0.98
	guardar(r, M + "barra.tscn", "barra", [uso("cliente", Vector3(0, 0, -0.65), "+z"), uso("camarero", Vector3(0, 0, 0.55), "-z")], {"modulo": 1.0, "altura_tablero": 1.10})
	# ------------------------------------------------------------ TABURETE
	r = nuevo("Taburete")
	cil(r, 0.19, 0.06, Vector3(0, 0.72, 0), Color("a03a30"), "Asiento", 14)
	for i in 4:
		var a := i * PI / 2 + PI / 4
		var p := cil(r, 0.016, 0.72, Vector3(cos(a) * 0.15, 0, sin(a) * 0.15), acero, "Pata%d" % i, 6, 0.4, 0.8)
		p.rotation = Vector3(-sin(a) * 0.09, 0, cos(a) * 0.09)
	cil(r, 0.17, 0.02, Vector3(0, 0.28, 0), acero, "Aro", 14, 0.4, 0.8)
	guardar(r, M + "taburete.tscn", "taburete", [uso("sentarse", Vector3(0, 0.75, 0), "-z")], {"altura_asiento": 0.75})
	# ------------------------------------------------------------ MESA DE BAR (redonda 0,8 m)
	r = nuevo("MesaBar")
	cil(r, 0.40, 0.04, Vector3(0, 0.72, 0), Color("b07a48"), "Tablero", 18, 0.5)
	cil(r, 0.04, 0.72, Vector3(0, 0, 0), negro, "Columna", 8)
	cil(r, 0.26, 0.03, Vector3(0, 0, 0), negro, "Base", 14)
	guardar(r, M + "mesa_bar.tscn", "mesa_bar", [uso("silla_0", Vector3(0, 0, -0.62), "+z"), uso("silla_1", Vector3(0, 0, 0.62), "-z"), uso("silla_2", Vector3(-0.62, 0, 0), "+x"), uso("silla_3", Vector3(0.62, 0, 0), "-x")], {"altura_tablero": 0.76})
	# ------------------------------------------------------------ SILLA (KayKit chair_A_wood)
	r = nuevo("Silla")
	modelo(r, H + "chair_A_wood.gltf", Vector3.ONE * 0.82)
	guardar(r, M + "silla.tscn", "silla", [uso("sentarse", Vector3(0, 0.43, 0.0), "-z")], {"altura_asiento": 0.43})
	# ------------------------------------------------------------ ESTANTE CON BOTELLAS (de pared, módulo 1 m)
	r = nuevo("EstanteBotellas")
	caja(r, Vector3(1.0, 1.5, 0.04), Vector3(0, 1.45, 0.17), Color("3a2a20"), "Fondo")
	caja(r, Vector3(1.0, 1.5, 0.04), Vector3(0, 1.45, 0.17), Color("3a2a20"), "Fondo2").visible = false
	var cols := [Color("2f6b3a"), Color("7a4a1c"), Color("c98a2a"), Color("2b4d8a"), Color("d8d6cf"), Color("8a2a2a")]
	var k := 0
	for fila in 4:
		var y := 0.95 + fila * 0.36
		caja(r, Vector3(1.0, 0.03, 0.30), Vector3(0, y, 0.03), Color("7a4f2e"), "Balda%d" % fila)
		for i in 7:
			var c: Color = cols[(k * 5 + fila) % cols.size()]
			var alt := 0.20 + float((k * 7) % 4) * 0.025
			cil(r, 0.032, alt, Vector3(-0.42 + i * 0.14, y + 0.015, 0.03), c, "Botella%d_%d" % [fila, i], 8, 0.25)
			cil(r, 0.012, 0.09, Vector3(-0.42 + i * 0.14, y + 0.015 + alt, 0.03), c, "Cuello%d_%d" % [fila, i], 6, 0.25)
			k += 1
	caja(r, Vector3(1.0, 0.18, 0.40), Vector3(0, 0.09, 0.03), Color("3d3028"), "Base")
	guardar(r, M + "estante_botellas.tscn", "estante_botellas", [uso("coger", Vector3(0, 0, -0.5), "+z")], {"modulo": 1.0})
	# ------------------------------------------------------------ GRIFO DE CERVEZA (sobre la barra)
	r = nuevo("GrifoCerveza")
	cil(r, 0.07, 0.03, Vector3(0, 0, 0), negro, "Base", 10)
	cil(r, 0.025, 0.30, Vector3(0, 0.03, 0.0), acero, "Columna", 8, 0.3, 0.9)
	caja(r, Vector3(0.05, 0.05, 0.10), Vector3(0, 0.30, -0.04), acero, "Cabeza", 0.3, 0.9)
	cil(r, 0.012, 0.07, Vector3(0, 0.23, -0.08), acero, "Pico", 6, 0.3, 0.9)
	cil(r, 0.012, 0.12, Vector3(0, 0.33, 0.01), Color("c9a227"), "Palanca", 6).rotation = Vector3(-0.3, 0, 0)
	guardar(r, M + "grifo_cerveza.tscn", "grifo_cerveza", [uso("servir", Vector3(0, 0, 0.5), "-z")], {"sobre": "barra"})
	# ------------------------------------------------------------ CAFETERA (espresso, sobre la barra)
	r = nuevo("Cafetera")
	caja(r, Vector3(0.55, 0.38, 0.45), Vector3(0, 0.25, 0), Color("c9ccd1"), "Cuerpo", 0.35, 0.8)
	caja(r, Vector3(0.57, 0.06, 0.47), Vector3(0, 0.07, 0), negro, "Base")
	caja(r, Vector3(0.57, 0.04, 0.47), Vector3(0, 0.46, 0), negro, "Tapa")
	for i in 2:
		cil(r, 0.03, 0.04, Vector3(-0.12 + i * 0.24, 0.12, -0.24), negro, "Grupo%d" % i, 8)
		caja(r, Vector3(0.03, 0.03, 0.12), Vector3(-0.12 + i * 0.24, 0.17, -0.31), negro, "Portafiltro%d" % i)
	guardar(r, M + "cafetera.tscn", "cafetera", [uso("usar", Vector3(0, 0, 0.55), "-z")], {"sobre": "barra"})
	# ------------------------------------------------------------ COCTELERA
	r = nuevo("Coctelera")
	cil(r, 0.04, 0.16, Vector3(0, 0, 0), acero, "Vaso", 10, 0.25, 0.9, 0.05)
	cil(r, 0.05, 0.07, Vector3(0, 0.16, 0), acero, "Cuerpo", 10, 0.25, 0.9, 0.025)
	guardar(r, M + "coctelera.tscn", "coctelera", [uso("coger", Vector3(0, 0, 0.5), "-z")], {"sobre": "barra"})
	# ------------------------------------------------------------ TRAGAPERRAS
	r = nuevo("Tragaperras")
	caja(r, Vector3(0.62, 1.78, 0.55), Vector3(0, 0.89, 0), Color("a82a30"), "Cuerpo")
	caja(r, Vector3(0.50, 0.40, 0.04), Vector3(0, 1.38, -0.29), Color("1a1c2a"), "Pantalla")
	caja(r, Vector3(0.52, 0.10, 0.04), Vector3(0, 1.66, -0.28), Color("e6c34a"), "Rotulo")
	caja(r, Vector3(0.52, 0.18, 0.30), Vector3(0, 1.02, -0.20), Color("2a2d36"), "Mandos")
	for i in 3:
		cil(r, 0.025, 0.02, Vector3(-0.14 + i * 0.14, 1.11, -0.28), [Color("e8d44a"), Color("4ac46a"), Color("d84a4a")][i], "Boton%d" % i, 8)
	caja(r, Vector3(0.30, 0.06, 0.06), Vector3(0, 0.50, -0.29), negro, "Bandeja")
	guardar(r, M + "tragaperras.tscn", "tragaperras", [uso("jugar", Vector3(0, 0, -0.7), "+z")], {})
	# ------------------------------------------------------------ BANCO DE PARQUE (KayKit bench x escala ciudad)
	r = nuevo("BancoParque")
	modelo(r, C + "bench.gltf", Vector3.ONE * 4.6)
	guardar(r, "res://arte/ciudad/objetos/banco_parque.tscn", "banco_parque", [uso("sentarse", Vector3(0, 0.45, 0.0), "-z")], {"altura_asiento": 0.45})
	# ------------------------------------------------------------ ÁRBOL (procedural, ~6 m)
	r = nuevo("Arbol")
	cil(r, 0.16, 2.6, Vector3(0, 0, 0), Color("6b4a30"), "Tronco", 7, 0.9, 0.0, 0.10)
	esfera(r, 1.5, Vector3(0, 3.5, 0), Color("4d8a3a"), "Copa1", Vector3(1, 0.85, 1))
	esfera(r, 1.1, Vector3(0.7, 4.4, 0.3), Color("5c9a44"), "Copa2")
	esfera(r, 1.0, Vector3(-0.7, 4.0, -0.4), Color("447a34"), "Copa3")
	guardar(r, "res://arte/ciudad/objetos/arbol.tscn", "arbol", [], {})
	# ------------------------------------------------------------ FAROLA (KayKit streetlight, ~4,5 m)
	r = nuevo("Farola")
	modelo(r, C + "streetlight.gltf", Vector3.ONE * 4.6)
	var luz := OmniLight3D.new()
	luz.name = "Luz"
	luz.light_color = Color("ffd9a0")
	luz.light_energy = 0.0
	luz.omni_range = 9.0
	luz.position = Vector3(0, 4.3, 0)
	r.add_child(luz)
	luz.owner = r
	guardar(r, "res://arte/ciudad/objetos/farola.tscn", "farola", [], {"luz_nocturna": "Luz (energía 0 de día; subirla de noche)"})
	# ------------------------------------------------------------ PAPELERA
	r = nuevo("Papelera")
	cil(r, 0.20, 0.80, Vector3(0, 0, 0), Color("3f5f4a"), "Cuerpo", 10, 0.8, 0.0, 0.17)
	cil(r, 0.205, 0.05, Vector3(0, 0.80, 0), Color("2b3a30"), "Aro", 10)
	guardar(r, "res://arte/ciudad/objetos/papelera.tscn", "papelera", [], {})
	# ------------------------------------------------------------ CAMA (KayKit bed_single_A)
	r = nuevo("Cama")
	modelo(r, H + "bed_single_A.gltf", Vector3.ONE * 0.64)
	guardar(r, M + "cama.tscn", "cama", [uso("dormir", Vector3(0, 0.38, 0.0), "")], {"altura_colchon": 0.38})
	# ------------------------------------------------------------ SOFÁ
	r = nuevo("Sofa")
	modelo(r, H + "couch_pillows.gltf", Vector3.ONE * 0.75)
	guardar(r, M + "sofa.tscn", "sofa", [uso("sentarse_0", Vector3(-0.5, 0.40, 0.0), "-z"), uso("sentarse_1", Vector3(0.5, 0.40, 0.0), "-z")], {"altura_asiento": 0.40})
	# ------------------------------------------------------------ NEVERA
	r = nuevo("Nevera")
	caja(r, Vector3(0.60, 1.85, 0.65), Vector3(0, 0.925, 0), Color("e6e8ea"), "Cuerpo", 0.4, 0.2)
	caja(r, Vector3(0.62, 0.015, 0.02), Vector3(0, 1.20, -0.325), Color("9aa0a6"), "Junta")
	caja(r, Vector3(0.03, 0.40, 0.04), Vector3(0.22, 1.5, -0.34), acero, "Tirador1", 0.3, 0.8)
	caja(r, Vector3(0.03, 0.30, 0.04), Vector3(0.22, 0.85, -0.34), acero, "Tirador2", 0.3, 0.8)
	guardar(r, M + "nevera.tscn", "nevera", [uso("abrir", Vector3(0, 0, -0.7), "+z")], {})
	# ------------------------------------------------------------ COCINA (placa de 4 fuegos + horno)
	r = nuevo("Cocina")
	caja(r, Vector3(0.60, 0.88, 0.60), Vector3(0, 0.44, 0), Color("dfe1e3"), "Cuerpo", 0.4, 0.2)
	caja(r, Vector3(0.60, 0.03, 0.60), Vector3(0, 0.895, 0), negro, "Placa", 0.3)
	for i in 4:
		cil(r, 0.075, 0.01, Vector3(-0.15 + (i % 2) * 0.30, 0.91, -0.15 + (i / 2) * 0.30), Color("55585d"), "Fuego%d" % i, 12)
	caja(r, Vector3(0.48, 0.38, 0.02), Vector3(0, 0.36, -0.305), Color("2d2f33"), "Horno", 0.2)
	caja(r, Vector3(0.40, 0.025, 0.03), Vector3(0, 0.60, -0.32), acero, "Tirador", 0.3, 0.8)
	guardar(r, M + "cocina.tscn", "cocina", [uso("cocinar", Vector3(0, 0, -0.65), "+z")], {})
	# ------------------------------------------------------------ DUCHA (plato + mampara)
	r = nuevo("Ducha")
	caja(r, Vector3(0.90, 0.08, 0.90), Vector3(0, 0.04, 0), Color("e8eaec"), "Plato", 0.3)
	var cristal := caja(r, Vector3(0.90, 1.9, 0.02), Vector3(0, 1.03, -0.44), Color(0.7, 0.85, 0.95, 0.25), "Mampara")
	(cristal.material_override as StandardMaterial3D).transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	cil(r, 0.015, 1.9, Vector3(0.40, 0, 0.40), acero, "Barra", 6, 0.3, 0.8)
	caja(r, Vector3(0.14, 0.14, 0.03), Vector3(0.0, 2.0, 0.42), acero, "Alcachofa", 0.3, 0.8)
	cil(r, 0.012, 0.30, Vector3(0.0, 1.72, 0.44), acero, "Tubo", 6, 0.3, 0.8)
	guardar(r, M + "ducha.tscn", "ducha", [uso("ducharse", Vector3(0, 0.08, 0.0), "-z")], {})
	# ------------------------------------------------------------ INDICE
	var f := FileAccess.open(M + "INDICE.json", FileAccess.WRITE)
	f.store_string(JSON.stringify({"_nota": "tipo -> escena, tam [x,y,z] en metros, usos: punto relativo al origen del mueble (suelo, centro) y hacia dónde mira la persona (+z/-z/+x/-x en coordenadas del mueble). Frente del mueble = -Z.", "muebles": indice}, "\t"))
	f.close()
	quit()
