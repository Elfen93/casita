shader_type spatial;
// Fachada procedural de bloque de pisos / casa baja: ventanas por plantas, portal, forjados y ventanas que se encienden de noche.
// Se aplica a un BoxMesh con origen en el centro (el origen del edificio se coloca en el suelo con la posición del nodo).
uniform vec3 tam = vec3(12.0, 15.0, 10.0);   // ancho (x), alto (y), fondo (z) del cubo en metros
uniform vec4 color_muro : source_color = vec4(0.82, 0.70, 0.55, 1.0);
uniform vec4 color_tejado : source_color = vec4(0.42, 0.30, 0.27, 1.0);
uniform vec4 color_marco : source_color = vec4(0.93, 0.92, 0.88, 1.0);
uniform float alto_planta = 3.0;
uniform float ancho_hueco = 3.0;
uniform float noche : hint_range(0.0, 1.0) = 0.0;
uniform float semilla = 1.0;
uniform float planta_baja_portal = 1.0;   // 1 = portal y bajos comerciales; 0 = ventanas normales
varying vec3 lp;
varying vec3 ln;
float hash(vec2 p) { return fract(sin(dot(p + semilla, vec2(127.1, 311.7))) * 43758.5453); }
void vertex() {
	lp = VERTEX + tam * 0.5;
	ln = NORMAL;
}
void fragment() {
	vec3 col = color_muro.rgb;
	float emis = 0.0;
	vec3 emis_col = vec3(1.0, 0.78, 0.42);
	if (abs(ln.y) > 0.5) {
		col = color_tejado.rgb;
	} else {
		bool en_x = abs(ln.x) > 0.5;       // cara lateral (normal en X): se recorre en Z
		float largo = en_x ? tam.z : tam.x;
		float u = en_x ? lp.z : lp.x;
		float cara = en_x ? (ln.x > 0.0 ? 1.0 : 2.0) : (ln.z > 0.0 ? 3.0 : 4.0);
		float ncel = max(floor(largo / ancho_hueco), 1.0);
		float margen = (largo - ncel * ancho_hueco) * 0.5;
		float u2 = u - margen;
		float planta = floor(lp.y / alto_planta);
		float v = fract(lp.y / alto_planta);
		float plantas = floor(tam.y / alto_planta + 0.01);
		if (lp.y > plantas * alto_planta - 0.01) {
			// antepecho de la cubierta
			col = color_muro.rgb * 0.92;
		} else if (u2 > 0.0 && u2 < ncel * ancho_hueco) {
			float celda = floor(u2 / ancho_hueco);
			float ux = fract(u2 / ancho_hueco);
			// forjado (línea horizontal entre plantas)
			if (v < 0.07 && planta > 0.5) col = color_muro.rgb * 0.82;
			bool portal = (planta_baja_portal > 0.5 && planta < 0.5 && cara == 4.0 && celda == floor(ncel * 0.5));
			if (portal) {
				if (ux > 0.2 && ux < 0.8 && v < 0.78) {
					col = vec3(0.22, 0.15, 0.10);
					if (ux > 0.28 && ux < 0.72 && v > 0.3 && v < 0.7) { col = vec3(0.30, 0.38, 0.40); emis = 0.35 * noche; }
				}
			} else {
				float v0 = planta < 0.5 && planta_baja_portal > 0.5 ? 0.30 : 0.34;
				float v1 = planta < 0.5 && planta_baja_portal > 0.5 ? 0.72 : 0.82;
				if (ux > 0.2 && ux < 0.8 && v > v0 - 0.03 && v < v1 + 0.03) {
					col = color_marco.rgb;
					if (ux > 0.24 && ux < 0.76 && v > v0 && v < v1) {
						float h = hash(vec2(celda * 7.0 + cara * 13.0, planta));
						float enc = step(0.55, h);   // algo menos de la mitad iluminadas
						col = mix(vec3(0.30, 0.42, 0.52), vec3(0.55, 0.68, 0.78), v);
						// postigo / persiana en algunas
						if (h > 0.82) col = vec3(0.35, 0.45, 0.35);
						// travesaño
						if (abs(ux - 0.5) < 0.012) col = color_marco.rgb;
						emis = enc * noche;
						col = mix(col, vec3(0.9, 0.7, 0.4), enc * noche * 0.6);
					}
				}
				// balcón: barandilla en algunas ventanas de plantas altas
				if (planta > 0.5 && v < 0.30 && ux > 0.12 && ux < 0.88 && hash(vec2(celda + 3.0, planta + cara)) > 0.6 && v > 0.07)
					if (fract(ux * 18.0) < 0.35) col = vec3(0.16, 0.17, 0.18);
			}
		}
	}
	// ligera variación para que no sea plano
	col *= 0.97 + 0.06 * hash(floor(lp.xz * 0.5) + floor(lp.y / alto_planta));
	ALBEDO = col;
	ROUGHNESS = 0.9;
	EMISSION = emis_col * emis * 1.4;
}
