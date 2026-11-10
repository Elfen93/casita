// ---------- elementos ----------
function entTree(x,y,sc,k,tt){const [px,py]=wp(x,y);const se=seasonOf();const sw=Math.sin(tt*1.1+k*1.7)*1.6*sc;
  cyl(...w2v(x,y),.12*sc,0,22*sc,'#7a5230');
  const pal={pri:['#4f9a43','#5cae4c','#6cbf58','#82cf6a'],ver:['#3f8a3a','#4a9a43','#58ac4e','#6cbc5e'],oto:['#b4552a','#c9702e','#d98b2e','#e3a53a'],inv:null}[se];
  if(!pal){ctx.strokeStyle='#6b4a2e';ctx.lineCap='round';for(const [a,l,w] of [[-2.2,20,2.6],[-1.1,22,2.2],[-1.6,27,2],[-0.6,18,1.8]]){ctx.lineWidth=w*sc;ctx.beginPath();ctx.moveTo(px+sw*.3,py-21*sc);ctx.lineTo(px+sw*.3+Math.cos(a)*l*sc,py-21*sc+Math.sin(a)*l*sc);ctx.stroke();}
    if(S.snow>0)circ(px+sw*.3,py-40*sc,5*sc,'#fff');return;}
  for(const [i,[bx,by,r]] of [[0,-34,18],[-9,-42,13],[9,-43,13],[0,-52,13]].entries())circ(px+bx*sc+sw*(-by/60),py+by*sc,r*sc,pal[i]);
  if(S.snow>0){ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(px+sw*.9,py-62*sc,8*sc,3.5*sc,0,0,Math.PI*2);ctx.fill();}}
