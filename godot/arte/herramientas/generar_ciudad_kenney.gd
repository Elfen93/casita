extends SceneTree
## GD-9: convierte piezas de los packs Kenney (city-kit commercial/suburban/industrial/roads, car-kit) en
## escenas ligeras: una malla .res con el color de paleta horneado en los vértices (sin texturas) y un
## ShaderMaterial (res://arte/ciudad/kit.gdshader) por variante de color. Escala real, origen en el suelo y
## centro de la huella, fachada hacia -Z (Kenney mira a +Z: se gira 180 grados).
## Uso: godot --headless --path godot --script res://arte/herramientas/generar_ciudad_kenney.gd -- /tmp/gd9/x [solo=id,id]
const SHADER := preload("res://arte/ciudad/kit.gdshader")
const BARRIOS := ["El Casco", "Ensanche Norte", "Los Pinares", "La Ribera", "Las Eras", "Polígono Las Salinas"]
const PACKS := {"com": "city-kit-commercial_2.1", "sub": "city-kit-suburban_20", "ind": "city-kit-industrial_2.0", "rod": "city-kit-roads", "car": "car-kit"}

# Paletas españolas. muro / tejado / persiana / toldo / cristal
const MUROS := [Color("e2d3ae"), Color("ece6d6"), Color("b9694c"), Color("d9a875"), Color("d8b98a"), Color("cdbfae"), Color("e0b9a0"), Color("c9a06a")]
const TEJADOS := [Color("b0573a"), Color("93482f"), Color("c06a45"), Color("5f6269")]
const PERSIANAS := [Color("3c6a47"), Color("6b4a35"), Color("55663a"), Color("4a3b30")]
const TOLDOS := [Color("a33f38"), Color("3c6a47"), Color("d19a3a"), Color("e4dccb")]
const CRISTALES := [Color("86a0b3"), Color("6f8aa0"), Color("9ab0c0")]
const MUROS_IND := [Color("e0ddd3"), Color("c3c9cc"), Color("aebba9"), Color("c9b48c"), Color("9fadba"), Color("d6d0c0")]
const PUERTAS_IND := [Color("3f5f7f"), Color("3c6a47"), Color("8f4a35"), Color("6b4a35")]
const CARROCERIAS := [Color("b9bcc2"), Color("f0f0ec"), Color("1f2a3a"), Color("8a2f2b"), Color("2f4f7a"), Color("5c6f5a"), Color("7a7568"), Color("c8c0a8"), Color("2c2c2f")]

# id, pack, glb, categoria, modo, escala (float o Vector3), plantas, barrios, nombre
var CFG := []

func _init() -> void:
	var args := OS.get_cmdline_user_args()
	var base: String = args[0]
	var solo: PackedStringArray = []
	for a in args:
		if a.begins_with("solo="): solo = a.substr(5).split(",")
	_cfg()
	var indice := {}
	var f := FileAccess.open("res://arte/ciudad/INDICE.json", FileAccess.READ)
	if f != null:
		indice = JSON.parse_string(f.get_as_text())
	if not indice.has("piezas"): indice = {"piezas": {}}
	for c in CFG:
		if solo.size() > 0 and not (c.id in solo): continue
		var r = _convertir(base, c)
		if r != null: indice["piezas"][c.id] = r
	indice["_nota"] = "pieza -> escena(s), tam real [x,y,z] en m, huella [x,z], plantas, categoria, barrios, puerta [x,z] relativa al origen (suelo, centro de la huella; fachada principal hacia -Z), triangulos, pesado, variantes (escenas hermanas con otro color). Para calles: tramo y modulo (m)."
	var o := FileAccess.open("res://arte/ciudad/INDICE.json", FileAccess.WRITE)
	o.store_string(JSON.stringify(indice, "", true))
	o.close()
	quit()

