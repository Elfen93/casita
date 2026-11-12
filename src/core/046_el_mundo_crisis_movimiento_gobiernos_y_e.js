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
  if(w.era==='represion'&&S.day>w.eraUntil){w.era=null;tell('Se levanta el estado de excepción. Las calles vuelven a ser de quien las pisa.','🕊️');}
  // manifestaciones convocadas
  if(!w.manif&&w.mov>20&&Math.random()<w.mov/(w.era?400:140)){const sat=S.day+((5-dateOf(S.day).wd+7)%7||7);
    const causes=[['por la vivienda',['marxista','anarquista','socialdemocrata','ecologista']],['contra los recortes',['marxista','anarquista','socialdemocrata','ecologista']],['por los salarios',['marxista','anarquista','socialdemocrata']],['por el clima',['ecologista','anarquista','socialdemocrata']],['por bajar los impuestos',['liberal','libertaria','conservadora']],['por la seguridad en el barrio',['conservadora']],['contra el cierre de la fábrica',['marxista','anarquista','socialdemocrata','conservadora','apolitica']]];
    const c=pickR(causes);w.manif={day:sat,cause:c[0],side:c[1]};tell(`Convocan una manifestación ${c[0]} para el ${WDL[dateOf(sat).wd].toLowerCase()}.`,'📣');}
  if(w.manif&&S.day>w.manif.day)w.manif=null;
  // huelga de alquileres y desahucios
  if(S.pol.tenant&&!S.owned&&!S.rentStrike&&w.mov>=35&&Math.random()<.3){S.rentStrike=true;chapter('inquilinas','Huelga de alquileres','Todo el bloque ha dejado de pagar la última subida del alquiler. El casero amenaza; el sindicato de inquilinas responde.');}
  if(S.rentStrike&&Math.random()<.08){if(w.mov>=55||Math.random()<.5){S.rentMul=(S.rentMul||1)*0.9;tell('El casero negocia con el sindicato de inquilinas: baja un 10 % el alquiler a todo el bloque.','🏘️');}else{tell(`Ha llegado una carta de desahucio. ${w.mov>=40?'Cuarenta vecinas se plantaron en el portal y la comitiva judicial se fue por donde vino.':'Tiene que pagar lo que debe o irse.'}`,'📨');if(w.mov<40){S.money-=Math.round(weeklyRent()*2);S.rentStrike=false;}}}
  // huelga general
  if(!w.gs&&w.mov>=60&&w.crisis>=55&&Math.random()<0.12){const day=S.day+3+(Math.random()*4|0);w.gsDay=day;tell(`Los sindicatos convocan huelga general para el ${WDL[dateOf(day).wd].toLowerCase()} ${dateOf(day).dm}.`,'🪧');}
  // ayudas de su gente cuando no llega
  if(S.money<reserveMoney()*0.5){
    if(S.pol.mutual&&Math.random()<.5){S.needs.hambre=Math.max(S.needs.hambre,80);S.pantry=(S.pantry||0)+4;const g=Math.round(30*PM()*Math.random());S.money+=g;tell(`La red de apoyo mutuo le ha traído una caja de comida${g?` y ${fmt(g)} de la caja común`:''}. Nadie pregunta, nadie lleva la cuenta.`,'🫶');}
    else if(S.pol.parish&&Math.random()<.4){const g=Math.round(25*PM());S.money+=g;tell(`La parroquia le ha echado una mano: ${fmt(g)} y una bolsa de comida. «Para eso estamos».`,'⛪');}
  }
  // inversiones
  investWeekly();
  // politicas locales de la concejala
  if(S.pol.concejal&&S.day>S.pol.concejal){S.pol.concejal=null;tell('Se acaba su mandato de concejala.','🏛️');}
  if(S.pol.concejal){const g=Math.round(18*PM());S.money+=g;}
  revolutionCheck();
}
function electionCheck(){
  const w=W_();if(S.day<w.elec||w.era==='consejos'||w.era==='comunas')return;w.elec=S.day+1460;
  const wts={progresista:25+w.mov*0.3+(w.crisis>60?5:0),conservador:25+(w.crisis>55?10:0),liberal:20+(w.crisis<35?10:0),austeridad:8+(w.crisis>60?18:0),centro:15};
  let tot=0;for(const k in wts)tot+=wts[k];let r=Math.random()*tot,res='centro';for(const k in wts){r-=wts[k];if(r<=0){res=k;break;}}
  const old=w.gov;w.gov=res;const G=GOVS[res],I=ID();
  const happy=I.vote===res,sad=I.vote&&I.vote!==res&&!(I.vote==='progresista'&&res==='centro');
  if(S.ideo==='apolitica')tell(`Elecciones generales: gana el ${G.n.toLowerCase().replace('gobierno ','partido ')}. ${CH().name} ni se enteró de quién se presentaba.`,'🗳️');
  else if(!I.vote)tell(`Elecciones: gana el ${G.n.replace('Gobierno ','bloque ').toLowerCase()}. ${CH().name} no votó: ${isI('anarquista')?'«si votar cambiara algo, estaría prohibido».':'«votar es legitimar el robo».'}`,'🗳️');
  else tell(`Elecciones generales: ${G.e} ${G.n}. ${happy?pickR(['Lo celebró hasta las tantas.','Por fin una buena noticia.']):sad?pickR(['Se fue a dormir sin cenar.','Cuatro años más de esto…','Discutió con medio grupo de WhatsApp.']):'Podría ser peor.'}`,G.e);
  toast(`🗳️ ${G.e} Nuevo ${G.n.toLowerCase()}: ${G.fx.split('·')[0].trim()}`,true);
  S.needs.diversion=Math.max(0,Math.min(100,S.needs.diversion+(happy?25:sad?-25:0)));
  // efectos
  if(res==='progresista'&&!S.owned)S.rentCap=true;else S.rentCap=false;
  // municipales: si va en las listas
  if(S.pol.cand&&!S.pol.concejal){const p=Math.min(.75,0.15+S.pol.inf/180+(I.vote===res?0.12:0)+W_().mov/400);
    if(Math.random()<p){S.pol.concejal=S.day+180;chapter('concejal','Concejala',`${CH().name} ha salido elegida concejala. Le ha temblado la voz al jurar el cargo.`);applyLocalPolicy();}
    else tell(`Se presentó en las listas municipales y se quedó a ${20+(Math.random()*400|0)} votos del acta.`,'🗳️');}
}
function applyLocalPolicy(){const k=S.ideo;
  const pol={socialdemocrata:['Alquiler social: el ayuntamiento compra viviendas vacías y las alquila barato.',()=>{S.rentMul=(S.rentMul||1)*0.85;}],
    conservadora:['Rebaja del IBI y las tasas municipales.',()=>{S.ibiCut=true;}],ecologista:['Placas solares en todos los edificios públicos y cooperativa energética municipal.',()=>{S.pol.coopEnergy=true;}],
    liberal:['Ventanilla única: abrir un negocio ya no lleva seis meses de papeles.',()=>{S.bizBoost=true;}],marxista:['Remunicipalización del agua y la luz.',()=>{S.pol.coopEnergy=true;S.rentMul=(S.rentMul||1)*0.95;}]}[k];
  if(pol){pol[1]();tell(`Su primera medida: ${pol[0]}`,'📜');}}
