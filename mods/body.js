// extremidad con grosor que se estrecha y articulaciones redondeadas
function limb(x1,y1,x2,y2,w1,w2,col,hi){
  const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x1+nx*w1/2,y1+ny*w1/2);ctx.lineTo(x2+nx*w2/2,y2+ny*w2/2);ctx.lineTo(x2-nx*w2/2,y2-ny*w2/2);ctx.lineTo(x1-nx*w1/2,y1-ny*w1/2);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(x1,y1,w1/2,0,Math.PI*2);ctx.arc(x2,y2,w2/2,0,Math.PI*2);ctx.fill();
  if(hi){ctx.strokeStyle=hi;ctx.lineWidth=Math.max(.5,w2*.28);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1+nx*w1*.22,y1+ny*w1*.22);ctx.lineTo(x2+nx*w2*.22,y2+ny*w2*.22);ctx.stroke();}
}
function elbowDown(sx,sy,ex,ey,l1,l2){const dx=ex-sx,dy=ey-sy;const d=Math.max(.001,Math.min(Math.hypot(dx,dy),l1+l2-.01));const n=Math.hypot(dx,dy)||1;
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));const mx=sx+dx/n*a,my=sy+dy/n*a;const p1=[mx-dy/n*h,my+dx/n*h],p2=[mx+dy/n*h,my-dx/n*h];
  // codo hacia abajo y algo hacia atrás
  return (p1[1]-p1[0]*.35)>(p2[1]-p2[0]*.35)?p1:p2;}
