// =================== RÓTULOS: los nombres se apuntan y se pintan al final, sin pisarse ===================
// sPerson ya no pinta el nombre: lo apunta (con la cabeza de la figura). drawScene, al acabar, coloca todos los rótulos de la escena:
// encima de su figura si hay sitio; si no, desplazados o apilados hacia arriba con una línea fina hasta la figura.
// Nunca fuera de la pantalla, ni bajo los paneles de arriba o la barra de abajo, ni sobre la cabeza de nadie.
const RT={on:false,names:[],heads:[],obst:[],ana:null,ui:null,uiAt:-1e9,last:[],lastHeads:[],lastUI:[],lastFs:0,fs:10.5,fs2:8.5};
const rtD=()=>(typeof DPR==='number'&&DPR)||1;
function rtPt(x,y){const m=ctx.getTransform(),d=rtD();return [(m.a*x+m.c*y+m.e)/d,(m.b*x+m.d*y+m.f)/d];}
// zonas de pantalla tapadas por la interfaz: paneles de arriba, avisos emergentes, botones de la derecha y barra de abajo
function rtUI(force){const t=typeof performance!=='undefined'?performance.now():0;if(!force&&RT.ui&&t-RT.uiAt<300)return RT.ui;const out=[];
  const add=el=>{if(!el||!el.getBoundingClientRect)return;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const r=el.getBoundingClientRect();if(r.width>2&&r.height>2)out.push([r.left,r.top,r.right,r.bottom]);};
  RT.uiTop=0;RT.uiBot=1e9;
  for(const id of ['top','needs','placebtn','side','bottom']){const el=document.getElementById(id);const n=out.length;add(el);if(out.length>n){const r=out[out.length-1];if(id==='bottom')RT.uiBot=Math.min(RT.uiBot,r[1]);else if(id!=='side')RT.uiTop=Math.max(RT.uiTop,r[3]);}}
  const to=document.getElementById('toasts');if(to)for(const c of to.children)add(c);
  RT.ui=out;RT.uiAt=t;return out;}
const rtHit=(a,b,p=0)=>a[0]<b[2]+p&&a[2]>b[0]-p&&a[1]<b[3]+p&&a[3]>b[1]-p;
const rtCp=()=>{try{const c=P_('compi');return c&&c.n||null;}catch(e){return null;}};
{const _sp=sPerson;
sPerson=function(x,y,ch,o){if(!RT.on)return _sp.apply(this,arguments);o=o||{};const nm=o.name;
  const r=_sp.call(this,x,y,ch,nm?{...o,name:null}:o);
  try{const [px,py]=P(x,y),m=ctx.getTransform(),s=m.a/rtD(),top=py-(o.pose==='sit'?50:59);const [hx,hy]=rtPt(px,top);
    const id=RT.heads.push({x:hx,y:hy,w:15*s,h:17*s})-1;
    if(nm)RT.names.push({name:nm,x:hx,y:hy,id,rot:o.rot||null,vid:ch&&ch.vid!=null?ch.vid:null});}catch(e){}
  return r;};}
{const _lb=label;
label=function(text,x,y,bg,fg,size){if(!RT.on)return _lb.apply(this,arguments);
  try{const me=typeof CH==='function'&&CH()&&CH().name;
    if(bg==='#ff8a5b'&&text===me){const [hx,hy]=rtPt(x,y+11);const id=RT.heads.push({x:hx,y:hy,w:15,h:17})-1;RT.ana={name:text,x:hx,y:hy,id,ana:true};return;}}catch(e){}
  const r=_lb.apply(this,arguments);
  try{const sz=size||12,w=ctx.measureText(text).width+14,a=rtPt(x-w/2,y-sz*.9),b=rtPt(x+w/2,y+sz*.9);RT.obst.push([a[0],a[1],b[0],b[1]]);}catch(e){}
  return r;};}
