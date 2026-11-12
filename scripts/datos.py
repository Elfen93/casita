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

# ---------- la ciudad: barrios, calles, puertas y enlaces ----------
# Los mismos cálculos están en mods/barrio.js (cdGrafo, cdCamino, cdTrayecto): si cambia uno, cambia el otro.
AVISOS=[]
HOGAR_TIPOS_CASA=('casa','casaV','casa2')
def _k(p):return (round(float(p[0]),1),round(float(p[1]),1))
def _horiz(c):return c['a'][1]==c['b'][1]
def _en(c,p):
    a,b=c['a'],c['b']
    if _horiz(c):return abs(p[1]-a[1])<1e-6 and a[0]-1e-6<=p[0]<=b[0]+1e-6
    return abs(p[0]-a[0])<1e-6 and a[1]-1e-6<=p[1]<=b[1]+1e-6
def grafo(bar,extra=()):
    cal=bar['calles'];pts={_k(c['a']) for c in cal}|{_k(c['b']) for c in cal}
    for i,c in enumerate(cal):
        for e in cal[i+1:]:
            if _horiz(c)==_horiz(e):continue
            h,v=(c,e) if _horiz(c) else (e,c);p=_k((v['a'][0],h['a'][1]))
            if _en(h,p) and _en(v,p):pts.add(p)
    for p in list(bar.get('puertas',{}).values()):pts.add(_k(p))
    for p in extra:pts.add(_k(p))
    adj={p:[] for p in pts}
    for c in cal:
        ps=sorted((p for p in pts if _en(c,p)),key=lambda p:p[0]+p[1])
        for a,b in zip(ps,ps[1:]):
            l=abs(a[0]-b[0])+abs(a[1]-b[1]);adj[a].append((b,l));adj[b].append((a,l))
    return adj
def camino(adj,a,b):
    import heapq
    a,b=_k(a),_k(b)
    if a not in adj or b not in adj:return None
    dist={a:0};prev={};h=[(0,a)]
    while h:
        d0,u=heapq.heappop(h)
        if d0>dist.get(u,1e18):continue
        if u==b:break
        for v,l in adj[u]:
            if d0+l<dist.get(v,1e18)-1e-9:dist[v]=d0+l;prev[v]=u;heapq.heappush(h,(d0+l,v))
    if b not in dist:return None
    r=[b]
    while r[-1]!=a:r.append(prev[r[-1]])
    return dist[b],r[::-1]
def _rect_dist(r,p):
    dx=max(r[0]-p[0],0,p[0]-r[2]);dy=max(r[1]-p[1],0,p[1]-r[3]);return (dx*dx+dy*dy)**.5
def _pisa(a,b,m=0):return a[0]<b[2]+m and b[0]<a[2]+m and a[1]<b[3]+m and b[1]<a[3]+m
def _calle_rect(c):
    h=c['w']/2
    return [c['a'][0],c['a'][1]-h,c['b'][0],c['b'][1]+h] if _horiz(c) else [c['a'][0]-h,c['a'][1],c['b'][0]+h,c['b'][1]]
def trayecto_py(C,pa,pb):
    """pa, pb = (barrio,[x,y]). Devuelve (minutos, precio_h, lineas usadas) por Dijkstra sobre pie y líneas."""
    import heapq
    esc=C['ciudad'];mc=esc['m_casilla']/1000*esc['min_km'];B=C['barrios'];en=C['enlaces']
    esp={b:[] for b in B}
    for l in en['pie']:esp[l['a']].append(l['pa']);esp[l['b']].append(l['pb'])
    for l in en['lineas']:
        for s in l['paradas']:esp[s['b']].append(s['p'])
    esp[pa[0]].append(pa[1]);esp[pb[0]].append(pb[1])
    G={b:grafo(B[b],esp[b]) for b in B}
    nodos={}
    def add(u,v,c,tag=None):nodos.setdefault(u,[]).append((v,c,tag));nodos.setdefault(v,[])
    for b in B:
        ps=sorted({_k(p) for p in esp[b]})
        for i,p in enumerate(ps):
            for q in ps[i+1:]:
                r=camino(G[b],p,q)
                if r:add(('g',b)+p,('g',b)+q,r[0]*mc);add(('g',b)+q,('g',b)+p,r[0]*mc)
    for l in en['pie']:
        c=l['m']/1000*esc['min_km'];u=('g',l['a'])+_k(l['pa']);v=('g',l['b'])+_k(l['pb']);add(u,v,c);add(v,u,c)
    for l in en['lineas']:
        for i,s in enumerate(l['paradas']):
            g=('g',s['b'])+_k(s['p']);o=('l',l['id'],i);add(g,o,l['cada']/2,l['id']);add(o,g,0)
            if i:
                o0=('l',l['id'],i-1);c=l['min'][i-1];add(o0,o,c);add(o,o0,c)
    src=('g',pa[0])+_k(pa[1]);dst=('g',pb[0])+_k(pb[1])
    dist={src:0};prev={};h=[(0,src)]
    while h:
        d0,u=heapq.heappop(h)
        if d0>dist.get(u,1e18):continue
        if u==dst:break
        for v,c,t in nodos.get(u,[]):
            if d0+c<dist.get(v,1e18)-1e-9:dist[v]=d0+c;prev[v]=(u,t);heapq.heappush(h,(d0+c,v))
    if dst not in dist:return None
    precio=0;usadas=[];u=dst
    while u!=src:
        p,t=prev[u];
        if t:precio+=next(l['precio_h'] for l in en['lineas'] if l['id']==t);usadas.append(t)
        u=p
    return round(dist[dst],1),round(precio,3),usadas[::-1]
