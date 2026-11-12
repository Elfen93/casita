// ---------- planes de Ana: deseos, compras y obras ----------
const NEED_BUY=DATA.objetos.compra_por_necesidad;
const ROOM_FOR=DATA.objetos.habitacion_de;
const OUTDOOR=new Set(['arbol','flores','seto','farola','huerto','bancoj','barbacoa','fuente']);
for(const t of ['hamaca','columpio','elastica','caseta','tendedero','compost','parrilla'])OUTDOOR.add(t);
const BUILDERS=DATA.personas.obreros;
const STEP_T={rezone:1,undoor:8,clear:6,move:10,floor:3,wall:8,door:10,win:10,paint:4,obj:16,water:6,fix:14,replace:16};
const STEP_NAME={rezone:'reorganizar',undoor:'tapiar puerta',clear:'despejar',move:'traslado',craft:'fabricación',floor:'suelo',wall:'pared',door:'puerta',win:'ventana',paint:'pintura',obj:'montaje',water:'piscina',fix:'reparación',replace:'cambio'};
function reserveMoney(){return Math.round(reserveMoney0()*(isI('conservadora')?1.3:1));}
function reserveMoney0(){const d=dateOf(S.day).wd;return Math.round(utilEstimate()*0.6+(housingWeekly()*(d===0&&S.t<8*60?1:Math.max(0.35,(7-d)/7))+60)*(T('ahorradora')?1.8:T('derrochadora')?0.6:1));}
const spare=()=>S.money-reserveMoney();
function stepCost(st){
  if(st.k==='floor'||st.k==='water')return Math.round(FLOORS[st.v].p*PM());
  const pm=PM();if(st.k==='undoor')return Math.round(20*pm);if(st.k==='wall')return Math.round(20*pm);if(st.k==='door')return Math.round(60*pm);if(st.k==='win')return Math.round(80*pm);if(st.k==='paint')return Math.round(5*pm);if(st.k==='craft')return craftMat(st.v);if(st.k==='obj')return st.crafted?0:priceOf(st.v,st.q);if(st.k==='fix'){const o=S.obj[st.i];return o?Math.round(priceOf(o.t,o.q)*0.15):0;}if(st.k==='replace'){const o=S.obj[st.i];return o?Math.max(0,priceOf(o.t,st.q)-Math.round(priceOf(o.t,o.q)*0.1)):0;}return 0;
}
function jobCost(j){return j.steps.reduce((a,st)=>a+(st.done?0:stepCost(st)),0);}
function bfsCount(start){const [sx,sy]=start;if(!walkable(sx,sy))return 0;const seen=new Uint8Array(N*N);const q=[idx(sx,sy)];seen[q[0]]=1;let n=0,qi=0;while(qi<q.length){const c=q[qi++];n++;const x=c%N,y=c/N|0;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(!walkable(a,b))continue;const j=idx(a,b);if(seen[j])continue;seen[j]=1;q.push(j);}}return n;}
const isDoorNear=(x,y)=>[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].some(([a,b])=>inb(a,b)&&S.wall[idx(a,b)]===2);
const jobCells=()=>new Set(S.job?S.job.steps.filter(s=>!s.done&&s.i!=null).map(s=>s.i):[]);

// Elige un buen sitio: en una habitación cuyo uso encaje, que no esté llena, contra la pared y sin cortar el paso.
function pickSpot(t,onlyRoom){
  computeRooms();
  const zs=OBJ_ZONES[t]||['salon'],out=zs[0]==='jardin',reserved=jobCells(),[sx,sy]=simCell();
  const cands=[];
  for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){
    const i=idx(x,y);
    if(!walkable(x,y)||reserved.has(i)||(x===sx&&y===sy)||isDoorNear(x,y))continue;
    if(neighborsOf(i).length<1)continue;
    let sc=0;const r=roomId[i];
    if(r<0){if(!zs.includes('jardin'))continue;if(onlyRoom!=null)continue;sc+=out?6:1;sc+=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].some(([a,b])=>solidAt(a,b))?3:0;sc+=FLOORS[S.floor[i]].p===0?1:-2;}
    else{
      if(onlyRoom!=null&&r!==onlyRoom)continue;
      const rr=rooms[r],p=rr.purpose;
      if(!allowedIn(t,p)||roomFull(rr,t))continue;
      const pi=zs.indexOf(p);sc+=pi>=0?10-pi*2:p==='loft'?4:2;
      if(p==='loft')sc+=clusterScore(t,x,y);
      if(t==='silla'){let near=false;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(!inb(a,b))continue;const j=idx(a,b),o2=S.obj[j];if(o2&&SEATED.has(o2.t)&&chairsAround(j)<(o2.t==='compu'||o2.t==='escritorio'?1:2)){sc+=16;near=true;}}if(!near)continue;}
      if(t==='mesa'||t==='compu'){const free=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>walkable(a,b)).length;if(free<2)sc-=6;}
      if(BACKD[t]!=null&&[[0,-1],[1,0],[0,1],[-1,0]].some(([a,b])=>solidAt(x+a,y+b)))sc+=4;
      // no tapar ventanas con muebles altos
      if((OBJ[t].h||0)>30&&[[0,-1],[1,0],[0,1],[-1,0]].some(([a,b])=>inb(x+a,y+b)&&S.wall[idx(x+a,y+b)]===3))sc-=3;
    }
    sc-=Math.hypot(x-sx,y-sy)*0.05;sc+=Math.random()*0.4;
    cands.push([sc,i]);
  }
  cands.sort((a,b)=>b[0]-a[0]);
  const before=bfsCount(simCell());
  for(const [,i] of cands.slice(0,25)){if(t==='compu'&&!compuFits(i%N,i/N|0))continue;S.obj[i]={t:'mesa'};const after=bfsCount(simCell());S.obj[i]=null;if(after>=before-1)return i;}
  return null;
}
// Quiere un objeto: si no hay una zona adecuada con hueco, primero quiere ampliar la casa
function wantFor(t,why,urgent){
  const w=wantBuy(t,why);if(urgent)w.urgent=true;
  if(pickSpot(t)!=null)return w;
  if(SMALL_ITEMS.has(t))return null; // por una silla, planta o lámpara no se construye un cuarto
  computeRooms();const zs=(OBJ_ZONES[t]||['salon']).filter(z=>z!=='jardin');if(!zs.length)return null;
  if(!ZONE_OF[t]&&zs.some(z=>rooms.some(r=>r.purpose===z)))return null; // ya hay sitio de su tipo (aunque lleno): no vale un cuarto nuevo
  const z=zs.find(z=>!rooms.some(r=>r.purpose===z))||zs[0];
  if(rooms.filter(r=>r.purpose===z).length>=2)return null;
  const r=planRoom(z);
  if(r){r.why=`para poner ${OBJ[t].n.toLowerCase()} (no hay sitio)`;return r;}
  return urgent?w:null;
}
function wantBuy(t,why){return {key:'buy-'+t,name:OBJ[t].n,emoji:OBJ[t].e||'🌿',why,kind:'buy',steps:[{k:'obj',v:t,i:null,q:3}]};}
// calidad-precio: lo Normal suele compensar; Premium solo si le sobra mucho; Básico si es urgente y va justa
function pickTier(t,urgent){const sp=spare();if(T('ahorradora')||isI('ecologista'))return sp>=priceOf(t,3)*2.2?3:2;if(T('derrochadora')&&sp>=priceOf(t,4)*1.3)return 4;if(sp>=priceOf(t,4)*3+300)return 4;if(sp>=priceOf(t,3)*1.2)return 3;if(urgent||sp<priceOf(t,3))return 2;return 3;}

