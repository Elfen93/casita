// ---------- rasgos que Ana descubre de sí misma ----------
const LAT={
  lider:{rev:()=>S.pol.inf>=12||(S.strike&&S.strike.on&&S.strike.by==='ana'),txt:TXN.rasgos_ana.lider},
  ansiosa:{rev:()=>ex().exp.stress>=4,txt:TXN.rasgos_ana.ansiosa},
  resiliente:{rev:()=>ex().exp.loss>=1||S.jobless||ex().exp.betray>=1,txt:TXN.rasgos_ana.resiliente},
  rencorosa:{rev:()=>ex().exp.betray>=1||ex().exp.loss>=1,txt:TXN.rasgos_ana.rencorosa},
  empatica:{rev:()=>(S.people||[]).some(p=>(p.rev||[]).includes('deprimida'))||S.track==='cuidados'||ex().exp.solid>=3,txt:TXN.rasgos_ana.empatica},
  genio:{rev:()=>ex().exp.stress>=2,txt:TXN.rasgos_ana.genio}};
// nombre, icono y descripción de cada uno están con los demás rasgos, en data/personas.json
for(const k in LAT){const t=TRAITS[k];LAT[k]={n:t.n,e:t.e,d:t.d,...LAT[k]};}
function latentOf(){const c=ex();if(!c.latent){const k=Object.keys(LAT).sort(()=>Math.random()-.5);c.latent={hidden:k.slice(0,2),rev:[]};}return c.latent;}
{const dE=TRAIT_DECAY.energia;TRAIT_DECAY.energia=()=>dE()*(T('ansiosa')?1.12:1);const dS=TRAIT_DECAY.social;TRAIT_DECAY.social=()=>dS()*(T('cinica')?.8:1);}

