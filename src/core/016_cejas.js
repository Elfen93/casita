// ---------- cejas ----------
const CEJAS={natural:[0,1.4,.2],arqueada:[.4,2.6,.6],recta:[0,.6,-.1],angulosa:[.2,2.2,1.4],fruncida:[-1.2,.9,.0]};
function brows(x,c,g){const f=g.f,B=CEJAS[f.cejas]||CEJAS.natural;const th=(.5+f.grosorCejas)*(g.fem?.8:1.15);
  let col=c.age>60?mix(c.hair,'#bbbbbb',.4):c.hair;if(c.browCol)col=c.browCol;const R=rng(hash(c.hair+f.cejas));
  const expY=f.expresion==='sorpresa'?-1.6:f.expresion==='enfado'?.9:0;
  for(const sd of [-1,1]){const by=g.eyeY-5.6+expY;const x0=g.cx+sd*2.6,x1=g.cx+sd*(g.eyeDX+5.8);
    const pt=t=>{const px=x0+(x1-x0)*t;const arch=Math.sin(Math.min(1,t/(.65+B[2]*.1))*Math.PI*.5)*(t<.7?1:1-(t-.7)*1.6)*B[1];const fr=(f.expresion==='enfado'?(1-t)*1.6:0);return [px,by-arch+B[0]*(1-t)+fr+(t>.7?(t-.7)*1.8:0)];};
    // base suave
    x.strokeStyle=mul(col,1,.35);x.lineWidth=th*1.7;x.lineCap='round';x.beginPath();for(let t=0;t<=1.001;t+=.05){const p=pt(t);t?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]);}x.stroke();
    // pelos
    x.strokeStyle=mul(col,.85,.85);x.lineWidth=.22;x.beginPath();
    for(let i=0;i<70;i++){const t=R();const p=pt(t);const thick=th*(1-t*.55);const oy=(R()-.5)*thick*1.6;const ang=(t<.25?-1.2:-.35)*sd;
      const L=.9+R()*.9;x.moveTo(p[0],p[1]+oy);x.lineTo(p[0]+Math.cos(ang)*L*sd*(t<.25?.4:1),p[1]+oy+Math.sin(ang)*L*.5*sd*sd*(t<.25?1.4:.6)*-1);}
    x.stroke();}}

