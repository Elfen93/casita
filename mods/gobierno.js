// =================== EL GOBIERNO SE NOTA: consejos y comunas cambian la casa, el curro, la compra y el banco, por fases ===================
const {gobierno:TX_gobierno}=DATA.textos_mods_ag;
const REV=()=>{const e=W_().era;return e==='consejos'||e==='comunas';};
const GV=()=>{if(!S.gv)S.gv={since:null,ph:0,pre:null,lack:[],prop:-99,comedor:0,elec:0,ev:0};return S.gv;};
const GV_PH=DATA.gobiernos.fases_consejos;
function govPh(){const g=GV();if(!REV()||g.since==null)return 0;const d=S.day-g.since;return GV_PH.filter(p=>d>=p[0]).length;}
function govFood(){return REV()&&govPh()>=3?.7:1;}
function govBank(){return REV()&&govPh()>=3;}
function govLack(k){return REV()&&govPh()>=3&&GV().lack.includes(k);}
function govRentCap(){const inc=S.jobless?hrs(8)*5*.6:salary()*TR().days.length;return Math.max(20,Math.round(inc*.22));}
// foto de antes: para poder decir «antes pagabas X, ahora Y»
function govSnap(approx){const g=GV();const k=approx?(W_().era==='comunas'?.15:.35):1;
  g.pre={rent:Math.round(weeklyRent()/k),pay:Math.round(salary()/(approx?1.12:1)),compra:Math.round(compraCost()),bank:BANK_N,fees:BKS().fees||0};}
{const _rd=revolutionDaily;revolutionDaily=function(){const was=REV();if(!was&&W_().rev&&W_().rev.left<=1){try{govSnap(false);}catch(e){}}const r=_rd.apply(this,arguments);try{if(!was&&REV())govStart();}catch(e){}return r;};}
function govStart(){const g=GV();if(g.since!=null)return;g.since=S.day;if(!g.pre)govSnap(true);g.ph=0;govTick();setTimeout(()=>openGov(),1200);}
// el alquiler, con tope del 22 % de lo que entra
{const _wr=weeklyRent;weeklyRent=function(){const v=_wr.apply(this,arguments);try{if(REV()&&govPh()>=1&&!S.owned)return Math.min(v,govRentCap());}catch(e){}return v;};}
// ya no hay desahucios
if(typeof mgEvict==='function'){const _ev=mgEvict;mgEvict=function(who){if(REV()&&govPh()>=1){const m=MG();m.debt=0;m.wk=0;tell(TX_gobierno.sin_desahucios,'🏠');return;}return _ev.apply(this,arguments);};}
// el préstamo, a interés de banca pública
{const _lr=loanRate;loanRate=function(){return govBank()?.015:_lr();};}
// lo que pasa al entrar en cada fase
function govTick(){const g=GV();if(!REV())return;const ph=govPh();const n=CH().name;
  while(g.ph<ph){g.ph++;
    if(g.ph===1){const m=MG();const deb=m.debt||0;m.debt=0;m.wk=0;
      tell(huecos(TX_gobierno.fase1,{deuda:deb?huecos(TX_gobierno.fase1_deuda,{v:fmt(deb)}):''}),'🏠');}
    if(g.ph===2){tell(huecos(TX_gobierno.fase2,{donde:S.office?S.office.n:TX_gobierno.fase2_curro}),'🔧');}
    if(g.ph===3){const b=BP();let liq=0;for(const k of ['fondos','cripto']){if(b[k]&&b[k].v>0){liq+=b[k].v;b[k].v=0;b[k].in=0;}}if(liq){b.ahorro.v+=liq;}
      BANK_N=TX_banco.bancos.pub;
      tell(huecos(TX_gobierno.fase3,{banco:g.pre?g.pre.bank:TX_gobierno.banco_generico,liq:liq?huecos(TX_gobierno.fase3_liq,{v:fmt(liq)}):''}),'🧺');}
  }
  if(govPh()>=3)BANK_N=TX_banco.bancos.pub;
  // el curro sin patrón: aunque cambie de trabajo
  if(govPh()>=2&&S.office){S.office.tox=Math.min(S.office.tox,.12);S.noOvertime=S.day+9999;S.rep=Math.max(S.rep??70,55);}}
