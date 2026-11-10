// ---------- muebles: catálogo ampliado (cocina, baño, dormitorio, salón, estudio, deco y jardín) ----------
// quick: se usa para necesidades leves (tentempié, lavarse la cara); bed: sirve para dormir; table: mesa con sillas;
// food: coste de comida al usarlo para comer; wx: depende del tiempo; lux/pobre: muebles que marcan clase
Object.assign(OBJ,{
  // cocina
  encimera:{n:'Encimera',e:'🔪',p:240,h:25,c:'#e9e3d6',ins:.06,need:{hambre:0.9},quick:1,food:0.6,verb:'Preparando un bocadillo',b:'🥪',sk:'cocina',decor:1,cat:'cocina'},
  micro:{n:'Microondas',e:'♨️',p:150,h:38,c:'#ececec',ins:.15,need:{hambre:1.25},quick:1,food:0.8,verb:'Calentando un táper',b:'🍲',cat:'cocina'},
  lavavaj:{n:'Lavavajillas',e:'🫧',p:380,h:26,c:'#dfe5e8',ins:.1,decor:1,cat:'cocina',pas:'cocinar rinde un 10% más'},
  cafetera:{n:'Cafetera',e:'☕',p:90,h:32,c:'#3b3f46',ins:.25,need:{diversion:0.45,hambre:0.3},food:0.2,verb:'Tomándose un café',b:'☕',cat:'cocina'},
  mesacoc:{n:'Mesa de cocina',e:'🍴',p:160,h:23,c:'#e8e2d4',ins:.08,decor:2,table:1,cat:'cocina'},
  // baño
  banera:{n:'Bañera',e:'🛁',p:700,h:16,c:'#f4f6f7',ins:.05,need:{higiene:2.3,diversion:0.3},verb:'Dándose un baño de espuma',b:'🛁',decor:1,cat:'bano'},
  lavabo:{n:'Lavabo',e:'🚰',p:160,h:30,c:'#f4f6f7',ins:.2,need:{higiene:1.1},quick:1,verb:'Lavándose la cara',b:'💦',decor:1,cat:'bano'},
  lavadora:{n:'Lavadora',e:'🧺',p:420,h:35,c:'#f2f4f5',ins:.1,need:{higiene:0.8},quick:1,verb:'Poniendo una lavadora',b:'👕',cat:'bano'},
  // dormitorio
  camamat:{n:'Cama de matrimonio',e:'🛏️',p:780,h:16,c:'#a35d6a',ins:.03,need:{energia:0.21},bed:1,verb:'Durmiendo a lo ancho',b:'💤',decor:2,cat:'dorm'},
  litera:{n:'Litera',e:'🪜',p:520,h:50,c:'#5b8fb9',ins:.05,need:{energia:0.16},bed:1,verb:'Durmiendo en la litera',b:'💤',cat:'dorm'},
  colchon:{n:'Colchón en el suelo',e:'🛌',p:45,h:6,c:'#e8e4d8',ins:.08,need:{energia:0.12},bed:1,pobre:1,verb:'Durmiendo en el colchón',b:'💤',decor:-2,cat:'dorm'},
  armario:{n:'Armario',e:'🚪',p:320,h:58,c:'#9c6845',ins:.06,need:{diversion:0.35,social:0.15},verb:'Probándose ropa',b:'👗',decor:1,cat:'dorm'},
  comoda:{n:'Cómoda',e:'🗄️',p:210,h:32,c:'#b07a4f',ins:.06,decor:3,cat:'dorm'},
  mesilla:{n:'Mesilla de noche',e:'🕯️',p:70,h:34,c:'#a47148',ins:.25,decor:1,light:true,cat:'dorm'},
  cuna:{n:'Cuna',e:'🍼',p:260,h:26,c:'#f4efe6',ins:.12,decor:3,cat:'dorm'},
  // salón
  sillon:{n:'Sillón orejero',e:'💺',p:380,h:40,c:'#4f7a6a',ins:.15,need:{diversion:0.5},verb:'Arrellanada en el sillón',b:'😌',decor:1,cat:'salon'},
  butaca:{n:'Butaca de lectura',e:'📖',p:300,h:30,c:'#d08c45',ins:.15,need:{diversion:0.45},sk:'logica',verb:'Leyendo en la butaca',b:'📖',decor:1,cat:'salon'},
  sofacama:{n:'Sofá cama hundido',e:'🛋️',p:110,h:24,c:'#8b7d68',ins:.05,need:{energia:0.11,diversion:0.3},bed:1,pobre:1,verb:'Durmiendo en el sofá cama',b:'💤',decor:-1,cat:'salon'},
  estant:{n:'Estantería',e:'🗃️',p:190,h:58,c:'#c49a6c',ins:.3,decor:3,cat:'salon'},
  mesabaja:{n:'Mesa baja',e:'🫖',p:120,h:13,c:'#8a5a3b',ins:.15,decor:2,cat:'salon',pas:'sofá, sillón y tele rinden un 10% más'},
  consola:{n:'Videoconsola',e:'🎮',p:520,h:40,c:'#1c1f24',ins:.08,need:{diversion:1.05,social:0.2},verb:'Jugando a la consola',b:'🎮',cat:'salon'},
  tocadisc:{n:'Tocadiscos',e:'🎶',p:340,h:24,c:'#7a5236',ins:.12,need:{diversion:0.6},sk:'musica',verb:'Escuchando vinilos',b:'🎶',decor:2,cat:'salon'},
  chimenea:{n:'Chimenea',e:'🔥',p:1100,h:46,c:'#c9b8a6',ins:.04,need:{diversion:0.45,social:0.1},verb:'Mirando el fuego',b:'🔥',decor:4,light:true,cat:'salon'},
  acuario:{n:'Acuario',e:'🐠',p:450,h:44,c:'#6ec1e4',ins:.1,need:{diversion:0.4},verb:'Mirando los peces',b:'🐠',decor:3,cat:'salon'},
  piano:{n:'Piano de cola',e:'🎹',p:5200,h:30,c:'#15151a',ins:.06,need:{diversion:0.9},sk:'musica',verb:'Tocando el piano',b:'🎹',decor:6,lux:1,cat:'salon'},
  muebar:{n:'Mueble bar',e:'🥃',p:1500,h:56,c:'#5a3825',ins:.06,need:{social:0.45,diversion:0.4},verb:'Sirviéndose una copa',b:'🥃',decor:3,lux:1,cat:'salon'},
  butano:{n:'Estufa de butano',e:'🧯',p:75,h:30,c:'#d9d4c8',ins:.25,need:{diversion:0.2},pobre:1,verb:'Calentándose las manos',b:'🔥',cat:'salon'},
  // estudio
  escritorio:{n:'Escritorio',e:'✏️',p:280,h:24,c:'#b08060',ins:.06,need:{diversion:0.35},sk:'logica',verb:'Estudiando',b:'📝',decor:1,cat:'estudio'},
  pizarra:{n:'Pizarra',e:'📋',p:140,h:54,c:'#f4f6f7',ins:.1,need:{diversion:0.3,social:0.15},sk:'carisma',verb:'Ensayando una presentación',b:'🗣️',cat:'estudio'},
  coser:{n:'Máquina de coser',e:'🧵',p:260,h:44,c:'#2b2f36',ins:.1,need:{diversion:0.5},verb:'Cosiendo y arreglando ropa',b:'🧵',cat:'estudio'},
  // deco
  cuadro:{n:'Cuadro',e:'🖼️',p:150,h:46,c:'#b08d57',ins:.3,decor:3,cat:'deco'},
  poster:{n:'Póster',e:'📜',p:25,h:44,c:'#c0392b',ins:.3,decor:1,cat:'deco'},
  espejopie:{n:'Espejo de pie',e:'🪞',p:240,h:56,c:'#c7a46b',ins:.3,need:{social:0.5},sk:'carisma',verb:'Mirándose al espejo',b:'💁',decor:2,cat:'deco'},
  lamparco:{n:'Lámpara de arco',e:'💡',p:180,h:50,c:'#c9a24a',ins:.3,decor:3,light:true,cat:'deco'},
  lampapel:{n:'Lámpara de papel',e:'🏮',p:60,h:36,c:'#f7efe0',ins:.3,decor:2,light:true,cat:'deco'},
  cortinas:{n:'Cortinas',e:'🪟',p:90,h:54,c:'#c45b5b',ins:.3,decor:2,cat:'deco'},
  alfpersa:{n:'Alfombra persa',e:'🟫',p:260,h:1,c:'#a8323e',ins:.04,decor:4,flat:true,cat:'deco'},
  alfred:{n:'Alfombra redonda',e:'🟠',p:90,h:1,c:'#e9a23b',ins:.04,decor:2,flat:true,cat:'deco'},
  alfyute:{n:'Alfombra de yute',e:'🟨',p:60,h:1,c:'#cdb58a',ins:.04,decor:2,flat:true,cat:'deco'},
  monstera:{n:'Monstera',e:'🌿',p:140,h:34,c:'#2f7a3f',ins:.3,decor:4,green:1,need:{diversion:0.25},verb:'Limpiando las hojas',b:'💧',sk:'jard',cat:'deco'},
  kentia:{n:'Palmera de interior',e:'🌴',p:180,h:44,c:'#3f8f4a',ins:.3,decor:4,green:1,need:{diversion:0.25},verb:'Regando la palmera',b:'💧',sk:'jard',cat:'deco'},
  jaula:{n:'Jaula con periquito',e:'🐦',p:130,h:52,c:'#c9a24a',ins:.3,need:{diversion:0.35,social:0.25},verb:'Hablando con el periquito',b:'🐦',decor:2,cat:'deco'},
  // jardín
  hamaca:{n:'Hamaca',e:'🏝️',p:160,h:34,c:'#e76f51',ins:.1,need:{diversion:0.55},wx:1,verb:'Meciéndose en la hamaca',b:'🍃',decor:1,cat:'garden'},
  columpio:{n:'Columpio',e:'🎠',p:220,h:56,c:'#8a5d39',ins:.1,need:{diversion:0.65},wx:1,verb:'Columpiándose',b:'😄',decor:1,cat:'garden'},
  elastica:{n:'Cama elástica',e:'🤸',p:350,h:14,c:'#3a86ff',ins:.05,need:{diversion:0.75},wx:1,verb:'Saltando en la cama elástica',b:'🤸',cat:'garden'},
  caseta:{n:'Caseta del perro',e:'🐕',p:280,h:38,c:'#b5653a',ins:.1,need:{social:0.55,diversion:0.3},verb:'Jugando con el perro',b:'🐶',decor:2,cat:'garden'},
  tendedero:{n:'Tendedero',e:'👕',p:40,h:32,c:'#c0c6cc',ins:.1,need:{higiene:0.6},quick:1,wx:1,verb:'Tendiendo la ropa',b:'👕',cat:'garden'},
  compost:{n:'Compostera',e:'♻️',p:70,h:22,c:'#7a5230',ins:.12,need:{diversion:0.2},sk:'jard',verb:'Echando restos al compost',b:'♻️',green:1,cat:'garden'},
  parrilla:{n:'Parrilla de obra',e:'🧱',p:650,h:30,c:'#b5553a',ins:.06,need:{hambre:1.5,social:0.25},food:2,wx:1,sk:'cocina',verb:'Asando en la parrilla',b:'🥩',decor:2,cat:'garden'},
});
const MUEB_NEW=['encimera','micro','lavavaj','cafetera','mesacoc','banera','lavabo','lavadora','camamat','litera','colchon','armario','comoda','mesilla','cuna','sillon','butaca','sofacama','estant','mesabaja','consola','tocadisc','chimenea','acuario','piano','muebar','butano','escritorio','pizarra','coser','cuadro','poster','espejopie','lamparco','lampapel','cortinas','alfpersa','alfred','alfyute','monstera','kentia','jaula','hamaca','columpio','elastica','caseta','tendedero','compost','parrilla'];
// suelos y paredes nuevos
Object.assign(FLOORS,{
  10:{n:'Terrazo',c:'#e7e1d6',p:16,pat:'terrazo'},11:{n:'Hidráulico',c:'#ece2cc',p:20,pat:'hidra'},12:{n:'Linóleo',c:'#b9c98f',p:7,pat:'lino'},
  13:{n:'Hormigón pulido',c:'#a9aba7',p:13,pat:'horm'},14:{n:'Césped artificial',c:'#72c25c',p:9,pat:'artif'},15:{n:'Tarima oscura',c:'#5a3a26',p:18,pat:'planks'},
  16:{n:'Espiga',c:'#c08a55',p:24,pat:'espiga'},17:{n:'Barro cocido',c:'#b8653f',p:11,pat:'check'},18:{n:'Damero',c:'#f2f1ec',p:15,pat:'damero'},19:{n:'Corcho',c:'#c79a62',p:10,pat:'corcho'}});
