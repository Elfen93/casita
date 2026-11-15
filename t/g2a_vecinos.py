#!/usr/bin/env python3
"""Prueba de VECINOS Y RELACIONES (Godot): conocer a una vecina, cada opción del menú con su animación y su tarjeta, la relación
y lo que se descubre, la pestaña Gente, llamar, invitar a casa (se sienta en el sofá), un favor en persona, el saludo al cruzaros
y el guardado. Capturas a 420x860.
Uso: python3 t/g2a_vecinos.py [carpeta_capturas]"""
import sys,os,time,subprocess,re,socket,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from g2a_cdp import Pag
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a_vecinos'
os.makedirs(OUT,exist_ok=True)
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port)],cwd=RAIZ,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def chk(nombre,ok,det=''):
    R.append(bool(ok));print(('OK   ' if ok else 'FALLA'),nombre,det,flush=True)
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
def L(c,*a,esp=0.5):
    n=len(p.log);p.cmd(c,*a,espera=esp);return [l for l in p.log[n:] if not l.startswith('fps')]
def linea(c,pref,*a):
    for l in L(c,*a):
        if l.startswith(pref):return l[len(pref):].strip()
    return ''
def est():
    t=linea('rel_estado','rel_estado:')
    try:return json.loads(t)
    except Exception:return {}
def per(vid):return est().get('per',{}).get(vid,{})
def esperar(f,n=40,paso=0.5):
    for i in range(n):
        p.dormir(paso)
        if f():return True
    return False
def visibles():
    out=[]
    for x in linea('rel_vis','rel_vis:').split():
        i,vid,d,meta,px,pz,edad=x.split(':')
        out.append(dict(i=int(i),vid=vid,d=int(d),meta=meta,x=int(px),z=int(pz),edad=int(edad)))
    return out
def ui():return linea('gente_ui','gente_ui:')
def op(i,o,foto=None,t1=0.7):
    """encuentro: anda hasta ella, se miran, hablan (foto a mitad) y sale la tarjeta"""
    l=linea('rel_op','rel_op:',i,o)
    if ('opciones=' in l and o not in l.split('opciones=')[1].split(',')):return False
    ok=esperar(lambda:est().get('enc')=='hacer',30,0.4)
    if foto:p.dormir(t1);p.shot(OUT+'/'+foto)
    esperar(lambda:est().get('enc')=='',30,0.5)
    return ok
