#!/usr/bin/env python3
"""Prueba de guardar/cargar (GD-6) sobre la exportación web (play3d/). Uso: python3 t/g2a_guardar.py [carpeta_capturas]"""
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
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det)
URL='http://127.0.0.1:%d/play3d/index.html'%port
p=Pag(URL,espera=30)
def js(expr):
    r=p.send('Runtime.evaluate',{'expression':expr,'returnByValue':True});return r['result']['result'].get('value')
def recargar(seg=30):
    p.err.clear();p.send('Page.reload');p.dormir(seg)
def congelar():
    js("Storage.prototype.setItem=function(){}")  # la recarga dispara pagehide y guardaría encima del texto de prueba
def ls(k):return js('localStorage.getItem(%s)'%json.dumps(k))
def dinero():return p.num('dinero')
def minutos():return p.num('min')
try:
    VIEJA='{"intacta":true,"n":1}'
    js("localStorage.setItem('casita-save-v1',%s)"%json.dumps(VIEJA))
    # (a) cambiar hora, dinero (caña en el bar) y posición; guardar; recargar
    p.cmd('vel',1);p.cmd('dia',4);p.cmd('hora',20);p.dormir(2)
    p.cmd('poner',231,152);p.cmd('ir_xy',231,132)
    for i in range(14):
        p.dormir(1.0)
        if 'dentro=true' in p.estado():break
    p.cmd('accion','barra','pedir_cana')
    for i in range(30):
        p.dormir(1.0)
        if 'mano=cana' in p.estado():break
    for i in range(20):
        if dinero()<1000:break
        p.dormir(1.0)
    d0=dinero()
    p.cmd('poner',200,150);p.dormir(1)
    pos0=p.pos();m0=minutos()
    p.cmd('guardar');p.dormir(1)
    chk('guardar escribe la clave casita3d_partida',ls('casita3d_partida') and '"secciones"' in ls('casita3d_partida'))
    recargar()
    chk('recarga: sin errores de consola',not p.err,str(p.err[:2]))
    pos1=p.pos()
    chk('recarga: dinero igual',dinero()==d0,'%s %s'%(d0,dinero()))
    chk('recarga: hora igual (±2 min)',m0-1<=minutos()<=m0+150,'%s %s'%(m0,minutos()))
    chk('recarga: posición igual',pos0 and pos1 and abs(pos0[0]-pos1[0])<1.5 and abs(pos0[1]-pos1[1])<1.5,'%s %s'%(pos0,pos1))
    p.shot(OUT+'/g6_recuperada.png')
    # (b) guardar al ocultar la página
    p.cmd('dia',2);p.cmd('hora',11);p.cmd('poner',150,100);p.dormir(1)
    m1=minutos();pos2=p.pos()
    p.send('Emulation.setFocusEmulationEnabled',{'enabled':False})
    p.send('Page.setWebLifecycleState',{'state':'frozen'}) if False else None
    js("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))")
    p.dormir(1)
    g=json.loads(ls('casita3d_partida'))
    chk('ocultar la página escribe la partida (antes de recargar)',abs(g['secciones']['reloj']['minutos']-m1)<=150 and g['secciones']['reloj']['minutos']>=m1-1,str(g['secciones']['reloj']))
    js("Object.defineProperty(document,'hidden',{value:false,configurable:true})")
    recargar()
    chk('ocultar la página guarda',m1-1<=minutos()<=m1+150 and p.pos() and abs(p.pos()[0]-pos2[0])<1.5,'%s %s'%(m1,minutos()))
    # (c) texto corrupto
    TXT='{"v":1,"secciones":{"reloj":{"minu'
    js("localStorage.setItem('casita3d_partida',%s);localStorage.removeItem('casita3d_partida_rota')"%json.dumps(TXT))
    congelar();recargar()
    chk('corrupto: sin errores de consola',not p.err,str(p.err[:2]))
    chk('corrupto: copia en _rota',ls('casita3d_partida_rota')==TXT)
    chk('corrupto: partida nueva (09:00 del día 1)',minutos() is not None and minutos()<600,str(minutos()))
    # sección desconocida y campos que faltan
    js("localStorage.setItem('casita3d_partida',%s)"%json.dumps(json.dumps({"v":1,"secciones":{"reloj":{"v":1,"minutos":3000},"inventada":{"v":9,"x":1}}})))
    congelar();recargar()
    chk('sección desconocida y campos ausentes: carga lo que hay',minutos() is not None and 2990<=minutos()<=3010 and not p.err,str(minutos()))
    # (d) partida nueva desde el menú
    p.cmd('guardar')
    p.dormir(1);p.shot(OUT+'/g6_hud.png')
    # abrir menú tocando el botón (esquina sup. der., y≈165)
    def tocar(x,y):
        for t in ('mousePressed','mouseReleased'):
            p.send('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':'left','clickCount':1});p.dormir(0.2)
    tocar(340,165);p.dormir(1);p.shot(OUT+'/g6_menu.png')
    tocar(210,448);p.dormir(1);p.shot(OUT+'/g6_confirmar.png')  # «Partida nueva»
    tocar(210,419);p.dormir(2);p.dormir(25)
    chk('menú: «Sí, empezar de cero» borra y reinicia',ls('casita3d_partida') is None and minutos()<600,str(minutos()))
    # (e) la clave antigua no se toca
    chk('casita-save-v1 intacta',ls('casita-save-v1')==VIEJA)
    # guardar ahora desde el menú
    tocar(340,165);p.dormir(1);tocar(210,388);p.dormir(1);p.shot(OUT+'/g6_guardado.png')
    chk('menú: «Guardar ahora» escribe la partida',ls('casita3d_partida') is not None)
finally:
    p.cerrar();srv.kill()
print('RESULTADO %s %d / %d'%('OK' if all(R) else 'FALLA',sum(R),len(R)))