def ciudad(d,E,dentro,mismas):
    C=d['ciudad'];L=d['lugares'];P=d['personas'];BA=d.get('barrio',{});V=d['viviendas']
    if not C.get('barrios'):E.append('ciudad.barrios: vacío');return
    esc=C.get('ciudad',{});mp=esc.get('m_plano',100);mc=esc.get('m_casilla',10);k=mp/mc
    if not(esc.get('n') and mc>0 and mp>0 and esc.get('min_km')==12):E.append('ciudad.ciudad: n, m_casilla, m_plano y min_km (12 min por km)')
    B=C['barrios'];mismas('ciudad.orden',C.get('orden',[]),B)
    if len(B)<5 or len(B)>7:E.append('ciudad.barrios: de 5 a 7 barrios, hay %d'%len(B))
    tam={}
    for b,x in B.items():
        q='ciudad.barrios.%s'%b
        for f in ('n','tipo','tipo_n','e','c','d','bueno','cuesta'):
            if not x.get(f):E.append('%s: falta %s'%(q,f))
        if not isinstance(x.get('alquiler'),(int,float)) or x['alquiler']<=0:E.append(q+'.alquiler: número > 0 (1 = la media de la ciudad)')
        pl=x.get('plano',[])
        if len(pl)!=4 or not(pl[0]<pl[2] and pl[1]<pl[3]):E.append(q+'.plano: [x0,y0,x1,y1]');continue
        tam[b]=((pl[2]-pl[0])*k,(pl[3]-pl[1])*k)
    for i,(a,x) in enumerate(B.items()):
        for c,y in list(B.items())[i+1:]:
            if a in tam and c in tam and _pisa(x['plano'],y['plano']):E.append('ciudad: los planos de %s y %s se pisan'%(a,c))
    # lo que hay en cada barrio: lugares, edificios del censo, lugares solo de mapa y casas
    cosas={b:{} for b in B};casas={b:{} for b in B}
    def poner(id,bar,rb,q):
        if bar not in B:E.append('%s.barrio: «%s» no es un barrio'%(q,bar));return
        if not(isinstance(rb,list) and len(rb)==4 and rb[0]<rb[2] and rb[1]<rb[3]):E.append('%s.rb: [x0,y0,x1,y1] con x0<x1 e y0<y1'%q);return
        if id in cosas[bar]:E.append('%s: id repetido en el barrio'%q)
        cosas[bar][id]=rb
    ids=set()
    for kk,p in L['lugares'].items():
        ids.add(kk)
        if p.get('barrio')=='@casa':
            if kk not in ('casaV','casa2'):E.append('lugares.%s.barrio: «@casa» solo vale para casaV y casa2'%kk)
            if 'rb' in p:E.append('lugares.%s: con barrio «@casa» el rectángulo lo da ciudad.barrios.*.casa'%kk)
        else:poner(kk,p.get('barrio'),p.get('rb'),'lugares.'+kk)
    for kk,p in L.get('solo_mapa',{}).items():
        if kk in ids:E.append('lugares.solo_mapa.%s: el id ya es un lugar'%kk)
        ids.add(kk)
        for f in ('n','e','d','abre','h','c'):
            if f not in p:E.append('lugares.solo_mapa.%s: falta %s'%(kk,f))
        if p.get('outs'):E.append('lugares.solo_mapa.%s: sin salidas ni escena interior'%kk)
        poner(kk,p.get('barrio'),p.get('rb'),'lugares.solo_mapa.'+kk)
    if not 0<=len(L.get('solo_mapa',{}))<=12:E.append('lugares.solo_mapa: como mucho 12 lugares solo de mapa, hay %d'%len(L.get('solo_mapa',{})))
    for kk,e in BA.get('edificios',{}).items():
        if kk in ids:E.append('barrio.edificios.%s: el id ya es un lugar'%kk)
        poner(kk,e.get('barrio'),e.get('rb'),'barrio.edificios.'+kk)
    usados=set(C.get('vivienda',{}).values())
    mismas('ciudad.vivienda',C.get('vivienda',{}),V['viviendas'])
    dentro('ciudad.vivienda',usados,B,'ciudad.barrios')
    for b,x in B.items():
        for kk,rb in x.get('casa',{}).items():
            if kk not in HOGAR_TIPOS_CASA:E.append('ciudad.barrios.%s.casa.%s: solo casa, casaV y casa2'%(b,kk))
            casas[b][kk]=rb
        if b in usados and set(casas[b])!=set(HOGAR_TIPOS_CASA):E.append('ciudad.barrios.%s: aquí vive el personaje según ciudad.vivienda: faltan casa, casaV y casa2 en «casa»'%b)
    # calles, edificios y puertas de cada barrio
    for b,x in B.items():
        if b not in tam:continue
        q='ciudad.barrios.%s'%b;w,h=tam[b];cal=x.get('calles',[]);nom=set()
        if not cal:E.append(q+'.calles: vacío');continue
        for c in cal:
            if c.get('n') in nom:E.append('%s.calles: nombre repetido «%s»'%(q,c.get('n')))
            nom.add(c.get('n'))
            a,bb,ww=c.get('a'),c.get('b'),c.get('w')
            if not(a and bb and len(a)==2 and len(bb)==2 and isinstance(ww,(int,float)) and ww>0):E.append('%s.calles.%s: n, a, b y w'%(q,c.get('n')));continue
            if not((a[0]==bb[0] and a[1]<bb[1]) or (a[1]==bb[1] and a[0]<bb[0])):E.append('%s.calles.%s: recta horizontal o vertical, de a (menor) a b'%(q,c['n']));continue
            if not(0<=a[0] and 0<=a[1] and bb[0]<=w and bb[1]<=h):E.append('%s.calles.%s: sale del barrio (%gx%g)'%(q,c['n'],w,h))
        for i,c in enumerate(cal):
            for e in cal[i+1:]:
                if _horiz(c)==_horiz(e) and _pisa(_calle_rect(c),_calle_rect(e),-.01) and ((_horiz(c) and abs(c['a'][1]-e['a'][1])<1e-6) or (not _horiz(c) and abs(c['a'][0]-e['a'][0])<1e-6)):E.append('%s.calles: «%s» y «%s» se superponen'%(q,c['n'],e['n']))
        todos=dict(cosas[b])
        for kk,rb in casas[b].items():todos[kk]=rb
        for kk,r in todos.items():
            if not(r[0]>=0 and r[1]>=0 and r[2]<=w and r[3]<=h):E.append('%s: %s sale del barrio'%(q,kk))
            for c in cal:
                if _pisa(r,_calle_rect(c),-.01):E.append('%s: %s pisa la calle «%s»'%(q,kk,c['n']))
        ks=list(todos)
        for i,a in enumerate(ks):
            for c in ks[i+1:]:
                if _pisa(todos[a],todos[c]):E.append('%s: %s y %s se pisan'%(q,a,c))
        pu=x.get('puertas',{})
        mismas(q+'.puertas',pu,todos)
        for kk,p in pu.items():
            if kk not in todos:continue
            if not(len(p)==3):E.append('%s.puertas.%s: [x, y, calle]'%(q,kk));continue
            c=next((c for c in cal if c.get('n')==p[2]),None)
            if not c:E.append('%s.puertas.%s: la calle «%s» no existe'%(q,kk,p[2]));continue
            if not _en(c,p[:2]):E.append('%s.puertas.%s: el punto no está en el eje de «%s»'%(q,kk,p[2]));continue
            if _rect_dist(todos[kk],p[:2])>c['w']/2+2.5:E.append('%s.puertas.%s: la puerta queda a más de %g de la fachada'%(q,kk,c['w']/2+2.5))
            ed=P['edificios'].get(kk)
            if ed:
                clave=c['n'].split()[-1].lower()
                if clave not in ed['n'].lower():E.append('%s.puertas.%s: «%s» no es la calle de «%s»'%(q,kk,c['n'],ed['n']))
    # enlaces: a pie y líneas; el grafo de cada barrio debe ser conexo
    en=C.get('enlaces',{});especiales={b:[] for b in B}
    def enlace_pt(b,p,q):
        if b not in B or b not in tam:E.append('%s: barrio «%s» no existe'%(q,b));return
        w,h=tam[b]
        if not any(_en(c,p) for c in B[b]['calles']):E.append('%s: el punto %s no está en una calle de %s'%(q,p,b));return
        especiales[b].append(p)
    ady={b:set() for b in B}
    for i,l in enumerate(en.get('pie',[])):
        q='ciudad.enlaces.pie[%d]'%i
        if l.get('a') not in B or l.get('b') not in B:E.append(q+': barrio que no existe');continue
        enlace_pt(l['a'],l['pa'],q);enlace_pt(l['b'],l['pb'],q)
        if not(isinstance(l.get('m'),(int,float)) and 0<l['m']<=500):E.append(q+'.m: metros del paso, de 1 a 500')
        A,Bb=B[l['a']]['plano'],B[l['b']]['plano']
        pa=(A[0]+l['pa'][0]/k,A[1]+l['pa'][1]/k);pb=(Bb[0]+l['pb'][0]/k,Bb[1]+l['pb'][1]/k)
        if abs(pa[0]-pb[0])>.15 or abs(pa[1]-pb[1])>.15:E.append('%s: los dos puntos no coinciden en el plano %s %s'%(q,pa,pb))
        ady[l['a']].add(l['b']);ady[l['b']].add(l['a'])
    ids_l=set()
    for i,l in enumerate(en.get('lineas',[])):
        q='ciudad.enlaces.lineas[%s]'%l.get('id',i)
        if l.get('id') in ids_l:E.append(q+': id repetido')
        ids_l.add(l.get('id'))
        if l.get('modo') not in ('metro','bus','tren'):E.append(q+'.modo: metro, bus o tren')
        if not(l.get('n') and l.get('c') and isinstance(l.get('cada'),(int,float)) and l['cada']>0 and isinstance(l.get('precio_h'),(int,float)) and l['precio_h']>0):E.append(q+': n, c, cada (minutos) y precio_h (horas de salario)')
        ps=l.get('paradas',[])
        if len(ps)<2 or len(l.get('min',[]))!=len(ps)-1 or any(not(isinstance(m,(int,float)) and m>0) for m in l.get('min',[])):E.append(q+': al menos 2 paradas y un tiempo en minutos entre cada par')
        for s in ps:
            if not s.get('n'):E.append(q+': parada sin nombre')
            enlace_pt(s.get('b'),s.get('p'),q+'.paradas')
        for s,t in zip(ps,ps[1:]):
            if s.get('b') in ady and t.get('b') in ady:ady[s['b']].add(t['b']);ady[t['b']].add(s['b'])
    # cada barrio, conexo; todos los barrios, conectados entre sí
    for b,x in B.items():
        if b not in tam:continue
        g=grafo(x,especiales[b]);ini=next(iter(g));vis={ini};cola=[ini]
        while cola:
            u=cola.pop()
            for v,_ in g[u]:
                if v not in vis:vis.add(v);cola.append(v)
        if len(vis)!=len(g):E.append('ciudad.barrios.%s: las calles no forman un solo grafo (%d de %d puntos alcanzables)'%(b,len(vis),len(g)))
    if B:
        ini=next(iter(B));vis={ini};cola=[ini]
        while cola:
            u=cola.pop()
            for v in ady[u]:
                if v not in vis:vis.add(v);cola.append(v)
        if len(vis)!=len(B):E.append('ciudad.enlaces: desde %s no se llega a %s'%(ini,sorted(set(B)-vis)))
    # no se puede seguir si algo falla arriba: los avisos de trayecto necesitan los datos bien
    if E:return
    # camino a pie entre cada pareja de puertas de cada barrio, y trayecto entre cada pareja de barrios
    for b,x in B.items():
        g=grafo(x,especiales[b]);ps=[(kk,p) for kk,p in x['puertas'].items()]
        for kk,p in ps:
            if kk in casas[b] and b not in usados:continue
            r=camino(g,p[:2],ps[0][1][:2])
            if not r:E.append('ciudad.barrios.%s: no hay camino a pie de %s a %s'%(b,kk,ps[0][0]))
    for a in B:
        for b in B:
            if a<b:
                pa=next(iter(B[a]['puertas'].values()));pb=next(iter(B[b]['puertas'].values()))
                if not trayecto_py(C,(a,pa[:2]),(b,pb[:2])):E.append('ciudad.enlaces: no hay trayecto de %s a %s'%(a,b))
    # aviso (no error): quien vive en un barrio y trabaja en otro; es un dato de juego
    sitio={}
    for kk,bs in cosas.items():
        for id in bs:sitio[id]=kk
    for hid,hg in P['hogares'].items():hg['_b']=sitio.get(hg['edificio'])
    for v in P['vecinos']:
        t=v.get('trabajo');hg=P['hogares'].get(v['hogar'],{})
        if not t or t['lugar']=='fuera' or not hg.get('_b'):continue
        bt=sitio.get(t['lugar'])
        if bt and bt!=hg['_b']:
            pa=B[hg['_b']]['puertas'][hg['edificio']];pb=B[bt]['puertas'][t['lugar']]
            r=trayecto_py(C,(hg['_b'],pa[:2]),(bt,pb[:2]))
            if r:AVISOS.append('%s vive en %s y trabaja en %s (%s): %g min de trayecto%s'%(v['n'],B[hg['_b']]['n'],B[bt]['n'],t['lugar'],r[0],(', '+' + '.join(r[2]) if r[2] else ', a pie')))
    for hg in P['hogares'].values():hg.pop('_b',None)

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
        if 'r' in p:E.append('lugares.%s.r: el plano antiguo ya no existe; el sitio es `rb`'%k)
    # horarios de apertura: [[desde,hasta,[días]],…]; hasta > 24 = cierra de madrugada del día siguiente
    for k,p in list(lug.items())+list(L.get('solo_mapa',{}).items()):
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
    # el mapa del barrio y la ciudad: cada edificio tiene barrio, rectángulo local y puerta en una calle
    B=d.get('barrio')
    if B:
        mismas('barrio.edificios',B.get('edificios',{}),P['edificios'])
        for k,e in B.get('edificios',{}).items():
            if not e.get('rotulo'):E.append('barrio.edificios.%s: falta rotulo'%k)
    if 'ciudad' in d:ciudad(d,E,dentro,mismas)
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
    # --- p0b: textos_mods_ag (textos sueltos de los módulos de la «a» a la «g») ---
    TM=d.get('textos_mods_ag')
    if TM is not None:
        try:mods_b=[m[:-3] for m in json.load(open(os.path.join(R,'build.json'),encoding='utf-8'))['mods']]
        except Exception:mods_b=None
        def _hojas(x,ruta):
            if isinstance(x,str):yield ruta,x
            elif isinstance(x,list):
                for i,v in enumerate(x):yield from _hojas(v,ruta+'[%d]'%i)
            elif isinstance(x,dict):
                for k,v in x.items():yield from _hojas(v,ruta+'.'+k)
        for m,sec in TM.items():
            if m=='_':continue
            if not isinstance(sec,dict) or not sec:E.append('textos_mods_ag.%s: tiene que ser una sección con claves'%m);continue
            if mods_b is not None and m not in mods_b:E.append('textos_mods_ag.%s: no es un módulo de build.json'%m)
            if m[0]>'g':E.append('textos_mods_ag.%s: este archivo es de los módulos de la «a» a la «g»'%m)
            try:codigo=open(os.path.join(R,'mods',m+'.js'),encoding='utf-8').read()
            except OSError:codigo='';E.append('textos_mods_ag.%s: no existe mods/%s.js'%(m,m))
            if codigo and 'DATA.textos_mods_ag' not in codigo:E.append('textos_mods_ag.%s: mods/%s.js no lee esta sección'%(m,m))
            for k in sec:
                if not re.match(r'^[\wñ]+$',k):E.append('textos_mods_ag.%s.%s: clave poco legible (letras, cifras y _)'%(m,k))
            for ruta,t in _hojas(sec,'textos_mods_ag.'+m):
                if not t.strip():E.append('%s: texto vacío'%ruta)
                if '${' in t or '`' in t:E.append('%s: sobra un ${…} o una comilla invertida: los huecos son {clave}'%ruta)
                if re.sub(r'\{\w+\}','',t).count('{')+re.sub(r'\{\w+\}','',t).count('}'):E.append('%s: llaves sin cerrar o hueco mal escrito'%ruta)
    # --- fin p0b ---
    # --- p0c begin: textos de los módulos h–z (movil.json y textos_mods_hz.json) ---
    p0c_textos(d,E)
    # --- p0c end ---
    # p0a: textos sueltos del núcleo (data/textos_nucleo.json) y tablas de sucesos del núcleo (sucesos.nucleo_*)
    TN=d.get('textos_nucleo',{})
    for sec,v in TN.items():
        if sec=='_':continue
        if not isinstance(v,dict):E.append('textos_nucleo.%s: tiene que ser un objeto de claves legibles'%sec);continue
        def _rec(x,ruta):
            if isinstance(x,str):
                if _re.search(r'\{(?!\w+\})|(?<!\{)\w*\}(?!\})',_re.sub(r'\{\w+\}','',x)):E.append('textos_nucleo.%s: llave suelta o hueco mal escrito en «%s»'%(ruta,x[:50]))
            elif isinstance(x,list):
                for i,y in enumerate(x):_rec(y,'%s[%d]'%(ruta,i))
            elif isinstance(x,dict):
                for k,y in x.items():_rec(y,ruta+'.'+k)
            else:E.append('textos_nucleo.%s: solo texto, listas y objetos'%ruta)
        for k,x in v.items():
            if k[0].isdigit():E.append('textos_nucleo.%s.%s: la clave no puede empezar por cifra (el código la usa como TXN.%s.%s)'%(sec,k,sec,k))
            _rec(x,sec+'.'+k)
    CORE=os.path.join(R,'src','core')
    if os.path.isdir(CORE):
        for f in sorted(os.listdir(CORE)):
            if not f.endswith('.js'):continue
            for m in _re.finditer(r'TXN\.(\w+)\.(\w+)',open(os.path.join(CORE,f),encoding='utf-8').read()):
                if m.group(1) not in TN or m.group(2) not in TN[m.group(1)]:E.append('src/core/%s: TXN.%s.%s no existe en data/textos_nucleo.json'%(f[:3],m.group(1),m.group(2)))
    SU=d['sucesos']
    for sec in ('nucleo_consecuencias','nucleo_golpes','nucleo_personal','nucleo_incidentes','nucleo_hitos','nucleo_arcos','nucleo_rasgos_ocultos','nucleo_aspiraciones','nucleo_objetivos'):
        if not isinstance(SU.get(sec),dict):E.append('sucesos.%s: falta la sección'%sec)
    for sec,lst in (('nucleo_aspiraciones',SU.get('nucleo_aspiraciones',{}).get('lista',[])),('nucleo_objetivos',SU.get('nucleo_objetivos',{}).get('lista',[]))):
        ids=[x.get('id') for x in lst]
        if not ids or len(set(ids))!=len(ids) or None in ids:E.append('sucesos.%s.lista: cada ficha con id distinto'%sec)
    for k,l in SU.get('nucleo_arcos',{}).items():
        ids=[x.get('id') for x in l] if isinstance(l,list) else []
        if len(set(ids))!=len(ids):E.append('sucesos.nucleo_arcos.%s: ids repetidos'%k)
    # --- p0d begin: textos de src/core/081–098 (secciones nuevas de textos_nucleo.json) ---
    p0d_textos(d,E)
    # --- p0d end ---
    # --- p0e begin ---
    p0e_textos(d,E)
    # --- p0e end ---
    return E

