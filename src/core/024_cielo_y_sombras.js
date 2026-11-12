// ---------- cielo y sombras ----------
const STARS=Array.from({length:70},(_,k)=>[hash(k*3+1),hash(k*7+2)*0.65,hash(k*11+3)]);
const CLOUDS=Array.from({length:6},(_,k)=>({x:hash(k*5+9),y:0.05+hash(k*13+4)*0.32,s:0.6+hash(k*17)*0.8,v:6+hash(k*19)*10}));
function drawSky(night,tt){
  const h=S.t/60;
  const dusk=Math.max(0,1-Math.abs(h-19.3)/1.6)+Math.max(0,1-Math.abs(h-6)/1.4);
  let top=mixHex('#7ec8ec','#0c1230',night),bot=mixHex('#e6f5ff','#262c4c',night);
  top=mixHex(top,'#f08a5d',dusk*0.45);bot=mixHex(bot,'#ffd29a',dusk*0.55);
  const wk=S.weather&&S.weather.k,grey=wk==='tormenta'?.6:wk==='lluvia'||wk==='nieve'?.45:wk==='nubes'?.25:0;if(grey){top=mixHex(top,'#8a94a6',grey*(1-night*.6));bot=mixHex(bot,'#c4cad4',grey*(1-night*.6));}
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(night>0){for(let k=0;k<STARS.length;k++){const [x,y,r]=STARS[k];ctx.fillStyle=`rgba(255,255,240,${night*(0.4+0.6*Math.abs(Math.sin(tt*(0.8+r)+k)))})`;ctx.fillRect(x*W,y*H,1+r*1.5,1+r*1.5);}}
  // sol y luna
  const dayP=(h-6)/13;if(dayP>0&&dayP<1){const x=W*(0.08+0.84*dayP),y=H*0.42-Math.sin(Math.PI*dayP)*H*0.32;const rg=ctx.createRadialGradient(x,y,0,x,y,70);rg.addColorStop(0,'rgba(255,240,170,.95)');rg.addColorStop(0.25,'rgba(255,220,120,.55)');rg.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=rg;ctx.fillRect(x-70,y-70,140,140);circ(x,y,16,'#fff3b0');}
  const nh=h<6?h+24:h,nP=(nh-19.5)/11;if(nP>0&&nP<1&&night>0.2){const x=W*(0.1+0.8*nP),y=H*0.4-Math.sin(Math.PI*nP)*H*0.3;circ(x,y,13,`rgba(245,245,225,${night})`);circ(x+5,y-4,11,top);}
  // nubes
  const ca=0.85*(1-night*0.75);const cc=grey?'210,214,222':'255,255,255';
  for(const c of CLOUDS){const span=W+260;const x=((c.x*span+tt*c.v)%span)-130+cam.x*0.03,y=c.y*H;ctx.fillStyle=`rgba(${cc},${ca})`;
    for(const [dx,dy,r] of [[0,0,22],[24,-8,26],[50,0,20],[26,6,22]]){ctx.beginPath();ctx.arc(x+dx*c.s,y+dy*c.s,r*c.s,0,Math.PI*2);ctx.fill();}}
}
function drawShadows(night){
  const a=0.17*(1-night*0.7);if(a<=0.01)return;
  ctx.save();
  ctx.fillStyle=`rgba(40,25,70,${a})`;ctx.beginPath();
  const rect=(x0,y0,x1,y1)=>{const p=[P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1)];ctx.moveTo(p[0][0],p[0][1]);for(let k=1;k<4;k++)ctx.lineTo(p[k][0],p[k][1]);ctx.closePath();};
  for(let vy=0;vy<N;vy++)for(let vx=0;vx<N;vx++){
    const [x,y]=vc2wc(vx,vy),i=idx(x,y),w=S.wall[i];
    if(w){const cut=isCut(vx,vy);const L=w===4?.15:cut?.12:.6;const ar=armsAt(vx,vy);
      if(ar.L||ar.R)rect(ar.L?vx:vx+.38,vy+.38,(ar.R?vx+1:vx+.62)+L,vy+.62);
      if(ar.U||ar.D)rect(vx+.38,ar.U?vy:vy+.38,vx+.62+L,ar.D?vy+1:vy+.62);}
    const o=S.obj[i];
    if(o){const d=OBJ[o.t];if(o.t==='arbol'){const [tx,ty]=P(vx+.85,vy+.55);ctx.moveTo(tx+26,ty);ctx.ellipse(tx,ty,26,12,0,0,Math.PI*2);}
      else if(!d.flat&&o.t!=='flores'){setFrame(vx,vy,o.t,o.r,x,y);const ins=Math.max(d.ins,.08),L=Math.min(.7,d.h/54*.55);const [p,q]=Lv(ins,ins),[r2,s2]=Lv(1-ins,1-ins);rect(Math.min(p,r2),Math.min(q,s2),Math.max(p,r2)+L,Math.max(q,s2));}}
  }
  ctx.fill('nonzero');
  // sombra de contacto: el suelo se oscurece un poco junto al pie de las paredes de fondo
  ctx.fillStyle='rgba(40,25,60,.10)';ctx.beginPath();
  for(let vy=0;vy<N;vy++)for(let vx=0;vx<N;vx++){const [x,y]=vc2wc(vx,vy),i=idx(x,y);if(S.wall[i]||roomId[i]<0)continue;
    const wl=wallTypeAtV(vx-1,vy),wu=wallTypeAtV(vx,vy-1);
    if(wl&&wl!==4)rect(vx-.38,vy-(wallTypeAtV(vx-1,vy-1)?.38:0),vx-.16,vy+1);
    if(wu&&wu!==4)rect(vx-(wallTypeAtV(vx-1,vy-1)?.38:0),vy-.38,vx+1,vy-.16);}
  ctx.fill('nonzero');
  // sombra de contacto bajo cada mueble
  for(let vy=0;vy<N;vy++)for(let vx=0;vx<N;vx++){const [x,y]=vc2wc(vx,vy),o=S.obj[idx(x,y)];if(!o||OBJ[o.t].flat||o.t==='arbol')continue;setFrame(vx,vy,o.t,o.r,x,y);const [cx,cy]=LP(.5,.5,0);ctx.save();ctx.translate(cx,cy+1);ctx.scale(1,.45);const rg=ctx.createRadialGradient(0,0,2,0,0,22);rg.addColorStop(0,'rgba(30,20,50,.28)');rg.addColorStop(1,'rgba(30,20,50,0)');ctx.fillStyle=rg;ctx.fillRect(-22,-22,44,44);ctx.restore();}
  ctx.restore();
}

