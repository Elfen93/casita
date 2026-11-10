// =================== CONEXIONES: rasgos ocultos, desgaste, clase, cambio de ideas y consecuencias ===================
// ---------- utilidades ----------
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LEVEL_BOSS=/Encargad|Jef|Gerente|Supervisor|Coordinador|Director/;
function isBoss(){return !S.jobless&&!TR().self&&!TR().coop&&LEVEL_BOSS.test((CAREER[S.career]||{}).t||'');}
function classOf(){if(TR().self)return S.career>=1?'patrona':'autonoma';if(S.jobless)return 'parada';if(isBoss())return 'mando';if(S.rentier)return 'rentista';
  if(TR().gig||['super','hosteleria','reparto','cuidados','obra'].includes(S.track)&&S.career<=1)return 'precaria';return 'asalariada';}
const CLASSN={patrona:'patrona',autonoma:'autónoma',parada:'en paro',mando:'mando intermedio',rentista:'rentista',precaria:'trabajadora precaria',asalariada:'asalariada'};
const isLeft=k=>LEFT.includes(k||S.ideo),isRight=k=>RIGHT.includes(k||S.ideo);
const RICHJOB=new Set(['abogada','programadora','diseñadora']);
const ex=()=>S.cx||(S.cx={drift:{},why:{},exp:{stress:0,poor:0,rich:0,solid:0,betray:0,win:0,loss:0},contra:0,cq:[],dq:[],dlg:null,dmode:'preguntar',wk:{out:0,outK:{}},lastCareer:S.career,lastJobless:!!S.jobless,chapSeen:{},latent:null,mem:[]});
function remember(txt){const c=ex();c.mem.push({d:S.day,t:txt});if(c.mem.length>30)c.mem.shift();}
function schedule(days,k,data){ex().cq.push({d:S.day+Math.max(1,Math.round(days)),k,data:data||{}});}

// ---------- rasgos ocultos de la gente ----------
const HID={
  celosa:{n:'Celos',e:'😒',neg:1,need:1,d:p=>`Lleva fatal que Ana salga sin ${pArt(p)}.`,w:p=>ex().wk.out>=2?ex().wk.out*(intimate(p)?1.4:.3):0,why:'los celos',
    rev:p=>ex().wk.out>=2,txt:p=>`${p.n} le ha mirado el móvil a Ana mientras se duchaba. «¿Quién es esa gente con la que sales tanto?». No era una pregunta.`},
  tacana:{n:'Tacañería',e:'🪙',neg:1,d:()=>'Cuenta cada euro, también los ajenos.',w:p=>(S.money<0?3:1)*(liveIn()===p?1.4:.6),why:'el dinero',
    rev:p=>S.money<150||liveIn()===p,txt:p=>`${p.n} ha hecho una hoja de cálculo con lo que gasta cada uno. Hasta el papel higiénico. Al céntimo.`},
  clasista:{n:'Clasismo',e:'🎩',neg:1,d:()=>'Mira por encima del hombro los trabajos «de poca cosa».',cond:p=>RICHJOB.has(p.job)||p.k==='madre'||Math.random()<.3,
    w:p=>['precaria','parada'].includes(classOf())?2.6:.4,why:'su trabajo',rev:p=>['precaria','parada'].includes(classOf()),
    txt:p=>`En una cena con gente de ${p.n}, alguien preguntó a Ana a qué se dedicaba. ${p.n} contestó por ella, adornándolo. Luego le dijo: «es que suena mejor así».`},
  trepa:{n:'Ambición sin freno',e:'📈',neg:1,d:()=>'Su carrera va primero. Siempre.',w:()=>1.2,why:'su carrera',rev:()=>Math.random()<.5,
    txt:p=>`${p.n} ha aceptado un puesto con viajes sin comentarlo con Ana. «Era ahora o nunca». Lo de cenar juntos queda para cuando se pueda.`},
  mentirosa:{n:'Mentiras',e:'🤥',neg:1,d:()=>'Ocultaba algo importante.',w:()=>.6,why:'la confianza',rev:p=>S.day-(p.metDay||0)>40,
    txt:p=>pickR([`Ana ha encontrado cartas del banco a nombre de ${p.n}: debe más de lo que gana en un año. Nunca se lo había contado.`,`${p.n} no estaba donde dijo que estaba. Ana lo ha sabido por casualidad, y ya no sabe qué más no sabe.`]),
    onRev:p=>{p.love=Math.max(0,p.love-20);p.rel=Math.max(0,p.rel-15);ex().exp.betray++;p.wear=(p.wear||0)+25;}},
  deprimida:{n:'Depresión',e:'🌧️',neg:1,care:1,d:()=>'Arrastra una tristeza que no se cura con un fin de semana.',w:p=>T('empatica')?-0.5:1.4,why:'cuidar sin descanso',rev:p=>Math.random()<.6,
    txt:p=>`${p.n} lleva semanas sin ganas de nada. Hoy no se ha levantado de la cama. Ana ha llamado a su médico de cabecera: tres semanas de espera.`,fx:p=>{S.needs.energia=Math.max(0,S.needs.energia-4);}},
  reaccionaria:{n:'Ideas reaccionarias',e:'🗯️',neg:1,d:()=>'Culpa a inmigrantes y «vagos» de lo que hacen los de arriba.',cond:p=>RIGHT.includes(p.ideo)||p.ideo==='apolitica',
    w:p=>isLeft()?2.2*(comp()/2):isI('apolitica')?.5:0,why:'la política',rev:p=>W_().crisis>40||isLeft(),
    txt:p=>`En la sobremesa, ${p.n} soltó que «los de fuera vienen a quitarnos lo nuestro». Ana se quedó mirando el plato. Lo nuestro: un alquiler que no paramos de subir.`},
  esquirola:{n:'Esquirola',e:'🐀',neg:1,need:1,d:()=>'En la huelga se puso del lado de la empresa.',only:'compi',w:()=>isLeft()?1.8:.2,why:'la huelga',rev:()=>!!(S.strike&&S.strike.on),
    txt:p=>`${p.n} ha entrado a trabajar por la puerta de atrás mientras el piquete aguantaba en la de delante. Y luego le ha pasado a la jefa la lista de quién estaba fuera.`,onRev:p=>{p.rel=Math.max(0,p.rel-20);}},
  generosa:{pos:1,n:'Generosidad',e:'🤲',d:()=>'Da sin llevar la cuenta.',w:()=>-1,rev:()=>S.money<0,
    txt:p=>`Sin decir nada, ${p.n} le ha hecho una transferencia a Ana. En el concepto pone: «para que llegues a fin de mes, no me lo devuelvas».`,onRev:p=>{const m=Math.round(120*PM());S.money+=m;bumpMoney&&bumpMoney();}},
  leal:{pos:1,n:'Lealtad',e:'🫶',d:()=>'Está a las duras y a las maduras.',w:()=>-1.6,rev:()=>S.jobless||S.money<0||mood()<35,
    txt:p=>`Las cosas van mal y ${p.n} no se ha ido a ningún sitio. Ha aparecido con un táper y se ha quedado hasta tarde. Sin preguntar, sin dar lecciones.`},
  cuidadora:{pos:1,n:'Cuidados a medias',e:'🧺',d:()=>'Reparte tareas y cuidados a medias de verdad, sin que se lo pidan.',w:()=>-1.2,rev:p=>(S.kids||[]).length>0||liveIn()===p,
    txt:p=>`${p.n} ha hecho la lista de la compra, ha pedido cita en el pediatra y ha puesto lavadoras. Sin anunciarlo. Ana no sabía que se podía vivir así.`},
  conciencia:{pos:1,n:'Conciencia de clase',e:'✊',d:()=>'Tiene más conciencia de clase de la que aparentaba.',cond:p=>LEFT.includes(p.ideo)||p.ideo==='apolitica',
    w:()=>isLeft()?-1.8:isRight()?1.2:0,why:'la política',rev:()=>!!(S.strike&&S.strike.on)||W_().crisis>45||(S.union&&S.union.member),
    txt:p=>`Resulta que ${p.n} lleva años yendo a la asamblea de su barrio. «No te lo dije porque no me preguntaste». ${isLeft()?'Ana sonríe: hay más gente de la que creía.':''}`}};