function entLamp(x,y,night,k){const [px,py]=wp(x,y);const [u,v]=w2v(x,y);
  if(night>.3){const g=ctx.createRadialGradient(px,py,2,px,py,44);g.addColorStop(0,`rgba(255,220,150,${.32*night})`);g.addColorStop(1,'rgba(255,220,150,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(px,py,44,22,0,0,Math.PI*2);ctx.fill();}
  cyl(u,v,.07,0,38,'#4a4e57');ctx.fillStyle='#4a4e57';ctx.fillRect(px-4,py-40,8,3);
  circ(px,py-42,night>.3?4.5:3.5,night>.3?'#ffe8a8':'#e8e8e8');
  if(night>.3){ctx.fillStyle=`rgba(255,230,160,${.25*night})`;ctx.beginPath();ctx.arc(px,py-42,9,0,Math.PI*2);ctx.fill();}
  // carteles electorales en la farola
  const w=W_();if(w.elec!=null&&w.elec<22&&k%2===0){const cols=['#c0392b','#2a6fdb','#2a9d8f','#e9c46a'];ctx.fillStyle=cols[k%4];ctx.fillRect(px-7,py-30,14,10);ctx.fillStyle='#fff';ctx.fillRect(px-5,py-27,10,2);ctx.fillRect(px-5,py-23,6,1.5);}}
function entWindows(u0,v0,u1,v1,z0,z1,cols,rows,night,seed,lit){const [uw,vw]=[u1-u0,v1-v0];
  const win=(pts,i)=>{const on=night>.25&&hash(seed*13+i*7)<(lit??(.35+night*.3));poly(pts,on?'#ffe29a':mixHex('#9fb6cf','#223',night*.6));if(on){ctx.save();ctx.globalAlpha=.25*night;poly(pts,'#ffd36b');ctx.restore();}};
  let i=0;for(let r=0;r<rows;r++){const za=z0+(r+.25)*(z1-z0)/rows,zb=z0+(r+.7)*(z1-z0)/rows;
    const cu=Math.max(1,Math.round(uw/1.6)),cv=Math.max(1,Math.round(vw/1.6));
    for(let c=0;c<cu;c++){const a=u0+(c+.3)*uw/cu,b=u0+(c+.75)*uw/cu;win([P(a,v1,za),P(b,v1,za),P(b,v1,zb),P(a,v1,zb)],i++);}
    for(let c=0;c<cv;c++){const a=v0+(c+.3)*vw/cv,b=v0+(c+.75)*vw/cv;win([P(u1,a,za),P(u1,b,za),P(u1,b,zb),P(u1,a,zb)],i++);}}}
function entRoof(x0,y0,x1,y1,h,col){const rh=h+26;const alongX=(x1-x0)>=(y1-y0);const o=.45;
  if(alongX){const ym=(y0+y1)/2;wpoly([[x0-o,y0-o,h],[x1+o,y0-o,h],[x1+o,ym,rh],[x0-o,ym,rh]],shade(col,1.05));wpoly([[x0-o,y1+o,h],[x1+o,y1+o,h],[x1+o,ym,rh],[x0-o,ym,rh]],shade(col,.78));
    wpoly([[x0-o,y0-o,h],[x0-o,y1+o,h],[x0-o,ym,rh]],shade(col,.6));wpoly([[x1+o,y0-o,h],[x1+o,y1+o,h],[x1+o,ym,rh]],shade(col,.68));}
  else{const xm=(x0+x1)/2;wpoly([[x0-o,y0-o,h],[x0-o,y1+o,h],[xm,y1+o,rh],[xm,y0-o,rh]],shade(col,1.05));wpoly([[x1+o,y0-o,h],[x1+o,y1+o,h],[xm,y1+o,rh],[xm,y0-o,rh]],shade(col,.78));
    wpoly([[x0-o,y0-o,h],[x1+o,y0-o,h],[xm,y0-o,rh]],shade(col,.6));wpoly([[x0-o,y1+o,h],[x1+o,y1+o,h],[xm,y1+o,rh]],shade(col,.68));}
  if(S.snow>0){ctx.save();ctx.globalAlpha=.8;if(alongX){const ym=(y0+y1)/2;wpoly([[x0-o,y0-o,h+1],[x1+o,y0-o,h+1],[x1+o,ym,rh+1],[x0-o,ym,rh+1]],'#f4f6fa');}else{const xm=(x0+x1)/2;wpoly([[x0-o,y0-o,h+1],[x0-o,y1+o,h+1],[xm,y1+o,rh+1],[xm,y0-o,rh+1]],'#f4f6fa');}ctx.restore();}
  // chimenea
  wbox(x0+.6,y0+.6,x0+1.2,y0+1.2,h+8,h+32,'#8a6a5a');}
function entFence(x0,y0,x1,y1){const col='#e8e2d6';for(let x=x0;x<=x1;x+=.75){wbox(x-.05,y1-.05,x+.05,y1+.05,0,7,col);}for(let y=y0;y<=y1;y+=.75){wbox(x0-.05,y-.05,x0+.05,y+.05,0,7,col);}
  const [u0,v0,u1,v1]=vrect([x0,y0,x1,y1]);ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.beginPath();let p=wp(x0,y1,5);ctx.moveTo(p[0],p[1]);p=wp(x1,y1,5);ctx.lineTo(p[0],p[1]);p=wp(x0,y0,5);ctx.moveTo(p[0],p[1]);p=wp(x0,y1,5);ctx.lineTo(p[0],p[1]);ctx.stroke();}
function entHouse(hs,night,tt){const w=W_();const [x0,y0,x1,y1]=hs.r;
  if(hs.park){for(const [k,[dx,dy]] of [[0,1.1,1.2],[1,4.6,1.4],[2,1.3,4.6],[3,4.7,4.4]].entries())entTree(x0+dx,y0+dy,.9+hash(k*3)*.3,k,tt);
    // banco y papelera
    wbox(x0+1.2,y0+3.2,x0+2.4,y0+3.5,5,7,'#8a6a4a');wbox(x0+1.3,y0+3.25,x0+1.4,y0+3.45,0,5,'#4a4e57');wbox(x0+2.2,y0+3.25,x0+2.3,y0+3.45,0,5,'#4a4e57');
    cyl(...w2v(x0+4.2,y0+3.1),.18,0,8,'#5a7f4a');return;}
  const closed=hs.closable&&w.crisis>=50;const col=closed?shade(hs.c,.85):hs.c;
  const [u0,v0,u1,v1]=wbox(x0,y0,x1,y1,0,hs.h,col);
  const floors=hs.flat?Math.max(1,Math.round(hs.h/28)):1;
  entWindows(u0,v0,u1,v1,hs.shop?30:14,hs.h-8,0,hs.shop&&floors>1?floors-1:floors,night,hash(hs.id.length*7)*100|0,closed?0:undefined);
  if(hs.flat){wflat(x0-.2,y0-.2,x1+.2,y1+.2,hs.h,shade(col,.7));wbox(x0-.2,y0-.2,x1+.2,y0+.1,hs.h,hs.h+3,shade(col,.9));wbox(x0-.2,y0-.2,x0+.1,y1+.2,hs.h,hs.h+3,shade(col,.9));wbox(x0-.2,y1-.1,x1+.2,y1+.2,hs.h,hs.h+3,shade(col,.9));wbox(x1-.1,y0-.2,x1+.2,y1+.2,hs.h,hs.h+3,shade(col,.9));
    if(S.snow>0)wflat(x0-.1,y0-.1,x1+.1,y1+.1,hs.h+.5,'rgba(255,255,255,.85)');
    // antena y depósito
    cyl(...w2v(x0+1,y0+1),.35,hs.h,hs.h+8,'#b8b8b8');}
  else entRoof(x0,y0,x1,y1,hs.h,hs.roof);
  // escaparate / toldo
  if(hs.shop){const sx0=(u0+u1)/2-1.3,sx1=(u0+u1)/2+1.3;poly([P(sx0,v1,0),P(sx1,v1,0),P(sx1,v1,24),P(sx0,v1,24)],closed?'#6b6f76':(night>.4?'#ffe8b0':'#cfe3ef'));
    if(closed){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;for(let z=1;z<24;z+=2){const a=P(sx0,v1,z),b=P(sx1,v1,z);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
      const [lx,ly]=P((u0+u1)/2,v1,14);label('SE ALQUILA',lx,ly,'#fff','#c0392b',7);}
    else{poly([P(sx0-.3,v1,26),P(sx1+.3,v1,26),P(sx1+.3,v1+.6,21),P(sx0-.3,v1+.6,21)],hs.awning);for(let k=0;k<4;k++){const a=sx0-.3+(sx1-sx0+.6)*(k/4),b=a+(sx1-sx0+.6)/8;poly([P(a,v1,26),P(b,v1,26),P(b,v1+.6,21),P(a,v1+.6,21)],'rgba(255,255,255,.5)');}}
    if(cam.z>=.55){const [lx,ly]=P((u0+u1)/2,v1,hs.h+6);ctx.save();ctx.globalAlpha=.9;label(hs.sign,lx,ly,'rgba(255,253,248,.92)','#3b3247',8);ctx.restore();}}
  else{const dm=(u0+u1)/2;poly([P(dm-.35,v1,0),P(dm+.35,v1,0),P(dm+.35,v1,22),P(dm-.35,v1,22)],hs.door||'#5a3e2b');circ(...P(dm+.25,v1,11),1.2,'#e9c46a');}
  // balcones con pancartas
  if(hs.balc){for(let f=1;f<floors;f++){const z=f*hs.h/floors;wbox(x0+1,y1,x1-1,y1+.6,z,z+1,shade(col,.8));wbox(x0+1,y1+.5,x1-1,y1+.6,z+1,z+12,'rgba(60,60,70,.55)');
      if(w.mov>=45&&f===1){const a=P(u0+1.2,v1+.6,z+14),b=P(u1-1.2,v1+.6,z+14);poly([a,b,[b[0],b[1]+13],[a[0],a[1]+13]],'#fff8e0');const [lx,ly]=P((u0+u1)/2,v1+.6,z+7);label(w.mov>=65?'HUELGA GENERAL':'TU CASA NO ES SU NEGOCIO',lx,ly,'rgba(0,0,0,0)','#c0392b',6.5);}}}
  // jardín y valla
  if(hs.garden){const [gx0,gy0,gx1,gy1]=hs.garden;wflat(gx0,gy0,gx1,gy1,.02,shade(LAWN,.97));if(hs.fence)entFence(gx0,gy0,gx1,gy1);
    entTree(gx0+1.2,gy0+1.2,.7,hs.id.length,tt);
    if(hs.kids){const k=Math.floor((tt*.6)%3);const [bx,by]=wp(gx1-1.5,gy1-1.2);emoji(['⚽','🛴','🪁'][k],bx,by-10,12);}}
  // luces de Navidad
  if(dateOf(S.day).m===11&&!hs.shop&&!hs.flat){const cols=['#ff5a5a','#ffd166','#06d6a0','#4cc9f0'];const n=10;for(let k=0;k<n;k++){const t=k/(n-1);const [px,py]=wp(x0+(x1-x0)*t,y1+.1,hs.h-1+Math.sin(t*Math.PI)*-3);circ(px,py,1.6,night>.3?cols[(k+Math.floor(tt*2))%4]:'#aaa');}}
}
function entBg(b,night){const [u0,v0,u1,v1]=wbox(b.r[0],b.r[1],b.r[2],b.r[3],0,b.h,b.c);
  if(b.obra){const w=W_();const stopped=w.crisis>=60;// grúa
    const [cx,cy]=[(b.r[0]+b.r[2])/2,(b.r[1]+b.r[3])/2];cyl(...w2v(cx,cy),.25,b.h,b.h+110,'#e9c46a');const t=wp(cx,cy,b.h+110),a=wp(cx+7,cy-7,b.h+104);ctx.strokeStyle='#e9c46a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(t[0],t[1]);ctx.lineTo(a[0],a[1]);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#777';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0],a[1]+30);ctx.stroke();
    if(cam.z>=.5){const [lx,ly]=P((u0+u1)/2,v1,b.h+10);label(stopped?'PROMOCIÓN PARALIZADA':'VIVIENDAS DE LUJO · 100 % VENDIDAS',lx,ly,'rgba(255,253,248,.9)','#3b3247',7);}
    return;}
  entWindows(u0,v0,u1,v1,6,b.h-4,0,Math.max(2,Math.round(b.h/18)),night,b.h,undefined);}
// coches aparcados: posiciones cambian según el día
function entParked(night){const cols=['#d9534f','#5bc0be','#f0ad4e','#3b3f46','#e9ecef','#6c757d','#8e5ea2'];const out=[];
  for(let k=0;k<4;k++){if(entSeed(k+20)<.25)continue;const x=-9+k*7+entSeed(k)*3;if(x>N-2&&x<N+2)continue;const [u,v]=w2v(x,N+1.95);out.push({u,v,f:()=>drawCar(u,v,cols[(k+(S.day||0))%cols.length],w2v(x+1,N+1.95),night)});}
  for(let k=0;k<2;k++){if(entSeed(k+40)<.3)continue;const y=-6+k*9+entSeed(k+9)*3;const [u,v]=w2v(N+1.95,y);out.push({u,v,f:()=>drawCar(u,v,cols[(k+3+(S.day||0))%cols.length],w2v(N+1.95,y+1),night)});}
  return out;}
// recorrido de la acera en forma de L
const ENT_PATH_LEN=(N+.75-ENT_STREET.far)*2;
function entPath(t,side){t=((t%ENT_PATH_LEN)+ENT_PATH_LEN)%ENT_PATH_LEN;const a=N+.75-ENT_STREET.far;const off=side?4.25:0;
  if(t<a)return [ENT_STREET.far+t,N+.75+off];return [N+.75+off,N+.75-(t-a)];}
function entMoving(tt,night){const items=[];const h=S.t/60;const crowd=night>.7?.3:h<7?.2:1;
  WALKERS.forEach((w,k)=>{if(k/WALKERS.length>crowd)return;const sp=w.sp*.8;const t=w.t*ENT_PATH_LEN/RLEN+tt*sp;const side=k%3===0;const [x,y]=entPath(t,side),[ax,ay]=entPath(t+Math.sign(sp)*.2,side);const [u,v]=w2v(x,y),[au,av]=w2v(ax,ay);
    items.push({u,v,f:()=>{drawPerson(u,v,w.ch,au-u,av-v,true,tt*6*Math.abs(sp)+w.ph);if((S.weather||{}).k==='lluvia'){const [px,py]=P(u,v);emoji('☂️',px,py-58,13);}}});});
  // coches circulando
  CARS.forEach((c,k)=>{if(night>.8&&k>1)return;const sp=c.sp*.9;const len=N+6-ENT_STREET.far;let t=((c.t+tt*sp)%len+len)%len;const fw=sp>0;
    if(k%2===0){const x=ENT_STREET.far+t,y=fw?N+2.2:N+3.8;if(x>N+4.5)return;const [u,v]=w2v(x,y);items.push({u,v,f:()=>drawCar(u,v,c.c,w2v(x+(fw?1:-1),y),night)});}
    else{const y=ENT_STREET.far+t,x=fw?N+3.8:N+2.2;if(y>N+4.5)return;const [u,v]=w2v(x,y);items.push({u,v,f:()=>drawCar(u,v,c.c,w2v(x,y+(fw?1:-1)),night)});}});
  // la vecina en su puerta los fines de semana por la mañana
  const vz=P_('vecina');if(vz&&h>9.5&&h<13&&dayType(S.day)!=='work'){const [u,v]=w2v(-6,9.6);items.push({u,v,f:()=>drawPerson(u,v,vz.ch||{...WALKERS[2].ch,hair:'#bdbdbd',style:'mono',g:'f',beard:'no'},0,1,false,1)});}
  // gato
  if(hash((S.day||1)*3)<.6){const t=(tt*.15)%1;const [u,v]=w2v(-4+t*3,N+.9);items.push({u,v,f:()=>{const [px,py]=P(u,v);emoji('🐈‍⬛',px,py-6,11);}});}
  // autobús parado de vez en cuando
  if(Math.floor(h*6)%7===0&&h>6&&h<23){const [u,v]=w2v(N/2+4,N+3.8);items.push({u,v,f:()=>{const [u0,v0,u1,v1]=vrect([N/2+2.5,N+3.4,N/2+5.5,N+4.2]);prism(u0,v0,u1,v1,0,16,'#2a6fdb');for(let k=0;k<4;k++){const a=u0+.3+k*.7;poly([P(a,v1,7),P(a+.5,v1,7),P(a+.5,v1,13),P(a,v1,13)],'#cfe3ef');}}});}
  return items;}
