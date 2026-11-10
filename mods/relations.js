// =================== RELACIONES: amistades, citas, rollos, pareja, familia ===================
const ORIENT={hetero:'Hetero',homo:'Gay / lesbiana',bi:'Bi / pan',ace:'Asexual'};
const LIFE={pareja:{si:'Quiere pareja',abierta:'Lo que surja',no:'Prefiere estar sola'},hijos:{si:'Quiere hijos',nose:'No lo tiene claro',no:'No quiere hijos'},boda:{si:'Le gustaría casarse',igual:'Le da igual',no:'No quiere casarse'}};
const ST_N={conocido:'Conocido',amistad:'Amistad',cita:'Conociéndose',rollo:'Rollo',pareja:'Pareja',prometida:'Prometidos',casada:'Matrimonio',ex:'Ex'};
const ST_E={conocido:'👋',amistad:'🫶',cita:'💘',rollo:'🔥',pareja:'❤️',prometida:'💍',casada:'💒',ex:'💔'};
const BIOS=['Le encanta el monte y odia madrugar.','Cocina fatal pero lo intenta.','Lee poesía en el metro.','Tiene un gato que se llama Lenin.','Colecciona vinilos.','Hace crossfit y lo cuenta.','Profe de primaria, voz de pito.','Bailarina de salsa los jueves.','Fan del fútbol y de las siestas largas.','Viaja en furgo cuando puede.','Teletrabaja desde el sofá.','Sueña con una casa en el pueblo.'];
const IDPOS={apolitica:[0,0],marxista:[-9,3],anarquista:[-8,-8],socialdemocrata:[-4,1],ecologista:[-5,-3],liberal:[4,-3],libertaria:[9,-9],conservadora:[6,6]};
const ideoDist=(a,b)=>{const p=IDPOS[a]||[0,0],q=IDPOS[b]||[0,0];return Math.hypot(p[0]-q[0],p[1]-q[1]);};
function life(){if(!S.life)S.life={orient:'bi',pareja:'abierta',hijos:'nose',boda:'igual'};return S.life;}
function attracted(g1,o1,g2){if(o1==='ace')return false;if(o1==='bi')return true;if(g1==='x'||g2==='x')return true;return o1==='homo'?g1===g2:g1!==g2;}
function canRomance(p){if(!p||p.k==='madre'||!p.ch)return false;const c=CH();return attracted(c.g,life().orient,p.g)&&attracted(p.g,p.orient||'bi',c.g);}
let PID=1;
function newPerson(where,romantic){
  const c=CH(),L0=life();let g;
  if(romantic){const opts=['f','m','x'].filter(gg=>attracted(c.g,L0.orient,gg));g=opts.length?pickR(opts):pickR(['f','m']);}else g=pickR(['f','m','f','m','x']);
  const ch=randomChar();ch.g=g;ch.name=pickR(NAMES[g]);if(g!=='m')ch.beard='no';ch.age=Math.max(20,Math.min(60,(c.age||27)+Math.round((Math.random()-.5)*14)));
  const id=(S.pidSeq=(S.pidSeq||100)+1);
  const orient=romantic?(attracted(g,'hetero',c.g)?pickR(['hetero','bi']):attracted(g,'homo',c.g)?pickR(['homo','bi']):'bi'):pickR(['hetero','hetero','hetero','homo','bi']);
  const ideo=Math.random()<.55?S.ideo:pickR(IDEO_ORDER);
  return {id,k:'conocido',n:ch.name,g,ch,age:ch.age,orient,ideo,kids:pickR(['si','si','nose','no']),boda:pickR(['si','igual','no']),job:pickR(TRK_ORDER.slice(0,8)),bio:pickR(BIOS),chem:Math.random(),rel:15,rom:romantic?15:0,st:'conocido',met:S.day,where,hap:60,e:'👤',r:`conocid${g==='f'?'a':g==='m'?'o':'e'} ${where}`,last:S.day};
}
const PP=id=>(S.people||[]).find(p=>p.id===id);
function compat(p){let v=0.5+p.chem*0.35;const d=ideoDist(S.ideo,p.ideo);v-=d/30;if(life().hijos!=='nose'&&p.kids!=='nose'&&life().hijos!==p.kids)v-=.15;if(T('sociable'))v+=.05;return Math.max(0,Math.min(1,v));}
function meetSomeone(where){
  if((S.people||[]).filter(p=>p.k==='conocido'||p.st==='conocido').length>14)return;
  const L0=life(),wantsDate=L0.pareja!=='no'&&L0.orient!=='ace'&&!partner();
  const p=newPerson(where,wantsDate&&Math.random()<.5);S.people.push(p);
  tell(`${pickR(['Ha conocido','Se ha cruzado con','Ha empezado a hablar con'])} ${p.n} ${where}. ${p.bio}`,'👋');
}
// ¿con quién comparte vida?
const partner=()=>(S.people||[]).find(p=>['pareja','prometida','casada'].includes(p.st));
const livesWith=()=>(S.people||[]).filter(p=>p.home);
function relUp(p,a,b){p.rel=Math.max(0,Math.min(100,p.rel+a));if(b)p.rom=Math.max(0,Math.min(100,(p.rom||0)+b));p.last=S.day;}
// ---------- acciones ----------
function talkTo(p){relUp(p,8,p.st==='cita'||p.st==='pareja'||p.st==='rollo'?4:0);S.needs.social=Math.min(100,S.needs.social+25);p.hap=Math.min(100,(p.hap||60)+4);
  const t=pickR(['se rieron un buen rato','se pusieron al día','hablaron hasta tarde',ideoDist(S.ideo,p.ideo)>10?'acabaron discutiendo de política':'coincidieron en casi todo']);
  if(ideoDist(S.ideo,p.ideo)>10&&Math.random()<.4){relUp(p,-6,-3);}
  toast(`☎️ ${CH().name} habla con ${p.n}: ${t}`);if(Math.random()<.3)tell(`Habló con ${p.n}: ${t}.`,'☎️');}
