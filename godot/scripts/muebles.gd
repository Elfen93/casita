class_name Muebles
extends RefCounted
# GD-8b: amueblar tu piso. Comprar, colocar, mover, girar y vender muebles.
# El catálogo es dato (data/catalogo_muebles.json); la API para añadir/quitar/mover en caliente está en interior.gd.
# main.gd solo tiene ganchos marcados «# --- muebles ---».
# Coordenadas «del piso»: dx a la derecha de la puerta y dz hacia el fondo, en metros (las mismas que `pos` en interiores.json).

const PASO := 0.5               # el fantasma se ajusta a medio metro
const VENTA := 0.5              # se devuelve la mitad del precio
const DESPLAZA_CAM := 3.0       # al entrar al modo, la cámara se corre para que el panel no tape el piso
const PUERTA_FONDO := 2.0       # zona de la puerta que no se puede tapar (metros hacia dentro)

var jg                          # main
var it: Interior                # tu piso
var cat: Dictionary = {}        # tipo -> {p, cat, d}
var cats: Array = []            # [[id, nombre], …]
var activo := false
var est := ""                   # "catalogo", "colocando", "objeto"
var tipo_sel := ""
var mover_id := ""              # si no está vacío, se está moviendo ese mueble
var objeto_sel: Objeto = null
var fpos := Vector2.ZERO        # fantasma, coordenadas del piso
var fgiro := 0.0
var fvalido := false
var fmotivo := ""
var cat_act := ""
var cont := 0
var cam_antes := Vector3.ZERO
var fantasma: Node3D = null
var rejilla: MeshInstance3D = null
var ov_ok: StandardMaterial3D
var ov_no: StandardMaterial3D
var ov_sel: StandardMaterial3D
# interfaz
var btn: Button
var panel: PanelContainer
var lbl_cab: Label
var v_cat: VBoxContainer
var fila_cats: HFlowContainer
var scroll: ScrollContainer
var lista: VBoxContainer
var v_col: VBoxContainer
var lbl_col_t: Label
var lbl_col_d: Label
var lbl_col_e: Label
var b_girar: Button
var b_colocar: Button
var b_cancelar: Button
var v_obj: VBoxContainer
var lbl_obj: Label
var b_mover: Button
var b_girar_o: Button
var b_vender: Button
var b_cerrar_o: Button
var b_salir: Button
var b_cats := {}                # id -> Button
var b_items := {}               # tipo -> Button

func _init(m) -> void:
	jg = m
	var d := Datos.cargar("catalogo_muebles")
	cat = d.get("muebles", {})
	cats = d.get("categorias", [])
	for i in jg.interiores_v:
		if i.id == "casa":
			it = i
	ov_ok = _mat_ov(Color(0.2, 0.9, 0.3, 0.5))
	ov_no = _mat_ov(Color(0.95, 0.2, 0.2, 0.55))
	ov_sel = _mat_ov(Color(1.0, 0.85, 0.2, 0.35))
	jg.guardado.registrar("casa", 1, _guardar, _aplicar)

