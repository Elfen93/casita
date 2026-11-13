extends SceneTree
# Convierte los FBX de Quaternius en cuerpos .scn sin animaciones + una biblioteca de animaciones compartida
func _init():
	var cuerpos = ["Male_Casual","Male_LongSleeve","Male_Shirt","Male_Suit","Female_Alternative","Female_Casual","Female_Dress","Female_TankTop"]
	for f in cuerpos:
		var n = load("res://scratch/%s.fbx" % f).instantiate()
		var ap = n.find_children("*","AnimationPlayer",true,false)[0]
		if f == "Male_Casual":
			var lib = AnimationLibrary.new()
			for an in ap.get_animation_list():
				var corto = an.get_slice("_", 1)
				var a = ap.get_animation(an).duplicate()
				lib.add_animation(corto, a)
			ResourceSaver.save(lib, "res://arte/personaje/anims.res", ResourceSaver.FLAG_COMPRESS)
		ap.get_parent().remove_child(ap); ap.free()
		n.name = f
		var ps = PackedScene.new(); print(f, " pack ", ps.pack(n))
		ResourceSaver.save(ps, "res://arte/personaje/cuerpos/%s.scn" % f, ResourceSaver.FLAG_COMPRESS)
	quit()
