// =================== VIVIENDA: de la habitación compartida al chalet ===================
const HOMES={
  padres:{n:'En casa de su madre',e:'👩‍🦳',rent:45,build:'objs',buy:false,need:0,cls:0,d:'Su cuarto de siempre. No paga alquiler, solo pone algo para la compra. Cero intimidad, mucha compañía.',start:'vuelve a vivir en casa de su madre, en el cuarto de cuando era adolescente'},
  infra:{n:'Bajo interior',e:'🏚️',rent:105,build:'objs',buy:false,need:0,cls:1,damp:true,d:'Un cuarto sin luz con humedades. El casero no arregla nada y no hay contrato. Lo más barato que hay.',start:'acaba de meterse en un bajo interior sin contrato, con moho en las esquinas'},
  habitacion:{n:'Habitación en piso compartido',e:'🚪',rent:150,build:'objs',buy:false,need:0,cls:1,mates:2,d:'Una habitación para ella y el resto a compartir con dos desconocidos: cocina, baño y turnos de limpieza.',start:'acaba de alquilar una habitación en un piso compartido con dos desconocidos'},
  viejo:{n:'Piso viejo de alquiler',e:'🏢',rent:270,build:'objs',buy:true,price:9000,need:2.4,cls:2,d:'Un piso pequeño de los setenta: muebles cansados, ventanas que no cierran bien. Es suyo por dentro.',start:'acaba de alquilar un piso viejo de los setenta, pequeño y con muebles cansados'},
  casita:{n:'Casita con terreno',e:'🏡',rent:350,build:'all',buy:true,price:12000,need:2.6,cls:2,d:'Una casita pequeña con mucho terreno alrededor para ampliar, construir y plantar.',start:'acaba de mudarse a una casita de alquiler con lo justo: una cama, una nevera, una ducha y un váter'},
  bueno:{n:'Piso cómodo céntrico',e:'🏙️',rent:640,build:'objs',buy:true,price:26000,need:2.8,cls:3,d:'Tres habitaciones, buenos muebles, calefacción que funciona y portero. Caro, cómodo y lejos de los problemas.',start:'acaba de mudarse a un piso cómodo en el centro, con calefacción y portero'},
  chalet:{n:'Chalet con piscina',e:'🏊',rent:1350,build:'all',buy:true,price:60000,need:3,cls:4,d:'Casa grande con jardín, piscina y barbacoa. Para quien puede permitírselo.',start:'acaba de instalarse en un chalet con jardín y piscina'}};
