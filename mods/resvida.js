// ---------- vida propia de quien vive en casa (madre, pareja, compis) ----------
const RV_SIT=new Set(['sofa','silla','sillon','butaca','sofacama','banco','bancoj','mesacoc']);
const RV_Z={sofa:8,sofacama:8,sillon:8,butaca:8,silla:9,banco:8,bancoj:8,mesacoc:9};
function rvPlan(h){// [tipos de objeto, act, pose, minutos, peso]
  if(h>=23||h<7){const wake=7*60+Math.random()*50;const until=(h>=23?1440:0)+wake-S.t;return [[['_micama'],'sleep','lie',Math.max(60,until),5,1],[['sofacama','sofa','sillon'],'sleep','lie',Math.max(60,until),.2,1]];}
  const L=[];const meal=(h>=7.5&&h<9.5)||(h>=13.5&&h<15)||(h>=20.5&&h<22);
  if(meal){L.push([['fogon','encimera','micro'],'stir','stand',30,4],[['silla','mesacoc'],'eat','sit',25,4]);}
  L.push([['sofa','sillon','butaca','sofacama'],h>=15?'watch':'book','sit',50,h>=15?2.2:1.2],[['tele','consola'],'watch','stand',15,.4],
    [['planta','flores','huerto','monstera','kentia'],'water','stand',12,1.4],[['libros','estant'],'book','stand',15,.8],[['telefono'],'phone','stand',20,1.2],
    [['lavadora','lavavaj','lavabo','tendedero'],'work','stand',20,1.6],[['compu','escritorio'],'type','sit',40,.6],[['coser','guitarra','piano','tocadisc'],'strum','sit',30,.5],
    [['nevera','fogon','encimera','mesa','mesacoc'],'work','stand',18,1.3],// limpiar / recoger la cocina
    [['espejo','espejopie','armario','comoda'],'phone','stand',10,.5]);
  // a la calle: compra, la vecina, el ambulatorio, el parque… (solo de día)
  if(h>=9&&h<20)L.push([['_fuera'],'away','walk',60+Math.random()*100,h<13?1.5:.9]);
  return L;}
function rvBusy(i,me){if(S.sim.use&&S.sim.use.i===i)return true;return (S.res||[]).some(o=>o!==me&&o.doing&&o.doing.i===i||o!==me&&o.plan&&o.plan.i===i);}
// ---- identificador único por objeto (viaja con él al moverlo) ----
function uidSweep(){if(!S||!S.obj)return;S.nuid=S.nuid||1;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o._tmp&&!o.uid)o.uid=S.nuid++;}}
function objByUid(u){if(u==null)return -1;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&o.uid===u)return i;}return -1;}
const BEDS=['cama','camamat','litera','colchon'];
// la cama de cada residente: la suya por uid; si ya no existe, reclama una libre (no la de Ana ni la de otro)
function myBed(r){uidSweep();let i=objByUid(r.bedUid);if(i>=0&&BEDS.includes(S.obj[i].t))return i;r.bedUid=null;
  const taken=new Set((S.res||[]).filter(q=>q!==r&&q.bedUid!=null).map(q=>q.bedUid));const anaBeds=new Set();if(S.anaBedUid!=null){const k=objByUid(S.anaBedUid);if(k>=0)anaBeds.add(k);}
  if(!anaBeds.size){for(let k=0;k<N*N;k++){const o=S.obj[k];if(o&&BEDS.includes(o.t)&&!o.priv&&typeof inArea==='function'&&S.home&&inArea(k%N,k/N|0))anaBeds.add(k);}}
  if(!anaBeds.size){const u=S.sim.use;if(u&&BEDS.includes(u.type))anaBeds.add(u.i);else if(S.lastBed!=null)anaBeds.add(S.lastBed);}
  if(!anaBeds.size){// la más cercana a donde empieza Ana (su cuarto)
    const A=S.home&&S.home.area;const sx=S.home&&S.home.sim?S.home.sim[0]:(A?(A[0]+A[2])/2+.5:S.sim.x),sy=S.home&&S.home.sim?S.home.sim[1]:(A?(A[1]+A[3])/2+.5:S.sim.y);let best=-1,bd=1e9;for(let k=0;k<N*N;k++){const o=S.obj[k];if(o&&BEDS.includes(o.t)&&!o.priv){const d=Math.hypot(k%N+.5-sx,(k/N|0)+.5-sy);if(d<bd){bd=d;best=k;}}}if(best>=0){anaBeds.add(best);S.anaBedUid=S.obj[best].uid;}}
  const cands=[];for(let k=0;k<N*N;k++){const o=S.obj[k];if(!o||!BEDS.includes(o.t)||taken.has(o.uid)||anaBeds.has(k))continue;if(o.priv&&o.priv!==r.pid&&!(o.priv==='mate'&&r.kind==='mate'))continue;cands.push(k);}
  if(!cands.length)return -1;cands.sort((a,b)=>(S.obj[b].priv?1:0)-(S.obj[a].priv?1:0));const k=cands[0];r.bedUid=S.obj[k].uid;return k;}
