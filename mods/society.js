// =================== SOCIEDAD: profesiones, ideologías, actividades, sindicato y mundo ===================
// ---------- profesiones ----------
const L_OF=[{t:'Becaria',pay:120,req:{}},{t:'Ayudante',pay:170,req:{shifts:3}},{t:'Técnica',pay:230,req:{shifts:6,logica:2}},{t:'Especialista',pay:310,req:{shifts:10,logica:3,carisma:2}},{t:'Coordinadora',pay:400,req:{shifts:15,logica:5,carisma:4}},{t:'Directora',pay:520,req:{shifts:22,logica:7,carisma:6}}];
const TRACKS={
  oficina:{n:'Oficina',e:'🏢',sh:[9,17],days:[0,1,2,3,4],levels:L_OF,tox:[.35,.8],org:1,lay:1,cos:['Grupo Ofimax','Consultora Nébula','Logística Pardo','Soluciones Tándem','Mercantil Vega','Kappa Gestión'],d:'Horario fijo y ascensos por lógica y carisma. Ambiente variable.'},
  super:{n:'Supermercado',e:'🛒',sh:[8,16],days:[1,2,3,4,5],levels:[{t:'Cajera',pay:100,req:{}},{t:'Cajera fija',pay:115,req:{shifts:5}},{t:'Encargada de sección',pay:150,req:{shifts:12,carisma:3}},{t:'Jefa de tienda',pay:230,req:{shifts:20,carisma:5,logica:3}},{t:'Gerente de zona',pay:330,req:{shifts:30,logica:6,carisma:6}}],tox:[.4,.85],org:1.6,lay:.8,cos:['SuperPronto','Mercado Hogar','Cestabuena','Hiper Ribera'],d:'Se entra sin experiencia. Mucha plantilla: es más fácil organizarse. Martes a sábado.'},
  hosteleria:{n:'Hostelería',e:'🍽️',sh:[15,23],days:[2,3,4,5,6],levels:[{t:'Camarera',pay:105,req:{}},{t:'Camarera fija',pay:120,req:{shifts:6}},{t:'Cocinera',pay:165,req:{shifts:10,cocina:4}},{t:'Jefa de cocina',pay:260,req:{shifts:20,cocina:7,carisma:3}}],tox:[.5,.95],org:.7,lay:1.3,over:1.6,tips:true,cos:['Bar Manolo','Taberna El Puerto','Restaurante La Brasa','Café Central'],d:'Propinas, horas extra y fines de semana. De miércoles a domingo, de tarde.'},
  obra:{n:'Construcción',e:'🏗️',sh:[7,15],days:[0,1,2,3,4],levels:[{t:'Peona',pay:115,req:{}},{t:'Oficial de segunda',pay:155,req:{shifts:6,alba:3}},{t:'Oficial de primera',pay:205,req:{shifts:14,alba:5,carp:3}},{t:'Encargada de obra',pay:300,req:{shifts:24,alba:7,carisma:4}}],tox:[.4,.85],org:1.2,lay:1.3,risk:.025,cos:['Construcciones Pardo','Obras y Reformas Sur','Grupo Ladrillo'],d:'Madrugar, cansancio y riesgo de accidente. Albañilería y carpintería suben de nivel.'},
  cuidados:{n:'Cuidados y sanidad',e:'🩺',sh:[7,15],days:[0,1,2,3,4],levels:[{t:'Auxiliar de cuidados',pay:115,req:{}},{t:'Técnica en cuidados',pay:150,req:{shifts:8,carisma:3}},{t:'Enfermera',pay:260,req:{shifts:16,logica:5}},{t:'Supervisora',pay:360,req:{shifts:26,logica:7,carisma:5}}],tox:[.35,.8],org:1.3,lay:.6,burn:1.25,cos:['Residencia Los Olivos','Clínica San Rafael','Ayuda a Domicilio Sol'],d:'Trabajo que agota pero da sentido. Pocas veces echan a nadie.'},
  tech:{n:'Tecnología',e:'💻',sh:[10,18],days:[0,1,2,3,4],levels:[{t:'Programadora junior',pay:170,req:{logica:4}},{t:'Programadora',pay:250,req:{shifts:8,logica:6}},{t:'Programadora senior',pay:350,req:{shifts:18,logica:8}},{t:'Jefa de equipo',pay:470,req:{shifts:26,logica:9,carisma:5}}],tox:[.3,.75],org:.5,lay:1.1,offers:2,needs:'compu',cos:['Datanova','Nébula Labs','Pixelfactory','Kappa Digital'],d:'Buen sueldo y muchas ofertas, pero despidos masivos cuando hay crisis. Hace falta lógica 4 y ordenador.'},
  funcion:{n:'Función pública',e:'🏛️',sh:[8,15],days:[0,1,2,3,4],levels:[{t:'Auxiliar administrativa',pay:150,req:{}},{t:'Administrativa',pay:185,req:{shifts:20}},{t:'Técnica de la administración',pay:250,req:{shifts:40,logica:6}},{t:'Jefa de servicio',pay:330,req:{shifts:60,logica:8,carisma:5}}],tox:[.2,.55],org:1,lay:0,opos:true,cos:['Ayuntamiento','Delegación de Hacienda','Consejería de Empleo'],d:'Plaza fija: no te pueden despedir. Solo se entra aprobando oposiciones.'},
  reparto:{n:'Reparto (rider)',e:'🛵',sh:[19,23],days:[3,4,5,6,0],levels:[{t:'Rider',pay:85,req:{}},{t:'Rider veterana',pay:100,req:{shifts:25}}],tox:[.5,.9],org:.6,lay:0,gig:true,auto:true,risk:.03,cos:['Rápido Go','Comidas Ya','Pedalea'],d:'Falsa autónoma: cobra por pedido, paga su cuota, sin paro ni bajas. La lluvia paga más… y es más peligrosa.'},
  arte:{n:'Música en directo',e:'🎸',sh:[20,24],days:[3,4,5],levels:[{t:'Artista de bares',pay:70,req:{musica:4}},{t:'Artista con agenda',pay:140,req:{shifts:20,musica:6}},{t:'Artista de culto',pay:260,req:{shifts:45,musica:9,carisma:5}}],tox:[.2,.6],org:.4,lay:0,gig:true,auto:true,cos:['Sala El Sótano','La Cueva','Bar Tremendo'],d:'Ingresos imprevisibles. Hace falta música 4.'},
  negocio:{n:'Negocio propio',e:'🏪',sh:[9,19],days:[0,1,2,3,4,5],levels:[{t:'Autónoma con tienda',pay:150,req:{}},{t:'Empresaria',pay:300,req:{shifts:40,logica:5,carisma:5}},{t:'Empresaria de éxito',pay:520,req:{shifts:90,logica:7,carisma:7}}],tox:[.5,.5],org:0,lay:0,self:true,auto:true,cos:['tu tienda'],d:'Sin jefes y sin horario de salida. Hay que invertir capital; si van mal las cuentas, cierras.'},
  coop:{n:'Cooperativa',e:'🤝',sh:[9,16],days:[0,1,2,3,4],levels:[{t:'Socia trabajadora',pay:165,req:{}},{t:'Socia coordinadora',pay:210,req:{shifts:20,carisma:5}}],tox:[.1,.2],org:3,lay:0,coop:true,cos:['Cooperativa La Colmena','Cooperativa Arcadia'],d:'Se reparte lo que se gana y se decide en asamblea. Depende de cómo vaya la economía.'}};