// revolución o represión
function revolutionCheck(){
  const w=W_();if(w.rev||w.era)return;
  if(!(w.mov>=82&&w.crisis>=68))return;
  const leader=isI('marxista','anarquista')&&S.pol.inf>=55;
  if(!leader&&Math.random()>0.15)return;
  w.rev={left:5+(Math.random()*4|0),total:0,leader};
  chapter('rev1','El día que todo se paró',leader?`Huelga general indefinida. Fábricas, supermercados y hospitales en manos de quien trabaja en ellos. En la asamblea del barrio, alguien dice el nombre de ${CH().name} y todo el mundo se gira. ${S.track==='super'?'Hace un año pasaba códigos de barras. Hoy coordina el reparto de comida de medio barrio.':''}`:`Huelga general indefinida. La ciudad entera se ha parado. ${isI('conservadora','libertaria','liberal')?`${CH().name} mira las noticias con el corazón en un puño.`:`${CH().name} no se lo puede creer.`}`);
  toast('🚩 Huelga general indefinida: todo se ha parado',true);
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
    if(S.track==='negocio'){setTrack('coop');S.career=0;tell('Su tienda ha pasado a ser una cooperativa. Las cuentas ahora se aprueban en asamblea.','🤝');}
    S.pol.coopOK=true;S.noOvertime=S.day+9999;if(S.office)S.office.griev=5;
    chapter('rev2',era==='comunas'?'La comuna':'Todo el poder a los consejos',isI('marxista','anarquista')?`Ha pasado. El gobierno ha caído y las asambleas deciden. ${CH().name} no ha dormido en tres días y no ha sido tan feliz en toda su vida. Lo difícil empieza ahora: hay escasez, bloqueo exterior y mil asambleas por delante.`:isI('libertaria','liberal','conservadora')?`El gobierno ha caído y mandan las asambleas. ${CH().name} tiene miedo: ¿qué pasa ahora con lo que ha ahorrado? Por de pronto, el alquiler ha bajado y en las tiendas faltan cosas.`:`El gobierno ha caído y mandan las asambleas. El alquiler baja, en el trabajo ya no hay jefe… y en las tiendas faltan cosas.`);}
  else{w.era='represion';w.eraUntil=S.day+365;w.mov=Math.max(5,w.mov-50);w.gov='austeridad';
    chapter('rev3','La noche más larga',`El gobierno ha decretado el estado de excepción. Hay detenciones, multas y despidos de huelguistas. ${r.leader?`${CH().name} estaba en todas las listas.`:''}`);
    if(r.leader||(isI('marxista','anarquista')&&Math.random()<.4))arrestAna(3+(Math.random()*5|0),'en la huelga general');
    if(isI('marxista','anarquista')&&!TR().self&&Math.random()<.5&&!S.jobless){S.jobless=true;S.paroWeeks=0;tell('Despedida por participar en la huelga. Sin paro.'.replace('Despedida',ga('Despedida','Despedido','Despedide')),'📦');}}
}
function arrestAna(days,where){S.jail=days;S.record=true;const fine=Math.round(80*PM()*(1+Math.random()));S.money-=fine;S.sim.use=null;S.sim.path=[];S.sim.work=days*1440;S.sim.outingActive='calabozo';S.sim.dest='comisaria';S.sim.route=null;S.sim.awayTotal=S.sim.work;S.sim.exit=S.sim.exit||[N/2|0,N-1];
  tell(`Detenida ${where}. ${days} día${days>1?'s':''} en comisaría y una multa de ${fmt(fine)}. Ahora tiene antecedentes: le costará más encontrar trabajo.`.replace('Detenida',ga('Detenida','Detenido','Detenide')),'🚔');toast(`🚔 ${CH().name} ha sido detenida ${where}`.replace('detenida',ga('detenida','detenido','detenide')),true);}