function rtAreas(){const ui=rtUI(),Wd=typeof W==='number'?W:innerWidth,Hd=typeof H==='number'?H:innerHeight;
  const top=(RT.uiTop||0)+3,bot=Math.min(Hd,(RT.uiBot||1e9)-3);
  return {Wd,Hd,top,bot,ui};}
// agrupa: tres o más del mismo hogar juntas (sin contar a quien trabaja) → un solo rótulo con el nombre del hogar
function rtGroup(list){const H=(DATA.personas&&DATA.personas.hogares)||{},by=new Map();
  for(const q of list)if(q.rot&&q.rot.hogar&&!q.rot.trab){if(!by.has(q.rot.hogar))by.set(q.rot.hogar,[]);by.get(q.rot.hogar).push(q);}
  const gone=new Set(),add=[];
  for(const [id,g] of by){const hh=H[id];if(g.length<3||!hh||!hh.n)continue;g.forEach(q=>gone.add(q));
    const ys=g.map(q=>q.y),xs=g.map(q=>q.x);add.push({name:hh.n,x:xs.reduce((a,b)=>a+b,0)/xs.length,y:Math.min(...ys),id:g[0].id,rot:{hogar:id,grupo:true},prio:3});}
  return list.filter(q=>!gone.has(q)).concat(add);}
function rtPrio(q,cp){if(q.ana)return 0;if(q.prio!=null)return q.prio;if(q.rot&&q.rot.trab)return 2;if(!q.rot)return 1;if(cp&&q.name===cp)return 1;return 3;}
// coloca los rótulos; devuelve [{x0,y0,x1,y1,name,puesto,prio,hx,hy,line}]
function rtLayout(names,heads,obst,A,fs){const cp=rtCp();const fs2=RT.fs2,pad=6;const cv=ctx;cv.save();
  const items=rtGroup(names.slice()).map(q=>({...q,prio:rtPrio(q,cp)}));
  const keep=items;
  keep.sort((a,b)=>a.prio-b.prio||b.y-a.y||(a.name<b.name?-1:1));
  const placed=[];const blocks=obst.concat(A.ui);
  for(const q of keep){const pu=q.rot&&q.rot.puesto||null;cv.font=`900 ${fs}px Nunito, sans-serif`;let w=cv.measureText(q.name).width+pad*2;
    if(pu){cv.font=`800 ${fs2}px Nunito, sans-serif`;w=Math.max(w,cv.measureText(pu).width+pad*2);}
    w=Math.ceil(w);const h=Math.round(fs*1.45)+(pu?Math.round(fs2*1.25):0);let best=null,bc=1e9;
    const KM=q.prio<=2?14:5,DM=q.prio<=2?300:72;for(let k=0;k<KM;k++)for(let dx=-DM;dx<=DM;dx+=6){const cx=q.x+dx,x0=cx-w/2,x1=cx+w/2;if(x0<3||x1>A.Wd-3)continue;
      const y1=q.y-3-k*(h+3),y0=y1-h;if(y0<A.top||y1>A.bot)continue;const c=k*22+Math.abs(dx)*.55;if(c>=bc)continue;
      const R=[x0,y0,x1,y1];let bad=false;
      for(const p of placed)if(rtHit(R,[p.x0,p.y0,p.x1,p.y1],2)){bad=true;break;}
      if(!bad)for(const b of blocks)if(rtHit(R,b,1)){bad=true;break;}
      if(!bad)for(let i=0;i<heads.length;i++){const hd=heads[i];if(rtHit(R,[hd.x-hd.w/2,hd.y,hd.x+hd.w/2,hd.y+hd.h],1)){bad=true;break;}}
      if(bad)continue;
      // la línea hasta su figura no cruza otros rótulos ni cabezas
      const lx=Math.min(Math.max(q.x,x0+4),x1-4),ly=y1;let line=Math.hypot(q.x-lx,q.y-2-ly)>5;
      if(line){const n=Math.ceil(Math.hypot(q.x-lx,q.y-2-ly)/3);for(let i=1;i<n&&!bad;i++){const px=lx+(q.x-lx)*i/n,py=ly+(q.y-2-ly)*i/n,pr=[px-1,py-1,px+1,py+1];
        for(const p of placed)if(rtHit(pr,[p.x0,p.y0,p.x1,p.y1],0)){bad=true;break;}
        if(!bad&&q.prio>2)for(let j=0;j<heads.length;j++){if(j===q.id)continue;const hd=heads[j];if(rtHit(pr,[hd.x-hd.w/2,hd.y,hd.x+hd.w/2,hd.y+hd.h],0)){bad=true;break;}}}}
      if(bad)continue;best={x0,y0,x1,y1,name:q.name,puesto:pu,prio:q.prio,hx:q.x,hy:q.y-2,lx,ly,line,h1:Math.round(fs*1.45),fs2,ana:!!q.ana,grupo:!!(q.rot&&q.rot.grupo),vid:q.vid!=null?q.vid:null};bc=c;}
    if(best)placed.push(best);}
  cv.restore();return placed;}
