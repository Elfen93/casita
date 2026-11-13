extends Node3D
# Casita 3D · GD-2: La Ribera a escala humana (1 unidad = 1 m), con movimiento libre, interiores y objetos con acciones.
# Todo se construye desde código a partir de los datos (ciudad, lugares, barrio, personas, reglas, interiores).
# Medidas y reloj al andar: scripts/escala.gd. Caminos: scripts/nav.gd. Figuras: scripts/figura.gd.

const BARRIO := "ribera"
const MIN_POR_SEG := 1.5          # un día = 16 min reales a 1× (1440 / 960)
const VEL_SALTO := 480.0          # minutos de juego por segundo mientras pasa el tiempo (dormir, etc.)
const DIAS := ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const PRECIO_SUPER := 12
# solares vacíos del barrio (en unidades del dato): pisables, con algo de chatarra; el primero lleva valla con la entrada por el sur y el este
const SOLARES := [[8, 55, 24, 63.5], [96, 8, 114, 26]]

# ---- datos ----
var ciudad: Dictionary
var lugares: Dictionary
var barrio_edif: Dictionary
var personas: Dictionary
var reglas: Dictionary
var B: Dictionary           # el barrio
var nav: Nav
var est: Lote
var edificios := {}         # id -> {id,n,e,rb(Rect2 m),h,aabb,puerta(Vector2 m),d,abre,etq,propio}
var vecinos: Array = []

# ---- escena ----
var fuente: Font
var camara: Camera3D
var pivote: Node3D
var sol: DirectionalLight3D
var entorno: Environment
var cielo_mat: ProceduralSkyMaterial
var jugador: Actor
var jugador_etq: Label3D
var marca: MeshInstance3D
const DIST_CALLE := 18.0     # zoom por defecto en la calle: una persona mide ~30-35 px de alto en 420x860
const DIST_INTERIOR := 13.0
var rot_pers: Array = []     # rótulos de nombre de las personas (crecen con la distancia para leerse)
var dist := DIST_CALLE
var inclin := deg_to_rad(52.0)
var guiada := 0.0
var seguir := true
var con_raton := false          # se ha usado ratón de verdad (ordenador)
var cam_libre := false          # cámara libre: no vuelve al personaje al mandarle andar
var btn_camara: Button
var etq_interior: Label3D        # rótulo del local con interior: se apaga al entrar
var etiquetas: Array = []   # Label3D de edificios (escala con el zoom)
var ult_dist := -1.0
var pend_rutas: Array = []  # rutas de vecinos por calcular (una por fotograma)
var min_andados := 0.0
var m_andados := 0.0

# ---- estado de juego ----
var minutos := 9.0 * 60.0
var vel_juego := 1
var dinero := 1000.0
var nec := {"hambre": 85.0, "energia": 80.0, "diversion": 70.0, "social": 60.0, "vejiga": 75.0, "higiene": 80.0}
var nec_tasa := {"hambre": 0.075, "energia": 0.055, "diversion": 0.06, "social": 0.04, "vejiga": 0.09, "higiene": 0.045}
var hab := {"cocteleria": 0.0}
var trabaja_bar := false     # PROVISIONAL: interruptor de prueba hasta que exista el sistema de trabajo en Godot
var interiores: Dictionary
var tipos_obj: Dictionary
var interior: Interior
var bar: BarCtl
var cola: Cola
var en_interior := false
var cola_hb: HBoxContainer
var btn_trabajo: Button
var cola_txt := ""
var nombre_pj := "Ana"
var dentro := false
var destino := ""
var salto_rest := 0.0
var salto_efecto := Callable()
var vec_acum := 0.0
var fps_t := 0.0
var calle: Calle
var _noche_f := -1.0
var noche := 0.0            # 0 de día .. 1 de noche cerrada
var k_sol := 0.55
var k_amb := 0.32

# ---- UI ----
var ui: Control
var lbl_nombre: Label
var lbl_dinero: Label
var lbl_hora: Label
var btn_v1: Button
var btn_v5: Button
var barras := {}
var panel_arriba: Control
var panel_abajo: Control
var panel_ficha: PanelContainer
var ficha_titulo: Label
var ficha_texto: Label
var ficha_botones: VBoxContainer
var toast: Label
var toast_t := 0.0
var velo: ColorRect
var velo_txt: Label
var js_cb = null

# ---- toques ----
var toques := {}
var toque_ini := {}
var gesto_max := 0
var mov_total := 0.0
var t_ini := 0
var d_pinza := 0.0

func _ready() -> void:
	ciudad = Datos.cargar("ciudad")
	lugares = Datos.cargar("lugares")
	barrio_edif = Datos.cargar("barrio")
	personas = Datos.cargar("personas")
	reglas = Datos.cargar("reglas")
	interiores = Datos.cargar("interiores")
	tipos_obj = interiores["tipos"]
	Acciones.cargar(interiores)
	B = ciudad["barrios"][BARRIO]
	nombre_pj = str(personas.get("personaje_base", {}).get("name", "Ana"))
	for n in reglas.get("necesidades", []):
		if nec_tasa.has(n[0]):
			nec_tasa[n[0]] = float(n[3])
	dinero = float(reglas.get("dificultades", {}).get("normal", {}).get("money", 1000))
	_fuentes()
	_entorno()
	cola = Cola.new(self)
	_mundo()
	_jugador()
	_camara()
	_ui()
	_vecinos()
	_actualizar_vecinos(true)
	_hud()
	_sol()
	if OS.has_feature("web"):
		_puente_js()
	print("Casita 3D listo: %d edificios, %d vecinos" % [edificios.size(), vecinos.size()])

# =============== fuentes y entorno ===============
func _fuentes() -> void:
	var emo: FontFile = load("res://fonts/emoji.ttf")
	var fv := FontVariation.new()
	fv.base_font = ThemeDB.fallback_font
	fv.fallbacks = [emo]
	fuente = fv

func _entorno() -> void:
	entorno = Environment.new()
	entorno.background_mode = Environment.BG_SKY
	var sk := Sky.new()
	cielo_mat = ProceduralSkyMaterial.new()
	sk.sky_material = cielo_mat
	entorno.sky = sk
	entorno.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	entorno.ambient_light_color = Color(0.82, 0.82, 0.86)
	entorno.ambient_light_energy = 0.9
	entorno.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	entorno.tonemap_exposure = 0.72
	entorno.fog_enabled = true
	entorno.fog_density = 0.0006
	var we := WorldEnvironment.new()
	we.environment = entorno
	add_child(we)
	sol = DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
	sol.directional_shadow_max_distance = 80.0
	sol.shadow_bias = 0.05
	sol.shadow_normal_bias = 1.2
	add_child(sol)

func _sol() -> void:
	var h := fposmod(minutos / 60.0, 24.0)
	var s := sin((h - 6.0) / 12.0 * PI)         # >0 de día
	var dia := clampf(s * 2.2, 0.0, 1.0)
	var elev := lerpf(14.0, 62.0, clampf(s, 0.0, 1.0))
	sol.rotation_degrees = Vector3(-elev, 38.0, 0.0)
	sol.light_energy = lerpf(0.1, k_sol, dia)
	var calido := Color(1.0, 0.95, 0.85).lerp(Color(1.0, 0.62, 0.4), clampf(1.0 - s * 2.5, 0.0, 1.0) * dia)
	sol.light_color = Color(0.45, 0.55, 0.9).lerp(calido, dia)
	entorno.ambient_light_energy = lerpf(0.3, k_amb, dia)
	var cima := Color(0.02, 0.03, 0.09).lerp(Color(0.33, 0.55, 0.86), dia)
	var hor := Color(0.07, 0.09, 0.17).lerp(Color(0.78, 0.87, 0.95), dia)
	cielo_mat.sky_top_color = cima
	cielo_mat.sky_horizon_color = hor
	cielo_mat.ground_horizon_color = hor
	cielo_mat.ground_bottom_color = hor.darkened(0.3)
	entorno.fog_light_color = hor
	noche = 1.0 - dia
	calle.noche(noche, camara.global_position if camara != null else Vector3.ZERO)
	if absf(noche - _noche_f) > 0.02:
		_noche_f = noche
		Fachada.set_noche(clampf(noche * 1.6 - 0.25, 0.0, 1.0))
	if interior != null:
		interior.set_noche(noche)

# =============== el mundo ===============
func _mat(c: Color, rug := 0.9) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = rug
	return m

func mat_barra(c: Color, prio: int) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.no_depth_test = true
	m.render_priority = 6 + prio
	return m

func _caja(pos: Vector3, tam: Vector3, mat: Material, sombra := true) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.material_override = mat
	mi.position = pos
	if not sombra:
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)
	return mi

func _cil(pos: Vector3, r: float, h: float, mat: Material, seg := 14) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = r
	cm.bottom_radius = r
	cm.height = h
	cm.radial_segments = seg
	cm.rings = 1
	mi.mesh = cm
	mi.material_override = mat
	mi.position = pos
	add_child(mi)
	return mi

func etiqueta(texto: String, pos: Vector3, tam: int, col: Color, ancho := 0.0) -> Label3D:
	var l := Label3D.new()
	l.text = texto
	l.font = fuente
	l.font_size = tam
	l.pixel_size = 0.02
	l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	l.no_depth_test = true
	l.modulate = col
	l.outline_modulate = Color(0.05, 0.07, 0.1, 0.95)
	l.outline_size = 14
	l.render_priority = 5
	l.outline_render_priority = 4
	if ancho > 0.0:
		l.width = ancho
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.position = pos
	add_child(l)
	return l

func _calle_rect(c: Dictionary, ancho: float) -> Rect2:
	var a := Escala.v2(c["a"])
	var b := Escala.v2(c["b"])
	if Grafo_hor(c):
		return Rect2(minf(a.x, b.x), a.y - ancho * 0.5, absf(b.x - a.x), ancho)
	return Rect2(a.x - ancho * 0.5, minf(a.y, b.y), ancho, absf(b.y - a.y))