function rvObjs(r,pred){const out=[];for(let i=0;i<N*N;i++){const o=S.obj[i];if(!o||!OBJ[o.t]||!pred(OBJ[o.t],o.t))continue;const pv=o.priv;if(pv&&pv!==r.pid&&!(pv==='mate'&&r.kind==='mate'))continue;out.push(i);}
  // si tiene cosas propias de ese tipo, prefiere las suyas
  const own=out.filter(i=>S.obj[i].priv);return own.length?own:out;}
function rvChoose(r){const h=S.t/60;const home=!(S.sim.work>0);
  const close=r.kind==='guest'||r.kind==='partner';
  if(close&&(h>=22||h<8)&&r.kind!=='mate')return false;// pareja/visita: de noche con Ana (y a su cama cuando ella se acuesta)
  if(home&&Math.random()<(close?.45:.18)&&!(h>=23||h<7))return false;// a veces va a charlar con Ana
  const opts=[];for(const [types,act,pose,dur,w,fixed] of rvPlan(h)){if(types[0]==='_fuera'){opts.push({types,act,pose,dur,w,objs:[],fixed:1});continue;}
    let objs;if(types[0]==='_micama'){const b=myBed(r);objs=b>=0&&!rvBusy(b,r)?[b]:[];}else objs=rvObjs(r,(d,t)=>types.includes(t)).filter(i=>!rvBusy(i,r));if(objs.length)opts.push({types,act,pose,dur,w,objs,fixed});}
  if(!opts.length)return false;let tot=opts.reduce((a,o)=>a+o.w,0),x=Math.random()*tot,o=opts[0];for(const q of opts){x-=q.w;if(x<=0){o=q;break;}}
  const cx=Math.floor(r.x),cy=Math.floor(r.y);
  if(o.act==='away'){const e=bfs([cx,cy],(x,y)=>x===0||y===0||x===N-1||y===N-1);if(!e)return false;r.path=e;r.plan={away:1,dur:o.dur,why:rvAwayWhy(r)};return true;}
  // el objeto más cercano al que se pueda llegar
  const tgt=new Map();for(const i of o.objs){const ox=i%N,oy=i/N|0;const nb=neighborsOf(i);for(const [a,b] of [[ox+1,oy],[ox-1,oy],[ox,oy+1],[ox,oy-1]])if(walkable(a,b))tgt.set(a+','+b,i);}
  if(!tgt.size)return false;let p=null;if(tgt.has(cx+','+cy))p=[];else p=bfs([cx,cy],(x,y)=>tgt.has(x+','+y));if(!p)return false;
  const end=p.length?p[p.length-1]:[cx,cy];const i=tgt.get(end[0]+','+end[1]);
  r.path=p;r.plan={i,act:o.act,pose:o.pose,dur:o.fixed?o.dur:o.dur*(.7+Math.random()*.6),t:S.obj[i].t};return true;}