FLOOR_ORDER.splice(FLOOR_ORDER.indexOf(3)+1,0,15,16,10,11,18,17,12,13,19);FLOOR_ORDER.splice(FLOOR_ORDER.indexOf(0),0,14);
WALLCOLS.push(['#e8d7c3','Arena'],['#a9bfa3','Salvia'],['#d98e6e','Terracota'],['#f2bfa6','Melocotón'],['#4b6b8a','Azul petróleo'],['#7e3b46','Burdeos'],['#e2bb4f','Mostaza'],
  ['#f1e4cc','Papel de rayas','rayas','#d6b88a'],['#e3ece4','Papel de flores','flores','#e58fa0'],['#efe6d5','Papel de rombos','rombos','#b8956a'],['#eef3f6','Azulejo blanco','azulejo','#b8c6cf'],
  ['#8fb8d6','Papel de lunares','lunares','#f4f8fb'],['#2f4a3f','Papel selva','hojas','#5e9a66'],['#d8c8e8','Papel de cuadros','cuadros','#b49ad0']);
// dónde va cada cosa, cómo se agrupa, oficio para montarlo o fabricarlo, desgaste, respaldo contra la pared…
Object.assign(OBJ_ZONES,{encimera:['cocina'],micro:['cocina','salon'],lavavaj:['cocina'],cafetera:['cocina','salon','estudio'],mesacoc:['cocina'],banera:['bano'],lavabo:['bano'],lavadora:['bano','cocina','pasillo','taller'],
  camamat:['dormitorio'],litera:['dormitorio'],colchon:['dormitorio','salon','libre'],armario:['dormitorio','pasillo'],comoda:['dormitorio','salon','pasillo'],mesilla:['dormitorio'],cuna:['dormitorio'],
  sillon:['salon','dormitorio','estudio'],butaca:['salon','estudio','dormitorio'],sofacama:['salon','libre','dormitorio'],estant:['salon','estudio','dormitorio','pasillo'],mesabaja:['salon'],consola:['salon','dormitorio'],tocadisc:['salon','estudio','dormitorio'],
  chimenea:['salon'],acuario:['salon','estudio','dormitorio'],piano:['salon','estudio'],muebar:['salon'],butano:['salon','dormitorio','estudio','cocina','bano'],escritorio:['estudio','dormitorio','salon'],pizarra:['estudio','taller'],coser:['estudio','taller','dormitorio'],
  cuadro:['salon','dormitorio','estudio','pasillo','cocina'],poster:['dormitorio','estudio','salon','taller'],espejopie:['dormitorio','bano'],lamparco:['salon','estudio','dormitorio'],lampapel:['dormitorio','salon','estudio'],cortinas:['salon','dormitorio','estudio','cocina'],
  alfpersa:['salon','dormitorio','estudio'],alfred:['salon','dormitorio','estudio'],alfyute:['salon','dormitorio','estudio','pasillo'],monstera:['salon','estudio','dormitorio','pasillo'],kentia:['salon','estudio','pasillo','dormitorio'],jaula:['salon','cocina','estudio'],
  hamaca:['jardin'],columpio:['jardin'],elastica:['jardin'],caseta:['jardin'],tendedero:['jardin','taller'],compost:['jardin'],parrilla:['jardin']});
