// ---------- dormir: tumbada de verdad ----------
function bedMate(){const s=S.sim;if(!s.use||s.use.type!=='cama'||s.use.nap||s.work>0)return null;
  for(const r of S.res||[]){const p=(S.people||[]).find(q=>q.k===r.pid);if(!p)continue;if(r.kind==='partner'||(r.kind==='guest'&&r.stay&&['rollo','cita','pareja'].includes(p.stage)))return p;}return null;}
function bedSleepers(i){const s=S.sim;if(!s.use||s.use.i!==i||s.use.type!=='cama')return null;const L_=[{ch:CH(),me:1}];const p=bedMate();if(p)L_.push({ch:p.ch||{skin:'#c68a5c',hair:'#2b2b2b',style:'corto',g:'m'},k:p.k});return L_;}
{const _dr=drawResident;drawResident=function(r){const p=bedMate();if(p&&r.pid===p.k)return;return _dr(r);};}
// cabeza de lado sobre la almohada (coordenadas locales: coronilla hacia -y)
function sleepFace(ch,tt,ph){const skin=ch.skin||SKIN,hair=ch.hair||HAIR,st=bodyHair(ch.style||'corto'),fem=(ch.g||'f')==='f',beard=bodyBeard(ch.beard||'no');
  const hg=(y0,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(hair,1.25));g.addColorStop(1,shade(hair,.85));return g;};
  // pelo extendido sobre la almohada
  ctx.fillStyle=hg(-12,6);
  if(st==='melena'){ctx.beginPath();ctx.moveTo(-5.2,3);ctx.bezierCurveTo(-12,1,-10.5,-11,-1,-11);ctx.bezierCurveTo(6.5,-11,10,-6,8.6,-.6);ctx.bezierCurveTo(6.4,-4.4,3,-7.2,-1,-6.4);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-5,1);ctx.quadraticCurveTo(-12.5,4,-10.5,10);ctx.quadraticCurveTo(-7.4,7,-3.8,5);ctx.closePath();ctx.fill();
    ctx.strokeStyle=shade(hair,.7);ctx.globalAlpha=.45;ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(-3,-9);ctx.quadraticCurveTo(-9,-6,-9.6,2);ctx.moveTo(1,-9.6);ctx.quadraticCurveTo(6,-8,7.4,-2.6);ctx.moveTo(-6,2);ctx.quadraticCurveTo(-9.6,5,-9.4,8.4);ctx.stroke();ctx.globalAlpha=1;}
  else if(st==='media'){ctx.beginPath();ctx.ellipse(-.6,-3.4,7.4,6.6,0,0,Math.PI*2);ctx.fill();}
  else if(st==='coleta'){ctx.beginPath();ctx.moveTo(-4.4,-4.6);ctx.bezierCurveTo(-9,-7,-12.6,-3,-11.6,3);ctx.bezierCurveTo(-9.6,0,-7.6,-1.6,-4,-2);ctx.closePath();ctx.fill();circ(-4.6,-3.6,1.2,shade(hair,.6));}
  else if(st==='mono')circ(-3.4,-6.4,3.1,hg(-9.5,-3));
  else if(st==='afro'){circ(-.6,-2.4,8.4,hg(-11,6));for(let k=0;k<10;k++){const a=k/10*Math.PI*2;circ(-.6+Math.cos(a)*7.8,-2.4+Math.sin(a)*7.8,1.8,k%2?shade(hair,1.1):hair);}}
  else if(st==='rizos'){for(let k=0;k<9;k++){const a=Math.PI*.7+k*.24;circ(-.4+Math.cos(a)*6,-1.6+Math.sin(a)*6.2,2.5,k%2?shade(hair,1.12):hair);}}
  // cara
  const fg=ctx.createRadialGradient(1.6,-1,.8,.4,0,7);fg.addColorStop(0,shade(skin,1.06));fg.addColorStop(1,shade(skin,.84));
  ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(-4.4,-.6);ctx.bezierCurveTo(-4.6,-7.4,5,-7.6,4.8,-1.2);ctx.bezierCurveTo(4.8,1.4,4.3,3.4,2.6,5.1);ctx.quadraticCurveTo(1.2,6.1,-.6,5.3);ctx.bezierCurveTo(-3,4.3,-4.4,2.6,-4.4,-.6);ctx.fill();
  if(st!=='calvo'){ctx.fillStyle=hg(-8,3);if(st==='rapado')ctx.globalAlpha=.5;const v=st==='afro'||st==='rizos'?1:st==='corto'?.5:.3;
    ctx.beginPath();ctx.moveTo(-3.9,3.2);ctx.bezierCurveTo(-6.2-v,1,-6.4-v,-6,-1.2,-7.5-v);ctx.bezierCurveTo(3.4,-8.3-v,5.6,-5.4,5.1,-2.2);
    if(st==='corto'||st==='rapado'){ctx.lineTo(4.5,-1.7);ctx.quadraticCurveTo(3,-3.4,1.4,-3.3);ctx.quadraticCurveTo(0,-4.1,-1,-2.8);}else{ctx.quadraticCurveTo(4,-1.4,2.3,-3);ctx.quadraticCurveTo(.4,-4.5,-1.4,-2.4);}
    ctx.quadraticCurveTo(-2.6,-1,-2.7,1.6);ctx.quadraticCurveTo(-3.2,2.8,-3.9,3.2);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    if(st==='afro'||st==='rizos')for(let k=0;k<5;k++){const a=Math.PI*1.1+k*.32;circ(-.5+Math.cos(a)*6.6,-2+Math.sin(a)*6.6,2,k%2?shade(hair,1.1):hair);}
    if(st==='melena'||st==='media'){ctx.fillStyle=hg(-3,7);ctx.beginPath();ctx.moveTo(-1.6,-3);ctx.bezierCurveTo(-3.6,0,-3.2,4,-3.6,6.4);ctx.lineTo(-5.6,5.6);ctx.bezierCurveTo(-6,2,-5.6,-2,-3.4,-4);ctx.closePath();ctx.fill();}}
  else{ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(.6,-5.4,2.4,.8,-.2,0,Math.PI*2);ctx.fill();}
  if(st!=='melena'){ctx.fillStyle=shade(skin,.9);ctx.beginPath();ctx.ellipse(-3.3,.8,1.1,1.7,.1,0,Math.PI*2);ctx.fill();}
  if(beard!=='no'){ctx.fillStyle=beard==='sombra'?'rgba(40,30,30,.2)':hg(0,8);if(beard==='bigote'){ctx.beginPath();ctx.ellipse(2.6,3,1.9,.7,-.1,0,Math.PI*2);ctx.fill();}
    else{const b2=beard==='larga'?8.5:6.2;ctx.beginPath();ctx.moveTo(-2.6,1.2);ctx.quadraticCurveTo(-2.4,b2,1.4,b2);ctx.quadraticCurveTo(4.6,b2-1.2,4.8,1.2);ctx.lineTo(4.2,2.2);ctx.quadraticCurveTo(2.4,2.6,.6,2.3);ctx.quadraticCurveTo(-1,2.2,-2.6,1.2);ctx.fill();}}
  // ojos cerrados, cejas relajadas, boca entreabierta al respirar
  ctx.strokeStyle='#3b3247';ctx.lineWidth=.62;ctx.lineCap='round';ctx.beginPath();ctx.arc(.2,-.2,1,.18*Math.PI,.82*Math.PI);ctx.moveTo(4.1,.15);ctx.arc(3.3,-.2,.85,.18*Math.PI,.82*Math.PI);ctx.stroke();
  if(fem){ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(-.6,.5);ctx.lineTo(-1.1,.9);ctx.moveTo(2.6,.5);ctx.lineTo(2.2,.9);ctx.stroke();}
  ctx.strokeStyle=shade(hair,.62);ctx.lineWidth=fem?.45:.7;ctx.beginPath();ctx.moveTo(-.9,-1.9);ctx.quadraticCurveTo(.2,-2.3,1.2,-2);ctx.moveTo(2.4,-2);ctx.quadraticCurveTo(3.3,-2.3,4.3,-1.9);ctx.stroke();
  ctx.fillStyle='rgba(235,110,100,.18)';ctx.beginPath();ctx.ellipse(-.4,2.4,1.5,.9,0,0,Math.PI*2);ctx.fill();
  const op=Math.max(0,Math.sin(tt*1.4+ph));ctx.fillStyle='#7a3a3a';ctx.beginPath();ctx.ellipse(2.5,4,.75,.25+op*.45,0,0,Math.PI*2);ctx.fill();}
