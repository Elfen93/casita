// =================== EL GOBIERNO SE NOTA: consejos y comunas cambian la casa, el curro, la compra y el banco, por fases ===================
const REV=()=>{const e=W_().era;return e==='consejos'||e==='comunas';};
const GV=()=>{if(!S.gv)S.gv={since:null,ph:0,pre:null,lack:[],prop:-99,comedor:0,elec:0,ev:0};return S.gv;};
const GV_PH=[[0,'🏠 Vivienda','Alquiler social y fin de los desahucios'],[5,'🔧 Trabajo','Sin jefe: asambleas, cargos elegidos y revocables, sin horas extra'],[12,'🧺 Compra y banco','Precios regulados, banca pública… y escasez por el bloqueo']];
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
if(typeof mgEvict==='function'){const _ev=mgEvict;mgEvict=function(who){if(REV()&&govPh()>=1){const m=MG();m.debt=0;m.wk=0;tell(`Han venido a cobrar lo atrasado y la asamblea de bloque ha dicho que no. Ya no se echa a nadie de su casa.`,'🏠');return;}return _ev.apply(this,arguments);};}
// el préstamo, a interés de banca pública
{const _lr=loanRate;loanRate=function(){return govBank()?.015:_lr();};}
// lo que pasa al entrar en cada fase
function govTick(){const g=GV();if(!REV())return;const ph=govPh();const n=CH().name;
  while(g.ph<ph){g.ph++;
    if(g.ph===1){const m=MG();const deb=m.debt||0;m.debt=0;m.wk=0;
      tell(`Fase uno: vivienda. El alquiler pasa a ser social: nunca más del 22 % de lo que entra. ${deb?`La deuda del alquiler (${fmt(deb)}) queda condonada. `:''}Los pisos vacíos se reparten en asamblea.`,'🏠');}
    if(g.ph===2){tell(`Fase dos: trabajo. En ${S.office?S.office.n:'el curro'} ya no manda nadie que no haya votado la plantilla. Se acabaron las horas extra sin cobrar. Los cargos se eligen y se pueden revocar. A cambio: asambleas. Muchas.`,'🔧');}
    if(g.ph===3){const b=BP();let liq=0;for(const k of ['fondos','cripto']){if(b[k]&&b[k].v>0){liq+=b[k].v;b[k].v=0;b[k].in=0;}}if(liq){b.ahorro.v+=liq;}
      BANK_N='Banca Pública';
      tell(`Fase tres: compra y banco. ${g.pre?g.pre.bank:'El banco'} ahora es Banca Pública: sin comisiones, préstamos al 1,5 %.${liq?` Los fondos y la cripto de ${n} se han liquidado a su valor (${fmt(liq)}) y están en la cuenta de ahorro.`:''} Lo básico baja de precio. Pero hay bloqueo: faltarán cosas.`,'🧺');}
  }
  if(govPh()>=3)BANK_N='Banca Pública';
  // el curro sin patrón: aunque cambie de trabajo
  if(govPh()>=2&&S.office){S.office.tox=Math.min(S.office.tox,.12);S.noOvertime=S.day+9999;}}