const HOME_ORDER=['padres','infra','habitacion','viejo','casita','bueno','chalet'];
const HT=()=>HOMES[(S&&S.home&&S.home.type)||'casita'];
const homeArea=()=>(S&&S.home&&S.home.area)||[0,0,N-1,N-1];
function inArea(x,y){const a=homeArea();return x>=a[0]&&y>=a[1]&&x<=a[2]&&y<=a[3];}
// ---------- plantillas ----------
function homeTemplate(type){
  const fl=Array(N*N).fill(0),wl=Array(N*N).fill(0),wc=Array(N*N).fill(0),ob=Array(N*N).fill(null);const I=(x,y)=>y*N+x;
  const rect=(x0,y0,x1,y1,f,col)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){if(x===x0||x===x1||y===y0||y===y1){if(!wl[I(x,y)])wl[I(x,y)]=1;if(col!=null)wc[I(x,y)]=col;}else fl[I(x,y)]=f;}};
  const door=(x,y)=>{wl[I(x,y)]=2;fl[I(x,y)]=fl[I(x,y)]||1;},win=(x,y)=>{wl[I(x,y)]=3;};
  const o=(x,y,t,q=3,ex={})=>{ob[I(x,y)]={t,q,c:ex.c??100,...ex};};
  const path=(x,y0,y1)=>{for(let y=y0;y<=y1;y++)fl[I(x,y)]=4;};
  let area=[0,0,N-1,N-1],sim=[8.5,8.5],mates=[];
  if(type==='casita'){rect(6,6,11,10,1);door(8,10);win(11,8);o(7,7,'cama');o(10,7,'nevera');o(7,9,'ducha');o(10,9,'vater');path(8,11,N-1);o(3,4,'arbol');o(15,12,'arbol');o(7,11,'flores');o(16,5,'arbol');}
  else if(type==='infra'){rect(7,7,11,11,4,8);door(9,11);win(11,9);o(8,8,'cama',1,{c:55});o(10,8,'nevera',1,{c:50});o(8,10,'ducha',1,{c:45});o(10,10,'vater',1,{c:55});path(9,12,N-1);area=[8,8,10,10];sim=[9.5,9.5];}
  else if(type==='habitacion'||type==='padres'){rect(4,5,15,13,1);
    rect(4,5,8,9,1);door(6,9);rect(8,5,12,9,1);door(10,9);rect(12,5,15,9,2);door(13,9);rect(11,9,15,13,1);door(11,11);door(7,13);path(7,14,N-1);
    for(const [x,y] of [[4,7],[10,5],[4,11],[15,11],[14,5],[6,5]])win(x,y);
    for(let x=5;x<=10;x++)for(let y=10;y<=12;y++)fl[I(x,y)]=x<=6?2:1;
    o(5,6,'cama',type==='padres'?2:2);
    const pv=type==='padres'?'madre':'mate';
    o(11,6,'cama',3,{priv:pv});o(9,6,'lampara',2,{priv:pv});o(14,6,'ducha',2);o(13,6,'vater',2);o(14,8,'espejo',2);
    o(5,10,'nevera',2);o(5,11,'fogon',2);o(7,11,'mesa',2);o(8,12,'silla',2);o(9,12,'sofa',2);o(10,12,'tele',2);
    o(14,12,'cama',type==='padres'?3:2,{priv:pv});o(12,10,type==='padres'?'libros':'guitarra',2,{priv:pv});
    area=[5,6,7,8];sim=[6.5,7.5];mates=type==='padres'?['madre']:['m1','m2'];}
  else if(type==='viejo'){rect(5,6,14,13,1);rect(5,6,10,10,3);door(8,10);rect(10,6,14,10,2);door(11,10);door(9,13);path(9,14,N-1);
    for(const [x,y] of [[5,8],[14,11],[7,6],[5,11],[14,8]])win(x,y);for(let x=6;x<=13;x++)for(let y=11;y<=12;y++)fl[I(x,y)]=x<=8?2:1;
    o(6,7,'cama',2,{c:70});o(9,7,'libros',1,{c:60});o(12,7,'ducha',2,{c:65});o(13,7,'vater',2,{c:70});o(13,9,'espejo',1);o(6,11,'nevera',2,{c:60});o(7,11,'fogon',2,{c:65});o(10,11,'mesa',2);o(12,12,'sofa',1,{c:55});o(13,12,'tele',1,{c:60});
    area=[6,7,13,12];sim=[9.5,11.5];}
  else if(type==='bueno'){rect(4,5,15,14,6);rect(4,5,8,10,6);door(6,10);rect(8,5,12,10,6);door(10,10);rect(12,5,15,10,5);door(13,10);door(9,14);path(9,15,N-1);
    for(const [x,y] of [[6,5],[10,5],[4,7],[4,12],[15,12],[14,5],[15,8],[12,14]])win(x,y);for(let x=5;x<=7;x++)for(let y=11;y<=13;y++)fl[I(x,y)]=5;
    o(5,6,'cama',4);o(7,8,'lampara',3);o(9,6,'compu',3);o(11,6,'libros',4);o(13,6,'ducha',4);o(14,6,'vater',3);o(14,9,'espejo',3);
    o(5,11,'nevera',4);o(5,12,'fogon',4);o(7,13,'mesa',3);o(10,12,'sofa',4);o(12,11,'tele',4);o(14,13,'planta',3);o(11,13,'alfombra',3);o(14,11,'telefono',3);o(5,13,'planta',3);
    area=[5,6,14,13];sim=[9.5,12.5];}
  else if(type==='chalet'){rect(3,3,16,12,6);rect(3,3,8,7,6);door(5,7);rect(8,3,12,7,6);door(10,7);rect(12,3,16,7,5);door(14,7);rect(11,7,16,12,5);door(11,9);door(7,12);path(7,13,N-1);
    for(const [x,y] of [[5,3],[10,3],[14,3],[3,5],[3,9],[16,5],[16,10],[9,12],[13,12]])win(x,y);
    o(4,4,'cama',4);o(6,4,'lampara',4);o(9,4,'cama',4);o(11,5,'compu',4);o(13,4,'ducha',4);o(15,4,'vater',4);o(15,6,'espejo',4);
    o(4,8,'sofa',4);o(4,10,'tele',4);o(7,9,'alfombra',4);o(9,8,'libros',4);o(9,11,'planta',4);o(12,8,'nevera',4);o(13,8,'fogon',4);o(14,10,'mesa',4);o(15,8,'planta',3);
    for(let x=11;x<=15;x++)for(let y=14;y<=16;y++)fl[I(x,y)]=9;
    o(3,15,'arbol');o(17,4,'arbol');o(17,10,'arbol');o(2,9,'arbol');o(5,15,'barbacoa',4);o(8,16,'bancoj',4);o(9,14,'flores');o(17,14,'flores');o(2,13,'seto');o(3,13,'seto');
    sim=[6.5,9.5];}
  // muebles de espaldas a la pared
  for(let i=0;i<N*N;i++){const q=ob[i];if(!q)continue;const x=i%N,y=i/N|0;for(let r=0;r<4;r++){const dx=[0,1,0,-1][r],dy=[-1,0,1,0][r];const w=wl[(y+dy)*N+x+dx];if(w===1||w===3){q.r=r;break;}}if(q.r==null)q.r=0;}
  return {fl,wl,wc,ob,area,sim,mates};}
