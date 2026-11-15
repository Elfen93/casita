#!/usr/bin/env python3
"""Prueba de EMPEZAR Y OBJETIVOS en Godot (scripts/inicio.gd, objetivos.gd, historia.gd) sobre la exportación web (play3d/):
partida nueva con nombre editable y situación de partida, primeros pasos que se marcan solos, deseos que dan ánimo y no dinero,
historia del día y resumen al despertar, Menú con secciones, avisos en cola, guardado y portada con «Continuar».
Capturas a 420x860. Uso: python3 t/g2a_objetivos.py [carpeta_capturas]"""
import sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a_obj'
os.makedirs(OUT,exist_ok=True)
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def chk(nombre,ok,det=''):
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det,flush=True)
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
def js(expr):
    r=p.send('Runtime.evaluate',{'expression':expr,'returnByValue':True});return r['result']['result'].get('value')
def tocar(x,y):
    for t in ('mousePressed','mouseReleased'):
        p.send('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':'left','clickCount':1});p.dormir(0.2)
def salida(pref,*a):
    n=len(p.log);p.cmd(*a,espera=0.8)
    for l in p.log[n:]:
        if l.startswith(pref):return l[len(pref):].strip()
    return ''
def est():
    t=salida('obj_estado:','obj_estado')
    return json.loads(t) if t else {}
def ui():
    t=salida('obj_ui:','obj_ui');return json.loads(t) if t else {}
