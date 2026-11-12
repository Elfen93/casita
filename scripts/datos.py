#!/usr/bin/env python3
"""Casita · datos
   python3 scripts/datos.py          → comprueba data/*.json (sintaxis y referencias cruzadas)
   python3 scripts/datos.py --fmt    → además los reescribe con el formato de la casa
build.py llama a la comprobación antes de construir: si algo no cuadra, no hay build.
Qué es cada archivo y cada campo: data/README.md.
"""
import json,os,re,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));D=os.path.join(R,'data');R_=R
ANCHO=300  # una ficha cabe en una línea si no pasa de aquí; si pasa, se despliega un campo por línea

def cargar():
    d={}
    for f in sorted(os.listdir(D)):
        if f.endswith('.json'):
            try:d[f[:-5]]=json.load(open(os.path.join(D,f),encoding='utf-8'))
            except ValueError as e:raise SystemExit('DATA_FAIL data/%s: %s'%(f,e))
    return d


# ---------- censo del barrio: edificios, hogares y vecinos ----------
LAZOS=('pareja','hija','hijo','madre','padre','hermana','hermano','abuela','abuelo','nieta','nieto','amiga','ex','casera','inquilina','jefa','empleada','mal_rollo')
ESTUDIA=(None,'cole','instituto','fp','uni')
PERMITIDO_MENOR=('parque','biblioteca','super','tienda','parroquia','comedor','ateneo','ambulatorio','gymbueno')
def censo(P,lug,ideo,E,dentro):
    ed,ho,vs=P.get('edificios',{}),P.get('hogares',{}),P.get('vecinos',[])
    ids=[v['id'] for v in vs]
    if len(set(ids))!=len(ids):E.append('personas.vecinos: ids repetidos %s'%sorted({i for i in ids if ids.count(i)>1}))
    por={v['id']:v for v in vs}
    for k,e in ed.items():
        if e.get('tipo') not in ('bloque','casa'):E.append('personas.edificios.%s.tipo: bloque o casa'%k)
        if not(e.get('n') and e.get('d') and isinstance(e.get('plantas'),int)):E.append('personas.edificios.%s: faltan n, d o plantas'%k)
    for k,h in ho.items():
        q='personas.hogares.%s'%k
        dentro(q+'.edificio',[h.get('edificio')],ed,'personas.edificios')
        if h.get('tipo') not in ('familia','monoparental','pareja','sola','compartido','tres_generaciones'):E.append(q+'.tipo: «%s» no vale'%h.get('tipo'))
        if h.get('cls') not in (0,1,2,3,4):E.append(q+'.cls: de 0 a 4')
        bloque=ed.get(h.get('edificio'),{}).get('tipo')=='bloque'
        if bool(h.get('puerta'))!=bloque:E.append(q+'.puerta: solo y siempre en bloques')
        if not(h.get('n') and h.get('d')):E.append(q+': faltan n o d')
        dentro(q+'.miembros',h.get('miembros',[]),por,'personas.vecinos')
        if not h.get('miembros'):E.append(q+': sin miembros')
        if len(set(h.get('miembros',[])))!=len(h.get('miembros',[])):E.append(q+'.miembros: repetidos')
        if h.get('miembros') and not any(por[m]['edad']>=18 for m in h['miembros'] if m in por):E.append(q+': no hay ninguna persona adulta')
    mis={m:k for k,h in ho.items() for m in h.get('miembros',[])}
    for v in vs:
        i=v['id'];q='personas.vecinos.%s'%i
        dentro(q+'.hogar',[v.get('hogar')],ho,'personas.hogares')
        if v.get('hogar') in ho and mis.get(i)!=v['hogar']:E.append(q+': no está en miembros de su hogar %s'%v['hogar'])
        for k in ('rol','historia','trabajo','estudia','lazos'):
            if k not in v:E.append(q+': falta «%s»'%k)
        if v.get('estudia') not in ESTUDIA:E.append(q+'.estudia: «%s» no vale'%v.get('estudia'))
        ce=v.get('centro')
        if v.get('estudia') in ('cole','instituto'):
            if ce not in ({'cole':('colegio','concertado'),'instituto':('instituto','concertado')}[v['estudia']]):E.append(q+'.centro: «%s» no vale para %s'%(ce,v['estudia']))
            elif ce not in lug:E.append(q+'.centro: «%s» no existe en lugares'%ce)
        elif v.get('estudia')=='uni':
            if ce not in ('uni_publica','uni_privada') or ce not in lug:E.append(q+'.centro: quien estudia uni va a uni_publica o uni_privada')
        elif ce is not None:E.append(q+'.centro: solo quien estudia en cole, instituto o uni')
        for o,t in v.get('lazos',[]):
            if o not in por:E.append(q+'.lazos: «%s» no existe'%o)
            if o==i:E.append(q+'.lazos: lazo consigo misma')
            if t not in LAZOS:E.append(q+'.lazos: tipo «%s» no vale'%t)
        if v['edad']<16:
            if v.get('oficio') is not None or v.get('ideo') is not None:E.append(q+': menor de 16 con oficio o ideo')
            if v.get('trabajo'):E.append(q+': menor de 16 que trabaja')
        if v['edad']<18:
            for lg,a,b,ds in v['donde']:
                if lg not in PERMITIDO_MENOR:E.append(q+'.donde: menor en «%s»'%lg)
                if lg=='gymbueno' and v['edad']<14:E.append(q+'.donde: gymbueno desde los 14')
                if b>22:E.append(q+'.donde: menor fuera de casa después de las 22')
        if v.get('estudia') in ('cole','instituto','fp'):
            for lg,a,b,ds in v['donde']:
                if set(ds)&set(range(5)) and a<14 and b>9:E.append(q+'.donde: «%s» %d-%d en horario de clase'%(lg,a,b))
        for lg,a,b,ds in v['donde']:
            if not(0<=a<b<=24) or not ds or any(d not in range(7) for d in ds):E.append(q+'.donde: horas o días mal en «%s»'%lg)
        for n,(l1,a1,b1,d1) in enumerate(v['donde']):
            for l2,a2,b2,d2 in v['donde'][n+1:]:
                if a1<b2 and a2<b1 and set(d1)&set(d2):E.append(q+'.donde: «%s» y «%s» se pisan'%(l1,l2))
        t=v.get('trabajo')
        if t:
            lg=t.get('lugar');a,b=t.get('h',[0,0]);ds=t.get('dias',[])
            if lg!='fuera':dentro(q+'.trabajo.lugar',[lg],lug,'lugares.lugares')
            if len(t.get('puesto',[]))!=2 or not(0<=a<b<=24) or not ds or any(d not in range(7) for d in ds):E.append(q+'.trabajo: puesto [f,m], h o dias mal')
            if lg=='fuera':
                for l2,a2,b2,d2 in v['donde']:
                    if a<b2 and a2<b and set(ds)&set(d2):E.append(q+'.trabajo: trabaja fuera y «%s» %d-%d lo pisa'%(l2,a2,b2))
            elif not any(l2==lg and a2<=a and b<=b2 and set(ds)<=set(d2) for l2,a2,b2,d2 in v['donde']):E.append(q+'.trabajo: no cuadra con donde (%s %d-%d)'%(lg,a,b))

