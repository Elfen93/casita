// ---------- ropa: conjuntos, estilos y accesorios ----------
const OUTFITS={basico:{n:'Básico',e:'👕'},hiphop:{n:'Hip hop',e:'🧢'},mono:{n:'Monocromo',e:'◼️'},chandal:{n:'Chándal',e:'🏃'},traje:{n:'Traje',e:'🕴️'},
  obrero:{n:'Mono de trabajo',e:'🔧'},vestido:{n:'Vestido',e:'👗'},falda:{n:'Falda',e:'👚'},vaquera:{n:'Cazadora vaquera',e:'🧥'},punk:{n:'Punk / rock',e:'🤘'},
  punto:{n:'Punto y abrigo',e:'🧶'},deporte:{n:'Deportivo',e:'🏀'}};
const MONOC=[['#18181c','Negro'],['#f3f0e8','Blanco'],['#d9c4a0','Beige'],['#6b6e3c','Oliva'],['#7b7f87','Gris'],['#2c3a5c','Marino'],['#7d2f36','Granate'],['#b9824f','Camel'],['#d7a1b4','Rosa'],['#3f6b55','Verde'],['#e2b33c','Mostaza'],['#5b3f8c','Morado']];
const OUTC=['#18181c','#f3f0e8','#d9c4a0','#7b7f87','#2c3a5c','#4a6fa5','#6b6e3c','#3f6b55','#7d2f36','#b9824f','#c0392b','#ff8a5b','#e9c46a','#00bb7f','#5bc0be','#3a86ff','#9b5de5','#f15bb5','#c4e04e'];
const ACCS={gorra:'🧢 Gorra',gorro:'🧶 Gorro de lana',cadena:'⛓️ Cadena',bolso:'👜 Bolso',gafasol:'🕶️ Gafas de sol'};
const OSLOTS={basico:[['shirt','Camiseta'],['pants','Pantalón'],['shoes','Zapatos']],
  hiphop:[['shirt','Sudadera'],['pants','Pantalón ancho'],['shoes','Zapatillas']],
  chandal:[['shirt','Chándal'],['acc2','Rayas'],['shoes','Zapatillas']],
  traje:[['shirt','Traje'],['acc2','Corbata'],['shoes','Zapatos']],
  obrero:[['shirt','Mono'],['acc2','Bandas'],['shoes','Botas']],
  vestido:[['shirt','Vestido'],['shoes','Zapatos']],
  falda:[['shirt','Blusa'],['pants','Falda'],['shoes','Zapatos']],
  vaquera:[['acc2','Cazadora'],['shirt','Camiseta'],['pants','Pantalón'],['shoes','Zapatillas']],
  punk:[['acc2','Chupa'],['shirt','Camiseta'],['pants','Pantalón'],['shoes','Botas']],
  punto:[['shirt','Jersey'],['acc2','Abrigo'],['pants','Pantalón'],['shoes','Zapatos']],
  deporte:[['shirt','Camiseta'],['acc2','Ribete'],['pants','Pantalón corto'],['shoes','Zapatillas']]};
const ofSig=c=>(c.shirt||'')+'|'+(c.pants||'');
function dressUp(ch,k){const R=pickR,rr=Math.random;ch.outfit=k;ch.acc=[];ch.capBack=false;delete ch.capc;
  switch(k){
    case 'hiphop':ch.shirt=R(['#18181c','#f3f0e8','#7b7f87','#c0392b','#3a86ff','#6b6e3c','#e2b33c','#9b5de5','#d7a1b4','#00bb7f','#2c3a5c']);ch.pants=R(['#2b2b2b','#4a6fa5','#6b6e3c','#d9c4a0','#7b7f87','#18181c']);
      ch.shoes=R(['#f3f0e8','#f3f0e8','#c0392b','#3a86ff','#e9c46a','#00bb7f','#f15bb5','#c4e04e']);ch.capc=R(OUTC.filter(c=>c!==ch.shirt));ch.acc=[rr()<.72?'gorra':'gorro','cadena'];if(rr()<.3)ch.acc.push('gafasol');ch.capBack=rr()<.4;break;
    case 'mono':{const c=R(MONOC)[0];ch.shirt=ch.pants=ch.shoes=ch.acc2=c;if(rr()<.4)ch.acc=[R(['gafasol','gorro','bolso','gafasol'])];break;}
    case 'chandal':ch.shirt=R(['#2c3a5c','#18181c','#c0392b','#00bb7f','#7b7f87','#3a86ff','#7d2f36','#6b6e3c','#9b5de5']);ch.pants=ch.shirt;ch.acc2=R(['#f3f0e8','#f3f0e8','#e9c46a','#18181c']);ch.shoes=R(['#f3f0e8','#18181c','#c4e04e']);if(rr()<.25)ch.acc=['gorra'];break;
    case 'traje':ch.shirt=R(['#24262e','#2c3a5c','#4b4f58','#b9824f','#6b6e3c','#7d2f36','#d9c4a0']);ch.pants=ch.shirt;ch.acc2=R(['#7d2f36','#2c3a5c','#18181c','#c0392b','#e2b33c','#3f6b55']);ch.shoes=R(['#18181c','#4a2c1c']);break;
    case 'obrero':ch.shirt=R(['#2f5d8a','#e07a2e','#6b705c','#3b3f46','#2c3a5c']);ch.pants=ch.shirt;ch.acc2=R(['#e9e4dc','#f6c90e']);ch.shoes=R(['#4a2c1c','#18181c','#8a5a32']);break;
    case 'vestido':ch.shirt=R(['#c0392b','#18181c','#f15bb5','#3a86ff','#00bb7f','#e9c46a','#9b5de5','#f3f0e8','#d7a1b4','#2c3a5c']);ch.pants=ch.shirt;ch.shoes=R(['#18181c','#f3f0e8','#7d2f36','#b9824f']);if(rr()<.35)ch.acc=['bolso'];break;
    case 'falda':ch.shirt=R(['#f3f0e8','#e9c46a','#5bc0be','#18181c','#d7a1b4']);ch.pants=R(['#2c3a5c','#7d2f36','#18181c','#6b6e3c','#c0392b','#b9824f']);ch.shoes=R(['#18181c','#7d2f36','#f3f0e8']);if(rr()<.4)ch.acc=['bolso'];break;
    case 'vaquera':ch.acc2=R(['#4a6fa5','#5d7fb3','#2f4b75']);ch.shirt=R(['#f3f0e8','#18181c','#c0392b','#e9c46a','#ff8a5b']);ch.pants=R(['#18181c','#2c3a5c','#d9c4a0','#7b7f87']);ch.shoes=R(['#f3f0e8','#c0392b','#18181c']);if(rr()<.25)ch.acc=['gafasol'];break;
    case 'punk':ch.acc2=R(['#1b1b20','#1b1b20','#3a2a22','#7d2f36']);ch.shirt=R(['#f3f0e8','#c0392b','#18181c','#9b5de5','#7b7f87']);ch.pants=R(['#18181c','#2b2b2b','#7d2f36']);ch.shoes='#141418';ch.acc=rr()<.55?['cadena']:[];if(rr()<.3)ch.acc.push('gafasol');break;
    case 'punto':ch.shirt=R(['#f3f0e8','#d9c4a0','#7d2f36','#6b6e3c','#2c3a5c','#e2b33c','#7b7f87']);ch.acc2=R(['#b9824f','#18181c','#7b7f87','#2c3a5c','#6b6e3c']);ch.pants=R(['#18181c','#2c3a5c','#4a3a2c','#7b7f87']);ch.shoes=R(['#4a2c1c','#18181c']);if(rr()<.3)ch.acc=['gorro'];break;
    case 'deporte':ch.shirt=R(['#3a86ff','#c0392b','#00bb7f','#e9c46a','#f3f0e8','#9b5de5','#18181c']);ch.acc2=R(['#f3f0e8','#18181c','#e9c46a']);ch.pants=R(['#18181c','#2c3a5c','#f3f0e8','#7b7f87']);ch.shoes=R(['#f3f0e8','#c4e04e','#ff8a5b','#3a86ff']);if(rr()<.3)ch.acc=['gorra'];break;
    default:ch.outfit='basico';ch.shirt=R(SHIRTC);ch.pants=R(PANTSC);ch.shoes=R(['#18181c','#f3f0e8','#b9824f']);
  }
  if(!ch.acc2)ch.acc2=shade(ch.shirt,.7);
  if(k!=='mono'){const keys=k==='basico'?['shoes','capc']:['shirt','pants','shoes','acc2','capc'];for(const f of keys)if(ch[f]&&ch[f][0]==='#'&&!OUTC.includes(ch[f]))ch[f]=nearCol(ch[f]);}
  ch.ofSig=ofSig(ch);return ch;}
