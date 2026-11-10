// ---------- personalidad ----------
const TRAITS={
  trabajadora:{n:'Trabajadora',e:'💼',d:'Rinde más en el trabajo, gana reputación antes y prioriza estudiar.',no:'perezosa'},
  perezosa:{n:'Perezosa',e:'😴',d:'Se cansa antes, adora el sofá, rinde menos y prefiere pagar a hacerlo ella.',no:'trabajadora'},
  ahorradora:{n:'Ahorradora',e:'💰',d:'Guarda más, compra calidad básica o normal y se fabrica lo que puede.',no:'derrochadora'},
  derrochadora:{n:'Derrochadora',e:'🛍️',d:'Gasta con alegría, se da caprichos Premium y decora mucho.',no:'ahorradora'},
  sociable:{n:'Sociable',e:'🗣️',d:'Necesita hablar con gente a menudo; charlar le sienta de maravilla.',no:'solitaria'},
  solitaria:{n:'Solitaria',e:'🎧',d:'Apenas necesita socializar; prefiere leer y el ordenador.',no:'sociable'},
  manitas:{n:'Manitas',e:'🔨',d:'Aprende oficios el doble de rápido y casi nunca contrata a nadie.'},
  cocinillas:{n:'Cocinillas',e:'🍳',d:'Le encanta cocinar y comer sentada a la mesa; aprende cocina más rápido.'},
  naturaleza:{n:'Amante de la naturaleza',e:'🌿',d:'Quiere plantas y jardín; cuidarlas la relaja mucho.'},
  artista:{n:'Artista',e:'🎨',d:'Busca la guitarra a menudo y aprende música más rápido.'},
  ordenada:{n:'Ordenada',e:'🧹',d:'Se ducha más a menudo y arregla las cosas antes de que se rompan.'},
  puntual:{n:'Puntual',e:'⏰',d:'Sale antes hacia el trabajo y casi nunca llega tarde.',no:'despistada'},
  despistada:{n:'Despistada',e:'🙃',d:'Algunos días se le pasa la hora y llega tarde.',no:'puntual'}};
const T=k=>!!(S&&S.traits&&S.traits.includes(k));
const TRAIT_DECAY={energia:()=>T('perezosa')?1.2:1,social:()=>T('sociable')?1.6:T('solitaria')?0.45:1,higiene:()=>T('ordenada')?1.25:1};
function traitBoost(type){let b=1;
  if(type==='telefono'&&T('sociable'))b*=1.3;if((type==='fogon'||type==='_meal')&&T('cocinillas'))b*=1.4;
  if((type==='planta'||type==='flores')&&T('naturaleza'))b*=1.7;if(type==='guitarra'&&T('artista'))b*=1.5;
  if((type==='sofa'||type==='tele')&&T('perezosa'))b*=1.4;if((type==='libros'||type==='compu')&&(T('solitaria')||T('trabajadora')))b*=1.25;if(type==='banco'&&T('manitas'))b*=1.4;return b;}
function traitXP(k){let m=1;if(['carp','elec','font','alba','jard'].includes(k)&&T('manitas'))m*=2;if(k==='musica'&&T('artista'))m*=1.6;if(k==='cocina'&&T('cocinillas'))m*=1.6;if(k==='jard'&&T('naturaleza'))m*=1.6;if((k==='logica'||k==='carisma')&&T('trabajadora'))m*=1.3;return m;}
const FAVS={artista:['guitarra'],solitaria:['libros','compu'],sociable:['telefono'],naturaleza:['planta','flores'],perezosa:['tele','sofa'],manitas:['banco'],trabajadora:['libros','compu']};
function leaveTime(){return SHIFT.leave-(T('puntual')?0.3:0)+(T('despistada')?(S.distract||0):0);}
