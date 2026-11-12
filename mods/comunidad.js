// =================== SOCIALISMO UTÓPICO: fundar una comunidad desde abajo, con cualquier gobierno. Lo mejor, lo peor, y semilla de las comunas ===================
const {comunidad:TX_comunidad}=DATA.textos_mods_ag;
const UT_K=TX_comunidad.tipos;
const UT_NAMES=TX_comunidad.nombres;
const UT=()=>S.ut||null;
function utFriends(){return (S.people||[]).filter(p=>p.k!=='madre'&&(p.rel||0)>=50).length;}
function utCanFound(){const why=[];if(utFriends()<2&&!(S.union&&S.union.member))why.push(TX_comunidad.falta_gente);if(S.money<hrs(20))why.push(huecos(TX_comunidad.falta_aporte,{v:fmt(hrs(20))}));return why;}
function utFound(k){const why=utCanFound();if(why.length){toast(huecos(TX_comunidad.aun_no,{why:why.join(' · ')}));return;}const K=UT_K[k];bkAdd('Comunidad',-hrs(20));
  S.ut={k,name:pickR(UT_NAMES),members:3+(Math.random()*3|0),caja:hrs(20)*3,coh:65,since:S.day,weeks:0,tejido:0,free:0,last:null};const u=S.ut;const n=CH().name;
  chapter('ut'+S.day,u.name,huecos(TX_comunidad.fundada,{m:u.members-1,com:u.name,tipo:K.n.toLowerCase(),d:K.d}));if(typeof openMenu==='function')openMenu();}
function utLeave(){const u=UT();if(!u)return;const back=Math.round(Math.max(0,u.caja)/Math.max(1,u.members));bkAdd('Comunidad',back);tell(huecos(TX_comunidad.deja,{com:u.name,v:fmt(back)}),'🌱');S.ut=null;if(typeof openMenu==='function')openMenu();}
function utDissolve(why){const u=UT();if(!u)return;const back=Math.round(Math.max(0,u.caja)/Math.max(1,u.members));if(back)bkAdd('Comunidad',back);chapter('utfin'+S.day,huecos(TX_comunidad.fin_titulo,{com:u.name}),huecos(TX_comunidad.fin_texto,{why,w:Math.max(1,u.weeks),v:fmt(back)}));S.ut=null;}
// cada lunes: la cuota, lo que da, lo que cuesta
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{utWeek();}catch(e){console.error(e);}return r;};}
function utWeek(){const u=UT();if(!u)return;const K=UT_K[u.k];const w=W_();const n=CH().name;u.weeks++;
  // la cuota
  const q=hrs(K.cuota);if(S.money>=q){bkAdd('Comunidad',-q);u.caja+=q;}else{u.coh-=3;tell(huecos(TX_comunidad.sin_cuota,{}),'🌱');}
  u.caja+=Math.round(q*(u.members-1)*(w.crisis>60?.6:.9));
  // lo que da
  if(u.k==='rural'){S.pantry=(S.pantry||0)+4;if(typeof CM==='function')CM().desp=Math.min(30,CM().desp+3);}
  if(u.k==='vivienda'){S.needs.social=Math.min(100,S.needs.social+15);if((S.kids||[]).length)S.needs.energia=Math.min(100,S.needs.energia+10);}
  if(u.k==='integral'&&typeof CM==='function')CM().desp=Math.min(30,CM().desp+2);
  S.needs.social=Math.min(100,S.needs.social+6);if(typeof MT==='function')MT().an=Math.min(100,MT().an+2);
  // caja de resistencia
  if((S.jobless||S.money<0)&&u.caja>hrs(8)){const g=Math.min(u.caja*.25,hrs(u.k==='integral'?12:6));u.caja-=g;bkAdd('Comunidad',Math.round(g));u.coh+=2;if(Math.random()<.5)tell(huecos(TX_comunidad.caja_ayuda,{com:u.name,v:fmt(Math.round(g))}),'🫶');}
  // la cohesión: sube con la participación, baja con quien no aporta, la presión de fuera y si la fundadora se apaga
  let d=1.5;
  if(S.needs.energia<25||(typeof MT==='function'&&MT().dep)||S.jail>0){d-=4;if(Math.random()<.3)tell(huecos(TX_comunidad.depende,{com:u.name}),'🌱');}
  u.free=Math.min(10,u.free+(u.members>6?.4:.15));d-=u.free*.35;
  if(w.crisis>60)d-=1.5;if(w.era==='comunas'||w.era==='consejos')d+=2;if(w.gov==='conservador'&&w.mov<30)d-=.5;
  u.coh=Math.max(0,Math.min(100,u.coh+d));
  // crece si va bien
  if(u.coh>=70&&Math.random()<.25){u.members++;if(Math.random()<.4)tell(huecos(TX_comunidad.se_une,{com:u.name,m:u.members}),'🌱');}
  if(u.coh<35&&u.members>3&&Math.random()<.3){u.members--;tell(huecos(TX_comunidad.se_va,{com:u.name,m:u.members}),'🚪');}
  // tejido: semilla de las comunas
  if(u.coh>=60&&u.members>=8){u.tejido=Math.min(100,u.tejido+3);w.mov=Math.min(100,w.mov+.4);}
  if(u.tejido>=40&&!u.tj){u.tj=1;chapter('uttej'+S.day,TX_comunidad.tejido_titulo,huecos(TX_comunidad.tejido_texto,{com:u.name}));}
  // dilemas
  if(Math.random()<.35)utDilema();
  if(u.coh<=0)utDissolve(TX_comunidad.disuelve_asambleas);}