# ---------- tratar con los vecinos (mods/trato.js) ----------
TR_FX=('rel','social','diversion','hambre','energia','coste_h','fiar_h','presta_h','presto_h','pista','despensa','agua','hijos_hap','mov','sol','te','chisme')
TR_REQ=('huerto','hijos_cole','con_trabajo','en_paro','trabajo_dentro','ella_hijos','bloque','politica','justa','solvente')
TR_HUECOS=('v','x','y','k','c','n','o','quien','sitio','frase','que','st','l','why')
TR_ACT=(None,'out','tr:curro','tr:chisme','tr:asamblea','tr:ok','tr:no','tr:pagar','tr:luego')
def trato(T,lug,ideo,E,dentro):
    def textos(q,x):
        if isinstance(x,str):
            for h in re.findall(r'\{(\w+)\}',x):
                if h not in TR_HUECOS:E.append('%s: hueco {%s} desconocido'%(q,h))
        elif isinstance(x,list):
            for y in x:textos(q,y)
        elif isinstance(x,dict):
            for k,y in x.items():textos(q+'.'+k,y)
    textos('trato',T)
    def par(q,L):
        if not(isinstance(L,list) and L and all(isinstance(x,list) and len(x)==2 and all(isinstance(t,str) and t for t in x) for x in L)):E.append('%s: lista de [título, línea]'%q)
    def accion(q,a,ids):
        if not(a.get('id') and a.get('e') and a.get('n')):E.append('%s: faltan id, e o n'%q);return
        if a['id'] in ids:E.append('%s: id repetido'%q)
        ids.add(a['id']);par(q+'.ok',a.get('ok'))
        if 'ko' in a:par(q+'.ko',a['ko'])
        for k in list(a.get('fx',{}))+list(a.get('fxko',{})):
            if k not in TR_FX:E.append('%s: efecto «%s» desconocido'%(q,k))
        dentro(q+'.req',a.get('req',[]),TR_REQ,'trato (req)')
        if 'p' in a and not 0<a['p']<=1:E.append('%s.p: entre 0 y 1'%q)
    for k,o in T['oficios'].items():
        ids=set()
        if not(o.get('acciones') or o.get('nota')):E.append('trato.oficios.%s: ni acciones ni nota'%k)
        for a in o.get('acciones',[]):accion('trato.oficios.%s.%s'%(k,a.get('id')),a,ids)
    dentro('trato.lugares',T['lugares'],lug,'lugares.lugares')
    for k,o in T['lugares'].items():
        ids=set()
        for a in o['acciones']:accion('trato.lugares.%s.%s'%(k,a.get('id')),a,ids)
    for k,f in T['favores'].items():
        q='trato.favores.'+k
        if f.get('dir') not in ('pedir','pide'):E.append(q+'.dir: pedir o pide')
        for c in ('e','n','rel','mem','ok','ko' if f.get('dir')=='pedir' else 'rechazo','fx'):
            if c not in f:E.append('%s: falta %s'%(q,c))
        for c in ('ok','ko','rechazo'):
            if c in f:par(q+'.'+c,f[c])
        for c in list(f.get('fx',{}))+list(f.get('fxko',{}))+list(f.get('fxno',{})):
            if c not in TR_FX:E.append('%s: efecto «%s» desconocido'%(q,c))
        dentro(q+'.req',f.get('req',[]),TR_REQ,'trato (req)')
        if f.get('dir')=='pide':
            if f.get('modo') not in ('visita','ya'):E.append(q+'.modo: visita o ya')
            for c in ('msg','corto','si','no','fxko','fxno'):
                if c not in f:E.append('%s: falta %s'%(q,c))
            for c in ('si','no'):
                if len(f.get(c,[]))!=2:E.append('%s.%s: [etiqueta, respuesta]'%(q,c))
    C=T['politica']['cercanas']
    dentro('trato.politica.cercanas',C,ideo,'ideologias.ideologias')
    for k,v in C.items():dentro('trato.politica.cercanas.'+k,v,ideo,'ideologias.ideologias')
    R=T['romance']
    if abs(sum(w for _,w in R['orientacion'])-1)>1e-6:E.append('trato.romance.orientacion: los pesos suman 1')
    dentro('trato.romance.orientacion',[o for o,_ in R['orientacion']],('hetero','homo','ambos','nadie'),'hetero, homo, ambos, nadie')
    if R['edad_min']<18:E.append('trato.romance.edad_min: nunca menos de 18')
    for k,m in T['buscan']['mensajes'].items():
        q='trato.buscan.mensajes.'+k
        if not(len(m['rel'])==2 and m['rel'][0]<m['rel'][1]):E.append(q+'.rel: [mínimo, máximo]')
        dentro(q+'.req',m.get('req',[]),TR_REQ,'trato (req)')
        for r in m['resp']:
            if len(r)!=5 or r[2] not in TR_ACT:E.append('%s.resp: [etiqueta, relación, acción, respuesta, lo que escribe]; acción de %s'%(q,TR_ACT))
    for k,m in T['buscan']['visita'].items():
        par('trato.buscan.visita.%s.ok'%k,m['ok'])
        for c in m['fx']:
            if c not in TR_FX:E.append('trato.buscan.visita.%s: efecto «%s» desconocido'%(k,c))
    # cada texto de la ficha que usa el código existe
    src=open(os.path.join(R_,'mods','trato.js'),encoding='utf-8').read() if os.path.exists(os.path.join(R_,'mods','trato.js')) else ''
    for c in set(re.findall(r"trT\('(\w+)'",src))|set(re.findall(r"TRF\(\)\.(\w+)",src)):
        if c not in T['ficha']:E.append('trato.ficha: falta «%s» (lo usa mods/trato.js)'%c)

