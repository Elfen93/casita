setTimeout(()=>{try{const out=[];
 for(const k of ['padres','habitacion','viejo','bueno','chalet','infra']){S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);applyHome(k);rollWeather();newToday();storyStart();S.autoHome=true;S.home.since=S.day;
  computeRooms();const [sx,sy]=simCell();const reach=new Set();{const seen=new Set([idx(sx,sy)]);const q=[[sx,sy]];while(q.length){const [x,y]=q.shift();reach.add(idx(x,y));for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const j=idx(nx,ny);if(seen.has(j)||!walkable(nx,ny))continue;seen.add(j);q.push([nx,ny]);}}}
  const objs=[];for(let i=0;i<N*N;i++){const o=S.obj[i];if(!o||o.priv)continue;const x=i%N,y=i/N|0;const ok=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>reach.has(idx(x+dx,y+dy)));if(!ok)objs.push(o.t+'@'+x+','+y);}
  const needs={};for(const n of ['hambre','energia','higiene','vejiga']){needs[n]=bestObjFor(n);}
  out.push(k+' sim='+sx+','+sy+' walk='+walkable(sx,sy)+' reach='+reach.size+' unreachable='+objs.join(' ')+' best='+JSON.stringify(needs));}
 document.title='OK '+JSON.stringify({out,errs:__errs.slice(0,3)});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
