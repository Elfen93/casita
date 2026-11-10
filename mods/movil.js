// =================== EL MÓVIL: mensajes, llamadas, noticias, red social, banco ===================
const PH=()=>{if(!S.ph)S.ph={th:{},un:{},feed:[],next:0,bal:[],used:0,usedDay:0,posts:0};const p=S.ph;p.th=p.th||{};p.un=p.un||{};p.feed=p.feed||[];p.bal=p.bal||[];return p;};
const phNow=()=>S.day*1440+S.t;
const phHM=m=>{const t=((m%1440)+1440)%1440;return String(t/60|0).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');};
const kidW=()=>'hij'+oa();
function phPeople(){return (S.people||[]).filter(p=>p&&p.k&&p.stage!=='muerta');}
function phRole(p){if(p.k==='madre')return 'madre';if(isPartner(p)||p.stage==='rollo'||p.stage==='cita')return 'amor';if(p.k==='compi')return 'compi';if(p.k==='vecina')return 'vecina';if(p.k==='amiga'||p.stage==='amiga')return 'amiga';if(p.stage==='ex')return 'ex';return 'conocida';}
// --- plantillas: [texto, tipo de respuesta] ---
function phTemplates(p){const r=phRole(p),h=S.t/60,c=CH(),n=c.name,o=oa(),L=[];const add=(t,k='gen',w=1)=>L.push([t,k,w]);
  const jl=S.jobless,str=S.strike&&S.strike.on,crisis=W_().crisis>=60,rent=!S.owned;const lo=LIFE().orient;const nov=lo==='hombres'?'novio':lo==='mujeres'?'novia':'novie';
  if(r==='madre'){
    add('¿Has comido? Que te conozco.',[['🍽️ «Sí, mamá, ya he comido»',3,null,'Más te vale. ¿Y qué has comido? 🤨','Sí, mamá, ya he comido'],['😅 «Ahora iba»',1,null,'Pues ve, que luego te duele la cabeza.','Ahora iba a comer algo'],['🙄 «Tengo 27 años, mamá»',-2,null,'Y yo 58 y sigo siendo tu madre.','Que tengo 27 años, mamá']],2);
    add(`¿Vienes el domingo? Hago croquetas 🥘`,[['🥘 «Allí estaré»',7,null,'¡Pues no llegues tarde! 🥰','Allí estaré, guárdame muchas'],['😬 «No puedo, tengo lío»',-3,null,'Bueno… te guardo un táper 😔','Este domingo no puedo, tengo lío'],['❓ «¿Puedo llevar a alguien?»',4,null,'¡Claro! ¿Quién es? 👀','¿Puedo llevar a alguien?']],1.5);
    add('🎤 Audio de 4:37',[['🎧 Escucharlo entero',5,null,'¿Lo has oído? Es importante 😤','(escuchado entero)'],['⏩ A 2x',2,null,null,'(escuchado a 2x)'],['👍 Responder sin escuchar',-2,null,'¿Lo has escuchado? 🤨','👍']],1.2);
    add(`Me ha llamado tu tía. Pregunta que cuándo te echas ${nov} 🙄`,[['😂 «Dile que estoy en ello»',3,null,'Se lo digo. Ya sabes cómo es tu tía 🙄','Dile que estoy en ello 😂'],['🙃 «Dile que no es asunto suyo»',1,null,'Jajaja no se lo digo ni loca. Pero razón tienes.','Dile que no es asunto suyo'],['💘 «Pues mira… igual hay alguien»',2,'gossip','¿¿QUIÉN?? Cuéntame TODO 😱','Pues mira… igual hay alguien']],1);
    add('¿Has visto lo que ha subido la luz? Una vergüenza.',[['😤 «Y el alquiler, y todo»',3,null,'Así no hay quien viva, '+kidW()+'.','Y el alquiler, y la compra, y todo'],['💡 «Cámbiate de compañía, mamá»',2,null,'¿Y eso cómo se hace? Ven y me lo miras.','Cámbiate de compañía, mamá'],['🤷 «Es lo que hay»',-1,null,'Pues no debería serlo.','Es lo que hay…']],1);
    add(`Cuídate, ${kidW()}, que te veo muy delgad${o}.`,[['❤️ «Estoy bien, mamá. Te quiero»',5,null,'Y yo a ti. Come.','Estoy bien, mamá. Te quiero ❤️'],['😂 «Es que no tengo tus croquetas»',4,null,'Pues ven a por ellas 🥘','Es que no tengo tus croquetas'],['📞 Llamarla',6,'call',null,null]],1);
    add('[Imagen: un gatito con flores] Buenos días ☀️🌸',[['😊 «Buenos días, mamá»',3,null,'¡Que tengas buen día! 🌸','Buenos días, mamá ☀️'],['😂 «Otro gatito no»',1,null,'Pues a mí me gustan 😤','Otro gatito no, mamá 😂'],['👍',0,null,null,'👍']],h<11?2:.3);
    if(jl)add(`¿Has mirado lo del paro, ${kidW()}? Aquí siempre tienes un plato.`,[['🫶 «Gracias, mamá. Estoy en ello»',5,null,'Lo sé. Y si no, aquí estamos.','Gracias, mamá. Estoy en ello'],['😔 «Está todo fatal»',3,null,'Ya saldrá algo. Siempre sale.','Está todo fatal, mamá'],['📞 Llamarla',6,'call',null,null]],2);
    if(rent)add('¿Otra vez te ha subido el casero? Esos no tienen madre.',[['😤 «Y lo que te rondaré»',3,null,'Si hubiera un sindicato de inquilinos… ¿no hay?','Y lo que te rondaré'],['🏠 «Igual me vuelvo contigo»',2,null,'Tu cuarto sigue como lo dejaste 🥹','Igual acabo volviendo contigo'],['👍',0,null,null,'👍']],crisis?1.5:.5);}
  else if(r==='amor'){add('¿Qué haces? 🙈','amor',2);add('Pienso en ti, tont'+o+'.','amor',1.5);add('¿Cenamos juntos esta noche?','cena',h>=16&&h<21?2.5:.4);add('¿Te quedas a dormir hoy? 🌙','dormir',h>=19?1.5:.2);add('Hoy en el curro he tenido un día de mierda 😩','apoyo',1);add('[Foto: un perro con chubasquero] Es tu espíritu animal','risa',1);add('Buenos días, guap'+o+' ☀️','amor',h<11?2:.2);}
  else if(r==='compi'){add('El jefe hoy estaba insoportable. Otra vez con lo de las horas extra «voluntarias».','queja',2);add('¿Te has enterado? Dicen que van a recortar turnos.','queja',crisis?2:.8);add('Mañana hay asamblea en el descanso. ¿Vienes?','asamblea',S.office&&S.office.org>25?1.5:.6);add('😂😂 [Meme: «yo cuando el jefe dice que somos una familia»]','risa',1.2);
    if(str)add('Piquete a las 6 en la puerta. Trae termo. ✊','asamblea',3);}
  else if(r==='vecina'){add('Se ha vuelto a romper el ascensor. Ya van tres veces este mes.',[['😤 «Hay que reclamar al administrador»',3,null,'Yo ya he llamado dos veces. Ni caso.','Hay que reclamar al administrador'],['😅 «Pues a subir andando»',1,null,'Con mis rodillas… 😩','Pues a subir andando'],['👍',0,null,null,'👍']],1.5);add('Reunión de la comunidad el jueves. Lleva paciencia.','gen',1);add('¿Te ha llegado a ti también la carta del administrador? Quieren cobrarnos la fachada.','gen',rent?.6:1.2);add('Te he dejado un táper de lentejas en la puerta 🥘','regalo',.8);}
  else if(r==='amiga'){add('¿Cañas el viernes? 🍻','canas',2);add('😂😂😂 [Meme de un gato con chaleco de sindicato]','risa',1.5);add('Me han subido el alquiler OTRA VEZ. 80 pavos. Me quiero morir.','apoyo',rent||crisis?1.6:.7);add('Te echo de menos, ¿cuándo nos vemos?','canas',1.2);add('¿Has visto lo de las noticias? Flipo.','gen',1);if(jl)add('¿Cómo llevas lo del curro? Si necesitas algo, dímelo, eh.','carino',2);}
  else if(r==='ex'){add('Hola… ¿qué tal estás?','ex',1);add('He visto una peli que te habría gustado. Ya está, solo eso.','ex',.6);}
  else{add('¡Hola! ¿Qué tal todo?','gen',1);add('¿Te apetece quedar algún día? ☕','canas',1);add('[Enlace: «10 trucos para llegar a fin de mes» ¡el 7 te sorprenderá!]','risa',.6);}
  return L;}
const PH_REP={
  gen:[['🙂 Contestar con cariño',3,null,'¡Ja, ja! Sí, un desastre 🙃','Jajaja, ¡qué me dices! 😄'],['👍 Un «ok»',0,null,'👍','ok'],['🙈 Dejar en visto',-2,null,null,null]],
  carino:[['❤️ Responder con cariño',5,null,'Que sí, tranqui. Te quiero 😘','Sí, mamá, tranquila. Te quiero ❤️'],['🙄 «Que sí, pesad{o}»',-1,null,'Vale, vale…'],['📞 Llamar',6,'call',null,null]],
  domingo:[['🥘 «Allí estaré»',7,null,'¡Pues no llegues tarde! 🥰'],['😬 «No puedo, tengo lío»',-3,null,'Bueno… otro domingo 😔']],
  audio:[['🎧 Escucharlo entero',5,null,'¿Lo has oído? Es importante 😤','Escuchado entero, eh 😅'],['⏩ A 2x',2,null,null,'Escuchado (a 2x) 😇'],['👍 Responder sin escuchar',-2,null,'¿Lo has escuchado? 🤨','👍']],
  amor:[['😍 Ponerse tiern{o}',5,'love','🥰🥰','Y yo en ti, todo el rato 🥰'],['😏 Responder con picardía',4,'love','😳 Calla','¿Ah, sí? ¿Y qué piensas exactamente? 😏'],['📞 Llamar',4,'call',null]],
  cena:[['🏠 «Ven a casa»',5,'home','¡Voy! Llevo vino 🍷'],['🍝 «Vamos a cenar fuera»',6,'out','Reservo en el italiano 🍝'],['😮‍💨 «Hoy no puedo»',-3,null,'Vale… mañana entonces 😔']],
  dormir:[['🌙 «Vente»',6,'stay','Voy para allá 😘'],['😴 «Hoy necesito dormir sol{o}»',-1,null,'Lo entiendo, descansa 💤']],
  apoyo:[['🫂 Dar ánimos',6,null,'Gracias… de verdad 🫶','Ánimo, de verdad. Aquí me tienes 🫂'],['📞 Llamar para desahogarse',7,'call',null,null],['🤷 «Así es la vida»',-3,null,'Ya…']],
  risa:[['😂 Reírse',3,null,'JAJAJA te lo dije','JAJAJAJA me muero 😂'],['🔁 Mandar otro meme',4,null,'😂 Para ya que estoy en el bus','[Meme de un jefe diciendo «somos una familia»]'],['😐 No hacer caso',-1,null,null,null]],
  queja:[['✊ «Hay que organizarse»',4,'org','Tienes razón. Lo hablo con el resto.'],['😮‍💨 «Pues aguantar…»',1,null,'Ya, qué remedio.'],['🤐 Cambiar de tema',-1,null,'Ok…','Oye, ¿y tú qué tal el finde?']],
  asamblea:[['✊ «Allí estaré»',5,'org','¡Así me gusta! 💪'],['😬 «No me la juego»',-2,null,'Bueno, tú verás…']],
  canas:[['🍻 «¡Vamos ahora!»',6,'out','¡Bajo en 10 minutos!'],['📅 «Mejor otro día»',1,null,'¡Te tomo la palabra!'],['🏠 «Vente a casa»',5,'home','¡Voy!']],
  regalo:[['🥰 «¡Muchas gracias!»',6,null,'¡De nada, cariño!','¡Muchas gracias, de verdad!'],['🍪 Devolverle el táper con galletas',8,null,'¡Ay, qué apañad{o}!','Le dejé el táper con galletas 🍪']],
  ex:[['🙂 Contestar cordial',2,null,'Me alegro de que estés bien.','Bien, tirando. Me alegro de saber de ti.'],['🚫 No contestar',0,null,null,null],['💬 «¿Quedamos para hablar?»',4,'out','Vale… mejor en persona.']],
};
function phRepOpts(k){const g=s=>s&&s.replace(/\{o\}/g,oa());return (Array.isArray(k)?k:(PH_REP[k]||PH_REP.gen)).map(([t,rel,act,back,say])=>{const q=t.match(/«([^»]+)»/);return [g(t),rel,act,g(back),say===undefined?(q?g(q[1]):null):g(say)];});}
function phPush(pk,m){const P=PH();const th=P.th[pk]||(P.th[pk]=[]);th.push(m);if(th.length>40)th.splice(0,th.length-40);}
function phIncoming(p,txt,k){phPush(p.k,{f:'t',t:txt,k,m:phNow(),open:!!(Array.isArray(k)||PH_REP[k])});const P=PH();P.un[p.k]=(P.un[p.k]||0)+1;phBadge();
  if(!phOpenNow())toast(`💬 ${p.n}: ${txt.replace(/<[^>]+>/g,'').slice(0,46)}${txt.length>46?'…':''}`);else phRender();}
function phPick(L){let t=0;for(const x of L)t+=x[2];let r=Math.random()*t;for(const x of L){r-=x[2];if(r<=0)return x;}return L[0];}
function phTick(){if(!S||!S.people)return;const P=PH(),now=phNow(),h=S.t/60;
  if(!P.next){P.next=now+60+Math.random()*120;return;}
  if(now<P.next)return;
  const night=h<7.5||h>=23.5;P.next=now+(night?240:50+Math.random()*170);if(night)return;
  const ppl=phPeople().filter(p=>p.stage!=='ex'||Math.random()<.15);if(!ppl.length)return;
  // más mensajes de quien más te quiere
  const w=p=>(phRole(p)==='amor'?4:phRole(p)==='madre'?2.6:phRole(p)==='amiga'?2.2:phRole(p)==='compi'?(S.jobless?.4:1.6):phRole(p)==='vecina'?.8:.5)*(0.4+(p.rel||30)/100);
  let tot=ppl.reduce((a,p)=>a+w(p),0),r=Math.random()*tot,pp=ppl[0];for(const p of ppl){r-=w(p);if(r<=0){pp=p;break;}}
  const th=P.th[pp.k]||[];const lastOpen=th.length&&th[th.length-1].f==='t'&&th[th.length-1].open;if(lastOpen&&Math.random()<.85)return;
  const recent=th.slice(-8).map(m=>m.t);const cand=phTemplates(pp).filter(x=>!recent.includes(x[0]));if(!cand.length)return;const [txt,k]=phPick(cand);phIncoming(pp,txt,k);}
function phAnswer(pk,i,oi){const P=PH(),th=P.th[pk],m=th&&th[i];const p=(S.people||[]).find(q=>q.k===pk);if(!m||!m.open||!p)return;m.open=false;
  const [t,rel,act,back,say]=phRepOpts(m.k)[oi];if(say)phPush(pk,{f:'me',t:say,m:phNow()});else if(act!=='call')phPush(pk,{f:'sys',t:rel<0?'(visto)':'',m:phNow()});
  p.rel=Math.max(0,Math.min(100,(p.rel||30)+rel));p.last=S.day;if(rel>0)S.needs.social=Math.min(100,S.needs.social+3+rel);if(act==='love'&&p.love!=null)p.love=Math.min(100,p.love+3);
  if(back)setTimeout(()=>{if(!S)return;phPush(pk,{f:'t',t:back,m:phNow()});if(phOpenNow())phRender();else{PH().un[pk]=(PH().un[pk]||0)+1;phBadge();}},1400+Math.random()*2200);
  if(act==='call'){phCall(p);return;}
  if(act==='home'){phClose();inviteHome(p,false);return;}
  if(act==='stay'){phClose();inviteHome(p,true);return;}
  if(act==='out'){const why=outAvail('amigos');if(why&&why!=='solo en días libres'){toast('Ahora no puede salir: '+why);return;}phClose();S.outWith=p.k;S.dateOut=['cita','rollo','pareja','convive','casada'].includes(p.stage);doOut('amigos');return;}
  if(act==='org'&&S.office){S.office.org=Math.min(100,(S.office.org||0)+2);}
  if(act==='gossip'){const pt=partner()||(S.people||[]).find(q=>['cita','rollo'].includes(q.stage));setTimeout(()=>{phPush(pk,{f:'me',t:pt?`Se llama ${pt.n}…`:'Nada serio todavía. Ya te contaré.',m:phNow()});phIncoming(p,pt?`¿${pt.n}? ¿Y cuándo l${pt.g==='m'||pt.g==='o'?'o':'a'} traes a comer? 🥘`:'Ya me contarás, ya. Que yo me entero de todo.','gen');},3500);}
  phRender();}
// --- llamadas ---
function phCall(p){phApp='call';phCallP=p.k;phCallT=performance.now();phRender();
  setTimeout(()=>{if(phApp!=='call'||phCallP!==p.k)return;try{callP(p);}catch(e){console.error(e);}
    const topics=['de la familia','del curro y de lo mal que paga','del alquiler','de política (un poco a gritos)','de nada en concreto, que es lo mejor','de planes para el finde','de una serie que están viendo los dos'];
    phCallRes=`Hablaron ${10+(Math.random()*35|0)} minutos ${pickR(topics)}.`;phRender();},2200);}
// --- noticias ---
function phNews(){const w=W_(),G=(typeof GOVS!=='undefined'&&GOVS[w.gov])||null,c=w.crisis,out=[];const R=(s)=>{let x=0;for(const ch of s)x=(x*31+ch.charCodeAt(0))>>>0;return x;};const d=S.day;
  const pick=(arr,salt)=>arr[(R(salt+d)%arr.length)];
  if(G)out.push(['🏛️',`${G.n}: ${pick(['«La economía va como un cohete», dice el ministro','El Gobierno presume de cifras macro; en los barrios no se nota','Nueva rueda de prensa sin preguntas','Se aprueba el decreto ómnibus de madrugada'],'g')}`,G.fx]);
  out.push(c>=65?['📉','Las empresas anuncian EREs «por la incertidumbre» mientras reparten dividendos récord','El paro sube por tercer mes. Los beneficios del IBEX, también.']:c>=40?['📊','La inflación se come la subida salarial: la cesta de la compra, un 9 % más cara','Los supermercados niegan especular. Sus márgenes dicen otra cosa.']:['📈','El empleo crece, pero la mitad de los contratos duran menos de un mes','«Récord de afiliados», titula la prensa. Récord de temporalidad, dicen los sindicatos.']);
  out.push(['🏠',pick(['El alquiler medio en el barrio supera ya el 45 % del sueldo','Un fondo de inversión compra el bloque de la calle Mayor entera','Desahucio parado en la calle del Río gracias a la vecindad','Los pisos turísticos se comen el centro: 1 de cada 4 portales'],'h'),'']);
  if(w.mov>=50)out.push(['✊',pick(['La marea de la sanidad llena la plaza un domingo más','Las kellys convocan huelga en cinco hoteles','Las riders ganan en los tribunales: eran falsas autónomas'],'m'),'El movimiento social crece en el barrio.']);
  if(S.strike&&S.strike.on)out.push(['🪧',`Huelga en ${office().n}: la plantilla aguanta`,'La empresa habla de «minoría radical». Son el 80 %.']);
  if(w.elec!=null&&w.elec<20)out.push(['🗳️',`Quedan ${w.elec} días para las elecciones generales`,'Campaña a base de banderas y promesas de bajar impuestos a quien ya no los paga.']);
  out.push(['⚽',pick(['El club del barrio sube de categoría con un presupuesto de 3.000 euros','Polémica arbitral: todo el mundo tiene razón','Un futbolista firma por 200 millones; la enfermera de su hija cobra 1.400'],'f'),'']);
  out.push(['🌦️',`El tiempo: ${S.weather?WX[S.weather.k].e+' '+S.weather.t+' °C':'variable'}. ${pick(['Lleva chaqueta, por si acaso.','Ni frío ni calor: tiempo de terraza (si llega el sueldo).','Ola de calor en los pisos sin aislar; los ricos, en la sierra.'],'w')}`,'']);
  return out;}
// --- red social ---
function phFeedDaily(){const P=PH();const ppl=phPeople();if(!ppl.length)return;const n=1+(Math.random()*3|0);
  const T=p=>{const r=phRole(p);const L={madre:['🌸 Buenos días a todos menos a los que suben la luz','🥘 Croquetas para un regimiento. ¿Quién viene?','📿 Que Dios reparta suerte (y mejores sueldos)'],amor:['☕ Café y lluvia. No pido más','🌆 Atardecer desde el bus. Gratis, como lo mejor','🎶 Esta canción me recuerda a alguien'],compi:['😴 Turno de 10 horas. «Somos una familia», dicen','✊ Hoy en el descanso hemos hablado de cosas. Cosas importantes','🍕 Viernes de pizza con la plantilla'],vecina:['🌿 Mis geranios están mejor que la sanidad pública','🔧 Tercera avería del ascensor. Vamos por el récord','🎂 Hoy cumple mi nieto. ¡Felicidades, campeón!'],amiga:['🍻 Martes de cañas porque la vida es corta y el sueldo más','🐈 Mi gato tiene más vacaciones que yo','📦 Nueva mudanza. Cuarta en dos años. Viva el mercado'],ex:['🌙 Nuevos comienzos','📚 Leyendo mucho últimamente'],conocida:['🏃 10 km. Ahora mismo no siento las piernas','🍳 Receta de la abuela: hoy sí ha salido','🎸 Concierto en El Sótano, ¡qué nivel!']}[r];return pickR(L);};
  for(let i=0;i<n;i++){const p=pickR(ppl);P.feed.unshift({pk:p.k,txt:T(p),d:S.day,likes:(Math.random()*12|0),liked:false});}
  if(P.feed.length>30)P.feed.length=30;
  P.bal.push([S.day,Math.round(S.money)]);if(P.bal.length>15)P.bal.splice(0,P.bal.length-15);}
function phPost(){const P=PH();if(P.lastPost===S.day){toast('Ya ha publicado hoy. No hay que dar la chapa');return;}P.lastPost=S.day;
  const td=S.today||{},opts=[td.out?'🍻 '+String(td.out).replace(/<[^>]+>/g,'').slice(0,70):'☕ Día tranquilo. Que dure.',S.jobless?'📭 Buscando curro. Se aceptan contactos (y ánimos)':'💼 Otro día más en el tajo. Lo que hay que hacer por un sueldo…',S.ideo!=='apolitica'?'✊ Si no nos organizamos, nos organizan':'🌅 Hoy toca disfrutar de lo pequeño'];
  const txt=pickR(opts);const fr=phPeople().length;const likes=Math.max(0,Math.round(fr*(.3+Math.random()*.6)+(lvl('carisma')||0)));
  P.feed.unshift({pk:'me',txt,d:S.day,likes,liked:false});if(P.feed.length>30)P.feed.length=30;
  S.needs.social=Math.min(100,S.needs.social+Math.min(14,likes*1.5));S.needs.diversion=Math.min(100,S.needs.diversion+4);
  const pt=partner();if(pt&&Math.random()<.25){setTimeout(()=>phIncoming(pt,'¿Y esa foto? ¿Con quién estabas? 🤨','gen'),2500);}
  else{const p=pickR(phPeople());if(p)setTimeout(()=>phIncoming(p,pickR(['Me ha encantado tu publicación 😂','Jajaja muy tú','Así se habla 👏']),'risa'),2000);}
  toast(`📸 Publicado · ${likes} me gusta`);phRender();}
// --- interfaz ---
let phFocus=false,phApp=null,phThread=null,phCallP=null,phCallT=0,phCallRes=null,phEl=null;
const phOpenNow=()=>!!(phEl&&phEl.classList.contains('on'));
function phBadge(){const b=document.getElementById('phbadge');if(!b||!S)return;const n=Object.values(PH().un).reduce((a,b)=>a+b,0);b.textContent=n>9?'9+':n;b.style.display=n?'flex':'none';}
function phOpen(app){if(!phEl){phEl=document.createElement('div');phEl.id='phone';document.body.appendChild(phEl);phEl.addEventListener('pointerdown',e=>{if(e.target===phEl)phClose();});}
  phApp=app||null;phThread=null;phEl.classList.add('on');S.sim.phoneUntil=phNow()+15;phRender();}
function phClose(){if(phEl)phEl.classList.remove('on');phApp=null;phThread=null;phCallRes=null;}
const APPS=[['msg','💬','Mensajes','#2fb36a'],['call','📞','Llamar','#3a86ff'],['news','📰','Noticias','#e2513c'],['red','📸','Fotogram','#c13584'],['bank','🏦','Banco','#2c3a5c'],['citas','💘','Citas','#f15bb5'],['cal','📅','Agenda','#ff8a5b'],['curro','💼','Empleo','#6b6e3c']];
function phRender(){if(!phEl||!S)return;const P=PH();const n=CH().name;const now=phNow();S.sim.phoneUntil=Math.max(S.sim.phoneUntil||0,now+10);
  const bat=Math.max(5,100-((S.t/1440)*60|0));let h=`<div class="phf"><div class="phs"><span>${phHM(S.t)}</span><span class="phcam"></span><span>📶 ${bat}%</span></div><div class="phb">`;
  const back=`<button class="phback" data-ph="home">‹</button>`;
  const avatar=p=>p&&p.ch&&p.ch.look&&LOOK_SRC[p.ch.look]?`<img class="phav" src="${LOOK_SRC[p.ch.look]}">`:`<span class="phav phave">${p?(p.e||'🙂'):'🙂'}</span>`;
  if(!phApp){h+=`<div class="phwall"><div class="phclock">${phHM(S.t)}</div><div class="phdate">${WDL[dateOf(S.day).wd]} ${dateOf(S.day).dm} de ${MONTHS[dateOf(S.day).m].toLowerCase()}</div></div><div class="phgrid">`+APPS.map(([k,e,t,c])=>{const un=k==='msg'?Object.values(P.un).reduce((a,b)=>a+b,0):0;return `<button class="phapp" data-ph="${k}"><span style="background:${c}">${e}${un?`<i>${un}</i>`:''}</span><small>${t}</small></button>`;}).join('')+`</div>`;}
  else if(phApp==='msg'&&!phThread){h+=`<div class="phtop">${back}<b>Mensajes</b></div><div class="phlist">`;
    const ppl=phPeople().map(p=>{const th=P.th[p.k]||[];return {p,last:th[th.length-1]};}).sort((a,b)=>(b.last?b.last.m:-1)-(a.last?a.last.m:-1));
    for(const {p,last} of ppl)h+=`<button class="phrow" data-th="${p.k}">${avatar(p)}<span class="phrt"><b>${p.n}</b><small>${last?(last.f==='me'?'Tú: ':'')+last.t.replace(/<[^>]+>/g,'').slice(0,38):'Sin mensajes'}</small></span>${P.un[p.k]?`<i class="phun">${P.un[p.k]}</i>`:last?`<small class="phtm">${phHM(last.m)}</small>`:''}</button>`;
    h+=`</div>`;}
  else if(phApp==='msg'&&phThread){const p=(S.people||[]).find(q=>q.k===phThread);P.un[phThread]=0;phBadge();const th=P.th[phThread]||[];
    h+=`<div class="phtop"><button class="phback" data-ph="msg">‹</button>${avatar(p)}<b>${p?p.n:''}</b><button class="phic" data-callp="${phThread}">📞</button></div><div class="phchat" id="phchat">`;
    let lastD=null;th.forEach((m,i)=>{const d=Math.floor(m.m/1440);if(d!==lastD){lastD=d;h+=`<div class="phday">${d===S.day?'Hoy':d===S.day-1?'Ayer':'Día '+d}</div>`;}
      if(m.f==='sys'){if(m.t)h+=`<div class="phday">✓✓ ${m.t}</div>`;}else h+=`<div class="phm ${m.f==='me'?'me':''}">${m.t}<small>${phHM(m.m)}</small></div>`;
      if(m.open&&i===th.length-1)h+=`<div class="phreps">${phRepOpts(m.k).map((o,oi)=>`<button data-rep="${i}:${oi}">${o[0]}</button>`).join('')}</div>`;});
    if(!th.length)h+=`<div class="phempty">Aún no os habéis escrito.</div>`;
    h+=`</div><div class="phcomp">${['👋 ¿Qué tal?','🍻 ¿Quedamos?','❤️ Te echo de menos'].map((t,i)=>`<button data-say="${i}">${t}</button>`).join('')}</div><form class="phwrite" id="phwrite"><input id="phin" maxlength="140" placeholder="Escribe un mensaje…" autocomplete="off"><button type="submit">➤</button></form>`;}
  else if(phApp==='call'){const p=phCallP&&(S.people||[]).find(q=>q.k===phCallP);
    if(p){h+=`<div class="phcallsc">${avatar(p)}<b>${p.n}</b><small>${phCallRes||'Llamando…'}</small><button class="phhang" data-ph="callend">${phCallRes?'Colgar':'📵'}</button></div>`;}
    else{h+=`<div class="phtop">${back}<b>Contactos</b></div><div class="phlist">`+phPeople().map(p=>`<button class="phrow" data-callp="${p.k}">${avatar(p)}<span class="phrt"><b>${p.n}</b><small>${p.r||''}</small></span><span class="phtm">📞</span></button>`).join('')+`</div>`;}}
  else if(phApp==='news'){h+=`<div class="phtop">${back}<b>Noticias del día</b></div><div class="phlist">`+phNews().map(([e,t,s])=>`<div class="phnews"><span>${e}</span><div><b>${t}</b>${s?`<small>${s}</small>`:''}</div></div>`).join('')+`</div>`;}
  else if(phApp==='red'){h+=`<div class="phtop">${back}<b>Fotogram</b><button class="phic" data-ph="post">➕</button></div><div class="phlist">`;
    if(!P.feed.length)h+=`<div class="phempty">Todavía no hay publicaciones. Vuelve mañana.</div>`;
    P.feed.forEach((f,i)=>{const p=f.pk==='me'?null:(S.people||[]).find(q=>q.k===f.pk);const nm=f.pk==='me'?n:(p?p.n:'Alguien');const e=(f.txt.match(/^\S+/)||['📷'])[0];
      h+=`<div class="phpost"><div class="phph">${f.pk==='me'?avatar({ch:CH()}):avatar(p)}<b>${nm}</b><small>${f.d===S.day?'hoy':'hace '+(S.day-f.d)+' d'}</small></div><div class="phpic">${e}</div><div class="phcap">${f.txt.replace(/^\S+\s*/,'')}</div><button class="phlike${f.liked?' on':''}" data-like="${i}">${f.liked?'❤️':'🤍'} ${f.likes+(f.liked?1:0)}</button></div>`;});
    h+=`</div>`;}
  else if(phApp==='bank'){const sal=S.jobless?0:salary();const rent=housingWeekly();const rows=(P.bal||[]).slice(-7);
    h+=`<div class="phtop">${back}<b>Banco del Barrio</b></div><div class="phlist"><div class="phbal"><small>Saldo</small><b class="${S.money<0?'neg':''}">${fmt(Math.round(S.money))}</b><small>${S.money<0?'Descubierto: el banco cobra comisiones por no tener dinero. Así funciona.':'Disponible'}</small></div>`;
    h+=`<div class="phkv"><span>💼 Ingreso semanal</span><b>${sal?fmt(sal):'—'}</b></div><div class="phkv"><span>${S.owned?'🏦 Hipoteca':'🏠 Alquiler'} semanal</span><b>${rent?fmt(rent):'—'}</b></div><div class="phkv"><span>🛟 Colchón recomendado</span><b>${fmt(reserveMoney())}</b></div>`;
    if(rows.length>1){h+=`<div class="phday">Últimos días</div>`;for(let i=rows.length-1;i>0;i--){const d=rows[i][1]-rows[i-1][1];h+=`<div class="phkv"><span>Día ${rows[i][0]}</span><b class="${d<0?'neg':'pos'}">${d>=0?'+':''}${fmt(d)}</b></div>`;}}
    h+=`</div>`;}
  h+=`</div><div class="phhome" data-ph="home"></div></div>`;
  phEl.innerHTML=h;const chat=phEl.querySelector('#phchat');if(chat)chat.scrollTop=chat.scrollHeight;
  phEl.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>{const k=b.dataset.ph;
    if(k==='home'){if(phApp==='call'&&phCallP){phCallP=null;phCallRes=null;}phApp=null;phThread=null;phRender();return;}
    if(k==='callend'){phCallP=null;phCallRes=null;phApp='call';phRender();return;}
    if(k==='post'){phPost();return;}
    if(k==='citas'){phClose();try{datingApp(false);}catch(e){console.error(e);}return;}
    if(k==='cal'){phClose();try{openCalendar();}catch(e){console.error(e);}return;}
    if(k==='curro'){phClose();openMenu('trabajo');return;}
    phApp=k;phThread=null;phCallP=null;phCallRes=null;phRender();});
  phEl.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{phThread=b.dataset.th;phRender();});
  phEl.querySelectorAll('[data-callp]').forEach(b=>b.onclick=()=>{const p=(S.people||[]).find(q=>q.k===b.dataset.callp);if(p)phCall(p);});
  phEl.querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{const [i,oi]=b.dataset.rep.split(':').map(Number);phAnswer(phThread,i,oi);});
  phEl.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>{const p=(S.people||[]).find(q=>q.k===phThread);if(!p)return;const i=+b.dataset.say;const t=['¿Qué tal?','¿Quedamos?','Te echo de menos'][i];
    const P2=PH();if(P2.lastSay&&P2.lastSay[p.k]===phNow()>>4){return;}P2.lastSay=P2.lastSay||{};P2.lastSay[p.k]=phNow()>>4;
    phPush(p.k,{f:'me',t,m:phNow()});p.last=S.day;S.needs.social=Math.min(100,S.needs.social+4);
    setTimeout(()=>{const k=i===1?'canas':i===2?(phRole(p)==='amor'?'amor':'carino'):'gen';const ans=i===1?(p.rel>40?'¡Venga! ¿Cuándo?':'Uf, ando liad'+pO(p)+'…'):i===2?(p.rel>50?'Y yo a ti 🫶':'Ah… vale 😅'):pickR(['Bien, aquí, sobreviviendo. ¿Y tú?','Liad'+pO(p)+' con el curro. ¿Tú qué tal?','¡Bien! Hacía mucho 🙂']);
      if(i===2){p.rel=Math.min(100,p.rel+(p.rel>50?3:-1));if(p.love!=null&&['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+2);}else p.rel=Math.min(100,p.rel+2);
      phIncoming(p,ans,i===1&&p.rel>40?'canas':'gen');},1500+Math.random()*2000);phRender();});
  {const f=phEl.querySelector('#phwrite');if(f){const inp=f.querySelector('#phin');f.onsubmit=e=>{e.preventDefault();const t=inp.value.trim();if(!t)return;const p=(S.people||[]).find(q=>q.k===phThread);if(!p)return;phFree(p,t);};if(phFocus){inp.focus();phFocus=false;}}}
  phEl.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const f=PH().feed[+b.dataset.like];if(!f||f.liked)return;f.liked=true;const p=(S.people||[]).find(q=>q.k===f.pk);if(p)p.rel=Math.min(100,p.rel+1);phRender();});
}
// botón 📱 en la barra lateral
{const side=document.getElementById('side');if(side&&!document.getElementById('phbtn')){const b=document.createElement('div');b.className='pill glass';b.id='phbtn';b.title='Móvil';b.innerHTML='📱<span class="badge" id="phbadge" style="display:none">0</span>';const mb=document.getElementById('menubtn');(mb?mb.after(b):side.prepend(b));b.onclick=()=>phOpenNow()?phClose():phOpen();}}
// cada minuto de juego: mensajes nuevos; cada día: red social y saldo
{const _up2=update;update=function(gm){const d0=S.day;const r=_up2.apply(this,arguments);try{phTick();if(S.day!==d0)phFeedDaily();if(phOpenNow()&&phApp==='call'&&phCallP&&!phCallRes){}
  if(S.sim.phoneUntil&&phNow()<S.sim.phoneUntil&&!S.sim.work&&!S.sim.use){S.needs.diversion=Math.min(100,S.needs.diversion+.05*gm);S.needs.social=Math.min(100,S.needs.social+.03*gm);}}catch(e){console.error(e);}return r;};}
