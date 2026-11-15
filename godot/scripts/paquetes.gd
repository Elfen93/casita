class_name Paquetes
extends Node
## Carga diferida del arte pesado (personajes de Mixamo, y más adelante grupos de animaciones) en la web.
##
## index.pck lleva solo lo imprescindible; cada personaje de arte/mixamo/pj/ va en su propio paquete
## (play3d/pj/<nombre>.pck) y cada grupo de animaciones en play3d/anim/<grupo>.pck. scripts/godot_export.sh los
## exporta y escribe el índice res://arte/mixamo/paquetes.json ({"pj/adam": {"recurso": "res://…glb", "bytes": n}…}) en
## index.pck: así se sabe qué hay aunque aún no se haya bajado (el reparto de vecinos no cambia al llegar).
##
## Uso: Paquetes.listo("pj/adam") -> ¿se puede cargar ya? Si no, Paquetes.pedir("pj/adam", al_llegar) lo baja
## (HTTPRequest, URL relativa a la página: vale en GitHub Pages bajo /casita/play3d/), lo monta con
## ProjectSettings.load_resource_pack y llama a al_llegar.call(nombre). Se baja una sola vez por sesión (el navegador,
## además, lo guarda en su caché HTTP). Fuera de la web, o si el archivo ya está en index.pck, no se baja nada.

signal llegado(nombre: String)

const INDICE := "res://arte/mixamo/paquetes.json"
const A_LA_VEZ := 3                 # descargas simultáneas como mucho
# donde se escribe el .pck bajado: en la web, /tmp (memoria; no se guarda en el almacenamiento del navegador,
# que ya lo cachea por HTTP); fuera, user://paquetes
const CARPETA_WEB := "/tmp/casita_paquetes"
const CARPETA := "user://paquetes"

static var _yo: Paquetes
static var _indice := {}
static var _indice_leido := false
static var estado := {}             # nombre -> "cola" | "bajando" | "listo" | "error"
static var bajadas := 0             # descargas empezadas en esta sesión (las pruebas comprueban que no se repiten)
var _cola: Array = []
var _esperan := {}                  # nombre -> [Callable]
var _activas := 0

## ruta del recurso que trae cada paquete (para saber si ya está montado o en index.pck)
static func recurso(nombre: String) -> String:
	var e = indice().get(nombre)
	if e is Dictionary and e.has("recurso"):
		return str(e["recurso"])
	if nombre == "pj/remy":
		return "res://arte/mixamo/remy.glb"
	if nombre.begins_with("pj/"):
		return "res://arte/mixamo/%s.glb" % nombre
	if nombre.begins_with("anim/"):
		return "res://arte/mixamo/%s.res" % nombre
	return ""

static func indice() -> Dictionary:
	if not _indice_leido:
		_indice_leido = true
		if FileAccess.file_exists(INDICE):
			var d = JSON.parse_string(FileAccess.get_file_as_string(INDICE))
			if d is Dictionary:
				_indice = d
	return _indice

## ¿existe este paquete (en disco, en index.pck o para bajar)?
static func existe(nombre: String) -> bool:
	return ResourceLoader.exists(recurso(nombre)) or indice().has(nombre)

## ¿se puede cargar ya?
static func listo(nombre: String) -> bool:
	return estado.get(nombre, "") == "listo" or ResourceLoader.exists(recurso(nombre))

## pide el paquete; al_llegar(nombre) se llama al montarlo (también si ya estaba listo, en el siguiente fotograma).
## urgente: se pone el primero de la cola (lo que se ve en la pantalla de elegir, la jugadora).
static func pedir(nombre: String, al_llegar := Callable(), urgente := false) -> void:
	var yo := _nodo()
	if listo(nombre):
		if al_llegar.is_valid():
			al_llegar.call_deferred(nombre)
		return
	if not indice().has(nombre) or yo == null:
		return
	if al_llegar.is_valid():
		var l: Array = yo._esperan.get(nombre, [])
		if not l.has(al_llegar):
			l.append(al_llegar)
		yo._esperan[nombre] = l
	match str(estado.get(nombre, "")):
		"":
			estado[nombre] = "cola"
			if urgente:
				yo._cola.push_front(nombre)
			else:
				yo._cola.append(nombre)
			yo._siguiente()
		"cola":
			if urgente and yo._cola.has(nombre):
				yo._cola.erase(nombre)
				yo._cola.push_front(nombre)

static func _nodo() -> Paquetes:
	if _yo != null and is_instance_valid(_yo):
		return _yo
	var arbol := Engine.get_main_loop() as SceneTree
	if arbol == null:
		return null
	_yo = Paquetes.new()
	_yo.name = "Paquetes"
	_yo.process_mode = Node.PROCESS_MODE_ALWAYS   # sigue bajando con el árbol en pausa (pantalla de elegir)
	arbol.root.add_child.call_deferred(_yo)
	return _yo

func _siguiente() -> void:
	if not is_inside_tree():
		if not ready.is_connected(_siguiente):
			ready.connect(_siguiente, CONNECT_ONE_SHOT)
		return
	while _activas < A_LA_VEZ and not _cola.is_empty():
		_bajar(str(_cola.pop_front()))

func _url(nombre: String) -> String:
	var base := "./"
	if OS.has_feature("web"):
		# URL absoluta de <carpeta de la página>/<nombre>.pck (HTTPRequest no acepta rutas relativas)
		var u = JavaScriptBridge.eval("new URL('%s.pck', document.baseURI).href" % nombre, true)
		if u is String and u != "":
			return u
	return base + nombre + ".pck"

func _bajar(nombre: String) -> void:
	estado[nombre] = "bajando"
	_activas += 1
	bajadas += 1
	var carpeta := CARPETA_WEB if OS.has_feature("web") else CARPETA
	DirAccess.make_dir_recursive_absolute(carpeta)
	var destino := "%s/%s.pck" % [carpeta, nombre.replace("/", "_")]
	var h := HTTPRequest.new()
	h.download_file = destino
	h.use_threads = false
	add_child(h)
	h.request_completed.connect(func(res: int, cod: int, _cab, _cuerpo):
		h.queue_free()
		_activas -= 1
		var ok := res == HTTPRequest.RESULT_SUCCESS and cod >= 200 and cod < 300
		if ok:
			ok = ProjectSettings.load_resource_pack(destino, false)
		if ok and not ResourceLoader.exists(recurso(nombre)):
			ok = false
		estado[nombre] = "listo" if ok else "error"
		if ok:
			print("paquete %s listo" % nombre)
			for f in _esperan.get(nombre, []):
				if (f as Callable).is_valid():
					(f as Callable).call(nombre)
			llegado.emit(nombre)
		else:
			push_warning("paquete %s: no se pudo bajar (resultado %d, HTTP %d)" % [nombre, res, cod])
		_esperan.erase(nombre)
		_siguiente())
	var err := h.request(_url(nombre))
	if err != OK:
		h.request_completed.emit(HTTPRequest.RESULT_CANT_CONNECT, 0, PackedStringArray(), PackedByteArray())