function ensureHid(p){if(p.hid)return p.hid;const neg=Object.keys(HID).filter(k=>HID[k].neg&&(!HID[k].only||HID[k].only===p.k)&&(!HID[k].cond||HID[k].cond(p)));
  const pos=Object.keys(HID).filter(k=>HID[k].pos&&(!HID[k].cond||HID[k].cond(p)));p.hid=[];
  if(Math.random()<.62&&neg.length)p.hid.push(pickR(neg));if(Math.random()<.55&&pos.length)p.hid.push(pickR(pos));p.rev=p.rev||[];return p.hid;}
const closeTo=p=>Math.max(p.rel||0,p.love||0);
const intimate=p=>['cita','rollo','pareja','convive','casada'].includes(p.stage);

// ---------- rasgos que Ana descubre de sí misma ----------
const LAT={
  lider:{n:'Líder',e:'📣',d:'Cuando habla en una asamblea, la gente escucha. Organiza más rápido.',rev:()=>S.pol.inf>=12||(S.strike&&S.strike.on&&S.strike.by==='ana'),txt:'En la asamblea se hizo el silencio cuando Ana pidió la palabra. Nadie le había nombrado portavoz, pero todas las miradas fueron hacia Ana.'},
  ansiosa:{n:'Ansiedad',e:'💭',d:'El estrés se le queda dentro: se cansa antes y duerme peor.',rev:()=>ex().exp.stress>=4,txt:'Tercera noche despierta a las cuatro, repasando cuentas que no salen. Hoy, en la cola del súper, le ha faltado el aire.'},
  resiliente:{n:'Resiliencia',e:'🌱',d:'Se levanta después de cada golpe. Las derrotas no la paran: la endurecen.',rev:()=>ex().exp.loss>=1||S.jobless||ex().exp.betray>=1,txt:'Le han dado un golpe que habría tumbado a cualquiera. Se ha permitido una tarde de llorar. Al día siguiente, ya estaba haciendo planes.'},
  rencorosa:{n:'Rencor',e:'🧊',d:'No olvida. Lo que le hacen, se queda.',rev:()=>ex().exp.betray>=1||ex().exp.loss>=1,txt:'Han pasado semanas y todavía repasa, palabra por palabra, lo que le hicieron. No piensa olvidarlo.'},
  empatica:{n:'Empatía',e:'💗',d:'Siente lo que sienten los demás. Cuidar no la desgasta igual, pero lo injusto le duele más.',rev:()=>(S.people||[]).some(p=>(p.rev||[]).includes('deprimida'))||S.track==='cuidados'||ex().exp.solid>=3,txt:'Una desconocida lloraba en el autobús. Ana se ha bajado en su parada solo para acompañarla hasta casa.'},
  genio:{n:'Genio vivo',e:'🌋',d:'Explota. Discute más, pero también se planta y negocia sin miedo.',rev:()=>ex().exp.stress>=2,txt:'Hoy ha estallado: ha dicho en voz alta lo que todo el mundo pensaba. Al encargado se le ha borrado la sonrisa.'}};
function latentOf(){const c=ex();if(!c.latent){const k=Object.keys(LAT).sort(()=>Math.random()-.5);c.latent={hidden:k.slice(0,2),rev:[]};}return c.latent;}
// rasgos nuevos que el juego puede añadir con el tiempo (no se eligen en el creador)
Object.assign(TRAITS,{
  cinica:{n:'Desencantada',e:'🥀',d:'Ha dejado de creer en casi todo. Le cuesta implicarse y la tristeza se le pega.',hid:1},
  solidaria:{n:'Solidaria',e:'🤝',d:'Sabe que sola no se sale. Sus amistades duran más y organiza mejor.',hid:1},
  desconfiada:{n:'Desconfiada',e:'🫥',d:'Le han mentido demasiadas veces. Ahora cuesta ganarse su confianza.',hid:1},
  combativa:{n:'Combativa',e:'🔥',d:'Ha ganado alguna batalla y ya no se deja pisar.',hid:1},
  ...Object.fromEntries(Object.entries(LAT).map(([k,v])=>[k,{n:v.n,e:v.e,d:v.d,hid:1}]))});
{const dE=TRAIT_DECAY.energia;TRAIT_DECAY.energia=()=>dE()*(T('ansiosa')?1.12:1);const dS=TRAIT_DECAY.social;TRAIT_DECAY.social=()=>dS()*(T('cinica')?.8:1);}

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

