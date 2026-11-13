class_name Escala
# REGLA DE ESCALA (un solo sitio). 1 unidad de Godot = 1 metro; el personaje mide 1,7 m.
# Las coordenadas de data/ciudad.json (y de lugares.json) se multiplican por M_UNIDAD:
# 1 casilla del dato = 6 m según el encargo = 3 m por unidad de coordenada del dato (el dato trae 120x100 unidades por barrio): La Ribera mide 360x300 m.
const M_UNIDAD := 3.0
const ALTURA_PJ := 1.7
const CALLE := 8.0            # ancho de calzada
const ACERA := 3.0            # ancho de cada acera
const CELDA := 1.0            # rejilla de caminos (m)
const VEL_ANDAR := 3.5        # m/s visual, paso vivo
const VEL_CORRER := 7.0       # el doble si el destino queda lejos
const CORRER_DESDE := 60.0    # m de trayecto a partir de los que se corre
# EL RELOJ AL ANDAR: el trayecto cobra lo que costaría en el juego web, no lo que dure verlo:
# 10 m por unidad (0,119 min de juego por unidad del dato; cruzar los 120 de punta a punta = 14 min de juego)
# 10 m por unidad del dato a 84 m/min = 0,119 min de juego por unidad.
const MIN_POR_UNIDAD := 0.119
const MUNDO := Rect2(-8, -8, 384, 324)   # lo que cubre la rejilla (m)

static func m(v: float) -> float:
	return v * M_UNIDAD

static func v2(a: Array) -> Vector2:
	return Vector2(float(a[0]) * M_UNIDAD, float(a[1]) * M_UNIDAD)

static func rect(rb: Array) -> Rect2:
	return Rect2(float(rb[0]) * M_UNIDAD, float(rb[1]) * M_UNIDAD, float(rb[2] - rb[0]) * M_UNIDAD, float(rb[3] - rb[1]) * M_UNIDAD)

# minutos de juego que cuesta recorrer `metros` andando por la calle
static func min_de_metros(metros: float) -> float:
	return metros / M_UNIDAD * MIN_POR_UNIDAD
