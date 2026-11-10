# T-NNN · Título
Rol: … · Modelo: … · Esfuerzo: bajo/medio

Lee SOLO: docs/BIBLIA.md (§2, §3, §4), <fichero 1>, <fichero 2>.
Escribe SOLO: <fichero>.

Qué:
- …

Hecho cuando:
- `python3 build.py --check` → SYNTAX_OK
- `python3 scripts/test.py t/t_x.js 60` → empieza por OK y errs:[]
- (visual) captura en docs/capturas/<nombre>.png: `python3 build.py && python3 scripts/test.py t/t_shot_x.js 5` genera t/_run_t_shot_x.html; `python3 t/cdpshot.py file://$PWD/t/_run_t_shot_x.html 5 docs/capturas/x.png 780x600`

No leas nada más. No expliques el código. No toques src/core. Entrega: diff, resultado del test, captura.