function drawAna(bx,by,o){
  const tt=performance.now()/1000,C=o.ch||{};
  const skin=o.skin||C.skin||SKIN,hair=o.hair||C.hair||HAIR,pants=o.pants||C.pants||PANTS,style=o.style||C.style||'coleta',beard=o.beard||C.beard||'no',fem=(o.g||C.g||'f')==='f',glasses=o.glasses??C.glasses,eyes=C.eyes||'#3b2a20';
  const bw=(BUILDS[o.build||C.build]||BUILDS.media)[1];
  ctx.save();ctx.translate(bx,by);if(!o.right)ctx.scale(-1,1);
  const walk=o.pose==='walk',sit=o.pose==='sit',front=o.front,act=o.act;
  const ph=anaRT.phase;
  if(!o.noShadow){ctx.save();ctx.scale(1,.42);const g=ctx.createRadialGradient(0,0,1,0,0,11);g.addColorStop(0,'rgba(20,10,40,.32)');g.addColorStop(1,'rgba(20,10,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();ctx.restore();}
  // ---------- piernas: cinemática directa, el pie de apoyo toca el suelo ----------
  const L1=9.4,L2=9.2,legs=[];
  for(const [side,off] of [[-1,Math.PI],[1,0]]){const p=ph+off;let th,sh;
    if(sit){th=1.42;sh=0.08;}
    else if(walk){th=Math.sin(p)*0.4;sh=th-Math.max(0,Math.cos(p))*0.95-0.04;}
    else{th=side>0?0.05:-0.02;sh=th-0.02;}
    const hx0=side>0?1.1*bw:-1.3*bw,hy0=side>0?0.3:-0.4;
    const kx=hx0+Math.sin(th)*L1,ky=hy0+Math.cos(th)*L1,fx=kx+Math.sin(sh)*L2,fy=ky+Math.cos(sh)*L2;legs.push({side,hx0,hy0,kx,ky,fx,fy,sh});}
  let groundY=Math.max(...legs.map(l=>l.fy));
  const hipY=sit?-6:-groundY-1.2,shY=hipY-15.5;
  const lean=walk?0.05:0;
  const shoe=(x,y,ang,dark)=>{ctx.save();ctx.translate(x,y);ctx.rotate(Math.max(-.5,Math.min(.6,-ang*0.6)));ctx.fillStyle=dark?'#1f1c24':'#2c2833';ctx.beginPath();ctx.moveTo(-1.4,-1.4);ctx.quadraticCurveTo(3.6,-1.9,3.9,.1);ctx.quadraticCurveTo(3.8,1.2,1.2,1.2);ctx.lineTo(-1.6,1.2);ctx.closePath();ctx.fill();ctx.fillStyle='#e9e4dc';ctx.fillRect(-1.6,.6,5.4,.6);ctx.restore();};
  const drawLeg=l=>{const col=l.side<0?shade(pants,.78):pants;const X=v=>v,Y=v=>v+hipY;
    limb(X(l.hx0),Y(l.hy0),X(l.kx),Y(l.ky),4.9*bw,4.1*bw,col,l.side>0?'rgba(255,255,255,.12)':null);
    limb(X(l.kx),Y(l.ky),X(l.fx),Y(l.fy),4.1*bw,3.3*bw,col,l.side>0?'rgba(255,255,255,.1)':null);
    shoe(X(l.fx),Y(l.fy)+.4,l.sh,l.side<0);};
  ctx.save();ctx.translate(0,hipY);ctx.rotate(lean);ctx.translate(0,-hipY);
  const shW=(fem?4.9:6.1)*bw,waW=(fem?3.7:4.8)*bw,hiW=(fem?5:4.7)*bw;
  const SH={far:[-shW+1.4,shY+1.6],near:[shW-1.2,shY+2]};
  const hx=1,hy=shY-7.2+(o.sad?.8:0);
  const hairG=(y0,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(hair,1.28));g.addColorStop(.55,hair);g.addColorStop(1,shade(hair,.8));return g;};
  // ---------- brazos ----------
  const UA=6.4,FA=6;
  const armTarget=(near)=>{const [sx,sy]=near?SH.near:SH.far;
    if(!act||act==='watch'){const sw=walk?(near?-1:1)*Math.sin(ph)*0.42:Math.sin(tt*1.2+(near?0:1))*0.025;const a=sw+(near?0.06:-0.02),b=a+(walk?0.25:0.18);const ex=sx+Math.sin(a)*UA,ey=sy+Math.cos(a)*UA;return {fk:true,ex,ey,hx:ex+Math.sin(b)*FA,hy:ey+Math.cos(b)*FA};}
    let x,y;
    if(near){if(act==='eat'){const k=(Math.sin(tt*3)+1)/2;x=5;y=shY+11-k*12;}else if(act==='stir'){x=10+Math.cos(tt*7)*2.4;y=shY+9+Math.sin(tt*7)*1.2;}else if(act==='type'){x=9.5+Math.cos(tt*22)*1.1;y=shY+9.5;}
      else if(act==='book'){x=8.5;y=shY+6.5;}else if(act==='phone'){x=hx+4.6;y=hy+1.5;}else if(act==='talk'){x=8+Math.sin(tt*4)*2.5;y=shY+5+Math.cos(tt*5)*3;}else if(act==='strum'){x=3;y=shY+10.5+Math.sin(tt*14)*2.5;}
      else if(act==='shower'){x=6+Math.sin(tt*9+1)*1.8;y=shY-8;}else if(act==='cheer'){x=7;y=shY-11+Math.sin(tt*6)*1.5;}else if(act==='hammer'){const k=Math.pow(Math.abs(Math.sin(tt*5)),0.6);const ang=-1.2+k*1.55;x=4+Math.cos(ang)*10.5;y=shY+1+Math.sin(ang)*10.5;}
      else if(act==='paint'){x=10;y=shY-1+Math.sin(tt*5)*6;}else if(act==='dig'){x=9;y=shY+11+Math.abs(Math.sin(tt*4))*2.5;}else{x=sx+1;y=sy+12;}}
    else{if(act==='type'){x=7.5+Math.sin(tt*20)*1;y=shY+9.5;}else if(act==='strum'){x=10;y=shY+4.5;}else if(act==='shower'){x=-3+Math.sin(tt*9)*1.8;y=shY-8.5;}else if(act==='cheer'){x=-6;y=shY-11;}else if(['stir','eat','book','dig'].includes(act)){x=4.5;y=shY+9;}else{x=sx+.6;y=sy+12.2;}}
    const d=Math.hypot(x-sx,y-sy),R=UA+FA-.2;if(d>R){x=sx+(x-sx)/d*R;y=sy+(y-sy)/d*R;}
    const [ex,ey]=elbowDown(sx,sy,x,y,UA,FA);return {ex,ey,hx:x,hy:y};};
  const drawArm=(near)=>{const [sx,sy]=near?SH.near:SH.far;const t=armTarget(near);const sk=near?skin:shade(skin,.84),sh=near?shade(o.shirt,.95):shade(o.shirt,.76);
    limb(sx,sy,t.ex,t.ey,3.6*bw,3*bw,sk);limb(sx,sy,sx+(t.ex-sx)*.55,sy+(t.ey-sy)*.55,4.6*bw,4*bw,sh);limb(t.ex,t.ey,t.hx,t.hy,2.9*bw,2.3*bw,sk,near?'rgba(255,255,255,.12)':null);
    ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(t.hx+.3,t.hy+.4,1.5,1.9,0.3,0,Math.PI*2);ctx.fill();return t;};
  // ---------- pelo largo por detrás ----------
  const longBack=()=>{ctx.fillStyle=hairG(hy-6,shY+10);
    if(style==='melena'){ctx.beginPath();ctx.moveTo(hx-5.2,hy-3);ctx.bezierCurveTo(hx-8.2,hy+3,hx-7.6,shY+5,hx-5.6,shY+9.5);ctx.quadraticCurveTo(hx-2,shY+11,hx+1.8,shY+8.5);ctx.bezierCurveTo(hx+.4,shY+4,hx-1,hy+5,hx-1.2,hy+1);ctx.closePath();ctx.fill();
      ctx.strokeStyle=shade(hair,.7);ctx.globalAlpha=.4;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(hx-5.6,hy);ctx.quadraticCurveTo(hx-6.8,shY+4,hx-4.4,shY+9);ctx.moveTo(hx-3.4,hy+2);ctx.quadraticCurveTo(hx-4,shY+5,hx-1.6,shY+9);ctx.stroke();ctx.globalAlpha=1;}
    else if(style==='media'){ctx.beginPath();ctx.moveTo(hx-5.3,hy-3);ctx.bezierCurveTo(hx-7.4,hy+1,hx-7,hy+5.5,hx-5,hy+7.2);ctx.quadraticCurveTo(hx-2.6,hy+8,hx-.6,hy+6.4);ctx.bezierCurveTo(hx-1.6,hy+4,hx-1.6,hy+2,hx-1.4,hy);ctx.closePath();ctx.fill();}
    else if(style==='afro'){ctx.beginPath();ctx.ellipse(hx-1.4,hy-2.4,8.2,7.8,0,0,Math.PI*2);ctx.fill();}
    else if(style==='rizos'){for(let k=0;k<8;k++){const a=Math.PI*.6+k*.24;circ(hx-.8+Math.cos(a)*6,hy-1.5+Math.sin(a)*6.3,2.6,k%2?shade(hair,1.1):hair);}}
    else if(style==='coleta'){const sw=Math.sin(tt*3+(walk?ph:0))*.2;ctx.save();ctx.translate(hx-5.2,hy-3.4);ctx.rotate(.5+sw);ctx.fillStyle=hairG(-1,11);ctx.beginPath();ctx.moveTo(-1.6,0);ctx.bezierCurveTo(-3.2,4,-2,9,0,11.5);ctx.bezierCurveTo(1.8,8,1.8,3,1.2,0);ctx.closePath();ctx.fill();circ(0,0,1.5,shade(hair,.6));ctx.restore();}
    else if(style==='mono'){circ(hx-4,hy-5.4,2.9,hairG(hy-8.5,hy-2.5));ctx.strokeStyle=shade(hair,.7);ctx.lineWidth=.5;ctx.beginPath();ctx.arc(hx-4,hy-5.4,1.6,0.5,3.5);ctx.stroke();}};
  // ---------- casco de pelo, de frente ----------
  const hairCap=()=>{if(style==='calvo'){ctx.fillStyle=shade(hair,.9);ctx.globalAlpha=.35;ctx.beginPath();ctx.ellipse(hx-4.3,hy+.5,1.4,2.6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
    ctx.fillStyle=hairG(hy-8,hy+3);if(style==='rapado')ctx.globalAlpha=.5;
    const vol=style==='afro'||style==='rizos'?1.2:style==='corto'?0.5:0.3;
    ctx.beginPath();ctx.moveTo(hx-3.9,hy+3.4);ctx.bezierCurveTo(hx-6.4-vol,hy+1,hx-6.6-vol,hy-6,hx-1.2,hy-7.6-vol);ctx.bezierCurveTo(hx+3.4,hy-8.4-vol,hx+5.6+vol*.4,hy-5.4,hx+5.2,hy-2.2);
    if(style==='coleta'||style==='mono'){ctx.quadraticCurveTo(hx+2.6,hy-4.4,hx-.6,hy-3.4);}
    else if(style==='corto'||style==='rapado'){ctx.lineTo(hx+4.6,hy-1.6);ctx.quadraticCurveTo(hx+3.2,hy-3.4,hx+1.6,hy-3.3);ctx.quadraticCurveTo(hx,hy-4.2,hx-1,hy-2.8);}
    else if(style==='rizos'||style==='afro'){ctx.quadraticCurveTo(hx+4,hy-2.4,hx+3,hy-3.4);ctx.quadraticCurveTo(hx+1.8,hy-2.2,hx+.6,hy-3.4);ctx.quadraticCurveTo(hx-.4,hy-2.2,hx-1.2,hy-2.6);}
    else{ctx.quadraticCurveTo(hx+4.2,hy-1.2,hx+2.4,hy-3);ctx.quadraticCurveTo(hx+.4,hy-4.6,hx-1.4,hy-2.4);}
    ctx.quadraticCurveTo(hx-2.6,hy-1,hx-2.7,hy+1.8);ctx.quadraticCurveTo(hx-3.2,hy+3,hx-3.9,hy+3.4);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    if(style==='rizos'||style==='afro')for(let k=0;k<6;k++){const a=Math.PI*1.05+k*.32;circ(hx-.6+Math.cos(a)*(style==='afro'?7.4:6),hy-2+Math.sin(a)*(style==='afro'?7.2:6.2),style==='afro'?2.6:2,k%2?shade(hair,1.12):hair);}
    if(style!=='rapado'){ctx.strokeStyle=shade(hair,.68);ctx.globalAlpha=.45;ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(hx+3.6,hy-5.4);ctx.quadraticCurveTo(hx-1,hy-7.4,hx-5,hy-2.4);ctx.moveTo(hx+1.6,hy-4);ctx.quadraticCurveTo(hx-2.4,hy-5.2,hx-4.6,hy+.6);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.ellipse(hx+.4,hy-6.2,2.8,.8,-.25,0,Math.PI*2);ctx.fill();}
    if(style==='melena'||style==='media'){ctx.fillStyle=hairG(hy-3,hy+8);ctx.beginPath();ctx.moveTo(hx-1.6,hy-3);ctx.bezierCurveTo(hx-3.6,hy,hx-3.4,hy+4,hx-3.8,style==='melena'?shY+6:hy+6.8);ctx.lineTo(hx-5.6,style==='melena'?shY+5:hy+6);ctx.bezierCurveTo(hx-6,hy+2,hx-5.6,hy-2,hx-3.4,hy-4);ctx.closePath();ctx.fill();}};
  // ---------- cabeza ----------
  const head=()=>{
    ctx.fillStyle=shade(skin,.8);ctx.beginPath();ctx.moveTo(hx-1.6,shY+.6);ctx.lineTo(hx-1.4,hy+3.6);ctx.lineTo(hx+2,hy+4.4);ctx.lineTo(hx+2,shY+.8);ctx.closePath();ctx.fill();
    const fg=ctx.createRadialGradient(hx+1.8,hy-1.4,.8,hx+.6,hy,7);fg.addColorStop(0,shade(skin,1.08));fg.addColorStop(1,shade(skin,.86));
    if(front){
      ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(hx-4.6,hy-.6);ctx.bezierCurveTo(hx-4.8,hy-7.6,hx+5.2,hy-7.8,hx+4.9,hy-1.2);ctx.bezierCurveTo(hx+4.9,hy+1.4,hx+4.4,hy+3.4,hx+2.6,hy+5.2);ctx.quadraticCurveTo(hx+1.2,hy+6.2,hx-.6,hy+5.4);ctx.bezierCurveTo(hx-3,hy+4.4,hx-4.6,hy+2.6,hx-4.6,hy-.6);ctx.fill();
      hairCap();
      if(style!=='melena'){ctx.fillStyle=shade(skin,.9);ctx.beginPath();ctx.ellipse(hx-3.3,hy+.8,1.1,1.7,.1,0,Math.PI*2);ctx.fill();ctx.fillStyle=shade(skin,.75);ctx.beginPath();ctx.ellipse(hx-3.2,hy+.8,.45,.8,0,0,Math.PI*2);ctx.fill();}
      if(beard!=='no'){ctx.fillStyle=beard==='sombra'?'rgba(40,30,30,.2)':hairG(hy,hy+8);
        if(beard==='bigote'){ctx.beginPath();ctx.ellipse(hx+2.6,hy+3,1.9,.7,-.1,0,Math.PI*2);ctx.fill();}
        else{const b2=beard==='larga'?hy+8.5:hy+6.2;ctx.beginPath();ctx.moveTo(hx-2.6,hy+1.2);ctx.quadraticCurveTo(hx-2.4,b2,hx+1.4,b2);ctx.quadraticCurveTo(hx+4.6,b2-1.2,hx+4.8,hy+1.2);ctx.lineTo(hx+4.2,hy+2.2);ctx.quadraticCurveTo(hx+2.4,hy+2.6,hx+.6,hy+2.3);ctx.quadraticCurveTo(hx-1,hy+2.2,hx-2.6,hy+1.2);ctx.fill();}}
      const blink=(tt%4.3)<0.12||o.sleep;const e1=hx+.1,e2=hx+3.3,ey=hy+.1;
      if(blink){ctx.strokeStyle='#3b3247';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(e1-1,ey+.3);ctx.lineTo(e1+1,ey+.3);ctx.moveTo(e2-.8,ey+.3);ctx.lineTo(e2+.9,ey+.3);ctx.stroke();}
      else for(const [ex2,rx] of [[e1,1.05],[e2,.9]]){ctx.fillStyle='#fbfaf7';ctx.beginPath();ctx.ellipse(ex2,ey,rx,.8,0,0,Math.PI*2);ctx.fill();circ(ex2+.25,ey+.05,.62,eyes);circ(ex2+.28,ey+.05,.28,'#111');ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(ex2+.35,ey-.35,.32,.32);
        ctx.strokeStyle='rgba(40,25,25,.8)';ctx.lineWidth=.5;ctx.beginPath();ctx.ellipse(ex2,ey,rx,.8,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();if(fem){ctx.beginPath();ctx.moveTo(ex2+rx*.8,ey-.5);ctx.lineTo(ex2+rx*1.25,ey-.95);ctx.stroke();}}
      ctx.strokeStyle=shade(hair,.62);ctx.lineWidth=fem?.5:.75;ctx.lineCap='round';const sd=o.sad?.6:0;
      ctx.beginPath();ctx.moveTo(e1-1.2,ey-1.8);ctx.quadraticCurveTo(e1,ey-2.4,e1+1.1,ey-1.9-sd);ctx.moveTo(e2-1,ey-1.9-sd);ctx.quadraticCurveTo(e2,ey-2.4,e2+1.1,ey-1.8);ctx.stroke();
      ctx.strokeStyle=shade(skin,.66);ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(hx+4.3,hy+.2);ctx.quadraticCurveTo(hx+5.4,hy+2.2,hx+4.4,hy+2.6);ctx.stroke();
      if(fem||o.mood>60){ctx.fillStyle='rgba(235,110,100,.15)';ctx.beginPath();ctx.ellipse(hx-.6,hy+2.6,1.4,.85,0,0,Math.PI*2);ctx.fill();}
      const lip=fem?'#b9534f':shade(skin,.6),mx=hx+2.4,my=hy+4;ctx.strokeStyle=lip;ctx.lineWidth=.7;ctx.beginPath();
      if(act==='eat'&&Math.sin(tt*6)>0){ctx.fillStyle='#6b2b2b';ctx.ellipse(mx,my,.9,.75,0,0,Math.PI*2);ctx.fill();}
      else if(act==='talk'||act==='phone'||act==='cheer'){ctx.fillStyle='#6b2b2b';ctx.ellipse(mx,my,.95,.3+Math.abs(Math.sin(tt*10))*.8,0,0,Math.PI*2);ctx.fill();}
      else if(o.mood>62){ctx.arc(mx,my-1,1.5,.22*Math.PI,.8*Math.PI);ctx.stroke();}else if(o.mood>32){ctx.moveTo(mx-1.1,my);ctx.quadraticCurveTo(mx,my+.25,mx+1.1,my);ctx.stroke();}else{ctx.arc(mx,my+1.4,1.4,1.25*Math.PI,1.75*Math.PI);ctx.stroke();}
      if(glasses){ctx.strokeStyle='#2b2b33';ctx.lineWidth=.5;ctx.beginPath();ctx.ellipse(e1,ey,1.6,1.3,0,0,Math.PI*2);ctx.moveTo(e2+1.5,ey);ctx.ellipse(e2,ey,1.5,1.3,0,0,Math.PI*2);ctx.moveTo(e1+1.6,ey-.2);ctx.lineTo(e2-1.5,ey-.2);ctx.moveTo(e1-1.6,ey-.3);ctx.lineTo(hx-3,ey-.4);ctx.stroke();}
    }else{
      ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(hx,hy-.6,5,6.2,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=shade(skin,.86);ctx.beginPath();ctx.ellipse(hx+4.5,hy+.6,1.1,1.7,0,0,Math.PI*2);ctx.fill();
      if(style!=='calvo'){ctx.fillStyle=hairG(hy-8,hy+5);if(style==='rapado')ctx.globalAlpha=.5;const v=style==='afro'?2.6:style==='rizos'?1.2:.4;ctx.beginPath();ctx.ellipse(hx-.3,hy-1.4,5.5+v,6.4+v,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        if(style==='melena'||style==='media'){ctx.beginPath();ctx.moveTo(hx-5.6,hy-1);ctx.bezierCurveTo(hx-6.6,hy+5,hx-6.2,style==='melena'?shY+7:hy+6,hx-4,style==='melena'?shY+9.5:hy+7.4);ctx.quadraticCurveTo(hx,style==='melena'?shY+11:hy+8.4,hx+4,style==='melena'?shY+9.5:hy+7.4);ctx.bezierCurveTo(hx+6,style==='melena'?shY+7:hy+6,hx+6.4,hy+4,hx+5.4,hy-1);ctx.closePath();ctx.fill();}
        if(style==='coleta'){ctx.save();ctx.translate(hx-.5,hy+1);ctx.rotate(Math.sin(tt*3)*.15);ctx.beginPath();ctx.moveTo(-1.6,0);ctx.bezierCurveTo(-2.6,4,-1.4,9,0,11);ctx.bezierCurveTo(1.4,9,2.6,4,1.6,0);ctx.closePath();ctx.fill();ctx.restore();}
        if(style==='mono')circ(hx-.3,hy-5,3,shade(hair,1.08));
        if(style==='rizos'||style==='afro')for(let k=0;k<8;k++){const a=k/8*Math.PI*2;circ(hx-.3+Math.cos(a)*(5+v),hy-1.4+Math.sin(a)*(5.6+v),2.3,k%2?shade(hair,1.1):hair);}
        ctx.strokeStyle=shade(hair,.68);ctx.globalAlpha=.4;ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(hx-2.4,hy-6);ctx.quadraticCurveTo(hx-3.4,hy-1,hx-2.6,hy+3.6);ctx.moveTo(hx+1.6,hy-6.4);ctx.quadraticCurveTo(hx+2.6,hy-1,hx+1.8,hy+3.8);ctx.stroke();ctx.globalAlpha=1;}
    }
    if(o.helmet){ctx.fillStyle='#f6c90e';ctx.beginPath();ctx.arc(hx,hy-2.6,6.6,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(hx-7.6,hy-3.1,15.6,1.9);ctx.fillStyle='#ffe066';ctx.fillRect(hx-.9,hy-9,2,6.4);}
  };
  // ---------- torso ----------
  const torso=()=>{ctx.fillStyle=pants;ctx.beginPath();ctx.moveTo(-hiW,hipY-3.6);ctx.lineTo(hiW,hipY-3.6);ctx.quadraticCurveTo(hiW+.4,hipY+1.6,hiW-1,hipY+2.6);ctx.lineTo(-hiW+1,hipY+2.6);ctx.quadraticCurveTo(-hiW-.4,hipY+1.6,-hiW,hipY-3.6);ctx.fill();
    const g=ctx.createLinearGradient(-shW,0,shW,0);g.addColorStop(0,shade(o.shirt,.82));g.addColorStop(.45,o.shirt);g.addColorStop(1,shade(o.shirt,1.08));
    const br=1+Math.sin(tt*2.2)*0.012;ctx.save();ctx.translate(0,hipY);ctx.scale(1,br);ctx.translate(0,-hipY);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-shW,shY+2.4);ctx.quadraticCurveTo(-shW,shY-.4,-shW+2.4,shY-.8);ctx.lineTo(shW-2.4,shY-.8);ctx.quadraticCurveTo(shW,shY-.4,shW+.2,shY+2.4);
    ctx.bezierCurveTo(waW+1.2,shY+6,waW,hipY-7,waW,hipY-5.4);ctx.quadraticCurveTo(hiW,hipY-3.6,hiW,hipY-2);ctx.lineTo(-hiW,hipY-2);ctx.quadraticCurveTo(-hiW,hipY-3.6,-waW,hipY-5.4);ctx.bezierCurveTo(-waW,hipY-7,-waW-1.2,shY+6,-shW,shY+2.4);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-waW+.6,hipY-4);ctx.quadraticCurveTo(0,hipY-3,waW-.6,hipY-4);ctx.stroke();
    if(front){if(fem){ctx.fillStyle='rgba(0,0,0,.06)';ctx.beginPath();ctx.ellipse(.6,shY+6,2.2,1,0,0,Math.PI);ctx.fill();ctx.beginPath();ctx.ellipse(4,shY+6,1.9,.9,0,0,Math.PI);ctx.fill();}
      ctx.fillStyle=shade(skin,.9);ctx.beginPath();ctx.moveTo(-.4,shY-.8);ctx.quadraticCurveTo(1.6,shY+2.6,3.8,shY-.8);ctx.fill();}
    if(o.vest){ctx.fillStyle='rgba(255,140,40,.85)';ctx.fillRect(-shW+.6,shY+.6,shW*2-1.2,hipY-shY-4);ctx.fillStyle='#eef3f4';ctx.fillRect(-shW+.6,shY+6,shW*2-1.2,1.4);ctx.fillRect(-waW,shY+10.5,waW*2,1.4);}
    ctx.restore();};
  // ---------- orden de pintado ----------
  const farLeg=legs[0],nearLeg=legs[1];
  if(front)longBack();
  drawArm(false);
  drawLeg(farLeg);drawLeg(nearLeg);
  torso();
  if(!front&&(style==='coleta'||style==='mono'));
  head();
  if(!front&&style==='melena'){}
  // objetos en mano
  if(act==='strum'){ctx.save();ctx.translate(2,shY+9);ctx.rotate(-0.55);ctx.fillStyle='#d4873b';ctx.beginPath();ctx.ellipse(0,0,6,4.6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(5.4,0,4.2,3.5,0,0,Math.PI*2);ctx.fill();circ(2.8,0,1.5,'#3a2516');ctx.fillStyle='#5a3825';ctx.fillRect(8.4,-1.1,12,2.2);ctx.fillRect(19.6,-1.8,3.6,3.6);ctx.restore();}
  if(act==='book'){ctx.fillStyle='#c0392b';ctx.fillRect(6,shY+1.5,7.5,6.5);ctx.fillStyle='#fff';ctx.fillRect(6.8,shY+2.3,5.9,4.9);ctx.fillStyle='#ddd';ctx.fillRect(9.6,shY+2.3,.6,4.9);}
  const t=drawArm(true);
  if(act==='hammer'){const ang=Math.atan2(t.hy-t.ey,t.hx-t.ex);const x2=t.hx+Math.cos(ang)*7,y2=t.hy+Math.sin(ang)*7;limb(t.hx,t.hy,x2,y2,1.6,1.6,'#8a5a2b');ctx.save();ctx.translate(x2,y2);ctx.rotate(ang);ctx.fillStyle='#5f6670';ctx.fillRect(-1.6,-4,4,8);ctx.restore();}
  if(act==='paint'){limb(t.hx,t.hy,t.hx+2,t.hy-7,1.5,1.5,'#8a5a2b');ctx.fillStyle=o.paintCol||'#f4c7bd';ctx.fillRect(t.hx-2,t.hy-12,8,4.5);}
  if(act==='phone'){ctx.fillStyle='#2b2b33';ctx.save();ctx.translate(t.hx,t.hy);ctx.rotate(-0.9);roundRect(-1.5,-4.2,3,7.5,1);ctx.fill();ctx.restore();}
  if(act==='eat')circ(t.hx+1.8,t.hy-1,2,'#e9c46a');
  if(act==='dig'){limb(t.hx,t.hy,t.hx+3,t.hy+7,1.3,1.3,'#8a5a2b');ctx.fillStyle='#8a8f98';ctx.beginPath();ctx.ellipse(t.hx+3.4,t.hy+8.4,1.9,1.1,.5,0,Math.PI*2);ctx.fill();}
  if(act==='water'){ctx.fillStyle='#3fa7a2';roundRect(t.hx-1,t.hy-1,6.5,4.5,1.4);ctx.fill();limb(t.hx+5.5,t.hy,t.hx+9,t.hy-2,1.1,1.1,'#3fa7a2');}
  if(!front&&(style==='melena'))longBack();
  ctx.restore();
  ctx.restore();
  return [bx,by+hy-12];
}