function applyHome(type){const T0=homeTemplate(type);S.floor=T0.fl;S.wall=T0.wl;S.wcol=T0.wc;S.obj=T0.ob;S.zone=Array(N*N).fill(0);S.weeds=[];
  S.home={type,area:T0.area,since:S.day,mates:[]};S.sim.x=T0.sim[0];S.sim.y=T0.sim[1];S.sim.path=[];S.sim.use=null;S.sim.target=null;S.sim.queue=[];S.held=null;S.job=null;S.want=null;S.npc=null;
  S.res=(S.res||[]).filter(r=>r.kind==='partner'||r.kind==='kid');S.rentMul=1;
  for(const k of T0.mates){if(k==='madre')S.home.mates.push('madre');else{const p=newMate();S.home.mates.push(p.k);}}
  if(typeof GRX!=='undefined')GRX=null;dirty();if(typeof undoStack!=='undefined'){undoStack=[];redoStack=[];}}
const MATE_JOBS=[['estudiante de Enfermería','estudiante de Enfermería'],['camarera','camarero'],['repartidora','repartidor'],['opositora','opositor'],['dependienta','dependiente'],['teleoperadora','teleoperador'],['informática en prácticas','informático en prácticas'],['estudiante de Erasmus','estudiante de Erasmus']];
function newMate(){const ch=randomChar();ch.age=20+(Math.random()*12|0);const p={k:'mate'+(S.pid=(S.pid||100)+1),n:ch.name,g:ch.g,ch,age:ch.age,ideo:pickR(IDEO_ORDER),orient:'ambos',relStyle:'libre',kids:'quiza',boda:'igual',job:'compañera',rel:25,love:0,stage:'conocida',met:'el piso',metDay:S.day,spark:0,e:'🛋️',mate:true,mjob:pickR(MATE_JOBS)[ch.g==='m'?1:0],hid:null};
  p.r=`comparte piso · ${p.mjob}`;S.people=S.people||[];S.people.push(p);return p;}
