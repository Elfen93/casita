// ---------- habitaciones ----------
let rooms=[],roomId=new Int16Array(N*N).fill(-1),roomsDirty=true;
const ROOMTYPES=[['Baño',['vater','ducha']],['Cocina',['nevera','fogon']],['Dormitorio',['cama']],['Salón',['sofa','tele']],['Estudio',['compu','libros','guitarra','espejo','telefono']]];
function computeRooms(){
  if(!roomsDirty)return;roomsDirty=false;
  const out=new Uint8Array(N*N),q=[];
  for(let x=0;x<N;x++)for(const y of [0,N-1]){q.push([x,y]);q.push([y,x]);}
  while(q.length){const [x,y]=q.pop();if(!inb(x,y))continue;const i=idx(x,y);if(out[i]||isRoomWall(S.wall[i]))continue;out[i]=1;q.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
  roomId.fill(-1);rooms=[];
  for(let i=0;i<N*N;i++){
    if(out[i]||isRoomWall(S.wall[i])||roomId[i]>=0)continue;
    const r={cells:[],id:rooms.length},st=[i];roomId[i]=r.id;
    while(st.length){const c=st.pop();r.cells.push(c);const x=c%N,y=c/N|0;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(!inb(a,b))continue;const j=idx(a,b);if(out[j]||isRoomWall(S.wall[j])||roomId[j]>=0)continue;roomId[j]=r.id;st.push(j);}}
    // calidad
    let decor=0,wins=new Set(),lights=0,cnt={};
    for(const c of r.cells){const o=S.obj[c];if(o){const d=OBJ[o.t];decor+=(d.decor||0)+TIERS[o.q??3].decor-(o.c!=null&&o.c<=0?3:o.c!=null&&o.c<35?1:0);if(d.light)lights++;cnt[o.t]=(cnt[o.t]||0)+1;}
      const x=c%N,y=c/N|0;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]])if(inb(a,b)&&S.wall[idx(a,b)]===3)wins.add(idx(a,b));}
    const floored=r.cells.filter(c=>S.floor[c]!==0&&S.floor[c]!==8).length/r.cells.length;
    const n=r.cells.length;
    r.q=Math.min(20,decor+wins.size*2+(lights?2:0)+(n>=6?2:0)+(n>=12?2:0)+Math.round(floored*3)-(n<=2?3:0));
    r.stars=Math.max(1,Math.min(5,1+Math.floor(r.q/4)));
    r.wins=wins.size;
    r.purpose=roomPurpose(r);r.name=ZONES[r.purpose].n;r.zemoji=ZONES[r.purpose].e;
    let sx=0,sy=0;for(const c of r.cells){sx+=c%N+.5;sy+=(c/N|0)+.5;}r.cx=sx/n;r.cy=sy/n;
    rooms.push(r);
  }
}
function dirty(){roomsDirty=true;}

