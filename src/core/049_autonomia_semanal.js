// ---------- autonomía semanal ----------
function socialWeekly(){
  const L=LIFE(),pt=partner(),c=CH();
  // relaciones que se enfrían o se calientan
  for(const p of S.people||[]){if(p.stage==='ex')continue;const seen=S.day-(p.last||p.metDay||0);
    if(['cita','rollo','pareja','convive','casada'].includes(p.stage)){let d=-1.5+(seen<7?2:0)+(p.stage==='convive'||p.stage==='casada'?1.5:0);
      if(S.money<0)d-=2;const cmp=compatOf(p);d+=(cmp-50)/25;if(L.kids!=='quiza'&&p.kids!=='quiza'&&L.kids!==p.kids&&(p.stage==='convive'||p.stage==='casada'))d-=2;
      if(isI('marxista','anarquista')&&comp()===3&&p.ideo==='apolitica')d-=1;
      p.love=Math.max(0,Math.min(100,p.love+d));
      if(d<-2&&Math.random()<.35)tell(huecos(pickR(TXN.acciones_semana.discusion),{p:p.n,c:c.name}),'😤');
      if(p.love<18&&p.stage!=='cita'){breakUp(p,pickR(TXN.acciones_semana.ruptura_motivo));continue;}
      if(p.stage==='cita'&&p.love<10){setStage(p,'amiga');tell(huecos(TXN.acciones_semana.no_cuajo,{p:p.n}),'🤷');}}}
  if(!S.autoHome)return;
  // buscar pareja o rollo según lo que quiere
  if(L.orient!=='nadie'&&L.rel!=='soltera'&&!pt){const cands=(S.people||[]).filter(p=>canLove(p)&&['conocida','amiga','cita','rollo'].includes(p.stage));
    if(!cands.length&&Math.random()<.45)datingApp(true);
    else{const best=cands.sort((a,b)=>(b.love+b.rel*.5+compatOf(b))-(a.love+a.rel*.5+compatOf(a)))[0];
      if(best&&['conocida','amiga'].includes(best.stage)&&best.rel>25&&Math.random()<.35)flirt(best);
      else if(best&&best.stage==='cita'&&L.rel==='estable'&&best.love>=65&&(!(best.refused>=2)||best.love>90)&&Math.random()<.5)askOut(best);}}
  {const dd=(S.people||[]).filter(p=>['cita','rollo','pareja'].includes(p.stage)&&S.day-(p.last||0)>=3).sort((a,b)=>b.love-a.love)[0];if(dd&&!S.pendingDate)S.pendingDate=dd.k;}
  if(pt){const daysT=S.day-(pt.stageDay||0);
    if(pt.stage==='pareja'&&L.rel==='estable'&&pt.love>=72&&daysT>=20&&Math.random()<.3)moveIn(pt);
    else if(pt.stage==='convive'&&L.boda!=='no'&&pt.boda!=='no'&&(L.boda==='si'||pt.boda==='si')&&pt.love>=80&&daysT>=40&&Math.random()<.25){const k=S.money>1600*PM()*1.5?'grande':S.money>350*PM()*1.5?'sencilla':'hecho';wedding(pt,k);}
    if(['convive','casada'].includes(pt.stage)&&!S.baby&&(S.kids||[]).length<2&&(L.kids==='si'||(L.kids==='quiza'&&Math.random()<.3))&&pt.kids!=='no'&&pt.love>=70&&daysT>=25&&Math.random()<.2)tryBaby(pt);}
  else if(L.kids==='si'&&!S.baby&&!(S.kids||[]).length&&(CH().age||27)>=36&&L.rel!=='libre'&&Math.random()<.06)tryBaby(null);
  // gastos de los críos
  const kids=S.kids||[];if(kids.length){const cost=Math.round(kids.reduce((a,k)=>a+(kidAge(k)<1?30:22),0)*PM()*(liveIn()?0.5:1)+(dayType(S.day)==='work'&&!onLeave()&&!S.jobless?kids.filter(k=>kidAge(k)<3).length*Math.round(28*PM()):0));S.money-=cost;if(Math.random()<.4)tell(huecos(TXN.acciones_semana.gasto_hijos,{coste:fmt(cost)}),'🍼');}
}
// cuando la pareja vive en casa, paga la mitad
function partnerShare(amount){const p=liveIn();return p?Math.round(amount*0.5):0;}
function socialDaily(){
  if(S.baby&&S.day>=S.baby.due)babyBorn();
  if(S.baby&&S.baby.mode==='ana'){S.needs.energia=Math.max(0,S.needs.energia-6);}
  for(const k of S.kids||[]){const a=kidAge(k);if(a>0&&(S.day-k.born)%60===0)tell(huecos(TXN.acciones_semana.cumple,{n:k.n,a,s:a>1?'s':'',frase:a===1?TXN.acciones_semana.cumple_1:a===2?TXN.acciones_semana.cumple_2:a===3?TXN.acciones_semana.cumple_3:TXN.acciones_semana.cumple_mas}),'🎂');}
  if((S.kids||[]).some(k=>kidAge(k)<1)&&Math.random()<.5){S.needs.energia=Math.max(5,S.needs.energia-12);}
  // visitas que acaban
  S.res=(S.res||[]).filter(r=>!(r.kind==='guest'&&r.until<S.day*1440+S.t));
}
// app de citas
function datingApp(auto){const L=LIFE();if(L.orient==='nadie'){toast(TXN.acciones_semana.citas_nadie);return;}const n=1+(Math.random()<.5?1:0);const ps=[];for(let i=0;i<n;i++)ps.push(newPerson(TXN.acciones_semana.donde_app,true));
  tell(huecos(TXN.acciones_semana.app_citas,{n:CH().name,ps:ps.map(p=>p.n+' ('+roleTxt(p)+')').join(' y '),r:pickR([...TXN.acciones_semana.app_citas_r,huecos(TXN.acciones_semana.app_citas_parece,{m:ps[0].g==='m'?'majo':ps[0].g==='f'?'maja':'maje'})])}),'📱');if(!auto)toast(huecos(TXN.acciones_semana.app_match,{k:ps.length,s:ps.length>1?'s':''}));return ps;}
// conocer gente al salir
function maybeMeet(k){const where=TXN.acciones_semana.donde[k];if(!where)return;
  if(Math.random()>.18)return;const L=LIFE();const rom=L.orient!=='nadie'&&L.rel!=='soltera'&&!partner()&&Math.random()<.6;const p=newPerson(where,rom);
  if(['militancia','manifestacion','sindicato'].includes(k)&&S.ideo!=='apolitica'&&(!p.ideo||p.ideo==='apolitica')&&Math.random()<.3)p.ideo=S.ideo;p.rel+=10;
  tell(huecos(TXN.acciones_semana.conoce,{donde:where,p:p.n,rol:roleTxt(p),miradas:rom&&canLove(p)?TXN.acciones_semana.conoce_miradas:''}),'👋');}