# --- p0c begin: validaciones de los textos que el código lee de data/movil.json y data/textos_mods_hz.json ---
def _p0c_huecos(t):return set(re.findall(r'\{(\w+)\}',t))
def _p0c_cierre(t):return t.count('{')==t.count('}')==len(re.findall(r'\{\w+\}',t))
def _p0c_textos_de(v):
    if isinstance(v,str):yield v
    elif isinstance(v,list):
        for x in v:yield from _p0c_textos_de(x)
    elif isinstance(v,dict):
        for k,x in v.items():
            if k!='_':yield from _p0c_textos_de(x)
def _p0c_cierra(src,i):
    d=0;j=i;q=None
    while j<len(src):
        c=src[j]
        if q:
            if c=='\\':j+=1
            elif c==q:q=None
        elif c in '\'"`':q=c
        elif c in '([{':d+=1
        elif c in ')]}':
            d-=1
            if d==0:return j
        j+=1
    return -1
def _p0c_claves(obj):
    """claves de primer nivel de un objeto literal {a:1,b,c:f(x)}"""
    claves=[];d=0;ini=1;q=None;i=1
    while i<len(obj)-1:
        c=obj[i]
        if q:
            if c=='\\':i+=1
            elif c==q:q=None
        elif c in '\'"`':q=c
        elif c in '([{':d+=1
        elif c in ')]}':d-=1
        elif c==',' and d==0:
            claves.append(obj[ini:i]);ini=i+1
        i+=1
    claves.append(obj[ini:len(obj)-1])
    return [re.match(r'\s*([\w$]+)',x).group(1) for x in claves if x.strip()]
