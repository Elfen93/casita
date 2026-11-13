class_name ManiquiPega
extends Node3D
# Maniquí de pega con la MISMA interfaz que Humano (arte/humano). Primitivas que cambian de tamaño y color.
# Origen en los pies, ~1,70 m, mira a -Z.

static func catalogo() -> Dictionary:
	return {
		"formas": [
			{"id": "peso", "n": "Peso", "grupo": "cuerpo", "min": -1.0, "max": 1.0, "def": 0.0},
			{"id": "altura", "n": "Altura", "grupo": "cuerpo", "min": -1.0, "max": 1.0, "def": 0.0},
			{"id": "hombros", "n": "Hombros", "grupo": "cuerpo", "min": -1.0, "max": 1.0, "def": 0.0},
			{"id": "piernas", "n": "Largo de piernas", "grupo": "cuerpo", "min": -1.0, "max": 1.0, "def": 0.0},
			{"id": "cabeza", "n": "Tamaño de cabeza", "grupo": "cara", "min": -1.0, "max": 1.0, "def": 0.0},
			{"id": "ojos", "n": "Tamaño de ojos", "grupo": "cara", "min": -1.0, "max": 1.0, "def": 0.0},
			{"id": "nariz", "n": "Nariz", "grupo": "cara", "min": 0.0, "max": 1.0, "def": 0.3},
		],
		"pieles": [{"id": "clara", "n": "Clara"}, {"id": "media", "n": "Media"}, {"id": "oscura", "n": "Oscura"}],
		"pelos": [{"id": "", "n": "Sin pelo"}, {"id": "corto", "n": "Corto"}, {"id": "largo", "n": "Largo"}],
		"ropas": [
			{"id": "camiseta", "n": "Camiseta", "capa": "arriba"}, {"id": "jersey", "n": "Jersey", "capa": "arriba"},
			{"id": "vaqueros", "n": "Vaqueros", "capa": "abajo"}, {"id": "falda", "n": "Falda", "capa": "abajo"},
			{"id": "zapatillas", "n": "Zapatillas", "capa": "pies"}, {"id": "botas", "n": "Botas", "capa": "pies"},
		],
		"expresiones": [{"id": "sonrisa", "n": "Sonrisa"}, {"id": "sorpresa", "n": "Sorpresa"}],
	}

const PIELES := {"clara": Color(0.96, 0.8, 0.7), "media": Color(0.82, 0.62, 0.45), "oscura": Color(0.47, 0.31, 0.22)}

var formas := {}
var piel := "media"
var pelo_id := ""
var pelo_color := Color(0.2, 0.13, 0.08)
var ropa := {}      # capa -> {"id", "color"}
var expresiones := {}
var _alt := 1.0     # factor de altura total

var m_piel: StandardMaterial3D
var m_pelo: StandardMaterial3D
var m_cuerpo: StandardMaterial3D   # fondo cuando no hay ropa: se usa la piel
var n_torso: MeshInstance3D
var n_pelvis: MeshInstance3D
var n_cabeza: Node3D
var n_cabeza_m: MeshInstance3D
var n_ojos: Array = []
var n_nariz: MeshInstance3D
var n_boca: MeshInstance3D
var n_cejas: Array = []
var n_pelo_c: MeshInstance3D
var n_pelo_l: MeshInstance3D
var n_brazos: Array = []
var n_piernas: Array = []
var n_ropa := {}    # capa -> Array de MeshInstance3D (con material propio)

func _init() -> void:
	for f in catalogo()["formas"]:
		formas[f["id"]] = float(f["def"])
	m_piel = _mat(PIELES[piel])
	m_pelo = _mat(pelo_color)
	_construir()
	_reajustar()

