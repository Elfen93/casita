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
  if(p.relStyle==='soltera'&&Math.random()<.6){tell(`${p.n} le ha dicho que no quiere pareja ahora mismo. Le gusta su libertad.`,'💔');p.love-=15;p.refused=(p.refused||0)+1;return;}
  setStage(p,'pareja');chapter('pareja1','Pareja',`${CH().name} y ${p.n} ya son pareja. Lo han dicho en voz alta y todo.`);toast(`❤️ ${CH().name} y ${p.n} son pareja`,true);sfx('level');popBubble('❤️');}
function moveIn(p){if(p.love<70||S.day-(p.stageDay||0)<20){toast('Todavía es pronto para vivir juntos');return;}
  const beds=findObjs((d,t)=>t==='cama'||!!d.bed).length;setStage(p,'convive');chapter('convive','Bajo el mismo techo',`${p.n} se ha mudado a casa de ${CH().name}. Dos cepillos de dientes, el doble de ropa y la mitad del alquiler.${beds?'':' Eso sí: hace falta una cama más grande.'}`);toast(`🏠 ${p.n} se muda con ${CH().name}`,true);}
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