static func _mat_ov(c: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	return m

# =============== catálogo ===============
# tipos que se pueden comprar: están en el catálogo Y existen en interiores.json -> tipos
func tipos_ofrecidos(categoria := "") -> Array:
	var r: Array = []
	for k in cat:
		if not jg.tipos_obj.has(k):
			continue
		if categoria != "" and cat[k].get("cat", "") != categoria:
			continue
		r.append(k)
	r.sort_custom(func(a, b): return float(cat[a]["p"]) < float(cat[b]["p"]))
	return r

func precio(tipo: String) -> float:
	return float(cat.get(tipo, {}).get("p", 0.0))

func nombre(tipo: String) -> String:
	return str(jg.tipos_obj.get(tipo, {}).get("n", tipo))

func en_piso() -> bool:
	return it != null and jg.interior == it and not jg.dentro

# =============== comprobar si cabe ===============
func _huella(tipo: String) -> Vector2:
	var td: Dictionary = jg.tipos_obj[tipo]
	return Vector2(float(td["huella"][0]), float(td["huella"][1]))

func _celdas(r: Rect2) -> Rect2i:
	var o := it.rect.position
	var x0 := clampi(floori(r.position.x - o.x + 0.001), 0, int(it.rect.size.x) - 1)
	var x1 := clampi(floori(r.end.x - o.x - 0.001), 0, int(it.rect.size.x) - 1)
	var z0 := clampi(floori(r.position.y - o.y + 0.001), 0, int(it.rect.size.y) - 1)
	var z1 := clampi(floori(r.end.y - o.y - 0.001), 0, int(it.rect.size.y) - 1)
	return Rect2i(x0, z0, x1 - x0 + 1, z1 - z0 + 1)

func _celda_de(p: Vector2) -> Vector2i:
	return Vector2i(floori(p.x - it.rect.position.x), floori(p.y - it.rect.position.y))

# puntos de uso en el mundo de un tipo colocado en pm con ese giro
func _usos(td: Dictionary, pm: Vector2, giro: float) -> Array:
	var r: Array = []
	var b := Basis(Vector3.UP, deg_to_rad(giro))
	for u in td.get("uso", []):
		var v := b * Vector3(float(u[0]), 0, float(u[1]))
		r.append(pm + Vector2(v.x, v.z))
	return r

# Fallos de acceso andando desde la puerta con el piso tal y como está (sin el mueble `ignorar`) más, si se da, un candidato.
# Devuelve claves: "puerta", "e:<estancia>", "u:<id>:<i>" (punto de uso de un mueble), "u:nuevo:<i>".
func _fallos(cand: Dictionary, ignorar: String) -> Array:
	var W := int(it.rect.size.x)
	var H := int(it.rect.size.y)
	var bloq := PackedByteArray()
	bloq.resize(W * H)
	for tb in it.tabiques:
		if not tb["hueco"]:
			_marcar(bloq, _celdas(tb["rect"]), W)
	for o in it.objetos:
		if o.id != ignorar and o.def.get("solido", false):
			_marcar(bloq, _celdas(it.rect_de(o)), W)
	if not cand.is_empty() and cand["solido"]:
		_marcar(bloq, _celdas(cand["rect"]), W)
	var fal: Array = []
	var ini := _celda_de(Vector2(it.puerta.x + 0.5, it.puerta.y - 0.5))
	var vis := PackedByteArray()
	vis.resize(W * H)
	if ini.x < 0 or ini.y < 0 or ini.x >= W or ini.y >= H or bloq[ini.y * W + ini.x] == 1:
		return ["puerta"]
	var cola: Array = [ini]
	vis[ini.y * W + ini.x] = 1
	while not cola.is_empty():
		var c: Vector2i = cola.pop_back()
		for dv in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var q: Vector2i = c + dv
			if q.x < 0 or q.y < 0 or q.x >= W or q.y >= H:
				continue
			var k := q.y * W + q.x
			if vis[k] == 1 or bloq[k] == 1:
				continue
			vis[k] = 1
			cola.append(q)
	for o in it.objetos:
		if o.id == ignorar or o.tipo == "cliente":
			continue
		var us := _usos(o.def, o.pos, o.giro)
		for i in us.size():
			if not _alcanzada(vis, us[i], W, H):
				fal.append("u:%s:%d" % [o.id, i])
	if not cand.is_empty():
		var us2: Array = _usos(cand["td"], cand["pos"], cand["giro"])
		for i in us2.size():
			if not _alcanzada(vis, us2[i], W, H):
				fal.append("u:nuevo:%d" % i)
	var ests: Dictionary = it.def.get("estancias", {})
	for n in ests:
		var e: Array = ests[n]
		var ok := false
		for cz in H:
			for cx in W:
				if vis[cz * W + cx] == 0:
					continue
				var mx := it.rect.position.x + cx + 0.5
				var mz := it.rect.position.y + cz + 0.5
				var l := it.mundo_a_local(Vector2(mx, mz))
				if l.x >= float(e[0]) and l.x <= float(e[2]) and l.y >= float(e[1]) and l.y <= float(e[3]):
					ok = true
		if not ok:
			fal.append("e:" + str(n))
	return fal

func _marcar(bloq: PackedByteArray, q: Rect2i, W: int) -> void:
	for z in range(q.position.y, q.end.y):
		for x in range(q.position.x, q.end.x):
			bloq[z * W + x] = 1

func _alcanzada(vis: PackedByteArray, p: Vector2, W: int, H: int) -> bool:
	var c := _celda_de(p)
	return c.x >= 0 and c.y >= 0 and c.x < W and c.y < H and vis[c.y * W + c.x] == 1

# "" si el mueble cabe en pl (coordenadas del piso) con ese giro; si no, el motivo en una línea.
# `ignorar` es el id de un mueble que se está moviendo (no cuenta como obstáculo).
func motivo_no_cabe(tipo: String, pl: Vector2, giro: float, ignorar := "") -> String:
	if it == null:
		return "No estás en tu piso."
	var td: Dictionary = jg.tipos_obj[tipo]
	var pm := it.local_a_mundo(pl)
	var r := Interior.rect_huella(pm, _huella(tipo), giro)
	var solido: bool = td.get("solido", false)
	if not it.rect.grow(0.001).encloses(r):
		return "Se sale del piso."
	var rr := r.grow(-0.01)
	for tb in it.tabiques:
		if (tb["rect"] as Rect2).intersects(rr):
			return "Tapa un hueco de paso." if tb["hueco"] else "Pisa un tabique."
	if Rect2(it.puerta.x - 1.0, it.puerta.y - PUERTA_FONDO, 2.0, PUERTA_FONDO).intersects(rr):
		return "Tapa la puerta."
	for o in it.objetos:
		if o.id == ignorar:
			continue
		if (solido or o.def.get("solido", false)) and it.rect_de(o).grow(-0.01).intersects(rr):
			return "Pisa otro mueble."
	if solido and jg.jugador != null and r.grow(0.2).has_point(jg.jugador.pos2()):
		return "Estás encima: apártate."
	var cand := {"td": td, "pos": pm, "giro": giro, "rect": r, "solido": solido}
	var antes := _fallos({}, ignorar)
	var desp := _fallos(cand, ignorar)
	for f in desp:
		if antes.has(f):
			continue
		if f == "puerta":
			return "Cierra el paso desde la puerta."
		if f.begins_with("e:"):
			return "Dejaría aislada la estancia «%s»." % f.substr(2)
		var p: PackedStringArray = f.split(":")
		if p[1] == "nuevo":
			return "No se podría usar: no hay paso hasta él."
		var o2: Objeto = it.por_id.get(p[1], null)
		return "«%s» se quedaría sin acceso." % (str(o2.def.get("n", p[1])) if o2 != null else p[1])
	return ""

# =============== operaciones (las usan la interfaz y las órdenes de prueba) ===============
func _id_nuevo(tipo: String) -> String:
	while true:
		cont += 1
		var i := "%s_%d" % [tipo, cont]
		if not it.por_id.has(i):
			return i
	return ""

# "" si se compra y coloca; si no, el motivo
func comprar(tipo: String, pl: Vector2, giro: float) -> String:
	if it == null:
		return "No hay piso."
	if not cat.has(tipo) or not jg.tipos_obj.has(tipo):
		return "Ese mueble no está en el catálogo."
	var m := motivo_no_cabe(tipo, pl, giro)
	if m != "":
		return m
	var p := precio(tipo)
	if jg.dinero < p:
		return "No te llega el dinero."
	it.añadir_mueble(jg, {"id": _id_nuevo(tipo), "tipo": tipo, "pos": [pl.x, pl.y], "giro": giro}, jg.tipos_obj)
	jg.dinero -= p
	jg._hud()
	return ""

func en_uso(o: Objeto) -> bool:
	for k in o.ocupado:
		if o.ocupado[k] != null:
			return true
	var c: Cola = jg.cola
	if not c.act.is_empty() and c.act.get("obj", null) == o:
		return true
	for x in c.items:
		if x.get("obj", null) == o:
			return true
	return false

func valor_venta(o: Objeto) -> float:
	return floorf(precio(o.tipo) * VENTA)

# "" si se vende (y se ingresa la mitad); si no, el motivo
func vender(mid: String) -> String:
	if it == null or not it.por_id.has(mid):
		return "No existe ese mueble."
	var o: Objeto = it.por_id[mid]
	if en_uso(o):
		return "Lo estás usando."
	var v := valor_venta(o)
	if objeto_sel == o:
		objeto_sel = null
	it.quitar_mueble(jg, mid)
	jg.dinero += v
	jg._hud()
	return ""

func mover(mid: String, pl: Vector2, giro: float) -> String:
	if it == null or not it.por_id.has(mid):
		return "No existe ese mueble."
	var o: Objeto = it.por_id[mid]
	if en_uso(o):
		return "Lo estás usando."
	var m := motivo_no_cabe(o.tipo, pl, giro, mid)
	if m != "":
		return m
	it.mover_mueble(jg, mid, pl, giro)
	return ""

# =============== guardado (sección «casa») ===============
func _guardar() -> Dictionary:
	var l: Array = []
	if it != null:
		for o in it.objetos:
			var pl := it.mundo_a_local(o.pos)
			l.append({"id": o.id, "tipo": o.tipo, "x": snappedf(pl.x, 0.01), "z": snappedf(pl.y, 0.01), "giro": o.giro})
	return {"muebles": l}

func _aplicar(d: Dictionary) -> void:
	var l = d.get("muebles", null)
	if it == null or not (l is Array):
		return
	if activo:
		salir()
	jg.cola.vaciar()
	for o in it.objetos.duplicate():
		it.quitar_mueble(jg, o.id)
	for m in l:
		if not (m is Dictionary):
			continue
		var tipo = m.get("tipo", null)
		var x = m.get("x", null)
		var z = m.get("z", null)
		if not (tipo is String) or not jg.tipos_obj.has(tipo) or not ((x is float or x is int) and (z is float or z is int)):
			continue
		if not (is_finite(float(x)) and is_finite(float(z))):
			continue
		var giro := float(m.get("giro", 0)) if (m.get("giro", 0) is float or m.get("giro", 0) is int) else 0.0
		var r := Interior.rect_huella(it.local_a_mundo(Vector2(float(x), float(z))), _huella(tipo), giro)
		if not it.rect.grow(0.01).encloses(r):
			continue
		var mid := str(m.get("id", ""))
		if mid == "" or it.por_id.has(mid):
			mid = _id_nuevo(tipo)
		it.añadir_mueble(jg, {"id": mid, "tipo": tipo, "pos": [float(x), float(z)], "giro": giro}, jg.tipos_obj)
	if jg.jugador != null and jg.nav.solido(jg.jugador.pos2()):
		jg.jugador.poner(jg.nav.centro(jg.nav.libre_cerca(jg.jugador.pos2())))
		jg.jugador.ruta = []

# =============== modo muebles ===============
func entrar() -> bool:
	if activo:
		return true
	if not en_piso() or jg.velo.visible:
		return false
	activo = true
	jg.cola.vaciar()
	jg.jugador.ruta = []
	jg.marca.visible = false
	jg.tap_pend = false
	jg._cerrar_ficha()
	cam_antes = jg.pivote.position
	jg.pivote.position = jg.jugador.nodo.position + jg.pivote.global_transform.basis.z * DESPLAZA_CAM
	_hacer_rejilla()
	cat_act = ""
	_ir_catalogo()
	return true

func salir() -> void:
	if not activo:
		return
	_limpiar_seleccion()
	_quitar_fantasma()
	if rejilla != null:
		rejilla.queue_free()
		rejilla = null
	activo = false
	est = ""
	panel.visible = false
	if jg.cam_libre:
		jg.pivote.position = cam_antes

func _hacer_rejilla() -> void:
	var r := it.rect
	var im := ImmediateMesh.new()
	im.surface_begin(Mesh.PRIMITIVE_LINES)
	for i in range(0, int(r.size.x) + 1):
		im.surface_add_vertex(Vector3(r.position.x + i, 0.115, r.position.y))
		im.surface_add_vertex(Vector3(r.position.x + i, 0.115, r.end.y))
	for j in range(0, int(r.size.y) + 1):
		im.surface_add_vertex(Vector3(r.position.x, 0.115, r.position.y + j))
		im.surface_add_vertex(Vector3(r.end.x, 0.115, r.position.y + j))
	im.surface_end()
	rejilla = MeshInstance3D.new()
	rejilla.mesh = im
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.albedo_color = Color(1, 1, 1, 0.5)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	rejilla.material_override = m
	rejilla.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	it.raiz.add_child(rejilla)

func _poner_overlay(n: Node3D, m: Material) -> void:
	for mi in n.find_children("*", "MeshInstance3D", true, false):
		(mi as MeshInstance3D).material_overlay = m

func _quitar_fantasma() -> void:
	if fantasma != null:
		fantasma.queue_free()
		fantasma = null
	if mover_id != "" and it != null and it.por_id.has(mover_id):
		(it.por_id[mover_id] as Objeto).nodo.visible = true
	mover_id = ""

func _limpiar_seleccion() -> void:
	if objeto_sel != null and is_instance_valid(objeto_sel.nodo):
		_poner_overlay(objeto_sel.nodo, null)
	objeto_sel = null

func _ir_catalogo() -> void:
	_limpiar_seleccion()
	_quitar_fantasma()
	est = "catalogo"
	tipo_sel = ""
	_refrescar_ui()

# elegir un mueble del catálogo: aparece el fantasma en el centro de la vista
func elegir(tipo: String) -> void:
	if not activo or not jg.tipos_obj.has(tipo):
		return
	_limpiar_seleccion()
	_quitar_fantasma()
	tipo_sel = tipo
	est = "colocando"
	fgiro = 0.0
	fpos = _centro_vista()
	_crear_fantasma(tipo)
	_actualizar_fantasma()
	_refrescar_ui()

func _centro_vista() -> Vector2:
	var vp: Vector2 = jg.get_viewport().get_visible_rect().size
	var p := Vector2(vp.x * 0.5, vp.y * 0.33)
	var g = Plane(Vector3.UP, 0.0).intersects_ray(jg.camara.project_ray_origin(p), jg.camara.project_ray_normal(p))
	var l := it.mundo_a_local(Vector2(it.rect.get_center().x, it.rect.get_center().y))
	if g != null:
		l = it.mundo_a_local(Vector2(Vector3(g).x, Vector3(g).z))
	return _ajustar(l)

func _ajustar(l: Vector2) -> Vector2:
	# a medio metro y dentro del piso
	var x := snappedf(l.x, PASO)
	var z := snappedf(l.y, PASO)
	var izq := it.puerta.x - it.rect.position.x
	return Vector2(clampf(x, -izq + PASO, it.rect.size.x - izq - PASO), clampf(z, PASO, it.rect.size.y - PASO))

func _crear_fantasma(tipo: String) -> void:
	fantasma = Node3D.new()
	Interior.dibujar_tipo(jg.tipos_obj[tipo], fantasma)
	it.raiz.add_child(fantasma)

func _actualizar_fantasma() -> void:
	if fantasma == null:
		return
	var pm := it.local_a_mundo(fpos)
	fantasma.position = Vector3(pm.x, 0.0, pm.y)
	fantasma.rotation.y = deg_to_rad(fgiro)
	var tipo := tipo_sel
	fmotivo = motivo_no_cabe(tipo, fpos, fgiro, mover_id)
	fvalido = fmotivo == ""
	_poner_overlay(fantasma, ov_ok if fvalido else ov_no)

func girar_fantasma() -> void:
	fgiro = fposmod(fgiro + 90.0, 360.0)
	_actualizar_fantasma()
	_refrescar_ui()

func colocar() -> void:
	if est != "colocando":
		return
	var m := fmotivo
	if m == "":
		if mover_id != "":
			m = mover(mover_id, fpos, fgiro)
			if m == "":
				var o: Objeto = it.por_id[mover_id]
				_quitar_fantasma()
				_ir_catalogo()
				seleccionar(o)
				return
		else:
			m = comprar(tipo_sel, fpos, fgiro)
			if m == "":
				jg._aviso("Comprado: %s (−%s)" % [nombre(tipo_sel).to_lower(), jg._eur(precio(tipo_sel))])
				_quitar_fantasma()
				_ir_catalogo()
				return
	jg._aviso(m)
	_refrescar_ui()

func cancelar() -> void:
	var o := objeto_sel
	var mid := mover_id
	_quitar_fantasma()
	_ir_catalogo()
	if mid != "" and it.por_id.has(mid):
		seleccionar(it.por_id[mid])
	elif o != null and is_instance_valid(o.nodo):
		seleccionar(o)

func seleccionar(o: Objeto) -> void:
	_limpiar_seleccion()
	_quitar_fantasma()
	objeto_sel = o
	est = "objeto"
	_poner_overlay(o.nodo, ov_sel)
	_refrescar_ui()

func mover_sel() -> void:
	var o := objeto_sel
	if o == null:
		return
	if en_uso(o):
		jg._aviso("Lo estás usando.")
		return
	_limpiar_seleccion()
	mover_id = o.id
	tipo_sel = o.tipo
	est = "colocando"
	fpos = it.mundo_a_local(o.pos)
	fgiro = o.giro
	o.nodo.visible = false
	_crear_fantasma(o.tipo)
	_actualizar_fantasma()
	_refrescar_ui()

func girar_sel() -> void:
	var o := objeto_sel
	if o == null:
		return
	if en_uso(o):
		jg._aviso("Lo estás usando.")
		return
	var g := fposmod(o.giro + 90.0, 360.0)
	var m := mover(o.id, it.mundo_a_local(o.pos), g)
	if m != "":
		jg._aviso("No gira: " + m.to_lower())
	_refrescar_ui()

func vender_sel() -> void:
	var o := objeto_sel
	if o == null:
		return
	var v := valor_venta(o)
	var n := nombre(o.tipo)
	var m := vender(o.id)
	if m != "":
		jg._aviso(m)
		return
	jg._aviso("Vendido: %s (+%s)" % [n.to_lower(), jg._eur(v)])
	_ir_catalogo()

# =============== toques ===============
func _suelo(p: Vector2) -> Variant:
	var g = Plane(Vector3.UP, 0.0).intersects_ray(jg.camara.project_ray_origin(p), jg.camara.project_ray_normal(p))
	if g == null:
		return null
	return Vector2(Vector3(g).x, Vector3(g).z)

# un toque (ya filtrado: no era de la interfaz)
func tap(p: Vector2) -> void:
	if not activo:
		return
	var s = _suelo(p)
	if est == "colocando":
		if s != null:
			fpos = _ajustar(it.mundo_a_local(s))
			_actualizar_fantasma()
			_refrescar_ui()
		return
	var o := _mueble_en(p)
	if o != null:
		seleccionar(o)
	elif est == "objeto":
		_ir_catalogo()

func _mueble_en(p: Vector2) -> Objeto:
	var orig: Vector3 = jg.camara.project_ray_origin(p)
	var nor: Vector3 = jg.camara.project_ray_normal(p)
	var mejor: Objeto = null
	var md := 1e18
	for o in it.objetos:
		var g := absi(int(round(o.giro))) % 180 == 90
		var hx: float = o.huella.y if g else o.huella.x
		var hz: float = o.huella.x if g else o.huella.y
		var ab := AABB(Vector3(o.pos.x - hx * 0.5 - 0.1, 0, o.pos.y - hz * 0.5 - 0.1), Vector3(hx + 0.2, o.alto, hz + 0.2))
		var r = ab.intersects_ray(orig, nor)
		if r != null:
			var d: float = orig.distance_to(r)
			if d < md:
				md = d
				mejor = o
	return mejor

func en_ui(p: Vector2) -> bool:
	return (btn != null and btn.visible and btn.get_global_rect().has_point(p)) or (panel != null and panel.visible and panel.get_global_rect().has_point(p))

# cada fotograma (antes de congelar el tiempo): el aviso sigue corriendo y el botón sale solo dentro del piso
func tick(dt: float) -> void:
	if btn == null:
		return
	btn.visible = not activo and en_piso() and not jg.velo.visible
	if activo:
		if not en_piso():
			salir()
		elif jg.toast.visible:
			jg.toast_t -= dt
			if jg.toast_t <= 0.0:
				jg.toast.visible = false

# =============== interfaz ===============
func _boton(txt: String, f: Callable, alto := 48.0, tam := 16) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(0, alto)
	b.add_theme_font_size_override("font_size", tam)
	b.pressed.connect(f)
	for n in ["normal", "hover", "pressed", "focus"]:
		var e := StyleBoxFlat.new()
		e.bg_color = Color(0.3, 0.36, 0.5) if n != "pressed" else Color(0.42, 0.5, 0.68)
		e.set_corner_radius_all(10)
		e.set_content_margin_all(6)
		b.add_theme_stylebox_override(n, e)
	return b

func crear_ui(ui: Control) -> void:
	btn = _boton("Muebles", func(): entrar(), 46.0)
	btn.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	btn.offset_right = -8
	btn.offset_left = -176
	btn.offset_top = 196
	btn.offset_bottom = 242
	btn.visible = false
	ui.add_child(btn)
	panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel.offset_left = 8
	panel.offset_right = -8
	panel.offset_bottom = -84
	panel.grow_vertical = Control.GROW_DIRECTION_BEGIN
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.1, 0.12, 0.17, 0.94)
	sb.set_corner_radius_all(14)
	sb.set_content_margin_all(10)
	panel.add_theme_stylebox_override("panel", sb)
	panel.visible = false
	ui.add_child(panel)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	panel.add_child(vb)
	var cab := HBoxContainer.new()
	vb.add_child(cab)
	lbl_cab = Label.new()
	lbl_cab.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_cab.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	lbl_cab.add_theme_font_size_override("font_size", 18)
	cab.add_child(lbl_cab)
	b_salir = _boton("Salir", func(): salir(), 46.0)
	b_salir.custom_minimum_size = Vector2(96, 46)
	cab.add_child(b_salir)
	# vista del catálogo
	v_cat = VBoxContainer.new()
	v_cat.add_theme_constant_override("separation", 6)
	vb.add_child(v_cat)
	fila_cats = HFlowContainer.new()
	fila_cats.add_theme_constant_override("h_separation", 6)
	fila_cats.add_theme_constant_override("v_separation", 6)
	v_cat.add_child(fila_cats)
	for c in cats:
		if tipos_ofrecidos(str(c[0])).is_empty():
			continue
		var cid := str(c[0])
		var bc := _boton(str(c[1]), func(): _elegir_cat(cid), 44.0, 15)
		bc.custom_minimum_size = Vector2(0, 44)
		fila_cats.add_child(bc)
		b_cats[cid] = bc
	scroll = ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0, 150)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	v_cat.add_child(scroll)
	lista = VBoxContainer.new()
	lista.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lista.add_theme_constant_override("separation", 6)
	scroll.add_child(lista)
	# vista de colocar
	v_col = VBoxContainer.new()
	v_col.add_theme_constant_override("separation", 6)
	vb.add_child(v_col)
	lbl_col_d = Label.new()
	lbl_col_d.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl_col_d.add_theme_font_size_override("font_size", 14)
	lbl_col_d.add_theme_color_override("font_color", Color(0.75, 0.78, 0.85))
	v_col.add_child(lbl_col_d)
	lbl_col_e = Label.new()
	lbl_col_e.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl_col_e.add_theme_font_size_override("font_size", 16)
	v_col.add_child(lbl_col_e)
	var fb := HBoxContainer.new()
	fb.add_theme_constant_override("separation", 6)
	v_col.add_child(fb)
	b_girar = _boton("Girar", girar_fantasma, 54.0)
	b_colocar = _boton("Colocar", colocar, 54.0)
	b_cancelar = _boton("Cancelar", cancelar, 54.0)
	b_colocar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b_colocar.size_flags_stretch_ratio = 1.6
	b_girar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b_cancelar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fb.add_child(b_girar)
	fb.add_child(b_colocar)
	fb.add_child(b_cancelar)
	# vista de un mueble ya colocado
	v_obj = VBoxContainer.new()
	v_obj.add_theme_constant_override("separation", 6)
	vb.add_child(v_obj)
	lbl_obj = Label.new()
	lbl_obj.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl_obj.add_theme_font_size_override("font_size", 14)
	lbl_obj.add_theme_color_override("font_color", Color(0.75, 0.78, 0.85))
	v_obj.add_child(lbl_obj)
	var fo := HBoxContainer.new()
	fo.add_theme_constant_override("separation", 6)
	v_obj.add_child(fo)
	b_mover = _boton("Mover", mover_sel, 54.0)
	b_girar_o = _boton("Girar", girar_sel, 54.0)
	b_mover.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b_girar_o.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fo.add_child(b_mover)
	fo.add_child(b_girar_o)
	b_vender = _boton("Vender", vender_sel, 54.0)
	v_obj.add_child(b_vender)
	b_cerrar_o = _boton("Volver al catálogo", _ir_catalogo, 46.0)
	v_obj.add_child(b_cerrar_o)

