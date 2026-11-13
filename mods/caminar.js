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
  if(s.dest==='_ride'){const tot=s.awayTotal||s.work,p=rdPos(Math.max(0,tot-s.work),tot);
    if(!p)return {k:f.k,b:home,x:0,y:0,dx:0,dy:1,walk:false,vis:false};
    return {k:'reparto',b:p.b,x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:p.walk,vis:p.vis,viaje:p.viaje,txt:rdTxt(p),leg:p.leg,mochila:rdColor(),quieto:p.quieto};}
  const fin=cmFin(s),bFin=Array.isArray(fin)?fin[0]:cdBarrioDe(fin);
  if(f.k==='dentro'){const id=cmDest(s.dest),esc=s.dest==='_punto'?null:cmEscena(s.dest);let x=0,y=0,ex={};
    if(Array.isArray(fin)){const q=cmLane(fin[0],[[fin[1],fin[2]]])[0];x=q[0];y=q[1];}else{const q=cmPuertaPts(id);if(q){x=q.side[0];y=q.side[1];}}
    const m=s.dest==='_punto'?null:cmColaMia(f);
    if(m){const q=cmColaPosMia(m);if(q)return {k:'dentro',b:bFin||home,id,t0:f.t0,t1:f.t1,esc:null,vis:true,x:q.x,y:q.y,dx:q.dx,dy:q.dy,walk:q.walk,txt:q.txt,cola:true};}
    if(mfActiva()){const q=mfPos();if(q)return {k:'dentro',b:q.b,id,t0:f.t0,t1:f.t1,esc:null,vis:true,x:q.x,y:q.y,dx:q.dx,dy:q.dy,walk:q.walk,vest:true,act:q.walk?null:'cheer',prop:'📣',txt:cmT('manif_pastilla',{calle:q.calle})};}
    if(s.outingActive==='piquete'&&!Array.isArray(fin)){const q=cmPuertaPts(id);if(q){x=q.xd+.55;y=q.y1+1.15;ex={dx:1,dy:0,vest:true,act:'cheer',prop:'📣',txt:cmT('piquete_pastilla',{lugar:placeName(id)})};}}
    return {k:'dentro',b:bFin||home,id,t0:f.t0-((s.tr&&s.tr.cq>0)?s.tr.cq0+s.tr.cq:0),t1:f.t1,esc,vis:true,x,y,dx:ex.dx!=null?ex.dx:0,dy:ex.dy!=null?ex.dy:-1,walk:false,vest:ex.vest,act:ex.act,prop:ex.prop,txt:ex.txt};}
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
const cmEscena=k=>(k&&SCENES[k]&&k!=='_ride'&&S.sim.outingActive!=='piquete'&&!mfActiva()&&!cmEnCola()&&cmMid(k)&&cdRect(cmMid(k)))?k:null;
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
  if(o.mochila&&!c.front)cmMochila(px,py,false,c.right,o.mochila);
  sPerson(u,v,ch,{pose:o.walk?'walk':'stand',front:c.front,right:c.right,ph:o.walk?(o.ph||0):0,name:o.name||null,rot:o.rot||null,act:o.act||null,shirt:o.shirt,vest:o.vest,prop:o.prop||undefined});
  if(o.mochila&&c.front)cmMochila(px,py,true,c.right,o.mochila);ctx.restore();}
function cmAnda(x,y,dx,dy,walk,tt,ex){ex=ex||{};const [u,v]=cmW2V(x,y),[px,py]=P(u,v),c=cmCuerpo(0,0,dx,dy),old=anaRT.phase;anaRT.phase=walk?tt*8:0;
  ctx.save();const o={...anaOpts(),pose:walk?'walk':'stand',act:ex.act||null,front:c.front,right:c.right};if(ex.vest)o.vest=true;
  if(ex.mochila&&!c.front)cmMochila(px,py,false,c.right,ex.mochila);drawAna(px,py,o);anaRT.phase=old;if(ex.mochila&&c.front)cmMochila(px,py,true,c.right,ex.mochila);
  if(ex.prop)emoji(ex.prop,px+8,py-44,11);
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
      const rid=((h>=12.5&&h<15.5)||(h>=18&&h<23))&&q.k%7===3?rdColor():null;
      items.push({d:u+v,f:()=>cmFigura(p.x,p.y,p.dx,p.dy,q.ch,{walk,ph:tt*8+q.k,shirt:q.ch.shirt,edad:30,mochila:rid})});}}
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
    const items=bmItems(tt,night,{skip});if(ob)items.push(ob.item);for(const it of cmFarolas(bar,night))items.push(it);for(const it of cmGente(bar,tt,night))items.push(it);for(const it of cmAcera(bar,tt))items.push(it);
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
      top=cmAnda(pos.x,pos.y,pos.dx,pos.dy,pos.walk,tt,{vest:pos.vest,act:pos.act,prop:pos.prop,mochila:pos.mochila});}
    bmLabels();
    if(pos&&pos.txt&&viewPlace)rotuloDespues(()=>cmPastilla(pos.txt));}
  finally{RT.on=false;}RT.pend=true;}
