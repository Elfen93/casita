// ---------- pelo ----------
// genera mechones como curvas cúbicas y los pinta en capas (oscuro→claro) para dar volumen
function strandsDraw(x,list,h,R,opt={}){const base=opt.base||1;
  const layers=[[.55,1.6,.9],[.8,.9,.8],[1,.55,.75],[1.25,.32,.6],[1.6,.18,.55]];
  for(const [lf,lw,al] of layers){for(const s of list){if(opt.skipLight&&lf>1.2&&R()<.5)continue;const j=(R()-.5)*.25;x.strokeStyle=mul(h,(lf+j)*base*(s.k||1),al);x.lineWidth=lw*(s.w||1);x.lineCap='round';x.beginPath();x.moveTo(s.p[0],s.p[1]);x.bezierCurveTo(s.p[2],s.p[3],s.p[4],s.p[5],s.p[6],s.p[7]);x.stroke();}}}
function sheen(x,g,h,y,band){const sg=x.createLinearGradient(0,y-band,0,y+band);sg.addColorStop(0,mul(h,1.6,0));sg.addColorStop(.5,mul(h,1.9,.32));sg.addColorStop(1,mul(h,1.6,0));return sg;}


// ================= pelo afro / texturizado =================
const AFRO={fade:1,hightop:1,twa:1,boxbraids:1,cornrows:1,locs:1,puffs:1,bantu:1,twists:1};
function coil(x,h,R,px,py,base=1,r0=.55,r1=1.1){const r=r0+R()*(r1-r0);const a0=R()*6.28;x.strokeStyle=mul(h,(.5+R()*1.0)*base,.9);x.lineWidth=.32+R()*.25;x.beginPath();x.arc(px,py,r,a0,a0+3.4+R()*2);x.stroke();}
function skull(g,lift=0){return {cx:g.cx,cy:g.top+13,rx:g.fw+1.4,ry:13+lift};}
// casquete con perfilado nítido (line-up)
function lineupPath(g,hl,sideY,lift=0,flat=0){const S=skull(g,lift),cx=g.cx;const P=new Path2D();
  P.moveTo(cx-g.fw-.9,sideY);P.lineTo(cx-S.rx,S.cy);
  if(flat){P.lineTo(cx-S.rx,S.cy-S.ry);P.lineTo(cx+S.rx,S.cy-S.ry);}else P.ellipse(cx,S.cy,S.rx,S.ry,0,Math.PI,2*Math.PI);
  P.lineTo(cx+g.fw+.9,sideY);P.lineTo(cx+g.fw-.6,hl+5.5);P.lineTo(cx+g.fw-2.6,hl+1);P.quadraticCurveTo(cx,hl-.3,cx-g.fw+2.6,hl+1);P.lineTo(cx-g.fw+.6,hl+5.5);P.closePath();return P;}
function texFill(x,P,h,R,n,box,opt={}){x.save();x.clip(P);const [x0,y0,w,hh]=box;
  const bg=x.createLinearGradient(0,y0,0,y0+hh);bg.addColorStop(0,mul(h,opt.top||1.05));bg.addColorStop(1,mul(h,.65));x.fillStyle=bg;x.fill(P);
  for(let i=0;i<n;i++){const px=x0+R()*w,py=y0+R()*hh;if(opt.fade){const f=opt.fade(px,py);if(R()>f)continue;}coil(x,h,R,px,py,1,opt.r0||.45,opt.r1||.95);}
  if(opt.sheen){const sg=x.createRadialGradient(g_cx(box)-4,y0+3,.5,g_cx(box)-4,y0+3,9);sg.addColorStop(0,mul(h,2.2,.22));sg.addColorStop(1,mul(h,2,0));x.fillStyle=sg;x.fillRect(x0,y0,w,hh);}
  x.restore();}
const g_cx=b=>b[0]+b[2]/2;
// degradado: puntitos cada vez más escasos hacia abajo en los laterales
function fadeSides(x,g,h,R,yTop,yBot,dens=1){const cx=g.cx;for(const sd of [-1,1])for(let i=0;i<600*dens;i++){const t=R();const py=yTop+t*(yBot-yTop);if(R()<t*1.05)continue;const px=cx+sd*(g.fw-R()*3.2+.6);x.fillStyle=mul(h,.8+R()*.5,.55+R()*.4);x.fillRect(px,py,.28,.28);}
  // sombra azulada del degradado
  for(const sd of [-1,1]){const fg=x.createLinearGradient(0,yTop,0,yBot);fg.addColorStop(0,mul(h,1,.75));fg.addColorStop(1,mul(h,1,0));x.fillStyle=fg;x.beginPath();x.moveTo(cx+sd*(g.fw+.9),yTop);x.lineTo(cx+sd*(g.fw-3.2),yTop);x.lineTo(cx+sd*(g.fw-2.2),yBot);x.lineTo(cx+sd*(g.fw+.4),yBot);x.fill();}}