func Grafo_hor(c: Dictionary) -> bool:
	return c["a"][1] == c["b"][1]

func _mundo() -> void:
	nav = Nav.new()
	est = Lote.new()
	calle = Calle.new(self)
	# suelo que continúa más allá del barrio
	var hz := _caja(Vector3(180, -0.5, 150), Vector3(8000, 1.0, 8000), _mat(Color(0.38, 0.52, 0.33)), false)
	hz.name = "Hierba"
	var calles: Array = B["calles"]
	for c in calles:
		nav.tipo_rect(_calle_rect(c, Escala.CALLE + 2.0 * Escala.ACERA), Nav.T_ACERA)
	for c in calles:
		nav.tipo_rect(_calle_rect(c, Escala.CALLE), Nav.T_CALZADA)
	var cruces: Array = []
	for h in calles:
		if not Grafo_hor(h):
			continue
		for v in calles:
			if Grafo_hor(v):
				continue
			var p := Vector2(Escala.m(float(v["a"][0])), Escala.m(float(h["a"][1])))
			var hr := _calle_rect(h, 0.1)
			var vr := _calle_rect(v, 0.1)
			if p.x >= hr.position.x - 0.01 and p.x <= hr.end.x + 0.01 and p.y >= vr.position.y - 0.01 and p.y <= vr.end.y + 0.01:
				cruces.append([p, hr, vr])
	for q in cruces:
		_cebras(q[0], q[1], q[2])
	_marcas_calle(calles)
	_parque()
	_solares()
	_arbolado(calles, cruces)
	_edificios()
	calle.construir()
	_pintar_suelos()
	_lejos()
	var mi := MeshInstance3D.new()
	mi.mesh = est.malla()
	mi.name = "MundoEstatico"
	add_child(mi)

func _cebras(p: Vector2, hr: Rect2, vr: Rect2) -> void:
	var blanco := Color(0.88, 0.88, 0.84)
	var mitad := Escala.CALLE * 0.5
	var arms := []
	if hr.end.x >= p.x + 9.0:
		arms.append(Rect2(p.x + mitad + 0.6, p.y - mitad, 2.4, Escala.CALLE))
	if hr.position.x <= p.x - 9.0:
		arms.append(Rect2(p.x - mitad - 3.0, p.y - mitad, 2.4, Escala.CALLE))
	if vr.end.y >= p.y + 9.0:
		arms.append(Rect2(p.x - mitad, p.y + mitad + 0.6, Escala.CALLE, 2.4))
	if vr.position.y <= p.y - 9.0:
		arms.append(Rect2(p.x - mitad, p.y - mitad - 3.0, Escala.CALLE, 2.4))
	for r in arms:
		nav.tipo_rect(r, Nav.T_CEBRA)
		var horiz: bool = r.size.x < r.size.y   # franjas paralelas al tráfico
		var n := 8
		for i in n:
			if horiz:
				est.caja(Vector3(r.get_center().x, 0.035, r.position.y + 0.5 + float(i)), Vector3(2.4, 0.02, 0.5), blanco)
			else:
				est.caja(Vector3(r.position.x + 0.5 + float(i), 0.035, r.get_center().y), Vector3(0.5, 0.02, 2.4), blanco)

func _marcas_calle(calles: Array) -> void:
	var amar := Color(0.85, 0.8, 0.55)
	for c in calles:
		var r := _calle_rect(c, 0.2)
		var hor := Grafo_hor(c)
		var largo := r.size.x if hor else r.size.y
		var n := int(largo / 7.0)
		for i in n:
			var t := (float(i) + 0.5) / float(n)
			var p := r.get_center() if false else Vector2(r.position.x + (r.size.x * t if hor else 0.1), r.position.y + (0.1 if hor else r.size.y * t))
			if nav.tipo_en(p) == Nav.T_CEBRA:
				continue
			est.caja(Vector3(p.x, 0.035, p.y), Vector3(2.6, 0.02, 0.18) if hor else Vector3(0.18, 0.02, 2.6), amar)
		# rótulo de la calle, tendido en el suelo
		var k := maxi(1, int(round(largo / 70.0)))
		for i in k:
			var t2 := (float(i) + 0.5) / float(k)
			var p2 := Vector2(r.position.x + (r.size.x * t2 if hor else 0.1), r.position.y + (0.1 if hor else r.size.y * t2))
			var l := Label3D.new()
			l.text = str(c["n"])
			l.font = fuente
			l.font_size = 64
			l.pixel_size = 0.03
			l.modulate = Color(0.95, 0.93, 0.8)
			l.outline_size = 0
			l.shaded = false
			l.double_sided = false
			l.position = Vector3(p2.x, 0.06, p2.y + (1.9 if hor else 0.0))
			l.rotation_degrees = Vector3(-90, 0 if hor else 90, 0)
			add_child(l)

func _arbol_lote(p: Vector2, e: float, _ver: float) -> void:
	calle.poner("arbol", Vector3(p.x, 0, p.y), fposmod(p.x * 7.3 + p.y * 3.1, TAU), e)
	nav.solido_rect(Rect2(p.x - 0.2, p.y - 0.2, 0.4, 0.4), true)

func _arbolado(calles: Array, cruces: Array) -> void:
	var rr := RandomNumberGenerator.new()
	rr.seed = 11
	for c in calles:
		var r := _calle_rect(c, 0.2)
		var hor := Grafo_hor(c)
		var largo := r.size.x if hor else r.size.y
		var off := Escala.CALLE * 0.5 + Escala.ACERA + 0.9
		var s := 8.0
		while s < largo - 6.0:
			for lado in [-1.0, 1.0]:
				var p := Vector2(r.position.x + (s if hor else 0.1) + (0.0 if hor else lado * off), r.position.y + (0.1 if hor else s) + (lado * off if hor else 0.0))
				var cerca := false
				for q in cruces:
					if absf(p.x - q[0].x) < 12.0 and absf(p.y - q[0].y) < 12.0:
						cerca = true
				if cerca or rr.randf() < 0.35:
					continue
				_arbol_lote(p, rr.randf_range(0.85, 1.15), rr.randf())
			s += 14.0
		# farolas, bancos y papeleras en la acera (junto a la calzada)
		var s3 := 12.0
		var k3 := 0
		while s3 < largo - 8.0:
			var lado3 := -1.0 if k3 % 2 == 0 else 1.0
			var d3 := Escala.CALLE * 0.5 + 1.3
			var pp := Vector2(r.position.x + (s3 if hor else 0.1) + (0.0 if hor else lado3 * d3), r.position.y + (0.1 if hor else s3) + (lado3 * d3 if hor else 0.0))
			var cerca3 := false
			for q in cruces:
				if absf(pp.x - q[0].x) < 11.0 and absf(pp.y - q[0].y) < 11.0:
					cerca3 = true
			if not cerca3:
				var giro3 := (0.0 if lado3 < 0.0 else PI) if hor else (PI * 0.5 if lado3 < 0.0 else -PI * 0.5)
				calle.poner("farola", Vector3(pp.x, 0, pp.y), giro3)
				nav.solido_rect(Rect2(pp.x - 0.25, pp.y - 0.25, 0.5, 0.5), true)
				if k3 % 3 == 1:
					var pb := pp + (Vector2(5.0, 0) if hor else Vector2(0, 5.0))
					calle.poner("banco", Vector3(pb.x, 0, pb.y), giro3 + PI)
					nav.solido_rect(Rect2(pb.x - (0.95 if hor else 0.4), pb.y - (0.4 if hor else 0.95), 1.9 if hor else 0.8, 0.8 if hor else 1.9), true)
				elif k3 % 3 == 2:
					var pq := pp + (Vector2(-4.0, 0) if hor else Vector2(0, -4.0))
					calle.poner("papelera", Vector3(pq.x, 0, pq.y))
					nav.solido_rect(Rect2(pq.x - 0.25, pq.y - 0.25, 0.5, 0.5), true)
			s3 += 22.0
			k3 += 1
		# coches aparcados en línea, en el borde de la calzada
		var s2 := 20.0
		while s2 < largo - 14.0:
			var lado2 := -1.0 if rr.randf() < 0.5 else 1.0
			var p2 := Vector2(r.position.x + (s2 if hor else 0.1) + (0.0 if hor else lado2 * 2.9), r.position.y + (0.1 if hor else s2) + (lado2 * 2.9 if hor else 0.0))
			var cerca2 := false
			for q in cruces:
				if absf(p2.x - q[0].x) < 16.0 and absf(p2.y - q[0].y) < 16.0:
					cerca2 = true
			if not cerca2 and rr.randf() < 0.5:
				var col := Color.from_hsv(rr.randf(), 0.5, 0.75)
				var tam := Vector3(4.2, 1.1, 1.8) if hor else Vector3(1.8, 1.1, 4.2)
				est.caja(Vector3(p2.x, 0.65, p2.y), tam, col)
				est.caja(Vector3(p2.x, 1.35, p2.y), tam * Vector3(0.55 if hor else 0.9, 0.5, 0.9 if hor else 0.55), col.darkened(0.25))
				nav.solido_rect(Rect2(p2.x - tam.x * 0.5, p2.y - tam.z * 0.5, tam.x, tam.z), true)
			s2 += 11.0