function sleepHeadAt(ch,a,b,z,ua,ub,tt,ph,sc){const [x,y]=LP(a,b,z),[ux,uy]=LP(ua,ub,z);let dx=ux-x,dy=uy-y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const phi=Math.atan2(dx,-dy);ctx.save();ctx.translate(x,y);ctx.rotate(phi);if(Math.sin(phi)<0)ctx.scale(-1,1);ctx.scale(sc||.9,sc||.9);
  // sombra sobre la almohada
  ctx.fillStyle='rgba(60,70,110,.1)';ctx.beginPath();ctx.ellipse(-.6,1.6,6,5.6,0,0,Math.PI*2);ctx.fill();
  sleepFace(ch,tt,ph);ctx.restore();return [x,y];}
// bulto del cuerpo bajo la ropa de cama: de (a0,b0) hombros a (a1,b1) pies, en coordenadas locales
const LUMP_T=[0,.1,.22,.36,.5,.62,.74,.86,.95,1],LUMP_H=[2.8,3.5,3.6,3.1,2.9,2.3,2.3,1.9,2.7,.6],LUMP_W=[.95,1,1,.95,.92,.8,.74,.66,.62,.4];
function bodyLump(a0,b0,a1,b1,w,zb,col,breath,knee,hs){hs=hs||1;const da=a1-a0,db=b1-b0,L_=Math.hypot(da,db)||1,na=-db/L_,nb=da/L_;
  const pts=LUMP_T.map((t,i)=>{let h=LUMP_H[i]*hs*(i>=1&&i<=3?1+breath:1);if(knee&&i>=5&&i<=7)h+=knee*(i===6?1:.5);const ww=w*LUMP_W[i];const a=a0+da*t,b=b0+db*t;return {l:LP(a-na*ww,b-nb*ww,zb),r:LP(a+na*ww,b+nb*ww,zb),t:LP(a,b,zb+h)};});
  const path=(A,B)=>{ctx.beginPath();ctx.moveTo(A[0][0],A[0][1]);for(let i=1;i<A.length-1;i++){const mx=(A[i][0]+A[i+1][0])/2,my=(A[i][1]+A[i+1][1])/2;ctx.quadraticCurveTo(A[i][0],A[i][1],mx,my);}ctx.lineTo(A[A.length-1][0],A[A.length-1][1]);
    const R=B.slice().reverse();ctx.lineTo(R[0][0],R[0][1]);for(let i=1;i<R.length-1;i++){const mx=(R[i][0]+R[i+1][0])/2,my=(R[i][1]+R[i+1][1])/2;ctx.quadraticCurveTo(R[i][0],R[i][1],mx,my);}ctx.lineTo(R[R.length-1][0],R[R.length-1][1]);ctx.closePath();};
  const L1=pts.map(p=>p.l),R1=pts.map(p=>p.r),T1=pts.map(p=>p.t);
  const dl=ldepth(a0-na*w,b0-nb*w),dr=ldepth(a0+na*w,b0+nb*w);const ly=L1.reduce((s,p)=>s+p[1],0),ry=R1.reduce((s,p)=>s+p[1],0);
  const sides=[[L1,ly<ry?1.07:.84,dl],[R1,ry<ly?1.07:.84,dr]].sort((p,q)=>p[2]-q[2]);
  for(const [E,f] of sides){path(E,T1);ctx.fillStyle=shade(col,f);ctx.fill();}
  ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=.8;ctx.beginPath();T1.slice(1,-1).forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
  return pts;}