const TRK_ORDER=['oficina','super','hosteleria','obra','cuidados','tech','funcion','reparto','arte','negocio','coop'];
const TR=()=>TRACKS[(S&&S.track)||'oficina'];
function setTrack(k){S.track=k;CAREER=TRACKS[k].levels;}
const tShifts=()=>S.shifts-(S.shiftBase||0);
const bizCapital=()=>Math.round(900*PM());
function entryMissing(k){
  const T0=TRACKS[k],m=[];if(k===S.track&&!S.jobless)return ['ya trabajas aquí'];
  for(const [sk,,nm] of SKILLS){const r=T0.levels[0].req[sk];if(r&&lvl(sk)<r)m.push(`${nm} ${r}`);}
  if(T0.needs&&!has(T0.needs))m.push('tener ordenador');
  if(T0.opos&&!S.oposPassed)m.push('aprobar oposiciones');
  if(T0.self&&S.money<bizCapital())m.push(`${fmt(bizCapital())} de capital`);
  if(T0.coop&&!(S.pol&&S.pol.coopOK))m.push('montar o encontrar una cooperativa (sindicato, militancia o huelga ganada)');
  if(S.world&&S.world.era==='comuna'&&k==='negocio')m.push('ya no hay negocios privados');
  return m;
}
function startTrack(k,silent){
  const old=S.track;setTrack(k);S.career=0;S.shiftBase=S.shifts;S.payMul=1;S.jobless=false;S.paroWeeks=0;S.seek=null;S.rep=Math.max(55,S.rep??60);S.offer=null;
  const T0=TRACKS[k];S.office={n:pickR(T0.cos),tox:T0.tox[0]+Math.random()*(T0.tox[1]-T0.tox[0]),known:0.3,seen:null,since:S.day,org:T0.coop?60:5+Math.random()*10,griev:10};
  if(T0.self){S.money-=bizCapital();S.biz={weeks:0,loss:0};}
  if(!silent)toast(`${T0.e} ${CH().name} empieza de ${CAREER[0].t.toLowerCase()} en ${S.office.n}`,true);
  tell(T0.self?`Ha invertido ${fmt(bizCapital())} en abrir su propio negocio. Ya no tiene jefe… ni red.`:old&&old!==k?`Cambio de vida: deja ${TRACKS[old].n.toLowerCase()} y empieza de ${CAREER[0].t.toLowerCase()} en ${S.office.n}.`:`Empieza de ${CAREER[0].t.toLowerCase()} en ${S.office.n}.`,T0.e);
}
function quitJob(){if(S.jobless)return;tell(`${CH().name} ha dejado su trabajo en ${S.office?S.office.n:'la empresa'}.`,'🚪');S.jobless=true;S.paroWeeks=0;S.seek=S.seek||null;}
// búsqueda de trabajo: cada día laborable, con más suerte si hay ofertas en ese sector
const SEEK_BASE={oficina:.14,super:.32,hosteleria:.35,obra:.25,cuidados:.25,tech:.12,funcion:1,reparto:.6,arte:.18,negocio:1,coop:.5};
function seekTick(){
  if(!S.seek)return;const k=S.seek;if(entryMissing(k).length&&!(k===S.track&&S.jobless)){S.seek=null;return;}
  if(TRACKS[k].self||TRACKS[k].opos||k==='coop'){startTrack(k);return;}
  if(dayType(S.day)==='weekend'&&!S.jobless)return;
  let p=SEEK_BASE[k]*(Dm().soul?0.5:Dm().money<500?0.7:1.3)*(1-W_().crisis/220)*(S.record?0.55:1)*(1+0.03*lvl('carisma'))*(k==='tech'?1+0.05*(lvl('logica')-4):1)*(S.netBoost>S.day?1.4:1);
  if(Math.random()<p){startTrack(k);}else if(S.jobless&&Math.random()<0.25)toast(`📨 ${CH().name} sigue buscando trabajo en ${TRACKS[k].n.toLowerCase()}`);
}
// Ana elige de qué buscar trabajo según su situación y sus ideas
function autoSeek(){
  if(!S.autoHome||S.seek)return;
  const ok=TRK_ORDER.filter(k=>!entryMissing(k).length);if(!ok.length)return;
  const pref=(IDEOS[S.ideo]||IDEOS.apolitica).tracks||[];
  const score=k=>{const T0=TRACKS[k];let v=T0.levels[0].pay*(T0.gig?0.8:1)-(T0.tox[0]+T0.tox[1])*40+(pref.includes(k)?60:0)+(T0.lay===0&&Dm().soul?30:0);if(T0.self)v+=S.money>bizCapital()*2?40:-80;if(k==='reparto')v+=S.money<0?80:-40;return v+Math.random()*30;};
  if(S.jobless){const best=ok.sort((a,b)=>score(b)-score(a))[0];S.seek=best;toast(`🔎 ${CH().name} busca trabajo de ${TRACKS[best].n.toLowerCase()}`);return;}
  // con trabajo: cambia si el suyo es claramente peor
  const cur=TRACKS[S.track],curV=salary()-(TOX()*60)+(pref.includes(S.track)?60:0);
  const best=ok.filter(k=>k!==S.track).sort((a,b)=>score(b)-score(a))[0];
  if(best&&score(best)>curV*1.25+40&&Math.random()<0.25){S.seek=best;toast(`🔎 ${CH().name} empieza a buscar trabajo de ${TRACKS[best].n.toLowerCase()}`);}
}
// oposiciones
function oposTick(){
  const o=S.opos;if(!o||!o.on)return;if(!o.exam||o.exam<S.day)o.exam=S.day+Math.max(30,120-(S.day%120));
  if(S.day!==o.exam)return;
  if(o.h<15){tell(`Se presentó a las oposiciones casi sin estudiar (${Math.round(o.h)} h). Ni lo intentó de verdad.`,'📝');o.h*=0.8;o.exam=S.day+120;return;}
  const freeze=W_().gov==='austeridad';const p=Math.min(.82,(0.04+o.h/220*0.55+lvl('logica')*0.03)*(Dm().soul?0.7:1)*(freeze?0.3:1));
  if(Math.random()<p){S.oposPassed=true;o.on=false;chapter('opos','La plaza',`Después de ${Math.round(o.h)} horas de estudio, ${CH().name} ha aprobado las oposiciones. Una plaza fija. Por primera vez en años, el futuro no da miedo.`);if(S.autoHome||true)S.seek='funcion';}
  else{tell(`Suspendió las oposiciones${freeze?' (este año apenas había plazas)':''}. ${pickR(['Lloró un rato y volvió a abrir el temario.','Habrá otra convocatoria.','Se le quedó la plaza a tres décimas.'])}`,'📝');o.h*=0.7;o.exam=S.day+120;}
}