// cada día: fases, escasez, problemas nuevos
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{
  if(!REV()){if(S.gv&&S.gv.since!=null){S.gv.since=null;S.gv.ph=0;BANK_N=TX_banco.bancos.priv;}return r;}
  const g=GV();if(g.since==null)govStart();govTick();const n=CH().name;
  // escasez: cambia cada semana
  if(govPh()>=3&&(S.day-g.since)%7===5){const all=TX_gobierno.escasez_lista;g.lack=all.filter(()=>Math.random()<.3).slice(0,2);if(!g.lack.length)g.lack=[pickR(all)];
    if(g.lack.includes('electrónica'))S.shortage=Math.max(S.shortage||0,S.day+8);
    tell(huecos(TX_gobierno.escasez,{lista:g.lack.join(' '+TX_gobierno.y+' ')}),'🧺');}
  if(OUT.compra){OUT.compra._d=OUT.compra._d||OUT.compra.dur;OUT.compra.dur=govPh()>=3?Math.round(OUT.compra._d*1.5):OUT.compra._d;}
  // problemas nuevos, de vez en cuando
  if(Math.random()<.12&&S.day-g.ev>3){g.ev=S.day;const E=TX_gobierno.eventos;
    const [t,e]=pickR(E);tell(huecos(t,{}),e);if(e==='🕯️'){S.needs.social=Math.min(100,S.needs.social+10);}}
  // elección de cargos en el curro, cada mes
  if(govPh()>=2&&!S.jobless&&!TR().self&&S.day-g.elec>=30&&dateOf(S.day).wd===2){g.elec=S.day;const next=CAREER[S.career+1];
    const p=.15+Math.min(.5,((S.rep??60)-50)/100+(lvl('carisma')||0)*.04);
    if(next&&Math.random()<p){S.career++;tell(huecos(TX_gobierno.elec_si,{puesto:next.t.toLowerCase()}),'🗳️');}
    else tell(huecos(TX_gobierno.elec_no,{otras:ga(...TX_gobierno.elec_otras)}),'🗳️');}
}catch(e){console.error(e);}return r;};}
// asambleas en el curro: alargan el turno pero no se van de vacío
{const _dp=depart;depart=function(){const r=_dp.apply(this,arguments);try{const s=S.sim;if(REV()&&govPh()>=2&&s.work>0&&!s.outingActive&&Math.random()<.22){s.work+=60;S.needs.social=Math.min(100,S.needs.social+8);setTimeout(()=>{if(Math.random()<.5)tell(huecos(pickR(TX_gobierno.asamblea_curro),{}),'✋');},900);}}catch(e){}return r;};}
// comedor del centro (si sale aprobado): el descanso sale gratis
{const _up=update;update=function(gm){const s=S.sim;const pre=s.lunch;const r=_up.apply(this,arguments);try{if(GV().comedor&&REV()&&s.lunch===S.day&&pre!==S.day&&!S.tapers){const last=(BKS().log||[]).slice(-1)[0];if(last&&last[3]==='Menú'&&last[0]===S.day)bkAdd('Comedor del centro',-last[2]);}}catch(e){}return r;};}
// el sindicato: ya no hay patrón contra quien hacer huelga; ahora se lleva una propuesta al consejo
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{if(REV()){
  if(govPh()>=2){h=h.replace(/<button class="btn[^"]*" id="ustrike"[^>]*>[^<]*<\/button>/,`<button class="btn${S.day-GV().prop>=7?'':' grey'}" id="gvprop">${TX_gobierno.ui_propuesta}</button>`)
    .replace(/Para convocar huelga hace falta organización 50 y malestar 35\.[^<]*/,TX_gobierno.ui_sin_patron);}
  h=h.replace(`<h3>${TXN.mundo.ui_mundo}</h3>`,`<h3>${TXN.mundo.ui_mundo}</h3><button class="btn grey" id="gvopen">${huecos(TX_gobierno.ui_que_ha_cambiado,{})}</button>`);}}catch(e){}return h;};}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('#gvprop,#gvopen,#gvclose');if(!t)return;if(t.id==='gvopen')openGov();else if(t.id==='gvclose')closeGov();else govPropose();},true);
