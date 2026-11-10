// ---------- boca ----------
const BOCA={fina:{w:5.2,u:.9,l:1.3},media:{w:5.6,u:1.3,l:1.9},carnosa:{w:6,u:1.9,l:2.7},ancha:{w:7,u:1.3,l:2},pequena:{w:4.4,u:1.2,l:1.7}};
function mouth(x,c,g){const f=g.f,B=BOCA[f.boca]||BOCA.media;const s=c.skin;const k=.8+f.labios*.45;const w=B.w,u=B.u*k,l=B.l*k,cx=g.cx,my=g.mouthY;
  const sm=f.expresion==='sonrisa'?1.3:f.expresion==='enfado'||f.expresion==='triste'?-.8:f.expresion==='sorpresa'?0:.15;
  const lipBase=c.makeup?(c.lipCol||'#b2424c'):mix(s,'#b0574f',g.fem?.5:.33);
  // surco nasolabial (filtrum)
  x.fillStyle=mul(s,.75,.25);x.beginPath();x.moveTo(cx-1,g.noseY+1.6);x.lineTo(cx-1.2,my-u);x.lineTo(cx+1.2,my-u);x.lineTo(cx+1,g.noseY+1.6);x.fill();
  // labio superior
  const L=cx-w,R=cx+w,cy=my-sm;
  x.fillStyle=mul(lipBase,.85);x.beginPath();x.moveTo(L,cy);x.bezierCurveTo(cx-w*.6,my-u*.6,cx-w*.3,my-u*1.15,cx,my-u*.65);x.bezierCurveTo(cx+w*.3,my-u*1.15,cx+w*.6,my-u*.6,R,cy);x.quadraticCurveTo(cx,my+.4,L,cy);x.fill();
  // labio inferior
  if(f.expresion!=='sorpresa'){const lg=x.createLinearGradient(0,my,0,my+l);lg.addColorStop(0,mul(lipBase,.95));lg.addColorStop(1,mul(lipBase,1.08));x.fillStyle=lg;
    x.beginPath();x.moveTo(L+.4,cy+.1);x.quadraticCurveTo(cx,my+.5,R-.4,cy+.1);x.bezierCurveTo(cx+w*.6,my+l*1.05,cx-w*.6,my+l*1.05,L+.4,cy+.1);x.fill();
    E(x,cx-.6,my+l*.45,w*.35,l*.18,'rgba(255,255,255,.28)');}
  else{E(x,cx,my+1.2,w*.55,l*.9,'#4a1e22');E(x,cx,my+2,w*.35,l*.3,'#b65a5f');}
  // línea de la boca
  x.strokeStyle=mix(lipBase,'#2a1010',.55);x.lineWidth=.55;x.lineCap='round';x.beginPath();x.moveTo(L-.3,cy-.15);x.quadraticCurveTo(cx-w*.5,my+.5,cx,my+.25);x.quadraticCurveTo(cx+w*.5,my+.5,R+.3,cy-.15);x.stroke();
  if(f.expresion==='sonrisa'){x.strokeStyle=mul(s,.6,.5);x.lineWidth=.45;x.beginPath();x.moveTo(L-.6,cy-.6);x.quadraticCurveTo(L-1.6,cy+.2,L-1,cy+1.4);x.moveTo(R+.6,cy-.6);x.quadraticCurveTo(R+1.6,cy+.2,R+1,cy+1.4);x.stroke();}
  // sombra bajo el labio inferior
  E(x,cx,my+l+1.1,w*.55,.9,mul(s,.65,.3));
}

