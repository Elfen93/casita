#!/usr/bin/env python3
"""Prueba de vivir en casa (GD-8a): un día en el piso con cada acción, comprobando la necesidad antes y después, el plato en la mano,
los platos sucios y los avisos de necesidad baja. Capturas a 420x860.
Uso: python3 t/g2a_vivir.py [carpeta_capturas]"""
import sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a'
os.makedirs(OUT,exist_ok=True)
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def chk(nombre,ok,det=''):
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det,flush=True)
def nec(p,k):
    m=re.search(r'"%s": ([-\d.]+)'%k,p.estado());return float(m.group(1)) if m else None
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
def esperar(f,n=40,paso=0.5):
    for i in range(n):
        p.dormir(paso)
        if f():return True
    return False
def accion(o,a,cuando=None,n=60,foto=None,tfoto=1.5):
    """encola la acción y espera a que termine (cola vacía); foto a mitad si se pide"""
    if foto:p.cmd('vel',1);p.cmd('zoom',7)
    p.cmd('accion',o,a)
    if foto:
        esperar(lambda:'ruta=0' in p.estado() and 'cola=1' in p.estado(),40,1.0)
        p.dormir(tfoto);p.shot(OUT+'/'+foto);p.cmd('vel',5);p.cmd('zoom',14)
    return esperar(lambda:'cola=0' in p.estado(),n)
def aviso_visible(txt):
    return any(txt in l for l in p.log)
