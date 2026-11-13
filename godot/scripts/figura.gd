class_name Figura
# ÚNICO PUNTO donde se crea la figura del personaje y de los vecinos. Para cambiar el dibujo (modelo, arte de godot/arte/),
# basta con sustituir el cuerpo de crear(): debe devolver {"nodo": Node3D raíz, "cuerpo": Node3D que bota al andar}
# con los pies en y=0 y 1,7 m de alto (Escala.ALTURA_PJ) para esc=1.
static func crear(camisa: Color, piel: Color, esc := 1.0) -> Dictionary:
	var raiz := Node3D.new()
	var cuerpo := Node3D.new()
	raiz.add_child(cuerpo)
	var mc := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.27
	cap.height = 1.45
	cap.radial_segments = 10
	cap.rings = 4
	mc.mesh = cap
	mc.material_override = _mat(camisa)
	mc.position.y = 0.73
	cuerpo.add_child(mc)
	var mh := MeshInstance3D.new()
	var sp := SphereMesh.new()
	sp.radius = 0.19
	sp.height = 0.38
	sp.radial_segments = 10
	sp.rings = 5
	mh.mesh = sp
	mh.material_override = _mat(piel)
	mh.position.y = 1.52
	cuerpo.add_child(mh)
	raiz.scale = Vector3.ONE * esc
	return {"nodo": raiz, "cuerpo": cuerpo}

static func _mat(c: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = 0.9
	return m
