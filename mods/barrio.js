// =================== LA CIUDAD Y SUS BARRIOS: el plano, el mapa de cada barrio, fichas y «mirar dentro» ===================
// El 🗺️ abre el plano de la CIUDAD (barrios como manzanas, líneas de transporte, dónde estás). Se toca un barrio: su ficha y «Ver el barrio».
// El mapa de BARRIO es el de siempre pero solo con lo de ese barrio, con sus calles con nombre: se arrastra, se toca un edificio y sale su ficha.
// «Mirar dentro»: la escena interior de un lugar a la hora actual, como observadora (sin el personaje). Nada de esto toca S.sim ni el reloj.
// Los datos son data/ciudad.json (barrios, calles, puertas, enlaces), `barrio` y `rb` de cada lugar (data/lugares.json) y de cada edificio del censo (data/barrio.json).
// Arriba, funciones PURAS para el camino a pie y el trayecto (cdBarrioDe, cdPuerta, cdCamino, cdTrayecto): la segunda mitad (andar por la calle) se apoya en ellas.
// Lo mismo se calcula en scripts/datos.py (grafo, camino, trayecto_py): si cambia uno, cambia el otro.
// El mapa solo se calcula y se pinta mientras está abierto: cerrado, render() pasa de largo.

// ---------------- datos de la ciudad ----------------
const CDX=()=>DATA.ciudad||{ciudad:{m_casilla:10,m_plano:100,min_km:12},orden:[],vivienda:{},barrios:{},enlaces:{pie:[],lineas:[]}};
const cdK=()=>CDX().ciudad.m_plano/CDX().ciudad.m_casilla;           // casillas por unidad de plano
const cdMc=()=>CDX().ciudad.m_casilla/1000*CDX().ciudad.min_km;      // minutos a pie por casilla (12 min por km)
const cdTam=b=>{const p=CDX().barrios[b].plano,k=cdK();return [(p[2]-p[0])*k,(p[3]-p[1])*k];};
const cdLug=id=>PLACES[id]||(DATA.lugares.solo_mapa||{})[id]||null;     // un lugar con escena (PLACES) o solo de mapa
const cdHome=()=>CDX().vivienda[(S.home&&S.home.type)||'casita']||'ribera';
// a qué barrio pertenece un lugar, un edificio del censo, un lugar solo de mapa o «casa»
function cdBarrioDe(id){if(id==='casa')return cdHome();
  const p=cdLug(id);if(p)return p.barrio==='@casa'?cdHome():(p.barrio||null);
  const e=DATA.barrio&&DATA.barrio.edificios&&DATA.barrio.edificios[id];return e?e.barrio:null;}
// el rectángulo [x0,y0,x1,y1] en coordenadas locales de su barrio
function cdRect(id){const b=cdBarrioDe(id);if(!b)return null;
  if(id==='casa'||id==='casaV'||id==='casa2'){const c=CDX().barrios[b].casa;return c&&c[id]||null;}
  const p=cdLug(id);if(p)return p.rb||null;const e=DATA.barrio.edificios[id];return e?e.rb:null;}
// la puerta: {b, p:[x,y], c:calle}, un punto en el eje de una calle de su barrio
function cdPuerta(id){const b=cdBarrioDe(id);if(!b)return null;const q=CDX().barrios[b].puertas[id];return q?{b,p:[q[0],q[1]],c:q[2]}:null;}
// ---------------- el grafo de calles de un barrio ----------------
const cdKey=p=>(Math.round(p[0]*10)/10)+','+(Math.round(p[1]*10)/10);
const cdHor=c=>c.a[1]===c.b[1];
const cdOn=(c,p)=>{const e=1e-6;return cdHor(c)?Math.abs(p[1]-c.a[1])<e&&c.a[0]-e<=p[0]&&p[0]<=c.b[0]+e:Math.abs(p[0]-c.a[0])<e&&c.a[1]-e<=p[1]&&p[1]<=c.b[1]+e;};
// los puntos especiales de un barrio (pasos a otros barrios y paradas), además de las puertas
function cdEspeciales(b){const E=CDX().enlaces,o=[];
  for(const l of E.pie){if(l.a===b)o.push({t:'paso',p:l.pa,a:l.b,m:l.m});if(l.b===b)o.push({t:'paso',p:l.pb,a:l.a,m:l.m});}
  E.lineas.forEach(l=>l.paradas.forEach((s,i)=>{if(s.b===b)o.push({t:'parada',p:s.p,l:l.id,i,n:s.n});}));return o;}
const CDG={};
function cdGrafo(bid){if(CDG[bid])return CDG[bid];const B=CDX().barrios[bid],cal=B.calles,nodes=new Map(),add=p=>{const k=cdKey(p);if(!nodes.has(k))nodes.set(k,[+k.split(',')[0],+k.split(',')[1]]);};
  for(const c of cal){add(c.a);add(c.b);}
  for(let i=0;i<cal.length;i++)for(let j=i+1;j<cal.length;j++){const c=cal[i],e=cal[j];if(cdHor(c)===cdHor(e))continue;const h=cdHor(c)?c:e,v=cdHor(c)?e:c,p=[v.a[0],h.a[1]];if(cdOn(h,p)&&cdOn(v,p))add(p);}
  for(const q of Object.values(B.puertas))add(q);
  for(const s of cdEspeciales(bid))add(s.p);
  const adj=new Map([...nodes.keys()].map(k=>[k,[]]));
  for(const c of cal){const ps=[...nodes.values()].filter(p=>cdOn(c,p)).sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
    for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],l=Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),ka=cdKey(a),kb=cdKey(b);adj.get(ka).push({k:kb,l,c:c.n});adj.get(kb).push({k:ka,l,c:c.n});}}
  return CDG[bid]={nodes,adj};}
// Dijkstra sobre un mapa de adyacencias: {k, l|c}; devuelve {d, ks} o null
function cdDij(adj,a,b,w){const dist=new Map([[a,0]]),prev=new Map(),open=new Set([a]);
  while(open.size){let u=null,du=1e18;for(const k of open){const d=dist.get(k);if(d<du){du=d;u=k;}}
    open.delete(u);if(u===b)break;
    for(const e of adj.get(u)||[]){const nd=du+e[w];if(nd<(dist.has(e.k)?dist.get(e.k):1e18)-1e-9){dist.set(e.k,nd);prev.set(e.k,u);open.add(e.k);}}}
  if(!dist.has(b))return null;const ks=[b];while(ks[0]!==a)ks.unshift(prev.get(ks[0]));return {d:dist.get(b),ks};}
const cdPt=(b,x)=>Array.isArray(x)?x:(CDX().barrios[b].puertas[x]||[]).slice(0,2);
// el camino a pie entre dos puertas (ids) o puntos [x,y] de un barrio: lista de puntos [x,y] (extremos y esquinas)
function cdCamino(b,a,c){const g=cdGrafo(b),pa=cdPt(b,a),pc=cdPt(b,c);if(pa.length<2||pc.length<2)return null;
  const ka=cdKey(pa),kc=cdKey(pc);if(!g.nodes.has(ka)||!g.nodes.has(kc))return null;const r=cdDij(g.adj,ka,kc,'l');if(!r)return null;
  const pts=r.ks.map(k=>g.nodes.get(k).slice()),out=[];
  for(let i=0;i<pts.length;i++){const p=pts[i],q=out[out.length-1],q2=out[out.length-2];if(q&&q[0]===p[0]&&q[1]===p[1])continue;
    if(q2&&((q2[0]===q[0]&&q[0]===p[0])||(q2[1]===q[1]&&q[1]===p[1])))out[out.length-1]=p;else out.push(p);}
  return out;}
const cdLong=pts=>{let s=0;for(let i=1;i<pts.length;i++)s+=Math.abs(pts[i][0]-pts[i-1][0])+Math.abs(pts[i][1]-pts[i-1][1]);return s;};  // en casillas
const cdMinPie=pts=>Math.round(cdLong(pts)*cdMc()*10)/10;                                                                  // minutos a pie
// ---------------- el trayecto entre dos sitios, a pie y en transporte ----------------
// Devuelve {min, h (horas de salario), precio (hrs(h)), tramos:[…]} o null. Cada tramo:
//  {m:'pie', b:barrio, pts:[[x,y]…], min}                      andar por las calles de un barrio
//  {m:'paso', de, a, pa:[x,y], pb:[x,y], min}                  cruzar a pie de un barrio al vecino (pa en `de`, pb en `a`)
//  {m:'metro'|'bus'|'tren', linea, n, de, a, paradas:[…], espera, viaje, min, h}   subir, viajar y bajar (espera = media espera, cada/2)
let CDM=null;
function cdMeta(){if(CDM)return CDM;const E=CDX().enlaces,adj=new Map(),mc=cdMc(),km=CDX().ciudad.min_km,G=k=>{if(!adj.has(k))adj.set(k,[]);return adj.get(k);};
  const gk=(b,p)=>'g|'+b+'|'+cdKey(p),spec={};
  for(const b of CDX().orden){spec[b]=[];for(const s of cdEspeciales(b))if(!spec[b].some(q=>cdKey(q)===cdKey(s.p)))spec[b].push(s.p);}
  for(const b of CDX().orden){const g=cdGrafo(b);for(let i=0;i<spec[b].length;i++)for(let j=i+1;j<spec[b].length;j++){const r=cdDij(g.adj,cdKey(spec[b][i]),cdKey(spec[b][j]),'l');
    if(r){G(gk(b,spec[b][i])).push({k:gk(b,spec[b][j]),c:r.d*mc,t:'pie',b});G(gk(b,spec[b][j])).push({k:gk(b,spec[b][i]),c:r.d*mc,t:'pie',b});}}}
  for(const l of E.pie){const c=l.m/1000*km;G(gk(l.a,l.pa)).push({k:gk(l.b,l.pb),c,t:'paso',de:l.a,a:l.b,pa:l.pa,pb:l.pb});G(gk(l.b,l.pb)).push({k:gk(l.a,l.pa),c,t:'paso',de:l.b,a:l.a,pa:l.pb,pb:l.pa});}
  for(const l of E.lineas)l.paradas.forEach((s,i)=>{const g=gk(s.b,s.p),o='l|'+l.id+'|'+i;G(g).push({k:o,c:l.cada/2,t:'sube',l:l.id,i});G(o).push({k:g,c:0,t:'baja',l:l.id,i});
    if(i){const o0='l|'+l.id+'|'+(i-1),c=l.min[i-1];G(o0).push({k:o,c,t:'via',l:l.id,i});G(o).push({k:o0,c,t:'via',l:l.id,i:i-1});}});
  return CDM={adj,spec,gk};}