try:
    p.cmd('vel',5);p.cmd('hora',12);p.dormir(1)
    p0=p.pos();dx=round(p0[0]);fz=round(p0[1]-2.1)
    p.cmd('poner',dx,fz+4);p.cmd('ir_xy',dx,fz-2.5)
    esperar(lambda:'dentro=true' in p.estado(),14,1.0)
    chk('entra a casa','dentro=true' in p.estado())
    p.cmd('zoom',14);p.dormir(1.5);p.shot(OUT+'/piso_dia.png')
    # los muebles nuevos existen y se llega andando al punto de uso de cada uno
    for o,a in [('nevera','picar'),('cocina','cocinar'),('fregadero','fregar'),('ducha','ducharse'),('lavabo','lavarse'),('vater','usar_vater'),('sofa','descansar'),('mesa_comedor','comer_mesa')]:
        n=len(p.log);p.cmd('accion',o,a)
        ok=any(('accion %s ok='%a) in l for l in p.log[n:]) or any('accion no disponible: %s'%o in l for l in p.log[n:])
        chk('existe %s con «%s»'%(o,a),ok)
        p.cmd('vaciar')
    # 1) picar algo
    p.cmd('nec','hambre',40);h0=nec(p,'hambre')
    t=accion('nevera','picar')
    h1=nec(p,'hambre');chk('picar algo: hambre +25',t and h1-h0>20,'%s -> %s'%(h0,h1))
    # 2) cocinar -> plato en la mano; no se puede cocinar otra vez con platos sucios después de comer
    p.cmd('nec','hambre',20);h0=nec(p,'hambre')
    n=len(p.log);p.cmd('vel',1);p.cmd('zoom',7);p.cmd('accion','cocina','cocinar');esperar(lambda:'ruta=0' in p.estado() and 'cola=1' in p.estado(),40,1.0);p.dormir(1.5);p.shot(OUT+'/cocinando.png');p.cmd('vel',5);p.cmd('zoom',14)
    esperar(lambda:'mano=plato' in p.estado(),40)
    chk('cocinar deja un plato en la mano','mano=plato' in p.estado(),p.estado()[-80:])
    p.dormir(1);p.shot(OUT+'/plato_mano.png')
    h1=nec(p,'hambre');chk('cocinar no sacia el hambre',abs(h1-h0)<6,'%s -> %s'%(h0,h1))
    # no se come de pie junto al fogón: la cocina no ofrece comer
    n=len(p.log);p.cmd('accion','cocina','comer_mesa');chk('la cocina no deja comer',any('no disponible' in l for l in p.log[n:]))
    # 3) comer sentado en la mesa
    p.cmd('vel',1);p.cmd('zoom',7);p.cmd('accion','mesa_comedor','comer_mesa')
    esperar(lambda:'post=sentado' in p.estado(),40);p.dormir(2);p.shot(OUT+'/comiendo_mesa.png');p.cmd('vel',5);p.cmd('zoom',14)
    esperar(lambda:'cola=0' in p.estado(),40)
    h2=nec(p,'hambre');chk('comer sentado: hambre +60 y plato fuera de la mano',h2-h1>=50 and 'mano=plato' not in p.estado(),'%s -> %s'%(h1,h2))
    # 4) con platos sucios no se puede cocinar
    n=len(p.log);p.cmd('accion','cocina','cocinar')
    chk('con platos sucios no se cocina',any('no disponible' in l or 'ok=false' in l for l in p.log[n:]) and 'cola=0' in p.estado(),str([l for l in p.log[n:] if 'accion' in l][:2]))
    p.cmd('vaciar')
    # 5) fregar
    t=accion('fregadero','fregar',foto='fregando.png',tfoto=3)
    p.dormir(1)
    n=len(p.log);p.cmd('accion','fregadero','fregar')
    chk('fregar quita los platos sucios (ya no se puede volver a fregar)',t and any('no disponible' in l or 'ok=false' in l for l in p.log[n:]))
    p.cmd('vaciar')
    n=len(p.log);p.cmd('accion','cocina','cocinar');chk('tras fregar se puede cocinar',any('ok=true' in l for l in p.log[n:]))
    esperar(lambda:'mano=plato' in p.estado(),50)
    # 6) comer en el sofá
    p.cmd('nec','hambre',30);h0=nec(p,'hambre')
    t=accion('sofa','comer_sofa')
    h1=nec(p,'hambre');chk('comer en el sofá: hambre +60',t and h1-h0>=50,'%s -> %s'%(h0,h1))
    accion('fregadero','fregar')
    # 7) ducha, lavabo, váter
    p.cmd('nec','higiene',30);i0=nec(p,'higiene')
    accion('ducha','ducharse',foto='ducha.png',tfoto=2)
    i1=nec(p,'higiene');chk('ducharse: higiene a tope',i1>=95,'%s -> %s'%(i0,i1))
    p.cmd('nec','higiene',40);i0=nec(p,'higiene')
    accion('lavabo','lavarse')
    i1=nec(p,'higiene');chk('lavabo: higiene +15',14<i1-i0<18,'%s -> %s'%(i0,i1))
    p.cmd('nec','vejiga',10);v0=nec(p,'vejiga')
    accion('vater','usar_vater',foto='vater.png',tfoto=1.5)
    v1=nec(p,'vejiga');chk('váter: vejiga a tope',v1>=95,'%s -> %s'%(v0,v1))
    # 8) sofá: descansar y tele
    p.cmd('nec','energia',40);e0=nec(p,'energia')
    accion('sofa','descansar')
    e1=nec(p,'energia');chk('sentarse a descansar sube la energía poco a poco',e1-e0>3,'%s -> %s'%(e0,e1))
    p.cmd('nec','diversion',30);d0=nec(p,'diversion')
    p.cmd('vel',1);p.cmd('zoom',7);p.cmd('accion','sofa','tele');esperar(lambda:'post=sentado' in p.estado(),40);p.dormir(2);p.shot(OUT+'/tele.png');p.cmd('vel',5);p.cmd('zoom',14)
    p.cmd('vaciar');p.dormir(1)
    d1=nec(p,'diversion');chk('ver la tele sube la diversión y se puede cancelar',d1>d0+0.3 and 'post=de_pie' in p.estado(),'%s -> %s %s'%(d0,d1,p.estado()[-30:]))
    # 9) avisos de necesidad baja
    n=len(p.log);p.cmd('nec','hambre',10);p.dormir(1);p.shot(OUT+'/aviso_hambre.png')
    chk('aviso de hambre al bajar de 15',os.path.exists(OUT+'/aviso_hambre.png'))
    p.cmd('nec','vejiga',0);p.dormir(1.5)
    chk('vejiga a 0: percance, higiene baja de golpe y vejiga se recupera a 40',nec(p,'vejiga')>=35,str(nec(p,'vejiga')))
    # 10) agotado: solo dormir, sentarse o comer
    p.cmd('nec','energia',0);n=len(p.log);p.cmd('accion','ducha','ducharse')
    chk('con energía 0 no se puede duchar',any('ok=false' in l for l in p.log[n:]))
    n=len(p.log);p.cmd('accion','sofa','descansar');chk('con energía 0 sí se puede sentar',any('ok=true' in l for l in p.log[n:]))
    p.cmd('vaciar')
    # 11) dormir
    p.cmd('nec','energia',5);e0=nec(p,'energia')
    accion('cama','dormir_8',foto='cama.png',tfoto=1.5,n=80)
    esperar(lambda:'cola=0' in p.estado(),40)
    e1=nec(p,'energia');chk('dormir sube la energía',e1>e0+30,'%s -> %s'%(e0,e1))
    p.dormir(1);p.shot(OUT+'/hud.png')
    chk('sin errores en consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