// ---------- reglas de construcción ----------
{const _ap=apply;apply=function(x,y,t=tool,quiet){const r=_ap.apply(this,arguments);if(!r&&!quiet&&t&&HT().build!=='all'&&inb(x,y)){const i=idx(x,y);const own=inArea(x,y)&&!(S.obj[i]&&S.obj[i].priv);const tk=(S.home&&S.home.type)||'casita';
    if((!own||['wall','fence','door','win','floor'].includes(t.kind))&&throttled('ajeno',2500))toast(['wall','fence','door','win','floor'].includes(t.kind)?`🔒 En ${HOMES[tk].n.toLowerCase()} no se pueden hacer obras: las paredes no son tuyas`:tk==='padres'?'🔒 Eso es de tu madre: solo puedes tocar lo de tu cuarto':tk==='habitacion'?'🔒 Eso es de tus compañeros de piso: solo puedes tocar lo de tu cuarto':'🔒 Eso no es tuyo');}return r;};}
{const _ca=canApply;canApply=function(x,y,t){if(!_ca(x,y,t))return false;if(HT().build==='all')return true;const k=t.kind;
  if(k==='obj'||k==='move'||k==='rot'||k==='craft')return inArea(x,y)&&!(S.obj[idx(x,y)]&&S.obj[idx(x,y)].priv);
  if(k==='paint'){const a=homeArea();return x>=a[0]-1&&y>=a[1]-1&&x<=a[2]+1&&y<=a[3]+1;}
  if(k==='del'){const i=idx(x,y);return inArea(x,y)&&!!S.obj[i]&&!S.obj[i].priv&&!S.wall[i];}
  return false;};}
{const _ps=pickSpot;pickSpot=function(t,onlyRoom){if(HT().build==='all')return _ps.apply(this,arguments);const saved=S.wall.slice();const a=homeArea();
  // tapar temporalmente lo que no es suyo para que solo elija dentro de su espacio
  const blocked=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!inArea(x,y)&&!S.wall[i]&&!S.obj[i]){S.obj[i]={t:'silla',_tmp:1};blocked.push(i);}}
  try{return _ps.apply(this,arguments);}finally{for(const i of blocked)S.obj[i]=null;}};}
{const _pr=planRoom;planRoom=function(){return HT().build==='all'?_pr.apply(this,arguments):null;};const _pp=planPool;planPool=function(){return HT().build==='all'?_pp.apply(this,arguments):null;};const _pw=planWindows;planWindows=function(){return HT().build==='all'?_pw.apply(this,arguments):null;};}
{const _fo=findObjs;findObjs=function(pred){return _fo(pred).filter(i=>!(S.obj[i]&&S.obj[i].priv));};}
// ---------- alquiler, compra ----------
{const _wr=weeklyRent;weeklyRent=function(){const t=(S.home&&S.home.type)||'casita';if(t==='casita')return _wr();return Math.round(HOMES[t].rent*Dm().rent*(S.rentMul||1)*(Dm().soul?MK().price:1));};}
{const _hp=housePrice;housePrice=function(){const t=(S.home&&S.home.type)||'casita';if(t==='casita')return _hp();const H=HOMES[t];if(!H.buy)return 1e9;let imp=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv)imp+=OBJ[o.t].p*0.15;}return Math.round((H.price+imp)*Hm().house*(Dm().soul?MK().price:1)/10)*10;};}
{const _mo=mortgageOffer;mortgageOffer=function(){const o=_mo();if(!HT().buy){o.ok=false;o.why=['esta vivienda no está en venta'];}return o;};}
// ---------- la gente con la que vive ----------
{const _res=residents;residents=function(){const list=_res();const h=S.t/60,wk=dayType(S.day)==='work';
  for(const k of (S.home&&S.home.mates)||[]){const p=(S.people||[]).find(q=>q.k===k);if(!p)continue;if(!p.ch){p.ch={...randomChar(),name:p.n,g:k==='madre'?'f':(p.g||'f'),age:k==='madre'?58:27,hair:k==='madre'?'#bdbdbd':undefined,style:k==='madre'?'mono':undefined,beard:'no'};if(!p.ch.hair)p.ch.hair=HAIRCOLS[2];if(!p.ch.style)p.ch.style='corto';}
    const away=k!=='madre'&&wk&&h>8.5&&h<(15+hash(k.length*7+S.day)*5);const has=(S.res||[]).some(r=>r.pid===k);
    if(!away&&!has){let c=null;for(let t=0;t<30;t++){const x=4+(hash(S.day*17+t*5+k.length)*12|0),y=5+(hash(S.day*13+t*7+k.length*3)*9|0);if(walkable(x,y)&&!inArea(x,y)&&roomId[idx(x,y)]>=0){c=[x,y];break;}}
      if(c){S.res=S.res||[];S.res.push({kind:'mate',pid:k,x:c[0]+.5,y:c[1]+.5,path:[],phase:0});}}
    if(away&&has)S.res=S.res.filter(r=>r.pid!==k);}
  return S.res||list;};}
{const _pay=payRent;payRent=function(){const t=(S.home&&S.home.type)||'casita';if(t!=='padres'||S.owned)return _pay.apply(this,arguments);const r=weeklyRent();S.money-=r;bumpMoney();toast(`🛒 Pone ${fmt(r)} para la compra de la semana en casa de su madre`);};}
// ---------- vida en cada tipo de casa ----------
function homeWeekly(){if(!S.home)S.home={type:'casita',area:[0,0,N-1,N-1],since:S.day,mates:[]};const t=S.home.type||'casita',H=HOMES[t],c=CH();
  if(H.damp){for(const o of S.obj)if(o&&!o.priv)o.c=Math.max(0,(o.c??100)-5);S.needs.energia=Math.max(0,S.needs.energia-6);
    if(Math.random()<.12&&!S.sick){S.sick=1+(Math.random()*3|0);tell(`${c.name} ha cogido un catarro que no se le va. En el cuarto hay moho detrás del armario y la ropa nunca acaba de secarse.`,'🦠');}
    else if(Math.random()<.25)tell(pickR(['Ha vuelto a salir la mancha de humedad del techo. Más grande.','El casero no coge el teléfono. La persiana lleva tres semanas rota.','Esta noche se ha ido la luz otra vez: alguien del edificio enganchado a la red.','Una cucaracha en la ducha. Ana ya ni grita.']),'🏚️');}
  if(t==='habitacion'){const ms=S.home.mates.map(k=>(S.people||[]).find(p=>p.k===k)).filter(Boolean);const m=pickR(ms);
    if(m&&Math.random()<.55)tell(pickR([`${m.n} ha vuelto a dejar los platos en el fregadero tres días. Hay una nota en la nevera, con mayúsculas.`,`${m.n} ha montado una fiesta hasta las cuatro. ${c.name} ha dormido con tapones.`,`Bronca en el grupo del piso por el papel higiénico. Nadie compra nunca papel higiénico.`,`${m.n} y ${c.name} han cenado juntas y se han reído un montón. A veces compartir piso está bien.`.replace('juntas',m.g==='m'?'juntos':'juntas'),`Cola para el baño a las siete y media. ${m.n} lleva veinte minutos dentro.`,`${m.n} le ha cogido la leche otra vez. ${c.name} ha empezado a esconder la comida en su cuarto.`]),'🛋️');
    if(m&&Math.random()<.4){m.rel=Math.max(0,Math.min(100,m.rel+(Math.random()<.5?6:-5)));}
    if(Math.random()<.04&&ms.length){const out=pickR(ms);S.home.mates=S.home.mates.filter(k=>k!==out.k);S.res=(S.res||[]).filter(r=>r.pid!==out.k);out.stage='conocida';out.mate=false;const nw=newMate();S.home.mates.push(nw.k);tell(`${out.n} se va del piso. Ha entrado ${nw.n}, ${nw.mjob}. Primera impresión: ${pickR(['maja','rara','muy callada','demasiado simpática'])}.`,'📦');}
    if(Math.random()<.5)S.needs.energia=Math.max(0,S.needs.energia-5);}
  if(t==='padres'){const m=P_('madre');if(m){m.rel=Math.min(100,m.rel+1);if(Math.random()<.45)tell(pickR([`${m.n} ha entrado en el cuarto sin llamar. Otra vez.`,`«¿Vas a cenar en casa?», pregunta ${m.n} cada día a las ocho. Cada día.`,`${m.n} le ha planchado la ropa sin que se lo pidiera. ${c.name} no sabe si agradecerlo o gritar.`,`Domingo de cocido con ${m.n}. Hay cosas de vivir en casa que no tienen precio.`,`${m.n} ha preguntado otra vez cuándo piensa independizarse. «Cuando los alquileres bajen», le ha dicho. Las dos se han reído sin ganas.`.replace('Las dos',c.g==='m'?'Los dos':'Las dos')]),'👩‍🦳');}
    S.needs.social=Math.min(100,S.needs.social+8);}
  if(t==='bueno'&&Math.random()<.2)tell(pickR(['El portero le ha subido un paquete. Le ha llamado «señora».'.replace('señora',ga('señora','señor','señore')),'Junta de vecinos: se quejan de los «ruidos de la calle». La calle es donde vive el resto.','Calefacción a 22 grados en enero. Ana se acuerda del bajo de su amiga y le da algo de vergüenza.']),'🏙️');
  if(t==='chalet'&&Math.random()<.2)tell(pickR(['El jardinero viene los martes. Ana aún no sabe cómo se llama.','La piscina hay que mantenerla aunque nadie se bañe. Cloro, filtros, la factura del agua.','Barbacoa con gente del trabajo. Todos hablan de dónde invertir.']),'🏊');
  // decidir mudarse sola
  if(S.autoHome&&!S.owned&&S.day-(S.home.since||0)>=28){const rent=weeklyRent(),inc=S.jobless?0:salary()*TR().days.length;
    const down=HOME_ORDER.slice(0,HOME_ORDER.indexOf(t)).reverse().find(k=>HOMES[k].rent*Dm().rent<rent*.7&&canMove(k).ok);
    if(S.money<-rent*1.5&&down&&Math.random()<.35){moveHome(down,true);return;}
    const up=HOME_ORDER.slice(HOME_ORDER.indexOf(t)+1).reverse().find(k=>canMove(k).ok&&HOMES[k].rent*Dm().rent<inc*.38&&S.money>moveCost(k)*3+reserveMoney());
    if(up&&Math.random()<(T('derrochadora')||isI('liberal','libertaria')?.3:T('ahorradora')?.06:.15)&&(t!=='casita'||HOMES[up].cls>2&&S.money>moveCost(up)*6))moveHome(up,true);}}