func _elegir_cat(cid: String) -> void:
	cat_act = cid
	_refrescar_ui()

func _lista() -> void:
	for c in lista.get_children():
		c.queue_free()
		lista.remove_child(c)
	b_items.clear()
	for k in tipos_ofrecidos(cat_act):
		var p := precio(k)
		var b := _boton("%s · %s" % [nombre(k), jg._eur(p)], func(): _pulsar_item(k), 48.0)
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.mouse_filter = Control.MOUSE_FILTER_PASS
		if p > jg.dinero:
			b.add_theme_color_override("font_color", Color(0.55, 0.55, 0.58))
			b.modulate = Color(1, 1, 1, 0.55)
		lista.add_child(b)
		b_items[k] = b

func _pulsar_item(k: String) -> void:
	if precio(k) > jg.dinero:
		jg._aviso("No te llega el dinero para %s." % nombre(k).to_lower())
		return
	elegir(k)

func _refrescar_ui() -> void:
	if panel == null:
		return
	panel.visible = activo
	if not activo:
		return
	v_cat.visible = est == "catalogo"
	v_col.visible = est == "colocando"
	v_obj.visible = est == "objeto"
	b_salir.visible = est == "catalogo"
	if est == "catalogo":
		lbl_cab.text = "Muebles · %s" % jg._eur(jg.dinero)
		if cat_act == "" or not b_cats.has(cat_act):
			cat_act = b_cats.keys()[0] if not b_cats.is_empty() else ""
		for k in b_cats:
			(b_cats[k] as Button).modulate = Color(1, 1, 1, 1) if k == cat_act else Color(1, 1, 1, 0.6)
		_lista()
	elif est == "colocando":
		var nuevo := mover_id == ""
		lbl_cab.text = "%s · %s" % [nombre(tipo_sel), jg._eur(precio(tipo_sel))] if nuevo else "Mover: %s" % nombre(tipo_sel)
		lbl_col_d.text = str(cat.get(tipo_sel, {}).get("d", ""))
		lbl_col_d.visible = lbl_col_d.text != "" and nuevo
		lbl_col_e.text = "Cabe. Toca el suelo para moverlo." if fvalido else fmotivo
		lbl_col_e.add_theme_color_override("font_color", Color(0.6, 0.95, 0.65) if fvalido else Color(1.0, 0.6, 0.55))
		b_colocar.text = ("Colocar (%s)" % jg._eur(precio(tipo_sel))) if nuevo else "Colocar aquí"
		b_colocar.modulate = Color(1, 1, 1, 1) if fvalido else Color(1, 1, 1, 0.55)
	elif est == "objeto":
		var o := objeto_sel
		lbl_cab.text = nombre(o.tipo)
		lbl_obj.text = str(cat.get(o.tipo, {}).get("d", ""))
		lbl_obj.visible = lbl_obj.text != ""
		b_vender.text = "Vender (%s)" % jg._eur(valor_venta(o))
	panel.offset_top = panel.offset_bottom

