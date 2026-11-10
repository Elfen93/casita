// ---------- rasgos de la cara: cada persona tiene los suyos ----------
const FACE_SHAPES=['oval','redonda','alargada','cuadrada','corazon','pera'];
const NOSES=['boton','recta','grande','aguilena','ancha','respingona','patata'];
const EYES=['almendra','redondos','caidos','pequenos','grandes'];
const BROWS=['finas','normales','gruesas','arqueadas','rectas'];
const MOUTHS=['normal','fina','carnosa','ancha','pequena'];
function seedRng(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296;};}
function makeFace(ch){const r=seedRng((ch.name||'')+(ch.skin||'')+(ch.hair||'')+(ch.style||'')+(ch.g||'')+(ch.age||'')+(ch.faceSeed||''));const P_=a=>a[Math.floor(r()*a.length)];
  return {shape:P_(FACE_SHAPES),nose:P_(NOSES),ns:0.85+r()*0.4,eyes:P_(EYES),es:0.85+r()*0.35,ed:7.6+r()*2.6,brow:P_(BROWS),mouth:P_(MOUTHS),mw:0.85+r()*0.35,ears:r()<.18?'soplillo':r()<.5?'grandes':'normales',
    freckles:r()<.2,mole:r()<.22?[38+r()*24,52+r()*14]:null,dimples:r()<.25,chin:(ch.build==='ancha'&&r()<.6)||r()<.1,lids:r()<.3,bags:r()<.25,gap:r()<.08,lashes:ch.g==='f'?r()<.85:r()<.1,tilt:(r()-.5)*.08,cheek:0.6+r()*0.6};}
