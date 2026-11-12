#!/usr/bin/env python3
"""Casita · datos
   python3 scripts/datos.py          → comprueba data/*.json (sintaxis y referencias cruzadas)
   python3 scripts/datos.py --fmt    → además los reescribe con el formato de la casa
build.py llama a la comprobación antes de construir: si algo no cuadra, no hay build.
Qué es cada archivo y cada campo: data/README.md.
"""
import json,os,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));D=os.path.join(R,'data')
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

# ---------- comprobaciones: cada una devuelve una lista de fallos ----------
def comprobar(d):
    E=[]
    def dentro(que,ids,validos,donde):
        for i in ids:
            if i not in validos:E.append('%s: «%s» no existe en %s'%(que,i,donde))
    def mismas(que,a,b):
        if set(a)!=set(b):E.append('%s: sobran %s, faltan %s'%(que,sorted(set(a)-set(b)),sorted(set(b)-set(a))))
    L,V,P,PR,O,LB,ED,I,ID,G,RG=(d[k] for k in ('lugares','viviendas','personas','profesiones','objetos','libros','estudios','interacciones','ideologias','gobiernos','reglas'))
    lug,sal,sec,obj=L['lugares'],L['salidas'],PR['sectores'],O['objetos']
    nec=[n[0] for n in RG['necesidades']];hab=[h[0] for h in PR['habilidades']];ideo=ID['ideologias'];gov=G['gobiernos']
    # lugares y salidas
    for k,p in lug.items():
        dentro('lugares.%s.outs'%k,p.get('outs',[]),sal,'lugares.salidas')
        if len(p.get('r',[]))!=4:E.append('lugares.%s.r: hacen falta 4 números [x0,y0,x1,y1]'%k)
    mismas('lugares.trabajo_en',L['trabajo_en'],sec)
    dentro('lugares.trabajo_en',[v for v in L['trabajo_en'].values() if v!='_ride'],lug,'lugares.lugares')
    dentro('lugares.salidas_necesidades',L['salidas_necesidades'],sal,'lugares.salidas')
    for k,v in L['salidas_necesidades'].items():dentro('lugares.salidas_necesidades.%s'%k,v,nec,'reglas.necesidades')
    for nom,ks in L['salidas_grupos']:dentro('lugares.salidas_grupos «%s»'%nom,ks,sal,'lugares.salidas')
    for k,s in sal.items():
        if not(isinstance(s.get('dur'),(int,float)) and len(s.get('h',[]))==2):E.append('lugares.salidas.%s: faltan dur o h [desde,hasta]'%k)
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
