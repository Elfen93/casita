// ---------- nariz ----------
const NARIZ={recta:{w:3.4,b:0,tip:1.6},ancha:{w:4.6,b:0,tip:2},aguilena:{w:3.4,b:1.2,tip:1.4},respingona:{w:3.1,b:-.6,tip:1.5},pequena:{w:2.7,b:0,tip:1.2},chata:{w:4.4,b:-.3,tip:2.3}};
function nose(x,c,g){const f=g.f,N=NARIZ[f.nariz]||NARIZ.recta;const s=c.skin;const sc=.85+f.tamNariz*.35;const w=N.w*sc,ny=g.noseY,cx=g.cx;const ty=ny-.4;
  // sombra lateral del tabique (lado derecho)
  let sg=x.createLinearGradient(cx+.5,0,cx+3,0);sg.addColorStop(0,mul(s,.7,0));sg.addColorStop(.4,mul(s,.68,.4));sg.addColorStop(1,mul(s,.7,0));x.fillStyle=sg;
  x.beginPath();x.moveTo(cx+.8,g.eyeY+1);x.quadraticCurveTo(cx+1.6+N.b,ny-5,cx+w*.65,ny-1.4);x.lineTo(cx+w*.25,ny-1);x.quadraticCurveTo(cx+.6+N.b*.6,ny-5,cx+.2,g.eyeY+1);x.fill();
  if(N.b>0){x.strokeStyle=mul(s,.65,.4);x.lineWidth=.45;x.beginPath();x.moveTo(cx+.4,g.eyeY+3);x.quadraticCurveTo(cx+.9+N.b,ny-5,cx+.6,ny-2);x.stroke();}
  // sombra bajo la nariz
  E(x,cx,ny+1.2,w*.75,1.1,mul(s,.62,.35));
  // aletas
  x.strokeStyle=mul(s,.55,.65);x.lineWidth=.55;x.lineCap='round';
  for(const sd of [-1,1]){x.beginPath();x.moveTo(cx+sd*w*.42,ny-2.2);x.bezierCurveTo(cx+sd*w*1.05,ny-2.1,cx+sd*w*1.05,ny+.4,cx+sd*w*.55,ny+.6);x.stroke();}
  // orificios
  for(const sd of [-1,1])E(x,cx+sd*w*.38,ny+.35,w*.2,.55,mul(s,.35,.75),sd*.35);
  // punta
  const tg=x.createRadialGradient(cx-.4,ty-N.b*.2-1,.2,cx,ty-.6,N.tip*1.4);tg.addColorStop(0,mul(s,1.2,.6));tg.addColorStop(1,mul(s,1.1,0));x.fillStyle=tg;x.fillRect(cx-4,ty-4,8,6);
  E(x,cx-.5,g.eyeY+5,.6,2.6,mul(s,1.18,.3));
  if(N.b<0){x.strokeStyle=mul(s,.6,.35);x.lineWidth=.4;x.beginPath();x.moveTo(cx-w*.3,ny+.1);x.quadraticCurveTo(cx,ny-.5,cx+w*.3,ny+.1);x.stroke();}
}