// la revolución, con tejido comunitario, tira hacia las comunas
{const _rd=revolutionDaily;revolutionDaily=function(){const before=W_().era;const r=_rd.apply(this,arguments);try{const u=UT();const w=W_();if(!before&&w.era==='consejos'&&u&&u.tejido>=40){w.era='comunas';w.gov='comunas';tell(huecos(TX_comunidad.comunas,{com:u.name}),'🏴');}}catch(e){}return r;};}
// los dilemas de verdad
// los textos de cada dilema (título, opciones y lo que pasa) están en data/textos_mods_ag.json; aquí, solo lo que cambia en la comunidad
const UT_DIL=(()=>{const UT_FX=[
  [u=>{u.coh+=3;u.free=Math.max(0,u.free-2);},u=>{u.members=Math.max(2,u.members-1);u.coh-=6;u.free=Math.max(0,u.free-3);},u=>{u.free+=1.5;u.coh-=2;}],
  [u=>{u.caja+=hrs(30);u.coh-=5;},u=>{u.coh+=3;}],
  [u=>{u.coh+=5;S.needs.energia=Math.max(0,S.needs.energia-15);},u=>{u.caja-=hrs(6);u.coh+=1;}],
  [u=>{u.coh+=4;u.lead=1;},u=>{u.coh+=1;u.lead=0;}],
  [u=>{u.caja-=hrs(10);},u=>{if(Math.random()<.5){u.caja-=hrs(20);return 'multa';}return 'libra';}]];
return TX_comunidad.dilemas.map((D,i)=>({t:u=>huecos(D.t,{com:u.name}),o:D.o.map((o,j)=>[o.t,u=>{const k=UT_FX[i][j](u);return huecos(typeof o.r==='string'?o.r:o.r[k],{});}])}));})();
let utEl=null;
function utDilema(){const u=UT();if(!u)return;const D=pickR(UT_DIL);if(!utEl){utEl=document.createElement('div');utEl.id='utsheet';document.body.appendChild(utEl);}
  utEl.innerHTML=`<div class="omt">🌱 ${u.name}</div><div class="sub" style="padding:4px 8px 8px;font-size:13px">${D.t(u)}</div><div style="display:flex;flex-direction:column;gap:6px;padding:4px 6px">${D.o.map((o,i)=>`<button class="btn${i?' grey':''}" data-utd="${i}">${o[0]}</button>`).join('')}</div>`;
  utEl.classList.add('on');utEl.querySelectorAll('[data-utd]').forEach(b=>b.onclick=()=>{const t=D.o[+b.dataset.utd][1](u);u.coh=Math.max(0,Math.min(100,u.coh));utEl.classList.remove('on');tell(t,'🌱');});}
