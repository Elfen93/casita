# Changelog

## 2026-11-10
- Fábrica: el código fuente vive en el repo (`src/`, `mods/`, `build.py`, `scripts/test.py`), biblia, flujo de trabajo y backlog en `docs/`.
- Banco Atlántico: app creíble con extracto, categorías, productos (ahorro, depósito, fondo, cripto, préstamo), hucha y comisiones.
- Comer de verdad: despensa, tres comidas, descanso del curro, nutrición.
- Creador: altura y peso; editable después.
- Huelga visible y piquete automático. Gimnasios con escena. Local político con retratos y libros.
- Horario semanal, visitas, salir desde fuera, reparto de arreglos, biblioteca que devuelve.
- Salud mental, adicciones, marginalidad, el final, lo colectivo, la jornada, crianza, la casa vivida, menos ruido.
- Entrevista: las preguntas ilegales dependen de género, edad y piel.
- Género: el colectivo en femenino genérico (juntas, compañeras, todas…) pasa a masculino si el personaje es hombre.
- Mis libros: ventana con portadas, autor, reseña, efectos, progreso, elegir qué leer; 16 libros más; reseñas al terminar.
- Manuales: la habilidad sube mientras se lee; lo ya leído cuenta.
- Mis libros: botón «Releer» en Leídos (los manuales repasados enseñan menos).
- Releer da el 100% de la habilidad (de momento).
- Curro: va al baño cuando le aprieta, café cuando cae la energía (máx. 3), lavado si va sucio; en empresas tóxicas cuentan las veces al baño.
- Gobierno de consejos/comunas por fases (gobierno.js): vivienda (alquiler ≤22 % de ingresos, sin desahucios, deuda condonada) → trabajo (sin horas extra, asambleas, cargos elegidos, «Propuesta al consejo» en lugar de huelga, comedor) → compra y banco (compra −30 %, Banca Pública sin comisiones, préstamos 1,5 %, fondos/cripto liquidados, escasez semanal, colas). Ventana «Qué ha cambiado». Problemas: sabotaje, bloqueo, apagones, nostalgia.
- L(): «trabajadoras» → «trabajadores» (no «trabajadoros»); peonas → peones, currantas → currantes.
- Consejos y vivienda: hipoteca con tope del 22 % de ingresos, congelada en paro, al 0 % con la Banca Pública; sin embargos ni avisos repetidos; ya no se compra casa; «Pedir vivienda a la asamblea» con lista de espera según necesidad (pisos grandes solo para hogares de 2+), sin fianza; al mudarse, la casa propia pasa a la bolsa común.
- Impuestos (fiscal.js): nómina bruta→neta con Seguridad Social e IRPF por tramos (modelo 2026), coste empresa y valor producido; el neto cambia con el gobierno (conservador, liberal, austeridad, progresista, consejos/comunas con caja común); IVA de básicos en el precio de la compra; IVA estimado de todo lo que se compra; IBI anual para propietarias; declaración de la renta en abril (devuelve si no se trabajó el año entero, desgrava la cuota sindical, cuentan los críos); ventana «🧾 Nómina e impuestos» con tu tipo efectivo frente al del dueño de la empresa (sociedad patrimonial).
- Ciclos (ciclos.js): cada sistema con su tensión (acumulación, espiral deuda-recesión, compresión de beneficios, sobreinversión, burocratización/descoordinación), tres señales en la Historia y su crisis propia (burbuja → posible austeridad; huelga de inversión → aguanta o péndulo liberal; estallido → progresista o giro autoritario; frenazo sin rescate; consejos → renovación, socialismo de mercado o restauración). Precio de la vivienda que sigue al ciclo, despidos, fondos que caen. Nuevo gobierno «Socialismo de mercado» (con su fiscalidad; sindicato oficial sin huelgas). Presión exterior. Pulso de actores al cambiar de gobierno (banca que repercute comisiones, fortunas que se empadronan fuera, tribunales, huelgas generales); que aguanten las medidas depende de la movilización y de la jugadora. Barras en Vida → El mundo.
- Comunidad (comunidad.js): fundar una comunidad de vivienda, cooperativa integral o comuna rural con cualquier gobierno; cuota semanal, caja común y de resistencia, despensa, facturas o compra más baratas; cohesión que sube con la participación y baja con quien no aporta, la crisis y si la fundadora se apaga; dilemas (expulsar, venderse al súper, rotar tareas, coordinar, legalizarse); se disuelve si la cohesión cae a 0; con 8+ personas teje red con otros barrios y, si llega la ruptura, la revolución tira hacia las comunas.