function askOut(p,kind){ // quedar o cita
  if(S.sim.work>0)return toast('Ana no está en casa');S.sim.withP=p.id;S.outDay=null;doOut(kind);}
function inviteHome(p){
  if(S.sim.work>0)return toast('Ana no está en casa');if(S.guest)return toast(`Ya está ${PP(S.guest.pid)?.n||'alguien'} en casa`);
  const h=S.t/60;if(h<9||h>22.5)return toast('No son horas de invitar a nadie');
  if(p.home)return toast(`${p.n} ya vive aquí`);
  const [ex,ey]=S.sim.exit||[0,N>>1];const door=bfs(simCell(),(x,y)=>x===0||y===0||x===N-1||y===N-1);const start=door&&door.length?door[door.length-1]:simCell();
  S.guest={pid:p.id,x:start[0]+.5,y:start[1]+.5,path:[],phase:0,until:S.t+150+Math.random()*90,day:S.day,front:true,right:true};
  toast(`🏠 ${p.n} viene a casa`);sfx('tap');
}
function flirt(p){if(!canRomance(p))return toast(`${p.n} no está interesad${p.g==='f'?'a':p.g==='m'?'o':'e'} en ese sentido`);
  const c=compat(p),ok=Math.random()<0.35+c*0.5+lvl('carisma')*0.03;gainSkill('carisma',3);
  if(ok){relUp(p,3,10+c*8);if(p.st==='conocido'||p.st==='amistad')p.st='cita';toast(`💘 Hay química con ${p.n}`);}
  else{relUp(p,-3,-4);toast(`😬 ${p.n} se ríe por compromiso… no ha colado`);}}
