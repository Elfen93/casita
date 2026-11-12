// =================== CAMINAR: el barrio es continuo, de la puerta de casa a la puerta del sitio ===================
// Nada flota: la casa, los lugares y la calle comparten el mismo plano (data/ciudad.json). Cuando Ana sale, cruza el portal, baja a la acera,
// recorre las calles (cdCamino) y entra en el sitio sin cortes: la cámara la sigue. Lo que dura el viaje es lo que dice cdTrayecto,
// también acelerado. Entre barrios espera en la parada, viaja (rótulo «Metro L1 · 6 min», sin interior) y sigue andando en el otro.
// Todo el estado nuevo vive en S.sim.tr (por salida) y S.sim.irA/irPt (lo que el jugador manda); sin él, el viaje se calcula como siempre.
// Funciones puras de ruta: cmLane, cmRuta, cmEje. Posición: cmFase y cmPos. Dibujo: drawEntorno (fase 0: el barrio; fase 1: ella).
const CW={abierto:false,sc:null,gk:null,gl:[],bx:0,bar:null,pos:null,posT:-1,fx:0,wait:null,cam:null,hit:[]};
const cmT=(k,v)=>huecos(String((DATA.caminar&&DATA.caminar[k])!=null?DATA.caminar[k]:''),v||{});
const cmEur=e=>String(Math.round(e*100)/100).replace('.',',')+' €';
const cmLot=()=>cdRect('casa')||[0,0,N,N];
const cmHome=()=>cdHome();
// ---------------- geometría de la ruta ----------------
const cmCalle=(b,p,hor)=>{for(const c of CDX().barrios[b].calles)if(cdHor(c)===hor&&cdOn(c,p))return c;return null;};
const cmOff=c=>c.w/2+CMSW/2;                     // del eje al centro de la acera
const cmLaneY=(b,p)=>{const c=cmCalle(b,p,true);return c?p[1]-cmOff(c):p[1];};   // todos los sitios dan al sur: la acera de delante es la del norte de su calle
// de los puntos del eje a los de la acera: horizontales por el norte, verticales por la derecha según se avanza
function cmLane(b,pts){const n=pts.length;if(!n)return [];const sg=[];
  for(let i=0;i<n-1;i++){const a=pts[i],q=pts[i+1],hor=a[1]===q[1],mid=[(a[0]+q[0])/2,(a[1]+q[1])/2],c=cmCalle(b,mid,hor)||cmCalle(b,a,hor),o=c?cmOff(c):2;
    sg.push(hor?{hor:true,l:a[1]-o}:{hor:false,l:a[0]+(q[1]>a[1]?-o:o)});}
  return pts.map((p,i)=>{let x=p[0],y=null;for(const s of [sg[i-1],sg[i]]){if(!s)continue;if(s.hor)y=s.l;else x=s.l;}if(y==null)y=cmLaneY(b,p);return [x,y];});}
const cmLen=p=>{let s=0;for(let i=1;i<p.length;i++)s+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return s;};
function cmAlong(p,f){if(p.length<2)return {x:p[0][0],y:p[0][1],dx:0,dy:1};let d=Math.max(0,Math.min(1,f))*cmLen(p);
  for(let i=1;i<p.length;i++){const a=p[i-1],q=p[i],l=Math.hypot(q[0]-a[0],q[1]-a[1]);if(d<=l||i===p.length-1){const t=l?Math.min(1,d/l):1;return {x:a[0]+(q[0]-a[0])*t,y:a[1]+(q[1]-a[1])*t,dx:l?(q[0]-a[0])/l:0,dy:l?(q[1]-a[1])/l:1};}d-=l;}}
// el punto de la acera delante de una puerta, y la fachada
function cmPuertaPts(id){const r=cdRect(id),q=cdPuerta(id);if(!r||!q)return null;return {side:[q.p[0],r[3]+CMSW/2],fac:[q.p[0],r[3]],xd:q.p[0],y1:r[3]};}
// camino por el eje entre dos extremos que pueden ser puertas (ids) o puntos [x,y] de un eje
function cmEje(b,A,B){const g=cdGrafo(b),cals=CDX().barrios[b].calles;
  const acc=p=>{const out=[];for(const c of cals){if(!cdOn(c,p))continue;const ax=cdHor(c)?0:1,ns=[...g.nodes.values()].filter(q=>cdOn(c,q)).sort((u,v)=>u[ax]-v[ax]);let lo=null,hi=null;
      for(const q of ns){if(q[ax]<=p[ax]+1e-9)lo=q;if(q[ax]>=p[ax]-1e-9&&!hi)hi=q;}if(lo)out.push(lo);if(hi&&hi!==lo)out.push(hi);}return out;};
  const ea=Array.isArray(A)?acc(A):[cdPt(b,A)],eb=Array.isArray(B)?acc(B):[cdPt(b,B)];
  let best=null,bl=1e18;
  if(Array.isArray(A)&&Array.isArray(B)){for(const c of cals){if(cdOn(c,A)&&cdOn(c,B)){best=[A,B];bl=cdLong(best);}}}
  for(const na of ea)for(const nb of eb){const m=cdCamino(b,na,nb);if(!m)continue;const pts=(Array.isArray(A)?[A]:[]).concat(m).concat(Array.isArray(B)?[B]:[]);
    const out=[];for(const p of pts){const q=out[out.length-1];if(q&&Math.abs(q[0]-p[0])<1e-9&&Math.abs(q[1]-p[1])<1e-9)continue;out.push(p);}
    const l=cdLong(out);if(l<bl){bl=l;best=out;}}
  return best;}
// una ruta es una lista de tramos {k:'pie'|'espera'|'viaje', b, pts|p, min, txt, pay} de puerta a puerta (o a un punto de la calle: [b,x,y])
const CMR={};
function cmRuta(a,b){const key=(Array.isArray(a)?a.join(','):a)+'>'+(Array.isArray(b)?b.join(','):b)+'|'+cmHome();if(CMR[key]!==undefined)return CMR[key];
  let R=null;try{R=cmRuta0(a,b);}catch(e){console.error('ruta',a,b,e);}
  return CMR[key]=R;}