const faceOf=ch=>{if(!ch.face)ch.face=makeFace(ch);return ch.face;};
// retrato estilo cartoon, con contorno y sombras planas
function paintPortrait(c,ch,md=65,nobg){
  const x=c.getContext('2d'),k=c.width/100;x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,100,100);
  const F=faceOf(ch),skin=ch.skin,hair=ch.hair,bw=(BUILDS[ch.build]||BUILDS.media)[1],fem=ch.g==='f',st=ch.style,age=ch.age||27;
  const OL=shade(skin,.5),HOL=shade(hair,.45),lw=1.3;
  const E=(cx,cy,rx,ry,col,rot=0)=>{x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,rx,ry,rot,0,Math.PI*2);x.fill();};
  const HG=(y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(hair,1.25));g.addColorStop(1,shade(hair,.85));return g;};
  const strokeP=(col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.lineJoin='round';x.lineCap='round';x.stroke();};
  if(!nobg){x.save();x.beginPath();x.arc(50,50,50,0,Math.PI*2);x.clip();const bg=x.createLinearGradient(0,0,0,100);bg.addColorStop(0,'#fde9d8');bg.addColorStop(1,'#e6dcf3');x.fillStyle=bg;x.fillRect(0,0,100,100);}
  // proporciones de la cara
  const sh={oval:[17.5,24,22],redonda:[19.5,22,21],alargada:[16,25.5,24],cuadrada:[18.5,23,21.5],corazon:[18.5,23.5,23.5],pera:[17,23,21]}[F.shape];
  const fw=sh[0]*(bw>1.1?1.06:bw<.9?.95:1),top=46-sh[1],chinY=46+sh[2];
  const sx=fw/18; // escala horizontal del pelo
  const hairT=(f)=>{x.save();x.translate(50,0);x.scale(sx,1);x.translate(-50,0);f();x.restore();};
  x.save();x.translate(50,50);x.rotate(F.tilt);x.translate(-50,-50);
  // ---------- pelo de atrás ----------
  hairT(()=>{x.fillStyle=HG(15,98);
    if(st==='melena'){x.beginPath();x.moveTo(30,30);x.bezierCurveTo(17,46,19,78,25,95);x.quadraticCurveTo(50,103,75,95);x.bezierCurveTo(81,78,83,46,70,30);x.closePath();x.fill();strokeP(HOL,lw);}
    else if(st==='media'){x.beginPath();x.moveTo(30,30);x.bezierCurveTo(19,44,20,64,26,75);x.quadraticCurveTo(50,81,74,75);x.bezierCurveTo(80,64,81,44,70,30);x.closePath();x.fill();strokeP(HOL,lw);}
    else if(st==='afro'){x.beginPath();for(let i=0;i<=20;i++){const a=i/20*Math.PI*2;const r=30+(i%2?3:0);const px=50+Math.cos(a)*r,py=40+Math.sin(a)*r*.92;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();x.fill();strokeP(HOL,lw);}
    else if(st==='rizos'){x.beginPath();for(let i=0;i<=22;i++){const a=Math.PI*.9+i/22*Math.PI*1.2;const r=25+(i%2?3.5:0);const px=50+Math.cos(a)*r,py=48+Math.sin(a)*r;i?x.lineTo(px,py):x.moveTo(px,py);}x.lineTo(72,72);x.lineTo(28,72);x.closePath();x.fill();strokeP(HOL,lw);}
    else if(st==='coleta'){x.beginPath();x.moveTo(66,38);x.bezierCurveTo(82,44,84,64,77,80);x.bezierCurveTo(72,68,70,54,62,45);x.closePath();x.fill();strokeP(HOL,lw);}
    else if(st==='mono'){x.beginPath();x.ellipse(50,14,10.5,9,0,0,Math.PI*2);x.fill();strokeP(HOL,lw);x.beginPath();x.arc(50,14,5,0.3,4.5);strokeP(shade(hair,.7),.8);}});
  // ---------- cuello y hombros ----------
  const nw=(fem?7:9)*bw;x.fillStyle=shade(skin,.84);x.beginPath();x.moveTo(50-nw,chinY-8);x.lineTo(50-nw-1,80);x.lineTo(50+nw+1,80);x.lineTo(50+nw,chinY-8);x.closePath();x.fill();strokeP(OL,lw);
  x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.moveTo(50-nw,chinY-4);x.quadraticCurveTo(50,chinY+5,50+nw,chinY-4);x.lineTo(50+nw,chinY-1);x.quadraticCurveTo(50,chinY+8,50-nw,chinY-1);x.fill();
  const swd=(fem?29:34)*bw;const sg=x.createLinearGradient(50-swd,0,50+swd,0);sg.addColorStop(0,shade(ch.shirt,1.1));sg.addColorStop(1,shade(ch.shirt,.8));
  x.fillStyle=sg;x.beginPath();x.moveTo(50-swd-8,104);x.quadraticCurveTo(50-swd-2,80,50-nw-2,77);x.quadraticCurveTo(50,88,50+nw+2,77);x.quadraticCurveTo(50+swd+2,80,50+swd+8,104);x.closePath();x.fill();strokeP(shade(ch.shirt,.5),lw);
  x.fillStyle=shade(skin,.88);x.beginPath();x.moveTo(50-nw-1.5,77.3);x.quadraticCurveTo(50,88,50+nw+1.5,77.3);x.quadraticCurveTo(50,83,50-nw-1.5,77.3);x.fill();
  // ---------- orejas ----------
  const er=F.ears==='soplillo'?[5.2,7]:F.ears==='grandes'?[4.2,6.4]:[3.4,5.6];const ex0=50-fw-(F.ears==='soplillo'?2.2:.6),ex1=50+fw+(F.ears==='soplillo'?2.2:.6);
  for(const [ex,s2] of [[ex0,-1],[ex1,1]]){x.fillStyle=shade(skin,.92);x.beginPath();x.ellipse(ex,50,er[0],er[1],s2*.15,0,Math.PI*2);x.fill();strokeP(OL,lw);x.beginPath();x.arc(ex-s2*.5,50,er[0]*.45,Math.PI*(s2>0?.6:1.4),Math.PI*(s2>0?1.4:2.4),s2<0);strokeP(shade(skin,.68),.8);}
  // ---------- cara ----------
  const facePath=()=>{x.beginPath();const L=50-fw,R=50+fw;x.moveTo(L,46);
    x.bezierCurveTo(L-.5,top+4,R+.5,top+4,R,46);
    if(F.shape==='cuadrada'){x.bezierCurveTo(R+.4,56,R-1,chinY-4,R-6,chinY-1);x.quadraticCurveTo(50,chinY+1.5,L+6,chinY-1);x.bezierCurveTo(L+1,chinY-4,L-.4,56,L,46);}
    else if(F.shape==='redonda'){x.bezierCurveTo(R+1,60,R-5,chinY,50,chinY);x.bezierCurveTo(L+5,chinY,L-1,60,L,46);}
    else if(F.shape==='corazon'){x.bezierCurveTo(R,56,R-8,chinY-2,50,chinY);x.bezierCurveTo(L+8,chinY-2,L,56,L,46);}
    else if(F.shape==='pera'){x.bezierCurveTo(R+2,58,R-3,chinY,50,chinY);x.bezierCurveTo(L+3,chinY,L-2,58,L,46);}
    else{x.bezierCurveTo(R,58,R-6,chinY,50,chinY);x.bezierCurveTo(L+6,chinY,L,58,L,46);}x.closePath();};
  const fg=x.createRadialGradient(46,42,3,50,50,28);fg.addColorStop(0,shade(skin,1.06));fg.addColorStop(1,shade(skin,.95));
  facePath();x.fillStyle=fg;x.fill();
  // sombra plana en el lado derecho y bajo el pelo
  x.save();facePath();x.clip();x.fillStyle='rgba(120,60,50,.10)';x.beginPath();x.ellipse(50+fw+4,52,fw*.55,30,0,0,Math.PI*2);x.fill();x.fillStyle='rgba(120,60,50,.10)';x.fillRect(30,top,40,7);
    if(F.chin){x.fillStyle='rgba(120,60,50,.12)';x.beginPath();x.ellipse(50,chinY-1.5,9,3,0,0,Math.PI*2);x.fill();}x.restore();
  facePath();strokeP(OL,lw);
  if(F.chin){x.beginPath();x.moveTo(43,chinY+1.2);x.quadraticCurveTo(50,chinY+4.2,57,chinY+1.2);strokeP(shade(skin,.7),.9);}
  // arrugas y ojeras según la edad
  if(age>=40){x.globalAlpha=Math.min(.55,(age-35)/40);x.beginPath();x.moveTo(50-fw+6,top+9);x.lineTo(50-fw+12,top+8.4);x.moveTo(50+fw-12,top+8.4);x.lineTo(50+fw-6,top+9);x.moveTo(40,58);x.quadraticCurveTo(41,63,44,64.5);x.moveTo(60,58);x.quadraticCurveTo(59,63,56,64.5);strokeP(shade(skin,.65),.8);x.globalAlpha=1;}
  // ---------- barba ----------
  if(ch.beard&&ch.beard!=='no'){
    if(ch.beard==='sombra'){x.save();facePath();x.clip();x.fillStyle='rgba(50,35,35,.16)';x.beginPath();x.ellipse(50,chinY-4,fw,12,0,0,Math.PI*2);x.fill();x.restore();}
    else if(ch.beard==='bigote'){x.fillStyle=hair;x.beginPath();x.moveTo(42,61);x.quadraticCurveTo(50,56.5,58,61);x.quadraticCurveTo(54,60,50,60.5);x.quadraticCurveTo(46,60,42,61);x.fill();strokeP(HOL,.8);}
    else{const by=ch.beard==='larga'?chinY+12:chinY+2.5;x.fillStyle=HG(50,by);x.beginPath();x.moveTo(50-fw+.5,50);x.bezierCurveTo(50-fw,by-6,44,by,50,by);x.bezierCurveTo(56,by,50+fw,by-6,50+fw-.5,50);x.lineTo(50+fw-3,53);x.quadraticCurveTo(58,63,55,61.5);x.quadraticCurveTo(50,59,45,61.5);x.quadraticCurveTo(42,63,50-fw+3,53);x.closePath();x.fill();strokeP(HOL,lw);}}
  // ---------- ojos ----------
  const ey=48,es=F.es,ed=F.ed;const blink=md<20;
  const eyeR={almendra:[4.2,2.5],redondos:[3.8,3.4],caidos:[4,2.7],pequenos:[3,2.2],grandes:[4.8,3.8]}[F.eyes];
  for(const s2 of [-1,1]){const cx=50+s2*ed,rx=eyeR[0]*es,ry=eyeR[1]*es;
    if(blink){x.beginPath();x.moveTo(cx-rx,ey);x.quadraticCurveTo(cx,ey+2,cx+rx,ey);strokeP('#3b2a2a',1.3);continue;}
    if(F.bags||md<35||age>=50){x.beginPath();x.moveTo(cx-rx*.8,ey+ry+.8);x.quadraticCurveTo(cx,ey+ry+2.6,cx+rx*.8,ey+ry+.8);strokeP('rgba(120,70,80,.35)',.9);}
    x.fillStyle='#fdfbf7';x.beginPath();if(F.eyes==='caidos'){x.moveTo(cx-rx,ey+s2*0);x.quadraticCurveTo(cx,ey-ry*1.5,cx+rx,ey+ry*.3*(-s2)+.6);x.quadraticCurveTo(cx,ey+ry*1.3,cx-rx,ey);}else x.ellipse(cx,ey,rx,ry,0,0,Math.PI*2);x.fill();
    const ir=Math.min(rx,ry)*.78;E(cx+.5,ey+.2,ir,ir,ch.eyes||'#3b2a20');E(cx+.5,ey+.2,ir*.5,ir*.5,'#141012');E(cx+1.3,ey-.8,ir*.32,ir*.32,'rgba(255,255,255,.95)');E(cx-.2,ey+1,ir*.15,ir*.15,'rgba(255,255,255,.7)');
    // párpado
    x.beginPath();x.ellipse(cx,ey,rx,ry,0,Math.PI*1.05,Math.PI*1.95);strokeP('#2b1f22',F.lashes?1.6:1.15);
    if(F.lids||md<35){x.fillStyle=shade(skin,.9);x.beginPath();x.ellipse(cx,ey-ry*.45,rx*1.02,ry*.6,0,Math.PI,Math.PI*2);x.fill();x.beginPath();x.moveTo(cx-rx,ey-ry*.45);x.lineTo(cx+rx,ey-ry*.45);strokeP('#2b1f22',.9);}
    if(F.lashes){x.beginPath();x.moveTo(cx+s2*rx*.9,ey-ry*.5);x.lineTo(cx+s2*(rx+1.6),ey-ry-0.6);x.moveTo(cx+s2*rx*.55,ey-ry*.85);x.lineTo(cx+s2*(rx*.7+.6),ey-ry-1.8);strokeP('#2b1f22',.9);}}
  // ---------- cejas ----------
  const bwid={finas:1.1,normales:1.7,gruesas:2.8,arqueadas:1.6,rectas:2.1}[F.brow]*(fem?1:1.25);const sad=md<35?2.2:0,happy=md>70?-.8:0,by0=ey-eyeR[1]*es-3.4;
  for(const s2 of [-1,1]){const cx=50+s2*ed;const inner=cx-s2*4.4,outer=cx+s2*4.6;const arch=F.brow==='arqueadas'?-2.6:F.brow==='rectas'?-.4:-1.5;
    x.beginPath();x.moveTo(inner,by0+.6-sad);x.quadraticCurveTo(cx,by0+arch+happy,outer,by0+1.2+happy);strokeP(shade(hair,.6),bwid);}
  // ---------- nariz ----------
  const ns=F.ns,ny=55.5;x.save();x.translate(50,ny);x.scale(ns,ns);
  if(F.nose==='boton'){E(0,0,2.6,2.2,shade(skin,.9));x.beginPath();x.arc(0,0,2.6,0.1*Math.PI,.9*Math.PI);strokeP(OL,1);}
  else if(F.nose==='respingona'){x.beginPath();x.moveTo(-.6,-8);x.quadraticCurveTo(-2.2,-1,-3,.4);x.quadraticCurveTo(0,2.6,3,.4);strokeP(OL,1.1);E(-1.4,.2,.7,.5,shade(skin,.6));E(1.4,.2,.7,.5,shade(skin,.6));}
  else if(F.nose==='grande'||F.nose==='patata'){x.fillStyle=shade(skin,.92);x.beginPath();x.moveTo(-1.5,-9);x.quadraticCurveTo(-3,-3,-4.6,0);x.quadraticCurveTo(-4.8,3.6,0,3.4);x.quadraticCurveTo(4.8,3.6,4.6,0);x.quadraticCurveTo(3,-3,1.5,-9);x.fill();x.beginPath();x.moveTo(-1.5,-9);x.quadraticCurveTo(-3,-3,-4.6,0);x.quadraticCurveTo(-4.8,3.6,0,3.4);x.quadraticCurveTo(4.8,3.6,4.6,0);strokeP(OL,1.1);if(F.nose==='patata')E(0,.6,3.2,2.6,'rgba(220,110,100,.18)');E(-2,1.6,.9,.6,shade(skin,.55));E(2,1.6,.9,.6,shade(skin,.55));}
  else if(F.nose==='aguilena'){x.beginPath();x.moveTo(-.5,-9);x.quadraticCurveTo(2.6,-5,1.6,-.6);x.quadraticCurveTo(1,2.2,-1.6,1.8);x.moveTo(1.4,1.6);x.quadraticCurveTo(3,1.4,3,.2);strokeP(OL,1.1);}
  else if(F.nose==='ancha'){x.beginPath();x.moveTo(-1,-7);x.quadraticCurveTo(-1.6,-2,-4.4,0);x.quadraticCurveTo(-4,2.6,-1.2,2);x.moveTo(1,-7);x.quadraticCurveTo(1.6,-2,4.4,0);x.quadraticCurveTo(4,2.6,1.2,2);strokeP(OL,1.1);E(-2.4,1,.9,.6,shade(skin,.55));E(2.4,1,.9,.6,shade(skin,.55));}
  else{x.beginPath();x.moveTo(-.4,-8);x.quadraticCurveTo(-1.6,-2,-2.6,.6);x.quadraticCurveTo(0,2.6,2.6,.6);strokeP(OL,1.1);}
  x.restore();
  // ---------- mejillas, pecas y lunar ----------
  x.fillStyle=`rgba(235,110,100,${(fem?.2:.1)*F.cheek})`;E(50-ed-1,57,4.4,2.6,x.fillStyle);E(50+ed+1,57,4.4,2.6,x.fillStyle);
  if(F.freckles){x.fillStyle=shade(skin,.68);for(let i=0;i<14;i++){const a=i*2.4,r=2+(i%5);E(50+(i%2?1:-1)*(ed-1+Math.cos(a)*r),55+Math.sin(a)*2.4,.55,.55,x.fillStyle);}}
  if(F.mole)E(F.mole[0],F.mole[1],.9,.9,shade(skin,.42));
  // ---------- boca ----------
  const mw=F.mw*(F.mouth==='ancha'?7.5:F.mouth==='pequena'?4.6:6),my=62.5,lip=fem?'#c2574f':shade(skin,.58),thick=F.mouth==='carnosa'?1.6:F.mouth==='fina'?.6:1;
  if(md>68){x.fillStyle='#7a2c2c';x.beginPath();x.moveTo(50-mw,my);x.quadraticCurveTo(50,my+7.5,50+mw,my);x.quadraticCurveTo(50,my+1.6,50-mw,my);x.fill();
    x.fillStyle='#fffdf8';x.beginPath();x.moveTo(50-mw*.8,my+.6);x.quadraticCurveTo(50,my+2.6,50+mw*.8,my+.6);x.quadraticCurveTo(50,my+1.3,50-mw*.8,my+.6);x.fill();if(F.gap){x.fillStyle='#7a2c2c';x.fillRect(49.6,my+.8,.8,1.2);}
    x.beginPath();x.moveTo(50-mw,my);x.quadraticCurveTo(50,my+7.5,50+mw,my);strokeP(shade(lip,.75),1.1);
    if(F.dimples){x.beginPath();x.arc(50-mw-1.4,my+.6,1,-.6,.9);x.moveTo(50+mw+1.4,my+.6);x.arc(50+mw+1.4,my+.6,1,Math.PI+.6,Math.PI-.9,true);strokeP(shade(skin,.7),.8);}}
  else if(md>38){x.beginPath();x.moveTo(50-mw,my+.4);x.quadraticCurveTo(50,my+2.4,50+mw,my+.4);strokeP(shade(lip,.8),1.3);
    if(thick>.7){x.fillStyle=lip;x.globalAlpha=.55;x.beginPath();x.moveTo(50-mw*.8,my+1.2);x.quadraticCurveTo(50,my+2.4+thick*1.6,50+mw*.8,my+1.2);x.quadraticCurveTo(50,my+2,50-mw*.8,my+1.2);x.fill();x.globalAlpha=1;}}
  else{x.beginPath();x.moveTo(50-mw*.9,my+2.4);x.quadraticCurveTo(50,my-.6,50+mw*.9,my+2.4);strokeP(shade(lip,.8),1.3);}
  // ---------- pelo de delante ----------
  hairT(()=>{
  if(st!=='calvo'){x.fillStyle=HG(14,48);if(st==='rapado')x.globalAlpha=.55;
    x.beginPath();x.moveTo(30,50);x.bezierCurveTo(26,30,32,14,50,13);x.bezierCurveTo(68,14,74,30,70,50);
    if(st==='corto'||st==='rapado'){x.bezierCurveTo(69,40,67,33,62,31);x.bezierCurveTo(55,33,46,28,40,30);x.bezierCurveTo(35,32,32,38,30,50);}
    else if(st==='rizos'||st==='afro'){x.bezierCurveTo(68,38,64,32,60,30);for(let i=0;i<5;i++){const xx=58-i*4.5;x.quadraticCurveTo(xx-1,34,xx-4,29);}x.bezierCurveTo(34,32,31,40,30,50);}
    else if(st==='coleta'||st==='mono'){x.bezierCurveTo(69,36,63,27,52,26);x.bezierCurveTo(42,26,33,33,30,50);}
    else{x.bezierCurveTo(70,38,64,26,54,27);x.bezierCurveTo(46,33,38,33,33,37);x.quadraticCurveTo(31,42,30,50);}
    x.closePath();x.fill();x.globalAlpha=1;if(st!=='rapado')strokeP(HOL,lw);
    if(st==='melena'||st==='media'){const lo=st==='melena'?86:68;x.fillStyle=HG(28,lo);
      x.beginPath();x.moveTo(31,34);x.bezierCurveTo(27,48,30,62,27,lo);x.quadraticCurveTo(31,lo-2,34,lo-8);x.bezierCurveTo(35,60,33,48,36,38);x.closePath();x.fill();strokeP(HOL,lw);
      x.beginPath();x.moveTo(69,34);x.bezierCurveTo(73,48,70,62,73,lo);x.quadraticCurveTo(69,lo-2,66,lo-8);x.bezierCurveTo(65,60,67,48,64,38);x.closePath();x.fill();strokeP(HOL,lw);}
    if(st!=='rapado'){x.globalAlpha=.4;for(const p of [[54,15,48,18,40,24,34,34],[56,16,62,19,67,26,68,36],[50,14,46,20,44,26,46,30]]){x.beginPath();x.moveTo(p[0],p[1]);x.bezierCurveTo(p[2],p[3],p[4],p[5],p[6],p[7]);strokeP(shade(hair,.62),.8);}x.globalAlpha=1;
      x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(44,20,8,2.2,-0.35,0,Math.PI*2);x.fill();}
    if(st==='afro'||st==='rizos')for(let i=0;i<7;i++){E(32+i*6,26-Math.sin(i/6*Math.PI)*6,5.5,5,i%2?shade(hair,1.12):hair);}}
  else{x.fillStyle=shade(hair,.9);x.globalAlpha=.45;E(31,46,2.6,6,x.fillStyle);E(69,46,2.6,6,x.fillStyle);x.globalAlpha=1;x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.ellipse(44,24,8,3,-0.3,0,Math.PI*2);x.fill();}});
  // ---------- gafas ----------
  if(ch.glasses){const gr=Math.max(5.6,eyeR[0]*es+1.8);x.beginPath();x.ellipse(50-ed,48,gr,gr*.78,0,0,Math.PI*2);x.moveTo(50+ed+gr,48);x.ellipse(50+ed,48,gr,gr*.78,0,0,Math.PI*2);x.moveTo(50-ed+gr,47);x.quadraticCurveTo(50,45.4,50+ed-gr,47);x.moveTo(50-ed-gr,47);x.lineTo(50-fw,46);x.moveTo(50+ed+gr,47);x.lineTo(50+fw,46);strokeP('#2b2b33',1.5);
    x.fillStyle='rgba(200,230,255,.14)';E(50-ed,48,gr,gr*.78,x.fillStyle);E(50+ed,48,gr,gr*.78,x.fillStyle);}
  x.restore();
  if(!nobg)x.restore();
}
