// ---------- el mundo: crisis, movimiento, gobiernos y elecciones ----------
const GOVS=DATA.gobiernos.gobiernos;
const W_=()=>{if(!S.world)S.world={crisis:Dm().soul?45:{facil:10,normal:18,dificil:28,realista:35}[S.diff]||20,mov:10,gov:'centro',elec:300+Math.floor(Math.random()*900),manif:null,gs:null,era:null};return S.world;};
const dark=()=>W_().crisis>=65;
function govPay(){const g=W_().gov;return g==='progresista'&&S.career<=1?1.06:g==='conservador'?1.03:g==='consejos'?1.15:1;}
function worldWeekly(){
  const w=W_(),soul=Dm().soul;
  // crisis
  const base={facil:10,normal:18,dificil:28,realista:35,soul:50}[S.diff]||20;
  let d=((Math.random()-.5)*(soul?9:4)+(base-w.crisis)*0.05+(w.gov==='austeridad'?2:w.gov==='liberal'?0.5:w.gov==='progresista'?-0.5:0))*.3;
  if(S.market)d+=(S.market.price-1)*3;if(w.era==='consejos'||w.era==='comunas')d-=1.5;
  w.crisis=Math.max(0,Math.min(100,w.crisis+d));
  // movimiento social
  w.mov=Math.max(0,Math.min(100,w.mov+((w.crisis-35)/14-0.8+(Math.random()-.5)*2+(w.gov==='austeridad'?1:0)+(w.era==='represion'?-3:0))*.3));
  if(w.era==='represion'&&S.day>w.eraUntil){w.era=null;tell(TXN.mundo.excepcion_fin,'🕊️');}
  // manifestaciones convocadas
  if(!w.manif&&w.mov>20&&Math.random()<w.mov/(w.era?400:140)){const sat=S.day+((5-dateOf(S.day).wd+7)%7||7);
    const causes=TXN.mundo.causas.map(c=>[c.t,c.lado]);
    const c=pickR(causes);w.manif={day:sat,cause:c[0],side:c[1]};tell(huecos(TXN.mundo.manif_convocan,{causa:c[0],dia:WDL[dateOf(sat).wd].toLowerCase()}),'📣');}
  if(w.manif&&S.day>w.manif.day)w.manif=null;
  // huelga de alquileres y desahucios
  if(S.pol.tenant&&!S.owned&&!S.rentStrike&&w.mov>=35&&Math.random()<.3){S.rentStrike=true;chapter('inquilinas',TXN.mundo.alq_titulo,TXN.mundo.alq_huelga);}
  if(S.rentStrike&&Math.random()<.08){if(w.mov>=55||Math.random()<.5){S.rentMul=(S.rentMul||1)*0.9;tell(TXN.mundo.alq_acuerdo,'🏘️');}else{tell(huecos(TXN.mundo.desahucio,{fin:w.mov>=40?TXN.mundo.desahucio_plantan:TXN.mundo.desahucio_paga}),'📨');if(w.mov<40){S.money-=Math.round(weeklyRent()*2);S.rentStrike=false;}}}
  // huelga general
  if(!w.gs&&w.mov>=60&&w.crisis>=55&&Math.random()<0.12){const day=S.day+3+(Math.random()*4|0);w.gsDay=day;tell(huecos(TXN.mundo.huelga_general_convocan,{dia:WDL[dateOf(day).wd].toLowerCase(),num:dateOf(day).dm}),'🪧');}
  // ayudas de su gente cuando no llega
  if(S.money<reserveMoney()*0.5){
    if(S.pol.mutual&&Math.random()<.5){S.needs.hambre=Math.max(S.needs.hambre,80);S.pantry=(S.pantry||0)+4;const g=Math.round(30*PM()*Math.random());S.money+=g;tell(huecos(TXN.mundo.red_apoyo,{caja:g?huecos(TXN.mundo.red_caja,{g:fmt(g)}):''}),'🫶');}
    else if(S.pol.parish&&Math.random()<.4){const g=Math.round(25*PM());S.money+=g;tell(huecos(TXN.mundo.parroquia_ayuda,{g:fmt(g)}),'⛪');}
  }
  // inversiones
  investWeekly();
  // politicas locales de la concejala
  if(S.pol.concejal&&S.day>S.pol.concejal){S.pol.concejal=null;tell(TXN.mundo.concejala_fin,'🏛️');}
  if(S.pol.concejal){const g=Math.round(18*PM());S.money+=g;}
  revolutionCheck();
}
function electionCheck(){
  const w=W_();if(S.day<w.elec||w.era==='consejos'||w.era==='comunas')return;w.elec=S.day+1460;
  const wts={progresista:25+w.mov*0.3+(w.crisis>60?5:0),conservador:25+(w.crisis>55?10:0),liberal:20+(w.crisis<35?10:0),austeridad:8+(w.crisis>60?18:0),centro:15};
  let tot=0;for(const k in wts)tot+=wts[k];let r=Math.random()*tot,res='centro';for(const k in wts){r-=wts[k];if(r<=0){res=k;break;}}
  const old=w.gov;w.gov=res;const G=GOVS[res],I=ID();
  const happy=I.vote===res,sad=I.vote&&I.vote!==res&&!(I.vote==='progresista'&&res==='centro');
  if(S.ideo==='apolitica')tell(huecos(TXN.mundo.elec_apolitica,{ganador:G.n.toLowerCase().replace('gobierno ','partido '),n:CH().name}),'🗳️');
  else if(!I.vote)tell(huecos(TXN.mundo.elec_no_vota,{ganador:G.n.replace('Gobierno ','bloque ').toLowerCase(),n:CH().name,motivo:isI('anarquista')?TXN.mundo.no_vota_anarquista:TXN.mundo.no_vota_otro}),'🗳️');
  else tell(huecos(TXN.mundo.elec_resultado,{icono:G.e,gobierno:G.n,cierre:happy?pickR(TXN.mundo.elec_feliz):sad?pickR(TXN.mundo.elec_triste):TXN.mundo.elec_normal}),G.e);
  toast(huecos(TXN.mundo.elec_aviso,{icono:G.e,gobierno:G.n.toLowerCase(),fx:G.fx.split('·')[0].trim()}),true);
  S.needs.diversion=Math.max(0,Math.min(100,S.needs.diversion+(happy?25:sad?-25:0)));
  // efectos
  if(res==='progresista'&&!S.owned)S.rentCap=true;else S.rentCap=false;
  // municipales: si va en las listas
  if(S.pol.cand&&!S.pol.concejal){const p=Math.min(.75,0.15+S.pol.inf/180+(I.vote===res?0.12:0)+W_().mov/400);
    if(Math.random()<p){S.pol.concejal=S.day+180;chapter('concejal',TXN.mundo.concejala_titulo,huecos(TXN.mundo.concejala_elegida,{n:CH().name}));applyLocalPolicy();}
    else tell(huecos(TXN.mundo.concejala_pierde,{votos:20+(Math.random()*400|0)}),'🗳️');}
}
function applyLocalPolicy(){const k=S.ideo;
  const pol={socialdemocrata:[TXN.mundo.medida_socialdemocrata,()=>{S.rentMul=(S.rentMul||1)*0.85;}],
    conservadora:[TXN.mundo.medida_conservadora,()=>{S.ibiCut=true;}],ecologista:[TXN.mundo.medida_ecologista,()=>{S.pol.coopEnergy=true;}],
    liberal:[TXN.mundo.medida_liberal,()=>{S.bizBoost=true;}],marxista:[TXN.mundo.medida_marxista,()=>{S.pol.coopEnergy=true;S.rentMul=(S.rentMul||1)*0.95;}]}[k];
  if(pol){pol[1]();tell(huecos(TXN.mundo.primera_medida,{medida:pol[0]}),'📜');}}
