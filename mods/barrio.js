// =================== EL MAPA DEL BARRIO: se abre, se recorre, se toca y se mira dentro ===================
// Dos vistas, las dos con el personaje donde esté (en casa o fuera) y sin tocar S.sim:
//  · el mapa: calles, lugares, edificios del censo y la casa. Se arrastra; se toca un edificio y sale su ficha.
//  · «mirar dentro»: la escena interior de un lugar a la hora actual, como observadora (sin el personaje).
// El mapa solo se calcula y se pinta mientras está abierto: cerrado, render() pasa de largo.
const BM={on:false,obs:null,S:null,pt:[0,0],pre:null,mapCam:null,rot:0,ficha:null,bx:null};
const bmD=()=>DATA.barrio||{edificios:{},suelo:[],calles:[],arboles:[]};
const BMX0=-14,BMX1=56,BMY0=-14,BMY1=51; // lo que se puede recorrer
// estado propio en S (con valores por defecto si falta): dónde se quedó el mapa
const BMS=()=>{const b=S.barrio||(S.barrio={});if(!(b.z>0))b.z=.3;if(typeof b.cx!=='number')b.cx=N/2;if(typeof b.cy!=='number')b.cy=N/2;return b;};
const bmDias=ds=>{if(!Array.isArray(ds)||ds.length>=7)return '';const n=['lun','mar','mié','jue','vie','sáb','dom'];
  if(ds.length>=5&&ds.every((d,i)=>d===ds[0]+i))return n[ds[0]]+'–'+n[ds[ds.length-1]];return ds.map(d=>n[d]).join(', ');};
const bmH=h=>{const m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0');};
const bmHm=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor((h%1)*60)).padStart(2,'0');
function bmName(k){const p=PLACES[k];if(!p)return k;if(k==='tienda'&&S.track==='negocio')return 'Tu tienda';if(k==='casaV'&&P_('vecina'))return 'Casa de '+P_('vecina').n;return p.n;}
// ---- los edificios del mapa: lugares, edificios del censo y la casa, con su caja (rect + alto) ----
function bmBoxes(){if(BM.bx)return BM.bx;const out=[],D=bmD();
  for(const k in PLACES){const p=PLACES[k];let h=p.park?26:Math.round((p.h||24)*1.5);if(k==='parroquia')h+=30;if(k==='obra')h+=44;if(k==='ayto')h+=32;if(p.roof)h+=14;
    out.push({id:k,kind:'lugar',r:p.r,h});}
  const ed=DATA.personas.edificios||{};
  for(const id in ed){const e=ed[id],b=D.edificios[id];if(!b)continue;const bl=e.tipo==='bloque';
    out.push({id,kind:'censo',r:b.r,h:bl?e.plantas*15+18:e.plantas*21+27,bl,pl:e.plantas,c:b.c,roof:b.roof,det:b.det});}
  out.push({id:'casa',kind:'casa',r:[6.5,7,13.5,12.5],h:66});
  for(const b of out)b.d=b.r[2]+b.r[3]-.5;
  return BM.bx=out;}
const bmProj=(u,v,z)=>{const [x,y]=P(u,v,z);return [cam.x+x*cam.z,cam.y+y*cam.z];};
function bmCvx(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
  for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}
  lo.pop();up.pop();return lo.concat(up);}