// inversiones (liberal: fondos; libertaria: cripto)
function investWeekly(){
  const p=S.pol;if(!p.invest)return;const inv=S.inv||(S.inv={v:0,in:0,peak:0});
  // aporta lo que le sobra
  const sp=spare();if(sp>300){const a=Math.round(sp*(p.invest==='cripto'?0.25:0.15));S.money-=a;inv.v+=a;inv.in+=a;}
  const r=p.invest==='cripto'?(Math.random()-.46)*0.22+(Math.random()<.03?(Math.random()<.5?-0.6:1.2):0):0.0012+(Math.random()-.5)*0.03-(dark()?0.004:0);
  const before=inv.v;inv.v=Math.max(0,Math.round(inv.v*(1+r)));
  if(Math.abs(inv.v-before)>Math.max(150,before*0.3))tell(p.invest==='cripto'?(inv.v>before?`Las cripto se han disparado: su cartera vale ${fmt(inv.v)}.`:`Desplome cripto: su cartera ha caído a ${fmt(inv.v)}.`):`Los mercados se mueven: su cartera está en ${fmt(inv.v)}.`,inv.v>before?'📈':'📉');
  // si va mal de verdad, vende
  if(S.money<0&&inv.v>0){const s=Math.min(inv.v,-S.money+200);inv.v-=s;S.money+=s;tell(`Ha tenido que vender ${fmt(s)} de su cartera para tapar agujeros.`,'💸');}
}
// negocio propio: lo que entra cada semana
function bizWeekly(){
  if(S.track!=='negocio'||S.jobless)return;const b=S.biz||(S.biz={weeks:0,loss:0});b.weeks++;
  const cost=Math.round((70+60*S.career)*PM());S.money-=cost;
  if((b.last||0)<cost){b.loss++;}else b.loss=0;
  if(b.loss>=5&&S.money<0){S.jobless=true;S.paroWeeks=0;chapter('quiebra','Persiana bajada',`${CH().name} ha cerrado el negocio. Cinco semanas seguidas perdiendo dinero. Le quedan las deudas y una lección cara.`);setTrack('oficina');S.career=0;}
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
  tell(S.track==='reparto'?`Se ha caído con la moto bajo la lluvia. ${d} días sin poder trabajar${T0.auto?' y sin cobrar: los autónomos no tienen bajas de verdad':''}.`:`Accidente en la obra: se ha hecho daño en la espalda. ${d} días de baja.`,'🩹');toast(`🩹 ${CH().name} ha tenido un accidente: ${d} días de baja`,true);}}