Object.assign(ZONE_OF,{banera:'bano',camamat:'dormitorio',litera:'dormitorio',escritorio:'estudio'});
Object.assign(GROUP,{encimera:'cocina',micro:'cocina',lavavaj:'cocina',cafetera:'cocina',mesacoc:'cocina',banera:'bano',lavabo:'bano',lavadora:'bano',camamat:'dorm',litera:'dorm',colchon:'dorm',armario:'dorm',comoda:'dorm',mesilla:'dorm',cuna:'dorm',
  sillon:'ocio',butaca:'ocio',sofacama:'ocio',consola:'ocio',tocadisc:'ocio',piano:'ocio',muebar:'ocio',escritorio:'ocio',pizarra:'ocio',coser:'ocio'});
Object.assign(CRAFT,{encimera:['carp',1,4],micro:['elec',1,8],lavavaj:['font',2,9],cafetera:['elec',0,5],mesacoc:['carp',0,2],banera:['font',3,8],lavabo:['font',1,6],lavadora:['font',2,9],camamat:['carp',1,5],litera:['carp',1,5],colchon:['carp',0,1],
  armario:['carp',1,5],comoda:['carp',1,4],mesilla:['carp',0,2],cuna:['carp',1,4],sillon:['carp',1,6],butaca:['carp',1,5],sofacama:['carp',1,5],estant:['carp',0,3],mesabaja:['carp',0,2],consola:['elec',1,10],tocadisc:['elec',1,7],
  chimenea:['alba',2,7],acuario:['font',1,6],piano:['carp',3,10],muebar:['carp',1,6],butano:['font',1,9],escritorio:['carp',0,3],pizarra:['carp',0,2],coser:['elec',1,8],cuadro:['carp',0,2],poster:['carp',0,0],espejopie:['carp',1,5],
  lamparco:['elec',1,4],lampapel:['elec',0,2],cortinas:['carp',0,1],alfpersa:['carp',0,6],alfred:['carp',0,3],alfyute:['carp',0,2],monstera:['jard',0,1],kentia:['jard',0,2],jaula:['carp',0,3],hamaca:['carp',0,2],columpio:['carp',1,3],
  elastica:['carp',1,7],caseta:['carp',0,3],tendedero:['carp',0,1],compost:['jard',0,1],parrilla:['alba',1,4]});