// revolución o represión
function revolutionCheck(){
  const w=W_();if(w.rev||w.era)return;
  if(!(w.mov>=82&&w.crisis>=68))return;
  const leader=isI('marxista','anarquista')&&S.pol.inf>=55;
  if(!leader&&Math.random()>0.15)return;
  w.rev={left:5+(Math.random()*4|0),total:0,leader};
  chapter('rev1',TXN.mundo.rev1_titulo,leader?huecos(TXN.mundo.rev1,{n:CH().name,extra:S.track==='super'?TXN.mundo.rev1_leader:''}):huecos(TXN.mundo.rev1_otra,{sensacion:isI('conservadora','libertaria','liberal')?huecos(TXN.mundo.rev1_miedo,{n:CH().name}):huecos(TXN.mundo.rev1_increible,{n:CH().name})}));
  toast(TXN.mundo.rev1_aviso,true);
}
function revolutionDaily(){
  const w=W_(),r=w.rev;if(!r)return;r.total++;r.left--;
  if(isI('marxista','anarquista','socialdemocrata','ecologista')){S.pol.inf=Math.min(100,S.pol.inf+(r.leader?3:1));S.needs.social=100;}
  if(r.left>0)return;w.rev=null;
  const p=Math.min(.8,0.25+(w.mov-80)*0.02+(r.leader?S.pol.inf*0.004:0)+(w.gov==='austeridad'?0.08:0));
  if(Math.random()<p){const era=isI('anarquista')?'comunas':'consejos';w.era=era;w.gov=era;w.crisis=Math.max(20,w.crisis-35);
    S.rentMul=(S.rentMul||1)*(era==='comunas'?0.15:0.35);if(S.mort){S.mort.left=Math.round(S.mort.left*0.3);S.mort.pay=Math.round(S.mort.pay*0.3);}
    if(S.office){S.office.tox=Math.max(0.05,S.office.tox*0.35);S.payMul=(S.payMul||1)*1.12;}
    if(S.market){S.market.price=Math.max(1,S.market.price*0.95);}S.shortage=S.day+60;
    if(S.track==='negocio'){setTrack('coop');S.career=0;tell(TXN.mundo.tienda_coop,'🤝');}
    S.pol.coopOK=true;S.noOvertime=S.day+9999;if(S.office)S.office.griev=5;
    chapter('rev2',era==='comunas'?TXN.mundo.rev2_titulo_comuna:TXN.mundo.rev2_titulo_consejos,isI('marxista','anarquista')?huecos(TXN.mundo.rev2_izq,{n:CH().name}):isI('libertaria','liberal','conservadora')?huecos(TXN.mundo.rev2_miedo,{n:CH().name}):TXN.mundo.rev2_otro);}
  else{w.era='represion';w.eraUntil=S.day+365;w.mov=Math.max(5,w.mov-50);w.gov='austeridad';
    chapter('rev3',TXN.mundo.rev3_titulo,huecos(TXN.mundo.rev3,{lider:r.leader?huecos(TXN.mundo.rev3_lista,{n:CH().name}):''}));
    if(r.leader||(isI('marxista','anarquista')&&Math.random()<.4))arrestAna(3+(Math.random()*5|0),TXN.mundo.arresto_huelga);
    if(isI('marxista','anarquista')&&!TR().self&&Math.random()<.5&&!S.jobless){S.jobless=true;S.paroWeeks=0;tell(TXN.mundo.despedida_huelga.replace('Despedida',ga('Despedida','Despedido','Despedide')),'📦');}}
}
function arrestAna(days,where){S.jail=days;S.record=true;const fine=Math.round(80*PM()*(1+Math.random()));S.money-=fine;S.sim.use=null;S.sim.path=[];S.sim.work=days*1440;S.sim.outingActive='calabozo';S.sim.dest='comisaria';S.sim.route=null;S.sim.awayTotal=S.sim.work;S.sim.exit=S.sim.exit||[N/2|0,N-1];
  tell(huecos(TXN.mundo.detenida,{donde:where,dias:days,s:days>1?'s':'',multa:fmt(fine)}).replace('Detenida',ga('Detenida','Detenido','Detenide')),'🚔');toast(huecos(TXN.mundo.detenida_aviso,{n:CH().name,donde:where}).replace('detenida',ga('detenida','detenido','detenide')),true);}