function bmHull(b){const pts=[];for(const [u,v] of [[b.r[0],b.r[1]],[b.r[2],b.r[1]],[b.r[2],b.r[3]],[b.r[0],b.r[3]]])for(const z of [0,b.h])pts.push(bmProj(u,v,z));return bmCvx(pts);}
function bmIn(h,x,y){let s=0;for(let i=0;i<h.length;i++){const a=h[i],b=h[(i+1)%h.length],c=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(c===0)continue;const g=c>0?1:-1;if(!s)s=g;else if(s!==g)return false;}return true;}
function bmBB(h){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of h){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return [x0,y0,x1,y1];}
const bmSee=bb=>bb[2]>-40&&bb[0]<W+40&&bb[3]>-40&&bb[1]<H+40;
// lo tocable ahora mismo, con su hull en pantalla (también lo usa la prueba)
function bmTargets(){return bmBoxes().map(b=>{const hull=bmHull(b),bb=bmBB(hull);return {id:b.id,kind:b.kind,d:b.d,hull,bb,cx:(bb[0]+bb[2])/2,cy:(bb[1]+bb[3])/2,box:b};});}
function bmAt(sx,sy){let best=null;for(const t of bmTargets()){if(sx<t.bb[0]||sx>t.bb[2]||sy<t.bb[1]||sy>t.bb[3])continue;if(bmIn(t.hull,sx,sy)&&(!best||t.d>best.d))best=t;}return best;}
// ---- cámara ----
function bmCenter(cx,cy,z){if(z)cam.z=z;const [u,v]=w2v(cx,cy),[x,y]=P(u,v);cam.x=W/2-x*cam.z;cam.y=H*.5-y*cam.z;}
function bmClamp(){cam.z=Math.max(.2,Math.min(1.5,cam.z));const [u,v]=screenToView(W/2,H*.5);let [x,y]=v2w(u,v);const nx=Math.max(BMX0,Math.min(BMX1,x)),ny=Math.max(BMY0,Math.min(BMY1,y));if(nx!==x||ny!==y)bmCenter(nx,ny);}
function bmSaveCam(){const [u,v]=screenToView(W/2,H*.5),[x,y]=v2w(u,v),b=BMS();b.cx=Math.round(x*10)/10;b.cy=Math.round(y*10)/10;b.z=Math.round(cam.z*100)/100;}
// ---- abrir y cerrar ----
function bmOpen(){if(BM.on){if(BM.obs)bmBack();return;}
  if(mode!=='live')return;
  BM.on=true;BM.obs=null;BM.S=S;BM.pre={cam:{x:cam.x,y:cam.y,z:cam.z},view:viewPlace,rot,scene:sceneKey};
  rot=0;viewPlace=false;sceneKey=null;BM.ficha=null;
  const b=BMS();bmCenter(b.cx,b.cy,b.z);bmClamp();
  document.body.classList.add('bm');bmUI();}
function bmClose(){if(!BM.on)return;
  if(BM.obs)bmBack(true);else bmSaveCam();
  BM.on=false;BM.obs=null;BM.ficha=null;const p=BM.pre;BM.pre=null;
  if(p){rot=p.rot;cam.x=p.cam.x;cam.y=p.cam.y;cam.z=p.cam.z;viewPlace=p.view;sceneKey=null;}
  document.body.classList.remove('bm','bmobs');menu.classList.remove('open');bmUI();}
// «mirar dentro»: la escena del lugar a la hora actual, sin mover a nadie
function bmLook(k){if(!BM.on||!SCENES[k])return false;
  bmSaveCam();BM.mapCam={x:cam.x,y:cam.y,z:cam.z};BM.obs=k;viewPlace=true;sceneKey=null;
  menu.classList.remove('open');document.body.classList.add('bmobs');bmUI();return true;}
function bmBack(quiet){if(!BM.obs)return;BM.obs=null;viewPlace=false;sceneKey=null;
  if(BM.mapCam){cam.x=BM.mapCam.x;cam.y=BM.mapCam.y;cam.z=BM.mapCam.z;}
  document.body.classList.remove('bmobs');if(!quiet)bmUI();}