// Ana mira el móvil cuando no tiene nada que hacer (y saca el móvil si lo estás usando tú)
{const _ao=anaOpts;anaOpts=function(){const o=_ao.apply(this,arguments);const s=S.sim;if(!o.act&&s.phoneUntil&&phNow()<s.phoneUntil&&!s.use&&!(s.path&&s.path.length))o.act='phone';return o;};}
{const _au2=autonomy;autonomy=function(){const s=S.sim,nd=S.needs,now=phNow();
  if(s.phoneUntil&&now<s.phoneUntil&&!phOpenNow()){if(['hambre','vejiga','energia','higiene'].some(k=>nd[k]<35))s.phoneUntil=0;else return;}
  if(!phOpenNow()&&Math.random()<.07&&S.t/60>=8&&S.t/60<23.5&&!['hambre','vejiga','energia','higiene'].some(k=>nd[k]<50)&&(nd.diversion<92||nd.social<92)){
    const P=PH();if(P.usedDay!==S.day){P.usedDay=S.day;P.used=0;}if(P.used<150){const m=10+Math.random()*20;P.used+=m;s.phoneUntil=now+m;
      if(P.used>=150&&throttled('enganche',3e5))tell(`${CH().name} ha pasado más de dos horas hoy mirando el móvil. Scroll, scroll, scroll.`,'📱');return;}}
  return _au2.apply(this,arguments);};}