function propose(p,what){
  const c=compat(p);
  if(what==='pareja'){const ok=p.rom>=55&&Math.random()<0.4+c*0.5;if(ok){p.st='pareja';p.since=S.day;chapter('pareja_'+p.id,'Algo empieza',`${CH().name} y ${p.n} son pareja. ${pickR(['Nadie lo esperaba, ni ellos.','Se nota en cómo se miran.','Lo celebraron con churros a las tantas.'])}`);}else{relUp(p,-5,-10);toast(`💔 ${p.n} no quiere algo serio ahora mismo`);tell(`Le propuso a ${p.n} salir juntos. Le dijo que no. Dolió.`,'💔');}}
  if(what==='rollo'){const ok=p.rom>=40&&Math.random()<0.5+c*0.3;if(ok){p.st='rollo';tell(`${CH().name} y ${p.n} tienen un rollo: sin etiquetas, sin compromisos.`,'🔥');}else{relUp(p,-4,-8);toast(`${p.n} prefiere dejarlo en amistad`);}}
  if(what==='vivir'){if(S.guest&&S.guest.pid===p.id)S.guest=null;p.home=true;p.x=null;tell(`${p.n} se muda a casa de ${CH().name}. Dos cepillos de dientes, el doble de ropa, la mitad del alquiler.`,'🏡');chapter('conviven','Bajo el mismo techo',`${p.n} ya vive aquí. Ahora las facturas se pagan a medias y las discusiones son por los platos.`);}
  if(what==='boda'){const want=p.boda!=='no';if(want&&Math.random()<0.6+c*0.4){p.st='prometida';tell(`${CH().name} le ha pedido matrimonio a ${p.n}. Ha dicho que sí.`,'💍');toast(`💍 ¡${p.n} ha dicho que sí!`,true);}else{relUp(p,0,-8);tell(`Le pidió matrimonio a ${p.n}. «Te quiero, pero no creo en el matrimonio».`,'💍');}}
  if(what==='bebe'){if(p.kids==='no'){relUp(p,-5,-6);tell(`Habló con ${p.n} de tener hijos. No quiere. La conversación acabó en silencio.`.replace('acabó en','acabó en'),'👶');p.hap-=10;return;}
    S.baby={due:S.day+(Math.random()<.5?40:60),adopt:!(CH().g==='f'||p.g==='f'),with:p.id};tell(S.baby.adopt?`${CH().name} y ${p.n} han empezado los trámites de adopción. Toca esperar.`:`${CH().name} y ${p.n} están esperando un bebé.`,'🍼');chapter('bebe1','La espera',S.baby.adopt?'Papeles, entrevistas, cursos. Y una habitación que poco a poco se llena de cosas pequeñas.':'Ecografías, nombres apuntados en una libreta y una cuna por montar.');}
  if(what==='romper'){const was=p.st;p.st='ex';p.rom=Math.max(0,p.rom-40);p.rel=Math.max(0,p.rel-30);if(p.home){p.home=false;tell(`${p.n} se ha ido de casa.`,'📦');}
    if(was==='casada'){const c2=Math.round(300*PM());S.money-=c2;tell(`Divorcio: abogados, papeles y ${fmt(c2)} que no tenía.`,'⚖️');}
    chapter('ruptura_'+p.id,'Se acabó',`${CH().name} y ${p.n} lo han dejado. ${pickR(['La casa se ha quedado enorme.','Ninguno de los dos tenía la culpa, y eso es lo peor.','Hay canciones que ya no puede escuchar.'])}`);S.needs.diversion=Math.max(0,S.needs.diversion-40);S.needs.social=Math.max(0,S.needs.social-30);}
}
function wedding(p,big){const cost=Math.round((big?1400:180)*PM());if(S.money<cost*0.6)return toast(`No llega: la boda cuesta ${fmt(cost)}`);S.money-=cost;p.st='casada';p.married=S.day;
  for(const q of S.people)if(q.k==='madre'||q.k==='amiga')q.rel=Math.min(100,q.rel+15);S.needs.social=100;S.needs.diversion=100;
  chapter('boda','Sí, quiero',big?`Una boda de las de antes: ciento veinte invitados, la tía bailando en la mesa y ${fmt(cost)} menos en la cuenta.`:`Una boda pequeña en el juzgado y comida con los de siempre. ${fmt(cost)} y ni un minuto de arrepentimiento.`);toast('💒 ¡Se han casado!',true);}
// ---------- hijos ----------
const KIDNAMES={f:['Lola','Vega','Alma','Noa','Martina','Olivia'],m:['Mateo','Leo','Hugo','Darío','Pau','Nico']};
function babyTick(){const b=S.baby;if(!b||S.day<b.due)return;S.baby=null;const g=Math.random()<.5?'f':'m';const n=pickR(KIDNAMES[g]);
  const kid={id:(S.pidSeq=(S.pidSeq||100)+1),n,g,born:S.day,care:80,ch:{...randomChar(),g,name:n,beard:'no',glasses:false,hair:CH().hair,skin:CH().skin}};S.kids=S.kids||[];S.kids.push(kid);
  chapter('hijo_'+kid.id,`Llega ${n}`,`${b.adopt?'Les llamaron un martes: ya podían ir a buscar':'Ha nacido'} ${n}. ${pickR(['Tres kilos de llanto y de futuro.','Nadie había dormido tan poco siendo tan feliz.','Huele a leche y a algo que no se puede explicar.'])}`);
  if(!TR().auto&&!S.jobless){S.leave=S.day+(Dm().soul?16:28);tell(`Permiso parental hasta el día ${S.leave}.`,'🍼');}
  toast(`👶 ¡Ha llegado ${n}!`,true);}
