// ---------- dibujo de los muebles nuevos ----------
var MDRAW={};
{
const Q=(o,c)=>O_COL(o,c);
const legs4=(a0,b0,a1,b1,z,col,w=.04)=>{for(const [a,b] of [[a0,b0],[a1-w,b0],[a0,b1-w],[a1-w,b1-w]])lp(a,b,a+w,b+w,0,z,col);};
const knob=(a,b,z,col='#e9c46a')=>{if(lvis(0,1)){const [x,y]=LP(a,b,z);circ(x,y,1.3,col);}};
// cara en el plano b (frente), con forma libre: puntos [a,z]
const faceB=(b,pts,col)=>{poly(pts.map(([a,z])=>LP(a,b,z)),col);};
const ellB=(ca,b,cz,ra,rz,col,n=18)=>{const p=[];for(let k=0;k<n;k++){const t=k/n*Math.PI*2;p.push(LP(ca+Math.cos(t)*ra,b,cz+Math.sin(t)*rz));}poly(p,col);};
const ellTop=(ca,cb,r,z,col,n=20)=>{const p=[];for(let k=0;k<n;k++){const t=k/n*Math.PI*2;p.push(LP(ca+Math.cos(t)*r,cb+Math.sin(t)*r,z));}poly(p,col);};
// prisma de base poligonal (en coordenadas locales), con las caras laterales visibles
function lext(pts,z0,z1,col){
  const n=pts.length;let ar=0;for(let k=0;k<n;k++){const [a,b]=pts[k],[c,d]=pts[(k+1)%n];ar+=a*d-c*b;}const sg=ar>0?1:-1;
  const sides=[];for(let k=0;k<n;k++){const [a,b]=pts[k],[c,d]=pts[(k+1)%n];const [nx,ny]=Ldir((d-b)*sg,-(c-a)*sg);if(nx+ny>0)sides.push([ldepth((a+c)/2,(b+d)/2),a,b,c,d,nx-ny]);}
  sides.sort((p,q)=>p[0]-q[0]);for(const [,a,b,c,d,sh] of sides)poly([LP(a,b,z0),LP(c,d,z0),LP(c,d,z1),LP(a,b,z1)],shade(col,sh>0?.66:.82));
  poly(pts.map(([a,b])=>LP(a,b,z1)),col);}
const circPts=(ca,cb,r,n=20)=>Array.from({length:n},(_,k)=>[ca+Math.cos(k/n*Math.PI*2)*r,cb+Math.sin(k/n*Math.PI*2)*r]);
function headOnPillow(a,b,z){const [hx,hy]=LP(a,b,z);const c=CH();ctx.fillStyle=c.style==='calvo'?c.skin:c.hair;ctx.beginPath();ctx.ellipse(hx,hy-1,9,5.5,0,0,Math.PI*2);ctx.fill();circ(hx,hy+2,6.5,c.skin);ctx.fillStyle='#3b3247';ctx.fillRect(hx-4,hy+2,3,1);ctx.fillRect(hx+1.5,hy+2,3,1);bubbleAt=[hx,hy-14];}
// ¿la pared de detrás está cortada (vista baja)? para colgar cuadros o apoyarlos
function wallBehind(o,wx,wy){if(wx==null)return 0;const [dx,dy]=WDIR[o.r||0];const x=wx+dx,y=wy+dy;if(!inb(x,y))return 0;const w=S.wall[idx(x,y)];if(!(w===1||w===3))return 0;const [vx,vy]=wc2vc(x,y);return isCut(vx,vy)?1:2;}
const WOOD='#9c6845',DARKW='#5e3b26';
const sleeping=(u)=>u&&S.sim.use&&S.sim.use.goal==='energia';

MDRAW.encimera=(o,i,tt,u)=>{const top=o.q===4?'#efece6':o.q<=2?'#c9c3b8':'#5f6268',cab=Q(o,'#ece6d8');
  lp(.04,.1,.96,.92,0,22,cab);lp(.02,.06,.98,.95,22,25,top);
  lfB(.08,.48,.921,3,19,shade(cab,.95));lfB(.52,.92,.921,3,19,shade(cab,.95));knob(.44,.922,15,o.q===4?'#d4af37':'#9aa5ad');knob(.56,.922,15,o.q===4?'#d4af37':'#9aa5ad');
  lp(.02,.06,.98,.12,25,36,'#dfe9ec');
  ltop(.18,.35,.55,.68,25.3,'#d4a373');const [x,y]=LP(.32,.5,26);circ(x,y,2.6,'#e05a4a');circ(x+5,y+1,2,'#7cc46a');
  const [a,b]=LP(.42,.45,26),[c,d]=LP(.52,.62,26);capsule(a,b,c,d,1.6,'#c0c6cc');
  if(u){const [p,q]=LP(.75,.55,26.5);ctx.fillStyle='#e9c48a';ctx.beginPath();ctx.ellipse(p,q,7,3,0,0,Math.PI*2);ctx.fill();circ(p-2,q-1.5,1.6,'#e05a4a');}
  else{lcyl(.78,.5,.07,25,33,'#5bc0be','#3b8f8d');}};
MDRAW.micro=(o,i,tt,u)=>{const w=Q(o,'#c9b79c');lp(.12,.2,.88,.85,0,20,w);lp(.1,.18,.9,.87,20,22,shade(w,1.08));lfB(.16,.84,.851,3,17,shade(w,.92));knob(.5,.852,14);
  const c=Q(o,o.q===4?'#3b3f46':'#ececec');lp(.18,.28,.82,.72,22,38,c);
  lfB(.22,.6,.721,24.5,35.5,u?`rgb(255,${200+Math.sin(tt*6)*20|0},120)`:'#2b2f36');lfB(.64,.78,.721,25,36,shade(c,.85));
  if(lvis(0,1)){for(let k=0;k<3;k++){const [x,y]=LP(.71,.722,33-k*3);circ(x,y,1,k===0&&u?'#7cfc8a':'#555');}}
  if(u&&lvis(0,1)){const [x,y]=LP(.41,.722,28);ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x+Math.sin(tt*3)*3,y,5,1.6,0,0,Math.PI*2);ctx.fill();}};
MDRAW.lavavaj=(o,i,tt)=>{const c=Q(o,o.q===4?'#c7ccd1':'#e4e9ec');lp(.08,.12,.92,.9,0,24,c);lp(.06,.1,.94,.92,24,26,o.q===4?'#3b3f46':'#6d6f73');
  lfB(.1,.9,.901,19,22.5,'#2b2f36');lfB(.3,.7,.902,16,17.2,'#9aa5ad');if(lvis(0,1)){const [x,y]=LP(.8,.903,21);circ(x,y,1,'#7cfc8a');}
  lfB(.1,.9,.901,1,3,shade(c,.7));};
MDRAW.cafetera=(o,i,tt,u)=>{const w=Q(o,'#a47148');legs4(.22,.3,.78,.78,14,shade(w,.8));lp(.2,.28,.8,.8,14,17,w);lp(.24,.32,.76,.76,4,5.5,shade(w,.9));
  const c=Q(o,o.q===4?'#c0c6cc':'#3b3f46');lp(.34,.38,.66,.6,17,34,c);lp(.32,.36,.68,.62,34,36,shade(c,1.2));lp(.44,.58,.56,.64,26,29,'#222');
  lcyl(.5,.68,.06,17,21.5,'#fff','#6b4a2b');lcyl(.28,.42,.05,17,23,'#e8e2d4','#e05a4a');if(lvis(0,1)){const [x,y]=LP(.58,.601,31);circ(x,y,1.1,u?'#7cfc8a':'#e05a4a');}};
MDRAW.mesacoc=(o,i,tt)=>{const w=Q(o,'#e8e2d4');legs4(.12,.12,.88,.88,20,shade(w,.75),.05);lp(.08,.08,.92,.92,20,23,w);
  for(let r=0;r<4;r++)for(let k=0;k<4;k++)if((r+k)%2)ltop(.1+k*.2,.1+r*.2,.3+k*.2,.3+r*.2,23.2,o.q<=1?'#b98b84':'#d9534f');
  const s=S.sim;if(s.use&&s.use.type==='_meal'&&s.use.i===i){const se=s.use.seat;const sa=se!=null?[(se%N)-(i%N),((se/N|0)-(i/N|0))]:[0,1];const [u0,v0]=w2v((i%N)+.5+sa[0]*.25,(i/N|0)+.5+sa[1]*.25);const [px,py]=P(u0,v0,23.5);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(px,py,7,3.5,0,0,Math.PI*2);ctx.fill();circ(px-1,py-.5,2.2,'#e07a3f');circ(px+2,py,1.6,'#7cc46a');}
  else{lcyl(.5,.5,.06,23,29,'#f4f4f4');const [x,y]=LP(.5,.5,30);circ(x,y-1,2.2,'#ffd166');}};