function cmRuta0(a,b){const E=CDX().enlaces;
  const pa=Array.isArray(a)?null:cmPuertaPts(a),pb=Array.isArray(b)?null:cmPuertaPts(b);
  if(Array.isArray(a)&&!Array.isArray(b)&&pb&&cdBarrioDe(b)!==a[0]){ // desde un punto de la calle a otro barrio: hasta la puerta más cómoda de aquí y de allí en transporte
    let best=null;for(const d of cmDoors(a[0])){if(!cdPuerta(d)||cdBarrioDe(d)!==a[0])continue;const R1=cmRuta(a,d),R2=cmRuta(d,b);if(!R1||!R2)continue;const m=R1.min+R2.min;if(!best||m<best.m)best={m,R1,R2};}
    if(!best)return null;return {min:best.m,h:best.R2.h,precio:best.R2.precio,legs:best.R1.legs.concat(best.R2.legs)};}
  if(Array.isArray(a)||Array.isArray(b)){ // un punto de la calle: solo dentro del barrio
    const ba=Array.isArray(a)?a[0]:cdBarrioDe(a),bb=Array.isArray(b)?b[0]:cdBarrioDe(b);if(ba!==bb)return null;
    const A=Array.isArray(a)?[a[1],a[2]]:a,B=Array.isArray(b)?[b[1],b[2]]:b,ax=cmEje(ba,A,B);if(!ax)return null;
    let lane=cmLane(ba,ax);if(pa)lane=[pa.side].concat(lane);if(pb)lane=lane.concat([pb.side]);
    const mn=cdMinPie(ax);return {min:mn,h:0,legs:[{k:'pie',b:ba,pts:lane,min:mn}]};}
  const t=cdTrayecto(a,b);if(!t||!pa||!pb)return null;const legs=[];
  const stop=(nom,bb)=>{const L=E.lineas.find(l=>l.id===nom.linea);return L?L.paradas.find(s=>s.n===nom.de):null;};
  t.tramos.forEach(q=>{
    if(q.m==='pie')legs.push({k:'pie',b:q.b,pts:cmLane(q.b,q.pts),min:q.min});
    else if(q.m==='paso')legs.push({k:'viaje',b:q.de,to:q.a,min:q.min,at:[q.pb[0],cmLaneY(q.a,q.pb)],paso:true,txt:cmT('paso',{barrio:CDX().barrios[q.a].n,min:Math.round(q.min)})});
    else{const L=E.lineas.find(l=>l.id===q.linea),s0=L.paradas.find(s=>s.n===q.de),s1=L.paradas.find(s=>s.n===q.a),prev=legs[legs.length-1];
      const p0=prev&&prev.k==='pie'?prev.pts[prev.pts.length-1]:[s0.p[0],cmLaneY(s0.b,s0.p)];
      legs.push({k:'espera',b:s0.b,p:p0,min:q.espera,txt:cmT('espera',{linea:q.n,parada:q.de}),linea:q.n});
      legs.push({k:'viaje',b:s0.b,to:s1.b,min:q.viaje,at:[s1.p[0],cmLaneY(s1.b,s1.p)],modo:q.m,pay:q.h,linea:q.n,txt:cmT('viaje',{linea:q.n,min:Math.round(q.viaje)})});}});
  if(!legs.length||legs[0].k!=='pie')legs.unshift({k:'pie',b:pa.b||cdBarrioDe(a),pts:[pa.side],min:0});
  if(legs[legs.length-1].k!=='pie'){const bb=cdBarrioDe(b),pt=legs[legs.length-1].at||pb.side;legs.push({k:'pie',b:bb,pts:[pt],min:0});}
  const f=legs[0],l=legs[legs.length-1];f.pts=[pa.side].concat(f.pts);l.pts=l.pts.concat([pb.side]);
  return {min:t.min,h:t.h,precio:t.precio,legs};}
// minutos de una ida (redondeados, mínimo 1)
const cmMinDe=(a,b)=>{const R=cmRuta(a,b);return R?Math.max(1,Math.round(R.min)):30;};
// ---------------- dónde está ahora ----------------
const cmDest=k=>{if(k==='hogar'){try{const p=hgVisitado();const hd=p&&hogarDe(p);return (hd&&hd.hogar&&hd.hogar.edificio)||'casaV';}catch(e){return 'casaV';}}return k;};
const cmMid=cmDest;
function cmTr(s){if(s.tr)return s.tr;const tot=s.awayTotal||s.work,t=(s.dest==='_ride'||s.dest==='comisaria'||s.dest==='_casa')?0:Math.min(20,tot/3);return {a:t,b:t,from:'casa',viejo:true};}
function cmFase(){const s=S.sim;if(!(s.work>0)||!s.dest)return null;const tot=s.awayTotal||s.work,el=Math.max(0,tot-s.work),tr=cmTr(s);
  if(s.dest==='_casa'||(tr.a>0&&el<tr.a))return s.dest==='_casa'?{k:'vuelta',f:tr.b?Math.max(0,Math.min(1,1-s.work/tr.b)):1,tr,el,tot}:{k:'ida',f:el/tr.a,tr,el,tot};
  if(tr.b>0&&s.work<tr.b)return {k:'vuelta',f:1-s.work/tr.b,tr,el,tot};
  return {k:'dentro',t0:el-tr.a,t1:s.work-tr.b,tr,el,tot};}
// el destino «de verdad» de la salida: puerta (id), punto de la calle o null (reparto)
function cmFin(s){if(s.dest==='_ride')return null;if(s.dest==='_punto'&&s.irPt)return s.irPt;if(s.dest==='_casa')return 'casa';return cmDest(s.dest);}
const cmCuerpo=(ox,oy,dx,dy)=>({front:(dx+dy)>=-.01,right:(dx-dy)>=-.01});
const CME=1.6;   // minutos que tarda en cruzar la puerta hacia su sitio (y en volver a ella)
function cmPos(){const t=performance.now();if(CW.posT===t)return CW.pos;CW.posT=t;return CW.pos=cmPos0();}
function cmPos0(){const s=S.sim,f=cmFase();if(!f)return null;const home=cmHome();
  if(s.dest==='_ride'){const bar=cdBarrioDe(destOf('work'))||home,ds=cmDoors(bar),ph=(S.t/9)%ds.length,i=Math.floor(ph),a=ds[i%ds.length],b=ds[(i+1)%ds.length],R=a&&b&&cmRuta(a,b);
    if(!R)return {k:f.k,b:bar,x:0,y:0,dx:0,dy:1,walk:false,vis:false};const p=cmAlong(R.legs[0].pts,ph-i);return {k:'reparto',b:bar,x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:true,vis:true,moto:true};}
  const fin=cmFin(s),bFin=Array.isArray(fin)?fin[0]:cdBarrioDe(fin);
  if(f.k==='dentro'){const id=cmDest(s.dest),esc=s.dest==='_punto'?null:cmEscena(s.dest);let x=0,y=0;
    if(Array.isArray(fin)){const q=cmLane(fin[0],[[fin[1],fin[2]]])[0];x=q[0];y=q[1];}else{const q=cmPuertaPts(id);if(q){x=q.side[0];y=q.side[1];}}
    return {k:'dentro',b:bFin||home,id,t0:f.t0,t1:f.t1,esc,vis:true,x,y,dx:0,dy:-1,walk:false};}
  const ida=f.k==='ida',{from,to,turn}=cmRutaF(f,fin),R=cmRuta(from,to);
  if(!R)return {k:f.k,b:ida?home:bFin||home,id:null,x:0,y:0,dx:0,dy:1,walk:false,vis:false,fail:true};
  const {i,lf}=cmEnRuta(R,turn!=null?turn*(1-f.f):f.f);
  const l=R.legs[i];let r={k:f.k,i,leg:l,lf,R,b:l.b,walk:false,vis:true,txt:null};
  if(l.k==='pie'){let pts=l.pts;
    if(i===0&&from==='casa')pts=cmLead(pts,true);
    if(i===R.legs.length-1&&to==='casa')pts=cmLead(pts,false);
    const p=cmAlong(pts,lf);Object.assign(r,{x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:l.min>0||pts.length>1});}
  else if(l.k==='espera'){Object.assign(r,{x:l.p[0],y:l.p[1],dx:0,dy:-1,walk:false,txt:l.txt});}
  else{Object.assign(r,{x:l.at[0],y:l.at[1],dx:0,dy:1,walk:false,vis:false,txt:l.txt,viaje:true});}
  return r;}
