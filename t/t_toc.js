setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=5000;S.jobless=true;S.t=10*60;
 const free=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&inArea(x,y)&&S.floor[i]&&S.wall[i]===0)free.push(i);}
 const types=['vater','telefono','banco','micro','lavabo','lavadora','armario','sillon','chimenea','acuario','muebar','jaula','hamaca','caseta','tendedero','ducha','cama','sofa','nevera'];
 let j=0;const placed={};for(const t of types){if(!OBJ[t])continue;const ex=findObjs((d,tt)=>tt===t)[0];if(ex!=null){placed[t]=ex;continue;}const i=free[j++*2];S.obj[i]={t,q:3,c:100,r:0};placed[t]=i;}dirty();uidSweep();computeRooms();
 const done=[];for(const t in placed){for(const a of ACTV[t]){if(!a[3])continue;for(const k in S.needs)S.needs[k]=35;S.sim.use=null;S.sim.path=[];S.sim.queue=[];enqueue({k:'obj',i:placed[t],act:a[0]});let ok=false;for(let k=0;k<200;k++){update(2);if(S.sim.use&&S.sim.use.act===a[0])ok=true;if(ok&&!S.sim.use)break;}done.push(t+'.'+a[0]+(ok?'':'!'));}}
 // hit test: tocar la ducha por arriba
 const di=placed.ducha;centerOnWorld(di%N+.5,(di/N|0)+.5);const [u,v]=w2v(di%N+.5,(di/N|0)+.5);const [bx,by]=P(u,v,0);const px=cam.x+bx*cam.z,py=cam.y+by*cam.z-30*cam.z;const hit=objAtScreen(px,py);
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),werrs:window.__errs.slice(0,2),hit:hit===di,hitT:hit!=null&&S.obj[hit]&&S.obj[hit].t,done:done.join(' ')});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