// trenza: cadena de eslabones inclinados alternos
function braidAlong(x,pts,w,h,R,bead){const seg=[];for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1];const d=Math.hypot(bx-ax,by-ay);const k=Math.max(1,Math.round(d/(w*.62)));for(let j=0;j<k;j++)seg.push([ax+(bx-ax)*j/k,ay+(by-ay)*j/k,Math.atan2(by-ay,bx-ax)]);}
  seg.forEach(([px,py,a],i)=>{const tilt=(i%2?.55:-.55);const gr=x.createRadialGradient(px-w*.2,py-w*.2,.1,px,py,w*.7);gr.addColorStop(0,mul(h,1.45));gr.addColorStop(.6,mul(h,.95));gr.addColorStop(1,mul(h,.55));x.fillStyle=gr;x.beginPath();x.ellipse(px,py,w*.62,w*.42,a+Math.PI/2+tilt,0,7);x.fill();});
  if(bead){const l=pts[pts.length-1];E(x,l[0],l[1]+.6,w*.45,w*.55,bead);}}
function locAlong(x,pts,w,h,R){x.lineCap='round';x.lineJoin='round';for(const [lw,f,al] of [[w,.6,1],[w*.75,.95,1],[w*.35,1.4,.7]]){x.strokeStyle=mul(h,f,al);x.lineWidth=lw;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();}
  x.strokeStyle=mul(h,.45,.6);x.lineWidth=.22;for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1];const d=Math.hypot(bx-ax,by-ay);for(let t=0;t<d;t+=1.1){const px=ax+(bx-ax)*t/d,py=ay+(by-ay)*t/d;x.beginPath();x.moveTo(px-w*.45,py-.4);x.lineTo(px+w*.45,py+.5);x.stroke();}}}
// mechones colgantes (trenzas/locs) desde el cráneo
function hanging(g,R,n,len,spread,front){const out=[];const cx=g.cx;for(let i=0;i<n;i++){const sd=front?(i%2?1:-1):(R()<.5?-1:1);const a=front?.62+R()*.38:R();
  const rx=cx+sd*(g.fw*.4+a*g.fw*.75),ry=g.top+3+a*12;const ox=cx+sd*(g.fw+1+R()*spread);const ty=len-R()*5;
  const pts=[[rx,ry]];for(let t=1;t<=8;t++){const u=t/8;pts.push([rx+(ox-rx)*Math.min(1,u*2.2)+sd*Math.sin(u*3)*.6+(R()-.5)*.4,ry+(ty-ry)*u]);}out.push(pts);}return out;}

function afroBack(x,c,g){const st=c.hairStyle,h=c.hair,R=rng(hash(h+st+'ab'));const cx=g.cx;
  if(st==='boxbraids'||st==='locs'||st==='twists'){const len=st==='boxbraids'?97:st==='locs'?g.chinY+16:g.chinY+6;const w=st==='boxbraids'?1.9:st==='locs'?2.5:2.1;
    x.fillStyle=mul(h,.4);x.beginPath();x.ellipse(cx,g.top+14,g.fw+3,14,0,0,7);x.fill();
    const L=hanging(g,R,st==='boxbraids'?56:30,len,7,false);L.sort((a,b)=>a[0][1]-b[0][1]);
    for(const pts of L){st==='boxbraids'?braidAlong(x,pts,w,h,R):st==='locs'?locAlong(x,pts,w,h,R):twistAlong(x,pts,w,h,R);}}
  if(st==='puffs'){for(const sd of [-1,1]){const px=cx+sd*(g.fw*.95),py=g.top+1;const r=8.5;const pg=x.createRadialGradient(px-2,py-2,1,px,py,r);pg.addColorStop(0,mul(h,1.2));pg.addColorStop(1,mul(h,.55));x.fillStyle=pg;x.beginPath();x.arc(px,py,r,0,7);x.fill();
      for(let i=0;i<260;i++){const a=R()*6.28,rr=Math.sqrt(R())*r;coil(x,h,R,px+Math.cos(a)*rr,py+Math.sin(a)*rr);}}}
}
function twistAlong(x,pts,w,h,R){for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1];const d=Math.hypot(bx-ax,by-ay);for(let t=0;t<d;t+=w*.55){const px=ax+(bx-ax)*t/d,py=ay+(by-ay)*t/d;const k=Math.round(t/(w*.55))%2;x.fillStyle=mul(h,k?1.15:.7);x.beginPath();x.ellipse(px+(k?.35:-.35)*w*.4,py,w*.45,w*.5,k?.6:-.6,0,7);x.fill();}}}

