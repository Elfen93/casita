// ---------- personaje: aspecto, nombre y pronombres ----------
const SKINS=['#f7dcc8','#efc39b','#e0aa7e','#c68a5c','#9a623c','#6a3f25'];
const HAIRCOLS=['#1d1714','#3e2a1e','#5a3825','#8a5a32','#d1ab68','#a63d1f','#bdbdbd','#4f6fd1','#c4568f'];
const EYECOLS=['#3b2a20','#6b4a2a','#5b7a3a','#4a74a8','#2b2b2b'];
const HAIRSTYLES={corto:'Corto',tupe:'Tupé',flequillo:'Flequillo',media:'Media melena',bob:'Bob',melena:'Melena',larga:'Larga',ondas:'Ondas',coleta:'Coleta',mono:'Moño',trenzas:'Dos trenzas',rizos:'Rizos',twa:'Rizo corto',afro:'Afro',fade:'Fade',hightop:'High-top',puffs:'Puffs',bantu:'Bantu knots',cornrows:'Cornrows',boxbraids:'Box braids',twists:'Twists',locs:'Locs',rapado:'Rapado',calvo:'Calvo'};
const BEARDS={no:'Sin barba',sombra:'Sombra',corta:'Corta',completa:'Completa',larga:'Larga',perilla:'Perilla',candado:'Candado',bigote:'Bigote'};
const BUILDS={delgada:['Fina',0.86],media:['Media',1],ancha:['Fuerte',1.16]};
const PANTSC=['#3d405b','#2f3e5c','#5a4636','#2b2b2b','#6b705c','#8c4b5a','#c9b79c'];
const SHIRTC=['#ff8a5b','#5bc0be','#9b5de5','#f15bb5','#00bb7f','#3a86ff','#e9c46a','#f4f1ea','#3b3f46','#c0392b'];
const PRON={f:'Ella',m:'Él',x:'Elle'};
const NAMES={f:['Ana','Lucía','Marta','Carmen','Inés','Nora','Sara','Paula','Alba','Julia','Aitana','Valeria'],m:['Pablo','Hugo','Diego','Javier','Mario','Iker','Óscar','Raúl','Leo','Bruno','Adrián','Marcos'],x:['Alex','Sam','Noa','Ari','Cris','Dani','Eli','Robin','Andy','Sasha']};
const DEFCHAR={name:'Ana',g:'f',skin:'#efc39b',hair:'#5a3825',style:'coleta',beard:'no',glasses:false,build:'media',shirt:'#ff8a5b',pants:'#3d405b',eyes:'#3b2a20',age:27,bday:[5,14]};
const CH=()=>(S&&S.char)||DEFCHAR;
const ga=(f,m,x)=>{const g=CH().g;return g==='m'?m:g==='x'?(x??m):f;};
const oa=()=>ga('a','o','e');
const pickR=a=>a[Math.random()*a.length|0];
function randomChar(gForce){
  const r=Math.random(),g=gForce||(r<.46?'f':r<.9?'m':'x');
  const skin=pickR(SKINS),dark=['#9a623c','#6a3f25'].includes(skin)||(skin==='#c68a5c'&&Math.random()<.4);
  const st=dark?(g==='f'?pickR(['afro','boxbraids','cornrows','puffs','twists','locs','bantu','twa','bob','melena']):g==='m'?pickR(['fade','fade','twa','hightop','cornrows','locs','twists','rapado','calvo']):pickR(['twa','locs','twists','afro','fade','boxbraids'])):
    g==='f'?pickR(['coleta','melena','media','bob','larga','ondas','flequillo','rizos','mono','corto','trenzas']):g==='m'?pickR(['corto','corto','tupe','rapado','rizos','calvo','media','flequillo']):pickR(['corto','media','rizos','rapado','mono','bob','tupe']);
  const age=22+(Math.random()*20|0);
  return {name:pickR(NAMES[g]),g,skin,hair:age>38&&Math.random()<.3?'#bdbdbd':pickR(HAIRCOLS.slice(0,7)),style:st,beard:g==='m'&&Math.random()<.55?pickR(['sombra','corta','corta','completa','larga','perilla','candado','bigote']):'no',glasses:Math.random()<.3,build:pickR(['delgada','media','media','ancha']),
    shirt:pickR(SHIRTC),pants:pickR(PANTSC),eyes:pickR(EYECOLS),age,faceSeed:Math.random().toString(36).slice(2),bday:[Math.random()*12|0,1+(Math.random()*28|0)]};
}
// los textos están escritos para Ana: se adaptan al nombre y al género del personaje
const GW=['misma','arromántica','embarazada','justa','voluntaria','Cajera','fija','Encargada','Jefa','Camarera','Cocinera','Peona','Enfermera','Supervisora','Programadora','administrativa','Administrativa','veterana','Autónoma','Empresaria','Socia','coordinadora','Libertaria','Conservadora','Apolítica','Afiliada','afiliada','Delegada','Candidata','Concejala','concejala','Activa','Detenida','detenida','Despedida','Aprobada','sola','Becaria','Técnica','Coordinadora','Directora','Propietaria','propietaria','dueña','enferma','Enferma','cansada','agotada','dormida','sentada','Tirada','tirada','quemada','marcada','equilibrada','contenta','despedida','Bienvenida','Trabajadora','Perezosa','Ahorradora','Derrochadora','Solitaria','Ordenada','Despistada','preocupada','orgullosa','ocupada','sentadita','tumbada','Tumbada','mojada','encantada','harta','Romántica','Curiosa','Fiestera','Casera','Nocturna','Madrugadora','Impulsiva','Tozuda','Desencantada','Solidaria','Desconfiada','Combativa'];
const GSPEC={Jefa:['Jefe','Jefe'],Peona:['Peón','Peone'],Socia:['Socio','Socie'],sola:['solo','sole'],fija:['fijo','fije']};
function gform(w,g){if(GSPEC[w])return GSPEC[w][g==='m'?0:1];if(w==='Técnica')return g==='m'?'Técnico':'Técnique';if(w==='dueña')return g==='m'?'dueño':'dueñe';if(/ora$/.test(w))return g==='m'?w.slice(0,-1):w.slice(0,-1)+'e';return w.slice(0,-1)+(g==='m'?'o':'e');}
let GRX=null,GWL=null;
const _masc=w=>/oras$/.test(w)?w.slice(0,-2)+'es':w==='peonas'?'peones':w==='currantas'?'currantes':w.slice(0,-2)+'os';
function L(s){
  if(s==null||!S||!S.char)return s;const c=S.char;s=String(s);
  if(c.name!=='Ana')s=s.replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])Ana(?![A-Za-zÁÉÍÓÚáéíóúñÑ])/g,(m,a)=>a+c.name);
  if(c.g!=='f'){if(!GRX){GRX=new RegExp('(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ"=_\\-])('+GW.join('|')+')(?![A-Za-zÁÉÍÓÚáéíóúñÑ"_\\-])','gi');GWL={};for(const w of GW)GWL[w.toLowerCase()]=w;}
    s=s.replace(GRX,(m,a,w)=>{const cw=GWL[w.toLowerCase()];if(!cw)return m;let r=gform(cw,c.g);if(w[0]!==cw[0])r=w[0]===w[0].toUpperCase()?r[0].toUpperCase()+r.slice(1):r[0].toLowerCase()+r.slice(1);return a+r;})
     .replace(/no la ascienden/g,'no le ascienden').replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])ella(?![A-Za-zÁÉÍÓÚáéíóúñÑ])/g,(m,a)=>a+(c.g==='m'?'él':'elle'))
     .replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])([Ll])a (han|ha|habían|hab[ií]a|llam[\wÁÉÍÓÚáéíóúñÑ]*|mir[\wÁÉÍÓÚáéíóúñÑ]*|felicit[\wÁÉÍÓÚáéíóúñÑ]*|despid[\wÁÉÍÓÚáéíóúñÑ]*|contrat[\wÁÉÍÓÚáéíóúñÑ]*|ech[\wÁÉÍÓÚáéíóúñÑ]*|elig[\wÁÉÍÓÚáéíóúñÑ]*|pill[\wÁÉÍÓÚáéíóúñÑ]*|cuid[\wÁÉÍÓÚáéíóúñÑ]*|dej[\wÁÉÍÓÚáéíóúñÑ]*|quier[\wÁÉÍÓÚáéíóúñÑ]*|ayud[\wÁÉÍÓÚáéíóúñÑ]*|esper[\wÁÉÍÓÚáéíóúñÑ]*|acompañ[\wÁÉÍÓÚáéíóúñÑ]*|ascien[\wÁÉÍÓÚáéíóúñÑ]*|readmit[\wÁÉÍÓÚáéíóúñÑ]*|ven |vio |ve |oye|escuch[\wÁÉÍÓÚáéíóúñÑ]*|conoc[\wÁÉÍÓÚáéíóúñÑ]*|salud[\wÁÉÍÓÚáéíóúñÑ]*|abraz[\wÁÉÍÓÚáéíóúñÑ]*|bes[\wÁÉÍÓÚáéíóúñÑ]*|invit[\wÁÉÍÓÚáéíóúñÑ]*|quit[\wÁÉÍÓÚáéíóúñÑ]*|pon[\wÁÉÍÓÚáéíóúñÑ]*|lleva[\wÁÉÍÓÚáéíóúñÑ]*|tienen? |tiene |necesit[\wÁÉÍÓÚáéíóúñÑ]*|avis[\wÁÉÍÓÚáéíóúñÑ]*|prefier[\wÁÉÍÓÚáéíóúñÑ]*|busca[\wÁÉÍÓÚáéíóúñÑ]*|encuentr[\wÁÉÍÓÚáéíóúñÑ]*|sigu[\wÁÉÍÓÚáéíóúñÑ]*|sostien[\wÁÉÍÓÚáéíóúñÑ]*|rodea[\wÁÉÍÓÚáéíóúñÑ]*|apoy[\wÁÉÍÓÚáéíóúñÑ]*|trat[\wÁÉÍÓÚáéíóúñÑ]*|respet[\wÁÉÍÓÚáéíóúñÑ]*|represent[\wÁÉÍÓÚáéíóúñÑ]*)(?![A-Za-zÁÉÍÓÚáéíóúñÑ])/g,(m,a,l,v)=>a+(c.g==='m'?(l==='L'?'Lo':'lo'):(l==='L'?'Le':'le'))+' '+v);}
  if(c.g==='m'){// el colectivo en femenino genérico pasa a masculino cuando el personaje es hombre
    s=s.replace(/\b([Ll])as (compañeras|vecinas|trabajadoras|cajeras|camareras|limpiadoras|cuidadoras|peonas|obreras|afiliadas|precarias|currantas|de abajo)\b/g,(m,l,w)=>l+'os '+(w==='de abajo'?w:_masc(w)))
     .replace(/\b(compañeras|vecinas|trabajadoras|cajeras|camareras|limpiadoras|cuidadoras|peonas|obreras|afiliadas|precarias|currantas|unidas|nosotras|juntas)\b/gi,w=>{const r=_masc(w.toLowerCase());return w===w.toUpperCase()?r.toUpperCase():w[0]===w[0].toUpperCase()?r[0].toUpperCase()+r.slice(1):r;})
     .replace(/\b([Tt])odas\b(?! las\b)/g,(m,t)=>t+'odos').replace(/(?<![Aa] )\b([Ss])olas\b/g,(m,x)=>x+'olos');}
  return s;
}
function locEl(el){if(!el||el._loc)return;el._loc=1;
  for(const [p,proto] of [['textContent',Node.prototype],['innerHTML',Element.prototype]]){const d=Object.getOwnPropertyDescriptor(proto,p);
    Object.defineProperty(el,p,{get(){return d.get.call(this);},set(v){d.set.call(this,L(v));},configurable:true});}}

