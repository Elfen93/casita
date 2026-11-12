// =================== ESCUELA: colegio público, colegio concertado e instituto ===================
const {escuela:TX_escuela}=DATA.textos_mods_ag;
// Quién está en cada centro (vecinosEn), las tres escenas (entrada/salida, recreo, clase) y dos salidas: recoger del cole y la tutoría.
const esR=s=>pbH(Math.floor(pbH(String(s))*4294967296).toString(36)+'~'+s); // el hash de poblacion se parece demasiado entre cadenas casi iguales
const esPick=(a,k)=>a[Math.floor(esR(k)*a.length)%a.length];
const ESC_K=['colegio','concertado','instituto'];
const ESC_T={colegio:{ent:[8.5,9.1],cl1:[9.1,11],rec:[11,11.5],cl2:[11.5,13.75],sal:[13.75,14.4],com:[14.4,15.75],sal2:[15.75,16.4]},
  concertado:{ent:[8.25,9.1],cl1:[9.1,11],rec:[11,11.5],cl2:[11.5,13.75],sal:[13.75,14.9],com:[14.9,15.75],sal2:[15.75,16.4]},
  instituto:{ent:[8,8.6],cl1:[8.6,11],rec:[11,11.5],cl2:[11.5,14.25],sal:[14.25,14.9]}};
const escLect=wd=>wd<5&&!festivo(S.day);
const escOcupada=(a,h,wd)=>{const t=a.trabajo;if(t&&Array.isArray(t.h)&&pbIn(t.h[0],t.h[1],h)&&pbDia(t.dias,wd))return true;return (a.donde||[]).some(d=>d&&pbIn(d[1],d[2],h)&&pbDia(d[3],wd));};
const escLibres=(hogar,h,wd)=>pbVec().filter(a=>a&&a.hogar===hogar&&pbAdult(a)&&!escOcupada(a,h,wd));
const escComedor=(v,wd)=>v.estudia==='cole'&&(esR(v.id+'cm')<.5||!escLibres(v.hogar,14.1,wd).length);
const escEntra=v=>v.estudia==='instituto'?8.25:8.75;
const escSale=(v,wd)=>v.estudia==='instituto'?14.75:escComedor(v,wd)?16.25:14.25;
const escPresente=(v,h,wd)=>!!v.centro&&(v.estudia==='cole'||v.estudia==='instituto')&&h>=escEntra(v)&&h<escSale(v,wd);
{const _ve=vecinosEn;vecinosEn=function(lugar,hora,wd){let out=_ve.apply(this,arguments);
  try{const lect=escLect(wd);
    out=out.filter(q=>{const v=q.v;if(lect&&v.centro&&escPresente(v,hora,wd))return false;if(!lect&&wd<5&&q.motivo==='trabajo'&&ESC_K.includes(lugar))return false;return true;});
    if(lect&&ESC_K.includes(lugar)){const ya=new Set(out.map(q=>q.v.id));
      for(const v of pbVec()){if(v&&v.centro===lugar&&escPresente(v,hora,wd)&&!ya.has(v.id)){out.push({v,motivo:'clase'});ya.add(v.id);}}
      for(const v of pbVec()){if(!v||v.centro!==lugar||v.estudia!=='cole')continue;const dep=escComedor(v,wd)?16:14;if(hora<dep-.2||hora>=dep+.25)continue;
        for(const a of escLibres(v.hogar,hora,wd)){if(!ya.has(a.id)){out.push({v:a,motivo:'recoger'});ya.add(a.id);}}}}
  }catch(e){console.error(e);}
  return out;};}
// ---- sus criaturas: qué centro les toca, quién cuenta como criatura en edad escolar ----
const esKD=k=>{k.hap=k.hap??70;k.sick=k.sick||0;k.play=k.play||0;return k;};
const esKids=(a0,a1)=>(S.kids||[]).map(esKD).filter(k=>{const a=kidAge(k);return a>=a0&&a<=a1;});
function esCentroDe(k){const a=kidAge(k);
  if(k.centro)return k.centro==='concertado'?'concertado':a>=12?'instituto':'colegio'; // lo elegido (dilema cr_cole); sin elegir, lo de siempre
  const H=HOMES[(S.home&&S.home.type)||'casita'],c=H&&typeof H.cls==='number'?H.cls:1;
  if(c>=3||(c===2&&esR(k.n+'|'+k.born)<.5))return 'concertado';return a>=12?'instituto':'colegio';}
const esKid=(a0,a1)=>esKids(a0,a1).find(k=>!k.sick&&k.huelga!==S.day)||null;
conLogica(OUT,{
  cole:{req:()=>!festivo(S.day)&&!!esKid(3,11)},
  tutoria:{req:()=>!festivo(S.day)&&esKids(3,16).some(k=>!k.sick&&!(k.tutDay&&S.day-k.tutDay<30))}});
{const _d=destOf;destOf=function(k){if(k==='cole'){const q=esKid(3,11)||esKids(3,11)[0];if(q)return esCentroDe(q);}
  if(k==='tutoria'){const q=esKids(3,16).find(z=>!z.sick&&!(z.tutDay&&S.day-z.tutDay<30))||esKids(3,16)[0];if(q)return esCentroDe(q);}
  return _d.apply(this,arguments);};}
{const _oc=outCost;outCost=function(k){if(k==='cole'||k==='tutoria')return 0;return _oc.apply(this,arguments);};}
// a quién se recoge hoy (queda en la salida para que la escena y el regreso hablen de la misma criatura)
{const _go=goOut;goOut=function(k){if(k==='cole'||k==='tutoria'){const q=k==='cole'?esKid(3,11):esKids(3,16).find(z=>!z.sick&&!(z.tutDay&&S.day-z.tutDay<30));S.sim.escKid=q?(S.kids||[]).indexOf(q):-1;}return _go.apply(this,arguments);};}
const esPub=k=>k==='colegio'||k==='instituto';
{const _ob=outBack;outBack=function(k){const r=_ob.apply(this,arguments);
  if(k!=='cole'&&k!=='tutoria')return r;
  try{const ks=S.kids||[];let q=ks[S.sim.escKid];if(!q||kidAge(q)<3)q=k==='cole'?esKid(3,11):esKids(3,16)[0];if(!q)return r;esKD(q);const n=CH().name,e=q.g==='f'?TX_escuela.pron_ella:TX_escuela.pron_el,c=esCentroDe(q);
    q.play++;S.needs.social=Math.min(100,S.needs.social+4);
    if(k==='cole'){q.hap=Math.min(100,q.hap+4);q.recDay=S.day;q.recT=S.t;const pu=colPuerta(c,q);
      const ext=' '+(esPub(c)?pickR(TX_escuela.cole_ext_publico):pickR(TX_escuela.cole_ext_concertado));
      tell(pickR(TX_escuela.cole_sale.map(t=>huecos(t,{k:q.n,n,e,ext})))+(pu?' '+pu:''),'🎒');}
    else{q.hap=Math.min(100,q.hap+5);q.tutDay=S.day;
      const ext=' '+(esPub(c)?pickR(TX_escuela.tutoria_ext_publico):pickR(TX_escuela.tutoria_ext_concertado));
      tell(pickR(TX_escuela.tutoria.map(t=>huecos(t,{k:q.n,n,e,muy:q.g==='f'?TX_escuela.muy_lista:TX_escuela.muy_listo,ext}))),'🍎');}
  }catch(e){console.error(e);}return r;};}
// al recogerlo, la criatura vuelve a casa con quien la recoge (crianza.js la manda fuera hasta las 17)
{const _ur=updateResidents;updateResidents=function(gm){const r=_ur.apply(this,arguments);
  try{for(const rs of S.res||[]){if(rs.kind!=='kid'||!rs.away)continue;const k=(S.kids||[])[rs.kid];if(k&&k.recDay===S.day&&S.t>=k.recT){rs.x=rs.away.back[0];rs.y=rs.away.back[1];rs.away=null;}}}catch(e){}return r;};}