function nearCol(h){const v=c=>{const n=parseInt(c.slice(1),16);return [n>>16,(n>>8)&255,n&255];},a=v(h);let best=OUTC[0],bd=1e9;for(const c of OUTC){const b=v(c),d=(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;if(d<bd){bd=d;best=c;}}return best;}
function pickOutfit(g){const W={basico:5,hiphop:12,mono:12,chandal:8,traje:7,obrero:5,vestido:g==='f'?10:g==='x'?5:1,falda:g==='f'?7:g==='x'?4:.5,vaquera:8,punk:7,punto:8,deporte:7};
  let t=0;for(const k in W)t+=W[k];let r=Math.random()*t;for(const k in W){r-=W[k];if(r<=0)return k;}return 'basico';}
{const _rc=randomChar;randomChar=function(g){const c=_rc(g);return dressUp(c,pickOutfit(c.g));};}
const lumOf=h=>{const a=shade(h,1).match(/[\d.]+/g);if(!a)return .5;return (a[0]*.3+a[1]*.59+a[2]*.11)/255;};
// qué lleva puesto (null = dibujo clásico: partida antigua o uniforme de una escena)
function outfitSpec(C){const k=C&&C.outfit;if(!k||!OUTFITS[k])return null;if(C.ofSig&&C.ofSig!==ofSig(C))return null;
  const top=C.shirt||'#ff8a5b',bot=C.pants||'#3d405b',a2=C.acc2||shade(top,.7);
  const s={k,top,bot,shoes:C.shoes||'#2c2833',a2,acc:new Set(C.acc||[]),sleeve:'short',sleeveCol:top,thigh:bot,shin:bot,skirt:null,shoeT:'flat',capCol:a2,capBack:!!C.capBack};
  switch(k){
    case 'hiphop':s.sleeve='long';s.over=1;s.hood=1;s.baggy=1;s.shoeT='sneaker';break;
    case 'mono':s.sleeve='long';s.turtle=1;s.bot=s.thigh=s.shin=top;s.shoes=shade(C.shoes||top,.86);s.capCol=shade(top,.92);break;
    case 'chandal':s.sleeve='long';s.zip=1;s.stripes=a2;s.bot=s.thigh=s.shin=top;s.shoeT='sneaker';s.capCol=top;break;
    case 'traje':s.sleeve='long';s.suit=1;s.bot=s.thigh=s.shin=top;s.shoeT='dress';break;
    case 'obrero':s.sleeve='long';s.overall=1;s.bot=s.thigh=s.shin=top;s.shoeT='boot';s.capCol=top;break;
    case 'vestido':s.sleeve='none';s.dress=1;s.skirt={col:top,len:9.6,flare:3.4};s.thigh=s.shin=null;s.capCol=top;break;
    case 'falda':s.skirt={col:bot,len:7,flare:2.6,pleat:1};s.thigh=s.shin=null;s.blouse=1;s.capCol=bot;break;
    case 'vaquera':s.jacket=a2;s.jt='denim';s.sleeve='long';s.sleeveCol=a2;s.shoeT='sneaker';s.capCol=top;break;
    case 'punk':s.jacket=a2;s.jt='leather';s.sleeve='long';s.sleeveCol=a2;s.shoeT='boot';s.skinny=1;s.rips=1;s.capCol=a2;break;
    case 'punto':s.knit=1;s.turtle=1;s.sleeve='long';s.jacket=a2;s.jt='coat';s.coat=a2;s.sleeveCol=a2;s.shoeT='boot';s.capCol=top;break;
    case 'deporte':s.sleeve='none';s.tank=1;s.shorts=1;s.shin=null;s.trim=a2;s.shoeT='sneaker';s.socks=1;s.capCol=a2;break;
  }
  if(C.capc)s.capCol=C.capc;return s;}
function ofShoe(F,x,y,ang,dark){ctx.save();ctx.translate(x,y);ctx.rotate(Math.max(-.5,Math.min(.6,-ang*0.6)));const c=dark?shade(F.shoes,.8):F.shoes,lt=lumOf(F.shoes)>.62;
  if(F.shoeT==='sneaker'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-1.9,-2);ctx.quadraticCurveTo(3.2,-2.7,4.5,-.1);ctx.quadraticCurveTo(4.6,1.2,1.4,1.2);ctx.lineTo(-2,1.2);ctx.closePath();ctx.fill();
    ctx.fillStyle=dark?'#d6d1c8':'#fbf9f4';ctx.fillRect(-2.1,.45,6.8,1.25);ctx.strokeStyle=lt?'#c0392b':'#fbf9f4';ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(-1.1,-.2);ctx.quadraticCurveTo(1.6,.3,3.5,-1.3);ctx.stroke();}
  else if(F.shoeT==='boot'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-1.8,-2.2);ctx.lineTo(1.2,-2.2);ctx.quadraticCurveTo(4.2,-1.4,4.3,.2);ctx.lineTo(4.3,1.3);ctx.lineTo(-1.9,1.3);ctx.closePath();ctx.fill();ctx.fillStyle='#141210';ctx.fillRect(-2,.7,6.5,1.1);
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(1.6,-1.4,1.4,.4);}
  else if(F.shoeT==='dress'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-1.4,-1.3);ctx.quadraticCurveTo(3.6,-1.7,4.4,.3);ctx.quadraticCurveTo(4,1,1,1);ctx.lineTo(-1.6,1);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(2.4,-.7,1,.3,-.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-1.6,.75,5.6,.45);}
  else{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-1.4,-1.4);ctx.quadraticCurveTo(3.6,-1.9,3.9,.1);ctx.quadraticCurveTo(3.8,1.2,1.2,1.2);ctx.lineTo(-1.6,1.2);ctx.closePath();ctx.fill();ctx.fillStyle=lt?'#8a8278':'#e9e4dc';ctx.fillRect(-1.6,.6,5.4,.6);}
  ctx.restore();}