// ---------- ideologías ----------
const IDEOS={
  apolitica:{n:'Apolítica',e:'😶',d:'La política no va con ella. Ni manifestaciones ni asambleas: su tiempo libre es suyo.',fx:['Más tiempo libre y ni un disgusto con las elecciones','Nadie la defiende cuando las cosas se tuercen'],tracks:[],union:.08,strike:.25,neg:0,org:.5,act:{amigos:3,deporte:1.5},vote:null,
    th:['La política no da de comer.','Todos son iguales.','Yo a lo mío.']},
  marxista:{n:'Marxista',e:'🚩',d:'Cree que la riqueza la crea quien trabaja y que solo la organización colectiva cambia las cosas. Sindicato, huelga y conciencia de clase.',fx:['Organiza a la plantilla el doble de rápido y tira del movimiento','Los jefes la tienen fichada: negocia peor a solas y arriesga represalias','Puede liderar una huelga general… o una revolución'],tracks:['super','obra','cuidados'],union:.95,strike:.95,neg:-.03,org:1.6,inf:1.4,act:{sindicato:3,militancia:3,manifestacion:3,voluntariado:1,amigos:1.5},vote:'progresista',org_n:'la célula del partido',
    th:['Produzco cinco veces lo que me pagan.','Solos no somos nada; juntas, todo.','El alquiler es un robo con contrato.','Ningún jefe va a regalarnos nada.','La historia la escriben los que se organizan.']},
  anarquista:{n:'Anarquista',e:'🏴',d:'Desconfía de cualquier jerarquía, sea el jefe o el Estado. Apoyo mutuo, asambleas, cooperativas y huelgas de inquilinas.',fx:['Su red de apoyo mutuo la sostiene cuando no llega','Rechaza ascensos a jefa y se lleva mal con los jefes','Abre la puerta a las cooperativas y a la huelga de alquileres'],tracks:['coop','reparto','arte'],union:.85,strike:.95,neg:-.05,org:1.4,inf:1.3,act:{militancia:3,voluntariado:2.5,manifestacion:2.5,sindicato:2,amigos:2},vote:null,org_n:'el ateneo libertario',
    th:['Ni dioses ni amos.','Lo que no hagamos entre todas no lo hará nadie.','Un jefe es alguien que vive de tu tiempo.','Hoy por ti, mañana por mí.']},
  socialdemocrata:{n:'Socialdemócrata',e:'🌹',d:'Cree en mejorar las cosas desde las instituciones: sindicatos que negocian, servicios públicos, impuestos justos y leyes que protejan.',fx:['Negocia mejor y aprovecha las ayudas públicas','Puede presentarse a concejala y cambiar políticas locales','Solo va a la huelga cuando ya no queda otra'],tracks:['funcion','cuidados','oficina'],union:.75,strike:.55,neg:.03,org:1.15,inf:1.1,act:{militancia:2,sindicato:2,amigos:2,voluntariado:1},vote:'progresista',org_n:'la agrupación local',
    th:['Con buenos servicios públicos, nadie se queda atrás.','Hay que votar, aunque sea con la nariz tapada.','Las cosas se cambian desde dentro.']},
  ecologista:{n:'Ecologista',e:'🌍',d:'El planeta no aguanta este ritmo. Consume poco, cultiva lo que puede y se moviliza contra los proyectos que destrozan el territorio.',fx:['Huerto más productivo y facturas más bajas','Compra de segunda mano y calidad básica','Puede montar un huerto comunitario y una cooperativa energética'],tracks:['cuidados','coop'],union:.6,strike:.7,neg:0,org:1.1,inf:1.15,act:{militancia:2.5,voluntariado:2,manifestacion:2,deporte:1.5,amigos:1.5},vote:'progresista',org_n:'el colectivo ecologista',
    th:['No hay planeta B.','Cada tomate de mi huerto es un pequeño acto de resistencia.','Este calor no es normal.']},
  liberal:{n:'Liberal',e:'🗽',d:'Mérito, formación y libertad de mercado con reglas claras. Invierte, hace contactos y cree que el esfuerzo individual se acaba notando.',fx:['Aprende más en el trabajo y le llegan más ofertas','Invierte sus ahorros en fondos indexados','Rara vez se afilia o hace huelga'],tracks:['tech','oficina','negocio'],union:.15,strike:.2,neg:.05,org:.6,inf:1,act:{networking:3,deporte:2,amigos:2,biblioteca:1.5},vote:'liberal',org_n:'el club liberal',
    th:['La formación es la mejor inversión.','Interés compuesto: la octava maravilla.','Si me esfuerzo, se notará.']},
  libertaria:{n:'Libertaria',e:'🐍',d:'Cada uno es dueño de su vida y de su dinero. Impuestos = robo, el Estado estorba. Emprende, se busca la vida y apuesta por las cripto.',fx:['Más trabajitos por su cuenta y su negocio rinde más','Invierte en cripto: puede forrarse o arruinarse','Nunca se afilia: en las huelgas, cruza el piquete'],tracks:['negocio','tech','reparto'],union:0,strike:0,neg:.06,org:0,inf:.9,act:{networking:3,deporte:2,amigos:1.5},vote:'liberal',org_n:'el meetup de emprendedores',
    th:['Hacienda me roba cada mes.','Nadie me va a regalar nada, ni falta que hace.','Lo público es ineficiente.','Compra en el pánico, vende en la euforia.']},
  conservadora:{n:'Conservadora',e:'🏛️',d:'Familia, ahorro, propiedad y comunidad. Desconfía de los experimentos y de las huelgas. Va a misa o a la asociación de vecinos.',fx:['Ahorra más, el banco se fía de ella y su familia la arropa','Su parroquia o asociación la ayuda si vienen mal dadas','Puede presentarse a concejala por su barrio'],tracks:['funcion','oficina','negocio'],union:.15,strike:.15,neg:.02,org:.7,inf:1,act:{misa:2.5,militancia:1.5,voluntariado:1.5,amigos:2},vote:'conservador',org_n:'la asociación de vecinos',
    th:['Lo primero es la familia.','Pan para hoy, ahorro para mañana.','Las cosas se consiguen trabajando, no gritando.']}};
const IDEO_ORDER=['apolitica','marxista','anarquista','socialdemocrata','ecologista','liberal','libertaria','conservadora'];
const COMP={1:'Simpatizante',2:'Activa',3:'Militante'};
const ID=()=>IDEOS[(S&&S.ideo)||'apolitica'];
const isI=(...k)=>k.includes((S&&S.ideo)||'apolitica');
const comp=()=>S.pol?S.pol.comp||2:2;

