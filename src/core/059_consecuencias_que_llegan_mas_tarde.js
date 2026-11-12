// ---------- consecuencias que llegan más tarde ----------
const CQT=DATA.sucesos.nucleo_consecuencias;
const CQ={
  vacio:()=>{const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-15);ex().exp.stress++;tell(CQT.vacio.tell,'🥶');remember(CQT.vacio.rem);},
  represalia:()=>{if(S.jobless)return;if(Math.random()<.5+TOX()*.3){S.career=Math.max(0,S.career-1);tell(huecos(CQT.represalia.baja,{a:ga('la','lo','le'),c:L(CAREER[S.career].t).toLowerCase()}),'📉');ex().exp.loss++;pushI(LEANL(),25,'despido');}else tell(CQT.represalia.no,'🛡️');},
  filtracion:()=>{if(S.jobless)return;if(Math.random()<.35){S.jobless=true;S.paroWeeks=6;S.ally=false;tell(CQT.filtracion.si,'📦');ex().exp.loss++;pushI(LEANL(),35,'despido');if(S.union&&S.union.member)S.court=S.day+20;}else{tell(CQT.filtracion.no,'🤫');ex().exp.win++;}},
  topo:()=>{if(!S.ally||S.jobless)return;if(Math.random()<.4){S.ally=false;S.career=Math.max(0,S.career-1);tell(CQT.topo.si,'🐀');ex().exp.betray++;}else{office().griev=Math.max(0,(office().griev||0)-10);tell(CQT.topo.no,'🛡️');ex().exp.win++;schedule(25+Math.random()*25,'topo',{});}},
  esquirol:()=>{const cp=P_('compi');if(cp){cp.rel=Math.max(0,cp.rel-20);(cp.hid||(cp.hid=[]));}ex().exp.stress++;tell(huecos(CQT.esquirol.tell,{esq:ga('Esquirola','Esquirol','Esquirol')}),'🐀');remember(CQT.esquirol.rem);},
  sindican:()=>{if(S.track!=='negocio')return;tell(CQT.sindican.tell,'📜');S.payMul=(S.payMul||1)*.9;},
  terapia:d=>{const p=P_(d.p);if(!p||p.stage==='ex')return;S.money-=d.cost;bumpMoney&&bumpMoney();p.wear=Math.max(0,(p.wear||0)-14);p.love=Math.min(100,p.love+3);if(Math.random()<.4)tell(huecos(pickR(CQT.terapia.tell),{p:p.n}),'🛋️');},
  silencio:d=>{const p=P_(d.p);if(!p||p.stage==='ex')return;p.wear=Math.min(100,(p.wear||0)+10);tell(huecos(CQT.silencio.tell,{p:p.n}),'🧊');},
  devolver:d=>{const p=P_(d.p);if(!p)return;if(S.money>=d.m*1.2){S.money-=d.m;bumpMoney&&bumpMoney();p.rel=Math.min(100,p.rel+5);tell(huecos(CQT.devolver.ok,{p:p.n,m:fmt(d.m)}),'🤝');}else{p.rel=Math.max(0,p.rel-20);p.wear=(p.wear||0)+15;tell(huecos(CQT.devolver.ko,{p:p.n}),'😶');schedule(21,'devolver',d);}},
  cuota:d=>{S.money-=d.m;bumpMoney&&bumpMoney();if(S.money<0)ex().exp.stress++;},
  arrepentimiento:()=>{if(comp()>1)return;if(W_().mov>40||W_().crisis>50){tell(CQT.arrepentimiento.tell,'🪟');pushI(S.ideo,20,'crisis');ex().exp.stress++;}},
  antecedentes:()=>{if(S.jobless&&Math.random()<.5)tell(CQT.antecedentes.tell,'🚔');}};
function cqDaily(){const c=ex();const due=c.cq.filter(q=>q.d<=S.day);c.cq=c.cq.filter(q=>q.d>S.day);for(const q of due){try{CQ[q.k]&&CQ[q.k](q.data);}catch(e){console.error(e);}}}

