#!/usr/bin/env python3
"""Casita · ¿ha cambiado algo por fuera?
Para cambios que NO deben notarse en el juego (mover datos, reordenar código):

   python3 build.py && python3 scripts/comparar.py volcar /tmp/antes.json      # antes de tocar nada
   … el cambio …
   python3 build.py && python3 scripts/comparar.py volcar /tmp/despues.json
   python3 scripts/comparar.py comparar /tmp/antes.json /tmp/despues.json     # debe decir «diferencias: 0»

   volcar admite días y otro HTML:  python3 scripts/comparar.py volcar /tmp/x.json 30 /ruta/a/otro/casita.html

El volcado guarda, de casita.html en Chrome sin pantalla:
  · todas las tablas del script al cargar y al acabar (las funciones, como texto);
  · 11 partidas de DÍAS días (120 por defecto) con el azar y el reloj sembrados: estado final, diario, capítulos y gente;
  · el HTML del menú, del móvil y de los modos, y los textos pintados en el lienzo (casa y lugares).
Con el azar sembrado, dos volcados del mismo código son idénticos: cualquier diferencia viene del cambio.
Ojo: cambiar el número o el orden de las llamadas a Math.random() cambia las partidas aunque el juego «sea el mismo».
"""
import json,os,re,sys,subprocess,time,tempfile,shutil,urllib.request
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=lambda *a:os.path.join(R,*a)
# variables de animación que dependen de cuántos fotogramas pasaron antes de la prueba
RUIDO={'AC','anaRT','bubbleAt','fxT','hudT','last','qSig','thought','goalT','saveT'}

def nombres():
    cfg=json.load(open(P('build.json')))
    fs=[P('src','core',f) for f in sorted(os.listdir(P('src','core'))) if f.endswith('.js')]+[P('mods',m) for m in cfg['mods']]
    n=set()
    for f in fs:n.update(m.group(1) for m in re.finditer(r'(?:^|[\n;{}])[ \t]*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=',open(f,encoding='utf-8').read()))
    return sorted(n-{'S','card','menu','ctx','cv','canvas','T','tables','D','DATA'})

