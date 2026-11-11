// ---------- profesiones ----------
const L_OF=[{t:'Becaria',pay:32,req:{}},{t:'Ayudante',pay:66,req:{shifts:3}},{t:'Técnica',pay:78,req:{shifts:6,logica:2}},{t:'Especialista',pay:95,req:{shifts:10,logica:3,carisma:2}},{t:'Coordinadora',pay:115,req:{shifts:15,logica:5,carisma:4}},{t:'Directora',pay:170,req:{shifts:22,logica:7,carisma:6}}];
const TRACKS={
  oficina:{n:'Oficina',e:'🏢',sh:[9,17],days:[0,1,2,3,4],levels:L_OF,tox:[.35,.8],org:1,lay:1,cos:['Grupo Ofimax','Consultora Nébula','Logística Pardo','Soluciones Tándem','Mercantil Vega','Kappa Gestión'],d:'Horario fijo y ascensos por lógica y carisma. Ambiente variable.'},
  super:{n:'Supermercado',e:'🛒',sh:[8,16],days:[1,2,3,4,5],levels:[{t:'Cajera',pay:66,req:{}},{t:'Cajera fija',pay:70,req:{shifts:5}},{t:'Encargada de sección',pay:80,req:{shifts:12,carisma:3}},{t:'Jefa de tienda',pay:98,req:{shifts:20,carisma:5,logica:3}},{t:'Gerente de zona',pay:135,req:{shifts:30,logica:6,carisma:6}}],tox:[.4,.85],org:1.6,lay:.8,cos:['SuperPronto','Mercado Hogar','Cestabuena','Hiper Ribera'],d:'Se entra sin experiencia. Mucha plantilla: es más fácil organizarse. Martes a sábado.'},
  hosteleria:{n:'Hostelería',e:'🍽️',sh:[15,23],days:[2,3,4,5,6],levels:[{t:'Camarera',pay:65,req:{}},{t:'Camarera fija',pay:68,req:{shifts:6}},{t:'Cocinera',pay:75,req:{shifts:10,cocina:4}},{t:'Jefa de cocina',pay:98,req:{shifts:20,cocina:7,carisma:3}}],tox:[.5,.95],org:.7,lay:1.3,over:1.6,tips:true,cos:['Bar Manolo','Taberna El Puerto','Restaurante La Brasa','Café Central'],d:'Propinas, horas extra y fines de semana. De miércoles a domingo, de tarde.'},
  obra:{n:'Construcción',e:'🏗️',sh:[7,15],days:[0,1,2,3,4],levels:[{t:'Peona',pay:70,req:{}},{t:'Oficial de segunda',pay:78,req:{shifts:6,alba:3}},{t:'Oficial de primera',pay:88,req:{shifts:14,alba:5,carp:3}},{t:'Encargada de obra',pay:112,req:{shifts:24,alba:7,carisma:4}}],tox:[.4,.85],org:1.2,lay:1.3,risk:.025,cos:['Construcciones Pardo','Obras y Reformas Sur','Grupo Ladrillo'],d:'Madrugar, cansancio y riesgo de accidente. Albañilería y carpintería suben de nivel.'},
  cuidados:{n:'Cuidados y sanidad',e:'🩺',sh:[7,15],days:[0,1,2,3,4],levels:[{t:'Auxiliar de cuidados',pay:66,req:{}},{t:'Técnica en cuidados',pay:72,req:{shifts:8,carisma:3}},{t:'Enfermera',pay:98,req:{shifts:16,logica:5}},{t:'Supervisora',pay:118,req:{shifts:26,logica:7,carisma:5}}],tox:[.35,.8],org:1.3,lay:.6,burn:1.25,cos:['Residencia Los Olivos','Clínica San Rafael','Ayuda a Domicilio Sol'],d:'Trabajo que agota pero da sentido. Pocas veces echan a nadie.'},
  tech:{n:'Tecnología',e:'💻',sh:[10,18],days:[0,1,2,3,4],levels:[{t:'Programadora junior',pay:80,req:{logica:4}},{t:'Programadora',pay:105,req:{shifts:8,logica:6}},{t:'Programadora senior',pay:128,req:{shifts:18,logica:8}},{t:'Jefa de equipo',pay:160,req:{shifts:26,logica:9,carisma:5}}],tox:[.3,.75],org:.5,lay:1.1,offers:2,needs:'compu',cos:['Datanova','Nébula Labs','Pixelfactory','Kappa Digital'],d:'Buen sueldo y muchas ofertas, pero despidos masivos cuando hay crisis. Hace falta lógica 4 y ordenador.'},
  funcion:{n:'Función pública',e:'🏛️',sh:[8,15],days:[0,1,2,3,4],levels:[{t:'Auxiliar administrativa',pay:72,req:{}},{t:'Administrativa',pay:82,req:{shifts:20}},{t:'Técnica de la administración',pay:104,req:{shifts:40,logica:6}},{t:'Jefa de servicio',pay:130,req:{shifts:60,logica:8,carisma:5}}],tox:[.2,.55],org:1,lay:0,opos:true,cos:['Ayuntamiento','Delegación de Hacienda','Consejería de Empleo'],d:'Plaza fija: no te pueden despedir. Solo se entra aprobando oposiciones.'},
  reparto:{n:'Reparto (rider)',e:'🛵',sh:[17,23],days:[3,4,5,6,0,1],levels:[{t:'Rider',pay:60,req:{}},{t:'Rider veterana',pay:68,req:{shifts:25}}],tox:[.5,.9],org:.6,lay:0,gig:true,auto:true,risk:.03,cos:['Rápido Go','Comidas Ya','Pedalea'],d:'Falsa autónoma: cobra por pedido, paga su cuota, sin paro ni bajas. La lluvia paga más… y es más peligrosa.'},
  arte:{n:'Música en directo',e:'🎸',sh:[20,24],days:[3,4,5],levels:[{t:'Artista de bares',pay:40,req:{musica:4}},{t:'Artista con agenda',pay:80,req:{shifts:20,musica:6}},{t:'Artista de culto',pay:160,req:{shifts:45,musica:9,carisma:5}}],tox:[.2,.6],org:.4,lay:0,gig:true,auto:true,cos:['Sala El Sótano','La Cueva','Bar Tremendo'],d:'Ingresos imprevisibles. Hace falta música 4.'},
  negocio:{n:'Negocio propio',e:'🏪',sh:[9,19],days:[0,1,2,3,4,5],levels:[{t:'Autónoma con tienda',pay:75,req:{}},{t:'Empresaria',pay:140,req:{shifts:40,logica:5,carisma:5}},{t:'Empresaria de éxito',pay:260,req:{shifts:90,logica:7,carisma:7}}],tox:[.5,.5],org:0,lay:0,self:true,auto:true,cos:['tu tienda'],d:'Sin jefes y sin horario de salida. Hay que invertir capital; si van mal las cuentas, cierras.'},
  coop:{n:'Cooperativa',e:'🤝',sh:[9,16],days:[0,1,2,3,4],levels:[{t:'Socia trabajadora',pay:72,req:{}},{t:'Socia coordinadora',pay:85,req:{shifts:20,carisma:5}}],tox:[.1,.2],org:3,lay:0,coop:true,cos:['Cooperativa La Colmena','Cooperativa Arcadia'],d:'Se reparte lo que se gana y se decide en asamblea. Depende de cómo vaya la economía.'}};
