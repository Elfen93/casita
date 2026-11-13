"""GD-10b: prueba del creador de personaje (?crear). Uso: python3 t/g2a_crear.py [carpeta]"""
import sys,re,time,subprocess,socket,json,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/gd10b'
os.makedirs(OUT,exist_ok=True)
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
so=socket.socket();so.bind(('127.0.0.1',0));port=so.getsockname()[1];so.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port),'--bind','127.0.0.1'],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
URL='http://127.0.0.1:%d/play3d/index.html'%port
# con el cuerpo de verdad (arte/humano) las prendas son otras que las del maniquí de pega
ARR='sudadera' if os.path.exists(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'godot/arte/humano/catalogo.json')) else 'jersey'
res=[]
def chk(n,ok,x=''):
    res.append(bool(ok));print(('OK  ' if ok else 'FALLA ')+n,x)
p=None
def abrir(q,espera=25):
    global p
    if p:p.cerrar()
    p=Pag(URL+q,espera=espera)
    p.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
def cr(*a,espera=0.5):
    p.send('Runtime.evaluate',{'expression':'window.casita_crear(%s)'%','.join(json.dumps(x) for x in a)});p.dormir(espera)
def salida(prefijo,*a,espera=0.6):
    n=len(p.log);cr(*a,espera=espera)
    for l in p.log[n:]:
        if l.startswith(prefijo):return l
    return ''
def estado():
    l=salida('estado:','estado')
    try:return json.loads(l[len('estado: '):])
    except Exception:return {}
def rect(k):
    l=salida('rect:','rect',k);m=re.match(r'rect: \S+ (-?\d+),(-?\d+),(-?\d+),(-?\d+)',l)
    return tuple(int(x) for x in m.groups()) if m else None
def centro(r):return (r[0]+r[2]/2,r[1]+r[3]/2)
def tp(t,pts):p.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':pts})
def toque(x,y):
    tp('touchStart',[{'x':x,'y':y,'id':1}]);tp('touchEnd',[])
def arrastre(x0,y0,x1,y1,pasos=6):
    tp('touchStart',[{'x':x0,'y':y0,'id':1}])
    for i in range(1,pasos+1):
        tp('touchMove',[{'x':x0+(x1-x0)*i/pasos,'y':y0+(y1-y0)*i/pasos,'id':1}])
    tp('touchEnd',[])
    p.dormir(0.8)