# =============== órdenes de prueba ===============
func _rc(c: Control) -> String:
	if c == null or not c.is_visible_in_tree():
		return "-"
	var r := c.get_global_rect()
	var ctr := r.get_center()
	return "%d,%d,%d,%d" % [int(ctr.x), int(ctr.y), int(r.size.x), int(r.size.y)]

func cmd(c: String, a: Array) -> bool:
	match c:
		"muebles":
			if activo:
				salir()
			elif not entrar():
				print("muebles: no (fuera del piso)")
				return true
			print("muebles: modo=%s" % ("on" if activo else "off"))
		"comprar":
			var m := comprar(str(a[1]), Vector2(float(a[2]), float(a[3])), float(a[4]) if a.size() > 4 else 0.0)
			print("comprar: ok" if m == "" else "comprar: no " + m)
			if m == "" and activo:
				_ir_catalogo()
		"vender":
			var d0: float = jg.dinero
			var m := vender(str(a[1]))
			print("vender: ok +%s" % str(jg.dinero - d0) if m == "" else "vender: no " + m)
			if m == "" and activo:
				_ir_catalogo()
		"mover":
			var m := mover(str(a[1]), Vector2(float(a[2]), float(a[3])), float(a[4]) if a.size() > 4 else 0.0)
			print("mover: ok" if m == "" else "mover: no " + m)
		"lista_muebles":
			var t: Array = []
			if it != null:
				for o in it.objetos:
					var pl := it.mundo_a_local(o.pos)
					t.append("%s:%s@%s,%s/%d" % [o.id, o.tipo, str(snappedf(pl.x, 0.01)), str(snappedf(pl.y, 0.01)), int(o.giro)])
			print("lista_muebles: %d %s" % [t.size(), " ".join(t)])
		"muebles_estado":
			print("muebles_estado: activo=%s est=%s tipo=%s fpos=%s,%s giro=%d valido=%s motivo=%s ofrecidos=%s" % [str(activo), est, tipo_sel, str(fpos.x), str(fpos.y), int(fgiro), str(fvalido), fmotivo, ",".join(tipos_ofrecidos())])
		"muebles_ui":
			# centros y tamaños en pantalla de los botones (x,y,ancho,alto), para las pruebas de toque real
			var t: Array = ["boton=" + _rc(btn), "panel=" + (_rc(panel) if panel.visible else "-"), "salir=" + _rc(b_salir), "girar=" + _rc(b_girar), "colocar=" + _rc(b_colocar), "cancelar=" + _rc(b_cancelar), "mover=" + _rc(b_mover), "vender=" + _rc(b_vender), "girar_o=" + _rc(b_girar_o), "scroll=" + _rc(scroll)]
			t.append("scroll_v=%d" % int(scroll.scroll_vertical))
			for k in b_cats:
				t.append("cat_%s=%s" % [k, _rc(b_cats[k])])
			for k in b_items:
				t.append("item_%s=%s" % [k, _rc(b_items[k])])
			print("muebles_ui: " + " ".join(t))
		"dinero":
			jg.dinero = float(a[1])
			jg._hud()
			print("dinero: %s" % str(jg.dinero))
		"ruta":
			# camino andando entre dos puntos del piso (coordenadas del piso): nº de puntos y largo en metros
			var ra: Array = jg.nav.camino(it.local_a_mundo(Vector2(float(a[1]), float(a[2]))), it.local_a_mundo(Vector2(float(a[3]), float(a[4]))))
			var largo := 0.0
			for i in range(1, ra.size()):
				largo += (ra[i] as Vector2).distance_to(ra[i - 1])
			print("ruta: n=%d largo=%.2f" % [ra.size(), largo])
		"suelo_pant":
			# dónde cae en pantalla un punto del piso (coordenadas del piso)
			var pm := it.local_a_mundo(Vector2(float(a[1]), float(a[2])))
			var sp: Vector2 = jg.camara.unproject_position(Vector3(pm.x, 0.1, pm.y))
			print("suelo_pant: %d,%d" % [int(sp.x), int(sp.y)])
		"mueble_pant":
			var sp := Vector2(-1, -1)
			if it != null and it.por_id.has(str(a[1])):
				var o: Objeto = it.por_id[str(a[1])]
				sp = jg.camara.unproject_position(Vector3(o.pos.x, o.alto * 0.5, o.pos.y))
			print("mueble_pant: %d,%d" % [int(sp.x), int(sp.y)])
		_:
			return false
	return true