func _cfg() -> void:
	var cas := ["El Casco"]
	var ens := ["Ensanche Norte"]
	var pin := ["Los Pinares"]
	var rib := ["La Ribera"]
	var era := ["Las Eras"]
	var pol := ["Polígono Las Salinas"]
	# Comerciales: la unidad Kenney 1 = 9,5 m (una planta ~3,2 m)
	var S := 9.5
	CFG.append({"id": "bloque_a", "pack": "com", "glb": "building-a", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 4, "barrios": ["El Casco", "La Ribera", "Ensanche Norte"], "sub": "edificios"})
	CFG.append({"id": "bloque_b", "pack": "com", "glb": "building-b", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 4, "barrios": ["El Casco", "La Ribera"], "sub": "edificios"})
	CFG.append({"id": "bloque_c", "pack": "com", "glb": "building-c", "cat": "comercio", "modo": "bloque", "esc": S, "plantas": 3, "barrios": ["El Casco", "La Ribera", "Las Eras"], "sub": "edificios"})
	CFG.append({"id": "bloque_d", "pack": "com", "glb": "building-d", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 4, "barrios": ["El Casco", "La Ribera", "Las Eras"], "sub": "edificios"})
	CFG.append({"id": "bloque_e_ancho", "pack": "com", "glb": "building-e", "cat": "comercio", "modo": "bloque", "esc": S, "plantas": 3, "barrios": ["El Casco", "La Ribera", "Ensanche Norte"], "sub": "edificios"})
	CFG.append({"id": "bloque_f", "pack": "com", "glb": "building-f", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 5, "barrios": ["El Casco", "La Ribera", "Ensanche Norte"], "sub": "edificios"})
	CFG.append({"id": "bloque_g", "pack": "com", "glb": "building-g", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 5, "barrios": ["El Casco", "Ensanche Norte", "La Ribera"], "sub": "edificios"})
	CFG.append({"id": "bloque_h", "pack": "com", "glb": "building-h", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 4, "barrios": ["El Casco", "La Ribera", "Las Eras"], "sub": "edificios"})
	CFG.append({"id": "bloque_i", "pack": "com", "glb": "building-i", "cat": "vivienda_bloque", "modo": "bloque", "esc": S, "plantas": 5, "barrios": ["Ensanche Norte", "El Casco"], "sub": "edificios"})
	CFG.append({"id": "rascacielos_a", "pack": "com", "glb": "building-skyscraper-a", "cat": "oficina", "modo": "bloque", "esc": 9.0, "plantas": 8, "barrios": ["Ensanche Norte"], "sub": "edificios"})
	CFG.append({"id": "rascacielos_c", "pack": "com", "glb": "building-skyscraper-c", "cat": "oficina", "modo": "bloque", "esc": 9.0, "plantas": 12, "barrios": ["Ensanche Norte"], "sub": "edificios"})
	# toldos y marquesinas sueltos (para bajos comerciales)
	CFG.append({"id": "toldo", "pack": "com", "glb": "detail-awning-wide", "cat": "mobiliario", "modo": "bloque", "esc": 9.5, "plantas": 0, "barrios": BARRIOS, "sub": "calle"})
	# Suburbanas: 1 = 8,5 m (casa de dos plantas ~6 m de alero)
	var H := 8.0
	for t in ["a", "c", "e", "g", "h", "i", "j", "k", "l", "o", "p", "q", "r", "s", "u", "m"]:
		var plantas := 2
		var barrios_c := ["Los Pinares", "Las Eras"]
		if t in ["h", "i", "m", "g", "q"]: plantas = 1
		if t in ["g", "h", "i", "m", "a", "c", "q", "p"]: barrios_c = ["Los Pinares", "Las Eras"]
		CFG.append({"id": "casa_" + t, "pack": "sub", "glb": "building-type-" + t, "cat": "vivienda_casa", "modo": "casa", "esc": H, "plantas": plantas, "barrios": barrios_c, "sub": "edificios"})
	CFG.append({"id": "valla_pared", "pack": "sub", "glb": "fence-1x4", "cat": "mobiliario", "modo": "neutro", "esc": 5.0, "plantas": 0, "barrios": ["Los Pinares", "Las Eras"], "sub": "calle"})
	# Industriales: 1 = 6,5 m
	var I := 6.5
	for t in ["h", "i", "j", "k", "o", "p", "s", "g", "e", "d"]:
		CFG.append({"id": "nave_" + t, "pack": "ind", "glb": "building-" + t, "cat": "nave", "modo": "nave", "esc": I, "plantas": 1, "barrios": ["Polígono Las Salinas"], "sub": "edificios"})
	CFG.append({"id": "nave_oficinas_a", "pack": "ind", "glb": "building-a", "cat": "nave", "modo": "nave", "esc": I, "plantas": 3, "barrios": ["Polígono Las Salinas"], "sub": "edificios"})
	CFG.append({"id": "nave_oficinas_f", "pack": "ind", "glb": "building-f", "cat": "nave", "modo": "nave", "esc": I, "plantas": 3, "barrios": ["Polígono Las Salinas"], "sub": "edificios"})
	CFG.append({"id": "silo_deposito", "pack": "ind", "glb": "detail-tank-large", "cat": "nave", "modo": "nave", "esc": I, "plantas": 1, "barrios": ["Polígono Las Salinas"], "sub": "edificios"})
	CFG.append({"id": "chimenea", "pack": "ind", "glb": "chimney-large", "cat": "nave", "modo": "nave", "esc": 5.0, "plantas": 0, "barrios": ["Polígono Las Salinas"], "sub": "edificios"})
	CFG.append({"id": "contenedor_maritimo", "pack": "ind", "glb": "shipping-container-a", "cat": "mobiliario", "modo": "nave", "esc": 7.3, "plantas": 0, "barrios": ["Polígono Las Salinas"], "sub": "calle"})
	# Calles: módulo 6 m (dos carriles de 3 m)
	var M := 6.0
	for r in [["calle_recta", "road-straight", "recta"], ["calle_cruce", "road-crossroad", "cruce"], ["calle_cruce_lineas", "road-crossroad-line", "cruce"], ["calle_T", "road-intersection", "T"],
			["calle_curva", "road-bend", "curva"], ["calle_curva_acera", "road-bend-sidewalk", "curva"], ["calle_paso_cebra", "road-crossing", "paso_cebra"],
			["calle_fin", "road-end", "fin"], ["calle_acera_calzada", "road-side", "acera_con_calzada"], ["calle_plaza", "road-square", "plaza"],
			["calle_entrada_garaje", "road-driveway-single", "vado"], ["calle_media_recta", "road-straight-half", "recta_media"]]:
		CFG.append({"id": r[0], "pack": "rod", "glb": r[1], "cat": "calle", "modo": "neutro", "esc": M, "plantas": 0, "barrios": BARRIOS, "sub": "calle", "tramo": r[2], "modulo": M})
	CFG.append({"id": "calle_curva_grande", "pack": "rod", "glb": "road-curve", "cat": "calle", "modo": "neutro", "esc": M, "plantas": 0, "barrios": BARRIOS, "sub": "calle", "tramo": "curva_grande", "modulo": M})
	CFG.append({"id": "calle_rotonda", "pack": "rod", "glb": "road-roundabout", "cat": "calle", "modo": "neutro", "esc": M, "plantas": 0, "barrios": BARRIOS, "sub": "calle", "tramo": "rotonda", "modulo": M})
	# Mobiliario urbano (escala propia por altura real)
	for m in [["farola_curva", "light-curved", 7.5], ["farola_doble", "light-curved-double", 7.5], ["farola_cuadrada", "light-square", 8.0], ["semaforo", "traffic-light", 6.5],
			["semaforo_colgante", "traffic-light-hanging", 6.5], ["senal_stop", "road-sign-stop", 4.6], ["senal_calle", "road-sign-street", 4.6], ["senal_aviso", "road-sign-warning", 4.6],
			["poste_electrico", "electricity-pole", 7.5], ["contenedor_obra", "dumpster", 6.0], ["cono", "construction-cone", 6.0], ["valla_obra", "construction-fence", 6.0]]:
		CFG.append({"id": m[0], "pack": "rod", "glb": m[1], "cat": "mobiliario", "modo": "neutro", "esc": m[2], "plantas": 0, "barrios": BARRIOS, "sub": "calle"})
	# Coches: no uniforme (1,2 ancho, 1,15 alto, 1,65 largo) para quedar en ~1,8 x 1,5 x 4,3 m
	var C := Vector3(1.2, 1.15, 1.65)
	for v in [["coche_berlina", "sedan"], ["coche_utilitario", "suv-luxury"], ["coche_suv", "suv"], ["coche_taxi", "taxi"], ["furgoneta", "van"], ["furgoneta_reparto", "delivery"], ["camion", "truck"]]:
		CFG.append({"id": v[0], "pack": "car", "glb": v[1], "cat": "vehiculo", "modo": "coche", "esc": C, "plantas": 0, "barrios": BARRIOS, "sub": "vehiculos"})

