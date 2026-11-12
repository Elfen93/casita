// ---------- obra: construir y comprar con el dedo ----------
// Táctil en Construir/Comprar: 1 dedo desplaza; tocar crea un borrador (fantasma) que se confirma con ✓;
// mantener pulsado un instante dibuja; 2 dedos siempre mueven/hacen zoom (y giran la cámara) y anulan lo que se estuviera dibujando.
const OB={ptrs:new Map(),g:null,draft:null,sel:null,pv:null,touch:!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),cls:null};
const obSig=()=>tool?JSON.stringify(tool):'';
const obClamp=c=>[Math.max(0,Math.min(N-1,c[0])),Math.max(0,Math.min(N-1,c[1]))];
function obScr(x,y){const [u,v]=w2v(x,y);const [px,py]=P(u,v);return [cam.x+px*cam.z,cam.y+py*cam.z];}
const obCC=(x,y)=>obScr(x+.5,y+.5);
const obLocked=()=>typeof HT==='function'&&HT().build!=='all';
const obEl=id=>document.getElementById(id);
{const st=document.createElement('style');st.textContent=`
#obstrip{display:none;align-items:center;gap:6px;margin:0 0 5px}
body.obra #obstrip{display:flex}
body.obra.obbar #obstrip{display:none}
body.obra #hint{display:none}
#obtxt{flex:1;min-width:0;min-height:44px;display:flex;align-items:center;gap:6px;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:800;color:var(--ink);line-height:1.25}
#obtxt .chip{flex:0 1 auto;display:inline-flex;align-items:center;gap:4px;background:var(--accent);color:#fff;border-radius:11px;padding:3px 3px 3px 9px;font-weight:900;font-size:12.5px;max-width:58%;min-width:0;white-space:nowrap}
#obtxt .chip span{overflow:hidden;text-overflow:ellipsis}
#obtxt .chip button{border:0;background:rgba(255,255,255,.25);color:#fff;border-radius:9px;width:34px;height:34px;font-size:15px;font-weight:900;cursor:pointer;flex:0 0 auto}
#obtxt .tx{flex:1 1 40%;min-width:0;font-size:11.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#obtxt .lk{color:#8a3b2e}
.obb{flex:0 0 auto;width:48px;height:48px;border-radius:14px;border:1px solid var(--line);font-size:22px;font-weight:900;color:var(--ink);cursor:pointer;font-family:inherit}
.obb:disabled{opacity:.35}
body.obra #cats .cat{min-height:42px;padding:6px 12px;font-size:13px}
body.obra #palette{gap:7px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 8px,#000 calc(100% - 26px),transparent);mask-image:linear-gradient(90deg,transparent 0,#000 8px,#000 calc(100% - 26px),transparent);padding-right:24px}
body.obra .tool{min-width:68px;max-width:92px;min-height:66px;padding:6px 6px 5px;display:flex;flex-direction:column;align-items:center;justify-content:center}
body.obra .tool .n{font-size:11px;line-height:1.12;white-space:normal;overflow-wrap:anywhere}
body.obra .tool .p{font-size:10.5px}
body.obra .tool.on{box-shadow:0 0 0 3px var(--accent),0 4px 12px rgba(30,20,50,.15)}
#obar{position:fixed;left:8px;right:8px;z-index:7;display:none;flex-direction:column;gap:6px;border-radius:18px;padding:7px 8px 8px;max-width:520px;margin:0 auto}
#obar.on{display:flex}
#obar .ot{display:flex;align-items:center;gap:8px;font-weight:900;font-size:12.5px;color:var(--ink);padding:0 3px}
#obar .ot b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#obar .ot i{font-style:normal;font-size:12.5px;color:#2f8a5a;white-space:nowrap}
#obar .ot i.bad{color:var(--bad)}
#obar .ob{display:flex;gap:7px}
#obar .ob button{flex:1;min-height:48px;min-width:50px;border:1px solid var(--line);background:#fffdf8;border-radius:14px;font-family:inherit;font-weight:900;font-size:14.5px;color:var(--ink);cursor:pointer;padding:4px 8px;line-height:1.1}
#obar .ob button small{display:block;font-size:11px;font-weight:800;opacity:.8}
#obar .ob button.x{flex:0 0 54px;font-size:19px}
#obar .ob button.ok{flex:2;background:var(--accent);border-color:var(--accent);color:#fff}
#obar .ob button.red{color:#a33a2c}
#obar .ob button:disabled{opacity:.4}
#obar .ob button.ok:disabled{background:#cfc6bf;border-color:#cfc6bf;opacity:1}
`;document.head.appendChild(st);}
{const b=obEl('bottom');const s=document.createElement('div');s.id='obstrip';
  s.innerHTML=`<div id="obtxt" class="glass"></div><button class="obb glass" id="undob" title="${TXN.obra_tactil.deshacer}">↶</button><button class="obb glass" id="redob" title="${TXN.obra_tactil.rehacer}">↷</button>`;
  b.insertBefore(s,b.firstChild);
  const a=document.createElement('div');a.id='obar';a.className='glass';document.body.appendChild(a);}