PRUEBA=r'''
setTimeout(()=>{try{
 const D={};const STACK=[];
 function ser(v,d){
  if(v===null)return null;const t=typeof v;
  if(t==='function')return 'ƒ '+v.toString();
  if(t==='undefined')return '∅';
  if(t==='number')return isFinite(v)?v:'#'+v;
  if(t==='string'||t==='boolean')return v;
  if(t!=='object')return String(v);
  if(STACK.includes(v))return '[ciclo]';
  if(v instanceof Node)return '[dom]';
  if(v===window)return '[win]';
  if(d>14)return '[hondo]';
  STACK.push(v);try{
   if(Array.isArray(v)){const a=v.map(x=>ser(x,d+1));return v.length>5000?'[lista '+v.length+' '+hash(JSON.stringify(a))+']':a;}
   if(v instanceof Map)return {__map:[...v].map(([k,x])=>[ser(k,d+1),ser(x,d+1)])};
   if(v instanceof Set)return {__set:[...v].map(x=>ser(x,d+1))};
   const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==null)return '['+(v.constructor&&v.constructor.name)+']';
   const o={};for(const k of Object.keys(v))o[k]=ser(v[k],d+1);return o;
  }finally{STACK.pop();}
 }
 function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16)+':'+s.length;}
 function tablas(){const T={};
/*NOMBRES*/
  return T;}
 D.tablas_al_cargar=tablas();
 let seed=1;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 let reloj=1e6;performance.now=()=>reloj;
 const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.replace(/file:\/\/\S*?\.html(:\d+:\d+)?/g,'página').slice(0,300):String(x)).join(' '));};
 let pintado=null;const _ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t){if(pintado)pintado.add(String(t));return _ft.apply(this,arguments);};
 const txt=el=>el?(el.innerText||el.textContent||''):'';
 // [ideología, sector, género, dificultad, casa]
 const cfgs=[['marxista','super','f','soul','padres'],['liberal','tech','m','normal','habitacion'],['anarquista','coop','x','realista','bueno'],['conservadora','negocio','f','dificil',null],['libertaria','arte','m','soul','viejo'],['socialdemocrata','funcion','f','facil',null],['ecologista','obra','m','realista','habitacion'],['apolitica','hosteleria','f','normal',null],['marxista','cuidados','m','normal','padres'],['socialdemocrata','oficina','f','normal','bueno'],['anarquista','reparto','x','soul',null]];
 D.partidas=[];let ci=0;
 for(const [ideo,track,g,diff,home] of cfgs){ci++;seed=1000+ci;reloj=1e6;
  const r={cfg:[ideo,track,g,diff,home].join('/')};
  try{
  S=newState(diff);S.char={...randomChar(),g};if(g==='f')S.char.beard='no';S.traits=['sociable'];S.ideo=ideo;S.pol.comp=2;initPeople();if(home)applyHome(home);startTrack(track,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
  for(let k=0;k<480*/*DIAS*/;k++){update(3);dlgTick();reloj+=40;}
  r.estado=hash(JSON.stringify(S));r.dinero=S.money;r.dia=S.day;r.claves=Object.keys(S).sort().join(',');
  r.diario=S.story.log.map(e=>e.d+' '+e.ic+' '+e.txt);r.capitulos=Object.values(S.story.chap).map(c=>c.title+' · '+(c.txt||c.text||''));
  r.gente=S.people.map(p=>[p.k,p.n,p.r,p.job,p.ideo,Math.round(p.rel*100)/100,p.stage].join('|'));
  r.pantallas={};
  for(const [k] of MTABS){try{openMenu(k);r.pantallas['menu_'+k]=card.innerHTML;}catch(e){r.pantallas['menu_'+k]='ERR '+e.message;}}
  menu.classList.remove('open');
  try{for(const a of APPS){phOpen(a[0]);const el=document.getElementById('phone');r.pantallas['movil_'+a[0]]=el?el.innerHTML:'';}phClose();}catch(e){r.pantallas.movil='ERR '+e.message;}
  hud(); // el marcador se refresca con el bucle; aquí a mano, o se queda con lo que hubiera al cargar
  for(const m of ['buy','build','live']){try{setMode(m);r.pantallas['modo_'+m]=txt(document.body);}catch(e){r.pantallas['modo_'+m]='ERR '+e.message;}}
  r.lienzo={};
  try{pintado=new Set();render();r.lienzo.casa=[...pintado].sort();}catch(e){r.lienzo.casa='ERR '+e.message;}
  if(ci<=3){for(const pk of Object.keys(PLACES)){try{const s=S.sim;s.work=200;s.awayTotal=400;s.dest=pk;s.outingActive=(PLACES[pk].outs||[])[0]||null;s.exit=[0,10];s.route=null;enterScene();pintado=new Set();render();render();r.lienzo[pk]=[...pintado].sort();leaveScene();}catch(e){r.lienzo[pk]='ERR '+e.message;}}
   S.sim.work=0;S.sim.dest=null;}
  pintado=null;
  }catch(e){r.err=e.message+' '+(e.stack||'').replace(/file:\/\/\S*?\.html(:\d+:\d+)?/g,'página').slice(0,500);}
  D.partidas.push(r);
 }
 D.tablas_al_acabar=tablas();
 D.errs=errs.slice(0,30);D.werrs=(window.__errs||[]).slice(0,30);
 window.__volcado=JSON.stringify(D);document.title='OK';
}catch(err){window.__volcado=JSON.stringify({err:err.message+' '+err.stack});document.title='ERR '+err.message;}},300);
'''