// en qué tramo de la ruta está a la fracción f del tiempo (los tramos pesan lo que dura cada uno)
function cmEnRuta(R,f){const tot=R.legs.reduce((a,l)=>a+l.min,0)||1,want=Math.max(0,Math.min(1,f))*tot;let acc=0,i=0,lf=1;
  for(;i<R.legs.length;i++){const l=R.legs[i];if(want<=acc+l.min||i===R.legs.length-1){lf=l.min>0?Math.max(0,Math.min(1,(want-acc)/l.min)):1;break;}acc+=l.min;}
  return {i,lf};}
// de dónde a dónde va en esta fase; `turn`: se dio la vuelta a mitad de camino (vuelve por donde iba, desde esa fracción)
function cmRutaF(f,fin){const s=S.sim,tr=f.tr;if(f.k==='ida')return {from:tr.from||'casa',to:fin};
  if(tr.turn!=null)return {from:tr.from||'casa',to:tr.fin||fin,turn:tr.turn};
  return {from:s.dest==='_casa'?tr.from:fin,to:'casa'};}
// salir de casa: de la celda del borde por donde sale hasta la acera de delante de la puerta de la parcela (y al revés al volver)
function cmLead(pts,sale){const s=S.sim,L=cmLot(),ex=s.exit||[N>>1,N-1],E=[L[0]+ex[0]+.5,L[1]+ex[1]+.5],q=cdPuerta('casa'),y1=L[3],fy=y1-.7,xd=q?q.p[0]:(L[0]+L[2])/2;
  const lead=[E,[E[0],Math.min(y1-.4,Math.max(E[1],fy))],[xd,Math.min(y1-.4,Math.max(E[1],fy))],[xd,y1]];
  return sale?lead.concat(pts):pts.concat(lead.slice().reverse());}
const cmDoors=bar=>Object.keys(CDX().barrios[bar].puertas).filter(k=>k!=='casaV'&&k!=='casa2');
const cmEscena=k=>(k&&SCENES[k]&&k!=='_ride'&&S.sim.outingActive!=='piquete'&&cmMid(k)&&cdRect(cmMid(k)))?k:null;
const cmBar=()=>{if(typeof BM!=='undefined'&&BM.on)return BM.b;if(!(viewPlace&&mode==='live'))return cmHome();const p=cmPos();return p&&p.b||cmHome();};
// el personaje está ahora de verdad dentro de ese sitio
const cmDentro=k=>{const s=S.sim;if(!(s.work>0)||!s.dest)return false;const f=cmFase();return !!f&&f.k==='dentro'&&!!cmEscena(s.dest)&&(s.dest===k||cmMid(s.dest)===k);};
// ---------------- el interior abierto de un sitio, en su sitio del barrio ----------------
// la planta ocupa su rb: la puerta, centrada, da a la acera; el suelo no se hunde (sin canto) y solo hay pared al fondo y a la izquierda
{const _sf=sFloor;sFloor=function(W,D,col,tile){if(!CW.abierto)return _sf.apply(this,arguments);
  topQuad(0,0,W,D,.1,col);if(tile){ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){const a=P(k,0),b=P(k,D);ctx.moveTo(...a);ctx.lineTo(...b);}for(let k=1;k<D;k++){const a=P(0,k),b=P(W,k);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();}};}
const cmPlano=(sc)=>{const r=CW.sc;return r;};
// puntos por los que entra: acera → portal → su sitio (y al revés)
function cmEntra(sc,a,k){const P0=[sc.W/2,sc.D+CMSW/2],P1=[sc.W/2,sc.D-.3],pts=[P0,P1,[a.x,a.y]],p=cmAlong(pts,k);return p;}
function cmAbierto(id,tt,night,o){o=o||{};const mid=cmMid(id),r=cdRect(mid);if(!r||!SCENES[id])return null;
  const sc=buildScene(id,tt,night);if(!sc||!sc.ana)return null;
  const xd=(r[0]+r[2])/2,ox=xd-sc.W/2,oy=r[3]-sc.D;CW.sc={id,mid,ox,oy,W:sc.W,D:sc.D,out:!!sc.out};
  if(o.real&&o.pos){const a=sc.ana,pos=o.pos;let k=null,rev=false;
    if(pos.t0<CME)k=pos.t0/CME;else if(pos.t1<CME){k=1-pos.t1/CME;rev=true;}
    if(k!=null){const p=cmEntra(sc,a,Math.max(0,Math.min(1,k))),dx=(rev?-1:1)*(p.dx),dy=(rev?-1:1)*(p.dy),c=cmCuerpo(0,0,dx,dy);
      sc.ana={...a,x:p.x,y:p.y,z:0,pose:'walk',act:null,walkPh:tt*8,front:c.front,right:c.right,prop:null};}}
  const [u,v]=cmW2V(ox,oy);
  return {sc,item:{d:(u+sc.W)+(v+sc.D)-.2,f:()=>{ctx.save();const [tx,ty]=P(u,v);ctx.translate(tx,ty);CW.abierto=true;try{drawSceneOf(sc,night);}finally{CW.abierto=false;}ctx.restore();}}};}
// ---------------- figuras por la calle ----------------
function cmFigura(x,y,dx,dy,ch,o){const [u,v]=cmW2V(x,y),c=cmCuerpo(0,0,dx,dy),[px,py]=P(u,v),e=o.edad,sc=typeof pbEscala==='function'?pbEscala(e):1;
  ctx.save();if(sc!==1){ctx.translate(px,py);ctx.scale(sc,sc);ctx.translate(-px,-py);}
  sPerson(u,v,ch,{pose:o.walk?'walk':'stand',front:c.front,right:c.right,ph:o.walk?(o.ph||0):0,name:o.name||null,rot:o.rot||null,act:null,shirt:o.shirt});ctx.restore();}
function cmAnda(x,y,dx,dy,walk,tt){const [u,v]=cmW2V(x,y),[px,py]=P(u,v),c=cmCuerpo(0,0,dx,dy),old=anaRT.phase;anaRT.phase=walk?tt*8:0;
  ctx.save();const o={...anaOpts(),pose:walk?'walk':'stand',act:null,front:c.front,right:c.right};drawAna(px,py,o);anaRT.phase=old;
  ctx.restore();label(CH().name,px,py-70,'#ff8a5b','#fff',9);return [px,py];}
