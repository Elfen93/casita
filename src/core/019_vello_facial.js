// ---------- vello facial ----------
function beardPaths(g,kind){const cx=g.cx,fw=g.fw,jw=g.jw,cy=g.chinY,ny=g.noseY,my=g.mouthY,mw=g.mw,cw=g.cw;const p=new Path2D();
  const ext={larga:9,completa:3,corta:1.4}[kind]||1.4;
  const must=(P,thick)=>{P.moveTo(cx-mw-1.4,my+.6);P.bezierCurveTo(cx-mw-.6,ny+3.4,cx-4,ny+1.5,cx,ny+1.6);P.bezierCurveTo(cx+4,ny+1.5,cx+mw+.6,ny+3.4,cx+mw+1.4,my+.6);P.bezierCurveTo(cx+mw*.6,my-.6+thick,cx+2,my-1.6,cx,my-1.2);P.bezierCurveTo(cx-2,my-1.6,cx-mw*.6,my-.6+thick,cx-mw-1.4,my+.6);P.closePath();};
  if(kind==='completa'||kind==='corta'||kind==='larga'){const sb=g.eyeY+.5;
    p.moveTo(cx-fw*.99,sb);p.bezierCurveTo(cx-fw*1.02,sb+9,cx-jw-1.2,cy-12,cx-jw-.9,cy-7);
    p.bezierCurveTo(cx-jw*.8+(kind==='larga'?-1:0),cy-1+ext*.6,cx-cw-3,cy+ext,cx,cy+ext);
    p.bezierCurveTo(cx+cw+3,cy+ext,cx+jw*.8+(kind==='larga'?1:0),cy-1+ext*.6,cx+jw+.9,cy-7);
    p.bezierCurveTo(cx+jw+1.2,cy-12,cx+fw*1.02,sb+9,cx+fw*.99,sb);
    // línea de mejilla perfilada
    p.lineTo(cx+fw*.86,sb);p.bezierCurveTo(cx+fw*.8,sb+5,cx+fw*.66,ny,cx+fw*.5,ny+2.6);p.bezierCurveTo(cx+mw+3,ny+3.4,cx+mw+1,ny+1.6,cx+3,ny+1.3);
    p.quadraticCurveTo(cx,ny+1,cx-3,ny+1.3);p.bezierCurveTo(cx-mw-1,ny+1.6,cx-mw-3,ny+3.4,cx-fw*.5,ny+2.6);p.bezierCurveTo(cx-fw*.66,ny,cx-fw*.8,sb+5,cx-fw*.86,sb);p.closePath();
    p.ellipse(cx,my+.7,mw+.5,2.3,0,0,7);return p;}
  if(kind==='bigote'){must(p,1.2);return p;}
  if(kind==='perilla'||kind==='candado'){must(p,.6);const w=kind==='candado'?mw+1.6:3.6;
    const q=new Path2D();q.moveTo(cx-w,my+(kind==='candado'?.4:2.6));q.bezierCurveTo(cx-w-.4,cy-2,cx-w*.6,cy+1.6,cx,cy+1.8);q.bezierCurveTo(cx+w*.6,cy+1.6,cx+w+.4,cy-2,cx+w,my+(kind==='candado'?.4:2.6));
    q.quadraticCurveTo(cx,my+4.4,cx-w,my+(kind==='candado'?.4:2.6));p.addPath(q);return p;}
  return null;}
function beardLight(x,c,g){const b=c.beard;if(!b||b==='sombra')return;const h=c.age>58?mix(c.hair,'#cfcfcf',.55):c.hair;const R=rng(hash(h+b));const P=beardPaths(g,b);if(!P)return;
  const cx=g.cx;x.save();
  const bg=x.createLinearGradient(0,g.noseY,0,g.chinY+6);bg.addColorStop(0,mul(h,.95,b==='corta'?.8:.95));bg.addColorStop(1,mul(h,.7,b==='corta'?.88:1));x.fillStyle=bg;x.fill(P,'evenodd');
  x.clip(P,'evenodd');
  // textura: pelos cortos peinados hacia abajo y hacia la barbilla
  const n=b==='larga'?2200:b==='completa'?1600:b==='corta'?1300:500;const len=b==='corta'?.7:b==='larga'?2.2:1.3;
  for(let i=0;i<n;i++){const px=cx+(R()-.5)*g.fw*2.1,py=g.noseY+R()*(g.chinY+10-g.noseY);const dx=(px-cx)/g.fw;
    let ang=Math.PI/2-dx*.55;if(py<g.mouthY)ang=Math.PI/2+dx*.9;const L=len*(.7+R()*.6);
    x.strokeStyle=mul(h,.55+R()*1.05,.5+R()*.4);x.lineWidth=.18+R()*.16;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(ang)*L*.5+(R()-.5)*.3,py+Math.sin(ang)*L*.5,px+Math.cos(ang)*L,py+Math.sin(ang)*L);x.stroke();}
  // volumen: luz en barbilla, sombra en lados
  const hl=x.createRadialGradient(cx-2,g.chinY-1,.5,cx,g.chinY,9);hl.addColorStop(0,mul(h,1.8,.22));hl.addColorStop(1,mul(h,1.8,0));x.fillStyle=hl;x.fillRect(0,0,100,100);
  const sd=x.createLinearGradient(cx-g.fw,0,cx+g.fw,0);sd.addColorStop(0,'rgba(0,0,0,.08)');sd.addColorStop(.5,'rgba(0,0,0,0)');sd.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=sd;x.fillRect(0,0,100,100);
  x.restore();
  // borde inferior ligeramente suave (solo en barbas completas)
  if(b==='completa'||b==='larga'){x.lineWidth=.22;for(let i=0;i<70;i++){const t=R()*2-1;const px=cx+t*(g.jw+.5)*.95,py=(b==='larga'?g.chinY+7.5:g.chinY+2.2)-t*t*(b==='larga'?8:7);x.strokeStyle=mul(h,.6+R()*.6,.6);x.beginPath();x.moveTo(px,py-.8);x.lineTo(px-t*.4,py+.4+R()*.6);x.stroke();}}
}
const B_w=g=>5.6;

