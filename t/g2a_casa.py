#!/usr/bin/env python3
"""Prueba automática de tu piso por dentro (GD-5): entrar andando desde la calle, ir a las tres estancias, dormir en la cama,
salir andando y comprobar que el bar sigue vivo (pedir una caña).
Uso: python3 t/g2a_casa.py [carpeta_capturas]   (sirve play3d/ en un puerto libre)"""
import sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a'
os.makedirs(OUT,exist_ok=True)
CASA=json.load(open(RAIZ+'/data/interiores.json'))['interiores']['casa']
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def chk(nombre,ok,det=''):
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det)
def nec(p,k):
    m=re.search(r'"%s": ([-\d.]+)'%k,p.estado());return float(m.group(1)) if m else None
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
try:
    p.cmd('vel',5);p.cmd('hora',12);p.dormir(1)
    p0=p.pos();dx=round(p0[0]);fz=round(p0[1]-2.1)   # el jugador empieza fuera, 1,5 m delante de la fachada
    chk('empieza fuera, en la puerta de casa','dentro=false' in p.estado(),str(p0))
    p.cmd('zoom',22);p.dormir(1);p.shot(OUT+'/casa_fuera.png')
    # 1) entrar andando desde la calle (por la puerta, sin atravesar la fachada)
    p.cmd('poner',dx,fz+4);p.cmd('ir_xy',dx,fz-2.5)
    for i in range(14):
        p.dormir(1.0)
        if 'dentro=true' in p.estado():break
    q=p.pos()
    chk('entra a casa andando','dentro=true' in p.estado() and abs(q[0]-dx)<1.5 and q[1]<fz,str(q))
    p.cmd('zoom',13);p.dormir(1.5);p.shot(OUT+'/casa_dia.png')
    # 2) las tres estancias
    for nombre,(x0,z0,x1,z1) in CASA['estancias'].items():
        cx=dx+(x0+x1)/2;cz=fz-(z0+z1)/2
        if nombre=='salon':cx=dx+1.0;cz=fz-3.0
        if nombre=='dormitorio':cx=dx+4.5;cz=fz-5.0
        p.cmd('ir_xy',cx,cz)
        for i in range(20):
            p.dormir(1.0)
            if 'ruta=0' in p.estado():break
        q=p.pos()
        dentro=q and dx+x0<=q[0]<=dx+x1 and fz-z1<=q[1]<=fz-z0
        chk('anda hasta '+nombre,dentro and abs(q[0]-cx)<1.2 and abs(q[1]-cz)<1.2,'%s -> %s'%((cx,cz),q))
        if nombre=='bano':p.shot(OUT+'/casa_bano.png')
    # 3) dormir en la cama
    e0=nec(p,'energia');m0=p.num('min')
    p.cmd('accion','cama','siesta')
    visto=False
    for i in range(40):
        p.dormir(0.5)
        if i==1:p.shot(OUT+'/casa_cama.png')
        if nec(p,'energia') and nec(p,'energia')>e0+5:break
    p.dormir(2)
    e1=nec(p,'energia');m1=p.num('min')
    chk('dormir en la cama sube la energía y avanza el reloj',e1>e0+5 and (m1-m0)>=50,'energía %s -> %s, min %s -> %s'%(e0,e1,m0,m1))
    p.cmd('hora',22);p.dormir(2);p.shot(OUT+'/casa_noche.png')
    # 4) salir andando a la calle
    p.cmd('ir_xy',dx,fz+4)
    for i in range(25):
        p.dormir(1.0)
        if 'dentro=false' in p.estado() and 'ruta=0' in p.estado():break
    q=p.pos()
    chk('sale andando a la calle','dentro=false' in p.estado() and q[1]>fz,str(q))
    p.cmd('zoom',30);p.dormir(1);p.shot(OUT+'/casa_bloque.png')
    # 5) el bar sigue vivo
    p.cmd('dia',4);p.cmd('hora',20);p.dormir(2)
    p.cmd('poner',231,152);p.cmd('ir_xy',231,132)
    for i in range(14):
        p.dormir(1.0)
        if 'dentro=true' in p.estado():break
    chk('entra al bar andando','dentro=true' in p.estado(),p.estado()[-60:])
    p.cmd('zoom',17);p.dormir(1);p.shot(OUT+'/bar_dentro.png')
    d0=p.num('dinero');p.cmd('accion','barra','pedir_cana')
    for i in range(30):
        p.dormir(1.0)
        if 'mano=cana' in p.estado():break
    chk('pide una caña en el bar','mano=cana' in p.estado() and p.num('dinero')<d0)
    chk('sin errores en consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
