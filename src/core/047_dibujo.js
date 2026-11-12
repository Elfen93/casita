// ---------- dibujo ----------
function vrect(r){const a=w2v(r[0],r[1]),b=w2v(r[2],r[3]);return [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];}
function placeState(key){const w=W_(),cr=w.crisis,st={};
  st.closed=(w.gs===S.day||!!w.rev)&&!['parque','comisaria','ayto','comedor','ateneo','sindicato'].includes(key);
  st.forRent=key==='tienda'&&S.track!=='negocio'&&cr>55;
  st.queue=key==='comedor'?Math.min(9,Math.floor(cr/11)):0;
  st.picket=S.strike&&S.strike.on&&key===destOf('work');
  st.posters=w.mov>35||(S.day>w.elec-12&&S.day<w.elec);
  return st;}
function drawBuilding(key,tt,night,rv){ // rv: el rectángulo del edificio en la vista [u0,v0,u1,v1] (lo da mods/barrio.js con cmV)
  const p=PLACES[key];const [u0,v0,u1,v1]=rv;const st=placeState(key);const cu=(u0+u1)/2,cv=(v0+v1)/2;
  if(p.park){
    for(let k=0;k<9;k++){const x=u0+.8+hash(k*7+2)*(u1-u0-1.6),y=v0+.8+hash(k*13+5)*(v1-v0-1.6);const se=seasonOf();const [px,py]=P(x,y);
      capsule(px,py,px,py-16,3,'#6b4a2e');if(se!=='inv')for(const [dx,dy,r] of [[0,-24,11],[-6,-20,8],[6,-19,8]])circ(px+dx,py+dy,r,{pri:'#5cae4c',ver:'#4a9a43',oto:'#d98b2e'}[se]);else capsule(px,py-16,px-5,py-24,1.5,'#6b4a2e');}
    cyl(cu,cv,.9,0,5,'#c9c3b8','#7cc8f0');
    return;}
  const h=Math.round(p.h*1.5);let col=p.c;
  if(p.obra){for(const [a,b] of [[u0,v0],[u1,v0],[u0,v1],[u1,v1],[cu,v1],[u1,cv]])prism(a-.15,b-.15,a+.15,b+.15,0,h,'#9a948a');for(let z=12;z<=h;z+=14)prism(u0,v0,u1,v1,z-1.5,z,'#b3ada2');
    const [cx,cy]=P(u0+.5,v0+.5,h+40);const [bx,by]=P(u0+.5,v0+.5,0);capsule(bx,by,cx,cy,3,'#f0ad4e');capsule(cx,cy,cx+70,cy+4,2.5,'#f0ad4e');capsule(cx+60,cy+4,cx+60,cy+30+Math.sin(tt)*4,1,'#555');
    if(dayType(S.day)==='work'&&S.t/60>7&&S.t/60<15&&!st.closed)emoji('👷',...P(cu,v1+.2,8),12);return;}
  prismG(u0,v0,u1,v1,0,h,col);
  // ventanas
  const lit=(k)=>night>0.3&&hash(k+key.length*31+Math.floor(S.day/3))>0.35;
  for(let z=8;z<h-5;z+=13){
    for(let u=u0+.25;u<u1-.3;u+=1){const k=Math.round(u*7+z);poly([P(u,v1,z),P(u+.5,v1,z),P(u+.5,v1,z+7),P(u,v1,z+7)],p.glass?`rgba(${lit(k)?'255,226,140,.9':'40,60,90,.45'})`:lit(k)?'#ffe08a':'rgba(60,70,95,.55)');}
    for(let v=v0+.25;v<v1-.3;v+=1){const k=Math.round(v*11+z);poly([P(u1,v,z),P(u1,v+.5,z),P(u1,v+.5,z+7),P(u1,v,z+7)],p.glass?`rgba(${lit(k)?'255,226,140,.9':'40,60,90,.35'})`:lit(k)?'#ffe08a':'rgba(60,70,95,.45)');}}
  if(p.acc)poly([P(u0,v1,h-8),P(u1,v1,h-8),P(u1,v1,h-3),P(u0,v1,h-3)],p.acc);
  if(p.roof){const [a,b]=[P(u0,v0,h),P(u1,v1,h)];poly([P(u0,v1,h),P(u1,v1,h),P(cu,cv,h+14)],shade(p.roof,.9));poly([P(u1,v0,h),P(u1,v1,h),P(cu,cv,h+14)],shade(p.roof,.75));}
  if(key==='parroquia'){prismG(u0,v0,u0+1.4,v0+1.4,h,h+30,shade(col,1.05));emoji('🔔',...P(u0+.7,v0+.7,h+24),11);}
  if(key==='ayto'){const [fx,fy]=P(cu,cv,h);capsule(fx,fy,fx,fy-30,1.4,'#555');const era=W_().era;const fc=era==='consejos'?'#d1242f':era==='comunas'?null:'#e9c46a';
    if(fc){ctx.fillStyle=fc;ctx.beginPath();ctx.moveTo(fx,fy-30);ctx.quadraticCurveTo(fx+9,fy-30+Math.sin(tt*3)*2,fx+18,fy-28);ctx.lineTo(fx+18,fy-19);ctx.quadraticCurveTo(fx+9,fy-21+Math.sin(tt*3)*2,fx,fy-21);ctx.fill();}
    else{ctx.fillStyle='#d1242f';ctx.beginPath();ctx.moveTo(fx,fy-30);ctx.lineTo(fx+18,fy-30);ctx.lineTo(fx,fy-21);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.moveTo(fx+18,fy-30);ctx.lineTo(fx+18,fy-21);ctx.lineTo(fx,fy-21);ctx.fill();}}
  // persianas, carteles y pancartas
  if(st.closed||st.forRent){poly([P(u0+.2,v1,0),P(u1-.2,v1,0),P(u1-.2,v1,12),P(u0+.2,v1,12)],'#8a8f98');for(let z=2;z<12;z+=2){const a=P(u0+.2,v1,z),b=P(u1-.2,v1,z);capsule(a[0],a[1],b[0],b[1],.6,'#6f747c');}
    const [lx,ly]=P(cu,v1,7);label(st.forRent?'SE ALQUILA':'HUELGA',lx,ly,st.forRent?'#fffdf8':'#d1242f',st.forRent?'#c0392b':'#fff',8);}
  if(st.posters){for(let k=0;k<3;k++){const u=u0+.5+k*.9;if(u>u1-.5)break;poly([P(u,v1,3),P(u+.5,v1,3),P(u+.5,v1,9),P(u,v1,9)],['#d1242f','#7a6fd0','#2f8a5a','#e9c46a'][(k+key.length)%4]);}}
  if(W_().mov>60&&['ateneo','sindicato','super','residencia','obra','comedor'].includes(key)){const a=P(u0+.2,v1,h-14),b=P(u1-.2,v1,h-14);capsule(a[0],a[1],b[0],b[1],6,'#fffdf8');const [lx,ly]=P(cu,v1,h-14);ctx.fillStyle='#d1242f';ctx.font='900 7px Nunito';ctx.textAlign='center';ctx.fillText(pickSlogan(key),lx,ly+2);}
}
function pickSlogan(k){const s=[TXN.escenas.ni_un_desahucio_mas,TXN.escenas.salarios_dignos,TXN.escenas.la_sanidad_no_se_vende,TXN.escenas.tu_prisa_mi_precariedad,TXN.escenas.vivienda_para_vivir];return s[(k.length+(W_().era?2:0))%s.length];}
function drawPerson(u,v,ch,dirx,diry,walk,ph){
  const [x,y]=P(u,v);const old=anaRT.phase;anaRT.phase=ph;const right=(dirx-diry)>=0,front=(dirx+diry)>=0;
  ctx.save();drawAna(x,y,{ch,shirt:ch.shirt,mood:60,front,right,pose:walk?'walk':'stand',noShadow:false});ctx.restore();anaRT.phase=old;}
// Ana fuera de casa: el paseo por las calles del barrio y su vista están en mods/caminar.js
function drawCar(u,v,col,ahead,night){const du=ahead[0]-u,dv=ahead[1]-v;const along=Math.abs(du)>Math.abs(dv);const [a,b]=along?[.7,.38]:[.38,.7];
  prism(u-a,v-b,u+a,v+b,2,9,col);prism(u-a*.6,v-b*.6,u+a*.6,v+b*.6,9,14,shade(col,1.1));
  poly([P(u-a*.6,v+b*.6,9.5),P(u+a*.6,v+b*.6,9.5),P(u+a*.6,v+b*.6,13.5),P(u-a*.6,v+b*.6,13.5)],'rgba(180,220,255,.7)');
  if(night>0.4){const [x,y]=P(u+Math.sign(du)*a,v+Math.sign(dv)*b,5);const g=ctx.createRadialGradient(x,y,1,x,y,18);g.addColorStop(0,'rgba(255,240,180,.7)');g.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();}}
function openPlace(k){
  const p=PLACES[k],st=placeState(k),s=S.sim;
  const nm=k==='tienda'&&S.track==='negocio'?TXN.escenas.ficha_tu_tienda:k==='casaV'&&P_('vecina')?huecos(TXN.escenas.ficha_casa_de,{p:P_('vecina').n}):p.n;
  let h=`<h2>${p.e} ${nm}</h2><div class="sub">${k==='casaV'&&P_('vecina')?huecos(TXN.escenas.ficha_vive,{p:P_('vecina').n,rel:relLabel(P_('vecina').rel)}):p.d}</div>`;
  const here=s.work>0&&s.dest===k;if(here)h+=`<div class="quote">${TXN.escenas.ficha_aqui}</div>`;
  if(destOf('work')===k&&!S.jobless)h+=`<div class="kv"><span>${TXN.escenas.ficha_trabaja}</span><span>${CAREER[S.career].t}</span></div>`;
  if(st.closed)h+=`<div class="kv"><span>${TXN.escenas.ficha_hoy}</span><span>${TXN.escenas.ficha_cerrado_huelga}</span></div>`;
  if(st.forRent)h+=`<div class="kv"><span>${TXN.escenas.ficha_estado}</span><span>${TXN.escenas.ficha_se_alquila}</span></div>`;
  if(st.queue)h+=`<div class="kv"><span>${TXN.escenas.ficha_cola}</span><span>${huecos(TXN.escenas.ficha_cola_personas,{n:st.queue*6+Math.round(W_().crisis/3)})}</span></div>`;
  if(k==='tienda'&&S.track!=='negocio'&&!entryMissing('negocio').length)h+=`<button class="btn" id="plbiz">${huecos(TXN.escenas.ficha_negocio,{capital:fmt(bizCapital())})}</button>`;
  for(const o of p.outs){if(!OUT[o])continue;if(o==='comedor')continue;const why=outAvail(o);h+=`<div class="outrow"><span class="oe">${OUT[o].e}</span><span class="ot"><b>${outName(o)}</b><small>${OUT[o].why}${outCost(o)?' · '+fmt(outCost(o)):''}</small></span><button class="mini" data-out="${o}" ${why?'disabled style="opacity:.45"':''}>${why||TXN.escenas.ficha_ir_ahora}</button></div>`;}
  const trk=Object.keys(TRACKS).find(t=>destOf('work')!==k&&({torre:['oficina','tech'],super:['super'],bar:['hosteleria'],obra:['obra'],residencia:['cuidados'],ayto:['funcion'],sala:['arte'],coop:['coop']}[k]||[]).includes(t));
  if(trk&&(S.jobless||S.track!==trk)){const m=entryMissing(trk);h+=`<div class="outrow"><span class="oe">${TRACKS[trk].e}</span><span class="ot"><b>${TXN.escenas.ficha_pedir_trabajo}</b><small>${TRACKS[trk].levels[0].t} · ${m.length?huecos(TXN.escenas.ficha_falta,{lista:m.join(', ')}):huecos(TXN.escenas.ficha_turno,{pago:fmt(Math.round(TRACKS[trk].levels[0].pay*Dm().pay))})}</small></span><button class="mini" data-seek="${trk}" ${m.length?'disabled style="opacity:.45"':''}>${TXN.escenas.ficha_buscar}</button></div>`;}
  h+=`<button class="btn grey" id="plclose">${TXN.escenas.ficha_cerrar}</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  card.querySelectorAll('[data-out]').forEach(b=>b.onclick=()=>{const o=b.dataset.out;if(outAvail(o))return;menu.classList.remove('open');doOut(o);});
  card.querySelectorAll('[data-seek]').forEach(b=>b.onclick=()=>{const t=b.dataset.seek;if(entryMissing(t).length)return;S.seek=t;if(TRACKS[t].self||TRACKS[t].opos||t==='coop')seekTick();else toast(huecos(TXN.escenas.ficha_busca_aviso,{que:TRACKS[t].n.toLowerCase()}));openPlace(k);});
  const bz=card.querySelector('#plbiz');if(bz)bz.onclick=()=>{S.seek='negocio';seekTick();menu.classList.remove('open');};
  card.querySelector('#plclose').onclick=()=>menu.classList.remove('open');
}


// =================== ESCENAS: los sitios a los que va Ana ===================
let viewPlace=false,placeAuto=true,savedCam=null,sceneKey=null,sceneIndoor=false;
function awayKey(){const s=S.sim;if(!(s.work>0)||!s.dest)return null;const tot=s.awayTotal||s.work,el=tot-s.work,tr=Math.min(20,tot/3);
  if(s.dest!=='_ride'&&s.dest!=='comisaria'&&(el<tr||s.work<tr))return '_calle';
  if(s.outingActive==='piquete')return '_piquete';return s.dest;}
function sceneAct(){const s=S.sim;return s.outingActive||'work';}
// primitivas
const sBox=(x0,y0,x1,y1,z0,z1,c)=>prismG(x0,y0,x1,y1,z0,z1,c);
function sFloor(W,D,col,tile){prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,col);if(tile){ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){const a=P(k,0),b=P(k,D);ctx.moveTo(...a);ctx.lineTo(...b);}for(let k=1;k<D;k++){const a=P(0,k),b=P(W,k);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();}}
function sWalls(W,D,h,col,night,win=true){sBox(0,-.15,W,0,0,h,col);sBox(-.15,-.15,0,D,0,h,shade(col,.95));
  if(win)for(let k=1;k<W-.5;k+=2.2)poly([P(k,0,h*.35),P(k+1.2,0,h*.35),P(k+1.2,0,h*.8),P(k,0,h*.8)],night>.5?'#2c3558':'#bfe3f7');
  poly([P(0,0,0),P(W,0,0),P(W,0,6),P(0,0,6)],shade(col,.85));}
const sTop=(x0,y0,x1,y1,z,c)=>topQuad(x0,y0,x1,y1,z,c);
function sPoster(x,z,col,txt,onX){const pts=onX?[P(0,x,z),P(0,x+1,z),P(0,x+1,z+14),P(0,x,z+14)]:[P(x,0,z),P(x+1,0,z),P(x+1,0,z+14),P(x,0,z+14)];poly(pts,col);if(txt){const [a,b]=onX?P(0,x+.5,z+7):P(x+.5,0,z+7);emoji(txt,a,b,10);}}
function sBanner(x0,x1,z,txt){poly([P(x0,0,z),P(x1,0,z),P(x1,0,z+11),P(x0,0,z+11)],'#fffdf8');const [a,b]=P((x0+x1)/2,0,z+5.5);ctx.save();ctx.fillStyle='#d1242f';ctx.font='900 8px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,0.5,0,1,0,0);ctx.fillText(txt,0,0);ctx.restore();}
function sChair(x,y,c='#8a6a4a'){sBox(x+.3,y+.3,x+.7,y+.7,0,9,c);sBox(x+.3,y+.25,x+.7,y+.33,9,20,shade(c,.9));}
function sTable(x,y,c='#a0754c'){cyl(x+.5,y+.5,.08,0,15,'#3b3f46');cyl(x+.5,y+.5,.42,15,17,c,shade(c,1.1));}
function sDesk(x,y,c='#d9d2c3'){sBox(x+.05,y+.15,x+.95,y+.85,12,15,c);sBox(x+.1,y+.2,x+.15,y+.8,0,12,'#3b3f46');sBox(x+.85,y+.2,x+.9,y+.8,0,12,'#3b3f46');sBox(x+.35,y+.2,x+.75,y+.3,15,27,'#2b2b33');poly([P(.37+x,.3+y,17),P(.73+x,.3+y,17),P(.73+x,.3+y,26),P(.37+x,.3+y,26)],'#7cc8f0');}
function sShelf(x,y,len,dirX,t){for(let k=0;k<len;k++){const a=dirX?x+k:x,b=dirX?y:y+k;sBox(a,b,a+1,b+.6,0,36,'#c9c3b8');for(let z=6;z<34;z+=8)for(let j=0;j<4;j++){const c=['#e85d3f','#5bc0be','#f0ad4e','#9b5de5','#00bb7f','#f4f1ea'][(k*3+j+z)%6];sBox(a+.05+j*.23,b+.45,a+.24+j*.23,b+.6,z,z+6,t==='libros'?['#8c4b5a','#3a5a8c','#5a7a3a','#a0754c'][(j+k+z)%4]:c);}}}
function sCaja(x,y){sBox(x,y,x+2,y+.8,0,16,'#e8e2d4');sBox(x+.1,y+.1,x+1.4,y+.7,16,17,'#2b2b33');sBox(x+1.5,y+.15,x+1.9,y+.65,16,26,'#3b3f46');poly([P(x+1.55,y+.65,20),P(x+1.85,y+.65,20),P(x+1.85,y+.65,25),P(x+1.55,y+.65,25)],'#7cf0a8');}
function sBed(x,y){sBox(x,y,x+1,y+2,0,12,'#e9e6df');sBox(x+.05,y+.05,x+.95,y+.5,12,15,'#fffdf8');sBox(x+.05,y+.6,x+.95,y+1.95,12,14,'#9fb4c8');}
function sArm(x,y,c='#7a8c6e'){sBox(x+.1,y+.1,x+.9,y+.9,0,11,c);sBox(x+.1,y+.1,x+.9,y+.3,11,24,shade(c,.9));sBox(x+.1,y+.1,x+.25,y+.9,11,16,shade(c,.95));sBox(x+.75,y+.1,x+.9,y+.9,11,16,shade(c,.95));}
function sPew(x,y,len){sBox(x,y+.3,x+len,y+.7,0,10,'#7a5230');sBox(x,y+.2,x+len,y+.32,10,22,'#6b4a2e');}
function sTree(x,y){const [px,py]=P(x,y);const se=seasonOf();capsule(px,py,px,py-22,4,'#6b4a2e');if(se==='inv'){capsule(px,py-20,px-7,py-32,2,'#6b4a2e');capsule(px,py-20,px+8,py-30,2,'#6b4a2e');return;}
  const c={pri:['#5cae4c','#7fcf6a'],ver:['#3f8a3a','#58ac4e'],oto:['#c9702e','#e3a53a']}[se];circ(px,py-34,16,c[0]);circ(px-8,py-30,11,c[1]);circ(px+9,py-28,10,c[1]);}
function sBench(x,y){sBox(x,y+.3,x+1.6,y+.7,0,9,'#8a6a4a');sBox(x,y+.2,x+1.6,y+.3,9,18,'#7a5a3a');}
function sScaffold(x,y,w,h){for(const a of [x,x+w])for(const b of [y,y+.8])sBox(a,b,a+.08,b+.08,0,h,'#8a8f98');for(let z=20;z<=h;z+=20)sBox(x,y,x+w,y+.8,z-2,z,'#b08850');}
function sBricks(x,y){for(let k=0;k<3;k++)sBox(x,y,x+.8,y+.5,k*5,k*5+5,k%2?'#b5543c':'#c8654a');}
function sBoxes(x,y){sBox(x,y,x+.6,y+.6,15,24,'#c8a46a');sBox(x+.1,y+.1,x+.5,y+.5,24,30,'#d6b47a');}
// gente
const NPCS=()=>WALKERS.map(w=>w.ch);
function sPerson(x,y,ch,o={}){const [px,py]=P(x,y);const old=anaRT.phase;anaRT.phase=o.ph??0;drawAna(px,py+(o.pose==='sit'?-4:0),{ch,shirt:o.shirt||ch.shirt,mood:o.mood??60,front:o.front??true,right:o.right??true,pose:o.pose||'stand',act:o.act||null,sad:o.sad,helmet:o.helmet,vest:o.vest});anaRT.phase=old;
  if(o.prop){emoji(o.prop,px+8,py-44,11);}if(o.name){ctx.save();ctx.globalAlpha=.85;label(o.name,px,py-64,'rgba(255,253,248,.92)','#3b3247',8);ctx.restore();}}
const elder=k=>({...NPCS()[k%12],hair:'#d6d6d6',style:k%2?'corto':'mono',glasses:true});
// cada escena devuelve {W,D,items[], ana:{x,y,...}, out?, floor, wall}
const SCENES={};
// <<SCENES>>
// Escena: _calle
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Calle de barrio: fachadas con tiendas y portales, acera, carril bici, calzada, paso de cebra y semáforo.
var sc__calle_st=null;
SCENES['_calle']=function(E){
  const {tt,night,act,w,npc}=E;const h=E.h??12;const hs=i=>Math.abs(hash(i));const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=13,D=5;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta',snowing=wk==='nieve',snow=snowing||(S.snow||0)>0;
  const cr=w.crisis||0,mov=w.mov||0,day=S.day||0,dark=night>.5,bad=rain||snowing;
  const tc={};const T=c=>{if(tc[c])return tc[c];let r=c;if(r[0]!=='#'){const m=r.match(/[\d.]+/g);r='#'+m.slice(0,3).map(v=>(Math.max(0,Math.min(255,+v|0))).toString(16).padStart(2,'0')).join('');}if(rain)r=mixHex(r,'#7a828e',.25);if(night>0)r=mixHex(r,'#151b38',night*.55);return tc[c]=r;};
  const open=h>=9&&h<21; // comercios abiertos
  // ---------- progreso del paseo de Ana ----------
  const s=S.sim||{};const tot=s.awayTotal||s.work||1,el=tot-(s.work||0),tr=Math.min(20,tot/3)||1;let f=el<tr?el/tr:1-(s.work||0)/tr;const back=el>=tr;
  if(!(f>=0&&f<=1))f=(tt*.06)%1;
  // ---------- ayudas ----------
  const txY=(s0,x,z,size,fill,font)=>{const [a,b]=P(x,0,z);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.font=`900 ${size}px ${font||'Nunito, sans-serif'}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fill;ctx.fillText(s0,0,0);ctx.restore();};
  const fY=(x0,x1,z0,z1,c,y=0)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const umb=(px,py,col)=>{capsule(px+4,py-30,px+4,py-62,1,'#2b2b33');ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(px-13,py-57);ctx.quadraticCurveTo(px+4,py-76,px+21,py-57);
    for(let j=3;j>=0;j--){const a=px-13+j*8.5;ctx.quadraticCurveTo(a+4.2,py-60,a,py-57);}ctx.fill();ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.moveTo(px+4,py-72);ctx.quadraticCurveTo(px-6,py-68,px-9,py-58);ctx.lineTo(px-4,py-58);ctx.closePath();ctx.fill();};
  const bag=(px,py,right,col,txt)=>{const sx=right?1:-1;ctx.fillStyle=col;ctx.fillRect(px+sx*7-3,py-22,6,8);ctx.strokeStyle=shade(col,.6);ctx.lineWidth=.7;ctx.beginPath();ctx.arc(px+sx*7,py-22,2,Math.PI,0);ctx.stroke();if(txt){ctx.fillStyle='#fff';ctx.fillRect(px+sx*7-2,py-19,4,1);}};
  const cart=(px,py,right)=>{const sx=right?1:-1;ctx.fillStyle='#3a5a8c';ctx.fillRect(px+sx*10-3.5,py-16,7,12);capsule(px+sx*10,py-16,px+sx*6,py-26,1,'#2b2b33');circ(px+sx*10-2,py-3,1.8,'#222');circ(px+sx*10+2,py-3,1.8,'#222');};
  const walker=(x,y,ch,o,ex)=>{sPerson(x,y,ch,o);const [px,py]=P(x,y);const r=o.right;if(ex.bag)bag(px,py,r,ex.bag,ex.logo);if(ex.cart)cart(px,py,r);if(ex.cane){capsule(px+(r?6:-6),py-20,px+(r?8:-8),py,1.3,'#6b4a2e');}if(ex.um)umb(px,py,ex.um);};
  // ---------- suelo ----------
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,T('#6b6660'));
    // acera de baldosa hidráulica
    topQuad(0,0,W,2.05,0,T(snow?'#e8ecef':'#cfc7b8'));
    ctx.strokeStyle=T('#b3ab9c');ctx.lineWidth=.6;ctx.beginPath();for(let x=.5;x<W;x+=.5){ctx.moveTo(...P(x,0));ctx.lineTo(...P(x,2.05));}for(let y=.5;y<2.05;y+=.5){ctx.moveTo(...P(0,y));ctx.lineTo(...P(W,y));}ctx.stroke();
    if(!snow){ctx.fillStyle=T('#bdb4a3');for(let k=0;k<26;k++){const x=Math.floor(hs(k*7)*W*2)/2,y=Math.floor(hs(k*3+1)*4)/2;poly([P(x,y),P(x+.5,y),P(x+.5,y+.5),P(x,y+.5)],T('#c6bdac'));}}
    // bordillo
    sBox(0,2.05,W,2.2,-1,2,T('#a8a196'));
    // carril bici + calzada
    topQuad(0,2.2,W,4.45,-1,T(rain?'#3e4248':'#585c63'));
    topQuad(0,2.2,W,2.75,-1,T('#7a5a4c'));ctx.strokeStyle=T('#f4f1ea');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...P(0,2.78,-1));ctx.lineTo(...P(W,2.78,-1));ctx.stroke();
    for(const x of [2.2,6.8,11.5]){const [a,b]=P(x,2.47,-1);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.strokeStyle=T('#f4f1ea');ctx.lineWidth=1;ctx.beginPath();ctx.arc(-6,0,3.2,0,Math.PI*2);ctx.arc(6,0,3.2,0,Math.PI*2);ctx.moveTo(-6,0);ctx.lineTo(-1,-4);ctx.lineTo(6,0);ctx.stroke();ctx.restore();}
    // línea discontinua
    ctx.fillStyle=T('#f4f1ea');for(let x=.3;x<W;x+=1.4){if(x>8.6&&x<10.6)continue;poly([P(x,3.6,-1),P(x+.7,3.6,-1),P(x+.7,3.68,-1),P(x,3.68,-1)],T('#f4f1ea'));}
    // paso de cebra
    for(let y=2.82;y<4.4;y+=.32)poly([P(9,y,-1),P(10.3,y,-1),P(10.3,y+.18,-1),P(9,y+.18,-1)],T(snow?'#dfe4e8':'#efece4'));
    poly([P(8.75,2.8,-1),P(8.83,2.8,-1),P(8.83,4.45,-1),P(8.75,4.45,-1)],T('#efece4'));
    // charcos y reflejos
    if(rain){for(const [x,y,r] of [[3,3.2,.35],[6.2,4,.3],[11,3.1,.4],[1.2,1.4,.25]]){isoEll(x,y,-1,r,'rgba(150,170,190,.35)');}
      if(night>.3)for(let k=0;k<6;k++){const [a,b]=P(1.5+k*2.2,3.4,-1);const g=ctx.createLinearGradient(a,b-6,a,b+12);g.addColorStop(0,'rgba(255,215,140,0)');g.addColorStop(.5,'rgba(255,215,140,.25)');g.addColorStop(1,'rgba(255,215,140,0)');ctx.fillStyle=g;ctx.fillRect(a-2,b-6,4,18);}}
    if(snow){ctx.fillStyle='rgba(240,244,248,.55)';for(let k=0;k<20;k++){const [a,b]=P(hs(k*5)*W,2.2+hs(k*9)*2.2,-1);ctx.beginPath();ctx.ellipse(a,b,12,4,0,0,Math.PI*2);ctx.fill();}}
    // acera de enfrente
    sBox(0,4.45,W,4.6,-1,2,T('#a8a196'));topQuad(0,4.6,W,D,2,T(snow?'#e8ecef':'#cfc7b8'));
  };
  // ---------- fachadas ----------
  const shopsBase=[['PANADERÍA','#c8873a','pan'],['FARMACIA','#2f8a4a','far'],['portal','#7a5a3a','portal'],['FRUTERÍA','#d0453a','fru'],['BAR PEPE','#1f4e79','bar'],['portal','#5a4a3a','portal'],['PELUQUERÍA','#9b5de5','pel'],['LOCUTORIO','#e0a03a','loc']];
  const shops=shopsBase.map((sp,k)=>(cr>55&&(k===3||k===6)&&hs(day+k)<.7+(cr-55)/100)||(cr>80&&k===7)?['SE ALQUILA','#8a8f98','alq']:sp);
  const blds=[[0,2.6,118,'#e3c7a4'],[2.6,5.2,98,'#c9d3c0'],[5.2,7.8,128,'#e8dcc8'],[7.8,10.4,104,'#d6b9a8'],[10.4,13,116,'#c6cfd8']];
  const decor=()=>{
    for(let b=0;b<blds.length;b++){const [x0,x1,H,c]=blds[b];sBox(x0,-.6,x1,0,0,H,T(c));
      // zócalo
      fY(x0,x1,0,3,T(shade(c,.7)));
      // cornisa
      sBox(x0-.02,-.6,x1+.02,.08,H-4,H,T(shade(c,1.08)));
      // pisos
      for(let fl=0,z=32;z<H-14;z+=22,fl++)for(let j=0;j<2;j++){const wx=x0+.35+j*1.15,wx1=wx+.7;const lit=night>.35&&hs(b*37+fl*5+j)<.55,pers=hs(b*11+fl*3+j*7+day);
        fY(wx-.05,wx1+.05,z-1,z+16,T('#f4efe6'));fY(wx,wx1,z,z+15,lit?'#ffd58a':T('#7d93a6'));
        if(!lit){ctx.globalAlpha=.25;fY(wx,wx+.25,z+6,z+15,'#ffffff');ctx.globalAlpha=1;}
        // persiana a medio bajar
        const pz=z+15-pers*10;fY(wx,wx1,pz,z+15,T(lit?'#c9a875':'#b9ad98'));ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=.4;ctx.beginPath();for(let zz=pz+2;zz<z+15;zz+=2){ctx.moveTo(...P(wx,0,zz));ctx.lineTo(...P(wx1,0,zz));}ctx.stroke();
        // balcón
        if((b+fl+j)%2===0){sBox(wx-.1,0,wx1+.1,.3,z-2,z,T('#d8d2c4'));ctx.strokeStyle=T('#2b2b33');ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...P(wx-.1,.3,z+8));ctx.lineTo(...P(wx1+.1,.3,z+8));for(let xx=wx-.1;xx<=wx1+.11;xx+=.1){ctx.moveTo(...P(xx,.3,z));ctx.lineTo(...P(xx,.3,z+8));}ctx.stroke();
          if(hs(b*5+fl+j)<.5){const [a,bb]=P(wx+.1,.2,z+3);circ(a,bb-2,3,T('#4f9a43'));circ(a+4,bb,2.5,T('#d0453a'));}
          else if(hs(b*7+fl)<.5&&!bad){const sw=Math.sin(tt*1.5+b+fl)*1;ctx.strokeStyle=T('#666');ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(...P(wx-.1,.3,z+11));ctx.lineTo(...P(wx1+.1,.3,z+11));ctx.stroke();
            for(let q=0;q<3;q++){const [a,bb]=P(wx+q*.25,.3,z+11);ctx.fillStyle=T(['#e85d3f','#f4f1ea','#3da5ff'][q]);ctx.fillRect(a+sw,bb,3.5,5);}}}
        if(mov>50&&b===3&&fl===1&&j===0){fY(wx-.1,wx1+.5,z-12,z-3,'#fffdf8',.31);txY(TXN.escenas.stop_desahucios,(wx+wx1+.4)/2,z-7.5,4.5,'#c0392b');}}
      // planta baja: dos locales por edificio
      for(let j=0;j<2;j++){const sp=shops[b*2+j]||shops[0],lx=x0+.1+j*1.25,lx1=lx+1.15;const kind=sp[2];
        if(kind==='portal'){fY(lx+.2,lx1-.2,0,25,T('#5a4636'));fY(lx+.28,lx1-.28,0,23,T('#3a2c22'));fY(lx+.32,lx1-.32,8,22,night>.3?'#e8c27a':T('#8aa0b0'));txY(String(10+b*2+j*2),(lx+lx1)/2,27.5,5,T('#3b3247'));
          const [a,bb]=P(lx1-.25,0,12);circ(a,bb,.9,'#d4a838');continue;}
        const closed=kind==='alq'||(!open&&kind!=='bar'&&kind!=='far');
        fY(lx,lx1,3,20,T('#2b2b33'));
        if(closed){fY(lx+.03,lx1-.03,3,20,T('#9aa0a6'));ctx.strokeStyle=T('#7d8388');ctx.lineWidth=.5;ctx.beginPath();for(let z=4;z<20;z+=1.6){ctx.moveTo(...P(lx,0,z));ctx.lineTo(...P(lx1,0,z));}ctx.stroke();
          if(kind==='alq'||cr>60){ctx.save();const [a,bb]=P(lx+.55,0,11);ctx.translate(a,bb);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle='rgba(30,30,40,.7)';ctx.font='italic 900 6px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText(kind==='alq'?'SE ALQUILA':'¡LUCHA!',0,0);ctx.restore();}}
        else{const g=ctx.createLinearGradient(...P(lx,0,20),...P(lx1,0,3));g.addColorStop(0,night>.3?'#ffe2a8':T('#cfe6f2'));g.addColorStop(1,night>.3?'#f0b860':T('#8fb4c8'));fY(lx+.05,lx1-.05,4,19,g);
          // género en el escaparate
          const gc={pan:['#d9a35a','#c8873a'],far:['#f4f1ea','#7cc8a0'],fru:['#e85d3f','#f0c24a','#5daa4e'],bar:['#f0c24a','#7a4a2a'],pel:['#f2b8c6','#9b5de5'],loc:['#3da5ff','#f4f1ea']}[kind];
          for(let q=0;q<5;q++){const [a,bb]=P(lx+.2+q*.18,0,6);ctx.fillStyle=gc[q%gc.length];ctx.beginPath();ctx.ellipse(a,bb,2.4,1.6,0,0,Math.PI*2);ctx.fill();}
          ctx.globalAlpha=.35;poly([P(lx+.1,0,19),P(lx+.4,0,19),P(lx+.2,0,4),P(lx+.05,0,4)],'#fff');ctx.globalAlpha=1;}
        // rótulo
        fY(lx,lx1,20.5,26,closed&&kind==='alq'?T('#c9c3b8'):sp[1]);if(kind!=='alq')txY(sp[0],(lx+lx1)/2,23.2,4.6,'#fffdf8');
        // toldo
        if(!closed&&(kind==='fru'||kind==='pan'||kind==='bar')){for(let q=0;q<6;q++){const a0=lx+q*(1.15/6),a1=a0+1.15/6;poly([P(a0,0,27),P(a1,0,27),P(a1,.5,20),P(a0,.5,20)],T(q%2?'#f4f1ea':sp[1]));}}
        if(kind==='far'){const on=night>.3||Math.sin(tt*3)>0;const [a,bb]=P(lx1-.05,.25,30);ctx.fillStyle=on?'#3dff7a':'#2f8a4a';ctx.fillRect(a-1.5,bb-5,3,10);ctx.fillRect(a-5,bb-1.5,10,3);if(on){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(a,bb,0,a,bb,14);g.addColorStop(0,'rgba(60,255,120,.35)');g.addColorStop(1,'rgba(60,255,120,0)');ctx.fillStyle=g;ctx.fillRect(a-14,bb-14,28,28);ctx.restore();}}
        // cajas de fruta en la acera
        if(kind==='fru'&&!closed){for(let q=0;q<3;q++){const xx=lx+.1+q*.35;sBox(xx,.15,xx+.3,.45,0,5,T('#b08850'));const [a,bb]=P(xx+.15,.3,5);for(let r=0;r<4;r++)circ(a-3+r*2,bb-1,1.4,['#e85d3f','#f0c24a','#5daa4e'][q]);}}
        if(kind==='pan'&&!closed&&h<14){const [a,bb]=P(lx+.6,.1,32);emoji('🥖',a,bb,7);}}}
    // carteles pegados
    if(mov>45){const [x0]=blds[1];fY(x0+.15,x0+.55,4,16,'#fffdf8',0);txY('HUELGA',x0+.35,12,3.5,'#c0392b');txY('GENERAL',x0+.35,8,3.2,'#c0392b');}
  };
  // ---------- mobiliario urbano ----------
  const lampsAt=[1.4,5.2,9.6,12.6];
  const lamp=x=>{const y=1.9;const [a,b]=P(x,y),[c,d]=P(x,y,52);capsule(a,b,c,d,2,T('#2c3036'));capsule(c,d,c-6,d-3,1.6,T('#2c3036'));ctx.fillStyle=T('#2c3036');ctx.beginPath();ctx.moveTo(c-4,d-5);ctx.lineTo(c-12,d-3);ctx.lineTo(c-11,d+1);ctx.lineTo(c-5,d+1);ctx.fill();ctx.fillStyle=night>.25?'#ffe7a0':'#d9d6c8';ctx.fillRect(c-10.5,d,5,1.6);};
  for(const x of lampsAt)add(x,1.9,()=>lamp(x));
  const tree=(x,y)=>{const [a,b]=P(x,y);isoEll(x,y,0,.32,T('#6b5a48'));capsule(a,b,a,b-24,3.5,T('#5a4030'));const se=seasonOf();if(se==='inv'&&!snow){for(let j=0;j<4;j++)capsule(a,b-20,a+(j-1.5)*7,b-36,1.3,T('#5a4030'));return;}
    const c=T({pri:'#6dbd5a',ver:'#4f9a43',oto:'#d08a3a',inv:'#6a8a5e'}[se]);const sw=Math.sin(tt+x)*1;circ(a+sw,b-36,12,c);circ(a-8+sw,b-31,8,c);circ(a+8+sw,b-30,8,T(shade(c,.85)));if(snow){ctx.fillStyle='rgba(250,252,255,.9)';ctx.beginPath();ctx.ellipse(a+sw,b-44,9,4,0,Math.PI,0);ctx.fill();}};
  for(const x of [3.4,7.3,11.4])add(x,1.75,()=>tree(x,1.75));
  // semáforo (ciclo de 14 s: coches verde 0-9, ámbar 9-10.5, rojo 10.5-14)
  const cyc=tt%14,carLight=cyc<9?'g':cyc<10.5?'a':'r';
  const semaf=(x,y,ped)=>{const [a,b]=P(x,y),[c,d]=P(x,y,40);capsule(a,b,c,d,1.8,T('#2b2b33'));ctx.fillStyle='#1d1b20';ctx.fillRect(c-3,d-12,6,15);
    if(ped){const g=carLight==='r';circ(c,d-8,1.9,g?'#2a3a2a':'#ff4040');circ(c,d-2,1.9,g?'#40ff70':'#2a3a2a');}else{circ(c,d-9,1.6,carLight==='r'?'#ff4040':'#4a2020');circ(c,d-4.5,1.6,carLight==='a'?'#ffb020':'#4a3a10');circ(c,d,1.6,carLight==='g'?'#40ff70':'#1a3a1a');}};
  add(8.75,2.0,()=>{semaf(8.75,2.0,false);});add(10.5,1.95,()=>semaf(10.5,1.95,true));add(10.55,4.65,()=>semaf(10.55,4.65,true));
  add(6.2,1.9,()=>{cyl(6.2,1.9,.14,0,13,T('#3f6b4a'),T('#222'));});
  // contenedores en la acera de enfrente
  add(1.6,4.9,()=>{const bins=[['#2f7d4a','vidrio'],['#f0c24a','envases'],['#3a6ab0','papel'],['#7a7f86','resto']];for(let k=0;k<4;k++){const x=.3+k*.62;sBox(x,4.62,x+.55,4.98,2,20,T(bins[k][0]));sBox(x-.02,4.6,x+.57,5.0,20,22,T(shade(bins[k][0],.85)));}
    if(cr>60){for(let k=0;k<3;k++){const [a,b]=P(.4+k*.5,4.55,2);ctx.fillStyle=T(['#c9b48a','#2b2b33','#e8e2d4'][k]);ctx.beginPath();ctx.ellipse(a,b-3,5,4,0,0,Math.PI*2);ctx.fill();}}});
  // marquesina del bus
  add(6.6,4.9,()=>{const g='rgba(200,225,240,.35)';for(const x of [5.4,7.4]){const [a,b]=P(x,4.95,2),[c,d]=P(x,4.95,38);capsule(a,b,c,d,1.6,T('#5a6068'));}
    sBox(5.3,4.62,7.5,5.0,38,40,T('#5a6068'));poly([P(5.4,4.95,4),P(7.4,4.95,4),P(7.4,4.95,36),P(5.4,4.95,36)],g);
    const ad=night>.3?'#ffe9b8':T('#f4f1ea');poly([P(7.4,4.65,4),P(7.4,4.95,4),P(7.4,4.95,36),P(7.4,4.65,36)],ad);
    sBox(5.6,4.75,6.8,4.95,10,12,T('#8a8f98'));const [a,b]=P(5.5,4.95,32);label('🚌 32',a+14,b-14,'#e85d3f','#fff',5);});
  // ---------- tráfico con semáforo (estado persistente) ----------
  if(!sc__calle_st||sc__calle_st.v!==2||tt-sc__calle_st.t>2||tt<sc__calle_st.t){const cols=['#d9534f','#f4f1ea','#3a5a8c','#2b2b33','#e0a03a','#7a8c6e','#b8bec6'];sc__calle_st={v:2,t:tt,cars:[0,1,2].map(k=>({x:-1.5+k*5,c:cols[(k*3+day)%7],v:2.3+k*.25,taxi:k===1&&hs(day)<.5})),bikes:[{x:3,v:1.3,k:7},{x:9,v:1.1,k:2}]};}
  const st=sc__calle_st,dt=Math.min(.1,Math.max(0,tt-st.t));st.t=tt;const stop=8.7;
  const cars=st.cars.slice().sort((a,b)=>b.x-a.x);
  for(let i=0;i<cars.length;i++){const c=cars[i];let mx=1e9;if(carLight!=='g'&&c.x+.7<stop-.05&&c.x+.7>stop-2.5)mx=stop-.75;if(i>0)mx=Math.min(mx,cars[i-1].x-1.9);
    const want=Math.min(c.x+c.v*dt,mx);c.x=Math.max(c.x,want);if(c.x>W+1.5){const last=cars[cars.length-1];c.x=Math.min(-1.8,last.x-2.4-hs(Math.floor(tt))*2);c.c=['#d9534f','#f4f1ea','#3a5a8c','#2b2b33','#e0a03a','#7a8c6e'][Math.floor(tt*7)%6];c.taxi=hs(Math.floor(tt*3))<.25;}}
  const carDraw=(x,y,col,taxi)=>{const L=.75,B=.36;prism(x-L,y-B,x+L,y+B,2,9,T(col));prism(x-L*.55,y-B*.85,x+L*.4,y+B*.85,9,15,T(shade(col,1.05)));
    poly([P(x+L*.4,y-B*.85,9.5),P(x+L*.4,y+B*.85,9.5),P(x+L*.4,y+B*.85,14.5),P(x+L*.4,y-B*.85,14.5)],night>.4?'#2c3558':'rgba(170,210,240,.85)');
    poly([P(x-L*.5,y+B*.85,9.5),P(x+L*.35,y+B*.85,9.5),P(x+L*.35,y+B*.85,14.5),P(x-L*.5,y+B*.85,14.5)],night>.4?'#2c3558':'rgba(170,210,240,.75)');
    for(const dx of [-L*.6,L*.6]){const [a,b]=P(x+dx,y+B,3);ctx.fillStyle='#1d1b20';ctx.beginPath();ctx.ellipse(a,b,3.4,3.4,0,0,Math.PI*2);ctx.fill();circ(a,b,1.3,'#9aa0a8');}
    if(taxi){sBox(x-.12,y-.1,x+.12,y+.1,15,18,'#fffdf8');const [a,b]=P(x-L*.2,y+B,8);ctx.fillStyle='#c0392b';ctx.fillRect(a-6,b-1,12,1.5);}
    const [ha,hb]=P(x+L,y+B*.6,6);circ(ha,hb,1.4,night>.3?'#fff7d0':'#e8e2d4');const [ta,tb]=P(x-L,y+B*.6,6);circ(ta,tb,1.3,'#ff4040');
    if(night>.3){ctx.save();ctx.globalCompositeOperation='lighter';const [a,b]=P(x+L+.9,y,1);ctx.translate(a,b);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,0,0,0,26);g.addColorStop(0,'rgba(255,240,180,.35)');g.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(rain){const [a,b]=P(x-L,y+B,1);ctx.fillStyle='rgba(220,230,240,.35)';for(let k=0;k<4;k++)circ(a-k*3-hs(k+Math.floor(tt*10))*3,b-2-hs(k*3+Math.floor(tt*10))*4,1.2,'rgba(220,230,240,.35)');}};
  for(const c of st.cars){if(c.x<-1.2||c.x>W+1.2)continue;add(c.x+.4,3.75,()=>carDraw(c.x,3.75,c.taxi?'#f4f1ea':c.c,c.taxi));}
  // bicis por el carril bici
  for(const b of st.bikes){b.x+=b.v*dt*(bad?.7:1);if(b.x>W+1)b.x=-1-hs(Math.floor(tt))*3;}
  const bike=(x,y,ch,k)=>{const [a,b]=P(x,y);ctx.strokeStyle='#2b2b33';ctx.lineWidth=1.1;for(const dx of [-8,8]){ctx.beginPath();ctx.ellipse(a+dx,b-4+dx*.5*.0,4.5,4.5,0,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle=['#c0392b','#2a9d8f','#e0a03a'][k%3];ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(a-8,b-4);ctx.lineTo(a-1,b-12);ctx.lineTo(a+6,b-12);ctx.lineTo(a+8,b-4);ctx.moveTo(a-1,b-12);ctx.lineTo(a,b-4);ctx.lineTo(a-8,b-4);ctx.moveTo(a+6,b-12);ctx.lineTo(a+5,b-16);ctx.stroke();
    ctx.save();ctx.translate(-1,-7);sPerson(x,y,ch,{pose:'sit',front:true,right:true,ph:tt*8+k});ctx.restore();};
  for(let i=0;i<st.bikes.length;i++){const b=st.bikes[i];if(b.x<-.6||b.x>W+.6||(dark&&i>0))continue;add(b.x,2.45,()=>{const [a,bb]=P(b.x,2.45);ctx.save();ctx.translate(0,0);bike(b.x,2.45,npc[b.k],i);ctx.restore();void a;void bb;});}
  // ---------- peatones ----------
  const W2=W+2,wrap=v=>((v%W2)+W2)%W2-1,vis=x=>x>.15&&x<W-.15;
  const ppl=[];
  if(!dark){ppl.push({y:.75,v:.5,k:3,bag:'#f0c24a',logo:1},{y:1.35,v:-.45,k:5,cart:1},{y:.95,v:-.55,k:8,bag:'#e8e2d4'},{y:1.55,v:.42,k:11,elder:1,cane:1},{y:1.2,v:.6,k:1,phone:1});
    if(cr<70)ppl.push({y:.7,v:-.4,k:0,bag:'#d0453a'});}
  else ppl.push({y:1.1,v:.55,k:6,phone:1},{y:1.5,v:-.45,k:9});
  for(let j=0;j<ppl.length;j++){const p=ppl[j];const x=wrap(hs(j*13+2)*W2+tt*p.v*(bad?1.25:1));if(!vis(x))continue;const r=p.v>0;const ch=p.elder?elder(j):npc[p.k];
    const um=bad?['#3a5a8c','#c0392b','#2b2b33','#e0a03a','#2a9d8f','#9b5de5'][j%6]:null;
    add(x,p.y,()=>walker(x,p.y,ch,{pose:'walk',ph:tt*7+j,front:r,right:r,act:p.phone?'phone':null},{bag:p.bag,logo:p.logo,cart:p.cart,cane:p.cane,um}));}
  // cola en la panadería / gente en la puerta del bar
  if(!dark&&!bad&&h<14&&shops[0][2]==='pan')for(let k=0;k<2;k++){const x=.55+k*.45;add(x,.55,()=>sPerson(x,.55,npc[(k+4)%12],{front:false,right:true,act:k?'phone':null}));}
  if(shops[8]&&shops[8][2]==='bar'&&(h>=12||night>.3)){add(5.6,.6,()=>sPerson(5.6,.6,npc[10],{act:'eat',front:true,right:false}));add(6.05,.75,()=>sPerson(6.05,.75,npc[7],{act:'talk',front:true,right:false}));}
  // alguien pidiendo en el suelo con la crisis
  if(cr>65&&!dark)add(4.3,.45,()=>{const [a,b]=P(4.3,.4);ctx.fillStyle=T('#b89a6a');ctx.fillRect(a-8,b-2,14,3);sPerson(4.3,.4,elder(5),{pose:'sit',front:true,right:true,sad:true,mood:15});const [c,d]=P(4.75,.55);ctx.fillStyle='#c9b48a';ctx.fillRect(c-5,d-7,10,7);ctx.fillStyle='#333';ctx.font='900 3px Nunito';ctx.textAlign='center';ctx.fillText('AYUDA',c,d-3);});
  // peatones cruzando el paso de cebra en rojo para coches
  if(carLight==='r'){const p=(cyc-10.5)/3.5;for(let k=0;k<(dark?1:2);k++){const y=1.9+p*2.9+(k?-.4:0),x=9.4+k*.45;if(y>1.9&&y<4.9)add(x,y,()=>walker(x,y,npc[(k*7+1)%12],{pose:'walk',ph:tt*7+k,front:true,right:false},{um:bad?'#3a5a8c':null,bag:k?'#9b5de5':null}));}}
  // ---------- Ana ----------
  const ax=back?11-f*9.5:1.5+f*9.5;const ana={x:ax,y:1.05,pose:'walk',walkPh:tt*8,front:!back,right:!back};
  if(bad)add(ax-.005,1.045,()=>{const [a,b]=P(ax,1.05);umb(a,b,'#7a3a8c');});
  else if(back&&act==='work'&&S.track==='super')add(ax+.005,1.055,()=>{const [a,b]=P(ax,1.05);bag(a,b,false,'#f0c24a',1);});
  // ---------- capa final ----------
  const after=()=>{
    if(night>.25){ctx.save();ctx.globalCompositeOperation='lighter';for(const x of lampsAt){const [a,b]=P(x,1.9,52);let g=ctx.createRadialGradient(a-8,b+1,0,a-8,b+1,14);g.addColorStop(0,`rgba(255,230,160,${.7*night})`);g.addColorStop(1,'rgba(255,230,160,0)');ctx.fillStyle=g;ctx.fillRect(a-24,b-14,32,32);
      const [c,d]=P(x-.25,1.6,0);ctx.save();ctx.translate(c,d);ctx.scale(1,.5);g=ctx.createRadialGradient(0,0,0,0,0,52);g.addColorStop(0,`rgba(255,210,130,${.3*night})`);g.addColorStop(1,'rgba(255,210,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.fill();ctx.restore();}
      // escaparates encendidos derraman luz en la acera
      for(let k=0;k<shops.length;k++){const kind=shops[k][2];if(kind==='portal'||kind==='alq'||(!open&&kind!=='bar'&&kind!=='far'))continue;const b=Math.floor(k/2),j=k%2;const lx=blds[b][0]+.1+j*1.25+.57;const [c,d]=P(lx,.45,0);ctx.save();ctx.translate(c,d);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,`rgba(255,200,120,${.22*night})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.restore();}
    const L=P(0,D)[0]-20,R=P(W,0)[0]+20,Tp=P(0,0,140)[1],B=P(W,D)[1];
    if(rain){ctx.strokeStyle=wk==='tormenta'?'rgba(210,220,235,.55)':'rgba(200,215,235,.4)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<100;k++){const x=L+hs(k*7+1)*(R-L),y=Tp+((hs(k*13+5)+tt*1.7)%1)*(B-Tp);ctx.moveTo(x,y);ctx.lineTo(x-2.5,y+10);}ctx.stroke();}
    if(snowing){ctx.fillStyle='rgba(255,255,255,.85)';for(let k=0;k<70;k++){const x=L+hs(k*7+1)*(R-L)+Math.sin(tt+k)*8,y=Tp+((hs(k*13+5)+tt*.25)%1)*(B-Tp);ctx.fillRect(x,y,2,2);}}
  };
  return {W,D,floor:'#cfc7b8',wall:'#f4f1ea',out:true,tile:false,drawBase,decor,items:it,ana,after};
};
// Escena: _piquete
// Piquete de huelga a la puerta del trabajo de Ana: madrugada, bidón con fuego, pancarta, chalecos y termos;
// la puerta cerrada con el encargado mirando y, si toca, la furgoneta de la policía.
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
SCENES['_piquete']=function(E){
  const {tt,night,w,npc,cp,h}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const H=i=>Math.abs(hash(i));
  const W=11,D=7;
  const wl=W_(),wk=destOf('work'),pl=PLACES[wk]||{c:'#cfc6b4',n:'El almacén'};
  const firm=(S.office&&S.office.n)||pl.n;
  const gs=wl.gs===S.day,mov=wl.mov||0,og=(S.office&&S.office.org)||10;
  const cops=wl.gov==='conservador'||wl.era==='represion';
  const rain=S.weather&&S.weather.k==='lluvia',snow=S.weather&&S.weather.k==='nieve'||S.snow>0;
  const se=seasonOf(),cold=se==='inv'||se==='oto'||snow||h<8.5;
  // madrugada: aunque el reloj diga «día», a las 7 en invierno aún no ha amanecido
  const dawn=Math.max(0,Math.min(1,(8.6-h)/1.6))*(se==='ver'?.35:se==='pri'?.6:1);
  const dk=Math.max(night,h<12?dawn:0);
  // tipo de fachada
  const kind={torre:'vidrio',ayto:'vidrio',residencia:'vidrio',super:'persiana',bar:'persiana',tienda:'persiana',sala:'persiana',obra:'valla'}[wk]||'nave';
  // ---- ayudas ----
  const wq=(x0,x1,z0,z1,c,y=0)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const wt=(x,z,t,c,sz,f='900',y=0)=>{const [a,b]=P(x,y,z);ctx.save();ctx.fillStyle=c;ctx.font=`${f} ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.fillText(t,0,0);ctx.restore();};
  const puff=(x,y,z,k,dir)=>{if(!cold)return;const ph=(tt*.7+H(k*3.3))%1.6;if(ph>1)return;const [a,b]=P(x,y,z);ctx.fillStyle=`rgba(240,245,255,${.55*(1-ph)})`;ctx.beginPath();ctx.arc(a+dir*(5+ph*9),b-ph*5,2+ph*4,0,7);ctx.fill();};
  const flag=(x,y,col,col2,k,txt)=>{const [a,b]=P(x,y,26),[c,d]=P(x,y,78);capsule(a,b,c,d,1.4,'#8a7560');const s=Math.sin(tt*2.2+k)*2.5,s2=Math.sin(tt*2.2+k+1.2)*2.5;
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(c,d);ctx.quadraticCurveTo(c+10,d-3+s,c+22,d+s2);ctx.lineTo(c+22,d+14+s2);ctx.quadraticCurveTo(c+10,d+11+s,c,d+14);ctx.fill();
    if(col2){ctx.fillStyle=col2;ctx.beginPath();ctx.moveTo(c,d+14);ctx.lineTo(c+22,d+s2);ctx.lineTo(c+22,d+14+s2);ctx.quadraticCurveTo(c+10,d+11+s,c,d+14);ctx.fill();}
    if(txt){ctx.fillStyle='#fff';ctx.font='900 5px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,c+11,d+7+(s+s2)/2);}};
  const car=(x,y,col,dir,van)=>{const L=van?1.0:.85,Wd=.38;sBox(x-L,y-Wd,x+L,y+Wd,3,van?24:12,col);
    if(!van){sBox(x-L*.5+dir*-.1,y-Wd+.04,x+L*.45+dir*-.1,y+Wd-.04,12,20,shade(col,1.08));poly([P(x-L*.45-.1*dir,y+Wd-.03,13),P(x+L*.4-.1*dir,y+Wd-.03,13),P(x+L*.4-.1*dir,y+Wd-.03,19),P(x-L*.45-.1*dir,y+Wd-.03,19)],dk>.5?'rgba(40,50,70,.85)':'rgba(170,205,235,.85)');}
    else{poly([P(x+dir*L*.55-.35,y+Wd,14),P(x+dir*L*.55+.35,y+Wd,14),P(x+dir*L*.55+.35,y+Wd,21),P(x+dir*L*.55-.35,y+Wd,21)],'rgba(40,50,70,.8)');}
    for(const o of [-.6,.6]){const [a,b]=P(x+o*L,y+Wd,3);ctx.fillStyle='#1d1d1d';ctx.beginPath();ctx.ellipse(a,b,3.6,4.2,0,0,7);ctx.fill();}
    const [fa,fb]=P(x+dir*L,y+Wd*.6,7);circ(fa,fb,1.6,dk>.3?'#fff6c8':'#e8e2d4');lights.push([x+dir*(L+.6),y+.1,7,dk>.3?.8:0,'255,240,190',26]);
    const [ra,rb]=P(x-dir*L,y+Wd*.6,8);circ(ra,rb,1.4,'#e0303a');};
  const lights=[];// [x,y,z,int,rgb,r] luces que se suman en after()
  // ---- base: fachada, acera, bordillo, calzada ----
  const drawBase=()=>{
    // calzada y aceras
    prism(0,0,W,D,-22,0,'#4a4c52');
    topQuad(0,0,W,3.3,0,'#bdb7ad');
    ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W*2;k++){ctx.moveTo(...P(k/2,0));ctx.lineTo(...P(k/2,3.3));}for(let k=1;k<7;k++){ctx.moveTo(...P(0,k/2));ctx.lineTo(...P(W,k/2));}ctx.stroke();
    sBox(0,3.3,W,3.45,0,2.5,'#9a958c');
    topQuad(0,3.45,W,6.2,-.5,rain?'#3d4047':'#55585f');
    for(let k=0;k<6;k++){const x=k*2.2+.4;topQuad(x,4.78,x+1.1,4.88,-.4,'#e8e2d4');}
    if(rain)for(let k=0;k<5;k++){const x=H(k*7)*W,y=3.8+H(k*3)*2.2;isoEll(x,y,-.4,.3+H(k)*.4,'rgba(170,190,220,.25)');}
    sBox(0,6.2,W,6.35,0,2.5,'#9a958c');topQuad(0,6.35,W,D,0,'#bdb7ad');
    // fachada
    const fh=kind==='vidrio'?110:kind==='nave'?62:80;
    sBox(0,-.8,W,0,0,fh,pl.c);
    if(kind==='vidrio'){const gl=dk>.5?'#26324e':'#8fb3cf';wq(0,W,8,fh,gl);ctx.strokeStyle='rgba(30,40,60,.45)';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=W;x+=1){ctx.moveTo(...P(x,0,8));ctx.lineTo(...P(x,0,fh));}for(let z=8;z<=fh;z+=17){ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(W,0,z));}ctx.stroke();
      if(dk>.4)for(let k=0;k<10;k++){const x=Math.floor(H(k*5)*W),z=25+Math.floor(H(k*9)*5)*17;wq(x+.05,x+.95,z+1,z+16,'rgba(255,230,160,.55)');}
      wq(0,W,0,8,shade(pl.c,.8));}
    else{wq(0,W,0,6,shade(pl.c,.75));
      if(kind!=='valla')for(let x=.6;x<W-.5;x+=2){if(x>3.6&&x<7.8)continue;wq(x,x+1.3,kind==='nave'?36:24,kind==='nave'?50:44,dk>.5?'#2a3048':'#a9c6d8');wq(x-.06,x+1.36,kind==='nave'?35:23,kind==='nave'?36:24,'#e8e2d4');}
      if(kind==='persiana')for(let x=.6;x<W-.5;x+=2){if(x>3.6&&x<7.8)continue;if(x<3)wq(x,x+1.3,48,66,dk>.5?'#ffd98a':'#a9c6d8');}}
    // rótulo de la empresa
    const sz=Math.max(6,Math.min(11,120/Math.max(6,firm.length)));
    if(kind==='valla'){}else{const zc=kind==='vidrio'?fh-12:kind==='nave'?55:70;wq(3.4,8.6,zc-6,zc+6,kind==='persiana'?(pl.acc||'#e85d3f'):'#2b2b33');wt(6,zc,firm.toUpperCase(),'#fffdf8',sz);}
    // puerta: hueco, cristal y el cierre
    if(kind==='valla'){ // obra: valla de chapa con lona
      for(let x=0;x<W;x+=1.5){wq(x,x+1.45,0,34,'#c9c3b8',.0);ctx.strokeStyle='rgba(0,0,0,.15)';ctx.beginPath();for(let k=.25;k<1.45;k+=.25){ctx.moveTo(...P(x+k,0,0));ctx.lineTo(...P(x+k,0,34));}ctx.stroke();}
      wq(.5,3.5,12,30,'#2f5f8a');wt(2,24,TXN.escenas.viviendas_de_lujo,'#fff',5.5);wt(2,17,firm,'#e9c46a',4.5,'800');
      const [a,b]=P(10,0,34),[c,d]=P(10,0,120);capsule(a,b,c,d,3,'#e9c46a');capsule(c,d,...P(4,0,120),2.4,'#e9c46a');
      wq(4.5,7.5,0,40,'#7a7f88');for(let x=4.6;x<7.5;x+=.18)wq(x,x+.04,0,40,'#5b6068');wt(6,44,firm.toUpperCase(),'#2b2b33',sz,'900');}
    else{wq(4.2,7.8,0,40,'#1d2230');wq(4.3,7.7,0,38,dk>.4?'#3d4a63':'#b9d2e2');wq(5.98,6.02,0,38,'#8a8f98');
      if(dk>.3)wq(4.3,7.7,0,38,'rgba(255,240,200,.25)');}
  };
  // ---- decorado de fachada (carteles pegados, pintadas) ----
  const decor=()=>{
    // carteles de la huelga pegados en la fachada
    const cols=['#d1242f','#fffdf8','#e9c46a','#d1242f'];
    for(let k=0;k<5;k++){const x=.4+k*.5+(k>2?7.4:0),z=10+H(k*3)*6;wq(x,x+.4,z,z+11,cols[k%4]);wt(x+.2,z+7,k%2?'✊':'HUELGA',k%2?'#d1242f':'#fff',k%2?5:2.6);}
    if(kind!=='valla'){wq(8.6,11.4,27,33,'#fffdf8');wt(10,30,gs?TXN.escenas.huelga_general:TXN.escenas.readmision_ya,'#d1242f',5);}
    // aviso de la empresa en la puerta
    if(kind!=='valla'){wq(5.2,5.8,20,27,'#fffdf8');wt(5.5,24.5,'CERRADO','#333',2.6);wt(5.5,22,'por huelga','#333',2,'700');}
    // farola
    const [la,lb]=P(10.5,3.1,0),[lc,ld]=P(10.5,3.1,92);capsule(la,lb,lc,ld,2.6,'#3b3f46');capsule(lc,ld,lc-12,ld+3,2,'#3b3f46');circ(lc-12,ld+6,3.2,dk>.3?'#ffe9a8':'#c9c3b8');
    lights.push([10.2,3.1,88,dk>.3?.8:0,'255,215,140',60]);
  };
  // ---- el encargado detrás de la puerta (y el vigilante) ----
  const enc={...npc[0],g:'m',style:'corto',hair:'#4a3a2e',shirt:'#f4f1ea',glasses:true};
  add(5.2,.25,()=>sPerson(5.2,.25,enc,{front:true,right:true,act:(tt%12)<5?'phone':null,mood:35}));
  if(kind!=='valla')add(6.9,.25,()=>sPerson(6.9,.25,{...npc[8],g:'m',style:'rapado',shirt:'#2b2b33'},{front:true,right:false,mood:40}));
  // la verja cerrada delante
  add(8.4,.62,()=>{for(let x=4.2;x<=7.81;x+=.2){const [a,b]=P(x,.6,0),[c,d]=P(x,.6,42);capsule(a,b,c,d,1.3,'#5b6068');}
    for(const z of [4,22,40])poly([P(4.2,.6,z),P(7.8,.6,z),P(7.8,.6,z+2),P(4.2,.6,z+2)],'#4a4e55');
    const [a,b]=P(6,.6,22);ctx.fillStyle='#b08850';ctx.fillRect(a-2,b-3,4,6);ctx.strokeStyle='#c9c3b8';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(a,b-3,2,Math.PI,0);ctx.stroke();});
  // ---- el piquete ----
  const nP=Math.max(6,Math.min(15,Math.round(6+og/12+mov/14+(gs?4:0))));
  const pos=[[1.6,2.0],[2.5,1.6],[3.3,2.15],[7.3,1.55],[8.1,2.45],[9.0,1.5],[9.6,2.4],[10.2,1.6],[3.9,1.4],[2.0,1.1],[9.9,2.7],[7.0,2.6],[1.0,1.4],[8.8,.95],[4.4,2.2]];
  const vestC=['#f2c230','#ff7a1a','#f2c230'];
  for(let k=0;k<nP;k++){const [x,y]=pos[k];const ch=k%5===4?elder(k):npc[(k*7+3)%12];
    const nearFire=Math.hypot(x-8.6,y-1.75)<1.1;
    const a=nearFire?'stir':k%4===0?'cheer':k%4===1?'talk':k%4===2?(k===2?'eat':null):'phone';
    const fr=nearFire?(x<8.6):true,rt=nearFire?(x<8.6):H(k)>.5;
    add(x,y,()=>{sPerson(x,y,ch,{front:fr,right:rt,act:a==='phone'&&k%8!==3?'cheer':a,vest:k%3!==2,shirt:k%3===2?['#2b2b33','#7a2e3a','#3a5a8c'][k%3]:undefined,prop:rain&&k%3===1?'☂️':k===2?'☕':undefined});
      puff(x,y,52,k,rt?1:-1);
      if(k%4===3&&!rain)flag(x+.15,y,k%8===3?'#c0262d':'#2a6fd1',null,k,k%8===3?'✊':'HUELGA');});}
  // pancarta grande sostenida por dos
  const bx0=1.2,bx1=3.9,by=2.95;
  add(bx0,by-.05,()=>sPerson(bx0,by-.1,npc[2],{front:true,right:true,vest:true}));
  add(bx1,by-.05,()=>sPerson(bx1,by-.1,npc[9],{front:true,right:false,vest:true}));
  add(bx1+.05,by+.02,()=>{const sw=Math.sin(tt*1.6)*1.5;const pts=[];for(let k=0;k<=6;k++){const x=bx0+(bx1-bx0)*k/6;pts.push(P(x,by,36+Math.sin(k/6*Math.PI)*-1.5+sw*Math.sin(k/6*Math.PI)));}
    for(let k=6;k>=0;k--){const x=bx0+(bx1-bx0)*k/6;pts.push(P(x,by,16+sw*Math.sin(k/6*Math.PI)*.7));}poly(pts,'#fffdf8');
    for(const x of [bx0,bx1]){const [a,b]=P(x,by,12),[c,d]=P(x,by,40);capsule(a,b,c,d,1.6,'#8a7560');}
    poly([pts[0],pts[6],...[pts[6],pts[0]].map(p=>[p[0],p[1]+4])],'#d1242f');
    wt((bx0+bx1)/2,26+sw*.5,gs?TXN.escenas.huelga_general:'EN HUELGA','#d1242f',9,'900',by);wt((bx0+bx1)/2,19.5+sw*.3,TXN.escenas.plantilla_de+firm,'#3b3247',4.2,'800',by);});
  // bidón con fuego
  add(8.6,1.75,()=>{cyl(8.6,1.75,.3,0,20,'#7a4a2e','#3b2a20');for(const z of [6,13])cyl(8.6,1.75,.305,z,z+1,'#5a3420');
    for(let k=0;k<4;k++){const [a,b]=P(8.45+k*.1,1.75,20);ctx.fillStyle='#4a3020';ctx.fillRect(a-2,b-2,4,3);}
    for(let k=0;k<6;k++){const f=Math.sin(tt*9+k*1.7)*.5+.5,f2=Math.sin(tt*13+k)*.5+.5;const [a,b]=P(8.6+(k-2.5)*.08,1.75,20);const hgt=10+f*10+(k%2)*5;
      ctx.fillStyle=k%2?'rgba(255,170,40,.9)':'rgba(255,90,20,.85)';ctx.beginPath();ctx.moveTo(a-4,b);ctx.quadraticCurveTo(a-3+f2*2,b-hgt*.6,a+(f-.5)*3,b-hgt);ctx.quadraticCurveTo(a+3,b-hgt*.5,a+4,b);ctx.fill();}
    { const [a,b]=P(8.6,1.75,24);ctx.fillStyle='rgba(255,240,170,.9)';ctx.beginPath();ctx.ellipse(a,b,4,3,0,0,7);ctx.fill();}
    for(let k=0;k<5;k++){const ph=(tt*.35+k/5)%1;const [a,b]=P(8.6,1.75,36+ph*45);ctx.fillStyle=`rgba(${dk>.5?'90,90,100':'120,120,125'},${.35*(1-ph)})`;ctx.beginPath();ctx.arc(a+Math.sin(tt+k)*4+ph*10,b,4+ph*9,0,7);ctx.fill();}
    for(let k=0;k<4;k++){const ph=(tt*.9+k/4)%1;const [a,b]=P(8.6,1.75,28+ph*30);circ(a+Math.sin(k*3+tt*2)*6,b,1,`rgba(255,200,80,${1-ph})`);}
    lights.push([8.6,1.75,26,.9,'255,150,60',90+Math.sin(tt*11)*6]);});
  // palés para alimentar el fuego y mesa plegable con termos
  add(9.9,.9,()=>{for(let k=0;k<3;k++)sBox(9.5,.25,10.6,.95,k*4,k*4+3,'#b08850');});
  add(2.8,.75,()=>{sBox(2.2,.35,3.4,.95,14,15.5,'#e8e2d4');for(const x of [2.25,3.3])sBox(x,.4,x+.05,.9,0,14,'#8a8f98');
    cyl(2.5,.6,.1,15.5,26,'#c9c3b8','#3b3f46');cyl(2.8,.6,.1,15.5,25,'#d1242f','#8e1b20');for(let k=0;k<4;k++)cyl(3.05+(k%2)*.12,.5+Math.floor(k/2)*.2,.04,15.5,18.5,'#fffdf8');
    sTop(2.3,.7,2.5,.9,15.6,'#e3b778');
    for(let j=0;j<2;j++){const ph=(tt*.6+j/2)%1;const [a,b]=P(2.5,.6,28+ph*12);ctx.fillStyle=`rgba(255,255,255,${.5*(1-ph)})`;ctx.beginPath();ctx.arc(a,b,2+ph*3,0,7);ctx.fill();}});
  // ---- policía ----
  if(cops){add(3.6,4.6,()=>{car(2.6,4.5,'#f4f6f8',1,true);poly([P(1.6,4.88,10),P(3.6,4.88,10),P(3.6,4.88,14),P(1.6,4.88,14)],'#1f4fa0');wt(2.4,18,'POLICÍA','#1f4fa0',6,'900',4.88);
      const on=Math.floor(tt*4)%2;sBox(2.3,4.3,2.5,4.5,24,27,on?'#3a8bff':'#123a8a');sBox(2.7,4.3,2.9,4.5,24,27,on?'#123a8a':'#3a8bff');
      lights.push([2.4+(on?0:.4),4.4,26,.75,'60,130,255',55]);});
    const pol={...npc[5],g:'m',style:'rapado',shirt:'#1d2a44',pants:'#1d2a44'};
    add(4.2,3.75,()=>sPerson(4.2,3.75,pol,{front:false,right:false}));
    add(5.0,3.85,()=>sPerson(5.0,3.85,{...npc[10],shirt:'#1d2a44',pants:'#1d2a44'},{front:false,right:true}));}
  // ---- tráfico ----
  const cc=['#d9534f','#3a5a8c','#e8e2d4','#2b2b33','#8a8f98','#5a7a3a'];
  for(let k=0;k<2;k++){const sp=1.6+k*.5;const x=((tt*sp+k*9)%20)-4;const y=5.55;if(x>-1.2&&x<W+1.2)add(x,y,()=>car(x,y,cc[(Math.floor((tt*sp+k*9)/20)+k*2)%6],1,false));}
  { const sp=2.1;const x=W+3-((tt*sp+5)%22);const y=4.15;if(!cops||x>5.5)if(x>-1.2&&x<W+1.2)add(x,y,()=>car(x,y,cc[(Math.floor((tt*sp+5)/22)+3)%6],-1,false));}
  // contenedores en la acera de enfrente
  add(8.9,6.7,()=>{for(const [x,c] of [[7.6,'#3f7a3a'],[8.5,'#e9c46a'],[9.4,'#2f5f8a']]){sBox(x-.4,6.4,x+.4,6.95,0,20,c);sBox(x-.42,6.38,x+.42,6.97,20,23,shade(c,.85));}});
  // alguien pasa por la acera de enfrente
  { const f=(tt*.06)%1;const x=-.5+f*12;add(x,6.7,()=>sPerson(x,6.7,npc[11],{pose:'walk',ph:tt*7,front:true,right:true,prop:rain?'☂️':undefined}));}
  // compañera de trabajo
  if(cp)add(6.9,2.2,()=>sPerson(6.9,2.2,{...npc[3],g:cp.g==='o'?'m':'f'},{front:true,right:false,act:'cheer',vest:true,name:cp.n}));
  // ---- Ana ----
  const ana={x:5.6,y:2.35,pose:'stand',act:'cheer',front:true,right:false,prop:'📣',vest:true};
  add(5.61,2.35,()=>puff(5.6,2.35,52,99,-1));
  // ---- luz: madrugada azul, fuego, farola, faros, sirenas ----
  const after=()=>{
    if(dk>.05){ctx.save();ctx.globalAlpha=.42*dk;ctx.fillStyle='#14204a';ctx.fillRect(-4000,-4000,8000,8000);ctx.restore();}
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(const [x,y,z,i,rgb,r] of lights){const inten=i*(rgb==='255,150,60'?(.35+.65*dk):1);if(inten<=0)continue;const [a,b]=P(x,y,z);const g=ctx.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,`rgba(${rgb},${.42*inten})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(a,b,r,0,7);ctx.fill();}
    ctx.restore();
    if(snow){for(let k=0;k<40;k++){const x=H(k*3.1)*W,y=H(k*5.3)*D,z=((90-tt*14*(.6+H(k)*.6)-H(k*7)*90)%90+90)%90;const [a,b]=P(x,y,z);circ(a+Math.sin(tt+k)*3,b,1.3,'rgba(255,255,255,.85)');}}
  };
  return {W,D,floor:'#bdb7ad',wall:pl.c,out:true,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: _ride
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Reparto: avenida con tráfico; Ana en moto con la mochila cúbica, otros riders, semáforos. La ciudad se desplaza.
var sc__ride_st=null;
SCENES['_ride']=function(E){
  const {tt,night,act,w,npc}=E;const h=E.h??20;const hs=i=>Math.abs(hash(i));const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=14,D=6;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta',snowing=wk==='nieve',snow=snowing||(S.snow||0)>0,bad=rain||snowing;
  const cr=w.crisis||0,mov=w.mov||0,day=S.day||0,dark=night>.5;
  const tc={};const T=c=>{if(tc[c])return tc[c];let r=c;if(r[0]!=='#'){const m=r.match(/[\d.]+/g);r='#'+m.slice(0,3).map(v=>(Math.max(0,Math.min(255,+v|0))).toString(16).padStart(2,'0')).join('');}if(bad)r=mixHex(r,'#7d8590',.35);if(night>0)r=mixHex(r,'#151b38',night*.55);return tc[c]=r;};
  const brand=(()=>{try{const o=office();return (o&&o.n)||'Rápido Go';}catch(e){return 'Rápido Go';}})();
  const BC={'Rápido Go':'#f0c419','Comidas Ya':'#e8452c','Pedalea':'#21b38a'}[brand]||'#f0c419';
  const brands=[['Rápido Go','#f0c419'],['Comidas Ya','#e8452c'],['Pedalea','#21b38a']];
  const AX=7.5,AY=4.55,LANES=[2.35,3.45,4.55];
  // ---------- simulación (estado persistente entre fotogramas) ----------
  const SEMS=17,CYC=12;const light=k=>{const c=(tt+k*3.7)%CYC;return c<7?'g':c<8.5?'a':'r';};
  if(!sc__ride_st||sc__ride_st.v!==4||tt-sc__ride_st.t>2||tt<sc__ride_st.t){
    const cols=['#d9534f','#f4f1ea','#3a5a8c','#2b2b33','#e0a03a','#7a8c6e','#b8bec6','#5a3a6a'];
    const veh=[];for(let k=0;k<7;k++){const lane=k%3===2?2:k%2;veh.push({x:AX-2+k*3.1,lane:k<2&&k%2?1:lane,v:k===5?2.55:2.2+hs(k*5)*1.4,c:cols[(k*3+day)%8],kind:k===3?'bus':k===5?'rider':'car',b:brands[k%3]});}
    veh.push({x:AX+4,lane:-1,v:1.6,kind:'bike',b:brands[(day+1)%3]});
    sc__ride_st={v:4,t:tt,ax:AX,av:0,veh};}
  const st=sc__ride_st,dt=Math.min(.1,Math.max(0,tt-st.t));st.t=tt;
  const nextStop=x=>{const k=Math.floor((x+.9)/SEMS)+1;return [k*SEMS,k];};
  const vmax=bad?2:2.7;
  {const [sx,k]=nextStop(st.ax);const L=light(k);let tgt=vmax;const dist=sx-.9-st.ax;if(L!=='g'&&dist<3&&dist>-.2)tgt=Math.max(0,Math.min(vmax,dist*1.4));
    for(const v of st.veh)if(v.lane===2&&v.x>st.ax){const gap=v.x-st.ax-1.6;if(gap<2)tgt=Math.min(tgt,Math.max(0,gap*1.2));}
    st.av+=(tgt-st.av)*Math.min(1,dt*(bad?1.5:2.5));st.ax+=Math.max(0,st.av)*dt;}
  const off=st.ax-AX;
  for(const v of st.veh){const [sx,k]=nextStop(v.x);const L=light(k);let mx=1e9;const dist=sx-.9-v.x;if(L!=='g'&&dist>-.1&&dist<3)mx=sx-.9;
    for(const u of st.veh)if(u!==v&&u.lane===v.lane&&u.x>v.x)mx=Math.min(mx,u.x-(u.kind==='bus'?2.4:1.9));
    if(v.lane===2&&st.ax>v.x)mx=Math.min(mx,st.ax-1.6);
    v.x=Math.max(v.x,Math.min(v.x+v.v*(bad?.8:1)*dt,mx));
    const sxp=v.x-off;if(sxp>W+3){v.x=off-3-hs(Math.floor(tt*5)+v.lane)*3;}else if(sxp<-4){v.x=off+W+3+hs(Math.floor(tt*3)+v.lane)*3;v.v=Math.max(v.v,1.5);}}
  const wobble=bad?Math.sin(tt*3.1)*.03+Math.sin(tt*7.3)*.015:0;
  const moving=st.av>.15;
  // ---------- ayudas ----------
  const txt=(s0,x,y,z,size,fill,onX)=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`900 ${size}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fill;ctx.fillText(s0,0,0);ctx.restore();};
  const fY=(x0,x1,z0,z1,c,y=0)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const clip=(a,b)=>[Math.max(0,a),Math.min(W,b)];
  const wheel=(x,y,z,r,rot)=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle='#16151a';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a8f98';ctx.beginPath();ctx.arc(0,0,r*.45,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#5a5f68';ctx.lineWidth=.6;ctx.beginPath();for(let k=0;k<3;k++){const a2=rot+k*2.09;ctx.moveTo(0,0);ctx.lineTo(Math.cos(a2)*r*.45,Math.sin(a2)*r*.45);}ctx.stroke();ctx.restore();};
  // moto: parte trasera y cuerpo (se dibuja antes que la persona)
  const motoBack=(x,y,col)=>{const rot=-st.ax*6;wheel(x-.42,y,4,4.2,rot);
    poly([P(x-.55,y,9),P(x-.1,y,9),P(x+.05,y,4),P(x+.3,y,4),P(x+.42,y,13),P(x+.36,y,20),P(x+.25,y,20),P(x+.2,y,11),P(x-.1,y,12),P(x-.62,y,14)],T(col));
    prism(x-.5,y-.12,x-.05,y+.12,11,14,T('#1d1b20'));};
  const motoFront=(x,y,col,lightOn)=>{const rot=-st.ax*6;wheel(x+.45,y+.02,4,4.2,rot);const [a,b]=P(x+.36,y,21),[c,d]=P(x+.28,y,26);capsule(a,b,c,d,1.6,T('#2b2b33'));
    const [e,f]=P(x+.28,y-.2,26),[g,hh]=P(x+.28,y+.2,26);capsule(e,f,g,hh,1.6,T('#2b2b33'));
    // móvil con la app en el manillar
    const [m,n]=P(x+.3,y+.02,29);ctx.fillStyle='#111';ctx.fillRect(m-2.2,n-4,4.4,6);ctx.fillStyle=Math.sin(tt*2)>-.6?'#38d39f':'#ffd23d';ctx.fillRect(m-1.6,n-3.4,3.2,4.6);
    const [la,lb]=P(x+.47,y,16);circ(la,lb,1.8,lightOn?'#fff7d0':T('#e8e2d4'));
    if(lightOn){ctx.save();ctx.globalCompositeOperation='lighter';const [p,q]=P(x+1.6,y,0);ctx.translate(p,q);ctx.scale(1,.5);const gr=ctx.createRadialGradient(0,0,0,0,0,30);gr.addColorStop(0,'rgba(255,240,190,.35)');gr.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();ctx.restore();}
    const [ra,rb]=P(x-.62,y,13);circ(ra,rb,1.4,'#ff3b3b');};
  // mochila cúbica de reparto
  const box=(x,y,z,bc,name)=>{sBox(x-.5,y-.2,x-.08,y+.2,z,z+24,T(bc));sBox(x-.52,y-.22,x-.06,y+.22,z+23,z+25,T(shade(bc,.85)));
    const [a,b]=P(x-.29,y+.2,z+12);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle='#fff';ctx.font='900 4px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const ws=name.split(' ');for(let q=0;q<Math.min(2,ws.length);q++){const tw=ctx.measureText(ws[q]).width;ctx.save();if(tw>12)ctx.scale(12/tw,1);ctx.fillText(ws[q],0,ws.length>1?(q?2.5:-2.5):0);ctx.restore();}ctx.restore();
    if(night>.3||bad){ctx.fillStyle='rgba(255,255,255,.75)';const [p,q]=P(x-.5,y+.2,z+4);ctx.fillRect(p,q-1,13,1.2);}};
  const helmet=(x,y,z,col,right)=>{const [a,b]=P(x,y,z);const hx=a+(right?1:-1),hy=b-4-27.2;ctx.fillStyle=col;ctx.beginPath();ctx.arc(hx,hy,7.4,Math.PI*.95,Math.PI*2.05);ctx.lineTo(hx+(right?7.2:-7.2),hy+1.5);ctx.lineTo(hx+(right?-7.4:7.4),hy+4);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(30,40,60,.75)';ctx.beginPath();ctx.ellipse(hx+(right?3.6:-3.6),hy+.5,3.4,2.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(hx-3,hy-5,3,1.2);};
  const riderNPC=(x,y,ch,bc,name,bike)=>{if(bike){bikeDraw(x,y,ch,bc,name);return;}motoBack(x,y,'#b8bec6');box(x,y,14,bc,name);const [a,b]=P(x,y,8),[c,d]=P(x,y);ctx.save();ctx.translate(a-c,b-d);sPerson(x,y,ch,{pose:'sit',front:true,right:true,shirt:bc});ctx.restore();helmet(x,y,8,'#2b2b33',true);motoFront(x,y,bc,night>.3||bad);};
  const bikeDraw=(x,y,ch,bc,name)=>{const rot=-tt*8;wheel(x-.4,y,4.5,4.6,rot);const [a,b]=P(x-.4,y,4.5),[c,d]=P(x,y,13),[e,f]=P(x+.42,y,4.5),[g,hh]=P(x+.32,y,17);ctx.strokeStyle=T('#2b2b33');ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.lineTo(g,hh);ctx.lineTo(e,f);ctx.moveTo(c,d);ctx.lineTo(...P(x+.05,y,4.5));ctx.lineTo(a,b);ctx.stroke();
    box(x-.05,y,22,bc,name);const [p,q]=P(x-.05,y,10),[r,s]=P(x-.05,y);ctx.save();ctx.translate(p-r,q-s);sPerson(x-.05,y,ch,{pose:'walk',ph:tt*7,front:true,right:true,shirt:bc});ctx.restore();helmet(x-.05,y,10+4,'#f4f1ea',true);wheel(x+.42,y,4.5,4.6,rot);};
  // coche visto de lado (avanza hacia +x)
  const car=(x,y,col,bus)=>{const L=bus?1.6:.75,B=bus?.42:.36,H1=bus?26:9;prism(x-L,y-B,x+L,y+B,2,H1,T(col));
    if(!bus){prism(x-L*.55,y-B*.85,x+L*.4,y+B*.85,9,15,T(shade(col,1.05)));poly([P(x-L*.5,y+B*.85,9.5),P(x+L*.35,y+B*.85,9.5),P(x+L*.35,y+B*.85,14.5),P(x-L*.5,y+B*.85,14.5)],night>.4?'#2c3558':'rgba(170,210,240,.8)');}
    else{for(let k=0;k<6;k++){const a0=x-L+.15+k*.5;poly([P(a0,y+B,13),P(a0+.42,y+B,13),P(a0+.42,y+B,23),P(a0,y+B,23)],night>.4?'#ffe2a0':'rgba(170,210,240,.85)');}txt('32 · CENTRO',x+L-.3,y,24,4,'#ffd23d',true);}
    for(const dx of [-L*.65,L*.65]){const [a,b]=P(x+dx,y+B,3);ctx.fillStyle='#16151a';ctx.beginPath();ctx.ellipse(a,b,3.6,3.6,0,0,Math.PI*2);ctx.fill();circ(a,b,1.4,'#9aa0a8');}
    const lightOn=night>.3||bad;const [ta,tb]=P(x-L,y+B*.6,6);circ(ta,tb,1.5,lightOn?'#ff3b3b':'#b02020');
    if(lightOn){ctx.save();ctx.globalCompositeOperation='lighter';let [a,b]=P(x+L+1,y,1);ctx.save();ctx.translate(a,b);ctx.scale(1,.5);let g=ctx.createRadialGradient(0,0,0,0,0,28);g.addColorStop(0,'rgba(255,240,180,.32)');g.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();ctx.restore();
      if(bad){[a,b]=P(x-L,y+B*.6,0);g=ctx.createLinearGradient(a,b,a,b+16);g.addColorStop(0,'rgba(255,60,60,.4)');g.addColorStop(1,'rgba(255,60,60,0)');ctx.fillStyle=g;ctx.fillRect(a-1.5,b,3,16);}ctx.restore();}
    if(bad){const [a,b]=P(x-L,y+B,1);for(let k=0;k<5;k++)circ(a-k*3-hs(k+Math.floor(tt*12))*4,b-1-hs(k*3+Math.floor(tt*12))*5,1.2,'rgba(220,230,240,.4)');}};
  // ---------- suelo ----------
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,T('#5d5852'));
    topQuad(0,0,W,1.25,0,T(snow?'#e3e7ea':'#c9c1b2'));
    ctx.strokeStyle=T('#b1a998');ctx.lineWidth=.5;ctx.beginPath();for(let k=0;k<30;k++){const x=k*.5-(off%.5);if(x<0)continue;ctx.moveTo(...P(x,0));ctx.lineTo(...P(x,1.25));}ctx.stroke();
    sBox(0,1.25,W,1.38,-1,2,T('#a8a196'));
    topQuad(0,1.38,W,5.15,-1,T(bad?'#3c4046':'#4f535a'));
    // carril bici
    topQuad(0,1.38,W,1.85,-1,T('#2f7d5a'));
    // líneas de carril que corren
    for(const y of [2.9,4.0]){for(let k=0;k<12;k++){const x=k*1.6-(off%1.6);const [x0,x1]=clip(x,x+.8);if(x1<=x0)continue;poly([P(x0,y,-1),P(x1,y,-1),P(x1,y+.07,-1),P(x0,y+.07,-1)],T('#efece4'));}}
    poly([P(0,1.86,-1),P(W,1.86,-1),P(W,1.92,-1),P(0,1.92,-1)],T('#efece4'));
    // líneas de detención y pasos de cebra
    for(let k=Math.floor(off/SEMS);k<=Math.floor((off+W)/SEMS)+1;k++){const sx=k*SEMS-off;if(sx<-2||sx>W+1)continue;
      {const [a,b]=clip(sx-.95,sx-.85);if(b>a)poly([P(a,1.9,-1),P(b,1.9,-1),P(b,5.15,-1),P(a,5.15,-1)],T('#efece4'));}
      for(let y=1.95;y<5.1;y+=.32){const [a,b]=clip(sx-.6,sx+.6);if(b>a)poly([P(a,y,-1),P(b,y,-1),P(b,y+.17,-1),P(a,y+.17,-1)],T('#e8e4dc'));}}
    // reflejos y charcos con lluvia
    if(rain){for(let k=0;k<8;k++){const x=((k*2.3-off*1)%(W+2)+W+2)%(W+2)-1,y=2+hs(k*7)*3;isoEll(x,y,-1,.28+hs(k)*.2,'rgba(150,170,190,.3)');}
      ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const x=((k*2.1-off)%(W+2)+W+2)%(W+2)-1;const [a,b]=P(x,1.6,-1);const g=ctx.createLinearGradient(a,b,a,b+30);g.addColorStop(0,night>.3?'rgba(255,200,120,.25)':'rgba(220,230,240,.15)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(a-2,b,4,30);}ctx.restore();}
    if(snow){ctx.fillStyle='rgba(235,240,245,.5)';for(let k=0;k<14;k++){const x=((k*1.7-off)%(W+2)+W+2)%(W+2)-1;const [a,b]=P(x,1.5+hs(k)*.3,-1);ctx.beginPath();ctx.ellipse(a,b,14,4,0,0,Math.PI*2);ctx.fill();}}
    // acera de delante
    sBox(0,5.15,W,5.28,-1,2,T('#a8a196'));topQuad(0,5.28,W,D,2,T(snow?'#e3e7ea':'#c9c1b2'));
  };
  // ---------- fachadas que pasan ----------
  const shopN=['KEBAB','PIZZERÍA','SUSHI','HAMBURGUESAS','CHINO','FARMACIA','BAR','24 H','ESTANCO','BURGER'];
  const decor=()=>{
    const BW=2.4;const i0=Math.floor(off/BW);
    for(let i=i0;i<i0+8;i++){const x=i*BW-off,[x0,x1]=clip(x,x+BW-.05);if(x1-x0<.02)continue;const r=hs(i*7+11),H=72+r*48,c=T(['#e3c7a4','#c9d3c0','#e8dcc8','#d6b9a8','#c6cfd8','#d8c3dc'][Math.floor(r*6)]);
      sBox(x0,-.5,x1,0,0,H,c);fY(x0,x1,0,3,T('#8a7f72'));
      for(let z=30;z<H-10;z+=20)for(let j=0;j<3;j++){const wx=x+.25+j*.75,[a,b]=clip(wx,wx+.45);if(b<=a)continue;const lit=night>.35&&hs(i*31+z+j)<.5;fY(a,b,z,z+12,lit?'#ffd58a':T('#7d93a6'));}
      const [a,b]=clip(x+.15,x+BW-.2);if(b>a){const sn=shopN[i%shopN.length],closed=cr>60&&hs(i*3)<.3;fY(a,b,3,18,closed?T('#9aa0a6'):night>.3?'#ffd890':T('#a8c8da'));
        const sc=['#c0392b','#1f4e79','#2f8a4a','#e0a03a','#9b5de5'][i%5];fY(a,b,19,24,closed?T('#8a8f98'):(night>.3?sc:T(sc)));
        const mid=(Math.max(x+.15,0)+Math.min(x+BW-.2,W))/2;if(b-a>1.2)txt(closed?'SE TRASPASA':sn,mid,0,21.5,4.5,'#fffdf8');
        if(mov>50&&i%4===1&&b-a>1.6){fY(a+.1,b-.1,40,50,'#fffdf8',.01);txt(TXN.escenas.riders_trabajadores,mid,.01,45,4,'#c0392b');}}}
  };
  // ---------- mobiliario que pasa ----------
  const sp=3;for(let k=Math.floor(off/sp)-1;k<Math.floor((off+W)/sp)+2;k++){const x=k*sp-off+1.2;if(x<-.5||x>W+.5)continue;
    if(k%2===0)add(x,5.6,()=>{const [a,b]=P(x,5.6,2),[c,d]=P(x,5.6,54);capsule(a,b,c,d,2,T('#2c3036'));capsule(c,d,c+7,d-3,1.6,T('#2c3036'));const [e,f]=P(x+.3,5.6-.05,52);ctx.fillStyle=T('#2c3036');ctx.fillRect(e-4,f-2,9,3);ctx.fillStyle=night>.25?'#ffe7a0':'#d9d6c8';ctx.fillRect(e-3,f+1,7,1.4);});
    else add(x,5.65,()=>{const [a,b]=P(x,5.65,2);capsule(a,b,a,b-22,3.2,T('#5a4030'));const se=seasonOf();if(se==='inv'&&!snow){for(let j=0;j<4;j++)capsule(a,b-18,a+(j-1.5)*7,b-34,1.2,T('#5a4030'));return;}const c=T({pri:'#6dbd5a',ver:'#4f9a43',oto:'#d08a3a',inv:'#6a8a5e'}[se]);circ(a,b-34,12,c);circ(a-8,b-28,8,c);circ(a+8,b-28,8,T(shade(c,.85)));});}
  // semáforos (al lado de cada línea de detención)
  for(let k=Math.floor(off/SEMS);k<=Math.floor((off+W)/SEMS)+1;k++){const x=k*SEMS-off-1.05;if(x<-.5||x>W+.5)continue;const L=light(k);
    for(const y of [1.2,5.4])add(x,y,()=>{const [a,b]=P(x,y,2),[c,d]=P(x,y,46);capsule(a,b,c,d,2,T('#2b2b33'));ctx.fillStyle='#16151a';ctx.fillRect(c-3.5,d-14,7,17);
      circ(c,d-10,2,L==='r'?'#ff4040':'#4a1a1a');circ(c,d-4.5,2,L==='a'?'#ffb020':'#4a3a10');circ(c,d+1,2,L==='g'?'#40ff70':'#1a3a1a');
      if(night>.3||bad){ctx.save();ctx.globalCompositeOperation='lighter';const yy=L==='r'?d-10:L==='a'?d-4.5:d+1;const g=ctx.createRadialGradient(c,yy,0,c,yy,10);g.addColorStop(0,L==='r'?'rgba(255,60,60,.5)':L==='a'?'rgba(255,170,30,.5)':'rgba(60,255,110,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(c-10,yy-10,20,20);ctx.restore();}});}
  // peatones en la acera de atrás
  const npP=dark?2:bad?3:5;for(let j=0;j<npP;j++){const vv=(j%2?.45:-.4);const wx=hs(j*13+1)*40+tt*vv;const x=(((wx-off)%(W+4))+W+4)%(W+4)-2,y=.6+(j%3)*.22;if(x<.1||x>W-.1)continue;const r=vv>0;
    add(x,y,()=>{sPerson(x,y,npc[(j*5+2)%12],{pose:'walk',ph:tt*7+j,front:r,right:r});if(bad){const [a,b]=P(x,y);capsule(a+4,b-30,a+4,b-60,1,'#2b2b33');ctx.fillStyle=['#3a5a8c','#c0392b','#2b2b33'][j%3];ctx.beginPath();ctx.moveTo(a-12,b-56);ctx.quadraticCurveTo(a+4,b-74,a+20,b-56);ctx.closePath();ctx.fill();}});}
  // ---------- vehículos ----------
  for(const v of st.veh){const x=v.x-off;if(x<-2.5||x>W+2.5)continue;
    if(v.kind==='bike'){if(dark&&cr<50)continue;add(x,1.62,()=>bikeDraw(x,1.62,npc[8],v.b[1],v.b[0]));continue;}
    const y=LANES[v.lane];
    if(v.kind==='rider')add(x,y,()=>riderNPC(x,y,npc[(v.lane*3+4)%12],v.b[1],v.b[0]));
    else add(x+(v.kind==='bus'?1:.4),y,()=>car(x,y,v.c,v.kind==='bus'));}
  // más riders cuanto más crisis: esperando en la acera con el móvil
  const waitN=Math.min(3,Math.floor(cr/30));for(let k=0;k<waitN;k++){const wx=k*6.3+3;const x=(((wx-off)%(W+4))+W+4)%(W+4)-2;if(x<.3||x>W-.3)continue;const b=brands[(k+1)%3];
    add(x,1.0,()=>{box(x+.15,1.0,18,b[1],b[0]);sPerson(x,1.0,npc[(k*4+1)%12],{act:'phone',front:true,right:false,shirt:b[1]});});}
  // ---------- Ana ----------
  const ana={x:AX,y:AY,z:8,pose:'sit',act:null,front:true,right:true};
  add(AX-.03,AY-.03,()=>{ctx.save();const [a,b]=P(AX,AY);ctx.translate(a,b);ctx.rotate(wobble);ctx.translate(-a,-b);motoBack(AX,AY,'#d5d9de');box(AX,AY,14,BC,brand);ctx.restore();
    if(moving){ctx.strokeStyle=bad?'rgba(220,230,240,.5)':'rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<4;k++){const [p,q]=P(AX-.8-hs(k)*.5,AY+(k-1.5)*.08,10+k*7);const l=10+st.av*5;ctx.moveTo(p,q);ctx.lineTo(p-l,q-l*.5);}ctx.stroke();}});
  add(AX+.03,AY+.03,()=>{helmet(AX,AY,8,'#1d1b20',true);const [a,b]=P(AX,AY);ctx.save();ctx.translate(a,b);ctx.rotate(wobble);ctx.translate(-a,-b);motoFront(AX,AY,BC,night>.3||bad);ctx.restore();
    if(bad){const [p,q]=P(AX-.5,AY,1);for(let k=0;k<6;k++){const s=(tt*4+k/6)%1;ctx.fillStyle=`rgba(220,230,240,${.5*(1-s)})`;ctx.fillRect(p-s*18-hs(k)*4,q-2-s*8+hs(k*3)*3,1.6,1.6);}}
    if(!moving){const [p,q]=P(AX,AY,8);ctx.save();ctx.globalAlpha=.85;emoji('⏱️',p+16,q-46,9);ctx.restore();}});
  // ---------- capa final ----------
  const after=()=>{
    const L=P(0,D)[0]-20,R=P(W,0)[0]+20,Tp=P(0,0,130)[1],B=P(W,D)[1];
    if(night>.25){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=Math.floor(off/sp)-1;k<Math.floor((off+W)/sp)+2;k++){if(k%2)continue;const x=k*sp-off+1.2;if(x<-.5||x>W+.5)continue;const [c,d]=P(x+.3,5.2,0);ctx.save();ctx.translate(c,d);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,0,0,0,50);g.addColorStop(0,`rgba(255,210,130,${.28*night})`);g.addColorStop(1,'rgba(255,210,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,50,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.restore();}
    if(bad){ctx.fillStyle=`rgba(150,160,175,${rain?.16:.12})`;ctx.fillRect(L,Tp,R-L,B-Tp);}
    if(rain){ctx.strokeStyle=wk==='tormenta'?'rgba(210,220,235,.6)':'rgba(200,215,235,.45)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<130;k++){const x=L+hs(k*7+1)*(R-L),y=Tp+((hs(k*13+5)+tt*1.8)%1)*(B-Tp);ctx.moveTo(x,y);ctx.lineTo(x-4,y+11);}ctx.stroke();
      if(wk==='tormenta'&&(tt%9)<.12){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(L,Tp,R-L,B-Tp);}}
    if(snowing){ctx.fillStyle='rgba(255,255,255,.85)';for(let k=0;k<80;k++){const x=L+hs(k*7+1)*(R-L)+Math.sin(tt+k)*8-((tt*20)%40),y=Tp+((hs(k*13+5)+tt*.25)%1)*(B-Tp);ctx.fillRect(x,y,2,2);}}
    if(bad){const [a,b]=P(AX-2.5,AY-2.6,40);label(TXN.escenas.calzada_resbaladiza,a,b,'rgba(255,240,200,.92)','#8a3a10',7);}
  };
  void act;void h;
  return {W,D,floor:'#4f535a',wall:'#f4f1ea',out:true,tile:false,drawBase,decor,items:it,ana,after};
};
// Escena: ateneo
// Ateneo del barrio: espacio autogestionado. Sofás reciclados, asamblea en círculo, biblioteca de préstamo,
// cocina comunal, pancartas pintadas a mano. El ambiente cambia con S.ideo (rojo, negro y rojo, verde).
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
SCENES['ateneo']=function(E){
  const {tt,night,w,npc}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const H=i=>Math.abs(hash(i));
  const W=10,D=7,WH=70;
  const wl=W_(),crisis=wl.crisis||0,mov=wl.mov||0,strike=!!(S.strike&&S.strike.on),gs=wl.gs===S.day,rep=wl.era==='represion';
  const rain=S.weather&&S.weather.k==='lluvia',snow=S.weather&&S.weather.k==='nieve';
  const id=S.ideo||'marxista';
  // ---- paleta y lemas según la corriente ----
  const TH={
    marxista:{a:'#c0262d',b:'#f2c230',wall:'#e9d8c4',sym:'★',mural:'#c0262d',flag:['#c0262d','#c0262d'],
      lema:['PAN, TECHO','Y TRABAJO'],ban:TXN.escenas.vivienda_digna_ya,post:[TXN.escenas.charla_el_capital,TXN.escenas.escuela_de_cuadros,TXN.escenas.sindicato_de_inquilinas]},
    anarquista:{a:'#1d1d1d',b:'#c0262d',wall:'#e3dccf',sym:'Ⓐ',mural:'#1d1d1d',flag:['#c0262d','#1d1d1d'],
      lema:['NI DIOSES','NI AMOS'],ban:'APOYO MUTUO',post:[TXN.escenas.asamblea_abierta,TXN.escenas.despensa_solidaria,TXN.escenas.okupa_y_resiste]},
    ecologista:{a:'#2f7a3a',b:'#e9c46a',wall:'#e4ead6',sym:'🌻',mural:'#2f7a3a',flag:['#2f7a3a','#2f7a3a'],
      lema:['NO HAY','PLANETA B'],ban:TXN.escenas.salvemos_el_rio,post:[TXN.escenas.huerto_comunitario,'BICICRÍTICA',TXN.escenas.taller_compostaje]}};
  const T=TH[id]||{...TH.marxista,a:'#7a4fa0',mural:'#7a4fa0',sym:'✊',flag:['#7a4fa0','#7a4fa0'],lema:['EL BARRIO','UNIDO'],ban:TXN.escenas.el_barrio_se_organiza};
  // ---- ayudas locales ----
  const wq=(x0,x1,z0,z1,c)=>poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],c);
  const lq=(y0,y1,z0,z1,c)=>poly([P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)],c);
  const wt=(x,z,t,c,sz,onX,f='900',rot=0)=>{const [a,b]=onX?P(0,x,z):P(x,0,z);ctx.save();ctx.fillStyle=c;ctx.font=`${f} ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,onX?-0.5:0.5,0,1,0,0);if(rot)ctx.rotate(rot);ctx.fillText(t,0,0);ctx.restore();};
  const ft=(x,y,t,c,sz,rot=0)=>{const [a,b]=P(x,y,.3);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,-1,.5,0,0);ctx.rotate(rot);ctx.fillStyle=c;ctx.font=`900 ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,0,0);ctx.restore();};
  const plant=(x,y,s=1,pot='#b5543c')=>{cyl(x,y,.18*s,0,9*s,pot,shade(pot,.8));const [a,b]=P(x,y,9*s);const g=['#3f8a3a','#58ac4e','#2f6e30'];
    for(let k=0;k<7;k++){const an=k/7*6.28+H(x*7+k)*.6,r=(6+H(k+y)*5)*s;ctx.fillStyle=g[k%3];ctx.beginPath();ctx.ellipse(a+Math.cos(an)*r*.6,b-6*s-Math.abs(Math.sin(an))*r*.5,4*s,2.4*s,an,0,7);ctx.fill();}};
  const crate=(x,y,c='#c8a46a')=>{sBox(x-.22,y-.22,x+.22,y+.22,0,11,c);for(const z of [3,7])poly([P(x-.22,y+.22,z),P(x+.22,y+.22,z),P(x+.22,y+.22,z+1.2),P(x-.22,y+.22,z+1.2)],shade(c,.6));};
  const sofaY=(x0,x1,y,c)=>{sBox(x0,y,x1,y+.75,0,10,c);sBox(x0,y-.05,x1,y+.22,10,25,shade(c,.92));sBox(x0,y,x0+.16,y+.75,10,16,shade(c,.97));sBox(x1-.16,y,x1,y+.75,10,16,shade(c,.97));
    for(let k=0;k<3;k++){const xx=x0+.2+k*(x1-x0-.4)/3;sTop(xx+.02,y+.25,xx+(x1-x0-.4)/3-.02,y+.7,10.2,shade(c,1.06));}};
  const sofaX=(x,y0,y1,c)=>{sBox(x,y0,x+.75,y1,0,10,c);sBox(x-.05,y0,x+.22,y1,10,25,shade(c,.92));sBox(x,y0,x+.75,y0+.16,10,16,shade(c,.97));sBox(x,y1-.16,x+.75,y1,10,16,shade(c,.97));
    sTop(x+.25,y0+.4,x+.6,y0+.75,10.4,['#e9c46a','#5bc0be','#e85d3f'][Math.floor(H(y0)*3)]);};
  // ---- base: tarima vieja, ladrillo visto y pared pintada ----
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,'#5c4632');topQuad(0,0,W,D,0,'#b8935e');
    ctx.lineWidth=1;ctx.strokeStyle='rgba(60,35,15,.22)';ctx.beginPath();
    for(let k=1;k<D*4;k++){const y=k/4;ctx.moveTo(...P(0,y));ctx.lineTo(...P(W,y));}
    for(let k=0;k<D*4;k++){const y=k/4;for(let j=0;j<3;j++){const x=(H(k*3+j)*W);ctx.moveTo(...P(x,y));ctx.lineTo(...P(x,y+.25));}}ctx.stroke();
    for(let k=0;k<12;k++){const x=H(k*5.1)*W,y=H(k*2.3)*D;isoEll(x,y,0,.15+H(k)*.2,'rgba(90,60,30,.10)');}
    // pared del fondo, pintada
    sBox(0,-.15,W,0,0,WH,T.wall);
    // pared izquierda: ladrillo visto
    sBox(-.15,-.15,0,D,0,WH,'#b4644a');
    ctx.strokeStyle='rgba(240,220,200,.35)';ctx.lineWidth=.8;ctx.beginPath();
    for(let z=4;z<WH;z+=4){ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(0,D,z));}
    for(let r=0;r<17;r++){const z=r*4,o=(r%2)*.2;for(let y=o;y<D;y+=.4){ctx.moveTo(...P(0,y,z));ctx.lineTo(...P(0,y,z+4));}}ctx.stroke();
    for(let k=0;k<30;k++){const y=H(k*9)*D,z=H(k*4)*66;const r=Math.floor(z/4)*4;lq(y,y+.35,r+.5,r+3.5,H(k)>.5?'#a5553e':'#c27458');}
    wq(0,W,0,5,shade(T.wall,.8));
    // ventanas altas con plantas en el alféizar
    for(const x0 of [.5,7.6]){const x1=x0+1.8;wq(x0-.1,x1+.1,28,62,'#6b5a48');
      const sky=night>.5?'#1d2440':mixHex('#cfe8f5','#8fa3b8',rain?.6:0);wq(x0,x1,30,60,sky);
      if(night>.5)for(let j=0;j<4;j++){const lx=x0+.2+j*.42;if(H(j*3+x0)>.35)wq(lx,lx+.16,38+(j%2)*8,43+(j%2)*8,'#ffd98a');}
      else wq(x0+.15,x0+.55,32,58,'rgba(255,255,255,.28)');
      if(snow)wq(x0,x1,30,33,'#fff');
      if(rain)for(let j=0;j<10;j++){const xx=x0+H(j*1.7+x0)*1.7,zz=60-((tt*30+H(j)*40)%28);const [a,b]=P(xx,0,zz);ctx.strokeStyle='rgba(220,235,255,.7)';ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a,b+4);ctx.stroke();}
      wq((x0+x1)/2-.04,(x0+x1)/2+.04,30,60,'#6b5a48');wq(x0,x1,44.5,45.5,'#6b5a48');wq(x0-.2,x1+.2,27,29,'#8a7560');}
  };
  // ---- decoración de paredes ----
  const decor=()=>{
    // mural pintado en la pared del fondo (entre las ventanas)
    const mx0=2.7,mx1=7.2;
    { const [a,b]=P(4.95,0,44);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);
      ctx.fillStyle=mixHex(T.wall,T.b,.55);ctx.beginPath();ctx.arc(0,-2,26,0,7);ctx.fill();
      ctx.fillStyle=mixHex(T.wall,T.mural,.25);ctx.beginPath();ctx.moveTo(-72,22);ctx.quadraticCurveTo(-30,-4,0,14);ctx.quadraticCurveTo(40,-8,72,20);ctx.lineTo(72,26);ctx.lineTo(-72,26);ctx.fill();
      ctx.restore();}
    // pancarta de tela pintada a mano, colgada con cuerdas
    const px0=2.85,px1=7.05;
    { const sag=Math.sin(tt*.8)*.6;const pts=[];for(let k=0;k<=8;k++){const x=px0+(px1-px0)*k/8;pts.push(P(x,0,58-Math.sin(k/8*Math.PI)*2+sag*(k%2)));}
      for(let k=8;k>=0;k--){const x=px0+(px1-px0)*k/8;pts.push(P(x,0,38-Math.sin(k/8*Math.PI)*2.5+H(k)*1.2));}
      poly(pts,'#f7f1e3');ctx.strokeStyle='rgba(120,100,70,.4)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();ctx.stroke();
      for(const x of [px0,px1]){const [a,b]=P(x,0,58),[c,d]=P(x,0,66);capsule(a,b,c,d,.8,'#8a7560');}
      wt(4.95,51,T.ban,T.a,9.5,false,'900',-.03);wt(4.95,43,TXN.escenas.asamblea_del_barrio,mixHex(T.a,'#888',.4),5,false,'800',.02);
      { const [a,b]=P(3.3,0,48);ctx.fillStyle=T.b;ctx.font='12px sans-serif';emoji(T.sym,a,b,9);}
      // goterones de pintura
      for(let k=0;k<5;k++){const x=3.4+k*.8;wq(x,x+.04,38-H(k)*3,40.5,T.a);}}
    // tira de bombillas
    for(let k=0;k<=18;k++){const x=.2+k*.53,z=66-Math.sin(k/18*Math.PI*3)*2.5;const [a,b]=P(x,0,z);if(k)ctx.lineTo(a,b);else{ctx.strokeStyle='#3b3330';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a,b);}}
    ctx.stroke();
    for(let k=0;k<18;k++){const x=.45+k*.53,z=64.5-Math.sin((k+.5)/18*Math.PI*3)*2.5;const [a,b]=P(x,0,z);const on=night>.2;const c=['#ffd98a','#ff9a7a','#9ad8ff','#c6f08a'][k%4];
      if(on){const g=ctx.createRadialGradient(a,b,0,a,b,7);g.addColorStop(0,c+'cc');g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(a,b,7,0,7);ctx.fill();}circ(a,b,1.5,on?c:'#e8e2d4');}
    // pared de ladrillo: collage de carteles autogestionados
    const cols=['#f7f1e3',T.a,'#e9c46a','#5bc0be',T.b,'#f4a6a6','#fffdf8','#2b2b2b'];
    const tx=[...T.post,TXN.escenas.cineforum_viernes,TXN.escenas.taller_de_serigrafia,crisis>55?TXN.escenas.despensa_trae_lo_que_puedas:TXN.escenas.clases_de_castellano,strike||gs?TXN.escenas.caja_de_resistencia:TXN.escenas.fiesta_del_barrio,rep?TXN.escenas.libertad_detenidas:TXN.escenas.no_a_los_desahucios,TXN.escenas.radio_libre_107_4];
    for(let k=0;k<9;k++){const y=.35+(k%5)*.78+H(k*3)*.1,z=24+Math.floor(k/5)*17+H(k)*3,hgt=12+H(k*5)*3;const c=cols[(k*3)%8];
      lq(y,y+.62,z,z+hgt,c);const fg=['#fffdf8','#f7f1e3','#e9c46a','#f4a6a6'].includes(c)?(k%2?T.a:'#2b2b2b'):'#fffdf8';
      const words=tx[k].split(' ');const half=Math.ceil(words.length/2);wt(y+.31,z+hgt-4,words.slice(0,half).join(' '),fg,3.4,true);wt(y+.31,z+hgt-8.5,words.slice(half).join(' '),fg,3.2,true,'800');
      const [a,b]=P(0,y+.31,z+hgt-.5);circ(a,b,.8,'#c9c3b8');}
    // bandera colgada en la esquina
    { const [a,b]=P(0,.2,62);ctx.save();ctx.translate(a,b);ctx.transform(1,-.5,0,1,0,0);const f=T.flag;
      ctx.fillStyle=f[0];ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,18);ctx.lineTo(26,0);ctx.fill();ctx.fillStyle=f[1];ctx.beginPath();ctx.moveTo(26,0);ctx.lineTo(26,18);ctx.lineTo(0,18);ctx.fill();
      if(id==='marxista'){ctx.fillStyle='#f2c230';ctx.font='8px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',6,5);}
      if(id==='ecologista'){emoji('🌍',13,9,9);}ctx.restore();}
    // reloj de cocina y enchufe
    lq(5.1,5.2,14,17,'#fffdf8');
  };
  // ---- mobiliario ----
  // biblioteca de préstamo contra la pared del fondo (entre ventana y mural)
  add(9.6,.7,()=>{sShelf(7.4,.05,2,true,'libros');wq(7.5,9.3,38,43,'#f7f1e3');wt(8.4,40.5,TXN.escenas.biblioteca_coge_uno_deja_uno,T.a,3.6,false);});
  add(2.3,.7,()=>{sBox(.9,.05,2.4,.55,0,24,'#8a6a4a');for(let j=0;j<3;j++)for(let k=0;k<6;k++){const x=1.0+k*.22;sBox(x,.3,x+.17,.52,3+j*7,8.5+j*7-H(k+j)*1.5,['#8c4b5a','#3a5a8c','#5a7a3a','#a0754c','#e9c46a','#2b2b2b'][(k+j*2)%6]);}
    plant(1.3,.3,.9,'#e8e2d4');cyl(2.1,.3,.12,24,30,'#c27458');});
  // cocina comunal en el rincón izquierdo-delantero
  add(.85,4.4,()=>{sBox(.05,4.4,.85,6.95,0,17,'#e8e2d4');sBox(.03,4.38,.88,6.97,17,18.5,'#8a6a4a');
    sTop(.15,4.6,.75,5.3,18.6,'#9aa4ad');// fregadero
    sBox(.15,5.6,.75,6.4,18.5,19.5,'#2b2b33');for(const yy of [5.8,6.2]){isoEll(.45,yy,19.6,.14,'#555');}
    cyl(.45,6.2,.22,19.5,28,'#b8bcc2','#8a8f98');// olla
    for(let j=0;j<3;j++){const ph=(tt*.5+j/3)%1;const [a,b]=P(.45,6.2,30+ph*18);ctx.fillStyle=`rgba(255,255,255,${.55*(1-ph)})`;ctx.beginPath();ctx.arc(a+Math.sin(tt*1.7+j)*3,b,2.5+ph*4,0,7);ctx.fill();}
    cyl(.4,5.85,.08,19.5,25,'#3b3f46','#222');// cafetera italiana
    for(let k=0;k<4;k++)cyl(.3+(k%2)*.3,4.5+k*.0,.06,18.5,21,['#e85d3f','#fffdf8','#5bc0be','#e9c46a'][k],'#fff');
    lq(4.45,6.9,30,31.5,'#8a6a4a');for(let k=0;k<6;k++){const y=4.6+k*.38;cyl(.12,y,.07,31.5,37,['#e9c46a','#c0262d','#5a7a3a','#f4f1ea'][k%4],'#a0754c');}
    lq(4.6,5.6,40,48,'#fffdf8');wt(5.1,45,'COMEDOR',T.a,3.6,true);wt(5.1,42,TXN.escenas.popular_jueves,  '#333',2.8,true,'700');
    sBox(.85,4.6,1.0,4.75,17,32,'#c9c3b8');});
  if(crisis>50){add(1.6,4.4,()=>{for(let k=0;k<3;k++){const y=3.4+k*.5;crate(1.1,y,'#c8a46a');for(let j=0;j<3;j++)circ(...P(1.0+j*.1,y,12+H(k+j)*1.5),2,['#e85d3f','#f0ad4e','#5a7a3a'][(k+j)%3]);}});}
  add(.95,5.4,()=>sPerson(1.05,5.45,npc[6],{act:'stir',front:false,right:false}));
  // ---- asamblea en círculo ----
  const cx=5.4,cy=3.7;
  const nP=Math.max(5,Math.min(14,Math.round(5+mov/9+(gs||strike?3:0))));
  // mesa baja hecha con un palé
  add(cx+.6,cy+.6,()=>{sBox(cx-.6,cy-.45,cx+.6,cy+.45,0,6,'#c8a46a');for(let k=0;k<4;k++){const yy=cy-.45+k*.3;sTop(cx-.6,yy,cx+.6,yy+.18,6.1,'#d9b77e');}
    cyl(cx-.2,cy-.1,.12,6,13,'#e8e2d4','#c9c3b8');cyl(cx-.2,cy-.1,.03,13,15,'#3b3f46');
    for(let k=0;k<3;k++)cyl(cx+.15+k*.15,cy+.15,.05,6,9,'#fffdf8','#c27458');
    sTop(cx-.05,cy-.35,cx+.45,cy,6.3,'#fffdf8');sTop(cx,cy-.3,cx+.4,cy-.05,6.5,'#f4f1ea');});
  // sofás reciclados
  add(4.4,1.75,()=>sofaY(4.4,6.6,1.75,'#c9933a'));
  add(3.35,3.0,()=>sofaX(3.35,3.0,4.6,'#4f8a8b'));
  const seats=[ // [x,y,front,right,tipo]
    [4.95,2.25,true,false,'s'],[5.95,2.25,true,false,'s'],
    [3.85,4.15,true,true,'s'],[3.85,3.35,true,true,'s'],
    [6.95,3.2,false,false,'c'],[7.0,4.1,false,false,'c'],
    [5.0,5.05,false,true,'c'],[5.95,5.1,false,true,'c'],[6.7,4.85,false,false,'c'],
    [6.6,2.55,true,false,'c'],[4.3,5.0,false,true,'c'],
    [7.55,3.65,false,false,'st'],[3.0,5.6,false,true,'st'],[7.6,2.6,false,false,'st']];
  const anaSeat=3;// sofá izquierdo, mirando a cámara
  const turn=Math.floor(tt/5);
  let placed=0;
  seats.forEach((s,i)=>{const [x,y,fr,rt,ty]=s;const isAna=i===anaSeat;const used=isAna||placed<nP;if(!isAna&&used)placed++;
    if(ty==='c')add(x,y-.01,()=>crate(x,y,H(i)>.5?'#c8a46a':'#9fb4c8'));
    if(!used||isAna)return;
    const h=H(i*3.7);const speaking=Math.floor(H(i+turn*7)*nP)===0;
    const a=speaking?'talk':h<.2?'book':h<.32?'cheer':h<.42?'eat':h<.5?'phone':null;
    const ch=i%4===3?{...npc[(i*7)%12],shirt:T.a}:i===5?elder(i):npc[(i*7+2)%12];
    add(x,y,()=>sPerson(x,y,ch,{pose:ty==='st'?'stand':'sit',front:fr,right:rt,act:a}));});
  // ---- pancarta en el suelo: la están pintando ----
  add(2.2,6.3,()=>{const x0=1.4,x1=4.6,y0=5.9,y1=6.75;topQuad(x0,y0,x1,y1,.2,'#f7f1e3');
    const nl=Math.min(T.lema[1].length,Math.floor((tt*.4)%(T.lema[1].length+4)));
    ft(3.0,6.15,T.lema[0],T.a,7,0);ft(3.0,6.5,T.lema[1].slice(0,Math.max(3,nl)),T.a,7,0);
    cyl(4.4,5.75,.1,0,4,'#e8e2d4',T.a);cyl(1.3,6.85,.1,0,4,'#e8e2d4',T.b);});
  add(4.75,6.4,()=>sPerson(4.75,6.4,npc[1],{pose:'sit',act:'paint',front:false,right:false}));
  add(1.2,5.9,()=>sPerson(1.2,6.0,npc[4],{pose:'sit',act:'paint',front:true,right:true}));
  // ---- rincón de costura: cosiendo una pancarta ----
  add(9.4,5.8,()=>{sBox(8.6,5.0,9.8,5.8,14,16,'#a0754c');sBox(8.65,5.05,8.75,5.75,0,14,'#6b4a2e');sBox(9.65,5.05,9.75,5.75,0,14,'#6b4a2e');
    sBox(9.0,5.2,9.5,5.5,16,22,'#e8e2d4');sBox(9.0,5.2,9.1,5.5,22,26,'#e8e2d4');sBox(9.0,5.2,9.45,5.32,25,27,'#e8e2d4');
    poly([P(8.6,5.8,16),P(9.2,5.8,16),P(9.4,5.95,3),P(8.5,6.0,1)],'#f7f1e3');poly([P(8.6,5.8,16),P(8.9,5.8,16),P(8.95,5.95,6),P(8.6,6.0,4)],T.a);});
  add(9.2,4.6,()=>sPerson(9.2,4.55,elder(2),{pose:'sit',act:'stir',front:true,right:false}));
  add(9.1,4.6,()=>sBox(8.9,4.25,9.5,4.75,0,9,'#7a8c6e'));
  // ---- taller: bici en el caballete y herramientas ----
  add(9.3,1.8,()=>{sBox(8.7,1.1,9.9,1.7,0,15,'#8a6a4a');sTop(8.7,1.1,9.9,1.7,15.1,'#9c7b56');
    for(let k=0;k<4;k++)cyl(8.9+k*.25,1.3,.05,15,18,['#c0262d','#e9c46a','#3a5a8c','#555'][k]);
    const [a,b]=P(9.0,2.4,14),[c,d]=P(9.8,2.4,14);ctx.strokeStyle='#2b2b33';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(a,b,7,7,0,0,7);ctx.ellipse(c,d,7,7,0,0,7);ctx.stroke();
    ctx.strokeStyle=T.a;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a+12,b-1);ctx.lineTo(c,d);ctx.moveTo(a+12,b-1);ctx.lineTo(a+18,b-11);ctx.lineTo(a+4,b-12);ctx.closePath();ctx.stroke();});
  // toques propios de cada corriente
  if(id==='ecologista'){add(2.6,4.9,()=>plant(2.4,4.7,1.1));add(8.4,3.4,()=>plant(8.2,3.3,1.3,'#e8e2d4'));add(6.4,6.7,()=>plant(6.3,6.5,1.5));
    add(.4,2.0,()=>{for(let k=0;k<3;k++){sBox(.05,1.5+k*.3,.6,1.75+k*.3,0,4+k*7,'#8a6a4a');for(let j=0;j<4;j++)circ(...P(.15+j*.12,1.6+k*.3,5+k*7),1.5,'#6fbf4a');}});}
  if(id==='anarquista'){add(.1,.1,()=>{const [a,b]=P(0,6.0,52);ctx.save();ctx.translate(a,b);ctx.transform(1,-.5,0,1,0,0);ctx.strokeStyle='#1d1d1d';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.stroke();ctx.font='900 15px Nunito, sans-serif';ctx.fillStyle='#1d1d1d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('A',0,1);ctx.restore();});}
  if(id==='marxista'){add(.1,.1,()=>{lq(5.8,6.8,40,56,'#c0262d');const [a,b]=P(0,6.3,50);emoji('★',a,b,10);wt(6.3,43,'1917-20XX','#f2c230',3,true);});}
  // plantas
  add(.6,.9,()=>plant(.45,.55,1.4));add(9.7,3.2,()=>plant(9.6,3.0,1.2,'#e8e2d4'));add(.7,3.2,()=>plant(.45,3.0,1.0));
  // llega alguien con la bici a mano / entra y sale gente
  { const f=(tt*.12)%1;const x=9.6-f*2.4,y=6.6;add(x,y,()=>sPerson(x,y,npc[9],{pose:'walk',ph:tt*7,front:true,right:false,act:f>.6?'phone':null}));}
  // ---- Ana ----
  const speakA=(S.pol&&S.pol.inf>=45);const ph=tt%10;
  const ana={x:seats[anaSeat][0],y:seats[anaSeat][1],pose:'sit',act:speakA?(ph<6?'talk':'book'):(ph<3?'talk':ph<5?'cheer':'book'),front:true,right:true};
  // ---- luz final ----
  const after=()=>{if(night>.3){ctx.save();ctx.globalAlpha=.14*night;ctx.fillStyle='#ffb35a';ctx.fillRect(-3000,-3000,6000,6000);ctx.restore();}};
  return {W,D,floor:'#b8935e',wall:T.wall,out:false,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: ayto
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Ayuntamiento: ventanilla de atención (work), concentración en la plaza (manifestacion), reunión de agrupación (militancia)
SCENES['ayto']=function(E){
  const {tt,night,act,w,npc,cp,h}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const hs=i=>Math.abs(hash(i|0));
  let ana={x:3,y:3,pose:'stand',act:null,front:true,right:true};let W=12,D=9,floor='#e4dccb',wall='#efe6d2',out=false,tile=false,decor=null,drawBase=null,after=null;
  const cr=w.crisis||0,mov=w.mov||0,wx=(S.weather&&S.weather.k)||'sol',wet=wx==='lluvia'||wx==='tormenta',lateN=night>.55;
  // ---------- ayudas ----------
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const txt=(onX,u,v,z,s,col,size,wt)=>{const [a,b]=onX?P(v,u,z):P(u,v,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`${wt||800} ${size}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  const ln=(a,b,col,wd)=>{ctx.strokeStyle=col;ctx.lineWidth=wd||1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const pp=(k,o)=>({...npc[((k%12)+12)%12],...(o||{})});
  const tri=(t,a,b)=>{const p=((t%2)+2)%2;return p<1?[a+(b-a)*p,1]:[b-(b-a)*(p-1),-1];};
  const plant=(x,y,s=1)=>{sBox(x-.2*s,y-.2*s,x+.2*s,y+.2*s,0,13*s,'#b5603c');const [a,b]=P(x,y,13*s);capsule(a,b,a,b-14*s,2,'#6b4a2e');circ(a,b-22*s,10*s,'#3f8a3a');circ(a-7*s,b-15*s,7*s,'#5cae4c');circ(a+7*s,b-16*s,7*s,'#5cae4c');circ(a+2,b-29*s,6*s,'#5cae4c');};
  // bandera en mástil pegado a la pared izquierda (x≈.35), ondea con tt
  const flag=(x,y,cols,k)=>{cyl(x,y,.12,0,3,'#c9a24a');cyl(x,y,.025,3,62,'#c9a24a');const [a,b]=P(x,y,62);circ(a,b-1,1.8,'#e0b84a');
    const n=cols.length;for(let i=0;i<n;i++){const z0=60-i*14/n,z1=60-(i+1)*14/n;const pts=[];for(let s=0;s<=6;s++){const u=s/6,wv=Math.sin(tt*2+u*4+k)*1.2*u;const [px,py]=P(x,y+u*.85,z0+wv);pts.push([px,py]);}for(let s=6;s>=0;s--){const u=s/6,wv=Math.sin(tt*2+u*4+k)*1.2*u;const [px,py]=P(x,y+u*.85,z1+wv);pts.push([px,py+.01]);}poly(pts,cols[i]);}};
  const escudo=(onX,u,z,s=1)=>{const [a,b]=onX?P(0,u,z):P(u,0,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.scale(s,s);
    ctx.beginPath();ctx.moveTo(-9,-10);ctx.lineTo(9,-10);ctx.lineTo(9,2);ctx.quadraticCurveTo(9,11,0,14);ctx.quadraticCurveTo(-9,11,-9,2);ctx.closePath();ctx.fillStyle='#c9a24a';ctx.fill();
    ctx.beginPath();ctx.moveTo(-7.5,-8.5);ctx.lineTo(7.5,-8.5);ctx.lineTo(7.5,2);ctx.quadraticCurveTo(7.5,9.6,0,12.4);ctx.quadraticCurveTo(-7.5,9.6,-7.5,2);ctx.closePath();ctx.fillStyle='#b8322f';ctx.fill();
    ctx.fillStyle='#f0d77a';ctx.fillRect(-7.5,-8.5,7.5,10.5);ctx.fillStyle='#3a6ea5';ctx.fillRect(0,2,7.5,4);ctx.fillStyle='#e9e6df';ctx.fillRect(-3,-6,3,6);ctx.fillRect(-3.5,-7,1,1.5);ctx.fillRect(-1,-7,1,1.5);
    ctx.fillStyle='#e0b84a';ctx.beginPath();ctx.moveTo(-7,-11);ctx.lineTo(-5,-17);ctx.lineTo(-2.5,-13);ctx.lineTo(0,-18);ctx.lineTo(2.5,-13);ctx.lineTo(5,-17);ctx.lineTo(7,-11);ctx.closePath();ctx.fill();ctx.restore();};
  const vign=()=>{if(night>.3){const [cx,cy]=P(W/2,D/2,30);const g=ctx.createRadialGradient(cx,cy,60,cx,cy,520);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(10,12,30,${.22*night})`);ctx.fillStyle=g;ctx.fillRect(cx-700,cy-600,1400,1200);}};
  const glow=(pts,a=.09)=>{if(night<.3)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const [x,y,r] of pts)isoEll(x,y,0,r,`rgba(255,215,140,${a*night})`);ctx.restore();};
  // interior con zócalo de madera, terrazo y ventanas altas
  const hall=(HH,fl,wl,wins)=>()=>{prism(0,0,W,D,-22,0,'#7a6a58');topQuad(0,0,W,D,0,fl);
    for(let k=0;k<160;k++){const [a,b]=P(hs(k*3)*W,hs(k*7+1)*D);ctx.fillStyle=k%3?'rgba(90,70,50,.18)':'rgba(255,255,255,.35)';ctx.fillRect(a,b,2,1);}
    ctx.strokeStyle='rgba(120,100,80,.18)';ctx.lineWidth=1;ctx.beginPath();for(let k=2;k<W;k+=2){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=2;k<D;k+=2){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    sBox(0,-.15,W,0,0,HH,wl);sBox(-.15,-.15,0,D,0,HH,shade(wl,.95));
    fY(0,W,0,0,22,'#8a6242');fX(0,0,D,0,22,'#7d583b');fY(0,W,.002,21,23,'#6b4a30');fX(.002,0,D,21,23,'#5f4129');
    fY(0,W,0,HH-6,HH,shade(wl,1.04));fX(0,0,D,HH-6,HH,shade(wl,1.0));
    for(const x0 of wins){const sky=lateN?'#25305a':wet?'#9fb1c2':'#bfe3f7';fY(x0-.08,x0+1.38,0,26,HH-12,'#6b4a30');fY(x0,x0+1.3,.003,28,HH-14,sky);
      if(!lateN&&!wet){fY(x0+.1,x0+.5,.004,30,HH-16,'rgba(255,255,255,.25)');}
      if(wet)for(let k=0;k<6;k++){const xx=x0+.1+hs(k*5+x0*7)*1.1,zz=28+((hs(k*11)*40-tt*25)%40+40)%40;ln(P(xx,.005,zz+6),P(xx,.005,zz),'rgba(255,255,255,.6)',1);}
      fY(x0+.63,x0+.67,.004,28,HH-14,'#6b4a30');fY(x0,x0+1.3,.004,48,50,'#6b4a30');
      if(!lateN&&!wet){ctx.save();ctx.globalCompositeOperation='lighter';poly([P(x0,0),P(x0+1.3,0),P(x0+2.2,2.3),P(x0+.9,2.3)],'rgba(255,240,200,.08)');ctx.restore();}}};

  do{
  // =============================== MANIFESTACIÓN ===============================
  if(act==='manifestacion'){
    out=true;W=12;D=9;const M=W_().manif;const cause=((M&&M.cause)||TXN.escenas.por_la_vivienda).toUpperCase();
    const right=isI('conservadora','liberal','libertaria')||(M&&M.side&&M.side.includes('conservadora')&&!M.side.includes('marxista'));
    const HY=44,hard=w.era==='represion',police=hard||w.gov==='conservador'||w.gov==='austeridad';
    drawBase=()=>{
      // fachada del ayuntamiento al fondo
      const fy0=-1.8,fy1=-.2,FH=118;const stone=lateN?'#b8a27e':'#e3d3b0';
      prismG(-.5,fy0,W+.5,fy1,-10,FH,stone);
      // torre del reloj
      prismG(4.9,fy0+.2,7.1,fy1-.2,FH,FH+40,stone);prismG(4.7,fy0,7.3,fy1,FH+40,FH+44,shade(stone,.9));
      {const [a,b]=P(6,fy1-.2,FH+22);ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.ellipse(a,b,10,11,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3b3247';ctx.lineWidth=1.4;ctx.stroke();const hr=h%12;ln([a,b],[a+Math.sin(hr/6*Math.PI)*5.5,b-Math.cos(hr/6*Math.PI)*5.5],'#2b2b33',1.8);ln([a,b],[a+Math.sin((h%1)*2*Math.PI)*8,b-Math.cos((h%1)*2*Math.PI)*8],'#2b2b33',1.1);}
      {const [a,b]=P(6,fy1-.6,FH+58);emoji('🔔',a,b,12);}
      // cornisa y soportales (arcos)
      fY(-.5,W+.5,fy1,FH-6,FH,shade(stone,.92));fY(-.5,W+.5,fy1+.001,36,39,shade(stone,.9));
      for(let k=0;k<7;k++){const x0=.2+k*1.7,x1=x0+1.25;const pts=[P(x0,fy1+.002,0),P(x0,fy1+.002,24)];for(let s=1;s<8;s++){const t=s/8;pts.push(P(x0+(x1-x0)*t,fy1+.002,24+Math.sin(t*Math.PI)*8));}pts.push(P(x1,fy1+.002,24),P(x1,fy1+.002,0));poly(pts,lateN?'#5a4630':'#4a3c30');
        if(lateN){const [a,b]=P((x0+x1)/2,fy1,22);ctx.save();ctx.globalAlpha=.6;circ(a,b,4,'#ffd27a');ctx.restore();}}
      // ventanas con balcón
      for(let k=0;k<7;k++){const x0=.35+k*1.7;fY(x0,x0+.95,fy1+.002,48,82,lateN?(hs(k)<.4?'#ffd27a':'#2a3050'):'#3c4c66');fY(x0+.05,x0+.9,fy1+.003,48,82,'rgba(0,0,0,0)');fY(x0-.1,x0+1.05,fy1+.003,82,86,shade(stone,.85));
        fY(x0-.1,x0+1.05,fy1+.15,44,46,'#3b3f46');for(let r=0;r<7;r++){const xx=x0-.05+r*.18;ln(P(xx,fy1+.15,46),P(xx,fy1+.15,56),'#3b3f46',1);}fY(x0-.1,x0+1.05,fy1+.15,55.5,57,'#3b3f46');}
      // balcón principal con banderas
      sBox(3.9,fy1,8.1,fy1+.55,44,47,'#cfc0a0');for(let r=0;r<20;r++){const xx=3.95+r*.21;ln(P(xx,fy1+.55,47),P(xx,fy1+.55,57),'#3b3f46',1.2);}sBox(3.9,fy1+.5,8.1,fy1+.58,57,58.5,'#3b3f46');
      [['#c60b1e','#ffc400','#c60b1e'],['#ffffff','#2e8b57','#ffffff'],['#1f3a93','#1f3a93','#1f3a93']].forEach((cols,i)=>{const x=5+i,y=fy1+.3;const [a,b]=P(x,y,58);capsule(a,b,a+10,b-26,1.5,'#c9a24a');
        for(let j=0;j<3;j++){const t0=j/3,t1=(j+1)/3;const pa=[a+10,b-26+t0*14],pb=[a+10,b-26+t1*14];const wv=Math.sin(tt*2+i+j)*2;poly([pa,[pa[0]+14,pa[1]+3+wv],[pb[0]+14,pb[1]+3+wv],pb],cols[j]);}
        if(i===2){const [c,d]=[a+17,b-17];ctx.fillStyle='#ffd400';for(let s=0;s<8;s++)ctx.fillRect(c+Math.cos(s*.785)*3.5,d+Math.sin(s*.785)*3.5,1,1);}});
      // rótulo
      fY(3.6,8.4,fy1+.002,90,100,shade(stone,.88));txt(false,6,fy1+.003,95,'AYUNTAMIENTO','#4a3a28',9,900);
      if(lateN){ctx.save();ctx.globalCompositeOperation='lighter';fY(-.5,W+.5,fy1+.004,0,FH,'rgba(255,190,110,.10)');ctx.restore();}
      // edificios del lado izquierdo de la plaza
      for(let k=0;k<4;k++){const y0=k*2.4-.3,col=['#e8c9a0','#d9a98a','#efe0c0','#c9b5a0'][k];prismG(-2,y0,-.6,y0+2.3,-10,80+hs(k*3)*30,lateN?shade(col,.6):col);
        for(let r=0;r<3;r++)for(let c=0;c<2;c++){const yy=y0+.4+c*1.0,zz=28+r*22;fX(-.6+.001,yy,yy+.5,zz,zz+13,lateN?(hs(k*9+r*3+c)<.45?'#ffd27a':'#2a3050'):'#4c5a70');}
        if(k===1){fX(-.599,y0+.3,y0+2,4,16,'#7a1f2b');txt(true,y0+1.15,-.598,10,'FARMACIA ✚','#7cf0a8',5,900);}
        if(k===2){fX(-.599,y0+.3,y0+2,4,16,'#2a4a3a');txt(true,y0+1.15,-.598,10,'CAFÉ-BAR','#ffd166',5,900);}}
      // suelo de la plaza: losas de granito
      prism(0,0,W,D,-22,0,'#7d6f60');topQuad(-.6,-.2,W,D,0,wet?'#a8a49a':'#cfc6b4');
      ctx.strokeStyle=wet?'rgba(60,60,70,.25)':'rgba(110,95,75,.22)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<=W;k+=.75){ctx.moveTo(...P(k,-.2));ctx.lineTo(...P(k,D));}for(let k=0;k<=D;k+=1.5){ctx.moveTo(...P(-.6,k));ctx.lineTo(...P(W,k));}ctx.stroke();
      for(let k=1;k<5;k++){topQuad(0,k*1.8-.04,W,k*1.8+.04,.1,'rgba(150,130,100,.25)');}
      if(wet){ctx.save();ctx.globalAlpha=.25;for(let k=0;k<8;k++)isoEll(1+hs(k*3)*10,1+hs(k*5)*7,0,.4+hs(k)*.4,'#8fa3b8');ctx.restore();}
      glow([[1,3,1.8],[11,3,1.8],[1,8,1.6],[11,8,1.6]],.14);};
    after=()=>{vign();if(wet){ctx.strokeStyle='rgba(200,215,235,.35)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<60;k++){const [a,b]=P(hs(k*7)*W,hs(k*13)*D,((hs(k*3)*120-tt*160)%120+120)%120);ctx.moveTo(a,b);ctx.lineTo(a-2,b+8);}ctx.stroke();}};
    // farolas
    for(const [x,y] of [[.6,2.6],[.6,7.6]])add(x,y,()=>{cyl(x,y,.12,0,6,'#2b2b33');cyl(x,y,.04,6,62,'#2b2b33');sBox(x-.15,y-.15,x+.15,y+.15,62,72,lateN?'#ffe08a':'#e9e6df');sBox(x-.2,y-.2,x+.2,y+.2,72,74,'#2b2b33');if(lateN){const [a,b]=P(x,y,67);ctx.save();ctx.globalAlpha=.3;circ(a,b,14,'#ffd27a');ctx.restore();}});
    // tarima de oradores bajo los soportales
    add(6,.9,()=>{sBox(4.4,.2,7.6,1.4,0,8,'#5b6270');fY(4.4,7.6,1.4,1,7,right?'#1f3a93':'#b8322f');txt(false,6,1.41,4,right?TXN.escenas.plataforma_ciudadana:TXN.escenas.plataforma_vecinal,'#fff',5,900);
      cyl(7.2,.6,.12,8,10,'#2b2b33');sBox(7.0,.35,7.4,.75,10,26,'#2b2b33');});
    add(6.2,1.2,()=>{ctx.save();ctx.translate(0,-8);sPerson(5.3,.8,pp(4,{shirt:right?'#1f3a93':'#7a1f2b'}),{act:'cheer',front:true,right:true,ph:tt*3,prop:'📣'});sPerson(6.4,.8,pp(8),{act:'talk',front:true,right:false});ctx.restore();});
    // multitud
    const n=Math.min(44,16+Math.round(mov/3.5));const cols=right?['#1f3a93','#e9ecf0','#2b3242','#c9b48a','#7a8c9e']:['#7a1f2b','#2a4a3a','#e9ecf0','#3a3a3a','#d1242f','#5b6270','#e0a030'];
    const signs=right?[TXN.escenas.bajad_impuestos,'LIBERTAD','¡YA BASTA!','SEGURIDAD']:[TXN.escenas.vivienda_digna,TXN.escenas.no_a_los_recortes,TXN.escenas.salarios_justos,TXN.escenas.alquileres_abusivos_no,'SÍ SE PUEDE',TXN.escenas.ni_un_desahucio];
    for(let k=0;k<n;k++){const x=1.6+hs(k*13+1)*9.6,y=2.2+hs(k*29+7)*6.2;{const dx=x-6,dy=y-6.6;if(dx+dy>-1&&dx+dy<2.6&&Math.abs(dx-dy)<1.8)continue;}if(x>4.2&&x<8&&y<2.2)continue;if(x>9.6&&police)continue;
      const fr=hs(k*31)<.3;const prop=wet&&k%3===0?'☂️':k%7===0?(right?'🇪🇸':'🚩'):k%11===0?'📣':k%9===0?'📱':null;const sign=!prop&&k%4===1;const ch=k%10===3?elder(k):pp(k,{shirt:cols[k%cols.length]});
      add(x,y,()=>{sPerson(x,y,ch,{act:sign?null:(k%3?'cheer':(k%3===0?'talk':null)),front:fr,right:hs(k*5)<.5,ph:tt*3+k,prop});
        if(sign){const [a,b]=P(x,y,0);const bob=Math.sin(tt*3+k)*1.5;capsule(a+6,b-38,a+6,b-66+bob,1.5,'#8a6a4a');ctx.fillStyle='#fffdf8';ctx.fillRect(a-10,b-82+bob,32,16);ctx.strokeStyle='#3b3247';ctx.lineWidth=.6;ctx.strokeRect(a-10,b-82+bob,32,16);
          const s=signs[k%signs.length];ctx.font='900 5px Nunito, sans-serif';ctx.fillStyle=k%2?'#d1242f':'#1f3a6b';ctx.textAlign='center';ctx.textBaseline='middle';const ws=s.split(' ');if(ws.length>2){const m=Math.ceil(ws.length/2);ctx.fillText(ws.slice(0,m).join(' '),a+6,b-77+bob);ctx.fillText(ws.slice(m).join(' '),a+6,b-71+bob);}else ctx.fillText(s,a+6,b-74+bob);}});}
    // pancarta de cabecera sostenida por dos personas
    {const y=4.2,x0=3.2,x1=6.8;add((x0+x1)/2+y+.2,0,()=>{const bob=Math.sin(tt*2)*1;for(const x of [x0,x1]){const [a,b]=P(x,y,0);capsule(a,b-20,a,b-62,1.6,'#8a6a4a');}
      fY(x0,x1,y,38+bob,56+bob,right?'#fffdf8':'#fffdf8');fY(x0,x1,y+.001,38+bob,40+bob,right?'#1f3a93':'#d1242f');fY(x0,x1,y+.001,54+bob,56+bob,right?'#1f3a93':'#d1242f');
      txt(false,(x0+x1)/2,y+.002,47.5+bob,cause,right?'#1f3a93':'#d1242f',8,900);});
      add(x0+y-.05,0,()=>sPerson(x0,y,pp(2,{shirt:cols[1]}),{act:'cheer',front:true,right:true,ph:tt*3}));add(x1+y-.05,0,()=>sPerson(x1,y,pp(7,{shirt:cols[0]}),{act:'cheer',front:true,right:false,ph:tt*3+1}));}
    ana={x:6,y:6.6,pose:'stand',act:'cheer',front:true,right:true,prop:'🪧'};const f=P_('amiga');if(f)add(6.8,6.9,()=>sPerson(6.8,6.9,pp(5),{act:'cheer',front:true,right:false,ph:tt*3+2,name:f.n,prop:right?'🇪🇸':'🚩'}));
    // policía
    if(police){const nP=hard?7:4;for(let k=0;k<nP;k++){const x=10.6+(k%2)*.5,y=2.4+k*(5.6/nP);add(x,y,()=>{sPerson(x,y,{...pp(k+3),hair:'#2b2b33',style:'rapado',pants:'#1b2a44'},{front:true,right:false,shirt:'#1b2a44',vest:false});const [a,b]=P(x,y);const hx=a-1,hy=b-HY;ctx.fillStyle='#1b2a44';ctx.beginPath();ctx.arc(hx,hy,7.4,Math.PI*1.02,Math.PI*1.98);ctx.fill();ctx.fillRect(hx-7.6,hy-1,15.2,2);ctx.fillStyle='rgba(170,200,230,.45)';ctx.fillRect(hx-6.6,hy+1,13.2,5);ctx.fillStyle='#2b3550';ctx.fillRect(a-16,b-30,9,18);ctx.fillStyle='rgba(200,220,240,.35)';ctx.fillRect(a-15,b-29,7,16);});}
      add(11.3,1.2,()=>{sBox(10.2,.4,11.9,1.9,0,4,'#2b2b33');sBox(10.2,.4,11.9,1.9,4,30,'#1b2a44');sBox(10.3,.5,11.8,1.8,30,31,'#e9ecf0');fX(11.9,.6,1.7,14,19,'#e9ecf0');txt(true,1.15,11.9,16.5,'POLICÍA','#1b2a44',5,900);
        fY(10.4,11.4,1.9,16,26,'#2a3550');const on=Math.floor(tt*4)%2;sBox(10.7,.9,10.95,1.15,31,34,on?'#3a8bff':'#1b3a7a');sBox(11.15,.9,11.4,1.15,31,34,on?'#1b3a7a':'#3a8bff');if(night>.2){const [a,b]=P(11,1,33);ctx.save();ctx.globalAlpha=.25;circ(a,b,18,on?'#3a8bff':'#5a8bff');ctx.restore();}});
      if(hard)add(10,8.4,()=>{const [a,b]=P(10,8.4,10);ctx.save();for(let s=0;s<4;s++){ctx.globalAlpha=.18;circ(a-s*8+Math.sin(tt+s)*3,b-s*10,10+s*4,'#d8d8d8');}ctx.restore();});}
    else{for(const [x,y,r] of [[10.8,2.4,false],[11.2,2.9,false]])add(x,y,()=>sPerson(x,y,{...pp(9),style:'corto'},{front:true,right:r,shirt:'#1f3a6b',vest:true,act:'talk'}));}
    // periodista con cámara
    add(2.0,7.8,()=>sPerson(2.0,7.8,pp(10),{front:false,right:true,prop:'🎥'}));
    break;}

  // =============================== MILITANCIA (agrupación) ===============================
  if(act==='militancia'){
    W=12;D=9;const HH=80;drawBase=hall(HH,'#b08850','#efe2c8',[6.4,8.6,10.6]);
    decor=()=>{
      // pared izquierda: escudo y cartel de la agrupación; fondo: pantalla con orden del día
      escudo(true,4,58,1.1);
      fX(.02,1.2,3.0,32,62,'#b8322f');txt(true,2.1,.03,55,'🌹','#fff',12,900);txt(true,2.1,.03,45,'AGRUPACIÓN','#fff',5,900);txt(true,2.1,.03,40,'SOCIALDEMÓCRATA','#fff',4,900);txt(true,2.1,.03,35,'DEL DISTRITO','#fff',4,800);
      fX(.02,5.6,7.4,30,50,'#c9b48a');for(let k=0;k<6;k++)fX(.03,5.7+(k%3)*.55,6.15+(k%3)*.55,k<3?40:32,k<3?48:39,['#fffdf8','#ffe066','#fffdf8'][k%3]);txt(true,6.5,.04,49,'TABLÓN','#5a3f2c',4,900);
      fY(1,5.4,.01,30,66,'#fdfdfb');fY(1.1,5.3,.015,31,65,lateN?'#f2f6ff':'#ffffff');
      txt(false,3.2,.02,60,TXN.escenas.orden_del_dia,'#b8322f',6,900);[TXN.escenas.t1_lectura_del_acta,TXN.escenas.t2_presupuestos_participativos,TXN.escenas.t3_listas_municipales,TXN.escenas.t4_ruegos_y_preguntas].forEach((s,i)=>txt(false,3.2,.02,53-i*5.5,s,'#3b3247',4.5,800));
      {const [a,b]=P(9.6,0,72);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(a,b,6,7,.45,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5a3f2c';ctx.lineWidth=1.2;ctx.stroke();const hr=h%12;ln([a,b],[a+Math.sin(hr/6*Math.PI)*3.3,b-Math.cos(hr/6*Math.PI)*3.3],'#2b2b33',1.4);}
      glow([[5,4,2.5],[3,6,2]],.12);};
    after=vign;
    // banderas
    add(.4,4.9,()=>{flag(.35,4.7,['#c60b1e','#ffc400','#c60b1e'],0);flag(.35,5.15,['#1f3a93','#1f3a93'],1);});
    // mesa larga
    const tx0=2.2,tx1=8.8,ty0=3.2,ty1=4.4;
    add((tx0+tx1)/2+(ty0+ty1)/2,0,()=>{for(const [x,y] of [[tx0+.2,ty0+.2],[tx1-.2,ty0+.2],[tx0+.2,ty1-.2],[tx1-.2,ty1-.2]])sBox(x-.06,y-.06,x+.06,y+.06,0,15,'#5a3f2c');sBox(tx0,ty0,tx1,ty1,15,17.5,'#6b4a35');
      for(let k=0;k<5;k++){const x=tx0+.6+k*1.35;const [a,b]=P(x,ty0+.35,17.5);ctx.fillStyle='#fffdf8';ctx.fillRect(a-5,b-2,8,4);const [c,d]=P(x+.3,ty1-.35,17.5);ctx.fillStyle=k%2?'#e9ecf0':'#fffdf8';ctx.fillRect(c-4,d-2,7,4);cyl(x+.45,(ty0+ty1)/2,.04,17.5,23,'rgba(160,210,240,.85)','#3a6ea5');}
      cyl(tx1-.5,(ty0+ty1)/2,.12,17.5,27,'#c0392b','#3b3f46');for(let k=0;k<3;k++)cyl(tx1-1-k*.25,(ty0+ty1)/2+.2,.05,17.5,20,'#fffdf8');
      {const [a,b]=P(tx0+.4,(ty0+ty1)/2,17.5);ctx.fillStyle='#2b2b33';ctx.fillRect(a-6,b-6,10,6);ctx.fillStyle='#7cc8f0';ctx.fillRect(a-5,b-5,8,4);}});
    const seatsB=[2.8,4.15,5.5,6.85,8.2],seatsF=[2.8,4.15,5.5,6.85,8.2];let k=0;
    seatsB.forEach((x,i)=>{const y=ty0-.45;add(x+y-.1,0,()=>{sChair(x-.5,y-.5,'#7a1f2b');});if(i===1){ana={x,y,pose:'sit',act:'talk',front:true,right:false};return;}if(i===4&&hs(Math.floor(h))<.3)return;
      add(x+y,0,()=>sPerson(x,y,i===2?elder(3):pp(k+1),{pose:'sit',front:true,right:i<2,act:i===3?'talk':i===0?'book':null}));k++;});
    seatsF.forEach((x,i)=>{const y=ty1+.45;if(i===2)return;add(x+y,0,()=>sPerson(x,y,pp(i+6),{pose:'sit',front:false,right:i%2===0,act:i===1?'phone':null}));add(x+y+.3,0,()=>sBox(x-.2,y+.2,x+.2,y+.28,9,22,'#6a1a24'));});
    // compañera que habla de pie
    add(5.5,5.4,()=>sPerson(5.5,5.4,pp(0,{shirt:'#b8322f'}),{act:'talk',front:false,right:false,ph:tt}));
    // termo de café en mesita lateral y alguien sirviéndose
    add(10,1.5,()=>{sBox(9.5,.9,10.5,2.1,0,16,'#a0754c');cyl(9.8,1.3,.12,16,26,'#3b3f46');for(let s=0;s<3;s++)cyl(10.1+s*.12,1.6,.05,16,19,'#fffdf8');const [a,b]=P(10.2,1.9,16);emoji('🥐',a,b-3,7);});
    const [wx2,dir]=tri(tt*.08,8.6,10.2);add(wx2,6.6,()=>sPerson(wx2,6.6,pp(11),{pose:'walk',ph:tt*6,front:dir>0,right:dir>0,prop:'☕'}));
    add(10.5,7.5,()=>plant(10.5,7.5,1));add(.6,.6,()=>plant(.6,.6,1.1));
    break;}

  // =============================== TRABAJO: ventanilla ===============================
  W=12;D=9;const HH=80;const closed=night>.55||h>=15.5||h<8;const busy=!closed;
  drawBase=hall(HH,'#e4dccb',wall,[1.0,3.2,8.4,10.4]);
  const qN=busy?Math.min(10,2+Math.round(cr/12)+(h>=9.5&&h<=12.5?2:0)):0;const austere=w.gov==='austeridad'||cr>=70;
  const turn=busy?47+Math.floor(tt/12)%40:0;const curDesk=1+Math.floor(tt/12)%4;
  decor=()=>{
    // pantalla de turnos en el fondo
    fY(5.0,7.4,.02,46,68,'#1b1e24');fY(5.08,7.32,.03,47.5,66.5,'#0e1a14');
    if(busy){const bl=(tt%12)<1.5&&Math.floor(tt*4)%2;txt(false,6.2,.04,62,TXN.escenas.turno_puesto,'#7cf0a8',4.5,900);txt(false,5.75,.04,55,'A'+String(turn).padStart(3,'0'),bl?'#ffffff':'#ffd166',7,900);txt(false,6.85,.04,55,String(curDesk),bl?'#ffffff':'#ffd166',7,900);txt(false,5.75,.04,49.5,'A'+String(turn-1).padStart(3,'0'),'#5a8a6a',4.5,800);txt(false,6.85,.04,49.5,String((curDesk+2)%4+1),'#5a8a6a',4.5,800);}
    else txt(false,6.2,.04,57,TXN.escenas.oficina_cerrada,'#d1242f',4.5,900);
    // carteles en el fondo
    fY(7.6,8.2,.01,46,58,'#fffdf8');txt(false,7.9,.02,55,'HORARIO','#1f3a6b',3.5,900);txt(false,7.9,.02,51,'L–V','#3b3247',3.5,800);txt(false,7.9,.02,48,'9:00–14:00','#3b3247',3.2,800);
    fY(4.3,4.85,.01,48,60,'#e9f4ea');txt(false,4.57,.02,56,'CITA','#2a6b3a',3.5,900);txt(false,4.57,.02,52,'PREVIA','#2a6b3a',3.5,900);
    // pared izquierda: escudo, tablón, carteles
    escudo(true,6.3,58,1.25);
    fX(.02,3.4,5.2,30,52,'#b08850');fX(.03,3.48,5.12,31,51,'#c9a26a');txt(true,4.3,.04,48,TXN.escenas.tablon_de_edictos,'#3b2a1a',3.6,900);
    for(let k=0;k<6;k++){const y0=3.6+(k%3)*.5,z0=k<3?38:32;fX(.04,y0,y0+.4,z0,z0+6.5,k===4&&cr>50?'#ffd9d9':'#fffdf8');}
    fX(.02,7.6,8.6,32,50,austere?'#fff0d9':'#e3f0ff');if(austere){txt(true,8.1,.03,46,'AYUDAS DE','#b8322f',3.6,900);txt(true,8.1,.03,42,'EMERGENCIA','#b8322f',3.6,900);txt(true,8.1,.03,38,'SOCIAL','#b8322f',3.6,900);txt(true,8.1,.03,34,TXN.escenas.solo_con_cita,'#3b3247',3,700);}
    else{txt(true,8.1,.03,46,'EMPADRONA-','#1f3a6b',3.6,900);txt(true,8.1,.03,42,'MIENTO','#1f3a6b',3.6,900);txt(true,8.1,.03,37,'Trae tu DNI','#3b3247',3,700);}
    {const [a,b]=P(0,2.4,15);ctx.fillStyle='#d1242f';ctx.fillRect(a-2.5,b-14,5,13);ctx.fillStyle='#2b2b33';ctx.fillRect(a-1,b-16,2,2);}
    {const [a,b]=P(0,6.3,74);label(TXN.escenas.atencion_a_la_ciudadania,a,b,'rgba(31,58,107,.9)','#fff',5);}
    glow([[3,3,2.2],[8,3,2.2],[4,7,2],[9,7,2]],.1);};
  after=vign;
  // banderas en el rincón izquierdo, junto al escudo
  add(.4,2.4,()=>{flag(.35,1.2,['#c60b1e','#ffc400','#c60b1e'],0);flag(.35,1.65,['#ffffff','#2e8b57','#ffffff'],1);flag(.35,2.1,['#1f3a93','#1f3a93'],2);});
  // archivadores contra la pared del fondo
  for(const x0 of [.25,2.45,8.55,10.75]){add(x0+.5,.4,()=>{sBox(x0,.05,x0+.9,.55,0,30,'#9aa3ad');for(let r=0;r<3;r++){fY(x0+.05,x0+.85,.551,3+r*9,10+r*9,'#b3bac4');const [a,b]=P(x0+.45,.55,8+r*9);ctx.fillStyle='#5b6270';ctx.fillRect(a-3,b,6,1.5);}
    for(let k=0;k<3;k++){const xx=x0+.1+k*.25;sBox(xx,.15,xx+.2,.45,30,38,['#c0392b','#3a6ea5','#e0a030'][(k+x0*3|0)%3]);}});}
  // mostrador con mamparas
  const cy0=2.7,cy1=3.3,cx0=1.2,cx1=10.8,NP=4,PW=(cx1-cx0)/NP;
  for(let p=0;p<NP;p++){const x0=cx0+p*PW,x1=x0+PW,xm=(x0+x1)/2;const shut=austere&&p===3;
    add(xm+cy1-.2,0,()=>{sBox(x0,cy0,x1,cy1,0,22,'#c9a77a');fY(x0,x1,cy1,2,20,'#b8956a');fY(x0+.05,x1-.05,cy1+.001,6,8,'#a0754c');sBox(x0-.02,cy0-.02,x1+.02,cy1+.02,22,24,'#e9e2d0');
      // mampara y número de puesto
      fY(x0+.15,x1-.15,cy0+.3,24,46,'rgba(200,230,245,.3)');ln(P(x0+.15,cy0+.3,46),P(x1-.15,cy0+.3,46),'#9aa3ad',1.2);fY(xm-.5,xm+.5,cy0+.301,30,34,'rgba(255,255,255,0)');
      sBox(x0-.04,cy0,x0+.04,cy1,24,48,'#9aa3ad');
      fY(xm-.3,xm+.3,cy0+.3,49,58,shut?'#5b6270':'#1f3a6b');txt(false,xm,cy0+.302,53.5,shut?'CERRADO':String(p+1),'#fff',shut?3.6:7,900);
      if(busy&&!shut&&p+1===curDesk){const [a,b]=P(xm+.22,cy0+.3,56);circ(a,b,1.6,Math.floor(tt*3)%2?'#7cf0a8':'#2a6b3a');}
      // monitor de espaldas y papeles
      if(!shut){sBox(xm-.06,cy0+.05,xm+.06,cy0+.15,24,29,'#3b3f46');sBox(xm-.35,cy0+.1,xm+.35,cy0+.16,28,40,'#24262c');const [a,b]=P(xm+.5,cy0+.45,24);ctx.fillStyle='#fffdf8';ctx.fillRect(a-5,b-2,8,3);
        cyl(xm-.55,cy0+.4,.05,24,28,'#3b3f46');const [c,d]=P(xm-.55,cy0+.4,30);emoji('🖊️',c,d,5);}
      else{fY(xm-.4,xm+.4,cy0+.302,30,40,'#fffdf8');txt(false,xm,cy0+.303,36,'Puesto','#b8322f',3.4,900);txt(false,xm,cy0+.303,32,'sin cubrir','#b8322f',3.4,900);}});
    // funcionario/a detrás
    const fy=cy0-.6;add(xm+fy-.1,0,()=>{cyl(xm,fy-.05,.2,0,1.5,'#3b3f46');cyl(xm,fy-.05,.05,1,9,'#5b6270');sBox(xm-.2,fy-.25,xm+.2,fy+.15,9,12,'#2f343c');sBox(xm-.2,fy-.3,xm+.2,fy-.21,12,26,'#3b3f46');});
    const isAna=act==='work'&&p===1;
    if(isAna){ana={x:xm,y:fy,pose:'sit',act:closed?'book':'type',front:true,right:false};}
    else if(!shut&&(busy||(p===2&&h<20))){add(xm+fy,0,()=>sPerson(xm,fy,p===2?pp(1):p===0?elder(5):pp(3),{pose:'sit',act:busy&&hs(p+Math.floor(tt/7))<.5?'talk':'type',front:true,right:p%2===0,name:p===2&&cp?cp.n:null}));}
    // ciudadano/a atendido/a
    if(busy&&!shut&&!(p===1&&hs(Math.floor(tt/12))<.25)){const y=cy1+.55;add(xm+y,0,()=>sPerson(xm+.1,y,p===3?elder(p):pp(p+5),{act:p%2?'talk':null,front:false,right:true,prop:p===0?'📄':null}));}
  }
  // zona de espera: bancadas de asientos metálicos mirando a +x
  for(const bx of [1.0,2.5]){add(bx+5.9,0,()=>{sBox(bx-.05,4.0,bx+.05,7.8,0,8,'#5b6270');for(let s=0;s<5;s++){const y0=4.1+s*.72;sBox(bx-.3,y0,bx+.3,y0+.62,8,10,'#2f6db0');sBox(bx-.32,y0,bx-.22,y0+.62,10,22,'#2a62a0');}});
    for(let s=0;s<5;s++){const y0=4.1+s*.72+.31;const k=Math.round(bx)*5+s;if(!busy||hs(k*17)>.35+cr/200)continue;add(bx+y0+.05,0,()=>sPerson(bx+.02,y0,k%4===0?elder(k):pp(k),{pose:'sit',front:true,right:true,act:hs(k*3)<.45?'phone':(hs(k*5)<.3?'book':null),prop:hs(k*7)<.25?'🎫':null,sad:cr>60&&hs(k)<.3}));}}
  // dispensador de turnos junto a la entrada
  add(10.9,6.3,()=>{sBox(10.65,6.05,11.15,6.55,0,32,'#e9ecf0');sBox(10.6,6.0,11.2,6.6,32,36,'#d1242f');fX(11.151,6.15,6.45,22,30,'#1f3a6b');txt(true,6.3,11.152,26,'COJA','#fff',3,900);txt(true,6.3,11.152,23.5,'TURNO','#fff',3,900);fX(11.152,6.2,6.4,14,16,'#2b2b33');
    if(busy){const ph=(tt*.4)%1;fX(11.16,6.24,6.36,14-ph*5,15,'#fffdf8');}});
  // cola: desde el dispensador hacia el mostrador
  for(let k=0;k<qN;k++){const x=10.1-k*.62,y=5.5+(k%2)*.12;if(x<3.6)break;const ch=k%5===2?elder(k+2):pp(k+4);
    add(x,y,()=>sPerson(x,y,ch,{front:false,right:false,act:k%3===1?'phone':null,prop:k%4===3?'📁':(k===0?'🎫':(wet&&k%3===0?'☂️':null)),sad:cr>65&&k%2===0}));}
  // alguien que entra/sale por la puerta (parte delantera derecha)
  if(busy){const [px,dir]=tri(tt*.07,4.2,11.6);add(px,8.3,()=>sPerson(px,8.3,pp(10),{pose:'walk',ph:tt*6,front:true,right:dir>0,prop:wet?'☂️':(dir>0?'📄':null)}));}
  else{const [px,dir]=tri(tt*.05,3.5,10.5);add(px,8.0,()=>{sPerson(px,8.0,pp(9,{shirt:'#5bc0be'}),{pose:'walk',ph:tt*5,front:true,right:dir>0});const cx=px+(dir>0?.6:-.6);sBox(cx-.25,7.85,cx+.25,8.25,2,16,'#3a6ea5');sBox(cx-.2,7.9,cx+.2,8.2,16,22,'#ffd166');});}
  // plantas y papelera
  add(11.4,8.6,()=>plant(11.4,8.5,1.2));add(3.7,8.6,()=>plant(3.6,8.55,.9));add(11.5,2.6,()=>plant(11.5,2.4,1));
  add(9.3,6.7,()=>{cyl(9.3,6.7,.16,0,12,'#5b6270','#2b2b33');});
  break;}while(0);
  return {W,D,floor,wall,out,tile,decor,items:it,ana,drawBase,after};
};
// Escena: bar
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Bar Manolo: barra con vitrina de tapas, tirador, cafetera con vapor, tele con fútbol, tragaperras, mesas y parroquianos.
SCENES['bar']=function(E){
  const {tt,night,act,w,npc,cp}=E;const h=E.h??13;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=10,D=8,WH=76,cr=(w&&w.crisis)||0,mov=(w&&w.mov)||0;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta',snow=wk==='nieve'||(S.snow||0)>1;
  const H_=i=>Math.abs(hash(i*7919+29))%1;
  const dt=typeof dateOf==='function'?dateOf(S.day):{m:0,wd:0};const wkend=dt.wd>=5;
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const txt=(s,x,y,z,sz,col,onX,wt=900,font='Nunito, sans-serif')=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`${wt} ${sz}px ${font}`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  const up=(z,f)=>{ctx.save();ctx.translate(0,-z);f();ctx.restore();}; // dibujar elevado (taburetes)
  // afluencia: desayunos, vermú, menú del día, tarde floja, cañas y fútbol por la noche
  const busy=(h<7.5?.25:h<10.5?.7:h<12.5?.45:h<16?.95:h<19?.5:h<23.5?.9:.35)*(wkend?1.15:1)*(1-Math.max(0,cr-40)/110);
  const futbol=(h>=20.5||h<1)&&(wkend||dt.wd===1||dt.wd===2)||act==='amigos'&&h>=19;
  const goal=futbol&&(tt%22)<3.2;
  const menu=(10.5+cr/18).toFixed(2).replace('.',',');
  // ---------- suelo de baldosa + paredes con zócalo de azulejo ----------
  const street=(y0,y1,z0,z1)=>{ctx.save();const q=[P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)];ctx.beginPath();ctx.moveTo(...q[0]);for(let k=1;k<4;k++)ctx.lineTo(...q[k]);ctx.closePath();ctx.clip();
    fX(0,y0,y1,z0,z1,night>.5?'#1b2140':'#bfe3f7');
    const side=snow?'#eef2f5':mixHex('#cfc8bb','#2c3150',night*.75),road=snow?'#d9dee3':mixHex('#6b6f78','#1d2136',night*.75);
    topQuad(-1.1,y0-4,0,y1+4,0,side);topQuad(-6,y0-4,-1.1,y1+4,0,road);topQuad(-1.15,y0-4,-1.05,y1+4,1,'#e8e2d4');
    // terraza: una mesa fuera si hace bueno
    if(!rain&&!snow&&night<.6){const [a,b]=P(-.55,y0+.9);cyl(-.55,y0+.9,.3,14,15.5,'#c9c3b8');capsule(a,b,a,b-14,1.5,'#9aa0a6');}
    for(let k=0;k<3;k++){const sp=.3+k*.1,L=(y1-y0)+6;const t=((tt*sp+k*3.1)%L+L)%L;const dir=k%2?1:-1;const yy=dir>0?y0-3+t:y1+3-t;
      sPerson(-.4-k*.15,yy,npc[(k+5)%12],{pose:'walk',ph:tt*7+k,front:dir>0,right:dir<0,prop:rain?'☂️':(k===2?'🐕':null)});}
    if(night>.4){const [lx,ly]=P(-.9,(y0+y1)/2,0);const g=ctx.createRadialGradient(lx,ly,2,lx,ly,70);g.addColorStop(0,`rgba(255,200,120,${.4*night})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(lx-70,ly-70,140,140);}
    if(rain){ctx.strokeStyle='rgba(200,220,255,.55)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<22;k++){const yy=y0+H_(k)*(y1-y0),zz=z0+((H_(k+40)*(z1-z0)-tt*90)%(z1-z0)+(z1-z0))%(z1-z0);const [a,b]=P(0,yy,zz);ctx.moveTo(a,b);ctx.lineTo(a-2,b+7);}ctx.stroke();}
    if(snow){for(let k=0;k<18;k++){const yy=y0+H_(k)*(y1-y0)+Math.sin(tt+k)*.15,zz=z0+((H_(k+40)*(z1-z0)-tt*14)%(z1-z0)+(z1-z0))%(z1-z0);const [a,b]=P(0,yy,zz);circ(a,b,1.3,'rgba(255,255,255,.9)');}}
    ctx.restore();
    fX(0,y0,y1,z0,z1,night>.5?'rgba(255,220,170,.06)':'rgba(220,240,255,.18)');
    poly([P(0,y0+.3,z1-6),P(0,y0+.6,z1-6),P(0,y0+.1,z0+6),P(0,y0-.2+.1,z0+6)],'rgba(255,255,255,.12)');};
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#5d4a38');topQuad(0,0,W,D,0,'#cdb79a');
    for(let i=0;i<W*2;i++)for(let j=0;j<D*2;j++){const a=i/2,b=j/2;if((i+j)%2)topQuad(a,b,a+.5,b+.5,0,'#bfa585');}
    ctx.strokeStyle='rgba(60,40,20,.08)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W*2;k++){ctx.moveTo(...P(k/2,0));ctx.lineTo(...P(k/2,D));}for(let k=1;k<D*2;k++){ctx.moveTo(...P(0,k/2));ctx.lineTo(...P(W,k/2));}ctx.stroke();
    const wc='#efe0bf';sBox(0,-.15,W,0,0,WH,wc);sBox(-.15,-.15,0,D,0,WH,shade(wc,.95));
    // zócalo de azulejos
    fY(0,W,0,0,26,'#e9f0ee');fX(0,0,D,0,26,'#dfe7e5');
    ctx.strokeStyle='rgba(60,110,130,.25)';ctx.lineWidth=.7;ctx.beginPath();for(let k=0;k<=W*3;k++){ctx.moveTo(...P(k/3,0,0));ctx.lineTo(...P(k/3,0,26));}for(let k=0;k<=D*3;k++){ctx.moveTo(...P(0,k/3,0));ctx.lineTo(...P(0,k/3,26));}
    for(const z of [8.7,17.3]){ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(W,0,z));ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(0,D,z));}ctx.stroke();
    fY(0,W,0,24,27,'#2f6f86');fX(0,0,D,24,27,'#2a6378');
    // cenefa de madera arriba
    fY(0,W,0,WH-6,WH-2,'#6b4a2e');fX(0,0,D,WH-6,WH-2,'#5d4027');
    // ventanal y puerta a la calle (pared izquierda)
    street(2.5,5.1,26,62);fX(0,2.4,2.5,26,63,'#6b4a2e');fX(0,5.1,5.2,26,63,'#6b4a2e');fX(0,2.4,5.2,62,65,'#6b4a2e');fX(0,2.4,5.2,25,27,'#6b4a2e');fX(0,3.75,3.85,27,62,'#6b4a2e');
    txt('BAR',0,3.15,52,11,'rgba(200,40,40,.85)',true,900,'Georgia, serif');txt('MANOLO',0,4.45,52,9,'rgba(200,40,40,.85)',true,900,'Georgia, serif');
    txt(TXN.escenas.desayunos_tapas,0,3.8,30,5,'rgba(255,255,255,.75)',true,700);
    street(5.6,6.8,0,60);fX(0,5.5,5.6,0,61,'#6b4a2e');fX(0,6.8,6.9,0,61,'#6b4a2e');fX(0,5.5,6.9,60,63,'#6b4a2e');fX(0,6.15,6.25,0,60,'#6b4a2e');
    capsule(...P(0,6.05,30),...P(0,6.05,24),1.5,'#c9a227');capsule(...P(0,6.35,30),...P(0,6.35,24),1.5,'#c9a227');
    fX(0,5.62,6.12,44,52,'#fffdf8');txt(h<7||h>=24?'CERRADO':'ABIERTO',0,5.87,48,3.6,h<7||h>=24?'#d1242f':'#2e8b57',true);
    // carteles de la pared izquierda
    fX(0,.3,1.15,40,56,'#fffdf8');txt('PROHIBIDO',0,.72,52,3.8,'#d1242f',true);txt('FUMAR',0,.72,48.5,4.6,'#d1242f',true);emoji('🚭',...P(0,.72,43.5),7);
    fX(0,1.3,2.2,34,46,'#fffdf8');txt(TXN.escenas.hoy_no_se_fia,0,1.75,42,3.3,'#3b3247',true);txt('MAÑANA SÍ',0,1.75,38.5,3.6,'#d1242f',true);
    // tragaperras contra la pared, junto a la puerta
    // pared del fondo: rótulo, espejo, botellero
    txt('BAR MANOLO',3.6,0,67,12,'#7a1f1f',false,900,'Georgia, serif');
    fY(.9,6.6,0,34,62,'#9fb0b5');fY(.95,6.55,0,34.5,61.5,'rgba(190,215,225,.8)');
    poly([P(1.5,0,61),P(2.1,0,61),P(1.4,0,35),P(.95,0,35)],'rgba(255,255,255,.18)');poly([P(4.2,0,61),P(4.5,0,61),P(3.9,0,35),P(3.7,0,35)],'rgba(255,255,255,.14)');
    for(const z of [36,48]){sBox(.9,0,6.6,.3,z-1.5,z,'#6b4a2e');
      for(let k=0;k<22;k++){const x=1.0+k*.255;if(x>6.4)break;if(H_(k+z*3)<Math.max(0,cr-55)/80)continue;const c=['#2e5e3a','#6b2b1a','#c9a227','#e8e2d4','#3a5a8c','#8c2b3a','#2b2b33','#b5543c'][Math.floor(H_(k*7+z)*8)];const hb=7+H_(k+z)*4;
        fY(x,x+.12,.18,z,z+hb,c);fY(x+.035,x+.085,.18,z+hb,z+hb+3,shade(c,.8));fY(x+.02,x+.1,.18,z+hb*.35,z+hb*.65,'rgba(255,255,240,.55)');}}
    // pizarra del menú del día
    fY(7.45,8.45,0,26,52,'#6b4a2e');fY(7.5,8.4,0,27,51,'#2d3a33');
    txt('MENÚ DEL DÍA',7.95,0,47,4,'#fffdf8');txt(menu+' €',7.95,0,42,6,'#ffd23f');
    const pl=['lentejas',TXN.escenas.ensalada_mixta,'macarrones','pollo asado','merluza','flan / fruta'];for(let k=0;k<5;k++)txt(pl[(k+S.day)%6],7.95,0,37-k*2.6,3.1,'rgba(255,255,255,.85)',false,700);
    fY(9.4,9.9,0,48,60,'#fffdf8');fY(9.4,9.9,0,56,60,'#d1242f');txt(['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][dt.m||0],9.65,0,58,3.2,'#fff');txt(String(dt.dm||1),9.65,0,52,5,'#3b3247');
    // bufanda y lotería
    poly([P(6.75,0,63),P(9.6,0,63),P(9.6,0,66),P(6.75,0,66)],'#d1242f');for(let k=0;k<6;k++)fY(6.75+k*.48,6.99+k*.48,0,63,66,'#fffdf8');
    if(dt.m>=9)fY(.2,.8,0,46,58,'#ffd23f'),txt('HAY',.5,0,55,3.6,'#d1242f'),txt('LOTERÍA',.5,0,51,3.6,'#d1242f'),txt('Navidad',.5,0,48,3,'#3b3247',false,700);
    // cartel de asamblea o huelga cuando se mueve el barrio
    if(mov>45){fX(0,1.3,2.2,48,62,'#fffdf8');txt(S.strike&&S.strike.on?'HUELGA':'ASAMBLEA',0,1.75,58,4.2,'#d1242f',true);txt('de barrio',0,1.75,54,3.4,'#3b3247',true,700);txt('jueves 19h',0,1.75,51,3.2,'#3b3247',true,700);}
    // reloj
    {const [a,b]=P(6.9,0,70);circ(a,b,4.5,'#fffdf8');ctx.strokeStyle='#6b4a2e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(a,b,4.5,0,Math.PI*2);ctx.stroke();const mm=(h%1)*Math.PI*2,hh=(h%12)/12*Math.PI*2;capsule(a,b,a+Math.sin(hh)*2.4,b-Math.cos(hh)*2.4,1,'#2b2b33');capsule(a,b,a+Math.sin(mm)*3.6,b-Math.cos(mm)*3.6,.7,'#2b2b33');}
  };
  // ---------- contrabarra: cafetera, caja, grifo (pegado a la pared, se dibuja antes) ----------
  const decor=()=>{
    sBox(.8,0,6.8,.55,0,28,'#7a5230');fY(.8,6.8,.55,0,3,'#3b2a1e');
    for(let k=0;k<5;k++)fY(1.0+k*1.15,1.95+k*1.15,.55,5,24,'#87603a');
    sTop(.8,0,6.8,.55,28.1,'#b8b2a6');
    // cafetera de dos grupos con vapor
    sBox(1.1,.08,2.3,.5,28,46,'#b9bfc6');fY(1.1,2.3,.5,30,44,'#8f979f');fY(1.15,2.25,.5,40,44,'#d1242f');txt('EXPRESS',1.7,.5,42,3.6,'#fff');
    for(const gx of [1.4,1.95]){sBox(gx,.4,gx+.18,.62,34,37,'#3b3f46');}
    sTop(1.12,.1,2.28,.48,46.1,'#9aa0a6');for(let k=0;k<5;k++)cyl(1.25+k*.22,.28,.08,46,50,'#fffdf8','#e8e2d4');
    for(let k=0;k<4;k++){const t=(tt*.7+k*.25)%1;const [a,b]=P(2.15,.55,36+t*30);ctx.fillStyle=`rgba(255,255,255,${.45*(1-t)})`;ctx.beginPath();ctx.arc(a+Math.sin(tt*2+k)*3,b,3+t*6,0,Math.PI*2);ctx.fill();}
    // molinillo y caja registradora
    sBox(2.5,.15,2.8,.45,28,40,'#2b2b33');cyl(2.65,.3,.12,40,48,'rgba(120,80,40,.8)');
    sBox(5.2,.1,6.0,.5,28,36,'#3b3f46');sBox(5.25,.12,5.95,.32,36,42,'#2b2b33');fY(5.3,5.9,.32,37,41,'#7cf0a8');sTop(5.3,.32,5.9,.5,36.1,'#d8d2c4');
    // tostadora y bandeja de vasos
    sBox(3.2,.1,3.9,.5,28,34,'#c9c3b8');fY(3.3,3.8,.5,30,33,night>.3?'#ff9a3c':'#7a5a3a');
    for(let k=0;k<6;k++)cyl(4.15+(k%3)*.18,.2+Math.floor(k/3)*.18,.07,28,33,'rgba(220,235,240,.7)','rgba(255,255,255,.6)');
    // tele colgada en la esquina con fútbol (o el telediario)
    const tx0=5.85,tx1=7.35,tz=-4,tc=(tx0+tx1)/2;capsule(...P(tc,.32,80),...P(tc,.32,68),1.6,'#2b2b33');
    ctx.save();ctx.translate(0,-tz);sBox(tx0,.25,tx1,.4,48,64,'#1d1f24');const sc=[P(tx0+.1,.4,49.5),P(tx1-.1,.4,49.5),P(tx1-.1,.4,62.5),P(tx0+.1,.4,62.5)];
    const flick=.9+.1*Math.sin(tt*13);
    if(futbol||h>=15&&h<17&&!night){poly(sc,mixHex('#2e8b3a','#3fa34d',flick-.9));
      // líneas del campo y jugadores
      ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...P(tc,.4,49.5));ctx.lineTo(...P(tc,.4,62.5));ctx.stroke();
      for(let k=0;k<8;k++){const u=tx0+.25+((H_(k)*1.5+Math.sin(tt*.8+k)*.25)%1.5),z=51+H_(k+5)*10+Math.cos(tt*.9+k*2)*1.2;const [a,b]=P(u,.4,z);circ(a,b,.9,k%2?'#fffdf8':'#d1242f');}
      const [ba,bb]=P(tx0+.9+Math.sin(tt*1.1)*.6,.4,56+Math.cos(tt*1.6)*4);circ(ba,bb,.7,'#ffffff');
      fY(tx0+.12,tx0+.75,.4,59.5,62.3,'rgba(20,20,30,.8)');txt(goal?'¡GOL!':'1-1',tx0+.44,.4,61,3,goal?'#ffd23f':'#fff');}
    else{poly(sc,'#2a4a7a');fY(tx0+.1,tx1-.1,.4,49.5,53,'#d1242f');txt(cr>60?'EL PARO SUBE':'NOTICIAS',tc,.4,51.2,3.4,'#fff');const [a,b]=P(tc,.4,57);circ(a,b-1,2.4,'#e0b090');ctx.fillStyle='#2b2b33';ctx.fillRect(a-4,b+1,8,4);}
    ctx.restore();
    // tragaperras contra la pared izquierda, junto a la puerta
    {const x0=8.5,x1=9.3,y1=.7;sBox(x0,0,x1,y1,0,44,'#2b2b33');fY(x0+.05,x1-.05,y1,4,40,'#d1242f');
    for(let k=0;k<3;k++){const xa=x0+.12+k*.2;fY(xa,xa+.17,y1,22,30,'#fffdf8');emoji(['🍒','🔔','🍋','⭐','7️⃣'][Math.floor(tt*(3+k)+k*2)%5],...P(xa+.085,y1,26),5);}
    for(let k=0;k<6;k++){const on=Math.sin(tt*6+k*1.3)>0;const [a,b]=P(x0+.1+k*.11,y1,35);circ(a,b,1.2,on?['#ffd23f','#ff4d4d','#5bc0be'][k%3]:'#5a2020');}
    fY(x0+.05,x1-.05,y1,36,40,'#ffd23f');txt('SUPER 7',(x0+x1)/2,y1,38,3.8,'#d1242f');sBox(x0+.1,y1,x1-.1,y1+.12,14,17,'#9aa0a6');}
    // paragüero cuando llueve
    if(rain||snow){cyl(.4,5.25,.2,0,12,'#3b3f46');for(const [c,dx] of [['#2a7fd4',-.05],['#d1242f',.07],['#2b2b33',0]]){const [a,b]=P(.4+dx,5.25,12);capsule(a,b,a+dx*20,b-12,2,c);}}
  };
  // ---------- barra en segmentos (para que la gente quede bien por delante y por detrás) ----------
  const bx0=.8,bx1=6.8,by0=1.35,by1=2.05,BH=22;
  for(let x=bx0;x<bx1-.01;x+=1){const x2=Math.min(bx1,x+1),last=x2>=bx1;add(x+.5,by1+.02,()=>{
    sBox(x,by0,x2,by1,0,BH,'#8a5d34');fY(x,x2,by1,2,BH-3,'#7a5230');
    for(let k=0;k<2;k++){const a=x+.08+k*.5;fY(a,a+.42,by1,5,BH-6,'#946640');}
    sBox(x-.02,by0-.05,x2+.02,by1+.08,BH,BH+2,'#c7cbcf');
    // barra de apoyar los pies
    capsule(...P(x,by1+.15,4),...P(x2,by1+.15,4),2,'#c9a227');
    if(last)fX(x2,by0,by1,2,BH-3,'#6b4a2e');
    // servilletero y palillero cada dos metros
    if(Math.round(x*10)%20===8){sBox(x+.7,by0+.3,x+.85,by0+.45,BH+2,BH+7,'#c7cbcf');fY(x+.7,x+.85,by0+.45,BH+2.5,BH+6.5,'#fffdf8');cyl(x+.92,by0+.45,.04,BH+2,BH+6,'#c9a227');}
  });}
  // grifo de cerveza
  add(1.25,1.8,()=>{sBox(1.0,1.45,1.5,1.75,BH+2,BH+3,'#9aa0a6');cyl(1.25,1.55,.07,BH+2,BH+18,'#c9cdd2','#e8ecef');
    sBox(1.13,1.5,1.37,1.6,BH+14,BH+19,'#c8102e');fY(1.13,1.37,1.6,BH+14,BH+19,'#d1242f');txt('CAÑA',1.25,1.6,BH+16.5,2.4,'#fff');
    const [a,b]=P(1.25,1.64,BH+15);capsule(a,b,a,b-5,1.6,'#2b2b33');
    // caña reposando
    cyl(1.25,1.68,.06,BH+3,BH+9,'rgba(240,180,40,.85)','#fffdf8');});
  // vitrina de tapas sobre la barra
  add(4.0,1.8,()=>{const vx0=2.5,vx1=5.4,vy0=1.42,vy1=1.82,z0=BH+2;sBox(vx0,vy0,vx1,vy1,z0,z0+2,'#c7cbcf');
    const tapas=[['#f2c14e','#e9a93a'],['#fff6d8','#e8d9a8'],['#c8783a','#a85a2a'],['#e9d8a6','#d9b26a'],['#d1242f','#fff'],['#b8c8d0','#7c8f99']];
    const nm=['tortilla','ensaladilla','croquetas','pimientos','calamares','boquerones'];
    for(let k=0;k<6;k++){const x=vx0+.1+k*.47;if(cr>70&&k%3===2)continue;sBox(x,vy0+.06,x+.4,vy1-.06,z0+2,z0+3,'#fffdf8');const [c1,c2]=tapas[k];
      if(k===0){sBox(x+.06,vy0+.1,x+.34,vy1-.1,z0+3,z0+6,c1);sTop(x+.06,vy0+.1,x+.2,vy0+.25,z0+6.1,c2);}
      else for(let j=0;j<5;j++){const [a,b]=P(x+.1+(j%3)*.1,vy0+.13+Math.floor(j/3)*.12,z0+4.5);circ(a,b,1.6,j%2?c1:c2);}}
    // cristal
    poly([P(vx0,vy1,z0+2),P(vx1,vy1,z0+2),P(vx1,vy1-.12,z0+9),P(vx0,vy1-.12,z0+9)],'rgba(200,230,240,.28)');
    poly([P(vx0,vy1-.12,z0+9),P(vx1,vy1-.12,z0+9),P(vx1,vy0,z0+9),P(vx0,vy0,z0+9)],'rgba(220,240,250,.22)');
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(...P(vx0,vy1,z0+2));ctx.lineTo(...P(vx0,vy1-.12,z0+9));ctx.lineTo(...P(vx1,vy1-.12,z0+9));ctx.stroke();});
  // pata de jamón en el jamonero
  add(6.3,1.85,()=>{sBox(6.0,1.5,6.7,1.8,BH+2,BH+4,'#a0754c');const [a,b]=P(6.1,1.65,BH+9),[c,d]=P(6.6,1.65,BH+6);ctx.fillStyle='#8c3b2a';ctx.beginPath();ctx.ellipse((a+c)/2,(b+d)/2,8,3.6,.35,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8c9a0';ctx.beginPath();ctx.ellipse((a+c)/2+3,(b+d)/2,3,2.2,.35,0,Math.PI*2);ctx.fill();capsule(a,b,a-5,b-5,2,'#5a3a22');});
  // servilletas, palillos y huesos de aceituna por el suelo junto a la barra
  const nap=Math.round(4+busy*8+(h>=20?4:0));
  for(let k=0;k<nap;k++){const x=1+H_(k)*5.6,y=2.3+H_(k+50)*1.1;add(x-1,y-1,()=>{const [a,b]=P(x,y,0);ctx.fillStyle='#fbfaf5';ctx.beginPath();ctx.moveTo(a-2.4,b);ctx.lineTo(a,b-1.5);ctx.lineTo(a+2.6,b-.2);ctx.lineTo(a+.4,b+1.4);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=.4;ctx.stroke();});}
  // ---------- mesas ----------
  const chair=(x,y,side,back)=>{const c='#b9bfc6';const [a,b]=P(x,y);
    sBox(x-.17,y-.17,x+.17,y+.17,9,11,'#8a5d34');for(const [dx,dy] of [[-.15,-.15],[.15,-.15],[.15,.15],[-.15,.15]]){const [p,q]=P(x+dx,y+dy);capsule(p,q,p,q-9,1,c);}
    if(back!==false){const bx=side==='w'?x-.17:side==='e'?x+.17:x,by=side==='n'?y-.17:side==='s'?y+.17:y;const along=side==='n'||side==='s';
      if(along)sBox(x-.17,by-.02,x+.17,by+.02,11,24,'#8a5d34');else sBox(bx-.02,y-.17,bx+.02,y+.17,11,24,'#8a5d34');}};
  const table=(x,y)=>{sBox(x-.4,y-.4,x+.4,y+.4,15.5,17,'#d8d2c4');const [a,b]=P(x,y);capsule(a,b,a,b-15,2.2,'#9aa0a6');isoEll(x,y,0,.22,'#9aa0a6');};
  const onT=(x,y,things)=>{for(const [k,dx,dy] of things){const xx=x+dx,yy=y+dy;
    if(k==='cana'){cyl(xx,yy,.06,17,23,'rgba(240,180,40,.85)','#fffdf8');}
    else if(k==='vino'){cyl(xx,yy,.05,17,22,'rgba(120,20,40,.8)','#7a1f2a');}
    else if(k==='cafe'){cyl(xx,yy,.13,17,17.6,'#fffdf8');cyl(xx,yy,.06,17.6,21,'#fffdf8','#5a3a22');}
    else if(k==='plato'){isoEll(xx,yy,17.3,.22,'#fffdf8');isoEll(xx,yy,17.8,.13,['#f2c14e','#c8783a','#d1242f'][Math.floor(H_(x*10+y)*3)]);}
    else if(k==='serv'){sBox(xx-.08,yy-.05,xx+.08,yy+.05,17,21,'#c7cbcf');}
    else if(k==='cartas'){for(let j=0;j<5;j++){const [a,b]=P(xx+j*.06,yy,17.3);ctx.fillStyle=j%2?'#fffdf8':'#f4e7c8';ctx.fillRect(a-1.5,b-1,3,2);}}
    else if(k==='domino'){for(let j=0;j<6;j++){const [a,b]=P(xx+(j%3)*.08,yy+Math.floor(j/3)*.08,17.4);ctx.fillStyle='#fffdf8';ctx.fillRect(a-1.6,b-.8,3.2,1.6);circ(a,b,.4,'#2b2b33');}}}};
  // una mesa completa: [{side,ch,opts}] sentados
  const mesa=(x,y,seats,things,empty)=>{
    add(x,y-.01,()=>{table(x,y);onT(x,y,things||[]);});
    for(const s of ['n','w','e','s']){const off={n:[0,-.62],s:[0,.62],w:[-.62,0],e:[.62,0]}[s];const cx=x+off[0],cy=y+off[1];const p=seats.find(q=>q.side===s);
      const back=s==='e'||s==='s';
      if(!back)add(cx-.02,cy-.02,()=>chair(cx,cy,s));else add(cx-.02,cy-.02,()=>chair(cx,cy,s,false));
      if(p){const dir={n:[true,false],w:[true,true],e:[false,false],s:[false,true]}[s];
        if(p.ana)p.ana(cx,cy,dir);else add(cx,cy,()=>sPerson(cx,cy,p.ch,{pose:'sit',act:p.act,front:dir[0],right:dir[1],name:p.name,prop:p.prop,mood:p.mood}));}
      if(back)add(cx+.03,cy+.03,()=>{const bx=s==='e'?cx+.17:cx,by=s==='s'?cy+.17:cy;if(s==='s')sBox(cx-.17,by-.02,cx+.17,by+.02,11,24,'#8a5d34');else sBox(bx-.02,cy-.17,bx+.02,cy+.17,11,24,'#8a5d34');});}
  };
  const amiga=outFriend();const AN={};
  const anaSeat=(cx,cy,dir)=>{AN.x=cx;AN.y=cy;AN.front=dir[0];AN.right=dir[1];};
  const lunch=h>=13&&h<16.5;
  // mesa 1: la de Ana cuando viene de visita (o una pareja cualquiera)
  if(act==='amigos')mesa(3.2,4.3,[{side:'w',ana:anaSeat},{side:'e',ch:amiga?amiga.ch||npc[4]:npc[4],act:'talk',name:amiga?amiga.n:null},...(busy>.6?[{side:'n',ch:npc[10],act:goal?'cheer':'talk'}]:[])],[['cana',-.15,-.1],['cana',.18,.1],['plato',0,0],['serv',.25,-.25]]);
  else if(act==='eat')mesa(3.2,4.3,[{side:'w',ana:anaSeat},...(busy>.5?[{side:'e',ch:{...npc[3]},act:'eat',vest:true}]:[])],[['plato',-.15,0],['plato',.2,.05],['vino',.1,-.22],['serv',.25,-.25]]);
  else mesa(3.2,4.3,busy>.4?[{side:'w',ch:npc[2],act:lunch?'eat':'talk'},{side:'n',ch:npc[6],act:'talk'}]:[],busy>.4?[['cafe',-.1,0],['cafe',.15,.1],['serv',.25,-.25]]:[['serv',.25,-.25]]);
  // mesa 2: los jubilados del dominó / las cartas
  const abuelos=h>=10&&h<21;
  mesa(6.0,4.1,abuelos?[{side:'w',ch:elder(1),act:'talk'},{side:'n',ch:elder(2),act:null},{side:'e',ch:elder(5),act:'book'},...(cr<70?[{side:'s',ch:elder(6),act:'talk'}]:[])]:(busy>.6?[{side:'n',ch:npc[9],act:'talk'},{side:'e',ch:npc[1],act:'talk'}]:[]),abuelos?[['domino',-.1,-.05],['vino',.25,.2],['cafe',-.25,.2]]:[['cana',0,0],['serv',.25,-.25]]);
  // mesa 3 (delante): obreros del menú del día, o gente de cañas
  if(busy>.55)mesa(5.0,6.4,lunch?[{side:'w',ch:npc[0],act:'eat'},{side:'n',ch:npc[7],act:'eat'},{side:'e',ch:npc[8],act:'talk'}]:[{side:'n',ch:npc[11],act:futbol?'watch':'talk'},{side:'e',ch:npc[5],act:futbol?(goal?'cheer':'watch'):'talk'}],lunch?[['plato',-.15,0],['plato',.15,-.1],['vino',.2,.2],['serv',-.25,.25]]:h<11.5?[['cafe',0,-.1],['cafe',.15,.15],['plato',-.15,.1]]:[['cana',0,-.1],['cana',.15,.15],['plato',-.15,.1]]);
  else mesa(5.0,6.4,[],[['serv',.25,-.25]]);
  mesa(8.2,5.6,busy>.8?[{side:'n',ch:npc[3],act:'talk'},{side:'w',ch:npc[10],act:'phone'}]:[],busy>.8?[['cana',0,0],['vino',.15,.15]]:[]);
  // ---------- taburetes y parroquianos de barra ----------
  const stool=(x,y)=>{const [a,b]=P(x,y);for(const d of [-3,3])capsule(a+d,b,a+d*.5,b-17,1.2,'#9aa0a6');capsule(a-3,b-6,a+3,b-6,1,'#9aa0a6');cyl(x,y,.17,17,19,'#7a1f1f','#8c2b2b');};
  const regs=[];
  // el del periódico, siempre en su sitio
  regs.push({x:5.3,ch:elder(4),act:'book',prop:'📰'});
  if(busy>.35)regs.push({x:2.2,ch:npc[1],act:h<11?null:'eat',prop:h<11?'☕':null});
  if(busy>.6)regs.push({x:3.4,ch:npc[6],act:futbol?(goal?'cheer':'watch'):'talk'});
  if(busy>.8)regs.push({x:4.3,ch:{...npc[0]},act:'talk',vest:h<11});
  for(const sx of [1.6,2.2,2.8,3.4,4.3,5.3,6.1])add(sx,2.4,()=>stool(sx,2.4));
  for(const r of regs){const x=r.x;add(x+.01,2.42,()=>up(13,()=>sPerson(x,2.42,r.ch,{pose:'sit',act:r.act,front:false,right:true,prop:r.prop,vest:r.vest})));
    if(r.act==='eat'||r.prop==='☕')add(x-.6,1.8,()=>{isoEll(x-.15,1.8,BH+2.3,.2,'#fffdf8');});}
  // uno de pie en la barra con su caña
  if(busy>.5)add(6.5,2.6,()=>sPerson(6.5,2.6,npc[2],{act:'talk',front:false,right:true}));
  // el de la tragaperras
  if(h>=10&&h<23&&cr>25)add(8.9,1.3,()=>sPerson(8.9,1.3,elder(7),{front:false,right:true,act:'type'}));
  // ---------- personal detrás de la barra ----------
  const manolo={...npc[9],g:'m',style:'calvo',hair:'#9a9a9a',beard:'bigote',build:'ancha',pants:'#2b2b33',glasses:false,age:60};
  // Manolo: preocupado si hay crisis
  const mx=act==='work'?5.6:3.6;add(mx,.95,()=>{sPerson(mx,.95,manolo,{act:cr>65?'book':'stir',front:true,right:false,shirt:'#fffdf8',mood:cr>65?25:70,name:'Manolo'});
    const [a,b]=P(mx,.95);ctx.fillStyle='#2b2b33';ctx.globalAlpha=.85;ctx.fillRect(a-5,b-22,10,6);ctx.globalAlpha=1;});
  // camarero que sale a las mesas (si Ana no trabaja hoy aquí, o su compañera)
  const waiterPath=(t)=>{// recorrido: barra → hueco de la barra → mesas → vuelta
    const pts=[[2.4,.95],[7.15,.95],[7.15,3.2],[6.9,5.0],[6.9,5.0],[7.15,3.2],[7.15,.95],[2.4,.95]];const seg=[0,4,2.2,2,2.5,2,2.2,4];const tot=seg.reduce((a,b)=>a+b,0)+6;
    let u=t%tot;if(u<6)return {x:2.4,y:.95,walk:false,front:true,right:true};u-=6;
    for(let i=1;i<pts.length;i++){if(u<=seg[i]){const f=u/seg[i];const [x0,y0]=pts[i-1],[x1,y1]=pts[i];const dx=x1-x0,dy=y1-y0;
      if(!dx&&!dy)return {x:x0,y:y0,walk:false,front:false,right:false,serve:true};
      return {x:x0+dx*f,y:y0+dy*f,walk:true,front:dx>0||dy>0?true:false,right:dx>0||dy<0};}u-=seg[i];}
    return {x:2.4,y:.95,walk:false,front:true,right:true};};
  let ana={x:3,y:3,pose:'stand',act:null,front:true,right:true};
  if(act==='work'){const p=waiterPath(tt);ana={x:p.x,y:p.y,pose:p.walk?'walk':'stand',walkPh:p.walk?tt*7:null,act:p.walk?null:(p.serve?'talk':'stir'),front:p.front,right:p.right,prop:p.walk&&p.y>1.2?'🍺':null};
    if(cp)add(4.5,.95,()=>sPerson(4.5,.95,cp.ch||npc[4],{act:'type',front:true,right:true,name:cp.n,shirt:'#2b2b33'}));}
  else{const p=waiterPath(tt+9);add(p.x,p.y,()=>sPerson(p.x,p.y,{...npc[4],pants:'#2b2b33'},{pose:p.walk?'walk':'stand',ph:tt*7,act:p.walk?null:(p.serve?'talk':'stir'),front:p.front,right:p.right,shirt:'#2b2b33',prop:p.walk&&p.y>1.2?'🍺':null}));
    if(AN.x!=null)ana={x:AN.x,y:AN.y,pose:'sit',act:act==='eat'?'eat':(goal?'cheer':'talk'),front:AN.front,right:AN.right};}
  // alguien que entra o sale por la puerta
  {const L=14,t=(tt*.5)%L;if(t<5){const f=t/5;const x=.4+f*2.2,y=6.2-f*.6;add(x,y,()=>sPerson(x,y,npc[11],{pose:'walk',ph:tt*7,front:true,right:true,prop:rain?'☂️':null}));}}
  // ---------- capa final: lámparas cálidas ----------
  const after=()=>{
    // luz cálida de bar por la noche (o a primera hora)
    const wl=Math.max(night,h<8.5?.6:0);
    if(wl>.2){ctx.save();ctx.globalCompositeOperation='multiply';const [a,b]=P(W/2,D/2,20);const g=ctx.createRadialGradient(a,b-40,60,a,b,460);g.addColorStop(0,`rgba(255,236,205,${.5*wl})`);g.addColorStop(1,`rgba(150,110,110,${.45*wl})`);ctx.fillStyle=g;ctx.fillRect(a-600,b-500,1200,1000);ctx.restore();}
    if(goal){const [a,b]=P(6.6,.4,82);ctx.save();ctx.globalAlpha=.9;label('¡¡GOOOL!!',a,b-6,'#ffd23f','#d1242f',9);ctx.restore();}
  };
  return {W,D,floor:'#cdb79a',wall:'#efe0bf',out:false,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: biblioteca
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Biblioteca municipal: estanterías altas, mesas largas con flexos, opositores con apuntes, mostrador de préstamo
SCENES['biblioteca']=function(E){
  const {tt,night,act,w,npc,cp,h}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const hs=i=>Math.abs(hash(i|0));
  let ana={x:3,y:3,pose:'sit',act:'book',front:true,right:false};let W=12,D=9,floor='#b98c5a',wall='#efe7d6',out=false,tile=false,decor=null,drawBase=null,after=null;
  const cr=w.crisis||0,wx=(S.weather&&S.weather.k)||'sol',wet=wx==='lluvia'||wx==='tormenta',lateN=night>.55,HH=84;
  const exam=cr>40||[0,4,5,11].includes((dateOf(S.day)||{}).m);const busy=Math.min(1,.45+cr/160+(exam?.2:0)+(h>=16&&h<=20?.15:0))*((h>=21.5||h<8.5)?(exam?.55:.25):1);
  const austere=w.gov==='austeridad'||cr>=70;
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const txt=(onX,u,v,z,s,col,size,wt)=>{const [a,b]=onX?P(v,u,z):P(u,v,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`${wt||800} ${size}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  const ln=(a,b,col,wd)=>{ctx.strokeStyle=col;ctx.lineWidth=wd||1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const pp=(k,o)=>({...npc[((k%12)+12)%12],...(o||{})});
  const tri=(t,a,b)=>{const p=((t%2)+2)%2;return p<1?[a+(b-a)*p,1]:[b-(b-a)*(p-1),-1];};
  const BK=['#8c4b5a','#3a5a8c','#5a7a3a','#a0754c','#c9a24a','#6b3a5a','#2f5f6b','#b8573c','#e9e2d0','#4a4a5a'];
  // libros en un estante de pared (plano y=yy, de x0 a x1, a altura z)
  const booksY=(x0,x1,yy,z,seed,gaps)=>{let x=x0,k=0;while(x<x1-.05){const bw=.07+hs(seed+k*7)*.07,bh=6+hs(seed+k*13)*3.5;const lean=hs(seed+k*3)<.05;if(!(gaps&&hs(seed+k*17)<gaps))fY(x,Math.min(x1,x+bw),yy,z,z+bh,BK[(seed+k*5)%BK.length]);x+=bw+.008;k++;if(lean)x+=.06;}};
  const booksX=(xx,y0,y1,z,seed,gaps)=>{let y=y0,k=0;while(y<y1-.05){const bw=.07+hs(seed+k*7)*.07,bh=6+hs(seed+k*13)*3.5;if(!(gaps&&hs(seed+k*17)<gaps))fX(xx,y,Math.min(y1,y+bw),z,z+bh,BK[(seed+k*5)%BK.length]);y+=bw+.008;k++;}};
  // estantería de pared al fondo (frente visible en el plano y=dep)
  const wallShelfY=(x0,x1,dep,top,seed)=>{sBox(x0,0,x1,dep,0,top,'#7a5534');fY(x0+.05,x1-.05,dep+.001,4,top-4,'#4a321e');
    for(let z=4;z<top-6;z+=11){booksY(x0+.08,x1-.08,dep+.002,z+1,seed+z,.06);fY(x0+.05,x1-.05,dep+.003,z,z+1.2,'#8a6240');}
    for(let x=x0;x<=x1+.01;x+=1.5)fY(Math.min(x,x1-.06),Math.min(x,x1-.06)+.06,dep+.004,0,top,'#8a6240');fY(x0,x1,dep+.004,top-4,top,'#8a6240');};
  const wallShelfX=(y0,y1,dep,top,seed)=>{sBox(0,y0,dep,y1,0,top,'#73502f');fX(dep+.001,y0+.05,y1-.05,4,top-4,'#4a321e');
    for(let z=4;z<top-6;z+=11){booksX(dep+.002,y0+.08,y1-.08,z+1,seed+z,.06);fX(dep+.003,y0+.05,y1-.05,z,z+1.2,'#8a6240');}
    for(let y=y0;y<=y1+.01;y+=1.5)fX(dep+.004,Math.min(y,y1-.06),Math.min(y,y1-.06)+.06,0,top,'#8a6240');fX(dep+.004,y0,y1,top-4,top,'#8a6240');};
  // flexo: base en (x,y) sobre mesa z0; cabeza hacia dir
  const flexo=(x,y,z0,dx,dy,on)=>{cyl(x,y,.08,z0,z0+1.2,'#2b2b33');const [a,b]=P(x,y,z0+1);const [c,d]=P(x+dx*.12,y+dy*.12,z0+13);const [e,f]=P(x+dx*.32,y+dy*.32,z0+11);
    capsule(a,b,c,d,1.4,'#2b2b33');capsule(c,d,e,f,1.4,'#2b2b33');ctx.fillStyle=on?'#ffe9a8':'#3b3f46';ctx.beginPath();ctx.ellipse(e,f+1,3.4,2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b2b33';ctx.beginPath();ctx.ellipse(e,f-.5,3.6,2.4,0,Math.PI,Math.PI*2);ctx.fill();};
  const plant=(x,y,s=1)=>{sBox(x-.2*s,y-.2*s,x+.2*s,y+.2*s,0,13*s,'#d9d2c3');const [a,b]=P(x,y,13*s);for(let k=0;k<7;k++){const an=-Math.PI/2+(k-3)*.32;capsule(a,b,a+Math.cos(an)*16*s,b+Math.sin(an)*20*s,3,k%2?'#3f8a3a':'#5cae4c');}};
  const vign=()=>{if(night>.3){const [cx,cy]=P(W/2,D/2,30);const g=ctx.createRadialGradient(cx,cy,60,cx,cy,520);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(10,12,30,${.25*night})`);ctx.fillStyle=g;ctx.fillRect(cx-700,cy-600,1400,1200);}};

  drawBase=()=>{
    prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,floor);
    // parqué en espiga simplificado: tablas en hileras
    ctx.strokeStyle='rgba(80,50,25,.22)';ctx.lineWidth=1;ctx.beginPath();for(let k=.45;k<D;k+=.45){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}
    for(let r=0;r<D/.45;r++)for(let c=0;c<W;c+=1.2){const x=c+((r%2)*.6);if(x>=W)continue;ctx.moveTo(...P(x,r*.45));ctx.lineTo(...P(x,r*.45+.45));}ctx.stroke();
    for(let r=0;r<D/.45;r++)if(r%3===1)topQuad(0,r*.45,W,r*.45+.45,0,'rgba(255,255,255,.03)');
    // alfombra en la zona de lectura
    topQuad(8.2,1.2,11.6,3.2,.2,'#7a3b3b');topQuad(8.35,1.35,11.45,3.05,.3,'#8f4a46');
    // paredes
    sBox(0,-.15,W,0,0,HH,wall);sBox(-.15,-.15,0,D,0,HH,shade(wall,.95));fY(0,W,0,HH-5,HH,'#e2d8c2');fX(0,0,D,HH-5,HH,'#ddd3bc');
    fY(0,W,.001,0,6,'#7a5534');fX(.001,0,D,0,6,'#6b4a2e');
    // ventanales al fondo derecha
    for(const x0 of [7.3,9.6]){const sky=lateN?'#1c2546':wet?'#a3b4c4':'#c4e6f8';fY(x0-.1,x0+1.9,.002,14,HH-10,'#7a5534');fY(x0,x0+1.8,.003,16,HH-12,sky);
      if(!lateN){for(let k=0;k<3;k++){const tx=x0+.3+k*.6;const [a,b]=P(tx,.003,16);ctx.fillStyle=seasonOf()==='oto'?'rgba(200,120,50,.55)':seasonOf()==='inv'?'rgba(120,110,100,.4)':'rgba(70,140,70,.5)';ctx.beginPath();ctx.arc(a,b-14-hs(k*9+x0*3)*8,9,0,Math.PI*2);ctx.fill();}}
      if(wet)for(let k=0;k<8;k++){const xx=x0+.1+hs(k*5+x0*7)*1.6,zz=16+((hs(k*11)*50-tt*22)%50+50)%50;ln(P(xx,.004,zz+6),P(xx,.004,zz),'rgba(255,255,255,.65)',1);}
      fY(x0+.88,x0+.92,.004,16,HH-12,'#7a5534');fY(x0,x0+1.8,.004,44,46,'#7a5534');fY(x0-.15,x0+1.95,.15,13,15,'#e2d8c2');
      if(!lateN&&!wet){ctx.save();ctx.globalCompositeOperation='lighter';poly([P(x0,0),P(x0+1.8,0),P(x0+2.9,2.6),P(x0+1.1,2.6)],'rgba(255,240,200,.09)');ctx.restore();}}
    // estanterías de pared, altas
    wallShelfY(0,6.9,.55,70,11);wallShelfX(.55,4.3,.55,70,57);
    // rótulos de sección sobre las estanterías
    for(const [x,s] of [[1.2,'NARRATIVA'],[3.4,'HISTORIA'],[5.6,'CIENCIAS']]){fY(x-.6,x+.6,.56,72,78,'#2f5f6b');txt(false,x,.561,75,s,'#fff',4.5,900);}
    fX(.56,1.4,3.4,72,78,'#2f5f6b');txt(true,2.4,.561,75,TXN.escenas.derecho_oposiciones,'#fff',4.2,900);
  };
  decor=()=>{
    // pared izquierda: carteles de silencio y oposiciones, tablón, reloj, extintor
    fX(.02,4.6,5.5,44,58,'#fffdf8');txt(true,5.05,.03,54,'🤫','#000',9,900);txt(true,5.05,.03,47,'SILENCIO','#b8322f',4.5,900);
    fX(.02,5.8,7.6,30,58,'#b08850');fX(.03,5.86,7.54,31,57,'#c9a26a');txt(true,6.7,.04,54,'TABLÓN','#3b2a1a',4,900);
    fX(.04,5.95,6.85,38,51,exam?'#ffd166':'#fffdf8');txt(true,6.4,.05,48,'OPOSICIONES','#b8322f',3.6,900);txt(true,6.4,.05,44,exam?'2026':TXN.escenas.auxiliar_adm,exam?'#b8322f':'#3b3247',exam?5:3,900);txt(true,6.4,.05,40,exam?'3.200 plazas':'Temario aquí','#3b3247',3,800);
    fX(.04,6.95,7.45,44,52,'#e3f0ff');txt(true,7.2,.05,48,'Club de','#1f3a6b',2.8,800);txt(true,7.2,.05,45.5,'lectura','#1f3a6b',2.8,800);
    fX(.04,6.95,7.45,33,42,austere?'#ffd9d9':'#e9f4ea');txt(true,7.2,.05,39,austere?'Horario':'Horario','#3b3247',2.8,900);txt(true,7.2,.05,35.5,austere?'REDUCIDO':'ampliado',austere?'#b8322f':'#2a6b3a',2.8,900);
    fX(.04,6.0,6.8,33,37,'#fffdf8');txt(true,6.4,.05,35,'Wifi: biblio','#3b3247',2.6,700);
    {const [a,b]=P(0,8.2,66);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(a,b,6,7,-.45,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5a3f2c';ctx.lineWidth=1.2;ctx.stroke();const hr=h%12;ln([a,b],[a+Math.sin(hr/6*Math.PI)*3.3,b-Math.cos(hr/6*Math.PI)*3.3],'#2b2b33',1.4);ln([a,b],[a+Math.sin((h%1)*2*Math.PI)*5,b-Math.cos((h%1)*2*Math.PI)*5],'#2b2b33',1);}
    {const [a,b]=P(0,4.45,14);ctx.fillStyle='#d1242f';ctx.fillRect(a-2.5,b-14,5,13);ctx.fillStyle='#2b2b33';ctx.fillRect(a-1,b-16,2,2);}
    fY(7.0,7.25,.01,20,48,'#e9e6df');for(let z=24;z<46;z+=4)fY(7.03,7.22,.02,z,z+1.5,'#c3bba8');
    {const [a,b]=P(9.6,0,78);label(TXN.escenas.biblioteca_municipal,a,b,'rgba(47,95,107,.92)','#fff',5);}
  };
  after=vign;
  // ---------- mesas largas con flexos ----------
  const tables=[{x0:1.6,x1:7.0,y0:2.9,y1:3.9,s:1},{x0:1.6,x1:7.0,y0:6.0,y1:7.0,s:2}];
  let pk=0;
  tables.forEach((T,ti)=>{const n=Math.round((T.x1-T.x0)/1.1);const xs=[...Array(n)].map((_,i)=>T.x0+.55+i*1.1);const ym=(T.y0+T.y1)/2;
    // tablero partido en tramos para ordenar bien con la gente
    for(let i=0;i<n;i++){const xa=T.x0+i*(T.x1-T.x0)/n,xb=xa+(T.x1-T.x0)/n;add((xa+xb)/2+ym,0,()=>{if(i===0||i===n-1){const lx=i===0?xa+.15:xb-.15;sBox(lx-.06,T.y0+.15,lx+.06,T.y1-.15,0,15,'#5a3f2c');}
      sBox(xa,T.y0,xb,T.y1,15,17.5,'#a87b4f');fY(xa,xb,T.y1+.001,15,17.5,'#8a6240');
      const xc=(xa+xb)/2;const kb=ti*20+i*2,kf=kb+1;
      // lado del fondo y lado de delante: apuntes, libros, subrayadores, flexo
      for(const [side,yy,k] of [['b',T.y0+.3,kb],['f',T.y1-.3,kf]]){
        const [a,b]=P(xc+.05,yy,17.5);ctx.fillStyle='#fffdf8';ctx.save();ctx.translate(a,b);ctx.transform(1,.5,-1,.5,0,0);ctx.fillRect(-4,-3,8,6);ctx.fillStyle='rgba(60,60,90,.35)';for(let r=0;r<4;r++)ctx.fillRect(-3,-2+r*1.4,6-hs(k+r)*2,.4);ctx.restore();
        if(hs(k*3)<.6){sBox(xc+.25,yy-.15,xc+.45,yy+.12,17.5,19+hs(k)*3,BK[k%BK.length]);sBox(xc+.26,yy-.14,xc+.44,yy+.11,19+hs(k)*3,21+hs(k)*4,BK[(k+3)%BK.length]);}
        if(hs(k*5)<.5){const [c,d]=P(xc-.25,yy,18);ctx.fillStyle=['#fff35a','#ff8ad8','#7cf0a8'][k%3];ctx.fillRect(c-3,d-1,5,1.6);}
        if(hs(k*7)<.25){const [c,d]=P(xc-.3,yy+(side==='b'?-.05:.05),17.5);ctx.fillStyle='#2b2b33';ctx.fillRect(c-6,d-7,10,7);ctx.fillStyle='#9fd4ff';ctx.fillRect(c-5,d-6,8,5);}
        if(hs(k*11)<.3)cyl(xc+.4,yy+(side==='b'?.15:-.15),.04,17.5,23,'rgba(150,200,240,.8)','#3a6ea5');}
      // flexos en el centro, uno por lado
      flexo(xc-.15,ym-.1,17.5,0,-1,true);flexo(xc+.15,ym+.1,17.5,0,1,true);});}
    // gente
    xs.forEach((x,i)=>{for(const side of ['b','f']){const k=ti*20+i*2+(side==='b'?0:1);const y=side==='b'?T.y0-.45:T.y1+.45;
      const isAna=ti===0&&i===1&&side==='b';
      // silla de madera
      if(side==='b')add(x+y-.1,0,()=>{sBox(x-.2,y-.2,x+.2,y+.2,9,11,'#8a6240');sBox(x-.2,y-.28,x+.2,y-.2,11,25,'#7a5534');for(const [a,b] of [[-.17,-.17],[.13,-.17],[-.17,.13],[.13,.13]])sBox(x+a,y+b,x+a+.04,y+b+.04,0,9,'#5a3f2c');});
      else add(x+y+.3,0,()=>{sBox(x-.2,y+.2,x+.2,y+.28,11,25,'#7a5534');for(const [a,b] of [[-.17,.13],[.13,.13]])sBox(x+a,y+b,x+a+.04,y+b+.04,0,11,'#5a3f2c');});
      if(isAna){ana={x,y,pose:'sit',act:'book',front:true,right:false};continue;}
      if(hs(k*19+3)>busy)continue;
      const ch=k%9===4?elder(k):pp(k+pk);const a2=hs(k*23)<.3?'type':hs(k*29)<.15?'phone':'book';
      add(x+y,0,()=>sPerson(x,y,ch,{pose:'sit',act:a2,front:side==='b',right:side==='b'?(k%2===0):true,sad:exam&&hs(k*31)<.15,ph:tt+k}));}});
  });
  // halo de los flexos (por encima de las mesas, sutil)
  const glowAfter=()=>{if(night<.2&&!wet)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const T of tables){const n=Math.round((T.x1-T.x0)/1.1);for(let i=0;i<n;i++){const xc=T.x0+.55+i*1.1;isoEll(xc,T.y0+.3,17.6,.38,`rgba(255,220,140,${.1+.18*night})`);isoEll(xc,T.y1-.3,17.6,.38,`rgba(255,220,140,${.1+.18*night})`);}}ctx.restore();};
  after=()=>{glowAfter();vign();};
  // ---------- estanterías exentas (dobles) a la derecha ----------
  for(const [sx,seed] of [[9.3,201],[10.9,307]]){const y0=4.0,y1=6.4,top=56;
    add(sx+.3+(y0+y1)/2+.4,0,()=>{sBox(sx,y0,sx+.6,y1,0,top,'#7a5534');fX(sx+.601,y0+.05,y1-.05,3,top-3,'#4a321e');
      for(let z=4;z<top-6;z+=10.5){booksX(sx+.602,y0+.08,y1-.08,z+1,seed+z,.08);fX(sx+.603,y0+.05,y1-.05,z,z+1.1,'#8a6240');}
      fY(sx,sx+.6,y1+.001,0,top,'#6b4a2e');fY(sx+.08,sx+.52,y1+.002,30,40,'#fffdf8');txt(false,sx+.3,y1+.003,35,sx<10?'800-899':'900-999','#2f5f6b',3.4,900);});}
  // alguien buscando un libro entre las estanterías
  add(11.85,5.0,()=>sPerson(11.85,5.0,pp(10),{front:false,right:false,act:hs(Math.floor(tt/6))<.5?'book':null}));
  // ---------- rincón de lectura junto al ventanal ----------
  add(9,1.8,()=>sArm(8.6,1.4,'#5a7a6a'));add(9.1,1.9,()=>sPerson(9.1,1.9,elder(3),{pose:'sit',act:'book',front:true,right:true,prop:'📰'}));
  add(10.9,1.8,()=>sArm(10.5,1.4,'#5a7a6a'));if(busy>.6)add(11,1.9,()=>sPerson(11,1.9,pp(7),{pose:'sit',act:'phone',front:true,right:false}));
  add(10.1,2.6,()=>{cyl(10.1,2.6,.3,10,12,'#a87b4f');cyl(10.1,2.6,.05,0,10,'#5a3f2c');const [a,b]=P(10.1,2.6,12);emoji('📚',a,b-3,8);});
  // revistero
  add(7.8,1.0,()=>{sBox(7.4,.5,8.2,.9,0,30,'#8a6240');for(let r=0;r<3;r++){fY(7.45,8.15,.901,6+r*8,13+r*8,'#7a5534');for(let k=0;k<3;k++)fY(7.5+k*.22,7.68+k*.22,.902,7+r*8,13+r*8,BK[(r*3+k+2)%BK.length]);}});
  // ---------- mostrador de préstamo ----------
  add(10.4,7.9,()=>{sBox(8.9,7.2,11.8,7.9,0,22,'#c9a77a');fY(8.9,11.8,7.9,2,20,'#b08850');sBox(8.85,7.15,11.85,7.95,22,24,'#e9e2d0');fY(9,10.2,7.901,8,16,'#2f5f6b');txt(false,9.6,7.902,12,'PRÉSTAMO','#fff',4,900);
    fY(10.4,11.6,7.901,8,16,'#fffdf8');txt(false,11,7.902,12,'DEVOLUCIONES','#2f5f6b',3.4,900);
    sBox(9.55,7.3,9.65,7.4,24,29,'#3b3f46');sBox(9.25,7.33,9.95,7.39,28,38,'#24262c');
    sBox(10.6,7.3,11.2,7.7,24,28,BK[1]);sBox(10.65,7.32,11.15,7.68,28,31,BK[6]);const [a,b]=P(10.2,7.6,24);emoji('📘',a,b-4,7);});
  // bibliotecaria detrás (mira a la sala)
  add(10.3,6.65,()=>{sBox(9.9,6.4,10.3,6.8,9,12,'#2f343c');sBox(9.9,6.35,10.3,6.43,12,26,'#3b3f46');});
  add(10.4,6.7,()=>sPerson(10.1,6.6,elder(6),{pose:'sit',act:hs(Math.floor(tt/5))<.6?'type':'stir',front:true,right:false}));
  // usuaria devolviendo libros
  if(!lateN)add(10.8,8.5,()=>sPerson(10.8,8.45,pp(5),{front:false,right:true,prop:'📚'}));
  // carrito de libros con bibliotecario que camina
  {const [px,dir]=tri(tt*.05,1.8,7.6);const y=5.0;add(px+y+.2,0,()=>{const cx=px+(dir>0?.65:-.65);sBox(cx-.35,y-.22,cx+.35,y+.22,3,4,'#5b6270');sBox(cx-.35,y-.22,cx+.35,y+.22,14,15,'#5b6270');
      for(let k=0;k<6;k++){fY(cx-.32+k*.11,cx-.23+k*.11,y+.22,15,22+hs(k)*2,BK[k%BK.length]);fY(cx-.32+k*.11,cx-.23+k*.11,y+.22,4,10,BK[(k+4)%BK.length]);}
      for(const dx of [-.3,.3]){const [a,b]=P(cx+dx,y+.2,0);circ(a,b-1.5,1.6,'#2b2b33');}
      sPerson(px,y,pp(9,{shirt:'#2f5f6b'}),{pose:'walk',ph:tt*5,front:dir>0,right:dir>0});});}
  // paragüero en la entrada con lluvia; papelera y planta
  if(wet)add(11.6,8.6,()=>{cyl(11.6,8.6,.2,0,16,'#3b3f46','#2b2b33');for(let k=0;k<3;k++){const [a,b]=P(11.55+k*.05,8.6,16);capsule(a,b,a-3+k*3,b-14,2,['#d1242f','#1f3a6b','#2a6b3a'][k]);}});
  add(.7,8.4,()=>plant(.7,8.4,1.1));add(7.5,8.5,()=>{cyl(7.5,8.5,.15,0,11,'#5b6270','#2b2b33');});
  return {W,D,floor,wall,out,tile,decor,items:it,ana,drawBase,after};
};
// Escena: comedor
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Comedor social y banco de alimentos del barrio. act 'voluntariado' (Ana sirve) o 'comedor' (Ana come aquí).
SCENES['comedor']=function(E){
  const {tt,night,act,w,npc,cp,h}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const H=i=>Math.abs(hash(i));
  const crisis=w.crisis||0,day=S.day||1,dim=night>.5;
  const rain=S.weather&&S.weather.k==='lluvia',snow=S.weather&&S.weather.k==='nieve';
  const WY=(x0,x1,z0,z1,c)=>poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],c);
  const WX=(y0,y1,z0,z1,c)=>poly([P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)],c);
  const txt=(s,x,y,z,col,size,onX,weight)=>{const [a,b]=P(x,y,z);ctx.save();ctx.fillStyle=col;ctx.font=`${weight||900} ${size}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.fillText(s,0,0);ctx.restore();};
  const glow=(x,y,z,R,col,a)=>{const [lx,ly]=P(x,y,z);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(lx,ly,0,lx,ly,R);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(lx-R,ly-R,2*R,2*R);ctx.restore();};
  const C=(k,o)=>({...npc[((k%12)+12)%12],...o});
  const kid=(x,y,ch,o)=>{const [a,b]=P(x,y);ctx.save();ctx.translate(a,b);ctx.scale(.7,.7);ctx.translate(-a,-b);sPerson(x,y,ch,o);ctx.restore();};
  // delantal sobre una persona de frente
  const apron=(x,y,col,sit)=>{const [a,b0]=P(x,y);const b=b0+(sit?-4:0);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a-3,b-33);ctx.lineTo(a+4,b-33);ctx.lineTo(a+5,b-24);ctx.lineTo(a+6.5,b-11);ctx.lineTo(a-5.5,b-11);ctx.lineTo(a-4,b-24);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(a-3,b-20,6,4);};
  const volunteer=(x,y,ch,o,col='#2f8a5a')=>add(x,y,()=>{sPerson(x,y,ch,o);if(o.front!==false)apron(x,y,col,o.pose==='sit');});
  const W=11,D=8;
  const busyT=(h>=12.5&&h<=15.75)?1:(h>=19.5&&h<=21.5)?.75:.35;
  const full=Math.max(.12,1-crisis/105);
  const menus=[[TXN.escenas.lentejas_con_verdura,TXN.escenas.pollo_con_patatas,'Naranja'],['Macarrones',TXN.escenas.merluza_con_ensalada,'Yogur'],['Cocido',TXN.escenas.tortilla_de_patatas,'Manzana'],[TXN.escenas.crema_de_calabacin,TXN.escenas.albondigas_con_arroz,'Plátano'],['Garbanzos',TXN.escenas.filete_de_pavo,'Natillas'],[TXN.escenas.arroz_a_la_cubana,TXN.escenas.huevos_con_pisto,'Pera'],[TXN.escenas.sopa_de_cocido,TXN.escenas.paella_de_verduras,'Flan']];
  const menu=menus[day%7];
  // ---------- base: suelo de terrazo, alicatado y pintura ----------
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,'#6d5c4a');
    for(let i=0;i<W;i++)for(let j=0;j<D;j++)topQuad(i,j,i+1,j+1,0,(i+j)%2?'#d9d6cc':'#cfccc1');
    for(let k=0;k<200;k++){const [a,b]=P(H(k*3+1)*W,H(k*7+2)*D,0);ctx.fillStyle=['#a9a395','#efe9da','#9c968a'][k%3];ctx.fillRect(a,b,1.4,.9);}
    sBox(0,-.15,W,0,0,76,'#f1ead2');sBox(-.15,-.15,0,D,0,76,'#e6dfc6');
    // alicatado blanco hasta media altura con cenefa azul
    WY(0,W,0,32,'#f6f6f2');WX(0,D,0,32,'#ecece6');
    ctx.strokeStyle='rgba(120,130,140,.18)';ctx.lineWidth=.6;ctx.beginPath();
    for(let z=5;z<32;z+=5){ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(W,0,z));ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(0,D,z));}
    for(let u=.33;u<W;u+=.33){ctx.moveTo(...P(u,0,0));ctx.lineTo(...P(u,0,32));}for(let u=.33;u<D;u+=.33){ctx.moveTo(...P(0,u,0));ctx.lineTo(...P(0,u,32));}ctx.stroke();
    WY(0,W,30,33,'#3c6fa8');WX(0,D,30,33,'#36649a');WY(0,W,0,3,'#9aa0a8');WX(0,D,0,3,'#8a9098');
  };
  const decor=()=>{
    // ventanas (derecha del fondo)
    for(const x0 of [7.9,9.4]){WY(x0-.08,x0+1.28,34,68,'#f4f1ea');const sky=dim?'#232c4c':rain?'#9fb0bd':snow?'#dfe8ee':'#bfe3f7';WY(x0,x0+1.2,36,66,sky);
      if(!dim){ctx.save();ctx.globalAlpha=.4;poly([P(x0+.15,0,62),P(x0+.45,0,62),P(x0+.2,0,40),P(x0,0,40)],'#fff');ctx.restore();
        // gente y coches pasando por la acera
        const ph=(tt*.25+x0*.3)%1;const [a,b]=P(x0+ph*1.2,0,40);circ(a,b-4,1.8,'rgba(70,60,60,.55)');ctx.fillStyle='rgba(70,60,60,.45)';ctx.fillRect(a-1.6,b-2.5,3.2,6);}
      else{const [a,b]=P(x0+.6,0,58);circ(a,b,2,'rgba(255,220,140,.8)');}
      if(rain)for(let k=0;k<6;k++){const u=x0+.08+H(k*5+Math.round(x0*10))*1.05,z=64-((tt*30+k*11)%26);ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(...P(u,0,z));ctx.lineTo(...P(u,0,z-4));ctx.stroke();}
      if(snow)WY(x0,x0+1.2,36,39,'#ffffff');
      ctx.strokeStyle='#d8d4ca';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(...P(x0+.6,0,36));ctx.lineTo(...P(x0+.6,0,66));ctx.stroke();}
    // ventanilla de la cocina con la cocinera
    WY(1.9,5.1,36,60,'#9aa0a8');WY(2.0,5.0,37,59,'#3f4448');WY(2.0,5.0,37,40,'#c0c4c8');
    {const cx=2.6+((Math.sin(tt*.35)+1)/2)*1.6;const [a,b]=P(cx,0,40);ctx.save();ctx.beginPath();const q=[P(2,0,37),P(5,0,37),P(5,0,59),P(2,0,59)];ctx.moveTo(...q[0]);for(const p of q)ctx.lineTo(...p);ctx.closePath();ctx.clip();
      // ollas y campana
      WY(2.2,4.8,52,59,'#7a7f88');for(const u of [2.5,3.4,4.3]){const [c,d]=P(u,0,44);ctx.fillStyle='#b8bcc2';ctx.fillRect(c-5,d-1,10,6);}
      circ(a,b-12,3.4,'#e0b090');ctx.fillStyle='#fffdf8';ctx.fillRect(a-4.5,b-9,9,10);ctx.fillRect(a-3.6,b-17.5,7.2,2.6);
      for(let s=0;s<4;s++){const [c,d]=P(3.4,0,50+((tt*10+s*4)%12));circ(c+Math.sin(tt*2+s)*2,d,2.2,'rgba(255,255,255,.35)');}
      ctx.restore();}
    txt('COCINA',3.5,0,62.5,'#3c6fa8',4.2);
    // pizarra con el menú
    WY(5.5,7.5,36,66,'#8a6a40');WY(5.6,7.4,37.5,64.5,'#2e4a3a');
    txt('MENÚ DE HOY',6.5,0,60,'#fffdf8',4.4);txt('1º '+menu[0],6.5,0,53,'#f7f3d0',3.3,false,800);txt('2º '+menu[1],6.5,0,47.5,'#f7f3d0',3.3,false,800);txt('Postre: '+menu[2],6.5,0,42,'#f7f3d0',3.3,false,800);
    if(crisis>55)txt(TXN.escenas.t2_turno_14_30,6.5,0,39,'#ffb0a0',3,false,800);
    // reloj y carteles
    {const [a,b]=P(1.1,0,64);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);circ(0,0,5,'#fffdf8');ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.stroke();const hr=(h%12)/12*Math.PI*2,mn=(h%1)*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(hr)*2.8,-Math.cos(hr)*2.8);ctx.moveTo(0,0);ctx.lineTo(Math.sin(mn)*4,-Math.cos(mn)*4);ctx.stroke();ctx.restore();}
    WY(.3,1.7,40,56,'#fffdf8');txt(TXN.escenas.comedor_social,1.0,0,52.5,'#2f8a5a',3.4);txt(TXN.escenas.lunes_a_domingo,1.0,0,48,'#333',3,false,800);txt('13:00 - 15:30',1.0,0,44,'#333',3,false,800);
    // dibujos de niños
    for(let k=0;k<3;k++){const u=9.0+k*.55;WY(u,u+.45,70-k%2*2,75-k%2*2,['#fff2a8','#cde8f7','#f7c6d9'][k]);const [a,b]=P(u+.22,0,72-k%2*2);emoji(['🌞','🏠','🌈'][k],a,b,5);}
    // pared izquierda: tablón, estanterías del banco de alimentos, puerta
    WX(.6,2.4,40,64,'#8a6a40');WX(.68,2.32,41.5,62.5,'#c79a5e');
    [[TXN.escenas.banco_de_alimentos,'#fffdf8'],[TXN.escenas.se_buscan_voluntarios,'#f7d774'],[TXN.escenas.asesoria_vivienda,'#cde8f7'],[TXN.escenas.clases_de_espanol,'#f7c6c6']].forEach(([s,c],k)=>{const y=.75+(k%2)*.8,z=k<2?52:43;WX(y,y+.72,z,z+9,c);txt(s,0,y+.36,z+4.5,'#3b3247',2.6,true,800);});
    if(crisis>50){WX(.7,2.3,66,73,'#c8102e');txt('HOY: '+(90+Math.round(crisis*2.6))+' MENÚS',0,1.5,69.5,'#fff',3.6,true);}
    // puerta de entrada
    WX(6.1,7.6,0,56,'#6a7680');WX(6.2,7.5,0,54,dim?'#2a3350':rain?'#9fb0bd':'#cfe6f2');ctx.strokeStyle='#4a5560';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(...P(0,6.85,0));ctx.lineTo(...P(0,6.85,54));ctx.stroke();
    txt('ENTRADA',0,6.85,60,'#3c6fa8',3.6,true);
    // extintor
    {const [a,b]=P(0,5.85,0);ctx.fillStyle='#c8102e';ctx.fillRect(a-1.6,b-22,3.6,10);ctx.fillStyle='#222';ctx.fillRect(a-1,b-24,2,2);}
    // zona de recogida de lotes en el suelo (cinta)
    ctx.save();ctx.globalAlpha=.6;topQuad(.25,6.0,.32,7.7,.2,'#f2c230');ctx.restore();
  };
  // ---------- estanterías con cajas de alimentos (pared izquierda) ----------
  add(.6,3.6,()=>{const y0=2.7,y1=5.6;sBox(.05,y0,.75,y1,0,2,'#7a7f88');
    for(const z of [14,28,42,56]){sBox(.05,y0,.75,y1,z,z+1.5,'#9aa0a8');for(let j=0;j<6;j++)if(H(z*7+j*13+3)<full+.05){const v=y0+.08+j*.48;sBox(.12,v,.68,v+.4,z+1.5,z+(H(j+z)<.5?11:9),H(j*3+z)<.5?'#c8a46a':'#d6b47a');}}
    for(const v of [y0,y1-.05])sBox(.05,v,.75,v+.05,0,60,'#6a6f78');
    const lb=['LEGUMBRES','LECHE','ACEITE','CONSERVAS'];lb.forEach((s,k)=>txt(s,.76,3.0+k*.72,10+k*14,'#3b3247',2.4,true,800));});
  // palé con cajas
  add(1.3,5.9,()=>{sBox(.85,5.65,1.75,6.0,0,3,'#b08850');if(full>.3){sBox(.9,5.68,1.3,5.98,3,10,'#c8a46a');sBox(1.32,5.68,1.72,5.98,3,10,'#d6b47a');}});
  // ---------- mostrador de autoservicio ----------
  const cx0=1.6,cx1=7.0,cy0=.75,cy1=1.45;
  add(4.4,1.2,()=>{sBox(cx0,cy0,cx1,cy1,0,17,'#b8bcc2');sBox(cx0-.02,cy0-.02,cx1+.02,cy1+.02,17,18.5,'#d8dce0');
    // riel de bandejas
    sBox(cx0,cy1,cx1,cy1+.18,13,14.5,'#9aa0a8');
    // cubetas con comida y vapor
    const foods=['#c4733a','#e8c35a','#7a9a3a','#d9a070'];foods.forEach((c,k)=>{const x=2.6+k*.95;sBox(x,cy0+.12,x+.8,cy1-.12,18.5,19.5,'#7a7f88');topQuad(x+.05,cy0+.17,x+.75,cy1-.17,19.6,crisis>80&&k===3?'#9aa0a8':c);
      for(let s=0;s<3;s++){const [a,b]=P(x+.4,(cy0+cy1)/2,24+((tt*9+s*6+k*3)%18));ctx.fillStyle=`rgba(255,255,255,${.35-((tt*9+s*6+k*3)%18)/60})`;ctx.beginPath();ctx.arc(a+Math.sin(tt*1.5+s+k)*2,b,2.4,0,Math.PI*2);ctx.fill();}});
    // mampara antivaho
    ctx.save();ctx.globalAlpha=.28;poly([P(2.5,cy1-.05,19),P(6.4,cy1-.05,19),P(6.4,cy1-.05,34),P(2.5,cy1-.05,34)],'#cfe8f5');ctx.restore();
    // pan y fruta
    const [a,b]=P(6.65,1.1,24);emoji('🥖',a,b,9);const [c,d]=P(1.95,1.1,24);
    for(let k=0;k<5;k++)sBox(1.75,.9,2.25,1.3,18.5+k*1.2,19.5+k*1.2,['#e85d3f','#3c7be0','#f2c230','#5bbf6a','#e85d3f'][k]);
  });
  // jarras de agua del mostrador
  // ---------- mesas largas ----------
  const tables=[3.25,5.55],tx0=2.6,tx1=9.6;
  const seats=[];
  const busy=Math.min(1,(.3+crisis/130)*busyT+(busyT>.9?.25:0));
  const anaSeat=act==='comedor'?[7.97,tables[1]-.42]:null;
  tables.forEach((ty,ti)=>{for(let x=tx0+.45;x<tx1-.3;x+=.82){for(const side of [0,1]){const y=side?ty+.98:ty-.42;
    const k=Math.round(x*10)+ti*100+side*50;const isAna=anaSeat&&Math.abs(x-anaSeat[0])<.42&&side===0&&ti===1;
    const near=anaSeat&&!isAna&&Math.abs(x-anaSeat[0])<1&&((ti===1&&side===0&&x<anaSeat[0])||(ti===0&&side===1));
    seats.push({x,y,side,ti,k,occ:isAna||(!near&&H(k*7+day)<busy),isAna});}}});
  // segmentos de mesa con bandejas
  tables.forEach((ty,ti)=>{for(let x=tx0;x<tx1-.01;x+=.5){const x1=Math.min(tx1,x+.5);
    add(x+.25,ty+.7,()=>{sBox(x,ty,x1,ty+.56,15,17,'#e9e4d6');sBox(x,ty+.54,x1,ty+.56,13,15,'#c9c3b8');if(x===tx0||x1>=tx1-.01)sBox(x===tx0?x+.05:x1-.1,ty+.1,x===tx0?x+.1:x1-.05,ty+.46,0,15,'#7a7f88');
      for(const s of seats)if(s.ti===ti&&s.occ&&s.x>=x&&s.x<x1){const ty2=s.side?ty+.33:ty+.04;sBox(s.x-.18,ty2,s.x+.18,ty2+.2,17,17.6,['#f2c230','#3c7be0','#e85d3f','#5bbf6a'][s.k%4]);
        const [a,b]=P(s.x,ty2+.1,17.6);ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.ellipse(a,b,4,2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=['#c4733a','#e8c35a','#d9a070'][s.k%3];ctx.beginPath();ctx.ellipse(a,b,2.6,1.2,0,0,Math.PI*2);ctx.fill();
        cyl(s.x+.12,ty2+.05,.04,17.6,21,'rgba(220,235,245,.9)');}
      // jarra de agua y cesta de pan
      if(Math.round(x*2)%4===1){cyl(x+.25,ty+.28,.07,17,25,'rgba(200,225,240,.9)','#e6f2fa');}
    });}});
  // sillas y comensales
  const diners=[];
  seats.forEach(s=>{const {x,y,side,k}=s;
    if(side===0){add(x-.05,y-.1,()=>{sBox(x-.2,y-.22,x+.2,y+.18,9,10.5,'#2f8a5a');sBox(x-.2,y-.26,x+.2,y-.2,10.5,22,'#2f8a5a');});}
    else{add(x-.05,y-.05,()=>{sBox(x-.2,y-.2,x+.2,y+.2,9,10.5,'#2f8a5a');});add(x+.05,y+.38,()=>{sBox(x-.2,y+.18,x+.2,y+.24,10.5,22,'#2f8a5a');for(const u of [-.18,.15])sBox(x+u,y+.18,x+u+.04,y+.22,0,9,'#255a40');});}
    if(!s.occ||s.isAna)return;
    const r=H(k*13+5);const old=r<.3,child=!old&&H(k*17)<.12;
    const ch=old?{...elder(k),hair:['#d6d6d6','#9a8a7a','#bdbdbd'][k%3]}:C(k,{});
    const a=H(k*11+Math.floor(tt/5))<.35?'talk':H(k*3+1)<.7?'eat':null;
    const o={pose:'sit',front:side===0,right:side!==0,act:a,mood:40+Math.round(H(k*19)*30)};
    add(x,y,()=>child?kid(x,y-.05,C(k+3,{beard:'no'}),o):sPerson(x,y,ch,o));});
  // ---------- cola (crece con la crisis) ----------
  const qn=Math.round((2+crisis/9)*(busyT>.9?1:busyT>.5?.7:.45));
  for(let k=0;k<qn;k++){let x=1.15,y=2.0+k*.6;if(y>7.4){x=1.15+(y-7.4)/.6*.75;y=7.45;}
    const ch=H(k*5+2)<.3?{...elder(k+4)}:C(k+5,{});const kd=H(k*23+1)<.12;
    const o={front:false,right:true,mood:H(k*7)<.5?40:55,act:H(k*31+Math.floor(tt/7))<.2?'talk':H(k*9)<.15?'phone':null};
    add(x,y,()=>{if(kd)kid(x,y,C(k+8,{beard:'no'}),o);else sPerson(x,y,ch,o);
      if(H(k*41)<.35){const [a,b]=P(x+.2,y+.2,0);ctx.fillStyle=['#7a6a5a','#3b4a5a','#6a3a3a'][k%3];ctx.fillRect(a-2,b-16,6,9);}});}
  if(qn>0){const ph=(tt%14)/14;if(ph<.6){const f=ph/.6,y=7.1-f*Math.max(0,7.1-(2.0+qn*.6));const x=.9+f*.25;add(x,y,()=>sPerson(x,y,C(day+qn,{}),{pose:'walk',ph:tt*6,front:false,right:true,mood:50}));}}
  // ---------- voluntariado ----------
  const vA=C(3,{...elder(3),style:'mono'}),vB=C(9,{}),vC=C(6,{});
  const serving=act==='voluntariado';
  volunteer(5.3,.45,vA,{act:'stir',front:true,right:false,mood:70});
  if(!serving)volunteer(3.5,.45,vB,{act:'stir',front:true,right:false,mood:65});
  // voluntario con jarra paseando entre las mesas
  {const T=18,ph=(tt%T)/T,go=ph<.5,f=go?ph/.5:1-(ph-.5)/.5,x=2.4+f*7.0,y=4.4;add(x,y+.01,()=>{sPerson(x,y,vC,{pose:'walk',ph:tt*6,front:true,right:go});if(!go)apron(x,y,'#2f8a5a');const [a,b]=P(x,y,0);emoji('🫗',a+(go?7:-7),b-26,8);});}
  // voluntaria que recoge bandejas (se agacha a la mesa del fondo)
  volunteer(9.9,4.4,C(10,{}),{act:'talk',front:true,right:false,mood:70});
  // carrito de bandejas sucias
  add(10.3,2.6,()=>{sBox(9.9,2.2,10.6,2.9,2,4,'#9aa0a8');for(let k=0;k<4;k++)sBox(9.95,2.25,10.55,2.85,8+k*7,9+k*7,'#c0c4c8');for(let k=0;k<4;k++)sBox(9.95,2.25,10.55,2.85,9+k*7,11+k*7,['#f2c230','#3c7be0','#e85d3f','#5bbf6a'][k]);for(const u of [9.9,10.55])sBox(u,2.2,u+.05,2.25,0,34,'#7a7f88');});
  // ---------- Ana ----------
  let ana;
  if(serving){ana={x:3.5,y:.45,pose:'stand',act:Math.floor(tt/3.5)%3===2?'talk':'stir',front:true,right:false};
    // el delantal de Ana: se pinta encima con un item justo detrás de ella
    add(3.5,.46,()=>apron(3.5,.45,'#2f8a5a'));}
  else ana={x:anaSeat[0],y:anaSeat[1],pose:'sit',act:Math.floor(tt/6)%4===3?null:'eat',front:true,right:false};
  // fluorescentes y luz
  const after=()=>{if(dim){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.07;poly([P(0,D,0),P(0,D,76),P(0,0,76),P(W,0,76),P(W,0,0),P(W,D,0)],'#fff0d0');ctx.restore();}
    for(const [x,y] of [[3.3,2.6],[7.3,2.6],[3.3,5.6],[7.3,5.6]]){const [a,b]=P(x-.6,y,94),[c,d]=P(x+.6,y,94);ctx.strokeStyle='rgba(60,60,60,.5)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a,b-14);ctx.moveTo(c,d);ctx.lineTo(c,d-14);ctx.stroke();capsule(a,b,c,d,3.4,'#c9ccd0');capsule(a,b+1,c,d+1,2,dim?'#fbfff4':'#eef2f0');if(dim)glow(x,y,92,56,'255,250,225',.16);}
    if(!dim){ctx.save();ctx.globalAlpha=.07;for(const x0 of [7.9,9.4])poly([P(x0,0,66),P(x0+1.2,0,66),P(x0+2.2,3.4,0),P(x0+1,3.4,0)],'#fff6d8');ctx.restore();}};
  return {W,D,floor:'#d9d6cc',wall:'#f1ead2',out:false,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: comisaria
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Comisaría de distrito: mostrador con agente de guardia, sala de espera, mesa de atestados y calabozo con barrotes (Ana detenida).
SCENES['comisaria']=function(E){
  const {tt,night,act,w,npc,cp,h}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const H=i=>Math.abs(hash(i));
  const crisis=w.crisis||0,mov=w.mov||0,day=S.day||1,dim=night>.5;
  const rain=S.weather&&S.weather.k==='lluvia',snow=S.weather&&S.weather.k==='nieve';
  const repres=w.era==='represion';
  const WY=(x0,x1,z0,z1,c)=>poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],c);
  const WX=(y0,y1,z0,z1,c)=>poly([P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)],c);
  const txt=(s,x,y,z,col,size,onX,weight)=>{const [a,b]=P(x,y,z);ctx.save();ctx.fillStyle=col;ctx.font=`${weight||900} ${size}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.fillText(s,0,0);ctx.restore();};
  const glow=(x,y,z,R,col,a)=>{const [lx,ly]=P(x,y,z);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(lx,ly,0,lx,ly,R);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(lx-R,ly-R,2*R,2*R);ctx.restore();};
  const C=(k,o)=>({...npc[((k%12)+12)%12],...o});
  const pers=(x,y,ch,o)=>add(x,y,()=>sPerson(x,y,ch,o));
  const W=10,D=8;
  const CX0=5.6,CY1=1.75; // calabozo: x de CX0 a W, y de 0 a CY1
  const cop=(k,o)=>C(k,{pants:'#1a2238',...o});const COPSH='#22325e';
  // insignia en el pecho de los agentes
  const badge=(x,y,sit)=>{const [a,b]=P(x,y);circ(a+2.5,b-(sit?33:29),1.3,'#e2b955');};
  const flick=k=>{const t=tt*1.0+k*7.3;return k===2&&(Math.sin(t*3.1)>.93||Math.sin(t*17)>.97)?.25:1;};
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,'#6d5c4a');
    for(let i=0;i<W;i++)for(let j=0;j<D;j++)topQuad(i,j,i+1,j+1,0,(i+j)%2?'#c9ccd0':'#bec2c7');
    // suelo de cemento del calabozo
    topQuad(CX0,0,W,CY1,.1,'#9da2a6');for(let k=0;k<40;k++){const [a,b]=P(CX0+H(k*3+1)*(W-CX0),H(k*7+2)*CY1,.1);ctx.fillStyle='rgba(60,60,60,.18)';ctx.fillRect(a,b,2,1);}
    sBox(0,-.15,W,0,0,74,'#e9ebe6');sBox(-.15,-.15,0,D,0,74,'#dfe1dc');
    WY(0,CX0,0,30,'#8fa3b5');WX(0,D,0,30,'#8499aa');WY(0,CX0,29,31,'#6d8296');WX(0,D,29,31,'#677b8e');
    // pared del calabozo: cemento desconchado
    WY(CX0,W,0,74,'#b7b9b4');for(let k=0;k<26;k++){const u=CX0+H(k*5+3)*(W-CX0-.3),z=H(k*11+7)*64+4;WY(u,u+.18+H(k)*.3,z,z+3+H(k+1)*4,'rgba(90,90,85,.13)');}
    WY(CX0,W,0,4,'#8a8c88');
  };
  const decor=()=>{
    // rótulo azul de la comisaría
    WY(.3,5.3,62,72,'#1f3f7a');txt(TXN.escenas.policia_atencion_al_ciudadano,2.8,0,67,'#ffffff',4.6);
    // ventana alta con reja
    WY(2.35,3.65,36,58,'#d8dadc');WY(2.45,3.55,37.5,56.5,dim?'#1f2744':rain?'#9fb0bd':snow?'#e4ecf2':'#bfe3f7');
    if(rain&&!dim)for(let k=0;k<4;k++){const u=2.5+H(k*7)*1,z=55-((tt*28+k*9)%18);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(...P(u,0,z));ctx.lineTo(...P(u,0,z-4));ctx.stroke();}
    ctx.strokeStyle='#4a4f56';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<6;k++){const u=2.45+k*.183;ctx.moveTo(...P(u,0,37.5));ctx.lineTo(...P(u,0,56.5));}ctx.stroke();
    // carteles
    WY(.35,1.25,38,54,'#fffdf8');txt('SE BUSCA',.8,0,51,'#c8102e',3.4);{const [a,b]=P(.8,0,44.5);circ(a,b,3,'#9aa0a8');}
    WY(1.4,2.2,38,54,'#7a3a8a');txt('016',1.8,0,49,'#ffffff',6);txt(TXN.escenas.no_estas_sola,1.8,0,43,'#ffffff',2.6,false,800);
    WY(3.9,4.9,40,54,'#fffdf8');txt('DNI',4.4,0,50.5,'#1f3f7a',4.2);txt('Cita previa',4.4,0,45.5,'#333',2.8,false,800);
    if(repres){WY(4.0,5.3,32,39,'#f2c230');txt(TXN.escenas.ley_de_seguridad_ciudadana,4.65,0,35.5,'#222',2.2,false,800);}
    // reloj
    {const [a,b]=P(5.0,0,58);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);circ(0,0,4.6,'#fffdf8');ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,4.6,0,Math.PI*2);ctx.stroke();const hr=(h%12)/12*Math.PI*2,mn=(h%1)*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(hr)*2.6,-Math.cos(hr)*2.6);ctx.moveTo(0,0);ctx.lineTo(Math.sin(mn)*3.7,-Math.cos(mn)*3.7);ctx.stroke();ctx.restore();}
    // pared del calabozo: marcas rayadas y bombilla con rejilla
    ctx.strokeStyle='rgba(60,60,60,.45)';ctx.lineWidth=.7;ctx.beginPath();for(let k=0;k<7;k++){const u=9.1+k*.07;ctx.moveTo(...P(u,0,30));ctx.lineTo(...P(u,0,24));}ctx.moveTo(...P(9.08,0,25));ctx.lineTo(...P(9.6,0,29));ctx.stroke();
    txt(TXN.escenas.lola_estuvo_aqui,6.7,0,40,'rgba(60,60,60,.45)',3,false,700);
    {const [a,b]=P(7.8,0,64);circ(a,b,3.2,dim?'#fff8d0':'#f0f2e6');ctx.strokeStyle='#3b3f46';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(a,b,4,0,Math.PI*2);ctx.moveTo(a-4,b);ctx.lineTo(a+4,b);ctx.moveTo(a,b-4);ctx.lineTo(a,b+4);ctx.stroke();}
    // pared izquierda: tablón, extintor, puerta de entrada
    WX(3.9,5.9,36,58,'#8a6a40');WX(3.98,5.82,37.5,56.5,'#c79a5e');
    [[TXN.escenas.objetos_perdidos,'#fffdf8'],[TXN.escenas.denuncias_24h,'#cde8f7'],[TXN.escenas.prohibido_fumar,'#f7c6c6'],[TXN.escenas.turno_de_oficio,'#f7d774']].forEach(([s,c],k)=>{const y=4.08+(k%2)*.88,z=k<2?47:39;WX(y,y+.8,z,z+8,c);txt(s,0,y+.4,z+4,'#3b3247',2.5,true,800);});
    {const [a,b]=P(0,3.5,0);ctx.fillStyle='#c8102e';ctx.fillRect(a-1.6,b-24,3.6,11);ctx.fillStyle='#222';ctx.fillRect(a-1,b-26,2,2);}
    WX(6.4,7.7,0,56,'#5a6470');WX(6.5,7.6,0,54,dim?'#2a3350':rain?'#9fb0bd':'#cfe6f2');txt('SALIDA',0,7.05,60,'#2f8a5a',3.4,true);
    // franja del calabozo en el suelo
    ctx.save();ctx.globalAlpha=.55;for(let x=CX0-.2;x<W;x+=.5)topQuad(x,CY1+.2,x+.25,CY1+.35,.2,'#f2c230');ctx.restore();
  };
  // ---------- zona de atención: mostrador con mampara ----------
  const mx0=.9,mx1=4.6,my0=2.6,my1=3.15;
  // mesa y agente de guardia (detrás del mostrador)
  add(2.4,2.0,()=>{sBox(1.6,1.5,3.2,2.2,13,15,'#d9d2c3');sBox(1.65,1.55,1.7,2.15,0,13,'#3b3f46');sBox(3.1,1.55,3.15,2.15,0,13,'#3b3f46');sBox(2.0,1.6,2.6,1.75,15,26,'#2b2b33');poly([P(2.04,1.75,17),P(2.56,1.75,17),P(2.56,1.75,25),P(2.04,1.75,25)],`rgba(124,200,240,${.8+Math.sin(tt*9)*.05})`);sBox(2.7,1.7,3.05,1.95,15,16,'#fffdf8');});
  add(2.3,1.3,()=>sChair(1.8,.8,'#2b2b33'));
  add(2.3,1.36,()=>{sPerson(2.3,1.35,cop(1,{style:'corto'}),{pose:'sit',act:Math.floor(tt/6)%3===2?'phone':'type',front:true,right:false,shirt:COPSH,mood:50});badge(2.3,1.35,true);});
  // archivadores, impresora y cafetera al fondo
  add(.9,.4,()=>{for(let k=0;k<2;k++)sBox(.2+k*.55,.1,.7+k*.55,.65,0,34,'#8a9098');for(let k=0;k<2;k++)for(let j=0;j<3;j++){sBox(.25+k*.55,.62,.65+k*.55,.65,4+j*10,12+j*10,'#9aa0a8');}});
  add(4.4,.5,()=>{sBox(3.8,.1,5.0,.75,0,15,'#c9c3b8');sBox(3.9,.2,4.3,.6,15,25,'#2b2b33');const [a,b]=P(4.1,.6,20);circ(a,b,1,'#e85d3f');cyl(4.6,.4,.07,15,18,'#fffdf8');
    for(let s=0;s<2;s++){const [c,d]=P(4.6,.4,20+((tt*7+s*5)%10));circ(c,d,1.3,'rgba(255,255,255,.4)');}});
  // segundo agente con café junto a la cafetera
  {const ag=cop(7,{style:'rapado',g:'m'});pers(4.2,1.25,ag,{act:Math.floor(tt/4)%2?'eat':'talk',front:true,right:false,shirt:COPSH});add(4.2,1.26,()=>badge(4.2,1.25,false));}
  // mostrador
  for(let x=mx0;x<mx1-.01;x+=.5){const x1=Math.min(mx1,x+.5);add(x+.25,my1,()=>{sBox(x,my0,x1,my1,0,22,'#5a6878');sBox(x-.02,my0-.04,x1+.02,my1+.04,22,24,'#d9d6cc');
    ctx.save();ctx.globalAlpha=.32;poly([P(x,my0+.25,24),P(x1,my0+.25,24),P(x1,my0+.25,46),P(x,my0+.25,46)],'#cfe8f5');ctx.restore();sBox(x,my0+.22,x1,my0+.28,46,47.5,'#9aa0a8');});}
  add(mx1,my1+.3,()=>{poly([P(2.0,my1+.045,11),P(3.5,my1+.045,11),P(3.5,my1+.045,18),P(2.0,my1+.045,18)],'#1f3f7a');txt('INFORMACIÓN',2.75,my1+.05,14.5,'#ffffff',4);});
  add(mx0,my0,()=>sBox(mx0-.05,my0+.22,mx0,my0+.28,24,47.5,'#9aa0a8'));
  // gente en el mostrador (de día, abogada de oficio y alguien poniendo una denuncia)
  if(!dim||H(day*3)<.5)pers(1.7,3.55,C(4,{}),{act:'talk',front:false,right:true,mood:40});
  if(!dim){pers(3.7,3.6,C(8,{style:'melena'}),{act:Math.floor(tt/5)%2?'talk':'book',front:false,right:true,shirt:'#2b2b33',mood:55});
    add(3.95,3.85,()=>{const [a,b]=P(3.95,3.85,0);ctx.fillStyle='#4a3020';ctx.fillRect(a-4,b-12,9,7);ctx.fillRect(a-1,b-14,3,2);});}
  // ---------- sala de espera: sillas de plástico ensambladas ----------
  add(.55,5.9,()=>{sBox(.25,4.3,.85,7.6,0,2,'#3b3f46');for(const v of [4.4,7.4])sBox(.45,v,.6,v+.12,0,10,'#3b3f46');
    for(let k=0;k<5;k++){const v=4.4+k*.64;sBox(.25,v,.85,v+.56,10,12,'#e07a2f');sBox(.18,v,.28,v+.56,12,24,'#d06a20');}});
  const waiting=[[.62,4.72,C(2,{}),'phone',38],[.62,6.0,{...elder(5)},null,45],[.62,7.28,C(10,{}),'book',50]];
  const nw=dim?1:Math.min(3,1+Math.round(crisis/35));
  waiting.slice(0,nw).forEach(([x,y,ch,a,m])=>add(x,y,()=>sPerson(x,y,ch,{pose:'sit',front:true,right:true,act:a,mood:m})));
  // mesa de denuncias: una vecina declara ante un agente
  add(3.0,6.2,()=>{sBox(2.2,5.5,3.8,6.2,15,17,'#d9d2c3');for(const [u,v] of [[2.25,5.55],[3.7,5.55],[2.25,6.1],[3.7,6.1]])sBox(u,v,u+.06,v+.06,0,15,'#3b3f46');sBox(2.4,5.6,2.95,5.75,17,27,'#2b2b33');poly([P(2.44,5.75,19),P(2.91,5.75,19),P(2.91,5.75,26),P(2.44,5.75,26)],'#7cc8f0');sBox(3.1,5.7,3.5,5.95,17,17.6,'#fffdf8');});
  add(2.9,5.2,()=>sChair(2.4,4.75,'#2b2b33'));
  add(2.9,5.3,()=>{sPerson(2.9,5.3,cop(9,{g:'m',style:'corto'}),{pose:'sit',act:'type',front:true,right:false,shirt:COPSH,mood:50});badge(2.9,5.3,true);});
  if(!dim){add(3.0,6.7,()=>{sBox(2.75,6.45,3.25,6.85,0,10,'#2b2b33');});add(3.0,6.62,()=>sPerson(3.0,6.62,{...elder(2)},{pose:'sit',act:'talk',front:false,right:true,mood:35}));add(3.05,7.2,()=>sBox(2.75,6.85,3.25,6.92,10,22,'#2b2b33'));}
  // dispensador de agua y planta
  add(.5,3.4,()=>{sBox(.25,3.15,.75,3.65,0,22,'#e9ebe6');cyl(.5,3.4,.18,22,34,'rgba(150,200,235,.85)','#bfe0f5');sBox(.66,3.3,.76,3.5,14,16,'#3c7be0');});
  add(1.2,7.6,()=>{cyl(1.2,7.55,.2,0,10,'#8a6a4a','#5a4030');const [a,b]=P(1.2,7.55,18);emoji('🪴',a,b,15);});
  // ---------- mesa de atestados con las pertenencias de Ana ----------
  add(7.4,5.35,()=>{sBox(6.5,4.7,8.3,5.4,15,17,'#d9d2c3');for(const [u,v] of [[6.55,4.75],[8.2,4.75],[6.55,5.3],[8.2,5.3]])sBox(u,v,u+.06,v+.06,0,15,'#3b3f46');
    sBox(7.4,4.8,8.0,4.95,17,28,'#2b2b33');poly([P(7.44,4.95,19),P(7.96,4.95,19),P(7.96,4.95,27),P(7.44,4.95,27)],'#7cc8f0');
    // bolsa de pertenencias precintada
    sBox(6.7,5.0,7.15,5.3,17,22,'rgba(235,240,245,.85)');const [a,b]=P(6.92,5.15,21);emoji('📱',a-3,b,6);emoji('🔑',a+3,b+1,5);
    sBox(7.25,5.05,7.35,5.3,17,17.6,'#fffdf8');
    if(mov>40||w.manif||S.strike){sBox(8.35,4.8,8.5,4.95,0,30,'#c8a46a');const [c,d]=P(8.45,4.9,28);ctx.save();ctx.translate(c,d);ctx.transform(1,-.5,0,1,0,0);ctx.fillStyle='#fffdf8';ctx.fillRect(-1,-2,16,9);ctx.fillStyle='#c8102e';ctx.font='900 3.6px Nunito, sans-serif';ctx.fillText('¡NO!',2,4);ctx.restore();}
  });
  add(7.4,4.2,()=>sChair(7.0,3.75,'#2b2b33'));
  add(7.5,4.3,()=>{sPerson(7.5,4.3,cop(3,{g:'f',style:'coleta'}),{pose:'sit',act:'type',front:true,right:false,shirt:COPSH,mood:50});badge(7.5,4.3,true);});
  // agente que patrulla frente al calabozo
  {const T=20,ph=(tt%T)/T,go=ph<.5,f=go?ph/.5:1-(ph-.5)/.5,x=5.0+f*4.4,y=2.45;
    add(x,y,()=>{sPerson(x,y,cop(11,{g:'m',style:'corto'}),{pose:'walk',ph:tt*5.5,front:true,right:go,shirt:COPSH});const [a,b]=P(x,y);ctx.fillStyle='#2b2b33';ctx.fillRect(a+(go?-6:4),b-22,2,6);});}
  if(repres){const T=27,ph=((tt+9)%T)/T,go=ph<.5,f=go?ph/.5:1-(ph-.5)/.5,x=9.4-f*3.4,y=6.6;pers(x,y,cop(5,{g:'m',style:'rapado'}),{pose:'walk',ph:tt*5.5,front:true,right:!go,shirt:COPSH});}
  // ---------- calabozo ----------
  // banco corrido de cemento contra la pared
  add(CX0+.3,.2,()=>{sBox(CX0+.25,.05,W-1.0,.7,0,12,'#a9aba6');sBox(CX0+.25,.05,W-1.0,.12,12,13,'#b9bbb6');
    // manta gris doblada
    sBox(8.2,.15,8.8,.6,12,15,'#6a7078');sBox(8.25,.2,8.75,.55,15,16,'#7a8088');});
  // retrete metálico en la esquina
  add(W-.5,.5,()=>{sBox(W-.75,.1,W-.2,.75,0,10,'#b8bcc2');isoEll(W-.47,.43,10.2,.2,'#4a4f56');});
  // compañero/a detenido/a (si hay movilización)
  const other=mov>35||w.manif||S.strike||crisis>65;
  if(other){const ch=C(day*7+3,{});add(6.0,.62,()=>sPerson(6.0,.62,ch,{pose:'sit',front:true,right:false,mood:35,shirt:['#3a3a4a','#5a7a3a','#7a2a3a'][day%3],act:Math.floor(tt/8)%3===1?'talk':null}));}
  // barrotes: plano x=CX0 (lateral) y plano y=CY1 (frontal) con puerta
  const bar=(x,y,k)=>{const [a,b]=P(x,y,0),[c,d]=P(x,y,76);capsule(a,b,c,d,2.2,'#2f343b');capsule(a+.5,b,c+.5,d,.6,'rgba(255,255,255,.25)');};
  const rail=(x0,y0,x1,y1,z)=>{const [a,b]=P(x0,y0,z),[c,d]=P(x1,y1,z);capsule(a,b,c,d,2.4,'#2f343b');};
  for(let y=0;y<=CY1+.001;y+=.35)add(CX0,y,()=>{bar(CX0,y);if(y+.35<=CY1+.001)for(const z of [4,38,75])rail(CX0,y,CX0,y+.35,z);});
  for(let x=CX0+.3;x<=W-.05;x+=.3)add(x,CY1,()=>{bar(x,CY1);for(const z of [4,38,75])rail(x-.3,CY1,x,CY1,z);
    if(Math.abs(x-8.0)<.15){sBox(x-.12,CY1-.05,x+.12,CY1+.05,28,38,'#4a4f56');const [a,b]=P(x,CY1+.06,33);circ(a,b,1,'#e2b955');}});
  // ---------- Ana ----------
  const ana={x:7.1,y:.62,pose:'sit',sad:true,front:true,right:false,act:null};
  const after=()=>{
    // luz fría sobre el calabozo
    ctx.save();ctx.globalAlpha=dim?.16:.1;poly([P(CX0,0,0),P(W,0,0),P(W,CY1,0),P(CX0,CY1,0)],'#3a5a8a');poly([P(CX0,0,0),P(W,0,0),P(W,0,74),P(CX0,0,74)],'#3a5a8a');ctx.restore();
    if(dim){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.06;poly([P(0,D,0),P(0,D,74),P(0,0,74),P(CX0,0,74),P(CX0,0,0),P(CX0,D,0)],'#f0f6ff');ctx.restore();glow(7.8,0,64,40,'220,235,255',.18);}
    // fluorescentes (uno parpadea)
    [[2.4,3.0],[2.4,6.0],[7.4,4.0],[7.4,6.6]].forEach(([x,y],k)=>{const [a,b]=P(x-.6,y,94),[c,d]=P(x+.6,y,94);ctx.strokeStyle='rgba(60,60,60,.5)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a,b-14);ctx.moveTo(c,d);ctx.lineTo(c,d-14);ctx.stroke();capsule(a,b,c,d,3.4,'#c9ccd0');
      const on=flick(k);ctx.save();ctx.globalAlpha=on;capsule(a,b+1,c,d+1,2,'#f4fbff');ctx.restore();if(dim||k===2)glow(x,y,92,54,'230,242,255',.15*on);});
  };
  return {W,D,floor:'#c9ccd0',wall:'#e9ebe6',out:false,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: coop
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Cooperativa La Colmena: taller de carpintería cooperativo. Bancos de trabajo, herramientas,
// pizarra de turnos, rincón del café. A última hora de la tarde, asamblea en corro.
SCENES['coop']=function(E){
  const {tt,night,act,w,npc,cp}=E;const h=E.h??12;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=10,D=8;const hA=i=>Math.abs(hash(i));
  const crisis=(w&&w.crisis)||0,mov=(w&&w.mov)||0;
  const asamblea=h>=17.5&&h<19.5;
  const lateN=h>=21||h<7;
  const working=act==='work';
  const wx=(S.weather&&S.weather.k)||'sol',rain=wx==='lluvia'||wx==='tormenta',snow=wx==='nieve';
  const strike=S.strike&&S.strike.on;
  // ---- ayudas ----
  const qX=(xf,y0,y1,z0,z1,col)=>poly([P(xf,y0,z0),P(xf,y1,z0),P(xf,y1,z1),P(xf,y0,z1)],col);
  const qY=(yf,x0,x1,z0,z1,col)=>poly([P(x0,yf,z0),P(x1,yf,z0),P(x1,yf,z1),P(x0,yf,z1)],col);
  const txt=(t,x,y,z,ax,size,col,wt)=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,ax==='x'?0.5:-0.5,0,1,0,0);ctx.font=`${wt||900} ${size}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,0,0);ctx.restore();};
  const ln=(a,b,col,lw)=>{ctx.strokeStyle=col;ctx.lineWidth=lw||1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const hexY=(x,z,r,col)=>{const [a,b]=P(x,.03,z);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle=col;ctx.beginPath();for(let k=0;k<6;k++){const an=k/6*Math.PI*2+Math.PI/6;k?ctx.lineTo(Math.cos(an)*r,Math.sin(an)*r):ctx.moveTo(Math.cos(an)*r,Math.sin(an)*r);}ctx.closePath();ctx.fill();ctx.restore();};
  const WALL='#ead9b8',BRICK='#c98e64';
  // banco de trabajo (a lo largo de x)
  const banco=(x0,y0,x1,y1)=>{for(const [x,y] of [[x0+.08,y0+.08],[x1-.08,y0+.08],[x0+.08,y1-.08],[x1-.08,y1-.08]])sBox(x-.05,y-.05,x+.05,y+.05,0,15,'#6b4a2e');
    sBox(x0+.1,y0+.1,x1-.1,y1-.1,5,6.5,'#8a6440');sBox(x0,y0,x1,y1,15,18.5,'#c4945c');
    ctx.strokeStyle='rgba(90,55,25,.25)';ctx.lineWidth=.5;ctx.beginPath();for(let k=1;k<4;k++){const yy=y0+(y1-y0)*k/4;const a=P(x0,yy,18.5),b=P(x1,yy,18.5);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();};
  const tornillo=(x,y)=>{sBox(x-.12,y-.08,x+.12,y+.08,18.5,24,'#3f6fa8');sBox(x-.03,y+.08,x+.03,y+.3,20,22,'#9aa3ad');};
  const tabla=(x0,y0,x1,y1,z,c)=>sBox(x0,y0,x1,y1,z,z+2,c||'#e2c08d');
  const silla=(x,y,c,face)=>{// silla plegable; face 'front' respaldo atrás (y-), 'back' respaldo delante (y+)
    sBox(x-.2,y-.2,x+.2,y+.2,9,11,c);for(const [dx,dy] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]])sBox(x+dx-.02,y+dy-.02,x+dx+.02,y+dy+.02,0,9,'#555');
    if(face==='front')sBox(x-.2,y-.22,x+.2,y-.17,11,22,c);else if(face==='left')sBox(x-.22,y-.2,x-.17,y+.2,11,22,c);else if(face==='right')sBox(x+.17,y-.2,x+.22,y+.2,11,22,c);};
  const sillaBack=(x,y,c)=>sBox(x-.2,y+.17,x+.2,y+.22,11,22,c);
  // ---- base: suelo de hormigón pulido con líneas, paredes de ladrillo y yeso ----
  const drawBase=()=>{
    sFloor(W,D,'#cfc8bb',false);
    ctx.fillStyle='rgba(90,80,70,.12)';for(let k=0;k<60;k++){const [a,b]=P(hA(k*7+2)*W,hA(k*11+3)*D);ctx.beginPath();ctx.ellipse(a,b,2+hA(k)*5,1+hA(k)*2,0,0,Math.PI*2);ctx.fill();}
    // juntas de dilatación
    ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;ctx.beginPath();for(let k=2.5;k<W;k+=2.5){const a=P(k,0),b=P(k,D);ctx.moveTo(...a);ctx.lineTo(...b);}for(let k=2.5;k<D;k+=2.5){const a=P(0,k),b=P(W,k);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();
    // serrín bajo la sierra
    for(let k=0;k<26;k++){const x=6.6+hA(k*3)*2.4,y=2.6+hA(k*5)*1.4;isoEll(x,y,0,.05+hA(k*9)*.12,'rgba(225,195,140,.7)');}
    // zona de paso pintada en amarillo
    ctx.strokeStyle='rgba(230,185,40,.75)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();{const a=P(.2,4.3),b=P(W-.1,4.3);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();ctx.setLineDash([]);
    // paredes
    sBox(0,-.15,W,0,0,76,WALL);sBox(-.15,-.15,0,D,0,76,shade(WALL,.95));
    // zócalo de ladrillo visto
    qY(0,0,W,0,30,BRICK);qX(0,0,D,0,30,shade(BRICK,.93));
    ctx.strokeStyle='rgba(250,235,215,.35)';ctx.lineWidth=.6;ctx.beginPath();for(let z=4;z<30;z+=4){let a=P(0,.005,z),b=P(W,.005,z);ctx.moveTo(...a);ctx.lineTo(...b);a=P(.005,0,z);b=P(.005,D,z);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();
    // ventanales altos (nave)
    for(let k=0;k<3;k++){const x0=6.4+k*1.15,x1=x0+1.0;qY(.005,x0-.05,x1+.05,38,70,'#5b5f66');const sky=lateN||night>.5?'#1d2440':rain?'#a2b3c2':'#c4e4f5';qY(.01,x0,x1,40,68,sky);
      ln(P((x0+x1)/2,.012,40),P((x0+x1)/2,.012,68),'#5b5f66',1);ln(P(x0,.012,54),P(x1,.012,54),'#5b5f66',1);
      if(!(lateN||night>.5)){qY(.012,x0,x1,40,46,'#b9b3a8');for(let j=0;j<2;j++){const [a,b]=P(x0+.25+j*.5,.012,48);circ(a,b,4,'#6aa55c');}}
      if(rain)for(let j=0;j<4;j++){const xx=x0+hA(j*7+k)*(x1-x0),zz=68-((hA(j*3+k)*28+tt*20)%28);ln(P(xx,.013,zz),P(xx,.013,zz-4),'rgba(255,255,255,.6)',.6);}
      if(snow)qY(.012,x0,x1,40,43,'#f4f6f8');}
    // rótulo de la cooperativa
    qY(.01,.7,4.1,46,68,'#2f2a26');
    for(const [x,z,c] of [[1.05,61,'#f2b630'],[1.32,55.5,'#f5c84c'],[1.05,50,'#e0a020'],[1.6,61,'#e0a020']])hexY(x,z,4.2,c);
    {const [a,b]=P(1.32,.03,55.5);emoji('🐝',a,b,7);}
    txt('LA COLMENA',2.75,.02,60.5,'x',8.4,'#f5c84c');txt(TXN.escenas.sociedad_cooperativa_carpinteria,2.75,.02,52,'x',3.4,'#ead9b8',800);
    // pizarra de turnos
    {const x0=4.5,x1=6.1;qY(.01,x0-.04,x1+.04,30,58,'#a8adb4');qY(.02,x0,x1,31,57,'#fbfcfd');
      txt('TURNOS',(x0+x1)/2,.03,54,'x',3.6,'#2b4a8c');
      const dias=['L','M','X','J','V'];dias.forEach((d,k)=>txt(d,x0+.45+k*.24,.03,50,'x',2.6,'#555'));
      const names=['Ana','Rosa','Kike','Lupe','Moha'];if(cp&&cp.n)names[1]=cp.n;
      names.forEach((n,r)=>{txt(n,x0+.2,.03,46.5-r*3.3,'x',2.2,'#333',800);for(let k=0;k<5;k++){const on=hA(r*5+k+3)>(crisis>=60?.55:.25);if(on){const [a,b]=P(x0+.45+k*.24,.03,46.5-r*3.3);circ(a,b,1.2,['#e85d3f','#2f8a5a','#f2b630','#3f6fa8','#9b5de5'][r]);}}});
      // un rotulador que se mueve: alguien apunta algo
      ln(P(x0+.05,.03,32.5),P(x1-.05,.03,32.5),'rgba(60,60,60,.25)',.5);}
    // corcho: asamblea y pedidos
    {const x0=.6,x1=2.0,z0=32,z1=44;}
    // panel de herramientas en la pared izquierda
    {const y0=.6,y1=2.9;qX(.01,y0,y1,32,62,'#c9a77a');ctx.fillStyle='rgba(80,55,30,.35)';for(let y=y0+.1;y<y1;y+=.16)for(let z=34;z<61;z+=3.4){const [a,b]=P(.012,y,z);ctx.fillRect(a,b,.9,.9);}
      // sierra, martillo, llave, serrucho, escuadra, metro
      const T=(y,z,f)=>{const [a,b]=P(.02,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,-.5,0,1,0,0);f();ctx.restore();};
      T(.9,48,()=>{ctx.fillStyle='#9aa3ad';ctx.beginPath();ctx.moveTo(-2,-8);ctx.lineTo(10,-6);ctx.lineTo(10,0);ctx.lineTo(-2,2);ctx.fill();ctx.fillStyle='#b5482f';ctx.fillRect(-6,-7,5,8);});
      T(1.55,52,()=>{ctx.fillStyle='#8a5a2b';ctx.fillRect(-1,-2,2,14);ctx.fillStyle='#4b5058';ctx.fillRect(-4,-4,8,3);});
      T(1.95,52,()=>{ctx.fillStyle='#9aa3ad';ctx.fillRect(-1,-3,2,14);circ(0,-3,2.6,'#9aa3ad');circ(0,-3,1.2,'#c9a77a');});
      T(2.35,52,()=>{ctx.fillStyle='#e0a020';ctx.fillRect(-1,-3,2.4,14);ctx.fillStyle='#3b3f46';ctx.fillRect(-1.5,-5,3.4,3);});
      T(2.65,50,()=>{ctx.strokeStyle='#5b6068';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-1,-6);ctx.lineTo(-1,8);ctx.lineTo(7,8);ctx.stroke();});
      T(1.4,39,()=>{circ(0,0,3.2,'#f2c230');circ(0,0,1.2,'#3b3f46');});
      T(2.1,39,()=>{ctx.fillStyle='#d1242f';ctx.fillRect(-4,-2,8,4);ctx.fillStyle='#3b3f46';ctx.fillRect(-1,-6,2,4);});}
    // tablón: asamblea y pedidos (pared izquierda, junto a la puerta)
    {const y0=3.4,y1=4.4;qX(.01,y0,y1,30,52,'#b88a5a');qX(.015,y0+.05,y1-.05,31,51,'#d6b07e');
      qX(.02,y0+.1,y1-.1,40,50,'#fffdf2');txt('ASAMBLEA',.025,(y0+y1)/2,47.5,'y',3,'#c0392b');txt(TXN.escenas.jueves_18_00,.025,(y0+y1)/2,44.5,'y',2.4,'#333',800);txt(TXN.escenas.t1_excedentes,.025,(y0+y1)/2,42,'y',2,'#555',700);
      qX(.02,y0+.15,y0+.5,32,38,'#ffe58a');qX(.02,y0+.55,y1-.12,33,39,crisis>=60?'#ffd0d0':'#d6f0ff');
      txt(crisis>=60?'Caja de':'Pedido:',.025,y0+.73,37,'y',1.9,'#333',800);txt(crisis>=60?'resistencia':'escuela inf.',.025,y0+.73,34.8,'y',1.9,'#333',800);}
    // persiana metálica (entrada de material) en la pared izquierda
    {const y0=5.6,y1=7.5;qX(.005,y0-.08,y1+.08,0,52,'#7d838c');const open=lateN?0:asamblea?.15:.55;const zt=open*44;
      if(zt>2){qX(.01,y0,y1,0,zt,lateN||night>.6?'#20263a':'#9fb7c8');// calle
        if(!(lateN||night>.6)){qX(.012,y0,y1,0,6,'#8d8f92');const cx=y0+((tt*.4)%1)*(y1-y0);if(zt>12){const [a,b]=P(.012,cx,5);ctx.fillStyle='#d9534f';ctx.fillRect(a-6,b-8,12,5);}}}
      qX(.01,y0,y1,zt,50,'#b5bac1');ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=.6;ctx.beginPath();for(let z=zt+2;z<50;z+=2.4){const a=P(.012,y0,z),b=P(.012,y1,z);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();
      sBox(-.02,y0-.1,.09,y1+.1,50,56,'#5b6068');}
    // banderines de colores
    {const cols=['#e85d3f','#f2b630','#2f8a5a','#3f6fa8','#9b5de5','#f08fb0'];const A=P(0,1.2,70),B=P(4.2,0,70),C2=P(9.8,0,72);
      for(const [p,q,n] of [[A,B,9],[B,C2,11]]){ctx.strokeStyle='#6b5a4a';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...p);const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2+14;ctx.quadraticCurveTo(mx,my,...q);ctx.stroke();
        for(let k=1;k<n;k++){const t=k/n;const x=(1-t)*(1-t)*p[0]+2*(1-t)*t*mx+t*t*q[0],y=(1-t)*(1-t)*p[1]+2*(1-t)*t*my+t*t*q[1];const sw=Math.sin(tt*1.5+k)*.8;ctx.fillStyle=cols[k%cols.length];ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.lineTo(x+sw,y+7);ctx.closePath();ctx.fill();}}}
    // pancartas según el mundo
    if(strike||mov>60){qY(.02,5.9,8.5,16,28,'#fffdf8');txt(strike?TXN.escenas.apoyamos_la_huelga:TXN.escenas.huelga_general_todas,7.2,.03,22,'x',3.6,'#d1242f');}
    if(crisis>=60){qY(.02,5.9,8.5,30,37,'#2f8a5a');txt(TXN.escenas.aqui_no_se_despide_repartimos_horas,7.2,.03,33.5,'x',2.5,'#fff',800);}
    // lámparas colgantes industriales
    for(const [x,y] of [[2,1.6],[4.6,3.6],[7.6,2.5]]){ln(P(x,y,86),P(x,y,70),'#333',.8);const [a,b]=P(x,y,70);ctx.fillStyle='#2f5d4a';ctx.beginPath();ctx.moveTo(a-5,b+4);ctx.lineTo(a+5,b+4);ctx.lineTo(a+2,b-1);ctx.lineTo(a-2,b-1);ctx.closePath();ctx.fill();circ(a,b+4.5,1.8,night>.3||lateN?'#fff2c0':'#f4ead0');}
  };
  // ---- mobiliario ----
  // estantería de tablones (fondo derecha)
  add(9.4,1.2,()=>{for(const z of [0,18,36])sBox(8.6,.25,9.9,1.0,z,z+2,'#5b6068');for(const x of [8.65,9.85])for(const y of [.3,.95])sBox(x-.03,y-.03,x+.03,y+.03,0,50,'#5b6068');
    for(let k=0;k<5;k++)sBox(8.62,.3+k*.13,9.9,.42+k*.13,2,5+k%2*2,['#e2c08d','#d4ac72','#c79a5e'][k%3]);
    for(let k=0;k<4;k++)sBox(8.62,.35+k*.15,9.9,.48+k*.15,20,23,['#d4ac72','#e2c08d'][k%2]);
    for(let k=0;k<3;k++)sBox(8.62,.4+k*.18,9.9,.55+k*.18,38,40,'#b98d58');});
  // banco 1 (fondo izquierda) con tornillo
  add(2.1,1.4,()=>{banco(.8,.9,3.0,1.6);tornillo(1.2,1.4);tabla(1.5,1.0,2.8,1.25,18.5);sBox(2.2,1.3,2.5,1.5,18.5,21,'#3b3f46');});
  // banco 2 (centro): Ana montando una silla
  add(4.6,3.0,()=>{banco(3.4,2.6,5.6,3.3);// silla a medio montar
    const x=4.6,y=2.95,z=18.5;for(const [dx,dy] of [[-.2,-.15],[.2,-.15],[-.2,.15],[.2,.15]])sBox(x+dx-.03,y+dy-.03,x+dx+.03,y+dy+.03,z,z+11,'#d9b27a');sBox(x-.23,y-.18,x+.23,y+.18,z+11,z+13,'#e2c08d');sBox(x-.23,y-.2,x+.23,y-.15,z+13,z+24,'#d4ac72');
    const [a,b]=P(3.8,2.8,19);ctx.fillStyle='#e0a020';ctx.fillRect(a-3,b-2,6,2.5);ctx.fillStyle='#3b3f46';ctx.fillRect(a+2,b-3,3,1.5);});
  // sierra de mesa con serrín volando
  add(7.6,2.6,()=>{sBox(6.8,2.1,8.4,2.9,0,17,'#4a6b8c');sBox(6.7,2.05,8.5,2.95,17,19,'#c9cdd2');tabla(6.9,2.35,8.3,2.65,19,'#e2c08d');
    const [a,b]=P(7.6,2.5,21);ctx.fillStyle='#9aa3ad';ctx.beginPath();ctx.arc(a,b,4,Math.PI,0);ctx.fill();
    if(working&&!asamblea&&!lateN)for(let k=0;k<7;k++){const ph=(tt*1.6+k/7)%1;const [c,d]=P(7.6+ph*.9,2.5-ph*.2,21+Math.sin(ph*3)*8);ctx.fillStyle=`rgba(230,200,150,${.8*(1-ph)})`;ctx.fillRect(c,d,1.6,1.6);}});
  // mueble terminado con etiqueta
  add(9.4,4.0,()=>{sBox(9.0,3.6,9.8,4.3,0,20,'#c79a5e');sBox(8.97,3.57,9.83,4.33,20,22,'#d4ac72');qY(4.301,9.08,9.38,3,18,'#b98d58');qY(4.301,9.42,9.72,3,18,'#b98d58');
    qY(4.31,9.05,9.75,12,17,'#fffdf2');txt(crisis>=60?'¿Pedidos?':TXN.escenas.pedido_n_214,9.4,4.32,14.5,'x',2.2,'#333',800);});
  // rincón del café
  add(.6,4.7,()=>{sBox(.15,4.3,.9,5.1,0,22,'#e8e0d0');sBox(.1,4.25,.95,5.15,22,24,'#8a6440');
    sBox(.3,4.4,.6,4.7,24,34,'#3b3f46');const [a,b]=P(.45,4.55,36);for(let k=0;k<3;k++){const ph=(tt*.5+k/3)%1;ctx.strokeStyle=`rgba(255,255,255,${.6*(1-ph)})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a+k*2-2,b-ph*10);ctx.quadraticCurveTo(a+k*2+2,b-ph*10-4,a+k*2-1,b-ph*10-8);ctx.stroke();}
    for(let k=0;k<3;k++){const [c,d]=P(.35+k*.18,4.95,24);ctx.fillStyle=['#e85d3f','#f2b630','#3f6fa8'][k];ctx.fillRect(c-1.6,d-4,3.2,4);}});
  // plantas
  add(3.5,.75,()=>{cyl(3.35,.45,.22,0,10,'#c96f43');const [a,b]=P(3.35,.45,10);circ(a,b-8,7,'#4f8a3c');circ(a-5,b-4,5,'#5fa04a');circ(a+5,b-5,5,'#3f7a32');});
  // perro del taller
  add(2.4,5.6,()=>{const [a,b]=P(2.4,5.6,0);ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(a,b,11,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c4925a';ctx.beginPath();ctx.ellipse(a,b-4,9,4.5,0,0,Math.PI*2);ctx.fill();circ(a+8,b-6,4,'#c4925a');ctx.fillStyle='#8a5a2b';ctx.beginPath();ctx.ellipse(a+10,b-8,1.6,3,.4,0,Math.PI*2);ctx.fill();circ(a+11,b-5.5,.9,'#222');
    const wag=Math.sin(tt*6)*.6;ctx.strokeStyle='#c4925a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a-8,b-5);ctx.lineTo(a-12,b-8+wag*3);ctx.stroke();
    if(!asamblea){ctx.globalAlpha=.6;emoji('💤',a+6,b-16-((tt*4)%5),7);ctx.globalAlpha=1;}});
  // pila de sillas terminadas y palé de envío
  add(8.6,6.4,()=>{for(let k=0;k<4;k++){const z=k*6;sBox(8.3,6.1,8.75,6.55,z+9,z+11,'#d4ac72');for(const [dx,dy] of [[0,0],[.42,0],[0,.42],[.42,.42]])sBox(8.3+dx,6.1+dy,8.33+dx,6.13+dy,z,z+9,'#c79a5e');}sBox(8.3,6.08,8.75,6.13,33,44,'#d4ac72');});
  add(7.4,7.3,()=>{sBox(6.9,6.9,7.9,7.7,0,4,'#b08a58');sBox(7.0,7.0,7.8,7.6,4,20,'#c8a46a');sBox(7.05,7.05,7.45,7.55,20,30,'#d6b47a');qY(7.601,7.1,7.7,8,15,'#fffdf2');txt(TXN.escenas.fragil_envio,7.4,7.61,11.5,'x',2.4,'#c0392b',900);});
  // ---- gente ----
  const socia=(k,o)=>({...npc[k],...(o||{})});
  const delantal=c=>c;// los delantales se insinúan con el color de la camisa
  let ana;
  if(asamblea){
    // corro de sillas: quien tiene la palabra va rotando
    const cx=5.2,cy=5.5,N=8,turn=Math.floor(tt/5)%N;
    const people=[socia(1),socia(2),socia(4),socia(6),socia(7),socia(9),socia(10)];let pi=0;
    for(let k=0;k<N;k++){const an=-Math.PI*.5+k/N*Math.PI*2;const cu=Math.sin(an)*2.3/1.414,cv=Math.cos(an)*1.75/1.414;const x=cx+cu+cv,y=cy+cu-cv;const dx=cx-x,dy=cy-y;
      const f=Math.abs(dy)>=Math.abs(dx)?(dy>0?'front':'back'):(dx>0?'left':'right');// lado del respaldo: opuesto a la mirada
      const sdx=(dx-dy),sdy=(dx+dy);const fr=sdy>0,rt=sdx>0;
      const speaking=k===turn,hand=!speaking&&hA(k*7+Math.floor(tt/5))>.72;const sc=k===0?'#e85d3f':['#3f6fa8','#2f8a5a','#f2b630','#9b5de5'][k%4];
      const backF=()=>{if(f==='back')sBox(x-.2,y+.17,x+.2,y+.22,11,22,sc);if(f==='right')sBox(x+.17,y-.2,x+.22,y+.2,11,22,sc);};
      const seat=()=>silla(x,y,sc,f==='front'?'front':f==='left'?'left':'none');
      if(k===0){ana={x,y:y+.01,pose:'sit',act:speaking?'talk':hand?'cheer':null,front:fr,right:rt};add(x-.01,y-.01,seat);add(x+.02,y+.02,backF);continue;}
      const ch=people[pi++%people.length];
      add(x,y,()=>{seat();sPerson(x,y+.01,ch,{pose:'sit',act:speaking?'talk':hand?'cheer':null,front:fr,right:rt,mood:70,name:k===2&&cp?cp.n:null});backF();});}
    // papelógrafo con el orden del día
    add(7.9,4.1,()=>{const x=7.9,y=4.1;for(const [dx,dy] of [[-.2,0],[.2,0],[0,-.3]])ln(P(x+dx,y+dy,0),P(x,y-.1,58),'#6b4a2e',1.2);qY(y+.01,x-.35,x+.35,30,56,'#fffdf8');
      txt(TXN.escenas.orden_del_dia,x,y+.02,52,'x',2.6,'#c0392b');[TXN.escenas.t1_turnos_verano,TXN.escenas.t2_socias_nuevas,TXN.escenas.t3_excedentes].forEach((t,k)=>txt(t,x,y+.02,47-k*4,'x',2.1,'#333',800));
      // votación: palitos a mano alzada
      ctx.strokeStyle='#2f8a5a';ctx.lineWidth=.6;ctx.beginPath();for(let k=0;k<Math.floor(tt/2)%9;k++){const a=P(x-.25+k*.05,y+.02,33),b=P(x-.25+k*.05,y+.02,36.5);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();});
  }else if(lateN){
    // cerrando: Ana barre el serrín, una socia hace caja
    ana={x:6.4,y:3.8,pose:'stand',act:'dig',front:true,right:true};
    add(2.4,2.1,()=>sPerson(2.4,2.1,socia(2),{act:'book',front:true,right:true,name:cp?cp.n:null}));
  }else{
    const slow=crisis>=60;
    // Ana montando la silla en el banco central
    ana=working?{x:5.95,y:3.1,pose:'stand',act:'hammer',front:true,right:false}:{x:4.6,y:4.9,pose:'stand',act:'talk',front:true,right:true};
    // compi lijando al otro lado del banco (de cara)
    add(3.05,3.0,()=>sPerson(3.05,3.0,socia(2,{shirt:'#2f8a5a'}),{act:'stir',front:true,right:true,name:cp?cp.n:null}));
    // en el banco 1, con el tornillo
    add(1.9,1.95,()=>sPerson(1.9,1.95,socia(7,{shirt:'#3f6fa8'}),{act:slow?'talk':'paint',front:false,right:false}));
    // en la sierra
    if(!slow)add(7.6,3.3,()=>sPerson(7.6,3.3,socia(4,{shirt:'#7a8c6e'}),{act:'stir',front:false,right:false}));
    // charlando con un café
    add(1.5,5.6,()=>sPerson(1.5,5.6,socia(9),{act:'talk',front:true,right:false,prop:'☕'}));
    add(1.45,4.6,()=>sPerson(1.45,4.6,socia(10),{act:slow?'talk':'eat',front:true,right:true}));
    // alguien trae tablones desde la persiana
    if(!slow){const T=(tt*.08)%2,f=T<1?T:2-T,dir=T<1?1:-1,x=1.0+f*5.6,y=6.6;add(x,y,()=>{sPerson(x,y,socia(6,{shirt:'#c98e64'}),{pose:'walk',ph:tt*6,front:dir>0,right:dir>0});if(dir>0){const [a,b]=P(x,y,30);ctx.save();ctx.translate(a,b);ctx.rotate(.45);ctx.fillStyle='#e2c08d';ctx.fillRect(-16,-2,32,3);ctx.restore();}});}
    // apuntando en la pizarra de turnos
    add(5.3,.6,()=>sPerson(5.3,.6,socia(1,{shirt:'#f08fb0'}),{act:'paint',front:false,right:true}));
  }
  // ---- luz cálida ----
  const after=()=>{
    const dim=lateN?.42:night*.28;
    if(dim>.02){ctx.save();ctx.beginPath();const hx=[P(0,0,78),P(W,0,78),P(W,0,-22),P(W,D,-22),P(0,D,-22),P(0,D,78)];ctx.moveTo(...hx[0]);for(const p of hx.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.clip();
      ctx.globalCompositeOperation='multiply';ctx.globalAlpha=Math.min(1,dim*1.3);ctx.fillStyle='rgb(165,130,105)';ctx.fillRect(-2000,-2000,4000,4000);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;
      for(const [x,y] of [[2,1.6],[4.6,3.6],[7.6,2.5]]){const [px,py]=P(x,y,0);const g=ctx.createRadialGradient(px,py,2,px,py,110);g.addColorStop(0,'rgba(255,200,120,.3)');g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(px,py,110,60,0,0,Math.PI*2);ctx.fill();
        const [lx,ly]=P(x,y,70);ctx.fillStyle='rgba(255,220,150,.08)';ctx.beginPath();ctx.moveTo(lx-4,ly+4);ctx.lineTo(lx+4,ly+4);ctx.lineTo(px+40,py);ctx.lineTo(px-40,py);ctx.closePath();ctx.fill();}
      ctx.restore();}
    else{// rayos de sol por los ventanales
      ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const x0=6.4+k*1.15;ctx.fillStyle=rain?'rgba(255,255,255,.02)':'rgba(255,245,210,.06)';ctx.beginPath();const a=P(x0,.02,68),b=P(x0+1,.02,68),c=P(x0+1-1.5,3.2,0),d=P(x0-1.5,3.2,0);ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.closePath();ctx.fill();}ctx.restore();}
  };
  return {W,D,floor:'#cfc8bb',wall:WALL,out:false,tile:false,drawBase,items:it,ana,after};
};
// Escena: obra
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Obra de edificio de viviendas: estructura de hormigón a medio levantar, grúa torre, hormigonera,
// palés, valla con cartel de «Viviendas de lujo». Crisis ≥ 60 → obra paralizada.
SCENES['obra']=function(E){
  const {tt,night,act,w,npc,cp}=E;const h=E.h??12;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=11,D=8;const hA=i=>Math.abs(hash(i));
  const crisis=(w&&w.crisis)||0,mov=(w&&w.mov)||0;
  const parada=crisis>=60;
  const wx=(S.weather&&S.weather.k)||'sol',rain=wx==='lluvia'||wx==='tormenta',snow=wx==='nieve'||(S.snow>0&&wx!=='sol');
  const nt=night>.45;
  const lunch=!parada&&h>=13.5&&h<14.75;
  const working=!parada&&!lunch&&!nt;
  // tinte nocturno (solo colores hex)
  const C=c=>night>.02?mixHex(c,'#161c34',night*.55):c;
  const wet=rain?.82:1;
  // ---- ayudas locales ----
  const qX=(xf,y0,y1,z0,z1,col)=>poly([P(xf,y0,z0),P(xf,y1,z0),P(xf,y1,z1),P(xf,y0,z1)],col);
  const qY=(yf,x0,x1,z0,z1,col)=>poly([P(x0,yf,z0),P(x1,yf,z0),P(x1,yf,z1),P(x0,yf,z1)],col);
  const txt=(t,x,y,z,ax,size,col,wt)=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,ax==='x'?0.5:-0.5,0,1,0,0);ctx.font=`${wt||900} ${size}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,0,0);ctx.restore();};
  const ln2=(a,b,col)=>{ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const line=(a,b,col,lw)=>{ctx.strokeStyle=col;ctx.lineWidth=lw||1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const conc=C('#a8a59b'),concD=C('#8f8c83');
  const col_=(x,y,z0,z1)=>sBox(x-.13,y-.13,x+.13,y+.13,z0,z1,conc);
  const slab=(x0,y0,x1,y1,z)=>{sBox(x0,y0,x1,y1,z,z+6,C('#b3b0a6'));};
  // muro de ladrillo visto (cara hacia +y) con juntas
  const brickY=(x0,x1,y,z0,z1)=>{sBox(x0,y-.07,x1,y+.07,z0,z1,C('#b8603e'));if(night>.7)return;const yf=y+.07;ctx.strokeStyle='rgba(235,220,200,.38)';ctx.lineWidth=.6;ctx.beginPath();
    for(let z=z0+4;z<z1;z+=4){const a=P(x0,yf,z),b=P(x1,yf,z);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}
    for(let z=z0,r=0;z<z1;z+=4,r++)for(let x=x0+(r%2?.12:.24);x<x1;x+=.24){const a=P(x,yf,z),b=P(x,yf,Math.min(z1,z+4));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.stroke();};
  // muro de ladrillo con cara hacia +x
  const brickX=(y0,y1,x,z0,z1)=>{sBox(x-.07,y0,x+.07,y1,z0,z1,C('#b8603e'));if(night>.7)return;const xf=x+.07;ctx.strokeStyle='rgba(235,220,200,.3)';ctx.lineWidth=.6;ctx.beginPath();
    for(let z=z0+4;z<z1;z+=4){const a=P(xf,y0,z),b=P(xf,y1,z);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.stroke();};
  const pale=(x,y,kind,k)=>{// palé de madera + carga
    sBox(x,y,x+.9,y+.9,0,4,C('#b08a58'));
    if(kind==='lad'){sBox(x+.05,y+.05,x+.85,y+.85,4,26,C('#c4673f'));if(night<.7){ctx.strokeStyle='rgba(90,30,15,.35)';ctx.lineWidth=.6;ctx.beginPath();for(let z=8;z<26;z+=4){const a=P(x+.05,y+.85,z),b=P(x+.85,y+.85,z),c=P(x+.85,y+.05,z);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);}ctx.stroke();}
      // plástico retráctil
      poly([P(x+.04,y+.86,4),P(x+.86,y+.86,4),P(x+.86,y+.86,26),P(x+.04,y+.86,26)],'rgba(230,240,255,.22)');}
    else if(kind==='sac'){for(let r=0;r<4;r++)for(let j=0;j<2;j++){const xx=x+.06+j*.42,z=4+r*5;sBox(xx,y+.08,xx+.38,y+.82,z,z+5,C(r%2?'#d8d2c2':'#cfc8b6'));}
      txt('CEMENTO',x+.45,y+.82,14,'x',4,C('#3c5d8c'),900);}
    else if(kind==='blq'){for(let r=0;r<3;r++)sBox(x+.05,y+.05,x+.85,y+.85,4+r*7,10+r*7,C(r%2?'#a3a39b':'#b0b0a8'));}
  };
  const carretilla=(x,y,dir,load)=>{// dir: +1 hacia +x, -1 hacia -x
    const fx=x+dir*.45;sBox(Math.min(x,fx)+.02,y-.18,Math.max(x,fx),y+.18,7,13,C('#3f7f4a'));
    if(load)isoEll((x+fx)/2,y,13,.17,C(load));
    const [a,b]=P(fx+dir*.08,y,4);ctx.fillStyle='#222';ctx.beginPath();ctx.ellipse(a,b,3.4,4,0,0,Math.PI*2);ctx.fill();
    const [h1,h2]=P(x-dir*.25,y-.12,11),[h3,h4]=P(x-dir*.25,y+.12,11),[c1,c2]=P(x,y-.12,10),[c3,c4]=P(x,y+.12,10);
    line([h1,h2],[c1,c2],'#555',1.2);line([h3,h4],[c3,c4],'#555',1.2);};
  const casco=(x,y,z)=>{const [a,b]=P(x,y,z);ctx.fillStyle='#f6c90e';ctx.beginPath();ctx.arc(a,b,3,Math.PI,0);ctx.fill();ctx.fillRect(a-3.8,b-.4,7.6,1.1);};
  const tufts=(x,y,n)=>{for(let k=0;k<n;k++){const xx=x+hA(k*7+x*13|0)*.8,yy=y+hA(k*11+y*17|0)*.8;const [a,b]=P(xx,yy);ctx.strokeStyle=C('#6f8a3c');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a-2,b);ctx.lineTo(a-3,b-6);ctx.moveTo(a,b);ctx.lineTo(a,b-8);ctx.moveTo(a+2,b);ctx.lineTo(a+4,b-5);ctx.stroke();}};
  // ---- suelo, valla y cartel ----
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,C('#6b5238'));
    topQuad(0,0,W,D,0,C(snow?'#e9edf0':rain?'#7f6a4f':'#a48b67'));
    // zona de solera de hormigón bajo la estructura y camino de grava
    topQuad(2,0.4,7.6,3.25,0,C(rain?'#8c8a82':'#a19e95'));
    ctx.fillStyle=C(rain?'#6c5a43':'#8d7656');
    for(let k=0;k<70;k++){const x=hA(k*31+5)*W,y=3.3+hA(k*17+9)*(D-3.4);const [a,b]=P(x,y);ctx.fillRect(a,b,1.6,1);}
    // rodadas de camión
    ctx.strokeStyle=rain?'rgba(50,38,25,.45)':'rgba(90,70,45,.35)';ctx.lineWidth=3;ctx.beginPath();for(const off of [0,.45]){const a=P(W,4.2+off),b=P(8.6,4.6+off),c=P(5,6.8+off);ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(b[0],b[1],c[0],c[1]);}ctx.stroke();
    if(snow){ctx.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<30;k++){const x=hA(k*13)*W,y=hA(k*29)*D;isoEll(x,y,0,.3+hA(k)*.4,'rgba(255,255,255,.55)');}}
    if(rain){// charcos con ondas
      for(const [x,y,r] of [[4.2,5.6,.45],[6.6,7.0,.35],[1.8,6.6,.38],[8.0,6.3,.4],[5.6,3.7,.3],[9.6,5.4,.3]]){const nf=1-night*.7;isoEll(x,y,0,r,`rgba(95,105,115,${.45*nf})`);isoEll(x+.05,y+.04,0,r*.8,`rgba(140,160,180,${.45*nf})`);isoEll(x-.08,y-.06,0,r*.45,`rgba(200,215,230,${.35*nf})`);
        for(let k=0;k<2;k++){const ph=(tt*1.3+k*.5+x)%1;ctx.strokeStyle=`rgba(220,235,250,${.5*(1-ph)})`;ctx.lineWidth=.7;const [a,b]=P(x+(hA(k+x*9|0)-.5)*r,y+(hA(k*3+y*7|0)-.5)*r*.6);ctx.beginPath();ctx.ellipse(a,b,2+ph*7,1+ph*3.5,0,0,Math.PI*2);ctx.stroke();}}}
    // valla del fondo (y=0) y lateral (x=0): paneles con lona verde
    const lona=C('#3e6a4b'),post=C('#7d838c');
    qY(0.04,0,W,0,30,lona);qX(0.04,0,D,0,30,shade(lona,.9));
    for(let x=0;x<=W;x+=1.1){const [a,b]=P(x,.04,0),[,c]=P(x,.04,32);line([a,b],[a,c],post,1.4);}
    for(let y=0;y<=D;y+=1.1){const [a,b]=P(.04,y,0),[,c]=P(.04,y,32);line([a,b],[a,c],post,1.4);}
    ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=.5;ctx.beginPath();for(let z=6;z<30;z+=6){let a=P(.04,0,z),b=P(.04,D,z);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);a=P(0,.04,z);b=P(W,.04,z);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.stroke();
    // señales obligatorias en la valla lateral
    const sg=(y,bg,e,t)=>{const [a,b]=P(.06,y,20);circ(a,b,5.2,C(bg));emoji(e,a,b,6);txt(t,.06,y,9,'y',3.6,C('#f4f1ea'),800);};
    sg(1.4,'#2563a8','⛑️','CASCO');sg(2.2,'#2563a8','🦺','CHALECO');
    {const [a,b]=P(.06,.7,20);poly([[a,b-6],[a+6,b+4],[a-6,b+4]],C('#f2c230'));txt('!',.06,.7,19,'y',7,'#222');}
    qX(.06,.4,2.6,1.5,7.5,C('#f4f1ea'));txt(TXN.escenas.prohibido_el_paso,.06,1.5,4.5,'y',3.6,C('#c0392b'));
    // cartel de la promoción, sobre dos postes
    for(const y of [3.5,6.1]){const [a,b]=P(.1,y,0),[,c]=P(.1,y,24);line([a,b],[a,c],C('#5b6068'),2.2);}
    const xf=.12,y0=3.1,y1=6.5,z0=22,z1=66;
    qX(xf,y0,y1,z0,z1,C('#fbfaf6'));
    qX(xf,y0,y1,z0+30,z1,C('#bfe0f2'));// cielo
    qX(xf,y0,y1,z0,z0+8,C('#1f3b5b'));
    // edificio de lujo dibujado: bloques blancos con terrazas de cristal
    qX(xf,y0,y1,z0+24,z1,C('#bfe0f2'));
    qX(xf,5.8,6.4,z0+8,z0+36,C('#f5f2ea'));qX(xf,5.75,5.8,z0+8,z0+30,C('#e7e2d6'));
    for(let r=0;r<3;r++){qX(xf,5.85,6.35,z0+11+r*8,z0+14+r*8,C('#7fb2cf'));}
    qX(xf,3.2,3.6,z0+8,z0+10.5,C('#4fb3d9'));// piscina
    {const [a,b]=P(xf,3.4,z0+11),[,c]=P(xf,3.4,z0+26);line([a,b],[a,c],C('#7a5a3a'),1.5);circ(a-2,c,3.6,C('#3f8a3a'));circ(a+3,c+1,3.2,C('#58ac4e'));}
    txt(TXN.escenas.residencial_las_acacias,xf,4.45,z1-5,'y',4.2,C('#1f3b5b'));
    txt(TXN.escenas.viviendas_de_lujo,xf,4.45,z1-12,'y',7,C('#b8862b'));
    txt(TXN.escenas.aticos_con_piscina_desde_690_000,xf,4.45,z0+4,'y',3.4,C('#fbfaf6'),800);
    if(parada){// cinta y pintada
      poly([P(xf+.01,y0,z0+30),P(xf+.01,y1,z0+12),P(xf+.01,y1,z0+3),P(xf+.01,y0,z0+21)],C('#d1242f'));
      {const [a,b]=P(xf+.01,(y0+y1)/2,z0+22);ctx.save();ctx.translate(a,b+4);ctx.transform(1,-0.5,0,1,0,0);ctx.rotate(.2);ctx.font='900 6px Nunito, sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(TXN.escenas.obra_paralizada,0,0);ctx.restore();}
      txt(TXN.escenas.y_nuestros_sueldos,.06,1.6,14,'y',4.6,C('#222'),900);}
    if(mov>55&&!parada){qX(.06,.3,2.9,9,21,C('#fffdf8'));txt(TXN.escenas.ni_un_muerto_mas_en_el,.06,1.6,15,'y',3.6,C('#d1242f'));}
  };
  // ---- estructura de hormigón (fondo) ----
  const decor=()=>{
    const cx=[2.4,4.8,7.2],cy=[.8,2.8],H1=52,H2=104;
    // solera
    sBox(2.1,.5,7.5,3.1,0,3,C('#a6a399'));
    // planta baja: cerramiento trasero de ladrillo con hueco de ventana
    brickY(2.4,7.2,.85,3,H1);
    poly([P(3.2,.93,18),P(4.1,.93,18),P(4.1,.93,40),P(3.2,.93,40)],C('#3d3a36'));poly([P(5.6,.93,18),P(6.5,.93,18),P(6.5,.93,40),P(5.6,.93,40)],C('#3d3a36'));
    brickX(.9,2.8,2.45,3,H1);
    // material dentro
    sBox(5,1.6,5.7,2.2,3,12,C('#8f8c83'));
    for(const y of cy)for(const x of cx)col_(x,y,3,H1);
    // cerramiento delantero en construcción (hilada a hilada)
    const hFront=parada?14:Math.min(30,10+((tt*.6)%20));
    brickY(2.6,4.5,2.95,3,parada?14:22);if(!parada){const [a,b]=P(4.5+.1*Math.floor((tt*.6)%4),2.95,22);ctx.fillStyle=C('#b8603e');ctx.fillRect(a-3,b-4,6,4);}
    slab(2.1,.5,7.5,3.1,H1);
    // primera planta: muro trasero a medias, puntales bajo el forjado superior
    brickY(2.4,7.2,.85,H1+6,parada?H1+20:H1+36);
    if(!parada){ctx.strokeStyle=C('#b7bcc3');ctx.lineWidth=1;ctx.beginPath();for(let x=2.7;x<5.1;x+=.42)for(let y=1.1;y<2.8;y+=.55){const a=P(x,y,H1+6),b=P(x,y,H2);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.stroke();}
    // obrero encofrando en el forjado (Raúl / compi)
    const upW=!parada&&!lunch&&!nt;
    if(upW){ctx.save();ctx.translate(0,-(H1+6));sPerson(5.9,2.9,{...npc[6],shirt:'#5a7da8'},{act:'hammer',helmet:true,vest:true,front:true,right:false,name:null});ctx.restore();}
    for(const y of cy)for(const x of cx)col_(x,y,H1+6,parada?H1+16:H2);
    if(!parada){slab(2.1,.5,5.1,3.1,H2);// segundo forjado a medias, con encofrado
      sBox(5.1,.5,7.5,3.1,H2,H2+2,C('#c79a5e'));}
    // esperas (armaduras) que asoman
    ctx.strokeStyle=C(parada?'#8a4a2a':'#6b4b3a');ctx.lineWidth=1;ctx.beginPath();
    for(const y of cy)for(const x of cx){const z0=parada?H1+16:(x<5?H2+6:H2);for(const [dx,dy] of [[-.07,-.07],[.07,-.07],[-.07,.07],[.07,.07]]){const a=P(x+dx,y+dy,z0),b=P(x+dx*1.4,y+dy*1.4,z0+14);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}}
    ctx.stroke();
    // barandilla de seguridad en el borde del primer forjado
    {const yb=3.08,rc=C('#e8c22e');for(let x=2.2;x<=7.5;x+=.75){const a=P(x,yb,H1+6),b=P(x,yb,H1+22);line(a,b,C('#5b6068'),1);}
      for(const z of [H1+14,H1+22]){line(P(2.1,yb,z),P(7.5,yb,z),rc,1.4);}
      // red de seguridad roja/naranja
      poly([P(2.1,3.1,H2+6),P(5.1,3.1,H2+6),P(5.1,3.1,H2+20),P(2.1,3.1,H2+20)],parada?'rgba(0,0,0,0)':'rgba(230,90,40,.35)');}
    // andamio en el lateral derecho (x≈7.6..8.3)
    {const x0=7.6,x1=8.3,y0=.5,y1=3.1,top=parada?60:H2+8,pc=C('#8a8f98');
      for(const x of [x0,x1])for(let y=y0;y<=y1+.01;y+=1.3){const a=P(x,y,0),b=P(x,y,top);line(a,b,pc,1.6);}
      for(let z=26;z<=top;z+=26){sBox(x0,y0,x1,y1,z-2,z,C('#b8925a'));line(P(x1,y0,z+10),P(x1,y1,z+10),pc,1);}
      for(let z=0;z<top-26;z+=26)line(P(x1,y0,z),P(x1,y0+1.3,z+26),pc,.8);
      if(upW){ctx.save();ctx.translate(0,-52);sPerson(7.95,1.7,{...npc[10],shirt:'#c0504d'},{act:'paint',helmet:true,vest:true,front:false,right:true});ctx.restore();}
      // tubo de escombros (bajante)
      if(!parada){for(let k=0;k<5;k++)cyl(8.45,2.6,.17,k*18+2,k*18+18,C(['#e0632b','#f0b429'][k%2]));sBox(8.2,2.3,9.0,3.3,0,14,C('#c7cbd1'));}}
    // grúa torre
    const gx=9.35,gy=1.0,GH=168,yc=C('#f2c230');
    sBox(gx-.35,gy-.35,gx+.35,gy+.35,0,8,C('#9a978e'));
    {const r=.16,pts=[[gx-r,gy-r],[gx+r,gy-r],[gx+r,gy+r],[gx-r,gy+r]];ctx.strokeStyle=yc;ctx.lineWidth=1.3;ctx.beginPath();for(const [x,y] of pts){const a=P(x,y,8),b=P(x,y,GH);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}
      ctx.lineWidth=.7;for(let z=8;z<GH;z+=12){let a=P(gx-r,gy+r,z),b=P(gx+r,gy+r,z+12);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);a=P(gx+r,gy+r,z+12);b=P(gx+r,gy-r,z+24>GH?GH:z+24);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.stroke();}
  };
  // ---- elementos del solar ----
  // palés
  add(2.0,6.0,()=>pale(1.55,5.55,'lad'));if(!parada){add(2.7,4.0,()=>pale(2.25,3.55,'lad'));add(3.3,7.0,()=>pale(2.6,6.5,'sac'));add(9.6,4.3,()=>pale(9.1,3.8,'blq'));}
  else{add(3.3,7.0,()=>{pale(2.6,6.5,'sac');tufts(.6,5.8,3);});add(4,6,()=>{tufts(3.6,5.6,4);tufts(6.2,6.4,3);tufts(8.8,3.6,3);});}
  // montón de arena y grava
  add(5.9,5.9,()=>{for(const [x,y,r,hh,c] of [[5.6,6.3,.75,16,'#d8b77a'],[4.6,6.9,.55,11,'#9c9890']]){const [a,b]=P(x,y);const rx=r*TW*.7071,ry=r*TH*.7071;const g=ctx.createLinearGradient(a-rx,0,a+rx,0);g.addColorStop(0,shade(C(c),1.08));g.addColorStop(1,shade(C(c),.72));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a-rx,b);ctx.quadraticCurveTo(a-rx*.4,b-hh*1.2,a,b-hh);ctx.quadraticCurveTo(a+rx*.4,b-hh*1.2,a+rx,b);ctx.ellipse(a,b,rx,ry,0,0,Math.PI);ctx.fill();}
    if(snow){const [a,b]=P(5.6,6.3);ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.ellipse(a,b-13,10,4,0,0,Math.PI*2);ctx.fill();}});
  // hormigonera
  add(8.6,5.0,()=>{const x=8.6,y=5.0;
    sBox(x-.35,y-.12,x+.35,y+.12,4,9,C('#3b3f46'));
    for(const s of [-1,1]){const [a,b]=P(x+s*.32,y+.15,4);ctx.fillStyle='#1f1f22';ctx.beginPath();ctx.ellipse(a,b,2.6,4,0,0,Math.PI*2);ctx.fill();}
    sBox(x+.15,y-.1,x+.4,y+.15,9,18,C('#5c6168'));// motor
    const [a,b]=P(x,y,24);ctx.save();ctx.translate(a,b);ctx.rotate(-.55);
    ctx.fillStyle=C('#e2622a');ctx.beginPath();ctx.moveTo(-9,-8);ctx.lineTo(7,-11);ctx.quadraticCurveTo(15,0,7,11);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();
    ctx.save();ctx.clip();const spin=working?tt*3.2:.4;ctx.strokeStyle=C('#a8441a');ctx.lineWidth=1.6;for(let k=0;k<4;k++){const ang=spin+k*Math.PI/2;const c=Math.cos(ang);if(c<0)continue;const yy=Math.sin(ang)*10;ctx.globalAlpha=.4+c*.6;ctx.beginPath();ctx.moveTo(-10,yy*.75);ctx.lineTo(12,yy);ctx.stroke();}ctx.globalAlpha=1;ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(-8,-6,14,2);
    ctx.fillStyle=C('#2a2622');ctx.beginPath();ctx.ellipse(-9.5,0,2.6,7.6,0,0,Math.PI*2);ctx.fill();
    if(working){ctx.fillStyle='#8d8a82';ctx.beginPath();ctx.ellipse(-9.5,1.5+Math.sin(tt*3)*1,1.6,4,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    // volante
    const [va,vb]=P(x-.2,y+.15,22);ctx.strokeStyle=C('#3b3f46');ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(va+6,vb+2,3,4.5,0,0,Math.PI*2);ctx.stroke();
    if(rain||snow){}});
  // caseta de obra y WC químico
  add(10.6,3.4,()=>{const x0=9.9,x1=10.95,y0=1.7,y1=3.4;sBox(x0,y0,x1,y1,0,40,C('#e8e6e0'));
    for(let y=y0+.1;y<y1;y+=.18){line(P(x1,y,1),P(x1,y,39),C('#cfcdc6'),.6);}
    qX(x1+.01,1.9,2.4,1,30,C('#7c8a99'));// puerta
    qY(y1+.01,x0+.2,x0+.8,18,31,nt?C('#f2c46a'):C('#9cc6df'));
    qY(y1+.01,x0+.1,x1-.1,33,38,C('#2563a8'));txt(TXN.escenas.oficina_de_obra,(x0+x1)/2,y1+.01,35.5,'x',3.4,'#fff',900);});
  add(10.6,4.1,()=>{const x=10.3,y=3.75;sBox(x,y,x+.6,y+.6,0,44,C('#2f6fb5'));sBox(x-.03,y-.03,x+.63,y+.63,44,47,C('#e8e6e0'));qX(x+.61,y+.12,y+.48,6,38,C('#285f9c'));txt('WC',x+.61,y+.3,32,'y',4,'#fff');});
  // contenedor de escombros
  add(4.4,7.5,()=>{const x0=3.6,x1=5.2,y0=7.15,y1=7.85;sBox(x0,y0,x1,y1,0,16,C('#e2a320'));sBox(x0-.04,y0-.04,x1+.04,y0+.04,16,18,C('#c48a15'));
    for(let k=0;k<9;k++){const x=x0+.15+hA(k*5)*(x1-x0-.3),y=y0+.12+hA(k*7)*(y1-y0-.24);sBox(x-.1,y-.08,x+.1,y+.08,14,17+hA(k)*5,C(['#9c9890','#b8603e','#7a6a5a','#c9c3b8'][k%4]));}
    txt(TXN.escenas.contenedores_garcia,(x0+x1)/2,y1,8,'x',3.2,C('#3b2a10'),900);});
  // puntales y tubos tirados
  add(7.6,7.0,()=>{for(let k=0;k<6;k++){const y=6.75+k*.07;sBox(6.4,y,8.6,y+.05,k%2*1.6,k%2*1.6+1.6,C(k%3?'#c0392b':'#9aa3ad'));}});
  // valla móvil de malla en los bordes delanteros (se ve a través)
  add(W+D,0,()=>{const mesh='rgba(70,75,85,.35)',post=C('#8a8f98');ctx.lineWidth=.5;ctx.strokeStyle=mesh;ctx.beginPath();
    for(let x=0;x<=W;x+=.25){const a=P(x,D,2),b=P(x,D,28);ctx.moveTo(...a);ctx.lineTo(...b);}for(let y=0;y<=D;y+=.25){const a=P(W,y,2),b=P(W,y,28);ctx.moveTo(...a);ctx.lineTo(...b);}
    for(const z of [2,15,28]){let a=P(0,D,z),b=P(W,D,z);ctx.moveTo(...a);ctx.lineTo(...b);a=P(W,0,z);b=P(W,D,z);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();
    for(let x=0;x<=W+.01;x+=1.1){sBox(x-.15,D-.08,x+.15,D+.08,0,3,C('#b0aca2'));ln2(P(x,D,0),P(x,D,30),post);}
    for(let y=0;y<=D+.01;y+=1.1){sBox(W-.08,y-.15,W+.08,y+.15,0,3,C('#b0aca2'));ln2(P(W,y,0),P(W,y,30),post);}
    // lona publicitaria en la valla delantera
    poly([P(5.6,D+.01,6),P(8.2,D+.01,6),P(8.2,D+.01,24),P(5.6,D+.01,24)],C('#1f3b5b'));txt(TXN.escenas.promociones_atico_s_l,6.9,D+.02,17,'x',3.8,C('#e8c36a'));txt(TXN.escenas.tu_casa_nuestra_inversion,6.9,D+.02,11,'x',2.8,C('#fbfaf6'),800);});
  // ---- gente ----
  const crew=(k,o)=>({...npc[k],...o});
  let ana;
  if(parada){
    ana={x:5.2,y:4.6,pose:'stand',act:'talk',front:true,right:true,helmet:true,vest:true,sad:true};
    add(6.1,4.2,()=>sPerson(6.1,4.2,crew(2,{}),{act:'talk',front:true,right:false,helmet:true,vest:true,mood:25,sad:true,name:cp?cp.n:null}));
    // un vigilante de seguridad junto a la caseta
    add(9.5,4.3,()=>sPerson(9.5,4.3,crew(9,{shirt:'#2d3a4f',pants:'#2d3a4f'}),{act:'phone',front:true,right:false}));
  }else if(lunch){
    // almuerzo: sentados en los palés, bocadillo
    ana={x:3.2,y:5.6,pose:'sit',act:'eat',front:true,right:true,helmet:true,vest:true};
    const seat=(x,y,c)=>add(x-.02,y-.02,()=>sBox(x-.22,y-.22,x+.22,y+.22,0,8,C(c)));seat(3.2,5.6,'#b0b0a8');seat(4.0,5.3,'#3d6fb0');seat(2.1,6.2,'#b0b0a8');seat(4.6,4.4,'#b08a58');
    add(4.0,5.3,()=>sPerson(4.0,5.3,crew(2,{}),{pose:'sit',act:'talk',front:true,right:false,helmet:true,vest:true,name:cp?cp.n:null}));
    add(2.1,6.2,()=>sPerson(2.1,6.2,crew(8,{}),{pose:'sit',act:'eat',front:true,right:true,vest:true}));
    add(4.6,4.4,()=>sPerson(4.6,4.4,crew(5,{}),{pose:'sit',act:'phone',front:true,right:false,vest:true}));
    add(3.7,5.0,()=>{const [a,b]=P(3.6,5.0,2);ctx.fillStyle='#2e7d32';ctx.fillRect(a-1.5,b-9,3,9);ctx.fillStyle='#1b5e20';ctx.fillRect(a-.8,b-11,1.6,2);});
  }else if(nt){
    ana={x:6.8,y:4.7,pose:'stand',act:'dig',front:true,right:true,helmet:true,vest:true};
    add(4.2,4.1,()=>sPerson(4.2,4.1,crew(2,{}),{act:'hammer',front:false,right:false,helmet:true,vest:true,name:cp?cp.n:null}));
  }else{
    // Ana echando arena a la hormigonera
    ana={x:7.0,y:4.85,pose:'stand',act:'dig',front:true,right:true,helmet:true,vest:true};
    // paleta levantando el cerramiento de planta baja (compi)
    add(3.6,3.75,()=>sPerson(3.6,3.75,crew(2,{}),{act:'hammer',front:false,right:false,helmet:true,vest:true,name:cp?cp.n:null}));
    // peón con carretilla, ida y vuelta
    {const T=(tt*.09)%2,f=T<1?T:2-T,dir=T<1?1:-1,x=2.4+f*3.6,y=4.75;
      add(x+.01,y,()=>{if(dir<0)carretilla(x-.5,y,-1,null);sPerson(x,y,crew(8,{}),{pose:'walk',ph:tt*6,front:dir>0,right:dir>0,helmet:true,vest:true});if(dir>0)carretilla(x+.5,y,1,'#b8b5ab');});}
    // encargado con planos
    add(5.0,3.6,()=>sPerson(5.0,3.6,crew(11,{shirt:'#eef1f4',pants:'#3b4a63'}),{act:'book',front:true,right:true,helmet:true}));
    // cortando ladrillo con la radial (chispas)
    add(2.2,6.9,()=>{sPerson(2.2,6.9,crew(4,{}),{act:'stir',front:true,right:true,helmet:true,vest:true});const [a,b]=P(2.55,6.95,12);for(let k=0;k<6;k++){const an=-.6+hA(k+((tt*20)|0)*7)*1.2,l=4+hA(k*3+((tt*20)|0))*8;ctx.strokeStyle=`rgba(255,${180+k*10},60,.85)`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a+Math.cos(an)*l,b-Math.sin(an)*l*.6);ctx.stroke();}});
  }
  // cascos y botellas sueltos
  add(9.2,6.6,()=>{casco(9.1,6.7,1);const [a,b]=P(8.9,6.5,0);ctx.fillStyle='rgba(200,230,255,.8)';ctx.fillRect(a-1.2,b-7,2.4,7);ctx.fillStyle='#2563a8';ctx.fillRect(a-1.2,b-8,2.4,1.4);});
  if(!parada)add(3.9,6.9,()=>carretilla(3.7,6.9,-1,'#9c9890'));
  // ---- capa final: brazo de la grúa, carga, lluvia, focos ----
  const after=()=>{
    const gx=9.35,gy=1.0,GH=168,yc=C('#f2c230');
    const th=2.6+(working?Math.sin(tt*.11)*.55:parada?.25:.1);
    const dx=Math.cos(th),dy=Math.sin(th),L=7.2,Lc=2.3;
    const J=(r,z)=>P(gx+dx*r,gy+dy*r,z);
    // cabina y corona
    sBox(gx-.25,gy-.25,gx+.25,gy+.25,GH,GH+8,C('#e0b020'));
    // cúspide
    const top=P(gx,gy,GH+38);line(P(gx,gy,GH+8),top,yc,1.8);
    // pluma (celosía)
    ctx.strokeStyle=yc;ctx.lineWidth=1.3;ctx.beginPath();let a=J(0,GH+8),b=J(L,GH+8);ctx.moveTo(...a);ctx.lineTo(...b);a=J(0,GH+15);b=J(L,GH+11);ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
    ctx.lineWidth=.6;ctx.beginPath();for(let r=0;r<L;r+=.4){const p1=J(r,GH+8),p2=J(r+.2,GH+15-(r+.2)/L*4),p3=J(r+.4,GH+8);ctx.moveTo(...p1);ctx.lineTo(...p2);ctx.lineTo(...p3);}ctx.stroke();
    // contrapluma y contrapeso
    line(J(0,GH+10),J(-Lc,GH+10),yc,2.2);{const [c1,c2]=J(-Lc+.3,GH+4);ctx.fillStyle=C('#9a978e');ctx.fillRect(c1-6,c2-4,12,9);ctx.fillStyle=C('#d1242f');ctx.fillRect(c1-6,c2-4,12,2);}
    // tirantes
    line(top,J(L*.65,GH+13),C('#555a60'),.6);line(top,J(-Lc,GH+10),C('#555a60'),.6);
    // carro, cable y carga
    const rr=parada?2.2:3.2+Math.sin(tt*.17)*1.6;const zl=parada?GH-14:128+Math.sin(tt*.23)*22;
    const tr=J(rr,GH+8);ctx.fillStyle='#333';ctx.fillRect(tr[0]-2,tr[1]-1,4,3);
    const ld=P(gx+dx*rr,gy+dy*rr,zl);line(tr,[ld[0],ld[1]-8],'#333',.6);
    ctx.fillStyle='#333';ctx.fillRect(ld[0]-1.5,ld[1]-9,3,3);
    if(!parada&&!nt){const x=gx+dx*rr,y=gy+dy*rr;line([ld[0],ld[1]-8],P(x-.3,y-.3,zl-2),'#444',.5);line([ld[0],ld[1]-8],P(x+.3,y+.3,zl-2),'#444',.5);sBox(x-.3,y-.3,x+.3,y+.3,zl-14,zl-2,C('#c4673f'));sBox(x-.32,y-.32,x+.32,y+.32,zl-17,zl-14,C('#b08a58'));}
    // baliza roja en la punta
    if(night>.3&&(tt%1.6)<.8){const p=J(L,GH+12);circ(p[0],p[1],2.2,'#ff3b30');circ(p[0],p[1],6,'rgba(255,59,48,.25)');}
    // focos de obra de noche
    if(night>.3){ctx.save();ctx.globalCompositeOperation='lighter';
      for(const [fx,fy,fz,tx,ty,r] of [[7.2,3.0,48,6.4,5.0,2.6],[2.4,3.0,48,3.6,5.2,2.2]]){const [p1,p2]=P(fx,fy,fz),[q1,q2]=P(tx,ty,0);
        const g=ctx.createRadialGradient(q1,q2,2,q1,q2,r*TW*.6);g.addColorStop(0,`rgba(255,220,150,${.32*night})`);g.addColorStop(1,'rgba(255,220,150,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q1,q2,r*TW*.6,r*TH*.6,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgba(255,235,190,${.10*night})`;ctx.beginPath();ctx.moveTo(p1,p2);ctx.lineTo(q1-r*TW*.45,q2);ctx.lineTo(q1+r*TW*.45,q2);ctx.closePath();ctx.fill();}
      ctx.restore();for(const [fx,fy,fz] of [[7.2,3.0,48],[2.4,3.0,48]]){const [p1,p2]=P(fx,fy,fz);ctx.fillStyle='#fff6d8';ctx.fillRect(p1-3,p2-2,6,4);}}
    // lluvia / nieve
    if(rain||snow){const [l]=P(0,D),[r]=P(W,0);ctx.strokeStyle=snow?'rgba(255,255,255,.85)':'rgba(205,220,240,.7)';ctx.fillStyle='rgba(255,255,255,.9)';ctx.lineWidth=.8;ctx.beginPath();
      for(let k=0;k<140;k++){const x=l+hA(k*7+1)*(r-l),sp=snow?30:420,yy=((hA(k*13+3)*560+tt*sp)%560)-260;if(snow){ctx.moveTo(x+Math.sin(tt+k)*3+1.2,yy);ctx.arc(x+Math.sin(tt+k)*3,yy,1.2,0,Math.PI*2);}else{ctx.moveTo(x,yy);ctx.lineTo(x-3,yy+10);}}
      snow?ctx.fill():ctx.stroke();}
  };
  return {W,D,floor:'#a48b67',wall:'#bdb6aa',out:true,tile:false,drawBase,decor,items:it,ana,after};
};
// Escena: parque
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Parque del Río: paseo de tierra junto al río, fuente, columpios, quiosco con terraza.
SCENES['parque']=function(E){
  const {tt,night,act,w,npc}=E;const h=E.h??12;const hs=i=>Math.abs(hash(i));const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=12,D=9;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta',snow=wk==='nieve'||(S.snow||0)>0;
  const se=seasonOf(),cr=w.crisis||0,mov=w.mov||0,day=S.day||0;
  const wkend=(()=>{try{return dayType(day)!=='work';}catch(e){return false;}})();
  const tc={};const T=c=>{if(tc[c])return tc[c];let r=c;if(r[0]!=='#'){const m=r.match(/[\d.]+/g);r='#'+m.slice(0,3).map(v=>(Math.max(0,Math.min(255,+v|0))).toString(16).padStart(2,'0')).join('');}if(rain)r=mixHex(r,'#7a828e',.25);if(night>0)r=mixHex(r,'#151b38',night*.55);return tc[c]=r;};
  const dark=night>.5,bad=rain||wk==='nieve',busy=!bad&&!dark;
  const manif=(w.manif&&w.manif.day===day)||(mov>60&&hs(day*31+7)<.6&&h>=11&&h<21&&!rain);
  // ---------- ayudas ----------
  const shadowAt=(x,y,r)=>{if(night>.7)return;const [px,py]=P(x,y);ctx.save();ctx.translate(px,py);ctx.scale(1,.5);ctx.fillStyle=`rgba(30,40,20,${.18*(1-night)})`;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.restore();};
  const tree=(x,y,s,k)=>{const [px,py]=P(x,y);shadowAt(x,y,20*s);const sw=Math.sin(tt*.9+k)*1.2;
    capsule(px,py,px+sw*.3,py-26*s,5*s,T('#6b4a2e'));capsule(px,py-16*s,px-7*s,py-26*s,2.4*s,T('#6b4a2e'));capsule(px,py-18*s,px+8*s,py-28*s,2.2*s,T('#6b4a2e'));
    if(se==='inv'&&!snow){for(let j=0;j<5;j++){const a=-2.6+j*.55;capsule(px,py-24*s,px+Math.cos(a)*16*s+sw,py-24*s+Math.sin(a)*16*s,1.4*s,T('#5a3e28'));}return;}
    const pal={pri:['#4f9e45','#6dbd5a','#f2b8c6'],ver:['#3a7f36','#4f9a43','#5daa4e'],oto:['#c8692c','#e0a03a','#b5502a'],inv:['#4a6e44','#5c7f52','#6a8a5e']}[se];
    const bl=[[0,-38,15],[-10,-32,11],[10,-31,11],[-4,-46,10],[6,-44,9],[0,-30,12]];
    for(let j=0;j<bl.length;j++){const [dx,dy,r]=bl[j];circ(px+dx*s+sw*(1+dy/-40),py+dy*s,r*s,T(j%2?pal[0]:pal[1]));}
    ctx.globalAlpha=.35;circ(px-5*s+sw,py-44*s,6*s,T('#ffffff'));ctx.globalAlpha=1;
    if(se==='pri')for(let j=0;j<6;j++)circ(px+(hs(k*9+j)-.5)*26*s,py-(28+hs(k*5+j)*20)*s,1.6*s,T(pal[2]));
    if(snow){ctx.fillStyle='rgba(250,252,255,.9)';for(const [dx,dy,r] of [[0,-50,9],[-10,-41,6],[10,-40,6]]){ctx.beginPath();ctx.ellipse(px+dx*s,py+dy*s,r*s,r*.45*s,0,Math.PI,0);ctx.fill();}}};
  const kid=(x,y,ch,o,z=0)=>{const [px,py]=P(x,y,z);const [qx,qy]=P(x,y);ctx.save();ctx.translate(px,py);ctx.scale(.66,.66);ctx.translate(-qx,-qy);sPerson(x,y,ch,o);ctx.restore();};
  const umb=(px,py,col)=>{capsule(px+4,py-30,px+4,py-62,1,'#2b2b33');ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(px-13,py-57);ctx.quadraticCurveTo(px+4,py-76,px+21,py-57);
    for(let j=3;j>=0;j--){const a=px-13+j*8.5;ctx.quadraticCurveTo(a+4.2,py-60,a,py-57);}ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.moveTo(px+4,py-72);ctx.quadraticCurveTo(px-6,py-68,px-9,py-58);ctx.lineTo(px-4,py-58);ctx.closePath();ctx.fill();};
  const walker=(x,y,ch,o,um)=>{sPerson(x,y,ch,o);if(um){const [px,py]=P(x,y);umb(px,py,um);}};
  const dog=(x,y,col,ph,right)=>{const [px,py]=P(x,y);ctx.save();ctx.translate(px,py);if(!right)ctx.scale(-1,1);ctx.fillStyle='rgba(20,20,40,.18)';ctx.beginPath();ctx.ellipse(0,0,8,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=shade(col,.7);ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();for(const [lx,o] of [[-5,0],[-3,Math.PI],[4,Math.PI],[6,0]]){const a=Math.sin(ph+o)*.5;ctx.moveTo(lx,-6);ctx.lineTo(lx+Math.sin(a)*4,0);}ctx.stroke();
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,-7.5,7.5,3.6,0,0,Math.PI*2);ctx.fill();circ(7.5,-11,3.4,col);ctx.beginPath();ctx.ellipse(10.5,-10,2.4,1.6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=shade(col,.6);ctx.beginPath();ctx.ellipse(6,-12.5,1.4,3,.4,0,Math.PI*2);ctx.fill();circ(12.6,-10.5,.9,'#111');circ(8.4,-12,.6,'#111');
    capsule(-7,-8,-11,-12+Math.sin(ph*2)*2,1.6,col);ctx.restore();};
  const leash=(x,y,dx,dy,right)=>{const [a,b]=P(x,y);const [c,d]=P(dx,dy);ctx.strokeStyle='#c0392b';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a+(right?5:-5),b-26);ctx.quadraticCurveTo((a+c)/2,(b+d)/2-6,c+(right?6:-6),d-11);ctx.stroke();};
  const bench=(x,y,col)=>{const c=T(col||'#8a5a3a'),ir=T('#2f3338');for(const xx of [x+.1,x+1.4]){sBox(xx,y+.25,xx+.08,y+.75,0,9,ir);sBox(xx,y+.2,xx+.08,y+.28,9,20,ir);}
    for(let j=0;j<3;j++)sBox(x,y+.3+j*.15,x+1.6,y+.42+j*.15,8,9.5,j%2?shade(c,.92):c);for(let j=0;j<2;j++)sBox(x,y+.18,x+1.6,y+.26,12+j*4,14.5+j*4,c);};
  const lamp=(x,y)=>{const [px,py]=P(x,y),[tx,ty]=P(x,y,46);capsule(px,py,tx,ty,2.2,T('#2c3036'));capsule(tx,ty,tx+6,ty-2,1.6,T('#2c3036'));ctx.fillStyle=T('#2c3036');ctx.beginPath();ctx.moveTo(tx+2,ty-1);ctx.lineTo(tx+10,ty-3);ctx.lineTo(tx+9,ty+3);ctx.lineTo(tx+3,ty+3);ctx.fill();
    ctx.fillStyle=night>.3?'#ffe7a0':'#d9d6c8';ctx.fillRect(tx+3.5,ty+2,5,2);};
  const lampsAt=[[1.4,2.05],[5,2.05],[8.6,2.05],[11.5,2.05],[4.5,5],[7.9,7.6],[9.2,4.3]];
  const banner=(x0,x1,y,z,txt,bg,fg)=>{const [a,b]=P(x0,y,0),[c,d]=P(x1,y,0);capsule(a,b,a,b-z-12,1.4,'#6b4a2e');capsule(c,d,c,d-z-12,1.4,'#6b4a2e');
    poly([P(x0,y,z),P(x1,y,z),P(x1,y,z+12),P(x0,y,z+12)],bg);const [m,n]=P((x0+x1)/2,y,z+6);ctx.save();ctx.translate(m,n);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle=fg;ctx.font='900 6.5px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,0,0);ctx.restore();};
  const tableT=(x,y)=>{cyl(x,y,.05,0,14,T('#3b3f46'));cyl(x,y,.34,14,15.5,T('#cfd3d6'),T('#e8ebed'));};
  const chairT=(x,y,f)=>{const c=T('#b9bec4');sBox(x-.15,y-.15,x+.15,y+.15,7,8.5,c);if(f)sBox(x-.15,y-.17,x+.15,y-.12,8.5,17,c);else sBox(x-.17,y-.15,x-.12,y+.15,8.5,17,c);};
  const drink=(x,y,c)=>{const [px,py]=P(x,y,15.5);ctx.fillStyle=c;ctx.fillRect(px-1.4,py-6,2.8,6);ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(px-1.4,py-6.5,2.8,1.4);};
  // ---------- suelo ----------
  const lawn=snow?'#e9eef2':{pri:'#86c06c',ver:'#7aa94f',oto:'#93a858',inv:'#7f9a68'}[se];
  const drawBase=()=>{
    prism(0,0,W,D,-26,0,T('#6d5c4a'));topQuad(0,0,W,D,0,T(lawn));
    // briznas de hierba
    ctx.strokeStyle=T(shade(lawn,.82));ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<170;k++){const x=hs(k*3+1)*W,y=2+hs(k*7+2)*(D-2);const [a,b]=P(x,y);ctx.moveTo(a,b);ctx.lineTo(a+1,b-3);ctx.moveTo(a+2,b);ctx.lineTo(a+2.6,b-2.4);}ctx.stroke();
    if(cr>60){ctx.fillStyle=T('#a3a35a');for(let k=0;k<14;k++){const [a,b]=P(hs(k*5)*W,3.4+hs(k*11)*5);ctx.beginPath();ctx.ellipse(a,b,10,4,0,0,Math.PI*2);ctx.fill();}}
    // orilla de enfrente y río
    topQuad(0,0,W,.7,0,T(snow?'#e3e8ec':shade(lawn,.9)));
    faceY(0,W,.7,-9,0,T('#9c9384'));ctx.strokeStyle=T('#857c6e');ctx.lineWidth=.6;ctx.beginPath();for(let x=0;x<W;x+=.5){const a=P(x,.7,0),b=P(x,.7,-9);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();
    const wcol=rain?'#5f7f8e':night>.5?'#1d3550':'#4d9bc4';
    const g=ctx.createLinearGradient(...P(0,.7,-6),...P(0,2,-6));g.addColorStop(0,T(shade(wcol,.8)));g.addColorStop(1,T(wcol));
    poly([P(0,.7,-6),P(W,.7,-6),P(W,2,-6),P(0,2,-6)],g);
    // brillos que corren con la corriente
    for(let k=0;k<26;k++){const y=.85+hs(k*17)*1.05,x=((hs(k*5+3)*W+tt*(.35+hs(k)*.3))%W);const al=.25+.55*Math.abs(Math.sin(tt*2+k));const [a,b]=P(x,y,-6);
      ctx.strokeStyle=night>.5?`rgba(255,220,140,${al*.6})`:`rgba(255,255,255,${al*(rain?.4:.85)})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a+5+hs(k)*5,b+2.5);ctx.stroke();}
    if(night>.5)for(const [lx] of lampsAt.slice(0,4)){const [a,b]=P(lx+.15,1.6,-6);const gg=ctx.createLinearGradient(a,b-6,a,b+10);gg.addColorStop(0,'rgba(255,215,130,0)');gg.addColorStop(.5,'rgba(255,215,130,.35)');gg.addColorStop(1,'rgba(255,215,130,0)');ctx.fillStyle=gg;ctx.fillRect(a-2+Math.sin(tt*3+lx)*1.5,b-8,5,18);}
    if(rain){ctx.strokeStyle='rgba(220,235,245,.5)';ctx.lineWidth=.6;for(let k=0;k<18;k++){const x=hs(k*13)*W,y=.8+hs(k*29)*1.1,r=((tt*1.4+hs(k*3))%1);const [a,b]=P(x,y,-6);ctx.beginPath();ctx.ellipse(a,b,r*6,r*3,0,0,Math.PI*2);ctx.stroke();}}
    // pretil de piedra de la orilla de aquí
    sBox(0,1.95,W,2.15,-6,2,T('#b8b0a0'));
    // paseo de tierra
    const pth=T(snow?'#d9d4cc':rain?'#a8916b':'#d6bf8e');
    poly([P(0,2.2,0),P(W,2.2,0),P(W,3.35,0),P(0,3.35,0)],pth);
    poly([P(5.5,3.35,0),P(6.6,3.35,0),P(6.6,D,0),P(5.5,D,0)],pth);
    isoEll(6.05,6.3,0,1.75,pth);
    ctx.fillStyle=T(shade('#d6bf8e',.85));for(let k=0;k<90;k++){const x=hs(k*7+5)*W,y=2.25+hs(k*13+1)*1.05;const [a,b]=P(x,y);ctx.fillRect(a,b,1.3,1);}
    for(const [x0,x1,y] of [[0,W,2.2],[0,5.5,3.35],[6.6,W,3.35]]){ctx.strokeStyle=T('#b49c6c');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...P(x0,y));ctx.lineTo(...P(x1,y));ctx.stroke();}
    if(rain)for(const [x,y,r] of [[2.4,2.8,.3],[7.2,2.6,.38],[10.1,3,.25],[6,7.6,.3]]){isoEll(x,y,0,r,'rgba(150,165,180,.35)');isoEll(x+.05,y-.04,0,r*.45,'rgba(230,240,250,.3)');}
    // zona de juegos: suelo de caucho
    poly([P(.5,5.2,0),P(4.3,5.2,0),P(4.3,8.6,0),P(.5,8.6,0)],T(snow?'#e0dcd8':'#c76b4a'));
    ctx.strokeStyle=T('#a9563a');ctx.lineWidth=.6;ctx.beginPath();for(let x=1;x<4.3;x+=.6){ctx.moveTo(...P(x,5.2));ctx.lineTo(...P(x,8.6));}ctx.stroke();
    sBox(.42,5.1,4.38,5.2,0,4,T('#6f7b5a'));
    // hojas secas y nieve
    if(se==='oto'&&!snow)for(let k=0;k<60;k++){const [a,b]=P(hs(k*3+2)*W,2.2+hs(k*19)*6.6);ctx.fillStyle=T(['#c8692c','#e0a03a','#a8452a'][k%3]);ctx.beginPath();ctx.ellipse(a,b,1.8,1,hs(k)*3,0,Math.PI*2);ctx.fill();}
  };
  // ---------- fondo: la ciudad al otro lado del río ----------
  const decor=()=>{
    for(let k=0;k<9;k++){const x0=k*1.35-.2,hh=34+hs(k*7+3)*46,c=T(mixHex(['#c9b8a8','#b8c2cc','#d4c4a8','#bfb3c2'][k%4],'#a9b8c8',.35));sBox(x0,-.55,x0+1.25,-.05,0,hh,c);
      for(let z=8;z<hh-6;z+=9)for(let j=0;j<3;j++){const lit=night>.4&&hs(k*31+z+j)<.45;poly([P(x0+.15+j*.38,-.05,z),P(x0+.38+j*.38,-.05,z),P(x0+.38+j*.38,-.05,z+5),P(x0+.15+j*.38,-.05,z+5)],lit?'#ffd88a':T('#8a99a8'));}}
    for(let k=0;k<11;k++){const [a,b]=P(.3+k*1.1,.4);capsule(a,b,a,b-8,2,T('#6b4a2e'));ctx.fillStyle=T(se==='inv'?'#7a6a58':se==='oto'?'#d0a040':'#4c8a44');ctx.beginPath();ctx.ellipse(a,b-22,5,15,0,0,Math.PI*2);ctx.fill();}
    // barandilla del paseo
    const ir=T('#3b4048');for(let x=.1;x<W;x+=.6){const [a,b]=P(x,2.1,2),[c,d]=P(x,2.1,15);capsule(a,b,c,d,1.1,ir);}
    ctx.strokeStyle=ir;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(...P(0,2.1,15));ctx.lineTo(...P(W,2.1,15));ctx.moveTo(...P(0,2.1,8));ctx.lineTo(...P(W,2.1,8));ctx.stroke();
    if(mov>55){banner(2.9,5.1,2.1,3,TXN.escenas.vivienda_digna_2,'#fffdf8','#c0392b');}
  };
  // ---------- mobiliario ----------
  for(const [x,y,s,k] of [[.6,4.3,1.05,1],[3.6,4.6,.9,2],[10.9,3.8,1.1,3],[8.3,8.4,1,4],[11.3,8,.9,5],[.5,8.9,.95,6],[7.6,4.4,.85,7],[4.9,8.8,.8,8]])add(x,y,()=>tree(x,y,s,k));
  for(const [x,y] of lampsAt)add(x,y,()=>lamp(x,y));
  // papeleras y fuente de beber
  add(4.2,3.6,()=>{cyl(4.2,3.6,.16,0,13,T('#3f6b4a'),T('#2b2b2b'));if(cr>60){for(let j=0;j<4;j++){const [a,b]=P(4.2+(hs(j)-.5)*.6,3.6+hs(j+3)*.5);ctx.fillStyle=T(['#f4f1ea','#d9534f','#c9b48a','#7cc8f0'][j]);ctx.fillRect(a-2,b-2,4,2.4);}}});
  add(7.2,3.6,()=>{cyl(7.2,3.6,.12,0,16,T('#5a6068'));const [a,b]=P(7.2,3.6,17);circ(a,b,2.5,T('#7a8088'));if(cr<=70&&!snow){ctx.strokeStyle='rgba(170,215,240,.8)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a+1,b-1);ctx.quadraticCurveTo(a+4,b-4,a+6,b+2);ctx.stroke();}});
  // fuente de la plaza
  add(6.05,6.3,()=>{cyl(6.05,6.3,.95,0,6,T('#c9c1b0'),T('#b8b0a0'));const dry=cr>70;cyl(6.05,6.3,.82,5,5.5,T(dry?'#a39a8a':'#5aa6cf'),T(dry?'#9a917e':'#6cb8de'));
    if(!dry){for(let k=0;k<6;k++){const a=k/6*Math.PI*2+tt*.3;const [x,y]=P(6.05+Math.cos(a)*.5,6.3+Math.sin(a)*.5,5.6);ctx.strokeStyle=`rgba(255,255,255,${.3+.3*Math.sin(tt*3+k)})`;ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(x,y,2+((tt+k)%1)*3,1+((tt+k)%1)*1.5,0,0,Math.PI*2);ctx.stroke();}}
    cyl(6.05,6.3,.14,5,20,T('#bdb5a4'));cyl(6.05,6.3,.38,20,22,T('#c9c1b0'),T(dry?'#a39a8a':'#6cb8de'));
    if(!dry){const [a,b]=P(6.05,6.3,22);ctx.fillStyle='rgba(200,230,250,.85)';for(let k=0;k<14;k++){const p=((tt*1.3+k/14)%1),ang=k*2.4;const r=p*12,yy=b-14*p+18*p*p;ctx.fillRect(a+Math.cos(ang)*r-.6,yy+Math.sin(ang)*r*.4,1.3,1.6);}circ(a,b-3,1.6,'rgba(220,240,255,.9)');}
    else{const [a,b]=P(6.05,7.1,8);label(TXN.escenas.fuente_sin_agua,a,b,'#fffdf8','#c0392b',6);}});
  // columpios
  const kidsOn=busy&&((wkend&&h>=10&&h<14)||(h>=17&&h<20.5))&&!snow&&cr<85;
  const swing=(k,x)=>{const th=kidsOn&&k===0?Math.sin(tt*2.2)*.55:kidsOn?Math.sin(tt*2.2+1.7)*.4:Math.sin(tt*.8+k)*.04;return [x,6.3+Math.sin(th)*.55,26-Math.cos(th)*20];};
  add(2,6.4,()=>{const ir=T('#d0453a');for(const x of [1.1,3])for(const dy of [-.45,.45]){const [a,b]=P(x,6.3+dy*1.3,0),[c,d]=P(x,6.3,27);capsule(a,b,c,d,2,ir);}
    capsule(...P(1.1,6.3,27),...P(3,6.3,27),2.2,T('#d0453a'));
    for(const [k,x] of [[0,1.6],[1,2.5]]){const [sx,sy,sz]=swing(k,x);ctx.strokeStyle=T('#8a8f98');ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...P(sx-.12,6.3,26));ctx.lineTo(...P(sx-.12,sy,sz));ctx.moveTo(...P(sx+.12,6.3,26));ctx.lineTo(...P(sx+.12,sy,sz));ctx.stroke();sBox(sx-.17,sy-.1,sx+.17,sy+.1,sz-1.5,sz,T('#2d2d33'));
      if(kidsOn&&(k===0||hs(day+3)<.6))kid(sx,sy,npc[(k*5+2)%12],{pose:'sit',front:true,right:true},sz);}});
  // tobogán
  add(3.5,7.8,()=>{const c=T('#f0b429');sBox(3.2,7.0,3.6,7.4,0,22,T('#3a7fb0'));sBox(3.2,7.0,3.6,7.4,22,23.5,c);for(let z=4;z<22;z+=5)sBox(3.15,7.38,3.65,7.45,z,z+1,T('#8a8f98'));
    poly([P(3.2,7.4,22),P(3.6,7.4,22),P(3.6,8.6,1),P(3.2,8.6,1)],c);poly([P(3.6,7.4,22),P(3.6,7.4,24),P(3.6,8.6,3),P(3.6,8.6,1)],T(shade('#f0b429',.75)));
    if(kidsOn){const p=(tt*.45)%1;const yy=7.4+p*1.2,zz=22-p*21;if(p<.85)kid(3.4,yy,npc[8],{pose:'sit',front:true,right:false,act:'cheer'},zz);}});
  // quiosco con terraza
  add(10,5.1,()=>{shadowAt(10,5.1,24);cyl(10,5.1,.75,0,4,T('#7a7f86'));cyl(10,5.1,.62,4,26,T('#2f6b4a'),T('#2f6b4a'));
    const lit=night>.3;for(let k=0;k<5;k++){const a=Math.PI*(.1+k*.22);const [x,y]=P(10+Math.cos(a)*.63,5.1+Math.sin(a)*.63,10);ctx.fillStyle=lit?'#ffd88a':T('#bfe3f7');ctx.fillRect(x-3.5,y-8,7,8);ctx.fillStyle=T('#e8e2d4');ctx.fillRect(x-4,y,8,1.5);}
    const [cx,cy]=P(10,5.1,26),[ax,ay]=P(10,5.1,40);const rx=.82*TW*.7071,ry=.82*TH*.7071;
    for(let k=0;k<16;k++){const a0=k/16*Math.PI*2,a1=(k+1)/16*Math.PI*2;if(Math.sin((a0+a1)/2)<-.2)continue;ctx.fillStyle=T(k%2?'#c0392b':'#f4f1ea');ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(cx+Math.cos(a0)*rx,cy+Math.sin(a0)*ry);ctx.lineTo(cx+Math.cos(a1)*rx,cy+Math.sin(a1)*ry);ctx.closePath();ctx.fill();}
    ctx.strokeStyle=T('#8a2a20');ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI);ctx.stroke();circ(ax,ay-1,2,T('#f0b429'));
    const [lx,ly]=P(10.55,5.75,15);label('QUIOSCO',lx,ly,lit?'#ffd88a':'#fffdf8','#2f3a2a',5.5);
  });
  if(!rain){add(10.5,5.9,()=>sPerson(10.5,5.9,{...npc[9],shirt:'#f4f1ea'},{act:'stir',front:true,right:false}));}
  const terraza=act==='amigos'&&(dark||hs(day*13+1)<.5||rain);
  const tabs=[[9.2,6.9],[10.9,7.0],[10.1,8.2]];
  for(let t=0;t<tabs.length;t++){const [x,y]=tabs[t];if(bad&&t>0)continue;
    add(x-.42,y,()=>chairT(x-.42,y,false));add(x+.42,y,()=>chairT(x+.42,y,false));add(x+.02,y+.08,()=>{tableT(x,y);drink(x-.1,y,'#f0c24a');drink(x+.12,y+.08,t%2?'#c0392b':'#f0c24a');});
    if(rain&&t===0){add(x-1.2,y-1.2,()=>{const [a,b]=P(x,y,0),[c,d]=P(x,y,64);capsule(a,b,c,d,1.5,'#ddd');ctx.fillStyle=T('#2f6b4a');ctx.beginPath();ctx.moveTo(c-36,d+9);ctx.lineTo(c,d-5);ctx.lineTo(c+36,d+9);ctx.closePath();ctx.fill();ctx.fillStyle=T('#f4f1ea');ctx.fillRect(c-36,d+9,72,2.5);});}
    const occ=(t===0&&terraza)?false:busy?hs(day+t*5)<.75:dark&&t===1;
    if(occ){add(x-.42,y,()=>sPerson(x-.42,y,npc[(t*3+1)%12],{pose:'sit',act:'talk',front:true,right:true}));add(x+.42,y,()=>sPerson(x+.42,y,npc[(t*3+5)%12],{pose:'sit',act:t%2?'eat':'phone',front:true,right:false}));}}
  // bancos
  add(2.6,3.6,()=>bench(2,3.35));add(8.6,3.6,()=>bench(8,3.35));add(7.5,8.6,()=>bench(6.9,8.2,'#6b5a4a'));
  // abuelos en su banco con palomas
  if(busy&&h<20&&cr<85){add(2.35,3.9,()=>sPerson(2.35,3.85,elder(1),{pose:'sit',act:'talk',front:true,right:true,shirt:'#7a6a5a'}));add(3.25,3.9,()=>{sPerson(3.25,3.85,elder(2),{pose:'sit',front:true,right:false,shirt:'#5a6a7a'});const [a,b]=P(3.55,3.95);capsule(a,b,a+3,b-20,1.4,'#6b4a2e');});
    for(let k=0;k<5;k++){const x=2.3+hs(k*3)*1.8+Math.sin(tt*.7+k)*.15,y=4.4+hs(k*5)*.7;add(x,y,()=>{const [a,b]=P(x,y);const pk=Math.abs(Math.sin(tt*4+k*1.7))>.8?2:0;ctx.fillStyle='#8a8f9e';ctx.beginPath();ctx.ellipse(a,b-3,3.2,2,0,0,Math.PI*2);ctx.fill();circ(a+(k%2?2.6:-2.6),b-5+pk,1.6,'#6f7486');ctx.fillStyle='#9fa6b8';ctx.fillRect(a-1,b-4,2,1);});}}
  // crisis: alguien durmiendo en el banco de la plaza
  if(cr>60)add(7.7,8.65,()=>{const [a,b]=P(7.7,8.6,9);ctx.fillStyle=T('#b89a6a');ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.fillRect(-22,-4,26,5);ctx.restore();ctx.fillStyle=T('#4a5a6a');ctx.beginPath();ctx.ellipse(a-6,b-6,13,5,.45,0,Math.PI*2);ctx.fill();circ(a+8,b-1,3.6,T('#6b4a3a'));});
  // ---------- gente que pasa ----------
  const W2=W+2,wrap=v=>((v%W2)+W2)%W2-1,vis=x=>x>.25&&x<W-.25;
  const pass=[];
  if(!dark&&!bad){pass.push({y:2.55,v:1.25,k:3,run:true,sh:'#e85d3f'},{y:3.05,v:-.42,k:5,dog:'#c9a06a'},{y:2.4,v:-.95,k:10,run:true,sh:'#2a9d8f'},{y:2.95,v:.38,k:11,elder:true});}
  else if(bad){pass.push({y:2.9,v:.5,k:4,um:'#3a5a8c'},{y:3.1,v:-.6,k:6,um:'#c0392b',dog:'#3b3030'});}
  else{pass.push({y:3.0,v:-.4,k:7,dog:'#e8e0d0'},{y:2.6,v:1.1,k:0,run:true,sh:'#f0f0f0'});}
  for(let j=0;j<pass.length;j++){const p=pass[j];const x=wrap(hs(j*7+1)*W2+tt*p.v);if(!vis(x))continue;const r=p.v>0;
    const ch=p.elder?elder(4):npc[p.k];add(x,p.y,()=>walker(x,p.y,ch,{pose:'walk',ph:tt*(p.run?13:7)+j,front:r,right:r,shirt:p.sh},p.um));
    if(p.dog){const dx=x+(r?.7:-.7);if(vis(dx))add(dx,p.y+.25,()=>{leash(x,p.y,dx,p.y+.25,r);dog(dx,p.y+.25,p.dog,tt*12+j,r);});}}
  // pareja paseando por el camino de la plaza
  if(busy){const yy=3.4+((tt*.3)%1)*5.2;add(5.85,yy,()=>sPerson(5.85,yy,npc[2],{pose:'walk',ph:tt*6.5,front:true,right:false}));add(6.3,yy+.15,()=>sPerson(6.3,yy+.15,elder(3),{pose:'walk',ph:tt*6.5+2,front:true,right:false}));}
  // manifestación
  if(manif){const cause=(w.manif&&w.manif.cause)||TXN.escenas.sanidad_publica;const txt=String(cause).toUpperCase().slice(0,22);
    for(let k=0;k<9;k++){const x=4.7+(k%3)*.6+hs(k)*.2,y=4.3+Math.floor(k/3)*.55+hs(k+9)*.2;add(x,y,()=>{const b=Math.abs(Math.sin(tt*3+k))*2;ctx.save();ctx.translate(0,-b);sPerson(x,y,npc[(k+3)%12],{act:k%3===0?'cheer':k===4?'phone':null,front:true,right:k%2===0});ctx.restore();});}
    add(5.9,5.95,()=>banner(4.6,6.6,5.9,22,txt,'#fffdf8','#c0392b'));
    add(4.3,5.3,()=>{sPerson(4.3,5.3,npc[1],{act:'cheer',front:true,right:true});const [a,b]=P(4.3,5.3);emoji('📣',a+9,b-42,10);});}
  // ---------- Ana ----------
  let ana;
  if(act==='deporte'){const u=(tt*.075)%2,go=u<1;const x=go?1+10*u:11-10*(u-1),y=go?2.75:3.1;ana={x,y,pose:'walk',walkPh:tt*13,front:go,right:go};
    if(rain)add(x,y+.02,()=>{const [a,b]=P(x,y);for(let k=0;k<3;k++){const p=(tt*3+k/3)%1;ctx.strokeStyle=`rgba(200,220,240,${.6*(1-p)})`;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(a+(go?-1:1)*k*6,b,2+p*4,1+p*2,0,0,Math.PI*2);ctx.stroke();}});}
  else if(act==='amigos'){const f=outFriend(),fn=f?f.n:null;const fch=f&&f.ch?f.ch:npc[4];
    if(terraza){const [x,y]=tabs[0];ana={x:x-.42,y,pose:'sit',act:'talk',front:true,right:true};add(x+.42,y,()=>sPerson(x+.42,y,fch,{pose:'sit',act:'eat',front:true,right:false,name:fn}));
      if(!rain)add(x+.05,y+.55,()=>sPerson(x+.05,y+.55,npc[0],{pose:'sit',act:'talk',front:false,right:false}));}
    else{ana={x:8.45,y:3.85,pose:'sit',act:'talk',front:true,right:true};add(9.25,3.85,()=>sPerson(9.25,3.85,fch,{pose:'sit',act:'talk',front:true,right:false,name:fn}));
      add(9.3,4.35,()=>{const [a,b]=P(9.3,4.35);ctx.fillStyle='#3a6a2a';ctx.fillRect(a-1.5,b-9,3,9);ctx.fillRect(a-.8,b-12,1.6,3);});}}
  else{const yy=4+((tt*.25)%1)*4.6;ana={x:6.05-.25,y:Math.min(D-.3,3.4+((tt*.25)%1)*5),pose:'walk',walkPh:tt*7,front:true,right:false};void yy;}
  if(rain&&ana&&ana.pose==='walk'&&act!=='deporte'){const a2=ana;add(a2.x-.01,a2.y-.01,()=>{const [a,b]=P(a2.x,a2.y);umb(a,b,'#7a3a8c');});}
  // ---------- capa final: luz de farolas, lluvia, nieve ----------
  const after=()=>{
    if(night>.3){ctx.save();ctx.globalCompositeOperation='lighter';for(const [x,y] of lampsAt){const [a,b]=P(x,y,46);const [c,d]=P(x,y,0);
      let g=ctx.createRadialGradient(a+6,b+2,0,a+6,b+2,14);g.addColorStop(0,`rgba(255,230,160,${.7*night})`);g.addColorStop(1,'rgba(255,230,160,0)');ctx.fillStyle=g;ctx.fillRect(a-10,b-14,32,32);
      ctx.save();ctx.translate(c+6,d);ctx.scale(1,.5);g=ctx.createRadialGradient(0,0,0,0,0,46);g.addColorStop(0,`rgba(255,210,130,${.32*night})`);g.addColorStop(1,'rgba(255,210,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,46,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.restore();}
    const L=P(0,D)[0]-20,R=P(W,0)[0]+20,Tp=P(0,0,120)[1],B=P(W,D)[1];
    if(rain){ctx.strokeStyle=wk==='tormenta'?'rgba(210,220,235,.55)':'rgba(200,215,235,.42)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<110;k++){const x=L+hs(k*7+1)*(R-L),y=Tp+((hs(k*13+5)+tt*1.7)%1)*(B-Tp);ctx.moveTo(x,y);ctx.lineTo(x-2.5,y+10);}ctx.stroke();}
    if(wk==='nieve'){ctx.fillStyle='rgba(255,255,255,.85)';for(let k=0;k<80;k++){const x=L+((hs(k*7+1)*(R-L))+Math.sin(tt+k)*8),y=Tp+((hs(k*13+5)+tt*.25)%1)*(B-Tp);ctx.fillRect(x,y,2,2);}}
    if(se==='oto'&&!rain)for(let k=0;k<7;k++){const p=(tt*.12+hs(k))%1;const [a,b]=P(1+hs(k*3)*10,3+hs(k*5)*5,60-p*60);ctx.fillStyle=['#c8692c','#e0a03a','#a8452a'][k%3];ctx.save();ctx.translate(a+Math.sin(tt*2+k)*8,b);ctx.rotate(tt*3+k);ctx.fillRect(-2,-1,4,2);ctx.restore();}
  };
  return {W,D,floor:lawn,wall:'#f4f1ea',out:true,tile:false,drawBase,decor,items:it,ana,after};
};
// Escena: parroquia
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Templo (misa) y salón parroquial (voluntariado de Cáritas / asamblea de la asociación de vecinos)
SCENES['parroquia']=function(E){
  const {tt,night,act,w,npc,cp,h}=E;const H=i=>Math.abs(hash(i));const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const crisis=w.crisis||0,dt=dayType(S.day),dd=dateOf(S.day),day=S.day||1;
  const rain=S.weather&&S.weather.k==='lluvia',snow=S.weather&&S.weather.k==='nieve';
  // ---------- ayudas ----------
  const WY=(x0,x1,z0,z1,c)=>poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],c);      // cara en la pared del fondo (y=0)
  const WX=(y0,y1,z0,z1,c)=>poly([P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)],c);      // cara en la pared izquierda (x=0)
  const txt=(s,x,y,z,col,size,onX,weight)=>{const [a,b]=P(x,y,z);ctx.save();ctx.fillStyle=col;ctx.font=`${weight||900} ${size}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.fillText(s,0,0);ctx.restore();};
  const glow=(x,y,z,R,col,a)=>{const [lx,ly]=P(x,y,z);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(lx,ly,0,lx,ly,R);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(lx-R,ly-R,2*R,2*R);ctx.restore();};
  const flame=(x,y,z,k,s=1)=>{const [a,b]=P(x,y,z);const f=1+Math.sin(tt*11+k*1.7)*.18+Math.sin(tt*23+k)*.08;ctx.fillStyle='#ffb347';ctx.beginPath();ctx.ellipse(a,b-2.2*s*f,1.3*s,2.6*s*f,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.ellipse(a,b-1.6*s*f,.6*s,1.3*s*f,0,0,Math.PI*2);ctx.fill();};
  const candle=(x,y,z,hh,k)=>{cyl(x,y,.05,z,z+hh,'#f6f0de','#fffaf0');flame(x,y,z+hh,k);};
  const pers=(x,y,ch,o)=>add(x,y,()=>sPerson(x,y,ch,o));
  const kid=(x,y,ch,o)=>{const [a,b]=P(x,y);ctx.save();ctx.translate(a,b);ctx.scale(.7,.7);ctx.translate(-a,-b);sPerson(x,y,ch,o);ctx.restore();};
  const lift=(z,f)=>{ctx.save();ctx.translate(0,-z);f();ctx.restore();};
  const C=(k,o)=>({...npc[k%12],...o});
  const priest=C(0,{hair:'#9a9a9a',style:'calvo',g:'m',beard:'no',glasses:true,pants:'#22252b'});
  const winFill=(x0,x1,z0,z1,arch,glass,onX)=>{ // ventana con arco (en pared)
    const pts=[],cx=(x0+x1)/2,r=(x1-x0)/2,zt=z1-(arch?r*30:0);
    const Q=(u,z)=>onX?P(0,u,z):P(u,0,z);
    pts.push(Q(x0,z0),Q(x1,z0),Q(x1,zt));if(arch)for(let t=1;t<12;t++){const a=t/12*Math.PI;pts.push(Q(cx+Math.cos(a)*r,zt+Math.sin(a)*r*30));}pts.push(Q(x0,zt));
    return pts;};
  // ---------- ¿qué parte de la parroquia? ----------
  const salon=act==='voluntariado'||act==='militancia';
  let W,D,ana,floor,wall,decor,after,drawBase;
  const dim=night>.5;
  if(!salon){
    // ===================== TEMPLO =====================
    W=10;D=8;floor='#d9cdb4';wall='#e8dcc2';
    const m=dd.m,dm=dd.dm;
    const lit=(m===11&&dm<25)||m===2&&dm>4||m===3&&dm<8?'#6b3f8a':(m===11&&dm>=25)||m===0&&dm<7||m===3&&dm>=8&&dm<20?'#f3ead0':'#3f7d4a'; // color litúrgico
    const navidad=m===11||m===0&&dm<7;
    const sunday=dd.wd===6||dt==='fest';
    const stone='#e4d6ba',stone2='#cbb994';
    drawBase=()=>{
      prism(0,0,W,D,-22,0,'#6d5c4a');
      for(let i=0;i<W;i++)for(let j=0;j<D;j++)topQuad(i,j,i+1,j+1,0,(i+j)%2?'#d8ccb2':'#bfae8c');
      // nave central: alfombra roja
      topQuad(4.35,1.4,5.65,D,0.3,'#8e2b2b');topQuad(4.45,1.4,5.55,D,0.4,'#a33a35');
      // paredes de piedra
      sBox(0,-.25,W,0,0,86,stone);sBox(-.25,-.25,0,D,0,86,shade(stone,.94));
      for(let z=10;z<86;z+=10){ctx.strokeStyle='rgba(120,95,60,.13)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(W,0,z));ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(0,D,z));ctx.stroke();}
      for(let k=0;k<44;k++){const x=H(k*7+1)*W,z=H(k*13+5)*74+8;const j=Math.floor(z/10);WY(x,x+.04,j*10,j*10+10,'rgba(120,95,60,.12)');}
      // zócalo de madera
      WY(0,W,0,14,'#7a5230');WX(0,D,0,14,'#6b4a2e');WY(0,W,13,15,'#5e3f24');WX(0,D,13,15,'#553820');
    };
    decor=()=>{
      // vidrieras en la pared del fondo
      const pal=dim?['#3a2a5a','#5a2030','#203a5a','#4a4020','#204030']:['#e2483d','#3c7be0','#f2c230','#5bbf6a','#a05be0','#f08a3c'];
      for(const [x0,x1] of [[.9,2.0],[8.0,9.1]]){
        poly(winFill(x0-.1,x1+.1,24,78,true),'#8f7a58');
        const pts=winFill(x0,x1,26,76,true);poly(pts,dim?'#1d2038':'#fff2c8');
        ctx.save();ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();ctx.clip();
        for(let i=0;i<4;i++)for(let j=0;j<10;j++){const u=x0+i*(x1-x0)/4,z=26+j*5.4;WY(u+.02,u+(x1-x0)/4-.02,z+.4,z+5,pal[Math.floor(H(i*31+j*7+(x0|0))*pal.length)]);}
        if(!dim){ctx.globalAlpha=.25+Math.sin(tt*.5)*.05;WY(x0,x1,26,80,'#fff8e0');}
        ctx.restore();
        ctx.strokeStyle='#4a3a28';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(...P((x0+x1)/2,0,26));ctx.lineTo(...P((x0+x1)/2,0,70));ctx.moveTo(...P(x0,0,50));ctx.lineTo(...P(x1,0,50));ctx.stroke();
        if(rain&&!dim){ctx.strokeStyle='rgba(255,255,255,.5)';for(let k=0;k<5;k++){const u=x0+.1+H(k+Math.round(x0*9))*(x1-x0-.2),z0=70-((tt*30+k*17)%40);ctx.beginPath();ctx.moveTo(...P(u,0,z0));ctx.lineTo(...P(u,0,z0-5));ctx.stroke();}}
      }
      // rosetón
      {const [a,b]=P(5,0,78);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle='#8f7a58';ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();
        for(let k=0;k<8;k++){ctx.fillStyle=pal[k%pal.length];ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,9,k*Math.PI/4,(k+1)*Math.PI/4);ctx.fill();}ctx.fillStyle=dim?'#5a4a20':'#ffe680';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();ctx.restore();}
      // retablo dorado
      sBox(3.4,.02,6.6,.25,6,70,'#b8892e');WY(3.55,6.45,10,68,'#c99a3a');
      for(const u of [3.7,4.5,5.5,6.3]){WY(u-.06,u+.06,10,70,'#e2b955');}
      for(const [u,col] of [[4.1,'#5a6fa8'],[5.9,'#8a4a5a']]){WY(u-.3,u+.3,30,60,'#3d2a18');WY(u-.26,u+.26,32,58,col);const [a,b]=P(u,0,45);emoji(u<5?'🙏':'🕊️',a,b,13);}
      // Cristo
      WY(4.92,5.08,18,64,'#4b2e18');WY(4.55,5.45,52,56,'#4b2e18');
      {const [a,b]=P(5,0,48);ctx.fillStyle='#e8c9a0';ctx.beginPath();ctx.ellipse(a,b,2.4,8,0,0,Math.PI*2);ctx.fill();ctx.fillRect(a-12,b+2.5,24,2.2);circ(a,b-10,2.6,'#e8c9a0');}
      // vía crucis en la pared izquierda
      for(let k=0;k<4;k++){const y=1.1+k*1.75;WX(y,y+.7,40,56,'#6b4a2e');WX(y+.07,y+.63,42,54,'#d9c9a0');txt(['I','II','III','IV'][k],0,y+.35,48,'#5a3a20',6,true);}
      // luz de colores sobre el suelo
      if(!dim){ctx.save();ctx.globalAlpha=.16+Math.sin(tt*.4)*.03;
        for(const [x0,x1] of [[.9,2.0],[8.0,9.1]])for(let i=0;i<4;i++){const u=x0+.6+i*(x1-x0)/4;poly([P(u,2.2,0),P(u+.3,2.2,0),P(u+.5,4.6,0),P(u+.2,4.6,0)],pal[(i+(x0|0))%pal.length]);}
        ctx.globalAlpha=.08;poly([P(.9,0,0),P(2.0,0,0),P(3.0,4.8,0),P(1.9,4.8,0)],'#fff4c0');poly([P(8.0,0,0),P(9.1,0,0),P(10,4.2,0),P(9,4.2,0)],'#fff4c0');ctx.restore();}
      // presbiterio
      sBox(2.1,.25,7.9,1.9,0,5,'#cdbd9a');sBox(2.1,1.9,7.9,2.2,0,2.5,'#bfae8c');topQuad(2.7,.4,7.3,1.7,5.1,'#9e3030');
    };
    // altar
    add(5,1.4,()=>{sBox(4.1,.75,5.9,1.25,5,20,'#f2ece0');sBox(4.05,.7,5.95,1.3,20,21.5,'#fffdf8');poly([P(4.75,1.3,21.5),P(5.25,1.3,21.5),P(5.25,1.3,8),P(4.75,1.3,8)],lit);
      const [a,b]=P(5,1.31,15);emoji('✝️',a,b,7);
      candle(4.3,.95,21.5,8,1);candle(5.7,.95,21.5,8,2);
      // libro y cáliz
      sBox(4.5,.85,4.85,1.1,21.5,22.5,'#b23a3a');cyl(5.4,1.0,.06,21.5,26,'#d9b44a','#f2d36a');
      if(!dim)return;glow(4.3,.95,32,22,'255,190,100',.35);glow(5.7,.95,32,22,'255,190,100',.35);});
    // flores
    for(const u of [2.9,7.1])add(u,1.2,()=>{cyl(u,1.1,.18,5,13,'#c9b07a','#a88f5a');const [a,b]=P(u,1.1,20);emoji(navidad?'🌺':'💐',a,b,12);});
    // ambón
    add(7.0,1.9,()=>{sBox(6.8,1.4,7.2,1.8,5,24,'#7a5230');sBox(6.7,1.3,7.3,1.85,24,27,'#8a6038');poly([P(6.7,1.85,27),P(7.3,1.85,27),P(7.3,1.85,18),P(6.7,1.85,18)],lit);});
    // sacerdote (de cara a la gente) y monaguillo
    const sermon=Math.floor(tt/9)%2;
    add(5,.45,()=>lift(5,()=>{sPerson(5,.45,priest,{act:sermon?'talk':'book',front:true,right:false,shirt:'#fbf8f0'});const [a,b]=P(5,.45,0);ctx.fillStyle=lit;ctx.beginPath();ctx.moveTo(a-5,b-34);ctx.lineTo(a+5,b-34);ctx.lineTo(a+6,b-16);ctx.lineTo(a-6,b-16);ctx.closePath();ctx.globalAlpha=.85;ctx.fill();ctx.globalAlpha=1;}));
    add(3.4,1.1,()=>lift(5,()=>kid(3.4,1.1,C(2,{g:'m',style:'corto',beard:'no',hair:'#4a3020'}),{front:true,right:false,shirt:'#fbf8f0',mood:70})));
    // lamparillas votivas (izquierda) que parpadean
    add(.9,2.3,()=>{sBox(.35,1.9,1.1,2.8,0,20,'#4b3a2a');for(let r=0;r<3;r++)for(let k=0;k<4;k++){const y=2.0+k*.2,x=.45+r*.22,z=20+r*3;sBox(x-.07,y-.07,x+.07,y+.07,z,z+3,'#c04040');if(H(r*5+k+day)<.6+crisis/250)flame(x,y,z+3,r*4+k,.8);}
      glow(.75,2.3,28,26,'255,180,90',.25+Math.sin(tt*7)*.04);
      sBox(1.05,2.2,1.25,2.5,0,14,'#5a4630');txt('Velas 1€',1.26,2.35,11,'#f4e6c0',4.5,true);});
    // santo en peana (esquina) y confesionario
    add(.7,6.6,()=>{sBox(.15,5.9,1.1,7.6,0,40,'#6b4a2e');sBox(.1,5.85,1.15,7.65,40,44,'#7a5638');poly([P(1.1,6.05,4),P(1.1,7.45,4),P(1.1,7.45,36),P(1.1,6.05,36)],'#5a1f2a');poly([P(1.11,6.7,4),P(1.11,6.8,4),P(1.11,6.8,36),P(1.11,6.7,36)],'#3b2214');});
    add(.6,4.4,()=>{sBox(.3,4.1,.9,4.7,0,16,'#bfae8c');const [a,b]=P(.6,4.4,16);ctx.fillStyle='#7a5a9a';ctx.beginPath();ctx.moveTo(a-4,b);ctx.lineTo(a+4,b);ctx.lineTo(a+2,b-18);ctx.lineTo(a-2,b-18);ctx.fill();circ(a,b-21,3,'#e8c9a0');ctx.strokeStyle='#e2b955';ctx.lineWidth=1;ctx.beginPath();ctx.arc(a,b-22,4.5,0,Math.PI*2);ctx.stroke();});
    // belén en Navidad
    if(navidad)add(9.2,2.6,()=>{sBox(8.4,2.4,9.8,3.4,0,8,'#7a6a4a');topQuad(8.45,2.45,9.75,3.35,8.1,'#8aa060');const [a,b]=P(9.1,2.9,14);emoji('👼',a-10,b-6,8);emoji('🐑',a+8,b+2,7);emoji('⭐',a,b-16,8);});
    // cepillo / caja de Cáritas
    add(9.4,4.6,()=>{sBox(9.15,4.3,9.65,4.8,0,22,'#6b4a2e');sBox(9.1,4.25,9.7,4.85,22,26,'#7a5638');txt('CÁRITAS',9.66,4.55,15,'#f4e6c0',4.2,true);
      if(crisis>40){sBox(9.0,5.2,9.8,6.0,0,10,'#c8a46a');sBox(9.1,5.3,9.5,5.7,10,16,'#d6b47a');const [a,b]=P(9.4,5.6,22);emoji('🥫',a,b,9);}});
    // bancos (cada banco por tramos de medio metro para ordenar bien a la gente sentada)
    const rows=[2.45,3.5,4.55,5.6,6.65];const blocks=[[1.4,4.25],[5.75,8.6]];
    const pewSeg=(x0,x1,y,first,last)=>{
      add(x0,y+.3,()=>{sBox(x0,y+.15,x1,y+.58,7,10,'#8a5c34');if(first)sBox(x0,y+.05,x0+.08,y+.75,0,21,'#5e3f24');});
      add(x0+.02,y+.94,()=>{sBox(x0,y+.58,x1,y+.7,6,22,'#6b4a2e');sBox(x0,y+.56,x1,y+.72,22,23.5,'#7a5638');sBox(x0,y+.78,x1,y+.9,3,5,'#5e3f24');if(last)sBox(x1-.08,y+.05,x1,y+.75,0,21,'#5e3f24');});};
    for(const y of rows)for(const [b0,b1] of blocks)for(let x=b0;x<b1-.01;x+=.5)pewSeg(x,Math.min(b1,x+.5),y,x===b0,x+.5>=b1-.01);
    // feligresía
    let many=(sunday?.8:.32)+(dim?-.15:0)+crisis/400;
    const seats=[];for(const y of rows)for(const [b0,b1] of blocks)for(let x=b0+.3;x<b1-.2;x+=.62)seats.push([x,y]);
    const anaSeat=[6.05,rows[4]];
    seats.forEach(([x,y],k)=>{if(Math.abs(x-anaSeat[0])<.6&&y===anaSeat[1])return;if(H(k*17+day*3)>many)return;
      const old=H(k*29+1)<.55;const ch=old?{...elder(k),g:H(k)<.75?'f':'m',style:H(k+3)<.6?'mono':'corto',hair:['#d6d6d6','#8c7a6a','#b0a090','#5a4a3a'][k%4],glasses:H(k+4)<.6}:C(k,{});
      const sh=old?['#3b3b4a','#5a4a5a','#2c3a4a','#6a5a4a','#4a2a3a'][k%5]:null;const pr=old&&H(k+77)<.25?'📿':null;
      add(x,y+.38,()=>sPerson(x,y+.38,ch,{pose:'sit',front:false,right:true,shirt:sh||undefined,ph:0,mood:60}));
      if(pr)add(x,y+.39,()=>{const [a,b]=P(x,y+.38,0);emoji(pr,a+5,b-24,6);});});
    // alguien que llega tarde por el pasillo
    {const T=16,ph=(tt%T)/T;if(ph<.7){const y=D-.2-ph/.7*(D-2.9);pers(5,y,{...elder(7),g:'f',style:'mono'},{pose:'walk',ph:tt*6,front:false,right:true,shirt:'#4a5a7a'});}}
    // lámparas colgantes
    const lamps=[[2.8,4.0],[7.2,4.0]];
    for(const [x,y] of lamps)add(x,y-.6,()=>{const [a,b]=P(x,y,118),[c,d]=P(x,y,76);ctx.strokeStyle='#3b3226';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();
      ctx.fillStyle='#8a6a2a';ctx.beginPath();ctx.ellipse(c,d,9,3.5,0,0,Math.PI*2);ctx.fill();for(let k=0;k<5;k++){const an=k/5*Math.PI*2,ex=c+Math.cos(an)*8,ey=d+Math.sin(an)*3;circ(ex,ey-3,1.6,dim?'#fff1b0':'#f2ead2');}
      if(dim||h>18)glow(x,y,76,46,'255,200,120',.32);});
    // Ana: en el extremo del banco, junto al pasillo
    ana={x:anaSeat[0],y:anaSeat[1]+.38,pose:'sit',act:Math.floor(tt/12)%3===2?'book':null,front:false,right:true};
    after=()=>{if(dim){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.08;poly([P(0,D,0),P(0,D,86),P(0,0,86),P(W,0,86),P(W,0,0),P(W,D,0)],'#ffb060');ctx.restore();}
      if(!dim){ctx.save();ctx.globalAlpha=.05;for(const [x0,x1] of [[.9,2.0],[8.0,9.1]])poly([P(x0,0,76),P(x1,0,76),P(x1+1.4,5,0),P(x0+1.4,5,0)],'#fff2c0');ctx.restore();}
      // motas de polvo en la luz
      if(!dim)for(let k=0;k<14;k++){const u=1.1+H(k)*1.1+((tt*.05+H(k+3))%1)*.8,v=(tt*.08+H(k+9))%1*3,z=60-v*18;const [a,b]=P(u+v*.4,v,z);circ(a,b,.7,'rgba(255,250,220,.6)');}};
  } else {
    // ===================== SALÓN PARROQUIAL =====================
    W=10;D=8;floor='#d7cfc0';wall='#efe4bf';
    const mil=act==='militancia';
    drawBase=()=>{
      prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,'#d7cfc0');
      // terrazo moteado
      for(let k=0;k<260;k++){const x=H(k*3+1)*W,y=H(k*7+2)*D;const [a,b]=P(x,y,0);ctx.fillStyle=['#a89a84','#8e8270','#efe6d6','#b9a98e'][k%4];ctx.fillRect(a,b,1.6,1);}
      ctx.strokeStyle='rgba(0,0,0,.05)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
      sBox(0,-.15,W,0,0,74,wall);sBox(-.15,-.15,0,D,0,74,shade(wall,.95));
      WY(0,W,0,26,'#6f8f6a');WX(0,D,0,26,'#638260');WY(0,W,26,27.5,'#5a7a56');WX(0,D,26,27.5,'#526f4e');
    };
    decor=()=>{
      // ventanas con reja
      for(const x0 of [6.4,8.3]){WY(x0-.08,x0+1.38,32,66,'#f4f1ea');WY(x0,x0+1.3,34,64,dim?'#26304f':rain?'#a9b8c4':'#bfe0f2');
        if(!dim){ctx.save();ctx.globalAlpha=.5;poly([P(x0+.2,0,60),P(x0+.5,0,60),P(x0+.2,0,40),P(x0,0,40)],'#ffffff');ctx.restore();
          const cx=((tt*.6+x0)%3)/3;const [a,b]=P(x0+.1+cx*1.1,0,45);circ(a,b,1.6,'rgba(90,100,110,.6)');}
        ctx.strokeStyle='#5a5a5a';ctx.lineWidth=1;for(let k=1;k<5;k++){const u=x0+k*.26;ctx.beginPath();ctx.moveTo(...P(u,0,34));ctx.lineTo(...P(u,0,64));ctx.stroke();}
        if(rain)for(let k=0;k<5;k++){const u=x0+.1+H(k*3+Math.round(x0*10))*1.1,z=62-((tt*28+k*13)%26);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.moveTo(...P(u,0,z));ctx.lineTo(...P(u,0,z-4));ctx.stroke();}
        if(snow&&!dim)WY(x0,x0+1.3,34,37,'#ffffff');}
      // crucifijo y cuadro de la Virgen
      WY(4.83,4.97,46,66,'#5a3a20');WY(4.6,5.2,58,61,'#5a3a20');
      WY(.5,1.5,36,62,'#b8892e');WY(.58,1.42,38,60,'#3a4a7a');{const [a,b]=P(1,0,49);emoji('🙏',a,b,12);}
      // reloj
      {const [a,b]=P(3.4,0,64);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);circ(0,0,5,'#fffdf8');ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.stroke();const hr=(h%12)/12*Math.PI*2,mn=(h%1)*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(hr)*2.8,-Math.cos(hr)*2.8);ctx.moveTo(0,0);ctx.lineTo(Math.sin(mn)*4,-Math.cos(mn)*4);ctx.stroke();ctx.restore();}
      // tablón de corcho (pared izquierda)
      WX(1.0,3.2,32,58,'#8a6a40');WX(1.08,3.12,33.5,56.5,'#c79a5e');
      const notes=mil?[[TXN.escenas.asamblea_jueves_19h,'#fffdf8'],[TXN.escenas.fiestas_san_roque,'#f7d774'],[TXN.escenas.firmas_farolas,'#cde8f7'],[TXN.escenas.cuota_socio_15,'#f7c6c6']]:[['Catequesis','#fffdf8'],[TXN.escenas.ropero_martes,'#f7d774'],[TXN.escenas.rastrillo_solidario,'#cde8f7'],['Peregrinación','#f7c6c6']];
      notes.forEach(([s,c],k)=>{const y=1.15+(k%2)*1.0,z=k<2?44:35;WX(y,y+.9,z,z+10,c);txt(s,0,y+.45,z+5,'#3b3247',3.6,true,800);});
      // cartel / pancarta
      if(mil){sBanner(2,8.1,67,'');txt(TXN.escenas.asociacion_de_vecinos_san_roque,5.05,0,72.5,'#1f3f7a',5.6);
        WY(2.3,3.4,34,52,'#fffdf8');txt('POR UN',2.85,0,47,'#1f3f7a',3.6);txt('BARRIO',2.85,0,43,'#1f3f7a',3.6);txt('SEGURO',2.85,0,39,'#c8102e',4);
        WX(4.0,5.0,34,50,'#f2d36a');txt('Fiestas',0,4.5,45,'#7a2a1a',3.8,true);txt('patronales',0,4.5,41,'#7a2a1a',3.4,true);
        WX(5.4,6.4,34,50,'#fffdf8');poly([P(0,5.5,46),P(0,6.3,46),P(0,6.3,48.5),P(0,5.5,48.5)],'#c8102e');poly([P(0,5.5,43.5),P(0,6.3,43.5),P(0,6.3,46),P(0,5.5,46)],'#f2c230');poly([P(0,5.5,41),P(0,6.3,41),P(0,6.3,43.5),P(0,5.5,43.5)],'#c8102e');txt('Firma aquí',0,5.9,37,'#333',3.2,true);}
      else{sBanner(2,5.9,67,'');txt(TXN.escenas.caritas_parroquial_san_roque,3.95,0,72.5,'#c8102e',4.6);
        WY(3.4,4.4,32,50,'#fffdf8');txt('REPARTO',3.9,0,45,'#c8102e',3.8);txt('Mar y Jue',3.9,0,40.5,'#333',3.4);txt('10:00-13:00',3.9,0,36.5,'#333',3.2);
        if(crisis>45){WX(3.6,4.7,34,52,'#f7d774');txt('SE NECESITA',0,4.15,47,'#7a2a1a',3.4,true);txt(TXN.escenas.leche_aceite,0,4.15,42.5,'#333',3.2,true);txt('legumbres',0,4.15,38.5,'#333',3.2,true);}}
    };
    after=()=>{if(dim){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.07;poly([P(0,D,0),P(0,D,74),P(0,0,74),P(W,0,74),P(W,0,0),P(W,D,0)],'#fff0d0');ctx.restore();}
      for(const [x,y] of [[3,2.5],[7,2.5],[3,5.5],[7,5.5]]){const [a,b]=P(x-.6,y,92),[c,d]=P(x+.6,y,92);ctx.strokeStyle='rgba(60,60,60,.5)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a,b-14);ctx.moveTo(c,d);ctx.lineTo(c,d-14);ctx.stroke();capsule(a,b,c,d,3.4,'#c9ccd0');capsule(a,b+1,c,d+1,2,dim?'#fbfff4':'#eef2f0');}
      if(dim||h>19)for(const [x,y] of [[3,2.5],[7,2.5],[3,5.5],[7,5.5]])glow(x,y,90,60,'255,250,225',.18);};
    if(!mil){
      // ---------- VOLUNTARIADO: reparto de alimentos ----------
      const full=Math.max(.15,1-crisis/110);
      // estanterías metálicas con comida (al fondo)
      add(1.2,.6,()=>{for(let s=0;s<2;s++){const x0=.4+s*1.3;sBox(x0,.15,x0+1.2,.75,0,2,'#8a8f98');for(const z of [12,24,36,48]){sBox(x0,.15,x0+1.2,.75,z,z+1.5,'#9aa0a8');for(let j=0;j<5;j++)if(H(s*41+z+j*7)<full){const c=['#e9e3d0','#e85d3f','#f2c230','#3c7be0','#5bbf6a'][(j+z/12)%5];sBox(x0+.06+j*.23,.25,x0+.24+j*.23,.65,z+1.5,z+(j%2?8:6),c);}}
        for(const u of [x0,x0+1.17])sBox(u,.15,u+.04,.75,0,52,'#7a7f88');}});
      // palé con cajas del Banco de Alimentos
      add(8.6,1.3,()=>{sBox(8,.6,9.6,1.9,0,3,'#b08850');for(let k=0;k<Math.round(6*full)+1;k++){const i=k%3,j=Math.floor(k/3);sBox(8.05+i*.5,.7+(j%2)*.55,8.5+i*.5,1.2+(j%2)*.55,3+Math.floor(k/6)*9,12+Math.floor(k/6)*9,k%2?'#c8a46a':'#d6b47a');}
        txt('BANCO DE',9.6,1.25,9,'#7a2a1a',3.2,true);});
      // mesa de reparto larga con bolsas
      const tx0=2.0,tx1=7.8,ty0=2.9,ty1=3.6;
      for(let x=tx0;x<tx1-.01;x+=1){const x1=Math.min(tx1,x+1);add(x+.5,ty0+.55,()=>{sBox(x,ty0,x1,ty1,15,17,'#e8e2d4');sBox(x,ty1-.02,x1,ty1,4,15,'#c9c3b8');
        for(let j=0;j<2;j++){const bx=x+.15+j*.45;if(H(bx*13|0)<full+.2){sBox(bx,ty0+.15,bx+.3,ty0+.45,17,27,j?'#f4f1ea':'#e8f0f8');const [a,b]=P(bx+.15,ty0+.3,31);emoji(['🥖','🥛','🍝','🫒','🥫','🍎'][Math.floor(H(Math.round(bx*7))*6)],a,b,7);}}});}
      add(tx0,ty0,()=>{sBox(tx0,ty0+.05,tx0+.06,ty1,0,15,'#8a8f98');});
      // voluntarias detrás de la mesa
      const vol1=C(3,{...elder(3),g:'f',style:'mono'}),vol2=C(8,{});
      pers(6.2,2.3,vol1,{act:'talk',front:true,right:false,shirt:'#c8102e',mood:70});
      pers(7.2,2.25,vol2,{act:'stir',front:true,right:false,shirt:'#c8102e'});
      // el párroco pasa de vez en cuando
      {const T=26,ph=(tt%T)/T;if(ph<.5){const x=.8+ph/.5*7.8;pers(x,4.5,priest,{pose:'walk',ph:tt*6,front:true,right:true,shirt:'#1d1714'});}}
      // voluntario que trae cajas
      {const T=10,ph=(tt%T)/T,go=ph<.5,f=go?ph/.5:1-(ph-.5)/.5,x=8.4-f*4.6;add(x,1.95,()=>{sPerson(x,1.95,C(10,{}),{pose:'walk',ph:tt*7,front:true,right:!go,shirt:'#c8102e'});if(!go){const [a,b]=P(x,1.95,0);ctx.fillStyle='#c8a46a';ctx.fillRect(a-6,b-36,12,9);}});}
      // mesa de registro con libreta
      add(1.4,4.6,()=>{sBox(.6,4.1,1.9,4.9,13,15,'#a0754c');sBox(.65,4.15,.7,4.85,0,13,'#3b3f46');sBox(1.8,4.15,1.85,4.85,0,13,'#3b3f46');sBox(1.0,4.3,1.5,4.6,15,15.8,'#fffdf8');});
      pers(.95,4.0,C(6,{...elder(6)}),{act:'book',front:true,right:true,shirt:'#c8102e',pose:'sit'});
      // gente en la cola (crece con la crisis), con carritos de la compra
      const n=3+Math.round(crisis/12);
      const qpos=[];for(let k=0;k<n;k++){if(k<4)qpos.push([3.0+k*1.15,4.25]);else{const r=k-4;qpos.push([2.2+(r%6)*1.15,5.35+Math.floor(r/6)*1.0]);}}
      qpos.forEach(([x,y],k)=>{const ch=H(k*11+5)<.35?{...elder(k+2)}:C(k+1,{});const isKid=H(k*13)<.18;
        const o={front:false,right:true,act:k===0?'talk':H(k*3)<.25?'phone':null,mood:H(k*5)<.4?38:55,ph:0};
        add(x,y,()=>{sPerson(x,y,ch,o);if(H(k*7+1)<.4){const [a,b]=P(x+.3,y+.25,0);ctx.fillStyle=['#2a5d8a','#7a2a4a','#2a6a3a'][k%3];ctx.fillRect(a-3,b-13,7,11);capsule(a+3,b-13,a+5,b-20,1,'#333');circ(a-1,b,1.5,'#222');circ(a+3,b,1.5,'#222');}});
        if(isKid)add(x+.3,y+.35,()=>kid(x+.3,y+.35,C(k+4,{beard:'no'}),{front:false,right:true}));});
      // ropero solidario: burra con ropa
      add(.9,6.3,()=>{for(const v of [5.4,7.2])sBox(.55,v,.62,v+.07,0,40,'#9aa0a8');sBox(.55,5.4,.62,7.27,38,40,'#9aa0a8');
        for(let k=0;k<9;k++){const v=5.55+k*.19;sBox(.4,v,.78,v+.12,16+H(k*5)*6,38,['#c8102e','#2a5d8a','#e9e3d0','#5a7a3a','#7a4a8a','#f2c230','#3b3f46','#e07a5f','#8a6a40'][k]);}
        txt('ROPERO',.2,6.3,48,'#7a2a1a',4.2,true);});
      // sillas de espera con gente sentada (de espaldas, mirando a la mesa)
      for(let k=0;k<4;k++){const x=5.6+k*.8,y=6.7;add(x-.05,y-.05,()=>{sBox(x-.25,y-.22,x+.25,y+.18,9,10.5,'#5a6a7a');sBox(x-.22,y-.18,x-.18,y-.14,0,9,'#3b3f46');});
        add(x+.05,y+.4,()=>{sBox(x-.25,y+.18,x+.25,y+.25,9,22,'#5a6a7a');sBox(x-.22,y+.18,x-.18,y+.25,0,9,'#3b3f46');sBox(x+.18,y+.18,x+.22,y+.25,0,9,'#3b3f46');});
        if(H(k*31+7)<.35+crisis/120){const ch=H(k*3+2)<.5?{...elder(k+5)}:C(k+6,{});add(x,y,()=>sPerson(x,y,ch,{pose:'sit',front:false,right:true,act:k===1?'phone':null,mood:45}));}}
      // sillas plegables en la pared izquierda, apiladas
      add(.5,6.8,()=>{for(let k=0;k<5;k++)sBox(.25+k*.04,6.2,.35+k*.04,7.3,k*2,k*2+22,'#7a7f88');});
      ana={x:4.3,y:2.3,pose:'stand',act:Math.floor(tt/4)%2?'talk':'stir',front:true,right:false,prop:Math.floor(tt/4)%2?'🛍️':null};
    } else {
      // ---------- MILITANCIA: asamblea de la asociación de vecinos ----------
      // mesa presidencial
      add(5,2.0,()=>{sBox(3,1.5,7,2.25,15,17,'#7a5230');poly([P(3,2.25,17),P(7,2.25,17),P(7,2.25,4),P(3,2.25,4)],'#264a8a');txt(TXN.escenas.a_vv_san_roque,5,2.25,10,'#fffdf8',4.6,false,900);
        for(const u of [3.6,4.6,5.8,6.5])cyl(u,1.75,.06,17,25,'#bfe3f7','#2a7ad0');sBox(4.9,1.7,5.1,1.9,17,18,'#333');capsule(...P(5,1.8,18),...P(5.15,1.95,29),1.2,'#333');circ(...P(5.15,1.95,30),1.8,'#222');
        sBox(3.3,1.65,3.8,2.0,17,17.6,'#fffdf8');sBox(6.1,1.65,6.6,2.0,17,17.6,'#fffdf8');});
      for(const u of [3.6,6.3])add(u,1.0,()=>sChair(u-.5,.6,'#7a7f88'));
      pers(3.6,1.15,C(9,{...elder(9),g:'m',style:'calvo'}),{pose:'sit',act:'book',front:true,right:false,shirt:'#3a4a6a'});
      pers(6.3,1.15,C(4,{}),{pose:'sit',act:Math.floor(tt/5)%2?'talk':null,front:true,right:false,shirt:'#7a2a3a'});
      // sillas plegables del público (respaldo hacia la cámara)
      const fchair=(x,y)=>{add(x-.06,y-.06,()=>{sBox(x-.25,y-.22,x+.25,y+.18,9,10.5,'#5a6a7a');for(const [u,v] of [[-.22,-.18],[.2,-.18]])sBox(x+u,y+v,x+u+.04,y+v+.04,0,9,'#3b3f46');});
        add(x+.05,y+.4,()=>{sBox(x-.25,y+.18,x+.25,y+.25,9,22,'#5a6a7a');for(const u of [-.22,.2])sBox(x+u,y+.18,x+u+.04,y+.25,0,9,'#3b3f46');});};
      const rowsY=[3.6,4.7,5.8,6.9],cols=[1.6,2.5,3.4,4.3,5.6,6.5,7.4,8.3];let k=0;
      for(const y of rowsY)for(const x of cols){fchair(x,y);const occ=H(k*19+day)<.55+crisis/300+(dt==='work'?0:.1);
        if(occ){const old=H(k*23)<.38;const ch=old?{...elder(k)}:C(k+2,{});const kk=k;
          add(x,y,()=>sPerson(x,y,ch,{pose:'sit',front:false,right:true,act:H(kk*5+Math.floor(tt/6))<.12?'talk':null}));}
        k++;}
      // vecino que pide la palabra de pie al fondo
      pers(9.2,5.4,C(11,{}),{act:Math.floor(tt/3)%2?'cheer':'talk',front:false,right:true,shirt:'#4a6a3a'});
      // mesa con café y pastas
      add(9.2,2.0,()=>{sBox(8.5,1.4,9.8,2.4,13,15,'#e8e2d4');sBox(8.55,1.45,8.6,2.35,0,13,'#3b3f46');sBox(9.7,1.45,9.75,2.35,0,13,'#3b3f46');cyl(8.9,1.8,.17,15,27,'#c0c4c8','#9aa0a8');for(let k2=0;k2<5;k2++)cyl(9.2+(k2%3)*.18,1.7+(k2>>1)*.2,.06,15,18,'#fffdf8');
        for(let s=0;s<3;s++){const [a,b]=P(8.9,1.8,29+((tt*8+s*5)%14));circ(a+Math.sin(tt*2+s)*1.5,b,1.6,'rgba(255,255,255,.45)');}});
      ana={x:5,y:1.15,pose:'sit',act:Math.floor(tt/7)%3===2?'book':'talk',front:true,right:false};
      add(5,.95,()=>sChair(4.5,.6,'#7a7f88'));
    }
  }
  return {W,D,floor,wall,out:false,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: residencia
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Residencia Los Olivos: sala común con tele, sillones, sillas de ruedas, carro de medicación y timbres de llamada.
// Comedor a la hora de comer/cenar; de madrugada, ronda con la sala a media luz.
// Cuanta más toxicidad laboral / crisis, menos personal y más caos (timbres, bandejas por el suelo, prisas).
SCENES['residencia']=function(E){
  const {tt,night,act,w,npc,cp}=E;const h=E.h??12;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=10,D=8;const hA=i=>Math.abs(hash(i));
  const crisis=(w&&w.crisis)||0;let tox=.3;try{tox=TOX();}catch(e){}
  const chaos=Math.max(0,Math.min(1,Math.max(tox,crisis/100)*1.25-.25));// 0 tranquilo … 1 desbordado
  const staff=chaos<.4?3:chaos<.7?2:1;
  const working=act==='work';
  const meal=(h>=13&&h<14.75)||(h>=20&&h<21.25);
  const late=h>=22.5||h<7;
  const wx=(S.weather&&S.weather.k)||'sol',rain=wx==='lluvia'||wx==='tormenta',snow=wx==='nieve';
  // ---- ayudas ----
  const qX=(xf,y0,y1,z0,z1,col)=>poly([P(xf,y0,z0),P(xf,y1,z0),P(xf,y1,z1),P(xf,y0,z1)],col);
  const qY=(yf,x0,x1,z0,z1,col)=>poly([P(x0,yf,z0),P(x1,yf,z0),P(x1,yf,z1),P(x0,yf,z1)],col);
  const txt=(t,x,y,z,ax,size,col,wt)=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,ax==='x'?0.5:-0.5,0,1,0,0);ctx.font=`${wt||900} ${size}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,0,0);ctx.restore();};
  const ln=(a,b,col,lw)=>{ctx.strokeStyle=col;ctx.lineWidth=lw||1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const CARD=['#9c7a8c','#7d8fa6','#b59a7a','#8aa38b','#a88fb8','#c08c7a','#6f8faf'];
  const old=(k,o)=>({...elder(k),shirt:CARD[k%CARD.length],pants:['#6b6b70','#4f5560','#7a6a5a'][k%3],...(o||{})});
  const WALLC='#f3ead9',ZOC='#a9cbb8';
  // rueda en un plano x=cte (eje y) o y=cte (eje x)
  const wheel=(x,y,z,r,ax,col)=>{ctx.strokeStyle=col||'#3b3f46';ctx.lineWidth=1.4;ctx.beginPath();for(let k=0;k<=14;k++){const a=k/14*Math.PI*2;const p=ax==='y'?P(x,y+Math.cos(a)*r,z+Math.sin(a)*r*TW*.5):P(x+Math.cos(a)*r,y,z+Math.sin(a)*r*TW*.5);k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();
    ctx.lineWidth=.5;ctx.beginPath();for(let k=0;k<3;k++){const a=k/3*Math.PI+tt*0;const p1=ax==='y'?P(x,y+Math.cos(a)*r,z+Math.sin(a)*r*TW*.5):P(x+Math.cos(a)*r,y,z+Math.sin(a)*r*TW*.5),p2=ax==='y'?P(x,y-Math.cos(a)*r,z-Math.sin(a)*r*TW*.5):P(x-Math.cos(a)*r,y,z-Math.sin(a)*r*TW*.5);ctx.moveTo(...p1);ctx.lineTo(...p2);}ctx.stroke();};
  // silla de ruedas mirando a +y (hacia cámara) o -y ('back')
  const wchairBack=(x,y,face)=>{const bk=face==='back'?y+.22:y-.28;wheel(x-.3,y,9,.28,'y');sBox(x-.24,y-.24,x+.24,y+.24,9,11,'#2b3f6b');sBox(x-.24,bk,x+.24,bk+.06,11,28,'#2b3f6b');ln(P(x-.26,y-.2,11),P(x-.26,y+.2,11),'#9aa3ad',1.2);};
  const wchairFront=(x,y,face)=>{wheel(x+.3,y,9,.28,'y');ln(P(x+.26,y-.2,15),P(x+.26,y+.2,15),'#9aa3ad',1.2);if(face!=='back'){ln(P(x-.1,y+.28,3),P(x-.1,y+.4,2),'#9aa3ad',1);ln(P(x+.1,y+.28,3),P(x+.1,y+.4,2),'#9aa3ad',1);}};
  const wcElder=(x,y,ch,o)=>{add(x,y,()=>{wchairBack(x,y,o.face);sPerson(x,y+(o.face==='back'?-.05:.02),ch,{pose:'sit',front:o.face!=='back',right:o.right??true,act:o.act||null,mood:o.mood??55,sad:o.sad,name:o.name});wchairFront(x,y,o.face);if(o.call){const [a,b]=P(x,y,52);label('¡Señorita!',a+10,b-4,'rgba(255,253,248,.95)','#c0392b',7);}});};
  // sillón geriátrico: 'back' = respaldo hacia cámara (mirando a la tele)
  const sillon=(x,y,c,face)=>{if(face==='back'){sBox(x+.1,y+.1,x+.9,y+.9,0,11,c);sBox(x+.1,y+.1,x+.25,y+.9,11,17,shade(c,.95));sBox(x+.75,y+.1,x+.9,y+.9,11,17,shade(c,.95));}else sArm(x,y,c);};
  const sillonFront=(x,y,c)=>{sBox(x+.1,y+.7,x+.9,y+.9,11,27,shade(c,.9));};
  const elderArm=(x,y,c,k,face,o)=>{add(x+.5,y+.5,()=>{sillon(x,y,c,face);sPerson(x+.5,y+(face==='back'?.45:.6),old(k),{pose:'sit',front:face!=='back',right:o&&o.right!=null?o.right:true,act:o&&o.act||null,mood:o&&o.mood||55,sad:o&&o.sad});if(face==='back')sillonFront(x,y,c);if(o&&o.manta){const [a,b]=P(x+.5,y+.62,12);ctx.fillStyle=o.manta;ctx.beginPath();ctx.ellipse(a,b-2,9,5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a-7,b-3);ctx.lineTo(a+7,b-3);ctx.stroke();}if(o&&o.zzz){const [a,b]=P(x+.5,y+.6,48);ctx.globalAlpha=.5+Math.sin(tt*2)*.3;emoji('💤',a+8,b-((tt*6)%8),9);ctx.globalAlpha=1;}});};
  const carroMed=(x,y)=>{sBox(x,y,x+.75,y+.45,4,30,'#f4f6f8');const cols=['#5a9bd5','#f2c14e','#7cc47c','#e88aa6','#9b8bd1'];
    for(let r=0;r<4;r++)for(let c=0;c<5;c++)qY(y+.451,x+.04+c*.14,x+.16+c*.14,7+r*5.5,11.5+r*5.5,cols[(r+c)%5]);
    for(let k=0;k<6;k++){const [a,b]=P(x+.12+(k%3)*.22,y+.12+Math.floor(k/3)*.2,30);circ(a,b-1,1.6,'#fff');circ(a,b-1.5,1,['#e85d3f','#f0ad4e','#fff'][k%3]);}
    sBox(x+.6,y+.05,x+.72,y+.4,30,38,'#c9d1da');for(const [dx,dy] of [[.06,.06],[.69,.06],[.06,.39],[.69,.39]]){const [a,b]=P(x+dx,y+dy,1);circ(a,b,1.6,'#333');}};
  const bandeja=(x,y,z,k)=>{sBox(x-.18,y-.13,x+.18,y+.13,z,z+1,'#c9b48a');isoEll(x-.05,y,z+1.2,.1,'#fbfaf6');isoEll(x-.05,y,z+1.6,.06,['#e2a23b','#c9643a','#8bb26a'][k%3]);cyl(x+.11,y-.06,.035,z+1,z+6,'rgba(220,235,245,.9)');};
  // ---- base: suelo de terrazo y paredes de dos tonos con pasamanos ----
  const drawBase=()=>{
    sFloor(W,D,'#ddd6c6',true);
    // vetas de terrazo
    ctx.fillStyle='rgba(120,110,95,.18)';for(let k=0;k<90;k++){const [a,b]=P(hA(k*7+1)*W,hA(k*13+5)*D);ctx.fillRect(a,b,1.3,1);}
    // brillo del suelo fregado
    {const [a,b]=P(W*.45,D*.4);const g=ctx.createRadialGradient(a,b,4,a,b,140);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;topQuad(0,0,W,D,0,g);}
    sBox(0,-.15,W,0,0,72,WALLC);sBox(-.15,-.15,0,D,0,72,shade(WALLC,.95));
    qY(0,0,W,0,26,ZOC);qX(0,0,D,0,26,shade(ZOC,.94));
    qY(0,0,W,0,4,'#7f9e8c');qX(0,0,D,0,4,'#7f9e8c');
    // pasamanos de madera
    sBox(0,0,W,.07,24,27,'#c79a62');sBox(0,0,.07,D,24,27,'#b98d58');
    // ventanas al jardín
    for(const [x0,x1] of [[.7,2.3],[2.9,4.5]]){qY(.005,x0-.06,x1+.06,28,64,'#e9e6df');
      const sky=night>.5?'#1c2846':rain?'#9fb0bf':'#bfe3f7';qY(.01,x0,x1,30,62,sky);
      // árboles y verja del jardín
      for(let k=0;k<3;k++){const [a,b]=P(x0+.3+k*.5,.01,40+hA(k+x0*10|0)*6);circ(a,b,7+hA(k*3)*3,night>.5?'#1d3326':'#5f9a55');}
      qY(.01,x0,x1,30,36,night>.5?'#232a24':snow?'#f2f4f6':'#7aa36a');
      if(rain&&night<.8){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.6;ctx.beginPath();for(let k=0;k<9;k++){const xx=x0+hA(k*5+x0*7|0)*(x1-x0),zz=62-((hA(k*11)*32+tt*24)%32);const p=P(xx,.012,zz);ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+.6,p[1]+4);}ctx.stroke();}
      ln(P((x0+x1)/2,.012,30),P((x0+x1)/2,.012,62),'#e9e6df',1.6);
      // cortinas
      qY(.02,x0-.12,x0+.15,26,66,'#e8c9a0');qY(.02,x1-.15,x1+.12,26,66,'#e8c9a0');
      if(night>.5)qY(.012,x0,x1,30,62,'rgba(255,230,160,.06)');}
    // reloj de pared
    {const [a,b]=P(2.6,.02,58);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);circ(0,0,5.6,'#fff');ctx.strokeStyle='#333';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(0,0,5.6,0,Math.PI*2);ctx.stroke();const hr=(h%12)/12*Math.PI*2,mn=(h%1)*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(hr)*3,-Math.cos(hr)*3);ctx.moveTo(0,0);ctx.lineTo(Math.sin(mn)*4.6,-Math.cos(mn)*4.6);ctx.stroke();ctx.restore();}
    // televisor en soporte de pared
    {const x0=6.1,x1=7.7,z0=38,z1=60;qY(.02,x0-.05,x1+.05,z0-1.5,z1+1.5,'#1e1f24');
      let scr;if(late)scr='#14161c';else{const ch=Math.floor(tt/3)%3;scr=['#3d7fc4','#d9a23a','#3fa06a'][ch];}
      qY(.03,x0,x1,z0,z1,scr);
      if(!late){const ch=Math.floor(tt/3)%3;if(ch===0){qY(.035,x0+.2,x1-.2,z0+2,z0+7,'#f1c40f');txt('¡PASAPALABRA!',(x0+x1)/2,.04,z0+4.5,'x',3.4,'#1e1f24');circ(...P(x0+.6,.04,z0+14),3,'#f4d7c0');circ(...P(x1-.6,.04,z0+14),3,'#e8c2a0');}
        else if(ch===1){qY(.035,x0+.1,x1-.1,z0+2,z0+6,'#c0392b');txt('TELEDIARIO',(x0+x1)/2,.04,z0+4,'x',3,'#fff');circ(...P((x0+x1)/2,.04,z0+13),3.4,'#f0c9a8');}
        else{qY(.035,x0,x1,z0,z0+8,'#2e7d32');txt('MISA DE LA 2',(x0+x1)/2,.04,z0+16,'x',3,'#fff');}
        const fl=.08+.06*Math.sin(tt*9);qY(.04,x0,x1,z0,z1,`rgba(255,255,255,${fl})`);}}
    // tablón de actividades
    {const x0=8.0,x1=9.6;qY(.02,x0,x1,32,58,'#b88a5a');qY(.03,x0+.06,x1-.06,33.5,56.5,'#d8b88c');
      txt('ACTIVIDADES',(x0+x1)/2,.04,53,'x',3.4,'#5a3a1a');
      const papers=[['#fff',TXN.escenas.bingo_lunes],['#fff7b0','Musicoterapia'],['#fff','Gimnasia 11h'],['#ffd9d9','Menú: cocido']];
      papers.forEach(([c,t],k)=>{const xa=x0+.1+(k%2)*.75,za=k<2?42:35;qY(.04,xa,xa+.65,za,za+7,c);txt(t,xa+.32,.05,za+3.5,'x',2.2,'#333',800);});
}
    if(chaos>.5){qX(.03,4.1,4.95,28,44,'#ffe14d');txt('FALTA',.04,4.52,40,'y',3.6,'#c0392b');txt('PERSONAL',.04,4.52,35.5,'y',3.6,'#c0392b');txt(TXN.escenas.t1_auxiliar_25,.04,4.52,31,'y',2.4,'#333',800);}
    // extintor y dispensador de gel
    {sBox(9.75,.05,9.9,.2,30,42,'#d1242f');qY(.21,9.6,9.98,44,50,'#d1242f');txt('🧯',9.79,.22,47,'x',4,'#fff');}
    // puertas de habitaciones (pared izquierda) con luz de llamada
    const nCalls=working?Math.min(3,Math.round(chaos*3+(late?1:0)+(meal?0:.4))):0;
    [[.9,'101'],[3.0,'102'],[5.1,'103']].forEach(([y0,n],k)=>{
      qX(.01,y0-.08,y0+1.0,0,54,'#e9e6df');qX(.02,y0,y0+.92,0,51,'#c6a16f');
      qX(.025,y0+.1,y0+.82,6,22,'#b8915f');qX(.025,y0+.1,y0+.82,26,46,'#b8915f');
      {const [a,b]=P(.03,y0+.78,26);circ(a,b,1.3,'#d8dde3');}
      qX(.03,y0+.25,y0+.67,40,46,'#fff');txt(n,.04,y0+.46,43,'y',3.6,'#2b4a6a');
      // luz de llamada
      const on=k<nCalls,blink=on&&((tt*2+k*.7)%1)<.55;sBox(-.02,y0+.36,.05,y0+.56,57,62,'#e9e6df');
      qX(.06,y0+.38,y0+.54,57.5,61.5,blink?'#ff3b30':on?'#a8322b':'#c9c3b8');
      if(blink){const [a,b]=P(.06,y0+.46,59.5);const g=ctx.createRadialGradient(a,b,1,a,b,16);g.addColorStop(0,'rgba(255,70,50,.55)');g.addColorStop(1,'rgba(255,70,50,0)');ctx.fillStyle=g;ctx.fillRect(a-16,b-16,32,32);}});
    // gel hidroalcohólico y cartel
    sBox(0,6.4,.06,6.6,30,40,'#e8eef3');qX(.07,6.42,6.58,32,38,'#7cc8f0');
    qX(.03,6.3,6.75,44,52,'#fff');txt(TXN.escenas.lavese_las_manos,.04,6.52,48,'y',2,'#2b4a6a');
    // nombre de la residencia
    qY(.02,4.85,5.85,46,60,'#6f8f4e');txt('🫒',5.35,.03,55,'x',6,'#fff');txt('Los Olivos',5.35,.03,49,'x',3,'#fff');
    // macetas con potus sobre la repisa de la ventana
    for(const x of [1.0,3.9]){const [a,b]=P(x,.25,28);sBox(x-.12,.13,x+.12,.37,28,33,'#c96f43');circ(a,b-9,4,'#4f8a3c');circ(a-4,b-6,3,'#5fa04a');ctx.strokeStyle='#4f8a3c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a+2,b-6);ctx.quadraticCurveTo(a+6,b,a+4,b+8);ctx.stroke();}
  };
  // ---- gente y mobiliario ----
  let ana;
  const staffCol={aux:'#8fc4e0',enf:'#f4f7fa',aux2:'#8fcfae'};
  const worker=(k,col,o)=>({...npc[k],shirt:col,pants:o&&o.pants||col});
  if(!late){
    // fila de sillones frente a la tele (de espaldas)
    elderArm(5.6,1.7,'#7a8c6e',1,'back',{act:'watch'});
    elderArm(6.6,1.7,'#8c5a5a',2,'back',{act:'watch',right:false});
    if(!meal)wcElder(8.0,2.3,old(3),{face:'back'});
    // abuela dormida con manta junto a la ventana
    elderArm(.6,1.6,'#6f86a6',4,'front',{zzz:true,manta:'#c0504d',mood:50});
  }
  if(meal){
    // comedor: dos mesas con bandejas
    const mesa=(x0,y0,x1,y1)=>{sBox(x0,y0,x1,y1,15,17,'#f1ece2');for(const [x,y] of [[x0+.1,y1-.1],[x1-.1,y1-.1],[x1-.1,y0+.1]])sBox(x-.04,y-.04,x+.04,y+.04,0,15,'#9aa3ad');sBox(x0-.02,y0-.02,x1+.02,y1+.02,14,15,'#d9cfbf');};
    const T=[[1.8,3.5,3.8,4.4],[5.2,3.9,7.2,4.8]];
    // comensales detrás (mirando a cámara)
    T.forEach(([x0,y0,x1,y1],t)=>{for(let k=0;k<2;k++){const x=x0+.5+k;add(x,y0-.35,()=>{sChair(x-.5,y0-.85,'#9b7b5b');sPerson(x,y0-.25,old(5+k+t*2),{pose:'sit',act:(k+t)%2?'eat':null,mood:58});});}
      add((x0+x1)/2,(y0+y1)/2,()=>{mesa(x0,y0,x1,y1);for(let k=0;k<2;k++)bandeja(x0+.5+k,y0+.25,17,k+t);for(let k=0;k<2;k++)bandeja(x0+.5+k,y1-.25,17,k+t+1);});});
    // una de cara a la mesa, de espaldas a la cámara
    wcElder(2.3,4.85,old(9),{face:'back',act:'eat'});
    // carro térmico de comidas
    add(8.6,3.2,()=>{sBox(8.3,2.6,9.1,3.3,4,36,'#c9d1da');for(let r=0;r<4;r++)qY(3.301,8.35,9.05,8+r*7,13+r*7,'#aeb8c3');sBox(8.25,2.55,9.15,3.35,36,38,'#9aa3ad');for(const [dx,dy] of [[.05,.05],[.75,.05],[.05,.7],[.75,.7]]){const [a,b]=P(8.3+dx,2.6+dy,1);circ(a,b,1.6,'#333');}
      for(let k=0;k<3;k++){const [a,b]=P(8.7,2.95,40);ctx.strokeStyle=`rgba(255,255,255,${.35-k*.1})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a+k*3-3,b-((tt*10+k*5)%14));ctx.quadraticCurveTo(a+k*3,b-6-((tt*10+k*5)%14),a+k*3-2,b-12-((tt*10+k*5)%14));ctx.stroke();}});
    if(working){// Ana dando de comer a un residente en silla de ruedas
      wcElder(6.0,5.6,old(10),{face:'front',right:true,act:'eat'});
      ana={x:5.3,y:5.65,pose:'sit',act:'stir',front:true,right:true};add(5.28,5.6,()=>sBox(5.05,5.4,5.5,5.85,0,10,'#9b7b5b'));
    }else{ana={x:4.3,y:5.4,pose:'stand',act:'talk',front:true,right:true};}
    if(staff>=2)add(7.8,5.6,()=>sPerson(7.8,5.6,worker(5,staffCol.aux2),{act:'stir',front:true,right:false,name:cp?cp.n:null}));
    if(staff>=3){const T2=(tt*.12)%2,f=T2<1?T2:2-T2,dir=T2<1?1:-1,x=1.4+f*2.6,y=7.0;add(x,y,()=>{sPerson(x,y,worker(3,staffCol.aux),{pose:'walk',ph:tt*7,front:dir>0,right:dir>0,prop:'🍮'});});}
  }else if(late){
    // madrugada: sala a media luz, un residente desorientado en pijama y Ana de ronda
    add(3.2,3.0,()=>sPerson(3.2+Math.sin(tt*.2)*.6,3.0,old(6,{shirt:'#a9c4e8',pants:'#a9c4e8'}),{pose:'walk',ph:tt*2.5,front:true,right:Math.cos(tt*.2)>0,mood:30,sad:true}));
    elderArm(.6,1.6,'#6f86a6',4,'front',{zzz:true,manta:'#c0504d',mood:50});
    // mostrador de control con flexo
    add(7.4,4.4,()=>{sBox(6.6,3.9,8.4,4.6,0,26,'#d9cfbf');sBox(6.5,3.85,8.5,4.65,26,28,'#b9a98f');sBox(7.6,4.0,8.2,4.3,28,30,'#2b2b33');poly([P(7.65,4.05,30),P(8.15,4.05,30),P(8.15,4.05,38),P(7.65,4.05,38)],'#7cc8f0');
      qY(4.601,6.7,8.3,8,20,'#c8bba2');txt('CONTROL',7.5,4.61,14,'x',4,'#5a4a3a');});
    if(working){const T=(tt*.08)%2,f=T<1?T:2-T,dir=T<1?1:-1;ana={x:2.6+f*3.4,y:5.4,pose:'walk',act:null,front:dir>0,right:dir>0,walkPh:tt*6,prop:'🔦'};}
    else{ana={x:5,y:5,pose:'stand',act:'talk',front:true,right:true};}
    if(staff>=2)add(6.2,4.5,()=>sPerson(6.2,4.5,worker(5,staffCol.enf,{pants:'#e8eef3'}),{act:'book',front:true,right:true,name:cp?cp.n:null}));
  }else{
    // sala de día: mesa de actividades
    add(3.6,4.4,()=>{sBox(2.4,3.7,4.6,4.6,15,17,'#e2d3b5');for(const [x,y] of [[2.5,4.5],[4.5,4.5],[4.5,3.8]])sBox(x-.04,y-.04,x+.04,y+.04,0,15,'#8a6a4a');
      // tablero de parchís y cartas
      sBox(2.8,3.85,3.4,4.35,17,17.6,'#fff');for(const [dx,dy,c] of [[0,0,'#e74c3c'],[.3,0,'#3498db'],[0,.25,'#f1c40f'],[.3,.25,'#2ecc71']])topQuad(2.8+dx,3.85+dy,3.1+dx,4.1+dy,17.7,c);
      for(let k=0;k<4;k++){const [a,b]=P(3.8+k*.15,4.1,18);ctx.fillStyle='#fff';ctx.fillRect(a-2,b-1.5,4,3);ctx.strokeStyle='#999';ctx.lineWidth=.4;ctx.strokeRect(a-2,b-1.5,4,3);}});
    add(2.9,3.25,()=>{sChair(2.4,2.75,'#9b7b5b');sPerson(2.9,3.35,old(5),{pose:'sit',act:'talk',mood:70,right:true});});
    add(3.9,3.25,()=>{sChair(3.4,2.75,'#9b7b5b');sPerson(3.9,3.35,old(8),{pose:'sit',act:null,mood:62,right:false});});
    wcElder(4.95,4.1,old(7),{face:'front',right:false,act:'talk'});
    // residente con andador, despacito
    {const T=(tt*.035)%2,f=T<1?T:2-T,dir=T<1?1:-1,x=1.6+f*3.2,y=6.2;add(x,y,()=>{sPerson(x,y,old(11),{pose:'walk',ph:tt*2.2,front:dir>0,right:dir>0,mood:55});
      const fx=x+dir*.35;sBox(Math.min(x,fx)+.02,y-.22,Math.max(x,fx),y-.18,20,22,'#b8c0c8');for(const yy of [y-.2,y+.2])for(const xx of [x+dir*.12,fx]){ln(P(xx,yy,0),P(xx,yy,22),'#b8c0c8',1.2);}ln(P(fx,y-.2,22),P(fx,y+.2,22),'#b8c0c8',1.2);});}
    // dominó en la mesita del fondo delantero
    add(8.2,6.4,()=>{sChair(7.4,5.7,'#9b7b5b');sPerson(7.9,6.2,old(6),{pose:'sit',act:'talk',mood:72,right:true});});
    add(8.9,6.1,()=>{sChair(8.4,5.5,'#9b7b5b');sPerson(8.9,6.0,old(1,{shirt:'#b5651d'}),{pose:'sit',act:null,mood:66,right:false});});
    add(8.5,7.0,()=>{sTable(8.0,6.5,'#c9a46a');for(let k=0;k<5;k++){const [a,b]=P(8.35+k*.08,6.95-k*.04,17.5);ctx.fillStyle='#fbfaf6';ctx.fillRect(a-1.4,b-2.4,2.8,2.4);ctx.fillStyle='#222';ctx.fillRect(a-.3,b-1.6,.6,.6);}});
    if(working){
      if(chaos>=.6){// va corriendo de un timbre a otro
        const T=(tt*.22)%2,f=T<1?T:2-T,dir=T<1?-1:1;ana={x:3.5-f*0+0,y:5.6-f*3.6,pose:'walk',act:null,front:dir>0,right:false,walkPh:tt*10,prop:'💊'};
        add(6.9,4.4,()=>carroMed(6.6,4.2));
      }else{
        wcElder(6.2,3.6,old(0),{face:'front',right:true,act:'eat',mood:60});
        add(7.3,4.7,()=>carroMed(7.0,4.5));
        ana={x:6.5,y:4.6,pose:'stand',act:'talk',front:true,right:false,prop:'💊'};
      }
    }else{// de visita
      wcElder(6.2,3.6,old(0),{face:'front',right:true,act:'talk',mood:70});
      ana={x:6.6,y:4.5,pose:'stand',act:'talk',front:true,right:false};
    }
    // personal: enfermera con la tablet, auxiliar con pañales/sábanas
    if(staff>=2)add(8.4,5.0,()=>sPerson(8.4,5.0,worker(5,staffCol.aux2),{act:'book',front:true,right:false,name:cp?cp.n:null}));
    if(staff>=3)add(8.8,3.8,()=>sPerson(8.8,3.8,worker(9,staffCol.enf,{pants:'#e8eef3'}),{act:'phone',front:true,right:false}));
    if(staff>=3||chaos<.5){const T2=(tt*.1)%2,f=T2<1?T2:2-T2,dir=T2<1?1:-1,x=2.0+f*5,y=7.0;add(x,y,()=>{sPerson(x,y,worker(3,staffCol.aux),{pose:'walk',ph:tt*7,front:dir>0,right:dir>0});const fx=x+dir*.5;sBox(fx-.25,y-.2,fx+.25,y+.2,4,20,'#e8eef3');sBox(fx-.22,y-.17,fx+.22,y+.17,20,24,'#9fb4c8');});}
  }
  // ficus en la esquina
  add(9.5,7.5,()=>{cyl(9.5,7.5,.25,0,12,'#e8e2d4');const [a,b]=P(9.5,7.5,12);for(let k=0;k<7;k++)circ(a+Math.cos(k*.9)*6,b-12-Math.sin(k*1.3)*8-k*2,5,k%2?'#4f8a3c':'#3f7a32');});
  // caos: residentes que llaman, bandeja volcada, silla de ruedas abandonada
  if(chaos>=.5&&!late){
    wcElder(meal?1.3:1.6,meal?6.4:5.0,old(2,{shirt:'#d9b38c'}),{face:'front',right:true,call:true,mood:25,sad:true,act:'talk'});
    if(chaos>=.65){add(5.2,6.6,()=>{const [a,b]=P(5.2,6.6,0);ctx.fillStyle='rgba(200,150,80,.5)';ctx.beginPath();ctx.ellipse(a,b,14,5,0,0,Math.PI*2);ctx.fill();sBox(5.0,6.45,5.35,6.7,0,1,'#c9b48a');isoEll(5.55,6.75,0,.1,'#fbfaf6');});
      add(8.6,6.0,()=>{wchairBack(8.6,6.0,'front');wchairFront(8.6,6.0,'front');});}
  }
  // personaje del compi cuando no hay nadie más
  // ---- uniforme de Ana (casaca y pantalón sanitario) ----
  if(working&&ana){ana.shirt=staffCol.aux;ana.pants=staffCol.aux;}
  // ---- luz ----
  const after=()=>{
    const dim=late?.48:night*.3;
    if(dim>.02){ctx.save();ctx.beginPath();const hx=[P(0,0,74),P(W,0,74),P(W,0,-22),P(W,D,-22),P(0,D,-22),P(0,D,74)];ctx.moveTo(...hx[0]);for(const p of hx.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.clip();
      ctx.globalCompositeOperation='multiply';ctx.fillStyle=late?'rgb(70,80,130)':'rgb(150,150,175)';ctx.globalAlpha=Math.min(1,dim*1.3);ctx.fillRect(-2000,-2000,4000,4000);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;
      const pools=late?[[7.4,4.2,1.6,'255,220,150',.35],[4.5,6.5,2.2,'180,200,255',.12]]:[[3.5,4,3,'255,236,200',.12],[7,4,3,'255,236,200',.12]];
      for(const [x,y,r,c,a] of pools){const [px,py]=P(x,y,0);const g=ctx.createRadialGradient(px,py,2,px,py,r*TW*.6);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(px,py,r*TW*.6,r*TH*.7,0,0,Math.PI*2);ctx.fill();}
      ctx.restore();}
  };
  return {W,D,floor:'#ddd6c6',wall:WALLC,out:false,tile:true,drawBase,items:it,ana,after};
};
// Escena: sala
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Sala El Sótano: escenario con focos, amplis, batería, público, barra a la izquierda, humo.
SCENES['sala']=function(E){
  const {tt,night,act,w,npc}=E;const h=E.h??22;const hs=i=>Math.abs(hash(i));const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=10,D=8,WH=92;
  const cr=w.crisis||0,mov=w.mov||0,day=S.day||0;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta';
  const work=act==='work';
  const show=h>=20||h<4||(work&&h>=18); // concierto de verdad; si no, vermut/prueba de sonido
  const lvl=(()=>{try{return S.career||0;}catch(e){return 0;}})();
  let crowdN=show?Math.round((work?11+lvl*5:17)*(1-Math.max(0,cr-40)/120)):5;crowdN=Math.max(4,Math.min(22,crowdN));
  const beat=Math.abs(Math.sin(tt*Math.PI*2.1)); // ~126 bpm
  const pal=['#ff3d7f','#3da5ff','#ffd23d','#7dff9a','#b45cff','#ff8a3d'];
  const col=k=>pal[(k+Math.floor(tt*.8))%pal.length];
  const txt=(s,x,y,z,size,fill,onX,glow)=>{const [a,b]=onX?P(x,y,z):P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`900 ${size}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';if(glow){ctx.shadowColor=glow;ctx.shadowBlur=8;}ctx.fillStyle=fill;ctx.fillText(s,0,0);ctx.restore();};
  // ---------- suelo y paredes de ladrillo ----------
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,'#2a2024');topQuad(0,0,W,D,0,'#2e272c');
    ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    // manchas de cerveza y tiques
    for(let k=0;k<10;k++){const x=2+hs(k*7)*7.5,y=3+hs(k*11)*4.6;isoEll(x,y,0,.12+hs(k)*.18,'rgba(190,150,60,.12)');}
    for(let k=0;k<7;k++){const [a,b]=P(2+hs(k*5+1)*7.5,3+hs(k*3+2)*4.6);ctx.fillStyle=['#e8e2d4','#c0392b','#f0c24a'][k%3];ctx.fillRect(a,b,3,1.6);}
    // paredes
    sBox(0,-.2,W,0,0,WH,'#5a2f2a');sBox(-.2,-.2,0,D,0,WH,'#4f2a26');
    ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=.6;ctx.beginPath();
    for(let z=4;z<WH;z+=5){ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(W,0,z));ctx.moveTo(...P(0,0,z));ctx.lineTo(...P(0,D,z));}
    for(let z=4,r=0;z<WH;z+=5,r++)for(let x=(r%2)*.25;x<W;x+=.5){ctx.moveTo(...P(x,0,z));ctx.lineTo(...P(x,0,z+5));}
    for(let z=4,r=0;z<WH;z+=5,r++)for(let y=(r%2)*.25;y<D;y+=.5){ctx.moveTo(...P(0,y,z));ctx.lineTo(...P(0,y,z+5));}ctx.stroke();
    // telón negro del fondo del escenario
    poly([P(1.3,0,0),P(8.7,0,0),P(8.7,0,WH-6),P(1.3,0,WH-6)],'#151216');
    ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1.2;ctx.beginPath();for(let x=1.5;x<8.7;x+=.35){ctx.moveTo(...P(x,0,0));ctx.lineTo(...P(x,0,WH-6));}ctx.stroke();
  };
  const decor=()=>{
    // neón del nombre de la sala
    const flick=(Math.sin(tt*17)>.97)?.35:1;
    txt('EL SÓTANO',5,0,70,15,`rgba(255,80,140,${flick})`,false,'#ff3d7f');
    txt(TXN.escenas.sala_de_conciertos,5,0,58,6,'rgba(255,200,220,.7)',false);
    // carteles de conciertos en la pared izquierda
    const pst=[['#f0c24a',TXN.escenas.los_del_barrio],['#3da5ff','NOCHE INDIE'],['#e85d3f','PUNK 3€'],['#9b5de5','JAM SESSION']];
    if(mov>50)pst[1]=['#fffdf8',TXN.escenas.concierto_solidario];if(cr>65)pst[3]=['#d9d2c3',TXN.escenas.caja_resistencia];
    for(let k=0;k<4;k++){const y=1.3+k*.75;poly([P(0,y,42),P(0,y+.6,42),P(0,y+.6,62),P(0,y,62)],pst[k][0]);txt(pst[k][1].split(' ')[0],0,y+.3,56,4.5,'#1d1a20',true);txt(pst[k][1].split(' ').slice(1).join(' '),0,y+.3,50,4,'#1d1a20',true);}
    // estanterías de bebidas tras la barra con luz
    for(const z of [30,42]){sBox(0,3.2,.25,7.6,z,z+2,'#3a2a22');for(let k=0;k<16;k++){const y=3.35+k*.26;const c=['#2f7d4a','#7a4a2a','#d9d2c3','#3a5a8c','#c0392b'][(k+z)%5];sBox(.06,y,.18,y+.12,z+2,z+9+(k%3)*1.5,c);}}
    poly([P(0,3.2,28),P(0,7.6,28),P(0,7.6,56),P(0,3.2,56)],'rgba(255,170,90,.08)');
    txt('BARRA',0,5.4,64,10,'#7dffea',true,'#3dd6ff');
    // salida de emergencia
    poly([P(0,7.65,70),P(0,7.95,70),P(0,7.95,75),P(0,7.65,75)],'#1f9d55');txt('SALIDA',0,7.8,72.5,3,'#fff',true);
    // extintor
    cyl(.15,2.6,.08,14,26,'#c0392b');
  };
  // ---------- escenario ----------
  add(1.3,2.3,()=>{sBox(1.3,0,8.7,2.4,0,13,'#1c181d');poly([P(1.3,2.4,13),P(8.7,2.4,13),P(8.7,2.4,13.8),P(1.3,2.4,13.8)],'#3a3a40');
    // tarima de madera
    topQuad(1.3,0,8.7,2.4,13,'#3b2d27');ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.5;ctx.beginPath();for(let y=.3;y<2.4;y+=.3){ctx.moveTo(...P(1.3,y,13));ctx.lineTo(...P(8.7,y,13));}ctx.stroke();
    // cinta y cables
    ctx.strokeStyle='#111';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...P(2.2,.8,13));ctx.bezierCurveTo(...P(3,1.6,13),...P(4,.9,13),...P(4.6,1.6,13));ctx.moveTo(...P(7.5,.8,13));ctx.bezierCurveTo(...P(6.5,1.7,13),...P(6,1.1,13),...P(5.6,1.7,13));ctx.stroke();});
  const amp=(x,y)=>{sBox(x,y,x+.75,y+.55,13,31,'#1a1a1e');sBox(x,y,x+.75,y+.55,31,44,'#1a1a1e');for(const [z0,z1] of [[15,29],[33,42]])poly([P(x+.05,y+.55,z0),P(x+.7,y+.55,z0),P(x+.7,y+.55,z1),P(x+.05,y+.55,z1)],'#2c2a2e');
    txt('FUZZ',x+.38,y+.55,43,3,'#e8e2d4');const led=Math.sin(tt*9+x)>0?'#ff3d3d':'#5a1a1a';const [a,b]=P(x+.65,y+.55,42.5);circ(a,b,.8,led);};
  add(1.6,.6,()=>amp(1.55,.3));add(1.6,1.3,()=>amp(1.55,1.0));add(7.9,.6,()=>amp(7.75,.3));
  // batería sobre tarima
  add(5,1.1,()=>{sBox(4.1,.2,5.9,1.3,13,17,'#2a2228');const dz=17;const hit=beat;
    cyl(5,1.05,.36,dz,dz+12,'#c0392b','#e8e2d4');const [a,b]=P(5,1.4,dz+6);ctx.fillStyle='#1c181d';ctx.beginPath();ctx.ellipse(a,b,8,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e8e2d4';ctx.font='900 4px Nunito';ctx.textAlign='center';ctx.fillText('SÓTANO',a,b+1);
    cyl(4.55,.8,.18,dz+12,dz+18,'#c0392b','#e8e2d4');cyl(5.45,.8,.18,dz+12,dz+18,'#c0392b','#e8e2d4');cyl(5.75,1.15,.22,dz,dz+12,'#c0392b','#e8e2d4');cyl(4.3,1.15,.16,dz,dz+13,'#b8bec6','#e8e2d4');
    for(const [cx,cy,cz,r] of [[4.1,.6,dz+28,.32],[5.95,.55,dz+30,.36],[4.25,1.3,dz+20,.22]]){const [p,q]=P(cx,cy,0+13),[u,v]=P(cx,cy,cz);capsule(p,q,u,v,1,'#8a8f98');ctx.fillStyle='#d4a838';ctx.beginPath();ctx.ellipse(u,v-(cx<4.2&&cy>1?hit*1.5:0),r*TW*.7,r*TH*.4,-.15+(cy<1?Math.sin(tt*12)*.08*hit:0),0,Math.PI*2);ctx.fill();}});
  // monitores de suelo
  for(const x of [3.4,5.1,6.8])add(x+.3,2.2,()=>{poly([P(x,2.0,13),P(x+.6,2.0,13),P(x+.6,2.35,13),P(x,2.35,13)],'#141216');sBox(x,2.0,x+.6,2.35,13,18,'#1d1b20');poly([P(x,2.35,13),P(x+.6,2.35,13),P(x+.6,2.0,19),P(x,2.0,19)],'#26232a');});
  // pies de micro
  const mic=(x,y)=>{const [a,b]=P(x,y,13),[c,d]=P(x,y,52);capsule(a,b,c,d,1,'#9aa0a8');capsule(c,d,c+5,d-2,1,'#9aa0a8');circ(c+6,d-2.5,1.6,'#2b2b33');ctx.fillStyle='#9aa0a8';ctx.beginPath();ctx.ellipse(a,b,4,1.8,0,0,Math.PI*2);ctx.fill();};
  // ---------- banda ----------
  const onStage=(x,y,ch,o)=>{const [a,b]=P(x,y,13),[c,d]=P(x,y);ctx.save();ctx.translate(a-c,b-d);sPerson(x,y,ch,o);ctx.restore();};
  const band=[{...npc[6],shirt:'#1d1b20'},{...npc[1],shirt:'#7a2a3a'},{...npc[10],shirt:'#f4f1ea'},{...npc[3],shirt:'#2a3a5a'}];
  add(5,.55,()=>{const [a,b]=P(5,.55,17),[c,d]=P(5,.55);ctx.save();ctx.translate(a-c,b-d+2);sPerson(5,.55,band[0],{pose:'sit',act:'hammer',front:true,right:true});ctx.restore();});
  if(show||work){
    add(2.9,1.6,()=>onStage(2.9,1.6,band[1],{act:'strum',front:true,right:true,ph:tt}));
    add(7.1,1.5,()=>onStage(7.1,1.5,band[3],{act:'strum',front:true,right:false}));
    if(!work){add(5.05,1.85,()=>{mic(5.4,2.0);onStage(5.05,1.85,band[2],{act:beat>.6?'cheer':'talk',front:true,right:true});});}
    else add(5.4,2.05,()=>mic(5.4,2.0));
  }else{
    // prueba de sonido: técnico en el escenario
    add(3.6,1.6,()=>{mic(5.4,2.0);onStage(3.6,1.6,{...npc[9],shirt:'#1d1b20'},{act:'phone',front:true,right:true});});
  }
  // ---------- barra ----------
  add(1.15,7.6,()=>{sBox(.75,3.2,1.25,7.6,0,18,'#4a2f22');sBox(.7,3.15,1.3,7.65,18,20,'#7a5230');
    poly([P(1.25,3.2,2),P(1.25,7.6,2),P(1.25,7.6,4),P(1.25,3.2,4)],'rgba(255,140,60,.55)');
    for(let k=0;k<3;k++){const y=4+k*.3;sBox(.9,y,1,y+.08,20,28,'#c9c9c9');sBox(.86,y-.02,1.04,y+.1,28,30,['#c0392b','#2f7d4a','#1d1b20'][k]);}
    for(let k=0;k<5;k++){const y=5.2+k*.45;if(hs(k+day)<.6){const [a,b]=P(1.05,y,20);ctx.fillStyle='rgba(240,190,60,.9)';ctx.fillRect(a-1.5,b-6,3,6);ctx.fillStyle='#fff';ctx.fillRect(a-1.5,b-7,3,1.4);}}});
  add(.4,5,()=>sPerson(.45,5.2,{...npc[11],shirt:'#1d1b20'},{act:Math.sin(tt*.5)>0?'stir':'talk',front:true,right:true}));
  // gente acodada en la barra
  for(let k=0;k<(show?3:1);k++){const y=4.2+k*1.15;add(1.6,y,()=>sPerson(1.65,y,npc[(k*4+2)%12],{act:k===1?'eat':'talk',front:false,right:false}));}
  // mesa de sonido
  add(9.3,6.6,()=>{sBox(8.7,6.2,9.7,6.9,0,16,'#2a2a30');sBox(8.65,6.15,9.75,6.95,16,18,'#3a3a42');
    for(let k=0;k<10;k++){const [a,b]=P(8.8+k*.09,6.4,18);ctx.fillStyle=k%3?'#7cf0a8':'#ffd23d';ctx.fillRect(a,b-1-((Math.sin(tt*8+k)+1)*1.5),1,1.2);}
    const [p,q]=P(9.2,6.25,18);ctx.fillStyle='#0d1a2a';ctx.fillRect(p-5,q-12,10,8);ctx.fillStyle='#3da5ff';for(let k=0;k<5;k++){const v=(Math.sin(tt*6+k)+1)*3*(show?1:.3);ctx.fillRect(p-4+k*1.8,q-5-v,1.2,v);}});
  add(9.45,6.95,()=>sPerson(9.45,7.1,{...npc[5],shirt:'#2b2b33'},{act:'type',front:false,right:false}));
  // ---------- público ----------
  const spots=[];for(let r=0;r<4;r++)for(let c=0;c<6;c++){const x=2.3+c*1.08+(r%2)*.5+(hs(r*7+c)-.5)*.35,y=3.15+r*.95+(hs(r*3+c*5)-.5)*.3;if(x>8.4&&y>5.9)continue;spots.push([x,y]);}
  const fr=outFriend();const anaSpot=[4.75,4.15],amiSpot=[5.55,4.3];
  let n=0;for(let k=0;k<spots.length&&n<crowdN;k++){const [x,y]=spots[(k*7)%spots.length];if(!work&&Math.hypot(x-anaSpot[0],y-anaSpot[1])<.7)continue;if(!work&&act==='amigos'&&Math.hypot(x-amiSpot[0],y-amiSpot[1])<.6)continue;n++;
    const ch=npc[(k*5+3)%12],jump=show?Math.max(0,Math.sin(tt*Math.PI*2.1+k*.7))*(hs(k)<.4?4:1.5):0;const a=show?(k%4===0?'cheer':k%5===1?'phone':null):(k%2?'talk':null);
    add(x,y,()=>{ctx.save();ctx.translate(0,-jump);sPerson(x,y,ch,{act:a,front:false,right:k%5!==2,ph:tt*3+k});ctx.restore();if(k%6===3){const [p,q]=P(x,y);ctx.fillStyle='rgba(240,190,60,.9)';ctx.fillRect(p+4,q-30-jump,2.6,5);}});}
  // ---------- Ana ----------
  let ana;
  if(work){ana={x:4.75,y:1.85,z:13,pose:'stand',act:'strum',front:true,right:true};}
  else{const j=show?Math.max(0,Math.sin(tt*Math.PI*2.1))*2:0;ana={x:anaSpot[0],y:anaSpot[1],pose:'stand',act:show?'cheer':'talk',front:!show,right:show};void j;
    if(act==='amigos')add(amiSpot[0],amiSpot[1],()=>sPerson(amiSpot[0],amiSpot[1],fr&&fr.ch?fr.ch:npc[4],{act:show?'cheer':'talk',front:!show,right:false,name:fr?fr.n:null}));}
  // ---------- luces, humo ----------
  const after=()=>{
    // truss
    const tz=WH-4;ctx.strokeStyle='#4a4a52';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...P(1.3,1.1,tz));ctx.lineTo(...P(8.7,1.1,tz));ctx.moveTo(...P(1.3,1.1,tz-5));ctx.lineTo(...P(8.7,1.1,tz-5));ctx.stroke();
    ctx.lineWidth=.7;ctx.beginPath();for(let x=1.3;x<8.7;x+=.4){ctx.moveTo(...P(x,1.1,tz));ctx.lineTo(...P(x+.2,1.1,tz-5));ctx.lineTo(...P(x+.4,1.1,tz));}ctx.stroke();
    const cans=[1.9,3.1,4.3,5.7,6.9,8.1];
    ctx.save();ctx.globalCompositeOperation='lighter';
    if(show){for(let k=0;k<cans.length;k++){const x=cans[k],sw=Math.sin(tt*(.7+k*.13)+k*1.3);const c=col(k);const [a,b]=P(x,1.1,tz-7);const tx=x+sw*1.2,ty=1.6+Math.cos(tt*.5+k)*.9+(k%2?2.4:0);
        const [p,q]=P(tx,ty,k%2?0:13);const g=ctx.createLinearGradient(a,b,p,q);g.addColorStop(0,c+'88');g.addColorStop(1,c+'10');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a-2,b);ctx.lineTo(p-20,q);ctx.lineTo(p+20,q);ctx.lineTo(a+2,b);ctx.closePath();ctx.fill();
        ctx.save();ctx.translate(p,q);ctx.scale(1,.5);const gg=ctx.createRadialGradient(0,0,0,0,0,22);gg.addColorStop(0,c+'55');gg.addColorStop(1,c+'00');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.restore();}
      // estrobo en los golpes
      if(beat>.97&&Math.floor(tt*2.1)%4===0){ctx.fillStyle='rgba(255,255,255,.08)';const L=P(0,D)[0]-30,R=P(W,0)[0]+30,Tp=P(0,0,WH)[1],B=P(W,D)[1];ctx.fillRect(L,Tp,R-L,B-Tp);}
    }else{for(const x of [2.5,5,7.5]){const [a,b]=P(x,1.1,tz-7),[p,q]=P(x,2.6,13);const g=ctx.createLinearGradient(a,b,p,q);g.addColorStop(0,'rgba(255,240,210,.35)');g.addColorStop(1,'rgba(255,240,210,.03)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a-2,b);ctx.lineTo(p-24,q);ctx.lineTo(p+24,q);ctx.lineTo(a+2,b);ctx.fill();}}
    ctx.restore();
    for(let k=0;k<cans.length;k++){const [a,b]=P(cans[k],1.1,tz-7);ctx.fillStyle='#1d1b20';ctx.fillRect(a-3,b-3,6,5);circ(a,b+2,2.2,show?col(k):'#fff4d0');}
    // humo
    if(show){for(let k=0;k<9;k++){const p=(tt*.04+hs(k*3))%1;const x=1.5+((hs(k*7)*7+tt*.15*(k%2?1:-1))%7+7)%7,y=.8+hs(k*5)*3.2,z=18+hs(k*11)*30+Math.sin(tt*.6+k)*4;const [a,b]=P(x,y,z);const r=26+hs(k)*20;
      const g=ctx.createRadialGradient(a,b,0,a,b,r);const c=col(k%3);g.addColorStop(0,`rgba(220,210,235,${.1*Math.sin(p*Math.PI)+.04})`);g.addColorStop(1,'rgba(220,210,235,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(a,b,r,r*.55,0,0,Math.PI*2);ctx.fill();void c;}}
    // luz cálida de la barra
    ctx.save();ctx.globalCompositeOperation='lighter';const [a,b]=P(.8,5.4,30);const g=ctx.createRadialGradient(a,b,0,a,b,70);g.addColorStop(0,'rgba(255,160,80,.16)');g.addColorStop(1,'rgba(255,160,80,0)');ctx.fillStyle=g;ctx.fillRect(a-70,b-70,140,140);ctx.restore();
    // notas musicales flotando
    if(show){for(let k=0;k<3;k++){const p=(tt*.35+k/3)%1;const [x,y]=P(work?4.75:5,1.8,60+p*40);ctx.globalAlpha=1-p;emoji(['🎵','🎶','🎸'][k],x+(k-1)*22+Math.sin(tt*2+k)*5,y,10);ctx.globalAlpha=1;}}
  };
  return {W,D,floor:'#2e272c',wall:'#5a2f2a',out:false,tile:false,drawBase,decor,items:it,ana,after};
};
// Escena: sindicato
// Local del sindicato: asamblea de los jueves. Sillas plegables en filas mirando a la mesa presidencial.
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
SCENES['sindicato']=function(E){
  const {tt,night,w,npc,cp}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const H=i=>Math.abs(hash(i));
  const W=10,D=7,WH=70;
  const wl=W_(),og=(S.office&&S.office.org)||5,strike=!!(S.strike&&S.strike.on),gs=wl.gs===S.day;
  const crisis=wl.crisis||0,mov=wl.mov||0,rain=S.weather&&S.weather.k==='lluvia',snow=S.weather&&S.weather.k==='nieve';
  const cold=['inv','oto'].includes(seasonOf())||snow;
  // ---- ayudas locales ----
  const wq=(x0,x1,z0,z1,c)=>poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],c);
  const lq=(y0,y1,z0,z1,c)=>poly([P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)],c);
  const wt=(x,z,t,c,sz,onX,wt_='900')=>{const [a,b]=onX?P(0,x,z):P(x,0,z);ctx.save();ctx.fillStyle=c;ctx.font=`${wt_} ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,onX?-0.5:0.5,0,1,0,0);ctx.fillText(t,0,0);ctx.restore();};
  const fold=(x,y,c,empty)=>{ // silla plegable mirando a la mesa (-y); respaldo hacia la cámara
    const lg='#5b6068';sBox(x-.2,y-.2,x-.16,y-.16,0,9,lg);sBox(x+.16,y-.2,x+.2,y-.16,0,9,lg);sBox(x-.2,y+.18,x-.16,y+.22,0,22,lg);sBox(x+.16,y+.18,x+.2,y+.22,0,22,lg);
    sBox(x-.21,y-.21,x+.21,y+.2,9,10.5,c);if(empty)sBox(x-.21,y+.17,x+.21,y+.23,13,22,shade(c,.9));};
  const back=(x,y,c)=>sBox(x-.21,y+.17,x+.21,y+.23,13,22,shade(c,.9));
  // ---- asistencia: más gente con movimiento, organización, crisis o huelga ----
  let n=Math.round(5+mov*.11+og*.12+crisis*.05+(strike?9:0)+(gs?6:0));n=Math.max(4,Math.min(30,n));
  const speak=(S.pol&&(S.pol.inf>=45||S.pol.delegada));
  // ---- base: terrazo y paredes con zócalo ----
  const drawBase=()=>{
    prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,'#d9d4c8');
    for(let k=0;k<260;k++){const x=H(k*3.1)*W,y=H(k*7.7+1)*D;const [a,b]=P(x,y);ctx.fillStyle=['#a49a8a','#7f8a8c','#c4b49a','#efe9dc','#8c6f5a'][k%5];ctx.fillRect(a,b,2,1.4);}
    ctx.strokeStyle='rgba(0,0,0,.07)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    const wc='#efe6d4',zc='#7f9c8f';
    sBox(0,-.15,W,0,0,WH,wc);sBox(-.15,-.15,0,D,0,WH,shade(wc,.94));
    wq(0,W,0,26,zc);lq(0,D,0,26,shade(zc,.94));wq(0,W,26,27.5,shade(zc,.75));lq(0,D,26,27.5,shade(zc,.7));
    // ventanas del fondo (calle)
    for(const x0 of [.4,8.1]){const x1=x0+1.6;wq(x0-.08,x1+.08,30,62,'#e8e2d4');
      const sky=night>.5?'#1f2742':mixHex('#bfe3f7','#8fa3b8',rain?.6:0);wq(x0,x1,32,60,sky);
      if(night>.5){for(let j=0;j<3;j++){const lx=x0+.25+j*.5;if(H(j+x0)>.3)wq(lx,lx+.18,40+j*4,46+j*4,'#ffd98a');}}
      else{wq(x0+.15,x0+.6,34,58,'rgba(255,255,255,.25)');}
      if(rain)for(let j=0;j<10;j++){const xx=x0+H(j*1.3+x0)*1.5,zz=60-((tt*30+H(j)*40)%26);const [a,b]=P(xx,0,zz);ctx.strokeStyle='rgba(220,235,255,.7)';ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a,b+4);ctx.stroke();}
      wq((x0+x1)/2-.03,(x0+x1)/2+.03,32,60,'#e8e2d4');wq(x0,x1,45.5,46.5,'#e8e2d4');wq(x0-.15,x1+.15,29,30.5,'#d6cfc0');
      // radiador
      for(let j=0;j<8;j++){const xx=x0+.05+j*.19;wq(xx,xx+.14,8,22,j%2?'#ece8e0':'#f8f5ef');}}
    // puerta en la pared izquierda
    lq(5.5,6.9,0,48,'#8a6a4a');lq(5.6,6.8,0,46,'#a78258');lq(5.7,6.2,26,42,'rgba(190,220,240,.55)');lq(6.3,6.7,24,25.5,'#c9b26a');
    lq(5.65,6.85,52,58,'#2a9d58');wt(6.25,55,'SALIDA',  '#fff',5,true);
  };
  // ---- decoración de pared ----
  const decor=()=>{
    // pancarta de fondo detrás de la mesa
    const bx0=2.5,bx1=7.5;wq(bx0,bx1,40,58,'#c0262d');wq(bx0,bx1,57,58.5,'#8e1b20');
    wt((bx0+bx1)/2,52,TXN.escenas.seccion_sindical,  '#fff',9,false);wt((bx0+bx1)/2,44.5,TXN.escenas.asamblea_de_trabajadoras_jueves_19_00,'#ffe6c9',5.2,false,'800');
    // reloj
    const [cx,cy]=P(5,0,64.5);ctx.save();ctx.translate(cx,cy);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle='#fffdf8';ctx.strokeStyle='#3b3f46';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,4.5,0,7);ctx.fill();ctx.stroke();
    const hh=(S.t/60)%12,mm=S.t%60;ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(hh/6*Math.PI)*2.5,-Math.cos(hh/6*Math.PI)*2.5);ctx.moveTo(0,0);ctx.lineTo(Math.sin(mm/30*Math.PI)*3.6,-Math.cos(mm/30*Math.PI)*3.6);ctx.stroke();ctx.restore();
    // carteles junto a las ventanas
    
    // pared izquierda: tablón de corcho con convocatorias
    lq(.7,3.3,32,58,'#7a5a3a');lq(.78,3.22,33.5,56.5,'#c79a62');
    const notes=['#fffdf8','#f6e27a','#fbd0d0','#cfe7f7','#fffdf8','#d9f2c9','#fffdf8','#f6e27a'];
    for(let k=0;k<9;k++){const y=.9+(k%4)*.58+H(k)*.08,z=37+Math.floor(k/4)*7+H(k+3)*2;lq(y,y+.42,z,z+6+H(k*2)*2,notes[k%8]);const [a,b]=P(0,y+.21,z+6.5);circ(a,b,.9,['#d1242f','#2a6fd1','#2a9d58'][k%3]);}
    // carteles de convocatorias
    const post=(y,z,c,t1,t2,fg='#fff')=>{lq(y,y+1.1,z,z+16,c);wt(y+.55,z+11,t1,fg,5.5,true);if(t2)wt(y+.55,z+5,t2,fg,4,true,'800');};
    post(3.6,36,'#e9c46a','ASAMBLEA','JUEVES 19H','#3b2a20');
    if(strike||gs)post(4.75,36,'#d1242f','¡HUELGA!',gs?'GENERAL HOY':'INDEFINIDA');
    else if(crisis>55)post(4.75,36,'#2b2b2b','NO AL ERE',TXN.escenas.ni_un_despido);
    else post(4.75,36,'#5a7ec7','CONVENIO','DIGNO YA');
    post(3.6,54,'#f4f1ea','✊','',  '#d1242f');
    if(mov>45){lq(4.75,5.75,54,64,'#2a9d58');wt(5.25,59,'1º MAYO','#fff',4.5,true);}
    // extintor
    { const [a,b]=P(0,5.3,10);ctx.fillStyle='#c81d25';ctx.fillRect(a-2.2,b-16,4.4,14);ctx.fillStyle='#222';ctx.fillRect(a-1,b-19,2,3);lq(5.15,5.45,30,36,'#c81d25');}
    // enchufes
    for(const x of [1.2,7.7]){wq(x,x+.12,12,15,'#fffdf8');}
    // banderas en mástil a los lados de la pancarta
    for(const [x,col] of [[2.15,'#c0262d'],[7.8,'#c0262d']]){const [a,b]=P(x,.35,0),[c,d]=P(x,.35,62);capsule(a,b,c,d,1.6,'#6b4a2e');
      const sw=Math.sin(tt*1.3+x)*1.5;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(c,d+2);ctx.quadraticCurveTo(c+8,d+sw,c+16,d+3+sw);ctx.lineTo(c+16,d+15+sw);ctx.quadraticCurveTo(c+8,d+13-sw,c,d+15);ctx.fill();}
  };
  // ---- mesa presidencial (en tramos para que la profundidad funcione) ----
  const tx0=2.8,tx1=7.2,ty0=1.0,ty1=1.75;
  for(let x=tx0;x<tx1-.01;x+=1){const xe=Math.min(tx1,x+1);add(xe,ty1+.05,()=>{
    sBox(x,ty0,xe,ty1,15,17,'#9c7b56');
    poly([P(x,ty1+.01,1),P(xe,ty1+.01,1),P(xe,ty1+.01,16),P(x,ty1+.01,16)],'#8e1b20');
    
    if(x===tx0)sBox(x,ty0,x+.08,ty1,0,15,'#5b4630');
    // atrezo encima
    const mx=x+.5;
    for(const m of [3.3,5.0,6.7])if(m>=x&&m<xe){const mx=m;cyl(mx,ty0+.45,.07,17,18,'#222');const [a,b]=P(mx,ty0+.45,18),[c,d]=P(mx-.05,ty0+.62,27);capsule(a,b,c,d,1.2,'#333');circ(c,d,2,'#111');}
    if(H(x*3)>.3){cyl(mx+.28,ty0+.25,.06,17,25,'rgba(170,215,240,.8)','#3a7bd5');}
    sTop(mx-.4,ty0+.3,mx-.05,ty0+.62,17.3,'#fffdf8');sTop(mx-.36,ty0+.33,mx-.09,ty0+.6,17.5,'#f4f1ea');
  });}
  // gente en la mesa
  const mesa=[];
  if(speak){mesa.push([3.3,.55,npc[10],'book'],[6.7,.55,elder(4),null]);}
  else{mesa.push([3.3,.55,npc[10],'book'],[5.0,.5,npc[2],'talk',1],[6.7,.55,elder(4),null]);}
  for(const [x,y,ch,a,stand] of mesa)add(x,y,()=>{if(!stand)sBox(x-.2,y-.22,x+.2,y-.15,10,24,'#3b3f46');sPerson(x,y,ch,{pose:stand?'stand':'sit',front:true,right:false,act:a==='talk'?'talk':a});});
  // ---- filas de sillas plegables ----
  const cols=[1.9,2.7,3.5,4.3, 5.6,6.4,7.2,8.0],rows=[2.9,3.9,4.9,5.9];
  const nr=n>19?4:3;const seats=[];for(let r=0;r<nr;r++)for(let c=0;c<cols.length;c++)seats.push([cols[c],rows[r],r,c]);
  // asiento de Ana: primera fila, junto al pasillo
  const aSeat=[5.6,2.9];
  const skip=new Set(['5.6,2.9']);
  // orden de llenado: delante primero, con algo de desorden estable
  const order=seats.map((s,i)=>[s,s[2]*1.2+H(i*5.3)*1.6]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);
  const filled=new Set();let placed=0;
  for(const s of order){if(cp&&!speak&&s[0]===6.4&&s[1]===2.9)continue;if(placed>=n)break;if(!speak&&skip.has(s[0]+','+s[1]))continue;filled.add(s[0]+','+s[1]);placed++;}
  const chairC='#4a5a6a';
  const peep=k=>{const base=k%5===4?elder(k):npc[(k*5+1)%12];return {...base};};
  const turn=Math.floor(tt/4);// cada 4 s cambia quién pide la palabra
  seats.forEach((s,i)=>{const [x,y]=s;const key=x+','+y;const isAna=false;
    add(x,y,()=>{
      if(isAna||!filled.has(key)){fold(x,y,chairC,!isAna);
        if(!isAna&&cold&&H(i*9)>.75){sBox(x-.22,y+.12,x+.22,y+.26,14,23,['#6b4a2e','#3a5a8c','#2b2b33'][i%3]);}
        if(!isAna&&H(i*4.1)>.85)sBox(x-.12,y-.12,x+.12,y+.08,10.5,14,'#c8a46a');
        return;}
      fold(x,y,chairC,false);
      const h=H(i*2.7);const hand=(Math.floor(H(i+turn*13)*9)===0);
      const a=hand?'cheer':h<.25?'book':h<.42?'talk':h<.5?'phone':null;
      sPerson(x,y,peep(i),{pose:'sit',front:false,right:a==='talk'?H(i)>.5:true,act:a});
      back(x,y,chairC);
      if(cold&&H(i*9)>.6)sBox(x-.22,y+.12,x+.22,y+.26,14,23,['#6b4a2e','#3a5a8c','#2b2b33','#7a2e3a'][i%4]);
    });});
  // bolsos, papeles y algún paraguas en el suelo
  for(let k=0;k<6;k++){const x=1.6+H(k*11)*7,y=2.5+H(k*13)*4;add(x,y-.3,()=>{if(k<3){const [a,b]=P(x,y);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,-1,.5,0,0);ctx.fillStyle='rgba(255,253,248,.9)';ctx.fillRect(-3,-2,6,4);ctx.restore();}else sBox(x-.12,y-.08,x+.12,y+.08,0,6,['#7a2e3a','#2b2b33','#5a7a3a'][k%3]);});}
  if(rain){add(.6,5.2,()=>{const [a,b]=P(.35,5.0,0),[c,d]=P(.3,4.9,24);capsule(a,b,c,d,2.5,'#2b3a6a');cyl(.35,5.0,.15,0,4,'#2b3a6a');});}
  // ---- rincón del café ----
  add(1.0,2.6,()=>{sBox(.1,1.0,.9,2.6,0,15,'#d9d2c3');sBox(.15,1.05,.85,2.55,15,16,'#c8beb0');
    cyl(.5,1.35,.13,16,31,'#c9c3b8','#3b3f46');cyl(.5,1.35,.04,31,34,'#3b3f46');// termo
    cyl(.5,1.85,.13,16,30,'#d1242f','#8e1b20');
    for(let j=0;j<5;j++){const yy=2.0+j*.1;cyl(.32+(j%2)*.15,yy,.05,16,20,'#fffdf8','#f4f1ea');}
    sTop(.55,2.2,.85,2.5,16.2,'#e3b778');// galletas
    for(let j=0;j<3;j++){const ph=(tt*.6+j/3)%1;const [a,b]=P(.5,1.35,36+ph*16);ctx.fillStyle=`rgba(255,255,255,${.5*(1-ph)})`;ctx.beginPath();ctx.arc(a+Math.sin(tt*2+j)*2,b,2+ph*3,0,7);ctx.fill();}
    sTop(.18,2.25,.45,2.5,16.1,'#fffdf8');});
  add(1.1,2.0,()=>sPerson(1.15,2.0,npc[7],{act:'stir',front:true,right:false}));
  add(1.4,3.0,()=>sPerson(1.3,3.1,elder(3),{act:'eat',front:false,right:false}));
  // sillas plegadas apiladas contra la pared
  add(.4,4.6,()=>{for(let k=0;k<(nr<4?9:4);k++)sBox(.08+k*.045,3.8,.11+k*.045,4.6,2,30-k*.3,k%2?'#5d6f80':'#6b7e90');});
  // fotocopiadora con folletos
  add(9.2,1.0,()=>{sBox(8.6,.15,9.8,.95,0,22,'#d9d6cf');sBox(8.65,.2,9.75,.9,22,25,'#3b3f46');sTop(8.8,.35,9.5,.8,25.2,'#a9b7c6');
    sBox(8.7,.95,9.7,1.05,8,10,'#bdb7ad');const bl=(Math.sin(tt*3)>0)?'#7cf0a8':'#2a5a3a';const [a,b]=P(9.6,.95,19);circ(a,b,1.2,bl);
    for(let k=0;k<3;k++)sBox(8.8+k*.25,.4,9.0+k*.25,.6,25,27+k,'#fffdf8');});
  add(9.6,2.2,()=>{sBox(9.1,1.5,9.8,2.2,0,14,'#c8a46a');sBox(9.15,1.55,9.75,2.15,14,22,'#d6b47a');});
  // gente de pie al fondo / llegando tarde
  const late=(tt*.18)%1;// entra por la puerta y se queda de pie al fondo
  { const t0=Math.min(1,late*1.6);const x=.6+t0*.9,y=6.2-t0*.2;add(x,y,()=>sPerson(x,y,npc[11],{pose:t0<1?'walk':'stand',ph:tt*7,front:t0<1,right:true,act:t0<1?null:'phone'}));}
  if(n>18){add(9.3,4.4,()=>sPerson(9.3,4.4,npc[8],{front:false,right:false,act:'watch'}));add(9.4,5.4,()=>sPerson(9.4,5.4,npc[5],{front:false,right:false,act:'cheer'}));}
  if(n>25){add(9.3,6.4,()=>sPerson(9.3,6.4,elder(6),{front:false,right:false}));add(1.1,4.4,()=>sPerson(1.1,4.4,npc[9],{front:false,right:true,act:'book'}));}
  // compañera conocida
  if(cp&&!speak){add(6.4,2.9,()=>{fold(6.4,2.9,chairC,false);sPerson(6.4,2.9,{...npc[3],g:cp.g==='o'?'m':'f'},{pose:'sit',front:false,right:false,act:'talk',name:cp.n});back(6.4,2.9,chairC);});}
  // ---- Ana ----
  let ana;
  if(speak)ana={x:5.0,y:.5,pose:'stand',act:'talk',front:true,right:false};
  else{// de pie en el pasillo, con el turno de palabra (su silla queda con la chaqueta)
    const ph=(tt%10);ana={x:4.95,y:3.35,pose:'stand',act:ph<2.5?'cheer':'talk',front:false,right:true};
    add(aSeat[0]+.01,aSeat[1],()=>sBox(aSeat[0]-.22,aSeat[1]+.12,aSeat[0]+.22,aSeat[1]+.26,13,23,'#c75b39'));}
  // ---- luz final ----
  const after=()=>{if(night>.3){ctx.save();ctx.globalAlpha=.10*night;ctx.fillStyle='#ffd27a';const [a,b]=P(0,0,WH),[c,d]=P(W,D,0);ctx.fillRect(-2000,-2000,4000,4000);ctx.restore();}};
  return {W,D,floor:'#d9d4c8',wall:'#efe6d4',out:false,tile:true,decor,items:it,ana,drawBase,after};
};
// Escena: super
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Supermercado de barrio: frutería, cámara de frío, góndolas por secciones, tres cajas con cola, reponedora, guardia.
SCENES['super']=function(E){
  const {tt,night,act,w,npc,cp}=E;const h=E.h??12;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=12,D=10,WH=76,cr=(w&&w.crisis)||0,mov=(w&&w.mov)||0;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta',snow=wk==='nieve'||(S.snow||0)>1;
  const se=typeof seasonOf==='function'?seasonOf():'pri';
  const H_=i=>Math.abs(hash(i*7919+13))%1;
  // ---------- ayudas ----------
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const txt=(s,x,y,z,sz,col,onX,wt=900)=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`${wt} ${sz}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  const busy=h<9?.3:h<13?.65:h<16.5?.45:h<21?1:.25;
  const late=h>=21.3||h<8.2;
  const empt=cr>45?Math.min(.55,(cr-45)/70):0; // huecos en las estanterías
  const uni=k=>({...npc[k%12],pants:'#2b2f3a'}); // uniforme
  const UNI='#2f8f5b';
  // fila de productos pintada en una cara frontal (plano y=Y), entre x0..x1, apoyada en z
  const prodRow=(x0,x1,Y,z,hmax,pal,seed,tall)=>{let x=x0+.02,i=0;while(x<x1-.05){const r=H_(seed*31+i),r2=H_(seed*17+i*3);const wd=tall?.07+r*.06:.1+r*.12;const x2=Math.min(x1-.02,x+wd);
      if(H_(seed*5+i*11)>empt){const hh=hmax*(.55+r2*.45),c=pal[Math.floor(r2*pal.length)%pal.length];
        fY(x,x2,Y,z,z+hh,c);poly([P(x,Y-.12,z+hh),P(x2,Y-.12,z+hh),P(x2,Y,z+hh),P(x,Y,z+hh)],shade(c,1.18));
        if(tall){fY(x+(x2-x)*.3,x2-(x2-x)*.3,Y,z+hh,z+hh+3,shade(c,.8));}else if(hh>5)fY(x+.01,x2-.01,Y,z+hh*.45,z+hh*.65,'rgba(255,255,255,.35)');}
      x=x2+.012;i++;}};
  // ---------- calle vista por la puerta (pared izquierda, plano x=0) ----------
  const street=(y0,y1,z0,z1)=>{ctx.save();const q=[P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)];ctx.beginPath();ctx.moveTo(...q[0]);for(let k=1;k<4;k++)ctx.lineTo(...q[k]);ctx.closePath();ctx.clip();
    const sky=night>.5?'#1b2140':'#bfe3f7';fX(0,y0,y1,z0,z1,sky);
    const side=snow?'#eef2f5':mixHex('#cfc8bb','#3a3f55',night*.7),road=snow?'#d9dee3':mixHex('#6b6f78','#22263a',night*.7);
    topQuad(-1.1,y0-3,0,y1+3,0,side);topQuad(-6,y0-3,-1.1,y1+3,0,road);topQuad(-1.15,y0-3,-1.05,y1+3,1,'#e8e2d4');
    if(rain)for(let k=0;k<5;k++)isoEll(-.5-H_(k)*.5,y0+H_(k+9)*(y1-y0),0,.25,'rgba(120,150,190,.35)');
    // gente que pasa por la acera
    for(let k=0;k<3;k++){const sp=.35+k*.12,L=(y1-y0)+5;const t=((tt*sp+k*2.7)%L+L)%L;const dir=k%2?1:-1;const yy=dir>0?y0-2.5+t:y1+2.5-t;
      sPerson(-.45-k*.12,yy,npc[(k+7)%12],{pose:'walk',ph:tt*7+k,front:dir>0,right:dir<0,prop:rain?'☂️':(k===1?'🛍️':null)});}
    if(night>.4){const [lx,ly]=P(-.8,(y0+y1)/2,0);const g=ctx.createRadialGradient(lx,ly,2,lx,ly,60);g.addColorStop(0,`rgba(255,215,140,${.35*night})`);g.addColorStop(1,'rgba(255,215,140,0)');ctx.fillStyle=g;ctx.fillRect(lx-60,ly-60,120,120);}
    if(rain){ctx.strokeStyle='rgba(200,220,255,.55)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<26;k++){const yy=y0+H_(k)*(y1-y0),zz=z0+((H_(k+40)*(z1-z0)-tt*90)%(z1-z0)+(z1-z0))%(z1-z0);const [a,b]=P(0,yy,zz);ctx.moveTo(a,b);ctx.lineTo(a-2,b+7);}ctx.stroke();}
    if(snow){for(let k=0;k<22;k++){const yy=y0+((H_(k)*(y1-y0)+Math.sin(tt+k)*.2)),zz=z0+((H_(k+40)*(z1-z0)-tt*14)%(z1-z0)+(z1-z0))%(z1-z0);const [a,b]=P(0,yy,zz);circ(a,b,1.3,'rgba(255,255,255,.9)');}}
    ctx.restore();};
  // ---------- base: suelo de baldosa clara + paredes ----------
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#7d7466');topQuad(0,0,W,D,0,'#ebe8e1');
    for(let i=0;i<W;i++)for(let j=0;j<D;j++)if((i+j)%2)topQuad(i,j,i+1,j+1,0,'#e2ded5');
    ctx.strokeStyle='rgba(0,0,0,.05)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    // reflejos de los fluorescentes en el suelo
    for(const yy of [3.05,5.25])for(let k=0;k<4;k++){const [a,b]=P(3.6+k*1.9,yy);ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(a,b,16,4,.46,0,Math.PI*2);ctx.fill();}
    // paredes
    const wc='#f1eee6';sBox(0,-.15,W,0,0,WH,wc);sBox(-.15,-.15,0,D,0,WH,shade(wc,.95));
    fY(0,W,0,0,7,'#9aa0a6');fX(0,0,D,0,7,'#8f959b');
    fY(0,W,0,54,WH-4,UNI);fX(0,0,D,54,WH-4,shade(UNI,.9));
    fY(0,W,0,WH-4,WH-2,'#fffdf8');fX(0,0,D,WH-4,WH-2,'#fffdf8');
    // puerta automática de entrada
    street(7.1,9.5,0,58);
    const op=Math.max(0,Math.sin(tt*.6))*.5; // las hojas se abren
    fX(0,7.1-0,7.1+.08,0,58,'#8a9097');
    fX(0,7.1+op*0,8.3-op,0,58,'rgba(190,225,240,.28)');fX(0,8.3+op,9.5,0,58,'rgba(190,225,240,.28)');
    for(const yy of [7.1,8.3-op,8.3+op,9.5]){fX(0,yy-.04,yy+.04,0,58,'#9aa0a6');}
    fX(0,7.1,9.5,58,61,'#9aa0a6');
    fX(0,7.25,9.35,63,70,'#ffffff');txt(TXN.escenas.entrada_salida,0,8.3,66.5,6.5,UNI,true);
    // puerta del almacén
    fX(0,5.7,6.7,0,46,'#b9b2a4');fX(0,5.75,6.65,2,44,'#cfc8ba');circ(...P(0,5.85,23),1.4,'#6d6d6d');
    fX(0,5.85,6.55,30,40,'#fffdf8');txt('SOLO',0,6.2,37,4.5,'#d1242f',true);txt('PERSONAL',0,6.2,33,4.5,'#d1242f',true);
    // tablón de la plantilla junto al almacén
    fX(0,5.75,6.65,48,53,'#c49a6c');
    // extintor y reloj
    { const [a,b]=P(0,6.95,16);capsule(a,b,a,b-11,4,'#d1242f');circ(a,b-12,1.6,'#2b2b33');
      fX(0,6.83,7.07,24,28,'#d1242f');}
    { const [a,b]=P(6.2,0,64);ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.ellipse(a,b,6,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#2b2b33';ctx.lineWidth=1;ctx.stroke();
      const mm=(h%1)*Math.PI*2,hh=(h%12)/12*Math.PI*2;capsule(a,b,a+Math.sin(hh)*3,b-Math.cos(hh)*3,1.2,'#2b2b33');capsule(a,b,a+Math.sin(mm)*4.6,b-Math.cos(mm)*4.6,.8,'#2b2b33');}
    // rótulo de la tienda
    const nm=(S.office&&S.track==='super'&&S.office.n)||'Supermercado';
    txt(nm.toUpperCase(),3.1,0,63,10,'#fffdf8');txt(TXN.escenas.frescos_alimentacion_drogueria,9.3,0,63,7,'#e8f5ec',false,700);
    if(late){fY(7.3,9.5,0,50,59,'#fffdf8');txt(TXN.escenas.cerramos_a_las_22_00,8.4,0,54.5,5.5,'#d1242f');}
  };
  // ---------- decor: lo pegado a las paredes ----------
  const decor=()=>{
    // cámara de frío (lácteos) en la pared del fondo
    const fx0=.3,fx1=6.6,fy=.85;sBox(fx0,0,fx1,fy,0,50,'#dfe4e8');
    fY(fx0+.08,fx1-.08,fy,6,46,'#26323a');
    const dairy=['#fbfbf6','#fbfbf6','#3a7bd5','#f4d35e','#e85d9f','#6ec1e4','#fbfbf6','#2e8b57'];
    for(let L=0;L<4;L++){const z=8+L*9.5;fY(fx0+.08,fx1-.08,fy,z-1,z,'#9fb4c0');prodRow(fx0+.1,fx1-.1,fy,z,7.5,dairy,40+L,L===0);}
    // luz fría interior
    fY(fx0+.08,fx1-.08,fy,44,46,'rgba(220,245,255,.95)');
    fY(fx0+.08,fx1-.08,fy,6,46,`rgba(150,210,255,${.12+.04*Math.sin(tt*2)})`);
    for(let x=fx0+.08;x<fx1-.1;x+=1.05){fY(x,x+.05,fy,6,46,'#c9d1d6');fY(x+.06,x+1.0,fy,6,46,'rgba(255,255,255,.08)');poly([P(x+.2,fy,40),P(x+.32,fy,40),P(x+.12,fy,12),P(x+.06,fy,12)],'rgba(255,255,255,.22)');}
    fY(fx0,fx1,fy,46,50,'#2a7fd4');txt(TXN.escenas.frio_lacteos_yogures,(fx0+fx1)/2,fy,48,5.5,'#fff');
    // vaho de la cámara
    for(let k=0;k<4;k++){const [a,b]=P(1+k*1.5,fy+.05,8+((tt*6+k*7)%14));ctx.fillStyle='rgba(235,248,255,.18)';ctx.beginPath();ctx.ellipse(a,b,10,3,0,0,Math.PI*2);ctx.fill();}
    // estantería de droguería en la pared del fondo
    const sx0=7.1,sx1=11.8,sy=.6;sBox(sx0,0,sx1,sy,0,46,'#cfd3d6');fY(sx0+.05,sx1-.05,sy,3,44,'#eef0f1');
    const drog=['#f08a24','#2a7fd4','#f4f1ea','#9b5de5','#2bb3a3','#e85d9f','#ffd23f','#5bc0be'];
    for(let L=0;L<4;L++){const z=4+L*10;fY(sx0+.05,sx1-.05,sy,z-1,z,'#b5bbbf');prodRow(sx0+.08,sx1-.08,sy,z,8.5,drog,90+L,L%2===1);}
    fY(sx0,sx1,sy,44,48,'#9b5de5');txt(TXN.escenas.drogueria_higiene,(sx0+sx1)/2,sy,46,5.5,'#fff');
    // cartel de oferta encima de la droguería
    fY(9.9,11.6,0,51,60,'#ffd23f');txt('2ª ud. -50%',10.75,0,55.5,7,'#d1242f');
    // frutería contra la pared izquierda: cajas inclinadas
    const fru={pri:['#e63946','#f4a261','#9acd32','#ffd23f','#e76f51','#6a994e'],ver:['#e63946','#ff9f1c','#2a9d3a','#f4a261','#ffd23f','#c1121f'],oto:['#ff8c00','#9acd32','#8b3a62','#c97c2b','#e63946','#6a994e'],inv:['#ff8c00','#ffa62b','#9acd32','#f4d35e','#c97c2b','#e63946']}[se]||['#e63946','#ff8c00','#9acd32','#ffd23f'];
    const names={pri:['fresas','naranjas','peras','plátanos','tomates','lechugas'],ver:['sandía','melocotón','pepinos','nectarinas','plátanos','cerezas'],oto:['mandarinas','uvas','higos','castañas','manzanas','calabacín'],inv:['naranjas','mandarinas','kiwis','limones','patatas','manzanas']}[se]||[];
    sBox(.1,.9,1.5,5.5,0,10,'#7a5a3a');
    for(let k=0;k<6;k++){const y0=1.0+k*.75,y1=y0+.68;
      // dos filas: alta (atrás) y baja (delante), inclinadas hacia el pasillo
      for(const [xa,xb,za,zb] of [[.15,.8,24,16],[.8,1.45,16,10]]){
        poly([P(xa,y0,za),P(xa,y1,za),P(xb,y1,zb),P(xb,y0,zb)],'#a0754c');
        const c=fru[(k+(xa>.5?3:0))%fru.length];const full=H_(k*9+(xa>.5?1:0))>empt*.8;
        if(full)for(let a=0;a<3;a++)for(let b=0;b<4;b++){const u=xa+(xb-xa)*(.2+a*.3),v=y0+.1+b*.16,z=za+(zb-za)*(.2+a*.3)+2;const [px,py]=P(u,v,z);circ(px,py,2.3,shade(c,.92+H_(k*40+a*4+b)*.2));circ(px-.6,py-.7,.7,'rgba(255,255,255,.5)');}
        fX(xb,y0,y1,zb-3,zb,'#8a6a4a');}
      // precio en pizarrín
      const pr=(0.99+H_(k)*2.5)*(1+cr/150);fX(1.5,y0+.12,y0+.56,11,17,'#2b2b33');txt(pr.toFixed(2).replace('.',',')+'€',1.5,y0+.34,14.5,4.5,'#fffdf8',true);}
    sBox(.15,.85,.4,5.55,24,48,'#6b4a2e');fX(.4,.95,5.45,40,48,'#3c6e47');txt('FRUTERÍA',.4,3.2,44,7,'#fffdf8',true);
    // báscula de la fruta y rollo de bolsas
    sBox(1.55,5.55,1.95,5.95,0,18,'#cfd3d6');sBox(1.6,5.6,1.9,5.9,18,20,'#9aa0a6');fX(1.95,5.62,5.88,14,18,'#7cf0a8');
    // carteles en la pared izquierda
    fX(0,2.0,3.2,52,53,'#fff');
    // tablón: avisos de la plantilla (asamblea / ERE)
    if(mov>40||cr>60){fX(0,5.0,5.6,26,40,'#fffdf8');txt(cr>60?'ERE':'ASAMBLEA',0,5.3,36,4.5,'#d1242f',true);txt(cr>60?'¡Infórmate!':'jueves 18h',0,5.3,31,3.8,'#3b3247',true,700);}
    if(S.strike&&S.strike.on){fX(0,4.3,4.95,26,40,'#d1242f');txt('HUELGA',0,4.62,33,4.5,'#fff',true);}
  };
  // ---------- góndolas centrales por segmentos ----------
  const gond=(x0,len,y0,pal,lbl,tall,seed)=>{const y1=y0+.75;
    for(let k=0;k<len;k++){const x=x0+k,last=k===len-1;add(x+.5,y1,()=>{
      sBox(x,y0,x+1,y1,0,44,'#e4e6e8');fY(x,x+1,y1,0,4,'#9aa0a6');
      fY(x+.03,x+.97,y1,4,42,'#f3f4f5');
      for(let L=0;L<4;L++){const z=5+L*9.5;fY(x,x+1,y1,z-1.2,z,'#c3c8cc');prodRow(x+.04,x+.96,y1,z,tall?8:7.5,pal,seed+k*7+L,tall&&L>0);
        // etiquetas de precio
        for(let j=0;j<3;j++){const off=H_(seed+k*13+L*3+j)<.18;fY(x+.1+j*.32,x+.24+j*.32,y1+.001,z-1.2,z+.4,off?'#ffd23f':'#fffdf8');}}
      if(last){fX(x+1,y0+.05,y1-.05,4,42,'#d9dcdf');}
      // género de reserva encima de la góndola
      if(H_(seed+k*3)>.35+empt){const bx=x+.15+H_(seed+k)*.35;sBox(bx,y0+.15,bx+.45,y0+.6,44,44+6+H_(k+seed)*5,'#c8a46a');}
    });}
    // cabecera de la góndola (oferta)
    const ex=x0+len;add(ex+.4,y1-.05,()=>{sBox(ex,y0+.05,ex+.7,y1-.05,0,26,'#d1242f');for(let L=0;L<2;L++){const z=4+L*10;const c=pal[(L*3+seed)%pal.length];
        if(H_(seed+L)>empt)for(let j=0;j<3;j++){const yy=y0+.1+j*.2;fX(ex+.7,yy,yy+.17,z,z+8,c);poly([P(ex+.7,yy,z+8),P(ex+.7,yy+.17,z+8),P(ex+.58,yy+.17,z+8),P(ex+.58,yy,z+8)],shade(c,1.15));}}
      fX(ex+.7,y0+.05,y1-.05,26,38,'#ffd23f');txt('OFERTA',ex+.7,(y0+y1)/2,34.5,6.5,'#d1242f',true);txt(lbl,ex+.7,(y0+y1)/2,29,4.3,'#3b3247',true,800);});
  };
  gond(3,7,1.95,['#d9a23a','#c8412f','#e9d8a6','#3c6e47','#f2c14e','#b5542f','#f4f1ea','#7a2e3b'],'aceite 1L',false,200);
  gond(3,7,3.85,['#3a7bd5','#e8eef4','#d1242f','#2e8b57','#f0ad4e','#7a2e3b','#1d3557'],'agua 6×1,5L',true,300);
  // límite de unidades cuando aprieta la crisis
  if(cr>55)add(4.5,2.75,()=>{fY(3.6,4.6,2.71,35,41,'#fffdf8');txt(TXN.escenas.max_2_por_cliente,4.1,2.71,38,4.3,'#d1242f',false,800);});
  // ---------- cajas registradoras: cinta a lo largo de y, cajera a la izquierda ----------
  const cajas=[3.0,6.2,9.4];const open3=busy>=.6&&cr<60;
  const caja=(cx,on)=>{
    add(cx+.4,6.9,()=>{sBox(cx,5.9,cx+.8,6.9,0,22,'#e8e2d4');sTop(cx+.05,5.92,cx+.75,6.9,22.1,'#2b2b33');
      // cinta en movimiento
      if(on){ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<5;k++){const v=5.95+((k*.2+tt*.15)%1);ctx.moveTo(...P(cx+.06,v,22.2));ctx.lineTo(...P(cx+.74,v,22.2));}ctx.stroke();}
      fX(cx+.8,5.95,6.85,4,6,UNI);});
    add(cx+.4,7.9,()=>{sBox(cx,6.9,cx+.8,7.9,0,22,'#e8e2d4');sTop(cx+.05,6.9,cx+.75,7.5,22.1,'#2b2b33');sTop(cx+.05,7.5,cx+.75,7.88,22.1,'#b5bbbf');
      // escáner con luz roja
      sBox(cx+.1,7.45,cx+.7,7.55,22,24,'#3b3f46');if(on&&Math.sin(tt*9)>0)sTop(cx+.15,7.46,cx+.65,7.54,24.2,'#ff4d4d');
      // pantalla y número de caja
      sBox(cx-.05,7.1,cx+.1,7.35,22,32,'#3b3f46');fX(cx+.1,7.12,7.33,25,31,on?'#7cf0a8':'#2b2b33');
      cyl(cx+.05,7.2,.05,22,46,'#9aa0a6');sBox(cx-.12,7.05,cx+.22,7.35,46,54,on?UNI:'#9aa0a6');fX(cx+.22,7.05,7.35,46,54,on?UNI:'#9aa0a6');
      txt(String(cajas.indexOf(cx)+1),cx+.22,7.2,50,7,'#fff',true);
      fX(cx+.8,6.95,7.85,4,6,UNI);
      if(!on){sBox(cx+.1,6.0,cx+.7,6.25,22.2,30,'#fffdf8');fY(cx+.1,cx+.7,6.25,22.2,30,'#fffdf8');txt('CAJA',cx+.4,6.25,28,4,'#d1242f');txt('CERRADA',cx+.4,6.25,24.6,4,'#d1242f');}});
    // mampara de la cajera (delante)
    add(cx-.5,8.05,()=>{sBox(cx-1.05,7.85,cx,8.0,0,24,'#d8d2c4');sTop(cx-1.05,7.85,cx,8.0,24.1,'#a0754c');});
    // productos sobre la cinta
    if(on)add(cx+.4,6.6,()=>{for(let k=0;k<4;k++){const v=6.0+((k*.27+tt*.06)%1.3);if(v>7.35)continue;const c=['#d1242f','#fbfbf6','#f2c14e','#3a7bd5','#2e8b57'][(k+Math.floor(cx))%5];sBox(cx+.2+(k%2)*.22,v,cx+.38+(k%2)*.22,v+.14,22.2,27+(k%3)*2,c);}});
  };
  cajas.forEach((cx,i)=>caja(cx,i===1||i===2||(i===0&&open3)));
  // cajeras
  const cashier=(cx,ch,name)=>add(cx-.5,7.1,()=>sPerson(cx-.5,7.1,ch,{act:'type',front:true,right:true,shirt:UNI,name}));
  let ana={x:6.2-.5,y:7.1,pose:'stand',act:'type',front:true,right:true};
  if(act!=='work')cashier(6.2,uni(2),null);
  cashier(9.4,cp?{...cp.ch,pants:'#2b2f3a'}:uni(5),cp?cp.n:null);
  if(open3)cashier(3.0,uni(10),null);
  // clientes en las colas (crecen con la crisis y la hora punta)
  const ql=Math.min(5,Math.round(busy*2.2+cr/32));
  const qpos=k=>k<3?[.0,6.75-k*.68]:[-.65-(k-3)*.62,5.3];
  cajas.forEach((cx,i)=>{const on=i>0||open3;if(!on)return;const n=Math.max(0,ql-(i===2?1:0));
    for(let k=0;k<=n;k++){const [dx,yy]=qpos(k);const xx=cx+1.2+dx,ch=npc[(k*3+i*5+1)%12],old=(k+i)%4===1;const C=old?elder(k+i):ch;
      const prop=k===0?null:(H_(k+i*9)<.4?'🧺':(rain&&H_(k+i)<.6?'☂️':null));
      add(xx,yy,()=>{sPerson(xx,yy,C,{front:false,right:false,act:k===0?(Math.sin(tt*.8+i)>.3?'talk':null):(H_(k*7+i)<.3?'phone':null),prop});});
      if(k>0&&(k+i)%3===0)add(xx+.1,yy-.45,()=>sc_super_cart(xx-.2,yy-.75,tt,true));
      if(old&&k>0)add(xx-.15,yy+.2,()=>sc_super_trolley(xx-.4,yy+.1));}
  });
  // clientes por los pasillos (caminando con carro o cesta)
  const walkers=Math.round(1+busy*4-(cr>70?1:0));
  const lanes=[[1.42,2.5,10.8],[3.25,2.6,10.6],[5.2,2.0,11.2]];
  for(let k=0;k<walkers;k++){const [yy,xa,xb]=lanes[k%3];const L=xb-xa,sp=.28+H_(k)*.18;const t=(tt*sp+H_(k+3)*20)%(2*L);const fw=t<L;const xx=fw?xa+t:xb-(t-L);
    const C=k%4===3?elder(k):npc[(k*5+3)%12];const cart=k%2===0;
    if(cart){const cx=xx+(fw?.35:-.95);add(cx+.3,yy+.2,()=>sc_super_cart(cx,yy-.18,tt,fw));}
    add(xx,yy+.05,()=>sPerson(xx,yy+.05,C,{pose:'walk',ph:tt*6+k,front:fw,right:fw,prop:cart?null:'🧺'}));}
  // quien se para delante de la nevera a elegir
  add(3.5,1.55,()=>sPerson(3.5,1.55,npc[8],{front:false,right:true,act:'book',prop:null}));
  // la de la frutería eligiendo
  add(2.0,3.1,()=>sPerson(2.0,3.1,elder(3),{front:false,right:false,act:'stir'}));
  add(2.35,3.6,()=>sc_super_trolley(2.15,3.5));
  if(busy>.5)add(2.1,4.7,()=>sPerson(2.1,4.7,npc[11],{front:false,right:false,act:'phone'}));
  // reponedora con cajas (más trabajo de noche)
  const rx=late?6.5:8.4;add(rx,3.15,()=>{sPerson(rx,3.15,uni(6),{front:false,right:true,act:'stir',shirt:UNI});});
  add(rx+.9,3.4,()=>{sBox(rx+.55,3.0,rx+1.35,3.6,0,3,'#b08850');sBoxes(rx+.6,3.05);sBox(rx+.62,3.05,rx+1.22,3.55,0,15,'#c8a46a');if(late){sBox(rx+.65,3.1,rx+1.2,3.5,30,38,'#d6b47a');}});
  // guardia de seguridad junto a la entrada
  const gy=6.6+Math.sin(tt*.25)*.5;add(1.0,gy,()=>{sPerson(1.0,gy,{...npc[0],style:'rapado',hair:'#2b2b33',pants:'#1d2230'},{front:true,right:true,shirt:'#1d2a44',pose:Math.abs(Math.cos(tt*.25))>.2?'walk':'stand',ph:tt*4});
});
  // gente que sale con bolsas hacia la puerta
  const outn=Math.round(busy*2);for(let k=0;k<outn;k++){const L=10.5,t=(tt*.4+k*5.3)%L;const xx=11-t,yy=8.85+(k%2)*.4;if(xx<.4)continue;
    add(xx,yy,()=>sPerson(xx,yy,npc[(k*7+2)%12],{pose:'walk',ph:tt*6+k,front:false,right:false,prop:rain&&k===0?'☂️':'🛍️'}));}
  // carros apilados y cestas junto a la entrada
  add(.8,9.4,()=>{for(let k=0;k<4;k++)sc_super_cart(.3+k*.18,9.2,0,true,true);});
  add(2.4,9.5,()=>{for(let k=0;k<4;k++)sBox(2.1,9.2,2.6,9.6,k*3,k*3+3,k%2?'#c1121f':'#d1242f');});
  // cartel de suelo mojado cuando llueve
  if(rain||snow)add(1.6,8.2,()=>{const [a,b]=P(1.6,8.2);poly([[a-5,b],[a+5,b],[a+1.5,b-18],[a-1.5,b-18]],'#ffd23f');emoji('⚠️',a,b-9,7);});
  // ---------- capa final: carteles colgados, fluorescentes, luz ----------
  const after=()=>{
    const hang=(x,y,z,txt1,txt2,col)=>{const [a,b]=P(x,y,z+14);const [,c]=P(x,y,WH+30);capsule(a-10,b,a-10,c,.6,'rgba(60,60,60,.5)');capsule(a+10,b+5,a+10,c+5,.6,'rgba(60,60,60,.5)');
      fY(x-.6,x+.6,y,z,z+14,col);fY(x-.6,x+.6,y,z,z+1.2,shade(col,.7));txt(txt1,x,y,z+9.5,6.5,'#fff');if(txt2)txt(txt2,x,y,z+4,4.5,'#fff',false,700);};
    hang(4.6,2.7,66,'PASILLO 1',TXN.escenas.conservas_aceite_pasta,UNI);
    hang(4.6,4.6,66,'PASILLO 2',TXN.escenas.agua_refrescos_cerveza,UNI);
    hang(8.6,3.4,70,cr>55?'PRECIOS':'OFERTAS',cr>55?TXN.escenas.congelados_en_300_productos:'de la semana','#d1242f');
    if(night>.3){ctx.save();ctx.globalCompositeOperation='multiply';const [a,b]=P(W/2,D/2,20);const g=ctx.createRadialGradient(a,b,60,a,b,420);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,`rgba(70,80,120,${.2*night})`);ctx.fillStyle=g;ctx.fillRect(a-500,b-400,1000,800);ctx.restore();}
  };
  return {W,D,floor:'#ebe8e1',wall:'#f1eee6',out:false,tile:true,decor,items:it,ana,drawBase,after};
};
// carro de la compra (rejilla metálica); dir=true mira hacia +x
function sc_super_cart(x,y,tt,dir,stacked){const c='#aab2ba';const x0=x,x1=x+.6,y0=y,y1=y+.38;
  const [w1x,w1y]=P(x0+.08,y1);const [w2x,w2y]=P(x1-.08,y1);circ(w1x,w1y,1.6,'#2b2b33');circ(w2x,w2y,1.6,'#2b2b33');
  poly([P(x0,y0,14),P(x1,y0,14),P(x1,y1,14),P(x0,y1,14)],'rgba(150,160,170,.25)');
  ctx.strokeStyle=c;ctx.lineWidth=1;ctx.beginPath();
  for(const [a,b] of [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]){ctx.moveTo(...P(a,b,6));ctx.lineTo(...P(a,b,22));}
  for(const z of [6,14,22]){ctx.moveTo(...P(x0,y0,z));ctx.lineTo(...P(x1,y0,z));ctx.lineTo(...P(x1,y1,z));ctx.lineTo(...P(x0,y1,z));ctx.closePath();}
  for(let k=1;k<4;k++){const u=x0+k*.15;ctx.moveTo(...P(u,y1,6));ctx.lineTo(...P(u,y1,22));}
  ctx.stroke();const hx=dir?x0-.08:x1+.08;capsule(...P(hx,y0,24),...P(hx,y1,24),2,stacked?'#2f8f5b':'#d1242f');
  if(!stacked&&tt){for(let k=0;k<3;k++){const c2=['#f2c14e','#3a7bd5','#e85d3f','#fbfbf6'][(k+Math.floor(x*3))%4];sBox(x0+.08+k*.16,y0+.08,x0+.2+k*.16,y1-.08,8,15+k*2,c2);}}}
// carrito de la compra de cuadros (el de las abuelas)
function sc_super_trolley(x,y){const [a,b]=P(x,y);circ(a-2,b,1.8,'#2b2b33');circ(a+3,b+1,1.8,'#2b2b33');sBox(x-.12,y-.12,x+.12,y+.12,3,20,'#7a2e3b');
  const [c,d]=P(x+.12,y-.12,14);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(c-6,d);ctx.lineTo(c+2,d+4);ctx.moveTo(c-6,d-6);ctx.lineTo(c+2,d-2);ctx.stroke();
  capsule(...P(x-.1,y-.1,20),...P(x-.18,y-.18,32),1.4,'#3b3f46');}
// Escena: tienda
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Tienda de barrio (el negocio de Ana): escaparate a la calle, mostrador con caja y báscula, estanterías, nevera, fruta.
SCENES['tienda']=function(E){
  const {tt,night,act,w,npc}=E;const h=E.h??12;const it=[],add=(x,y,f)=>it.push({d:x+y,f});
  const W=8,D=6,WH=74,cr=(w&&w.crisis)||0,mov=(w&&w.mov)||0;
  const wk=(S.weather&&S.weather.k)||'sol',rain=wk==='lluvia'||wk==='tormenta',snow=wk==='nieve'||(S.snow||0)>1;
  const se=typeof seasonOf==='function'?seasonOf():'pri';
  const H_=i=>Math.abs(hash(i*7919+71))%1;
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const txt=(s,x,y,z,sz,col,onX,wt=900,font='Nunito, sans-serif')=>{const [a,b]=P(x,y,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`${wt} ${sz}px ${font}`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  const mine=S.track==='negocio';const nm=mine?(CH().name||'Ana'):'Mari';
  const late=h>=20.5||h<8.5;const shut=h>=21?Math.min(1,(h-21)*2+.45):h<8.5?.6:0; // persiana bajando
  const busy=(h<9.5?.35:h<14?.85:h<17?.3:h<20.5?.75:.15)*(1-Math.max(0,cr-35)/120);
  const empt=cr>45?Math.min(.5,(cr-45)/70):0;
  const fiado=cr>55; // la libreta de fiados
  // ---------- la calle detrás del escaparate (plano y=0) ----------
  const street=(x0,x1,z0,z1)=>{ctx.save();const q=[P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)];ctx.beginPath();ctx.moveTo(...q[0]);for(let k=1;k<4;k++)ctx.lineTo(...q[k]);ctx.closePath();ctx.clip();
    fY(x0,x1,0,z0,z1,night>.5?'#1b2140':'#bfe3f7');
    const side=snow?'#eef2f5':mixHex('#d6cfc2','#2c3150',night*.75),road=snow?'#d9dee3':mixHex('#6b6f78','#1d2136',night*.75);
    topQuad(x0-4,-1.0,x1+4,0,0,side);topQuad(x0-4,-6,x1+4,-1.0,0,road);topQuad(x0-4,-1.05,x1+4,-.95,1,'#e8e2d4');
    for(let k=0;k<6;k++){const u=x0-2+k*1.6-((tt*.0)%1.6);topQuad(u,-2.1,u+.7,-2.0,.2,'rgba(255,255,255,.6)');}
    if(rain)for(let k=0;k<4;k++)isoEll(x0+H_(k)*(x1-x0),-.4-H_(k+3)*.4,0,.3,'rgba(120,150,190,.35)');
    // coches que pasan
    {const L=(x1-x0)+10,t=(tt*1.6)%L;const u=x0-5+t;drawCar(u,-1.55,['#d1242f','#2a7fd4','#f2c14e','#e8e2d4'][Math.floor(tt*1.6/L)%4],[u+1,-1.55],night);}
    // gente por la acera
    for(let k=0;k<3;k++){const sp=.32+k*.1,L=(x1-x0)+6;const t=((tt*sp+k*3.3)%L+L)%L;const dir=k%2?1:-1;const xx=dir>0?x0-3+t:x1+3-t;
      sPerson(xx,-.45-k*.15,npc[(k+3)%12],{pose:'walk',ph:tt*7+k,front:dir<0,right:dir>0,prop:rain?'☂️':(k===0?'🛍️':k===2&&!night?'🐕':null)});}
    if(night>.4){const [lx,ly]=P((x0+x1)/2,-.9,0);const g=ctx.createRadialGradient(lx,ly,2,lx,ly,80);g.addColorStop(0,`rgba(255,205,130,${.4*night})`);g.addColorStop(1,'rgba(255,205,130,0)');ctx.fillStyle=g;ctx.fillRect(lx-80,ly-80,160,160);}
    // persiana metálica bajando por la noche
    if(shut>0){const zb=z1-(z1-z0)*shut;fY(x0,x1,-.05,zb,z1,'#8f959b');ctx.strokeStyle='rgba(40,40,50,.35)';ctx.lineWidth=.8;ctx.beginPath();for(let z=zb+2;z<z1;z+=3){ctx.moveTo(...P(x0,-.05,z));ctx.lineTo(...P(x1,-.05,z));}ctx.stroke();fY(x0,x1,-.05,zb,zb+1.5,'#5a5f66');}
    if(rain){ctx.strokeStyle='rgba(200,220,255,.5)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<26;k++){const xx=x0+H_(k)*(x1-x0),zz=z0+((H_(k+40)*(z1-z0)-tt*90)%(z1-z0)+(z1-z0))%(z1-z0);const [a,b]=P(xx,0,zz);ctx.moveTo(a,b);ctx.lineTo(a-2,b+7);}ctx.stroke();}
    if(snow){for(let k=0;k<20;k++){const xx=x0+H_(k)*(x1-x0)+Math.sin(tt+k)*.15,zz=z0+((H_(k+40)*(z1-z0)-tt*14)%(z1-z0)+(z1-z0))%(z1-z0);const [a,b]=P(xx,0,zz);circ(a,b,1.3,'rgba(255,255,255,.9)');}}
    ctx.restore();
    fY(x0,x1,0,z0,z1,night>.5?'rgba(255,220,170,.05)':'rgba(220,240,255,.16)');
    for(const f of [.15,.55])poly([P(x0+(x1-x0)*f,0,z1-4),P(x0+(x1-x0)*f+.35,0,z1-4),P(x0+(x1-x0)*f+.05,0,z0+4),P(x0+(x1-x0)*f-.3,0,z0+4)],'rgba(255,255,255,.12)');};
  // ---------- base ----------
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#5d4a38');topQuad(0,0,W,D,0,'#d9cbb2');
    // baldosa de barro pequeña
    for(let i=0;i<W*2;i++)for(let j=0;j<D*2;j++)if((i+j)%2)topQuad(i/2,j/2,i/2+.5,j/2+.5,0,'#cfbea0');
    ctx.strokeStyle='rgba(80,60,40,.1)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W*2;k++){ctx.moveTo(...P(k/2,0));ctx.lineTo(...P(k/2,D));}for(let k=1;k<D*2;k++){ctx.moveTo(...P(0,k/2));ctx.lineTo(...P(W,k/2));}ctx.stroke();
    // felpudo en la entrada
    topQuad(5.0,.15,6.3,.9,.3,'#6b4a2e');topQuad(5.1,.25,6.2,.8,.4,'#7a5a3a');
    const wc='#e9eef2';sBox(0,-.15,W,0,0,WH,wc);sBox(-.15,-.15,0,D,0,WH,shade(wc,.95));
    fX(0,0,D,0,8,'#8a6a4a');fY(6.4,W,0,0,8,'#8a6a4a');
    // escaparate y puerta
    street(.35,4.65,8,62);
    fY(.25,.35,0,0,64,'#5a3a22');fY(4.65,4.8,0,0,64,'#5a3a22');fY(.25,4.8,0,62,65,'#5a3a22');fY(.25,4.8,0,0,8,'#7a5230');
    street(5.0,6.3,0,60);fY(4.9,5.0,0,0,62,'#5a3a22');fY(6.3,6.4,0,0,62,'#5a3a22');fY(4.9,6.4,0,60,63,'#5a3a22');
    capsule(...P(6.15,0,34),...P(6.15,0,26),1.6,'#c9a227');
    fY(5.25,6.05,0,40,47,'#fffdf8');txt(late&&h>=21||h<8.5?'CERRADO':'ABIERTO',5.65,0,43.5,4.2,late&&h>=21||h<8.5?'#d1242f':'#2e8b57');
    // campanilla de la puerta (se mueve cuando entra alguien)
    {const sw=Math.sin(tt*9)*Math.max(0,1-((tt*.5)%7));const [a,b]=P(5.2,.1,58);capsule(a,b,a+sw*3,b+5,1,'#9aa0a6');circ(a+sw*3,b+6,2,'#c9a227');}
    // rótulo pintado en el cristal
    txt(mine?'ULTRAMARINOS':'COMESTIBLES',2.5,0,55,9,'rgba(170,30,30,.9)',false,900,'Georgia, serif');
    txt(nm.toUpperCase(),2.5,0,47,8,'rgba(170,30,30,.9)',false,900,'Georgia, serif');
    txt(TXN.escenas.frutas_embutidos_drogueria,2.5,0,41,4.5,'rgba(255,255,255,.8)',false,700);
    // pegatinas del cristal
    fY(5.1,5.45,0,26,32,'#2a7fd4');txt('VISA',5.27,0,29,2.6,'#fff');
    if(mov>45){fY(3.5,4.4,0,20,32,'#fffdf8');txt(S.strike&&S.strike.on?'APOYAMOS':'ASAMBLEA',3.95,0,28.5,3.2,'#d1242f');txt(S.strike&&S.strike.on?'LA HUELGA':'DE BARRIO',3.95,0,24.5,3.2,'#d1242f');}
    if(cr>60){fY(.6,1.8,0,20,30,'#ffd23f');txt('LIQUIDACIÓN',1.2,0,26.5,3.6,'#d1242f');txt('-20% todo',1.2,0,23,3.2,'#3b3247',false,800);}
    // pared derecha del fondo: reloj y licencia
    {const [a,b]=P(7.2,0,62);circ(a,b,4.5,'#fffdf8');ctx.strokeStyle='#5a3a22';ctx.lineWidth=1;ctx.beginPath();ctx.arc(a,b,4.5,0,Math.PI*2);ctx.stroke();const mm=(h%1)*Math.PI*2,hh=(h%12)/12*Math.PI*2;capsule(a,b,a+Math.sin(hh)*2.4,b-Math.cos(hh)*2.4,1,'#2b2b33');capsule(a,b,a+Math.sin(mm)*3.6,b-Math.cos(mm)*3.6,.7,'#2b2b33');}
    // pared izquierda: cartel y estantería alta
    fX(0,.3,5.7,64,72,'#5a3a22');txt(TXN.escenas.calidad_y_buen_precio_desde+(mine?((typeof dateOf==='function'&&dateOf(S.startDay||1).year)||2025):'1974'),0,3,68,5.2,'#f4e7c8',true,800);
  };
  // ---------- decor: estantería de la pared izquierda, escaparate, nevera ----------
  const decor=()=>{
    // escaparate: tarima con pirámides de latas y aceite
    sBox(.35,0,4.65,.6,0,9,'#7a5230');sTop(.35,0,4.65,.6,9.1,'#f4e7c8');
    for(let r=0;r<3;r++)for(let k=0;k<3-r;k++)cyl(.65+k*.24+r*.12,.3,.1,9+r*5,14+r*5,r%2?'#2e8b57':'#d1242f','#c9cdd2');
    for(let k=0;k<4;k++){const x=1.6+k*.22;fY(x,x+.14,.42,9,25,'#c9a227');fY(x+.04,x+.1,.42,25,29,'#2e5e3a');fY(x,x+.14,.42,14,19,'#fffdf8');}
    sBox(2.7,.15,3.4,.5,9,15,'#c8a46a');for(let j=0;j<5;j++){const [a,b]=P(2.8+j*.12,.3,16);circ(a,b,2.4,['#e63946','#ff8c00','#9acd32'][j%3]);}
    // un jamón colgado
    {const [a,b]=P(4.2,.3,56),[c,d]=P(4.2,.3,40);capsule(a,b-8,a,b,.8,'#c9a227');ctx.fillStyle='#8c3b2a';ctx.beginPath();ctx.ellipse(a,(b+d)/2,4,9,0,0,Math.PI*2);ctx.fill();capsule(a,b-2,a,b+2,2,'#5a3a22');}
    // estantería de madera hasta el techo en la pared izquierda
    sBox(0,.3,.55,5.7,0,62,'#8a6a4a');fX(.55,.35,5.65,2,60,'#5a3a22');
    const pal=['#d1242f','#f2c14e','#2e8b57','#fbfbf6','#3a7bd5','#8c3b2a','#c9a227','#e85d3f','#9b5de5','#2e5e3a'];
    for(let L=0;L<6;L++){const z=4+L*9.5;fX(.55,.35,5.65,z-1.2,z,'#a0754c');
      let y=5.6,i=0;while(y>.45){const r=H_(L*40+i),r2=H_(L*13+i*7);const wd=.1+r*.13;const y2=Math.max(.4,y-wd);
        if(H_(L*7+i*3)>empt){const c=pal[Math.floor(r2*pal.length)];const hh=4+r2*4.2;const jar=L===3||L===4&&r<.5;
          if(jar){fX(.55,y2,y,z,z+hh,'rgba(230,200,120,.75)');fX(.55,y2+.02,y-.02,z+hh,z+hh+1.4,'#c9a227');}
          else{fX(.55,y2,y,z,z+hh,c);poly([P(.55,y2,z+hh),P(.55,y,z+hh),P(.42,y,z+hh),P(.42,y2,z+hh)],shade(c,1.15));if(L===5){fX(.55,y2+.03,y-.03,z+hh,z+hh+3,shade(c,.75));}}}
        y=y2-.015;i++;}}
    // nevera de bebidas al fondo a la derecha
    sBox(6.6,0,7.8,.7,0,56,'#d1242f');fY(6.66,7.74,.7,6,48,'#1e2a33');
    for(let L=0;L<4;L++){const z=8+L*10;fY(6.66,7.74,.7,z-1,z,'#9fb4c0');for(let k=0;k<7;k++){if(H_(L*9+k)<empt)continue;const x=6.72+k*.145,c=['#d1242f','#2e8b57','#f2c14e','#3a7bd5','#e8eef4'][(k+L)%5];fY(x,x+.1,.7,z,z+7,c);fY(x+.03,x+.07,.7,z+7,z+8.5,shade(c,.8));}}
    fY(6.66,7.74,.7,6,48,`rgba(170,220,255,${.16+.03*Math.sin(tt*2)})`);fY(6.66,7.74,.7,48,56,'#d1242f');txt(TXN.escenas.bebidas_frias,7.2,.7,52,4.4,'#fff');
    poly([P(6.8,.7,46),P(6.95,.7,46),P(6.8,.7,8),P(6.7,.7,8)],'rgba(255,255,255,.2)');
    // estante bajo con pan y bollería junto a la puerta
    sBox(6.55,1.0,7.8,1.6,0,18,'#a0754c');sTop(6.6,1.05,7.75,1.55,18.1,'#c8a46a');
    for(let k=0;k<5;k++){if(H_(k+300)<empt)continue;const [a,b]=P(6.75+k*.22,1.3,20);ctx.fillStyle='#d9a25a';ctx.beginPath();ctx.ellipse(a,b,5,2.2,-.45,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a8702a';ctx.lineWidth=.6;ctx.stroke();}
    fX(7.8,1.05,1.55,10,16,'#fffdf8');txt('PAN',7.8,1.3,13,4,'#8c3b2a',true);
  };
  // ---------- mostrador a lo largo de y, Ana detrás (entre la estantería y el mostrador) ----------
  const cx0=1.35,cx1=2.0,cy0=1.0,cy1=4.8,CH_=24;
  for(let y=cy0;y<cy1-.01;y+=1.27){const y2=Math.min(cy1,y+1.27);add(cx1+.02,y2,()=>{
    sBox(cx0,y,cx1,y2,0,CH_,'#9a6b3c');fX(cx1,y+.08,y2-.08,4,CH_-3,'#87603a');fX(cx1,y+.18,y2-.18,7,CH_-6,'#a0754c');
    sBox(cx0-.03,y-.02,cx1+.03,y2+.02,CH_,CH_+1.6,'#d8cdb8');
    if(y2>=cy1)fY(cx0,cx1,y2,0,CH_,'#87603a');});}
  // vitrina de embutidos y quesos sobre el mostrador
  add(cx1+.03,2.9,()=>{const y0=1.2,y1=2.5,z0=CH_+1.6;sBox(cx0+.05,y0,cx1-.05,y1,z0,z0+1.5,'#c7cbcf');
    for(let k=0;k<4;k++){const yy=y0+.12+k*.3;const c=['#c1492f','#f2d27a','#8c3b2a','#e8c9a0'][k];const [a,b]=P((cx0+cx1)/2,yy+.12,z0+3);ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(a,b,5,2.4,-.45,0,Math.PI*2);ctx.fill();}
    poly([P(cx1-.05,y0,z0+1.5),P(cx1-.05,y1,z0+1.5),P(cx1-.15,y1,z0+9),P(cx1-.15,y0,z0+9)],'rgba(200,230,240,.3)');
    poly([P(cx1-.15,y0,z0+9),P(cx1-.15,y1,z0+9),P(cx0+.05,y1,z0+9),P(cx0+.05,y0,z0+9)],'rgba(220,240,250,.22)');});
  // báscula, caja registradora, caramelos y la libreta de fiados
  add(cx1+.04,3.4,()=>{const z=CH_+1.6;sBox(cx0+.1,2.75,cx1-.08,3.25,z,z+4,'#e8e2d4');sTop(cx0+.15,2.8,cx1-.12,3.2,z+4.1,'#c9cdd2');sBox(cx0+.12,2.95,cx0+.25,3.1,z+4,z+11,'#e8e2d4');fX(cx0+.25,2.96,3.09,z+7,z+10,'#7cf0a8');});
  add(cx1+.05,4.5,()=>{const z=CH_+1.6;sBox(cx0+.08,3.75,cx1-.05,4.35,z,z+7,'#3b3f46');sBox(cx0+.08,3.8,cx0+.3,4.3,z+7,z+13,'#2b2b33');fX(cx0+.3,3.85,4.25,z+8,z+12,'#7cf0a8');
    const sale=Math.sin(tt*.9)>.85;if(sale){sBox(cx0+.35,3.85,cx1-.08,4.25,z+1,z+3,'#c9a227');}
    cyl(cx1-.15,4.6,.1,z,z+5,'rgba(220,235,240,.6)');for(let k=0;k<4;k++){const [a,b]=P(cx1-.15,4.6,z+3+k);circ(a+(k%2?1.5:-1.5),b,1.2,['#d1242f','#f2c14e','#2e8b57','#9b5de5'][k]);}
    if(fiado){topQuad(cx0+.1,1.0+.02,cx1-.05,1.15,z,'#fffdf8');sTop(cx0+.15,4.4,cx1-.1,4.75,z+.4,'#2b4a7a');}});
  // cajas de fruta y verdura en el centro
  const fru={pri:['#e63946','#ff8c00','#9acd32','#ffd23f'],ver:['#e63946','#ff9f1c','#2a9d3a','#f4a261'],oto:['#ff8c00','#9acd32','#8b3a62','#c97c2b'],inv:['#ff8c00','#ffa62b','#9acd32','#f4d35e']}[se]||['#e63946','#ff8c00','#9acd32','#ffd23f'];
  add(5.6,2.9,()=>{sBox(4.4,1.9,6.6,2.9,0,10,'#7a5a3a');
    for(let k=0;k<4;k++){const x0=4.45+k*.53;poly([P(x0,1.95,20),P(x0+.5,1.95,20),P(x0+.5,2.85,12),P(x0,2.85,12)],'#a0754c');fY(x0,x0+.5,2.85,10,12,'#8a6a4a');
      if(H_(k+700)>empt)for(let a=0;a<3;a++)for(let b=0;b<3;b++){const u=x0+.1+b*.16,v=2.05+a*.3,z=20-(v-1.95)/.9*8+2;const [px,py]=P(u,v,z);circ(px,py,2.3,shade(fru[k],.92+H_(k*20+a*3+b)*.2));circ(px-.6,py-.7,.7,'rgba(255,255,255,.5)');}
      const pr=(1.2+H_(k)*2)*(1+cr/150);fY(x0+.08,x0+.42,2.86,13,17.5,'#2b2b33');txt(pr.toFixed(2).replace('.',','),x0+.25,2.86,15.3,3.2,'#fffdf8');}});
  // sacos de legumbres y patatas
  add(5.9,4.2,()=>{for(const [x,y,c,l] of [[4.6,3.7,'#c8a46a','patatas'],[5.3,3.8,'#d9c08a','garbanzos'],[6.0,3.7,'#b08850','lentejas']]){sBox(x,y,x+.5,y+.45,0,14,c);sTop(x+.05,y+.05,x+.45,y+.4,14.1,l==='patatas'?'#c09060':l==='garbanzos'?'#e8c98a':'#7a5a3a');fY(x+.05,x+.45,y+.45,4,9,'#fffdf8');txt(l,x+.25,y+.45,6.5,2.6,'#5a3a22',false,800);}});
  // expositor de patatas fritas y prensa
  add(7.4,3.4,()=>{sBox(7.1,3.0,7.7,3.6,0,4,'#9aa0a6');for(let L=0;L<3;L++){sBox(7.12,3.05,7.68,3.55,4+L*11,5+L*11,'#c9cdd2');for(let k=0;k<3;k++)fY(7.15+k*.18,7.31+k*.18,3.55,5+L*11,13+L*11,['#f2c14e','#d1242f','#2a7fd4'][(k+L)%3]);}capsule(...P(7.12,3.55,0),...P(7.12,3.55,38),1,'#9aa0a6');});
  // cestas apiladas al final del mostrador y una maceta
  add(2.5,5.4,()=>{for(let k=0;k<4;k++)sBox(2.2,5.15,2.75,5.6,k*3,k*3+3,k%2?'#c1121f':'#d1242f');capsule(...P(2.25,5.37,12),...P(2.7,5.37,16),1.2,'#2b2b33');});
  add(.6,5.6,()=>{cyl(.55,5.55,.22,0,10,'#b5543c','#5a3a22');const [a,b]=P(.55,5.55,10);for(let k=0;k<7;k++){const an=-Math.PI/2+(k-3)*.35;capsule(a,b,a+Math.cos(an)*9,b+Math.sin(an)*14,2.4,k%2?'#3f8a3a':'#58ac4e');}});
  // ---------- gente ----------
  const clients=Math.round(busy*3.2);
  const qp=[[2.45,3.0],[2.75,3.85],[3.05,4.6],[3.4,5.3]];
  for(let k=0;k<Math.min(4,clients);k++){const [x,y]=qp[k];const old=k!==1;const C=old?elder(k+2):npc[(k*5+2)%12];
    add(x,y,()=>sPerson(x,y,C,{front:false,right:false,act:k===0?'talk':(k===2?'phone':null),prop:k===0?(fiado?null:'🧺'):rain&&k===1?'☂️':null}));
    if(old&&k===0)add(x+.4,y+.1,()=>{const [a,b]=P(x+.35,y+.15);circ(a-2,b,1.8,'#2b2b33');circ(a+3,b+1,1.8,'#2b2b33');sBox(x+.23,y+.03,x+.47,y+.27,3,20,'#2a4a7a');capsule(...P(x+.25,y+.05,20),...P(x+.17,y-.03,32),1.4,'#3b3f46');});}
  // alguien mirando la fruta o la nevera
  if(busy>.5)add(5.2,1.55,()=>sPerson(5.2,1.55,npc[8],{front:false,right:true,act:'book'}));
  if(busy>.7)add(6.0,3.35,()=>sPerson(6.0,3.35,npc[0],{front:false,right:false,act:'stir',prop:'🧺'}));
  // quien entra y sale por la puerta
  {const L=12,t=(tt*.45)%L;if(t<4&&!late){const f=t/4;const x=5.65-f*.2,y=.6+f*2.2;add(x,y,()=>sPerson(x,y,npc[10],{pose:'walk',ph:tt*7,front:true,right:false,prop:rain?'☂️':null}));}}
  // ---------- Ana tras el mostrador ----------
  const serving=clients>0;
  let ana={x:.95,y:serving?2.95:3.6,pose:'stand',act:serving?(fiado&&Math.sin(tt*.5)>0?'book':'talk'):(late?'type':'book'),front:true,right:true};
  if(act!=='work'&&act!=='piquete'){// de visita: atiende Mari y Ana compra
    add(.95,2.95,()=>sPerson(.95,2.95,{...elder(9),hair:'#b0b0b0'},{act:'talk',front:true,right:true,shirt:'#f4f1ea',name:null}));
    ana={x:2.45,y:3.0,pose:'stand',act:'talk',front:false,right:false};}
  // ---------- capa final ----------
  const after=()=>{
    // lámparas colgantes
    for(const [x,y] of [[1.7,2.4],[4.8,2.6]]){const [a,b]=P(x,y,74);const [,c]=P(x,y,96);capsule(a,b,a,c,.7,'rgba(40,30,20,.55)');ctx.fillStyle='#2e5e3a';ctx.beginPath();ctx.moveTo(a-7,b+5);ctx.lineTo(a+7,b+5);ctx.lineTo(a+3,b-1);ctx.lineTo(a-3,b-1);ctx.closePath();ctx.fill();circ(a,b+5.5,2,night>.2||late?'#ffe7a8':'#e8e2d4');}
    const wl=Math.max(night,late?.5:0);
    if(wl>.2){ctx.save();ctx.globalCompositeOperation='multiply';const [a,b]=P(W/2,D/2,20);const g=ctx.createRadialGradient(a,b-30,50,a,b,380);g.addColorStop(0,`rgba(255,238,210,${.45*wl})`);g.addColorStop(1,`rgba(140,110,120,${.45*wl})`);ctx.fillStyle=g;ctx.fillRect(a-600,b-500,1200,1000);ctx.restore();}
  };
  return {W,D,floor:'#d9cbb2',wall:'#e9eef2',out:false,tile:false,decor,items:it,ana,drawBase,after};
};
// Escena: torre
// E = {tt, night, act, w, npc, cp, h} · devuelve {W,D,floor,wall,out,tile,decor,items,ana[,drawBase][,after]}
// Torre de oficinas: planta diáfana (work), afterwork en la azotea o sala de eventos (networking), foro liberal (militancia)
SCENES['torre']=function(E){
  const {tt,night,act,w,npc,cp,h}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const hs=i=>Math.abs(hash(i|0));
  let ana={x:3,y:3,pose:'stand',act:null,front:true,right:true};let W=12,D=9,floor='#b9bec8',wall='#e9ecf0',out=false,tile=false,decor=null,drawBase=null,after=null;
  const tox=(typeof TOX==='function'?TOX():0.3)||0,cr=w.crisis||0,wx=(S.weather&&S.weather.k)||'sol',wet=wx==='lluvia'||wx==='tormenta',snowy=wx==='nieve'||!!S.snow;
  const off=(typeof office==='function'&&office())||{n:'Empresa'};const lateN=night>.55;
  // ---------- ayudas (locales) ----------
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c);
  const fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const txt=(onX,u,v,z,s,col,size,wt)=>{const [a,b]=onX?P(v,u,z):P(u,v,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.font=`${wt||800} ${size}px Nunito, sans-serif`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  const ln=(a,b,col,wd)=>{ctx.strokeStyle=col;ctx.lineWidth=wd||1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  const pp=(k,o)=>({...npc[((k%12)+12)%12],...(o||{})});
  const tri=(t,a,b)=>{const p=((t%2)+2)%2;return p<1?[a+(b-a)*p,1]:[b-(b-a)*(p-1),-1];};
  const plant=(x,y,s=1,dead)=>{sBox(x-.18*s,y-.18*s,x+.18*s,y+.18*s,0,12*s,'#e9e6df');const [a,b]=P(x,y,12*s);const c1=dead?'#9b8a4a':'#3f8a3a',c2=dead?'#b5a05a':'#5cae4c';circ(a,b-10*s,9*s,c1);circ(a-6*s,b-4*s,7*s,c2);circ(a+6*s,b-5*s,7*s,c2);circ(a+1,b-17*s,6*s,c2);};
  const ochair=(x,y,c='#2f343c')=>{cyl(x,y,.2,0,1.5,'#3b3f46');cyl(x,y,.05,1,9,'#5b6270');sBox(x-.2,y-.2,x+.2,y+.2,9,12,c);};
  const ochairBack=(x,y,dir,c='#2f343c')=>{if(dir>0)sBox(x-.2,y+.15,x+.2,y+.24,12,26,shade(c,1.1));else sBox(x-.2,y-.24,x+.2,y-.15,12,26,shade(c,1.1));};
  const glassX=(x,y0,y1,z1)=>{for(let y=y0;y<y1-.01;y+=.5){const yb=Math.min(y1,y+.5);add(x+(y+yb)/2+.05,0,()=>{fX(x,y,yb,0,z1,'rgba(190,225,240,.28)');ln(P(x,y,z1*.45),P(x,yb,z1*.45),'rgba(255,255,255,.35)',1);});}add(x+y1,0,()=>{sBox(x-.04,y1-.04,x+.04,y1+.04,0,z1,'#8a929e');sBox(x-.04,y0,x+.04,y1,z1-3,z1,'#8a929e');});};
  const glassY=(x0,x1,y,z1)=>{for(let x=x0;x<x1-.01;x+=.5){const xb=Math.min(x1,x+.5);add((x+xb)/2+y+.05,0,()=>{fY(x,xb,y,0,z1,'rgba(190,225,240,.28)');ln(P(x,y,z1*.45),P(xb,y,z1*.45),'rgba(255,255,255,.35)',1);});}add(x1+y,0,()=>{sBox(x1-.04,y-.04,x1+.04,y+.04,0,z1,'#8a929e');sBox(x0,y-.04,x1,y+.04,z1-3,z1,'#8a929e');});};
  // monitor: sobre mesa a altura z0, centro x, en el plano y; face=+1 pantalla mira a +y (visible), -1 de espaldas
  const monitor=(x,y,z0,face,k,on=true)=>{sBox(x-.04,y-.04,x+.04,y+.04,z0,z0+5,'#3b3f46');sBox(x-.3,y-.03,x+.3,y+.03,z0+4,z0+15,'#24262c');
    if(face>0){const yy=y+.031;const fl=on?(.85+.15*Math.sin(tt*(3+hs(k)*4)+k)):0;const sc=on?mixHex(['#7cc8f0','#e9ecf0','#2b3242','#9fd4b0'][k%4],'#ffffff',fl*.15):'#15171c';fY(x-.27,x+.27,yy,z0+5,z0+14,sc);
      if(on){for(let r=0;r<3;r++){const ww=.1+hs(k*7+r+Math.floor(tt*.7+k))*.3;fY(x-.24,x-.24+ww,yy+.001,z0+11.5-r*2.4,z0+12.3-r*2.4,k%4===2?'#7cf0a8':'rgba(40,50,70,.55)');}}}};
  const deskMod=(x0,x1,yc,k,mon)=>{ // módulo de bench: mesa doble y separador
    sBox(x0+.05,yc-.62,x0+.1,yc+.62,0,15,'#c3c7cf');sBox(x1-.1,yc-.62,x1-.05,yc+.62,0,15,'#c3c7cf');
    sBox(x0,yc-.65,x1,yc+.65,15,16.5,'#f2f0ea');sBox(x0+.02,yc-.03,x1-.02,yc+.03,16.5,25,'#9fb0a0');
    const xm=(x0+x1)/2;if(mon.b!==undefined)monitor(xm,yc-.3,16.5,-1,k*2,mon.b);if(mon.f!==undefined)monitor(xm,yc+.3,16.5,1,k*2+1,mon.f);
    // cosas sobre la mesa
    const [a,b]=P(xm+.35,yc+.45,16.5);if(hs(k*3+1)<.6){ctx.fillStyle='#fff';ctx.fillRect(a-5,b-2,8,3);}
    if(hs(k*5+2)<.5){cyl(xm-.38,yc+.42,.05,16.5,20,'#e85d3f','#5a2a1a');}
    if(tox>.55&&hs(k*11)<.7){for(let p=0;p<3+Math.round(tox*4);p++){sBox(xm+.12,yc-.5,xm+.42,yc-.25,16.5+p*1.2,17.6+p*1.2,p%2?'#fffdf8':'#eef0f4');}}
    if(tox>.4&&hs(k*13)<.6){const [c,d]=P(xm+.22,yc+.04,22);ctx.fillStyle=['#ffe066','#ff9fb3','#9fe0ff'][k%3];ctx.fillRect(c-2,d-2,4,4);}};
  // ---------- base: planta de oficinas con muro cortina ----------
  const skyline=(x0,x1,zb,zt,yPlane)=>{ // vista exterior pintada en el plano del cristal
    const sky=lateN?['#0f1736','#26305a']:h>18.5||h<7.5?['#f0a36b','#7b8fc9']:['#8fd0f2','#dff1fb'];
    const [ax,ay]=P(x0,yPlane,zt),[,by]=P(x0,yPlane,zb);const g=ctx.createLinearGradient(0,ay,0,by);g.addColorStop(0,sky[1]);g.addColorStop(1,sky[0]);
    fY(x0,x1,yPlane,zb,zt,g);
    for(let k=0;k<16;k++){const bx=x0+(x1-x0)*k/16+hs(k*3)*.2,bw=(x1-x0)/16*(.7+hs(k*5)*.5),bh=zb+12+hs(k*7)*(zt-zb-18);const col=lateN?mixHex('#1c2240','#2a3358',hs(k)):mixHex('#8d9db3','#b8c4d4',hs(k));
      fY(bx,Math.min(x1,bx+bw),yPlane,zb,bh,col);
      if(lateN)for(let r=0;r<4;r++)for(let c=0;c<2;c++){if(hs(k*31+r*7+c)<.45){const wx0=bx+.08+c*bw*.45,zz=zb+5+r*7;if(zz+3<bh&&wx0+.1<x1)fY(wx0,wx0+.1,yPlane,zz,zz+3,'#ffd66b');}}}
    if(!lateN){const cx=x0+(x1-x0)*((tt*.01)%1);fY(cx,cx+.5,yPlane,zt-12,zt-9,'rgba(255,255,255,.7)');}
    if(wet){ctx.strokeStyle='rgba(220,235,255,.45)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<40;k++){const xx=x0+(x1-x0)*hs(k*17),zz=zb+((hs(k*23)*(zt-zb)-tt*40*(0.5+hs(k)))%(zt-zb)+(zt-zb))%(zt-zb);const p1=P(xx,yPlane,zb+zz),p2=P(xx,yPlane,zb+zz-7);ctx.moveTo(...p1);ctx.lineTo(...p2);}ctx.stroke();}
    if(snowy){for(let k=0;k<30;k++){const xx=x0+(x1-x0)*((hs(k*17)+tt*.01*(k%3))%1),zz=zb+((hs(k*23)*(zt-zb)-tt*8*(0.5+hs(k)))%(zt-zb)+(zt-zb))%(zt-zb);const [a,b]=P(xx,yPlane,zb+zz);circ(a,b,1.3,'rgba(255,255,255,.85)');}}};
  const officeBase=(HH,carpet)=>()=>{
    prism(0,0,W,D,-22,0,'#5b5f68');topQuad(0,0,W,D,0,carpet);
    for(let y=0;y<D;y++)for(let x=0;x<W;x++)if((x+y)%2)topQuad(x,y,x+1,y+1,0,shade(carpet,.95));
    if(!lateN&&!wet){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<W;k+=1.5)poly([P(k+.1,0),P(k+1.3,0),P(k+1.3+.9,2.4),P(k+.1+.9,2.4)],'rgba(255,245,215,.07)');ctx.restore();}
    // pared izquierda maciza
    sBox(-.15,-.15,0,D,0,HH,wall);fX(0,0,D,0,5,shade(wall,.8));
    // muro cortina al fondo
    sBox(0,-.15,W,0,0,6,'#5b6270');skyline(0,W,6,HH-3,-.02);
    for(let x=0;x<=W;x+=1.5)sBox(x-.04,-.12,x+.04,.02,0,HH,'#6b7380');sBox(0,-.12,W,.02,HH-3,HH,'#6b7380');sBox(0,-.12,W,.02,26,27.5,'#7b8390');
    if(lateN){ctx.save();ctx.globalAlpha=.14;fY(0,W,0,6,HH-3,'#ffe9b8');ctx.restore();}};
    // luz de techo nocturna (manchas en el suelo) — se pinta en decor
  const floorGlow=(pts)=>{if(night<.3)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const [x,y,r] of pts)isoEll(x,y,0,r,`rgba(255,220,150,${.08*night})`);ctx.restore();};
  const vign=()=>{if(night>.3){const [cx,cy]=P(W/2,D/2,30);const g=ctx.createRadialGradient(cx,cy,60,cx,cy,520);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(10,12,30,${.22*night})`);ctx.fillStyle=g;ctx.fillRect(cx-700,cy-600,1400,1200);}};

  do{
  // =============================== NETWORKING ===============================
  if(act==='networking'){
    const roof=!wet&&!snowy;
    if(roof){out=true;W=12;D=9;
      drawBase=()=>{ // azotea: tarima, barandilla de cristal, skyline
        // edificios lejanos por detrás
        for(let k=0;k<14;k++){const bx=-1+k*1.05,bh=40+hs(k*7)*110,bw=.8+hs(k)*.4;const col=lateN?mixHex('#1a2040','#283258',hs(k*3)):mixHex('#9fb0c6','#c6d2e0',hs(k*3));prismG(bx,-3.2-hs(k*5)*1.5,bx+bw,-2.4-hs(k*5)*1.5,-10,bh,col);
          if(lateN)for(let r=0;r<6;r++)if(hs(k*13+r)<.5){const [a,b]=P(bx+bw*.5,-2.4-hs(k*5)*1.5,10+r*16);ctx.fillStyle='rgba(255,214,107,.85)';ctx.fillRect(a-3,b-2,6,3);}}
        prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,'#a77d52');
        ctx.strokeStyle='rgba(60,35,20,.25)';ctx.lineWidth=1;ctx.beginPath();for(let k=.33;k<D;k+=.33){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
        // pretil y barandilla
        sBox(0,-.25,W,0,0,9,'#d8d2c4');sBox(-.25,-.25,0,D,0,9,'#cfc8b8');
        fY(0,W,-.12,9,32,'rgba(200,230,245,.22)');fX(-.12,0,D,9,32,'rgba(200,230,245,.2)');sBox(0,-.16,W,-.08,31,33,'#9aa3ad');sBox(-.16,0,-.08,D,31,33,'#9aa3ad');
        for(let x=0;x<=W;x+=2)sBox(x-.04,-.16,x+.04,-.08,9,33,'#9aa3ad');for(let y=0;y<=D;y+=2)sBox(-.16,y-.04,-.08,y+.04,9,33,'#9aa3ad');
        floorGlow([[3,3,1.6],[7,4,1.8],[5,7,1.6],[9,7,1.4]]);};
      // guirnalda de bombillas
      after=()=>{const poles=[[.3,.3],[W-.3,.3],[W-.3,D-.3],[.3,D-.3]];const zp=58;
        for(let i=0;i<4;i++){const [x0,y0]=poles[i],[x1,y1]=poles[(i+1)%4];if(i===2)continue;const a=P(x0,y0,zp),b=P(x1,y1,zp);ctx.strokeStyle='rgba(40,40,40,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+26,...b);ctx.stroke();
          for(let s=1;s<12;s++){const t=s/12;const mx=(1-t)*(1-t)*a[0]+2*(1-t)*t*(a[0]+b[0])/2+t*t*b[0],my=(1-t)*(1-t)*a[1]+2*(1-t)*t*((a[1]+b[1])/2+26)+t*t*b[1];const on=night>.25;circ(mx,my+2,on?2.6:1.8,on?`rgba(255,${200+((s*37)%40)},120,${.75+.25*Math.sin(tt*2+s)})`:'#e9e2c8');if(on){ctx.save();ctx.globalAlpha=.18*night;circ(mx,my+2,8,'#ffd27a');ctx.restore();}}}
        vign();};
      for(const [x,y] of [[.3,.3],[W-.3,.3],[W-.3,D-.3],[.3,D-.3]])add(x,y,()=>{sBox(x-.04,y-.04,x+.04,y+.04,0,58,'#3b3f46');});
      // barra de cócteles a la izquierda
      add(1.3,3.4,()=>{sBox(.9,1.4,1.7,5.4,0,20,'#2f343c');sBox(.85,1.35,1.75,5.45,20,22,'#e9e6df');fX(1.7,1.6,5.2,4,16,'#c9a24a');
        for(let k=0;k<5;k++){const [a,b]=P(1.3,1.7+k*.75,22);ctx.fillStyle=['#7bc47f','#c0392b','#f0d77a','#5bc0be','#e9e6df'][k];ctx.fillRect(a-1.5,b-9,3,9);ctx.fillRect(a-.7,b-12,1.4,3);}
        const [c,d]=P(1.3,4.9,22);emoji('🍋',c,d-4,8);txt(true,3.4,1.71,12,'COCTELERÍA','#f4e6b8',6,900);});
      add(.5,2.6,()=>sPerson(.5,2.6,pp(9,{shirt:'#1f1f24'}),{act:'stir',right:true,front:true}));
      add(.5,4.3,()=>{sBox(.15,4,.75,4.6,0,26,'#d0d4da');const [a,b]=P(.45,4.3,26);emoji('🧊',a,b-3,9);});
      // mesas altas con gente
      const groups=[[4.2,2.6],[7.6,2.4],[9.4,5.4],[5.6,6.6]];
      groups.forEach(([tx,ty],g)=>{add(tx,ty,()=>{cyl(tx,ty,.22,0,1,'#3b3f46');cyl(tx,ty,.05,0,24,'#5b6270');cyl(tx,ty,.36,24,26,'#fffdf8','#f4f1ea');const [a,b]=P(tx,ty,26);emoji(g%2?'🍸':'🥂',a-5,b-6,8);emoji('🍢',a+6,b-3,7);});
        const ring=[[-.6,-.35,true,true],[.55,-.5,true,false],[.6,.55,false,false],[-.55,.6,false,true]];
        ring.forEach(([dx,dy,fr,rt],j)=>{if(g===3&&j===3)return;if((g*4+j)%5===4)return;const x=tx+dx,y=ty+dy;const fr2=dx+dy<0;add(x,y,()=>sPerson(x,y,pp(g*4+j+1,{shirt:['#2b3242','#e9ecf0','#7a1f2b','#1f4e5f','#d9c9a8','#3a3a3a'][(g*3+j)%6]}),{act:((g+j)%3===0)?'talk':((g+j)%3===1?'phone':null),front:fr2,right:dx<0?true:false,prop:(g+j)%2?'🥂':'🍷',ph:tt*2+j}));});});
      // Ana con alguien que le da una tarjeta
      ana={x:6.4,y:4.3,pose:'stand',act:'talk',front:true,right:true,prop:'🥂'};
      add(7.3,4.6,()=>sPerson(7.3,4.6,pp(5,{shirt:'#24324a'}),{act:'talk',front:true,right:false,prop:'💼'}));
      // camarero paseando con bandeja
      {const [px,dir]=tri(tt*.12,2.6,10.2);const y=8.1;add(px,y,()=>sPerson(px,y,pp(10,{shirt:'#fffdf8'}),{pose:'walk',ph:tt*6,front:dir<0,right:dir>0,prop:'🍾'}));}
      // sofás chill y olivos
      add(10.8,1.4,()=>{sBox(9.8,.5,11.8,1.2,0,9,'#e9e2d0');sBox(9.8,.4,11.8,.6,9,18,'#ddd5c0');sBox(11.2,.6,11.8,2.6,0,9,'#e9e2d0');sBox(11.6,.6,11.9,2.6,9,18,'#ddd5c0');});
      add(10.4,1.2,()=>sPerson(10.4,1.2,pp(7),{pose:'sit',act:'talk',front:true,right:false,prop:'🍹'}));
      for(const [x,y] of [[2.6,.5],[11.4,8.4],[.6,8.3]])add(x,y,()=>{sBox(x-.35,y-.35,x+.35,y+.35,0,14,'#8a7a6a');const [a,b]=P(x,y,14);capsule(a,b,a,b-16,3,'#6b4a2e');circ(a,b-26,12,'#7d9a6a');circ(a-7,b-20,8,'#93ad7e');circ(a+8,b-21,8,'#93ad7e');});
      if(seasonOf()==='inv'||seasonOf()==='oto')for(const [x,y] of [[3,5],[9.2,3]])add(x,y,()=>{cyl(x,y,.15,0,2,'#3b3f46');cyl(x,y,.04,2,50,'#9aa3ad');cyl(x,y,.3,50,56,'#9aa3ad');const [a,b]=P(x,y,46);ctx.save();ctx.globalAlpha=.35+.1*Math.sin(tt*5);circ(a,b,9,'#ff8a3a');ctx.restore();});
      // roll-up
      add(2.6,7.2,()=>{sBox(2.2,7.1,3.2,7.25,0,2,'#3b3f46');fY(2.25,3.15,7.18,2,52,'#1f2a44');txt(false,2.7,7.19,40,'AFTERWORK','#ffd166',7,900);txt(false,2.7,7.19,32,'Business','#ffffff',6,800);txt(false,2.7,7.19,25,'& Tech','#ffffff',6,800);txt(false,2.7,7.19,12,'#Networking','#9fd4ff',5,800);});
      break;}
    // --- interior: sala de eventos en planta alta (lluvia/nieve) ---
    W=12;D=9;drawBase=officeBase(90,'#7a6f68');
    decor=()=>{txt(true,4.5,.01,72,TXN.escenas.sala_panoramica_planta_21,'#5b6270',7,900);
      fX(.01,6,8.6,30,58,'#2b3242');txt(true,7.3,.02,44,'Afterwork','#ffd166',9,900);txt(true,7.3,.02,35,TXN.escenas.business_tech,'#ffffff',6,800);
      floorGlow([[4,3,1.8],[8,4,1.8],[5,7,1.6]]);};
    after=vign;
    add(1.6,2.8,()=>{sBox(1,1.2,1.8,4.6,0,20,'#3a2a22');sBox(.95,1.15,1.85,4.65,20,22,'#fffdf8');for(let k=0;k<4;k++){const [a,b]=P(1.4,1.5+k*.8,22);emoji(['🥂','🍢','🧀','🍾'][k],a,b-4,8);}});
    add(.6,3,()=>sPerson(.6,3,pp(9,{shirt:'#1f1f24'}),{act:'stir'}));
    const grp=[[4.4,2.6],[8,2.4],[9.6,5.6],[5.8,6.8]];
    grp.forEach(([tx,ty],g)=>{add(tx,ty,()=>{cyl(tx,ty,.05,0,24,'#5b6270');cyl(tx,ty,.36,24,26,'#fffdf8');const [a,b]=P(tx,ty,26);emoji('🥂',a,b-5,8);});
      [[-.6,-.35],[.55,-.5],[.6,.55],[-.55,.6]].forEach(([dx,dy],j)=>{if((g*4+j)%5===4)return;const x=tx+dx,y=ty+dy;add(x,y,()=>sPerson(x,y,pp(g*4+j+1),{act:(g+j)%3===0?'talk':null,front:dx+dy<0,right:dx<0,prop:(g+j)%2?'🥂':'🍷'}));});});
    ana={x:6.4,y:4.3,pose:'stand',act:'talk',front:true,right:true,prop:'🥂'};add(7.3,4.6,()=>sPerson(7.3,4.6,pp(5),{act:'talk',front:true,right:false,prop:'💼'}));
    for(const [x,y] of [[11.4,.6],[11.4,8.4]])add(x,y,()=>plant(x,y,1.2));
    break;}

  // ======================= MILITANCIA (liberal / libertaria) =======================
  if(act==='militancia'){
    W=12;D=9;drawBase=officeBase(90,'#6e5a52');const lib=isI('libertaria');
    decor=()=>{floorGlow([[6,4,2.5],[4,6,2],[8,6,2]]);
      // pantalla de proyección en la pared izquierda
      fX(.02,2.2,6.6,30,72,'#fffdf8');fX(.03,2.4,6.4,33,69,lateN?'#eaf2ff':'#f4f8ff');
      txt(true,4.4,.04,63,lib?TXN.escenas.menos_estado:TXN.escenas.mas_libertad,'#1f3a6b',9,900);txt(true,4.4,.04,54,lib?'MÁS LIBERTAD':TXN.escenas.menos_impuestos,'#1f3a6b',9,900);
      for(let k=0;k<5;k++){const hh=6+k*3.4+Math.sin(tt*.8+k)*.6;fX(.04,3+k*.6,3.4+k*.6,37,37+hh,'#e0a030');}
      txt(true,4.4,.04,36.5,TXN.escenas.presion_fiscal,'#5b6270',4,700);
      txt(false,6,.01,80,lib?TXN.escenas.club_de_la_libre_empresa:TXN.escenas.foro_de_la_libertad,'#2b3242',8,900);};
    after=vign;
    // atril y mesa de ponentes junto a la pantalla
    add(1.6,1.6,()=>{sBox(.9,.9,2.3,1.9,0,16,'#2b3242');sBox(.85,.85,2.35,1.95,16,17.5,'#f4f1ea');fY(.9,2.3,1.9,2,14,'#1f3a6b');txt(false,1.6,1.91,8,'🗽 FORO','#ffd166',5,900);});
    add(1.3,1.2,()=>sPerson(1.3,1.2,pp(4,{shirt:'#24324a'}),{pose:'sit',act:'talk',front:true,right:true}));
    add(2.1,1.0,()=>sPerson(2.1,1.0,elder(2),{pose:'sit',front:true,right:true}));
    add(2.4,7.3,()=>{sBox(2.1,7,2.7,7.6,0,24,'#3a2a22');sBox(2,6.9,2.8,7.7,24,26,'#4a3a30');});
    add(2.3,6.6,()=>sPerson(2.3,6.6,pp(0,{shirt:'#e9ecf0'}),{act:'talk',front:true,right:true,ph:tt}));
    // filas de sillas mirando a la pantalla (-x)
    let n=0;for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=4.2+r*1.5,y=2.4+c*1.15;const occ=hs(r*9+c*3+2)<.72;const isAna=r===0&&c===2;
      add(x,y,()=>{ochair(x,y,'#7a1f2b');sBox(x+.15,y-.2,x+.24,y+.2,12,26,'#8a2b37');});
      if(isAna){ana={x:x-.02,y,pose:'sit',act:'talk',front:false,right:false};continue;}
      if(occ){const k=n++;add(x+.01,y,()=>sPerson(x-.02,y,pp(k+2,{shirt:['#24324a','#e9ecf0','#3a3a3a','#7a8c9e','#c9b48a'][k%5]}),{pose:'sit',front:false,right:false,act:k%6===0?'phone':null}));}}
    // catering al fondo
    add(10.6,1.4,()=>{sBox(9.4,.9,11.8,1.8,0,15,'#fffdf8');sBox(9.35,.85,11.85,1.85,15,16,'#f4f1ea');for(let k=0;k<4;k++){const [a,b]=P(9.8+k*.6,1.3,16);emoji(['☕','🥐','🍊','💧'][k],a,b-4,8);}});
    add(10.6,2.3,()=>sPerson(10.6,2.3,pp(11),{act:'eat',front:true,right:false}));
    add(11.3,7.6,()=>{sBox(11,7.4,11.8,7.5,0,2,'#3b3f46');fY(11.05,11.75,7.48,2,52,'#1f3a6b');txt(false,11.4,7.49,40,'🗽','#fff',10,900);txt(false,11.4,7.49,28,'LIBERTAD','#ffd166',5,900);});
    for(const [x,y] of [[3.3,.6],[11.4,8.6]])add(x,y,()=>plant(x,y,1.1));
    break;}

  // =============================== TRABAJO ===============================
  W=12;D=9;const HH=82;drawBase=officeBase(HH,'#a9b0bc');
  const late=h>=20||h<7,ere=cr>=60,deadCrew=late?0.85:ere?0.35:0.08;
  decor=()=>{
    // pared izquierda: pizarra/kanban, reloj, extintor, enchufes, cartel
    const yb=3.5;fX(.02,yb,yb+1.9,32,62,'#fdfdfb');fX(.025,yb+.05,yb+1.85,33,61,'#ffffff');
    for(let c=0;c<3;c++){txt(true,yb+.35+c*.6,.03,58,['POR HACER','EN CURSO','HECHO'][c],'#5b6270',4,900);for(let r=0;r<(c===0?2+Math.round(tox*4):3);r++){if(36+r*4.6>56)break;const y0=yb+.15+c*.6,z0=50-r*4.6;fX(.03,y0,y0+.35,z0,z0+3.6,['#ffe066','#ff9fb3','#9fe0ff','#b8f2a0'][(r+c)%4]);}}
    if(tox>.6)txt(true,yb+.95,.04,40,TXN.escenas.entrega_viernes,'#d1242f',5,900);
    {const [a,b]=P(0,6,70);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(a,b,6,7,-.45,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3b3f46';ctx.lineWidth=1.2;ctx.stroke();const hr=h%12;ln([a,b],[a+Math.sin(hr/6*Math.PI)*3.3,b-Math.cos(hr/6*Math.PI)*3.3],'#2b2b33',1.4);ln([a,b],[a+Math.sin((h%1)*2*Math.PI)*5,b-Math.cos((h%1)*2*Math.PI)*5],'#2b2b33',1);}
    {const [a,b]=P(0,5.65,14);ctx.fillStyle='#d1242f';ctx.fillRect(a-2.5,b-14,5,13);ctx.fillStyle='#2b2b33';ctx.fillRect(a-1,b-16,2,2);}
    fX(.02,5.55,5.75,30,34,'#e9e6df');
    // carteles
    fX(.02,3.62,4.32,64,74,'#1f3a6b');txt(true,3.97,.03,69,ere?'ERE':'Q4','#fff',6,900);
    if(ere){fX(.02,4.45,5.25,64,78,'#fffdf8');txt(true,4.85,.03,74,'COMUNICADO','#d1242f',4,900);txt(true,4.85,.03,69,'Reestructuración','#2b2b33',3.5,700);txt(true,4.85,.03,66.5,'de plantilla','#2b2b33',3.5,700);}
    else{fX(.02,4.45,5.25,64,78,'#e9f4ea');txt(true,4.85,.03,73,'Nuestros','#2a6b3a',4,900);txt(true,4.85,.03,68,'VALORES ✨','#2a6b3a',4,900);}
    if((w.mov||0)>45||S.strike){fX(.02,6.4,7.0,40,50,'#d1242f');txt(true,6.7,.03,46.5,'ASAMBLEA','#fff',4,900);txt(true,6.7,.03,42.5,'13:00 h','#fff',4,800);}
    // nombre de la empresa en el cristal
    txt(false,7.6,.03,70,(off.n||'').toUpperCase(),'rgba(40,50,70,.55)',8,900);
    // manchas de luz
    if(late)floorGlow([[6.5,2.5,2],[6.5,6,2],[2,5,1.5],[10.5,7,1.4]]);};
  after=()=>{vign();if(tox>.7&&!late){ctx.save();ctx.globalAlpha=.05+.03*Math.sin(tt*1.3);const [cx,cy]=P(W/2,D/2,30);ctx.fillStyle='#7a1010';ctx.fillRect(cx-700,cy-600,1400,1200);ctx.restore();}};
  // --- sala de reuniones acristalada (fondo izquierda) ---
  glassX(3.3,0,3.1,64);glassY(0,2.3,3.1,64);  add(1.7,1.6,()=>{sBox(.7,1.1,2.7,2.1,14,16,'#f2f0ea');cyl(1.7,1.6,.08,0,14,'#5b6270');const [a,b]=P(1.4,1.5,16);ctx.fillStyle='#fff';ctx.fillRect(a-4,b-2,7,3);cyl(2.2,1.7,.05,16,19,'#fffdf8');});
  add(.02,2.4,()=>{fX(.03,.7,2.3,34,54,'#1b1e24');fX(.035,.78,2.22,35.5,52.5,lateN?'#1f3a6b':'#2a4a7b');for(let k=0;k<4;k++)fX(.04,.95+k*.32,1.15+k*.32,37,39+5*hs(k+3)+k*2.5,'#ffd166');});
  const mtgOn=!late&&hs(Math.floor(h))<.85;
  if(mtgOn){[[1.1,.85,true,false],[2.2,.85,true,false],[1.2,2.5,false,true],[2.3,2.5,false,true]].forEach(([x,y,f,r],j)=>add(x,y,()=>sPerson(x,y,pp(j+7),{pose:'sit',front:f,right:r,act:j===1?'talk':j===2?'type':null})));
    add(.5,1.6,()=>sPerson(.5,1.6,pp(4,{shirt:'#24324a'}),{act:'talk',front:true,right:true,ph:tt}));}
  add(2.9,3.4,()=>{txt(false,1.15,3.12,58,'SALA MADRID','#3b4250',4.5,900);});
  // --- despacho del jefe (delante a la izquierda) ---
  glassX(2.9,6.3,9,64);glassY(0,1.9,6.3,64);
  add(1.5+6.3,0,()=>{fY(.25,1.55,6.31,52,58,'#2b3242');txt(false,.9,6.32,55,'DIRECCIÓN','#e9e6df',4.5,900);});
  add(1.8,7.6,()=>{sBox(1.2,6.9,2.2,8.3,0,15,'#5a3f2c');sBox(1.15,6.85,2.25,8.35,15,16.5,'#6b4a35');monitor(1.6,7.6,16.5,-1,99,true);const [a,b]=P(1.9,7.1,16.5);emoji('🏆',a,b-5,7);});
  add(.5,6.8,()=>{sBox(.05,6.5,.5,8.7,0,44,'#6b4a35');for(let z=10;z<44;z+=10)sBox(.06,6.55,.5,8.65,z,z+1,'#5a3f2c');for(let k=0;k<6;k++){const y0=6.6+k*.33;sBox(.15,y0,.45,y0+.2,(k%3)*10+11,(k%3)*10+18,['#1f3a6b','#7a1f2b','#c9b48a'][k%3]);}});
  const bossOut=tox>.55&&!late;const boss=pp(3,{shirt:'#24324a',hair:'#6b6b6b',style:'corto',glasses:true});
  if(!bossOut&&!late){add(1.0,7.6,()=>{ochair(.95,7.6,'#1a1a1a');sBox(.68,7.4,.76,7.8,12,30,'#1a1a1a');});add(1.0,7.62,()=>sPerson(.95,7.6,boss,{pose:'sit',act:tox>.4?'phone':'type',front:true,right:true}));}
  add(.4,8.8,()=>plant(.4,8.75,.9,tox>.75));
  // --- islas de puestos (bench) ---
  const isl=[{yc:2.4,x0:4.2},{yc:6.0,x0:4.2}],MW=1.5,NM=4;let seat=0;
  const anaSlot={i:1,m:1,side:'b'};const cpSlot={i:1,m:2,side:'b'};
  isl.forEach((I,i)=>{for(let m=0;m<NM;m++){const x0=I.x0+m*MW,x1=x0+MW,xm=(x0+x1)/2;
    const slots={b:{y:I.yc-1.0,front:true,right:false,dir:-1},f:{y:I.yc+1.0,front:false,right:true,dir:1}};
    const occ={};for(const sd of ['b','f']){const isA=act==='work'&&i===anaSlot.i&&m===anaSlot.m&&sd===anaSlot.side;const isC=i===cpSlot.i&&m===cpSlot.m&&sd===cpSlot.side;
      const k=seat++;occ[sd]=isA?'ana':isC&&!late?'cp':(hs(k*7+3)<deadCrew?(ere&&!late?'box':null):'p');}
    const mon={b:occ.b==='box'?false:(occ.b||hs(m+i*5)<.4)?true:false,f:occ.f==='box'?false:(occ.f||hs(m+i*5+9)<.4)?true:false};
    add(xm+I.yc,0,()=>deskMod(x0+.05,x1-.05,I.yc,i*NM+m,mon));
    for(const sd of ['b','f']){const s=slots[sd],y=s.y;const o=occ[sd];
      // silla
      if(sd==='b'){add(xm+y-.05,0,()=>{ochair(xm,y,'#2f343c');ochairBack(xm,y,-1);});}
      else{add(xm+y-.05,0,()=>ochair(xm,y,'#2f343c'));add(xm+y+.3,0,()=>ochairBack(xm,y,1));}
      if(o==='ana'){ana={x:xm,y,pose:'sit',act:'type',front:true,right:false};continue;}
      if(o==='box'){add(xm+y+.4,0,()=>{const yy=sd==='b'?y+.5:y-.5;sBox(xm-.22,yy-.18,xm+.22,yy+.18,16.5,25,'#c8a46a');const [a,b]=P(xm,yy,25);emoji('🪴',a,b-4,7);});continue;}
      if(!o)continue;
      const ch=o==='cp'?pp(1):pp(k2(i,m,sd));const nm=o==='cp'&&cp?cp.n:null;const stress=tox>.65&&hs(i*13+m*3+(sd==='b'?1:0))<.35;
      const ac=hs(i*7+m*11+(sd==='b'?5:0)+Math.floor(tt/9))<.18?'phone':'type';
      add(xm+y+.05,0,()=>sPerson(xm,y,ch,{pose:'sit',act:stress&&hs(m)<.5?'phone':ac,front:s.front,right:s.right,name:nm,sad:stress}));}}});
  function k2(i,m,sd){return 2+i*5+m*2+(sd==='b'?0:1);}
  // --- zona office: cafetera, fuente, nevera ---
  add(11.4,6.9,()=>{sBox(11.05,5.6,11.85,8.2,0,21,'#f4f1ea');for(let k=0;k<3;k++)fX(11.06,5.7+k*.85,6.45+k*.85,3,19,'#e9e6df');sBox(11.0,5.55,11.9,8.25,21,22.5,'#c9a77a');
    sBox(11.3,5.75,11.75,6.3,22.5,33,'#9aa3ad');sBox(11.28,5.73,11.77,6.32,33,34,'#3b3f46');fX(11.299,5.8,6.25,25,31,'#2b2f36');const [a,b]=P(11.3,6.05,31.5);circ(a,b,1.3,Math.sin(tt*2)>0?'#7cf0a8':'#2a6b3a');
    cyl(11.2,6.05,.05,22.5,25,'#fffdf8');for(let s2=0;s2<3;s2++){const ph=(tt*.6+s2/3)%1;const [c,d]=P(11.2,6.05,26+ph*12);ctx.save();ctx.globalAlpha=.35*(1-ph);circ(c+Math.sin(tt*3+s2)*1.5,d,2+ph*2,'#fff');ctx.restore();}
    for(let k=0;k<3;k++)cyl(11.5,6.8+k*.18,.05,22.5,25,['#e85d3f','#fffdf8','#3a6ea5'][k]);sBox(11.3,7.4,11.8,8.1,22.5,27,'#e9ecf0');const [e,f]=P(11.55,7.7,27);emoji('🍎',e,f-2,7);});
  add(11.5,4.9,()=>{sBox(11.15,4.5,11.85,5.25,0,40,'#e9ecf0');fX(11.15,4.55,5.2,22,23,'#c3c7cf');});
  add(11.5,8.6,()=>{sBox(11.2,8.3,11.8,8.9,0,26,'#e9ecf0');cyl(11.5,8.6,.2,26,38,'rgba(150,200,240,.75)','rgba(180,220,250,.9)');fY(11.3,11.7,8.9,16,21,'#9aa3ad');});
  add(10.4,8.7,()=>plant(10.4,8.65,1.0,tox>.8));add(3.8,.5,()=>plant(3.75,.5,1.15));add(11.5,.5,()=>plant(11.5,.5,1.2));
  // --- impresora con hoja saliendo ---
  add(11.3,3.2,()=>{sBox(10.9,2.7,11.7,3.6,0,22,'#d6d9de');sBox(10.95,2.75,11.65,3.55,22,27,'#c3c7cf');const out=(tt*.5)%1;topQuad(11.05,3.25-out*.25,11.55,3.55-out*.25,27.2,'#ffffff');const [a,b]=P(11.6,3.0,25);circ(a,b,1.2,hs(Math.floor(tt*2))<.5?'#7cf0a8':'#2a6b3a');});
  if(!late&&tox>.5)add(10.6,3.4,()=>sPerson(10.5,3.3,pp(8),{act:'phone',front:true,right:false,sad:tox>.75}));
  // --- gente que se mueve ---
  if(!late){
    // compañera que va y viene de la cafetera por el pasillo central
    const [px,dir]=tri(tt*.09,4.4,10.2);add(px,4.2,()=>sPerson(px,4.2,pp(6),{pose:'walk',ph:tt*6,front:dir>0,right:dir>0,prop:'☕'}));
    // charla en la cafetera
    add(10.3,7.0,()=>sPerson(10.3,7.0,pp(10),{act:'talk',front:true,right:true,prop:'☕'}));
    // pasillo izquierdo: alguien con papeles
    const [py,d2]=tri(tt*.07+.5,3.6,8.4);add(3.55,py,()=>sPerson(3.55,py,pp(11),{pose:'walk',ph:tt*6+1,front:d2>0,right:false,prop:'📄'}));
    if(bossOut){const bx=Math.max(4.5,Math.min(9.5,6.4+Math.sin(tt*.25)*1.8));add(bx,4.65,()=>sPerson(bx,4.65,boss,{act:'talk',front:true,right:Math.cos(tt*.25)>0,ph:tt*4,prop:tox>.75?'💢':'⏱️'}));}
  } else {
    // limpiadora con carrito por la noche
    const [px,dir]=tri(tt*.05,4.4,10);add(px,8.1,()=>{sPerson(px,8.1,pp(9,{shirt:'#5bc0be'}),{pose:'walk',ph:tt*5,front:true,right:dir>0});const cx=px+(dir>0?.6:-.6);sBox(cx-.25,7.95,cx+.25,8.35,2,16,'#3a6ea5');sBox(cx-.2,8,cx+.2,8.3,16,22,'#ffd166');});
  }
  break;}while(0);
  return {W,D,floor,wall,out,tile,decor,items:it,ana,drawBase,after};
};
// <</SCENES>>
function buildScene(key,tt,night){
  if(SCENES[key]){try{const r=SCENES[key]({tt,night,act:sceneAct(),w:W_(),npc:NPCS(),cp:P_('compi'),h:S.t/60,key});if(r)return r;}catch(e){console.error('escena',key,e);}}
  return {W:6,D:5,floor:'#e9e6df',wall:'#f4f1ea',out:false,tile:true,decor:null,items:[],ana:{x:3,y:3,pose:'stand',act:null,front:true,right:true}};
}
function drawScene(key,tt,night){return drawSceneOf(buildScene(key,tt,night),night);}
function drawSceneOf(sc,night){
  if(sc.drawBase)sc.drawBase();else{sFloor(sc.W,sc.D,sc.floor,sc.tile);if(!sc.out)sWalls(sc.W,sc.D,70,sc.wall,night);}
  if(sc.decor)sc.decor();
  const a=sc.ana;sc.items.push({d:a.x+a.y,f:()=>{const [px,py]=P(a.x,a.y,a.z||0);const old=anaRT.phase;if(a.walkPh!=null)anaRT.phase=a.walkPh;const o={...anaOpts(),pose:a.pose||'stand',act:a.act,front:a.front??true,right:a.right??true,helmet:a.helmet,vest:a.vest};if(a.shirt)o.shirt=a.shirt;if(a.pants)o.pants=a.pants;if(a.sad)o.mood=20;
    if(a.pose==='sit'&&!a.noChair){}drawAna(px,py+(a.pose==='sit'?-4:0),o);anaRT.phase=old;if(a.prop)emoji(a.prop,px+(a.prop==='🛵'?4:9),py-(a.prop==='🛵'?4:46),a.prop==='🛵'?20:13);
    ctx.save();label(CH().name,px,py-(a.pose==='sit'?58:70),'#ff8a5b','#fff',9);ctx.restore();bubbleAt=[px,py-58];}});
  sc.items.sort((p,q)=>p.d-q.d);for(const x of sc.items)x.f();
  if(sc.after)sc.after();
  return sc;
}
function sceneTitle(key){const act=sceneAct();if(key==='_calle')return (S.sim.awayTotal||0)-S.sim.work<20?huecos(TXN.escenas.titulo_de_camino,{lugar:placeName(S.sim.dest)}):TXN.escenas.volviendo_a_casa;if(key==='_ride')return TXN.escenas.repartiendo_por_la_ciudad;if(key==='_piquete')return huecos(TXN.escenas.titulo_piquete,{lugar:placeName(destOf('work'))});
  if(act==='work')return huecos(TXN.escenas.titulo_trabajando,{lugar:placeName(key)});return `${OUT[act]?OUT[act].e+' '+outName(act)+' · ':''}${placeName(key)}`;}
function placeName(k){if(k==='_ride')return 'reparto';const p=PLACES[k];if(!p)return 'fuera';if(k==='tienda'&&S.track==='negocio')return 'Tu tienda';if(k==='torre'&&S.office&&['oficina','tech'].includes(S.track))return S.office.n;if(['super','bar','obra','residencia','sala','coop'].includes(k)&&S.office&&destOf('work')===k)return S.office.n;return p.n;}
function enterScene(){if(viewPlace)return;viewPlace=true;savedCam={x:cam.x,y:cam.y,z:cam.z};sceneKey=null;}
function leaveScene(){if(!viewPlace)return;viewPlace=false;if(savedCam){cam.x=savedCam.x;cam.y=savedCam.y;cam.z=savedCam.z;}sceneKey=null;}
function sceneCam(sc,key){if(sceneKey===key)return;sceneKey=key;const wh=sc.out?25:55;
  const pts=[P(0,0,wh),P(sc.W,0,wh),P(0,sc.D,wh),P(sc.W,sc.D,0),P(0,sc.D,0),P(sc.W,0,0)];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const top=W<700?150:120,bot=W<700?190:160,avH=Math.max(200,H-top-bot),avW=W-24;
  cam.z=Math.max(0.5,Math.min(1.9,Math.min(avW/(x1-x0),avH/(y1-y0))*1.12));cam.x=W/2-(x0+x1)/2*cam.z;cam.y=top+avH/2-(y0+y1)/2*cam.z;}


// =================== VIDA SOCIAL: amistades, amor, familia ===================
const ORIENT=DATA.personas.orientacion;
const RELSTYLE=DATA.personas.estilo_relacion;
const KIDSW=DATA.personas.quiere_hijos;
const BODAW=DATA.personas.quiere_boda;
const STAGE=DATA.personas.etapas;
function defaultLife(g){const r=Math.random();return {orient:g==='f'?(r<.72?'hombres':r<.86?'mujeres':'ambos'):g==='m'?(r<.75?'mujeres':r<.88?'hombres':'ambos'):(r<.5?'ambos':r<.75?'mujeres':'hombres'),rel:pickR(['estable','estable','libre','soltera']),kids:pickR(['si','quiza','no']),boda:pickR(['si','igual','no'])};}
const LIFE=()=>S.life||(S.life=defaultLife(CH().g));
const likes=(orient,g)=>orient==='ambos'?g!=='x'||true:orient==='hombres'?g==='m':orient==='mujeres'?g==='f':false;
const LEFT=DATA.ideologias.izquierda,RIGHT=DATA.ideologias.derecha;
function compatOf(p){let c=50;const a=S.ideo,b=p.ideo;if(a===b&&a!=='apolitica')c+=18;else if((LEFT.includes(a)&&RIGHT.includes(b))||(RIGHT.includes(a)&&LEFT.includes(b)))c-=16*(isI('marxista','anarquista','libertaria')?1.4:1);
  const L=LIFE();if(L.kids!=='quiza'&&p.kids!=='quiza')c+=L.kids===p.kids?10:-14;if(L.rel===p.relStyle)c+=8;return Math.max(5,Math.min(95,c+(p.spark||0)));}
const canLove=p=>p.adult!==false&&likes(LIFE().orient,p.g)&&likes(p.orient,CH().g);
let PID=1;
function newPerson(where,romantic){
  const L=LIFE();let g;
  if(romantic&&L.orient!=='nadie'){g=L.orient==='hombres'?'m':L.orient==='mujeres'?'f':pickR(['f','m']);}else g=pickR(['f','m','f','m','x']);
  const ch=randomChar(g);const used=new Set([CH().name,...(S.people||[]).map(q=>q.n)]);ch.name=pickR(NAMES[g]);for(let t=0;t<8&&used.has(ch.name);t++)ch.name=pickR(NAMES[g]);if(g==='f')ch.beard='no';ch.age=Math.max(19,Math.min(70,(CH().age||27)+Math.round((Math.random()-.5)*12)));
  const og=CH().g;const orient=romantic?(og==='f'?(g==='m'?pickR(['mujeres','mujeres','ambos']):pickR(['mujeres','ambos'])):og==='m'?(g==='f'?pickR(['hombres','hombres','ambos']):pickR(['hombres','ambos'])):'ambos'):pickR(['hombres','mujeres','ambos','mujeres','hombres']);
  const ideo=Math.random()<.35&&S.ideo?S.ideo:pickR(IDEO_ORDER);
  const p={k:'p'+(S.pid=(S.pid||100)+1),n:ch.name,g,ch,age:ch.age,ideo,orient,relStyle:pickR(['estable','estable','libre','soltera']),kids:pickR(['si','quiza','no']),boda:pickR(['si','igual','no']),
    job:pickR(Object.keys(DATA.personas.oficios)),rel:15+Math.random()*15,love:0,stage:'conocida',met:where,metDay:S.day,spark:Math.round((Math.random()-.5)*20),e:'🙂',r:'',mi:null};
  if(romantic){p.love=10+Math.random()*15;}
  p.r=`${roleTxt(p)}`;S.people.push(p);
  if(S.people.length>18){const drop=S.people.filter(q=>q.k.startsWith('p')&&!['pareja','convive','casada','rollo','cita'].includes(q.stage)).sort((a,b)=>a.rel-b.rel)[0];if(drop)S.people.splice(S.people.indexOf(drop),1);}
  return p;}
function roleTxt(p){const jobF=DATA.personas.oficios[p.job]||[p.job,p.job];return (p.g==='m'?jobF[1]:jobF[0])+', '+p.age+' años';}
const isPartner=p=>['pareja','convive','casada'].includes(p.stage);
const partner=()=>(S.people||[]).find(isPartner);
const liveIn=()=>(S.people||[]).find(p=>p.stage==='convive'||p.stage==='casada');
const pArt=p=>p.g==='m'?'él':p.g==='f'?'ella':'elle';
const pO=p=>p.g==='m'?'o':p.g==='f'?'a':'e';
function setStage(p,st){p.stage=st;p.stageDay=S.day;}