def volcar(salida,dias=120,html=None):
    import websocket,socket
    _s=socket.socket();_s.bind(('127.0.0.1',0));puerto=_s.getsockname()[1];_s.close()  # puerto libre: se pueden lanzar varios a la vez
    src=open(html or P('casita.html'),encoding='utf-8').read()
    lecturas=''.join("try{if(typeof %s!=='undefined')T[%s]=ser(%s,0);}catch(e){}\n"%(n,json.dumps(n),n) for n in nombres())
    js=PRUEBA.replace('/*NOMBRES*/',lecturas).replace('/*DIAS*/',str(dias))
    src=src.replace("<script>\n(() => {","<script>window.__errs=[];window.onerror=(m,u,l,c,e)=>{window.__errs.push(String(m));};</script>\n<script>\n(() => {",1)
    ancla="requestAnimationFrame(loop);\naddEventListener('visibilitychange'";assert src.count(ancla)==1
    d=tempfile.mkdtemp(prefix='casita_');pag=os.path.join(d,'p.html');open(pag,'w',encoding='utf-8').write(src.replace(ancla,js+"\n"+ancla))
    p=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--window-size=420,860','--user-data-dir='+os.path.join(d,'perfil'),'--remote-debugging-port=%d'%puerto,'--remote-allow-origins=*','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(40):
            try:tabs=json.load(urllib.request.urlopen('http://127.0.0.1:%d/json'%puerto));break
            except Exception:time.sleep(.5)
        ws=websocket.create_connection([x for x in tabs if x['type']=='page'][0]['webSocketDebuggerUrl'],timeout=900);mid=[0]
        def pide(m,params={}):
            mid[0]+=1;ws.send(json.dumps({'id':mid[0],'method':m,'params':params}))
            while True:
                r=json.loads(ws.recv())
                if r.get('id')==mid[0]:return r
        ev=lambda e:pide('Runtime.evaluate',{'expression':e,'returnByValue':True})['result']['result'].get('value','')
        pide('Runtime.enable');pide('Page.navigate',{'url':'file://'+pag});t0=time.time();tit=''
        while time.time()-t0<900:
            time.sleep(2);tit=ev('document.title')
            if tit.startswith(('OK','ERR')):break
        v=ev('window.__volcado||""');open(salida,'w',encoding='utf-8').write(v)
        print(tit[:200] or 'SIN RESPUESTA','·',round(time.time()-t0),'s ·',len(v)//1024,'KB →',salida);return tit.startswith('OK')
    finally:
        p.kill();subprocess.run(['pkill','-f','--','--user-data-dir='+os.path.join(d,'perfil')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);shutil.rmtree(d,ignore_errors=True)

def comparar(a,b,tope=40):
    A=json.load(open(a,encoding='utf-8'));B=json.load(open(b,encoding='utf-8'))
    if 'err' in A or 'err' in B:print('ERR',A.get('err'),B.get('err'));return 1
    n=[0]
    def dif(x,y,ruta):
        if x==y and (not isinstance(x,(dict,list)) or json.dumps(x)==json.dumps(y)):return
        pp=ruta.split('.')
        if len(pp)>1 and pp[0].startswith('tablas') and pp[1].split('[')[0] in RUIDO:return
        if type(x)!=type(y) or not isinstance(x,(dict,list)):
            n[0]+=1
            if n[0]<=tope:
                sx,sy=json.dumps(x,ensure_ascii=False),json.dumps(y,ensure_ascii=False);i=0
                while i<min(len(sx),len(sy)) and sx[i]==sy[i]:i+=1
                print('≠',ruta,'\n   antes:  ',sx[max(0,i-60):i+160],'\n   después:',sy[max(0,i-60):i+160])
            return
        if isinstance(x,dict):
            for k in list(x)+[k for k in y if k not in x]:
                if k not in x:n[0]+=1;print('+ solo después:',ruta+'.'+k)
                elif k not in y:n[0]+=1;print('- solo antes:',ruta+'.'+k)
                else:dif(x[k],y[k],ruta+'.'+k)
            if list(x)!=list(y) and set(x)==set(y):n[0]+=1;print('orden de claves distinto:',ruta,'|',' '.join(x)[:100],'→',' '.join(y)[:100])
        else:
            if len(x)!=len(y):n[0]+=1;print('longitud distinta:',ruta,len(x),'→',len(y))
            for i,(p,q) in enumerate(zip(x,y)):dif(p,q,ruta+'[%d]'%i)
    for k in A:dif(A[k],B.get(k),k)
    print('diferencias:',n[0],'· errores en consola:',len(A.get('errs',[])),'→',len(B.get('errs',[])),'· errores de página:',len(A.get('werrs',[])),'→',len(B.get('werrs',[])))
    return 1 if n[0] else 0

if __name__=='__main__':
    a=sys.argv[1:]
    if len(a)>=2 and a[0]=='volcar':sys.exit(0 if volcar(a[1],int(a[2]) if len(a)>2 else 120,a[3] if len(a)>3 else None) else 1)
    if len(a)==3 and a[0]=='comparar':sys.exit(comparar(a[1],a[2]))
    print(__doc__);sys.exit(2)
