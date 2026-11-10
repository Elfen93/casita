// ---------- efectos ----------
{const _xp=traitXP;traitXP=function(k){let m=_xp(k);if(T('multitarea'))m*=1.15;if(T('curiosa')&&k==='logica')m*=1.35;if(T('dondegentes')&&k==='carisma')m*=1.6;if(T('milideas')&&(k==='musica'||k==='logica'))m*=1.2;return m;};}
{const _b=traitBoost;traitBoost=function(type){let b=_b(type);if(T('casera')&&['sofa','tele','fogon','libros','compu','guitarra','planta'].includes(type))b*=1.3;if(T('curiosa')&&(type==='libros'||type==='compu'))b*=1.25;return b;};}
{const dE=TRAIT_DECAY.energia;TRAIT_DECAY.energia=()=>{let f=dE();if(T('deportista'))f*=.9;const h=S.t/60;if(T('nocturna'))f*=h>=21||h<2?.75:h>=6&&h<11?1.3:1;if(T('madrugadora'))f*=h>=5&&h<12?.8:h>=21?1.3:1;return f;};
 const dS=TRAIT_DECAY.social;TRAIT_DECAY.social=()=>dS()*(T('independiente')?.7:1)*(T('fiestera')?1.2:1);}
{const _m=mood;mood=function(){let v=_m();if(T('optimista'))v=v+(100-v)*.08;if(T('pesimista'))v-=4;return v;};}
{const _lt=leaveTime;leaveTime=function(){let t=_lt();if(T('madrugadora'))t-=.25;if(T('nocturna')&&Math.random()<.25)t+=.3;if(T('multitarea')&&Math.random()<.08)t+=.4;return t;};}
// salir más o menos
{const _out=maybeOuting;maybeOuting=function(){if(T('casera')&&Math.random()<.45)return false;if(T('fiestera')&&!outAvail('amigos')&&Math.random()<.12&&S.outDay!==S.day){const nd=S.needs;if(nd.energia>30&&nd.hambre>25&&outCost('amigos')<=spare()){doOut('amigos');return true;}}
  if(T('deportista')&&!outAvail('deporte')&&Math.random()<.1&&S.outDay!==S.day&&!['lluvia','tormenta','nieve'].includes((S.weather||{}).k)&&S.needs.energia>35){doOut('deporte');return true;}return _out.apply(this,arguments);};}
