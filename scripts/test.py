#!/usr/bin/env python3
"""Casita · tests headless
   python3 scripts/test.py t/t_reg.js [segundos]   → monta la página de prueba y la corre en Chrome headless, imprime el título (OK/ERR …)
   python3 scripts/test.py all                      → los de regresión (t_reg, t_casa)
Cada t/*.js es un trozo de JS que se inyecta antes del loop principal y escribe el resultado en document.title.
"""
import sys,os,subprocess
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=lambda *a:os.path.join(R,*a)
def run(tf,secs):
    src=open(P('casita.html'),encoding='utf-8').read();test=open(P(tf),encoding='utf-8').read()
    src=src.replace("<script>\n(() => {","<script>window.__errs=[];window.onerror=(m,u,l,c,e)=>{window.__errs.push(m+' @'+l+':'+c+' '+(e&&e.stack||'').slice(0,300));};</script>\n<script>\n(() => {",1)
    anchor="requestAnimationFrame(loop);\naddEventListener('visibilitychange'";assert src.count(anchor)==1
    out=P('t','_run_'+os.path.basename(tf).replace('.js','.html'));open(out,'w',encoding='utf-8').write(src.replace(anchor,test+"\n"+anchor))
    r=subprocess.run([sys.executable,P('t','cdp2.py'),'file://'+out,str(secs)],capture_output=True,text=True,timeout=secs+120)
    print(os.path.basename(tf),'→',(r.stdout.strip() or r.stderr.strip())[:600]);return r.stdout.startswith('OK')
if __name__=='__main__':
    a=sys.argv[1:]
    if not a or a[0]=='all':ok=all([run('t/t_reg.js',400),run('t/t_casa.js',120)]);sys.exit(0 if ok else 1)
    sys.exit(0 if run(a[0],float(a[1]) if len(a)>1 else 60) else 1)