// ---------- mudarse ----------
function moveCost(k){const H=HOMES[k],r=Math.round(H.rent*Dm().rent*(Dm().soul?MK().price:1));return k==='padres'?0:k==='infra'?r*2:k==='habitacion'?r*3:r*(H.cls>=3?6:5);}
function canMove(k){const H=HOMES[k],r=H.rent*Dm().rent,inc=S.jobless?0:salary()*TR().days.length,why=[];if(k===((S.home&&S.home.type)||'casita'))return {ok:false,why:['ya vive aquí']};
  if(k==='padres'){const m=P_('madre');if(!m)why.push('no tiene a dónde volver');else if(m.rel<35)why.push('su madre y ella no se hablan');return {ok:!why.length,why};}
  if(S.money<moveCost(k))why.push(`hacen falta ${fmt(moveCost(k))} de fianza${H.cls>=2?' y agencia':''}`);
  let aval=false;if(H.need&&inc<r*H.need){const m=P_('madre');if(S.jobless)why.push('sin nómina no le alquilan');else if(m&&m.rel>=60&&H.cls<=2)aval=true;else why.push(`el casero pide ganar ${fmt(Math.round(r*H.need))} a la semana`);}
  return {ok:!why.length,why,aval};}
function moveHome(k,auto){const cm=canMove(k);if(!cm.ok){toast('No puede mudarse: '+cm.why.join(', '));return false;}
  const from=(S.home&&S.home.type)||'casita';let extra='';
  if(S.owned){const v=housePrice(),left=S.mort?Math.round(S.mort.left):0;const net=Math.round(v*.95)-left;S.money+=net;S.owned=false;S.mort=null;extra+=` Ha vendido la casa: ${net>=0?'le quedan '+fmt(net):'aún debe '+fmt(-net)} después de pagar al banco.`;}
  let sold=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv&&!OBJ[o.t].big&&OBJ[o.t].cat!=='garden')sold+=Math.round(OBJ[o.t].p*(o.q===4?1.5:1)*.25*((o.c??100)/100));}
  S.money+=sold-moveCost(k);bumpMoney();if(sold>0)extra+=` Ha vendido por ${fmt(sold)} los muebles que no caben.`;
  applyHome(k);computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);
  const up=HOMES[k].cls>HOMES[from].cls;
  const txt={padres:`${CH().name} ha vuelto a casa de su madre. A su edad. El cuarto sigue igual que lo dejó: los pósters, la colcha, el olor.`,
    infra:`${CH().name} se ha mudado a un bajo interior. Sin contrato, sin ventana a la calle y con una mancha de humedad que parece un mapa. Es lo que hay.`,
    habitacion:`${CH().name} ahora alquila una habitación en un piso compartido. ${S.home.mates.map(q=>{const p=(S.people||[]).find(x=>x.k===q);return p?p.n+' ('+p.mjob+')':'';}).filter(Boolean).join(' y ')} son sus nuevos compañeros de piso.`,
    viejo:`${CH().name} se ha mudado a un piso viejo de alquiler. Las ventanas no cierran del todo, pero la puerta es suya.`,
    casita:`${CH().name} se ha mudado a una casita con terreno. Hay espacio de sobra para ir haciéndola suya.`,
    bueno:`${CH().name} se ha mudado a un piso cómodo en el centro. Calefacción, ascensor y un portero que saluda. ${up?'Nunca había vivido así.':''}`,
    chalet:`${CH().name} vive ahora en un chalet con piscina. ${up?'Desde la terraza no se ve el barrio de antes.':''}`}[k];
  chapter('casa_'+k+'_'+S.day,`${HOMES[k].e} ${HOMES[k].n}`,txt+(cm.aval?' Su madre ha tenido que avalarla.'.replace('avalarla',ga('avalarla','avalarlo','avalarle')):'')+extra);
  if(!up&&HOMES[k].cls<HOMES[from].cls){ex().exp.stress++;pushI(isRight()?'socialdemocrata':LEANL(),15,'vivienda');}
  if(up&&HOMES[k].cls>=3)pushI(isI('conservadora')?'conservadora':'liberal',12,'dinero');
  const pt=liveIn();if(pt&&['habitacion','padres','infra'].includes(k)){pt.wear=Math.min(100,(pt.wear||0)+30);tell(`${pt.n} no se ha mudado con ${CH().name}: «Ahí no cabemos los dos». Se ve los fines de semana.`,'💔');pt.stage='pareja';}
  save();return true;}
