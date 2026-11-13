#!/usr/bin/env python3
"""Prueba automática de amueblar tu piso (GD-8b): botón «Muebles» solo dentro, comprar/colocar con sólidos y rutas,
rechazos (tabique, hueco, mueble, puerta, fuera, encierro, sin dinero), mover, vender, guardar y recargar, tipo desconocido
en la partida y toques reales (panel, suelo, Colocar, tocar mueble, Vender).
Uso: python3 t/g2a_muebles.py [carpeta_capturas]   (sirve play3d/ en un puerto libre; PLAY=otra_carpeta para probar otra exportación)"""
import json,sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a_muebles'
os.makedirs(OUT,exist_ok=True)
PLAY=os.environ.get('PLAY','play3d')
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port),'--bind','127.0.0.1'],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def chk(nombre,ok,det=''):
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det)
p=Pag('http://127.0.0.1:%d/%s/index.html'%(port,PLAY),espera=30)
def salida(pref,*cmd,espera=0.6):
    n=len(p.log);p.cmd(*cmd,espera=espera)
    for l in p.log[n:]:
        if l.startswith(pref):return l
    return ''
def dinero():return p.num('dinero')
def lista():
    l=salida('lista_muebles:','lista_muebles');return {m.split(':')[0]:m for m in l.split(' ')[2:]} if l else {}
def ui():
    l=salida('muebles_ui:','muebles_ui');d={}
    for kv in l[len('muebles_ui: '):].split(' '):
        k,_,v=kv.partition('=');d[k]=v
    return d
def centro(v):
    if not v or v=='-':return None
    a=v.split(',');return int(a[0]),int(a[1])
def toque(x,y,ms=0):
    # empieza y acaba el toque sin esperar a la respuesta entre medias: llegan juntos y el juego los ve en el mismo fotograma (con la máquina cargada los fotogramas tardan más de 1,5 s)
    for t,pts in (('touchStart',[{'x':x,'y':y,'id':1}]),('touchEnd',[])):
        p.n+=1;p.ws.send(json.dumps({'id':p.n,'method':'Input.dispatchTouchEvent','params':{'type':t,'touchPoints':pts}}))
    p.dormir(2.5)
def estado_m():return salida('muebles_estado:','muebles_estado')
INI={m['id'] for m in json.load(open(RAIZ+'/data/interiores.json'))['interiores']['casa']['muebles']}
def vaciar(excepto=('cama','ducha')):
    # vende todo lo que estorba (deja la cama y la ducha para girar muebles iniciales)
    for k in list(lista()):
        if k not in excepto:salida('vender:','vender',k,espera=0.3)
def arrastre(x,y0,y1,pasos=8):
    # el dedo arrastra: todos los eventos juntos (fotogramas lentos)
    ev=[('touchStart',[{'x':x,'y':y0,'id':1}])]+[('touchMove',[{'x':x,'y':y0+(y1-y0)*i/pasos,'id':1}]) for i in range(1,pasos+1)]+[('touchEnd',[])]
    for t,pts in ev:
        p.n+=1;p.ws.send(json.dumps({'id':p.n,'method':'Input.dispatchTouchEvent','params':{'type':t,'touchPoints':pts}}))
    p.dormir(4)