MDRAW.banera=(o,i,tt,u,anaOn)=>{const c=Q(o,o.q===4?'#fbfbfb':'#f4f6f7'),ft=o.q===4?'#d4af37':'#b8c0c6';const L=[];
  for(const [a,b] of [[.1,.14],[.86,.14],[.1,.82],[.86,.82]])L.push([ldepth(a,b)-.5,()=>lcyl(a+.02,b+.02,.04,0,4,ft)]);
  L.push([ldepth(.5,.1),()=>lp(.04,.08,.96,.16,3,17,c)]);L.push([ldepth(.08,.5),()=>lp(.04,.08,.12,.92,3,17,c)]);L.push([ldepth(.92,.5),()=>lp(.88,.08,.96,.92,3,17,c)]);
  L.push([ldepth(.5,.5)-.01,()=>{lp(.12,.16,.88,.84,3,5,'#e3eef2');lp(.42,.1,.58,.16,17,20,'#9aa7b1');}]);
  if(u)L.push([ldepth(.5,.5),anaOn(.5,.52,4,{pose:'sit'})]);
  L.push([ldepth(.5,.92),()=>{lp(.04,.84,.96,.92,3,17,c);ltop(.12,.16,.88,.84,13,u?'rgba(170,215,235,.72)':'#bfe0ee');
    for(let k=0;k<7;k++){const a=.18+hash((i||1)*3+k)*.64,b=.2+hash((i||1)*7+k)*.6;const [x,y]=LP(a,b,13.4);circ(x,y,2+hash(k)*2.5+(u?Math.sin(tt*2+k):0),'rgba(255,255,255,.9)');}}]);
  layers(L);};
MDRAW.lavabo=(o,i,tt,u)=>{const c=Q(o,'#f4f6f7');lp(.22,.02,.78,.07,20,56,o.q===4?'#e8e2d4':'#dfe7ea');lfB(.27,.73,.071,36,53,o.q<=1?'#b9c3c8':'#dbe9f1');
  if(lvis(0,1)){const sh=((tt*.25)%1.6)-.3;if(sh>0&&sh<1){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();const [a,b]=LP(.3+sh*.3,.072,38),[e,f]=LP(.38+sh*.3,.072,51);ctx.moveTo(a,b);ctx.lineTo(e,f);ctx.stroke();}}
  lcyl(.5,.38,.08,0,22,c);lp(.2,.1,.8,.62,22,30,c);ltop(.27,.16,.73,.56,30.1,u?'#a8d8ef':'#d2e4ea');
  lp(.47,.1,.53,.18,30,37,'#9aa7b1');lp(.47,.16,.53,.26,35,37,'#9aa7b1');lcyl(.3,.15,.03,30,33,o.q===4?'#d4af37':'#9aa7b1');};
MDRAW.lavadora=(o,i,tt,u)=>{const c=Q(o,'#f2f4f5');lp(.1,.12,.9,.9,0,34,c);lp(.08,.1,.92,.92,34,35.5,shade(c,1.03));
  lfB(.12,.88,.901,28,33,'#dde2e6');if(lvis(0,1)){const [x,y]=LP(.75,.902,30.5);circ(x,y,2.2,'#9aa5ad');circ(...LP(.25,.902,30.5),1,u?'#7cfc8a':'#ccc');
    ellB(.5,.902,15,.24,11,'#9aa5ad');ellB(.5,.903,15,.19,8.6,u?`hsl(${(tt*90)%360|0},45%,62%)`:'#3a4652');
    if(u){ctx.fillStyle='rgba(255,255,255,.55)';const [p,q]=LP(.5+Math.cos(tt*7)*.1,.904,15+Math.sin(tt*7)*4);circ(p,q,2.4,'rgba(255,255,255,.6)');}}};
MDRAW.camamat=(o,i,tt,u)=>{const wood=Q(o,o.q===4?'#4a3326':'#8a5d39'),bl=Q(o,'#a35d6a');lp(.02,.05,.98,.97,0,9,wood);lp(.05,.12,.95,.94,9,15,'#fbfaf6');
  const br=u?Math.sin(tt*1.6)*.8:0;const L=[];
  L.push([ldepth(.5,.08),()=>{lp(.02,.03,.98,.12,0,34,wood);lp(.06,.11,.94,.125,12,30,o.q===4?'#c9a24a':shade(wood,1.25));if(o.q===4&&lvis(0,1))for(let k=0;k<6;k++)circ(...LP(.14+k*.14,.126,22),1.2,'#8a6a2a');}]);
  L.push([ldepth(.5,.25),()=>{lp(.1,.16,.46,.32,15,u?18:20,'#ffffff');lp(.54,.16,.9,.32,15,20,'#ffffff');}]);
  if(u&&sleeping(u))L.push([ldepth(.5,.3)+.001,()=>headOnPillow(.28,.26,20)]);
  L.push([ldepth(.5,.66),()=>{lp(.06,.4,.94,.95,15,17.5+br,bl);lp(.06,.4,.94,.48,15,18.5+br,'#f2ece4');lp(.06,.88,.94,.95,9,17.5,shade(bl,.85));}]);
  layers(L);};
MDRAW.litera=(o,i,tt,u)=>{const w=Q(o,'#8a5d39'),b1=Q(o,'#5b8fb9'),b2=Q(o,'#e9c46a');const L=[];
  for(const [a,b] of [[.04,.04],[.9,.04],[.04,.9],[.9,.9]])L.push([ldepth(a+.03,b+.03)+(b>.5?.3:-.3),()=>lp(a,b,a+.06,b+.06,0,58,w)]);
  L.push([ldepth(.5,.5)-.02,()=>{lp(.06,.06,.94,.94,4,8,shade(w,.9));lp(.08,.08,.92,.92,8,13,'#fbfaf6');lp(.2,.1,.8,.24,13,16,'#fff');lp(.08,.4,.92,.92,13,15,b1);}]);
  if(u&&sleeping(u))L.push([ldepth(.5,.5)-.01,()=>headOnPillow(.5,.2,16)]);
  L.push([ldepth(.5,.5),()=>{lp(.06,.06,.94,.94,32,36,w);lp(.08,.08,.92,.92,36,41,'#fbfaf6');lp(.2,.1,.8,.24,41,44,'#fff');lp(.08,.4,.92,.92,41,43,b2);lp(.06,.06,.94,.1,43,50,w);lp(.06,.9,.94,.94,43,50,w);}]);
  L.push([ldepth(.85,.96)+.4,()=>{lp(.7,.95,.73,.98,0,50,w);lp(.88,.95,.91,.98,0,50,w);for(let k=1;k<6;k++)lp(.7,.95,.91,.98,k*8,k*8+1.6,w);}]);
  layers(L);};
MDRAW.colchon=(o,i,tt,u)=>{lp(.08,.1,.92,.92,0,5,'#e8e4d8');lfB(.08,.92,.921,1,4,'#cfc8b6');
  for(let k=0;k<4;k++)ltop(.08,.2+k*.2,.92,.24+k*.2,5.05,'rgba(120,140,170,.25)');
  ctx.fillStyle='rgba(150,120,60,.28)';const [sx,sy]=LP(.66,.36,5.1);ctx.beginPath();ctx.ellipse(sx,sy,6,2.5,.3,0,Math.PI*2);ctx.fill();
  lp(.18,.14,.52,.3,5,8,'#f0ede4');if(u&&sleeping(u))headOnPillow(.34,.24,8);
  poly([LP(.14,.42,5.5),LP(.9,.38,6.5),LP(.88,.9,6),LP(.2,.9,7.5),LP(.1,.66,6)],'#7d8a6a');poly([LP(.2,.56,7.6),LP(.6,.5,7.2),LP(.55,.62,7.8)],'rgba(0,0,0,.12)');
  if(!u){const [x,y]=LP(.88,.14,0);ctx.fillStyle='#3b3f46';ctx.fillRect(x-3,y-6,6,6);}};