function bedSleepLayers(L,sl,blanket,tt){const n=sl.length,night=nightFactor();
  sl.forEach((p,k)=>{p.a=n>1?(k?.69:.31):.5;p.w=n>1?.15:.2;p.ph=k*1.7;});
  if(n>1)L.push([ldepth(.5,.27)+.0005,()=>{lp(.12,.18,.48,.36,15,19,'#ffffff');lp(.52,.18,.88,.36,15,19,'#f7f9fd');}]);
  for(const p of sl)L.push([ldepth(p.a,.3)+.001,()=>{const [hx,hy]=sleepHeadAt(p.ch,p.a,.255,23,p.a,.1,tt,p.ph,n>1?.9:1);if(p.me)bubbleAt=[hx,hy-22];}]);
  L.push([ldepth(.5,.66),()=>{const zb=17.6;
    lp(.1,.38,.9,.92,15,zb,blanket);
    // pespuntes del edredón
    ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle=shade(blanket,.6);ctx.lineWidth=.6;ctx.beginPath();for(const a of [.3,.5,.7]){const [x1,y1]=LP(a,.5,zb),[x2,y2]=LP(a,.92,zb);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}for(const b of [.6,.76]){const [x1,y1]=LP(.1,b,zb),[x2,y2]=LP(.9,b,zb);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}ctx.stroke();ctx.restore();
    const lumps=[];
    for(const p of sl){const br=Math.sin(tt*1.5+p.ph)*.13,kn=p.me?(Math.sin(S.t/97)>.3?1.6:0):(Math.sin(S.t/71+2)>.2?1.4:0);
      lumps.push({p,pts:bodyLump(p.a,.42,p.a+(n>1?0:.02),.9,p.w,zb,blanket,br,kn),br});}
    // embozo: la sábana doblada sobre los hombros
    const fold='#eaf0fa';lp(.1,.39,.9,.46,15,zb+.9,fold);
    for(const {p,br} of lumps){const hh=2.9*(1+br);const arc=(b)=>{const out=[];for(let k=0;k<=8;k++){const u=-1+k/4;out.push(LP(p.a+u*p.w*1.05,b,zb+.9+hh*Math.sqrt(Math.max(0,1-u*u))));}return out;};
      const A=arc(.39),B=arc(.46);ctx.fillStyle=fold;ctx.beginPath();A.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));B.slice().reverse().forEach(q=>ctx.lineTo(q[0],q[1]));ctx.closePath();ctx.fill();
      const fr=lvis(0,1)?B:A;const [z0x,z0y]=LP(p.a-p.w*1.05,lvis(0,1)?.46:.39,zb+.9),[z1x,z1y]=LP(p.a+p.w*1.05,lvis(0,1)?.46:.39,zb+.9);
      ctx.fillStyle='#d6deec';ctx.beginPath();ctx.moveTo(z0x,z0y);fr.forEach(q=>ctx.lineTo(q[0],q[1]));ctx.lineTo(z1x,z1y);ctx.closePath();ctx.fill();}
    // un brazo fuera del edredón, a ratos
    for(const {p} of lumps){const out=p.me?Math.sin(S.t/53)>-.1:Math.sin(S.t/61+1)>.4;if(!out)continue;const sd=n>1?(p.me?-1:1):1,ch=p.ch,sk=ch.skin||SKIN,sl2=ch.shirt||'#9fb7d9';
      const [sx,sy]=LP(p.a+sd*p.w*.8,.44,zb+3.4),[ex,ey]=LP(p.a+sd*p.w*1.1,.58,zb+1.4),[hx2,hy2]=LP(p.a+sd*p.w*.35,.64,zb+3.3);
      limb(sx,sy,ex,ey,3.4,3,shade(sl2,.95));limb(ex,ey,hx2,hy2,2.6,2.1,sk);circ(hx2,hy2,1.5,sk);}
  }]);
  // luz de noche: penumbra azulada sobre la cama (también sobre la cabeza)
  if(night>0){const cs=[[.06,.06],[.94,.06],[.06,.94],[.94,.94]].map(([a,b])=>ldepth(a,b));
    L.push([Math.max(...cs)+.02,()=>{const [cx,cy]=LP(.5,.5,20);ctx.save();ctx.translate(cx,cy-4);ctx.scale(1,.66);ctx.globalCompositeOperation='multiply';const g=ctx.createRadialGradient(0,0,4,0,0,44);g.addColorStop(0,`rgb(${255-90*night|0},${255-75*night|0},${255-30*night|0})`);g.addColorStop(1,'#fff');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,44,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';const g2=ctx.createRadialGradient(0,-6,2,0,-6,34);g2.addColorStop(0,`rgba(150,180,255,${.1*night})`);g2.addColorStop(1,'rgba(150,180,255,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(0,-6,34,0,Math.PI*2);ctx.fill();ctx.restore();}]);}}