Object.assign(WEARMUL,{camamat:0.09,litera:0.09,colchon:0.12,sofacama:0.15,sillon:0.35,butaca:0.4,consola:0.4,tocadisc:0.45,piano:0.3,escritorio:0.45,coser:0.5,armario:0.5,chimenea:0.3,acuario:0.4,hamaca:0.4,columpio:0.5,elastica:0.5});
Object.assign(BACKD,{encimera:.06,micro:.15,lavavaj:.1,cafetera:.25,banera:.04,lavabo:.2,lavadora:.1,camamat:.02,litera:.05,armario:.1,comoda:.28,mesilla:.25,sillon:.15,sofacama:.1,estant:.3,consola:.3,tocadisc:.3,chimenea:.04,
  acuario:.28,muebar:.3,escritorio:.2,pizarra:.38,cuadro:.42,poster:.44,cortinas:.4,coser:.2});
for(const t of ['micro','lavavaj','cafetera','lavadora','consola','tocadisc','acuario','mesilla','lamparco','lampapel','coser'])ELECTRIC.add(t);
for(const t of ['banera','camamat','litera','colchon','sofacama','sillon','butaca','hamaca','columpio','elastica'])ONOBJ.add(t);
for(const t of ['mesacoc','escritorio'])SEATED.add(t);
for(const t of ['mesacoc','cafetera','micro','mesilla','cuadro','poster','lamparco','lampapel','cortinas','alfpersa','alfred','alfyute','monstera','kentia','jaula','butano','mesabaja','tendedero','compost','hamaca','columpio','caseta','elastica','parrilla','estant','comoda','cuna','lavabo'])SMALL_ITEMS.add(t);
Object.assign(ACTS,{encimera:'stir',micro:'stir',cafetera:'eat',lavabo:'shower',lavadora:'stir',armario:'talk',consola:'phone',acuario:'watch',piano:'type',muebar:'eat',escritorio:'book',pizarra:'paint',coser:'type',espejopie:'talk',
  jaula:'talk',caseta:'stir',tendedero:'paint',compost:'dig',parrilla:'stir',chimenea:'watch',butano:'watch',monstera:'stir',kentia:'stir',tocadisc:'watch'});
{const fv=(k,...t)=>{FAVS[k]=(FAVS[k]||[]).concat(t);};fv('perezosa','sillon','consola');fv('solitaria','butaca','consola','acuario');fv('artista','tocadisc','piano');fv('naturaleza','monstera','kentia','jaula','acuario','compost');
  fv('sociable','muebar','caseta','jaula');fv('manitas','coser');fv('trabajadora','escritorio','pizarra');fv('derrochadora','armario','muebar');fv('ahorradora','coser');fv('ordenada','armario');fv('cocinillas','cafetera');}