try:
    p.cmd('borrar_partida');p.cmd('vel',1);p.cmd('hora',11);p.dormir(2)
    casa=p.pos()
    V=[v for v in visibles() if 18<=v['edad']<60 and v['meta'] not in ('bar','colegio','')]
    chk('hay vecinas adultas por la calle',len(V)>=2,str([v['vid'] for v in V]))
    a=V[0];b=V[1]
    p.cmd('rel_cerca',a['i']);p.cmd('zoom',9);p.dormir(2)
    # 1) ficha de alguien a quien no conoces: solo «Presentarse»
    l=linea('rel_op','rel_op:',a['i'],'-');chk('sin conocerla solo se puede presentarse',l.endswith('opciones=presentarse'),l)
    p.cmd('rel_ficha',a['i']);p.dormir(1.2);p.shot(OUT+'/ficha_desconocida.png')
    s0=est().get('social',0)
    # 2) presentarse: se acercan, se miran, saludo y tarjeta
    chk('presentarse: llega y hablan',op(a['i'],'presentarse','presentarse.png',1.4))
    p.dormir(0.3);p.shot(OUT+'/tarjeta_presentarse.png')
    q=per(a['vid']);chk('ya os conocéis (relación > 0) y sabes su oficio',q.get('rel',0)>0 and q.get('sabe',{}).get('oficio'),str(q))
    chk('la necesidad social sube',est().get('social',0)>s0,'%s -> %s'%(s0,est().get('social')))
    chk('la tarjeta se ve','card=-' not in ui(),ui())
    # 3) charlar, chiste, su vida
    r0=per(a['vid'])['rel'];op(a['i'],'charlar','charlar.png',1.6)
    chk('charlar sube la amistad',per(a['vid'])['rel']>r0,'%s -> %s'%(r0,per(a['vid'])['rel']))
    p.dormir(0.3);p.shot(OUT+'/tarjeta_charla.png')
    op(a['i'],'chiste','chiste.png',1.4);chk('el chiste tiene resultado (tarjeta)','card=-' not in ui())
    p.cmd('rel_set',a['i'],12)
    op(a['i'],'vida','vida.png',1.4);p.dormir(0.3);p.shot(OUT+'/tarjeta_vida.png')
    chk('preguntar por su vida: descubres su trabajo',per(a['vid']).get('sabe',{}).get('trabajo'),str(per(a['vid'])))
    # 4) con más confianza: cotilleo y política
    p.cmd('rel_set',a['i'],30)
    c0=est().get('cotis',0);op(a['i'],'cotillear','cotillear.png',1.4);p.dormir(0.3);p.shot(OUT+'/tarjeta_cotilleo.png')
    chk('el cotilleo descubre algo real del censo',est().get('cotis',0)>c0)
    op(a['i'],'politica');chk('hablar de política: sabes sus ideas',per(a['vid']).get('sabe',{}).get('ideo'))
    # 5) amistad: abrazar; romance (adultas): ligar
    p.cmd('rel_set',a['i'],48)
    chk('abrazar con confianza',op(a['i'],'abrazar','abrazar.png',1.2))
    l=linea('rel_op','rel_op:',a['i'],'-');print('   opciones con 48:',l)
    if 'ligar' in l:
        op(a['i'],'ligar','ligar.png',1.2);p.dormir(0.3);p.shot(OUT+'/tarjeta_ligar.png')
        chk('ligar deja tarjeta','card=-' not in ui())
    r0=per(a['vid'])['rel'];op(a['i'],'discutir','discutir.png',1.4)
    chk('discutir baja la amistad',per(a['vid'])['rel']<r0,'%s -> %s'%(r0,per(a['vid'])['rel']))
    p.cmd('rel_ficha',a['i']);p.dormir(1.2);p.shot(OUT+'/ficha_conocida.png')
    # menores: nada de romance ni abrazos
    M=[v for v in visibles() if 12<=v['edad']<18]
    if M:
        p.cmd('rel_set',M[0]['i'],80);l=linea('rel_op','rel_op:',M[0]['i'],'-')
        chk('con menores no hay ligar ni abrazar',('ligar' not in l) and ('abrazar' not in l),l)
    # 6) pestaña Gente: conocidos, dónde están, ir a verla, llamar
    p.cmd('rel_set',b['i'],50)
    p.cmd('gente');p.dormir(1.2);p.shot(OUT+'/gente.png')
    chk('pestaña Gente abierta','panel=-' not in ui(),ui())
    p.cmd('rel_cerca',b['i'],5,4);p.dormir(1);p.cmd('gente');p.dormir(0.5);p.cmd('rel_ir',b['i'])
    esperar(lambda:'ficha=-' not in ui(),60,0.6)
    chk('«Ir a verla»: anda hasta ella y abre su ficha','ficha=-' not in ui(),ui())
    p.cmd('boton',1);esperar(lambda:'post=de_pie' in p.estado() and 'ruta=0' in p.estado(),20,0.5)
    r0=per(a['vid'])['rel']
    p.cmd('rel_llamar',a['i']);p.dormir(1.2);p.shot(OUT+'/llamando.png')
    esperar(lambda:per(a['vid'])['rel']!=r0 or 'Llamada' in ' '.join(p.log[-5:]),20,0.5);p.dormir(4);p.shot(OUT+'/tarjeta_llamada.png')
    chk('llamar: tarjeta de la llamada','card=-' not in ui())
    # 7) invitar a casa: viene a su hora, se sienta y se puede charlar con ella
    pu=None
    p.cmd('hora',17);p.dormir(1.5)
    dx=round(casa[0]);fz=round(casa[1]-2.1);p.cmd('poner',dx,fz+4);p.cmd('ir_xy',dx,fz-2.5)
    esperar(lambda:'dentro=true' in p.estado(),30,1.0)
    chk('en casa','dentro=true' in p.estado())
    p.cmd('rel_set',a['i'],60);p.cmd('rel_invitar',a['i'],5)
    chk('invitada: viene de camino',est().get('visita',{}).get('vid')==a['vid'],str(est().get('visita')))
    p.cmd('vel',5)
    esperar(lambda:est().get('visita',{}).get('est')=='dentro',200,1.0)
    p.cmd('vel',1);p.cmd('zoom',10);p.dormir(2.5);p.shot(OUT+'/visita_sofa.png')
    chk('la visita entra y se sienta',est().get('visita',{}).get('est')=='dentro',str(est().get('visita')))
    l=linea('rel_op','rel_op:',a['i'],'-');chk('con la visita: comer juntas y «que se vaya»','comer' in l and 'irse' in l,l)
    p.cmd('rel_ficha',a['i']);p.dormir(1.2);p.shot(OUT+'/ficha_visita.png')
    r0=per(a['vid'])['rel'];op(a['i'],'charlar','charla_visita.png',1.6)
    chk('charlar con la visita',per(a['vid'])['rel']>=r0)
    p.cmd('vel',5);p.cmd('accion','cocina','cocinar');esperar(lambda:'mano=plato' in p.estado(),120,1.0);p.cmd('vel',1)
    l=linea('rel_op','rel_op:',a['i'],'comer');esperar(lambda:any(x.startswith('rel_comer') for x in p.log),40,1.0)
    p.dormir(0.5);p.shot(OUT+'/tarjeta_comer.png')
    chk('comer juntas con un plato hecho',any(x.startswith('rel_comer') for x in p.log) and 'mano=plato' not in p.estado())
    linea('rel_op','rel_op:',a['i'],'irse');p.dormir(2);p.shot(OUT+'/visita_se_va.png')
    chk('«que se vaya»: se levanta y sale',est().get('visita',{}).get('est') in ('saliendo',None,''),str(est().get('visita')))
    # 8) favor en persona: viene andando, pide, se responde
    p.cmd('hora',12);p.dormir(1.5);V=[v for v in visibles() if v['edad']>=18 and v['meta'] not in ('bar','colegio','')]
    c=V[-1];p.cmd('rel_cerca',c['i'],6,4);p.cmd('rel_set',c['i'],50);p.dormir(1)
    l=linea('rel_favor','rel_favor:',c['i'],'mudanza');chk('alguien viene a pedirte un favor',l=='viene',l)
    esperar(lambda:est().get('busca')=='pide',60,0.6);p.dormir(1.0);p.shot(OUT+'/favor.png')
    chk('te pide el favor en persona (ficha con sí/no)',est().get('busca')=='pide' and 'ficha=-' not in ui(),str(est().get('busca')))
    r0=per(c['vid'])['rel'];p.cmd('rel_resp',0);p.dormir(1.5);p.shot(OUT+'/favor_no.png')
    chk('decir que no tiene su tarjeta y la relación lo nota',per(c['vid'])['rel']<=r0 and 'card=-' not in ui())
    # 9) saludo al cruzaros
    V=[v for v in visibles() if v['edad']>=18 and v['meta'] not in ('bar','colegio','') and v['vid'] not in (a['vid'],c['vid'])]
    if V:
        d=V[0];p.cmd('rel_set',d['i'],25);p.cmd('rel_cerca',d['i']);p.dormir(1)
        l=linea('rel_saludo','rel_saludo:');p.dormir(0.8);p.shot(OUT+'/saludo.png')
        chk('quien te conoce te saluda al cruzaros',l.isdigit() and int(l)>=1,l)
    # 10) guardado: la relación y lo descubierto sobreviven
    e1=est();p.cmd('guardar');p.cmd('cargar');p.dormir(1);e2=est()
    chk('guardar y cargar: relaciones y lo descubierto',e1['per'].keys()==e2['per'].keys() and abs(e1['per'][a['vid']]['rel']-e2['per'][a['vid']]['rel'])<0.2 and e2['per'][a['vid']]['sabe']==e1['per'][a['vid']]['sabe'],str(e2['per'].get(a['vid'])))
    p.cmd('rend');p.dormir(0.5);print('  ',[l for l in p.log if l.startswith('rend')][-1:])
    chk('sin errores en consola',not p.err,str(p.err[:3]))
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(R) else 'FALLA',sum(R),'/',len(R))