let hover=null, mode='live', tool=null, flash=null, cat={build:'est',buy:'need'}, lastFloor=1, pointerScreen=null, rotFlash=0;
function ghostType(){if(!tool)return null;if(tool.kind==='obj')return tool.v;if(tool.kind==='move'&&S.held)return S.held.t;return null;}
function computePlan(){
  planWalls=null;planFloors=null;boxAt=-1;const j=S.job;if(!j)return;
  planWalls=new Map();planFloors=new Set();
  for(const st of j.steps){if(st.done||st.i==null)continue;if((st.k==='wall'||st.k==='door'||st.k==='win')&&!S.wall[st.i])planWalls.set(st.i,st.k==='door'?2:1);if(st.k==='floor'||st.k==='water')planFloors.add(st.i);}
  const n=nextStep(j);if(n>=0){const st=j.steps[n];if(st.k==='obj'&&st.i!=null&&!S.obj[st.i])boxAt=st.i;}
}
function render(){
  computeRooms();computePlan();LAWN=lawnBase();WEEDSET=new Set(S.weeds||[]);
  const night=nightFactor(),tt=performance.now()/1000;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  drawSky(night,tt);
  ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z,DPR*cam.x,DPR*cam.y);
  // base del terreno
  // el barrio se pinta siempre alrededor (mods/caminar.js); si la parcela queda fuera de pantalla, la casa no se pinta
  const homeVis=typeof cmHomeVis==='function'?cmHomeVis():true;
  sceneIndoor=false;
  if(!homeVis){bubbleAt=null;drawEntorno(night,tt,0);drawEntorno(night,tt,1);}
  else{
  drawEntorno(night,tt,0);
  for(let vy=0;vy<N;vy++)for(let vx=0;vx<N;vx++){
    const [x,y]=vc2wc(vx,vy),i=idx(x,y);
    if(S.wall[i]&&S.wall[i]!==4)drawWallCellFloor(vx,vy,i);else drawFloor(vx,vy,S.floor[i],null,i);
    if(preview&&preview.floors.has(i))drawFloor(vx,vy,preview.floors.get(i),.75);
    if(planFloors&&planFloors.has(i))poly([P(vx+.04,vy+.04),P(vx+.96,vy+.04),P(vx+.96,vy+.96),P(vx+.04,vy+.96)],'rgba(110,180,240,.28)','rgba(70,140,220,.55)');
  }
  drawShadows(night);obShade();
  if(night<0.9){ // la luz del día entra por las ventanas
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let vy=0;vy<N;vy++)for(let vx=0;vx<N;vx++){const [x,y]=vc2wc(vx,vy),i=idx(x,y);if(S.wall[i]!==3)continue;
      for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const [nx,ny]=vc2wc(vx+dx,vy+dy);if(!inb(nx,ny)||roomId[idx(nx,ny)]<0||S.wall[idx(nx,ny)])continue;
        const a=0.16*(1-night);const x0=vx+dx*0.62+(dx===0?0.1:0),y0=vy+dy*0.62+(dy===0?0.1:0);
        poly([P(x0,y0),P(x0+(dx===0?.8:dx*.9),y0+(dy===0?0:dy*.9)),P(x0+(dx===0?.8:dx*.9)+(dx===0?0:0),y0+(dy===0?.8:dy*.9)),P(x0,y0+(dy===0?.8:0))],`rgba(255,240,200,${a})`);}}
    ctx.restore();}
  const hl=hover||flash;
  let ghostAt=-1;
  if(hl&&inb(hl[0],hl[1])&&mode!=='live'&&tool&&!preview){
    const ok=canApply(hl[0],hl[1],tool);const [vx,vy]=wc2vc(hl[0],hl[1]);
    const pulse=0.35+Math.sin(tt*6)*0.1;
    poly([P(vx,vy),P(vx+1,vy),P(vx+1,vy+1),P(vx,vy+1)],ok?`rgba(80,220,120,${pulse})`:`rgba(240,80,80,${pulse})`);
    if(ok&&ghostType()&&hover)ghostAt=idx(hl[0],hl[1]);
  }
  bubbleAt=null;
  const s=S.sim, [su,sv]=w2v(s.x,s.y), sk=su+sv; let simDrawn=false;
  const nk=S.npc?(w2v(S.npc.x,S.npc.y).reduce((a,b)=>a+b,0)):1e9;let npcDrawn=!S.npc;
  const RES=(S.res||[]).map(r=>({r,k:w2v(r.x,r.y).reduce((a,b)=>a+b,0),done:false}));
  for(let d=0;d<2*N-1;d++){
    for(const q of RES)if(!q.done&&q.k<d+1.0003){drawResident(q.r);q.done=true;}
    if(!simDrawn&&sk<d+1.0001){drawSim();simDrawn=true;}
    if(!npcDrawn&&nk<d+1.0002){drawNPC();npcDrawn=true;}
    for(let vx=Math.max(0,d-N+1);vx<=Math.min(d,N-1);vx++){
      const vy=d-vx,[x,y]=vc2wc(vx,vy),i=idx(x,y);
      if(S.wall[i])drawWall(vx,vy,i,S.wall[i]);
      else if(preview&&preview.walls.has(i))drawWall(vx,vy,i,preview.walls.get(i),preview.bad.has(i)?'bad':'ok');
      else if(planWalls&&planWalls.has(i))drawWall(vx,vy,i,planWalls.get(i),'plan');
      if(i===boxAt)drawBox(vx,vy);
      if(S.obj[i])drawObj(vx,vy,S.obj[i],i,false,x,y);
      if(i===ghostAt){ctx.globalAlpha=.55;drawObj(vx,vy,{t:ghostType(),r:orientFor(ghostType(),x,y)},null,true,x,y);ctx.globalAlpha=1;}
    }
  }
  if(!simDrawn)drawSim();
  if(!npcDrawn)drawNPC();
  for(const q of RES)if(!q.done)drawResident(q.r);
  drawEntorno(night,tt,1);
  drawParts();
  drawBubble();
  }
  { // gradación de color según la hora (mañana cálida, tarde dorada)
    const h=S.t/60;const warm=Math.max(0,1-Math.abs(h-7.2)/1.8)*0.55+Math.max(0,1-Math.abs(h-18.6)/2)*0.8;
    if(warm>0.02&&night<1){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle=mixHex('#ffffff','#ffc890',Math.min(1,warm)*0.5);ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();}
  }
  if(night>0){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle=`rgba(20,25,70,${night*0.4})`;ctx.fillRect(0,0,cv.width,cv.height);
    ctx.globalCompositeOperation='lighter';
    ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z,DPR*cam.x,DPR*cam.y);
    const glow=(lx,ly,R,a)=>{const rg=ctx.createRadialGradient(lx,ly,0,lx,ly,R);rg.addColorStop(0,`rgba(255,196,110,${a})`);rg.addColorStop(1,'rgba(255,196,110,0)');ctx.fillStyle=rg;ctx.fillRect(lx-R,ly-R,2*R,2*R);};
    for(let i=0;i<(homeVis?N*N:0);i++){
      const o=S.obj[i];
      if(o&&OBJ[o.t]?.light){const [u,v]=w2v(i%N+.5,(i/N|0)+.5);const [lx,ly]=P(u,v,o.t==='farola'?62:38);glow(lx,ly,o.t==='farola'?170:130,0.5*night*(0.95+Math.sin(tt*3+i)*0.05));}
      if(S.wall[i]===3&&!S.sim.work){const [u,v]=w2v(i%N+.5,(i/N|0)+.5);const [lx,ly]=P(u,v,26);glow(lx,ly,60,0.22*night);}
      if(o&&o.t==='tele'&&S.sim.use&&S.sim.use.i===i){const [u,v]=w2v(i%N+.5,(i/N|0)+.5);const [lx,ly]=P(u,v,28);const rg=ctx.createRadialGradient(lx,ly,0,lx,ly,90);rg.addColorStop(0,`rgba(140,180,255,${0.3*night})`);rg.addColorStop(1,'rgba(140,180,255,0)');ctx.fillStyle=rg;ctx.fillRect(lx-90,ly-90,180,180);}
    }
    ctx.globalCompositeOperation='source-over';
  }
  ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z,DPR*cam.x,DPR*cam.y);
  if(mode!=='live'){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const badSet=new Set(badRooms().map(r=>r.id));
    for(const r of rooms){const [u,v]=w2v(r.cx,r.cy);const [wx,wy]=P(u,v,0);const sx=cam.x+wx*cam.z,sy=cam.y+wy*cam.z;
      label(`${r.zemoji} ${r.name} · ${r.cells.length*4} m² · ${'★'.repeat(r.stars)}${roomFull(r,'x')?' · llena':''}${badSet.has(r.id)?' · ⚠️ se llega cruzando un cuarto privado':''}`,sx,sy,'rgba(59,50,71,.78)','#fff',11);}
  }
  if(preview&&pointerScreen){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const ok=S.money>=preview.cost;
    label(`${preview.label} · ${fmt(preview.cost)}`,pointerScreen[0],pointerScreen[1]-58,ok?'#fffaf0':'#ffe1dc',ok?'#3b3247':'#c0392b',14);
  }
  { // luz suave desde arriba a la izquierda y viñeteado
    ctx.setTransform(1,0,0,1,0,0);const g=ctx.createLinearGradient(0,0,cv.width,cv.height);g.addColorStop(0,'rgba(255,250,235,.10)');g.addColorStop(1,'rgba(20,10,40,.10)');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);
    const rg=ctx.createRadialGradient(cv.width/2,cv.height*0.45,Math.min(cv.width,cv.height)*0.35,cv.width/2,cv.height*0.45,Math.max(cv.width,cv.height)*0.75);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,'rgba(15,10,35,.28)');ctx.fillStyle=rg;ctx.fillRect(0,0,cv.width,cv.height);
  }
  drawWeather(tt);
  if(rotFlash){const k=1-(performance.now()-rotFlash)/280;if(k>0){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(255,255,255,${k*0.55})`;ctx.fillRect(0,0,cv.width,cv.height);}else rotFlash=0;}
}

