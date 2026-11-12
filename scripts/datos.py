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