// también la gente que vive en casa mira el móvil a ratos
{const _dr2=drawResident;drawResident=function(r){if(r.away)return;if(r.doing||(r.path&&r.path.length)||r.kind==='kid')return _dr2(r);const near=Math.hypot(r.x-S.sim.x,r.y-S.sim.y)<1.6&&!(S.sim.work>0);
  const slot=Math.floor(performance.now()/26000+(r.pid||'').length*1.7)%3;if(near||slot!==0)return _dr2(r);
  const p=r.pid&&S.people.find(q=>q.k===r.pid);if(!p)return _dr2(r);const ch=p.ch||personCh(p);const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);const sv=anaRT.phase;anaRT.phase=0;
  ctx.save();drawAna(bx,by,{ch,shirt:ch.shirt,mood:70,front:r.front!==false,right:!!r.right,pose:'stand',act:'phone'});ctx.restore();anaRT.phase=sv;if(cam.z>0.7)label((r.kind==='partner'?'❤️ ':'')+p.n,bx,by-66,'rgba(255,253,248,.9)','#3b3247',8);};}
// abrir el móvil también desde la app de citas antigua y con la tecla M
addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){phOpenNow()?phClose():phOpen();}});
setInterval(()=>{try{phBadge();if(phOpenNow()&&phApp!=='msg')phEl.querySelector('.phs span').textContent=phHM(S.t);}catch(e){}},1000);