// donde está de verdad el personaje: ahí no se oculta
const bmReal=k=>{const s=S.sim;return !!(s&&s.work>0&&s.dest===k);};
function bmSilent(fn,key,self,args){if(!BM.obs||bmReal(key))return fn.apply(self,args);const s=S.sim,o=s.outingActive;s.outingActive=null;try{const r=fn.apply(self,args);if(r&&r.ana&&typeof r.ana==='object')r.ana={...r.ana,x:-60,y:-60};return r;}finally{s.outingActive=o;}}
{const _a=awayKey;awayKey=function(){return (BM.on&&BM.obs)||_a.apply(this,arguments);};}
{const _sa=sceneAct;sceneAct=function(){return BM.on&&BM.obs&&!bmReal(BM.obs)?(((PLACES[BM.obs]||{}).outs||[])[0]||'work'):_sa.apply(this,arguments);};} // una salida o el trabajo que la escena conozca; la figura del personaje no se pinta
// el motor guarda la ruta del personaje al pintarla por primera vez: en el mapa se calcula pero no se guarda
{const _aa=anaAbroad;anaAbroad=function(tt){const s=S.sim,had=s&&('route' in s),old=s&&s.route;try{return _aa.apply(this,arguments);}finally{if(BM.on&&s&&!old){if(had)s.route=old;else delete s.route;}}};}
{const _bs=buildScene;buildScene=function(key,tt,night){return bmSilent(_bs,key,this,arguments);};}
{const _ds=drawScene;drawScene=function(key,tt,night){if(!BM.obs||bmReal(key))return _ds.apply(this,arguments);const s=S.sim,o=s.outingActive;s.outingActive=null;try{return _ds.apply(this,arguments);}finally{s.outingActive=o;}};}
{const _db=drawBubble;drawBubble=function(){if(BM.on&&BM.obs&&!bmReal(BM.obs))return;return _db.apply(this,arguments);};}
// mientras el mapa está abierto, el motor no mueve la cámara ni cambia de escena por su cuenta
{const _e=enterScene;enterScene=function(){if(BM.on)return;return _e.apply(this,arguments);};}
{const _l=leaveScene;leaveScene=function(){if(BM.on)return;return _l.apply(this,arguments);};}
{const _r=rotate;rotate=function(){if(BM.on)return;return _r.apply(this,arguments);};}
{const _m=setMode;setMode=function(m){if(m!=='live'&&BM.on)bmClose();return _m.apply(this,arguments);};}
{const _z=zoomAt;zoomAt=function(f,sx,sy){if(!(BM.on&&!BM.obs))return _z.apply(this,arguments);const nz=Math.max(.2,Math.min(1.5,cam.z*f)),k=nz/cam.z;cam.x=sx-(sx-cam.x)*k;cam.y=sy-(sy-cam.y)*k;cam.z=nz;};}
{const _lt=liveTap;liveTap=function(x,y){if(BM.on){try{if(!BM.obs)bmTap(BM.pt[0],BM.pt[1]);}catch(e){console.error(e);}return;}return _lt.apply(this,arguments);};}
addEventListener('pointerup',e=>{BM.pt=[e.clientX,e.clientY];},true);
// la interfaz de rótulos cuenta con la barra del mapa para no escribir debajo
{const _u=rtUI;rtUI=function(){const o=_u.apply(this,arguments);if(!BM.on)return o;const el=document.getElementById('brbar');if(!el)return o;const r=el.getBoundingClientRect();if(r.width<2)return o;
  RT.uiTop=Math.max(RT.uiTop||0,0);return o.concat([[r.left,r.top,r.right,r.bottom]]);};}
// ---- botones ----
function bmUI(){let bar=document.getElementById('brbar');
  if(!bar){bar=document.createElement('div');bar.id='brbar';document.body.appendChild(bar);
    bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='brback')bmBack();else if(b.id==='brclose')bmClose();});}
  const mb=document.getElementById('mapbtn');if(mb)mb.classList.toggle('on',BM.on);
  if(!BM.on){bar.innerHTML='';return;}
  if(BM.obs)bar.innerHTML=`<button class="glass" id="brback">◀ Volver al mapa</button><div class="glass brt">👁️ Mirando dentro: ${bmName(BM.obs)}<small>${bmReal(BM.obs)?'Ahí está ella ahora':'Solo miras: no entras'}</small></div>`;
  else bar.innerHTML=`<button class="glass" id="brclose">🏠 Cerrar el mapa</button><div class="glass brt">🗺️ El barrio<small>Arrastra para moverte · toca un edificio</small></div>`;}
{const st=document.createElement('style');st.textContent=`
#brbar{position:fixed;top:112px;left:8px;z-index:6;display:none;flex-direction:column;align-items:flex-start;gap:5px;max-width:calc(100vw - 64px)}
body.bm #brbar{display:flex}
#brbar button{border:0;border-radius:14px;padding:8px 13px;font-family:inherit;font-weight:900;font-size:13px;color:var(--ink);cursor:pointer}
#brbar .brt{border-radius:12px;padding:5px 10px;font-weight:900;font-size:12px;color:var(--ink);line-height:1.25}
#brbar .brt small{display:block;font-size:10.5px;font-weight:800;color:var(--sub)}
body.bm #placebtn{display:none!important}
body.bm #rotbtn,body.bm #wallsbtn{display:none!important}
body.obra #mapbtn{display:none}
#mapbtn.on{background:#ff8a5b;color:#fff}
`;document.head.appendChild(st);
  const side=document.getElementById('side');if(side&&!document.getElementById('mapbtn')){const b=document.createElement('div');b.className='pill glass';b.id='mapbtn';b.title='Mapa del barrio';b.textContent='🗺️';
    b.onclick=()=>{if(BM.on&&!BM.obs)bmClose();else bmOpen();};side.appendChild(b);}
  const c=document.getElementById('center');if(c){const _c=c.onclick;c.onclick=function(){if(BM.on){if(!BM.obs){bmCenter(N/2,N/2);bmClamp();}return;}return _c&&_c.apply(this,arguments);};}}