function cmPastilla(txt){ctx.save();ctx.setTransform(rtD(),0,0,rtD(),0,0);ctx.font='900 13px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  let w=ctx.measureText(txt).width+26;if(w>W-16){ctx.font='900 11px Nunito, sans-serif';w=Math.min(W-16,ctx.measureText(txt).width+22);}const x=W/2-w/2,y=Math.round(H*.27);ctx.fillStyle='rgba(59,50,71,.92)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,30,15);else ctx.rect(x,y,w,30);ctx.fill();
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
  if(s.outingActive==='piquete'||mfActiva())return '_piquete';return s.dest;};}
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
  else if(s.outingActive!=='ir'&&s.tr.cq==null)cmColaTick(f);
  if(f.k==='dentro'&&!s.outingActive&&!s.tr.pq&&s.dest!=='_ride'&&s.dest!=='_punto'&&S.strike&&S.strike.on&&!S.strike.join&&pqCentros().some(g=>g.id===cmDest(s.dest))){s.tr.pq=1;
    let cp=null;try{cp=P_('compi');}catch(e){}const lg=placeName(cmDest(s.dest));toast(cp&&cp.n?cmT('piquete_cruza_compi',{n:CH().name,lugar:lg,compi:cp.n}):cmT('piquete_cruza',{n:CH().name,lugar:lg}));}
  if(f.k==='dentro'&&s.tr.cq>0&&!s.tr.cqd&&f.t0>=s.tr.cq0+s.tr.cq){s.tr.cqd=1;toast(cmT('cola_entra',{n:CH().name,min:s.tr.cq}));}
  if(f.k==='dentro'&&s.outingActive==='ir'&&!s.tr.sh){s.tr.sh=1;const id=s.dest==='_punto'?null:cmDest(s.dest);
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
// =================== EN LA PUERTA: piquetes, colas y riders (T-141) ===================
// Todo sale de los datos (puertas de ciudad.json, gente del censo, caminar.json) y del estado que ya hay (S.strike, W_()): sin estado nuevo salvo s.tr.cq* (la cola de quien la hace).
const cmCfg=()=>DATA.caminar||{};
const cmFilaDe=(id,k)=>cmPaseante('q'+id,k%24);
const CMBAJ=(x,y,dx,dy)=>({x,y,dx,dy});
// la acera de enfrente de una puerta (para la policía)
function cmEnfrente(id){const q=cdPuerta(id);if(!q)return null;const c=cmCalle(cdBarrioDe(id),q.p,true);return c?q.p[1]+c.w/2+CMSW/2:null;}
// la profundidad de lo que está delante de la puerta de un edificio: nunca por detrás de su fachada
const cmDF=(id,u,v)=>{try{const r=cmV(cdRect(id));return Math.max(u+v,r[2]+r[3]+.01+(u+v)*1e-3);}catch(e){return u+v;}};
// ---------- PIQUETES ----------
const PQ={k:'',cs:[],nom:new Set(),ruta:{}};
const PQ_SL=[[-5.0,.45],[-1.9,.45],[2.3,.5],[-3.4,1.3],[-1.2,1.3],[3.4,1.25],[3.6,.4],[-6.4,1.1]];   // dónde se pone cada quien, respecto a la puerta (xd, fachada y1)
function pqCentros(){const h=S.t/60,w=W_(),st=S.strike,k=S.day+'|'+Math.floor(h*4)+'|'+cmHome()+'|'+(st&&st.on?1:0)+(w.gs===S.day?1:0)+(S.sim.outingActive==='piquete'?1:0);
  if(PQ.k===k)return PQ.cs;PQ.k=k;PQ.cs=[];PQ.nom=new Set();
  const H=cmCfg().piquete_horas||[6.75,14],EX=cmCfg().piquete_anda_h||.55;if(!(h>=H[0]-EX&&h<H[1]+EX)||dayType(S.day)!=='work')return PQ.cs;
  let wk=null;try{wk=destOf('work');}catch(e){}if(!(wk&&wk!=='_ride'&&cdPuerta(wk)))wk=null;
  const ids=[];if(wk&&((st&&st.on)||w.gs===S.day))ids.push(wk);
  if(w.gs===S.day){const n=new Map();for(const v of pbVec()){const l=v&&v.trabajo&&v.trabajo.lugar;if(l&&l!=='fuera'&&l!==wk&&cdPuerta(l)&&!['casaV','casa2','casa'].includes(l))n.set(l,(n.get(l)||0)+1);}
    [...n.entries()].sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1)).slice(0,2).forEach(e=>ids.push(e[0]));}
  const wd=dateOf(S.day).wd,cops=w.gov==='conservador'||w.era==='represion',og=(S.office&&S.office.org)||20,mov=w.mov||0;
  for(const id of ids){const mio=id===wk,nP=Math.max(4,Math.min(8,4+Math.round((og+mov)/45)+(w.gs===S.day?1:0))),nom=[];
    if(mio){let cp=null;try{cp=P_('compi');}catch(e){}if(cp&&cp.n)nom.push({ch:{...pbLook({id:'compi'+cp.n,g:cp.g==='o'?'m':cp.g==='f'?'f':'m',edad:34}),vid:null},n:cp.n,compi:true});}
    for(const v of pbVec()){if(nom.length>=Math.min(4,nP-2))break;if(v&&v.trabajo&&v.trabajo.lugar===id&&pbDia(v.trabajo.dias,wd)&&pbAdult(v)){nom.push({ch:cmChOf(v),n:v.n,v});PQ.nom.add(v.id);}}
    PQ.cs.push({id,mio,gs:w.gs===S.day,nP,nom,cops});}
  return PQ.cs;}