def p0c_textos(d,E):
    hz=d.get('textos_mods_hz');mv=d.get('movil')
    for nom,dat in (('textos_mods_hz',hz),('movil',mv)):
        if dat is None:continue
        for t in _p0c_textos_de(dat):
            if not _p0c_cierre(t):E.append('%s: huecos mal cerrados en «%s»'%(nom,t[:60]))
    if hz is None and mv is None:return
    carpeta=os.path.join(R,'mods')
    for f in sorted(os.listdir(carpeta)):
        if not f.endswith('.js'):continue
        src=open(os.path.join(carpeta,f),encoding='utf-8').read()
        # TXHZ.modulo.clave existe
        for m in re.finditer(r'TXHZ\.(\w+)\.(\w+)',src):
            mod,k=m.group(1),m.group(2)
            if hz is None or mod not in hz or k not in hz[mod]:E.append('mods/%s: TXHZ.%s.%s no existe en data/textos_mods_hz.json'%(f,mod,k))
        # TXMV.ruta existe (hasta el primer corchete)
        for m in re.finditer(r'TXMV((?:\.\w+)+)',src):
            o=mv
            for p in m.group(1).split('.')[1:]:
                if not isinstance(o,dict) or p not in o:E.append('mods/%s: TXMV%s no existe en data/movil.json'%(f,m.group(1)));break
                o=o[p]
        # huecos(TXHZ.mod.clave,{…}): cada hueco del texto lo rellena el código (salvo {n} y {o}, que son automáticos)
        for m in re.finditer(r'huecos\(\s*(?:pickR\()?TXHZ\.(\w+)\.(\w+)\)?\s*,\s*\{',src):
            i=m.end()-1;j=_p0c_cierra(src,i)
            if j<0:continue
            dadas=set(_p0c_claves(src[i:j+1]))|{'n','o'}
            try:v=hz[m.group(1)][m.group(2)]
            except Exception:continue
            for t in _p0c_textos_de(v):
                for h in _p0c_huecos(t):
                    if h not in dadas:E.append('mods/%s: TXHZ.%s.%s lleva {%s} y el código no lo rellena'%(f,m.group(1),m.group(2),h))