def tocar_ui(clave):
    r=ui().get(clave)
    if r:tocar(r[0]+r[2]//2,r[1]+r[3]//2)
    return r
def esperar(f,n=40,paso=0.5):
    for i in range(n):
        p.dormir(paso)
        if f():return True
    return False
def recargar(seg=30):
    p.err.clear();p.send('Page.reload');p.dormir(seg)
try:
    # 1) partida nueva: elegir, situación con nombre editable, empezar
    p.shot(OUT+'/o1_elegir.png')
    tocar(210,800);p.dormir(3);p.shot(OUT+'/o2_situacion.png')
    tocar(200,120);p.dormir(0.5)
    p.send('Input.dispatchKeyEvent',{'type':'rawKeyDown','key':'a','code':'KeyA','windowsVirtualKeyCode':65,'modifiers':2});p.send('Input.dispatchKeyEvent',{'type':'keyUp','key':'a','code':'KeyA','windowsVirtualKeyCode':65,'modifiers':2})
    for c in 'Lucía':
        p.send('Input.dispatchKeyEvent',{'type':'keyDown','key':c,'text':c,'unmodifiedText':c});p.send('Input.dispatchKeyEvent',{'type':'keyUp','key':c})
    p.dormir(1)
    p.shot(OUT+'/o3_nombre.png')
    tocar(210,800);p.dormir(20)
    e=est()
    chk('partida nueva: nombre editado',e.get('nombre')=='Lucía',str(e.get('nombre')))
    chk('situación de partida: poco dinero (480 €)',abs(e.get('dinero',0)-480)<0.01,str(e.get('dinero')))
    chk('un deseo de salida y la llegada en la historia',e.get('deseos')==['nevera'] and e.get('hoy')==1,str(e))
    esperar(lambda:est().get('tarjeta') is True,20,0.5)
    chk('tarjeta de primeros pasos a la vista',est().get('tarjeta') is True)
    p.shot(OUT+'/o4_llegada.png')
    g=json.loads(js("localStorage.getItem('casita3d_partida')") or '{}')
    chk('el nombre se guarda (sección inicio)',g.get('secciones',{}).get('inicio',{}).get('nombre')=='Lucía',str(g.get('secciones',{}).get('inicio')))
    # 2) entrar en casa
    p.cmd('vel',5);p.cmd('hora',10);p.dormir(1)
    p0=p.pos();dx=round(p0[0]);fz=round(p0[1]-2.1)
    p.cmd('poner',dx,fz+4);p.cmd('ir_xy',dx,fz-2.5)
    esperar(lambda:'dentro=true' in p.estado(),60,1.0)
    esperar(lambda:'casa' in est().get('pasos',[]),10,0.5)
    e=est();chk('paso «Entra en casa» se marca solo','casa' in e.get('pasos',[]),str(e.get('pasos')))
    p.dormir(0.5);p.shot(OUT+'/o5_paso_casa.png')
    # 3) comer algo (picar de la nevera)
    p.cmd('accion','nevera','picar');esperar(lambda:'cola=0' in p.estado(),120,1.0)
    e=est();chk('paso «Come algo» al picar de la nevera','comer' in e.get('pasos',[]),str(e.get('pasos')))
    chk('la historia cuenta lo que hiciste',any('nevera' in l[2] for l in e.get('historia',[])),str(e.get('historia')))
    # 4) el súper: ir, comprar; deseo «Llenar la nevera» cumplido: ánimo, no dinero
    p.cmd('hora',11);p.cmd('ir','super')
    esperar(lambda:'super' in est().get('pasos',[]),150,1.0)
    e=est();chk('paso «Ve al súper» al llegar','super' in e.get('pasos',[]),str(e.get('pasos')))
    d0=p.num('dinero');a0=e.get('alegria',0)
    p.cmd('boton',0);esperar(lambda:est().get('total')==1,60,1.0);p.dormir(2)
    e=est();d1=p.num('dinero')
    chk('comprar en el súper cumple «Llenar la nevera»','nevera' not in e.get('deseos',[]) and e.get('total')==1,str(e))
    chk('cumplir un deseo da ánimo y no dinero',e.get('alegria',0)>a0 and abs((d0-d1)-12)<0.01,'alegría %s->%s, dinero %s->%s'%(a0,e.get('alegria'),d0,d1))
    p.shot(OUT+'/o6_deseo.png')
    # 5) avisos en cola: varios a la vez no se pisan
    p.cmd('obj_hecho','hablar','{"nombre":"Pilar"}',espera=0.1);p.cmd('trabaja',True,espera=0.1)
    e=est();chk('avisos en cola (no se pisan)',e.get('cola_avisos',0)>=1,str(e.get('cola_avisos')))
    p.dormir(0.6);p.shot(OUT+'/o7_avisos.png')
    esperar(lambda:est().get('cola_avisos',1)==0,30,0.5)
    e=est();chk('pasos «Habla» y «Busca trabajo»','hablar' in e.get('pasos',[]) and 'trabajo' in e.get('pasos',[]),str(e.get('pasos')))
    p.cmd('trabaja',False)
    # 6) dormir: al despertar, resumen del día anterior
    p.cmd('hora',22);p.cmd('ir','casa');p.dormir(1)
    esperar(lambda:'dentro=true' in p.estado() and 'ruta=0' in p.estado(),150,1.0)
    p.cmd('accion','cama','dormir_8')
    esperar(lambda:est().get('modo')=='resumen',200,1.0)
    e=est();chk('al despertar sale el resumen de ayer',e.get('modo')=='resumen',str(e.get('modo')))
    chk('paso «Duerme» y primeros pasos completos',e.get('fin') is True and len(e.get('pasos',[]))==6,str(e.get('pasos')))
    chk('con los pasos hechos, hasta 3 deseos',1<=len(e.get('deseos',[]))<=3,str(e.get('deseos')))
    p.dormir(1);p.shot(OUT+'/o8_resumen.png')
    tocar_ui('cerrar');p.dormir(0.5)
    chk('el resumen se cierra',est().get('modo')=='')
    # 7) Menú con secciones; Historia y Objetivos
    tocar_ui('menu');p.dormir(1);p.shot(OUT+'/o9_menu.png')
    u=ui();chk('Menú con Historia, Objetivos, Gente, Trabajo y Dinero',all(('menu:'+k) in u for k in ['historia','objetivos','gente','trabajo','dinero']),str(list(u)))
    tocar_ui('menu:historia');p.dormir(1);p.shot(OUT+'/o10_historia.png')
    e=est();chk('panel Historia con dos días',e.get('modo')=='historia' and e.get('dias')==2,str((e.get('modo'),e.get('dias'))))
    tocar_ui('cerrar');p.dormir(0.5)
    tocar_ui('chip');p.dormir(1);p.shot(OUT+'/o11_objetivos.png')
    chk('la pastilla de ánimo abre Objetivos',est().get('modo')=='objetivos')
    tocar_ui('cerrar');p.dormir(0.5)
    p.cmd('hora',13);p.dormir(1);p.shot(OUT+'/o12_hud.png')
    # 8) guardar y recargar: portada con «Continuar»
    e0=est();p.cmd('guardar');p.dormir(1)
    recargar()
    p.shot(OUT+'/o13_portada.png')
    tocar(210,742);p.dormir(20)
    e=est()
    chk('portada: «Continuar» carga la partida',e.get('nombre')=='Lucía' and sorted(e.get('pasos',[]))==sorted(e0.get('pasos',[])) and e.get('dias')==2 and e.get('total')==e0.get('total'),'%s'%e)
    chk('recarga sin errores de consola',not p.err,str(p.err[:3]))
    # 9) partida antigua (sin secciones nuevas): carga con valores por defecto
    js("localStorage.setItem('casita3d_partida',%s)"%json.dumps(json.dumps({"v":1,"secciones":{"reloj":{"v":1,"minutos":3000},"personaje":{"v":1,"modelo":"kate"}}})))
    js("Storage.prototype.setItem=function(){}")
    recargar()
    p.cmd('vel',1);p.dormir(20)
    e=est()
    chk('partida antigua: carga con valores por defecto',e.get('nombre')=='Ana' and e.get('pasos')==[] and not p.err,str(e)[:200])
    # 10) portada -> «Partida nueva» -> «Sí» -> elegir
    js("delete Storage.prototype.setItem")
    p.send('Page.reload');p.dormir(30)
    js("localStorage.setItem('casita3d_partida',%s)"%json.dumps(json.dumps({"v":1,"secciones":{"reloj":{"v":1,"minutos":3000},"personaje":{"v":1,"modelo":"kate"},"inicio":{"v":1,"nombre":"Lucía","propio":True}}})))
    recargar()
    tocar(210,804);p.dormir(1);p.shot(OUT+'/o14_confirmar.png')
    tocar(210,742);p.dormir(3);p.shot(OUT+'/o15_nueva_elegir.png')
    chk('«Partida nueva» desde la portada borra la partida',js("localStorage.getItem('casita3d_partida')") is None)
    tocar(210,800);p.dormir(4);tocar(210,800);p.dormir(20)
    e=est();chk('y empieza de cero',e.get('pasos')==[] and abs(e.get('dinero',0)-480)<0.01 and e.get('nombre')=='Ana',str(e)[:200])
    chk('sin errores en consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
