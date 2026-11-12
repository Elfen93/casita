// ---------- muebles: catálogo ampliado (cocina, baño, dormitorio, salón, estudio, deco y jardín) ----------
// quick: se usa para necesidades leves (tentempié, lavarse la cara); bed: sirve para dormir; table: mesa con sillas;
// food: coste de comida al usarlo para comer; wx: depende del tiempo; lux/pobre: muebles que marcan clase
const MUEB_NEW=['encimera','micro','lavavaj','cafetera','mesacoc','banera','lavabo','lavadora','camamat','litera','colchon','armario','comoda','mesilla','cuna','sillon','butaca','sofacama','estant','mesabaja','consola','tocadisc','chimenea','acuario','piano','muebar','butano','escritorio','pizarra','coser','cuadro','poster','espejopie','lamparco','lampapel','cortinas','alfpersa','alfred','alfyute','monstera','kentia','jaula','hamaca','columpio','elastica','caseta','tendedero','compost','parrilla'];
// dónde va cada cosa, cómo se agrupa, oficio para montarlo o fabricarlo, desgaste, respaldo contra la pared…
Object.assign(BACKD,{encimera:.06,micro:.15,lavavaj:.1,cafetera:.25,banera:.04,lavabo:.2,lavadora:.1,camamat:.02,litera:.05,armario:.1,comoda:.28,mesilla:.25,sillon:.15,sofacama:.1,estant:.3,consola:.3,tocadisc:.3,chimenea:.04,
  acuario:.28,muebar:.3,escritorio:.2,pizarra:.38,cuadro:.42,poster:.44,cortinas:.4,coser:.2});
for(const t of ['micro','lavavaj','cafetera','lavadora','consola','tocadisc','acuario','mesilla','lamparco','lampapel','coser'])ELECTRIC.add(t);
for(const t of ['banera','camamat','litera','colchon','sofacama','sillon','butaca','hamaca','columpio','elastica'])ONOBJ.add(t);
for(const t of ['mesacoc','escritorio'])SEATED.add(t);
for(const t of ['mesacoc','cafetera','micro','mesilla','cuadro','poster','lamparco','lampapel','cortinas','alfpersa','alfred','alfyute','monstera','kentia','jaula','butano','mesabaja','tendedero','compost','hamaca','columpio','caseta','elastica','parrilla','estant','comoda','cuna','lavabo'])SMALL_ITEMS.add(t);
Object.assign(ACTS,{encimera:'stir',micro:'stir',cafetera:'eat',lavabo:'shower',lavadora:'stir',armario:'talk',consola:'phone',acuario:'watch',piano:'type',muebar:'eat',escritorio:'book',pizarra:'paint',coser:'type',espejopie:'talk',
  jaula:'talk',caseta:'stir',tendedero:'paint',compost:'dig',parrilla:'stir',chimenea:'watch',butano:'watch',monstera:'stir',kentia:'stir',tocadisc:'watch'});
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