MDRAW.armario=(o,i,tt,u)=>{const w=Q(o,o.q===4?'#6b4a33':'#b07a4f');lp(.04,.1,.96,.62,0,56,w);lp(.02,.08,.98,.64,56,59,shade(w,1.1));lp(.04,.1,.96,.62,0,3,shade(w,.7));
  if(u&&lvis(0,1)){lfB(.08,.49,.621,4,54,'#3a2a1f');const cl=['#e76f51','#2a9d8f','#e9c46a','#8e44ad','#f4f1ea'];for(let k=0;k<5;k++)lfB(.1+k*.075,.16+k*.075,.622,22-hash(k)*8,50,cl[k]);lp(.08,.62,.1,.95,4,54,shade(w,.9));}
  else{lfB(.08,.49,.621,4,54,shade(w,.94));knob(.45,.623,30,o.q===4?'#d4af37':'#e9c46a');}
  lfB(.51,.92,.621,4,54,shade(w,.94));knob(.55,.623,30,o.q===4?'#d4af37':'#e9c46a');
  if(lvis(0,1)&&!u){lfB(.12,.45,.622,40,50,shade(w,1.06));lfB(.55,.88,.622,40,50,shade(w,1.06));}
  if(o.q<=1&&lvis(0,1)){ctx.strokeStyle='rgba(60,40,30,.5)';ctx.lineWidth=1;ctx.beginPath();const [a,b]=LP(.2,.623,8),[c,d]=LP(.35,.623,20);ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();}};
MDRAW.comoda=(o,i,tt)=>{const w=Q(o,'#b07a4f');legs4(.08,.32,.92,.8,4,shade(w,.7));lp(.06,.3,.94,.8,4,30,w);lp(.04,.28,.96,.82,30,32,o.q===4?'#efece6':shade(w,1.1));
  for(let k=0;k<3;k++){lfB(.1,.9,.801,6+k*8,12.5+k*8,shade(w,.95+k*.02));knob(.35,.802,9.2+k*8,o.q===4?'#d4af37':'#6b4a33');knob(.65,.802,9.2+k*8,o.q===4?'#d4af37':'#6b4a33');}
  lcyl(.25,.5,.06,32,40,'#5bc0be','#3b8f8d');{const [x,y]=LP(.25,.5,41);circ(x-2,y,2,'#ff8fab');circ(x+2,y-1,2,'#ffd166');}
  lp(.6,.42,.8,.46,32,42,'#3b3f46');lfB(.62,.78,.461,34,40,'#bfe0d4');lcyl(.78,.6,.04,32,34,'#e9c46a');};
MDRAW.mesilla=(o,i,tt,u,a,night)=>{const w=Q(o,'#a47148');lp(.26,.3,.74,.76,0,18,w);lp(.24,.28,.76,.78,18,20,shade(w,1.08));lfB(.3,.7,.761,10,16,shade(w,.92));knob(.5,.762,13);
  lcyl(.42,.48,.06,20,21.5,'#3b3f46');lp(.41,.47,.43,.49,21.5,28,'#3b3f46');const on=night>0.2;lcyl(.42,.48,.11,27,34,on?'#ffe7a8':'#f3e1b0',on?'#fff4cf':'#f6e8c3');
  lp(.55,.55,.7,.68,20,22,'#2e86de');lp(.56,.56,.69,.67,22,23,'#c0392b');};
MDRAW.cuna=(o,i,tt)=>{const w=Q(o,'#f4efe6');const baby=(S.kids||[]).find(k=>kidAge(k)<3);const L=[];
  const bars=(b,z0=8,z1=27)=>{for(let k=0;k<=7;k++){const a=.14+k*.1;lp(a,b,a+.025,b+.025,z0,z1,w);}lp(.12,b-.005,.88,b+.03,z1,z1+2,shade(w,.95));};
  L.push([ldepth(.5,.15),()=>{for(const [a,b] of [[.12,.14],[.84,.14]])lp(a,b,a+.04,b+.04,0,30,shade(w,.92));bars(.15);}]);
  L.push([ldepth(.13,.5),()=>{for(let k=0;k<=6;k++)lp(.13,.18+k*.1,.155,.205+k*.1,8,27,w);}]);
  L.push([ldepth(.87,.5),()=>{for(let k=0;k<=6;k++)lp(.845,.18+k*.1,.87,.205+k*.1,8,27,w);}]);
  L.push([ldepth(.5,.5),()=>{lp(.13,.16,.87,.84,5,9,'#ffffff');if(baby){const [x,y]=LP(.5,.32,10);circ(x,y,4.6,baby.ch?.skin||CH().skin);ctx.fillStyle='#3b3247';ctx.fillRect(x-2.5,y,1.5,.8);ctx.fillRect(x+1,y,1.5,.8);
      lp(.2,.42,.8,.8,9,11.5,baby.g==='m'?'#9ec5f0':baby.g==='f'?'#f5b5c8':'#c5e8b7');}else lp(.2,.42,.8,.8,9,10.5,'#f6e0b5');}]);
  L.push([ldepth(.5,.85),()=>{for(const [a,b] of [[.12,.82],[.84,.82]])lp(a,b,a+.04,b+.04,0,30,shade(w,.92));bars(.83);}]);
  L.push([ldepth(.5,.85)+.01,()=>{const [x,y]=LP(.5,.5,46);ctx.strokeStyle='#bbb';ctx.lineWidth=1;const [px,py]=LP(.86,.15,30);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-18);ctx.lineTo(x,y);ctx.stroke();
    for(let k=0;k<4;k++){const t=tt*.8+k*Math.PI/2;const qx=x+Math.cos(t)*8,qy=y+5+Math.sin(t)*3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(qx,qy);ctx.stroke();circ(qx,qy+2,2.2,['#ffd166','#ff8fab','#5bc0be','#9b5de5'][k]);}}]);
  layers(L);};
function armchair(o,u,anaOn,c,wing,act){const L=[];const lg=o.q===4?'#d4af37':'#4a3326';
  L.push([ldepth(.5,.5)-.5,()=>{legs4(.18,.18,.82,.82,6,lg,.05);lp(.16,.16,.84,.84,6,12,shade(c,.85));}]);
  L.push([ldepth(.5,.2),()=>{lp(.16,.14,.84,.3,12,wing?42:34,c);if(wing){lp(.16,.14,.26,.42,26,42,shade(c,.95));lp(.74,.14,.84,.42,26,42,shade(c,.95));}}]);
  L.push([ldepth(.21,.6),()=>lp(.16,.3,.27,.84,12,22,c)]);
  L.push([ldepth(.5,.6),()=>lp(.27,.3,.73,.84,12,16,shade(c,1.08))]);
  if(u)L.push([ldepth(.5,.6)+.01,anaOn(.5,.56,16,{pose:'sit',act})]);
  L.push([ldepth(.79,.6),()=>lp(.73,.3,.84,.84,12,22,c)]);layers(L);}
MDRAW.sillon=(o,i,tt,u,anaOn)=>armchair(o,u,anaOn,Q(o,o.q===4?'#7a2e3a':'#4f7a6a'),true,Math.sin(tt*.4)>.7?'watch':null);
MDRAW.butaca=(o,i,tt,u,anaOn)=>{armchair(o,u,anaOn,Q(o,o.q===4?'#3e5c76':'#d08c45'),false,'book');if(!u){lp(.06,.84,.24,.98,0,3,'#2e86de');lp(.07,.85,.23,.97,3,5.5,'#c0392b');}};
MDRAW.sofacama=(o,i,tt,u,anaOn)=>{const c=Q(o,'#8b7d68');const L=[];const sleep=u&&sleeping(u);
  lp(.04,.1,.96,.95,0,6,shade(c,.8));
  L.push([ldepth(.5,.18),()=>{lp(.04,.1,.96,.26,6,24,c);lp(.2,.22,.48,.28,10,22,shade(c,1.08));lp(.52,.22,.8,.28,9,20,shade(c,1.04));}]);
  L.push([ldepth(.1,.6),()=>lp(.04,.26,.14,.95,6,15,c)]);L.push([ldepth(.9,.6),()=>lp(.86,.26,.96,.95,6,15,c)]);
  L.push([ldepth(.5,.6),()=>{lp(.14,.26,.86,.95,6,10,'#d8d0bc');poly([LP(.3,.45,10.1),LP(.7,.45,10.1),LP(.72,.8,10.1),LP(.28,.8,10.1)],'rgba(90,70,40,.22)');lp(.24,.28,.5,.4,10,13,'#efe9dc');
    if(!sleep)poly([LP(.5,.55,10.3),LP(.86,.5,11),LP(.84,.94,11),LP(.56,.9,10.3)],'#6a7d8f');}]);
  if(sleep)L.push([ldepth(.5,.6)+.01,()=>{headOnPillow(.37,.34,13);lp(.18,.46,.84,.93,10,13+Math.sin(tt*1.6)*.6,'#6a7d8f');}]);
  else if(u)L.push([ldepth(.5,.6)+.01,anaOn(.5,.55,10,{pose:'sit',act:Math.sin(tt*.5)>.6?'watch':null})]);
  layers(L);};
