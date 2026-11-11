// ---------- sindicato y huelga ----------
function joinUnion(){if(TR().self){toast('Con negocio propio no hay sindicato que valga');return;}S.union={member:true,since:S.day};chapter('union','El carné',`${CH().name} se ha afiliado al sindicato. Paga su cuota cada mes; a cambio, ya no está sola si vienen mal dadas.`);}
function leaveUnion(){if(S.union)S.union.member=false;tell(`${CH().name} se ha dado de baja del sindicato.`,'✂️');}
const unionFee=()=>Math.round(12*PM());
function grieve(n){if(!S.jobless&&S.office)S.office.griev=Math.min(100,(S.office.griev||0)+n);}
function strikeReady(){const o=office();return !S.jobless&&!TR().self&&!TR().coop&&S.union&&S.union.member&&o.org>=50&&(o.griev||0)>=35&&!(S.strike&&S.strike.on);}
function callStrike(byOthers){
  const o=office();const days=2+(Math.random()*4|0);const join=byOthers?Math.random()<ID().strike:true;
  S.strike={on:true,left:days,total:days,join,by:byOthers?'plantilla':'ana',start:S.day,picket:0};
  if(byOthers){tell(`La plantilla de ${o.n} ha convocado huelga (${days} días). ${join?`${CH().name} la secunda.`:`${CH().name} no piensa hacerla: irá a trabajar.`}`,'🪧');toast(`🪧 Huelga en ${o.n}${join?'':' · Ana irá a trabajar'}`,true);}
  else{chapter('huelga1','La huelga',`${CH().name} y sus compañeras han convocado huelga en ${o.n}. ${days} días de paro. Nadie sabe cómo acabará.`);toast(`🪧 ¡Huelga en ${o.n}! ${days} días`,true);}
}
function strikeDay(){ // cada día laborable de huelga
  const st=S.strike;if(!st||!st.on)return;if(dayType(S.day)!=='work'&&dayType(S.day)!=='fest')return;
  if(st.join){const caja=S.union&&S.union.member&&S.day-S.union.since>=30?Math.round(salary()*0.4):0;if(caja){S.money+=caja;}}
  else{S.rep=Math.min(100,(S.rep??70)+3);const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-12);}
  st.left--;if(st.left>0)return;st.on=false;
  const o=office();const p=Math.min(.85,0.2+o.org*0.006+(o.griev||0)*0.003+(st.picket||0)*0.03+S.pol.inf*0.002-TOX()*0.2+(W_().gov==='progresista'?0.08:W_().gov==='austeridad'?-0.08:0)+(Dm().soul?-0.05:0.1));
  if(Math.random()<p){const k=1.05+Math.random()*0.1;S.payMul=(S.payMul||1)*k;o.tox=Math.max(0.05,o.tox-0.15);o.griev=5;o.org=Math.min(100,o.org+10);S.pol.inf+=st.join?8:0;S.pol.xp+=st.join?6:0;S.noOvertime=S.day+90;
    if(st.join)chapter('huelgaW','Ganamos',`Después de ${st.total} días de huelga, la empresa ha cedido: +${Math.round((k-1)*100)} % de sueldo, se acaban las horas extra sin pagar y el encargado ya no grita. ${isI('marxista','anarquista')?'Nadie les regaló nada: lo arrancaron.':'Ha merecido la pena.'}`);
    else tell(`La huelga ha triunfado: +${Math.round((k-1)*100)} % para toda la plantilla, también para ${CH().name}, que no la hizo. Sus compañeras no se lo olvidan.`,'🪧');
    toast(`✊ ¡Huelga ganada! Sueldo +${Math.round((k-1)*100)} %`,true);if(!S.pol.coopOK&&isI('anarquista','marxista')&&Math.random()<.4)S.pol.coopOK=true;}
  else{o.griev=Math.max(0,o.griev-15);o.org=Math.max(0,o.org-20);
    if(st.join){S.rep=Math.max(0,(S.rep??70)-10);tell(`La huelga ha fracasado. La empresa no cede y ahora hay listas negras.`,'🥀');
      if(Math.random()<0.25+TOX()*0.35&&!(S.pol.delegada)){S.jobless=true;S.paroWeeks=S.shifts>=30?12:6;tell(`Represalia: han despedido a ${CH().name} por «bajo rendimiento». ${S.union&&S.union.member?'El sindicato lleva el caso al juzgado.':''}`,'📦');if(S.union&&S.union.member){S.court=S.day+20+(Math.random()*20|0);}}}
    else tell(`La huelga ha fracasado. ${CH().name} sigue en su puesto; en el trabajo, el ambiente está peor que nunca.`,'🥀');}
  S.strike=null;
}
function courtTick(){if(!S.court||S.day<S.court)return;S.court=null;const p=0.45+(W_().gov==='progresista'?0.15:0)-(W_().gov==='liberal'?0.1:0);
  if(Math.random()<p){const back=Math.round(salary()*15);S.money+=back;bumpMoney();if(S.jobless){S.jobless=false;S.paroWeeks=0;}chapter('juicio','Despido nulo',`El juzgado ha declarado nulo el despido: represalia sindical. ${CH().name} vuelve a su puesto y cobra ${fmt(back)} de salarios atrasados.`);}
  else{const ind=Math.round(salary()*8);S.money+=ind;tell(`El juez da el despido por improcedente: no la readmiten, pero cobra ${fmt(ind)} de indemnización.`.replace('la readmiten',ga('la readmiten','lo readmiten','le readmiten')),'⚖️');}}
function unionWeekly(){
  if(S.jobless||!S.office||TR().self)return;const o=office(),I=ID();
  o.griev=Math.max(0,(o.griev||0)-3+TOX()*3);
  if(S.union&&S.union.member)o.org=Math.max(0,o.org-0.8);else o.org=Math.max(0,o.org-0.4);
  // las compañeras también se organizan por su cuenta cuando aprieta
  if(Dm().soul||o.griev>50)o.org=Math.min(100,o.org+Math.random()*1.5*TR().org*(W_().mov/50+0.3));
  // afiliarse
  if(!(S.union&&S.union.member)&&S.autoHome&&Math.random()<I.union*0.25*(o.griev>30?1.6:1))joinUnion();
  // huelga
  if(strikeReady()&&Math.random()<I.strike*0.35)callStrike(false);
  else if(!(S.strike&&S.strike.on)&&o.org>=70&&o.griev>=50&&!(S.union&&S.union.member)&&Math.random()<0.25)callStrike(true);
  // represalia por organizar en empresas tóxicas
  if(S.union&&S.union.member&&o.org>30&&!S.pol.delegada&&Math.random()<0.012*TOX()*(isI('marxista','anarquista')?1.6:1)*(Dm().soul?1.5:0.6)){S.rep=Math.max(0,(S.rep??70)-12);tell(`Su jefe sabe que está organizando a la plantilla. Ahora le tocan los peores turnos.`,'👁️');}
}