const cmChV={};
function cmChOf(v){if(!cmChV[v.id]){const c=pbLook(v);c.vid=v.id;cmChV[v.id]=c;}return cmChV[v.id];}
// quién va y viene por la calle a esta hora: el censo (casa ↔ trabajo, clase y los sitios de «donde») y unos paseantes sin nombre
function cmPlanGente(bar,h,wd){const out=[],C=DATA.personas||{},H=C.hogares||{};
  for(const v of pbVec()){if(!v||!v.hogar||!H[v.hogar])continue;const ho=H[v.hogar].edificio,hb=cdBarrioDe(ho);
    const evs=[];if(v.trabajo&&v.trabajo.lugar&&Array.isArray(v.trabajo.h))evs.push([v.trabajo.lugar,v.trabajo.h[0],v.trabajo.h[1],v.trabajo.dias,'t']);
    for(const d of v.donde||[])if(Array.isArray(d))evs.push([d[0],d[1],d[2],d[3],'d']);
    if(v.centro&&typeof escEntra==='function'&&(v.estudia==='cole'||v.estudia==='instituto'))try{evs.push([v.centro,escEntra(v),escSale(v,wd),null,'c']);}catch(e){}
    for(const e of evs){const pl=e[0];if(!pl||pl==='fuera'||!cdPuerta(pl)||!pbDia(e[3],wd))continue;if(hb!==bar&&cdBarrioDe(pl)!==bar)continue;
      const a=e[1],b=e[2];if(typeof a!=='number'||typeof b!=='number')continue;
      const R=cmRuta(ho,pl),R2=cmRuta(pl,ho);if(!R||!R2||!(R.min>0))continue;const m=R.min/60,m2=R2.min/60;
      if(h>=a-m-.1&&h<a+.08)out.push({v,R,f:(h-(a-m))/m,t:e[4]==='t'});   // sale por su puerta un momento antes y entra en la del sitio un momento después
      else if(h>=b-.08&&h<b+m2+.1)out.push({v,R:R2,f:(h-b)/m2,t:e[4]==='t'});}}
  return out;}
function cmGente(bar,tt,night){const items=[],h=S.t/60,wd=dateOf(S.day).wd,key=Math.floor(S.t)+'|'+S.day+'|'+bar+'|'+cmHome();
    const [vx,vy,vw,vh]=[0,0,W,H],vis=(x,y)=>{const [u,v]=cmW2V(x,y),[px,py]=P(u,v),sx=cam.x+px*cam.z,sy=cam.y+py*cam.z;return sx>-30&&sx<vw+30&&sy>-90&&sy<vh+50;};
  try{clRelleno(bar,h);}catch(e){console.error('relleno',e);}
  for(const a of clActivos(bar,h))for(const it of clItems(a,tt,vis,bar))items.push(it);   // los vecinos del censo (mods/calle.js)
  // paseantes sin nombre: unos por cada tramo de calle, de ida y vuelta a su ritmo (menos de noche)
  if(h>=6.5&&h<23.5){const SP=15;
    const punta=(h>=7.5&&h<9.5)||(h>=13&&h<15)||(h>=17&&h<20.5),cada=h>=21||h<7.5?4:punta?1:2;// gente sin nombre: toda en hora punta, la mitad entre horas, un cuarto de noche
    for(const q of cmPlanPaseos(bar)){if(q.k%cada)continue;const m=q.d/SP,per=2*m+8,u0=(S.t+q.ph*per)%per;let pts=q.f,f,walk=true;
      if(u0<m)f=u0/m;else if(u0<m+4){f=1;walk=false;}else if(u0<2*m+4){pts=q.r;f=(u0-m-4)/m;}else{pts=q.r;f=1;walk=false;}
      const p=cmAlong(pts,f);if(!vis(p.x,p.y))continue;const [u,v]=cmW2V(p.x,p.y);
      items.push({d:u+v,f:()=>cmFigura(p.x,p.y,p.dx,p.dy,q.ch,{walk,ph:tt*8+q.k,shirt:q.ch.shirt,edad:30})});}}
  return items;}
const cmPaseos={};
// cuánta gente hay por la calle según el barrio (dato: caminar.json → calle.afluencia)
function cmAfluencia(bar){const t=(DATA.caminar.calle||{}).afluencia||{};return t[bar]||t._||1;}
function cmPlanPaseos(bar){if(cmPaseos[bar])return cmPaseos[bar];const out=[];let k=0;
  for(const c of CDX().barrios[bar].calles){const hor=cdHor(c),L=hor?c.b[0]-c.a[0]:c.b[1]-c.a[1],n=Math.max(1,Math.round(L/(13/cmAfluencia(bar))));
    for(let i=0;i<n;i++,k++){const d=Math.min(L,24+pbH('d'+bar+k)*26),t0=pbH('t'+bar+k)*(L-d),A=hor?[c.a[0]+t0,c.a[1]]:[c.a[0],c.a[1]+t0],B=hor?[A[0]+d,A[1]]:[A[0],A[1]+d];
      out.push({f:cmLane(bar,[A,B]),r:cmLane(bar,[B,A]),d,ph:pbH('p'+bar+k),ch:cmPaseante(bar,k),k});}}
  return cmPaseos[bar]=out;}
const cmPas={};
function cmPaseante(bar,i){const k=bar+i;if(!cmPas[k]){const v={id:'pas'+k,g:pbH('g'+k)<.5?'f':'m',edad:20+Math.floor(pbH('e'+k)*45)},c=pbLook(v);cmPas[k]=c;}return cmPas[k];}
// ---------------- el barrio alrededor de la casa y de ella (sustituye al viejo entorno) ----------------
const cmFrame=bar=>{const L=bar===cmHome()?cmLot():[0,0];CMF=[L[0],L[1]];};
function cmHomeVis(){if(typeof BM!=='undefined'&&BM.on)return true;if(cmBar()!==cmHome())return false;
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of [P(0,0,120),P(N,0,120),P(0,N,0),P(N,N,0),P(N,0,0),P(0,0,0)]){const sx=cam.x+x*cam.z,sy=cam.y+y*cam.z;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);}
  return x1>-30&&x0<W+30&&y1>-30&&y0<H+30;}
{const _de=drawEntorno;drawEntorno=function(night,tt,phase){if(BM.on)return _de.apply(this,arguments);if(phase===0)cmMundo0(night,tt);else cmMundo1(night,tt);};}
function cmMundo0(night,tt){const bar=cmBar(),isHome=bar===cmHome(),hv=cmHomeVis();CW.bar=bar;cmFrame(bar);
  RT.names=[];RT.heads=[];RT.obst=[];RT.ana=null;RT.on=true;
  if(CW.bpb===undefined)CW.bpb=BM.b;BM.b=bar;if(CW.bx<tt-1||!BM.bx||BM.bx.b!==bar){BM.bx=null;CW.bx=tt;}
  CW.openId=null;
  try{bmSuelo(night,true);
    if(isHome&&hv)topQuad(0,0,N,N,.1,shade(LAWN,.85));
    const pos=cmPos(),skip=new Set();let ob=null;
    if(pos&&pos.k==='dentro'&&pos.esc&&pos.b===bar&&rot===0){ob=cmAbierto(pos.esc,tt,night,{real:true,pos});if(ob){skip.add(CW.sc.mid);CW.openId=CW.sc.mid;}}
    if(isHome&&hv)skip.add('casa');
    const items=bmItems(tt,night,{skip});if(ob)items.push(ob.item);for(const it of cmFarolas(bar,night))items.push(it);for(const it of cmGente(bar,tt,night))items.push(it);
    items.sort((a,b)=>a.d-b.d);for(const it of items)it.f();
  }finally{RT.on=false;}}