function govPropose(){const g=GV();if(S.day-g.prop<7){toast(huecos(TX_gobierno.prop_espera,{d:7-(S.day-g.prop)}));return;}g.prop=S.day;const o=office();const n=CH().name;
  const ideas=[['comedor',TX_gobierno.ideas.comedor,()=>{g.comedor=1;}],['sueldo',TX_gobierno.ideas.sueldo,()=>{S.payMul=(S.payMul||1)*1.05;}],['org',TX_gobierno.ideas.org,()=>{gainSkill('logica',120);}]].filter(i=>!(i[0]==='comedor'&&g.comedor));
  const [k,t,f]=pickR(ideas);const p=.35+(o.org||0)/200;
  if(Math.random()<p){f();o.org=Math.min(100,(o.org||0)+5);tell(huecos(TX_gobierno.prop_ok,{t,extra:TX_gobierno.prop_ok_extra[k]}),'📣');sfx('level');}
  else tell(huecos(TX_gobierno.prop_ko,{t}),'📣');
  if(typeof openMenu==='function')openMenu();}
// ventana «Qué ha cambiado»
let gvEl=null;
function closeGov(){if(gvEl)gvEl.classList.remove('on');}
function openGov(){if(!REV())return;const g=GV();const d=S.day-g.since;const ph=govPh();const pre=g.pre||{};
  if(!gvEl){gvEl=document.createElement('div');gvEl.id='gvsheet';document.body.appendChild(gvEl);}
  const row=(a,b,c)=>`<div class="gvr"><span>${a}</span><span>${b?`<s>${b}</s> → `:''}<b>${c}</b></span></div>`;
  let h=`<div class="omt">${huecos(TX_gobierno.gv_titulo,{quien:W_().era==='comunas'?TX_gobierno.gv_titulo_comunas:TX_gobierno.gv_titulo_consejos})}</div><div class="sub" style="padding:0 8px 6px">${huecos(TX_gobierno.gv_dia,{d:d+1})}</div>`;const F=TX_gobierno.gv_filas,SI=TX_gobierno.gv_si,NO=TX_gobierno.gv_no,PEND=TX_gobierno.gv_pendiente;
  for(let i=0;i<GV_PH.length;i++){const [dd,t,x]=GV_PH[i];const on=ph>i;h+=`<div class="gvph${on?' on':''}"><b>${on?'✅':'⏳'} ${t}</b><small>${x}${on?'':huecos(TX_gobierno.gv_en_dias,{d:dd-d})}</small></div>`;}
  h+=`<div class="gvbox">`;
  if(S.owned)h+=row(F.hipoteca,ph>=1&&S.mort?'':'',S.mort?huecos(F.hipoteca_dato,{pay:fmt(S.mort.pay),rate:ph>=3?'0':(S.mort.rate*100).toFixed(1)}):F.pagada);
  else if(S.home&&S.home.type==='padres')h+=row(F.madre,'',F.sin_alquiler);
  else h+=row(F.alquiler,pre.rent&&ph>=1&&pre.rent>weeklyRent()?fmt(pre.rent):'',ph>=1?fmt(weeklyRent()):PEND);
  h+=row(F.desahucios,ph>=1?SI:'',ph>=1?NO:PEND);h+=row(F.comprar,SI,F.comprar_no);
  if(!S.jobless&&!TR().self){h+=row(F.sueldo,pre.pay&&pre.pay<salary()?fmt(pre.pay):'',fmt(Math.round(salary()*payFactor())));
    h+=row(F.extra,ph>=2?SI:'',ph>=2?NO:PEND);h+=row(F.jefe,ph>=2?SI:'',ph>=2?F.jefe_no:PEND);
    if(g.comedor)h+=row(F.comedor,'',F.gratis);}
  h+=row(F.compra,ph>=3&&pre.compra?fmt(pre.compra):'',fmt(compraCost()));
  h+=row(F.banco,ph>=3?(pre.bank||TX_banco.bancos.priv):'',ph>=3?F.banco_dato:PEND);
  if(ph>=3)h+=row(F.falta,'',g.lack.join(', ')||F.nada);
  h+=`</div><div class="sub" style="padding:6px 8px">${TX_gobierno.gv_cierre}</div><div style="padding:6px"><button class="btn" id="gvclose">${TX_gobierno.gv_entendido}</button></div>`;
  gvEl.innerHTML=h;gvEl.classList.add('on');}