// ---- fichas ----
function bmEstado(k){const st=placeState(k),o=[];if(st.closed)o.push('cerrado por huelga');if(st.forRent)o.push('cerrado: se alquila');return o.join(' · ');}
function bmSchedule(k){const p=PLACES[k],rows=[],ESC=typeof ESC_T!=='undefined'?ESC_T[k]:null;
  if(ESC)rows.push(['🎒','Clases','lun–vie · '+bmH(ESC.ent[0]+.5)+' a '+bmH(ESC.sal[0])]);
  for(const o of p.outs||[]){const q=OUT[o];if(!q||o==='comedor')continue;const nm=typeof outName==='function'?outName(o):q.n;rows.push([q.e||'•',nm,(q.h?`${bmH(q.h[0])} a ${bmH(q.h[1])}`:'')+(q.wd?(q.h?' · ':'')+bmDias(q.wd):'')]);}
  return rows;}
function bmFicha(id){const b=bmBoxes().find(x=>x.id===id);if(!b)return false;BM.ficha=id;const ed=DATA.personas.edificios||{};
  let h='';
  if(b.kind==='casa'){const hm=HOMES[(S.home&&S.home.type)||'casita']||{};
    h=`<h2>🏠 Tu casa</h2><div class="sub">${CH().name} vive aquí${hm.n?': '+hm.n.toLowerCase():''}.</div>`;
    h+=`<div class="kv"><span>📍 Dónde</span><span>${S.sim.work>0?'fuera ahora':'en casa'}</span></div>`;
    h+=`<button class="btn" id="brhome">🏠 Volver a casa</button><button class="btn grey" id="brx">Cerrar</button>`;}
  else if(b.kind==='censo'){const e=ed[id],V=DATA.personas.vecinos,H=DATA.personas.hogares;
    const hs=Object.entries(H).filter(([,q])=>q.edificio===id).sort((a,c)=>String(a[1].puerta||'').localeCompare(String(c[1].puerta||''),'es'));
    const gente=hs.reduce((s,[,q])=>s+q.miembros.length,0);
    h=`<h2>${e.tipo==='bloque'?'🏢':'🏠'} ${e.n}</h2><div class="sub">${e.d}</div>`;
    h+=`<div class="kv"><span>🏗️ Plantas</span><span>${e.plantas}</span></div><div class="kv"><span>👥 Gente</span><span>${gente} ${gente===1?'persona':'personas'} en ${hs.length} ${hs.length===1?'hogar':'hogares'}</span></div>`;
    h+=`<div class="clab">${e.tipo==='bloque'?'Hogares del bloque':'Hogar'}</div>`;
    for(const [hid,q] of hs){const n=q.miembros.length;h+=`<div class="outrow"><span class="oe">${e.tipo==='bloque'?'🚪':'🏠'}</span><span class="ot"><b>${q.n}</b><small>${q.puerta?q.puerta+' · ':''}${n} ${n===1?'persona':'personas'}</small></span></div>`;}
    if(!hs.length)h+=`<div class="sub">Ahora mismo no hay nadie registrado.</div>`;
    h+=`<button class="btn grey" id="brx">Cerrar</button>`;}
  else{const p=PLACES[id],hr=S.t/60,wd=dateOf(S.day).wd,es=bmEstado(id);
    h=`<h2>${p.e} ${bmName(id)}</h2><div class="sub">${id==='casaV'&&P_('vecina')?`Aquí vive ${P_('vecina').n}. Relación: ${relLabel(P_('vecina').rel)}.`:p.d||'Una casa del barrio.'}</div>`;
    if(es)h+=`<div class="kv"><span>🪧 Hoy</span><span>${es}</span></div>`;
    const rows=bmSchedule(id);
    if(rows.length){h+=`<div class="clab">Qué se hace y cuándo</div>`;for(const [e,n,w] of rows)h+=`<div class="outrow"><span class="oe">${e}</span><span class="ot"><b>${n}</b>${w?`<small>${w}</small>`:''}</span></div>`;}
    let ve=[];try{ve=vecinosEn(id,hr,wd);}catch(x){console.error(x);}
    const tr=ve.filter(q=>q.motivo==='trabajo'),cl=ve.filter(q=>q.motivo==='clase'),otros=ve.filter(q=>q.motivo!=='trabajo'&&q.motivo!=='clase');
    h+=`<div class="clab">Ahora, a las ${bmHm(hr)}</div>`;
    const lista=(ico,tit,arr,puesto)=>{if(!arr.length)return '';const sh=arr.slice(0,8).map(q=>q.v.n+(puesto&&pbPuesto(q.v)?' ('+pbPuesto(q.v)+')':'')).join(', ');
      return `<div class="outrow"><span class="oe">${ico}</span><span class="ot"><b>${tit} · ${arr.length}</b><small>${sh}${arr.length>8?' y '+(arr.length-8)+' más':''}</small></span></div>`;};
    if(es&&/huelga/.test(es)&&!ve.length)h+=`<div class="sub">Persianas bajadas.</div>`;
    h+=lista('💼','Trabajan',tr,true)+lista('🎒','Estudian',cl,false)+lista('🧍','Están',otros,false);
    if(!ve.length)h+=`<div class="sub">Nadie del censo a esta hora.</div>`;
    h+=SCENES[id]?`<button class="btn" id="brin">👁️ Mirar dentro</button>`:`<div class="sub">Casa particular: desde la calle no se ve más.</div>`;
    h+=`<button class="btn grey" id="brgo">🚶 Ir allí…</button><button class="btn grey" id="brx">Cerrar</button>`;}
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  const on=(i,f)=>{const el=card.querySelector('#'+i);if(el)el.onclick=f;};
  on('brx',()=>{menu.classList.remove('open');BM.ficha=null;});
  on('brin',()=>{BM.ficha=null;bmLook(id);});
  on('brgo',()=>{bmClose();openPlace(id);});
  on('brhome',()=>{bmClose();});
  return true;}
