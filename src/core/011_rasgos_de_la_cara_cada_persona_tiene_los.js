// ---------- rasgos de la cara: cada persona tiene los suyos ----------
const FACE_SHAPES=['oval','redonda','alargada','cuadrada','corazon','pera'];
const NOSES=['boton','recta','grande','aguilena','ancha','respingona','patata'];
const EYES=['almendra','redondos','caidos','pequenos','grandes'];
const BROWS=['finas','normales','gruesas','arqueadas','rectas'];
const MOUTHS=['normal','fina','carnosa','ancha','pequena'];
function seedRng(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296;};}
function makeFace(ch){const r=seedRng(ch.faceSeed||((ch.name||'')+(ch.skin||'')));const P_=a=>a[Math.floor(r()*a.length)];
  return {shape:P_(FACE_SHAPES),nose:P_(NOSES),ns:0.85+r()*0.4,eyes:P_(EYES),es:0.85+r()*0.35,ed:7.6+r()*2.6,brow:P_(BROWS),mouth:P_(MOUTHS),mw:0.85+r()*0.35,ears:r()<.18?'soplillo':r()<.5?'grandes':'normales',
    freckles:r()<.2,mole:r()<.22?[38+r()*24,52+r()*14]:null,dimples:r()<.25,chin:(ch.build==='ancha'&&r()<.6)||r()<.1,lids:r()<.3,bags:r()<.25,gap:r()<.08,lashes:ch.g==='f'?r()<.85:r()<.1,tilt:(r()-.5)*.08,cheek:0.6+r()*0.6};}
const faceOf=ch=>{if(!ch.face)ch.face=makeFace(ch);return ch.face;};
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

