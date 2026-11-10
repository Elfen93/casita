// =================== RASGOS AMPLIADOS ===================
Object.assign(TRAITS,{
  multitarea:{n:'Multitarea',e:'🔀',cat:'mente',d:'Hace varias cosas a la vez: aprende un poco de todo más rápido, pero se dispersa y a veces se le olvida algo.'},
  milideas:{n:'Mil ideas',e:'💡',cat:'mente',d:'Siempre tiene un proyecto nuevo en la cabeza. Le sobra creatividad, le cuesta acabar: cambia de plan a menudo.',no:'constante'},
  constante:{n:'Constante',e:'🧱',cat:'mente',d:'Lo que empieza, lo acaba. Termina antes las obras y sus planes no cambian.',no:'milideas'},
  curiosa:{n:'Curiosa',e:'🔎',cat:'mente',d:'Quiere entenderlo todo: lee, pregunta y aprende lógica más rápido.'},
  dondegentes:{n:'Don de gentes',e:'🤝',cat:'gente',d:'Sabe tratar con la gente aunque no la busque: carisma más rápido, negocia y liga mejor.'},
  romantica:{n:'Romántica',e:'💘',cat:'gente',d:'Se enamora con facilidad y cuida mucho a su pareja. Las rupturas le duelen el doble.'},
  independiente:{n:'Independiente',e:'🧭',cat:'gente',d:'No necesita a nadie para estar bien. Echa menos de menos y le pesa menos estar sola.'},
  fiestera:{n:'Fiestera',e:'🎉',cat:'estilo',d:'Le encanta salir: queda con amigos a menudo y se divierte más fuera… y gasta más.',no:'casera'},
  casera:{n:'Casera',e:'🛋️',cat:'estilo',d:'Donde mejor está es en casa. Sale poco y disfruta más del sofá, la cocina y sus cosas.',no:'fiestera'},
  deportista:{n:'Deportista',e:'🏃',cat:'estilo',d:'Necesita moverse: sale a correr a menudo, se cansa menos y enferma menos.'},
  nocturna:{n:'Nocturna',e:'🦉',cat:'estilo',d:'Rinde de noche y le cuesta madrugar. Se acuesta tarde y se despierta peor.',no:'madrugadora'},
  madrugadora:{n:'Madrugadora',e:'🐓',cat:'estilo',d:'Se levanta con energía y llega pronto, pero por la noche se apaga.',no:'nocturna'},
  optimista:{n:'Optimista',e:'🌤️',cat:'animo',d:'Ve el vaso medio lleno: su ánimo aguanta mejor los golpes.',no:'pesimista'},
  pesimista:{n:'Pesimista',e:'🌧️',cat:'animo',d:'Espera lo peor. Su ánimo baja antes, pero los golpes la pillan preparada: ahorra un poco más.',no:'optimista'},
  impulsiva:{n:'Impulsiva',e:'⚡',cat:'animo',d:'Decide en caliente: liga, compra y se planta sin pensarlo mucho. A veces sale bien.'},
  tozuda:{n:'Tozuda',e:'🐂',cat:'animo',d:'Cuesta muchísimo que cambie de ideas, para bien y para mal.'}});
Object.assign(TRAITS.trabajadora,{cat:'trabajo'});Object.assign(TRAITS.perezosa,{cat:'trabajo'});Object.assign(TRAITS.puntual,{cat:'trabajo'});Object.assign(TRAITS.despistada,{cat:'trabajo'});Object.assign(TRAITS.manitas,{cat:'trabajo'});
Object.assign(TRAITS.ahorradora,{cat:'dinero'});Object.assign(TRAITS.derrochadora,{cat:'dinero'});
Object.assign(TRAITS.sociable,{cat:'gente'});Object.assign(TRAITS.solitaria,{cat:'gente'});
Object.assign(TRAITS.cocinillas,{cat:'estilo'});Object.assign(TRAITS.naturaleza,{cat:'estilo'});Object.assign(TRAITS.artista,{cat:'mente'});Object.assign(TRAITS.ordenada,{cat:'estilo'});
const TRAIT_CATS=[['trabajo','💼 Trabajo'],['dinero','💰 Dinero'],['gente','🫂 Con la gente'],['mente','🧠 Cabeza'],['estilo','🏡 Estilo de vida'],['animo','🌦️ Carácter']];
const TRAIT_MAX=5;
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
