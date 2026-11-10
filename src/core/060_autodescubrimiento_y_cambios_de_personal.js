// ---------- autodescubrimiento y cambios de personalidad ----------
function selfWeekly(){const c=ex(),L=latentOf();const md=mood();
  if(md<35||S.money<0||TOX()>.7)c.exp.stress++;else c.exp.stress=Math.max(0,c.exp.stress-1);
  for(const k of [...L.hidden]){const D=LAT[k];if(D.rev()&&Math.random()<.35){L.hidden=L.hidden.filter(x=>x!==k);L.rev.push(k);S.traits=S.traits||[];if(!S.traits.includes(k))S.traits.push(k);chapter('yo_'+k,`${D.e} ${D.n}`,`${D.txt} Ana no se conocía esa faceta.`);}}
  const add=(k,txt,rm)=>{if(T(k))return;S.traits.push(k);if(rm)S.traits=S.traits.filter(x=>x!==rm);chapter('cambio_'+k,`${TRAITS[k].e} Ha cambiado`,txt);};
  if(c.exp.stress>=6&&!T('combativa'))add('cinica','Algo se ha apagado. Ana ya no espera gran cosa de nadie, tampoco de sí misma.');
  if(c.exp.solid>=5)add('solidaria','Tantas veces ha estado para los demás que ahora sabe que los demás también estarán.','cinica');
  if(c.exp.betray>=2)add('desconfiada','Le han mentido demasiadas veces. Ahora tarda en confiar.');
  if(c.exp.win>=2)add('combativa','Ha ganado. Y quien gana una vez sabe que se puede.','cinica');
  if(c.exp.poor>=8&&!T('ahorradora'))add('ahorradora','Meses contando monedas le han enseñado a estirar cada euro.','derrochadora');
  if(c.exp.rich>=14&&T('ahorradora')&&Math.random()<.2)add('derrochadora','Ahora que le sobra, se da caprichos. Le sienta bien, aunque le dé un poco de vergüenza.','ahorradora');
}
// los rasgos nuevos tocan el resto de sistemas
function traitEffectsWeekly(){
  if(T('lider')&&S.pol)S.pol.inf=Math.min(100,(S.pol.inf||0)+.6);
  if(T('solidaria'))for(const p of S.people||[])if(p.stage!=='ex'&&closeTo(p)>40)p.rel=Math.min(100,p.rel+.8);
  if(T('cinica')){S.needs.diversion=Math.max(0,S.needs.diversion-4);}
  if(T('combativa')&&S.office)S.office.org=Math.min(100,S.office.org+.6);
  if(T('genio')&&!S.jobless&&Math.random()<.08){if(Math.random()<.5){S.payMul=(S.payMul||1)*1.03;tell('Ana se ha plantado en el despacho y ha conseguido el plus que le debían.','🌋');}else{S.rep=Math.max(0,(S.rep??70)-8);tell('Ana le ha contestado mal a la encargada. Expediente.','🌋');}}
}