function obClear(keepSel){
  const d=OB.draft;OB.draft=null;OB.pv=null;preview=null;
  if(d){hover=null;pointerScreen=null;if(d.k==='pt'&&tool&&tool.kind==='move'&&S.held)returnHeld();}
  if(!keepSel)OB.sel=null;
}
function obIsTouch(){return OB.touch;}
// ¿qué hace la herramienta? (para la tira de ayuda)
function obHow(){
  if(!tool)return mode==='buy'?(OB.touch?TXN.obra_tactil.how_buy_touch:TXN.obra_tactil.how_buy_click):TXN.obra_tactil.how_build;
  const k=tool.kind,T=OB.touch;
  if(DRAG_KINDS.includes(k))return T?TXN.obra_tactil.how_drag_touch:TXN.obra_tactil.how_drag_mouse;
  if(k==='obj'||k==='craft')return T?TXN.obra_tactil.how_obj_touch:TXN.obra_tactil.how_obj_click;
  if(k==='move')return S.held?(T?TXN.obra_tactil.how_move_touch:TXN.obra_tactil.how_move_click):TXN.obra_tactil.how_move_pick;
  if(k==='paint')return T?TXN.obra_tactil.how_paint_touch:TXN.obra_tactil.how_paint_click;
  if(k==='del')return T?TXN.obra_tactil.how_del_touch:TXN.obra_tactil.how_del_click;
  if(k==='door')return TXN.obra_tactil.how_door;
  if(k==='win')return TXN.obra_tactil.how_win;
  if(k==='rot')return TXN.obra_tactil.how_rot;
  return '';
}
function obStrip(){
  const el=obEl('obtxt');if(!el)return;
  if(mode==='live'){el.innerHTML='';return;}
  let h='';
  if(tool){const b=palette.querySelector('.tool.on');let nm='';
    if(b){const e=b.querySelector('.e'),n=b.querySelector('.n');nm=(e?e.textContent.trim()+' ':'')+(n?n.textContent:'');}
    else if(tool.kind==='move')nm=TXN.obra_tactil.mover;else if(tool.kind==='obj'||tool.kind==='craft')nm=(OBJ[tool.v].e||'🌿')+' '+OBJ[tool.v].n;
    h+=`<span class="chip"><span>${nm||TXN.obra_tactil.herramienta}</span><button id="obnot" title="${TXN.obra_tactil.soltar_herramienta}">✕</button></span>`;}
  let tx=obHow();
  if(obLocked()){const tk=(S.home&&S.home.type)||'casita';const wh=tk==='padres'||tk==='habitacion'||tk==='infra'?TXN.obra_tactil.tu_cuarto:TXN.obra_tactil.tu_casa;
    if(mode==='build'&&(!tool||!['paint'].includes(tool.kind)))tx=`<span class="lk">${huecos(TXN.obra_tactil.lock_solo_pintar,{wh})}</span> `+(tool?tx:'');
    else tx=`<span class="lk">${huecos(TXN.obra_tactil.lock_solo_tocar,{wh})}</span> `+tx;}
  h+=`<span class="tx">${tx}</span>`;
  el.innerHTML=h;
  const nb=obEl('obnot');if(nb)nb.onclick=()=>{returnHeld();obClear();tool=null;buildPalette();};
}
function obDraftCost(d){
  if(d.k==='pt'){const t=tool;if(!t)return 0;if(t.kind==='craft')return craftMat(t.v);return costOf(d.x,d.y,t);}
  return OB.pv?OB.pv.cost:0;
}
function obDraftState(){
  const d=OB.draft;if(!d)return null;
  if(d.k==='pt'){const t=tool;const ok=canApply(d.x,d.y,t);const c=obDraftCost(d);
    let why='';if(!ok)why=obLocked()&&!inArea(d.x,d.y)?TXN.obra_tactil.fuera_zona:TXN.obra_tactil.no_cabe;else if(S.money<c)why=TXN.obra_tactil.no_llega;
    let nm='';if(t.kind==='obj'||t.kind==='craft')nm=`${OBJ[t.v].e||'🌿'} ${OBJ[t.v].n}${t.kind==='obj'?' '+TIERS[t.q??3].e:' 🪚'}`;else if(t.kind==='move'&&S.held)nm=`✋ ${OBJ[S.held.t].e||'🌿'} ${OBJ[S.held.t].n}`;
    return {ok:!why,why,cost:c,nm};}
  const pv=OB.pv;if(!pv)return null;const n=pv.walls.size-pv.bad.size+pv.floors.size;
  let why='';if(pv.small)why=TXN.obra_tactil.minimo_3x3;else if(!n)why=obLocked()?TXN.obra_tactil.sin_obras:TXN.obra_tactil.nada_que_construir;else if(S.money<pv.cost)why=TXN.obra_tactil.no_llega;
  return {ok:!why,why,cost:pv.cost,nm:pv.label};
}
function obBar(){
  const bar=obEl('obar');if(!bar)return;
  const show=(h)=>{bar.innerHTML=h;bar.classList.add('on');document.body.classList.add('obbar');const b=obEl('bottom');bar.style.bottom=(b?b.offsetHeight+6:150)+'px';};
  const hide=()=>{bar.classList.remove('on');document.body.classList.remove('obbar');};
  if(mode==='live'){hide();return;}
  const d=OB.draft;
  if(d){const st=obDraftState();if(!st){hide();return;}
    const sh=d.k==='shape',gt=!sh&&ghostType();
    const verb=sh?(tool.kind==='floor'?TXN.obra_tactil.v_poner_suelo:TXN.obra_tactil.v_construir):tool.kind==='move'?TXN.obra_tactil.v_dejar:tool.kind==='craft'?TXN.obra_tactil.v_encargar:TXN.obra_tactil.v_colocar;
    show(`<div class="ot"><b>${st.nm}</b><i class="${st.ok?'':'bad'}">${st.why||(st.cost?fmt(st.cost):TXN.obra_tactil.gratis)}</i></div>
      <div class="ob"><button class="x" id="obx" title="${TXN.obra_tactil.cancelar}">✕</button>${gt?`<button id="obrot">${TXN.obra_tactil.girar}</button>`:''}<button class="ok" id="obok" ${st.ok?'':'disabled'}>✓ ${verb}${st.cost?`<small>${fmt(st.cost)}</small>`:''}</button></div>`);
    obEl('obx').onclick=()=>{obClear();sfx('tap');obRefresh();};
    obEl('obok').onclick=obConfirm;
    const rb=obEl('obrot');if(rb)rb.onclick=()=>{const t=ghostType();const cur=d.r!=null?d.r:OB.of(t,d.x,d.y);d.r=(cur+1)%4;sfx('pick');obRefresh();};
    return;}
  const s=OB.sel;
  if(s&&S.obj[s.i]){const o=S.obj[s.i],D=OBJ[o.t],x=s.i%N,y=s.i/N|0;
    const can=k=>canApply(x,y,{kind:k});const mine=can('move');
    const cond=D.need?huecos(TXN.obra_tactil.estado,{x:Math.round(condOf(o))}):'';
    const q=o.q??3;const rep=mine&&D.need&&buyTier<5&&buyTier!==q;
    show(`<div class="ot"><b>${D.e||'🌿'} ${D.n} ${TIERS[q].e}${cond}</b><i class="${mine?'':'bad'}">${mine?'':TXN.obra_tactil.no_es_tuyo}</i></div>
      <div class="ob"><button id="obmv" ${mine?'':'disabled'}>${TXN.obra_tactil.mover}</button><button id="obrt" ${can('rot')?'':'disabled'}>${TXN.obra_tactil.girar}</button><button id="obsell" class="red" ${can('del')?'':'disabled'}>${TXN.obra_tactil.vender}<small>+${fmt(sellValue(o))}</small></button>${rep?`<button id="obq">🔁 ${TIERS[buyTier].e}<small>${TIERS[buyTier].n}</small></button>`:''}<button class="x" id="obx">✕</button></div>`);
    obEl('obx').onclick=()=>{OB.sel=null;obRefresh();};
    obEl('obrt').onclick=()=>{beginStroke();apply(x,y,{kind:'rot'});endStroke();obRefresh();};
    obEl('obsell').onclick=()=>{beginStroke();apply(x,y,{kind:'del'});endStroke();OB.sel=null;obRefresh();};
    obEl('obmv').onclick=()=>{OB.sel=null;returnHeld();tool={kind:'move'};buildPalette();beginStroke();const ok=apply(x,y,tool);endStroke();if(ok)OB.draft={k:'pt',x,y,r:null,sig:obSig()};obRefresh();};
    const qb=obEl('obq');if(qb)qb.onclick=()=>{const [k,l]=stepReq({k:'replace',i:s.i});if(lvl(k)<l)hireFor(s.i,'replace');else{orderReplace(s.i,true);toast(huecos(TXN.obra_tactil.ana_cambia,{t:TIERS[buyTier].n.toLowerCase()}));}OB.sel=null;obRefresh();};
    return;}
  OB.sel=null;hide();
}
function obRefresh(){obStrip();obBar();}
// si el borrador o el mueble elegido quedan debajo de la barra, sube la vista un poco
function obNudge(){const d=OB.draft,s=OB.sel;let p=null;if(d)p=d.k==='pt'?[d.x,d.y]:d.b;else if(s)p=[s.i%N,s.i/N|0];if(!p)return;
  const bar=obEl('obar');const top=bar&&bar.classList.contains('on')?bar.getBoundingClientRect().top:obEl('bottom').getBoundingClientRect().top;
  const [,y]=obCC(p[0],p[1]);const lim=top-40;if(y>lim){camVel.x=0;camVel.y=-Math.min(1500,(y-lim)*5);}}
