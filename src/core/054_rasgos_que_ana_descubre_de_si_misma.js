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

