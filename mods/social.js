// =================== VIDA SOCIAL: amistades, amor, familia ===================
const ORIENT={hombres:'Hombres',mujeres:'Mujeres',ambos:'Hombres y mujeres',nadie:'Nadie (arromántica)'};
const RELSTYLE={estable:'Busca pareja estable',libre:'Relaciones libres',soltera:'Soltería feliz'};
const KIDSW={si:'Quiere hijos',quiza:'Ya se verá',no:'No quiere hijos'};
const BODAW={si:'Quiere casarse',igual:'Le da igual',no:'No cree en el matrimonio'};
const STAGE={conocida:'Conocida',amiga:'Amistad',cita:'Citas',rollo:'Amigos con derecho',pareja:'Pareja',convive:'Viven juntos',casada:'Casados',ex:'Ex'};
function defaultLife(g){const r=Math.random();return {orient:g==='f'?(r<.72?'hombres':r<.86?'mujeres':'ambos'):g==='m'?(r<.75?'mujeres':r<.88?'hombres':'ambos'):(r<.5?'ambos':r<.75?'mujeres':'hombres'),rel:pickR(['estable','estable','libre','soltera']),kids:pickR(['si','quiza','no']),boda:pickR(['si','igual','no'])};}
const LIFE=()=>S.life||(S.life=defaultLife(CH().g));
const likes=(orient,g)=>orient==='ambos'?g!=='x'||true:orient==='hombres'?g==='m':orient==='mujeres'?g==='f':false;
const LEFT=['marxista','anarquista','socialdemocrata','ecologista'],RIGHT=['liberal','libertaria','conservadora'];
function compatOf(p){let c=50;const a=S.ideo,b=p.ideo;if(a===b&&a!=='apolitica')c+=18;else if((LEFT.includes(a)&&RIGHT.includes(b))||(RIGHT.includes(a)&&LEFT.includes(b)))c-=16*(isI('marxista','anarquista','libertaria')?1.4:1);
  const L=LIFE();if(L.kids!=='quiza'&&p.kids!=='quiza')c+=L.kids===p.kids?10:-14;if(L.rel===p.relStyle)c+=8;return Math.max(5,Math.min(95,c+(p.spark||0)));}
const canLove=p=>p.adult!==false&&likes(LIFE().orient,p.g)&&likes(p.orient,CH().g);
let PID=1;
function newPerson(where,romantic){
  const L=LIFE();let g;
  if(romantic&&L.orient!=='nadie'){g=L.orient==='hombres'?'m':L.orient==='mujeres'?'f':pickR(['f','m']);}else g=pickR(['f','m','f','m','x']);
  const ch=randomChar();ch.g=g;ch.name=pickR(NAMES[g]);if(g==='f')ch.beard='no';ch.age=Math.max(19,Math.min(70,(CH().age||27)+Math.round((Math.random()-.5)*12)));
  const og=CH().g;const orient=romantic?(og==='f'?(g==='m'?pickR(['mujeres','mujeres','ambos']):pickR(['mujeres','ambos'])):og==='m'?(g==='f'?pickR(['hombres','hombres','ambos']):pickR(['hombres','ambos'])):'ambos'):pickR(['hombres','mujeres','ambos','mujeres','hombres']);
  const ideo=Math.random()<.35&&S.ideo?S.ideo:pickR(IDEO_ORDER);
  const p={k:'p'+(S.pid=(S.pid||100)+1),n:ch.name,g,ch,age:ch.age,ideo,orient,relStyle:pickR(['estable','estable','libre','soltera']),kids:pickR(['si','quiza','no']),boda:pickR(['si','igual','no']),
    job:pickR(['enfermera','profe','camarera','programadora','electricista','cajera','abogada','diseñadora','repartidora','bombera','funcionaria','fontanera']),rel:15+Math.random()*15,love:0,stage:'conocida',met:where,metDay:S.day,spark:Math.round((Math.random()-.5)*20),e:'🙂',r:'',mi:null};
  if(romantic){p.love=10+Math.random()*15;}
  p.r=`${roleTxt(p)}`;S.people.push(p);
  if(S.people.length>18){const drop=S.people.filter(q=>q.k.startsWith('p')&&!['pareja','convive','casada','rollo','cita'].includes(q.stage)).sort((a,b)=>a.rel-b.rel)[0];if(drop)S.people.splice(S.people.indexOf(drop),1);}
  return p;}