// ---------- desgaste de las relaciones ----------
function wearWeekly(){const c=ex(),cl=classOf();let fought=0;
  for(const p of S.people||[]){if(p.stage==='ex'||!p.k)continue;if(/^p/.test(p.k)&&!intimate(p)&&S.day-(p.last||p.metDay||0)>14)p.rel=Math.max(5,p.rel-3);}
  for(const p of S.people||[]){if(p.stage==='ex'||!p.k)continue;ensureHid(p);const close=intimate(p)||closeTo(p)>=55||['madre','amiga'].includes(p.k);if(!close)continue;
    const R={};const add=(k,v)=>{if(v)R[k]=(R[k]||0)+v;};
    for(const h of p.hid){const H=HID[h];if(!H)continue;add(H.why||h,H.w(p));if(H.fx&&intimate(p))H.fx(p);}
    // ideas: más militancia, más choque
    if(p.ideo&&S.ideo&&p.ideo!=='apolitica'&&S.ideo!=='apolitica'&&((isLeft()&&RIGHT.includes(p.ideo))||(isRight()&&LEFT.includes(p.ideo))))add('la política',.8*comp());
    // clase: cuando la vida los pone a cada uno en un lado
    if(intimate(p)){if(RICHJOB.has(p.job)&&['precaria','parada'].includes(cl))add('el dinero',1);if(['mando','patrona'].includes(cl)&&isLeft(p.ideo))add('su trabajo',1.5);}
    // tiempo: militar, trabajar de más o estar fuera tiene un precio en casa
    const militancy=(c.wk.outK.militancia||0)+(c.wk.outK.sindicato||0)+(c.wk.outK.piquete||0)+(c.wk.outK.manifestacion||0);
    if(intimate(p)&&militancy>=2&&!(p.ideo===S.ideo))add('la militancia',militancy*.8);
    if(intimate(p)&&S.money<0)add('el dinero',1.4);
    if(intimate(p)&&mood()<35)add('el mal humor',1);
    if(intimate(p)&&(S.kids||[]).some(k=>kidAge(k)<3)&&!(p.rev||[]).includes('cuidadora')&&!p.hid.includes('cuidadora'))add('los cuidados',1.2);
    // lo que sí funciona: tiempo juntos, mismas ideas
    if(S.day-(p.last||0)<5)add('_bien',-1.2);if(p.ideo===S.ideo&&S.ideo!=='apolitica')add('_bien',-.8*comp());
    const tot=Object.values(R).reduce((a,b)=>a+b,0);const keep=T('rencorosa')?.97:.9;
    p.wear=clamp((p.wear||0)*keep+tot,0,100);
    const worst=Object.entries(R).filter(e=>e[0][0]!=='_'&&e[1]>0).sort((a,b)=>b[1]-a[1])[0];p.wearWhy=worst?worst[0]:null;
    if(intimate(p))p.love=clamp(Math.min(p.love-p.wear/12+(tot<0?.6:0),100-p.wear*.8),0,100);else p.rel=clamp(p.rel-p.wear/32,0,100);
    if(!fought&&p.wear>(intimate(p)?28:45)&&worst&&Math.random()<.3+(T('genio')?.2:0)){fought=1;tell(fight(p,worst[0]),'😤');}
    if(isPartner(p)&&p.wear>=68&&!c.dlg&&!c.dq.some(d=>d.id==='crisis'))askDilemma('crisis',{p:p.k});
    // revelar
    if(S.day-(p.metDay||0)>=6)for(const h of p.hid){if((p.rev||[]).includes(h))continue;const H=HID[h];if(!H)continue;if(H.need&&!(H.rev&&H.rev(p)))continue;const ch=.03+closeTo(p)/100*.1+(H.rev&&H.rev(p)?.22:0);
      if(Math.random()<ch){p.rev=p.rev||[];p.rev.push(h);tell(H.txt(p),H.e,'big');if(H.onRev)H.onRev(p);remember(`Descubrió algo de ${p.n}: ${H.n.toLowerCase()}.`);break;}}}}
function fight(p,why){const n=p.n;const T_={'la militancia':[`Bronca con ${n}: «el sindicato te importa más que esta casa».`,`${n} ha cenado solo otra vez. Ana estaba en una asamblea.`.replace('solo',p.g==='f'?'sola':'solo')],
  'el dinero':[`Discusión con ${n} por dinero. Otra vez. Nadie levanta la voz por cien euros si le sobran.`,`${n} y Ana han discutido por quién paga qué. No era por el dinero, o sí.`],
  'la política':[`Cena tensa con ${n}. Empezó hablando de la huelga y acabó en «tú no sabes lo que es trabajar».`,`${n} ha cambiado de canal cuando salía la manifestación. Ana lo ha vuelto a poner.`],
  'su trabajo':[`${n} le ha soltado: «¿y ahora eres tú la que manda?». Duele porque tiene parte de razón.`,`${n} no soporta cómo habla Ana del trabajo últimamente.`],
  'su carrera':[`${n} ha vuelto a cancelar la cena: «reunión de última hora». Es la tercera esta semana.`,`${n} habla de su ascenso como si fuera de los dos. Las renuncias, en cambio, siempre las pone Ana.`],
  'los celos':[`${n} quería saber con quién estuvo Ana el sábado. Con detalles.`],'los cuidados':[`${n} dice que ayuda en casa. Ana lleva la cuenta de quién se levanta de noche.`],
  'cuidar sin descanso':[`Ana está agotada de sostener a ${n}. Y se siente culpable por estarlo.`],'la confianza':[`Ana ya no cree lo que le dice ${n}. Ni lo bueno.`],'el mal humor':[`Ana lleva días de mal humor y ${n} se lo está comiendo todo.`],'la huelga':[`Ana no le dirige la palabra a ${n} desde la huelga.`]};
  return pickR(T_[why]||[`${n} y Ana no están en su mejor momento: ${why}.`]);}

