// =================== TODO SE PUEDE TOCAR: cada objeto con sus cosas que hacer, y el toque acierta aunque el mueble sea alto ===================
const _bed=[['dormir','🛏️','Dormir',0,null,0,0,{}],['siesta','😴','Siesta corta',45,null,0,0,{},'siesta'],['techo','💭','Mirar al techo y pensar',20,null,0,0,{diversion:.1},'techo'],['leercama','📖','Leer en la cama',40,'logica',0,0,{diversion:.12},'libro'],['movil','📱','Móvil en la cama',25,null,0,0,{diversion:.3,energia:-.05},'movil']];
const _seat=[['sentarse','🪑','Sentarse un rato',20,null,0,0,{diversion:.15}],['leer','📖','Seguir con su libro',60,'logica',0,0,{diversion:.14},'libro'],['movil','📱','Mirar el móvil',20,null,0,0,{diversion:.3},'movil'],['siesta','😴','Cabezadita',40,null,0,0,{energia:.4},'siesta']];
Object.assign(ACTV,{
  vater:[['usar','🚽','Ir al baño',5,null,0,0,{}],['movil','📱','Baño con móvil (se le va la hora)',20,null,0,0,{diversion:.3},'movil'],['limpiar','🧽','Limpiar el baño',25,null,0,0,{diversion:-.1},'limpiar']],
  telefono:[['llamar','☎️','Llamar a alguien',15,null,0,0,{social:.8},'llamar'],['madre','👩‍🦳','Llamar a su madre',20,null,0,0,{social:.6},'madre']],
  banco:[['brico','🛠️','Bricolaje',40,'carp',0,0,{}],['arreglar','🔧','Arreglar lo que esté roto',45,'carp',1,0,{},'arreglar']],
  flores:[['regar','💧','Regar',8,'jard',0,0,{}],['ramo','💐','Cortar un ramo',10,null,0,0,{diversion:.4},'ramo']],
  huerto:[['cuidar','🌱','Cuidar el huerto',40,'jard',0,0,{}],['cosechar','🥕','Cosechar',20,'jard',0,0,{},'cosechar']],
  bancoj:[['aire','🌤️','Tomar el aire',20,null,0,0,{diversion:.3}],['leer','📖','Leer fuera',45,'logica',0,0,{diversion:.12},'libro']],
  barbacoa:[['asar','🔥','Hacer una barbacoa',90,'cocina',0,6,{hambre:.6,diversion:.3,social:.3},'bbq']],
  parrilla:[['asar','🔥','Asar en la parrilla',70,'cocina',0,5,{hambre:.6,diversion:.3,social:.3},'bbq']],
  micro:[['taper','🥡','Calentar un táper',6,null,0,0,{},'taper'],['palomitas','🍿','Palomitas',5,null,0,0,{diversion:.3,hambre:.5}]],
  lavabo:[['cara','💦','Lavarse la cara',4,null,0,0,{}],['dientes','🪥','Lavarse los dientes',5,null,0,0,{}],['afeitar','🪒','Afeitarse / depilarse',15,null,0,0,{},'guapo']],
  lavadora:[['lavar','🧺','Poner una lavadora',12,null,0,0,{},'lavar']],
  armario:[['ropa','👗','Probarse ropa',15,null,0,0,{diversion:.3},'guapo'],['ordenar','🧹','Ordenar el armario',30,null,0,0,{diversion:.1},'ordenarropa']],
  sillon:_seat,litera:_bed,colchon:_bed,sofacama:[..._bed,['sentarse','🪑','Sentarse un rato',20,null,0,0,{diversion:.15}]],
  chimenea:[['fuego','🔥','Mirar el fuego',30,null,0,0,{diversion:.4}],['lena','🪵','Echar leña',5,null,0,0,{}]],
  acuario:[['mirar','🐟','Mirar los peces',15,null,0,0,{diversion:.5}],['dar','🥫','Dar de comer a los peces',4,null,0,0,{}]],
  muebar:[['copa','🥃','Una copa',15,null,0,0,{diversion:.4},'copa'],['copas','🍸','Copas con quien esté',40,null,0,0,{social:.6,diversion:.4},'copas']],
  butano:[['calor','🔥','Calentarse las manos',15,null,0,0,{energia:.1}]],
  kentia:[['regar','💧','Regar',8,'jard',0,0,{}],['hablar','🌱','Hablarle a la planta',6,null,0,0,{diversion:.6},'planta']],
  jaula:[['hablar','🦜','Hablar con el periquito',10,null,0,0,{diversion:.5,social:.3}],['limpiar','🧹','Limpiar la jaula',12,null,0,0,{}]],
  hamaca:[['mecerse','🌴','Mecerse',30,null,0,0,{diversion:.4,energia:.2}],['siesta','😴','Siesta en la hamaca',50,null,0,0,{energia:.5},'siesta']],
  columpio:[['columpiarse','🎠','Columpiarse',15,null,0,0,{diversion:.8}]],
  elastica:[['saltar','🤸','Saltar',20,null,0,0,{diversion:.9,energia:-.3},'fit']],
  caseta:[['perro','🐕','Jugar con el perro',20,null,0,0,{diversion:.7,social:.3}],['pasear','🦮','Sacar al perro',40,null,0,0,{diversion:.4,social:.3,energia:-.1},'pasear']],
  tendedero:[['tender','🧺','Tender la ropa',12,null,0,0,{}]],
  compost:[['echar','🪱','Echar restos al compost',5,'jard',0,0,{}]],
});
ACTV.ducha.push(['larga','🛀','Ducha larga, agua caliente',20,null,0,0,{diversion:.3,energia:.1},'duchalarga'],['afeitar','🪒','Afeitarse / depilarse',15,null,0,0,{},'guapo']);
ACTV.cama.push(_bed[3],_bed[4]);ACTV.camamat.push(_bed[3],_bed[4]);
ACTV.sofa.push(['movil','📱','Mirar el móvil',20,null,0,0,{diversion:.3},'movil'],['leer','📖','Seguir con su libro',60,'logica',0,0,{diversion:.14},'libro']);
ACTV.nevera.push(['limpiar','🧽','Limpiar la nevera',20,null,0,0,{diversion:-.1},'limpiar']);
ACTV.fogon.push(['limpiar','🧽','Limpiar la cocina',25,null,0,0,{diversion:-.1},'limpiar']);
ACTV.tele.push(['apagar','📴','Apagar y hacer otra cosa',1,null,0,0,{}]);
// qué pasa al terminar las nuevas
{const _af=actFinish;actFinish=function(u,frac){const a=ACT_DEF(u.type,u.act);const fx=a&&a[8];const mine=['limpiar','llamar','madre','arreglar','ramo','cosechar','bbq','taper','lavar','ordenarropa','copa','copas','fit','pasear','duchalarga','movil'];if(!mine.includes(fx))return _af.apply(this,arguments);
  const n=CH().name,x=u.i%N+.5,y=(u.i/N|0)+.5;const ft=(t,c='#2e8b57')=>floatText(t,x,y,46,c);if(frac<.6){if(frac>.15)ft('🤷 a medias','#8a7f99');return;}
  switch(fx){
    case 'limpiar':{S.clean=Math.min(100,(S.clean||50)+15);const o=S.obj[u.i];if(o&&o.c!=null)o.c=Math.min(100,o.c+6);ft('✨ limpio');if(Math.random()<.3)tell(pickR([`${n} ha limpiado. Nadie lo notará; sí notarían si no lo hiciera.`,`Limpiar es el trabajo que solo se ve cuando no se hace.`]),'🧽');break;}
    case 'llamar':{const ps=(S.people||[]).filter(p=>p.rel>=30&&p.k!=='madre');if(!ps.length){ft('☎️ nadie coge');break;}const p=pickR(ps);p.rel=Math.min(100,p.rel+4);p.last=S.day;ft('☎️ '+p.n);if(Math.random()<.4)tell(`${n} ha llamado a ${p.n}. ${pickR(['Media hora de nada y de todo.','Han quedado para el finde. Ya veremos.','Se ha reído por primera vez en el día.'])}`,'☎️');break;}
    case 'madre':{const m=P_('madre');if(!m){ft('☎️ …');break;}m.rel=Math.min(100,m.rel+5);m.last=S.day;S.needs.social=Math.min(100,S.needs.social+10);ft('☎️ mamá');if(Math.random()<.5)tell(`${n} ha llamado a su madre. ${pickR(['«¿Comes bien?»','Le ha preguntado por el trabajo tres veces.','Ha hablado de la vecina, de la tensión y del precio del aceite.','Al colgar se ha quedado un rato con el móvil en la mano.'])}`,'👩‍🦳');break;}
    case 'arreglar':{let best=-1,bc=101;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&o.c!=null&&o.c<bc&&!OBJ[o.t].big){bc=o.c;best=i;}}if(best<0||bc>=85){ft('🔧 nada que arreglar');break;}const o=S.obj[best];const q=qRoll('carp');o.c=Math.min(100,o.c+[5,20,35,50][q]);gainSkill('carp',10);ft(`🔧 ${OBJ[o.t].n} ${Q[q]}`);break;}
    case 'ramo':{S.needs.diversion=Math.min(100,S.needs.diversion+8);const m=homeMates();if(m.length){const p=pickR(m);p.rel=Math.min(100,p.rel+3);if(p.love!=null)p.love=Math.min(100,p.love+2);ft('💐 para '+p.n);}else ft('💐 en un vaso');break;}
    case 'cosechar':{const q=qRoll('jard');const v=[0,1,2,3][q];S.pantry=(S.pantry||0)+v;ft(v?`🥕 +${v} al despensa`:'🥕 aún verde');break;}
    case 'bbq':{const q=qRoll('cocina');const m=homeMates();S.needs.hambre=Math.min(100,S.needs.hambre+[10,30,40,45][q]);for(const p of m){p.rel=Math.min(100,p.rel+2+q);}ft(`🔥 ${Q[q]}`);tell(`Barbacoa ${m.length?'con '+m.map(p=>p.n).join(' y '):'para un'+oa()}. ${q>=2?'El humo ha llegado a tres portales. Nadie se ha quejado: olía demasiado bien.':'Carbón, paciencia y algo chamuscado.'}`,'🔥');break;}
    case 'taper':{if(!(S.tapers>0)){ft('🥡 no quedan tápers');break;}S.tapers--;S.needs.hambre=Math.min(100,S.needs.hambre+35);ft(`🥡 quedan ${S.tapers}`);break;}
    case 'lavar':{S.laundry=S.day;S.needs.higiene=Math.min(100,S.needs.higiene+5);ft('🧺 ropa limpia');if(Math.random()<.25)tell(pickR([`Lavadora puesta. ${n} se ha acordado de que hay que tenderla cuando ya estaba en la cama.`,`Un calcetín menos. Siempre.`]),'🧺');break;}
    case 'ordenarropa':ft('👕 armario ordenado');break;
    case 'copa':{try{const m=MT();m.alcDay=S.day;m.alc=Math.min(10,m.alc+.15);m.an=Math.min(100,m.an+2);}catch(e){}S.needs.diversion=Math.min(100,S.needs.diversion+8);ft('🥃');break;}
    case 'copas':{const m=homeMates();try{const mt=MT();mt.alcDay=S.day;mt.alc=Math.min(10,mt.alc+.2);}catch(e){}if(!m.length){ft('🍸 sol'+oa());break;}for(const p of m)p.rel=Math.min(100,p.rel+4);ft('🍸 con '+m.map(p=>p.n).join(' y '));break;}
    case 'fit':S.fit=Math.min(100,(S.fit||0)+2);ft('🤸 +forma');break;
    case 'pasear':{S.fit=Math.min(100,(S.fit||0)+1);try{HP().burn+=6;}catch(e){}ft('🦮 paseo');if(Math.random()<.3)tell(pickR([`Paseo con el perro. Ha saludado a tres vecinos que no sabía que conocía.`,`El perro ha hecho amigos. ${n}, casi.`]),'🐕');break;}
    case 'duchalarga':{S.needs.higiene=100;try{if(S.util)S.util.agua+=.3;}catch(e){}ft('🛀 agua caliente');if(Math.random()<.2)tell(`Ducha larga. El contador de agua lo sabrá a fin de mes.`,'🚿');break;}
    case 'movil':{ft('📱 '+pickR(['20 minutos que eran 5','un vídeo de un gato','noticias que no ayudan','a ver si ha contestado']));try{if(typeof phFeedDaily==='function'&&Math.random()<.3)S.needs.social=Math.min(100,S.needs.social+3);}catch(e){}break;}
  }};}