func _mat(c: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = 0.85
	return m

func _mi(mesh: Mesh, mat: Material, padre: Node3D) -> MeshInstance3D:
	var n := MeshInstance3D.new()
	n.mesh = mesh
	n.material_override = mat
	padre.add_child(n)
	return n

func _cap(r: float, h: float) -> CapsuleMesh:
	var c := CapsuleMesh.new()
	c.radius = r
	c.height = h
	c.radial_segments = 16
	c.rings = 6
	return c

func _esf(r: float) -> SphereMesh:
	var s := SphereMesh.new()
	s.radius = r
	s.height = r * 2.0
	s.radial_segments = 16
	s.rings = 8
	return s

func _construir() -> void:
	n_pelvis = _mi(_cap(0.15, 0.3), m_piel, self)
	n_torso = _mi(_cap(0.16, 0.6), m_piel, self)
	for lado in [-1, 1]:
		var p := _mi(_cap(0.07, 0.8), m_piel, self)
		n_piernas.append(p)
		var b := _mi(_cap(0.045, 0.6), m_piel, self)
		n_brazos.append(b)
	n_cabeza = Node3D.new()
	add_child(n_cabeza)
	n_cabeza_m = _mi(_esf(0.11), m_piel, n_cabeza)
	n_cabeza_m.scale = Vector3(0.9, 1.1, 1.0)
	var mat_ojo := _mat(Color(0.08, 0.06, 0.05))
	for lado in [-1, 1]:
		var o := _mi(_esf(0.016), mat_ojo, n_cabeza)
		n_ojos.append(o)
		var c := _mi(BoxMesh.new(), mat_ojo, n_cabeza)
		(c.mesh as BoxMesh).size = Vector3(0.04, 0.008, 0.01)
		n_cejas.append(c)
	n_nariz = _mi(_esf(0.016), m_piel, n_cabeza)
	n_boca = _mi(BoxMesh.new(), _mat(Color(0.6, 0.2, 0.2)), n_cabeza)
	(n_boca.mesh as BoxMesh).size = Vector3(0.05, 0.008, 0.01)
	n_pelo_c = _mi(_esf(0.118), m_pelo, n_cabeza)
	n_pelo_c.scale = Vector3(0.97, 0.82, 1.0)
	n_pelo_c.position = Vector3(0, 0.035, 0.014)
	n_pelo_l = _mi(_cap(0.12, 0.34), m_pelo, n_cabeza)
	n_pelo_l.position = Vector3(0, -0.06, 0.05)
	n_pelo_c.visible = false
	n_pelo_l.visible = false

func _reajustar() -> void:
	var peso: float = formas.get("peso", 0.0)
	var alt: float = formas.get("altura", 0.0)
	var hom: float = formas.get("hombros", 0.0)
	var pie: float = formas.get("piernas", 0.0)
	var cab: float = formas.get("cabeza", 0.0)
	var oj: float = formas.get("ojos", 0.0)
	var nar: float = formas.get("nariz", 0.3)
	_alt = 1.0 + alt * 0.1
	var ancho := 1.0 + peso * 0.3
	var largo_p := 0.8 * (1.0 + pie * 0.12) * _alt
	var tor_h := 0.6 * _alt
	var pelv_y := largo_p + 0.1
	var tor_y := pelv_y + 0.3 * _alt
	var hombro_y := tor_y + tor_h * 0.45
	n_pelvis.position = Vector3(0, pelv_y, 0)
	n_pelvis.scale = Vector3(ancho, 1.0, ancho)
	n_torso.position = Vector3(0, tor_y + 0.1, 0)
	n_torso.scale = Vector3(ancho * (1.0 + hom * 0.18), _alt, ancho)
	for i in 2:
		var lado := -1.0 if i == 0 else 1.0
		n_piernas[i].position = Vector3(lado * 0.09 * ancho, largo_p * 0.5 + 0.02, 0)
		n_piernas[i].scale = Vector3(ancho, largo_p / 0.8, ancho)
		n_brazos[i].position = Vector3(lado * (0.2 * ancho * (1.0 + hom * 0.18) + 0.06), hombro_y - 0.22 * _alt, 0)
		n_brazos[i].scale = Vector3(ancho, _alt, ancho)
	var cs := (1.0 + cab * 0.2) * 1.2
	n_cabeza.position = Vector3(0, tor_y + 0.1 + tor_h * 0.5 + 0.1 * cs, 0)
	n_cabeza.scale = Vector3.ONE * cs
	for i in 2:
		var lado := -1.0 if i == 0 else 1.0
		n_ojos[i].position = Vector3(lado * 0.04, 0.02, -0.098)
		n_ojos[i].scale = Vector3.ONE * (1.0 + oj * 0.6)
		n_cejas[i].position = Vector3(lado * 0.04, 0.055 + float(expresiones.get("sorpresa", 0.0)) * 0.02, -0.1)
	n_nariz.position = Vector3(0, -0.01, -0.108)
	n_nariz.scale = Vector3.ONE * (0.6 + nar * 1.4)
	var son: float = expresiones.get("sonrisa", 0.0)
	var sor: float = expresiones.get("sorpresa", 0.0)
	n_boca.position = Vector3(0, -0.055, -0.098)
	n_boca.scale = Vector3(1.0 + son * 0.7 - sor * 0.4, 1.0 + sor * 5.0 + son * 0.5, 1.0)
	# la ropa sigue a las partes del cuerpo
	_ajustar_ropa()

func _ajustar_ropa() -> void:
	for capa in n_ropa:
		for n in n_ropa[capa]:
			n.queue_free()
	n_ropa.clear()
	for capa in ropa:
		var r: Dictionary = ropa[capa]
		var mat := _mat(r["color"])
		var lista: Array = []
		var id: String = r["id"]
		match capa:
			"arriba":
				var t := _mi(_cap(0.172, 0.6), mat, self)
				t.position = n_torso.position
				t.scale = n_torso.scale * Vector3(1.0, 0.98, 1.06)
				lista.append(t)
				if id == "jersey":
					for i in 2:
						var b := _mi(_cap(0.052, 0.6), mat, self)
						b.position = n_brazos[i].position
						b.scale = n_brazos[i].scale
						lista.append(b)
			"abajo":
				var largo := 0.8 if id == "vaqueros" else 0.35
				var pv := _mi(_cap(0.16, 0.32), mat, self)
				pv.position = n_pelvis.position
				pv.scale = n_pelvis.scale * Vector3(1.0, 1.0, 1.06)
				lista.append(pv)
				for i in 2:
					var l := _mi(_cap(0.077, largo), mat, self)
					var sy: float = n_piernas[i].scale.y * (largo / 0.8)
					l.scale = Vector3(n_piernas[i].scale.x, sy, n_piernas[i].scale.z)
					l.position = Vector3(n_piernas[i].position.x, (n_piernas[i].position.y + 0.4 * n_piernas[i].scale.y) - largo * sy * 0.5, 0)
					lista.append(l)
			"pies":
				for i in 2:
					var z := _mi(_cap(0.085, 0.26 if id == "botas" else 0.2), mat, self)
					z.rotation_degrees = Vector3(90, 0, 0)
					z.scale = Vector3(n_piernas[i].scale.x, 1.0, 1.0)
					z.position = Vector3(n_piernas[i].position.x, 0.085, -0.05)
					lista.append(z)
			_:
				var e := _mi(_cap(0.22, 1.2), mat, self)
				e.position = Vector3(0, 0.9 * _alt, 0)
				lista.append(e)
		n_ropa[capa] = lista

func set_forma(id: String, v: float) -> void:
	if formas.has(id):
		formas[id] = v
		_reajustar()

func set_piel(id: String) -> void:
	piel = id if PIELES.has(id) else "media"
	m_piel.albedo_color = PIELES[piel]

func set_pelo(id: String, color: Color) -> void:
	pelo_id = id
	pelo_color = color
	m_pelo.albedo_color = color
	n_pelo_c.visible = id == "corto" or id == "largo"
	n_pelo_l.visible = id == "largo"

func set_ropa(capa: String, id: String, color: Color) -> void:
	if id == "":
		ropa.erase(capa)
	else:
		ropa[capa] = {"id": id, "color": color}
	_ajustar_ropa()

func set_expresion(id: String, v: float) -> void:
	if v <= 0.0:
		expresiones.erase(id)
	else:
		expresiones[id] = v
	_reajustar()

func aspecto() -> Dictionary:
	var r := {}
	for c in ropa:
		r[c] = {"id": ropa[c]["id"], "color": (ropa[c]["color"] as Color).to_html(false)}
	return {"formas": formas.duplicate(), "piel": piel, "pelo": {"id": pelo_id, "color": pelo_color.to_html(false)},
		"ropa": r, "expresiones": expresiones.duplicate()}

func aplicar(a: Dictionary) -> void:
	var cat := catalogo()
	var fa: Dictionary = a.get("formas", {}) if a.get("formas", {}) is Dictionary else {}
	for f in cat["formas"]:
		formas[f["id"]] = clampf(float(fa.get(f["id"], f["def"])), f["min"], f["max"])
	set_piel(str(a.get("piel", "media")))
	var pe = a.get("pelo", {})
	if pe is Dictionary:
		set_pelo(str(pe.get("id", "")), Color.html(str(pe.get("color", "#33221a"))))
	else:
		set_pelo("", pelo_color)
	ropa.clear()
	var ra = a.get("ropa", {})
	if ra is Dictionary:
		for c in ra:
			if ra[c] is Dictionary:
				ropa[str(c)] = {"id": str(ra[c].get("id", "")), "color": Color.html(str(ra[c].get("color", "#808080")))}
	expresiones.clear()
	var ea = a.get("expresiones", {})
	if ea is Dictionary:
		for k in ea:
			expresiones[str(k)] = clampf(float(ea[k]), 0.0, 1.0)
	_reajustar()

func altura() -> float:
	var cs := (1.0 + float(formas.get("cabeza", 0.0)) * 0.2) * 1.2
	var a := 1.0 + float(formas.get("altura", 0.0)) * 0.1
	var largo_p := 0.8 * (1.0 + float(formas.get("piernas", 0.0)) * 0.12) * a
	var tor_y := largo_p + 0.1 + 0.3 * a
	return tor_y + 0.1 + 0.3 * a + 0.1 * cs + 0.12 * cs