function cdTrayecto(idA,idB){const bA=cdBarrioDe(idA),bB=cdBarrioDe(idB);if(!bA||!bB)return null;const pA=cdPuerta(idA),pB=cdPuerta(idB);if(!pA||!pB)return null;
  const E=CDX().enlaces,mc=cdMc(),r1=x=>Math.round(x*10)/10;
  if(bA===bB){const pts=cdCamino(bA,idA,idB);if(!pts)return null;const m=cdMinPie(pts);return {min:m,h:0,precio:0,tramos:[{m:'pie',b:bA,pts,min:m}]};}
  const M=cdMeta(),adj=new Map([...M.adj].map(([k,v])=>[k,v.slice()])),src='g|'+bA+'|'+cdKey(pA.p),dst='g|'+bB+'|'+cdKey(pB.p),G=k=>{if(!adj.has(k))adj.set(k,[]);return adj.get(k);};
  const unir=(b,p,k,sale)=>{const g=cdGrafo(b);for(const q of M.spec[b]){const r=cdDij(g.adj,cdKey(p),cdKey(q),'l');if(!r)continue;const gq=M.gk(b,q);if(gq===k)continue;
    if(sale)G(k).push({k:gq,c:r.d*mc,t:'pie',b});else G(gq).push({k,c:r.d*mc,t:'pie',b});}};
  unir(bA,pA.p,src,true);unir(bB,pB.p,dst,false);
  // si la puerta ya es un punto especial, el nodo es el mismo
  const r=cdDij(adj,src,dst,'c');if(!r)return null;
  // reconstruir tramos
  const tramos=[];let cur=null;const cierra=()=>{if(cur){cur.min=r1(cur.min);tramos.push(cur);cur=null;}};
  const nodoP=k=>{const q=k.split('|');return q[0]==='g'?[q[1],q[2].split(',').map(Number)]:null;};
  for(let i=1;i<r.ks.length;i++){const u=r.ks[i-1],v=r.ks[i],e=adj.get(u).filter(x=>x.k===v).reduce((a,b)=>b.c<a.c?b:a);
    if(e.t==='pie'){const [b,p]=nodoP(u),[,q]=nodoP(v),seg=cdCamino(b,p,q);
      if(cur&&cur.m==='pie'&&cur.b===b){cur.pts=cur.pts.concat(seg.slice(1));cur.min+=e.c;}else{cierra();cur={m:'pie',b,pts:seg,min:e.c};}}
    else if(e.t==='paso'){cierra();tramos.push({m:'paso',de:e.de,a:e.a,pa:e.pa,pb:e.pb,min:r1(e.c)});}
    else if(e.t==='sube'){cierra();const L=E.lineas.find(x=>x.id===e.l);cur={m:L.modo,linea:L.id,n:L.n,de:L.paradas[e.i].n,a:L.paradas[e.i].n,paradas:[L.paradas[e.i].n],espera:L.cada/2,viaje:0,min:L.cada/2,h:L.precio_h};}
    else if(e.t==='via'){const L=E.lineas.find(x=>x.id===e.l);cur.viaje+=e.c;cur.min+=e.c;cur.a=L.paradas[e.i].n;cur.paradas.push(L.paradas[e.i].n);}
    else if(e.t==='baja'){cur.viaje=r1(cur.viaje);cierra();}}
  cierra();
  const h=Math.round(tramos.reduce((s,t)=>s+(t.h||0),0)*1000)/1000;
  return {min:r1(r.d),h,precio:typeof hrs==='function'?hrs(h):null,tramos};}

// ---------------- el mapa ----------------
const BM={on:false,obs:null,S:null,pt:[0,0],pre:null,mapCam:null,rot:0,ficha:null,bx:null,v:'ciudad',b:null,cdHit:[]};
const BMX=30; // margen que se puede arrastrar fuera del barrio
// estado propio en S (con valores por defecto si falta): cámara de cada barrio y el último visto
const BMS=()=>{const b=S.barrio||(S.barrio={});if(!(b.z>0))b.z=.3;if(typeof b.cx!=='number')b.cx=0;if(typeof b.cy!=='number')b.cy=0;if(!b.cam)b.cam={};return b;};
const bmDias=ds=>{if(!Array.isArray(ds)||ds.length>=7)return '';const n=['lun','mar','mié','jue','vie','sáb','dom'];
  if(ds.length>=5&&ds.every((d,i)=>d===ds[0]+i))return n[ds[0]]+'–'+n[ds[ds.length-1]];return ds.map(d=>n[d]).join(', ');};
const bmH=h=>{const m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0');};
const bmHm=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor((h%1)*60)).padStart(2,'0');
function bmName(k){const p=cdLug(k);if(!p)return k;if(k==='tienda'&&S.track==='negocio')return 'Tu tienda';if(k==='casaV'&&P_('vecina'))return 'Casa de '+P_('vecina').n;return p.n;}
const bmX=()=>{const [w,h]=cdTam(BM.b);return [-BMX,-BMX,w+BMX,h+BMX];};
const bmFlat=t=>t==='viejo'||t==='habitacion'||t==='bueno';  // casas que son un piso: se dibujan como bloque
// ---- lo que hay en un barrio: lugares, edificios del censo, lugares solo de mapa y la casa, con su caja (rect + alto) ----
function cdCosas(b){const out=[];if(!b)return out;
  for(const k in PLACES){if(cdBarrioDe(k)!==b)continue;const p=PLACES[k],r=cdRect(k);if(!r)continue;
    let h=p.park?26:Math.round((p.h||24)*1.5);if(k==='parroquia')h+=30;if(k==='obra')h+=44;if(k==='ayto')h+=32;if(p.roof)h+=14;out.push({id:k,kind:'lugar',r,h});}
  const sm=DATA.lugares.solo_mapa||{};
  for(const k in sm){if(sm[k].barrio!==b)continue;const p=sm[k];out.push({id:k,kind:'extra',r:p.rb,h:p.solar?3:Math.max(10,Math.round((p.h||22)*1.3)),p});}
  const ed=DATA.personas.edificios||{};
  for(const id in ed){const e=ed[id],q=DATA.barrio.edificios[id];if(!q||q.barrio!==b)continue;const bl=e.tipo==='bloque';
    out.push({id,kind:'censo',r:q.rb,h:bl?e.plantas*15+18:e.plantas*21+27,bl,pl:e.plantas,c:q.c,roof:q.roof,det:q.det});}
  if(b===cdHome()){const r=cdRect('casa');if(r)out.push({id:'casa',kind:'casa',r,h:66});}
  for(const x of out)x.d=x.r[2]+x.r[3]-.5;
  return out;}
function bmBoxes(){if(BM.bx&&BM.bx.b===BM.b)return BM.bx.l;if(!BM.b)return [];BM.bx={b:BM.b,l:cdCosas(BM.b)};return BM.bx.l;}
// CMF: el origen del marco en el que se pinta (coordenadas locales del barrio). En el mapa, [0,0]; en casa, la esquina de la parcela; dentro de un lugar, la de su planta.
// cmV pasa un rectángulo del barrio a la vista de ese marco (con la rotación de la casa si la hay).
let CMF=[0,0];
const cmV=r=>vrect([r[0]-CMF[0],r[1]-CMF[1],r[2]-CMF[0],r[3]-CMF[1]]);
const cmW2V=(x,y)=>w2v(x-CMF[0],y-CMF[1]);
const bmProj=(u,v,z)=>{const [x,y]=P(u,v,z);return [cam.x+x*cam.z,cam.y+y*cam.z];};
function bmCvx(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
  for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}
  lo.pop();up.pop();return lo.concat(up);}