// ---------- contradicciones de clase ----------
function contraWeekly(){const c=ex(),cl=classOf();let d=-4;
  if(isLeft()){if(cl==='mando')d+=6+comp()*3;if(cl==='patrona')d+=7+comp()*3;if(cl==='rentista')d+=6+comp()*3;}
  if(isI('libertaria','liberal')){if(cl==='parada'&&S.paroWeeks>0)d+=4;if(S.track==='funcion')d+=3;}
  if(isI('conservadora')&&S.rentStrike)d+=4;
  c.contra=clamp(c.contra+d,0,100);
  if(c.contra>=55&&!c.dlg&&!c.dq.some(x=>x.id==='contra'))askDilemma('contra',{cl});}

// ---------- dilemas: decide el jugador (o Ana, si se lo deja) ----------
const DLG={
  ideo:{t:d=>`${IDEOS[d.to].e} Ana duda`,x:d=>`Ha sido ${topWhy(d.to)}. Cada vez se reconoce menos en lo que ${S.ideo==='apolitica'?'pensaba (o no pensaba)':'defendía como '+IDEOS[S.ideo].n.toLowerCase()}, y se siente más cerca de lo ${IDEOS[d.to].n.toLowerCase()}.`,
    o:d=>[{t:`Dejarse llevar: ahora es ${IDEOS[d.to].n.toLowerCase()}`,f:()=>changeIdeo(d.to)},{t:'Mantenerse firme',s:'La duda seguirá ahí, y volverá.',f:()=>{const c=ex();c.drift[d.to]*=.55;c.drift[S.ideo]=(c.drift[S.ideo]||0)+30;tell('Ana ha decidido no cambiar de ideas. Le ha costado; nadie dijo que fuera fácil.','🪨');}}],
    auto:d=>Math.random()<.6?0:1},
  crisis:{t:d=>'💔 Crisis de pareja',x:d=>{const p=P_(d.p);return p?`Ana y ${p.n} están en su peor momento. ${p.wearWhy?'Sobre todo por '+p.wearWhy+'.':''} Cada conversación acaba en reproche.`:'';},
    o:d=>{const p=P_(d.p);if(!p)return [{t:'Seguir',f:()=>{}}];const cost=Math.round(60*PM());return [
      {t:'Sentarse a hablarlo de verdad',s:'Depende del carisma… y de que el problema tenga arreglo.',f:()=>{const ok=Math.random()<.35+lvl('carisma')*.06-(p.hid.includes('mentirosa')?.2:0);if(ok){p.wear=Math.max(0,p.wear-35);p.love=Math.min(100,p.love+8);tell(`Ana y ${p.n} hablaron hasta las tres de la mañana. Lloraron, se rieron y se prometieron cosas concretas.`,'🕯️');}else{p.wear=Math.min(100,p.wear+8);tell(`Intentaron hablarlo. Acabó peor que empezó.`,'🥀');}}},
      {t:`Ir a terapia de pareja (${fmt(cost)}/semana, 4 semanas)`,ok:()=>S.money>=cost,f:()=>{for(let i=1;i<=4;i++)schedule(i*7,'terapia',{p:p.k,cost});tell(`Ana y ${p.n} han pedido cita con una terapeuta. Primera sesión el martes.`,'🛋️');}},
      {t:'Dejarlo',f:()=>{breakUp(p,p.wearWhy||'el desgaste');ex().exp.loss++;}},
      {t:'Aguantar y no tocar el tema',s:'El silencio también desgasta.',f:()=>{schedule(14,'silencio',{p:p.k});}}];},
    auto:d=>{const p=P_(d.p);return !p?0:T('genio')?2:lvl('carisma')>=4?0:S.money>500?1:3;}},
  contra:{t:d=>'⚖️ Contradicción',x:d=>({mando:`Ana es ${CLASSN.mando}. Ahora le toca repartir los turnos malos y transmitir los recortes. Con sus ideas, se le hace bola: por las noches no duerme.`,
      patrona:`Ana tiene gente a su cargo en su negocio. Les paga lo que el negocio aguanta, que no es lo que ella cree justo. Se ha convertido en lo que antes criticaba.`,
      rentista:'Ana cobra un alquiler a otra trabajadora. Lo mismo que antes le parecía un robo, ahora le cuadra las cuentas.',
      parada:'Ana vive de la prestación por desempleo, esa que siempre dijo que no debería existir.'}[d.cl]||'Lo que vive y lo que piensa ya no encajan.'),
    o:d=>{const c=ex();if(d.cl==='mando')return [
      {t:'Renunciar al cargo y volver a la base',s:'Menos sueldo; sus compañeras no lo olvidarán.',f:()=>{S.career=Math.max(0,S.career-1);c.contra=0;S.pol.inf+=5;const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+20);chapter('renuncia','La renuncia',`Ana ha devuelto el cargo. «No estoy para apretar a mis compañeras». Gana menos y duerme mejor.`);c.exp.solid++;}},
      {t:'Usar el cargo para proteger a la plantilla',s:'Ayuda a organizar desde dentro. Si la pillan, la despiden.',f:()=>{S.ally=true;c.contra=25;office().org=Math.min(100,office().org+15);schedule(18+Math.random()*25,'topo',{});tell('Ana avisa de los despidos antes de que lleguen y reparte los turnos con justicia. La dirección todavía no sospecha.','🕵️');}},
      {t:'Aceptar que las cosas han cambiado',s:'Se acomoda. Sus ideas, también.',f:()=>{c.contra=0;pushI('liberal',60,'ascenso');pushI('socialdemocrata',30,'ascenso');remember('Se acomodó en su puesto de mando.');}}];
      if(d.cl==='patrona')return [
      {t:'Subir los sueldos aunque gane menos',f:()=>{S.payMul=(S.payMul||1)*.85;c.contra=10;c.exp.solid++;tell('Ana ha subido el sueldo a su gente. Este mes ella cobra menos que ellos.','🤝');}},
      {t:'Convertir el negocio en cooperativa',ok:()=>isLeft(),f:()=>{startTrack('coop',true);c.contra=0;chapter('coopconv','De patrona a socia',`Ana ha convertido su negocio en una cooperativa: ahora es una socia más, con un voto como todas.`);}},
      {t:'El mercado es el mercado',f:()=>{c.contra=0;pushI('liberal',70,'dinero');pushI('libertaria',30,'dinero');schedule(30+Math.random()*30,'sindican',{});}}];
      if(d.cl==='rentista')return [{t:'Bajar el alquiler a precio social',f:()=>{S.rentInc=(S.rentInc||0)*.6;c.contra=0;tell('Ana ha bajado el alquiler a su inquilina. Ganará menos, pero no pensará en ello cada día.','🏘️');}},{t:'Precio de mercado',f:()=>{c.contra=0;pushI('liberal',60,'vivienda');}}];
      return [{t:'Necesita ese dinero y punto',f:()=>{c.contra=0;pushI('socialdemocrata',40,'pobreza');}},{t:'Avergonzarse en silencio',f:()=>{c.contra=20;S.needs.diversion=Math.max(0,S.needs.diversion-20);}}];},
    auto:d=>{if(d.cl==='mando')return comp()>=3?0:isI('socialdemocrata')||comp()===1?2:1;if(d.cl==='patrona')return comp()>=3&&isLeft()?1:isLeft()?0:2;return 0;}},
  ascenso:{t:()=>'📈 Te ofrecen mandar',x:()=>`Le ofrecen ser ${(CAREER[S.career]||{}).t}. Más sueldo, más responsabilidad… y ahora será quien aplique las órdenes de arriba a sus compañeras.`,
    o:()=>[{t:'Aceptar el puesto',f:()=>{remember('Aceptó un puesto de mando.');}},{t:'Rechazarlo y seguir con los suyos',s:'Menos dinero; más confianza en la plantilla.',f:()=>{S.career=Math.max(0,S.career-1);S.pol.inf+=4;office().org=Math.min(100,office().org+8);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+12);tell('Ana ha rechazado el ascenso. En el descanso, alguien le ha dejado un café pagado.','☕');ex().exp.solid++;}}],
    auto:()=>isLeft()&&comp()>=2?1:0},
  despedir:{t:()=>'✂️ Señala a dos',x:()=>`La dirección quiere «ajustar la plantilla» y le pide a Ana, como ${L((CAREER[S.career]||{}).t).toLowerCase()}, que señale a dos personas para despedir antes del viernes.`,
    o:()=>[{t:'Cumplir la orden',s:'La empresa lo valorará.',f:()=>{S.rep=Math.min(100,(S.rep??70)+10);const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-30);ex().contra+=isLeft()?25:5;pushI('liberal',25,'ascenso');schedule(12+Math.random()*10,'vacio',{});tell('Ana entregó dos nombres. Esa noche no cenó.','📄');}},
      {t:'Negarse',s:'Puede haber represalias.',f:()=>{S.rep=Math.max(0,(S.rep??70)-15);schedule(8+Math.random()*12,'represalia',{});tell('Ana se ha negado: «eso hacedlo vosotros». La directora ha apuntado algo en su libreta.','🙅');}},
      {t:'Avisar en secreto al sindicato',s:'Organiza la respuesta. Si se descubre, despido.',f:()=>{const o=office();o.org=Math.min(100,o.org+20);o.griev=Math.min(100,(o.griev||0)+25);S.pol.inf+=4;schedule(15+Math.random()*20,'filtracion',{});ex().exp.solid++;tell('Ana ha pasado la lista al sindicato. Al día siguiente había un cartel en el comedor: «Si tocan a una, nos tocan a todas».','📣');}}],
    auto:()=>isLeft()&&comp()>=2?2:isLeft()?1:0},
  piquete:{t:()=>'🪧 Huelga en el trabajo',x:()=>`La plantilla ha convocado huelga. Hacerla significa perder ${fmt(salary())} cada día${S.money<salary()*3?' y Ana ya va justa':''}. No hacerla significa cruzar el piquete delante de sus compañeras.`,
    o:()=>[{t:'Secundar la huelga',f:()=>{if(S.strike)S.strike.join=true;ex().exp.solid++;remember('Hizo la huelga.');}},{t:'Ir a trabajar',s:'Las compañeras se acordarán.',f:()=>{if(S.strike)S.strike.join=false;S.scab=S.day;schedule(10+Math.random()*10,'esquirol',{});pushI(isLeft()?'apolitica':'liberal',10,'huelga');}}],
    auto:()=>Math.random()<ID().strike?0:1},
  prestamo:{t:()=>'💸 No llega',x:d=>{const p=P_(d.p);return `La cuenta está en números rojos. ${p?p.n+' se ofrece a prestarle '+fmt(d.m)+'.':''} También hay una financiera que da microcréditos en el acto.`;},
    o:d=>{const p=P_(d.p);return [{t:`Aceptar el préstamo de ${p?p.n:'su amistad'}`,ok:()=>!!p,f:()=>{S.money+=d.m;bumpMoney&&bumpMoney();schedule(30,'devolver',{p:d.p,m:d.m});tell(`${p.n} le ha prestado ${fmt(d.m)}. «Cuando puedas». Ana ha apuntado la fecha en el calendario.`,'🤝');}},
      {t:`Microcrédito al 30 % (${fmt(d.m)})`,s:'Rápido y caro.',f:()=>{S.money+=d.m;bumpMoney&&bumpMoney();for(let i=1;i<=6;i++)schedule(i*7,'cuota',{m:Math.round(d.m*1.3/6)});tell('Microcrédito concedido en dos minutos. Las condiciones estaban en letra de seis puntos.','📲');}},
      {t:'Apretarse el cinturón',s:'Comer peor, no salir, aguantar.',f:()=>{S.needs.diversion=Math.max(0,S.needs.diversion-25);ex().exp.stress++;S.cutBelt=S.day+14;}}];},
    auto:d=>P_(d.p)&&!T('desconfiada')&&!ex().cq.some(q=>q.k==='devolver')?0:S.money<-WP()*.5?1:2},
  militancia:{t:d=>{const p=P_(d.p);return `💬 ${p?p.n:''} quiere que lo dejes`;},x:d=>{const p=P_(d.p);return p?`${p.n} le ha dicho a Ana que no aguanta más: reuniones, asambleas, piquetes. «O la militancia o yo». Lo dice en serio.`:'';},
    o:d=>{const p=P_(d.p);if(!p)return [{t:'Vale',f:()=>{}}];return [{t:'Dejar la militancia',s:'Gana tiempo en casa. Pierde algo de sí misma.',f:()=>{S.pol.comp=1;p.wear=Math.max(0,p.wear-30);p.love=Math.min(100,p.love+8);schedule(40,'arrepentimiento',{});tell(`Ana ha dejado la militancia por ${p.n}. Ha borrado el grupo de la asamblea del móvil. Le temblaba el dedo.`,'📵');}},
      {t:'Seguir militando',s:'La relación sufrirá.',f:()=>{p.wear=Math.min(100,(p.wear||0)+20);tell(`Ana ha dicho que no. «No me pidas que deje de ser yo». ${p.n} se ha ido a dormir sin decir nada.`,'✊');}},
      {t:`Proponerle que venga a una asamblea`,s:'Puede que cambie de idea… o que se ría de ella.',f:()=>{const ch=p.ideo==='apolitica'||LEFT.includes(p.ideo)||(p.hid||[]).includes('conciencia')?.55:.12;if(Math.random()<ch){p.ideo=S.ideo;p.wear=Math.max(0,p.wear-35);chapter('convence_'+p.k,'Juntas',`${p.n} fue a la asamblea «solo para ver». Ahora tiene su propio carné.`.replace('Juntas',p.g==='m'?'Juntos':'Juntas'));}else{p.wear=Math.min(100,p.wear+8);tell(`${p.n} aguantó media asamblea y se fue. «Esto es una secta».`,'🙄');}}}];},
    auto:d=>comp()>=3?1:2}};
