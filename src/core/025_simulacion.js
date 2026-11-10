// ---------- simulación ----------
function lowestNeed(){let k='hambre',v=999;for(const [n] of NEEDS)if(S.needs[n]<v){v=S.needs[n];k=n;}return [k,v];}
function simCell(){return [Math.floor(S.sim.x),Math.floor(S.sim.y)];}
function bfs(start,isTarget){
  const [sx,sy]=start; if(!inb(sx,sy))return null;
  if(isTarget(sx,sy))return [];
  const prev=new Int16Array(N*N).fill(-1), seen=new Uint8Array(N*N);
  const q=[idx(sx,sy)];seen[q[0]]=1;let qi=0;
  while(qi<q.length){
    const c=q[qi++],cx=c%N,cy=c/N|0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cx+dx,ny=cy+dy;if(!walkable(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni])continue;seen[ni]=1;prev[ni]=c;
      if(isTarget(nx,ny)){const path=[];let k=ni;while(k!==idx(sx,sy)){path.unshift([k%N,k/N|0]);k=prev[k];}return path;}
      q.push(ni);
    }
  }
  return null;
}
function neighborsOf(i){const x=i%N,y=i/N|0;return [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>walkable(a,b));}
function pathToObj(cands){
  const tmap=new Map();for(const i of cands){const st=typeof seatFor==='function'?seatFor(i):null;for(const [a,b] of neighborsOf(st!=null?st:i))if(!tmap.has(idx(a,b)))tmap.set(idx(a,b),i);}
  if(!tmap.size)return null;
  const path=bfs(simCell(),(x,y)=>tmap.has(idx(x,y)));
  if(!path)return null;
  const last=path.length?path[path.length-1]:simCell();
  return {path,obj:tmap.get(idx(last[0],last[1]))};
}
const primaryNeed=t=>{const d=OBJ[t];return d&&d.need?Object.keys(d.need)[0]:null;};
function go(r,goal,cmd){const s=S.sim;s.leaving=false;s.use=null;s.path=r.path;s.target=r.obj;s.goal=goal;s.cmd=!!cmd;s.stuck=false;if(!r.path.length)startUse();}
function goUse(i,quiet,cmd){
  if(S.obj[i]&&!usable(S.obj[i])){if(!quiet)toast(`${OBJ[S.obj[i].t].n} está rota 💥 Tócala en Vivir para arreglarla`);return false;}
  const r=pathToObj([i]);
  if(!r){if(!quiet)toast('Ana no puede llegar ahí 🚧 ¿Falta una puerta?');return false;}
  go({path:r.path,obj:i},primaryNeed(S.obj[i].t),cmd);return true;
}
function startMeal(){const s=S.sim,i=s.mealJ;s.mealJ=null;if(i==null||!S.obj[i])return;const seat=seatFor(i);if(seat==null)return;s.use={type:'_meal',i,seat,t:0,dur:28,goal:'diversion'};}
function startUse(){const s=S.sim,i=s.target;s.target=null;const o=S.obj[i];if(!o||!OBJ[o.t]?.need){s.cmd=false;return;}
  const d=OBJ[o.t];const goal=s.goal&&d.need[s.goal]?s.goal:primaryNeed(o.t);
  s.use={type:o.t,i,t:0,goal,cmd:s.cmd};s.goal=null;tally('used',o.t);
  if(o.t==='huerto')gardenCare(i);
  if(o.t==='telefono')phoneCall();
  if((o.t==='fogon'||o.t==='barbacoa')&&(S.pantry||0)>0&&goal==='hambre'){S.pantry--;s.use.home=true;floatText('🥕 de su huerto',i%N+.5,(i/N|0)+.5,40,'#2e8b57');}
  else if(o.t==='barbacoa'&&goal==='hambre'){const fc=Math.round((Dm().food||1)*2.2*MK().price);S.money-=fc;floatText('-'+fmt(fc)+' 🛒',i%N+.5,(i/N|0)+.5,40,'#c0392b');}
  else if((o.t==='nevera'||o.t==='fogon')&&Dm().food){const fc=Math.round(Dm().food*(o.t==='fogon'?1.4:1));S.money-=fc;floatText('-'+fmt(fc)+' 🛒',o.t?i%N+.5:s.x,(i/N|0)+.5,40,'#c0392b');}
  const seat=seatFor(i);if(seat!=null)s.use.seat=seat;else if(o.t==='compu'&&throttled('noseat',90000))toast('Ana usa el ordenador de pie: le iría bien una 🪑 silla al lado');
  if(o.t==='banco'){s.use.trainSk=['carp','elec','font'].sort((a,b)=>S.skills[a]-S.skills[b])[0];}
  if(o.t==='cama'){const h=S.t/60;s.use.nap=!(h>=20.5||h<6);if(s.use.nap)toast('😴 Ana se echa una siesta');}}