function bmHull(b){const pts=[],r=cmV(b.r);for(const [u,v] of [[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]])for(const z of [0,b.h])pts.push(bmProj(u,v,z));return bmCvx(pts);}
function bmIn(h,x,y){let s=0;for(let i=0;i<h.length;i++){const a=h[i],b=h[(i+1)%h.length],c=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(c===0)continue;const g=c>0?1:-1;if(!s)s=g;else if(s!==g)return false;}return true;}
function bmBB(h){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of h){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return [x0,y0,x1,y1];}
const bmSee=bb=>bb[2]>-40&&bb[0]<W+40&&bb[3]>-40&&bb[1]<H+40;
// lo tocable ahora mismo, con su hull en pantalla (también lo usa la prueba)
function bmTargets(){return bmBoxes().map(b=>{const hull=bmHull(b),bb=bmBB(hull);return {id:b.id,kind:b.kind,d:b.d,hull,bb,cx:(bb[0]+bb[2])/2,cy:(bb[1]+bb[3])/2,box:b};});}
function bmAt(sx,sy){let best=null;for(const t of bmTargets()){if(sx<t.bb[0]||sx>t.bb[2]||sy<t.bb[1]||sy>t.bb[3])continue;if(bmIn(t.hull,sx,sy)&&(!best||t.d>best.d))best=t;}return best;}
// ---- cámara ----
function bmCenter(cx,cy,z){if(z)cam.z=z;const [u,v]=w2v(cx,cy),[x,y]=P(u,v);cam.x=W/2-x*cam.z;cam.y=H*.5-y*cam.z;}
// zoom en el que el barrio cabe a lo ancho, y el de salida
const bmFitZ=()=>{const [w,h]=cdTam(BM.b);return Math.max(.08,(W-16)/((w+h)*TW/2));};
function bmClamp(){const fz=bmFitZ();cam.z=Math.max(fz,Math.min(1.2,cam.z));const [u,v]=screenToView(W/2,H*.5);let [x,y]=v2w(u,v);const e=bmX(),nx=Math.max(e[0],Math.min(e[2],x)),ny=Math.max(e[1],Math.min(e[3],y));if(nx!==x||ny!==y)bmCenter(nx,ny);}
function bmSaveCam(){if(BM.v!=='barrio'||!BM.b)return;const [u,v]=screenToView(W/2,H*.5),[x,y]=v2w(u,v),b=BMS();b.cx=Math.round(x*10)/10;b.cy=Math.round(y*10)/10;b.z=Math.round(cam.z*100)/100;b.b=BM.b;b.cam[BM.b]={cx:b.cx,cy:b.cy,z:b.z};}
// ---- abrir y cerrar ----
function bmOpen(){if(BM.on){if(BM.obs)bmBack();return;}
  if(mode!=='live')return;
  BM.on=true;BM.obs=null;BM.S=S;BM.pre={cam:{x:cam.x,y:cam.y,z:cam.z},view:viewPlace,rot,scene:sceneKey};
  rot=0;viewPlace=false;sceneKey=null;BM.ficha=null;BM.v='ciudad';BM.b=null;BM.bx=null;
  document.body.classList.add('bm');bmUI();}
function bmClose(){if(!BM.on)return;
  if(BM.obs)bmBack(true);else bmSaveCam();
  BM.on=false;BM.obs=null;BM.ficha=null;BM.v='ciudad';BM.b=null;BM.bx=null;const p=BM.pre;BM.pre=null;
  if(p){rot=p.rot;cam.x=p.cam.x;cam.y=p.cam.y;cam.z=p.cam.z;viewPlace=p.view;sceneKey=null;}
  document.body.classList.remove('bm','bmobs');menu.classList.remove('open');bmUI();}
// del plano de la ciudad al mapa de un barrio (y vuelta)
function bmVerBarrio(id){if(!BM.on||BM.obs||!CDX().barrios[id])return false;
  BM.v='barrio';BM.b=id;BM.bx=null;BM.ficha=null;menu.classList.remove('open');
  const s=BMS(),c=s.cam[id];
  let cx,cy,z;
  if(c){cx=c.cx;cy=c.cy;z=c.z;}
  else{const [w,h]=cdTam(id);cx=w/2;cy=h/2;z=Math.max(bmFitZ(),.26);
    const s2=S.sim,dest=s2&&s2.work>0&&s2.dest&&cdBarrioDe(cmDest(s2.dest))===id?cdRect(cmDest(s2.dest)):null,q=dest||(id===cdHome()?cdRect('casa'):null);if(q){cx=(q[0]+q[2])/2;cy=(q[1]+q[3])/2;}}
  bmCenter(cx,cy,z);bmClamp();bmUI();return true;}
function bmCiudad(){if(!BM.on||BM.v==='ciudad')return;if(BM.obs)bmBack(true);bmSaveCam();BM.v='ciudad';BM.b=null;BM.bx=null;BM.ficha=null;menu.classList.remove('open');document.body.classList.remove('bmobs');bmUI();}
// «mirar dentro»: la escena del lugar a la hora actual, sin mover a nadie
function bmLook(k){if(!BM.on||BM.v!=='barrio'||!SCENES[k])return false;
  bmSaveCam();BM.mapCam={x:cam.x,y:cam.y,z:cam.z};BM.obs=k;sceneKey=null;
  menu.classList.remove('open');document.body.classList.add('bmobs');
  // la cámara al sitio, a escala de juego (la figura de pie, unos 30 px)
  const r=cdRect(k)||[0,0,1,1];bmCenter((r[0]+r[2])/2,(r[1]+r[3])/2,.75);bmUI();return true;}
function bmBack(quiet){if(!BM.obs)return;BM.obs=null;sceneKey=null;
  if(BM.mapCam){cam.x=BM.mapCam.x;cam.y=BM.mapCam.y;cam.z=BM.mapCam.z;}
  document.body.classList.remove('bmobs');if(!quiet)bmUI();}
// donde está de verdad el personaje: ahí no se oculta
const bmReal=k=>typeof cmDentro==='function'?cmDentro(k):false;
function bmSilent(fn,key,self,args){if(!BM.obs||bmReal(key))return fn.apply(self,args);const s=S.sim,o=s.outingActive;s.outingActive=null;try{const r=fn.apply(self,args);if(r&&r.ana&&typeof r.ana==='object')r.ana={...r.ana,x:-60,y:-60};return r;}finally{s.outingActive=o;}}
{const _sa=sceneAct;sceneAct=function(){return BM.on&&BM.obs&&!bmReal(BM.obs)?(((PLACES[BM.obs]||{}).outs||[])[0]||'work'):_sa.apply(this,arguments);};} // una salida o el trabajo que la escena conozca; la figura del personaje no se pinta
{const _bs=buildScene;buildScene=function(key,tt,night){return bmSilent(_bs,key,this,arguments);};}
// mientras el mapa está abierto, el motor no mueve la cámara ni cambia de escena por su cuenta
{const _e=enterScene;enterScene=function(){if(BM.on)return;return _e.apply(this,arguments);};}
{const _l=leaveScene;leaveScene=function(){if(BM.on)return;return _l.apply(this,arguments);};}
{const _r=rotate;rotate=function(){if(BM.on)return;return _r.apply(this,arguments);};}
{const _m=setMode;setMode=function(m){if(m!=='live'&&BM.on)bmClose();return _m.apply(this,arguments);};}
{const _z=zoomAt;zoomAt=function(f,sx,sy){if(!(BM.on&&!BM.obs))return _z.apply(this,arguments);if(BM.v!=='barrio')return;const nz=Math.max(bmFitZ(),Math.min(1.2,cam.z*f)),k=nz/cam.z;cam.x=sx-(sx-cam.x)*k;cam.y=sy-(sy-cam.y)*k;cam.z=nz;};}
{const _lt=liveTap;liveTap=function(x,y){if(BM.on){try{if(!BM.obs)bmTap(BM.pt[0],BM.pt[1]);}catch(e){console.error(e);}return;}return _lt.apply(this,arguments);};}
addEventListener('pointerup',e=>{BM.pt=[e.clientX,e.clientY];},true);
// la interfaz de rótulos cuenta con la barra del mapa para no escribir debajo
{const _u=rtUI;rtUI=function(){const o=_u.apply(this,arguments);if(!BM.on)return o;const el=document.getElementById('brbar');if(!el)return o;const r=el.getBoundingClientRect();if(r.width<2)return o;
  RT.uiTop=Math.max(RT.uiTop||0,0);return o.concat([[r.left,r.top,r.right,r.bottom]]);};}
// ---- botones ----
const bmCasaN=()=>{const h=HOMES[(S.home&&S.home.type)||'casita']||{};return h.n?h.n.toLowerCase():'';};
function bmUI(){let bar=document.getElementById('brbar');
  if(!bar){bar=document.createElement('div');bar.id='brbar';document.body.appendChild(bar);
    bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='brback')bmBack();else if(b.id==='brclose')bmClose();else if(b.id==='brciudad')bmCiudad();});}
  const mb=document.getElementById('mapbtn');if(mb)mb.classList.toggle('on',BM.on);
  if(!BM.on){bar.innerHTML='';return;}
  const C=CDX(),B=BM.b&&C.barrios[BM.b];
  if(BM.obs)bar.innerHTML=`<button class="glass" id="brback">◀ Volver al mapa</button><div class="glass brt">👁️ Mirando dentro: ${bmName(BM.obs)}<small>${bmReal(BM.obs)?'Ahí está ella ahora':'Solo miras: no entras'}</small></div>`;
  else if(BM.v==='barrio'&&B)bar.innerHTML=`<button class="glass" id="brciudad">◀ La ciudad</button><div class="glass brt">${B.e} ${B.n}<small>${B.tipo_n} · arrastra para moverte</small></div>`;
  else bar.innerHTML=`<button class="glass" id="brclose">🏠 Cerrar el mapa</button><div class="glass brt">🗺️ ${C.ciudad.n}<small>Toca un barrio</small></div>`;}
{const st=document.createElement('style');st.textContent=`
#brbar{position:fixed;top:112px;left:8px;z-index:6;display:none;flex-direction:column;align-items:flex-start;gap:5px;max-width:calc(100vw - 64px)}
body.bm #brbar{display:flex}
#brbar button{border:0;border-radius:14px;padding:8px 13px;font-family:inherit;font-weight:900;font-size:13px;color:var(--ink);cursor:pointer}
#brbar .brt{border-radius:12px;padding:5px 10px;font-weight:900;font-size:12px;color:var(--ink);line-height:1.25}
#brbar .brt small{display:block;font-size:10.5px;font-weight:800;color:var(--sub)}
body.bm #placebtn{display:none!important}
body.bm #rotbtn,body.bm #wallsbtn{display:none!important}
body.obra #mapbtn{display:none}
#mapbtn.on{background:#ff8a5b;color:#fff}
`;document.head.appendChild(st);
  const side=document.getElementById('side');if(side&&!document.getElementById('mapbtn')){const b=document.createElement('div');b.className='pill glass';b.id='mapbtn';b.title='Mapa de la ciudad';b.textContent='🗺️';
    b.onclick=()=>{if(BM.on&&!BM.obs)bmClose();else bmOpen();};side.appendChild(b);}
  const c=document.getElementById('center');if(c){const _c=c.onclick;c.onclick=function(){if(BM.on){if(!BM.obs&&BM.v==='barrio'){const [w,h]=cdTam(BM.b);bmCenter(w/2,h/2);bmClamp();}return;}return _c&&_c.apply(this,arguments);};}}