func _parque() -> void:
	var v: Dictionary = lugares["lugares"]["parque"]
	var r := Escala.rect(v["rb"]).grow_individual(15.0, 26.0, 15.0, 0.0)
	nav.tipo_rect(r, Nav.T_PARQUE)
	var c := r.get_center()
	nav.tipo_rect(Rect2(r.position.x, c.y - 1.1, r.size.x, 2.2), Nav.T_CAMINO)
	nav.tipo_rect(Rect2(c.x - 1.1, c.y, 2.2, r.end.y - c.y), Nav.T_CAMINO)
	# fuente
	var piedra := _mat(Color(0.7, 0.7, 0.68))
	_cil(Vector3(c.x, 0.3, c.y), 2.2, 0.6, piedra)
	var agua := _mat(Color(0.35, 0.65, 0.85), 0.2)
	_cil(Vector3(c.x, 0.55, c.y), 1.9, 0.12, agua)
	_cil(Vector3(c.x, 1.0, c.y), 0.25, 1.4, piedra, 8)
	nav.solido_rect(Rect2(c.x - 2.2, c.y - 2.2, 4.4, 4.4), true)
	# bancos a ambos lados del camino
	var mad := Color(0.55, 0.38, 0.22)
	var fer := Color(0.2, 0.2, 0.22)
	for dx in [-24.0, -12.0, 12.0, 24.0]:
		for lado in [-1.0, 1.0]:
			var bx: float = c.x + dx
			var bz: float = c.y + lado * 2.1
			calle.poner("banco", Vector3(bx, 0, bz), PI if lado < 0.0 else 0.0)
			nav.solido_rect(Rect2(bx - 0.9, bz - 0.3, 1.8, 0.6), true)
	# columpios
	var sx := c.x + 22.0
	var sz := c.y - 12.0
	for dx2 in [-1.9, 1.9]:
		est.caja(Vector3(sx + dx2, 1.25, sz), Vector3(0.18, 2.5, 0.18), fer)
		nav.solido_rect(Rect2(sx + dx2 - 0.3, sz - 0.3, 0.6, 0.6), true)
	est.caja(Vector3(sx, 2.45, sz), Vector3(4.0, 0.14, 0.14), fer)
	for dx3 in [-0.7, 0.7]:
		est.caja(Vector3(sx + dx3, 1.5, sz), Vector3(0.03, 1.9, 0.03), fer)
		est.caja(Vector3(sx + dx3, 0.55, sz), Vector3(0.45, 0.05, 0.22), Color(0.85, 0.3, 0.25))
	# árboles
	var rr := RandomNumberGenerator.new()
	rr.seed = 5
	var n := 0
	var intentos := 0
	while n < 22 and intentos < 200:
		intentos += 1
		var p := Vector2(rr.randf_range(r.position.x + 2.5, r.end.x - 2.5), rr.randf_range(r.position.y + 2.5, r.end.y - 2.5))
		if absf(p.y - c.y) < 4.0 or absf(p.x - c.x) < 4.0 or p.distance_to(Vector2(sx, sz)) < 6.0:
			continue
		_arbol_lote(p, rr.randf_range(0.9, 1.3), rr.randf())
		n += 1
	var pu := Vector2(c.x, r.end.y + 1.5)
	var etq := etiqueta("🌳 %s" % v["n"], Vector3(c.x, 6.0, c.y + 6.0), 44, Color(1, 1, 0.96), 330.0)
	etiquetas.append(etq)
	edificios["parque"] = {"id": "parque", "n": v["n"], "e": "🌳", "rb": r, "h": 0.5, "puerta": pu, "d": v.get("d", ""), "abre": null,
		"aabb": AABB(Vector3(r.position.x, 0, r.position.y), Vector3(r.size.x, 0.5, r.size.y)), "etq": etq}

func _solares() -> void:
	var rr := RandomNumberGenerator.new()
	rr.seed = 3
	var cuenta := 0
	for s in SOLARES:
		var r := Escala.rect(s)
		nav.tipo_rect(r, Nav.T_SOLAR)
		var val := Color(0.5, 0.42, 0.32)
		if cuenta == 0:
			# valla al norte y al oeste, abierta al sur y al este
			est.caja(Vector3(r.get_center().x, 0.55, r.position.y), Vector3(r.size.x, 1.1, 0.15), val)
			est.caja(Vector3(r.position.x, 0.55, r.get_center().y), Vector3(0.15, 1.1, r.size.y), val)
			nav.solido_rect(Rect2(r.position.x, r.position.y - 0.15, r.size.x, 0.3), true)
			nav.solido_rect(Rect2(r.position.x - 0.15, r.position.y, 0.3, r.size.y), true)
		for i in 5:
			var p := Vector2(rr.randf_range(r.position.x + 3, r.end.x - 3), rr.randf_range(r.position.y + 3, r.end.y - 3))
			var t := Vector3(rr.randf_range(1.0, 2.2), rr.randf_range(0.6, 1.4), rr.randf_range(1.0, 2.2))
			est.caja(Vector3(p.x, t.y * 0.5, p.y), t, Color.from_hsv(rr.randf(), 0.15, 0.55))
			nav.solido_rect(Rect2(p.x - t.x * 0.5, p.y - t.z * 0.5, t.x, t.z), true)
		var etq := etiqueta("Solar", Vector3(r.get_center().x, 3.0, r.get_center().y), 40, Color(0.95, 0.9, 0.8))
		etq.set_meta("sec", true)
		etiquetas.append(etq)
		cuenta += 1

func _pintar_suelos() -> void:
	var tops := {1: 0.15, 2: 0.02, 3: 0.02, 4: 0.04, 5: 0.05, 6: 0.03}
	var cols := {1: Color(0.64, 0.62, 0.58), 2: Color(0.27, 0.28, 0.31), 3: Color(0.27, 0.28, 0.31), 4: Color(0.34, 0.6, 0.29), 5: Color(0.78, 0.7, 0.52), 6: Color(0.56, 0.46, 0.34)}
	var activos := {}
	for i in range(nav.alto + 1):
		var runs := {}
		if i < nav.alto:
			var j := 0
			while j < nav.ancho:
				var t := nav.tipos[i * nav.ancho + j]
				if t == 0 or t == 7:
					j += 1
					continue
				var k := j
				while k + 1 < nav.ancho and nav.tipos[i * nav.ancho + k + 1] == t:
					k += 1
				runs["%d,%d,%d" % [t, j, k]] = true
				j = k + 1
		for key in activos.keys():
			if not runs.has(key):
				_emitir(key, activos[key], i, tops, cols)
				activos.erase(key)
		for key in runs:
			if not activos.has(key):
				activos[key] = i

func _emitir(key: String, fila0: int, fila_fin: int, tops: Dictionary, cols: Dictionary) -> void:
	var a := key.split(",")
	var t := int(a[0])
	var x0 := nav.org.x + float(int(a[1])) * Escala.CELDA
	var x1 := nav.org.x + float(int(a[2]) + 1) * Escala.CELDA
	var z0 := nav.org.y + float(fila0) * Escala.CELDA
	var z1 := nav.org.y + float(fila_fin) * Escala.CELDA
	var top: float = tops[t]
	est.caja(Vector3((x0 + x1) * 0.5, top - 0.25, (z0 + z1) * 0.5), Vector3(x1 - x0, top + 0.5, z1 - z0), cols[t])

# siluetas sencillas de los barrios vecinos (según ciudad.json), en una sola malla sin sombra
func _lejos() -> void:
	var lj := Lote.new()
	var pr: Array = B["plano"]
	var rr := RandomNumberGenerator.new()
	rr.seed = 21
	var porp := 60.0   # metros por unidad de plano (la Ribera mide 6 unidades = 360 m)
	for bid in ciudad["barrios"]:
		if bid == BARRIO:
			continue
		var bb: Dictionary = ciudad["barrios"][bid]
		var o := Vector2((float(bb["plano"][0]) - float(pr[0])) * porp, (float(bb["plano"][1]) - float(pr[1])) * porp)
		var base := Datos.color(bb.get("c", "#cccccc"))
		var gris := Color(0.55, 0.56, 0.6)
		for c in bb["calles"]:
			var a := Escala.v2(c["a"]) + o
			var b := Escala.v2(c["b"]) + o
			var hor: bool = c["a"][1] == c["b"][1]
			var largo := a.distance_to(b)
			var cen := (a + b) * 0.5
			lj.caja(Vector3(cen.x, 0.0, cen.y), Vector3(largo, 0.1, Escala.CALLE) if hor else Vector3(Escala.CALLE, 0.1, largo), Color(0.3, 0.31, 0.34))
			var s := 10.0
			while s < largo - 6.0:
				for lado in [-1.0, 1.0]:
					var dd: float = 22.0 + rr.randf() * 6.0
					var w := rr.randf_range(12.0, 20.0)
					var f := rr.randf_range(10.0, 16.0)
					var h := rr.randf_range(7.0, 22.0)
					var p := a.lerp(b, s / largo)
					p += (Vector2(0, lado * dd) if hor else Vector2(lado * dd, 0))
					lj.caja(Vector3(p.x, h * 0.5, p.y), Vector3(w, h, f), base.lerp(gris, 0.55 + rr.randf() * 0.25))
				s += rr.randf_range(20.0, 30.0)
		for id in lugares["lugares"]:
			var v: Dictionary = lugares["lugares"][id]
			if v.get("barrio", "") == bid and v.has("rb"):
				var r := Escala.rect(v["rb"])
				var h2 := clampf(float(v.get("h", 24)) * 0.35, 8.0, 40.0)
				lj.caja(Vector3(r.get_center().x + o.x, h2 * 0.5, r.get_center().y + o.y), Vector3(r.size.x, h2, r.size.y), Datos.color(v.get("c", "#cccccc")).lerp(gris, 0.4))
	var mi := MeshInstance3D.new()
	mi.mesh = lj.malla()
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mi.name = "BarriosVecinos"
	add_child(mi)