const outdoorOk=t=>!(t==='barbacoa'||t==='bancoj'||!!(OBJ[t]&&OBJ[t].wx))||(!['lluvia','tormenta','nieve'].includes((S.weather||{}).k)&&S.t/60>8&&S.t/60<21.5);
function findObjs(pred){const r=[];for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&pred(OBJ[o.t],o.t))r.push(i);}return r;}
// Mejor objeto alcanzable para una necesidad: primero los que más rinden, luego el más cercano.
function bestObjFor(k){
  const all=findObjs(d=>d.need&&d.need[k]);
  if(!all.length)return {none:true};
  const cands=all.filter(i=>usable(S.obj[i])&&outdoorOk(S.obj[i].t));
  if(!cands.length)return all.some(i=>usable(S.obj[i]))?{none:true}:{broken:true,obj:all[0]};
  const tiers=[...new Set(cands.map(i=>OBJ[S.obj[i].t].need[k]))].sort((a,b)=>b-a);
  for(const rate of tiers){const r=pathToObj(cands.filter(i=>OBJ[S.obj[i].t].need[k]===rate));if(r)return r;}
  return {unreach:true,obj:cands[0]};
}
const WEIGHT={vejiga:1.5,hambre:1.25,energia:1.15,higiene:0.85,diversion:0.7,social:0.6};
const NEEDNAME={hambre:'comer',energia:'dormir',higiene:'ducharse',vejiga:'ir al baño',diversion:'divertirse',social:'charlar con alguien'};
function autonomy(){
  const s=S.sim; if(s.leaving)return;
  const h=S.t/60, nd=S.needs;
  const urg={};
  for(const [k] of NEEDS)if(nd[k]<60&&k!=='energia')urg[k]=(100-nd[k])**2*WEIGHT[k];
  // dormir: de noche (desde las 21 si está cansada, desde las 23 siempre); de día solo una siesta si está agotada
  const bedtime=h>=23||h<6||(h>=21&&nd.energia<75);
  if(bedtime)urg.energia=(100-nd.energia+60)**2*WEIGHT.energia;
  else if(nd.energia<15)urg.energia=(100-nd.energia)**2*WEIGHT.energia;
  const order=Object.keys(urg).sort((a,b)=>urg[b]-urg[a]);
  const solvable=k=>findObjs(d=>d.need&&d.need[k]).some(i=>usable(S.obj[i]));
  const phys=k=>k==='vejiga'||k==='hambre'||k==='higiene';
  if(shouldWork()&&(S.t/60>=7.95||!order.some(k=>phys(k)&&nd[k]<20&&solvable(k)))&&!order.some(k=>(k==='vejiga'||k==='hambre')&&nd[k]<6&&solvable(k))){goWork(true);return;}
  const critLim=k=>(k==='diversion'||k==='social')?18:30;
  if(!order.some(k=>nd[k]<critLim(k)&&solvable(k))){
    if(shouldWork()){goWork(true);return;}
    planTick();
    if(S.job&&S.job.who==='ana'&&doJobStep())return;
  }
  if(nd.hambre<35&&!solvable('hambre')){if(S.money>-200)goOut('eat');else goOut('comedor');return;}
  if(nd.hambre<15&&S.money<-300&&Dm().food){goOut('comedor');return;}
  if(!order.some(k=>nd[k]<(k==='diversion'||k==='social'?25:40))){if(maybeOuting())return;if(gardenChore())return;}
  let stuck=false;
  for(const k of order){
    const r=bestObjFor(k);
    if(r.path){go(r,k,false);return;}
    if(r.none)hintMissing(k);else if(r.unreach)hintBlocked(k,r.obj);else if(r.broken&&throttled('br'+k,40000))toast(`Ana quiere ${NEEDNAME[k]}, pero ${OBJ[S.obj[r.obj].t].n.toLowerCase()} está rota 💥`);
    if(nd[k]<30&&(r.unreach||r.broken||(r.none&&k!=='diversion'&&k!=='social')))stuck=true;
  }
  // si algo básico está en rojo y no puede resolverlo, se queda quieta pidiendo ayuda
  s.stuck=stuck;if(stuck)return;
  if(Math.random()<0.4){
    const funs=findObjs((d,t)=>d.need&&(d.need.diversion||d.need.social)&&(!d.need.energia||(T('perezosa')&&t==='sofa')||t==='bancoj')).filter(i=>usable(S.obj[i])&&outdoorOk(S.obj[i].t));
    if(funs.length&&(S.needs.diversion<85||S.needs.social<85)){
      const next=CAREER[S.career+1];
      const useful=next?funs.filter(i=>{const sk=OBJ[S.obj[i].t].sk;return sk&&reqOf(next)[sk]&&lvl(sk)<reqOf(next)[sk];}):[];
      const favT=(S.traits||[]).flatMap(k=>FAVS[k]||[]);const fav=funs.filter(i=>favT.includes(S.obj[i].t));
      const pool=fav.length&&Math.random()<0.65?fav:useful.length&&Math.random()<0.6?useful:funs;
      goUse(pool[Math.floor(Math.random()*pool.length)],true);return;
    }
  }
  if(Math.random()<0.3){
    const [cx,cy]=simCell();
    for(let tries=0;tries<8;tries++){const tx=cx+Math.round(Math.random()*6-3),ty=cy+Math.round(Math.random()*6-3);if(walkable(tx,ty)){const p=bfs([cx,cy],(x,y)=>x===tx&&y===ty);if(p&&p.length){s.path=p;return;}}}
  }
}
const HINT={hambre:'una 🧊 nevera o un 🍳 fogón',energia:'una 🛏️ cama',higiene:'una 🚿 ducha',vejiga:'un 🚽 váter',diversion:'algo divertido (📺 🎸 📚)',social:'un ☎️ teléfono, 🪞 espejo o 💻 ordenador'};
const hintT={};
function throttled(key,ms){const n=performance.now();if(hintT[key]&&n-hintT[key]<ms)return false;hintT[key]=n;return true;}
function hintMissing(k){if(throttled('m'+k,90000))toast(`Ana necesita ${HINT[k]} — ¡ve a Comprar!`);}
function hintBlocked(k,i){if(throttled('b'+k,30000))toast(`Ana quiere ${NEEDNAME[k]}, pero no llega a: ${OBJ[S.obj[i].t].n} 🚧 ¿Falta una puerta o está rodeado?`);}
