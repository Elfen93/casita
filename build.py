#!/usr/bin/env python3
"""Casita · build
   python3 build.py          → casita.html (desarrollo) e index.html (PWA, lo que sirve GitHub Pages)
   python3 build.py --check  → solo comprueba sintaxis
Fuentes: src/head.html + libs (p3d/, q3d/q3d.js) + src/core/*.js (en orden) con mods/*.js (orden en build.json) + src/tail.html
"""
import re,os,sys,json,subprocess,time
R=os.path.dirname(os.path.abspath(__file__));P=lambda *a:os.path.join(R,*a)
rd=lambda p:open(P(p),encoding='utf-8').read()
cfg=json.load(open(P('build.json')))
head=rd('src/head.html').replace('/*<<PHCSS>>*/','/*<<PHCSS>>*/'+rd('mods/movil.css')+'/*<</PHCSS>>*/',1)
lib='<script id="lib3d">'+rd('p3d/three-full.js').replace('</script','<\\/script')+'\n'+rd('p3d/char3d.js')+'\n'+rd('q3d/q3d.js')+'</script>\n'
core=''.join(rd('src/core/'+f) for f in sorted(os.listdir(P('src/core'))) if f.endswith('.js'))
mods='// <<B3D>>\n'+''.join(rd('mods/'+m) for m in cfg['mods'])+'// <</B3D>>\n'
assert core.count('// <<B3D>>\n')==1,'falta el ancla de módulos'
html=head+lib+core.replace('// <<B3D>>\n',mods,1)+rd('src/tail.html')
# sintaxis del script principal
i=html.index('<script>\n(() => {');j=html.index('</script>',i)
open('/tmp/_casita_check.js','w').write(html[i+8:j])
if subprocess.run(['node','--check','/tmp/_casita_check.js']).returncode:print('SYNTAX_FAIL');sys.exit(1)
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
