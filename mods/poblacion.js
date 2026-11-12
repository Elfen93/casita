// =================== POBLACIÓN: vecinos con nombre y gente en cada escena ===================
const pbH=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);h^=h>>>13;}return (h>>>0)/4294967296;};
const pbPick=(a,s)=>a[Math.floor(pbH(s)*a.length)%a.length];
function pbLook(v){const o=v.id,old=v.edad>=60;const g=v.g;
  return {vid:v.id,name:v.n,g,skin:pbPick(SKINS,o+'s'),hair:old?'#bdbdbd':pbPick(HAIRCOLS.slice(0,6),o+'h'),
    style:g==='f'?pbPick(['melena','coleta','corto','mono','rizos'],o+'y'):pbPick(['corto','rapado','calvo','rizos'],o+'y'),
    beard:g==='m'&&pbH(o+'b')<.35?'corta':'no',glasses:old||pbH(o+'g')<.25,build:pbPick(['media','delgada','ancha'],o+'c'),
    shirt:pbPick(SHIRTC,o+'t'),pants:pbPick(PANTSC,o+'p'),eyes:'#3b2a20'};}
// hora punta de cada sitio: pk [[desde,hasta,nivel]], base, fin de semana (multiplicador), n mínimo y máximo, zona [x0,y0,x1,y1] en fracción del suelo
const POB={
 obra:{pk:[[8,15,1]],base:.1,we:.15,lo:4,hi:13,helmet:[8,15]},
 super:{pk:[[9,14,.7],[17,20,1]],base:.3,we:.9,lo:4,hi:12},
 bar:{pk:[[8,11,.45],[13,15,1],[20,24,1]],base:.3,we:1,lo:4,hi:14},
 torre:{pk:[[8,10,.8],[13,15,.6],[17,19,.6]],base:.2,we:.15,lo:4,hi:10},
 residencia:{pk:[[10,13,.8],[17,19,.8]],base:.5,we:1,lo:4,hi:10},
 biblioteca:{pk:[[10,13,.7],[16,20,1]],base:.3,we:.5,lo:4,hi:10},
 parque:{pk:[[10,13,.8],[17,20,1]],base:.4,we:1,lo:5,hi:14},
 sindicato:{pk:[[17,21,1]],base:.3,we:.2,lo:4,hi:10},
 ateneo:{pk:[[18,22,1]],base:.3,we:.8,lo:4,hi:10},
 comedor:{pk:[[13,15.5,1],[20,21.5,.7]],base:.15,we:1,lo:4,hi:12},
 coop:{pk:[[9,14,.8],[17,19,.6]],base:.25,we:.5,lo:4,hi:10},
 sala:{pk:[[18,23,1]],base:.2,we:1,lo:4,hi:12},
 parroquia:{pk:[[11,13,.6],[18,20,.5]],base:.15,we:.8,lo:4,hi:10},
 comisaria:{pk:[[8,20,.5]],base:.3,we:.7,lo:4,hi:8},
 ayto:{pk:[[9,14,1]],base:.1,we:.1,lo:4,hi:9},
 tienda:{pk:[[10,14,.6],[17,20,1]],base:.3,we:.9,lo:4,hi:9},
 gym:{pk:[[7,9,1],[18,21,1]],base:.3,we:.7,lo:4,hi:11},
 gymbueno:{pk:[[7,9,1],[18,21,.9]],base:.3,we:.7,lo:4,hi:10}};
function pbLevel(c,h,wd){let l=c.base;for(const [a,b,n] of c.pk)if(h>=a&&h<b)l=Math.max(l,n);if(wd>=5)l*=c.we;return Math.max(0,Math.min(1,l));}
const pbVec=()=>(DATA.personas&&DATA.personas.vecinos)||[];
function vecinoPorId(id){return pbVec().find(v=>v&&v.id===id)||null;}
const pbIn=(a,b,h)=>typeof a==='number'&&typeof b==='number'&&(a<=b?h>=a&&h<b:(h>=a||h<b)); // admite tramos que cruzan la medianoche
const pbDia=(ds,wd)=>!Array.isArray(ds)||ds.includes(wd);
function pbTrabaja(v,key,h,wd){const t=v&&v.trabajo;return !!(t&&t.lugar===key&&Array.isArray(t.h)&&pbIn(t.h[0],t.h[1],h)&&pbDia(t.dias,wd));}
function vecinosEn(lugar,hora,diaSemana){const out=[];for(const v of pbVec()){if(!v)continue;
  if(pbTrabaja(v,lugar,hora,diaSemana)){out.push({v,motivo:'trabajo'});continue;}
  if(Array.isArray(v.donde)&&v.donde.some(d=>d&&d[0]===lugar&&pbIn(d[1],d[2],hora)&&pbDia(d[3],diaSemana)))out.push({v,motivo:'donde'});}
  return out;}