const DLG_CD={ascenso:40,prestamo:28,crisis:21,militancia:30,despedir:30,contra:20,ideo:14};
function askDilemma(id,data){const c=ex();if(c.dq.length>=3||c.dq.some(x=>x.id===id)||(c.dlg&&c.dlg.id===id))return;const cd=DLG_CD[id];if(cd&&c.cool&&c.cool[id]!=null&&S.day-c.cool[id]<cd)return;c.dq.push({id,data:data||{},d:S.day});}
function resolveDlg(i){const c=ex(),d=c.dlg;if(!d)return;c.cool=c.cool||{};c.cool[d.id]=S.day;const D=DLG[d.id];const opts=D.o(d.data);const o=opts[i];c.dlg=null;hideDlg();if(o&&(!o.ok||o.ok())){try{o.f();}catch(e){console.error(e);}remember(`Decidió: ${o.t}.`);}
  try{save();}catch(e){}}
function dlgTick(){const c=ex();if(c.dlg||!c.dq.length)return;const d=c.dq.shift();const D=DLG[d.id];if(!D)return;
  if(c.dmode==='ana'){const opts=D.o(d.data);let i=D.auto(d.data);if(opts[i]&&opts[i].ok&&!opts[i].ok())i=opts.findIndex(o=>!o.ok||o.ok());const o=opts[i];if(o){try{o.f();}catch(e){console.error(e);}tell(`${D.t(d.data)} — Ana ha decidido: ${o.t.charAt(0).toLowerCase()+o.t.slice(1)}.`,'🧭');c.cool=c.cool||{};c.cool[d.id]=S.day;}return;}
  c.dlg=d;showDlg();}
