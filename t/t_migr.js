setTimeout(()=>{try{
 if(!sessionStorage.getItem('m2')){sessionStorage.setItem('m2','1');S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);applyHome('padres');
  // distribución vieja
  const put=(x,y,t)=>{S.obj[idx(x,y)]={t,q:2,c:100,r:0};};for(const [x,y] of [[5,11],[7,11],[8,12],[9,12],[10,12]])S.obj[idx(x,y)]=null;put(6,10,'fogon');put(8,11,'mesa');put(10,12,'sofa');put(10,10,'tele');put(5,12,'silla');
  S.sim.x=6.5;S.sim.y=7.5;localStorage.setItem(KEY,JSON.stringify(S));location.reload();return;}
 sessionStorage.removeItem('m2');computeRooms();const start=simCell();const seen=new Set();const q=[start];seen.add(idx(...start));while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const j=idx(nx,ny);if(seen.has(j)||!walkable(nx,ny))continue;seen.add(j);q.push([nx,ny]);}}
 let iso=0;for(let i=0;i<N*N;i++){if(walkable(i%N,i/N|0)&&!seen.has(i))iso++;}
 const salon=[];for(let y=10;y<=12;y++)for(let x=5;x<=10;x++){const o=S.obj[idx(x,y)];salon.push(o?o.t[0]:'.');}
 document.title='OK '+JSON.stringify({iso,salon:salon.join(''),fogonR:S.obj[idx(5,11)]&&S.obj[idx(5,11)].r,errs:__errs.slice(0,3)});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