// escala por edad: ~0,5 a los 3, ~0,9 a los 16, 1 de adulto
const pbEscala=e=>typeof e!=='number'||e>=18?1:e<3?.42+e*.027:e<16?.5+(e-3)*.4/13:.9+(e-16)*.05;
const pbAdult=v=>typeof v.edad!=='number'||v.edad>=18;
const pbPuesto=v=>{const p=v.trabajo&&v.trabajo.puesto;return Array.isArray(p)?(v.g==='f'?p[0]:p[1]||p[0]):(typeof p==='string'?p:null);};
// SITIO DE LA GENTE. cli: rectángulos de suelo donde puede estar de pie quien viene de fuera; posts: puestos de quien trabaja (m: oficio al que le va; up: sube al andamio).
// Lo demás lo decide el dibujo real: antes de colocar a nadie se «ensaya» la escena en un lienzo aparte (pbSuelo) y se descartan las casillas con mueble,
// pared o figura de la propia escena. Así nadie queda sobre una mesa, un mostrador u otra figura, sea cual sea la variante o la hora.
const ZON={
 obra:{cli:[[.7,.6,10.3,7.3]],posts:[{x:7.95,y:2.6,up:26,work:1},{x:3.6,y:1.7},{x:6.2,y:1.5},{x:4.1,y:2.4},{x:2.8,y:2.7},{x:5.6,y:6.9},{x:8.9,y:4.3}]},
 super:{cli:[[1.8,.9,11.3,9.3]],posts:[{x:2.5,y:7.1,m:/caj/,act:'type'},{x:5.7,y:7.1,m:/caj/,act:'type'},{x:8.9,y:7.1,m:/caj/,act:'type'},{x:4.6,y:3.8,m:/repon/},{x:7.6,y:3.8,m:/repon/},{x:3.2,y:3.8},{x:6.0,y:3.8},{x:4.6,y:4.8},{x:5.5,y:5.0},{x:3.2,y:5.0},{x:10.4,y:2.2}]},
 bar:{cli:[[.7,2.7,9.3,7.3]],posts:[{x:7.4,y:.9},{x:1.6,y:.85},{x:2.4,y:.85},{x:7.5,y:1.7}]},
 torre:{cli:[[.7,.7,11.3,8.3]],posts:[{x:2.4,y:4.2,m:/inform/},{x:1.6,y:5.8,m:/limpi/},{x:2.8,y:6.4},{x:3.0,y:3.4},{x:1.6,y:3.2}]},
 residencia:{cli:[[.7,.7,9.3,7.3]],posts:[{x:4.2,y:5.4},{x:1.9,y:3.0},{x:6.0,y:5.8},{x:3.0,y:5.6}]},
 biblioteca:{cli:[[.7,.7,11.3,8.3]],posts:[{x:9.0,y:8.4},{x:8.5,y:5.2},{x:10.4,y:3.4},{x:8.2,y:6.4}]},
 parque:{cli:[[.7,.7,11.3,8.3]],posts:[]},
 sindicato:{cli:[[.7,.7,9.3,6.3]],posts:[{x:8.0,y:1.4},{x:4.1,y:.8},{x:5.9,y:.8},{x:2.8,y:5.0}]},
 ateneo:{cli:[[.7,.7,9.3,6.3]],posts:[]},
 comedor:{cli:[[.7,.7,10.3,7.3]],posts:[]},
 coop:{cli:[[.7,.7,9.3,7.3]],posts:[{x:7.6,y:1.5},{x:4.5,y:2.0},{x:5.2,y:1.5},{x:1.4,y:2.8}]},
 sala:{cli:[[.7,2.8,9.3,7.3]],posts:[]},
 parroquia:{cli:[[.8,1.8,9.3,7.3]],posts:[]},
 comisaria:{cli:[[.7,1.0,9.3,7.3]],posts:[]},
 ayto:{cli:[[.7,3.5,11.3,8.3]],posts:[{x:6.0,y:1.6},{x:3.6,y:1.6},{x:8.4,y:1.6},{x:10.4,y:1.6}]},
 tienda:{cli:[[.7,.7,7.3,5.3]],posts:[{x:.9,y:1.7},{x:.9,y:4.1},{x:.9,y:5.0}]},
 gym:{cli:[[.7,.7,10.3,7.3]],posts:[]},
 gymbueno:{cli:[[.7,.7,11.3,8.3]],posts:[]}};