# --- p0c end ---

# --- p0d begin: validaciones de los textos de src/core/081–098 (data/textos_nucleo.json: obra_tactil … calendario) ---
P0D_SECCIONES=('obra_tactil','ropa','muebles_nuevos','looks','planes_ana','deshacer','construir_comprar','entrada','interfaz','creador','calendario')
def p0d_textos(d,E):
    TN=d.get('textos_nucleo')
    if not isinstance(TN,dict):return
    for sec in P0D_SECCIONES:
        if not isinstance(TN.get(sec),dict) or not TN.get(sec):E.append('textos_nucleo.%s: falta la sección (src/core 081–098)'%sec)
    for sec in P0D_SECCIONES:
        for k,v in (TN.get(sec) or {}).items():
            for t in _p0c_textos_de(v):
                if not t.strip() and isinstance(v,str):E.append('textos_nucleo.%s.%s: texto vacío'%(sec,k))
                if '${' in t or '`' in t:E.append('textos_nucleo.%s.%s: sobra un ${…} o una comilla invertida: los huecos son {clave}'%(sec,k))
                if not _p0c_cierre(t):E.append('textos_nucleo.%s.%s: huecos mal cerrados en «%s»'%(sec,k,t[:60]))
    CORE=os.path.join(R,'src','core')
    if not os.path.isdir(CORE):return
    for f in sorted(os.listdir(CORE)):
        if not (f.endswith('.js') and '081'<=f[:3]<='098'):continue
        src=open(os.path.join(CORE,f),encoding='utf-8').read()
        # huecos(TXN.sec.clave,{…}): cada hueco del texto lo rellena el código ({n} y {o} se rellenan solos) y cada dato que da el código lo usa el texto
        for m in re.finditer(r'huecos\(\s*TXN\.(\w+)\.(\w+)\s*,\s*\{',src):
            i=m.end()-1;j=_p0c_cierra(src,i)
            if j<0:continue
            dadas=set(_p0c_claves(src[i:j+1]))
            v=(TN.get(m.group(1)) or {}).get(m.group(2))
            if not isinstance(v,str):continue
            hu=_p0c_huecos(v)
            for h in hu-dadas-{'n','o'}:E.append('src/core/%s: TXN.%s.%s lleva {%s} y el código no lo rellena'%(f[:3],m.group(1),m.group(2),h))
            for h in dadas-hu:E.append('src/core/%s: TXN.%s.%s no usa el dato «%s» que le pasa el código'%(f[:3],m.group(1),m.group(2),h))
        # un texto con huecos que el código usa sin huecos() saldría con las llaves a la vista
        for m in re.finditer(r'TXN\.(\w+)\.(\w+)',src):
            ant=src[max(0,m.start()-160):m.start()];hp=ant.rfind('huecos(')
            if hp>=0 and ',{' not in ant[hp:]:continue  # primer argumento de huecos() (también dentro de un ternario)
            if m.group(1) not in P0D_SECCIONES:continue
            v=(TN.get(m.group(1)) or {}).get(m.group(2))
            if isinstance(v,str) and _p0c_huecos(v):
                E.append('src/core/%s: TXN.%s.%s lleva huecos y el código no lo pasa por huecos()'%(f[:3],m.group(1),m.group(2)))