func _registrar(id: String, n: String, e: String, rb: Array, h: float, col: Color, techo: Variant, d: String, abre: Variant, propio: bool, tipo := "cubo") -> void:
	var r := Escala.rect(rb)
	if propio:
		r = _patio_casa(r)
	var altura := h
	var cx := r.get_center().x
	var cz := r.get_center().y
	var pu := Vector2(cx, r.end.y + 1.5)
	if B["puertas"].has(id):
		var q = B["puertas"][id]
		var px := clampf(Escala.m(float(q[0])), r.position.x + 1.5, r.end.x - 1.5)
		pu = Vector2(px, r.end.y + 1.5)
		est.caja(Vector3(px, 1.1, r.end.y), Vector3(1.8, 2.2, 0.25), Color(0.28, 0.2, 0.15))
	var cuerpo := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(r.size.x, altura, r.size.y)
	cuerpo.mesh = bm
	cuerpo.position = Vector3(cx, altura * 0.5, cz)
	cuerpo.rotation.y = PI    # el portal del sombreador mira a -Z; las puertas del dato dan al sur
	var col_f := col.lerp(Color(0.85, 0.78, 0.66), 0.35)
	cuerpo.material_override = Fachada.material(bm.size, col_f, 3.0 if altura > 6.0 else 3.4, float(absi(hash(id)) % 97), false, techo if techo is Color else Color(0.42, 0.34, 0.3))
	add_child(cuerpo)
	nav.solido_rect(r, true)
	if techo is Color:
		if tipo == "casa":
			var mi := MeshInstance3D.new()
			var pm := PrismMesh.new()
			pm.size = Vector3(r.size.x + 1.0, 3.2, r.size.y + 1.0)
			mi.mesh = pm
			mi.material_override = _mat(techo)
			mi.position = Vector3(cx, altura + 1.6, cz)
			add_child(mi)
			altura += 3.2
		else:
			est.caja(Vector3(cx, altura + 0.25, cz), Vector3(r.size.x + 0.8, 0.5, r.size.y + 0.8), techo)
			altura += 0.5
	var etq := etiqueta("%s %s" % [e, n], Vector3(cx, altura + 2.5, cz), 44, Color(1, 1, 0.96), 330.0)
	if propio:
		etq.modulate = Color(1.0, 0.92, 0.5)
	etq.set_meta("sec", (not propio) and (str(e) == "🏢" or str(e) == "🏠"))  # portales del censo: de lejos sobran
	etiquetas.append(etq)
	edificios[id] = {"id": id, "n": n, "e": e, "rb": r, "h": altura, "puerta": pu, "d": d, "abre": abre,
		"aabb": AABB(Vector3(r.position.x, 0, r.position.y), Vector3(r.size.x, altura, r.size.y)), "etq": etq}

# Tu casa (vivienda «viejo»): un piso en un bloque de 4 plantas con su portal, 14 x 10 m, pegado a la calle donde está la puerta
# del dato; el resto de la parcela (que a escala son 60 x 60 m) es patio: hierba con valla, árboles y un banco.
func _patio_casa(r: Rect2) -> Rect2:
	var px := clampf(Escala.m(float(B["puertas"]["casa"][0])), r.position.x + 7.0, r.end.x - 7.0)
	var blq := Rect2(px - 7.0, r.end.y - 10.0, 14.0, 10.0)
	nav.tipo_rect(r, Nav.T_SOLAR)
	var val := Color(0.5, 0.42, 0.32)
	est.caja(Vector3(r.get_center().x, 0.5, r.position.y), Vector3(r.size.x, 1.0, 0.15), val)
	est.caja(Vector3(r.position.x, 0.5, r.get_center().y - 5.0), Vector3(0.15, 1.0, r.size.y - 10.0), val)
	est.caja(Vector3(r.end.x, 0.5, r.get_center().y - 5.0), Vector3(0.15, 1.0, r.size.y - 10.0), val)
	nav.solido_rect(Rect2(r.position.x, r.position.y - 0.15, r.size.x, 0.3), true)
	nav.solido_rect(Rect2(r.position.x - 0.15, r.position.y, 0.3, r.size.y - 10.0), true)
	nav.solido_rect(Rect2(r.end.x - 0.15, r.position.y, 0.3, r.size.y - 10.0), true)
	for q in [Vector2(r.position.x + 5, r.position.y + 6), Vector2(r.end.x - 6, r.position.y + 9), Vector2(r.position.x + 7, r.get_center().y), Vector2(r.end.x - 8, r.get_center().y + 6), Vector2(r.get_center().x, r.position.y + 5)]:
		_arbol_lote(q, 1.0, 0.5)
	calle.poner("banco", Vector3(r.get_center().x + 6.0, 0, r.get_center().y), PI)
	nav.solido_rect(Rect2(r.get_center().x + 5.1, r.get_center().y - 0.4, 1.9, 0.8), true)
	return blq

func _id_con_interior(lugar: String) -> String:
	for k in interiores["interiores"]:
		if interiores["interiores"][k]["lugar"] == lugar:
			return k
	return ""

func _interior(id: String, v: Dictionary) -> void:
	var k := _id_con_interior(id)
	var parcela := Escala.rect(v["rb"])
	interior = Interior.construir(self, k, interiores["interiores"][k], tipos_obj, parcela)
	bar = BarCtl.new(self, interior)
	var r := interior.rect
	var etq := etiqueta("%s %s" % [v.get("e", "🏢"), v["n"]], Vector3(r.get_center().x, interior.alto + 2.5, r.position.y), 44, Color(1, 1, 0.96), 330.0)
	etq_interior = etq
	etiquetas.append(etq)
	edificios[id] = {"id": id, "n": v["n"], "e": v.get("e", "🏢"), "rb": r, "h": 0.5, "puerta": Vector2(interior.puerta.x, interior.puerta.y + 1.5), "d": v.get("d", ""), "abre": v.get("abre", null),
		"aabb": AABB(Vector3(r.position.x, 0, r.position.y), Vector3(r.size.x, 0.5, r.size.y)), "etq": etq}

func _edificios() -> void:
	var L: Dictionary = lugares["lugares"]
	for id in L:
		var v: Dictionary = L[id]
		if v.get("barrio", "") != BARRIO or not v.has("rb") or v.has("park"):
			continue
		if _id_con_interior(id) != "":
			_interior(id, v)
			continue
		var col := Datos.color(v.get("c", "#cccccc"))
		var techo = Datos.color(v["roof"]) if v.has("roof") else null
		_registrar(id, v["n"], v.get("e", "🏢"), v["rb"], clampf(float(v.get("h", 24)) * 0.2, 4.5, 12.0), col, techo, v.get("d", ""), v.get("abre", null), false)
	var SM: Dictionary = lugares.get("solo_mapa", {})
	for id in SM:
		var v: Dictionary = SM[id]
		if v.get("barrio", "") != BARRIO:
			continue
		_registrar(id, v["n"], v.get("e", "🏢"), v["rb"], clampf(float(v.get("h", 20)) * 0.2, 4.0, 10.0), Datos.color(v.get("c", "#cccccc")), null, v.get("d", ""), v.get("abre", null), false)
	var P: Dictionary = personas["edificios"]
	var BE: Dictionary = barrio_edif["edificios"]
	for id in BE:
		var v: Dictionary = BE[id]
		if v["barrio"] != BARRIO:
			continue
		var info: Dictionary = P[id]
		var casa: bool = info["tipo"] == "casa"
		var techo = Datos.color(v["roof"]) if v.has("roof") else Color(0.5, 0.42, 0.38)
		var alto := float(info["plantas"]) * 3.2 + (0.0 if casa else 0.5)
		_registrar(id, str(v["rotulo"]), "🏠" if casa else "🏢", v["rb"], alto, Datos.color(v["c"]), techo, str(info["d"]), null, false, "casa" if casa else "cubo")
	var C: Dictionary = B["casa"]
	_registrar("casa", "Tu casa", "🏠", C["casa"], 4 * 3.2, Color(0.93, 0.78, 0.55), Color(0.55, 0.5, 0.46), "Tu piso en La Ribera. Aquí duermes.", null, true, "cubo")
	for id in ["casaV", "casa2"]:
		var v: Dictionary = L[id]
		_registrar(id, v["n"], v.get("e", "🏠"), C[id], 5.0, Datos.color(v["c"]), Datos.color(v["roof"]), v.get("d", ""), null, false, "casa")

# =============== personajes ===============
func _jugador() -> void:
	var asp_j := Figura.aspecto_jugador(personas["personaje_base"])
	var f := Figura.crear(asp_j["camisa"], Color.WHITE, Figura.factor_edad(int(asp_j["edad"])), asp_j)
	jugador = Actor.new(f)
	add_child(jugador.nodo)
	jugador.poner(edificios["casa"]["puerta"])
	jugador_etq = etiqueta(nombre_pj, Vector3(0, 2.3, 0), 40, Color(1.0, 0.9, 0.35))
	jugador_etq.reparent(jugador.nodo, false)
	jugador_etq.position = Vector3(0, 2.3, 0)
	jugador_etq.pixel_size = 0.006
	rot_pers.append(jugador_etq)
	jugador_etq.position = Vector3(0, 2.15, 0)
	var aro := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = 0.55
	cm.bottom_radius = 0.55
	cm.height = 0.03
	aro.mesh = cm
	var m := _mat(Color(1.0, 0.85, 0.2))
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	aro.material_override = m
	aro.position.y = 0.2
	aro.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	jugador.nodo.add_child(aro)
	# indicador de destino en el suelo
	marca = MeshInstance3D.new()
	var tm := TorusMesh.new()
	tm.inner_radius = 0.35
	tm.outer_radius = 0.6
	tm.rings = 16
	tm.ring_segments = 6
	marca.mesh = tm
	var m2 := _mat(Color(1, 0.4, 0.3))
	m2.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	marca.material_override = m2
	marca.scale = Vector3(1, 0.15, 1)
	marca.visible = false
	marca.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(marca)

# =============== cámara ===============
func _camara() -> void:
	pivote = Node3D.new()
	add_child(pivote)
	camara = Camera3D.new()
	camara.keep_aspect = Camera3D.KEEP_WIDTH
	camara.fov = 46.0
	camara.near = 0.3
	camara.far = 4000.0
	pivote.add_child(camara)
	pivote.rotation.y = deg_to_rad(-24.0)
	pivote.position = jugador.nodo.position
	_poner_camara()