// --- cuando escribes tú: entiende lo básico y contesta como quien es ---
function phFree(p,t){const P=PH();const th=P.th[p.k]||[];const last=th[th.length-1];if(last&&last.open)last.open=false;
  phPush(p.k,{f:'me',t,m:phNow()});phFocus=true;phRender();
  const r=phRole(p),n=CH().name,o=oa(),k=t.toLowerCase();const has=(...w)=>w.some(x=>k.includes(x));
  let rel=1,love=0,act=null,ans;
  const warm=has('te quiero','te echo de menos','❤','😘','gracias','guap','cariño','mamá','mami','abrazo');const rude=has('pesad','déjame','dejame','paso','cállate','callate','mierda','joder','no me rayes','tonto','tonta');
  const plan=has('quedamos','cañas','cenar','cena','comer','vemos','tomar algo','salir','cine','domingo','vienes','vente','ven a casa','casa');const q=k.includes('?')||has('qué','que tal','cómo','como estás','como estas','dónde','donde');
  const money=has('dinero','pasta','alquiler','paro','euros','€','pagar','cobr','sueldo');const work=has('curro','trabajo','jefe','turno','horas');const sleep=has('dormir','quedarte','quedas a dormir','noche');
  const study=has('estudi','clase','examen','matricul','carrera','fp','universidad','curso');const sick=has('enfermo','enferma','malo','mala','fiebre','médico','medico');const decl=has('me gustas','sal conmigo','salir conmigo','novio','novia','pareja');const bye=has('adiós','adios','hasta luego','chao','me voy','buenas noches');
  const sorry=has('perdón','perdon','lo siento','perdona');const thanks=has('gracias');
  if(sorry){rel=3;if(r==='amor')love=2;ans=r==='madre'?pickR(['Ay, '+kidW()+'. Si no pasa nada.','Bueno, bueno. Ven el domingo y en paz.']):r==='amor'?pickR(['Vale… pero no me lo vuelvas a hacer.','Perdonad'+oa()+'. Ven aquí 🫂','Gracias por decirlo.']):pickR(['Tranqui, no pasa nada.','Agua pasada 👍','Jaja no te rayes.']);}
  else if(thanks&&!plan){rel=2;ans=r==='madre'?'Para eso estoy, '+kidW()+'. Come.':r==='amor'?'A ti, siempre 🥰':pickR(['¡De nada!','Para eso estamos.','🫶']);}
  else if(study){rel=2;const C=(S.edu&&S.edu.cur);ans=r==='madre'?pickR(['¡Qué orgullosa! Tu padre no llegó a eso.','Estudia, '+kidW()+', que es lo único que no te pueden quitar.','¿Y te da tiempo con el trabajo? No te mates.']):r==='amor'?pickR(['¡Qué bien! Te ayudo a repasar si quieres 😏','Estoy orgullos'+(p.g==='m'||p.g==='o'?'o':'a')+' de ti.','Luego lo celebramos 🍻']):r==='compi'?pickR(['Haces bien. Yo me arrepiento de no haberlo hecho.','¿Y luego nos dejas aquí tirados? Jaja','Bien, tío. Ya cuentas lo que vale.']):pickR(['¡Grande! ¿Qué estudias?','Qué envidia, yo lo dejé.','Aprovecha, que luego no hay tiempo.']);}
  else if(sick){rel=3;ans=r==='madre'?pickR(['¿Tienes fiebre? Voy para allá con caldo.','Abrígate y no vayas a trabajar.','Te lo dije. Come bien.']):r==='amor'?pickR(['¿Quieres que vaya? 🥺','Descansa, te llevo algo luego.','Cuídate, porfa.']):pickR(['Vaya… mejórate.','Si necesitas algo, dímelo.','Aprovecha la baja 😉']);}
  else if(decl&&r!=='amor'&&r!=='madre'){const ok=canLove(p)&&(p.rel||0)>=45;rel=ok?3:-3;ans=ok?pickR(['Vaya… no me lo esperaba 😳','Jaja ¿en serio? Hablamos en persona, anda.','Tú también a mí, un poco. Pero vamos despacio.']):pickR(['Ay… te veo como amig'+oa()+'. Lo siento.','Creo que no, '+n+'. Pero no cambies, ¿eh?','Uf. No. Pero gracias por decirlo.']);if(ok){p.chispa=(p.chispa||0)+1;p.chispaDay=S.day;}}
  else if(bye){rel=1;ans=r==='madre'?'Cuídate, '+kidW()+'. Y come.':r==='amor'?pickR(['Buenas noches, amor 😘','Sueña conmigo 🌙','Hasta mañana ❤️']):pickR(['¡Hasta luego!','Nos vemos 👋','Chao']);}
  else if(rude){rel=-4;ans=r==='madre'?pickR(['Oye, que soy tu madre. Un respeto.','Muy bien, '+kidW()+'. Ya hablaremos.','…']):r==='amor'?pickR(['Vale. 👍','No sé qué te pasa hoy, pero no me hables así.','Ok.']):pickR(['Vale, tío. 👋','Pues nada. Ya si eso.','Ok…']);}
  else if(sleep&&r==='amor'){love=3;rel=4;act='stay';ans=pickR(['¡Voy! 😘 Llevo el cepillo de dientes','Cojo el metro ya 🌙','Pensaba que no lo ibas a pedir nunca 🙈']);}
  else if(plan){rel=4;if(r==='amor')love=3;act=has('ven a casa','vente','casa')?'home':'out';ans=r==='madre'?pickR(['¡Ay, qué alegría! Hago croquetas 🥘','¿Vienes de verdad? Preparo la mesa.','¡Sí! Pero avisa, que compro pan.']):r==='amor'?pickR(['¡Sí! ¿A qué hora? 😍','Me pongo guap'+(p.g==='m'||p.g==='o'?'o':'a')+' 💃','Reservo yo 🍝']):r==='compi'?pickR(['Vale, pero no hablamos del curro. Ok, un poco sí.','¡Venga! Después del turno.','Me apunto si invitas la primera 🍻']):pickR(['¡Vamos! 🍻','Dime hora y bajo.','¡Hacía falta! 🙌']);}
  else if(warm){rel=5;if(r==='amor')love=4;ans=r==='madre'?pickR(['Y yo a ti, '+kidW()+' mío. Come bien.','Ay, que me haces llorar 🥹','Eres lo mejor que he hecho en la vida. Y las croquetas.']):r==='amor'?pickR(['🥰🥰🥰','Yo más, tont'+o,'Ven aquí y me lo dices a la cara 😏']):r==='amiga'?pickR(['Ayyy 🫶','¡Te quiero, '+n+'!','Para ya que me emociono en el bus']):pickR(['¡Qué majo! 🫶','Gracias, de verdad.','🥹']);}
  else if(money){rel=2;ans=r==='madre'?pickR(['Si necesitas algo me lo dices, ¿eh? Tengo un dinerillo guardado.','Ay, '+kidW()+', esto está imposible.','No te agobies. Entre todos salimos.']):r==='compi'?pickR(['Con lo que nos pagan, normal.','Pide un adelanto, que a mí me lo dieron.','Ya ves. Y el jefe con coche nuevo.']):r==='amor'?pickR(['Lo que haga falta, lo vemos juntos.','No te preocupes por eso ahora.','¿Te hace falta algo? En serio.']):pickR(['Ya ves cómo está todo.','Qué me vas a contar…','Un sindicato de inquilinos, te lo digo yo.']);}
  else if(work){rel=2;ans=r==='compi'?pickR(['Ni me hables. Hoy el jefe ha superado su propio récord.','Mañana lo hablamos en el descanso. Con más gente.','Esto hay que organizarlo, '+n+'.']):r==='madre'?pickR(['Tú no te dejes pisar, que te conozco.','Descansa, que trabajas demasiado.','¿Y te pagan las horas esas? 🤨']):pickR(['Qué pereza, tío.','Aguanta, que es viernes pronto.','Déjalo y monta algo, yo te ayudo 😂']);}
  else if(q){rel=2;ans=r==='madre'?pickR(['Bien, '+kidW()+'. Aquí, con la tele y tu padre, que sigue igual. ¿Y tú?','Bien. ¿Has comido?','Pues aquí, haciendo croquetas. Adivina para quién.']):r==='amor'?pickR(['Pensando en ti 🙈 ¿Y tú?','En el curro, aburrid'+(p.g==='m'||p.g==='o'?'o':'a')+'. Cuéntame algo.','Bien, ahora que me escribes 😊']):r==='compi'?pickR(['Sobreviviendo al turno. ¿Tú?','Aquí, fichando. Luego te cuento.','Bien. El jefe no. Jaja']):pickR(['¡Bien! ¿Y tú?','Aquí, tirando. ¿Qué tal tú?','Todo bien por aquí 🙂']);}
  else{rel=1;ans=r==='madre'?pickR(['Vale, '+kidW()+'. Cuídate.','Ya. ¿Y has comido?','Bueno, bueno. Luego te llamo.','Jajaja qué cosas tienes.']):r==='amor'?pickR(['Jaja 😘','Ven y me lo cuentas mejor 😏','🥰','Qué tont'+o+' eres. Me encanta.']):pickR(['Jajaja','Ya ves.','Total.','👍','Jaja qué dices']);}
  p.rel=Math.max(0,Math.min(100,(p.rel||30)+rel));if(love&&p.love!=null)p.love=Math.min(100,p.love+love);p.last=S.day;if(rel>0)S.needs.social=Math.min(100,S.needs.social+3+rel);
  setTimeout(()=>{if(!S)return;phPush(p.k,{f:'t',t:ans,m:phNow()});if(phOpenNow())phRender();else{PH().un[p.k]=(PH().un[p.k]||0)+1;phBadge();}
    if(act==='stay'||act==='home'){setTimeout(()=>{if(!S.sim.work&&!(S.res||[]).some(x=>x.pid===p.k)){inviteHome(p,act==='stay');}},2500);}
    else if(act==='out'){const why=outAvail('amigos');if(!why||why==='solo en días libres'){setTimeout(()=>{if(S.sim.work>0)return;S.outWith=p.k;S.dateOut=['cita','rollo','pareja','convive','casada'].includes(p.stage);phClose();doOut('amigos');},2500);}else setTimeout(()=>phIncoming(p,pickR(['Bueno, cuando puedas. Avísame.','Ok, otro día entonces 🙂']),'gen'),3000);}
  },1200+Math.random()*1800);}
