// ---------- presión ideológica ----------
function pushI(k,amt,why){if(!IDEOS[k]||!amt)return;const c=ex();c.drift[k]=(c.drift[k]||0)+amt;if(why&&amt>0){c.why[k]=c.why[k]||{};c.why[k][why]=(c.why[k][why]||0)+amt;}}
const LEANL=()=>isI('anarquista')?'anarquista':isI('marxista')?'marxista':isI('ecologista')?'ecologista':isI('socialdemocrata')?'socialdemocrata':Math.random()<.5?'socialdemocrata':'marxista';
const LEANR=()=>isI('libertaria')?'libertaria':isI('conservadora')?'conservadora':'liberal';
const SHIFT_TXT={
  'L>R':['Ya no se reconoce en las asambleas. Le parecen gente que no ha tenido que pagar una hipoteca.','Dice que ha madurado. Sus antiguas compañeras dicen que se ha acomodado. Las dos cosas pueden ser verdad.'],
  'R>L':['Algo se rompió. Durante años creyó que el esfuerzo bastaba; ahora sabe quién se queda con lo que ella produce.','Ha descubierto que lo que le pasaba no era mala suerte: tenía nombre y apellidos.'],
  '>A':['Se ha quemado. Ni asambleas, ni debates, ni telediario: ahora solo quiere paz.','Ya no cree en nada de eso. Tantas reuniones para nada.'],
  'A>':['Por primera vez en su vida, la política le parece algo que va con ella.','Se acabó mirar hacia otro lado.'],
  'L>L':['Sigue en el mismo lado, pero ya no cree en el mismo camino.'],'R>R':['Sigue en el mismo lado, pero ya no cree en el mismo camino.']};
const WHYTXT={explotacion:'lo que ha visto en el trabajo',despido:'el despido',huelga:'la huelga',pobreza:'no llegar a fin de mes',dinero:'el dinero que ahora tiene',ascenso:'su nuevo puesto',
  pareja:'su pareja',amistades:'su gente',crisis:'la crisis',represion:'la represión',familia:'la familia',cansancio:'el cansancio',vivienda:'la vivienda',cuidados:'los cuidados',derrota:'las derrotas'};
function driftWeekly(){const c=ex(),cur=S.ideo||'apolitica';
  for(const k in c.drift)c.drift[k]*=.965;
  const w=W_(),cl=classOf();
  if(TOX()>.6&&!S.jobless)pushI(isRight()?'socialdemocrata':LEANL(),1.6*TOX(),'explotacion');
  if(S.money<0){c.exp.poor++;pushI(isRight()?(Math.random()<.5?'socialdemocrata':'apolitica'):LEANL(),2.4,'pobreza');}else c.exp.poor=Math.max(0,c.exp.poor-1);
  const rich=S.money>weeklyRent()*25;if(rich){c.exp.rich++;pushI(isI('conservadora')?'conservadora':S.pol.invest==='cripto'?'libertaria':'liberal',1.8,'dinero');}
  if(cl==='mando'||cl==='patrona'||cl==='rentista')pushI(isI('conservadora')?'conservadora':'liberal',2.6,'ascenso');
  if(w.crisis>55){if(isLeft())pushI(LEANL(),1.5,'crisis');else if(isRight())pushI(Math.random()<.5?'conservadora':'libertaria',1.5,'crisis');else pushI(Math.random()<.5?LEANL():'conservadora',1.2,'crisis');}
  if(w.era==='represion'&&isLeft()){if(T('resiliente')||T('combativa'))pushI('anarquista',2,'represion');else pushI('apolitica',2.5,'represion');}
  if((S.kids||[]).length)pushI(Math.random()<.5?'conservadora':'socialdemocrata',.7,'familia');
  // la gente cercana tira de ella
  for(const p of S.people||[]){if(!p.ideo||p.stage==='ex')continue;const cl2=closeTo(p);if(cl2<55)continue;const k=isPartner(p)?2.6:1.1;pushI(p.ideo,k*cl2/100,isPartner(p)?'pareja':'amistades');}
  // quemarse
  if(comp()===3&&c.exp.stress>=3&&!T('combativa'))pushI('apolitica',2,'cansancio');
  // el compromiso pesa: cuanto más militante, más cuesta cambiar
  const hold=95+(S.pol.xp||0)*.8+(comp()-1)*25+(c.drift[cur]||0);
  let best=null,bv=0;for(const k in c.drift){if(k===cur)continue;if(c.drift[k]>bv){bv=c.drift[k];best=k;}}
  if(best&&bv>hold&&!c.dlg&&!c.dq.some(d=>d.id==='ideo'))askDilemma('ideo',{to:best});
  // compromiso: sube con las victorias, baja con el agotamiento
  if(S.ideo!=='apolitica'&&S.pol){if(comp()<3&&c.exp.win>=2&&(T('lider')||T('combativa'))&&Math.random()<.15){S.pol.comp=comp()+1;tell(`Ana ha dado un paso más: ahora es ${L(COMP[S.pol.comp]).toLowerCase()}. Las victorias enganchan.`,ID().e);}
    else if(comp()>1&&c.exp.stress>=4&&!T('combativa')&&Math.random()<.2){S.pol.comp=comp()-1;tell(`Ana se ha retirado un poco: ya no llega a todo. Ahora es ${L(COMP[S.pol.comp]).toLowerCase()}.`,'🪫');}}
}
function topWhy(k){const w=ex().why[k]||{};const e=Object.entries(w).sort((a,b)=>b[1]-a[1])[0];return e?WHYTXT[e[0]]||e[0]:'la vida';}
function changeIdeo(to){const from=S.ideo||'apolitica';const dir=from==='apolitica'?'A>':to==='apolitica'?'>A':isLeft(from)&&isRight(to)?'L>R':isRight(from)&&isLeft(to)?'R>L':isLeft(from)?'L>L':'R>R';
  chapter('ideo_'+S.day,`${IDEOS[from].e} → ${IDEOS[to].e} Ya no es la misma`,`Ha sido ${topWhy(to)}. ${pickR(SHIFT_TXT[dir])} Antes se decía ${IDEOS[from].n.toLowerCase()}; ahora, ${IDEOS[to].n.toLowerCase()}.`);
  S.ideo=to;S.pol.xp=Math.round((S.pol.xp||0)*.3);S.pol.comp=to==='apolitica'?1:Math.max(1,comp()-1);const c=ex();c.drift[from]=(c.drift[from]||0)*.3;c.drift[to]=0;c.why[to]={};
  for(const p of S.people||[])if(p.ideo){if(p.ideo===to)p.rel=Math.min(100,p.rel+6);else if(p.ideo===from&&from!=='apolitica'){p.rel=Math.max(0,p.rel-8);if(closeTo(p)>50)remember(`${p.n} no entiende el cambio de Ana.`);}}
  if(isRight(to)&&S.union&&S.union.member&&Math.random()<.5)leaveUnion();}