function rtPaint(){const A=rtAreas();const fs=RT.fs;
  const all=RT.ana?[RT.ana].concat(RT.names):RT.names;const pl=rtLayout(all,RT.heads,RT.obst,A,fs);
  RT.last=pl;RT.lastHeads=RT.heads.slice();RT.lastUI=A.ui;RT.lastFs=fs;RT.lastArea=A;
  ctx.save();ctx.setTransform(rtD(),0,0,rtD(),0,0);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.strokeStyle='rgba(59,50,71,.6)';ctx.lineWidth=1;for(const p of pl)if(p.line){ctx.beginPath();ctx.moveTo(p.lx,p.ly);ctx.lineTo(p.hx,p.hy);ctx.stroke();}
  for(const p of pl){const w=p.x1-p.x0,h=p.y1-p.y0;ctx.globalAlpha=p.ana?1:.92;ctx.fillStyle=p.ana?'#ff8a5b':p.puesto?'rgba(255,244,214,.97)':'rgba(255,253,248,.95)';
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(p.x0,p.y0,w,h,6);else ctx.rect(p.x0,p.y0,w,h);ctx.fill();
    ctx.globalAlpha=1;ctx.fillStyle=p.ana?'#fff':'#3b3247';ctx.font=`900 ${fs}px Nunito, sans-serif`;ctx.fillText(p.name,(p.x0+p.x1)/2,p.y0+p.h1/2+.5);
    if(p.puesto){ctx.fillStyle='#7a4a22';ctx.font=`800 ${p.fs2}px Nunito, sans-serif`;ctx.fillText(p.puesto,(p.x0+p.x1)/2,p.y0+p.h1+(h-p.h1)/2-1);}}
  ctx.restore();}
{const _ds=drawScene;
drawScene=function(key,tt,night){RT.names=[];RT.heads=[];RT.obst=[];RT.ana=null;RT.on=true;let sc;
  try{sc=_ds.apply(this,arguments);}finally{RT.on=false;}
  RT.pend=true; // se pintan al acabar el fotograma, después del tinte de noche: son interfaz, no mundo
  return sc;};}
// apunta el nombre de la última figura pintada: para las escenas que dibujan a escala propia (criaturas) y antes ponían su etiqueta pequeña
function rotular(nombre,puesto,vid){if(!RT.on||!RT.heads.length||!nombre)return false;const id=RT.heads.length-1,h=RT.heads[id];RT.names.push({name:nombre,x:h.x,y:h.y,id,rot:puesto?{trab:true,puesto}:null,vid:vid!=null?vid:null});return true;}
// letreros de interfaz que una escena quiere encima de todo (la dirección de una casa)
function rotuloDespues(fn){if(!RT.on)return false;RT.post=RT.post||[];RT.post.push(fn);return true;}
{const _rn=render;
render=function(){RT.pend=false;RT.post=[];const r=_rn.apply(this,arguments);
  if(RT.pend){RT.pend=false;try{rtPaint();for(const fn of RT.post)fn();}catch(e){console.error('rótulos',e);}RT.post=[];}
  return r;};}
