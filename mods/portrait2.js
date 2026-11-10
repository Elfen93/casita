// ---------- retrato realista: rasgos elegibles pieza a pieza ----------
const HS_BODY={tupe:'corto',flequillo:'media',bob:'media',larga:'melena',ondas:'melena',trenzas:'coleta',twa:'corto',fade:'rapado',hightop:'rizos',cornrows:'rapado',boxbraids:'melena',locs:'melena',twists:'media',puffs:'mono',bantu:'rizos'};
const BEARD_BODY={completa:'corta',perilla:'corta',candado:'corta'};
const bodyHair=st=>HS_BODY[st]||st;
const bodyBeard=b=>BEARD_BODY[b]||b;
const HAIR_GROUPS=[['Lisos y ondulados',['corto','tupe','flequillo','media','bob','melena','larga','ondas','coleta','mono','trenzas']],
  ['Rizados y afro',['rizos','twa','afro','fade','hightop','puffs','bantu']],['Trenzas y locs',['cornrows','boxbraids','twists','locs']],['Sin pelo',['rapado','calvo']]];
const RF_OPTS={forma:{ovalada:'Ovalada',redonda:'Redonda',cuadrada:'Cuadrada',corazon:'Corazón',alargada:'Alargada'},
  estructura:{suave:'Suave',media:'Intermedia',marcada:'Marcada'},
  ojos:{almendra:'Almendrados',redondos:'Redondos',caidos:'Caídos',rasgados:'Rasgados',encapotados:'Encapotados'},
  nariz:{recta:'Recta',ancha:'Ancha',aguilena:'Aguileña',respingona:'Respingona',pequena:'Pequeña',chata:'Chata'},
  boca:{media:'Media',fina:'Fina',carnosa:'Carnosa',ancha:'Ancha',pequena:'Pequeña'},
  cejas:{natural:'Naturales',arqueada:'Arqueadas',recta:'Rectas',angulosa:'Angulosas',fruncida:'Fruncidas'},
  expresion:{neutra:'Neutra',sonrisa:'Sonriente',cansada:'Cansada',enfado:'Seria'}};
const RF_SLIDERS=[['tamOjos','Tamaño de ojos'],['sepOjos','Separación de ojos'],['grosorCejas','Grosor de cejas'],['tamNariz','Tamaño de nariz'],['labios','Grosor de labios'],['menton','Mentón'],['pomulos','Pómulos'],['orejas','Orejas']];
function randRF(ch){const r=seedRng((ch.faceSeed||'')+(ch.name||'')+(ch.skin||''));const P_=o=>{const k=Object.keys(o);return k[Math.floor(r()*k.length)];};const dark=['#9a623c','#6a3f25','#c68a5c'].includes(ch.skin);
  const f={forma:P_(RF_OPTS.forma),ojos:P_(RF_OPTS.ojos),nariz:dark&&r()<.5?'ancha':P_(RF_OPTS.nariz),boca:dark&&r()<.45?'carnosa':P_(RF_OPTS.boca),cejas:pickRR(r,['natural','natural','arqueada','recta','angulosa']),expresion:pickRR(r,['neutra','neutra','sonrisa','sonrisa','cansada']),
    tamOjos:.3+r()*.45,sepOjos:.3+r()*.4,grosorCejas:.25+r()*.6,tamNariz:.25+r()*.6,labios:.3+r()*.5+(dark?.15:0),menton:.25+r()*.5,pomulos:.3+r()*.5,orejas:.3+r()*.45};
  return {face:f,freck:r()<.14,mole:r()<.18?(r()<.5?'izq':'der'):null,makeup:ch.g==='f'&&r()<.4,earrings:r()<(ch.g==='m'?.12:.5)?(r()<.5?'aro':'bola'):null,gl:pickRR(r,['pasta','pasta','metal','redondas'])};}
function pickRR(r,a){return a[Math.floor(r()*a.length)];}
// caras de partidas antiguas: se traducen al nuevo motor para que sigan pareciéndose
function rfFromOld(F,ch){const b=randRF(ch);const m=(o,k,d)=>o[k]||d;
  b.face.forma=m({oval:'ovalada',redonda:'redonda',alargada:'alargada',cuadrada:'cuadrada',corazon:'corazon',pera:'cuadrada'},F.shape,b.face.forma);
  b.face.nariz=m({boton:'pequena',recta:'recta',grande:'recta',aguilena:'aguilena',ancha:'ancha',respingona:'respingona',patata:'chata'},F.nose,b.face.nariz);if(F.nose==='grande')b.face.tamNariz=.85;
  b.face.ojos=m({almendra:'almendra',redondos:'redondos',caidos:'caidos',pequenos:'almendra',grandes:'redondos'},F.eyes,b.face.ojos);if(F.eyes==='pequenos')b.face.tamOjos=.2;if(F.eyes==='grandes')b.face.tamOjos=.8;
  b.face.cejas=m({finas:'natural',normales:'natural',gruesas:'natural',arqueadas:'arqueada',rectas:'recta'},F.brow,b.face.cejas);if(F.brow==='finas')b.face.grosorCejas=.15;if(F.brow==='gruesas')b.face.grosorCejas=.9;
  b.face.boca=m({normal:'media',fina:'fina',carnosa:'carnosa',ancha:'ancha',pequena:'pequena'},F.mouth,b.face.boca);
  if(F.ears==='soplillo')b.face.orejas=.95;b.freck=!!F.freckles;b.mole=F.mole?'der':null;return b;}
function rfOf(ch){if(!ch.rf){ch.rf=ch.face&&ch.face.shape?rfFromOld(ch.face,ch):randRF(ch);}if(!ch.rf.face)ch.rf.face={};return ch.rf;}
function rfChar(ch,md,nobg){const R=rfOf(ch);const face={...R.face};
  if(md!=null){face.expresion=md>=74?'sonrisa':md<28?'cansada':R.face.expresion==='sonrisa'&&md<50?'neutra':R.face.expresion;}
  const age=ch.age||27;const grey=age>=58&&ch.hair!=='#bdbdbd'?ch.hair:null;
  return {g:ch.g,age,skin:ch.skin,hair:ch.hair,eyes:ch.eyes||'#3b2a20',shirt:ch.shirt||'#5b7fa6',hairStyle:ch.style||'corto',raya:ch.raya||(ch.name&&ch.name.length%3===0?'centro':ch.name&&ch.name.length%2?'izq':'der'),
    beard:ch.beard==='no'?null:ch.beard,glasses:ch.glasses?(R.gl||'pasta'):false,freck:R.freck,mole:R.mole,makeup:R.makeup,earrings:R.earrings,face,big:ch.build==='ancha',nobg,cuello:ch.g==='f'?'pico':null};}
function paintPortrait(c,ch,md=65,nobg){
  const x=c.getContext('2d'),k=c.width/100;x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,100,100);
  try{RF.draw(x,rfChar(ch,md,nobg));}catch(e){console.error(e);}
  x.setTransform(1,0,0,1,0,0);
}