# --- p0d end ---
# --- p0e begin: remate de los módulos de mods/ (textos_mods_ag.escuela y claves nuevas): lo que el código lee existe y los huecos cierran ---
def p0e_textos(d,E):
    ag=d.get('textos_mods_ag');nu=d.get('textos_nucleo')
    if ag is None:return
    carpeta=os.path.join(R,'mods')
    try:mods_b=[m for m in json.load(open(os.path.join(R,'build.json'),encoding='utf-8'))['mods']]
    except Exception:return
    mov=((ag.get('banco') or {}).get('mov')) or {}
    for f in mods_b:
        try:src=open(os.path.join(carpeta,f),encoding='utf-8').read()
        except OSError:continue
        # const {sección:TX_alias}=DATA.textos_mods_ag  →  TX_alias.clave existe en esa sección
        for al in re.finditer(r'const\s*\{\s*(\w+)\s*:\s*(TX_\w+)\s*\}\s*=\s*DATA\.textos_mods_ag',src):
            sec,alias=al.group(1),al.group(2)
            if sec not in ag:E.append('mods/%s: textos_mods_ag.%s no existe'%(f,sec));continue
            for m in re.finditer(r'\b'+alias+r'\.(\w+)',src):
                if m.group(1) not in ag[sec]:E.append('mods/%s: %s.%s no existe en data/textos_mods_ag.json'%(f,alias,m.group(1)))
            for m in re.finditer(r'huecos\(\s*(?:pickR\()?'+alias+r'\.(\w+)\)?\s*,\s*\{',src):
                i=m.end()-1;j=_p0c_cierra(src,i)
                if j<0 or m.group(1) not in ag[sec]:continue
                dadas=set(_p0c_claves(src[i:j+1]))|{'n','o'}
                for t in _p0c_textos_de(ag[sec][m.group(1)]):
                    for h in _p0c_huecos(t):
                        if h not in dadas:E.append('mods/%s: %s.%s lleva {%s} y el código no lo rellena'%(f,alias,m.group(1),h))
        # TXN.sección.clave (los textos del núcleo que los módulos comparan) existe
        if nu is not None:
            for m in re.finditer(r'\bTXN\.(\w+)\.(\w+)',src):
                if m.group(1) not in nu or m.group(2) not in nu[m.group(1)]:E.append('mods/%s: TXN.%s.%s no existe en data/textos_nucleo.json'%(f,m.group(1),m.group(2)))
        # cada concepto de banco que se apunta con bkAdd('…') o withCtx(f,'…') tiene su línea en banco.mov
        for m in re.finditer(r"bkAdd\('([^']+)'|withCtx\(\s*\w+\s*,\s*'([^']+)'",src):
            c=m.group(1) or m.group(2)
            if mov and c not in mov and c!='Hucha':E.append('mods/%s: el concepto bancario «%s» no está en textos_mods_ag.banco.mov'%(f,c))
    # las listas de la escuela que el código elige con pickR llevan tres variantes cada una
    es=ag.get('escuela')
    if es:
        for k in ('cole_ext_publico','cole_ext_concertado','cole_sale','tutoria_ext_publico','tutoria_ext_concertado','tutoria'):
            if not (isinstance(es.get(k),list) and len(es[k])==3):E.append('textos_mods_ag.escuela.%s: tiene que ser una lista de 3 variantes (el azar elige entre 3)'%k)
        for k in ('cole_sale','tutoria'):
            for t in es.get(k) or []:
                for h in _p0c_huecos(t):
                    if h not in {'k','n','e','muy','ext','o'}:E.append('textos_mods_ag.escuela.%s lleva {%s} y el código no lo rellena'%(k,h))