// inversiones (liberal: fondos; libertaria: cripto)
function investWeekly(){
  const p=S.pol;if(!p.invest)return;const inv=S.inv||(S.inv={v:0,in:0,peak:0});
  // aporta lo que le sobra
  const sp=spare();if(sp>300){const a=Math.round(sp*(p.invest==='cripto'?0.25:0.15));S.money-=a;inv.v+=a;inv.in+=a;}
  const r=p.invest==='cripto'?(Math.random()-.46)*0.22+(Math.random()<.03?(Math.random()<.5?-0.6:1.2):0):0.0012+(Math.random()-.5)*0.03-(dark()?0.004:0);
  const before=inv.v;inv.v=Math.max(0,Math.round(inv.v*(1+r)));
  if(Math.abs(inv.v-before)>Math.max(150,before*0.3))tell(p.invest==='cripto'?(inv.v>before?huecos(TXN.mundo.cripto_sube,{v:fmt(inv.v)}):huecos(TXN.mundo.cripto_baja,{v:fmt(inv.v)})):huecos(TXN.mundo.cartera_mueve,{v:fmt(inv.v)}),inv.v>before?'📈':'📉');
  // si va mal de verdad, vende
  if(S.money<0&&inv.v>0){const s=Math.min(inv.v,-S.money+200);inv.v-=s;S.money+=s;tell(huecos(TXN.mundo.cartera_vende,{s:fmt(s)}),'💸');}
}
// negocio propio: lo que entra cada semana
function bizWeekly(){
  if(S.track!=='negocio'||S.jobless)return;const b=S.biz||(S.biz={weeks:0,loss:0});b.weeks++;
  const cost=Math.round((70+60*S.career)*PM());S.money-=cost;
  if((b.last||0)<cost){b.loss++;}else b.loss=0;
  if(b.loss>=5&&S.money<0){S.jobless=true;S.paroWeeks=0;chapter('quiebra',TXN.mundo.quiebra_titulo,huecos(TXN.mundo.quiebra,{n:CH().name}));setTrack('oficina');S.career=0;}
  b.last=0;
}
// lo que se cobra en un turno, según el sector
function payFactor(){const T0=TR(),W=(S.weather||{}).k,dt=dateOf(S.day).wd;let f=govPay();
  if(T0.tips)f*=1+Math.random()*0.35;
  if(S.track==='reparto')f*=(0.6+Math.random()*0.7)*((W==='lluvia'||W==='tormenta')?1.4:1)*(dt>=4?1.2:1);
  if(S.track==='arte')f*=0.3+Math.random()*1.5*(1+0.05*lvl('carisma'));
  if(S.track==='negocio')f*=Math.max(-0.3,(0.25+Math.random()*1.2)*(1+0.05*(lvl('carisma')+lvl('logica')-6))*(1-W_().crisis/160)*(isI('libertaria')?1.15:1)*(S.bizBoost?1.1:1));
  if(S.track==='coop')f*=1-W_().crisis/250;
  if(W_().era==='consejos'||W_().era==='comunas')f*=S.track==='negocio'?0.6:1;
  return f;}