const dlgBlocking=()=>!!(S&&S.cx&&S.cx.dlg&&S.cx.dmode!=='ana');
function showDlg(){const c=ex(),d=c.dlg;if(!d)return;const D=DLG[d.id];let el=document.getElementById('dlg');if(!el){el=document.createElement('div');el.id='dlg';document.body.appendChild(el);locEl(el);}
  const opts=D.o(d.data);
  el.innerHTML=`<div class="dlgc"><div class="dlgt">${D.t(d.data)}</div><div class="dlgx">${D.x(d.data)}</div>${opts.map((o,i)=>{const dis=o.ok&&!o.ok();return `<button class="dlgb"${dis?' disabled':''} data-i="${i}"><b>${o.t}</b>${o.s?`<small>${o.s}</small>`:''}</button>`;}).join('')}
  <div class="dlgf"><button class="mini" data-auto="1">🧭 Que decida Ana</button><label><input type="checkbox" id="dlgalways"> Que decida siempre</label></div></div>`;
  el.style.display='flex';
  el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>resolveDlg(+b.dataset.i));
  el.querySelector('[data-auto]').onclick=()=>{if(el.querySelector('#dlgalways').checked)c.dmode='ana';let i=D.auto(d.data);if(opts[i]&&opts[i].ok&&!opts[i].ok())i=opts.findIndex(o=>!o.ok||o.ok());toast(`🧭 ${opts[i].t}`);resolveDlg(i);};
  sfx&&sfx('level');}
function hideDlg(){const el=document.getElementById('dlg');if(el)el.style.display='none';}