function dailySociety(){
  const w=W_();
  if(w.gsDay===S.day){w.gs=S.day;w.gsDay=null;w.mov=Math.min(100,w.mov+5);const join=ID().strike>=.5;
    if(join){S.pol.xp+=3;S.pol.inf=Math.min(100,S.pol.inf+3);}
    tell(join?`Huelga general. ${CH().name} no fue a trabajar: estuvo en los piquetes desde las siete de la mañana.`:`Huelga general. ${CH().name} fue a trabajar igualmente${isI('libertaria','conservadora')?': «a mí nadie me dice cuándo no puedo trabajar».':'.'}`,'🪧');
    if(Math.random()<.4){S.payMul=(S.payMul||1)*1.03;setTimeout(()=>tell('Tras la huelga general, el gobierno sube el salario mínimo y pacta mejoras salariales. Hasta su nómina lo nota.','📜'),10);}}
  if(w.gs&&w.gs<S.day-1)w.gs=null;
  revolutionDaily();strikeDay();courtTick();seekTick();oposTick();electionCheck();arcTick();
  if(S.jobless&&!S.seek)autoSeek();
  if(dark()&&!S.story.chap.oscuros)chapter('oscuros','Tiempos oscuros',`La crisis se lo come todo: cierres, desahucios, colas en el banco de alimentos. ${isI('marxista','anarquista')?'Pero en los barrios la gente ha empezado a organizarse.':isI('libertaria','liberal')?'Quien se mueva rápido sobrevivirá.':isI('conservadora')?'Toca apretarse el cinturón y cuidar de los suyos.':'Nadie sabe qué va a pasar.'}`);
}
function ideoThoughts(add){
  const I=ID(),o=oa();if(!S.ideo||S.ideo==='apolitica'){if(Math.random()<.3)add(pickR(I.th),.5);return;}
  add(pickR(I.th),0.6*comp());
  if(dark())add(isI('marxista','anarquista')?'O nos organizamos o nos aplastan.':isI('libertaria')?'En las crisis se hacen las fortunas.':isI('conservadora')?'Hay que aguantar. Siempre se ha aguantado.':'Esto no puede seguir así.',1.2);
  if(S.strike&&S.strike.on)add(S.strike.join?'Hoy no se trabaja: hoy se lucha.':'Cruzar el piquete me revuelve el estómago… pero tengo facturas.',3);
  if(!S.jobless&&S.office&&S.office.org>45&&S.union&&S.union.member)add('Ya somos muchas en la plantilla.',1);
  if(!S.jobless&&TOX()>0.65&&isI('marxista','anarquista'))add('Mi jefe vive de mi tiempo.',1.2);
  if(!S.jobless&&TOX()>0.65&&isI('libertaria','liberal'))add('Me merezco algo mejor. Me iré a otra empresa.',1.2);
  if(S.rentStrike)add('Este mes no pagamos la subida. Juntas.',1.2);
  if(W_().era==='consejos'||W_().era==='comunas')add(isI('marxista','anarquista')?'Lo hemos conseguido. Ahora hay que cuidarlo.':'¿Y ahora qué va a pasar con todo?',1.5);
  if(W_().era==='represion')add(isI('marxista','anarquista')?'Nos han ganado esta vez. Solo esta vez.':'Ojalá vuelva la calma.',1.5);
  if(S.inv&&S.inv.v>0)add(S.pol.invest==='cripto'?'¿Cómo irá bitcoin hoy?':'Mi cartera sigue creciendo, poco a poco.',.8);
  if(S.opos&&S.opos.on)add('Tema 14: el procedimiento administrativo…',1);
  if(S.track==='reparto'&&(S.weather||{}).k==='lluvia')add('Con esta lluvia, hoy se cobra más… si no me caigo.',1.5);
  if(S.track==='negocio')add(pickR(['¿Llegaré a pagar el local este mes?','Sin jefe, pero sin descanso.']),1);
  if(S.pol.concejal)add('Mañana hay pleno en el ayuntamiento.',1);
}
// panel: vida pública y profesiones
function vidaTab(){
  const I=ID(),w=W_(),p=S.pol;let h='';
  h+=`<h3>${I.e} Ideas: ${I.n}${S.ideo!=='apolitica'?` · ${COMP[comp()]}`:''}</h3><div class="sub" style="font-size:12px">${I.d}</div>`;
  h+=I.fx.map(x=>`<div class="sub" style="font-size:11.5px">• ${x}</div>`).join('');
  const arc=ARCS[S.ideo];if(arc){h+=`<div class="arc">${arc.map(a=>`<span class="${p.stages[a.id]?'ok':''}" title="${a.x}">${p.stages[a.id]?'✅':'⬜'} ${a.t}</span>`).join('')}</div>`;}
  h+=`<div class="kv"><span>📢 Influencia</span><span>${Math.round(p.inf)}/100</span></div>`;
  if(p.concejal)h+=`<div class="kv"><span>🏛️ Concejala</span><span>hasta el día ${p.concejal}</span></div>`;
  if(S.inv&&(S.inv.v||S.inv.in))h+=`<div class="kv"><span>${p.invest==='cripto'?'🪙 Cripto':'📈 Fondos indexados'}</span><span>${fmt(S.inv.v)} (aportado ${fmt(S.inv.in)})</span></div>`;
  h+=`<h3>🚶 Salir</h3>`;
  for(const k of ['amigos','sindicato','militancia','manifestacion','piquete','voluntariado','networking','misa','deporte','biblioteca']){const o=OUT[k];if(o.req&&!o.req()&&k!=='sindicato'&&k!=='militancia')continue;if(k==='misa'&&!isI('conservadora')&&!p.parish)continue;
    const why=outAvail(k);const c=outCost(k);h+=`<div class="outrow"><span class="oe">${o.e}</span><span class="ot"><b>${outName(k)}</b><small>${o.why}${c?' · '+fmt(c):''}</small></span><button class="mini" data-out="${k}" ${why?'disabled style="opacity:.45"':''}>${why||'Ir ahora'}</button></div>`;}
  h+=`<h3>✊ Sindicato</h3>`;
  if(TR().self)h+=`<div class="sub">Con negocio propio no hay sindicato. ${isI('libertaria')?'Ni falta que hace.':''}</div>`;
  else if(S.jobless)h+=`<div class="sub">Sin trabajo no hay plantilla que organizar.</div>`;
  else{const o=office();h+=`<div class="kv"><span>Afiliación</span><span>${S.union&&S.union.member?`sí, desde el día ${S.union.since} · ${fmt(unionFee())}/mes`:'no'}</span></div>`;
    h+=`<div class="skill"><span class="lbl">🤝 Organización</span><div class="bar"><i style="width:${o.org||0}%;background:#d9605a"></i></div><span class="lv">${Math.round(o.org||0)}</span></div>`;
    h+=`<div class="skill"><span class="lbl">😤 Malestar</span><div class="bar"><i style="width:${o.griev||0}%;background:#e3b341"></i></div><span class="lv">${Math.round(o.griev||0)}</span></div>`;
    if(S.strike&&S.strike.on)h+=`<div class="sub" style="color:var(--bad)">🪧 Huelga en marcha: quedan ${S.strike.left} días${S.strike.join?'':' · Ana va a trabajar'}.</div>`;
    h+=`<div style="display:flex;gap:6px">${S.union&&S.union.member?`<button class="btn grey" id="uleave">Darse de baja</button><button class="btn${strikeReady()?'':' grey'}" id="ustrike" ${strikeReady()?'':'style="opacity:.45"'}>🪧 Convocar huelga</button>`:`<button class="btn" id="ujoin">✊ Afiliarse (${fmt(unionFee())}/mes)</button>`}</div>`;
    h+=`<div class="sub" style="font-size:11px">Para convocar huelga hace falta organización 50 y malestar 35. Las asambleas organizan; las horas extra, los recortes y los despidos generan malestar.</div>`;}
  h+=`<h3>🌍 El mundo</h3>`;
  h+=`<div class="skill"><span class="lbl">📉 Crisis</span><div class="bar"><i style="width:${w.crisis}%;background:${w.crisis>65?'#2f2a3a':'#8a94a6'}"></i></div><span class="lv">${Math.round(w.crisis)}</span></div>`;
  h+=`<div class="skill"><span class="lbl">✊ Movimiento</span><div class="bar"><i style="width:${w.mov}%;background:#d9605a"></i></div><span class="lv">${Math.round(w.mov)}</span></div>`;
  if(dark())h+=`<div class="sub" style="color:#2f2a3a;font-weight:900">🌑 Tiempos oscuros: más despidos, más miedo… y más gente en la calle.</div>`;
  const G=GOVS[w.gov];h+=`<div class="kv"><span>${G.e} ${G.n}</span><span style="font-size:11px;text-align:right;max-width:58%">${G.fx}</span></div>`;
  if(!w.era)h+=`<div class="kv"><span>🗳️ Próximas elecciones</span><span>día ${w.elec}${p.cand?' · va en las listas':''}</span></div>`;
  if(w.manif)h+=`<div class="kv"><span>📣 Manifestación</span><span>${w.manif.cause} · ${WDL[dateOf(w.manif.day).wd].toLowerCase()}</span></div>`;
  if(w.gsDay)h+=`<div class="kv"><span>🪧 Huelga general</span><span>${WDL[dateOf(w.gsDay).wd].toLowerCase()} ${dateOf(w.gsDay).dm}</span></div>`;
  if(w.rev)h+=`<div class="sub" style="color:var(--bad);font-weight:900">🚩 Huelga general indefinida: día ${w.rev.total+1}.</div>`;
  if(S.rentStrike)h+=`<div class="kv"><span>🏘️ Huelga de alquileres</span><span>en marcha</span></div>`;
  if(S.record)h+=`<div class="kv"><span>🚔 Antecedentes</span><span>cuesta más encontrar trabajo</span></div>`;
  return h;
}
function trackBlock(){
  let h=`<h3>${TR().e} Profesión: ${TR().n}</h3><div class="sub" style="font-size:12px">${TR().d}</div>`;
  h+=`<div class="kv"><span>Horario</span><span>${TR().days.map(d=>WDS[d]).join(' ')} · ${SHIFT.start}:00–${SHIFT.end===24?'00':SHIFT.end}:00</span></div>`;
  if(!S.jobless&&S.office)h+=`<div class="kv"><span>Dónde</span><span>${S.office.n}</span></div>`;
  if(S.seek)h+=`<div class="sub" style="color:#2f8a5a">🔎 Buscando trabajo de ${TRACKS[S.seek].n.toLowerCase()}… <button class="mini" id="seekno">dejarlo</button></div>`;
  h+=`<details class="tracks"><summary>🔄 Cambiar de profesión</summary>`;
  for(const k of TRK_ORDER){const T0=TRACKS[k],m=entryMissing(k);if(k===S.track&&!S.jobless)continue;
    h+=`<div class="outrow"><span class="oe">${T0.e}</span><span class="ot"><b>${T0.n}</b><small>${T0.levels[0].t} · ${fmt(Math.round(T0.levels[0].pay*Dm().pay))}/turno${m.length?' · falta: '+m.join(', '):''}</small></span><button class="mini" data-seek="${k}" ${m.length?'disabled style="opacity:.45"':''}>${T0.self?'Abrir':'Buscar'}</button></div>`;}
  h+=`</details>`;
  h+=`<div class="kv"><span>📚 Oposiciones</span><span>${S.oposPassed?'aprobadas ✅':S.opos&&S.opos.on?`${Math.round(S.opos.h)} h · examen día ${S.opos.exam}`:'no'}</span></div>`;
  if(!S.oposPassed)h+=`<button class="btn grey" id="oposb">${S.opos&&S.opos.on?'Dejar de estudiar oposiciones':'📚 Prepararse oposiciones'}</button>`;
  if(!S.jobless)h+=`<button class="btn grey" id="quitb">🚪 Dejar el trabajo</button>`;
  return h;
}
function bindSociety(){
  const q=s=>card.querySelector(s),on=(s,f)=>{const e=q(s);if(e)e.onclick=f;};
  card.querySelectorAll('[data-out]').forEach(b=>b.onclick=()=>{const k=b.dataset.out;if(outAvail(k))return;menu.classList.remove('open');doOut(k);});
  on('#ujoin',()=>{joinUnion();openMenu();});on('#uleave',()=>{leaveUnion();openMenu();});on('#ustrike',()=>{if(strikeReady()){callStrike(false);openMenu();}});
  card.querySelectorAll('[data-seek]').forEach(b=>b.onclick=()=>{const k=b.dataset.seek;if(entryMissing(k).length)return;S.seek=k;if(TRACKS[k].self||TRACKS[k].opos||k==='coop')seekTick();else toast(`🔎 Ana busca trabajo de ${TRACKS[k].n.toLowerCase()}`);openMenu();});
  on('#seekno',()=>{S.seek=null;openMenu();});
  on('#oposb',()=>{S.opos=S.opos||{on:false,h:0};S.opos.on=!S.opos.on;if(S.opos.on&&!S.opos.exam)S.opos.exam=S.day+90;openMenu();});
  on('#quitb',()=>{if(confirmQuit!==S.day){confirmQuit=S.day;toast('Toca otra vez para dejar el trabajo (sin paro)');return;}quitJob();openMenu();});
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
