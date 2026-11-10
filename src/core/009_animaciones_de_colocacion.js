// ---------- animaciones de colocación ----------
const anims=new Map(); // i → {t0,k}
function animStart(i,k){anims.set(i,{t0:performance.now(),k});}
function animOf(i){const a=anims.get(i);if(!a)return null;const t=(performance.now()-a.t0)/1000;if(t>0.9){anims.delete(i);return null;}return {t,k:a.k};}
function dropOffset(t){ // caída con rebote amortiguado
  if(t<0.22){const k=1-t/0.22;return 46*k*k;}
  const u=t-0.22;return Math.abs(Math.sin(u*16))*9*Math.exp(-u*7);
}
const easeOutBack=x=>{x=Math.min(1,Math.max(0,x));const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const doorOpen=new Map();

function drawWall(vx,vy,i,type,ghost){
  const cut=isCut(vx,vy);
  let h=type===4?18:(cut?LOW_H:WALL_H);
  const an=!ghost&&animOf(i);
  if(an)h*=Math.max(0.02,easeOutBack(an.t/0.4));
  const t=0.12, cx=vx+.5, cy=vy+.5;
  const base=ghost?(ghost==='bad'?'#e86a6a':ghost==='plan'?'#8ec9f0':'#9fe3b0'):WALLCOLS[S.wcol[i]||0][0];
  const s=S.sim;
  let alpha=ghost?(ghost==='plan'?0.42:0.6):1;
  if(!cut&&!ghost&&type!==4&&mode==='live'&&!s.work){const [su,sv]=w2v(s.x,s.y);const d=(vx+vy+1)-(su+sv), lat=Math.abs((vx-vy)-(su-sv));if(d>0&&d<4.5&&lat<3)alpha=.35;}
  ctx.globalAlpha=alpha;
  const arms=armsAt(vx,vy);
  if(type===4){
    for(const k in arms){const [a,b]=k==='L'?[vx-1,vy]:k==='R'?[vx+1,vy]:k==='U'?[vx,vy-1]:[vx,vy+1];const w=wallTypeAtV(a,b);if(arms[k]&&w!==4&&w!==2)arms[k]=false;}
    if(!arms.L&&!arms.R&&!arms.U&&!arms.D)arms.L=arms.R=true;
    prism(cx-.07,cy-.07,cx+.07,cy+.07,0,h,base);prism(cx-.09,cy-.09,cx+.09,cy+.09,h,h+2,shade(base,.9));
    wallShape(vx,vy,h*.28,h*.28+3,base,arms,0.035);wallShape(vx,vy,h*.66,h*.66+3,base,arms,0.035);
  } else if(type===2){
    const alongX=arms.L||arms.R||!(arms.U||arms.D);
    const z0=cut?h*0.6:h*0.76;
    const frame=shade(base,.92);
    if(alongX){prism(vx,cy-t,vx+.1,cy+t,0,h,frame);prism(vx+.9,cy-t,vx+1,cy+t,0,h,frame);prism(vx,cy-t,vx+1,cy+t,z0,h,base);}
    else{prism(cx-t,vy,cx+t,vy+.1,0,h,frame);prism(cx-t,vy+.9,cx+t,vy+1,0,h,frame);prism(cx-t,vy,cx+t,vy+1,z0,h,base);}
    // hoja de la puerta que se abre cuando Ana pasa cerca
    if(!ghost){
      const op=doorOpen.get(i)||0,a=op*Math.PI*0.48,L=0.8,lh=Math.min(z0-1,cut?h*.6:h*.74);
      const H=alongX?[vx+.1,cy]:[cx,vy+.1];
      const E=alongX?[H[0]+Math.cos(a)*L,H[1]+Math.sin(a)*L]:[H[0]+Math.sin(a)*L,H[1]+Math.cos(a)*L];
      const wood='#a8754a';
      poly([P(H[0],H[1],0),P(E[0],E[1],0),P(E[0],E[1],lh),P(H[0],H[1],lh)],shade(wood,0.75+0.2*op));
      const k=.82,hx=H[0]+(E[0]-H[0])*k,hy=H[1]+(E[1]-H[1])*k;const [kx,ky]=P(hx,hy,lh*.5);circ(kx,ky,1.6,'#e9c46a');
    }
  } else if(type===3&&!cut){
    wallShape(vx,vy,0,h*.34,base,arms);
    const a=ctx.globalAlpha;ctx.globalAlpha=a*0.5;
    const lit=nightFactor()>0.3&&!s.work;
    wallShape(vx,vy,h*.34,h*.76,lit?'#ffe9a8':'#bfe6ff',arms);
    ctx.globalAlpha=a;
    // marco y travesaño
    wallShape(vx,vy,h*.34,h*.37,'#ffffff',arms,0.13);wallShape(vx,vy,h*.545,h*.56,'#ffffff',arms,0.125);
    wallShape(vx,vy,h*.76,h,base,arms);
  } else {
    wallShape(vx,vy,0,h,base,arms);
    if(!ghost&&type===1&&h>20)wallShape(vx,vy,0,3,shade(base,.82),arms,0.125); // rodapié
    if(type===3&&cut){const [ex,ey]=P(cx,cy,h);ctx.fillStyle='#7cc6ef';ctx.fillRect(ex-4,ey-2,8,4);}
  }
  ctx.globalAlpha=1;
}

function lawnColor(vx,vy){const [x,y]=vc2wc(vx,vy);return shade(LAWN,(x%2?1.0:0.94)*(0.98+hash(x*31+y*57)*0.04));}
function floorColorAt(f,vx,vy){const F=FLOORS[f];if(f===0)return lawnColor(vx,vy);if(F.water)return '#d7e0e5';return (F.pat==='check'&&(vx+vy)%2)?shade(F.c,0.93):F.c;}
// el suelo de las casillas con pared se rellena por cuartos con el suelo de la habitación de al lado
function drawWallCellFloor(vx,vy,i){
  const own=S.floor[i];
  const pick=c=>{let best=null,bs=-1;for(const [a,b] of c){const [x,y]=vc2wc(a,b);if(!inb(x,y))continue;const j=idx(x,y);if(S.wall[j]&&S.wall[j]!==4)continue;const sc=(roomId[j]>=0?4:0)+(S.floor[j]!==0?2:0)+(c.indexOf(c.find(q=>q[0]===a&&q[1]===b))<2?1:0);if(sc>bs){bs=sc;best=S.floor[j];}}return best==null?own:best;};
  const Q=[[0,0,[[vx,vy-1],[vx-1,vy],[vx-1,vy-1]]],[.5,0,[[vx,vy-1],[vx+1,vy],[vx+1,vy-1]]],[0,.5,[[vx,vy+1],[vx-1,vy],[vx-1,vy+1]]],[.5,.5,[[vx,vy+1],[vx+1,vy],[vx+1,vy+1]]]];
  for(const [qa,qb,c] of Q){const f=pick(c);const col=floorColorAt(f,vx,vy);poly([P(vx+qa,vy+qb),P(vx+qa+.5,vy+qb),P(vx+qa+.5,vy+qb+.5),P(vx+qa,vy+qb+.5)],col,col);}
}
function drawFloor(vx,vy,f,alpha,i){
  const F=FLOORS[f],x0=vx,y0=vy;let c=F.c;
  if(alpha!=null)ctx.globalAlpha=alpha;
  let z=0;const an=i!=null&&animOf(i);if(an&&an.k==='floor')z=Math.sin(Math.min(1,an.t/0.3)*Math.PI)*4;
  if(f===0)c=lawnColor(vx,vy);
  if(F.water){
    const tt=performance.now()/900;
    poly([P(x0,y0,-6),P(x0+1,y0,-6),P(x0+1,y0+1,-6),P(x0,y0+1,-6)],shade(c,0.9+0.1*Math.sin(tt+vx*0.8+vy*0.5)));
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.2;ctx.beginPath();
    for(let k=0;k<2;k++){const ph=Math.sin(tt*1.3+vx+vy*0.7+k*2)*.1;const [a1,b1]=P(x0+.15,y0+.3+k*.4+ph,-6),[a2,b2]=P(x0+.6,y0+.2+k*.4+ph,-6);ctx.moveTo(a1,b1);ctx.quadraticCurveTo((a1+a2)/2,(b1+b2)/2-2,a2,b2);}ctx.stroke();
    const edge=(a,b)=>{const [x,y]=vc2wc(a,b);return !inb(x,y)||!FLOORS[S.floor[idx(x,y)]].water;};
    if(edge(vx-1,vy))poly([P(x0,y0,0),P(x0,y0+1,0),P(x0,y0+1,-6),P(x0,y0,-6)],'#cfd9df');
    if(edge(vx,vy-1))poly([P(x0,y0,0),P(x0+1,y0,0),P(x0+1,y0,-6),P(x0,y0,-6)],'#b9c6ce');
    ctx.strokeStyle='#f4f7f9';ctx.lineWidth=2.5;ctx.beginPath();
    const seg=(a,b,c2,d)=>{const [p,q]=P(a,b,0.5),[r,s2]=P(c2,d,0.5);ctx.moveTo(p,q);ctx.lineTo(r,s2);};
    if(edge(vx-1,vy))seg(x0,y0,x0,y0+1);if(edge(vx,vy-1))seg(x0,y0,x0+1,y0);if(edge(vx+1,vy))seg(x0+1,y0,x0+1,y0+1);if(edge(vx,vy+1))seg(x0,y0+1,x0+1,y0+1);ctx.stroke();
    ctx.globalAlpha=1;return;
  }
  if(z){ctx.save();ctx.translate(0,-z);}
  poly([P(x0,y0),P(x0+1,y0),P(x0+1,y0+1),P(x0,y0+1)],(F.pat==='check'&&(vx+vy)%2)?shade(c,0.93):c,mode!=='live'?'rgba(0,0,0,.07)':null);
  ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;
  if(f===0&&i!=null&&WEEDSET.has(i))drawWeed(vx,vy,i);
  if(f===0&&!(S.snow>1)){const [wx,wy]=vc2wc(vx,vy);if(hash(wx*97+wy*41)>(seasonOf()==='pri'?0.9:seasonOf()==='inv'?1:0.95)){const [a,b]=P(x0+.3+hash(wx+wy*7)*.4,y0+.3+hash(wx*3+wy)*.4);circ(a,b-1,1.5,['#ffffff','#ffe066','#ff9ec4'][(wx+wy)%3]);circ(a+3,b,1.2,'#ffffff');}}
  else if(F.pat==='planks'){ctx.beginPath();for(const k of [.25,.5,.75]){const [a,b]=P(x0+k,y0),[e,g]=P(x0+k,y0+1);ctx.moveTo(a,b);ctx.lineTo(e,g);}ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.05)';ctx.beginPath();const off=hash(vx*3+vy*7)*.8+.1;const [a,b]=P(x0+.25,y0+off),[e,g]=P(x0+.5,y0+off);ctx.moveTo(a,b);ctx.lineTo(e,g);ctx.stroke();}
  else if(F.pat==='rows'){ctx.strokeStyle='rgba(60,35,15,.25)';ctx.lineWidth=2;ctx.beginPath();for(const k of [.2,.45,.7,.95]){const [a,b]=P(x0,y0+k),[e,g]=P(x0+1,y0+k);ctx.moveTo(a,b);ctx.lineTo(e,g);}ctx.stroke();}
  else if(F.pat==='marble'){ctx.strokeStyle='rgba(120,120,150,.2)';ctx.beginPath();const r=hash(vx*7+vy*3);const [a,b]=P(x0+.1,y0+r*.8),[e,g]=P(x0+.9,y0+.2+r*.6);ctx.moveTo(a,b);ctx.quadraticCurveTo((a+e)/2+5,(b+g)/2-4,e,g);ctx.stroke();}
  else if(F.pat==='dots'){ctx.fillStyle='rgba(0,0,0,.14)';for(let k=0;k<7;k++){const r=hash(vx*31+vy*17+k*13),r2=hash(vx*13+vy*29+k*7);const [a,b]=P(x0+.08+r*.84,y0+.08+r2*.84);ctx.fillRect(a,b,2,1.5);}}
  else if(f===3){ctx.fillStyle='rgba(255,255,255,.06)';const [a,b]=P(x0+.5,y0+.5);ctx.fillRect(a-6,b-1,12,2);}
  if(z)ctx.restore();
  ctx.globalAlpha=1;
}