function rvAwayWhy(r){const p=r.pid&&(S.people||[]).find(q=>q.k===r.pid);const old=p&&(p.age||50)>=55;return pickR(old?['a la compra','al ambulatorio','a casa de una amiga','a misa','al banco a protestar','al mercado','a dar un paseo','a la farmacia','a ver a la vecina']:['a la compra','a dar una vuelta','al gimnasio','a hacer un recado','a ver a un amigo','a la biblioteca','al parque']);}
{const _ur=updateResidents;updateResidents=function(gm){const list=residents();const now=S.day*1440+S.t;
  for(const r of list){if(r.kind==='kid')continue;
    if(r.doing){if(now<r.doing.until&&S.obj[r.doing.i]&&S.obj[r.doing.i].t===r.doing.t){r.next=99;continue;}if(r.doing.from){r.x=r.doing.from[0];r.y=r.doing.from[1];}r.doing=null;r.next=0;}
    if(r.away){if(now<r.away.until){r.next=99;continue;}const b=r.away.back;r.away=null;r.x=b[0];r.y=b[1];r.path=[];r.next=4;const p=r.pid&&S.people.find(q=>q.k===r.pid);if(p&&Math.random()<.5&&!(S.sim.work>0)&&throttled('vuelta'+r.pid,3e5))toast(`🚪 ${p.n} ha vuelto`);continue;}
    if(r.plan&&r.plan.away&&(!r.path||!r.path.length)){const pl=r.plan;r.plan=null;r.away={until:now+pl.dur,back:[r.x,r.y]};const p=r.pid&&S.people.find(q=>q.k===r.pid);if(p&&!(S.sim.work>0)&&throttled('sale'+r.pid,3e5))toast(`🚪 ${p.n} se va ${pl.why}`);r.x=-50;r.y=-50;r.next=99;continue;}
    if(r.plan&&(!r.path||!r.path.length)){const pl=r.plan;r.plan=null;if(S.obj[pl.i]&&S.obj[pl.i].t===pl.t){r.doing={...pl,until:now+pl.dur,from:[r.x,r.y]};r.next=99;
        if(pl.pose==='sit'&&RV_SIT.has(pl.t)){r.x=pl.i%N+.52;r.y=(pl.i/N|0)+.52;}continue;}}
    if((!r.path||!r.path.length)&&!r.plan&&(r.next||0)-gm<=0){if(rvChoose(r))r.next=99;}
  }
  _ur(gm);
  for(const r of list){if(r.plan&&r.next>50)r.next=99;}
};}
{const _dr=drawResident;drawResident=function(r){if(r.away)return;const D=r.doing;if(!D)return _dr(r);
  const o=S.obj[D.i];if(!o)return _dr(r);const p=r.pid&&S.people.find(q=>q.k===r.pid);if(!p)return _dr(r);const ch=p.ch||personCh(p);
  if(D.act==='sleep'){const [u,v]=w2v(D.i%N+.5,(D.i/N|0)+.5);const [bx,by]=P(u,v,0);if(cam.z>.6){emoji('💤',bx+Math.sin(performance.now()/700)*2,by-30-((performance.now()/60)%12),9);label(p.n,bx,by-44,'rgba(255,253,248,.9)','#3b3247',8);}return;}
  const ox=D.i%N,oy=D.i/N|0;const [vx,vy]=w2v(ox,oy);let front,right;
  try{setFrame(...wc2vc(ox,oy),o.t,o.r,ox,oy);({front,right}=frontFacing());}catch(e){front=true;right=true;}
  let x=r.x,y=r.y,z=0,pose=D.pose;
  // asiento: el mismo punto y orientación que usa Ana en cada mueble
  const SEAT={sofa:[.5,.55,13],sofacama:[.5,.55,10],sillon:[.5,.56,16],butaca:[.5,.56,16],silla:[.5,.52,11.5],mesacoc:[.5,.52,11.5],banco:[.5,.5,8],bancoj:[.5,.5,8]};
  if(pose==='sit'&&RV_SIT.has(D.t)){const A=SEAT[D.t]||[.5,.5,RV_Z[D.t]||8];try{setFrame(...wc2vc(ox,oy),o.t,o.r,ox,oy);const [bx,by]=LP(A[0],A[1],A[2]);const saved=anaRT.phase;anaRT.phase=0;ctx.save();drawAna(bx,by,{ch,shirt:ch.shirt,mood:70,front,right,pose:'sit',act:D.act==='watch'?null:D.act,noShadow:true});ctx.restore();anaRT.phase=saved;if(cam.z>0.7)label(p.n,bx,by-54,'rgba(255,253,248,.9)','#3b3247',8);return;}catch(e){console.error(e);}}
  else{// de pie o sentada mirando al objeto
    const [a,b]=w2v(x,y),[c,d]=w2v(ox+.5,oy+.5);right=(c-a)-(d-b)>0;front=(c-a)+(d-b)>-.01;if(pose==='sit')pose='stand';}
  const [u,v]=w2v(x,y);const [bx,by]=P(u,v,z);const saved=anaRT.phase;anaRT.phase=0;
  ctx.save();drawAna(bx,by,{ch,shirt:ch.shirt,mood:70,front,right,pose,act:D.act==='watch'?null:D.act,noShadow:z>0});ctx.restore();anaRT.phase=saved;
  if(cam.z>0.7)label(p.n,bx,by-(pose==='sit'?54:66),'rgba(255,253,248,.9)','#3b3247',8);};}
// los dilemas no llegan de madrugada ni mientras duerme: esperan a que se despierte
{const _dt=dlgTick;dlgTick=function(){const h=S.t/60,u=S.sim&&S.sim.use;const asleep=u&&['cama','camamat','litera','colchon','sofacama'].includes(u.type)&&!u.nap;if(asleep||h<7.5||h>=23.5)return;return _dt.apply(this,arguments);};}
{const _su9=startUse;startUse=function(){const r=_su9.apply(this,arguments);try{const u=S.sim.use;if(u&&BEDS.includes(u.type)&&!u.nap){S.lastBed=u.i;S.anaBedUid=S.obj[u.i]&&S.obj[u.i].uid;for(const q of S.res||[])if(q.bedUid===S.anaBedUid)q.bedUid=null;}}catch(e){}return r;};}
// al mudarse: cama de Ana = la de su cuarto; residentes sin cama asignada
{const _ah=applyHome;applyHome=function(type){const r=_ah.apply(this,arguments);try{uidSweep();S.home.sim=[S.sim.x,S.sim.y];S.anaBedUid=null;S.lastBed=null;for(const q of S.res||[])q.bedUid=null;
  let best=-1,bd=1e9;for(let k=0;k<N*N;k++){const o=S.obj[k];if(o&&BEDS.includes(o.t)&&!o.priv){const d=Math.hypot(k%N+.5-S.sim.x,(k/N|0)+.5-S.sim.y);if(d<bd){bd=d;best=k;}}}if(best>=0)S.anaBedUid=S.obj[best].uid;}catch(e){console.error(e);}return r;};}
