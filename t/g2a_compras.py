#!/usr/bin/env python3
"""Prueba de COMPRAS Y COMIDA: ir al súper, cesta y total (también con el dedo), volver a casa con la bolsa en brazos y
guardarla sola en la nevera, cocinar recetas por niveles (gasta ingredientes, deja sobras con fecha), comer las sobras,
caducar y tirar, sin ingredientes -> súper o domicilio, el rider que llega andando, menú del día en el bar, comer en el
súper, nutrición y guardado. Capturas a 420x860.
Uso: python3 t/g2a_compras.py [carpeta_capturas]"""
import sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a_compras'
os.makedirs(OUT,exist_ok=True)
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
C=json.load(open(RAIZ+'/data/comida.json'))
R=[]
def chk(nombre,ok,det=''):
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det,flush=True)
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
def esperar(f,n=40,paso=0.5):
    for i in range(n):
        p.dormir(paso)
        if f():return True
    return False
def salida(pref,*a,espera=0.6):
    n=len(p.log);p.cmd(*a,espera=espera)
    for l in p.log[n:]:
        if l.startswith(pref):return l
    return ''
def comida():return salida('comida:','comida')
def nec(k):
    m=re.search(r'"%s": ([-\d.]+)'%k,p.estado());return float(m.group(1)) if m else None
def dinero():
    m=re.search(r'dinero=([-\d.]+)',p.estado());return float(m.group(1)) if m else None
def cant(prod):
    t=0
    for l in re.findall(r'(\S+):(\d+):(-?\d+)',comida().split('despensa=')[-1]):
        if l[0]==prod:t+=int(l[1])
    return t
def accion(o,a,n=60):
    l=salida('accion','accion',o,a)
    if 'ok=true' not in l:return False,l
    return esperar(lambda:'cola=0' in p.estado(),n),l
def toque(x,y):
    for t,pts in (('touchStart',[{'x':x,'y':y,'id':1}]),('touchEnd',[])):
        p.n+=1;p.ws.send(json.dumps({'id':p.n,'method':'Input.dispatchTouchEvent','params':{'type':t,'touchPoints':pts}}))
    p.dormir(2.0)
def ui():
    d={}
    for kv in salida('super_ui:','super_ui').split()[1:]:
        k,_,v=kv.partition('=');d[k]=v
    return d