# ---------- comprobaciones: cada una devuelve una lista de fallos ----------
def comprobar(d):
    E=[]
    def dentro(que,ids,validos,donde):
        for i in ids:
            if i not in validos:E.append('%s: «%s» no existe en %s'%(que,i,donde))
    def mismas(que,a,b):
        if set(a)!=set(b):E.append('%s: sobran %s, faltan %s'%(que,sorted(set(a)-set(b)),sorted(set(b)-set(a))))
    L,V,P,PR,O,LB,ED,I,ID,G,RG=(d[k] for k in ('lugares','viviendas','personas','profesiones','objetos','libros','estudios','interacciones','ideologias','gobiernos','reglas'))
    if 'trato' in d:trato(d['trato'],L['lugares'],ID['ideologias'],E,dentro)
    lug,sal,sec,obj=L['lugares'],L['salidas'],PR['sectores'],O['objetos']
    nec=[n[0] for n in RG['necesidades']];hab=[h[0] for h in PR['habilidades']];ideo=ID['ideologias'];gov=G['gobiernos']
    # lugares y salidas
    for k,p in lug.items():
        dentro('lugares.%s.outs'%k,p.get('outs',[]),sal,'lugares.salidas')
        if len(p.get('r',[]))!=4:E.append('lugares.%s.r: hacen falta 4 números [x0,y0,x1,y1]'%k)
    # horarios de apertura: [[desde,hasta,[días]],…]; hasta > 24 = cierra de madrugada del día siguiente
    for k,p in lug.items():
        ab=p.get('abre')
        if ab is None:
            if k not in ('casaV','casa2'):E.append('lugares.%s: falta abre [[desde,hasta,[días]],…] (solo las casas particulares no lo llevan)'%k)
            continue
        q='lugares.%s.abre'%k;porDia={}
        if not isinstance(ab,list) or not ab:E.append(q+': tiene que ser una lista de franjas');continue
        for f in ab:
            if not(isinstance(f,list) and len(f)==3 and all(isinstance(x,(int,float)) for x in f[:2]) and isinstance(f[2],list) and f[2]):E.append(q+': franja mal formada %s'%f);continue
            d0,h0,ds=f
            if not(0<=d0<h0<=30 and h0-d0<=24):E.append(q+': horas incoherentes %s'%f)
            if any(not isinstance(x,int) or not 0<=x<=6 for x in ds) or len(set(ds))!=len(ds):E.append(q+': días de 0 (lunes) a 6, sin repetir: %s'%f);continue
            for x in ds:
                for o in porDia.get(x,[]):
                    if d0<o[1] and o[0]<h0:E.append(q+': franjas que se pisan el día %d'%x)
                porDia.setdefault(x,[]).append((d0,h0))
    mismas('lugares.trabajo_en',L['trabajo_en'],sec)
    dentro('lugares.trabajo_en',[v for v in L['trabajo_en'].values() if v!='_ride'],lug,'lugares.lugares')
    dentro('lugares.salidas_necesidades',L['salidas_necesidades'],sal,'lugares.salidas')
    for k,v in L['salidas_necesidades'].items():dentro('lugares.salidas_necesidades.%s'%k,v,nec,'reglas.necesidades')
    for nom,ks in L['salidas_grupos']:dentro('lugares.salidas_grupos «%s»'%nom,ks,sal,'lugares.salidas')
    for k,s in sal.items():
        if not(isinstance(s.get('dur'),(int,float)) and len(s.get('h',[]))==2):E.append('lugares.salidas.%s: faltan dur o h [desde,hasta]'%k)
    # sucesos: los textos de cada colegio
    import re as _re
    CE=d['sucesos'].get('centros',{})
    for c in ('colegio','concertado','instituto'):
        if c not in CE or c not in lug:E.append('sucesos.centros.%s: falta (o no es un lugar)'%c);continue
        ids=[x.get('id') for x in CE[c].get('sucesos',[])]
        if len(ids)<2 or len(set(ids))!=len(ids):E.append('sucesos.centros.%s.sucesos: dos o tres, con id distinto'%c)
        for x in CE[c].get('sucesos',[]):
            if not(0<x.get('p',0)<=.05):E.append('sucesos.centros.%s.%s.p: probabilidad por día entre 0 y 0.05'%(c,x.get('id')))
            if x.get('hap',0)!=x.get('hap',0) or not isinstance(x.get('tell'),str):E.append('sucesos.centros.%s.%s: falta tell'%(c,x.get('id')))
        if not CE[c].get('puerta'):E.append('sucesos.centros.%s.puerta: sin frases'%c)
    ok={'k','c','c2','v','a','p','n','o','m','t','q','y','d','h','lo','ampa'}
    for m in _re.finditer(r'\{(\w+)\}',json.dumps([CE]+[d['sucesos']['dilemas'][q] for q in ('cr_cole','cr_cole_cambio','calentador_plazo')],ensure_ascii=False)):
        if m.group(1) not in ok:E.append('sucesos: hueco {%s} que el código no rellena (centros, cr_cole*, calentador_plazo)'%m.group(1))
    # viviendas
    dentro('viviendas.orden',V['orden'],V['viviendas'],'viviendas.viviendas')
    mismas('viviendas.compra',V['compra'],RG['dificultades'])
    # profesiones
    mismas('profesiones.orden',PR['orden'],sec);mismas('profesiones.prob_contrato',PR['prob_contrato'],sec)
    for k,s in sec.items():
        if not s.get('levels'):E.append('profesiones.sectores.%s: sin niveles'%k)
        for n in s.get('levels',[]):dentro('profesiones.sectores.%s «%s».req'%(k,n.get('t')),[r for r in n.get('req',{}) if r!='shifts'],hab,'profesiones.habilidades')
        if s.get('needs'):dentro('profesiones.sectores.%s.needs'%k,[s['needs']],obj,'objetos.objetos')
    for k,v in PR['oficio_por_objeto'].items():dentro('profesiones.oficio_por_objeto.%s'%k,[v[0]],hab,'profesiones.habilidades')
    dentro('profesiones.oficio_por_objeto',PR['oficio_por_objeto'],obj,'objetos.objetos')
    dentro('personas.jefes_trato',P['jefes_trato'],sec,'profesiones.sectores')
    # objetos
    for k,o in obj.items():
        dentro('objetos.%s.need'%k,o.get('need',{}),nec,'reglas.necesidades')
        if o.get('sk'):dentro('objetos.%s.sk'%k,[o['sk']],hab,'profesiones.habilidades')
        if not isinstance(o.get('p'),(int,float)):E.append('objetos.%s: falta el precio (p)'%k)
    for s in ('actividades','desgaste','zonas_por_objeto','zona_de','grupo','habitacion_de'):dentro('objetos.'+s,O[s],obj,'objetos.objetos')
    for k,acts in O['actividades'].items():
        for a in acts:
            if len(a) not in (8,9):E.append('objetos.actividades.%s «%s»: son 8 o 9 valores, hay %d'%(k,a[0],len(a)));continue
            if a[4] is not None:dentro('objetos.actividades.%s «%s» (habilidad)'%(k,a[0]),[a[4]],hab,'profesiones.habilidades')
            dentro('objetos.actividades.%s «%s» (necesidades)'%(k,a[0]),a[7],nec,'reglas.necesidades')
    for k,z in O['zonas_por_objeto'].items():dentro('objetos.zonas_por_objeto.%s'%k,[x for x in z if x not in ('libre','jardin')],O['zonas'],'objetos.zonas')
    dentro('objetos.zona_de',O['zona_de'].values(),O['zonas'],'objetos.zonas')
    dentro('objetos.compra_por_necesidad',O['compra_por_necesidad'],nec,'reglas.necesidades');dentro('objetos.compra_por_necesidad',O['compra_por_necesidad'].values(),obj,'objetos.objetos')
    mismas('objetos.suelos_orden',[str(x) for x in O['suelos_orden']],O['suelos'])
    dentro('personas.rasgos_objetos',P['rasgos_objetos'],P['rasgos'],'personas.rasgos')
    for k,v in P['rasgos_objetos'].items():dentro('personas.rasgos_objetos.%s'%k,v,obj,'objetos.objetos')
    dentro('personas.rasgos (cat)',[t['cat'] for t in P['rasgos'].values() if 'cat' in t],[c[0] for c in P['rasgos_categorias']],'personas.rasgos_categorias')
    dentro('personas.rasgos (no)',[t['no'] for t in P['rasgos'].values() if 'no' in t],P['rasgos'],'personas.rasgos')
    # libros y estudios
    tit=[b[0] for b in LB['catalogo']]
    if len(set(tit))!=len(tit):E.append('libros.catalogo: hay títulos repetidos')
    dentro('libros.en_casa',LB['en_casa'],tit,'libros.catalogo')
    mismas('estudios.orden',ED['orden'],ED['niveles'])
    dentro('estudios.programas (lv)',[p['lv'] for p in ED['programas'].values() if p.get('lv')],ED['niveles'],'estudios.niveles')
    dentro('estudios.requisitos',ED['requisitos'],sec,'profesiones.sectores');dentro('estudios.sueldo',ED['sueldo'],sec,'profesiones.sectores')
    for k,v in ED['requisitos'].items():dentro('estudios.requisitos.%s'%k,v,ED['niveles'],'estudios.niveles')
    for k,v in ED['sueldo'].items():dentro('estudios.sueldo.%s'%k,v,ED['niveles'],'estudios.niveles')
    # ideologías y gobiernos
    mismas('ideologias.orden',ID['orden'],ideo)
    for k,v in ideo.items():
        dentro('ideologias.%s.tracks'%k,v.get('tracks',[]),sec,'profesiones.sectores')
        dentro('ideologias.%s.act'%k,v.get('act',{}),sal,'lugares.salidas')
        if v.get('vote'):dentro('ideologias.%s.vote'%k,[v['vote']],gov,'gobiernos.gobiernos')
    dentro('ideologias.izquierda',ID['izquierda'],ideo,'ideologias.ideologias');dentro('ideologias.derecha',ID['derecha'],ideo,'ideologias.ideologias')
    for v in P.get('vecinos',[]):
        if v['ideo'] is not None:dentro('personas.vecinos.%s.ideo'%v['id'],[v['ideo']],ideo,'ideologias.ideologias')
        dentro('personas.vecinos.%s.donde'%v['id'],[x[0] for x in v['donde']],lug,'lugares.lugares')
    censo(P,lug,ideo,E,dentro)
    # mapa del barrio: cada edificio del censo tiene su sitio
    B=d.get('barrio')
    if B:
        mismas('barrio.edificios',B.get('edificios',{}),P['edificios'])
        for k,e in B.get('edificios',{}).items():
            r=e.get('r',[])
            if len(r)!=4 or not(r[0]<r[2] and r[1]<r[3]):E.append('barrio.edificios.%s.r: [x0,y0,x1,y1] con x0<x1 e y0<y1'%k)
            if not e.get('rotulo'):E.append('barrio.edificios.%s: falta rotulo'%k)
        rs=[('lugares.'+k,p['r']) for k,p in lug.items()]+[('barrio.'+k,e['r']) for k,e in B.get('edificios',{}).items() if len(e.get('r',[]))==4]
        for i,(n1,a) in enumerate(rs):
            for n2,c in rs[i+1:]:
                if n1.startswith('lugares.') and n2.startswith('lugares.'):continue
                if len(a)==4 and len(c)==4 and a[0]<c[2] and c[0]<a[2] and a[1]<c[3] and c[1]<a[3]:E.append('barrio: %s y %s se pisan en el mapa'%(n1,n2))
    dentro('ideologias.reparto',[r[0] for r in ID['reparto']],ideo,'ideologias.ideologias')
    dentro('ideologias.voces',ID['voces'],gov,'gobiernos.gobiernos')
    for g,v in ID['voces'].items():dentro('ideologias.voces.%s'%g,v,ideo,'ideologias.ideologias')
    dentro('gobiernos.ciclos',G['ciclos'],gov,'gobiernos.gobiernos');dentro('gobiernos.fiscal',G['fiscal'],gov,'gobiernos.gobiernos')
    for g,f in G['fiscal'].items():
        if f.get('k')!=g:E.append('gobiernos.fiscal.%s: el campo k dice «%s»'%(g,f.get('k')))
        for t in ('tr','ah'):
            if [x[0] for x in f[t]]!=sorted(x[0] for x in f[t]):E.append('gobiernos.fiscal.%s.%s: los tramos van de menor a mayor'%(g,t))
    # reglas e interacciones
    mismas('reglas.peso_necesidad',RG['peso_necesidad'],nec);mismas('reglas.verbo_necesidad',RG['verbo_necesidad'],nec)
    mismas('reglas.dificultades_orden',RG['dificultades_orden'],RG['dificultades'])
    mismas('reglas.tiempo_prob',RG['tiempo_prob'],RG['estaciones'])
    for e,ps in RG['tiempo_prob'].items():dentro('reglas.tiempo_prob.%s'%e,[p[0] for p in ps],RG['tiempo'],'reglas.tiempo')
    if len(RG['dias'])!=7 or len(RG['dias_corto'])!=7 or len(RG['meses'])!=12:E.append('reglas: son 7 días y 12 meses')
    for k,g in I['gestos'].items():
        if not(g.get('n') and g.get('e')):E.append('interacciones.gestos.%s: faltan nombre (n) o icono (e)'%k)
    return E