function ofLeg(F,l,hipY,bw,skin,shoe){const d=l.side<0,Y=v=>v+hipY,hi=d?null:'rgba(255,255,255,.12)';
  const k=F.baggy?1.34:F.skinny?.86:F.thigh?1:.9;const c1=F.thigh||skin,c2=F.shin||skin,C1=d?shade(c1,.78):c1,C2=d?shade(c2,.78):c2;
  const ax=l.hx0,ay=Y(l.hy0),kx=l.kx,ky=Y(l.ky),fx=l.fx,fy=Y(l.fy);
  limb(kx,ky,fx,fy,4.1*bw*k,3.3*bw*(F.baggy?1.55:k),C2,hi);
  limb(ax,ay,kx,ky,4.9*bw*k,4.1*bw*k,C1,hi);
  if(F.shorts){const C=d?shade(F.bot,.78):F.bot;limb(ax,ay,ax+(kx-ax)*.72,ay+(ky-ay)*.72,5.9*bw,5.4*bw,C,hi);if(F.trim){ctx.strokeStyle=F.trim;ctx.lineWidth=.6;ctx.beginPath();const mx=ax+(kx-ax)*.72,my=ay+(ky-ay)*.72+2.3;ctx.moveTo(mx-2.7*bw,my);ctx.lineTo(mx+2.7*bw,my);ctx.stroke();}}
  if(F.baggy){ctx.fillStyle=shade(C2,.88);ctx.beginPath();ctx.ellipse(fx,fy-1.6,2.8*bw,1.3,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.14)';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(kx-1.6,ky+1.4);ctx.quadraticCurveTo(kx,ky+2.6,kx+1.7,ky+1.2);ctx.moveTo(fx-1.8,fy-3.2);ctx.quadraticCurveTo(fx,fy-2.2,fx+1.8,fy-3.4);ctx.stroke();}
  if(F.stripes){const o=(d?-1:1)*1.5*bw;ctx.strokeStyle=d?shade(F.stripes,.8):F.stripes;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(ax+o,ay);ctx.lineTo(kx+o,ky);ctx.lineTo(fx+o*.8,fy-1.4);ctx.stroke();}
  if(F.overall){ctx.fillStyle=d?shade(F.a2,.8):F.a2;const t0=.42,t1=.56;limb(kx+(fx-kx)*t0,ky+(fy-ky)*t0,kx+(fx-kx)*t1,ky+(fy-ky)*t1,4.3*bw,4*bw,d?shade(F.a2,.8):F.a2);}
  if(F.rips&&!d){ctx.fillStyle=shade(skin,.92);ctx.beginPath();ctx.ellipse(kx+.3,ky-.2,1.1,.55,.1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(ax+(kx-ax)*.45+.4,ay+(ky-ay)*.45,.8,.4,0,0,Math.PI*2);ctx.fill();}
  if(F.socks){limb(fx-Math.sin(l.sh)*2.2,fy-Math.cos(l.sh)*2.2,fx,fy-.4,3.4*bw,3.3*bw,d?'#d6d1c8':'#fbf9f4');}
  if(F.shoeT==='boot'){const C=d?shade(F.shoes,.8):F.shoes;limb(fx,fy-.4,fx-Math.sin(l.sh)*4.6,fy-Math.cos(l.sh)*4.6,3.9*bw,(F.skinny?3.9:4.3)*bw,C);}
  shoe(fx,fy+.4,l.sh,d);}
function ofArm(F,near,sx,sy,t,bw,sk){const sc=near?shade(F.sleeveCol,.95):shade(F.sleeveCol,.76),k=F.over?1.28:F.jacket?1.1:1,hi=near?'rgba(255,255,255,.1)':null;
  limb(sx,sy,t.ex,t.ey,3.6*bw,3*bw,sk);limb(t.ex,t.ey,t.hx,t.hy,2.9*bw,2.3*bw,sk,near?'rgba(255,255,255,.12)':null);
  if(F.sleeve==='short')limb(sx,sy,sx+(t.ex-sx)*.55,sy+(t.ey-sy)*.55,4.6*bw,4*bw,sc);
  else if(F.sleeve==='long'){const q=F.over?.8:.86,cx=t.ex+(t.hx-t.ex)*q,cy=t.ey+(t.hy-t.ey)*q;limb(sx,sy,t.ex,t.ey,4.5*bw*k,4*bw*k,sc);limb(t.ex,t.ey,cx,cy,4*bw*k,3.4*bw*k,sc,hi);
    if(F.over||F.zip){const c2=t.ex+(t.hx-t.ex)*(q-.16),d2=t.ey+(t.hy-t.ey)*(q-.16);limb(c2,d2,cx,cy,3.5*bw*k,3.3*bw*k,shade(sc,.86));}
    if(F.stripes){ctx.strokeStyle=near?F.stripes:shade(F.stripes,.8);ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(sx+1.2,sy);ctx.lineTo(t.ex+1.2,t.ey);ctx.lineTo(cx+1,cy);ctx.stroke();}
    if(F.jt==='leather'&&near){ctx.fillStyle='#cfd4da';circ(cx,cy,.35,'#cfd4da');}}
  else if(F.tank&&F.trim){ctx.strokeStyle=F.trim;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(sx,sy+.4,1.9*bw,-.6,2.2);ctx.stroke();}}
function ofTorso(F,shW,waW,hiW,shY,hipY,front,fem,skin,tt,bw,sit){
  let sW=shW,wW=waW,hW=hiW,hem=hipY-2;if(F.over){sW+=1;wW+=1.9;hW+=1.7;hem=hipY+2.3;}if(F.jacket&&F.jt!=='coat'){sW+=.5;wW+=.7;hW+=.6;hem=hipY-1.2;}if(F.jt==='coat'){sW+=.6;wW+=.8;hW+=.8;}
  const main=F.jacket||F.top,hipC=F.skirt?F.skirt.col:F.bot;
  ctx.fillStyle=hipC;ctx.beginPath();ctx.moveTo(-hiW,hipY-3.6);ctx.lineTo(hiW,hipY-3.6);ctx.quadraticCurveTo(hiW+.4,hipY+1.6,hiW-1,hipY+2.6);ctx.lineTo(-hiW+1,hipY+2.6);ctx.quadraticCurveTo(-hiW-.4,hipY+1.6,-hiW,hipY-3.6);ctx.fill();
  const br=1+Math.sin(tt*2.2)*0.012;ctx.save();ctx.translate(0,hipY);ctx.scale(1,br);ctx.translate(0,-hipY);
  const grad=(c)=>{const g=ctx.createLinearGradient(-sW,0,sW,0);g.addColorStop(0,shade(c,.82));g.addColorStop(.45,c);g.addColorStop(1,shade(c,1.08));return g;};
  // abrigo largo: faldones por debajo de la cadera
  if(F.coat){ctx.fillStyle=grad(F.coat);ctx.beginPath();if(sit){ctx.moveTo(-hW-.6,hipY-3);ctx.lineTo(hW+.6,hipY-3);ctx.lineTo(11.5,hipY-1.8);ctx.lineTo(11.8,hipY+2.6);ctx.lineTo(-hW-1.4,hipY+4.4);}else{ctx.moveTo(-hW-.6,hipY-3);ctx.lineTo(hW+.6,hipY-3);ctx.lineTo(hW+2.2,hipY+10.5);ctx.lineTo(-hW-2.2,hipY+10.5);}ctx.closePath();ctx.fill();
    if(front&&!sit){ctx.fillStyle=shade(F.bot,.9);ctx.beginPath();ctx.moveTo(1.3,hipY);ctx.lineTo(2.1,hipY);ctx.lineTo(3,hipY+10.4);ctx.lineTo(.5,hipY+10.4);ctx.closePath();ctx.fill();}
    ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-hW-.4,hipY+1);ctx.quadraticCurveTo(-hW-1.2,hipY+6,-hW-1.6,hipY+10);ctx.stroke();}
  // cuerpo
  ctx.fillStyle=grad(main);ctx.beginPath();ctx.moveTo(-sW,shY+2.4);ctx.quadraticCurveTo(-sW,shY-.4,-sW+2.4,shY-.8);ctx.lineTo(sW-2.4,shY-.8);ctx.quadraticCurveTo(sW,shY-.4,sW+.2,shY+2.4);
  ctx.bezierCurveTo(wW+1.2,shY+6,wW,hem-5,wW,hem-3.4);ctx.quadraticCurveTo(hW,hem-1.6,hW,hem);ctx.lineTo(-hW,hem);ctx.quadraticCurveTo(-hW,hem-1.6,-wW,hem-3.4);ctx.bezierCurveTo(-wW,hem-5,-wW-1.2,shY+6,-sW,shY+2.4);ctx.fill();
  const line=(pts,col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w||.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();};
  const fill=(pts,col)=>{ctx.fillStyle=col;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();};
  if(F.over){ctx.fillStyle=shade(main,.86);ctx.fillRect(-hW+.3,hem-1.5,hW*2-.6,1.5);}
  if(!F.over&&!F.skirt)line([[-wW+.6,hipY-4],[waW-.6,hipY-4]],'rgba(0,0,0,.12)');
  if(F.knit){ctx.save();ctx.globalAlpha=.16;for(let y=shY+2;y<hem-.6;y+=1.5)line([[-wW-.6,y],[wW+.6,y+.2]],shade(F.top,.6),.4);ctx.restore();}
  if(F.skirt){const S_=F.skirt,y0=hipY-5.2;ctx.fillStyle=grad(S_.col);ctx.beginPath();
    if(sit){ctx.moveTo(-wW-.3,y0);ctx.lineTo(wW+.3,y0);ctx.lineTo(10.6,hipY-2.4);ctx.quadraticCurveTo(12,hipY+.5,10.8,hipY+2.8);ctx.lineTo(-hW-.8,hipY+3.2);}
    else{const yb=y0+S_.len+(F.dress?1.2:0);ctx.moveTo(-wW-.3,y0);ctx.lineTo(wW+.3,y0);ctx.quadraticCurveTo(hW+S_.flare*.6,y0+S_.len*.5,hW+S_.flare,yb);ctx.quadraticCurveTo(0,yb+1.4,-hW-S_.flare,yb);ctx.quadraticCurveTo(-hW-S_.flare*.6,y0+S_.len*.5,-wW-.3,y0);}
    ctx.closePath();ctx.fill();
    if(S_.pleat&&!sit){ctx.save();ctx.globalAlpha=.22;const yb=y0+S_.len;for(let k=-2;k<=2;k++)line([[k*1.4,y0+1],[k*(1.4+S_.flare*.35),yb]],shade(S_.col,.5),.45);ctx.restore();}
    if(!F.dress)line([[-wW-.2,y0+.4],[wW+.2,y0+.4]],shade(S_.col,.7),.8);
    else line([[-wW,y0+.3],[wW,y0+.3]],shade(S_.col,.75),.6);}
  if(front){
    if(fem&&!F.jacket&&!F.suit){ctx.fillStyle='rgba(0,0,0,.06)';ctx.beginPath();ctx.ellipse(.6,shY+6,2.2,1,0,0,Math.PI);ctx.fill();ctx.beginPath();ctx.ellipse(4,shY+6,1.9,.9,0,0,Math.PI);ctx.fill();}
    const neckV=()=>{ctx.fillStyle=shade(skin,.9);ctx.beginPath();ctx.moveTo(-.4,shY-.8);ctx.quadraticCurveTo(1.6,shY+2.6,3.8,shY-.8);ctx.fill();};
    if(F.jacket){const inner=F.top;fill([[-1,shY-.8],[4.4,shY-.8],[3.4,hem-.2],[0,hem-.2]],inner);
      if(F.knit)ctx.save(),ctx.globalAlpha=.16,[0,1,2,3,4,5,6,7].forEach(k=>line([[-.6,shY+2+k*1.5],[4,shY+2.2+k*1.5]],shade(inner,.6),.4)),ctx.restore();
      if(!F.turtle)neckV();
      const lap=F.jt==='leather'?'#0c0c0f':shade(main,.84);
      if(F.jt==='denim'){fill([[-1,shY-.9],[-2.8,shY-1],[-1.6,shY+3.6],[.2,shY+1.2]],lap);fill([[4.4,shY-.9],[6.2,shY-1],[5,shY+3.6],[3.4,shY+1.2]],lap);
        ctx.fillStyle=shade(main,.88);ctx.fillRect(-sW+1.3,shY+3.4,2.6,2.2);ctx.fillRect(sW-3.6,shY+3.4,2.6,2.2);ctx.save();ctx.setLineDash([.6,.5]);line([[-sW+1.3,shY+4.4],[-sW+3.9,shY+4.4]],'#e0b070',.35);line([[sW-3.6,shY+4.4],[sW-1,shY+4.4]],'#e0b070',.35);line([[-hW+.4,hem-1.4],[hW-.4,hem-1.4]],'#e0b070',.35);ctx.restore();
        ctx.fillStyle=shade(main,.8);ctx.fillRect(-hW,hem-1.6,hW*2,1.6);circ(-.5,shY+5,.32,'#c9a45c');circ(-.5,shY+8.5,.32,'#c9a45c');}
      else if(F.jt==='leather'){fill([[-1,shY-.9],[-3.6,shY-1.1],[-2.4,shY+5.2],[.1,shY+2.6]],lap);fill([[4.4,shY-.9],[6.8,shY-1.1],[5.6,shY+5.2],[3.4,shY+2.6]],lap);
        line([[-.4,shY+2.8],[-.1,hem-.4]],'#cfd4da',.45);for(const [x,y] of [[-2.6,shY+.4],[-2.1,shY+2.4],[5.8,shY+.4],[5.4,shY+2.4]])circ(x,y,.38,'#d8dde3');
        ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.ellipse(sW-2,shY+5,1,2.6,.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0c0c0f';ctx.fillRect(-hW,hem-1.4,hW*2,1.4);circ(1.6,hem-.7,.45,'#cfd4da');}
      else{fill([[-1,shY-.9],[-3,shY-.6],[-1.4,shY+5],[.3,shY+3]],lap);fill([[4.4,shY-.9],[6.4,shY-.6],[4.8,shY+5],[3.2,shY+3]],lap);circ(-.4,hipY-6,.4,shade(main,.6));circ(-.4,hipY-3.2,.4,shade(main,.6));}}
    else if(F.suit){fill([[-.6,shY-.9],[4,shY-.9],[1.7,shY+6.8]],'#f7f5f0');fill([[-.2,shY-.9],[1.2,shY+1.3],[.3,shY+1.6]],'#e6e2da');fill([[3.6,shY-.9],[2.2,shY+1.3],[3.1,shY+1.6]],'#e6e2da');
      fill([[1.15,shY-.4],[2.25,shY-.4],[2.05,shY+.9],[1.35,shY+.9]],shade(F.a2,.85));fill([[1.35,shY+.9],[2.05,shY+.9],[2.5,shY+6.2],[1.7,shY+7.3],[.9,shY+6.2]],F.a2);
      line([[-.6,shY-.9],[1.7,shY+6.8],[4,shY-.9]],shade(main,.62),.55);line([[-.6,shY-.9],[-2.4,shY+1.2],[-.4,shY+3.4]],shade(main,.7),.45);line([[4,shY-.9],[5.8,shY+1.2],[3.8,shY+3.4]],shade(main,.7),.45);
      circ(1.7,shY+9,.38,shade(main,.55));circ(1.7,shY+11.6,.38,shade(main,.55));ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(sW-3.2,shY+3,1.8,.5);}
    else if(F.overall){fill([[-.8,shY-.9],[1.6,shY+1.8],[4,shY-.9],[4.6,shY+.6],[1.6,shY+3],[-1.4,shY+.6]],shade(main,.8));line([[1.6,shY+1.8],[1.6,hipY-4]],shade(main,.55),.5);
      ctx.strokeStyle=shade(main,.6);ctx.lineWidth=.45;ctx.strokeRect(2.6,shY+3.4,2.6,2.4);ctx.fillStyle=shade(main,.7);ctx.fillRect(-wW,hipY-5.2,wW*2,1.3);ctx.fillStyle='#c9ccd2';ctx.fillRect(1,hipY-5.3,1.3,1.5);
      ctx.fillStyle=F.a2;ctx.fillRect(-wW-.2,hipY-8,wW*2+.4,.9);neckV();}
    else if(F.zip){fill([[-1,shY-2.6],[4.4,shY-2.6],[4.6,shY+.4],[-1.2,shY+.4]],shade(main,.92));line([[1.7,shY-2.6],[1.7,hem]],shade(main,.5),.45);line([[1.7,shY-2.6],[1.7,hem]],'rgba(255,255,255,.35)',.2);
      ctx.fillStyle=F.stripes;ctx.fillRect(sW-3,shY+2.6,1.4,1);}
    else if(F.tank||F.dress){ctx.fillStyle=skin;for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(sd<0?-sW+.8:sW-.6,shY+.2,1.8*bw,2.6,0,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=shade(skin,.92);ctx.beginPath();ctx.moveTo(-1.6,shY-.9);ctx.quadraticCurveTo(1.6,shY+(F.dress?4.6:3.6),5,shY-.9);ctx.fill();
      if(F.trim){line([[-1.6,shY-.9],[1.6,shY+3.2],[5,shY-.9]],F.trim,.6);ctx.fillStyle=F.trim;ctx.fillRect(-wW+.2,shY+6.2,wW*2-.4,1.1);}
      if(F.dress){line([[-wW+.4,hipY-5.4],[wW-.4,hipY-5.4]],shade(F.top,.65),.7);}}
    else if(F.hood){fill([[-3,shY+1.2],[-2.6,shY-2.2],[1.7,shY-3.4],[6,shY-2.2],[6.4,shY+1.2],[4.2,shY+.4],[1.7,shY-.6],[-.8,shY+.4]],shade(main,.78));
      line([[.5,shY+.3],[.3,shY+5.6]],'#f3f0e8',.42);line([[2.9,shY+.3],[3.1,shY+5.6]],'#f3f0e8',.42);circ(.3,shY+5.8,.32,'#cfd4da');circ(3.1,shY+5.8,.32,'#cfd4da');
      ctx.fillStyle='rgba(0,0,0,.08)';ctx.beginPath();ctx.moveTo(-wW+1.6,hem-1.6);ctx.lineTo(-wW+2.6,hem-6.6);ctx.lineTo(wW-2.6,hem-6.6);ctx.lineTo(wW-1.6,hem-1.6);ctx.closePath();ctx.fill();line([[-wW+1.6,hem-1.6],[-wW+2.6,hem-6.6],[wW-2.6,hem-6.6],[wW-1.6,hem-1.6]],'rgba(0,0,0,.18)',.4);}
    else if(!F.turtle)neckV();
    if(F.turtle){ctx.fillStyle=shade(F.top,.94);ctx.beginPath();ctx.moveTo(-1,shY-3.4);ctx.lineTo(4.2,shY-3.4);ctx.quadraticCurveTo(4.8,shY-1,4.6,shY+.6);ctx.quadraticCurveTo(1.7,shY+1.6,-1.2,shY+.6);ctx.quadraticCurveTo(-1.4,shY-1,-1,shY-3.4);ctx.fill();
      line([[-1.1,shY-1.6],[4.4,shY-1.6]],shade(F.top,.75),.4);if(F.knit){ctx.save();ctx.globalAlpha=.25;for(let x=-.6;x<4.4;x+=.9)line([[x,shY-3.2],[x,shY+.4]],shade(F.top,.6),.3);ctx.restore();}}
    if(F.blouse){ctx.fillStyle='#fbf9f4';ctx.beginPath();ctx.ellipse(.4,shY+.1,1.7,1,.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(3,shY+.1,1.7,1,-.3,0,Math.PI*2);ctx.fill();circ(1.7,shY+3,.3,shade(F.top,.6));circ(1.7,shY+5.4,.3,shade(F.top,.6));}
    if(F.acc.has('cadena')){ctx.strokeStyle='#d9a93a';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(-.9,shY-.6);ctx.quadraticCurveTo(1.7,shY+7.2,4.3,shY-.6);ctx.stroke();ctx.strokeStyle='#fde68a';ctx.lineWidth=.3;ctx.setLineDash([.5,.6]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#f2c94c';ctx.beginPath();ctx.moveTo(1.7,shY+3.4);ctx.lineTo(2.6,shY+4.6);ctx.lineTo(1.7,shY+5.8);ctx.lineTo(.8,shY+4.6);ctx.closePath();ctx.fill();}
  }else{
    if(F.hood){ctx.fillStyle=shade(main,.8);ctx.beginPath();ctx.ellipse(.6,shY+1.8,4,3.2,0,0,Math.PI*2);ctx.fill();line([[.6,shY-.6],[.6,shY+4.6]],shade(main,.6),.4);}
    if(F.turtle){ctx.fillStyle=shade(F.top,.9);ctx.fillRect(-1.2,shY-3.4,5.6,3.6);}
    if(F.zip||F.overall||F.suit||F.jacket)line([[.6,shY+1],[.6,hem-.3]],'rgba(0,0,0,.14)',.4);
    if(F.jt==='leather'||F.jt==='denim'){ctx.fillStyle=F.jt==='leather'?'#0c0c0f':shade(main,.8);ctx.fillRect(-hW,hem-1.5,hW*2,1.5);}
  }
  if(F.acc.has('bolso')){const bc=lumOf(F.top)<.25?'#7a4a2a':'#2b2420';ctx.strokeStyle=shade(bc,.85);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(sW-1.2,shY-.6);ctx.lineTo(-wW-.6,hipY-4.4);ctx.stroke();
    ctx.fillStyle=bc;roundRect(-wW-3,hipY-5.4,3.8,3.3,.8);ctx.fill();ctx.fillStyle=shade(bc,1.25);ctx.fillRect(-wW-3,hipY-5.4,3.8,1.2);circ(-wW-1.1,hipY-4.1,.3,'#d9a93a');}
  ctx.restore();}
function ofHead(F,hx,hy,front,style,tt){const A=F.acc,lift=style==='afro'?2.6:style==='rizos'?1.2:0,col=F.capCol;
  const grad=(y0,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,1.2));g.addColorStop(1,shade(col,.82));return g;};
  if(A.has('gorro')){const t=hy-11.4-lift;ctx.fillStyle=grad(t,hy-2);ctx.beginPath();ctx.moveTo(hx-5.9-lift*.5,hy-2.6);ctx.bezierCurveTo(hx-6.6-lift*.4,t+1,hx+6.8+lift*.4,t,hx+6+lift*.4,hy-2.6);ctx.closePath();ctx.fill();
    ctx.fillStyle=shade(col,.86);roundRect(hx-6.4-lift*.5,hy-4.4,12.8+lift,2.6,1.1);ctx.fill();ctx.save();ctx.globalAlpha=.3;ctx.strokeStyle=shade(col,.55);ctx.lineWidth=.35;ctx.beginPath();for(let x=hx-5.6-lift*.5;x<hx+6+lift*.5;x+=1.1){ctx.moveTo(x,hy-4.2);ctx.lineTo(x,hy-2);}ctx.stroke();ctx.restore();}
  else if(A.has('gorra')){const t=hy-10.2-lift;
    if(F.capBack&&front){ctx.fillStyle=shade(col,.7);ctx.beginPath();ctx.moveTo(hx-3.6,hy-3.6);ctx.quadraticCurveTo(hx-10,hy-5.4,hx-10.6,hy-3);ctx.quadraticCurveTo(hx-7,hy-2,hx-3.6,hy-2.4);ctx.closePath();ctx.fill();}
    ctx.fillStyle=grad(t,hy-2);ctx.beginPath();ctx.moveTo(hx-5.8-lift*.4,hy-2.4);ctx.bezierCurveTo(hx-6.2-lift*.4,t+1.2,hx+6.4+lift*.4,t+.8,hx+5.9+lift*.4,hy-2.4);ctx.closePath();ctx.fill();
    ctx.strokeStyle=shade(col,.62);ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(hx+.6,t+.6);ctx.quadraticCurveTo(hx+1.6,hy-6,hx+1.2,hy-2.6);ctx.stroke();circ(hx+.4,t+.7,.7,shade(col,.7));
    if(front&&!F.capBack){ctx.fillStyle=shade(col,.78);ctx.beginPath();ctx.moveTo(hx+.6,hy-3);ctx.quadraticCurveTo(hx+9.6,hy-4,hx+10.4,hy-1.8);ctx.quadraticCurveTo(hx+7,hy-.7,hx+1.2,hy-1.8);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(hx+1.5,hy-2.2,6,.5);}
    else if(front){ctx.fillStyle=shade(col,.55);ctx.beginPath();ctx.arc(hx+1.6,hy-2.4,1.6,Math.PI,0);ctx.fill();}
    else if(F.capBack){ctx.fillStyle=shade(col,.78);ctx.beginPath();ctx.ellipse(hx,hy-2.2,6.4,1.7,0,0,Math.PI);ctx.fill();}}
  if(A.has('gafasol')&&front){const e1=hx+.1,e2=hx+3.3,ey=hy+.2;ctx.fillStyle='#121216';for(const [e,r] of [[e1,1.65],[e2,1.45]]){ctx.beginPath();ctx.ellipse(e,ey,r,1.2,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#121216';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(e1+1.5,ey-.4);ctx.lineTo(e2-1.3,ey-.4);ctx.moveTo(e1-1.6,ey-.4);ctx.lineTo(hx-3,ey-.6);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(e1-.6,ey-.6,.9,.35);ctx.fillRect(e2-.5,ey-.6,.8,.35);}}
// ---- retrato: cuello y hombros según el conjunto ----
function ofPorBack(x,c,g,w,nw){const F=c.of,cx=g.cx,y0=g.chinY+13;
  if(F.hood){x.fillStyle=shade(F.top,.62);x.beginPath();x.moveTo(cx-nw-12,y0+4);x.quadraticCurveTo(cx-nw-11,g.chinY-2,cx,g.chinY-3.5);x.quadraticCurveTo(cx+nw+11,g.chinY-2,cx+nw+12,y0+4);x.closePath();x.fill();}
  if(F.jacket&&F.jt!=='leather'){x.fillStyle=shade(F.jacket,.7);x.beginPath();x.moveTo(cx-nw-7,y0+2);x.lineTo(cx-nw-2.5,g.chinY+3);x.lineTo(cx+nw+2.5,g.chinY+3);x.lineTo(cx+nw+7,y0+2);x.closePath();x.fill();}}
function ofPorFront(x,c,g,w,nw,y0){const F=c.of,cx=g.cx,s=c.skin;
  const P=(pts,col)=>{x.fillStyle=col;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();};
  const Ln=(pts,col,lw)=>{x.strokeStyle=col;x.lineWidth=lw||.6;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();};
  const shoulders=(col)=>{x.fillStyle=col;x.beginPath();x.moveTo(cx-w-8,101);x.bezierCurveTo(cx-w-6,y0+8,cx-w+2,y0+2,cx-nw-6,y0-1);x.quadraticCurveTo(cx,y0+5,cx+nw+6,y0-1);x.bezierCurveTo(cx+w-2,y0+2,cx+w+6,y0+8,cx+w+8,101);x.fill();};
  const crew=(col,dy)=>{x.fillStyle=shade(s,.9);x.beginPath();x.moveTo(cx-nw-3,y0-1);x.quadraticCurveTo(cx,y0+(dy||4),cx+nw+3,y0-1);x.quadraticCurveTo(cx,y0-2,cx-nw-3,y0-1);x.fill();Ln([[cx-nw-3.4,y0-1],[cx,y0+(dy||4)+.6],[cx+nw+3.4,y0-1]],shade(col,.7),1);};
  if(F.jacket){P([[cx-nw-4,y0-1.5],[cx+nw+4,y0-1.5],[cx+nw+1,101],[cx-nw-1,101]],F.top);
    if(F.turtle){}else crew(F.top,3.6);
    const lap=F.jt==='leather'?'#0d0d10':shade(F.jacket,.8);
    for(const sd of [-1,1]){P([[cx+sd*(nw+3.5),y0-1.8],[cx+sd*(nw+(F.jt==='leather'?10:7)),y0-1],[cx+sd*(nw+5.5),y0+12],[cx+sd*(nw+1.5),101]],lap);}
    if(F.jt==='leather'){for(const sd of [-1,1])for(const k of [0,1,2])x.fillStyle='#dfe3e8',x.beginPath(),x.arc(cx+sd*(nw+7.5-k*.8),y0+1+k*3.2,.7,0,7),x.fill();Ln([[cx+nw+2,y0+2],[cx+nw+.8,101]],'#cfd4da',.8);}
    if(F.jt==='denim'){x.save();x.setLineDash([1,.9]);for(const sd of [-1,1])Ln([[cx+sd*(nw+5),y0-1],[cx+sd*(nw+7),y0+11]],'#e0b070',.5);x.restore();}}
  else if(F.suit){P([[cx-nw-3,y0-1.2],[cx+nw+3,y0-1.2],[cx,y0+16]],'#f7f5f0');
    for(const sd of [-1,1])P([[cx+sd*1,y0+1],[cx+sd*(nw+.8),g.chinY+4],[cx+sd*(nw+3.6),y0+.6]],'#ffffff'),Ln([[cx+sd*1,y0+1],[cx+sd*(nw+.8),g.chinY+4],[cx+sd*(nw+3.6),y0+.6]],'#d8d3ca',.5);
    P([[cx-2.2,y0-.4],[cx+2.2,y0-.4],[cx+1.6,y0+3],[cx-1.6,y0+3]],shade(F.a2,.85));P([[cx-1.6,y0+3],[cx+1.6,y0+3],[cx+2.8,101],[cx-2.8,101]],F.a2);
    for(const sd of [-1,1])Ln([[cx+sd*(nw+3),y0-1.2],[cx+sd*2.4,y0+16]],shade(F.top,.6),.8);}
  else if(F.hood){x.strokeStyle=shade(F.top,.8);x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(cx-nw-7,y0+1);x.quadraticCurveTo(cx,y0+8,cx+nw+7,y0+1);x.stroke();x.strokeStyle=shade(F.top,.65);x.lineWidth=.8;x.beginPath();x.moveTo(cx-nw-5,y0-1.2);x.quadraticCurveTo(cx,y0+5,cx+nw+5,y0-1.2);x.stroke();
    for(const sd of [-1,1]){Ln([[cx+sd*3.2,y0+4],[cx+sd*3.6,101]],'#f3f0e8',1);x.fillStyle='#cfd4da';x.fillRect(cx+sd*3.6-.6,y0+13,1.2,3);}}
  else if(F.overall){for(const sd of [-1,1])P([[cx+sd*.5,y0+3],[cx+sd*(nw+1),g.chinY+5],[cx+sd*(nw+6.5),y0+1]],shade(F.top,.82));Ln([[cx,y0+3],[cx,101]],shade(F.top,.5),.8);x.fillStyle=F.a2;x.fillRect(cx-w-6,y0+12,(w+6)*2,2.4);}
  else if(F.zip){P([[cx-nw-2.6,g.chinY+3],[cx+nw+2.6,g.chinY+3],[cx+nw+5,y0+1.5],[cx-nw-5,y0+1.5]],shade(F.top,.95));Ln([[cx,g.chinY+3],[cx,101]],shade(F.top,.5),.8);x.fillStyle='#cfd4da';x.fillRect(cx-.7,y0-2,1.4,2.6);
    for(const sd of [-1,1]){Ln([[cx+sd*(nw+9),y0+1.5],[cx+sd*(w+6),y0+12]],F.stripes,1.6);}}
  else if(F.tank||F.dress){shoulders(s);x.fillStyle=shade(s,.82);x.beginPath();x.ellipse(cx,y0-1.2,nw+4,2,0,0,Math.PI);x.fill();
    const col=F.top;x.fillStyle=col;x.beginPath();x.moveTo(cx-w+4,101);x.quadraticCurveTo(cx-w+6,y0+10,cx-nw-4,y0+(F.dress?10:6));x.quadraticCurveTo(cx,y0+(F.dress?13:11),cx+nw+4,y0+(F.dress?10:6));x.quadraticCurveTo(cx+w-6,y0+10,cx+w-4,101);x.fill();
    for(const sd of [-1,1])Ln([[cx+sd*(nw+(F.dress?5:6)),y0+(F.dress?10:6)],[cx+sd*(nw+(F.dress?7:9)),y0-1.2]],col,F.dress?1.6:4);
    if(F.trim)Ln([[cx-nw-4,y0+6],[cx,y0+11],[cx+nw+4,y0+6]],F.trim,1);}
  if(F.turtle){P([[cx-nw-1.2,g.chinY+3],[cx+nw+1.2,g.chinY+3],[cx+nw+4.5,y0+2.2],[cx-nw-4.5,y0+2.2]],shade(F.top,.96));Ln([[cx-nw-2.6,y0-3.5],[cx+nw+2.6,y0-3.5]],shade(F.top,.72),.6);
    if(F.knit){x.save();x.globalAlpha=.3;for(let k=-nw-1;k<=nw+1;k+=1.6)Ln([[cx+k,g.chinY+3.4],[cx+k*1.25,y0+2]],shade(F.top,.55),.5);x.restore();}}
  if(F.blouse){for(const sd of [-1,1]){x.fillStyle='#fbf9f4';x.beginPath();x.ellipse(cx+sd*(nw-.5),y0+.4,nw*.75,2.4,sd*.25,0,Math.PI*2);x.fill();}}
  if(F.acc.has('cadena')){x.strokeStyle='#d9a93a';x.lineWidth=1.3;x.beginPath();x.moveTo(cx-nw-.6,y0-4);x.quadraticCurveTo(cx,y0+12,cx+nw+.6,y0-4);x.stroke();x.strokeStyle='#fde68a';x.lineWidth=.5;x.setLineDash([.8,1]);x.stroke();x.setLineDash([]);
    P([[cx,y0+3],[cx+2,y0+5.6],[cx,y0+8.2],[cx-2,y0+5.6]],'#f2c94c');}
  if(F.acc.has('bolso'))Ln([[cx+w-1,y0+.5],[cx-w+6,101]],lumOf(F.top)<.25?'#7a4a2a':'#2b2420',1.6);}
function ofPorHead(x,c,g){const F=c.of,A=F.acc,cx=g.cx,col=F.capCol,fw=g.fw,capY=g.eyeY-12.5,top=g.top-(c.hairStyle==='afro'||c.hairStyle==='hightop'?6:2);
  const gr=()=>{const q=x.createLinearGradient(0,top,0,capY);q.addColorStop(0,shade(col,1.18));q.addColorStop(1,shade(col,.8));return q;};
  if(A.has('gorro')){x.fillStyle=gr();x.beginPath();x.moveTo(cx-fw-2.6,capY+1);x.bezierCurveTo(cx-fw-3,top-8,cx+fw+3,top-8,cx+fw+2.6,capY+1);x.closePath();x.fill();
    x.fillStyle=shade(col,.86);x.beginPath();x.moveTo(cx-fw-3,capY-5);x.quadraticCurveTo(cx,capY-7,cx+fw+3,capY-5);x.lineTo(cx+fw+3,capY+2);x.quadraticCurveTo(cx,capY,cx-fw-3,capY+2);x.closePath();x.fill();
    x.save();x.globalAlpha=.3;x.strokeStyle=shade(col,.5);x.lineWidth=.6;x.beginPath();for(let k=-fw-2;k<=fw+2;k+=1.8){x.moveTo(cx+k,capY-5.5+Math.abs(k)*.05);x.lineTo(cx+k,capY+1.4-Math.abs(k)*.05);}x.stroke();x.restore();}
  else if(A.has('gorra')){x.fillStyle=gr();x.beginPath();x.moveTo(cx-fw-2,capY+1.5);x.bezierCurveTo(cx-fw-2.4,top-5,cx+fw+2.4,top-5,cx+fw+2,capY+1.5);x.quadraticCurveTo(cx,capY-.5,cx-fw-2,capY+1.5);x.fill();
    x.strokeStyle=shade(col,.62);x.lineWidth=.6;x.beginPath();x.moveTo(cx,top-2.4);x.lineTo(cx,capY);x.moveTo(cx-fw*.55,top+1);x.quadraticCurveTo(cx-fw*.6,capY-3,cx-fw*.5,capY);x.moveTo(cx+fw*.55,top+1);x.quadraticCurveTo(cx+fw*.6,capY-3,cx+fw*.5,capY);x.stroke();
    x.fillStyle=shade(col,.75);x.beginPath();x.arc(cx,top-2.2,1.3,0,7);x.fill();
    if(F.capBack){x.fillStyle=c.hair;x.beginPath();x.arc(cx,capY+.6,3.6,Math.PI,0);x.fill();x.strokeStyle=shade(col,.6);x.lineWidth=1;x.beginPath();x.moveTo(cx-3.6,capY+.6);x.lineTo(cx+3.6,capY+.6);x.stroke();}
    else{x.fillStyle=shade(col,.72);x.beginPath();x.moveTo(cx-fw-3.4,capY+1.2);x.quadraticCurveTo(cx,capY-1.6,cx+fw+3.4,capY+1.2);x.quadraticCurveTo(cx+fw+2,capY+5.4,cx,capY+6.2);x.quadraticCurveTo(cx-fw-2,capY+5.4,cx-fw-3.4,capY+1.2);x.fill();
      x.fillStyle='rgba(0,0,0,.22)';x.beginPath();x.ellipse(cx,capY+6.6,fw+1,1.2,0,0,Math.PI*2);x.fill();}}
  if(A.has('gafasol')){const dx=g.eyeDX,ey=g.eyeY+.3;for(const sd of [-1,1]){const lx=cx+sd*dx;const q=x.createLinearGradient(0,ey-3,0,ey+3);q.addColorStop(0,'#2a2a33');q.addColorStop(1,'#0c0c10');x.fillStyle=q;x.beginPath();x.ellipse(lx,ey,3.9,2.9,0,0,Math.PI*2);x.fill();
      x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(lx-1.2,ey-1.2,1.4,.5,-.4,0,Math.PI*2);x.fill();}
    x.strokeStyle='#121216';x.lineWidth=.9;x.beginPath();x.moveTo(cx-dx+3.8,ey-1);x.quadraticCurveTo(cx,ey-2.2,cx+dx-3.8,ey-1);x.moveTo(cx-dx-3.8,ey-.6);x.lineTo(cx-fw,ey-1.2);x.moveTo(cx+dx+3.8,ey-.6);x.lineTo(cx+fw,ey-1.2);x.stroke();}}
{const _rfc=rfChar;rfChar=function(ch,md,nobg){const c=_rfc(ch,md,nobg);const F=outfitSpec(ch);if(F){c.of=F;c.shirt=F.jacket||(F.tank||F.dress?ch.skin:F.top);if(F.jacket||F.suit||F.zip||F.turtle||F.hood||F.overall)c.cuello=null;}return c;};}
// ---- creador: sección «Estilo» ----
function styleSection(c){const k=OUTFITS[c.outfit]?c.outfit:'basico';
  let h=`<div class="clab">Estilo</div><div class="chips">${Object.entries(OUTFITS).map(([key,v])=>`<button class="mini${k===key?' sel':''}" data-of="${key}">${v.e} ${v.n}</button>`).join('')}</div>`;
  const sw=(key,list,lab)=>`<div class="sub" style="font-size:11px;margin:4px 0 2px">${lab}</div><div class="swatches">${list.map(col=>`<div class="sw${c[key]===col?' on':''}" data-k="${key}" data-v="${col}" style="background:${col}"></div>`).join('')}</div>`;
  if(k==='mono')h+=`<div class="sub" style="font-size:11px;margin:4px 0 2px">Un solo color, de la cabeza a los pies</div><div class="swatches">${MONOC.map(([col,n])=>`<div class="sw${c.shirt===col?' on':''}" data-mono="${col}" title="${n}" style="background:${col}"></div>`).join('')}</div>`;
  else for(const [key,lab] of OSLOTS[k])h+=sw(key,k==='basico'&&key==='shirt'?SHIRTC:k==='basico'&&key==='pants'?PANTSC:OUTC,lab);
  const acc=c.acc||[];h+=`<div class="sub" style="font-size:11px;margin:6px 0 2px">Complementos</div><div class="chips">${Object.entries(ACCS).map(([a,n])=>`<button class="mini${acc.includes(a)?' sel':''}" data-acc="${a}">${n}</button>`).join('')}${acc.includes('gorra')?`<button class="mini${c.capBack?' sel':''}" data-capback="1">↩️ Gorra del revés</button>`:''}</div>`;
  if(acc.includes('gorra')||acc.includes('gorro'))h+=sw('capc',OUTC,acc.includes('gorra')?'Color de la gorra':'Color del gorro');
  return h;}
{const _rcr=renderCreator;renderCreator=function(diff,edit){if(cre){if(!cre.outfit)cre.outfit='basico';if(['chandal','traje','obrero','vestido'].includes(cre.outfit))cre.pants=cre.shirt;cre.ofSig=ofSig(cre);}
  _rcr(diff,edit);
  card.querySelectorAll('[data-of]').forEach(b=>b.onclick=()=>{dressUp(cre,b.dataset.of);renderCreator(diff,edit);});
  card.querySelectorAll('[data-mono]').forEach(b=>b.onclick=()=>{const v=b.dataset.mono;cre.shirt=cre.pants=cre.shoes=cre.acc2=v;renderCreator(diff,edit);});
  card.querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{const a=b.dataset.acc;let L_=(cre.acc||[]).slice();if(L_.includes(a))L_=L_.filter(x=>x!==a);else{if(a==='gorra')L_=L_.filter(x=>x!=='gorro');if(a==='gorro')L_=L_.filter(x=>x!=='gorra');L_.push(a);}cre.acc=L_;renderCreator(diff,edit);});
  card.querySelectorAll('[data-capback]').forEach(b=>b.onclick=()=>{cre.capBack=!cre.capBack;renderCreator(diff,edit);});};}
