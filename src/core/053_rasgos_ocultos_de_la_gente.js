// ---------- rasgos ocultos de la gente ----------
const HIDX=DATA.sucesos.nucleo_rasgos_ocultos; // nombre, emoji, marcas y textos de cada rasgo (data/sucesos.json)
const HID={};for(const k in HIDX){const {d,txt,izq,...r}=HIDX[k];HID[k]=r;}
// la lógica de cada rasgo (cond, w = peso, rev = cuándo se revela, onRev, fx) y sus textos con huecos, unidos por id
conLogica(HID,{
  celosa:{d:p=>huecos(HIDX.celosa.d,{art:pArt(p)}),w:p=>ex().wk.out>=2?ex().wk.out*(intimate(p)?1.4:.3):0,
    rev:p=>ex().wk.out>=2,txt:p=>huecos(HIDX.celosa.txt,{p:p.n})},
  tacana:{d:()=>HIDX.tacana.d,w:p=>(S.money<0?3:1)*(liveIn()===p?1.4:.6),
    rev:p=>S.money<150||liveIn()===p,txt:p=>huecos(HIDX.tacana.txt,{p:p.n})},
  clasista:{d:()=>HIDX.clasista.d,cond:p=>RICHJOB.has(p.job)||p.k==='madre'||Math.random()<.3,
    w:p=>['precaria','parada'].includes(classOf())?2.6:.4,rev:p=>['precaria','parada'].includes(classOf()),
    txt:p=>huecos(HIDX.clasista.txt,{p:p.n})},
  trepa:{d:()=>HIDX.trepa.d,w:()=>1.2,rev:()=>Math.random()<.5,
    txt:p=>huecos(HIDX.trepa.txt,{p:p.n})},
  mentirosa:{d:()=>HIDX.mentirosa.d,w:()=>.6,rev:p=>S.day-(p.metDay||0)>40,
    txt:p=>huecos(pickR(HIDX.mentirosa.txt),{p:p.n}),
    onRev:p=>{p.love=Math.max(0,p.love-20);p.rel=Math.max(0,p.rel-15);ex().exp.betray++;p.wear=(p.wear||0)+25;}},
  deprimida:{d:()=>HIDX.deprimida.d,w:p=>T('empatica')?-0.5:1.4,rev:p=>Math.random()<.6,
    txt:p=>huecos(HIDX.deprimida.txt,{p:p.n}),fx:p=>{S.needs.energia=Math.max(0,S.needs.energia-4);}},
  reaccionaria:{d:()=>HIDX.reaccionaria.d,cond:p=>RIGHT.includes(p.ideo)||p.ideo==='apolitica',
    w:p=>isLeft()?2.2*(comp()/2):isI('apolitica')?.5:0,rev:p=>W_().crisis>40||isLeft(),
    txt:p=>huecos(HIDX.reaccionaria.txt,{p:p.n})},
  esquirola:{d:()=>HIDX.esquirola.d,w:()=>isLeft()?1.8:.2,rev:()=>!!(S.strike&&S.strike.on),
    txt:p=>huecos(HIDX.esquirola.txt,{p:p.n}),onRev:p=>{p.rel=Math.max(0,p.rel-20);}},
  generosa:{d:()=>HIDX.generosa.d,w:()=>-1,rev:()=>S.money<0,
    txt:p=>huecos(HIDX.generosa.txt,{p:p.n}),onRev:p=>{const m=Math.round(120*PM());S.money+=m;bumpMoney&&bumpMoney();}},
  leal:{d:()=>HIDX.leal.d,w:()=>-1.6,rev:()=>S.jobless||S.money<0||mood()<35,
    txt:p=>huecos(HIDX.leal.txt,{p:p.n})},
  cuidadora:{d:()=>HIDX.cuidadora.d,w:()=>-1.2,rev:p=>(S.kids||[]).length>0||liveIn()===p,
    txt:p=>huecos(HIDX.cuidadora.txt,{p:p.n})},
  conciencia:{d:()=>HIDX.conciencia.d,cond:p=>LEFT.includes(p.ideo)||p.ideo==='apolitica',
    w:()=>isLeft()?-1.8:isRight()?1.2:0,rev:()=>!!(S.strike&&S.strike.on)||W_().crisis>45||(S.union&&S.union.member),
    txt:p=>huecos(HIDX.conciencia.txt,{p:p.n,s:isLeft()?HIDX.conciencia.izq:''})}});
function ensureHid(p){if(p.hid)return p.hid;const neg=Object.keys(HID).filter(k=>HID[k].neg&&(!HID[k].only||HID[k].only===p.k)&&(!HID[k].cond||HID[k].cond(p)));
  const pos=Object.keys(HID).filter(k=>HID[k].pos&&(!HID[k].cond||HID[k].cond(p)));p.hid=[];
  if(Math.random()<.62&&neg.length)p.hid.push(pickR(neg));if(Math.random()<.55&&pos.length)p.hid.push(pickR(pos));p.rev=p.rev||[];return p.hid;}
const closeTo=p=>Math.max(p.rel||0,p.love||0);
const intimate=p=>['cita','rollo','pareja','convive','casada'].includes(p.stage);