// siesta en el sofá: tumbada con una mantita
function sofaDoze(){const s=S.sim;if(!s.use||s.use.type!=='sofa'||s.work>0)return false;const h=S.t/60;return S.needs.energia<30||h>=23.5||h<6;}
function sofaNap(tt){const ch=CH(),zb=13.4,col='#e9c46a';
  // mantita
  ctx.fillStyle=shade(col,.92);ctx.beginPath();const q=[LP(.36,.34,zb+.2),LP(.82,.34,zb+.2),LP(.84,.88,zb+.2),LP(.36,.9,zb+.2)];q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
  if(lvis(0,1)){ctx.fillStyle=shade(col,.78);ctx.beginPath();const f=[LP(.36,.9,zb+.2),LP(.84,.88,zb+.2),LP(.84,.9,zb-5),LP(.36,.92,zb-5.5)];f.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
  const br=Math.sin(tt*1.5)*.13;bodyLump(.34,.6,.84,.6,.21,zb,col,br,1.4,1.6);
  ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle=shade(col,.55);ctx.lineWidth=.6;ctx.beginPath();for(const a of [.48,.62,.76]){const [x1,y1]=LP(a,.36,zb+.3),[x2,y2]=LP(a,.88,zb+.3);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}ctx.stroke();ctx.restore();
  const [hx,hy]=sleepHeadAt(ch,.27,.6,17.6,.12,.6,tt,0,.9);bubbleAt=[hx,hy-14];}
{const _tf=tickFX;tickFX=function(dt){_tf(dt);if(speed===0||menu.classList.contains('open'))return;const s=S.sim;
  if(sofaDoze()&&s.use.i!=null&&every('zs',1.4,dt))emit('z',s.use.i%N+.5,(s.use.i/N|0)+.5,24,{vz:16,vx:.08,life:2.2});
  if(bedMate()&&s.use.i!=null&&every('zp',1.7,dt))emit('z',s.use.i%N+.7,(s.use.i/N|0)+.4,28,{vz:14,vx:.06,life:2});};}