// ---------- arcos de cada ideología ----------
const ARCS={
  marxista:[{at:4,id:'m1',t:'Conciencia de clase',x:'Ha empezado a ir a reuniones. Ha descubierto que lo que le pasa en el trabajo no es mala suerte: tiene nombre.'},
    {at:15,id:'m2',t:'La plantilla',c:()=>S.union&&S.union.member&&office().org>=35,x:'Ya no está sola en el trabajo: hay un grupo de compañeras que se reúnen en el descanso.'},
    {at:35,id:'m3',t:'El barrio',c:()=>W_().mov>=40,x:'La lucha sale del trabajo: asambleas de barrio, sindicato de inquilinas, cajas de resistencia.',fx:()=>{S.pol.inf+=10;}},
    {at:60,id:'m4',t:'Tiempos oscuros',c:()=>W_().crisis>=60&&W_().mov>=65,x:'La crisis lo arrasa todo y la gente ya no tiene miedo. Su nombre suena en las asambleas.',fx:()=>{S.pol.inf+=15;}}],
  anarquista:[{at:4,id:'a1',t:'Apoyo mutuo',x:'En el ateneo nadie manda. Se reparten comida, herramientas y turnos para cuidar a quien lo necesita.',fx:()=>{S.pol.mutual=true;}},
    {at:18,id:'a2',t:'Sindicato de inquilinas',x:'Con sus vecinas ha formado un sindicato de inquilinas. Si suben el alquiler, no pagarán la subida.',fx:()=>{S.pol.tenant=true;}},
    {at:38,id:'a3',t:'La cooperativa',c:()=>office().org>=30||W_().mov>=45,x:'Con varias compañeras ha montado una cooperativa: sin jefes, se reparte lo que se gana.',fx:()=>{S.pol.coopOK=true;}},
    {at:60,id:'a4',t:'Tiempos oscuros',c:()=>W_().crisis>=60&&W_().mov>=65,x:'Las redes de apoyo mutuo sostienen medio barrio. Ya no piden permiso.',fx:()=>{S.pol.inf+=15;}}],
  socialdemocrata:[{at:4,id:'s1',t:'Afiliada',x:'Se ha afiliado a la agrupación local. Mucha reunión, mucho café, alguna buena idea.'},
    {at:15,id:'s2',t:'Delegada',c:()=>S.union&&S.union.member,x:'La han elegido delegada sindical. Negocia por toda la plantilla y no la pueden despedir así como así.',fx:()=>{S.pol.delegada=true;}},
    {at:32,id:'s3',t:'En las listas',c:()=>S.pol.inf>=25,x:'La agrupación la quiere en las listas municipales. Ahora toca convencer al barrio.',fx:()=>{S.pol.cand=true;}}],
  ecologista:[{at:4,id:'e1',t:'El colectivo',x:'Se ha unido a un colectivo ecologista. Bicis, semillas y mucha paciencia.'},
    {at:15,id:'e2',t:'Huerto comunitario',x:'Han convertido un solar abandonado en un huerto comunitario. Cada semana vuelve con verduras.',fx:()=>{S.pol.commons=true;}},
    {at:30,id:'e3',t:'Cooperativa energética',x:'Se ha pasado a una cooperativa de energía renovable. La factura de la luz baja y la conciencia también descansa.',fx:()=>{S.pol.coopEnergy=true;}},
    {at:50,id:'e4',t:'La campaña',c:()=>W_().mov>=35,x:'Han parado una macrogranja que iban a construir al lado del río. Medio pueblo salió a la calle.',fx:()=>{S.pol.inf+=20;S.pol.cand=true;}}],
  liberal:[{at:4,id:'l1',t:'Mentalidad de crecimiento',x:'Ha empezado a ir a eventos de networking. Tarjetas, sonrisas y LinkedIn.'},
    {at:15,id:'l2',t:'Red de contactos',x:'Su red de contactos empieza a dar frutos: le llegan ofertas sin buscarlas.',fx:()=>{S.pol.network=true;}},
    {at:25,id:'l3',t:'Cartera indexada',x:'Ha abierto una cartera de fondos indexados. Cada mes aparta una parte, pase lo que pase.',fx:()=>{S.pol.invest='fondos';}},
    {at:45,id:'l4',t:'En las listas',c:()=>S.pol.inf>=25,x:'El partido liberal local le ha ofrecido ir en las listas municipales.',fx:()=>{S.pol.cand=true;}}],
  libertaria:[{at:4,id:'b1',t:'Hazte a ti misma',x:'Ha dejado de esperar nada de nadie. Si hay que buscarse la vida, se la busca.'},
    {at:12,id:'b2',t:'El side hustle',x:'Ahora tiene trabajitos por su cuenta casi cada semana.',fx:()=>{S.pol.hustle=true;}},
    {at:22,id:'b3',t:'Cripto',x:'Ha metido sus ahorros en cripto. Mira el gráfico antes de desayunar.',fx:()=>{S.pol.invest='cripto';}},
    {at:40,id:'b4',t:'Sin jefe',c:()=>S.track==='negocio',x:'Tiene su propio negocio. Nadie le dice a qué hora entrar; nadie le paga si no vende.'}],
  conservadora:[{at:4,id:'c1',t:'Raíces',x:'Ha vuelto a ir a la parroquia y a la asociación de vecinos. Gente de toda la vida.',fx:()=>{S.pol.parish=true;}},
    {at:18,id:'c2',t:'Patrimonio',c:()=>S.owned,x:'Tiene su casa. Lo que es suyo, es suyo.',fx:()=>{S.pol.inf+=5;}},
    {at:32,id:'c3',t:'En las listas',c:()=>S.pol.inf>=25,x:'La asociación la ha propuesto para ir en las listas municipales del barrio.',fx:()=>{S.pol.cand=true;}}]};
ARCS.marxista.forEach(a=>{});
function arcTick(){
  const arc=ARCS[S.ideo];if(!arc)return;const p=S.pol;
  for(const st of arc){if(p.stages[st.id])continue;if(p.xp<st.at||(st.c&&!st.c()))break;p.stages[st.id]=S.day;if(st.fx)st.fx();chapter('arc_'+st.id,st.t,st.x);break;}
}
// ---------- actividades fuera de casa ----------
const OUT={
  amigos:{n:'Salir con amigos',e:'🍻',dur:200,days:'libre',h:[17,21],why:'social y diversión'},
  sindicato:{n:'Asamblea sindical',e:'✊',dur:150,wd:[3],h:[18,20],req:()=>S.union&&S.union.member&&!S.jobless&&!TR().self,why:'organizar la plantilla'},
  militancia:{n:'Reunión política',e:'📢',dur:160,wd:[1,4],h:[18,21],req:()=>S.ideo&&S.ideo!=='apolitica',why:'su movimiento'},
  manifestacion:{n:'Manifestación',e:'📣',dur:190,req:()=>W_().manif&&W_().manif.day===S.day,h:[11,13],why:'salir a la calle'},
  voluntariado:{n:'Voluntariado',e:'🥫',dur:180,days:'libre',h:[10,13],why:'ayudar y conocer gente'},
  deporte:{n:'Salir a correr',e:'🏃',dur:60,h:[7,21],why:'salud y despejarse'},
  networking:{n:'Afterwork y networking',e:'🥂',dur:150,wd:[3],h:[18,20],why:'contactos y ofertas'},
  misa:{n:'Misa y vermú',e:'⛪',dur:150,wd:[6],h:[10,12],why:'comunidad'},
  biblioteca:{n:'Estudiar en la biblioteca',e:'📚',dur:180,h:[10,19],why:'lógica y oposiciones'},
  piquete:{n:'Piquete de huelga',e:'🪧',dur:180,req:()=>(S.strike&&S.strike.on&&S.strike.join)||(W_().gs===S.day&&ID().strike>=.5),h:[7,11],why:'la huelga'}};
function outName(k){if(k==='militancia'){const n=ID().org_n;return n?capF(n.replace(/^(el|la) /,'')):'Reunión política';}if(k==='voluntariado')return isI('conservadora')?'Voluntariado en la parroquia':isI('anarquista')?'Despensa solidaria':'Banco de alimentos';return OUT[k].n;}
function outAvail(k){const o=OUT[k],h=S.t/60,d=dateOf(S.day);
  if(S.sim.work>0||S.jail>0)return 'ahora no está en casa';if(o.req&&!o.req())return 'no toca';
  if(o.days==='libre'&&dayType(S.day)==='work'&&!(S.jobless||S.strike&&S.strike.on))return 'solo en días libres';
  if(o.wd&&!o.wd.includes(d.wd))return 'los '+o.wd.map(w=>WDL[w].toLowerCase()).join(' y ');
  if(h<o.h[0]||h>o.h[1])return `de ${o.h[0]}:00 a ${o.h[1]}:00`;
  if(shouldWork()||(dayType(S.day)==='work'&&!S.jobless&&S.lastWorkDay!==S.day&&h<SHIFT.start&&h+o.dur/60>leaveTime()))return 'tiene que ir a trabajar';
  if(S.needs.energia<15)return 'está agotada';
  return null;}