const kidAge=k=>Math.floor((S.day-k.born)/3); // un año de juego cada 3 días… la infancia pasa volando
function kidsDaily(){for(const k of S.kids||[]){const p=partner();const help=p&&p.home?0.5:1;k.care=Math.max(0,k.care-(kidAge(k)<2?30:18)*help);
  if(k.care<20&&Math.random()<.3)tell(`${k.n} lleva días reclamando atención. ${CH().name} no llega a todo.`,'😢');
  const a=kidAge(k);if(a===3&&!k.cole){k.cole=true;tell(`${k.n} empieza en la escuela infantil.`,'🎒');}if(a===18&&!k.grown){k.grown=true;tell(`${k.n} cumple dieciocho años. ¿Cuándo ha pasado?`,'🎓');}}}
function careKid(k){k.care=Math.min(100,k.care+45);S.needs.social=Math.min(100,S.needs.social+15);S.needs.diversion=Math.min(100,S.needs.diversion+10);S.needs.energia=Math.max(0,S.needs.energia-10);toast(`🧸 ${CH().name} pasa un rato con ${k.n}`);}
const kidCost=()=>(S.kids||[]).reduce((a,k)=>a+Math.round((kidAge(k)<3?28:22)*PM()),0);
// ---------- semana: dinero, afecto, conflictos ----------
function relWeekly(){
  const p=partner();
  for(const q of S.people||[]){if(!q.id)continue;const idle=S.day-(q.last||0);
    if(q.st==='cita'&&idle>12){q.st=q.rel>40?'amistad':'conocido';q.rom=Math.max(0,q.rom-15);}
    if(q.st==='rollo'){q.rom=Math.max(0,q.rom-2);if(q.rom>75&&Math.random()<.25){tell(`${q.n} confiesa que siente algo más. ${life().pareja==='no'?CH().name+' no busca eso.':''}`,'💗');if(life().pareja!=='no'&&Math.random()<.6){q.st='pareja';q.since=S.day;chapter('pareja_'+q.id,'Algo empieza',`Lo que iba a ser un rollo se ha convertido en otra cosa. ${CH().name} y ${q.n} son pareja.`);}}}
    if(q.st==='conocido'&&q.rel>45)q.st='amistad';
    if(!['madre','amiga','vecina','compi'].includes(q.k))q.rel=Math.max(0,q.rel-(idle>7?2:0.5));}
  if(p){const c=compat(p);let d=(c-0.5)*8-(S.money<0?4:0)-(mood()<35?3:0)-(S.day-(p.last||0)>5&&!p.home?5:0)+(p.home?2:0);
    if(life().hijos!=='nose'&&p.kids!=='nose'&&life().hijos!==p.kids&&(S.kids||[]).length===0)d-=3;
    p.hap=Math.max(0,Math.min(100,(p.hap||60)+d));
    if(ideoDist(S.ideo,p.ideo)>12&&Math.random()<.3)tell(pickR([`Cena tensa: ${CH().name} y ${p.n} han vuelto a discutir de política.`,`${p.n} y ${CH().name} no se hablan desde las elecciones.`]),'🗯️');
    if(p.hap<20&&Math.random()<.35){tell(`${p.n} ya no es feliz en la relación.`,'💔');propose(p,'romper');return;}
    // la pareja también propone cosas
    if(p.st==='pareja'&&!p.home&&S.day-p.since>20&&Math.random()<.2&&!S.owned||p.st==='pareja'&&!p.home&&S.day-p.since>20&&Math.random()<.15){tell(`${p.n} le ha propuesto irse a vivir juntos.`,'🏡');if(S.autoHome&&life().pareja!=='no')propose(p,'vivir');else p.askLive=true;}
    if(p.st==='pareja'&&p.home&&S.day-p.since>45&&p.boda==='si'&&Math.random()<.1){tell(`${p.n} le ha pedido matrimonio a ${CH().name}.`,'💍');if(life().boda!=='no'){p.st='prometida';toast(`💍 ${p.n} le ha pedido matrimonio y ha dicho que sí`,true);}else{p.hap-=15;tell('Le dijo que no cree en el matrimonio. Se quedaron un rato en silencio.','💍');}}
    if(p.st==='prometida'&&S.autoHome&&S.money>Math.round(300*PM())&&Math.random()<.15)wedding(p,S.money>Math.round(3000*PM()));
    if(p.home&&!S.baby&&(S.kids||[]).length<2&&life().hijos==='si'&&p.kids==='si'&&S.day-p.since>40&&Math.random()<.12&&S.autoHome)propose(p,'bebe');
    // aportación a gastos si convive
    if(p.home){const pay=Math.round((p.jobless?0:150)*Dm().pay*PM()*0.6);S.money+=pay;if(Dm().soul&&Math.random()<.04&&!p.jobless){p.jobless=true;tell(`Han despedido a ${p.n}. Ahora toca tirar con un solo sueldo.`,'📦');}else if(p.jobless&&Math.random()<.15){p.jobless=false;tell(`${p.n} ha encontrado trabajo. Respiran.`,'📝');}}}
  if((S.kids||[]).length){const c=kidCost();S.money-=c;}
}
// Ana busca gente o pareja por su cuenta
function relAuto(){
  if(!S.autoHome)return;const L0=life();const p=partner();
  if(!p&&L0.pareja!=='no'&&L0.orient!=='ace'){
    const d=(S.people||[]).filter(q=>q.id&&canRomance(q)&&['conocido','amistad','cita','rollo'].includes(q.st)).sort((a,b)=>b.rom-a.rom)[0];
    if(d&&d.rom>=60&&L0.pareja==='si'&&Math.random()<.4)propose(d,'pareja');
    else if(d&&d.rom>=45&&L0.pareja==='abierta'&&d.st!=='rollo'&&Math.random()<.2)propose(d,Math.random()<.5?'rollo':'pareja');
    else if(!d&&Math.random()<.25)datingApp(true);}
}
// app de citas
let appPicks=null;
function datingApp(auto){const L0=life();if(L0.orient==='ace')return toast('No le interesa');appPicks=[newPerson('en una app de citas',true),newPerson('en una app de citas',true),newPerson('en una app de citas',true)];
  if(auto){const p=appPicks.sort((a,b)=>compat(b)-compat(a))[0];if(Math.random()<.5+compat(p)*.4){p.rom=25;p.st='cita';S.people.push(p);tell(`Match en la app con ${p.n} (${p.age}). ${p.bio}`,'📱');}appPicks=null;return;}
  openApp();}