// =================== escenas ===================
const eqY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
const eqX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
function eTxt(txt,x,y,z,col,sz,pl){const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,pl==='x'?-.5:.5,0,1,0,0);ctx.fillStyle=col;ctx.font=`900 ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,0,0);ctx.restore();}
function esLook(i,adult,age){const f=esR(i+'g')<.5;return {name:null,g:f?'f':'m',skin:esPick(SKINS,i+'s'),hair:adult&&age>=55?'#bdbdbd':esPick(HAIRCOLS.slice(0,6),i+'h'),
  style:f?esPick(adult?['melena','coleta','corto','mono']:['melena','coleta','rizos','coleta'],i+'y'):esPick(['corto','rapado','rizos','corto'],i+'y'),beard:!f&&adult&&esR(i+'b')<.3?'corta':'no',glasses:esR(i+'gl')<(adult?.25:.1),
  build:esPick(['media','delgada','ancha'],i+'c'),shirt:esPick(SHIRTC,i+'t'),pants:esPick(PANTSC,i+'p'),eyes:'#3b2a20'};}
const ES_BAG=['#e63946','#2a9d8f','#f4a261','#3a86ff','#9b5de5','#ffbe0b','#06d6a0'];
function esFig(x,y,ch,age,o={}){const sc=Math.min(1,pbEscala(age)*(o.k||1)),[px,py]=P(x,y);const c=o.uni?{...ch,shirt:'#2c3e7a',pants:'#7f8794'}:ch;const front=o.front??true,right=o.right??true;
  ctx.save();ctx.translate(px,py);ctx.scale(sc,sc);ctx.translate(-px,-py);
  const bc=o.bag?ES_BAG[Math.floor(esR(String(o.bag))*ES_BAG.length)]:null;
  if(bc&&front){ctx.fillStyle=bc;ctx.fillRect(px+(right?-9:5),py-37,6,13);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(px+(right?-9:5),py-29,6,5);}
  sPerson(x,y,c,{pose:o.pose||'stand',act:o.act,front,right,ph:o.ph,mood:o.mood});
  if(bc&&!front){ctx.strokeStyle=shade(bc,.7);ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(px,py-39,2.6,Math.PI,0);ctx.stroke();ctx.fillStyle=bc;ctx.beginPath();roundRect(px-5.5,py-39,11,15,3);ctx.fill();ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();roundRect(px-4,py-31,8,6,2);ctx.fill();}
  if(o.cig){const s=right?1:-1;capsule(px+s*7,py-26,px+s*13,py-28,1.3,'#fffdf8');circ(px+s*13.5,py-28,1,'#ff5a3c');}
  ctx.restore();
  if(o.cig){const tt=o.tt||0;for(let k=0;k<3;k++){const u=((tt*.5+k/3)%1);ctx.fillStyle=`rgba(210,210,215,${.5*(1-u)})`;ctx.beginPath();ctx.arc(px+(right?1:-1)*(12+u*4+Math.sin(tt+k)*2),py-30*sc-u*18,1.6+u*2.6,0,7);ctx.fill();}}
  if(o.ball){const [bx,by]=P(x+(o.ball[0]||0),y+(o.ball[1]||0));emoji('⚽',bx,by-3,9);}
  if((o.name||o.puesto)&&!(typeof rotular==='function'&&rotular(o.name||o.puesto,o.name?o.puesto:null))){ctx.save();ctx.globalAlpha=.88;const ny=py-(o.pose==='sit'?52:64)*sc-(o.puesto?9:0);if(o.name)label(o.name,px,ny,'rgba(255,253,248,.92)','#3b3247',8);if(o.puesto)label(o.puesto,px,ny+9,'rgba(255,240,200,.92)','#5a3a22',6);ctx.restore();}}
const esPuesto=v=>{const p=v.trabajo&&v.trabajo.puesto;return Array.isArray(p)?(v.g==='f'?p[0]:p[1]||p[0]):null;};
function esSpot(seed,taken,x0,x1,y0,y1,gap){for(let t=0;t<30;t++){const x=x0+esR(seed+'x'+t)*(x1-x0),y=y0+esR(seed+'y'+t)*(y1-y0);if(taken.every(q=>Math.hypot(q[0]-x,q[1]-y)>gap)){taken.push([x,y]);return [x,y];}}return null;}
function esMoment(key,h,lect,act){if(act==='tutoria')return 'tutoria';if(act==='cole')return 'salida';if(!lect)return 'cerrado';const T=ESC_T[key];
  const w=(r)=>h>=r[0]&&h<r[1];if(w(T.ent))return 'entrada';if(w(T.cl1)||w(T.cl2))return 'clase';if(w(T.rec))return 'recreo';if(w(T.sal)||(T.sal2&&w(T.sal2)))return 'salida';if(T.com&&w(T.com))return 'comedor';return 'cerrado';}
function esFecha(){const d=dateOf(S.day);return `${d.dm} de ${(DATA.reglas.meses[d.m]||'').toLowerCase()}`;}
const esRain=()=>{const w=(S.weather||{}).k;return w==='lluvia'||w==='tormenta';};

function escPatio(key,E,m,L){const {tt,night}=E;const W=12,D=9,FY=6.2;const pub=key==='colegio',con=key==='concertado',ins=key==='instituto';const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const h=S.t/60,cerr=m==='cerrado';const fac=pub?'#e6c88e':con?'#efe6d4':'#c5d0da',acc=pub?'#b5543c':con?'#2c3e7a':'#4a7aa8',asf=pub?'#8d9096':con?'#b7b1a3':'#9a9ea4';
  const dx0=ins?6:1.8,dx1=ins?8:3.8,gx0=5.6,gx1=7.8;const rain=esRain();
  const nombre=pub?'COLEGIO PÚBLICO LA RIBERA':con?'COLEGIO SAN ROQUE':'INSTITUTO LAS ERAS';
  const lamp=night>.3||h<7.5||h>=18;const cx0=con?9.4:ins?9.2:.25,cx1=cx0+(pub?1.2:1.5);
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,FY,0,asf);
    if(con){topQuad(.5,1.2,2.9,5.7,.05,'#86b86a');topQuad(9.2,3.2,11.5,5.7,.05,'#86b86a');ctx.strokeStyle='rgba(60,120,50,.35)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<6;k++){ctx.moveTo(...P(.5+k*.4,1.2,.05));ctx.lineTo(...P(.5+k*.4,5.7,.05));}ctx.stroke();}
    // pista
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.2;const pl=[[3.3,1.7],[8.3,1.7],[8.3,5.3],[3.3,5.3]];ctx.beginPath();pl.forEach(([x,y],i)=>{const [a,b]=P(x,y,.1);i?ctx.lineTo(a,b):ctx.moveTo(a,b);});ctx.closePath();ctx.moveTo(...P(5.8,1.7,.1));ctx.lineTo(...P(5.8,5.3,.1));ctx.stroke();
    ctx.beginPath();for(let a=0;a<=6.4;a+=.2){const [px,py]=P(5.8+Math.cos(a)*.9,3.5+Math.sin(a)*.9,.1);a?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
    // acera y calzada
    topQuad(0,FY,W,8.3,0,'#d3cbbb');ctx.strokeStyle='rgba(120,110,90,.25)';ctx.lineWidth=.7;ctx.beginPath();for(let k=1;k<W;k+=.6){ctx.moveTo(...P(k,FY));ctx.lineTo(...P(k,8.3));}for(let y=FY+.55;y<8.3;y+=.55){ctx.moveTo(...P(0,y));ctx.lineTo(...P(W,y));}ctx.stroke();
    sBox(0,8.3,W,8.5,-1,2,'#a8a196');topQuad(0,8.5,W,D,-1,'#585c63');ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(...P(0,8.78,-1));ctx.lineTo(...P(W,8.78,-1));ctx.stroke();ctx.setLineDash([]);
    // fachada
    const WH=66;sBox(0,-.15,W,0,0,WH,fac);eqY(0,W,0,0,5,shade(fac,.86));eqY(0,W,0,WH-12,WH,acc);eqY(0,W,0,WH,WH+3,shade(acc,.8));
    eTxt(nombre,W/2,0,WH-6,'#fffdf8',ins?6.4:pub?6:6.4,'y');
    const sky=night>.5?'#2c3558':rain?'#9aa8b5':'#bfe3f7';
    for(const [a,b] of [[.6,2],[2.7,4.1],[4.8,6.2],[6.9,8.3],[9,10.4],[10.9,11.7]]){eqY(a-.08,b+.08,0,34,52,shade(fac,.7));eqY(a,b,0,35,51,sky);eqY((a+b)/2-.03,(a+b)/2+.03,0,35,51,shade(fac,.7));}
    // puerta
    sBox(dx0-.2,.0,dx1+.2,.6,0,3,'#b9b3a6');eqY(dx0-.12,dx1+.12,0,0,32,shade(acc,.7));eqY(dx0,dx1,0,0,30,cerr||night>.5?'#3b3f46':'#8fb7cf');eqY((dx0+dx1)/2-.04,(dx0+dx1)/2+.04,0,0,30,'#2b2b33');
    if(cerr){for(let z=4;z<30;z+=5)eqY(dx0,dx1,0,z,z+.7,'#6f747c');}
    // conserjería
    {eqY(cx0-.1,cx1+.1,0,13,29,shade(fac,.6));eqY(cx0,cx1,0,14,28,lamp?'#ffd978':(night>.5?'#2c3558':'#a9c9d8'));eTxt('CONSERJERÍA',(cx0+cx1)/2,0,10.3,'#5a4a3a',2.4,'y');}
    // muro izquierdo
    sBox(-.15,-.15,0,D,0,34,shade(fac,.93));eqX(0,0,D,32,34,shade(fac,.7));
    if(pub){const cols=['#e63946','#f4a261','#2a9d8f','#3a86ff','#ffbe0b','#9b5de5'];for(let k=0;k<6;k++){eqX(0,.5+k*1.0,1.2+k*1.0,6,16+((k*7)%5)*3,cols[k]);}circ(...P(0,6.4,26),0);const [sx,sy]=P(0,2.0,27);circ(sx,sy,5,'#ffd23f');eTxt('LA RIBERA',0,4.2,24,'#2b2533',3,'x');}
    if(con){eqX(0,1,3.6,10,28,'#fffdf8');eTxt('Pastoral',0,2.3,22,'#2c3e7a',3,'x');eTxt('San Roque',0,2.3,17,'#9a4a35',3,'x');}
    if(ins){const cols=['#f4a261','#2a9d8f','#3a86ff','#e63946','#8d99ae'];for(let k=0;k<5;k++){eqX(0,.6+k*1.05,1.5+k*1.05,6,20,cols[k]);}eTxt('GRAFFITI',0,6.6,12,'#ff5a8a',2.6,'x');}
    // fachada: cartel
    if(pub){eqY(4.3,7.5,0,8,40,'#c9a36a');eqY(4.42,7.38,0,9,39,'#f3e6c4');eTxt('AMPA',5.9,0,33,'#c0262d',8,'y');eTxt('Reunión: jueves 17:00',5.9,0,24.5,'#4a3a2a',3.2,'y');eTxt('Faltan voluntarias',5.9,0,19.5,'#4a3a2a',3.2,'y');eTxt('para el comedor',5.9,0,15,'#4a3a2a',3.2,'y');}
    if(con){eqY(4.4,7.3,0,12,38,'#2c3e7a');eqY(4.52,7.18,0,13,37,'#fffdf8');eTxt('CUOTA',5.85,0,32.5,'#2c3e7a',6.6,'y');eTxt('VOLUNTARIA',5.85,0,25.5,'#2c3e7a',5.2,'y');eTxt('85 € al mes',5.85,0,19.5,'#4a3a2a',3.6,'y');eTxt('Pregunte en secretaría',5.85,0,15,'#7a6a5a',2.6,'y');
      sBox(2.7,0,2.9,.2,52,70-4,'#c9a24a');sBox(2.35,0,3.25,.2,60,62,'#c9a24a');}
    if(ins){sBox(.2,0,5.5,.5,0,40,'#7f8794');for(let c=0;c<9;c++){const x=.3+c*.575;for(const [z0,z1] of [[2,20],[21,39]]){eqY(x+.03,x+.53,.5,z0,z1,['#4a7aa8','#e9a23b','#4a7aa8','#6b8f71','#4a7aa8','#c0392b','#4a7aa8','#e9a23b','#6b8f71'][c%9]);eqY(x+.12,x+.44,.5,z1-4,z1-3,'rgba(0,0,0,.35)');eqY(x+.12,x+.44,.5,z1-6,z1-5,'rgba(0,0,0,.35)');eqY(x+.44,x+.5,.5,z0+8,z0+11,'#d5dae0');}}
      eTxt('TAQUILLAS',2.85,.5,43,'#4a7aa8',4,'y');}
  };
  // verja: barrotes finos, para ver a través
  const fenceSeg=(a,b)=>{for(let x=a;x<=b+.01;x+=.7){const [px,py]=P(x,FY);capsule(px,py,px,py-24,1.3,'#4a5058');}const p0=P(a,FY,22),p1=P(b,FY,22);capsule(p0[0],p0[1],p1[0],p1[1],1.2,'#4a5058');const q0=P(a,FY,8),q1=P(b,FY,8);capsule(q0[0],q0[1],q1[0],q1[1],1,'#4a5058');};
  add(3.4,FY+.2,()=>fenceSeg(0,gx0-.1));add(11,FY+.2,()=>fenceSeg(gx1+.1,W));
  add(gx0+.3,FY+.2,()=>{if(cerr){fenceSeg(gx0,gx1);const [px,py]=P((gx0+gx1)/2,FY,14);ctx.strokeStyle='#d5dae0';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(px,py,3,0,7);ctx.stroke();ctx.fillStyle='#e9a23b';ctx.fillRect(px-2.5,py+2,5,4);}else{for(const [x,s] of [[gx0,1],[gx1,-1]]){const a=P(x,FY,22),b=P(x+s*.1,FY-1.1,22),c=P(x+s*.1,FY-1.1,8),d=P(x,FY,8);capsule(a[0],a[1],b[0],b[1],1.1,'#4a5058');capsule(d[0],d[1],c[0],c[1],1,'#4a5058');capsule(b[0],b[1],c[0],c[1],1.1,'#4a5058');}}});
  // pancarta en la verja (pública) y setos (concertado)
  if(pub)add(11.6,FY+.4,()=>{eqY(8.3,11.9,FY+.05,5,25,'#fffdf8');eTxt('HUELGA',10.1,FY+.05,19.5,'#c0262d',6.6,'y');eTxt('EDUCATIVA',10.1,FY+.05,11.5,'#c0262d',5.4,'y');capsule(...P(8.3,FY,25),...P(11.9,FY,25),1,'#9a948a');});
  if(con)for(const [a,b] of [[3.0,5.2],[8.2,11.7]])add(b,FY-.5,()=>{sBox(a,FY-.9,b,FY-.35,0,9,'#4f9a43');sBox(a+.1,FY-.85,b-.1,FY-.4,9,11,'#5daa4e');});
  // barracón (pública)
  if(pub)add(11.6,2.9,()=>{sBox(8.4,.5,11.7,2.9,0,26,'#f4f5f6');sBox(8.3,.4,11.8,3.0,26,29,'#d5d9de');sBox(8.4,.5,11.7,.7,29,31,'#b9bec4');eqY(8.4,11.7,2.9,0,4,'#5b7aa0');for(let x=8.6;x<11.7;x+=.33)eqY(x,x+.04,2.9,0,26,'rgba(90,100,110,.35)');eqY(9.4,10.2,2.9,0,19,'#5b7aa0');eqY(10.5,11.5,2.9,9,19,'#9fc6dc');eqY(8.5,9.2,2.9,9,19,'#9fc6dc');eTxt('PROVISIONAL',10.05,2.9,22.8,'#4a5058',3.6,'y');sBox(9.3,2.9,10.3,3.5,0,2,'#b9b3a6');});
  // fuente
  add(1.4,5.2,()=>{cyl(1.4,5.2,.55,0,5,'#9aa0a8','#bcc3cc');cyl(1.4,5.2,.5,5,5.6,'#7cc8f0','#9ad8ff');cyl(1.4,5.2,.18,5,24,'#9aa0a8','#bcc3cc');const [a,b]=P(1.4,5.2,24);ctx.strokeStyle='#9ad8ff';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a,b);ctx.quadraticCurveTo(a+4,b-6,a+7,b+1);ctx.stroke();});
  // banco, árboles, bicis
  add(1.2,2.3,()=>{sBench(.3,2.2);});
  if(pub)add(11.3,5.4,()=>sTree(11.3,5.4));
  if(con){for(const [x,y] of [[.9,4.2],[11.2,3.4]])add(x,y,()=>sTree(x,y));for(const [x,y,c] of [[.9,5.6,'#ff6b9d'],[2.4,2.1,'#ffd23f'],[10.1,5.5,'#ff6b9d']])add(x,y,()=>{cyl(x,y,.22,0,7,'#b5543c','#c27458');for(let k=0;k<5;k++)circ(...P(x+Math.cos(k*1.3)*.15,y+Math.sin(k*1.3)*.15,10),2.2,c);});}
  if(ins){add(11.3,4.2,()=>{for(let k=0;k<4;k++){const [a,b]=P(10.2+k*.4,4.4);capsule(a,b,a,b-9,1.2,'#7f8794');}sBox(10.1,4.3,11.7,4.5,0,2,'#7f8794');const [a,b]=P(10.6,4.5,2);ctx.strokeStyle='#e63946';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(a,b-4,3.5,0,7);ctx.arc(a+8,b-4,3.5,0,7);ctx.moveTo(a,b-4);ctx.lineTo(a+4,b-10);ctx.lineTo(a+8,b-4);ctx.stroke();});}
  // portería y canasta
  add(3.4,2.9,()=>{for(const y of [2.8,4.2])sBox(2.9,y,3.0,y+.08,0,22,'#f4f1ea');sBox(2.9,2.8,3.0,4.28,22,23.5,'#f4f1ea');});
  add(8.5,3.5,()=>{cyl(8.9,3.5,.06,0,40,'#4a5058');sBox(8.3,3.2,8.4,3.8,34,46,'#f4f1ea');const [a,b]=P(8.4,3.5,35);ctx.strokeStyle='#ff6b3d';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(a-3,b,3.5,1.6,0,0,7);ctx.stroke();});
  // farola
  add(.9,7.4,()=>{const [a,b]=P(.9,7.4);capsule(a,b,a,b-46,1.8,'#3b3f46');circ(a,b-48,3.2,lamp?'#ffe08a':'#c9c3b8');if(lamp){const g=ctx.createRadialGradient(a,b-48,1,a,b-48,40);g.addColorStop(0,'rgba(255,220,140,.5)');g.addColorStop(1,'rgba(255,220,140,0)');ctx.fillStyle=g;ctx.fillRect(a-40,b-90,80,80);}});
  // ---------- gente ----------
  const taken=[[1.4,5.2],[8.9,3.5],[3.2,3.5]];const kids=L.kids,staff=L.staff,padres=L.padres;
  const kfig=(v,x,y,o)=>add(x,y,()=>esFig(x,y,pbLook(v),v.edad,{uni:con,bag:v.id,...o}));
  const ffig=(i,age,x,y,o={})=>add(x,y,()=>esFig(x,y,esLook(i,false,age),age,{uni:con,bag:i,...o}));
  const afig=(i,age,x,y,o={})=>add(x,y,()=>esFig(x,y,esLook(i,true,age),age,{...o}));
  const ages=pub?[3,4,5,6,7,8,9,10,11,8,6,9,10,7,5,11,4,9,8,10]:con?[4,6,8,10,12,14,7,9,11,13,15,8,10,12]:[12,13,14,15,16,17,13,14,15,16,12,17,14,15,13,16,12,14];
  const sx=key+'|'+S.day+'|'+Math.floor(h*2);
  const nF=m==='entrada'?(pub?12:con?9:14):m==='recreo'?(pub?20:con?14:18):m==='comedor'?(pub?6:con?5:0):m==='salida'?(pub?10:con?8:13):0;
  const named=kids.slice(0,Math.min(kids.length,nF));
  const wk=(i,x0,y0,x1,y1,t)=>({x:x0+(x1-x0)*t,y:y0+(y1-y0)*t});
  if(m==='entrada'){const n=Math.max(nF,named.length);const tk=[[1.4,5.2],[8.9,3.5]];
    for(let k=0;k<n;k++){const p=esSpot(sx+'e'+k,tk,2.2,Math.min(W-.8,gx1+2.4),1.8,5.6,.95)||[3+k*.5,4];const [x,y]=p;const v=named[k];
      const o={pose:'walk',ph:tt*5+k,front:false,right:false};if(ins&&k%3===1){o.pose='stand';o.act='phone';o.front=true;}
      if(v)kfig(v,x,y,o);else ffig(sx+k,ages[k%ages.length],x,y,o);}
    for(let k=0;k<3;k++){const x=1.6+k*1.9+esR(sx+'ax'+k)*.6,y=7.0+esR(sx+'ay'+k)*.5;if(!ins){afig(sx+'a'+k,34,x,y,{front:false,right:true,act:k===1?'talk':null});ffig(sx+'ak'+k,5+k,x+.55,y+.05,{front:false,right:true});}else{ffig(sx+'ak'+k,15,x+.3,y,{front:false,right:true,act:'phone'});}}
    if(ins)for(let k=0;k<3;k++){const x=3.9+k*.6,y=7.0+(k%2)*.4;ffig(sx+'sm'+k,16,x,y,{front:true,right:k%2===0,act:k===0?null:'phone',cig:k<2,tt});}}
  else if(m==='recreo'||m==='comedor'){const n=Math.max(nF,named.length);const rolesP=[[4.0,2.6,'ball'],[5.0,3.8,'ball'],[5.9,2.4,'ball'],[6.8,4.3,'ball'],[7.5,3.0,'ball'],[4.4,4.6,'ball'],[2.4,4.6,'fuente'],[2.2,5.5,'fuente'],[2.2,3.2,'talk'],[2.6,3.6,'talk'],[9.6,4.2,'talk'],[10.3,4.5,'talk'],[10.0,5.2,'talk'],[1.0,3.8,'talk'],[1.7,3.3,'talk'],[7.9,5.4,'talk'],[8.5,4.9,'talk'],[6.2,5.5,'walk'],[3.9,5.3,'walk'],[9.2,3.6,'walk']];
    for(let k=0;k<n&&k<rolesP.length;k++){const [x,y,r]=rolesP[k];const v=named[k],ph=(tt*.9+esR(sx+'p'+k)*5)%3;const o={pose:r==='ball'||r==='walk'?'walk':'stand',ph:tt*6+k,front:k%2===0,right:k%3!==0,act:r==='talk'?((ph<1.5)===(k%2===0)?'talk':null):null};
      if(ins&&r==='talk'&&k%2===1)o.act='phone';if(ins&&r==='ball')o.act=null;
      if(k===0&&r==='ball')o.ball=[.5,.3];if(v)kfig(v,x,y,o);else ffig(sx+k,ages[k%ages.length],x,y,o);}}
  else if(m==='salida'){const n=Math.max(nF,named.length);const adHog=new Map();const pad=padres.slice(0,5);
    pad.forEach((a,k)=>{const x=2.6+k*1.55,y=7.1+esR(a.id)*.4;adHog.set(a.hogar,[x,y]);add(x,y,()=>esFig(x,y,pbLook(a),a.edad,{front:false,right:true,name:a.n,act:k%2?'talk':null}));});
    let ok=0;for(let k=0;k<n;k++){const v=named[k];const t=(k+.5)/n;
      if(v&&adHog.has(v.hogar)&&v.edad<12){const [ax,ay]=adHog.get(v.hogar);kfig(v,ax+.65+(ok++%2)*.5,ay+.05,{front:false,right:true});continue;}
      const x=gx0-1.2+t*5.2+(esR(sx+'sx'+k)-.5)*.8,y=4.4+esR(sx+'sy'+k)*1.4+(t>.5?.3:0);
      const o={pose:'walk',ph:tt*5+k,front:true,right:t>.5};if(v)kfig(v,x,y,o);else ffig(sx+k,ages[k%ages.length],x,y,o);}
    if(!ins){for(let k=0;k<4;k++){const x=3.4+k*2.0+esR(sx+'fx'+k)*.8,y=7.6+esR(sx+'fy'+k)*.4;if(adHog.size&&[...adHog.values()].some(q=>Math.hypot(q[0]-x,q[1]-y)<1.3))continue;afig(sx+'f'+k,k===2?70:36,x,y,{front:false,right:k%2===0,act:k%2?'phone':null});}
      if(L.hijo&&L.hijo.f>0){const f=L.hijo.f,x0=gx0+1.1,y0=FY-.3,x1=L.ana.x+.7,y1=L.ana.y+.05,hx=x0+(x1-x0)*f,hy=y0+(y1-y0)*f;add(hx,hy,()=>esFig(hx,hy,L.hijo.ch,L.hijo.age,{uni:con,bag:L.hijo.n,name:L.hijo.n,pose:f<1?'walk':'stand',ph:tt*5,front:true,right:f>=1?false:false}));}}
    else{for(let k=0;k<3;k++){const x=3.9+k*.6,y=7.0+(k%2)*.4;ffig(sx+'sm'+k,16,x,y,{front:true,right:k%2===0,act:k===0?null:'phone',cig:k<2,tt});}}
  }
  // personal
  const prof=staff.filter(v=>(esPuesto(v)||'').match(/maest|profes/));const cons=staff.find(v=>(esPuesto(v)||'')==='conserje');
  if(m==='entrada'||m==='recreo'||m==='comedor'||m==='salida'){
    const pv=prof[0];const px=ins?9.4:4.6,py=ins?2.2:1.6;
    if(m!=='salida'||true){if(pv)add(px,py,()=>esFig(px,py,pbLook(pv),pv.edad,{front:true,right:false,act:'talk',ph:tt*4,name:pv.n,puesto:esPuesto(pv)}));else if(m!=='salida')add(px,py,()=>esFig(px,py,esLook(sx+'pf',true,40),40,{front:true,right:false,act:'talk',ph:tt*4,puesto:ins?'profesor':'maestra'}));}
    const cx=gx0-.5,cy=FY-.7;if(cons)add(cx,cy,()=>esFig(cx,cy,pbLook(cons),cons.edad,{front:true,right:true,name:cons.n,puesto:'conserje'}));else if(!ins&&key!=='concertado')add(cx,cy,()=>esFig(cx,cy,esLook(sx+'cj',true,50),50,{front:true,right:true,puesto:'conserje'}));
  }
  const ana=L.ana||{x:9.6,y:7.5,pose:'stand',front:false,right:false,act:null};
  const after=()=>{if(rain){ctx.fillStyle='rgba(120,135,150,.14)';ctx.fillRect(-2000,-2000,4000,4000);ctx.strokeStyle='rgba(60,80,110,.5)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<26;k++){const [a,b]=P(esR('r'+k)*W,esR('rr'+k)*D,0);const u=(tt*.9+esR('q'+k))%1;ctx.moveTo(a,b-70+u*70);ctx.lineTo(a-2,b-62+u*70);}ctx.stroke();}
    if(night>.35){ctx.fillStyle=`rgba(14,20,45,${.42*Math.min(1,night)})`;ctx.fillRect(-2000,-2000,4000,4000);
      if(lamp){eqY(cx0,cx1,0,14,28,'#ffd978');eTxt('CONSERJERÍA',(cx0+cx1)/2,0,10.3,'#ffe9b0',2.4,'y');const [a,b]=P((cx0+cx1)/2,.3,21);const g=ctx.createRadialGradient(a,b,2,a,b,70);g.addColorStop(0,'rgba(255,217,120,.7)');g.addColorStop(1,'rgba(255,217,120,0)');ctx.fillStyle=g;ctx.fillRect(a-75,b-75,150,150);}}};
  return {W,D,floor:asf,wall:fac,out:false,tile:false,drawBase,decor:null,items:it,ana,after};}

function escAula(key,E,m,L){const {tt,night}=E;const pub=key==='colegio',con=key==='concertado',ins=key==='instituto';const tut=m==='tutoria';const W=tut?7.5:10,D=tut?6:8;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const rain=esRain();const sky=night>.5?'#1f2742':rain?'#9aa8b5':'#bfe3f7';
  const fl=pub?'#d8cfb8':con?'#c79a62':'#cfd3d6',wl=pub?'#f1ead6':con?'#f5efe2':'#e8ecef',bd=pub?'#8fb3c9':con?'#c9b88f':'#7fa5c0';
  const kids=L.kids,staff=L.staff;const ages=kids.map(v=>v.edad);const base=ages.length?ages[Math.floor(S.t/60)%ages.length]:pub?8:con?9:14;
  const cohort=v=>Math.abs(v.edad-base)<=1;const named=kids.filter(cohort);
  const ventana=(a,b)=>{eqX(0,a-.08,b+.08,24,58,'#8a8f98');eqX(0,a,b,25,57,sky);eqX(0,(a+b)/2-.03,(a+b)/2+.03,25,57,'#8a8f98');};
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,fl);ctx.strokeStyle=con?'rgba(90,50,20,.18)':'rgba(0,0,0,.07)';ctx.lineWidth=1;ctx.beginPath();if(con){for(let k=1;k<D*2;k++){ctx.moveTo(...P(0,k*.5));ctx.lineTo(...P(W,k*.5));}}else{for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}}ctx.stroke();
    sBox(0,-.15,W,0,0,66,wl);sBox(-.15,-.15,0,D,0,66,shade(wl,.95));eqY(0,W,0,0,22,bd);eqX(0,0,D,0,22,shade(bd,.92));
    if(tut){
      // corcho con dibujos
      eqY(.8,2.9,0,22,54,'#a9855a');eqY(.9,2.8,0,23,53,'#d9b27e');
      for(const [a,b,z0,z1,c] of [[1.0,1.7,35,50,'#ffd23f'],[1.95,2.7,38,50,'#f7c6d0'],[1.05,1.75,25,34,'#bfe3f7'],[1.95,2.7,26,36,'#b8e0b0']]){eqY(a,b,0,z0,z1,c);}
      for(const [e,x,z] of [['🌈',1.35,42],['🏠',2.3,44],['🐱',1.4,29.5],['🌞',2.3,31]]){const [a,b]=P(x,0,z);emoji(e,a,b,9);}
      // ventana
      eqY(3.4,5.6,0,22,58,'#8a8f98');eqY(3.5,5.5,0,24,56,sky);eqY(4.47,4.53,0,24,56,'#8a8f98');eqY(3.5,5.5,0,39.5,40.5,'#8a8f98');sBox(3.3,-.1,5.7,.3,21,23,'#d9d3c4');
      // puerta y horario en la pared izquierda
      eqX(0,4.0,5.1,0,42,'#4a3a2a');eqX(0,4.1,5.0,0,40,'#7a5436');eqX(0,4.7,4.85,18,21,'#d8c07a');
      eqX(0,1.0,2.5,28,50,'#fffdf8');for(let k=0;k<5;k++)eqX(0,1.15,2.35-(k%2)*.4,32+k*3.4,33.4+k*3.4,k%2?'#c9ced4':'#4a7aa8');
      eqX(0,2.9,3.6,34,50,'#f7c6d0');eqX(0,3.0,3.5,36,48,'#ffd23f');
    }else{
      eqY(1.0,6.4,0,21,53,'#8a6a4a');eqY(1.12,6.28,0,22,52,ins?'#e9eef2':'#2f4a3a');
      const tc=ins?'#3a4a5a':'#f4f1ea';
      if(ins){eTxt('Tema 6 · Ecuaciones',3.7,0,44,tc,3.2,'y');eTxt('2x + 5 = 17',3.7,0,36,tc,3.4,'y');eTxt('x = 6',3.7,0,29,tc,3.4,'y');}
      else{eTxt(esFecha(),3.7,0,46,tc,3.2,'y');eTxt(pub?'La división':'Sumas con llevadas',3.7,0,38,tc,3.4,'y');eTxt(pub?'84 : 4 = 21':'47 + 38 = 85',3.7,0,30,tc,3.2,'y');}
      capsule(...P(1.3,0,22),...P(6.1,0,22),1.4,'#d8cfc0');
      if(con){sBox(3.5,-.1,3.9,.15,56,68,'#c9a24a');sBox(3.2,-.1,4.2,.15,63,64.6,'#c9a24a');}
      ventana(.5,2.1);ventana(2.7,4.3);
      if(pub){eqX(0,4.9,6.5,24,50,'#c9a36a');const cs=['#e63946','#ffd23f','#3a86ff','#2a9d8f'];for(let k=0;k<4;k++){const c=k%2,r=k>>1;eqX(0,5.05+c*.7,5.05+c*.7+.55,28+(1-r)*11,36+(1-r)*11,cs[k]);}}
      else ventana(4.9,6.5);
      eqX(0,6.8,7.8,0,40,'#4a3a2a');eqX(0,6.9,7.7,0,38,'#2b2b33');
      eqY(7.0,9.4,0,24,54,'#fffdf8');
      if(pub){eTxt('3.º B',8.2,0,48,'#c0262d',4.4,'y');eTxt('28 alumnas',8.2,0,40,'#4a3a2a',2.8,'y');eTxt('1 profe',8.2,0,34,'#4a3a2a',2.8,'y');eTxt('(de baja: sin sustituta)',8.2,0,28.5,'#7a6a5a',1.9,'y');}
      else if(con){eTxt('2.º ESO',8.2,0,47,'#2c3e7a',4,'y');eTxt('Normas del centro',8.2,0,39,'#4a3a2a',2.6,'y');eTxt('Uniforme completo',8.2,0,34,'#4a3a2a',2.4,'y');eTxt('Puntualidad',8.2,0,30,'#4a3a2a',2.4,'y');}
      else{for(let r=0;r<4;r++)for(let c=0;c<6;c++)eqY(7.1+c*.37,7.1+c*.37+.33,0,26+r*5.2,30.8+r*5.2,['#e63946','#4a7aa8','#f4a261','#2a9d8f','#9b5de5','#ffd23f'][(r*3+c)%6]);eTxt('TABLA PERIÓDICA',8.2,0,50,'#4a3a2a',2.2,'y');}
    }
  };
  const ana0={x:1.3,y:7.3,pose:'stand',front:true,right:true,act:null};
  if(!tut){
    // mesa de la maestra
    add(8.6,1.0,()=>{sBox(7.6,.5,9.6,1.5,0,13,'#a0754c');sBox(7.5,.4,9.7,1.6,13,15,'#b88a5c');sBox(7.8,.7,8.5,1.2,15,16,'#cfd4d8');sBox(7.85,.7,8.45,.8,16,25,'#2b2b33');sBox(9.0,.8,9.3,1.1,15,21,'#e63946');});
    const cols=[1.8,3.5,5.2,6.9],rows=[3.6,5.0,6.4];
    const seats=[];for(let r=0;r<rows.length;r++)for(let c=0;c<cols.length;c++)seats.push([cols[c],rows[r]]);
    const nIn=Math.min(seats.length,ins?seats.length-2:seats.length-1);
    const ag=k=>ins?[14,15,13,14,15,16][k%6]:pub?[Math.max(3,base-1),base,base,Math.min(11,base+1)][k%4]:[base-1,base,base,base+1][k%4];
    const dz=ins?15:pub?10:11,sz=ins?8.5:pub?5.4:6,hw=ins?.4:.34,kk=ins?1:1.14,cc=ins?'#4a7aa8':'#e9a23b';
    seats.forEach(([x,y],k)=>{const occ=k<nIn;
      // pupitre: laterales de chapa, balda y tapa
      add(x,y-.5,()=>{sBox(x-hw,y-.8,x-hw+.05,y-.34,0,dz,'#8a8f98');sBox(x+hw-.05,y-.8,x+hw,y-.34,0,dz,'#8a8f98');sBox(x-hw,y-.78,x+hw,y-.36,dz*.42,dz*.42+.7,'#b08a58');sBox(x-hw-.03,y-.84,x+hw+.03,y-.3,dz,dz+1.4,'#d3a86a');if(occ)sBox(x-.14,y-.74,x+.12,y-.46,dz+1.4,dz+1.9,'#fffdf8');});
      add(x,y+.04,()=>{for(const [a,b] of [[-.19,-.2],[.15,-.2],[-.19,.15],[.15,.15]])sBox(x+a,y+b,x+a+.05,y+b+.05,0,sz,'#6b6f78');sBox(x-.22,y-.24,x+.22,y+.2,sz,sz+1.4,cc);});
      add(x,y+.3,()=>{sBox(x-.2,y+.17,x+.2,y+.25,sz+1.4,sz+9,shade(cc,.82));});
      if(!occ)return;
      const nv=named[k];const a2=nv?nv.edad:ag(k);
      add(x,y+.12,()=>{const ch=nv?pbLook(nv):esLook(key+'|'+S.day+'|'+k,false,a2);const act=ins&&k%3===0?'phone':(!ins&&!con&&k%5===2?'type':null);
        esFig(x,y-.02,ch,a2,{pose:'sit',front:false,right:k%2===0,uni:con,name:nv?nv.n:null,act,k:kk});});});
    const pv=staff.find(v=>(esPuesto(v)||'').match(/maest|profes/));const tx=8.6,ty=2.4;
    add(tx,ty,()=>pv?esFig(tx,ty,pbLook(pv),pv.edad,{front:true,right:false,act:'talk',ph:tt*4,name:pv.n,puesto:esPuesto(pv)}):esFig(tx,ty,esLook(key+'|prof',true,40),40,{front:true,right:false,act:'talk',ph:tt*4,puesto:ins?'profesor':'maestra'}));
  } else {
    // tutoría: despacho pequeño con mesa, sillas de adulto a los dos lados y rincón infantil con sillas bajas
    add(3.7,2.3,()=>{topQuad(1.9,1.4,5.5,4.9,.05,'#c9835a');topQuad(2.1,1.6,5.3,4.7,.07,'#d9a074');});
    add(5.9,.6,()=>{sBox(5.8,.15,7.3,.95,0,50,'#b58a5c');sBox(5.8,.15,7.3,.95,50,52,'#9a7448');eqY(5.88,6.5,.95,2,48,'#c49a68');eqY(6.6,7.22,.95,2,48,'#c49a68');sBox(6.35,.95,6.45,1.05,22,28,'#d8c07a');sBox(6.65,.95,6.75,1.05,22,28,'#d8c07a');
      for(const [dx,w,hh,c] of [[0,.4,6,'#e63946'],[.5,.35,5,'#3a86ff'],[.95,.4,7,'#e9a23b']])sBox(5.95+dx,.3,5.95+dx+w,.8,52,52+hh,c);});
    add(3.7,3.0,()=>{sBox(2.7,2.45,4.7,3.55,0,13,'#a0754c');sBox(2.6,2.35,4.8,3.65,13,15,'#b88a5c');sBox(3.0,2.65,3.6,3.2,15,16.2,'#e63946');sBox(3.8,2.7,4.4,3.25,15,16,'#3a86ff');sBox(4.0,2.55,4.4,2.9,16,16.4,'#fffdf8');cyl(2.95,3.35,.15,15,19,'#4a5058','#ffd23f');});
    const sc=(x,y,col)=>{add(x+y-.1,0,()=>svSillaRespN(x,y,col));add(x+y+.4,0,()=>svSillaBase(x,y,col));};
    add(3.7,1.2,()=>svSillaRespN(3.7,1.9,'#4a5058'));add(3.7,1.9+.4,()=>svSillaBase(3.7,1.9,'#4a5058'));
    add(3.7+4.15+.5,0,()=>svSillaBase(3.7,4.15,'#4a5058'));add(3.7+4.15+.9,0,()=>sBox(3.43,4.34,3.97,4.44,12,22,'#3d4249'));
    add(3.7,2.3,()=>esFig(3.7,1.95,esLook(key+'|tut',true,38),38,{pose:'sit',front:true,right:false,act:'talk',ph:tt*4,puesto:'tutora'}));
    // rincón infantil: mesita baja y dos sillitas
    add(6.1,4.5,()=>{sBox(5.5,4.2,6.7,4.8,0,7,'#7fb8d8');sBox(5.45,4.15,6.75,4.85,7,8.2,'#ffd23f');sBox(5.7,4.35,6.0,4.6,8.2,9.4,'#e63946');sBox(6.2,4.4,6.5,4.65,8.2,9,'#3a86ff');});
    for(const [x,y,c] of [[5.55,5.35,'#e63946'],[6.55,5.35,'#2a9d8f']])add(x+y+.2,0,()=>{for(const [a,b] of [[-.16,-.16],[.12,-.16],[-.16,.12],[.12,.12]])sBox(x+a,y+b,x+a+.04,y+b+.04,0,4.5,'#6b6f78');sBox(x-.2,y-.2,x+.2,y+.2,4.5,5.8,c);sBox(x-.2,y+.15,x+.2,y+.22,5.8,11,shade(c,.8));});
    add(.9+5.2,0,()=>{cyl(.75,5.3,.26,0,10,'#b5543c','#c27458');const [a,b]=P(.75,5.3,10);for(let k=0;k<7;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k*1.2)*7,b-9-Math.abs(Math.sin(k))*8,5,2.8,k,0,7);ctx.fill();}});
  }
  const ana=tut?{x:3.7,y:4.15,pose:'sit',front:false,right:true,act:null}:ana0;
  const after=()=>{if(night>.4){ctx.fillStyle='rgba(20,30,60,.12)';ctx.fillRect(-2000,-2000,4000,4000);}};
  return {W,D,floor:fl,wall:wl,out:false,tile:false,drawBase,decor:null,items:it,ana,after};}

function escScene(key,E){const h=E.h!=null?E.h:S.t/60,wd=dateOf(S.day).wd,lect=escLect(wd);const act=S.sim.outingActive;const m=esMoment(key,h,lect,act);
  const lista=lect&&m!=='tutoria'&&m!=='cerrado'?vecinosEn(key,h,wd):[];
  const L={kids:lista.filter(q=>q.motivo==='clase').map(q=>q.v),staff:lista.filter(q=>q.motivo==='trabajo').map(q=>q.v),padres:lista.filter(q=>q.motivo==='recoger').map(q=>q.v)};
  if(act==='cole'||act==='tutoria'){const q=(S.kids||[])[S.sim.escKid];
    if(act==='cole'){const s=S.sim,tot=s.awayTotal||1,el=tot-(s.work||0),tr=Math.min(20,tot/3);const f=Math.max(0,Math.min(1,(el-tr)/Math.max(1,tot-2*tr)));L.ana={x:10.4,y:7.5,pose:'stand',front:false,right:false,act:null};
      if(q&&esKD(q))L.hijo={ch:{...q.ch,name:q.n},age:kidAge(q),n:q.n,f:f<.25?0:Math.min(1,(f-.25)/.5)};}}
  if(m==='clase'||m==='tutoria')return escAula(key,E,m,L);
  return escPatio(key,E,m,L);}
for(const k of ESC_K)SCENES[k]=E=>escScene(k,E);

// =================== ELEGIR COLEGIO (T-113) ===================
// Estado en la criatura: k.centro ('colegio' | 'concertado' | 'instituto'; sin él, lo de siempre), k.pend (decisión por tomar: cole3, cole12, cambio),
// k.pagado (lo que lleva este curso), k.debe (recibos devueltos), k.huelga (día de huelga), k.sucDay (último suceso del centro).
// Textos en data/sucesos.json (dilemas cr_cole y cr_cole_cambio, sección centros).
const colNom=c=>c==='concertado'?TX_escuela.centro_concertado:c==='instituto'?TX_escuela.centro_instituto:TX_escuela.centro_publico;
const colPub=k=>kidAge(k)>=12?'instituto':'colegio';
const colCuota=k=>hrs(kidAge(k)>=12?12:10),colExtra=()=>hrs(4),colMat=()=>hrs(1.5); // cuota «voluntaria» ≈ 85 € (lo que pone el cartel de San Roque), extraescolares y material
const colK=d=>(S.kids||[])[d.i]||{n:d.k||TX_escuela.la_criatura,g:'f',born:S.day-60*3};
const colHue=k=>({k:k.n,lo:k.g==='f'?'a':'o',m:fmt(colMat()),t:fmt(colCuota(k)+colExtra()),q:6,h:TR().sh[1]});
// admisión del concertado: puntos de renta (menos ingresos, más puntos), cercanía, hermanos en el centro y un sorteo de desempate; con 6 se entra (con hermano dentro, siempre)
function colPuntos(k){const H=HOMES[(S.home&&S.home.type)||'casita'],cl=H&&typeof H.cls==='number'?H.cls:1;
  const r=S.jobless?0:salary()/(8*HW());const renta=S.jobless||r<=1.15?2:r<=1.8?1:0;
  const cerca=typeof homeless==='function'&&homeless()?0:cl>=4?4:cl>=3?4:cl>=2?3:2;
  const herm=(S.kids||[]).some(q=>q!==k&&q.centro==='concertado')?3:0;
  return {p:renta+cerca+herm+(Math.random()*4|0),q:6};}
function colSolicitar(k,O){const r=colPuntos(k),h={...colHue(k),p:r.p,q:r.q};k.debe=0;
  if(r.p>=r.q){k.centro='concertado';k.centroDesde=S.day;tell(huecos(O.tell_ok,h),'🏫');return true;}
  k.centro=colPub(k);k.centroDesde=S.day;tell(huecos(O.tell_ko,h),'🏫');return false;}
function colCapitulo(k,O,ok){const T=O.capx||(ok?O.capx_ok:O.capx_ko);if(!O.cap||!T)return;
  chapter('cole_'+k.n,O.cap,huecos(T,{...colHue(k),n:CH().name,ampa:DT.cr_cole.ampa[W_().mov>=50?0:1]}));}
const colCaso=(d,k)=>d.e==='cole12'?(esCentroDe(k)==='concertado'?'doce_con':'doce_pub'):'tres';
Object.assign(DLG,{cr_cole:{t:d=>huecos(DT.cr_cole.t,{k:colK(d).n}),
  x:d=>{const k=colK(d);return huecos(DT.cr_cole.x[colCaso(d,k)],{k:k.n});},
  o:d=>{const k=colK(d),cs=colCaso(d,k),O=DT.cr_cole.o[cs],h=colHue(k);
    const pub=(o)=>({t:o.t,s:huecos(o.s,h),f:()=>{k.centro=colPub(k);k.centroDesde=S.day;k.pend=null;tell(huecos(o.tell,h),'🏫');colCapitulo(k,o,true);}});
    const sol=(o)=>({t:o.t,s:huecos(o.s,h),f:()=>{k.pend=null;const ok=colSolicitar(k,o);colCapitulo(k,o,ok);}});
    const stay=(o)=>({t:o.t,s:huecos(o.s,h),f:()=>{k.centro='concertado';k.centroDesde=S.day;k.pend=null;tell(huecos(o.tell,h),'🏫');}});
    return cs==='doce_con'?[stay(O[0]),pub(O[1])]:[pub(O[0]),sol(O[1])];},
  auto:d=>{const k=colK(d);return colCaso(d,k)==='doce_con'?(S.money>hrs(120)?0:1):(S.money>hrs(250)?1:0);}},
 cr_cole_cambio:{t:()=>DT.cr_cole_cambio.t,
  x:d=>{const k=colK(d),con=esCentroDe(k)==='concertado';return huecos(DT.cr_cole_cambio.x[con?(k.debe>=1?'concertado_debe':'concertado'):(k.hap<45?'publico_flojo':'publico')],{k:k.n,c:colNom(esCentroDe(k)),y:fmt(k.pagado||0)});},
  o:d=>{const k=colK(d),con=esCentroDe(k)==='concertado',O=DT.cr_cole_cambio.o[con?'concertado':'publico'];
    const nx=kidAge(k)+1>=12?'instituto':'colegio',h={...colHue(k),c:colNom(esCentroDe(k)),c2:colNom(nx)};
    const stay={t:huecos(O[0].t,h),s:O[0].s,f:()=>{k.pend=null;tell(huecos(O[0].tell,h),'🏫');}};
    return [stay,con?{t:huecos(O[1].t,h),s:huecos(O[1].s,h),f:()=>{k.pend=null;k.centro=colPub(k);k.centroDesde=S.day;k.debe=0;tell(huecos(O[1].tell,h),'🏫');}}
      :{t:O[1].t,s:huecos(O[1].s,h),f:()=>{k.pend=null;colSolicitar(k,{tell_ok:O[1].tell_ok,tell_ko:huecos(O[1].tell_ko,{c:h.c})});}}];},
  auto:d=>{const k=colK(d);return esCentroDe(k)==='concertado'&&(k.debe>=1||S.money<hrs(60))?1:0;}}});
// con quién coincide a la puerta: una familia del censo que recoge en ese centro (la elección se nota en las caras)
function colPuerta(c,q){try{const T=DATA.sucesos.centros[c];if(!T||c==='instituto'||esR(q.n+S.day+'pf')>=.6)return '';
  const ks=pbVec().filter(v=>v&&v.centro===c&&v.estudia==='cole');if(!ks.length)return '';const v=esPick(ks,q.n+S.day+'v');
  const a=pbVec().find(x=>x&&x.hogar===v.hogar&&pbAdult(x));if(!a)return '';
  return huecos(esPick(T.puerta,q.n+S.day+'p'),{a:a.n,v:v.n});}catch(e){return '';}}
// la huelga educativa de la pública: la criatura se queda en casa y alguien tiene que cubrirlo
function colHuelga(k,c){const T=DATA.sucesos.centros.huelga,m=grandma(),p=liveIn(),h={k:k.n,c:PLACES[c].n,p:p&&p.n};k.huelga=S.day;
  if(!anaWorksToday())tell(huecos(T.libre,h),'🪧');
  else if(m&&Math.random()<.65){m.rel=Math.min(100,m.rel+1);tell(huecos(T.abuela,h),'🪧');}
  else if(p&&partnerHome()){p.wear=Math.min(100,(p.wear||0)+3);tell(huecos(T.pareja,h),'🪧');}
  else{S.rep=Math.max(0,(S.rep??70)-2);bkAdd('Críos',-Math.round(salary()*.5));tell(huecos(T.falta,h),'🪧');}}
function colSuceso(k,a,c){const T=DATA.sucesos.centros[c];if(!T||(k.sucDay&&S.day-k.sucDay<14))return;
  if(c!=='concertado'&&Math.random()<.008){k.sucDay=S.day;colHuelga(k,c);return;}
  for(const x of T.sucesos){if(Math.random()>=x.p)continue;k.sucDay=S.day;
    const ks=pbVec().filter(v=>v&&v.centro===c&&v.estudia&&v.estudia!=='fp');const v=ks.length?esPick(ks,k.n+S.day+x.id):null;
    tell(huecos(x.tell,{k:k.n,c:fmt(hrs(x.gasto||0)),v:v?v.n:TX_escuela.una_companera}),'🏫');
    k.hap=Math.max(0,Math.min(100,(k.hap??70)+(x.hap||0)));if(x.social)S.needs.social=Math.min(100,S.needs.social+x.social);
    if(x.gasto){bkAdd('Críos',-hrs(x.gasto));if(c==='concertado')k.pagado=(k.pagado||0)+hrs(x.gasto);}return;}}
// cada día: recibo del mes (días 1, de septiembre a junio), fin de curso (24 de junio) y lo que pasa en el centro
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);
  try{const ks=esKids(3,16);if(!ks.length)return r;const d=dateOf(S.day),curso=d.m!==6&&d.m!==7,lect=d.wd<5&&!festivo(S.day)&&curso,T=DATA.sucesos.centros;let cuo=0,mat=0;
    for(const k of ks){const a=kidAge(k),c=esCentroDe(k),con=c==='concertado';
      if(d.m===5&&d.dm===24&&k.centro&&a<=15&&!k.pend){const flojo=(k.hap??70)<45;if(con?(k.debe>=1||flojo||S.money<hrs(40)):(flojo||S.money>hrs(400)))k.pend='cambio';}
      if(d.dm===1&&curso){if(con){const m=colCuota(k)+colExtra();bkAdd('Críos',-m);k.pagado=(k.pagado||0)+m;cuo+=m;
          if(S.money<0){k.debe=(k.debe||0)+1;if(k.debe>=2)tell(huecos(pickR(T.impago),{k:k.n}),'📨');}else k.debe=0;}
        else{const m=colMat();bkAdd('Críos',-m);mat+=m;}}
      if(lect&&!k.sick)colSuceso(k,a,c);}
    if(cuo)toast(huecos(T.mes.concertado,{c:fmt(cuo)}));if(mat)toast(huecos(T.mes.publico,{c:fmt(mat)}));
  }catch(e){console.error(e);}return r;};}
