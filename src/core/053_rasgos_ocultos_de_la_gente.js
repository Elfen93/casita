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

