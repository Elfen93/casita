#!/usr/bin/env python3
"""Prueba automática de la exportación Godot (play3d/): diagonal por un solar, entrar al bar andando, pedir caña, sentarse y beber, preparar cóctel.
Uso: python3 t/g2a_prueba.py [carpeta_capturas]   (sirve play3d/ en un puerto libre)"""
import sys,os,time,subprocess,re,socket
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a'
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def chk(nombre,ok,det=''):
    R.append(ok);print(('OK   ' if ok else 'FALLA'),nombre,det)
def nec(p,k):
    m=re.search(r'"%s": ([-\d.]+)'%k,p.estado());return float(m.group(1)) if m else None
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
try:
    p.cmd('vel',5)
    # 1) diagonal por el solar grande del este (x 288..342, z 24..78): de la esquina SO a la NE, sin pasar por la calle
    p.cmd('poner',292,76);p.cmd('ir_xy',338,28)
    xs=[]
    for i in range(14):
        p.dormir(1.0);xs.append(p.pos())
    fin=p.pos();print('solar',xs[::3],fin)
    en_diag=all(288<=q[0]<=342 and 24<=q[1]<=78 for q in xs if q)
    chk('diagonal por el solar sin seguir la calle',en_diag and fin and abs(fin[0]-338)<3 and abs(fin[1]-28)<3,str(fin))
    p.shot(OUT+'/t_solar.png')
    # 2) al bar: viernes 20:00
    p.cmd('dia',4);p.cmd('hora',20);p.dormir(2)
    p.cmd('poner',231,152);p.cmd('ir_xy',231,132)
    for i in range(12):
        p.dormir(1.0)
        if 'dentro=true' in p.estado():break
    chk('entra al bar andando por la puerta','dentro=true' in p.estado(),p.estado()[-60:])
    p.cmd('zoom',17);p.dormir(1);p.shot(OUT+'/t_bar_dentro.png')
    print(p.log[-1] if p.log else '')
    p.cmd('clientes');p.dormir(1);print([l for l in p.log if l.startswith('clientes')][-1:])
    # 3) pedir una caña
    d0=p.num('dinero')
    p.cmd('accion','barra','pedir_cana')
    for i in range(30):
        p.dormir(1.0)
        if 'mano=cana' in p.estado():break
    d1=p.num('dinero')
    chk('pedir una caña: baja el dinero y queda en la mano','mano=cana' in p.estado() and d1<d0,'%s -> %s'%(d0,d1))
    p.shot(OUT+'/t_cana.png')
    # 4) sentarse y beber
    dv0=nec(p,'diversion')
    p.cmd('accion','tab4','beber')
    p.dormir(6);p.shot(OUT+'/t_sentado.png')
    for i in range(30):
        p.dormir(1.0)
        if 'mano=,' in p.estado() or 'mano= ' in p.estado():break
    dv1=nec(p,'diversion')
    chk('sentarse y beber sube la diversión',dv1 is not None and dv1>dv0+3,'%s -> %s'%(dv0,dv1))
    # 5) trabajar: cóctel
    p.cmd('trabaja',True)
    p.cmd('accion','coctelera','preparar:mojito')
    p.dormir(4);p.shot(OUT+'/t_coctel.png')
    for i in range(40):
        p.dormir(1.0)
        if p.num('coct')>=1.0:break
    chk('con «trabajas aquí», preparar un cóctel sube cocteleria',p.num('coct')>=1.0,str(p.num('coct')))
    p.cmd('clientes');p.dormir(1);print([l for l in p.log if l.startswith('clientes')][-1:])
    print(p.estado());p.shot(OUT+'/t_final.png')
    chk('sin errores en consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