func _imagen(pack: String, base: String) -> Image:
	var p := "%s/%s/Models/GLB format/Textures/colormap.png" % [base, PACKS[pack]]
	return Image.load_from_file(p)

func _clase(c: Color, modo: String, dom: Color) -> int:
	var mx := maxf(c.r, maxf(c.g, c.b))
	var mn := minf(c.r, minf(c.g, c.b))
	var s := 0.0 if mx == 0.0 else (mx - mn) / mx
	if modo == "neutro": return 0
	if modo == "coche":
		var dh := absf(c.h - dom.h)
		if s > 0.3 and mx > 0.4 and minf(dh, 1.0 - dh) < 0.04: return 6
		return 0
	if mn > 0.72 and s < 0.12: return 1
	if c.g > c.r + 0.15 and c.g > c.b + 0.05 and c.g > 0.665:
		return 2 if modo == "casa" else 3
	if modo != "casa" and s > 0.5 and c.r > 0.8 and c.b < 0.55: return 5
	if c.b > c.r + 0.15 and mx > 0.78: return 4
	if mx < 0.5 and s < 0.35: return 7
	return 0

func _convertir(base: String, c: Dictionary):
	var ruta := "%s/%s/Models/GLB format/%s.glb" % [base, PACKS[c.pack], c.glb]
	var doc := GLTFDocument.new()
	var st := GLTFState.new()
	if doc.append_from_file(ruta, st) != OK:
		printerr("no se pudo leer ", ruta); return null
	var root := doc.generate_scene(st)
	var img := _imagen(c.pack, base)
	var w := img.get_width()
	var h := img.get_height()
	var esc: Vector3 = c.esc if c.esc is Vector3 else Vector3.ONE * float(c.esc)
	var giro := Basis(Vector3.UP, PI)
	var vs := PackedVector3Array()
	var ns := PackedVector3Array()
	var cols := PackedColorArray()
	var idx := PackedInt32Array()
	var base_cols := []
	var meshes := []
	var stack := [root]
	while stack.size() > 0:
		var n = stack.pop_back()
		for k in n.get_children(): stack.append(k)
		if n is MeshInstance3D: meshes.append(n)
	# color dominante saturado (carrocería) para coches
	var cuenta := {}
	for mi in meshes:
		var m: Mesh = mi.mesh
		for s in m.get_surface_count():
			var a := m.surface_get_arrays(s)
			var uv: PackedVector2Array = a[Mesh.ARRAY_TEX_UV]
			for u in uv:
				var px := img.get_pixel(clampi(int(u.x * w), 0, w - 1), clampi(int(u.y * h), 0, h - 1))
				var mx := maxf(px.r, maxf(px.g, px.b))
				var mn := minf(px.r, minf(px.g, px.b))
				if mx > 0.45 and (mx - mn) / mx > 0.35 and not (px.b > px.r + 0.15 and mx > 0.78):
					var key := px.to_html()
					cuenta[key] = int(cuenta.get(key, 0)) + 1
	var dom := Color(-1, -1, -1)
	var mejor := 0
	for k in cuenta:
		if cuenta[k] > mejor and not (c.glb in ["delivery"] and false):
			mejor = cuenta[k]; dom = Color(k)
	for mi in meshes:
		var xf: Transform3D = _global(mi, root)
		var m: Mesh = mi.mesh
		for s in m.get_surface_count():
			var a := m.surface_get_arrays(s)
			var v: PackedVector3Array = a[Mesh.ARRAY_VERTEX]
			var nn: PackedVector3Array = a[Mesh.ARRAY_NORMAL]
			var uv: PackedVector2Array = a[Mesh.ARRAY_TEX_UV]
			var ind: PackedInt32Array = a[Mesh.ARRAY_INDEX] if a[Mesh.ARRAY_INDEX] != null else PackedInt32Array()
			var nb := (giro * Basis.from_scale(esc)).inverse().transposed()
			var pcol := PackedColorArray()
			var pcls := PackedInt32Array()
			for i in v.size():
				var px := img.get_pixel(clampi(int(uv[i].x * w), 0, w - 1), clampi(int(uv[i].y * h), 0, h - 1))
				pcol.append(px)
				pcls.append(_clase(px, c.modo, dom))
			if ind.size() == 0:
				for i in v.size(): ind.append(i)
			# la clase se interpola entre vértices: se duplican para que cada triángulo tenga una sola clase
			var mapa := {}
			for t in range(0, ind.size(), 3):
				var c0 := pcls[ind[t]]
				var c1 := pcls[ind[t + 1]]
				var c2 := pcls[ind[t + 2]]
				var cl := c0
				if c1 == c2: cl = c1
				for j in 3:
					var i := ind[t + j]
					var key := i * 16 + cl
					if not mapa.has(key):
						mapa[key] = vs.size()
						var p := giro * (xf * v[i])
						vs.append(Vector3(p.x * esc.x, p.y * esc.y, p.z * esc.z))
						ns.append((nb * (xf.basis * nn[i])).normalized() if nn.size() > i else Vector3.UP)
						cols.append(Color(pcol[i].r, pcol[i].g, pcol[i].b, float(cl) / 8.0))
					idx.append(mapa[key])
	root.free()
	var aabb := AABB(vs[0], Vector3.ZERO)
	for p in vs: aabb = aabb.expand(p)
	var centro := Vector3(aabb.position.x + aabb.size.x / 2.0, aabb.position.y, aabb.position.z + aabb.size.z / 2.0)
	for i in vs.size(): vs[i] -= centro
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = vs
	arr[Mesh.ARRAY_NORMAL] = ns
	arr[Mesh.ARRAY_COLOR] = cols
	arr[Mesh.ARRAY_INDEX] = idx
	var am := ArrayMesh.new()
	am.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	am.resource_name = c.id
	var rm := "res://arte/ciudad/modelos/%s.res" % c.id
	ResourceSaver.save(am, rm, ResourceSaver.FLAG_COMPRESS)
	var tam := aabb.size
	var variantes: Array = []
	var nv := 1 if c.modo == "neutro" else 3
	var escenas := []
	var semilla := absi(c.id.hash()) % 97
	for k in nv:
		var mat := ShaderMaterial.new()
		mat.shader = SHADER
		var nom := ""
		match c.modo:
			"bloque", "casa":
				mat.set_shader_parameter("c_muro", MUROS[(semilla + k * 3) % MUROS.size()])
				mat.set_shader_parameter("c_tejado", TEJADOS[(semilla + k) % TEJADOS.size()])
				mat.set_shader_parameter("c_persiana", PERSIANAS[(semilla + k * 2) % PERSIANAS.size()])
				mat.set_shader_parameter("c_toldo", TOLDOS[(semilla + k) % TOLDOS.size()])
				mat.set_shader_parameter("c_cristal", CRISTALES[(semilla + k) % CRISTALES.size()])
				var mu: Color = MUROS[(semilla + k * 3) % MUROS.size()]
				mat.set_shader_parameter("c_zocalo", mu.lerp(Color("5a5750"), 0.62))
			"nave":
				mat.set_shader_parameter("c_muro", MUROS_IND[(semilla + k * 2) % MUROS_IND.size()])
				mat.set_shader_parameter("c_zocalo", MUROS_IND[(semilla + k * 2) % MUROS_IND.size()].lerp(Color("4f5258"), 0.55))
				mat.set_shader_parameter("c_persiana", PUERTAS_IND[(semilla + k) % PUERTAS_IND.size()])
				mat.set_shader_parameter("c_toldo", PUERTAS_IND[(semilla + k + 1) % PUERTAS_IND.size()])
				mat.set_shader_parameter("c_cristal", CRISTALES[(semilla + k) % CRISTALES.size()])
			"coche":
				mat.set_shader_parameter("c_carroceria", Color("e8e6df") if c.id == "coche_taxi" else CARROCERIAS[(semilla + k * 3) % CARROCERIAS.size()])
				mat.set_shader_parameter("apagado", 0.0)
		if c.modo == "neutro": mat.set_shader_parameter("apagado", 0.7)
		var raiz := Node3D.new()
		var sufijo := "" if nv == 1 else "_" + "abc"[k]
		raiz.name = (c.id + sufijo).to_pascal_case()
		var mi := MeshInstance3D.new()
		mi.name = "Malla"
		mi.mesh = load(rm)
		mi.material_override = mat
		raiz.add_child(mi)
		mi.owner = raiz
		var ps := PackedScene.new()
		ps.pack(raiz)
		var rs := "res://arte/ciudad/%s/%s%s.tscn" % [c.sub, c.id, sufijo]
		ResourceSaver.save(ps, rs)
		escenas.append(rs)
		raiz.free()
	var tris := idx.size() / 3
	var lim := 800 if c.modo == "coche" else 1500
	var puerta := [0.0, -tam.z / 2.0]
	var r := {"escena": escenas[0], "variantes": escenas, "tam": [snappedf(tam.x, 0.01), snappedf(tam.y, 0.01), snappedf(tam.z, 0.01)],
		"huella": [snappedf(tam.x, 0.01), snappedf(tam.z, 0.01)], "plantas": c.plantas, "categoria": c.cat, "barrios": c.barrios,
		"triangulos": tris, "pesado": tris > lim, "origen": "%s/%s" % [PACKS[c.pack], c.glb]}
	if c.cat in ["vivienda_bloque", "vivienda_casa", "comercio", "oficina", "nave"] and c.plantas > 0:
		r["puerta"] = puerta
	if c.has("tramo"):
		r["tramo"] = c.tramo
		r["modulo"] = c.modulo
	print("%s tris=%d tam=%s" % [c.id, tris, tam.snapped(Vector3(0.01, 0.01, 0.01))])
	return r

func _global(n: Node, root: Node) -> Transform3D:
	var t := Transform3D.IDENTITY
	var cur := n
	while cur != null and cur != root:
		t = (cur as Node3D).transform * t
		cur = cur.get_parent()
	return t