// ---- fichas ----
function bmEstado(k){const st=placeState(k),o=[];if(st.closed)o.push('cerrado por huelga');if(st.forRent)o.push('cerrado: se alquila');return o.join(' · ');}
// ---- horarios de apertura: el dato `abre` de data/lugares.json ([[desde,hasta,[días]],…]; hasta > 24 = cierra de madrugada). Hoy solo informa: el horario de cada salida sigue siendo OUT[k].h / .wd ----
const bmDiaEf=day=>festivo(day)?6:dateOf(day).wd; // los festivos cuentan como domingo
function bmAbreTxt(k){const ab=cdLug(k)&&cdLug(k).abre;if(!ab)return '';const nm=['lunes','martes','miércoles','jueves','viernes','sábados','domingos'];
  const t=ab.map(([d0,h0,ds])=>(d0===0&&h0===24?'las 24 horas':bmH(d0)+'–'+bmH(h0>24?h0-24:h0))+(ds.length>=7?(d0===0&&h0===24?'':' · todos los días'):' · '+bmDias(ds)));
  const cer=[0,1,2,3,4,5,6].filter(d=>!ab.some(f=>f[2].includes(d))).map(d=>nm[d]);
  return t.join('; ')+(cer.length?' · cierra los '+(cer.length>1?cer.slice(0,-1).join(', ')+' y '+cer[cer.length-1]:cer[0]):'');}
function bmAhora(k,day,h){const ab=cdLug(k)&&cdLug(k).abre;if(!ab)return null;const wd=bmDiaEf(day),pw=bmDiaEf(day-1);
  for(const [d0,h0,ds] of ab){if(ds.includes(wd)&&h>=d0&&h<Math.min(h0,24))return {on:true,hasta:h0>24?h0-24:h0};if(h0>24&&ds.includes(pw)&&h<h0-24)return {on:true,hasta:h0-24};}
  let best=null;for(let o=0;o<=7&&!best;o++){const ed=bmDiaEf(day+o);let c=null;for(const [d0,,ds] of ab)if(ds.includes(ed)&&(o>0||d0>h)&&(c===null||d0<c))c=d0;if(c!==null)best={o,h:c,wd:dateOf(day+o).wd};}
  return {on:false,abre:best};}
function bmAhoraTxt(k){const r=bmAhora(k,S.day,S.t/60);if(!r)return null;const st=placeState(k);
  if(st.closed||st.forRent)return {on:false,w:st.closed?'por huelga':'se alquila'};
  if(r.on)return {on:true,w:'cierra a las '+bmH(r.hasta)};
  const b=r.abre;return {on:false,w:b?'abre '+(b.o===0?'a las ':b.o===1?'mañana a las ':'el '+DATA.reglas.dias[b.wd].toLowerCase()+' a las ')+bmH(b.h):''};}
function bmSchedule(k){const p=cdLug(k),rows=[],ESC=typeof ESC_T!=='undefined'?ESC_T[k]:null;
  {const ab=bmAbreTxt(k);if(ab){rows.push(['🕘','Abierto',ab]);const a=bmAhoraTxt(k);if(a)rows.push([a.on?'🟢':'🔴','Ahora: '+(a.on?'abierto':'cerrado'),a.w]);}}
  if(ESC)rows.push(['🎒','Clases','lun–vie · '+bmH(ESC.ent[0]+.5)+' a '+bmH(ESC.sal[0])]);
  for(const o of p.outs||[]){const q=OUT[o];if(!q||o==='comedor')continue;const nm=typeof outName==='function'?outName(o):q.n;rows.push([q.e||'•',nm,(q.h?`${bmH(q.h[0])} a ${bmH(q.h[1])}`:'')+(q.wd?(q.h?' · ':'')+bmDias(q.wd):'')]);}
  return rows;}