MDRAW.estant=(o,i,tt)=>{const w=Q(o,o.q===4?'#3b3f46':'#c49a6c');const L=[];
  L.push([ldepth(.5,.35),()=>{lp(.06,.3,.1,.7,0,58,w);lp(.9,.3,.94,.7,0,58,w);lp(.1,.3,.9,.33,0,58,shade(w,.85));}]);
  L.push([ldepth(.5,.5),()=>{for(const z of [2,20,38,56])lp(.06,.3,.94,.7,z,z+2,shade(w,1.05));
    const cols=['#c0392b','#2e86de','#f6b93b','#10ac84','#8e44ad','#ecf0f1'];
    let a=.13;for(let k=0;k<6;k++){const h=8+hash((i||1)*5+k)*6;lp(a,.42,a+.05,.62,22,22+h,cols[(k+(i||0))%6]);a+=.06;}
    lcyl(.75,.5,.07,22,28,'#c0683f');{const [x,y]=LP(.75,.5,29);circ(x-2,y-3,3.5,'#4f9a48');circ(x+3,y-5,3.5,'#62b35a');circ(x,y-8,3,'#4f9a48');}
    lcyl(.3,.5,.08,40,50,'#5bc0be','#3b8f8d');lp(.55,.38,.85,.62,40,46,'#e8d7c3');lp(.6,.42,.8,.58,46,50,'#d4a373');
    lp(.15,.4,.45,.62,4,12,'#b5653a');lp(.55,.4,.85,.62,4,10,'#7a8f9a');}]);
  layers(L);};
MDRAW.mesabaja=(o,i,tt)=>{const w=Q(o,'#8a5a3b');legs4(.16,.26,.84,.74,10,shade(w,.75),.05);lp(.14,.24,.86,.76,10,13,o.q===4?'rgba(200,230,240,.75)':w);
  ltop(.25,.35,.5,.6,13.2,'#f4f1ea');ltop(.27,.37,.48,.45,13.3,'#e76f51');lcyl(.65,.5,.05,13,17,'#fff','#6b4a2b');lp(.62,.62,.8,.7,13,14,'#3b3f46');};
MDRAW.consola=(o,i,tt,u)=>{const w=Q(o,'#3b3f46');lp(.08,.35,.92,.75,0,14,w);lfB(.12,.48,.751,3,11,shade(w,.8));lfB(.52,.88,.751,3,11,shade(w,.8));
  lp(.28,.4,.48,.54,14,17,o.q===4?'#e8e8e8':'#f4f4f4');lp(.56,.42,.72,.54,14,15.5,'#222');
  lp(.4,.45,.6,.52,17,19,'#222');lp(.12,.44,.88,.5,19,42,'#1c1f24');
  if(u){const k=(tt*.6)%1;lfB(.15,.85,.501,21,40,'#6ec6ff');lfB(.15,.85,.502,21,25,'#7cc46a');for(let q=0;q<3;q++){const a=.2+((q*.3+k)%1)*.6;lfB(a,a+.05,.503,25,28+q*2,'#b5653a');}
    const ja=.3+Math.abs(Math.sin(tt*3))*.0,jz=25+Math.abs(Math.sin(tt*5))*6;lfB(ja,ja+.05,.504,jz,jz+5,'#e63946');lfB(.7,.74,.503,34,37,'#ffd166');}
  else lfB(.15,.85,.501,21,40,'#27303d');
  {const [x,y]=LP(.6,.85,0);ctx.fillStyle='#2b2b2b';ctx.beginPath();ctx.ellipse(x,y-1,5,2.5,0,0,Math.PI*2);ctx.fill();}};
MDRAW.tocadisc=(o,i,tt,u)=>{const w=Q(o,o.q===4?'#3b2a20':'#7a5236');lp(.12,.3,.88,.75,0,20,w);
  if(lvis(0,1)){const cl=['#e63946','#f1c40f','#2a9d8f','#264653','#f4a261','#9b5de5','#ecf0f1'];for(let k=0;k<9;k++)lfB(.16+k*.075,.2+k*.075,.751,2,17-hash(k)*3,cl[k%7]);}
  lp(.16,.33,.84,.72,20,23,o.q===4?'#c0c6cc':'#2b2b2b');const [x,y]=LP(.44,.52,23.3);ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x,y,13,6.5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,y,9,4.5,0,0,Math.PI*2);ctx.stroke();circ(x,y,2.4,u?'#e63946':'#f1c40f');
  if(u){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.2;ctx.beginPath();const a=tt*4;ctx.moveTo(x+Math.cos(a)*5,y+Math.sin(a)*2.5);ctx.lineTo(x+Math.cos(a)*11,y+Math.sin(a)*5.5);ctx.stroke();}
  const [p,q]=LP(.76,.38,25),[r,s]=LP(u?.56:.7,u?.5:.62,25);lcyl(.76,.38,.04,23,25,'#9aa5ad');capsule(p,q,r,s,1.4,'#c0c6cc');};
MDRAW.chimenea=(o,i,tt,u,a,night)=>{const st=Q(o,o.q===4?'#efece6':'#c9b8a6');lp(.06,.04,.94,.4,0,50,st);lp(.02,.02,.98,.48,40,43,o.q===4?'#3b3f46':'#7a5236');lp(.12,.4,.88,.62,0,2,shade(st,.8));
  if(lvis(0,1)){lfB(.26,.74,.401,2,26,'#1d1714');
    for(let r=0;r<5;r++)for(let k=0;k<4;k++){const a=.08+k*.22+(r%2)*.11;if(a>.86)continue;if(r*8+4<28&&a>.2&&a<.72)continue;ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;ctx.beginPath();const [p,q]=LP(a,.402,r*8+4),[s,t]=LP(Math.min(.92,a+.2),.402,r*8+4);ctx.moveTo(p,q);ctx.lineTo(s,t);ctx.stroke();}
    lfB(.32,.68,.405,2,5,'#6b4a2b');
    const lit=u||night>0.2||seasonOf()==='inv';
    if(lit){for(let k=0;k<5;k++){const a=.34+k*.08,h=10+Math.sin(tt*8+k*1.7)*3+hash(k)*5;faceB(.406,[[a-.05,5],[a+.05,5],[a+Math.sin(tt*6+k)*.02,5+h]],k%2?'#ffb347':'#ff7b3a');faceB(.407,[[a-.025,5],[a+.025,5],[a,5+h*.55]],'#ffe066');}}
    else{for(let k=0;k<4;k++){const [x,y]=LP(.38+k*.08,.406,6);circ(x,y,1.3,`rgba(255,${90+k*20},40,${.5+Math.sin(tt*2+k)*.3})`);}}}
  lcyl(.2,.25,.03,43,50,'#f4f1ea');lcyl(.8,.25,.03,43,48,'#f4f1ea');{const [x,y]=LP(.2,.25,51);circ(x,y,1.5,'#ffd166');}lp(.44,.2,.56,.3,43,52,'#b08d57');};
MDRAW.acuario=(o,i,tt,u)=>{const w=Q(o,'#3b3f46');lp(.08,.3,.92,.72,0,20,w);lfB(.12,.88,.721,3,17,shade(w,.85));
  lp(.08,.3,.92,.72,20,42,'rgba(110,190,225,.5)');ltop(.1,.32,.9,.7,21,'#c9b38a');
  for(let k=0;k<4;k++){const a=.18+k*.2;const [x,y]=LP(a,.5,21);const sw=Math.sin(tt*1.4+k)*2;capsule(x,y,x+sw,y-12-hash(k)*6,2,'#3f8f4a');}
  if(lvis(0,1)){const fc=['#ff8a3d','#ffd166','#e63946','#5bc0be'];for(let k=0;k<4;k++){const sp=.25+hash(k*3+(i||1))*.3,ph=(tt*sp+hash(k))%2,dir=ph<1?1:-1,a=.14+(ph<1?ph:2-ph)*.72,z=26+k*3.5+Math.sin(tt*2+k)*1.2;const [x,y]=LP(a,.722,z);ctx.fillStyle=fc[k];ctx.beginPath();ctx.ellipse(x,y,3.2,1.8,0,0,Math.PI*2);ctx.fill();poly([[x-dir*3,y],[x-dir*6,y-2],[x-dir*6,y+2]],fc[k]);}
    for(let k=0;k<3;k++){const z=22+((tt*12+k*7)%19);const [x,y]=LP(.8,.723,z);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x+Math.sin(z)*.8,y,1.2,0,Math.PI*2);ctx.stroke();}}
  lp(.07,.29,.93,.73,42,44.5,'#2b2f36');};
