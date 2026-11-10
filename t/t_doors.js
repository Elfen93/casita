setTimeout(()=>{try{const out=[];for(const k of HOME_ORDER){S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);applyHome(k);computeRooms();
  const bad=[];for(let i=0;i<N*N;i++){if(S.wall[i]!==2)continue;const x=i%N,y=i/N|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny)||S.wall[idx(nx,ny)])continue;if(S.obj[idx(nx,ny)])bad.push(S.obj[idx(nx,ny)].t+'@'+nx+','+ny+' tapa puerta '+x+','+y);}}
  // todas las celdas de suelo interior conectadas
  const start=simCell();const seen=new Set();const q=[start];seen.add(idx(...start));while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const j=idx(nx,ny);if(seen.has(j)||!walkable(nx,ny))continue;seen.add(j);q.push([nx,ny]);}}
  let iso=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(walkable(x,y)&&!seen.has(i))iso.push(x+','+y);}iso=iso.join(' ');
  out.push(k+': '+(bad.length?bad.join('; '):'puertas libres')+' · celdas aisladas '+iso);}
 S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);applyHome('padres');rollWeather();newToday();storyStart();S.t=17*60;const pos=new Set();for(let k=0;k<480;k++){update(1);const r=(S.res||[]).find(q=>q.pid==='madre');if(r)pos.add(Math.floor(r.x)+','+Math.floor(r.y));}
 out.push('madre visitó '+pos.size+' casillas');document.title='OK '+JSON.stringify({out,errs:__errs.slice(0,3)});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