try:
    p.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
    p.cmd('vel',5);p.cmd('hora',10);p.dormir(1)
    c0=comida()
    chk('partida nueva: despensa inicial',all(cant(k)>0 for k,_ in C['inicial']),c0[:200])
    # 1) al súper andando
    # la máquina de pruebas va a 2 fps: se empieza en la puerta (andar por la calle ya lo prueban otras)
    p.cmd('a_puerta','super');p.dormir(2);p.cmd('ir','super')
    chk('el súper abre su panel al llegar',esperar(lambda:'pagar=' in salida('super_ui:','super_ui'),30,1.0))
    p.dormir(1);p.shot(OUT+'/super_pan.png')
    d0=dinero()
    # con el dedo: un «+» de la primera fila (pan)
    u=ui();m=u.get('mas:0','')
    if m:
        x,y,w,h=map(int,m.split(','));toque(x+w//2,y+h//2)
    chk('un toque en «+» echa a la cesta',ui().get('n')=='1',str(m))
    for k,n in [('lentejas',1),('arroz',1),('pollo',1),('cebolla',1),('tomates',1),('lechuga',1),('cerveza',1),('manzanas',1)]:
        p.cmd('cesta',k,n,espera=0.2)
    p.cmd('seccion','fresco');p.dormir(1);p.shot(OUT+'/super_fresco.png')
    tot=sum(C['productos'][k]['precio'] for k in ['lentejas','arroz','pollo','cebolla','tomates','lechuga','cerveza','manzanas'])+(C['productos']['pan']['precio'] if m else 0)
    p.cmd('pagar')
    chk('al pagar sale con la bolsa en brazos',esperar(lambda:'mano=bolsa' in comida() and 'carga=true' in comida(),40),comida()[:120])
    d1=dinero();chk('cobra el total de la cesta',abs((d0-d1)-tot)<0.05,'%.2f vs %.2f'%(d0-d1,tot))
    chk('vuelve andando a casa',esperar(lambda:'ruta=0' not in p.estado(),20,1.0))
    p.cmd('vel',1);p.cmd('zoom',8);p.dormir(3);p.shot(OUT+'/vuelve_con_bolsa.png');p.cmd('vel',5);p.cmd('zoom',14)
    p.cmd('a_puerta','casa');p.dormir(1);p.cmd('ir','casa')
    chk('guarda la compra en la nevera al llegar a casa',esperar(lambda:'bolsa=0' in comida() and 'mano= ' in comida(),90,1.0),comida()[:140])
    chk('la despensa tiene lo comprado con fecha',cant('lentejas')==10 and cant('pollo')==2,comida()[-300:])
    p.dormir(1);p.shot(OUT+'/en_casa.png')
    # 2) cocinar por niveles
    l=salida('accion','accion','cocina','cocinar:lentejas')
    chk('las lentejas piden nivel 1',"ok=false" in l and 'sale' in l,l)
    p.cmd('hab_cocina',2)
    p.cmd('nec','hambre',20)
    lent0=cant('lentejas')
    p.cmd('vel',1);p.cmd('zoom',7);p.cmd('accion','cocina','cocinar:lentejas')
    esperar(lambda:'ruta=0' in p.estado() and 'cola=1' in p.estado(),40,1.0);p.dormir(2);p.shot(OUT+'/cocinando_lentejas.png');p.cmd('vel',5);p.cmd('zoom',14)
    chk('cocinar deja el plato en la mano',esperar(lambda:'mano=plato:lentejas' in comida(),80),comida()[:150])
    cc=comida()
    chk('gasta ingredientes y deja 3 raciones de sobras',lent0-cant('lentejas')==3 and 'sobras:lentejas:3' in cc,cc[-250:])
    h1=nec('hambre')
    p.cmd('vel',1);p.cmd('zoom',7);p.cmd('accion','mesa_comedor','comer_mesa');esperar(lambda:'post=sentado' in p.estado(),40);p.dormir(2);p.shot(OUT+'/comiendo_lentejas.png');p.cmd('vel',5);p.cmd('zoom',14)
    esperar(lambda:'cola=0' in p.estado(),40)
    h2=nec('hambre');chk('las lentejas llenan +70',h2-h1>=60,'%s -> %s'%(h1,h2))
    chk('cuenta para la nutrición','hoy={ }' not in comida() and 'hoy={}' not in comida(),comida()[:120])
    accion('fregadero','fregar')
    # 3) sobras
    ok,l=accion('nevera','sobras')
    chk('calentar sobras: plato en la mano',ok and 'mano=plato:lentejas' in comida(),l)
    p.cmd('nec','hambre',30);h1=nec('hambre')
    accion('sofa','comer_sofa')
    chk('comer las sobras en el sofá',nec('hambre')-h1>=60 and 'sobras:lentejas:2' in comida(),comida()[-200:])
    accion('fregadero','fregar')
    # 4) caducar y tirar
    m=re.search(r'dia=(\d+)',comida());d=int(m.group(1))
    p.cmd('dia',d+5);p.dormir(2)
    ok,l=accion('nevera','tirar_caducado')
    chk('tirar lo caducado',ok and 'pollo:' not in comida(),comida()[-250:])
    p.cmd('menu_obj','nevera');p.dormir(1);p.shot(OUT+'/menu_nevera.png')
    p.cmd('ver_despensa');p.dormir(1);p.shot(OUT+'/despensa.png')
    p.cmd('recetas');p.dormir(1);p.shot(OUT+'/recetas.png')
    # 5) sin ingredientes: súper o domicilio
    p.cmd('despensa_vaciar')
    l=salida('menu_obj:','menu_obj','cocina')
    chk('sin ingredientes la cocina propone súper y domicilio','Ir al súper' in l and 'domicilio' in l,l)
    p.dormir(1);p.shot(OUT+'/sin_comida.png')
    bs=l.split(': ',1)[1].split(' | ')
    i=[k for k,b in enumerate(bs) if 'domicilio' in b][0]
    d0=dinero();p.cmd('boton',i);p.dormir(1)
    chk('pedir a domicilio cobra pedido y envío',abs((d0-dinero())-(C['domicilio']['pedido']+C['domicilio']['envio']))<0.05)
    chk('llega el rider andando',esperar(lambda:'pedido=anda' in comida(),60,0.5),comida()[:120])
    p.cmd('vel',1);p.cmd('zoom',16);p.dormir(4);p.shot(OUT+'/rider.png');p.cmd('vel',5)
    chk('la jugadora recoge la comida en la puerta',esperar(lambda:'mano=plato:domicilio' in comida(),80,1.0),comida()[:140])
    p.dormir(1);p.shot(OUT+'/recoge_pedido.png');p.cmd('zoom',14)
    p.cmd('nec','hambre',30);h1=nec('hambre')
    accion('mesa_comedor','comer_mesa')
    chk('la comida a domicilio llena',nec('hambre')-h1>=45)
    chk('el rider se va',esperar(lambda:'pedido=-' in comida(),60,1.0),comida()[:120])
    # 6) menú del día en el bar (entre semana, a las 14)
    m=re.search(r'dia=(\d+)',comida());d=int(m.group(1));d=d+(7-d%7)  # lunes
    p.cmd('dia',d);p.cmd('hora',13.5);p.dormir(2)
    p.cmd('poner',231,152);p.cmd('ir_xy',231,132);esperar(lambda:'dentro=true' in p.estado(),30,1.0);p.dormir(4)
    d0=dinero()
    l=salida('accion','accion','barra','pedir_menu')
    ok='ok=true' in l and esperar(lambda:'mano=menu' in comida(),60)
    chk('pedir el menú del día en la barra',ok,l)
    p.cmd('nec','hambre',30);h1=nec('hambre')
    p.cmd('vel',1);p.cmd('zoom',8);p.cmd('accion','s1a','comer_sentado');esperar(lambda:'post=sentado' in p.estado(),40);p.dormir(2);p.shot(OUT+'/menu_bar.png');p.cmd('vel',5)
    esperar(lambda:'cola=0' in p.estado(),40)
    chk('el menú llena y cuesta 13,50',nec('hambre')-h1>=60 and abs(d0-dinero()-13.5)<0.05,'%s %s'%(nec('hambre'),d0-dinero()))
    p.cmd('hora',18);p.dormir(1)
    l=salida('accion','accion','barra','pedir_menu')
    chk('fuera de hora no hay menú','13:00' in l,l)
    p.cmd('menu_obj','barra');p.dormir(1);p.shot(OUT+'/barra_tarde.png')
    # 7) comer en el súper
    p.cmd('hora',11);p.cmd('a_puerta','super');p.dormir(1);p.cmd('ir','super');esperar(lambda:'pagar=' in salida('super_ui:','super_ui'),30,1.0)
    p.cmd('nec','hambre',30);h1=nec('hambre')
    p.cmd('comer_super');esperar(lambda:'pagar=' not in salida('super_ui:','super_ui') and nec('hambre')>h1+30,40,1.0)
    chk('comer en el súper',nec('hambre')-h1>=40)
    # 8) guardado: despensa con fechas, sobras, nutrición
    p.cmd('despensa_dar','huevos',1);p.cmd('despensa_dar','pollo',1)
    c1=comida()
    p.cmd('guardar');p.dormir(1)
    r=p.send('Runtime.evaluate',{'expression':'localStorage.getItem("casita3d_partida")','returnByValue':True})
    js=json.loads(r['result']['result']['value'])
    sec=js['secciones'].get('comida',{})
    chk('se guarda la sección comida',sec.get('v')==1 and any(l['p']=='pollo' and l['cad']>=0 for l in sec.get('despensa',[])),str(sec)[:200])
    p.send('Page.reload');p.dormir(30)
    c2=comida()
    chk('al cargar vuelve la despensa',c2.split('despensa=')[-1]==c1.split('despensa=')[-1] and re.search(r'nut=[\d.]+',c1).group(0)==re.search(r'nut=[\d.]+',c2).group(0),c2[-200:])
    chk('sin errores de consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('%d/%d'%(sum(R),len(R)))
sys.exit(0 if all(R) else 1)