// ---- el toque: el mueble entero es tocable, no solo su casilla del suelo ----
function objAtScreen(sx,sy){let best=null,bd=-1e9;for(let i=0;i<N*N;i++){const o=S.obj[i];if(!o||!OBJ[o.t]||!ACTV[o.t])continue;const x=i%N,y=i/N|0;if(typeof inArea==='function'&&S.home&&!inArea(x,y)&&!OBJ[o.t].cat)continue;
    const [u,v]=w2v(x+.5,y+.5);const [bx,by]=P(u,v,0);const px=cam.x+bx*cam.z,py=cam.y+by*cam.z;const h=(OBJ[o.t].h||20)*cam.z;const dx=sx-px,dy=sy-py;
    if(Math.abs(dx)<=TW/2*cam.z*.85&&dy<=TH/2*cam.z&&dy>=-(h+TH/2*cam.z)){const depth=u+v;if(depth>bd){bd=depth;best=i;}}}return best;}
{const _lt=liveTap;liveTap=function(x,y){try{if(!viewPlace&&!(S.sim.work>0)){const r=resAtScreen(lastPtr[0],lastPtr[1]);if(!r){const i=objAtScreen(lastPtr[0],lastPtr[1]);if(i!=null){const o=S.obj[i];if(usable(o)){openObjMenu(i);sfx('tap');return;}}}}}catch(e){console.error(e);}return _lt.apply(this,arguments);};}