// farolas a lo largo de las calles (en la acera de enfrente de las puertas), con su halo por la noche
const cmFar={};
function cmFarolas(bar,night){if(!cmFar[bar]){const out=[];for(const c of CDX().barrios[bar].calles){const hor=cdHor(c),L=hor?c.b[0]-c.a[0]:c.b[1]-c.a[1],o=c.w/2+CMSW-.2;
      for(let t=9;t<L-2;t+=18)out.push(hor?[c.a[0]+t,c.a[1]+o]:[c.a[0]+o,c.a[1]+t]);}cmFar[bar]=out;}
  const items=[];CW.lamp=[];for(const [x,y] of cmFar[bar]){const [u,v]=cmW2V(x,y),[px,py]=P(u,v),sx=cam.x+px*cam.z,sy=cam.y+py*cam.z;if(sx<-40||sx>W+40||sy<-60||sy>H+60)continue;
    CW.lamp.push([sx,sy-30*cam.z]);items.push({d:u+v,f:()=>{capsule(px,py,px,py-30,1.4,'#4a4e57');circ(px,py-31,3,night>.3?'#ffe9a8':'#cfd3d8');}});}
  return items;}
// delante: ella, si está en la calle (dentro de un sitio con escena la pinta la propia escena), el rótulo del viaje y los nombres de edificios y calles
function cmMundo1(night,tt){const bar=CW.bar,pos=cmPos();RT.on=true;let top=null;
  try{if(pos&&pos.b===bar&&pos.vis&&!(pos.k==='dentro'&&pos.esc&&rot===0)){
      top=cmAnda(pos.x,pos.y,pos.dx,pos.dy,pos.walk,tt);if(pos.moto)emoji('🛵',top[0]+(pos.dx>0?-8:8),top[1]-6,18);}
    bmLabels();
    if(pos&&pos.txt&&viewPlace)rotuloDespues(()=>cmPastilla(pos.txt));}
  finally{RT.on=false;}RT.pend=true;}
function cmPastilla(txt){ctx.save();ctx.setTransform(rtD(),0,0,rtD(),0,0);ctx.font='900 13px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const w=ctx.measureText(txt).width+26,x=W/2-w/2,y=Math.round(H*.27);ctx.fillStyle='rgba(59,50,71,.92)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,30,15);else ctx.rect(x,y,w,30);ctx.fill();
  ctx.fillStyle='#fffdf8';ctx.fillText(txt,W/2,y+15.5);ctx.restore();}
{const _rn=render;render=function(){CW.posT=-1;CW.bpb=undefined;let r;try{r=_rn.apply(this,arguments);}finally{
    if(!BM.on&&CW.bpb!==undefined){try{if(nightFactor()>0)cmHalos(nightFactor());}catch(e){console.error(e);}BM.b=CW.bpb;CW.bpb=undefined;}}return r;};}
// ---------------- la cámara la sigue ----------------
function cmFit(r,front){const x0=r[0],x1=r[2],y0=r[1],y1=r[3]+(front||0),pts=[];for(const [x,y,z] of [[x0,y0,55],[x1,y0,55],[x0,y1,0],[x1,y1,0],[x0,y0,0],[x1,y0,0]]){const [u,v]=cmW2V(x,y);pts.push(P(u,v,z));}
  let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const [x,y] of pts){a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,y);d=Math.max(d,y);}
  const top=W<700?150:120,bot=W<700?190:160,avH=Math.max(200,H-top-bot),avW=W-24,z=Math.max(.4,Math.min(1.5,Math.min(avW/(b-a),avH/(d-c))*.95));
  return {px:(a+b)/2,py:(c+d)/2,ax:W/2,ay:top+avH/2,z,x:W/2-(a+b)/2*z,y:top+avH/2-(c+d)/2*z};}
// la escala de la calle es la de los interiores (la referencia es el bar: una figura de pie mide unos 30 px en 420×860)
function cmZCalle(){const k=W+'x'+H;if(CW.zk===k&&CW.zc)return CW.zc;let z=.8;try{const r=cdRect('bar');if(r){cmFrame(cdBarrioDe('bar'));z=cmFit(r,CMSW+1.2).z;}}catch(e){}CW.zk=k;return CW.zc=Math.max(.55,Math.min(1.2,z));}
// a dónde mira la cámara: un punto del plano (px,py) que va al ancla de pantalla (ax,ay), a escala z
function cmObjetivo(pos){cmFrame(pos.b);
  if(pos.k==='dentro'&&pos.esc&&rot===0){const r=cdRect(cmMid(pos.id));if(r)return cmFit(r,CMSW+1.2);}
  const z=cmZCalle(),[u,v]=cmW2V(pos.x,pos.y),[px,py]=P(u,v),ax=W/2,ay=H*.46;return {px,py,ax,ay,z,x:ax-px*z,y:ay-py*z};}