// ensayo de la escena: se dibuja en un lienzo de 8x8 sin pintar nada real y se apuntan los muebles (cajas y cilindros a pie de suelo) y las figuras fijas
const PBD={on:false,rects:[],figs:[],cx:null,cache:new WeakMap()};
{const _pr=prism,_pg=prismG,_cy=cyl,_sp=sPerson;
 prism=function(x0,y0,x1,y1,z0,z1){if(PBD.on){PBD.rects.push([x0,y0,x1,y1,z0,z1]);return;}return _pr.apply(this,arguments);};
 prismG=function(x0,y0,x1,y1,z0,z1){if(PBD.on){PBD.rects.push([x0,y0,x1,y1,z0,z1]);return;}return _pg.apply(this,arguments);};
 cyl=function(cx,cy,r,z0,z1){if(PBD.on){PBD.rects.push([cx-r,cy-r,cx+r,cy+r,z0,z1]);return;}return _cy.apply(this,arguments);};
 sPerson=function(x,y,ch,o){if(PBD.on){PBD.figs.push([x,y]);return;}return _sp.apply(this,arguments);};}
const PB_TT=Array.from({length:34},(_,i)=>i*2.9);
// figs: figuras de la escena que no se mueven (se evitan a 0,8); mov: las que pasean (sus recorridos se evitan a 0,5)
function pbMk(W,D,bl,figs,mov){mov=mov||[];const g={W,D,bl,figs,mov,cells:{}};
  g.near=(x,y,rs,rm)=>{rs=rs||.7;rm=rm||.62;for(const f of figs)if(Math.hypot(f[0]-x,f[1]-y)<rs)return true;for(const f of mov)if(Math.hypot(f[0]-x,f[1]-y)<rm)return true;return false;};
  g.free=(x,y,m)=>{m=m==null?.32:m;if(x<.45||y<.45||x>W-.45||y>D-.45)return false;
    for(const r of bl)if(x>r[0]-m&&x<r[2]+m&&y>r[1]-m&&y<r[3]+m)return false;return true;};
  g.ok=(x,y,m)=>g.free(x,y,m)&&!g.near(x,y);return g;}
function pbSuelo(key,E,sc){let C=PBD.cache.get(S);if(!C){C=new Map();PBD.cache.set(S,C);}
  const o=(S.sim&&S.sim.outingActive)||'work',ck=key+'|'+o+'|'+S.day+'|'+Math.floor(S.t/30)+'|'+((E.w&&E.w.crisis)>=60?1:0)+'|'+(E.night>.45?1:0);
  let g=C.get(ck);if(g)return g;const rects=[],figs=[];let W=10,D=8;
  if(!PBD.cx){const c=document.createElement('canvas');c.width=c.height=8;PBD.cx=c.getContext('2d');}
  const old=ctx;ctx=PBD.cx;PBD.on=true;
  try{for(const t of PB_TT){PBD.rects=[];PBD.figs=[];let r=null;try{r=sc.call(null,{...E,tt:t});}catch(e){}
      if(r){W=r.W||W;D=r.D||D;if(r.ana)PBD.figs.push([r.ana.x,r.ana.y]);
        for(const f of [r.drawBase,r.decor,...(r.items||[]).map(i=>i.f),r.after])if(typeof f==='function')try{f();}catch(e){}}
      for(const q of PBD.rects)rects.push(q);for(const f of PBD.figs)figs.push(f);}}
  finally{PBD.on=false;ctx=old;}
  const cnt=new Map();for(const f of figs){const q=Math.round(f[0]*8)+','+Math.round(f[1]*8);cnt.set(q,(cnt.get(q)||0)+1);}
  const fix=[],mov=[];for(const f of figs){(cnt.get(Math.round(f[0]*8)+','+Math.round(f[1]*8))>=PB_TT.length*.6?fix:mov).push(f);}
  g=pbMk(W,D,rects.filter(r=>r[5]>=6&&r[4]<40&&r[2]-r[0]<W-1&&r[3]-r[1]<D-1&&r[3]>0&&r[2]>0),fix,mov);C.set(ck,g);return g;}