const pqEn=vid=>{pqCentros();return PQ.nom.has(vid);};
// los nombrados llegan andando en los minutos previos (desde su casa, o desde la parada si viven en otro barrio) y se van andando al terminar
function pqAnda(g,nm,i,slot,h,H0,bar){const Q=cmCfg(),k=(nm.v?nm.v.id:'compi')+'|'+g.id;
  let c=PQ.ruta[k];if(c===undefined){c=null;let pts=null,lm=1.2;
    try{if(nm.v){const ho=clHog(nm.v),R=ho&&cmRuta(ho,g.id);if(R){const L=R.legs.filter(l=>l.k==='pie'&&l.b===cdBarrioDe(g.id)&&l.pts&&l.pts.length>1);if(L.length){pts=L[L.length-1].pts.slice();lm=L[L.length-1].min||lm;}}}
      else{const q=cmPuertaPts(g.id);pts=[[q.xd-13,slot[1]],[q.xd-8,slot[1]]];}}catch(e){pts=null;}
    if(pts){c={pts:pts.concat([slot]),d:Math.max(.04,Math.min(Q.piquete_anda_max_h||.33,lm/60+.01))};}
    PQ.ruta[k]=c;}
  const sl=(Q.piquete_llegada_h||[.02,.2]),n=(nm.v?String(nm.v.id).length:3)+i,h0=H0[0],h1=H0[1];
  if(!c)return h<h0?null:{x:slot[0],y:slot[1],dx:1,dy:0,walk:false};
  if(h<h0){const arr=h0-sl[0]-(n%4)*(sl[1]-sl[0])/3,g0=(h-(arr-c.d))/c.d;if(g0<0)return null;if(g0>=1)return {x:slot[0],y:slot[1],dx:1,dy:0,walk:false};
    const p=cmAlong(c.pts,g0);return {x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:true};}
  const dep=h1+sl[0]+(n%4)*(sl[1]-sl[0])/3,g1=(h-dep)/c.d;if(g1<0)return {x:slot[0],y:slot[1],dx:1,dy:0,walk:false};if(g1>=1)return null;
  const p=cmAlong(c.pts.slice().reverse(),g1);return {x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:true};}