func _poner_camara() -> void:
	dist = clampf(dist, 7.0, 520.0)
	# lejos, la cámara baja para ver el horizonte
	inclin = lerpf(deg_to_rad(52.0), deg_to_rad(24.0), clampf((dist - 40.0) / 300.0, 0.0, 1.0))
	camara.position = Vector3(0, sin(inclin) * dist, cos(inclin) * dist)
	camara.look_at(pivote.global_position + Vector3(0, 0.9, 0), Vector3.UP)
	if absf(dist - ult_dist) > 0.5:
		ult_dist = dist
		# de cerca los rótulos mantienen su tamaño en pantalla; de lejos encogen y los secundarios se apagan, para que no se pisen
		var ps := clampf(dist * 0.0009, 0.012, 0.108)
		if dist > 120.0:
			ps = 0.108 * pow(dist / 120.0, 0.35)
		var ps_p := clampf(dist * 0.0007, 0.005, 0.03)
		for l in rot_pers:
			l.pixel_size = ps_p
		for l in etiquetas:
			l.pixel_size = ps
			l.visible = not (dist > 150.0 and l.has_meta("sec") and l.get_meta("sec")) and not (l.has_meta("sec_dentro") and l.get_meta("sec_dentro"))

# =============== UI ===============
func _estilo(col: Color, radio := 10) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = col
	s.set_corner_radius_all(radio)
	s.content_margin_left = 10
	s.content_margin_right = 10
	s.content_margin_top = 6
	s.content_margin_bottom = 6
	return s

func _ui() -> void:
	var capa := CanvasLayer.new()
	add_child(capa)
	ui = Control.new()
	ui.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var th := Theme.new()
	th.default_font = fuente
	th.default_font_size = 16
	ui.theme = th
	capa.add_child(ui)
	# --- barra de arriba ---
	var arriba := PanelContainer.new()
	arriba.add_theme_stylebox_override("panel", _estilo(Color(0.1, 0.14, 0.2, 0.86)))
	arriba.set_anchors_preset(Control.PRESET_TOP_WIDE)
	arriba.offset_left = 8
	arriba.offset_right = -8
	arriba.offset_top = 8
	ui.add_child(arriba)
	panel_arriba = arriba
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 4)
	arriba.add_child(vb)
	var f1 := HBoxContainer.new()
	vb.add_child(f1)
	lbl_nombre = Label.new()
	lbl_nombre.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_nombre.add_theme_font_size_override("font_size", 18)
	f1.add_child(lbl_nombre)
	lbl_dinero = Label.new()
	lbl_dinero.add_theme_font_size_override("font_size", 18)
	lbl_dinero.add_theme_color_override("font_color", Color(0.65, 0.95, 0.6))
	f1.add_child(lbl_dinero)
	var f2 := HBoxContainer.new()
	f2.add_theme_constant_override("separation", 6)
	vb.add_child(f2)
	lbl_hora = Label.new()
	lbl_hora.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_hora.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	f2.add_child(lbl_hora)
	var grupo := ButtonGroup.new()
	btn_v1 = _boton_vel("1×", 1, grupo)
	btn_v5 = _boton_vel("5×", 5, grupo)
	f2.add_child(btn_v1)
	f2.add_child(btn_v5)
	btn_v1.button_pressed = true
	# --- barras de necesidades, abajo ---
	var abajo := PanelContainer.new()
	abajo.add_theme_stylebox_override("panel", _estilo(Color(0.1, 0.14, 0.2, 0.86)))
	abajo.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	abajo.offset_left = 8
	abajo.offset_right = -8
	abajo.offset_bottom = -8
	abajo.offset_top = -74
	ui.add_child(abajo)
	panel_abajo = abajo
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 10)
	abajo.add_child(hb)
	for par in [["hambre", "🍔"], ["energia", "⚡"], ["diversion", "🎉"], ["social", "💬"], ["vejiga", "🚽"]]:
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hb.add_child(col)
		var l := Label.new()
		l.text = par[1]
		l.add_theme_font_size_override("font_size", 14)
		col.add_child(l)
		var pb := ProgressBar.new()
		pb.min_value = 0
		pb.max_value = 100
		pb.show_percentage = false
		pb.custom_minimum_size = Vector2(0, 14)
		pb.add_theme_stylebox_override("background", _estilo(Color(0.25, 0.28, 0.33), 6))
		col.add_child(pb)
		barras[par[0]] = pb
	# --- ficha / diálogo ---
	panel_ficha = PanelContainer.new()
	panel_ficha.add_theme_stylebox_override("panel", _estilo(Color(0.96, 0.94, 0.88, 0.97), 14))
	panel_ficha.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel_ficha.offset_left = 12
	panel_ficha.offset_right = -12
	panel_ficha.offset_bottom = -84
	panel_ficha.grow_vertical = Control.GROW_DIRECTION_BEGIN
	panel_ficha.visible = false
	ui.add_child(panel_ficha)
	var fv := VBoxContainer.new()
	fv.add_theme_constant_override("separation", 6)
	panel_ficha.add_child(fv)
	ficha_titulo = Label.new()
	ficha_titulo.add_theme_font_size_override("font_size", 22)
	ficha_titulo.add_theme_color_override("font_color", Color(0.15, 0.12, 0.1))
	ficha_titulo.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	fv.add_child(ficha_titulo)
	ficha_texto = Label.new()
	ficha_texto.add_theme_font_size_override("font_size", 16)
	ficha_texto.add_theme_color_override("font_color", Color(0.25, 0.22, 0.2))
	ficha_texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	fv.add_child(ficha_texto)
	ficha_botones = VBoxContainer.new()
	ficha_botones.add_theme_constant_override("separation", 6)
	fv.add_child(ficha_botones)
	# --- cola de acciones (arriba a la izquierda) y interruptor provisional ---
	cola_hb = HBoxContainer.new()
	cola_hb.set_anchors_preset(Control.PRESET_TOP_LEFT)
	cola_hb.offset_left = 8
	cola_hb.offset_top = 100
	cola_hb.add_theme_constant_override("separation", 4)
	ui.add_child(cola_hb)
	btn_trabajo = Button.new()
	btn_trabajo.set_anchors_preset(Control.PRESET_TOP_LEFT)
	btn_trabajo.offset_left = 8
	btn_trabajo.offset_top = 152
	btn_trabajo.add_theme_font_size_override("font_size", 13)
	btn_trabajo.pressed.connect(func(): trabaja_bar = not trabaja_bar)
	ui.add_child(btn_trabajo)
	# cámara: bloqueada (sigue al personaje) o libre (se queda donde la dejes)
	btn_camara = Button.new()
	btn_camara.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	btn_camara.offset_right = -8
	btn_camara.offset_left = -176
	btn_camara.offset_top = 96
	btn_camara.offset_bottom = 136
	btn_camara.add_theme_font_size_override("font_size", 15)
	btn_camara.pressed.connect(_alternar_camara)
	ui.add_child(btn_camara)
	_texto_camara()
	# --- aviso y velo ---
	toast = Label.new()
	toast.set_anchors_preset(Control.PRESET_CENTER_TOP)
	toast.offset_top = 196
	toast.offset_left = -190
	toast.offset_right = 190
	toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	toast.add_theme_stylebox_override("normal", _estilo(Color(0, 0, 0, 0.75), 12))
	toast.visible = false
	toast.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(toast)
	velo = ColorRect.new()
	velo.color = Color(0.02, 0.03, 0.08, 0.6)
	velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	velo.visible = false
	ui.add_child(velo)
	velo_txt = Label.new()
	velo_txt.set_anchors_preset(Control.PRESET_CENTER)
	velo_txt.offset_left = -150
	velo_txt.offset_right = 150
	velo_txt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	velo_txt.add_theme_font_size_override("font_size", 26)
	velo.add_child(velo_txt)

func _boton_vel(t: String, v: int, g: ButtonGroup) -> Button:
	var b := Button.new()
	b.text = t
	b.toggle_mode = true
	b.button_group = g
	b.custom_minimum_size = Vector2(56, 34)
	b.pressed.connect(func(): vel_juego = v)
	return b

func _hud() -> void:
	lbl_nombre.text = nombre_pj + ((" · 🍸 %.1f" % hab["cocteleria"]) if hab["cocteleria"] > 0.0 else "")
	btn_trabajo.text = "Trabajas en el bar (prueba): %s" % ("sí" if trabaja_bar else "no")
	_hud_cola()
	lbl_dinero.text = _eur(dinero)
	var dia := int(minutos / 1440.0)
	var h := int(fposmod(minutos, 1440.0) / 60.0)
	var m := int(fposmod(minutos, 60.0))
	lbl_hora.text = "%s · día %d · %02d:%02d" % [DIAS[dia % 7], dia + 1, h, m]
	for k in barras:
		var v: float = nec[k]
		var pb: ProgressBar = barras[k]
		pb.value = v
		var col := Color(0.4, 0.8, 0.45) if v > 40.0 else (Color(0.95, 0.75, 0.25) if v > 20.0 else Color(0.9, 0.3, 0.28))
		pb.add_theme_stylebox_override("fill", _estilo(col, 6))

func _hud_cola() -> void:
	var ic: Array = cola.lista_iconos()
	var t := "|".join(ic)
	if t == cola_txt:
		return
	cola_txt = t
	for c in cola_hb.get_children():
		c.queue_free()
	for i in ic.size():
		var b := Button.new()
		b.text = ic[i]
		b.custom_minimum_size = Vector2(46, 46)
		b.add_theme_font_size_override("font_size", 22)
		var k := i
		b.pressed.connect(func(): cola.cancelar(k))
		cola_hb.add_child(b)

