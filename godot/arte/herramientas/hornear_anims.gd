extends SceneTree
## Hornea las animaciones compartidas de Mixamo (las de remy.glb, listas para cualquier esqueleto de Mixamo) en
## res://arte/mixamo/anim/base.res, para no tener que cargar la malla y las texturas de Remy para animar a los demás.
## Lo llama scripts/godot_export.sh. Uso: godot --headless --path godot -s res://arte/herramientas/hornear_anims.gd
## (arte/mixamo/ no está en el repositorio: si falta remy.glb, no hace nada).
func _init() -> void:
	if not ResourceLoader.exists(PersonaAnimada.MODELOS["remy"]["glb"]):
		print("hornear_anims: no hay remy.glb; nada que hacer")
		quit()
		return
	DirAccess.make_dir_recursive_absolute("res://arte/mixamo/anim")
	var lib := PersonaAnimada.hornear_libreria()
	var err := ResourceSaver.save(lib, PersonaAnimada.ANIM_BASE, ResourceSaver.FLAG_COMPRESS)
	print("hornear_anims: %s -> %s (%d animaciones, error %d)" % [PersonaAnimada.MODELOS["remy"]["glb"], PersonaAnimada.ANIM_BASE, lib.get_animation_list().size(), err])
	quit(1 if err != OK else 0)
