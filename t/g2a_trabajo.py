#!/usr/bin/env python3
"""Prueba del bloque TRABAJO Y DINERO (Godot): Menú con «Trabajo» y «Dinero», sueldos e impuestos, ir andando al bar a su hora y
trabajar sirviendo, jornada con salto y tarjeta en el súper, falta y aviso, nómina, alquiler sin saldo (deuda y casero),
despido, oficina de empleo y paro, entrevista y nuevo trabajo, guardar y recargar. Capturas a 420x860.
Uso: python3 t/g2a_trabajo.py [carpeta_capturas]"""
import sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a_trabajo'
os.makedirs(OUT,exist_ok=True)
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
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
def trab():return salida('trabajo:','trabajo')
def campo(t,k):
    m=re.search(k+r'=([^ ]+)',t);return m.group(1) if m else ''
def tarjeta():return salida('tarjeta:','tarjeta')
def vale():p.cmd('vale',espera=0.4)
def vaciar_tarjetas(n=8):
    for i in range(n):
        if tarjeta().startswith('tarjeta: no') and 'cola=0' in tarjeta():return
        vale()
def cuenta():return salida('cuenta:','cuenta')
def tocar(x,y):
    for t in ('mousePressed','mouseReleased'):
        p.send('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':'left','clickCount':1});p.dormir(0.15)
def js(e):
    r=p.send('Runtime.evaluate',{'expression':e,'returnByValue':True});return r.get('result',{}).get('result',{}).get('value')