# ---------- formato ----------
def una(v):return json.dumps(v,ensure_ascii=False,separators=(', ',': '))
def fmt(v,ind,extra=0):
    s=una(v)
    if not isinstance(v,(dict,list)) or not v or len(s)+ind+extra<=ANCHO:return s
    pad=' '*(ind+2)
    if isinstance(v,dict):return '{\n'+',\n'.join(pad+json.dumps(k,ensure_ascii=False)+': '+fmt(x,ind+2,len(k)+4) for k,x in v.items())+'\n'+' '*ind+'}'
    return '[\n'+',\n'.join(pad+fmt(x,ind+2) for x in v)+'\n'+' '*ind+']'
def texto(secs):
    # cada sección separada por una línea en blanco; las colecciones largas, una ficha por línea
    partes=[]
    for k,v in secs.items():
        if isinstance(v,dict) and v and len(una(v))>ANCHO:cuerpo='{\n'+',\n'.join('    '+json.dumps(kk,ensure_ascii=False)+': '+fmt(x,4,len(kk)+4) for kk,x in v.items())+'\n  }'
        elif isinstance(v,list) and v and len(una(v))>ANCHO:cuerpo='[\n'+',\n'.join('    '+fmt(x,4) for x in v)+'\n  ]'
        else:cuerpo=una(v)
        partes.append('  '+json.dumps(k,ensure_ascii=False)+': '+cuerpo)
    return '{\n'+',\n\n'.join(partes)+'\n}\n'
def formatear(d):
    n=0
    for f,secs in d.items():
        p=os.path.join(D,f+'.json');t=texto(secs);assert json.loads(t)==secs
        if open(p,encoding='utf-8').read()!=t:open(p,'w',encoding='utf-8').write(t);n+=1
    return n

if __name__=='__main__':
    d=cargar()
    if '--fmt' in sys.argv:print('formateados:',formatear(d))
    E=comprobar(d)
    for e in E:print('✗',e)
    print('DATA_FAIL' if E else 'DATA_OK',sum(len(v)-('_' in v) for v in d.values()),'secciones en',len(d),'archivos')
    sys.exit(1 if E else 0)
