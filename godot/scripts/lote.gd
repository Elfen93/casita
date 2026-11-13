class_name Lote
# Junta muchas cajas coloreadas en UNA sola malla (colores por vértice): el barrio entero son pocas llamadas de dibujo.
var st := SurfaceTool.new()
const CARAS := [
	[Vector3(0, 1, 0), Vector3(-1, 1, -1), Vector3(1, 1, -1), Vector3(1, 1, 1), Vector3(-1, 1, 1)],
	[Vector3(0, -1, 0), Vector3(-1, -1, 1), Vector3(1, -1, 1), Vector3(1, -1, -1), Vector3(-1, -1, -1)],
	[Vector3(1, 0, 0), Vector3(1, -1, 1), Vector3(1, 1, 1), Vector3(1, 1, -1), Vector3(1, -1, -1)],
	[Vector3(-1, 0, 0), Vector3(-1, -1, -1), Vector3(-1, 1, -1), Vector3(-1, 1, 1), Vector3(-1, -1, 1)],
	[Vector3(0, 0, 1), Vector3(-1, -1, 1), Vector3(-1, 1, 1), Vector3(1, 1, 1), Vector3(1, -1, 1)],
	[Vector3(0, 0, -1), Vector3(1, -1, -1), Vector3(1, 1, -1), Vector3(-1, 1, -1), Vector3(-1, -1, -1)]]

func _init() -> void:
	st.begin(Mesh.PRIMITIVE_TRIANGLES)

func caja(c: Vector3, s: Vector3, col: Color) -> void:
	var h := s * 0.5
	for f in CARAS:
		st.set_color(col)
		st.set_normal(f[0])
		for i in [1, 2, 3, 1, 3, 4]:
			st.add_vertex(c + Vector3(f[i].x * h.x, f[i].y * h.y, f[i].z * h.z))

func malla() -> ArrayMesh:
	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = 0.95
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var m := st.commit()
	m.surface_set_material(0, mat)
	return m