// accidentes y quemarse en el trabajo
function workHazards(){const T0=TR();if(T0.risk&&Math.random()<T0.risk*((S.weather||{}).k==='lluvia'?2:1)*(Dm().soul?1.4:0.7)){const d=2+(Math.random()*6|0);S.sick=d;S.needs.energia=Math.max(10,S.needs.energia-30);
  tell(S.track==='reparto'?huecos(TXN.mundo.accidente_moto,{d:d,auto:T0.auto?TXN.mundo.huelga_nota:''}):huecos(TXN.mundo.accidente_obra,{d:d}),'🩹');toast(huecos(TXN.mundo.accidente_aviso,{n:CH().name,d:d}),true);}}


function dailySociety(){
  const w=W_();
  if(w.gsDay===S.day){w.gs=S.day;w.gsDay=null;w.mov=Math.min(100,w.mov+5);const join=ID().strike>=.5;
    if(join){S.pol.xp+=3;S.pol.inf=Math.min(100,S.pol.inf+3);}
    tell(join?huecos(TXN.mundo.gs_piquete,{n:CH().name}):huecos(TXN.mundo.gs_trabaja,{n:CH().name,motivo:isI('libertaria','conservadora')?TXN.mundo.gs_piquete_no:'.'}),'🪧');
    if(Math.random()<.4){S.payMul=(S.payMul||1)*1.03;setTimeout(()=>tell(TXN.mundo.gs_resultado,'📜'),10);}}
  if(w.gs&&w.gs<S.day-1)w.gs=null;
  revolutionDaily();strikeDay();courtTick();seekTick();oposTick();electionCheck();arcTick();
  if(S.jobless&&!S.seek)autoSeek();
  if(dark()&&!S.story.chap.oscuros)chapter('oscuros',TXN.mundo.oscuros_titulo,huecos(TXN.mundo.oscuros,{cierre:isI('marxista','anarquista')?TXN.mundo.oscuros_izq:isI('libertaria','liberal')?TXN.mundo.oscuros_lib:isI('conservadora')?TXN.mundo.oscuros_cons:TXN.mundo.oscuros_otro}));
}
function ideoThoughts(add){
  const I=ID(),o=oa();if(!S.ideo||S.ideo==='apolitica'){if(Math.random()<.3)add(pickR(I.th),.5);return;}
  add(pickR(I.th),0.6*comp());
  if(dark())add(isI('marxista','anarquista')?TXN.mundo.pienso_organizar:isI('libertaria')?TXN.mundo.pienso_fortunas:isI('conservadora')?TXN.mundo.pienso_aguantar:TXN.mundo.pienso_no_sigue,1.2);
  if(S.strike&&S.strike.on)add(S.strike.join?TXN.mundo.pienso_lucha:TXN.mundo.pienso_piquete,3);
  if(!S.jobless&&S.office&&S.office.org>45&&S.union&&S.union.member)add(TXN.mundo.pienso_plantilla,1);
  if(!S.jobless&&TOX()>0.65&&isI('marxista','anarquista'))add(TXN.mundo.pienso_jefe,1.2);
  if(!S.jobless&&TOX()>0.65&&isI('libertaria','liberal'))add(TXN.mundo.pienso_mejor,1.2);
  if(S.rentStrike)add(TXN.mundo.pienso_alquiler,1.2);
  if(W_().era==='consejos'||W_().era==='comunas')add(isI('marxista','anarquista')?TXN.mundo.pienso_ganado:TXN.mundo.pienso_miedo,1.5);
  if(W_().era==='represion')add(isI('marxista','anarquista')?TXN.mundo.pienso_perdido:TXN.mundo.pienso_calma,1.5);
  if(S.inv&&S.inv.v>0)add(S.pol.invest==='cripto'?TXN.mundo.pienso_cripto:TXN.mundo.pienso_cartera,.8);
  if(S.opos&&S.opos.on)add(TXN.mundo.pienso_opos,1);
  if(S.track==='reparto'&&(S.weather||{}).k==='lluvia')add(TXN.mundo.pienso_lluvia,1.5);
  if(S.track==='negocio')add(pickR([TXN.mundo.pienso_local[0],TXN.mundo.pienso_local[1]]),1);
  if(S.pol.concejal)add(TXN.mundo.pienso_pleno,1);
}
// panel: vida pública y profesiones
function vidaTab(){
  const I=ID(),w=W_(),p=S.pol;let h='';
  h+=`<h3>${huecos(TXN.mundo.ui_ideas,{e:I.e,n:I.n})}${S.ideo!=='apolitica'?` · ${COMP[comp()]}`:''}</h3><div class="sub" style="font-size:12px">${I.d}</div>`;
  h+=I.fx.map(x=>`<div class="sub" style="font-size:11.5px">• ${x}</div>`).join('');
  const arc=ARCS[S.ideo];if(arc){h+=`<div class="arc">${arc.map(a=>`<span class="${p.stages[a.id]?'ok':''}" title="${a.x}">${p.stages[a.id]?'✅':'⬜'} ${a.t}</span>`).join('')}</div>`;}
  h+=`<div class="kv"><span>${TXN.mundo.ui_influencia}</span><span>${Math.round(p.inf)}/100</span></div>`;
  if(p.concejal)h+=`<div class="kv"><span>${TXN.mundo.ui_concejala}</span><span>${huecos(TXN.mundo.ui_concejala_hasta,{dia:p.concejal})}</span></div>`;
  if(S.inv&&(S.inv.v||S.inv.in))h+=`<div class="kv"><span>${p.invest==='cripto'?TXN.mundo.ui_cripto:TXN.mundo.ui_fondos}</span><span>${huecos(TXN.mundo.ui_cartera,{v:fmt(S.inv.v),aportado:fmt(S.inv.in)})}</span></div>`;
  h+=`<h3>${TXN.mundo.ui_salir}</h3>`;
  for(const k of ['amigos','sindicato','militancia','manifestacion','piquete','voluntariado','networking','misa','deporte','biblioteca']){const o=OUT[k];if(o.req&&!o.req()&&k!=='sindicato'&&k!=='militancia')continue;if(k==='misa'&&!isI('conservadora')&&!p.parish)continue;
    const why=outAvail(k);const c=outCost(k);h+=`<div class="outrow"><span class="oe">${o.e}</span><span class="ot"><b>${outName(k)}</b><small>${o.why}${c?' · '+fmt(c):''}</small></span><button class="mini" data-out="${k}" ${why?'disabled style="opacity:.45"':''}>${why||TXN.mundo.ui_ir_ahora}</button></div>`;}
  h+=`<h3>${TXN.mundo.ui_sindicato}</h3>`;
  if(TR().self)h+=`<div class="sub">${huecos(TXN.mundo.ui_sin_sindicato,{extra:isI('libertaria')?TXN.mundo.ui_sin_sindicato_lib:''})}</div>`;
  else if(S.jobless)h+=`<div class="sub">${TXN.mundo.ui_sin_plantilla}</div>`;
  else{const o=office();h+=`<div class="kv"><span>${TXN.mundo.ui_afiliacion}</span><span>${S.union&&S.union.member?huecos(TXN.mundo.ui_afiliada,{dia:S.union.since,cuota:fmt(unionFee())}):TXN.mundo.ui_no}</span></div>`;
    h+=`<div class="skill"><span class="lbl">${TXN.mundo.ui_organizacion}</span><div class="bar"><i style="width:${o.org||0}%;background:#d9605a"></i></div><span class="lv">${Math.round(o.org||0)}</span></div>`;
    h+=`<div class="skill"><span class="lbl">${TXN.mundo.ui_malestar}</span><div class="bar"><i style="width:${o.griev||0}%;background:#e3b341"></i></div><span class="lv">${Math.round(o.griev||0)}</span></div>`;
    if(S.strike&&S.strike.on)h+=`<div class="sub" style="color:var(--bad)">${huecos(TXN.mundo.ui_huelga_marcha,{dias:S.strike.left,nota:S.strike.join?'':TXN.mundo.ui_huelga_marcha_nota})}</div>`;
    h+=`<div style="display:flex;gap:6px">${S.union&&S.union.member?`<button class="btn grey" id="uleave">${TXN.mundo.ui_darse_baja}</button><button class="btn${strikeReady()?'':' grey'}" id="ustrike" ${strikeReady()?'':'style="opacity:.45"'}>${TXN.mundo.ui_convocar}</button>`:`<button class="btn" id="ujoin">${huecos(TXN.mundo.ui_afiliarse,{cuota:fmt(unionFee())})}</button>`}</div>`;
    h+=`<div class="sub" style="font-size:11px">${TXN.mundo.ui_convocar_ayuda}</div>`;}
  h+=`<h3>${TXN.mundo.ui_mundo}</h3>`;
  h+=`<div class="skill"><span class="lbl">${TXN.mundo.ui_crisis}</span><div class="bar"><i style="width:${w.crisis}%;background:${w.crisis>65?'#2f2a3a':'#8a94a6'}"></i></div><span class="lv">${Math.round(w.crisis)}</span></div>`;
  h+=`<div class="skill"><span class="lbl">${TXN.mundo.ui_movimiento}</span><div class="bar"><i style="width:${w.mov}%;background:#d9605a"></i></div><span class="lv">${Math.round(w.mov)}</span></div>`;
  if(dark())h+=`<div class="sub" style="color:#2f2a3a;font-weight:900">${TXN.mundo.ui_oscuros}</div>`;
  const G=GOVS[w.gov];h+=`<div class="kv"><span>${G.e} ${G.n}</span><span style="font-size:11px;text-align:right;max-width:58%">${G.fx}</span></div>`;
  if(!w.era)h+=`<div class="kv"><span>${TXN.mundo.ui_elecciones}</span><span>${huecos(TXN.mundo.ui_elecciones_dia,{dia:w.elec,listas:p.cand?TXN.mundo.ui_elecciones_listas:''})}</span></div>`;
  if(w.manif)h+=`<div class="kv"><span>${TXN.mundo.ui_manifestacion}</span><span>${w.manif.cause} · ${WDL[dateOf(w.manif.day).wd].toLowerCase()}</span></div>`;
  if(w.gsDay)h+=`<div class="kv"><span>${TXN.mundo.ui_huelga_general}</span><span>${WDL[dateOf(w.gsDay).wd].toLowerCase()} ${dateOf(w.gsDay).dm}</span></div>`;
  if(w.rev)h+=`<div class="sub" style="color:var(--bad);font-weight:900">${huecos(TXN.mundo.ui_huelga_indefinida,{dia:w.rev.total+1})}</div>`;
  if(S.rentStrike)h+=`<div class="kv"><span>${TXN.mundo.ui_huelga_alquileres}</span><span>${TXN.mundo.ui_en_marcha}</span></div>`;
  if(S.record)h+=`<div class="kv"><span>${TXN.mundo.ui_antecedentes}</span><span>${TXN.mundo.ui_antecedentes_cuesta}</span></div>`;
  return h;
}
function trackBlock(){
  let h=`<h3>${huecos(TXN.mundo.ui_profesion,{e:TR().e,n:TR().n})}</h3><div class="sub" style="font-size:12px">${TR().d}</div>`;
  h+=`<div class="kv"><span>${TXN.mundo.ui_horario}</span><span>${TR().days.map(d=>WDS[d]).join(' ')} · ${SHIFT.start}:00–${SHIFT.end===24?'00':SHIFT.end}:00</span></div>`;
  if(!S.jobless&&S.office)h+=`<div class="kv"><span>${TXN.mundo.ui_donde}</span><span>${S.office.n}</span></div>`;
  if(S.seek)h+=`<div class="sub" style="color:#2f8a5a">${huecos(TXN.mundo.ui_buscando,{que:TRACKS[S.seek].n.toLowerCase()})} <button class="mini" id="seekno">${TXN.mundo.ui_dejarlo}</button></div>`;
  h+=`<details class="tracks"><summary>${TXN.mundo.ui_cambiar_profesion}</summary>`;
  for(const k of TRK_ORDER){const T0=TRACKS[k],m=entryMissing(k);if(k===S.track&&!S.jobless)continue;
    h+=`<div class="outrow"><span class="oe">${T0.e}</span><span class="ot"><b>${T0.n}</b><small>${T0.levels[0].t} · ${fmt(Math.round(T0.levels[0].pay*Dm().pay))}/turno${m.length?huecos(TXN.mundo.ui_falta,{lista:m.join(', ')}):''}</small></span><button class="mini" data-seek="${k}" ${m.length?'disabled style="opacity:.45"':''}>${T0.self?TXN.mundo.ui_abrir:TXN.mundo.ui_buscar}</button></div>`;}
  h+=`</details>`;
  h+=`<div class="kv"><span>${TXN.mundo.ui_oposiciones}</span><span>${S.oposPassed?TXN.mundo.ui_opos_aprobadas:S.opos&&S.opos.on?huecos(TXN.mundo.ui_opos_estudia,{h:Math.round(S.opos.h),dia:S.opos.exam}):TXN.mundo.ui_no}</span></div>`;
  if(!S.oposPassed)h+=`<button class="btn grey" id="oposb">${S.opos&&S.opos.on?TXN.mundo.ui_opos_dejar:TXN.mundo.ui_opos_preparar}</button>`;
  if(!S.jobless)h+=`<button class="btn grey" id="quitb">${TXN.mundo.ui_dejar_trabajo}</button>`;
  return h;
}
function bindSociety(){
  const q=s=>card.querySelector(s),on=(s,f)=>{const e=q(s);if(e)e.onclick=f;};
  card.querySelectorAll('[data-out]').forEach(b=>b.onclick=()=>{const k=b.dataset.out;if(outAvail(k))return;menu.classList.remove('open');doOut(k);});
  on('#ujoin',()=>{joinUnion();openMenu();});on('#uleave',()=>{leaveUnion();openMenu();});on('#ustrike',()=>{if(strikeReady()){callStrike(false);openMenu();}});
  card.querySelectorAll('[data-seek]').forEach(b=>b.onclick=()=>{const k=b.dataset.seek;if(entryMissing(k).length)return;S.seek=k;if(TRACKS[k].self||TRACKS[k].opos||k==='coop')seekTick();else toast(huecos(TXN.mundo.ui_busca_aviso,{que:TRACKS[k].n.toLowerCase()}));openMenu();});
  on('#seekno',()=>{S.seek=null;openMenu();});
  on('#oposb',()=>{S.opos=S.opos||{on:false,h:0};S.opos.on=!S.opos.on;if(S.opos.on&&!S.opos.exam)S.opos.exam=S.day+90;openMenu();});
  on('#quitb',()=>{if(confirmQuit!==S.day){confirmQuit=S.day;toast(TXN.mundo.ui_dejar_aviso);return;}quitJob();openMenu();});
}
let confirmQuit=null;


