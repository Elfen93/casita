// ===== Retrato realista paramétrico =====
// drawFaceR(x, c): pinta en un espacio 100x100 (escala el contexto antes).
// c: {g, age, skin, hair, eyes, shirt, hairStyle, face:{...}, beard, glasses, freck, mole, makeup, earrings}
const RF=(()=>{
const hx=h=>{if(Array.isArray(h))return h;if(h[0]==='#'){const n=parseInt(h.slice(1),16);return [n>>16,(n>>8)&255,n&255];}const m=h.match(/[\d.]+/g);return [+m[0],+m[1],+m[2]];};
const rgb=(a,al=1)=>`rgba(${a[0]|0},${a[1]|0},${a[2]|0},${al})`;
const mul=(h,f,al=1)=>{const a=hx(h);return rgb(a.map(v=>Math.max(0,Math.min(255,v*f))),al);};
const mix=(h1,h2,t,al=1)=>{const a=hx(h1),b=hx(h2);return rgb(a.map((v,i)=>v+(b[i]-v)*t),al);};
const E=(x,cx,cy,rx,ry,f,r=0)=>{x.fillStyle=f;x.beginPath();x.ellipse(cx,cy,Math.max(.01,rx),Math.max(.01,ry),r,0,7);x.fill();};
function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)%100000)/100000;};}
function hash(o){const t=JSON.stringify(o);let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

// valores por defecto de rasgos (todos 0..1 salvo tipos)
const DEF={forma:'ovalada',ojos:'almendra',tamOjos:.5,sepOjos:.5,cejas:'natural',grosorCejas:.5,nariz:'recta',tamNariz:.5,boca:'media',labios:.5,orejas:.5,menton:.5,pomulos:.5,expresion:'neutra'};
const FORMAS={ovalada:{fw:17,jw:12,ch:22,cw:5},redonda:{fw:18.5,jw:15,ch:19,cw:7},cuadrada:{fw:18,jw:16.5,ch:20,cw:8},corazon:{fw:18,jw:11,ch:21,cw:3.5},alargada:{fw:15.5,jw:12.5,ch:25,cw:5}};

function geo(c){const f=Object.assign({},DEF,c.face||{});const F=FORMAS[f.forma]||FORMAS.ovalada;
  const big=c.big?1.6:0;
  const g={f,cx:50,top:21,eyeY:46,fw:F.fw+big*.6,jw:F.jw+big+ (f.menton-.5)*2,chinY:46+F.ch+(f.menton-.5)*2.5,cw:F.cw+big*.6,fem:c.g==='f'};
  const est=f.estructura||(c.g==='f'?'suave':c.g==='m'?'marcada':'media');g.est=est;
  if(est==='suave'){g.fw-=.5;g.jw-=1.6;g.cw-=1.2;g.chinY-=.8;}else if(est==='marcada'){g.fw+=.7;g.jw+=2.4;g.cw+=1.8;g.chinY+=1;}else{g.jw+=.4;g.cw+=.3;}
  g.eyeDX=6.6+(f.sepOjos-.5)*2.2;g.noseY=g.eyeY+9.5+(f.tamNariz-.5)*1.5;g.mouthY=g.noseY+(g.chinY-g.noseY)*.42;
  const BB={fina:5.2,media:5.6,carnosa:6,ancha:7,pequena:4.4};g.mw=BB[f.boca]||5.6;
  return g;}

function facePath(x,g){const {cx,top,fw,jw,chinY,cw}=g;const tY=34,cbY=g.eyeY+3,jY=chinY-8;
  x.beginPath();x.moveTo(cx,top);
  x.bezierCurveTo(cx+fw*.75,top,cx+fw,tY-7,cx+fw,tY);
  x.bezierCurveTo(cx+fw*1.03,cbY-4,cx+fw*1.02,cbY+2,cx+fw*.96,cbY+5);
  x.bezierCurveTo(cx+fw*.9,jY-4,cx+jw*1.02,jY-2,cx+jw,jY);
  x.bezierCurveTo(cx+jw*.85,jY+4,cx+cw*1.4,chinY-.5,cx+cw*.5,chinY);
  x.quadraticCurveTo(cx,chinY+.6,cx-cw*.5,chinY);
  x.bezierCurveTo(cx-cw*1.4,chinY-.5,cx-jw*.85,jY+4,cx-jw,jY);
  x.bezierCurveTo(cx-jw*1.02,jY-2,cx-fw*.9,jY-4,cx-fw*.96,cbY+5);
  x.bezierCurveTo(cx-fw*1.02,cbY+2,cx-fw*1.03,cbY-4,cx-fw,tY);
  x.bezierCurveTo(cx-fw,tY-7,cx-fw*.75,top,cx,top);x.closePath();}

// ---------- fondo, cuerpo ----------
function back(x,c){const g=x.createRadialGradient(42,30,5,50,50,75);g.addColorStop(0,c.bg1||'#f7ecdf');g.addColorStop(1,c.bg2||'#d9cfe6');x.fillStyle=g;x.fillRect(0,0,100,100);}
function body(x,c,g){const s=c.skin,sh=c.shirt||'#5b7fa6';const {cx}=g;const w=g.fem?27:31;const nw=g.fem?6:7.6;
  // cuello
  const ng=x.createLinearGradient(0,g.chinY-6,0,g.chinY+16);ng.addColorStop(0,mul(s,.62));ng.addColorStop(.45,mul(s,.86));ng.addColorStop(1,mul(s,.95));
  x.fillStyle=ng;x.beginPath();x.moveTo(cx-nw,g.chinY-10);x.bezierCurveTo(cx-nw,g.chinY+6,cx-nw-1,g.chinY+10,cx-nw-4,g.chinY+16);x.lineTo(cx+nw+4,g.chinY+16);x.bezierCurveTo(cx+nw+1,g.chinY+10,cx+nw,g.chinY+6,cx+nw,g.chinY-10);x.fill();
  if(!g.fem){x.strokeStyle=mul(s,.75,.5);x.lineWidth=.5;x.beginPath();x.moveTo(cx-1,g.chinY+5);x.quadraticCurveTo(cx,g.chinY+7,cx+1,g.chinY+5);x.stroke();}
  // hombros y camiseta
  const y0=g.chinY+13;const bg=x.createLinearGradient(cx-w,0,cx+w,0);bg.addColorStop(0,mul(sh,1.08));bg.addColorStop(.55,sh);bg.addColorStop(1,mul(sh,.68));
  x.fillStyle=bg;x.beginPath();x.moveTo(cx-w-8,101);x.bezierCurveTo(cx-w-6,y0+8,cx-w+2,y0+2,cx-nw-6,y0-1);x.quadraticCurveTo(cx,y0+(c.cuello==='pico'?10:5),cx+nw+6,y0-1);x.bezierCurveTo(cx+w-2,y0+2,cx+w+6,y0+8,cx+w+8,101);x.fill();
  // escote / cuello de la camiseta
  x.fillStyle=mul(s,.9);x.beginPath();x.moveTo(cx-nw-5.4,y0-.6);x.quadraticCurveTo(cx,y0+(c.cuello==='pico'?9:4.4),cx+nw+5.4,y0-.6);x.quadraticCurveTo(cx,y0-2,cx-nw-5.4,y0-.6);x.fill();
  x.strokeStyle=mul(sh,.7);x.lineWidth=1.1;x.beginPath();x.moveTo(cx-nw-6,y0-1);x.quadraticCurveTo(cx,y0+(c.cuello==='pico'?10:5),cx+nw+6,y0-1);x.stroke();
  // clavículas
  x.strokeStyle=mul(s,.72,.35);x.lineWidth=.6;x.beginPath();x.moveTo(cx-3,y0+1.5);x.quadraticCurveTo(cx-8,y0,cx-12,y0+.4);x.moveTo(cx+3,y0+1.5);x.quadraticCurveTo(cx+8,y0,cx+12,y0+.4);x.stroke();
  // pliegues
  x.strokeStyle=mul(sh,.8,.5);x.lineWidth=.6;x.beginPath();x.moveTo(cx-w+2,y0+10);x.quadraticCurveTo(cx-w+6,y0+16,cx-w+5,101);x.moveTo(cx+w-4,y0+9);x.quadraticCurveTo(cx+w-7,y0+16,cx+w-5,101);x.stroke();
}

// ---------- orejas ----------
function ears(x,c,g){const s=c.skin,f=g.f;const sz=4.6+(f.orejas-.5)*1.6;const y=g.eyeY+3.5;
  for(const sd of [-1,1]){const ex=g.cx+sd*(g.fw*.97);
    const eg=x.createRadialGradient(ex+sd*1,y,1,ex+sd*1.5,y,sz*1.4);eg.addColorStop(0,mul(s,.8));eg.addColorStop(1,mul(s,.97));
    x.fillStyle=eg;x.beginPath();x.moveTo(ex,y-sz);x.bezierCurveTo(ex+sd*sz*.9,y-sz*1.25,ex+sd*sz*1.05,y-sz*.2,ex+sd*sz*.75,y+sz*.5);x.bezierCurveTo(ex+sd*sz*.5,y+sz*1.15,ex+sd*sz*.1,y+sz*1.3,ex-sd*.3,y+sz*.9);x.closePath();x.fill();
    x.strokeStyle=mul(s,.65,.7);x.lineWidth=.55;x.beginPath();x.moveTo(ex+sd*.6,y-sz*.6);x.bezierCurveTo(ex+sd*sz*.75,y-sz*.85,ex+sd*sz*.75,y,ex+sd*sz*.4,y+sz*.4);x.stroke();
    E(x,ex+sd*sz*.3,y+sz*.05,sz*.18,sz*.3,mul(s,.6,.6));
    if(c.earrings){E(x,ex+sd*sz*.25,y+sz*1.25,.9,.9,'#e6c35c');if(c.earrings==='aro'){x.strokeStyle='#d9b24a';x.lineWidth=.6;x.beginPath();x.arc(ex+sd*sz*.25,y+sz*1.25+2.2,2.2,0,7);x.stroke();}}
  }}

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

// ---------- ojos ----------
const OJOS={almendra:{h:3.1,tilt:.5,lid:.55},redondos:{h:4,tilt:0,lid:.35},caidos:{h:3.2,tilt:-1.1,lid:.75},rasgados:{h:2.4,tilt:1.4,lid:.85},encapotados:{h:2.8,tilt:.2,lid:1}};
function eyes(x,c,g){const f=g.f,T=OJOS[f.ojos]||OJOS.almendra;const w=4.4+(f.tamOjos-.5)*1.4,h=T.h*(.85+f.tamOjos*.3);
  const exp=f.expresion;const s=c.skin;
  for(const sd of [-1,1]){const ex=g.cx+sd*g.eyeDX,ey=g.eyeY+(exp==='cansada'?.4:0);
    const inX=ex-sd*w,outX=ex+sd*w,inY=ey+.2,outY=ey-T.tilt*.6;
    const hh=h*(exp==='sonrisa'?.8:exp==='cansada'?.75:1);
    const top=()=>{x.moveTo(inX,inY);x.bezierCurveTo(ex-sd*w*.55,ey-hh*1.05,ex+sd*w*.35,ey-hh*1.1,outX,outY);};
    const bot=()=>{x.bezierCurveTo(ex+sd*w*.45,ey+hh*.55,ex-sd*w*.4,ey+hh*.6,inX,inY);};
    // párpado superior (sombra/maquillaje)
    if(c.makeup){const mg=x.createRadialGradient(ex+sd*1,ey-2.5,.5,ex+sd*1,ey-2.5,6);mg.addColorStop(0,c.makeupCol||'rgba(140,90,120,.45)');mg.addColorStop(1,'rgba(140,90,120,0)');x.fillStyle=mg;x.fillRect(ex-8,ey-9,16,12);}
    // blanco del ojo
    x.save();x.beginPath();top();bot();x.closePath();
    const wg=x.createRadialGradient(ex,ey,.5,ex,ey,w*1.1);wg.addColorStop(0,'#fbf8f3');wg.addColorStop(.7,'#ece4dc');wg.addColorStop(1,'#cdb9ad');x.fillStyle=wg;x.fill();x.clip();
    // iris
    const ix=ex+sd*.15,iy=ey+.15,ir=2.25+(f.tamOjos-.5)*.4;
    const ig=x.createRadialGradient(ix,iy,.3,ix,iy,ir);ig.addColorStop(0,mul(c.eyes,1.6));ig.addColorStop(.55,c.eyes);ig.addColorStop(.9,mul(c.eyes,.55));ig.addColorStop(1,mul(c.eyes,.3));
    E(x,ix,iy,ir,ir,ig);
    x.strokeStyle=mul(c.eyes,1.9,.35);x.lineWidth=.18;x.beginPath();for(let a=0;a<6.28;a+=.45){x.moveTo(ix+Math.cos(a)*.9,iy+Math.sin(a)*.9);x.lineTo(ix+Math.cos(a)*ir*.85,iy+Math.sin(a)*ir*.85);}x.stroke();
    E(x,ix,iy,ir*.42,ir*.42,'#0d0909');
    // sombra del párpado sobre el ojo
    const sg=x.createLinearGradient(0,ey-hh,0,ey+.5);sg.addColorStop(0,'rgba(60,30,25,.5)');sg.addColorStop(1,'rgba(60,30,25,0)');x.fillStyle=sg;x.fillRect(ex-w-1,ey-hh-1,w*2+2,hh+1.5);
    E(x,ix-ir*.35,iy-ir*.38,.62,.55,'rgba(255,255,255,.95)');E(x,ix+ir*.4,iy+ir*.35,.28,.28,'rgba(255,255,255,.6)');
    x.restore();
    // línea superior (pestañas)
    x.strokeStyle='#1b1212';x.lineCap='round';x.lineWidth=g.fem||c.makeup?.95:.7;x.beginPath();top();x.stroke();
    if(c.makeup){x.lineWidth=.8;x.beginPath();x.moveTo(outX,outY);x.lineTo(outX+sd*1.6,outY-1.1);x.stroke();}
    if(g.fem){x.lineWidth=.22;x.strokeStyle='rgba(27,18,18,.75)';x.beginPath();for(let i=0;i<5;i++){const t=.55+i*.1;const px=inX+(outX-inX)*t,py=inY+(outY-inY)*t-hh*Math.sin(Math.PI*t)*1.0;x.moveTo(px,py);x.lineTo(px+sd*(.3+t*.6),py-.6-t*.3);}x.stroke();}
    // línea inferior
    x.strokeStyle=mul(s,.55,.55);x.lineWidth=.35;x.beginPath();x.moveTo(outX,outY);bot();x.stroke();
    // lagrimal
    E(x,inX+sd*.5,inY+.1,.55,.4,'rgba(210,130,125,.8)');
    // pliegue del párpado
    const lid=T.lid;x.strokeStyle=mul(s,.55,.5);x.lineWidth=.42;x.beginPath();x.moveTo(inX+sd*.6,inY-1.2-lid*.3);x.bezierCurveTo(ex-sd*w*.4,ey-hh-1.6+lid*.8,ex+sd*w*.4,ey-hh-1.7+lid*.8,outX-sd*.4,outY-1.4+lid*.4);x.stroke();
    if(f.ojos==='encapotados'){x.fillStyle=mul(s,.95);x.beginPath();x.moveTo(ex-sd*w*.2,ey-hh-.6);x.quadraticCurveTo(ex+sd*w*.6,ey-hh-.4,outX+sd*.6,outY+.1);x.quadraticCurveTo(ex+sd*w*.5,ey-hh+.6,ex-sd*w*.2,ey-hh-.6);x.fill();}
    if(exp==='sonrisa'){x.strokeStyle=mul(s,.6,.5);x.lineWidth=.4;x.beginPath();x.moveTo(ex-sd*w*.6,ey+hh*.9);x.quadraticCurveTo(ex,ey+hh*1.4,ex+sd*w*.8,ey+hh*.7);x.stroke();}
  }}

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

function draw(x,c){if(c.hairStyle==='media')c=Object.assign({},c,{hairStyle:'bob'});const g=geo(c);if(!c.nobg)back(x,c);x.save();x.translate(50,57);x.scale(1.24,1.24);x.translate(-50,-50);hairBack(x,c,g);body(x,c,g);ears(x,c,g);skin(x,c,g);eyes(x,c,g);brows(x,c,g);nose(x,c,g);mouth(x,c,g);beardLight(x,c,g);hairFront(x,c,g);glasses(x,c,g);x.restore();
  if(!c.nobg){const v=x.createRadialGradient(50,48,35,50,50,75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(40,20,40,.18)');x.fillStyle=v;x.fillRect(0,0,100,100);}}
return {draw,DEF,FORMAS:Object.keys(FORMAS),OJOS:Object.keys(OJOS),CEJAS:Object.keys(CEJAS),NARIZ:Object.keys(NARIZ),BOCA:Object.keys(BOCA)};
})();
