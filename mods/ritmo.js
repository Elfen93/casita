// =================== RITMO REAL DE LA POLÍTICA: la influencia se gana en años, no en semanas ===================
// La influencia y la experiencia política suben más despacio, y tienen un techo según el tiempo que se lleva militando y la edad.
{const _dl=dailyEvents;dailyEvents=function(){const p=S.pol||{};const i0=p.inf||0,x0=p.xp||0;const r=_dl.apply(this,arguments);try{const P=S.pol;if(!P)return r;const R=S.ritmo=S.ritmo||{};
  if(R.start==null&&((P.inf||0)>0||(P.xp||0)>0||(S.union&&S.union.member)))R.start=S.day;
  const di=(P.inf||0)-i0,dx=(P.xp||0)-x0;if(di>0)P.inf=i0+di*.3;if(dx>0)P.xp=x0+dx*.45;
  const yrs=R.start==null?0:(S.day-R.start)/365;const age=(S.char&&S.char.age)||30;
  const cap=Math.min(100,12+yrs*22-(age<23?8:0));if(P.inf>cap)P.inf=cap;}catch(e){}return r;};}
