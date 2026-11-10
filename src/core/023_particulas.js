// ---------- partículas ----------
const parts=[];
function emit(type,x,y,z,o={}){
  if(parts.length>450)parts.shift();
  const p={type,x,y,z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,age:0,life:o.life||1,col:o.col,txt:o.txt,size:o.size||1,rot:Math.random()*6,vr:(Math.random()-.5)*8};
  parts.push(p);return p;
}
function burst(type,x,y,z,n,spd,o={}){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,r=spd*(0.4+Math.random()*0.6);emit(type,x,y,z,{...o,vx:Math.cos(a)*r,vy:Math.sin(a)*r,vz:(o.vz||0)*(0.6+Math.random()*0.6),life:(o.life||1)*(0.7+Math.random()*0.5)});}}
function floatText(txt,x,y,z,col){emit('text',x,y,z,{vz:28,life:1.6,txt,col});}
function confetti(x,y,z){const cols=['#ff6b9d','#ffd166','#5bc0be','#9b5de5','#ff8a5b','#7cc46a'];for(let k=0;k<40;k++){const a=Math.random()*Math.PI*2,r=.6+Math.random()*1.2;emit('confetti',x,y,z,{vx:Math.cos(a)*r,vy:Math.sin(a)*r,vz:120+Math.random()*120,life:1.8,col:cols[k%cols.length]});}}
const G=320;
function tickParts(dt){
  for(let k=parts.length-1;k>=0;k--){
    const p=parts[k];p.age+=dt;if(p.age>=p.life){parts.splice(k,1);continue;}
    p.rot+=p.vr*dt;
    switch(p.type){
      case 'spark':case 'confetti':case 'chip':
        p.vz-=G*dt*(p.type==='confetti'?0.55:1);p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
        if(p.z<0){p.z=0;p.vz*=-0.45;p.vx*=0.6;p.vy*=0.6;if(Math.abs(p.vz)<15)p.vz=0;}
        if(p.type==='confetti'){p.vx*=1-dt*1.5;p.vy*=1-dt*1.5;if(p.vz<-40)p.vz=-40;}
        break;
      case 'drop':
        p.vz-=G*1.4*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
        if(p.z<=4){if(Math.random()<0.4)emit('splash',p.x,p.y,4,{life:.25});parts.splice(k,1);}
        break;
      case 'leaf':
        p.vz=-14;p.x+=(p.vx+Math.sin(p.age*3)*0.25)*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.z<0){p.z=0;p.vx=0;p.vy=0;p.vr=0;}
        break;
      default: p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
    }
  }
}
function drawParts(){
  for(const p of parts){
    const [u,v]=w2v(p.x,p.y);const [sx,sy]=P(u,v,p.z);const k=p.age/p.life,al=1-k;
    switch(p.type){
      case 'dust':ctx.fillStyle=`rgba(160,140,110,${0.45*al})`;circ(sx,sy,(2+k*7)*p.size,ctx.fillStyle);break;
      case 'steam':circ(sx,sy,3+k*9,`rgba(255,255,255,${0.35*al})`);break;
      case 'smoke':circ(sx,sy,2.5+k*8,`rgba(120,120,130,${0.3*al})`);break;
      case 'drop':capsule(sx,sy,sx,sy+4,1.3,'rgba(190,230,255,.9)');break;
      case 'splash':ctx.strokeStyle=`rgba(220,240,255,${al})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(sx,sy,2+k*6,1+k*3,0,0,Math.PI*2);ctx.stroke();break;
      case 'spark':case 'chip':ctx.fillStyle=p.col||'#e9c46a';ctx.globalAlpha=Math.min(1,al*2);ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot);ctx.fillRect(-1.8,-1.8,3.6,3.6);ctx.restore();ctx.globalAlpha=1;break;
      case 'confetti':ctx.fillStyle=p.col;ctx.globalAlpha=Math.min(1,al*2);ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot);ctx.fillRect(-2.5,-1.2,5,2.4);ctx.restore();ctx.globalAlpha=1;break;
      case 'leaf':ctx.fillStyle=p.col||'#6cbc5e';ctx.globalAlpha=Math.min(1,al*3);ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot);ctx.beginPath();ctx.ellipse(0,0,3,1.6,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;break;
      case 'note':ctx.globalAlpha=Math.min(1,al*1.5);ctx.fillStyle=p.col||'#9b5de5';ctx.font='900 14px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText(p.txt||'♪',sx+Math.sin(p.age*5)*4,sy);ctx.globalAlpha=1;break;
      case 'z':ctx.globalAlpha=Math.min(1,al*1.5);ctx.fillStyle='#5b6fd6';ctx.font=`900 ${10+k*8}px Nunito, sans-serif`;ctx.textAlign='center';ctx.fillText('z',sx+Math.sin(p.age*3)*5,sy);ctx.globalAlpha=1;break;
      case 'emoji':ctx.globalAlpha=Math.min(1,al*1.5);emoji(p.txt,sx+Math.sin(p.age*4)*3,sy,14*(p.size||1));ctx.globalAlpha=1;break;
      case 'twinkle':{const r=3*Math.sin(k*Math.PI);ctx.strokeStyle=`rgba(255,255,255,${al})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx-r,sy);ctx.lineTo(sx+r,sy);ctx.moveTo(sx,sy-r);ctx.lineTo(sx,sy+r);ctx.stroke();break;}
      case 'text':{ctx.globalAlpha=Math.min(1,al*2);const sc=k<.15?0.6+k/.15*0.4:1;ctx.save();ctx.translate(sx,sy);ctx.scale(sc,sc);label(p.txt,0,0,'rgba(255,255,255,.9)',p.col||'#2e8b57',12);ctx.restore();ctx.globalAlpha=1;break;}
    }
  }
}
let fxT={};
function every(key,sec,dt){fxT[key]=(fxT[key]||0)+dt;if(fxT[key]>=sec){fxT[key]=0;return true;}return false;}
function tickFX(dt){
  const s=S.sim;
  // puertas
  for(let i=0;i<N*N;i++)if(S.wall[i]===2){const x=i%N+.5,y=(i/N|0)+.5;const near=!s.work&&Math.hypot(s.x-x,s.y-y)<1.35;const v=doorOpen.get(i)||0,t=near?1:0;doorOpen.set(i,v+(t-v)*Math.min(1,dt*7));}
  if(speed===0||menu.classList.contains('open')){tickParts(dt);return;}
  if(!s.work&&s.use){
    const i=s.use.i,ox=i!=null?i%N+.5:s.x,oy=i!=null?(i/N|0)+.5:s.y;
    switch(s.use.type){
      case 'ducha':if(every('dr',0.025,dt))emit('drop',ox-.05+(Math.random()-.5)*.25,oy-.12+(Math.random()-.5)*.25,52,{vz:-20,life:1});if(every('st',0.35,dt))emit('steam',ox+(Math.random()-.5)*.4,oy+(Math.random()-.5)*.4,30,{vz:18,life:1.6});break;
      case 'fogon':if(every('sm',0.28,dt))emit('steam',ox-.17,oy-.17,30,{vz:22,vx:(Math.random()-.5)*.1,life:1.4});break;
      case 'cama':case '_suelo':if(every('zz',1.1,dt))emit('z',ox,oy,s.use.type==='cama'?30:16,{vz:16,vx:.08,life:2.2});break;
      case 'guitarra':if(every('nt',0.45,dt))emit('note',s.x,s.y,50,{vz:22,vx:(Math.random()-.5)*.3,life:1.8,txt:Math.random()<.5?'♪':'♫',col:['#9b5de5','#f15bb5','#3a86ff'][Math.random()*3|0]});break;
      case 'telefono':if(every('ph',1.4,dt))emit('emoji',s.x,s.y,58,{vz:14,life:1.5,txt:['💬','😂','❤️'][Math.random()*3|0],size:.8});break;
      case 'compu':if(every('cp',1.6,dt))emit('emoji',ox,oy,52,{vz:12,life:1.3,txt:['💡','⌨️','✨'][Math.random()*3|0],size:.7});break;
      case 'nevera':if(every('nv',0.9,dt))emit('chip',s.x,s.y,30,{vz:40,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,life:.8,col:'#e9c46a'});break;
      case '_build':{if(every('bd',0.42,dt)){const st=S.job&&S.job.steps[s.use.j];if(st){if(st.k==='paint')emit('spark',ox,oy,30,{vz:20,vx:(Math.random()-.5)*.3,life:.6,col:WALLCOLS[st.v][0]});else{emit('dust',ox,oy,6,{vz:10,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,life:.6,size:.7});if(Math.random()<.5)emit('chip',ox,oy,14,{vz:80,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,life:.8,col:'#c9b79c'});}}}break;}
      case '_weed':case 'huerto':if(every('wd',0.5,dt))emit('chip',ox,oy,6,{vz:60,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,life:.7,col:Math.random()<.5?'#6a9c3a':'#7a5230'});break;
      case 'barbacoa':if(every('bq',0.3,dt))emit('smoke',ox,oy,26,{vz:20,vx:(Math.random()-.5)*.15,life:1.6});break;
      case 'tele':if(every('tv',2.2,dt))emit('emoji',s.x,s.y,56,{vz:12,life:1.4,txt:['😆','😮','🍿'][Math.random()*3|0],size:.8});break;
    }
  }
  if(S.npc&&S.npc.work&&every('nw',0.36,dt)){const st=S.job&&S.job.steps[S.npc.work.j];if(st){const ox=st.i%N+.5,oy=(st.i/N|0)+.5;emit('dust',ox,oy,6,{vz:10,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,life:.6,size:.7});if(Math.random()<.4)emit('chip',ox,oy,14,{vz:80,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,life:.8,col:'#c9b79c'});}}
  if(every('brk',0.7,dt))for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&o.c!=null&&o.c<=0&&ELECTRIC.has(o.t)){emit('smoke',i%N+.5,(i/N|0)+.5,30,{vz:18,vx:(Math.random()-.5)*.2,life:1.5});if(Math.random()<.3)emit('spark',i%N+.5,(i/N|0)+.5,26,{vz:70,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,life:.5,col:'#ffe066'});}}
  // polvo al andar por exterior
  if(!s.work&&anaRT.moving&&every('ft',0.32,dt)){const [x,y]=simCell();if(inb(x,y)&&[0,7,8].includes(S.floor[idx(x,y)]))emit('dust',s.x,s.y,1,{vz:6,life:.6,size:.6});}
  // hojas que caen y destellos en la piscina
  if(every('lf',0.25,dt)){
    for(let k=0;k<3;k++){const i=Math.random()*N*N|0;const o=S.obj[i];
      {const se=seasonOf();if(o&&o.t==='arbol'&&se!=='inv'&&Math.random()<(se==='oto'?0.7:0.2))emit('leaf',i%N+.5+(Math.random()-.5)*.6,(i/N|0)+.5+(Math.random()-.5)*.6,55,{vx:.15,vy:.05,life:4,col:se==='oto'?pickR(['#c9702e','#d98b2e','#e3a53a','#b4552a']):se==='pri'&&Math.random()<.4?'#ffc0d6':Math.random()<.3?'#e0b04a':'#6cbc5e'});}
      if(FLOORS[S.floor[i]].water&&nightFactor()<.5)emit('twinkle',i%N+Math.random(),(i/N|0)+Math.random(),-5,{life:.5});}
  }
  tickParts(dt);
}