// Busca dónde levantar una habitación nueva pegada a la casa
function planRoom(purpose,moves){
  computeRooms();
  const sizes=purpose&&ZONES[purpose].size?ZONES[purpose].size:[[5,4],[4,5],[4,4],[5,5],[6,4],[4,6]];
  const [sx,sy]=simCell();let cands=[];
  const hc=(()=>{let a=0,b=0,n=0;for(const r of rooms)for(const c of r.cells){a+=c%N;b+=c/N|0;n++;}return n?[a/n,b/n]:[N/2,N/2];})();
  for(const [w,h] of sizes)for(let x0=1;x0+w<=N-1;x0++)for(let y0=1;y0+h<=N-1;y0++){
    let ok=true,shared=0,nw=0,clr=0;
    for(let y=y0;y<y0+h&&ok;y++)for(let x=x0;x<x0+w;x++){
      const i=idx(x,y),edge=x===x0||y===y0||x===x0+w-1||y===y0+h-1;
      if((x===sx&&y===sy)||FLOORS[S.floor[i]].water||S.wall[i]===4){ok=false;break;}
      if(S.obj[i]){if(roomId[i]>=0||!(OUTDOOR.has(S.obj[i].t)||OBJ[S.obj[i].t].green||SMALL_ITEMS.has(S.obj[i].t)||S.obj[i].t==='banco')){ok=false;break;}clr++;}
      if(edge){if(S.wall[i])shared++;else nw++;}else if(S.wall[i]||roomId[i]>=0){ok=false;break;}
    }
    if(!ok)continue;
    let sc=shared*3-nw*0.5-clr*1.2-Math.hypot(x0+w/2-hc[0],y0+h/2-hc[1])*0.6;if(rooms.length&&shared<2)sc-=30;
    if(purpose){const nb=new Set();for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const edge=x===x0||y===y0||x===x0+w-1||y===y0+h-1;if(!edge||!S.wall[idx(x,y)])continue;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(!inb(a,b))continue;const rr=roomId[idx(a,b)];if(rr>=0&&rooms[rr]&&!(a>x0&&a<x0+w-1&&b>y0&&b<y0+h-1))nb.add(rooms[rr].purpose);}}
      for(const p of nb){if((NEAR[purpose]||[]).includes(p))sc+=5;else if(PRIVATE.has(p)&&!PRIVATE.has(purpose))sc-=6;}}
    cands.push({sc,x0,y0,w,h});
  }
  cands.sort((a,b)=>b.sc-a.sc);
  for(const c of cands.slice(0,12)){const plan=roomSteps(c,purpose,moves);if(plan)return plan;}
  return null;
}
function roomSteps({x0,y0,w,h},purpose,moves){
  const per=[],inner=[];
  for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const edge=x===x0||y===y0||x===x0+w-1||y===y0+h-1;(edge?per:inner).push([x,y]);}
  const corner=(x,y)=>(x===x0||x===x0+w-1)&&(y===y0||y===y0+h-1);
  const outward=(x,y)=>x===x0?[-1,0]:x===x0+w-1?[1,0]:y===y0?[0,-1]:[0,1];
  // puerta: en una pared compartida con la casa o, si no, mirando hacia ella
  let door=null,best=-1e9;
  for(const [x,y] of per){if(corner(x,y))continue;const [dx,dy]=outward(x,y);const ox=x+dx,oy=y+dy;if(!inb(ox,oy))continue;const oi=idx(ox,oy);
    const orm=roomId[oi]>=0?rooms[roomId[oi]]:null;
    const sharedDoor=S.wall[idx(x,y)]===1&&!!orm&&!PRIVATE.has(orm.purpose);const outDoor=!S.wall[idx(x,y)]&&walkable(ox,oy)&&(!rooms.length||!purpose||OUTDOOR_OK.has(purpose));
    if(!sharedDoor&&!outDoor)continue;
    const sc=(sharedDoor?10+(purpose&&(NEAR[purpose]||[]).includes(orm.purpose)?6:0):0)-Math.abs(x-(x0+w/2-.5))-Math.abs(y-(y0+h/2-.5));if(sc>best){best=sc;door=[x,y];}}
  if(!door)return null;
  // comprobar que nada queda encerrado
  const badBefore=badRooms().length;
  const clears=[];for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=idx(x,y);if(S.obj[i])clears.push([i,S.obj[i]]);}
  for(const [i] of clears)S.obj[i]=null;
  const saved=S.wall.slice(),savedZ=S.zone.slice();
  for(const [x,y] of per)if(!S.wall[idx(x,y)])S.wall[idx(x,y)]=1;S.wall[idx(...door)]=2;
  if(purpose)for(const [x,y] of inner)S.zone[idx(x,y)]=purpose;dirty();computeRooms();
  const circOK=badRooms().length<=badBefore&&(()=>{const nr=roomId[idx(...inner[0])];return nr<0||reachableRooms().has(nr);})();
  const ok=(()=>{const st=simCell();if(!walkable(...st))return false;const n=bfsCount(st);const need=findObjs(()=>true).every(i=>neighborsOf(i).length===0||pathToObj([i])!=null);return n>4&&need&&bfs(st,(a,b)=>a>x0&&a<x0+w-1&&b>y0&&b<y0+h-1)!=null;})();
  S.wall=saved;S.zone=savedZ;for(const [i,o] of clears)S.obj[i]=o;dirty();computeRooms();
  if(!ok||!circOK)return null;
  // ventana en la pared exterior más larga
  let win=null;
  for(const [x,y] of per){if(corner(x,y)||(x===door[0]&&y===door[1])||S.wall[idx(x,y)])continue;const [dx,dy]=outward(x,y);if(!inb(x+dx,y+dy)||roomId[idx(x+dx,y+dy)]>=0)continue;if(Math.abs(x-door[0])+Math.abs(y-door[1])<2)continue;win=[x,y];if(Math.random()<.5)break;}
  const fl=purpose==='bano'||purpose==='cocina'?(Math.random()<.5?2:5):purpose==='taller'?4:purpose==='dormitorio'?(Math.random()<.5?3:6):[1,6][Math.random()*2|0];
  const steps=clears.map(([i,o])=>({k:'clear',i,v:o.t}));
  for(const [x,y] of inner)if(S.floor[idx(x,y)]!==fl)steps.push({k:'floor',v:fl,i:idx(x,y)});
  steps.push({k:'door',i:idx(...door)});
  for(const [x,y] of per){const i=idx(x,y);if(!S.wall[i]&&!(x===door[0]&&y===door[1]))steps.push({k:'wall',i});}
  if(win)steps.push({k:'win',i:idx(...win)});
  const Z=purpose?ZONES[purpose]:null;
  return {key:`room-${purpose||'x'}`,name:Z?`${Z.n} nuevo`.replace('Cocina nuevo','Cocina nueva'):'Habitación nueva',emoji:Z?Z.e:'🏗️',why:`de ${(w-2)*(h-2)*4} m²`,kind:'build',steps,purpose,inner:inner.map(([x,y])=>idx(x,y)),moves:moves||null};
}
function planWindows(){
  computeRooms();const steps=[];const have=count(i=>S.wall[i]===3);
  for(let i=0;i<N*N&&steps.length<3-have;i++){
    if(S.wall[i]!==1)continue;const x=i%N,y=i/N|0;
    const hor=solidAt(x-1,y)&&solidAt(x+1,y)&&!S.wall[idx(x,y-1)]&&!S.wall[idx(x,y+1)],ver=solidAt(x,y-1)&&solidAt(x,y+1)&&!S.wall[idx(x-1,y)]&&!S.wall[idx(x+1,y)];
    if(!hor&&!ver)continue;
    const [a,b]=hor?[[x,y-1],[x,y+1]]:[[x-1,y],[x+1,y]];
    const ia=inb(...a)?roomId[idx(...a)]:-1,ib=inb(...b)?roomId[idx(...b)]:-1;
    if((ia>=0)===(ib>=0))continue;
    if([[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(([p,q])=>inb(p,q)&&(S.wall[idx(p,q)]===2||S.wall[idx(p,q)]===3)))continue;
    if(steps.some(s=>Math.abs(s.i%N-x)+Math.abs((s.i/N|0)-y)<3))continue;
    steps.push({k:'win',i});
  }
  return steps.length?{key:'win',name:'Ventanas',emoji:'🪟',why:'para que entre luz',kind:'build',steps}:null;
}
function planPaint(){
  computeRooms();if(!rooms.length)return null;
  const r=rooms.slice().sort((a,b)=>b.cells.length-a.cells.length)[0];
  const set=new Set();for(const c of r.cells){const x=c%N,y=c/N|0;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(!inb(a,b))continue;const j=idx(a,b);if(S.wall[j]&&S.wall[j]!==4&&!S.wcol[j])set.add(j);}}
  if(set.size<4)return null;
  const v=1+(Math.random()*(WALLCOLS.length-3)|0);
  return {key:'paint',name:'Pintar '+r.name.toLowerCase(),emoji:'🎨',why:'de color '+WALLCOLS[v][1].toLowerCase(),kind:'build',steps:[...set].slice(0,14).map(i=>({k:'paint',v,i}))};
}
function planDecor(){
  computeRooms();const r=rooms.filter(r=>r.stars<5).sort((a,b)=>a.stars-b.stars)[0];if(!r)return null;
  const hasLight=r.cells.some(c=>S.obj[c]&&OBJ[S.obj[c].t].light);
  const t=!hasLight?'lampara':Math.random()<.5?'planta':'alfombra';
  if(roomFull(r,t))return null;const j=wantBuy(t,'para mejorar '+r.name.toLowerCase());j.steps[0].room=r.id;return j;
}
function planPool(){
  computeRooms();const [sx,sy]=simCell();
  for(let tries=0;tries<200;tries++){
    const w=3,h=2+(Math.random()*2|0),x0=1+(Math.random()*(N-w-2)|0),y0=1+(Math.random()*(N-h-2)|0);let ok=true;
    for(let y=y0-1;y<=y0+h&&ok;y++)for(let x=x0-1;x<=x0+w;x++){if(!inb(x,y)){ok=false;break;}const i=idx(x,y);if(S.wall[i]||S.obj[i]||roomId[i]>=0||(x===sx&&y===sy)||S.floor[i]===4){ok=false;break;}}
    if(!ok)continue;
    const steps=[];for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)steps.push({k:'water',v:9,i:idx(x,y)});
    return {key:'pool',name:'Piscina',emoji:'🏊‍♀️',why:'para el verano',kind:'build',steps};
  }
  return null;
}
function chooseWant(){
  let worst=null,wc=101;for(let i=0;i<N*N;i++){const o=S.obj[i];if(!o||!OBJ[o.t].need)continue;const c=condOf(o);if(c<wc){wc=c;worst=i;}}
  if(worst!=null&&wc<=0){const o=S.obj[worst];const nq=pickTier(o.t,true);
    if(((o.fails||0)>=2||(o.q??3)<=2)&&spare()>=priceOf(o.t,nq)-20)return replaceWant(worst,nq,(o.fails||0)>=2?'(no tiene arreglo)':'(era de las baratas)');}
  if(worst!=null&&wc<=0)return {key:'fix-'+worst,name:'Arreglar '+OBJ[S.obj[worst].t].n.toLowerCase(),emoji:'🔧',why:'(está rota)',kind:'fix',steps:[{k:'fix',i:worst}]};
  {const c=planCirculation();if(c)return c;}
  if(worst!=null&&wc<(T('ordenada')?45:25))return {key:'fix-'+worst,name:'Reparar '+OBJ[S.obj[worst].t].n.toLowerCase(),emoji:'🔧',why:'antes de que se rompa',kind:'fix',steps:[{k:'fix',i:worst}]};
  for(const [k] of NEEDS)if(!findObjs(d=>d.need&&d.need[k]).length){const w=wantFor(NEED_BUY[k],'para '+NEEDNAME[k],true);if(w)return w;}
  computeRooms();
  // separar zonas: si el baño o la cama están en un loft compartido, quiere su propio cuarto y llevarlos allí
  const loftWith=ts=>rooms.find(r=>r.purpose==='loft'&&r.cells.some(c=>S.obj[c]&&ts.includes(S.obj[c].t)));
  const hasZone=z=>rooms.some(r=>r.purpose===z);
  if(!hasZone('bano')&&loftWith(['vater','ducha'])){const r=planRoom('bano',['vater','ducha']);if(r){r.why='para no tener el váter junto a todo lo demás';return r;}}
  if(S.day>=3&&!hasZone('dormitorio')&&loftWith(['cama'])){const r=planRoom('dormitorio',['cama']);if(r){r.why='para dormir tranquila';return r;}}
  if(S.day>=5&&!hasZone('cocina')&&loftWith(['nevera','fogon'])){const r=planRoom('cocina',['nevera','fogon']);if(r){r.why='para cocinar con espacio';return r;}}
  const next=CAREER[S.career+1];
  if(next){
    const nrq=reqOf(next);
    if(nrq.logica&&!has('libros')&&!has('compu')){const w=wantFor('libros','para estudiar y ascender');if(w)return w;};
    if(nrq.carisma&&!has('telefono')&&!has('espejo')){const w=wantFor('espejo','para practicar carisma');if(w)return w;};
    if(nrq.logica>=3&&!has('compu')){const w=wantFor('compu','para programar y ascender');if(w)return w;};
  }
  if(!has('fogon')){const w=wantFor('fogon','para aprender a cocinar');if(w)return w;}
  if(S.day>=4&&!has('huerto')){const w=wantFor('huerto','para tener verduras propias');if(w)return w;}
  computeRooms();
  {const tw=[];if(T('cocinillas')){if(!has('fogon'))tw.push(['fogon','porque le encanta cocinar']);if(!has('mesa'))tw.push(['mesa','para comer como es debido']);}
   if(T('artista')&&!has('guitarra'))tw.push(['guitarra','para tocar música']);if(T('trabajadora')&&!has('libros'))tw.push(['libros','para estudiar y ascender']);
   if(T('naturaleza')&&count(i=>S.obj[i]&&OBJ[S.obj[i].t].green)<5)tw.push([['planta','flores','arbol'][Math.random()*3|0],'porque adora las plantas']);
   if(T('cocinillas')&&!has('barbacoa'))tw.push(['barbacoa','para hacer barbacoas']);if(T('naturaleza')&&count(i=>S.obj[i]&&S.obj[i].t==='huerto')<3)tw.push(['huerto','para cultivar más']);
   if(T('manitas')&&!has('banco'))tw.push(['banco','para hacerse sus propios muebles']);if(T('perezosa')&&!has('sofa'))tw.push(['sofa','para tumbarse']);
   for(const [t,why] of tw){const w=wantFor(t,why);if(w)return w;}}
  if(T('derrochadora')&&Math.random()<0.4){const d=planDecor();if(d)return d;}
  {const loose=findObjs((d,t)=>t==='silla').filter(i=>{const x=i%N,y=i/N|0;return ![[x+1,y],[x-1,y],[x,y+1],[x,y-1]].some(([a,b])=>inb(a,b)&&S.obj[idx(a,b)]&&SEATED.has(S.obj[idx(a,b)].t));});
   const needy=findObjs((d,t)=>SEATED.has(t)).filter(i=>chairsAround(i)<(S.obj[i].t==='compu'||S.obj[i].t==='escritorio'?1:2));
   if(loose.length&&needy.length){const st=loose.slice(0,needy.length*2).map(i=>({k:'move',v:'silla',from:i,i:null}));return {key:'chairs',name:'Colocar sillas',emoji:'🪑',why:'llevar las sillas sueltas a la mesa y al escritorio',kind:'move',steps:st};}}
  {const cp=findObjs((d,t)=>t==='compu');if(cp.length&&cp.some(i=>chairsAround(i)===0)){const w=wantFor('silla','para sentarse al ordenador');if(w)return w;}}
  if(has('fogon')&&!has('mesa')){const w=wantFor('mesa','para comer sentada');if(w)return w;}
  {const ms=findObjs((d,t)=>t==='mesa');if(ms.length&&ms.some(i=>chairsAround(i)<2)){const w=wantFor('silla','para la mesa');if(w)return w;}}
  if(!has('tele')){const w=wantFor('tele','para relajarse');if(w)return w;}
  if(!has('sofa')){const w=wantFor('sofa','para descansar');if(w)return w;}
  if(count(i=>S.wall[i]===3)<3){const r=planWindows();if(r)return r;}
  const opts=[];
  if(!S.goals.paint)opts.push(planPaint);
  if(count(i=>S.obj[i]&&OBJ[S.obj[i].t].green)<6)opts.push(()=>wantFor(['planta','flores','arbol','seto'][Math.random()*4|0],'para alegrar la casa'));
  if(!has('guitarra'))opts.push(()=>wantFor('guitarra','para aprender música'));
  if(count(i=>S.obj[i]&&S.obj[i].t==='huerto')<2)opts.push(()=>wantFor('huerto','para cultivar más'));
  if(!has('bancoj'))opts.push(()=>wantFor('bancoj','para sentarse al sol'));
  if(!has('barbacoa')&&spare()>800)opts.push(()=>wantFor('barbacoa','para comer al aire libre'));
  if(!has('fuente')&&spare()>1500)opts.push(()=>wantFor('fuente','para el jardín'));
  if(!has('banco'))opts.push(()=>wantFor('banco','para fabricarse muebles y aprender oficios'));
  if(!has('libros'))opts.push(()=>wantFor('libros','para leer'));
  if(!hasZone('salon')&&rooms.length<5)opts.push(()=>planRoom('salon'));
  if(has('compu')&&!hasZone('estudio')&&rooms.length<5)opts.push(()=>{const i=findObjs((d,t)=>t==='compu')[0];const rr=rooms[roomId[i]];return rr&&rr.purpose!=='estudio'?planRoom('estudio',['compu','libros']):null;});
  opts.push(planDecor);
  if(!count(i=>FLOORS[S.floor[i]].water))opts.push(planPool);
  for(let k=0;k<opts.length*2;k++){const f=opts[Math.random()*opts.length|0];const r=f();if(r)return r;}
  return null;
}
function jobPrice(j){const m=jobCost(j),pm=PM();return {mat:m,labor:j.kind==='fix'?Math.round(45*pm+m*0.5):j.kind==='buy'?Math.round(40*pm+m*0.15):Math.round(70*pm+m*0.35)};}
// Cada cierto tiempo Ana revisa sus planes: decide qué quiere y, si le llega, se pone manos a la obra.
function planTick(){
  if(!S.autoHome||S.job)return;
  if(!S.owned&&!S.jobless){const o=mortgageOffer();const cushion=reserveMoney()*1.5;
    if(S.money>=o.price+o.closing+cushion*2){buyHouse('cash');return;}
    if(o.ok&&S.money>=o.down+o.closing+cushion&&o.pay<weeklyRent()*1.15){buyHouse('mortgage');return;}}
  if(!S.want||S.wantDay!==S.day||(S.want.steps.some(st=>st.i!=null&&(S.wall[st.i]===4)))){
    const w=chooseWant();S.wantDay=S.day;
    if(w&&(!S.want||S.want.key!==w.key)){toast(`💭 Ana quiere: ${w.emoji} ${w.name} ${w.why}`);}
    S.want=w;
  }
  const w=S.want;if(!w)return;
  if(w.kind==='fix'&&!S.obj[w.steps[0].i]){S.want=null;return;}
  if(w.kind==='fix'&&w.steps[0].k==='fix'&&condOf(S.obj[w.steps[0].i])>=60){S.want=null;return;}
  if(w.kind==='buy'){const st=w.steps[0];st.q=pickTier(st.v,w.urgent);
    const t=st.v,c=CRAFT[t];
    if(c&&canCraft(t)&&(craftEst(c[0])>=2||spare()<priceOf(t,2)||T('ahorradora')||T('manitas'))&&spare()>=craftMat(t)){const cj=craftJob(t,null);if(cj){S.job={...cj,who:'ana',total:2};S.want=null;toast(`🪚 Ana fabricará ${OBJ[t].n.toLowerCase()} ella misma en su banco (${skLabel(c[0])} ${lvl(c[0])})`);sfx('build');return;}}}
  const p=jobPrice(w);
  const big=w.kind==='build'&&w.steps.length>6;
  let who=null;
  const urgentFix=w.kind==='fix'&&condOf(S.obj[w.steps[0].i])<=0;
  const miss=jobReq(w);
  const canPay=spare()>=p.mat||(w.urgent&&S.money>=p.mat+20)||(urgentFix&&S.money>=p.mat);
  const canHire=spare()>=p.mat+p.labor||((w.urgent||urgentFix)&&S.money>=p.mat+p.labor);
  if(miss){if(canHire)who='builder';if(throttled('miss'+w.key,90000))toast(`Ana no sabe hacerlo sola: ${w.name.toLowerCase()} pide ${skLabel(miss[0])} ${miss[1]} y tiene ${lvl(miss[0])}. ${canHire?'Llama a la cooperativa':'Ahorrará para pagar a la cooperativa'}`);}
  else if(!T('manitas')&&canHire&&((big&&(S.needs.energia<50||T('perezosa')))||(T('perezosa')&&w.steps.length>2)))who='builder';
  else if(canPay)who='ana';
  if(!who)return;
  const fresh=w.kind==='buy'?w:(chooseFresh(w)||null);if(!fresh){S.want=null;return;}
  S.job={...fresh,who,total:fresh.steps.length};S.want=null;
  if(who==='builder'){
    if(!spawnBuilder()){S.job.who='ana';}
    else{S.money-=p.labor;bumpMoney();S.stats.hired++;floatText('-'+fmt(p.labor),S.npc.x,S.npc.y,40,'#c0392b');
      toast(fresh.kind==='fix'?`🧰 Ana llamó a ${S.npc.name}, de la cooperativa · ${fmt(p.labor)}`:fresh.kind==='buy'?`🔌 Ana contrató a ${S.npc.name}, de la cooperativa, para instalarlo · ${fmt(p.labor)}`:`👷 Ana contrató a ${S.npc.name}, de la cooperativa de albañiles · mano de obra ${fmt(p.labor)}`,true);}
  }
  if(S.job.who==='builder'&&fresh.kind==='buy')toast(`🛒 Ana compra ${fresh.name.toLowerCase()} ${TIERS[fresh.steps[0].q].e} y paga la instalación`);
  if(S.job.who==='ana')toast(fresh.kind==='buy'?`🛒 Ana compra ${fresh.name.toLowerCase()} ${TIERS[fresh.steps[0].q].e} ${TIERS[fresh.steps[0].q].n} y lo montará ella`:`🔨 Ana se pone manos a la obra: ${fresh.emoji} ${fresh.name}`);
  sfx('build');
}
function chooseFresh(w){
  if(w.key.startsWith('room'))return planRoom(w.purpose,w.moves);
  if(w.key.startsWith('fix')||w.key.startsWith('rep')||w.key==='chairs')return w;
  if(w.key.startsWith('circ')||w.key.startsWith('swap'))return planCirculation();
  if(w.key==='win')return planWindows();if(w.key==='paint')return planPaint();if(w.key==='pool')return planPool();
  return w;
}
function nextStep(job){return job.steps.findIndex(st=>!st.done);}
function stepCell(st){
  if(st.k==='obj'&&st.i==null){const i=pickSpot(st.v,st.room);if(i==null)return null;st.i=i;}
  if(st.k==='move'){const o=S.obj[st.from];if(!o||o.t!==st.v)return null;if(st.i==null||S.obj[st.i]||!walkable(st.i%N,st.i/N|0)){computeRooms();const rid=rooms.findIndex(r=>r.purpose===st.zone);const i=pickSpot(st.v,rid>=0?rid:undefined);if(i==null)return null;st.i=i;}}
  return st.i;
}
function standTargets(i){const x=i%N,y=i/N|0;return new Set([[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>walkable(a,b)).map(([a,b])=>idx(a,b)));}
function execStep(job,j,byNpc){
  const st=job.steps[j];const x=st.i%N,y=st.i/N|0;let ok=true;
  if(S.money<stepCost(st)){job.paused=true;if(throttled('poorjob',20000))toast('Se acabó el dinero para la obra: Ana ahorrará para seguir 💸');return false;}
  switch(st.k){
    case 'floor':case 'water':ok=apply(x,y,{kind:'floor',v:st.v},true);if(!ok&&S.floor[st.i]===st.v)ok=true;break;
    case 'wall':ok=apply(x,y,{kind:'wall'},true);break;
    case 'door':if(!S.wall[st.i]&&!S.obj[st.i]){S.money-=Math.round(60*PM());S.wall[st.i]=2;dirty();animStart(st.i,'wall');burst('dust',x+.5,y+.5,2,6,.6,{vz:8,life:.6});}else ok=apply(x,y,{kind:'door'},true);break;
    case 'win':ok=apply(x,y,{kind:'win'},true);break;
    case 'paint':ok=apply(x,y,{kind:'paint',v:st.v},true);break;
    case 'rezone':{S.lastSwapDay=S.day;for(const c of st.a)S.zone[c]=st.az;for(const c of st.b)S.zone[c]=st.bz;dirty();computeRooms();toast('🔄 Ana reorganiza la casa: cambian los usos de dos cuartos');break;}
    case 'undoor':{S.money-=stepCost(st);S.wall[st.i]=1;dirty();animStart(st.i,'wall');burst('dust',x+.5,y+.5,4,8,.6,{vz:10,life:.7});toast('🧱 Puerta tapiada');break;}
    case 'clear':{const o=S.obj[st.i];if(!o)break;const spot=pickSpot(o.t);
      if(spot!=null&&spot!==st.i){S.obj[spot]={...o,r:orientFor(o.t,spot%N,spot/N|0)};animStart(spot,'obj');toast(`🌿 Ana aparta ${OBJ[o.t].n.toLowerCase()} para hacer sitio`);}
      else{S.money+=sellValue(o);toast(`🪓 Ana quita ${OBJ[o.t].n.toLowerCase()} para hacer sitio`);}
      S.obj[st.i]=null;dirty();burst('dust',x+.5,y+.5,4,8,.6,{vz:10,life:.7});ensureSimFree();break;}
    case 'move':{const o=S.obj[st.from];if(!o||S.obj[st.i]){break;}S.obj[st.i]={...o,r:orientFor(o.t,x,y)};S.obj[st.from]=null;animStart(st.i,'obj');withChair(st.i);dirty();
      burst('dust',st.from%N+.5,(st.from/N|0)+.5,4,6,.6,{vz:10,life:.6});confettiSmall(x+.5,y+.5);toast(`📦 ${OBJ[o.t].n} trasladada a su sitio`);ensureSimFree();break;}
    case 'craft':{const c=CRAFT[st.v];const mat=craftMat(st.v);S.money-=mat;floatText('-'+fmt(mat),x+.5,y+.5,30,'#c0392b');
      const q=craftTier(c[0]);const nx=job.steps[j+1];if(nx&&nx.k==='obj')nx.q=q;S.stats.crafted=(S.stats.crafted||0)+1;gainSkill(c[0],20);
      burst('chip',x+.5,y+.5,26,12,.7,{vz:100,life:1,col:'#d8b98a'});toast(`🪚 Ana ha fabricado ${OBJ[st.v].n.toLowerCase()}: ${TIERS[q].e} ${TIERS[q].n}`);sfx('build');break;}
    case 'obj':{
      if(st.crafted){if(st.i==null||S.obj[st.i]||!walkable(x,y)){st.i=pickSpot(st.v);if(st.i==null){toast('No hay sitio para colocarlo');break;}}
        const xx=st.i%N,yy=st.i/N|0;S.obj[st.i]={t:st.v,r:orientFor(st.v,xx,yy),q:st.q??1,c:100};animStart(st.i,'obj');withChair(st.i);dirty();confettiSmall(xx+.5,yy+.5);ensureSimFree();break;}
      ok=apply(x,y,{kind:'obj',v:st.v,q:st.q??3},true);
      if(ok){confettiSmall(x+.5,y+.5);const o=S.obj[st.i];const nm=OBJ[st.v].n.toLowerCase();
        if(!byNpc){const [k,l]=stepReq(st);const chance=Math.min(.97,0.6+0.12*(lvl(k)-l));gainSkill(k,10);if(Math.random()>chance){o.c=55;toast(`Ana montó ${nm}, pero le quedó un poco coja (55%). Con más ${SKN(k)[2]} le saldrá mejor 🔩`);sfx('bad');}else toast(`📦 Ana montó ${nm} ${TIERS[o.q??3].e} ella sola`);}}
      else st.i=null;break;}
    case 'fix':{const o=S.obj[st.i];if(!o){break;}const parts=stepCost(st);S.money-=parts;floatText('-'+fmt(parts),x+.5,y+.5,30,'#c0392b');
      const [fk,fl]=stepReq(st);if(!byNpc)gainSkill(fk,12);const chance=byNpc?1:Math.min(.95,0.5+0.12*(lvl(fk)-fl));
      if(Math.random()<chance){o.c=byNpc?100:Math.min(100,70+lvl(fk)*3);burst('spark',x+.5,y+.5,25,10,.6,{vz:90,life:.9,col:'#9fe3b0'});toast(`🔧 ${OBJ[o.t].n} arreglada${byNpc?'':' por Ana'} · estado ${Math.round(o.c)}%`);sfx('build');}
      else{st.fails=(st.fails||0)+1;
        if(ELECTRIC.has(o.t)&&Math.random()<0.4){S.needs.energia=Math.max(0,S.needs.energia-15);burst('spark',x+.5,y+.5,25,14,.9,{vz:150,life:.7,col:'#ffe066'});toast('⚡ ¡Calambrazo! Ana no consiguió arreglarlo');popBubble('😵');}
        else toast(`Ana no consiguió arreglar ${OBJ[o.t].n.toLowerCase()}… ${st.fails<2?'lo intentará otra vez':'quizá llame a un técnico'}`);
        o.fails=(o.fails||0)+1;sfx('bad');if(st.fails<2){job.paused=false;return false;}}
      break;}
    case 'replace':{const o=S.obj[st.i];if(!o)break;const cost=stepCost(st);if(S.money<cost){job.paused=true;toast('No llega para cambiarlo: Ana ahorrará');return false;}
      S.money-=cost;floatText('-'+fmt(cost),x+.5,y+.5,30,'#c0392b');burst('dust',x+.5,y+.5,8,10,.9,{vz:20,life:.8});
      const q=st.q??3;S.obj[st.i]={t:o.t,r:o.r,q,c:100};animStart(st.i,'obj');confettiSmall(x+.5,y+.5);dirty();
      if(!byNpc&&Math.random()>Math.min(.97,0.6+0.12*(lvl(stepReq(st)[0])-stepReq(st)[1]))){S.obj[st.i].c=55;toast(`Ana cambió ${OBJ[o.t].n.toLowerCase()} por una nueva ${TIERS[q].e}, pero la montó un poco coja (55%)`);}
      else toast(`🔁 ${OBJ[o.t].n} nueva ${TIERS[q].e} ${TIERS[q].n} instalada${byNpc?'':' por Ana'}`);sfx('build');break;}
  }
  st.done=true;job.paused=false;
  if(nextStep(job)<0)finishJob();
  return ok;
}
function confettiSmall(x,y){burst('spark',x,y,20,10,.7,{vz:110,life:1,col:['#ffd166','#5bc0be','#ff8a5b'][Math.random()*3|0]});}
function finishJob(){
  const j=S.job;if(!j)return;S.job=null;dirty();
  if(j.purpose&&j.inner){for(const c of j.inner)S.zone[c]=j.purpose;dirty();computeRooms();}
  if(j.moves&&j.purpose){
    const steps=[];for(const t of j.moves)for(const i of findObjs((d,tt)=>tt===t)){const rr=rooms[roomId[i]];if(!rr||rr.purpose!==j.purpose)steps.push({k:'move',v:t,from:i,zone:j.purpose,i:null});}
    if(steps.length){const mj={key:'move',name:'Llevar muebles a '+ZONES[j.purpose].n.toLowerCase(),emoji:'📦',why:'',kind:'move',steps,total:steps.length};
      const miss=jobReq(mj);const lab=60+steps.length*25;
      const npcHere=S.npc;
      if(!miss){S.job={...mj,who:'ana'};if(npcHere)npcLeave();toast(`📦 Ana va a llevar ${j.moves.map(t=>OBJ[t].n.toLowerCase()).join(' y ')} a ${ZONES[j.purpose].n.toLowerCase()}`);}
      else if(S.money>=lab){S.job={...mj,who:'builder'};if(npcHere&&npcHere.state!=='leaving'){S.money-=lab;toast(`📦 ${npcHere.name} se queda a trasladar ${j.moves.map(t=>OBJ[t].n.toLowerCase()).join(' y ')} · ${fmt(lab)}`);}else if(spawnBuilder()){S.money-=lab;toast(`📦 La cooperativa traslada ${j.moves.map(t=>OBJ[t].n.toLowerCase()).join(' y ')} · ${fmt(lab)}`);}else S.job=null;}
      return;}
  }
  tally('built',j.name);if(j.purpose&&j.kind==='build')chapter('room1','Hacer hogar',`${CH().name} ha levantado su primera habitación nueva: ${ZONES[j.purpose]?ZONES[j.purpose].n.toLowerCase():'un cuarto'}. Huele a pintura fresca y a futuro.`);
  toast(`✅ Terminado: ${j.emoji} ${j.name}${j.who==='builder'&&S.npc?' · '+S.npc.name+' se despide 👋':''}`,true);sfx('level');
  if(!S.sim.work){confetti(S.sim.x,S.sim.y,50);popBubble('🎉');}
  if(S.npc)npcLeave();
}
// Ana trabaja en la obra ella misma
function doJobStep(){
  const job=S.job;if(!job||job.who!=='ana'||job.paused&&S.money<stepCost(job.steps[nextStep(job)]||{k:'x'}))return false;
  const j=nextStep(job);if(j<0){finishJob();return false;}
  const st=job.steps[j];
  if(st.k==='rezone'){execStep(job,j,false);return false;}
  const i=stepCell(st);
  if(i==null){if(st.k==='move'&&(st.tries=(st.tries||0)+1)<4){job.steps.splice(j,1);job.steps.push(st);return false;}st.done=true;st.skipped=true;return false;}
  const tg=standTargets(i);const p=tg.size?bfs(simCell(),(a,b)=>tg.has(idx(a,b))):null;
  if(!p){st.tries=(st.tries||0)+1;if(st.tries>3){st.done=true;st.skipped=true;}return false;}
  const s=S.sim;s.path=p;s.target=null;s.buildJ=j;s.cmd=false;s.stuck=false;
  if(!p.length)startBuild();
  return true;
}
function startBuild(){
  const s=S.sim,job=S.job;const j=s.buildJ;s.buildJ=null;if(!job||j==null||job.steps[j].done)return;
  const st=job.steps[j];const [sk]=stepReq(st);const base=st.k==='craft'?30+CRAFT[st.v][2]*12:STEP_T[st.k];const dur=base*Math.max(0.5,1.3-0.07*lvl(sk));
  s.use={type:'_build',i:st.i,j,t:0,dur,sk};
}
// ----- albañil -----
function spawnBuilder(){
  const j=nextStep(S.job);if(j<0)return false;const st=S.job.steps[j];const i=stepCell(st);if(i==null)return false;
  const tg=standTargets(i);const edges=[];
  for(let k=0;k<N;k++)for(const [x,y] of [[k,0],[k,N-1],[0,k],[N-1,k]])if(walkable(x,y))edges.push([x,y]);
  edges.sort((a,b)=>Math.hypot(a[0]-(i%N),a[1]-(i/N|0))-Math.hypot(b[0]-(i%N),b[1]-(i/N|0)));
  for(const e of edges.slice(0,30)){const p=bfs(e,(a,b)=>tg.has(idx(a,b)));if(p){S.npc={name:BUILDERS[Math.random()*BUILDERS.length|0],x:e[0]+.5,y:e[1]+.5,path:[],work:null,state:'working',phase:0,right:true,front:true};return true;}}
  return false;
}
function npcLeave(){const n=S.npc;if(!n)return;n.state='leaving';n.work=null;const p=bfs([Math.floor(n.x),Math.floor(n.y)],(x,y)=>x===0||y===0||x===N-1||y===N-1);n.path=p||[];if(!p)S.npc=null;}
function npcMove(n,gm){
  const [tx,ty]=n.path[0];const dx=tx+.5-n.x,dy=ty+.5-n.y,dist=Math.hypot(dx,dy),step=0.6*gm;
  if(dist>0.01){const [a,b]=w2v(n.x,n.y),[c,d]=w2v(n.x+dx,n.y+dy);const du=c-a,dv=d-b;if(Math.abs(du-dv)>.01)n.right=du-dv>0;n.front=du+dv>-.01;}
  n.phase+=Math.min(step,dist)*11;
  if(dist<=step){n.x=tx+.5;n.y=ty+.5;n.path.shift();}else{n.x+=dx/dist*step;n.y+=dy/dist*step;}
}
function updateNPC(gm){
  const n=S.npc;if(!n)return;
  if(n.state==='leaving'){if(n.path.length)npcMove(n,gm);else S.npc=null;return;}
  const job=S.job;if(!job||job.who!=='builder'){npcLeave();return;}
  if(n.work){
    n.work.t+=gm;
    if(n.work.t>=n.work.dur){const st=job.steps[n.work.j];n.work=null;if(st&&!st.done)execStep(job,job.steps.indexOf(st),true);}
    return;
  }
  if(n.path.length){
    const [tx,ty]=n.path[0];if(!walkable(tx,ty)&&!(Math.floor(n.x)===tx&&Math.floor(n.y)===ty)){n.path=[];return;}
    npcMove(n,gm);if(!n.path.length&&n.goJ!=null){const st=job.steps[n.goJ];if(st&&!st.done)n.work={j:n.goJ,t:0,dur:STEP_T[st.k]*0.45};n.goJ=null;}
    return;
  }
  if(job.paused&&S.money<stepCost(job.steps[nextStep(job)]||{k:'x'}))return;
  const j=nextStep(job);if(j<0){finishJob();return;}
  const st=job.steps[j];if(st.k==='rezone'){execStep(job,j,true);return;}const i=stepCell(st);if(i==null){if(st.k==='move'&&(st.tries=(st.tries||0)+1)<4){job.steps.splice(j,1);job.steps.push(st);return;}st.done=true;return;}
  const tg=standTargets(i);const p=tg.size?bfs([Math.floor(n.x),Math.floor(n.y)],(a,b)=>tg.has(idx(a,b))):null;
  if(!p){st.tries=(st.tries||0)+1;if(st.tries>3)st.done=true;return;}
  if(p.length){n.path=p;n.goJ=j;}else n.work={j,t:0,dur:STEP_T[st.k]*0.45};
}
function cancelJob(){if(!S.job)return;S.job=null;S.want=null;S.wantDay=S.day;if(S.npc)npcLeave();const s=S.sim;if(s.use&&s.use.type==='_build')s.use=null;s.buildJ=null;toast('Obra cancelada. Lo ya construido se queda.');}
function noWorkToday(){const w=W_();return onLeave()||(S.strike&&S.strike.on&&S.strike.join)||(w.gs===S.day&&ID().strike>=.5)||!!w.rev||S.jail>0;}
function shouldWork(){
  const h=S.t/60,nd=S.needs;
  return !S.jobless&&!(S.sick>0)&&!noWorkToday()&&dayType(S.day)==='work'&&S.lastWorkDay!==S.day&&h>=leaveTime()-0.1&&h<SHIFT.end-2&&nd.energia>8&&nd.vejiga>12;
}
function useLabel(u){
  if(u.type==='_suelo')return {b:'💤',v:'Durmiendo en el suelo'};
  if(u.type==='_build'){const st=S.job&&S.job.steps[u.j];const k=st?st.k:'obj';return {b:k==='paint'?'🎨':k==='obj'?'📦':'🔨',v:k==='move'?'Trasladando '+(OBJ[st.v]?.n||'algo').toLowerCase():k==='craft'?'Fabricando '+(OBJ[st.v]?.n||'algo').toLowerCase():k==='obj'?(st.crafted?'Colocando ':'Montando ')+(OBJ[st.v]?.n||'algo').toLowerCase():k==='fix'?'Reparando':'Construyendo: '+STEP_NAME[k]};}
  if(u.type==='banco')return {b:'🛠️',v:'Practicando '+(SKN(u.trainSk||'carp')[2]).toLowerCase()};
  if(bedUse(u)&&u.nap)return {b:'😴',v:'Echándose una siesta'};
  if(u.type==='_meal')return {b:'🍽️',v:'Comiendo sentada a la mesa'};
  if(u.type==='compu'&&u.seat==null)return {b:'💻',v:'Programando de pie'};
  return {b:OBJ[u.type]?.b||'✨',v:OBJ[u.type]?.verb||''};
}