function outCost(k){return k==='amigos'?Math.round(mealOutCost()*1.6):k==='networking'?Math.round(mealOutCost()*1.2):k==='misa'?Math.round(mealOutCost()*0.5):0;}
function doOut(k){S.outDay=S.day;goOut(k);}
// al volver de cada actividad
function outBack(k){
  const nd=S.needs,p=S.pol,c=CH().name,inf=ID().inf||1;const cost=outCost(k);if(cost){S.money-=cost;}
  const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));
  tally('used','_out_'+k);
  switch(k){
    case 'sindicato':{add('social',30);add('energia',-8);const g=(3+lvl('carisma')*0.7)*ID().org*TR().org*comp()*0.6;office().org=Math.min(100,office().org+g);p.xp+=1.5;p.inf+=0.6*inf;gainSkill('carisma',4);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+6);
      if(Math.random()<.4)tell(pickR([`Asamblea en el sindicato: ya son ${Math.round(office().org/4)+3} en la plantilla.`,'Hablaron de turnos, de horas extra y de cómo plantarse.','Salió de la asamblea con más ganas que cansancio.']),'✊');break;}
    case 'militancia':{add('social',25);add('diversion',10);add('energia',-6);p.xp+=2*comp();p.inf+=1*inf*comp();W_().mov=Math.min(100,W_().mov+0.6*inf);gainSkill('carisma',3);
      if(Math.random()<.35)tell(`Fue a ${ID().org_n||'una reunión'}. ${pickR(['Debate largo, café frío.','Salió con tareas para toda la semana.','Hay gente nueva: eso es buena señal.','Alguien trajo tortilla.'])}`,ID().e);break;}
    case 'manifestacion':{add('social',30);add('diversion',15);add('energia',-15);p.xp+=3;p.inf+=2*inf;W_().mov=Math.min(100,W_().mov+1.5*inf);const m=W_().manif;
      const arrest=(W_().era==='represion'?0.12:0.01)*(W_().gov==='conservador'?1.6:1)*(Dm().soul?1.5:1);
      if(Math.random()<arrest){arrestAna(1+(Math.random()*2|0),'en la manifestación');}else tell(`Manifestación ${m?m.cause:''}. ${pickR(['Había más gente de la esperada.','Gritó hasta quedarse sin voz.','La lluvia no echó a nadie.','Cortaron la avenida principal durante dos horas.'])}`,'📣');break;}
    case 'voluntariado':{add('social',30);add('diversion',15);add('energia',-10);p.red=Math.min(100,(p.red||0)+3);p.xp+=1;const v=P_('vecina');if(v)v.rel=Math.min(100,v.rel+4);
      if(Math.random()<.35)tell(`${outName('voluntariado')}: ${pickR(['repartieron comida a cuarenta familias.','cada semana viene más gente. Mala señal.','una señora le dio las gracias llorando.'])}`,'🥫');break;}
    case 'deporte':{add('diversion',20);add('energia',-12);add('higiene',-35);S.fit=Math.min(100,(S.fit||0)+4);break;}
    case 'networking':{add('social',25);add('energia',-8);S.netBoost=S.day+14;gainSkill('carisma',3);p.xp+=isI('liberal','libertaria')?2:0.5;if(Math.random()<.18&&!S.offer&&!S.jobless)makeOffer();break;}
    case 'misa':{add('social',25);add('diversion',10);p.xp+=isI('conservadora')?2:0.3;const m=P_('madre');if(m)m.rel=Math.min(100,m.rel+5);break;}
    case 'biblioteca':{gainSkill('logica',20);add('diversion',-5);if(S.opos&&S.opos.on)S.opos.h+=3;break;}
    case 'piquete':{add('social',25);add('energia',-12);p.inf+=1.5*inf;if(S.strike)S.strike.picket=(S.strike.picket||0)+1;break;}
  }
  p.inf=Math.min(100,p.inf);
}
// Ana decide salir por su cuenta
function maybeOuting(){
  if(S.outDay===S.day||S.jail>0)return false;const h=S.t/60;const key=S.day*24+Math.floor(h);if(S.outKey===key)return false;S.outKey=key;
  const nd=S.needs;if(nd.energia<35||nd.hambre<30||nd.vejiga<30)return false;
  const W=(S.weather||{}).k;const I=ID(),c=comp();const cand=[];
  for(const k in OUT){if(outAvail(k))continue;let w=(I.act[k]||0.4)*(k==='amigos'?(nd.social<60?2:0.5):1);
    if(['militancia','sindicato','manifestacion'].includes(k))w*=c;if(k==='piquete')w=8;if(k==='manifestacion'&&W_().manif&&!manifFits(W_().manif))w*=0.1;
    if(k==='deporte'&&(W==='lluvia'||W==='tormenta'||W==='nieve'))w=0;if(k==='biblioteca'&&!(S.opos&&S.opos.on))w*=0.3;
    if(outCost(k)>spare())w=0;if(w>0)cand.push([k,w]);}
  if(!cand.length)return false;
  if(Math.random()>(cand.some(x=>x[0]==='piquete'||x[0]==='manifestacion')?0.9:0.32))return false;
  let tot=cand.reduce((a,b)=>a+b[1],0),r=Math.random()*tot;for(const [k,w] of cand){r-=w;if(r<=0){doOut(k);return true;}}
  return false;
}
const manifFits=m=>!m||!m.side||m.side.includes(S.ideo);