MDRAW.piano=(o,i,tt,u)=>{const c=o.q<=1?'#3a3a3e':o.q===2?'#2a1f1a':'#15151a';
  const body=[[.08,.1],[.5,.06],[.78,.12],[.9,.3],[.88,.55],[.94,.82],[.06,.82]];
  for(const [a,b] of [[.12,.2],[.8,.25],[.12,.74],[.86,.74]])lp(a,b,a+.04,b+.04,0,18,c);
  lext(body,18,28,c);ltop(.1,.68,.9,.8,28.1,shade(c,1.3));
  lp(.08,.82,.92,.97,18,24,c);ltop(.1,.84,.9,.95,24.2,'#f8f8f2');
  for(let k=0;k<15;k++){if(k%7===2||k%7===6)continue;const a=.13+k*.052;ltop(a,.84,a+.03,.9,24.4,'#111');}
  const lid=[LP(.08,.12,28),LP(.08,.78,28),LP(.48,.7,52),LP(.5,.1,58)];poly(lid,shade(c,1.25));
  const [x0,y0]=LP(.5,.4,28),[x1,y1]=LP(.42,.4,52);capsule(x0,y0,x1,y1,1.2,'#888');
  if(o.q===4||u){const [x,y]=LP(.88,.9,25);ctx.fillStyle='#d4af37';ctx.fillRect(x-2,y-1,4,1.2);}
  lcyl(.5,.82,.03,28,34,'#f4f1ea');};
MDRAW.muebar=(o,i,tt,u)=>{const w=Q(o,'#5a3825'),g='#d4af37';lp(.06,.32,.94,.72,0,30,w);lp(.04,.3,.96,.74,30,32,shade(w,1.15));
  lfB(.1,.49,.721,3,27,shade(w,.95));lfB(.51,.9,.721,3,27,shade(w,.95));if(lvis(0,1)){lfB(.1,.9,.722,26,27,g);knob(.46,.723,15,g);knob(.54,.723,15,g);}
  lp(.06,.3,.94,.36,32,56,shade(w,.8));lfB(.08,.92,.361,33,55,'#8fa3ad');lp(.06,.36,.94,.6,44,45.5,shade(w,1.1));
  const bc=['#7a3e1d','#2e7d32','#c9a24a','#8e2c48','#e8e8e8'];for(let k=0;k<5;k++){const a=.14+k*.17;lcyl(a,.46,.045,32,40+hash(k)*4,bc[k]);lcyl(a,.46,.015,40+hash(k)*4,45,bc[k]);}
  for(let k=0;k<4;k++)lcyl(.2+k*.2,.5,.035,45.5,49,'rgba(230,240,245,.8)');if(u)lcyl(.5,.66,.04,32,36,'rgba(200,120,50,.85)');};
MDRAW.butano=(o,i,tt,u)=>{const c=Q(o,'#d9d4c8');const on=u||seasonOf()==='inv';for(const [a,b] of [[.28,.38],[.7,.38],[.28,.66],[.7,.66]])lcyl(a,b,.035,0,2,'#2b2b2b');
  lp(.24,.34,.76,.7,2,28,c);lp(.22,.32,.78,.72,28,30,shade(c,1.05));lcyl(.5,.5,.12,30,33,'#f08a24','#f4a24a');
  if(lvis(0,1)){lfB(.29,.71,.701,9,25,on?`rgb(255,${110+Math.sin(tt*5)*20|0},50)`:'#6b5a50');for(let k=1;k<4;k++)lfB(.29,.71,.702,9+k*4,9.6+k*4,on?'#ffd27a':'#4a3e36');lfB(.3,.7,.703,5,7,'#9aa5ad');}};
