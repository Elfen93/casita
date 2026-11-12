#!/usr/bin/env python3
"""Casita · build
   python3 build.py          → casita.html (desarrollo) e index.html (PWA, lo que sirve GitHub Pages)
   python3 build.py --check  → solo comprueba sintaxis
Fuentes: src/head.html + libs (p3d/, q3d/q3d.js) + data/*.json + src/core/*.js (en orden) con mods/*.js (orden en build.json) + src/tail.html
El contenido vive en data/*.json (ver data/README.md): aquí se incrusta como `const DATA={archivo:{sección:…}}` al principio del script.
"""
import re,os,sys,json,subprocess,time
R=os.path.dirname(os.path.abspath(__file__));P=lambda *a:os.path.join(R,*a)
rd=lambda p:open(P(p),encoding='utf-8').read()
cfg=json.load(open(P('build.json')))
head=rd('src/head.html').replace('/*<<PHCSS>>*/','/*<<PHCSS>>*/'+rd('mods/movil.css')+'/*<</PHCSS>>*/',1)
lib='<script id="lib3d">'+rd('p3d/three-full.js').replace('</script','<\\/script')+'\n'+rd('p3d/char3d.js')+'\n'+rd('q3d/q3d.js')+'</script>\n'
core=''.join(rd('src/core/'+f) for f in sorted(os.listdir(P('src/core'))) if f.endswith('.js'))
# datos: data/*.json → const DATA (se comprueban antes: scripts/datos.py)
sys.path.insert(0,P('scripts'));import datos
data=datos.cargar();bad=datos.comprobar(data)
if bad:print('\n'.join('✗ '+e for e in bad));print('DATA_FAIL');sys.exit(1)
assert core.count('// <<DATA>>\n')==1,'falta el ancla de datos'
core=core.replace('// <<DATA>>\n','const DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n',1)
mods='// <<B3D>>\n'+''.join(rd('mods/'+m) for m in cfg['mods'])+'// <</B3D>>\n'
assert core.count('// <<B3D>>\n')==1,'falta el ancla de módulos'
html=head+lib+core.replace('// <<B3D>>\n',mods,1)+rd('src/tail.html')
# sintaxis del script principal
i=html.index('<script>\n(() => {');j=html.index('</script>',i)
import tempfile
chk=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8');chk.write(html[i+8:j]);chk.close()  # nombre propio: varios builds a la vez no se pisan
bad=subprocess.run(['node','--check',chk.name]).returncode;os.unlink(chk.name)
if bad:print('SYNTAX_FAIL');sys.exit(1)
if '--check' in sys.argv:print('SYNTAX_OK');sys.exit(0)
open(P('casita.html'),'w',encoding='utf-8').write(html)
# PWA
v=time.strftime('%Y%m%d-%H%M')
pw='''<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#3b3247"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="apple-touch-icon" href="apple-touch-icon.png">'''
out=html.replace('<meta charset="utf-8">','<meta charset="utf-8">'+pw,1)
reg=rd('pwa/register.html')
out=out.replace('</body>',reg+'</body>',1)
open(P('index.html'),'w',encoding='utf-8').write(out)
sw=re.sub(r"const V='[^']*'","const V='%s'"%v,rd('pwa/sw.js'));open(P('sw.js'),'w',encoding='utf-8').write(sw)
print('casita.html',len(html),'· index.html',len(out),'· sw',v)