// en Vida
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{const u=UT();let x='<h3>'+TX_comunidad.ui_titulo+'</h3>';
  if(!u){const why=utCanFound();x+=`<div class="sub" style="font-size:12px">${TX_comunidad.ui_intro}</div>`;
    for(const k in UT_K){const K=UT_K[k];x+=`<div class="hopt"><div><b>${K.e} ${K.n}</b> <small>${huecos(TX_comunidad.ui_cuota,{v:fmt(hrs(K.cuota))})}</small><div class="sub" style="font-size:11px">${K.d}</div></div><button class="mini" data-utf="${k}"${why.length?' style="opacity:.45"':''}>${TX_comunidad.ui_fundar}</button></div>`;}
    if(why.length)x+=`<div class="sub" style="font-size:11px;color:#c0392b">${huecos(TX_comunidad.ui_falta,{why:why.join(' · ')})}</div>`;}
  else{const K=UT_K[u.k];const bar=(v,col)=>`<div class="bar"><i style="width:${Math.round(v)}%;background:${col}"></i></div>`;
    x+=`<div class="kv"><span>${K.e} «${u.name}»</span><span>${huecos(TX_comunidad.ui_personas,{m:u.members,w:u.weeks})}</span></div><div class="skill"><span class="lbl">${TX_comunidad.ui_cohesion}</span>${bar(u.coh,u.coh<35?'#c0392b':'#2e8b57')}<span class="lv">${Math.round(u.coh)}</span></div><div class="kv"><span>${TX_comunidad.ui_caja}</span><span>${fmt(Math.round(u.caja))}</span></div>${u.tejido?`<div class="skill"><span class="lbl">${TX_comunidad.ui_tejido}</span>${bar(u.tejido,'#7a4fa0')}<span class="lv">${Math.round(u.tejido)}</span></div>`:''}`;
    x+=`<div style="display:flex;gap:6px"><button class="btn" id="utmas">${huecos(TX_comunidad.ui_aportar,{v:fmt(hrs(5))})}</button><button class="btn grey" id="utleave">${TX_comunidad.ui_dejarla}</button></div><div class="sub" style="font-size:11px">${u.coh<35?TX_comunidad.ui_estado_mal:u.tejido>=40?TX_comunidad.ui_estado_red:TX_comunidad.ui_estado_normal}</div>`;}
  h=h.replace(`<h3>${TXN.mundo.ui_mundo}</h3>`,x+`<h3>${TXN.mundo.ui_mundo}</h3>`);}catch(e){}return h;};}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-utf],#utmas,#utleave');if(!t)return;ev.stopPropagation();
  if(t.dataset.utf)utFound(t.dataset.utf);else if(t.id==='utleave')utLeave();else{const u=UT();if(u&&S.money>=hrs(5)){bkAdd('Comunidad',-hrs(5));u.caja+=hrs(5);u.coh=Math.min(100,u.coh+2);toast(TX_comunidad.ui_aportado);if(typeof openMenu==='function')openMenu();}}},true);
// las facturas, compartidas en la comunidad de vivienda; la compra, más barata en la integral
{const _pu=payUtilities;payUtilities=function(){const u=UT();if(!u||u.k!=='vivienda')return _pu.apply(this,arguments);const m0=S.money;const r=_pu.apply(this,arguments);const paid=m0-S.money;if(paid>0)bkAdd('Comunidad',Math.round(paid*.25));return r;};}
{const _gf=govFood;govFood=function(){const u=UT();return _gf()*(u&&u.k==='integral'?.85:1);};}
if(typeof BK_CAT!=='undefined')BK_CAT['Comunidad']='familia';