func _eur(x: float) -> String:
	var ent := int(floor(absf(x)))
	var s := str(ent)
	var o := ""
	while s.length() > 3:
		o = "." + s.substr(s.length() - 3) + o
		s = s.substr(0, s.length() - 3)
	var cent := int(round((absf(x) - float(ent)) * 100.0))
	if cent >= 100:
		cent = 0
		o = o
	var dec := "" if cent == 0 else ",%02d" % cent
	return ("-" if x < 0.0 else "") + s + o + dec + " €"

func _aviso(t: String) -> void:
	toast.text = t
	toast.visible = true
	toast_t = 2.6

func _ficha(titulo: String, texto: String, botones: Array) -> void:
	ficha_titulo.text = titulo
	ficha_texto.text = texto
	ficha_texto.visible = texto != ""
	for c in ficha_botones.get_children():
		c.queue_free()
	for b in botones:
		var bt := Button.new()
		bt.text = b[0]
		bt.custom_minimum_size = Vector2(0, 46)
		bt.add_theme_font_size_override("font_size", 16)
		bt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		bt.pressed.connect(b[1])
		bt.disabled = b.size() > 2 and b[2]
		bt.alignment = HORIZONTAL_ALIGNMENT_LEFT
		ficha_botones.add_child(bt)
	var cerrar := Button.new()
	cerrar.text = "Cerrar"
	cerrar.custom_minimum_size = Vector2(0, 42)
	cerrar.pressed.connect(_cerrar_ficha)
	ficha_botones.add_child(cerrar)
	panel_ficha.offset_top = panel_ficha.offset_bottom
	panel_ficha.visible = true

func _cerrar_ficha() -> void:
	panel_ficha.visible = false
	if dentro:
		dentro = false
		jugador.nodo.visible = true

# =============== reloj y necesidades ===============
func _avanzar(dm: float) -> void:
	minutos += dm
	for k in nec:
		nec[k] = clampf(nec[k] - nec_tasa[k] * dm, 0.0, 100.0)
	vec_acum += dm
	if vec_acum >= 5.0:
		vec_acum = 0.0
		_actualizar_vecinos(salto_rest > 0.0)

func _tiene(arr: Array, d: int) -> bool:
	for x in arr:
		if int(x) == d:
			return true
	return false

func _hora_dec() -> float:
	return fposmod(minutos, 1440.0) / 60.0

func _dia_sem() -> int:
	return int(minutos / 1440.0) % 7

func _abierto(id: String) -> bool:
	var ab = edificios[id]["abre"]
	if ab == null:
		return true
	var h := _hora_dec()
	var d := _dia_sem()
	for t in ab:
		var dias: Array = t[2]
		if h >= float(t[0]) and h < float(t[1]) and _tiene(dias, d):
			return true
		if float(t[1]) > 24.0 and h + 24.0 < float(t[1]) and _tiene(dias, (d + 6) % 7):
			return true
	return false

func _horario_hoy(id: String) -> String:
	var ab = edificios[id]["abre"]
	if ab == null:
		return ""
	var d := _dia_sem()
	var partes: Array = []
	for t in ab:
		if _tiene(t[2], d):
			partes.append("%s a %s" % [_hhmm(float(t[0])), _hhmm(fposmod(float(t[1]), 24.0))])
	return "Hoy abre de " + " y de ".join(partes) + "." if partes.size() > 0 else "Hoy está cerrado."

func _hhmm(h: float) -> String:
	return "%d:%02d" % [int(h), int(round((h - floor(h)) * 60.0))]

# =============== andar ===============
func _ruta(desde: Vector2, hasta: Vector2) -> Array:
	return nav.camino(desde, hasta)

func _ir_a_punto(p: Vector2, id := "") -> void:
	_cerrar_ficha()
	cola.vaciar()
	destino = id
	var ruta := _ruta(jugador.pos2(), p)
	if ruta.is_empty():
		_aviso("No hay camino.")
		return
	jugador.fijar_ruta(ruta)
	if not cam_libre:
		seguir = true
	marca.visible = true
	marca.position = Vector3(p.x, 0.08, p.y)
	if ruta.size() == 1 and (ruta[0] as Vector2).distance_to(jugador.pos2()) < 0.05:
		jugador.ruta = []
		_llegar()

func _ir_a_edificio(id: String) -> void:
	_ir_a_punto(edificios[id]["puerta"], id)

func _llegar() -> void:
	marca.visible = false
	if destino == "":
		return
	var id := destino
	destino = ""
	var e: Dictionary = edificios[id]
	if id == "casa":
		dentro = true
		jugador.nodo.visible = false
		_ficha("🏠 Tu casa", "Tu piso de La Ribera. Hay una cama y una nevera casi vacía.", [
			["🛏️ Dormir 8 horas", func(): _accion_dormir(480.0)],
			["😴 Echar una siesta (1 h)", func(): _accion_dormir(60.0)]])
		return
	if e["abre"] != null and not _abierto(id):
		_aviso("%s está cerrado. %s" % [e["n"], _horario_hoy(id)])
		_ficha("%s %s" % [e["e"], e["n"]], "Cerrado ahora. %s" % _horario_hoy(id), [])
		return
	if id == "super":
		dentro = true
		jugador.nodo.visible = false
		_ficha("🛒 %s" % e["n"], "%s\nCompras algo de comer y lo despachas en un banco: %s, media hora." % [e["d"], _eur(PRECIO_SUPER)], [
			["🥖 Comprar y comer (%s)" % _eur(PRECIO_SUPER), _accion_super]])
		return
	var tx: String = e["d"]
	var hr := _horario_hoy(id)
	if hr != "":
		tx += "\n" + hr
	_ficha("%s %s" % [e["e"], e["n"]], tx, [])

func _accion_super() -> void:
	if dinero < PRECIO_SUPER:
		_aviso("No te llega el dinero.")
		return
	_cerrar_ficha_y_saltar(30.0, "Comprando y comiendo…", func():
		dinero -= PRECIO_SUPER
		nec["hambre"] = minf(100.0, nec["hambre"] + 45.0)
		_aviso("Has comido algo. Hambre arriba."))

func _accion_dormir(dm: float) -> void:
	_cerrar_ficha_y_saltar(dm, "Durmiendo…" if dm > 100.0 else "Siesta…", func():
		nec["energia"] = minf(100.0, nec["energia"] + 0.21 * dm)
		_aviso("Has dormido. Energía arriba."))

func _cerrar_ficha_y_saltar(dm: float, txt: String, efecto: Callable) -> void:
	panel_ficha.visible = false
	salto_rest = dm
	salto_efecto = efecto
	velo_txt.text = txt
	velo.visible = true

# =============== vecinos ===============
func _vecinos() -> void:
	var BE: Dictionary = barrio_edif["edificios"]
	var H: Dictionary = personas["hogares"]
	var del_barrio: Array = []
	var por_id := {}
	for v in personas["vecinos"]:
		por_id[v["id"]] = v
	for hid in H:
		var h: Dictionary = H[hid]
		if not BE.has(h.get("edificio", "")) or BE[h["edificio"]]["barrio"] != BARRIO:
			continue
		for mid in h.get("miembros", []):
			var v: Dictionary = por_id[mid]
			del_barrio.append({"v": v, "edif": h["edificio"]})
	var con_curro: Array = []
	var resto: Array = []
	var bar_gente: Array = []
	for x in del_barrio:
		var t = x["v"].get("trabajo", null)
		var en_bar := false
		for d in x["v"].get("donde", []):
			if d[0] == "bar":
				en_bar = true
		if en_bar or (t != null and t["lugar"] == "bar"):
			bar_gente.append(x)
		elif (t != null and B["puertas"].has(t["lugar"])) or (x["v"].get("estudia", null) == "cole"):
			con_curro.append(x)
		else:
			resto.append(x)
	var elegidos: Array = bar_gente.slice(0, 16)
	var paso := maxi(1, con_curro.size() / 10)
	var i := 0
	while i < con_curro.size() and elegidos.size() < 26:
		elegidos.append(con_curro[i])
		i += paso
	var j := 0
	var paso2 := maxi(1, resto.size() / 8)
	while j < resto.size() and elegidos.size() < 34:
		elegidos.append(resto[j])
		j += paso2
	for x in elegidos:
		var v: Dictionary = x["v"]
		var asp_v := Figura.aspecto_de(v)
		var c := Actor.new(Figura.crear(asp_v["camisa"], Color.WHITE, Figura.factor_edad(int(v["edad"])), asp_v))
		add_child(c.nodo)
		var alt_v := 1.7 * Figura.factor_edad(int(v["edad"]))
		var et := etiqueta(str(v["n"]), Vector3(0, alt_v + 0.4, 0), 34, Color(1, 1, 1))
		et.reparent(c.nodo, false)
		et.position = Vector3(0, alt_v + 0.4, 0)
		et.pixel_size = 0.0055
		rot_pers.append(et)
		et.pixel_size = clampf(dist * 0.0007, 0.005, 0.03)
		c.alto_cab = alt_v + 0.25
		vecinos.append({"v": v, "edif": x["edif"], "cam": c, "meta": "", "visible": false, "staff": false})

func _lugar_de(x: Dictionary) -> String:
	# dónde está esta persona ahora: id de un edificio del barrio, o "" si está fuera del barrio
	var v: Dictionary = x["v"]
	var h := _hora_dec()
	var d := _dia_sem()
	var t = v.get("trabajo", null)
	if t != null and t["lugar"] == "fuera":
		var th: Array = t["h"]
		if h >= float(th[0]) and h < float(th[1]) and _tiene(t["dias"], d):
			return ""
	var es = v.get("estudia", null)
	if d < 5 and es != null:
		if es == "cole" and h >= 9.0 and h < 14.0:
			return "colegio" if v.get("centro", "") == "colegio" else ("" if v.get("centro", "") != "" else "colegio")
		if es == "instituto" and h >= 8.5 and h < 14.5:
			return ""
	for t2 in v.get("donde", []):
		var dias: Array = t2[3]
		var hasta := float(t2[2])
		if (h >= float(t2[1]) and h < hasta and _tiene(dias, d)) or (hasta > 24.0 and h + 24.0 < hasta and _tiene(dias, (d + 6) % 7)):
			return t2[0] if B["puertas"].has(t2[0]) else ""
	return x["edif"]