function obPreview(){const d=OB.draft;if(!d||d.k!=='shape'||!tool)return;OB.pv=buildPreview(d.a,d.b);preview=OB.pv;}
function obConfirm(){
  const d=OB.draft;if(!d||!tool)return;const st=obDraftState();
  if(!st||!st.ok){sfx('bad');if(st&&st.why)toast(st.why);return;}
  if(d.k==='shape'){obPreview();OB.draft=null;OB.pv=null;commitPreview();preview=null;pointerScreen=null;}
  else{beginStroke();const ok=apply(d.x,d.y,tool);endStroke();if(ok){OB.draft=null;hover=null;}else sfx('bad');}
  obRefresh();
}
// rotación del fantasma elegida a mano
{const _of=orientFor;OB.of=_of;orientFor=function(t,x,y){const d=OB.draft;if(d&&d.k==='pt'&&d.r!=null&&d.x===x&&d.y===y&&t===ghostType())return d.r;return _of.apply(this,arguments);};}
function obTap(sx,sy){
  const c=screenToCell(sx,sy),[x,y]=c,i=inb(x,y)?idx(x,y):-1;
  if(!tool){
    if(i>=0&&S.obj[i]&&!S.obj[i]._tmp){OB.sel={i};sfx('tap');}
    else if(OB.sel)OB.sel=null;
    else toast(mode==='buy'?TXN.obra_tactil.tap_buy:TXN.obra_tactil.tap_build);
    obRefresh();obNudge();return;}
  OB.sel=null;
  const k=tool.kind,sig=obSig();
  if(DRAG_KINDS.includes(k)){if(i<0)return;
    const d=OB.draft;
    if(d&&d.k==='shape'&&d.a[0]===d.b[0]&&d.a[1]===d.b[1]&&(d.a[0]!==x||d.a[1]!==y))d.b=[x,y];
    else OB.draft={k:'shape',a:[x,y],b:[x,y],sig};
    obPreview();sfx('tap');obRefresh();obNudge();return;}
  if(k==='obj'||k==='craft'||(k==='move'&&S.held)){if(i<0)return;
    const d=OB.draft;if(d&&d.k==='pt'){d.x=x;d.y=y;}else OB.draft={k:'pt',x,y,r:null,sig};hover=[x,y];sfx('tap');obRefresh();obNudge();return;}
  if(k==='move'){if(i<0)return;beginStroke();const ok=apply(x,y,tool);endStroke();
    if(ok&&S.held)OB.draft={k:'pt',x,y,r:null,sig};else sfx('bad');obRefresh();obNudge();return;}
  // puerta, ventana, pintura, girar, borrar: se aplican al tocar (y se pueden deshacer)
  beginStroke();if(!apply(x,y))sfx('bad');endStroke();flash=c;setTimeout(()=>{if(flash===c)flash=null;},500);obRefresh();
}
function obLong(){
  const g=OB.g;if(!g||g.type!=='pend')return;
  const c=screenToCell(g.sx,g.sy),[x,y]=c,ok=inb(x,y);
  if(!tool||!ok){g.long=true;return;}
  const k=tool.kind,sig=obSig();
  if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}
  if(DRAG_KINDS.includes(k)){OB.sel=null;OB.g={type:'handle',which:'b',fresh:true};OB.draft={k:'shape',a:[x,y],b:[x,y],sig};obPreview();obRefresh();return;}
  if(k==='paint'||k==='del'){OB.sel=null;OB.g={type:'brush',cells:new Set()};obBrush(x,y);return;}
  if(k==='obj'||k==='craft'||k==='move'){
    if(k==='move'&&!S.held){if(!S.obj[idx(x,y)]){g.long=true;return;}beginStroke();const r=apply(x,y,tool);endStroke();if(!r||!S.held){g.long=true;return;}}
    OB.sel=null;const prev=OB.draft&&OB.draft.k==='pt'?[OB.draft.x,OB.draft.y]:null;
    if(!OB.draft||OB.draft.k!=='pt')OB.draft={k:'pt',x,y,r:null,sig};else{OB.draft.x=x;OB.draft.y=y;}
    const [hx,hy]=obCC(x,y);OB.g={type:'move',ox:hx-g.sx,oy:hy-g.sy,prev};hover=[x,y];obRefresh();return;}
  g.long=true;
}
function obBrush(x,y){const g=OB.g;if(!inb(x,y)||!canApply(x,y,tool))return;const i=idx(x,y);if(g.cells.has(i))return;
  if(tool.kind==='paint'){let c=0;for(const _ of g.cells)c+=costOf(x,y,tool);if(S.money<c+costOf(x,y,tool))return;}
  g.cells.add(i);}