MDRAW.escritorio=(o,i,tt,u)=>{const w=Q(o,o.q===4?'#5a3825':'#b08060');lp(.08,.22,.12,.78,0,21,shade(w,.8));lp(.64,.22,.92,.78,0,21,shade(w,.9));
  for(let k=0;k<3;k++){lfB(.66,.9,.781,2+k*6.5,7.5+k*6.5,shade(w,.98));knob(.78,.782,4.8+k*6.5);}
  lp(.06,.2,.94,.8,21,24,w);ltop(.22,.42,.52,.66,24.2,'#ffffff');if(u)ltop(.38,.42,.52,.66,24.3,'#f4f1ea');
  {const [a,b]=LP(.3,.5,24.4),[c2,d]=LP(.42,.5,24.4);ctx.strokeStyle='rgba(40,40,80,.4)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c2,d);ctx.stroke();}
  lcyl(.8,.35,.05,24,30,'#3a86ff');lp(.6,.28,.75,.4,24,28,'#c0392b');lp(.61,.29,.74,.39,28,31,'#f6b93b');
  lcyl(.18,.3,.05,24,25.5,'#3b3f46');lp(.17,.29,.19,.31,25.5,36,'#3b3f46');lp(.17,.29,.3,.33,35,37,'#3b3f46');lcyl(.3,.33,.06,32,35,'#e9c46a');};
MDRAW.pizarra=(o,i,tt,u)=>{const f=Q(o,'#9aa5ad');lp(.14,.4,.18,.58,0,52,f);lp(.82,.4,.86,.58,0,52,f);lp(.12,.36,.88,.62,0,2,f);
  lp(.08,.46,.92,.5,22,54,f);lfB(.1,.9,.501,24,52,o.q<=1?'#e4e6e0':'#fbfcfc');
  if(lvis(0,1)){const pol=isI('marxista','anarquista');ctx.lineWidth=1.1;
    ctx.strokeStyle='#2e86de';ctx.beginPath();const [a,b]=LP(.16,.502,46),[c2,d]=LP(.5,.502,46);ctx.moveTo(a,b);ctx.lineTo(c2,d);ctx.stroke();
    ctx.strokeStyle='#e63946';ctx.beginPath();for(let k=0;k<5;k++){const [x,y]=LP(.18+k*.07,.502,30+hash(k+(i||1))*10);k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    ctx.strokeStyle='#10ac84';const [x,y]=LP(.72,.502,36);ctx.beginPath();ctx.ellipse(x,y,6,5,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#3b3247';ctx.font='900 5px Nunito, sans-serif';ctx.textAlign='center';const [tx,ty]=LP(.68,.502,47);ctx.fillText(pol?'ASAMBLEA':u?'PLAN':'IDEAS',tx,ty);}
  lp(.1,.5,.9,.56,22,23.5,f);lp(.3,.5,.36,.55,23.5,25,'#e63946');};
MDRAW.coser=(o,i,tt,u)=>{const w=Q(o,'#e8e2d4');legs4(.12,.26,.88,.78,22,'#3b3f46',.04);lp(.1,.24,.9,.8,22,25,w);
  ltop(.18,.55,.62,.76,25.2,o.q===4?'#8e44ad':'#e07a5f');
  const m=o.q===4?'#7a1f2b':'#2b2f36';lp(.22,.38,.76,.58,25,29,m);lp(.62,.38,.74,.58,29,40,m);lp(.22,.38,.74,.58,40,44,m);lp(.24,.44,.3,.52,32,40,m);
  if(lvis(0,1))lfB(.3,.66,.581,41,42,'#d4af37');lp(.26,.46,.27,.48,28,32+(u?Math.abs(Math.sin(tt*20))*2:0),'#c0c6cc');lcyl(.5,.48,.04,44,48,'#e9c46a');
  lcyl(.82,.4,.04,25,29,'#3a86ff');};
function artOn(b,z0,z1,kind,i,a0=.19,a1=.81){
  const L=(a,z)=>LP(a,b,z),H=z1-z0,W=a1-a0;
  if(kind===0){poly([L(a0,z0),L(a1,z0),L(a1,z1),L(a0,z1)],'#bfe1f3');poly([L(a0,z0),L(a1,z0),L(a1,z0+H*.35),L(a0+W*.7,z0+H*.55),L(a0+W*.35,z0+H*.4),L(a0,z0+H*.6)],'#6aa84f');poly([L(a0,z0),L(a1,z0),L(a1,z0+H*.2),L(a0,z0+H*.3)],'#3f7a35');const [x,y]=L(a0+W*.78,z0+H*.78);circ(x,y,2.6,'#ffd166');}
  else if(kind===1){poly([L(a0,z0),L(a1,z0),L(a1,z1),L(a0,z1)],'#f4efe6');poly([L(a0+W*.1,z0+H*.2),L(a0+W*.55,z0+H*.2),L(a0+W*.55,z0+H*.75),L(a0+W*.1,z0+H*.75)],'#e63946');poly([L(a0+W*.45,z0+H*.4),L(a0+W*.9,z0+H*.4),L(a0+W*.9,z0+H*.9),L(a0+W*.45,z0+H*.9)],'rgba(38,70,140,.9)');poly([L(a0+W*.6,z0+H*.08),L(a0+W*.85,z0+H*.08),L(a0+W*.85,z0+H*.3),L(a0+W*.6,z0+H*.3)],'#f1c40f');}
  else{poly([L(a0,z0),L(a1,z0),L(a1,z1),L(a0,z1)],'#3b2a20');const [x,y]=L(a0+W*.5,z0+H*.35);ctx.fillStyle='#c9a24a';ctx.beginPath();ctx.ellipse(x,y,4,2.4,0,0,Math.PI*2);ctx.fill();circ(x-3,y-3,2.4,'#e63946');circ(x+2,y-4,2.6,'#ff8a3d');circ(x,y-6,2,'#7cc46a');}}
MDRAW.cuadro=(o,i,tt,u,a,n,g,wx,wy)=>{const wb=wallBehind(o,wx,wy),fr=Q(o,o.q===4?'#d4af37':'#b08d57'),kind=(i||0)%3;
  if(wb===2){lp(.15,.42,.85,.47,22,48,fr);if(lvis(0,1))artOn(.471,25,45,kind,i);}
  else if(wb===1){poly([LP(.15,.5,0),LP(.85,.5,0),LP(.85,.38,26),LP(.15,.38,26)],shade(fr,.8));if(lvis(0,1)){const k=(z)=>.5-z/26*.12;poly([LP(.19,k(3),3),LP(.81,k(3),3),LP(.81,k(23),23),LP(.19,k(23),23)],'#e8e2d4');}}
  else{const [p,q]=LP(.3,.7,0),[r,s]=LP(.5,.4,40),[t,v]=LP(.7,.7,0);capsule(p,q,r,s,2,'#8a5d39');capsule(t,v,r,s,2,'#8a5d39');lp(.15,.48,.85,.53,14,40,fr);if(lvis(0,1))artOn(.531,17,37,kind,i);lp(.2,.5,.8,.56,13,15,'#8a5d39');}};
MDRAW.poster=(o,i,tt,u,a,n,g,wx,wy)=>{const wb=wallBehind(o,wx,wy);const z0=wb===2?20:2,z1=z0+(wb===2?28:22),b=wb===2?.455:.5;
  const id=(S&&S.ideo)||'apolitica';const pal={marxista:['#c0392b','#f1c40f','★'],anarquista:['#111','#c0392b','Ⓐ'],ecologista:['#2e7d32','#c5e1a5','🌍'],socialdemocrata:['#e63946','#fff','🌹'],liberal:['#1e5aa8','#ffd166','🗽'],libertaria:['#f4d03f','#222','🐍'],conservadora:['#1b3a5c','#e8d7c3','🏛️'],apolitica:['#9b5de5','#ffd166','♫']}[id]||['#9b5de5','#ffd166','♫'];
  if(wb!==2)lp(.2,.44,.8,.5,0,2,'#8a5d39');
  lp(.2,b-.01,.8,b,z0,z1,'#f4f1ea');if(lvis(0,1)){const L=(aa,z)=>LP(aa,b+.001,z);poly([L(.22,z0+1),L(.78,z0+1),L(.78,z1-1),L(.22,z1-1)],pal[0]);
    if(id==='anarquista')poly([L(.22,z0+1),L(.78,z1-1),L(.22,z1-1)],pal[1]);else poly([L(.22,z0+1),L(.78,z0+1),L(.78,z0+7),L(.22,z0+7)],pal[1]);
    const [x,y]=L(.5,(z0+z1)/2+3);emoji(pal[2],x,y,11);}
  if(wb!==2){}};
MDRAW.espejopie=(o,i,tt,u)=>{const f=Q(o,o.q===4?'#d4af37':'#c7a46b');lp(.16,.44,.24,.6,0,3,f);lp(.76,.44,.84,.6,0,3,f);lp(.18,.5,.22,.54,3,44,f);lp(.78,.5,.82,.54,3,44,f);
  ellB(.5,.52,30,.27,24,f);if(lvis(0,1)){const g=ctx.createLinearGradient(...LP(.3,.53,52),...LP(.7,.53,8));g.addColorStop(0,'#f2f7fa');g.addColorStop(1,'#a9bccb');ellB(.5,.53,30,.23,21,g);
    const sh=((tt*.25)%1.6)-.3;if(sh>0&&sh<1){ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2.5;ctx.beginPath();const [a,b]=LP(.35+sh*.25,.535,16),[e,h]=LP(.42+sh*.25,.535,44);ctx.moveTo(a,b);ctx.lineTo(e,h);ctx.stroke();}}};
MDRAW.lamparco=(o,i,tt,u,a,night)=>{const m=Q(o,o.q===4?'#d4af37':'#c9a24a');lcyl(.18,.35,.13,0,4,o.q<=2?'#555':'#efece6');
  ctx.strokeStyle=m;ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();const p0=LP(.18,.35,4);ctx.moveTo(...p0);let ex=.18,ez=4;for(let k=1;k<=14;k++){const t=k/14;ex=.18+t*.66;ez=4+Math.sin(t*Math.PI*.8)*58;ctx.lineTo(...LP(ex,.35+t*.25,ez));}ctx.stroke();
  const on=night>0.2;const [x,y]=LP(ex,.6,ez-4);ctx.fillStyle=m;ctx.beginPath();ctx.ellipse(x,y,9,5,0,Math.PI,0);ctx.fill();ctx.fillStyle=on?'#fff4cf':'#e8e0c8';ctx.beginPath();ctx.ellipse(x,y,9,3,0,0,Math.PI);ctx.fill();
  if(on){ctx.fillStyle='rgba(255,230,160,.18)';ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x+9,y);ctx.lineTo(x+16,y+30);ctx.lineTo(x-16,y+30);ctx.fill();}};
MDRAW.lampapel=(o,i,tt,u,a,night)=>{lcyl(.5,.5,.1,0,2,'#3b3f46');lp(.48,.48,.52,.52,2,16,'#3b3f46');const on=night>0.2;const [x,y]=LP(.5,.5,28);
  circ(x,y,12,on?'#ffe9b8':Q(o,'#f7efe0'));ctx.strokeStyle=on?'rgba(200,150,60,.35)':'rgba(120,100,80,.25)';ctx.lineWidth=.8;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.ellipse(x,y+k*4.4,Math.sqrt(144-k*k*19),1.6,0,0,Math.PI*2);ctx.stroke();}};
MDRAW.cortinas=(o,i,tt,u,a,n,g,wx,wy)=>{const c=Q(o,o.q===4?'#7a2e3a':'#c45b5b');const wb=wallBehind(o,wx,wy);
  let winBehind=false;if(wx!=null){const [dx,dy]=WDIR[o.r||0];winBehind=inb(wx+dx,wy+dy)&&S.wall[idx(wx+dx,wy+dy)]===3;}
  if(!winBehind&&lvis(0,1)){lfB(.3,.7,.41,18,46,'#ffffff');lfB(.33,.67,.411,20,44,nightFactor()>.3?'#2b3a5c':'#bfe6ff');lfB(.495,.505,.412,20,44,'#ffffff');lfB(.33,.67,.412,31.5,32.5,'#ffffff');lp(.28,.41,.72,.46,17,19,'#ffffff');}
  lp(.04,.41,.96,.44,52,54,o.q===4?'#d4af37':'#7a5236');
  const panel=(a0,a1,tie)=>{const n=5;for(let k=0;k<n;k++){const p=a0+(a1-a0)*k/n,q=a0+(a1-a0)*(k+1)/n;const pin=tie?(k/n):(1-k/n);const pz=(x)=>x;faceB(.45,[[p,2],[q,2],[q,52],[p,52]],shade(c,k%2?.92:1.04));}
    const ta=tie?a1-.02:a0+.02;lp(ta-.02,.45,ta+.02,.47,22,25,shade(c,.75));};
  if(lvis(0,1)){panel(.06,.3,true);panel(.7,.94,false);}else{lp(.06,.43,.3,.47,2,52,c);lp(.7,.43,.94,.47,2,52,c);}
  if(wb===0)lp(.04,.4,.08,.45,0,52,'#7a5236'),lp(.92,.4,.96,.45,0,52,'#7a5236');};
MDRAW.alfpersa=(o,i,tt)=>{const r=Q(o,'#a8323e');ltop(.03,.03,.97,.97,1,'#5a1a22');ltop(.08,.08,.92,.92,1.1,r);ltop(.14,.14,.86,.86,1.15,'#7a1f2b');ltop(.18,.18,.82,.82,1.2,r);
  poly([LP(.5,.22,1.3),LP(.78,.5,1.3),LP(.5,.78,1.3),LP(.22,.5,1.3)],'#22335a');poly([LP(.5,.32,1.35),LP(.68,.5,1.35),LP(.5,.68,1.35),LP(.32,.5,1.35)],'#d9b36a');poly([LP(.5,.42,1.4),LP(.58,.5,1.4),LP(.5,.58,1.4),LP(.42,.5,1.4)],'#a8323e');
  for(const [a,b] of [[.24,.24],[.76,.24],[.24,.76],[.76,.76]]){const [x,y]=LP(a,b,1.3);circ(x,y,2,'#d9b36a');}
  ctx.strokeStyle='#efe6d5';ctx.lineWidth=.8;ctx.beginPath();for(let k=0;k<10;k++){const b=.06+k*.098;for(const [a0,a1] of [[.03,-.01],[.97,1.01]]){const [x,y]=LP(a0,b,1),[x2,y2]=LP(a1,b,1);ctx.moveTo(x,y);ctx.lineTo(x2,y2);}}ctx.stroke();};
MDRAW.alfred=(o,i,tt)=>{const c=Q(o,'#e9a23b');ellTop(.5,.5,.46,1,shade(c,.8));ellTop(.5,.5,.4,1.1,c);ellTop(.5,.5,.3,1.2,'#f4e3b5');ellTop(.5,.5,.2,1.3,'#e76f51');ellTop(.5,.5,.09,1.4,'#f4e3b5');};
MDRAW.alfyute=(o,i,tt)=>{const c=Q(o,'#cdb58a');ltop(.05,.1,.95,.9,1,c);ltop(.05,.18,.95,.24,1.1,'#3b3f46');ltop(.05,.76,.95,.82,1.1,'#3b3f46');
  ctx.strokeStyle='rgba(90,70,40,.25)';ctx.lineWidth=.7;ctx.beginPath();for(let k=1;k<12;k++){const a=.05+k*.075;const [x,y]=LP(a,.1,1.1),[x2,y2]=LP(a,.9,1.1);ctx.moveTo(x,y);ctx.lineTo(x2,y2);}ctx.stroke();};
MDRAW.monstera=(o,i,tt)=>{lcyl(.5,.5,.18,0,15,Q(o,o.q===4?'#3b3f46':'#e8e2d4'),'#5a3e2b');const sw=Math.sin(tt*1.2+(i||0))*1.2;const [px,py]=LP(.5,.5,15);
  const lv=[[-12,-14,-0.7,9],[11,-16,0.6,9],[-5,-28,-0.3,10],[6,-30,0.35,10],[0,-20,0.05,9],[-14,-26,-0.9,7],[13,-27,0.9,7]];
  for(const [lx,ly,r,s] of lv){ctx.save();ctx.translate(px+lx+sw*(ly/-30),py+ly);ctx.rotate(r+sw*.02);ctx.strokeStyle='#2f5d2f';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,s);ctx.lineTo(-lx*.6,-ly*.6+s);ctx.stroke();
    ctx.fillStyle=r<0?'#2f7a3f':'#3f8f4a';ctx.beginPath();ctx.ellipse(0,0,s*.8,s,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=r<0?'#4f9a48':'#62b35a';ctx.lineWidth=1.4;ctx.beginPath();for(let k=-2;k<=2;k++){if(!k)continue;ctx.moveTo(0,k*s*.3);ctx.lineTo(k<0?-s*.85:s*.85,k*s*.45);}ctx.stroke();ctx.restore();}};
MDRAW.kentia=(o,i,tt)=>{lcyl(.5,.5,.17,0,13,Q(o,'#b46a3c'),'#5a3e2b');const [px,py]=LP(.5,.5,13);const sw=Math.sin(tt*1.1+(i||0))*1.5;
  for(let k=0;k<8;k++){const ang=-Math.PI/2+(k-3.5)*.36,len=26+hash(k+(i||1))*12;const ex=px+Math.cos(ang)*len+sw,ey=py-24+Math.sin(ang)*len*.7+len*.25;const mx=px+Math.cos(ang)*len*.4,my=py-38+Math.abs(k-3.5)*3;
    ctx.strokeStyle='#4a7a35';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px,py-2);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
    ctx.strokeStyle=k%2?'#3f8f4a':'#5aa65a';ctx.lineWidth=1;ctx.beginPath();for(let q=2;q<9;q++){const t=q/9;const x=(1-t)*(1-t)*px+2*(1-t)*t*mx+t*t*ex,y=(1-t)*(1-t)*(py-2)+2*(1-t)*t*my+t*t*ey;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(ang+1.4)*6,y+5);ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(ang-1.4)*6,y+5);}ctx.stroke();}};