// ---------- sindicato y huelga ----------
function joinUnion(){if(TR().self){toast('Con negocio propio no hay sindicato que valga');return;}S.union={member:true,since:S.day};chapter('union','El carné',`${CH().name} se ha afiliado al sindicato. Paga su cuota cada mes; a cambio, ya no está sola si vienen mal dadas.`);}
function leaveUnion(){if(S.union)S.union.member=false;tell(`${CH().name} se ha dado de baja del sindicato.`,'✂️');}
const unionFee=()=>Math.round(5*PM());
function grieve(n){if(!S.jobless&&S.office)S.office.griev=Math.min(100,(S.office.griev||0)+n);}
function strikeReady(){const o=office();return !S.jobless&&!TR().self&&!TR().coop&&S.union&&S.union.member&&o.org>=50&&(o.griev||0)>=35&&!(S.strike&&S.strike.on);}
function callStrike(byOthers){
  const o=office();const days=2+(Math.random()*4|0);const join=byOthers?Math.random()<ID().strike:true;
  S.strike={on:true,left:days,total:days,join,by:byOthers?'plantilla':'ana',start:S.day,picket:0};
  if(byOthers){tell(`La plantilla de ${o.n} ha convocado huelga (${days} días). ${join?`${CH().name} la secunda.`:`${CH().name} no piensa hacerla: irá a trabajar.`}`,'🪧');toast(`🪧 Huelga en ${o.n}${join?'':' · Ana irá a trabajar'}`,true);}
  else{chapter('huelga1','La huelga',`${CH().name} y sus compañeras han convocado huelga en ${o.n}. ${days} días de paro. Nadie sabe cómo acabará.`);toast(`🪧 ¡Huelga en ${o.n}! ${days} días`,true);}
}
function strikeDay(){ // cada día laborable de huelga
  const st=S.strike;if(!st||!st.on)return;if(dayType(S.day)!=='work'&&dayType(S.day)!=='fest')return;
  if(st.join){const caja=S.union&&S.union.member&&S.day-S.union.since>=30?Math.round(salary()*0.4):0;if(caja){S.money+=caja;}}
  else{S.rep=Math.min(100,(S.rep??70)+3);const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-12);}
  st.left--;if(st.left>0)return;st.on=false;
  const o=office();const p=Math.min(.85,0.2+o.org*0.006+(o.griev||0)*0.003+(st.picket||0)*0.03+S.pol.inf*0.002-TOX()*0.2+(W_().gov==='progresista'?0.08:W_().gov==='austeridad'?-0.08:0)+(Dm().soul?-0.05:0.1));
  if(Math.random()<p){const k=1.05+Math.random()*0.1;S.payMul=(S.payMul||1)*k;o.tox=Math.max(0.05,o.tox-0.15);o.griev=5;o.org=Math.min(100,o.org+10);S.pol.inf+=st.join?8:0;S.pol.xp+=st.join?6:0;S.noOvertime=S.day+90;
    if(st.join)chapter('huelgaW','Ganamos',`Después de ${st.total} días de huelga, la empresa ha cedido: +${Math.round((k-1)*100)} % de sueldo, se acaban las horas extra sin pagar y el encargado ya no grita. ${isI('marxista','anarquista')?'Nadie les regaló nada: lo arrancaron.':'Ha merecido la pena.'}`);
    else tell(`La huelga ha triunfado: +${Math.round((k-1)*100)} % para toda la plantilla, también para ${CH().name}, que no la hizo. Sus compañeras no se lo olvidan.`,'🪧');
    toast(`✊ ¡Huelga ganada! Sueldo +${Math.round((k-1)*100)} %`,true);if(!S.pol.coopOK&&isI('anarquista','marxista')&&Math.random()<.4)S.pol.coopOK=true;}
  else{o.griev=Math.max(0,o.griev-15);o.org=Math.max(0,o.org-20);
    if(st.join){S.rep=Math.max(0,(S.rep??70)-10);tell(`La huelga ha fracasado. La empresa no cede y ahora hay listas negras.`,'🥀');
      if(Math.random()<0.25+TOX()*0.35&&!(S.pol.delegada)){S.jobless=true;S.paroWeeks=S.shifts>=30?12:6;tell(`Represalia: han despedido a ${CH().name} por «bajo rendimiento». ${S.union&&S.union.member?'El sindicato lleva el caso al juzgado.':''}`,'📦');if(S.union&&S.union.member){S.court=S.day+20+(Math.random()*20|0);}}}
    else tell(`La huelga ha fracasado. ${CH().name} sigue en su puesto; en el trabajo, el ambiente está peor que nunca.`,'🥀');}
  S.strike=null;
}
function courtTick(){if(!S.court||S.day<S.court)return;S.court=null;const p=0.45+(W_().gov==='progresista'?0.15:0)-(W_().gov==='liberal'?0.1:0);
  if(Math.random()<p){const back=Math.round(salary()*15);S.money+=back;bumpMoney();if(S.jobless){S.jobless=false;S.paroWeeks=0;}chapter('juicio','Despido nulo',`El juzgado ha declarado nulo el despido: represalia sindical. ${CH().name} vuelve a su puesto y cobra ${fmt(back)} de salarios atrasados.`);}
  else{const ind=Math.round(salary()*8);S.money+=ind;tell(`El juez da el despido por improcedente: no la readmiten, pero cobra ${fmt(ind)} de indemnización.`.replace('la readmiten',ga('la readmiten','lo readmiten','le readmiten')),'⚖️');}}
function unionWeekly(){
  if(S.jobless||!S.office||TR().self)return;const o=office(),I=ID();
  o.griev=Math.max(0,(o.griev||0)-3+TOX()*3);
  if(S.union&&S.union.member)o.org=Math.max(0,o.org-0.8);else o.org=Math.max(0,o.org-0.4);
  // las compañeras también se organizan por su cuenta cuando aprieta
  if(Dm().soul||o.griev>50)o.org=Math.min(100,o.org+Math.random()*1.5*TR().org*(W_().mov/50+0.3));
  // afiliarse
  if(!(S.union&&S.union.member)&&S.autoHome&&Math.random()<I.union*0.25*(o.griev>30?1.6:1))joinUnion();
  // huelga
  if(strikeReady()&&Math.random()<I.strike*0.35)callStrike(false);
  else if(!(S.strike&&S.strike.on)&&o.org>=70&&o.griev>=50&&!(S.union&&S.union.member)&&Math.random()<0.25)callStrike(true);
  // represalia por organizar en empresas tóxicas
  if(S.union&&S.union.member&&o.org>30&&!S.pol.delegada&&Math.random()<0.012*TOX()*(isI('marxista','anarquista')?1.6:1)*(Dm().soul?1.5:0.6)){S.rep=Math.max(0,(S.rep??70)-12);tell(`Su jefe sabe que está organizando a la plantilla. Ahora le tocan los peores turnos.`,'👁️');}
}

// ---------- el mundo: crisis, movimiento, gobiernos y elecciones ----------
const GOVS={progresista:{n:'Gobierno progresista',e:'🌹',fx:'Sube el salario mínimo, control de alquileres, más ayudas · algo más de inflación y menos ofertas'},
  conservador:{n:'Gobierno conservador',e:'🏛️',fx:'Bajan impuestos e IBI, más policía en las calles · menos paro y menos ayudas'},
  liberal:{n:'Gobierno liberal',e:'🗽',fx:'Desregulación: más ofertas de trabajo y negocios · más despidos y alquileres libres'},
  austeridad:{n:'Gobierno tecnócrata de austeridad',e:'✂️',fx:'Recortes por orden de los acreedores: menos paro, oposiciones congeladas, la crisis se alarga'},
  centro:{n:'Gobierno de coalición',e:'⚖️',fx:'Ni fu ni fa'},
  consejos:{n:'Consejos de trabajadoras',e:'🚩',fx:'Autogestión: alquiler social, empresas en manos de quien trabaja · escasez y bloqueo exterior'},
  comunas:{n:'Federación de comunas',e:'🏴',fx:'Asambleas por todas partes, alquileres abolidos, apoyo mutuo · escasez y caos'}};