function obCancel(){ // llega un segundo dedo: nada de lo que se estaba dibujando se aplica
  const g=OB.g;if(!g)return;
  if(g.type==='pend')clearTimeout(g.timer);
  if(g.type==='handle'){if(g.fresh)obClear(true);else if(g.prev&&OB.draft){OB.draft[g.which]=g.prev;obPreview();}}
  if(g.type==='move'&&OB.draft){if(g.prev){OB.draft.x=g.prev[0];OB.draft.y=g.prev[1];}}
  OB.g=null;obRefresh();
}
function obDown(e){
  cv.setPointerCapture(e.pointerId);camVel.x=camVel.y=0;zoomAnim=null;
  OB.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(OB.ptrs.size===1){
    const sx=e.clientX,sy=e.clientY,d=OB.draft;let g=null;
    if(d&&d.k==='shape'){let best=40;for(const w of ['b','a']){const [hx,hy]=obCC(...d[w]);const dd=Math.hypot(hx-sx,hy-sy);if(dd<best){best=dd;g={type:'handle',which:w,prev:d[w].slice()};}}}
    if(!g&&d&&d.k==='pt'){const [hx,hy]=obCC(d.x,d.y);if(Math.abs(sx-hx)<Math.max(36,30*cam.z)&&sy>hy-Math.max(70,75*cam.z)&&sy<hy+Math.max(26,18*cam.z))g={type:'move',ox:hx-sx,oy:hy-sy,prev:[d.x,d.y]};}
    if(!g){g={type:'pend',sx,sy,cx:cam.x,cy:cam.y};g.timer=setTimeout(obLong,320);}
    OB.g=g;
  } else if(OB.ptrs.size===2){
    obCancel();const [a,b]=[...OB.ptrs.values()];
    OB.g={type:'pinch',d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2,ang:Math.atan2(b.y-a.y,b.x-a.x),acc:0};
  }
}
function obMove(e){
  OB.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});const g=OB.g;if(!g)return;
  if(g.type==='pinch'){if(OB.ptrs.size<2)return;const [a,b]=[...OB.ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    cam.x+=mx-g.mx;cam.y+=my-g.my;if(g.d>0)zoomAt(d/g.d,mx,my);g.d=d;g.mx=mx;g.my=my;
    const an=Math.atan2(b.y-a.y,b.x-a.x);let da=an-g.ang;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;g.ang=an;g.acc+=da;
    if(Math.abs(g.acc)>1.05){if(g.acc>0)rotate();else{rotate();rotate();rotate();}g.acc=0;}
    return;}
  if(g.type==='pend'){if(Math.hypot(e.clientX-g.sx,e.clientY-g.sy)>10){clearTimeout(g.timer);OB.g={type:'pan',sx:g.sx,sy:g.sy,cx:g.cx,cy:g.cy,lt:performance.now()};}else return;}
  const G=OB.g;
  if(G.type==='pan'){const nx=G.cx+(e.clientX-G.sx),ny=G.cy+(e.clientY-G.sy);const now=performance.now(),dtm=Math.max(1,now-(G.lt||now-16));G.vx=(G.vx||0)*0.6+((nx-cam.x)/dtm*1000)*0.4;G.vy=(G.vy||0)*0.6+((ny-cam.y)/dtm*1000)*0.4;G.lt=now;cam.x=nx;cam.y=ny;}
  else if(G.type==='handle'&&OB.draft){const c=obClamp(screenToCell(e.clientX,e.clientY));const w=OB.draft[G.which];if(c[0]!==w[0]||c[1]!==w[1]){OB.draft[G.which]=c;obPreview();obBar();}}
  else if(G.type==='move'&&OB.draft){const c=obClamp(screenToCell(e.clientX+G.ox,e.clientY+G.oy));if(c[0]!==OB.draft.x||c[1]!==OB.draft.y){OB.draft.x=c[0];OB.draft.y=c[1];hover=c;obBar();}}
  else if(G.type==='brush'){const [x,y]=screenToCell(e.clientX,e.clientY);obBrush(x,y);}
}
function obUp(e,cancel){
  OB.ptrs.delete(e.pointerId);const g=OB.g;
  if(OB.ptrs.size===0){
    if(g){
      if(g.type==='pend'){clearTimeout(g.timer);if(!cancel)obTap(g.sx,g.sy);}
      else if(g.type==='pan'){if(performance.now()-(g.lt||0)<80){camVel.x=g.vx||0;camVel.y=g.vy||0;}}
      else if(g.type==='brush'&&!cancel&&g.cells.size){beginStroke();const m0=S.money;let n=0,li=null;for(const i of g.cells)if(apply(i%N,i/N|0,tool,true)){n++;li=i;}endStroke();
        if(n){sfx(tool.kind==='del'?'sell':'tap');if(li!=null&&S.money!==m0)floatText((S.money<m0?'-':'+')+fmt(Math.abs(m0-S.money)),li%N+.5,(li/N|0)+.5,36,S.money<m0?'#c0392b':'#2e8b57');}else sfx('bad');}
    }
    OB.g=null;obRefresh();
  } else if(OB.ptrs.size===1){const [p]=[...OB.ptrs.values()];OB.g={type:'pan',sx:p.x,sy:p.y,cx:cam.x,cy:cam.y,lt:performance.now()};}
}
const obTouchy=e=>e.pointerType!=='mouse';
addEventListener('pointerdown',e=>{
  if(e.target!==cv)return;
  if(!obTouchy(e)){if(OB.touch){OB.touch=false;obRefresh();}if(mode!=='live'&&OB.draft){obClear(true);obRefresh();}if(mode!=='live'&&OB.sel&&e.button===0&&tool){OB.sel=null;obRefresh();}return;}
  if(mode==='live'||viewPlace)return;
  if(!OB.touch){OB.touch=true;obStrip();}
  e.stopPropagation();e.preventDefault();obDown(e);
},true);
addEventListener('pointermove',e=>{if(!OB.ptrs.has(e.pointerId))return;e.stopPropagation();obMove(e);},true);
for(const t of ['pointerup','pointercancel'])addEventListener(t,e=>{
  if(OB.ptrs.has(e.pointerId)){e.stopPropagation();obUp(e,t==='pointercancel');return;}
  // ratón sin herramienta: un clic sobre un mueble abre su menú
  if(t==='pointerup'&&e.target===cv&&!obTouchy(e)&&mode!=='live'&&!tool&&gesture&&gesture.type==='pan'&&!gesture.moved&&gesture.btn===0){
    const [x,y]=screenToCell(e.clientX,e.clientY);if(inb(x,y)&&S.obj[idx(x,y)]){OB.sel={i:idx(x,y)};sfx('tap');}else OB.sel=null;
    if(OB.sel||mode==='build')gesture.moved=true;obRefresh();}
},true);
for(const t of ['pointerleave','pointerout'])addEventListener(t,e=>{if(e.target===cv&&obTouchy(e)&&mode!=='live')e.stopPropagation();},true);
addEventListener('keydown',e=>{if(e.key==='Escape'&&(OB.draft||OB.sel)){obClear();obRefresh();}},true);
// la zona que se puede tocar, sombreando el resto (se llama desde render, a ras de suelo)
function obShade(){
  if(mode==='live'||viewPlace||!obLocked())return;
  const a=homeArea(),pb=mode==='build'&&!(tool&&tool.kind==='paint');
  ctx.save();
  if(!pb){const t=performance.now()/1000;ctx.setLineDash([7,5]);ctx.lineDashOffset=-t*14;ctx.lineWidth=2.5;ctx.strokeStyle='rgba(255,214,102,.95)';
    ctx.beginPath();const q=[obW(a[0],a[1]),obW(a[2]+1,a[1]),obW(a[2]+1,a[3]+1),obW(a[0],a[3]+1)];ctx.moveTo(...q[0]);for(const p of q.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();
}
function obW(x,y){const [u,v]=w2v(x,y);return P(u,v);}
function obPre(){
  const on=mode!=='live';if(OB.cls!==on){OB.cls=on;document.body.classList.toggle('obra',on);if(!on){obClear();obRefresh();}}
  const d=OB.draft;
  if(d&&(!on||d.sig!==obSig()||(tool&&tool.kind==='move'&&!S.held&&d.k==='pt'))){obClear(true);obRefresh();}
  if(OB.sel&&(!on||!S.obj[OB.sel.i])){OB.sel=null;obRefresh();}
  const D=OB.draft;
  if(D&&D.k==='pt')hover=[D.x,D.y];
  else if(D&&D.k==='shape'){if(!OB.pv)obPreview();preview=OB.pv;const [ax,ay]=obCC(...D.a),[bx,by]=obCC(...D.b);pointerScreen=[(ax+bx)/2,Math.min(ay,by)-14];}
}
function obHull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(const p of pts.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  return lo.slice(0,-1).concat(up.slice(0,-1));}
// velo sobre lo que no se puede tocar: deja a la vista solo la zona editable (suelo y lo que hay encima)
function obVeil(){
  if(!obLocked())return;const pb=mode==='build'&&!(tool&&tool.kind==='paint');
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);
  if(!pb){let a=homeArea();if(mode==='build')a=[a[0]-1,a[1]-1,a[2]+1,a[3]+1].map(v=>Math.max(0,Math.min(N-1,v)));
    const pts=[];for(const [x,y] of [[a[0],a[1]],[a[2]+1,a[1]],[a[2]+1,a[3]+1],[a[0],a[3]+1]]){const [u,v]=w2v(x,y);for(const z of [0,WALL_H+14]){const [px,py]=P(u,v,z);pts.push([cam.x+px*cam.z,cam.y+py*cam.z]);}}
    const h=obHull(pts);ctx.moveTo(...h[0]);for(const p of h.slice(1))ctx.lineTo(...p);ctx.closePath();}
  ctx.fillStyle=pb?'rgba(25,18,45,.30)':'rgba(25,18,45,.40)';ctx.fill('evenodd');ctx.restore();
}
function obPost(){
  if(mode==='live'||viewPlace)return;
  obVeil();
  const tt=performance.now()/1000,g=OB.g;
  ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z,DPR*cam.x,DPR*cam.y);
  if(g&&g.type==='brush')for(const i of g.cells){const x=i%N,y=i/N|0;poly([obW(x,y),obW(x+1,y),obW(x+1,y+1),obW(x,y+1)],tool&&tool.kind==='del'?'rgba(240,80,80,.45)':'rgba(255,214,102,.5)');}
  if(OB.sel&&S.obj[OB.sel.i]){const x=OB.sel.i%N,y=OB.sel.i/N|0;ctx.save();ctx.lineWidth=4/cam.z+1;ctx.strokeStyle=`rgba(255,190,40,${0.75+Math.sin(tt*5)*0.25})`;ctx.fillStyle='rgba(255,214,102,.28)';ctx.beginPath();const q=[obW(x,y),obW(x+1,y),obW(x+1,y+1),obW(x,y+1)];ctx.moveTo(...q[0]);for(const p of q.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const D=OB.draft;if(!D)return;
  if(D.k==='shape'){for(const w of (D.a[0]===D.b[0]&&D.a[1]===D.b[1]?['b']:['a','b'])){const [hx,hy]=obCC(...D[w]);
      ctx.beginPath();ctx.arc(hx,hy,15,0,7);ctx.fillStyle='rgba(255,255,255,.95)';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#e8774a';ctx.stroke();
      ctx.beginPath();ctx.arc(hx,hy,5,0,7);ctx.fillStyle='#e8774a';ctx.fill();}}
  else{const st=obDraftState();if(!st)return;const [hx,hy]=obCC(D.x,D.y);
    ctx.save();ctx.setLineDash([5,4]);ctx.lineWidth=2.5;ctx.strokeStyle=st.ok?'rgba(255,255,255,.95)':'rgba(240,80,80,.95)';ctx.beginPath();ctx.ellipse(hx,hy,Math.max(26,30*cam.z),Math.max(13,15*cam.z),0,0,7);ctx.stroke();ctx.restore();
    label(st.why||(st.cost?fmt(st.cost):'✓'),hx,hy-Math.max(62,70*cam.z),st.ok?'#fffaf0':'#ffe1dc',st.ok?'#3b3247':'#c0392b',13);}
}
{const _r=render;render=function(){obPre();_r.apply(this,arguments);obPost();};}
{const _sm=setMode;setMode=function(m){obClear();const r=_sm.apply(this,arguments);obRefresh();return r;};}
{const _bp=buildPalette;buildPalette=function(){const r=_bp.apply(this,arguments);cats.querySelectorAll('.cat.ur').forEach(b=>b.remove());const sp=cats.querySelector('.spacer');if(sp&&!sp.nextElementSibling)sp.remove();
  if(mode!=='live')palette.querySelectorAll('[data-t]').forEach(b=>{const f=b.onclick;b.onclick=()=>{OB.sel=null;f();};});
  updateUR();obRefresh();return r;};}
{const _th=toolHint;toolHint=function(){const r=_th.apply(this,arguments);obRefresh();return r;};}