function roleTxt(p){const jobF={enfermera:['enfermera','enfermero'],profe:['profe','profe'],camarera:['camarera','camarero'],programadora:['programadora','programador'],electricista:['electricista','electricista'],cajera:['cajera','cajero'],abogada:['abogada','abogado'],diseñadora:['diseñadora','diseñador'],repartidora:['repartidora','repartidor'],bombera:['bombera','bombero'],funcionaria:['funcionaria','funcionario'],fontanera:['fontanera','fontanero']}[p.job]||[p.job,p.job];return (p.g==='m'?jobF[1]:jobF[0])+', '+p.age+' años';}
const isPartner=p=>['pareja','convive','casada'].includes(p.stage);
const partner=()=>(S.people||[]).find(isPartner);
const liveIn=()=>(S.people||[]).find(p=>p.stage==='convive'||p.stage==='casada');
const pArt=p=>p.g==='m'?'él':p.g==='f'?'ella':'elle';
const pO=p=>p.g==='m'?'o':p.g==='f'?'a':'e';
function setStage(p,st){p.stage=st;p.stageDay=S.day;}
// ---------- acciones ----------
function talkTo(p){p.rel=Math.min(100,p.rel+10);if(['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+3*compatOf(p)/60);S.needs.social=Math.min(100,S.needs.social+18);p.last=S.day;if(p.rel>=50&&p.stage==='conocida')setStage(p,'amiga');}
function callP(p){if(S.sim.work>0)return toast('Ana no puede llamar ahora');talkTo(p);tally('calls',p.n);toast(`☎️ ${CH().name} habla con ${p.n}`);}
function flirt(p){
  if(!canLove(p)){toast(`${p.n} no está interesad${pO(p)} en ${CH().name} de esa manera`);return false;}
  const pt=partner();if(pt&&pt!==p&&!S.openRel){toast(`${CH().name} ya tiene pareja`);return false;}
  const c=compatOf(p),chance=Math.min(.9,(p.love+p.rel*.4+c*.5)/140+lvl('carisma')*.03);
  if(Math.random()<chance){setStage(p,p.relStyle==='libre'&&LIFE().rel==='libre'?'rollo':'cita');p.love=Math.min(100,p.love+15);
    if(p.stage==='rollo')chapter('rollo1','Sin etiquetas',`${CH().name} y ${p.n} han decidido verse sin compromisos. Amigos, y algo más.`);
    else chapter('cita1','Primera cita',`${CH().name} se ha atrevido: le ha pedido una cita a ${p.n}, ${roleTxt(p)}. Ha dicho que sí.`);
    toast(`💘 ¡${p.n} ha dicho que sí!`,true);sfx('level');popBubble('💘');return true;}
  p.rel=Math.max(0,p.rel-6);S.needs.diversion=Math.max(0,S.needs.diversion-15);tell(`${CH().name} intentó algo con ${p.n}. ${pickR(['No hubo química.','«Te veo más como amig'+oa()+'».','Silencio incómodo. Muy incómodo.'])}`,'🙈');toast(`🙈 ${p.n} no está por la labor`);return false;}
function askOut(p){if(p.love<60){toast(`Aún es pronto: ${p.n} y ${CH().name} se están conociendo`);return;}
  if(p.relStyle==='soltera'&&Math.random()<.6){tell(`${p.n} le ha dicho que no quiere pareja ahora mismo. Le gusta su libertad.`,'💔');p.love-=15;return;}
  setStage(p,'pareja');chapter('pareja1','Pareja',`${CH().name} y ${p.n} ya son pareja. Lo han dicho en voz alta y todo.`);toast(`❤️ ${CH().name} y ${p.n} son pareja`,true);sfx('level');popBubble('❤️');}
function moveIn(p){if(p.love<70||S.day-(p.stageDay||0)<20){toast('Todavía es pronto para vivir juntos');return;}
  const beds=findObjs((d,t)=>t==='cama').length;setStage(p,'convive');chapter('convive','Bajo el mismo techo',`${p.n} se ha mudado a casa de ${CH().name}. Dos cepillos de dientes, el doble de ropa y la mitad del alquiler.${beds?'':' Eso sí: hace falta una cama más grande.'}`);toast(`🏠 ${p.n} se muda con ${CH().name}`,true);}
function wedding(p,kind){const cost=kind==='grande'?Math.round(1600*PM()):kind==='sencilla'?Math.round(350*PM()):Math.round(40*PM());
  if(S.money<cost&&kind!=='hecho'){toast(`No hay dinero para una boda ${kind} (${fmt(cost)})`);return;}
  S.money-=cost;bumpMoney();setStage(p,'casada');p.love=Math.min(100,p.love+15);for(const q of S.people||[])if(q.k==='madre'||q.k==='amiga')q.rel=Math.min(100,q.rel+10);
  chapter('boda',kind==='hecho'?'Pareja de hecho':'La boda',kind==='hecho'?`${CH().name} y ${p.n} se han inscrito como pareja de hecho. Un papel, una firma y unas cañas.`:kind==='grande'?`Boda por todo lo alto: ${fmt(cost)} en flores, banquete y una orquesta que tocó Paquito el Chocolatero tres veces.`:`Boda sencilla en el juzgado y comida con los suyos. ${P_('madre')?P_('madre').n+' lloró desde el primer minuto.':''}`);
  toast(kind==='hecho'?`📜 Pareja de hecho con ${p.n}`:`💍 ¡${CH().name} y ${p.n} se han casado!`,true);sfx('level');popBubble('💍');}
function breakUp(p,why){const was=p.stage;setStage(p,'ex');p.love=0;p.rel=Math.max(5,p.rel-30);S.needs.diversion=Math.max(0,S.needs.diversion-40);S.needs.social=Math.max(0,S.needs.social-20);
  S.res=(S.res||[]).filter(r=>r.pid!==p.k);
  if(was==='convive'||was==='casada'){chapter('ruptura','Ruptura',`${p.n} y ${CH().name} lo han dejado${why?': '+why:''}. ${p.n} se ha llevado sus cosas un martes por la tarde. La casa suena distinta.${(S.kids||[]).length?' Los niños se quedan con custodia compartida.':''}`);}
  else tell(`${CH().name} y ${p.n} lo han dejado${why?': '+why:''}.`,'💔');toast(`💔 ${CH().name} y ${p.n} lo han dejado`,true);}
// hijos: embarazo, adopción o clínica
function canCarry(g){return g==='f'||g==='x';}
function tryBaby(p){const L=LIFE();if(S.baby){toast('Ya hay un bebé en camino');return;}
  if(p&&p.kids==='no'){tell(`${p.n} no quiere hijos. Lo ha dejado claro, otra vez.`,'💬');p.love-=8;return;}
  const c=CH();let mode;if(p){mode=canCarry(c.g)&&p.g==='m'?'ana':canCarry(p.g)&&c.g==='m'?'pareja':'adopcion';}else mode=canCarry(c.g)?'clinica':'adopcion';
  const cost=mode==='adopcion'?Math.round(900*PM()):mode==='clinica'?Math.round(1200*PM()):0;if(S.money<cost){toast(`Hace falta ${fmt(cost)} para ${mode==='adopcion'?'la adopción':'la clínica'}`);return;}
  S.money-=cost;S.baby={mode,start:S.day,due:S.day+(mode==='adopcion'?55:38),with:p?p.k:null};
  chapter('bebe1',mode==='adopcion'?'Papeles':'Positivo',mode==='adopcion'?`${c.name}${p?' y '+p.n:''} han empezado los trámites de adopción. Entrevistas, informes y mucha espera.`:mode==='clinica'?`${c.name} ha decidido ser madre por su cuenta. Clínica, pruebas… y positivo.`.replace('madre',ga('madre','padre','madre o padre')):`Positivo. ${mode==='ana'?c.name:p.n} está embarazad${mode==='ana'?oa():pO(p)}. Nadie ha dormido esta noche.`);
  toast(mode==='adopcion'?'📋 Trámites de adopción en marcha':'🍼 ¡Viene un bebé!',true);sfx('level');}
const KIDNAMES={f:['Lola','Vera','Martina','Alma','Noa','Olivia','Jimena'],m:['Leo','Mateo','Bruno','Pau','Hugo','Nil','Dani']};
function babyBorn(){const b=S.baby;S.baby=null;const g=pickR(['f','m']);const n=pickR(KIDNAMES[g]);const p=b.with?(S.people||[]).find(q=>q.k===b.with):null;
  const ch={...randomChar(),g,name:n,skin:Math.random()<.5?CH().skin:(p?p.ch.skin:CH().skin),hair:Math.random()<.5?CH().hair:(p?p.ch.hair:CH().hair),style:g==='f'?pickR(['coleta','media','rizos']):pickR(['corto','rizos']),beard:'no',glasses:false};
  S.kids=S.kids||[];S.kids.push({n,g,born:S.day,ch});S.leaveUntil=S.day+16;
  chapter('nace_'+S.kids.length,`${n}`,`${b.mode==='adopcion'?`Por fin ha llegado ${n} a casa`:`Ha nacido ${n}`}. ${CH().name} ${p?'y '+p.n+' no paran':'no para'} de mirarl${g==='f'?'a':'o'}. Empieza el permiso: 16 semanas sin ir a trabajar.`);
  toast(`👶 ¡Bienvenid${g==='f'?'a':'o'}, ${n}!`,true);sfx('level');popBubble('👶');
  if(Dm().soul&&!TR().self&&Math.random()<.25)setTimeout(()=>tell('Al volver del permiso le han cambiado el turno al peor horario. «Necesidades del servicio».','😒'),10);}
const kidAge=k=>Math.floor((S.day-k.born)/60); // un año de crío cada 60 días de juego
const onLeave=()=>S.leaveUntil>S.day;
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
      else if(best&&best.stage==='cita'&&L.rel==='estable'&&best.love>=65&&Math.random()<.5)askOut(best);}}
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
  if(Math.random()>.28)return;const L=LIFE();const rom=L.orient!=='nadie'&&L.rel!=='soltera'&&!partner()&&Math.random()<.6;const p=newPerson(where,rom);
  if(['militancia','manifestacion','sindicato'].includes(k)&&S.ideo!=='apolitica')p.ideo=S.ideo;p.rel+=10;
  tell(`En ${where} ha conocido a ${p.n}, ${roleTxt(p)}.${rom&&canLove(p)?' Hubo miradas.':''}`,'👋');}