const W_=()=>{if(!S.world)S.world={crisis:Dm().soul?45:{facil:10,normal:18,dificil:28,realista:35}[S.diff]||20,mov:10,gov:'centro',elec:120,manif:null,gs:null,era:null};return S.world;};
const dark=()=>W_().crisis>=65;
function govPay(){const g=W_().gov;return g==='progresista'&&S.career<=1?1.06:g==='conservador'?1.03:g==='consejos'?1.15:1;}
function worldWeekly(){
  const w=W_(),soul=Dm().soul;
  // crisis
  const base={facil:10,normal:18,dificil:28,realista:35,soul:50}[S.diff]||20;
  let d=(Math.random()-.5)*(soul?9:4)+(base-w.crisis)*0.05+(w.gov==='austeridad'?2:w.gov==='liberal'?0.5:w.gov==='progresista'?-0.5:0);
  if(S.market)d+=(S.market.price-1)*3;if(w.era==='consejos'||w.era==='comunas')d-=1.5;
  w.crisis=Math.max(0,Math.min(100,w.crisis+d));
  // movimiento social
  w.mov=Math.max(0,Math.min(100,w.mov+(w.crisis-40)/25-1.2+(w.era==='represion'?-3:0)));
  if(w.era==='represion'&&S.day>w.eraUntil){w.era=null;tell('Se levanta el estado de excepción. Las calles vuelven a ser de quien las pisa.','🕊️');}
  // manifestaciones convocadas
  if(!w.manif&&w.mov>20&&Math.random()<w.mov/140){const sat=S.day+((5-dateOf(S.day).wd+7)%7||7);
    const causes=[['por la vivienda',['marxista','anarquista','socialdemocrata','ecologista']],['contra los recortes',['marxista','anarquista','socialdemocrata','ecologista']],['por los salarios',['marxista','anarquista','socialdemocrata']],['por el clima',['ecologista','anarquista','socialdemocrata']],['por bajar los impuestos',['liberal','libertaria','conservadora']],['por la seguridad en el barrio',['conservadora']],['contra el cierre de la fábrica',['marxista','anarquista','socialdemocrata','conservadora','apolitica']]];
    const c=pickR(causes);w.manif={day:sat,cause:c[0],side:c[1]};tell(`Convocan una manifestación ${c[0]} para el ${WDL[dateOf(sat).wd].toLowerCase()}.`,'📣');}
  if(w.manif&&S.day>w.manif.day)w.manif=null;
  // huelga de alquileres y desahucios
  if(S.pol.tenant&&!S.owned&&!S.rentStrike&&w.mov>=35&&Math.random()<.3){S.rentStrike=true;chapter('inquilinas','Huelga de alquileres','Todo el bloque ha dejado de pagar la última subida del alquiler. El casero amenaza; el sindicato de inquilinas responde.');}
  if(S.rentStrike&&Math.random()<.08){if(w.mov>=55||Math.random()<.5){S.rentMul=(S.rentMul||1)*0.9;tell('El casero negocia con el sindicato de inquilinas: baja un 10 % el alquiler a todo el bloque.','🏘️');}else{tell(`Ha llegado una carta de desahucio. ${w.mov>=40?'Cuarenta vecinas se plantaron en el portal y la comitiva judicial se fue por donde vino.':'Tiene que pagar lo que debe o irse.'}`,'📨');if(w.mov<40){S.money-=Math.round(weeklyRent()*2);S.rentStrike=false;}}}
  // huelga general
  if(!w.gs&&w.mov>=60&&w.crisis>=55&&Math.random()<0.12){const day=S.day+3+(Math.random()*4|0);w.gsDay=day;tell(`Los sindicatos convocan huelga general para el ${WDL[dateOf(day).wd].toLowerCase()} ${dateOf(day).dm}.`,'🪧');}
  // ayudas de su gente cuando no llega
  if(S.money<reserveMoney()*0.5){
    if(S.pol.mutual&&Math.random()<.5){S.needs.hambre=Math.max(S.needs.hambre,80);S.pantry=(S.pantry||0)+4;const g=Math.round(30*PM()*Math.random());S.money+=g;tell(`La red de apoyo mutuo le ha traído una caja de comida${g?` y ${fmt(g)} de la caja común`:''}. Nadie pregunta, nadie lleva la cuenta.`,'🫶');}
    else if(S.pol.parish&&Math.random()<.4){const g=Math.round(25*PM());S.money+=g;tell(`La parroquia le ha echado una mano: ${fmt(g)} y una bolsa de comida. «Para eso estamos».`,'⛪');}
  }
  // inversiones
  investWeekly();
  // politicas locales de la concejala
  if(S.pol.concejal&&S.day>S.pol.concejal){S.pol.concejal=null;tell('Se acaba su mandato de concejala.','🏛️');}
  if(S.pol.concejal){const g=Math.round(18*PM());S.money+=g;}
  revolutionCheck();
}
function electionCheck(){
  const w=W_();if(S.day<w.elec||w.era==='consejos'||w.era==='comunas')return;w.elec=S.day+180;
  const wts={progresista:25+w.mov*0.3+(w.crisis>60?5:0),conservador:25+(w.crisis>55?10:0),liberal:20+(w.crisis<35?10:0),austeridad:8+(w.crisis>60?18:0),centro:15};
  let tot=0;for(const k in wts)tot+=wts[k];let r=Math.random()*tot,res='centro';for(const k in wts){r-=wts[k];if(r<=0){res=k;break;}}
  const old=w.gov;w.gov=res;const G=GOVS[res],I=ID();
  const happy=I.vote===res,sad=I.vote&&I.vote!==res&&!(I.vote==='progresista'&&res==='centro');
  if(S.ideo==='apolitica')tell(`Elecciones generales: gana el ${G.n.toLowerCase().replace('gobierno ','partido ')}. ${CH().name} ni se enteró de quién se presentaba.`,'🗳️');
  else if(!I.vote)tell(`Elecciones: gana el ${G.n.replace('Gobierno ','bloque ').toLowerCase()}. ${CH().name} no votó: ${isI('anarquista')?'«si votar cambiara algo, estaría prohibido».':'«votar es legitimar el robo».'}`,'🗳️');
  else tell(`Elecciones generales: ${G.e} ${G.n}. ${happy?pickR(['Lo celebró hasta las tantas.','Por fin una buena noticia.']):sad?pickR(['Se fue a dormir sin cenar.','Cuatro años más de esto…','Discutió con medio grupo de WhatsApp.']):'Podría ser peor.'}`,G.e);
  toast(`🗳️ ${G.e} Nuevo ${G.n.toLowerCase()}: ${G.fx.split('·')[0].trim()}`,true);
  S.needs.diversion=Math.max(0,Math.min(100,S.needs.diversion+(happy?25:sad?-25:0)));
  // efectos
  if(res==='progresista'&&!S.owned)S.rentCap=true;else S.rentCap=false;
  // municipales: si va en las listas
  if(S.pol.cand&&!S.pol.concejal){const p=Math.min(.75,0.15+S.pol.inf/180+(I.vote===res?0.12:0)+W_().mov/400);
    if(Math.random()<p){S.pol.concejal=S.day+180;chapter('concejal','Concejala',`${CH().name} ha salido elegida concejala. Le ha temblado la voz al jurar el cargo.`);applyLocalPolicy();}
    else tell(`Se presentó en las listas municipales y se quedó a ${20+(Math.random()*400|0)} votos del acta.`,'🗳️');}
}
function applyLocalPolicy(){const k=S.ideo;
  const pol={socialdemocrata:['Alquiler social: el ayuntamiento compra viviendas vacías y las alquila barato.',()=>{S.rentMul=(S.rentMul||1)*0.85;}],
    conservadora:['Rebaja del IBI y las tasas municipales.',()=>{S.ibiCut=true;}],ecologista:['Placas solares en todos los edificios públicos y cooperativa energética municipal.',()=>{S.pol.coopEnergy=true;}],
    liberal:['Ventanilla única: abrir un negocio ya no lleva seis meses de papeles.',()=>{S.bizBoost=true;}],marxista:['Remunicipalización del agua y la luz.',()=>{S.pol.coopEnergy=true;S.rentMul=(S.rentMul||1)*0.95;}]}[k];
  if(pol){pol[1]();tell(`Su primera medida: ${pol[0]}`,'📜');}}
