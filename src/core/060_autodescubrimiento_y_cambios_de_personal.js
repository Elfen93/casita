// ---------- autodescubrimiento y cambios de personalidad ----------
function selfWeekly(){const c=ex(),L=latentOf();const md=mood();
  if(md<35||S.money<0||TOX()>.7)c.exp.stress++;else c.exp.stress=Math.max(0,c.exp.stress-1);
  for(const k of [...L.hidden]){const D=LAT[k];if(D.rev()&&Math.random()<.35){L.hidden=L.hidden.filter(x=>x!==k);L.rev.push(k);S.traits=S.traits||[];if(!S.traits.includes(k))S.traits.push(k);chapter('yo_'+k,`${D.e} ${D.n}`,huecos(TXN.autodescubrimiento.faceta,{txt:D.txt}));}}
  const add=(k,txt,rm)=>{if(T(k))return;S.traits.push(k);if(rm)S.traits=S.traits.filter(x=>x!==rm);chapter('cambio_'+k,huecos(TXN.autodescubrimiento.ha_cambiado,{e:TRAITS[k].e}),txt);};
  if(c.exp.stress>=6&&!T('combativa'))add('cinica',TXN.autodescubrimiento.cambio_cinica);
  if(c.exp.solid>=5)add('solidaria',TXN.autodescubrimiento.cambio_solidaria,'cinica');
  if(c.exp.betray>=2)add('desconfiada',TXN.autodescubrimiento.cambio_desconfiada);
  if(c.exp.win>=2)add('combativa',TXN.autodescubrimiento.cambio_combativa,'cinica');
  if(c.exp.poor>=8&&!T('ahorradora'))add('ahorradora',TXN.autodescubrimiento.cambio_ahorradora,'derrochadora');
  if(c.exp.rich>=14&&T('ahorradora')&&Math.random()<.2)add('derrochadora',TXN.autodescubrimiento.cambio_derrochadora,'ahorradora');
}
// los rasgos nuevos tocan el resto de sistemas
function traitEffectsWeekly(){
  if(T('lider')&&S.pol)S.pol.inf=Math.min(100,(S.pol.inf||0)+.6);
  if(T('solidaria'))for(const p of S.people||[])if(p.stage!=='ex'&&closeTo(p)>40)p.rel=Math.min(100,p.rel+.8);
  if(T('cinica')){S.needs.diversion=Math.max(0,S.needs.diversion-4);}
  if(T('combativa')&&S.office)S.office.org=Math.min(100,S.office.org+.6);
  if(T('genio')&&!S.jobless&&Math.random()<.08){if(Math.random()<.5){S.payMul=(S.payMul||1)*1.03;tell(TXN.autodescubrimiento.plus,'🌋');}else{S.rep=Math.max(0,(S.rep??70)-8);tell(TXN.autodescubrimiento.expediente,'🌋');}}
}

