# T-NNN · Título
Rol: … · Modelo: … · Esfuerzo: bajo/medio

Lee SOLO: docs/BIBLIA.md (§2, §3, §4), <fichero 1>, <fichero 2>.
Escribe SOLO: <fichero>. Si hay contenido (fichas, nombres, frases de lista): data/<archivo>.json, secciones <…> (campos en data/README.md).

Qué:
- …

Hecho cuando:
- `python3 build.py --check` → SYNTAX_OK (comprueba también data/)
- `python3 scripts/test.py t/t_x.js 60` → empieza por OK y errs:[]
- (visual) captura en docs/capturas/<nombre>.png: `python3 build.py && python3 scripts/test.py t/t_shot_x.js 5` genera t/_run_t_shot_x.html; `python3 t/cdpshot.py file://$PWD/t/_run_t_shot_x.html 5 docs/capturas/x.png 780x600`

Antes de entregar, mira tus capturas a tamaño de móvil (420,860) como las miraría quien diseña el juego: ningún nombre pisado o cortado, ninguna figura sobre un mueble, una pared u otra figura, todo lo que pide el encargo a la vista, cada objeto reconocible, y que se pueda llegar jugando. Si algo falla, arréglalo; si no puedes, dilo lo primero en la entrega.

No leas nada más. No expliques el código. No toques src/core. Entrega: diff, resultado del test, captura.