function openApp(){let h=`<h2>📱 App de citas</h2><div class="sub">Desliza… o mejor, toca.</div>`;
  appPicks.forEach((p,i)=>{h+=`<div class="pcard"><canvas width="120" height="120" data-por="${i}"></canvas><div style="flex:1"><b>${p.n}, ${p.age}</b><div class="sub" style="font-size:12px">${TRACKS[p.job].e} ${TRACKS[p.job].n} · ${IDEOS[p.ideo].e} ${IDEOS[p.ideo].n} · ${p.kids==='si'?'quiere hijos':p.kids==='no'?'no quiere hijos':'hijos: ya se verá'}</div><div class="sub" style="font-size:12px">${p.bio}</div><div class="sub" style="font-size:11px">Afinidad: ${'❤️'.repeat(Math.max(1,Math.round(compat(p)*5)))}</div></div><button class="mini" data-like="${i}">💚</button></div>`;});
  h+=`<button class="btn grey" id="appmore">🔄 Ver más</button><button class="btn grey" id="appclose">Cerrar</button>`;card.innerHTML=h;menu.classList.add('open');
  card.querySelectorAll('[data-por]').forEach(c=>paintPortrait(c,appPicks[+c.dataset.por].ch,65));
  card.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const p=appPicks[+b.dataset.like];if(Math.random()<.35+compat(p)*.5+lvl('carisma')*.02){p.rom=25;p.st='cita';S.people.push(p);toast(`💚 ¡Match con ${p.n}! Ya podéis quedar`,true);tell(`Match en la app con ${p.n}. ${p.bio}`,'📱');}else toast(`${p.n} no ha devuelto el like`);b.disabled=true;b.style.opacity=.4;});
  card.querySelector('#appmore').onclick=()=>datingApp(false);card.querySelector('#appclose').onclick=()=>openMenu('gente');}