function cmCamTick(dt){if(BM.on||mode!=='live'||!viewPlace)return;const pos=cmPos();if(!pos){CW.camBar=null;CW.zPrev=null;return;}if(ptrs.size)return;
  const T=cmObjetivo(pos);
  if(CW.camBar!==pos.b){const prev=CW.camBar;CW.camBar=pos.b;if(prev!=null||pos.b!==cmHome()){cam.x=T.x;cam.y=T.y;cam.z=T.z;CW.zPrev=T.z;CW.zGoal=null;return;}}   // otro barrio: el rótulo del viaje tapa el salto
  // la escala solo cambia al cambiar de fase (calle ↔ sitio); entre medias vale la que ponga el jugador
  if(CW.zPrev==null||Math.abs(T.z/CW.zPrev-1)>.02){CW.zPrev=T.z;CW.zGoal=T.z;}
  const kz=1-Math.exp(-dt*3);if(CW.zGoal){cam.z*=Math.pow(CW.zGoal/cam.z,kz);if(Math.abs(CW.zGoal/cam.z-1)<.01)CW.zGoal=null;}
  let tx=T.ax-T.px*cam.z,ty=T.ay-T.py*cam.z;
  if(pos.k==='vuelta'&&pos.b===cmHome()&&savedCam){const f=Math.max(0,Math.min(1,(S.sim.work>0?cmFase():{f:1}).f)),w=Math.max(0,Math.min(1,(f-.72)/.28)),e=w*w*(3-2*w);
    tx+=(savedCam.x-tx)*e;ty+=(savedCam.y-ty)*e;cam.z+=(savedCam.z-cam.z)*e*.2;}
  const k=1-Math.exp(-dt*(pos.k==='dentro'?3:5));cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;}
{const _uc=updateCamera;updateCamera=function(dt){_uc.apply(this,arguments);try{cmCamTick(dt);}catch(e){console.error('cámara',e);}};}
// siempre sin girar mientras se la sigue: los interiores no giran
{const _e=enterScene;enterScene=function(){const was=viewPlace;_e.apply(this,arguments);if(!was&&viewPlace){CW.camBar=null;if(rot!==0){CW.rotPrev=rot;const [u,v]=screenToView(W/2,H*.46),[x,y]=v2w(u,v);rot=0;centerOnWorld(x,y);}}};}
{const _l=leaveScene;leaveScene=function(){const was=viewPlace;_l.apply(this,arguments);if(was&&!viewPlace){CW.camBar=null;if(CW.rotPrev){rot=CW.rotPrev;CW.rotPrev=0;}}};}
{const _ak=awayKey;awayKey=function(){const s=S.sim;if(!(s.work>0)||!s.dest)return null;const f=cmFase();if(!f)return _ak.apply(this,arguments);
  if(s.dest==='_ride')return '_ride';if(s.dest==='comisaria')return s.dest;
  if(f.k!=='dentro'||s.dest==='_punto')return '_calle';
  if(s.outingActive==='piquete')return '_piquete';return s.dest;};}
{const _st=sceneTitle;sceneTitle=function(key){const s=S.sim,f=cmFase();
  if(f&&key==='_calle'){const p=cmPos();if(p&&p.txt)return p.txt;if(s.dest==='_punto'&&f.k==='dentro'){const c=s.irPt&&cmCalle(s.irPt[0],[s.irPt[1],s.irPt[2]],true);return cmT('paseo_calle',{calle:c?c.n:''});}
    return f.k==='vuelta'?cmT('titulo_vuelta'):cmT('titulo_ida',{lugar:s.dest==='_punto'?cmT('paseo_calle',{calle:''}).trim():placeName(s.dest)});}
  return _st.apply(this,arguments);};}
// ---------------- salir, ir, volver: el viaje usa los minutos que dice cdTrayecto ----------------
// desde dónde sale ahora: la puerta (id) o el punto [barrio,x,y] del eje de la calle por el que va; null si va en transporte
function cmDesde(){const s=S.sim,f=cmFase();if(!f)return null;
  if(f.k==='dentro')return s.dest==='_punto'&&s.irPt?s.irPt.slice():cmDest(s.dest);
  const p=cmPos();if(!p||!p.vis||p.viaje||!p.leg||p.leg.k!=='pie')return null;
  const q=cmSnap(p.b,p.x,p.y);if(q){const r=cmRuta([p.b,Math.round(q.p[0]*10)/10,Math.round(q.p[1]*10)/10],'casa');if(r)return [p.b,Math.round(q.p[0]*10)/10,Math.round(q.p[1]*10)/10];}
  return p.b===cmHome()?'casa':null;}
// ¿estará abierto cuando llegue? devuelve null (sí) o la frase «el súper cierra los domingos»
function cmCierra(dest,min){try{const id=cmDest(dest);if(!id||id==='_ride'||id==='_punto')return null;const p=cdLug(id);if(!p||!p.abre)return null;
  const t=S.t+(min||0),day=S.day+Math.floor(t/1440),h=(t%1440)/60,r=bmAhora(id,day,h);if(!r||r.on)return null;
  const el=cmT('el_'+id)||(DATA.caminar.el&&DATA.caminar.el[id])||bmName(id),wd=bmDiaEf(day),ab=p.abre,dias=cmT('dias_plural')?DATA.caminar.dias_plural:['lunes','martes','miércoles','jueves','viernes','sábados','domingos'];
    if(!ab.some(f=>f[2].includes(wd)))return cmT('cierra_dia',{lugar:el,dia:festivo(day)?cmT('festivos'):dias[wd]});
    const b=r.abre;return cmT('cerrado_hora',{lugar:el,cuando:b?(b.o===0?'a las ':b.o===1?'mañana a las ':'el '+DATA.reglas.dias[b.wd].toLowerCase()+' a las ')+bmH(b.h):''});}catch(e){return null;}}
const cmCap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
const cmIrMin=()=>(DATA.caminar&&DATA.caminar.ir_min)||45;
const cmCasaMin=d=>{try{if(!d||d==='_ride')return 30;return cmMinDe('casa',cmDest(d));}catch(e){return 30;}};
// el margen para salir a la hora: el trayecto y una hora de margen (lo que tarda en dejar lo que hace, salir de casa y llegar con tiempo)
Object.defineProperty(SHIFT,'leave',{get(){return TR().sh[0]-(cmCasaMin(destOf('work'))+60)/60;},configurable:true});
function cmDefine(s,dest,stay,from){const fin=dest==='_punto'&&s.irPt?s.irPt:cmDest(dest),a=cmMinDe(from||'casa',fin),b=cmMinDe(fin,'casa');
  s.tr={a,b,from:from||'casa',pg:[]};s.work=a+stay+b;s.awayTotal=s.work;}
{const _dp=depart;depart=function(){const s=S.sim,out=s.outing;_dp.apply(this,arguments);try{
  if(!(s.work>0)||!s.dest||s.dest==='_ride'||s.dest==='comisaria'){s.tr=null;return;}
  const fin=cmDest(s.dest);if(!(s.dest==='_punto'||(cdBarrioDe(fin)&&cdPuerta(fin)))){s.tr=null;return;}
  if(out){const dur=s.work,t0=Math.min(20,dur/3);cmDefine(s,s.dest,out==='ir'?cmIrMin():Math.max(5,dur-2*t0),'casa');return;}
  const a=s.dest==='_punto'?0:cmMinDe('casa',fin),b=a,start=SHIFT.start*60,t0=S.t,end=s.worked+Math.max(start,t0+30),arrive=t0+a,old=Math.max(0,Math.round(t0+30-start));
  s.late=Math.max(0,Math.round(arrive-start));s.worked=Math.max(30,end-Math.max(start,arrive));s.work=Math.max(arrive,start)-t0+s.worked+b;s.awayTotal=s.work;
  s.tr={a,b,from:'casa',pg:[]};if(s.late>15&&old<=15)toast(`🚌 ${CH().name} va tarde: el trayecto son ${a} min`);
  }catch(e){console.error('depart',e);}};}
{const _fw=finishWork;finishWork=function(){const r=_fw.apply(this,arguments);const s=S.sim;if(!(s.work>0)){s.tr=null;s.irA=null;s.irPt=null;}return r;};}
{const _do=destOf;destOf=function(k){if(k==='ir'){const s=S.sim;return s.irPt?'_punto':(s.irA||'parque');}return _do.apply(this,arguments);};}
// salir de un sitio a otro sin pasar por casa (encadenar.js): el trayecto sale de la puerta de donde estaba
{const _do=doOut;doOut=function(k){const s=S.sim,f=awayNow()?cmFase():null,was=f&&OUT[k]&&s.dest&&s.dest!=='_ride'&&s.dest!=='comisaria'?cmDesde():null;
  if(awayNow()&&OUT[k]&&f&&(f.k!=='dentro'&&(!s.outingActive||!was))){toast(cmT('ir_transporte',{n:CH().name}));return;}
  const r=_do.apply(this,arguments);
  try{if(was&&s.work>0&&s.outingActive===k&&OUT[k]){const dur=s.work,t0=Math.min(20,dur/3);if(s.dest&&s.dest!=='_ride')cmDefine(s,s.dest,Math.max(5,dur-2*t0),was);}}catch(e){console.error(e);}
  return r;};}