// ---------- consecuencias que llegan más tarde ----------
const CQ={
  vacio:()=>{const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-15);ex().exp.stress++;tell('En el comedor, la mesa de siempre se queda en silencio cuando llega Ana. Saben lo de la lista.','🥶');remember('Le hacen el vacío por la lista de despidos.');},
  represalia:()=>{if(S.jobless)return;if(Math.random()<.5+TOX()*.3){S.career=Math.max(0,S.career-1);tell(`Reestructuración: a Ana ${ga('la','lo','le')} han bajado a ${L(CAREER[S.career].t).toLowerCase()}. «Nada personal».`,'📉');ex().exp.loss++;pushI(LEANL(),25,'despido');}else tell('La represalia no ha llegado. Quizá porque media plantilla se enteró de que Ana se negó.','🛡️');},
  filtracion:()=>{if(S.jobless)return;if(Math.random()<.35){S.jobless=true;S.paroWeeks=6;S.ally=false;tell('La dirección ha descubierto quién filtró la lista. Despido disciplinario. El sindicato convoca una concentración en la puerta.','📦');ex().exp.loss++;pushI(LEANL(),35,'despido');if(S.union&&S.union.member)S.court=S.day+20;}else{tell('Nadie sabe quién filtró la lista. Los despidos se han quedado en el cajón.','🤫');ex().exp.win++;}},
  topo:()=>{if(!S.ally||S.jobless)return;if(Math.random()<.4){S.ally=false;S.career=Math.max(0,S.career-1);tell('Alguien le ha ido con el cuento a la dirección: saben que Ana avisaba a la plantilla. Degradación inmediata.','🐀');ex().exp.betray++;}else{office().griev=Math.max(0,(office().griev||0)-10);tell('Gracias a los avisos de Ana, la plantilla llegó preparada a la reunión con la dirección. Esta vez no hubo despidos.','🛡️');ex().exp.win++;schedule(25+Math.random()*25,'topo',{});}},
  esquirol:()=>{const cp=P_('compi');if(cp){cp.rel=Math.max(0,cp.rel-20);(cp.hid||(cp.hid=[]));}ex().exp.stress++;tell('Desde la huelga, nadie le guarda sitio en la máquina del café. «Esquirola», ha escrito alguien en su taquilla.'.replace('Esquirola',ga('Esquirola','Esquirol','Esquirol')),'🐀');remember('La llaman esquirol por cruzar el piquete.');},
  sindican:()=>{if(S.track!=='negocio')return;tell('Tu empleada se ha afiliado a un sindicato y exige el convenio. Hay que pagarle más o ir a juicio.','📜');S.payMul=(S.payMul||1)*.9;},
  terapia:d=>{const p=P_(d.p);if(!p||p.stage==='ex')return;S.money-=d.cost;bumpMoney&&bumpMoney();p.wear=Math.max(0,(p.wear||0)-14);p.love=Math.min(100,p.love+3);if(Math.random()<.4)tell(pickR([`Terapia: ${p.n} ha dicho algo que Ana nunca le había oído.`,`En terapia han aprendido a discutir sin herirse. Casi.`,`La terapeuta les ha mandado deberes: una cena a la semana sin móviles.`]),'🛋️');},
  silencio:d=>{const p=P_(d.p);if(!p||p.stage==='ex')return;p.wear=Math.min(100,(p.wear||0)+10);tell(`Ana y ${p.n} viven como compañeros de piso. Cordiales. Fríos.`,'🧊');},
  devolver:d=>{const p=P_(d.p);if(!p)return;if(S.money>=d.m*1.2){S.money-=d.m;bumpMoney&&bumpMoney();p.rel=Math.min(100,p.rel+5);tell(`Ana le ha devuelto a ${p.n} los ${fmt(d.m)}. Hasta el último euro.`,'🤝');}else{p.rel=Math.max(0,p.rel-20);p.wear=(p.wear||0)+15;tell(`Ana todavía no puede devolverle el dinero a ${p.n}. Nadie lo menciona, y eso es peor.`,'😶');schedule(21,'devolver',d);}},
  cuota:d=>{S.money-=d.m;bumpMoney&&bumpMoney();if(S.money<0)ex().exp.stress++;},
  arrepentimiento:()=>{if(comp()>1)return;if(W_().mov>40||W_().crisis>50){tell('Ana ve la manifestación desde el balcón. Su gente está ahí abajo. Ella, aquí arriba.','🪟');pushI(S.ideo,20,'crisis');ex().exp.stress++;}},
  antecedentes:()=>{if(S.jobless&&Math.random()<.5)tell('En la entrevista han buscado su nombre en internet. Sale la foto de la detención. «Ya te llamaremos».','🚔');}};
function cqDaily(){const c=ex();const due=c.cq.filter(q=>q.d<=S.day);c.cq=c.cq.filter(q=>q.d>S.day);for(const q of due){try{CQ[q.k]&&CQ[q.k](q.data);}catch(e){console.error(e);}}}

// ---------- autodescubrimiento y cambios de personalidad ----------
function selfWeekly(){const c=ex(),L=latentOf();const md=mood();
  if(md<35||S.money<0||TOX()>.7)c.exp.stress++;else c.exp.stress=Math.max(0,c.exp.stress-1);
  for(const k of [...L.hidden]){const D=LAT[k];if(D.rev()&&Math.random()<.35){L.hidden=L.hidden.filter(x=>x!==k);L.rev.push(k);S.traits=S.traits||[];if(!S.traits.includes(k))S.traits.push(k);chapter('yo_'+k,`${D.e} ${D.n}`,`${D.txt} Ana no se conocía esa faceta.`);}}
  const add=(k,txt,rm)=>{if(T(k))return;S.traits.push(k);if(rm)S.traits=S.traits.filter(x=>x!==rm);chapter('cambio_'+k,`${TRAITS[k].e} Ha cambiado`,txt);};
  if(c.exp.stress>=6&&!T('combativa'))add('cinica','Algo se ha apagado. Ana ya no espera gran cosa de nadie, tampoco de sí misma.');
  if(c.exp.solid>=5)add('solidaria','Tantas veces ha estado para los demás que ahora sabe que los demás también estarán.','cinica');
  if(c.exp.betray>=2)add('desconfiada','Le han mentido demasiadas veces. Ahora tarda en confiar.');
  if(c.exp.win>=2)add('combativa','Ha ganado. Y quien gana una vez sabe que se puede.','cinica');
  if(c.exp.poor>=8&&!T('ahorradora'))add('ahorradora','Meses contando monedas le han enseñado a estirar cada euro.','derrochadora');
  if(c.exp.rich>=14&&T('ahorradora')&&Math.random()<.2)add('derrochadora','Ahora que le sobra, se da caprichos. Le sienta bien, aunque le dé un poco de vergüenza.','ahorradora');
}
// los rasgos nuevos tocan el resto de sistemas
function traitEffectsWeekly(){
  if(T('lider')&&S.pol)S.pol.inf=Math.min(100,(S.pol.inf||0)+.6);
  if(T('solidaria'))for(const p of S.people||[])if(p.stage!=='ex'&&closeTo(p)>40)p.rel=Math.min(100,p.rel+.8);
  if(T('cinica')){S.needs.diversion=Math.max(0,S.needs.diversion-4);}
  if(T('combativa')&&S.office)S.office.org=Math.min(100,S.office.org+.6);
  if(T('genio')&&!S.jobless&&Math.random()<.08){if(Math.random()<.5){S.payMul=(S.payMul||1)*1.03;tell('Ana se ha plantado en el despacho y ha conseguido el plus que le debían.','🌋');}else{S.rep=Math.max(0,(S.rep??70)-8);tell('Ana le ha contestado mal a la encargada. Expediente.','🌋');}}
}

