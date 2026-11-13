class_name HumanoLigero
extends Humano
## Versión ligera para multitudes (25 vecinos): mismo cuerpo, mismas formas, mismo catálogo y misma interfaz que Humano,
## pero sin dientes, pestañas ni cejas (≈10 000 triángulos menos por persona, de ≈36 000 a ≈28 000 con camiseta, vaqueros y zapatillas),
## sin sombra propia y con una sola piel por persona. No es un proxy de pocos polígonos: eso queda pendiente.

func _montar() -> void:
	if _listo:
		return
	super._montar()
	for k in _piezas.keys():
		if k == "dientes" or k == "pestanas" or k.begins_with("cejas_"):
			(_piezas[k] as Node).queue_free()
			_piezas.erase(k)
		else:
			(_piezas[k] as MeshInstance3D).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