// qué había antes de «irse ya»: lo guarda leaveNow para saber desde dónde vuelve
{const _ln=leaveNow;leaveNow=function(){const s=S.sim;CW.prev={dest:s.dest,f:s.work>0?cmFase():null,tr:s.tr,pt:s.irPt,desde:s.work>0&&s.dest!=='_ride'?cmDesde():null};return _ln.apply(this,arguments);};}
function cmIrCasa(){const s=S.sim,p=CW.prev||{},f=p.f;CW.prev=null;
  if(!p.dest||p.dest==='_ride'||p.dest==='comisaria'){s.work=1;s.awayTotal=1;s.outingActive='_vuelta';s.dest=null;toast(cmT('vuelve_toast'));return;}
  s.outingActive='_vuelta';s.irA=null;s.irPt=p.pt||null;
  if(f&&f.k==='ida'){ // se da la vuelta por donde iba
    if(((p.tr&&p.tr.from)!=='casa'&&p.tr)||(p.desde&&p.desde!=='casa')){s.dest='_casa';const fr=p.desde||p.tr.from,b=cmMinDe(fr,'casa');s.tr={a:0,b,from:fr,pg:[]};s.work=b;s.awayTotal=b;toast(cmT('vuelve_toast'));return;}
    const b=Math.max(1,Math.round(f.el));s.dest=p.dest;s.tr={a:0,b,from:'casa',turn:f.f,fin:p.pt?p.pt:cmDest(p.dest),pg:[]};s.work=b;s.awayTotal=b;toast(cmT('vuelve_toast'));return;}
  if(f&&f.k==='vuelta'){s.dest=p.dest;s.tr=p.tr;s.work=Math.max(1,p.tr?p.tr.b*(1-f.f):1);s.awayTotal=s.work;return;}
  const fin=p.pt?p.pt:cmDest(p.dest),b=cmMinDe(fin,'casa');s.dest='_casa';s.tr={a:0,b,from:fin,pg:[]};s.work=b;s.awayTotal=b;toast(cmT('vuelve_toast'));}
// «🏠 Volver a casa»: desde donde esté
function cmVolver(){const s=S.sim;if(!(s.work>0)||s.jail||s.dest==='_ride'||s.outingActive==='_vuelta'||s.outingActive==='calabozo')return toast(cmT('ir_cerrado',{n:CH().name}));
  const f=cmFase();if(f&&f.k==='vuelta')return toast(cmT('ir_ya',{n:CH().name}));
  if(!leaveNow())return;cmIrCasa();}
// «🚶 Ir allí andando»: a una puerta (id) o a un punto de la calle ([barrio,x,y])
function cmIr(id,pt){const s=S.sim;if(BM.obs||s.jail)return false;if(!pt&&!(cmDest(id)&&cdPuerta(cmDest(id)))){toast(cmT('ir_no'));return false;}
  if(pt&&cmBar()!==pt[0]){toast(cmT('ir_no'));return false;}
  const dest=pt?'_punto':id;
  if(s.work>0){const f=cmFase(),here=s.dest,k=s.outingActive;if(!f||s.dest==='_ride'||k==='calabozo'||(f.k!=='dentro'&&!k)){toast(cmT('ir_cerrado',{n:CH().name}));return false;}
    if(!pt&&f.k!=='vuelta'&&(here===id||cmDest(here)===id)&&!(f.k==='ida'&&s.tr&&s.tr.from!=='casa')){toast(cmT('ir_ya',{n:CH().name}));return false;}
    const from=cmDesde();if(!from){toast(cmT('ir_transporte',{n:CH().name}));return false;}
    const fin=pt||cmDest(id),R=cmRuta(from,fin);if(!R){toast(cmT('ir_no'));return false;}
    if(!pt){const c=cmCierra(id,Math.max(1,Math.round(R.min)));if(c){toast(cmCap(c));return false;}}
    if(f.k==='dentro'||!(k==='ir'||k==='_vuelta')){if(!leaveNow())return false;}
    s.use=null;s.target=null;s.path=[];s.leaving=false;s.outing=null;s.irA=pt?null:id;s.irPt=pt||null;s.dest=dest;s.route=null;s.outingActive='ir';s.think=0;
    cmDefine(s,dest,cmIrMin(),from);
    toast(pt?cmT('ir_punto_toast'):cmT('ir_toast',{lugar:placeName(id)}));return true;}
  if(!pt){const c=cmCierra(id,cmMinDe('casa',cmDest(id)));if(c){toast(cmCap(c));return false;}}
  s.irA=pt?null:id;s.irPt=pt||null;goOut('ir');return true;}