// camas: la lógica de dormir (siesta, despertador, seguir dormida de noche) vale para todas
function isBedT(t){return t==='cama'||!!(OBJ[t]&&OBJ[t].bed);}
function bedUse(u){return !!u&&isBedT(u.type)&&(u.type==='cama'||u.goal==='energia');}
// rasgos, ideología, estación y objetos que se complementan
{const _tb=traitBoost;traitBoost=function(type){let b=_tb(type);
  const cold=seasonOf()==='inv'||(S.weather&&S.weather.k==='nieve');
  switch(type){
    case 'sillon':case 'sofacama':if(T('perezosa'))b*=1.4;break;
    case 'butaca':case 'escritorio':if(T('solitaria')||T('trabajadora'))b*=1.25;break;
    case 'tocadisc':case 'piano':if(T('artista'))b*=1.5;break;
    case 'monstera':case 'kentia':case 'jaula':case 'acuario':if(T('naturaleza'))b*=1.6;break;
    case 'compost':case 'tendedero':if(isI('ecologista'))b*=1.8;if(T('naturaleza'))b*=1.3;break;
    case 'lavadora':case 'lavabo':if(T('ordenada'))b*=1.5;break;
    case 'muebar':if(T('sociable'))b*=1.3;if(T('derrochadora'))b*=1.3;if(isI('liberal','libertaria'))b*=1.15;break;
    case 'caseta':if(T('sociable'))b*=1.3;if(T('solitaria'))b*=1.2;break;
    case 'armario':if(T('derrochadora'))b*=1.5;break;
    case 'coser':if(T('ahorradora')||isI('ecologista','conservadora'))b*=1.4;break;
    case 'micro':if(T('perezosa'))b*=1.3;break;
    case 'parrilla':if(T('cocinillas'))b*=1.4;break;
    case 'pizarra':if(isI('marxista','anarquista','socialdemocrata'))b*=1.3;break;
    case 'chimenea':case 'butano':b*=cold?2:0.6;break;
    case 'consola':if(T('solitaria'))b*=1.2;break;
    case 'cafetera':if(T('trabajadora'))b*=1.2;break;
    case 'hamaca':case 'columpio':if(T('naturaleza'))b*=1.3;break;
  }
  if(type==='fogon'||type==='micro'||type==='encimera'||type==='parrilla'){if(has('lavavaj'))b*=1.1;if(type==='fogon'&&has('encimera'))b*=1.1;}
  if((type==='sofa'||type==='tele'||type==='sillon'||type==='consola')&&has('mesabaja'))b*=1.1;
  return b;};}
