// ---------- asientos ----------
const SEATED=new Set(['compu','mesa']);
function seatFor(i){const o=S.obj[i];if(!o||!SEATED.has(o.t))return null;const x=i%N,y=i/N|0;
  for(const [a,b] of [[x,y+1],[x+1,y],[x-1,y],[x,y-1]]){if(!inb(a,b))continue;const j=idx(a,b),c=S.obj[j];if(c&&c.t==='silla'&&usable(c)&&neighborsOf(j).length&&!(S.sim.use&&S.sim.use.seat===j&&S.sim.use.i!==i))return j;}
  return null;}
// el ordenador viene siempre con su silla
function chairSpot(i){const o=S.obj[i];if(!o)return null;const x=i%N,y=i/N|0;const [wx,wy]=WDIR[o.r||0];
  const cands=[[x-wx,y-wy],[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>inb(a,b)&&!S.obj[idx(a,b)]&&!S.wall[idx(a,b)]&&!FLOORS[S.floor[idx(a,b)]].water);
  const [sx,sy]=simCell();const before=bfsCount([sx,sy]);
  for(const [a,b] of cands){if(a===sx&&b===sy)continue;const j=idx(a,b);S.obj[j]={t:'silla'};const ok=neighborsOf(j).length&&bfsCount([sx,sy])>=before-1;S.obj[j]=null;if(ok)return j;}
  return null;}
function withChair(i){const o=S.obj[i];if(!o||o.t!=='compu'||chairsAround(i))return true;const j=chairSpot(i);if(j==null)return false;
  S.obj[j]={t:'silla',r:orientFor('silla',j%N,j/N|0),q:o.q??3,c:100};animStart(j,'obj');dirty();return true;}
// ¿cabe aquí un ordenador con su silla?
function compuFits(x,y){const i=idx(x,y);if(S.obj[i])return false;S.obj[i]={t:'compu',r:orientFor('compu',x,y)};const ok=chairSpot(i)!=null;S.obj[i]=null;return ok;}
function chairsAround(i){const x=i%N,y=i/N|0;let n=0;for(const [a,b] of [[x,y+1],[x+1,y],[x-1,y],[x,y-1]])if(inb(a,b)&&S.obj[idx(a,b)]&&S.obj[idx(a,b)].t==='silla')n++;return n;}
// orientación: la silla da la espalda a la mesa o escritorio que tiene al lado
function orientFor(t,x,y){
  if(t==='silla'){for(let r=0;r<4;r++){const [dx,dy]=WDIR[r];const ox=x-dx,oy=y-dy;if(inb(ox,oy)&&S.obj[idx(ox,oy)]&&SEATED.has(S.obj[idx(ox,oy)].t))return r;}}
  return autoDir(x,y);
}