// =================== EL BARRIO ===================
// La parcela ocupa 0..N. Alrededor: acera, calzada, acera y manzanas.
const PLACES=DATA.lugares.lugares;
// adónde va Ana según lo que haga
function destOf(k){
  if(k==='work'){return DATA.lugares.trabajo_en[S.track]||'torre';}
  return {amigos:pickR(['bar','sala','parque']),eat:'bar',sindicato:'sindicato',militancia:isI('conservadora')?'parroquia':isI('liberal','libertaria')?'torre':isI('socialdemocrata')?'ayto':'ateneo',manifestacion:'ayto',voluntariado:isI('conservadora')?'parroquia':'comedor',deporte:'parque',networking:'torre',misa:'parroquia',biblioteca:'biblioteca',comedor:'comedor',piquete:destOf('work'),calabozo:'comisaria',walk:'parque'}[k]||'parque';
}
// el anillo de la calzada (centro a 2 casillas de la parcela)
const RLEN=4*(N+4); // el anillo de la calle de antes (solo lo usan los paseantes del decorado)
// gente del barrio
const WALKERS=Array.from({length:12},(_,k)=>{const r=hash(k*37+3),r2=hash(k*53+11);const g=r<.5?'f':'m';
  return {t:hash(k*17+1)*RLEN,sp:(0.5+r2*0.6)*(k%2?1:-1),off:k%2?-0.75:0.75,ch:{name:'',g,skin:SKINS[(k*3)%SKINS.length],hair:HAIRCOLS[(k*5)%7],style:g==='f'?['melena','coleta','corto','mono','rizos'][k%5]:['corto','rapado','calvo','rizos'][k%4],beard:g==='m'&&k%3===0?'corta':'no',glasses:k%4===0,build:['media','delgada','ancha'][k%3],shirt:SHIRTC[(k*7)%SHIRTC.length],pants:PANTSC[k%PANTSC.length],eyes:'#3b2a20'},ph:k};});
const CARS=Array.from({length:4},(_,k)=>({t:k*RLEN/4+hash(k)*8,sp:(k%2?1:-1)*(3+hash(k*9)*2),c:['#d9534f','#5bc0be','#f0ad4e','#3b3f46'][k]}));