// ---------- visitas y gente que vive en casa ----------
function inviteHome(p,stay){if(S.sim.work>0)return toast('Ana no está en casa');if((S.res||[]).some(r=>r.pid===p.k))return toast(`${p.n} ya está aquí`);
  const h=S.t/60;const until=stay?(S.day+1)*1440+9*60:S.day*1440+Math.min(23.9*60,S.t+180);
  S.res=S.res||[];const [sx,sy]=simCell();const e=bfs([sx,sy],(x,y)=>x===0||y===0||x===N-1||y===N-1);const ex=e&&e.length?e[e.length-1]:[sx,sy];
  S.res.push({kind:'guest',pid:p.k,x:ex[0]+.5,y:ex[1]+.5,path:[],phase:0,until,stay});talkTo(p);p.rel=Math.min(100,p.rel+6);if(['cita','rollo','pareja'].includes(p.stage))p.love=Math.min(100,p.love+6);
  tally('calls',p.n);toast(`🏠 ${p.n} viene a casa${stay?' (se queda a dormir)':''}`);
  if(stay&&['rollo','cita','pareja'].includes(p.stage))tell(`${p.n} se quedó a dormir. ${pickR(['Desayunaron tarde y con calma.','Lo que pasó esa noche se queda en esa casa.','Por la mañana había dos tazas en el fregadero.'])}`,'🌙');}