// ---- Oury contesta solo si no lo haces tú: respuesta coherente con su carácter y la relación ----
function phAutoAnswer(){if(!S||S.phAuto===false)return;const P=PH();const now=phNow();const h=S.t/60;if(h<8||h>=23.5)return;const u=S.sim.use;if(u&&['cama','camamat','ducha','banera'].includes(u.type))return;
  for(const pk in P.th){const th=P.th[pk];const m=th[th.length-1];if(!m||m.f!=='t'||!m.open)continue;if(phOpenNow()&&phThread===pk)continue;// la estás leyendo tú
    const wait=T('ansiosa')?25:T('solitaria')?150:T('sociable')?40:80;if(now-m.m<wait)continue;
    const p=(S.people||[]).find(q=>q.k===pk);if(!p)continue;const opts=phRepOpts(m.k);if(!opts.length)continue;
    // elige: cariñosa si la relación es buena o es la pareja/madre; seca si va mal o es «genio/cínica»; nunca llamar ni montar planes solo
    const role=phRole(p);let pick=0;const warm=(p.rel||30)>=45||role==='amor'||role==='madre';const cold=T('genio')||T('cinica')||(p.rel||30)<25;
    const cands=opts.map((o,i)=>[o,i]).filter(([o])=>!['call','out','home','stay','gossip'].includes(o[2]));if(!cands.length)continue;
    const good=cands.filter(([o])=>o[1]>=3),mid=cands.filter(([o])=>o[1]>=0&&o[1]<3),bad=cands.filter(([o])=>o[1]<0);
    const pool=cold&&bad.length&&Math.random()<.5?bad:warm&&good.length?good:mid.length?mid:cands;pick=pickR(pool)[1];
    phAnswer(pk,th.length-1,pick);P.un[pk]=0;if(throttled('phauto',9e4))toast(`📱 ${CH().name} contesta a ${p.n}`);phBadge();return;}}
{const _up8=update;update=function(gm){const r=_up8.apply(this,arguments);try{if(S.t%7<gm)phAutoAnswer();}catch(e){console.error(e);}return r;};}
// ajuste: contestar yo siempre / que conteste Oury
{const _om3=openMenu;openMenu=function(...a){const r=_om3.apply(this,a);try{const sb=card.querySelector('#r3dbtn');if(sb&&!card.querySelector('#phautob')){const b=document.createElement('button');b.className=sb.className;b.id='phautob';b.textContent=S.phAuto===false?'📱 Mensajes: los contesto yo':'📱 Mensajes: contesta sol'+oa()+' si tardo';b.onclick=()=>{S.phAuto=S.phAuto===false?true:false;save();openMenu('ajustes');};sb.after(b);}}catch(e){}return r;};}