// cada día: fases, escasez, problemas nuevos
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{
  if(!REV()){if(S.gv&&S.gv.since!=null){S.gv.since=null;S.gv.ph=0;BANK_N='Banco Atlántico';}return r;}
  const g=GV();if(g.since==null)govStart();govTick();const n=CH().name;
  // escasez: cambia cada semana
  if(govPh()>=3&&(S.day-g.since)%7===5){const all=['café','carne','electrónica','medicinas de marca','tabaco','fruta de fuera'];g.lack=all.filter(()=>Math.random()<.3).slice(0,2);if(!g.lack.length)g.lack=[pickR(all)];
    if(g.lack.includes('electrónica'))S.shortage=Math.max(S.shortage||0,S.day+8);
    tell(`Esta semana falta: ${g.lack.join(' y ')}. Hay cola en el economato y gente que dice que «antes esto no pasaba». Antes pasaban otras cosas.`,'🧺');}
  if(OUT.compra){OUT.compra._d=OUT.compra._d||OUT.compra.dur;OUT.compra.dur=govPh()>=3?Math.round(OUT.compra._d*1.5):OUT.compra._d;}
  // problemas nuevos, de vez en cuando
  if(Math.random()<.12&&S.day-g.ev>3){g.ev=S.day;const E=[
    [`Sabotaje: el antiguo dueño de una fábrica del polígono se ha llevado las máquinas a Portugal. La asamblea busca piezas.`,'🏭'],
    [`El bloqueo: un barco con medicinas lleva dos semanas parado en el puerto. En la tele de fuera lo llaman «presión diplomática».`,'🚢'],
    [`Un vecino del tercero dice que con el casero vivía mejor. Paga la mitad que antes. Pero lo dice.`,'🙄'],
    [`Asamblea de barrio de cuatro horas para decidir el horario del centro de salud. Se ha votado. ${n} ha llegado a casa sin voz.`,'🗣️'],
    [`Han abierto un comedor popular en el bajo donde estaba la sucursal bancaria. Lentejas, pan y cola.`,'🍲'],
    [`Pintada nueva en la parada del bus: «Ni amos ni colas». Debajo, a boli: «sin colas no hay revolución».`,'🖌️'],
    [`Apagón de tres horas por la noche: falta combustible. Han salido velas, guitarras y vecinos que no se hablaban.`,'🕯️']];
    const [t,e]=pickR(E);tell(t,e);if(e==='🕯️'){S.needs.social=Math.min(100,S.needs.social+10);}}
  // elección de cargos en el curro, cada mes
  if(govPh()>=2&&!S.jobless&&!TR().self&&S.day-g.elec>=30&&dateOf(S.day).wd===2){g.elec=S.day;const next=CAREER[S.career+1];
    const p=.15+Math.min(.5,((S.rep??60)-50)/100+(lvl('carisma')||0)*.04);
    if(next&&Math.random()<p){S.career++;tell(`La asamblea del curro ha elegido a ${n} como ${next.t.toLowerCase()}. Revocable cuando quieran. Cobra lo mismo que los demás más un poco por las horas de reuniones.`,'🗳️');}
    else tell(`Elección de cargos en el curro. Han salido otras. ${n} ha votado y ha vuelto a su puesto, que es lo normal.`.replace('otras',ga('otras','otros','otres')),'🗳️');}
}catch(e){console.error(e);}return r;};}
// asambleas en el curro: alargan el turno pero no se van de vacío
{const _dp=depart;depart=function(){const r=_dp.apply(this,arguments);try{const s=S.sim;if(REV()&&govPh()>=2&&s.work>0&&!s.outingActive&&Math.random()<.22){s.work+=60;S.needs.social=Math.min(100,S.needs.social+8);setTimeout(()=>{if(Math.random()<.5)tell(pickR([`Hoy hay asamblea de centro antes de empezar: turnos de verano. Una hora más. Se ha aprobado lo que ${CH().name} propuso.`,`Asamblea: hay que repartir el trabajo del compañero de baja. Se reparte. Nadie lo carga solo.`,`Asamblea de una hora para decidir si una hora es demasiado para una asamblea.`]),'✋');},900);}}catch(e){}return r;};}
// comedor del centro (si sale aprobado): el descanso sale gratis
{const _up=update;update=function(gm){const s=S.sim;const pre=s.lunch;const r=_up.apply(this,arguments);try{if(GV().comedor&&REV()&&s.lunch===S.day&&pre!==S.day&&!S.tapers){const last=(BKS().log||[]).slice(-1)[0];if(last&&last[3]==='Menú'&&last[0]===S.day)bkAdd('Comedor del centro',-last[2]);}}catch(e){}return r;};}
// el sindicato: ya no hay patrón contra quien hacer huelga; ahora se lleva una propuesta al consejo
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{if(REV()){
  if(govPh()>=2){h=h.replace(/<button class="btn[^"]*" id="ustrike"[^>]*>[^<]*<\/button>/,`<button class="btn${S.day-GV().prop>=7?'':' grey'}" id="gvprop">📣 Propuesta al consejo</button>`)
    .replace(/Para convocar huelga hace falta organización 50 y malestar 35\.[^<]*/,`Sin patrón no hay contra quién hacer huelga. Lo que se quiere cambiar se lleva al consejo: una propuesta por semana. Cuanta más organización, más fácil que salga.`);}
  h=h.replace('<h3>🌍 El mundo</h3>',`<h3>🌍 El mundo</h3><button class="btn grey" id="gvopen">📜 Qué ha cambiado para ${CH().name}</button>`);}}catch(e){}return h;};}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('#gvprop,#gvopen,#gvclose');if(!t)return;if(t.id==='gvopen')openGov();else if(t.id==='gvclose')closeGov();else govPropose();},true);