function bmTap(sx,sy){
  if(RT&&RT.last){for(const p of RT.last){if(sx>=p.x0&&sx<=p.x1&&sy>=p.y0&&sy<=p.y1&&p.bmid){sfx('tap');return bmFicha(p.bmid);}}}
  const t=bmAt(sx,sy);if(!t)return false;sfx('tap');return bmFicha(t.id);}
// ---- dibujo ----
function bmGround(night){
  drawBarrioGround(night);const D=bmD();
  for(const q of D.suelo||[]){const a=vrect(q);prism(a[0],a[1],a[2],a[3],-30,-4,'#7d6a55');prism(a[0],a[1],a[2],a[3],-4,0,'#cfc7b6');topQuad(a[0],a[1],a[2],a[3],.02,'#d5cebe');}
  for(const c of D.calles||[]){const a=vrect(c.r),w=a[2]-a[0],d=a[3]-a[1];
    topQuad(a[0],a[1]-0,a[2],a[3],.03,'#dcd6c8');
    const pad=Math.min(.6,Math.min(w,d)*.2),q=w>d?[a[0],a[1]+pad,a[2],a[3]-pad]:[a[0]+pad,a[1],a[2]-pad,a[3]];topQuad(q[0],q[1],q[2],q[3],.05,'#5d6168');
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.4;ctx.setLineDash([7,9]);ctx.beginPath();
    if(w>d){const p0=P((q[0]),(q[1]+q[3])/2,.07),p1=P(q[2],(q[1]+q[3])/2,.07);ctx.moveTo(...p0);ctx.lineTo(...p1);}else{const p0=P((q[0]+q[2])/2,q[1],.07),p1=P((q[0]+q[2])/2,q[3],.07);ctx.moveTo(...p0);ctx.lineTo(...p1);}
    ctx.stroke();ctx.setLineDash([]);}
}
function bmArbol(x,y){const [px,py]=P(x,y),se=seasonOf();capsule(px,py,px,py-13,2.6,'#6b4a2e');
  if(se==='inv'){capsule(px,py-12,px-4,py-20,1.4,'#6b4a2e');capsule(px,py-12,px+5,py-19,1.4,'#6b4a2e');return;}
  const c={pri:'#5cae4c',ver:'#4a9a43',oto:'#d98b2e'}[se];circ(px,py-21,8,c);circ(px-4,py-18,6,c);circ(px+5,py-18,5.5,c);}
