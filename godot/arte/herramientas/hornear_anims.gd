extends SceneTree
## Hornea las animaciones de Mixamo por grupo: cada arte/mixamo/anims/<grupo>.glb (base, dia, social, baile…; ver
## data/animaciones.json) → res://arte/mixamo/anim/<grupo>.res, una AnimationLibrary sin malla ni texturas, sin pistas de
## escala ni de posición (salvo la cadera) y con el bucle del catálogo, lista para cualquier esqueleto de Mixamo.
## base sale de anims/base.glb (o de remy.glb si falta) y lleva además las de Animaciones.EN_BASE (carreras).
## Lo llama scripts/godot_export.sh. Uso: godot --headless --path godot -s res://arte/herramientas/hornear_anims.gd
## (arte/mixamo/ no está en el repositorio: si faltan los glb, no hace nada).
func _init() -> void:
	DirAccess.make_dir_recursive_absolute("res://arte/mixamo/anim")
	var grupos: Array = ["base"]
	for g in Animaciones.datos().get("grupos", {}):
		if not grupos.has(g):
			grupos.append(g)
	var mal := 0
	var hechos := 0
	for g in grupos:
		var lib := PersonaAnimada.hornear_grupo(str(g))
		if lib == null:
			print("hornear_anims: %s: no hay glb; nada que hacer" % g)
			continue
		var err := ResourceSaver.save(lib, PersonaAnimada.ANIM_RES % g, ResourceSaver.FLAG_COMPRESS)
		print("hornear_anims: %s -> %s (%d animaciones, cadera %.3f, error %d)" % [g, PersonaAnimada.ANIM_RES % g, lib.get_animation_list().size(), float(lib.get_meta("cadera_reposo", 0.0)), err])
		hechos += 1
		if err != OK:
			mal += 1
	quit(1 if mal > 0 else 0)
