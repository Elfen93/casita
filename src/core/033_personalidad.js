// ---------- personalidad ----------
const TRAITS=DATA.personas.rasgos;
const T=k=>!!(S&&S.traits&&S.traits.includes(k));
const TRAIT_DECAY={energia:()=>T('perezosa')?1.2:1,social:()=>T('sociable')?1.6:T('solitaria')?0.45:1,higiene:()=>T('ordenada')?1.25:1};
function traitBoost(type){let b=1;
  if(type==='telefono'&&T('sociable'))b*=1.3;if((type==='fogon'||type==='_meal')&&T('cocinillas'))b*=1.4;
  if((type==='planta'||type==='flores')&&T('naturaleza'))b*=1.7;if(type==='guitarra'&&T('artista'))b*=1.5;
  if((type==='sofa'||type==='tele')&&T('perezosa'))b*=1.4;if((type==='libros'||type==='compu')&&(T('solitaria')||T('trabajadora')))b*=1.25;if(type==='banco'&&T('manitas'))b*=1.4;return b;}
function traitXP(k){let m=1;if(['carp','elec','font','alba','jard'].includes(k)&&T('manitas'))m*=2;if(k==='musica'&&T('artista'))m*=1.6;if(k==='cocina'&&T('cocinillas'))m*=1.6;if(k==='jard'&&T('naturaleza'))m*=1.6;if((k==='logica'||k==='carisma')&&T('trabajadora'))m*=1.3;return m;}
const FAVS=DATA.personas.rasgos_objetos;
function leaveTime(){return SHIFT.leave-(T('puntual')?0.3:0)+(T('despistada')?(S.distract||0):0);}
