// ---------- rasgos que Ana descubre de sí misma ----------
const LAT={
  lider:{rev:()=>S.pol.inf>=12||(S.strike&&S.strike.on&&S.strike.by==='ana'),txt:'En la asamblea se hizo el silencio cuando Ana pidió la palabra. Nadie le había nombrado portavoz, pero todas las miradas fueron hacia Ana.'},
  ansiosa:{rev:()=>ex().exp.stress>=4,txt:'Tercera noche despierta a las cuatro, repasando cuentas que no salen. Hoy, en la cola del súper, le ha faltado el aire.'},
  resiliente:{rev:()=>ex().exp.loss>=1||S.jobless||ex().exp.betray>=1,txt:'Le han dado un golpe que habría tumbado a cualquiera. Se ha permitido una tarde de llorar. Al día siguiente, ya estaba haciendo planes.'},
  rencorosa:{rev:()=>ex().exp.betray>=1||ex().exp.loss>=1,txt:'Han pasado semanas y todavía repasa, palabra por palabra, lo que le hicieron. No piensa olvidarlo.'},
  empatica:{rev:()=>(S.people||[]).some(p=>(p.rev||[]).includes('deprimida'))||S.track==='cuidados'||ex().exp.solid>=3,txt:'Una desconocida lloraba en el autobús. Ana se ha bajado en su parada solo para acompañarla hasta casa.'},
  genio:{rev:()=>ex().exp.stress>=2,txt:'Hoy ha estallado: ha dicho en voz alta lo que todo el mundo pensaba. Al encargado se le ha borrado la sonrisa.'}};
// nombre, icono y descripción de cada uno están con los demás rasgos, en data/personas.json
for(const k in LAT){const t=TRAITS[k];LAT[k]={n:t.n,e:t.e,d:t.d,...LAT[k]};}
function latentOf(){const c=ex();if(!c.latent){const k=Object.keys(LAT).sort(()=>Math.random()-.5);c.latent={hidden:k.slice(0,2),rev:[]};}return c.latent;}
{const dE=TRAIT_DECAY.energia;TRAIT_DECAY.energia=()=>dE()*(T('ansiosa')?1.12:1);const dS=TRAIT_DECAY.social;TRAIT_DECAY.social=()=>dS()*(T('cinica')?.8:1);}