// =================== VIVIENDA CON LOS CONSEJOS: ni se compra ni se vende; se pide y se usa. La hipoteca pasa a la Banca Pública ===================
const govHH=()=>1+(liveIn()?1:0)+(S.kids||[]).length;
// la hipoteca: tope del 22 %, congelada si no entra nada, al 0 % con la banca pública
{const _pm=payMortgage;payMortgage=function(){const m=S.mort;if(!m||!REV()||govPh()<1)return _pm.apply(this,arguments);const g=GV();const n=CH().name;
  if(govPh()>=3&&m.rate>0){m.rate=0;tell(huecos(TX_gobierno.hip_cero,{v:fmt(Math.round(m.left))}),'🏦');}
  if(S.jobless){if(!g.mfroz){g.mfroz=1;tell(TX_gobierno.hip_congelada,'🏦');}return;}g.mfroz=0;
  m.pay=Math.min(Math.round(m.left/Math.max(1,m.weeks))+(m.rate?Math.round(m.left*m.rate/52):0),govRentCap());return _pm.apply(this,arguments);};}
// los impagos ya no se persiguen
{const _bw=mgBankWarn;mgBankWarn=function(){if(REV()&&govPh()>=1){const m=MG();m.bank=0;m.debt=0;const g=GV();if(!g.mwarn){g.mwarn=1;tell(TX_gobierno.hip_impago,'🏠');}return;}return _bw.apply(this,arguments);};}
// comprar: ya no
{const _mo=mortgageOffer;mortgageOffer=function(){const o=_mo.apply(this,arguments);if(REV()){o.ok=false;o.why=[TX_gobierno.hip_no_compra];}return o;};}
{const _bh=buyHouse;buyHouse=function(mode){if(REV()){toast(TX_gobierno.no_compra_toast);return false;}return _bh.apply(this,arguments);};}
// mudarse: se pide a la asamblea, se espera, se entra sin fianza
{const _mc=moveCost;moveCost=function(k){if(REV()&&k!=='padres')return 0;return _mc.apply(this,arguments);};}
{const _cm=canMove;canMove=function(k){if(REV()&&k!=='padres'&&k!=='calle'){const g=GV();if(k===((S.home&&S.home.type)||'casita'))return {ok:false,why:[TX_gobierno.ya_vive]};return g.grant===k?{ok:true,why:[]}:{ok:false,why:[TX_gobierno.se_pide]};}return _cm.apply(this,arguments);};}
{const _mh=moveHome;moveHome=function(k,auto){const g=GV();if(REV()&&k!=='padres'&&k!=='calle'){if(g.grant!==k){if(!auto)govReq(k);return false;}
    if(S.owned){S.owned=false;S.mort=null;tell(huecos(TX_gobierno.casa_bolsa,{}),'🔑');}
    const r=_mh.call(this,k,auto);if(r){g.grant=null;g.req=null;}return r;}
  return _mh.apply(this,arguments);};}