// necesidades leves: a veces se apaña con algo rápido (un táper, lavarse la cara, poner una lavadora)
{const _bo=bestObjFor;bestObjFor=function(k){
  const v=S.needs&&S.needs[k];
  if(v!=null&&v>=30&&v<75&&Math.random()<0.7){const q=findObjs(d=>d.quick&&d.need&&d.need[k]).filter(i=>usable(S.obj[i])&&outdoorOk(S.obj[i].t));
    if(q.length){const r=pathToObj([q[Math.random()*q.length|0]])||pathToObj(q);if(r)return r;}}
  if((k==='diversion'||k==='social')&&Math.random()<0.4){ // variedad: no siempre lo que más rinde; pesan los rasgos
    const c=findObjs((d,t)=>d.need&&d.need[k]>=0.3&&!d.need.energia&&!d.need.higiene).filter(i=>usable(S.obj[i])&&outdoorOk(S.obj[i].t));
    if(c.length>1){const w=c.map(i=>{const t=S.obj[i].t;return OBJ[t].need[k]*traitBoost(t)*((S.traits||[]).some(q=>(FAVS[q]||[]).includes(t))?2:1);});let r=Math.random()*w.reduce((a,b)=>a+b,0);
      for(let j=0;j<c.length;j++){r-=w[j];if(r<=0){const p=pathToObj([c[j]]);if(p)return p;break;}}}}
  if(k==='hambre'&&T('perezosa')&&Math.random()<0.6){const m=findObjs((d,t)=>t==='micro').filter(i=>usable(S.obj[i]));if(m.length){const r=pathToObj(m);if(r)return r;}}
  return _bo(k);};}
{const _su=startUse;startUse=function(){const s=S.sim,i=s.target;_su();const u=s.use;if(!u||u.i!==i||!S.obj[i])return;const t=u.type,d=OBJ[t];if(!d)return;const x=i%N+.5,y=(i/N|0)+.5;
  if(d.bed&&u.goal==='energia'){const h=S.t/60;u.nap=!(h>=20.5||h<6);if(u.nap)toast('😴 Ana se echa una siesta');}
  if(d.food&&u.goal==='hambre'&&Dm().food){const fc=Math.round(Dm().food*d.food*MK().price);if(fc>0){S.money-=fc;floatText('-'+fmt(fc)+' 🛒',x,y,40,'#c0392b');}}
  if(t==='cafetera')S.needs.energia=Math.min(100,S.needs.energia+10);
  if(t==='elastica')S.fit=Math.min(100,(S.fit||0)+1);
  if(t==='compost'&&has('huerto')&&Math.random()<.35){S.pantry=(S.pantry||0)+1;floatText('🌱 abono para el huerto',x,y,40,'#2e8b57');}
  if(t==='coser'&&Math.random()<.4){const sv=Math.round(6*PM());S.money+=sv;floatText('+'+fmt(sv)+' 🧵 ropa arreglada',x,y,40,'#2e8b57');}
  if(t==='lavadora'&&Dm().food){const fc=Math.round(Dm().food*0.3*MK().price);if(fc>0)S.money-=fc;}};}
{const _fx=tickFX;tickFX=function(dt){_fx(dt);const s=S.sim;if(speed===0||menu.classList.contains('open')||s.work||!s.use||s.use.i==null)return;
  const t=s.use.type,d=OBJ[t];if(!d)return;const i=s.use.i,ox=i%N+.5,oy=(i/N|0)+.5,r=()=>(Math.random()-.5);
  if(d.bed&&t!=='cama'&&s.use.goal==='energia'&&every('zzm',1.1,dt))emit('z',ox,oy,t==='colchon'?14:t==='litera'?22:26,{vz:16,vx:.08,life:2.2});
  switch(t){
    case 'banera':case 'lavadora':if(every('bb',0.35,dt))emit('emoji',ox+r()*.5,oy+r()*.5,t==='banera'?20:30,{vz:14,life:1.4,txt:'🫧',size:.6});break;
    case 'tocadisc':case 'piano':if(every('nt2',0.5,dt))emit('note',ox+r()*.3,oy+r()*.3,48,{vz:22,vx:r()*.3,life:1.8,txt:Math.random()<.5?'♪':'♫',col:['#9b5de5','#f15bb5','#3a86ff'][Math.random()*3|0]});break;
    case 'consola':if(every('cs',1.5,dt))emit('emoji',s.x,s.y,56,{vz:12,life:1.3,txt:['🎮','⭐','🏆','😤'][Math.random()*4|0],size:.75});break;
    case 'parrilla':if(every('pq',0.3,dt))emit('smoke',ox,oy-.2,50,{vz:20,vx:r()*.15,life:1.6});break;
    case 'cafetera':case 'micro':if(every('cf',0.5,dt))emit('steam',ox,oy,34,{vz:16,vx:r()*.1,life:1.2});break;
    case 'jaula':if(every('jl',0.9,dt))emit('note',ox,oy,52,{vz:18,vx:r()*.3,life:1.4,txt:'♪',col:'#7cc46a'});break;
    case 'caseta':if(every('dg',1.3,dt))emit('emoji',ox,oy,34,{vz:14,life:1.4,txt:['❤️','🦴','🐾'][Math.random()*3|0],size:.7});break;
    case 'muebar':if(every('mb',1.8,dt))emit('emoji',s.x,s.y,58,{vz:12,life:1.4,txt:['🥂','🍸','😊'][Math.random()*3|0],size:.75});break;
    case 'chimenea':case 'butano':if(every('fp',0.4,dt))emit('spark',ox,oy,14,{vz:40,vx:r()*.2,vy:r()*.2,life:.6,col:'#ffb347'});break;
    case 'elastica':case 'columpio':if(every('jm',1.6,dt))emit('emoji',ox,oy,60,{vz:14,life:1.2,txt:['😄','🎉','✨'][Math.random()*3|0],size:.7});break;
    case 'coser':case 'escritorio':case 'pizarra':if(every('ws',1.7,dt))emit('emoji',s.x,s.y,56,{vz:12,life:1.3,txt:t==='coser'?'🧵':t==='pizarra'?'💡':'📝',size:.7});break;
  }};}