const bmLit=(night,k,id)=>night>.3&&hash(k+id.length*31+Math.floor(S.day/3))>.4;
function bmBloque(b,night){const [u0,v0,u1,v1]=b.r,n=b.pl,fh=15,H=n*fh+6,col=b.c||'#c9a07a',cu=(u0+u1)/2;
  topQuad(u0-.5,v1,u1+.5,v1+1.2,.1,'#cfc9bb');
  prismG(u0,v0,u1,v1,0,H,col);
  poly([P(u0,v1,0),P(u1,v1,0),P(u1,v1,6),P(u0,v1,6)],shade(col,.62));poly([P(u1,v0,0),P(u1,v1,0),P(u1,v1,6),P(u1,v0,6)],shade(col,.5));
  for(let f=0;f<n;f++){const z=9+f*fh;let k=0;
    for(let u=u0+.7;u<u1-1.0;u+=1.55){k++;if(f===0&&Math.abs(u+.4-cu)<1.1)continue;const on=bmLit(night,f*13+k,b.id);
      poly([P(u,v1,z),P(u+.85,v1,z),P(u+.85,v1,z+8),P(u,v1,z+8)],on?'#ffe08a':'rgba(58,72,98,.78)');
      poly([P(u-.12,v1,z-.5),P(u+.97,v1,z-.5),P(u+.97,v1+.28,z-.5),P(u-.12,v1+.28,z-.5)],'#efe9de');poly([P(u-.12,v1+.28,z-.5),P(u+.97,v1+.28,z-.5),P(u+.97,v1+.28,z+3),P(u-.12,v1+.28,z+3)],'#b9b2a4');}
    k=0;for(let v=v0+.7;v<v1-.8;v+=1.55){k++;const on=bmLit(night,f*17+k+7,b.id);poly([P(u1,v,z),P(u1,v+.85,z),P(u1,v+.85,z+8),P(u1,v,z+8)],on?'#ffe08a':'rgba(48,60,84,.78)');}
    if(f>0)poly([P(u0,v1,f*fh+5),P(u1,v1,f*fh+5),P(u1,v1,f*fh+6.4),P(u0,v1,f*fh+6.4)],shade(col,.82));}
  // portal con marquesina
  poly([P(cu-.32,v1,0),P(cu+.32,v1,0),P(cu+.32,v1,13),P(cu-.32,v1,13)],'#3f3430');poly([P(cu-.24,v1,0),P(cu+.24,v1,0),P(cu+.24,v1,12),P(cu-.24,v1,12)],night>.3?'#ffd27a':'#8fb4c9');
  prism(cu-.5,v1,cu+.5,v1+.45,13,14.5,'#7a6a5c');
  // azotea: pretil, depósito y antena
  topQuad(u0,v0,u1,v1,H,shade(col,.9));prism(u0,v1-.18,u1,v1,H,H+3.5,shade(col,1.12));prism(u1-.18,v0,u1,v1-.18,H,H+3.5,shade(col,1.0));
  cyl(u0+1.2,v0+1.2,.55,H,H+9,'#9aa3ad','#b5bcc4');const [ax,ay]=P(u1-1.2,v0+1.4,H),[bx,by]=P(u1-1.2,v0+1.4,H+16);capsule(ax,ay,bx,by,1.1,'#555');capsule(bx-4,by+3,bx+4,by+3,1.1,'#555');}