// la pancarta: dos palos y un rectángulo por encima de las cabezas; el texto va a tamaño fijo de pantalla (sistema de rótulos) para que se lea con cualquier zoom y no lo tapen las figuras
function pqPancarta(x0,x1,y,tt,txt,txt2){const sw=Math.sin(tt*1.6)*1.2,zB=84,zT=110,k=6;
  const [u0,v0]=cmW2V(x0+.12,y),[u1,v1]=cmW2V(x1-.12,y);
  for(const [u,v] of [[u0,v0],[u1,v1]]){const [a,b]=P(u,v,0),[c,d]=P(u,v,zT+8);capsule(a,b,c,d,2.2,"#6b5440");}
  const top=[],bot=[];for(let i=0;i<=k;i++){const f=i/k,u=u0+(u1-u0)*f,v=v0+(v1-v0)*f,s=Math.sin(f*Math.PI);top.push(P(u,v,zT+sw*s));bot.push(P(u,v,zB+sw*s*.6));}
  poly(top.concat(bot.reverse()),'#fffdf8');poly([P(u0,v0,zT),P(u1,v1,zT),P(u1,v1,zT-4),P(u0,v0,zT-4)],'#d1242f');
  const [um,vm]=[(u0+u1)/2,(v0+v1)/2],[a,b]=P(um,vm,(zT+zB)/2),pt=rtPt?rtPt(a,b):[a,b];
  const pinta=(sx,sy,c,fijo)=>{if(fijo){const A=rtAreas(),hh=txt2?26:18;sy=Math.max(A.top+hh/2+2,Math.min(A.bot-hh/2-2,sy));sx=Math.max(50,Math.min(A.Wd-50,sx));}c.save();c.textAlign='center';c.textBaseline='middle';c.font='900 12px Nunito, sans-serif';const w=Math.max(c.measureText(txt).width,txt2?c.measureText(txt2).width*.8:0)+12,h=txt2?26:18;
    c.fillStyle='rgba(255,253,248,.96)';c.strokeStyle='#d1242f';c.lineWidth=1.5;c.beginPath();if(c.roundRect)c.roundRect(sx-w/2,sy-h/2,w,h,4);else c.rect(sx-w/2,sy-h/2,w,h);c.fill();c.stroke();
    c.fillStyle='#d1242f';c.fillText(txt,sx,sy-(txt2?5:0));if(txt2){c.fillStyle='#3b3247';c.font='800 8.5px Nunito, sans-serif';c.fillText(txt2,sx,sy+7);}c.restore();};
  if(!(typeof rotuloDespues==='function'&&RT.on&&rotuloDespues(()=>{ctx.save();ctx.setTransform(rtD(),0,0,rtD(),0,0);pinta(pt[0],pt[1],ctx,true);ctx.restore();}))){const m=ctx.getTransform();ctx.save();ctx.translate(a,b);ctx.scale(1/m.a,1/m.d);pinta(0,0,ctx);ctx.restore();}}