const pbCells=(g,key)=>{if(g.cells[key])return g.cells[key];const Z=ZON[key]||{cli:[[.7,.7,g.W-.7,g.D-.7]]},out=[];
  for(const z of Z.cli)for(let x=z[0];x<=z[2]+1e-6;x+=.5)for(let y=z[1];y<=z[3]+1e-6;y+=.5)if(g.ok(x,y))out.push([x,y]);return g.cells[key]=out;};
function pbFig(v,x,y,o){const ch=pbLook(v),e=v.edad,sc=pbEscala(e),[px,py]=P(x,y);const kid=typeof e==='number'&&e<10;
  const act=kid&&o.act==='phone'?null:o.act;const puesto=o.trabaja?pbPuesto(v):null;
  ctx.save();if(sc!==1){ctx.translate(px,py);ctx.scale(sc,sc);ctx.translate(-px,-py);}
  sPerson(x,y,ch,{pose:'stand',act,front:o.front,right:o.right,ph:o.ph,helmet:kid?false:o.helmet,vest:kid?false:o.vest,name:v.n,rot:{hogar:v.hogar,trab:!!o.trabaja,puesto}});ctx.restore();}
function crowd(E,key,r){const c=POB[key];if(!c)return [];r=r||{};const tt=E.tt||0;const h=S.t/60;const dt=typeof dateOf==='function'?dateOf(S.day):{wd:0};const wd=dt.wd;
  const hs=Math.floor(h),seed=key+'|'+S.day+'|'+hs;
  const hel=c.helmet&&h>=c.helmet[0]&&h<c.helmet[1];
  const parqueTarde=key==='parque'&&h>=17&&h<20;
  // quién sale: trabajadores primero; menores de 12 solo con una adulta de su hogar (salvo parque 17-20)
  let list=vecinosEn(key,h,wd).sort((a,b)=>(a.motivo==='trabajo'?0:1)-(b.motivo==='trabajo'?0:1)||(a.v.id<b.v.id?-1:1));
  const adultosH=new Set(list.filter(q=>pbAdult(q.v)&&q.v.hogar!=null).map(q=>q.v.hogar));
  list=list.filter(q=>{const v=q.v;if(pbAdult(v))return true;const conAdulta=v.hogar!=null&&adultosH.has(v.hogar);
    if(conAdulta)return true;return typeof v.edad==='number'&&v.edad>=12?true:parqueTarde;});
  // tope de 12: quien trabaja y las adultas primero, y ninguna criatura se queda sin la adulta que la traía
  if(list.length>12){const ad=list.filter(q=>pbAdult(q.v)),me=list.filter(q=>!pbAdult(q.v));const adK=ad.slice(0,Math.max(4,12-me.length));const hk=new Set(adK.map(q=>q.v.hogar));
    list=adK.concat(me.filter(q=>(q.v.hogar!=null&&hk.has(q.v.hogar))||(typeof q.v.edad==='number'&&q.v.edad>=12)||parqueTarde)).slice(0,12);}
  const lv=pbLevel(c,h,wd);
  const n=Math.min(14,Math.max(4,Math.round(c.lo+(c.hi-c.lo)*lv),list.length+2));
  const ns=NPCS();const known=(Array.isArray(S.people)?S.people:[]).filter(p=>p&&p.ch&&p.n&&p.vid==null); // los vecinos del censo que ya conoces salen por su horario (vecinosEn), no al azar
  const usados=new Set(list.map(q=>q.v.n));const ana=r.ana||{x:-9,y:-9};
  const g=r.g||pbMk(r.W||10,r.D||8,[],[]);const cells=pbCells(g,key);const taken=[[ana.x,ana.y]];
  const spot=(s,gap)=>{if(!cells.length)return null;for(let t=0;t<30;t++){const q=cells[Math.floor(pbH(s+'c'+t)*cells.length)%cells.length];
    const x=q[0]+(pbH(s+'x'+t)-.5)*.3,y=q[1]+(pbH(s+'y'+t)-.5)*.3;if(g.ok(x,y)&&taken.every(z=>Math.hypot(z[0]-x,z[1]-y)>gap)){taken.push([x,y]);return [x,y];}}return null;};
  const out=[];let k=0;
  // unidades: cada hogar presente (adultas primero) forma un grupo; el resto, sueltos
  const units=[];const byH=new Map();
  for(const q of list){if(q.v.hogar==null){units.push([q]);continue;}if(!byH.has(q.v.hogar)){const u=[];byH.set(q.v.hogar,u);units.push(u);}byH.get(q.v.hogar).push(q);}
  for(const u of units)u.sort((a,b)=>(pbAdult(b.v)?1:0)-(pbAdult(a.v)?1:0)||(a.motivo==='trabajo'?-1:1));
  const okR=(x,y)=>g.free(x,y,.22)&&!g.near(x,y,.55,.35);
  const cells2=()=>{const Z=(ZON[key]||{cli:[[.7,.7,g.W-.7,g.D-.7]]}).cli,o=[];for(const z of Z)for(let x=z[0];x<=z[2]+1e-6;x+=.5)for(let y=z[1];y<=z[3]+1e-6;y+=.5)if(okR(x,y))o.push([x,y]);return o;};let C2=null;
  const spotR=(s,gap)=>{C2=C2||cells2();for(let t=0;t<40;t++){const q=C2[Math.floor(pbH(s+'R'+t)*C2.length)%C2.length];if(!q)return null;if(taken.every(z=>Math.hypot(z[0]-q[0],z[1]-q[1])>gap)){taken.push([q[0],q[1]]);return [q[0],q[1]];}}return null;};
  const Zc=ZON[key]||{posts:[]};const used=new Set();
  const parada=((E.w&&E.w.crisis)||0)>=60,lunch=!parada&&h>=13.5&&h<14.75,working=!parada&&!lunch&&!(E.night>.45);
  const postFor=pu=>{const ps=Zc.posts||[];const ord=ps.map((p,i)=>[p,i]).filter(([p,i])=>!used.has(i)&&(!p.work||working));
    const mine=ord.filter(([p])=>p.m&&p.m.test(pu||'')),oth=ord.filter(([p])=>!p.m);
    for(const [p,i] of mine.concat(oth)){if(p.up?!g.near(p.x,p.y,.6,.4):(g.free(p.x,p.y,.08)&&!g.near(p.x,p.y,.55,.35))){if(taken.every(z=>Math.hypot(z[0]-p.x,z[1]-p.y)>.8)){used.add(i);return p;}}}return null;};
  const RING=[[.75,0],[-.75,0],[0,.75],[0,-.75],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7],[.6,.2],[-.6,.2],[.2,.6],[.2,-.6]];
  const OFF=[[.75,0],[-.75,.1],[0,.75],[.7,.7]];
  const place=(u,i0,ax,ay,pts,rot)=>{ // casilla libre para el resto de la unidad, pegada a quien llegó primero
    for(let i=1;i<u.length;i++){const s=(rot+i)%RING.length;let got=null;
      for(let t=0;t<RING.length&&!got;t++){const [dx,dy]=RING[(s+t)%RING.length];const x=ax+dx,y=ay+dy;
        if(okR(x,y)&&pts.every(z=>Math.hypot(z[0]-x,z[1]-y)>.55))got=[x,y];}
      if(!got)return null;pts.push(got);}return pts;};
  for(const u of units){if(k>=14)break;
    const wk=u.find(q=>q.motivo==='trabajo'&&pbAdult(q.v));let ax,ay,post=null;
    if(wk){post=postFor(pbPuesto(wk.v));}
    if(post){ax=post.x;ay=post.y;}
    else{const p=spot(seed+'u'+k+u[0].v.id,u.length>1?2:1.2)||spotR(seed+'u'+k+u[0].v.id,u.length>1?1.6:.9);if(!p)continue;[ax,ay]=p;}
    // posiciones de todos: la primera es del ancla; los demás, en casillas libres a su lado (si no caben, la unidad no sale)
    const pts=place(u,0,ax,ay,[[ax,ay]],Math.floor(pbH(seed+'r'+u[0].v.id)*RING.length));if(!pts){if(!post)taken.pop();continue;}
    if(post)taken.push([ax,ay]);else for(let i=1;i<pts.length;i++)taken.push(pts[i]);
    if(post)for(let i=1;i<pts.length;i++)taken.push(pts[i]);
    const ph=(tt*.9+pbH(seed+'p'+u[0].v.id)*5)%3;let ia=0;
    u.forEach((q,i)=>{if(k>=14)return;const v=q.v;const [x,y]=pts[i];const trab=q.motivo==='trabajo';
      const gr=u.length>1&&pbAdult(v);const right=i%2===0;const up=(post&&i===0&&post.up)||0;
      const act=trab&&key==='obra'?'hammer':(trab&&i===0&&post&&post.act)?post.act:gr?(((ph<1.5)===(ia++%2===0))?'talk':null):(!trab&&pbH(seed+'ph'+v.id)<.4?'phone':null);
      const hh=(hel||(trab&&key==='obra'));
      out.push({x,y,f:()=>{if(up){ctx.save();ctx.translate(0,-up);}pbFig(v,x,y,{act,front:true,right,ph:tt*7,helmet:hh,vest:hh,trabaja:trab});if(up)ctx.restore();},d:x+y+(up?.001:0),v,trab,up,post:!!post});k++;});}
  const kinds=['talk','wait','walk','talk','wait','walk','wait'];let gi=0;
  const nextPerson=kk=>{
    if(known.length&&pbH(seed+'k'+kk)<.2){const p=known[Math.floor(pbH(seed+'q'+kk)*known.length)%known.length];if(!usados.has(p.n)){usados.add(p.n);return {ch:{...p.ch,name:p.n},name:p.n};}} // cada conocido, una sola vez
    const b=ns[Math.floor(pbH(seed+'n'+kk)*ns.length)%ns.length]||{};return {ch:{...b,shirt:pbPick(SHIRTC,seed+'sh'+kk),pants:pbPick(PANTSC,seed+'pa'+kk)},name:null};};
  while(k<n){const kind=kinds[(gi+Math.floor(pbH(seed+'g'+gi)*3))%kinds.length];gi++;if(gi>40)break;
    const base=pbH(seed+'o'+gi);
    if(kind==='talk'&&k+2<=n){const p=spot(seed+'t'+gi,1.6);if(!p)continue;const [x,y]=p;
      const dd=[[.8,0],[-.8,0],[0,.8],[0,-.8]].find(d=>g.ok(x+d[0],y+d[1],.28)&&taken.every(z=>Math.hypot(z[0]-x-d[0],z[1]-y-d[1])>.6));if(!dd){taken.pop();continue;}
      taken.push([x+dd[0],y+dd[1]]);const A=nextPerson(k++),B=nextPerson(k++);const ph=(tt*.9+base*5)%3;
      for(const [Q,xx,yy,rt] of [[A,x,y,true],[B,x+dd[0],y+dd[1],false]])out.push({x:xx,y:yy,f:()=>sPerson(xx,yy,Q.ch,{pose:'stand',act:((ph<1.5)===rt)?'talk':null,front:true,right:rt,helmet:hel,vest:hel,name:Q.name}),d:xx+yy});}
    else if(kind==='walk'){const p=spot(seed+'w'+gi,1.4);if(!p)continue;const ax=pbH(seed+'ax'+gi)<.5;let len=0;const want=1.6+pbH(seed+'l'+gi)*1.8;
      while(len+.25<=want&&g.ok(ax?p[0]+len+.25:p[0],ax?p[1]:p[1]+len+.25,.28))len+=.25;
      if(len<1){taken.pop();continue;}
      const seg=[];for(let s=.5;s<=len+1e-6;s+=.5)seg.push([ax?p[0]+s:p[0],ax?p[1]:p[1]+s]);
      if(seg.some(z=>taken.some(t=>t!==taken[taken.length-1]&&Math.hypot(t[0]-z[0],t[1]-z[1])<1.0))){taken.pop();continue;}
      for(const z of seg)taken.push(z);
      const A=nextPerson(k++);const ex=ax?p[0]+len:p[0],ey=ax?p[1]:p[1]+len;const u=(tt*.12+base*2)%2,fr=u<1?u:2-u;const fw=u<1;
      const x=p[0]+(ex-p[0])*fr,y=p[1]+(ey-p[1])*fr;
      out.push({x,y,f:()=>sPerson(x,y,A.ch,{pose:'walk',ph:tt*7+gi,front:fw,right:ax?fw:!fw,helmet:hel,vest:hel,name:A.name}),d:x+y});}
    else{const p=spot(seed+'e'+gi,1.2);if(!p)continue;const A=nextPerson(k++);const [x,y]=p;const ph=base<.4?'phone':null;
      out.push({x,y,f:()=>sPerson(x,y,A.ch,{pose:'stand',act:ph,front:base<.7,right:base<.5,helmet:hel,vest:hel,name:A.name}),d:x+y});}}
  return out;}
const crowdItems=(E,key,r)=>crowd(E,key,r).map(o=>({d:o.d,f:o.f}));
for(const k of Object.keys(POB)){const _s=SCENES[k];if(!_s)continue;SCENES[k]=function(E){const r=_s.apply(this,arguments);try{if(r&&r.items){const g=pbSuelo(k,E,_s);const o=crowd(E,k,{...r,g});r.pob=o;for(const q of o)r.items.push({d:q.d,f:q.f});}}catch(e){console.error('población',k,e);}return r;};}