function bmCasa(b,night,big){const [u0,v0,u1,v1]=b.r,n=b.pl||1,cu=(u0+u1)/2,cv=(v0+v1)/2,wall=b.c||'#e7d3b4',roof=b.roof||'#a5533e',bh=big?34:n*21+5,rise=big?22:Math.min(20,(v1-v0)*5.2),w=u1-u0;
  topQuad(u0-.5,v1,u1+.5,v1+1.3,.1,b.det==='huerto'?'#9ec27a':'#93c46f');
  if(b.det==='huerto'){for(let k=0;k<4;k++)topQuad(u0,v0-1.6+k*.0,u1,v0-1.15+k*.0,.12,'#7aa85a');for(let k=0;k<3;k++){const y=v0-1.55+k*.45;topQuad(u0+.2,y,u1-.2,y+.22,.13,'#5f9143');}}
  prismG(u0,v0,u1,v1,0,bh,wall);
  poly([P(u0-.25,v1+.3,bh-1),P(u1+.25,v1+.3,bh-1),P(u1+.25,cv,bh+rise),P(u0-.25,cv,bh+rise)],roof);
  poly([P(u1+.25,v1+.3,bh-1),P(u1+.25,v0-.2,bh-1),P(u1+.25,cv,bh+rise)],shade(roof,.72));
  poly([P(u1,v0,bh),P(u1,v1,bh),P(u1,cv,bh+rise-1)],shade(wall,.75));
  prismG(u0+w*.14,cv-.5,u0+w*.14+.34,cv-.16,bh+rise*.62,bh+rise+9,'#8a6a5a');
  const win=(u,z)=>{const on=night>.3&&hash(Math.round(u*9+z)+b.id.length)>.3;poly([P(u,v1,z),P(u+.7,v1,z),P(u+.7,v1,z+7),P(u,v1,z+7)],on?'#ffe08a':'#7fa6c2');poly([P(u+.33,v1,z),P(u+.37,v1,z),P(u+.37,v1,z+7),P(u+.33,v1,z+7)],'rgba(255,255,255,.7)');};
  const dx=big?cu-.35:u0+w*.5-.35;
  poly([P(dx,v1,0),P(dx+.7,v1,0),P(dx+.7,v1,15),P(dx,v1,15)],'#6b4a35');if(big)topQuad(dx-.1,v1,dx+.8,N,.12,'#d8cfbd');
  for(let f=0;f<n;f++){const z=f===0?9:9+f*21;let u=u0+.4;while(u<u1-.6){if(f===0&&u+.7>dx-.15&&u<dx+.85){u+=1.2;continue;}win(u,z);u+=big?1.9:1.2;}}
  if(b.det==='local'){poly([P(u0+.2,v1+.5,12),P(u0+w*.5-.5,v1+.5,12),P(u0+w*.5-.5,v1,17),P(u0+.2,v1,17)],'#d1242f');for(let k=0;k<3;k++)poly([P(u0+.2+k*.5,v1+.5,12),P(u0+.45+k*.5,v1+.5,12),P(u0+.45+k*.5,v1,17),P(u0+.2+k*.5,v1,17)],'#fffdf8');}
  if(b.det==='parra'){for(let k=0;k<4;k++){const [x,y]=P(dx+.35+(k%2?.5:-.2),v1+.05,9+k*3);circ(x,y,3,'#5f9143');}}
  if(b.det==='patio'){prism(u1+.15,v0+.2,u1+1.7,v1,0,5,'#d9cfbb');topQuad(u1+.15,v0+.2,u1+1.7,v1,5.1,'#c9b48a');}
  if(b.det==='adosada'){const [x0,y0]=P(cu,v1,0),[x1,y1]=P(cu,v1,bh);capsule(x0,y0,x1,y1,1.4,shade(wall,.7));}
  if(!big){for(let k=0;k<=3;k++){const [x,y]=P(u0-.2+k*(w+.4)/3,v1+1.1,0);capsule(x,y,x,y-5,1.2,'#f4f1ea');}}}