// cambiar de ideas
{const _dw=driftWeekly;driftWeekly=function(){if(T('tozuda')){const c=ex();for(const k in c.drift)if(k!==S.ideo)c.drift[k]*=.85;}return _dw.apply(this,arguments);};}
// amor
{const _f=flirt;flirt=function(p){if((T('dondegentes')||T('impulsiva'))&&p&&p.love!=null)p.love=Math.min(100,p.love+(T('dondegentes')?6:3));return _f.apply(this,arguments);};}
{const _bu=breakUp;breakUp=function(p){const r=_bu.apply(this,arguments);if(T('romantica')){S.needs.diversion=Math.max(0,S.needs.diversion-30);ex().exp.stress++;}if(T('independiente'))S.needs.social=Math.min(100,S.needs.social+15);return r;};}
{const _tk=talkTo;talkTo=function(p){_tk.apply(this,arguments);if(T('romantica')&&p&&['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+2);if(T('dondegentes')&&p)p.rel=Math.min(100,p.rel+3);};}
// pedir aumento
{const _ar=askRaise;askRaise=function(manual){if(T('dondegentes')||T('impulsiva')){const ch=S.skills&&S.skills.carisma;}const save=ID().neg;if(T('dondegentes'))IDEOS[S.ideo||'apolitica'].neg=save+.05;try{return _ar.apply(this,arguments);}finally{IDEOS[S.ideo||'apolitica'].neg=save;}};}
// Mil ideas / constante: los planes
function ideasWeekly(){
  if(T('milideas')&&S.want&&Math.random()<.35){const old=S.want.name;S.want=null;tell(pickR([`Ana ha dejado aparcado lo de «${old}». Ahora tiene otra idea mucho mejor. O eso cree.`,`«${old}» ya no le ilusiona. Ha llenado media libreta con un proyecto nuevo.`,`Tres pestañas abiertas, dos libretas empezadas y una idea nueva a las dos de la mañana. Lo de «${old}» puede esperar.`]),'💡');}
  if(T('milideas')&&Math.random()<.25){S.needs.diversion=Math.min(100,S.needs.diversion+10);gainSkill(pickR(['logica','musica','carisma']),1.5);}
  if(T('multitarea')&&Math.random()<.18)tell(pickR(['Ana ha cocinado, contestado tres correos y puesto una lavadora a la vez. Se le ha quemado el arroz.','Hoy Ana ha hecho mil cosas a medias. Mañana, otras mil.','Podcast, fregar y repasar las cuentas: todo a la vez. Ana no sabe estar quieta.']),'🔀');
  if(T('pesimista')&&S.money>0)S.money+=Math.round(weeklyRent()*.03);}
{const _cw=conexWeekly;conexWeekly=function(){_cw.apply(this,arguments);try{ideasWeekly();}catch(e){console.error(e);}};}
// pensamientos
{const _tc=thoughtCandidates;thoughtCandidates=function(){const c=_tc.apply(this,arguments);const add=(t,w=1)=>c.push([t,w]);
  if(T('milideas'))add(pickR(['¿Y si monto una app para eso?','Tengo una idea buenísima. Otra.','Apuntar en la libreta: idea nº 47.']),.8);
  if(T('multitarea'))add(pickR(['¿Dónde había dejado el móvil?','Ya que estoy, hago también lo otro.']),.6);
  if(T('independiente'))add(pickR(['Se está bien sola.','No necesito a nadie para pasarlo bien.']),.4);
  if(T('dondegentes')&&T('solitaria'))add('Me cae bien la gente… a ratos.',.6);
  if(T('optimista'))add('Saldrá bien. Seguro.',.4);if(T('pesimista'))add('Algo saldrá mal. Siempre sale.',.4);
  if(T('nocturna')&&S.t/60<9)add('Café. Ya. Por favor.',1);if(T('madrugadora')&&S.t/60<8)add('¡Qué bien se está a estas horas!',.8);
  return c;};}

// =================== ASPIRACIONES: objetivos que salen del personaje ===================
const ASP_N=5;
const aspS=()=>{if(!S.asp)S.asp={active:[],done:{},base:{},next:0};return S.asp;};
const stat=k=>(S.stats&&S.stats[k])||0;
const chapDone=pre=>Object.keys(storyState().chap).some(k=>k===pre||k.startsWith(pre));
const relCount=n=>(S.people||[]).filter(p=>p.stage!=='ex'&&/^p/.test(p.k)&&p.rel>=n).length;
const ASP=[
  // ---- trabajo ----
  {id:'ascenso',c:'trabajo',e:'📈',t:()=>`Conseguir un ascenso en ${S.office?office().n:'el trabajo'}`,w:()=>S.career+1<CAREER.length&&!S.jobless&&!TR().gig?(T('trabajadora')?3:isLeft()&&comp()>=3?.3:1):0,start:()=>S.career,ok:b=>S.career>b,r:1.2},
  {id:'cima',c:'trabajo',e:'🏔️',t:()=>`Llegar a ${L(CAREER[CAREER.length-1].t).toLowerCase()}`,w:()=>T('trabajadora')||isI('liberal','libertaria')?1.5:.2,ok:()=>S.career>=CAREER.length-1,r:4},
  {id:'huir',c:'trabajo',e:'🚪',t:()=>`Salir de ${S.office?office().n:'este trabajo'}: aquí no se puede seguir`,w:()=>!S.jobless&&!TR().self&&TOX()>.6?3:0,start:()=>S.office?office().n:'',ok:b=>S.office&&office().n!==b&&!S.jobless,r:1.5},
  {id:'aumento',c:'trabajo',e:'💶',t:()=>'Arrancar una subida de sueldo',w:()=>!S.jobless&&!TR().self?(T('dondegentes')||T('impulsiva')?2:1):0,start:()=>S.payMul||1,ok:b=>(S.payMul||1)>b*1.02,r:1},
  {id:'trabajo',c:'trabajo',e:'📝',t:()=>'Encontrar trabajo',w:()=>S.jobless?6:0,ok:()=>!S.jobless,r:1},
  {id:'opos',c:'trabajo',e:'📚',t:()=>'Aprobar unas oposiciones',w:()=>S.opos&&S.opos.on?4:isI('conservadora','socialdemocrata')&&T('constante')?.8:0,ok:()=>!!S.oposPassed,r:3},
  {id:'negocio',c:'trabajo',e:'🏪',t:()=>'Montar su propio negocio',w:()=>S.track!=='negocio'&&(isI('libertaria','liberal')||T('milideas')||T('impulsiva'))?1.4:0,ok:()=>S.track==='negocio',r:2},
  {id:'coop',c:'trabajo',e:'🤝',t:()=>'Trabajar sin jefes, en una cooperativa',w:()=>S.track!=='coop'&&isI('anarquista','ecologista')?1.6:0,ok:()=>S.track==='coop',r:2},
  {id:'puntual',c:'trabajo',e:'⏰',t:()=>'Un mes sin llegar tarde ni faltar',w:()=>!S.jobless&&(T('despistada')||T('nocturna'))?1.5:0,start:()=>[S.absences||0,S.day],ok:b=>(S.absences||0)===b[0]&&S.day-b[1]>=30,r:1},
  // ---- dinero ----
  {id:'colchon',c:'dinero',e:'🐷',t:()=>`Tener un colchón de ${fmt(weeklyRent()*8)}`,w:()=>S.money<weeklyRent()*8?(T('ahorradora')||T('pesimista')?3:1):0,ok:()=>S.money>=weeklyRent()*8,r:1.5},
  {id:'rojos',c:'dinero',e:'🆘',t:()=>'Salir de los números rojos',w:()=>S.money<0?6:0,ok:()=>S.money>=weeklyRent(),r:1},
  {id:'casa',c:'dinero',e:'🔑',t:()=>'Comprar la casa',w:()=>!S.owned?(isI('conservadora','liberal')||T('ahorradora')?2:.4):0,ok:()=>!!S.owned,r:5},
  {id:'capricho',c:'dinero',e:'🛍️',t:()=>'Darse un capricho Premium',w:()=>T('derrochadora')||T('impulsiva')?2:.3,start:()=>count(i=>S.obj[i]&&S.obj[i].q===4),ok:b=>count(i=>S.obj[i]&&S.obj[i].q===4)>b,r:.8},
  // ---- gente ----
  {id:'amigos3',c:'gente',e:'🫂',t:()=>'Hacer tres amistades de verdad en el barrio',w:()=>relCount(60)<3?(T('sociable')||T('fiestera')?3:T('solitaria')?.4:1):0,ok:()=>relCount(60)>=3,r:1.2},
  {id:'unaamiga',c:'gente',e:'☕',t:()=>'Encontrar una persona con la que hablar de todo',w:()=>T('solitaria')&&relCount(70)<1?2:0,ok:()=>relCount(70)>=1,r:1},
  {id:'pareja',c:'gente',e:'❤️',t:()=>'Encontrar pareja',w:()=>{const L_=LIFE();return !partner()&&L_.orient!=='nadie'&&L_.rel==='estable'?(T('romantica')?3:1.5):0;},ok:()=>!!partner(),r:1.5},
  {id:'juntos',c:'gente',e:'🏠',t:()=>{const p=partner();return `Irse a vivir con ${p?p.n:'su pareja'}`;},w:()=>{const p=partner();return p&&p.stage==='pareja'&&LIFE().rel==='estable'?2:0;},ok:()=>!!liveIn(),r:1.5},
  {id:'boda',c:'gente',e:'💍',t:()=>{const p=partner();return `Casarse con ${p?p.n:'su pareja'}`;},w:()=>{const p=partner();return p&&p.stage==='convive'&&LIFE().boda==='si'?2:0;},ok:()=>{const p=partner();return p&&p.stage==='casada';},r:2},
  {id:'hijo',c:'gente',e:'👶',t:()=>'Tener un hijo o una hija',w:()=>LIFE().kids==='si'&&!(S.kids||[]).length?((CH().age||27)>=30?2.5:1):0,ok:()=>(S.kids||[]).length>0||!!S.baby,r:2},
  {id:'madre',c:'gente',e:'👩‍🦳',t:()=>{const m=P_('madre');return `Arreglar las cosas con ${m?m.n:'su madre'}`;},w:()=>{const m=P_('madre');return m&&m.rel<50?2.5:0;},ok:()=>{const m=P_('madre');return m&&m.rel>=70;},r:1},
  {id:'vecina',c:'gente',e:'🏘️',t:()=>{const v=P_('vecina');return `Ganarse a ${v?v.n:'la vecina'}`;},w:()=>{const v=P_('vecina');return v&&v.rel<60?.8:0;},ok:()=>{const v=P_('vecina');return v&&v.rel>=70;},r:.7},
  {id:'soltera',c:'gente',e:'🧭',t:()=>'Dos meses de soltería feliz',w:()=>!partner()&&(T('independiente')||LIFE().rel==='soltera')?2:0,start:()=>S.day,ok:b=>!partner()&&S.day-b>=60&&mood()>55,r:1},
  {id:'fiestas',c:'gente',e:'🎉',t:()=>'Salir diez veces con amigos',w:()=>T('fiestera')||T('sociable')?2:.3,start:()=>stat('outAmigos'),ok:b=>stat('outAmigos')-b>=10,r:1},
  // ---- política ----
  {id:'afiliarse',c:'politica',e:'🪪',t:()=>'Afiliarse al sindicato',w:()=>!(S.union&&S.union.member)&&!TR().self&&(isLeft()||isI('socialdemocrata'))?2.5:0,ok:()=>!!(S.union&&S.union.member),r:.8},
  {id:'huelgaW',c:'politica',e:'✊',t:()=>'Ganar una huelga',w:()=>isLeft()&&comp()>=2&&!TR().self?2.5:0,ok:()=>chapDone('huelgaW'),r:3},
  {id:'organizar',c:'politica',e:'🗣️',t:()=>`Organizar a media plantilla de ${S.office?office().n:'su trabajo'}`,w:()=>isLeft()&&!S.jobless&&!TR().self&&office().org<50?2:0,ok:()=>!S.jobless&&office().org>=50,r:2},
  {id:'influencia',c:'politica',e:'📣',t:()=>'Que su nombre suene en el barrio (influencia 30)',w:()=>S.ideo!=='apolitica'&&(S.pol.inf||0)<30&&comp()>=2?(T('lider')?2.5:1):0,ok:()=>(S.pol.inf||0)>=30,r:2},
  {id:'concejala',c:'politica',e:'🏛️',t:()=>'Ir en las listas municipales',w:()=>isI('socialdemocrata','conservadora','liberal','ecologista')&&!S.pol.cand?1.2:0,ok:()=>!!S.pol.cand,r:3},
  {id:'desahucio',c:'politica',e:'🚪',t:()=>'Parar un desahucio',w:()=>isI('anarquista','marxista')?1.2:0,ok:()=>chapDone('desahucio'),r:2.5},
  {id:'convencer',c:'politica',e:'💬',t:()=>{const p=partner();return `Que ${p?p.n:'su pareja'} se implique también`;},w:()=>{const p=partner();return p&&S.ideo!=='apolitica'&&p.ideo!==S.ideo&&comp()>=2?1.5:0;},ok:()=>{const p=partner();return p&&p.ideo===S.ideo;},r:1.5},
  {id:'despolitizar',c:'politica',e:'🫥',t:()=>'Desconectar: un mes sin asambleas ni telediario',w:()=>T('cinica')&&S.ideo!=='apolitica'?1.5:0,start:()=>S.day,ok:b=>S.day-b>=30,r:.7},
  // ---- cabeza y aficiones ----
  {id:'musica',c:'aficion',e:'🎸',t:()=>'Tocar la guitarra de verdad (música 5)',w:()=>lvl('musica')<5?(T('artista')?3:T('milideas')?1:.2):0,ok:()=>lvl('musica')>=5,r:1.5},
  {id:'cocina',c:'aficion',e:'🍳',t:()=>'Cocinar como su abuela (cocina 5)',w:()=>lvl('cocina')<5?(T('cocinillas')?3:T('casera')?1.2:.3):0,ok:()=>lvl('cocina')>=5,r:1.2},
  {id:'logica',c:'aficion',e:'🧠',t:()=>'Estudiar algo a fondo (lógica 6)',w:()=>lvl('logica')<6?(T('curiosa')?3:T('milideas')?1.2:.3):0,ok:()=>lvl('logica')>=6,r:1.5},
  {id:'carisma',c:'aficion',e:'🗣️',t:()=>'Saber hablar en público (carisma 6)',w:()=>lvl('carisma')<6?(T('dondegentes')||T('lider')?2:.5):0,ok:()=>lvl('carisma')>=6,r:1.5},
  {id:'forma',c:'aficion',e:'🏃',t:()=>'Ponerse en forma',w:()=>(S.fit||0)<60?(T('deportista')?3:.4):0,ok:()=>(S.fit||0)>=60,r:1},
  {id:'huerto',c:'aficion',e:'🥕',t:()=>'Comer de su propio huerto',w:()=>T('naturaleza')||isI('ecologista')?2:.3,start:()=>stat('harvest'),ok:b=>stat('harvest')-b>=10,r:1.2},
  {id:'manitas',c:'aficion',e:'🔨',t:()=>'Dominar un oficio (nivel 5)',w:()=>T('manitas')?2.5:T('multitarea')?1:.3,ok:()=>['carp','elec','font','alba','jard'].some(k=>lvl(k)>=5),r:1.5},
  {id:'todoterreno',c:'aficion',e:'🔀',t:()=>'Saber un poco de todo (nivel 3 en cinco habilidades)',w:()=>T('multitarea')?3:0,ok:()=>SKILLS.filter(([k])=>lvl(k)>=3).length>=5,r:2},
  {id:'acabar',c:'aficion',e:'🏁',t:()=>'Acabar un proyecto sin cambiar de idea',w:()=>T('milideas')?3:0,start:()=>stat('built'),ok:b=>stat('built')>b,r:2},
  {id:'obra',c:'aficion',e:'🏗️',t:()=>S.want?`Hacer realidad: ${S.want.name.toLowerCase()}`:'Terminar una obra en casa',w:()=>T('constante')||T('casera')?2:.6,start:()=>stat('built'),ok:b=>stat('built')>b,r:1},
  // ---- ánimo ----
  {id:'semana',c:'animo',e:'😄',t:()=>'Una semana entera de buen humor',w:()=>T('pesimista')||T('ansiosa')||T('cinica')?2:.6,start:()=>S.day,ok:b=>(S.asp.streak||0)>=7&&S.day-b>=7,r:1.2},
  {id:'descanso',c:'animo',e:'🏖️',t:()=>'Coger unas vacaciones',w:()=>!S.jobless&&(S.vac||0)>=3?1:0,start:()=>(S.vacDays||[]).length,ok:b=>(S.vacDays||[]).length>b,r:.8}];
const ASP_CAT={trabajo:'💼',dinero:'💰',gente:'🫂',politica:'✊',aficion:'🎨',animo:'🌤️'};
function aspFill(){const A=aspS();A.active=A.active.filter(id=>ASP.some(a=>a.id===id));
  while(A.active.length<ASP_N){const used=new Set(A.active),cats=new Set(A.active.map(id=>ASP.find(a=>a.id===id).c));
    const cand=ASP.filter(a=>!used.has(a.id)&&!(A.done[a.id]&&S.day-A.done[a.id]<60)).map(a=>{let w=0;try{w=a.w();}catch(e){}if(w>0&&cats.has(a.c))w*=.45;if(w>0){try{if(!a.start&&a.ok())w=0;}catch(e){w=0;}}return [a,w];}).filter(x=>x[1]>0);
    if(!cand.length)break;let tot=cand.reduce((s,x)=>s+x[1],0),r=Math.random()*tot,pick=cand[0][0];for(const [a,w] of cand){r-=w;if(r<=0){pick=a;break;}}
    A.active.push(pick.id);A.base[pick.id]=pick.start?pick.start():null;}}
function aspCheck(){const A=aspS();if(!A.active.length)aspFill();
  for(const id of [...A.active]){const a=ASP.find(x=>x.id===id);if(!a)continue;let ok=false;try{ok=a.ok(A.base[id]);}catch(e){}
    if(ok){A.active=A.active.filter(x=>x!==id);A.done[id]=S.day;A.count=(A.count||0)+1;const gr=Math.round(WP()*a.r*Dm().goal*1.4);S.money+=gr;bumpMoney();unseen++;if(!S.sim.work)confetti(S.sim.x,S.sim.y,50);
      tell(`${a.t()}. Lo ha conseguido.`,a.e,'big');toast(`🎯 ${a.t()}`,true);sfx('level');aspFill();}}
  // abandonar los que ya no tienen sentido
  for(const id of [...A.active]){const a=ASP.find(x=>x.id===id);let w=1;try{w=a.w();}catch(e){}if(w===0&&!a.start){A.active=A.active.filter(x=>x!==id);aspFill();}}}
function aspDaily(){const A=aspS();A.streak=mood()>62?(A.streak||0)+1:0;if(T('milideas')&&A.active.length&&Math.random()<.05){const id=A.active[Math.random()*A.active.length|0];A.active=A.active.filter(x=>x!==id);aspFill();}}
// contadores que usan las aspiraciones
{const _go=goOut;goOut=function(k){if(k==='amigos'){S.stats=S.stats||{};S.stats.outAmigos=(S.stats.outAmigos||0)+1;}return _go.apply(this,arguments);};}
function aspBlock(){const A=aspS();aspFill();let h=`<h3>🎯 Lo que ${CH().name} quiere ahora</h3><div class="sub" style="font-size:11.5px;margin-bottom:4px">Salen de su carácter, sus ideas y su vida. Cuando cumple una, aparece otra.</div>`;
  for(const id of A.active){const a=ASP.find(x=>x.id===id);if(!a)continue;h+=`<div class="goal"><span>${a.e}</span><span>${a.t()}</span><span class="r">+${fmt(Math.round(WP()*a.r*Dm().goal*1.4))}</span></div>`;}
  const n=A.count||0;if(n)h+=`<div class="sub" style="font-size:11.5px">✅ ${n} cumplida${n>1?'s':''} hasta ahora.</div>`;
  const house=GOALS.filter(g=>!S.goals[g.id]).slice(0,3);
  if(house.length)h+=`<h3>🏠 Ideas para la casa</h3>`+house.map(g=>`<div class="goal"><span>⬜</span><span>${g.t}</span><span class="r">+${fmt(Math.round(g.r*Dm().goal))}</span></div>`).join('')+`<div class="sub" style="font-size:11.5px">${GOALS.filter(g=>S.goals[g.id]).length} de ${GOALS.length} hechas.</div>`;
  return h;}
{const _ty=tally;tally=function(k,v){S.stats=S.stats||{};if(k==='built')S.stats.built=(S.stats.built||0)+1;if(k==='harvest'){const prev=(S.today&&S.today.harvest)||0;S.stats.harvest=(S.stats.harvest||0)+Math.max(0,(v||0)-prev);}return _ty.apply(this,arguments);};}
{const _cg=checkGoals;checkGoals=function(){try{aspCheck();}catch(e){console.error(e);}return _cg.apply(this,arguments);};}

// =================== VIVIENDA: de la habitación compartida al chalet ===================
const HOMES={
  padres:{n:'En casa de su madre',e:'👩‍🦳',rent:45,build:'objs',buy:false,need:0,cls:0,d:'Su cuarto de siempre. No paga alquiler, solo pone algo para la compra. Cero intimidad, mucha compañía.',start:'vuelve a vivir en casa de su madre, en el cuarto de cuando era adolescente'},
  infra:{n:'Bajo interior',e:'🏚️',rent:105,build:'objs',buy:false,need:0,cls:1,damp:true,d:'Un cuarto sin luz con humedades. El casero no arregla nada y no hay contrato. Lo más barato que hay.',start:'acaba de meterse en un bajo interior sin contrato, con moho en las esquinas'},
  habitacion:{n:'Habitación en piso compartido',e:'🚪',rent:150,build:'objs',buy:false,need:0,cls:1,mates:2,d:'Una habitación para ella y el resto a compartir con dos desconocidos: cocina, baño y turnos de limpieza.',start:'acaba de alquilar una habitación en un piso compartido con dos desconocidos'},
  viejo:{n:'Piso viejo de alquiler',e:'🏢',rent:270,build:'objs',buy:true,price:9000,need:2.4,cls:2,d:'Un piso pequeño de los setenta: muebles cansados, ventanas que no cierran bien. Es suyo por dentro.',start:'acaba de alquilar un piso viejo de los setenta, pequeño y con muebles cansados'},
  casita:{n:'Casita con terreno',e:'🏡',rent:350,build:'all',buy:true,price:12000,need:2.6,cls:2,d:'Una casita pequeña con mucho terreno alrededor para ampliar, construir y plantar.',start:'acaba de mudarse a una casita de alquiler con lo justo: una cama, una nevera, una ducha y un váter'},
  bueno:{n:'Piso cómodo céntrico',e:'🏙️',rent:640,build:'objs',buy:true,price:26000,need:2.8,cls:3,d:'Tres habitaciones, buenos muebles, calefacción que funciona y portero. Caro, cómodo y lejos de los problemas.',start:'acaba de mudarse a un piso cómodo en el centro, con calefacción y portero'},
  chalet:{n:'Chalet con piscina',e:'🏊',rent:1350,build:'all',buy:true,price:60000,need:3,cls:4,d:'Casa grande con jardín, piscina y barbacoa. Para quien puede permitírselo.',start:'acaba de instalarse en un chalet con jardín y piscina'}};
const HOME_ORDER=['padres','infra','habitacion','viejo','casita','bueno','chalet'];
const HT=()=>HOMES[(S&&S.home&&S.home.type)||'casita'];
const homeArea=()=>(S&&S.home&&S.home.area)||[0,0,N-1,N-1];
function inArea(x,y){const a=homeArea();return x>=a[0]&&y>=a[1]&&x<=a[2]&&y<=a[3];}