// ---------------- el tiempo: billetes y llegada ----------------
const cmBK=()=>{if(typeof BK_CAT!=='undefined'&&!BK_CAT['Transporte'])BK_CAT['Transporte']='otros';};cmBK();
function cmTick(){const s=S.sim;if(!(s.work>0)||!s.dest)return;const f=cmFase();if(!f||!s.tr)return;
  if(f.k!=='dentro'){const fin=cmFin(s);if(fin){const {from,to,turn}=cmRutaF(f,fin),R=cmRuta(from,to);
      if(R){const tot=R.legs.reduce((a,l)=>a+l.min,0)||1,want=(turn!=null?turn*(1-f.f):f.f)*tot;let acc=0;
        R.legs.forEach((l,i)=>{if(l.k==='viaje'&&l.pay>0&&want>=acc-1e-9){const key=f.k[0]+i;s.tr.pg=s.tr.pg||[];if(!s.tr.pg.includes(key)){s.tr.pg.push(key);const e=hrs(l.pay);bkAdd('Transporte',-e);toast(cmT('billete',{linea:l.linea,eur:String(e).replace('.',',')}));}}acc+=l.min;});}}}
  else if(s.outingActive==='ir'&&!s.tr.sh){s.tr.sh=1;const id=s.dest==='_punto'?null:cmDest(s.dest);
    if(id&&!cmEscena(s.dest)&&viewPlace&&!BM.on){toast(cmT('frente',{n:CH().name}));try{cmFicha(id);}catch(e){console.error(e);}}}}
{const _up=update;update=function(gm){CW.posT=-1;const r=_up.apply(this,arguments);CW.posT=-1;try{cmTick();}catch(e){console.error('cmTick',e);}return r;};}
// ---------------- tocar: gente, edificios y acera ----------------
function cmFicha(id){const bar=cmBar(),pb=BM.b;BM.b=bar;BM.bx=null;try{return bmFicha(id);}finally{BM.b=pb;BM.bx=null;}}
function cmSnap(bar,x,y){let best=null;for(const c of CDX().barrios[bar].calles){const hor=cdHor(c),p=hor?[Math.max(c.a[0],Math.min(c.b[0],x)),c.a[1]]:[c.a[0],Math.max(c.a[1],Math.min(c.b[1],y))],d=hor?Math.abs(y-c.a[1]):Math.abs(x-c.a[0]);
    if(d<=c.w/2+CMSW+3&&(!best||d<best.d))best={p,c,d};}return best;}
function cmToque(sx,sy,soloFicha){const bar=cmBar(),v=typeof vcHit==='function'?vcHit(sx,sy):null;if(v){sfx('tap');vcOpen(v);return true;}
  const pb=BM.b;BM.b=bar;BM.bx=null;cmFrame(bar);let t=null;try{t=bmAt(sx,sy);}finally{BM.b=pb;BM.bx=null;}
  if(t){sfx('tap');cmFicha(t.id);return true;}
  if(soloFicha)return false;
  const [u,vv]=screenToView(sx,sy),[x,y]=v2w(u,vv),wx=x+CMF[0],wy=y+CMF[1],q=cmSnap(bar,wx,wy);
  if(q){sfx('tap');cmIr(null,[bar,Math.round(q.p[0]*10)/10,Math.round(q.p[1]*10)/10]);return true;}
  return false;}
// una salida a un sitio cerrado cuando llegue no sale (aviso) y la automatización busca otro momento
{const _oa=outAvail;outAvail=function(k){const r=_oa.apply(this,arguments);if(r||!OUT[k]||['amigos','visita','piquete','manifestacion','calabozo'].includes(k))return r;
  try{const d=destOf(k),from=awayNow()?cmDesde():'casa',c=cmCierra(d,cmMinDe(from||'casa',cmDest(d)));if(c)return c;}catch(e){}return r;};}
{const _do=destOf;destOf=function(k){const d0=_do.apply(this,arguments);
  const m={compra:'super',pedir:'super',beber:'bar',presta:'biblioteca'};if(m[k])return m[k];
  if(k==='amigos'){try{const l=['bar','parque','sala'],f=S.sim.work>0?cmDesde():'casa';if(cmCierra(d0,cmMinDe(f||'casa',cmDest(d0)))){const o=l.find(x=>!cmCierra(x,cmMinDe(f||'casa',cmDest(x))));if(o)return o;}}catch(e){}}return d0;};}
{const _sa=sceneAct;sceneAct=function(){const s=S.sim;if(s.outingActive==='ir'&&s.work>0&&!BM.on){const p=PLACES[cmMid(s.dest)]||PLACES[s.dest];return ((p&&p.outs)||[])[0]||'visita';}return _sa.apply(this,arguments);};}
{const _pn=placeName;placeName=function(k){if(!PLACES[k]&&k!=='_ride'&&typeof cdLug==='function'&&cdLug(k))return bmName(k);return _pn.apply(this,arguments);};}
{const _lt=liveTap;liveTap=function(x,y){try{if(!BM.on&&mode==='live'){const fuera=S.sim.work>0;
    if((viewPlace&&fuera)||!inb(x,y)){if(cmToque(lastPtr[0],lastPtr[1],!viewPlace))return;}
    else if(fuera&&!viewPlace&&cmToque(lastPtr[0],lastPtr[1],true))return;}}catch(e){console.error('toque',e);}return _lt.apply(this,arguments);};}
// ---------------- la ficha: trayecto e «ir allí andando» ----------------
function cmTrayectoTxt(id){const R=cmRuta('casa',cmDest(id));if(!R)return '';const m=Math.max(1,Math.round(R.min)),e=R.precio!=null?R.precio:0;
  return e>0?cmT('trayecto',{min:m,y:cmT('y_precio',{eur:String(e).replace('.',',')})}):cmT('trayecto_pie',{min:m});}
function cmKV(txt){return txt?`<div class="kv"><span>🚶 ${txt.split(':')[0]}</span><span>${txt.split(':').slice(1).join(':').trim()}</span></div>`:'';}
{const _op=openPlace;openPlace=function(k){_op.apply(this,arguments);try{const tx=cdPuerta(k)?cmTrayectoTxt(k):'';if(!tx)return;
    const q=[...card.querySelectorAll('.kv')].find(e=>/Aquí trabaja/.test(e.textContent));const el=document.createElement('div');el.innerHTML=cmKV(tx);
    if(q)q.after(el.firstChild);else{const b=card.querySelector('.sub');if(b)b.after(el.firstChild);}
    if(!(S.sim.work>0&&S.sim.dest===k)){const b=document.createElement('button');b.className='btn grey';b.id='cmir';b.textContent=cmT('ir_boton');b.onclick=()=>{menu.classList.remove('open');cmIr(k);};const c=card.querySelector('#plclose');if(c)c.before(b);}}catch(e){console.error(e);}};}
// el botón «volver a casa» en pantalla mientras sigue a Ana
function cmBtn(){let b=document.getElementById('homebtn');if(!b){b=document.createElement('button');b.id='homebtn';b.className='glass';b.textContent=cmT('casa_boton');
    b.style.cssText='position:fixed;top:146px;left:8px;z-index:5;border:0;border-radius:14px;padding:7px 12px;font-family:inherit;font-weight:900;font-size:12.5px;color:var(--ink);cursor:pointer;display:none';
    b.onclick=()=>cmVolver();document.body.appendChild(b);}
  const f=S.sim.work>0?cmFase():null,on=!!f&&viewPlace&&mode==='live'&&!BM.on&&f.k!=='vuelta'&&S.sim.dest!=='_ride'&&S.sim.outingActive!=='calabozo'&&S.sim.outingActive!=='_vuelta';
  const d=on?'block':'none';if(b.style.display!==d)b.style.display=d;}
{const _ph=placeHud;placeHud=function(){_ph.apply(this,arguments);try{cmBtn();}catch(e){}};}
