// ---------- autonomía semanal ----------
function socialWeekly(){
  const L=LIFE(),pt=partner(),c=CH();
  // relaciones que se enfrían o se calientan
  for(const p of S.people||[]){if(p.stage==='ex')continue;const seen=S.day-(p.last||p.metDay||0);
    if(['cita','rollo','pareja','convive','casada'].includes(p.stage)){let d=-1.5+(seen<7?2:0)+(p.stage==='convive'||p.stage==='casada'?1.5:0);
      if(S.money<0)d-=2;const cmp=compatOf(p);d+=(cmp-50)/25;if(L.kids!=='quiza'&&p.kids!=='quiza'&&L.kids!==p.kids&&(p.stage==='convive'||p.stage==='casada'))d-=2;
      if(isI('marxista','anarquista')&&comp()===3&&p.ideo==='apolitica')d-=1;
      p.love=Math.max(0,Math.min(100,p.love+d));
      if(d<-2&&Math.random()<.35)tell(pickR([`Discusión con ${p.n} por dinero. Otra vez.`,`${p.n} dice que ${c.name} nunca está en casa.`,`Bronca con ${p.n} por política en la cena.`,`${p.n} y ${c.name} llevan días sin hablarse bien.`]),'😤');
      if(p.love<18&&p.stage!=='cita'){breakUp(p,pickR(['ya no era lo mismo','demasiadas discusiones','querían cosas distintas']));continue;}
      if(p.stage==='cita'&&p.love<10){setStage(p,'amiga');tell(`Lo de ${p.n} no ha cuajado. Se quedan como amigos… o eso dicen.`,'🤷');}}}
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
  const kids=S.kids||[];if(kids.length){const cost=Math.round(kids.reduce((a,k)=>a+(kidAge(k)<1?30:22),0)*PM()*(liveIn()?0.5:1)+(dayType(S.day)==='work'&&!onLeave()&&!S.jobless?kids.filter(k=>kidAge(k)<3).length*Math.round(28*PM()):0));S.money-=cost;if(Math.random()<.4)tell(`Pañales, ropa que se queda pequeña y guardería: ${fmt(cost)} esta semana.`,'🍼');}
}
// cuando la pareja vive en casa, paga la mitad
function partnerShare(amount){const p=liveIn();return p?Math.round(amount*0.5):0;}
function socialDaily(){
  if(S.baby&&S.day>=S.baby.due)babyBorn();
  if(S.baby&&S.baby.mode==='ana'){S.needs.energia=Math.max(0,S.needs.energia-6);}
  for(const k of S.kids||[]){const a=kidAge(k);if(a>0&&(S.day-k.born)%60===0)tell(`🎂 ${k.n} cumple ${a} año${a>1?'s':''}. ${a===1?'Ya da sus primeros pasos.':a===2?'Ya dice «no» a todo.':a===3?'Empieza el cole.':'Crece demasiado rápido.'}`,'🎂');}
  if((S.kids||[]).some(k=>kidAge(k)<1)&&Math.random()<.5){S.needs.energia=Math.max(5,S.needs.energia-12);}
  // visitas que acaban
  S.res=(S.res||[]).filter(r=>!(r.kind==='guest'&&r.until<S.day*1440+S.t));
}
// app de citas
function datingApp(auto){const L=LIFE();if(L.orient==='nadie'){toast('A Ana no le interesan las citas');return;}const n=1+(Math.random()<.5?1:0);const ps=[];for(let i=0;i<n;i++)ps.push(newPerson('la app de citas',true));
  tell(`${CH().name} ha abierto la app de citas: ${ps.map(p=>p.n+' ('+roleTxt(p)+')').join(' y ')}. ${pickR(['Match.','Hay conversación.','Parece majo/a.'.replace('majo/a',ps[0].g==='m'?'majo':ps[0].g==='f'?'maja':'maje')])}`,'📱');if(!auto)toast(`📱 ${ps.length} match nuevo${ps.length>1?'s':''}`);return ps;}
// conocer gente al salir
function maybeMeet(k){const where={amigos:'unas cañas',militancia:'una reunión',networking:'un afterwork',sindicato:'la asamblea',voluntariado:'el voluntariado',deporte:'el parque',manifestacion:'la manifestación',biblioteca:'la biblioteca',misa:'la parroquia'}[k];if(!where)return;
  if(Math.random()>.18)return;const L=LIFE();const rom=L.orient!=='nadie'&&L.rel!=='soltera'&&!partner()&&Math.random()<.6;const p=newPerson(where,rom);
  if(['militancia','manifestacion','sindicato'].includes(k)&&S.ideo!=='apolitica'&&(!p.ideo||p.ideo==='apolitica')&&Math.random()<.3)p.ideo=S.ideo;p.rel+=10;
  tell(`En ${where} ha conocido a ${p.n}, ${roleTxt(p)}.${rom&&canLove(p)?' Hubo miradas.':''}`,'👋');}
