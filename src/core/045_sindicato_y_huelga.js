// ---------- sindicato y huelga ----------
function joinUnion(){if(TR().self){toast(TXN.sindicato.sin_sindicato);return;}S.union={member:true,since:S.day};chapter('union',TXN.sindicato.afiliacion_titulo,huecos(TXN.sindicato.afiliacion,{n:CH().name}));}
function leaveUnion(){if(S.union)S.union.member=false;tell(huecos(TXN.sindicato.baja,{n:CH().name}),'✂️');}
const unionFee=()=>Math.round(12*PM());
function grieve(n){if(!S.jobless&&S.office)S.office.griev=Math.min(100,(S.office.griev||0)+n);}
function strikeReady(){const o=office();return !S.jobless&&!TR().self&&!TR().coop&&S.union&&S.union.member&&o.org>=50&&(o.griev||0)>=35&&!(S.strike&&S.strike.on);}
function callStrike(byOthers){
  const o=office();const days=2+(Math.random()*4|0);const join=byOthers?Math.random()<ID().strike:true;
  S.strike={on:true,left:days,total:days,join,by:byOthers?'plantilla':'ana',start:S.day,picket:0};
  if(byOthers){tell(huecos(TXN.sindicato.convoca,{empresa:o.n,dias:days,postura:join?huecos(TXN.sindicato.convoca_secunda,{n:CH().name}):huecos(TXN.sindicato.convoca_no,{n:CH().name})}),'🪧');toast(huecos(TXN.sindicato.convoca_aviso,{empresa:o.n,nota:join?'':TXN.sindicato.huelga_nota}),true);}
  else{chapter('huelga1',TXN.sindicato.huelga_titulo,huecos(TXN.sindicato.huelga_convocada,{n:CH().name,empresa:o.n,dias:days}));toast(huecos(TXN.sindicato.huelga_aviso,{empresa:o.n,dias:days}),true);}
}
function strikeDay(){ // cada día laborable de huelga
  const st=S.strike;if(!st||!st.on)return;if(dayType(S.day)!=='work'&&dayType(S.day)!=='fest')return;
  if(st.join){const caja=S.union&&S.union.member&&S.day-S.union.since>=30?Math.round(salary()*0.4):0;if(caja){S.money+=caja;}}
  else{S.rep=Math.min(100,(S.rep??70)+3);const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-12);}
  st.left--;if(st.left>0)return;st.on=false;
  const o=office();const p=Math.min(.85,0.2+o.org*0.006+(o.griev||0)*0.003+(st.picket||0)*0.03+S.pol.inf*0.002-TOX()*0.2+(W_().gov==='progresista'?0.08:W_().gov==='austeridad'?-0.08:0)+(Dm().soul?-0.05:0.1));
  if(Math.random()<p){const k=1.05+Math.random()*0.1;S.payMul=(S.payMul||1)*k;o.tox=Math.max(0.05,o.tox-0.15);o.griev=5;o.org=Math.min(100,o.org+10);S.pol.inf+=st.join?8:0;S.pol.xp+=st.join?6:0;S.noOvertime=S.day+90;
    if(st.join)chapter('huelgaW','Ganamos',huecos(TXN.sindicato.ganamos,{total:st.total,pct:Math.round((k-1)*100),cierre:isI('marxista','anarquista')?TXN.sindicato.ganamos_lucha:TXN.sindicato.ganamos_merece}));
    else tell(huecos(TXN.sindicato.triunfa_todos,{pct:Math.round((k-1)*100),n:CH().name}),'🪧');
    toast(huecos(TXN.sindicato.ganada,{pct:Math.round((k-1)*100)}),true);if(!S.pol.coopOK&&isI('anarquista','marxista')&&Math.random()<.4)S.pol.coopOK=true;}
  else{o.griev=Math.max(0,o.griev-15);o.org=Math.max(0,o.org-20);
    if(st.join){S.rep=Math.max(0,(S.rep??70)-10);tell(TXN.sindicato.fracasa,'🥀');
      if(Math.random()<0.25+TOX()*0.35&&!(S.pol.delegada)){S.jobless=true;S.paroWeeks=S.shifts>=30?12:6;tell(huecos(TXN.sindicato.represalia,{n:CH().name,juzgado:S.union&&S.union.member?TXN.sindicato.represalia_juzgado:''}),'📦');if(S.union&&S.union.member){S.court=S.day+20+(Math.random()*20|0);}}}
    else tell(huecos(TXN.sindicato.fracasa_sigue,{n:CH().name}),'🥀');}
  S.strike=null;
}
function courtTick(){if(!S.court||S.day<S.court)return;S.court=null;const p=0.45+(W_().gov==='progresista'?0.15:0)-(W_().gov==='liberal'?0.1:0);
  if(Math.random()<p){const back=Math.round(salary()*15);S.money+=back;bumpMoney();if(S.jobless){S.jobless=false;S.paroWeeks=0;}chapter('juicio',TXN.sindicato.juicio_titulo,huecos(TXN.sindicato.juicio_nulo,{n:CH().name,pago:fmt(back)}));}
  else{const ind=Math.round(salary()*8);S.money+=ind;tell(huecos(TXN.sindicato.juicio_improcedente,{la:ga('la','lo','le'),pago:fmt(ind)}),'⚖️');}}
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
  if(S.union&&S.union.member&&o.org>30&&!S.pol.delegada&&Math.random()<0.012*TOX()*(isI('marxista','anarquista')?1.6:1)*(Dm().soul?1.5:0.6)){S.rep=Math.max(0,(S.rep??70)-12);tell(TXN.sindicato.jefe_sabe,'👁️');}
}