function govReq(k){const g=GV();const K=HOMES[k];const n=CH().name;const hh=govHH();const t=(S.home&&S.home.type)||'casita';
  if(g.req&&g.req.k===k){toast(huecos(TX_gobierno.req_ya,{v:K.n}));return;}
  if(K.cls>=3&&hh<2){tell(huecos(TX_gobierno.req_no,{v:K.n.toLowerCase()}),'🏘️');return;}
  const need=t==='calle'?3:t==='infra'?6:t==='habitacion'&&hh>1?8:20+(K.cls||1)*6;g.req={k,day:S.day,ready:S.day+need};
  tell(huecos(TX_gobierno.req_ok,{v:K.n.toLowerCase(),need,calle:t==='calle'?TX_gobierno.req_calle:''}),'🏘️');if(typeof openMenu==='function'&&menu.classList.contains('open'))openMenu();}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const g=GV();if(REV()&&g.req&&!g.grant&&S.day>=g.req.ready){g.grant=g.req.k;const K=HOMES[g.grant];tell(huecos(TX_gobierno.asignada,{e:K.e,v:K.n.toLowerCase()}),'🔑');sfx('level');}
  if(!REV()&&S.gv){S.gv.req=null;S.gv.grant=null;}}catch(e){}return r;};}
{const _hb=homeBlock;homeBlock=function(){let h=_hb.apply(this,arguments);if(!REV())return h;try{const g=GV();const t=(S.home&&S.home.type)||'casita';
  let x=`<details class="mud"${g.grant||g.req?' open':''}><summary>${TX_gobierno.hb_titulo}</summary><div class="sub" style="font-size:11.5px">${huecos(TX_gobierno.hb_intro,{h:govHH()})}</div>`;
  for(const k of HOME_ORDER){if(k===t||k==='calle')continue;const K=HOMES[k];const isG=g.grant===k,isR=g.req&&g.req.k===k;
    x+=`<div class="hopt"><div><b>${K.e} ${K.n}</b> <small>${k==='padres'?TX_gobierno.hb_madre:huecos(TX_gobierno.hb_sem,{v:fmt(Math.min(Math.round(K.rent*Dm().rent*(S.rentMul||1)),govRentCap()))})}</small><div class="sub" style="font-size:11px">${isG?TX_gobierno.hb_asignada:isR?huecos(TX_gobierno.hb_pedida,{d:Math.max(0,g.req.ready-S.day)}):K.d}</div></div>${k==='padres'||isG?`<button class="mini" data-move="${k}">${TX_gobierno.hb_mudarse}</button>`:isR?'':`<button class="mini" data-gvreq="${k}">${TX_gobierno.hb_pedir}</button>`}</div>`;}
  x+='</details>';h=h.replace(/<details class="mud">[\s\S]*<\/details>/,x);}catch(e){}return h;};}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-gvreq]');if(b){ev.stopPropagation();govReq(b.dataset.gvreq);}},true);
// la ficha de vivienda en Casa: sin botones de comprar
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{if(REV()&&menuTab==='casa'){for(const id of ['#buymort','#buycash']){const b=card.querySelector(id);if(b&&b.parentElement)b.parentElement.remove();}
  card.querySelectorAll('.kv').forEach(e=>{const s=e.firstElementChild&&e.firstElementChild.textContent;if(s==='Comprar la casa'||s==='Hipoteca')e.remove();});
  card.querySelectorAll('.sub').forEach(e=>{if(/El banco ahora no la da/.test(e.textContent))e.textContent=TX_gobierno.casa_consejos;});
  if(S.mort){card.querySelectorAll('.kv').forEach(e=>{if(e.firstElementChild&&e.firstElementChild.textContent==='Cuota')e.lastElementChild.textContent=huecos(TX_gobierno.casa_cuota,{pay:fmt(S.mort.pay),rate:(S.mort.rate*100).toFixed(1)});});}}}catch(e){}return r;};}
// con los consejos (o el socialismo de mercado) no hay patrón contra quien hacer huelga: se acaban las huelgas
const noStrikes=()=>{const w=W_();return (REV()&&govPh()>=2)||(w.gov==='mercado'&&!w.era);};
{const _cs=callStrike;callStrike=function(byOthers){if(noStrikes()){if(!byOthers)toast(REV()?TX_gobierno.huelga_toast_consejos:TX_gobierno.huelga_toast_oficial);return;}return _cs.apply(this,arguments);};}
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{const w=W_();if(noStrikes()){if(w.gsDay){w.gsDay=null;}if(w.manif&&REV()&&Math.random()<.7)w.manif=null;if(S.office)S.office.griev=Math.min(S.office.griev||0,10);}}catch(e){}return r;};}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{if(noStrikes()&&S.strike&&S.strike.on){S.strike.on=false;S.strike.left=0;tell(REV()?TX_gobierno.huelga_fin_consejos:TX_gobierno.huelga_fin_oficial,'📣');}}catch(e){}return r;};}