try:
    p.cmd('vel',5);p.dormir(1)
    # ---- 0) sueldos, alquiler y menú ----
    su=salida('sueldos:','sueldos')
    m=re.search(r'bar_camarera bruto=([\d.]+) ss=([\d.]+) irpf=([\d.]+) neto=([\d.]+)',su)
    b,ss,irpf,neto=map(float,m.groups()) if m else (0,0,0,0)
    chk('camarera: bruto ~1.400 €/mes, SS 6,5 %, neto ~1.300',1300<b<1550 and abs(ss-b*0.065)<0.05 and 1200<neto<1400 and abs(b-ss-irpf-neto)<0.05,su[:160])
    m2=re.search(r'obra_peona bruto=([\d.]+) ss=([\d.]+) irpf=([\d.]+)',su)
    chk('peona: por encima del SMI ya retiene IRPF',m2 and float(m2.group(3))>0,m2.group(0) if m2 else su[:200])
    c0=cuenta();chk('alquiler del bajo: 800 €/mes (185 €/semana del juego web)','alquiler=800' in c0,c0)
    pg=salida('pagos:','pagos')
    chk('próximos pagos: alquiler, facturas y nómina',all(x in pg for x in ['Alquiler','Luz','Agua','Internet','Móvil','Nómina']),pg)
    tocar(340,165);p.dormir(1)
    mr=salida('menu_rect:','menu_rect')
    p.shot(OUT+'/menu.png')
    xy=re.search(r't=(\d+),(\d+) d=(\d+),(\d+)',mr)
    chk('el Menú tiene «Trabajo» y «Dinero»',xy is not None,mr)
    if xy:
        tocar(int(xy.group(1)),int(xy.group(2)));p.dormir(1.2);p.shot(OUT+'/panel_trabajo.png')
        chk('«Trabajo» abre el panel','panel=true' in trab(),trab()[-40:])
    # tocar el dinero del HUD abre «Dinero»
    tocar(370,24);p.dormir(1.2);p.shot(OUT+'/panel_dinero.png')
    chk('tocar el dinero del HUD abre «Dinero»','dinero_panel=true' in trab(),trab()[-40:])
    tocar(370,24);p.dormir(0.5)
    # ---- 1) el bar: a su hora sale andando sola y trabaja sirviendo ----
    p.cmd('dia',1);p.cmd('hora',9.45);p.dormir(1)
    p.cmd('poner',222,150);p.dormir(1)
    esperar(lambda:'"tipo":"trabajo"' in trab() or campo(trab(),'en_barra')=='true',30,0.5)
    t=trab();chk('a las 9:35 sale andando sola hacia el bar','"tipo":"trabajo"' in t or '"fichada":true' in t,t[-200:])
    p.shot(OUT+'/bar_andando.png')
    ok=esperar(lambda:'"fichada":true' in trab(),40,1.0)
    chk('entra al bar y ficha',ok,trab()[-220:])
    esperar(lambda:campo(trab(),'en_barra')=='true',40,1.0)
    chk('de turno detrás de la barra (trabaja_aqui)',campo(trab(),'en_barra')=='true' and 'trabaja=true' in p.estado(),trab()[-120:])
    p.cmd('zoom',13);p.dormir(1);p.shot(OUT+'/bar_turno.png')
    p.cmd('hora',12.6);p.dormir(3)   # la hora del menú: el bar se llena (con swiftshader el reloj va lento)
    # servir a alguien: caña o café al primero que pida
    PREP={'cana':('grifo','tirar_cana'),'cafe':('cafetera','hacer_cafe'),'coctel':('coctelera','preparar:mojito')}
    for intento in range(60):
        cl=salida('clientes:','clientes')
        lista=re.findall(r'([^,\[\]"]+?):(\w+):(\w*)',cl.split('|')[0])
        idx=None;prod=None
        for i,(n_,e_,ped) in enumerate(lista):
            if e_=='pidiendo' and ped in PREP:idx=i;prod=ped;break
        if idx is None:p.dormir(2);continue
        p.cmd('accion',*PREP[prod])
        esperar(lambda:'mano='+prod in p.estado(),40,0.5)
        p.cmd('accion_cliente',idx,'servir')
        esperar(lambda:'cola=0' in p.estado() and ('mano=,' in p.estado() or 'mano= ' in p.estado()),30,0.5)
        if campo(trab(),'bar_n') not in ('','0'):break
    print(salida('clientes:','clientes'))
    p.shot(OUT+'/bar_servido.png')
    chk('sirve una consumición (el precio va a la caja)',campo(trab(),'bar_n') not in ('','0'),trab()[-30:])
    # fin del turno: tarjeta de la jornada del bar
    p.cmd('hora',17.85);esperar(lambda:'"hecha":true' in trab(),40,0.5)
    tj=tarjeta();p.dormir(0.5);p.shot(OUT+'/bar_tarjeta.png')
    chk('al acabar el turno: tarjeta de la jornada del bar','Jornada' in tj,tj)
    vaciar_tarjetas()
    # ---- 2) el súper: anda hasta allí, salto con velo y tarjeta ----
    p.cmd('aceptar','super_cajera');p.dormir(0.5);vaciar_tarjetas();p.cmd('dia',2);p.cmd('hora',7.3);p.dormir(1)
    p.cmd('poner',150,152);p.dormir(1)
    ok=esperar(lambda:'"fichada":true' in trab(),60,0.5)
    chk('cajera: va sola al súper y entra',ok,trab()[-200:])
    p.dormir(0.3);p.shot(OUT+'/super_velo.png')
    ok=esperar(lambda:'"hecha":true' in trab(),60,0.5)
    p.dormir(1.5)
    tj=tarjeta();p.shot(OUT+'/super_tarjeta.png')
    chk('jornada del súper con tarjeta y efectos',ok and 'Jornada' in tj,tj)
    t=trab();chk('una jornada contada','jornadas=1' in t,t[:120])
    vaciar_tarjetas()
    # ---- 3) falta: el jueves no va ----
    p.cmd('dia',3);p.cmd('hora',6);p.dormir(1)
    p.cmd('poner',40,250);p.cmd('hora',15.9);p.cmd('poner',40,250);p.cmd('vaciar');p.dormir(1)
    esperar(lambda:'"hecha":true' in trab(),40,0.5);p.dormir(1)
    tj=tarjeta();p.shot(OUT+'/falta.png')
    t=trab()
    chk('falta: tarjeta, descuento y aviso','no has ido' in tj and 'desc_dias=1' in t,tj+' '+t[:160])
    vaciar_tarjetas()
    # ---- 4) nómina ----
    n=salida('nomina:','nomina');p.dormir(1);p.shot(OUT+'/nomina.png')
    j=json.loads(n[len('nomina: '):] or '{}')
    chk('nómina: bruto - SS - IRPF = neto, descuenta la falta',j and abs(j['bruto']-j['ss']-j['irpf']-j['neto'])<0.05 and j['desc']>0,str(j)[:200])
    c=cuenta();chk('la nómina entra en la cuenta como movimiento','Nómina' in c,c[-200:])
    vaciar_tarjetas()
    chk('sin errores en consola (1.ª parte)',not p.err,str(p.err[:3]))
    # segunda parte en una página nueva (partida nueva): una sesión larga con swiftshader agota la memoria del navegador
    p.cerrar();p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
    p.cmd('vel',5);p.dormir(1);p.cmd('aceptar','super_cajera',0)
    # ---- 5) alquiler sin saldo: deuda, aviso del casero ----
    p.cmd('dinero',100);p.cmd('dia',28);p.cmd('hora',8.9);p.dormir(1)
    esperar(lambda:'deudas=1' in cuenta(),30,0.5)
    tj=tarjeta();p.shot(OUT+'/alquiler_impagado.png')
    c=cuenta();chk('alquiler sin saldo: queda como deuda','deuda=800' in c and 'no llega' in tj.lower(),c[:120]+' '+tj)
    vaciar_tarjetas()
    p.cmd('dia',31);p.cmd('hora',8.9);p.dormir(1)
    esperar(lambda:'casero=1' in cuenta(),30,0.5)
    tj=tarjeta();p.shot(OUT+'/casero.png')
    chk('a los 3 días: mensaje del casero','casero=1' in cuenta() and 'casero' in tj.lower(),tj)
    vaciar_tarjetas()
    p.cmd('panel_dinero');p.dormir(1.2);p.shot(OUT+'/dinero_deuda.png');p.cmd('panel_dinero');tocar(370,22)
    # ---- 6) despido y paro ----
    p.cmd('despedir','despido');p.dormir(1);vaciar_tarjetas()
    t=trab();chk('despido: sin trabajo, pendiente de inscribirse','puesto= ' in t and '"inscrita":false' in t,t[:200])
    p.cmd('panel_trabajo');p.dormir(1.2);p.shot(OUT+'/panel_parada.png')
    p.cmd('dinero',100)
    p.cmd('dia',32);p.cmd('hora',10);p.dormir(1)   # viernes
    m=salida('metro:','metro');q=re.search(r'\(([-\d.]+), ([-\d.]+)\)',m)
    p.cmd('poner',float(q.group(1))+6,float(q.group(2))+1);p.dormir(0.5)
    p.cmd('sepe');p.dormir(0.5)
    ok=esperar(lambda:'"inscrita":true' in trab(),80,0.5)
    p.dormir(1.5);tj=tarjeta();p.shot(OUT+'/sepe.png')
    t=trab()
    chk('oficina de empleo: paro contributivo con 540 días cotizados',ok and '"tipo":"contributiva"' in t and 'Oficina' in tj,t[:260])
    vaciar_tarjetas()
    c=cuenta();chk('el metro se paga (billete de ida y vuelta)','Billete de metro' in c,c[-200:])
    # cobro del paro el día 10 (día 37)
    p.cmd('dia',37);p.cmd('hora',8.9);p.dormir(1)
    esperar(lambda:'Prestación' in cuenta(),30,0.5)
    chk('cobra el paro el día 10','Prestación' in cuenta(),cuenta()[-160:])
    # ---- 7) entrevista y nuevo trabajo ----
    p.cmd('dia',42);p.cmd('hora',10);p.dormir(1)     # lunes
    p.cmd('poner',150,152);p.dormir(0.5)
    p.cmd('entrevista','super_cajera',1);p.dormir(0.5)
    ok=esperar(lambda:'puesto=super_cajera' in trab(),80,0.5)
    p.dormir(1.5);tj=tarjeta();p.shot(OUT+'/entrevista.png')
    chk('entrevista: le cogen, empieza mañana y se acaba el paro',ok and 'parada={}' in trab() and 'Entrevista' in tj,trab()[:200])
    vaciar_tarjetas()
    p.cmd('panel_trabajo');p.dormir(1.2);p.shot(OUT+'/panel_trabajo_nuevo.png');p.cmd('panel_trabajo')
    # ---- 8) guardar y recargar ----
    t0=trab();c0=cuenta()
    p.cmd('guardar');p.dormir(1)
    js("Storage.prototype.setItem=function(){}")
    p.send('Page.reload',{});p.dormir(28)
    t1=trab();c1=cuenta()
    chk('recarga: el trabajo sigue',campo(t0,'puesto')==campo(t1,'puesto') and campo(t0,'cot')==campo(t1,'cot'),t1[:160])
    chk('recarga: deudas y movimientos siguen',campo(c0,'deuda')==campo(c1,'deuda') and 'Prestación' in c1,c1[:200])
    chk('sin errores en consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
