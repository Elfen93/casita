// ---------- circulación: cómo se va de un cuarto a otro ----------
const PRIVATE=new Set(['dormitorio','bano']);
const NEAR={cocina:['salon','loft','pasillo'],salon:['cocina','loft','pasillo','estudio'],dormitorio:['bano','pasillo','salon','loft'],bano:['dormitorio','pasillo','salon','loft'],estudio:['salon','pasillo','dormitorio','loft'],taller:['salon','pasillo','loft']};
function roomGraph(){
  computeRooms();const adj=new Map();const add=(a,b)=>{if(a===b)return;if(!adj.has(a))adj.set(a,new Set());if(!adj.has(b))adj.set(b,new Set());adj.get(a).add(b);adj.get(b).add(a);};
  const side=(x,y)=>{if(!inb(x,y))return -1;const j=idx(x,y);if(S.wall[j]&&S.wall[j]!==2&&S.wall[j]!==4)return null;return roomId[j]>=0?roomId[j]:-1;};
  for(let i=0;i<N*N;i++){if(S.wall[i]!==2)continue;const x=i%N,y=i/N|0;
    for(const [[ax,ay],[bx,by]] of [[[x-1,y],[x+1,y]],[[x,y-1],[x,y+1]]]){const a=side(ax,ay),b=side(bx,by);if(a!=null&&b!=null)add(a,b);}}
  return adj;
}
// se recorre la casa desde la calle; los cuartos privados se pueden visitar pero no atravesar
const OUTDOOR_OK=new Set(['salon','pasillo','taller','loft','estudio','libre']);
// ¿hay una entrada principal en una zona que la admite? entonces las puertas a la calle de cocina, baño o dormitorio no cuentan
function hasMainEntrance(adj){for(const n of (adj.get(-1)||[]))if(n>=0&&rooms[n]&&OUTDOOR_OK.has(rooms[n].purpose))return true;return false;}
function reachableRooms(){const adj=roomGraph();const seen=new Set([-1]);const q=[-1];const strict=hasMainEntrance(adj);
  while(q.length){const c=q.shift();for(const n of (adj.get(c)||[])){if(seen.has(n))continue;if(c===-1&&strict&&n>=0&&rooms[n]&&!OUTDOOR_OK.has(rooms[n].purpose))continue;seen.add(n);if(n>=0&&rooms[n]&&PRIVATE.has(rooms[n].purpose))continue;q.push(n);}}
  return seen;}
function badRooms(){const reach=reachableRooms();return rooms.filter(r=>r.purpose!=='libre'&&!reach.has(r.id));}
// si una zona común solo se alcanza cruzando un dormitorio o un baño, abre una puerta nueva hacia otra zona común o a la calle
function planCirculation(){
  computeRooms();const bad=badRooms();if(!bad.length)return null;
  const reach=reachableRooms();
  for(const R of bad){
    let best=null,bs=-1e9;
    for(const c of R.cells){const x=c%N,y=c/N|0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const wx=x+dx,wy=y+dy;if(!inb(wx,wy))continue;const wi=idx(wx,wy);if(S.wall[wi]!==1)continue;
        const ox=wx+dx,oy=wy+dy;if(!inb(ox,oy))continue;const oi=idx(ox,oy);if(S.wall[oi]&&S.wall[oi]!==2)continue;
        const along=dx!==0?[[wx,wy-1],[wx,wy+1]]:[[wx-1,wy],[wx+1,wy]];if(!along.every(([a,b])=>inb(a,b)&&S.wall[idx(a,b)]))continue;
        if(S.obj[oi]||S.obj[c])continue;
        const orr=roomId[oi];let sc=-1e9;
        if(orr<0&&walkable(ox,oy)&&OUTDOOR_OK.has(R.purpose))sc=2;
        else if(orr>=0&&reach.has(orr)&&!PRIVATE.has(rooms[orr].purpose))sc=6+((NEAR[R.purpose]||[]).includes(rooms[orr].purpose)?4:0);
        if(sc>bs){bs=sc;best=wi;}}}
    if(best==null){const sw=planSwap(R);if(sw)return sw;}
    if(best!=null)return {key:'circ-'+R.id,name:'Puerta nueva para '+R.name.toLowerCase(),emoji:'🚪',why:'para no tener que cruzar un cuarto privado',kind:'build',steps:[{k:'door',i:best}]};
  }
  return null;
}
// intercambia el uso de dos cuartos (p. ej. la cocina que solo se alcanza cruzando el dormitorio pasa a ser el dormitorio) y lleva los muebles
function planSwap(R){
  if(S.lastSwapDay&&S.day-S.lastSwapDay<7)return null;
  const adj=roomGraph(),reach=reachableRooms();
  for(const p of (adj.get(R.id)||[])){
    if(p<0)continue;const P=rooms[p];if(!P||!PRIVATE.has(P.purpose)||!reach.has(p))continue;
    const ok=[...(adj.get(p)||[])].some(q=>q!==R.id&&(q===-1||(rooms[q]&&!PRIVATE.has(rooms[q].purpose)&&reach.has(q))));if(!ok)continue;
    const belongs=(t,z)=>ZONE_OF[t]===z||(z==='cocina'&&(t==='mesa'||t==='silla'))||(z==='bano'&&t==='espejo');
    const steps=[{k:'rezone',i:R.cells[0],a:R.cells.slice(),az:P.purpose,b:P.cells.slice(),bz:R.purpose}];
    for(const c of R.cells){const o=S.obj[c];if(o&&belongs(o.t,R.purpose))steps.push({k:'move',v:o.t,from:c,zone:R.purpose,i:null});}
    for(const c of P.cells){const o=S.obj[c];if(o&&belongs(o.t,P.purpose))steps.push({k:'move',v:o.t,from:c,zone:P.purpose,i:null});}
    // puertas a la calle que se queden en el cuarto que pasa a ser privado: se tapian
    for(const c of R.cells){const x=c%N,y=c/N|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const wx=x+dx,wy=y+dy;if(!inb(wx,wy))continue;const wi=idx(wx,wy);if(S.wall[wi]!==2)continue;const ox=wx+dx,oy=wy+dy;if(inb(ox,oy)&&roomId[idx(ox,oy)]<0&&!S.wall[idx(ox,oy)])steps.push({k:'undoor',i:wi});}}
    return {key:'swap-'+R.id,name:`Cambiar ${R.name.toLowerCase()} por ${P.name.toLowerCase()}`,emoji:'🔄',why:'para no cruzar un cuarto privado ni salir a la calle',kind:'build',steps};
  }
  return null;
}