const TRK_ORDER=['oficina','super','hosteleria','obra','cuidados','tech','funcion','reparto','arte','negocio','coop'];
const TR=()=>TRACKS[(S&&S.track)||'oficina'];
function daysLabel(){const d=[...TR().days].sort((a,b)=>a-b);const run=d.length>=3&&d.every((v,i)=>i===0||v===d[i-1]+1);return run?`${WDS[d[0]]}–${WDS[d[d.length-1]]}`:d.length>=5?'6 días':d.map(x=>WDS[x]).join(' ');}
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
  const score=k=>{const T0=TRACKS[k];let v=T0.levels[0].pay*(T0.gig?0.75:1)-(T0.tox[0]+T0.tox[1])*40+(pref.includes(k)?40:0)+(T0.lay===0&&Dm().soul?30:0);if(T0.self)v+=S.money>bizCapital()*2?40:-120;if(k==='reparto')v+=S.jobless&&S.money<0?60:-60;return v+Math.random()*20;};
  if(S.jobless){const best=ok.sort((a,b)=>score(b)-score(a))[0];S.seek=best;toast(`🔎 ${CH().name} busca trabajo de ${TRACKS[best].n.toLowerCase()}`);return;}
  // con trabajo: cambia si el suyo es claramente peor
  if(S.pol.coopOK&&S.track!=='coop'&&pref.includes('coop')&&Math.random()<.35){S.seek='coop';seekTick();return;}
  if(S.strike||S.career>=2||(S.union&&S.union.member&&office().org>30&&isI('marxista','anarquista','socialdemocrata')))return; // se queda a pelear o ya ha prosperado
  const cur=TRACKS[S.track],curV=salary()/Dm().pay-(TOX()*60)+(pref.includes(S.track)?40:0)+tShifts()*1.5;
  const best=ok.filter(k=>k!==S.track).sort((a,b)=>score(b)-score(a))[0];
  if(best&&!TRACKS[best].gig&&score(best)>curV*1.3+50&&Math.random()<0.12){S.seek=best;toast(`🔎 ${CH().name} empieza a buscar trabajo de ${TRACKS[best].n.toLowerCase()}`);}
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