func _actualizar_vecinos(salto: bool) -> void:
	for x in vecinos:
		var lug := _lugar_de(x)
		var c: Actor = x["cam"]
		var prev: String = x["meta"]
		if lug != "bar":
			x["bar_fuera"] = false
		if lug == x["meta"] and x["visible"] == (lug != ""):
			continue
		x["meta"] = lug
		if prev == "bar" and lug != "bar" and bar != null:
			bar.quitar(x)
			if lug == "" and not salto and x["visible"]:
				pend_rutas.append([x, bar.exterior(), true])
				continue
		if lug == "bar" and bar != null:
			bar.admitir(x, salto)
			continue
		if lug == "":
			c.nodo.visible = false
			c.ruta = []
			x["visible"] = false
			continue
		var p: Vector2 = edificios[lug]["puerta"] if edificios.has(lug) else Escala.v2(B["puertas"][lug])
		var off := Vector2(float(hash(x["v"]["id"]) % 7 - 3) * 0.6, float(hash(x["v"]["id"] + "z") % 4) * 0.5)
		if not x["visible"] or salto:
			c.poner(p + off)
			c.nodo.visible = true
			c.ruta = []
			x["visible"] = true
		else:
			pend_rutas.append([x, p + off])

func _calcular_rutas() -> void:
	if pend_rutas.is_empty():
		return
	var it: Array = pend_rutas.pop_front()
	var c: Actor = it[0]["cam"]
	c.fijar_ruta(_ruta(c.pos2(), it[1]), false)
	if it.size() > 2:
		it[0]["ocultar"] = true

# =============== entrada táctil ===============
func _en_ui(p: Vector2) -> bool:
	for c in [panel_arriba, panel_abajo, panel_ficha, btn_trabajo, cola_hb]:
		if c.visible and c.get_global_rect().has_point(p):
			return true
	return velo.visible

func _input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.pressed:
		if ev.button_index == MOUSE_BUTTON_WHEEL_UP:
			dist *= 0.9
			_poner_camara()
		elif ev.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			dist *= 1.1
			_poner_camara()
		elif ev.button_index == MOUSE_BUTTON_RIGHT and ev.device != InputEvent.DEVICE_ID_EMULATION:
			# ordenador: el botón derecho es solo para andar adonde se señala
			con_raton = true
			if not _en_ui(ev.position):
				_andar_a_pantalla(ev.position)
	elif ev is InputEventScreenTouch:
		if ev.pressed:
			if _en_ui(ev.position) and toques.is_empty():
				return
			if toques.is_empty():
				mov_total = 0.0
				gesto_max = 0
				t_ini = Time.get_ticks_msec()
			toques[ev.index] = ev.position
			toque_ini[ev.index] = ev.position
			gesto_max = maxi(gesto_max, toques.size())
			d_pinza = 0.0
		else:
			if not toques.has(ev.index):
				return
			var era_tap := gesto_max == 1 and mov_total < 14.0 and Time.get_ticks_msec() - t_ini < 1500
			toques.erase(ev.index)
			d_pinza = 0.0
			if toques.is_empty() and era_tap:
				# un toque que viene del ratón (ordenador) solo elige: personas, objetos, edificios. En el móvil el toque también manda andar.
				if ev.device == InputEvent.DEVICE_ID_EMULATION:
					con_raton = true
				_tap(ev.position, ev.device == InputEvent.DEVICE_ID_EMULATION)
			if toques.is_empty():
				gesto_max = 0
	elif ev is InputEventScreenDrag:
		if not toques.has(ev.index):
			return
		toques[ev.index] = ev.position
		mov_total += ev.relative.length()
		if toques.size() >= 2:
			var ks: Array = toques.keys()
			var d: float = (toques[ks[0]] - toques[ks[1]]).length()
			if d_pinza > 0.0 and d > 4.0:
				dist *= d_pinza / d
				_poner_camara()
			d_pinza = d
		elif toques.size() == 1 and mov_total >= 10.0 and cam_libre:
			seguir = false
			var vp := get_viewport().get_visible_rect().size
			var k := 2.0 * tan(deg_to_rad(camara.fov * 0.5)) * dist / vp.x
			var b := pivote.global_transform.basis
			pivote.position -= (b.x * ev.relative.x + b.z * ev.relative.y / sin(inclin)) * k
			pivote.position.x = clampf(pivote.position.x, -60.0, 120.0 * Escala.M_UNIDAD + 60.0)
			pivote.position.z = clampf(pivote.position.z, -60.0, 100.0 * Escala.M_UNIDAD + 60.0)

func _texto_camara() -> void:
	btn_camara.text = "Cámara: libre" if cam_libre else "Cámara: fija"

func _alternar_camara() -> void:
	cam_libre = not cam_libre
	seguir = not cam_libre
	_texto_camara()
	_aviso("Cámara libre: arrastra para mirar; no vuelve al personaje." if cam_libre else "Cámara fija: sigue al personaje.")

func _andar_a_pantalla(p: Vector2) -> void:
	if dentro or velo.visible:
		return
	if panel_ficha.visible:
		_cerrar_ficha()
	var g = Plane(Vector3.UP, 0.0).intersects_ray(camara.project_ray_origin(p), camara.project_ray_normal(p))
	if g != null:
		var q := Vector3(g)
		_ir_a_punto(Vector2(q.x, q.z))

func _tap(p: Vector2, solo_elegir := false) -> void:
	if panel_ficha.visible and not dentro:
		_cerrar_ficha()
		return
	if dentro or velo.visible:
		return
	var mejor := 44.0
	var quien: Dictionary = {}
	for x in vecinos:
		var c: Actor = x["cam"]
		if not c.nodo.visible:
			continue
		var sp := camara.unproject_position(c.nodo.global_position + Vector3(0, 0.9, 0))
		var d := sp.distance_to(p)
		if d < mejor:
			mejor = d
			quien = x
	var o := camara.project_ray_origin(p)
	var n := camara.project_ray_normal(p)
	if not quien.is_empty():
		if bar != null and bar.tiene(quien):
			for c in bar.clientes:
				if c["x"] == quien:
					_menu_objeto(c["obj"], quien)
					return
		_ficha_vecino(quien)
		return
	if interior != null and en_interior:
		var mejor_o: Objeto = null
		var mejor_v := 1e18
		var mejor_d := 1e18
		for ob in interior.objetos:
			if (ob.def.get("acciones", []) as Array).is_empty():
				continue
			var ab: AABB = ob.aabb()
			var rr = ab.intersects_ray(o, n)
			if rr != null:
				var d: float = o.distance_to(rr)
				var vol: float = ab.size.x * ab.size.z * ab.size.y
				if mejor_o == null or d < mejor_d - 1.2 or (d < mejor_d + 1.2 and vol < mejor_v):
					mejor_o = ob
					mejor_v = vol
					mejor_d = minf(d, mejor_d)
		if mejor_o != null:
			_menu_objeto(mejor_o, {})
			return
	var mejor_t := 1e18
	var hit := ""
	for id in edificios:
		if edificios[id]["h"] <= 1.0:
			continue
		var ab: AABB = edificios[id]["aabb"]
		var r = ab.intersects_ray(o, n)
		if r != null:
			var t: float = o.distance_to(r)
			if t < mejor_t:
				mejor_t = t
				hit = id
	if hit != "":
		_ir_a_edificio(hit)
		return
	if solo_elegir:
		return
	var g = Plane(Vector3.UP, 0.0).intersects_ray(o, n)
	if g != null:
		var q := Vector3(g)
		_ir_a_punto(Vector2(q.x, q.z))

func _menu_objeto(ob: Objeto, vecino: Dictionary) -> void:
	var botones: Array = []
	for e in Acciones.lista(ob, self):
		var ac: Dictionary = e["ac"]
		var txt := Acciones.etiqueta(ac)
		if not e["ok"]:
			txt += " — " + e["motivo"]
		var capt := ac
		botones.append([txt, func():
			cola.añadir(ob, capt)
			panel_ficha.visible = false, not e["ok"]])
	if not vecino.is_empty():
		botones.append(["🧍 Ver ficha", func(): _ficha_vecino(vecino)])
	var titulo := "%s %s" % [ob.def.get("e", ""), ob.def.get("n", "")]
	if ob.tipo == "cliente":
		titulo = "🧍 %s" % ob.cli["x"]["v"]["n"]
	var sub := ""
	if ob.tipo == "cliente" and ob.cli.get("pedido", "") != "":
		sub = "Ha pedido: %s" % Acciones.D["productos"][ob.cli["pedido"]]["n"]
	_ficha(titulo, sub, botones)

func _ficha_vecino(x: Dictionary) -> void:
	var v: Dictionary = x["v"]
	var of: Array = v.get("oficio", [])
	var oficio := ""
	if of.size() == 2:
		oficio = of[0] if v.get("g", "x") == "f" else of[1]
	elif v.get("estudia", null) != null:
		oficio = "estudia"
	var cab := "%d años" % int(v["edad"])
	if oficio != "":
		cab += " · " + oficio
	_ficha("🧍 %s" % v["n"], "%s\n\n«%s»" % [cab, v["d"]], [])