// la pareja no se muda a un cuarto compartido
{const _mi=moveIn;moveIn=function(p){const t=(S.home&&S.home.type)||'casita';if(['habitacion','padres','infra'].includes(t)){toast(`En ${HOMES[t].n.toLowerCase()} no hay sitio para vivir con ${p.n}`);return;}return _mi.apply(this,arguments);};}
// el ambiente de la casa
{const _eb=envBonus;envBonus=function(){let v=_eb();const t=(S.home&&S.home.type)||'casita';if(t==='infra')v-=10;if(t==='habitacion')v-=3;if(t==='bueno')v+=4;if(t==='chalet')v+=6;return v;};}
{const _cw=conexWeekly;conexWeekly=function(){_cw.apply(this,arguments);try{homeWeekly();}catch(e){console.error('home',e);}};}
// ---------- interfaz ----------
function homeBlock(){const t=(S.home&&S.home.type)||'casita',H=HT();let h=`<h3>${H.e} Dónde vive: ${H.n}</h3><div class="sub" style="font-size:12px">${H.d}</div>`;
  if(H.build!=='all')h+=`<div class="sub" style="font-size:11.5px">🔒 Solo puede decorar ${t==='habitacion'||t==='padres'?'su cuarto':'por dentro'}: las paredes no son suyas.</div>`;
  const ms=((S.home&&S.home.mates)||[]).map(k=>(S.people||[]).find(p=>p.k===k)).filter(Boolean);if(ms.length)h+=`<div class="kv"><span>🛋️ Vive con</span><span>${ms.map(p=>p.n+(p.mjob?' ('+p.mjob+')':'')).join(', ')}</span></div>`;
  h+=`<details class="mud"><summary>🔑 Mudarse a otro sitio</summary>`;
  for(const k of HOME_ORDER){if(k===t)continue;const K=HOMES[k],cm=canMove(k),r=Math.round(K.rent*Dm().rent*(Dm().soul?MK().price:1));
    h+=`<div class="hopt"><div><b>${K.e} ${K.n}</b> <small>${k==='padres'?'§ '+r+'/sem para la compra':fmt(r)+'/sem'} · entrada ${fmt(moveCost(k))}</small><div class="sub" style="font-size:11px">${K.d}</div>${cm.ok?(cm.aval?'<div class="sub" style="font-size:11px">🤝 Necesita que su madre la avale</div>'.replace('la avale',ga('la avale','lo avale','le avale')):''):`<div class="sub" style="font-size:11px;color:#c0392b">✗ ${cm.why.join(' · ')}</div>`}</div><button class="mini"${cm.ok?'':' disabled'} data-move="${k}">Mudarse</button></div>`;}
  h+=`</details>`;return h;}
function bindHome(){card.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const k=b.dataset.move;const K=HOMES[k];if(!b.dataset.sure){b.dataset.sure=1;b.textContent='¿Seguro? Se pierde la casa actual';return;}if(moveHome(k,false)){menu.classList.remove('open');toast(`${K.e} ${CH().name} se muda: ${K.n}`,true);}});}
