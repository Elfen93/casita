extends SceneTree
# Enseña un .glb cualquiera con las luces de retrato y saca dos fotos. Uso: godot --path godot -s arte/humano/ver_glb.gd -- glb=res://... salida=/tmp/x
func _init() -> void:
	var a := {}
	for s in OS.get_cmdline_user_args():
		var p := s.split("=", true, 1)
		if p.size() == 2:
			a[p[0]] = p[1]
	var raiz := Node3D.new()
	root.add_child(raiz)
	Humano.luces_retrato(raiz)
	var esc: PackedScene = load(a["glb"])
	var h := esc.instantiate()
	raiz.add_child(h)
	if a.has("giro"):
		h.rotation_degrees.y = float(a["giro"])
	var cam := Camera3D.new()
	cam.fov = 28
	raiz.add_child(cam)
	cam.current = true
	root.size = Vector2i(520, 860)
	for v in [["cuerpo", Vector3(0.6, 1.2, 4.3), Vector3(0, 0.86, 0)], ["cara", Vector3(0.22, 1.52, 1.15), Vector3(0, 1.5, 0)]]:
		cam.look_at_from_position(v[1], v[2])
		for i in 6:
			await process_frame
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png(a["salida"] + "_" + v[0] + ".png")
	quit()