# --- p0e end ---

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

# --- t133 begin: data/barrios_vida.json (interiores de los lugares de mapa, salidas de barrio, efectos por barrio) ---
def _t133(d,E):
    B=d.get('barrios_vida')
    if not B:return
    L=d.get('lugares',{});lug=L.get('lugares',{});out=L.get('salidas',{});C=d.get('ciudad',{});bar=C.get('barrios',{})
    for sec in ('plantillas','piezas','interiores','salidas','barrios','sucesos','textos'):
        if not isinstance(B.get(sec),dict) or not B[sec]:E.append('barrios_vida.%s: falta o vacía'%sec)
    for k,i in B.get('interiores',{}).items():
        if k not in lug:E.append('barrios_vida.interiores.%s: no es un lugar'%k);continue
        if i.get('plantilla') not in B.get('plantillas',{}):E.append('barrios_vida.interiores.%s: plantilla desconocida'%k)
        for p in i.get('piezas',[]):
            if isinstance(p,dict) and p.get('t') not in B.get('piezas',{}):E.append('barrios_vida.interiores.%s: pieza «%s» sin definir'%(k,p.get('t')))
    for k,s in B.get('salidas',{}).items():
        if k not in out:E.append('barrios_vida.salidas.%s: no existe en lugares.salidas'%k)
        if not s.get('kind'):E.append('barrios_vida.salidas.%s: sin kind'%k)
        if not any(k in (x.get('outs') or []) for x in lug.values()):E.append('barrios_vida.salidas.%s: ningún lugar la ofrece'%k)
    for b in bar:
        if b not in B.get('barrios',{}):E.append('barrios_vida.barrios.%s: falta'%b)
        sc=B.get('sucesos',{}).get(b,{})
        if not (2<=len(sc.get('anuales',[]))<=3):E.append('barrios_vida.sucesos.%s: entre 2 y 3 anuales'%b)
        f=B.get('barrios',{}).get(b,{}).get('ficha',{})
        if not f.get('gana') or not f.get('pierde'):E.append('barrios_vida.barrios.%s.ficha: gana y pierde'%b)
_t133_comprobar=comprobar
def comprobar(d):
    E=_t133_comprobar(d);_t133(d,E);return E
# --- t133 end ---

if __name__=='__main__':
    d=cargar()
    if '--fmt' in sys.argv:print('formateados:',formatear(d))
    E=comprobar(d)
    for e in E:print('✗',e)
    for a in AVISOS:print('aviso:',a)
    print('DATA_FAIL' if E else 'DATA_OK',sum(len(v)-('_' in v) for v in d.values()),'secciones en',len(d),'archivos')
    sys.exit(1 if E else 0)