MDRAW.jaula=(o,i,tt,u)=>{const g=Q(o,o.q===4?'#d4af37':'#c9a24a');lcyl(.5,.5,.14,0,2,shade(g,.8));lp(.48,.48,.52,.52,2,26,shade(g,.8));lcyl(.5,.5,.24,26,28,g,'#e8e2d4');
  const [cx,cy0]=LP(.5,.5,28),[,top]=LP(.5,.5,54);const bars=[];for(let k=0;k<12;k++){const t=k/12*Math.PI*2;const a=.5+Math.cos(t)*.24,b=.5+Math.sin(t)*.24;bars.push([ldepth(a,b),a,b]);}
  const dc=ldepth(.5,.5);const bar=([,a,b])=>{const [x,y]=LP(a,b,28),[x2,y2]=LP(a,b,44);ctx.strokeStyle=g;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.quadraticCurveTo(x2+(cx-x2)*.3,top,cx,top);ctx.stroke();};
  bars.filter(b=>b[0]<dc).forEach(bar);
  const hop=u?Math.abs(Math.sin(tt*6))*3:Math.abs(Math.sin(tt*2))*1;const by=cy0-9-hop;ctx.strokeStyle='#8a5d39';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx-8,cy0-6);ctx.lineTo(cx+8,cy0-6);ctx.stroke();
  ctx.fillStyle='#7cc46a';ctx.beginPath();ctx.ellipse(cx,by,4,5.5,.2,0,Math.PI*2);ctx.fill();circ(cx+1,by-6,3.2,'#f6e05e');circ(cx+2,by-6.5,.8,'#111');ctx.fillStyle='#e07a3f';ctx.beginPath();ctx.moveTo(cx+4,by-6);ctx.lineTo(cx+6.5,by-5);ctx.lineTo(cx+4,by-4.3);ctx.fill();
  ctx.fillStyle='#3f8f4a';ctx.beginPath();ctx.moveTo(cx-2,by+4);ctx.lineTo(cx-5,by+11);ctx.lineTo(cx,by+5);ctx.fill();
  bars.filter(b=>b[0]>=dc).forEach(bar);circ(cx,top-2,2,g);};
MDRAW.hamaca=(o,i,tt,u,anaOn)=>{const c=Q(o,'#e76f51'),w='#8a5d39';const sw=u?Math.sin(tt*1.4)*.04:Math.sin(tt*.8)*.01;const L=[];
  L.push([ldepth(.09,.5),()=>{lp(.05,.45,.12,.55,0,36,w);lp(.04,.42,.13,.58,0,2,w);}]);L.push([ldepth(.91,.5),()=>{lp(.88,.45,.95,.55,0,36,w);lp(.87,.42,.96,.58,0,2,w);}]);
  const strip=(b0,b1,col)=>{const n=10;for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;const z0=32-Math.sin(t0*Math.PI)*20,z1=32-Math.sin(t1*Math.PI)*20;const a0=.12+t0*.76,a1=.12+t1*.76;poly([LP(a0,b0+sw,z0),LP(a1,b0+sw,z1),LP(a1,b1+sw,z1),LP(a0,b1+sw,z0)],k%2?col:shade(col,1.12));}};
  L.push([ldepth(.5,.5)-.01,()=>strip(.36,.5,shade(c,.9))]);
  if(u)L.push([ldepth(.5,.5),anaOn(.5,.5+sw,13,{pose:'sit'})]);
  L.push([ldepth(.5,.5)+.01,()=>strip(.5,.64,c)]);layers(L);};
