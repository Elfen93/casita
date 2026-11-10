// ---------- construir / comprar ----------
function canApply(x,y,t){
  if(!t||!inb(x,y))return false;
  const i=idx(x,y);const [sx,sy]=simCell();const simHere=!S.sim.work&&sx===x&&sy===y;
  const k=t.kind,water=FLOORS[S.floor[i]].water;
  if(k==='floor'){if(S.floor[i]===t.v)return false;if(FLOORS[t.v].water)return !S.wall[i]&&!S.obj[i]&&!simHere;return true;}
  if(k==='wall'||k==='fence')return !S.wall[i]&&!S.obj[i]&&!simHere&&!water;
  if(k==='door')return S.wall[i]===1||S.wall[i]===3||S.wall[i]===4;
  if(k==='win')return S.wall[i]===1||S.wall[i]===2;
  if(k==='paint')return S.wall[i]>0&&(S.wcol[i]||0)!==t.v;
  if(k==='obj')return !S.wall[i]&&!S.obj[i]&&!simHere&&!water&&(t.v!=='compu'||compuFits(x,y));
  if(k==='rot')return !!S.obj[i];
  if(k==='craft')return !S.wall[i]&&!S.obj[i]&&!simHere&&!water&&!jobCells().has(i);
  if(k==='move')return S.held?(!S.wall[i]&&!S.obj[i]&&!simHere&&!water):!!S.obj[i];
  if(k==='del')return !!(S.obj[i]||S.wall[i]||S.floor[i]);
  return false;
}
function costOf(x,y,t){
  const k=t.kind;
  const pm=PM();if(k==='floor')return Math.round(FLOORS[t.v].p*pm);if(k==='wall')return Math.round(20*pm);if(k==='fence')return Math.round(12*pm);if(k==='door')return Math.round(60*pm);if(k==='win')return Math.round(80*pm);if(k==='paint')return Math.round(5*pm);if(k==='obj')return priceOf(t.v,t.q);return 0;
}
let lastPoorToast=0;
function pay(c){if(S.money<c){if(performance.now()-lastPoorToast>1500){toast('No te llega el dinero 💸 ¡A trabajar!');sfx('bad');lastPoorToast=performance.now();}return false;}S.money-=c;return true;}
function bumpMoney(){const m=document.getElementById('money');m.classList.add('bump');setTimeout(()=>m.classList.remove('bump'),180);}
function apply(x,y,t=tool,quiet){
  if(!canApply(x,y,t))return false;
  const i=idx(x,y),k=t.kind;
  if(k==='craft'){const c=CRAFT[t.v];
    if(bancoIdx()==null){toast('Ana necesita un 🛠️ banco de trabajo para fabricar (está en Comprar → Ocio)');sfx('bad');return false;}
    if(lvl(c[0])<c[2]){toast(`Ana no sabe fabricar ${OBJ[t.v].n.toLowerCase()}: pide ${skLabel(c[0])} ${c[2]} y tiene ${lvl(c[0])}`);sfx('bad');return false;}
    const cj=craftJob(t.v,i,true);
    if(S.job){if(S.job.who!=='ana'){toast('Hay una obra de la cooperativa en marcha; espera a que termine');return false;}S.job.steps.push(...cj.steps);S.job.total+=2;}
    else S.job={...cj,who:'ana',total:2};
    toast(`🪚 Encargado a Ana: ${OBJ[t.v].n.toLowerCase()} · materiales ${fmt(craftMat(t.v))}`);sfx('tap');animStart(i,'floor');return true;}
  const cst=costOf(x,y,t),m0=S.money;
  if(!pay(cst))return false;
  const delWhat=k==='del'?(S.obj[i]?'obj':S.wall[i]?'wall':'floor'):null;
  if(k==='floor'){S.floor[i]=t.v;}
  else if(k==='wall'){S.wall[i]=1;S.wcol[i]=t.c||0;}
  else if(k==='fence'){S.wall[i]=4;S.wcol[i]=7;}
  else if(k==='door'){S.wall[i]=2;}
  else if(k==='win'){S.wall[i]=3;}
  else if(k==='paint'){S.wcol[i]=t.v;}
  else if(k==='obj'){S.obj[i]={t:t.v,r:orientFor(t.v,x,y),q:t.q??3,c:100};withChair(i);}
  else if(k==='rot'){const o=S.obj[i];o.r=((o.r||0)+1)%4;}
  else if(k==='move'){
    if(S.held){S.obj[i]={t:S.held.t,r:orientFor(S.held.t,x,y),q:S.held.q??3,c:S.held.c??100};S.held=null;hint.textContent='Toca un mueble para cogerlo';}
    else{S.held={...S.obj[i],from:i};S.obj[i]=null;hint.textContent=`Llevas: ${OBJ[S.held.t].e||'🌿'} ${OBJ[S.held.t].n} · toca dónde dejarlo`;}
  }
  else if(k==='del'){
    if(S.obj[i]){S.money+=sellValue(S.obj[i]);S.obj[i]=null;}
    else if(S.wall[i]){S.money+=Math.round(wallPrice(S.wall[i])/2);S.wall[i]=0;S.wcol[i]=0;}
    else if(S.floor[i]){S.money+=Math.round(FLOORS[S.floor[i]].p/2);S.floor[i]=0;}
  }
  dirty();
  // animación y partículas
  const px=x+.5,py=y+.5;
  if(k==='rot'){animStart(i,'obj');anims.get(i).t0-=180;burst('spark',px,py,20,5,.4,{vz:50,life:.5,col:'#fff'});}
  else if(k==='obj'||(k==='move'&&S.obj[i])){animStart(i,'obj');setTimeout(()=>burst('dust',px,py,2,7,.7,{vz:10,life:.7}),220);}
  else if(k==='wall'||k==='fence'||k==='door'||k==='win'){animStart(i,'wall');burst('dust',px,py,2,quiet?3:6,.6,{vz:8,life:.6});}
  else if(k==='floor'){animStart(i,'floor');if(!quiet)burst('dust',px,py,1,3,.4,{vz:6,life:.5,size:.6});}
  else if(k==='paint'){burst('spark',px,py,30,6,.5,{vz:60,life:.7,col:WALLCOLS[t.v][0]});}
  else if(k==='del'){burst('dust',px,py,8,10,.9,{vz:20,life:.8});burst('chip',px,py,10,delWhat==='obj'?8:5,.8,{vz:120,life:1,col:'#c9b79c'});}
  if(!quiet){if(S.money<m0)floatText('-'+fmt(m0-S.money),px,py,30,'#c0392b');else if(S.money>m0)floatText('+'+fmt(S.money-m0),px,py,30,'#2e8b57');}
  if(!quiet)sfx(k==='del'?'sell':k==='move'||k==='rot'?'pick':k==='floor'||k==='paint'?'tap':'place');
  ensureSimFree();
  const s=S.sim;if(s.path.some(([a,b])=>!walkable(a,b))){s.path=[];s.target=null;s.think=0;if(s.leaving)goWork(true);}
  return true;
}
function returnHeld(){
  if(!S.held)return;const i=S.held.from;
  if(!S.obj[i]&&!S.wall[i])S.obj[i]={t:S.held.t,r:S.held.r,q:S.held.q??3,c:S.held.c??100};else S.money+=priceOf(S.held.t,S.held.q);
  S.held=null;ensureSimFree();dirty();
}
// herramientas de arrastre: habitación (rect con paredes), pared/valla (línea), suelo (rectángulo)
const DRAG_KINDS=['room','wall','fence','floor'];
function shapeCells(a,b,kind){
  const cells=[];
  if(kind==='wall'||kind==='fence'){
    const dx=b[0]-a[0],dy=b[1]-a[1];
    if(Math.abs(dx)>=Math.abs(dy)){const s=Math.sign(dx)||1;for(let k=0;k<=Math.abs(dx);k++)cells.push([a[0]+k*s,a[1]]);}
    else{const s=Math.sign(dy);for(let k=0;k<=Math.abs(dy);k++)cells.push([a[0],a[1]+k*s]);}
    return {cells,w:cells.length,h:1};
  }
  const x0=Math.max(0,Math.min(a[0],b[0])),x1=Math.min(N-1,Math.max(a[0],b[0])),y0=Math.max(0,Math.min(a[1],b[1])),y1=Math.min(N-1,Math.max(a[1],b[1]));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)cells.push([x,y,x===x0||x===x1||y===y0||y===y1]);
  return {cells,w:x1-x0+1,h:y1-y0+1};
}
function buildPreview(a,b){
  const k=tool.kind;const sh=shapeCells(a,b,k);
  const pv={walls:new Map(),floors:new Map(),bad:new Set(),cost:0,label:''};
  if(k==='wall'||k==='fence'){
    const t={kind:k};
    for(const [x,y] of sh.cells){if(!inb(x,y))continue;const i=idx(x,y);if(S.wall[i])continue;pv.walls.set(i,k==='fence'?4:1);if(canApply(x,y,t))pv.cost+=costOf(x,y,t);else pv.bad.add(i);}
    pv.label=`${sh.w} ${k==='fence'?'valla':'pared'}${sh.w>1?(k==='fence'?'s':'es'):''}`;
  } else if(k==='floor'){
    for(const [x,y] of sh.cells){const i=idx(x,y);if(canApply(x,y,tool)){pv.floors.set(i,tool.v);pv.cost+=Math.round(FLOORS[tool.v].p*PM());}}
    pv.label=`${sh.w}×${sh.h} ${FLOORS[tool.v].n.toLowerCase()}`;
  } else if(k==='room'){
    const wt={kind:'wall'},ft={kind:'floor',v:lastFloor};
    for(const [x,y,edge] of sh.cells){const i=idx(x,y);
      if(edge&&sh.w>1&&sh.h>1){if(S.wall[i])continue;pv.walls.set(i,1);if(canApply(x,y,wt))pv.cost+=Math.round(20*PM());else pv.bad.add(i);}
      else if(canApply(x,y,ft)&&!S.wall[i]){pv.floors.set(i,lastFloor);pv.cost+=Math.round(FLOORS[lastFloor].p*PM());}
    }
    if(sh.w<3||sh.h<3)pv.label='Arrastra más grande (mín. 3×3)';
    else pv.label=`Habitación ${sh.w-2}×${sh.h-2} · ${(sh.w-2)*(sh.h-2)*4} m²`;
    pv.small=sh.w<3||sh.h<3;
  }
  return pv;
}
function commitPreview(){
  const pv=preview;preview=null;if(!pv)return;
  if(pv.small){toast('Las habitaciones necesitan al menos 3×3 casillas');sfx('bad');return;}
  beginStroke();let n=0,fail=false;const mStart=S.money;let lastI=null;
  let ord=0;
  for(const [i,ft] of pv.floors){if(!apply(i%N,i/N|0,{kind:'floor',v:ft},true)){fail=true;break;}n++;lastI=i;const a=anims.get(i);if(a)a.t0+=ord*12;ord++;}
  ord=0;
  if(!fail)for(const [i,wt] of pv.walls){if(pv.bad.has(i))continue;if(!apply(i%N,i/N|0,{kind:wt===4?'fence':'wall'},true)){fail=true;break;}n++;lastI=i;const a=anims.get(i);if(a)a.t0+=ord*35;ord++;}
  if(n&&lastI!=null&&S.money<mStart)floatText('-'+fmt(mStart-S.money),lastI%N+.5,(lastI/N|0)+.5,40,'#c0392b');
  endStroke();
  if(n){sfx('build');if(tool&&tool.kind==='room'){computeRooms();toast('🏗️ ¡Habitación construida! Pon una 🚪 puerta y alguna 🪟 ventana');}}
  else if(!fail)sfx('bad');
}
function liveTap(x,y){
  if(viewPlace){const k=S.sim.dest;if(k&&PLACES[k])openPlace(k);else toast('Ana está fuera');return;}
  if(!inb(x,y))return;const s=S.sim;
  if(s.work>0){if(s.dest&&PLACES[s.dest])return openPlace(s.dest);return toast(s.dest==='_ride'?'Ana está repartiendo por el barrio':'Ana no está en casa. Acelera el tiempo 10×');}
  const [sx,sy]=simCell();if(x===sx&&y===sy){openMenu();return;}
  const o=S.obj[idx(x,y)];
  if(o){const d=OBJ[o.t];const ii=idx(x,y);
    if(d.need&&!usable(o)){const [fk,fl]=stepReq({k:'fix',i:ii});if(lvl(fk)<fl){toast(`💥 ${d.n} rota. Ana no sabe arreglarla (pide ${skLabel(fk)} ${fl}, tiene ${lvl(fk)}): llama a un técnico o cámbiala desde 📋`);sfx('bad');return;}addFixStep(ii,true);toast(`💥 ${d.n} rota · Ana intentará arreglarla (${skLabel(fk)} ${lvl(fk)})`);sfx('tap');return;}
    if(d.need&&condOf(o)<60&&throttled('st'+ii,15000))toast(`${d.n} ${TIERS[o.q??3].e} · estado ${Math.round(condOf(o))}%`);
    if(d.need){enqueue({k:'obj',i:idx(x,y)});if(d.sk&&throttled('sk'+o.t,60000))toast(`${d.n}: entrena ${SKILLS.find(q=>q[0]===d.sk)[2]}`);}else toast(`${d.n}: hace la casa más bonita (+ánimo) ${d.e||'🌿'}`);return;}
  if(FLOORS[S.floor[idx(x,y)]].water){toast('Ana mira la piscina con ganas de verano 🏊‍♀️');return;}
  if(walkable(x,y)){const p=bfs(simCell(),(a,b)=>a===x&&b===y);if(p){sfx('tap');s.leaving=false;s.use=null;s.path=p;s.target=null;s.cmd=true;s.think=40;}else toast('No hay camino 🚧');}
}