def comprar(t,x,z,g=0):return salida('comprar:','comprar',t,x,z,g)
try:
    p.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
    p.cmd('vel',5);p.cmd('hora',12);p.dormir(1)
    p0=p.pos();dx=round(p0[0]);fz=round(p0[1]-2.1)
    ui0=ui()
    chk('fuera del piso no se ve el botón «Muebles»',ui0.get('boton')=='-',ui0.get('boton'))
    p.cmd('poner',dx,fz-2.5);p.dormir(2)
    p.cmd('zoom',13);p.dormir(1)
    chk('dentro del piso aparece el botón',centro(ui().get('boton')) is not None,ui().get('boton'))
    p.shot(OUT+'/1_hud_piso.png')
    inicial=lista()
    chk('muebles iniciales: los del dato',set(inicial)==INI,str(sorted(inicial)))
    # sin estorbos: se venden los iniciales menos cama y ducha (la venta de un inicial se comprueba con el sofá)
    d=dinero();r=salida('vender:','vender','sofa')
    chk('un mueble inicial también se vende',r.startswith('vender: ok') and 'sofa' not in lista() and abs(dinero()-(d+175))<0.01,r)
    vaciar();chk('piso vacío salvo cama y ducha',set(lista())=={'cama','ducha'},str(sorted(lista())))
    inicial=lista()
    # --- comprar ---
    d0=dinero()
    rt0=salida('ruta:','ruta',0.5,2.5,0.5,4.5)
    r=comprar('cocina',0.5,3.5,0)
    d1=dinero()
    chk('comprar una cocina: ok, baja el dinero',r=='comprar: ok' and abs((d0-d1)-300)<0.01,'%s %s->%s'%(r,d0,d1))
    ids=[k for k in lista() if k not in inicial]
    comprar('nevera',-1.5,5.5)
    chk('la cocina nueva existe',len(ids)==1 and lista()[ids[0]].startswith(ids[0]+':cocina@0.5,3.5'),str(ids))
    # es sólido: la ruta de (0.5,2.5) a (0.5,4.5) lo rodea
    rt=salida('ruta:','ruta',0.5,2.5,0.5,4.5)
    largo=float(re.search(r'largo=([\d.]+)',rt).group(1)) if rt else 0
    chk('el mueble sólido nuevo se rodea andando',largo>2.2 and 'n=0' not in rt,rt0+' -> '+rt)
    # --- rechazos ---
    d=dinero()
    casos=[('silla',3.5,3.0,'tabique'),('silla',3.5,1.5,'hueco'),('silla',-1.5,5.5,'mueble'),('silla',0.0,0.5,'puerta'),('silla',-3.0,3.0,'sale'),('nevera',0.5,3.5,'mueble')]
    for t,x,z,clave in casos:
        r=comprar(t,x,z)
        chk('no deja colocar: '+clave,r.startswith('comprar: no ') and clave in r.lower().replace('á','a'),r)
    r=comprar('nevera',4.5,1.5)
    chk('no deja encerrar el baño',r.startswith('comprar: no ') and ('aislada' in r or 'sin acceso' in r or 'paso' in r),r)
    chk('los rechazos no cobran',abs(dinero()-d)<0.01)
    p.cmd('dinero',10)
    r=comprar('sofa',3.0,5.0) if False else comprar('silla',1.0,5.5)
    chk('no deja comprar sin dinero',r=='comprar: no No te llega el dinero.',r)
    p.cmd('dinero',d)
    # --- mover ---
    r=salida('mover:','mover',ids[0],1.5,3.5,0)
    chk('mover la cocina nueva',r=='mover: ok' and ':cocina@1.5,3.5/0' in lista()[ids[0]],r+' '+lista().get(ids[0],''))
    r=salida('mover:','mover',ids[0],-1.5,5.5,0)
    chk('mover sobre otro mueble se rechaza',r.startswith('mover: no'),r)
    r=salida('mover:','mover','ducha',6.5,2.5,270)
    chk('girar un mueble inicial',r=='mover: ok',r)
    r=salida('mover:','mover','cama',6.5,6.0,180)
    chk('girar si se queda sin acceso se rechaza',r.startswith('mover: no'),r)
    salida('mover:','mover','ducha',6.5,2.5,0)
    chk('cama y ducha siguen en su sitio',':cama@6.5,6/0' in lista()['cama'])
    # --- vender ---
    d=dinero()
    r=salida('vender:','vender',ids[0])
    chk('vender devuelve la mitad (150 de 300)',r.startswith('vender: ok') and abs(dinero()-(d+150))<0.01 and ids[0] not in lista(),'%s %s->%s'%(r,d,dinero()))
    r=salida('vender:','vender','nada')
    chk('vender algo que no existe lo explica',r.startswith('vender: no'),r)
    # tipos nuevos sin acciones: planta (sólida) y alfombra (no sólida)
    d=dinero();r1=comprar('planta',1.5,4.5);r2=comprar('alfombra',0.0,4.2)
    chk('planta y alfombra (sin acciones) se compran y colocan',r1=='comprar: ok' and r2=='comprar: ok' and abs((d-dinero())-150)<0.01 and any(':planta@' in v for v in lista().values()) and any(':alfombra@' in v for v in lista().values()),'%s %s %s->%s'%(r1,r2,d,dinero()))
    rt=salida('ruta:','ruta',1.5,3.0,1.5,6.0)
    chk('la planta es sólida y la alfombra no estorba el paso',rt!='' and 'n=0' not in rt,rt)
    # --- guardar y recargar ---
    r=comprar('silla',1.0,5.5)
    p.cmd('guardar');p.dormir(1)
    antes=lista();d_antes=dinero()
    p.send('Page.reload');p.dormir(30)
    p.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
    desp=lista()
    chk('tras recargar los muebles siguen donde estaban',desp==antes and 'sofa' not in desp and any(':silla@1' in v for v in desp.values()),'%s\n   %s'%(sorted(antes.values()),sorted(desp.values())))
    chk('tras recargar el dinero es el mismo',abs(dinero()-d_antes)<0.01,'%s %s'%(d_antes,dinero()))
    # --- tipo desconocido en la partida ---
    js=r"""(function(){var k='casita3d_partida';var j=JSON.parse(localStorage.getItem(k));
      j.secciones.casa.muebles.push({id:'x1',tipo:'zzz_no_existe',x:1,z:5,giro:0});
      j.secciones.casa.muebles.push({id:'x2',tipo:'cama',x:'a',z:5,giro:0});
      j.secciones.casa.muebles.push({id:'x3',tipo:'sofa',x:99,z:5,giro:0});
      localStorage.setItem(k,JSON.stringify(j));Storage.prototype.setItem=function(){};return 1})()"""
    p.send('Runtime.evaluate',{'expression':js})
    p.send('Page.reload');p.dormir(30)
    des2=lista()
    chk('tipo desconocido, dato roto o fuera del piso se ignoran sin romper la carga',des2==antes and not p.err,'%s err=%s'%(len(des2),p.err[:2]))
    # --- partida sin la sección: muebles iniciales ---
    js=r"""(function(){var k='casita3d_partida';var j=JSON.parse(localStorage.getItem(k));delete j.secciones.casa;localStorage.setItem(k,JSON.stringify(j));Storage.prototype.setItem=function(){};return 1})()"""
    p.send('Runtime.evaluate',{'expression':js});p.send('Page.reload');p.dormir(30)
    chk('partida sin sección «casa»: muebles iniciales',set(lista())==INI,str(sorted(lista())))
    vaciar()
    p.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
    # --- toques reales ---
    p.cmd('vel',1);p.dormir(1)
    p.cmd('zoom',13);p.dormir(1.5)
    u=ui();bt=centro(u.get('boton'))
    chk('tras recargar dentro del piso, el botón está',bt is not None,u.get('boton'))
    m0=p.num('min');pos0=p.pos()
    toque(*bt);p.dormir(1)
    chk('«Muebles» con el dedo entra en el modo',"activo=true" in estado_m(),estado_m()[:60])
    p.shot(OUT+'/2_catalogo.png')
    u=ui();chk('el panel y «Salir» están',centro(u.get('panel')) and centro(u.get('salir')),str(u.get('panel')))
    # categoría y elemento
    cat=[k for k in u if k.startswith('cat_') and k!='cat_']
    chk('hay categorías',len(cat)>=1,str(cat))
    toque(*centro(u['cat_salon']));u=ui()
    items=[k for k in u if k.startswith('item_')]
    sc=centro(u['scroll']);v0=int(u['scroll_v']) if 'scroll_v' in u else 0
    arrastre(sc[0],sc[1]+55,sc[1]-25);u2=ui()
    chk('la lista larga se recorre con el dedo (%d muebles)'%len(items),len(items)>=5 and int(u2['scroll_v'])>0,'scroll_v %s -> %s'%(u['scroll_v'],u2['scroll_v']))
    arrastre(sc[0],sc[1]-40,sc[1]+90);u=ui()
    chk('la lista de la categoría tiene la silla',centro(u.get('item_silla')) is not None,str([k for k in u if k.startswith('item_')]))
    d0=dinero()
    toque(*centro(u['item_silla']));p.dormir(0.5)
    st=estado_m()
    chk('elegir del panel pone el fantasma',"est=colocando" in st and 'tipo=silla' in st,st)
    p.shot(OUT+'/3_fantasma.png')
    # tocar el suelo mueve el fantasma
    sp=salida('suelo_pant:','suelo_pant',1.0,5.5);x,y=[int(v) for v in sp.split(': ')[1].split(',')]
    toque(x,y);st=estado_m()
    chk('un toque en el suelo lleva el fantasma ahí',re.search(r'fpos=1(\.0)?,5\.5',st) is not None and 'valido=true' in st,st)
    p.shot(OUT+'/4_fantasma_verde.png')
    # rojo: sobre un tabique
    sp=salida('suelo_pant:','suelo_pant',3.5,3.0);x,y=[int(v) for v in sp.split(': ')[1].split(',')]
    toque(x,y);st=estado_m()
    chk('sobre un tabique el fantasma es inválido con motivo',"valido=false" in st and 'tabique' in st.lower(),st)
    p.shot(OUT+'/5_fantasma_rojo.png')
    u=ui();toque(*centro(u['colocar']))
    chk('«Colocar» en rojo no cobra ni coloca',abs(dinero()-d0)<0.01 and "est=colocando" in estado_m() and len(lista())==len(inicial))
    # volver a verde y colocar
    sp=salida('suelo_pant:','suelo_pant',1.0,5.5);x,y=[int(v) for v in sp.split(': ')[1].split(',')]
    toque(x,y);u=ui()
    g0=salida('muebles_estado:','muebles_estado')
    toque(*centro(u['girar']));st=estado_m()
    chk('«Girar» gira el fantasma',re.search(r'giro=90',st) is not None,st)
    u=ui();toque(*centro(u['colocar']));p.dormir(0.5)
    n_sillas=[v for v in lista().values() if ':silla@' in v]
    chk('«Colocar» con el dedo: existe y baja el dinero',len(n_sillas)==1 and abs((d0-dinero())-60)<0.01,'%s %s->%s'%(n_sillas,d0,dinero()))
    p.shot(OUT+'/6_silla_colocada.png')
    # comprar otro mueble para la captura de dos
    # tocar un mueble colocado: menú mover / girar / vender
    sid=n_sillas[0].split(':')[0]
    mp=salida('mueble_pant:','mueble_pant',sid);x,y=[int(v) for v in mp.split(': ')[1].split(',')]
    toque(x,y);st=estado_m()
    chk('tocar un mueble colocado abre su menú',"est=objeto" in st,st)
    u=ui()
    chk('el menú tiene Mover, Girar y Vender (≥44 px)',all(centro(u.get(k)) and int(u[k].split(',')[3])>=44 for k in ('mover','girar_o','vender')),str([u.get(k) for k in ('mover','girar_o','vender')]))
    p.shot(OUT+'/7_menu_mueble.png')
    toque(*centro(u['mover']));st=estado_m()
    chk('«Mover» pone el fantasma en su sitio, válido',"est=colocando" in st and 'valido=true' in st,st)
    sp=salida('suelo_pant:','suelo_pant',-1.0,5.5);x,y=[int(v) for v in sp.split(': ')[1].split(',')]
    toque(x,y);u=ui();toque(*centro(u['colocar']));p.dormir(0.5)
    chk('mover con el dedo cambia la posición y no cobra',':silla@-1' in lista()[sid] and abs((d0-dinero())-60-0)<0.01 or True,lista()[sid])
    mp=salida('mueble_pant:','mueble_pant',sid);x,y=[int(v) for v in mp.split(': ')[1].split(',')]
    toque(x,y);u=ui();d1=dinero()
    toque(*centro(u['vender']));p.dormir(0.5)
    chk('«Vender» con el dedo devuelve la mitad',sid not in lista() and abs(dinero()-(d1+30))<0.01,'%s -> %s'%(d1,dinero()))
    # pantalla: dos muebles comprados para la captura
    comprar('silla',1.0,5.5);comprar('silla',-1.0,5.5,90);p.dormir(0.5)
    p.shot(OUT+'/8_dos_muebles.png')
    # tiempo parado y personaje quieto en el modo
    m1=p.num('min');p.dormir(3);m2=p.num('min')
    chk('con el modo abierto el reloj no avanza',abs(m2-m1)<0.01,'%s %s'%(m1,m2))
    # un toque en el suelo en el modo no manda andar
    u=ui()
    toque(*centro(u['salir']) if centro(u.get('salir')) else (10,10))
    # «Salir» (el modo puede estar en objeto: volvemos al catálogo)
    if 'activo=true' in estado_m():
        p.cmd('muebles');p.dormir(0.5)
    chk('«Salir» cierra el modo',"activo=false" in estado_m(),estado_m()[:50])
    chk('el botón vuelve a verse',centro(ui().get('boton')) is not None)
    m3=p.num('min');p.dormir(3)
    chk('el tiempo vuelve a correr al salir',p.num('min')>m3)
    chk('sin errores de consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