// ---------- visitas y familia en casa ----------
function householdUpdate(gm){
  const g=S.guest;
  if(g){const p=PP(g.pid);if(!p||S.sim.work>0||S.day!==g.day&&!g.night){if(g.night&&S.t/60>=9){g.night=false;g.until=S.t+30;}else if(!g.night){S.guest=null;}}
    if(S.guest){if(!g.leaving&&S.t>=g.until&&!g.night){
        if(p&&['pareja','rollo','cita','prometida','casada'].includes(p.st)&&S.t/60>=21&&p.rom>=50&&!g.stayed){g.night=true;g.stayed=true;relUp(p,6,10);S.needs.social=100;tell(p.st==='cita'?`${p.n} se quedó a dormir. Hubo desayuno, y risas, y nadie miró el móvil.`:`${p.n} se quedó a pasar la noche.`,'🌙');if(p.st==='cita'&&Math.random()<.4)p.st=life().pareja==='si'?'cita':'rollo';}
        else{g.leaving=true;g.path=bfs([Math.floor(g.x),Math.floor(g.y)],(x,y)=>x===0||y===0||x===N-1||y===N-1)||[];if(p){relUp(p,10,p.st==='amistad'||p.st==='conocido'?0:6);tell(`${p.n} pasó la tarde en casa. ${pickR(['Cenaron algo rápido y vieron una peli.','Charlaron en la cocina hasta tarde.','Se rieron con las fotos de cuando eran críos.'])}`,'🏠');}}}
      if(g.leaving){if(g.path&&g.path.length)npcMove(g,gm);else S.guest=null;}
      else if(!g.night){S.needs.social=Math.min(100,S.needs.social+gm*0.25);followAna(g,gm);}}}
  for(const p of livesWith()){if(p.x==null){const [sx,sy]=simCell();p.x=sx+.5;p.y=sy+.5;p.path=[];p.phase=0;}
    const h=S.t/60,wd=dateOf(S.day).wd;p.away=!p.jobless&&wd<5&&h>=8.5&&h<17.5;
    if(!p.away){if(p.path&&p.path.length)npcMove(p,gm);else if(!p.nextMove||S.t>p.nextMove||S.t<p.nextMove-300){p.nextMove=S.t+30+Math.random()*60;const near=Math.random()<.6;const [ax,ay]=simCell();
      const tgt=near?[ax,ay]:[1+(Math.random()*(N-2)|0),1+(Math.random()*(N-2)|0)];const path=bfs([Math.floor(p.x),Math.floor(p.y)],(x,y)=>Math.abs(x-tgt[0])+Math.abs(y-tgt[1])<=1&&walkable(x,y)&&!(x===ax&&y===ay));p.path=path?path.slice(0,14):[];}}
    if(!p.away&&!S.sim.work)S.needs.social=Math.min(100,S.needs.social+gm*0.05);}
  for(const k of S.kids||[]){if(k.x==null){const [sx,sy]=simCell();k.x=sx+.5;k.y=sy+.5;k.path=[];k.phase=0;}if(kidAge(k)>=1&&!(k.path&&k.path.length)&&Math.random()<gm*0.02){const path=bfs([Math.floor(k.x),Math.floor(k.y)],(x,y)=>Math.random()<.06&&walkable(x,y));k.path=path?path.slice(0,6):[];}if(k.path&&k.path.length)npcMove(k,gm*0.6);}
}
function followAna(g,gm){const [ax,ay]=simCell();const gx=Math.floor(g.x),gy=Math.floor(g.y);if(Math.abs(gx-ax)+Math.abs(gy-ay)<=1){g.front=ay>=gy||ax>=gx;return;}
  if(!g.path||!g.path.length||g.tgt!==ax*100+ay){g.tgt=ax*100+ay;const p=bfs([gx,gy],(x,y)=>Math.abs(x-ax)+Math.abs(y-ay)===1&&walkable(x,y));g.path=p||[];}if(g.path.length)npcMove(g,gm);}
function householdDraws(){const out=[];const add=(o,ch,scale,nm,extra)=>{if(o.x==null)return;const [u,v]=w2v(o.x,o.y);out.push({k:u+v,f:()=>{const [px,py]=P(u,v);const old=anaRT.phase;anaRT.phase=o.phase||0;ctx.save();ctx.translate(px,py);ctx.scale(scale,scale);drawAna(0,0,{ch,shirt:ch.shirt,mood:65,front:o.front!==false,right:o.right!==false,pose:o.path&&o.path.length?'walk':'stand',act:extra});ctx.restore();anaRT.phase=old;if(nm)label(nm,px,py-62*scale,'rgba(255,253,248,.92)','#3b3247',8);}});};
  if(S.sim.work>0)return out;
  const g=S.guest;if(g&&!g.night){const p=PP(g.pid);if(p)add(g,p.ch,1,p.n,!g.leaving&&!(g.path&&g.path.length)?'talk':null);}
  for(const p of livesWith())if(!p.away)add(p,p.ch,1,p.n,null);
  for(const k of S.kids||[]){const a=kidAge(k);if(a<1){const [u,v]=w2v(k.x,k.y);out.push({k:u+v,f:()=>{const [px,py]=P(u,v);emoji('👶',px,py-8,16);}});}else add(k,k.ch,Math.min(.95,.45+a*.03),k.n,null);}
  return out;}