function bmCasaJug(night,tt){const b={id:'casa',r:[6.5,7,13.5,12.5],pl:1,c:'#f1dcc0',roof:'#b5543c'};bmCasa(b,night,true);
  // el vallado y el pulso naranja que la señalan
  ctx.save();ctx.strokeStyle='rgba(255,138,91,.95)';ctx.lineWidth=3;ctx.setLineDash([9,6]);ctx.lineDashOffset=-tt*14;ctx.beginPath();
  const q=[P(1,1,.2),P(N-1,1,.2),P(N-1,N-1,.2),P(1,N-1,.2)];ctx.moveTo(...q[0]);for(const p of q.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.restore();}
function bmItems(tt,night){const r=barrioItems(tt,night),items=r.items.map(x=>({d:x.d,f:x.f})),D=bmD();
  for(const b of bmBoxes()){if(b.kind==='lugar')continue;const bb=bmBB(bmHull(b));if(!bmSee(bb))continue;
    if(b.kind==='casa')items.push({d:b.d,f:()=>bmCasaJug(night,tt)});else items.push({d:b.d,f:()=>b.bl?bmBloque(b,night):bmCasa(b,night,false)});}
  for(const [x,y] of D.arboles||[]){const [u,v]=w2v(x,y);items.push({d:u+v,f:()=>bmArbol(u,v)});}
  items.sort((a,b)=>a.d-b.d);return {items,ab:r.ab};}
// cada edificio de lugar se pinta con el dibujo de siempre, solo si se ve; y con su emoji en la fachada para reconocerlo de lejos
{const _db=drawBuilding;drawBuilding=function(key,tt,night){if(!BM.on)return _db.apply(this,arguments);
  const b=bmBoxes().find(x=>x.id===key);if(b&&!bmSee(bmBB(bmHull(b))))return;
  const r=_db.apply(this,arguments);return r;};}
function bmRender(){
  LAWN=lawnBase();const night=nightFactor(),tt=performance.now()/1000;
  if(BM.S!==S){bmClose();return false;}
  bmClamp();
  ctx.setTransform(DPR,0,0,DPR,0,0);drawSky(night,tt);
  ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z,DPR*cam.x,DPR*cam.y);
  RT.names=[];RT.heads=[];RT.obst=[];RT.ana=null;RT.on=true;
  try{bmGround(night);const {items,ab}=bmItems(tt,night);for(const it of items)it.f();drawStreetLights(night);
    const s=S.sim;if(s.work>0&&s.dest&&PLACES[s.dest]&&ab&&ab.inside)drawPin(s.dest,tt);
  }finally{RT.on=false;}
  // la luz de la hora, como en la casa
  {const h=S.t/60,warm=Math.max(0,1-Math.abs(h-7.2)/1.8)*.55+Math.max(0,1-Math.abs(h-18.6)/2)*.8;
    if(warm>.02&&night<1){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle=mixHex('#ffffff','#ffc890',Math.min(1,warm)*.5);ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();}
    if(night>0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(20,25,70,${night*.36})`;ctx.fillRect(0,0,cv.width,cv.height);
      // la luz de las ventanas: un halo cálido en cada edificio que se ve
      ctx.globalCompositeOperation='lighter';ctx.setTransform(DPR,0,0,DPR,0,0);
      for(const t of bmTargets()){if(!bmSee(t.bb)||t.kind==='lugar'&&PLACES[t.id].park)continue;const R=Math.max(34,(t.bb[2]-t.bb[0])*.6),x=t.cx,y=t.bb[3]-(t.bb[3]-t.bb[1])*.35;
        const g=ctx.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,`rgba(255,196,110,${.26*night})`);g.addColorStop(1,'rgba(255,196,110,0)');ctx.fillStyle=g;ctx.fillRect(x-R,y-R,2*R,2*R);}
      ctx.restore();}}
  bmLabels();return true;}
// rótulos del mapa: los mismos de las escenas (mods/rotulos.js), letra fija y sin pisarse
function bmLabels(){const T=bmTargets().filter(t=>bmSee(t.bb));
  for(const t of T){const b=t.box;let name,pri=3,puesto=null;
    if(b.kind==='casa'){name='🏠 Tu casa';pri=0;}
    else if(b.kind==='censo'){name=(b.bl?'🏢 ':'🏠 ')+bmD().edificios[b.id].rotulo;}
    else{name=PLACES[b.id].e+' '+bmName(b.id);pri=2;if(bmEstado(b.id))puesto='cerrado';}
    RT.names.push({name,x:t.cx,y:t.bb[1]+(b.kind==='lugar'&&PLACES[b.id].park?10:0),id:-1,prio:pri,rot:puesto?{puesto}:null,bmid:b.id});}
  RT.pend=true;}
{const _lay=rtLayout;rtLayout=function(names,heads,obst,A,fs){const out=_lay.apply(this,arguments);
  if(BM.on&&!BM.obs){const by=new Map();for(const q of names)if(q.bmid)by.set(q.name,q.bmid);for(const p of out){const id=by.get(p.name);if(id)p.bmid=id;}}return out;};}
{const _rn=render;render=function(){if(BM.on){if(mode!=='live'){bmClose();}else if(!BM.obs){bmRender();return;}}return _rn.apply(this,arguments);};}
// el botón del mapa y el estado propio existen desde el principio
bmUI();