function govPropose(){const g=GV();if(S.day-g.prop<7){toast(`La próxima propuesta, en ${7-(S.day-g.prop)} días`);return;}g.prop=S.day;const o=office();const n=CH().name;
  const ideas=[['comedor','Comedor en el centro de trabajo',()=>{g.comedor=1;}],['sueldo','Subir lo que se cobra (sale de lo que antes se llevaba la empresa)',()=>{S.payMul=(S.payMul||1)*1.05;}],['org','Una hora a la semana de formación en horario de trabajo',()=>{gainSkill('logica',120);}]].filter(i=>!(i[0]==='comedor'&&g.comedor));
  const [k,t,f]=pickR(ideas);const p=.35+(o.org||0)/200;
  if(Math.random()<p){f();o.org=Math.min(100,(o.org||0)+5);tell(`${n} ha llevado al consejo: «${t}». Aprobada.${k==='comedor'?' Desde mañana se come en el centro, sin pagar.':k==='sueldo'?' +5 % para toda la plantilla.':' Los jueves, una hora de aprender cosas.'}`,'📣');sfx('level');}
  else tell(`${n} ha llevado al consejo: «${t}». Rechazada: este mes la prioridad es el hospital y el transporte. ${n} lo entiende. Lo volverá a traer.`,'📣');
  if(typeof openMenu==='function')openMenu();}
// ventana «Qué ha cambiado»
let gvEl=null;
function closeGov(){if(gvEl)gvEl.classList.remove('on');}
function openGov(){if(!REV())return;const g=GV();const d=S.day-g.since;const ph=govPh();const pre=g.pre||{};
  if(!gvEl){gvEl=document.createElement('div');gvEl.id='gvsheet';document.body.appendChild(gvEl);}
  const row=(a,b,c)=>`<div class="gvr"><span>${a}</span><span>${b?`<s>${b}</s> → `:''}<b>${c}</b></span></div>`;
  let h=`<div class="omt">${W_().era==='comunas'?'🏴 La comuna':'🚩 Los consejos'}: qué cambia para ${CH().name}</div><div class="sub" style="padding:0 8px 6px">Día ${d+1} desde que cayó el gobierno. Los cambios llegan por fases.</div>`;
  for(let i=0;i<GV_PH.length;i++){const [dd,t,x]=GV_PH[i];const on=ph>i;h+=`<div class="gvph${on?' on':''}"><b>${on?'✅':'⏳'} ${t}</b><small>${x}${on?'':` · en ${dd-d} días`}</small></div>`;}
  h+=`<div class="gvbox">`;
  if(S.owned)h+=row('🏠 Hipoteca','','reducida al 30 %');
  else if(S.home&&S.home.type==='padres')h+=row('🏠 Vive con su madre','','sin alquiler');
  else h+=row('🏠 Alquiler / semana',pre.rent&&ph>=1&&pre.rent>weeklyRent()?fmt(pre.rent):'',ph>=1?fmt(weeklyRent()):'pendiente');
  h+=row('⚖️ Desahucios',ph>=1?'sí':'',ph>=1?'no':'pendiente');
  if(!S.jobless&&!TR().self){h+=row('💼 Sueldo / turno',pre.pay&&pre.pay<salary()?fmt(pre.pay):'',fmt(Math.round(salary()*payFactor())));
    h+=row('⏳ Horas extra sin cobrar',ph>=2?'sí':'',ph>=2?'no':'pendiente');h+=row('👔 Jefe',ph>=2?'sí':'',ph>=2?'cargos elegidos':'pendiente');
    if(g.comedor)h+=row('🍲 Comedor del centro','','gratis');}
  h+=row('🧺 Compra semanal',ph>=3&&pre.compra?fmt(pre.compra):'',fmt(compraCost()));
  h+=row('🏦 Banco',ph>=3?(pre.bank||'Banco Atlántico'):'',ph>=3?'Banca Pública, sin comisiones':'pendiente');
  if(ph>=3)h+=row('🚫 Esta semana falta','',g.lack.join(', ')||'nada');
  h+=`</div><div class="sub" style="padding:6px 8px">Lo que cuesta: asambleas largas, colas, bloqueo exterior, sabotajes de quien lo tenía todo, y vecinos que echan de menos lo de antes. Y si el movimiento se apaga, lo ganado se puede perder.</div><div style="padding:6px"><button class="btn" id="gvclose">Entendido</button></div>`;
  gvEl.innerHTML=h;gvEl.classList.add('on');}
