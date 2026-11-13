shader_type spatial;
// Sombreador del catálogo de ciudad (GD-9). El color de cada vértice guarda la paleta original
// de Kenney; el canal alfa guarda la «clase» de superficie (0 otro, 1 muro, 2 tejado, 3 persiana,
// 4 cristal, 5 toldo/rótulo, 6 carrocería, 7 zócalo/paramento oscuro). Cada variante de color es solo un material con otros parámetros.
uniform vec3 c_muro : source_color = vec3(0.86, 0.78, 0.62);
uniform vec3 c_tejado : source_color = vec3(0.65, 0.33, 0.22);
uniform vec3 c_persiana : source_color = vec3(0.25, 0.42, 0.29);
uniform vec3 c_toldo : source_color = vec3(0.65, 0.25, 0.22);
uniform vec3 c_cristal : source_color = vec3(0.45, 0.55, 0.64);
uniform vec3 c_zocalo : source_color = vec3(0.4, 0.37, 0.33);
uniform vec3 c_carroceria : source_color = vec3(0.7, 0.7, 0.7);
uniform float apagado : hint_range(0.0, 1.0) = 0.35;  // cuánto se desatura lo que no se recolorea
uniform float luz_ventanas : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	vec3 o = COLOR.rgb;
	int cls = int(floor(COLOR.a * 8.0 + 0.5));
	float lum = dot(o, vec3(0.3, 0.55, 0.15));
	vec3 col = mix(vec3(lum), o, 1.0 - apagado);
	if (cls == 1) col = c_muro * mix(0.78, 1.0, lum);
	else if (cls == 2) col = c_tejado * (0.55 + 0.6 * lum);
	else if (cls == 3) col = c_persiana * (0.6 + 0.6 * lum);
	else if (cls == 4) col = c_cristal * (0.65 + 0.5 * lum);
	else if (cls == 5) col = c_toldo * (0.65 + 0.5 * lum);
	else if (cls == 7) col = c_zocalo * (0.55 + 0.9 * lum);
	else if (cls == 6) col = c_carroceria * (0.6 + 0.55 * lum);
	ALBEDO = col;
	ROUGHNESS = (cls == 4 || cls == 6) ? 0.45 : 0.9;
	if (cls == 4) EMISSION = c_cristal * luz_ventanas * 0.8;
}
