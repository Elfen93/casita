// ---------- presión ideológica ----------
function pushI(k,amt,why){if(!IDEOS[k]||!amt)return;const c=ex();c.drift[k]=(c.drift[k]||0)+amt;if(why&&amt>0){c.why[k]=c.why[k]||{};c.why[k][why]=(c.why[k][why]||0)+amt;}}
const LEANL=()=>isI('anarquista')?'anarquista':isI('marxista')?'marxista':isI('ecologista')?'ecologista':isI('socialdemocrata')?'socialdemocrata':Math.random()<.5?'socialdemocrata':'marxista';
const LEANR=()=>isI('libertaria')?'libertaria':isI('conservadora')?'conservadora':'liberal';
const SHIFT_TXT=DATA.ideologias.cambio;
const WHYTXT=DATA.ideologias.motivos;
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
  if(S.ideo!=='apolitica'&&S.pol){if(comp()<3&&c.exp.win>=2&&(T('lider')||T('combativa'))&&Math.random()<.15){S.pol.comp=comp()+1;tell(huecos(TXN.ideologia.paso_mas,{comp:L(COMP[S.pol.comp]).toLowerCase()}),ID().e);}
    else if(comp()>1&&c.exp.stress>=4&&!T('combativa')&&Math.random()<.2){S.pol.comp=comp()-1;tell(huecos(TXN.ideologia.retirada,{comp:L(COMP[S.pol.comp]).toLowerCase()}),'🪫');}}
}
function topWhy(k){const w=ex().why[k]||{};const e=Object.entries(w).sort((a,b)=>b[1]-a[1])[0];return e?WHYTXT[e[0]]||e[0]:'la vida';}
function changeIdeo(to){const from=S.ideo||'apolitica';const dir=from==='apolitica'?'A>':to==='apolitica'?'>A':isLeft(from)&&isRight(to)?'L>R':isRight(from)&&isLeft(to)?'R>L':isLeft(from)?'L>L':'R>R';
  chapter('ideo_'+S.day,huecos(TXN.ideologia.cambio_t,{de:IDEOS[from].e,a:IDEOS[to].e}),huecos(TXN.ideologia.cambio,{why:topWhy(to),r:pickR(SHIFT_TXT[dir]),de:IDEOS[from].n.toLowerCase(),a:IDEOS[to].n.toLowerCase()}));
  S.ideo=to;S.pol.xp=Math.round((S.pol.xp||0)*.3);S.pol.comp=to==='apolitica'?1:Math.max(1,comp()-1);const c=ex();c.drift[from]=(c.drift[from]||0)*.3;c.drift[to]=0;c.why[to]={};
  for(const p of S.people||[])if(p.ideo){if(p.ideo===to)p.rel=Math.min(100,p.rel+6);else if(p.ideo===from&&from!=='apolitica'){p.rel=Math.max(0,p.rel-8);if(closeTo(p)>50)remember(huecos(TXN.ideologia.no_entiende,{p:p.n}));}}
  if(isRight(to)&&S.union&&S.union.member&&Math.random()<.5)leaveUnion();}