const bmRow=(e,t,w)=>`<div class="outrow"><span class="oe">${e}</span><span class="ot"><b>${t}</b>${w?`<small>${w}</small>`:''}</span></div>`;
const bmAlq=x=>'×'+String(x).replace('.',',');
// dónde está ella ahora: el barrio y, si está fuera, el sitio
function bmDonde(){const s=S.sim;if(s&&s.work>0&&s.dest&&s.dest!=='_ride'&&typeof cmPos==='function'){const p=cmPos();if(p&&p.b)return {b:p.b,id:p.id||cmDest(s.dest),fuera:true,pos:p};}return {b:cdHome(),id:'casa',fuera:false};}
// la ficha de un barrio (desde el plano de la ciudad)
function bmFichaBarrio(id){const C=CDX(),B=C.barrios[id];if(!B)return false;BM.ficha='b:'+id;const dd=bmDonde();
  const lug=[...Object.keys(PLACES).filter(k=>cdBarrioDe(k)===id&&k!=='casaV'&&k!=='casa2'),...Object.keys(DATA.lugares.solo_mapa||{}).filter(k=>DATA.lugares.solo_mapa[k].barrio===id)];
  const hogs=Object.entries(DATA.personas.hogares).filter(([,q])=>cdBarrioDe(q.edificio)===id),gente=DATA.personas.vecinos.filter(v=>hogs.some(([hid])=>hid===v.hogar));
  const lin=C.enlaces.lineas.filter(l=>l.paradas.some(s=>s.b===id)),pie=C.enlaces.pie.filter(l=>l.a===id||l.b===id).map(l=>l.a===id?l.b:l.a);
  let h=`<h2>${B.e} ${B.n}</h2><div class="sub"><b>${B.tipo_n}</b> · alquiler ${bmAlq(B.alquiler)} la media de la ciudad</div><div class="sub">${B.d}</div>`;
  if(cdHome()===id)h+=bmRow('🏠','Vives aquí',bmCasaN());
  if(dd.fuera&&dd.b===id)h+=bmRow('📍','Estás aquí ahora',bmName(dd.id));
  h+=bmRow('👍','Lo bueno',B.bueno)+bmRow('😮‍💨','Lo que cuesta',B.cuesta);
  h+=bmRow('🏪','Qué hay · '+lug.length,lug.map(k=>cdLug(k).e+' '+bmName(k)).join(', '));
  if(gente.length)h+=bmRow('👥','Vive aquí del censo · '+gente.length,gente.slice(0,9).map(v=>v.n).join(', ')+(gente.length>9?' y '+(gente.length-9)+' más':''));
  if(lin.length||pie.length)h+=bmRow('🚏','Cómo se llega',(lin.length?lin.map(l=>({metro:'🚇',bus:'🚌',tren:'🚆'}[l.modo])+' '+l.n+' ('+l.paradas.find(s=>s.b===id).n+')').join(' · '):'')+(pie.length?(lin.length?' · ':'')+'a pie desde '+pie.map(b=>C.barrios[b].n).join(', '):''));
  h+=`<button class="btn" id="brver">🗺️ Ver el barrio</button><button class="btn grey" id="brx">Cerrar</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  const on=(i,f)=>{const el=card.querySelector('#'+i);if(el)el.onclick=f;};
  on('brx',()=>{menu.classList.remove('open');BM.ficha=null;});on('brver',()=>bmVerBarrio(id));return true;}
// una señal de paso a otro barrio, o una parada
function bmFichaEsp(id){const C=CDX(),q=id.split(':');let h;
  if(q[0]==='p'){const o=C.barrios[q[1]],l=C.enlaces.pie.find(x=>(x.a===BM.b&&x.b===q[1])||(x.b===BM.b&&x.a===q[1]));if(!o||!l)return false;const mn=Math.round(l.m/1000*C.ciudad.min_km*10)/10;
    h=`<h2>➜ ${o.n}</h2><div class="sub">Se pasa a pie: ${l.m} m, unos ${String(mn).replace('.',',')} min.</div>`+bmRow('🏷️',o.tipo_n,o.d)+`<button class="btn" id="brver">🗺️ Ver ${o.n}</button><button class="btn grey" id="brx">Cerrar</button>`;
    BM.ficha=id;card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;card.querySelector('#brver').onclick=()=>bmVerBarrio(q[1]);}
  else{const l=C.enlaces.lineas.find(x=>x.id===q[1]),i=+q[2];if(!l||!l.paradas[i])return false;const ic={metro:'🚇',bus:'🚌',tren:'🚆'}[l.modo];
    h=`<h2>${ic} ${l.paradas[i].n}</h2><div class="sub">${l.n} · pasa cada ${l.cada} min · billete ${typeof hrs==='function'?fmt(hrs(l.precio_h))+' €':l.precio_h+' h'}</div><div class="clab">Hacia</div>`;
    l.paradas.forEach((s,j)=>{if(j===i)return;let m=0;for(let k=Math.min(i,j);k<Math.max(i,j);k++)m+=l.min[k];h+=bmRow('➜',s.n+' · '+C.barrios[s.b].n,m+' min en '+l.modo);});
    h+=`<button class="btn grey" id="brx">Cerrar</button>`;BM.ficha=id;card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;}
  const el=card.querySelector('#brx');if(el)el.onclick=()=>{menu.classList.remove('open');BM.ficha=null;};return true;}
function bmFicha(id){if(/^b:/.test(id))return bmFichaBarrio(id.slice(2));if(/^[ps]:/.test(id))return bmFichaEsp(id);
  const b=bmBoxes().find(x=>x.id===id);if(!b)return false;BM.ficha=id;const ed=DATA.personas.edificios||{};
  let h='';const ub=CDX().barrios[BM.b];
  if(b.kind==='casa'){const hm=HOMES[(S.home&&S.home.type)||'casita']||{};
    h=`<h2>🏠 Tu casa</h2><div class="sub">${CH().name} vive aquí${hm.n?': '+hm.n.toLowerCase():''}.</div>`;
    h+=`<div class="kv"><span>📍 Dónde</span><span>${S.sim.work>0?'fuera ahora':'en casa'} · ${ub.n}</span></div>`;
    h+=`<button class="btn" id="brhome">🏠 Volver a casa</button><button class="btn grey" id="brx">Cerrar</button>`;}
  else if(b.kind==='censo'){const e=ed[id],V=DATA.personas.vecinos,H=DATA.personas.hogares;
    const hs=Object.entries(H).filter(([,q])=>q.edificio===id).sort((a,c)=>String(a[1].puerta||'').localeCompare(String(c[1].puerta||''),'es'));
    const gente=hs.reduce((s,[,q])=>s+q.miembros.length,0);
    h=`<h2>${e.tipo==='bloque'?'🏢':'🏠'} ${e.n}</h2><div class="sub">${e.d}</div>`;
    h+=`<div class="kv"><span>🏗️ Plantas</span><span>${e.plantas}</span></div><div class="kv"><span>👥 Gente</span><span>${gente} ${gente===1?'persona':'personas'} en ${hs.length} ${hs.length===1?'hogar':'hogares'}</span></div><div class="kv"><span>📍 Barrio</span><span>${ub.n}</span></div>`+cmKV(cdPuerta(id)?cmTrayectoTxt(id):'');
    h+=`<div class="clab">${e.tipo==='bloque'?'Hogares del bloque':'Hogar'}</div>`;
    for(const [hid,q] of hs){const n=q.miembros.length;h+=`<div class="outrow"><span class="oe">${e.tipo==='bloque'?'🚪':'🏠'}</span><span class="ot"><b>${q.n}</b><small>${q.puerta?q.puerta+' · ':''}${n} ${n===1?'persona':'personas'}</small></span></div>`;}
    if(!hs.length)h+=`<div class="sub">Ahora mismo no hay nadie registrado.</div>`;
    h+=`<button class="btn grey" id="brx">Cerrar</button>`;}
  else{const p=cdLug(id),hr=S.t/60,wd=dateOf(S.day).wd,es=bmEstado(id);
    h=`<h2>${p.e} ${bmName(id)}</h2><div class="sub">${id==='casaV'&&P_('vecina')?`Aquí vive ${P_('vecina').n}. Relación: ${relLabel(P_('vecina').rel)}.`:p.d||'Una casa del barrio.'}</div>`;
    h+=`<div class="kv"><span>📍 Barrio</span><span>${ub.n}</span></div>`+cmKV(cdPuerta(id)?cmTrayectoTxt(id):'');
    if(es)h+=`<div class="kv"><span>🪧 Hoy</span><span>${es}</span></div>`;
    const rows=bmSchedule(id);
    if(rows.length){h+=`<div class="clab">Qué se hace y cuándo</div>`;for(const [e,n,w] of rows)h+=bmRow(e,n,w);}
    let ve=[];try{ve=vecinosEn(id,hr,wd);}catch(x){console.error(x);}
    const tr=ve.filter(q=>q.motivo==='trabajo'),cl=ve.filter(q=>q.motivo==='clase'),otros=ve.filter(q=>q.motivo!=='trabajo'&&q.motivo!=='clase');
    h+=`<div class="clab">Ahora, a las ${bmHm(hr)}</div>`;
    const lista=(ico,tit,arr,puesto)=>{if(!arr.length)return '';const sh=arr.slice(0,8).map(q=>q.v.n+(puesto&&pbPuesto(q.v)?' ('+pbPuesto(q.v)+')':'')).join(', ');
      return `<div class="outrow"><span class="oe">${ico}</span><span class="ot"><b>${tit} · ${arr.length}</b><small>${sh}${arr.length>8?' y '+(arr.length-8)+' más':''}</small></span></div>`;};
    if(es&&/huelga/.test(es)&&!ve.length)h+=`<div class="sub">Persianas bajadas.</div>`;
    h+=lista('💼','Trabajan',tr,true)+lista('🎒','Estudian',cl,false)+lista('🧍','Están',otros,false);
    if(!ve.length)h+=`<div class="sub">Nadie del censo a esta hora.</div>`;
    if(b.kind==='extra')h+=`<div class="sub">Sin interior: solo se ve desde la calle.</div><button class="btn grey" id="brgo">${cmT('ir_boton')}</button><button class="btn grey" id="brx">Cerrar</button>`;
    else{h+=SCENES[id]?`<button class="btn" id="brin">👁️ Mirar dentro</button>`:`<div class="sub">Casa particular: desde la calle no se ve más.</div>`;
      h+=`<button class="btn grey" id="brgo">${cmT('ir_boton')}</button><button class="btn grey" id="brx">Cerrar</button>`;}}
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  const on=(i,f)=>{const el=card.querySelector('#'+i);if(el)el.onclick=f;};
  on('brx',()=>{menu.classList.remove('open');BM.ficha=null;});
  on('brin',()=>{BM.ficha=null;bmLook(id);});
  on('brgo',()=>{if(BM.on)bmClose();cmIr(id);});
  on('brhome',()=>{if(BM.on)bmClose();if(S.sim.work>0)cmVolver();});
  return true;}
function bmTap(sx,sy){
  if(BM.v==='ciudad'){for(const q of BM.cdHit)if(sx>=q.x0&&sx<=q.x1&&sy>=q.y0&&sy<=q.y1){sfx('tap');return bmFicha('b:'+q.id);}return false;}
  if(RT&&RT.last){for(const p of RT.last){if(sx>=p.x0&&sx<=p.x1&&sy>=p.y0&&sy<=p.y1&&p.bmid){sfx('tap');return bmFicha(p.bmid);}}}
  const t=bmAt(sx,sy);if(!t)return false;sfx('tap');return bmFicha(t.id);}
// ---- el plano de la ciudad: manzanas de color, líneas de transporte y dónde estás ----
const cdModoIc={metro:'🚇',bus:'🚌',tren:'🚆'};
function cdAjuste(){const C=CDX(),bs=Object.values(C.barrios);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const b of bs){x0=Math.min(x0,b.plano[0]);y0=Math.min(y0,b.plano[1]);x1=Math.max(x1,b.plano[2]);y1=Math.max(y1,b.plano[3]);}
  const top=212,bot=H-132,aw=W-24,ah=Math.max(200,bot-top),s=Math.min(aw/(x1-x0),ah/(y1-y0)),ox=(W-(x1-x0)*s)/2-x0*s,oy=top+(ah-(y1-y0)*s)/2-y0*s;return {s,ox,oy,x0,y0,x1,y1};}
// un punto local de un barrio → pantalla del plano
const cdPlanoPt=(A,b,p)=>{const B=CDX().barrios[b],k=cdK();return [A.ox+(B.plano[0]+p[0]/k)*A.s,A.oy+(B.plano[1]+p[1]/k)*A.s];};
function cdPin(x,y){const s=document.getElementById('hudpor');ctx.save();ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x-5,y+11);ctx.lineTo(x,y+19);ctx.lineTo(x+5,y+11);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.clip();if(s)try{ctx.drawImage(s,x-11,y-11,22,22);}catch(e){}ctx.restore();ctx.strokeStyle='#ff8a5b';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();ctx.restore();}
function cdPartir(t,w){const ws=t.split(' ');if(ctx.measureText(t).width<=w||ws.length<2)return [t];let best=[t],bd=1e9;for(let i=1;i<ws.length;i++){const a=ws.slice(0,i).join(' '),b=ws.slice(i).join(' '),m=Math.max(ctx.measureText(a).width,ctx.measureText(b).width);if(m<bd){bd=m;best=[a,b];}}return best;}
function cdRender(){const C=CDX(),A=cdAjuste(),dd=bmDonde(),pill={},blk=[];BM.cdHit=[];
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#e9e2d1';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(120,105,80,.07)';for(let i=0;i<W;i+=22)ctx.fillRect(i,0,1,H);for(let j=0;j<H;j+=22)ctx.fillRect(0,j,W,1);
  // las manzanas
  for(const id of C.orden){const B=C.barrios[id],k=cdK(),x0=A.ox+B.plano[0]*A.s+2,y0=A.oy+B.plano[1]*A.s+2,w=(B.plano[2]-B.plano[0])*A.s-4,h=(B.plano[3]-B.plano[1])*A.s-4;
    ctx.fillStyle=B.c;ctx.beginPath();ctx.roundRect?ctx.roundRect(x0,y0,w,h,10):ctx.rect(x0,y0,w,h);ctx.fill();
    ctx.save();ctx.beginPath();ctx.roundRect?ctx.roundRect(x0,y0,w,h,10):ctx.rect(x0,y0,w,h);ctx.clip();
    const sc=A.s/k;ctx.strokeStyle='rgba(255,253,248,.55)';ctx.lineCap='butt';
    for(const c of B.calles){ctx.lineWidth=Math.max(1,c.w*sc*.8);ctx.beginPath();ctx.moveTo(x0+c.a[0]*sc,y0+c.a[1]*sc);ctx.lineTo(x0+c.b[0]*sc,y0+c.b[1]*sc);ctx.stroke();}
    ctx.fillStyle='rgba(60,45,35,.18)';for(const q of cdCosas(id)){const r=q.r;ctx.fillRect(x0+r[0]*sc,y0+r[1]*sc,(r[2]-r[0])*sc,(r[3]-r[1])*sc);}
    ctx.restore();
    const you=dd.b===id;ctx.lineWidth=you?3.5:2;ctx.strokeStyle=you?'#ff8a5b':'#fffdf8';ctx.beginPath();ctx.roundRect?ctx.roundRect(x0,y0,w,h,10):ctx.rect(x0,y0,w,h);ctx.stroke();
    BM.cdHit.push({id,x0,y0,x1:x0+w,y1:y0+h});
    blk.push({id,B,x0,y0,w,h});}
  // las líneas de transporte
  for(const l of C.enlaces.lineas){const pts=l.paradas.map(s=>cdPlanoPt(A,s.b,s.p));ctx.strokeStyle=l.c;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.lineWidth=l.modo==='metro'?5:l.modo==='tren'?4:3;ctx.setLineDash(l.modo==='tren'?[9,5]:l.modo==='bus'?[2,6]:[]);
    ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);
    for(const p of pts){ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.arc(p[0],p[1],4.6,0,Math.PI*2);ctx.fill();ctx.strokeStyle=l.c;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(p[0],p[1],4.6,0,Math.PI*2);ctx.stroke();}}
  // los rótulos: nombre, tipo y alquiler, en una pastilla arriba (encima de las líneas)
  for(const {id,B,x0,y0,w} of blk){ctx.font='900 13px Nunito, sans-serif';const nl=cdPartir(B.n,w-16),tl=B.tipo_n+' · '+bmAlq(B.alquiler),lh=15;
    const ws=nl.map((t,i)=>ctx.measureText((i?'':B.e+' ')+t).width);let tf=10;ctx.font='800 10px Nunito, sans-serif';while(tf>8&&ctx.measureText(tl).width>w-22){tf-=.5;ctx.font='800 '+tf+'px Nunito, sans-serif';}const wt=ctx.measureText(tl).width;
    const pw=Math.min(w-6,Math.max(...ws,wt)+18),ph=nl.length*lh+15,px=x0+w/2-pw/2,py=y0+7;
    ctx.fillStyle='rgba(255,253,248,.94)';ctx.beginPath();ctx.roundRect?ctx.roundRect(px,py,pw,ph,8):ctx.rect(px,py,pw,ph);ctx.fill();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#3b3247';ctx.font='900 13px Nunito, sans-serif';nl.forEach((t,i)=>ctx.fillText((i?'':B.e+' ')+t,x0+w/2,py+10+i*lh));
    ctx.fillStyle='#6b6178';ctx.font='800 '+tf+'px Nunito, sans-serif';ctx.fillText(tl,x0+w/2,py+10+nl.length*lh);pill[id]=[py,py+ph];}
  // leyenda
  {const ls=C.enlaces.lineas;ctx.font='800 10.5px Nunito, sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';const ws=ls.map(l=>ctx.measureText(cdModoIc[l.modo]+' '+l.n).width+34),tot=ws.reduce((a,b)=>a+b,0);let x=(W-tot)/2;const y=A.oy+A.y1*A.s+22;
    ls.forEach((l,i)=>{ctx.strokeStyle=l.c;ctx.lineWidth=l.modo==='metro'?5:l.modo==='tren'?4:3;ctx.setLineDash(l.modo==='tren'?[7,4]:l.modo==='bus'?[2,5]:[]);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+22,y);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#3b3247';ctx.fillText(cdModoIc[l.modo]+' '+l.n,x+27,y+.5);x+=ws[i];});}
  // dónde estás: en el sitio exacto, sin tapar el rótulo del barrio
  {const r=cdRect(dd.id),pp=dd.pos&&dd.pos.x!=null&&dd.pos.vis?[dd.pos.x,dd.pos.y]:null;if(r||pp){let [x,y]=cdPlanoPt(A,dd.b,pp||[(r[0]+r[2])/2,(r[1]+r[3])/2]);const B=C.barrios[dd.b];if(pill[dd.b])y=Math.max(y,pill[dd.b][1]+22);cdPin(x,y-8);
    ctx.fillStyle='#ff8a5b';ctx.beginPath();ctx.arc(x,y+6,3,0,Math.PI*2);ctx.fill();}}
  return true;}
// ---- el mapa de un barrio ----
const CMSW=1.6; // ancho de la acera
// el suelo del barrio: el mapa lo pinta como una isla; el mundo, con tierra de sobra alrededor para que nada flote
function bmSuelo(night,world){const B=CDX().barrios[BM.b],[w,h]=cdTam(BM.b),tone=mixHex(B.c,'#fffdf8',.68),Q=(r,z,c)=>{const v=cmV(r);topQuad(v[0],v[1],v[2],v[3],z,c);};
  if(world)Q([-400,-400,w+400,h+400],-.04,shade(tone,.9));
  else{const v=cmV([-14,-14,w+14,h+14]);prism(v[0],v[1],v[2],v[3],-30,-4,'#7d6a55');prism(v[0],v[1],v[2],v[3],-4,0,'#cfc7b6');Q([-14,-14,w+14,h+14],.02,'#d8d2c4');}
  Q([0,0,w,h],.04,tone);
  const cal=B.calles,rc=(c,pad)=>{const hh=c.w/2+pad;return cdHor(c)?[Math.max(0,c.a[0]),c.a[1]-hh,Math.min(w,c.b[0]),c.b[1]+hh]:[c.a[0]-hh,Math.max(0,c.a[1]),c.b[0]+hh,Math.min(h,c.b[1])];};
  for(const c of cal)Q(rc(c,CMSW),.06,'#dcd6c8');
  for(const c of cal)Q(rc(c,0),.08,'#5d6168');
  // la línea discontinua del eje, sin cruzar las calles que la cortan
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.4;ctx.setLineDash([7,9]);
  for(const c of cal){const hor=cdHor(c);let cuts=[];for(const e of cal){if(cdHor(e)===hor)continue;const at=hor?e.a[0]:e.a[1];if(hor?(c.a[0]<=at&&at<=c.b[0]&&e.a[1]<=c.a[1]&&c.a[1]<=e.b[1]):(c.a[1]<=at&&at<=c.b[1]&&e.a[0]<=c.a[0]&&c.a[0]<=e.b[0]))cuts.push([at-e.w/2-.4,at+e.w/2+.4]);}
    cuts.sort((a,b)=>a[0]-b[0]);let t=hor?c.a[0]:c.a[1];const end=hor?c.b[0]:c.b[1];const segs=[];for(const q of cuts){if(q[0]>t)segs.push([t,Math.min(q[0],end)]);t=Math.max(t,q[1]);}if(t<end)segs.push([t,end]);
    for(const [s0,s1] of segs){if(s1-s0<1)continue;const a=hor?cmW2V(s0,c.a[1]):cmW2V(c.a[0],s0),b=hor?cmW2V(s1,c.a[1]):cmW2V(c.a[0],s1),p0=P(a[0],a[1],.1),p1=P(b[0],b[1],.1);
      const x0=cam.x+p0[0]*cam.z,x1=cam.x+p1[0]*cam.z,y0=cam.y+p0[1]*cam.z,y1=cam.y+p1[1]*cam.z;if(Math.max(x0,x1)<-20||Math.min(x0,x1)>W+20||Math.max(y0,y1)<-20||Math.min(y0,y1)>H+20)continue;
      ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.stroke();}}
  ctx.setLineDash([]);}
function bmArbol(x,y){const [px,py]=P(x,y),se=seasonOf();capsule(px,py,px,py-13,2.6,'#6b4a2e');
  if(se==='inv'){capsule(px,py-12,px-4,py-20,1.4,'#6b4a2e');capsule(px,py-12,px+5,py-19,1.4,'#6b4a2e');return;}
  const c={pri:'#5cae4c',ver:'#4a9a43',oto:'#d98b2e'}[se];circ(px,py-21,8,c);circ(px-4,py-18,6,c);circ(px+5,py-18,5.5,c);}
const bmLit=(night,k,id)=>night>.3&&hash(k+id.length*31+Math.floor(S.day/3))>.4;
function bmBloque(b,night){const [u0,v0,u1,v1]=cmV(b.r),n=b.pl,fh=15,H=n*fh+6,col=b.c||'#c9a07a',cu=(u0+u1)/2;
  topQuad(u0-.5,v1,u1+.5,v1+1.2,.1,'#cfc9bb');
  prismG(u0,v0,u1,v1,0,H,col);
  poly([P(u0,v1,0),P(u1,v1,0),P(u1,v1,6),P(u0,v1,6)],shade(col,.62));poly([P(u1,v0,0),P(u1,v1,0),P(u1,v1,6),P(u1,v0,6)],shade(col,.5));
  for(let f=0;f<n;f++){const z=9+f*fh;let k=0;
    for(let u=u0+.7;u<u1-1.0;u+=1.55){k++;if(f===0&&Math.abs(u+.4-cu)<1.1)continue;const on=bmLit(night,f*13+k,b.id);
      poly([P(u,v1,z),P(u+.85,v1,z),P(u+.85,v1,z+8),P(u,v1,z+8)],on?'#ffe08a':'rgba(58,72,98,.78)');
      poly([P(u-.12,v1,z-.5),P(u+.97,v1,z-.5),P(u+.97,v1+.28,z-.5),P(u-.12,v1+.28,z-.5)],'#efe9de');poly([P(u-.12,v1+.28,z-.5),P(u+.97,v1+.28,z-.5),P(u+.97,v1+.28,z+3),P(u-.12,v1+.28,z+3)],'#b9b2a4');}
    k=0;for(let v=v0+.7;v<v1-.8;v+=1.55){k++;const on=bmLit(night,f*17+k+7,b.id);poly([P(u1,v,z),P(u1,v+.85,z),P(u1,v+.85,z+8),P(u1,v,z+8)],on?'#ffe08a':'rgba(48,60,84,.78)');}
    if(f>0)poly([P(u0,v1,f*fh+5),P(u1,v1,f*fh+5),P(u1,v1,f*fh+6.4),P(u0,v1,f*fh+6.4)],shade(col,.82));}
  // portal con marquesina
  poly([P(cu-.32,v1,0),P(cu+.32,v1,0),P(cu+.32,v1,13),P(cu-.32,v1,13)],'#3f3430');poly([P(cu-.24,v1,0),P(cu+.24,v1,0),P(cu+.24,v1,12),P(cu-.24,v1,12)],night>.3?'#ffd27a':'#8fb4c9');
  prism(cu-.5,v1,cu+.5,v1+.45,13,14.5,'#7a6a5c');
  // azotea: pretil, depósito y antena
  topQuad(u0,v0,u1,v1,H,shade(col,.9));prism(u0,v1-.18,u1,v1,H,H+3.5,shade(col,1.12));prism(u1-.18,v0,u1,v1-.18,H,H+3.5,shade(col,1.0));
  cyl(u0+1.2,v0+1.2,.55,H,H+9,'#9aa3ad','#b5bcc4');const [ax,ay]=P(u1-1.2,v0+1.4,H),[bx,by]=P(u1-1.2,v0+1.4,H+16);capsule(ax,ay,bx,by,1.1,'#555');capsule(bx-4,by+3,bx+4,by+3,1.1,'#555');}
function bmCasa(b,night,big){const [u0,v0,u1,v1]=cmV(b.r),n=b.pl||1,cu=(u0+u1)/2,cv=(v0+v1)/2,wall=b.c||'#e7d3b4',roof=b.roof||'#a5533e',bh=big?34:n*21+5,rise=big?22:Math.min(20,(v1-v0)*5.2),w=u1-u0;
  topQuad(u0-.5,v1,u1+.5,v1+1.3,.1,b.det==='huerto'?'#9ec27a':'#93c46f');
  if(b.det==='huerto'){for(let k=0;k<4;k++)topQuad(u0,v0-1.6+k*.0,u1,v0-1.15+k*.0,.12,'#7aa85a');for(let k=0;k<3;k++){const y=v0-1.55+k*.45;topQuad(u0+.2,y,u1-.2,y+.22,.13,'#5f9143');}}
  prismG(u0,v0,u1,v1,0,bh,wall);
  poly([P(u0-.25,v1+.3,bh-1),P(u1+.25,v1+.3,bh-1),P(u1+.25,cv,bh+rise),P(u0-.25,cv,bh+rise)],roof);
  poly([P(u1+.25,v1+.3,bh-1),P(u1+.25,v0-.2,bh-1),P(u1+.25,cv,bh+rise)],shade(roof,.72));
  poly([P(u1,v0,bh),P(u1,v1,bh),P(u1,cv,bh+rise-1)],shade(wall,.75));
  prismG(u0+w*.14,cv-.5,u0+w*.14+.34,cv-.16,bh+rise*.62,bh+rise+9,'#8a6a5a');
  const win=(u,z)=>{const on=night>.3&&hash(Math.round(u*9+z)+b.id.length)>.3;poly([P(u,v1,z),P(u+.7,v1,z),P(u+.7,v1,z+7),P(u,v1,z+7)],on?'#ffe08a':'#7fa6c2');poly([P(u+.33,v1,z),P(u+.37,v1,z),P(u+.37,v1,z+7),P(u+.33,v1,z+7)],'rgba(255,255,255,.7)');};
  const dx=big?cu-.35:u0+w*.5-.35;
  poly([P(dx,v1,0),P(dx+.7,v1,0),P(dx+.7,v1,15),P(dx,v1,15)],'#6b4a35');
  for(let f=0;f<n;f++){const z=f===0?9:9+f*21;let u=u0+.4;while(u<u1-.6){if(f===0&&u+.7>dx-.15&&u<dx+.85){u+=1.2;continue;}win(u,z);u+=big?1.9:1.2;}}
  if(b.det==='local'){poly([P(u0+.2,v1+.5,12),P(u0+w*.5-.5,v1+.5,12),P(u0+w*.5-.5,v1,17),P(u0+.2,v1,17)],'#d1242f');for(let k=0;k<3;k++)poly([P(u0+.2+k*.5,v1+.5,12),P(u0+.45+k*.5,v1+.5,12),P(u0+.45+k*.5,v1,17),P(u0+.2+k*.5,v1,17)],'#fffdf8');}
  if(b.det==='parra'){for(let k=0;k<4;k++){const [x,y]=P(dx+.35+(k%2?.5:-.2),v1+.05,9+k*3);circ(x,y,3,'#5f9143');}}
  if(b.det==='patio'){prism(u1+.15,v0+.2,u1+1.7,v1,0,5,'#d9cfbb');topQuad(u1+.15,v0+.2,u1+1.7,v1,5.1,'#c9b48a');}
  if(b.det==='adosada'){const [x0,y0]=P(cu,v1,0),[x1,y1]=P(cu,v1,bh);capsule(x0,y0,x1,y1,1.4,shade(wall,.7));}
  if(!big){for(let k=0;k<=3;k++){const [x,y]=P(u0-.2+k*(w+.4)/3,v1+1.1,0);capsule(x,y,x,y-5,1.2,'#f4f1ea');}}}
// la casa del jugador: una casa, o un bloque si vive en un piso; con el vallado y el pulso naranja que la señalan
function bmCasaJug(b,night,tt){const [u0,v0,u1,v1]=cmV(b.r),t=(S.home&&S.home.type)||'casita';
  if(bmFlat(t))bmBloque({id:'casa',r:b.r,pl:3,c:'#f1dcc0'},night);else bmCasa({id:'casa',r:b.r,pl:1,c:'#f1dcc0',roof:'#b5543c'},night,true);
  ctx.save();ctx.strokeStyle='rgba(255,138,91,.95)';ctx.lineWidth=3;ctx.setLineDash([9,6]);ctx.lineDashOffset=-tt*14;ctx.beginPath();
  const q=[P(u0-1.2,v0-1.2,.2),P(u1+1.2,v0-1.2,.2),P(u1+1.2,v1+2.2,.2),P(u0-1.2,v1+2.2,.2)];ctx.moveTo(...q[0]);for(const p of q.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.restore();}
// un lugar sin escena interior: un cubo de color con puerta y su icono; el descampado, un solar con vallas
function bmCubo(b,night){const [u0,v0,u1,v1]=cmV(b.r),p=b.p,col=p.c||'#cfc7b6',cu=(u0+u1)/2,h=b.h;
  if(p.solar){topQuad(u0,v0,u1,v1,.12,col);topQuad(u0+.5,v0+.5,u1-.5,v1-.5,.14,shade(col,.94));
    for(let u=u0;u<=u1+.1;u+=3.4){for(const v of [v0,v1]){const [x,y]=P(u,v,0),[x2,y2]=P(u,v,5);capsule(x,y,x2,y2,1.3,'#8a7a62');}}
    for(let v=v0;v<=v1+.1;v+=3.4){for(const u of [u0,u1]){const [x,y]=P(u,v,0),[x2,y2]=P(u,v,5);capsule(x,y,x2,y2,1.3,'#8a7a62');}}
    for(const v of [(v0+v1)/2-.8,(v0+v1)/2+.8]){const [x,y]=P(u0+2.2,v,0),[x2,y2]=P(u0+2.2,v,7);capsule(x,y,x2,y2,1.1,'#f4f1ea');}
    emoji(p.e,...P(cu,(v0+v1)/2,6),14);return;}
  topQuad(u0-.4,v1,u1+.4,v1+1,.1,'#cfc9bb');
  prismG(u0,v0,u1,v1,0,h,col);topQuad(u0,v0,u1,v1,h,shade(col,1.07));
  prism(u0-.2,v1-.1,u1+.2,v1+.1,h-1.5,h+1,shade(col,.8));
  poly([P(cu-.5,v1,0),P(cu+.5,v1,0),P(cu+.5,v1,Math.min(11,h*.6)),P(cu-.5,v1,Math.min(11,h*.6))],'#5b463a');
  const z=Math.max(8,h*.55);for(let u=u0+.7;u<u1-1;u+=1.7){if(Math.abs(u+.4-cu)<1)continue;const on=bmLit(night,Math.round(u*5),b.id);poly([P(u,v1,z),P(u+.9,v1,z),P(u+.9,v1,z+Math.min(7,h*.3)),P(u,v1,z+Math.min(7,h*.3))],on?'#ffe08a':'rgba(58,72,98,.7)');}
  emoji(p.e,...P(cu,v1,h+7),13);}
// la señal de paso a otro barrio y la parada: un poste con su icono
function bmEspeciales(){const out=[],C=CDX();
  for(const s of cdEspeciales(BM.b)){if(s.t==='paso'){out.push({id:'p:'+s.a,kind:'paso',pt:s.p,name:'➜ '+C.barrios[s.a].n,e:'➜'});}
    else{const l=C.enlaces.lineas.find(x=>x.id===s.l);out.push({id:'s:'+s.l+':'+s.i,kind:'parada',pt:s.p,name:cdModoIc[l.modo]+' '+s.n,e:cdModoIc[l.modo],c:l.c});}}
  return out;}
function bmPoste(q,night){const [u,v]=cmW2V(q.pt[0],typeof cmLaneY==='function'?cmLaneY(BM.b,q.pt):q.pt[1]),[x,y]=P(u,v),[x2,y2]=P(u,v,22);capsule(x,y,x2,y2,1.8,q.kind==='paso'?'#7a4fa0':q.c||'#555');
  circ(x2,y2-3,5,q.kind==='paso'?'#fffdf8':q.c);emoji(q.e,x2,y2-3,q.kind==='paso'?8:9);}
// lo que se pinta de un barrio por profundidad: edificios cerrados (menos los de `opt.skip`), postes, árboles. Solo lo que cae en pantalla.
function bmItems(tt,night,opt){const items=[],B=CDX().barrios[BM.b],skip=opt&&opt.skip;
  for(const b of bmBoxes()){if(skip&&skip.has(b.id))continue;const bb=bmBB(bmHull(b));if(!bmSee(bb))continue;const rv=cmV(b.r),d=rv[2]+rv[3]-.5;
    if(b.kind==='lugar')items.push({d,f:()=>drawBuilding(b.id,tt,night,rv)});
    else if(b.kind==='extra')items.push({d,f:()=>bmCubo(b,night)});
    else if(b.kind==='casa')items.push({d,f:()=>bmCasaJug(b,night,tt)});
    else items.push({d,f:()=>b.bl?bmBloque(b,night):bmCasa(b,night,false)});}
  for(const q of bmEspeciales()){const [u,v]=cmW2V(q.pt[0],q.pt[1]),[px,py]=P(u,v),sx=cam.x+px*cam.z,sy=cam.y+py*cam.z;if(sx<-40||sx>W+40||sy<-80||sy>H+40)continue;items.push({d:u+v,f:()=>bmPoste(q,night)});}
  for(const [x,y] of B.arboles||[]){const [u,v]=cmW2V(x,y),[px,py]=P(u,v),sx=cam.x+px*cam.z,sy=cam.y+py*cam.z;if(sx<-40||sx>W+40||sy<-60||sy>H+60)continue;items.push({d:u+v,f:()=>bmArbol(u,v)});}
  items.sort((a,b)=>a.d-b.d);return items;}
function bmRender(){
  LAWN=lawnBase();const night=nightFactor(),tt=performance.now()/1000;
  if(BM.S!==S){bmClose();return false;}
  if(BM.v==='ciudad'||!BM.b){RT.names=[];RT.heads=[];RT.obst=[];RT.ana=null;RT.on=false;return cdRender();}
  bmClamp();CMF=[0,0];
  ctx.setTransform(DPR,0,0,DPR,0,0);drawSky(night,tt);
  ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z,DPR*cam.x,DPR*cam.y);
  RT.names=[];RT.heads=[];RT.obst=[];RT.ana=null;RT.on=true;
  try{bmSuelo(night,true);
    // «mirar dentro»: el interior del sitio, abierto en su sitio del barrio (sin el personaje, salvo que esté ahí de verdad)
    const ob=BM.obs?cmAbierto(BM.obs,tt,night,{real:bmReal(BM.obs)}):null,items=bmItems(tt,night,{skip:ob?new Set([BM.obs]):null});
    if(ob)items.push(ob.item);items.sort((a,b)=>a.d-b.d);for(const it of items)it.f();
  }finally{RT.on=false;}
  cmLuz(night);
  bmLabels();return true;}
// la luz de la hora, como en la casa: tinte de mañana y tarde, noche y el halo cálido de las ventanas de cada edificio que se ve
function cmLuz(night){
  const h=S.t/60,warm=Math.max(0,1-Math.abs(h-7.2)/1.8)*.55+Math.max(0,1-Math.abs(h-18.6)/2)*.8;
  if(warm>.02&&night<1){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle=mixHex('#ffffff','#ffc890',Math.min(1,warm)*.5);ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();}
  if(night>0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(20,25,70,${night*.36})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();cmHalos(night);}}
// el halo cálido de las ventanas de cada edificio que se ve (también por la calle, mods/caminar.js)
function cmHalos(night){const ab=BM.obs||(typeof CW!=='undefined'?CW.openId:null);ctx.save();ctx.globalCompositeOperation='lighter';ctx.setTransform(DPR,0,0,DPR,0,0);
  for(const t of bmTargets()){if(!bmSee(t.bb)||t.id===ab||t.kind==='lugar'&&PLACES[t.id].park||t.kind==='extra'&&t.box.p.solar||t.kind==='casa'&&typeof cmHomeVis==='function'&&!BM.on&&cmHomeVis())continue;
    const R=Math.max(34,(t.bb[2]-t.bb[0])*.6),x=t.cx,y=t.bb[3]-(t.bb[3]-t.bb[1])*.35;
    const g=ctx.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,`rgba(255,196,110,${.26*night})`);g.addColorStop(1,'rgba(255,196,110,0)');ctx.fillStyle=g;ctx.fillRect(x-R,y-R,2*R,2*R);}
  if(typeof CW!=='undefined'&&!BM.on&&CW.lamp)for(const [x,y] of CW.lamp){const R=46,g=ctx.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,`rgba(255,214,140,${.42*night})`);g.addColorStop(1,'rgba(255,214,140,0)');ctx.fillStyle=g;ctx.fillRect(x-R,y-R,2*R,2*R);}
  ctx.restore();}
// rótulos del mapa: los mismos de las escenas (mods/rotulos.js), letra fija y sin pisarse; y los nombres de las calles, en los huecos que dejan
function bmLabels(){const T=bmTargets().filter(t=>bmSee(t.bb));
  for(const t of T){const b=t.box;let name,pri=3,puesto=null;
    if(b.kind==='casa'){name='🏠 Tu casa';pri=0;}
    else if(b.kind==='censo'){name=(b.bl?'🏢 ':'🏠 ')+DATA.barrio.edificios[b.id].rotulo;}
    else{name=cdLug(b.id).e+' '+bmName(b.id);pri=2;if(bmEstado(b.id))puesto='cerrado';}
    RT.names.push({name,x:t.cx,y:t.bb[1]+(b.kind==='lugar'&&PLACES[b.id].park?10:0),id:-1,prio:pri,rot:puesto?{puesto}:null,bmid:b.id});}
  for(const q of bmEspeciales()){const [qu,qv]=cmW2V(q.pt[0],q.pt[1]),[x,y]=bmProj(qu,qv,26);if(x<0||x>W||y<0||y>H)continue;RT.names.push({name:q.name,x,y,id:-1,prio:q.kind==='paso'?2:3,rot:null,bmid:q.id});}
  RT.pend=true;RT.post=RT.post||[];const bb=BM.b,cf=CMF.slice();RT.post.push(()=>{const f0=CMF;CMF=cf;try{bmCalles(bb);}finally{CMF=f0;}});}
function bmCalles(bar){const B=CDX().barrios[bar],A=RT.lastArea,pl=RT.last||[],ui=RT.lastUI||[],put=[];if(!A||rot!==0)return;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.font='900 9px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const c of B.calles){const hor=cdHor(c),L=hor?c.b[0]-c.a[0]:c.b[1]-c.a[1],w=ctx.measureText(c.n).width+6,ang=hor?Math.atan2(TH,TW):-Math.atan2(TH,TW);
    for(const f of [.5,.3,.7,.15,.85,.4,.6]){const p=hor?[c.a[0]+L*f,c.a[1]]:[c.a[0],c.a[1]+L*f],[qu,qv]=cmW2V(p[0],p[1]),[x,y]=bmProj(qu,qv,.1);
      const hw=(Math.abs(Math.cos(ang))*w+Math.abs(Math.sin(ang))*10)/2,hh=(Math.abs(Math.sin(ang))*w+Math.abs(Math.cos(ang))*10)/2,R=[x-hw,y-hh,x+hw,y+hh];
      if(R[0]<4||R[2]>A.Wd-4||R[1]<A.top||R[3]>A.bot)continue;
      if(pl.some(q=>rtHit(R,[q.x0,q.y0,q.x1,q.y1],2))||ui.some(u=>rtHit(R,u,1))||put.some(q=>rtHit(R,q,3)))continue;
      put.push(R);ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.lineWidth=3;ctx.strokeStyle='rgba(255,253,248,.9)';ctx.strokeText(c.n,0,0);ctx.fillStyle='#4a4254';ctx.fillText(c.n,0,0);ctx.restore();break;}}
  ctx.restore();}
{const _lay=rtLayout;rtLayout=function(names,heads,obst,A,fs){const out=_lay.apply(this,arguments);
  if(BM.on&&!BM.obs){const by=new Map();for(const q of names)if(q.bmid)by.set(q.name,q.bmid);for(const p of out){const id=by.get(p.name);if(id)p.bmid=id;}}return out;};}
{const _rn=render;render=function(){if(BM.on){if(mode!=='live'){bmClose();}else{bmRender();return;}}return _rn.apply(this,arguments);};}
// el botón del mapa y el estado propio existen desde el principio
bmUI();