// ---------- disparadores semanales de dilemas ----------
function triggersWeekly(){const c=ex();
  // se acaba de convertir en mando
  const boss=isBoss();if(boss&&S.career>c.lastCareer&&isLeft()&&!c.dq.some(d=>d.id==='ascenso'))askDilemma('ascenso',{});c.lastCareer=S.career;
  if(boss&&Math.random()<(Dm().soul?.06:.03)*(1+TOX()))askDilemma('despedir',{});
  // números rojos
  if(S.money<-30&&!c.dq.some(d=>d.id==='prestamo')&&!(S.cutBelt>S.day)){const f=(S.people||[]).filter(p=>p.stage!=='ex'&&closeTo(p)>=50).sort((a,b)=>closeTo(b)-closeTo(a))[0];askDilemma('prestamo',{p:f?f.k:null,m:Math.round(Math.max(150,-S.money+100)/10)*10});}
  // la pareja harta de la militancia
  const pt=partner();if(pt&&comp()>=2&&S.ideo!=='apolitica'&&pt.ideo!==S.ideo&&(pt.wear||0)>=40&&pt.wearWhy==='la militancia'&&Math.random()<.35)askDilemma('militancia',{p:pt.k});
  // despido: memoria de clase
  if(S.jobless&&!c.lastJobless){c.exp.loss++;pushI(isRight()?'socialdemocrata':LEANL(),18,'despido');}c.lastJobless=!!S.jobless;
  // capítulos recientes empujan ideas
  const st=storyState();for(const [id,ch] of Object.entries(st.chap)){if(c.chapSeen[id])continue;c.chapSeen[id]=1;
    if(id==='huelgaW'){c.exp.win++;pushI(isI('anarquista')?'anarquista':'marxista',25,'huelga');}
    else if(id==='juicio'){pushI('socialdemocrata',15,'huelga');}
    else if(id==='inquilinas'){pushI('anarquista',15,'vivienda');c.exp.solid++;}
    else if(/^promo|^top$/.test(id)){pushI('liberal',8,'ascenso');}
    else if(id==='boda'||/^nace_/.test(id)){pushI('conservadora',5,'familia');pushI('socialdemocrata',3,'cuidados');}
    else if(id==='ruptura'){c.exp.loss++;}
    else if(id==='comedor'){pushI(LEANL(),12,'pobreza');}}
  c.wk={out:0,outK:{}};}
function conexWeekly(){try{latentOf();wearWeekly();driftWeekly();contraWeekly();selfWeekly();traitEffectsWeekly();triggersWeekly();}catch(e){console.error('conex',e);}}
function conexDaily(){try{cqDaily();}catch(e){console.error(e);}}
// contar salidas (para celos, militancia y desgaste)
{const _go=goOut;goOut=function(k){const c=ex();c.wk.out++;c.wk.outK[k]=(c.wk.outK[k]||0)+1;if(['voluntariado','piquete'].includes(k)&&Math.random()<.3)c.exp.solid++;return _go.apply(this,arguments);};}
// la huelga de la plantilla: decide el jugador
{const _cs=callStrike;callStrike=function(byOthers){_cs.apply(this,arguments);if(byOthers&&S.strike&&!TR().self){if(ex().dmode!=='ana'){S.strike.join=false;askDilemma('piquete',{});}else if(!S.strike.join){S.scab=S.day;schedule(12,'esquirol',{});}}};}
// la detención deja huella
{const _ar=arrestAna;arrestAna=function(){_ar.apply(this,arguments);schedule(30,'antecedentes',{});if(T('resiliente')||T('combativa'))pushI('anarquista',15,'represion');else pushI('apolitica',15,'represion');};}

// ---------- interfaz: lo que Ana va descubriendo ----------
function innerBlock(){const c=ex(),L=latentOf();let h=`<h3>🔍 Por dentro</h3>`;
  h+=`<div class="kv"><span>Clase</span><span>${CLASSN[classOf()]}</span></div>`;
  if(L.hidden.length)h+=`<div class="sub" style="font-size:11.5px">Hay ${L.hidden.length===1?'algo':'cosas'} de Ana que ni ella sabe todavía.</div>`;
  if(c.contra>10)h+=`<div class="kv"><span>⚖️ Contradicción</span><span><span class="minibars" style="display:inline-block;width:90px;vertical-align:middle"><i style="width:${c.contra}%;background:#e07a5f"></i></span></span></div>`;
  const dr=Object.entries(c.drift).filter(([k,v])=>k!==S.ideo&&v>15).sort((a,b)=>b[1]-a[1]).slice(0,2);
  for(const [k,v] of dr)h+=`<div class="kv"><span>${IDEOS[k].e} Se acerca a lo ${IDEOS[k].n.toLowerCase()}</span><span style="font-size:11px">por ${topWhy(k)}</span></div>`;
  const pend=c.cq.length;if(pend)h+=`<div class="sub" style="font-size:11.5px">⏳ ${pend===1?'Hay una decisión pasada que todavía no ha dado la cara.':'Hay '+pend+' decisiones pasadas que todavía no han dado la cara.'}</div>`;
  const mem=c.mem.slice(-4).reverse();if(mem.length)h+=`<div class="sub" style="font-size:11.5px;margin-top:4px">${mem.map(m=>'• '+m.t).join('<br>')}</div>`;
  h+=`<div class="chips" style="margin-top:6px"><span class="sub" style="font-size:11px;align-self:center">Dilemas:</span><button class="mini${c.dmode!=='ana'?' sel':''}" data-dmode="preguntar">Decido yo</button><button class="mini${c.dmode==='ana'?' sel':''}" data-dmode="ana">Decide Ana</button></div>`;
  return h;}
function hidBadges(p){const r=(p.rev||[]).map(k=>HID[k]).filter(Boolean);return r.map(H=>`<span title="${H.n}" class="hb${H.pos?' pos':''}">${H.e} ${H.n}</span>`).join('');}