function residents(){const list=[...(S.res||[])];const pt=liveIn();const h=S.t/60;const ptWork=pt&&dayType(S.day)==='work'&&h>8.2&&h<17.8;
  if(pt&&!ptWork&&!list.some(r=>r.pid===pt.k)){S.res=S.res||[];const r={kind:'partner',pid:pt.k,x:S.sim.x+1,y:S.sim.y,path:[],phase:0};const [x,y]=simCell();const n=neighborsOf(idx(x,y));if(n.length){r.x=n[0]%N+.5;r.y=(n[0]/N|0)+.5;}S.res.push(r);list.push(r);}
  if(pt&&ptWork)S.res=(S.res||[]).filter(r=>r.kind!=='partner');
  for(const [i,k] of (S.kids||[]).entries()){if(!(S.res||[]).some(r=>r.kid===i)){const [x,y]=simCell();S.res=S.res||[];S.res.push({kind:'kid',kid:i,x:x+.5,y:y+.5,path:[],phase:0});}}
  return S.res||[];}
function updateResidents(gm){
  const list=residents();const [ax,ay]=simCell();const home=!(S.sim.work>0);
  for(const r of list){r.phase=r.phase||0;if(r.path&&r.path.length){const [tx,ty]=r.path[0];if(!walkable(tx,ty)){r.path=[];continue;}npcMove(r,gm*(r.kind==='kid'?.8:1));continue;}
    r.next=(r.next||0)-gm;if(r.next>0)continue;r.next=6+Math.random()*10;
    const [cx,cy]=[Math.floor(r.x),Math.floor(r.y)];let goal;
    if(home&&(r.kind!=='kid'||Math.random()<.6)){const adj=neighborsOf(idx(ax,ay)).filter(j=>!(S.res||[]).some(o=>o!==r&&Math.floor(o.x)===j%N&&Math.floor(o.y)===(j/N|0)));if(adj.length){const j=adj.sort((a,b)=>Math.hypot(a%N-cx,(a/N|0)-cy)-Math.hypot(b%N-cx,(b/N|0)-cy))[0];goal=[j%N,j/N|0];}}
    if(!goal&&Math.random()<.4){for(let t=0;t<12;t++){const x=1+(Math.random()*(N-2)|0),y=1+(Math.random()*(N-2)|0);if(walkable(x,y)&&roomId[idx(x,y)]>=0){goal=[x,y];break;}}}
    if(goal&&(goal[0]!==cx||goal[1]!==cy)){const p=bfs([cx,cy],(x,y)=>x===goal[0]&&y===goal[1]);if(p)r.path=p;}}
  // compañía: sube lo social
  if(home&&list.length){S.needs.social=Math.min(100,S.needs.social+0.05*gm*list.length);for(const r of list){const p=r.pid&&S.people.find(q=>q.k===r.pid);if(p&&Math.random()<0.01*gm){p.rel=Math.min(100,p.rel+0.5);if(isPartner(p)||p.stage==='rollo')p.love=Math.min(100,p.love+0.3);p.last=S.day;}}}
  // la visita se va cuando toca
  S.res=(S.res||[]).filter(r=>!(r.kind==='guest'&&r.until<S.day*1440+S.t));
}
function drawResident(r){
  const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);const near=Math.hypot(r.x-S.sim.x,r.y-S.sim.y)<1.6&&!(S.sim.work>0);
  let ch,name,scale=1;if(r.kind==='kid'){const k=(S.kids||[])[r.kid];if(!k)return;ch=k.ch;name=k.n;scale=kidAge(k)<1?0.42:kidAge(k)<3?0.55:0.68;}else{const p=S.people.find(q=>q.k===r.pid);if(!p)return;ch=p.ch;name=p.n;}
  const saved=anaRT.phase;anaRT.phase=r.phase||0;let front=r.front,right=r.right;
  if(near&&!r.path.length){const [a,b]=w2v(S.sim.x,S.sim.y);right=(a-u)-(b-v)>0;front=(a-u)+(b-v)>-.01;}
  ctx.save();ctx.translate(bx,by);ctx.scale(scale,scale);
  if(r.kind==='kid'&&scale<.5){ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(0,-10,9,7,0,0,Math.PI*2);ctx.fill();circ(1,-18,6,ch.skin);circ(-.5,-19,1,'#3b2a20');circ(3,-19,1,'#3b2a20');}
  else drawAna(0,0,{ch,shirt:ch.shirt,mood:70,front,right,pose:r.path&&r.path.length?'walk':'stand',act:near&&!r.path.length&&r.kind!=='kid'?'talk':null});
  ctx.restore();anaRT.phase=saved;
  if(cam.z>0.7)label((r.kind==='kid'?'🧒 ':r.kind==='partner'?'❤️ ':'')+name,bx,by-(r.kind==='kid'?30:66),'rgba(255,253,248,.9)','#3b3247',8);
}
// ---------- pestaña de gente ----------
function genteTab(){
  const L=LIFE(),pt=partner();let h='';
  const chips=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${L[key]===k?' sel':''}" data-life="${key}" data-v="${k}">${v}</button>`).join('')}</div>`;
  h+=`<h3>💭 Lo que quiere en la vida</h3><div class="clab">Le atraen</div>${chips('orient',ORIENT)}<div class="clab">Relaciones</div>${chips('rel',RELSTYLE)}<div class="clab">Hijos</div>${chips('kids',KIDSW)}<div class="clab">Boda</div>${chips('boda',BODAW)}`;
  h+=`<h3>🏡 Familia</h3>`;
  if(pt)h+=`<div class="kv"><span>❤️ ${pt.n}</span><span>${STAGE[pt.stage]} · amor ${Math.round(pt.love)}</span></div>`;else h+=`<div class="sub">${L.rel==='soltera'?'Soltería elegida y bien llevada.':'Sin pareja ahora mismo.'}</div>`;
  if(S.baby)h+=`<div class="kv"><span>${S.baby.mode==='adopcion'?'📋 Adopción':'🍼 Bebé en camino'}</span><span>faltan ${Math.max(0,S.baby.due-S.day)} días</span></div>`;
  for(const k of S.kids||[])h+=`<div class="kv"><span>${k.g==='f'?'👧':'👦'} ${k.n}</span><span>${kidAge(k)<1?'bebé':kidAge(k)+' años'}</span></div>`;
  if(onLeave())h+=`<div class="kv"><span>👶 Permiso</span><span>hasta el día ${S.leaveUntil}</span></div>`;
  if(!S.baby&&L.kids!=='no'){if(pt&&['convive','casada'].includes(pt.stage))h+=`<button class="btn grey" data-act="baby" data-p="${pt.k}">👶 Buscar un bebé con ${pt.n}</button>`;else if(!pt)h+=`<button class="btn grey" data-act="solo">👶 Tener un hijo por su cuenta (clínica o adopción)</button>`;}
  if(L.orient!=='nadie')h+=`<button class="btn grey" id="appbtn">📱 Abrir la app de citas</button>`;
  h+=`<h3>🫂 Gente</h3>`;
  const order=p=>isPartner(p)?0:p.stage==='rollo'?1:p.stage==='cita'?2:['madre','amiga'].includes(p.k)?3:p.stage==='ex'?9:5;
  for(const p of [...(S.people||[])].sort((a,b)=>order(a)-order(b)||b.rel-a.rel)){
    const rom=p.k.startsWith('p');const st=rom?STAGE[p.stage]:p.r;
    h+=`<div class="pers"><canvas data-por="${p.k}" width="80" height="80"></canvas><div class="pi"><b>${p.n}</b> <small>${rom?roleTxt(p)+' · '+(IDEOS[p.ideo]?IDEOS[p.ideo].e:''):''}</small><div class="sub" style="font-size:11px">${st}${rom&&p.met?' · de '+p.met:''}</div>`;
    h+=`<div class="minibars"><i style="width:${p.rel}%;background:#7a6fd0"></i></div>`;if(rom&&p.stage!=='conocida'&&p.stage!=='amiga'&&p.stage!=='ex')h+=`<div class="minibars"><i style="width:${p.love}%;background:#e88aa8"></i></div>`;
    h+=`<div class="pbtn"><button class="mini" data-act="call" data-p="${p.k}">☎️</button><button class="mini" data-act="out" data-p="${p.k}">🍻</button><button class="mini" data-act="home" data-p="${p.k}">🏠</button>`;
    if(rom&&p.stage!=='ex'){if(['conocida','amiga'].includes(p.stage)&&canLove(p))h+=`<button class="mini" data-act="flirt" data-p="${p.k}">💘 Ligar</button>`;
      if(p.stage==='cita'||p.stage==='rollo')h+=`<button class="mini" data-act="date" data-p="${p.k}">🌹 Cita</button><button class="mini" data-act="stay" data-p="${p.k}">🌙 Que se quede</button><button class="mini" data-act="ask" data-p="${p.k}">❤️ Pedir salir</button>`;
      if(p.stage==='pareja')h+=`<button class="mini" data-act="date" data-p="${p.k}">🌹 Cita</button><button class="mini" data-act="stay" data-p="${p.k}">🌙</button><button class="mini" data-act="movein" data-p="${p.k}">🏠 Vivir juntos</button>`;
      if(p.stage==='convive')h+=`<button class="mini" data-act="wed" data-p="${p.k}">💍 Casarse</button><button class="mini" data-act="hecho" data-p="${p.k}">📜 Pareja de hecho</button>`;
      if(['cita','rollo','pareja','convive','casada'].includes(p.stage))h+=`<button class="mini" data-act="break" data-p="${p.k}">💔</button>`;}
    h+=`</div></div></div>`;}
  return h;
}
function bindGente(){
  card.querySelectorAll('[data-por]').forEach(c=>{const p=S.people.find(q=>q.k===c.dataset.por);if(!p)return;const ch=p.ch||{...DEFCHAR,name:p.n,g:/a$/.test(p.n)?'f':'m',skin:SKINS[(p.n.length)%6],hair:p.k==='madre'?'#bdbdbd':HAIRCOLS[p.n.length%6],style:p.k==='madre'?'mono':pickR(['corto','melena','coleta']),age:p.k==='madre'?58:30,beard:'no',shirt:SHIRTC[p.n.length%SHIRTC.length]};if(!p.ch)p.ch=ch;paintPortrait(c,ch,65);});
  card.querySelectorAll('[data-life]').forEach(b=>b.onclick=()=>{LIFE()[b.dataset.life]=b.dataset.v;openMenu('gente');});
  const ab=card.querySelector('#appbtn');if(ab)ab.onclick=()=>{datingApp(false);openMenu('gente');};
  card.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const p=S.people.find(q=>q.k===b.dataset.p);const a=b.dataset.act;
    if(a==='solo'){tryBaby(null);openMenu('gente');return;}if(!p)return;
    if(a==='call')callP(p);else if(a==='out'){menu.classList.remove('open');S.outWith=p.k;if(outAvail('amigos')&&outAvail('amigos')!=='solo en días libres'){toast('Ahora no puede salir: '+outAvail('amigos'));S.outWith=null;return;}doOut('amigos');return;}
    else if(a==='home')inviteHome(p,false);else if(a==='stay')inviteHome(p,true);else if(a==='flirt')flirt(p);else if(a==='ask')askOut(p);else if(a==='movein')moveIn(p);
    else if(a==='wed')wedding(p,S.money>1600*PM()*1.3?'grande':'sencilla');else if(a==='hecho')wedding(p,'hecho');else if(a==='break')breakUp(p,'');else if(a==='baby')tryBaby(p);
    else if(a==='date'){menu.classList.remove('open');S.outWith=p.k;S.dateOut=true;doOut('amigos');return;}
    openMenu('gente');});
}
