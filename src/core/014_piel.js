// ---------- piel ----------
function skin(x,c,g){const s=c.skin,f=g.f;
  facePath(x,g);x.fillStyle=s;x.fill();
  x.save();facePath(x,g);x.clip();
  // luz principal arriba-izquierda
  let r=x.createRadialGradient(g.cx-6,g.eyeY-8,2,g.cx,g.eyeY,30);r.addColorStop(0,mul(s,1.12,.9));r.addColorStop(.5,mul(s,1.0,0));r.addColorStop(1,mul(s,.75,.7));x.fillStyle=r;x.fillRect(0,0,100,100);
  // lado en sombra (derecha)
  let l=x.createLinearGradient(g.cx+g.fw*.3,0,g.cx+g.fw,0);l.addColorStop(0,mul(s,.8,0));l.addColorStop(1,mul(s,.72,.55));x.fillStyle=l;x.fillRect(0,0,100,100);
  // pómulos: sombra bajo el pómulo
  const pm=.25+f.pomulos*.5;
  for(const sd of [-1,1]){const gg=x.createRadialGradient(g.cx+sd*g.fw*.78,g.eyeY+12,1,g.cx+sd*g.fw*.78,g.eyeY+12,8);gg.addColorStop(0,mul(s,.7,.35*pm));gg.addColorStop(1,mul(s,.7,0));x.fillStyle=gg;x.fillRect(0,0,100,100);
    // brillo en pómulo
    const hh=x.createRadialGradient(g.cx+sd*g.fw*.55,g.eyeY+5.5,.5,g.cx+sd*g.fw*.55,g.eyeY+5.5,5);hh.addColorStop(0,mul(s,1.15,.35*pm*(sd<0?1:.5)));hh.addColorStop(1,mul(s,1.15,0));x.fillStyle=hh;x.fillRect(0,0,100,100);
    // rubor
    const bl=x.createRadialGradient(g.cx+sd*g.fw*.55,g.eyeY+9,.5,g.cx+sd*g.fw*.55,g.eyeY+9,6);bl.addColorStop(0,`rgba(214,96,86,${c.makeup?.22:.13})`);bl.addColorStop(1,'rgba(214,96,86,0)');x.fillStyle=bl;x.fillRect(0,0,100,100);
    // cuencas de los ojos
    const ey=x.createRadialGradient(g.cx+sd*g.eyeDX,g.eyeY-1,1,g.cx+sd*g.eyeDX,g.eyeY-1,7);ey.addColorStop(0,mul(s,.72,.28));ey.addColorStop(1,mul(s,.72,0));x.fillStyle=ey;x.fillRect(0,0,100,100);}
  // sombra de mandíbula y bajo barbilla
  let jg=x.createLinearGradient(0,g.chinY-9,0,g.chinY);jg.addColorStop(0,mul(s,.8,0));jg.addColorStop(1,mul(s,.7,.35));x.fillStyle=jg;x.fillRect(0,0,100,100);
  if(g.est==='marcada'){const br=x.createLinearGradient(0,g.eyeY-7,0,g.eyeY-2);br.addColorStop(0,mul(s,1.1,.25));br.addColorStop(1,mul(s,.7,.3));x.fillStyle=br;x.fillRect(g.cx-g.fw,g.eyeY-7,g.fw*2,5);
    for(const sd of [-1,1]){const jg2=x.createRadialGradient(g.cx+sd*g.jw*.95,g.chinY-7,1,g.cx+sd*g.jw*.95,g.chinY-7,6);jg2.addColorStop(0,mul(s,.68,.4));jg2.addColorStop(1,mul(s,.68,0));x.fillStyle=jg2;x.fillRect(0,0,100,100);}
    E(x,g.cx,g.chinY-2.5,g.cw*.8,1.6,mul(s,1.12,.25));}
  else{for(const sd of [-1,1])E(x,g.cx+sd*g.fw*.5,g.eyeY+7,5,4,mul(s,1.1,.12));}
  // frente brillo
  E(x,g.cx-3,g.top+8,7,3.2,mul(s,1.15,.25),-.15);
  // edad
  if(c.age>=38){const a=Math.min(1,(c.age-35)/30);x.strokeStyle=mul(s,.62,.25+.35*a);x.lineWidth=.45;x.beginPath();
    // patas de gallo
    for(const sd of [-1,1])for(let i=0;i<3;i++){const ox=g.cx+sd*(g.eyeDX+5.5),oy=g.eyeY-.6+i*1.4;x.moveTo(ox,oy);x.lineTo(ox+sd*2.2,oy-1+i*.9);}
    // frente
    if(c.age>=48)for(let i=0;i<2;i++){x.moveTo(g.cx-8,g.top+9+i*2.6);x.quadraticCurveTo(g.cx,g.top+8+i*2.6,g.cx+8,g.top+9+i*2.6);}
    x.stroke();
    // surcos nasogenianos
    x.strokeStyle=mul(s,.6,.2+.35*a);x.lineWidth=.7;x.beginPath();for(const sd of [-1,1]){x.moveTo(g.cx+sd*4.2,g.noseY-.6);x.quadraticCurveTo(g.cx+sd*7.4,g.mouthY-1,g.cx+sd*6.6,g.mouthY+3.4);}x.stroke();
    // ojeras / bolsas
    for(const sd of [-1,1]){x.strokeStyle=mul(s,.65,.3*a);x.lineWidth=.5;x.beginPath();x.moveTo(g.cx+sd*(g.eyeDX-3.5),g.eyeY+3.2);x.quadraticCurveTo(g.cx+sd*g.eyeDX,g.eyeY+4.6,g.cx+sd*(g.eyeDX+3.6),g.eyeY+3);x.stroke();}
    if(c.age>=55){x.strokeStyle=mul(s,.6,.35);x.lineWidth=.5;x.beginPath();for(const sd of [-1,1]){x.moveTo(g.cx+sd*4.5,g.mouthY+2.6);x.quadraticCurveTo(g.cx+sd*5.2,g.mouthY+5.5,g.cx+sd*5.6,g.chinY-4);}x.stroke();}
  }
  // pecas y lunar
  if(c.freck){const R=rng(hash(c.skin+c.hair));for(let i=0;i<46;i++){const sd=R()<.5?-1:1;const px=g.cx+sd*(2+R()*12),py=g.eyeY+4+R()*7-Math.abs(px-g.cx)*.08;E(x,px,py,.18+R()*.22,.18+R()*.2,mul(s,.7,.25+R()*.3));}}
  if(c.mole){E(x,g.cx+(c.mole==='izq'?-1:1)*7,g.mouthY-1.5,.55,.55,mul(s,.4,.85));}
  // barba de dos días (sombra)
  if(c.beard==='sombra'){x.globalAlpha=.32;const bg=x.createLinearGradient(0,g.noseY,0,g.chinY);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(.25,mul(c.hair,1,.6));bg.addColorStop(1,mul(c.hair,1,.85));x.fillStyle=bg;
    x.beginPath();x.moveTo(g.cx-g.fw*.95,g.eyeY+6);x.quadraticCurveTo(g.cx-g.fw*.6,g.mouthY-3,g.cx-4,g.noseY+2);x.lineTo(g.cx+4,g.noseY+2);x.quadraticCurveTo(g.cx+g.fw*.6,g.mouthY-3,g.cx+g.fw*.95,g.eyeY+6);x.lineTo(g.cx+g.fw,100);x.lineTo(g.cx-g.fw,100);x.fill();
    const R=rng(7);x.fillStyle=mul(c.hair,.8,.5);for(let i=0;i<260;i++){const px=g.cx+(R()-.5)*g.fw*2,py=g.noseY+2+R()*(g.chinY-g.noseY);x.fillRect(px,py,.25,.25);}x.globalAlpha=1;}
  x.restore();
  // contorno sutil
  facePath(x,g);x.strokeStyle=mul(s,.62,.35);x.lineWidth=.45;x.stroke();
}