MDRAW.columpio=(o,i,tt,u,anaOn)=>{const w=Q(o,'#8a5d39');const th=u?Math.sin(tt*2.2)*.55:Math.sin(tt*.7)*.05;const sb=.5+Math.sin(th)*.32,sz=54-36*Math.cos(th);const L=[];
  const A=(a)=>{const [p,q]=LP(a,.08,0),[r,s]=LP(a,.5,56),[t,v]=LP(a,.92,0);capsule(p,q,r,s,3,w);capsule(t,v,r,s,3,w);};
  L.push([ldepth(.06,.5),()=>A(.06)]);L.push([ldepth(.94,.5),()=>A(.94)]);
  L.push([ldepth(.5,.5)-.2,()=>lp(.04,.48,.96,.52,54,57,shade(w,1.1))]);
  L.push([ldepth(.5,sb),()=>{for(const a of [.32,.68]){const [p,q]=LP(a,.5,54),[r,s]=LP(a,sb,sz);ctx.strokeStyle='#d9c3a0';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p,q);ctx.lineTo(r,s);ctx.stroke();}
    poly([LP(.3,sb-.06,sz),LP(.7,sb-.06,sz),LP(.7,sb+.06,sz),LP(.3,sb+.06,sz)],o.q===4?'#e63946':'#c0392b');poly([LP(.3,sb+.06,sz),LP(.7,sb+.06,sz),LP(.7,sb+.06,sz-2),LP(.3,sb+.06,sz-2)],'#8f2235');}]);
  if(u)L.push([ldepth(.5,sb)+.01,anaOn(.5,sb,sz,{pose:'sit'})]);layers(L);};
MDRAW.elastica=(o,i,tt,u,anaOn)=>{const pad=Q(o,'#3a86ff');const pts=circPts(.5,.5,.46,16);
  for(let k=0;k<16;k+=3){const [a,b]=pts[k];lp(a-.02,b-.02,a+.02,b+.02,0,12,'#3b3f46');}
  const dip=u?Math.max(0,-Math.sin(tt*5))*4:0;poly(pts.map(([a,b])=>LP(a,b,12)),pad);poly(circPts(.5,.5,.38,16).map(([a,b])=>LP(a,b,12-dip*.4)),'#1d1f24');
  if(u){const j=Math.max(0,Math.sin(tt*5))*24;anaOn(.5,.5,12+j,{act:j>14?'cheer':null})();}};
MDRAW.caseta=(o,i,tt,u)=>{const c=Q(o,'#b5653a'),roof=o.q===4?'#3b3f46':'#7a3e1d';const L=[];
  L.push([ldepth(.5,.45),()=>{lp(.14,.16,.86,.8,0,22,c);
    if(lvis(0,1)){faceB(.801,[[.38,0],[.62,0],[.62,12],[.5,17],[.38,12]],'#2b1a10');
      const [x,y]=LP(.5,.82,7+Math.abs(Math.sin(tt*(u?6:1.5)))*1.5);circ(x,y,4.5,'#d9a066');ctx.fillStyle='#8a5a32';ctx.beginPath();ctx.ellipse(x-4.5,y-1,2,3.5,.4,0,Math.PI*2);ctx.ellipse(x+4.5,y-1,2,3.5,-.4,0,Math.PI*2);ctx.fill();circ(x-1.5,y-1,.8,'#111');circ(x+1.5,y-1,.8,'#111');circ(x,y+1.5,1.1,'#111');if(u){ctx.fillStyle='#ff8fab';ctx.fillRect(x-.8,y+2.5,1.6,2.5);}
      ctx.fillStyle='#fff';ctx.font='900 4px Nunito, sans-serif';ctx.textAlign='center';const [tx,ty]=LP(.5,.802,20);ctx.fillText('TOBI',tx,ty);}
    for(const s of [-1,1]){const a=s<0?.14:.86;if(lvis(s,0))poly([LP(a,.16,22),LP(a,.8,22),LP(a,.48,36)],shade(c,.75));}}]);
  L.push([ldepth(.5,.3),()=>poly([LP(.1,.12,20),LP(.9,.12,20),LP(.9,.48,37),LP(.1,.48,37)],shade(roof,lvis(0,-1)?1:.8))]);
  L.push([ldepth(.5,.66),()=>poly([LP(.1,.48,37),LP(.9,.48,37),LP(.9,.84,20),LP(.1,.84,20)],shade(roof,lvis(0,1)?1.1:.75))]);
  L.push([ldepth(.82,.92),()=>{lcyl(.8,.92,.07,0,3,'#e63946','#c08a5a');}]);layers(L);};
MDRAW.tendedero=(o,i,tt,u)=>{const m=Q(o,'#c0c6cc');const wet=['lluvia','tormenta','nieve'].includes((S.weather||{}).k);
  for(const a of [.12,.88]){const [p,q]=LP(a,.15,0),[r,s]=LP(a,.85,30),[t,v]=LP(a,.85,0),[x,y]=LP(a,.15,30);capsule(p,q,r,s,1.5,m);capsule(t,v,x,y,1.5,m);}
  const cl=['#e76f51','#2a9d8f','#f4f1ea','#e9c46a','#8ecae6','#ff8fab'];const L=[];
  for(let k=0;k<4;k++){const b=.25+k*.17;L.push([ldepth(.5,b),()=>{const [p,q]=LP(.12,b,30),[r,s]=LP(.88,b,30);ctx.strokeStyle=m;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p,q);ctx.lineTo(r,s);ctx.stroke();
    if(!wet||u)for(let q2=0;q2<2;q2++){const a0=.18+q2*.36+hash(k*5+q2)*.08,a1=a0+.22,sw=Math.sin(tt*2+k+q2)*.01;poly([LP(a0,b,30),LP(a1,b,30),LP(a1,b+sw,30-(9+hash(k+q2)*6)),LP(a0,b+sw,30-(9+hash(k+q2)*6))],cl[(k*2+q2+(i||0))%6]);}}]);}
  layers(L);};
MDRAW.compost=(o,i,tt)=>{const w=Q(o,'#7a5230');lp(.15,.15,.85,.85,0,20,w);ltop(.19,.19,.81,.81,20.1,'#4a3424');
  for(let k=0;k<4;k++){lfB(.15,.85,.851,3+k*5,3.8+k*5,shade(w,.7));if(lvis(1,0))poly([LP(.851,.15,3+k*5),LP(.851,.85,3+k*5),LP(.851,.85,3.8+k*5),LP(.851,.15,3.8+k*5)],shade(w,.6));}
  for(let k=0;k<7;k++){const [x,y]=LP(.25+hash(k*3+(i||1))*.5,.25+hash(k*7)*.5,20.3);circ(x,y,1.5,['#7cc46a','#e9c46a','#e07a3f','#c0a080'][k%4]);}
  poly([LP(.15,.15,20),LP(.85,.15,20),LP(.85,.05,34),LP(.15,.05,34)],shade(w,1.1));};
MDRAW.parrilla=(o,i,tt,u)=>{const br=Q(o,'#b5553a');const L=[];
  L.push([ldepth(.5,.3),()=>{lp(.32,.18,.68,.38,26,54,shade(br,.95));lp(.3,.16,.7,.4,54,56,'#8a8f98');}]);
  L.push([ldepth(.5,.6),()=>{lp(.08,.25,.92,.85,0,26,br);lp(.06,.23,.94,.87,26,28,'#c9c3b8');
    if(lvis(0,1)){for(let r=0;r<5;r++){ctx.strokeStyle='rgba(255,230,210,.35)';ctx.lineWidth=.8;ctx.beginPath();const [p,q]=LP(.08,.851,r*5+3),[s,t]=LP(.92,.851,r*5+3);ctx.moveTo(p,q);ctx.lineTo(s,t);ctx.stroke();}
      lfB(.28,.72,.852,4,17,'#1d1714');if(u)for(let k=0;k<4;k++){const [x,y]=LP(.34+k*.1,.853,6);circ(x,y+Math.sin(tt*9+k)*.5,2,`rgba(255,${120+k*30},60,.9)`);}}
    ctx.strokeStyle='#5f6670';ctx.lineWidth=.9;ctx.beginPath();for(let k=0;k<6;k++){const [a,b]=LP(.16,.38+k*.08,28.4),[c,d]=LP(.84,.38+k*.08,28.4);ctx.moveTo(a,b);ctx.lineTo(c,d);}ctx.stroke();
    if(u){for(let k=0;k<3;k++){const [x,y]=LP(.3+k*.2,.6,28.6);ctx.fillStyle='#8f3b2a';ctx.beginPath();ctx.ellipse(x,y,4,2,0,0,Math.PI*2);ctx.fill();}}}]);
  layers(L);};
}