function pqBandera(x,y,col,tt,k,txt){const [u,v]=cmW2V(x,y),[a,b]=P(u,v,22),[c,d]=P(u,v,70);capsule(a,b,c,d,1.3,'#8a7560');const s=Math.sin(tt*2.2+k)*2.2,s2=Math.sin(tt*2.2+k+1.2)*2.2;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(c,d);ctx.quadraticCurveTo(c+9,d-3+s,c+20,d+s2);ctx.lineTo(c+20,d+13+s2);ctx.quadraticCurveTo(c+9,d+10+s,c,d+13);ctx.fill();
  if(txt){ctx.fillStyle='#fff';ctx.font='900 5px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,c+10,d+7+(s+s2)/2);}}
function pqItems(bar,tt,vis){const out=[],Q=cmCfg();
  for(const g of pqCentros()){if(cdBarrioDe(g.id)!==bar)continue;const q=cmPuertaPts(g.id);if(!q)continue;const xd=q.xd,y1=q.y1;
    const lug=g.mio?placeName(g.id):bmName(g.id),sl=PQ_SL.slice(0,g.nP);let j=0;
    const slot=i=>[xd+PQ_SL[i][0],y1+PQ_SL[i][1]];
    // quienes están: los nombrados (compañeras y vecinas que trabajan allí) en los puestos de a pie y el resto, sin nombre
    const ord=[2,5,4,6,7,0,1].filter(i=>i<g.nP);const nomAt=new Map();g.nom.forEach((p,i)=>{if(ord[i]!=null)nomAt.set(ord[i],p);});
    const H0=(Q.piquete_horas||[6.75,14]),hh=S.t/60,dentro=hh>=H0[0]&&hh<H0[1];
    for(let i=0;i<g.nP;i++){const nm=nomAt.get(i);if(!dentro&&!nm)continue;const ch=nm?nm.ch:cmFilaDe('pq'+g.id,i+3);let [x,y]=slot(i),walk=false,dx=i%2?-1:1,dy=0,prop=null,act=null;
      if(nm&&!dentro){const w=pqAnda(g,nm,i,[x,y],hh,H0,bar);if(!w)continue;x=w.x;y=w.y;dx=w.dx;dy=w.dy;walk=w.walk;if(w.walk){act=null;prop=null;}}
      if(i===3){const per=14,u0=(S.t*.5+i*3)%per,f=u0<per/2?u0/(per/2):2-u0/(per/2),x0=xd-4.4,x1=xd-2.4;x=x0+(x1-x0)*f;walk=true;dx=u0<per/2?1:-1;prop=Q.piquete_octavilla||'📄';}
      else if(i===0||i===1){dx=i===0?1:-1;act='cheer';}
      if(!vis(x,y))continue;const [u,v]=cmW2V(x,y),X=x,Y=y,DX=dx,DY=dy,W=walk,A=act,PR=prop;
      out.push({d:cmDF(g.id,u,v),f:()=>cmFigura(X,Y,DX,DY,ch,{walk:W,ph:tt*5+i,vest:true,act:A,prop:PR,edad:30,name:nm?nm.n:null,rot:nm&&nm.v?{hogar:nm.v.hogar,trab:false}:null})});}
    // pancarta entre los dos primeros y banderas
    if(dentro){const [ua,va]=cmW2V(xd-5.0,y1+.45),[ub,vb]=cmW2V(xd-1.9,y1+.45);const b0=xd-5.0+.15,b1=xd-1.9-.15;
      if(vis((b0+b1)/2,y1+.45))out.push({d:cmDF(g.id,(ua+ub)/2,(va+vb)/2)+.04,f:()=>pqPancarta(b0,b1,y1+.45,tt,g.gs?cmT('piquete_pancarta_gs'):cmT('piquete_pancarta'),g.mio&&S.office?cmT('piquete_pancarta_de',{lugar:S.office.n}):null)});}
    if(dentro)for(const [i,col,txt] of [[2,'#c0262d','✊'],[6,'#2a6fd1',cmT('piquete_bandera')]]){if(i>=g.nP)continue;const [x,y]=slot(i);if(!vis(x,y))continue;const [u,v]=cmW2V(x,y);out.push({d:cmDF(g.id,u,v)+.02,f:()=>pqBandera(x+.15,y,col,tt,i,txt)});}
    // la policía, en la acera de enfrente
    if(g.cops&&dentro){const ye=cmEnfrente(g.id);if(ye!=null)for(const [i,dxp] of [[0,-.9],[1,1.3]]){const x=xd+dxp,y=ye;if(!vis(x,y))continue;const [u,v]=cmW2V(x,y),ch={...cmFilaDe('pol'+g.id,i+7),pants:'#1d2a44',style:'rapado'};
      out.push({d:u+v,f:()=>cmFigura(x,y,0,-1,ch,{walk:false,shirt:'#1d2a44',edad:35})});}}
  }
  return out;}
// ---------- COLAS ----------
function cmColaDef(id){return (cmCfg().colas||{})[id]&&typeof (cmCfg().colas||{})[id]==='object'?cmCfg().colas[id]:null;}
function cmColaLen(id,h){const d=cmColaDef(id);if(!d)return 0;let wd=dateOf(S.day).wd;try{wd=bmDiaEf(S.day);}catch(e){}if(d.dias&&!d.dias.includes(wd))return 0;
  for(const [a,b] of d.franjas||[])if(h>=a&&h<b){const ramp=Math.min(1,(h-a)/.5+.3,(b-h)/.5+.3),L=(d.base+(W_().crisis||0)*d.k)*ramp+(pbH('cl'+id+S.day)-.5)*1.4;return Math.max(0,Math.min(d.max,Math.round(L)));}
  return 0;}
const cmColaS=(d,t)=>t/d.T;                                // puestos servidos hasta el minuto t (S.t)
const cmColaX=(xd,p)=>xd-.55-p*.85;                         // dónde está el puesto p (0 = la puerta)
function cmColaPos(g){const q=cmPuertaPts(g.id);return q?[cmColaX(q.xd,g.p),q.y1+.55]:null;}
// el estado de quien la hace ahora: null o {id, p, tau, q, join}
function cmColaMia(f){const s=S.sim,tr=s.tr;if(!tr||!(tr.cq>0)||!f||f.k!=='dentro'||!cmColaDef(s.dest))return null;const tau=f.t0-tr.cq0;if(tau<0||tau>=tr.cq)return null;
  return {id:s.dest,tau,q:tr.cq,L:tr.cqL,T:tr.cqT,p:tr.cqL*(1-tau/tr.cq)+(tr.cqL?0:0),rest:Math.max(1,Math.ceil(tr.cq-tau))};}
const cmEnCola=()=>{const s=S.sim;if(!(s.work>0)||!s.tr||!(s.tr.cq>0))return false;const f=cmFase();return !!cmColaMia(f);};
function colaItems(bar,tt,vis){const out=[],h=S.t/60,s=S.sim,f=s.work>0?cmFase():null,mia=cmColaMia(f);
  for(const id of Object.keys(cmCfg().colas||{})){const d=cmColaDef(id);if(!d||!cdPuerta(id)||cdBarrioDe(id)!==bar)continue;const q=cmPuertaPts(id);if(!q)continue;
    let L=cmColaLen(id,h);const yo=q.y1+.55,sv=cmColaS(d,S.t);let jme=null;
    if(mia&&mia.id===id){L=Math.max(L,mia.L);jme=s.tr.cqj;}
    if(L<1&&jme==null)continue;
    const j0=Math.ceil(sv-1e-9),j1=Math.floor(sv+L);
    for(let j=j0;j<=j1;j++){const p=j-sv;if(jme!=null&&Math.abs(j-jme)<.6)continue;const x=cmColaX(q.xd,p);if(!vis(x,yo))continue;
      const al=Math.max(0,Math.min(1,p<1?p:p>L-1?L-p:1));if(al<=.02)continue;const ch=cmFilaDe(id,((j%24)+24)%24),[u,v]=cmW2V(x,yo);
      out.push({d:cmDF(id,u,v),f:()=>{ctx.save();ctx.globalAlpha=al;cmFigura(x,yo,1,0,ch,{walk:false,edad:35});ctx.restore();}});}
  }
  return out;}
// el personaje en la cola: primero va hasta el final de la fila andando; luego avanza con ella
function cmColaPosMia(m){const s=S.sim,tr=s.tr,q=cmPuertaPts(m.id);if(!q)return null;const d=cmColaDef(m.id);
  const jme=tr.cqj,sv=cmColaS(d,S.t),p=Math.max(0,jme-sv),[x,y]=[cmColaX(q.xd,p),q.y1+.55],dist=Math.abs(x-q.xd),tj=Math.min(m.q*.5,dist*.06);
  if(m.tau<tj&&dist>.5){const k=m.tau/tj;return {x:q.side[0]+(x-q.side[0])*k,y:q.side[1]+(y-q.side[1])*k,dx:-1,dy:0,walk:true,txt:cmT('cola_pastilla',{lugar:(d.el||bmName(m.id)),min:m.rest})};}
  return {x,y,dx:1,dy:0,walk:false,txt:cmT('cola_pastilla',{lugar:(d.el||bmName(m.id)),min:m.rest})};}
// al llegar a un sitio con cola: se pone a la cola, el tiempo de cola se suma a su salida
function cmColaTick(f){const s=S.sim,tr=s.tr;if(!tr||tr.cq!=null||f.k!=='dentro')return;const k=s.outingActive;if(!k||!(cmCfg().colas_outs||[]).includes(k)||s.dest==='_punto')return;
  const id=cmDest(s.dest),d=cmColaDef(id);if(!d){tr.cq=0;return;}const L=cmColaLen(id,S.t/60),q=Math.round(L*d.T);tr.cq=q;tr.cq0=Math.max(0,f.t0);tr.cqL=L;tr.cqT=d.T;
  if(q>0){tr.cqj=Math.ceil(cmColaS(d,S.t)+L)+.0;s.work+=q;s.awayTotal+=q;toast(cmT('cola_toast',{n:CH().name,lugar:d.el||bmName(id),min:q}));}}
// ---------- RIDERS ----------
// la tanda: recoge en un bar, el súper o el mercado y entrega en 2-3 portales de su barrio y de los vecinos (solo a pie y por los pasos); vuelve a recoger. Todo sale de (día, vivienda, puertas del censo)
const RD={k:'',plan:null};
const rdPie=R=>!!R&&R.legs.every(l=>l.k==='pie'||(l.k==='viaje'&&l.paso));
function rdPlan(tot){const key=S.day+'|'+cmHome()+'|'+Math.round(tot);if(RD.k===key)return RD.plan;RD.k=key;RD.plan=null;
  const Q=cmCfg(),cands=(Q.reparto_recogidas||['bar','super']).filter(k=>cdPuerta(k)&&cdBarrioDe(k)),mx=Q.reparto_max_min||14;
  const eds=Object.keys((DATA.personas&&DATA.personas.edificios)||{}).concat(['casaV','casa2']).filter(k=>cdPuerta(k)&&cdBarrioDe(k)).sort();if(!cands.length||!eds.length)return null;
  const segs=[];let t=0,pos='casa',n=0;
  for(let i=0;i<14;i++){const opts=cands.filter(c=>rdPie(cmRuta(pos,c)));if(!opts.length)break;
    const pk=opts[Math.floor(pbH('rp'+S.day+i)*opts.length)%opts.length],R0=cmRuta(pos,pk),tmp=[];let t1=t;
    const push=(kind,a,R,min,ex)=>{tmp.push({kind,a,R,t0:t1,t1:t1+min,...ex});t1+=min;};
    push('camino',pos,R0,Math.max(.1,R0.min),{txt:'reparto_camino',lugar:pk});push('recoge',pk,null,2,{lugar:pk});
    const nd=2+(pbH('rn'+S.day+i)<.5?0:1),pool=eds.filter(e=>{const R=cmRuta(pk,e);return rdPie(R)&&R.min<=mx&&R.min>.8;}).sort((u,v)=>pbH('rs'+S.day+i+u)-pbH('rs'+S.day+i+v));let from=pk,dn=0;
    for(const e of pool){if(dn>=nd)break;const R=cmRuta(from,e);if(from===e||!rdPie(R)||R.min>mx)continue;
      push('camino',from,R,Math.max(.1,R.min),{txt:'reparto_camino',lugar:e});push('entrega',e,null,1.5,{lugar:e});from=e;dn++;}
    const Rv=cmRuta(from,pk);if(!dn||!rdPie(Rv)){if(segs.length)break;else continue;}
    push('vuelve',from,Rv,Math.max(.1,Rv.min),{txt:'reparto_vuelve',lugar:pk});
    const home=cmRuta(pk,'casa');if(segs.length&&t1+(home?home.min:0)>tot+1)break;
    for(const z of tmp)segs.push(z);t=t1;pos=pk;n+=dn;}
  if(!segs.length)return null;
  if(pos!=='casa'){const R=cmRuta(pos,'casa');if(R&&rdPie(R))segs.push({kind:'casa',a:pos,R,t0:t,t1:t+Math.max(.1,R.min),txt:'reparto_casa',lugar:'casa'});}
  // lo que sobra de jornada se queda esperando pedidos en los puntos de recogida
  const fin=segs[segs.length-1].t1,rec=segs.filter(z=>z.kind==='recoge'),slack=Math.max(0,tot-fin-1);
  if(slack>0&&rec.length){let acc=0;for(const z of segs){const d=z.t1-z.t0;z.t0+=acc;if(z.kind==='recoge')acc+=slack/rec.length;z.t1=z.t0+d+(z.kind==='recoge'?slack/rec.length:0);}}
  let k=0;for(const z of segs)if(z.kind==='entrega')z.n=++k;
  return RD.plan={segs,n:k,fin:segs[segs.length-1].t1};}
// dónde está a los `el` minutos de empezar
function rdPos(el,tot){const P0=rdPlan(tot);if(!P0)return null;const L=P0.segs,sg=L.find(z=>el>=z.t0&&el<z.t1)||(el>=L[L.length-1].t1?L[L.length-1]:L[0]),done=L.filter(z=>z.kind==='entrega'&&z.t1<=el).length;
  const f=sg.t1>sg.t0?Math.max(0,Math.min(1,(el-sg.t0)/(sg.t1-sg.t0))):1;
  if(sg.R){const {i,lf}=cmEnRuta(sg.R,f),l=sg.R.legs[i];
    if(l.k==='pie'){const p=cmAlong(l.pts,lf);return {b:l.b,x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:l.pts.length>1,vis:true,leg:l,seg:sg,done,tot:P0.n};}
    if(l.k==='espera')return {b:l.b,x:l.p[0],y:l.p[1],dx:0,dy:-1,walk:false,vis:true,txt:l.txt,leg:l,seg:sg,done,tot:P0.n};
    return {b:l.b,x:l.at[0],y:l.at[1],dx:0,dy:1,walk:false,vis:false,viaje:true,txt:l.txt,leg:l,seg:sg,done,tot:P0.n};}
  const q=cmPuertaPts(sg.a);if(!q)return null;
  return {b:cdBarrioDe(sg.a),x:q.side[0]+(sg.kind==='entrega'?.6:-.6),y:q.side[1]+.1,dx:0,dy:-1,walk:false,vis:true,seg:sg,done,tot:P0.n,quieto:true};}
const rdNom=k=>{const e=DATA.barrio&&DATA.barrio.edificios&&DATA.barrio.edificios[k];return (e&&e.rotulo)||bmName(k);};
function rdTxt(p){if(!p||!p.seg)return null;const sg=p.seg,Q=cmCfg(),n=p.done,ent=n===1?Q.reparto_ent_1:Q.reparto_ent_n,lug=sg.lugar==='casa'?'':rdNom(sg.lugar);
  const que=sg.kind==='recoge'?cmT('reparto_recoge',{lugar:lug}):sg.kind==='entrega'?cmT('reparto_entrega',{lugar:lug}):sg.kind==='casa'?cmT('reparto_casa'):cmT(sg.txt||'reparto_camino',{lugar:lug});
  return cmT('reparto_pastilla',{que,n,ent});}
const rdColor=()=>{const c=cmCfg().reparto_colores||['#1fb59a'],cos=(DATA.profesiones&&DATA.profesiones.sectores&&DATA.profesiones.sectores.reparto&&DATA.profesiones.sectores.reparto.cos)||[],i=S.office&&S.office.n?cos.indexOf(S.office.n):-1;return c[(i<0?0:i)%c.length];};
// la mochila cúbica de reparto: un cubo de color a la espalda (de espaldas, sobre el torso; de frente, asoma por detrás del hombro)
function cmMochila(px,py,front,right,col){ctx.save();const w=11,h=12,x0=front?px+(right?-w-1:1):px-w/2,y0=py-42;ctx.fillStyle=col;ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x0,y0,w,h,2);else ctx.rect(x0,y0,w,h);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(x0+1.5,y0+4.5,w-3,1.6);ctx.restore();}

// ---------- manifestación: sale del ayuntamiento y recorre su calle en grupo ----------
// el recorrido: de la puerta del ayuntamiento hasta el otro extremo de su calle
const MF={k:'',z:null};
function mfTrazo(){const k=S.day+'|'+cmHome();if(MF.k===k)return MF.z;MF.k=k;MF.z=null;
  try{if(!cdPuerta('ayto'))return null;const bar=cdBarrioDe('ayto'),q=cdPuerta('ayto'),c=cmCalle(bar,q.p,true);if(!c)return null;
    const far=(q.p[0]-c.a[0]<c.b[0]-q.p[0])?c.b[0]-3:c.a[0]+3,fin=[bar,Math.round(far*10)/10,c.a[1]],R=cmRuta('ayto',fin);if(!R||!R.legs[0].pts)return null;MF.z={bar,pts:R.legs[0].pts,fin,calle:c.n||''};}catch(e){console.error('manif',e);}
  return MF.z;}
// el personaje va a la manifestación: la marcha sale cuando él llega (si es después de las 11:15) y él va dentro
const mfActiva=()=>{const s=S.sim,m=W_().manif;return s.outingActive==='manifestacion'&&s.work>0&&!!m&&m.day===S.day&&s.dest==='ayto';};
function mfReloj(){const H=cmCfg().manif_horas||[11.25,13],h=S.t/60;let hS=H[0],lim=H[1];
  if(mfActiva()){const f=cmFase();if(f&&f.k==='dentro'){hS=Math.max(H[0],h-f.t0/60);lim=h+1;}else if(f&&f.k==='vuelta'){hS=h-(H[1]-H[0])-.01;lim=h+.5;}else{hS=Math.max(H[0],h)+.05;lim=hS+(H[1]-H[0]);}}
  return {hS,M:H[1]-H[0],ini:H[0],fin:lim,h};}
const mfFrac=r=>Math.max(0,Math.min(1,(r.h-r.hS)/r.M));
const mfLugar=(pts,f,k)=>cmAlong(pts,Math.max(0,Math.min(1,f*1.08-k*.016)));
function mfPos(){const z=mfTrazo();if(!z)return null;const r=mfReloj(),f=mfFrac(r),p=mfLugar(z.pts,f,4);
  return {b:z.bar,x:p.x,y:p.y+.55,dx:p.dx||1,dy:0,walk:f>0&&f<.97,calle:z.calle};}
function mfItems(bar,tt,vis){const w=W_(),m=w.manif,R=mfReloj(),h=R.h;if(!m||m.day!==S.day||!(h>=R.ini&&h<R.fin)||!cdPuerta('ayto')||cdBarrioDe('ayto')!==bar)return [];
  const z=mfTrazo();if(!z)return [];const pts=z.pts,f=mfFrac(R),n=10,out=[],lemas=cmCfg().manif_lemas||['BASTA YA'],lema=lemas[Math.floor(pbH('mf'+S.day)*lemas.length)%lemas.length];
  const at=k=>mfLugar(pts,f,k),yo=mfActiva();
  for(let k=0;k<n;k++){if(yo&&k===4)continue;const p=at(k),y=p.y+(k%3===1?.55:0),x=p.x;if(f*1.08-k*.016<0||!vis(x,y))continue;const [u,v]=cmW2V(x,y),ch=cmFilaDe('mf',k+11);
    out.push({d:u+v,f:()=>cmFigura(x,y,p.dx||1,0,ch,{walk:f>0&&f<.97,ph:tt*7+k,vest:k%3===0,act:k===2||k===5?'cheer':null,edad:30})});}
  const a=at(0),b=at(1);if(vis(a.x,a.y)){const [u,v]=cmW2V((a.x+b.x)/2,a.y);out.push({d:u+v+.05,f:()=>pqPancarta(Math.min(a.x,b.x)+.2,Math.max(a.x,b.x)-.2,a.y,tt,lema,null)});}
  return out;}
// la vuelta a casa sale del final de la marcha, no de la puerta del ayuntamiento
{const _rf=cmRutaF;cmRutaF=function(f,fin){const r=_rf.apply(this,arguments);try{if(mfActiva()&&f.k==='vuelta'&&r&&r.from===fin&&f.tr.turn==null){const z=mfTrazo();if(z)r.from=z.fin;}}catch(e){}return r;};}
// todo lo que se agrupa en la acera de un barrio
function cmAcera(bar,tt){const vis=(x,y)=>{const [u,v]=cmW2V(x,y),[px,py]=P(u,v),sx=cam.x+px*cam.z,sy=cam.y+py*cam.z;return sx>-60&&sx<W+60&&sy>-110&&sy<H+60;},out=[];
  try{for(const it of pqItems(bar,tt,vis))out.push(it);}catch(e){console.error('piquete',e);}
  try{for(const it of colaItems(bar,tt,vis))out.push(it);}catch(e){console.error('cola',e);}
  try{for(const it of mfItems(bar,tt,vis))out.push(it);}catch(e){console.error('manif',e);}
  return out;}