function afroFront(x,c,g){const st=c.hairStyle,h=c.hair,s=c.skin,R=rng(hash(h+st+'af'));const cx=g.cx;const hl=g.eyeY-19;const S=skull(g);
  const sideY=g.eyeY+1;
  if(st==='fade'||st==='twa'){const lift=st==='twa'?3.4:2.2;const P=lineupPath(g,hl,sideY,lift);
    texFill(x,P,h,R,st==='twa'?900:700,[cx-g.fw-2,g.top-lift-1,g.fw*2+4,sideY-g.top+lift],{fade:st==='fade'?(px,py)=>{const d=Math.abs(px-cx)/g.fw;return d<.7||py<g.top+6?1:Math.max(.08,1-(py-(g.top+6))/18);}:null,r0:.4,r1:.8});
    if(st==='fade'){x.save();x.clip(P);for(const sd of [-1,1]){const fg=x.createLinearGradient(cx+sd*(g.fw*.6),0,cx+sd*(g.fw+1),0);fg.addColorStop(0,mul(s,1,0));fg.addColorStop(1,mul(s,.95,.55));const vg=x.createLinearGradient(0,g.top+4,0,sideY);x.fillStyle=fg;x.fillRect(sd<0?cx-g.fw-2:cx+g.fw*.6,g.top+8,g.fw*.4+2,sideY-g.top);}x.restore();fadeSides(x,g,h,R,g.top+10,sideY,.8);}
    x.strokeStyle=mul(h,.5,.9);x.lineWidth=.35;x.stroke(P);return;}
  if(st==='hightop'){const H=15;const P=new Path2D();const w0=g.fw-1.2,w1=g.fw+.6;
    P.moveTo(cx-g.fw-.9,sideY-5);P.lineTo(cx-w0,g.top+6);P.lineTo(cx-w1,g.top-H+1.5);P.quadraticCurveTo(cx-w1,g.top-H,cx-w1+1.6,g.top-H);P.lineTo(cx+w1-1.6,g.top-H);P.quadraticCurveTo(cx+w1,g.top-H,cx+w1,g.top-H+1.5);P.lineTo(cx+w0,g.top+6);P.lineTo(cx+g.fw+.9,sideY-5);
    P.lineTo(cx+g.fw-.6,hl+5.5);P.lineTo(cx+g.fw-2.6,hl+1);P.quadraticCurveTo(cx,hl-.3,cx-g.fw+2.6,hl+1);P.lineTo(cx-g.fw+.6,hl+5.5);P.closePath();
    texFill(x,P,h,R,1500,[cx-w1-1,g.top-H-1,w1*2+2,sideY-g.top+H],{r0:.45,r1:.95});
    x.save();x.clip(P);const tg=x.createLinearGradient(0,g.top-H,0,g.top-H+4);tg.addColorStop(0,mul(h,2,.35));tg.addColorStop(1,mul(h,2,0));x.fillStyle=tg;x.fillRect(0,0,100,100);
    const sg=x.createLinearGradient(cx-w1,0,cx+w1,0);sg.addColorStop(0,'rgba(0,0,0,.25)');sg.addColorStop(.3,'rgba(0,0,0,0)');sg.addColorStop(.75,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=sg;x.fillRect(0,0,100,100);x.restore();
    fadeSides(x,g,h,R,g.top+8,sideY,1);x.strokeStyle=mul(h,.45,.8);x.lineWidth=.35;x.stroke(P);return;}
  if(st==='cornrows'||st==='boxbraids'||st==='bantu'||st==='puffs'||st==='locs'||st==='twists'){
    // base pegada al cráneo
    const P=lineupPath(g,hl+.6,sideY,.8);x.save();x.clip(P);x.fillStyle=mix(h,s,.35);x.fill(P);x.restore();
    if(st==='cornrows'){const rows=9;for(let i=0;i<rows;i++){const t=(i/(rows-1))*2-1;const sx=cx+t*(g.fw-2.2),sy=hl+1.2+t*t*4.4;const ex=cx+t*g.fw*.55,ey=g.top-1.2+t*t*2.6;const pts=[];for(let k=0;k<=10;k++){const u=k/10;const bow=Math.sin(u*Math.PI)*t*2.2;pts.push([sx+(ex-sx)*u+bow,sy+(ey-sy)*u]);}braidAlong(x,pts,2.1,h,R);}
      // trenzas que caen por detrás de las orejas
      for(const sd of [-1,1])for(let k=0;k<3;k++){const px=cx+sd*(g.fw+.6+k*1.2);braidAlong(x,[[px,g.eyeY-6],[px+sd*.6,g.eyeY+8],[px+sd*1.2,g.chinY+4+k*3]],2,h,R);}return;}
    if(st==='bantu'){x.save();x.clip(P);x.strokeStyle=mul(s,.85,.7);x.lineWidth=.4;x.beginPath();x.moveTo(cx,hl);x.lineTo(cx,g.top-3);x.moveTo(cx-g.fw,g.top+10);x.lineTo(cx+g.fw,g.top+10);x.stroke();x.restore();
      const K=[[-1.15,.98],[-.55,1],[0,1.02],[.55,1],[1.15,.98],[-.5,.5],[.5,.5]];for(const [ph,k] of K){const px=cx+Math.sin(ph)*S.rx*k,py=S.cy-Math.cos(ph)*S.ry*k*(k<.7?1.5:1)-(k<.7?-1:0);const r=3.3;const kg=x.createRadialGradient(px-1,py-1,.3,px,py,r);kg.addColorStop(0,mul(h,1.5));kg.addColorStop(1,mul(h,.55));x.fillStyle=kg;x.beginPath();x.arc(px,py,r,0,7);x.fill();
        x.strokeStyle=mul(h,.4,.8);x.lineWidth=.35;x.beginPath();for(let a=0;a<9;a+=.25){const rr=r*(1-a/9.5);x.lineTo(px+Math.cos(a)*rr,py+Math.sin(a)*rr);}x.stroke();}return;}
    if(st==='puffs'){x.save();x.clip(P);x.strokeStyle=mul(h,1.5,.35);x.lineWidth=.25;for(let i=0;i<60;i++){const t=R()*2-1;const sx=cx+t*(g.fw-1),sy=hl+1+t*t*4;x.beginPath();x.moveTo(sx,sy);x.quadraticCurveTo(sx+t*2,sy-6,cx+(t<0?-1:1)*g.fw*.95,g.top+1);x.stroke();}x.restore();
      for(const sd of [-1,1])E(x,cx+sd*(g.fw*.8),g.top+4.4,2.2,1.2,c.tie||'#e76f51',sd*.6);return;}
    // boxbraids / locs / twists: partes en cuadrícula + mechones delanteros que caen
    x.save();x.clip(P);x.strokeStyle=mul(s,.9,.5);x.lineWidth=.3;x.beginPath();for(let i=-3;i<=3;i++){x.moveTo(cx+i*g.fw*.28,hl);x.lineTo(cx+i*g.fw*.2,g.top-3);}for(let j=0;j<3;j++){x.moveTo(cx-g.fw,hl-1-j*5);x.quadraticCurveTo(cx,hl-4-j*5,cx+g.fw,hl-1-j*5);}x.stroke();x.restore();
    const w=st==='boxbraids'?1.9:st==='locs'?2.5:2.1;
    // filas desde la frente hacia atrás (vistas desde delante)
    for(let i=0;i<7;i++){const t=(i/6)*2-1;const sx=cx+t*(g.fw-2.4),sy=hl+1.6+t*t*3.6;const ex=cx+t*g.fw*1.02+(t<0?-1.2:1.2),ey=g.top+4+Math.abs(t)*2;const pts=[[sx,sy],[sx+(ex-sx)*.5+t*1.5,(sy+ey)/2-2],[ex,ey]];
      st==='boxbraids'?braidAlong(x,pts,w,h,R):st==='locs'?locAlong(x,pts,w,h,R):twistAlong(x,pts,w,h,R);}
    const len=st==='boxbraids'?97:st==='locs'?g.chinY+16:g.chinY+6;
    const L=hanging(g,R,st==='boxbraids'?20:12,len,4.5,true);for(const pts of L){st==='boxbraids'?braidAlong(x,pts,w,h,R,R()<.3?(c.bead||'#e9c46a'):null):st==='locs'?locAlong(x,pts,w,h,R):twistAlong(x,pts,w,h,R);}
    return;}
}
function hairBack(x,c,g){const st=c.hairStyle,h=c.hair,cx=g.cx,R=rng(hash(c.hair+st+'b'));if(AFRO[st])return afroBack(x,c,g);
  const long={bob:g.chinY,melena:g.chinY+6,larga:96,ondas:94,rizos:g.chinY+10}[st];
  if(long){const L=[];const n=st==='larga'||st==='ondas'?150:110;
    // masa base
    const mg=x.createLinearGradient(0,g.top,0,long);mg.addColorStop(0,mul(h,.7));mg.addColorStop(1,mul(h,.45));x.fillStyle=mg;
    const sp=st==='rizos'?8:4;x.beginPath();x.moveTo(cx-g.fw-1,30);x.bezierCurveTo(cx-g.fw-sp-2,50,cx-g.fw-sp-3,long-10,cx-g.fw-sp+1,long);x.quadraticCurveTo(cx,long+4,cx+g.fw+sp-1,long);x.bezierCurveTo(cx+g.fw+sp+3,long-10,cx+g.fw+sp+2,50,cx+g.fw+1,30);x.bezierCurveTo(cx+g.fw,12,cx-g.fw,12,cx-g.fw-1,30);x.fill();
    for(let i=0;i<n;i++){const sd=R()<.5?-1:1;const ox=cx+sd*(g.fw-2+R()*(sp+3));const ty=long-R()*6;const wav=st==='ondas'?3:0;
      L.push({p:[cx+sd*(g.fw*.6),g.top+4,ox+sd*3,g.eyeY,ox-sd*wav+sd*(R()*2),(g.eyeY+ty)/2+6,ox+sd*(R()*2-1)+wav*sd,ty],w:.8+R()*.6,k:.8+R()*.3});}
    if(st!=='rizos')strandsDraw(x,L,h,R,{base:.85});else curls(x,c,g,R,cx,g.top+6,g.fw+sp+2,long,.8);}
  if(st==='afro'){const r=g.fw+11;const ag=x.createRadialGradient(cx-6,g.top+4,3,cx,g.top+12,r+6);ag.addColorStop(0,mul(h,1.15));ag.addColorStop(1,mul(h,.55));x.fillStyle=ag;x.beginPath();x.ellipse(cx,g.top+14,r,r*.92,0,0,7);x.fill();
    curls(x,c,g,R,cx,g.top+14,r,0,1,true);}
  if(st==='coleta'){const mg=x.createLinearGradient(0,30,0,80);mg.addColorStop(0,mul(h,.9));mg.addColorStop(1,mul(h,.55));x.fillStyle=mg;const px=cx+g.fw-2;
    x.beginPath();x.moveTo(px,28);x.bezierCurveTo(px+12,34,px+12,58,px+5,78);x.bezierCurveTo(px+3,62,px+2,46,px-3,34);x.fill();
    const L=[];for(let i=0;i<60;i++)L.push({p:[px-1+R()*2,30+R()*3,px+10+R()*3,40+R()*4,px+8+R()*3,58,px+3+R()*4,72+R()*6],w:.7,k:.8+R()*.3});strandsDraw(x,L,h,R);
    E(x,px,30,2.4,2.4,c.tie||'#d1495b');}
  if(st==='trenzas'){for(const sd of [-1,1]){const px=cx+sd*(g.fw+1);for(let i=0;i<9;i++){const yy=g.eyeY+2+i*4.4;const eg=x.createRadialGradient(px-1,yy-1,.4,px,yy,3);eg.addColorStop(0,mul(h,1.35));eg.addColorStop(1,mul(h,.6));x.fillStyle=eg;x.beginPath();x.ellipse(px+(i%2?.6:-.6)*sd,yy,2.6-i*.08,2.4,(i%2?.5:-.5),0,7);x.fill();}E(x,px,g.eyeY+43,1.4,1.2,c.tie||'#e9c46a');}}
}
function curls(x,c,g,R,cx,cy,rx,yb,base,afro){const h=c.hair;const n=afro?520:420;
  for(let i=0;i<n;i++){let px,py;if(afro){const a=R()*6.283,rr=Math.sqrt(R())*rx;px=cx+Math.cos(a)*rr;py=cy+Math.sin(a)*rr*.92;if(py>g.eyeY-3&&Math.abs(px-cx)<g.fw)continue;}
    else{const sd=R()<.5?-1:1;px=cx+sd*(g.fw-3+R()*(rx-g.fw+3));py=cy+R()*(yb-cy);}
    const r=.9+R()*1.3;const lf=.55+R()*.95;x.strokeStyle=mul(h,lf*base,.85);x.lineWidth=.45+R()*.35;x.beginPath();const a0=R()*6.28;x.arc(px,py,r,a0,a0+3.6+R()*1.5);x.stroke();}}

function hairFront(x,c,g){const st=c.hairStyle,h=c.hair,cx=g.cx,R=rng(hash(c.hair+st+'f'));if(AFRO[st])return afroFront(x,c,g);const top=g.top-1.5;
  if(st==='calvo'||st==='rapado'){
    if(st==='rapado'){x.save();facePath(x,g);x.clip();x.fillStyle=mul(h,1,.55);x.beginPath();x.moveTo(cx-g.fw-1,g.eyeY);x.lineTo(cx-g.fw+1,32);x.quadraticCurveTo(cx-6,27.5,cx,28.6);x.quadraticCurveTo(cx+6,27.5,cx+g.fw-1,32);x.lineTo(cx+g.fw+1,g.eyeY);x.lineTo(cx+g.fw+2,0);x.lineTo(cx-g.fw-2,0);x.fill();
      for(let i=0;i<500;i++){const px=cx+(R()-.5)*g.fw*2.1,py=g.top-2+R()*(14);x.fillStyle=mul(h,.7,.6);x.fillRect(px,py,.28,.28);}x.restore();}
    else{x.save();facePath(x,g);x.clip();for(const sd of [-1,1]){const gg=x.createLinearGradient(cx+sd*g.fw,0,cx+sd*(g.fw-4),0);gg.addColorStop(0,mul(h,1,.55));gg.addColorStop(1,mul(h,1,0));x.fillStyle=gg;x.beginPath();x.ellipse(cx+sd*(g.fw-.5),g.eyeY-4,3.2,9,0,0,7);x.fill();for(let i=0;i<120;i++){const yy=g.eyeY-12+R()*16;x.strokeStyle=mul(h,.8+R()*.5,.6);x.lineWidth=.2;x.beginPath();const xx=cx+sd*(g.fw-R()*2.4);x.moveTo(xx,yy);x.lineTo(xx+sd*.5,yy+1.2);x.stroke();}}
      E(x,cx-4,g.top+5,7,3,'rgba(255,255,255,.28)',-.2);x.restore();}
    return;}
  if(st==='afro'||st==='rizos'){const r=st==='afro'?g.fw+3:g.fw+2;x.save();x.beginPath();x.ellipse(cx,g.top+6,r+2,13,0,0,7);x.rect(cx-r-6,g.top-14,2*r+12,20);x.clip();
    const ag=x.createLinearGradient(0,g.top-10,0,g.top+16);ag.addColorStop(0,mul(h,1));ag.addColorStop(1,mul(h,.7));x.fillStyle=ag;x.beginPath();x.moveTo(cx-g.fw-1,g.eyeY-6);x.bezierCurveTo(cx-g.fw-4,top-12,cx+g.fw+4,top-12,cx+g.fw+1,g.eyeY-6);x.quadraticCurveTo(cx+g.fw-3,30,cx,30.5);x.quadraticCurveTo(cx-g.fw+3,30,cx-g.fw-1,g.eyeY-6);x.fill();
    x.restore();const R2=rng(hash(h+'cf'));for(let i=0;i<260;i++){const t=R2()*2-1;const px=cx+t*(g.fw+1),py=g.top-6+R2()*(10)+Math.abs(t)*Math.abs(t)*12;const r2=.9+R2()*1.2;x.strokeStyle=mul(h,.55+R2()*1.0,.9);x.lineWidth=.5;x.beginPath();const a0=R2()*6.3;x.arc(px,py,r2,a0,a0+4);x.stroke();}return;}
  // pelo liso: casquete + mechones desde la raya
  const part=c.raya==='centro'?0:c.raya==='der'?4:-4;const px=cx+part;
  const fr=st==='flequillo'||st==='bob';
  const hl=g.eyeY-(fr?6:st==='tupe'?20.5:st==='mono'||st==='coleta'||st==='trenzas'?20:19);
  // casquete
  const cg=x.createLinearGradient(0,top-8,0,g.eyeY);cg.addColorStop(0,mul(h,.95));cg.addColorStop(1,mul(h,.7));x.fillStyle=cg;
  const sides=st==='corto'||st==='tupe'||st==='coleta'||st==='mono'?g.eyeY-2:g.eyeY+6;
  const vol=st==='tupe'?6:st==='corto'?2.5:3.5;
  const SK={cx,cy:g.top+13,rx:g.fw+1.8,ry:13+vol};
  x.beginPath();x.moveTo(cx-g.fw-1.4,sides);x.lineTo(cx-SK.rx,SK.cy);x.ellipse(cx,SK.cy,SK.rx,SK.ry,0,Math.PI,2*Math.PI);x.lineTo(cx+g.fw+1.4,sides);
  if(fr){x.lineTo(cx+g.fw-1,hl+2);x.bezierCurveTo(cx+g.fw-5,hl+1,cx+4,hl+1.6,cx,hl+.6);x.bezierCurveTo(cx-4,hl+1.6,cx-g.fw+5,hl+1,cx-g.fw+1,hl+2);}
  else{x.lineTo(cx+g.fw-1,hl+7);x.bezierCurveTo(cx+g.fw-3,hl+1,px+5,hl+.6,px,hl+.2);x.bezierCurveTo(px-5,hl+.6,cx-g.fw+3,hl+1,cx-g.fw+1,hl+7);}
  x.closePath();x.fill();
  // mechones
  const L=[];const n=st==='corto'||st==='tupe'?150:200;
  const ep=(phi,k=1)=>[cx+Math.sin(phi)*SK.rx*k,SK.cy-Math.cos(phi)*SK.ry*k];
  const hairY=xx=>{// línea del nacimiento del pelo aprox.
    const d=Math.abs(xx-cx)/g.fw;return fr?hl+1+d*1.5:hl+d*d*7+(xx<px?(part<0?0:1):(part>0?0:1));};
  for(let i=0;i<n;i++){const t=R()*2-1,sd=t<0?-1:1,a=Math.abs(t);
    const sx=px+(R()-.5)*1.6,sy=SK.cy-SK.ry+.8+R()*1.2;
    let ex,ey;
    if(a>.72){ex=cx+sd*(SK.rx-.6-R()*.8);ey=sides-1-R()*4;}
    else{ex=cx+t/.72*(g.fw-1.5);ey=hairY(ex)+R()*1.2;if(st==='tupe'){ey-=1;}}
    const w=Math.min(1,Math.max(0,(a-.25)/.6));
    const phiS=Math.asin(Math.max(-1,Math.min(1,(sx-cx)/SK.rx))),phiE=sd*(.5+a*1.1);
    const o1=ep(phiS+(phiE-phiS)*.35,1.0),o2=ep(phiS+(phiE-phiS)*.75,.99);
    const s1=[sx+(ex-sx)*.25,sy+(ey-sy)*.35],s2=[sx+(ex-sx)*.7+sd*.8,sy+(ey-sy)*.7];
    const c1=[s1[0]+(o1[0]-s1[0])*w,s1[1]+(o1[1]-s1[1])*w],c2=[s2[0]+(o2[0]-s2[0])*w,s2[1]+(o2[1]-s2[1])*w];
    L.push({p:[sx,sy,c1[0],c1[1],c2[0],c2[1],ex,ey],w:.8+R()*.4,k:.85+R()*.3});}
  // mechón barrido desde la raya hacia la sien opuesta (da dirección y vida)
  if(!fr&&part!==0&&st!=='mono'&&st!=='coleta'&&st!=='trenzas'){const sd=part<0?1:-1;const sw=st==='corto'||st==='tupe'?.6:1;
    for(let i=0;i<60;i++){const sx=px+(R()-.5)*1.2,sy=SK.cy-SK.ry+1+R();const ex=cx+sd*(g.fw-.5-R()*2),ey=hl+3+R()*4*sw+(st==='corto'?-2:0);
      L.push({p:[sx,sy,sx+sd*3,hl-3+R()*2,cx+sd*(g.fw*.45),hl+1.5*sw+R()*2,ex,ey],w:.9+R()*.4,k:.9+R()*.35});}}
  // pelitos sueltos en el nacimiento
  const W=[];if(!fr)for(let i=0;i<40;i++){const t=R()*2-1;const ex=cx+t*(g.fw-1.5);const ey=hairY(ex);W.push({p:[ex,ey-1.5,ex+(R()-.5),ey-.5,ex+(R()-.5),ey+.3,ex+(R()-.5)*1.2,ey+.6+R()*.6],w:.35,k:1});}
  strandsDraw(x,W,h,R,{base:.9});strandsDraw(x,L,h,R);
  // brillo
  x.save();x.beginPath();x.ellipse(cx,SK.cy,SK.rx+.5,SK.ry+.5,0,0,7);x.clip();
  x.fillStyle=sheen(x,g,h,SK.cy-SK.ry+5,3.2);x.fillRect(0,0,100,100);x.restore();
  // pelo de los lados (melena/larga caen delante de los hombros)
  if(st==='melena'||st==='larga'||st==='ondas'||st==='bob'){const yb={melena:g.chinY+5,larga:94,ondas:92,bob:g.chinY-1}[st];const L2=[];const w=st==='ondas'?2.4:0;
    for(let i=0;i<120;i++){const sd=R()<(part<0?.4:.5)?-1:1;const ox=cx+sd*(g.fw+.6+R()*2.4);const tx=cx+sd*(g.fw+2+R()*4)+(st==='bob'?-sd*1:0);
      L2.push({p:[cx+sd*(g.fw-.5),hl+3,ox+sd*.8,g.eyeY+6,tx-sd*w+sd*R(),yb-12,tx+sd*w*(R()-.2),yb-R()*4],w:.9+R()*.4,k:.85+R()*.3});}
    strandsDraw(x,L2,h,R);}
  if(st==='mono'){const by=top-6;const eg=x.createRadialGradient(cx-2,by-2,.5,cx,by,6);eg.addColorStop(0,mul(h,1.3));eg.addColorStop(1,mul(h,.6));x.fillStyle=eg;x.beginPath();x.ellipse(cx,by,6.4,5,0,0,7);x.fill();
    x.strokeStyle=mul(h,1.4,.5);x.lineWidth=.4;for(let i=0;i<10;i++){x.beginPath();x.arc(cx,by,1.5+i*.45,-2.6+i*.2,-.4+i*.2);x.stroke();}}
}

function glasses(x,c,g){if(!c.glasses)return;const t=c.glasses===true?'pasta':c.glasses;const y=g.eyeY+.2,dx=g.eyeDX,w=t==='redondas'?5.4:6.2,h=t==='redondas'?5.4:4.4;
  x.save();x.fillStyle='rgba(200,220,240,.12)';x.strokeStyle=t==='metal'?'#a68b5b':'#1d1a1f';x.lineWidth=t==='metal'?.5:1.2;
  for(const sd of [-1,1]){x.beginPath();if(t==='redondas')x.ellipse(g.cx+sd*dx,y,w,h,0,0,7);else x.roundRect(g.cx+sd*dx-w,y-h,w*2,h*2,2.4);x.fill();x.stroke();
    x.beginPath();x.moveTo(g.cx+sd*(dx+w),y-1);x.lineTo(g.cx+sd*(g.fw+.5),y-1.5);x.stroke();
    x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.45;x.beginPath();x.moveTo(g.cx+sd*dx-w*.55,y-h*.4);x.lineTo(g.cx+sd*dx-w*.15,y-h*.7);x.stroke();x.strokeStyle=t==='metal'?'#a68b5b':'#1d1a1f';x.lineWidth=t==='metal'?.5:1.2;}
  x.beginPath();x.moveTo(g.cx-dx+w,y-.6);x.quadraticCurveTo(g.cx,y-2.2,g.cx+dx-w,y-.6);x.stroke();x.restore();}

function draw(x,c){if(c.hairStyle==='media')c=Object.assign({},c,{hairStyle:'bob'});const g=geo(c);if(!c.nobg)back(x,c);x.save();x.translate(50,57);x.scale(1.24,1.24);x.translate(-50,-50);hairBack(x,c,g);body(x,c,g);ears(x,c,g);skin(x,c,g);eyes(x,c,g);brows(x,c,g);nose(x,c,g);mouth(x,c,g);beardLight(x,c,g);hairFront(x,c,g);glasses(x,c,g);if(c.of)ofPorHead(x,c,g);x.restore();
  if(!c.nobg){const v=x.createRadialGradient(50,48,35,50,50,75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(40,20,40,.18)');x.fillStyle=v;x.fillRect(0,0,100,100);}}
return {draw,DEF,FORMAS:Object.keys(FORMAS),OJOS:Object.keys(OJOS),CEJAS:Object.keys(CEJAS),NARIZ:Object.keys(NARIZ),BOCA:Object.keys(BOCA)};
})();