try:
    # 1) sin ?crear arranca el juego
    abrir('',30)
    n=len(p.log);p.cmd('estado',espera=0.8)
    chk('sin ?crear arranca el juego',any(l.startswith('estado:') for l in p.log[n:]) and any('Casita 3D listo' in l for l in p.log))
    # 2) con ?crear arranca el creador
    abrir('?crear',25)
    chk('?crear abre el creador',any('Creador listo' in l for l in p.log),[l for l in p.log if 'Creador' in l])
    l=salida('controles:','controles')
    m=re.search(r'formas=(\d+) pestanas=(\d+) catalogo=(\d+)',l)
    chk('un deslizador por forma del catálogo',bool(m) and m.group(1)==m.group(3) and int(m.group(1))>0,l)
    p.shot(OUT+'/crear_0_inicio.png')
    # guardar las otras claves para comprobar que no se tocan
    def claves():
        r=p.send('Runtime.evaluate',{'expression':'JSON.stringify([localStorage.getItem("casita3d_partida"),localStorage.getItem("casita-save-v1")])'})
        return r['result']['result'].get('value')
    p.send('Runtime.evaluate',{'expression':'localStorage.setItem("casita3d_partida","X1");localStorage.setItem("casita-save-v1","X2")'})
    c0=claves()
    # 3) deslizador con el dedo
    e0=estado()
    rp=e0['aspecto'].get('ropa',{})
    chk('estado inicial: ropa en su color original',all(rp.get(c,{}).get('color')=='ffffff' for c in ('arriba','abajo','pies')) if os.path.exists(os.path.join(RAIZ,'godot/arte/humano/catalogo.json')) else True,rp)
    r=rect('forma:peso');print('peso',r)
    chk('el deslizador está a pantalla y es alto',bool(r) and r[3]>=44 and r[1]>430,r)
    x,y=centro(r)
    g0=e0.get('giro')
    arrastre(r[0]+r[2]*0.5,y,r[0]+r[2]*0.9,y)
    e1=estado()
    chk('arrastrar un deslizador cambia la forma',e1['aspecto']!=e0['aspecto'],e1['aspecto'].get('formas'))
    chk('arrastrar un deslizador no gira al personaje',e1['giro']==g0,'%s %s'%(g0,e1['giro']))
    p.shot(OUT+'/crear_1_cuerpo.png')
    # 4) arrastrar sobre el personaje lo gira
    arrastre(150,260,300,265)
    e2=estado()
    chk('arrastrar sobre el personaje lo gira',abs(e2['giro']-e1['giro'])>0.3,'%s -> %s'%(e1['giro'],e2['giro']))
    p.shot(OUT+'/crear_2_girado.png')
    # 5) pestañas y elecciones (toque real sobre los botones)
    def pulsa(k):
        toque(*centro(rect(k)));p.dormir(0.6)
    pulsa('pestana:cara')
    e=estado();chk('pestaña Cara',e['pestana']=='cara',e['pestana'])
    cara=[k for k in ['forma:ojos','forma:cabeza','forma:nariz'] if rect(k)]
    r=rect(cara[0]);x,y=centro(r)
    e3=estado();arrastre(r[0]+r[2]*0.5,y,r[0]+r[2]*0.85,y);e4=estado()
    chk('un deslizador de cara cambia la forma y encuadra el busto',e4['aspecto']!=e3['aspecto'] and e4['vista']=='cara',(e4['vista']))
    p.dormir(1.5);p.shot(OUT+'/crear_3_cara.png')
    if rect('ojos:verde'):
        pulsa('ojos:verde');pulsa('cejas:cejas3')
        b=estado()['aspecto'];chk('elegir color de ojos y cejas',b.get('ojos')=='verde' and b.get('cejas')=='cejas3',(b.get('ojos'),b.get('cejas')))
        p.dormir(1.5);p.shot(OUT+'/crear_3b_ojos_cejas.png')
        toque(*centro(rect('deshacer')));p.dormir(0.8);b=estado()['aspecto']
        chk('Deshacer también vuelve las cejas',b.get('cejas')!='cejas3',b.get('cejas'))
        pulsa('cejas:cejas3')
    else:
        print('(maniquí de pega: sin ojos ni cejas)')
    pulsa('pestana:piel');p.shot(OUT+'/crear_4_piel.png')
    a=estado()['aspecto'];pulsa('piel:oscura');b=estado()['aspecto']
    chk('elegir piel',a!=b and 'oscura' in json.dumps(b),b.get('piel'))
    pulsa('pestana:pelo');p.shot(OUT+'/crear_5_pelo.png')
    a=estado()['aspecto'];pulsa('pelo:largo');pulsa('pelo_color:4');b=estado()['aspecto']
    chk('elegir peinado y color',a!=b and 'largo' in json.dumps(b),b.get('pelo'))
    pulsa('pestana:ropa');p.shot(OUT+'/crear_6_ropa.png')
    s0=int(re.search(r'-?\d+',salida('scroll:','scroll')).group())
    arrastre(200,780,200,560,8)
    s1=int(re.search(r'-?\d+',salida('scroll:','scroll')).group())
    chk('la lista larga (Ropa) se desplaza con el dedo',s1>s0+20,'%d -> %d'%(s0,s1))
    p.shot(OUT+'/crear_6b_ropa_abajo.png')
    arrastre(200,560,200,780,8)
    a=estado()['aspecto'];pulsa('ropa:arriba:'+ARR);pulsa('ropa_color:arriba:3');b=estado()['aspecto']
    chk('elegir ropa y color',a!=b and ARR in json.dumps(b),b.get('ropa'))
    pulsa('pestana:gesto');p.shot(OUT+'/crear_7_gesto.png')
    a=estado()['aspecto'];pulsa('gesto:sonrisa');b=estado()['aspecto'];pulsa('gesto:sonrisa');c=estado()['aspecto']
    chk('el gesto se pone y se quita al tocar otra vez',a!=b and b!=c and a==c,'')
    # 6) al azar y deshacer
    pulsa('pestana:cuerpo');a=estado()['aspecto']
    toque(*centro(rect('azar')));p.dormir(1);b=estado()['aspecto']
    chk('Al azar cambia varias cosas',a!=b and sum(1 for k in a if a[k]!=b[k])>=2,[k for k in a if a[k]!=b[k]])
    p.shot(OUT+'/crear_8_azar.png')
    toque(*centro(rect('deshacer')));p.dormir(1);c=estado()['aspecto']
    chk('Deshacer vuelve',c==a)
    # 7) guardar, recargar
    toque(*centro(rect('azar')));p.dormir(1)
    p.send('Runtime.evaluate',{'expression':'0'})
    toque(*centro(rect('guardar')));p.dormir(0.8);p.shot(OUT+'/crear_9_guardado.png')
    g=estado();c1=claves()
    chk('guardar no toca las otras claves',c1==c0,c1)
    p.send('Page.navigate',{'url':URL+'?crear'});p.dormir(25)
    h=estado()
    chk('recargar: el personaje vuelve igual',h.get('aspecto')==g['aspecto'] and h.get('nombre')==g['nombre'],'')
    p.shot(OUT+'/crear_10_recargado.png')
    # 7b) guardado con una prenda que ya no existe
    raw=p.send('Runtime.evaluate',{'expression':'localStorage.getItem("casita3d_personaje")'})['result']['result']['value']
    d=json.loads(raw)
    d['aspecto'].setdefault('ropa',{})['arriba']={'id':'vestido','color':'ff0000'}
    d['aspecto']['ropa']['entero']={'id':'vestido','color':'ff0000'}
    d['ui']['ropa']['arriba']={'id':'vestido','color':'ff0000'}
    p.send('Runtime.evaluate',{'expression':'localStorage.setItem("casita3d_personaje",%s)'%json.dumps(json.dumps(d))})
    p.send('Page.navigate',{'url':URL+'?crear'});p.dormir(25)
    h=estado();ro=h['aspecto'].get('ropa',{})
    chk('id de ropa inexistente: se sustituye y sigue vestido',('vestido' not in json.dumps(h['aspecto'])) and ro.get('arriba',{}).get('id') and ro.get('abajo',{}).get('id'),ro)
    # 7c) diez «Al azar» seguidos
    cr('pestana','cuerpo');cr('vista','cuerpo')
    ok=True;lista=[]
    for i in range(10):
        if i==6:cr('vista','cara')
        cr('azar',espera=0.4);e=estado();ro=e['aspecto'].get('ropa',{});lista.append(e['aspecto'])
        vestido=bool(ro.get('entero')) or bool(ro.get('arriba') and ro.get('abajo'))
        ok=ok and vestido
        if i<9:
            p.dormir(1.2);p.shot(OUT+'/crear_azar_%d_%s.png'%(i+1,'cuerpo' if i<6 else 'cara'))
        print('azar',i+1,json.dumps(e['aspecto'])[:400])
    chk('diez «Al azar» seguidos: siempre vestido',ok,'')
    cr('vista','cuerpo')
    # 8) órdenes y fps
    cr('forma','peso',0.7);cr('piel','clara');cr('pelo','corto');cr('ropa','abajo','falda');cr('gesto','sorpresa');cr('vista','cara');cr('pestana','ropa')
    e=estado();chk('órdenes casita_crear',e['vista']=='cara' and e['pestana']=='ropa' and 'falda' in json.dumps(e['aspecto']),'')
    l=salida('fps:','fps');chk('fps',bool(re.match(r'fps: \d+',l)),l)
    # solo para mirar: vista del busto
    p.shot(OUT+'/crear_11_orden.png')
    print('errores',p.err[:5]);chk('sin errores de consola',not p.err)
finally:
    if p:p.cerrar()
    srv.kill()
print('RESULTADO','OK' if all(res) else 'FALLA',sum(res),'/',len(res))