// ---------- panel ----------
function genteTab(){
  const L0=life(),p=partner();let h=`<h3>❤️ Su vida amorosa</h3>`;
  h+=`<div class="kv"><span>Orientación</span><span>${ORIENT[L0.orient]}</span></div><div class="kv"><span>Pareja</span><span>${LIFE.pareja[L0.pareja]}</span></div><div class="kv"><span>Hijos</span><span>${LIFE.hijos[L0.hijos]}</span></div><div class="kv"><span>Casarse</span><span>${LIFE.boda[L0.boda]}</span></div>`;
  h+=`<button class="btn grey" id="lifeedit">✏️ Cambiar lo que quiere en la vida</button>`;
  if(p){h+=`<div class="pcard big"><canvas width="120" height="120" data-pp="${p.id}"></canvas><div style="flex:1"><b>${ST_E[p.st]} ${p.n}, ${p.age}</b><div class="sub" style="font-size:12px">${ST_N[p.st]} desde el día ${p.since||p.met} · ${IDEOS[p.ideo].e} ${IDEOS[p.ideo].n}${p.home?' · vive en casa':''}</div>
      <div class="skill"><span class="lbl" style="width:62px">💞 Feliz</span><div class="bar"><i style="width:${p.hap}%;background:#e88aa8"></i></div></div></div></div>`;
    h+=`<div class="acts">${!p.home?`<button class="mini" data-pa="vivir" data-pid="${p.id}">🏡 Vivir juntos</button>`:''}${p.st==='pareja'?`<button class="mini" data-pa="boda" data-pid="${p.id}">💍 Pedir matrimonio</button>`:''}${p.st==='prometida'?`<button class="mini" data-wed="0" data-pid="${p.id}">💒 Boda sencilla (${fmt(Math.round(180*PM()))})</button><button class="mini" data-wed="1" data-pid="${p.id}">🎉 Bodorrio (${fmt(Math.round(1400*PM()))})</button>`:''}${!S.baby&&p.home?`<button class="mini" data-pa="bebe" data-pid="${p.id}">👶 Buscar un bebé</button>`:''}<button class="mini" data-pa="romper" data-pid="${p.id}">💔 Romper</button></div>`;}
  if(S.baby)h+=`<div class="quote">🍼 ${S.baby.adopt?'Adopción en marcha':'Bebé en camino'}: llega en ${S.baby.due-S.day} días.</div>`;
  if((S.kids||[]).length){h+=`<h3>👨‍👩‍👧 Hijos</h3>`;for(const k of S.kids){h+=`<div class="skill"><span class="lbl" style="width:auto;min-width:110px">${kidAge(k)<1?'👶':'🧒'} ${k.n} · ${kidAge(k)} años</span><div class="bar"><i style="width:${k.care}%;background:#7cc8f0"></i></div><button class="mini" data-kid="${k.id}">🧸 Cuidar</button></div>`;}h+=`<div class="sub" style="font-size:11.5px">Cuestan ${fmt(kidCost())}/semana. Con la pareja en casa se reparten los cuidados.</div>`;}
  h+=`<h3>🫂 Gente</h3><button class="btn" id="appbtn">📱 Abrir app de citas</button>`;
  const list=(S.people||[]).filter(q=>q!==p).sort((a,b)=>(b.rom+b.rel)-(a.rom+a.rel));
  for(const q of list){const rom=canRomance(q);h+=`<div class="prow"><div class="ph"><b>${q.e&&q.k!=='conocido'?q.e:ST_E[q.st]||'👤'} ${q.n}</b> <small>${q.k==='madre'||q.k==='vecina'||q.k==='compi'||q.k==='amiga'?q.r:ST_N[q.st]+(q.where?' · '+q.where.replace(/^en /,''):'')}</small></div>
      <div class="pbars"><span>🫶</span><div class="bar"><i style="width:${q.rel}%;background:#7cc49a"></i></div>${rom?`<span>💘</span><div class="bar"><i style="width:${q.rom||0}%;background:#e88aa8"></i></div>`:''}</div>
      <div class="acts"><button class="mini" data-pa="hablar" data-pid="${q.id||q.k}">☎️</button><button class="mini" data-pa="quedar" data-pid="${q.id||q.k}">🍻 Quedar</button><button class="mini" data-pa="invitar" data-pid="${q.id||q.k}">🏠 Invitar</button>${rom&&q.st!=='ex'?`<button class="mini" data-pa="ligar" data-pid="${q.id}">💘 Ligar</button>`:''}${rom&&(q.rom||0)>=40&&q.st!=='rollo'?`<button class="mini" data-pa="rollo" data-pid="${q.id}">🔥 Rollo</button>`:''}${rom&&(q.rom||0)>=55&&!p?`<button class="mini" data-pa="pareja" data-pid="${q.id}">❤️ Pedir salir</button>`:''}${q.st==='rollo'?`<button class="mini" data-pa="romper" data-pid="${q.id}">✋ Dejarlo</button>`:''}</div></div>`;}
  return h;
}
function personBy(idk){return (S.people||[]).find(q=>String(q.id)===String(idk)||q.k===idk);}
function ensureIds(){for(const q of S.people||[])if(!q.id){q.id=(S.pidSeq=(S.pidSeq||100)+1);if(!q.ch){const ch=randomChar();q.g=q.g==='a'?'f':q.g==='o'?'m':q.g||(q.k==='madre'?'f':pickR(['f','m']));ch.g=q.g;ch.name=q.n;if(q.k==='madre'){ch.age=(CH().age||27)+28;ch.hair='#bdbdbd';ch.style='mono';ch.beard='no';}q.ch=ch;q.orient=q.orient||'hetero';q.ideo=q.ideo||pickR(IDEO_ORDER);q.kids=q.kids||'nose';q.boda=q.boda||'igual';q.chem=q.chem??Math.random();q.rom=q.rom||0;q.st=q.st||(q.k==='amiga'?'amistad':'conocido');q.age=q.age||ch.age;}}}
function bindGente(){
  card.querySelectorAll('[data-pp]').forEach(c=>{const q=PP(+c.dataset.pp);if(q)paintPortrait(c,q.ch,q.hap||65);});
  const on=(s,f)=>{const e=card.querySelector(s);if(e)e.onclick=f;};
  on('#appbtn',()=>datingApp(false));on('#lifeedit',()=>openLifeEdit());
  card.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{const q=personBy(b.dataset.pid);if(!q)return;const a=b.dataset.pa;
    if(a==='hablar')talkTo(q);else if(a==='quedar'){menu.classList.remove('open');askOut(q,q.st==='cita'||q.st==='pareja'||q.st==='rollo'?'cita':'amigos');return;}
    else if(a==='invitar'){menu.classList.remove('open');inviteHome(q);return;}else if(a==='ligar')flirt(q);else propose(q,a);openMenu('gente');});
  card.querySelectorAll('[data-wed]').forEach(b=>b.onclick=()=>{const q=PP(+b.dataset.pid);if(q)wedding(q,b.dataset.wed==='1');openMenu('gente');});
  card.querySelectorAll('[data-kid]').forEach(b=>b.onclick=()=>{const k=(S.kids||[]).find(x=>x.id===+b.dataset.kid);if(k)careKid(k);openMenu('gente');});
}
function openLifeEdit(){const L0=life();const ch=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${L0[key]===k?' sel':''}" data-lk="${key}" data-lv="${k}">${v}</button>`).join('')}</div>`;
  let h=`<h2>Lo que quiere en la vida</h2><div class="clab">Orientación</div>${ch('orient',ORIENT)}<div class="clab">Pareja</div>${ch('pareja',LIFE.pareja)}<div class="clab">Hijos</div>${ch('hijos',LIFE.hijos)}<div class="clab">Casarse</div>${ch('boda',LIFE.boda)}<button class="btn" id="lifeok">Listo</button>`;
  card.innerHTML=h;card.querySelectorAll('[data-lk]').forEach(b=>b.onclick=()=>{L0[b.dataset.lk]=b.dataset.lv;openLifeEdit();});card.querySelector('#lifeok').onclick=()=>openMenu('gente');}