# =============== bucle ===============
func _process(dt: float) -> void:
	var rapido := salto_rest > 0.0
	if rapido:
		var paso := minf(salto_rest, VEL_SALTO * dt)
		_avanzar(paso)
		salto_rest -= paso
		if salto_rest <= 0.0:
			salto_rest = 0.0
			velo.visible = false
			dentro = false
			jugador.nodo.visible = true
			_actualizar_vecinos(true)
			var f := salto_efecto
			salto_efecto = Callable()
			if f.is_valid():
				f.call()
	elif not jugador.anda:
		_avanzar(MIN_POR_SEG * vel_juego * dt)
	var mult := 1.0 if vel_juego == 1 else 1.8
	if jugador.mover(jugador.vel * mult * dt):
		_llegar()
	if jugador.ult_paso > 0.0 and not rapido:
		# el trayecto cobra los minutos del dato (Escala.MIN_POR_UNIDAD), no los que dure verlo
		_avanzar(Escala.min_de_metros(jugador.ult_paso))
		min_andados += Escala.min_de_metros(jugador.ult_paso)
		m_andados += jugador.ult_paso
	_calcular_rutas()
	var dm_f := MIN_POR_SEG * vel_juego * dt if (not jugador.anda and not rapido) else 0.0
	if not rapido:
		cola.tick(dm_f)
		if bar != null:
			bar.tick(MIN_POR_SEG * vel_juego * dt)
	_interior_vista()
	for x in vecinos:
		var c: Actor = x["cam"]
		if x.get("ocultar", false) and c.ruta.is_empty():
			c.nodo.visible = false
			x["visible"] = false
			x["ocultar"] = false
		if c.nodo.visible:
			c.mover(Escala.VEL_ANDAR * 0.9 * mult * dt if c.vel < Escala.VEL_CORRER else Escala.VEL_CORRER * 0.9 * mult * dt)
	_lod_t += dt
	if _lod_t > 0.25:
		_lod_t = 0.0
		_lod()
	jugador.anim_tick()
	for x in vecinos:
		x["cam"].anim_tick()
	if seguir:
		pivote.position = pivote.position.lerp(jugador.nodo.position, 1.0 - exp(-5.0 * dt))
	guiada += dt
	if guiada > 0.25:
		guiada = 0.0
		_hud()
		_sol()
	if toast.visible:
		toast_t -= dt
		if toast_t <= 0.0:
			toast.visible = false
	if marca.visible:
		marca.rotation.y += dt * 2.0
		marca.scale = Vector3(1, 0.15, 1) * (1.0 + 0.15 * sin(Time.get_ticks_msec() * 0.008))
	fps_t += dt
	if fps_t >= 5.0:
		fps_t = 0.0
		print("fps:%d" % Engine.get_frames_per_second())

# =============== puente para pruebas (solo web) ===============
# LOD de personas: solo las que están a menos de LOD_DIST m de la cámara y dentro de pantalla (como mucho LOD_MAX, las
# más cercanas) llevan esqueleto y animación; el resto es una cápsula de una malla, o nada si no se ven.
const LOD_DIST := 70.0
const LOD_MAX := 25
var LOD_ON := true
var _lod_t := 0.0
func _lod() -> void:
	var cp := camara.global_position
	if interior != null:
		interior.lod(cp)
	var cand: Array = []
	if not LOD_ON:
		for x in vecinos:
			x["cam"].set_lod(false)
		jugador.set_lod(false)
		return
	var todos: Array = [jugador]
	for x in vecinos:
		todos.append(x["cam"])
	for a in todos:
		if not a.nodo.visible:
			a.set_lod(false)
			continue
		var g: Vector3 = a.nodo.global_position
		var d: float = cp.distance_to(g)
		var oculto_en_bar: bool = interior != null and not en_interior and a != jugador and interior.dentro(a.pos2())
		if a == jugador or (d < LOD_DIST and not oculto_en_bar and camara.is_position_in_frustum(g + Vector3(0, 0.9, 0))):
			cand.append([d if a != jugador else -1.0, a])
		else:
			a.set_lod(false)
	cand.sort_custom(func(p, q): return p[0] < q[0])
	for i in cand.size():
		cand[i][1].set_lod(i < LOD_MAX, cand[i][0] < 35.0)

func _interior_vista() -> void:
	if interior == null:
		return
	var d := interior.dentro(jugador.pos2()) or jugador.postura == "oculto"
	interior.cortar(d)
	if d != en_interior:
		en_interior = d
		if etq_interior != null:
			etq_interior.set_meta("sec_dentro", d)
			etq_interior.visible = not d
		dist = DIST_INTERIOR if d else DIST_CALLE
		_poner_camara()

func texto_estado(a: Actor, t: String) -> void:
	if a.estado_etq == null:
		a.estado_etq = etiqueta("", Vector3(0, 2.6, 0), 34, Color(1, 1, 0.8))
		a.estado_etq.reparent(a.nodo, false)
		a.estado_etq.position = Vector3(0, 2.8, 0)
		a.estado_etq.pixel_size = 0.0055
	a.estado_etq.text = t
	a.estado_etq.visible = true

func _puente_js() -> void:
	js_cb = JavaScriptBridge.create_callback(_cmd_js)
	var w = JavaScriptBridge.get_interface("window")
	w.casita_cmd = js_cb

func _cmd_js(args: Array) -> void:
	var c := str(args[0])
	var a = args[1] if args.size() > 1 else null
	match c:
		"ir":
			_ir_a_edificio(str(a))
		"ir_xy":
			_ir_a_punto(Vector2(float(a), float(args[2])))
		"poner":
			jugador.poner(Vector2(float(a), float(args[2])))
			jugador.ruta = []
			pivote.position = jugador.nodo.position
		"hora":
			minutos = floorf(minutos / 1440.0) * 1440.0 + float(a) * 60.0
			_actualizar_vecinos(true)
		"dia":
			minutos = float(a) * 1440.0 + fposmod(minutos, 1440.0)
			_actualizar_vecinos(true)
		"vel":
			vel_juego = int(a)
		"camara":
			_alternar_camara()
			print("camara: libre=%s pivote=%s" % [str(cam_libre), str(pivote.position)])
		"cam":
			print("camara: libre=%s pivote=%s" % [str(cam_libre), str(pivote.position)])
		"zoom":
			dist = float(a)
			_poner_camara()
		"boton":
			var bs := ficha_botones.get_children()
			var i := int(a)
			if i < bs.size():
				(bs[i] as Button).pressed.emit()
		"vecino":
			var i := int(a)
			if i < vecinos.size():
				_ficha_vecino(vecinos[i])
		"luz":
			k_sol = float(a)
			k_amb = float(args[2])
			entorno.tonemap_exposure = float(args[3])
			_sol()
		"trabaja":
			trabaja_bar = bool(a)
			_hud()
		"accion":
			var o = interior.por_id.get(str(a), null)
			var ok := false
			if o != null:
				for e in Acciones.lista(o, self):
					if e["ac"]["id"] == str(args[2]):
						ok = e["ok"]
						print("accion %s ok=%s motivo=%s" % [e["ac"]["id"], str(e["ok"]), e["motivo"]])
						if ok:
							cola.añadir(o, e["ac"])
			if not ok:
				print("accion no disponible: %s %s" % [str(a), str(args[2])])
		"accion_cliente":
			var i := int(a)
			if bar != null and i < bar.clientes.size():
				var o: Objeto = bar.clientes[i]["obj"]
				for e in Acciones.lista(o, self):
					if e["ac"]["id"] == str(args[2]):
						print("accion_cliente %s ok=%s motivo=%s" % [e["ac"]["id"], str(e["ok"]), e["motivo"]])
						if e["ok"]:
							cola.añadir(o, e["ac"])
		"clientes":
			var t := []
			if bar != null:
				for cc in bar.clientes:
					t.append("%s:%s:%s" % [cc["x"]["v"]["n"], cc["est"], cc["pedido"]])
				print("clientes: %d %s | camarero=%s %s | personal=%d" % [bar.clientes.size(), str(t), str(bar.camarero.get("x", {}).get("v", {}).get("n", "-")), bar.cam_est, bar.personal.size()])
		"estado":
			print("estado: min=%d dinero=%s nec=%s jug=%s ruta=%d m_andados=%d min_andados=%.2f mano=%s coct=%.1f cola=%d dentro=%s trabaja=%s post=%s" % [minutos, str(dinero), str(nec), str(jugador.nodo.position), jugador.ruta.size(), m_andados, min_andados, jugador.mano, hab["cocteleria"], cola.total(), str(en_interior), str(trabaja_bar), jugador.postura])
		"donde":
			var t2 := []
			for x in vecinos:
				if x["cam"].nodo.visible:
					t2.append("%s@%d,%d" % [str(x["v"]["n"]).substr(0, 5), int(x["cam"].nodo.position.x), int(x["cam"].nodo.position.z)])
			print("donde: ", t2)
		"dbg":
			match str(a):
				"fachadas":
					for n in get_children():
						if n is MeshInstance3D and n.material_override is ShaderMaterial:
							n.visible = not n.visible
				"multi":
					for n in get_children():
						if n is MultiMeshInstance3D:
							n.visible = not n.visible
				"sombra":
					sol.shadow_enabled = not sol.shadow_enabled
				"luces":
					for n in get_children():
						if n is OmniLight3D:
							n.visible = not n.visible
				"personas":
					LOD_ON = not LOD_ON
		"rend":
			var tot := 0
			var esq := 0
			var vis2 := 0
			var todos: Array = [jugador]
			for x in vecinos:
				todos.append(x["cam"])
			for ac_ in todos:
				if ac_.nodo.visible:
					vis2 += 1
				if ac_.persona != null:
					tot += 1
					if ac_.esqueleto_activo():
						esq += 1
			print("rend: fps=%d personas=%d visibles=%d con_esqueleto=%d objetos=%d dibujos=%d" % [Engine.get_frames_per_second(), tot, vis2, esq, RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_OBJECTS_IN_FRAME), RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)])
		"vecinos":
			var vis := 0
			for x in vecinos:
				if x["cam"].nodo.visible:
					vis += 1
			print("vecinos visibles: %d de %d" % [vis, vecinos.size()])