// revolución o represión
function revolutionCheck(){
  const w=W_();if(w.rev||w.era)return;
  if(!(w.mov>=82&&w.crisis>=68))return;
  const leader=isI('marxista','anarquista')&&S.pol.inf>=55;
  if(!leader&&Math.random()>0.15)return;
  w.rev={left:5+(Math.random()*4|0),total:0,leader};
  chapter('rev1','El día que todo se paró',leader?`Huelga general indefinida. Fábricas, supermercados y hospitales en manos de quien trabaja en ellos. En la asamblea del barrio, alguien dice el nombre de ${CH().name} y todo el mundo se gira. ${S.track==='super'?'Hace un año pasaba códigos de barras. Hoy coordina el reparto de comida de medio barrio.':''}`:`Huelga general indefinida. La ciudad entera se ha parado. ${isI('conservadora','libertaria','liberal')?`${CH().name} mira las noticias con el corazón en un puño.`:`${CH().name} no se lo puede creer.`}`);
  toast('🚩 Huelga general indefinida: todo se ha parado',true);
}
function revolutionDaily(){
  const w=W_(),r=w.rev;if(!r)return;r.total++;r.left--;
  if(isI('marxista','anarquista','socialdemocrata','ecologista')){S.pol.inf=Math.min(100,S.pol.inf+(r.leader?3:1));S.needs.social=100;}
  if(r.left>0)return;w.rev=null;
  const p=Math.min(.8,0.25+(w.mov-80)*0.02+(r.leader?S.pol.inf*0.004:0)+(w.gov==='austeridad'?0.08:0));
  if(Math.random()<p){const era=isI('anarquista')?'comunas':'consejos';w.era=era;w.gov=era;w.crisis=Math.max(20,w.crisis-35);
    S.rentMul=(S.rentMul||1)*(era==='comunas'?0.15:0.35);if(S.mort){S.mort.left=Math.round(S.mort.left*0.3);S.mort.pay=Math.round(S.mort.pay*0.3);}
    if(S.office){S.office.tox=Math.max(0.05,S.office.tox*0.35);S.payMul=(S.payMul||1)*1.12;}
    if(S.market){S.market.price=Math.max(1,S.market.price*0.95);}S.shortage=S.day+60;
    if(S.track==='negocio'){setTrack('coop');S.career=0;tell('Su tienda ha pasado a ser una cooperativa. Las cuentas ahora se aprueban en asamblea.','🤝');}
    S.pol.coopOK=true;
    chapter('rev2',era==='comunas'?'La comuna':'Todo el poder a los consejos',isI('marxista','anarquista')?`Ha pasado. El gobierno ha caído y las asambleas deciden. ${CH().name} no ha dormido en tres días y no ha sido tan feliz en toda su vida. Lo difícil empieza ahora: hay escasez, bloqueo exterior y mil asambleas por delante.`:isI('libertaria','liberal','conservadora')?`El gobierno ha caído y mandan las asambleas. ${CH().name} tiene miedo: ¿qué pasa ahora con lo que ha ahorrado? Por de pronto, el alquiler ha bajado y en las tiendas faltan cosas.`:`El gobierno ha caído y mandan las asambleas. El alquiler baja, en el trabajo ya no hay jefe… y en las tiendas faltan cosas.`);}
  else{w.era='represion';w.eraUntil=S.day+60;w.mov=Math.max(5,w.mov-50);w.gov='austeridad';
    chapter('rev3','La noche más larga',`El gobierno ha decretado el estado de excepción. Hay detenciones, multas y despidos de huelguistas. ${r.leader?`${CH().name} estaba en todas las listas.`:''}`);
    if(r.leader||(isI('marxista','anarquista')&&Math.random()<.4))arrestAna(3+(Math.random()*5|0),'en la huelga general');
    if(isI('marxista','anarquista')&&!TR().self&&Math.random()<.5&&!S.jobless){S.jobless=true;S.paroWeeks=0;tell('Despedida por participar en la huelga. Sin paro.'.replace('Despedida',ga('Despedida','Despedido','Despedide')),'📦');}}
}
function arrestAna(days,where){S.jail=days;S.record=true;const fine=Math.round(80*PM()*(1+Math.random()));S.money-=fine;S.sim.use=null;S.sim.path=[];S.sim.work=days*1440;S.sim.outingActive='calabozo';
  tell(`Detenida ${where}. ${days} día${days>1?'s':''} en comisaría y una multa de ${fmt(fine)}. Ahora tiene antecedentes: le costará más encontrar trabajo.`.replace('Detenida',ga('Detenida','Detenido','Detenide')),'🚔');toast(`🚔 ${CH().name} ha sido detenida ${where}`.replace('detenida',ga('detenida','detenido','detenide')),true);}
// inversiones (liberal: fondos; libertaria: cripto)
function investWeekly(){
  const p=S.pol;if(!p.invest)return;const inv=S.inv||(S.inv={v:0,in:0,peak:0});
  // aporta lo que le sobra
  const sp=spare();if(sp>300){const a=Math.round(sp*(p.invest==='cripto'?0.25:0.15));S.money-=a;inv.v+=a;inv.in+=a;}
  const r=p.invest==='cripto'?(Math.random()-.46)*0.22+(Math.random()<.03?(Math.random()<.5?-0.6:1.2):0):0.0012+(Math.random()-.5)*0.03-(dark()?0.004:0);
  const before=inv.v;inv.v=Math.max(0,Math.round(inv.v*(1+r)));
  if(Math.abs(inv.v-before)>Math.max(150,before*0.3))tell(p.invest==='cripto'?(inv.v>before?`Las cripto se han disparado: su cartera vale ${fmt(inv.v)}.`:`Desplome cripto: su cartera ha caído a ${fmt(inv.v)}.`):`Los mercados se mueven: su cartera está en ${fmt(inv.v)}.`,inv.v>before?'📈':'📉');
  // si va mal de verdad, vende
  if(S.money<0&&inv.v>0){const s=Math.min(inv.v,-S.money+200);inv.v-=s;S.money+=s;tell(`Ha tenido que vender ${fmt(s)} de su cartera para tapar agujeros.`,'💸');}
}
// negocio propio: lo que entra cada semana
function bizWeekly(){
  if(S.track!=='negocio'||S.jobless)return;const b=S.biz||(S.biz={weeks:0,loss:0});b.weeks++;
  const cost=Math.round((70+60*S.career)*PM());S.money-=cost;
  if((b.last||0)<cost){b.loss++;}else b.loss=0;
  if(b.loss>=5&&S.money<0){S.jobless=true;S.paroWeeks=0;chapter('quiebra','Persiana bajada',`${CH().name} ha cerrado el negocio. Cinco semanas seguidas perdiendo dinero. Le quedan las deudas y una lección cara.`);setTrack('oficina');S.career=0;}
  b.last=0;
}
// lo que se cobra en un turno, según el sector
function payFactor(){const T0=TR(),W=(S.weather||{}).k,dt=dateOf(S.day).wd;let f=govPay();
  if(T0.tips)f*=1+Math.random()*0.35;
  if(S.track==='reparto')f*=(0.6+Math.random()*0.7)*((W==='lluvia'||W==='tormenta')?1.4:1)*(dt>=4?1.2:1);
  if(S.track==='arte')f*=0.3+Math.random()*1.5*(1+0.05*lvl('carisma'));
  if(S.track==='negocio')f*=Math.max(-0.3,(0.25+Math.random()*1.2)*(1+0.05*(lvl('carisma')+lvl('logica')-6))*(1-W_().crisis/160)*(isI('libertaria')?1.15:1)*(S.bizBoost?1.1:1));
  if(S.track==='coop')f*=1-W_().crisis/250;
  if(W_().era==='consejos'||W_().era==='comunas')f*=S.track==='negocio'?0.6:1;
  return f;}
// accidentes y quemarse en el trabajo
function workHazards(){const T0=TR();if(T0.risk&&Math.random()<T0.risk*((S.weather||{}).k==='lluvia'?2:1)*(Dm().soul?1.4:0.7)){const d=2+(Math.random()*6|0);S.sick=d;S.needs.energia=Math.max(10,S.needs.energia-30);
  tell(S.track==='reparto'?`Se ha caído con la moto bajo la lluvia. ${d} días sin poder trabajar${T0.auto?' y sin cobrar: los autónomos no tienen bajas de verdad':''}.`:`Accidente en la obra: se ha hecho daño en la espalda. ${d} días de baja.`,'🩹');toast(`🩹 ${CH().name} ha tenido un accidente: ${d} días de baja`,true);}}