// deseos de Ana: según rasgos, ideología, bolsillo, estación y familia
function muebWant(){
  const c=[],add=(t,why,p)=>{if(p>0&&!has(t)&&!c.some(x=>x[0]===t))c.push([t,why,p]);};const sp=spare();
  if(has('fogon'))add('encimera','para tener dónde cortar',1);
  if(T('perezosa')){add('micro','para no tener que cocinar',2);add('sillon','para tumbarse a gusto',2);add('consola','para jugar sin moverse',1.5);}
  if(T('ordenada')){add('lavadora','para tener la ropa siempre limpia',2);add('lavabo','para lavarse las manos',1.5);add('armario','para tenerlo todo en su sitio',1.5);}
  if(T('artista')){add('tocadisc','para escuchar vinilos',2);if(sp>priceOf('piano',3)*1.4)add('piano','porque siempre soñó con uno',3);}
  if(T('naturaleza')){add('monstera','porque adora las plantas',2);add('kentia','porque adora las plantas',1);add('jaula','para tener compañía con plumas',1);add('hamaca','para el jardín',1);}
  if(T('sociable')){add('caseta','porque quiere un perro',1.5);add('cafetera','para invitar a un café',1);}
  if(T('solitaria')||T('trabajadora')){add('butaca','para leer tranquila',2);add('escritorio','para estudiar',1.5);}
  if(T('cocinillas')){add('mesacoc','para comer en la cocina',1.5);add('parrilla','para asar como es debido',1);add('cafetera','para el café de la mañana',1);}
  if(T('derrochadora')){add('muebar','por darse un capricho',sp>2500?1.5:0);add('alfpersa','por darse un capricho',1.5);add('lamparco','por darse un capricho',1);}
  if(T('ahorradora')){add('coser','para arreglarse la ropa',1.5);add('tendedero','para no gastar en secadora',1.5);}
  if(isI('ecologista')){add('compost','para cerrar el ciclo del huerto',has('huerto')?2:0.8);add('tendedero','porque la secadora es un despilfarro',2);add('alfyute','fibra natural',0.6);}
  if(isI('marxista','anarquista')){add('poster','para que se sepa de qué lado está',1.5);add('pizarra','para preparar las asambleas',1);}
  if(isI('conservadora')){add('cuadro','para darle un aire de hogar',1.5);add('comoda','para guardar el ajuar',1);}
  if(isI('liberal','libertaria'))add('muebar','para recibir a sus contactos',sp>2500?1:0);
  if((S.kids||[]).some(k=>kidAge(k)<3))add('cuna','para el bebé',5);
  if(liveIn()&&has('cama'))add('camamat','para dormir en pareja',3);
  if(seasonOf()==='inv')add(sp>priceOf('chimenea',3)*2?'chimenea':'butano','para pasar el invierno',2);
  add('cafetera','para el café',0.6);add('cortinas','para vestir las ventanas',0.6);if(has('cama'))add('mesilla','para dejar el libro y el móvil',0.7);add('estant','para colocar sus cosas',0.5);
  add('mesabaja','para dejar el café',has('sofa')?0.8:0);add('lavadora','para no ir a la lavandería',has('ducha')?0.9:0);add('banera','para darse baños',sp>1500?0.8:0);add('cuadro','para alegrar las paredes',0.5);
  add('columpio','para el jardín',0.3);add('acuario','para relajarse mirando peces',0.4);add('espejopie','para arreglarse',0.4);add('alfred','para el suelo',0.4);add('lampapel','para una luz suave',0.4);
  const ok=c.filter(([t])=>priceOf(t,2)<=Math.max(150,sp*1.3));if(!ok.length)return null;
  let tot=ok.reduce((a,x)=>a+x[2],0),r=Math.random()*tot;for(const [t,why,p] of ok){r-=p;if(r<=0)return wantFor(t,why);}return null;}
{const _cw=chooseWant;chooseWant=function(){let w=_cw();
  try{
    // clase: si no llega para una cama de verdad, un colchón en el suelo; en invierno sin calefacción, una estufa de butano
    if(w&&w.key==='buy-cama'&&spare()<priceOf('cama',2)){const c=wantFor('colchon','no llega para una cama de verdad',true);if(c)return c;}
    if(seasonOf()==='inv'&&!has('butano')&&!has('chimenea')&&spare()<priceOf('chimenea',3)&&spare()>=priceOf('butano',3)&&Math.random()<.3&&(!w||w.kind==='buy'||w.key==='paint')){const b=wantFor('butano','porque en casa hace un frío que pela');if(b)return b;}
    const low=!w||w.key==='paint'||w.key==='pool'||w.key==='win'||(w.kind==='buy'&&!w.urgent&&/^buy-(lampara|planta|alfombra|flores|arbol|seto|guitarra|bancoj|barbacoa|fuente|libros|banco|huerto)$/.test(w.key));
    if(low&&Math.random()<0.5){const m=muebWant();if(m)return m;}
  }catch(e){console.error(e);}
  return w;};}
